const UP_LIMIT = 0.99999999;
const LW_LIMIT = 0.00000001;

const voidImage = new ImageData(new Uint8ClampedArray(25 * 10**6 * 4), 5000, 5000);

function callback() {
    hideSpecificParams();
    processParams();

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
const ctxByAnchor = new Map();

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
        fr.onload = () => {
            createImage(fr.result);
            enableOperationButtons();
        };
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
    if (!ctxByAnchor.has(anchor)) {
        const canvas = document.getElementById(anchor);
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctxByAnchor.set(anchor, ctx);
    }

    return ctxByAnchor.get(anchor);
}

function processImg(reverse) {
    const ctx_in = getContext('in_img');
    const data = ctx_in.getImageData(0, 0, image.width, image.height);
    encrypt(data.data, reverse);

    const ctx_out = getContext('out_img');
    ctx_out.putImageData(data, 0, 0);
}

const global = {};
global.mode = 1;
function scatteringMode(mode) {
    global.mode = mode;

    if (mode === 1) {
        document.getElementById('even_btn').setAttribute('disabled', '');
        document.getElementById('tilted_btn').removeAttribute('disabled');
        hideSpecificParams();
    } else {
        document.getElementById('tilted_btn').setAttribute('disabled', '');
        document.getElementById('even_btn').removeAttribute('disabled');
        showSpecificParams();
    }
}

function processParams() {
    const url = new URL(window.location.href);

    const mode = url.searchParams.get('m');
    switch (mode) {
        case 'e': {scatteringMode(1); break}
        case 't': {scatteringMode(2); break}
    }

    const angle = url.searchParams.get('a');
    if (angle !== null) {
        setAngle(parseInt(angle));
    }

    const range = url.searchParams.get('r');
    if (range !== null) {
        setRange(parseInt(range));
    }

    const a = url.searchParams.get('an');
    const b = url.searchParams.get('bn');
    setSeedValues(a,b);

}

function enableOperationButtons() {
    const buttons = document.getElementsByClassName('operation_btn');
    for (const button of buttons) {
        button.removeAttribute('disabled');
    }
}

function disableOperationButtons() {
    const buttons = document.getElementsByClassName('operation_btn');
    for (const button of buttons) {
        button.setAttribute('disabled', '');
    }
}

function setSeedValues(a, b) {
    document.getElementById('a_input').value = a !== null ? parseFloat(a) : 1;
    document.getElementById('b_input').value = b !== null ? parseFloat(b) : 1.0001;
}

function getSeedValues() {
    const a = parseFloat(document.getElementById('a_input').value);
    const b = parseFloat(document.getElementById('b_input').value);
    return {'a': a, 'b': b};
}

function setRange(range) {
    document.getElementById('range_input').value = range;
}

function setAngle(angle) {
    document.getElementById('angle_input').value = angle;
}

function getRange() {
    return parseInt(document.getElementById('range_input').value);
}

function getAngle() {
    return parseInt(document.getElementById('angle_input').value);
}

function hideSpecificParams() {
    document.getElementById('angle_div').setAttribute('style', 'display: none');
    document.getElementById('range_div').setAttribute('style', 'display: none');
}

function showSpecificParams() {
    document.getElementById('angle_div').removeAttribute('style');
    document.getElementById('range_div').removeAttribute('style');
}

function copyImage() {
    const ctx_in = getContext('in_img');
    const ctx_out = getContext('out_img');
    const data_out = ctx_out.getImageData(0, 0, image.width, image.height);
    ctx_in.putImageData(data_out, 0, 0);
    ctx_out.putImageData(voidImage, 0, 0);
}

function clearImage() {
    const ctx_in = getContext('in_img');
    const ctx_out = getContext('out_img');
    ctx_in.putImageData(voidImage, 0, 0);
    ctx_out.putImageData(voidImage, 0, 0);
    disableOperationButtons();
}


function encrypt(data, reverse) {
    if (global.mode === 1) {
        evenEncryption(data, reverse);
    } else {
        tiltedScattering(data, reverse);
    }
}

function slopeFromDegrees(degrees) {
    const radians = degrees * (Math.PI / 180);

    const slope = Math.tan(radians);

    if (slope === 16331239353195370 || slope === -16331239353195370) {
        return Number.POSITIVE_INFINITY;
    } else {
        return round(slope, 14);
    }
}

