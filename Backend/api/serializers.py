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
    Project,
    ProjectParticipation,
    Publication,
    PublicationAuthor,
    Team,
)


class MemberSerializer(serializers.ModelSerializer):
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
        ]


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
            "is_active",
            "is_leader",
            "order",
        ]


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
                    "photo_url": member.photo_url,
                    "is_active": member.is_active,
                    "is_leader": membership.is_leader,
                    "order": membership.order,
                }
            )
        return members


class NewsPostSerializer(serializers.ModelSerializer):
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


class HomeHeroSerializer(serializers.ModelSerializer):
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


class HomeMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeMetric
        fields = ["id", "label", "value", "order", "is_active"]


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["full_name", "email", "subject", "message"]


class ProjectParticipantSerializer(serializers.ModelSerializer):
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
                    "photo_url": member.photo_url,
                    "is_active": member.is_active,
                    "role_in_project": participation.role,
                }
            )
        return participants


class PublicationAuthorMemberSerializer(serializers.ModelSerializer):
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
                    "photo_url": member.photo_url,
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
    class Meta:
        model = GalleryImage
        fields = ["id", "image_url", "caption", "order", "is_active"]


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