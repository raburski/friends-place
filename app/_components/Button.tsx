"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "icon";
type IconPosition = "start" | "end";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  loading?: boolean;
  loadingLabel?: string;
};

const classNames = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    icon,
    iconPosition = "start",
    loading = false,
    loadingLabel,
    className,
    disabled,
    type,
    children,
    ...props
  },
  ref
) {
  const isDisabled = Boolean(disabled || loading);
  const showSpinner = loading;
  const label = loading && loadingLabel ? loadingLabel : children;
  const showLabel = !(label === null || label === undefined || label === "");
  const iconNode = showSpinner ? <span className="button-spinner" aria-hidden="true" /> : icon;
  const showIcon = Boolean(iconNode);

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={classNames(
        variant === "secondary" && "secondary-button",
        variant === "icon" && "icon-button",
        loading && "button--loading",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      <span className="button-content">
        {showIcon && iconPosition === "start" ? <span className="button-icon">{iconNode}</span> : null}
        {showLabel ? <span className="button-label">{label}</span> : null}
        {showIcon && iconPosition === "end" ? <span className="button-icon">{iconNode}</span> : null}
      </span>
    </button>
  );
});

type IconButtonProps = Omit<ButtonProps, "children" | "variant" | "iconPosition"> & {
  icon: ReactNode;
  label: string;
};

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      variant="icon"
      icon={icon}
      aria-label={label}
      title={label}
      className={className}
    />
  );
}
