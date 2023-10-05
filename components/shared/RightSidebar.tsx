import Link from "next/link";
import React from "react";
import Image from "next/image";
import RenderTag from "./RenderTag";

const TopQuestions = [
  { _id: "1", title: "How Can You Enhance Your Culinary Skills?" },
  { _id: "2", title: "Ready to Level Up Your Photography Skills?" },
  { _id: "3", title: "Want to Master a New Language? Tell Us Which One!" },
  {
    _id: "4",
    title: "Ready to Amp Up Your Fitness Routine? Share Your Goals!",
  },
  {
    _id: "5",
    title:
      "Exploring DIY Projects? What Skills Do You Need for Your Next Project?",
  },
];

const TopTags = [
  { _id: "1", name: "Technology & Programming", totalQuestions: 3 },
  { _id: "2", name: "Art & Creativity", totalQuestions: 2 },
  { _id: "3", name: "Languages & Communication", totalQuestions: 1 },
  { _id: "4", name: "Cooking & Culinary Arts", totalQuestions: 5 },
  { _id: "5", name: "DIY & Home Improvement", totalQuestions: 4 },
];

const RightSidebar = () => {
  return (
    <section
      className="background-light900_dark200 light-border 
  sticky right-0 top-0 flex h-screen flex-col  overflow-y-auto border-l
   p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden w-[350px] custom-scrollbar"
    >
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {TopQuestions.map((question) => (
            <Link
              href={`/questions/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {TopTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
