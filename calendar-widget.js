/**
 * Staffbase external block: a glass-morphism calendar.
 *
 * Plain JS on purpose — the birthday widget's TypeScript/webpack setup only
 * ever uses the SDK for types, and the one thing the host actually needs at
 * runtime is window.defineBlock. Skipping the build keeps this to a single
 * file that can be hosted anywhere and edited in place.
 */
(function () {
  var P = "sbcal";

  var DEFAULT_EVENTS = [
    "+1 | Team standup | 9:00 - 9:15 AM",
    "+3 | 1:1 with your manager | 2:00 - 2:30 PM",
    "+8 | Benefits enrollment closes | All day",
    "+14 | Company all-hands | 11:00 AM - 12:00 PM",
    "+22 | Q4 review submissions due | All day"
  ].join("\n");

  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
  var DOW = ["Mo","Tu","We","Th","Fr","Sa","Su"];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function ymd(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  /**
   * One event per line: "<when> | <title> | <time>".
   * `when` is either an absolute YYYY-MM-DD or an offset like +3 / -2 from
   * today. Offsets are what keep a demo environment from going stale: the
   * defaults stay plausible however long the page sits unopened.
   */
  function parseEvents(raw) {
    return String(raw || "").split(/[\n;]+/).map(function (line) {
      var bits = line.split("|").map(function (s) { return s.trim(); });
      if (!bits[0] || !bits[1]) return null;
      var key;
      if (/^[+-]?\d+$/.test(bits[0])) {
        var d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + parseInt(bits[0], 10));
        key = ymd(d);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(bits[0])) {
        key = bits[0];
      } else {
        return null;
      }
      return { date: key, title: bits[1], time: bits[2] || "" };
    }).filter(Boolean).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }

  function prettyDay(key) {
    var p = key.split("-");
    return { d: parseInt(p[2], 10), mon: MONTHS[parseInt(p[1], 10) - 1].slice(0, 3) };
  }

  var CSS = [
    "." + P + "-root{--rim:rgba(255,255,255,.62);--ink:#2b2f33;--mute:#767c84;",
    "--line:rgba(120,128,138,.18);font-family:inherit;color:var(--ink);",
    "display:grid;grid-template-columns:1.25fr 1fr;gap:16px;padding:16px;border-radius:20px;",
    "background:linear-gradient(150deg,rgba(255,255,255,.36),rgba(255,255,255,.17));"
    + "-webkit-backdrop-filter:blur(34px) saturate(200%);",
    "backdrop-filter:blur(34px) saturate(200%);border:1px solid var(--rim);"
    + "text-shadow:0 1px 1px rgba(255,255,255,.5);",
    "box-shadow:0 8px 26px rgba(31,38,48,.10),inset 0 1px 0 rgba(255,255,255,.8),"
    + "inset 0 -1px 0 rgba(255,255,255,.22)}",
    "." + P + "-root *{box-sizing:border-box}",
    "." + P + "-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}",
    "." + P + "-mo{font-size:14px;font-weight:650;letter-spacing:.01em}",
    "." + P + "-nav{display:flex;gap:6px}",
    "." + P + "-nav button{width:26px;height:26px;border-radius:8px;border:1px solid var(--line);",
    "background:rgba(255,255,255,.45);color:var(--mute);font-size:13px;line-height:1;cursor:pointer;",
    "transition:background .15s,color .15s}",
    "." + P + "-nav button:hover{background:#fff;color:var(--ink)}",
    "." + P + "-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}",
    "." + P + "-dow{font-size:11px;font-weight:600;color:var(--mute);text-align:center;",
    "padding:1px 0 3px;letter-spacing:.04em;text-transform:uppercase}",
    "." + P + "-d{aspect-ratio:1/.68;display:flex;align-items:center;justify-content:center;",
    "font-size:12px;border-radius:9px;position:relative;border:0;background:transparent;",
    "color:inherit;font-family:inherit;cursor:pointer;transition:background .15s}",
    "." + P + "-d:hover{background:rgba(255,255,255,.6)}",
    "." + P + "-d.pad{visibility:hidden;cursor:default}",
    "." + P + "-d.ev::after{content:'';position:absolute;bottom:5px;width:4px;height:4px;",
    "border-radius:50%;background:var(--accent)}",
    "." + P + "-d.today{background:var(--accent);color:#fff;font-weight:650}",
    "." + P + "-d.today::after{background:#fff}",
    "." + P + "-d.sel{box-shadow:inset 0 0 0 2px var(--accent)}",
    "." + P + "-side{border-left:1px solid var(--line);padding-left:16px;min-width:0}",
    "." + P + "-sh{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 8px}",
    "." + P + "-sh h3{margin:0;font-size:14px;font-weight:650}",
    "." + P + "-back{border:0;background:transparent;padding:0;font-family:inherit;",
    "font-size:12px;color:var(--accent);cursor:pointer}",
    "." + P + "-ev{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)}",
    "." + P + "-ev:last-child{border-bottom:0}",
    "." + P + "-dt{flex:none;width:38px;text-align:center;border-radius:9px;padding:4px 0;",
    "background:rgba(255,255,255,.5);border:1px solid var(--line)}",
    "." + P + "-dt b{display:block;font-size:14px;line-height:1.1;font-weight:650}",
    "." + P + "-dt span{font-size:10px;color:var(--mute);text-transform:uppercase;letter-spacing:.05em}",
    "." + P + "-tx{min-width:0}",
    "." + P + "-tx b{display:block;font-size:13px;font-weight:600;line-height:1.3}",
    "." + P + "-tx span{font-size:12px;color:var(--mute)}",
    "." + P + "-empty{font-size:13px;color:var(--mute);margin:10px 0 0}",
    "@media(max-width:720px){." + P + "-root{grid-template-columns:1fr;padding:16px}",
    "." + P + "-side{border-left:0;border-top:1px solid var(--line);padding-left:0;padding-top:14px}}"
  ].join("");

  // Page-level rules, shipped from here because this block is the one thing
  // that reliably executes on the live page. A <style> element styles the whole
  // document wherever it sits, so these reach the nav from inside the widget.
  var PAGE_CSS = [
    "*:not(#q):not(#q){",
    "--sb-background-menubar-intranet:#ffffff !important;",
    "--sb-text-menubar-intranet:#2b2f33 !important;",
    "--sb-background-menubar-intranet-hover:#eef1f6 !important;",
    "--sb-text-menubar-intranet-hover:#11151a !important;",
    "--sb-background-menubar-intranet-accent:#e8ecf8 !important;",
    "--sb-text-menubar-intranet-pressed:#11151a !important;}",
    "a.item:not(#q):not(#q):not(#q),",
    "a.item:not(#q):not(#q):not(#q) span,",
    "a.item:not(#q):not(#q):not(#q) svg{",
    "color:#2b2f33 !important;fill:#2b2f33 !important;}"
  ].join("");

  var ATTRS = ["widgettitle", "events", "accent"];

  var configurationSchema = {
    properties: {
      widgettitle: { type: "string", title: "Side panel heading", default: "Up next" },
      accent:      { type: "string", title: "Accent colour (hex)", default: "#2d6cdf" },
      events:      { type: "string", title: "Events", default: DEFAULT_EVENTS }
    }
  };

  var uiSchema = {
    events: {
      "ui:widget": "textarea",
      "ui:help": "One per line:  when | title | time.  'when' is a date (2026-11-17) or an offset from today (+3)."
    },
    accent: { "ui:help": "Used for today's highlight and the event dots." }
  };

  var factory = function (BaseBlockClass) {
    return class CalendarWidget extends BaseBlockClass {
      renderBlock(container) {
        var now = new Date();
        this._today = ymd(now);
        if (this._vy == null) { this._vy = now.getFullYear(); this._vm = now.getMonth(); }
        this._events = parseEvents(this.getAttribute("events") || DEFAULT_EVENTS);
        this._accent = this.getAttribute("accent") || "#2d6cdf";
        this._title = this.getAttribute("widgettitle") || "Up next";
        this._container = container;
        this._draw();
      }

      _draw() {
        var self = this, y = this._vy, m = this._vm;
        // Monday-first: JS weeks start on Sunday, so rotate by one.
        var lead = (new Date(y, m, 1).getDay() + 6) % 7;
        var dim = new Date(y, m + 1, 0).getDate();

        var withEvents = {};
        this._events.forEach(function (e) { withEvents[e.date] = true; });

        var cells = "";
        for (var i = 0; i < lead; i++) cells += '<button class="' + P + '-d pad" disabled></button>';
        for (var d = 1; d <= dim; d++) {
          var key = ymd(new Date(y, m, d));
          var cls = P + "-d";
          if (key === this._today) cls += " today";
          if (withEvents[key]) cls += " ev";
          if (key === this._sel) cls += " sel";
          cells += '<button type="button" class="' + cls + '" data-k="' + key + '">' + d + "</button>";
        }

        var list, heading, back = "";
        if (this._sel) {
          list = this._events.filter(function (e) { return e.date === self._sel; });
          var pd = prettyDay(this._sel);
          heading = pd.mon + " " + pd.d;
          back = '<button type="button" class="' + P + '-back">Up next</button>';
        } else {
          list = this._events.filter(function (e) { return e.date >= self._today; }).slice(0, 5);
          heading = this._title;
        }

        var items = list.length ? list.map(function (e) {
          var pd = prettyDay(e.date);
          return '<div class="' + P + '-ev"><div class="' + P + '-dt"><b>' + pd.d +
            "</b><span>" + pd.mon + '</span></div><div class="' + P + '-tx"><b>' +
            esc(e.title) + "</b>" + (e.time ? "<span>" + esc(e.time) + "</span>" : "") + "</div></div>";
        }).join("") : '<p class="' + P + '-empty">Nothing scheduled.</p>';

        this._container.innerHTML = "<style>" + PAGE_CSS + CSS + "</style>" +
          '<div class="' + P + '-root" style="--accent:' + esc(this._accent) + '">' +
            "<div>" +
              '<div class="' + P + '-hd"><div class="' + P + '-mo">' + MONTHS[m] + " " + y + "</div>" +
                '<div class="' + P + '-nav">' +
                  '<button type="button" data-step="-1" aria-label="Previous month">&#8249;</button>' +
                  '<button type="button" data-step="1" aria-label="Next month">&#8250;</button>' +
                "</div></div>" +
              '<div class="' + P + '-grid">' + DOW.map(function (w) {
                return '<div class="' + P + '-dow">' + w + "</div>";
              }).join("") + "</div>" +
              '<div class="' + P + '-grid" style="margin-top:3px">' + cells + "</div>" +
            "</div>" +
            '<div class="' + P + '-side"><div class="' + P + '-sh"><h3>' + esc(heading) + "</h3>" +
              back + "</div>" + items + "</div>" +
          "</div>";

        this._container.querySelectorAll("[data-step]").forEach(function (b) {
          b.addEventListener("click", function () {
            self._vm += parseInt(b.getAttribute("data-step"), 10);
            if (self._vm < 0) { self._vm = 11; self._vy--; }
            if (self._vm > 11) { self._vm = 0; self._vy++; }
            self._draw();
          });
        });
        this._container.querySelectorAll("[data-k]").forEach(function (b) {
          b.addEventListener("click", function () {
            var k = b.getAttribute("data-k");
            self._sel = (self._sel === k) ? null : k;
            self._draw();
          });
        });
        var backBtn = this._container.querySelector("." + P + "-back");
        if (backBtn) backBtn.addEventListener("click", function () { self._sel = null; self._draw(); });
      }

      static get observedAttributes() { return ATTRS; }
    };
  };

  window.defineBlock({
    blockDefinition: {
      name: "calendar-widget",
      label: "Calendar",
      attributes: ATTRS,
      factory: factory,
      configurationSchema: configurationSchema,
      uiSchema: uiSchema,
      blockLevel: "block",
      iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%232d6cdf'/%3E%3Cg fill='%23fff'%3E%3Crect x='8' y='11' width='24' height='21' rx='3'/%3E%3C/g%3E%3Cg fill='%232d6cdf'%3E%3Crect x='8' y='11' width='24' height='6' rx='3'/%3E%3Crect x='12' y='21' width='4' height='4' rx='1'/%3E%3Crect x='18' y='21' width='4' height='4' rx='1'/%3E%3Crect x='24' y='21' width='4' height='4' rx='1'/%3E%3C/g%3E%3Cg fill='%23fff'%3E%3Crect x='13' y='7' width='2' height='6' rx='1'/%3E%3Crect x='25' y='7' width='2' height='6' rx='1'/%3E%3C/g%3E%3C/svg%3E"
    },
    author: "Staffbase",
    version: "1.0.0"
  });
})();
