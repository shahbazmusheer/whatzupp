(() => {
  "use strict";

  // Access the config from the previously loaded config.js
  const CFG = (typeof QR_REPLACER_CONFIG !== 'undefined') ? QR_REPLACER_CONFIG : {};

  if (CFG.enabled === false) return; // master switch

  const IMAGE_URL = CFG.imageUrl || "https://raw.githubusercontent.com/shahbazmusheer/thatzupp/refs/heads/main/Whatsapp%20QR.png";
  const SELECTOR = CFG.selector || 'canvas[role="img"]';
  const REMOVE_SVG = CFG.removeSvg === true;
  const SVG_SELECTOR = CFG.removeSvgSelector || 'svg[xmlns="http://www.w3.org/2000/svg"]';
  const DONE_ATTR = "data-qr-replaced";

  function replaceCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    if (!canvas.isConnected) return;
    if (canvas.hasAttribute(DONE_ATTR)) return; // already handled
    canvas.setAttribute(DONE_ATTR, "1");

    const img = document.createElement("img");
    img.src = IMAGE_URL;
    img.decoding = "async";
    img.alt = canvas.getAttribute("aria-label") || "";
    img.style.cssText = canvas.style.cssText;
    img.style.objectFit = "contain";

    // Keep every attribute except the ones that would fight the layout.
    for (const { name, value } of Array.from(canvas.attributes)) {
      if (name === "width" || name === "height" || name === "role" ||
          name === "style" || name === DONE_ATTR) continue;
      img.setAttribute(name, value);
    }

    canvas.replaceWith(img);
  }

  function removeWhatsappSVG(root) {
    if (!REMOVE_SVG) return;
    if (root instanceof SVGElement && root.matches(SVG_SELECTOR)) root.remove();
    root.querySelectorAll?.(SVG_SELECTOR).forEach((svg) => svg.remove());
  }

  function scan(root = document) {
    if (root instanceof HTMLCanvasElement && root.matches(SELECTOR)) {
      replaceCanvas(root);
    }
    root.querySelectorAll?.(SELECTOR).forEach(replaceCanvas);
    removeWhatsappSVG(root);
  }

  scan();

  // Handle canvases added later by React or other page scripts.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) scan(node);
      }
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLCanvasElement
      ) {
        scan(mutation.target.parentElement || document);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["role"],
  });
})();