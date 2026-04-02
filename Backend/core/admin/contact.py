from django.contrib import admin
from unfold.admin import ModelAdmin

from core.models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    list_display = ("full_name", "email", "subject", "is_read", "created_at", "replied_at")
    search_fields = ("full_name", "email", "subject", "message")
    list_filter = ("is_read", "created_at", "replied_at")
    readonly_fields = ("full_name", "email", "subject", "message", "created_at", "updated_at")
