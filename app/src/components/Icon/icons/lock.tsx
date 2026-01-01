import type { IconProps } from "../types";

export const LockIcon = (props: IconProps) => (
  <svg
    role="img"
    aria-label="lock icon"
    viewBox="0 0 24 24"
    width={props.size}
    height={props.size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    color={props.color}
  >
    <path
      d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8v-4zm11 16h-14v-10h14v10z"
      fill="currentColor"
    />
  </svg>
);
