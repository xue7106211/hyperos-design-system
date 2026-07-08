import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 容器化部署输出：只打包运行必需的最小 node_modules，配合 Dockerfile 的 runner 阶段使用
  output: 'standalone',
};

export default withMDX(config);
