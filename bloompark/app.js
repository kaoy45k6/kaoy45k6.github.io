/* BLOOMPARK VR SALAD BOWL — static, dependency-free interactive collection */
(() => {
  'use strict';
  const projects = Array.isArray(window.BLOOMPARK_PROJECTS) ? window.BLOOMPARK_PROJECTS : [];
  const $ = (id) => document.getElementById(id);
  const grid = $('projects');
  const state = { region: '全部', search: '', view: 'grid', current: null, visible: [...projects] };
  let returnFocus = null;
  let timer = null;
  let featuredIndex = 0;
  let featureTransitionTimer = null;
  const featured = [0, 6, 1, 8].map(n => projects[n]).filter(Boolean);
  featured.forEach(project => { const image = new Image(); image.src = project.cover; });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeLink = href => {
    try { const url = new URL(href, window.location.href); return ['https:','http:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  const coverFallback = (img) => { img.classList.add('image-failed'); img.setAttribute('data-cover-unavailable','true'); };
  document.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement && event.target.closest('.project-cover,.hero-feature-media,.modal-photo')) coverFallback(event.target);
  }, true);

  function getProjects() {
    const query = state.search.trim().toLocaleLowerCase('zh-TW');
    return projects.filter(p => (state.region === '全部' || p.region === state.region) &&
      (!query || [p.name, p.subtitle, p.location, ...p.links.map(v => v.label)].join(' ').toLocaleLowerCase('zh-TW').includes(query)));
  }
  const cardHTML = (p, idx) => {
    const feature = state.view === 'grid' && !state.search && state.region === '全部' && [0,7].includes(idx);
    return `<button class="project-card reveal ${feature ? 'featured' : ''}" type="button" data-id="${safeText(p.id)}" aria-label="查看 ${safeText(p.name)} 專案及 VR 場景">
      <div class="project-cover"><div class="project-bg-number" aria-hidden="true">${safeText(p.id)}</div><img src="${safeText(p.cover)}" alt="${safeText(p.name)} 原始專案封面" loading="lazy" decoding="async"></div>
      <div class="project-card-head"><span class="project-number">PROJECT ${safeText(p.id)}</span><span class="project-category">${safeText(p.region)} / VR 720°</span></div>
      <div class="project-info"><div class="project-location">${safeText(p.location.replace(' | ', ' · '))}</div><h3>${safeText(p.name)}</h3><p class="project-subtitle">${safeText(p.subtitle)}</p><div class="project-bottom"><span>VIEW PROJECT <span style="color:var(--cyan)">/</span> ${String(p.links.length).padStart(2,'0')} SCENES</span><span aria-hidden="true">↗</span></div></div>
    </button>`;
  };
  let revealObserver;
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) {entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }});
    }, {rootMargin: '0px 0px -45px 0px', threshold: .06});
  }
  function reveal(nodes) {
    nodes.forEach(node => { if (!revealObserver) node.classList.add('is-visible'); else revealObserver.observe(node); });
  }
  function renderProjects() {
    state.visible = getProjects();
    grid.classList.toggle('list-mode', state.view === 'list');
    grid.innerHTML = state.visible.map(cardHTML).join('');
    reveal(grid.querySelectorAll('.reveal'));
    $('no-results').hidden = state.visible.length > 0;
    $('result-count').textContent = `SHOWING ${String(state.visible.length).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')} PROJECTS`;
  }
  const filters = [...document.querySelectorAll('.filter')];
  filters.forEach(btn => {
    const count = btn.dataset.region === '全部' ? projects.length : projects.filter(p => p.region === btn.dataset.region).length;
    btn.querySelector('sup').textContent = String(count).padStart(2,'0');
    btn.addEventListener('click', () => {
      state.region = btn.dataset.region;
      filters.forEach(b => { const active = b === btn; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
      renderProjects();
    });
  });
  $('total-projects').textContent = String(projects.length).padStart(2,'0');
  $('total-vr').textContent = String(projects.reduce((n,p) => n + p.links.length,0)).padStart(2,'0');
  const searchInput = $('project-search');
  searchInput.addEventListener('input',e => {state.search = e.target.value;renderProjects();});
  $('clear-filters').addEventListener('click', () => {state.region='全部';state.search='';searchInput.value='';filters[0].click();});
  $('grid-view').addEventListener('click', () => changeView('grid'));
  $('list-view').addEventListener('click', () => changeView('list'));
  function changeView(view) {
    state.view=view;
    for(const v of ['grid','list']) {
      $(v+'-view').classList.toggle('selected', v===view);
      $(v+'-view').setAttribute('aria-pressed', String(v===view));
    }
    renderProjects();
  }
  renderProjects();
  reveal(document.querySelectorAll('.reveal:not(.project-card)'));
  grid.addEventListener('click', event => {
    const card = event.target.closest('.project-card');
    if (card) openProject(card.dataset.id);
  });

  function renderFeature(immediate = false) {
    if (!featured.length) return;
    const p = featured[featuredIndex];
    const img = $('hero-feature-image');
    const wrap = $('hero-feature-wrap');
    const applyContent = () => {
      img.classList.remove('image-failed');
      img.src = p.cover;
      img.alt = p.name + ' VR 專案封面';
      $('hero-feature-region').textContent = p.location.replace(' | ', ' · ');
      $('hero-feature-title').textContent = p.name;
      $('feature-index').textContent = `${String(featuredIndex+1).padStart(2,'0')} / ${String(featured.length).padStart(2,'0')}`;
      $('hero-feature-link').setAttribute('aria-label', `查看 ${p.name} VR 專案`);
      $('hero-feature-link').dataset.id = p.id;
      requestAnimationFrame(() => wrap.classList.remove('is-transitioning'));
    };
    if (featureTransitionTimer) clearTimeout(featureTransitionTimer);
    wrap.classList.add('is-ready');
    if (immediate || reduceMotion) {
      wrap.classList.remove('is-transitioning');
      applyContent();
      return;
    }
    wrap.classList.add('is-transitioning');
    featureTransitionTimer = window.setTimeout(applyContent, 180);
  }
  function moveFeature(n) { featuredIndex = (featuredIndex+n+featured.length)%featured.length; renderFeature(); resetFeatureTimer(); }
  function resetFeatureTimer() { if (timer) clearInterval(timer); timer = null; if(!reduceMotion && featured.length>1 && !document.hidden && !$('project-modal').hidden) return; if (!reduceMotion && featured.length>1 && !document.hidden) timer = setInterval(() => {featuredIndex=(featuredIndex+1)%featured.length;renderFeature();},8000); }
  $('feature-prev').addEventListener('click',()=>moveFeature(-1));
  $('feature-next').addEventListener('click',()=>moveFeature(1));
  $('hero-feature-link').addEventListener('click',event=>{event.preventDefault();openProject(event.currentTarget.dataset.id);});
  document.addEventListener('visibilitychange', resetFeatureTimer);
  renderFeature(true); resetFeatureTimer();

  const modal = $('project-modal');
  const panel = modal.querySelector('.modal-panel');
  function openProject(id, fromHash=false) {
    const p = projects.find(x=>x.id===id);
    if(!p) return;
    if (modal.hidden) returnFocus=document.activeElement;
    state.current=p;
    $('modal-number').textContent = `PROJECT / ${p.id}`;
    $('modal-location').textContent = p.location.replace(' | ', ' · ');
    $('modal-title').textContent = p.name;
    $('modal-subtitle').textContent = p.subtitle;
    $('modal-image').classList.remove('image-failed');
    $('modal-image').src=p.cover;
    $('modal-image').alt=p.name+' 原始專案封面';
    $('modal-links-count').textContent=`${String(p.links.length).padStart(2,'0')} SCENES`;
    const links=$('modal-links');
    links.replaceChildren();
    p.links.forEach(item=>{
      const a=document.createElement('a'); a.textContent=item.label+' ↗';a.href=safeLink(item.url);a.target='_blank';a.rel='noopener noreferrer';links.append(a);
    });
    const main=safeLink(p.links[0]?.url || p.vr || '');
    $('modal-main-link').href=main || '#work';
    $('modal-main-link').hidden=!main;
    const book=safeLink(p.booking);
    $('modal-book').href=book || '#work';
    $('modal-book').hidden=!book;
    modal.hidden=false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    panel.scrollTop=0;
    $('modal-close').focus({preventScroll:true});
    if(!fromHash) history.replaceState(null,'','#project-'+id);
    if(timer)clearInterval(timer);timer=null;
  }
  function closeProject() {
    if(modal.hidden)return;
    modal.hidden=true;
    modal.setAttribute('aria-hidden','true');
    state.current=null;
    document.body.classList.remove('modal-open');
    history.replaceState(null,'','#work');
    if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
    else $('work-title').setAttribute('tabindex','-1');
    resetFeatureTimer();
  }
  function adjacentProject(step) {
    if(!state.current)return;
    const collection = state.visible.length && state.visible.some(p=>p.id===state.current.id) ? state.visible : projects;
    const index=collection.findIndex(p=>p.id===state.current.id);
    const next=collection[(index+step+collection.length)%collection.length];
    if(next)openProject(next.id);
  }
  $('modal-close').addEventListener('click',closeProject);
  modal.querySelector('[data-close]').addEventListener('click',closeProject);
  $('modal-prev').addEventListener('click',()=>adjacentProject(-1));
  $('modal-next').addEventListener('click',()=>adjacentProject(1));
  document.addEventListener('keydown',e=>{
    if(modal.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closeProject();}
    else if(e.key==='ArrowRight'){adjacentProject(1);}
    else if(e.key==='ArrowLeft'){adjacentProject(-1);}
    else if(e.key==='Tab'){
      const candidates=[...panel.querySelectorAll('button:not([disabled]), a[href]:not([hidden])')].filter(x=>x.getClientRects().length>0);
      if(!candidates.length)return;
      const first=candidates[0],last=candidates[candidates.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  // Deep-link: #project-01 ... #project-16
  function fromHash(){const m=window.location.hash.match(/^#project-(\d{2})$/);if(m)openProject(m[1],true);else if(!modal.hidden)closeProject();}
  window.addEventListener('hashchange',fromHash);
  if(/^#project-\d{2}$/.test(window.location.hash)) fromHash();

  $('menu-toggle').addEventListener('click',()=>{
    const expanded=$('menu-toggle').getAttribute('aria-expanded')==='true';
    $('menu-toggle').setAttribute('aria-expanded',String(!expanded));
    $('primary-nav').classList.toggle('open',!expanded);
    $('menu-toggle').setAttribute('aria-label',expanded?'開啟選單':'關閉選單');
  });
  document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>{
    $('menu-toggle').setAttribute('aria-expanded','false');
    $('primary-nav').classList.remove('open');
  }));
  $('year').textContent=String(new Date().getFullYear());
  let scrollTicking=false;
  function onScroll(){
    if(scrollTicking)return;scrollTicking=true;
    requestAnimationFrame(()=>{
      $('scroll-progress').style.width=`${100*window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)}%`;
      $('header').classList.toggle('scrolled',window.scrollY>20);
      scrollTicking=false;
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  if('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(!e.isIntersecting)return;document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+(e.target.id||'top')));});
    },{rootMargin:'-30% 0px -55% 0px'});
    [document.querySelector('.hero'),$('work'),$('about')].forEach((el,i)=>{if(i===0)el.id='top';sectionObserver.observe(el);});
  }
})();
