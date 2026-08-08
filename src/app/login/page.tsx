"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import "./auth.css";

function PublicLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback") || "/";
  const { login, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    router.push(callback);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      
      // If the user is an admin or head, take them to the dashboard
      if (loggedInUser.role === "superadmin" || loggedInUser.role === "head") {
        router.push("/admin");
      } else {
        router.push(callback);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="public-auth-layout">
        <div className="public-auth-card">
          <Link href="/" className="public-auth-logo">SGS</Link>
          <h1 className="public-auth-title">Welcome Back</h1>
          <p className="public-auth-subtitle">Login to register for tournaments</p>

          {error && <div className="public-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="public-auth-form">
            <div className="public-auth-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="e.g. f228815@cfd.nu.edu.pk"
                required 
              />
            </div>
            <div className="public-auth-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="public-auth-submit">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="public-auth-footer">
            Don't have an account? <Link href={`/signup?callback=${encodeURIComponent(callback)}`}>Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function PublicLogin() {
  return (
    <Suspense fallback={null}>
      <PublicLoginContent />
    </Suspense>
  );
}
