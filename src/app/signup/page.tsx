"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import "../login/auth.css";

function PublicSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback") || "/";
  const { user } = useAuth();
  
  const [name, setName] = useState("");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }
      
      // Reload the page so AuthProvider picks up the new cookie session
      window.location.href = callback;
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="public-auth-layout">
        <div className="public-auth-card">
          <Link href="/" className="public-auth-logo">SGS</Link>
          <h1 className="public-auth-title">Create Account</h1>
          <p className="public-auth-subtitle">Only FAST University students can register</p>

          {error && <div className="public-auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="public-auth-form">
            <div className="public-auth-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Ali Ahmed"
                required 
              />
            </div>
            <div className="public-auth-group">
              <label>FAST Email (@cfd.nu.edu.pk)</label>
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
                placeholder="Create a strong password"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="public-auth-submit">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="public-auth-footer">
            Already have an account? <Link href={`/login?callback=${encodeURIComponent(callback)}`}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function PublicSignup() {
  return (
    <Suspense fallback={null}>
      <PublicSignupContent />
    </Suspense>
  );
}
