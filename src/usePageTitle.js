import { useEffect } from 'react';

const SITE = 'The Ranch — Reserve Your Stay';

/** Sets `document.title` per route (2.4.2 Page Titled) — this is a
    single-page app, so index.html's static <title> only ever describes
    the first paint. Every route calls this with its own page name;
    Landing calls it with `null` to fall back to the site title. No
    unmount cleanup: the next page's own call overwrites the title, so
    restoring the previous one on unmount would just flicker mid-navigation. */
export default function usePageTitle(page) {
  useEffect(() => {
    document.title = page ? page + ' — The Ranch' : SITE;
  }, [page]);
}
