"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";

import interaction from "@/database/interaction.model";
import User from "@/database/user.model";

// Asynchronous function to create a new Answer.
export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, question, author, path } = params;

    // Create a new answer using the provided content, question, and author.
    const newAnswer = await Answer.create({ question, content, author });

    // adding the answer to the question's answer array
    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // creation of an interaction record for user's respondin ta question
    await interaction.create({
      user: author,
      action: "answer",
      questionObject,
      answer: newAnswer._id,
      tags: questionObject.tags,
    });

    // implementing the author reputation by +10 for answering a queation
    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

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
    const { questionId, sortBy, page = 1, pageSize = 1 } = params;

    // Calculate the number of posts to skip based on the page nunber and size
    const skipAmount = (page - 1) * pageSize;

    // Initialize an empty object to hold sorting options based on the 'sortBy' provided.
    let sortOptions = {};

    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalAnswer = await Answer.countDocuments({
      question: questionId,
    });

    const isNextAnswer = totalAnswer > skipAmount + answers.length;

    return { answers, isNextAnswer };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to upvote an answer
export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

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

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation by +2/-2 for upvoting/revoking an upvote to the answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -2 : 2 },
    });

    // Increment author's reputation by +10/-10 for recieving an upvoting/downvote to the question
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasupVoted ? -2 : 2 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to downvote an answer
export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

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

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation by +2/-2 for upvoting/revoking an upvote to the answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted? -2 : 2 },
    });

    // Increment author's reputation by +10/-10 for recieving an upvoting/downvote to the question
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasdownVoted ? -2 : 2 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to delete an Answer.
export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectToDatabase();

    const { answerId, path } = params;

    // Fetch the answer using the provided answer ID.
    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Delete the answer with the specified answer ID.
    await Answer.deleteOne({ answer: answerId });

    // Update any questions associated with the deleted answer,
    // removing the answer ID from their answers array.
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );

    // Delete any interactions associated with the deleted answer.
    await interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
