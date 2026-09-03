/**
 * `source` is deliberately abstract so a feed can later be backed by
 * site CCTV or an aerial/drone provider (e.g. ThinkAerial) without
 * changing anything that consumes Camera data.
 */
export type CameraSource = "site-camera" | "drone";
export type CameraStatus = "normal" | "elevated" | "critical";

/**
 * The fixed identity of a feed: where it is, what kind of sensor it is, what
 * it covers. Nothing here changes as conditions change.
 *
 * `altitudeMeters` is only meaningful for aerial sources. The field exists so
 * the model already carries the shape a real aerial provider would deliver
 * (timestamp, id, altitude, count, density, movement, zone) — no integration,
 * just a data model that wouldn't need reshaping to accept one.
 *
 * Footage is deliberately NOT referenced here. Video lives in the media
 * registry (src/data/media.ts) keyed by camera id, so a device record stays
 * a description of the sensor rather than a place to hardcode an asset path.
 */
export type CameraDevice = {
  id: string;
  name: string;
  source: CameraSource;
  zoneId: string;
  coverageArea: string;
  altitudeMeters?: number;
};

/** What a feed reports at a given moment — the raw observation. */
export type CameraObservation = {
  cameraId: string;
  observedAt: string;
  peopleDetected: number;
  densityPercent: number;
  /** People per minute crossing the counting line — the flow rate. */
  flowPerMinute: number;
  movementDirection: string;
  status: CameraStatus;
};

/** A device joined with its current observation, which is what the UI renders. */
export type Camera = CameraDevice & Omit<CameraObservation, "cameraId">;
