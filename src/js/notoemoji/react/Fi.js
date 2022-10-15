import * as React from "react";

function SvgFi(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={1800}
      height={1100}
      {...props}
    >
      <path fill="#fff" d="M0 0h1800v1100H0z" />
      <path fill="#003580" d="M0 400h1800v300H0z" />
      <path fill="#003580" d="M500 0h300v1100H500z" />
    </svg>
  );
}

export default SvgFi;