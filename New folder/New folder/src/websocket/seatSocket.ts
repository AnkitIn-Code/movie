type SeatUpdateCallback = (seatId: string, status: 'booked' | 'locked' | 'available') => void;
type SeatUpdateMessage = { seatId: string; status: 'booked' | 'locked' | 'available' };

export class SeatWebSocket {
  private callbacks: SeatUpdateCallback[] = [];
  private showId: string;
  private socket: WebSocket | null = null;

  constructor(showId: string) {
    this.showId = showId;
  }

  connect() {
    const baseUrl = import.meta.env.VITE_WS_BASE_URL ?? '';
    if (!baseUrl) return;

    const url = `${baseUrl.replace(/\/$/, '')}/ws/shows/${this.showId}/seats`;
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SeatUpdateMessage;
        if (payload?.seatId && payload?.status) {
          this.callbacks.forEach(cb => cb(payload.seatId, payload.status));
        }
      } catch {
        // Ignore malformed messages
      }
    };
  }

  onSeatUpdate(cb: SeatUpdateCallback) {
    this.callbacks.push(cb);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.callbacks = [];
  }
}
