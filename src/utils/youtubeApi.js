// ═══════════════════════════════════════════════════════════════
// YOUTUBE SEARCH API (No-Auth CORS Proxy)
// Uses Piped open-source instances to fetch real-time YouTube videos
// ═══════════════════════════════════════════════════════════════

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.projectsegfau.lt',
  'https://pipedapi.syncpundit.io',
  'https://piped-api.lunar.icu'
];

/**
 * Searches for a disassembly video for the specific device
 * Returns the exact YouTube URL and Video ID
 */
export async function fetchDisassemblyVideo(deviceName) {
  if (!deviceName || deviceName === 'Unknown Device') return null;

  const query = encodeURIComponent(`${deviceName} disassembly teardown guide`);
  
  for (const instance of PIPED_INSTANCES) {
    try {
      const response = await fetch(`${instance}/search?q=${query}&filter=videos`, {
        // High timeout for proxy APIs
        signal: AbortSignal.timeout(4000)
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const firstVideo = data.items?.find(item => item.type === 'stream');
      
      if (firstVideo && firstVideo.url) {
        return {
          title: firstVideo.title,
          url: `https://youtube.com${firstVideo.url}`,
          embedUrl: `https://www.youtube.com/embed/${firstVideo.url.split('watch?v=')[1]}`,
          thumbnail: firstVideo.thumbnail,
          uploader: firstVideo.uploaderName
        };
      }
    } catch (err) {
      console.warn(`Piped instance ${instance} failed, trying next...`);
    }
  }

  // Fallback to a generic YouTube search intent if all APIs fail
  return {
    title: `Search YouTube for ${deviceName} Disassembly`,
    url: `https://www.youtube.com/results?search_query=${query}`,
    embedUrl: null,
    thumbnail: null,
    uploader: 'YouTube Search'
  };
}
