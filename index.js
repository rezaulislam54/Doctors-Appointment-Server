const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');
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
    const SpecialityCollections = client.db('DoctorsAppointmentDB').collection('speciality');
    const UserCollections = client.db('DoctorsAppointmentDB').collection('user');


    // doctors related Routes 
    app.get("/doctors", async (req, res) => {
      const doctors = await DoctorsCollections.find().toArray();
      res.send(doctors);
    })

    app.get("/doctors/:id", async (req, res) => {
      const query = {_id: new ObjectId(req.params.id)};
      const result = await DoctorsCollections.findOne(query);
      res.send(result);
    });

    // speciality related Routes
    app.get("/speciality", async (req, res) => {
      const specialities = await SpecialityCollections.find().toArray();
      res.send(specialities);
    })

    app.get("/speciality/:id", async (req, res) => {
      const query = {_id: new ObjectId(req.params.id)};
      const result = await SpecialityCollections.findOne(query);
      res.send(result);
    });


        // API to register user
  app.post("/register", async (req, res) => {
     try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new UserCollections(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
  });



  // API to login user
  app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserCollections.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
  });


  // API to get user profile data
app.get("/get-profile", async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await UserCollections.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
});


// API to update user profile
app.post("/update-profile", async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await UserCollections.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await UserCollections.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
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