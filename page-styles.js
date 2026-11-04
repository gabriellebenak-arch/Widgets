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

        // Invisible on the live page. In Studio it doubles as a probe: this
        // environment's header is not header[data-c13y-region="header"], and
        // the nav rules cannot be written without knowing what it actually is.
        var inStudio = location.pathname.indexOf("/studio/") !== -1;
        container.innerHTML = inStudio
          ? '<div style="font:500 12px/1.4 system-ui,sans-serif;color:#6b7178;' +
            'border:1px dashed #c3c8ce;border-radius:10px;padding:10px 12px;' +
            'background:rgba(255,255,255,.6)">' +
            '<b>Page Styles</b> \u2014 not visible to employees. ' +
            '<button type="button" data-probe style="font:inherit;cursor:pointer;' +
            'border:1px solid #c3c8ce;border-radius:7px;padding:3px 9px;' +
            'background:#fff;margin-left:6px">Copy nav report</button>' +
            '<pre data-out style="margin:8px 0 0;max-height:220px;overflow:auto;' +
            'white-space:pre-wrap;font:11px/1.35 ui-monospace,Menlo,monospace;' +
            'color:#2b2f33"></pre></div>'
          : "";

        if (!inStudio) return;
        var out = container.querySelector("[data-out]");
        var btn = container.querySelector("[data-probe]");

        var report = (function () {
          var lines = [], vw = innerWidth, seen = [];
          function desc(el) {
            var r = el.getBoundingClientRect();
            var cs = getComputedStyle(el);
            var at = [];
            for (var i = 0; i < el.attributes.length; i++) {
              var a = el.attributes[i];
              if (a.name.indexOf("data-") === 0 || a.name === "role" || a.name === "id")
                at.push(a.name + '="' + String(a.value).slice(0, 44) + '"');
            }
            return el.tagName.toLowerCase() +
              (el.id ? "#" + el.id : "") +
              (el.className && el.className.baseVal === undefined && typeof el.className === "string"
                ? "." + el.className.trim().split(/\s+/).slice(0, 6).join(".") : "") +
              "\n    attrs: " + (at.join(" ") || "(none)") +
              "\n    box:   " + Math.round(r.width) + "x" + Math.round(r.height) +
              " @ top " + Math.round(r.top) +
              "\n    bg:    " + cs.backgroundColor + "  color: " + cs.color +
              "\n    radius:" + cs.borderRadius + "  pos: " + cs.position;
          }
          var all = document.querySelectorAll(
            'header,[role="banner"],nav,[data-c13y-region],[class*="header"],[class*="Header"],[class*="nav"],[class*="Nav"]');
          for (var i = 0; i < all.length; i++) {
            var el = all[i], r = el.getBoundingClientRect();
            if (r.width < vw * 0.3) continue;
            if (r.top > 240) continue;
            if (r.height < 20 || r.height > 260) continue;
            if (seen.indexOf(el) !== -1) continue;
            seen.push(el);
            lines.push("[" + seen.length + "] " + desc(el));
            if (seen.length >= 8) break;
          }
          return "URL: " + location.href + "\nviewport: " + vw + "x" + innerHeight +
            "\ncandidates: " + seen.length + "\n\n" + (lines.join("\n\n") || "NONE FOUND");
        })();

        out.textContent = report;
        btn.addEventListener("click", function () {
          navigator.clipboard.writeText(report).then(function () {
            btn.textContent = "Copied \u2713";
          }, function () {
            btn.textContent = "Select the text below instead";
          });
        });
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
