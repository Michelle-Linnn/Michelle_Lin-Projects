// ---------------- SPA 页面切换 ----------------
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");
document.querySelectorAll("nav button").forEach(btn=>{
  btn.onclick = ()=>{
    pages.forEach(p=>p.classList.remove("active"));
    document.getElementById(btn.dataset.page).classList.add("active");
    pageTitle.textContent = btn.textContent;
  };
});

// ---------------- 数据存储 ----------------
let records = JSON.parse(localStorage.getItem("records")) || [];
let loans = JSON.parse(localStorage.getItem("loans")) || [];

let accounts = {
  "BoA  A saving":0,
  "BoA  B check":0,
  "ICBC 储蓄":0,
  "BoA 信用卡":0,
  "现金":0
};

// ---------------- DOM ----------------
const scanBtn = document.getElementById("scanBtn");
const receiptInput = document.getElementById("receiptInput");
const ocrStatus = document.getElementById("ocrStatus");

const merchant = document.getElementById("merchant");
const amount = document.getElementById("amount");
const dateInput = document.getElementById("date");
const type = document.getElementById("type");
const accountInput = document.getElementById("account");
const itemsContainer = document.getElementById("items");

const saveBtn = document.getElementById("saveBtn");

const loanPerson = document.getElementById("loanPerson");
const loanDirection = document.getElementById("loanDirection");
const loanAmount = document.getElementById("loanAmount");
const loanAccount = document.getElementById("loanAccount");
const loanNote = document.getElementById("loanNote");
const loanSave = document.getElementById("loanSave");
const loanSettle = document.getElementById("loanSettle");
const loanList = document.getElementById("loanList");

const recordsPage = document.getElementById("recordsPage");
const accountsDiv = document.getElementById("accounts");
const chartDiv = document.getElementById("chart");

// ---------------- OCR 功能 ----------------
scanBtn.onclick = () => receiptInput.click();

receiptInput.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;

  ocrStatus.textContent = "OCR 初始化中…";

  try {
    const worker = await Tesseract.createWorker({
      logger: m => {
        if (m.status === "recognizing text") {
          const percent = (m.progress * 100).toFixed(0);
          ocrStatus.textContent = `OCR 识别中 ${percent}%`;
        }
      }
    });

    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const { data } = await worker.recognize(file);
    await worker.terminate();

    ocrStatus.textContent = "OCR 识别完成！请检查自动填入的数据";

    // 自动填充商户
    const lines = data.text.split("\n").map(l=>l.trim()).filter(Boolean);
    if(lines[0]) merchant.value = lines[0];

    // 自动填充总金额
    const nums = data.text.match(/\$?\d+\.\d{2}/g);
    if(nums) amount.value = Math.max(...nums.map(n=>parseFloat(n.replace("$","")))).toFixed(2);

    // 明细独立行
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

  } catch(err){
    console.error(err);
    ocrStatus.textContent = "OCR 识别失败，请使用清晰小票重试";
  }

  receiptInput.value = "";
};

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

  recalcAccounts();
  renderRecords();
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

// ---------------- 借贷 ----------------
loanSave.onclick=()=>{
  const loan={id:Date.now(), person:loanPerson.value, direction:loanDirection.value,
              amount:parseFloat(loanAmount.value), account:loanAccount.value, note:loanNote.value,
              date:new Date().toISOString(), settled:false};
  if(!loan.person||!loan.amount){alert("请填写对象和金额");return;}
  loans.push(loan);
  localStorage.setItem("loans",JSON.stringify(loans));

  loanPerson.value=""; loanAmount.value=""; loanNote.value="";
  recalcAccounts(); renderLoans();
};

loanSettle.onclick=()=>{
  loans.forEach(l=>l.settled=true);
  localStorage.setItem("loans",JSON.stringify(loans));
  recalcAccounts(); renderLoans();
};

function renderLoans(){
  loanList.innerHTML="";
  loans.filter(l=>!l.settled).forEach(l=>{
    loanList.innerHTML+=`<div>${l.person} ｜ ${l.direction==='lend'?'欠你':'你欠'} $${l.amount.toFixed(2)} ｜ ${l.account}</div>`;
  });
}

// ---------------- 账户计算 ----------------
function recalcAccounts(){
  Object.keys(accounts).forEach(a=>accounts[a]=0);
  records.forEach(r=>{
    if(r.type==='expense') accounts[r.account]-=r.total;
    if(r.type==='income') accounts[r.account]+=r.total;
    if(r.type==='transfer'){
      accounts[r.account]-=r.total;
      if(accounts[r.target]!==undefined) accounts[r.target]+=r.total;
    }
  });
  loans.forEach(l=>{
    if(!l.settled){
      if(l.direction==='lend') accounts[l.account]-=l.amount;
      if(l.direction==='borrow') accounts[l.account]+=l.amount;
    }
  });
  renderAccounts(); renderChart();
}

function renderAccounts(){
  accountsDiv.innerHTML="";
  for(let a in accounts){
    accountsDiv.innerHTML+=`<div>${a}: $${accounts[a].toFixed(2)}</div>`;
  }
}

function renderChart(){
  chartDiv.innerHTML="";
  const now=new Date();
  const m=now.getMonth(), y=now.getFullYear();
  const sum={};
  records.forEach(r=>{
    const d=new Date(r.date);
    if(r.type==='expense'&&d.getMonth()===m&&d.getFullYear()===y){
      sum[r.account]=(sum[r.account]||0)+r.total;
    }
  });
  const total=Object.values(sum).reduce((a,b)=>a+b,0);
  if(!total){ chartDiv.textContent="本月暂无支出"; return;}
  for(let k in sum){
    const p=((sum[k]/total)*100).toFixed(1);
    chartDiv.innerHTML+=`<div class="bar"><div class="bar-inner" style="width:${p}%">${k} $${sum[k].toFixed(2)} (${p}%)</div></div>`;
  }
}

// ---------------- 初始化 ----------------
renderRecords(); recalcAccounts(); renderLoans();
