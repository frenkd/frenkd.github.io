document.addEventListener('DOMContentLoaded', function() {
    const recentContentContainer = document.getElementById('recent-content');
    if (!recentContentContainer) return;

    const recentContentItems = document.getElementById('recent-content-items');
    const loadingElement = document.getElementById('recent-content-loading');
    if (!recentContentItems || !loadingElement) return;

    // Get Substack URL if available
    const substackUrl = recentContentContainer.getAttribute('data-substack-url');
    
    // Collect all static content items
    const contentItems = [];
    
    // Parse and store static content items
    document.querySelectorAll('.content-item').forEach(item => {
        const dateAttr = item.getAttribute('data-date');
        if (dateAttr) {
            const date = new Date(dateAttr);
            contentItems.push({
                element: item,
                date: date,
                timestamp: date.getTime()
            });
            
            // Hide the original items, we'll reinsert them later
            item.style.display = 'none';
        }
    });
    
    // Function to display posts in order
    function displayContent(items) {
        // Sort by date (newest first)
        items.sort((a, b) => b.timestamp - a.timestamp);
        
        // Only show the 3 most recent items
        const recentItems = items.slice(0, 3);
        
        // Remove all existing content
        while (recentContentItems.firstChild) {
            recentContentItems.removeChild(recentContentItems.firstChild);
        }
        
        // Add the recent items
        recentItems.forEach(item => {
            const clone = item.element.cloneNode(true);
            clone.style.display = 'block';
            
            // Fix appearance links to use external URLs if available
            if (clone.getAttribute('data-type') === 'appearance') {
                const externalUrl = clone.getAttribute('data-url');
                if (externalUrl) {
                    const linkElement = clone.querySelector('a');
                    if (linkElement) {
                        linkElement.setAttribute('href', externalUrl);
                        linkElement.setAttribute('target', '_blank');
                    }
                }
            }
            
            recentContentItems.appendChild(clone);
        });
        
        // Add "View all" link if we have content
        if (recentItems.length > 0) {
            const viewAllContainer = document.createElement('div');
            viewAllContainer.className = 'bg-gray-50 p-5 rounded-lg shadow-sm text-center mt-2 hover:bg-gray-100 transition-colors';
            
            const viewAllLink = document.createElement('a');
            viewAllLink.href = '/publications';
            viewAllLink.className = 'text-blue-600 font-medium';
            viewAllLink.textContent = 'View all content →';
            
            viewAllContainer.appendChild(viewAllLink);
            recentContentItems.appendChild(viewAllContainer);
        }
        
        // Hide loading spinner
        loadingElement.style.display = 'none';
    }
    
    // If we have a Substack URL, fetch the blog posts
    if (substackUrl) {
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(substackUrl)}`;
        
        fetch(rss2jsonUrl)
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
                        // Create element for blog post
                        const postElement = document.createElement('div');
                        postElement.className = 'bg-white p-5 rounded-lg shadow-md content-item';
                        
                        // Date display
                        const postDate = new Date(post.pubDate);
                        const formattedDate = postDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        
                        // Content for the post
                        postElement.innerHTML = `
                            <span class="text-sm text-gray-500 block mb-1">Blog • ${formattedDate}</span>
                            <h3 class="font-semibold text-lg mb-2">${post.title}</h3>
                            <a href="${post.link}" target="_blank" class="text-blue-600 text-sm inline-block hover:underline">Read post →</a>
                        `;
                        
                        return {
                            element: postElement,
                            date: postDate,
                            timestamp: postDate.getTime()
                        };
                    });
                    
                    // Add blog posts to content items
                    contentItems.push(...blogPosts);
                }
                
                // Display all content items
                displayContent(contentItems);
            })
            .catch(error => {
                console.error('Error fetching blog posts:', error);
                // Even if blog posts fail to load, still display other content
                displayContent(contentItems);
            });
    } else {
        // No Substack URL, just display the existing content
        displayContent(contentItems);
    }
}); 