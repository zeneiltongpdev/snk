/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../action/palettes.ts":
/*!*****************************!*\
  !*** ../action/palettes.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "basePalettes": () => (/* binding */ basePalettes),
/* harmony export */   "palettes": () => (/* binding */ palettes)
/* harmony export */ });
const basePalettes = {
    "github-light": {
        colorDotBorder: "#1b1f230a",
        colorDots: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
        colorEmpty: "#ebedf0",
        colorSnake: "purple",
    },
    "github-dark": {
        colorDotBorder: "#1b1f230a",
        colorEmpty: "#161b22",
        colorDots: ["#161b22", "#01311f", "#034525", "#0f6d31", "#00c647"],
        colorSnake: "purple",
    },
};
// aliases
const palettes = { ...basePalettes };
palettes["github"] = palettes["github-light"];
palettes["default"] = palettes["github"];


/***/ }),

/***/ "../action/userContributionToGrid.ts":
/*!*******************************************!*\
  !*** ../action/userContributionToGrid.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "userContributionToGrid": () => (/* binding */ userContributionToGrid)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");

const userContributionToGrid = (cells) => {
    const width = Math.max(0, ...cells.map((c) => c.x)) + 1;
    const height = Math.max(0, ...cells.map((c) => c.y)) + 1;
    const grid = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.createEmptyGrid)(width, height);
    for (const c of cells) {
        if (c.level > 0)
            (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColor)(grid, c.x, c.y, c.level);
        else
            (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(grid, c.x, c.y);
    }
    return grid;
};


/***/ }),

/***/ "./springUtils.ts":
/*!************************!*\
  !*** ./springUtils.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clamp": () => (/* binding */ clamp),
/* harmony export */   "isStable": () => (/* binding */ isStable),
/* harmony export */   "isStableAndBound": () => (/* binding */ isStableAndBound),
/* harmony export */   "stepSpring": () => (/* binding */ stepSpring)
/* harmony export */ });
const epsilon = 0.01;
const clamp = (a, b) => (x) => Math.max(a, Math.min(b, x));
/**
 * step the spring, mutate the state to reflect the state at t+dt
 *
 */
const stepSpringOne = (s, { tension, friction, maxVelocity = Infinity, }, target, dt = 1 / 60) => {
    const a = -tension * (s.x - target) - friction * s.v;
    s.v += a * dt;
    s.v = clamp(-maxVelocity / dt, maxVelocity / dt)(s.v);
    s.x += s.v * dt;
};
/**
 * return true if the spring is to be considered in a stable state
 * ( close enough to the target and with a small enough velocity )
 */
const isStable = (s, target, dt = 1 / 60) => Math.abs(s.x - target) < epsilon && Math.abs(s.v * dt) < epsilon;
const isStableAndBound = (s, target, dt) => {
    const stable = isStable(s, target, dt);
    if (stable) {
        s.x = target;
        s.v = 0;
    }
    return stable;
};
const stepSpring = (s, params, target, dt = 1 / 60) => {
    const interval = 1 / 60;
    while (dt > 0) {
        stepSpringOne(s, params, target, Math.min(interval, dt));
        // eslint-disable-next-line no-param-reassign
        dt -= interval;
    }
};


/***/ }),

/***/ "./worker-utils.ts":
/*!*************************!*\
  !*** ./worker-utils.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createRpcClient": () => (/* binding */ createRpcClient),
/* harmony export */   "createRpcServer": () => (/* binding */ createRpcServer)
/* harmony export */ });
const symbol = "worker-rpc__";
const createRpcServer = (api) => self.addEventListener("message", async (event) => {
    var _a;
    if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.symbol) === symbol) {
        try {
            const res = await api[event.data.methodName](...event.data.args);
            self.postMessage({ symbol, key: event.data.key, res });
        }
        catch (error) {
            postMessage({ symbol, key: event.data.key, error: error.message });
        }
    }
});
const createRpcClient = (worker) => {
    const originalTerminate = worker.terminate;
    worker.terminate = () => {
        worker.dispatchEvent(new Event("terminate"));
        originalTerminate.call(worker);
    };
    return new Proxy({}, {
        get: (_, methodName) => (...args) => new Promise((resolve, reject) => {
            const key = Math.random().toString();
            const onTerminate = () => {
                worker.removeEventListener("terminate", onTerminate);
                worker.removeEventListener("message", onMessageHandler);
                reject(new Error("worker terminated"));
            };
            const onMessageHandler = (event) => {
                var _a;
                if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.symbol) === symbol && event.data.key === key) {
                    if (event.data.error)
                        reject(event.data.error);
                    else if (event.data.res)
                        resolve(event.data.res);
                    worker.removeEventListener("terminate", onTerminate);
                    worker.removeEventListener("message", onMessageHandler);
                }
            };
            worker.addEventListener("message", onMessageHandler);
            worker.addEventListener("terminate", onTerminate);
            worker.postMessage({ symbol, key, methodName, args });
        }),
    });
};


