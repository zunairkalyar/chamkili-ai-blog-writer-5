import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const LightbulbIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path d="M10 3.5a5.5 5.5 0 00-5.456 5.43c.034.254.12.492.235.714l.01.021a5.5 5.5 0 0010.422 0l.01-.02a6.03 6.03 0 00.235-.715A5.5 5.5 0 0010 3.5z" />
    <path fillRule="evenodd" d="M10 15a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5zM8 15a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM12 15a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z" clipRule="evenodd" />
    <path d="M4.5 9.5a5.5 5.5 0 1111 0v1.517a3.502 3.502 0 01-2.126 3.193.75.75 0 00-.616.837 9.92 9.92 0 01-5.516 0 .75.75 0 00-.616-.837A3.502 3.502 0 014.5 11.017V9.5z" />
  </svg>
);