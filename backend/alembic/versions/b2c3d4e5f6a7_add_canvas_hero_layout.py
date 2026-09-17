"""add canvas hero layout and canvas_elements

Revision ID: b2c3d4e5f6a7
Revises: a7b8c9d0e1f2
Create Date: 2026-09-17 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a7b8c9d0e1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE hero_layout ADD VALUE IF NOT EXISTS 'CANVAS'")
    op.add_column("dojangs", sa.Column("canvas_elements", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("dojangs", "canvas_elements")
    # Postgres has no ALTER TYPE ... DROP VALUE, so the added hero_layout
    # enum label is left in place on downgrade.
