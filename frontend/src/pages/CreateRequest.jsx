import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const URGENCY = ["low", "medium", "high", "critical"];

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "",
    urgency: "medium",
    required_capacity: 1,
    location_text: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/requests", { ...form, required_capacity: Number(form.required_capacity) });
      navigate("/app");
    } catch (err) {
      setError(err.message || "Could not create request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">New request</h1>
      <p className="text-sm text-slate-500 mb-8">
        Describe what you need. We'll match it against available, eligible resources.
      </p>

      <form onSubmit={handleSubmit} className="panel p-6 space-y-5">
        <div>
          <label className="field-label">Resource type</label>
          <input
            required
            className="field-input"
            placeholder="e.g. ambulance, shelter_slot, generator"
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">Must match a type providers use when registering resources.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Urgency</label>
            <select className="field-select" value={form.urgency} onChange={(e) => update("urgency", e.target.value)}>
              {URGENCY.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Quantity needed</label>
            <input
              type="number"
              min={1}
              className="field-input"
              value={form.required_capacity}
              onChange={(e) => update("required_capacity", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Location</label>
          <input
            className="field-input"
            placeholder="Address or area description"
            value={form.location_text}
            onChange={(e) => update("location_text", e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Notes (optional)</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-status-inuse">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Submitting…" : "Submit request"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate("/app")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
