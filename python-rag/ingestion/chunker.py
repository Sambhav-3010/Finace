"""
Document chunking helpers.

Strategy:
1. Split text into coarse sections using heading-like lines.
2. Tokenize section text (lightweight regex tokenizer).
3. Create overlapping token windows.
4. Return chunk payloads with token_count and char_offset.
"""
from __future__ import annotations

import re
from dataclasses import dataclass


DEFAULT_CHUNK_SIZE = 700
DEFAULT_CHUNK_OVERLAP = 120

_TOKEN_PATTERN = re.compile(r"\w+|[^\w\s]", re.UNICODE)
_HEADING_NUMERIC_PATTERN = re.compile(r"^\s*(\d+(\.\d+){0,3})[\)\.\-\s]+.+$")
_HEADING_WORD_PATTERN = re.compile(
    r"^\s*(chapter|section|annexure|annex|appendix|clause)\b",
    re.IGNORECASE,
)


@dataclass
class Chunk:
    chunk_index: int
    section: str
    text: str
    token_count: int
    char_offset: int


def _is_heading_line(line: str) -> bool:
    stripped = line.strip()
    if len(stripped) < 3:
        return False
    if _HEADING_NUMERIC_PATTERN.match(stripped):
        return True
    if _HEADING_WORD_PATTERN.match(stripped):
        return True
    # Mostly uppercase short lines often represent headings in circulars
    alpha_chars = [c for c in stripped if c.isalpha()]
    if 4 <= len(alpha_chars) <= 80 and stripped.isupper():
        return True
    return False


def _split_sections(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    if not lines:
        return []

    sections: list[tuple[str, str]] = []
    current_heading = "GENERAL"
    current_lines: list[str] = []

    for line in lines:
        if _is_heading_line(line):
            if current_lines:
                sections.append((current_heading, "\n".join(current_lines).strip()))
                current_lines = []
            current_heading = line.strip()[:180]
        else:
            current_lines.append(line)

    if current_lines:
        sections.append((current_heading, "\n".join(current_lines).strip()))

    # If everything was headings/no body, treat full text as one section
    if not sections:
        return [("GENERAL", text.strip())]

    # Remove empty sections
    cleaned = [(heading, body) for heading, body in sections if body]
    return cleaned if cleaned else [("GENERAL", text.strip())]


def _tokenize(text: str) -> list[str]:
    return _TOKEN_PATTERN.findall(text)


def _detokenize(tokens: list[str]) -> str:
    if not tokens:
        return ""
    out: list[str] = []
    for i, token in enumerate(tokens):
        if i == 0:
            out.append(token)
            continue
        prev = tokens[i - 1]
        if re.match(r"[^\w\s]", token):
            out.append(token)
        elif re.match(r"[^\w\s]", prev):
            out.append(" " + token)
        else:
            out.append(" " + token)
    return "".join(out).strip()


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[Chunk]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")

    sections = _split_sections(text)
    chunks: list[Chunk] = []
    chunk_index = 0
    search_from = 0

    for section_heading, section_body in sections:
        tokens = _tokenize(section_body)
        if not tokens:
            continue

        start = 0
        step = chunk_size - overlap
        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            window_tokens = tokens[start:end]
            chunk_text_value = _detokenize(window_tokens).strip()
            if not chunk_text_value:
                start += step
                continue

            # Best-effort offset in full text. Fall back to current cursor.
            found_at = text.find(chunk_text_value[:120], search_from)
            char_offset = found_at if found_at >= 0 else search_from
            if found_at >= 0:
                search_from = found_at + len(chunk_text_value)

            chunks.append(
                Chunk(
                    chunk_index=chunk_index,
                    section=section_heading,
                    text=chunk_text_value,
                    token_count=len(window_tokens),
                    char_offset=char_offset,
                )
            )
            chunk_index += 1
            if end >= len(tokens):
                break
            start += step

    return chunks
