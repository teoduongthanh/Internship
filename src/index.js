const express = require("express");
const dotenv = require("dotenv");
const mysql = require('mysql2/promise'); // Sử dụng mysql2 với promise
const cors = require('cors');
const routes = require('./routes');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const app = express();
const path = require("path");
const session = require('express-session');
const port = process.env.PORT || 5001;
require('./middleware/passportSetUp'); // Import passport setup

// Set view engine là EJS
app.set('view engine', 'ejs');

// Cấu hình đường dẫn đến thư mục views (trong thư mục src)
app.set('views', path.join(__dirname, './views'));

// Route để render trang social.ejs
app.get('/social', (req, res) => {
  res.render('social', { tokenGG: 'some_token_value' });
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

dotenv.config();

//nhận api mặc định khi kết nối server
app.get("/", (req, res) => {
  return res.send("Success connect with Port");
});

app.use(session({
  secret: 'yourSecretKey', // Bạn nên sử dụng một chuỗi bí mật bảo mật hơn
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Đặt thành true nếu sử dụng HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // Cookie tồn tại trong 1 ngày
  }
}));


// Kết nối MySQL
const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dailydictation',
    });
    return connection;
  } catch (err) {
    console.error('Failed to connect to MySQL:', err);
    process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
  }
};

// Sử dụng middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());
routes(app);

app.listen(port, async () => {
  await connectToDatabase(); // Kết nối đến cơ sở dữ liệu khi khởi chạy server
  console.log("Server is running on port", port);
});
