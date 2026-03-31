import { FC } from "react";

export const SwatchesIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="8" height="8" rx="2" />
    <rect x="14" y="2" width="8" height="8" rx="2" />
    <rect x="2" y="14" width="8" height="8" rx="2" />
    <path d="M14 14h8v2a4 4 0 0 1-4 4h-4v-6z" />
    <path d="M14 14v6" />
    <path d="M14 20h8" />
  </svg>
);
