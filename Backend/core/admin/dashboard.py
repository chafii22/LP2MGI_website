from django.contrib.auth import get_user_model
from django.urls import NoReverseMatch, reverse

from core.models import (
    ContactMessage,
    ContentPage,
    Event,
    Gallery,
    HomeHero,
    NewsPost,
    OverviewContent,
    Project,
    Publication,
    Team,
)


def _safe_reverse(name: str, fallback: str = "/admin/") -> str:
    try:
        return reverse(name)
    except NoReverseMatch:
        return fallback


def dashboard_callback(request, context):
    user_model = get_user_model()

    context["cms_stats"] = [
        {
            "label": "Published News",
            "value": NewsPost.objects.filter(is_published=True).count(),
            "meta": "Articles visible on the website",
            "url": _safe_reverse("admin:core_newspost_changelist"),
        },
        {
            "label": "Active Teams",
            "value": Team.objects.filter(is_active=True).count(),
            "meta": "Research teams currently highlighted",
            "url": _safe_reverse("admin:core_team_changelist"),
        },
        {
            "label": "Published Publications",
            "value": Publication.objects.filter(is_published=True).count(),
            "meta": "Scientific output available to visitors",
            "url": _safe_reverse("admin:core_publication_changelist"),
        },
        {
            "label": "Unread Messages",
            "value": ContactMessage.objects.filter(is_read=False).count(),
            "meta": "Pending messages from contact form",
            "url": _safe_reverse("admin:core_contactmessage_changelist"),
        },
    ]

    context["cms_sections"] = [
        {
            "title": "Homepage & Content",
            "description": "Update hero content, metrics, pages, events, and galleries.",
            "items": [
                {"title": "Hero", "url": _safe_reverse("admin:core_homehero_changelist")},
                {"title": "Site Settings", "url": _safe_reverse("admin:core_sitesettings_changelist")},
                {"title": "Overview", "url": _safe_reverse("admin:core_overviewcontent_changelist")},
                {"title": "Metrics", "url": _safe_reverse("admin:core_homemetric_changelist")},
                {"title": "Pages", "url": _safe_reverse("admin:core_contentpage_changelist")},
                {"title": "Events", "url": _safe_reverse("admin:core_event_changelist")},
                {"title": "Galleries", "url": _safe_reverse("admin:core_gallery_changelist")},
            ],
        },
        {
            "title": "Research",
            "description": "Manage teams, projects, and publications.",
            "items": [
                {"title": "Teams", "url": _safe_reverse("admin:core_team_changelist")},
                {"title": "Members", "url": _safe_reverse("admin:core_member_changelist")},
                {"title": "Projects", "url": _safe_reverse("admin:core_project_changelist")},
                {"title": "Publications", "url": _safe_reverse("admin:core_publication_changelist")},
            ],
        },
        {
            "title": "Communication",
            "description": "Moderate editorial content and incoming messages.",
            "items": [
                {"title": "News", "url": _safe_reverse("admin:core_newspost_changelist")},
                {"title": "Contact Messages", "url": _safe_reverse("admin:core_contactmessage_changelist")},
            ],
        },
        {
            "title": "System",
            "description": "User and permission management.",
            "items": [
                {
                    "title": "Users",
                    "url": _safe_reverse(
                        f"admin:{user_model._meta.app_label}_{user_model._meta.model_name}_changelist"
                    ),
                },
                {"title": "Groups", "url": _safe_reverse("admin:auth_group_changelist")},
            ],
        },
    ]

    context["recent_messages"] = ContactMessage.objects.filter(is_read=False).order_by("-created_at")[:5]
    context["dashboard_counts"] = {
        "home_hero": HomeHero.objects.count(),
        "overview_content": OverviewContent.objects.count(),
        "pages": ContentPage.objects.count(),
        "events": Event.objects.count(),
        "galleries": Gallery.objects.count(),
        "projects": Project.objects.count(),
    }
    return context
