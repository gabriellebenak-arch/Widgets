/**
 * Staffbase external block: Page Styles.
 *
 * Renders nothing for employees. Its only job is to put a <style> tag into
 * document.head, which makes it a stand-in for the Studio Custom CSS box on
 * environments where that box will not save. Rules live in BASE below and are
 * edited in this file; EXTRA is a per-instance override editable in Studio.
 *
 * Drop ONE of these on a page. Two would fight over the same <style> id.
 */
(function () {
  var STYLE_ID = "sb-page-styles";

  // ──────────────────────────────────────────────────────────────────────
  // BASE — the page's stylesheet. Edit this, commit, hard-refresh.
  // ──────────────────────────────────────────────────────────────────────
  var BASE = [
    "/* --- nav: glass pill --- */",
    'header[data-c13y-region="header"]:not(#x):not(#x):not(#x){',
    "  --sb-background-nav-appintranet: transparent !important;",
    "  --sb-background-nav: transparent !important;",
    "  background-color: rgba(255,255,255,.30) !important;",
    "  background-image: linear-gradient(150deg,rgba(255,255,255,.36),rgba(255,255,255,.16)) !important;",
    "  -webkit-backdrop-filter: blur(34px) saturate(200%) !important;",
    "  backdrop-filter: blur(34px) saturate(200%) !important;",
    "  border: 1px solid rgba(255,255,255,.62) !important;",
    "  border-radius: 999px !important;",
    "  box-shadow: 0 8px 26px rgba(31,38,48,.12),",
    "              inset 0 1px 0 rgba(255,255,255,.85),",
    "              inset 0 -1px 0 rgba(255,255,255,.22) !important;",
    "}",
    'header[data-c13y-region="header"]:not(#x):not(#x) *{',
    "  color: #2b2f33 !important;",
    "  text-shadow: 0 1px 1px rgba(255,255,255,.5) !important;",
    "}",
    'header[data-c13y-region="header"]:not(#x):not(#x) svg{',
    "  fill: #2b2f33 !important; stroke: #2b2f33 !important;",
    "}",
    'header[data-c13y-region="header"]:not(#x):not(#x) :is(a,button,[role="button"]):hover{',
    "  background: rgba(255,255,255,.55) !important;",
    "  border-radius: 999px !important;",
    "}",
    '[data-testid="header-blur-overlay"]:not(#x):not(#x){ display:none !important; }'
  ].join("\n");

  var ATTRS = ["extracss", "disabled"];

  var configurationSchema = {
    properties: {
      extracss: { type: "string", title: "Extra CSS (appended after the base rules)", default: "" },
      disabled: { type: "string", title: "Disable (type yes to switch all styles off)", default: "" }
    }
  };

  var uiSchema = {
    extracss: {
      "ui:widget": "textarea",
      "ui:help": "Added after the built-in rules, so it wins ties. For quick tweaks without a code change."
    }
  };

  var factory = function (BaseBlockClass) {
    return class PageStyles extends BaseBlockClass {
      renderBlock(container) {
        var off = (this.getAttribute("disabled") || "").trim().toLowerCase();
        var extra = this.getAttribute("extracss") || "";

        var tag = document.getElementById(STYLE_ID);
        if (!tag) {
          tag = document.createElement("style");
          tag.id = STYLE_ID;
          document.head.appendChild(tag);
        }
        // Last in head wins ties at equal specificity, so re-append on every
        // render to stay ahead of stylesheets the app loads later.
        document.head.appendChild(tag);
        tag.textContent = (off === "yes" || off === "true") ? "" : BASE + "\n" + extra;

        // Invisible on the live page; a marker in Studio so the block can be
        // found and selected in the editor.
        var inStudio = location.pathname.indexOf("/studio/") !== -1;
        container.innerHTML = inStudio
          ? '<div style="font:500 12px/1.4 system-ui,sans-serif;color:#6b7178;' +
            'border:1px dashed #c3c8ce;border-radius:10px;padding:10px 12px;' +
            'background:rgba(255,255,255,.5)">' +
            "Page Styles — applies the dashboard stylesheet. Not visible to employees." +
            "</div>"
          : "";
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
    version: "1.0.0"
  });
})();
