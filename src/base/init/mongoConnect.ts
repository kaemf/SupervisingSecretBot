import { MongoClient } from "mongodb";

export default async function connectMongodb(){
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient('mongodb://localhost:27017/?family=4');

    await client.connect();

    console.log("Done");
    return client;
  } catch (error) {
    console.error('\n\nFatal Error to connect to MongoDB:\n', error);
    process.exit(1);
  }
}