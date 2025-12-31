import * as icons from "./icons";

type IconProps = {
  name: keyof typeof icons;
  size?: number;
  color?: string;
};

export const Icon = (props: IconProps) => {
  return icons[props.name]({ size: 24, ...props });
};
