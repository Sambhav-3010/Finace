"""
LLM client wrapper for RAG reasoning.
Uses Gemini when API key is configured, otherwise falls back to a deterministic mock.
"""
from __future__ import annotations

import json
import os
import re

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
        self.api_key = settings.gemini_api_key
        self.model_name = settings.gemini_model

    def _mock_response(self) -> dict:
        return {
            "risk_level": "MEDIUM",
            "risk_flags": ["LLM API key not configured; returned fallback analysis"],
            "applicable_clauses": [],
            "explanation": "Fallback mode used because Gemini API key is missing.",
            "recommendations": ["Set GEMINI_API_KEY in .env for full LLM reasoning."],
            "compliance_score": 55,
        }

    def generate_json(self, prompt: str) -> dict:
        if os.getenv("RAG_ENABLE_LLM", "0") != "1":
            logger.warning("RAG_ENABLE_LLM is not set to 1; using fallback response")
            return self._mock_response()

        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set; using fallback response")
            return self._mock_response()

        try:
            import google.generativeai as genai

            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            text = (response.text or "").strip()
            return _extract_json_object(text)
        except Exception as exc:
            logger.error(f"LLM generation failed; using fallback response: {exc}")
            return self._mock_response()
