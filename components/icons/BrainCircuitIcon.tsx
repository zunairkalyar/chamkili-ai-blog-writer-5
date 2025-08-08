import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const BrainCircuitIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm6 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-3 4.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-6 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm12-4.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9V3m0 18v-6M9.75 9.75 4.5 6.75m15 6-5.25-3M4.5 17.25l5.25-3m5.25 3L20.25 18" />
  </svg>
);