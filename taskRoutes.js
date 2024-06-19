const express = require('express');
const router = express.Router();
const Task = require('./models/task');
const authenticateToken = require('./authMiddleware'); // Import your JWT middleware

/**
 * @swagger
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
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Creates a new task.
 *     description: Creates a new task with the given title and status for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task
 *                 example: "Finish the report"
 *               status:
 *                 type: string
 *                 description: Status of the task, defaults to 'To-Do'
 *                 example: "In Progress"
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input provided.
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

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Returns a list of tasks.
 *     description: Retrieve a list of tasks based on the current user's context.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */

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

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Updates a specific task.
 *     description: Updates the task with the specified ID for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The new title of the task.
 *               status:
 *                 type: string
 *                 description: The new status of the task.
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found.
 */

// Update a task
router.put('/:taskId', authenticateToken, async (req, res) => {
    const { taskId } = req.params;
    const { title, status } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(taskId, { title, status }, { new: true });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Error updating task" });
    }
});

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Deletes a specific task.
 *     description: Deletes the task with the specified ID if it belongs to the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully.
 *       404:
 *         description: Task not found.
 */

// Delete a task
router.delete('/:taskId', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

module.exports = router;
