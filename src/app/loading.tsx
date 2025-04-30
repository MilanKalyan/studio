import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm space-y-4">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground animate-pulse">Loading Kinect...</p>
    </div>
  );
}
