import { Document } from "mongoose";

const serialize = (documents: Document[]) => {
  return documents.map((doc) => {
    const resultObject = doc.toObject();
    resultObject._id = doc._id.toString();
    return resultObject;
  });
};

export default serialize;
