"""
FastAPI wrapper for the existing Python RAG pipeline.

Run:
    uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from api.schemas import (
    HealthResponse,
    QueryRequest,
    QueryResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    ReportRequest,
    ReportResponse,
    IpfsRequest,
    IpfsResponse,
    ProofRequest,
    ProofResponse,
    SearchRequest,
    SearchResponse,
)
from api.services import RAGApiService


service = RAGApiService()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("Starting python-rag FastAPI wrapper")
    yield
    logger.info("Stopping python-rag FastAPI wrapper")


app = FastAPI(
    title="Finace Python RAG Wrapper",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    return HealthResponse(**service.health())


@app.post("/query", response_model=QueryResponse)
async def query_rag(payload: QueryRequest) -> QueryResponse:
    try:
        result = service.query(
            prompt=payload.prompt,
            top_k=payload.top_k,
            regulator=payload.regulator,
            category=payload.category,
        )
        return QueryResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("RAG query failed")
        raise HTTPException(status_code=500, detail="RAG query failed") from exc


# ──────────────────────────────────────────────
# POST /analyze  — Full analysis with any call_type
# ──────────────────────────────────────────────
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    try:
        result = service.analyze(
            call_type=payload.call_type,
            workflow_text=payload.workflow_text,
            existing_report_text=payload.existing_report_text,
            top_k=payload.top_k,
            regulator=payload.regulator,
            category=payload.category,
        )
        return AnalyzeResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail="Analysis failed") from exc


# ──────────────────────────────────────────────
# POST /report  — Generate a compliance report PDF
# ──────────────────────────────────────────────
@app.post("/report", response_model=ReportResponse)
async def generate_report(payload: ReportRequest) -> ReportResponse:
    try:
        result = service.generate_report(
            report_id=payload.report_id,
            org_name=payload.org_name,
            analysis=payload.analysis,
        )
        return ReportResponse(**result)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Report generation failed")
        raise HTTPException(status_code=500, detail="Report generation failed") from exc


# ──────────────────────────────────────────────
# POST /ipfs  — Upload report PDF to IPFS via Pinata
# ──────────────────────────────────────────────
@app.post("/ipfs", response_model=IpfsResponse)
async def upload_ipfs(payload: IpfsRequest) -> IpfsResponse:
    try:
        result = service.upload_to_ipfs(file_path=payload.file_path)
        return IpfsResponse(**result)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("IPFS upload failed")
        raise HTTPException(status_code=500, detail="IPFS upload failed") from exc


# ──────────────────────────────────────────────
# POST /proof  — Write compliance proof to blockchain
# ──────────────────────────────────────────────
@app.post("/proof", response_model=ProofResponse)
async def write_proof(payload: ProofRequest) -> ProofResponse:
    try:
        result = service.write_blockchain_proof(
            report_id=payload.report_id,
            ipfs_cid=payload.ipfs_cid,
            document_hash=payload.document_hash,
            org_name=payload.org_name,
            risk_level=payload.risk_level,
            contract_address=payload.contract_address,
        )
        return ProofResponse(**result)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Blockchain proof write failed")
        raise HTTPException(status_code=500, detail="Proof write failed") from exc


# ──────────────────────────────────────────────
# POST /search  — Search indexed regulations
# ──────────────────────────────────────────────
@app.post("/search", response_model=SearchResponse)
async def search_regulations(payload: SearchRequest) -> SearchResponse:
    try:
        result = service.search(
            query=payload.query,
            top_k=payload.top_k,
            regulator=payload.regulator,
        )
        return SearchResponse(**result)
    except Exception as exc:
        logger.exception("Regulation search failed")
        raise HTTPException(status_code=500, detail="Search failed") from exc
