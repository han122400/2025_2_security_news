-- ============================================
-- 커뮤니티 채팅 테이블 생성 및 user_profiles 연동
-- ============================================

-- 1. chat_messages 테이블 생성 (이미 존재하면 주석 처리)
-- CREATE TABLE IF NOT EXISTS public.chat_messages (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     user_name TEXT NOT NULL,
--     user_email TEXT NOT NULL,
--     content TEXT NOT NULL CHECK (char_length(content) <= 500),
--     reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
--     reply_to_user_name TEXT,
--     reply_to_content TEXT,
--     news_id TEXT,
--     news_title TEXT,
--     news_category TEXT,
--     news_link TEXT,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- 2. 인덱스 생성 (성능 최적화) (이미 존재하면 주석 처리)
-- CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- 3. RLS(Row Level Security) 활성화 (이미 활성화되어 있으면 주석 처리)
-- ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 설정
-- 모든 로그인 사용자가 메시지를 조회할 수 있음
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
CREATE POLICY "Anyone can view messages"
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- 로그인 사용자는 메시지를 작성할 수 있음
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can insert messages"
    ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 메시지만 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages"
    ON public.chat_messages
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Realtime 활성화 (이미 활성화되어 있으면 주석 처리)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============================================
-- 6. 채팅 메시지를 user_profiles.comments에 자동 저장하는 트리거
-- ============================================

-- 채팅 메시지가 추가될 때 user_profiles.comments에도 저장
CREATE OR REPLACE FUNCTION public.sync_chat_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- user_profiles의 comments 배열에 새 메시지 추가
    UPDATE public.user_profiles
    SET 
        comments = COALESCE(comments, '[]'::jsonb) || jsonb_build_object(
            'id', NEW.id,
            'content', NEW.content,
            'created_at', NEW.created_at
        ),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (INSERT 시 실행)
DROP TRIGGER IF EXISTS on_chat_message_created ON public.chat_messages;
CREATE TRIGGER on_chat_message_created
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_chat_to_profile();

-- ============================================
-- 7. 채팅 메시지 삭제 시 user_profiles.comments에서도 제거
-- ============================================

CREATE OR REPLACE FUNCTION public.remove_chat_from_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- user_profiles의 comments 배열에서 해당 메시지 제거
    UPDATE public.user_profiles
    SET 
        comments = (
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements(COALESCE(comments, '[]'::jsonb)) AS elem
            WHERE (elem->>'id')::uuid != OLD.id
        ),
        updated_at = NOW()
    WHERE id = OLD.user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (DELETE 시 실행)
DROP TRIGGER IF EXISTS on_chat_message_deleted ON public.chat_messages;
CREATE TRIGGER on_chat_message_deleted
    AFTER DELETE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.remove_chat_from_profile();

-- ============================================
-- 8. 뉴스 북마크 기능 (user_profiles에 저장)
-- ============================================

-- user_profiles에 bookmarks 컬럼 추가 (이미 있으면 주석 처리)
-- ALTER TABLE public.user_profiles 
-- ADD COLUMN IF NOT EXISTS bookmarks JSONB DEFAULT '[]'::jsonb;

-- 북마크 형식 예시:
-- [
--   {
--     "id": "uuid",
--     "news_id": 123,
--     "news_title": "뉴스 제목",
--     "news_category": "사이버보안",
--     "news_link": "https://...",
--     "created_at": "2025-12-02T10:00:00Z"
--   }
-- ]

-- ============================================
-- 실행 후 Supabase Dashboard에서 확인하세요
-- ============================================

-- ============================================
-- 9. 답장 알림 이메일 기능 (Supabase 이메일 사용)
-- ============================================

-- Supabase의 pg_net extension을 사용하여 이메일 트리거 생성
-- Edge Function을 호출하여 이메일 전송

CREATE OR REPLACE FUNCTION public.notify_reply_via_email()
RETURNS TRIGGER AS $$
DECLARE
    original_user_email TEXT;
    original_user_name TEXT;
    original_user_id UUID;
    email_enabled BOOLEAN;
BEGIN
    -- 답장이 있는 경우에만 처리
    IF NEW.reply_to IS NOT NULL THEN
        -- 원본 메시지 작성자의 정보 가져오기
        SELECT cm.user_id, cm.user_email, cm.user_name
        INTO original_user_id, original_user_email, original_user_name
        FROM public.chat_messages cm
        WHERE cm.id = NEW.reply_to;
        
        -- 자기 자신에게 답장한 경우는 이메일 보내지 않음
        IF original_user_id != NEW.user_id THEN
            -- 사용자의 이메일 알림 설정 확인
            SELECT COALESCE(email_notification, true)
            INTO email_enabled
            FROM public.user_profiles
            WHERE id = original_user_id;
            
            -- 알림이 활성화되어 있는 경우에만 레코드 삽입
            IF email_enabled THEN
                INSERT INTO public.email_log (
                    recipient_user_id,
                    recipient_email,
                    sender_name,
                    message_content,
                    original_message_content,
                    chat_message_id,
                    status,
                    created_at
                ) VALUES (
                    original_user_id,
                    original_user_email,
                    NEW.user_name,
                    NEW.content,
                    NEW.reply_to_content,
                    NEW.id,
                    'pending',
                    NOW()
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이메일 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message_content TEXT NOT NULL,
    original_message_content TEXT,
    chat_message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON public.email_log(created_at DESC);

-- RLS 활성화
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 이메일 로그만 조회 가능
DROP POLICY IF EXISTS "Users can view own email log" ON public.email_log;
CREATE POLICY "Users can view own email log"
    ON public.email_log
    FOR SELECT
    TO authenticated
    USING (auth.uid() = recipient_user_id);

-- 트리거 생성 (답장 메시지 INSERT 시 실행)
DROP TRIGGER IF EXISTS on_reply_message_created ON public.chat_messages;
CREATE TRIGGER on_reply_message_created
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    WHEN (NEW.reply_to IS NOT NULL)
    EXECUTE FUNCTION public.notify_reply_via_email();

-- ============================================
-- Supabase Edge Function으로 이메일 전송
-- ============================================
-- 
-- 1. Supabase Dashboard > Edge Functions에서 함수 생성
-- 2. 또는 Supabase CLI로 배포:
--    supabase functions new send-reply-email
--    supabase functions deploy send-reply-email
-- 
-- 3. Database Webhook 설정:
--    - Table: email_log
--    - Events: INSERT
--    - HTTP Request: POST to Edge Function URL
-- 
-- 또는 백엔드에서 polling하여 pending 상태인 이메일 처리
-- ============================================
