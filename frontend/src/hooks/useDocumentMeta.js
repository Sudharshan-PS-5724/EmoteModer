import { useEffect } from 'react';

const pageMeta = {
  '/': { title: 'EmoteModer - Feel it, make it.', description: 'A softer social space for moodboards, live community rooms, and everyday reflection.' },
  '/login': { title: 'Sign in | EmoteModer', description: 'Sign in to make moodboards, join community rooms, and keep your space personal.' },
  '/demo': { title: 'Try the demo | EmoteModer', description: 'Explore EmoteModer with a guided, static demo. Nothing is saved.' },
  '/gallery': { title: 'Public gallery | EmoteModer', description: 'Explore public moodboards shared by the EmoteModer community.' },
  '/dashboard': { title: 'Your moodboards | EmoteModer', description: 'Collect colours, notes, and moments that describe your day.' },
  '/chat': { title: 'Mood rooms | EmoteModer', description: 'Join a live community room and share what is on your mind.' },
  '/profile': { title: 'Your profile | EmoteModer', description: 'View your EmoteModer profile and personal space.' }
};

function updateMeta(selector, content) {
  document.querySelector(selector)?.setAttribute('content', content);
}

// One route-aware source prevents stale browser titles and share descriptions in this SPA.
export function useDocumentMeta(pathname) {
  useEffect(() => {
    const meta = pageMeta[pathname] || pageMeta['/'];
    document.title = meta.title;
    updateMeta('meta[name="description"]', meta.description);
    updateMeta('meta[property="og:title"]', meta.title);
    updateMeta('meta[property="og:description"]', meta.description);
    updateMeta('meta[name="twitter:title"]', meta.title);
    updateMeta('meta[name="twitter:description"]', meta.description);
  }, [pathname]);
}
