import type { BuddyStatus } from "@/lib/types";

const STATUS_CLASS_MAP: Record<BuddyStatus, string> = {
  online: "bg-[#2dcf42]",
  away: "bg-[#ffc638]",
  busy: "bg-[#e74f4f]",
  invisible: "bg-[#97a1b8]",
};

interface StatusLightProps {
  status: BuddyStatus;
}

export function StatusLight({ status }: StatusLightProps) {
  return (
    <span
      aria-label={`status-${status}`}
      className={`inline-block h-2.5 w-2.5 border border-black ${STATUS_CLASS_MAP[status]}`}
    />
  );
}
