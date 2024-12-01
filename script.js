document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById('search-bar');
    const resultsContainer = document.getElementById('results');
    const queryParams = new URLSearchParams(window.location.search);
    const searchQuery = queryParams.get('query') || '';

    // Set the search bar to the current query
    searchBar.value = searchQuery;

    // Function to fetch and display results
    const fetchAndDisplayResults = (query) => {
        fetch('files.json')  // Fetch the files.json data
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = ''; // Clear previous results

                if (data && Array.isArray(data)) {
                    // Split the search query into individual tags
                    const searchTags = query.toLowerCase().split(' ').filter(tag => tag.trim() !== '');

                    // Filter files that have **any** of the tags in the query
                    const filteredFiles = data.filter(file =>
                        searchTags.some(tag => 
                            file.tags.some(fileTag => fileTag.toLowerCase().includes(tag))
                        )
                    );

                    if (filteredFiles.length === 0) {
                        resultsContainer.innerHTML = '<p>No results found.</p>';
                        return;
                    }

                    // Render each result
                    filteredFiles.forEach(file => {
                        let resultHTML = `<div class="file-result">`;

                        if (file.type === "image") {
                            resultHTML += `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; height: auto;">`;
                        } else if (file.type === "audio") {
                            resultHTML += `<audio controls src="${file.url}"></audio>`;
                        } else if (file.type === "video") {
                            resultHTML += `<video controls width="300" src="${file.url}"></video>`;
                        } else if (file.type === "youtube") {
                            // For YouTube videos, embed the YouTube player
                            const videoId = file.url.split('v=')[1].split('&')[0]; // Extract video ID from the URL
                            resultHTML += `
                                <iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                            `;
                        } else {
                            resultHTML += `<p>File: ${file.name}</p>`;
                        }

                        resultHTML += `
                            <p>${file.name}</p>
                            <a href="${file.url}" download>Download</a>
                        </div>`;

                        // Add the result to the container
                        resultsContainer.innerHTML += resultHTML;
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching files.json:', error);
                resultsContainer.innerHTML = '<p>Error loading results.</p>';
            });
    };

    // Display results based on the current query (if any)
    if (searchQuery) {
        fetchAndDisplayResults(searchQuery);
    }

    // Handle new search submissions
    document.getElementById('new-search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const newQuery = searchBar.value.trim();

        if (newQuery) {
            // Update the URL with the new query and reload results
            window.history.pushState({}, '', `results.html?query=${encodeURIComponent(newQuery)}`);
            fetchAndDisplayResults(newQuery);
        }
    });
});
