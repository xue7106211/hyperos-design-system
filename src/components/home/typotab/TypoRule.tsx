/** Full-bleed hairline with end crosses — matches /resources rule language */
export function TypoRule() {
  return (
    <div className="typo-rule" aria-hidden="true">
      <span className="typo-rule-cross typo-rule-cross--l" />
      <span className="typo-rule-cross typo-rule-cross--r" />
    </div>
  );
}
