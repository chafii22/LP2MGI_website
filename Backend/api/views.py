from django.conf import settings
from django.db import OperationalError, ProgrammingError
from django.db.models import Count, Prefetch
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import status, viewsets
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
    MemberProfileAccessLink,
    MemberProfileAuditEvent,
    MemberProfileAuditLog,
    MemberProfileSubmission,
    MemberProfileSubmissionStatus,
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
    MemberEditableProfileSerializer,
    MemberProfileAuditLogSerializer,
    MemberProfileSubmissionCreateSerializer,
    MemberProfileSubmissionSerializer,
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


def _extract_client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def _resolve_access_link(token: str):
    return MemberProfileAccessLink.objects.select_related("member").filter(token=token, is_active=True).first()


class MemberProfileAccessView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, token: str):
        access_link = _resolve_access_link(token)
        if access_link is None:
            return Response({"detail": "Invalid member profile edit link."}, status=status.HTTP_404_NOT_FOUND)

        if access_link.is_expired:
            return Response({"detail": "This member profile edit link has expired."}, status=status.HTTP_410_GONE)

        access_link.last_used_at = timezone.now()
        access_link.save(update_fields=["last_used_at", "updated_at"])

        latest_submission = access_link.member.profile_submissions.select_related("reviewed_by").first()
        audit_entries = (
            access_link.member.profile_audit_logs.select_related("actor_user", "actor_member")
            .order_by("-created_at", "-id")[:20]
        )

        status_value = "pending_invitation"
        if latest_submission is not None:
            if latest_submission.status == MemberProfileSubmissionStatus.APPROVED:
                status_value = "active"
            else:
                status_value = latest_submission.status

        return Response(
            {
                "member": MemberEditableProfileSerializer(access_link.member, context={"request": request}).data,
                "status": status_value,
                "latest_submission": (
                    MemberProfileSubmissionSerializer(latest_submission, context={"request": request}).data
                    if latest_submission
                    else None
                ),
                "audit_log": MemberProfileAuditLogSerializer(audit_entries, many=True, context={"request": request}).data,
            }
        )


class MemberProfileSubmissionCreateView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, token: str):
        access_link = _resolve_access_link(token)
        if access_link is None:
            return Response({"detail": "Invalid member profile edit link."}, status=status.HTTP_404_NOT_FOUND)

        if access_link.is_expired:
            return Response({"detail": "This member profile edit link has expired."}, status=status.HTTP_410_GONE)

        serializer = MemberProfileSubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        member = access_link.member
        validated_data = dict(serializer.validated_data)
        photo_file = validated_data.pop("photo_file", None)
        remove_photo = bool(validated_data.pop("remove_photo", False))

        proposed_data = {}
        for field, value in validated_data.items():
            current_value = getattr(member, field, None)
            if current_value != value:
                proposed_data[field] = value

        if remove_photo and member.photo_url:
            proposed_data["__remove_photo"] = True

        if not proposed_data and not photo_file:
            return Response(
                {"detail": "No changes detected. Update at least one field before submitting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submission = MemberProfileSubmission.objects.create(
            member=member,
            submitted_by=member.full_name,
            submitted_from_ip=_extract_client_ip(request),
            proposed_data=proposed_data,
            proposed_photo=photo_file,
            status=MemberProfileSubmissionStatus.PENDING_APPROVAL,
        )

        MemberProfileAuditLog.record(
            member=member,
            submission=submission,
            event_type=MemberProfileAuditEvent.SUBMITTED,
            actor_member=member,
            details={
                "submitted_from_ip": submission.submitted_from_ip,
                "user_agent": request.META.get("HTTP_USER_AGENT", "")[:255],
                "submission_id": submission.pk,
                "photo_updated": bool(photo_file),
                "photo_removed": bool(proposed_data.get("__remove_photo")),
            },
        )

        return Response(
            {
                "id": submission.pk,
                "status": submission.status,
                "submitted_at": submission.submitted_at,
                "message": "Your update has been submitted and is pending admin approval.",
            },
            status=status.HTTP_201_CREATED,
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