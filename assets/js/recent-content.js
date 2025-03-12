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
        const itemType = item.getAttribute('data-type') || '';
        
        return {
            element: item,
            date: new Date(dateStr),
            type: 'static',
            contentType: itemType
        };
    });
    
    // Clone the static items before removing them
    const staticItemsClone = contentItems.map(item => {
        const clonedElement = item.element.cloneNode(true);
        
        // Fix any appearance links that might be broken
        const linkElement = clonedElement.querySelector('a');
        if (linkElement && linkElement.textContent.includes('Learn more')) {
            // Extract title from the heading element
            const titleElement = clonedElement.querySelector('h3');
            if (titleElement) {
                const title = titleElement.textContent.trim();
                // Create a slug from the title
                const slug = slugify(title);
                // Set the correct link
                linkElement.setAttribute('href', `/appearances/${slug}`);
            }
        }
        
        // For appearances, check if we need to add the upcoming tag
        if (item.contentType === 'appearance') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time part for proper comparison
            
            // If the event date is in the future, ensure it has an upcoming tag
            if (item.date > today) {
                // Check if there's already an upcoming tag
                let hasUpcomingTag = false;
                const spans = clonedElement.querySelectorAll('span');
                for (const span of spans) {
                    if (span.textContent.includes('Upcoming')) {
                        hasUpcomingTag = true;
                        break;
                    }
                }
                
                // If no upcoming tag exists, add one
                if (!hasUpcomingTag) {
                    const dateSpan = clonedElement.querySelector('span');
                    if (dateSpan) {
                        const parentDiv = dateSpan.parentNode;
                        if (!parentDiv.classList.contains('flex')) {
                            // Create a flex container for date and upcoming tag
                            const flexContainer = document.createElement('div');
                            flexContainer.className = 'flex justify-between items-start';
                            
                            // Move the date span into the container
                            dateSpan.parentNode.insertBefore(flexContainer, dateSpan);
                            flexContainer.appendChild(dateSpan);
                            
                            // Add upcoming tag
                            const upcomingTag = document.createElement('span');
                            upcomingTag.className = 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded';
                            upcomingTag.textContent = 'Upcoming';
                            flexContainer.appendChild(upcomingTag);
                        }
                    }
                }
            }
        }
        
        return {
            element: clonedElement,
            date: item.date,
            type: 'static',
            contentType: item.contentType
        };
    });
    
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
                            type: 'blog',
                            contentType: 'blog'
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
    
    // Function to convert a string to a slug (similar to Jekyll's slugify filter)
    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }
}); 