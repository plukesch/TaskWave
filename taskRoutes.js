// taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('./models/task');
const authenticateToken = require('./authMiddleware'); // Import your JWT middleware

// Create a new task
router.post('/tasks', authenticateToken, async (req, res) => {
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
router.get('/tasks', authenticateToken, async (req, res) => {
    try {
        console.log("hey")
        const tasks = await Task.find();
        console.log(tasks)
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// Update a task
router.put('/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(id, { title, status }, { new: true });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task" });
    }
});

// Delete a task
router.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

module.exports = router;

