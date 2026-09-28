"""add dojang_events

Revision ID: b9c0d1e2f3a4
Revises: a8b9c0d1e2f3
Create Date: 2026-09-28 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b9c0d1e2f3a4"
down_revision: Union[str, Sequence[str], None] = "a8b9c0d1e2f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dojang_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "dojang_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("dojangs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.String(length=5), nullable=True),
        sa.Column("end_time", sa.String(length=5), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("memo", sa.String(), nullable=True),
        sa.Column("category", sa.String(length=16), nullable=False),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_dojang_events_dojang_id", "dojang_events", ["dojang_id"])
    op.create_index("ix_dojang_events_event_date", "dojang_events", ["event_date"])


def downgrade() -> None:
    op.drop_index("ix_dojang_events_event_date", table_name="dojang_events")
    op.drop_index("ix_dojang_events_dojang_id", table_name="dojang_events")
    op.drop_table("dojang_events")
