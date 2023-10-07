import * as mongoose from "mongoose";
import {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_PATH,
  MONGO_DATABASE,
  MONGODB_URI_LOCAL,
} from "../config";

export default (): void => {
  const options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

  const envProd = process.env.NODE_ENV === "production" ? true : false;
  let mongoUri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}/${MONGO_DATABASE}?authSource=admin`;
  if (!envProd) mongoUri = MONGODB_URI_LOCAL;
  mongoose
    .connect(mongoUri, { ...options })
    .then(() => {
      console.log("MongoDB connection success");
    })
    .catch((err) => {
      console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    });
};
