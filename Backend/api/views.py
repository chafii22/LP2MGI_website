from django.db.models import Count, Prefetch
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import HomeHero, HomeMetric, Member, NewsPost, Team, TeamMembership

from .serializers import (
    ContactMessageCreateSerializer,
    HomeHeroSerializer,
    HomeMetricSerializer,
    NewsPostSerializer,
    TeamDetailSerializer,
    TeamListSerializer,
)


@api_view(["GET"])
def test_api(request):
    return Response({"message": "Hello from Django API", "status": "success"})


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Team.objects.filter(is_active=True).annotate(members_count=Count("memberships")).order_by("order", "title")
        if self.action == "retrieve":
            return queryset.prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=TeamMembership.objects.select_related("member").order_by("order", "id"),
                )
            )
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TeamDetailSerializer
        return TeamListSerializer


class NewsPostViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    serializer_class = NewsPostSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            NewsPost.objects.filter(is_published=True)
            .select_related("category")
            .prefetch_related("tags", Prefetch("authors", queryset=Member.objects.filter(is_active=True)))
            .order_by("-published_at", "-created_at")
        )

        featured = self.request.query_params.get("featured")
        if featured and featured.lower() in {"1", "true", "yes"}:
            queryset = queryset.filter(is_featured=True)

        return queryset


class HomeContentView(APIView):
    def get(self, request):
        hero = HomeHero.objects.filter(is_active=True).order_by("-updated_at").first()
        metrics = HomeMetric.objects.filter(is_active=True).order_by("order", "id")
        featured_news = (
            NewsPost.objects.filter(is_published=True, is_featured=True)
            .select_related("category")
            .prefetch_related("tags")
            .order_by("-published_at", "-created_at")[:6]
        )

        return Response(
            {
                "hero": HomeHeroSerializer(hero).data if hero else None,
                "metrics": HomeMetricSerializer(metrics, many=True).data,
                "featured_news": NewsPostSerializer(featured_news, many=True).data,
            }
        )


class ContactMessageCreateView(APIView):
    def post(self, request):
        serializer = ContactMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact_message = serializer.save()

        return Response(
            {
                "id": contact_message.id,
                "message": "Your message has been sent successfully.",
            },
            status=201,
        )