let records = JSON.parse(localStorage.getItem('ultra_records')) || [];
let trash = JSON.parse(localStorage.getItem('ultra_trash')) || [];
let customTags = JSON.parse(localStorage.getItem('ultra_tags')) || ['超市', '咖啡', '加油'];
let editingId = null;
let currentListMode = 'active';
let chartInstance = null;

// 页面切换与刷新
function showPage(p) {
    document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
    document.getElementById(p).style.display = 'block';
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav' + p.charAt(0).toUpperCase() + p.slice(1)).classList.add('active');
    
    if(p === 'analysisPage') setTimeout(renderTagStats, 50); // 确保容器可见再画图
    if(p === 'listPage') renderList();
    renderTagLibrary();
    updateBudget();
}

// 标签学习机制
function renderTagLibrary() {
    const lib = document.getElementById('tagLibrary');
    const uniqueTags = [...new Set(customTags)];
    lib.innerHTML = uniqueTags.map(t => `<span class="tag-pill" onclick="appendTag('${t}')">${t}</span>`).join('');
}
function appendTag(t) {
    const input = document.getElementById('tags');
    let ts = input.value ? input.value.split(',').map(x => x.trim()) : [];
    if(!ts.includes(t)) ts.push(t);
    input.value = ts.join(', ');
}

// 核心保存逻辑 (修复标签学习)
function saveRecord() {
    const amt = parseFloat(document.getElementById('amount').value) || 0;
    const tagInput = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t);
    
    // 自动学习新标签
    tagInput.forEach(t => { if(!customTags.includes(t)) customTags.push(t); });
    localStorage.setItem('ultra_tags', JSON.stringify(customTags));

    const record = {
        id: editingId || Date.now(),
        account: document.getElementById('account').value,
        currency: document.getElementById('currency').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        merchant: document.getElementById('merchant').value || "未备注",
        tags: tagInput,
        amount: amt,
        date: new Date().toISOString().split('T')[0]
    };

    if(editingId) {
        records[records.findIndex(r => r.id === editingId)] = record;
    } else {
        records.push(record);
    }
    
    saveToDisk();
    cancelEdit();
    showPage('listPage');
}

