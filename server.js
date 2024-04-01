/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Tushar Gupta Student ID: 169877214 Date: 19/03/2024
*  URL: https://zany-lime-eagle-sock.cyclic.app
*
********************************************************************************/
// Importing modules
const legoData = require("./modules/legoSets");
const express = require('express');

const app = express();
const port = 3000; // Port number

app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initializing the data
legoData.initialize().then(() => {
    console.log("Lego data is initialized.");
    app.listen(port, () => console.log(`Port used for server: ${port}`)); // Starts the server
}).catch(err => {
    console.error("Lego data is not initialized", err);
});

// Route for home page
app.get('/', (req, res) => {
    res.render("home", { page: "/" });
});

// Route for the About page
app.get('/about', (req, res) => {
    res.render("about", { page: "/about" });
});

// Route for getting all the sets
app.get("/lego/sets", async (req, res) => {
    try {
        const sets = await legoData.getAllSets();
        res.render('sets', { sets: sets, page: "/lego/sets", activeTheme: req.query.theme || "" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route for getting a set by number, rendering set.ejs with specific set data
app.get("/lego/sets/:set_num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.set_num);
        if (set) {
            res.render("set", { set: set, page: "/lego/sets/:set_num" });
        } else {
            res.status(404).render('404', { page: "" }); // Rendering 404 page if set not found
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Custom 404 route
app.use((req, res) => {
    res.status(404).render('404', { page: "" });
});
