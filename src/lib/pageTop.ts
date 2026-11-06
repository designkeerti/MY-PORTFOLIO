/**
 * Where the page "starts". On iOS the sky pages have room above the hero (html.ios-top, see
 * index.html) so that Safari 26 has page to draw behind its status bar, and they rest scrolled
 * down by that much. Anything that sets or reads the scroll position as "from the top" uses
 * this instead of 0. Elsewhere it is 0.
 */
export const pageTop = () => {
  const html = document.documentElement;
  if (!html.classList.contains('ios-top')) return 0;
  return parseFloat(getComputedStyle(html).paddingTop) || 0;
};

export const isIOS = () => typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('-webkit-touch-callout', 'none');
