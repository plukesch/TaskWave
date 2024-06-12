// taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('./models/task');

// Create a new task
router.post('/tasks', async (req, res) => {
  const { title } = req.body;
  try {
    const newTask = new Task({ title });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Update task status
router.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task" });
    }
});


// Delete a task
router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

router.delete('/tasks/:taskId', async (req, res) => {
  try {
      const task = await Task.findByIdAndDelete(req.params.taskId);
      if (!task) {
          return res.status(404).send({ message: 'Task not found' }); // Sorgt dafür, dass ein Fehler geworfen wird, wenn der Task nicht gefunden wird.
      }
      res.status(200).send({ message: 'Task deleted successfully' });
  } catch (error) {
      res.status(500).send({ message: 'Error deleting task' });
  }
});


module.exports = router;
