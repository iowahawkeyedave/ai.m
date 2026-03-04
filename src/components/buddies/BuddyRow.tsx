import { StatusLight } from "@/components/buddies/StatusLight";
import type { Buddy, BuddyStatus } from "@/lib/types";

interface BuddyRowProps {
  buddy: Buddy;
  status: BuddyStatus;
  isActive: boolean;
  onSelect: (buddyId: string) => void;
}

export function BuddyRow({ buddy, status, isActive, onSelect }: BuddyRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(buddy.id)}
      className={[
        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
        isActive
          ? "border-blue-500 bg-blue-50"
          : "border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50",
      ].join(" ")}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-zinc-900">
          {buddy.displayName}
        </span>
        <span className="truncate text-xs text-zinc-500">{buddy.model}</span>
      </span>
      <StatusLight status={status} />
    </button>
  );
}