/***/ }),

/***/ "../draw/drawGrid.ts":
/*!***************************!*\
  !*** ../draw/drawGrid.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawGrid": () => (/* binding */ drawGrid)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _pathRoundedRect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pathRoundedRect */ "../draw/pathRoundedRect.ts");


const drawGrid = (ctx, grid, cells, o) => {
    for (let x = grid.width; x--;)
        for (let y = grid.height; y--;) {
            if (!cells || cells.some((c) => c.x === x && c.y === y)) {
                const c = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y);
                // @ts-ignore
                const color = !c ? o.colorEmpty : o.colorDots[c];
                ctx.save();
                ctx.translate(x * o.sizeCell + (o.sizeCell - o.sizeDot) / 2, y * o.sizeCell + (o.sizeCell - o.sizeDot) / 2);
                ctx.fillStyle = color;
                ctx.strokeStyle = o.colorDotBorder;
                ctx.lineWidth = 1;
                ctx.beginPath();
                (0,_pathRoundedRect__WEBPACK_IMPORTED_MODULE_1__.pathRoundedRect)(ctx, o.sizeDot, o.sizeDot, o.sizeDotBorderRadius);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }
        }
};


/***/ }),

/***/ "../draw/drawSnake.ts":
/*!****************************!*\
  !*** ../draw/drawSnake.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawSnake": () => (/* binding */ drawSnake),
/* harmony export */   "drawSnakeLerp": () => (/* binding */ drawSnakeLerp)
/* harmony export */ });
/* harmony import */ var _pathRoundedRect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pathRoundedRect */ "../draw/pathRoundedRect.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");


const drawSnake = (ctx, snake, o) => {
    const cells = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.snakeToCells)(snake);
    for (let i = 0; i < cells.length; i++) {
        const u = (i + 1) * 0.6;
        ctx.save();
        ctx.fillStyle = o.colorSnake;
        ctx.translate(cells[i].x * o.sizeCell + u, cells[i].y * o.sizeCell + u);
        ctx.beginPath();
        (0,_pathRoundedRect__WEBPACK_IMPORTED_MODULE_0__.pathRoundedRect)(ctx, o.sizeCell - u * 2, o.sizeCell - u * 2, (o.sizeCell - u * 2) * 0.25);
        ctx.fill();
        ctx.restore();
    }
};
const lerp = (k, a, b) => (1 - k) * a + k * b;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const drawSnakeLerp = (ctx, snake0, snake1, k, o) => {
    const m = 0.8;
    const n = snake0.length / 2;
    for (let i = 0; i < n; i++) {
        const u = (i + 1) * 0.6 * (o.sizeCell / 16);
        const a = (1 - m) * (i / Math.max(n - 1, 1));
        const ki = clamp((k - a) / m, 0, 1);
        const x = lerp(ki, snake0[i * 2 + 0], snake1[i * 2 + 0]) - 2;
        const y = lerp(ki, snake0[i * 2 + 1], snake1[i * 2 + 1]) - 2;
        ctx.save();
        ctx.fillStyle = o.colorSnake;
        ctx.translate(x * o.sizeCell + u, y * o.sizeCell + u);
        ctx.beginPath();
        (0,_pathRoundedRect__WEBPACK_IMPORTED_MODULE_0__.pathRoundedRect)(ctx, o.sizeCell - u * 2, o.sizeCell - u * 2, (o.sizeCell - u * 2) * 0.25);
        ctx.fill();
        ctx.restore();
    }
};


/***/ }),

/***/ "../draw/drawWorld.ts":
/*!****************************!*\
  !*** ../draw/drawWorld.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawLerpWorld": () => (/* binding */ drawLerpWorld),
/* harmony export */   "drawStack": () => (/* binding */ drawStack),
/* harmony export */   "drawWorld": () => (/* binding */ drawWorld),
/* harmony export */   "getCanvasWorldSize": () => (/* binding */ getCanvasWorldSize)
/* harmony export */ });
/* harmony import */ var _drawGrid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawGrid */ "../draw/drawGrid.ts");
/* harmony import */ var _drawSnake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./drawSnake */ "../draw/drawSnake.ts");


