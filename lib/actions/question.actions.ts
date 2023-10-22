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
  RecommendedParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import interaction from "@/database/interaction.model";
import { FilterQuery, set } from "mongoose";

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

    // creation of an interaction record for user's ask Question
    await interaction.create({
      user: author,
      action: "ask_question",
      question: question._id,
      tags: tagDocuments,
    });

    // implementing the author reputation by +5 for creating a queation
    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}
function sort(arg0: { createdAt: number }) {
  throw new Error("Function not implemented.");
}

// Asynchronous function to get all questions.
export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 8 } = params;

    // Calculate the number of posts to skip based on the page nunber and size
    const skipAmount = (page - 1) * pageSize;

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
        break;
      case "frequent":
        sortOptions = { views: -1 }; //sort the questions by views in descending order.
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
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    // Get the total count of questions matching the query.
    const totalQuestions = await Question.countDocuments(query);

    // Determine if there are more questions available for the next page.
    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
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

    // Increment author's reputation by +1/-1 for  for upvoting/revoking an upvote to the question
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -1 : 1 },
    });

    // Increment author's reputation by +10/-10 for recieving an upvoting/downvote to the question

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });

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

    // Increment author's reputation by +1/-1 for  for downvoting/revoking a downvote to the question
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? -1 : 1 },
    });

    // Increment author's reputation by +10/-10 for recieving an upvoting/downvote to the question

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasdownVoted ? -10 : 10 },
    });

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
function limit(pageSize: number) {
  throw new Error("Function not implemented.");
}

// Asynchronous function to retrieve recommended questions
export async function getrecommendedQuestions(params: RecommendedParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10, searchQuery } = params;

    // Fetch the user based on the given clerk ID.
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("user not found");
    }
    // Calculate the number of questions to skip for pagination.
    const skipAmount = (page - 1) * pageSize;

    // Fetch all interactions (views) of the user
    const userInteractions = await interaction
      .find({ user: user._id })
      .populate("tags")
      .exec();

    // Aggregate all tags from the user's interactions.
    const userTags = userInteractions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags = tags.concat(interaction.tags);
      }
      return tags;
    }, []);

    // Extract distinct tag IDs from the user's interactions.
    const distinctUserTagsIds = [
      ...new Set(userTags.map((tag: any) => tag._id)),
    ];

    // Base query for fetching the recommended questions.
    const query: FilterQuery<typeof Question> = {
      $and: [
        { tags: { $in: distinctUserTagsIds } },
        { author: { $ne: user._id } },
      ],
    };

    // If there's a search query, include questions with title or content matching the query.
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }
    // Get the total count of questions matching the query.
    const totalQuestions = await Question.countDocuments(query);

    // Fetch the actual recommended questions with pagination.
    const recommendedQuestions = await Question.find(query)
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .skip(skipAmount)
      .limit(pageSize);

    // Determine if there are more questions to be fetched in the next page.
    const isNext = totalQuestions > skipAmount + recommendedQuestions.length;
    return { question: recommendedQuestions, isNext };
  } catch (error) {
    console.error("Error getting recommended questions", error);
    throw error;
  }
}
