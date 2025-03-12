document.addEventListener('DOMContentLoaded', function() {
  const substackFeedElement = document.getElementById('substack-feed');
  if (!substackFeedElement) return;
  
  const substackUrl = substackFeedElement.getAttribute('data-substack-url');
  if (!substackUrl) return;
  
  const substackRssFeed = `${substackUrl}/feed`;

  // Function to fetch and parse the RSS feed
  async function fetchSubstackPosts() {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(substackRssFeed)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ok') {
        displayPosts(data.items || []);
      } else {
        displayError('Could not load blog posts');
      }
    } catch (error) {
      displayError('Error fetching blog posts');
      console.error('Error fetching Substack feed:', error);
    }
  }

  // Function to safely extract content from description
  function getCleanDescription(description) {
    try {
      // Create a temporary div to parse HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      
      // Get text content to avoid HTML tags
      let text = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up and truncate
      text = text.trim().replace(/\s+/g, ' ');
      return text.length > 150 ? text.substring(0, 150) + '...' : text;
    } catch (e) {
      console.error('Error parsing description:', e);
      return 'Read the full post on Substack';
    }
  }

  // Function to display posts
  function displayPosts(posts) {
    const container = document.getElementById('substack-posts');
    if (!container) return;
    
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
      container.innerHTML = '<div class="bg-white p-6 rounded-lg shadow-md col-span-2"><p class="text-gray-600">No blog posts available yet. Check back soon!</p></div>';
      return;
    }

    posts.slice(0, 4).forEach(post => {
      try {
        const date = new Date(post.pubDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        const postElement = document.createElement('div');
        postElement.className = 'bg-white p-6 rounded-lg shadow-md';
        
        const cleanDescription = getCleanDescription(post.description || '');
        
        postElement.innerHTML = `
          <span class="text-sm text-gray-500">Blog • ${formattedDate}</span>
          <h3 class="text-xl font-semibold my-2">${post.title || 'Untitled Post'}</h3>
          <p class="text-gray-600 mb-4">${cleanDescription}</p>
          <a href="${post.link}" class="text-blue-600" target="_blank">Read post →</a>
        `;
        container.appendChild(postElement);
      } catch (error) {
        console.error('Error rendering post:', error, post);
      }
    });
  }

  // Function to display error
  function displayError(message) {
    const container = document.getElementById('substack-posts');
    if (!container) return;
    
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md col-span-2">
        <p class="text-gray-600">Unable to load blog posts. <a href="${substackUrl}" class="text-blue-600" target="_blank">Visit Substack</a> to see the latest content.</p>
      </div>
    `;
  }

  // Fetch the posts
  fetchSubstackPosts();
}); 