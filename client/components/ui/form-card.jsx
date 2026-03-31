import React from "react";

const FormCard = ({ children, title = "Login", className = "" }) => {
  return (
    <div
      className={`
        w-[450px]
        bg-white
        rounded-2xl
        p-8
        flex
        flex-col
        gap-3
        shadow-md
        ${className}
      `}
    >
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

      {children}
    </div>
  );
};

export default FormCard;