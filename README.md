# IEC-61850 Editor - OpenSCD Adademy Distribution

OpenSCD Explorer is a maintained, vendor-neutral OpenSCD environment.
It starts with the OpenSCD host and plugin hub rather than a predefined plugin suite. You can add plugins from participating vendors and create your own workspace for exploration, evaluation, or prototyping. Plugin combinations are not necessarily tested, curated, or certified to work together, and this distro is not intended to represent a production-ready vendor solution.

# Landing page

`landing-page.js` supplies a custom `oscd-shell` landing page
(`<oscd-explorer-landing-page slot="landing-page">` in `index.html`),
replacing the shell's default welcome screen. It shows two panels:

- **Other OpenSCD Distributions** — fetched live from
  [openscd.org/get.html](https://openscd.org/get.html) at runtime (sanitized
  before rendering), so the list of known distributions always matches the
  community site without needing a code change here.
- **Make It Your Own** — explains that vendors maintain their own plugin
  lists, browsable via the "Plugin Hub" editor plugin, and that picks persist
  to `localStorage` automatically (via `oscd-background-plugin-config`).
  Editor plugins only render once a document is open, so the "Start
  Exploring" / "Continue Customizing Plugins" actions open a throwaway,
  unsaved document named `new-project.scd` purely to reveal the plugin rail.
  Returning visitors (detected via existing `localStorage['plugins']` data)
  see a condensed panel with quick-access buttons instead of the full
  first-time walkthrough.

# Security

We do NOT upload any information of any sort.
You browser is only downloading never uploading anything.
So when you connect to the [Open SCD Explorer](https://omicronenergyoss.github.io/oscd-explorer/) you download/update all the JavaScript files to run the editor in your browser.

# Adding a plugin

Add the plugin as a runtime dependency:

```bash
  npm install -S @omicronenergy/oscd-menu-open
```

In the `plugins.js` file:

- Import the new plugin
- Define it as a custom element (with a unique name)
- add it to the exported plugins object using the tagName defined in the previous step

```javascript
import OscdMenuOpen from "@omicronenergy/oscd-menu-open";
//find the shell
const oscdShell = document.querySelector("oscd-shell");
// Get a reference it the shells scoped web component registry.
const { registry } = oscdShell;
// register the plugin
registry.define("oscd-menu-open", OscdMenuOpen);
// Add the plugin you just registered to the plugins object.

export const plugins = {
  menu: [
    {
      name: "Open File",
      translations: { de: "Datei öffnen" },
      icon: "folder_open",
      requireDoc: false,
      tagName: "oscd-menu-open",
    },
    //Alternatively you can use "src" instead of "tagName" to point to a URL where the plugin is deployed to load it dynamically.
    {
      name: "Open File",
      translations: { de: "Datei öffnen" },
      icon: "folder_open",
      requireDoc: false,
      src: "https://omicronenergyoss.github.io/oscd-menu-open/oscd-menu-open.js",
    },
  ],
  editor: [],
  background: [],
};
```
