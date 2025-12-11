import { randomHsl, uniqid } from "./helpers.js";

class Store {
  constructor() {
    const save = localStorage.getItem("shapes");
    this.conteiner = save ? JSON.parse(save) : [];

    this.subscribers = [];
  }

  subscribe(sub) {
    this.subscribers.push(sub);
    sub(this.getState()); 
  }

  notify() {
    localStorage.setItem("shapes", JSON.stringify(this.conteiner));
    this.subscribers.forEach(sub => sub(this.getState()));
  }

  getState() {
    return [...this.conteiner];
  }

  addShape(type) {
    this.conteiner.push({
      id: uniqid(),
      type,
      color: randomHsl(),
    });
    this.notify();
  }

  removeShape(id) {
    this.conteiner = this.conteiner.filter(s => s.id !== id);
    this.notify();
  }

  recolor(type) {
    this.conteiner = this.conteiner.map(s =>
      s.type === type
        ? { ...s, color: randomHsl() }
        : s
    );
    this.notify();
  }
}

export const store = new Store();