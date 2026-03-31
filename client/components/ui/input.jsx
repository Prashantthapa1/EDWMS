import React from "react";

const FloatingInput = ({
  label = "Enter text",
  type = "text",
  value,
  onChange,
  className = ""
}) => {
  return (
    <div className={`relative w-52 ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder=" "
        className="
          peer
          w-full
          rounded-xl
          border-2
          border-gray-300
          bg-transparent
          px-3
          py-2
          outline-none
          transition
          focus:border-indigo-400
        "
      />

      <label
        className="
          absolute
          left-2
          top-2
          bg-gray-100
          px-1
          text-gray-500
          transition-all
          duration-300
          pointer-events-none
          peer-placeholder-shown:top-2
          peer-placeholder-shown:text-sm
          peer-focus:-top-3
          peer-focus:text-xs
          peer-focus:text-indigo-500
        "
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;