module.exports = (sequelize, DataTypes) => {
  const PowerConsumption = sequelize.define("PowerConsumption", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      allowNull: true,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    applianceName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  PowerConsumption.associate = function (models) {
    PowerConsumption.belongsTo(models.User, { foreignKey: "userId" });
  };

  return PowerConsumption;
};
