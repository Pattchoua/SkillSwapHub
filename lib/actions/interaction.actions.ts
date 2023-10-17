"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import interaction from "@/database/interaction.model";

export async function viewQuestion(params: ViewQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, userId } = params;

    // update the ViewCount for the current question
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    // checking if the user has already view the question
    if (userId) {
      const existingInteraction = await interaction.findOne({
        user: userId,
        action: "view",
        question: questionId,
      });
      if (existingInteraction) return;
      console.log("user has already viewed the question");
    }
    //create a new interaction (if the user hasn't already view the question)
    await interaction.create({
      user: userId,
      action: "view",
      question: questionId,
    });

    // error handling
  } catch (error) {
    console.log(error);
    throw error;
  }
}
