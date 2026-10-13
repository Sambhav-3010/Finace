from ml_validation.dashboard_api import build_dashboard, list_requirements


def test_dashboard_exposes_current_measured_metrics_without_artifact_paths():
    payload = build_dashboard()
    assert payload["available"] is True
    overview = payload["overview"]
    assert overview["current_model"]
    assert overview["main_test_accuracy"] is not None
    assert overview["test_macro_f1"] is not None
    assert overview["adversarial_accuracy"] is not None
    assert payload["performance"]["confusion_matrix"]["labels"]
    assert "model_dir" not in str(payload)
    assert "C:\\Users\\" not in str(payload)


def test_requirement_search_returns_traceable_evaluated_requirements():
    payload = list_requirements(limit=5)
    assert payload["available"] is True
    assert payload["total"] >= len(payload["requirements"])
    assert len(payload["requirements"]) <= 5
    for requirement in payload["requirements"]:
        assert requirement["requirement_id"]
        assert requirement["source_chunk_id"]
        assert requirement["scenario_count"] > 0


def test_requirement_search_and_domain_filter():
    first = list_requirements(limit=1)
    record = first["requirements"][0]
    searched = list_requirements(query=record["requirement_id"], limit=10)
    assert all(record["requirement_id"] == item["requirement_id"] for item in searched["requirements"])
    filtered = list_requirements(domain=record["domain"], limit=10)
    assert all(item["domain"] == record["domain"] for item in filtered["requirements"])
