import { Navigate } from 'react-router-dom';
import { getTrackingSession } from '@/lib/auth';

export function TrackingSessionGate({ children }: { children: React.ReactNode }) {
  const session = getTrackingSession();
  if (!session) {
    return <Navigate to='/connexion' replace />;
  }
  return <>{children}</>;
}
