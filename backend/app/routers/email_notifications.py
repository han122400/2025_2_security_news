"""
이메일 알림 API
답장 알림 등의 이메일을 전송하는 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/api/email", tags=["email"])


class ReplyNotificationEmail(BaseModel):
    to_email: EmailStr
    to_name: str
    from_name: str
    message: str
    reply_to_content: Optional[str] = None


@router.post("/send-reply-notification")
async def send_reply_notification(
    notification: ReplyNotificationEmail,
    authorization: Optional[str] = Header(None)
):
    """
    답장 알림 이메일 전송
    
    환경변수 설정 필요:
    - SMTP_HOST: SMTP 서버 주소 (예: smtp.gmail.com)
    - SMTP_PORT: SMTP 포트 (예: 587)
    - SMTP_USER: SMTP 사용자 이메일
    - SMTP_PASSWORD: SMTP 비밀번호
    """
    
    # 환경변수에서 SMTP 설정 가져오기
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_user or not smtp_password:
        # SMTP 설정이 없으면 로그만 남기고 성공 반환 (개발 환경)
        print(f"[EMAIL NOTIFICATION] Would send to {notification.to_email}")
        print(f"From: {notification.from_name}")
        print(f"Message: {notification.message}")
        return {
            "success": True,
            "message": "Email notification logged (SMTP not configured)"
        }
    
    try:
        # 이메일 메시지 생성
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[보안뉴스] {notification.from_name}님이 회원님의 메시지에 답장했습니다"
        msg["From"] = smtp_user
        msg["To"] = notification.to_email
        
        # HTML 이메일 본문
        html = f"""
        <html>
          <head>
            <style>
              body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
              .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
              .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
              .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
              .message-box {{ background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }}
              .reply-box {{ background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; border-radius: 5px; }}
              .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
              .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 새로운 답장이 도착했습니다</h1>
              </div>
              <div class="content">
                <p>안녕하세요, {notification.to_name}님!</p>
                <p><strong>{notification.from_name}</strong>님이 회원님의 메시지에 답장을 남겼습니다.</p>
                
                {f'''
                <div class="message-box">
                  <p><strong>회원님의 메시지:</strong></p>
                  <p>{notification.reply_to_content}</p>
                </div>
                ''' if notification.reply_to_content else ''}
                
                <div class="reply-box">
                  <p><strong>{notification.from_name}님의 답장:</strong></p>
                  <p>{notification.message}</p>
                </div>
                
                <p>커뮤니티에서 대화를 계속하시려면 아래 버튼을 클릭하세요.</p>
                <a href="http://localhost:3000/community" class="button">커뮤니티로 이동</a>
                
                <div class="footer">
                  <p>이 이메일은 보안뉴스 커뮤니티에서 발송되었습니다.</p>
                  <p>더 이상 알림을 받고 싶지 않으시다면 프로필 설정에서 변경하실 수 있습니다.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
        """
        
        # 텍스트 버전 (HTML을 지원하지 않는 이메일 클라이언트용)
        text = f"""
        안녕하세요, {notification.to_name}님!
        
        {notification.from_name}님이 회원님의 메시지에 답장을 남겼습니다.
        
        {f'회원님의 메시지: {notification.reply_to_content}' if notification.reply_to_content else ''}
        
        {notification.from_name}님의 답장: {notification.message}
        
        커뮤니티에서 대화를 계속하시려면 http://localhost:3000/community 를 방문하세요.
        
        ---
        이 이메일은 보안뉴스 커뮤니티에서 발송되었습니다.
        """
        
        # 메시지에 텍스트와 HTML 추가
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        msg.attach(part1)
        msg.attach(part2)
        
        # SMTP 서버 연결 및 이메일 전송
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return {
            "success": True,
            "message": f"Email sent to {notification.to_email}"
        }
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        # 이메일 전송 실패해도 에러 반환하지 않음 (알림은 선택사항)
        return {
            "success": False,
            "message": f"Failed to send email: {str(e)}"
        }


@router.post("/process-pending")
async def process_pending_emails():
    """
    email_log 테이블에서 pending 상태인 이메일을 조회하여 전송
    """
    from supabase import create_client
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    supabase = create_client(supabase_url, supabase_key)
    
    try:
        # pending 상태인 이메일 조회
        response = supabase.table("email_log").select("*").eq("status", "pending").execute()
        pending_emails = response.data
        
        sent_count = 0
        failed_count = 0
        
        for email_record in pending_emails:
            try:
                # 이메일 전송
                notification = ReplyNotificationEmail(
                    to_email=email_record["recipient_email"],
                    to_name=email_record["recipient_email"].split("@")[0],
                    from_name=email_record["sender_name"],
                    message=email_record["message_content"],
                    reply_to_content=email_record.get("original_message_content")
                )
                
                result = await send_reply_notification(notification)
                
                if result.get("success"):
                    # 상태를 sent로 업데이트
                    supabase.table("email_log").update({
                        "status": "sent",
                        "sent_at": "now()"
                    }).eq("id", email_record["id"]).execute()
                    sent_count += 1
                else:
                    # 실패 시 failed로 업데이트
                    supabase.table("email_log").update({
                        "status": "failed"
                    }).eq("id", email_record["id"]).execute()
                    failed_count += 1
                    
            except Exception as e:
                print(f"Error processing email {email_record['id']}: {str(e)}")
                supabase.table("email_log").update({
                    "status": "failed"
                }).eq("id", email_record["id"]).execute()
                failed_count += 1
        
        return {
            "success": True,
            "processed": len(pending_emails),
            "sent": sent_count,
            "failed": failed_count
        }
        
    except Exception as e:
        print(f"Error processing pending emails: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_email_config():
    """SMTP 설정 테스트"""
    smtp_user = os.getenv("SMTP_USER")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    
    return {
        "configured": bool(smtp_user),
        "smtp_host": smtp_host,
        "smtp_user": smtp_user if smtp_user else "Not configured"
    }
