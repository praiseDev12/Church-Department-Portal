import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Reports() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold">Reports</h1>
      <Card>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Generate a detailed PDF report covering member stats, attendance
          trends, and contribution status. It can be downloaded here or
          emailed to you.
        </p>
        <div className="flex gap-2">
          <Button>Generate PDF</Button>
          <Button variant="secondary">Email me the report</Button>
        </div>
      </Card>
    </div>
  );
}
