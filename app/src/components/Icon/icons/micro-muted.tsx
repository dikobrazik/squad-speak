import type { IconProps } from "../types";

export const MicroMutedIcon = (props: IconProps) => (
  <svg
    role="img"
    aria-label="muted microphone icon"
    color={props.color}
    xmlns="http://www.w3.org/2000/svg"
    width={props.size}
    height={props.size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 24H8V23H11.5V19.982C7.87 19.726 5 16.695 5 13V11H6V13.01C6.005 16.317 8.692 19 12 19C15.311 19 18 16.311 18 13V11H19V13C19 16.695 16.13 19.726 12.5 19.982V23H16V24ZM7 5C7 2.24 9.24 0 12 0C14.76 0 17 2.24 17 5V13C17 15.76 14.76 18 12 18C9.24 18 7 15.76 7 13V5ZM16 5C16 2.792 14.208 1 12 1C9.792 1 8 2.792 8 5V13C8 15.208 9.792 17 12 17C14.208 17 16 15.208 16 13V5Z"
      fill="currentColor"
    />
    <line
      x1="1.6854"
      y1="19.6114"
      x2="22.6854"
      y2="2.61138"
      stroke="currentColor"
    />
  </svg>
);
