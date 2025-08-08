import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L7.03 7.83a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 011.06 0l3.25 3.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);