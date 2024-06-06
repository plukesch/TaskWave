//console.log('TaskWave geladen');

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
                const li = document.createElement('li');
                li.textContent = task.title;
                li.setAttribute('data-id', task._id);
                enableDrag(li);

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
                    const li = document.createElement('li');
                    li.textContent = task.title;
                    li.setAttribute('data-id', task._id);
                    enableDrag(li);
                    document.getElementById('todo-list').insertBefore(li, input.nextSibling);
                    input.remove(); // Remove input field after adding task
                })
                .catch(error => {
                    console.error('Error adding task:', error);
                });
            }
        });
    }
}



