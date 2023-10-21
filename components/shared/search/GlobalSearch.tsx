"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import GlobalResults from "./GlobalResults";

const GlobalSearch = () => {
  // Access the current router object, the pathname, and the search parameters.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a reference for the search container.
  const searchContainerRef = useRef(null);

  // Get the current query parameter for the search.
  const query = searchParams.get("q");

  // Maintain the search input value in the component's local state.
  const [search, setSearch] = useState(query || "");
  const [isOpen, setIsOpen] = useState(false);

  // Effect hook to close search and reset input value when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        searchContainerRef.current &&
        // @ts-ignore
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    setIsOpen(false);
    // Add an event listener for clicks on the document.
    document.addEventListener("click", handleOutsideClick);

    // Clean up the listener on component unmount.
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [pathname]);

  // useEffect hook to listens changes in the search input value.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // If there's a search value, update the URL accordingly.
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "global",
          value: search,
        });
        router.push(newUrl, { scroll: false });
      } else {
        // If the search is cleared and there was a query, remove related keys from the URL.
        if (query) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["global", "type"],
          });
          router.push(newUrl, { scroll: false });
        }
      }
    }, 500);
     // Clear the timeout when the component or dependencies update.
    return () => clearTimeout(delayDebounceFn);
  }, [search, router, pathname, searchParams, query]);

  return (
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <div className="background-light800_darkgradient relative flex min-h[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/assets/icons/search.png"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />
        <Input
          type="text"
          value={search}
          placeholder="Search globally"
          className="paragraph-regular text-dark400_light700 no-focus placeholder background-light800_darkgradient border-none shadow-none outline-none"
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === " && isOpen") setIsOpen(false);
          }}
        />
      </div>
      {isOpen && <GlobalResults />}
    </div>
  );
};

export default GlobalSearch;
