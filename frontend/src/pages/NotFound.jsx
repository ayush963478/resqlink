import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-xs text-slate-500 mb-2">404</p>
      <h1 className="font-display text-2xl font-semibold text-slate-100">Page not found</h1>
      <p className="text-sm text-slate-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
