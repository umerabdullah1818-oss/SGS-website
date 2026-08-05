import GameForm from "@/app/components/admin/GameForm";

export default function NewGamePage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Create New Game</h1>
          <p>Define a new game with formats, fees, roster rules, and custom questions.</p>
        </div>
      </div>
      <GameForm mode="create" />
    </>
  );
}
