import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 容器化部署输出：只打包运行必需的最小 node_modules，配合 Dockerfile 的 runner 阶段使用
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/os4',
        permanent: false,
      },
      {
        source: '/docs/os5',
        destination: '/docs/os4',
        permanent: false,
      },
      {
        source: '/docs/os5/:path*',
        destination: '/docs/os4/:path*',
        permanent: false,
      },
      {
        source: '/docs/foundations/:path*',
        destination: '/docs/os4/foundations/:path*',
        permanent: true,
      },
      {
        source: '/docs/components/:path*',
        destination: '/docs/os4/components/:path*',
        permanent: true,
      },
      {
        source: '/docs/patterns/:path*',
        destination: '/docs/os4/patterns/:path*',
        permanent: true,
      },
      {
        source: '/docs/resources/:path*',
        destination: '/docs/os4/resources/:path*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
