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
        "flex w-full items-center justify-between border px-2 py-1.5 text-left text-[13px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1b4ba4]",
        isActive
          ? "border-[#3558ab] bg-[#d7e5ff] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#99ade0]"
          : "border-[#a8b4d2] bg-[#f8f8fc] shadow-[inset_1px_1px_0_#ffffff] hover:bg-[#ebf1ff]",
      ].join(" ")}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-bold tracking-[0.1px] text-[#0f3a80]">
          {buddy.displayName}
        </span>
        <span className="truncate text-[11px] text-[#2f518f]">{buddy.provider}: {buddy.model}</span>
      </span>
      <StatusLight status={status} />
    </button>
  );
}
