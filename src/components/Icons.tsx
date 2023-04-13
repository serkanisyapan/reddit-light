export const PlusIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-plus"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
};

export const MoreIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-more-horizontal"
    >
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  );
};

export const EditIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="white"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-edit-2"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
};

export const DeleteIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-trash"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
};

export const AlertIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-alert-triangle"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
};

interface VoteProps {
  isVoting: boolean;
  isVoted: { voted: boolean; value: number };
  handlePostVote: (voteType: string) => void;
}

export const UpvoteIcon = ({
  isVoting,
  handlePostVote,
  isVoted,
}: VoteProps) => {
  return (
    <svg
      onClick={(event) => {
        event.stopPropagation();
        if (isVoting) return;
        handlePostVote("upvote");
      }}
      className={`cursor-pointer hover:stroke-primary ${
        isVoted.value === 1 ? "fill-primary stroke-primary" : ""
      }`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="miter"
    >
      <polygon points="3 14 12 3 21 14 16 14 16 22 8 22 8 14 3 14"></polygon>
    </svg>
  );
};

export const DownvoteIcon = ({
  isVoting,
  handlePostVote,
  isVoted,
}: VoteProps) => {
  return (
    <svg
      onClick={(event) => {
        event.stopPropagation();
        if (isVoting) return;
        handlePostVote("downvote");
      }}
      className={`cursor-pointer hover:stroke-sky-600 ${
        isVoted.value === -1 ? "fill-sky-600 stroke-sky-600" : ""
      }`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="miter"
      transform="matrix(1, 0, 0, -1, 0, 0)"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <polygon points="3 14 12 3 21 14 16 14 16 22 8 22 8 14 3 14"></polygon>
      </g>
    </svg>
  );
};

export const ScrollUpIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="feather feather-chevron-up"
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
};
