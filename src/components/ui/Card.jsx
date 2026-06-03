// src/components/ui/Card.jsx
import React from "react";

export function Card({ children, className = "", onClick, hoverable = false }) {
  return (
    <div
      onClick={onClick}
      className={[
        "bg-white rounded-lg shadow-md overflow-hidden",
        hoverable
          ? "transition-shadow duration-200 hover:shadow-xl cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-5 py-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}