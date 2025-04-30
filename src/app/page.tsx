import { Chat } from '@/components/chat';

export default function Home() {
  return (
    <div className="flex flex-col h-full pb-16"> {/* Adjust padding-bottom to avoid overlap with bottom nav */}
      {/* The main content area will be filled by the Chat component */}
      <Chat />
       {/* Header and Footer are removed as per the new layout */}
       {/* GameLobby is removed as it's part of bottom navigation now */}
    </div>
  );
}
