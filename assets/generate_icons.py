"""Auto-generate all PNG icons for PWA"""
from PIL import Image, ImageDraw
import os

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUT_DIR = os.path.join(os.path.dirname(__file__), 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

def create_icon(size):
    """用 Pillow 绘制猫咪主题图标"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = size * 0.04
    r = (size - margin * 2) / 2
    cx, cy = size / 2, size / 2

    # 背景圆
    bg_r = size * 0.48
    draw.ellipse([cx - bg_r, cy - bg_r, cx + bg_r, cy + bg_r],
                 fill='#FFF8E7', outline='#F28C71', width=max(2, int(size * 0.02)))

    # 猫耳朵（左）
    ear_size = size * 0.18
    draw.polygon([
        cx - bg_r * 0.55, cy - bg_r * 0.3,
        cx - bg_r * 0.65, cy - bg_r * 1.1,
        cx - bg_r * 0.2, cy - bg_r * 0.5,
    ], fill='#F28C71')
    # 耳内粉色
    draw.polygon([
        cx - bg_r * 0.5, cy - bg_r * 0.35,
        cx - bg_r * 0.58, cy - bg_r * 0.9,
        cx - bg_r * 0.28, cy - bg_r * 0.5,
    ], fill='#FFB8A8')

    # 猫耳朵（右）
    draw.polygon([
        cx + bg_r * 0.55, cy - bg_r * 0.3,
        cx + bg_r * 0.65, cy - bg_r * 1.1,
        cx + bg_r * 0.2, cy - bg_r * 0.5,
    ], fill='#F28C71')
    draw.polygon([
        cx + bg_r * 0.5, cy - bg_r * 0.35,
        cx + bg_r * 0.58, cy - bg_r * 0.9,
        cx + bg_r * 0.28, cy - bg_r * 0.5,
    ], fill='#FFB8A8')

    # 猫脸
    face_rx = bg_r * 0.65
    face_ry = bg_r * 0.55
    draw.ellipse([cx - face_rx, cy + bg_r * 0.05 - face_ry,
                  cx + face_rx, cy + bg_r * 0.05 + face_ry], fill='#F28C71')

    # 眼睛
    eye_r = size * 0.04
    eye_offset_x = size * 0.1
    eye_y = cy - size * 0.02
    # 左眼白
    draw.ellipse([cx - eye_offset_x - eye_r * 2.2, eye_y - eye_r * 2.2,
                  cx - eye_offset_x + eye_r * 2.2, eye_y + eye_r * 2.2], fill='white')
    # 左眼珠
    draw.ellipse([cx - eye_offset_x - eye_r * 1.2, eye_y - eye_r * 1.4,
                  cx - eye_offset_x + eye_r * 1.2, eye_y + eye_r * 1.4], fill='#4A3728')
    # 左高光
    highlight_r = size * 0.02
    draw.ellipse([cx - eye_offset_x + eye_r * 0.4, eye_y - eye_r * 1.4,
                  cx - eye_offset_x + eye_r * 0.4 + highlight_r, eye_y - eye_r * 1.4 + highlight_r], fill='white')

    # 右眼白
    draw.ellipse([cx + eye_offset_x - eye_r * 2.2, eye_y - eye_r * 2.2,
                  cx + eye_offset_x + eye_r * 2.2, eye_y + eye_r * 2.2], fill='white')
    # 右眼珠
    draw.ellipse([cx + eye_offset_x - eye_r * 1.2, eye_y - eye_r * 1.4,
                  cx + eye_offset_x + eye_r * 1.2, eye_y + eye_r * 1.4], fill='#4A3728')
    # 右高光
    draw.ellipse([cx + eye_offset_x + eye_r * 0.4, eye_y - eye_r * 1.4,
                  cx + eye_offset_x + eye_r * 0.4 + highlight_r, eye_y - eye_r * 1.4 + highlight_r], fill='white')

    # 鼻子
    nose_y = cy + size * 0.05
    nose_size = size * 0.025
    draw.ellipse([cx - nose_size, nose_y - nose_size * 0.7,
                  cx + nose_size, nose_y + nose_size * 0.7], fill='#FFB8A8')

    # 嘴巴
    mouth_y = nose_y + nose_size
    lw = max(1, int(size * 0.008))
    draw.arc([cx - size * 0.06, mouth_y - size * 0.01, cx, mouth_y + size * 0.05],
             start=0, end=180, fill='#4A3728', width=lw)
    draw.arc([cx, mouth_y - size * 0.01, cx + size * 0.06, mouth_y + size * 0.05],
             start=0, end=180, fill='#4A3728', width=lw)
    draw.line([cx, nose_y + nose_size * 0.5, cx, mouth_y + size * 0.02],
              fill='#4A3728', width=lw)

    # 胡须
    whisker_w = max(1, int(size * 0.005))
    w_start = size * 0.15
    w_end = size * 0.45
    w_y = cy + size * 0.01
    draw.line([w_start, w_y, w_end, w_y + size * 0.03], fill='#4A3728', width=whisker_w)
    draw.line([w_start, w_y + size * 0.06, w_end, w_y + size * 0.05], fill='#4A3728', width=whisker_w)
    draw.line([size - w_start, w_y, size - w_end, w_y + size * 0.03], fill='#4A3728', width=whisker_w)
    draw.line([size - w_start, w_y + size * 0.06, size - w_end, w_y + size * 0.05], fill='#4A3728', width=whisker_w)

    # 猫爪印（右下）
    paw_cx = size * 0.78
    paw_cy = size * 0.8
    paw_r = size * 0.04
    pad_r = size * 0.02
    alpha = 150
    # 主肉垫
    draw.ellipse([paw_cx - paw_r, paw_cy - paw_r, paw_cx + paw_r, paw_cy + paw_r],
                 fill=(242, 140, 113, alpha))
    # 脚趾
    for dx, dy in [(-paw_r * 0.6, -paw_r * 0.9), (paw_r * 0.6, -paw_r * 0.9),
                   (-paw_r * 0.7, paw_r * 0.7), (paw_r * 0.7, paw_r * 0.7)]:
        draw.ellipse([paw_cx + dx - pad_r, paw_cy + dy - pad_r,
                      paw_cx + dx + pad_r, paw_cy + dy + pad_r], fill=(242, 140, 113, alpha))

    return img

# 生成所有尺寸
for size in SIZES:
    icon = create_icon(size)
    path = os.path.join(OUT_DIR, f'icon-{size}.png')
    icon.save(path)
    print(f'[OK] icon-{size}.png ({size}x{size})')

print(f'\n[DONE] All {len(SIZES)} icons saved to: {OUT_DIR}')
