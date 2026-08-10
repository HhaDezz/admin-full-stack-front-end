import type { ReactNode } from 'react';

export interface SectionProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Wraps the content in a card. */
  card?: boolean;
  id?: string;
}

export function Section({ title, description, actions, children, card, id }: SectionProps) {
  const headId = id ? `${id}-title` : undefined;
  return (
    <section className="section" id={id} aria-labelledby={headId}>
      {(title || actions) && (
        <div className="section-head">
          <div>
            {title && <h2 id={headId}>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="section-actions">{actions}</div>}
        </div>
      )}
      {card ? <div className="card card-pad">{children}</div> : children}
    </section>
  );
}
