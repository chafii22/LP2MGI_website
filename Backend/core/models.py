import os
from uuid import uuid4

from django.conf import settings
from django.db import models
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


def news_cover_upload_to(instance, filename: str) -> str:
	return _dated_upload_path("news/covers", instance.title, filename)


def home_hero_background_upload_to(instance, filename: str) -> str:
	return _dated_upload_path("home/hero", instance.title, filename)


def gallery_image_upload_to(instance, filename: str) -> str:
	gallery_title = instance.gallery.title if instance.gallery_id else "gallery"
	return _dated_upload_path("galleries/images", gallery_title, filename)


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


class HomeHero(TimeStampedModel):
	subtitle = models.CharField(max_length=120, blank=True)
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	button_label = models.CharField(max_length=80, blank=True)
	button_link = models.CharField(max_length=255, blank=True)
	background_image_url = models.ImageField(upload_to=home_hero_background_upload_to, blank=True)
	is_active = models.BooleanField(default=True)

	def save(self, *args, **kwargs):
		if self.is_active:
			HomeHero.objects.exclude(pk=self.pk).filter(is_active=True).update(is_active=False)
		super().save(*args, **kwargs)

	def __str__(self):
		return self.title


class HomeMetric(TimeStampedModel):
	label = models.CharField(max_length=120)
	value = models.CharField(max_length=50)
	order = models.PositiveIntegerField(default=0)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return f"{self.label}: {self.value}"


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
