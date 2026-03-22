import dotenv from "dotenv";
import app from "./app.js";
import { appDataSource } from "./database/appDataSource.js";

dotenv.config();

const PORT = process.env.PORT || 6060;

appDataSource
  .initialize()
  .then(() => {
    console.log("Conectou com o banco!");

    app.listen(PORT, () => {
      console.log(`Server is running in port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
