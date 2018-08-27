from PIL import Image

im = Image.open('image.jpg')
px = im.load()

y0 = 1
x0 = 1.0000001
vals = []
for i in range(0, 40000):
    x = 1 - 1.4 * pow(x0, 2) + y0
    y = 0.3 * x0
    xr = int(str(x)[4:9]) % 200
    yr = int(str(y)[4:9]) % 200
    vals.append((xr, yr))
    x0 = x
    y0 = y

for i in range(39999, -1, -1):
    (xr, yr) = vals[i]
    p = px[i % 200, int(i / 200)]
    pr = px[xr, yr]
    px[i % 200, int(i / 200)] = pr
    px[xr, yr] = p

im.save('encrypted.png')