import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const WandIcon: React.FC<IconProps> = (props) => (
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
    <path d="M15 4V2" />
    <path d="M15 10v-2" />
    <path d="M12.5 7.5h-5" />
    <path d="m3 21 9-9" />
    <path d="M15 14h5l-3 3h3" />
  </svg>
);