import { kebabTo } from "./utils.ts";

export const getIconFileContent = (
  iconName: string,
  svg: string,
) => `import type { IconProps } from "../types";

export const ${kebabTo(iconName, "pascal")}Icon = (props: IconProps) => (
  ${svg
    .replace(
      "<svg ",
      `<svg
    role="img"
    aria-label="${iconName} icon"
    viewBox="0 0 24 24"
    width={props.size}
    height={props.size}
    fillRule="evenodd"
    clipRule="evenodd"
    color={props.color}
  `,
    )
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/width="[^"]*"/g, "")
    .replace(/height="[^"]*"/g, "")
    .replace(/fill-rule="[^"]*"/g, "")
    .replace(/clip-rule="[^"]*"/g, "")
    .replace(/colors="[^"]*"/g, "")}
);
`;