const drawStack = (ctx, stack, max, width, o) => {
    ctx.save();
    const m = width / max;
    for (let i = 0; i < stack.length; i++) {
        // @ts-ignore
        ctx.fillStyle = o.colorDots[stack[i]];
        ctx.fillRect(i * m, 0, m + width * 0.005, 10);
    }
    ctx.restore();
};
const drawWorld = (ctx, grid, cells, snake, stack, o) => {
    ctx.save();
    ctx.translate(1 * o.sizeCell, 2 * o.sizeCell);
    (0,_drawGrid__WEBPACK_IMPORTED_MODULE_0__.drawGrid)(ctx, grid, cells, o);
    (0,_drawSnake__WEBPACK_IMPORTED_MODULE_1__.drawSnake)(ctx, snake, o);
    ctx.restore();
    ctx.save();
    ctx.translate(o.sizeCell, (grid.height + 4) * o.sizeCell);
    const max = grid.data.reduce((sum, x) => sum + +!!x, stack.length);
    drawStack(ctx, stack, max, grid.width * o.sizeCell, o);
    ctx.restore();
    // ctx.save();
    // ctx.translate(o.sizeCell + 100, (grid.height + 4) * o.sizeCell + 100);
    // ctx.scale(0.6, 0.6);
    // drawCircleStack(ctx, stack, o);
    // ctx.restore();
};
const drawLerpWorld = (ctx, grid, cells, snake0, snake1, stack, k, o) => {
    ctx.save();
    ctx.translate(1 * o.sizeCell, 2 * o.sizeCell);
    (0,_drawGrid__WEBPACK_IMPORTED_MODULE_0__.drawGrid)(ctx, grid, cells, o);
    (0,_drawSnake__WEBPACK_IMPORTED_MODULE_1__.drawSnakeLerp)(ctx, snake0, snake1, k, o);
    ctx.translate(0, (grid.height + 2) * o.sizeCell);
    const max = grid.data.reduce((sum, x) => sum + +!!x, stack.length);
    drawStack(ctx, stack, max, grid.width * o.sizeCell, o);
    ctx.restore();
};
const getCanvasWorldSize = (grid, o) => {
    const width = o.sizeCell * (grid.width + 2);
    const height = o.sizeCell * (grid.height + 4) + 30;
    return { width, height };
};


/***/ }),

/***/ "../draw/pathRoundedRect.ts":
/*!**********************************!*\
  !*** ../draw/pathRoundedRect.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pathRoundedRect": () => (/* binding */ pathRoundedRect)
/* harmony export */ });
const pathRoundedRect = (ctx, width, height, borderRadius) => {
    ctx.moveTo(borderRadius, 0);
    ctx.arcTo(width, 0, width, height, borderRadius);
    ctx.arcTo(width, height, 0, height, borderRadius);
    ctx.arcTo(0, height, 0, 0, borderRadius);
    ctx.arcTo(0, 0, width, 0, borderRadius);
};


/***/ }),

/***/ "../solver/step.ts":
/*!*************************!*\
  !*** ../solver/step.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "step": () => (/* binding */ step)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");


const step = (grid, stack, snake) => {
    const x = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadX)(snake);
    const y = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadY)(snake);
    const color = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y);
    if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) && !(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(color)) {
        stack.push(color);
        (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(grid, x, y);
    }
};


/***/ }),

/***/ "../svg-creator/css-utils.ts":
/*!***********************************!*\
  !*** ../svg-creator/css-utils.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createAnimation": () => (/* binding */ createAnimation),
/* harmony export */   "minifyCss": () => (/* binding */ minifyCss)
/* harmony export */ });
const percent = (x) => parseFloat((x * 100).toFixed(2)).toString() + "%";
const mergeKeyFrames = (keyframes) => {
    var _a;
    const s = new Map();
    for (const { t, style } of keyframes) {
        s.set(style, [...((_a = s.get(style)) !== null && _a !== void 0 ? _a : []), t]);
    }
    return Array.from(s.entries())
        .map(([style, ts]) => ({ style, ts }))
        .sort((a, b) => a.ts[0] - b.ts[0]);
};
/**
 * generate the keyframe animation from a list of keyframe
 */
const createAnimation = (name, keyframes) => `@keyframes ${name}{` +
    mergeKeyFrames(keyframes)
        .map(({ style, ts }) => ts.map(percent).join(",") + `{${style}}`)
        .join("") +
    "}";
/**
 * remove white spaces
 */
const minifyCss = (css) => css
    .replace(/\s+/g, " ")
    .replace(/.\s+[,;:{}()]/g, (a) => a.replace(/\s+/g, ""))
    .replace(/[,;:{}()]\s+./g, (a) => a.replace(/\s+/g, ""))
    .replace(/.\s+[,;:{}()]/g, (a) => a.replace(/\s+/g, ""))
    .replace(/[,;:{}()]\s+./g, (a) => a.replace(/\s+/g, ""))
    .replace(/\;\s*\}/g, "}")
    .trim();


/***/ }),

/***/ "../svg-creator/grid.ts":
/*!******************************!*\
  !*** ../svg-creator/grid.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createGrid": () => (/* binding */ createGrid)
/* harmony export */ });
/* harmony import */ var _css_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css-utils */ "../svg-creator/css-utils.ts");
/* harmony import */ var _xml_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./xml-utils */ "../svg-creator/xml-utils.ts");


