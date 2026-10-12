import { Link } from "react-router-dom";

const FEED = [
  { time: "04:12:08", label: "Ambulance A-14 marked available", tone: "available" },
  { time: "04:12:41", label: "Shelter cot request matched · 3 candidates", tone: "reserved" },
  { time: "04:13:02", label: "Generator G-02 reserved for request #8841", tone: "inuse" },
  { time: "04:13:55", label: "Request #8801 resolved", tone: "muted" },
];

const TONE_DOT = {
  available: "bg-status-available",
  reserved: "bg-status-reserved",
  inuse: "bg-status-inuse",
  muted: "bg-slate-500",
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-display font-semibold text-lg">ResQLink</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-display text-5xl leading-tight font-semibold">
            Know what's available. Before it's needed.
          </h1>
          <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-md">
            ResQLink gives organizations a shared, real-time view of emergency
            resources — so a request finds an available ambulance, bed, or
            shelter slot in seconds, not phone calls.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">Create an account</Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-base">Sign in</Link>
          </div>
          <p className="mt-6 text-xs text-slate-500 max-w-md">
            ResQLink is a coordination and information layer. It does not
            replace emergency services, dispatch authority, or medical
            decision-making.
          </p>
        </div>

        <div className="panel p-5 font-mono text-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-xs uppercase tracking-wide">Live activity</span>
            <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
          </div>
          <ul className="space-y-3">
            {FEED.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-slate-600">{item.time}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${TONE_DOT[item.tone]}`} />
                <span className="text-slate-300">{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-600 border-t border-line pt-3">
            Simulated feed for illustration — sign in to see real activity.
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-8 py-16 grid md:grid-cols-3 gap-10">
          <Feature
            title="Explainable matching"
            body="Requests are matched to resources by type, distance, urgency, and capacity — with a plain-language reason for every match."
          />
          <Feature
            title="No double allocation"
            body="Reservations are transactional. Once a resource is reserved, it can't be handed to a second request by mistake."
          />
          <Feature
            title="A full record"
            body="Every status change is logged: who requested what, what was offered, what was reserved, and when it resolved."
          />
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-8 py-8 text-xs text-slate-600">
          ResQLink — a coordination platform prototype.
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, body }) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
