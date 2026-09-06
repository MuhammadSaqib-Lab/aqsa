/**
 * Anchor links (e.g. "#about") only resolve within the current page, but
 * several layout components (Navbar, MobileMenu, Footer) are shared across
 * multiple routes ("/" and "/gallery"). Prefixing with "/" makes them always
 * resolve to the home page's sections regardless of which route is
 * currently active. Real route paths (e.g. "/gallery") pass through
 * unchanged — use react-router's <Link> for those instead of a plain <a>.
 */
export function resolveNavHref(href: string): string {
  return href.startsWith("#") ? `/${href}` : href;
}
