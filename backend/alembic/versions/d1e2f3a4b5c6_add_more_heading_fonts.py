"""add 5 more heading_font values (match the web editor)

Revision ID: d1e2f3a4b5c6
Revises: c0d1e2f3a4b5
Create Date: 2026-09-28 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "d1e2f3a4b5c6"
down_revision: Union[str, Sequence[str], None] = "c0d1e2f3a4b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_FONTS = ("NANUM_MYEONGJO", "DO_HYEON", "JUA", "SUNFLOWER", "STYLISH")


def upgrade() -> None:
    # ALTER TYPE ... ADD VALUE는 트랜잭션 밖에서 실행해야 안전하다.
    with op.get_context().autocommit_block():
        for font in NEW_FONTS:
            op.execute(f"ALTER TYPE heading_font ADD VALUE IF NOT EXISTS '{font}'")


def downgrade() -> None:
    # Postgres는 enum 값을 지울 수 없다. 되돌릴 때는 이 값을 쓰는 행을
    # PRETENDARD로 바꾸는 것까지만 한다.
    placeholders = ", ".join(f"'{font}'" for font in NEW_FONTS)
    op.execute(
        f"UPDATE dojangs SET heading_font = 'PRETENDARD' "
        f"WHERE heading_font::text IN ({placeholders})"
    )
