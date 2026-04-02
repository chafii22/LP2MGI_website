from django.contrib import admin
from unfold.admin import ModelAdmin

from core.models import NewsCategory, NewsPost, NewsTag


@admin.register(NewsCategory)
class NewsCategoryAdmin(ModelAdmin):
    list_display = ("name", "slug", "updated_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(NewsTag)
class NewsTagAdmin(ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(NewsPost)
class NewsPostAdmin(ModelAdmin):
    list_display = ("title", "category", "is_published", "is_featured", "published_at")
    search_fields = ("title", "body", "excerpt")
    list_filter = ("category", "is_published", "is_featured")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags", "authors")
