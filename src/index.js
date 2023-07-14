import tasks from "./tasks.json";

// Variables
const input = document.getElementById("text");
const button = document.querySelector("button");
const list = document.querySelector(".output__list");
const header = document.querySelector("h1");

// Functions
const getItemTemplate = (title, index, completed) =>
  `<div class="output__item" data-index="${index}">
    <li class="${completed ? "task-completed" : ""}">${title}</li>
      <a class="apply" href="#" data-type="complete">✓</a>
      <a class="remove" href="#" data-type="delete">&#9003;</a>
   </div>
  `;

const render = (tasks) => {
  document.querySelector(".output__list").innerHTML = "";
  tasks.map(({ title, id, completed }) => {
    return document
      .querySelector(".output__list")
      .insertAdjacentHTML("beforeend", getItemTemplate(title, id, completed));
  });
};

const getLastIndex = () => JSON.parse(localStorage.getItem("tasks")).length;

const createItem = (title) => {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks.push({
    id: getLastIndex() + 1,
    title,
    completed: false
  });

  updateComponent(tasks);
};

const performAction = (type, index) => {
  changeCompleted(index, updateComponent, type);
};

const changeCompleted = (index, cb, type) => {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  switch (type) {
    case "complete":
      tasks = tasks.map((el) => {
        if (el.id === Number(index)) {
          el.completed = !el.completed;
        }

        return el;
      });

      break;
    case "delete":
      tasks = tasks.filter((el) => el.id !== Number(index));
      break;
    default:
      return null;
  }

  cb(tasks);
};

const updateComponent = (data) => {
  localStorage.setItem("tasks", JSON.stringify(data));
  render(JSON.parse(localStorage.getItem("tasks")));
};

const zeroFill = (num) => ("0" + num).slice(-2);

const getDateOptions = () => {
  const date = new Date();
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric"
  };

  return { date, options };
};

const getCurrentDate = (paramsFn) => {
  const { date, options } = paramsFn();

  return date.toLocaleDateString("ru-RU", options);
};

const getRealTime = (paramsFn, addZeroFn, isClock) => {
  const { date } = paramsFn();

  const hours = addZeroFn(date.getHours()),
    minutes = addZeroFn(date.getMinutes()),
    seconds = addZeroFn(date.getSeconds());

  return isClock
    ? { hours, minutes, seconds }
    : `${hours} : ${minutes} : ${seconds}`;
};

const renderTime = (options, cb) => {
  const { ctx, radius } = options;

  return setInterval(() => cb(ctx, radius), 1000);
};

const initializeCanvas = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let radius = canvas.height / 2;
  ctx.translate(radius, radius);
  const options = { ctx, radius };
  renderTime(options, drawClock);
};

const drawFace = (ctx, radius) => {
  const grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1);
  grad.addColorStop(0, "#333");
  grad.addColorStop(0.5, "#ffffff");
  grad.addColorStop(1, "#333");

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.strokeStyle = grad;
  ctx.lineWidth = radius * 0.1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.05, 0, 2 * Math.PI);
  ctx.fillStyle = "#333";
  ctx.fill();
};

const drawNumbers = (ctx, radius) => {
  ctx.font = radius * 0.15 + "px arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  for (let num = 1; num < 13; num++) {
    let ang = num * (Math.PI / 6);
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
};

const drawTime = (ctx, radius) => {
  const { hours, minutes, seconds } = getRealTime(
    getDateOptions,
    zeroFill,
    true
  );

  // Hours
  let hour = hours % 12;
  hour =
    (hour * Math.PI) / 6 +
    (minutes * Math.PI) / (6 * 60) +
    (seconds * Math.PI) / (360 * 60);
  drawHand(ctx, hour, radius * 0.55, radius * 0.065);

  // Minutes
  let minute = (minutes * Math.PI) / 30 + (seconds * Math.PI) / (30 * 60);
  drawHand(ctx, minute, radius * 0.7, radius * 0.06);

  // Seconds
  let second = (seconds * Math.PI) / 30;
  drawHand(ctx, second, radius * 0.75, radius * 0.02);
};

const drawHand = (ctx, pos, length, width) => {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
};

const drawClock = (ctx, radius) => {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
};

const init = () => {
  let value = header.textContent;

  header.textContent = value + " " + getCurrentDate(getDateOptions);

  initializeCanvas();
  render(JSON.parse(localStorage.getItem("tasks")));
};

// Handlers
const addBtnClickHandler = () => {
  if (!input.value) {
    return;
  }

  createItem(input.value);
};

// Subscriptions
button.addEventListener("click", addBtnClickHandler);
list.addEventListener("click", (evt) => {
  if (!evt.target.closest("a")) {
    return;
  }

  const { index } = evt.target.parentNode.dataset;
  const { type } = evt.target.dataset;
  performAction(type, index);
});

// Code
init();
