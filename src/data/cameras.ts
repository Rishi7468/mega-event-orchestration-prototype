import type { Camera, CameraDevice, CameraObservation } from "@/types";

/**
 * Feed devices.
 *
 * Every device here is a site camera — that is the source this prototype is
 * built around, and there is no aerial hardware behind it, so there is no
 * aerial device and no aerial UI. The `source` field on CameraDevice stays
 * source-agnostic so an aerial provider could be added later without
 * reshaping anything that consumes camera data, but nothing pretends such a
 * feed exists today. No real feed is integrated: every observation below is
 * simulated demo data.
 */
export const cameraDevices: CameraDevice[] = [
  {
    id: "cam-07",
    name: "CAM-07 · Main Corridor",
    source: "site-camera",
    zoneId: "central",
    coverageArea: "Main corridor → Gate A approach",
  },
  {
    id: "cam-03",
    name: "CAM-03 · North Transit Hub",
    source: "site-camera",
    zoneId: "north",
    coverageArea: "Triveni Marg hub forecourt",
  },
  {
    id: "cam-12",
    name: "CAM-12 · East Approach",
    source: "site-camera",
    zoneId: "east",
    coverageArea: "East arterial approach road",
  },
  {
    id: "cam-04",
    name: "CAM-04 · South Connector",
    source: "site-camera",
    zoneId: "south",
    coverageArea: "South arterial connector corridor",
  },
];

/**
 * Observations move with the simulation, in the same direction as their
 * zone's crowd pressure — these readings are the *source* of the pressure
 * figures in the lineage story (observation → density → zone pressure →
 * forecast). CAM-07's spike reading is the 8,734 people / 83% density figure
 * quoted in docs/08_UI_SPEC.md §15 and wireframe 7.
 *
 * CAM-12 (registered in src/data/media.ts against the file literally named
 * `camera-03.mp4` — note that filename does NOT correspond to camera id
 * "cam-03", which is a different device using `camera-02.mp4`) carries
 * reference footage of a visibly dense crowd. That footage is a fixed loop —
 * it looks the same in every simulation phase — so CAM-12's baseline reading
 * is set busier than a typical quiet-zone camera even in "normal" conditions
 * (a specific approach-road pinch point can run busy while the wider East
 * Zone it sits in stays low-pressure; East's own zone-level crowdPressure in
 * zones.ts is unaffected, exactly as it is for every other phase — only this
 * camera's local reading moves). It then escalates to "elevated" during the
 * demand-spike scenario, same as CAM-07, and eases — but doesn't fully
 * reset — in the outcome, the same partial-recovery shape CAM-07 shows
 * (outcome sits between normal and the spike peak, not back at the floor).
 * The footage remains simulated demo reference footage either way — the
 * detection boxes visible in the clip are part of the supplied video, not
 * live computer vision this application is running.
 */
export const cameraObservationsNormal: CameraObservation[] = [
  {
    cameraId: "cam-07",
    observedAt: "09:24:15",
    peopleDetected: 4_910,
    densityPercent: 47,
    flowPerMinute: 258,
    movementDirection: "→ North",
    status: "normal",
  },
  {
    cameraId: "cam-03",
    observedAt: "09:24:12",
    peopleDetected: 1_640,
    densityPercent: 29,
    flowPerMinute: 118,
    movementDirection: "→ Gate B",
    status: "normal",
  },
  {
    cameraId: "cam-12",
    observedAt: "09:24:08",
    peopleDetected: 1_180,
    densityPercent: 55,
    flowPerMinute: 96,
    movementDirection: "→ Central",
    status: "normal",
  },
  {
    cameraId: "cam-04",
    observedAt: "09:24:05",
    peopleDetected: 2_150,
    densityPercent: 38,
    flowPerMinute: 140,
    movementDirection: "→ North",
    status: "normal",
  },
];

export const cameraObservationsSpike: CameraObservation[] = [
  {
    cameraId: "cam-07",
    observedAt: "09:26:02",
    peopleDetected: 8_734,
    densityPercent: 83,
    flowPerMinute: 410,
    movementDirection: "→ Gate A",
    status: "elevated",
  },
  {
    cameraId: "cam-03",
    observedAt: "09:26:00",
    peopleDetected: 1_920,
    densityPercent: 34,
    flowPerMinute: 152,
    movementDirection: "→ Gate B",
    status: "normal",
  },
  {
    cameraId: "cam-12",
    observedAt: "09:25:57",
    peopleDetected: 1_860,
    densityPercent: 74,
    flowPerMinute: 148,
    movementDirection: "→ Central",
    status: "elevated",
  },
  {
    cameraId: "cam-04",
    observedAt: "09:25:55",
    peopleDetected: 3_420,
    densityPercent: 52,
    flowPerMinute: 210,
    movementDirection: "→ North",
    status: "normal",
  },
];

export const cameraObservationsOutcome: CameraObservation[] = [
  {
    cameraId: "cam-07",
    observedAt: "09:41:30",
    peopleDetected: 6_180,
    densityPercent: 59,
    flowPerMinute: 304,
    movementDirection: "→ Gate B",
    status: "normal",
  },
  {
    cameraId: "cam-03",
    observedAt: "09:41:28",
    peopleDetected: 2_360,
    densityPercent: 41,
    flowPerMinute: 188,
    movementDirection: "→ Gate B",
    status: "normal",
  },
  {
    cameraId: "cam-12",
    observedAt: "09:41:24",
    peopleDetected: 1_420,
    densityPercent: 61,
    flowPerMinute: 118,
    movementDirection: "→ Central",
    status: "normal",
  },
  {
    cameraId: "cam-04",
    observedAt: "09:41:20",
    peopleDetected: 2_450,
    densityPercent: 40,
    flowPerMinute: 155,
    movementDirection: "→ North",
    status: "normal",
  },
];

export function resolveCameras(observations: CameraObservation[]): Camera[] {
  return cameraDevices.map((device) => {
    const observation = observations.find((item) => item.cameraId === device.id);
    return {
      ...device,
      observedAt: observation?.observedAt ?? "—",
      peopleDetected: observation?.peopleDetected ?? 0,
      densityPercent: observation?.densityPercent ?? 0,
      flowPerMinute: observation?.flowPerMinute ?? 0,
      movementDirection: observation?.movementDirection ?? "—",
      status: observation?.status ?? "normal",
    };
  });
}
