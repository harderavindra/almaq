import React from 'react';
import './droplet.css'; // Contains custom keyframes

const DropletLoader = ({className}) => {
  return (
    <div className={`${className} origin-top-left`}>
      <svg
        width="106"
        height="141"
        viewBox="0 0 106 141"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_542_52"
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="106"
          height="150"
        >
          <path
            d="M51.0001 0C17.5 50.5 -7.00001 69 2.99999 109C30 163 96.25 136 103 109C113 69 85 50 51.0001 0Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_542_52)">
          <path d="M183 -3H-17V186H183V-3Z" fill="url(#paint0_linear_542_52)" />
          <path
            className="animate-wave2"
            d="M-17 154.182C16.3333 131.273 28.5 186.864 83 154.182C137.5 121.5 149.667 177.09 183 154.182V326H-17V154.182Z"
            fill="#5B94FF"
          />
          <path
            className="animate-wave3"
            d="M-69.5 132.182C-36.1667 109.273 11 155.682 61 143.5C111 131.318 93 117.5 130.5 132.182V304H-69.5V132.182Z"
            fill="#4185F5"
          />
          <path
            className="animate-wave1"
            d="M123 141.5C89.6667 116.3 86 182.1 41 145C-4 107.9 -33.667 181.1 -67 155.9V326H133L123 141.5Z"
            fill="#405AE1"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_542_52"
            x1="-17"
            y1="-3"
            x2="-17"
            y2="123"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7BA2F9" />
            <stop offset="1" stopColor="#E7F0FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default DropletLoader;
