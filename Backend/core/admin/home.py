from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from core.models import HomeHeroSlide, HomeMetric, SiteSettings


@admin.register(HomeHeroSlide)
class HomeHeroSlideAdmin(ModelAdmin):
    list_display = ("big_title", "media_type", "is_active", "order", "updated_at")
    search_fields = ("big_title", "small_label", "short_description")
    list_filter = ("media_type", "is_active")
    ordering = ("order", "id")
    readonly_fields = ("illustration_preview", "video_preview")
    fields = (
        "small_label",
        "big_title",
        "short_description",
        "media_type",
        "illustration",
        "illustration_preview",
        "video_file",
        "video_preview",
        "use_abstract_background",
        "primary_button_label",
        "primary_button_target_type",
        "primary_button_url",
        "primary_button_file",
        "secondary_button_label",
        "secondary_button_target_type",
        "secondary_button_url",
        "secondary_button_file",
        "order",
        "is_active",
    )

    def illustration_preview(self, obj):
        if not obj or not obj.illustration:
            return "No image"

        image_src = str(obj.illustration)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.illustration.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 120px; border-radius: 8px;" />',
            image_src,
            obj.big_title,
        )

    illustration_preview.short_description = "Illustration preview"

    def video_preview(self, obj):
        if not obj or not obj.video_file:
            return "No video"

        video_src = str(obj.video_file)
        if not video_src.startswith(("http://", "https://")):
            video_src = obj.video_file.url

        return format_html(
            '<video src="{}" controls style="max-height: 120px; border-radius: 8px;"></video>',
            video_src,
        )

    video_preview.short_description = "Video preview"


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
