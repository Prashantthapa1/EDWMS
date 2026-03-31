import React from "react";

const Notification = ({
  title = "Notification",
  message = "This is a notification message.",
  color = "#32a6ff",
  className = ""
}) => {
  return (
    <div
      className={`relative w-72 h-32 rounded-xl overflow-hidden font-sans group ${className}`}
      style={{
        background: "#29292c"
      }}
    >
      {/* inner background */}
      <div className="absolute inset-px rounded-[14px] bg-zinc-900 z-20" />

      {/* gradient border line */}
      <div
        className="
          absolute
          left-2
          top-3
          bottom-3
          w-1
          rounded
          transition-transform
          duration-300
          group-hover:translate-x-1
          z-10
        "
        style={{
          background:
            "linear-gradient(to bottom,#2eadff,#3d83ff,#7e61ff)"
        }}
      />

      {/* glow */}
      <div
        className="
          absolute
          w-[20rem]
          h-80
          -translate-x-1/2
          -translate-y-1/2
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-10
          z-30
        "
        style={{
          background:
            "radial-gradient(circle closest-side at center, white, transparent)"
        }}
      />

      {/* border glow */}
      <div
        className="
          absolute
          w-[20rem]
          h-80
          -translate-x-1/2
          -translate-y-1/2
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-10
          z-10
        "
        style={{
          background:
            "radial-gradient(circle closest-side at center, white, transparent)"
        }}
      />

      {/* content */}
      <div className="relative z-10 flex flex-col h-full justify-center">
        <h3
          className="
            px-5 pt-2
            font-medium
            text-lg
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
          style={{ color }}
        >
          {title}
        </h3>

        <p
          className="
            px-5
            text-gray-400
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default Notification;