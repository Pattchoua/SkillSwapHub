"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import { GetQuestionsParams, CreateQuestionParams } from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";

// Asynchronous function to get all questions.
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to create a new question.
export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;

    // Create a new question using the provided title, content, and author.
    const question = await Question.create({
      title,
      content,
      author,
    });
    const tagDocuments = [];

    // create the tags or get them if they aLready exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        {
          upsert: true,
          new: true,
        }
      );
      // Add the tag's ID to the tagDocuments array.
      tagDocuments.push(existingTag._id);
    }

    // Update the created question to include references to the tags in its 'tags' array.
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    revalidatePath(path);
  } catch (error) {}
}
function sort(arg0: { createdAt: number }) {
  throw new Error("Function not implemented.");
}
