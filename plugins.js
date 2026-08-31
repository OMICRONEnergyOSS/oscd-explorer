import "@webcomponents/scoped-custom-element-registry";
import OscdMenuOpen from "@omicronenergy/oscd-menu-open";
import OscdMenuNew from "@omicronenergy/oscd-menu-commons/oscd-menu-new.js";
import OscdBackgroundPluginConfig from "@omicronenergy/oscd-background-plugin-config";
import OscdBackgroundEditV1 from "@omicronenergy/oscd-background-editv1";
import OscdBackgroundWizardEvents from "@omicronenergy/oscd-background-wizard-events/oscd-background-wizard-events.js";

//Lets resister the plugins into the shells scoped custome-element registry.
const oscdShell = document.querySelector("oscd-shell");
const { registry } = oscdShell;
registry.define("oscd-menu-open", OscdMenuOpen);
registry.define("oscd-menu-new", OscdMenuNew);
registry.define("plugin-config", OscdBackgroundPluginConfig);
registry.define("oscd-background-editv1", OscdBackgroundEditV1);
registry.define("oscd-background-wizard-events", OscdBackgroundWizardEvents);

export const plugins = {
  menu: [
    {
      name: "Open File",
      translations: { de: "Datei öffnen" },
      icon: "folder_open",
      requireDoc: false,
      tagName: "oscd-menu-open",
    },
    {
      name: "New File",
      translations: { de: "Neu Datei" },
      icon: "create_new_folder",
      requireDoc: false,
      tagName: "oscd-menu-new",
    },
  ],
  editor: [
    {
      name: "Plugin Hub",
      translations: { de: "Plugin Hub" },
      icon: "edit",
      requireDoc: false,
      src: "https://ase-compas.github.io/compas-bearingpoint-plugins/compas/plugins/plugins-hub/index.js",
    },
  ],
  background: [
    {
      name: "EditV1 Events Listener",
      icon: "none",
      requireDoc: true,
      tagName: "oscd-background-editv1",
    },
    {
      name: "Wizard Events Listener",
      icon: "none",
      requireDoc: true,
      tagName: "oscd-background-wizard-events",
    },
    {
      name: "Plugin Config",
      icon: "none",
      requireDoc: false,
      tagName: "plugin-config",
    },
  ],
};
