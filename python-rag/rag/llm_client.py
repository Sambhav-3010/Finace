"""
LLM client wrapper for RAG reasoning.
Grok/xAI implementation.
"""
from __future__ import annotations

import json
import os
import re

import httpx
from loguru import logger

from config import settings


def _extract_json_object(text: str) -> dict:
    # Try direct JSON first
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try fenced or embedded JSON
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    raise ValueError("Could not parse JSON from model response")


class LLMClient:
    def __init__(self):
        self.xai_api_key = (
            settings.groq_api_key
            or settings.xai_api_key
            or os.getenv("GROK_API_KEY", "")
            or os.getenv("GROQ_API_KEY", "")
        )
        self.xai_model = (
            settings.groq_model
            if settings.llm_provider == "groq"
            else settings.xai_model
        )
        self.xai_base_url = "https://api.x.ai/v1"
        if self.xai_api_key.startswith("gsk_") or settings.llm_provider == "groq":
            self.xai_base_url = "https://api.groq.com/openai/v1"
        
        # Override if explicitly set in settings
        if settings.xai_base_url and "x.ai" not in settings.xai_base_url:
            self.xai_base_url = settings.xai_base_url.rstrip("/")

    def _mock_response(self, reason: str) -> dict:
        return {
            "risk_level": "MEDIUM",
            "risk_flags": [f"LLM fallback used: {reason}"],
            "applicable_clauses": [],
            "explanation": f"Fallback mode used. Reason: {reason}",
            "recommendations": [
                "Set RAG_ENABLE_LLM=1 to enable live LLM calls.",
                "Set XAI_API_KEY in python-rag/.env.",
            ],
            "compliance_score": 55,
        }

    def _generate_xai(self, prompt: str) -> dict:
        response = httpx.post(
            f"{self.xai_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.xai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.xai_model,
                "temperature": 0.2,
                "messages": [
                    {
                        "role": "system",
                        "content": "Return valid JSON only. Do not wrap the response in markdown.",
                    },
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        text = (data["choices"][0]["message"]["content"] or "").strip()
        return _extract_json_object(text)

    def generate_json(self, prompt: str) -> dict:
        if os.getenv("RAG_ENABLE_LLM", "1") != "1":
            reason = "RAG_ENABLE_LLM is not set to 1"
            logger.warning(f"{reason}; using fallback response")
            return self._mock_response(reason)

        try:
            if not self.xai_api_key:
                reason = "XAI_API_KEY not set"
                logger.warning(f"{reason}; using fallback response")
                return self._mock_response(reason)
            return self._generate_xai(prompt)
        except Exception as exc:
            logger.error(f"LLM generation failed; using fallback response: {exc}")
            return self._mock_response(f"LLM generation failed: {exc}")
