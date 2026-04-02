from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from core.admin.forms import TeamAdminForm
from core.admin.inlines import TeamMembershipInline
from core.models import Member, Team, TeamMembership


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
    list_display = ("photo_preview", "full_name", "role", "is_active", "updated_at")
    search_fields = ("full_name", "expertise", "email")
    list_filter = ("role", "is_active")
    readonly_fields = ("photo_preview",)
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


@admin.register(TeamMembership)
class TeamMembershipAdmin(ModelAdmin):
    list_display = ("member", "team", "is_leader", "order")
    search_fields = ("member__full_name", "team__title")
    list_filter = ("is_leader", "team")
    autocomplete_fields = ("team", "member")
