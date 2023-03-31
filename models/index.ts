import { model, models, Schema, Model } from "mongoose";
import { Resource } from "../interfaces";

const resourceCollection = "resource";

const resourceSchema = new Schema({
  id: {
    required: true,
    type: String,
  },
  password: String,
  content: String,
  file: {
    fileName: String,
    fileType: String,
    fileSize: Number,
    fileContent: Buffer,
  },
  expiresAt: Number,
});

const ResourceModel = (models[resourceCollection] || model(resourceCollection, resourceSchema)) as Model<Resource>;

export { ResourceModel };