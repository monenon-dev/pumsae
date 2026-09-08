from __future__ import annotations

import re
import secrets
import unicodedata

SLUG_MAX = 40
_NON_SLUG = re.compile(r"[^a-z0-9]+")


def random_slug_suffix() -> str:
    return secrets.token_hex(2)


def ascii_slug(name: str) -> str:
    slug = unicodedata.normalize("NFKD", name.strip().lower())
    slug = "".join(ch for ch in slug if not unicodedata.combining(ch))
    slug = _NON_SLUG.sub("-", slug).strip("-")
    return slug[:SLUG_MAX]


def build_dojang_slug(name: str, attempt: int) -> str:
    base = ascii_slug(name) or "dojang"
    if attempt == 0 and base != "dojang":
        return base
    return f"{base}-{random_slug_suffix()}"[:SLUG_MAX]
