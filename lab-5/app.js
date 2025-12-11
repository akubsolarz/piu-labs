import { store } from "./store.js";
import "./ui.js"; 

document.getElementById("addSquare").addEventListener("click", () =>
  store.addShape("square")
);

document.getElementById("addCircle").addEventListener("click", () =>
  store.addShape("circle")
);

document
  .getElementById("recolorSquares")
  .addEventListener("click", () => store.recolor("square"));

document
  .getElementById("recolorCircles")
  .addEventListener("click", () => store.recolor("circle"));