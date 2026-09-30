from __future__ import annotations

import re
import secrets
import unicodedata

SLUG_MAX = 40
SLUG_MIN = 3
_NON_SLUG = re.compile(r"[^a-z0-9]+")
_CUSTOM_SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# 사이트 자체 경로와 겹치면 체육관 페이지가 그 화면을 가려 버리므로 막는다.
RESERVED_SLUGS = frozenset(
    {
        "api",
        "auth",
        "admin",
        "dashboard",
        "login",
        "logout",
        "register",
        "signup",
        "profile",
        "settings",
        "fonts",
        "static",
        "public",
        "favicon",
        "robots",
        "sitemap",
        "pumsae",
        "www",
        "help",
        "support",
        "privacy",
        "terms",
    }
)


def validate_custom_slug(raw: str) -> str:
    """관장님이 직접 정한 페이지 주소를 검사해 정규화한 값을 돌려준다. 틀리면 ValueError."""
    slug = raw.strip().lower()
    if len(slug) < SLUG_MIN or len(slug) > SLUG_MAX:
        raise ValueError(f"페이지 주소는 {SLUG_MIN}~{SLUG_MAX}자로 입력해 주세요.")
    if not _CUSTOM_SLUG.match(slug):
        raise ValueError(
            "페이지 주소는 영문 소문자, 숫자, 하이픈(-)만 쓸 수 있고 하이픈으로 시작하거나 끝날 수 없어요.",
        )
    if slug in RESERVED_SLUGS:
        raise ValueError("사용할 수 없는 주소예요. 다른 주소를 입력해 주세요.")
    return slug


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
