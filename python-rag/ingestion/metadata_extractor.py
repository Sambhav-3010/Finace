"""
Infers regulator, category, issue date, and other metadata
from the file's path + filename within the RBI DOCS folder tree.
"""
import re
from pathlib import Path
from datetime import datetime


# Folders that are clearly NPCI-issued documents
_NPCI_TOP_FOLDERS = {"AEPS", "NFS", "CTS", "BHIM AADHAR", "E-UPI", "IMPS", "NIPC", "E-KYC"}

# Date-named folders contain RBI circulars bulk-downloaded on that date
_DATE_FOLDER_PATTERN = re.compile(
    r"^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(,\s*\d{4})?$",
    re.IGNORECASE,
)

# Month abbreviation → number
_MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

# Fiscal year: FY-25-26 or FY25-26 → "2025-26"
_FY_PATTERN = re.compile(r"FY[-_]?(\d{2})[-_](\d{2})", re.IGNORECASE)

# Embedded date in filename: DDMMYYYY  e.g. 27082021
_DDMMYYYY_PATTERN = re.compile(r"(\d{2})(\d{2})(\d{4})")

# Explicit dates in filename: "Apr 21 2026", "15 09 2025"
_READABLE_DATE_PATTERN = re.compile(
    r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})",
    re.IGNORECASE,
)

# NPCI circular number: OC-094, OC094
_OC_PATTERN = re.compile(r"OC[-_]?(\d+)", re.IGNORECASE)


def _parse_fiscal_year(stem: str) -> str:
    """Return e.g. '2025-26' if FY pattern found in filename stem."""
    m = _FY_PATTERN.search(stem)
    if m:
        y1 = int(m.group(1))
        base = 2000 + y1 if y1 < 50 else 1900 + y1
        return f"{base}-{m.group(2)}"
    return ""


def _parse_date_from_stem(stem: str) -> str:
    """Try to extract an ISO date string from a filename stem."""
    # Readable date: "Apr 21 2026"
    m = _READABLE_DATE_PATTERN.search(stem)
    if m:
        month = _MONTH_MAP[m.group(1).lower()[:3]]
        day = int(m.group(2))
        year = int(m.group(3))
        try:
            return datetime(year, month, day).strftime("%Y-%m-%d")
        except ValueError:
            pass

    # DDMMYYYY embedded: 27082021
    for m in _DDMMYYYY_PATTERN.finditer(stem):
        dd, mm, yyyy = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= mm <= 12 and 1 <= dd <= 31 and 2000 <= yyyy <= 2030:
            try:
                return datetime(yyyy, mm, dd).strftime("%Y-%m-%d")
            except ValueError:
                pass

    return ""


def _parse_date_from_folder(folder_name: str) -> str:
    """Extract date from a date-named folder like 'Aug 27' or 'Sept 25, 2025'."""
    m = re.match(
        r"^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(,\s*(\d{4}))?$",
        folder_name.strip(),
        re.IGNORECASE,
    )
    if not m:
        return ""
    month = _MONTH_MAP[m.group(1).lower()[:3]]
    day = int(m.group(2))
    year = int(m.group(4)) if m.group(4) else datetime.now().year
    try:
        return datetime(year, month, day).strftime("%Y-%m-%d")
    except ValueError:
        return ""


def _infer_category(parts: tuple) -> str:
    """Infer document category from path parts (relative to RBI DOCS)."""
    top = parts[0] if parts else ""
    top_upper = top.upper()

    if top_upper == "NIPC" and len(parts) > 1:
        return parts[1].upper()          # FasTag, NACH, RuPay
    if top_upper == "BHIM AADHAR":
        return "BHIM_AADHAR"
    if top_upper == "E-KYC":
        return "KYC"
    if top_upper == "E-UPI":
        return "UPI"
    if top_upper in ("RBI", "RBI (1)"):
        return "RBI_CIRCULAR"
    if _DATE_FOLDER_PATTERN.match(top):
        return "RBI_CIRCULAR"
    return top_upper or "GENERAL"


def _infer_regulator(top_folder: str) -> str:
    top = top_folder.upper()
    if top in _NPCI_TOP_FOLDERS:
        return "NPCI"
    if top in ("RBI", "RBI (1)"):
        return "RBI"
    if _DATE_FOLDER_PATTERN.match(top_folder):
        return "RBI"
    return "RBI"   # default to RBI for unknown folders


