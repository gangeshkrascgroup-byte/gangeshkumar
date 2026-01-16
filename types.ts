
export enum AlertStatus {
  SAFE = 'SAFE',
  MONITORING = 'MONITORING',
  DANGER = 'DANGER',
  RESCUE_IN_PROGRESS = 'RESCUE_IN_PROGRESS'
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
}

export interface SafetyLog {
  id: string;
  timestamp: number;
  event: string;
  type: 'info' | 'warning' | 'critical';
}

export interface NearbyResponder {
  id: string;
  type: 'police' | 'ambulance' | 'citizen';
  name: string;
  distance: number;
  bearing: number;
  eta: number;
}

export interface SafeHaven {
  name: string;
  type: string;
  address: string;
  url: string;
  distance?: string;
}
