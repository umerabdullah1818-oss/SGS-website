"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Permission } from "@/types";

const AVAILABLE_PERMISSIONS = [
  { id: Permission.ManageTeam, label: "Manage Team Profiles" },
  { id: Permission.ManageConfig, label: "Manage Payment Config" },
  { id: Permission.ManageUsers, label: "Manage Users & Permissions" },
];

const CORE_COMMITTEE_DESIGNATIONS = ["Mentor", "Co Mentor", "Advisor", "President", "Vice President", "Graphics Head", "General Secretary", "Media Head", "Other"];
const GAME_HEAD_DESIGNATIONS = ["Head", "Co head", "Other"];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add User State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "head" | "superadmin">("head");
  const [assignedGame, setAssignedGame] = useState("");
  const [designation, setDesignation] = useState(GAME_HEAD_DESIGNATIONS[0]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const hasPerm = (perm: Permission) => {
    return currentUser?.role === "superadmin" || currentUser?.permissions?.includes(perm);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPerm(Permission.ManageUsers)) {
      fetchUsers();
    }
  }, [currentUser]);

  if (!currentUser) return null;

  if (!hasPerm(Permission.ManageUsers)) {
    return (
      <div className="admin-empty">
        <h3 className="admin-empty__title">Access Denied</h3>
        <p className="admin-empty__description">You do not have permission to manage users.</p>
      </div>
    );
  }

  const togglePermission = (perm: Permission, currentSelected: Permission[], setFn: (val: Permission[]) => void) => {
    if (currentSelected.includes(perm)) {
      setFn(currentSelected.filter((p) => p !== perm));
    } else {
      setFn([...currentSelected, perm]);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, assignedGame, designation, permissions: selectedPermissions }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to add user");
      
      setSuccess("User added successfully!");
      setEmail("");
      setPassword("");
      setRole("head");
      setAssignedGame("");
      setDesignation(GAME_HEAD_DESIGNATIONS[0]);
      setSelectedPermissions([]);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser._id, permissions: editPermissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>Create and manage accounts, and assign delegated permissions.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left: Add User Form */}
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-white)" }}>
            Add New User
          </h3>
          <form onSubmit={handleAddUser} className="admin-form" style={{ gap: "1rem" }}>
            {error && <div className="admin-login__error">{error}</div>}
            {success && <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "#4ade80", padding: "0.75rem", borderRadius: "8px", fontSize: "0.9rem" }}>{success}</div>}
            
            <div className="admin-form-group">
              <label className="admin-form-label">Email</label>
              <input
                type="email"
                className="admin-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Password</label>
              <input
                type="text"
                className="admin-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Role</label>
              <select className="admin-form-select" value={role} onChange={(e) => {
                const newRole = e.target.value as any;
                setRole(newRole);
                if (newRole === "user") setDesignation(CORE_COMMITTEE_DESIGNATIONS[0]);
                else if (newRole === "head") setDesignation(GAME_HEAD_DESIGNATIONS[0]);
                else setDesignation("");
              }}>
                <option value="user">Standard User (Core Committee)</option>
                <option value="head">Game Head</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            {role === "head" && (
              <div className="admin-form-group">
                <label className="admin-form-label">Assigned Game/Category</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Cricket"
                  value={assignedGame}
                  onChange={(e) => setAssignedGame(e.target.value)}
                  required
                />
              </div>
            )}

            {(role === "head" || role === "user") && (
              <div className="admin-form-group">
                <label className="admin-form-label">Designation</label>
                <select
                  className="admin-form-select"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                >
                  {(role === "user" ? CORE_COMMITTEE_DESIGNATIONS : GAME_HEAD_DESIGNATIONS).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {designation === "Other" && (
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ marginTop: "0.5rem" }}
                    placeholder="Specify custom designation"
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                )}
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-form-label" style={{ marginBottom: "0.5rem" }}>Delegated Permissions</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const canAssign = hasPerm(perm.id);
                  return (
                    <label key={perm.id} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem",
                      color: canAssign ? "var(--color-text)" : "var(--color-text-muted)",
                      opacity: canAssign ? 1 : 0.5,
                      cursor: canAssign ? "pointer" : "not-allowed"
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id, selectedPermissions, setSelectedPermissions)}
                        disabled={!canAssign}
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      {perm.label}
                    </label>
                  );
                })}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                You can only assign permissions that you currently possess.
              </p>
            </div>

            <button type="submit" className="admin-btn admin-btn--primary" disabled={adding}>
              {adding ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>

        {/* Right: User List */}
        <div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1rem", color: "var(--color-white)" }}>
            Existing Users
          </h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.email}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                          {u.assignedGame ? `Game: ${u.assignedGame} ` : ""}
                          {u.designation ? `(${u.designation})` : ""}
                          {!u.assignedGame && !u.designation && "No assigned game/designation"}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${u.role === "superadmin" ? "admin-badge--active" : ""}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.role === "superadmin" ? (
                          <span style={{ fontSize: "0.8rem", color: "var(--color-primary-light)" }}>All Access</span>
                        ) : u.permissions?.length ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                            {u.permissions.map((p: string) => (
                              <span key={p} style={{
                                fontSize: "0.7rem", padding: "0.1rem 0.4rem",
                                background: "rgba(255,255,255,0.1)", borderRadius: "4px"
                              }}>
                                {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>None</span>
                        )}
                      </td>
                      <td>
                        {u.role !== "superadmin" && (
                          <button
                            className="admin-btn"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                            onClick={() => {
                              setEditingUser(u);
                              setEditPermissions(u.permissions || []);
                            }}
                          >
                            Edit Perms
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="admin-card" style={{ width: "100%", maxWidth: "500px", margin: "1rem" }}>
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem", color: "white" }}>
              Edit Permissions: {editingUser.email}
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const canAssign = hasPerm(perm.id);
                return (
                  <label key={perm.id} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1rem",
                    color: canAssign ? "white" : "var(--color-text-muted)",
                    opacity: canAssign ? 1 : 0.5,
                    cursor: canAssign ? "pointer" : "not-allowed",
                    padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <input
                      type="checkbox"
                      checked={editPermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id, editPermissions, setEditPermissions)}
                      disabled={!canAssign}
                      style={{ accentColor: "var(--color-primary)", width: "1.2rem", height: "1.2rem" }}
                    />
                    {perm.label}
                  </label>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                className="admin-btn"
                onClick={() => setEditingUser(null)}
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
