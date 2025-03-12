document.addEventListener('DOMContentLoaded', function() {
  const youtubeFeedElement = document.getElementById('youtube-feed');
  if (!youtubeFeedElement) return;
  
  const channelId = youtubeFeedElement.getAttribute('data-channel-id');
  if (!channelId) return;
  
  // Function to fetch the YouTube channel videos using the direct RSS feed
  async function fetchYouTubeVideos() {
    try {
      // Use the direct RSS feed URL for the channel
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === 'ok') {
        displayVideos(data.items || []);
      } else {
        throw new Error('Could not parse RSS feed');
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      displayError('Unable to load YouTube videos');
    }
  }

  // Function to display the videos
  function displayVideos(videos) {
    const container = document.getElementById('youtube-videos');
    if (!container) return;
    
    container.innerHTML = '';

    if (!videos || videos.length === 0) {
      container.innerHTML = '<div class="bg-white p-6 rounded-lg shadow-md col-span-2"><p class="text-gray-600">No videos available yet. Check back soon!</p></div>';
      return;
    }

    videos.slice(0, 4).forEach(video => {
      try {
        const date = new Date(video.pubDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        const videoElement = document.createElement('div');
        videoElement.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col';
        
        // Extract video ID from link
        const videoId = extractVideoId(video.link);
        
        videoElement.innerHTML = `
          <div class="relative pb-[56.25%] mb-4 rounded overflow-hidden">
            <img src="${video.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}" 
                 alt="${video.title}" 
                 class="absolute inset-0 w-full h-full object-cover" 
                 loading="lazy" />
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="w-16 h-16 text-red-600 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <a href="${video.link}" class="absolute inset-0" target="_blank" aria-label="Play video"></a>
          </div>
          <span class="text-sm text-gray-500">YouTube • ${formattedDate}</span>
          <h3 class="text-xl font-semibold my-2">${video.title || 'Untitled Video'}</h3>
          <a href="${video.link}" class="text-red-600 mt-auto" target="_blank">Watch video →</a>
        `;
        container.appendChild(videoElement);
      } catch (error) {
        console.error('Error rendering video:', error, video);
      }
    });
  }

  // Function to display error
  function displayError(message) {
    const container = document.getElementById('youtube-videos');
    if (!container) return;
    
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md col-span-2">
        <p class="text-gray-600">${message}. <a href="https://www.youtube.com/channel/${channelId}" class="text-red-600" target="_blank">Visit YouTube Channel</a> to see the latest videos.</p>
      </div>
    `;
  }

  // Helper function to extract video ID from YouTube URL
  function extractVideoId(url) {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.substring(1) || '';
      }
    } catch (e) {
      console.error('Error extracting video ID:', e);
    }
    return '';
  }

  // Fetch the videos
  fetchYouTubeVideos();
}); 