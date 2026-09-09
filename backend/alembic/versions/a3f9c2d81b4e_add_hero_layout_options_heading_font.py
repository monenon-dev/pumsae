"""add hero_layout options and heading_font

Revision ID: a3f9c2d81b4e
Revises: f47ac10b58cc
Create Date: 2026-09-09 13:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "a3f9c2d81b4e"
down_revision: Union[str, Sequence[str], None] = "f47ac10b58cc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_HERO_LAYOUTS = ("TRADITIONAL", "DYNAMIC", "KIDS", "PREMIUM")
HEADING_FONTS = ("PRETENDARD", "SONG_MYUNG", "BLACK_HAN_SANS", "GOWUN_BATANG", "GAEGU")


def upgrade() -> None:
    for value in NEW_HERO_LAYOUTS:
        op.execute(f"ALTER TYPE hero_layout ADD VALUE IF NOT EXISTS '{value}'")

    heading_font = postgresql.ENUM(*HEADING_FONTS, name="heading_font")
    heading_font.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "dojangs",
        sa.Column(
            "heading_font",
            postgresql.ENUM(*HEADING_FONTS, name="heading_font", create_type=False),
            server_default="PRETENDARD",
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("dojangs", "heading_font")
    postgresql.ENUM(name="heading_font").drop(op.get_bind(), checkfirst=True)
    # Postgres has no ALTER TYPE ... DROP VALUE, so the added hero_layout
    # enum labels are left in place on downgrade.
