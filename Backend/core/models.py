import os
import secrets
from datetime import timedelta
from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone
from django.utils.text import slugify


def _dated_upload_path(prefix: str, reference: str, filename: str) -> str:
	ext = os.path.splitext(filename)[1].lower()
	if not ext:
		ext = ".bin"
	safe_reference = slugify(reference)[:60] or "file"
	date_path = timezone.now().strftime("%Y/%m")
	unique_suffix = uuid4().hex[:8]
	return f"{prefix}/{date_path}/{safe_reference}-{unique_suffix}{ext}"


def member_photo_upload_to(instance, filename: str) -> str:
	return _dated_upload_path("members/photos", instance.full_name, filename)


def member_submission_photo_upload_to(instance, filename: str) -> str:
	reference = instance.member.full_name if getattr(instance, "member_id", None) else "member-submission"
	return _dated_upload_path("members/submissions/photos", reference, filename)


def news_cover_upload_to(instance, filename: str) -> str:
	return _dated_upload_path("news/covers", instance.title, filename)


def home_hero_background_upload_to(instance, filename: str) -> str:
	# Kept for historical migration compatibility.
	return _dated_upload_path("home/hero", getattr(instance, "title", "hero"), filename)


def home_hero_slide_illustration_upload_to(instance, filename: str) -> str:
	title_ref = instance.big_title if instance and instance.big_title else "slide-illustration"
	return _dated_upload_path("home/hero/slides/illustrations", title_ref, filename)


def home_hero_slide_video_upload_to(instance, filename: str) -> str:
	title_ref = instance.big_title if instance and instance.big_title else "slide-video"
	return _dated_upload_path("home/hero/slides/videos", title_ref, filename)


def home_hero_slide_button_file_upload_to(instance, filename: str) -> str:
	title_ref = instance.big_title if instance and instance.big_title else "slide-button-file"
	return _dated_upload_path("home/hero/slides/buttons", title_ref, filename)


def overview_director_photo_upload_to(instance, filename: str) -> str:
	return _dated_upload_path("overview/director", instance.director_name or instance.header_title or "director", filename)


def gallery_image_upload_to(instance, filename: str) -> str:
	gallery_title = instance.gallery.title if instance.gallery_id else "gallery"
	return _dated_upload_path("galleries/images", gallery_title, filename)


def site_logo_upload_to(instance, filename: str) -> str:
	brand_reference = instance.navbar_title or "site-logo"
	return _dated_upload_path("site/logo", brand_reference, filename)


class TimeStampedModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		abstract = True


class Team(TimeStampedModel):
	slug = models.SlugField(max_length=120, unique=True, blank=True)
	title = models.CharField(max_length=200)
	short_name = models.CharField(max_length=20, blank=True)
	tags = models.JSONField(default=list, blank=True)
	lead_name = models.CharField(max_length=180, blank=True)
	domain = models.CharField(max_length=180, blank=True)
	focus = models.CharField(max_length=180, blank=True)
	overview = models.TextField(blank=True)
	is_active = models.BooleanField(default=True)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "title"]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "team"
			slug = base_slug
			index = 2
			while Team.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class MemberRole(models.TextChoices):
	PROFESSOR = "Professor", "Professor"
	PHD_STUDENT = "PhD Student", "PhD Student"
	ENGINEER = "Engineer", "Engineer"
	MASTER_STUDENT = "Master Student", "Master Student"


class Member(TimeStampedModel):
	full_name = models.CharField(max_length=180)
	role = models.CharField(max_length=40, choices=MemberRole.choices)
	expertise = models.CharField(max_length=255, blank=True)
	email = models.EmailField(blank=True)
	photo_url = models.ImageField(upload_to=member_photo_upload_to, blank=True)
	biography = models.TextField(blank=True)
	highlight_quote = models.CharField(max_length=280, blank=True)
	research_interests = models.JSONField(default=list, blank=True)
	milestones = models.JSONField(default=list, blank=True)
	researchgate_url = models.URLField(blank=True)
	google_scholar_url = models.URLField(blank=True)
	orcid_url = models.URLField(blank=True)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["full_name"]

	def __str__(self):
		return self.full_name


MEMBER_PROFILE_EDITABLE_FIELDS = (
	"full_name",
	"role",
	"expertise",
	"email",
	"biography",
	"highlight_quote",
	"research_interests",
	"milestones",
	"researchgate_url",
	"google_scholar_url",
	"orcid_url",
)


