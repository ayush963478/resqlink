import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import StatusPill from "../components/StatusPill.jsx";

export default function History() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/requests").then(setRequests).catch((err) => setError(err.message));
  }, []);

  const past = requests?.filter((r) => ["resolved", "cancelled"].includes(r.status)) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">History</h1>
      <p className="text-sm text-slate-500 mb-8">Resolved and cancelled requests.</p>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      {requests && past.length === 0 && <p className="text-sm text-slate-500">No past activity yet.</p>}

      {past.length > 0 && (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-line">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {past.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-slate-200">{r.type}</td>
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
