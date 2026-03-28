const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'tasks.json');

function loadTasks() {
    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
        return [];
    }
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8') || '[]');
}

function saveTasks(tasks) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
}

const [, , command, ...args] = process.argv;

// Helper function para sa parehong format ng oras
const getTimestamp = () => new Date().toLocaleString();

switch (command) {
    case 'add':
        const tasks = loadTasks();
        const newTask = {
            id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
            description: args[0],
            status: 'todo',
            createdAt: getTimestamp(), // Readable format
            updatedAt: getTimestamp()  // Readable format
        };
        tasks.push(newTask);
        saveTasks(tasks);
        console.log(`Task added successfully (ID: ${newTask.id})`);
        break;

    case 'update':
        let tasksUpdate = loadTasks();
        let task = tasksUpdate.find(t => t.id === parseInt(args[0]));
        if (task) {
            task.description = args[1];
            task.updatedAt = getTimestamp(); // Update gamit ang readable format
            saveTasks(tasksUpdate);
            console.log(`Task ${args[0]} updated.`);
        } else {
            console.log("Error: Task not found.");
        }
        break;

    case 'mark-in-progress':
    case 'mark-done':
        let tasksMark = loadTasks();
        let tMark = tasksMark.find(t => t.id === parseInt(args[0]));
        if (tMark) {
            tMark.status = command === 'mark-done' ? 'done' : 'in-progress';
            tMark.updatedAt = getTimestamp(); // Update gamit ang readable format
            saveTasks(tasksMark);
            console.log(`Task ${args[0]} status updated.`);
        } else {
            console.log("Error: Task not found.");
        }
        break;

    case 'list':
        const all = loadTasks();
        const filter = args[0]; // e.g., 'todo', 'done', 'in-progress'
        const filtered = filter ? all.filter(t => t.status === filter) : all;

        if (filtered.length === 0) {
            console.log("No tasks found.");
        } else {
            console.table(filtered);
        }
        break;

    case 'delete':
        const deleteId = parseInt(args[0]);
        let tasksBefore = loadTasks();
        const tasksAfter = tasksBefore.filter(t => t.id !== deleteId);

        if (tasksBefore.length === tasksAfter.length) {
            console.log(`Error: Task with ID ${deleteId} not found.`);
        } else {
            saveTasks(tasksAfter);
            console.log(`Task deleted successfully (ID: ${deleteId})`);
        }
        break;

    default:
        console.log("Usage: node app.js [add|update|delete|mark-in-progress|mark-done|list]");
}