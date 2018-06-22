import * as mongoose from "mongoose";
import Environment from "./env";

switch (Environment.IDENTITY) {
    case "development":
        mongoose.connect(`mongodb://${Environment.DBHOST}:${Environment.DBPORT}/${Environment.DBNAME}`)
            .then()
            .catch((err) => console.log(err));
        break;
    case "production":
        mongoose.connect(`mongodb://${Environment.DBHOST}:${Environment.DBPORT}/${Environment.DBNAME}`)
            .then()
            .catch((err) => console.log(err));
        break;
    case "test":
        mongoose.connect(`mongodb://${Environment.DBHOST}:${Environment.DBHOST}/${Environment.DBNAME}`)
            .then()
            .catch((err) => console.log(err));
        break;
}

mongoose.connection
    .once("error", (err) => console.error(`MongoDB connect error:\n${err}`))
    .once("open", () => {
        console.log(`mongodb connect success in ${Environment.IDENTITY} mode`);
    });

export default mongoose;
