/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Tushar Gupta Student ID: 169877214 Date: 19/03/2024
*
********************************************************************************/
// importing modules
const legoData = require("./modules/legoSets");
const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // port number

// Serve static files from the 'public' directory
app.use(express.static('public'));

// initializing the data
legoData.initialize().then(() => {
    console.log("Lego data is initialized.");
    app.listen(port, () => console.log(`Port used for server: ${port}`)); // starts the server
}).catch(err => {
    console.error("Lego data is not initialized", err);
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

// route for getting all the sets
app.get("/lego/sets", async (req, res) => {
    try {
        const sets = await legoData.getAllSets();
        res.json(sets);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// route for getting a set by number, serving num-demo.html or a dynamic page
app.get("/lego/sets/:set_num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.set_num); // random number chosen out of the data
        if (set) {
            res.send(set); // you might want to send a specific HTML file here
        } else {
            res.status(404).send("Set not found");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// custom 404 route, serving 404.html
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'views', '404.html'));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});