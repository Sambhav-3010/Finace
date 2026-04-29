"""
LLM client wrapper for RAG reasoning.
Groq-only implementation.
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
        self.groq_api_key = settings.groq_api_key
        self.groq_model = settings.groq_model

    def _mock_response(self, reason: str) -> dict:
        return {
            "risk_level": "MEDIUM",
            "risk_flags": [f"LLM fallback used: {reason}"],
            "applicable_clauses": [],
            "explanation": f"Fallback mode used. Reason: {reason}",
            "recommendations": [
                "Set RAG_ENABLE_LLM=1 to enable live LLM calls.",
                "Set GROQ_API_KEY in python-rag/.env.",
            ],
            "compliance_score": 55,
        }

    def _generate_groq(self, prompt: str) -> dict:
        from groq import Groq

        client = Groq(api_key=self.groq_api_key)
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.groq_model,
            temperature=0.2,
        )
        text = (response.choices[0].message.content or "").strip()
        return _extract_json_object(text)

    def generate_json(self, prompt: str) -> dict:
        if os.getenv("RAG_ENABLE_LLM", "1") != "1":
            reason = "RAG_ENABLE_LLM is not set to 1"
            logger.warning(f"{reason}; using fallback response")
            return self._mock_response(reason)

        try:
            if not self.groq_api_key:
                reason = "GROQ_API_KEY not set"
                logger.warning(f"{reason}; using fallback response")
                return self._mock_response(reason)
            return self._generate_groq(prompt)
        except Exception as exc:
            logger.error(f"LLM generation failed; using fallback response: {exc}")
            return self._mock_response(f"LLM generation failed: {exc}")
