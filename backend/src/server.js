require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const roomRoutes = require("./routes/roomRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
    res.send("Server dang chay...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server chạy ở port ${PORT}`);
});