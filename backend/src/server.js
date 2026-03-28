require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const roomRoutes = require("./routes/roomRoutes");
const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)"));
    }
  },
});

// Serve static files từ uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/movies", require("./routes/movieRoutes")(upload));
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
    res.send("Server dang chay...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server chạy ở port ${PORT}`);
});