import global from "global";

if (typeof window !== "undefined") {
  window.global = global;
}

if (typeof globalThis !== "undefined" && !globalThis.global) {
  globalThis.global = globalThis;
}