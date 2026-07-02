import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "large" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "default",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.btn,
    styles[variant],
    size === "large" ? styles.large : "",
    size === "xl" ? styles.xl : "",
    fullWidth ? styles.fullWidth : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
