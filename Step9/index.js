const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // Added for cross-origin requests
const app = express();

app.use(cors()); // Allow requests from frontend (e.g., Vite dev server)
app.use(express.json());

// Custom Morgan token to log request body for POST
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

// Logging middleware with custom format
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

let persons = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' }
];

// GET all persons
app.get('/api/persons', (req, res) => {
  res.json(persons);
});

// GET info page
app.get('/info', (req, res) => {
  const count = persons.length;
  const date = new Date();
  res.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `);
});

// GET a single person by ID
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = persons.find(p => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).send({ error: 'Person not found' });
  }
});

// DELETE a person by ID
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const index = persons.findIndex(p => p.id === id);
  if (index !== -1) {
    persons.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).send({ error: 'Person not found' });
  }
});

// POST a new person
app.post('/api/persons', (req, res) => {
  const body = req.body;

  console.log('Received POST body:', body); // Debug log

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number is missing' });
  }

  const nameExists = persons.some(p => p.name === body.name);
  if (nameExists) {
    return res.status(400).json({ error: 'name must be unique' });
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1e9).toString(),
    name: body.name,
    number: body.number
  };

  persons.push(newPerson);
  res.json(newPerson);
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
