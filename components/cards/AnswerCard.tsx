import React from "react";
import Link from "next/link";
import Metric from "../shared/Metric";
import { getTimestamp, formatNumber } from "@/lib/utils";


interface AnswerProps {
  _id: string;
  clerkId?: string | null;
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  question:{
    _id: string;
    title: string;
  } 
  upvotes: number;
  createdAt: Date;
}

const AnswerCard = ({
  _id,
  clerkId,
  upvotes,
  author,
  question,
  createdAt,
}: AnswerProps) => {


  return (
    <Link href={`/question/${question?._id}/#${_id}`}
    className="card-wrapper rounded-[10px] px-11 py-9"
    >
  
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
            {question.title}
          </h3>
        </div>
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user"
          value={author.name}
          title={`- asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles="body-medium text-dark400_light700"
        />
        <Metric
          imgUrl="/assets/icons/like.svg"
          alt="Upvotes"
          value={formatNumber(upvotes)}
          title=" Votes"
          textStyles="small-medium text-dark400_light800"
        />
      </div>
    
    </Link>
  );
};

export default AnswerCard;
