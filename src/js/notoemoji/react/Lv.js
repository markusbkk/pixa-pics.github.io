import * as React from "react";

function SvgLv(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={1200}
      height={600}
      {...props}
    >
      <path fill="#9E3039" d="M0 0h1200v600H0" />
      <path fill="#FFF" d="M0 240h1200v120H0" />
    </svg>
  );
}

export default SvgLv;