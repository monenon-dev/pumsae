"""add dojang updated_at

Revision ID: f47ac10b58cc
Revises: c8e4a91f3b20
Create Date: 2026-09-09 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f47ac10b58cc"
down_revision: Union[str, Sequence[str], None] = "c8e4a91f3b20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "dojangs",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("dojangs", "updated_at")
