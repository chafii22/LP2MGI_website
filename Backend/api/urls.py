from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ContactMessageCreateView,
    ContentPageViewSet,
    EventViewSet,
    GalleryViewSet,
    HomeContentView,
    NewsPostViewSet,
    OverviewContentView,
    ProjectViewSet,
    PublicationViewSet,
    TeamViewSet,
    test_api,
)

router = DefaultRouter()
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"news", NewsPostViewSet, basename="news")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"publications", PublicationViewSet, basename="publication")
router.register(r"events", EventViewSet, basename="event")
router.register(r"pages", ContentPageViewSet, basename="content-page")
router.register(r"galleries", GalleryViewSet, basename="gallery")

urlpatterns = [
    path("test/", test_api, name="test-api"),
    path("home/", HomeContentView.as_view(), name="home-content"),
    path("overview/", OverviewContentView.as_view(), name="overview-content"),
    path("contact/", ContactMessageCreateView.as_view(), name="contact-message-create"),
    path("", include(router.urls)),
]
