const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    // 启动浏览器
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 监听所有网络请求，抓取 JS 和 CSS 文件
    page.on('response', async (response) => {
        const url = response.url();
        const filePath = path.resolve(__dirname, 'dist', new URL(url).pathname.slice(1) || 'index.html');
        
        // 只抓取该域名下的资源
        if (url.includes('ap.cx')) {
            const buffer = await response.buffer();
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            
            // 如果是 HTML 根路径，保存为 index.html
            const finalPath = filePath.endsWith('/') ? path.join(filePath, 'index.html') : filePath;
            fs.writeFileSync(finalPath, buffer);
            console.log(`已下载: ${url}`);
        }
    });

    // 访问目标地址，并带上参数
    const targetUrl = 'https://spiral.ap.cx/?numPoints=2649';
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    // 获取最终生成的完整 HTML 结构（包括动态生成的 DOM）
    const content = await page.content();
    fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), content);

    console.log('--- 克隆完成！资源已保存在 /dist 文件夹中 ---');
    await browser.close();
})();