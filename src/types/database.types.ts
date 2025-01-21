export interface Profile {
  id: string;
  email: string;
  points: number;
  created_at: string;
  is_admin: boolean;
}

export interface PotholeReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'in-progress' | 'resolved';
  image_url: string;
  created_at: string;
  updated_at: string;
  votes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface UPIReward {
  id: string;
  user_id: string;
  points_redeemed: number;
  upi_id: string;
  status: 'pending' | 'completed';
  created_at: string;
}