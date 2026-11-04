 'use strict';
const form=document.querySelector('#bookingForm');
const date=form.elements.date,today=new Date();date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const status=document.querySelector('#bookingStatus');status.textContent='感謝您的填寫！此為預約流程示範，資料不會傳送。';status.setAttribute('tabindex','-1');status.focus();});
const mapFrame=document.querySelector('#cityMap');
function updateMapViewport(){const rect=mapFrame.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();const visible=rect.bottom>header.bottom&&rect.top<innerHeight;const topInset=Math.max(0,Math.min(rect.height,header.bottom-rect.top));mapFrame.contentWindow?.postMessage({type:'map-visibility',visible},location.origin);mapFrame.contentWindow?.postMessage({type:'map-inset',top:topInset},location.origin)}
let scheduled=false;function scheduleViewport(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;updateMapViewport()})}addEventListener('scroll',scheduleViewport,{passive:true});addEventListener('resize',scheduleViewport);mapFrame.addEventListener('load',updateMapViewport);updateMapViewport();
document.querySelectorAll('.life-grid a').forEach((a,i)=>a.addEventListener('click',()=>mapFrame.contentWindow?.postMessage({type:'map-theme',theme:['park','transit','food'][i]},location.origin)));

function alignMap(){const header=document.querySelector('.site-header');const target=mapFrame.getBoundingClientRect().top+window.scrollY-header.getBoundingClientRect().height;window.scrollTo({top:Math.max(0,target),behavior:'instant'});scheduleViewport();}
document.querySelectorAll('a[href="#cityMap"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();alignMap()}));
addEventListener('message',e=>{if(e.source!==mapFrame.contentWindow||e.origin!==location.origin)return;if(e.data?.type==='map-align')alignMap()});
