import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load root .env if it exists
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()


class Settings(BaseSettings):
    # LLM Settings (Groq)
    groq_api_key: Optional[str] = os.getenv("GROQ_API_KEY", "")
    groq_primary_model: str = os.getenv("GROQ_PRIMARY_MODEL", "openai/gpt-oss-120b")
    groq_fallback_model: str = os.getenv("GROQ_FALLBACK_MODEL", "qwen/qwen3.8-27b")
    groq_api_base: str = os.getenv("GROQ_API_BASE", "https://api.groq.com/openai/v1")

    # Persistent Memory (Hindsight Cloud)
    hindsight_api_key: Optional[str] = os.getenv("HINDSIGHT_API_KEY", "")
    hindsight_api_base_url: str = os.getenv("HINDSIGHT_API_BASE_URL", "https://api.hindsight.cloud")
    hindsight_incidents_bank_id: str = os.getenv("HINDSIGHT_INCIDENTS_BANK_ID", "bank_incidents_prod_01")
    hindsight_fix_outcomes_bank_id: str = os.getenv("HINDSIGHT_FIX_OUTCOMES_BANK_ID", "bank_fix_outcomes_prod_01")
    hindsight_team_bank_id: str = os.getenv("HINDSIGHT_TEAM_BANK_ID", "bank_team_prod_01")
    hindsight_baseline_bank_id: str = os.getenv("HINDSIGHT_BASELINE_BANK_ID", "bank_baseline_prod_01")

    # API Server Settings
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    environment: str = os.getenv("ENVIRONMENT", "development")

    @property
    def is_demo_mode(self) -> bool:
        """True if external API credentials are not provided."""
        return not bool(self.groq_api_key and self.hindsight_api_key)

    @property
    def is_groq_available(self) -> bool:
        return bool(self.groq_api_key and len(self.groq_api_key.strip()) > 5)

    @property
    def is_hindsight_available(self) -> bool:
        return bool(self.hindsight_api_key and len(self.hindsight_api_key.strip()) > 5)

    @property
    def memory_mode_label(self) -> str:
        return "HINDSIGHT_CLOUD" if self.is_hindsight_available else "DEMO_LOCAL"

    @property
    def llm_mode_label(self) -> str:
        return "GROQ_CLOUD" if self.is_groq_available else "DEMO_REASONER"


settings = Settings()
