import { Chat } from '@/components/chat';
import { GameLobby } from '@/components/game-lobby';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-secondary retro-glow font-mono tracking-wider">
          Kinect
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Connect, Chat, and Play.
        </p>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Chat />
        </div>

        {/* Game Lobby Section */}
        <div className="lg:col-span-1">
           <GameLobby />
        </div>
      </main>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <Separator className="my-4" />
        &copy; {new Date().getFullYear()} Kinect. All rights reserved. Built with Next.js and Firebase.
      </footer>
    </div>
  );
}
