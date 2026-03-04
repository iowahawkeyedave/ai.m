export interface OpenClawEvent {
  type: string;
  payload: unknown;
}

export function parseOpenClawEvents(): OpenClawEvent[] {
  return [];
}
