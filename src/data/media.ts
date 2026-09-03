/**
 * Where camera footage comes from.
 *
 * Pages never reference a video path directly — they ask this registry for a
 * camera's media and render whatever comes back, so footage can be added,
 * swapped or removed in one place. Nothing here is generated: the registry is
 * empty until real, properly licensed footage is dropped into
 * `public/media/cameras/` and registered below (see the README in that folder).
 *
 * With no entry — the shipped state of this prototype — the camera component
 * renders its labelled "Simulated camera feed" panel instead. The same happens
 * if a registered file fails to load, so a missing or corrupt asset can never
 * break the operator surface mid-demo.
 */
export type CameraMedia = {
  cameraId: string;
  /** Public path, e.g. "/media/cameras/cam-07.mp4". Served statically. */
  src: string;
  /** Optional still shown before playback starts. */
  poster?: string;
  /** Where the footage came from — shown as provenance under the player. */
  attribution?: string;
};

export const cameraMedia: CameraMedia[] = [
  {
    cameraId: "cam-07",
    src: "/media/cameras/camera-01.mp4",
    attribution: "Simulated camera feed",
  },
  {
    cameraId: "cam-03",
    src: "/media/cameras/camera-02.mp4",
    attribution: "Simulated camera feed",
  },
  {
    cameraId: "cam-12",
    src: "/media/cameras/camera-03.mp4",
    attribution: "Simulated camera feed",
  },
];

export function getCameraMedia(cameraId: string): CameraMedia | undefined {
  return cameraMedia.find((media) => media.cameraId === cameraId);
}

export function hasCameraMedia(cameraId: string): boolean {
  return getCameraMedia(cameraId) !== undefined;
}
