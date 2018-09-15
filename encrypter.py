from PIL import Image

im = Image.open('image.jpg')
px = im.load()
w, h = im.size

y0 = 1
x0 = 1.0000001
vals = []
for i in range(0, h * w):
    x = 1 - 1.4 * pow(x0, 2) + y0
    y = 0.3 * x0
    xr = int(('%.11f' % (x))[4:9]) % w
    yr = int(('%.11f' % (y))[4:9]) % h
    vals.append((xr, yr))
    x0 = float('%.14f' % (x))
    y0 = float('%.14f' % (y))

vals.reverse()
for i in range(0, h * w):
    (xr, yr) = vals[i]
    j = h * w - i - 1
    p = px[j % w, int(j / w)]
    pr = px[xr, yr]
    px[j % w, int(j / w)] = pr
    px[xr, yr] = p

im.save('encrypted.png')
