"""add more hero_layout options

Revision ID: d5e6b1c9a742
Revises: a3f9c2d81b4e
Create Date: 2026-09-17 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "d5e6b1c9a742"
down_revision: Union[str, Sequence[str], None] = "a3f9c2d81b4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_HERO_LAYOUTS = ("OCEAN", "MONO", "SPOTLIGHT", "BADGE")


def upgrade() -> None:
    for value in NEW_HERO_LAYOUTS:
        op.execute(f"ALTER TYPE hero_layout ADD VALUE IF NOT EXISTS '{value}'")


def downgrade() -> None:
    # Postgres has no ALTER TYPE ... DROP VALUE, so the added hero_layout
    # enum labels are left in place on downgrade.
    pass
