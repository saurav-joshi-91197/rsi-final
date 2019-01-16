let str = decodeURI('%7B"arr1":%5B22,23%5D%7D');
let jso = JSON.parse(str);

console.log(jso.arr1[0]);