"""Security utilities: password hashing, session tokens, invitation JWTs, CSRF."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import structlog
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from jose import JWTError, jwt

from app.core.config import settings

logger = structlog.get_logger(__name__)

# ── Argon2id password hasher ─────────────────────────────────────────────────
# RFC-recommended defaults: t=2, m=65536 (64 MiB), p=1
_ph = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=1,
    hash_len=32,
    salt_len=16,
)


def hash_password(plain: str) -> str:
    """Return an Argon2id hash of *plain*."""
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*; False otherwise."""
    try:
        return _ph.verify(hashed, plain)
    except VerifyMismatchError:
        return False
    except InvalidHashError:
        logger.warning("security.invalid_hash", hashed_prefix=hashed[:20])
        return False


def password_needs_rehash(hashed: str) -> bool:
    """Return True if the stored hash should be upgraded (params changed)."""
    return _ph.check_needs_rehash(hashed)


# ── Opaque session tokens ─────────────────────────────────────────────────────


def generate_session_token() -> str:
    """Return a URL-safe 32-byte random token (256 bits of entropy)."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """SHA-256 digest of *token* stored in the DB (hex-encoded)."""
    return hashlib.sha256(token.encode()).hexdigest()


def constant_time_compare(a: str, b: str) -> bool:
    """Timing-safe string comparison."""
    return hmac.compare_digest(a.encode(), b.encode())


# ── Invitation / email-verification JWTs ─────────────────────────────────────
_ALGORITHM = "HS256"


def create_invitation_token(
    payload: dict[str, Any],
    ttl_hours: int | None = None,
) -> str:
    """Sign *payload* with INVITATION_SECRET; default TTL from settings."""
    expire = datetime.now(UTC) + timedelta(
        hours=ttl_hours if ttl_hours is not None else settings.INVITATION_TTL_HOURS
    )
    return jwt.encode(
        {**payload, "exp": expire},
        settings.INVITATION_SECRET,
        algorithm=_ALGORITHM,
    )


def decode_invitation_token(token: str) -> dict[str, Any]:
    """Decode and verify an invitation token.

    Raises jose.JWTError on invalid / expired tokens.
    """
    return jwt.decode(token, settings.INVITATION_SECRET, algorithms=[_ALGORITHM])


# ── Email-verification tokens (short-lived, same machinery) ─────────────────


def create_email_verification_token(user_id: str, email: str) -> str:
    return create_invitation_token(
        {"sub": user_id, "email": email, "type": "email_verify"},
        ttl_hours=24,
    )


def decode_email_verification_token(token: str) -> dict[str, Any]:
    data = decode_invitation_token(token)
    if data.get("type") != "email_verify":
        raise JWTError("wrong token type")
    return data


def create_password_reset_token(user_id: str, email: str) -> str:
    return create_invitation_token(
        {"sub": user_id, "email": email, "type": "pw_reset"},
        ttl_hours=1,
    )


def decode_password_reset_token(token: str) -> dict[str, Any]:
    data = decode_invitation_token(token)
    if data.get("type") != "pw_reset":
        raise JWTError("wrong token type")
    return data


# ── CSRF double-submit cookie ─────────────────────────────────────────────────


def generate_csrf_token() -> str:
    """Return a random CSRF token."""
    return secrets.token_urlsafe(32)


def verify_csrf_token(header_value: str | None, cookie_value: str | None) -> bool:
    """Verify that the X-CSRF-Token header matches the csrf cookie."""
    if not header_value or not cookie_value:
        return False
    return constant_time_compare(header_value, cookie_value)
