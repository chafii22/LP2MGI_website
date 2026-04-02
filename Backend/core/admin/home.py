from django.contrib import admin
from unfold.admin import ModelAdmin

from core.models import HomeHero, HomeMetric


@admin.register(HomeHero)
class HomeHeroAdmin(ModelAdmin):
    list_display = ("title", "is_active", "updated_at")
    search_fields = ("title", "subtitle", "description")
    list_filter = ("is_active",)


@admin.register(HomeMetric)
class HomeMetricAdmin(ModelAdmin):
    list_display = ("label", "value", "is_active", "order")
    search_fields = ("label", "value")
    list_filter = ("is_active",)
    ordering = ("order", "id")
