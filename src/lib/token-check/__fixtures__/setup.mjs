/**
 * 测试辅助：让 `node --test` 直接加载使用无扩展名相对 import 的 .ts 模块。
 * 源码保持 Next 构建习惯（`./engine` 而不是 `./engine.ts`），这里在解析失败时补 `.ts`。
 * 必须在 import 被测模块之前执行，被测模块需用动态 import 加载。
 */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../');
    if (relative && !/\.(?:[cm]?[jt]s|json)$/.test(specifier) && context.parentURL?.endsWith('.ts')) {
      try {
        return nextResolve(`${specifier}.ts`, context);
      } catch {
        // 交给默认解析，保留原始报错
      }
    }
    return nextResolve(specifier, context);
  },
});

export function loadFixture(name) {
  return JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));
}