function calculatePoint(point, slope, distance) {
    const newPoint = new Point();
    if (slope === Number.POSITIVE_INFINITY) {
        newPoint.x = point.x;
        newPoint.y = point.y + distance;
    } else {
        newPoint.x = point.x + distance;
        newPoint.y = slope * (newPoint.x - point.x) + point.y;
    }

    return newPoint;
}

function calculateSlope(point1, point2) {
    const xDelta = abs(point1.x - point2.x);
    const yDelta = abs(point1.y - point2.y);

    if (xDelta === 0) {
        return Number.POSITIVE_INFINITY;
    } else {
        return yDelta / xDelta;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    };

    sameCell(point) {
        return (trunc(this.x) === trunc(point.x)) && (trunc(this.y) === trunc(point.y));
    }

    calcLinealIntValue(width, steps) {
        const xInt = trunc(this.x);
        const yInt = trunc(this.y);
        return (yInt * width + xInt) * ifDefOr(steps, 1);
    }

    static calcLinealIntValueOf(x, y, width) {
        const xInt = trunc(x);
        const yInt = trunc(y);
        return yInt * width + xInt;
    }

    static calcPointOf(value, width) {
        const y = trunc(value / width);
        const x = value % width;
        return new Point(x, y);
    }

    static zipToUInt32(x, y) {
        return (x << 16) | y;
    }

    toString(displayAsInt) {
        if (ifDefOr(displayAsInt, false)) {
            return '{x: ' + trunc(this.x) + ',y: ' + trunc(this.y) + '}'
        } else {
            return '{x: ' + this.x + ',y: ' + this.y + '}'
        }
    }
}

function ifDefOr(value, alternative) {
    failIfNotDef(alternative, 'function ifDefOr needs an alternative');
    return typeof value !== 'undefined' ? value : alternative;
}

function failIfNotDef(value, message) {
    if (typeof value === 'undefined') {
        throw new Error(message);
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
        return ((this.point2.x - this.point1.x) * (point.y - this.point1.y)
            - (this.point2.y - this.point1.y) * (point.x - this.point1.x)) * (this.slope > 0 ? 1 : -1) > 0;
    }

    contains(x, y)  {
        if (abs(this.slope) > 1) {
            const xLower = trunc(this.revEvaluate(y + LW_LIMIT));
            const xUpper = trunc(this.revEvaluate(y + UP_LIMIT));
            return (xLower === x || xUpper === x);
        } else {
            const yLower = trunc(this.evaluate(x + LW_LIMIT));
            const yUpper = trunc(this.evaluate(x + UP_LIMIT));
            return (yLower === y || yUpper === y);
        }
    }

    calcPointIn(x, y) {
        if (abs(this.slope) < 1) {
            const xUpperLimit = x + UP_LIMIT;
            const xLowerLimit = x + LW_LIMIT;
            const yLowerBound = this.evaluate(xLowerLimit);
            const yUpperBound = this.evaluate(xUpperLimit);
            if (trunc(yUpperBound) === y) {
                return {'x': xUpperLimit, 'y': yUpperBound};
            } else if (trunc(yLowerBound) === y) {
                return {'x': xLowerLimit, 'y': yLowerBound};
            }
        } else {
            const yUpperLimit = y + UP_LIMIT;
            const yLowerLimit = y + LW_LIMIT;
            const xLowerBound = this.revEvaluate(yLowerLimit);
            const xUpperBound = this.revEvaluate(yUpperLimit);
            if (trunc(xUpperBound) === x) {
                return {'x': xUpperBound, 'y': yUpperLimit};
            } else if (trunc(xLowerBound) === x) {
                return {'x': xLowerBound, 'y': yLowerLimit};
            }
        }

        return null;
    }

    evaluate(x) {
        if (this.slope === 0) {
            return this.point1.y;
        } else if (this.slope === Number.POSITIVE_INFINITY) {
            throw new Error('Can\'t calculate y because slope is infinite');
        } else {
            return (-this.point1.x * this.slope) + (x * this.slope) + this.point1.y;
        }
    }

    yOffset(xLength) {
        if (this.slope === 0) {
            throw new Error('Can\'t calculate y offset because slope is zero');
        } else if (this.slope === Number.POSITIVE_INFINITY) {
            throw new Error('Can\'t calculate y offset because slope is infinite');
        } else {
            return xLength * this.slope;
        }
    }

    revEvaluate(y) {
        if (this.slope === 0) {
            throw new Error('Can\'t calculate x because slope is zero');
        } else if (this.slope === Number.POSITIVE_INFINITY) {
            return this.point1.x;
        } else {
            return ((this.point1.x * this.slope) + y - this.point1.y) / this.slope;
        }
    }

    linearDistanceFrom(point) {
        const x = this.revEvaluate(point.y);
        return abs(x - point.x);
    }

}

