import React from "react";

const AnimatedCheckbox = ({
  label = "Accept terms",
  checked,
  onChange,
  id = "checkbox",
  className = ""
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden peer"
      />

      <label
        htmlFor={id}
        className="flex items-center cursor-pointer select-none"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7"
          fill="none"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            className="
              fill-gray-200/60
              stroke-purple-600
              stroke-2
              transition-all
              duration-500
            "
            style={{
              strokeDasharray: checked ? 0 : 800,
              strokeDashoffset: checked ? 0 : 800
            }}
          />

          <path
            d="M7 12l3 3 7-7"
            className="
              stroke-purple-600
              stroke-2
              fill-none
              transition-all
              duration-500
            "
            style={{
              strokeDasharray: 172,
              strokeDashoffset: checked ? 0 : 172
            }}
          />
        </svg>

        <span className="ml-3 text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default AnimatedCheckbox;