import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Missing MONGODB_URI in .env file');
  process.exit(1);
}

if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <passwordPlaceholder> [name] [number]');
  process.exit(1);
}

const name = process.argv[3];
const number = process.argv[4];

mongoose.set('strictQuery', false);
mongoose.connect(uri);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  // Show all entries
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach((p) => console.log(`${p.name} ${p.number}`));
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  // Add a new person
  const person = new Person({ name, number });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log('Invalid arguments. Usage: node mongo.js <passwordPlaceholder> [name] [number]');
  mongoose.connection.close();
}
