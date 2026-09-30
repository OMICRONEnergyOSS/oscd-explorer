import { i, A, b, a as i$1 } from './lit-element-C5J-QgzB.js';

function newOpenEvent(doc, docName) {
    return new CustomEvent('oscd-open', {
        bubbles: true,
        composed: true,
        detail: { doc, docName },
    });
}

/** Local, static list of known OpenSCD distributions. Curated by hand for
 * now; a future `oscd-registry` package is expected to host this file so it
 * can be fetched from a shared location instead of duplicated per distro. */
const DISTROS_JSON_URL = "./distros.json";

/** OpenSCD project site: the canonical, up-to-date list of distributions
 * lives here in case this static copy falls behind. */
const OPENSCD_GET_URL = "https://openscd.org/get.html";

const FURTHER_INFO_LINKS = [
  { name: "OpenSCD.org", url: "https://openscd.org" },
  {
    name: "oscd-explorer on GitHub",
    url: "https://github.com/OMICRONEnergyOSS/oscd-explorer",
  },
  {
    name: "Release notes",
    url: "https://github.com/OMICRONEnergyOSS/oscd-explorer/releases",
  },
];

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

class OscdExplorerLandingPage extends i {
  static properties = {
    hasCustomizations: { state: true },
    distrosStatus: { state: true },
    distros: { state: true },
  };

  constructor() {
    super();
    this.hasCustomizations = false;
    this.distrosStatus = "loading";
    this.distros = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.hasCustomizations = readHasCustomizations();
    this.loadDistros();
  }

