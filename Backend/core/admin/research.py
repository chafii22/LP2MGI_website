from django.contrib import admin
from unfold.admin import ModelAdmin

from core.admin.inlines import ProjectParticipationInline, PublicationAuthorInline
from core.models import Project, ProjectParticipation, Publication, PublicationAuthor


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ("title", "team", "status", "date_start", "date_end", "is_active")
    search_fields = ("title", "description", "team__title")
    list_filter = ("status", "is_active", "team")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("team", "created_by")
    inlines = [ProjectParticipationInline]


@admin.register(ProjectParticipation)
class ProjectParticipationAdmin(ModelAdmin):
    list_display = ("member", "project", "role")
    search_fields = ("member__full_name", "project__title", "role")
    list_filter = ("project",)
    autocomplete_fields = ("member", "project")


@admin.register(Publication)
class PublicationAdmin(ModelAdmin):
    list_display = ("title", "publication_type", "year", "team", "is_published")
    search_fields = ("title", "abstract", "team__title")
    list_filter = ("publication_type", "year", "is_published", "team")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("team", "created_by")
    inlines = [PublicationAuthorInline]


@admin.register(PublicationAuthor)
class PublicationAuthorAdmin(ModelAdmin):
    list_display = ("member", "publication", "order")
    search_fields = ("member__full_name", "publication__title")
    list_filter = ("publication",)
    autocomplete_fields = ("member", "publication")
