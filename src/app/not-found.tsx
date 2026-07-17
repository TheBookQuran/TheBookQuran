import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", textAlign: "center" }}>
        <h2>Page Not Found</h2>
        <p style={{ color: "#666" }}>Could not find requested resource.</p>
        <Link
          href="/en"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.5rem 1.5rem",
            backgroundColor: "var(--color-background-brand, #cb955b)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Return Home
        </Link>
      </body>
    </html>
  );
}
