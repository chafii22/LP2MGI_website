from django.contrib import admin
from django.utils.html import format_html
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
    list_display = ("cover_image_preview", "title", "category", "is_published", "is_featured", "published_at")
    search_fields = ("title", "body", "excerpt")
    list_filter = ("category", "is_published", "is_featured", "published_at")
    date_hierarchy = "published_at"
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("category", "tags", "authors")
    readonly_fields = ("cover_image_preview", "frontend_path")
    fields = (
        "title",
        "slug",
        "frontend_path",
        "excerpt",
        "body",
        "cover_image_url",
        "cover_image_preview",
        "category",
        "tags",
        "authors",
        "published_at",
        "is_published",
        "is_featured",
    )

    def cover_image_preview(self, obj):
        if not obj or not obj.cover_image_url:
            return "No image"

        image_src = str(obj.cover_image_url)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.cover_image_url.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 72px; border-radius: 8px;" />',
            image_src,
            obj.title,
        )

    cover_image_preview.short_description = "Cover preview"

    def frontend_path(self, obj):
        if not obj or not obj.slug:
            return "Will be generated from title"
        return format_html("<code>/News/{}/</code>", obj.slug)

    frontend_path.short_description = "Frontend path"
