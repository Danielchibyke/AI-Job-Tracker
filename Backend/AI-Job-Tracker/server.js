const express = require('express');
const app = express();

console.log(typeof app);

function rec(){

    return  { draw :()=>{
        let a = 4
        let b = 2
        console.log(a*b)
    }}
}
rec().draw()