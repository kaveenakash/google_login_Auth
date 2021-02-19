const express = require('express')
const cors = require('cors')
//To use env variables
require('dotenv').config();
require("./db/connectDB")
const app = express();

//import routes
const authRoutes = require('./routes/auth')

app.use(express.json())
app.use(cors())

//middlewares
app.use('/api',authRoutes);

const port = process.env.PORT;

app.listen(port,() =>{
    console.log(`Server is running on port ${port}`)
})