// 统计页彻底修复 (移除过滤限制)
function renderTagStats() {
    const container = document.getElementById('tagStatsContainer');
    const spentOnly = records.filter(r => r.type === '支出');
    
    if (spentOnly.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>暂无支出数据</p>";
        if(chartInstance) chartInstance.destroy();
        return;
    }

    // 1. 饼图
    const catMap = {};
    spentOnly.forEach(r => catMap[r.category] = (catMap[r.category] || 0) + r.amount);
    
    const ctx = document.getElementById('pieChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catMap),
            datasets: [{ data: Object.values(catMap), backgroundColor: ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. 标签进度条 (解决统计空白)
    const tagMap = {}; let total = 0;
    spentOnly.forEach(r => {
        const itemTags = r.tags.length > 0 ? r.tags : ['无标签'];
        itemTags.forEach(t => {
            if(!tagMap[t]) tagMap[t] = { sum: 0, items: [] };
            tagMap[t].sum += r.amount;
            tagMap[t].items.push(r);
            total += r.amount;
        });
    });

    let html = "<h4>🏷️ 标签排行分析</h4>";
    Object.keys(tagMap).sort((a,b) => tagMap[b].sum - tagMap[a].sum).forEach(t => {
        const p = total > 0 ? (tagMap[t].sum / total * 100).toFixed(1) : 0;
        html += `
            <div class="tag-stat-item">
                <div style="display:flex; justify-content:space-between; font-size:13px"><b>${t}</b> <span>$${tagMap[t].sum.toFixed(2)}</span></div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${p}%"></div></div>
                <details><summary>展开 ${tagMap[t].items.length} 笔明细</summary>
                    ${tagMap[t].items.map(i => `<div style="display:flex; justify-content:space-between; font-size:11px; color:#666; padding:3px 0"><span>${i.date} · ${i.merchant}</span><b>$${i.amount.toFixed(2)}</b></div>`).join('')}
                </details>
            </div>`;
    });
    container.innerHTML = html;
}

// 邮件识别修复
function parseEmailReceipt() {
    const txt = document.getElementById('emailPasteArea').value;
    const am = txt.match(/\d+(\.\d{2})?/);
    if(am) { document.getElementById('amount').value = am[0]; alert("金额提取成功！"); }
}

// 基础流水逻辑
function renderList() {
    const list = document.getElementById('recordsList');
    const data = currentListMode === 'active' ? records : trash;
    list.innerHTML = data.slice().reverse().map(r => `
        <div class="record-card" style="border-left: 5px solid ${r.type==='支出'?'#ef4444':'#10b981'}">
            <div style="display:flex; justify-content:space-between"><b>${r.merchant}</b> <span>$${r.amount.toFixed(2)}</span></div>
            <div style="font-size:11px; color:gray; margin:4px 0;">${r.date} | ${r.account} | ${r.tags.join(', ')}</div>
            <button class="btn-util" onclick="startEdit(${r.id})">✏️ 编辑</button>
            <button class="btn-util" onclick="toggleTrash(${r.id})">${currentListMode==='active'?'🗑️ 删除':'♻️ 还原'}</button>
        </div>`).join('');
}

function startEdit(id) {
    const r = records.find(x => x.id === id);
    editingId = id;
    document.getElementById('formTitle').innerText = "✏️ 编辑记录";
    document.getElementById('saveBtn').innerText = "确认修改";
    document.getElementById('cancelEditBtn').style.display = "block";
    document.getElementById('account').value = r.account;
    document.getElementById('amount').value = r.amount;
    document.getElementById('merchant').value = r.merchant;
    document.getElementById('category').value = r.category;
    document.getElementById('tags').value = r.tags.join(', ');
    showPage('scanPage');
}

function cancelEdit() {
    editingId = null;
    document.getElementById('formTitle').innerText = "新增记录";
    document.getElementById('saveBtn').innerText = "💾 保存记录";
    document.getElementById('cancelEditBtn').style.display = "none";
    document.getElementById('amount').value = ""; document.getElementById('merchant').value = ""; document.getElementById('tags').value = "";
}

function toggleTrash(id) {
    if(currentListMode==='active') {
        trash.push(records.splice(records.findIndex(r=>r.id===id),1)[0]);
    } else {
        records.push(trash.splice(trash.findIndex(r=>r.id===id),1)[0]);
    }
    saveToDisk(); renderList(); updateBudget();
}

function saveToDisk() { localStorage.setItem('ultra_records', JSON.stringify(records)); localStorage.setItem('ultra_trash', JSON.stringify(trash)); }
function updateBudget() {
    const spent = records.filter(r=>r.type==='支出').reduce((a,b)=>a+b.amount, 0);
    const p = Math.min((spent/2000)*100, 100);
    document.getElementById('budgetFill').style.width = p+"%";
    document.getElementById('budgetText').innerText = `$${spent.toFixed(2)} / $2000`;
}
function setListMode(m) { currentListMode = m; document.getElementById('btnActive').className = m==='active'?'active':''; document.getElementById('btnTrash').className = m==='trash'?'active':''; renderList(); }
function exportData() {
    const blob = new Blob([JSON.stringify({records, trash, tags:customTags})], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '账本备份.json'; a.click();
}
function importData(e) {
    const reader = new FileReader(); reader.onload = (ev) => {
        const d = JSON.parse(ev.target.result); records = d.records; trash = d.trash; customTags = d.tags || [];
        saveToDisk(); location.reload();
    }; reader.readAsText(e.target.files[0]);
}

// 拍照识别
let selectedFiles = [];
document.getElementById('receiptInput').onchange = (e) => {
    selectedFiles = Array.from(e.target.files);
    document.getElementById('imageQueue').innerHTML = selectedFiles.map(f => `<img src="${URL.createObjectURL(f)}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">`).join('');
    document.getElementById('processBtn').style.display = "block";
    document.getElementById('reScanBtn').style.display = "block";
};
document.getElementById('processBtn').onclick = async function() {
    document.getElementById('ocrStatus').innerText = "识别中...";
    const worker = await Tesseract.createWorker('eng');
    let txt = "";
    for(let f of selectedFiles) { const { data } = await worker.recognize(f); txt += data.text; }
    await worker.terminate();
    const ams = txt.match(/\d+\.\d{2}/g);
    if(ams) document.getElementById('amount').value = Math.max(...ams.map(Number));
    document.getElementById('ocrStatus').innerText = "✅ 识别完成";
};
function resetOCR() { selectedFiles = []; document.getElementById('imageQueue').innerHTML = ""; document.getElementById('ocrStatus').innerText = "就绪"; document.getElementById('processBtn').style.display="none"; }

window.onload = () => showPage('scanPage');
let currentViewDate = new Date(); // 当前查看的月份

// 在 showPage 函数中增加日历渲染逻辑
function showPage(p) {
    document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
    document.getElementById(p).style.display = 'block';
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav' + p.charAt(0).toUpperCase() + p.slice(1)).classList.add('active');
    
    if(p === 'analysisPage') setTimeout(renderTagStats, 50);
    if(p === 'calendarPage') renderCalendar(); // 渲染日历
    if(p === 'listPage') renderList();
    renderTagLibrary();
    updateBudget();
}

function changeMonth(step) {
    currentViewDate.setMonth(currentViewDate.getMonth() + step);
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('calendarMonthTitle');
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    title.innerText = `${year}年${month + 1}月`;
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyBudget = 2000 / daysInMonth; // 假设月预算2000，算出日均线

    // 填充空白格子
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="calendar-day day-empty"></div>`;
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRecords = records.filter(r => r.date === dateStr && r.type === '支出');
        const dayTotal = dayRecords.reduce((sum, r) => sum + r.amount, 0);
        
        let statusClass = 'day-empty';
        if (dayTotal > 0) {
            statusClass = dayTotal > dailyBudget ? 'day-over' : 'day-normal';
        }
        
        const isToday = new Date().toISOString().split('T')[0] === dateStr ? 'day-today' : '';

        grid.innerHTML += `
            <div class="calendar-day ${statusClass} ${isToday}" onclick="showDayDetail('${dateStr}', ${dayTotal}, ${dailyBudget})">
                <span class="day-num">${day}</span>
                <span class="day-status">${dayTotal > 0 ? '$' + Math.round(dayTotal) : ''}</span>
            </div>
        `;
    }
}

function showDayDetail(date, total, limit) {
    const card = document.getElementById('dayDetailCard');
    const content = document.getElementById('detailContent');
    document.getElementById('detailDate').innerText = `${date} 支出详情`;
    
    const overAmount = total - limit;
    const statusText = overAmount > 0 
        ? `<span style="color:var(--danger)">🔴 超过日均限额 $${overAmount.toFixed(2)}</span>`
        : `<span style="color:var(--success)">🟢 低于日均限额</span>`;

    const dayRecords = records.filter(r => r.date === date && r.type === '支出');
    const itemsHtml = dayRecords.map(r => `
        <div style="display:flex; justify-content:space-between; font-size:13px; margin:5px 0; border-bottom:1px solid #eee; padding-bottom:3px;">
            <span>${r.merchant} (${r.category})</span>
            <b>$${r.amount.toFixed(2)}</b>
        </div>
    `).join('');

    content.innerHTML = `
        <div style="margin-bottom:10px; font-weight:bold;">当日总计：$${total.toFixed(2)}</div>
        <div style="margin-bottom:15px; font-size:12px;">${statusText} (日基准: $${limit.toFixed(2)})</div>
        ${itemsHtml || '<div style="color:gray">全天无支出记录</div>'}
    `;
    card.style.display = 'block';
}