"use client";
import { HomePageFilters } from "@/constants/filters";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/utils";

const HomeFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [active, setActive] = useState("");

  // HandleClick function which updates the URL and state based on the clicked filter.
  const handleClick = (item: string) => {
    if (active === item) {
      setActive(""); 
      // Create a new URL without the filter.
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
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
        key: "filter",
        value: item.toLowerCase(),
      });
      // Navigate to the new URL without scrolling.
      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          onClick={() => handleClick(item.value)}
          className={`body-medium rounded-lg px-6 py-3 
        capitaliue shadow-none ${
          active === item.value
            ? "bg-primary-100 text-primary-500"
            : "bg-light-800 text-light-500 hover:bg-light-900 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-500"
        }`}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
