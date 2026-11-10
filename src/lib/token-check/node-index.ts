import type { FigmaNode } from './figma-api-types';

export type NodeInfo = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  childIds: string[];
  /** TEXT 节点的文字内容 */
  characters?: string;
};

/** 单个检查目标内的节点索引，供准确性检查读取上下文 */
export type NodeIndex = {
  get(id: string): NodeInfo | undefined;
  /** 由近到远的祖先链（不含自身） */
  parents(id: string): NodeInfo[];
  /** 同一父级下的其他节点 */
  siblings(id: string): NodeInfo[];
  /** 节点自身或子树中的文字内容，按出现顺序拼接 */
  text(id: string): string;
};

export function createNodeIndex(root: FigmaNode): NodeIndex {
  const byId = new Map<string, NodeInfo>();
  const stack: { node: FigmaNode; parentId: string | null }[] = [{ node: root, parentId: null }];
  while (stack.length) {
    const { node, parentId } = stack.pop()!;
    const children = node.children ?? [];
    byId.set(node.id, {
      id: node.id,
      name: node.name,
      type: node.type,
      parentId,
      childIds: children.map((child) => child.id),
      characters: node.characters,
    });
    for (let i = children.length - 1; i >= 0; i -= 1) stack.push({ node: children[i], parentId: node.id });
  }

  const index: NodeIndex = {
    get: (id) => byId.get(id),
    parents(id) {
      const chain: NodeInfo[] = [];
      let current = byId.get(id)?.parentId;
      while (current) {
        const info = byId.get(current);
        if (!info) break;
        chain.push(info);
        current = info.parentId;
      }
      return chain;
    },
    siblings(id) {
      const parentId = byId.get(id)?.parentId;
      const parent = parentId ? byId.get(parentId) : undefined;
      if (!parent) return [];
      return parent.childIds.filter((childId) => childId !== id).map((childId) => byId.get(childId)!);
    },
    text(id) {
      const parts: string[] = [];
      const visit = (nodeId: string) => {
        const info = byId.get(nodeId);
        if (!info) return;
        if (info.characters) parts.push(info.characters);
        info.childIds.forEach(visit);
      };
      visit(id);
      return parts.join(' ');
    },
  };
  return index;
}