const createGrid = (cells, { sizeDotBorderRadius, sizeDot, sizeCell }, duration) => {
    const svgElements = [];
    const styles = [
        `.c{
      shape-rendering: geometricPrecision;
      fill: var(--ce);
      stroke-width: 1px;
      stroke: var(--cb);
      animation: none ${duration}ms linear infinite;
      width: ${sizeDot}px;
      height: ${sizeDot}px;
    }`,
    ];
    let i = 0;
    for (const { x, y, color, t } of cells) {
        const id = t && "c" + (i++).toString(36);
        const m = (sizeCell - sizeDot) / 2;
        if (t !== null && id) {
            const animationName = id;
            styles.push((0,_css_utils__WEBPACK_IMPORTED_MODULE_0__.createAnimation)(animationName, [
                { t: t - 0.0001, style: `fill:var(--c${color})` },
                { t: t + 0.0001, style: `fill:var(--ce)` },
                { t: 1, style: `fill:var(--ce)` },
            ]), `.c.${id}{
          fill: var(--c${color});
          animation-name: ${animationName}
        }`);
        }
        svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", {
            class: ["c", id].filter(Boolean).join(" "),
            x: x * sizeCell + m,
            y: y * sizeCell + m,
            rx: sizeDotBorderRadius,
            ry: sizeDotBorderRadius,
        }));
    }
    return { svgElements, styles };
};


/***/ }),

/***/ "../svg-creator/index.ts":
/*!*******************************!*\
  !*** ../svg-creator/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createSvg": () => (/* binding */ createSvg)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _snake__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./snake */ "../svg-creator/snake.ts");
/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./grid */ "../svg-creator/grid.ts");
/* harmony import */ var _stack__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./stack */ "../svg-creator/stack.ts");
/* harmony import */ var _xml_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./xml-utils */ "../svg-creator/xml-utils.ts");
/* harmony import */ var _css_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./css-utils */ "../svg-creator/css-utils.ts");







const getCellsFromGrid = ({ width, height }) => Array.from({ length: width }, (_, x) => Array.from({ length: height }, (_, y) => ({ x, y }))).flat();
const createLivingCells = (grid0, chain, cells) => {
    const livingCells = (cells !== null && cells !== void 0 ? cells : getCellsFromGrid(grid0)).map(({ x, y }) => ({
        x,
        y,
        t: null,
        color: (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid0, x, y),
    }));
    const grid = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.copyGrid)(grid0);
    for (let i = 0; i < chain.length; i++) {
        const snake = chain[i];
        const x = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadX)(snake);
        const y = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadY)(snake);
        if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) && !(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y))) {
            (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(grid, x, y);
            const cell = livingCells.find((c) => c.x === x && c.y === y);
            cell.t = i / chain.length;
        }
    }
    return livingCells;
};
const createSvg = (grid, cells, chain, drawOptions, animationOptions) => {
    const width = (grid.width + 2) * drawOptions.sizeCell;
    const height = (grid.height + 5) * drawOptions.sizeCell;
    const duration = animationOptions.frameDuration * chain.length;
    const livingCells = createLivingCells(grid, chain, cells);
    const elements = [
        (0,_grid__WEBPACK_IMPORTED_MODULE_3__.createGrid)(livingCells, drawOptions, duration),
        (0,_stack__WEBPACK_IMPORTED_MODULE_4__.createStack)(livingCells, drawOptions, grid.width * drawOptions.sizeCell, (grid.height + 2) * drawOptions.sizeCell, duration),
        (0,_snake__WEBPACK_IMPORTED_MODULE_2__.createSnake)(chain, drawOptions, duration),
    ];
    const viewBox = [
        -drawOptions.sizeCell,
        -drawOptions.sizeCell * 2,
        width,
        height,
    ].join(" ");
    const style = generateColorVar(drawOptions) +
        elements
            .map((e) => e.styles)
            .flat()
            .join("\n");
    const svg = [
        (0,_xml_utils__WEBPACK_IMPORTED_MODULE_5__.h)("svg", {
            viewBox,
            width,
            height,
            xmlns: "http://www.w3.org/2000/svg",
        }).replace("/>", ">"),
        "<desc>",
        "Generated with https://github.com/Platane/snk",
        "</desc>",
        "<style>",
        optimizeCss(style),
        "</style>",
        ...elements.map((e) => e.svgElements).flat(),
        "</svg>",
    ].join("");
    return optimizeSvg(svg);
};
const optimizeCss = (css) => (0,_css_utils__WEBPACK_IMPORTED_MODULE_6__.minifyCss)(css);
const optimizeSvg = (svg) => svg;
const generateColorVar = (drawOptions) => `
    :root {
    --cb: ${drawOptions.colorDotBorder};
    --cs: ${drawOptions.colorSnake};
    --ce: ${drawOptions.colorEmpty};
    ${Object.entries(drawOptions.colorDots)
    .map(([i, color]) => `--c${i}:${color};`)
    .join("")}
    }
    ` +
    (drawOptions.dark
        ? `
    @media (prefers-color-scheme: dark) {
      :root {
        --cb: ${drawOptions.dark.colorDotBorder || drawOptions.colorDotBorder};
        --cs: ${drawOptions.dark.colorSnake || drawOptions.colorSnake};
        --ce: ${drawOptions.dark.colorEmpty};
        ${Object.entries(drawOptions.dark.colorDots)
            .map(([i, color]) => `--c${i}:${color};`)
            .join("")}
      }
    }
`
        : "");


