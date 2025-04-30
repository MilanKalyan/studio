import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn(
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm space-y-4 transition-opacity duration-300",
        className
    )}>
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-50" />
        <span className="absolute text-xs font-bold text-primary">K</span> {/* Example: Logo/Initial */}
      </div>
      <p className="text-lg text-muted-foreground animate-pulse tracking-wide">Kinecting...</p>
    </div>
  );
}
