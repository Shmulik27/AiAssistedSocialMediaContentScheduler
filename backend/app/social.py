from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, db, auth
from typing import List
from .schemas import SocialAccountOut

router = APIRouter(prefix="/social", tags=["social"])

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post("/connect")
def connect_social_account(
    platform: str,
    access_token: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if platform not in ["instagram", "tiktok"]:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    account = models.SocialAccount(
        user_id=current_user.id,
        platform=platform,
        access_token=access_token
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return {"message": f"Connected {platform} account."}

@router.get("/accounts", response_model=List[SocialAccountOut])
def list_social_accounts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    accounts = db.query(models.SocialAccount).filter(models.SocialAccount.user_id == current_user.id).all()
    return accounts 