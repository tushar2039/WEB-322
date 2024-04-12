/********************************************************************************
*  WEB322 – Assignment 05
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
const bodyParser = require('body-parser'); // For parsing POST request body

const app = express();
const port = process.env.PORT || 3000; // Port number using environment variable

app.set('view engine', 'ejs');

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initializing the data
legoData.initialize().then(() => {
    console.log("Lego data is initialized.");
    app.listen(port, () => console.log(`Server is running on port: ${port}`)); // Starts the server
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

// Route to display the form for adding a new set
app.get("/lego/addSet", (req, res) => {
    legoData.getThemes().then(themes => {
        res.render("addSet", { themes: themes, page: "/lego/addSet" });
    }).catch(error => {
        res.status(500).send(error.message);
    });
});

// Route to handle the form submission for adding a new set
app.post("/lego/addSet", (req, res) => {
    legoData.addSet(req.body).then(() => {
        res.redirect("/lego/sets");
    }).catch(error => {
        res.status(500).render('500', { message: error.message });
    });
});

// Route to display the form for editing an existing set
app.get("/lego/editSet/:num", async (req, res) => {
    try {
        const setPromise = legoData.getSetByNum(req.params.num);
        const themesPromise = legoData.getThemes();

        const [set, themes] = await Promise.all([setPromise, themesPromise]);

        if (!set) {
            return res.status(404).render('404', { page: "", message: "Set not found." });
        }

        res.render("editSet", { set: set, themes: themes, page: "/lego/editSet" });
    } catch (error) {
        res.status(500).render('500', { message: error.message });
    }
});

// Route to process the form submission for editing an existing set
app.post("/lego/editSet", async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (error) {
        res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error.message}` });
    }
});
// Route to delete an existing set
app.get("/lego/deleteSet/:num", async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
    } catch (error) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error.message}` });
    }
});
// Custom 404 route
app.use((req, res) => {
    res.status(404).render('404', { page: "" });
});
