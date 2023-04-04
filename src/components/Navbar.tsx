import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  const { user, isSignedIn } = useUser();

  let userContent;
  if (!user || !user?.username || !isSignedIn) {
    userContent = (
      <div>
        <SignInButton />
      </div>
    );
  } else {
    userContent = (
      <div className="flex flex-row items-center gap-2">
        <span>{user.username}</span>
        <div className="dropdown-end dropdown">
          <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
            <Image
              className="rounded-full"
              src={`${user.profileImageUrl}`}
              alt={`${user.username}'s profile picture`}
              width={32}
              height={32}
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
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <Link href="/" className="btn-ghost btn text-xl normal-case">
          Reddit Light
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div>
          <div>{userContent}</div>
        </div>
      </div>
    </div>
  );
};
