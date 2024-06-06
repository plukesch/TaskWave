// models/task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, default: 'To-Do' } // Possible statuses: 'To-Do', 'In Progress', 'Done'
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
