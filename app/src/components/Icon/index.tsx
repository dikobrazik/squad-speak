import type { CSSProperties } from "react";
import * as icons from "./icons";

const THEME_COLORS = [
  "heroui-primary",
  "heroui-secondary",
  "heroui-danger",
  "heroui-warning",
  "heroui-success",
] as const;

type IconProps = {
  className?: string;
  name: keyof typeof icons;
  size?: number;
  color?:
    | Exclude<CSSProperties["color"], undefined>
    | (typeof THEME_COLORS)[number]
    | `#${string}`;
};

export const Icon = ({ color = "currentColor", ...props }: IconProps) => {
  let colorValue = color;

  if (THEME_COLORS.includes(color as (typeof THEME_COLORS)[number])) {
    colorValue = `hsl(var(--${color}))`;
  }

  return icons[props.name]({ size: 24, color: colorValue, ...props });
};
