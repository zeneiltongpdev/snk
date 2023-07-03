/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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

/***/ "../solver/clearCleanColoredLayer.ts":
/*!*******************************************!*\
  !*** ../solver/clearCleanColoredLayer.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clearCleanColoredLayer": () => (/* binding */ clearCleanColoredLayer),
/* harmony export */   "getTunnellablePoints": () => (/* binding */ getTunnellablePoints)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _snk_types_point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @snk/types/point */ "../types/point.ts");
/* harmony import */ var _getBestTunnel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./getBestTunnel */ "../solver/getBestTunnel.ts");
/* harmony import */ var _outside__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./outside */ "../solver/outside.ts");





const clearCleanColoredLayer = (grid, outside, snake0, color) => {
    const snakeN = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getSnakeLength)(snake0);
    const points = getTunnellablePoints(grid, outside, snakeN, color);
    const chain = [snake0];
    while (points.length) {
        const path = getPathToNextPoint(grid, chain[0], color, points);
        path.pop();
        for (const snake of path)
            setEmptySafe(grid, (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadX)(snake), (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadY)(snake));
        chain.unshift(...path);
    }
    (0,_outside__WEBPACK_IMPORTED_MODULE_4__.fillOutside)(outside, grid);
    chain.pop();
    return chain;
};
const unwrap = (m) => !m ? [] : [m.snake, ...unwrap(m.parent)];
const getPathToNextPoint = (grid, snake0, color, points) => {
    const closeList = [];
    const openList = [{ snake: snake0 }];
    while (openList.length) {
        const o = openList.shift();
        const x = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadX)(o.snake);
        const y = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadY)(o.snake);
        const i = points.findIndex((p) => p.x === x && p.y === y);
        if (i >= 0) {
            points.splice(i, 1);
            return unwrap(o);
        }
        for (const { x: dx, y: dy } of _snk_types_point__WEBPACK_IMPORTED_MODULE_2__.around4) {
            if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInsideLarge)(grid, 2, x + dx, y + dy) &&
                !(0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.snakeWillSelfCollide)(o.snake, dx, dy) &&
                getColorSafe(grid, x + dx, y + dy) <= color) {
                const snake = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.nextSnake)(o.snake, dx, dy);
                if (!closeList.some((s0) => (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.snakeEquals)(s0, snake))) {
                    closeList.push(snake);
                    openList.push({ snake, parent: o });
                }
            }
        }
    }
};
/**
 * get all cells that are tunnellable
 */
const getTunnellablePoints = (grid, outside, snakeN, color) => {
    const points = [];
    for (let x = grid.width; x--;)
        for (let y = grid.height; y--;) {
            const c = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y);
            if (!(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(c) &&
                c <= color &&
                !points.some((p) => p.x === x && p.y === y)) {
                const tunnel = (0,_getBestTunnel__WEBPACK_IMPORTED_MODULE_3__.getBestTunnel)(grid, outside, x, y, color, snakeN);
                if (tunnel)
                    for (const p of tunnel)
                        if (!isEmptySafe(grid, p.x, p.y))
                            points.push(p);
            }
        }
    return points;
};
const getColorSafe = (grid, x, y) => (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) ? (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y) : 0;
const setEmptySafe = (grid, x, y) => {
    if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y))
        (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(grid, x, y);
};
const isEmptySafe = (grid, x, y) => !(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) && (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y));


/***/ }),

/***/ "../solver/clearResidualColoredLayer.ts":
/*!**********************************************!*\
  !*** ../solver/clearResidualColoredLayer.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clearResidualColoredLayer": () => (/* binding */ clearResidualColoredLayer),
/* harmony export */   "getPriority": () => (/* binding */ getPriority),
/* harmony export */   "getTunnellablePoints": () => (/* binding */ getTunnellablePoints)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _getBestTunnel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getBestTunnel */ "../solver/getBestTunnel.ts");
/* harmony import */ var _outside__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./outside */ "../solver/outside.ts");
/* harmony import */ var _tunnel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tunnel */ "../solver/tunnel.ts");
/* harmony import */ var _getPathTo__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./getPathTo */ "../solver/getPathTo.ts");






