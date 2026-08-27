import "@webcomponents/scoped-custom-element-registry";
import "@omicronenergy/oscd-shell/oscd-shell.js";
import { plugins } from "./plugins.js";

const _customElementsDefine = window.customElements.define;
window.customElements.define = (name, cl, conf) => {
  if (!customElements.get(name)) {
    try {
      _customElementsDefine.call(window.customElements, name, cl, conf);
    } catch (e) {
      console.warn(e);
    }
  }
};

const oscdShell = document.querySelector("oscd-shell");
try {
  oscdShell.plugins = plugins;
} catch (err) {
  console.error("Error loading plugins:", err);
}

const params = new URL(document.location).searchParams;
for (const [name, value] of params) {
  oscdShell.setAttribute(name, value);
}
