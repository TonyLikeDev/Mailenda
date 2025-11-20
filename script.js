const emails = [
    {
        id: 1,
        sender: 'Cuoc Thi Nghien Cuu Khoa Hoc',
        subject: 'Invitation to a science competition',
        body: 'You are invited to participate in a science competition on Friday, November 19th, 2025, from 09:30 to 12:30.'
    },
    {
        id: 2,
        sender: 'Son Tra Trekking Tour',
        subject: 'Your booking confirmation',
        body: 'Your booking for the Son Tra Trekking Tour on Friday, November 7th, 2025, from 09:30 to 12:30 has been confirmed.'
    },
    {
        id: 3,
        sender: 'Team Meeting',
        subject: 'Weekly catch-up',
        body: 'A reminder about our weekly team meeting on November 21st, 2025'
    }
];

let inbox = [...emails];
const rejected = [];
const events = [];
let selectedEmail = null;

const inboxList = document.getElementById('inbox-list');
const rejectedList = document.getElementById('rejected-list');
const emailContentDisplay = document.getElementById('email-content-display');
const addBtn = document.getElementById('add-btn');
const rejectBtn = document.getElementById('reject-btn');

function displayEmails() {
    inboxList.innerHTML = '';
    inbox.forEach(email => {
        const li = document.createElement('li');
        li.textContent = email.sender;
        li.addEventListener('click', () => {
            selectedEmail = email;
            displayEmailContent(email);
        });
        inboxList.appendChild(li);
    });

    rejectedList.innerHTML = '';
    rejected.forEach(email => {
        const li = document.createElement('li');
        li.textContent = email.sender;
        rejectedList.appendChild(li);
    });
}

function displayEmailContent(email) {
    emailContentDisplay.innerHTML = `
        <h2>${email.subject}</h2>
        <p><strong>From:</strong> ${email.sender}</p>
        <p>${email.body}</p>
    `;
}

function clearEmailContent() {
    emailContentDisplay.innerHTML = `
        <h2>Email Content</h2>
        <p>Select an email to see its content.</p>
    `;
    selectedEmail = null;
}

function parseDateFromEmail(body) {
    const monthMap = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    const regex = /(?:(\w+), )?(\w+) (\d+)(?:st|nd|rd|th), (\d{4})/;
    const match = body.toLowerCase().match(regex);

    if (match) {
        const [, , monthStr, day, year] = match;
        const month = monthMap[monthStr];
        return new Date(year, month, day);
    }
    return null;
}

addBtn.addEventListener('click', () => {
    if (selectedEmail) {
        const eventDate = parseDateFromEmail(selectedEmail.body);
        if (eventDate) {
            events.push({ title: selectedEmail.subject, date: eventDate });
            inbox = inbox.filter(email => email.id !== selectedEmail.id);
            clearEmailContent();
            displayEmails();
            generateCalendar();
        } else {
            alert('Could not find a date in this email.');
        }
    }
});

rejectBtn.addEventListener('click', () => {
    if (selectedEmail) {
        rejected.push(selectedEmail);
        inbox = inbox.filter(email => email.id !== selectedEmail.id);
        clearEmailContent();
        displayEmails();
    }
});

// Calendar logic
const monthYear = document.getElementById('month-year');
const calendarDates = document.getElementById('calendar-dates');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');

let currentDate = new Date();

function generateCalendar() {
    calendarDates.innerHTML = '';
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;

    for (let i = 0; i < 7; i++) {
        const date = new Date(firstDayOfWeek);
        date.setDate(firstDayOfWeek.getDate() + i);
        const dateElement = document.createElement('div');
        dateElement.classList.add('date');
        dateElement.textContent = date.getDate();

        if (date.toDateString() === new Date().toDateString()) {
            dateElement.classList.add('today');
        }

        const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());
        if (dayEvents.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('events');
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('event');
                eventElement.textContent = event.title;
                eventsContainer.appendChild(eventElement);
            });
            dateElement.appendChild(eventsContainer);
        }

        calendarDates.appendChild(dateElement);
    }
}

prevWeekBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 7);
    generateCalendar();
});

nextWeekBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 7);
    generateCalendar();
});

displayEmails();
generateCalendar();
