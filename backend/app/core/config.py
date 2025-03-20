import os
from pydantic import BaseModel
from typing import Optional

class Settings(BaseModel):
    APP_NAME: str = "FlowMinder"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DATABASE_URL: str = "sqlite:///./flowminder.db"
    SYNC_DIR: Optional[str] = None

settings = Settings() 