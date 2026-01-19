import type { IconProps } from "../types";

export const ArrowUpIcon = (props: IconProps) => (
  <svg
    role="img"
    aria-label="arrow-up icon"
    width={props.size}
    height={props.size}
    fillRule="evenodd"
    clipRule="evenodd"
    viewBox="0 0 24 24"
    color={props.color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z"
      fill="currentColor"
    />
    {/* <path d="M23.245 20l-11.245-14.374-11.219 14.374-.781-.619 12-15.381 12 15.391-.755.609z" /> */}
  </svg>
);
