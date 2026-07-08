import { PlatformTab, PlatformTabs } from './PlatformTabs';

type PlatformCodeBlockProps = {
  androidTitle?: string;
  androidCode?: string;
  iosTitle?: string;
  iosCode?: string;
};

export function PlatformCodeBlock({
  androidTitle,
  androidCode = '',
  iosTitle,
  iosCode = '',
}: PlatformCodeBlockProps) {
  if (!androidCode && !iosCode) return null;

  return (
    <PlatformTabs>
      {androidCode ? (
        <PlatformTab platform="android" title={androidTitle}>
          {androidCode}
        </PlatformTab>
      ) : null}
      {iosCode ? (
        <PlatformTab platform="ios" title={iosTitle}>
          {iosCode}
        </PlatformTab>
      ) : null}
    </PlatformTabs>
  );
}
