import React from "react";

const FormInput = ({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-gray-900">{label}</label>

      <div className="flex items-center border border-gray-200 rounded-lg h-12 px-2 focus-within:border-blue-500 transition">
        {icon}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="ml-2 w-full h-full outline-none"
        />
      </div>
    </div>
  );
};

export default FormInput;