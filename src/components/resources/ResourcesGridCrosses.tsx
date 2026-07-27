/** Vercel-style grid crosses at guide intersections */
export function ResourcesGridCrosses() {
  return (
    <div className="resources-grid-crosses" aria-hidden="true">
      <span className="resources-grid-cross resources-grid-cross--tl" />
      <span className="resources-grid-cross resources-grid-cross--tr" />
      <span className="resources-grid-cross resources-grid-cross--bl" />
      <span className="resources-grid-cross resources-grid-cross--br" />
      <span className="resources-grid-cross resources-grid-cross--mt" />
      <span className="resources-grid-cross resources-grid-cross--mb" />
      <span className="resources-grid-cross resources-grid-cross--ml" />
      <span className="resources-grid-cross resources-grid-cross--mr" />
      <span className="resources-grid-cross resources-grid-cross--mc" />
    </div>
  );
}
