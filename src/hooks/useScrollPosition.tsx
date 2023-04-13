import { useEffect, useState } from "react";

export default function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = () => {
    const getUserScrollTop = document.documentElement.scrollTop;
    setScrollTop(getUserScrollTop);
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

  return { scrollPosition, scrollTop };
}
