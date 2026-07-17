import { useState, useEffect, useRef, useCallback } from "react";

export function useCopyToClipboard(resetDelay = 1000) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    (text: string) => {
      const onSuccess = () => {
        setIsCopied(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
      };

      const fallbackCopy = (content: string) => {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = content;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          onSuccess();
        } catch (err) {
          console.error("Fallback copy failed:", err);
        }
      };

      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(onSuccess)
          .catch((err) => {
            console.error("Failed to copy using clipboard API, trying fallback:", err);
            fallbackCopy(text);
          });
      } else {
        fallbackCopy(text);
      }
    },
    [resetDelay]
  );

  return { copy, isCopied };
}
