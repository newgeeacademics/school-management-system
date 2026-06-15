const PORTAL_ID = 'landing-mobile-portal';

export function getLandingMobilePortal(): HTMLElement {
  let node = document.getElementById(PORTAL_ID);
  if (!node) {
    node = document.createElement('div');
    node.id = PORTAL_ID;
    document.body.appendChild(node);
  }
  return node;
}
