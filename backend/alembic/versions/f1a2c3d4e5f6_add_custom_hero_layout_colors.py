"""add custom hero layout and colors

Revision ID: f1a2c3d4e5f6
Revises: d5e6b1c9a742
Create Date: 2026-09-17 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f1a2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "d5e6b1c9a742"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE hero_layout ADD VALUE IF NOT EXISTS 'CUSTOM'")
    op.add_column("dojangs", sa.Column("custom_bg_color", sa.String(), nullable=True))
    op.add_column("dojangs", sa.Column("custom_text_color", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("dojangs", "custom_text_color")
    op.drop_column("dojangs", "custom_bg_color")
    # Postgres has no ALTER TYPE ... DROP VALUE, so the added hero_layout
    # enum label is left in place on downgrade.
