import Question from "@/components/forms/Question";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask-Question | XMe",
  description:
    "XMe is a platform where professionals from diverse fields share their expertise,answer questions, and engage with a curious audience.",
};

const Page = async () => {
  const { userId } = auth();


  if (!userId) redirect("/sign-in");
  const mongoUser = await getUserById({ userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>
      <div className="mt-9">
      <Question mongoUserId={JSON.stringify(mongoUser?._id)} />

      </div>
    </div>
  );
};

export default Page;
