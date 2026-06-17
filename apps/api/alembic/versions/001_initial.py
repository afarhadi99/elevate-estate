"""Initial schema – all core tables.

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enable pgcrypto for gen_random_uuid() ─────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── organizations ─────────────────────────────────────────────────────────
    op.create_table(
        "organizations",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("logo_url", sa.Text(), nullable=True),
        sa.Column("website", sa.Text(), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_organizations"),
    )
    op.create_index("ix_organizations_slug", "organizations", ["slug"], unique=True)

    # ── org_memberships ───────────────────────────────────────────────────────
    op.create_table(
        "org_memberships",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="agent"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_org_memberships_organization_id_organizations"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE",
            name="fk_org_memberships_user_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_org_memberships"),
        sa.UniqueConstraint("organization_id", "user_id", name="uq_org_memberships_org_user"),
    )
    op.create_index("ix_org_memberships_organization_id", "org_memberships", ["organization_id"])
    op.create_index("ix_org_memberships_user_id", "org_memberships", ["user_id"])

    # ── org_settings ──────────────────────────────────────────────────────────
    op.create_table(
        "org_settings",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("listing_stages", sa.JSON(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=False, server_default="USD"),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en-US"),
        sa.Column("extra", sa.JSON(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_org_settings_organization_id_organizations"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_org_settings"),
        sa.UniqueConstraint("organization_id", name="uq_org_settings_organization_id"),
    )

    # ── auth_sessions ─────────────────────────────────────────────────────────
    op.create_table(
        "auth_sessions",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "last_seen_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE",
            name="fk_auth_sessions_user_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_auth_sessions"),
        sa.UniqueConstraint("token_hash", name="uq_auth_sessions_token_hash"),
    )
    op.create_index("ix_auth_sessions_user_id", "auth_sessions", ["user_id"])
    op.create_index("ix_auth_sessions_token_hash", "auth_sessions", ["token_hash"])

    # ── email_verifications ───────────────────────────────────────────────────
    op.create_table(
        "email_verifications",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE",
            name="fk_email_verifications_user_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_email_verifications"),
        sa.UniqueConstraint("token_hash", name="uq_email_verifications_token_hash"),
    )
    op.create_index("ix_email_verifications_user_id", "email_verifications", ["user_id"])
    op.create_index("ix_email_verifications_token_hash", "email_verifications", ["token_hash"])

    # ── password_resets ───────────────────────────────────────────────────────
    op.create_table(
        "password_resets",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE",
            name="fk_password_resets_user_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_password_resets"),
        sa.UniqueConstraint("token_hash", name="uq_password_resets_token_hash"),
    )
    op.create_index("ix_password_resets_user_id", "password_resets", ["user_id"])
    op.create_index("ix_password_resets_token_hash", "password_resets", ["token_hash"])

    # ── invitations ───────────────────────────────────────────────────────────
    op.create_table(
        "invitations",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="agent"),
        sa.Column("invited_by_id", sa.UUID(), nullable=True),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_invitations_organization_id_organizations"
        ),
        sa.ForeignKeyConstraint(
            ["invited_by_id"], ["users.id"], ondelete="SET NULL",
            name="fk_invitations_invited_by_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_invitations"),
        sa.UniqueConstraint("token_hash", name="uq_invitations_token_hash"),
    )
    op.create_index("ix_invitations_organization_id", "invitations", ["organization_id"])
    op.create_index("ix_invitations_token_hash", "invitations", ["token_hash"])

    # ── permissions ───────────────────────────────────────────────────────────
    op.create_table(
        "permissions",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("codename", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_permissions"),
        sa.UniqueConstraint("codename", name="uq_permissions_codename"),
    )
    op.create_index("ix_permissions_codename", "permissions", ["codename"])

    # ── roles ─────────────────────────────────────────────────────────────────
    op.create_table(
        "roles",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_roles_organization_id_organizations"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_roles"),
        sa.UniqueConstraint("organization_id", "name", name="uq_roles_org_name"),
    )
    op.create_index("ix_roles_organization_id", "roles", ["organization_id"])

    # ── role_permissions ──────────────────────────────────────────────────────
    op.create_table(
        "role_permissions",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("role_id", sa.UUID(), nullable=False),
        sa.Column("permission_id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["role_id"], ["roles.id"], ondelete="CASCADE",
            name="fk_role_permissions_role_id_roles"
        ),
        sa.ForeignKeyConstraint(
            ["permission_id"], ["permissions.id"], ondelete="CASCADE",
            name="fk_role_permissions_permission_id_permissions"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_role_permissions"),
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permissions_role_perm"),
    )
    op.create_index("ix_role_permissions_role_id", "role_permissions", ["role_id"])
    op.create_index("ix_role_permissions_permission_id", "role_permissions", ["permission_id"])

    # ── listings ──────────────────────────────────────────────────────────────
    op.create_table(
        "listings",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("agent_id", sa.UUID(), nullable=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("property_type", sa.String(50), nullable=False, server_default="residential"),
        sa.Column("listing_type", sa.String(50), nullable=False, server_default="for_sale"),
        sa.Column("stage", sa.String(100), nullable=False, server_default="Lead"),
        sa.Column("asking_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("sale_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("bathrooms", sa.Numeric(4, 1), nullable=True),
        sa.Column("square_feet", sa.Integer(), nullable=True),
        sa.Column("lot_size_sqft", sa.Integer(), nullable=True),
        sa.Column("year_built", sa.Integer(), nullable=True),
        sa.Column("mls_number", sa.String(100), nullable=True),
        sa.Column("listed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_listings_organization_id_organizations"
        ),
        sa.ForeignKeyConstraint(
            ["agent_id"], ["users.id"], ondelete="SET NULL",
            name="fk_listings_agent_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_listings"),
    )
    op.create_index("ix_listings_organization_id", "listings", ["organization_id"])
    op.create_index("ix_listings_agent_id", "listings", ["agent_id"])
    op.create_index("ix_listings_mls_number", "listings", ["mls_number"])

    # ── listing_addresses ─────────────────────────────────────────────────────
    op.create_table(
        "listing_addresses",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("listing_id", sa.UUID(), nullable=False),
        sa.Column("street_1", sa.String(255), nullable=False),
        sa.Column("street_2", sa.String(255), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("postal_code", sa.String(20), nullable=False),
        sa.Column("country", sa.String(10), nullable=False, server_default="US"),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=True),
        sa.ForeignKeyConstraint(
            ["listing_id"], ["listings.id"], ondelete="CASCADE",
            name="fk_listing_addresses_listing_id_listings"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_listing_addresses"),
        sa.UniqueConstraint("listing_id", name="uq_listing_addresses_listing_id"),
    )

    # ── listing_notes ─────────────────────────────────────────────────────────
    op.create_table(
        "listing_notes",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("listing_id", sa.UUID(), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("author_id", sa.UUID(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["listing_id"], ["listings.id"], ondelete="CASCADE",
            name="fk_listing_notes_listing_id_listings"
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_listing_notes_organization_id_organizations"
        ),
        sa.ForeignKeyConstraint(
            ["author_id"], ["users.id"], ondelete="SET NULL",
            name="fk_listing_notes_author_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_listing_notes"),
    )
    op.create_index("ix_listing_notes_listing_id", "listing_notes", ["listing_id"])
    op.create_index("ix_listing_notes_organization_id", "listing_notes", ["organization_id"])

    # ── listing_stage_history ─────────────────────────────────────────────────
    op.create_table(
        "listing_stage_history",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("listing_id", sa.UUID(), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("changed_by_id", sa.UUID(), nullable=True),
        sa.Column("from_stage", sa.String(100), nullable=True),
        sa.Column("to_stage", sa.String(100), nullable=False),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["listing_id"], ["listings.id"], ondelete="CASCADE",
            name="fk_listing_stage_history_listing_id_listings"
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_listing_stage_history_organization_id_organizations"
        ),
        sa.ForeignKeyConstraint(
            ["changed_by_id"], ["users.id"], ondelete="SET NULL",
            name="fk_listing_stage_history_changed_by_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_listing_stage_history"),
    )
    op.create_index("ix_listing_stage_history_listing_id", "listing_stage_history", ["listing_id"])
    op.create_index("ix_listing_stage_history_organization_id", "listing_stage_history", ["organization_id"])

    # ── media_assets ──────────────────────────────────────────────────────────
    op.create_table(
        "media_assets",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("uploaded_by_id", sa.UUID(), nullable=True),
        sa.Column("s3_key", sa.Text(), nullable=False),
        sa.Column("s3_bucket", sa.String(255), nullable=False),
        sa.Column("original_filename", sa.String(512), nullable=False),
        sa.Column("content_type", sa.String(100), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("upload_confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_media_assets_organization_id_organizations"
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by_id"], ["users.id"], ondelete="SET NULL",
            name="fk_media_assets_uploaded_by_id_users"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_media_assets"),
        sa.UniqueConstraint("s3_key", name="uq_media_assets_s3_key"),
    )
    op.create_index("ix_media_assets_organization_id", "media_assets", ["organization_id"])

    # ── media_variants ────────────────────────────────────────────────────────
    op.create_table(
        "media_variants",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("asset_id", sa.UUID(), nullable=False),
        sa.Column("variant_name", sa.String(100), nullable=False),
        sa.Column("s3_key", sa.Text(), nullable=False),
        sa.Column("content_type", sa.String(100), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"], ["media_assets.id"], ondelete="CASCADE",
            name="fk_media_variants_asset_id_media_assets"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_media_variants"),
        sa.UniqueConstraint("s3_key", name="uq_media_variants_s3_key"),
        sa.UniqueConstraint("asset_id", "variant_name", name="uq_media_variants_asset_variant"),
    )
    op.create_index("ix_media_variants_asset_id", "media_variants", ["asset_id"])

    # ── listing_media ─────────────────────────────────────────────────────────
    op.create_table(
        "listing_media",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("listing_id", sa.UUID(), nullable=False),
        sa.Column("asset_id", sa.UUID(), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("is_cover", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "attached_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["listing_id"], ["listings.id"], ondelete="CASCADE",
            name="fk_listing_media_listing_id_listings"
        ),
        sa.ForeignKeyConstraint(
            ["asset_id"], ["media_assets.id"], ondelete="CASCADE",
            name="fk_listing_media_asset_id_media_assets"
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], ondelete="CASCADE",
            name="fk_listing_media_organization_id_organizations"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_listing_media"),
        sa.UniqueConstraint("listing_id", "asset_id", name="uq_listing_media_listing_asset"),
    )
    op.create_index("ix_listing_media_listing_id", "listing_media", ["listing_id"])
    op.create_index("ix_listing_media_asset_id", "listing_media", ["asset_id"])
    op.create_index("ix_listing_media_organization_id", "listing_media", ["organization_id"])

    # ── Seed built-in permissions ─────────────────────────────────────────────
    op.execute("""
        INSERT INTO permissions (id, codename, description) VALUES
        (gen_random_uuid(), 'listings:read',           'View listings'),
        (gen_random_uuid(), 'listings:create',         'Create listings'),
        (gen_random_uuid(), 'listings:update',         'Edit listings'),
        (gen_random_uuid(), 'listings:delete',         'Delete listings'),
        (gen_random_uuid(), 'listings:manage_stage',   'Move listings through stages'),
        (gen_random_uuid(), 'media:upload',            'Upload media'),
        (gen_random_uuid(), 'media:delete',            'Delete media'),
        (gen_random_uuid(), 'org:view_members',        'View organization members'),
        (gen_random_uuid(), 'org:manage_members',      'Invite and remove members'),
        (gen_random_uuid(), 'org:manage_settings',     'Edit organization settings'),
        (gen_random_uuid(), 'roles:manage',            'Create and assign roles')
    """)


def downgrade() -> None:
    op.drop_table("listing_media")
    op.drop_table("media_variants")
    op.drop_table("media_assets")
    op.drop_table("listing_stage_history")
    op.drop_table("listing_notes")
    op.drop_table("listing_addresses")
    op.drop_table("listings")
    op.drop_table("role_permissions")
    op.drop_table("roles")
    op.drop_table("permissions")
    op.drop_table("invitations")
    op.drop_table("password_resets")
    op.drop_table("email_verifications")
    op.drop_table("auth_sessions")
    op.drop_table("org_settings")
    op.drop_table("org_memberships")
    op.drop_table("organizations")
    op.drop_table("users")