class MemberProfileSubmissionStatus(models.TextChoices):
	PENDING_APPROVAL = "pending_approval", "Pending Approval"
	CHANGES_REQUESTED = "changes_requested", "Changes Requested"
	APPROVED = "approved", "Approved"


class MemberProfileAuditEvent(models.TextChoices):
	LINK_REGENERATED = "link_regenerated", "Link Regenerated"
	SUBMITTED = "submitted", "Submitted"
	APPROVED = "approved", "Approved"
	CHANGES_REQUESTED = "changes_requested", "Changes Requested"


class MemberProfileAccessLink(TimeStampedModel):
	member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name="profile_access_link")
	token = models.CharField(max_length=96, unique=True, db_index=True, blank=True)
	expires_at = models.DateTimeField(null=True, blank=True)
	is_active = models.BooleanField(default=True)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="generated_member_profile_links",
	)
	last_used_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		verbose_name = "Member profile access link"
		verbose_name_plural = "Member profile access links"

	def __str__(self):
		return f"Edit link for {self.member.full_name}"

	@property
	def is_expired(self) -> bool:
		if not self.expires_at:
			return False
		return self.expires_at <= timezone.now()

	def regenerate(self, *, created_by=None, expires_in_days: int = 30) -> str:
		self.token = secrets.token_urlsafe(48)
		self.expires_at = timezone.now() + timedelta(days=expires_in_days)
		self.is_active = True
		if created_by is not None:
			self.created_by = created_by
		self.save()

		MemberProfileAuditLog.record(
			member=self.member,
			event_type=MemberProfileAuditEvent.LINK_REGENERATED,
			actor_user=created_by,
			details={"expires_at": self.expires_at.isoformat() if self.expires_at else None},
		)
		return self.token

	def save(self, *args, **kwargs):
		if not self.token:
			self.token = secrets.token_urlsafe(48)
		if self.expires_at is None:
			self.expires_at = timezone.now() + timedelta(days=30)
		super().save(*args, **kwargs)


class MemberProfileSubmission(TimeStampedModel):
	member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="profile_submissions")
	submitted_by = models.CharField(max_length=180, blank=True)
	submitted_from_ip = models.GenericIPAddressField(null=True, blank=True)
	proposed_photo = models.ImageField(upload_to=member_submission_photo_upload_to, blank=True)
	status = models.CharField(
		max_length=32,
		choices=MemberProfileSubmissionStatus.choices,
		default=MemberProfileSubmissionStatus.PENDING_APPROVAL,
		db_index=True,
	)
	proposed_data = models.JSONField(default=dict, blank=True)
	admin_comment = models.TextField(blank=True)
	submitted_at = models.DateTimeField(auto_now_add=True)
	reviewed_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="member_profile_reviews",
	)
	reviewed_at = models.DateTimeField(null=True, blank=True)
	approved_at = models.DateTimeField(null=True, blank=True)
	applied_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ["-submitted_at", "-id"]

	def __str__(self):
		return f"Submission #{self.pk} for {self.member.full_name}"

	def _apply_member_changes(self):
		for field in MEMBER_PROFILE_EDITABLE_FIELDS:
			if field in self.proposed_data:
				setattr(self.member, field, self.proposed_data[field])

		if self.proposed_data.get("__remove_photo"):
			if self.member.photo_url:
				self.member.photo_url.delete(save=False)
			self.member.photo_url = ""
		elif self.proposed_photo:
			self.member.photo_url = self.proposed_photo

		self.member.save()

	def approve(self, *, reviewer):
		if self.status != MemberProfileSubmissionStatus.PENDING_APPROVAL:
			raise ValidationError("Only pending submissions can be approved.")

		with transaction.atomic():
			self._apply_member_changes()
			now = timezone.now()
			self.status = MemberProfileSubmissionStatus.APPROVED
			self.reviewed_by = reviewer
			self.reviewed_at = now
			self.approved_at = now
			self.applied_at = now
			if not self.submitted_by:
				self.submitted_by = self.member.full_name
			self.save(
				update_fields=[
					"status",
					"reviewed_by",
					"reviewed_at",
					"approved_at",
					"applied_at",
					"submitted_by",
					"updated_at",
				]
			)

			MemberProfileAuditLog.record(
				member=self.member,
				submission=self,
				event_type=MemberProfileAuditEvent.APPROVED,
				actor_user=reviewer,
				details={"approved_submission_id": self.pk},
			)

	def request_changes(self, *, reviewer, comment: str = ""):
		if self.status != MemberProfileSubmissionStatus.PENDING_APPROVAL:
			raise ValidationError("Only pending submissions can be marked as changes requested.")

		now = timezone.now()
		self.status = MemberProfileSubmissionStatus.CHANGES_REQUESTED
		self.reviewed_by = reviewer
		self.reviewed_at = now
		if comment:
			self.admin_comment = comment
		self.save(update_fields=["status", "reviewed_by", "reviewed_at", "admin_comment", "updated_at"])

		MemberProfileAuditLog.record(
			member=self.member,
			submission=self,
			event_type=MemberProfileAuditEvent.CHANGES_REQUESTED,
			actor_user=reviewer,
			details={"comment": self.admin_comment},
		)

	def save(self, *args, **kwargs):
		if not self.submitted_by:
			self.submitted_by = self.member.full_name
		super().save(*args, **kwargs)


