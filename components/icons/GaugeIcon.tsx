import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const GaugeIcon: React.FC<IconProps> = (props) => (
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
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0"></path>
    <path d="M12 12v-4"></path>
    <path d="M15.5 15.5l-3.5-3.5"></path>
  </svg>
);