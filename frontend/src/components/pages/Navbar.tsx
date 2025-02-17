import React from "react";
import Link from "next/link";

import MaxWidthWrapper from "../MaxWidthWrapper";
import { buttonVariants } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky h-16 w-full inset-x-0 top-0 z-30 border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all ">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between ">
          <Link href={"/"} className="z-40 text-2xl font-semibold">
            Pay Phone
          </Link>

          <div className="flex gap-2 items-center">
          {/* <Link
            href={"/signin"}
            className={buttonVariants({
              variant: "ghost",
              size: "default",
            })}
          >
            Sign In{" "}
          </Link> */}
          <Link
            href={"/signin"}
            className={buttonVariants({
              variant: "ghost",
              size: "default",
            })}
          >
            Sign In{" "}
          </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
