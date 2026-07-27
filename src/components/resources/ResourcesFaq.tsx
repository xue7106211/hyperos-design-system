'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { resourcesFaq } from '@/lib/resources';

export function ResourcesFaq() {
  const [openKey, setOpenKey] = useState<string | null>(
    resourcesFaq[0]?.items[0]
      ? `${resourcesFaq[0].title}-0`
      : null,
  );

  return (
    <section className="resources-faq">
      <h2 className="resources-h2 resources-h2-tight">常见问题</h2>

      {resourcesFaq.map((group) => (
        <div key={group.title}>
          <h3 className="resources-faq-label">{group.title}</h3>
          {group.items.map((item, index) => {
            const key = `${group.title}-${index}`;
            const open = openKey === key;
            return (
              <div key={key} className="resources-faq-item">
                <button
                  type="button"
                  className="resources-faq-trigger"
                  aria-expanded={open}
                  onClick={() => setOpenKey(open ? null : key)}
                >
                  <span>{item.question}</span>
                  <Plus className="resources-faq-icon" aria-hidden />
                </button>
                {open ? (
                  <div className="resources-faq-panel">
                    <p>{item.answer}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
