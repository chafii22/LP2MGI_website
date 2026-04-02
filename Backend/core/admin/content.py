from django.contrib import admin
from unfold.admin import ModelAdmin

from core.admin.inlines import GalleryImageInline
from core.models import ContentPage, Event, Gallery, GalleryImage


@admin.register(Event)
class EventAdmin(ModelAdmin):
    list_display = ("title", "event_date", "location", "is_published")
    search_fields = ("title", "description", "location")
    list_filter = ("is_published", "event_date")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("created_by",)


@admin.register(ContentPage)
class ContentPageAdmin(ModelAdmin):
    list_display = ("title", "slug", "is_published", "updated_at")
    search_fields = ("title", "content")
    list_filter = ("is_published",)
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("created_by",)


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
    list_display = ("gallery", "order", "is_active", "updated_at")
    search_fields = ("gallery__title", "caption", "image_url")
    list_filter = ("is_active", "gallery")
    autocomplete_fields = ("gallery",)
