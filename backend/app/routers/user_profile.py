from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/user", tags=["user_profile"])

# Supabase 클라이언트 초기화
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")  # RLS 우회를 위한 서비스 역할 키

supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
        print("✅ User Profile API: Supabase client initialized with SERVICE_ROLE")
    except Exception as e:
        print(f"❌ User Profile API: Failed to initialize Supabase: {str(e)}")
else:
    print(f"⚠️ SUPABASE_URL: {SUPABASE_URL is not None}, SUPABASE_SERVICE_ROLE: {SUPABASE_SERVICE_ROLE is not None}")

class CategorySettings(BaseModel):
    category_settings: Dict[str, bool]

class EmailNotification(BaseModel):
    email_notification: bool

@router.get("/profile")
async def get_user_profile(authorization: Optional[str] = Header(None)):
    """
    사용자 프로필 정보를 가져옵니다.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # 토큰으로 사용자 정보 가져오기
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user.user.id
        user_email = user.user.email
        user_name = user.user.user_metadata.get('name', user_email)
        
        print(f"프로필 조회 시도: user_id={user_id}, email={user_email}")
        
        # user_profiles에서 프로필 정보 가져오기
        try:
            response = supabase.table("user_profiles")\
                .select("*")\
                .eq("id", user_id)\
                .execute()
            
            # 프로필이 없으면 자동 생성
            if not response.data or len(response.data) == 0:
                print(f"프로필이 없음. 새로 생성: {user_id}")
                
                # 기본 프로필 생성
                default_profile = {
                    "id": user_id,
                    "email": user_email,
                    "name": user_name,
                    "category_settings": {
                        "사이버보안": True,
                        "해킹/침해사고": True,
                        "개인정보보호": True,
                        "IT/보안 트렌드": True,
                        "악성코드/피싱": True,
                        "보안제품/서비스": True,
                        "인증·암호화": True,
                        "네트워크보안": True,
                        "정책·제도": True,
                        "데이터보안": True
                    },
                    "email_notification": True,
                    "comments": []
                }
                
                create_response = supabase.table("user_profiles")\
                    .insert(default_profile)\
                    .execute()
                
                print(f"프로필 생성 완료: {create_response.data}")
                return create_response.data[0]
            
            print(f"프로필 조회 성공: {response.data[0]}")
            return response.data[0]
            
        except Exception as e:
            print(f"프로필 조회/생성 중 오류: {str(e)}")
            raise
        
    except Exception as e:
        print(f"Error fetching user profile: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile/categories")
async def update_category_settings(
    settings: CategorySettings,
    authorization: Optional[str] = Header(None)
):
    """
    카테고리 설정을 업데이트합니다.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # 토큰으로 사용자 정보 가져오기
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user.user.id
        
        # 카테고리 설정 업데이트
        response = supabase.table("user_profiles")\
            .update({"category_settings": settings.category_settings})\
            .eq("id", user_id)\
            .execute()
        
        print(f"카테고리 업데이트 성공: {user_id}")
        return {"status": "success", "data": response.data}
        
    except Exception as e:
        print(f"Error updating category settings: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile/email-notification")
async def update_email_notification(
    notification: EmailNotification,
    authorization: Optional[str] = Header(None)
):
    """
    이메일 알림 설정을 업데이트합니다.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # 토큰으로 사용자 정보 가져오기
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user.user.id
        
        # 이메일 알림 설정 업데이트
        response = supabase.table("user_profiles")\
            .update({"email_notification": notification.email_notification})\
            .eq("id", user_id)\
            .execute()
        
        print(f"알림 설정 업데이트 성공: {user_id} -> {notification.email_notification}")
        return {"status": "success", "data": response.data}
        
    except Exception as e:
        print(f"Error updating email notification: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/comments")
async def get_user_comments(authorization: Optional[str] = Header(None)):
    """
    사용자가 작성한 댓글 목록을 가져옵니다.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # 토큰으로 사용자 정보 가져오기
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user_response.user.id
        
        # 댓글 목록 가져오기
        response = supabase.table("user_profiles")\
            .select("comments")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        return response.data.get("comments", [])
        
    except Exception as e:
        print(f"Error fetching user comments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
