import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function AdminPanel() {
  const [orgs, setOrgs] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", type: "", address: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [orgData, metricData] = await Promise.all([
        api.get("/organizations"),
        api.get("/dashboard/metrics"),
      ]);
      setOrgs(orgData);
      setMetrics(metricData);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api.post("/organizations", form);
      setForm({ name: "", type: "", address: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">Admin panel</h1>
      <p className="text-sm text-slate-500 mb-8">Manage organizations and review platform-wide activity.</p>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      {metrics && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Open requests</p>
            <p className="font-display text-3xl font-semibold mt-2 text-slate-100">{metrics.open_requests}</p>
          </div>
          <div className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available resources</p>
            <p className="font-display text-3xl font-semibold mt-2 text-slate-100">{metrics.available_resources}</p>
          </div>
          <div className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active reservations</p>
            <p className="font-display text-3xl font-semibold mt-2 text-slate-100">{metrics.active_reservations}</p>
          </div>
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Organizations</h2>

      <form onSubmit={handleCreate} className="panel p-5 mb-6 grid sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="field-label">Name</label>
          <input required className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Type</label>
          <input required className="field-input" placeholder="hospital, ngo, fire..." value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
        </div>
        <div>
          <label className="field-label">Address</label>
          <input className="field-input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <button type="submit" disabled={creating} className="btn-primary h-[38px]">
          {creating ? "Adding…" : "Add organization"}
        </button>
      </form>

      {orgs && (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-line">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-slate-200">{o.name}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{o.type}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
