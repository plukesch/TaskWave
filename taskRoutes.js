// taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('./models/task');
const authenticateToken = require('./authMiddleware'); // Import your JWT middleware

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Returns a list of tasks.
 *     description: Retrieve a list of tasks based on the current user's context.
 *     responses:
 *       200:
 *         description: A list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         status:
 *           type: string
 *           default: 'To-Do'
 */


// Create a new task
router.post('/', authenticateToken, async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Task title is required" });
    }

    try {
        const newTask = new Task({
            title: title,
            user: req.user.id  
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: "Error creating task" });
    }
});

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }); // Filter tasks by user ID
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
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
router.delete('/:taskId', authenticateToken, async (req, res) => {
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

