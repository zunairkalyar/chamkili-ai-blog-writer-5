import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l2.22-2.22a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L6.47 12.28a.75.75 0 011.06-1.06l2.22 2.22V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
  </svg>
);