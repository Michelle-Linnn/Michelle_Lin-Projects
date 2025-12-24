// --- 配置 ---
const API_KEY = "AIzaSyDnR_pLdVUv4xyakNbzxFiu2IDZGGmkdIA"; 
let records = JSON.parse(localStorage.getItem("records")) || [];
let currentCurrency = "USD";

// 初始化日期
document.getElementById('date').valueAsDate = new Date();

// --- 页面切换 ---
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId).style.display = 'block';
    document.getElementById('nav' + pageId.charAt(0).toUpperCase() + pageId.slice(1, -4)).classList.add('active');
    if(pageId === 'recordsPage') renderRecords();
    if(pageId === 'analysisPage') renderAnalysis();
}

// --- AI 识别 ---
document.getElementById('scanBtn').onclick = () => document.getElementById('receiptInput').click();

document.getElementById('receiptInput').onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    // 显示预览
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = document.getElementById('previewImg');
        img.src = ev.target.result;
        img.style.display = 'block';
    };
    reader.readAsDataURL(file);

    const status = document.getElementById('ocrStatus');
    const bar = document.getElementById('ocrProgressBar');
    status.innerHTML = "🌀 AI 正在分析小票...";
    bar.style.width = "40%";

    try {
        const base64Data = await fileToBase64(file);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "请分析这张小票，提取：商家名(merchant)、日期(date: YYYY-MM-DD)、总金额(total)、税费(tax)、商品明细(items: [{name, price}])。请只返回 JSON 格式，不要包含 Markdown 标签或解释。" },
                        { inline_data: { mime_type: file.type, data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(aiResponse.replace(/```json|```/gi, "").trim());

        // 填充数据
        if(result.merchant) document.getElementById('merchant').value = result.merchant;
        if(result.date) document.getElementById('date').value = result.date;
        if(result.total) document.getElementById('amount').value = result.total;
        if(result.tax) document.getElementById('tax').value = result.tax;

        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = "";
        if(result.items) {
            result.items.forEach(item => addItemRow(item.name, item.price));
        }

        status.innerHTML = "✅ 识别完成";
        bar.style.width = "100%";
    } catch (err) {
        status.innerHTML = "❌ 识别失败，请手动输入";
        console.error(err);
    }
};

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = e => reject(e);
    });
}

// --- 表单功能 ---
function addItemRow(name = "", price = "") {
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `
        <input type="text" placeholder="商品" class="item-name" value="${name}" style="flex:2">
        <input type="number" placeholder="金额" class="item-price" value="${price}" style="flex:1" oninput="updateTotal()">
        <button onclick="this.parentElement.remove(); updateTotal()">✕</button>
    `;
    document.getElementById('itemsList').appendChild(div);
}

function updateTotal() {
    let sum = 0;
    document.querySelectorAll('.item-price').forEach(i => sum += parseFloat(i.value) || 0);
    const tax = parseFloat(document.getElementById('tax').value) || 0;
    document.getElementById('amount').value = (sum + tax).toFixed(2);
}

function setCurrency(curr) {
    currentCurrency = curr;
    document.getElementById('currUSD').classList.toggle('active', curr === 'USD');
    document.getElementById('currCNY').classList.toggle('active', curr === 'CNY');
    document.getElementById('currencySymbol').textContent = curr === 'USD' ? '$' : '¥';
}

document.getElementById('saveBtn').onclick = () => {
    const record = {
        id: Date.now(),
        merchant: document.getElementById('merchant').value || "未知商家",
        date: document.getElementById('date').value,
        amount: parseFloat(document.getElementById('amount').value) || 0,
        currency: currentCurrency,
        type: document.getElementById('type').value
    };

    records.push(record);
    localStorage.setItem("records", JSON.stringify(records));
    alert("已保存！");
    location.reload();
};

// --- 渲染历史与分析 ---
function renderRecords() {
    const container = document.getElementById('recordsPage');
    container.innerHTML = "<h3>最近记录</h3>";
    records.slice().reverse().forEach(r => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<div><strong>${r.merchant}</strong><br><small>${r.date}</small></div>
                        <div style="color:red">-${r.currency === 'USD' ? '$' : '¥'}${r.amount}</div>`;
        container.appendChild(div);
    });
}

let chart;
function renderAnalysis() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const stats = {};
    records.forEach(r => stats[r.merchant] = (stats[r.merchant] || 0) + r.amount);

    if(chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats),
            datasets: [{ data: Object.values(stats), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'] }]
        }
    });
}