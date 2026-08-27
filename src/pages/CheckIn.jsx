import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";

export default function CheckIn() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"

  // TODO: wire to POST /api/attendance/check-in with { code }
  // Server validates the active window + code and returns on-time/late.
  function handleCheckIn(e) {
    e.preventDefault();
    setStatus(code.length === 4 ? "success" : "error");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold">Service Check-In</h1>
      <Card>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the code shown at the entrance, or scan the QR code posted at
          the venue.
        </p>
        <form onSubmit={handleCheckIn} className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-lg tracking-widest dark:border-zinc-700 dark:bg-zinc-800"
          />
          <Button type="submit">Check in</Button>
        </form>

        {status === "success" && (
          <div className="mt-4 flex items-center gap-2">
            <Badge tone="good">Checked in</Badge>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              You're marked present.
            </span>
          </div>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            That code didn't match. Double-check and try again.
          </p>
        )}
      </Card>
    </div>
  );
}