class MemberProfileAuditLog(TimeStampedModel):
	member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="profile_audit_logs")
	submission = models.ForeignKey(
		MemberProfileSubmission,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="audit_logs",
	)
	event_type = models.CharField(max_length=40, choices=MemberProfileAuditEvent.choices, db_index=True)
	actor_member = models.ForeignKey(
		Member,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="member_profile_actor_logs",
	)
	actor_user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="member_profile_actor_logs",
	)
	actor_label = models.CharField(max_length=180, blank=True)
	details = models.JSONField(default=dict, blank=True)

	class Meta:
		ordering = ["-created_at", "-id"]

	def __str__(self):
		return f"{self.get_event_type_display()} - {self.member.full_name}"

	@classmethod
	def record(
		cls,
		*,
		member,
		event_type: str,
		submission=None,
		actor_member=None,
		actor_user=None,
		actor_label: str = "",
		details=None,
	):
		resolved_label = actor_label
		if not resolved_label and actor_user is not None:
			resolved_label = actor_user.get_username()
		if not resolved_label and actor_member is not None:
			resolved_label = actor_member.full_name

		return cls.objects.create(
			member=member,
			submission=submission,
			event_type=event_type,
			actor_member=actor_member,
			actor_user=actor_user,
			actor_label=resolved_label,
			details=details or {},
		)


class TeamMembership(TimeStampedModel):
	team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
	member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="team_memberships")
	is_leader = models.BooleanField(default=False)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]
		constraints = [
			models.UniqueConstraint(fields=["team", "member"], name="unique_team_member"),
		]

	def __str__(self):
		return f"{self.member.full_name} in {self.team.title}"


class NewsCategory(TimeStampedModel):
	name = models.CharField(max_length=80, unique=True)
	slug = models.SlugField(max_length=80, unique=True)

	class Meta:
		verbose_name_plural = "News categories"
		ordering = ["name"]

	def __str__(self):
		return self.name


class NewsTag(TimeStampedModel):
	name = models.CharField(max_length=80, unique=True)
	slug = models.SlugField(max_length=80, unique=True)

	def __str__(self):
		return self.name


class NewsPost(TimeStampedModel):
	title = models.CharField(max_length=255)
	slug = models.SlugField(max_length=255, unique=True, blank=True)
	excerpt = models.TextField(blank=True)
	body = models.TextField(blank=True)
	cover_image_url = models.ImageField(upload_to=news_cover_upload_to, blank=True)
	category = models.ForeignKey(
		NewsCategory,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="posts",
	)
	tags = models.ManyToManyField(NewsTag, blank=True, related_name="posts")
	authors = models.ManyToManyField(Member, blank=True, related_name="news_posts")
	published_at = models.DateTimeField(null=True, blank=True)
	is_published = models.BooleanField(default=False)
	is_featured = models.BooleanField(default=False)

	class Meta:
		ordering = ["-published_at", "-created_at"]
		indexes = [
			models.Index(fields=["is_published"]),
			models.Index(fields=["published_at"]),
		]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "news"
			slug = base_slug
			index = 2
			while NewsPost.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class HeroSlideMediaType(models.TextChoices):
	ILLUSTRATION = "illustration", "Illustration"
	VIDEO = "video", "Video"
	NONE = "none", "None"


class HeroButtonTargetType(models.TextChoices):
	URL = "url", "URL"
	FILE = "file", "File"


