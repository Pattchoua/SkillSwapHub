import React from "react";
import Filter from "./Filter";
import { AnswerFilters } from "@/constants/filters";
import { getAnswers } from "@/lib/actions/answer.actions";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";

// Define the props for the AllAnswers component
interface Props {
  totalAnswers: number;
  questionId: string;
  userId: string;
  page?: number;
  filter?: number;
}

// The main AllAnswers component
const AllAnswers = async ({
  totalAnswers,
  questionId,
  userId,
  page,
  filter,
}: Props) => {
  // Fetch answers based on the question ID.
  const response = await getAnswers({ questionId });

  return (
    <div className="mt-11">
      {/* Total answers and the filter component. */}
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>

      {/* Mapping and rendering each answer. */}
      <div>
        {response.answers.map((answer) => (
          <article key={answer._id} className="ligth-border border-b py-10">
            {/* author information. */}
            <div className="flex items-center justify-between">
              <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                {/* Link to the author's profile with their image and name. */}
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    alt="profile"
                    width={18}
                    height={18}
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className=" body-semibold text-dark300_light700">
                      {answer.author.name}{" "}
                    </p>
                    <p className="small-regular text-light400_light500 ml-1 mt-0.5 line-clamp-1">
                      answered
                      {getTimestamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>
                {/* Placeholder for voting functionality */}
                <div className="flex justify-end">
                  <Votes
                    type="Answer"
                    itemId={JSON.stringify(answer._id)}
                    userId={JSON.stringify(userId)}
                    upvotes={answer.upvotes.length}
                    hasupVoted={answer.upvotes.includes(userId)}
                    downvotes={answer.downvotes.length}
                    hasdownVoted={answer.downvotes.includes(userId)}
                  />
                </div>
              </div>
            </div>
            {/* Displaying the content of the answer by parsing its HTML */}
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default AllAnswers;
