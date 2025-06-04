import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Morgan token for POST body logging
morgan.token('post-data', (req) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
);
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :post-data')
);

// MongoDB connection
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Define Mongoose schema and model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

// Routes

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const date = new Date();
    res.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${date}</p>
    `);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number is missing' });
  }

  Person.findOne({ name: body.name }).then(existingPerson => {
    if (existingPerson) {
      return res.status(400).json({ error: 'name must be unique' });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person.save()
      .then(savedPerson => {
        res.json(savedPerson);
      })
      .catch(error => next(error));
  });
});

// Serve frontend (dist folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
