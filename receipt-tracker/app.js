const API_KEY = "AIzaSyDnR_pLdVUv4xyakNbzxFiu2IDZGGmkdIA";
let records = JSON.parse(localStorage.getItem("records")) || [];
let currentCurrency = "USD";
let selectedFiles = [];

// 初始化
document.getElementById('date').valueAsDate = new Date();

// --- 页面路由 ---
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId).style.display = 'block';
    document.getElementById('nav' + pageId.charAt(0).toUpperCase() + pageId.slice(1, -4)).classList.add('active');
    if(pageId === 'recordsPage') renderRecords();
    if(pageId === 'analysisPage') renderAnalysis();
}

// --- Fetch Style 连拍逻辑 ---
document.getElementById('receiptInput').onchange = (e) => {
    const files = Array.from(e.target.files);
    selectedFiles = selectedFiles.concat(files);
    renderQueue();
    document.getElementById('startAiBtn').style.display = 'block';
    document.getElementById('ocrStatus').innerHTML = `已捕获 ${selectedFiles.length} 个片段，准备分析...`;
};

function renderQueue() {
    const queueDiv = document.getElementById('imageQueue');
    queueDiv.innerHTML = "";
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const div = document.createElement('div');
            div.className = "queue-item";
            div.innerHTML = `<img src="${ev.target.result}"><span class="remove-tag" onclick="removeFile(${index})">✕</span>`;
            queueDiv.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderQueue();
    if(selectedFiles.length === 0) document.getElementById('startAiBtn').style.display = 'none';
}

// --- AI 深度分析 (支持合并多图) ---
document.getElementById('startAiBtn').onclick = async () => {
    const status = document.getElementById('ocrStatus');
    const bar = document.getElementById('ocrProgressBar');
    
    status.innerHTML = "✨ Gemini AI 正在合并分析长收据...";
    bar.style.width = "30%";

    try {
        const imageParts = await Promise.all(selectedFiles.map(async (file) => {
            const base64 = await fileToBase64(file);
            return { inline_data: { mime_type: file.type, data: base64 } };
        }));

        const prompt = {
            text: "这些图片是一张长收据的不同部分，请合并分析并去重。提取：商家名(merchant)、日期(date: YYYY-MM-DD)、所有商品(items: [{name, price}])、税费(tax)、最终总金额(total)。只返回纯 JSON 格式，不要 Markdown。"
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [prompt, ...imageParts] }] })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(aiText.replace(/```json|```/gi, "").trim());

        applyAiResult(result);
        status.innerHTML = "✅ 识别并合并成功！";
        bar.style.width = "100%";
        document.getElementById('startAiBtn').style.display = 'none';
        selectedFiles = [];
    } catch (err) {
        status.innerHTML = "❌ 分析失败，请确保图片重叠且清晰";
        console.error(err);
    }
};

function applyAiResult(data) {
    if(data.merchant) document.getElementById('merchant').value = data.merchant;
    if(data.date) document.getElementById('date').value = data.date;
    if(data.tax) document.getElementById('tax').value = data.tax;
    if(data.total) document.getElementById('amount').value = data.total;

    const list = document.getElementById('itemsList');
    list.innerHTML = "";
    if(data.items) {
        data.items.forEach(item => addItemRow(item.name, item.price));
    }
}

// --- 基础功能 ---
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
    });
}

function addItemRow(name = "", price = "") {
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `
        <input type="text" placeholder="商品名称" class="item-name" value="${name}" style="flex:2">
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
    const amount = parseFloat(document.getElementById('amount').value);
    if(!amount) return alert("请输入金额");

    const record = {
        id: Date.now(),
        merchant: document.getElementById('merchant').value || "未知",
        date: document.getElementById('date').value,
        amount,
        currency: currentCurrency,
        type: document.getElementById('type').value
    };

    records.push(record);
    localStorage.setItem("records", JSON.stringify(records));
    alert("已入账！");
    location.reload();
};

// --- 历史与分析渲染 ---
function renderRecords() {
    const container = document.getElementById('recordsPage');
    container.innerHTML = "<h3>最近账单</h3>";
    records.slice().reverse().forEach(r => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style = "display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:white; padding:15px; border-radius:15px;";
        div.innerHTML = `<div><strong>${r.merchant}</strong><br><small style="color:#9ca3af">${r.date}</small></div>
                        <div style="font-weight:bold; color:var(--primary)">${r.currency==='USD'?'$':'¥'}${r.amount.toFixed(2)}</div>`;
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
            datasets: [{ data: Object.values(stats), backgroundColor: ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}