import React from "react";

const SubmitButton = ({ children = "Submit", loading }) => {
  return (
    <button
      className="
        mt-4
        w-full
        h-12
        rounded-lg
        bg-black
        text-white
        font-medium
        hover:bg-neutral-800
        transition
      "
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default SubmitButton;