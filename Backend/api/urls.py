from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactMessageCreateView, HomeContentView, NewsPostViewSet, TeamViewSet, test_api

router = DefaultRouter()
router.register(r"teams", TeamViewSet, basename="team")
router.register(r"news", NewsPostViewSet, basename="news")

urlpatterns = [
    path("test/", test_api, name="test-api"),
    path("home/", HomeContentView.as_view(), name="home-content"),
    path("contact/", ContactMessageCreateView.as_view(), name="contact-message-create"),
    path("", include(router.urls)),
]