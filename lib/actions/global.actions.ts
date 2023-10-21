'use server'

import Question from "@/database/question.model";
import User from "@/database/user.model";
import Answer from "@/database/answer.model";
import Tag from "@/database/tag.model";
import { SearchParams } from "./shared.types";
import { connectToDatabase } from "../mongoose";

// Array of types that can be searched.
const SearchableTypes = ["question", "user", "answer", "tag"];

export async function globalSearch(params: SearchParams) {
  try {
    connectToDatabase();

    const { query, type } = params;

    // Creating a regex pattern for the search query with case-insensitive options.
    const regexQuery = { $regex: query, $options: "i" };

    let results = [];

    // Mapping of models to their respective searchable fields and types.
    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question" },
      { model: User, searchField: "name", type: "user" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: Tag, searchField: "name", type: "tag" },
    ];

    // Convert the type to lowercase for uniformity.
    const typeLower = type?.toLowerCase();

    // If no specific type is provided or the type isn't in SearchableTypes,
    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // we search across all types.
      for (const { model, searchField, type } of modelsAndTypes) {
        // Fetch matching results from the database.
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);
        // Transform the results and add them to the results array.
        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer"
                ? `Answer containing ${query}`
                : item[searchField],
            type,
            // Determine the ID field based on the type.
            id:
              type === "user"
                ? item.clerkId
                : type === "answer"
                ? item.question
                : item._id,
          }))
        );
      }
    } else {
      // If a specific type is provided, search only in that type.
      const modelInfo = modelsAndTypes.find((item) => item.type === type);
      if (!modelInfo) {
        throw new Error("invalid search type");
      }

      // Fetch matching results from the specified model type.
      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      // Transform the results.
      results = queryResults.map((item) => ({
        title:
          type === "answer"
            ? `Answer containing ${query}`
            : item[modelInfo.searchField],
        type,
        // Determine the ID field based on the type.
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
            ? item.question
            : item._id,
      }));
    }

    // Convert the results array to a JSON string before returning.
    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