const clearResidualColoredLayer = (grid, outside, snake0, color) => {
    const snakeN = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getSnakeLength)(snake0);
    const tunnels = getTunnellablePoints(grid, outside, snakeN, color);
    // sort
    tunnels.sort((a, b) => b.priority - a.priority);
    const chain = [snake0];
    while (tunnels.length) {
        // get the best next tunnel
        let t = getNextTunnel(tunnels, chain[0]);
        // goes to the start of the tunnel
        chain.unshift(...(0,_getPathTo__WEBPACK_IMPORTED_MODULE_5__.getPathTo)(grid, chain[0], t[0].x, t[0].y));
        // goes to the end of the tunnel
        chain.unshift(...(0,_tunnel__WEBPACK_IMPORTED_MODULE_4__.getTunnelPath)(chain[0], t));
        // update grid
        for (const { x, y } of t)
            setEmptySafe(grid, x, y);
        // update outside
        (0,_outside__WEBPACK_IMPORTED_MODULE_3__.fillOutside)(outside, grid);
        // update tunnels
        for (let i = tunnels.length; i--;)
            if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, tunnels[i].x, tunnels[i].y)))
                tunnels.splice(i, 1);
            else {
                const t = tunnels[i];
                const tunnel = (0,_getBestTunnel__WEBPACK_IMPORTED_MODULE_2__.getBestTunnel)(grid, outside, t.x, t.y, color, snakeN);
                if (!tunnel)
                    tunnels.splice(i, 1);
                else {
                    t.tunnel = tunnel;
                    t.priority = getPriority(grid, color, tunnel);
                }
            }
        // re-sort
        tunnels.sort((a, b) => b.priority - a.priority);
    }
    chain.pop();
    return chain;
};
const getNextTunnel = (ts, snake) => {
    let minDistance = Infinity;
    let closestTunnel = null;
    const x = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadX)(snake);
    const y = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadY)(snake);
    const priority = ts[0].priority;
    for (let i = 0; ts[i] && ts[i].priority === priority; i++) {
        const t = ts[i].tunnel;
        const d = distanceSq(t[0].x, t[0].y, x, y);
        if (d < minDistance) {
            minDistance = d;
            closestTunnel = t;
        }
    }
    return closestTunnel;
};
/**
 * get all the tunnels for all the cells accessible
 */
const getTunnellablePoints = (grid, outside, snakeN, color) => {
    const points = [];
    for (let x = grid.width; x--;)
        for (let y = grid.height; y--;) {
            const c = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y);
            if (!(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(c) && c < color) {
                const tunnel = (0,_getBestTunnel__WEBPACK_IMPORTED_MODULE_2__.getBestTunnel)(grid, outside, x, y, color, snakeN);
                if (tunnel) {
                    const priority = getPriority(grid, color, tunnel);
                    points.push({ x, y, priority, tunnel });
                }
            }
        }
    return points;
};
/**
 * get the score of the tunnel
 * prioritize tunnel with maximum color smaller than <color> and with minimum <color>
 * with some tweaks
 */
const getPriority = (grid, color, tunnel) => {
    let nColor = 0;
    let nLess = 0;
    for (let i = 0; i < tunnel.length; i++) {
        const { x, y } = tunnel[i];
        const c = getColorSafe(grid, x, y);
        if (!(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)(c) && i === tunnel.findIndex((p) => p.x === x && p.y === y)) {
            if (c === color)
                nColor += 1;
            else
                nLess += color - c;
        }
    }
    if (nColor === 0)
        return 99999;
    return nLess / nColor;
};
const distanceSq = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
const getColorSafe = (grid, x, y) => (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) ? (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y) : 0;
const setEmptySafe = (grid, x, y) => {
    if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y))
        (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(grid, x, y);
};


/***/ }),

/***/ "../solver/getBestRoute.ts":
/*!*********************************!*\
  !*** ../solver/getBestRoute.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBestRoute": () => (/* binding */ getBestRoute)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _outside__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./outside */ "../solver/outside.ts");
/* harmony import */ var _clearResidualColoredLayer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./clearResidualColoredLayer */ "../solver/clearResidualColoredLayer.ts");
/* harmony import */ var _clearCleanColoredLayer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./clearCleanColoredLayer */ "../solver/clearCleanColoredLayer.ts");