/***/ }),

/***/ "../svg-creator/snake.ts":
/*!*******************************!*\
  !*** ../svg-creator/snake.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createSnake": () => (/* binding */ createSnake)
/* harmony export */ });
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _xml_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./xml-utils */ "../svg-creator/xml-utils.ts");
/* harmony import */ var _css_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css-utils */ "../svg-creator/css-utils.ts");



const lerp = (k, a, b) => (1 - k) * a + k * b;
const createSnake = (chain, { sizeCell, sizeDot }, duration) => {
    const snakeN = chain[0] ? (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getSnakeLength)(chain[0]) : 0;
    const snakeParts = Array.from({ length: snakeN }, () => []);
    for (const snake of chain) {
        const cells = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.snakeToCells)(snake);
        for (let i = cells.length; i--;)
            snakeParts[i].push(cells[i]);
    }
    const svgElements = snakeParts.map((_, i, { length }) => {
        // compute snake part size
        const dMin = sizeDot * 0.8;
        const dMax = sizeCell * 0.9;
        const iMax = Math.min(4, length);
        const u = (1 - Math.min(i, iMax) / iMax) ** 2;
        const s = lerp(u, dMin, dMax);
        const m = (sizeCell - s) / 2;
        const r = Math.min(4.5, (4 * s) / sizeDot);
        return (0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", {
            class: `s s${i}`,
            x: m.toFixed(1),
            y: m.toFixed(1),
            width: s.toFixed(1),
            height: s.toFixed(1),
            rx: r.toFixed(1),
            ry: r.toFixed(1),
        });
    });
    const transform = ({ x, y }) => `transform:translate(${x * sizeCell}px,${y * sizeCell}px)`;
    const styles = [
        `.s{ 
      shape-rendering: geometricPrecision;
      fill: var(--cs);
      animation: none linear ${duration}ms infinite
    }`,
        ...snakeParts.map((positions, i) => {
            const id = `s${i}`;
            const animationName = id;
            const keyframes = removeInterpolatedPositions(positions.map((tr, i, { length }) => ({ ...tr, t: i / length }))).map(({ t, ...p }) => ({ t, style: transform(p) }));
            return [
                (0,_css_utils__WEBPACK_IMPORTED_MODULE_2__.createAnimation)(animationName, keyframes),
                `.s.${id}{
          ${transform(positions[0])};
          animation-name: ${animationName}
        }`,
            ];
        }),
    ].flat();
    return { svgElements, styles };
};
const removeInterpolatedPositions = (arr) => arr.filter((u, i, arr) => {
    if (i - 1 < 0 || i + 1 >= arr.length)
        return true;
    const a = arr[i - 1];
    const b = arr[i + 1];
    const ex = (a.x + b.x) / 2;
    const ey = (a.y + b.y) / 2;
    // return true;
    return !(Math.abs(ex - u.x) < 0.01 && Math.abs(ey - u.y) < 0.01);
});


/***/ }),

/***/ "../svg-creator/stack.ts":
/*!*******************************!*\
  !*** ../svg-creator/stack.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createStack": () => (/* binding */ createStack)
/* harmony export */ });
/* harmony import */ var _css_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css-utils */ "../svg-creator/css-utils.ts");
/* harmony import */ var _xml_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./xml-utils */ "../svg-creator/xml-utils.ts");


const createStack = (cells, { sizeDot }, width, y, duration) => {
    const svgElements = [];
    const styles = [
        `.u{ 
      transform-origin: 0 0;
      transform: scale(0,1);
      animation: none linear ${duration}ms infinite;
    }`,
    ];
    const stack = cells
        .slice()
        .filter((a) => a.t !== null)
        .sort((a, b) => a.t - b.t);
    const blocks = [];
    stack.forEach(({ color, t }) => {
        const latest = blocks[blocks.length - 1];
        if ((latest === null || latest === void 0 ? void 0 : latest.color) === color)
            latest.ts.push(t);
        else
            blocks.push({ color, ts: [t] });
    });
    const m = width / stack.length;
    let i = 0;
    let nx = 0;
    for (const { color, ts } of blocks) {
        const id = "u" + (i++).toString(36);
        const animationName = id;
        const x = (nx * m).toFixed(1);
        nx += ts.length;
        svgElements.push((0,_xml_utils__WEBPACK_IMPORTED_MODULE_1__.h)("rect", {
            class: `u ${id}`,
            height: sizeDot,
            width: (ts.length * m + 0.6).toFixed(1),
            x,
            y,
        }));
        styles.push((0,_css_utils__WEBPACK_IMPORTED_MODULE_0__.createAnimation)(animationName, [
            ...ts
                .map((t, i, { length }) => [
                { scale: i / length, t: t - 0.0001 },
                { scale: (i + 1) / length, t: t + 0.0001 },
            ])
                .flat(),
            { scale: 1, t: 1 },
        ].map(({ scale, t }) => ({
            t,
            style: `transform:scale(${scale.toFixed(3)},1)`,
        }))), `.u.${id} {
        fill: var(--c${color});
        animation-name: ${animationName};
        transform-origin: ${x}px 0
      }
      `);
    }
    return { svgElements, styles };
};


