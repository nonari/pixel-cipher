function callback() {
    document.getElementById('in_file').onchange = function () {
        loadImage();
    }
}

if (document.readyState === "complete" || document.readyState !== "loading") {
    callback();
} else {
    document.addEventListener("DOMContentLoaded", callback);
}

let image;
const cxtsByAnchor = new Map();

function loadImage() {

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    const input = document.getElementById('in_file');

    if (input === null) {
        alert("Um, couldn't find the imgfile element.");
    }
    else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    }
    else {
        const file = input.files[0];
        const fr = new FileReader();
        fr.onload = () => createImage(fr.result);
        fr.readAsDataURL(file);
    }
}

function createImage(rawImgData) {
    image = new Image();
    image.onload = () => drawImage("in_img");
    image.src = rawImgData;
}

function drawImage(anchor) {
    const ctx = getContext(anchor);
    ctx.drawImage(image, 0, 0);
}

function getContext(anchor) {
    if (cxtsByAnchor.has(anchor)) {
        return cxtsByAnchor.get(anchor);
    }
    const canvas = document.getElementById(anchor);
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    cxtsByAnchor.set(anchor, ctx);
    return ctx;
}

function processImg() {
    const ctx_in = getContext('in_img');
    const data = ctx_in.getImageData(0,0,200,200);
    shuffle(data.data);

    const ctx_out = getContext('out_img');
    ctx_out.putImageData(data, 0, 0);
}

let angle = 0;

function getCanvasEdges(slope) {
    slope = Math.tan(angle);

    const canvas = new Canvas();
    if (slope > 0) {
        canvas.min_x_edge = 0;
        canvas.min_y_edge = 0;
        canvas.max_x_edge = 200;
        canvas.max_y_edge = 200;
    } else {
        canvas.min_x_edge = 0;
        canvas.min_y_edge = 200;
        canvas.max_x_edge = 200;
        canvas.max_y_edge = 0;
    }

    return canvas;
}

function length(x, y, slope) {
    const canvas = getCanvasEdges(slope);

    testEdges = getEdges();

    const point = intersection(x, y, slope,);

}

function getEdges() {
    return 'UD';
}

function intersection(x, y, slope, distance, XorY) {

}

class Point {
    x;
    y;
}

class Canvas {
    min_x_edge;
    min_y_edge;
    max_x_edge;
    max_y_edge;
}

function shuffle(data) {
    let y0 = 1;
    let x0 = 1.0000001;

    for (let i = 0; i < data.length; i+=4) {
        const x = 1 - 1.4 * Math.pow(x0, 2) + y0;
        const y = 0.3 * x0;

        x0 = parseFloat(Number(x).toFixed(14));
        y0 = parseFloat(Number(y).toFixed(14));

        const xr = Number.parseInt(x.toString().slice(4,9)) % image.width;
        const yr = Number.parseInt(y.toString().slice(4,9)) % image.height;
        const xy = (xr + (yr * image.width)) * 4;

        const rr = data[xy];
        const gr = data[xy+1];
        const br = data[xy+2];

        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        data[i] = rr;
        data[i+1] = gr;
        data[i+2] = br;

        data[xy] = r;
        data[xy+1] = g;
        data[xy+2] = b;
    }

}
