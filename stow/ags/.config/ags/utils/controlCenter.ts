// utils/controlCenter.ts
import { createState } from "ags";

const [ccVisible, setCCVisible] = createState(false);

export { ccVisible, setCCVisible };

export function toggleControlCenter() {
  setCCVisible((v) => !v);
}

export function closeControlCenter() {
  setCCVisible(false);
}

export const toggleCC = toggleControlCenter;
