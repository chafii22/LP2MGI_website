from django.conf import settings
from django.db import OperationalError, ProgrammingError
from django.db.models import Count, Prefetch
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import (
    ContentPage,
    Event,
    Gallery,
    HomeHeroSlide,
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
    TeamMembership,
)

from .serializers import (
    ContentPageSerializer,
    ContactMessageCreateSerializer,
    EventSerializer,
    GallerySerializer,
    HomeHeroSlideSerializer,
    HomeMetricSerializer,
    NewsPostSerializer,
    OverviewContentSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    PublicationSerializer,
    SiteSettingsSerializer,
    TeamDetailSerializer,
    TeamListSerializer,
)


API_CACHE_TIMEOUT = getattr(settings, "API_CACHE_TIMEOUT", 60)


@api_view(["GET"])
def test_api(request):
    return Response({"message": "Hello from Django API", "status": "success"})


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
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
                    to_attr="prefetched_memberships",
                )
            )
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TeamDetailSerializer
        return TeamListSerializer


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
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


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class HomeContentView(APIView):
    def get(self, request):
        hero_slides_queryset = HomeHeroSlide.objects.filter(is_active=True).order_by("order", "id")
        hero_slides = HomeHeroSlideSerializer(hero_slides_queryset, many=True, context={"request": request}).data

        metrics = HomeMetric.objects.filter(is_active=True).order_by("order", "id")
        featured_news = (
            NewsPost.objects.filter(is_published=True, is_featured=True)
            .select_related("category")
            .prefetch_related("tags", Prefetch("authors", queryset=Member.objects.filter(is_active=True)))
            .order_by("-published_at", "-created_at")[:6]
        )

        return Response(
            {
                "hero_slides": hero_slides,
                "metrics": HomeMetricSerializer(metrics, many=True, context={"request": request}).data,
                "featured_news": NewsPostSerializer(featured_news, many=True, context={"request": request}).data,
            }
        )


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class OverviewContentView(APIView):
    def get(self, request):
        overview = OverviewContent.objects.filter(is_active=True).order_by("-updated_at").first()
        if not overview:
            return Response(None)

        return Response(OverviewContentSerializer(overview, context={"request": request}).data)


class SiteSettingsView(APIView):
    def get(self, request):
        try:
            site_settings, _ = SiteSettings.objects.get_or_create(pk=1, defaults={"navbar_title": "LP2MGI"})
        except (OperationalError, ProgrammingError):
            return Response(
                {
                    "navbar_title": "LP2MGI",
                    "navbar_logo_url": "",
                    "updated_at": None,
                }
            )

        return Response(SiteSettingsSerializer(site_settings, context={"request": request}).data)


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


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Project.objects.filter(is_active=True).select_related("team")

        if self.action == "retrieve":
            queryset = queryset.prefetch_related(
                Prefetch(
                    "participations",
                    queryset=ProjectParticipation.objects.select_related("member").order_by("id"),
                    to_attr="prefetched_participations",
                )
            )

        team = self.request.query_params.get("team")
        if team:
            queryset = queryset.filter(team__slug=team)

        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class PublicationViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    serializer_class = PublicationSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Publication.objects.filter(is_published=True).select_related("team").prefetch_related(
            Prefetch(
                "author_links",
                queryset=PublicationAuthor.objects.select_related("member").order_by("order", "id"),
                to_attr="prefetched_author_links",
            )
        )

        team = self.request.query_params.get("team")
        if team:
            queryset = queryset.filter(team__slug=team)

        return queryset.order_by("-year", "-created_at")


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class EventViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    serializer_class = EventSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Event.objects.filter(is_published=True).order_by("-event_date", "-created_at")


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class ContentPageViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    serializer_class = ContentPageSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return ContentPage.objects.filter(is_published=True).order_by("title")


@method_decorator(cache_page(API_CACHE_TIMEOUT), name="dispatch")
class GalleryViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = None
    serializer_class = GallerySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Gallery.objects.filter(is_published=True).prefetch_related("images").order_by("title")