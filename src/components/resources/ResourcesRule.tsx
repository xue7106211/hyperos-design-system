/** Full-bleed horizontal hairline with Vercel-style end crosses */
export function ResourcesRule() {
  return (
    <div className="resources-rule" aria-hidden="true">
      <span className="resources-grid-cross resources-rule-cross resources-rule-cross--l" />
      <span className="resources-grid-cross resources-rule-cross resources-rule-cross--r" />
    </div>
  );
}
