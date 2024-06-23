const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require('bcrypt');
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
const dotenv = require("dotenv");
dotenv.config();
 app.use(morgan('dev'))

app.use(express.json());
const corsOptions = {
  origin: "*",
  methods: ["POST", "GET"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 4000;

const con = mysql.createPool({
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DB,
  port: process.env.MYSQL_PORT,
});

async function ensureTableExists() {
  try {
    // Create the register table
    const createRegisterTableQuery = `
      CREATE TABLE IF NOT EXISTS register (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        mobileNumber VARCHAR(15) NOT NULL UNIQUE,
        useremail VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        referenceCode VARCHAR(10),
        IDOfUser VARCHAR(10) UNIQUE,
        userReferenceCode VARCHAR(10),
        balance DECIMAL(10,2) 
      );
    `;
    await con.execute(createRegisterTableQuery);
    console.log("Table 'register' ensured in the database.");

    const createUploadImagesTableQuery = `
      CREATE TABLE IF NOT EXISTS uploadimages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT,
        amount DECIMAL(10,2),
        status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
        transaction_id VARCHAR(10)
      );
    `;
    await con.execute(createUploadImagesTableQuery);
    console.log("Table 'uploadimages' ensured in the database.");

    const createAdminTableQuery = `
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        adminemail VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `;
    await con.execute(createAdminTableQuery);
    console.log("Table 'admin' ensured in the database.");

    const createRechargeHistory = `
    CREATE TABLE IF NOT EXISTS rechargehistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT,
    amount DECIMAL(10,2),
    rechargeDate DATE,
    status ENUM('approved', 'denied')
  );
    `;

    await con.execute(createRechargeHistory);
    console.log("Table 'recharge' ensured in the database");

    const createAllPeriodsTableThirtySecond = `
    CREATE TABLE IF NOT EXISTS allperiodsthirtysecond (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodNumber VARCHAR(255) NOT NULL, 
    periodDate DATE NOT NULL,
    colorWinner VARCHAR(255) NOT NULL
    );
    `;

    await con.execute(createAllPeriodsTableThirtySecond);
    console.log("Table 'All Periods Thirty Second' ensured in the database");
    const createAllPeriodsTwoMin = `
    CREATE TABLE IF NOT EXISTS allperiodstwomin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodNumber VARCHAR(255) NOT NULL, 
    periodDate DATE NOT NULL,
    colorWinner VARCHAR(255) NOT NULL
    );
    `;

    await con.execute(createAllPeriodsTwoMin);
    console.log("Table 'All Periods Two Min' ensured in the database");

    const createAllUserPeriodsTableThirtySecond = `
    CREATE TABLE IF NOT EXISTS alluserperiodsthirtysecond (
    id INT AUTO_INCREMENT PRIMARY KEY,
    IDOfUser BIGINT,
    periodNumber VARCHAR(255) NOT NULL,
    periodDate DATE NOT NULL,
    betType VARCHAR(50),
    berforeBetAmount DECIMAL(10,2) NOT NULL,
    betAmount DECIMAL(10,2) NOT NULL,
    afterBetAmount DECIMAL(10,2),
    status ENUM('win', 'lose'),
    win_ammount DECIMAL(10,2),
    win_color VARCHAR(50),
    possiblePayout DECIMAL(10,2)
);

    `;
    await con.execute(createAllUserPeriodsTableThirtySecond);
    console.log("Table 'Thirty Second User Table' ensured in the database");
    const createAllUserPeriodsTableTwoMin = `
    CREATE TABLE IF NOT EXISTS twominuserperiod (
    id INT AUTO_INCREMENT PRIMARY KEY,
    IDOfUser BIGINT,
    periodNumber VARCHAR(255) NOT NULL,
    periodDate DATE NOT NULL,
    betType VARCHAR(50),
    berforeBetAmount DECIMAL(10,2) NOT NULL,
    betAmount DECIMAL(10,2) NOT NULL,
    afterBetAmount DECIMAL(10,2),
    status ENUM('win', 'lose'),
    win_ammount DECIMAL(10,2),
    win_color VARCHAR(50),
    possiblePayout DECIMAL(10,2)
);

    `;
    await con.execute(createAllUserPeriodsTableTwoMin);
    console.log("Table 'Two Min User Table' ensured in the database");

    const countPeriodAndTime = `
    CREATE TABLE IF NOT EXISTS countperiodandtime (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodNumber VARCHAR(255) NOT NULL, 
    periodTime Time NOT NULL, 
    periodDate DATE NOT NULL,
    countdown INT NOT NULL
  );
`;

    await con.execute(countPeriodAndTime);
    console.log("countPeriodAndTime created");
    const countPeriodAndTimeTwoMin = `
    CREATE TABLE IF NOT EXISTS twomincounterperiod (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodNumber VARCHAR(255) NOT NULL, 
    periodTime Time NOT NULL, 
    periodDate DATE NOT NULL,
    countdown INT NOT NULL
  );
`;

    await con.execute(countPeriodAndTimeTwoMin);
    console.log("Two Min Time created");


    const thirtySecondAmountCalculator = `
    CREATE TABLE IF NOT EXISTS thirtysecondamountcalculator (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodNumber VARCHAR(255) NOT NULL, 
    color VARCHAR(50),
    redColor INT,
    greenColor INT ,
    violetColor INT 
    
  );
`;
    await con.execute(thirtySecondAmountCalculator);
    console.log("Table thirtysecondamountcalculator created");
    const twoMinAmountCalculator = `
    CREATE TABLE IF NOT EXISTS twominamountcalculator (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodNumber VARCHAR(255) NOT NULL, 
    color VARCHAR(50),
    redColor INT,
    greenColor INT ,
    violetColor INT 
    
  );
`;
    await con.execute(twoMinAmountCalculator);
    console.log("Table thirtysecondamountcalculator created");

    const createWithdrawHistory = `
    CREATE TABLE IF NOT EXISTS withdrawhistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL ,
    withdrawDate DATE NOT NULL,
    status ENUM('approved', 'denied','pending') DEFAULT 'pending'
  );
    `;
    await con.execute(createWithdrawHistory);
    console.log("Table 'Withdraw History' ensured in the database");

    const bankUserDetails = `
    CREATE TABLE IF NOT EXISTS bankDetails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT NOT NULL,
        accountNumber VARCHAR(255) NOT NULL,
        ifscCode VARCHAR(255) NOT NULL
    );
`;
    await con.execute(bankUserDetails);
    console.log("Table 'Bank Details' ensured in the database");

    // Insert predefined admin credentials
    const predefinedAdmins = [
      { adminemail: "akansh@gmail.com", password: "akansh" },
      { adminemail: "aka@gmail.com", password: "akansh" },
      { adminemail: "akan@gmail.com", password: "akansh" },
      { adminemail: "123@gmail.com", password: "akansh" },
    ];
    for (const admin of predefinedAdmins) {
      const [rows] = await con.execute(
        "SELECT * FROM admin WHERE adminemail = ?",
        [admin.adminemail]
      );
      if (rows.length === 0) {
        await con.execute(
          "INSERT INTO admin (adminemail, password) VALUES (?, ?)",
          [admin.adminemail, admin.password]
        );
      }
    }
  } catch (err) {
    console.error("Error ensuring the tables:", err);
  }
} 

ensureTableExists();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function generateRandomUserId() {
  // Generate a random 10-digit number
  const userId = Math.floor(1000000000 + Math.random() * 9000000000);
  return userId;
}

const otpStore = {}; // In-memory store for OTPs
app.post("/register", async (req, res) => {
  const { username, mobileNumber, useremail, password, referenceCode } =
    req.body;

  if (!username || !mobileNumber || !useremail || !password) {
    return res.status(400)
  }

  try {
    const userId = await generateRandomUserId();
    const [existingUsersWithEmail] = await con.execute(
      "SELECT * FROM register WHERE useremail = ?",
      [useremail]
    );

    const [existingUsersWithMobile] = await con.execute(
      "SELECT * FROM register WHERE mobileNumber = ?",
      [mobileNumber]
    );

    if (existingUsersWithEmail.length > 0) {
      return res.status(400).send({ message: "Email already exists" });
    }

    if (existingUsersWithMobile.length > 0) {
      return res.status(400).send({ message: "Mobile number already exists" });
    }

    // Check if the reference code exists in the table
    const [rows] = await con.execute(
      "SELECT * FROM register WHERE userReferenceCode = ?",
      [referenceCode]
    );

    let balance = 20;
    if (rows.length > 0) {
      balance = 30;
    }

    if (referenceCode === "CODER") {
      balance = 50;
    }

    // If user doesn't exist, proceed with registration
    const userReferenceCode = otpGenerator.generate(7, {
      upperCaseAlphabets: true,
      specialChars: false,
      lowerCaseAlphabets: true,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await con.execute(
      "INSERT INTO register (username, mobileNumber, useremail, password, referenceCode, IDOfUser, userReferenceCode, balance) VALUES (?, ?, ?, ?, ?,  ?, ?, ?)",
      [
        username,
        mobileNumber,
        useremail,
        hashedPassword,
        referenceCode,
        userId,
        userReferenceCode,
        balance,
      ]
    );

    const insertedUserId = result.insertId;
    res
      .status(200)
      .send({ message: "Registration Successful", userId: insertedUserId });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send({ message: "Internal Server Error", error: err });
  }
});

app.post("/login", async (req, res) => {
  const { useremail, password } = req.body;

  if (!useremail || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  try {
    // Check if the user is an admin
    const [adminRows] = await con.execute(
      "SELECT * FROM admin WHERE adminemail = ?",
      [useremail]
    );

    if (adminRows.length === 1) {
      const admin = adminRows[0];
      const isPasswordCorrect = (password === admin.password); // Consider using bcrypt for password comparison
      if (isPasswordCorrect) {
        res.cookie(
          "admin",
          {
            adminId: admin.id,
            adminemail: admin.adminemail,
          },
          { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "Lax" }
        );
        return res.status(200).json({
          adminId: admin.id,
          adminemail: admin.adminemail
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    }

    // Check if the user is a regular user
    const [userRows] = await con.execute(
      "SELECT IDOfUser, username, useremail as userEmail, mobileNumber, balance, password FROM register WHERE useremail = ?",
      [useremail]
    );

    if (userRows.length === 1) {
      const user = userRows[0];
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        res.cookie(
          "user",
          {
            userId: user.IDOfUser,
            username: user.username,
            useremail: user.userEmail,
            mobileNumber: user.mobileNumber,
            balance: user.balance,
          },
          { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "Lax" }
        );
        return res.status(200).send({
          userId: user.IDOfUser,
          username: user.username,
          useremail: user.userEmail,
          mobileNumber: user.mobileNumber,
          balance: user.balance,
        });
      } else {
        return res.status(401).send({ message: "Invalid email or password" });
      }
    } else {
      return res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.status(200).send({ message: "Logout successful" });
});

app.post("/send-email-otp", async (req, res) => {
  const { useremail } = req.body;
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: useremail,
      subject: "OTP Verification For Name",
      text: `Your OTP code is ${otp}`,
    });

    otpStore[useremail] = otp; // otpStore should be an in-memory store
    console.log(`OTP sent successfully to ${useremail}: ${otp}`); // Log the OTP sent
    res.status(200).send({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ message: "Failed to send OTP" });
  }
});

app.post("/verify-email-otp", (req, res) => {
  const { useremail, otp } = req.body;

  if (otpStore[useremail] === otp) {
    delete otpStore[useremail];
    res.status(200).send({ message: "OTP verified successfully" });
  } else {
    res.status(400).send({ message: "Invalid OTP" });
  }
});

app.post("/image-upload", async (req, res) => {
  const { userId, amount, input } = req.body;
  try {
    await con.execute(
      "INSERT INTO uploadimages (userId, amount, transaction_id) VALUES (?, ?,?)",
      [userId, amount, input]
    );
    res.status(201).send({ message: "Request Created" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
});
const transactions = new Set();
app.get("/check-transaction/:transactionId", (req, res) => {
  const { inputValue } = req.params;
  if (transactions.has(inputValue)) {
    return res.json({ exists: true });
  } else {
    return res.json({ exists: false });
  }
});

app.get("/all-users", async (req, res) => {
  try {
    // Query all users from the database
    const [usersRows] = await con.execute("SELECT * FROM register");

    // Send the users data as a response
    res.status(200).json(usersRows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/payment", async (req, res) => {
  const user = req.cookies.user;

  if (!user || !user.userId) {
    return res.status(401).send("Unauthorized: No user ID found in cookies");
  }

  const { amount } = req.body;
  if (!amount) {
    return res.status(400).send("Bad Request: Amount is required");
  }

  try {
    await con.execute(
      "INSERT INTO uploadimages (userId, amount, status) VALUES (?, ?, 'pending')",
      [user.userId, amount]
    );

    res.status(200).send("Payment processed successfully");
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).send("Error processing payment");
  }
});

app.get("/api/payments/pending", async (req, res) => {
  try {
    const [rows] = await con.execute(
      "SELECT id, userId, amount,transaction_id FROM uploadimages WHERE status = 'pending'"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    res.status(500).send("Error fetching pending payments.");
  }
});
app.post("/api/payments/approve", async (req, res) => {
  const { id } = req.body;
  try {
    // Fetch the payment details
    const [paymentRows] = await con.execute(
      "SELECT * FROM uploadimages WHERE id = ?",
      [id]
    );
    if (paymentRows.length === 0) {
      throw new Error("Payment not found");
    }
    const payment = paymentRows[0];

    // Approve the payment
    await con.execute(
      'UPDATE uploadimages SET status = "approved" WHERE id = ?',
      [id]
    );

    // Update the user's balance using the IDOfUser from register table
    await con.execute(
      "UPDATE register SET balance = balance + ? WHERE IDOfUser = ?",
      [payment.amount, payment.userId]
    );
    await con.execute(
      "INSERT INTO rechargehistory (userId, amount, rechargeDate, status) VALUES (?, ?, CURDATE(), 'approved')",
      [payment.userId, payment.amount]
    );

    res.status(200).send({ message: "Payment approved" });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).send({ message: "Error approving payment" });
  }
});

app.post("/api/payments/deny", async (req, res) => {
  const { id } = req.body;
  try {
    const [payment] = await con.execute(
      "SELECT * FROM uploadimages WHERE id = ?",
      [id]
    );
    if (payment.length === 0) {
      throw new Error("Payment not found");
    }
    await con.execute(
      'UPDATE uploadimages SET status = "denied" WHERE id = ?',
      [id]
    );

    const [paymentRows] = await con.execute(
      "SELECT userId, amount FROM uploadimages WHERE id = ?",
      [id]
    );
    const payments = paymentRows[0];
    await con.execute(
      "INSERT INTO rechargehistory (userId, amount, rechargeDate, status) VALUES (?, ?, CURDATE(), 'denied')",
      [payments.userId, payments.amount]
    );

    res.status(200).send({ message: "Payment denied" });
  } catch (error) {
    console.error("Error denying payment:", error);
    res.status(500).send({ message: "Error denying payment" });
  }
});

app.get("/api/payments/history", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).send({ message: "Missing userId parameter" });
  }

  try {
    const [paymentHistory] = await con.execute(
      'SELECT * FROM rechargeHistory WHERE status != "pending" AND userId = ?',
      [userId]
    );
    res.status(200).json(paymentHistory);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).send({ message: "Error fetching payment history" });
  }
});
app.get("/api/payments/updatedHistory", async (req, res) => {
  try {
    const [paymentHistory] = await con.execute(
      'SELECT * FROM uploadimages WHERE status != "pending"'
    );
    res.status(200).json(paymentHistory);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).send({ message: "Error fetching payment history" });
  }
});
app.get("/api/payemnt/history123", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    console.error("userId is undefined");
    return res.status(400).send("Bad Request: userId is required");
  }
  try {
    const [rows] = await con.execute(
      "SELECT  id, userId, amount, rechargeDate,status FROM rechargehistory WHERE userId = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching recharge payments:", error);
    res.status(500).send("Error fetching recharge payments.");
  }
});

app.post("/api/withdraw", async (req, res) => {
  const { userId, amount } = req.body;

  // Check if userId, amount are provided and if the amount is valid
  if (!userId || !amount || amount <= 0) {
    return res.status(400).send({ message: "Invalid user ID or amount" });
  }

  // Check if the amount is greater than 300
  if (amount < 300) {
    return res.status(400).send({ message: "Amount must be greater than 300" });
  }

  try {
    // Fetch the user balance from the database
    const [userRows] = await con.execute(
      "SELECT balance FROM register WHERE IDOfUser = ?",
      [userId]
    );

    // Check if the user exists
    if (userRows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const userBalance = userRows[0].balance;
    console.log(userBalance);
    console.log(amount);

    // Check if the user has sufficient balance
    if (userBalance < amount) {
      return res.status(400).send({ message: "Insufficient balance" });
    }

    // Deduct the amount from the user balance
    await con.execute(
      "UPDATE register SET balance = balance - ? WHERE IDOfUser = ?",
      [amount, userId]
    );

    // Insert the withdrawal record into the withdraw history
    await con.execute(
      "INSERT INTO withdrawhistory (userId, amount, withdrawDate) VALUES (?, ?, CURDATE())",
      [userId, amount]
    );

    // Respond with a success message
    res.status(200).send({ message: "Withdrawal successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/api/withdrawl/history", async (req, res) => {
  try {
    const [rows] = await con.execute(
      'SELECT id, userId, amount, withdrawDate,status FROM withdrawhistory WHERE status = "pending"'
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching withdrawal payments:", error);
    res.status(500).send("Error fetching withdrawal payments.");
  }
});
app.get("/api/show/withdrawl/history", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    console.error("userId is undefined");
    return res.status(400).send("Bad Request: userId is required");
  }
  try {
    const [rows] = await con.execute(
      "SELECT amount, withdrawDate,status FROM withdrawhistory WHERE userId = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching withdrawal payments:", error);
    res.status(500).send("Error fetching withdrawal payments.");
  }
});
app.post("/api/withdrawals/accept", async (req, res) => {
  const { id } = req.body;
  try {
    const [withdrawalRows] = await con.execute(
      "SELECT * FROM withdrawhistory WHERE id = ?",
      [id]
    );
    if (withdrawalRows.length === 0) {
      return res.status(404).send({ message: "Withdrawal not found" });
    }

    const withdrawal = withdrawalRows[0];
    await con.execute(
      'UPDATE withdrawhistory SET status = "approved" WHERE id = ?',
      [id]
    );

    res.status(200).send({ message: "Withdrawal accepted" });
  } catch (error) {
    console.error("Error accepting withdrawal:", error);
    res.status(500).send({ message: "Error accepting withdrawal" });
  }
});
app.get("/api/withdrawl/processed-history", async (req, res) => {
  try {
    const [paymentHistory] = await con.execute(
      'SELECT * FROM withdrawhistory WHERE status != "pending"'
    );
    res.status(200).json(paymentHistory);
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).send({ message: "Error fetching withdrawal history" });
  }
});
app.post("/api/withdrawals/deny", async (req, res) => {
  const { id } = req.body;
  try {
    // Fetch the withdrawal details
    const [withdrawalRows] = await con.execute(
      "SELECT * FROM withdrawhistory WHERE id = ?",
      [id]
    );
    if (withdrawalRows.length === 0) {
      return res.status(404).send({ message: "Withdrawal not found" });
    }

    const withdrawal = withdrawalRows[0];
    const { userId, amount } = withdrawal;

    // Update the withdrawal status to 'denied'
    await con.execute(
      'UPDATE withdrawhistory SET status = "denied" WHERE id = ?',
      [id]
    );

    // Fetch the user's current balance
    const [userRows] = await con.execute(
      "SELECT balance FROM register WHERE IDOfUser = ?",
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const user = userRows[0];
    const currentBalance = parseFloat(user.balance);
    const withdrawalAmount = parseFloat(amount);
    const newBalance = currentBalance + withdrawalAmount;

    // Update the user's balance
    await con.execute("UPDATE register SET balance = ? WHERE IDOfUser = ?", [
      newBalance.toFixed(2),
      userId,
    ]);

    res.status(200).send({ message: "Withdrawal denied and balance updated" });
  } catch (error) {
    console.error("Error denying withdrawal:", error);
    res.status(500).send({ message: "Error denying withdrawal" });
  }
});

app.get("/api/balance/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    console.error("userId is undefined");
    return res.status(400).send("Bad Request: userId is required");
  }
  try {
    const [rows] = await con.execute(
      "SELECT balance FROM register WHERE IDOfUser = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).send("Error fetching balance");
  }
});

app.post("/api/bank-details", async (req, res) => {
  const { userId, accountNumber, ifscCode } = req.body;
  try {
    await con.execute(
      "INSERT INTO bankDetails (userId, accountNumber, ifscCode) VALUES (?, ?, ?)",
      [userId, accountNumber, ifscCode]
    );
    res.status(200).send({ message: "Bank Details Submitted Successfully" });
  } catch (error) {
    console.error("Error submitting bank details:", error);
    res.status(500).send({ message: "Error submitting bank details" });
  }
});

app.get("/api/bank-details/:userId", async (req, res) => {
  const { userId } = req.params; // Correctly extract userId from params

  try {
    const [rows] = await con.execute(
      "SELECT accountNumber, ifscCode FROM bankDetails WHERE userId = ?",
      [userId]
    );
    if (rows.length > 0) {
      res.status(200).send(rows[0]);
    } else {
      res.status(404).send({ message: "Bank details not found" });
    }
  } catch (error) {
    console.error("Error fetching bank details:", error);
    res.status(500).send({ message: "Error fetching bank details" });
  }
});

app.get("/api/bank", async (req, res) => {
  const { userId } = req.query; // use req.query to get the query parameter
  try {
    const [rows] = await con.execute(
      "SELECT accountNumber, ifscCode FROM bankDetails WHERE userId = ?",
      [userId]
    );
    res.json(rows[0]); // assuming you get one row per user
  } catch (error) {
    console.error("Error bank details:", error);
    res.status(500).send("Error fetching bank details");
  }
});
app.get("/api/invite/refer/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await con.execute(
      "SELECT userReferenceCode FROM register WHERE IDOfUser = ?",
      [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).send("Error fetching referrals");
  }
});

app.post("/period-timer/post", async (req, res) => {
  const { periodNumber, periodDate } = req.body;
  try {
    const [result] = await con.execute(
      `INSERT INTO allperiodsthirtysecond (periodNumber, periodDate, colorWinner) VALUES (?, ?, ?)`,
      [periodNumber, periodDate, ""]
    );
    res
      .status(200)
      .json({ message: "Period submitted successfully", id: result.insertId });
  } catch (err) {
    console.error("Error inserting period: ", err);
    res.status(500).json({ error: "Error inserting period" });
  }
});

app.get("/period-timer", async (req, res) => {
  try {
    const [rows] = await con.execute(
      `SELECT periodNumber FROM allperiodsthirtysecond ORDER BY periodNumber DESC LIMIT 1`
    );
    if (rows.length > 0) {
      res.status(200).json({ periodNumber: rows[0].periodNumber });
    } else {
      res.status(200).json({ periodNumber: 100000000 }); // Default start period if no records found
    }
  } catch (err) {
    console.error("Error fetching periods: ", err);
    res.status(500).json({ error: "Error fetching periods" });
  }
});

// Endpoint to save countdown time
app.post("/period-time", async (req, res) => {
  const { periodNumber, periodTime, periodDate, countdown } = req.body;

  try {
    const [rows] = await con.query(
      `INSERT INTO countperiodandtime (periodNumber, periodTime, periodDate, countdown) VALUES (?, ?, ?, ?)`,
      [periodNumber, periodTime, periodDate, countdown]
    );
    res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/period-time", async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT countdown FROM countperiodandtime ORDER BY id DESC LIMIT 1`
    );
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Assume you have a route set up like this

app.get("/api/lastPeriodNumber", async (req, res) => {
  try {
    const query =
      "SELECT periodNumber FROM allperiodsthirtysecond ORDER BY id DESC LIMIT 1";
    const [result] = await con.query(query);

    if (result.length > 0) {
      const lastPeriodNumber = result[0].periodNumber;
      console.log("Last periodNumber:", lastPeriodNumber);
      res.json({ lastPeriodNumber });
    } else {
      console.log("No period numbers found in the database.");
      res.status(404).json({ error: "No period numbers found" });
    }
  } catch (error) {
    console.error("Error fetching last periodNumber:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/userBets/:periodNumber", async (req, res) => {
  const { periodNumber } = req.params;

  try {
    const query =
      "SELECT IDOfUser, betType AS color, betAmount AS amount FROM alluserperiodsthirtysecond WHERE periodNumber = ?";
    const [result] = await con.query(query, [periodNumber]);

    if (result.length > 0) {
      res.json(result);
    } else {
      console.log(`No bets found for periodNumber: ${periodNumber}`);
      res
        .status(404)
        .json({ error: `No bets found for periodNumber: ${periodNumber}` });
    }
  } catch (error) {
    console.error("Error fetching user bets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const colorBetAmounts = {
  Red: 0,
  Violet: 0,
  Green: 0,
};
app.post("/place-bet", async (req, res) => {
  const {
    userId,
    periodNumber,
    periodDate,
    betType,
    berforeBetAmount,
    betAmount,
    possiblePayout,
  } = req.body;

  if (colorBetAmounts[betType] !== undefined) {
    colorBetAmounts[betType] += betAmount;
  }
  console.log(colorBetAmounts);

  console.log(
    "Bet placed:",
    userId,
    periodNumber,
    periodDate,
    betType,
    berforeBetAmount,
    betAmount,
    possiblePayout
  );

  const newBalance = berforeBetAmount - betAmount;

  try {
    // Insert the bet into alluserperiodsthirtysecond table
    const [result] = await con.execute(
      `INSERT INTO alluserperiodsthirtysecond (IDOfUser, periodNumber, periodDate, betType, berforeBetAmount, betAmount,possiblePayout)
       VALUES (?, ?, ?, ?, ?, ?,?)`,
      [
        userId,
        periodNumber,
        periodDate,
        betType,
        berforeBetAmount,
        betAmount,
        possiblePayout,
      ]
    );

    // Update the user's balance
    await con.execute(`UPDATE register SET balance = ? WHERE IDOfUser = ?`, [
      newBalance,
      userId,
    ]);

    res
      .status(200)
      .json({ message: "Bet placed successfully", id: result.insertId });
  } catch (error) {
    console.error("Error placing bet:", error);
    res.status(500).json({ error: "Error placing bet" });
  }
});

app.post("/update-amounts", async (req, res) => {
  const { periodNumber } = req.body;

  // Multiply the last updated amounts of red and green by 2, and violet by 4.5
  const updatedRedAmount = colorBetAmounts.Red * 2;
  const updatedGreenAmount = colorBetAmounts.Green * 2;
  const updatedVioletAmount = colorBetAmounts.Violet * 4.5;

  // Find the minimum value among red, green, and violet
  let minColor;
  let minValue;
  if (
    updatedRedAmount <= updatedGreenAmount &&
    updatedRedAmount <= updatedVioletAmount
  ) {
    minColor = "Red";
    minValue = updatedRedAmount;
  } else if (
    updatedGreenAmount <= updatedRedAmount &&
    updatedGreenAmount <= updatedVioletAmount
  ) {
    minColor = "Green";
    minValue = updatedGreenAmount;
  } else {
    minColor = "Violet";
    minValue = updatedVioletAmount;
  }
  try {
    await con.execute(
      `INSERT INTO thirtysecondamountcalculator (periodNumber, redColor, greenColor, violetColor, color) VALUES (?, ?, ?, ?, ?)`,
      [
        periodNumber,
        updatedRedAmount,
        updatedGreenAmount,
        updatedVioletAmount,
        minColor,
      ]
    );

    await con.execute(
      `UPDATE allperiodsthirtysecond SET colorWinner = ? WHERE periodNumber = ?`,
      [minColor, periodNumber]
    );
    await con.execute(
      `UPDATE alluserperiodsthirtysecond SET win_color = ? WHERE periodNumber = ?`,
      [minColor, periodNumber]
    );

    res.status(200).json({ message: "Amounts inserted successfully" });
  } catch (error) {
    console.error("Error inserting amounts:", error);
    res.status(500).json({ error: "Error inserting amounts" });
  }
});
app.post("/update-status", async (req, res) => {
  const { periodNumber, periodDate } = req.body;

  try {
    // First, update the status
    await con.execute(
      `UPDATE alluserperiodsthirtysecond 
       SET status = CASE 
                      WHEN betType = win_color THEN 'win'
                      ELSE 'lose'
                    END
       WHERE periodNumber = ? AND periodDate = ?`,
      [periodNumber, periodDate]
    );

    // Then, fetch the users who won to update their balances
    const [winners] = await con.execute(
      `SELECT IDOfUser, possiblePayout 
       FROM alluserperiodsthirtysecond 
       WHERE periodNumber = ? AND periodDate = ? AND status = 'win'`,
      [periodNumber, periodDate]
    );

    // Update the balance for each winner
    for (const winner of winners) {
      const { IDOfUser, possiblePayout } = winner;

      await con.execute(
        `UPDATE register 
         SET balance = balance + ? 
         WHERE IDOfUser = ?`,
        [possiblePayout, IDOfUser]
      );
    }

    res
      .status(200)
      .json({ message: "Status and balances updated successfully" });
  } catch (error) {
    console.error("Error updating status and balances:", error);
    res.status(500).json({ error: "Error updating status and balances" });
  }
});

app.get("/admin/thirty-second", async (req, res) => {
  try {
    const [entry] = await con.execute(
      "SELECT * FROM thirtysecondamountcalculator"
    );
    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching the latest entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/admin/thirty-second/amount-calculator", async (req, res) => {
  try {
    const [entry] = await con.execute(
      "SELECT * FROM thirtysecondamountcalculator ORDER BY id DESC LIMIT 1"
    );
    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching the latest entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/winner-api", async (req, res) => {
  try {
    const [winner] = await con.execute(
      "SELECT * FROM thirtysecondamountcalculator ORDER BY id DESC LIMIT 1"
    );
    res.status(200).json(winner);
  } catch (error) {
    console.error("Error fetching the latest entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/admin/thirty-second-manual-calculator", async (req, res) => {
  try {
    const [entry] = await con.execute(
      "SELECT * FROM countperiodandtime ORDER BY id DESC LIMIT 1"
    );
    res.status(200).json(entry[0]);
  } catch (error) {
    console.error("Error fetching the latest entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/alluserperiodsthirtysecond", async (req, res) => {
  try {
    const { userId } = req.query;
    const [rows] = await con.execute(
      "SELECT IDOfUser, periodNumber, betType, betAmount, status FROM alluserperiodsthirtysecond WHERE IDOfUser = ? ORDER BY id DESC",
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching 30-second history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/api/alluserperiodsthreeminute", async (req, res) => {
//   try {
//     const { userId } = req.query;
//     const [rows] = await con.execute(
//       "SELECT * FROM alluserperiodsthreeminute WHERE userId = ? ORDER BY id DESC",
//       [userId]
//     );
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("Error fetching 3-minute history:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


app.get("/period-timer/two-min", async (req, res) => {
  try {
    const [rows] = await con.execute(
      `SELECT periodNumber FROM allperiodstwomin ORDER BY periodNumber DESC LIMIT 1`
    ); 
    if (rows.length > 0) {
      res.status(200).json({ periodNumber: rows[0].periodNumber });
    } else {
      res.status(200).json({ periodNumber: 100000000 });
    }
  } catch (err) {
    console.error("Error fetching periods: ", err);
    res.status(500).json({ error: "Error fetching periods" });
  }
});

app.get("/period-time/get-time/two-min", async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT countdown FROM twomincounterperiod ORDER BY id DESC LIMIT 1`
    );
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/winner-api/two-min", async (req, res) => {
  try {
    const [winner] = await con.execute(
      "SELECT * FROM twominamountcalculator ORDER BY id DESC LIMIT 1"
    );
    res.status(200).json(winner);
  } catch (error) {
    console.error("Error fetching the latest entry:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/period-time/two-min", async (req, res) => {
  const { periodNumber, periodTime, periodDate, countdown } = req.body;

  try {
    const [rows] = await con.query(
      `INSERT INTO twomincounterperiod (periodNumber, periodTime, periodDate, countdown) VALUES (?, ?, ?, ?)`,
      [periodNumber, periodTime, periodDate, countdown]
    );
    res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/update-status/two-min", async (req, res) => {
  const { periodNumber, periodDate } = req.body;

  try {
    // First, update the status
    await con.execute(
      `UPDATE twominuserperiod 
       SET status = CASE 
                      WHEN betType = win_color THEN 'win'
                      ELSE 'lose'
                    END
       WHERE periodNumber = ? AND periodDate = ?`,
      [periodNumber, periodDate]
    );

    // Then, fetch the users who won to update their balances
    const [winners] = await con.execute(
      `SELECT IDOfUser, possiblePayout 
       FROM twominuserperiod 
       WHERE periodNumber = ? AND periodDate = ? AND status = 'win'`,
      [periodNumber, periodDate]
    );

    // Update the balance for each winner
    for (const winner of winners) {
      const { IDOfUser, possiblePayout } = winner;

      await con.execute(
        `UPDATE register 
         SET balance = balance + ? 
         WHERE IDOfUser = ?`,
        [possiblePayout, IDOfUser]
      );
    }

    res
      .status(200)
      .json({ message: "Status and balances updated successfully" });
  } catch (error) {
    console.error("Error updating status and balances:", error);
    res.status(500).json({ error: "Error updating status and balances" });
  }
});


app.post("/update-amounts/two-min", async (req, res) => {
  const { periodNumber } = req.body;

  // Multiply the last updated amounts of red and green by 2, and violet by 4.5
  const updatedRedAmount = colorBetAmounts.Red * 2;
  const updatedGreenAmount = colorBetAmounts.Green * 2;
  const updatedVioletAmount = colorBetAmounts.Violet * 4.5;

  // Find the minimum value among red, green, and violet
  let minColor;
  let minValue;
  if (
    updatedRedAmount <= updatedGreenAmount &&
    updatedRedAmount <= updatedVioletAmount
  ) {
    minColor = "Red";
    minValue = updatedRedAmount;
  } else if (
    updatedGreenAmount <= updatedRedAmount &&
    updatedGreenAmount <= updatedVioletAmount
  ) {
    minColor = "Green";
    minValue = updatedGreenAmount;
  } else {
    minColor = "Violet";
    minValue = updatedVioletAmount;
  }
  try {
    await con.execute(
      `INSERT INTO twominamountcalculator (periodNumber, redColor, greenColor, violetColor, color) VALUES (?, ?, ?, ?, ?)`,
      [
        periodNumber,
        updatedRedAmount,
        updatedGreenAmount,
        updatedVioletAmount,
        minColor,
      ]
    );

    await con.execute(
      `UPDATE twominuserperiod SET colorWinner = ? WHERE periodNumber = ?`,
      [minColor, periodNumber]
    );
    await con.execute(
      `UPDATE twominuserperiod SET win_color = ? WHERE periodNumber = ?`,
      [minColor, periodNumber]
    );

    res.status(200).json({ message: "Amounts inserted successfully" });
  } catch (error) {
    console.error("Error inserting amounts:", error);
    res.status(500).json({ error: "Error inserting amounts" });
  }
});

app.post("/period-timer/post/two-min", async (req, res) => {
  const { periodNumber, periodDate } = req.body;
  try {
    const [result] = await con.execute(
      `INSERT INTO allperiodstwomin (periodNumber, periodDate, colorWinner) VALUES (?, ?, ?)`,
      [periodNumber, periodDate, ""]
    );
    res
      .status(200)
      .json({ message: "Period submitted successfully", id: result.insertId });
  } catch (err) {
    console.error("Error inserting period: ", err);
    res.status(500).json({ error: "Error inserting period" });
  }
});

app.post("/place-bet/two-min", async (req, res) => {
  const {
    userId,
    periodNumber,
    periodDate,
    betType,
    berforeBetAmount,
    betAmount,
    possiblePayout,
  } = req.body;

  if (colorBetAmounts[betType] !== undefined) {
    colorBetAmounts[betType] += betAmount;
  }
  console.log(colorBetAmounts);

  console.log(
    "Bet placed:",
    userId,
    periodNumber,
    periodDate,
    betType,
    berforeBetAmount,
    betAmount,
    possiblePayout
  );

  const newBalance = berforeBetAmount - betAmount;

  try {
    // Insert the bet into alluserperiodsthirtysecond table
    const [result] = await con.execute(
      `INSERT INTO twominuserperiod (IDOfUser, periodNumber, periodDate, betType, berforeBetAmount, betAmount,possiblePayout)
       VALUES (?, ?, ?, ?, ?, ?,?)`,
      [
        userId,
        periodNumber,
        periodDate,
        betType,
        berforeBetAmount,
        betAmount,
        possiblePayout,
      ]
    );

    // Update the user's balance
    await con.execute(`UPDATE register SET balance = ? WHERE IDOfUser = ?`, [
      newBalance,
      userId,
    ]);

    res
      .status(200)
      .json({ message: "Bet placed successfully", id: result.insertId });
  } catch (error) {
    console.error("Error placing bet:", error);
    res.status(500).json({ error: "Error placing bet" });
  }
});

app.get("/api/lastPeriodNumber/two-min", async (req, res) => {
  try {
    const query =
      "SELECT periodNumber FROM allperiodstwomin ORDER BY id DESC LIMIT 1";
    const [result] = await con.query(query);

    if (result.length > 0) {
      const lastPeriodNumber = result[0].periodNumber;
      console.log("Last periodNumber:", lastPeriodNumber);
      res.json({ lastPeriodNumber });
    } else {
      console.log("No period numbers found in the database.");
      res.status(404).json({ error: "No period numbers found" });
    }
  } catch (error) {
    console.error("Error fetching last periodNumber:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/userBets/two-min/:periodNumber", async (req, res) => {
  const { periodNumber } = req.params;

  try {
    const query =
      "SELECT IDOfUser, betType AS color, betAmount AS amount FROM twominuserperiod WHERE periodNumber = ?";
    const [result] = await con.query(query, [periodNumber]);

    if (result.length > 0) {
      res.json(result);
    } else {
      console.log(`No bets found for periodNumber: ${periodNumber}`);
      res
        .status(404)
        .json({ error: `No bets found for periodNumber: ${periodNumber}` });
    }
  } catch (error) {
    console.error("Error fetching user bets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
