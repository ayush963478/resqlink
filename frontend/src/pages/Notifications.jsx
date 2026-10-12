import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Notifications() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setItems(await api.get("/notifications"));
    } catch (err) {
      setError(err.message);
    }
  }

  async function markRead(id) {
    try {
      await api.post(`/notifications/${id}/read`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100 mb-1">Notifications</h1>
      <p className="text-sm text-slate-500 mb-8">Updates on matches, reservations, and status changes.</p>

      {error && <p className="text-sm text-status-inuse mb-4">{error}</p>}

      {items && items.length === 0 && <p className="text-sm text-slate-500">Nothing here yet.</p>}

      <div className="space-y-2">
        {items?.map((n) => (
          <div key={n.id} className={`panel p-4 flex items-start justify-between gap-4 ${!n.read_at ? "border-l-2 border-l-accent" : ""}`}>
            <div>
              <p className="text-sm text-slate-200">{n.message}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            {!n.read_at && (
              <button onClick={() => markRead(n.id)} className="btn-ghost text-xs px-2 py-1 shrink-0">
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
