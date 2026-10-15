'use strict';
const male=[[1.22,2.11,2.39,3.39,4.12,4.43],[1.26,2.24,2.55,3.62,4.40,4.67],[1.35,2.50,2.85,4.05,4.92,5.13],[1.60,3.04,3.49,4.91,5.93,6.02],[1.90,3.69,4.25,5.93,7.12,7.11],[2.37,4.68,5.39,6.89,8.96,8.73],[3.05,5.91,7.20,9.14,11.83,11.29],[4.32,8.58,10.49,13.26,17.11,16.00]];
const female=[[.97,1.66,1.88,2.73,3.35,3.74],[1,1.72,1.95,2.82,3.46,3.83],[1.12,1.90,2.14,3.06,3.73,4.09],[1.24,2.16,2.44,3.47,4.22,4.52],[1.44,2.53,2.86,4.03,4.88,5.13],[1.78,3.13,3.54,4.53,5.89,6.05],[2.29,3.94,4.70,5.96,7.71,7.68],[3.18,5.67,6.80,8.56,11,10.62]];
const medical=[65,65,120,180,180,180];
const $=id=>document.getElementById(id);
const fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const parse=s=>Number(String(s).replaceAll(',',''));
const valid=s=>s!==''&&s!=='.'&&Number.isFinite(parse(s))&&parse(s)>=0;
const row=(label,value)=>`<div class="line"><span>${label}</span><span>${value}</span></div>`;
const get=id=>$(id).value;
const num=id=>parse(get(id));
const text={};
function display(id,value,lines){$(id+'-result').textContent=value;$(id+'-details').innerHTML=lines.join('');text[id]=value==='—'?'':lines.map(s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()).join('\n')+'\nผลลัพธ์: '+value;}
function calc(){
 const lp=get('loan-principal'),lr=get('loan-rate'),ly=num('loan-years'),n=ly*12;
 $('loan-months').textContent=`จำนวนงวดอัตโนมัติ: ${n} เดือน`;
 if(valid(lp)&&valid(lr)&&n>0){const p=parse(lp),r=parse(lr),i=p*r/100*ly,t=p+i,raw=t/n;const rounded=Math.ceil(raw-1e-10);display('loan',fmt(rounded,0)+' บาท',[row('ยอดจัด',fmt(p)+' บาท'),row('ดอกเบี้ยรวม',fmt(i)+' บาท'),row('ยอดรวมเงินต้นและดอกเบี้ย',fmt(t)+' บาท'),row('จำนวนงวด',n+' เดือน'),row('ค่างวดก่อนปัดเศษ',fmt(raw,6)+' บาท')]);}else display('loan','—',[]);
 const cp=get('com-principal'),cr=get('com-rate'),cy=num('com-years');
 if(valid(cp)&&valid(cr)){const p=parse(cp),r=parse(cr),i=p*r/100*cy,c=i*.08;display('commission',fmt(c)+' บาท',[row('ยอดจัดสินเชื่อ',fmt(p)+' บาท'),row('ดอกเบี้ยต่อปี',fmt(r)+'%'),row('ระยะเวลาผ่อน',`${cy} ปี (${cy*12} งวด)`),row('ดอกเบี้ยรวม',fmt(i)+' บาท'),row('อัตราค่าคอมมิชชัน','8%'),row('ค่าคอมมิชชันรวม',fmt(c)+' บาท')]);}else display('commission','—',[]);
 const pay=get('ppi-payment'),ageStr=get('ppi-age'),age=Number(ageStr),years=num('ppi-years');let error='';
 if(!valid(pay))error='กรุณากรอกค่างวดรถที่ถูกต้อง';else if(!/^\d+$/.test(ageStr)||!Number.isInteger(age)||age<20||age>65)error='กรุณากรอกอายุเป็นจำนวนเต็มระหว่าง 20–65 ปี';
 $('ppi-error').textContent=error;
 if(error){display('ppi','—',[]);return;}
 const ranges=['20','21–30','31–40','41–45','46–50','51–55','56–60','61–65'];const idx=age===20?0:age<=30?1:age<=40?2:age<=45?3:age<=50?4:age<=55?5:age<=60?6:7;
 const rate=(get('ppi-sex')==='male'?male:female)[idx][years-1],base=parse(pay)*rate/100,med=medical[years-1],total=base+med,rounded=Math.round(total);
 display('ppi',fmt(rounded,0)+' บาท',[row('ช่วงอายุอ้างอิง',ranges[idx]+' ปี'),row('เพศ',get('ppi-sex')==='male'?'ชาย':'หญิง'),row('ระยะเวลาสินเชื่อ',`${years} ปี (${years*12} งวด)`),row('อัตราเบี้ยประกันหลัก',fmt(rate)+'%'),row('เบี้ยประกันหลัก',fmt(base)+' บาท'),row('ค่ารักษาพยาบาลอุบัติเหตุ',fmt(med)+' บาท'),row('เบี้ยรวมก่อนปัดเศษ',fmt(total)+' บาท'),row('เบี้ยรวมหลังปัดเศษ',fmt(rounded,0)+' บาท')]);
}
function sanitize(el){const decimal=el.id.endsWith('-rate');let v=el.value.replace(decimal?/[^\d.]/g:/[^\d]/g,'');if(decimal){const dot=v.indexOf('.');if(dot>=0)v=v.slice(0,dot+1)+v.slice(dot+1).replaceAll('.','');}if(v!==el.value)el.value=v;if(!decimal&&v)el.value=fmt(Number(v),0);}
for(const [id,max] of [['loan-years',6],['com-years',5],['ppi-years',6]]){for(let i=1;i<=max;i++){const opt=document.createElement('option');opt.value=i;opt.textContent=id==='loan-years'?`${i} ปี`:`${i} ปี (${i*12} งวด)`;$(id).append(opt);}$(id).value=id==='ppi-years'?'3':'3';}
const inputs=document.querySelectorAll('input,select');for(const el of inputs){el.addEventListener('input',()=>{if(el.tagName==='INPUT')sanitize(el);calc();});el.addEventListener('change',calc);}
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('section.panel').forEach(p=>p.classList.toggle('hidden',p.id!==btn.dataset.tab));}));
document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{const t=text[btn.dataset.copy];if(!t)return;try{await navigator.clipboard.writeText(t);btn.textContent='คัดลอกแล้ว';setTimeout(()=>btn.textContent='คัดลอกผล',1400);}catch{window.prompt('คัดลอกข้อความนี้',t);}}));
document.querySelectorAll('[data-clear]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.clear;if(id==='loan'){$('loan-principal').value='';$('loan-rate').value='';$('loan-years').value='3';}else if(id==='commission'){$('com-principal').value='';$('com-rate').value='';$('com-years').value='3';}else{$('ppi-payment').value='';$('ppi-age').value='';$('ppi-sex').value='male';$('ppi-years').value='3';}calc();}));
calc();if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
