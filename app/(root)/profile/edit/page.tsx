import { getUserById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs";
import { ParamsProps } from "@/types";
import Profile from "@/components/forms/Profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags | XMe",
  description:
    "XMe is a platform where professionals from diverse fields share their expertise,answer questions, and engage with a curious audience.",
};

const Page = async ({ params }: ParamsProps) => {
  const { userId } = auth();
  if (!userId) return null;

  // Fetching user details based on the 'userId'
  const mongoUser = await getUserById({ userId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <div className="mt-9">
        {/* Rendering the 'Profile' form  with user details */}
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  );
};

export default Page;
