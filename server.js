const express = require('express');
const cors = require('cors');

const user = require('./routes/user');
// initializing express application
const app = express();

// parse requests of content-type - application/json
app.use(express.json());


 const corsOptions = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOptions)); // to enable cors


app.get('/', (req, res) => {
   res.json({message: "Welcome to MigraCode Auth application."});
   //res.send('running !');
});

// set port, listen for requests
const PORT = process.env.PORT || 4000;

app.use('/user', user);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
//app.listen(3000, console.log('server is running on port 3000'));