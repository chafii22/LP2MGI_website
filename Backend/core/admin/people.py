import json

from django.conf import settings
from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from core.admin.forms import TeamAdminForm
from core.admin.inlines import TeamMembershipInline
from core.models import (
    Member,
    MemberProfileAccessLink,
    MemberProfileAuditLog,
    MemberProfileSubmission,
    MemberProfileSubmissionStatus,
    Team,
    TeamMembership,
)


def _member_edit_base_url() -> str:
    configured_base = getattr(settings, "MEMBER_EDIT_BASE_URL", "").strip()
    if configured_base:
        return configured_base.rstrip("/")

    unfold_settings = getattr(settings, "UNFOLD", {})
    site_url = unfold_settings.get("SITE_URL", "") if isinstance(unfold_settings, dict) else ""
    if site_url:
        return str(site_url).rstrip("/")

    return "http://localhost:3000"


@admin.register(Team)
class TeamAdmin(ModelAdmin):
    form = TeamAdminForm
    list_display = ("title", "slug", "short_name", "lead_name", "is_active", "order")
    search_fields = ("title", "lead_name", "focus", "domain")
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("title",)}
    fields = (
        "title",
        "slug",
        "short_name",
        "tags",
        "lead_name",
        "domain",
        "focus",
        "overview",
        "is_active",
        "order",
    )
    inlines = [TeamMembershipInline]


@admin.register(Member)
class MemberAdmin(ModelAdmin):
    list_display = ("photo_preview", "full_name", "role", "profile_edit_status", "is_active", "updated_at")
    search_fields = ("full_name", "expertise", "email")
    list_filter = ("role", "is_active")
    actions = ("regenerate_profile_edit_link",)
    readonly_fields = ("photo_preview", "profile_edit_status", "profile_edit_link")
    fields = (
        "full_name",
        "role",
        "expertise",
        "email",
        "photo_url",
        "photo_preview",
        "biography",
        "highlight_quote",
        "research_interests",
        "milestones",
        "researchgate_url",
        "google_scholar_url",
        "orcid_url",
        "profile_edit_status",
        "profile_edit_link",
        "is_active",
    )

    def photo_preview(self, obj):
        if not obj or not obj.photo_url:
            return "No image"

        image_src = str(obj.photo_url)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.photo_url.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 72px; border-radius: 8px;" />',
            image_src,
            obj.full_name,
        )

    photo_preview.short_description = "Photo preview"

    def _build_edit_url(self, token: str) -> str:
        return f"{_member_edit_base_url()}/Members/Edit/{token}"

    def profile_edit_link(self, obj):
        if not obj:
            return "Generate a link after creating the member."

        access_link = getattr(obj, "profile_access_link", None)
        if not access_link or not access_link.token:
            return "No access link generated yet."

        url = self._build_edit_url(access_link.token)
        expiry_label = access_link.expires_at.strftime("%Y-%m-%d %H:%M UTC") if access_link.expires_at else "Never"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">{0}</a><br/><small>Expires: {1}</small>',
            url,
            expiry_label,
        )

    profile_edit_link.short_description = "Member edit URL"

    def profile_edit_status(self, obj):
        latest_submission = obj.profile_submissions.first()
        if latest_submission is None:
            return "Pending invitation"

        if latest_submission.status == MemberProfileSubmissionStatus.PENDING_APPROVAL:
            return "Pending approval"
        if latest_submission.status == MemberProfileSubmissionStatus.CHANGES_REQUESTED:
            return "Changes requested"
        return "Active"

    profile_edit_status.short_description = "Profile workflow status"

    @admin.action(description="Regenerate member edit link")
    def regenerate_profile_edit_link(self, request, queryset):
        generated_count = 0
        latest_url = ""

        for member in queryset:
            access_link, _ = MemberProfileAccessLink.objects.get_or_create(
                member=member,
                defaults={"created_by": request.user},
            )
            token = access_link.regenerate(created_by=request.user)
            latest_url = self._build_edit_url(token)
            generated_count += 1

        if generated_count == 1 and latest_url:
            self.message_user(
                request,
                f"Member edit link regenerated. Share this URL manually: {latest_url}",
                level=messages.SUCCESS,
            )
            return

        self.message_user(
            request,
            f"Regenerated edit links for {generated_count} member(s). Open each member to copy the URL.",
            level=messages.SUCCESS,
        )