/***/ }),

/***/ "../svg-creator/xml-utils.ts":
/*!***********************************!*\
  !*** ../svg-creator/xml-utils.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "h": () => (/* binding */ h),
/* harmony export */   "toAttribute": () => (/* binding */ toAttribute)
/* harmony export */ });
const h = (element, attributes) => `<${element} ${toAttribute(attributes)}/>`;
const toAttribute = (o) => Object.entries(o)
    .filter(([, value]) => value !== null)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");


/***/ }),

/***/ "../types/grid.ts":
/*!************************!*\
  !*** ../types/grid.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "copyGrid": () => (/* binding */ copyGrid),
/* harmony export */   "createEmptyGrid": () => (/* binding */ createEmptyGrid),
/* harmony export */   "getColor": () => (/* binding */ getColor),
/* harmony export */   "gridEquals": () => (/* binding */ gridEquals),
/* harmony export */   "isEmpty": () => (/* binding */ isEmpty),
/* harmony export */   "isGridEmpty": () => (/* binding */ isGridEmpty),
/* harmony export */   "isInside": () => (/* binding */ isInside),
/* harmony export */   "isInsideLarge": () => (/* binding */ isInsideLarge),
/* harmony export */   "setColor": () => (/* binding */ setColor),
/* harmony export */   "setColorEmpty": () => (/* binding */ setColorEmpty)
/* harmony export */ });
const isInside = (grid, x, y) => x >= 0 && y >= 0 && x < grid.width && y < grid.height;
const isInsideLarge = (grid, m, x, y) => x >= -m && y >= -m && x < grid.width + m && y < grid.height + m;
const copyGrid = ({ width, height, data }) => ({
    width,
    height,
    data: Uint8Array.from(data),
});
const getIndex = (grid, x, y) => x * grid.height + y;
const getColor = (grid, x, y) => grid.data[getIndex(grid, x, y)];
const isEmpty = (color) => color === 0;
const setColor = (grid, x, y, color) => {
    grid.data[getIndex(grid, x, y)] = color || 0;
};
const setColorEmpty = (grid, x, y) => {
    setColor(grid, x, y, 0);
};
/**
 * return true if the grid is empty
 */
const isGridEmpty = (grid) => grid.data.every((x) => x === 0);
const gridEquals = (a, b) => a.data.every((_, i) => a.data[i] === b.data[i]);
const createEmptyGrid = (width, height) => ({
    width,
    height,
    data: new Uint8Array(width * height),
});


/***/ }),

/***/ "../types/snake.ts":
/*!*************************!*\
  !*** ../types/snake.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "copySnake": () => (/* binding */ copySnake),
/* harmony export */   "createSnakeFromCells": () => (/* binding */ createSnakeFromCells),
/* harmony export */   "getHeadX": () => (/* binding */ getHeadX),
/* harmony export */   "getHeadY": () => (/* binding */ getHeadY),
/* harmony export */   "getSnakeLength": () => (/* binding */ getSnakeLength),
/* harmony export */   "nextSnake": () => (/* binding */ nextSnake),
/* harmony export */   "snakeEquals": () => (/* binding */ snakeEquals),
/* harmony export */   "snakeToCells": () => (/* binding */ snakeToCells),
/* harmony export */   "snakeWillSelfCollide": () => (/* binding */ snakeWillSelfCollide)
/* harmony export */ });
const getHeadX = (snake) => snake[0] - 2;
const getHeadY = (snake) => snake[1] - 2;
const getSnakeLength = (snake) => snake.length / 2;
const copySnake = (snake) => snake.slice();
const snakeEquals = (a, b) => {
    for (let i = 0; i < a.length; i++)
        if (a[i] !== b[i])
            return false;
    return true;
};
/**
 * return a copy of the next snake, considering that dx, dy is the direction
 */
const nextSnake = (snake, dx, dy) => {
    const copy = new Uint8Array(snake.length);
    for (let i = 2; i < snake.length; i++)
        copy[i] = snake[i - 2];
    copy[0] = snake[0] + dx;
    copy[1] = snake[1] + dy;
    return copy;
};
/**
 * return true if the next snake will collide with itself
 */
