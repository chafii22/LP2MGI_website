from django.contrib import admin

from .models import (
	ContactMessage,
	HomeHero,
	HomeMetric,
	Member,
	NewsCategory,
	NewsPost,
	NewsTag,
	Team,
	TeamMembership,
)


class TeamMembershipInline(admin.TabularInline):
	model = TeamMembership
	extra = 1
	autocomplete_fields = ("member",)
	fields = ("member", "is_leader", "order")
	ordering = ("order", "id")


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
	list_display = ("title", "slug", "lead_name", "focus", "is_active", "order")
	search_fields = ("title", "lead_name", "focus", "domain")
	list_filter = ("is_active",)
	prepopulated_fields = {"slug": ("title",)}
	inlines = [TeamMembershipInline]


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
	list_display = ("full_name", "role", "is_active", "updated_at")
	search_fields = ("full_name", "expertise", "email")
	list_filter = ("role", "is_active")


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
	list_display = ("member", "team", "is_leader", "order")
	search_fields = ("member__full_name", "team__title")
	list_filter = ("is_leader", "team")
	autocomplete_fields = ("team", "member")


@admin.register(NewsCategory)
class NewsCategoryAdmin(admin.ModelAdmin):
	list_display = ("name", "slug", "updated_at")
	search_fields = ("name",)
	prepopulated_fields = {"slug": ("name",)}


@admin.register(NewsTag)
class NewsTagAdmin(admin.ModelAdmin):
	list_display = ("name", "slug")
	search_fields = ("name",)
	prepopulated_fields = {"slug": ("name",)}


@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
	list_display = ("title", "category", "is_published", "is_featured", "published_at")
	search_fields = ("title", "body", "excerpt")
	list_filter = ("category", "is_published", "is_featured")
	prepopulated_fields = {"slug": ("title",)}
	filter_horizontal = ("tags", "authors")


@admin.register(HomeHero)
class HomeHeroAdmin(admin.ModelAdmin):
	list_display = ("title", "is_active", "updated_at")
	search_fields = ("title", "subtitle", "description")
	list_filter = ("is_active",)


@admin.register(HomeMetric)
class HomeMetricAdmin(admin.ModelAdmin):
	list_display = ("label", "value", "is_active", "order")
	search_fields = ("label", "value")
	list_filter = ("is_active",)
	ordering = ("order", "id")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
	list_display = ("full_name", "email", "subject", "is_read", "created_at", "replied_at")
	search_fields = ("full_name", "email", "subject", "message")
	list_filter = ("is_read", "created_at", "replied_at")
	readonly_fields = ("full_name", "email", "subject", "message", "created_at", "updated_at")
