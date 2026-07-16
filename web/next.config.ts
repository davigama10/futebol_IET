import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Desativa o "streaming metadata": nesse app pequeno não precisamos da
  // otimização pra bots/SEO, e essa via alternativa estava causando um
  // hydration mismatch no boundary interno do Next (div `hidden` do metadata).
  htmlLimitedBots: /.*/,
};

export default nextConfig;
