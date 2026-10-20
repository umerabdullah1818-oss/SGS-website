import { useState, useRef } from "react";
import type { PaymentConfig } from "@/types";

interface PaymentFormProps {
  fee: number;
  paymentConfig: PaymentConfig | null;
  paymentDetails: {
    dateOfTransaction: string;
    source: string;
    transactionId: string;
  };
  setPaymentDetails: (details: any) => void;
  screenshotFile: File | null;
  setScreenshotFile: (file: File | null) => void;
}

export default function PaymentForm({
  fee,
  paymentConfig,
  paymentDetails,
  setPaymentDetails,
  screenshotFile,
  setScreenshotFile,
}: PaymentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const updateField = (field: string, value: string) => {
    setPaymentDetails({ ...paymentDetails, [field]: value });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Basic validation: image only, < 5MB
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload an image smaller than 5MB.");
      return;
    }
    
    // In a real production app, we would compress the image here using a library 
    // like browser-image-compression before storing it in state.
    
    setScreenshotFile(file);
  };

  return (
    <div>
      <div className="payment-info-box">
        <h4 style={{ fontSize: "1rem", color: "var(--color-text)", marginBottom: "1rem", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>Amount Due</span>
          <span style={{ color: "var(--color-primary-light)", fontSize: "1.2rem" }}>Rs. {fee}</span>
        </h4>
        
        {paymentConfig ? (
          <>
            <div className="payment-info-row">
              <span className="payment-label">Bank Name</span>
              <span className="payment-value">{paymentConfig.bankName}</span>
            </div>
            <div className="payment-info-row">
              <span className="payment-label">Account Title</span>
              <span className="payment-value">{paymentConfig.accountTitle}</span>
            </div>
            <div className="payment-info-row">
              <span className="payment-label">Account Number</span>
              <span className="payment-value">{paymentConfig.accountNumber}</span>
            </div>
            {paymentConfig.instructions && (
              <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--color-text-muted)", background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "8px" }}>
                {paymentConfig.instructions}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            Payment details will be provided by the organizers.
          </div>
        )}
      </div>

      <div className="reg-form-group">
        <label className="reg-form-label">Payment Source / Bank Name *</label>
        <input
          type="text"
          className="reg-form-input"
          placeholder="e.g. Meezan Bank, JazzCash (sender account)"
          value={paymentDetails.source}
          onChange={(e) => updateField("source", e.target.value)}
          required
        />
      </div>

      <div className="reg-form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="reg-form-label">Transaction ID / Ref # *</label>
          <input
            type="text"
            className="reg-form-input"
            placeholder="e.g. 1234567890"
            value={paymentDetails.transactionId}
            onChange={(e) => updateField("transactionId", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="reg-form-label">Date of Transaction *</label>
          <input
            type="date"
            className="reg-form-input"
            value={paymentDetails.dateOfTransaction}
            onChange={(e) => updateField("dateOfTransaction", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="reg-form-group">
        <label className="reg-form-label">Payment Screenshot *</label>
        <div className="reg-form-hint" style={{ marginBottom: "0.75rem" }}>
          Please upload a clear screenshot of your successful transaction.
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="image/png, image/jpeg, image/jpg"
          style={{ display: "none" }}
        />
        
        <div
          className={`file-upload-area ${dragActive ? "file-upload-area--active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {screenshotFile ? (
            <div>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                margin: "0 auto 1rem", 
                background: "rgba(0, 200, 100, 0.1)", 
                color: "#00c864",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="file-upload-text">{screenshotFile.name}</div>
              <div className="file-upload-hint">{(screenshotFile.size / 1024 / 1024).toFixed(2)} MB • Click to change</div>
            </div>
          ) : (
            <div>
              <svg className="file-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div className="file-upload-text">Click to upload or drag and drop</div>
              <div className="file-upload-hint">JPG, PNG up to 5MB</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
