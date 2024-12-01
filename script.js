document.addEventListener('DOMContentLoaded', function () {
    const searchQuery = new URLSearchParams(window.location.search).get('query') || '';
    const searchBar = document.getElementById('search-bar');
    searchBar.value = searchQuery;

    // Handle new search form submissions
    const newSearchForm = document.getElementById('new-search-form');
    newSearchForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        const newQuery = searchBar.value.trim();
        if (newQuery) {
            // Update the query in the URL and reload the results
            window.location.href = `results.html?query=${encodeURIComponent(newQuery)}`;
        }
    });

    // Function to fetch and display results
    function displayResults(query) {
        fetch('files.json')
            .then(response => response.json())
            .then(data => {
                if (data && Array.isArray(data)) {
                    const resultsContainer = document.getElementById('results');
                    resultsContainer.innerHTML = ''; // Clear previous results

                    // Filter data based on the search query
                    const filteredFiles = data.filter(file =>
                        file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                    );

                    if (filteredFiles.length === 0) {
                        resultsContainer.innerHTML = '<p>No results found.</p>';
                    } else {
                        // Display filtered results
                        filteredFiles.forEach(file => {
                            let fileElement = `<div class="file-result">`;

                            // Render different content based on file type
                            if (file.type === "image") {
                                fileElement += `<img src="${file.url}" alt="${file.name}">`;
                            } else if (file.type === "audio") {
                                fileElement += `<audio controls src="${file.url}"></audio>`;
                            } else if (file.type === "video") {
                                fileElement += `<video controls width="300" src="${file.url}"></video>`;
                            }

                            // Add file details and download link
                            fileElement += `
                                <p>${file.name}</p>
                                <a href="${file.url}" download>Download</a>
                            </div>`;
                            resultsContainer.innerHTML += fileElement;
                        });
                    }
                }
            })
            .catch(error => console.error('Error fetching files.json:', error));
    }

    // Display results based on the current query
    if (searchQuery) {
        displayResults(searchQuery);
    }
});
