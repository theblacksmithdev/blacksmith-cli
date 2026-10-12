"""The models and the migrations describe the same schema.

Without this, a field added to a model and never migrated would pass every
other test here and fail against a real database. It is FastAPI's equivalent
of Django's `makemigrations --check`.
"""

from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext

from app.db import Base, engine


def test_models_have_no_unmigrated_changes():
    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        changes = compare_metadata(context, Base.metadata)

    assert changes == [], (
        "Models have changes no migration covers. Create one with:\n"
        '  python -m alembic revision --autogenerate -m "describe the change"\n'
        f"Pending: {changes}"
    )
