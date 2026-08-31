#!/usr/bin/env bash
set -euo pipefail

echo "Python: $(python --version)"
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')" 2>/dev/null || true
echo "Build OK — no PyMuPDF on Render"
