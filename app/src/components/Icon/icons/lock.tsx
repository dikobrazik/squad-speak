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
    <path d="M6 6c0-3.311 2.689-6 6-6s6 2.688 6 6v4h3v14h-18v-14h3v-4zm14 5h-16v12h16v-12zm-13-5v4h10v-4c0-2.76-2.24-5-5-5s-5 2.24-5 5z" />
  </svg>
);
