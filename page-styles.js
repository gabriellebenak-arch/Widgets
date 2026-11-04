/**
 * Staffbase external block: Page Styles.
 *
 * Renders nothing. Its job is to pull dashboard.css at runtime and put it in
 * document.head, standing in for the Studio Custom CSS box on environments
 * where that box will not save.
 *
 * The stylesheet is fetched rather than inlined on purpose. Staffbase caches a
 * registered block's JS hard enough that a change needs a brand new URL, which
 * made every CSS tweak a re-registration. A separate file with a timestamped
 * request sidesteps that: register this once, then only ever edit the CSS.
 *
 * Drop ONE of these on a page. Two would fight over the same <style> id.
 */
(function () {
  var STYLE_ID = "sb-page-styles";
  var CSS_URL = "https://gabriellebenak-arch.github.io/Widgets/dashboard.css";

  var ATTRS = ["extracss", "cssurl", "disabled"];

  var configurationSchema = {
    properties: {
      cssurl:   { type: "string", title: "Stylesheet URL", default: CSS_URL },
      extracss: { type: "string", title: "Extra CSS (appended, so it wins ties)", default: "" },
      disabled: { type: "string", title: "Disable (type yes to switch all styles off)", default: "" }
    }
  };

  var uiSchema = {
    extracss: { "ui:widget": "textarea", "ui:help": "For quick tweaks without a commit." },
    cssurl:   { "ui:help": "Leave as-is unless the stylesheet moves." }
  };

  var factory = function (BaseBlockClass) {
    return class PageStyles extends BaseBlockClass {
      renderBlock(container) {
        container.innerHTML = "";

        var off = (this.getAttribute("disabled") || "").trim().toLowerCase();
        var extra = this.getAttribute("extracss") || "";
        var url = (this.getAttribute("cssurl") || CSS_URL).trim();

        var tag = document.getElementById(STYLE_ID);
        if (!tag) {
          tag = document.createElement("style");
          tag.id = STYLE_ID;
        }
        // Last in head wins ties at equal specificity, so re-append on every
        // render to stay ahead of stylesheets the app loads later.
        document.head.appendChild(tag);

        if (off === "yes" || off === "true") { tag.textContent = ""; return; }

        // Timestamp defeats both the browser and any CDN in front of Pages.
        fetch(url + (url.indexOf("?") === -1 ? "?" : "&") + "t=" + Date.now(), { cache: "no-store" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (css) { tag.textContent = css + "\n" + extra; })
          .catch(function () { tag.textContent = extra; });
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
    version: "2.0.0"
  });
})();
