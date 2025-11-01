// Client-side logic to show/hide "Upcoming" badge based on actual current date
// This runs in the browser, not at build time, so it always uses the real current date

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Find all appearance elements with data-event-date attribute
    document.querySelectorAll('[data-event-date]').forEach(element => {
        const eventDateStr = element.getAttribute('data-event-date');
        if (!eventDateStr) return;
        
        // Parse the event date (expecting ISO format like "2025-06-04")
        const eventDate = new Date(eventDateStr);
        eventDate.setHours(0, 0, 0, 0);
        
        // Find the badge element
        const badge = element.querySelector('.upcoming-badge') || 
                     element.querySelector('[data-upcoming-badge]');
        
        // Check if event is in the future
        if (eventDate > today) {
            // Event is upcoming - show the badge
            if (badge) {
                badge.style.display = '';
                badge.classList.remove('hidden');
            } else {
                // Create badge if it doesn't exist (fallback)
                const badgeElement = document.createElement('span');
                badgeElement.className = 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded upcoming-badge';
                badgeElement.setAttribute('data-upcoming-badge', '');
                badgeElement.textContent = 'Upcoming';
                
                // Insert badge in the appropriate location
                const container = element.querySelector('[data-upcoming-container]') ||
                                 element.querySelector('.flex.justify-between') ||
                                 element;
                
                if (container) {
                    if (container.classList.contains('flex')) {
                        // If container is a flex container, append to it
                        container.appendChild(badgeElement);
                    } else {
                        // Otherwise, insert at the beginning
                        container.insertBefore(badgeElement, container.firstChild);
                    }
                }
            }
        } else {
            // Event is past - hide the badge
            if (badge) {
                badge.style.display = 'none';
                badge.classList.add('hidden');
            }
        }
    });
});