function Segment(line, canvas) {
    let xLength = null;
    let xDelta = null;
    let hypotenuse = null;
    let xSpread = null;
    let ySpread = null;

    let currentX = null;
    let currentY = null;
    let adjacentLine = null;

    function getHypotenuse() {
        if (line.slope === Number.POSITIVE_INFINITY) {
            return canvas.height;
        } else if (line.slope === 0) {
            return canvas.width;
        } else if (hypotenuse === null) {
            const y = line.yOffset(xLength);
            const xExp = xLength ** 2;
            const yExp = y ** 2;
            hypotenuse = Math.sqrt(xExp + yExp);
        }

        return hypotenuse;
    }

    function calculateXMaxLength() {
        if (abs(line.slope) < canvas.proportion) {
            return canvas.width;
        } else {
            return canvas.height / abs(line.slope);
        }
    }

    function init() {
        if (xSpread === null && line.slope !== Number.POSITIVE_INFINITY && line.slope !== 0) {
            const xLengthMax = calculateXMaxLength();
            const zone = canvas.getZone(line.point1);

            if (zone === 'CV') {
                xLength = xLengthMax;
                xDelta = line.linearDistanceFrom(canvas.leftDiagonal.point1);
            } else if (zone === 'CH') {
                xLength = xLengthMax;
                xDelta = 0;
            } else if (zone === 'L') {
                if (abs(line.slope) > canvas.proportion) {
                    const distance = line.linearDistanceFrom(canvas.leftDiagonal.point1);
                    xLength = xLengthMax - distance;
                } else {
                    const distance = line.linearDistanceFrom(canvas.rightDiagonal.point1);
                    xLength = xLengthMax - distance;
                }
                xDelta = 0;
            } else {
                if (abs(line.slope) > canvas.proportion) {
                    const distance = line.linearDistanceFrom(canvas.rightDiagonal.point1);
                    xLength = xLengthMax - distance;
                    xDelta = canvas.width - (xLengthMax - distance);
                } else {
                    const distance = line.linearDistanceFrom(canvas.leftDiagonal.point1);
                    xLength = xLengthMax - distance;
                    xDelta = canvas.width - (xLengthMax - distance);
                }
            }
            if (xLength === 0) {
                xLength = 0.001;
            }
            xSpread = 1 / (getHypotenuse() / xLength);
            ySpread = xSpread * line.slope;
        }
    }

    this.calculateRandomPoint = (randomInteger) => {
        if (line.slope === Number.POSITIVE_INFINITY) {
            const randomY = randomInteger % getHypotenuse();
            return new Point(line.point1.x, randomY);
        } else if (line.slope === 0) {
            const randomX = randomInteger % getHypotenuse();
            return new Point(randomX, line.point1.y);
        } else {
            init();

            const x = (randomInteger % xLength) + xDelta;
            const y = line.evaluate(x);

            return new Point(x, y);
        }
    };

    this.next = () => {
        while(true) {
            let nextX;
            let nextY;
            if (line.slope === Number.POSITIVE_INFINITY) {
                nextX = currentX;
                nextY = currentY + 1;
            } else if (line.slope === 0) {
                nextX = currentX + 1;
                nextY = currentY;
            } else {
                nextX = currentX + xSpread;
                nextY = currentY + ySpread;

                const xDiff = trunc(nextX) - trunc(currentX);
                const yDiff = trunc(nextY) - trunc(currentY);
                if (abs(xDiff) > 0 && abs(yDiff) > 0) {
                        const interPoint1 = line.calcPointIn(trunc(nextX) - xDiff, trunc(nextY));
                    if (interPoint1 !== null) {
                        nextX = interPoint1.x;
                        nextY = interPoint1.y;
                    } else {
                        const interPoint2 = line.calcPointIn(trunc(nextX), trunc(nextY) - yDiff);
                        if (interPoint2 !== null) {
                            nextX = interPoint2.x;
                            nextY = interPoint2.y;
                        }
                    }
                }
            }

            if (nextX > canvas.width || nextY > canvas.height || nextX < 0 || nextY < 0) {
                return null
            } else if (!sameCell(currentX, currentY, nextX, nextY)
                    && (adjacentLine === null || !adjacentLine.contains(trunc(nextX), trunc(nextY)))) {
                currentX = nextX;
                currentY = nextY;

                return Point.calcLinealIntValueOf(nextX, nextY, canvas.width);
            }
            currentX = nextX;
            currentY = nextY;
        }
    };

    function sameCell(x1, y1, x2, y2) {
        return (trunc(x1) === trunc(x2)) && (trunc(y1) === trunc(y2));
    }

    this.initPointIterator = (adjacent) => {
        adjacentLine = adjacent;
        if (line.slope === Number.POSITIVE_INFINITY) {
            currentX = line.point1.x;
            currentY = 0;
        } else if (line.slope === 0) {
            currentX = 0;
            currentY = line.point1.y;
        } else {
            init();
            currentX = xDelta;
            currentY = line.evaluate(xDelta);
        }

        return Point.calcLinealIntValueOf(currentX, currentY, canvas.width);
    };

}

