"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import {
  GetQuestionsParams,
  CreateQuestionParams,
  GetQuestionByIdParams,
  QuestionVoteParams,
  DeleteQuestionParams,
  EditQuestionParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

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
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
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

// Asynchronous function to get all questions.
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter } = params;
    // Create a default, empty filter query for the database.
    const query: FilterQuery<typeof Question> = {};

    //If a searchQuery is provided,Modify the filter query to search for questions where the title matches
    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        // { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
  // Initialize an empty object to hold sorting options based on the 'filter' provided.
    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 }; //sort the questions by their creation date in descending order
      case "frequent":
        sortOptions = { views: -1 };//sort the questions by views in descending order.
        break;
      case "unanswered":
        query.answers = { $size: 0 }; //retrieve questions that have no answers.
        break;
      default:
        break;
    }

    // Retrieve all questions from the database that match the search and filter criteria.
    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort(sortOptions);

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to get as specific question (ById).
export async function getQuestionsById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to upvote a question
export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    //TODO: Increment author's reputation by +10 for upvoting a question

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to downvote a question
export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    //TODO: Increment author's reputation by +10 for upvoting a question

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to delete a Question.
export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;
    // Delete the question with the specified question ID.
    await Question.deleteOne({ _id: questionId });

    // Delete all answers associated with the deleted question.
    await Answer.deleteMany({ question: questionId });

    // Delete any interactions associated with the deleted question.
    await interaction.deleteMany({ question: questionId });

    // Update any tags associated with the deleted question,
    // removing the question ID from their questions array.
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to edit a Question.
export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, content, title, path } = params;

    // Attempt to find the question with the specified question ID in the database.
    // Also, populate the 'tags' field of the found question.
    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }
    // Update the title and content fields of the found question.
    question.title = title;
    question.content = content;

    // Save the updated question back to the database.
    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to retrive hotQuestions.
export async function getTopQuestions() {
  try {
    connectToDatabase();

    const topQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5);
    return topQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
