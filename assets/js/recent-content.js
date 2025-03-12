document.addEventListener('DOMContentLoaded', function() {
    const recentContentContainer = document.getElementById('recent-content');
    const recentContentItems = document.getElementById('recent-content-items');
    const loadingSpinner = document.getElementById('recent-content-loading');
    
    if (!recentContentContainer || !recentContentItems) return;
    
    // Get all static content items
    const staticContentItems = Array.from(document.querySelectorAll('.content-item'));
    const substackUrl = recentContentContainer.getAttribute('data-substack-url');
    
    // Parse the dates and store the static items with their dates
    const contentItems = staticContentItems.map(item => {
        const dateStr = item.getAttribute('data-date');
        return {
            element: item,
            date: new Date(dateStr),
            type: 'static'
        };
    });
    
    // Clone the static items before removing them
    const staticItemsClone = contentItems.map(item => ({
        element: item.element.cloneNode(true),
        date: item.date,
        type: 'static'
    }));
    
    // Clear current items
    while (recentContentItems.firstChild) {
        recentContentItems.removeChild(recentContentItems.firstChild);
    }
    
    if (substackUrl) {
        // Fetch Substack RSS feed
        const substackRssFeed = `${substackUrl}/feed`;
        
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(substackRssFeed)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    // Process blog posts
                    const blogPosts = data.items.map(post => {
                        const postDate = new Date(post.pubDate);
                        
                        // Create blog post element
                        const postElement = document.createElement('div');
                        postElement.className = 'bg-white p-4 rounded-lg shadow-md';
                        
                        const dateStr = postDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        
                        postElement.innerHTML = `
                            <span class="text-sm text-gray-500">Blog • ${dateStr}</span>
                            <h3 class="font-semibold mt-1">${post.title}</h3>
                            <a href="${post.link}" class="text-blue-600 text-sm" target="_blank">Read post →</a>
                        `;
                        
                        return {
                            element: postElement,
                            date: postDate,
                            type: 'blog'
                        };
                    });
                    
                    // Combine static and blog content
                    const allContent = [...staticItemsClone, ...blogPosts];
                    
                    // Sort by date (newest first)
                    allContent.sort((a, b) => b.date - a.date);
                    
                    // Display only the 3 most recent items
                    const recentItems = allContent.slice(0, 3);
                    
                    // Add items to the container
                    recentItems.forEach(item => {
                        recentContentItems.appendChild(item.element);
                    });
                    
                    // Add "View all" link after the content
                    const viewAllContainer = document.createElement('div');
                    viewAllContainer.className = 'text-right mt-4';
                    viewAllContainer.innerHTML = '<a href="/publications" class="text-blue-600 text-sm font-semibold">View all content →</a>';
                    recentContentItems.appendChild(viewAllContainer);
                } else {
                    // If no blog posts, just display static content
                    displayStaticContentOnly();
                }
                
                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching Substack posts:', error);
                // Fall back to static content
                displayStaticContentOnly();
                
                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            });
    } else {
        // No Substack URL provided, display static content only
        displayStaticContentOnly();
        
        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
    
    // Function to display static content only
    function displayStaticContentOnly() {
        // Sort by date (newest first)
        staticItemsClone.sort((a, b) => b.date - a.date);
        
        // Display only the 3 most recent items
        const recentStaticItems = staticItemsClone.slice(0, 3);
        
        // Add items to the container
        recentStaticItems.forEach(item => {
            recentContentItems.appendChild(item.element);
        });
        
        // Add "View all" link after the content
        const viewAllContainer = document.createElement('div');
        viewAllContainer.className = 'text-right mt-4';
        viewAllContainer.innerHTML = '<a href="/publications" class="text-blue-600 text-sm font-semibold">View all content →</a>';
        recentContentItems.appendChild(viewAllContainer);
    }
}); 