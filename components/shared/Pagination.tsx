"use client";

import React from "react";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageNumber: number;
  isNext: boolean;
}

const Pagination = ({ pageNumber, isNext }: Props) => {
  const router = useRouter(); // Use Next.js router to navigate between pages
  const searchParams = useSearchParams(); // Retrieve the current search parameters from the URL

  // Function to handle the navigation to the previous or next page
  const handleNavigation = (direction: string) => {
    // Calculate the next page number based on the direction (previous or next)
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;

    // Construct the new URL with the updated page number
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });
    // Navigate to the new URL
    router.push(newUrl);
  };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      {/* "Prev" button; disabled when on the first page */}
      <Button
        disabled={pageNumber === 1}
        onClick={() => handleNavigation("prev")}
        className="light-border-2  btn flex min-h-[36px] items-center justify-center gap-2 border "
      >
        <p className="body-medium text-dark200_light800">Prev</p>
      </Button>
      {/* Display the current page number */}
      <div className="flex items-center justify-center bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>

      {/* "Next" button; disabled if there's no next page */}
      <Button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="light-border-2  btn flex min-h-[36px] items-center justify-center gap-2 border "
      >
        <p className="body-medium text-dark200_light800">Next</p>
      </Button>
    </div>
  );
};

export default Pagination;
