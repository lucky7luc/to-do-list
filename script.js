document.addEventListener('DOMContentLoaded', () => {
    const currentDate = document.getElementById('day-date');
    const currentMonth = document.getElementById('month-year');
    const totalTasks = document.getElementById('total-tasks');
    const remainingTasks = document.getElementById('remaining-tasks');
    const doneTasks = document.getElementById('done-tasks');
    const tasksContainer = document.querySelector('.tasks-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const makeNewTask = document.getElementById('new-task');
    const inputValue = document.getElementById('text-value');
    const addBtn = document.getElementById('add-task');
    const clearBtn = document.getElementById('clear-btn');
    const confirmCloseDialog = document.getElementById('confirm-close-dialog');
    const cancelBtn = document.getElementById('cancel-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    
    // Get current date details
    const date = new Date();
    const day = date.getDay();
    const dayDate = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Get day name based on day index
    const getDayMessage = day => {
        switch (day) {
            case 0: return Sunday;
            case 1: return Monday;
            case 2: return Tuesday;
            case 3: return Wednesday;
            case 4: return Thursday;
            case 5: return Friday;
            case 6: return Saturday;
            default: return 'Invalid day';
        }
    };
    
    // Get ordinal suffix for date
    const getOrdinalSuffix = date => {
        if (date > 3 && date < 21) return 'th';
        switch (date % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    
    // Format date and month
    const dayMessage = getDayMessage(day);
    const ordinalSuffix = getOrdinalSuffix(dayDate);        
    const formattedDate = `${dayMessage}, ${dayDate}${ordinalSuffix}`;
    const formattedMonth = `${monthNames[month]} ${year}`;

    
    // Set current date and month on the DOM
    currentDate.textContent = formattedDate;
    currentMonth.textContent = formattedMonth;

    // Retrieve task data from localStorage
    const taskData = JSON.parse(localStorage.getItem("data")) || [];
    let taskIdCounter = taskData.length;
    let remainingTasksCounter = 0;
    let doneTasksCounter = 0;
    let currentTask = {};
    
    // Render tasks from the DOM
    const renderTasks = () => {
        tasksContainer.innerHTML = '';
        doneTasksCounter = 0;
        taskIdCounter = taskData.length;

        taskData.forEach(task => {
            const taskId = task.id;
            const taskValue = task.title;
            const deleteBtnId = `delete-item-btn-${taskId}`;
    
            tasksContainer.innerHTML += `
                <div class="to-do-list-item">
                    <input id="${taskId}" class="checkbox" type="checkbox" name="task" value="${taskValue}" >
                    <label for="${taskId}" class="font-color">${taskValue}</label>
                    <button id="${deleteBtnId}" class="delete-item-btn" type="button"><div class="x-shape"></div></button>
                </div>
            `;
            
            const checkbox = document.getElementById(taskId);
            const label = checkbox.nextElementSibling;
            const deleteBtn = document.getElementById(deleteBtnId);

            if (task.done) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#3563e0';
                label.style.fontStyle = 'italic';
                label.style.fontSize = '0.9rem';
                checkbox.setAttribute('checked', 'checked');
                doneTasksCounter++;
            } else {
                label.style.textDecoration = 'none';
            }
            deleteBtn.addEventListener('click', () => removeTask(taskId));
        });

       updateTaskCounters();
        
       // Get all checkboxes
       const checkBoxes = [...document.querySelectorAll('.checkbox')];
       
       // (Single click) Mark a checkbox
       checkBoxes.forEach(el => {
        el.addEventListener('change', () => {
            const dataArrIndex = taskData.findIndex(item => item.id === el.id);
            taskData[dataArrIndex].done = !taskData[dataArrIndex].done;
            localStorage.setItem('data', JSON.stringify(taskData));
            renderTasks();
        });
        // (Double click) edit task
        el.nextElementSibling.addEventListener('dblclick', () => {
            const dataArrIndex = taskData.findIndex(item => item.id === el.id);
            currentTask = taskData[dataArrIndex];
            addNewTask();
            addBtn.textContent = 'update';
            inputValue.value = currentTask.title;
            renderTasks();
        });
       })

       const deleteBtn = [...document.querySelectorAll('.delete-item-btn')];
       // Delete button on each task
       deleteBtn.forEach(el => {
        el.addEventListener('click', () => {
            const dataArrIndex = taskData.findIndex(item => `delete-item-btn-${item.id}` === el.id);
            taskData.splice(dataArrIndex, 1);
            localStorage.setItem('data', JSON.stringify(taskData));
            renderTasks();

        })

       })
    };

    // Updating tasks counters on the DOM
    const updateTaskCounters = () => {
        remainingTasksCounter = taskIdCounter - doneTasksCounter;
        totalTasks.textContent = taskIdCounter;
        remainingTasks.textContent = remainingTasksCounter;
        doneTasks.textContent = doneTasksCounter;
    };
    
    // Add or update a task to localstorage
    const addOrUpdateTask = () => {
        const taskValue = inputValue.value.trim();
        if (!taskValue) return alert('Please enter a Task!');
    
        const dataArrIndex = taskData.findIndex((item) => item.id === currentTask.id);
        const taskObj = {
            id: `${taskValue.toLowerCase().split(" ").join("-")}-${Date.now()}`,
            title: taskValue,
            date: Date.now(),
            done: false,
        };
    
        if (dataArrIndex === -1) {
            taskData.unshift(taskObj);
        } else {
            taskData[dataArrIndex] = taskObj;
        }
        localStorage.setItem('data', JSON.stringify(taskData));
        
        renderTasks();
        inputValue.value = '';
        addItemBtn.style.display = 'block';
        makeNewTask.style.display = 'none';
        addBtn.textContent = 'add';
    };

    // Remove a task
    const removeTask = (taskId) => {
        const taskIndex = taskData.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            taskData.splice(taskIndex, 1);
            localStorage.setItem('data', JSON.stringify(taskData));
            renderTasks();
            updateTaskCounters();
        }
    };
    
    // Show the task input form
    const addNewTask = () => {
        addItemBtn.style.display = 'none';
        makeNewTask.style.display = 'block';
        addBtn.addEventListener('click', addOrUpdateTask);
        inputValue.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === 'Return') {
                e.preventDefault();
                addOrUpdateTask();
            }
        });
    };

    // Clear all tasks from localStorage
    const clearTaskContainer = () => {
        localStorage.removeItem('data');
        taskData.length = 0;
        renderTasks();
    }

    const openTaskForm = () => {
        confirmCloseDialog.showModal();
        clearBtn.style.display = 'none';
    }
    
    addItemBtn.addEventListener('click', addNewTask);
    clearBtn.addEventListener('click', openTaskForm);

    cancelBtn.addEventListener("click", () => {
        confirmCloseDialog.close()
        clearBtn.style.display = 'block';
    });
    clearAllBtn.addEventListener("click", () => {
    confirmCloseDialog.close();
    clearBtn.style.display = 'block';
    clearTaskContainer();
    });
    renderTasks();
});