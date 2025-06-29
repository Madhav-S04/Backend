import mongoose from 'mongoose';

// Custom validator for phone number format
const phoneValidator = (value) => {
  // Must be in format XX-XXXXXXX or XXX-XXXXXXX, where X is a digit
  return /^\d{2,3}-\d+$/.test(value);
};

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters long'],
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    minlength: [8, 'Phone number must be at least 8 characters long'],
    validate: {
      validator: phoneValidator,
      message: props => `${props.value} is not a valid phone number! Expected format: XX-XXXXXXX or XXX-XXXXXXX`
    },
    required: [true, 'Phone number is required']
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Person', personSchema);
