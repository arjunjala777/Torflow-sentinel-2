import { ApiSession } from '../types';

// Simulating an API call
export async function fetchSessions(limit: number = 1): Promise<ApiSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a mock API response
      resolve([
        {
          session_id: crypto.randomUUID(),
          target_ip: '192.168.1.105',
          suspect_ip: '10.0.0.42',
          packet_size: 1420,
          confidence_score: 85,
          total_packets_matched: 120
        }
      ]);
    }, 500);
  });
}

export async function fetchStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        active_nodes: 4231,
        flagged_sessions: 12,
        system_status: 'ONLINE'
      });
    }, 300);
  });
}