function Canvas(slope, width, height) {
    this.width = width;
    this.height = height;
    this.proportion = height / width;

    const invertedSlope = 1 / slope;
    const invertSides = abs(slope) > this.proportion;

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

    this.rightDiagonal = Line.ofPointSlope(rightDiagonalPoint, slope);
    this.leftDiagonal = Line.ofPointSlope(leftDiagonalPoint, slope);

    this.getZone = (point) => {
        if (invertSides) {
            if (this.leftDiagonal.isRightTo(point)) {
                return 'L';
            } else if (this.rightDiagonal.isRightTo(point)) {
                return 'CV';
            } else {
                return 'R'
            }
        } else {
            if (this.rightDiagonal.isRightTo(point)) {
                return 'L';
            } else if (this.leftDiagonal.isRightTo(point)) {
                return 'CH';
            } else {
                return 'R'
            }
        }
    };

    this.getLines = () => {
        if (slope === Number.POSITIVE_INFINITY) {
            return byBottomSide();
        } else if (slope === 0) {
            return byLeftSide();
        } else if (slope > 0) {
            if (slope > 1) {
                const leftLines = byLeftSide(slope);
                leftLines.reverse();
                leftLines.pop();
                return leftLines.concat(byBottomSide());
            } else {
                const leftLines = byLeftSide();
                leftLines.reverse();
                leftLines.pop();
                return leftLines.concat(byBottomSide(invertedSlope));
            }
        } else {
            if (abs(slope) > 1) {
                const leftLines = byLeftSide(abs(slope));
                leftLines.pop();
                return byLeftSide().concat(byUpperSide());
            } else {
                const leftLines = byLeftSide();
                leftLines.pop();
                return byLeftSide().concat(byUpperSide(abs(invertedSlope)));
            }
        }
    };

    function byLeftSide(distance) {
        const yJump =   typeof distance !== 'undefined' ? distance : 1;
        const lines = [];
        for (let y = 0; y < height; y+=yJump) {
            lines.push(Line.ofPointSlope(new Point(0, y), slope));
        }
        return lines;
    }

    function byBottomSide(distance) {
        const xJump =   typeof distance !== 'undefined' ? distance : 1;
        const lines = [];
        for (let x = 0; x < width; x+= xJump) {
            lines.push(Line.ofPointSlope(new Point(x, 0), slope));
        }
        return lines;
    }

    function byUpperSide(distance) {
        const xJump = typeof distance !== 'undefined' ? distance : 1;
        const lines = [];
        for (let x = 0; x < width; x+= xJump) {
            lines.push(Line.ofPointSlope(new Point(x, height - 1), slope));
        }
        return lines;
    }
}

function trunc(number) {
    return Math.trunc(number);
}

function abs(number) {
    return Math.abs(number);
}

function round(number, decimals) {
    return trunc(number * (10 ** decimals)) / 10 ** decimals;
}

function decSlice(number) {
    const integerPart = trunc(number * 1000);
    const decimalPart = number * 1000 - integerPart;
    return trunc(decimalPart * 100000);
}

