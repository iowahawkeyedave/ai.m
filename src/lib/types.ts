export type BuddyStatus = "online" | "away" | "busy" | "invisible";

export interface Buddy {
  id: string;
  name: string;
  status: BuddyStatus;
}
