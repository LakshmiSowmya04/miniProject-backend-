const { Sequelize, DataTypes } = require("sequelize");

// Replace the credentials and database name as per your setup
const sequelize = new Sequelize(
  "mysql://root:sowmya@localhost:3306/power_management"
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Successfully connected to the database.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

const User = require("./User.js")(sequelize, DataTypes);
const PowerConsumption = require("./PowerConsumption.js")(sequelize, DataTypes);

module.exports = { sequelize, User, PowerConsumption };
