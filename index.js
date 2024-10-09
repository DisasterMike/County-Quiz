import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "OnePaulrus2Many",
  port: 5432
});

db.connect();

// Create quiz from database
let quiz = [];
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query". err.stack);
  }else{
    quiz = res.rows;
  }
  db.end();
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0; // Reset correct count when reloading the site
  await setNextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();

  // If correct
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    moveToNextQuestion(res);
  }
  else // if incorrect
  {
    res.render("results.ejs", {
      totalScore: totalCorrect
    })
  }
});

function moveToNextQuestion(res) {
  totalCorrect++;
  console.log(totalCorrect);

  setNextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: true,
    totalScore: totalCorrect,
  });
}

async function setNextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
