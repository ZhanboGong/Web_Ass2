const categoriesAPI = 'http://localhost:3030/api/categories';
const eventsAPI = 'http://localhost:3030/api/events';

/**
 * Store the content of the currently active filtering conditions (A2 requirement)
 */
document.addEventListener('DOMContentLoaded', () => {
    let activeFilters = {
        category: null,
        date: null,
        location: null
    };

    // Obtain the elements in the HTML that require interactionDOM Elements
    const categorySelect = document.getElementById('category-filter');
    const datePicker = document.getElementById('date-filter');
    const locationInput = document.getElementById('location-filter');
    const clearButton = document.getElementById('clear-filters-btn');
    const basicSearchInput = document.getElementById('basicSearch');
    const basicSearchBtn = document.getElementById('basicSearchBtn');
    const filterForm = document.getElementById('filter-form');

    //Scaffolding function

    /**
     * Combine the activated options in the filter and the keywords in the search bar into an URL query string, 
     * and then use this to call the rendering method for rendering.
     */
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (activeFilters.category) params.append('category', activeFilters.category);
        if (activeFilters.date) params.append('date', activeFilters.date);
        if (activeFilters.location) params.append('location', activeFilters.location);
        const keyword = basicSearchInput.value.trim();
        if (keyword) {
            params.append('q', keyword);
        }
        fetchAndRenderEvents(params.toString());
    };

    /**
     * Setup Category Filters by fetching from the API.
     */
    const setupCategoryFilters = async () => {
        try {
            const response = await fetch(categoriesAPI);
            const categories = await response.json();
            categorySelect.innerHTML = '';
            const allOption = document.createElement('option');
            allOption.textContent = 'All Categories';
            allOption.value = '';
            categorySelect.appendChild(allOption);

            categories.forEach(category => {
                const option = document.createElement('option');
                option.textContent = category.CategoryName;
                option.value = category.CategoryName;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    /**
     * Initialize the entire filter(clear)
     */
    function clearAdvancedFilters() {
        activeFilters = { category: null, date: null, location: null };
        filterForm.reset();
    }


    // Click the search button to clear the filter content and ensure the priority of the basic search.
    basicSearchBtn.addEventListener('click', () => {
        clearAdvancedFilters();
        applyFilters();
    });

    // When the clear button is clicked, all the search and filter input fields are reset.
    clearButton.addEventListener('click', () => {
        basicSearchInput.value = '';
        clearAdvancedFilters();
        applyFilters();
    });

    /**
     * Listen for the 'submit' event of the filtering form, and then call the `applyFilters()` function to initiate the search.
     */
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        activeFilters.category = categorySelect.value || null;
        activeFilters.date = datePicker.value || null;
        activeFilters.location = locationInput.value.trim() || null;
        applyFilters();
    });


    // Inialization
    setupCategoryFilters();

    // Check for a search query from the home page when the page loads
    const urlParams = new URLSearchParams(window.location.search);
    const homeSearchQuery = urlParams.get('q');
    if (homeSearchQuery) {
        basicSearchInput.value = homeSearchQuery;
        applyFilters();
    } else {
        fetchAndRenderEvents();
    }
});


/**
 * Based on the provided query string, obtain event data from the API and call the renderResults function to display the results.
 * @param {*} queryString URL query string
 */
async function fetchAndRenderEvents(queryString = "") {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    const API_URL = `${eventsAPI}?${queryString}`;
    try {
        const response = await fetch(API_URL);
        const events = await response.json();
        renderResults(events);
    } catch (error) {
        console.error('Failed to fetch events:', error);
        resultsContainer.innerHTML = '<p class="error-message">Could not fetch events.</p>';
    }
}

/**
 * Dynamic injection: Render the received event data onto the search page.
 * @param {*} events An array containing event objects
 * @returns 
 */
function renderResults(events) {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '';
    if (!events || events.length === 0) {
        resultsContainer.innerHTML = '<p>No events match your criteria.</p>';
        return;
    }
    events.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'event-card';
        const imageUrl = ev.EventImage || '../img/default-event.jpg';

        card.innerHTML = `
            <a href="/event?id=${ev.EventID}" class="card-link">
                <img src="${imageUrl}" alt="${ev.EventName}">
                <div class="event-content">
                    <p class="event-date">${formatDate(ev.EventDate)}</p>
                    <h3 class="event-title">${ev.EventName}</h3>
                    <p class="event-description">${truncate(ev.Description, 100)}</p>
                    <div class="event-foot">
                        <span class="tag">${ev.CategoryName}</span>
                        <span class="details-link">Details →</span>
                    </div>
                </div>
            </a>
        `;
        resultsContainer.appendChild(card);
    });
}

/**
 * A 'format' was defined as a formatting template.
 * Calling the `toLocaleDateString` method will format the Date object in a custom format
 * @param {string} dateString The original date string that needs to be initially formatted first
 * @returns The date string formatted through the custom template
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Prevent the description filled in from being too long, as this may affect the display of dynamic injection.
 * @param {string} text The description that needs to be handled
 * @param {number} maxLength The maximum acceptable display length
 * @returns The processed string
 */
function truncate(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    const maxLengthIndex = text.lastIndexOf(' ', maxLength);
    return text.slice(0, maxLengthIndex) + '...';
}