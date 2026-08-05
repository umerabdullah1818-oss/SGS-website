"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PaymentConfigFormData } from "@/lib/validations";

export default function PaymentConfigPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [bankName, setBankName] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config/payment");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setBankName(data.config.bankName || "");
            setAccountTitle(data.config.accountTitle || "");
            setAccountNumber(data.config.accountNumber || "");
            setInstructions(data.config.instructions || "");
          }
        }
      } catch {
        console.error("Failed to load payment config");
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const configData: PaymentConfigFormData = {
      bankName,
      accountTitle,
      accountNumber,
      instructions,
    };

    try {
      const res = await fetch("/api/config/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      });

      if (!res.ok) {
        throw new Error("Failed to save payment configuration");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-empty">
        <p>Loading configuration…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="admin-page-header">
        <div>
          <h1>Payment Configuration</h1>
          <p>This information is shown to students during the registration flow for fee transfer.</p>
        </div>
      </div>

      <div className="admin-card">
        {error && (
          <div className="admin-login__error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{
            background: "rgba(0, 200, 100, 0.1)",
            border: "1px solid rgba(0, 200, 100, 0.2)",
            color: "#00c864",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            fontWeight: 500
          }}>
            Payment configuration saved successfully.
          </div>
        )}

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="bank-name">Bank Name *</label>
            <input
              id="bank-name"
              type="text"
              className="admin-form-input"
              placeholder="e.g. UBL, Meezan Bank, EasyPaisa"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="account-title">Account Title *</label>
            <input
              id="account-title"
              type="text"
              className="admin-form-input"
              placeholder="e.g. Hafiz Umer Abdullah Shah"
              value={accountTitle}
              onChange={(e) => setAccountTitle(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="account-number">Account / IBAN Number *</label>
            <input
              id="account-number"
              type="text"
              className="admin-form-input"
              placeholder="e.g. 1581332826075"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="instructions">Payment Instructions *</label>
            <textarea
              id="instructions"
              className="admin-form-textarea"
              placeholder="Instructions shown to students before they upload their screenshot..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
