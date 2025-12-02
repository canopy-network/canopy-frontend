import { SVGProps } from "react";

export function TableArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="w-9 h-9 l flex items-center justify-center">
      <svg
        width={16}
        height={16}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        <path
          d="M15 7.5C15 3.358 11.642 -1.46783e-07 7.5 -3.27835e-07C3.358 -5.08888e-07 -1.46783e-07 3.358 -3.27835e-07 7.5C-5.08888e-07 11.642 3.358 15 7.5 15C11.642 15 15 11.642 15 7.5ZM7.92375 8.78575L3.25 8.78575L3.25 6.21425L7.92375 6.21425L7.92375 3.5L11.75 7.5L7.92375 11.5L7.92375 8.78575Z"
          fill="currentColor"
          fillOpacity={0.48}
        />
      </svg>
    </div>
  );
}
