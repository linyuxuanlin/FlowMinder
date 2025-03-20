import uvicorn
from app.core.config import settings
from app.api.api import app

if __name__ == "__main__":
    uvicorn.run(
        "app.api.api:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    ) 