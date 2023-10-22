import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <section>
      <h1 className="h1-bold text-dark100_light900">Edit profile </h1>

      <div className="mt-9 flex w-full gap-9 flex-col">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton
            key={item}
            className="no-focus paragraph-regular  light-border-2 
          background-light700_dark300 text-dark300_light700 min-h-[56px] border"
          />
        ))}
      </div>
    </section>
  );
};

export default Loading;
