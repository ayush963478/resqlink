import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import StatusPill from "../components/StatusPill.jsx";

export default function ResourceSearch() {
  const [type, setType] = useState("");
  const [resources, setResources] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load(e) {
    e?.preventDefault();
    setError("");
    try {
      const query = type ? `?type=${encodeURIComponent(type)}` : "";
      const data = await api.get(`/resources${query}`);
      setResources(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">Browse resources</h1>
      <p className="text-sm text-slate-500 mb-6">See what's currently registered by eligible providers.</p>

      <form onSubmit={load} className="flex gap-3 mb-6">
        <input
          className="field-input max-w-xs"
          placeholder="Filter by type, e.g. ambulance"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      {resources && resources.length === 0 && (
        <p className="text-sm text-slate-500">No resources match that filter yet.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources?.map((r) => (
          <div key={r.id} className="panel p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-100 font-medium">{r.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{r.type}</p>
              </div>
              <StatusPill status={r.status} />
            </div>
            <p className="text-xs text-slate-500 mt-3">Capacity: {r.capacity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
