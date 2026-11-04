 'use strict';
const form=document.querySelector('#bookingForm');
const date=form.elements.date,today=new Date();date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const status=document.querySelector('#bookingStatus');status.textContent='感謝您的填寫！此為預約流程示範，資料不會傳送。';status.setAttribute('tabindex','-1');status.focus();});

const mapFrame=document.querySelector('#cityMap'),exitTour=document.querySelector('#exitTour');let immersive=false,savedScroll=0,scheduled=false;
const sendMap=data=>mapFrame.contentWindow?.postMessage(data,location.origin);
function updateMapViewport(){const rect=mapFrame.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();sendMap({type:'map-visibility',visible:immersive||(rect.bottom>header.bottom&&rect.top<innerHeight)});sendMap({type:'map-inset',top:immersive?0:Math.max(0,Math.min(rect.height,header.bottom-rect.top))});}
function scheduleViewport(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;updateMapViewport()})}
function fitTour(){if(immersive)document.documentElement.style.setProperty('--tour-height',(window.visualViewport?.height||innerHeight)+'px');scheduleViewport()}
function enterTour(){if(innerWidth>=900)return false;if(immersive)return true;savedScroll=window.scrollY;immersive=true;document.body.classList.add('tour-mode');document.body.style.top=-savedScroll+'px';exitTour.hidden=false;for(const el of document.querySelectorAll('.site-header,.hero,.section-heading,.map-foot,.section,.site-footer'))el.inert=true;fitTour();return true;}
function leaveTour(){if(!immersive)return;sendMap({type:'map-pause'});immersive=false;document.body.classList.remove('tour-mode');document.body.style.top='';exitTour.hidden=true;for(const el of document.querySelectorAll('[inert]'))el.inert=false;window.scrollTo({top:savedScroll,behavior:'instant'});document.querySelector('.hero .button').focus({preventScroll:true});scheduleViewport();}
function alignMap(){if(enterTour())return;const header=document.querySelector('.site-header');const target=mapFrame.getBoundingClientRect().top+window.scrollY-header.getBoundingClientRect().height;window.scrollTo({top:Math.max(0,target),behavior:'instant'});scheduleViewport();}
let pendingTheme=null;function sendTheme(theme){pendingTheme=theme;sendMap({type:'map-theme',theme});}
mapFrame.addEventListener('load',()=>{updateMapViewport();if(pendingTheme){sendMap({type:'map-theme',theme:pendingTheme});pendingTheme=null}});
document.querySelectorAll('a[href="#cityMap"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();alignMap();const card=a.closest('.life-grid article');const i=card?[...card.parentElement.children].indexOf(card):-1;sendTheme(i>=0?['park','transit','food'][i]:'all')}));
exitTour.addEventListener('click',leaveTour);addEventListener('keydown',e=>{if(e.key==='Escape'&&immersive)leaveTour()});addEventListener('scroll',scheduleViewport,{passive:true});addEventListener('resize',()=>{if(innerWidth>=900&&immersive)leaveTour();fitTour()});window.visualViewport?.addEventListener('resize',fitTour);
addEventListener('message',e=>{if(e.source!==mapFrame.contentWindow||e.origin!==location.origin)return;if(e.data?.type==='map-align')alignMap();if(e.data?.type==='map-exit')leaveTour()});updateMapViewport();
