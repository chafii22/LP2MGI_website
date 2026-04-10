from rest_framework import serializers

from core.models import (
    ContactMessage,
    ContentPage,
    Event,
    Gallery,
    GalleryImage,
    HomeHero,
    HomeMetric,
    Member,
    NewsPost,
    OverviewContent,
    Project,
    ProjectParticipation,
    Publication,
    PublicationAuthor,
    SiteSettings,
    Team,
)


def _build_media_url(request, media_field) -> str:
    if not media_field:
        return ""

    raw_value = str(media_field)
    if raw_value.startswith(("http://", "https://")):
        return raw_value

    try:
        media_url = media_field.url
    except (AttributeError, ValueError):
        return raw_value

    if request is None:
        return media_url

    return request.build_absolute_uri(media_url)


class MemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            "id",
            "full_name",
            "role",
            "expertise",
            "email",
            "photo_url",
            "biography",
            "highlight_quote",
            "research_interests",
            "milestones",
            "researchgate_url",
            "google_scholar_url",
            "orcid_url",
            "is_active",
        ]

    def get_photo_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.photo_url)


class TeamListSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "slug",
            "title",
            "short_name",
            "tags",
            "lead_name",
            "focus",
            "domain",
            "overview",
            "order",
            "is_active",
            "members_count",
        ]


class TeamMembershipMemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    is_leader = serializers.BooleanField(source="team_memberships.is_leader", read_only=True)
    order = serializers.IntegerField(source="team_memberships.order", read_only=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "full_name",
            "role",
            "expertise",
            "email",
            "photo_url",
            "biography",
            "highlight_quote",
            "research_interests",
            "milestones",
            "researchgate_url",
            "google_scholar_url",
            "orcid_url",
            "is_active",
            "is_leader",
            "order",
        ]

    def get_photo_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.photo_url)


class TeamDetailSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            "id",
            "slug",
            "title",
            "short_name",
            "tags",
            "lead_name",
            "focus",
            "domain",
            "overview",
            "order",
            "is_active",
            "members",
        ]

    def get_members(self, obj):
        request = self.context.get("request")
        memberships = getattr(obj, "prefetched_memberships", None)
        if memberships is None:
            memberships = obj.memberships.select_related("member").order_by("order", "id")

        members = []
        for membership in memberships:
            member = membership.member
            members.append(
                {
                    "id": member.id,
                    "full_name": member.full_name,
                    "role": member.role,
                    "expertise": member.expertise,
                    "email": member.email,
                    "photo_url": _build_media_url(request, member.photo_url),
                    "biography": member.biography,
                    "highlight_quote": member.highlight_quote,
                    "research_interests": member.research_interests,
                    "milestones": member.milestones,
                    "researchgate_url": member.researchgate_url,
                    "google_scholar_url": member.google_scholar_url,
                    "orcid_url": member.orcid_url,
                    "is_active": member.is_active,
                    "is_leader": membership.is_leader,
                    "order": membership.order,
                }
            )
        return members


class NewsPostSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(read_only=True, slug_field="slug")
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="slug")
    authors = MemberSerializer(many=True, read_only=True)

    class Meta:
        model = NewsPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "body",
            "cover_image_url",
            "category",
            "tags",
            "authors",
            "published_at",
            "is_published",
            "is_featured",
            "created_at",
            "updated_at",
        ]

    def get_cover_image_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.cover_image_url)


class HomeHeroSerializer(serializers.ModelSerializer):
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomeHero
        fields = [
            "id",
            "subtitle",
            "title",
            "description",
            "button_label",
            "button_link",
            "background_image_url",
            "is_active",
        ]

    def get_background_image_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.background_image_url)


class HomeMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeMetric
        fields = ["id", "label", "value", "order", "is_active"]


