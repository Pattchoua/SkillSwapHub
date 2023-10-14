import { Schema, models, model, Document } from "mongoose";

export interface IAnswer extends Document {
  content: string;
  question: Schema.Types.ObjectId;
  upvotes: Schema.Types.ObjectId[];
  downvotes: Schema.Types.ObjectId[];
  author: Schema.Types.ObjectId;
  createdAt: Date;
}

const AnswerSchema = new Schema({
  content: { type: String, required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Answer = models.Answer || model("Answer", AnswerSchema);
export default Answer;
