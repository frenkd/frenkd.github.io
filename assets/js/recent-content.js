document.addEventListener('DOMContentLoaded', function() {
    const recentContentContainer = document.getElementById('recent-content');
    if (!recentContentContainer) return;

    const recentContentItems = document.getElementById('recent-content-items');
    const loadingElement = document.getElementById('recent-content-loading');
    if (!recentContentItems) return;

    // Get Substack URL if available
    const substackUrl = recentContentContainer.getAttribute('data-substack-url');
    
    // Get YouTube channel ID if available
    const youtubeChannelId = recentContentContainer.getAttribute('data-youtube-channel-id');
    
    // Collect all static content items (container is hidden via display:none,
    // so items are invisible until displayContent() swaps skeleton ↔ content)
    const contentItems = [];

    document.querySelectorAll('.content-item').forEach(item => {
        const dateAttr = item.getAttribute('data-date');
        if (dateAttr) {
            const date = new Date(dateAttr);
            contentItems.push({ element: item, date: date, timestamp: date.getTime() });
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
            recentContentItems.appendChild(clone);
        });
        
        // Add "View all" link if we have content
        if (recentItems.length > 0) {
            const viewAllContainer = document.createElement('div');
            viewAllContainer.className = 'view-all-row';
            
            const viewAllLink = document.createElement('a');
            viewAllLink.href = '/publications';
            viewAllLink.className = 'item-link-muted';
            viewAllLink.style.fontSize = '.8125rem';
            viewAllLink.textContent = 'View all →';
            
            viewAllContainer.appendChild(viewAllLink);
            recentContentItems.appendChild(viewAllContainer);
        }
        
        // Swap: hide skeleton, show real content
        loadingElement.style.display = 'none';
        recentContentItems.style.display = '';
    }
    
    // Counter for pending requests
    let pendingRequests = 0;
    
    // If we have a Substack URL, fetch the blog posts
    if (substackUrl) {
        pendingRequests++;
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
                        postElement.className = 'item-row content-item';
                        
                        // Date display
                        const postDate = new Date(post.pubDate);
                        const formattedDate = postDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        
                        // Content for the post
                        postElement.innerHTML = `
                            <div class="item-header">
                              <span class="item-title">${post.title}</span>
                              <span class="item-meta">${postDate.toLocaleDateString('en-US', {month:'short', year:'numeric'})}</span>
                            </div>
                            <div class="item-role">Blog</div>
                            <a href="${post.link}" target="_blank" class="item-link" style="font-size:.8125rem">Read post →</a>
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
                
                pendingRequests--;
                if (pendingRequests === 0) {
                    // Display all content items when all requests are done
                    displayContent(contentItems);
                }
            })
            .catch(error => {
                console.error('Error fetching blog posts:', error);
                pendingRequests--;
                if (pendingRequests === 0) {
                    // Display content even if there was an error
                    displayContent(contentItems);
                }
            });
    }
    
    // If we have a YouTube channel ID, fetch the videos
    if (youtubeChannelId) {
        pendingRequests++;
        const youtubeRssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`)}`;
        
        fetch(youtubeRssUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    // Process YouTube videos
                    const videos = data.items.map(video => {
                        // Create element for video
                        const videoElement = document.createElement('div');
                        videoElement.className = 'item-row content-item';
                        
                        // Date display
                        const videoDate = new Date(video.pubDate);
                        const formattedDate = videoDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        
                        // Content for the video
                        videoElement.innerHTML = `
                            <div class="item-header">
                              <span class="item-title">${video.title}</span>
                              <span class="item-meta">${videoDate.toLocaleDateString('en-US', {month:'short', year:'numeric'})}</span>
                            </div>
                            <div class="item-role">YouTube</div>
                            <a href="${video.link}" target="_blank" class="item-link" style="font-size:.8125rem">Watch video →</a>
                        `;
                        
                        return {
                            element: videoElement,
                            date: videoDate,
                            timestamp: videoDate.getTime()
                        };
                    });
                    
                    // Add videos to content items
                    contentItems.push(...videos);
                }
                
                pendingRequests--;
                if (pendingRequests === 0) {
                    // Display all content items when all requests are done
                    displayContent(contentItems);
                }
            })
            .catch(error => {
                console.error('Error fetching YouTube videos:', error);
                pendingRequests--;
                if (pendingRequests === 0) {
                    // Display content even if there was an error
                    displayContent(contentItems);
                }
            });
    }
    
    // If no external content to fetch, display the existing content
    if (pendingRequests === 0) {
        displayContent(contentItems);
    }
    
    // Helper function to slugify titles (similar to Jekyll's slugify filter)
    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')        // Replace spaces with -
            .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
            .replace(/\-\-+/g, '-')      // Replace multiple - with single -
            .replace(/^-+/, '')          // Trim - from start of text
            .replace(/-+$/, '');         // Trim - from end of text
    }
}); 