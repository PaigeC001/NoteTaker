const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Develop', 'public')));

// API Routes - Place these above the HTML routes

// Get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    res.json(JSON.parse(data));
  });
});

// Add a new note
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (title && text) {
    const newNote = { id: uuidv4(), title, text };

    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note' });
      }

      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile(
        path.join(__dirname, 'Develop', 'db', 'db.json'),
        JSON.stringify(notes, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
            return res.status(500).json({ error: 'Failed to save note' });
          }
          res.json(newNote);
        }
      );
    });
  } else {
    res.status(400).json({ error: 'Title and text are required' });
  }
});

// Delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete note' });
    }

    let notes = JSON.parse(data);
    notes = notes.filter((note) => note.id !== id);

    fs.writeFile(
      path.join(__dirname, 'Develop', 'db', 'db.json'),
      JSON.stringify(notes, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return res.status(500).json({ error: 'Failed to delete note' });
        }
        res.json({ message: 'Note deleted successfully' });
      }
    );
  });
});

// HTML Routes

// Route to serve notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// Catch-all route to serve index.html for any other paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Develop', 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});