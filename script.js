(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;

  // Preloader
  const preloader = $('#preloader');
  const loaderPercent = $('#loaderPercent');
  let p = 0;
  const timer = setInterval(() => {
    p = Math.min(100, p + Math.ceil(Math.random()*14));
    if (loaderPercent) loaderPercent.textContent = `${p}%`;
    if (p >= 100) {
      clearInterval(timer);
      setTimeout(() => preloader?.classList.add('done'), 180);
    }
  }, 55);
  window.addEventListener('load', () => setTimeout(() => { if (loaderPercent) loaderPercent.textContent='100%'; preloader?.classList.add('done'); }, 650));

  // Local time in Sri Lanka.
  const updateClock = () => {
    const node = $('#localTime');
    if (!node) return;
    node.textContent = new Intl.DateTimeFormat('en-GB', {hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'Asia/Colombo'}).format(new Date()) + ' LKT';
  };
  updateClock(); setInterval(updateClock, 30000);
  $('#year').textContent = new Date().getFullYear();

  // Theme system.
  const themes = ['blue','yellow'];
  const setTheme = theme => {
    if (!themes.includes(theme)) theme='blue';
    root.dataset.theme = theme;
    localStorage.setItem('musaddiq-theme', theme);
    $$('[data-set-theme]').forEach(b => b.classList.toggle('active', b.dataset.setTheme === theme));
  };
  setTheme(localStorage.getItem('musaddiq-theme') || 'blue');
  const cycleTheme = () => setTheme(themes[(themes.indexOf(root.dataset.theme)+1)%themes.length]);
  const themeMenu = $('#themeMenu'), themeButton = $('#themeButton');
  themeButton?.addEventListener('click', e => {
    e.stopPropagation(); const open = themeMenu.hidden; themeMenu.hidden = !open; themeButton.setAttribute('aria-expanded', String(open));
  });
  $$('[data-set-theme]').forEach(b => b.addEventListener('click', () => {setTheme(b.dataset.setTheme); themeMenu.hidden=true; themeButton?.setAttribute('aria-expanded','false')}));
  document.addEventListener('click', e => { if (themeMenu && !themeMenu.hidden && !e.target.closest('.theme-switcher')) {themeMenu.hidden=true; themeButton?.setAttribute('aria-expanded','false');} });
  $('#footerTheme')?.addEventListener('click', cycleTheme);

  // Mobile navigation.
  const menuToggle = $('#menuToggle'), navLinks = $('#navLinks');
  menuToggle?.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open); body.classList.toggle('menu-open', open); menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-link').forEach(a => a.addEventListener('click', () => {navLinks.classList.remove('open');body.classList.remove('menu-open');menuToggle?.setAttribute('aria-expanded','false')}));

  // Scroll state / reveal / active section.
  const header = $('#siteHeader'), backToTop = $('#backToTop');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.12});
  $$('.reveal').forEach(el => revealObserver.observe(el));
  const navSections = ['home','about','skills','journey','contact'].map(id=>document.getElementById(id)).filter(Boolean);
  const onScroll = () => {
    const y = scrollY;
    header?.classList.toggle('scrolled', y > 30);
    backToTop?.classList.toggle('visible', y > 700);
    let active='home';
    navSections.forEach(sec => { if (y >= sec.offsetTop - 180) active = sec.id; });
    $$('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${active}`));
    const line = $('#journeyLine'), progress = $('#journeyProgress');
    if (line && progress) {
      const rect = line.getBoundingClientRect(), viewport = innerHeight;
      const pct = Math.max(0, Math.min(1, (viewport*.72 - rect.top) / Math.max(1, rect.height)));
      progress.style.height = `${pct*100}%`;
    }
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  backToTop?.addEventListener('click', () => scrollTo({top:0,behavior:'smooth'}));

  // Workspace tabs.
  $$('[data-workspace-tab]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.workspaceTab;
    $$('[data-workspace-tab]').forEach(b => {b.classList.toggle('active', b===btn);b.setAttribute('aria-selected', String(b===btn));});
    $$('[data-workspace-panel]').forEach(p => p.classList.toggle('active', p.dataset.workspacePanel===id));
  }));

  // Comparison slider.
  const compareRange = $('#compareRange'), compareAfter = $('#compareAfter'), compareHandle = $('#compareHandle');
  const updateCompare = () => { const v = Number(compareRange?.value || 52); if(compareAfter) compareAfter.style.clipPath=`inset(0 ${100-v}% 0 0)`; if(compareHandle) compareHandle.style.left=`${v}%`; };
  compareRange?.addEventListener('input', updateCompare); updateCompare();

  // Skill universe.
  const skills = {
    iot:{icon:'IoT',category:'Connected systems',name:'IoT Engineering',description:'Studying connected devices, sensing, automation and the software layers that turn device data into useful real-world systems.',meter:68,level:'Currently expanding'},
    dotnet:{icon:'.NET',category:'Web framework',name:'ASP.NET Core Development',description:'Building backend services, APIs and full-stack workflows using structured C# code, validation and maintainable architecture.',meter:88,level:'Strong practical skill'},
    csharp:{icon:'C#',category:'Programming',name:'C# & Backend Logic',description:'Object-oriented programming, services, authentication flows, business rules and server-side application development.',meter:86,level:'Strong practical skill'},
    sql:{icon:'SQL',category:'Database',name:'SQL Server & Data Modelling',description:'Relational schema design, normalization, queries, data access and application/database integration.',meter:84,level:'Strong practical skill'},
    api:{icon:'API',category:'Integration',name:'REST API Development',description:'Designing clear HTTP endpoints, DTOs, authentication, validation and integrations for web, mobile and connected clients.',meter:87,level:'Strong practical skill'},
    frontend:{icon:'</>',category:'Interface',name:'Frontend & UI Development',description:'Responsive layouts, interaction logic, dashboards and interfaces using HTML, CSS, JavaScript and Angular.',meter:80,level:'Active practical skill'}
  };
  $$('.skill-node').forEach(btn => btn.addEventListener('click', () => {
    const s = skills[btn.dataset.skill]; if(!s) return;
    $$('.skill-node').forEach(b=>b.classList.toggle('active', b===btn));
    $('#skillIcon').textContent=s.icon; $('#skillCategory').textContent=s.category; $('#skillName').textContent=s.name; $('#skillDescription').textContent=s.description; $('#skillMeter').style.width=`${s.meter}%`; $('#skillLevel').textContent=s.level;
  }));

  // Live design lab.
  const preview = $('#labPreview'), accent = $('#accentRange'), radius = $('#radiusRange'), blur = $('#blurRange');
  const updateLab = () => {
    if (!preview) return;
    preview.style.setProperty('--lab-hue', accent?.value || 215);
    preview.style.setProperty('--lab-radius', `${radius?.value || 24}px`);
    preview.style.setProperty('--lab-blur', `${blur?.value || 20}px`);
    $('#accentOutput').textContent=`${accent?.value || 215}°`; $('#radiusOutput').textContent=`${radius?.value || 24}px`; $('#blurOutput').textContent=`${blur?.value || 20}px`;
  };
  [accent,radius,blur].forEach(el=>el?.addEventListener('input',updateLab));
  const presets={minimal:[210,8,2],blue:[215,24,20],yellow:[48,30,24]};
  $$('[data-lab-preset]').forEach(b=>b.addEventListener('click',()=>{const p=presets[b.dataset.labPreset];if(!p)return;accent.value=p[0];radius.value=p[1];blur.value=p[2];$$('[data-lab-preset]').forEach(x=>x.classList.toggle('active',x===b));updateLab()}));
  $('#resetLab')?.addEventListener('click',()=>{accent.value=215;radius.value=24;blur.value=20;$$('[data-lab-preset]').forEach(x=>x.classList.toggle('active',x.dataset.labPreset==='blue'));updateLab()}); updateLab();

  // Principles slider.
  const cards = $$('.feedback-card'); let feedbackIndex=0;
  const showFeedback = i => { feedbackIndex=(i+cards.length)%cards.length; cards.forEach((c,n)=>c.classList.toggle('active',n===feedbackIndex)); };
  $('#feedbackPrev')?.addEventListener('click',()=>showFeedback(feedbackIndex-1)); $('#feedbackNext')?.addEventListener('click',()=>showFeedback(feedbackIndex+1));

  // Contact to WhatsApp.
  const form = $('#contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form); const status=$('#formStatus');
    if(!form.checkValidity()){form.reportValidity();status.textContent='Please complete the required fields.';return;}
    const msg = `Hello Musaddiq, I would like to discuss a project.\n\nName: ${data.get('name')}\nWhatsApp: ${data.get('phone')}\nProject type: ${data.get('service')}\nCurrent stage: ${data.get('stage')}\n\nProject details:\n${data.get('message')}`;
    status.textContent='Opening WhatsApp with your project details…';
    window.open(`https://wa.me/94714659380?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  });

  // Assistant.
  const assistantPanel=$('#assistantPanel'), assistantLauncher=$('#assistantLauncher'), assistantClose=$('#assistantClose'), messages=$('#assistantMessages'), assistantInput=$('#assistantInput');
  const openAssistant=()=>{assistantPanel.hidden=false;setTimeout(()=>assistantInput?.focus(),50)}; const closeAssistant=()=>assistantPanel.hidden=true;
  assistantLauncher?.addEventListener('click',()=>assistantPanel.hidden?openAssistant():closeAssistant()); assistantClose?.addEventListener('click',closeAssistant);
  const answer = q => {
    const s=q.toLowerCase();
    if(/stud(y|ying)|iot|current|now/.test(s)) return 'Musaddiq is currently an IoT Engineering Student, expanding his software background into sensors, connected devices, automation and physical-digital systems.';
    if(/x10|co.?founder|company|role/.test(s)) return 'Musaddiq is a Co-Founder of X10 THINK, where he contributes to software development, solution planning, branding and digital product execution.';
    if(/skill|technolog|stack|use/.test(s)) return 'His practical stack includes C#, ASP.NET Core, REST APIs, SQL Server, Entity Framework Core, Dapper, Angular, JavaScript, HTML/CSS, Java, Git/GitHub and growing IoT engineering skills.';
    if(/project|work|build/.test(s)) return 'Selected projects include the DevSphere/AptLens Smart Recruitment Matching Platform, a role-based Task Management System, TaskFlow productivity dashboard, Digital Horizon e-learning system and other API/database projects.';
    if(/contact|whatsapp|phone|hire|talk/.test(s)) return 'You can contact Musaddiq on WhatsApp at +94 71 465 9380 or email mhd.musaddiq2007@gmail.com. The project form on this page can prepare a WhatsApp enquiry.';
    if(/service/.test(s)) return 'Services include IoT solution planning, full-stack web development, REST APIs, SQL Server/database design, dashboards and software solution planning.';
    if(/education|study|inara/.test(s)) return 'Musaddiq is pursuing software engineering studies and is now also studying IoT Engineering. His background includes an HND path in Software Engineering, A/L subjects in ICT, Accounting and Business Studies, and practical software engineering training at Unicom TIC.';
    return 'I can help with Musaddiq’s IoT studies, X10 THINK role, software skills, projects, services, education or contact details.';
  };
  const addMessage=(text,type)=>{const d=document.createElement('div');d.className=`assistant-message ${type}`;d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;};
  const ask=q=>{if(!q.trim())return;addMessage(q.trim(),'user');setTimeout(()=>addMessage(answer(q),'bot'),160)};
  $('#assistantForm')?.addEventListener('submit',e=>{e.preventDefault();const q=assistantInput.value;assistantInput.value='';ask(q)}); $$('.assistant-suggestions button').forEach(b=>b.addEventListener('click',()=>ask(b.textContent)));

  // Command palette.
  const palette=$('#commandPalette'), search=$('#commandSearch'), commandButtons=$$('#commandList button'), empty=$('#commandEmpty'); let commandIndex=0;
  const visibleCommands=()=>commandButtons.filter(b=>!b.hidden);
  const highlight=()=>visibleCommands().forEach((b,i)=>b.classList.toggle('active',i===commandIndex));
  const openCommand=()=>{palette.hidden=false;body.classList.add('modal-open');search.value='';commandButtons.forEach(b=>b.hidden=false);empty.hidden=true;commandIndex=0;highlight();setTimeout(()=>search.focus(),20)};
  const closeCommand=()=>{palette.hidden=true;body.classList.remove('modal-open')};
  const execute = c => {closeCommand(); if(c==='theme')cycleTheme(); else if(c==='assistant')openAssistant(); else {const map={home:'#home',projects:'#projects',contact:'#contact',lab:'#lab'}; document.querySelector(map[c])?.scrollIntoView({behavior:'smooth'});} };
  $('#commandButton')?.addEventListener('click',openCommand); $('#footerCommand')?.addEventListener('click',openCommand); $$('[data-close-command]').forEach(x=>x.addEventListener('click',closeCommand)); commandButtons.forEach(b=>b.addEventListener('click',()=>execute(b.dataset.command)));
  search?.addEventListener('input',()=>{const q=search.value.toLowerCase();commandButtons.forEach(b=>b.hidden=!(`${b.innerText} ${b.dataset.keywords||''}`.toLowerCase().includes(q)));commandIndex=0;empty.hidden=visibleCommands().length>0;highlight()});
  search?.addEventListener('keydown',e=>{const list=visibleCommands();if(!list.length)return;if(e.key==='ArrowDown'){e.preventDefault();commandIndex=(commandIndex+1)%list.length;highlight()}if(e.key==='ArrowUp'){e.preventDefault();commandIndex=(commandIndex-1+list.length)%list.length;highlight()}if(e.key==='Enter'){e.preventDefault();execute(list[commandIndex].dataset.command)}});
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette.hidden?openCommand():closeCommand();return}
    if(e.key==='Escape'){if(!palette.hidden)closeCommand();if(!assistantPanel.hidden)closeAssistant();return}
    if(e.key.toLowerCase()==='t' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){cycleTheme()}
  });

  // Cursor and subtle magnetic/tilt behavior.
  const dot=$('.cursor-dot'), ring=$('.cursor-ring');
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){body.classList.add('cursor-ready');addEventListener('mousemove',e=>{dot.style.left=ring.style.left=`${e.clientX}px`;dot.style.top=ring.style.top=`${e.clientY}px`});$$('a,button,input,textarea,select,.tilt-card').forEach(el=>{el.addEventListener('mouseenter',()=>body.classList.add('cursor-hover'));el.addEventListener('mouseleave',()=>body.classList.remove('cursor-hover'))});$$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});const card=$('.tilt-card');card?.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect();const rx=((e.clientY-r.top)/r.height-.5)*-6, ry=((e.clientX-r.left)/r.width-.5)*7;card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`});card?.addEventListener('mouseleave',()=>card.style.transform='')}

  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}
})();
