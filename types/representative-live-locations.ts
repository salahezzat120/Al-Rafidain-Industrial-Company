export interface RepresentativeLiveLocation {
  id: string
  representative_id: string
  latitude: number
  longitude: number
  accuracy?: number | null
  altitude?: number | null
  speed?: number | null
  heading?: number | null
  timestamp: string
  battery_level?: number | null
  is_charging?: boolean | null
  network_type?: string | null
  created_at: string
}

export interface CreateRepresentativeLiveLocationData {
  representative_id: string
  latitude: number
  longitude: number
  accuracy?: number | null
  altitude?: number | null
  speed?: number | null
  heading?: number | null
  battery_level?: number | null
  is_charging?: boolean | null
  network_type?: string | null
}

export interface UpdateRepresentativeLiveLocationData extends Partial<CreateRepresentativeLiveLocationData> {
  id: string
}

export interface RepresentativeWithLocation extends RepresentativeLiveLocation {
  representative_name?: string
  representative_phone?: string
  is_online?: boolean
  last_seen?: string
}
<<<<<<< Updated upstream

export interface Attendance {
  id: string;
  representative_id: string;
  check_in_time: string;
  check_out_time?: string | null;
  check_in_latitude?: number | null;
  check_in_longitude?: number | null;
  check_out_latitude?: number | null;
  check_out_longitude?: number | null;
  total_hours?: number | null;
  status: 'checked_in' | 'checked_out' | 'break';
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AttendanceWithRepresentative extends Attendance {
  representative_name?: string;
  representative_phone?: string;
}

export interface ChatMessage {
  id: string;
  representative_id: string;
  message_type: 'text' | 'image' | 'file' | 'location';
  content: string;
  sender_type: 'representative' | 'admin' | 'system';
  is_read?: boolean | null;
  metadata?: any;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateChatMessageData {
  representative_id: string;
  message_type?: 'text' | 'image' | 'file' | 'location';
  content: string;
  sender_type?: 'representative' | 'admin' | 'system';
  is_read?: boolean | null;
  metadata?: any;
}
=======
>>>>>>> Stashed changes
