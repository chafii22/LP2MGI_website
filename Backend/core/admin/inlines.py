from django.utils.html import format_html
from unfold.admin import TabularInline

from core.models import GalleryImage, ProjectParticipation, PublicationAuthor, TeamMembership


class TeamMembershipInline(TabularInline):
    model = TeamMembership
    extra = 1
    autocomplete_fields = ("member",)
    fields = ("member", "is_leader", "order")
    ordering = ("order", "id")


class ProjectParticipationInline(TabularInline):
    model = ProjectParticipation
    extra = 1
    autocomplete_fields = ("member",)
    fields = ("member", "role")


class PublicationAuthorInline(TabularInline):
    model = PublicationAuthor
    extra = 1
    autocomplete_fields = ("member",)
    fields = ("member", "order")
    ordering = ("order", "id")


class GalleryImageInline(TabularInline):
    model = GalleryImage
    extra = 1
    readonly_fields = ("image_preview",)
    fields = ("image_url", "image_preview", "caption", "order", "is_active")
    ordering = ("order", "id")

    def image_preview(self, obj):
        if not obj or not obj.image_url:
            return "No image"

        image_src = str(obj.image_url)
        if not image_src.startswith(("http://", "https://")):
            image_src = obj.image_url.url

        return format_html(
            '<img src="{}" alt="{}" style="max-height: 56px; border-radius: 6px;" />',
            image_src,
            obj.caption or "Gallery image",
        )

    image_preview.short_description = "Preview"
