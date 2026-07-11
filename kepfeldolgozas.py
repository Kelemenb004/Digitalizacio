"""Kép-előfeldolgozó script: logó invertálás, hero-kép tömörítés, OG-kép készítés."""
import subprocess
import sys

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow'])
    from PIL import Image

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, 'images')


def format_size(path):
    size_bytes = os.path.getsize(path)
    return f'{size_bytes / (1024 * 1024):.2f} MB'


def invert_logo():
    src_path = os.path.join(IMAGES_DIR, 'logo.png')
    dst_path = os.path.join(IMAGES_DIR, 'logo-dark.png')

    img = Image.open(src_path).convert('RGBA')
    r, g, b, a = img.split()

    r = r.point(lambda v: 255 - v)
    g = g.point(lambda v: 255 - v)
    b = b.point(lambda v: 255 - v)

    inverted = Image.merge('RGBA', (r, g, b, a))
    inverted.save(dst_path)

    print(f'1) Logó invertálás:')
    print(f'   {src_path} ({img.size[0]}x{img.size[1]}px, fehér, sötét témához)')
    print(f'   -> {dst_path} ({inverted.size[0]}x{inverted.size[1]}px, fekete, világos témához)')


def compress_hero():
    src_path = os.path.join(IMAGES_DIR, 'hatterkep og picture.JPG')
    dst_path = os.path.join(IMAGES_DIR, 'hero-kazetta.jpg')

    img = Image.open(src_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    orig_w, orig_h = img.size
    new_w = 1920
    new_h = round(orig_h * (new_w / orig_w))
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    resized.save(dst_path, 'JPEG', quality=82, optimize=True, progressive=True)

    print(f'\n2) Kazetta-kép tömörítés:')
    print(f'   {src_path} ({orig_w}x{orig_h}px, {format_size(src_path)})')
    print(f'   -> {dst_path} ({new_w}x{new_h}px, {format_size(dst_path)})')

    return resized


def make_og_image(hero_img):
    dst_path = os.path.join(BASE_DIR, 'og-kep.jpg')

    target_w, target_h = 1200, 630
    src_w, src_h = hero_img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        # a forrás szélesebb -> magasságra illesztjük, oldalt vágunk
        scale_h = target_h
        scale_w = round(src_h * target_ratio)
        scaled = hero_img.resize(
            (round(src_w * (scale_h / src_h)), scale_h), Image.LANCZOS
        )
    else:
        # a forrás magasabb (vagy egyenlő arányú) -> szélességre illesztjük, felül/alul vágunk
        scale_w = target_w
        scaled = hero_img.resize(
            (scale_w, round(src_h * (scale_w / src_w))), Image.LANCZOS
        )

    sw, sh = scaled.size
    left = (sw - target_w) // 2
    top = (sh - target_h) // 2
    cropped = scaled.crop((left, top, left + target_w, top + target_h))
    cropped.save(dst_path, 'JPEG', quality=85, optimize=True)

    print(f'\n3) OG-kép készítés:')
    print(f'   -> {dst_path} ({cropped.size[0]}x{cropped.size[1]}px, {format_size(dst_path)})')


if __name__ == '__main__':
    invert_logo()
    hero = compress_hero()
    make_og_image(hero)
    print('\nKész.')
