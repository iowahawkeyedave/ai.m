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
    <aside className="aim-window aim-buddy-window w-[320px] p-2">
      <header className="aim-titlebar mb-2 flex items-center justify-between rounded-[2px] px-2 py-1 text-sm font-bold">
        <span className="flex items-center gap-2">
          <span className="aim-title-icon" aria-hidden="true" />
          <span>Buddy List</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="aim-system-btn" data-kind="min" aria-hidden="true" />
          <span className="aim-system-btn" data-kind="max" aria-hidden="true" />
          <span className="aim-system-btn" data-kind="close" aria-hidden="true" />
        </span>
      </header>
      <div className="aim-buddy-hero">
        <div className="aim-running-man" aria-hidden="true">AIM</div>
        <div>
          <p className="text-[15px] font-bold text-black">AOL Instant</p>
          <p className="text-[15px] font-bold text-black">Messenger</p>
          <p className="text-[11px] text-[#3d3d3d]">Retro buddy console</p>
        </div>
      </div>
      <div className="mt-3 text-[11px] font-black tracking-[0.25em] text-[#4a4a4a]">
        BUDDIES
      </div>
      <div className="aim-buddy-groups mt-2">
        <div className="aim-inset bg-white p-2">
          <h3 className="text-[14px] font-bold text-black">Buddies</h3>
          <div className="mt-1 max-h-[320px] space-y-0.5 overflow-y-auto pr-1">
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
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" className="aim-footer-action">
          <span className="aim-footer-icon" aria-hidden="true">!</span>
          <span>Sign Off</span>
        </button>
        <button type="button" className="aim-footer-action">
          <span className="aim-footer-icon" aria-hidden="true">*</span>
          <span>Setup</span>
        </button>
        <button type="button" className="aim-footer-action">
          <span className="aim-footer-icon" aria-hidden="true">?</span>
          <span>Help</span>
        </button>
      </div>
      <button type="button" className="aim-launch-btn mt-3 w-full">
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black bg-[#f3d325] text-[10px] font-bold text-black">
          AIM
        </span>
        Send Instant Message
      </button>
      <p className="mt-2 text-[11px] text-[#505050]">
        Online Buddies: {visibleBuddies}/{buddies.length}
      </p>
    </aside>
  );
}
