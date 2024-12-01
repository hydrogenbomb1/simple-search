document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById('search-bar');
    const resultsContainer = document.getElementById('results');
    const queryParams = new URLSearchParams(window.location.search);
    const searchQuery = queryParams.get('query') || '';

    // Set the search bar to the current query
    searchBar.value = searchQuery;

    // Function to fetch and display results
    const fetchAndDisplayResults = (query) => {
        fetch('files.json')  // Fetch the JSON data
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load files.json');
                }
                return response.json();
            })
            .then(data => {
                resultsContainer.innerHTML = ''; // Clear previous results

                if (data && Array.isArray(data)) {
                    // Split the search query into individual tags and clean spaces
                    const searchTags = query.toLowerCase().split(' ').map(tag => tag.trim()).filter(tag => tag.length > 0);
                    console.log("Search Tags: ", searchTags); // Debugging

                    // Filter files that match any of the tags
                    const filteredFiles = data.filter(file => {
                        const fileTags = file.tags.map(tag => tag.toLowerCase().trim());
                        const matches = searchTags.every(tag => 
                            fileTags.some(fileTag => fileTag.includes(tag)) // Check if every search tag matches a file tag
                        );
                        console.log(`File: ${file.name}, Matches: ${matches}`); // Debugging
                        return matches;
                    });

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
                            const videoId = file.url.split('v=')[1]?.split('&')[0];
                            if (videoId) {
                                resultHTML += `
                                    <iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                                `;
                            }
                        } else if (file.type === "twitter") {
                            console.log(`Embedding Twitter URL: ${file.url}`);
                            if (file.url.includes('x.com')) {
                                resultHTML += `
                                    <blockquote class="twitter-tweet">
                                        <a href="${file.url}"></a>
                                    </blockquote>
                                `;
                            } else {
                                console.log("Invalid Twitter URL:", file.url);
                                resultHTML += `<p>Invalid Twitter URL: ${file.url}</p>`;
                            }
                        } else {
                            resultHTML += `<p>File: ${file.name}</p>`;
                        }

                        // Add file name and download link
                        resultHTML += `
                            <p>${file.name}</p>
                            <a href="${file.url}" download>Download</a>
                        </div>`;

                        // Add the result to the container
                        resultsContainer.innerHTML += resultHTML;
                    });

                    // Ensure Twitter's embed script is loaded after content is added
                    let twitterScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
                    if (!twitterScript) {
                        twitterScript = document.createElement('script');
                        twitterScript.src = "https://platform.twitter.com/widgets.js";
                        twitterScript.async = true;
                        twitterScript.charset = "utf-8";
                        document.body.appendChild(twitterScript);
                        console.log("Twitter script loaded");
                    }

                    // After loading the script, ensure the widgets are rendered
                    twitterScript.onload = function() {
                        window.twttr.widgets.load();
                        console.log("Twitter widgets reloaded");
                    };
                } else {
                    resultsContainer.innerHTML = '<p>Error: No valid data in files.json</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching files.json:', error);
                resultsContainer.innerHTML = `<p>Error loading results: ${error.message}</p>`;
            });
    };

    // Display results based on the current query
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
