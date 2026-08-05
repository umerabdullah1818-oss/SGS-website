import TeamMemberForm from "@/app/components/admin/TeamMemberForm";

export default function NewTeamMemberPage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Add Team Member</h1>
          <p>Add a new member to the SGS team</p>
        </div>
      </div>
      <TeamMemberForm mode="create" />
    </>
  );
}
