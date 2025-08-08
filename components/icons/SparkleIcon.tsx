import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const SparkleIcon: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    <path d="M4.5 4.5L6 8L9.5 9.5L6 11L4.5 14.5L3 11L-0.5 9.5L3 8L4.5 4.5Z" />
    <path d="M19.5 19.5L18 16L14.5 14.5L18 13L19.5 9.5L21 13L24.5 14.5L21 16L19.5 19.5Z" />
  </svg>
);