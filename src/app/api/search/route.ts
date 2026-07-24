import { chineseSearchTokenizer } from '@/lib/search-tokenizer';
import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

const os4SearchSource = {
  ...source,
  getPages: () =>
    source.getPages().filter((page) => page.slugs[0] === 'os4'),
};

export const { GET } = createFromSource(os4SearchSource, {
  tokenizer: chineseSearchTokenizer,
});
