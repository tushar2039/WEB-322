require('dotenv').config();
const Sequelize = require('sequelize');
const fs = require('fs').promises;

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // should be true in production
        }
    }
});

// Define Theme model
const Theme = sequelize.define('Theme', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING
}, { timestamps: false });

// Define Set model
const Set = sequelize.define('Set', {
    set_num: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Theme,
            key: 'id'
        }
    },
    img_url: Sequelize.STRING
}, { timestamps: false });

// Associations
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize and Sync Models
async function initialize() {
    await sequelize.sync(); // This will create the tables if they don't exist
    await insertDataFromJSON(); // Populate the tables with JSON data
}

async function insertDataFromJSON() {
    try {
        const setsData = JSON.parse(await fs.readFile(`${__dirname}/../data/setData.json`, 'utf8'));
        const themesData = JSON.parse(await fs.readFile(`${__dirname}/../data/themeData.json`, 'utf8'));

        for (const theme of themesData) {
            await Theme.findOrCreate({ where: { id: theme.id }, defaults: theme });
        }

        for (const set of setsData) {
            await Set.findOrCreate({ where: { set_num: set.set_num }, defaults: set });
        }

        console.log('Data has been inserted successfully.');
    } catch (error) {
        console.error('Error loading or inserting data:', error);
    }
}

async function getAllSets() {
    try {
        return await Set.findAll({ include: Theme });
    } catch (error) {
        throw new Error(`Could not fetch sets: ${error.message}`);
    }
}

async function getSetByNum(setNum) {
    try {
        const set = await Set.findOne({ where: { set_num: setNum }, include: Theme });
        if (!set) {
            throw new Error(`Set not found with set_num: ${setNum}`);
        }
        return set;
    } catch (error) {
        throw new Error(`Could not fetch set: ${error.message}`);
    }
}

async function getSetsByTheme(themeName) {
    try {
        return await Set.findAll({
            include: [{
                model: Theme,
                where: {
                    name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Theme.name')), 'LIKE', `%${themeName.toLowerCase()}%`)
                }
            }]
        });
    } catch (error) {
        throw new Error(`Could not fetch sets by theme: ${error.message}`);
    }
}

async function addSet(setData) {
    try {
        await Set.create(setData);
    } catch (error) {
        throw new Error(`Could not add set: ${error.message}`);
    }
}

async function editSet(set_num, setData) {
    try {
        await Set.update(setData, { where: { set_num: set_num } });
    } catch (error) {
        throw new Error(`Could not update set: ${error.message}`);
    }
}
function getThemes() {
    return new Promise((resolve, reject) => {
        Theme.findAll()
            .then(themes => resolve(themes))
            .catch(err => reject(err.message));
    });
}

async function deleteSet(set_num) {
    try {
        const result = await Set.destroy({ where: { set_num: set_num } });
        if (result === 0) {
            throw new Error('No set found to delete');
        }
    } catch (error) {
        throw new Error(`Could not delete set: ${error.message}`);
    }
}

// Exporting the functions
module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    addSet,
    editSet,
    deleteSet,
    getThemes
};

// To run initialization on script execution, uncomment the following line:
 initialize().then(() => console.log('Initialization complete.'));
