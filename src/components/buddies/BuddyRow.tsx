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
        "flex w-full items-center gap-2 px-1.5 py-1 text-left text-[13px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1b4ba4]",
        isActive
          ? "bg-[#dbe7ff]"
          : "hover:bg-[#f2f2f2]",
      ].join(" ")}
    >
      <span className="shrink-0">
        <StatusLight status={status} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-black">
          {buddy.displayName}
        </span>
        <span className="block truncate text-[10px] text-[#5b5b5b]">
          {buddy.provider}
        </span>
      </span>
    </button>
  );
}
