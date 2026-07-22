import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a temporary ngrok HTTPS URL load Next's development-only assets when
  // testing the camera on a physical phone. This does not affect production.
  allowedDevOrigins: ["*.ngrok-free.dev"],
};

export default nextConfig;
