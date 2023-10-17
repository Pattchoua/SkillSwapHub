import { Schema, models, model, Document } from "mongoose";

export interface Iinteraction extends Document {
  action: string;
  user: Schema.Types.ObjectId;
  question: Schema.Types.ObjectId;
  answer: Schema.Types.ObjectId;
  tags: Schema.Types.ObjectId[];
  createdAt: Date;
}

const interactionSchema = new Schema({
  action: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: "Question" },
  Answer: { type: Schema.Types.ObjectId, ref: "Answer" },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  createdAt: { type: Date, default: Date.now },
});

const interaction =
  models.interaction || model("interaction", interactionSchema);
export default interaction;
