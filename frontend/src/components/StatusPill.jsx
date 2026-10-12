const COLORS = {
  available: { dot: "bg-status-available", text: "text-status-available" },
  open: { dot: "bg-status-available", text: "text-status-available" },
  reserved: { dot: "bg-status-reserved", text: "text-status-reserved" },
  matched: { dot: "bg-status-reserved", text: "text-status-reserved" },
  in_progress: { dot: "bg-status-reserved", text: "text-status-reserved" },
  in_use: { dot: "bg-status-inuse", text: "text-status-inuse" },
  active: { dot: "bg-status-inuse", text: "text-status-inuse" },
  resolved: { dot: "bg-slate-400", text: "text-slate-400" },
  cancelled: { dot: "bg-status-offline", text: "text-status-offline" },
  offline: { dot: "bg-status-offline", text: "text-status-offline" },
};

export default function StatusPill({ status }) {
  const key = (status || "").toLowerCase();
  const palette = COLORS[key] || { dot: "bg-slate-500", text: "text-slate-300" };
  return (
    <span className={`status-pill ${palette.text}`}>
      <span className={`status-dot ${palette.dot}`} />
      {key.replace(/_/g, " ")}
    </span>
  );
}