function HenonMap(xMax, yMax, a, b) {
    let y0 = typeof a !== 'undefined' ? a + 0.0000001 : 1;
    let x0 = typeof b !== 'undefined' ? b + 0.0000001 : 1.0001;

    const bounded = typeof xMax !== 'undefined' && typeof yMax !== 'undefined';

    let sequenceForReversal = null;
    let pointer = 0;

    this.reverse = (n) => {
        sequenceForReversal = new Array(n);
        for (let i = 0; i < n; i++) {
            sequenceForReversal[i] = calculateNext();
        }
        sequenceForReversal.reverse();
    };

    function calculateNext() {
        const x = 1 - 1.4 * x0 * x0 + y0;
        const y = 0.3 * x0;

        x0 = round(x, 14);
        y0 = round(y, 14);

        const xr = abs(decSlice(x));
        const yr = abs(decSlice(y));

        if (bounded) {
            return xr % xMax + (yr % yMax) * xMax;
        } else {
            return xr * yr;
        }
    }

    this.next = () => {
        if (sequenceForReversal !== null) {
            if (pointer < sequenceForReversal.length) {
                return sequenceForReversal[pointer ++];
            } else {
                return null;
            }
        } else {
            return calculateNext();
        }
    };
}

function evenEncryption(data, reverse) {
    const seeds = getSeedValues();
    const generator = new HenonMap(undefined, undefined, seeds.a, seeds.b);
    if (reverse) {
        generator.reverse(image.width * image.height);
    }

    shuffle2(data, generator, reverse);
}

function shuffle2(data, generator, reverse) {
    const singleStepLength = data.length / 4;

    doFor(singleStepLength, reverse, (pos) => shuffleNext(data, generator, pos));
}

function doFor(iterations, reverse, fun) {
    if (reverse) {
        for (let i = iterations - 1; i >= 0; i--) {
            fun(i);
        }
    } else {
        for (let i = 0; i < iterations; i++) {
            fun(i);
        }
    }
}

function shuffleNext(data, generator, pos) {
    const rndPoint = generator.next();

    switchPositions(data, rndPoint % (data.length / 4), pos);
}

function extractPoints(canvas) {
    const lines = canvas.getLines();
    const points = new Uint32Array(image.width * image.height);
    let i = 0;
    let lastLine = null;
    for (const line of lines) {
        const segment = new Segment(line, canvas);

        let currentPoint = segment.initPointIterator(lastLine);
        currentPoint = segment.next(currentPoint);
        while (currentPoint !== null) {
            points[i++] = currentPoint;

            currentPoint = segment.next(currentPoint);
        }
        lastLine = line;
    }
    return points;
}

function tiltedScattering(data, reverse) {
    const slope = slopeFromDegrees(getAngle());

    const canvas = new Canvas(slope, image.width, image.height);

    const points = extractPoints(canvas);

    const seeds = getSeedValues();
    const generator = new HenonMap(image.width, image.height, seeds.a, seeds.b);
    const pointsInCanvas = points.length;

    if (reverse) {
        generator.reverse(pointsInCanvas);
        //points.reverse();
    }

    const distance = getRange();

    //for (let i = 0; i < points.length; i++) {

    //}
    doFor(points.length, reverse, (i) => {scatterPoint(data, points, generator, distance, i)});
}

function scatterPoint(data, points, generator, distance, i) {
    const pointToSwitchPosition = points[i];
    const rndPoint = generator.next();
    const randomOffset = rndPoint % distance;
    const sign = rndPoint % 2 === 0 ? 1 : -1;

    let newPosition;
    if (sign > 0) {
        newPosition = i + randomOffset;
        const offsetExcess = points.length - 1 - newPosition;
        if (offsetExcess < 0) {
            newPosition = i - (distance + offsetExcess);
        }
    } else {
        newPosition = i - randomOffset;
        if (newPosition < 0) {
            newPosition = i + (distance - newPosition);
        }
    }
    const newPoint = points[newPosition];

    switchPositions(data, pointToSwitchPosition, newPoint);
}

function switchPositions(data, i, j) {
    const iShift = i * 4;
    const jShift = j * 4;

    const rr = data[jShift];
    const gr = data[jShift+1];
    const br = data[jShift+2];

    const r = data[iShift];
    const g = data[iShift+1];
    const b = data[iShift+2];

    data[iShift] = rr;
    data[iShift+1] = gr;
    data[iShift+2] = br;

    data[jShift] = r;
    data[jShift+1] = g;
    data[jShift+2] = b;
}