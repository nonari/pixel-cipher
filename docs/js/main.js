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

function length() {
    const slope = 0;
    const point = new Point(1,1);

    const line = new Line(point, slope);

    const canvas = new Canvas(slope, 200, 200);

    const segment = new Segment(line, canvas);

    segment.getHypotenuse();
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

function calculateSlope(point1, point2) {
    const xDelta = Math.abs(point1.x - point2.x);
    const yDelta = Math.abs(point1.y - point2.y);

    if (xDelta === 0) {
        return Number.POSITIVE_INFINITY;
    } else {
        return yDelta / xDelta;
    }
}

class Point {
    constructor(x,y) {

    }
}

class Line {
    constructor(point1, point2, slope) {
        this.point1 = point1;
        this.point2 = point2;
        this.slope = slope;
    }

    static ofPointSlope(point, slope) {
        const otherPoint = calculatePoint(point, slope, 1);
        return new Line(point, otherPoint, slope);
    }

    static ofTwoPoints(point1, point2) {
        const slope = calculateSlope(point1, point2);
        return new Line(point1, point2, slope);
    }

    isRightTo(point) {
        return ((this.point2.x - this.point1.x) * (point.y - this.point1.y) - (this.point2.y - this.point1.y) * (point.x - this.point1.x)) > 0;
    }

    contains(testPoint)  {
        return (this.point1.y - testPoint.y) === ((this.point1.x - testPoint.x) * this.slope);
    };

    evaluate(x) {
        return (-this.point1.x * this.slope) + (x * this.slope) + this.point1.y;
    }

    revEvaluate(y) {
        return ((-this.point1.x * this.slope) + y - this.point1.y) / this.slope;
    }

    linearDistanceFrom(point) {
        const x = this.revEvaluate(point.y);
        return Math.abs(x - point.x);
    }
}

function Segment(line, canvas) {
    let xLength = null;
    let xDelta = null;
    let hypotenuse = null;
    let spread;

    this.getHypotenuse = () => {
        if (hypotenuse === null) {
            const y = line.evaluate(xLength);
            const xExp = xLength * xLength;
            const yExp = y * y;
            hypotenuse = Math.sqrt(xExp + yExp);
        }

        return hypotenuse;
    };

    function init() {
        if (line.slope === Number.POSITIVE_INFINITY) {
            hypotenuse = canvas.height;
            spread = 1;
        } else if (line.slope === 0) {
            hypotenuse = canvas.width;
            spread = 1;
        } else {
            const xLengthMax = canvas.height / line.slope;
            const zone = canvas.getZone(line.point1);
            if (zone === 'C') {
                xLength = xLengthMax;
                xDelta = line.linearDistanceFrom(canvas.leftDiagonal) + xLength;
            } else if (zone === 'L') {
                xLength = xLengthMax - line.linearDistanceFrom(canvas.leftDiagonal);
                xDelta = 0;
            } else {
                xLength = xLengthMax - line.linearDistanceFrom(canvas.rightDiagonal);
                xDelta = 0;
            }
            spread = 1 / (hypotenuse / xLength);
        }
    }

    this.calculatePoint = (factor) => {
        if (line.slope === Number.POSITIVE_INFINITY) {
            return new Point(line.point1.x, canvas.height * factor);
        } else if (this.line.slope === 0) {
            return new Point(canvas.width * factor, line.point1.y);
        } else {
            if (xLength === null || xDelta === null) {
                init();
            }

            const x = xLength * factor + xDelta;
            const y = line.evaluate(x);

            return new Point(x, y);
        }
    };


    this.next = (point) => {
        if (line.slope === Number.POSITIVE_INFINITY) {
            return new Point(point.x, point.y + 1);
        } else if (line.slope === 0) {
            return new Point(point.x + 1, point.y);
        } else {
            const xNext = point.x + spread;
            const yNext = line.evaluate(point.x + spread);
            return new Point(xNext, yNext);
        }
    };

    this.forEach = (cb) => {
        let currentPoint = ();
        for (let x = 0; x < xLength; x+=spread) {
            next
            cb(1);
        }
    };
}

function Canvas(slope, width, height) {
    if (slope > 0) {
        this.left_x_edge = 0;
        this.left_y_edge = 0;
        this.right_x_edge = width;
        this.right_y_edge = height;
    } else {
        this.left_x_edge = 0;
        this.left_y_edge = height;
        this.right_x_edge = width;
        this.right_y_edge = 0;
    }

    const rightDiagonalPoint = new Point(this.right_x_edge, this.right_y_edge);
    const leftDiagonalPoint = new Point(this.left_x_edge, this.left_y_edge);

    const bottomEdge = Line.ofPointSlope(Point(0, 0), 0);
    const leftEdge = Line.ofPointSlope(Point(0, 0), Number.POSITIVE_INFINITY);
    const rightEdge = Line.ofPointSlope(Point(width, 0), Number.POSITIVE_INFINITY);
    const upperEdge = Line.ofPointSlope(Point(0, height), 0);

    this.rightDiagonal = Line.ofPointSlope(rightDiagonalPoint, slope);
    this.leftDiagonal = Line.ofPointSlope(leftDiagonalPoint, slope);

    this.getEdges = (line) => {
        const point = line.point1;

        if (this.leftDiagonal.isRightTo(point)) {
            if (slope > 1) {
                return [leftEdge, upperEdge];
            } else {
                return [leftEdge, bottomEdge];
            }
        } else if (this.rightDiagonal.isRightTo(point)) {
            return [bottomEdge, upperEdge];
        } else {
            if (slope > 1) {
                return [rightEdge, bottomEdge];
            } else {
                return [rightEdge, upperEdge];
            }
        }
    };

    this.getZone = (point) => {
        if (this.leftDiagonal.isRightTo(point)) {
            return 'L'
        } else if (this.rightDiagonal.isRightTo(point)) {
            return 'C';
        } else {
            return 'R';
        }
    }
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
