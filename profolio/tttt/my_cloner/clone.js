const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('🚀 正在启动浏览器...');
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 创建保存目录
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

    // 监听响应
    page.on('response', async (response) => {
        try {
            const url = response.url();
            const status = response.status();
            
            if (url.includes('ap.cx') && status === 200) {
                const buffer = await response.buffer();
                let urlPath = new URL(url).pathname;
                if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
                
                const filePath = path.join(distDir, urlPath);
                const dir = path.dirname(filePath);
                
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(filePath, buffer);
                console.log('✅ 已保存:', url);
            }
        } catch (e) {
            // 忽略某些无法获取 buffer 的请求
        }
    });

    try {
        console.log('🌐 正在访问目标网页...');
        await page.goto('https://spiral.ap.cx/?numPoints=2649', { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });

        // 额外等待 5 秒，确保动态脚本运行完毕
        console.log('⏳ 等待资源加载...');
        await new Promise(r => setTimeout(r, 5000));

        const content = await page.content();
        fs.writeFileSync(path.join(distDir, 'index.html'), content);
        console.log('✨ 网页结构(HTML)已保存完毕');

    } catch (err) {
        console.error('❌ 运行出错:', err.message);
    } finally {
        await browser.close();
        console.log('🏁 任务结束。请检查 dist 文件夹。');
    }
})();
