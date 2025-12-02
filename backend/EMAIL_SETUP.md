# 이메일 알림 설정 가이드 (Supabase 방식)

## Supabase Email 사용 (권장)

Supabase의 내장 이메일 기능을 사용하는 방법입니다.

### 1. 데이터베이스 설정

`chat_setup.sql` 파일을 Supabase SQL Editor에서 실행하면 자동으로 설정됩니다:

- `reply_notifications` 테이블 생성
- 답장 시 자동으로 알림 레코드 삽입하는 트리거

### 2. Supabase Dashboard 설정

#### 방법 A: Database Webhooks (간단)

1. Supabase Dashboard → Database → Webhooks
2. "Create a new hook" 클릭
3. 설정:
   - Name: `send-reply-email`
   - Table: `reply_notifications`
   - Events: `INSERT`
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: `http://localhost:8000/api/email/send-reply-notification` (또는 배포된 백엔드 URL)
   - HTTP Headers:
     ```json
     {
       "Content-Type": "application/json"
     }
     ```

#### 방법 B: Supabase Edge Functions (고급)

1. Supabase CLI 설치:

```bash
npm install -g supabase
```

2. Edge Function 생성:

```bash
cd backend
supabase functions new send-reply-email
```

3. `supabase/functions/send-reply-email/index.ts` 작성:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { record } = await req.json()

    // 이메일 전송 로직
    const emailData = {
      to: record.recipient_email,
      subject: `[보안뉴스] ${record.sender_name}님이 회원님의 메시지에 답장했습니다`,
      html: `
        <h2>새로운 답장이 도착했습니다</h2>
        <p><strong>${record.sender_name}</strong>님이 답장을 남겼습니다.</p>
        <blockquote>${record.message_content}</blockquote>
      `,
    }

    // Supabase 내장 이메일 또는 외부 서비스 사용
    // await sendEmail(emailData)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

4. Edge Function 배포:

```bash
supabase functions deploy send-reply-email
```

5. Database Webhook에서 Edge Function URL 사용:
   - URL: `https://[your-project].supabase.co/functions/v1/send-reply-email`
   - Authorization: `Bearer [your-anon-key]`

### 3. 백엔드 API 방식 (현재 구현)

이미 구현된 방식입니다. Database Webhook에서 다음 URL을 사용:

- Development: `http://localhost:8000/api/email/send-reply-notification`
- Production: `https://your-domain.com/api/email/send-reply-notification`

SMTP 설정은 `backend/.env`에:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. 테스트

1. 커뮤니티에서 메시지 작성
2. 다른 사용자 계정으로 답장 작성
3. `reply_notifications` 테이블 확인:

```sql
SELECT * FROM reply_notifications ORDER BY created_at DESC;
```

4. Webhook 로그 확인 (Supabase Dashboard → Database → Webhooks)

## 권장 방식

### 개발 환경

- **방법 A (Database Webhooks)** + 백엔드 API
- SMTP 설정 없이도 작동 (콘솔 로그만 출력)

### 프로덕션 환경

- **방법 B (Edge Functions)** + SendGrid/AWS SES
- 또는 **방법 A** + 백엔드 API + 전문 이메일 서비스

## 이메일 서비스 옵션

1. **Supabase 내장 (무료 제한)**

   - 가입 시 이메일 인증에 사용
   - 커스텀 이메일은 제한적

2. **SendGrid (권장)**

   - 무료: 100통/일
   - 간단한 API

3. **AWS SES**

   - 저렴한 비용
   - 높은 신뢰도

4. **Mailgun**
   - 무료: 5,000통/월
   - 개발자 친화적

## 알림 테이블 구조

```sql
reply_notifications
├── id (UUID)
├── recipient_user_id (UUID) - 알림 받을 사용자
├── recipient_email (TEXT) - 이메일 주소
├── sender_name (TEXT) - 답장 작성자 이름
├── message_content (TEXT) - 답장 내용
├── original_message_content (TEXT) - 원본 메시지
├── chat_message_id (UUID) - 채팅 메시지 ID
├── status (TEXT) - pending, sent, failed
├── sent_at (TIMESTAMPTZ) - 전송 시각
└── created_at (TIMESTAMPTZ) - 생성 시각
```

이 구조를 사용하면:

- 이메일 전송 실패 시 재시도 가능
- 전송 이력 추적 가능
- 사용자별 알림 설정 관리 가능
