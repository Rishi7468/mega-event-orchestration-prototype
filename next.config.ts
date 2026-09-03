import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The dev-mode indicator badge sits in the bottom-left corner, directly on
   * top of the visitor app's Home tab. Hiding it keeps the mobile nav usable
   * in development and keeps dev chrome out of demo recordings
   * (docs/13_DEMO_SCENARIO.md "remove development warnings").
   */
  devIndicators: false,
};

export default nextConfig;
