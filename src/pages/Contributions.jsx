import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

const toneForStatus = {
  paid: "good",
  overdue: "critical",
  partial: "warning",
};

export default function Contributions() {
  // TODO: replace with real data from GET /api/contributions
  const rows = [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Contributions</h1>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2 pr-4 font-medium">Member</th>
              <th className="py-2 pr-4 font-medium">Period</th>
              <th className="py-2 pr-4 font-medium">Expected</th>
              <th className="py-2 pr-4 font-medium">Paid</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-zinc-400 dark:text-zinc-500"
                >
                  No contribution records yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="py-2 pr-4">{r.member}</td>
                  <td className="py-2 pr-4">{r.period}</td>
                  <td className="py-2 pr-4">{r.expected}</td>
                  <td className="py-2 pr-4">{r.paid}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={toneForStatus[r.status] ?? "neutral"}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
