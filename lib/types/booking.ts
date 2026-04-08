export interface Booking {
  id: string;
  clientName: string;
  serviceName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'confirmed' | 'pending' | 'cancelled';
  price?: number;
  notes?: string;
  /** Optional: present when sourced from the backend (used for forfeit/update calls). */
  sourceId?: string;
  paymentStatus?: string;
}

export interface DayBookings {
  date: string; // YYYY-MM-DD
  bookings: Booking[];
}
