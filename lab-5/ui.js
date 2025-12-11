import { store } from "./store.js";

const board = document.getElementById("board");
const cntSquares = document.getElementById("cntSquares");
const cntCircles = document.getElementById("cntCircles");

const uiMap = new Map();

store.subscribe((state) => {
  const squares = state.filter(s => s.type === "square").length;
  const circles = state.filter(s => s.type === "circle").length;

  cntSquares.textContent = squares;
  cntCircles.textContent = circles;

  const SID = new Set(state.map(s => s.id));

  uiMap.forEach((el, id) => {
    if (!SID.has(id)) {
      el.remove();
      uiMap.delete(id);
    }
  });

  state.forEach(shape => {
    if (uiMap.has(shape.id)) {
      uiMap.get(shape.id).style.backgroundColor = shape.color;
      return;
    }
    const el = document.createElement("div");
    el.className = `shape ${shape.type}`;
    el.dataset.id = shape.id;
    el.style.backgroundColor = shape.color;
    board.appendChild(el);

    uiMap.set(shape.id, el);
  });
});


board.addEventListener("click", (element) => {
  const id = element.target.dataset.id;
  if (id) store.removeShape(id);
});