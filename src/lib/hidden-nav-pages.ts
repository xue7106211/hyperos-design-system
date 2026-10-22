/**
 * 「隐藏页」：仅通过超链接可达、不出现在 `meta.json` / 侧边导航树的文档页。
 * 这类页面也应隐藏侧边栏整体外壳（搜索框、OS4/OS5 版本切换器），而非仅仅
 * 显示一棵空的导航树。在此集中维护白名单，供 `docs/layout.tsx` 的侧边栏
 * slot 覆盖判断使用。
 */
const HIDDEN_NAV_SLUGS = ['os4/components/containers/dialog-vs-drawer'];

export function isHiddenNavPathname(pathname: string): boolean {
  const normalized = pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
  return HIDDEN_NAV_SLUGS.includes(normalized);
}
