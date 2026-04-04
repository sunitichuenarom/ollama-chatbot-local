/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile three.js packages for compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  // Enable standalone output for Docker deployment
  output: "standalone",
};

export default nextConfig;
