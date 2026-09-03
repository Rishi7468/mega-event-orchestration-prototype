import { Bell, MapPin } from "lucide-react";

type VisitorTopBarProps = {
  location: string;
  notificationCount?: number;
};

export function VisitorTopBar({ location, notificationCount = 0 }: VisitorTopBarProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <MapPin className="h-4 w-4 text-foreground-muted" />
        {location}
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border"
      >
        <Bell className="h-4 w-4 text-foreground-muted" />
        {notificationCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
            {notificationCount}
          </span>
        )}
      </button>
    </div>
  );
}
