import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import StatusPill from "../components/StatusPill.jsx";

export default function RequesterDashboard() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [matchingId, setMatchingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.get("/requests?mine=true");
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function triggerMatch(id) {
    setMatchingId(id);
    try {
      await api.post(`/requests/${id}/match`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMatchingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">My requests</h1>
          <p className="text-sm text-slate-500 mt-1">Track status from open through resolution.</p>
        </div>
        <Link to="/app/requests/new" className="btn-primary">New request</Link>
      </div>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      {requests === null && <p className="text-sm text-slate-500">Loading…</p>}

      {requests && requests.length === 0 && (
        <div className="panel p-10 text-center">
          <p className="text-slate-300 font-medium">No requests yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">Create a request to find an available resource.</p>
          <Link to="/app/requests/new" className="btn-primary">New request</Link>
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-line">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Urgency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-slate-200">{r.type}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{r.urgency}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "open" && (
                      <button
                        onClick={() => triggerMatch(r.id)}
                        disabled={matchingId === r.id}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        {matchingId === r.id ? "Matching…" : "Find matches"}
                      </button>
                    )}
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
