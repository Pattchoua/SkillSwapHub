import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Filter from "@/components/shared/Filter";
import { HomePageFilters } from "@/constants/filters";
import HomeFilters from "@/components/home/HomeFilters";
import NoResult from "@/components/shared/NoResult";
import QuestionCard from "@/components/cards/QuestionCard";
import { getQuestions } from "@/lib/actions/question.actions";
import { SearchParamsProps } from "@/types";

// 'Home' async function component which accepts 'searchParams' as a prop.
export default async function Home({ searchParams }: SearchParamsProps) {
  const response = await getQuestions({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
  });

  return (
    <>
      {/* Header section with title and 'Ask a Question' button. */}
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      {/* Local search bar and filters. */}
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.png"
          otherClasses="flex-1"
          placeholder="Search for questions"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      {/* Home specific filters. */}
      <HomeFilters />

      {/* Display the questions or a no-result component(ternary conditional). */}
      <div className="mt-10 flex w-full flex-col gap-6">
        {response.questions.length > 0 ? (
          response.questions.map((question) => (
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
