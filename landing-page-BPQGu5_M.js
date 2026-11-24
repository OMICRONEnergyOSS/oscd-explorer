import { b, i, A, a as i$1 } from './lit-element-C5VFbjVN.js';

const DISTROS_JSON_URL = "./distros.json";
const CONTRIBUTORS_JSON_URL = "./contributors.json";
const OPENSCD_GET_URL = "https://openscd.org/get.html";
const VIEW_STORAGE_KEY = "oscd-explorer:landing-view";
const DISTRO_STORAGE_KEY = "oscd-explorer:last-distribution";

const cubeIcon = b`
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M24 4 43 14v20L24 44 5 34V14L24 4Z M5 14l19 11 19-11M24 25v19" />
  </svg>
`;
const fileIcon = b`
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M12 4h19l9 9v31H12V4Z M31 4v10h9M19 23h15M19 30h15M19 37h10" />
  </svg>
`;

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Could not read landing page preference ${key}:`, error);
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Could not save landing page preference ${key}:`, error);
  }
}

async function loadJson(url) {
  const response = await fetch(new URL(url, import.meta.url));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

class OscdExplorerLandingPage extends i {
  static properties = {
    selectedView: { state: true },
    lastDistro: { state: true },
    returningCustomBuild: { state: true },
    distrosStatus: { state: true },
    distros: { state: true },
    contributorsStatus: { state: true },
    contributors: { state: true },
    failedIcons: { state: true },
  };

  constructor() {
    super();
    this.selectedView = null;
    this.lastDistro = null;
    this.returningCustomBuild = false;
    this.distrosStatus = "loading";
    this.distros = [];
    this.contributorsStatus = "loading";
    this.contributors = [];
    this.failedIcons = new Set();
  }

  connectedCallback() {
    super.connectedCallback();
    const savedView = readStorage(VIEW_STORAGE_KEY);
    this.selectedView =
      savedView === "distros" || savedView === "custom" ? savedView : null;
    this.returningCustomBuild = savedView === "custom";
    this.lastDistro = readStorage(DISTRO_STORAGE_KEY);
    this.loadDistros();
    this.loadContributors();
  }

  async loadDistros() {
    this.distrosStatus = "loading";
    try {
      this.distros = await loadJson(DISTROS_JSON_URL);
      this.distrosStatus = "loaded";
    } catch (error) {
      console.warn(`Could not load ${DISTROS_JSON_URL}:`, error);
      this.distrosStatus = "error";
    }
  }

  async loadContributors() {
    this.contributorsStatus = "loading";
    try {
      this.contributors = await loadJson(CONTRIBUTORS_JSON_URL);
      this.contributorsStatus = "loaded";
    } catch (error) {
      console.warn(`Could not load ${CONTRIBUTORS_JSON_URL}:`, error);
      this.contributorsStatus = "error";
    }
  }

  handleIconError(event) {
    const url = event.currentTarget.getAttribute("src");
    console.warn(`Could not load image ${url}`);
    this.failedIcons = new Set([...this.failedIcons, url]);
  }

  selectView(view) {
    this.selectedView = view;
    writeStorage(VIEW_STORAGE_KEY, view);
  }

  selectDistro(url) {
    this.lastDistro = url;
    writeStorage(DISTRO_STORAGE_KEY, url);
  }

  runMenuPlugin(tagName) {
    const shell = this.closest("oscd-shell");
    const plugin = shell?.plugins.menu.find(
      (item) => item.tagName === tagName && item.requireDoc !== true,
    );
    const instance = plugin && shell.shadowRoot?.querySelector(plugin.tagName);
    if (!instance || typeof instance.run !== "function") {
      console.error(`Could not run menu plugin ${tagName}`);
      return;
    }
    instance.run();
  }

  renderChoice(view, title, description, icon) {
    const selected = this.selectedView === view;
    return b`
      <button
        class="choice ${view} ${selected ? "selected" : ""}"
        type="button"
        aria-pressed="${selected}"
        aria-controls="choice-content"
        @click=${() => this.selectView(view)}
      >
        <span class="choice-icon">${icon}</span>
        <span class="choice-text">
          <strong>${title}</strong>
          <span>${description}</span>
        </span>
        <span class="choice-art">${icon}</span>
      </button>
    `;
  }

  renderDistros() {
    return b`
      <section class="expanded" aria-labelledby="distros-heading">
        <h2 id="distros-heading">Choose a distribution</h2>
        <p class="section-intro">
          Start with a curated OpenSCD setup. You can explore the options before
          opening one.
        </p>
        ${this.distrosStatus === "loading"
          ? b`<p role="status">Loading distributions…</p>`
          : A}
        ${this.distrosStatus === "error"
          ? b`<p role="status">
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
          ? b`
              <ul class="distros-list">
                ${this.distros.map(
                  (distro) => b`
                    <li>
                      <a
                        class="distro-card ${this.lastDistro === distro.url
                          ? "last-selected"
                          : ""}"
                        href="${distro.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                        @click=${() => this.selectDistro(distro.url)}
                      >
                        <span class="distro-heading">
                          ${distro.icon && !this.failedIcons.has(distro.icon)
                            ? b`<img
                                src="${distro.icon}"
                                alt=""
                                referrerpolicy="no-referrer"
                                @error=${this.handleIconError}
                              />`
                            : cubeIcon}
                          <strong>${distro.name}</strong>
                        </span>
                        ${this.lastDistro === distro.url
                          ? b`<span class="visually-hidden"
                              >Last opened distribution</span
                            >`
                          : A}
                        <span>${distro.description}</span>
                      </a>
                    </li>
                  `,
                )}
              </ul>
            `
          : A}
      </section>
    `;
  }

  renderCustomBuild() {
    return b`
      <section class="expanded custom-content" aria-labelledby="custom-heading">
        ${this.returningCustomBuild
          ? b`
              <h2 id="custom-heading">Custom build</h2>
              <p class="section-intro">
                Open an existing file or create a new project to continue.
              </p>
            `
          : b`
              <h2 id="custom-heading">Getting started</h2>
              <p class="section-intro">
                No distribution quite fits? Set up your own workspace in a few
                simple steps. Open or create a file to access the Plugin Hub.
                Your plugin selection is saved in this browser.
              </p>
              <ol class="steps">
                <li>
                  <span class="step-number">1</span>
                  <div>
                    <h3>Start exploring</h3>
                    <p>
                      Get familiar with the interface and try the built-in
                      plugins.
                    </p>
                  </div>
                </li>
                <li>
                  <span class="step-number">2</span>
                  <div>
                    <h3>Add plugins</h3>
                    <p>
                      Use the Plugin Hub to choose tools that match your
                      workflow.
                    </p>
                  </div>
                </li>
                <li>
                  <span class="step-number">3</span>
                  <div>
                    <h3>Open an existing project</h3>
                    <p>
                      Open an SCL file to start viewing, editing and validating
                      your data.
                    </p>
                  </div>
                </li>
              </ol>
            `}
        <div class="quick-actions">
          <button
            type="button"
            class="cta"
            @click=${() => this.runMenuPlugin("oscd-menu-open")}
          >
            Open file
          </button>
          <button
            type="button"
            class="cta secondary"
            @click=${() => this.runMenuPlugin("oscd-menu-new")}
          >
            Create File
          </button>
        </div>
      </section>
    `;
  }

  render() {
    return b`
      <main class="landing">
        <header class="topbar">
          <strong class="header-title">
            <span class="header-icon" aria-hidden="true"></span>
            OpenSCD
          </strong>
          <a
            href="https://github.com/OMICRONEnergyOSS/oscd-explorer"
            target="_blank"
            rel="noopener noreferrer"
            >GitHub ↗</a
          >
        </header>
        <div class="intro">
          <h1>Welcome to OpenSCD</h1>
          <p>
            An open-source IEC 61850 engineering tool for creating and editing
            SCL files.
          </p>
          <p>
            Choose a ready-to-use distribution or build a workspace with the
            plugins you need.
          </p>
          <a
            href="https://openscd.org"
            target="_blank"
            rel="noopener noreferrer"
            >Learn more at openscd.org ↗</a
          >
        </div>
        <section aria-labelledby="choose-heading">
          <h2 id="choose-heading" class="choose-heading">
            Choose how you want to get started
          </h2>
          <p class="choose-intro">
            Choose a starting point to see available options.
          </p>
          <div class="choices">
            ${this.renderChoice(
              "distros",
              "Distributions",
              "Pre-built OpenSCD versions with a curated set of plugins.",
              cubeIcon,
            )}
            ${this.renderChoice(
              "custom",
              "Custom build",
              "Choose plugins yourself to create a workspace that fits your needs.",
              fileIcon,
            )}
          </div>
          <div id="choice-content">
            ${this.selectedView === "distros" ? this.renderDistros() : A}
            ${this.selectedView === "custom"
              ? this.renderCustomBuild()
              : A}
          </div>
        </section>
        <section class="contributors" aria-labelledby="contributors-heading">
          <h2 id="contributors-heading">OpenSCD contributors</h2>
          <p>Organizations building the OpenSCD ecosystem</p>
          ${this.contributorsStatus === "loading"
            ? b`<p role="status">Loading contributors…</p>`
            : A}
          ${this.contributorsStatus === "error"
            ? b`<p role="status">Could not load contributors right now.</p>`
            : A}
          ${this.contributorsStatus === "loaded"
            ? b`<ul class="contributor-list">
                ${this.contributors.map(
                  (contributor) => b`
                    <li>
                      <a
                        href="${contributor.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ${contributor.icon &&
                        !this.failedIcons.has(contributor.icon)
                          ? b`<img
                              src="${contributor.icon}"
                              alt=""
                              referrerpolicy="no-referrer"
                              @error=${this.handleIconError}
                            />`
                          : A}
                        <span>${contributor.name}</span>
                      </a>
                    </li>
                  `,
                )}
              </ul>`
            : A}
        </section>
      </main>
    `;
  }

  static styles = i$1`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      background: var(--landing-background-color, #fbf8ec);
      color: #233344;
      font-family: var(--landing-heading-font-family, "Roboto", sans-serif);
    }

    * {
      box-sizing: border-box;
    }
    a {
      color: #514ecb;
    }
    button {
      font: inherit;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 3px solid #005ea8;
      outline-offset: 3px;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .landing {
      max-width: 1300px;
      margin: auto;
      padding: 28px 32px 48px;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e1e2da;
      padding-bottom: 16px;
      color: #153c61;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2rem;
    }
    .header-icon {
      width: 32px;
      height: 29px;
      background-color: currentColor;
      mask: url("./openscd-icon.svg") center / contain no-repeat;
    }
    .topbar a {
      color: #456b89;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
    }
    .intro {
      margin: 32px 0 40px;
      color: #486d89;
    }
    .intro h1 {
      margin: 0 0 16px;
      font-size: clamp(2rem, 4vw, 2.5rem);
      line-height: 1.15;
    }
    .intro p {
      margin: 0 0 8px;
      line-height: 1.5;
    }
    .intro a {
      display: inline-block;
      margin-top: 20px;
      font-weight: 700;
      text-decoration: none;
    }
    .choose-heading {
      color: #153c61;
      font-size: 1rem;
      margin: 0 0 8px;
    }
    .choose-intro {
      color: #486d89;
      margin: 0 0 20px;
      font-size: 0.9rem;
    }
    .choices {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
    }
    .choice {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 18px;
      width: 100%;
      min-height: 100px;
      padding: 16px;
      border: 3px solid transparent;
      border-radius: 8px;
      color: white;
      text-align: left;
      cursor: pointer;
    }
    .choice.distros {
      background: #6967c7;
    }
    .choice.custom {
      background: #287b80;
    }
    .choice.distros.selected {
      background: #4634a5;
      border-color: #2e1d82;
    }
    .choice.custom.selected {
      background: #267579;
      border-color: #07545b;
    }
    .choice-icon {
      display: grid;
      place-items: center;
      flex: none;
      width: 54px;
      height: 54px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.23);
    }
    svg {
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .choice-icon svg {
      width: 30px;
      height: 30px;
    }
    .choice-text {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 6px;
      max-width: 280px;
    }
    .choice-text strong {
      font-size: 1.2rem;
    }
    .choice-text span {
      font-size: 0.875rem;
      line-height: 1.35;
    }
    .choice-art {
      position: absolute;
      width: 130px;
      right: -10px;
      bottom: -35px;
      opacity: 0.22;
    }
    .choice-art svg {
      width: 100%;
    }
    .expanded {
      margin-top: 16px;
      padding: 24px;
      border-radius: 16px;
      background: #f5f0e2;
    }
    .expanded h2 {
      margin: 0 0 6px;
      font-size: 1.5rem;
    }
    .section-intro {
      margin: 0;
      color: #536978;
      line-height: 1.5;
    }
    .distros-list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      list-style: none;
      padding: 0;
      margin: 28px 0 0;
    }
    .distro-card {
      display: flex;
      flex-direction: column;
      gap: 14px;
      height: 100%;
      min-height: 145px;
      padding: 20px;
      border: 1px solid #dfd6c6;
      border-radius: 8px;
      background: #fcfaf5;
      color: #536575;
      text-decoration: none;
      line-height: 1.4;
    }
    .distro-card:hover,
    .distro-card.last-selected {
      border-color: #5a4ce3;
    }
    .distro-heading {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #233344;
    }
    .distro-heading svg,
    .distro-heading img {
      flex: none;
      width: 40px;
      height: 40px;
      color: #6558ae;
    }
    .distro-heading img {
      object-fit: contain;
    }
    .steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 28px;
      list-style: none;
      padding: 0;
      margin: 24px 0;
    }
    .steps li {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .step-number {
      display: grid;
      place-items: center;
      flex: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #92cdca;
      color: #174e53;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .steps h3 {
      margin: 8px 0 10px;
      font-size: 1rem;
      color: #426779;
    }
    .steps p {
      margin: 0;
      color: #536978;
      line-height: 1.4;
    }
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    .cta {
      min-width: 150px;
      padding: 10px 20px;
      border: 2px solid #007e87;
      border-radius: 12px;
      background: #007e87;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    .cta.secondary {
      background: transparent;
      color: #006a72;
    }
    .contributors {
      margin-top: 56px;
      padding-top: 32px;
      border-top: 1px solid #e1e2da;
    }
    .contributors h2 {
      margin: 0 0 4px;
      color: #153c61;
      font-size: 1.3rem;
    }
    .contributors p {
      margin: 0 0 16px;
      color: #486d89;
    }
    .contributor-list {
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 20px;
      list-style: none;
      margin: 0;
      padding: 20px;
      border: 1px solid #e2ded6;
      border-radius: 8px;
      background: white;
    }
    .contributor-list a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #153c61;
      text-align: center;
      text-decoration: none;
    }
    .contributor-list img {
      width: 140px;
      height: 48px;
      object-fit: contain;
    }
    @media (max-width: 850px) {
      .distros-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .steps {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
    @media (max-width: 600px) {
      .landing {
        padding: 24px 16px 40px;
      }
      .choices,
      .distros-list {
        grid-template-columns: 1fr;
      }
      .expanded {
        padding: 20px;
      }
      .contributor-list {
        flex-wrap: wrap;
      }
    }
  `;
}

customElements.define("oscd-explorer-landing-page", OscdExplorerLandingPage);

export { OscdExplorerLandingPage, OscdExplorerLandingPage as default };
