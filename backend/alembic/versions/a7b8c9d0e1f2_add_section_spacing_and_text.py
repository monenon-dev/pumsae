"""add section spacing and editable section text

Revision ID: a7b8c9d0e1f2
Revises: f1a2c3d4e5f6
Create Date: 2026-09-17 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "f1a2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "dojangs",
        sa.Column(
            "section_spacing",
            sa.String(),
            server_default="NORMAL",
            nullable=False,
        ),
    )
    op.add_column("dojangs", sa.Column("section_text", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("dojangs", "section_text")
    op.drop_column("dojangs", "section_spacing")
