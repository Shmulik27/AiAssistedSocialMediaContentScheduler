from fastapi import FastAPI
from . import auth, db, social, posts, ai

app = FastAPI()

app.include_router(auth.router)
app.include_router(social.router)
app.include_router(posts.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {"message": "AI-Assisted Social Media Content Scheduler API"}

@app.on_event("startup")
def on_startup():
    db.Base.metadata.create_all(bind=db.engine) 