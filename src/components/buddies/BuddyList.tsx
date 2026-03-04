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
  return (
    <aside className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3">
      <h2 className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Buddies
      </h2>
      <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1 md:max-h-none md:overflow-visible md:pr-0">
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
