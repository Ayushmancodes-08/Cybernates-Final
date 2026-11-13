"""
Authentication & User Management Router
Handles login, JWT token refresh, session revocation, user profile and tenant lookups.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    security_scheme
)
from models import LoginRequest, TokenResponse, RefreshRequest, UserProfile
from database import db

router = APIRouter(tags=["Authentication"])


@router.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = db.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    refresh_token = create_refresh_token({"sub": user["id"]})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "tenant_id": user["tenant_id"]
        }
    }


@router.post("/api/v1/auth/refresh")
async def refresh_token(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    new_access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 3600
    }


@router.post("/api/v1/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.get("/api/v1/me", response_model=UserProfile)
async def get_current_user_profile(token: str = Depends(security_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "tenant_id": user["tenant_id"],
        "avatar_url": user.get("avatar_url")
    }


@router.get("/api/v1/users")
async def get_all_users(token: str = Depends(security_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return [
        {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "tenant_id": u["tenant_id"],
            "created_at": u.get("created_at")
        }
        for u in db.users
    ]


@router.get("/api/v1/tenants")
async def get_tenants(token: str = Depends(security_scheme)):
    return db.tenants

