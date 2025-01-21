const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000 

const app = express();

// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hztjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const DoctorsCollections = client.db('DoctorsAppointmentDB').collection('allDoctors');



    app.get("/doctors", async (req, res) => {
      const doctors = await DoctorsCollections.find().toArray();
      res.send(doctors);
    })

    app.get("/doctors/:id", async (req, res) => {
      const query = {_id: new ObjectId(req.params.id)};
      const result = await DoctorsCollections.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req , res) => {
    res.send("Doctors appointment server is Running!");
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})