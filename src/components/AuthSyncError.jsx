import { AlertCircle } from 'lucide-react';

// Used when auth itself is fine but syncing the profile with our backend
// failed. Deliberately NOT a redirect to /login — the user's credentials
// already worked, so sending them back to re-enter them would just loop
// forever without ever explaining what's actually wrong.
export default function AuthSyncError({ message }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center bg-background z-50">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
