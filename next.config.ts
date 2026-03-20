import type { NextConfig } from 'next';

const BASE_PATH = '/tools/groundwork';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // basePath is filled in by /init from the URL field in context.md.
  // Format: '/tools/your-slug'
  // Must match the source path in modryn-studio-v2's next.config.ts rewrites().
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
};

export default nextConfig;
