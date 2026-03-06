const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================================
   MIDDLEWARE (MUST COME FIRST)
========================================= */
app.use(cors());
app.use(express.json());

/* =========================================
   ROUTES IMPORT
========================================= */
const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const eventRoutes = require("./routes/eventRoutes");


/* =========================================
   ROUTES USE
========================================= */
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/users", userRoutes);
app.use("/api", applicationRoutes);
app.use("/api", schemeRoutes);
app.use("/api", internshipRoutes);
app.use("/api", eventRoutes);

/* =========================================
   DEFAULT TEST ROUTE
========================================= */
app.get("/", (req, res) => {
   res.send("Sponsored Program Portal API Running 🚀");
});

/* =========================================
   SERVER START
========================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`🚀 Server running on http://localhost:${PORT}`);
});
