# BABEL — Personal Library

BABEL is a lightweight library management web app for keeping track of the books you own, read, or plan to read. It provides a simple interface for managing book information directly in the browser.

## Features

- **Add books** with a title, author, genre, publication year, reading status, and description.
- **Edit books** by loading their existing information into the form and updating the saved entry.
- **Delete books** with a confirmation step.
- **Sort the library** by title, author, or publication year.
- **Keep data between visits** using the browser's `localStorage`.
- **Handle missing publication years** without treating an empty year as `0`.

## Built with

- HTML
- JavaScript (ES modules)
- Tailwind CSS v4
- Browser `localStorage` for persistent data

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) and npm
- A modern web browser

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Move into the project directory:

   ```bash
   cd Babel
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the Tailwind CSS development process:

   ```bash
   npm run dev
   ```

5. Open the project's `index.html` using a local development server, such as the VS Code **Live Server** extension.

> Keep the `npm run dev` process running while developing so Tailwind can watch for changes and rebuild the CSS.

## Data storage

BABEL stores its library in the browser's `localStorage` under the key:

```text
babel-books
```

This means the library remains available when the page is reopened in the same browser. The data is stored locally in that browser; it is not automatically synchronized between devices or browsers. Clearing the browser's site data can remove the saved library, so avoid doing that if you need to keep your books.

## Book information

Each book contains the following information:

| Field         | Description                                          |
| ------------- | ---------------------------------------------------- |
| `id`          | Unique identifier generated for the book.            |
| `title`       | Book title.                                          |
| `author`      | Book author.                                         |
| `genre`       | Book genre or category.                              |
| `year`        | Publication year, or `null` when it is not provided. |
| `status`      | The book's reading status.                           |
| `description` | Additional information about the book.               |

## Project notes

- Books are identified by their unique IDs, rather than by their position in the array. This allows entries to be edited or deleted reliably when the library is sorted.
- Sorting creates a copy of the books array before calling `.sort()`, so the original array order is not mutated by the sorting functions.
- Books without a publication year are placed after books with a known year when sorting by year.

## Future improvements

Possible additions include importing and exporting a library backup, richer filtering, and synchronization across devices.

---

Made with care as a JavaScript library-management project.
