// index.js

document.addEventListener('DOMContentLoaded', loadTasks);

function enableDrag(item) {
    item.draggable = true;
    item.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
    });
}

function setupDropZones() {
    const dropzones = document.querySelectorAll('.dropzone');

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', (event) => {
            event.preventDefault(); // Necessary to allow drop
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (event) => {
            event.preventDefault();
            zone.classList.remove('dragover');
            const id = event.dataTransfer.getData('text/plain');
            const element = document.querySelector(`[data-id="${id}"]`);
            if (zone !== element.parentElement) {
                zone.appendChild(element);
                updateTaskStatus(id, zone.getAttribute('id'));
            }
        });
    });
}

function updateTaskStatus(taskId, newStatusId) {
    let status;
    switch (newStatusId) {
        case 'in-progress-list':
            status = 'In Progress';
            break;
        case 'done-list':
            status = 'Done';
            break;
        default:
            status = 'To-Do';
            break;
    }

    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => console.log("Updated Task:", data))
    .catch(error => console.error('Error updating task status:', error));
}

function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            const todoList = document.getElementById('todo-list');
            const inProgressList = document.getElementById('in-progress-list');
            const doneList = document.getElementById('done-list');

            tasks.forEach(task => {
                addTask(task, todoList, inProgressList, doneList);
            });
            setupDropZones();
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

document.getElementById('addTodo').addEventListener('click', function() {
    addInputField();
});

function addInputField() {
    let input = document.querySelector("#todo-list input[type='text']");
    if (!input) {
        input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter a new task';
        input.style.margin = "10px 0";
        document.getElementById('todo-list').prepend(input);
        input.focus();

        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && input.value.trim() !== '') {
                const title = input.value;
                fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title }),
                })
                .then(response => response.json())
                .then(task => {
                    addTask(task, document.getElementById('todo-list'), null, null);
                    input.remove(); // Remove input field after adding task
                })
                .catch(error => {
                    console.error('Error adding task:', error);
                });
            }
        });
    }
}

function addTask(task, todoList, inProgressList, doneList) {
    const li = document.createElement('li');
    li.textContent = task.title;
    li.setAttribute('data-id', task._id); // Setzen der data-id
    enableDrag(li);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() { deleteTask(task._id, li); }; // Nutzung der _id beim Aufruf von deleteTask
    li.appendChild(deleteButton);

    switch (task.status) {
        case 'In Progress':
            inProgressList.appendChild(li);
            break;
        case 'Done':
            doneList.appendChild(li);
            break;
        default:
            todoList.appendChild(li);
    }
}


function deleteTask(taskId, liElement) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) { // Verarbeitet sowohl 404 als auch 500 Fehler korrekt.
            throw new Error('Failed to delete task');
        }
        liElement.remove(); // Entfernt das Listenelement, wenn der Server den Löschvorgang bestätigt
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting task: ' + error.message); // Zeigt einen Fehlerdialog an, falls etwas schiefgeht
    });
}


deleteButton.onclick = function() {
    console.log("Deleting task with ID:", task._id); // Zum Debuggen, um die ID zu sehen
    deleteTask(task._id, li);
};
