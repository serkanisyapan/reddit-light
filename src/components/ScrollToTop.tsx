import useScrollPosition from "@/hooks/useScrollPosition";
import { ScrollUpIcon } from "./Icons";

export default function ScrollToTop() {
  const { scrollTop } = useScrollPosition();
  return (
    <>
      {scrollTop >= 400 && (
        <div
          className="tooltip md:fixed md:bottom-4 md:right-24"
          data-tip="Back to top"
        >
          <button
            onClick={() => window.scrollTo(0, 0)}
            className="btn-primary btn-md btn-circle fixed flex items-center justify-center text-base md:bottom-3 md:right-36"
          >
            <ScrollUpIcon />
          </button>
        </div>
      )}
    </>
  );
}
