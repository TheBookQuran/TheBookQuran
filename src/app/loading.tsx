import React from "react";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        width: "100%",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "4px solid var(--color-background-brand-faint, rgba(203, 149, 91, 0.1))",
          borderTopColor: "var(--color-background-brand, #cb955b)",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
