const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Sequelize } = require("sequelize");
const { User, PowerConsumption } = require("./models");
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, "your_jwt_secret");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Auth routes
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "your_jwt_secret",
      { expiresIn: "24h" }
    );
    console.log(token);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Daily power consumption stats
app.get(
  "/api/power-consumption/power-stats",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Query condition for user
      let whereQuery = { userId: req.userId };

      if (startDate && endDate) {
        whereQuery.date = {
          [Sequelize.Op.gte]: new Date(startDate),
          [Sequelize.Op.lte]: new Date(endDate),
        };
      }

      const powerStats = await PowerConsumption.findAll({
        where: whereQuery,
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col("date")), "date"],
          [Sequelize.fn("SUM", Sequelize.col("dailyPower")), "dailyPower"],
          [Sequelize.fn("AVG", Sequelize.col("dailyPower")), "avgDailyPower"],
          [Sequelize.fn("SUM", Sequelize.col("totalPower")), "totalPower"],
        ],
        group: [Sequelize.fn("DATE", Sequelize.col("date"))],
        order: [[Sequelize.col("date"), "ASC"]],
      });

      res.json(
        powerStats.length
          ? powerStats
          : { days: [], totalPower: 0, avgDailyPower: 0 }
      );
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Cost analysis stats
app.get(
  "/api/power-consumption/cost-stats",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let whereQuery = { userId: req.userId };

      if (startDate && endDate) {
        whereQuery.date = {
          [Sequelize.Op.gte]: new Date(startDate),
          [Sequelize.Op.lte]: new Date(endDate),
        };
      }

      const costStats = await PowerConsumption.findAll({
        where: whereQuery,
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col("date")), "date"],
          [Sequelize.fn("SUM", Sequelize.col("cost")), "dailyCost"],
          [Sequelize.fn("AVG", Sequelize.col("cost")), "avgDailyCost"],
        ],
        group: [Sequelize.fn("DATE", Sequelize.col("date"))],
        order: [[Sequelize.col("date"), "ASC"]],
      });

      res.json(
        costStats.length ? costStats : { totalCost: 0, avgDailyCost: 0 }
      );
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Sample data insertion
app.post(
  "/api/power-consumption/add-sample-data",
  authMiddleware,
  async (req, res) => {
    try {
      // Insert sample data with userId
      const sampleDataWithUserId = samplePowerData.map((data) => ({
        ...data,
        userId: req.userId,
      }));

      await PowerConsumption.bulkCreate(sampleDataWithUserId);
      res.json({ message: "Sample data added successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
