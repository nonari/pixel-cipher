function loadImage() {
    var input, file, fr, img;

    if (typeof window.FileReader !== 'function') {
        write("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('in_file');

    if (input === null) {
        write("Um, couldn't find the imgfile element.");
    }
    else if (!input.files) {
        write("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        write("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = createImage;
        fr.readAsDataURL(file);

    }

    function createImage() {
        img = new Image();
        img.onload = imageLoaded;
        img.src = fr.result;

    }

    function imageLoaded() {
        var canvas = document.getElementById("in_img");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);
        console.log(ctx.getImageData(0,0,1,1));
        const data = ctx.getImageData(0,0,200,200);
        shuffle(data.data);
        var canvas2 = document.getElementById("out_img");
        canvas2.width = img.width;
        canvas2.height = img.height;
        var ctx2 = canvas2.getContext("2d");
        ctx2.putImageData(data, 0, 0);
        console.log(data);
        //alert(canvas.toDataURL("image/png"));
    }

    function shuffle(data) {
        let y0 = 1;
        let x0 = 1.0000001;

        for (let i = 0; i < data.length; i+=4) {
            const x = 1 - 1.4 * Math.pow(x0, 2) + y0;
            const y = 0.3 * x0;

            x0 = parseFloat(Number(x).toFixed(14));
            y0 = parseFloat(Number(y).toFixed(14));

            const xr = Number.parseInt(x.toString().slice(4,9)) % img.width;
            const yr = Number.parseInt(y.toString().slice(4,9)) % img.height;
            const xy = (xr + (yr * img.width)) * 4;

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

    function write(msg) {
        var p = document.createElement('p');
        p.innerHTML = msg;
        document.body.appendChild(p);
    }
}
