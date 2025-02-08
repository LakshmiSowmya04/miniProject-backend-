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

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
app.get(
  "/api/power-consumption/power-stats",
  authMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const whereQuery = { userId: req.userId };

      if (startDate && endDate) {
        whereQuery.date = {
          [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // Use Sequelize with raw queries for JSON field operations
      const powerStats = await PowerConsumption.findAll({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("dailyPower")), "totalDailyPower"], // Sum of dailyPower
          [Sequelize.fn("SUM", Sequelize.col("totalPower")), "totalPower"], // Sum of totalPower
          [
            Sequelize.fn("AVG", Sequelize.col("avgDailyPower")),
            "averageDailyPower",
          ], // Average of avgDailyPower
          [
            Sequelize.fn("SUM", Sequelize.json("applianceBreakdown.ac")),
            "totalAC",
          ], // Sum for 'ac' (JSON field)
          [
            Sequelize.fn("SUM", Sequelize.json("applianceBreakdown.lights")),
            "totalLights",
          ], // Sum for 'lights' (JSON field)
          [
            Sequelize.fn("SUM", Sequelize.json("applianceBreakdown.washer")),
            "totalWasher",
          ], // Sum for 'washer' (JSON field)
          [
            Sequelize.fn(
              "SUM",
              Sequelize.json("applianceBreakdown.refrigerator")
            ),
            "totalRefrigerator",
          ], // Sum for 'refrigerator' (JSON field)
        ],
        where: whereQuery,
        raw: true, // Get the result as plain objects, not Sequelize instances
      });

      // If no data found
      if (!powerStats.length) {
        return res
          .status(404)
          .json({ message: "No data found for the given user" });
      }

      // Return the aggregated stats
      res.json({
        totalDailyPower: powerStats[0].totalDailyPower,
        totalPower: powerStats[0].totalPower,
        averageDailyPower: powerStats[0].averageDailyPower,
        applianceBreakdown: {
          ac: powerStats[0].totalAC,
          lights: powerStats[0].totalLights,
          washer: powerStats[0].totalWasher,
          refrigerator: powerStats[0].totalRefrigerator,
        },
        userId: req.userId,
      });
    } catch (error) {
      console.error("Error fetching power stats:", error);
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
          [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // Fetch power consumption data
      const costStats = await PowerConsumption.findAll({
        where: whereQuery,
        attributes: [
          [Sequelize.fn("DATE", Sequelize.col("date")), "date"],
          [Sequelize.col("dailyPower"), "dailyPower"],
          [Sequelize.col("avgDailyPower"), "avgDailyPower"],
        ],
        order: [[Sequelize.col("date"), "ASC"]],
        raw: true,
      });

      // Calculate costs (assuming rate of $0.12 per kWh)
      const RATE_PER_KWH = 0.12;
      const processedStats = costStats.map((stat) => ({
        date: stat.date,
        dailyCost: parseFloat((stat.dailyPower * RATE_PER_KWH).toFixed(2)),
        avgDailyCost: parseFloat(
          (stat.avgDailyPower * RATE_PER_KWH).toFixed(2)
        ),
      }));

      res.json(
        processedStats.length
          ? processedStats
          : { totalCost: 0, avgDailyCost: 0 }
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
