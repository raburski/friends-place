"use client";

import { type HTMLAttributes, type ReactNode } from "react";

type SectionCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  bodyClassName?: string;
};

const classNames = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export function SectionCard({
  title,
  subtitle,
  actions,
  className,
  bodyClassName,
  children,
  ...props
}: SectionCardProps) {
  const content = bodyClassName ? <div className={bodyClassName}>{children}</div> : children;

  return (
    <div className={classNames("card", className)} {...props}>
      {title || subtitle || actions ? (
        <div className="section-card__header">
          <div className="section-card__heading">
            {title ? <h2 className="section-title">{title}</h2> : null}
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="section-card__actions">{actions}</div> : null}
        </div>
      ) : null}
      {content}
    </div>
  );
}
