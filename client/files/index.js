//console.log('TaskWave geladen');

document.getElementById('addTodo').addEventListener('click', function() {
    // Eingabefeld erzeugen, falls es noch nicht existiert
    let input = document.querySelector("#todo-list input[type='text']");
    if (!input) {
        input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter a new task';
        input.style.margin = "10px 0";  // Abstand hinzufügen
        document.getElementById('todo-list').prepend(input);  // Eingabefeld am Anfang der Liste einfügen
        input.focus();  // Fokus auf das Eingabefeld setzen

        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && input.value.trim() !== '') {
                const li = document.createElement('li');
                li.textContent = input.value;
                document.getElementById('todo-list').insertBefore(li, input.nextSibling);  // Neue Aufgabe unterhalb des Eingabefelds einfügen
                input.value = '';  // Eingabefeld leeren
            }
        });
    }
});

