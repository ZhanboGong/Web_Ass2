/**
 * 1 api and fatch √
 * 
 * 3 动态注入卡片 √
 * 4 async await √
 * 5 try catch √
 * 
 * 7 search bar function
 */

// backend interface: event
const API = 'http://localhost:3030/api/events';

/**
 * 
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('events-container');
  try {
    const response = await fetch(API);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    renderEvents(data);
  } catch (error) {
    console.error('Failed to load events:', error);
    container.innerHTML = '<p class="error-message">Could not load events. Try again!</p>';
  }
});

/**
 * 
 * @param {*} data 
 * @returns 
 */
function renderEvents(data) {
  const container = document.getElementById('events-container');
  container.innerHTML = '';
  if (!data || data.length == 0) {
    container.innerHTML = '<p">No events found.</p>';
    return;
  }

  data.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';

    // If the Img is lost, then select the default Img.
    const imageUrl = ev.EventImage || '../img/default.jpg';
    card.innerHTML = `
            <img src="${imageUrl}" alt="${ev.EventName}">
            <div class="event-content">
                <p class="event-date">${formatDate(ev.EventDate)}</p>
                <h3 class="event-title">${ev.EventName}</h3>
                <p class="event-description">${truncate(ev.Description, 100)}</p>
                <div class="event-foot">
                    <span class="tag">${ev.CategoryName}</span>
                    <a href="/event?id=${ev.EventID}">Details →</a>
                </div>
            </div>
        `;
    container.appendChild(card);
  });
}

document.getElementById('basicSearchBtn').addEventListener('click', () => {
  const keyword = document.getElementById('basicSearch').value.trim();
  if (keyword) {
    // Redirect to the search page with the keyword as a query parameter
    window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
  }
});


/**
 * A 'format' was defined as a formatting template.
 * Calling the `toLocaleDateString` method will format the Date object in a custom format
 * @param {*} dateString The original date string that needs to be initially formatted first
 * @returns The date string formatted through the custom template
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Prevent the description filled in from being too long, as this may affect the display of dynamic injection.
 * @param {*} text The description that needs to be handled
 * @param {*} maxLength The maximum acceptable display length
 * @returns The processed string
 */
function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  const maxLengthIndex = text.lastIndexOf(' ', maxLength);
  return text.slice(0, maxLengthIndex) + '...';
}

/**
 * Automatically play the images in the intro folder
 */
const introImg = document.getElementById('introImg');
if (introImg) {
  let idx = 1;
  setInterval(() => {
    idx++;
    introImg.src = `../img/intro/${idx}.jpg`;
    introImg.onerror = () => {
      idx = 1;
      introImg.src = '../img/intro/1.jpg';
    };
  }, 3000);
}
