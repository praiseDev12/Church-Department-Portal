import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Members() {
  const [search, setSearch] = useState("");
  // TODO: replace with real data from GET /api/members
  const members = [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Members</h1>
        <div className="flex gap-2">
          <Button variant="secondary">Import CSV</Button>
          <Button>Add member</Button>
        </div>
      </div>

      <input
        type="search"
        placeholder="Search members…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Unit</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 pr-4 font-medium">Joined</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-zinc-400 dark:text-zinc-500"
                >
                  No members yet. Add one or import a CSV to get started.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="py-2 pr-4">{m.name}</td>
                  <td className="py-2 pr-4">{m.unit}</td>
                  <td className="py-2 pr-4">{m.phone}</td>
                  <td className="py-2 pr-4">{m.joined}</td>
                  <td className="py-2 pr-4">{m.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
