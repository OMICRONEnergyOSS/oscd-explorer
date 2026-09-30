# IEC-61850 Editor - OpenSCD Adademy Distribution

OpenSCD Explorer is a maintained, vendor-neutral OpenSCD environment.
It starts with the OpenSCD host and plugin hub rather than a predefined plugin suite. You can add plugins from participating vendors and create your own workspace for exploration, evaluation, or prototyping. Plugin combinations are not necessarily tested, curated, or certified to work together, and this distro is not intended to represent a production-ready vendor solution.

# Landing page

`landing-page.js` supplies a custom `oscd-shell` landing page
(`<oscd-explorer-landing-page slot="landing-page">` in `index.html`),
replacing the shell's default welcome screen. Its **Distributions** card
lists the six name/URL pairs in the locally maintained `distros.json`
(copied into the bundle). Update that file when the community list changes;
the list is not fetched from openscd.org. The **Further info** card links to
other OpenSCD resources.

The **Getting started** section shows three steps: explore, add plugins, and
open a project. The "Start exploring" action opens an unsaved document named
`new-project.scd` to reveal the plugin rail and the Plugin Hub; plugin picks
persist to `localStorage` via `oscd-background-plugin-config`. Returning
visitors (detected via `localStorage['plugins']`) keep the steps but see
quick-access actions below them. Organization logos for the bottom of the
page are deferred until approved image assets are available.

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
