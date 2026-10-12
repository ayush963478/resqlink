"""
Unit test for the matching engine's scoring logic, independent of the DB,
so it can run fast in CI (Jenkins) without needing Postgres/Redis/RabbitMQ.
"""
from app.services.matching import _haversine_km


def test_haversine_zero_distance():
    assert _haversine_km(28.6, 77.2, 28.6, 77.2) == 0


def test_haversine_known_distance_is_positive():
    # Delhi to Mumbai, roughly ~1150 km
    distance = _haversine_km(28.6139, 77.2090, 19.0760, 72.8777)
    assert 1000 < distance < 1400
