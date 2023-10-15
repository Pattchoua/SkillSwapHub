'use client'


import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface Props {
  type: string;
  itemId: string;
  userId: string;
  upvotes: number;
  hasupvoted: boolean;
  downvotes: number;
  hasdownvoted: boolean;
  hasSaved?: boolean;
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  hasupvoted,
  downvotes,
  hasdownvoted,
  hasSaved,
}: Props) => {

// function to save the votes
const handleSave = () => {

}

// function to handle the votes
const handleVote = (action: string) => {

}


  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        {/* upvotes */}
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasupvoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            alt="upvote"
            height={18}
            width={18}
            className="cursor-pointer"
            onClick={() => handleVote(upvote)}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatNumber(upvotes)}
            </p>
          </div>
        </div>
        {/* downvotes */}
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasdownvoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            alt="downvote"
            height={18}
            width={18}
            className="cursor-pointer"
            onClick={() => handleVote(downvote)}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {/* hassaved */}
          <Image
            src={
              hasSaved
                ? "/assets/icons/star-filled.svg"
                : "/assets/icons/star-red.svg"
            }
            alt="star"
            height={18}
            width={18}
            className="cursor-pointer"
            onClick={handleSave}
          />
    </div>
  );
};

export default Votes;
