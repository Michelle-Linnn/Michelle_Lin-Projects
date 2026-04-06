import cv2
import numpy as np

def remove_gray_watermark(image_path, output_path):
    """
    专门用于去除具有特定灰白色渐变效果的菱形/星星形状水印的函数。
    """
    # 1. 加载图像
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: 无法读取图像 '{image_path}'。请确保文件路径正确。")
        return

    # 2. 将图像转换为 HSV 颜色空间
    # 这比在 BGR 空间中定义颜色范围更稳健，因为它可以将亮度与颜色和饱和度分开。
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 3. 通过 HSV 范围提取遮罩
    # 水印主要是灰白色。在 HSV 中，灰度/中性色具有较低的饱和度 (S)。
    # 我们定义一个通用的灰白色范围来捕捉水印：
    # 色调 (H): 0-179 (不关心色调)
    # 饱和度 (S): 0-100 (低饱和度 = 接近灰度)
    # 亮度 (V): 120-230 (中等亮度 = 不是黑色也不是纯白色)
    # 这些范围经过调整，以捕捉 image_0 中的较亮灰白色和 image_1 中的较暗灰白色。
    lower_gray_hsv = np.array([0, 0, 120], dtype="uint8") 
    upper_gray_hsv = np.array([179, 100, 230], dtype="uint8")

    # 创建基于颜色的初始遮罩
    mask = cv2.inRange(img_hsv, lower_gray_hsv, upper_gray_hsv)

    # 4. 形态学处理（膨胀）以细化遮罩
    # 由于水印具有渐变和半透明效果，单纯的颜色阈值可能会漏掉边缘或内部。
    # 我们使用一个较大的核进行膨胀，以确保遮罩完全覆盖水印的所有部分，并填补内部空洞。
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7)) # 7x7 的矩形核
    mask_dilated = cv2.dilate(mask, kernel, iterations=2) # 膨胀 2 次

    # 5. 应用修复 (Inpainting) 算法
    # 使用 cv2.INPAINT_TELEA 算法（Telea 方法），这是一种快速且对小区域效果良好的算法。
    # 修复半径设为 3 像素。
    dst = cv2.inpaint(img, mask_dilated, 3, cv2.INPAINT_TELEA)

    # 6. 保存修复后的结果
    cv2.imwrite(output_path, dst)
    print(f"结果已成功保存到: '{output_path}'")

# --- 示例：处理用户提供的两张图片 ---

# 处理第一张图片 (image_0.png)
remove_gray_watermark('image_0.png', 'result_image_0.png')

# 处理第二张图片 (image_1.png)
remove_gray_watermark('image_1.png', 'result_image_1.png')