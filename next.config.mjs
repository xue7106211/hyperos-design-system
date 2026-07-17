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

      // —— 旧 IA（无 os 前缀）→ 新 os4 路径 ——
      {
        source: '/docs/foundations',
        destination: '/docs/os4/general',
        permanent: true,
      },
      {
        source: '/docs/foundations/iconography',
        destination: '/docs/os4/general/icons',
        permanent: true,
      },
      {
        source: '/docs/foundations/:path*',
        destination: '/docs/os4/general/:path*',
        permanent: true,
      },
      {
        source: '/docs/components/:path*',
        destination: '/docs/os4/components/:path*',
        permanent: true,
      },
      {
        source: '/docs/patterns/:path*',
        destination: '/docs/os4/system/:path*',
        permanent: true,
      },
      {
        source: '/docs/resources/:path*',
        destination: '/docs/os4/best-practices',
        permanent: true,
      },

      // —— 旧 os4 Foundations → 通用设计标准 ——
      {
        source: '/docs/os4/foundations',
        destination: '/docs/os4/general',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/index',
        destination: '/docs/os4/general',
        permanent: true,
      },
      {
        source: '/docs/os4/general/overview',
        destination: '/docs/os4/general',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/principles',
        destination: '/docs/os4/general/principles',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/colors',
        destination: '/docs/os4/general/design-token',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/typography',
        destination: '/docs/os4/general/layout',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/spacing',
        destination: '/docs/os4/general/layout',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/elevation',
        destination: '/docs/os4/general/layout',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/motion',
        destination: '/docs/os4/general/motion',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/iconography',
        destination: '/docs/os4/general/icons',
        permanent: true,
      },
      {
        source: '/docs/os4/foundations/accessibility',
        destination: '/docs/os4/general/inclusive/accessibility',
        permanent: true,
      },

      // —— 旧组件路径 ——
      {
        source: '/docs/os4/components/actions/icon-button',
        destination: '/docs/os4/components/actions/button',
        permanent: true,
      },
      {
        source: '/docs/os4/components/navigation/bottom-nav',
        destination: '/docs/os4/components/navigation/bottom-navigation',
        permanent: true,
      },
      {
        source: '/docs/os4/components/feedback/dialog',
        destination: '/docs/os4/components/containers/dialog',
        permanent: true,
      },
      {
        source: '/docs/os4/components/feedback/snackbar',
        destination: '/docs/os4/components/containers/snackbar',
        permanent: true,
      },
      {
        source: '/docs/os4/components/feedback/progress',
        destination: '/docs/os4/system/loading-refresh',
        permanent: true,
      },
      {
        source: '/docs/os4/components/display/chip',
        destination: '/docs/os4/components/display/badge',
        permanent: true,
      },

      // —— 旧 Patterns → 系统特性 / 展示类 ——
      {
        source: '/docs/os4/patterns',
        destination: '/docs/os4/system',
        permanent: true,
      },
      {
        source: '/docs/os4/patterns/index',
        destination: '/docs/os4/system',
        permanent: true,
      },
      {
        source: '/docs/os4/patterns/empty-states',
        destination: '/docs/os4/components/display/empty-state',
        permanent: true,
      },
      {
        source: '/docs/os4/patterns/:path*',
        destination: '/docs/os4/system',
        permanent: true,
      },

      // —— 旧 Resources → 最佳实践 / Token ——
      {
        source: '/docs/os4/resources',
        destination: '/docs/os4/best-practices',
        permanent: true,
      },
      {
        source: '/docs/os4/resources/design-tokens',
        destination: '/docs/os4/general/design-token',
        permanent: true,
      },
      {
        source: '/docs/os4/resources/:path*',
        destination: '/docs/os4/best-practices',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
