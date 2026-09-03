# Camera footage

Drop site-camera clips for the operator surface in this folder and register
them in `src/data/media.ts`. Nothing in the application hardcodes a video path.

```
public/media/cameras/cam-07.mp4      # the clip
public/media/cameras/cam-07.jpg      # optional poster frame
```

```ts
// src/data/media.ts
export const cameraMedia: CameraMedia[] = [
  { cameraId: "cam-07", src: "/media/cameras/cam-07.mp4", attribution: "Supplied by event operations" },
];
```

The `cameraId` must match an entry in `src/data/cameras.ts`.

## Format

MP4 (H.264 + AAC) plays everywhere. Keep clips short and loopable — they are
muted, looped and autoplayed, and are decoration around the analytics, not the
analytics themselves. A few seconds at 720p is plenty; large files slow the
demo down and count against the deployment size.

## Sourcing

Only use footage you have the right to use:

- properly licensed stock footage
- public-domain footage
- Creative Commons footage, within its licence terms
- footage supplied directly by event organisers or partners

Do not scrape video from third-party sites, and do not use copyrighted footage
without permission. Record the source in `attribution` — it is shown under the
player.

## When there is no footage

This is the shipped state. Every camera renders a labelled **Simulated camera
feed** panel and all the analytics still work. The same fallback catches a
registered file that fails to load, so a missing asset can never break a demo.
