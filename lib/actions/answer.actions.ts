"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import { CreateAnswerParams, GetAnswersParams } from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import { Tag, User } from "lucide-react";

// Asynchronous function to create a new Answer.
export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, question, author, path } = params;

    // Create a new answer using the provided content, question, and author.
    const newAnswer = new Answer({ question, content, author });

    console.log({ newAnswer });

    // adding the answer to the question's answer array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    //TODO: add interaction....

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to get all answers.
export async function getAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();
    const answers = await Answer.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
