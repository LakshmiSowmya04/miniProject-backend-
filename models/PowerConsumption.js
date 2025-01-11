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
      type: DataTypes.DATEONLY,
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
  });

  PowerConsumption.associate = function (models) {
    PowerConsumption.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return PowerConsumption;
};
