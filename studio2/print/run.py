import os
import glob
from datetime import datetime
from PIL import Image, ImageDraw, ImageOps, ImageFont

def generate_perfect_cards():
    # ==========================================
    # 1. 网页配置接口 (在此粘贴 index.html 生成的内容)
    # ==========================================
    THEME_CONFIG = {
            "card_bg": (132, 158, 29),
        "border": (35, 205, 234),
        "text": (143, 1, 123),
        "radius": 40
    }

    # ==========================================
    # 2. 核心参数设置 (300 DPI 打印级)
    # ==========================================
    DPI_SCALE = 300 / 72  
    PAPER_W = int(792 * DPI_SCALE)
    PAPER_H = int(612 * DPI_SCALE)
    CARD_W = int(337 * DPI_SCALE)
    CARD_H = int(184 * DPI_SCALE)
    
    REAL_RADIUS = int(THEME_CONFIG["radius"] * DPI_SCALE)
    FONT_SIZE = int(10 * DPI_SCALE)
    
    current_time_str = f"Date: {datetime.now().strftime('%b %-d, %Y')}"

    download_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    output_filename = os.path.join(download_dir, f"FullStyle_Cards_{datetime.now().strftime('%H%M%S')}.pdf")

    # ==========================================
    # 3. 高清图片处理逻辑 (即使没有图片也保留风格)
    # ==========================================
    def process_card_hd(side, index, max_w, max_h):
        path = f"{side}{index}.png"
        
        # --- A. 创建基础风格底板 (无论有没有图片，这一步都会执行) ---
        # 这保证了即使没有 front.png，也会有一张带颜色的卡片
        styled_canvas = Image.new('RGBA', (max_w, max_h), THEME_CONFIG["card_bg"])
        
        # --- B. 尝试加载图片 ---
        if os.path.exists(path):
            img = Image.open(path).convert("RGBA")
            # 保持比例不剪裁
            img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
            curr_w, curr_h = img.size
            # 图片居中贴放
            img_x = (max_w - curr_w) // 2
            img_y = (max_h - curr_h) // 2
            styled_canvas.paste(img, (img_x, img_y), mask=img if "A" in img.getbands() else None)
        
        # --- C. 应用圆角剪裁 ---
        mask = Image.new('L', (max_w, max_h), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.rounded_rectangle((0, 0, max_w, max_h), radius=REAL_RADIUS, fill=255)
        
        final_styled_card = Image.new('RGBA', (max_w, max_h), (0, 0, 0, 0))
        final_styled_card.paste(styled_canvas, (0, 0), mask=mask)
        
        # --- D. 添加日期 (仅背面) ---
        if side == "back":
            draw_text = ImageDraw.Draw(final_styled_card)
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", FONT_SIZE)
            except:
                font = ImageFont.load_default()
            
            bbox = draw_text.textbbox((0, 0), current_time_str, font=font)
            margin = int(15 * DPI_SCALE)
            tx = max_w - (bbox[2] - bbox[0]) - margin
            ty = max_h - (bbox[3] - bbox[1]) - margin
            draw_text.text((tx, ty), current_time_str, font=font, fill=THEME_CONFIG["text"])

        # --- E. 绘制 UI 描边 ---
        draw_border = ImageDraw.Draw(final_styled_card)
        draw_border.rounded_rectangle(
            [0, 0, max_w, max_h], 
            radius=REAL_RADIUS, outline=THEME_CONFIG["border"], width=int(2 * DPI_SCALE)
        )
        return final_styled_card

    # ==========================================
    # 4. 裁切线逻辑
    # ==========================================
    def draw_marks(canvas, positions):
        draw = ImageDraw.Draw(canvas)
        mid_x, mid_y = PAPER_W // 2, PAPER_H // 2
        line_col = (230, 230, 230)
        # 中心十字参考线
        for y in range(0, PAPER_H, 40): draw.line([(mid_x, y), (mid_x, y + 10)], fill=line_col, width=1)
        for x in range(0, PAPER_W, 40): draw.line([(x, mid_y), (x + 10, mid_y)], fill=line_col, width=1)
        # 卡片轮廓参考线
        for (x, y) in positions:
            draw.rounded_rectangle([x, y, x + CARD_W, y + CARD_H], radius=REAL_RADIUS, outline=line_col, width=1)

    # ==========================================
    # 5. 合成逻辑
    # ==========================================
    offset_x = (PAPER_W - (CARD_W * 2)) // 2
    offset_y = (PAPER_H - (CARD_H * 2)) // 2
    pos = [(offset_x, offset_y), (offset_x + CARD_W, offset_y),
           (offset_x, offset_y + CARD_H), (offset_x + CARD_W, offset_y + CARD_H)]

    try:
        page1 = Image.new('RGB', (PAPER_W, PAPER_H), (255, 255, 255))
        page2 = Image.new('RGB', (PAPER_W, PAPER_H), (255, 255, 255))
        
        draw_marks(page1, pos)
        draw_marks(page2, pos)

        for i in range(1, 5):
            # 处理正面
            f_card = process_card_hd("front", i, CARD_W, CARD_H)
            page1.paste(f_card, pos[i-1], f_card) # 无论 f_card 是否包含图片，现在它都有风格背景
            
            # 处理背面 (镜像对调)
            mirror_map = {0: 1, 1: 0, 2: 3, 3: 2}
            b_card = process_card_hd("back", i, CARD_W, CARD_H)
            page2.paste(b_card, pos[mirror_map[i-1]], b_card)

        page1.save(output_filename, save_all=True, append_images=[page2], resolution=300.0, quality=100)
        print(f"✅ Full-Style PDF generated: {os.path.basename(output_filename)}")
        os.system(f"open -R '{output_filename}'")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    generate_perfect_cards()