const getBestRoute = (grid0, snake0) => {
    const grid = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.copyGrid)(grid0);
    const outside = (0,_outside__WEBPACK_IMPORTED_MODULE_1__.createOutside)(grid);
    const chain = [snake0];
    for (const color of extractColors(grid)) {
        if (color > 1)
            chain.unshift(...(0,_clearResidualColoredLayer__WEBPACK_IMPORTED_MODULE_2__.clearResidualColoredLayer)(grid, outside, chain[0], color));
        chain.unshift(...(0,_clearCleanColoredLayer__WEBPACK_IMPORTED_MODULE_3__.clearCleanColoredLayer)(grid, outside, chain[0], color));
    }
    return chain.reverse();
};
const extractColors = (grid) => {
    // @ts-ignore
    let maxColor = Math.max(...grid.data);
    return Array.from({ length: maxColor }, (_, i) => (i + 1));
};


/***/ }),

/***/ "../solver/getBestTunnel.ts":
/*!**********************************!*\
  !*** ../solver/getBestTunnel.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBestTunnel": () => (/* binding */ getBestTunnel)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_point__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/point */ "../types/point.ts");
/* harmony import */ var _utils_sortPush__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/sortPush */ "../solver/utils/sortPush.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _outside__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./outside */ "../solver/outside.ts");
/* harmony import */ var _tunnel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./tunnel */ "../solver/tunnel.ts");






const getColorSafe = (grid, x, y) => (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) ? (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y) : 0;
const setEmptySafe = (grid, x, y) => {
    if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y))
        (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(grid, x, y);
};
const unwrap = (m) => !m
    ? []
    : [...unwrap(m.parent), { x: (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.getHeadX)(m.snake), y: (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.getHeadY)(m.snake) }];
/**
 * returns the path to reach the outside which contains the least color cell
 */
const getSnakeEscapePath = (grid, outside, snake0, color) => {
    const openList = [{ snake: snake0, w: 0 }];
    const closeList = [];
    while (openList[0]) {
        const o = openList.shift();
        const x = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.getHeadX)(o.snake);
        const y = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.getHeadY)(o.snake);
        if ((0,_outside__WEBPACK_IMPORTED_MODULE_4__.isOutside)(outside, x, y))
            return unwrap(o);
        for (const a of _snk_types_point__WEBPACK_IMPORTED_MODULE_1__.around4) {
            const c = getColorSafe(grid, x + a.x, y + a.y);
            if (c <= color && !(0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.snakeWillSelfCollide)(o.snake, a.x, a.y)) {
                const snake = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.nextSnake)(o.snake, a.x, a.y);
                if (!closeList.some((s0) => (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.snakeEquals)(s0, snake))) {
                    const w = o.w + 1 + +(c === color) * 1000;
                    (0,_utils_sortPush__WEBPACK_IMPORTED_MODULE_2__.sortPush)(openList, { snake, w, parent: o }, (a, b) => a.w - b.w);
                    closeList.push(snake);
                }
            }
        }
    }
    return null;
};
/**
 * compute the best tunnel to get to the cell and back to the outside ( best = less usage of <color> )
 *
 * notice that it's one of the best tunnels, more with the same score could exist
 */
const getBestTunnel = (grid, outside, x, y, color, snakeN) => {
    const c = { x, y };
    const snake0 = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.createSnakeFromCells)(Array.from({ length: snakeN }, () => c));
    const one = getSnakeEscapePath(grid, outside, snake0, color);
    if (!one)
        return null;
    // get the position of the snake if it was going to leave the x,y cell
    const snakeICells = one.slice(0, snakeN);
    while (snakeICells.length < snakeN)
        snakeICells.push(snakeICells[snakeICells.length - 1]);
    const snakeI = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_3__.createSnakeFromCells)(snakeICells);
    // remove from the grid the colors that one eat
    const gridI = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.copyGrid)(grid);
    for (const { x, y } of one)
        setEmptySafe(gridI, x, y);
    const two = getSnakeEscapePath(gridI, outside, snakeI, color);
    if (!two)
        return null;
    one.shift();
    one.reverse();
    one.push(...two);
    (0,_tunnel__WEBPACK_IMPORTED_MODULE_5__.trimTunnelStart)(grid, one);
    (0,_tunnel__WEBPACK_IMPORTED_MODULE_5__.trimTunnelEnd)(grid, one);
    return one;
};


