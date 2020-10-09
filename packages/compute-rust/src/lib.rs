mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, sir!");
}

#[derive(Copy, Clone)]
pub struct Point {
    x: i8,
    y: i8,
}

#[derive(Copy, Clone)]
pub enum Cell {
    empty,
    color1,
    color2,
    color3,
    color4,
    color5,
}

pub struct Grid {
    width: i8,
    height: i8,
    data:  [Cell; 53*7]   
}

type Snake = [Point; 5]   ;


fn getIndex(grid:&Grid,x:i8,y:i8) -> usize {

    return (x*grid.height+y) as usize;
}

// pub fn setCell(grid:&Grid,x:i8,y:i8,c:Cell) {
//     // grid.data[getIndex(grid,x,y)]=c;
// }

pub fn getCell(grid:&Grid,x:i8,y:i8,c:Cell) -> Cell {

    let i = getIndex(grid,x,y);

    return grid.data[i];
}