// Here, we are going to plan user routes.
/** 
POST /user/sign-up
POST /user/sign-in
POST /user/auth  **/

const express = require('express');

// bcrypt is used to hash password before saving it to database
const bcrypt = require("bcrypt");   

// fs is node's inbuilt file system module used to manage files
const fs = require('fs');

// import existing data from db.json file
const userDB = require('../database/db.json')

const generateJWT = require("../utils/generateJWT");

// importing authenticate middleware
const authenticate = require("../middleware/authenticate");

// we create a new router using express's inbuilt Router method
const router = express.Router();

// user registration / sign-up
router.post('/sign-up', async (req, res) => {
    const {name, email, password} = req.body;
    const user = await userDB.filter(user => user.email === email);
    if(user.length > 0) {
        return res.status(400).json({error: "User already exist!"});
    }
    // A salt is a random string that makes the hash unpredictable. 
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = {
        id: userDB.length,
        name: name,
        email: email,
        password: bcryptPassword
    }

    // we add newUser to usersDb array
    userDB.push(newUser);

   // we save the updated array to db.json file by using fs module of node
   await fs.writeFileSync('./database/db.json', JSON.stringify(userDB));


   // creating web token and will be sent to the user
   const jwtToken = generateJWT(newUser.id);
   return res.status(201).send({ jwtToken: jwtToken, isAuthenticated: true });
});


/***** user sign-in / login  *****/
router.post('/sign-in', async (req, res) =>  {
    const {email, password} = req.body;

    try {
        const user = await userDB.filter(user => user.email === email);
        if(user.length === 0){
            return res.status(401).json({error: "Invalid Credential", isAuthenticated: false });  
        }
    //if the user exist then we will compare the password provided by user with the hashed password we stored during user registration
    const isValidPassword = await bcrypt.compare(
        password,
        user[0].password
    );
    if(!isValidPassword){
        return res.status(401).json({error: "Invalid Credential", isAuthenticated: false}); 
    }
    // if the password matches with hashed password then we generate a new token and send it back to user
    const jwtToken = generateJWT(user[0].id);
    return res.status(200).send({ jwtToken, isAuthenticated: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error: error.message});
    }
});


/**** user authorization *****/
router.post("/auth", authenticate, (req, res) =>{
    try {
        res.status(200).send({isAuthenticated: true});
    } catch (error) {
        console.error(error.message);
        res.status(500).send({error: error.message, isAuthenticated:false})        
    }
})

// we need to export this router to implement it inside our server.js file
module.exports = router;
