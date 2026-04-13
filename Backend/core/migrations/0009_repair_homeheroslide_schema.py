from django.db import migrations


def repair_homeheroslide_schema(apps, schema_editor):
    connection = schema_editor.connection

    if connection.vendor != "postgresql":
        return

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = current_schema()
                  AND table_name = 'core_homeheroslide'
            )
            """
        )
        table_exists = cursor.fetchone()[0]

        if not table_exists:
            return

        cursor.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'core_homeheroslide'
            """
        )
        existing_columns = {row[0] for row in cursor.fetchall()}

        if "home_hero_id" in existing_columns and "hero_id" not in existing_columns:
            cursor.execute("ALTER TABLE core_homeheroslide RENAME COLUMN home_hero_id TO hero_id")

        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS small_label varchar(120) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS big_title varchar(255) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS media_type varchar(20) NOT NULL DEFAULT 'none'"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS illustration varchar(100) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS video_file varchar(100) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS use_abstract_background boolean NOT NULL DEFAULT false"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS primary_button_label varchar(80) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS primary_button_target_type varchar(10) NOT NULL DEFAULT 'url'"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS primary_button_url varchar(255) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS primary_button_file varchar(100) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS secondary_button_label varchar(80) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS secondary_button_target_type varchar(10) NOT NULL DEFAULT 'url'"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS secondary_button_url varchar(255) NOT NULL DEFAULT ''"
        )
        cursor.execute(
            "ALTER TABLE core_homeheroslide ADD COLUMN IF NOT EXISTS secondary_button_file varchar(100) NOT NULL DEFAULT ''"
        )

        if "image_url" in existing_columns:
            cursor.execute(
                """
                UPDATE core_homeheroslide
                SET illustration = image_url
                WHERE COALESCE(illustration, '') = ''
                  AND COALESCE(image_url, '') <> ''
                """
            )

        if "caption" in existing_columns:
            cursor.execute(
                """
                UPDATE core_homeheroslide
                SET short_description = caption
                WHERE COALESCE(short_description, '') = ''
                  AND COALESCE(caption, '') <> ''
                """
            )

        cursor.execute(
            """
            UPDATE core_homeheroslide
            SET media_type = CASE
                WHEN COALESCE(illustration, '') <> '' THEN 'illustration'
                ELSE 'none'
            END
            WHERE COALESCE(media_type, '') = ''
               OR media_type NOT IN ('illustration', 'video', 'none')
            """
        )

        cursor.execute(
            """
            UPDATE core_homeheroslide
            SET use_abstract_background = CASE
                WHEN media_type = 'none' AND COALESCE(illustration, '') = '' AND COALESCE(video_file, '') = ''
                    THEN true
                ELSE false
            END
            """
        )

        cursor.execute("ALTER TABLE core_homeheroslide DROP COLUMN IF EXISTS image_url")
        cursor.execute("ALTER TABLE core_homeheroslide DROP COLUMN IF EXISTS caption")


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_homeheroslide"),
    ]

    operations = [
        migrations.RunPython(repair_homeheroslide_schema, migrations.RunPython.noop),
    ]