@admin.register(TeamMembership)
class TeamMembershipAdmin(ModelAdmin):
    list_display = ("member", "team", "is_leader", "order")
    search_fields = ("member__full_name", "team__title")
    list_filter = ("is_leader", "team")
    autocomplete_fields = ("team", "member")


@admin.register(MemberProfileSubmission)
class MemberProfileSubmissionAdmin(ModelAdmin):
    list_display = ("member", "status", "submitted_by", "submitted_at", "reviewed_by", "reviewed_at")
    search_fields = ("member__full_name", "submitted_by", "admin_comment")
    list_filter = ("status", "submitted_at", "reviewed_at")
    actions = ("approve_pending_submissions", "request_changes_pending_submissions")
    readonly_fields = (
        "member",
        "status",
        "submitted_by",
        "submitted_from_ip",
        "submitted_at",
        "reviewed_by",
        "reviewed_at",
        "approved_at",
        "applied_at",
        "proposed_data_preview",
        "admin_comment",
        "created_at",
        "updated_at",
    )
    fields = (
        "member",
        "status",
        "submitted_by",
        "submitted_from_ip",
        "submitted_at",
        "reviewed_by",
        "reviewed_at",
        "approved_at",
        "applied_at",
        "admin_comment",
        "proposed_data_preview",
        "created_at",
        "updated_at",
    )

    def proposed_data_preview(self, obj):
        return format_html("<pre style='white-space: pre-wrap'>{}</pre>", json.dumps(obj.proposed_data, indent=2))

    proposed_data_preview.short_description = "Submitted changes"

    @admin.action(description="Approve selected pending submissions")
    def approve_pending_submissions(self, request, queryset):
        approved_count = 0
        for submission in queryset.select_related("member"):
            if submission.status != MemberProfileSubmissionStatus.PENDING_APPROVAL:
                continue
            submission.approve(reviewer=request.user)
            approved_count += 1

        self.message_user(
            request,
            f"Approved and applied {approved_count} submission(s).",
            level=messages.SUCCESS,
        )

    @admin.action(description="Request changes for selected pending submissions")
    def request_changes_pending_submissions(self, request, queryset):
        updated_count = 0
        for submission in queryset.select_related("member"):
            if submission.status != MemberProfileSubmissionStatus.PENDING_APPROVAL:
                continue
            submission.request_changes(
                reviewer=request.user,
                comment="Changes requested by admin. Please review and submit again.",
            )
            updated_count += 1

        self.message_user(
            request,
            f"Marked {updated_count} submission(s) as changes requested.",
            level=messages.SUCCESS,
        )


@admin.register(MemberProfileAuditLog)
class MemberProfileAuditLogAdmin(ModelAdmin):
    list_display = ("created_at", "member", "event_type", "actor_name", "submission")
    search_fields = ("member__full_name", "event_type", "actor_label", "actor_user__username")
    list_filter = ("event_type", "created_at")
    readonly_fields = (
        "created_at",
        "member",
        "submission",
        "event_type",
        "actor_member",
        "actor_user",
        "actor_label",
        "details_preview",
    )
    fields = (
        "created_at",
        "member",
        "submission",
        "event_type",
        "actor_member",
        "actor_user",
        "actor_label",
        "details_preview",
    )

    def actor_name(self, obj):
        if obj.actor_label:
            return obj.actor_label
        if obj.actor_user:
            return obj.actor_user.get_username()
        if obj.actor_member:
            return obj.actor_member.full_name
        return "system"

    actor_name.short_description = "Actor"

    def details_preview(self, obj):
        return format_html("<pre style='white-space: pre-wrap'>{}</pre>", json.dumps(obj.details, indent=2))

    details_preview.short_description = "Details"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
