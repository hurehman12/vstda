const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8484;

const dataPath = path.join(__dirname, 'mockData.json');
let todoItems = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

app.get('/', (req, res) => {
    const uptime = process.uptime();
    res.status(200).json({ status: 'ok', uptime: `${uptime} seconds` });
});

app.get('/api/TodoItems', (req, res) => {
    res.status(200).json(todoItems);
});

app.get('/api/TodoItems/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = todoItems.find(todo => todo.todoItemId === id);
    if (item) {
        res.status(200).json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

app.post('/api/TodoItems', (req, res) => {
    const { name, priority, completed } = req.body;

    // Validate the request body
    if (typeof name !== 'string' || typeof priority !== 'number' || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    const newItem = {
        todoItemId: 0,
        name,
        priority,
        completed
    };

    todoItems.unshift(newItem);

    // Update the todoItemId of all items to ensure consistency
    for (let i = 0; i < todoItems.length; i++) {
        todoItems[i].todoItemId = i;
    }

    res.status(201).json(newItem);
});

app.delete('/api/TodoItems/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = todoItems.findIndex(todo => todo.todoItemId === id);
    if (index !== -1) {
        const deletedItem = todoItems.splice(index, 1);
        res.status(200).json(deletedItem[0]);

        // Update the todoItemId of remaining items
        for (let i = 0; i < todoItems.length; i++) {
            todoItems[i].todoItemId = i;
        }
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.resetTodoItems = () => {
    todoItems = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
};

module.exports = app;
