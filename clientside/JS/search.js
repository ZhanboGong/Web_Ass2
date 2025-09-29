const categoriesAPI = 'http://localhost:3030/api/categories';

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
    const categoryContainer = document.getElementById('category-filters-container');
    const dateContainer = document.getElementById('date-filters-container');
    const datePicker = document.getElementById('date-picker');
    const locationInput = document.getElementById('location-filter');
    const clearButton = document.getElementById('clear-filters-btn');
    const basicSearchInput = document.getElementById('basicSearch');
    const basicSearchBtn = document.getElementById('basicSearchBtn');

    //=====Scaffolding function=====

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
     * Used to prevent multiple calls to the API and for input filtering of the location.
     */
    const debounce = (func, delay = 300) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };
    const debouncedApplyFilters = debounce(applyFilters);

    /**
     * Setup Category Filters by fetching from the API.
     */
    const setupCategoryFilters = async () => {
        try {
            const response = await fetch(categoriesAPI);
            const categories = await response.json();

            categoryContainer.innerHTML = ''; // Clear loading state
            const allBtn = createFilterButton('All', 'category', null);
            allBtn.classList.add('active');
            categoryContainer.appendChild(allBtn);
            categories.forEach(cat => {
                const btn = createFilterButton(cat.CategoryName, 'category', cat.CategoryName);
                categoryContainer.appendChild(btn);
            });
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    /**
     * Setup Date Filters using the current date context.
     */
    const setupDateFilters = () => {
        // Set current date based on context: September 24, 2025
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const formatDate = (date) => date.toISOString().split('T')[0];
        dateContainer.innerHTML = '';
        const allBtn = createFilterButton('Any Date', 'date', null);
        allBtn.classList.add('active');
        dateContainer.appendChild(allBtn);
        dateContainer.appendChild(createFilterButton('Today', 'date', formatDate(today)));
        dateContainer.appendChild(createFilterButton('Tomorrow', 'date', formatDate(tomorrow)));
    };

    /**
     * Create Button: The button in the creation filter used to select the type of activity category and date.
     * @param {*} text The name of the button that needs to be created
     * @param {*} filterType The category or date of the selected type filter
     * @param {*} value The value that needs to be set to the "activeFilter"
     * @returns Return a button within the filter used for selecting the type
     */
    function createFilterButton(text, filterType, value) {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = text;
        // Add an event listener to this button, which is used to change the state of the selected btn.
        btn.addEventListener('click', () => {
            activeFilters[filterType] = value;
            const container = btn.parentElement;
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (filterType === 'date') datePicker.value = '';

            applyFilters();
        });
        return btn;
    }

    /**
     * Initialize the entire filter(clear)
     */
    function clearAdvancedFilters() {
        activeFilters = { category: null, date: null, location: null };
        locationInput.value = '';
        datePicker.value = '';
        document.querySelectorAll('.filter-options').forEach(container => {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            container.firstElementChild.classList.add('active');
        });
    }


    // Click the search button to clear the filter content and ensure the priority of the basic search.
    basicSearchBtn.addEventListener('click', () => {
        clearAdvancedFilters();
        applyFilters();
    });

    // After selecting a specific date, clear the status of the "Clear Date" shortcut button to prioritize the use of this date for filtering.
    datePicker.addEventListener('change', () => {
        if (datePicker.value) {
            activeFilters.date = datePicker.value;
            dateContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            applyFilters();
        }
    });

    // Enter the activity location and we will provide real-time search results.
    locationInput.addEventListener('input', () => {
        activeFilters.location = locationInput.value.trim();
        debouncedApplyFilters();
    });

    // When the clear button is clicked, all the search and filter input fields are reset.
    clearButton.addEventListener('click', () => {
        basicSearchInput.value = ''; // Also clear the basic search input
        clearAdvancedFilters();
        applyFilters();
    });

    // Inialization
    setupCategoryFilters();
    setupDateFilters();

    // Check for a search query from the home page when the page loads
    const urlParams = new URLSearchParams(window.location.search);
    const homeSearchQuery = urlParams.get('q');
    if (homeSearchQuery) {
        basicSearchInput.value = homeSearchQuery; // Populate the search bar
        applyFilters(); // Trigger the search immediately
    } else {
        fetchAndRenderEvents(); // Load all events if no search query
    }
});

/**
 * Based on the provided query string, obtain event data from the API and call the renderResults function to display the results.
 * @param {*} queryString URL query string
 */
async function fetchAndRenderEvents(queryString = "") {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    const API_URL = `http://localhost:3030/api/events?${queryString}`;

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