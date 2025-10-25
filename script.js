// Gmail API Configuration
// IMPORTANT: Replace with your own Client ID from Google Cloud Console
// Visit https://console.cloud.google.com/apis/credentials to create one
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY_HERE';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.addEventListener('DOMContentLoaded', () => {
    const googleLoginBtn = document.getElementById('google-login');
    const outlookLoginBtn = document.getElementById('outlook-login');
    const signoutBtn = document.getElementById('signout-btn');
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const authStatus = document.getElementById('auth-status');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const boards = document.querySelectorAll('.board');
    const calendar = document.getElementById('calendar');

    // Initialize GAPI (Google API)
    gapiLoaded();
    // Initialize GIS (Google Identity Services)
    gisLoaded();

    // Gmail API login functionality
    googleLoginBtn.addEventListener('click', handleAuthClick);
    signoutBtn.addEventListener('click', handleSignoutClick);

    // Outlook login (mock functionality - keeping original)
    outlookLoginBtn.addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        renderCalendar();
    });

    /**
     * Callback after api.js is loaded.
     */
    function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
    }

    /**
     * Callback after the API client is loaded. Loads the discovery doc to initialize the API.
     */
    async function initializeGapiClient() {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
    }

    /**
     * Callback after Google Identity Services are loaded.
     */
    function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
    }

    /**
     * Enables user interaction after all libraries are loaded.
     */
    function maybeEnableButtons() {
        if (gapiInited && gisInited) {
            googleLoginBtn.disabled = false;
            authStatus.textContent = 'Ready to sign in';
        }
    }

    /**
     * Sign in the user upon button click.
     */
    function handleAuthClick() {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                authStatus.textContent = 'Authentication failed: ' + resp.error;
                throw (resp);
            }
            authStatus.textContent = 'Successfully authenticated!';
            googleLoginBtn.classList.add('hidden');
            signoutBtn.classList.remove('hidden');
            loginContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
            
            // Load Gmail data
            await listLabels();
            renderCalendar();
        };

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    }

    /**
     * Sign out the user upon button click.
     */
    function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            appContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
            googleLoginBtn.classList.remove('hidden');
            signoutBtn.classList.add('hidden');
            authStatus.textContent = 'Please sign in to continue';
        }
    }

    /**
     * Print all Labels in the authorized user's inbox. If no labels
     * are found an appropriate message is printed.
     */
    async function listLabels() {
        let response;
        try {
            response = await gapi.client.gmail.users.labels.list({
                'userId': 'me',
            });
        } catch (err) {
            console.error('Error loading Gmail labels:', err);
            authStatus.textContent = 'Error loading Gmail data';
            return;
        }
        const labels = response.result.labels;
        if (!labels || labels.length === 0) {
            console.log('No labels found.');
            return;
        }
        // Log the labels for debugging
        console.log('Gmail Labels:');
        labels.forEach((label) => {
            console.log(`- ${label.name}`);
        });
    }


    // To-do list functionality
    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        if (taskText !== '') {
            const task = createTaskElement(taskText, dueDate);
            document.querySelector('#not-working .dropzone').appendChild(task);
            taskInput.value = '';
            dueDateInput.value = '';
            updateReminders(task);
        }
    });

    function createTaskElement(text, dueDate) {
        const task = document.createElement('div');
        task.classList.add('task');
        task.draggable = true;
        task.innerText = text;
        task.dataset.dueDate = dueDate;
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragend', handleDragEnd);
        return task;
    }

    // Drag and drop functionality
    let draggedTask = null;

    function handleDragStart(e) {
        draggedTask = e.target;
        setTimeout(() => {
            e.target.style.display = 'none';
        }, 0);
    }

    function handleDragEnd(e) {
        setTimeout(() => {
            draggedTask.style.display = 'block';
            draggedTask = null;
        }, 0);
        updateReminders(e.target);
    }

    boards.forEach(board => {
        const dropzone = board.querySelector('.dropzone');
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragenter', handleDragEnter);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
    });

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDragEnter(e) {
        e.target.style.borderStyle = 'solid';
    }

    function handleDragLeave(e) {
        e.target.style.borderStyle = 'dashed';
    }

    function handleDrop(e) {
        e.preventDefault();
        e.target.style.borderStyle = 'dashed';
        if (e.target.classList.contains('dropzone')) {
            e.target.appendChild(draggedTask);
        }
    }

    // Smart reminder logic
    function updateReminders(task) {
        const dueDate = new Date(task.dataset.dueDate);
        const today = new Date();
        const timeDiff = dueDate.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (dayDiff <= 0) return;

        const status = task.parentElement.parentElement.dataset.status;
        let progress = 0;
        if (status === 'doing') {
            progress = 0.5; // Assuming "Doing" is 50%
        } else if (status === 'finish') {
            progress = 1;
        }

        const remainingWork = 1 - progress;
        const remainingDays = dayDiff;
        
        // More sophisticated logic can be added here
        if (remainingWork > 0 && remainingDays > 0) {
            let reminderDay;
            if (progress < 0.5) {
                // Remind earlier if progress is low
                reminderDay = Math.floor(remainingDays * 0.4);
            } else {
                // Remind later if progress is high
                reminderDay = Math.floor(remainingDays * 0.8);
            }
            const reminderDate = new Date(today.getTime() + reminderDay * (1000 * 3600 * 24));
            
            console.log(`Reminder for "${task.innerText}" set on ${reminderDate.toDateString()}`);
            addReminderToCalendar(reminderDate, task.innerText);
        }
    }

    function renderCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        calendar.innerHTML = ''; // Clear previous calendar

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-day-header');
            dayHeader.innerText = day;
            calendar.appendChild(dayHeader);
        });

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            calendar.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.dataset.date = new Date(year, month, i).toDateString();
            dayCell.innerText = i;
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today');
            }
            calendar.appendChild(dayCell);
        }
    }

    function addReminderToCalendar(date, text) {
        const dateString = date.toDateString();
        const dayCell = document.querySelector(`.calendar-day[data-date="${dateString}"]`);
        if (dayCell) {
            dayCell.classList.add('reminder');
            const reminderText = document.createElement('span');
            reminderText.classList.add('reminder-text');
            reminderText.innerText = text;
            dayCell.appendChild(reminderText);
        }
    }
});
