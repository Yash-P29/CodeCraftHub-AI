import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from ai-service root
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / '.env'
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()  # Fallback to system env

class Config:
    """Configuration loader with secret masking and validation"""
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'gemini').lower()
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite').strip()
    PORT = int(os.getenv('AI_SERVICE_PORT', 5001))
    NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:5000')

    # Security & limits
    MAX_PROMPT_LENGTH = 4000
    REQUEST_TIMEOUT = 25  # seconds

    @classmethod
    def is_configured(cls) -> bool:
        """Check if a valid Gemini API key is configured"""
        return bool(cls.GEMINI_API_KEY and len(cls.GEMINI_API_KEY) > 10)

    @classmethod
    def get_masked_key(cls) -> str:
        """Return masked key for diagnostics without disclosing secrets"""
        if not cls.GEMINI_API_KEY:
            return "NOT_CONFIGURED"
        if len(cls.GEMINI_API_KEY) <= 8:
            return "***"
        return f"{cls.GEMINI_API_KEY[:4]}...{cls.GEMINI_API_KEY[-4:]}"