class OverviewContentSerializer(serializers.ModelSerializer):
    director_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = OverviewContent
        fields = [
            "id",
            "header_subtitle",
            "header_title",
            "header_description",
            "director_name",
            "director_role",
            "director_photo_url",
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
            "created_at",
            "updated_at",
        ]

    def get_director_photo_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.director_photo)


class SiteSettingsSerializer(serializers.ModelSerializer):
    navbar_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            "navbar_title",
            "navbar_logo_url",
            "updated_at",
        ]

    def get_navbar_logo_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.navbar_logo)


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["full_name", "email", "subject", "message"]


class ProjectParticipantSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    role_in_project = serializers.CharField(source="project_participations.role", read_only=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "full_name",
            "role",
            "expertise",
            "email",
            "photo_url",
            "is_active",
            "role_in_project",
        ]

    def get_photo_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.photo_url)


class ProjectListSerializer(serializers.ModelSerializer):
    team_slug = serializers.SlugRelatedField(source="team", read_only=True, slug_field="slug")

    class Meta:
        model = Project
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "date_start",
            "date_end",
            "status",
            "team_slug",
            "is_active",
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    team = TeamListSerializer(read_only=True)
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "date_start",
            "date_end",
            "status",
            "team",
            "is_active",
            "participants",
            "created_at",
            "updated_at",
        ]

    def get_participants(self, obj):
        request = self.context.get("request")
        participations = getattr(obj, "prefetched_participations", None)
        if participations is None:
            participations = obj.participations.select_related("member").order_by("id")

        participants = []
        for participation in participations:
            member = participation.member
            participants.append(
                {
                    "id": member.id,
                    "full_name": member.full_name,
                    "role": member.role,
                    "expertise": member.expertise,
                    "email": member.email,
                    "photo_url": _build_media_url(request, member.photo_url),
                    "is_active": member.is_active,
                    "role_in_project": participation.role,
                }
            )
        return participants


class PublicationAuthorMemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    order = serializers.IntegerField(source="publication_links.order", read_only=True)

    class Meta:
        model = Member
        fields = [
            "id",
            "full_name",
            "role",
            "expertise",
            "email",
            "photo_url",
            "is_active",
            "order",
        ]

    def get_photo_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.photo_url)


class PublicationSerializer(serializers.ModelSerializer):
    team_slug = serializers.SlugRelatedField(source="team", read_only=True, slug_field="slug")
    authors = serializers.SerializerMethodField()

    class Meta:
        model = Publication
        fields = [
            "id",
            "slug",
            "title",
            "publication_type",
            "year",
            "abstract",
            "file_pdf_url",
            "team_slug",
            "is_published",
            "authors",
            "created_at",
            "updated_at",
        ]

    def get_authors(self, obj):
        request = self.context.get("request")
        author_links = getattr(obj, "prefetched_author_links", None)
        if author_links is None:
            author_links = obj.author_links.select_related("member").order_by("order", "id")

        authors = []
        for author_link in author_links:
            member = author_link.member
            authors.append(
                {
                    "id": member.id,
                    "full_name": member.full_name,
                    "role": member.role,
                    "expertise": member.expertise,
                    "email": member.email,
                    "photo_url": _build_media_url(request, member.photo_url),
                    "is_active": member.is_active,
                    "order": author_link.order,
                }
            )
        return authors


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "slug",
            "title",
            "event_date",
            "location",
            "description",
            "is_published",
            "created_at",
            "updated_at",
        ]


class ContentPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentPage
        fields = [
            "id",
            "slug",
            "title",
            "content",
            "is_published",
            "created_at",
            "updated_at",
        ]


class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = ["id", "image_url", "caption", "order", "is_active"]

    def get_image_url(self, obj):
        return _build_media_url(self.context.get("request"), obj.image_url)


class GallerySerializer(serializers.ModelSerializer):
    images = GalleryImageSerializer(many=True, read_only=True)

    class Meta:
        model = Gallery
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "is_published",
            "images",
            "created_at",
            "updated_at",
        ]