from django.db import migrations


def move_home_hero_data_to_slides(apps, schema_editor):
    HomeHero = apps.get_model("core", "HomeHero")
    HomeHeroSlide = apps.get_model("core", "HomeHeroSlide")

    for hero in HomeHero.objects.all().iterator():
        related_slides = HomeHeroSlide.objects.filter(hero_id=hero.id)

        if not related_slides.exists():
            related_slides = [
                HomeHeroSlide.objects.create(
                    hero_id=hero.id,
                    small_label=hero.subtitle or "",
                    big_title=hero.title or "",
                    short_description=hero.description or "",
                    media_type="illustration" if hero.background_image_url else "none",
                    illustration=str(hero.background_image_url) if hero.background_image_url else "",
                    use_abstract_background=not bool(hero.background_image_url),
                    primary_button_label=hero.button_label or "",
                    primary_button_target_type="url",
                    primary_button_url=hero.button_link or "",
                    order=0,
                    is_active=hero.is_active,
                )
            ]

        for slide in related_slides:
            update_fields = []

            if not slide.small_label and hero.subtitle:
                slide.small_label = hero.subtitle
                update_fields.append("small_label")

            if not slide.big_title and hero.title:
                slide.big_title = hero.title
                update_fields.append("big_title")

            if not slide.short_description and hero.description:
                slide.short_description = hero.description
                update_fields.append("short_description")

            if not slide.primary_button_label and hero.button_label:
                slide.primary_button_label = hero.button_label
                update_fields.append("primary_button_label")

            if not slide.primary_button_url and hero.button_link:
                slide.primary_button_target_type = "url"
                slide.primary_button_url = hero.button_link
                update_fields.extend(["primary_button_target_type", "primary_button_url"])

            if (
                (not slide.illustration)
                and hero.background_image_url
                and slide.media_type in {"", "none"}
            ):
                slide.illustration = str(hero.background_image_url)
                slide.media_type = "illustration"
                slide.use_abstract_background = False
                update_fields.extend(["illustration", "media_type", "use_abstract_background"])

            if (
                slide.media_type == "none"
                and not slide.illustration
                and not slide.video_file
                and not slide.use_abstract_background
            ):
                slide.use_abstract_background = True
                update_fields.append("use_abstract_background")

            if update_fields:
                slide.save(update_fields=sorted(set(update_fields)))


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_repair_homeheroslide_schema"),
    ]

    operations = [
        migrations.RunPython(move_home_hero_data_to_slides, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="homeheroslide",
            name="hero",
        ),
        migrations.DeleteModel(
            name="HomeHero",
        ),
    ]
