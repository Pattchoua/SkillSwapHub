import Answers from "@/components/forms/Answers";
import Metric from "@/components/shared/Metric";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RenderTag";
import { getQuestionsById } from "@/lib/actions/question.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { formatNumber, getTimestamp } from "@/lib/utils";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async ({ params }) => {
  const response = await getQuestionsById({
    questionId: params.id,
  });
  const { userId: clerkId } = auth();
  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  }

  return (
    <>
      <div className="flex-start w-full flex-col">
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
          <div className="flex justify-end">Voting</div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5">
          {response.title}
        </h2>
      </div>
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
      <ParseHTML data={response.content} />

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

      <Answers
        question={response.content}
        questionId={JSON.stringify(response._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  );
};

export default page;
