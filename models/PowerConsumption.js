module.exports = (sequelize, DataTypes) => {
  const PowerConsumption = sequelize.define("PowerConsumption", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dailyPower: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPower: {
      type: DataTypes.FLOAT,
    },
    avgDailyPower: {
      type: DataTypes.FLOAT,
    },
    applianceBreakdown: {
      type: DataTypes.JSON,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  return PowerConsumption;
};
