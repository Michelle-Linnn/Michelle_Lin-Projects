import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk, ImageFilter, ImageDraw
import random

class ArtSynthesizer:
    def __init__(self, root):
        self.root = root
        self.root.title("Visual Synthesizer - Blur & Grain Edition")
        self.root.geometry("1200x900")
        self.root.configure(bg="#080808") # 极黑背景

        # 核心图像数据
        self.base_layer = None
        self.overlay_raw = None
        self.final_comp = None
        self.tk_preview = None

        # --- 布局设计 ---
        # 1. Stage: 视觉展示区
        self.canvas = tk.Canvas(root, bg="#080808", highlightthickness=0, cursor="target")
        self.canvas.pack(side="top", expand=True, fill="both", pady=20)
        self.canvas.bind("<Button-1>", self.sample_effect)

        # 2. Console: 艺术控制台
        self.console = tk.Frame(root, bg="#111", height=200)
        self.console.pack(side="bottom", fill="x")

        # 左侧：导入区域
        self.import_frame = tk.Frame(self.console, bg="#111")
        self.import_frame.pack(side="left", padx=30)
        
        btn_style = {"bg": "#1a1a1a", "fg": "#888", "relief": "flat", "font": ("Verdana", 9), "width": 15}
        tk.Button(self.import_frame, text="IMPORT BASE", command=self.load_base, **btn_style).pack(pady=5)
        tk.Button(self.import_frame, text="IMPORT OVERLAY", command=self.load_overlay, **btn_style).pack(pady=5)

        # 中间：参数调节区 (The Synthesizer Knobs)
        self.params_frame = tk.Frame(self.console, bg="#111")
        self.params_frame.pack(side="left", padx=20)

        # Alpha 调节
        self.create_slider(self.params_frame, "ALPHA MIX", 0, 255, 255)
        # 模糊调节
        self.blur_slider = self.create_slider(self.params_frame, "DREAM BLUR", 0, 20, 0)
        # 噪点调节
        self.grain_slider = self.create_slider(self.params_frame, "FILM GRAIN", 0, 50, 0)

        # 右侧：反馈显示
        self.feedback_frame = tk.Frame(self.console, bg="#111")
        self.feedback_frame.pack(side="right", padx=30)
        
        self.color_dot = tk.Label(self.feedback_frame, text="●", fg="#111", bg="#111", font=("Arial", 30))
        self.color_dot.pack(side="left")
        self.info_lbl = tk.Label(self.feedback_frame, text="HEX: #000000\nSYSTEM READY", 
                                 fg="#444", bg="#111", font=("Courier", 11), justify="left")
        self.info_lbl.pack(side="left", padx=10)

        tk.Button(self.console, text="SAVE PNG", command=self.export, 
                  bg="#222", fg="#0f0", relief="flat", padx=30).pack(side="right", padx=20)

    def create_slider(self, parent, label, f, t, init):
        lbl = tk.Label(parent, text=label, fg="#444", bg="#111", font=("Verdana", 8))
        lbl.pack()
        s = tk.Scale(parent, from_=f, to=t, orient="horizontal", bg="#111", fg="#777",
                     highlightthickness=0, length=180, command=self.process_art)
        s.set(init)
        s.pack(pady=(0, 10))
        return s

    # --- 艺术处理核心 ---
    def load_base(self):
        p = filedialog.askopenfilename()
        if p:
            self.base_layer = Image.open(p).convert("RGBA")
            self.process_art()

    def load_overlay(self):
        if not self.base_layer: return
        p = filedialog.askopenfilename()
        if p:
            raw = Image.open(p).convert("RGBA")
            self.overlay_raw = raw.resize(self.base_layer.size, Image.Resampling.LANCZOS)
            self.process_art()

    def process_art(self, _=None):
        if not self.base_layer or not self.overlay_raw:
            self.render(self.base_layer)
            return

        # 1. 梦幻模糊处理
        blur_val = self.blur_slider.get()
        working_overlay = self.overlay_raw.copy()
        if blur_val > 0:
            working_overlay = working_overlay.filter(ImageFilter.GaussianBlur(blur_val))

        # 2. 噪点处理 (Film Grain)
        grain_val = self.grain_slider.get()
        if grain_val > 0:
            grain = Image.new("RGBA", working_overlay.size)
            draw = ImageDraw.Draw(grain)
            for _ in range(int(working_overlay.size[0] * working_overlay.size[1] * (grain_val/500))):
                x = random.randint(0, working_overlay.size[0]-1)
                y = random.randint(0, working_overlay.size[1]-1)
                draw.point((x, y), fill=(255, 255, 255, 30))
            working_overlay = Image.alpha_composite(working_overlay, grain)

        # 3. Alpha 混合
        alpha = self.root.children['!frame2'].children['!scale'].get() / 255.0
        r, g, b, a = working_overlay.split()
        a = a.point(lambda p: p * alpha)
        working_overlay.putalpha(a)

        self.final_comp = Image.alpha_composite(self.base_layer, working_overlay)
        self.render(self.final_comp)

    def sample_effect(self, event):
        if not self.final_comp: return
        
        # 映射像素
        cw, ch = self.canvas.winfo_width(), self.canvas.winfo_height()
        iw, ih = self.final_comp.size
        ratio = min(cw/iw, ch/ih)
        rx = int((event.x - (cw - iw*ratio)/2) / ratio)
        ry = int((event.y - (ch - ih*ratio)/2) / ratio)

        if 0 <= rx < iw and 0 <= ry < ih:
            r, g, b, a = self.final_comp.getpixel((rx, ry))
            hex_c = f"#{r:02x}{g:02x}{b:02x}"
            self.color_dot.configure(fg=hex_c)
            self.info_lbl.configure(text=f"HEX: {hex_c.upper()}\nRGBA: {r},{g},{b},{a}")
            
            # 视觉涟漪动画
            for i in range(1, 4):
                d = i * 15
                self.canvas.create_oval(event.x-d, event.y-d, event.x+d, event.y+d, 
                                        outline=hex_c, tags="ripple")
            self.root.after(400, lambda: self.canvas.delete("ripple"))

    def render(self, img):
        if not img: return
        p_img = img.copy()
        p_img.thumbnail((self.canvas.winfo_width(), self.canvas.winfo_height()), Image.Resampling.LANCZOS)
        self.tk_preview = ImageTk.PhotoImage(p_img)
        self.canvas.delete("all")
        self.canvas.create_image(self.canvas.winfo_width()//2, self.canvas.winfo_height()//2, image=self.tk_preview)

    def export(self):
        if self.final_comp:
            p = filedialog.asksaveasfilename(defaultextension=".png")
            if p: self.final_comp.save(p, "PNG")

if __name__ == "__main__":
    root = tk.Tk()
    app = ArtSynthesizer(root)
    root.mainloop()