class HomeHeroSlide(TimeStampedModel):
	small_label = models.CharField(max_length=120, blank=True)
	big_title = models.CharField(max_length=255)
	short_description = models.TextField(blank=True)
	media_type = models.CharField(max_length=20, choices=HeroSlideMediaType.choices, default=HeroSlideMediaType.NONE)
	illustration = models.ImageField(upload_to=home_hero_slide_illustration_upload_to, blank=True)
	video_file = models.FileField(upload_to=home_hero_slide_video_upload_to, blank=True)
	use_abstract_background = models.BooleanField(default=False)
	primary_button_label = models.CharField(max_length=80, blank=True)
	primary_button_target_type = models.CharField(
		max_length=10,
		choices=HeroButtonTargetType.choices,
		default=HeroButtonTargetType.URL,
	)
	primary_button_url = models.CharField(max_length=255, blank=True)
	primary_button_file = models.FileField(upload_to=home_hero_slide_button_file_upload_to, blank=True)
	secondary_button_label = models.CharField(max_length=80, blank=True)
	secondary_button_target_type = models.CharField(
		max_length=10,
		choices=HeroButtonTargetType.choices,
		default=HeroButtonTargetType.URL,
	)
	secondary_button_url = models.CharField(max_length=255, blank=True)
	secondary_button_file = models.FileField(upload_to=home_hero_slide_button_file_upload_to, blank=True)
	order = models.PositiveIntegerField(default=0)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["order", "id"]

	def clean(self):
		errors = {}

		if self.media_type == HeroSlideMediaType.ILLUSTRATION and not self.illustration and not self.use_abstract_background:
			errors["illustration"] = "Upload an illustration or enable abstract background."

		if self.media_type == HeroSlideMediaType.VIDEO and not self.video_file:
			errors["video_file"] = "Upload a video file when media type is set to video."

		if self.media_type == HeroSlideMediaType.NONE and not self.use_abstract_background:
			errors["use_abstract_background"] = "Enable abstract background when no media is provided."

		if self.primary_button_label and self.primary_button_target_type == HeroButtonTargetType.URL and not self.primary_button_url:
			errors["primary_button_url"] = "Add a URL for the primary button."

		if self.primary_button_label and self.primary_button_target_type == HeroButtonTargetType.FILE and not self.primary_button_file:
			errors["primary_button_file"] = "Upload a file for the primary button."

		if (self.primary_button_url or self.primary_button_file) and not self.primary_button_label:
			errors["primary_button_label"] = "Provide a label for the primary button."

		if self.secondary_button_label and self.secondary_button_target_type == HeroButtonTargetType.URL and not self.secondary_button_url:
			errors["secondary_button_url"] = "Add a URL for the secondary button."

		if self.secondary_button_label and self.secondary_button_target_type == HeroButtonTargetType.FILE and not self.secondary_button_file:
			errors["secondary_button_file"] = "Upload a file for the secondary button."

		if (self.secondary_button_url or self.secondary_button_file) and not self.secondary_button_label:
			errors["secondary_button_label"] = "Provide a label for the secondary button."

		if errors:
			raise ValidationError(errors)

	def __str__(self):
		return self.big_title


class HomeMetric(TimeStampedModel):
	label = models.CharField(max_length=120)
	value = models.CharField(max_length=50)
	order = models.PositiveIntegerField(default=0)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return f"{self.label}: {self.value}"


class OverviewContent(TimeStampedModel):
	header_subtitle = models.CharField(max_length=120, blank=True)
	header_title = models.CharField(max_length=255)
	header_description = models.TextField(blank=True)
	director_name = models.CharField(max_length=180, blank=True)
	director_role = models.CharField(max_length=180, blank=True)
	director_photo = models.ImageField(upload_to=overview_director_photo_upload_to, blank=True)
	director_intro = models.TextField(blank=True)
	director_quote = models.TextField(blank=True)
	director_body = models.TextField(blank=True)
	mission_title = models.CharField(max_length=120, default="Our Mission")
	mission_description = models.TextField(blank=True)
	mission_points = models.JSONField(default=list, blank=True)
	vision_title = models.CharField(max_length=120, default="Our Vision")
	vision_description = models.TextField(blank=True)
	vision_points = models.JSONField(default=list, blank=True)
	is_active = models.BooleanField(default=True)

	def save(self, *args, **kwargs):
		if self.is_active:
			OverviewContent.objects.exclude(pk=self.pk).filter(is_active=True).update(is_active=False)
		super().save(*args, **kwargs)

	def __str__(self):
		return self.header_title or "Overview Content"