const snakeWillSelfCollide = (snake, dx, dy) => {
    const nx = snake[0] + dx;
    const ny = snake[1] + dy;
    for (let i = 2; i < snake.length - 2; i += 2)
        if (snake[i + 0] === nx && snake[i + 1] === ny)
            return true;
    return false;
};
const snakeToCells = (snake) => Array.from({ length: snake.length / 2 }, (_, i) => ({
    x: snake[i * 2 + 0] - 2,
    y: snake[i * 2 + 1] - 2,
}));
const createSnakeFromCells = (points) => {
    const snake = new Uint8Array(points.length * 2);
    for (let i = points.length; i--;) {
        snake[i * 2 + 0] = points[i].x + 2;
        snake[i * 2 + 1] = points[i].y + 2;
    }
    return snake;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + "d290bb7f144da7140603" + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"interactive": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./demo.interactive.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_solver_step__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/solver/step */ "../solver/step.ts");
/* harmony import */ var _springUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./springUtils */ "./springUtils.ts");
/* harmony import */ var _snk_draw_drawWorld__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @snk/draw/drawWorld */ "../draw/drawWorld.ts");
/* harmony import */ var _snk_action_userContributionToGrid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @snk/action/userContributionToGrid */ "../action/userContributionToGrid.ts");
/* harmony import */ var _snk_svg_creator__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @snk/svg-creator */ "../svg-creator/index.ts");
/* harmony import */ var _worker_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./worker-utils */ "./worker-utils.ts");
/* harmony import */ var _snk_action_palettes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @snk/action/palettes */ "../action/palettes.ts");








