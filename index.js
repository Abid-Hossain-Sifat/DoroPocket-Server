import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { createAuth } from "./auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();
const port = process.env.PORT;

// Enable CORS with Credentials and Origin matching the client
app.use(
  cors({
    origin: process.env.NEXT_URL,
    credentials: true,
  })
);
app.use(express.json());

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();
    const db = client.db("DoroPocket");
    const collection = db.collection("products");

    // Initialize Better Auth with shared DB and Client connections
    const auth = createAuth(db, client);

    // Mount Better Auth handler on /api/auth
    app.use("/api/auth", toNodeHandler(auth));

    // Products endpoints
    app.get("/products", async (req, res) => {
      const cursor = collection.find();
      const final = await cursor.toArray();
      res.send(final);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = await collection.findOne({
        _id: new ObjectId(id),
      });
      res.send(product);
    });

    await db.command({ ping: 1 });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Database connection/server startup failure:", error);
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("DoroPocket Express Server Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
