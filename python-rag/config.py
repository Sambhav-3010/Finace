import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "compliance_engine"

    # Groq LLM
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

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
    data_dir: Path = Path(__file__).parent.parent / "data"
    rbi_docs_dir: Path = Path(__file__).parent.parent / "RBI DOCS"

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
