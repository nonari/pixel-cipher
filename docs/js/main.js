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

let slope = 0;
const canvas = new Canvas(slope, 200, 200);

function length(point, slope) {

    const testEdges = getEdges(canvas, point, slope);

    if (testEdges === 'BU') {

    }

    const intersectionPoint = intersection(point, slope, 1, true);

}

function calculatePoint(point, slope, distance) {
    const newPoint = Point();
    if (slope === Number.POSITIVE_INFINITY) {
        newPoint.x = point.x;
        newPoint.y = point.y + distance;
    } else {
        newPoint.x = distance;
        newPoint.y = (point.x * slope) - (distance * slope) + point.y;
    }
    return newPoint;
}

function getEdges(canvas, point, slope) {
    const fstDiagonalPoints = canvas.fstDiagonal;
    const sndDiagonalPoints = canvas.sndDiagonal;
    if (isLeft(fstDiagonalPoints[0], fstDiagonalPoints[1], point)) {
        if (slope > 1) {
            return 'LU'
        } else {
            return 'LB'
        }
    } else if (isLeft(sndDiagonalPoints[0], sndDiagonalPoints[1], point)) {
        return 'BU'
    } else {
        if (slope > 1) {
            return 'RB'
        } else {
            return 'RU'
        }
    }
}

function isLeft(linePoint1, linePoint2, point) {
    return ((linePoint2.x - linePoint1.x) * (point.y - linePoint1.y) - (linePoint2.y - linePoint1.y) * (point.x - linePoint1.x)) > 0;
}

function intersection(line, edgeLine) {
    return new Point();
}

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

function Line(point, slope) {
    this.point = point;
    this.slope = slope;

    this.otherPoint = calculatePoint(point, slope, 1);

    this.contains = (testPoint) => {
        return (point.y - testPoint.y) === ((point.x - testPoint.x) * slope);
    };
}

function Segment(line, edges) {
    this.line = line;
    this.edges = edges;
}

function Canvas(slope, width, height) {
    if (slope > 0) {
        this.min_x_edge = 0;
        this.min_y_edge = 0;
        this.max_x_edge = width;
        this.max_y_edge = height;
    } else {
        this.min_x_edge = 0;
        this.min_y_edge = height;
        this.max_x_edge = width;
        this.max_y_edge = 0;
    }

    let maxEdge = new Point();
    maxEdge.x = this.max_x_edge;
    maxEdge.y = this.max_y_edge;

    let minEdge = new Point();
    minEdge.x = this.min_x_edge;
    minEdge.y = this.min_y_edge;

    this.fstDiagonal = [maxEdge, calculatePoint(maxEdge, slope, 1)];

    this.sndDiagonal = [minEdge, calculatePoint(minEdge, slope, 1)];

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
