from fastapi import APIRouter, Body
from transformers import pipeline

router = APIRouter(prefix="/ai", tags=["ai"])

generator = pipeline('text-generation', model='distilgpt2')

@router.post("/generate")
def generate_caption(prompt: str = Body(..., embed=True)):
    result = generator(prompt, max_length=30, num_return_sequences=1)
    return {"result": result[0]['generated_text']} 