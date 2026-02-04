import ky from 'ky';

export const api = ky.create({
  prefixUrl: 'http://localhost:4000/api',
  retry: 0
});

export type Target = {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'pending';
  lastChecked: string | null;
  createdAt: string;
};

export type HistoryEntry = {
  targetId: string;
  status: 'up' | 'down';
  responseTime: number;
  timestamp: string;
};
