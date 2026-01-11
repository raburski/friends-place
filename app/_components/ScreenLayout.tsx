"use client";

import { type HTMLAttributes, type ReactNode } from "react";

type ScreenLayoutProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  headerClassName?: string;
  titleClassName?: string;
};

const classNames = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export function ScreenLayout({
  title,
  subtitle,
  actions,
  className,
  headerClassName,
  titleClassName,
  children,
  ...props
}: ScreenLayoutProps) {
  return (
    <div className={classNames("screen-layout", className)} {...props}>
      {title || subtitle || actions ? (
        <div className={classNames("screen-layout__header", headerClassName)}>
          <div className="screen-layout__heading">
            {title ? (
              <h1 className={classNames("page-title", "screen-layout__title", titleClassName)}>
                {title}
              </h1>
            ) : null}
            {subtitle ? <p className="muted screen-layout__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="screen-layout__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
