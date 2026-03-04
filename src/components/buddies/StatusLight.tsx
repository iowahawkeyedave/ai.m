import type { BuddyStatus } from "@/lib/types";

const STATUS_CLASS_MAP: Record<BuddyStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  busy: "bg-rose-500",
  invisible: "bg-zinc-300",
};

interface StatusLightProps {
  status: BuddyStatus;
}

export function StatusLight({ status }: StatusLightProps) {
  return (
    <span
      aria-label={`status-${status}`}
      className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_CLASS_MAP[status]}`}
    />
  );
}
