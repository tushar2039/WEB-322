/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ___Tushar Gupta_____ Student ID: _169877214_ Date: __18/02/2024__
*
********************************************************************************/

// import datasets
const setData = require("../data/setData");
const themeData = require("../data/themeData");
// creating an array to hold the sets
let sets = [];

//initialize the array with data from setData
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            setData.forEach(set => {
                const theme = themeData.find(theme => theme.id == set.theme_id)?.name;
                if (theme) {
                    sets.push({...set, theme});// using spread from set array to push the set data in sets array, and same with the theme
                }
            });
            resolve();// resolve the promise after the sets are processed
        } catch (error) {
            reject(`Promise Breaked ${error}`);
        }
    });
}
// returns a promise if the sets.length is greater than 0 ( checking if the sets have a valid length)
function getAllSets() {
    return new Promise((resolve, reject) => {
        if (sets.length > 0) {
            resolve(sets);// the returns a promise of getting all the sets
        } else {
            reject("No sets found.");
        }
    });
}
// returns a promise if the number matches else rejects
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        const set = sets.find(set => set.set_num === setNum);
        if (set) {
            resolve(set);
        } else {
            reject(`There is no matching set Number ${setNum}.`);
        }
    });
}
// returns a promise if the theme matches eles rejects it
function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        const filteredSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
        if (filteredSets.length > 0) {
            resolve(filteredSets);
        } else {
            reject(`Theme does not matches "${theme}".`);
        }
    });
}

module.exports = // exporting the modules to be used elsewhere
{ 
    initialize, 
    getAllSets,
    getSetByNum, 
    getSetsByTheme 
};



