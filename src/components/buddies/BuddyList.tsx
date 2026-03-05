import { BuddyRow } from "@/components/buddies/BuddyRow";
import type { Buddy, BuddyStatus } from "@/lib/types";

interface BuddyListProps {
  buddies: Buddy[];
  activeBuddyId: string | null;
  onSelectBuddy: (buddyId: string) => void;
}

function normalizeStatus(statusFlavor: string | null): BuddyStatus {
  switch (statusFlavor) {
    case "online":
    case "away":
    case "busy":
    case "invisible":
      return statusFlavor;
    default:
      return "online";
  }
}

export function BuddyList({
  buddies,
  activeBuddyId,
  onSelectBuddy,
}: BuddyListProps) {
  const visibleBuddies = buddies.filter((buddy) => normalizeStatus(buddy.statusFlavor) !== "invisible").length;

  return (
    <aside className="aim-panel w-full min-w-0 p-2.5 sm:p-3">
      <h2 className="aim-titlebar rounded-[2px] px-2 py-1 text-xs font-semibold tracking-wide">
        Buddy List
      </h2>
      <p className="aim-inset mt-2 bg-[#f7f9ff] px-2 py-1 text-[11px] text-[#2a4a8f]">
        Online Buddies ({visibleBuddies}/{buddies.length})
      </p>
      <div className="mt-2 max-h-[42vh] space-y-2 overflow-y-auto pr-1 md:max-h-none md:overflow-visible md:pr-0">
        {buddies.map((buddy) => (
          <BuddyRow
            key={buddy.id}
            buddy={buddy}
            status={normalizeStatus(buddy.statusFlavor)}
            isActive={activeBuddyId === buddy.id}
            onSelect={onSelectBuddy}
          />
        ))}
      </div>
    </aside>
  );
}
