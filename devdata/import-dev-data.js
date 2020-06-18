const dotenv = require('dotenv');
dotenv.config({ path: '../config/config.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../models/tour');
const Review = require('./../models/review');
const User = require('./../models/user');
const Conversation = require('../models/conversation');
const Message = require('../models/message');


const DB = 'mongodb+srv://davit:vardanyan@cluster0-ycdz4.mongodb.net/test?retryWrites=true&w=majority';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const conversations = JSON.parse(fs.readFileSync(`${__dirname}/conversations.json`, 'utf-8'));
const messages = JSON.parse(fs.readFileSync(`${__dirname}/messages.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    // await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false });
    // await Review.create(reviews);
    await Conversation.create(conversations);
    // await Message.create(messages);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    // await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    await Conversation.deleteMany();
    // await Message.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
