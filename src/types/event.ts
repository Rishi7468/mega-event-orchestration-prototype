export type EventStatus = "normal" | "elevated" | "critical";

export type EventScheduleItem = {
  id: string;
  time: string;
  title: string;
  venueId: string;
  expectedImpact: "low" | "medium" | "high";
};

export type Event = {
  id: string;
  name: string;
  location: string;
  dateRange: string;
  status: EventStatus;
  expectedVisitors: number;
  schedule: EventScheduleItem[];
};
