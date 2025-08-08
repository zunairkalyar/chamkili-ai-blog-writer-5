import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const SitemapIcon: React.FC<IconProps> = (props) => (
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
    <rect x="3" y="3" width="6" height="6" rx="1"></rect>
    <rect x="15" y="15" width="6" height="6" rx="1"></rect>
    <rect x="3" y="15" width="6" height="6" rx="1"></rect>
    <path d="M21 6h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4"></path>
    <path d="M6 9V7a2 2 0 0 1 2-2h4"></path>
    <path d="M18 9v2a2 2 0 0 1-2 2h-4"></path>
    <path d="M6 15v-2a2 2 0 0 1 2-2h4"></path>
  </svg>
);