from pathlib import Path
from pydantic import Field
from pydantic import model_validator
from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "compliance_engine"

    # Grok / xAI LLM
    llm_provider: str = Field(default="groq", alias="LLM_PROVIDER")
    xai_api_key: str = Field(default="", alias="XAI_API_KEY")
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", alias="GROQ_MODEL")
    xai_model: str = Field(default="grok-3-mini", alias="XAI_MODEL")
    xai_base_url: str = Field(default="https://api.x.ai/v1", alias="XAI_BASE_URL")

    embedding_model: str = "BAAI/bge-large-en-v1.5"
    embedding_dim: int = 1024

    # IPFS / Pinata
    pinata_api_key: str = ""
    pinata_secret_key: str = ""
    pinata_jwt: str = ""

    # Blockchain
    blockchain_rpc_url: str = "http://127.0.0.1:8545"
    compliance_contract_address: str = ""

    # Paths (resolved relative to this file)
    project_root: Path = Path(__file__).resolve().parent.parent
    service_root: Path = Path(__file__).resolve().parent
    data_dir: Path = service_root / "data"
    rbi_docs_dir: Path = project_root / "RBI DOCS"

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
    )

    @model_validator(mode="after")
    def normalize_project_paths(self):
        project_root = Path(__file__).resolve().parent.parent
        service_root = Path(__file__).resolve().parent
        self.project_root = project_root
        self.service_root = service_root
        self.data_dir = service_root / "data"
        self.rbi_docs_dir = project_root / "RBI DOCS"
        return self


settings = Settings()
print(f"DEBUG: GROQ_API_KEY loaded: {bool(settings.groq_api_key)}")
print(f"DEBUG: XAI_API_KEY loaded: {bool(settings.xai_api_key)}")
