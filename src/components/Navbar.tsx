import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { PlusIcon } from "./Icons";

export const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const profileName = router.query?.slug;

  let userContent;
  if (!user || !user?.username || !isSignedIn) {
    userContent = (
      <div className="mr-5 text-xl text-white">
        <SignInButton />
      </div>
    );
  } else {
    userContent = (
      <div className="flex items-center gap-2">
        <div className="tooltip tooltip-bottom mr-2" data-tip="Create Post">
          <Link href="/create-post">
            <PlusIcon />
          </Link>
        </div>
        <span>{user.username}</span>
        <div className="dropdown-end dropdown">
          <label tabIndex={0}>
            <Image
              className="cursor-pointer rounded-full"
              src={`${user.profileImageUrl}`}
              alt={`${user.username}'s profile picture`}
              width={44}
              height={44}
            />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-primary p-2 shadow"
          >
            <li>
              <Link href={`/user/${user.username}`}>Profile</Link>
            </li>
            <li>
              <SignOutButton />
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar flex min-h-[70px] items-center justify-between bg-primary text-primary-content">
      <div>
        <Link
          href="/"
          className="flex flex-row items-center gap-2 text-xl normal-case"
        >
          <Image
            className="box-border rounded-full border-[2px] border-[#df744a] object-cover"
            src="/redditlight.png"
            alt="Reddit Light"
            width={52}
            height={52}
          />
          <span className="hidden md:block">Reddit Light</span>
        </Link>
        {profileName && (
          <span className="ml-3 hidden text-base sm:block">
            u/{profileName}
          </span>
        )}
      </div>
      <div className="flex-none gap-2">
        <div>{userContent}</div>
      </div>
    </div>
  );
};
