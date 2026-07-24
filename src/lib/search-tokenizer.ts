const chineseSegmenter = new Intl.Segmenter('zh-CN', {
  granularity: 'word',
});

/**
 * Orama 内置的 english tokenizer 会忽略中文字符。
 * 使用运行时自带的 Intl.Segmenter，同时保留英文、数字与 Design Token 名称搜索。
 */
export const chineseSearchTokenizer = {
  language: 'zh-CN',
  normalizationCache: new Map<string, string>(),
  tokenize(raw: string): string[] {
    if (typeof raw !== 'string') return [raw];

    const normalized = raw.normalize('NFKC').toLocaleLowerCase('zh-CN');
    const tokens = Array.from(chineseSegmenter.segment(normalized))
      .filter((item) => item.isWordLike)
      .map((item) => item.segment);

    return Array.from(new Set(tokens));
  },
};
