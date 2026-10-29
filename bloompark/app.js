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
  const featured = [0, 6, 1, 8].map(n => projects[n]).filter(Boolean);
  featured.forEach(project => { const image = new Image(); image.src = project.cover; });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrowIcon = (direction = 'up-right') => {
    const paths = {
      'up-right': 'M6 18 18 6 M7 6h11v11',
      'down-right': 'M6 6 18 18 M18 7v11H7',
      right: 'M4 12h16 M13 5l7 7-7 7',
      left: 'M20 12H4 M11 5l-7 7 7 7'
    };
    return `<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[direction] || paths['up-right']}"/></svg>`;
  };
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
      <div class="project-info"><div class="project-location">${safeText(p.location.replace(' | ', ' · '))}</div><h3>${safeText(p.name)}</h3><p class="project-subtitle">${safeText(p.subtitle)}</p><div class="project-bottom"><span>VIEW PROJECT <span style="color:var(--cyan)">/</span> ${String(p.links.length).padStart(2,'0')} SCENES</span><span aria-hidden="true">${arrowIcon()}</span></div></div>
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

  // Seamless image-first carousel, with edge clones, GPU transforms and mobile swipe.
  const carouselViewport = $('hero-carousel-viewport');
  const carouselTrack = $('hero-carousel-track');
  let carouselPosition = 1;
  let sliding = false;
  let pointerStart = null;
  let suppressFeatureClickUntil = 0;
  const featureSlides = featured.length > 1
    ? [featured[featured.length - 1], ...featured, featured[0]]
    : [...featured];

  function featureSlideHTML(p, i) {
    const label = `查看 ${p.name} VR 專案`;
    return `<section class="hero-slide" data-feature-id="${safeText(p.id)}" role="group" aria-roledescription="投影片" aria-label="${i + 1} / ${featureSlides.length}">
      <div class="hero-feature-media visual-fallback"><img src="${safeText(p.cover)}" alt="${safeText(p.name)} VR 專案封面" ${i === 1 ? 'fetchpriority="high"' : 'loading="eager"'} decoding="async" draggable="false"></div>
      <div class="hero-feature-top"><span><i></i> SELECTED / VR EXPERIENCE</span><span class="hero-live">● LIVE COLLECTION</span></div>
      <div class="hero-feature-bottom"><div><span>${safeText(p.location.replace(' | ', ' · '))}</span><h2>${safeText(p.name)}</h2></div><a href="#project-${safeText(p.id)}" data-feature-link="${safeText(p.id)}" class="hero-feature-enter" aria-label="${safeText(label)}" title="${safeText(label)}">${arrowIcon()}</a></div>
    </section>`;
  }
  carouselTrack.innerHTML = featureSlides.map(featureSlideHTML).join('');
  const slideNodes = [...carouselTrack.querySelectorAll('.hero-slide')];

  function setTrackPosition(animate = true, dragPx = 0) {
    carouselTrack.style.transition = animate && !reduceMotion ? '' : 'none';
    carouselTrack.style.transform = `translate3d(calc(${-carouselPosition * 100}% + ${dragPx}px),0,0)`;
  }
  function logicalFeatureIndex() {
    return (carouselPosition - 1 + featured.length) % featured.length;
  }
  function updateSlideStatus() {
    featuredIndex = logicalFeatureIndex();
    slideNodes.forEach((slide, i) => {
      const active = i === carouselPosition;
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelectorAll('a').forEach(link => link.tabIndex = active ? 0 : -1);
    });
    $('feature-index').textContent = `${String(featuredIndex + 1).padStart(2, '0')} / ${String(featured.length).padStart(2, '0')}`;
  }
  function finishSlide() {
    if (featured.length < 2) return;
    if (carouselPosition === 0) {
      carouselPosition = featured.length;
      setTrackPosition(false);
    } else if (carouselPosition === featured.length + 1) {
      carouselPosition = 1;
      setTrackPosition(false);
    }
    void carouselTrack.offsetWidth; // make the seamless loop snap instantaneous before the next transition
    sliding = false;
    updateSlideStatus();
  }
  carouselTrack.addEventListener('transitionend', e => {
    if (e.target !== carouselTrack || e.propertyName !== 'transform') return;
    finishSlide();
  });

  function stepFeature(step, userInitiated = false) {
    if (featured.length < 2 || sliding) return;
    sliding = true;
    carouselPosition += step;
    setTrackPosition();
    updateSlideStatus();
    if (reduceMotion) finishSlide();
    if (userInitiated) resetFeatureTimer();
  }
  function resetFeatureTimer() {
    clearInterval(timer);
    timer = null;
    if (reduceMotion || featured.length < 2 || document.hidden ||
        !$('project-modal').hidden || (window.matchMedia('(hover: hover)').matches && carouselViewport.matches(':hover')) ||
        carouselViewport.contains(document.activeElement) || pointerStart) return;
    timer = setInterval(() => stepFeature(1), 6800);
  }
  $('feature-prev').addEventListener('click', () => stepFeature(-1, true));
  $('feature-next').addEventListener('click', () => stepFeature(1, true));
  carouselViewport.addEventListener('click', event => {
    const link = event.target.closest('[data-feature-link]');
    if (!link) return;
    event.preventDefault();
    if (performance.now() < suppressFeatureClickUntil) return;
    openProject(link.dataset.featureLink);
  });
  carouselViewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (featured.length < 2 || sliding) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId, drag: false, horizontal: false };
    clearInterval(timer); timer = null;
  });
  carouselViewport.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.id || sliding) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (!pointerStart.horizontal && Math.abs(dy) > Math.abs(dx) + 5) return;
    if (Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy)) {
      pointerStart.horizontal = true;
      pointerStart.drag = true;
      carouselViewport.classList.add('is-dragging');
      if (!carouselViewport.hasPointerCapture(event.pointerId)) carouselViewport.setPointerCapture(event.pointerId);
    }
    if (pointerStart.horizontal) {
      setTrackPosition(false, Math.max(-carouselViewport.clientWidth, Math.min(carouselViewport.clientWidth, dx)));
    }
  });
  function endSwipe(event, cancelled = false) {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    const { x, drag } = pointerStart;
    pointerStart = null;
    carouselViewport.classList.remove('is-dragging');
    const distance = event.clientX - x;
    if (drag) suppressFeatureClickUntil = performance.now() + 450;
    if (!cancelled && drag && Math.abs(distance) > Math.min(65, carouselViewport.clientWidth * .16)) {
      stepFeature(distance < 0 ? 1 : -1, true);
    } else {
      setTrackPosition();
      resetFeatureTimer();
    }
  }
  carouselViewport.addEventListener('pointerup', event => endSwipe(event));
  carouselViewport.addEventListener('pointercancel', event => endSwipe(event, true));
  carouselViewport.addEventListener('pointerenter', () => { clearInterval(timer); timer = null; });
  carouselViewport.addEventListener('pointerleave', resetFeatureTimer);
  carouselViewport.addEventListener('focusin', () => { clearInterval(timer); timer = null; });
  carouselViewport.addEventListener('focusout', resetFeatureTimer);
  document.addEventListener('visibilitychange', resetFeatureTimer);
  setTrackPosition(false);
  updateSlideStatus();
  resetFeatureTimer();

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
      const a=document.createElement('a'); a.textContent=item.label+' ';a.insertAdjacentHTML('beforeend', arrowIcon());a.href=safeLink(item.url);a.target='_blank';a.rel='noopener noreferrer';links.append(a);
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
