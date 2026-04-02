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
    fields = ("image_url", "caption", "order", "is_active")
    ordering = ("order", "id")
