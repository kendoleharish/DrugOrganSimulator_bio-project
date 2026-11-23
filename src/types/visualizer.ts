import { OrganState } from '../engine/types';

export type CameraPreset = 'body' | 'brain' | 'heart' | 'liver' | 'kidneys' | 'stomach';

export type OrganId = 'brain' | 'heart' | 'stomach' | 'liver' | 'kidneys';

export interface OrganTelemetryInfo {
  id: OrganId;
  name: string;
  anatomicalName: string;
  role: string;
  state: OrganState;
  position: [number, number, number];
  keyMetabolite?: string;
  biomarkers: {
    label: string;
    value: string;
    unit?: string;
    severity?: 'safe' | 'warning' | 'danger';
  }[];
}

export type ViewMode = 'composite' | 'organs-only' | 'vascular-highlight' | 'wireframe';
