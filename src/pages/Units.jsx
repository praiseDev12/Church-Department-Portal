import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Units() {
  // TODO: replace with real data from GET /api/units
  const units = [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Units</h1>
        <Button>Add unit</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No units created yet.
            </p>
          </Card>
        ) : (
          units.map((u) => (
            <Card key={u.id}>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {u.memberCount} members · Admin: {u.adminName}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
