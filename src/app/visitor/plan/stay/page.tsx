import { redirect } from "next/navigation";

/**
 * docs/10_WIREFRAME_GUIDE.md maps accommodation to /visitor/plan/stay, but the
 * flow reads better with zone comparison living at /visitor/plan itself.
 * Keeping the documented URL working rather than leaving it a dead end.
 */
export default function StayIndexPage() {
  redirect("/visitor/plan");
}
