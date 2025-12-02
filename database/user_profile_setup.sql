-- ============================================
-- 사용자 프로필 테이블 생성 및 트리거 설정
-- ============================================

-- 1. user_profiles 테이블 생성 (댓글 포함)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    
    -- 카테고리 설정 (JSON 형식으로 통합)
    category_settings JSONB DEFAULT '{
        "사이버보안": true,
        "해킹/침해사고": true,
        "개인정보보호": true,
        "IT/보안 트렌드": true,
        "악성코드/피싱": true,
        "보안제품/서비스": true,
        "인증·암호화": true,
        "네트워크보안": true,
        "정책·제도": true,
        "데이터보안": true
    }'::jsonb,
    
    -- 이메일 알림 설정
    email_notification BOOLEAN DEFAULT true,
    
    -- 작성한 댓글 (JSON 배열)
    comments JSONB DEFAULT '[]'::jsonb,
    
    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS(Row Level Security) 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 설정
-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 4. 회원가입 시 자동으로 user_profiles 생성하는 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        email,
        name,
        category_settings,
        email_notification,
        comments
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        '{
            "사이버보안": true,
            "해킹/침해사고": true,
            "개인정보보호": true,
            "IT/보안 트렌드": true,
            "악성코드/피싱": true,
            "보안제품/서비스": true,
            "인증·암호화": true,
            "네트워크보안": true,
            "정책·제도": true,
            "데이터보안": true
        }'::jsonb,
        true,  -- 이메일 알림 기본 활성화
        '[]'::jsonb  -- 빈 댓글 배열
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. auth.users 테이블에 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. user_profiles의 updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- 9. 댓글 추가 헬퍼 함수 (선택사항)
CREATE OR REPLACE FUNCTION public.add_comment(
    p_user_id UUID,
    p_news_id TEXT,
    p_news_title TEXT,
    p_content TEXT
)
RETURNS JSONB AS $$
DECLARE
    new_comment JSONB;
BEGIN
    -- 새 댓글 객체 생성
    new_comment := jsonb_build_object(
        'id', gen_random_uuid(),
        'news_id', p_news_id,
        'news_title', p_news_title,
        'content', p_content,
        'created_at', NOW()
    );
    
    -- 댓글 배열에 추가
    UPDATE public.user_profiles
    SET 
        comments = comments || new_comment,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN new_comment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 댓글 삭제 헬퍼 함수 (선택사항)
CREATE OR REPLACE FUNCTION public.delete_comment(
    p_user_id UUID,
    p_comment_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        comments = (
            SELECT jsonb_agg(elem)
            FROM jsonb_array_elements(comments) elem
            WHERE (elem->>'id')::uuid != p_comment_id
        ),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 완료! 이제 회원가입 시 자동으로:
-- 1. user_profiles 테이블에 사용자 정보 저장
-- 2. 카테고리 설정 JSON으로 통합 (모두 활성화)
-- 3. 이메일 알림 활성화 상태로 시작
-- 4. 댓글은 같은 테이블에 JSON 배열로 저장
-- ============================================

-- 사용 예시:
-- 카테고리 설정 조회: SELECT category_settings FROM user_profiles WHERE id = 'user_uuid';
-- 카테고리 업데이트: UPDATE user_profiles SET category_settings = jsonb_set(category_settings, '{"사이버보안"}', 'false') WHERE id = 'user_uuid';
-- 댓글 추가: SELECT add_comment('user_uuid', 'news_123', '뉴스 제목', '댓글 내용');
-- 댓글 조회: SELECT comments FROM user_profiles WHERE id = 'user_uuid';
-- 댓글 삭제: SELECT delete_comment('user_uuid', 'comment_uuid');

