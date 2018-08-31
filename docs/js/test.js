class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    };

    sameCell(point) {
        return (Math.trunc(this.x) === Math.trunc(point.x)) && (Math.trunc(this.y) === Math.trunc(point.y));
    }

    calcLinealIntValue(width, steps) {
        const xInt = Math.trunc(this.x);
        const yInt = Math.trunc(this.y);
        return Math.trunc(yInt * width + xInt) * ifDefOr(steps, 1);
    }

    static calcPointOf(value, width) {
        const y = Math.trunc(value / width);
        const x = value % width;
        return new Point(x, y);
    }

    toString(displayAsInt) {
        if (ifDefOr(displayAsInt, false)) {
            return '{x: ' + Math.trunc(this.x) + ',y: ' + Math.trunc(this.y) + '}'
        } else {
            return '{x: ' + this.x + ',y: ' + this.y + '}'
        }
    }
}

const t1 = new Date();
const lp = [];
for (let i = 0; i<10000000; i++) {
    const s = new Point(1,2);
    lp.push(s);
}
const t2 = new Date();
console.log(t2.valueOf() - t1.valueOf());



const t3 = new Date();
const l = [];
for (let i = 0; i<10000000; i++) {
    l.push(i);
}
const t4 = new Date();
console.log(t4.valueOf() - t3.valueOf());


const t5 = new Date();
const l2 = [];
for (let i = 0; i<10000000; i++) {
    l2[i] = i;
}
const t6 = new Date();
console.log(t6.valueOf() - t5.valueOf());


const t7 = new Date();
for (let i = 0; i<100000000; i++) {
    const h = 46786854*4654;
}
const t8 = new Date();
console.log(t8.valueOf() - t7.valueOf());


const t9 = new Date();
for (let i = 0; i<100000000; i++) {
    const h = 12 + 3252345;
}
const t10 = new Date();
console.log(t10.valueOf() - t9.valueOf());

//const u = 12678;
//const l = 23145;
const t11 = new Date();
const cint = new Array(10000000);
for (let i = 0; i<10000000; i++) {
    cint[i] = i;

}
const t12 = new Date();
console.log(t12.valueOf() - t11.valueOf());

const t13 = new Date();
const uint = new Uint16Array(900000000);
let ij = 0;
for (let i = 0; i<30000; i++) {
    for (let j = 0; j<30000; j++) {
        uint[ij] = ij;
        ij++;
    }
}
const t14 = new Date();
console.log(t14.valueOf() - t13.valueOf());

const t15 = new Date();
const uint2 = new Uint32Array(900000000);
let ij2 = 0;
for (let i = 0; i<30000; i++) {
    for (let j = 0; j<30000; j++) {
        uint2[ij2] = ij2;
        ij2++;
    }
}
const t16 = new Date();
console.log(t16.valueOf() - t15.valueOf());


//Math.pow(i, 2);

function isqrt(n) {
    if (n < 0) {
        throw new Error('negative radicand');
    }
    if (n === 0) {
        return 0;
    }

    // x = 2^ceil(Bits(n)/2)
    let x = 2 << Math.ceil(n.toString(2).length >> 1);
    while (true) {
        // y = floor((x + floor(n/x))/2)
        const y = x + (n / x) >> 1;
        if (y - x >= 0) {
            return x;
        }
        x = y;
    }
}