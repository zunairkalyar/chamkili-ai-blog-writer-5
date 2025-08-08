import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const MarkdownIcon: React.FC<IconProps> = (props) => (
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
    <path d="M3 15h3v-3h3v3h3v-5h-3v-3h-3v3H3z" />
    <path d="M15 11h3v4h3v-4h3V8h-3V5h-3v3h-3z" />
  </svg>
);