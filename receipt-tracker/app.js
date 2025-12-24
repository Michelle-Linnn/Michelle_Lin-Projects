const scanBtn = document.getElementById("scanBtn");
const receiptInput = document.getElementById("receiptInput");
const ocrStatus = document.getElementById("ocrStatus");
const ocrProgressBar = document.getElementById("ocrProgressBar");

const merchant = document.getElementById("merchant");
const amount = document.getElementById("amount");
const dateInput = document.getElementById("date");
const type = document.getElementById("type");
const accountInput = document.getElementById("account");
const itemsContainer = document.getElementById("items");

const saveBtn = document.getElementById("saveBtn");
const recordsPage = document.getElementById("recordsPage");

let records = JSON.parse(localStorage.getItem("records")) || [];

// ---------------- OCR 上传 ----------------
scanBtn.onclick = () => receiptInput.click();

receiptInput.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;

  ocrStatus.textContent = "OCR 初始化中…";
  ocrProgressBar.style.width = "0%";

  try {
    // 压缩图片
    const compressed = await compressImage(file, 1080);

    const worker = await Tesseract.createWorker({
      logger: m => {
        if (m.status === "recognizing text") {
          const percent = (m.progress*100).toFixed(0);
          ocrStatus.textContent = `OCR 识别中 ${percent}%`;
          ocrProgressBar.style.width = percent+"%";
        } else if(m.status==="loading tesseract core") {
          ocrStatus.textContent = "OCR 加载核心模块…";
        } else if(m.status==="loading language traineddata") {
          ocrStatus.textContent = "OCR 加载语言包…";
        }
      }
    });

    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const { data } = await worker.recognize(compressed);
    await worker.terminate();

    ocrStatus.textContent = "OCR 识别完成！请检查明细";
    ocrProgressBar.style.width = "100%";

    fillOCRData(data.text);

  } catch(err){
    console.error(err);
    ocrStatus.textContent = "OCR 识别失败，请上传清晰小票重试";
    ocrProgressBar.style.width = "0%";
  }

  receiptInput.value = "";
};

// ---------------- 压缩图片 ----------------
function compressImage(file, maxWidth){
  return new Promise(resolve=>{
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
    };
    img.onload = ()=>{
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>{
        resolve(blob);
      },"image/jpeg",0.9);
    };
    reader.readAsDataURL(file);
  });
}

// ---------------- 填充 OCR 数据 ----------------
function fillOCRData(text){
  const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
  if(lines[0]) merchant.value = lines[0];
  const nums = text.match(/\$?\d+\.\d{2}/g);
  if(nums) amount.value = Math.max(...nums.map(n=>parseFloat(n.replace("$","")))).toFixed(2);

  itemsContainer.innerHTML = "";
  lines.filter(l=>/\d+\.\d{2}/.test(l)).forEach(l=>{
    const match = l.match(/^(.+?)\s*\$?(\d+\.\d{2})$/);
    if(match){
      const div = document.createElement("div");
      div.className="itemRow";
      div.innerHTML = `<input type="text" class="itemName" value="${match[1]}"/> $ 
                       <input type="number" class="itemPrice" step="0.01" value="${parseFloat(match[2])}"/>`;
      itemsContainer.appendChild(div);
    }
  });

  // 监听明细变化自动求和
  Array.from(itemsContainer.querySelectorAll(".itemPrice")).forEach(inp=>{
    inp.oninput = updateTotalFromItems;
  });
  updateTotalFromItems();
}

// ---------------- 自动求和 ----------------
function updateTotalFromItems(){
  let sum = 0;
  Array.from(itemsContainer.querySelectorAll(".itemPrice")).forEach(inp=>{
    sum += parseFloat(inp.value)||0;
  });
  amount.value = sum.toFixed(2);
}

// ---------------- 保存支出 ----------------
saveBtn.onclick = () => {
  const itemRows = Array.from(itemsContainer.querySelectorAll(".itemRow"));
  const items = itemRows.map(r=>{
    const name = r.querySelector(".itemName").value;
    const price = parseFloat(r.querySelector(".itemPrice").value);
    return {name, price};
  }).filter(i=>i.name && i.price);

  const record = {
    id: Date.now(),
    merchant: merchant.value || "Unknown",
    date: dateInput.value || new Date().toISOString().split("T")[0],
    total: parseFloat(amount.value),
    type: type.value,
    account: accountInput.value,
    items
  };
  if(!record.total){alert("请输入金额"); return;}
  records.push(record);
  localStorage.setItem("records",JSON.stringify(records));

  merchant.value=""; amount.value=""; itemsContainer.innerHTML=""; dateInput.value="";
  renderRecords(); renderChart();
};

// ---------------- 渲染记录 ----------------
function renderRecords(){
  recordsPage.innerHTML="";
  records.slice().reverse().forEach(r=>{
    const card = document.createElement("div");
    card.className="card";
    card.innerHTML=`${r.date} ｜ ${r.merchant} ｜ $${r.total.toFixed(2)}`;

    const detail = document.createElement("div");
    detail.style.display="none";
    detail.style.marginTop="6px";
    r.items.forEach(i=>{
      const row = document.createElement("div");
      row.innerHTML = `<input type="text" value="${i.name}" class="itemName"/> $ 
                       <input type="number" value="${i.price}" class="itemPrice" step="0.01"/>`;
      detail.appendChild(row);
    });

    card.appendChild(detail);
    card.onclick = ()=> detail.style.display = detail.style.display==="none"?"block":"none";
    recordsPage.appendChild(card);
  });
}

// ---------------- 支出分析图表 ----------------
function renderChart(){
  let chartDiv = document.getElementById("chart");
  if(!chartDiv){
    chartDiv = document.createElement("div");
    chartDiv.id="chart";
    document.body.appendChild(chartDiv);
  }
  chartDiv.innerHTML="<h3>本月账户支出比例</h3>";
  const now=new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const sum={};
  records.forEach(r=>{
    const d=new Date(r.date);
    if(r.type==="expense" && d.getMonth()===month && d.getFullYear()===year){
      sum[r.account]=(sum[r.account]||0)+r.total;
    }
  });
  const total = Object.values(sum).reduce((a,b)=>a+b,0);
  if(!total){ chartDiv.innerHTML+="<div>本月暂无支出</div>"; return;}
  for(let k in sum){
    const p=((sum[k]/total)*100).toFixed(1);
    chartDiv.innerHTML+=`<div class="bar"><div class="bar-inner" style="width:${p}%">${k} $${sum[k].toFixed(2)} (${p}%)</div></div>`;
  }
}

// ---------------- 初始化 ----------------
renderRecords(); renderChart();
