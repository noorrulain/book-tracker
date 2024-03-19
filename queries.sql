-- Create Tables --
CREATE TABLE read_books(
    id SERIAL PRIMARY KEY,
    ISBN CHAR(13),
    url TEXT
);

CREATE TABLE book_data(
    id INTEGER REFERENCES read_books(id) UNIQUE,
    title VARCHAR(100),
    author VARCHAR(100),
    read_date DATE,
    rating INTEGER,
    book_summary TEXT
);

SELECT r.id AS id, r.url AS URL, title, author, read_date, rating
FROM book_data AS d
JOIN read_books AS r ON r.id=d.id;

SELECT * FROM read_books;
SELECT * FROM book_data;