"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", textAlign: "center" }}>
        <h2>Something went wrong!</h2>
        <p style={{ color: "#666" }}>{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: "var(--color-background-brand, #cb955b)",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