  /** Loads the static, hand-curated distros list shipped alongside this
   * plugin. Expected to be replaced by a fetch against a shared
   * `oscd-registry` package once that exists (see DISTROS_JSON_URL). */
  async loadDistros() {
    try {
      const response = await fetch(new URL(DISTROS_JSON_URL, import.meta.url));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.distros = await response.json();
      this.distrosStatus = "loaded";
    } catch (err) {
      console.warn(`Could not load ${DISTROS_JSON_URL}:`, err);
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
    return b`
      <section class="panel distros-panel">
        <div class="panel-heading">
          <span class="panel-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 4 43 14v20L24 44 5 34V14L24 4Z M5 14l19 11 19-11M24 25v19" />
            </svg>
          </span>
          <div>
            <h2>Distributions</h2>
            <p class="panel-intro">Choose a distribution that fits your workflow.</p>
          </div>
        </div>
        ${this.distrosStatus === "loading"
          ? b`<p class="hint">Loading…</p>`
          : A}
        ${this.distrosStatus === "error"
          ? b`<p class="hint">
              Could not load the list right now. See it directly on
              <a
                href="${OPENSCD_GET_URL}"
                target="_blank"
                rel="noopener noreferrer"
                >openscd.org/get.html</a
              >.
            </p>`
          : A}
        ${this.distrosStatus === "loaded"
          ? b`<ul class="link-list">
              ${this.distros.map(
                (distro) => b`
                  <li>
                    <a
                      href="${distro.url}"
                      target="_blank"
                      rel="noopener noreferrer"
                      >${distro.name} →</a
                    >
                  </li>
                `,
              )}
            </ul>`
          : A}
        <svg class="panel-art" viewBox="0 0 160 160" fill="none" aria-hidden="true">
          <path d="M80 5 150 45v75L80 155 10 120V45L80 5Z M10 45l70 42 70-42M80 87v68" />
        </svg>
      </section>
    `;
  }

  static renderFurtherInfoPanel() {
    return b`
      <section class="panel further-info-panel">
        <div class="panel-heading">
          <span class="panel-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M12 4h19l9 9v31H12V4Z M31 4v10h9M19 23h15M19 30h15M19 37h10" />
            </svg>
          </span>
          <div>
            <h2>Further info</h2>
            <p class="panel-intro">Explore related tools and resources.</p>
          </div>
        </div>
        <ul class="link-list">
          ${FURTHER_INFO_LINKS.map(
            (link) => b`
              <li>
                <a href="${link.url}" target="_blank" rel="noopener noreferrer"
                  >${link.name} →</a
                >
              </li>
            `,
          )}
        </ul>
        <svg class="panel-art" viewBox="0 0 160 160" fill="none" aria-hidden="true">
          <path d="M32 4h76l32 32v120H32V4Z M108 4v33h32M51 67h70M51 88h70M51 109h47" />
        </svg>
      </section>
    `;
  }

  renderFirstTimeActions() {
    return b`
      <div class="quick-actions">
        <button class="cta" @click=${() => this.handleStartExploring()}>
          Start exploring
        </button>
        ${this.renderOpenFileAction()}
      </div>
      <p class="hint">
        This opens a blank, unsaved document named
        <code>${STARTER_DOC_NAME}</code> so you can reach the Plugin Hub.
        Your plugin selection is saved in this browser.
      </p>
    `;
  }

  renderOpenFileAction() {
    const openFilePlugin = this.getMenuPlugins().find(
      (plugin) => plugin.tagName === "oscd-menu-open",
    );
    return openFilePlugin
      ? b`<button
          class="cta secondary"
          @click=${() => this.handleMenuPluginClick(openFilePlugin)}
        >
          Open an existing project
        </button>`
      : A;
  }

  renderReturningActions() {
    const menuPlugins = this.getMenuPlugins();
    return b`
      <div class="quick-actions">
        ${menuPlugins.map(
          (plugin) => b`
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
      <p class="hint">Your plugin selection is saved in this browser.</p>
    `;
  }

  renderGettingStartedSection() {
    return b`
      <section class="getting-started">
        <h2>Getting started</h2>
        <p class="section-intro">
          No distribution quite fits? Set up your own workspace in a few simple steps.
        </p>
        <ol class="steps">
          <li>
            <span class="step-number" aria-hidden="true">1</span>
            <div>
              <h3>Start exploring</h3>
              <p>Get familiar with the interface and try the built-in plugins.</p>
            </div>
          </li>
          <li>
            <span class="step-number" aria-hidden="true">2</span>
            <div>
              <h3>Add plugins</h3>
              <p>Use the Plugin Hub to choose tools that match your workflow.</p>
            </div>
          </li>
          <li>
            <span class="step-number" aria-hidden="true">3</span>
            <div>
              <h3>Open an existing project</h3>
              <p>Open an SCL file to start viewing, editing and validating your data.</p>
            </div>
          </li>
        </ol>
        ${this.hasCustomizations
          ? this.renderReturningActions()
          : this.renderFirstTimeActions()}
      </section>
    `;
  }

  render() {
    return b`
      <div class="landing">
        <header class="banner">
          <h1>Welcome to OpenSCD <span>Explorer</span></h1>
          <p class="tagline">Explore OpenSCD and build your workspace.</p>
          <p>
            OpenSCD Explorer is an IEC 61850 SCL editor and workspace built from
            configurable plugins. It helps you view, edit and validate SCL files,
            and extend your environment with the tools you need.
          </p>
        </header>
        <div class="columns">
          ${this.renderDistrosPanel()} ${OscdExplorerLandingPage.renderFurtherInfoPanel()}
        </div>
        ${this.renderGettingStartedSection()}
      </div>
    `;
  }

  static styles = i$1`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      background-color: var(--landing-background-color, #fbf4e2);
      color: var(--md-sys-color-on-surface, #1a1a1a);
      font-family: var(--landing-heading-font-family, "Roboto", sans-serif);
      box-sizing: border-box;
      --panel-radius: 14px;
    }

    * {
      box-sizing: border-box;
    }

    .landing {
      max-width: 1300px;
      margin: 0 auto;
      padding: 48px 32px 72px;
    }

    .banner {
      margin: 0 16px 72px;
      max-width: 720px;
    }

    .banner h1 {
      color: var(--landing-heading-color, #657d84);
      font-size: var(--landing-heading-size, clamp(2.25rem, 4vw, 3.25rem));
      line-height: 1.15;
      font-weight: var(--landing-heading-weight, 700);
      margin: 0 0 12px;
    }

    .banner h1 span {
      color: #2e9f9d;
    }

    .banner p {
      color: var(--landing-subheading-color, inherit);
      font-size: var(--landing-subheading-size, 1.1rem);
      line-height: 1.45;
      margin: 0 0 20px;
    }

    .banner .tagline {
      color: #555;
      font-size: 1.4rem;
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

    .panel {
      position: relative;
      overflow: hidden;
      border-radius: var(--panel-radius);
      padding: 28px 32px 24px;
      background: var(--landing-panel-background-color, #706ab9);
      color: var(--landing-panel-color, #fff);
    }

    .panel h2 {
      margin: 0 0 4px;
      color: inherit;
      font-size: 1.35rem;
    }

    .panel-heading {
      display: flex;
      align-items: center;
      gap: 24px;
      min-height: 72px;
    }

    .panel-icon {
      display: grid;
      place-items: center;
      width: 68px;
      height: 68px;
      flex: none;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.23);
    }

    .panel-icon svg {
      width: 36px;
      height: 36px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .panel-intro {
      margin: 0;
      opacity: 0.9;
    }

    .hint {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .link-list {
      position: relative;
      z-index: 1;
      list-style: none;
      margin: 24px 0 0;
      padding: 0;
    }

    .link-list li {
      margin: 0 0 13px;
    }

    .link-list a {
      color: inherit;
      font-weight: 500;
      text-underline-offset: 3px;
      overflow-wrap: anywhere;
    }

    .panel-art {
      position: absolute;
      width: 160px;
      height: 160px;
      right: -12px;
      bottom: -54px;
      stroke: currentColor;
      stroke-width: 4;
      stroke-linejoin: round;
      opacity: 0.2;
      pointer-events: none;
    }

    .getting-started {
      margin-top: 40px;
    }

    .getting-started h2 {
      margin: 0 0 6px;
      font-size: 2rem;
    }

    .section-intro {
      margin-top: 0;
      color: #555;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 32px;
      list-style: none;
      padding: 0;
      margin: 28px 0 24px;
    }

    .steps li {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .step-number {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      flex: none;
      border-radius: 50%;
      background: #e6daf0;
      color: #493b70;
      font-weight: 700;
      font-size: 1.3rem;
    }

    .steps h3 {
      font-size: 1.15rem;
      margin: 8px 0 12px;
    }

    .steps p {
      line-height: 1.45;
      margin: 0;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
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

    @media (max-width: 850px) {
      .columns {
        grid-template-columns: 1fr;
      }

      .steps {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }

    @media (max-width: 520px) {
      .landing {
        padding: 32px 16px 48px;
      }

      .banner {
        margin: 0 0 40px;
      }

      .panel {
        padding: 22px;
      }

      .panel-heading {
        gap: 16px;
      }

      .panel-icon {
        width: 52px;
        height: 52px;
      }
    }
  `;
}

customElements.define("oscd-explorer-landing-page", OscdExplorerLandingPage);

export { OscdExplorerLandingPage, OscdExplorerLandingPage as default };
