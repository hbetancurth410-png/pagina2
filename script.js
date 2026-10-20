const SUBJ = {
  matematicas:{n:'Matemáticas',ico:'➗',c:'#dbe8ff'},
  ciencias:{n:'Ciencias naturales',ico:'🧪',c:'#d9f3dd'},
  historia:{n:'Historia',ico:'📖',c:'#ffe7d1'},
  lenguaje:{n:'Lenguaje',ico:'✏️',c:'#fff3b8'}
};
const KEY = 'tarealand.tareas';
const defaults = [
  {id:1,t:'Área de un rectángulo',s:'matematicas',st:'pendiente'},
  {id:2,t:'Informe de laboratorio',s:'ciencias',st:'entregada'},
  {id:3,t:'Ensayo',s:'historia',st:'entregada'},
  {id:4,t:'Análisis literario',s:'lenguaje',st:'atrasada'},
  {id:5,t:'Mapa conceptual',s:'ciencias',st:'pendiente'}
];
let tasks; try{ tasks = JSON.parse(localStorage.getItem(KEY)) || defaults }catch(e){ tasks = defaults }
let filter='todas', page=1; const PER=4;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(tasks))}catch(e){}};
const $=id=>document.getElementById(id);

function render(){
  const f = tasks.filter(x=>filter==='todas'||x.st===filter);
  const pages = Math.max(1,Math.ceil(f.length/PER));
  if(page>pages) page=pages;
  const view = f.slice((page-1)*PER,page*PER);
  $('list').innerHTML = view.length ? view.map(x=>{
    const s=SUBJ[x.s];
    return `<div class="task">
      <div class="t-ico" style="background:${s.c}">${s.ico}</div>
      <div class="t-info"><b>${esc(x.t)}</b><span>${s.n}</span><br><span class="st ${x.st}">${x.st}</span></div>
      <div class="t-btns">
        <button class="ib" data-a="edit" data-id="${x.id}" aria-label="Editar">✎</button>
        <button class="ib del" data-a="del" data-id="${x.id}" aria-label="Eliminar">🗑</button>
      </div></div>`;
  }).join('') : '<div class="empty">No hay tareas en esta categoría.</div>';
  $('pager').innerHTML =
    `<button ${page===1?'disabled':''} data-p="${page-1}">‹</button>` +
    Array.from({length:pages},(_,i)=>`<button class="${i+1===page?'on':''}" data-p="${i+1}">${i+1}</button>`).join('') +
    `<button ${page===pages?'disabled':''} data-p="${page+1}">›</button>`;
}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

$('tabs').onclick=e=>{
  const b=e.target.closest('.tab'); if(!b) return;
  filter=b.dataset.f; page=1;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t===b));
  render();
};
$('pager').onclick=e=>{const b=e.target.closest('button'); if(b&&!b.disabled){page=+b.dataset.p;render()}};
$('list').onclick=e=>{
  const b=e.target.closest('button'); if(!b) return;
  const id=+b.dataset.id, t=tasks.find(x=>x.id===id);
  if(b.dataset.a==='del'){ tasks=tasks.filter(x=>x.id!==id); save(); render(); }
  if(b.dataset.a==='edit'){
    $('subject').value=t.s; $('title').value=t.t; $('title').focus();
    tasks=tasks.filter(x=>x.id!==id); save(); render();
    $('form').scrollIntoView({behavior:'smooth'});
  }
};
$('newBtn').onclick=()=>{ clearForm(); $('title').focus(); $('form').scrollIntoView({behavior:'smooth'}); };

/* Archivo */
const drop=$('drop'), fi=$('fileInput');
drop.onclick=()=>fi.click();
drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fi.click()}};
['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>{ if(e.dataTransfer.files[0]){fi.files=e.dataTransfer.files;showFile()} });
fi.onchange=showFile;
function showFile(){
  const f=fi.files[0]; if(!f) return;
  $('fname').textContent=f.name;
  $('ext').textContent=(f.name.split('.').pop()||'').toUpperCase().slice(0,4);
  $('fsize').textContent=(f.size/1048576).toFixed(1)+' MB';
  $('fileBox').classList.add('show');
}
$('rmFile').onclick=()=>{fi.value='';$('fileBox').classList.remove('show')};

/* Formulario */
function clearForm(){
  $('taskForm').reset(); $('rmFile').onclick(); $('time').value='23:59';
  $('msg').textContent=''; $('msg').className='msg';
}
$('clear').onclick=clearForm;
$('taskForm').onsubmit=e=>{
  e.preventDefault();
  const m=$('msg'), title=$('title').value.trim();
  if(!title||!$('date').value){
    m.className='msg err'; m.textContent='Escribe el título y elige la fecha de entrega.'; return;
  }
  tasks.unshift({id:Date.now(),t:title,s:$('subject').value,st:'entregada'});
  save(); filter='todas'; page=1;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.f==='todas'));
  render(); clearForm();
  m.className='msg'; m.textContent='Tarea entregada ✔';
};

/* Fecha por defecto: hoy */
$('date').value=new Date().toISOString().slice(0,10);
render();
