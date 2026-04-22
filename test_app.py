import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_dashboard_route(client):
    """Test that the dashboard renders correctly and returns a 200 status code."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"Enterprise CI/CD Dashboard" in response.data
    assert b"Pipeline Execution Summary" in response.data
