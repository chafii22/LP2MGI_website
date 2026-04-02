from django import forms

from core.models import Team


class TeamAdminForm(forms.ModelForm):
    tags = forms.CharField(
        required=False,
        help_text="Comma-separated tags. Example: ai, logistics, optimization",
    )

    class Meta:
        model = Team
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields["tags"].initial = ", ".join(self.instance.tags or [])

    def clean_tags(self):
        raw_tags = self.cleaned_data.get("tags", "")
        tags = [tag.strip() for tag in raw_tags.split(",") if tag.strip()]
        return list(dict.fromkeys(tags))
