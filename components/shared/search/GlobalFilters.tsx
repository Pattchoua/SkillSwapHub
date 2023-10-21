"use client";

import { GlobalSearchFilters } from "@/constants/filters";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const GlobalFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
// Extract the 'type' parameter from the URL and initialize the active state with it
  const typeParams = searchParams.get("type");
  const [active, setActive] = useState(typeParams || "");

  // HandleClick function which updates the URL and state based on the clicked filter.
  const handleClick = (item: string) => {
    if (active === item) {
      setActive("");
      // Create a new URL without the filter.
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: null,
      });
      // Navigate to the new URL without scrolling.
      router.push(newUrl, { scroll: false });
    } else {
      // Set the clicked item as the new active filter.
      setActive(item);
      // Create a new URL with the filter.
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: item.toLowerCase(),
      });
      // Navigate to the new URL without scrolling.
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className=" flex items-center gap-5 px-5 pt-5">
      <p className="text-dark400_light900 body-medium">Type:</p>
      <div className=" flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl
             px-5 py-2 capitalize dark-text-light-800 dark:hover:text-primary-500
             ${
               active === item.value
                 ? "bg-primary-500 text-light-900"
                 : "bg-light-700 text:dark-400 hover:text-primary-500 dark:bag-dark-500"
             }
             
             `}
            onClick={() => handleClick(item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalFilters;
