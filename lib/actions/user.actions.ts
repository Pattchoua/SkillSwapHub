"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import path from "path";
import Tag from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Answer from "@/database/answer.model";

// Asynchronous function to fetch all Users
export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();
    const { page = 1, pageSize = 20, filter, searchQuery } = params;

    // Create a default, empty filter query for the database.
    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    // Initialize an empty object to hold sorting options based on the 'filter' provided.
    let sortOptions = {};

    switch (filter) {
      case "new users":
        sortOptions = { joinedAt: -1 };
      case "old users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top contributors":
        query.answers = { reputation: -1 };
        break;
      default:
        break;
    }
    const users = await User.find(query).sort(sortOptions);

    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to fetch a user by their clerkId.
export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to create a new user.
export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to update an existing user.
export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to delete a User.
export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("user not found");
    }

    // Find all questions authored by this user.
    //const userQuestionIds = await Question.find({ author: user._id }).distinct(
    //  "-id"
    //);
    // Delete all questions authored by this user.
    await Question.deleteMany({ author: user._id });

    // TODO: delete user answers, comments etc...

    // Delete the user from the database.
    const deletedUser = await User.findByIdAndDelete(user._id);
    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to a save question
export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, userId, path } = params;
    //finding a user From the database
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    //checking if the question has already been saved
    const isQuestionSaved = user.saved.includes(questionId);
    if (isQuestionSaved) {
      // update the question from saved
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      );
    } else {
      // add the question from saved
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to retrieve and return the saved questions of a specific user from the database.
export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    const {
      clerkId,
      // page = 1,
      // pageSize = 10,
      filter,
      searchQuery,
    } = params;

    // Building the query for fetching questions
    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    // Initialize an empty object to hold sorting options based on the 'filter' provided.
    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
      case "most_answered":
        sortOptions = { answers: -1 };
        break;
      default:
        break;
    }

    // Fetching the User and Their Saved Questions:
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id name clerkId picture" },
      ],
    });
    if (!user) {
      throw new Error("User not found");
    }
    // Returning Saved Questions:
    const savedQuestions = user.saved;
    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to fetch the user Info
export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();
    const { userId } = params;
    // Fetch the user from the database using the 'userId' as the 'clerkId'
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("user not found");
    }
    // Count the total number of questions and Answers authored by the user and retrurn them along with the user details
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });
    return { user, totalQuestions, totalAnswers };

    // error handling
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to fetch the user's questions.
export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    const {
      userId,
      // page = 1,
      // pageSize = 10,
    } = params;

    // Get the total number of questions authored by the user.
    const totalQuestions = await Question.countDocuments({ author: userId });

    // Fetch the questions authored by the user
    const userQuestions = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .populate("tags", "_id name")
      .populate("author", "_id clerkId picture name");

    // Return the total number of questions and the list of questions.
    return { totalQuestions, questions: userQuestions };

    // error handling
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to fetch the user's Answer.
export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    const {
      userId,
      // page = 1,
      // pageSize = 10,
    } = params;

    // Get the total number of answers authored by the user.
    const totalAnswers = await Answer.countDocuments({ author: userId });

    // Fetch the answers authored by the user
    const userAnswers = await Answer.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .populate("question", "_id title")
      .populate("author", "_id clerkId picture name");

    // Return the total number of answers and the list of answers.
    return { totalAnswers, answers: userAnswers };

    // error handling
  } catch (error) {
    console.log(error);
    throw error;
  }
}
