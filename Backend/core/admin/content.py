from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from core.admin.inlines import GalleryImageInline
from core.models import ContentPage, Event, Gallery, GalleryImage, OverviewContent


@admin.register(Event)
class EventAdmin(ModelAdmin):
    list_display = ("title", "event_date", "location", "is_published")
    search_fields = ("title", "description", "location")
    list_filter = ("is_published", "event_date")
    date_hierarchy = "event_date"
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("created_by",)


@admin.register(ContentPage)
class ContentPageAdmin(ModelAdmin):
    list_display = ("title", "slug", "is_published", "updated_at")
    search_fields = ("title", "content")
    list_filter = ("is_published",)
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("created_by",)


@admin.register(OverviewContent)
class OverviewContentAdmin(ModelAdmin):
    list_display = ("header_title", "director_name", "is_active", "updated_at")
    search_fields = ("header_title", "header_subtitle", "director_name", "director_role")
    list_filter = ("is_active",)
    readonly_fields = ("director_photo_preview",)
    fields = (
        "header_subtitle",
        "header_title",
        "header_description",
        "director_name",
        "director_role",
        "director_photo",
        "director_photo_preview",
        "director_intro",
        "director_quote",
        "director_body",
        "mission_title",
        "mission_description",
        "mission_points",
        "vision_title",
        "vision_description",
        "vision_points",
        "is_active",
    )

    def director_photo_preview(self, obj):
        if not obj or not obj.director_photo:
            return "No image"

        image_src = str(obj.director_photo)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.director_photo.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 120px; border-radius: 8px;" />',
            image_src,
            obj.director_name or obj.header_title,
        )

    director_photo_preview.short_description = "Director photo preview"


@admin.register(Gallery)
class GalleryAdmin(ModelAdmin):
    list_display = ("title", "slug", "is_published", "updated_at")
    search_fields = ("title", "description")
    list_filter = ("is_published",)
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("created_by",)
    inlines = [GalleryImageInline]


@admin.register(GalleryImage)
class GalleryImageAdmin(ModelAdmin):
    list_display = ("image_preview", "gallery", "order", "is_active", "updated_at")
    search_fields = ("gallery__title", "caption", "image_url")
    list_filter = ("is_active", "gallery")
    autocomplete_fields = ("gallery",)
    readonly_fields = ("image_preview",)
    fields = ("gallery", "image_url", "image_preview", "caption", "order", "is_active")

    def image_preview(self, obj):
        if not obj or not obj.image_url:
            return "No image"

        image_src = str(obj.image_url)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.image_url.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 72px; border-radius: 8px;" />',
            image_src,
            obj.caption or "Gallery image",
        )

    image_preview.short_description = "Image preview"
