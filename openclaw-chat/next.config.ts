import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile three.js packages for compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  // Enable standalone output for Docker deployment
  output: "standalone",
};

export default nextConfig;
