from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, db, auth
from typing import List
from datetime import datetime, timezone
from .tasks import post_to_social

router = APIRouter(prefix="/posts", tags=["posts"])

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post("/", response_model=schemas.PostOut)
def create_post(
    post: schemas.PostCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check that the social account belongs to the user
    account = db.query(models.SocialAccount).filter(models.SocialAccount.id == post.social_account_id, models.SocialAccount.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=403, detail="Invalid social account")
    new_post = models.Post(
        user_id=current_user.id,
        social_account_id=post.social_account_id,
        content=post.content,
        scheduled_time=post.scheduled_time,
        status="scheduled"
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    # Schedule Celery task
    eta = post.scheduled_time.replace(tzinfo=timezone.utc)
    post_to_social.apply_async((new_post.id,), eta=eta)
    return new_post

@router.get("/", response_model=List[schemas.PostOut])
def list_posts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    posts = db.query(models.Post).filter(models.Post.user_id == current_user.id).order_by(models.Post.scheduled_time.desc()).all()
    return posts 