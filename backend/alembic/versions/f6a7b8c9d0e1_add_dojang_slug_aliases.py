"""add dojang_slug_aliases

Revision ID: f6a7b8c9d0e1
Revises: e4f5a6b7c8d9
Create Date: 2026-09-28 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "e4f5a6b7c8d9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dojang_slug_aliases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(), nullable=False, unique=True),
        sa.Column(
            "dojang_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("dojangs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_dojang_slug_aliases_dojang_id", "dojang_slug_aliases", ["dojang_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_dojang_slug_aliases_dojang_id", table_name="dojang_slug_aliases")
    op.drop_table("dojang_slug_aliases")
