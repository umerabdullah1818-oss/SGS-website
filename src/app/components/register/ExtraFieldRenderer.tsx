import type { ExtraField } from "@/types";

interface ExtraFieldRendererProps {
  fields: ExtraField[];
  answers: Record<string, string>;
  setAnswers: (answers: Record<string, string>) => void;
}

export default function ExtraFieldRenderer({ fields, answers, setAnswers }: ExtraFieldRendererProps) {
  if (fields.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
        No additional questions required for this game.
      </div>
    );
  }

  const handleChange = (label: string, value: string) => {
    setAnswers({ ...answers, [label]: value });
  };

  return (
    <div>
      {fields.map((field, index) => {
        const value = answers[field.label] || "";
        
        return (
          <div key={index} className="reg-form-group">
            <label className="reg-form-label">
              {field.label} {field.required && "*"}
            </label>
            
            {field.fieldType === "text" && (
              <input
                type="text"
                className="reg-form-input"
                value={value}
                onChange={(e) => handleChange(field.label, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.fieldType === "number" && (
              <input
                type="number"
                step="any"
                className="reg-form-input"
                value={value}
                onChange={(e) => handleChange(field.label, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.fieldType === "select" && (
              <select
                className="reg-form-select"
                value={value}
                onChange={(e) => handleChange(field.label, e.target.value)}
                required={field.required}
              >
                <option value="" disabled>Select an option</option>
                {(field.options || []).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            
            {field.fieldType === "radio" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                {(field.options || []).map((opt, i) => (
                  <label 
                    key={i} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem", 
                      fontSize: "0.9rem",
                      color: "var(--color-white)",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name={`field-${index}`}
                      value={opt}
                      checked={value === opt}
                      onChange={(e) => handleChange(field.label, e.target.value)}
                      required={field.required}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "var(--color-primary)"
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
