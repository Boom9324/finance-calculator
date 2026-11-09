'use strict';
const male=[
[1.22,2.11,2.39,3.39,4.12,4.43],
[1.26,2.24,2.55,3.62,4.40,4.67],
[1.35,2.50,2.85,4.05,4.92,5.13],
[1.60,3.04,3.49,4.91,5.93,6.02],
[1.90,3.69,4.25,5.93,7.12,7.11],
[2.37,4.68,5.39,6.89,8.96,8.73],
[3.05,5.91,7.20,9.14,11.83,11.29],
[4.32,8.58,10.49,13.26,17.11,16.00]
];
const female=[
[.97,1.66,1.88,2.73,3.35,3.74],
[1,1.72,1.95,2.82,3.46,3.83],
[1.12,1.90,2.14,3.06,3.73,4.09],
[1.24,2.16,2.44,3.47,4.22,4.52],
[1.44,2.53,2.86,4.03,4.88,5.13],
[1.78,3.13,3.54,4.53,5.89,6.05],
[2.29,3.94,4.70,5.96,7.71,7.68],
[3.18,5.67,6.80,8.56,11,10.62]
];
const medical=[65,65,120,180,180,180];
const loanTerms=[12,18,24,30,36,48,60];
const chubbYears={12:1,18:2,24:2,36:3,48:4,60:5,72:6};
const ppiTermYears={12:1,18:2,24:2,30:3,36:3,48:4,60:5};
const chubbMedical=[40000,40000,55000,90000,90000,90000];
const $=id=>document.getElementById(id);
const fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const parse=s=>Number(String(s).replaceAll(',',''));
const valid=s=>s!==''&&s!=='.'&&Number.isFinite(parse(s))&&parse(s)>=0;
const row=(label,value)=>`<div class="line"><span>${label}</span><span>${value}</span></div>`;
const get=id=>$(id).value;
const num=id=>parse(get(id));
const checked=name=>document.querySelector(`input[name="${name}"]:checked`).value;
const text={};
function display(id,value,lines){
  $(id+'-result').textContent=value;
  $(id+'-details').innerHTML=lines.join('');
  text[id]=value==='—'?'':lines.map(s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()).join('\n')+'\nผลลัพธ์: '+value;
}
function ppiPremium(payment,sex,age,months){
  const years=ppiTermYears[months];
  if(!Number.isFinite(payment)||payment<0||!years||!Number.isInteger(age)||age<20||age>65||!['male','female'].includes(sex))return null;
  const idx=age===20?0:age<=30?1:age<=40?2:age<=45?3:age<=50?4:age<=55?5:age<=60?6:7;
  const rate=(sex==='male'?male:female)[idx][years-1];
  const base=payment*rate/100,med=medical[years-1],total=base+med;
  return {years,rate,base,med,total,rounded:Math.round(total)};
}
function calc(){
  const lp=get('loan-principal'),lr=get('loan-rate'),lm=num('loan-years');
  $('loan-months').textContent=`จำนวนงวดอัตโนมัติ: ${lm} เดือน`;
  const loanOK=valid(lp)&&valid(lr)&&loanTerms.includes(lm);
  let loanPayment=null;
  if(loanOK){
    const p=parse(lp),r=parse(lr),i=p*r/100*(lm/12),t=p+i,raw=t/lm,rounded=Math.ceil(raw-1e-10);
    loanPayment=rounded;
    display('loan',fmt(rounded,0)+' บาท',[
      row('ยอดจัดสินเชื่อ',fmt(p)+' บาท'),row('ดอกเบี้ยต่อปี',fmt(r)+'%'),
      row('ระยะเวลาผ่อน',lm+' เดือน'),row('ดอกเบี้ยรวมตลอดสัญญา',fmt(i)+' บาท'),
      row('ดอกเบี้ยเฉลี่ยต่อเดือน',fmt(i/lm)+' บาท'),
      row('เงินต้นเฉลี่ยต่อเดือน (ไม่รวมดอกเบี้ย)',fmt(p/lm)+' บาท'),
      row('ยอดรวมเงินต้นและดอกเบี้ย',fmt(t)+' บาท'),
      row('ค่างวดรวมก่อนปัดเศษ',fmt(raw,6)+' บาท'),
      row('ค่างวดจริงหลังปัดเศษ',fmt(rounded,0)+' บาท')
    ]);
  }else display('loan','—',[]);

  // รวมสินเชื่อกับ PPI โดยใช้ค่างวดรถหลังปัดเศษ
  const enabled=$('loan-ppi-enabled').checked;
  const ageStr=get('loan-ppi-age'),age=Number(ageStr),sex=get('loan-ppi-sex');
  const ppi=enabled&&loanOK&&/^\d+$/.test(ageStr)?ppiPremium(loanPayment,sex,age,lm):null;
  $('loan-ppi-fields').classList.toggle('hidden',!enabled);
  $('loan-ppi-error').textContent=enabled&&!loanOK?'กรุณากรอกข้อมูลสินเชื่อให้ครบ':enabled&&!ppi?'กรุณาระบุอายุ 20–65 ปี':'';
  $('loan-ppi-table').textContent=enabled&&ppi?`ใช้ตารางประกัน ${ppi.years} ปี สำหรับสินเชื่อ ${lm} งวด`:'';
  $('loan-ppi-result').textContent=enabled?(ppi?fmt(ppi.rounded,0)+' บาท':'—'):'ไม่ได้เลือก PPI';
  $('loan-total-result').textContent=loanOK&&(!enabled||ppi)?fmt(loanPayment+(ppi?ppi.rounded:0),0)+' บาท':'—';
  $('loan-ppi-details').innerHTML=ppi?[
    row('อัตราเบี้ย PPI',fmt(ppi.rate)+'%'),
    row('เบี้ยหลักก่อนปัดเศษ',fmt(ppi.base)+' บาท'),
    row('ค่ารักษาพยาบาลในสูตรเบี้ย',fmt(ppi.med)+' บาท'),
    row('เบี้ย PPI หลังปัดเศษ',fmt(ppi.rounded,0)+' บาท')
  ].join(''):'';
  $('loan-confirm').disabled=!loanOK||(enabled&&!ppi);

  const cp=get('com-principal'),cr=get('com-rate'),cm=num('com-years');
  if(valid(cp)&&valid(cr)&&loanTerms.includes(cm)){
    const p=parse(cp),r=parse(cr),i=p*r/100*(cm/12),c=i*.08;
    display('commission',fmt(c)+' บาท',[
      row('ยอดจัดสินเชื่อ',fmt(p)+' บาท'),row('ดอกเบี้ยต่อปี',fmt(r)+'%'),
      row('ระยะเวลาผ่อน',cm+' เดือน'),row('ดอกเบี้ยรวม',fmt(i)+' บาท'),
      row('อัตราค่าคอมมิชชัน','8%'),row('ค่าคอมมิชชันรวม',fmt(c)+' บาท')
    ]);
  }else display('commission','—',[]);

  // เครื่อง PPI แยก รองรับงวดจริง 18 และ 30 ด้วย
  const pay=get('ppi-payment'),agePStr=get('ppi-age'),ageP=Number(agePStr),months=num('ppi-years');
  let error='';
  if(!valid(pay))error='กรุณากรอกค่างวดรถที่ถูกต้อง';
  else if(!/^\d+$/.test(agePStr)||!Number.isInteger(ageP)||ageP<20||ageP>65)error='กรุณากรอกอายุเป็นจำนวนเต็มระหว่าง 20–65 ปี';
  const result=!error?ppiPremium(parse(pay),get('ppi-sex'),ageP,months):null;
  $('ppi-error').textContent=error||(!result?'ไม่พบตารางเบี้ยสำหรับจำนวนงวดนี้':'');
  if(!result)display('ppi','—',[]);
  else display('ppi',fmt(result.rounded,0)+' บาท',[
    row('เพศ / อายุ',(get('ppi-sex')==='male'?'ชาย':'หญิง')+' / '+ageP+' ปี'),
    row('จำนวนงวดสินเชื่อจริง',months+' งวด'),
    row('ตารางประกันที่ใช้',result.years+' ปี'),
    row('ค่างวดรถฐานคำนวณ',fmt(parse(pay))+' บาท'),
    row('อัตราเบี้ยประกันหลัก',fmt(result.rate)+'%'),
    row('เบี้ยประกันหลัก',fmt(result.base)+' บาท'),
    row('ค่ารักษาพยาบาลในสูตรเบี้ย',fmt(result.med)+' บาท'),
    row('เบี้ยรวมก่อนปัดเศษ',fmt(result.total)+' บาท'),
    row('เบี้ยรวมหลังปัดเศษ',fmt(result.rounded,0)+' บาท')
  ]);
  calcChubb();
}
function makeConfirmation(){
  const lp=get('loan-principal'),lr=get('loan-rate'),months=num('loan-years');
  if(!valid(lp)||!valid(lr)||!loanTerms.includes(months))return '';
  const p=parse(lp),i=p*parse(lr)/100*(months/12);
  const car=Math.ceil((p+i)/months-1e-10);
  const enabled=$('loan-ppi-enabled').checked;
  const ageStr=get('loan-ppi-age');
  const ppi=enabled&&/^\d+$/.test(ageStr)?ppiPremium(car,get('loan-ppi-sex'),Number(ageStr),months):null;
  if(enabled&&!ppi)return '';
  const payment=ppi?ppi.rounded:0;
  const sex=get('loan-ppi-sex')==='male'?'ชาย':'หญิง';
  const parts=[
    'เรียน ลูกค้าผู้มีอุปการคุณ',
    '',
    'ขอแจ้งยืนยันรายละเอียดสินเชื่อและความคุ้มครองประกันภัยคุ้มครองสินเชื่อ (PPI) ดังนี้',
    '',
    '1. รายละเอียดสินเชื่อ',
    `ยอดจัดสินเชื่อ: ${fmt(p)} บาท`,
    `ระยะเวลาผ่อน: ${months} งวด`,
    `ค่างวดรถ: ${fmt(car,0)} บาท/เดือน`,
    `ค่างวด PPI: ${ppi?fmt(payment,0)+' บาท/เดือน':'ไม่ได้เลือกทำ PPI'}`,
    `ยอดรวมชำระต่อเดือน: ${fmt(car+payment,0)} บาท`,
    '',
    'สามารถตรวจสอบรายละเอียดผ่านแอปพลิเคชันกรุงศรี ออโต้ และชำระเงินผ่านแอปพลิเคชันธนาคารกรุงศรี ได้เลยนะครับ',
    '',
    '2. รายละเอียดประกัน PPI'
  ];
  if(ppi){
    parts.push(`เพศ / อายุ: ${sex} / ${ageStr} ปี`,
      `ระยะเวลาสินเชื่อ: ${months} งวด (ใช้ตารางเบี้ย ${ppi.years} ปี)`,
      `ค่างวด PPI: ${fmt(payment,0)} บาท/เดือน`,
      'ทุนประกันภัยและผลประโยชน์: โปรดตรวจสอบจากใบเสนอราคา/กรมธรรม์จริง');
  }else parts.push('ไม่ได้เลือกทำประกัน PPI');
  parts.push('', '3. หมายเหตุ',
    'รายละเอียดความคุ้มครอง ข้อยกเว้น การเริ่มคุ้มครอง และการจ่ายสินไหมเป็นไปตามเงื่อนไขกรมธรรม์จริง',
    'โปรดตรวจสอบยอดชำระและวันครบกำหนดจากสัญญาที่ได้รับอนุมัติ',
    '',
    'หากลูกค้ามีคนรู้จักหรือบุคคลใกล้ชิดที่สนใจออกรถจักรยานยนต์ทุกแบรนด์ สามารถแนะนำให้ติดต่อเพื่อปรึกษาสินเชื่อและประสานงานร้านค้าหรือดีลเลอร์ได้ครับ',
    '',
    'หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อได้ที่หมายเลข 02-627-6010 หรือ 1572 กด *6 ได้เลยนะครับ',
    'ขอขอบพระคุณที่ไว้วางใจใช้บริการครับ');
  return parts.join('\n');
}
function calcChubb(){
  const payment=get('chubb-payment'),monthsStr=get('chubb-months'),ageStr=get('chubb-age');
  const months=Number(monthsStr),age=Number(ageStr),years=chubbYears[months];
  let error='';
  if(!valid(payment))error='กรุณากรอกค่างวดรถเป็นจำนวนเงินที่ถูกต้อง';
  else if(!/^\d+$/.test(monthsStr)||!Object.hasOwn(chubbYears,months))error='จำนวนงวดต้องเป็น 12, 18, 24, 36, 48, 60 หรือ 72 เดือนเท่านั้น ไม่สามารถจับคู่อัตราสำหรับจำนวนงวดอื่นได้';
  else if(!/^\d+$/.test(ageStr)||!Number.isInteger(age)||age<20||age>65)error='กรุณากรอกอายุเป็นจำนวนเต็มระหว่าง 20–65 ปี';
  $('chubb-error').textContent=error;
  if(error){display('chubb','—',[]);return;}
  const sex=checked('chubb-sex'),type=checked('chubb-type');
  let rate=150;
  if(age>=56&&age<=60&&years===1)rate=sex==='male'?167:153;
  else if(age>=61){
    rate=sex==='male'?[202,158,150,150,175,156][years-1]:[175,150,150,150,150,150][years-1];
  }
  const base=parse(payment)*months,extra=base*rate/100,publicExtra=extra*2;
  const selected=type==='public'?publicExtra:extra;
  display('chubb',fmt(selected)+' บาท',[
    row('เพศ / อายุ',(sex==='male'?'ชาย':'หญิง')+' / '+age+' ปี'),
    row('ค่างวดรถ (ไม่รวม PPI)',fmt(parse(payment))+' บาท'),
    row('ระยะเวลาผ่อนจริง',months+' งวด'),
    row('ตารางประกันที่ใช้',years+' ปี'+(months===18?' (18 งวดใช้ตาราง 2 ปี)':'')),
    row('ทุนประกันเริ่มต้น (สมมติ)',fmt(base)+' บาท'),
    row('อัตราเงินเพิ่มพิเศษ',fmt(rate,0)+'%'),
    row('เงินเพิ่มพิเศษอุบัติเหตุทั่วไป',fmt(extra)+' บาท'),
    row('เงินเพิ่มพิเศษอุบัติเหตุสาธารณะ',fmt(publicExtra)+' บาท'),
    row('วงเงินค่ารักษาพยาบาลสูงสุด',fmt(chubbMedical[years-1],0)+' บาท / อุบัติเหตุ'),
    row('ประเภทที่เลือก',type==='public'?'อุบัติเหตุสาธารณะ':'อุบัติเหตุทั่วไป')
  ]);
}
function sanitize(el){
  const decimal=el.id.endsWith('-rate');
  let v=el.value.replace(decimal? /[^\d.]/g:/[^\d]/g,'');
  if(decimal){const dot=v.indexOf('.');if(dot>=0)v=v.slice(0,dot+1)+v.slice(dot+1).replaceAll('.','');}
  if(v!==el.value)el.value=v;
  if(!decimal&&v)el.value=fmt(Number(v),0);
}
for(const id of ['loan-years','com-years']){
  $(id).innerHTML='';
  for(const months of loanTerms){const opt=document.createElement('option');opt.value=String(months);opt.textContent=months+' เดือน';$(id).append(opt);}
  $(id).value='36';
}
$('ppi-years').innerHTML='';
for(const months of loanTerms){const opt=document.createElement('option');opt.value=String(months);opt.textContent=`${months} งวด (ตาราง ${ppiTermYears[months]} ปี)`;$('ppi-years').append(opt);}
$('ppi-years').value='36';
for(const el of document.querySelectorAll('input,select')){
  el.addEventListener('input',()=>{if(el.tagName==='INPUT'&&['text','number'].includes(el.type))sanitize(el);calc();});
  el.addEventListener('change',calc);
}
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
  document.querySelectorAll('section.panel').forEach(p=>p.classList.toggle('hidden',p.id!==btn.dataset.tab));
}));
document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
  const t=text[btn.dataset.copy];if(!t)return;
  try{await navigator.clipboard.writeText(t);btn.textContent='คัดลอกแล้ว';setTimeout(()=>btn.textContent='คัดลอกผล',1400);}
  catch{window.prompt('คัดลอกข้อความนี้',t);}
}));
document.querySelectorAll('[data-clear]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.clear;
  if(id==='loan'){$('loan-principal').value='';$('loan-rate').value='';$('loan-years').value='36';}
  else if(id==='commission'){$('com-principal').value='';$('com-rate').value='';$('com-years').value='36';}
  else if(id==='ppi'){$('ppi-payment').value='';$('ppi-age').value='';$('ppi-sex').value='male';$('ppi-years').value='36';}
  else{$('chubb-payment').value='';$('chubb-months').value='36';$('chubb-age').value='';document.querySelector('input[name="chubb-sex"][value="male"]').checked=true;document.querySelector('input[name="chubb-type"][value="general"]').checked=true;}
  calc();
}));
calc();
$('loan-confirm').addEventListener('click',()=>{const message=makeConfirmation();if(message){$('confirmation-text').value=message;$('confirmation-box').classList.remove('hidden');}});
$('confirmation-copy').addEventListener('click',async()=>{const value=$('confirmation-text').value;if(!value)return;try{await navigator.clipboard.writeText(value);$('confirmation-copy').textContent='คัดลอกแล้ว';setTimeout(()=>$('confirmation-copy').textContent='คัดลอกข้อความ',1400);}catch{window.prompt('คัดลอกข้อความนี้',value);}});
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