/***/ }),

/***/ "../solver/getPathTo.ts":
/*!******************************!*\
  !*** ../solver/getPathTo.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPathTo": () => (/* binding */ getPathTo)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_point__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/point */ "../types/point.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _utils_sortPush__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils/sortPush */ "../solver/utils/sortPush.ts");




/**
 * starting from snake0, get to the cell x,y
 * return the snake chain (reversed)
 */
const getPathTo = (grid, snake0, x, y) => {
    const openList = [{ snake: snake0, w: 0 }];
    const closeList = [];
    while (openList.length) {
        const c = openList.shift();
        const cx = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_2__.getHeadX)(c.snake);
        const cy = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_2__.getHeadY)(c.snake);
        for (let i = 0; i < _snk_types_point__WEBPACK_IMPORTED_MODULE_1__.around4.length; i++) {
            const { x: dx, y: dy } = _snk_types_point__WEBPACK_IMPORTED_MODULE_1__.around4[i];
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx === x && ny === y) {
                // unwrap
                const path = [(0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_2__.nextSnake)(c.snake, dx, dy)];
                let e = c;
                while (e.parent) {
                    path.push(e.snake);
                    e = e.parent;
                }
                return path;
            }
            if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInsideLarge)(grid, 2, nx, ny) &&
                !(0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_2__.snakeWillSelfCollide)(c.snake, dx, dy) &&
                (!(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, nx, ny) || (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, nx, ny)))) {
                const nsnake = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_2__.nextSnake)(c.snake, dx, dy);
                if (!closeList.some((s) => (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_2__.snakeEquals)(nsnake, s))) {
                    const w = c.w + 1;
                    const h = Math.abs(nx - x) + Math.abs(ny - y);
                    const f = w + h;
                    const o = { snake: nsnake, parent: c, w, h, f };
                    (0,_utils_sortPush__WEBPACK_IMPORTED_MODULE_3__.sortPush)(openList, o, (a, b) => a.f - b.f);
                    closeList.push(nsnake);
                }
            }
        }
    }
};


/***/ }),

/***/ "../solver/getPathToPose.ts":
/*!**********************************!*\
  !*** ../solver/getPathToPose.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getPathToPose": () => (/* binding */ getPathToPose)
/* harmony export */ });
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _tunnel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tunnel */ "../solver/tunnel.ts");
/* harmony import */ var _snk_types_point__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @snk/types/point */ "../types/point.ts");
/* harmony import */ var _utils_sortPush__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/sortPush */ "../solver/utils/sortPush.ts");





const isEmptySafe = (grid, x, y) => !(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_1__.isInside)(grid, x, y) || (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_1__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_1__.getColor)(grid, x, y));
const getPathToPose = (snake0, target, grid) => {
    if ((0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.snakeEquals)(snake0, target))
        return [];
    const targetCells = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.snakeToCells)(target).reverse();
    const snakeN = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getSnakeLength)(snake0);
    const box = {
        min: {
            x: Math.min((0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadX)(snake0), (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadX)(target)) - snakeN - 1,
            y: Math.min((0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadY)(snake0), (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadY)(target)) - snakeN - 1,
        },
        max: {
            x: Math.max((0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadX)(snake0), (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadX)(target)) + snakeN + 1,
            y: Math.max((0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadY)(snake0), (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadY)(target)) + snakeN + 1,
        },
    };
    const [t0, ...forbidden] = targetCells;
    forbidden.slice(0, 3);
    const openList = [{ snake: snake0, w: 0 }];
    const closeList = [];
    while (openList.length) {
        const o = openList.shift();
        const x = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadX)(o.snake);
        const y = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.getHeadY)(o.snake);
        if (x === t0.x && y === t0.y) {
            const path = [];
            let e = o;
            while (e) {
                path.push(e.snake);
                e = e.parent;
            }
            path.unshift(...(0,_tunnel__WEBPACK_IMPORTED_MODULE_2__.getTunnelPath)(path[0], targetCells));
            path.pop();
            path.reverse();
            return path;
        }
        for (let i = 0; i < _snk_types_point__WEBPACK_IMPORTED_MODULE_3__.around4.length; i++) {
            const { x: dx, y: dy } = _snk_types_point__WEBPACK_IMPORTED_MODULE_3__.around4[i];
            const nx = x + dx;
            const ny = y + dy;
            if (!(0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.snakeWillSelfCollide)(o.snake, dx, dy) &&
                (!grid || isEmptySafe(grid, nx, ny)) &&
                (grid
                    ? (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_1__.isInsideLarge)(grid, 2, nx, ny)
                    : box.min.x <= nx &&
                        nx <= box.max.x &&
                        box.min.y <= ny &&
                        ny <= box.max.y) &&
                !forbidden.some((p) => p.x === nx && p.y === ny)) {
                const snake = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.nextSnake)(o.snake, dx, dy);
                if (!closeList.some((s) => (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_0__.snakeEquals)(snake, s))) {
                    const w = o.w + 1;
                    const h = Math.abs(nx - x) + Math.abs(ny - y);
                    const f = w + h;
                    (0,_utils_sortPush__WEBPACK_IMPORTED_MODULE_4__.sortPush)(openList, { f, w, snake, parent: o }, (a, b) => a.f - b.f);
                    closeList.push(snake);
                }
            }
        }
    }
};


