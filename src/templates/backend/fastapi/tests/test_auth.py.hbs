"""API tests for the auth endpoints.

The throwaway DATABASE_URL and SECRET_KEY come from the project-level
conftest.py, which pytest loads before this module. That database lasts the
whole test session, so each test registers its own user and asserts the
registration succeeded — no test may rely on, or collide with, another's data.
"""

from fastapi.testclient import TestClient

from app.main import app


def test_register_login_and_me():
    with TestClient(app) as client:
        register = client.post(
            "/api/auth/register/",
            json={
                "email": "ada@example.com",
                "password": "secret123",
                "first_name": "Ada",
                "last_name": "Lovelace",
            },
        )
        assert register.status_code == 201
        tokens = register.json()
        assert "access" in tokens and "refresh" in tokens

        login = client.post(
            "/api/auth/login/",
            json={"email": "ada@example.com", "password": "secret123"},
        )
        assert login.status_code == 200

        headers = {"Authorization": f"Bearer {tokens['access']}"}
        me = client.get("/api/auth/me/", headers=headers)
        assert me.status_code == 200
        body = me.json()
        assert body["email"] == "ada@example.com"
        assert body["first_name"] == "Ada"
        assert body["last_name"] == "Lovelace"


def test_login_rejects_wrong_password():
    with TestClient(app) as client:
        # Register this test's own user: the session-wide database keeps rows
        # from every test, so reusing ada@example.com would make this a
        # duplicate-email 400 no-op when run after test_register_login_and_me.
        register = client.post(
            "/api/auth/register/",
            json={"email": "grace@example.com", "password": "secret123"},
        )
        assert register.status_code == 201

        bad = client.post(
            "/api/auth/login/",
            json={"email": "grace@example.com", "password": "wrong"},
        )
        assert bad.status_code == 401
