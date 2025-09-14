// src/app/dashboard/loading.tsx
import PlayerCardSkeleton from "@/components/PlayerCardSkeleton";

export default function DashboardLoading() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Players</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlayerCardSkeleton />
        <PlayerCardSkeleton />
        <PlayerCardSkeleton />
      </div>
    </div>
  );
}