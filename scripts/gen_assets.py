#!/usr/bin/env python3
"""Genera las imagenes fuente para @capacitor/assets desde el logo de la marca."""
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets")
os.makedirs(OUT, exist_ok=True)

BLACK = (10, 10, 10, 255)  # fondo oscuro de la marca

logo = Image.open(os.path.join(ROOT, "public", "logo-white.png")).convert("RGBA")
W, H = logo.size

# El monograma ocupa aprox. el tercio izquierdo del logo. Lo recortamos y
# ajustamos al contenido real usando el canal alfa.
mono = logo.crop((0, 0, int(W * 0.34), H))
bbox = mono.getbbox()
if bbox:
    mono = mono.crop(bbox)

# Logo completo ajustado a su contenido (para el splash).
full = logo.crop(logo.getbbox()) if logo.getbbox() else logo


def fit(img, max_w, max_h):
    r = min(max_w / img.width, max_h / img.height)
    return img.resize((max(1, int(img.width * r)), max(1, int(img.height * r))), Image.LANCZOS)


def center_on(canvas_size, fg, bg_color):
    canvas = Image.new("RGBA", (canvas_size, canvas_size), bg_color)
    x = (canvas_size - fg.width) // 2
    y = (canvas_size - fg.height) // 2
    canvas.alpha_composite(fg, (x, y))
    return canvas


# icon-only (1024): monograma sobre negro, ~60% del lienzo.
m1 = fit(mono, int(1024 * 0.60), int(1024 * 0.60))
center_on(1024, m1, BLACK).save(os.path.join(OUT, "icon-only.png"))

# Android adaptive: foreground transparente (zona segura ~50%) + fondo negro.
m2 = fit(mono, int(1024 * 0.50), int(1024 * 0.50))
center_on(1024, m2, (0, 0, 0, 0)).save(os.path.join(OUT, "icon-foreground.png"))
Image.new("RGBA", (1024, 1024), BLACK).save(os.path.join(OUT, "icon-background.png"))

# Splash (2732): logo completo centrado, ~46% del ancho.
f1 = fit(full, int(2732 * 0.46), int(2732 * 0.30))
center_on(2732, f1, BLACK).save(os.path.join(OUT, "splash.png"))
center_on(2732, f1, BLACK).save(os.path.join(OUT, "splash-dark.png"))

print("Assets generados en", OUT)
for f in sorted(os.listdir(OUT)):
    print(" -", f)
