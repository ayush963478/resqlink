import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  { value: "requester", label: "Requester — I need resources" },
  { value: "provider", label: "Provider — I manage resources" },
  { value: "coordinator", label: "Coordinator — I oversee assignments" },
];

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "requester" });
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
      await register(form);
      await login(form.email, form.password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-display font-semibold text-lg text-slate-100">ResQLink</span>
        </Link>

        <div className="panel p-6">
          <h1 className="font-display text-xl font-semibold text-slate-100">Create an account</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">Administrator approval may apply for provider organizations.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input required className="field-input" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input type="email" required className="field-input" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" required minLength={8} className="field-input" value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div>
              <label className="field-label">I am a...</label>
              <select className="field-select" value={form.role} onChange={(e) => update("role", e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-status-inuse">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
