import { useEffect, useRef } from "react";

export default function useTextarea() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textArea = textareaRef.current;
    if (!textArea) return;
    const resizeTextArea = () => {
      textArea.style.height = "auto";
      textArea.style.height = `${textArea.scrollHeight}px`;
    };
    textArea.addEventListener("input", resizeTextArea, false);
    return () => textArea.removeEventListener("input", resizeTextArea);
  }, []);

  return textareaRef;
}
