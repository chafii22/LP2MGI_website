from django.contrib import admin
from unfold.admin import ModelAdmin

from core.admin.inlines import TeamMembershipInline
from core.models import Member, Team, TeamMembership


@admin.register(Team)
class TeamAdmin(ModelAdmin):
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
    list_display = ("full_name", "role", "is_active", "updated_at")
    search_fields = ("full_name", "expertise", "email")
    list_filter = ("role", "is_active")


@admin.register(TeamMembership)
class TeamMembershipAdmin(ModelAdmin):
    list_display = ("member", "team", "is_leader", "order")
    search_fields = ("member__full_name", "team__title")
    list_filter = ("is_leader", "team")
    autocomplete_fields = ("team", "member")
