"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";

// Asynchronous function to fetch TopInteractedTags
export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findById(userId);
    if (!user) throw new Error("user nor Found");

    //TODO: find interactions for users and groups by Tags

    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag3" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function to fetch all tags
export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();
    const tags = await Tag.find({});
    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Asynchronous function fetching questions associated with a specific tag ID.
export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();
    const {
      tagId,
      // page = 1,
      // pageSize = 10,
      searchQuery,
    } = params;

    // Filter query to find the tag by its ID.
    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    // Fetch the tag from the database using its ID.
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,

      // If there's a search query, filter questions by their title using the search term.
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},

      // Sort the populated questions in descending order by their creation date.
      options: {
        sort: { createdAt: -1 },
      },

      // Further populate each question to retrieve its tags and author details.
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id name clerkId picture" },
      ],
    });
    if (!tag) {
      throw new Error("Tag not found");
    }
    // Extract the questions associated with the retrieved tag.
    const questions = tag.questions;

    // Return the tag's name and its associated questions.
    return { tagTitle: tag.name, questions };

    // error handling
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// function is to fetch the popular tags based on the number of questions associated with each tag.

export async function getTopTags() {
  try {
    connectToDatabase();

    // Use the aggregation pipeline to:
    // 1. Project (or select) only the `name` of the tag and calculate the number of questions associated with each tag.
    // 2. Sort the tags in descending order based on the number of questions.
    // 3. Limit the result to the top 5 tags.
    const topTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return topTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
