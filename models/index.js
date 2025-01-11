const { Sequelize, DataTypes } = require("sequelize");

// Define the database connection
const sequelize = new Sequelize(
  "mysql://root:sowmya@localhost:3306/power_management"
);

// Test the connection to the database
sequelize
  .authenticate()
  .then(() => {
    console.log("Successfully connected to the database.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Import models
const User = require("./User.js")(sequelize, DataTypes);
const PowerConsumption = require("./PowerConsumption.js")(sequelize, DataTypes);

// Export sequelize and models
module.exports = { sequelize, User, PowerConsumption };
