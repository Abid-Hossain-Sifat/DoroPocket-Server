require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const port = process.env.PORT;
const uri = process.env.MongoDB_URI;

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

    const Data = client.db("DoroPocket");
    const collection = Data.collection("products");

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

    await client.db("admin").command({ ping: 1 });
    console.log("Ping Deploy Success");
  } catch (error) {
    console.log(error);
  } finally {
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("DoroPocket Express Server Running");
});

app.listen(port, (req, res) => {
  console.log(`Server running on ${port}`);
});