/***/ }),

/***/ "../solver/outside.ts":
/*!****************************!*\
  !*** ../solver/outside.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createOutside": () => (/* binding */ createOutside),
/* harmony export */   "fillOutside": () => (/* binding */ fillOutside),
/* harmony export */   "isOutside": () => (/* binding */ isOutside)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_point__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/point */ "../types/point.ts");


const createOutside = (grid, color = 0) => {
    const outside = (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.createEmptyGrid)(grid.width, grid.height);
    for (let x = outside.width; x--;)
        for (let y = outside.height; y--;)
            (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColor)(outside, x, y, 1);
    fillOutside(outside, grid, color);
    return outside;
};
const fillOutside = (outside, grid, color = 0) => {
    let changed = true;
    while (changed) {
        changed = false;
        for (let x = outside.width; x--;)
            for (let y = outside.height; y--;)
                if ((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y) <= color &&
                    !isOutside(outside, x, y) &&
                    _snk_types_point__WEBPACK_IMPORTED_MODULE_1__.around4.some((a) => isOutside(outside, x + a.x, y + a.y))) {
                    changed = true;
                    (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.setColorEmpty)(outside, x, y);
                }
    }
    return outside;
};
const isOutside = (outside, x, y) => !(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(outside, x, y) || (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(outside, x, y));


/***/ }),

/***/ "../solver/tunnel.ts":
/*!***************************!*\
  !*** ../solver/tunnel.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getTunnelPath": () => (/* binding */ getTunnelPath),
/* harmony export */   "trimTunnelEnd": () => (/* binding */ trimTunnelEnd),
/* harmony export */   "trimTunnelStart": () => (/* binding */ trimTunnelStart),
/* harmony export */   "updateTunnel": () => (/* binding */ updateTunnel)
/* harmony export */ });
/* harmony import */ var _snk_types_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/types/grid */ "../types/grid.ts");
/* harmony import */ var _snk_types_snake__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/types/snake */ "../types/snake.ts");


/**
 * get the sequence of snake to cross the tunnel
 */
const getTunnelPath = (snake0, tunnel) => {
    const chain = [];
    let snake = snake0;
    for (let i = 1; i < tunnel.length; i++) {
        const dx = tunnel[i].x - (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadX)(snake);
        const dy = tunnel[i].y - (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.getHeadY)(snake);
        snake = (0,_snk_types_snake__WEBPACK_IMPORTED_MODULE_1__.nextSnake)(snake, dx, dy);
        chain.unshift(snake);
    }
    return chain;
};
/**
 * assuming the grid change and the colors got deleted, update the tunnel
 */
const updateTunnel = (grid, tunnel, toDelete) => {
    while (tunnel.length) {
        const { x, y } = tunnel[0];
        if (isEmptySafe(grid, x, y) ||
            toDelete.some((p) => p.x === x && p.y === y)) {
            tunnel.shift();
        }
        else
            break;
    }
    while (tunnel.length) {
        const { x, y } = tunnel[tunnel.length - 1];
        if (isEmptySafe(grid, x, y) ||
            toDelete.some((p) => p.x === x && p.y === y)) {
            tunnel.pop();
        }
        else
            break;
    }
};
const isEmptySafe = (grid, x, y) => !(0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isInside)(grid, x, y) || (0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.isEmpty)((0,_snk_types_grid__WEBPACK_IMPORTED_MODULE_0__.getColor)(grid, x, y));
/**
 * remove empty cell from start
 */
