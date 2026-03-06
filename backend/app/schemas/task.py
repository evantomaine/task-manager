from datetime import datetime
from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str


class TaskResponse(BaseModel):
    id: int
    title: str
    is_completed: bool
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True
