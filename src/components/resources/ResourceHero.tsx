import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { resourcesPage } from "@/lib/resources";

/*
把资源中心的 Hero 区域，根据配置数据渲染成带入场动画、可选跳转链接的标题模块。
它本身没有 `useState`、`useEffect` 或事件处理，因此是一个**纯展示型组件**
*/

function Reveal({
  index,
  block,
  children,
}: {
  index: number;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`resources-reveal-item${
        block ? " resources-hero-reveal-block" : ""
      }`}
      style={{ "--index": index } as CSSProperties}
    >
      {children}
    </span>
  );
}

export function ResourceHero() {
  const titleWords = resourcesPage.title.split(/\s+/);
  let revealIndex = 0;
  const taughtByHref = resourcesPage.taughtByHref.trim();

  return (
    <header className="resources-hero">
      <h1 className="resources-h1">
        {titleWords.map((word, i) => (
          <span key={word}>
            {i > 0 ? " " : null}
            <Reveal index={revealIndex++}>{word}</Reveal>
          </span>
        ))}
      </h1>
      <p className="resources-hero-sub">
        <Reveal index={revealIndex++}>{resourcesPage.description}</Reveal>
      </p>
      <div className="resources-taught-by">
        <Reveal block index={revealIndex++}>
          <span
            className={[
              "resources-taught-by-pill",
              taughtByHref ? "" : "resources-taught-by-pill--static",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="resources-taught-by-label">
              {resourcesPage.taughtByLabel}
            </span>
            {taughtByHref ? (
              <Link href={taughtByHref}>{resourcesPage.taughtByName}</Link>
            ) : (
              <span className="resources-taught-by-name">
                {resourcesPage.taughtByName}
              </span>
            )}
          </span>
        </Reveal>
      </div>
    </header>
  );
}
