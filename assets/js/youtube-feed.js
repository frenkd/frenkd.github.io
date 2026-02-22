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
      container.innerHTML = '<p style="color:var(--text-faint);font-size:.875rem">No videos available yet.</p>';
      return;
    }

    videos.slice(0, 4).forEach(video => {
      try {
        const date = new Date(video.pubDate);
        const shortDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const videoId = extractVideoId(video.link);
        const thumbUrl = videoId
          ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
          : (video.thumbnail || '');

        const videoElement = document.createElement('div');
        videoElement.className = 'item-row item-row-media';

        videoElement.innerHTML = `
          <a href="${video.link}" target="_blank" rel="noopener" class="item-thumb-wrap" tabindex="-1" aria-hidden="true">
            <img
              class="item-thumb"
              src="${thumbUrl}"
              alt=""
              width="96"
              height="54"
              loading="lazy"
              decoding="async"
              onload="this.setAttribute('data-loaded','1')"
            >
          </a>
          <div class="item-thumb-body">
            <div class="item-header">
              <span class="item-title">${video.title || 'Untitled Video'}</span>
              <span class="item-meta">${shortDate}</span>
            </div>
            <a href="${video.link}" class="item-link" style="font-size:.8125rem" target="_blank">Watch video →</a>
          </div>
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
    
    container.innerHTML = `<p style="color:var(--text-faint);font-size:.875rem">${message}. <a href="https://www.youtube.com/channel/${channelId}" style="color:var(--accent)" target="_blank">Visit YouTube ↗</a></p>`;
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