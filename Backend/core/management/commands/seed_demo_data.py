from datetime import date

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import (
    ContentPage,
    Event,
    Gallery,
    GalleryImage,
    HomeHero,
    HomeMetric,
    Member,
    NewsCategory,
    NewsPost,
    NewsTag,
    Project,
    ProjectParticipation,
    Publication,
    PublicationAuthor,
    Team,
    TeamMembership,
)


def build_email(full_name: str) -> str:
    parts = [segment.strip().lower() for segment in full_name.replace("'", "").split() if segment.strip()]
    return f"{'.'.join(parts)}@lp2mgi.ma"


class Command(BaseCommand):
    help = "Seed LP2MGI demo data using PDF-extracted names and fake fallback values"

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        admin_user = User.objects.filter(is_superuser=True).first()

        # Teams from the PV PDF + 1 fallback team to satisfy the requirement (4 teams).
        teams_data = [
            {
                "key": "MDS",
                "title": "Mechanics and System Dynamics",
                "short_name": "MDS",
                "tags": ["mechanics", "dynamics"],
                "lead_name": "NASSRAOUI Mohamed",
                "domain": "Mechanics",
                "focus": "Structures, dynamics, mechatronics, simulation, and mechanical forming",
                "overview": "Team focused on structural mechanics and the dynamics of mechanical systems.",
                "order": 1,
            },
            {
                "key": "PEME",
                "title": "Processes, Energy, Materials, and Environment",
                "short_name": "PEME",
                "tags": ["processes", "energy", "materials"],
                "lead_name": "KAMIL Noureddine",
                "domain": "Processes and Energy",
                "focus": "Process optimization, energy, innovative materials, and sustainable development",
                "overview": "Team focused on industrial processes, energy, and materials with environmental impact.",
                "order": 2,
            },
            {
                "key": "GIL",
                "title": "Industrial Engineering and Logistics",
                "short_name": "GIL",
                "tags": ["industrial", "logistics", "quality"],
                "lead_name": "BEN ALI Mohamed",
                "domain": "Industrial Engineering",
                "focus": "Logistics, quality, reliability, supply chain, and Industry 4.0",
                "overview": "Team focused on industrial optimization, logistics, and applied artificial intelligence.",
                "order": 3,
            },
            {
                "key": "INIA",
                "title": "Digital Computing and Applied AI",
                "short_name": "INIA",
                "tags": ["digital", "ai", "data"],
                "lead_name": "EL FASSI Samir",
                "domain": "Computer Science",
                "focus": "Applied AI, data science, and intelligent systems",
                "overview": "Complementary fallback team added to keep the required scope of 4 teams.",
                "order": 4,
            },
        ]

        target_team_short_names = [row["short_name"] for row in teams_data]

        # Deactivate older placeholder teams from previous demo seed runs.
        Team.objects.filter(
            title__in=[
                "Data Intelligence Team",
                "Software Systems Team",
                "Smart Networks Team",
                "Industrial Innovation Team",
            ]
        ).update(is_active=False)
        Team.objects.exclude(short_name__in=target_team_short_names).update(is_active=False)

        teams = {}
        for row in teams_data:
            team, _ = Team.objects.update_or_create(
                short_name=row["short_name"],
                defaults={
                    "title": row["title"],
                    "lead_name": row["lead_name"],
                    "tags": row["tags"],
                    "domain": row["domain"],
                    "focus": row["focus"],
                    "overview": row["overview"],
                    "order": row["order"],
                    "is_active": True,
                },
            )
            teams[row["key"]] = team

        # Members from PV PDF + fallback members for the 4th team.
        members_data = [
            ("NASSRAOUI Mohamed", "Professor", "MDS", True),
            ("ADRI Ahmed", "Professor", "MDS", False),
            ("RAHMOUNI Abdellatif", "Professor", "MDS", False),
            ("EL MOUFARI Meryem", "PhD Student", "MDS", False),
            ("MAINE Mohamed", "Engineer", "MDS", False),
            ("KAMIL Noureddine", "Professor", "PEME", True),
            ("CHAFI Mohammed", "Professor", "PEME", False),
            ("GUENNOUN Mohamed", "Professor", "PEME", False),
            ("TIZLIOUINE Abdeslam", "Professor", "PEME", False),
            ("ABOULIATIM Younes", "Professor", "PEME", False),
            ("KOUZBOUR Sanae", "PhD Student", "PEME", False),
            ("SEBBAHI Loubna", "Master Student", "PEME", False),
            ("SALHI Hayat", "Engineer", "PEME", False),
            ("BEN ALI Mohamed", "Professor", "GIL", True),
            ("IFASSIOUEN Hassan", "Professor", "GIL", False),
            ("SAHIB Amal Oudii", "PhD Student", "GIL", False),
            ("BOUAZIZ Abdelhak", "Engineer", "GIL", False),
            ("EL FASSI Samir", "Professor", "INIA", True),
            ("RAJI Hajar", "PhD Student", "INIA", False),
            ("BENNANI Othmane", "Engineer", "INIA", False),
        ]

        target_member_names = [row[0] for row in members_data]
        Member.objects.exclude(full_name__in=target_member_names).update(is_active=False)

        members = {}
        for idx, (full_name, role, team_key, is_leader) in enumerate(members_data, start=1):
            member, _ = Member.objects.update_or_create(
                full_name=full_name,
                defaults={
                    "role": role,
                    "expertise": f"Research and innovation in {teams[team_key].domain.lower()}.",
                    "email": build_email(full_name),
                    "photo_url": "",
                    "is_active": True,
                },
            )
            members[full_name] = member

            TeamMembership.objects.update_or_create(
                team=teams[team_key],
                member=member,
                defaults={
                    "is_leader": is_leader,
                    "order": idx,
                },
            )

        HomeHero.objects.update_or_create(
            title="Research and Innovation at LP2MGI",
            defaults={
                "subtitle": "LP2MGI Laboratory",
                "description": "Institutional website dedicated to showcasing the laboratory's scientific and technological activities.",
                "button_label": "Discover our activities",
                "button_link": "/Overview",
                "background_image_url": "",
                "is_active": True,
            },
        )

        metrics_data = [
            ("Research Teams", "4", 1),
            ("Members", str(Member.objects.filter(is_active=True).count()), 2),
            ("Publications", "120+", 3),
            ("Projects", "30+", 4),
        ]
        for label, value, order in metrics_data:
            HomeMetric.objects.update_or_create(
                label=label,
                defaults={"value": value, "order": order, "is_active": True},
            )

        category_conference, _ = NewsCategory.objects.get_or_create(name="Conference", slug="conference")
        category_event, _ = NewsCategory.objects.get_or_create(name="Event", slug="event")
        category_workshop, _ = NewsCategory.objects.get_or_create(name="Workshop", slug="workshop")

        tag_research, _ = NewsTag.objects.get_or_create(name="Research", slug="research")
        tag_lab, _ = NewsTag.objects.get_or_create(name="LP2MGI", slug="lp2mgi")
        tag_workshop, _ = NewsTag.objects.get_or_create(name="Workshop", slug="workshop")

        news_data = [
            (
                "LP2MGI Laboratory General Assembly",
                "Formation of teams, definition of research axes, and designation of leadership.",
                category_event,
                [tag_lab, tag_research],
                [members["CHAFI Mohammed"], members["TIZLIOUINE Abdeslam"]],
                True,
            ),
            (
                "LP2MGI Scientific Day",
                "Announcement of a scientific day centered on the work of MDS, PEME, and GIL teams.",
                category_conference,
                [tag_research],
                [members["NASSRAOUI Mohamed"], members["KAMIL Noureddine"], members["BEN ALI Mohamed"]],
                True,
            ),
            (
                "Industry 4.0 and AI Workshop",
                "Workshop dedicated to Industry 4.0, applied AI, and smart logistics.",
                category_workshop,
                [tag_workshop, tag_lab],
                [members["BEN ALI Mohamed"], members["EL FASSI Samir"]],
                False,
            ),
        ]

        target_news_titles = [row[0] for row in news_data]
        NewsPost.objects.exclude(title__in=target_news_titles).update(is_published=False)

        for title, excerpt, category, tags, authors, is_featured in news_data:
            post, _ = NewsPost.objects.update_or_create(
                title=title,
                defaults={
                    "excerpt": excerpt,
                    "body": excerpt,
                    "category": category,
                    "is_published": True,
                    "is_featured": is_featured,
                    "published_at": timezone.now(),
                },
            )
            post.tags.set(tags)
            post.authors.set(authors)

        publication_data = [
            (
                "Modeling and numerical simulation of mechanical systems",
                "journal",
                2025,
                teams["MDS"],
                [members["NASSRAOUI Mohamed"], members["ADRI Ahmed"]],
            ),
            (
                "Optimization and energy efficiency in industrial processes",
                "conference",
                2024,
                teams["PEME"],
                [members["KAMIL Noureddine"], members["TIZLIOUINE Abdeslam"]],
            ),
            (
                "Industry 4.0 and smart logistics",
                "journal",
                2026,
                teams["GIL"],
                [members["BEN ALI Mohamed"], members["IFASSIOUEN Hassan"]],
            ),
            (
                "Thesis on applied AI for industrial systems",
                "thesis",
                2026,
                teams["INIA"],
                [members["RAJI Hajar"], members["EL FASSI Samir"]],
            ),
        ]

        target_publication_titles = [row[0] for row in publication_data]
        Publication.objects.exclude(title__in=target_publication_titles).update(is_published=False)

        for title, publication_type, year, team, authors in publication_data:
            publication, _ = Publication.objects.update_or_create(
                title=title,
                defaults={
                    "publication_type": publication_type,
                    "year": year,
                    "abstract": f"Abstract: {title}.",
                    "file_pdf_url": "",
                    "team": team,
                    "is_published": True,
                    "created_by": admin_user,
                },
            )
            for order, author in enumerate(authors, start=1):
                PublicationAuthor.objects.update_or_create(
                    publication=publication,
                    member=author,
                    defaults={"order": order},
                )

        project_data = [
            (
                "Advanced mechatronics and robotics",
                teams["MDS"],
                date(2025, 1, 1),
                None,
                "ongoing",
                [members["NASSRAOUI Mohamed"], members["EL MOUFARI Meryem"]],
            ),
            (
                "Energy production and storage",
                teams["PEME"],
                date(2024, 3, 1),
                None,
                "ongoing",
                [members["KAMIL Noureddine"], members["ABOULIATIM Younes"]],
            ),
            (
                "Optimization of industrial processes",
                teams["GIL"],
                date(2024, 5, 1),
                date(2026, 1, 31),
                "ongoing",
                [members["BEN ALI Mohamed"], members["BOUAZIZ Abdelhak"]],
            ),
            (
                "Applied AI platform",
                teams["INIA"],
                date(2026, 1, 1),
                None,
                "planned",
                [members["EL FASSI Samir"], members["BENNANI Othmane"]],
            ),
        ]

        target_project_titles = [row[0] for row in project_data]
        Project.objects.exclude(title__in=target_project_titles).update(is_active=False)

        for title, team, date_start, date_end, status, participants in project_data:
            project, _ = Project.objects.update_or_create(
                title=title,
                defaults={
                    "description": f"Project: {title}.",
                    "team": team,
                    "date_start": date_start,
                    "date_end": date_end,
                    "status": status,
                    "is_active": True,
                    "created_by": admin_user,
                },
            )
            for participant in participants:
                ProjectParticipation.objects.update_or_create(
                    project=project,
                    member=participant,
                    defaults={"role": "Contributor"},
                )

        event_data = [
            ("LP2MGI Scientific Day", date(2026, 5, 20), "EST Casablanca"),
            ("Open Day", date(2026, 4, 18), "LP2MGI Campus"),
            ("LP2MGI Conference and Workshop", date(2026, 6, 12), "Innovation Hall"),
        ]
        target_event_titles = [row[0] for row in event_data]
        Event.objects.exclude(title__in=target_event_titles).update(is_published=False)

        for title, event_date, location in event_data:
            Event.objects.update_or_create(
                title=title,
                defaults={
                    "event_date": event_date,
                    "location": location,
                    "description": f"Event details: {title}.",
                    "is_published": True,
                    "created_by": admin_user,
                },
            )

        pages_data = [
            (
                "Overview",
                "Laboratory mission, partnerships, and institutional organization.",
            ),
            (
                "Platforms and Equipment",
                "Overview of experimental platforms, test benches, software, and digital resources.",
            ),
        ]
        for title, content in pages_data:
            ContentPage.objects.update_or_create(
                title=title,
                defaults={
                    "content": content,
                    "is_published": True,
                    "created_by": admin_user,
                },
            )

        gallery, _ = Gallery.objects.update_or_create(
            title="LP2MGI Highlights",
            defaults={
                "description": "Gallery of the laboratory's scientific activities, platforms, and events.",
                "is_published": True,
                "created_by": admin_user,
            },
        )

        image_urls = [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1581092919535-7146ff1a5907?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
        ]
        for idx, image_url in enumerate(image_urls, start=1):
            GalleryImage.objects.update_or_create(
                gallery=gallery,
                image_url=image_url,
                defaults={
                    "caption": f"LP2MGI visual #{idx}",
                    "order": idx,
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully from extracted PDF information with fake fallback values."))
