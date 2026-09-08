"""init_schema

Revision ID: 99fc4790d7f7
Revises:
Create Date: 2026-09-08 16:15:47.340779

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "99fc4790d7f7"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    postgresql.ENUM("OWNER", "INSTRUCTOR", name="user_role").create(
        bind,
        checkfirst=True,
    )
    postgresql.ENUM(
        "AWARD",
        "BELT_UP",
        "RECRUIT",
        "EVENT",
        name="promo_template_type",
    ).create(bind, checkfirst=True)
    postgresql.ENUM(
        "KIDS",
        "ELEMENTARY",
        "MIDDLE_HIGH",
        "ADULT",
        name="desired_class",
    ).create(bind, checkfirst=True)
    postgresql.ENUM(
        "PENDING",
        "CONFIRMED",
        "DECLINED",
        name="trial_request_status",
    ).create(bind, checkfirst=True)

    op.create_table(
        "dojangs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("logo_url", sa.String(), nullable=True),
        sa.Column("hero_image_url", sa.String(), nullable=True),
        sa.Column("brand_color", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dojang_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("OWNER", "INSTRUCTOR", name="user_role", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["dojang_id"],
            ["dojangs.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_dojang_id"), "users", ["dojang_id"], unique=False)
    op.create_table(
        "promo_templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dojang_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "type",
            postgresql.ENUM(
                "AWARD",
                "BELT_UP",
                "RECRUIT",
                "EVENT",
                name="promo_template_type",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "content",
            postgresql.JSON(astext_type=sa.Text()),
            server_default=sa.text("'{}'::json"),
            nullable=False,
        ),
        sa.Column("thumbnail_url", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["dojang_id"],
            ["dojangs.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_promo_templates_dojang_id"),
        "promo_templates",
        ["dojang_id"],
        unique=False,
    )
    op.create_table(
        "trial_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dojang_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_name", sa.String(), nullable=False),
        sa.Column("parent_name", sa.String(), nullable=False),
        sa.Column("parent_phone", sa.String(), nullable=False),
        sa.Column(
            "desired_class",
            postgresql.ENUM(
                "KIDS",
                "ELEMENTARY",
                "MIDDLE_HIGH",
                "ADULT",
                name="desired_class",
                create_type=False,
            ),
            nullable=True,
        ),
        sa.Column("memo", sa.String(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "PENDING",
                "CONFIRMED",
                "DECLINED",
                name="trial_request_status",
                create_type=False,
            ),
            server_default="PENDING",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["dojang_id"],
            ["dojangs.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_trial_requests_created_at"),
        "trial_requests",
        ["created_at"],
        unique=False,
    )
    op.create_index(
        op.f("ix_trial_requests_dojang_id"),
        "trial_requests",
        ["dojang_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_trial_requests_dojang_id"), table_name="trial_requests")
    op.drop_index(op.f("ix_trial_requests_created_at"), table_name="trial_requests")
    op.drop_table("trial_requests")
    op.drop_index(op.f("ix_promo_templates_dojang_id"), table_name="promo_templates")
    op.drop_table("promo_templates")
    op.drop_index(op.f("ix_users_dojang_id"), table_name="users")
    op.drop_table("users")
    op.drop_table("dojangs")
    op.execute("DROP TYPE IF EXISTS trial_request_status")
    op.execute("DROP TYPE IF EXISTS desired_class")
    op.execute("DROP TYPE IF EXISTS promo_template_type")
    op.execute("DROP TYPE IF EXISTS user_role")