const createForm = ({ onSubmit, onChangeUserName, }) => {
    const form = document.createElement("form");
    form.style.position = "relative";
    form.style.display = "flex";
    form.style.flexDirection = "row";
    const input = document.createElement("input");
    input.addEventListener("input", () => onChangeUserName(input.value));
    input.style.padding = "16px";
    input.placeholder = "github user";
    const submit = document.createElement("button");
    submit.style.padding = "16px";
    submit.type = "submit";
    submit.innerText = "ok";
    const label = document.createElement("label");
    label.style.position = "absolute";
    label.style.textAlign = "center";
    label.style.top = "60px";
    label.style.left = "0";
    label.style.right = "0";
    form.appendChild(input);
    form.appendChild(submit);
    document.body.appendChild(form);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        onSubmit(input.value)
            .finally(() => {
            clearTimeout(timeout);
        })
            .catch((err) => {
            label.innerText = "error :(";
            throw err;
        });
        input.disabled = true;
        submit.disabled = true;
        form.appendChild(label);
        label.innerText = "loading ...";
        const timeout = setTimeout(() => {
            label.innerText = "loading ( it might take a while ) ... ";
        }, 5000);
    });
    //
    // dispose
    const dispose = () => {
        document.body.removeChild(form);
    };
    return { dispose };
};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const createGithubProfile = () => {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.opacity = "0";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.height = "120px";
    container.style.alignItems = "flex-start";
    const image = document.createElement("img");
    image.style.width = "100px";
    image.style.height = "100px";
    image.style.borderRadius = "50px";
    const name = document.createElement("a");
    name.style.padding = "4px 0 0 0";
    document.body.appendChild(container);
    container.appendChild(image);
    container.appendChild(name);
    image.addEventListener("load", () => {
        container.style.opacity = "1";
    });
    const onChangeUser = (userName) => {
        container.style.opacity = "0";
        name.innerText = userName;
        name.href = `https://github.com/${userName}`;
        image.src = `https://github.com/${userName}.png`;
    };
    const dispose = () => {
        document.body.removeChild(container);
    };
    return { dispose, onChangeUser };
};
const createViewer = ({ grid0, chain, cells, }) => {
    const drawOptions = {
        sizeDotBorderRadius: 2,
        sizeCell: 16,
        sizeDot: 12,
        ..._snk_action_palettes__WEBPACK_IMPORTED_MODULE_7__.basePalettes["github-light"],
    };
    //
    // canvas
    const canvas = document.createElement("canvas");
    const { width, height } = (0,_snk_draw_drawWorld__WEBPACK_IMPORTED_MODULE_3__.getCanvasWorldSize)(grid0, drawOptions);
    canvas.width = width;
    canvas.height = height;
    const w = Math.min(width, window.innerWidth);
    const h = (height / width) * w;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
    //
    // draw
    let animationFrame;
    const spring = { x: 0, v: 0, target: 0 };
    const springParams = { tension: 120, friction: 20, maxVelocity: 50 };
    const ctx = canvas.getContext("2d");
    const loop = () => {
        cancelAnimationFrame(animationFrame);
        (0,_springUtils__WEBPACK_IMPORTED_MODULE_2__.stepSpring)(spring, springParams, spring.target);
        const stable = (0,_springUtils__WEBPACK_IMPORTED_MODULE_2__.isStableAndBound)(spring, spring.target);
        const grid = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.copyGrid)(grid0);
        const stack = [];
        for (let i = 0; i < Math.min(chain.length, spring.x); i++)
            (0,_snk_solver_step__WEBPACK_IMPORTED_MODULE_1__.step)(grid, stack, chain[i]);
        const snake0 = chain[clamp(Math.floor(spring.x), 0, chain.length - 1)];
        const snake1 = chain[clamp(Math.ceil(spring.x), 0, chain.length - 1)];
        const k = spring.x % 1;
        ctx.clearRect(0, 0, 9999, 9999);
        (0,_snk_draw_drawWorld__WEBPACK_IMPORTED_MODULE_3__.drawLerpWorld)(ctx, grid, cells, snake0, snake1, stack, k, drawOptions);
        if (!stable)
            animationFrame = requestAnimationFrame(loop);
    };
    loop();
    //
    // controls
    const input = document.createElement("input");
    input.type = "range";
    input.value = "0";
    input.step = "1";
    input.min = "0";
    input.max = "" + chain.length;
    input.style.width = "calc( 100% - 20px )";
    input.addEventListener("input", () => {
        spring.target = +input.value;
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(loop);
    });
    const onClickBackground = (e) => {
        if (e.target === document.body || e.target === document.body.parentElement)
            input.focus();
    };
    window.addEventListener("click", onClickBackground);
    document.body.append(input);
    //
    const schemaSelect = document.createElement("select");
    schemaSelect.style.margin = "10px";
    schemaSelect.style.alignSelf = "flex-start";
    schemaSelect.value = "github-light";
    schemaSelect.addEventListener("change", () => {
        var _a, _b;
        Object.assign(drawOptions, _snk_action_palettes__WEBPACK_IMPORTED_MODULE_7__.basePalettes[schemaSelect.value]);
        svgString = (0,_snk_svg_creator__WEBPACK_IMPORTED_MODULE_5__.createSvg)(grid0, cells, chain, drawOptions, {
            frameDuration: 100,
        });
        const svgImageUri = `data:image/*;charset=utf-8;base64,${btoa(svgString)}`;
        svgLink.href = svgImageUri;
        if (schemaSelect.value.includes("dark"))
            (_a = document.body.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add("dark-mode");
        else
            (_b = document.body.parentElement) === null || _b === void 0 ? void 0 : _b.classList.remove("dark-mode");
        loop();
    });
    for (const name of Object.keys(_snk_action_palettes__WEBPACK_IMPORTED_MODULE_7__.basePalettes)) {
        const option = document.createElement("option");
        option.value = name;
        option.innerText = name;
        schemaSelect.appendChild(option);
    }
    document.body.append(schemaSelect);
    //
    // dark mode
    const style = document.createElement("style");
    style.innerText = `
  html { transition:background-color 180ms }
  a { transition:color 180ms }
  html.dark-mode{ background-color:#0d1117 }
  html.dark-mode a{ color:rgb(201, 209, 217) }
  `;
    document.head.append(style);
    //
    // svg
    const svgLink = document.createElement("a");
    let svgString = (0,_snk_svg_creator__WEBPACK_IMPORTED_MODULE_5__.createSvg)(grid0, cells, chain, drawOptions, {
        frameDuration: 100,
    });
    const svgImageUri = `data:image/*;charset=utf-8;base64,${btoa(svgString)}`;
    svgLink.href = svgImageUri;
    svgLink.innerText = "github-user-contribution.svg";
    svgLink.download = "github-user-contribution.svg";
    svgLink.addEventListener("click", (e) => {
        var _a;
        const w = window.open("");
        w.document.write((((_a = document.body.parentElement) === null || _a === void 0 ? void 0 : _a.classList.contains("dark-mode"))
            ? "<style>html{ background-color:#0d1117 }</style>"
            : "") +
            `<a href="${svgLink.href}" download="github-user-contribution.svg">` +
            svgString +
            "<a/>");
        e.preventDefault();
    });
    svgLink.style.padding = "20px";
    svgLink.style.paddingTop = "60px";
    svgLink.style.alignSelf = "flex-start";
    document.body.append(svgLink);
    //
    // dispose
    const dispose = () => {
        window.removeEventListener("click", onClickBackground);
        cancelAnimationFrame(animationFrame);
        document.body.removeChild(canvas);
        document.body.removeChild(input);
        document.body.removeChild(svgLink);
    };
    return { dispose };
};
const onSubmit = async (userName) => {
    const res = await fetch("https://snk-one.vercel.app/api/github-user-contribution/" + userName);
    const cells = (await res.json());
    const grid = (0,_snk_action_userContributionToGrid__WEBPACK_IMPORTED_MODULE_4__.userContributionToGrid)(cells);
    const chain = await getChain(grid);
    dispose();
    createViewer({ grid0: grid, chain, cells });
};
const worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u("demo_interactive_worker_ts"), __webpack_require__.b));
const { getChain } = (0,_worker_utils__WEBPACK_IMPORTED_MODULE_6__.createRpcClient)(worker);
const profile = createGithubProfile();
const { dispose } = createForm({
    onSubmit,
    onChangeUserName: profile.onChangeUser,
});
document.body.style.margin = "0";
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.alignItems = "center";
document.body.style.justifyContent = "center";
document.body.style.height = "100%";
document.body.style.width = "100%";
document.body.style.position = "absolute";

})();

/******/ })()
;