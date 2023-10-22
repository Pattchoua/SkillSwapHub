import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimestamp = (createdAt: Date): string => {
  const now = new Date();

  const diffInSeconds = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000
  );
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

const monthNames: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getFormattedDate = (date: Date = new Date()): string => {
  const day: number = date.getDate();
  const month: string = monthNames[date.getMonth()];
  const year: number = date.getFullYear();

  const formattedDate = `${day} ${month} ${year}`;
  return formattedDate;
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

//utility function to update a given URL's query parameters
export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  // Parse the existing query parameters into an object.
  const currentUrl = qs.parse(params);

  // Update (or add) the specified key-value pair to the parsed query parameters.
  currentUrl[key] = value;

  // Return the stringified URL with the updated query parameters.
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true } // the key won't be included in the output.
  );
};

//utility function to remove a given URL's query parameters
interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  // Parse the existing query parameters into an object.
  const currentUrl = qs.parse(params);

  // remove each Keys to the parsed query parameters.
  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  // Returning a new stringified URL with the updated query parameters.
  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
};

//TODO: Function assignBadges
// The BadgeParam interface describes the shape of the `params` object that the `assignBadges` function expects.
// This interface has a single property `criteria` which is an array.
// Each item in the array should have a `type` which should be one of the keys of the BADGE_CRITERIA object, and a `count` which is a number.
interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}

export const assignBadges = (params: BadgeParam) => {
  // badgeCounts object initializes counts of GOLD, SILVER, and BRONZE badges to 0.
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  // Destructure the `criteria` from the `params` object.
  const { criteria } = params;

  // For each item in the `criteria` array:
  criteria.forEach((item) => {
    // Destructure the `type` and `count` properties from the `item`.
    const { type, count } = item;
    // Get the badge levels  for the current `type` from the BADGE_CRITERIA object
    const badgeLevels: any = BADGE_CRITERIA[type];

    // For each level in the badge levels:
    Object.keys(badgeLevels).forEach((level: any) => {
      // Check if the current `count` is greater than or equal to the threshold for this badge level.
      if (count >= badgeLevels[level]) {
        // increment the badge count for the particular level
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });
  return badgeCounts;
};
