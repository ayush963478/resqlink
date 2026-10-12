import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusPill from "../components/StatusPill.jsx";

const STATUS_OPTIONS = ["available", "reserved", "in_use", "offline"];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [resources, setResources] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "", name: "", capacity: 1 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.get("/resources");
      setResources(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!user.organization_id) {
      setError("Your account has no organization_id set. An administrator must assign one before you can register resources.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await api.post("/resources", { ...form, capacity: Number(form.capacity), organization_id: user.organization_id });
      setForm({ type: "", name: "", capacity: 1 });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/resources/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">My resources</h1>
      <p className="text-sm text-slate-500 mb-8">Register resources and keep their availability current.</p>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="panel p-5 mb-8 grid sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="field-label">Type</label>
          <input required className="field-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="ambulance" />
        </div>
        <div>
          <label className="field-label">Name</label>
          <input required className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Unit A-14" />
        </div>
        <div>
          <label className="field-label">Capacity</label>
          <input type="number" min={1} className="field-input" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
        </div>
        <button type="submit" disabled={creating} className="btn-primary h-[38px]">
          {creating ? "Adding…" : "Add resource"}
        </button>
      </form>

      {resources === null && <p className="text-sm text-slate-500">Loading…</p>}

      {resources && resources.length > 0 && (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-line">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-slate-200">{r.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{r.type}</td>
                  <td className="px-4 py-3 text-slate-400">{r.capacity}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      className="field-select w-auto text-xs py-1"
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
