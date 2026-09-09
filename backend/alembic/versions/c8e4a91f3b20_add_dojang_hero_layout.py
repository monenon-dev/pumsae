"""add dojang hero_layout

Revision ID: c8e4a91f3b20
Revises: 99fc4790d7f7
Create Date: 2026-09-09 10:22:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "c8e4a91f3b20"
down_revision: Union[str, Sequence[str], None] = "99fc4790d7f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    hero_layout = postgresql.ENUM(
        "GRADIENT",
        "SOLID",
        "PHOTO_COVER",
        "SPLIT",
        name="hero_layout",
    )
    hero_layout.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "dojangs",
        sa.Column(
            "hero_layout",
            postgresql.ENUM(
                "GRADIENT",
                "SOLID",
                "PHOTO_COVER",
                "SPLIT",
                name="hero_layout",
                create_type=False,
            ),
            server_default="GRADIENT",
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("dojangs", "hero_layout")
    postgresql.ENUM(name="hero_layout").drop(op.get_bind(), checkfirst=True)
