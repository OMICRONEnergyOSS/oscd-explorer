import { LitElement, html, css, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { newOpenEvent } from "@openscd/oscd-api/utils.js";

/** URL of the OpenSCD.org page listing known OpenSCD distributions. Fetched
 * at runtime so the "OpenSCD Distributions" panel never goes stale. */
const OPENSCD_GET_URL = "https://openscd.org/get.html";

/** Selector for the main documentation content on the fetched page. */
const OPENSCD_GET_CONTENT_SELECTOR = ".vp-doc";

/** localStorage key that `oscd-background-plugin-config` writes plugin
 * selections to. Its presence means the user has already customized their
 * plugin set at least once. */
const PLUGIN_STORAGE_KEY = "plugins";

/** Name given to the throw-away document opened so the user can reach the
 * plugin rail (editor plugins, incl. "Plugin Hub", only render once a
 * document is loaded). Kept deliberately explanatory. */
const STARTER_DOC_NAME = "new-project.scd";

const starterSclDocString = `<?xml version="1.0" encoding="UTF-8"?>
<SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL">
</SCL>`;

/** True once the user has changed their plugin selection at least once via
 * Plugin Hub (i.e. `oscd-background-plugin-config` has persisted something). */
function readHasCustomizations() {
  try {
    const raw = localStorage.getItem(PLUGIN_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/** Strips anything that could execute script from HTML fetched from a
 * third-party origin before it is rendered: `<script>` elements, `on*`
 * event handler attributes, and `javascript:` URLs. The source URL is a
 * fixed, org-controlled constant (not user input), but this keeps the risk
 * low even if that page were ever compromised. */
function sanitizeFragment(fragment) {
  fragment.querySelectorAll("script").forEach((node) => node.remove());
  fragment.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    });
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  return fragment;
}

export class OscdExplorerLandingPage extends LitElement {
  static properties = {
    hasCustomizations: { state: true },
    distrosStatus: { state: true },
    distrosContent: { state: true },
  };

  constructor() {
    super();
    this.hasCustomizations = false;
    this.distrosStatus = "loading";
    this.distrosContent = nothing;
  }

  connectedCallback() {
    super.connectedCallback();
    this.hasCustomizations = readHasCustomizations();
    this.loadOtherDistros();
  }

  async loadOtherDistros() {
    try {
      const response = await fetch(OPENSCD_GET_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const parsed = new DOMParser().parseFromString(text, "text/html");
      const main = parsed.querySelector(OPENSCD_GET_CONTENT_SELECTOR);
      if (!main) throw new Error("Expected content not found");
      sanitizeFragment(main);
      this.distrosContent = unsafeHTML(main.innerHTML);
      this.distrosStatus = "loaded";
    } catch (err) {
      console.warn("Could not load openscd.org/get.html:", err);
      this.distrosStatus = "error";
    }
  }

  getOscdShell() {
    return this.closest("oscd-shell");
  }

  getMenuPlugins() {
    const oscdShell = this.getOscdShell();
    if (!oscdShell) return [];
    return oscdShell.plugins.menu.filter(
      (plugin) => plugin.requireDoc !== true,
    );
  }

  handleMenuPluginClick(plugin) {
    const oscdShell = this.getOscdShell();
    const instance = oscdShell?.shadowRoot.querySelector(plugin.tagName);
    instance?.run();
  }

  handleStartExploring() {
    const doc = new DOMParser().parseFromString(
      starterSclDocString,
      "application/xml",
    );
    this.dispatchEvent(newOpenEvent(doc, STARTER_DOC_NAME));
  }

  renderDistrosPanel() {
    return html`
      <section class="panel distros-panel">
        <h2>OpenSCD Distributions</h2>
        <p class="panel-intro">
          Contributors across the OpenSCD community build and maintain their own
          curated, styled distributions &mdash; each tailored to a specific
          audience or workflow.
          <a href="${OPENSCD_GET_URL}" target="_blank" rel="noopener noreferrer"
            >Further information on openscd.org</a
          >.
        </p>
        ${this.distrosStatus === "loading"
          ? html`<p class="hint">Loading current list…</p>`
          : nothing}
        ${this.distrosStatus === "error"
          ? html`<p class="hint">
              Could not load the list right now. See it directly on
              <a
                href="${OPENSCD_GET_URL}"
                target="_blank"
                rel="noopener noreferrer"
                >openscd.org/get.html</a
              >.
            </p>`
          : nothing}
        ${this.distrosStatus === "loaded"
          ? html`<div class="fetched-content">${this.distrosContent}</div>`
          : nothing}
      </section>
    `;
  }

  renderFirstTimePanel() {
    return html`
      <p>
        Explorer is the neutral, unstyled OpenSCD distro: a space to try things
        out and assemble your own workspace, rather than a polished product in
        its own right. Vendors who build OpenSCD plugins maintain their own
        lists of plugins. Use the <strong>Plugin Hub</strong> to browse what is
        available and pick only the plugins you need &mdash; your selection is
        saved to your browser's local storage, so it is still there next time
        you visit.
      </p>
      <ol class="steps">
        <li>Start with a fresh, empty document.</li>
        <li>
          Open <strong>Plugin Hub</strong> from the plugin rail on the left.
        </li>
        <li>Toggle on the plugins you want &mdash; that's it.</li>
      </ol>
      <button class="cta" @click=${() => this.handleStartExploring()}>
        Start Exploring
      </button>
      <p class="hint">
        This opens a blank, unsaved document named
        <code>${STARTER_DOC_NAME}</code> purely so the plugin rail becomes
        available &mdash; nothing is stored or sent anywhere.
      </p>
    `;
  }

  renderReturningPanel() {
    const menuPlugins = this.getMenuPlugins();
    return html`
      <p>
        Welcome back! Your plugin selection from last time is still saved in
        this browser. Jump back in below, or open
        <strong>Plugin Hub</strong> again any time to adjust your picks.
      </p>
      <div class="quick-actions">
        ${menuPlugins.map(
          (plugin) => html`
            <button
              class="cta secondary"
              @click=${() => this.handleMenuPluginClick(plugin)}
            >
              ${plugin.name}
            </button>
          `,
        )}
        <button class="cta" @click=${() => this.handleStartExploring()}>
          Continue Customizing Plugins
        </button>
      </div>
    `;
  }

  renderMakeItYourOwnPanel() {
    return html`
      <section class="panel customize-panel">
        <h2>Make It Your Own</h2>
        ${this.hasCustomizations
          ? this.renderReturningPanel()
          : this.renderFirstTimePanel()}
      </section>
    `;
  }

  render() {
    return html`
      <div class="landing">
        <header class="banner">
          <h1>OpenSCD Explorer</h1>
          <p>
            The get-to-know-OpenSCD distro: explore the OpenSCD host, browse
            vendor plugins, and assemble your own workspace.
          </p>
        </header>
        <div class="columns">
          ${this.renderDistrosPanel()} ${this.renderMakeItYourOwnPanel()}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      background-color: var(--landing-background-color, #fff);
      color: var(--md-sys-color-on-surface, #1a1a1a);
      font-family: var(--landing-heading-font-family, "Roboto", sans-serif);
      box-sizing: border-box;
      /* Deliberately not --landing-card-radius: the shell defines that as
       * 2px for its small plugin-grid cards, which reads as square here. */
      --panel-radius: 16px;
    }

    * {
      box-sizing: border-box;
    }

    .landing {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }

    .banner {
      text-align: center;
      margin-bottom: 32px;
    }

    .banner h1 {
      color: var(--landing-heading-color, inherit);
      font-size: var(--landing-heading-size, 2.25rem);
      font-weight: var(--landing-heading-weight, 500);
      margin: 0 0 8px;
    }

    .banner p {
      color: var(--landing-subheading-color, inherit);
      font-size: var(--landing-subheading-size, 1rem);
      margin: 0;
    }

    .columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 800px) {
      .columns {
        grid-template-columns: 1fr;
      }
    }

    .panel {
      border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
      border-radius: var(--panel-radius);
      padding: 24px;
    }

    .panel h2 {
      margin-top: 0;
    }

    .panel-intro {
      opacity: 0.85;
    }

    .hint {
      font-size: 0.85rem;
      opacity: 0.75;
    }

    .steps {
      padding-left: 20px;
    }

    .steps li {
      margin-bottom: 8px;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
    }

    .cta {
      font: inherit;
      font-weight: 500;
      border: none;
      border-radius: var(--panel-radius);
      padding: 10px 20px;
      cursor: pointer;
      background: var(--md-sys-color-primary, #005ea8);
      color: var(--md-sys-color-on-primary, #fff);
    }

    .cta.secondary {
      background: transparent;
      color: var(--md-sys-color-primary, #005ea8);
      border: 1px solid var(--md-sys-color-primary, #005ea8);
    }

    .fetched-content :first-child {
      margin-top: 0;
    }

    .fetched-content ul {
      padding-left: 20px;
    }

    .fetched-content a {
      color: var(--md-sys-color-primary, #005ea8);
    }
  `;
}

customElements.define("oscd-explorer-landing-page", OscdExplorerLandingPage);
export default OscdExplorerLandingPage;
