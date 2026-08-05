"use client";

import { useState } from "react";
import type { ExtraField, FieldType } from "@/types";

interface ExtraFieldBuilderProps {
  extraFields: ExtraField[];
  onChange: (fields: ExtraField[]) => void;
}

const defaultExtraField: ExtraField = {
  label: "",
  fieldType: "text",
  options: [],
  required: false,
};

export default function ExtraFieldBuilder({ extraFields, onChange }: ExtraFieldBuilderProps) {
  const [optionInputs, setOptionInputs] = useState<Record<number, string>>({});

  const addField = () => {
    onChange([...extraFields, { ...defaultExtraField, options: [] }]);
  };

  const removeField = (index: number) => {
    onChange(extraFields.filter((_, i) => i !== index));
    const newInputs = { ...optionInputs };
    delete newInputs[index];
    setOptionInputs(newInputs);
  };

  const updateField = (index: number, key: keyof ExtraField, value: string | boolean | string[]) => {
    const updated = extraFields.map((field, i) => {
      if (i !== index) return field;
      const newField = { ...field, [key]: value };
      // Clear options when switching away from select/radio
      if (key === "fieldType" && value !== "select" && value !== "radio") {
        newField.options = [];
      }
      return newField;
    });
    onChange(updated);
  };

  const addOption = (fieldIndex: number) => {
    const input = optionInputs[fieldIndex]?.trim();
    if (!input) return;
    const field = extraFields[fieldIndex];
    const newOptions = [...(field.options || []), input];
    updateField(fieldIndex, "options", newOptions);
    setOptionInputs({ ...optionInputs, [fieldIndex]: "" });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = extraFields[fieldIndex];
    const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, "options", newOptions);
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption(fieldIndex);
    }
  };

  return (
    <div className="admin-builder">
      <div className="admin-builder__header">
        <div className="admin-builder__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Extra Custom Fields
          <span className="admin-builder__count">{extraFields.length}</span>
        </div>
        <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={addField}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Field
        </button>
      </div>

      <div className="admin-builder__items">
        {extraFields.length === 0 && (
          <div className="admin-builder__empty">
            No custom fields yet. Add questions like &quot;Weight Category&quot; or &quot;Race Type&quot;.
          </div>
        )}

        {extraFields.map((field, index) => (
          <div key={index} className="admin-builder__item">
            <div className="admin-builder__item-header">
              <span className="admin-builder__item-number">Field #{index + 1}</span>
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-btn--sm"
                onClick={() => removeField(index)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Remove
              </button>
            </div>

            <div className="admin-builder__item-fields">
              <div className="admin-form-group">
                <label className="admin-form-label">Question Label</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder='e.g. "Weight Category"'
                  value={field.label}
                  onChange={(e) => updateField(index, "label", e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Field Type</label>
                <select
                  className="admin-form-select"
                  value={field.fieldType}
                  onChange={(e) => updateField(index, "fieldType", e.target.value as FieldType)}
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="select">Dropdown Select</option>
                  <option value="radio">Radio Buttons</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Required?</label>
                <div
                  className={`admin-toggle ${field.required ? "admin-toggle--active" : ""}`}
                  onClick={() => updateField(index, "required", !field.required)}
                >
                  <div className="admin-toggle__switch" />
                  <span>{field.required ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            {/* Options for select/radio */}
            {(field.fieldType === "select" || field.fieldType === "radio") && (
              <div className="admin-form-group" style={{ marginTop: "0.5rem" }}>
                <label className="admin-form-label">Options</label>
                <div className="admin-chips">
                  {(field.options || []).map((option, optIndex) => (
                    <span key={optIndex} className="admin-chip">
                      {option}
                      <button
                        type="button"
                        className="admin-chip__remove"
                        onClick={() => removeOption(index, optIndex)}
                        aria-label={`Remove ${option}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="admin-chip-input"
                    placeholder="Type + Enter"
                    value={optionInputs[index] || ""}
                    onChange={(e) =>
                      setOptionInputs({ ...optionInputs, [index]: e.target.value })
                    }
                    onKeyDown={(e) => handleOptionKeyDown(e, index)}
                  />
                </div>
                <span className="admin-form-hint">
                  Press Enter to add each option. Need at least 2 options.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
