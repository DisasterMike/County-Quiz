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
let availableHints = 3;
const scoreAddedWhenCorrect = 3;
let currentCapital = "";
let hint = "";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0; // Reset correct count when reloading the site
  hint = "";
  availableHints = 3;
  await setNextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion, hints: availableHints, totalCorrectAnswers: totalCorrect });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  hint = "";

  // If correct
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    moveToNextQuestion(res);
  }
  else // if incorrect
  {
    res.render("results.ejs", {
      hints: availableHints,
      totalCorrectAnswers: totalCorrect,
      question: currentQuestion
    })
  }
});

app.post("/hint", (req, res) =>{
  if (hint < currentQuestion.capital && availableHints > 0) {
    hint += currentCapital[0];
    currentCapital = currentCapital.substring(1);
  }
  
  availableHints--;
  if(availableHints < 0) availableHints = 0;

  res.render("index.ejs", { 
    question: currentQuestion, 
    hints: availableHints, 
    totalCorrectAnswers: totalCorrect,
    currentGuess: hint
  });
});

function moveToNextQuestion(res) {
  totalCorrect ++;
  availableHints += scoreAddedWhenCorrect;
  console.log(totalCorrect);

  setNextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: true,
    hints: availableHints,
    totalCorrectAnswers: totalCorrect
  });
}

async function setNextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentCapital = randomCountry.capital;
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
