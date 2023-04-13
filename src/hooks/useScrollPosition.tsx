import { useEffect, useState } from "react";

export default function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(false);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      setScrollPosition(true);
      setTimeout(() => {
        setScrollPosition(false);
      }, 500);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
}
