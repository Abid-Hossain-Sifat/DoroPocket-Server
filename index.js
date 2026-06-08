import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { createAuth } from "./auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.NEXT_URL,
    credentials: true,
  })
);
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// global variable
let db;
let collection;
let auth;

// DB connect
const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("DoroPocket");
    collection = db.collection("products");

    // Better Auth initialize
    auth = createAuth(db, client);
    app.use("/api/auth", toNodeHandler(auth));

    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Database connection failure:", error);
  }
};

connectDB().catch(console.dir);

// products route 
app.get("/products", async (req, res) => {
  if (!collection) {
    return res.status(503).send("Database connecting, please try again...");
  }
  try {
    const cursor = collection.find();
    const final = await cursor.toArray();
    res.send(final);
  } catch (error) {
    res.status(500).send("Error fetching products");
  }
});

app.get("/products/:id", async (req, res) => {
  if (!collection) {
    return res.status(503).send("Database connecting, please try again...");
  }
  try {
    const id = req.params.id;
    const product = await collection.findOne({
      _id: new ObjectId(id),
    });
    res.send(product);
  } catch (error) {
    res.status(500).send("Error fetching product");
  }
});

app.get("/", (req, res) => {
  res.send("DoroPocket Express Server Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
