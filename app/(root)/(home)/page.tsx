import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Filter from "@/components/shared/Filter";
import { HomePageFilters } from "@/constants/filters";
import HomeFilters from "@/components/home/HomeFilters";
import NoResult from "@/components/shared/NoResult";
import QuestionCard from "@/components/cards/QuestionCard";

const questions = [
  {
    _id: "1",
    title: "How Can You Enhance Your Culinary Skills?",
    tags: [
      { _id: "1", name: "Cooking" },
      { _id: "2", name: "Culinary Arts" },
    ],
    author: {
      _id: "10",
      name: "John Doe",
      picture: "https://example.com/johndoe.jpg",
    },
    upvotes: 10,
    views: 100,
    answers: [
      {
        text: "Practice makes perfect!",
        author: "Jane Doe",
      },
      {
        text: "Join a local cooking class.",
        author: "Bob Smith",
      },
    ],
    createdAt: new Date("2023-09-01T12:00:00.000Z"),
  },
  {
    _id: "2",
    title: "Want to Master a New Language?",
    tags: [
      { _id: "3", name: "Language Learning" },
      { _id: "4", name: "Education" },
    ],
    author: {
      _id: "11",
      name: "John Doe",
      picture: "https://example.com/johndoe.jpg",
    },
    upvotes: 10,
    views: 100,
    answers: [
      {
        text: "Use language learning apps.",
        author: "Alice Johnson",
      },
      {
        text: "Practice with native speakers.",
        author: "Bob Smith",
      },
    ],
    createdAt: new Date("2023-09-01T12:00:00.000Z"),
  },
];

export default function Home() {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          otherClasses="flex-1"
          placeholder="Search for questions"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>
      <HomeFilters />
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There is no question to show"
            description="Don't hesitate to ask questions – whether it's about a skill you're
          eager to master, an experience you'd like to share, or an event you'd
          like to see!"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}
