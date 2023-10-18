import Question from "@/components/forms/Question";
import { getQuestionsById } from "@/lib/actions/question.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs";
import { ParamsProps } from "@/types";

const Page = async ({ params }: ParamsProps) => {
  const { userId } = auth();
  if (!userId) return null;

   // Fetching user details based on the 'userId'
  const mongoUser = await getUserById({ userId });
  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));

  // Fetching question details using the 'questionId' from the route parameters
  const response = await getQuestionsById({ questionId: params.id });
  const plainResponse = JSON.parse(JSON.stringify(response));

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
      {/* Rendering the 'Question' component in 'edit' mode with user and question details */}
        <Question
          type="edit"
          mongoUserId={plainMongoUser._id}
          questionDetails={JSON.stringify(plainResponse)}
        />
      </div>
    </>
  );
};

export default Page;
