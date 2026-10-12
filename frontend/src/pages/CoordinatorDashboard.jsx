import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import StatusPill from "../components/StatusPill.jsx";

export default function CoordinatorDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/dashboard/metrics"), api.get("/requests")])
      .then(([m, r]) => {
        setMetrics(m);
        setRequests(r);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">Active requests</h1>
      <p className="text-sm text-slate-500 mb-8">Operational overview across all requesters and providers.</p>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      {metrics && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Metric label="Open requests" value={metrics.open_requests} tone="reserved" />
          <Metric label="Available resources" value={metrics.available_resources} tone="available" />
          <Metric label="Active reservations" value={metrics.active_reservations} tone="inuse" />
        </div>
      )}

      {requests && (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-line">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Urgency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-slate-200">{r.type}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{r.urgency}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, tone }) {
  const toneClass = { reserved: "text-status-reserved", available: "text-status-available", inuse: "text-status-inuse" }[tone];
  return (
    <div className="panel p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-2 ${toneClass}`}>{value ?? "—"}</p>
    </div>
  );
}
