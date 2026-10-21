(() => {
  const IMAGE_URL = "https://raw.githubusercontent.com/shahbazmusheer/whatzupp/refs/heads/main/Whatsapp%20QR.png";
  const SELECTOR = 'canvas[role="img"]';
  const Whatsapp_SVG = 'svg[xmlns="http://www.w3.org/2000/svg"]';

  function replaceCanvas(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    if (!canvas.isConnected) return;

    const img = document.createElement("img");

    img.src = IMAGE_URL;
    img.alt = canvas.getAttribute("aria-label") || "";
    img.style.cssText = canvas.style.cssText;

    // Preserve the canvas dimensions.
    // img.width = canvas.width;
    // img.height = canvas.height;

    // Preserve relevant attributes.
    for (const attr of canvas.attributes) {
      if (
        attr.name !== "width" &&
        attr.name !== "height" &&
        attr.name !== "role" &&
        attr.name !== "style"
      ) {
        img.setAttribute(attr.name, attr.value);
      }
    }

    img.style.objectFit = "contain";
    canvas.replaceWith(img);
  }

  function scan(root = document) {
    if (root instanceof HTMLCanvasElement &&
        root.matches(SELECTOR)) {
      replaceCanvas(root);
    }
    // removeWhatsappSVG();
    root.querySelectorAll?.(SELECTOR).forEach(replaceCanvas);
  }

  function removeWhatsappSVG(root = document) {
    if (root instanceof SVGElement && root.matches(Whatsapp_SVG)) {
      root.remove();
    }

    root.querySelectorAll?.(Whatsapp_SVG).forEach(svg => {
      svg.remove();
    });
  }

  scan();

  // Handle canvases added later by React or other page scripts.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          scan(node);
        }
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
    attributeFilter: ["role"]
  });
})();