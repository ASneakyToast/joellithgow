"""
Document type schemas for joellithgow CMS.
"""
from __future__ import annotations

from starlette_cms import (
    CMS,
    BoolField,
    JSONField,
    NumberField,
    SelectField,
    TextField,
)


def register_documents(cms: CMS) -> None:
    """Register all document types with the CMS instance."""

    @cms.document("blog_post")
    class BlogPostDocument:
        slug: str = TextField(required=True, immutable=True, unique_per_type=True)
        title: str = TextField(required=True, max_length=500)
        description: str = TextField(required=True, max_length=1000)
        publish_date: str = TextField(required=True)          # ISO 8601 — wrap with new Date()
        post_type: str = SelectField(choices=["article", "thought", "collection"], required=True)
        body_markdown: str = TextField()
        excerpt: str = TextField(max_length=2000)
        author: str = TextField(max_length=200)
        image: dict | None = JSONField()                      # { src, alt, type, fallbackSrc?, poster? }
        links: list | None = JSONField()                      # for collection type: list[LinkItem]
        tags: list | None = JSONField()                       # list[str]
        draft: bool = BoolField(default=False)
        featured: bool = BoolField(default=False)
        has_detail_page: bool = BoolField(default=True)
        reading_time: float | None = NumberField(min_value=0.0, precision=0)

    @cms.document("project_page")
    class ProjectPageDocument:
        slug: str = TextField(required=True, immutable=True, unique_per_type=True)  # = original id field
        number: float = NumberField(required=True, precision=0)
        project_type: str = TextField(required=True)
        title: str = TextField(required=True, max_length=300)
        description: str = TextField(required=True, max_length=1000)
        impact: str = TextField(max_length=500)
        technologies: list | None = JSONField()
        subtitle: str = TextField(max_length=300)
        overview: str = TextField(max_length=2000)
        hero_media: dict | None = JSONField()                 # { src, alt, type, fallbackSrc?, poster? }
        duration: str = TextField(max_length=200)
        team: str = TextField(max_length=500)
        role: str = TextField(max_length=300)
        tools: str = TextField(max_length=500)
        live_link: dict | None = JSONField()
        live_links: dict | None = JSONField()
        publish_date: str = TextField()
        draft: bool = BoolField(default=False)
        featured: bool = BoolField(default=False)
        tags: list | None = JSONField()
        body_blocks: list | None = JSONField()

    @cms.document("experience_entry")
    class ExperienceEntryDocument:
        slug: str = TextField(required=True, immutable=True, unique_per_type=True)
        company: str = TextField(required=True, max_length=300)
        title: str = TextField(required=True, max_length=300)
        location: str = TextField(max_length=200)
        start_date: str = TextField(required=True)
        end_date: str = TextField()
        employment_type: str = SelectField(
            choices=["full-time", "part-time", "contract", "student", "internship"],
            required=True,
        )
        description: str = TextField(max_length=2000)
        responsibilities: list | None = JSONField()
        achievements: list | None = JSONField()
        featured: bool = BoolField(default=False)
        show_on_resume: bool = BoolField(default=True)
        order: float | None = NumberField(precision=0)
