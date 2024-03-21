import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import 'dotenv/config';

const url = "https://covers.openlibrary.org/b/isbn/";
console.log();
const app = express();
const port = 3000;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query(
    "SELECT r.id AS id, r.url AS URL, title, author, read_date, rating, book_summary AS summary FROM book_data AS d JOIN read_books AS r ON r.id=d.id ORDER BY read_date;"
  );
  const bookArray = result.rows;
  res.render("index.ejs", { books: bookArray });
});

app.get("/favs", async (req, res) => {
  const result = await db.query(
    "SELECT r.id AS id, r.url AS URL, title, author, read_date, rating, book_summary AS summary FROM book_data AS d JOIN read_books AS r ON r.id=d.id WHERE rating=10;"
  );
  const bookArray = result.rows;
  res.render("index.ejs", { books: bookArray });
});

app.get("/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/search", async (req,res) => {
    const search = req.body.bookSearch;
    const result = await db.query(
        "SELECT r.id AS id, r.url AS URL, title, author, read_date, rating, book_summary AS summary FROM book_data AS d JOIN read_books AS r ON r.id=d.id;"
      );
    let bookArray = result.rows;
    console.log(bookArray);
    bookArray = bookArray.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
    res.render("index.ejs", { books: bookArray });
})

app.post("/add", async (req, res) => {
  const { newISBN, newTitle, newAuthor, newDate, newRating, newSummary } = req.body;
  const result = await db.query("SELECT MAX(id) FROM read_books");
  const currentId = result.rows[0].max + 1;
  try {
    const response = await axios.get(`${url}${newISBN}.json`);
    const newUrl = response.data.source_url;
    await db.query("INSERT INTO read_books(id, isbn, url) VALUES($1, $2, $3)", [
      currentId,
      newISBN,
      newUrl,
    ]);
  } catch (err) {
    console.error("Error fetching data", err.message);
    res.status(500);
  }
  await db.query("INSERT INTO book_data (id, title, author, read_date, rating, book_summary) VALUES ($1, $2, $3, $4, $5, $6)", [currentId, newTitle, newAuthor, newDate, newRating, newSummary]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
