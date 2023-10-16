import Answers from "@/components/forms/Answers";
import AllAnswers from "@/components/shared/AllAnswers";
import Metric from "@/components/shared/Metric";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RenderTag";
import Votes from "@/components/shared/Votes";
import { getQuestionsById } from "@/lib/actions/question.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { formatNumber, getTimestamp } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async ({ params }: { params: any }) => {
  // Fetching the question based on the provided ID.
  const response = await getQuestionsById({
    questionId: params.id,
  });

  // Getting the user ID from Clerk authentication.
  const { userId: clerkId } = auth();
  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  }

  return (
    <>
      <div className="flex-start w-full flex-col">
        {/* author information and voting options */}
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${response.author.clerkId}`}
            className=" flex items-center justify-start gap-1"
          >
            <Image
              src={response.author.picture}
              alt="profile"
              className="rounded-full"
              width={22}
              height={22}
            />
            <p className="paragraph-semibold text-dark300_light700">
              {response.author.name}
            </p>
          </Link>
          {/* Voting options */}
          <div className="flex justify-end">
            <Votes
              type="Question"
              itemId={JSON.stringify(response._id)}
              userId={JSON.stringify(mongoUser._id)}
              upvotes={response.upvotes.length}
              hasupVoted={response.upvotes.includes(mongoUser._Id)}
              downvotes={response.downvotes.length}
              hasdownVoted={response.downvotes.includes(mongoUser._Id)}
              hasSaved={mongoUser?.saved.includes(response._id)}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5">
          {response.title}
        </h2>
      </div>

      {/* metrics */}
      <div className=" mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={`asked ${getTimestamp(response.createdAt)}`}
          title=" Asked"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          value={formatNumber(response.answers.length)}
          title=" Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={formatNumber(response.views)}
          title=" Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>

      {/* parsing and rendering the content of the question */}
      <ParseHTML data={response.content} />

      {/* parsing and rendering the content of the question */}
      <div className=" mt-8 flex flex-wrap gap-2">
        {response.tags.map((tag: any) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
            totalQuestions={0}
          />
        ))}
      </div>

      {/* all answers for the question. */}
      <AllAnswers
        questionId={response._id}
        userId={JSON.stringify(mongoUser._id)}
        totalAnswers={response.answers.length}
      />

      {/* create and submit an answer. */}
      <Answers
        question={response.content}
        questionId={JSON.stringify(response._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  );
};

export default page;
