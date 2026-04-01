from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		abstract = True


class Team(TimeStampedModel):
	slug = models.SlugField(max_length=120, unique=True, blank=True)
	title = models.CharField(max_length=200)
	short_name = models.CharField(max_length=20, blank=True)
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
	photo_url = models.URLField(blank=True)
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
	cover_image_url = models.URLField(blank=True)
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
	background_image_url = models.URLField(blank=True)
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
