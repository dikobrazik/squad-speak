import * as icons from "./icons";

const THEME_COLORS = [
  "primary",
  "secondary",
  "danger",
  "warning",
  "success",
] as const;

type IconProps = {
  className?: string;
  name: keyof typeof icons;
  size?: number;
  color?: (typeof THEME_COLORS)[number] | `#${string}`;
};

export const Icon = ({ color, ...props }: IconProps) => {
  let colorValue = color || "currentColor";

  if (THEME_COLORS.includes(color as (typeof THEME_COLORS)[number])) {
    colorValue = `hsl(var(--heroui-${color}))`;
  }

  return icons[props.name]({ size: 24, color: colorValue, ...props });
};
