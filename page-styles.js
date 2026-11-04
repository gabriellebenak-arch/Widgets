/**
 * Staffbase external block: Page Styles.
 *
 * Renders nothing. Puts a <style> tag into document.head, standing in for the
 * Studio Custom CSS box on environments where that box will not save.
 *
 * The CSS is inline rather than fetched: the page's content security policy
 * blocks a cross-origin fetch even though it allows the script itself to load
 * from the same host. The cost is that changing BASE needs a fresh ?v= on the
 * registered URL, so day-to-day tweaks belong in the Extra CSS field instead —
 * that one is editable in Studio and takes effect immediately.
 *
 * Drop ONE of these on a page. Two would fight over the same <style> id.
 */
(function () {
  var STYLE_ID = "sb-page-styles";

  var BASE = "/* ===================================================================\n   Dashboard stylesheet — gabdashboarddraft\n   Loaded at runtime by the Page Styles block. Edit this file, commit,\n   hard-refresh. No re-registering, no cache busting: the block appends\n   a timestamp to the request.\n   =================================================================== */\n\n/* --- nav: glass pill -----------------------------------------------\n   The menubar paints itself from Tailwind tokens in the\n   \"menubar-intranet\" namespace, so overriding `background` on the\n   element loses — the utility class just re-reads the variable.\n   Override the variables instead and every consumer follows.          */\n:root:not(#x):not(#x) {\n  --sb-background-menubar-intranet: rgba(255,255,255,0.28) !important;\n  --sb-background-menubar-intranet-hover: rgba(255,255,255,0.55) !important;\n  --sb-background-menubar-intranet-accent: rgba(255,255,255,0.78) !important;\n  --sb-background-menubar-intranet-pressed: rgba(255,255,255,0.78) !important;\n  --sb-text-menubar-intranet: #2b2f33 !important;\n  --sb-text-menubar-intranet-hover: #11151a !important;\n  --sb-text-menubar-intranet-pressed: #11151a !important;\n}\n\n/* The pill itself is whatever element directly wraps the item list.\n   Selecting it by its child avoids depending on hashed class names. */\n:is(div, nav, header):has(> ul.mx-2.flex.h-full.w-fit.items-center):not(#x):not(#x) {\n  background-color: rgba(255,255,255,0.28) !important;\n  background-image: linear-gradient(150deg, rgba(255,255,255,0.36), rgba(255,255,255,0.16)) !important;\n  -webkit-backdrop-filter: blur(34px) saturate(200%) !important;\n  backdrop-filter: blur(34px) saturate(200%) !important;\n  border: 1px solid rgba(255,255,255,0.62) !important;\n  border-radius: 999px !important;\n  box-shadow: 0 8px 26px rgba(31,38,48,0.12),\n              inset 0 1px 0 rgba(255,255,255,0.85),\n              inset 0 -1px 0 rgba(255,255,255,0.22) !important;\n}\n\n/* Items: dark text with a soft lift so they stay legible on glass. */\nul.mx-2.flex.h-full.w-fit.items-center:not(#x) a.item,\nul.mx-2.flex.h-full.w-fit.items-center:not(#x) a.item span,\nul.mx-2.flex.h-full.w-fit.items-center:not(#x) a.item svg {\n  color: #2b2f33 !important;\n  fill: currentColor !important;\n  text-shadow: 0 1px 1px rgba(255,255,255,0.5) !important;\n}\nul.mx-2.flex.h-full.w-fit.items-center:not(#x) a.item:hover,\nul.mx-2.flex.h-full.w-fit.items-center:not(#x) a.item:hover span {\n  color: #11151a !important;\n  background-color: rgba(255,255,255,0.55) !important;\n}\n";

  var ATTRS = ["extracss", "disabled"];

  var configurationSchema = {
    properties: {
      extracss: { type: "string", title: "Extra CSS (appended, so it wins ties)", default: "" },
      disabled: { type: "string", title: "Disable (type yes to switch all styles off)", default: "" }
    }
  };

  var uiSchema = {
    extracss: {
      "ui:widget": "textarea",
      "ui:help": "Applied after the built-in rules. Edit here for quick changes without a commit."
    }
  };

  var factory = function (BaseBlockClass) {
    return class PageStyles extends BaseBlockClass {
      renderBlock(container) {
        container.innerHTML = "";

        var off = (this.getAttribute("disabled") || "").trim().toLowerCase();
        var extra = this.getAttribute("extracss") || "";

        var css = (off === "yes" || off === "true") ? "" : BASE + "\n" + extra;

        // Staffbase may render a custom block inside an iframe, in which case
        // this document is the frame's and styling the page needs the top
        // one. Same-origin frames allow that; a sandboxed one throws, so try
        // both and keep whichever lands.
        var docs = [document];
        try {
          if (window.top && window.top.document && window.top.document !== document) {
            docs.push(window.top.document);
          }
        } catch (e) { /* cross-origin: the local document is all we get */ }
        try {
          if (window.parent && window.parent.document &&
              docs.indexOf(window.parent.document) === -1) {
            docs.push(window.parent.document);
          }
        } catch (e) { /* same */ }

        for (var i = 0; i < docs.length; i++) {
          try {
            var d = docs[i];
            var tag = d.getElementById(STYLE_ID);
            if (!tag) { tag = d.createElement("style"); tag.id = STYLE_ID; }
            // Last in head wins ties at equal specificity, so re-append every
            // render to stay ahead of stylesheets the app loads later.
            d.head.appendChild(tag);
            tag.textContent = css;
          } catch (e) { /* unreachable document, try the next */ }
        }
      }

      static get observedAttributes() { return ATTRS; }
    };
  };

  window.defineBlock({
    blockDefinition: {
      name: "page-styles",
      label: "Page Styles",
      attributes: ATTRS,
      factory: factory,
      configurationSchema: configurationSchema,
      uiSchema: uiSchema,
      blockLevel: "block",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%236b7178'/%3E%3Cg fill='%23fff'%3E%3Cpath d='M12 11h16v3H12zM12 18h16v3H12zM12 25h10v3H12z'/%3E%3C/g%3E%3C/svg%3E"
    },
    author: "Staffbase",
    version: "5.0.0"
  });
})();