class SiteSettings(TimeStampedModel):
	navbar_title = models.CharField(max_length=120, default="LP2MGI")
	navbar_logo = models.ImageField(upload_to=site_logo_upload_to, blank=True)

	class Meta:
		verbose_name = "Site settings"
		verbose_name_plural = "Site settings"

	def save(self, *args, **kwargs):
		self.pk = 1
		super().save(*args, **kwargs)

	def __str__(self):
		return "Site Settings"


class ContactMessage(TimeStampedModel):
	full_name = models.CharField(max_length=180)
	email = models.EmailField()
	subject = models.CharField(max_length=220)
	message = models.TextField()
	is_read = models.BooleanField(default=False)
	replied_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"{self.full_name} - {self.subject}"


class ProjectStatus(models.TextChoices):
	ONGOING = "ongoing", "Ongoing"
	COMPLETED = "completed", "Completed"
	PLANNED = "planned", "Planned"


class Project(TimeStampedModel):
	slug = models.SlugField(max_length=160, unique=True, blank=True)
	title = models.CharField(max_length=220)
	description = models.TextField(blank=True)
	date_start = models.DateField(null=True, blank=True)
	date_end = models.DateField(null=True, blank=True)
	status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.ONGOING)
	team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="projects")
	participants = models.ManyToManyField(Member, through="ProjectParticipation", blank=True, related_name="projects")
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="managed_projects",
	)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["-created_at"]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "project"
			slug = base_slug
			index = 2
			while Project.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class ProjectParticipation(TimeStampedModel):
	member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="project_participations")
	project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="participations")
	role = models.CharField(max_length=80, blank=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["member", "project"], name="unique_member_project"),
		]

	def __str__(self):
		return f"{self.member.full_name} in {self.project.title}"


class PublicationType(models.TextChoices):
	JOURNAL = "journal", "Journal"
	CONFERENCE = "conference", "Conference"
	BOOK = "book", "Book"
	THESIS = "thesis", "Thesis"
	OTHER = "other", "Other"


class Publication(TimeStampedModel):
	slug = models.SlugField(max_length=180, unique=True, blank=True)
	title = models.CharField(max_length=260)
	publication_type = models.CharField(max_length=20, choices=PublicationType.choices, default=PublicationType.OTHER)
	year = models.PositiveIntegerField(null=True, blank=True)
	abstract = models.TextField(blank=True)
	file_pdf_url = models.URLField(blank=True)
	team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="publications")
	authors = models.ManyToManyField(Member, through="PublicationAuthor", blank=True, related_name="publications")
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="managed_publications",
	)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ["-year", "-created_at"]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "publication"
			slug = base_slug
			index = 2
			while Publication.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class PublicationAuthor(TimeStampedModel):
	member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="publication_links")
	publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name="author_links")
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]
		constraints = [
			models.UniqueConstraint(fields=["member", "publication"], name="unique_member_publication"),
		]

	def __str__(self):
		return f"{self.member.full_name} - {self.publication.title}"


class Event(TimeStampedModel):
	slug = models.SlugField(max_length=180, unique=True, blank=True)
	title = models.CharField(max_length=220)
	event_date = models.DateField(null=True, blank=True)
	location = models.CharField(max_length=220, blank=True)
	description = models.TextField(blank=True)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="managed_events",
	)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ["-event_date", "-created_at"]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "event"
			slug = base_slug
			index = 2
			while Event.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class ContentPage(TimeStampedModel):
	slug = models.SlugField(max_length=180, unique=True, blank=True)
	title = models.CharField(max_length=220)
	content = models.TextField(blank=True)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="managed_pages",
	)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ["title"]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "page"
			slug = base_slug
			index = 2
			while ContentPage.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class Gallery(TimeStampedModel):
	slug = models.SlugField(max_length=180, unique=True, blank=True)
	title = models.CharField(max_length=220)
	description = models.TextField(blank=True)
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="managed_galleries",
	)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ["title"]

	def save(self, *args, **kwargs):
		if not self.slug:
			base_slug = slugify(self.title) or "gallery"
			slug = base_slug
			index = 2
			while Gallery.objects.exclude(pk=self.pk).filter(slug=slug).exists():
				slug = f"{base_slug}-{index}"
				index += 1
			self.slug = slug
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class GalleryImage(TimeStampedModel):
	gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE, related_name="images")
	image_url = models.ImageField(upload_to=gallery_image_upload_to)
	caption = models.CharField(max_length=255, blank=True)
	order = models.PositiveIntegerField(default=0)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return f"{self.gallery.title} image #{self.pk}"
