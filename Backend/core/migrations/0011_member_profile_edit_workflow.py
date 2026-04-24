from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("core", "0010_use_hero_slides_only"),
    ]

    operations = [
        migrations.CreateModel(
            name="MemberProfileAccessLink",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("token", models.CharField(blank=True, db_index=True, max_length=96, unique=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("last_used_at", models.DateTimeField(blank=True, null=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="generated_member_profile_links",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "member",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile_access_link",
                        to="core.member",
                    ),
                ),
            ],
            options={
                "verbose_name": "Member profile access link",
                "verbose_name_plural": "Member profile access links",
            },
        ),
        migrations.CreateModel(
            name="MemberProfileSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("submitted_by", models.CharField(blank=True, max_length=180)),
                ("submitted_from_ip", models.GenericIPAddressField(blank=True, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending_approval", "Pending Approval"),
                            ("changes_requested", "Changes Requested"),
                            ("approved", "Approved"),
                        ],
                        db_index=True,
                        default="pending_approval",
                        max_length=32,
                    ),
                ),
                ("proposed_data", models.JSONField(blank=True, default=dict)),
                ("admin_comment", models.TextField(blank=True)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
                ("applied_at", models.DateTimeField(blank=True, null=True)),
                (
                    "member",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile_submissions",
                        to="core.member",
                    ),
                ),
                (
                    "reviewed_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="member_profile_reviews",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-submitted_at", "-id"],
            },
        ),
        migrations.CreateModel(
            name="MemberProfileAuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("link_regenerated", "Link Regenerated"),
                            ("submitted", "Submitted"),
                            ("approved", "Approved"),
                            ("changes_requested", "Changes Requested"),
                        ],
                        db_index=True,
                        max_length=40,
                    ),
                ),
                ("actor_label", models.CharField(blank=True, max_length=180)),
                ("details", models.JSONField(blank=True, default=dict)),
                (
                    "actor_member",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="member_profile_actor_logs",
                        to="core.member",
                    ),
                ),
                (
                    "actor_user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="member_profile_actor_logs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "member",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile_audit_logs",
                        to="core.member",
                    ),
                ),
                (
                    "submission",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="audit_logs",
                        to="core.memberprofilesubmission",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at", "-id"],
            },
        ),
    ]
