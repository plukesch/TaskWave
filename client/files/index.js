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
    const token = localStorage.getItem('token'); // Retrieve token here
    console.log(token);
    if (!token) {
        alert('You must be logged in to view tasks');
        window.location.href = '/login';
        return;
    }

    fetch('/api/tasks', {
        headers: {
            'Authorization': `Bearer ${token}`, // Include token here
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.headers.get('content-type').includes('text/html')) {
            // If the response is HTML, log it to the console
            return response.text().then(text => {
                console.error('Error response as HTML:', text);
                throw new Error('Expected JSON but received HTML');
            });
        }
        return response.json();
    })
    .then(tasks => {
        console.log(tasks);
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
                const token = localStorage.getItem('token'); // Retrieve token here

                fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include token here
                    },
                    body: JSON.stringify({ title }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add task');
                    }
                    return response.json();
                })
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
    li.setAttribute('data-id', task._id);
    enableDrag(li);

    const taskText = document.createElement('span');
    taskText.textContent = task.title;
    li.appendChild(taskText);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => editTask(task._id, taskText);
    li.appendChild(editButton);

    const highlightButton = document.createElement('button');
    highlightButton.textContent = '!';
    highlightButton.onclick = () => toggleHighlight(taskText);
    li.appendChild(highlightButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function() { deleteTask(task._id, li); };
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

function editTask(taskId, element) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = element.textContent;
    element.parentNode.replaceChild(input, element);
    input.focus();

    // Sobald der Benutzer die Eingabe beendet, wird `updateTask` aufgerufen
    input.onblur = () => updateTask(taskId, input.value, input);
    input.onkeypress = (event) => {
        if (event.key === 'Enter') {
            input.blur(); // Löst `onblur` aus, das das Update ausführt
        }
    };
}


function toggleHighlight(element) {
    element.style.color = element.style.color === 'red' ? '' : 'red'; // Toggle Farbe zwischen rot und Standard
}

function updateTask(taskId, newTitle, input) {
    const token = localStorage.getItem('token'); // Retrieve token here

    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include token here
        },
        body: JSON.stringify({ title: newTitle })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        return response.json();
    })
    .then(data => {
        const newSpan = document.createElement('span');
        newSpan.textContent = newTitle;
        newSpan.ondblclick = () => editTask(taskId, newSpan);

        const highlightButton = input.nextElementSibling.nextElementSibling;
        highlightButton.onclick = () => toggleHighlight(newSpan);

        input.parentNode.replaceChild(newSpan, input);
    })
    .catch(error => {
        console.error('Error updating task:', error);
        alert('Error updating task: ' + error.message);
        input.parentNode.replaceChild(element, input);
    });
}


function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to view tasks');
        window.location.href = '/login';
        return;
    }

    fetch('/api/tasks', {
        headers: {
            'Authorization': `Bearer ${token}` // Include token here
        }
    })
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
        console.error('Error fetching tasks:', error);
    });
}

function deleteTask(taskId, liElement) {
    const token = localStorage.getItem('token'); // Retrieve token here

    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include token here
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        liElement.remove();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
        alert('Error deleting task: ' + error.message);
    });
}

function logout() {
    localStorage.removeItem('token'); // Remove the token from localStorage
    window.location.href = '/login'; // Redirect to login page
}

function updateWeather() {
    const city = document.getElementById('city-input').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    fetchWeather(city);
}

function fetchWeather(city) {
    const apiKey = 'd5e2d893a8ee67f8be1889205e775ab2'; // Replace with your real API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherDisplay(data);
        })
        .catch(error => {
            console.error('Failed to retrieve weather data:', error);
        });
}

function updateWeatherDisplay(data) {
    if (!data || !data.weather || !data.main) {
        console.error('Invalid weather data:', data);
        alert('Invalid weather data received from the server.');
        return;
    }

    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');

    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`; // Round the temperature for better display
    description.textContent = data.weather[0].description;
}



document.addEventListener('DOMContentLoaded', fetchTasks);


