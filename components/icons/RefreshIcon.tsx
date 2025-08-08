import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M15.312 11.25a.75.75 0 01.75.75v.038l.004.005a5.25 5.25 0 01-10.5 0l.004-.005v-.038a.75.75 0 011.5 0v.038a3.75 3.75 0 107.5 0v-.038a.75.75 0 01.75-.75zM9.25 2.5a.75.75 0 00-1.5 0V6a.75.75 0 001.5 0V2.5zM3.804 5.304a.75.75 0 10-1.06-1.06l-1.5 1.5a.75.75 0 101.06 1.06l1.5-1.5zM16.196 5.304a.75.75 0 001.06-1.06l-1.5-1.5a.75.75 0 10-1.06 1.06l1.5 1.5z" clipRule="evenodd" />
  </svg>
);