const trimTunnelStart = (grid, tunnel) => {
    while (tunnel.length) {
        const { x, y } = tunnel[0];
        if (isEmptySafe(grid, x, y))
            tunnel.shift();
        else
            break;
    }
};
/**
 * remove empty cell from end
 */
const trimTunnelEnd = (grid, tunnel) => {
    while (tunnel.length) {
        const i = tunnel.length - 1;
        const { x, y } = tunnel[i];
        if (isEmptySafe(grid, x, y) ||
            tunnel.findIndex((p) => p.x === x && p.y === y) < i)
            tunnel.pop();
        else
            break;
    }
};


/***/ }),

/***/ "../solver/utils/sortPush.ts":
/*!***********************************!*\
  !*** ../solver/utils/sortPush.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sortPush": () => (/* binding */ sortPush)
/* harmony export */ });
const sortPush = (arr, x, sortFn) => {
    let a = 0;
    let b = arr.length;
    if (arr.length === 0 || sortFn(x, arr[a]) <= 0) {
        arr.unshift(x);
        return;
    }
    while (b - a > 1) {
        const e = Math.ceil((a + b) / 2);
        const s = sortFn(x, arr[e]);
        if (s === 0)
            a = b = e;
        else if (s > 0)
            a = e;
        else
            b = e;
    }
    const e = Math.ceil((a + b) / 2);
    arr.splice(e, 0, x);
};


/***/ }),

/***/ "../types/__fixtures__/snake.ts":
/*!**************************************!*\
  !*** ../types/__fixtures__/snake.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "snake1": () => (/* binding */ snake1),
/* harmony export */   "snake3": () => (/* binding */ snake3),
/* harmony export */   "snake4": () => (/* binding */ snake4),
/* harmony export */   "snake5": () => (/* binding */ snake5),
/* harmony export */   "snake9": () => (/* binding */ snake9)
/* harmony export */ });
/* harmony import */ var _snake__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../snake */ "../types/snake.ts");

const create = (length) => (0,_snake__WEBPACK_IMPORTED_MODULE_0__.createSnakeFromCells)(Array.from({ length }, (_, i) => ({ x: i, y: -1 })));
const snake1 = create(1);
const snake3 = create(3);
const snake4 = create(4);
const snake5 = create(5);
const snake9 = create(9);


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

/***/ "../types/point.ts":
/*!*************************!*\
  !*** ../types/point.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "around4": () => (/* binding */ around4),
/* harmony export */   "pointEquals": () => (/* binding */ pointEquals)
/* harmony export */ });
const around4 = [
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
];
const pointEquals = (a, b) => a.x === b.x && a.y === b.y;


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
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./demo.interactive.worker.ts ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _snk_solver_getBestRoute__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @snk/solver/getBestRoute */ "../solver/getBestRoute.ts");
/* harmony import */ var _snk_solver_getPathToPose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @snk/solver/getPathToPose */ "../solver/getPathToPose.ts");
/* harmony import */ var _snk_types_fixtures_snake__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @snk/types/__fixtures__/snake */ "../types/__fixtures__/snake.ts");
/* harmony import */ var _worker_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./worker-utils */ "./worker-utils.ts");




const getChain = (grid) => {
    const chain = (0,_snk_solver_getBestRoute__WEBPACK_IMPORTED_MODULE_0__.getBestRoute)(grid, _snk_types_fixtures_snake__WEBPACK_IMPORTED_MODULE_2__.snake4);
    chain.push(...(0,_snk_solver_getPathToPose__WEBPACK_IMPORTED_MODULE_1__.getPathToPose)(chain.slice(-1)[0], _snk_types_fixtures_snake__WEBPACK_IMPORTED_MODULE_2__.snake4));
    return chain;
};
const api = { getChain };
(0,_worker_utils__WEBPACK_IMPORTED_MODULE_3__.createRpcServer)(api);

})();

/******/ })()
;