def _build_regulation_id(rel_path: Path) -> str:
    """Build a stable, URL-safe unique slug from the relative path."""
    stem = rel_path.stem
    # Normalise: lowercase, replace spaces/underscores/special chars with -
    slug = re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")
    # Prefix with parent folder slug
    parent = re.sub(r"[^a-z0-9]+", "-", rel_path.parent.name.lower()).strip("-")
    return f"{parent}-{slug}"[:120]   # cap length


def _infer_title(stem: str) -> str:
    """Best-effort human title from filename stem."""
    # NPCI style: "AePS-_-OC-094-_-FY-25-26-_-Implementation-of-..."
    clean = re.sub(r"^[A-Za-z]+[-_]+OC[-_]?\d+[-_]+", "", stem)
    clean = re.sub(r"FY[-_]?\d{2}[-_]\d{2}[-_]+", "", clean, flags=re.IGNORECASE)
    clean = re.sub(r"[-_]+", " ", clean).strip()
    return clean if len(clean) > 5 else stem.replace("-", " ").replace("_", " ")


def _infer_topics(stem: str, category: str) -> list:
    """Infer topic tags from stem keywords."""
    keywords = {
        "kyc": "KYC",
        "aml": "AML",
        "fraud": "Fraud",
        "chargeback": "Chargeback",
        "settlement": "Settlement",
        "interoperab": "Interoperability",
        "upi": "UPI",
        "atm": "ATM",
        "mandate": "E-Mandate",
        "dispute": "Dispute Resolution",
        "penalty": "Penalty",
        "compliance": "Compliance",
        "authentication": "Authentication",
        "transaction": "Transaction",
        "payment": "Payment",
        "grievan": "Grievance",
        "security": "Security",
        "data": "Data",
        "digital": "Digital Payments",
        "crypto": "Cryptocurrency",
        "foreign": "Foreign Exchange",
    }
    stem_lower = stem.lower()
    topics = [category]
    for key, label in keywords.items():
        if key in stem_lower and label not in topics:
            topics.append(label)
    return topics


def extract_metadata(pdf_path: Path, rbi_docs_root: Path) -> dict:
    """
    Given a PDF path and the root RBI DOCS folder, return a metadata dict
    ready to insert into the documents collection.
    """
    rel_path = pdf_path.relative_to(rbi_docs_root)
    parts = rel_path.parts[:-1]   # folders only, excluding filename

    top_folder = parts[0] if parts else ""
    regulator = _infer_regulator(top_folder)
    category = _infer_category(parts)

    stem = pdf_path.stem

    # --- Issue date ---
    issue_date = _parse_date_from_stem(stem)
    if not issue_date and parts:
        # Try top-level folder if it looks like a date
        issue_date = _parse_date_from_folder(top_folder)

    # --- Fiscal year as fallback date indicator ---
    fiscal_year = _parse_fiscal_year(stem)

    # --- Title ---
    title = _infer_title(stem)

    # --- Topics ---
    topics = _infer_topics(stem, category)

    # --- Circular number ---
    oc_match = _OC_PATTERN.search(stem)
    circular_number = f"OC-{oc_match.group(1)}" if oc_match else ""

    regulation_id = _build_regulation_id(rel_path)

    rel_lower = str(rel_path).lower()
    stem_lower = stem.lower()
    status = "active"
    if any(k in rel_lower for k in ("superseded", "obsolete", "archived", "old")):
        status = "superseded"
    elif any(k in stem_lower for k in ("superseded", "withdrawn", "rescinded", "obsolete")):
        status = "superseded"
    elif "partially modified" in rel_lower or "partially-modified" in rel_lower:
        status = "partially_modified"

    return {
        "regulation_id": regulation_id,
        "title": title,
        "source": pdf_path.name,
        "relative_path": str(rel_path),
        "regulator": regulator,
        "category": category,
        "status": status,
        "issue_date": issue_date,
        "fiscal_year": fiscal_year,
        "circular_number": circular_number,
        "supersedes": [],
        "topics": topics,
        "pdf_path": str(pdf_path),
        "parsed_text_path": "",
        "page_count": 0,
        "ingested_at": "",
        "parse_method": "",
    }
