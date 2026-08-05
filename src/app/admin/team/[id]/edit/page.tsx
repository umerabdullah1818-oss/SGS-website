"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TeamMemberForm from "@/app/components/admin/TeamMemberForm";

export default function EditTeamMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/team?id=${id}`)
      .then((r) => r.json())
      .then((d) => setMember(d.member))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading…
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#ff6b6b" }}>
        Member not found.
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Edit Team Member</h1>
          <p>Update {member.name}&apos;s profile</p>
        </div>
      </div>
      <TeamMemberForm initialData={member} mode="edit" />
    </>
  );
}
