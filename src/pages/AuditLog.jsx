import Card from "../components/ui/Card.jsx";

export default function AuditLog() {
  // TODO: replace with real data from GET /api/audit-log
  const entries = [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold">Audit Log</h1>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2 pr-4 font-medium">Admin</th>
              <th className="py-2 pr-4 font-medium">Action</th>
              <th className="py-2 pr-4 font-medium">Record</th>
              <th className="py-2 pr-4 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-400 dark:text-zinc-500">
                  No actions logged yet.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="py-2 pr-4">{e.admin}</td>
                  <td className="py-2 pr-4">{e.action}</td>
                  <td className="py-2 pr-4">{e.record}</td>
                  <td className="py-2 pr-4">{e.when}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
