from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from core.models import HomeHero, HomeMetric, SiteSettings


@admin.register(HomeHero)
class HomeHeroAdmin(ModelAdmin):
    list_display = ("title", "is_active", "updated_at")
    search_fields = ("title", "subtitle", "description")
    list_filter = ("is_active",)
    readonly_fields = ("background_image_preview",)
    fields = (
        "subtitle",
        "title",
        "description",
        "button_label",
        "button_link",
        "background_image_url",
        "background_image_preview",
        "is_active",
    )

    def background_image_preview(self, obj):
        if not obj or not obj.background_image_url:
            return "No image"

        image_src = str(obj.background_image_url)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.background_image_url.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 120px; border-radius: 8px;" />',
            image_src,
            obj.title,
        )

    background_image_preview.short_description = "Background preview"


@admin.register(HomeMetric)
class HomeMetricAdmin(ModelAdmin):
    list_display = ("label", "value", "is_active", "order")
    search_fields = ("label", "value")
    list_filter = ("is_active",)
    ordering = ("order", "id")


@admin.register(SiteSettings)
class SiteSettingsAdmin(ModelAdmin):
    list_display = ("navbar_title", "logo_preview", "updated_at")
    readonly_fields = ("logo_preview",)
    fields = ("navbar_title", "navbar_logo", "logo_preview")

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def logo_preview(self, obj):
        if not obj or not obj.navbar_logo:
            return "No image"

        image_src = str(obj.navbar_logo)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.navbar_logo.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 72px; border-radius: 8px;" />',
            image_src,
            obj.navbar_title,
        )

    logo_preview.short_description = "Logo preview"
