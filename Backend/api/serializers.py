from rest_framework import serializers

from core.models import ContactMessage, HomeHero, HomeMetric, Member, NewsPost, Team


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
            member.team_memberships = membership
            members.append(member)
        return TeamMembershipMemberSerializer(members, many=True).data


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