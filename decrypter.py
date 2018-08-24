from PIL import Image

im = Image.open('image.jpg')
px = im.load()

y0 = 1
x0 = 1.0000001
for i in range(0, 40000):
    x = 1 - 1.4 * pow(x0, 2) + y0
    y = 0.3 * x0
    x0 = x
    y0 = y
    xr = int(str(x)[4:9]) % 200
    yr = int(str(y)[4:9]) % 200

    p = px[i % 200, int(i / 200)]
    pr = px[xr, yr]
    px[i % 200, int(i / 200)] = pr
    px[xr, yr] = p

im.save('decrypted.jpg', optimize=False, progressive=False, quality=100)
