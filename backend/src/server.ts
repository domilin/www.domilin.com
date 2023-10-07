import "dotenv/config";
import App from "./app";
import routes from "./routes/root";

import { cleanEnv, str } from "envalid";
cleanEnv(process.env, {
  NODE_ENV: str(),
});

const app = new App(routes);
app.listen();
