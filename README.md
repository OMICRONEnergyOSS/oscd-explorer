# IEC-61850 Editor - OpenSCD Adademy Distribution

OpenSCD Explorer is a maintained, vendor-neutral OpenSCD environment.
It starts with the OpenSCD host and plugin hub rather than a predefined plugin suite. You can add plugins from participating vendors and create your own workspace for exploration, evaluation, or prototyping. Plugin combinations are not necessarily tested, curated, or certified to work together, and this distro is not intended to represent a production-ready vendor solution.

# Landing page

`landing-page.js` supplies a custom `oscd-shell` landing page
(`<oscd-explorer-landing-page slot="landing-page">` in `index.html`),
replacing the shell's default welcome screen. Select **Distributions** to
see the locally maintained entries in `distros.json` (copied into the
bundle); update their names, descriptions, URLs and optional `icon` image
URLs when the community list changes. Entries without an icon, or with an
image that fails to load, use the generic distribution icon. The list is not
fetched from openscd.org.

Select **Custom build** for getting-started guidance and actions to open an
existing file or create one using the New File dialog. Open or create a file
to reach the Plugin Hub. Plugin selections persist through
`oscd-background-plugin-config`. The landing page separately remembers the
last selected starting point and the last distribution opened in browser
localStorage. On return, Custom build shows a compact view and Distributions
highlights the last opened distribution. `contributors.json` contains each
contributor's visible `name`, image `icon` URL and destination `url`. Its
current logos are provisional and should be replaced with approved assets.

# Security

The editor runs in your browser. The landing page loads provisional logos
from external hosts, which receive your browser's IP address. Image requests
do not include a referrer. Logo availability depends on those hosts.

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
