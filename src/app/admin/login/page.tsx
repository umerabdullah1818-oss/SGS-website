"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/admin");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <Image src="/logo.png" alt="SGS Logo" width={140} height={60} style={{ margin: "0 auto", display: "block", objectFit: "contain" }} />
          </div>
          <h1 className="admin-login__title">Admin Panel</h1>
          <p className="admin-login__subtitle">
            Sign in to manage games, registrations &amp; results
          </p>
        </div>

        {error && <div className="admin-login__error">{error}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              className="admin-form-input"
              placeholder="admin@sportsguild.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="admin-form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={loading}
            style={{ width: "100%", padding: "1rem", fontSize: "1rem", marginTop: "1rem" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", textDecoration: "none" }}>
            &larr; Return to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
