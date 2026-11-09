
<script>
/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */
const CONFIG = {
  bravus: {
    nome: 'BRAVUS', tag: 'Moda Masculina',
    titulo: 'Estilo com acabamento premium',
    descricao: 'Escolha a cor e o tamanho e finalize pelo WhatsApp.',
    whatsapp: '5584987590083',
    api: 'https://script.google.com/macros/s/AKfycbzM0RGrW6vHKIQO3c9DZgbZRCW3EcEYd0aL1euZLLh42ooeBcJILqO_azrhmH03OQqB/exec',
    planilhaCSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-YM9OPQXtPhuMEda77T6zYhwQzv6hC3osBj1PuqCpKkF_ra0pbDHG3cI03CQ-5o9_LpMPOLIpLt86/pub?gid=1097152818&single=true&output=csv',
    endereco: 'Rua Frei Miguelinho, 333, Centro, Mossoró/RN',
    mostrarMarca: false, generos: null,
    categorias: [
      ['Camisetas', ['t-shirt','tshirt','camiseta','camisetas','basica','básica']],
      ['Polos', ['polo','polos']],
      ['Camisas', ['camisa','camisas','social']],
      ['Regatas', ['regata','regatas']],
      ['Bermudas e Shorts', ['bermuda','bermudas','short','shorts']],
      ['Calças', ['calca','calça','calcas','calças','jeans']],
      ['Calçados', ['sapataria','tenis','tênis','calcado','calçado','sapato','chinelo']],
      ['Acessórios', ['bone','boné','cinto','carteira','cueca','meia','acessorio','acessório','acessorios','acessórios','oculos','óculos','perfume']]
    ]
  },
  bravinhos: {
    nome: 'Bravinhos', tag: 'Moda Infantil',
    titulo: 'Conforto e estilo para os pequenos',
    descricao: 'Do bebê ao juvenil. Escolha a cor e o tamanho certinho e finalize pelo WhatsApp.',
    whatsapp: '5584987590083',
    api: 'https://script.google.com/macros/s/AKfycbzFKBDPEfjpGMk4aVBQgNj2RX7HZwA__DSmogiSx_wRwVfZemQctSPW4fnNs6jPBHKwwQ/exec',
    planilhaCSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRU8uVGwuGgrgw6KGQVrfn-xBo2kVlMOFu819HslIqJ4dqunfOOSfD10lWfEllSBWyadhCXBQh5F1b8/pub?gid=645250235&single=true&output=csv',
    endereco: 'Rua Frei Miguelinho, 333, Centro, Mossoró/RN',
    mostrarMarca: true, ocultarMarcas: ['variado'],
    generos: {Feminino:'Menina', Masculino:'Menino', Unissex:'Unissex'},
    categorias: [
      ['Conjuntos', ['conjunto','conjuntos','coleção copa','colecao copa','kit']],
      ['Bebê', ['body','pagão','pagao','macacão','macacao','romper','kit rn','bebe','bebê','manta']],
      ['Vestidos e Jardineiras', ['vestido','vestidos','jardineira','jardineiras','saia']],
      ['Blusas e Camisetas', ['blusa','blusas','tshirt','t-shirt','camiseta','cropped','top','batinha','polo','regata']],
      ['Shorts e Bermudas', ['short','shorts','bermuda','bermudas']],
      ['Calças', ['calca','calça','legging','jeans']],
      ['Moda Praia', ['biquini','biquíni','maio','maiô','sunga']],
      ['Casacos', ['bomber','jaqueta','casaco','moletom','blusão']],
      ['Calçados', ['sapataria','tenis','tênis','sandalia','sandália','calcado','calçado']],
      ['Acessórios', ['acessorios','acessórios','acessorio','tiara','laço','laco','meia']]
    ]
  },
  site: 'https://loja.groupbrv.com.br/',
  parcelasMax: 3,
  mostrarEsgotados: false,
  maxCarrossel: 12,
  cnpj: '65.122.743/0001-80'
};
const LOJAS = ['bravus','bravinhos'];

/* CATÁLOGO INICIAL: usado só se a planilha não responder */
const CATALOGO_INICIAL = /*CATALOGO*/;

/* =========================================================
   UTILITÁRIOS
   ========================================================= */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const brl = v => 'R$ ' + Number(v||0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const num = v => { if(v===''||v==null) return 0; if(typeof v==='number') return v;
  let s=String(v).replace(/[R$\s]/g,''); if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.'); return parseFloat(s)||0; };
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sim = v => /^(sim|s|x|1|true|yes)$/i.test(String(v||'').trim());
const semAcento = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const slug = s => semAcento(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'item';
const iniciais = n => String(n||'').split(/\s+/).filter(w=>w.length>2).slice(0,2).map(w=>w[0]).join('').toUpperCase() || '•';
const store = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
const sessao = {
  get(k,d){ try{ const v=sessionStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ sessionStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
const reduzMovimento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),1800); }
function idDrive(url){ const m=String(url||'').match(/\/d\/([\w-]{20,})/) || String(url||'').match(/[?&]id=([\w-]{20,})/); return m?m[1]:''; }
function linkFoto(url, w){
  url=String(url||'').trim(); if(!url) return '';
  const id=idDrive(url);
  if(/drive\.google\.com/.test(url) && id) return 'https://drive.google.com/thumbnail?id='+id+'&sz=w'+(w||800);
  return url;
}
function linkVideo(url){
  url=String(url||'').trim(); if(!url) return '';
  const id=idDrive(url);
  if(/drive\.google\.com/.test(url) && id) return 'https://drive.google.com/uc?export=download&id='+id;
  return url;
}
function copiar(txt){ (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast('Link copiado ✓'),()=>prompt('Copie o link:',txt)); }
function parseCSV(txt){
  const linhas=[]; let row=[], cel='', q=false;
  for(let i=0;i<txt.length;i++){
    const c=txt[i];
    if(q){ if(c==='"'){ if(txt[i+1]==='"'){cel+='"';i++;} else q=false; } else cel+=c; }
    else if(c==='"') q=true;
    else if(c===','){ row.push(cel); cel=''; }
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&txt[i+1]==='\n') i++; row.push(cel); linhas.push(row); row=[]; cel=''; }
    else cel+=c;
  }
  if(cel!==''||row.length){ row.push(cel); linhas.push(row); }
  const cab=(linhas.shift()||[]).map(h=>semAcento(h).trim().replace(/\s+/g,'_'));
  return linhas.filter(r=>r.some(c=>c.trim())).map(r=>Object.fromEntries(cab.map((h,i)=>[h,(r[i]??'').trim()])));
}
/* cores mais comuns → bolinha colorida (as demais aparecem só com o nome) */
const CORES = {preto:'#111',branco:'#fff','off white':'#f4f1e8',offwhite:'#f4f1e8',creme:'#f3e5c3',bege:'#d8c3a5',areia:'#d6c4a0',nude:'#e3bc9a',caqui:'#b6a77a',kaki:'#b6a77a',
  cinza:'#8d8d8d',mescla:'#a9a9a9',chumbo:'#4a4a4a',grafite:'#3d3d3d',prata:'#c0c0c0',azul:'#2563eb','azul claro':'#7cb6ef','azul bebe':'#a7d3f5','azul marinho':'#1e2a4a',marinho:'#1e2a4a',royal:'#2b4ac9',jeans:'#4a6a8f',petroleo:'#1d4e5f',turquesa:'#1fb5ad',
  verde:'#16a34a','verde militar':'#4b5320',militar:'#4b5320','verde agua':'#7fd1c1',oliva:'#6b6b2d',musgo:'#5a5f2e',vermelho:'#d62828',vinho:'#6d1a2c',bordo:'#6d1a2c',rosa:'#f29bb8','rosa bebe':'#f6c6d4',pink:'#ec4899',coral:'#ff7f6e',salmao:'#f6a28a',
  amarelo:'#f5c518',mostarda:'#c9a227',laranja:'#f77f00',telha:'#b5532c',terracota:'#b5532c',marrom:'#6b4226',caramelo:'#b07339',chocolate:'#4b2e1e',cafe:'#4b2e1e',roxo:'#6d28d9',lilas:'#b69ae0',lavanda:'#c8b6e2',dourado:'#c9a54c'};
function corHex(nome){ const n=semAcento(nome).trim(); if(CORES[n]) return CORES[n]; const k=Object.keys(CORES).filter(c=>n.startsWith(c)).sort((a,b)=>b.length-a.length)[0]; return k?CORES[k]:''; }
function bolinha(nome){ const h=corHex(nome); return h?`<span class="bolinha" style="background:${h}" title="${esc(nome)}"></span>`:''; }

/* =========================================================
   ORIGEM DO VISITANTE (UTM, ?o=..., referência, app)
   ========================================================= */
(function capturarOrigem(){
  try{
    const q=new URLSearchParams(location.search), hq=location.hash.includes('?')?new URLSearchParams(location.hash.split('?')[1]):null;
    const g=k=>(q.get(k)||(hq&&hq.get(k))||'').slice(0,80);
    const t={src:g('utm_source'), med:g('utm_medium'), camp:g('utm_campaign')||g('c'), cont:g('utm_content'), o:g('o')};
    if(['gclid','wbraid','gbraid','msclkid','ttclid','dclid'].some(k=>g(k))) t.pago=true;
    try{ if(document.referrer){ const h=new URL(document.referrer).hostname; if(!/groupbrv\.com\.br$/.test(h)) t.ref=h; } }catch(e){}
    const ua=navigator.userAgent||''; t.app=/Instagram/i.test(ua)?'instagram':/FBAN|FBAV|FB_IAB/i.test(ua)?'facebook':'';
    Object.keys(t).forEach(k=>{ if(!t[k]) delete t[k]; });
    const tem=Object.keys(t).length>0;
    t.entrada=(location.hash||'/').replace(/\?.*$/,'').slice(0,100);
    let s=sessao.get('origem_sessao',null);
    if(tem || !s){ s=t; sessao.set('origem_sessao',s); }
    if(tem) sessao.set('origem_nova',1);
    if(!store.get('origem_primeira',null)) store.set('origem_primeira',s);
    store.set('origem_ultima',s);
    if(/(^|[?&])(utm_[a-z]+|o|c|gclid|fbclid|wbraid|gbraid|msclkid|ttclid|dclid)=/.test(location.search)) history.replaceState(null,'',location.pathname+location.hash);
  }catch(e){}
})();
const origemCliente = () => ({ primeira: store.get('origem_primeira',{}), ultima: store.get('origem_ultima',{}) });

/* =========================================================
   CATÁLOGO: linhas da vitrine (uma por cor) → produto principal
   ========================================================= */
function departamento(loja, cat){
  const c = semAcento(cat).trim();
  for(const [nome, chaves] of CONFIG[loja].categorias){
    if(chaves.some(k=>{ const kk=semAcento(k); return c===kk || c.startsWith(kk+' ') || c.startsWith(kk); })) return nome;
  }
  return cat ? cat.charAt(0).toUpperCase()+cat.slice(1).toLowerCase() : 'Outros';
}
function normalizar(p, loja){
  const tams = String(p.tamanhos||'').split(/[|;]/).map(t=>t.trim()).filter(Boolean).map(t=>{
    const [n,q,pp]=t.split(':'); return {n:n.trim(), q:q===undefined?1:parseInt(q)||0, p:pp?num(pp):0};
  });
  const preco=num(p.preco), promo=num(p.preco_promo);
  const fin = promo>0 && promo<preco ? promo : preco;
  tams.forEach(t=>{ if(!t.p) t.p=fin; });
  const disp=tams.filter(t=>t.q>0).map(t=>t.p);
  const pmin=disp.length?Math.min(...disp):fin, pmax=disp.length?Math.max(...disp):fin;
  const codigo=String(p.codigo||p.nome), cor=String(p.cor_nome??p.cores??'').trim();
  // vitrine antiga (sem a coluna "mae"): o produto principal é o código sem o sufixo da cor
  let mae=p.mae, maeNome=p.mae_nome;
  if(!mae){ const suf=cor?'-'+semAcento(cor).replace(/[^a-z0-9]/g,'').toUpperCase().slice(0,6):''; mae=(suf&&codigo.endsWith(suf))?codigo.slice(0,-suf.length):codigo; }
  if(!maeNome){ maeNome=String(p.nome||''); if(cor) maeNome=maeNome.replace(new RegExp('\\s+[—-]\\s+'+cor.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i'),''); }
  return {
    codigo, nome:p.nome||'', categoria:p.categoria||'Outros', deptoOrig:departamento(loja,p.categoria),
    marca:p.marca||'', genero:p.genero||'', cor, mae:String(mae), maeNome:maeNome||p.nome||'',
    preco, promo: promo>0&&promo<preco?promo:0, tamanhos:tams, pmin, pmax, varia:pmax-pmin>0.009,
    foto:p.foto||'', destaque:sim(p.destaque), ativo:p.ativo===undefined||p.ativo===''?true:sim(p.ativo),
    vendidos:num(p.vendidos30), novo:sim(p.novo), lancamento:sim(p.lancamento), ordem:p.ordem?num(p.ordem):999,
    bf:sim(p.bf), bfFim:p.bf_fim||'', bfRestam:p.bf_restam===''||p.bf_restam==null?null:num(p.bf_restam),
    estoque:tams.reduce((s,t)=>s+Math.max(0,t.q),0)
  };
}
function montarMaes(loja, linhas){
  const variantes=linhas.map(p=>normalizar(p,loja)).filter(p=>p.nome && p.ativo && (CONFIG.mostrarEsgotados||p.estoque>0));
  { const nv=variantes.filter(p=>p.novo).length; if(nv>variantes.length*0.4) variantes.forEach(p=>p.novo=false); } // cadastro em massa não conta como novidade
  const mapa=new Map();
  variantes.forEach(v=>{
    let m=mapa.get(v.mae);
    if(!m){ m={id:v.mae, nome:v.maeNome, categoria:v.categoria, deptoOrig:v.deptoOrig, marca:v.marca, genero:v.genero, cores:[]}; mapa.set(v.mae,m); }
    v.slug=slug(v.cor||'unica'); m.cores.push(v);
  });
  const usados={};
  const maes=[...mapa.values()].map(m=>{
    const cs=m.cores, disp=cs.filter(c=>c.estoque>0);
    m.foto=(cs.find(c=>c.foto&&c.destaque)||cs.find(c=>c.foto)||{}).foto||'';
    m.preco=Math.max(...cs.map(c=>c.preco));
    m.pmin=Math.min(...(disp.length?disp:cs).map(c=>c.pmin));
    m.pmax=Math.max(...(disp.length?disp:cs).map(c=>c.pmax));
    m.varia=m.pmax-m.pmin>0.009;
    m.desc=Math.max(0,...cs.map(c=>c.preco?1-c.pmin/c.preco:0));
    m.promo=cs.some(c=>c.promo>0 || c.tamanhos.some(t=>t.q>0&&t.p<c.preco-0.009));
    m.bf=cs.some(c=>c.bf); m.bfFim=cs.map(c=>c.bfFim).filter(Boolean).sort()[0]||'';
    m.destaque=cs.some(c=>c.destaque); m.lancamento=cs.some(c=>c.lancamento); m.novo=cs.some(c=>c.novo);
    m.ordem=Math.min(...cs.map(c=>c.ordem)); m.vendidos=cs.reduce((s,c)=>s+c.vendidos,0); m.estoque=cs.reduce((s,c)=>s+c.estoque,0);
    const tams=[]; cs.forEach(c=>c.tamanhos.forEach(t=>{ if(t.q>0 && !tams.includes(t.n)) tams.push(t.n); })); m.tams=tams;
    let s=slug(m.nome); if(usados[s]){ usados[s]++; s+='-'+usados[s]; } else usados[s]=1; m.slug=s;
    m.busca=semAcento([m.nome,m.marca,m.categoria,m.deptoOrig,...cs.map(c=>c.cor+' '+c.nome)].join(' '));
    return m;
  });
  return maes;
}

/* =========================================================
   ESTADO E DADOS
   ========================================================= */
const estado = { loja:null, maes:{}, cfg:{}, aval:{}, gen:'Todos', busca:'', ordem:'padrao', rota:{}, voltar:null };
const carrinhos = { bravus: store.get('sacola_bravus',[]), bravinhos: store.get('sacola_bravinhos',[]) };
async function carregar(loja, forcar){
  if(estado.maes[loja] && !forcar) return;
  const url=CONFIG[loja].planilhaCSV;
  let lista=CATALOGO_INICIAL[loja]||[], cfg={}, aval=[];
  if(url){
    try{
      const r=await fetch(url+(url.includes('?')?'&':'?')+'t='+Date.now());
      if(!r.ok) throw new Error(r.status);
      const linhas=parseCSV(await r.text());
      lista=[];
      linhas.forEach(l=>{
        if(l.codigo==='#cfg'){ if(l.nome==='feedback'){ if(l.categoria) aval.push(l.categoria); } else cfg[l.nome]=l.categoria; }
        else lista.push(l);
      });
    }catch(e){ console.warn('Planilha indisponível, usando catálogo salvo', e); }
  }
  estado.cfg[loja]=cfg; estado.aval[loja]=aval;
  estado.maes[loja]=montarMaes(loja, lista);
  aplicarCategorias(loja);
}
function cfgDe(l,k){ return (estado.cfg[l]||{})[k]||''; }
function cfg(k){ return cfgDe(estado.loja,k); }
/* categorias: nomes do PDV agrupados em departamentos; o lojista pode ordenar, renomear e esconder */
function ajustesCategorias(l){ try{ const j=JSON.parse(cfgDe(l,'categorias')||'{}'); return {ordem:j.ordem||[], nomes:j.nomes||{}, ocultas:j.ocultas||[]}; }catch(e){ return {ordem:[],nomes:{},ocultas:[]}; } }
function aplicarCategorias(l){
  const a=ajustesCategorias(l), maes=estado.maes[l]||[];
  maes.forEach(m=>{ m.depto=a.nomes[m.deptoOrig]||m.deptoOrig; m.oculta=a.ocultas.includes(m.deptoOrig); });
  const cont={}; maes.forEach(m=>{ if(!m.oculta) cont[m.deptoOrig]=(cont[m.deptoOrig]||0)+1; });
  const padrao=CONFIG[l].categorias.map(x=>x[0]);
  const pos=d=>{ const i=a.ordem.indexOf(d); if(i>=0) return i; const j=padrao.indexOf(d); return j>=0?100+j:200; };
  estado['cats_'+l]=Object.keys(cont).sort((x,y)=>pos(x)-pos(y)||cont[y]-cont[x]).map(orig=>{
    const nome=a.nomes[orig]||orig, lista=maes.filter(m=>m.deptoOrig===orig);
    const comFoto=lista.find(m=>m.foto&&m.destaque)||lista.find(m=>m.foto);
    return {orig, nome, slug:slug(nome), n:cont[orig], foto:comFoto?comFoto.foto:''};
  });
}
const visiveis = l => (estado.maes[l]||[]).filter(m=>!m.oculta);

/* =========================================================
   CADASTRO DO CLIENTE (tela de boas-vindas), ACESSOS E SACOLA NA NUVEM
   ========================================================= */
estado.cliente = store.get('cliente', null);
let visitante = store.get('visitante','');
if(!/^[a-z0-9]{8,40}$/i.test(visitante)){
  visitante = ((crypto.randomUUID&&crypto.randomUUID()) || (Math.random().toString(36).slice(2)+Date.now().toString(36)+Math.random().toString(36).slice(2))).replace(/[^a-z0-9]/gi,'').slice(0,32);
  store.set('visitante',visitante);
}
function apiPub(l,dados){ return fetch(CONFIG[l].api,{method:'POST',body:JSON.stringify(dados),keepalive:true}).then(r=>r.json()); }
function foneValido(t){ const n=String(t||'').replace(/\D/g,'').replace(/^0+/,'').replace(/^55(?=\d{10,11}$)/,''); return /^[1-9]{2}9?\d{8}$/.test(n)?n:''; }
function registrarNaLoja(l){
  const c=estado.cliente; if(!c) return;
  // já cadastrado: só reenvia quando chegou por um link rastreado novo (atualiza a "última origem"; a primeira nunca muda)
  const jaTem=(c.lojas||{})[l], nova=sessao.get('origem_nova',0)&&!sessao.get('lead_ult_'+l,0);
  if(jaTem && !nova) return;
  sessao.set('lead_ult_'+l,1);
  apiPub(l,{acao:'lead',visitante,nome:c.nome,telefone:c.tel,ofertas:!!c.ofertas,origem:origemCliente()}).then(j=>{ if(j.ok){ c.lojas=c.lojas||{}; c.lojas[l]=1; store.set('cliente',c); } }).catch(()=>{});
}
function registrarVisita(l){
  if(sessao.get('visita_'+l,false)) return; sessao.set('visita_'+l,true);
  apiPub(l,{acao:'visita',visitante,origem:store.get('origem_ultima',{})}).catch(()=>{});
}
function mostrarPortao(l){
  const c=CONFIG[l];
  $('#pLogo').src='logo-'+l+'.png'; $('#pLogo').alt=c.nome;
  $('#pTitulo').textContent = l==='bravinhos' ? 'Que bom ter você aqui!' : 'Bem-vindo à BRAVUS';
  $('#pTexto').textContent = 'Informe seu nome e WhatsApp para ver o catálogo completo e montar seu pedido.';
  $('#pOfTxt').textContent = 'Quero receber novidades e ofertas da '+c.nome+' pelo WhatsApp';
  $('#pLgpd').textContent = 'Usamos seu nome e telefone só para te atender e acompanhar seus pedidos. Não compartilhamos com terceiros. Para remover seus dados, é só pedir no WhatsApp da loja.';
  $('#pErro').textContent=''; $('#portao').hidden=false; document.body.style.overflow='hidden';
  setTimeout(()=>$('#pNome').focus(),80);
}
function fecharPortao(){ $('#portao').hidden=true; document.body.style.overflow=''; }
$('#pFone').oninput=e=>{ const n=e.target.value.replace(/\D/g,'').slice(0,11);
  e.target.value = n.length>6 ? `(${n.slice(0,2)}) ${n.slice(2,n.length-4)}-${n.slice(-4)}` : n.length>2 ? `(${n.slice(0,2)}) ${n.slice(2)}` : n; };
$('#pForm').onsubmit=async e=>{
  e.preventDefault(); const l=estado.loja; if(!l) return;
  const nome=$('#pNome').value.trim().replace(/\s+/g,' '), tel=foneValido($('#pFone').value), ofertas=$('#pOfertas').checked;
  if(nome.replace(/[^a-zà-ú]/gi,'').length<2){ $('#pErro').textContent='Informe seu nome.'; $('#pNome').focus(); return; }
  if(!tel){ $('#pErro').textContent='Informe um WhatsApp válido com DDD.'; $('#pFone').focus(); return; }
  const bt=$('#pBtn'); bt.disabled=true; bt.textContent='Entrando…';
  const novo={nome,tel,ofertas,lojas:{}};
  try{
    const j=await apiPub(l,{acao:'lead',visitante,nome,telefone:tel,ofertas,origem:origemCliente()});
    if(j.ok){ novo.lojas[l]=1; sessao.set('lead_ult_'+l,1); }
    else if(/Telefone|nome/i.test(j.erro||'')){ $('#pErro').textContent=j.erro; bt.disabled=false; bt.textContent='Ver catálogo'; return; }
  }catch(err){ /* sem internet: entra assim mesmo e o cadastro é reenviado na próxima visita */ }
  estado.cliente=novo; store.set('cliente',novo); store.set('cliente_nome',nome); $('#cNome').value=nome;
  bt.disabled=false; bt.textContent='Ver catálogo';
  fecharPortao(); sincronizarSacola(l,'mudou',true);
};
const timersSacola={};
function sincronizarSacola(l,evento,agora){
  if(!l) return; clearTimeout(timersSacola[l]); timersSacola[l]=0;
  const enviar=()=>{
    timersSacola[l]=0;
    const c=estado.cliente||{}, cart=carrinhos[l]||[], sig=JSON.stringify(cart.map(i=>[i.codigo,i.tam,i.qtd]));
    if(evento!=='enviada' && store.get('sacola_sync_'+l,'')===sig) return;
    apiPub(l,{acao:'sacola',visitante,evento,nome:c.nome||'',telefone:c.tel||'',
      itens:cart.map(i=>({codigo:i.codigo,nome:i.nome,tam:i.tam,qtd:i.qtd,preco:i.preco}))})
      .then(j=>{ if(j.ok) store.set('sacola_sync_'+l,sig); }).catch(()=>{});
  };
  if(agora||evento==='enviada') enviar(); else timersSacola[l]=setTimeout(enviar,2500);
}
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') Object.keys(timersSacola).forEach(l=>{ if(timersSacola[l]) sincronizarSacola(l,'mudou',true); }); });

/* =========================================================
   ROTAS  #/loja · #/loja/c/categoria · #/loja/p/produto/cor · #/loja/black-friday · #/loja/ofertas · #/loja/lancamentos · #/loja/busca
   (links antigos #loja e #loja/CÓDIGO continuam funcionando)
   ========================================================= */
const rotaHash = (l, ...partes) => '#/'+[l,...partes].filter(Boolean).map(encodeURIComponent).join('/');
function lerRota(){
  const h=location.hash.replace(/^#\/?/,''), [cam, qs]=h.split('?');
  const p=cam.split('/').filter(Boolean).map(x=>{ try{ return decodeURIComponent(x); }catch(e){ return x; } });
  const q=new URLSearchParams(qs||'');
  if(!p.length || p[0]==='inicio') return {tipo:'inicio'};
  if(p[0]==='admin') return {tipo:'admin'};
  if(!LOJAS.includes(p[0])) return {tipo:'inicio'};
  const r={loja:p[0], q, partes:p};
  if(p.length===1) r.tipo='vitrine';
  else if(p[1]==='c') Object.assign(r,{tipo:'categoria', slug:p[2]||''});
  else if(p[1]==='p') Object.assign(r,{tipo:'produto', slug:p[2]||'', cor:p[3]||''});
  else if(p[1]==='black-friday') r.tipo='bf';
  else if(p[1]==='ofertas') r.tipo='ofertas';
  else if(p[1]==='lancamentos') r.tipo='lancamentos';
  else if(p[1]==='busca') r.tipo='busca';
  else Object.assign(r,{tipo:'antigo', codigo:p[1]});
  return r;
}
let navNova=false; const rolagens={};
document.addEventListener('click',e=>{ const a=e.target.closest('a[href^="#"]'); if(a) navNova=true; },true);
let ultimoHash=location.hash;
async function rota(){
  rolagens[ultimoHash]=window.scrollY; ultimoHash=location.hash;
  const r=lerRota(); estado.rota=r;
  fecharTudo(true);
  if(r.tipo==='admin'){ fecharPortao(); abrirAdmin(); return; }
  $('#tela-admin').hidden=true; document.querySelector('footer').hidden=false;
  const loja=r.loja||null;
  $$('.aba').forEach(a=>a.classList.toggle('ativa', a.dataset.ir===(loja||'inicio')));
  document.body.dataset.tema=loja||'inicio';
  $('#tela-inicio').hidden=!!loja; $('#tela-loja').hidden=!loja; $('#btnCarrinho').hidden=!loja; $('#btnBusca').hidden=!loja;
  const mudouLoja = estado.loja!==loja;
  estado.loja=loja;
  if(loja){ registrarVisita(loja); if(!estado.cliente) mostrarPortao(loja); else { fecharPortao(); registrarNaLoja(loja); } } else fecharPortao();
  if(!loja){ document.title='Bravus & Bravinhos | Loja Online'; meta('Loja online da BRAVUS (moda masculina) e da Bravinhos (moda infantil) em Mossoró/RN.'); $('#avisoTopo').hidden=true; $('#zapFlutua').hidden=true; rodape(); window.scrollTo({top:0}); return; }
  const c=CONFIG[loja];
  $('#lojaTag').textContent=c.tag; $('#lojaNomeTxt').textContent=c.nome; $('#lojaLogo').src='logo-'+loja+'.png'; $('#lojaLogo').alt=c.nome;
  $('#zapFlutua').href='https://wa.me/'+c.whatsapp+'?text='+encodeURIComponent('Olá! Vim pelo site da '+c.nome+'.'); $('#zapFlutua').hidden=false;
  if(mudouLoja){ estado.gen='Todos'; pararCapa(); if(!estado.maes[loja]){ $('#grade').innerHTML='<div class="vazio">Carregando produtos…</div>'; } }
  await carregar(loja);
  if(estado.loja!==loja || location.hash!==ultimoHash) return;
  if(r.tipo==='antigo'){ const v=achaCodigo(loja,r.codigo); history.replaceState(null,'',v?rotaHash(loja,'p',v.m.slug,v.c.slug):rotaHash(loja)); ultimoHash=location.hash; return rota(); }
  avisoTopo(); capa(); menus(); atualizarContador(); rodape();
  const pg=r.tipo==='vitrine'?'vitrine':r.tipo==='produto'?'produto':'lista';
  $('#pg-vitrine').hidden=pg!=='vitrine'; $('#pg-lista').hidden=pg!=='lista'; $('#pg-produto').hidden=pg!=='produto';
  $('#capa').hidden=pg!=='vitrine';
  if(pg==='vitrine') vitrine();
  else if(pg==='produto') paginaProduto(r);
  else paginaLista(r);
  if(pg!=='produto') estado.voltar=location.hash;
  const alvo=navNova?0:(rolagens[location.hash]||0); navNova=false;
  requestAnimationFrame(()=>window.scrollTo({top:alvo}));
}
function meta(desc){ let m=document.querySelector('meta[name=description]'); if(m) m.setAttribute('content',desc); }
function achaCodigo(l,cod){ for(const m of estado.maes[l]||[]){ const c=m.cores.find(x=>x.codigo===cod); if(c) return {m,c}; if(m.id===cod) return {m,c:m.cores[0]}; } return null; }
$$('.aba').forEach(a=>a.onclick=()=>{ navNova=true; location.hash=a.dataset.ir==='inicio'?'inicio':'/'+a.dataset.ir; });
window.addEventListener('hashchange', rota);

/* =========================================================
   CAPA (vídeo + logo + textos)
   ========================================================= */
function avisoTopo(){ const av=cfg('aviso'); $('#avisoTopo').hidden=!av; $('#avisoTopo').textContent=av; }
let videoObs=null;
function capa(){
  const l=estado.loja, c=CONFIG[l], foto=cfg('capa_foto'), vid=linkVideo(cfg('video_capa')||cfg('video_url'));
  const vert=cfg('video_formato')==='vertical';
  const cp=$('#capa'); cp.classList.toggle('com-video',!!vid); cp.classList.toggle('v-vertical',!!vid&&vert);
  cp.classList.toggle('sem-img', !foto || !!vid); $('#capaImg').hidden=!foto || !!vid;
  if(foto && !vid) $('#capaImg').style.backgroundImage='url("'+linkFoto(foto,1800)+'")';
  $('#capaTitulo').textContent=cfg('capa_titulo')||c.titulo;
  $('#capaSub').textContent=cfg('capa_subtitulo')||c.descricao;
  $('#capaBtn').textContent=cfg('capa_botao')||'Ver categorias';
  $('#capaBtn').href='#'; $('#capaBtn').onclick=e=>{ e.preventDefault(); $('#secCategorias').scrollIntoView({behavior:reduzMovimento()?'auto':'smooth'}); };
  const temBf=visiveis(l).some(m=>m.bf); $('#capaBtnBf').hidden=!temBf; $('#capaBtnBf').href=rotaHash(l,'black-friday'); $('#capaBtnBf').textContent=cfg('bf_titulo')||'Black Friday';
  const box=$('#videoBox'), v=$('#capaVideo');
  box.hidden=!vid;
  $('#videoPoster').style.backgroundImage=foto?'url("'+linkFoto(foto,1400)+'")':'';
  if(!vid){ v.removeAttribute('src'); return; }
  if(v.dataset.src!==vid){ v.dataset.src=vid; v.removeAttribute('src'); v.load(); }
  v.muted=true; somBotao();
  const economia=navigator.connection&&navigator.connection.saveData;
  const tocar=()=>{
    if(!v.getAttribute('src')){ v.src=v.dataset.src; v.preload='auto'; }
    if(reduzMovimento()||economia){ $('#videoPlay').hidden=false; return; }
    const pr=v.play(); if(pr&&pr.catch) pr.catch(()=>{ $('#videoPlay').hidden=false; });
  };
  if(videoObs) videoObs.disconnect();
  if('IntersectionObserver' in window){
    videoObs=new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting) (document.readyState==='complete'?tocar():addEventListener('load',tocar,{once:true})); else if(!v.paused) v.pause(); }),{threshold:.2});
    videoObs.observe(box);
  } else tocar();
}
function pararCapa(){ const v=$('#capaVideo'); if(v&&!v.paused) v.pause(); }
function somBotao(){ const v=$('#capaVideo'), b=$('#videoSom'); b.hidden=!!v.error||(!v.getAttribute('src')&&!v.dataset.src);
  b.innerHTML=v.muted?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6"/></svg>Ativar som':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>Sem som';
  b.setAttribute('aria-label',v.muted?'Ativar som':'Desativar som'); }
$('#videoSom').onclick=()=>{ const v=$('#capaVideo'); v.muted=!v.muted; if(v.paused) v.play().catch(()=>{}); somBotao(); };
$('#videoPlay').onclick=()=>{ const v=$('#capaVideo'); if(!v.getAttribute('src')) v.src=v.dataset.src; v.play().then(()=>{ $('#videoPlay').hidden=true; }).catch(()=>{}); };
$('#capaVideo').addEventListener('playing',()=>{ $('#videoPoster').hidden=true; $('#videoPlay').hidden=true; $('#videoSom').hidden=false; });
$('#capaVideo').addEventListener('error',()=>{ /* vídeo não carregou: fica a foto de capa */ $('#videoPoster').hidden=false; $('#videoSom').hidden=true; $('#videoPlay').hidden=true;
  if(!cfg('capa_foto')){ $('#videoBox').hidden=true; $('#capa').classList.remove('com-video','v-vertical'); } });

/* =========================================================
   MENU DE CATEGORIAS (lateral no computador, barra no celular)
   ========================================================= */
function itensMenu(){
  const l=estado.loja, maes=visiveis(l), r=estado.rota, it=[];
  it.push({href:rotaHash(l), nome:'Início', ativo:r.tipo==='vitrine'});
  const nbf=maes.filter(m=>m.bf).length; if(nbf) it.push({href:rotaHash(l,'black-friday'), nome:cfg('bf_titulo')?'Black Friday':'Black Friday', n:nbf, cls:'m-bf', ativo:r.tipo==='bf'});
  const nof=maes.filter(m=>m.promo&&!m.bf).length; if(nof) it.push({href:rotaHash(l,'ofertas'), nome:'Ofertas', n:nof, ativo:r.tipo==='ofertas'});
  const nl=lancamentos(maes).length; if(nl) it.push({href:rotaHash(l,'lancamentos'), nome:'Lançamentos', n:nl, ativo:r.tipo==='lancamentos'});
  it.push({sep:1});
  (estado['cats_'+l]||[]).forEach(c=>it.push({href:rotaHash(l,'c',c.slug), nome:c.nome, n:c.n, ativo:r.tipo==='categoria'&&r.slug===c.slug || (r.tipo==='produto'&&estado.catAtual===c.slug)}));
  return it;
}
function menus(){
  const it=itensMenu();
  const lista=it.map(i=>i.sep?'<div class="sep"></div>':`<a href="${i.href}" class="${i.cls||''} ${i.ativo?'ativo':''}"${i.ativo?' aria-current="page"':''}><span>${esc(i.nome)}</span>${i.n?`<small>${i.n}</small>`:''}</a>`).join('');
  $('#menuLateral').innerHTML='<h2>Categorias</h2><nav>'+lista+'</nav>';
  $('#menuGaveta').innerHTML='<nav>'+lista+'</nav>';
  $('#barraCats').innerHTML=`<button type="button" id="abrirCats" aria-label="Todas as categorias"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>Menu</button>`+it.filter(i=>!i.sep).map(i=>`<a href="${i.href}" class="${i.cls||''} ${i.ativo?'ativo':''}">${esc(i.nome)}</a>`).join('');
  $('#abrirCats').onclick=()=>{ $('#gavetaCats').classList.add('on'); $('#fundo').classList.add('on'); };
  const at=$('#barraCats a.ativo'); if(at) at.scrollIntoView({block:'nearest',inline:'center'});
}

/* =========================================================
   VITRINE (página inicial da loja)
   ========================================================= */
function campanhaAtiva(){ if(!sim(cfg('campanha_ativa'))) return false; const fim=dataFim(cfg('campanha_fim')); return !fim || fim>new Date(); }
function dataFim(v){ if(!v) return null; const d=new Date(String(v).length<=10? v+'T23:59:59' : v); return isNaN(d)?null:d; }
function destaques(maes){
  const manual=maes.filter(m=>m.destaque).sort((a,b)=>a.ordem-b.ordem||b.vendidos-a.vendidos);
  if(manual.length) return {lista:manual.slice(0,CONFIG.maxCarrossel), titulo:cfg('destaques_titulo')||'Destaques'};
  const top=maes.filter(m=>m.vendidos>0).sort((a,b)=>b.vendidos-a.vendidos);
  return {lista:top.slice(0,CONFIG.maxCarrossel), titulo:'Mais vendidos'};
}
function lancamentos(maes){
  const man=maes.filter(m=>m.lancamento).sort((a,b)=>a.ordem-b.ordem);
  return man.length?man:maes.filter(m=>m.novo).sort((a,b)=>(!!b.foto)-(!!a.foto));
}
const porDesconto=(a,b)=>b.desc-a.desc;
function vitrine(){
  const l=estado.loja, c=CONFIG[l], maes=visiveis(l);
  document.title=c.nome+' | Loja Online'; meta(c.nome+' em Mossoró/RN: '+(cfg('capa_subtitulo')||c.descricao));
  const troca=cfg('prazo_troca')||'7';
  $('#infoTroca').textContent='Trocas em até '+troca+' dias com a etiqueta, direto na loja.';
  $('#beneficios').innerHTML=[
    ['M3 7h11v9H3zM14 10h4l3 3v3h-7z','Retire ou receba','Retirada na loja ou entrega em Mossoró'],
    ['M3 6h18v12H3zM3 10h18','Pix ou cartão','Em até '+CONFIG.parcelasMax+'x no cartão'],
    ['M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0 0 12 3M19 9A7 7 0 0 0 7 6','Troca fácil','Em até '+troca+' dias na loja'],
    ['M21 12a9 9 0 1 1-4-7.5L21 3l-1 4.5A9 9 0 0 1 21 12z','Atendimento humano','Pedido confirmado no WhatsApp']
  ].map(([d,t,s])=>`<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg><div><b>${t}</b><span>${s}</span></div></div>`).join('');
  // 2. destaques e lançamentos
  const d=destaques(maes); $('#destTitulo').textContent=d.titulo;
  $('#secDestaques').hidden=!d.lista.length; $('#carDestaques').innerHTML=d.lista.map(card).join('');
  const ln=lancamentos(maes); $('#secLancamentos').hidden=ln.length<2; $('#carLancamentos').innerHTML=ln.slice(0,CONFIG.maxCarrossel).map(card).join(''); $('#lancTodos').href=rotaHash(l,'lancamentos');
  // 3. promoções: Black Friday + ofertas/faixa de campanha
  const bf=maes.filter(m=>m.bf).sort(porDesconto);
  $('#bfBloco').hidden=!bf.length;
  if(bf.length){ $('#bfTitulo').textContent=cfg('bf_titulo')||'BLACK FRIDAY'; $('#bfSub').textContent=cfg('bf_subtitulo'); $('#bfSub').hidden=!cfg('bf_subtitulo');
    $('#carBf').innerHTML=bf.slice(0,CONFIG.maxCarrossel).map(card).join(''); $('#bfTodos').href=rotaHash(l,'black-friday'); contagem('#bfConta', dataFim(cfg('bf_fim')||bf[0].bfFim)); }
  const of=maes.filter(m=>m.promo&&!m.bf).sort(porDesconto), camp=campanhaAtiva();
  $('#secCampanha').hidden=!(of.length||camp);
  if(of.length||camp){
    const tipo=camp?(cfg('campanha_tipo')||'outra'):'outra';
    $('#secCampanha').className='campanha camp-'+tipo;
    const nomes={black_friday:'Black Friday',aniversario:'Aniversário da loja',liquida:'Liquida',oportunidade:'Oportunidade única',consumidor:'Semana do Consumidor',criancas:'Dia das Crianças',maes:'Dia das Mães',pais:'Dia dos Pais',natal:'Natal',verao:'Verão',outra:'Ofertas'};
    $('#campTag').textContent=camp?nomes[tipo]:'Ofertas';
    $('#campTitulo').textContent=camp?(cfg('campanha_titulo')||nomes[tipo]):'Ofertas da semana';
    $('#campSub').textContent=camp?cfg('campanha_subtitulo'):'Peças com preço especial por tempo limitado.'; $('#campSub').hidden=!$('#campSub').textContent;
    $('#carOfertas').innerHTML=of.slice(0,CONFIG.maxCarrossel).map(card).join(''); $('#carOfertas').hidden=!of.length;
    $('#ofTodos').href=rotaHash(l,'ofertas'); $('#ofTodos').hidden=!of.length;
    contagem('#campConta', camp?dataFim(cfg('campanha_fim')):null);
  }
  $('#secPromocoes').hidden=$('#bfBloco').hidden&&$('#secCampanha').hidden;
  // 4. categorias
  $('#cats').innerHTML=(estado['cats_'+l]||[]).map(k=>`<a class="cat ${k.foto?'tem-img':''}" href="${rotaHash(l,'c',k.slug)}">${k.foto?`<div class="cat-img" style="background-image:url('${esc(linkFoto(k.foto,500))}')"></div>`:`<span class="cat-ico">${esc(k.nome.charAt(0))}</span>`}<div class="cat-txt"><b>${esc(k.nome)}</b><small>${k.n} ${k.n===1?'produto':'produtos'}</small></div></a>`).join('');
  // 5. avaliações
  const av=estado.aval[l]||[], link=cfg('avaliacao_link');
  $('#secAvaliacoes').hidden=!(av.length||link);
  $('#carAval').hidden=!av.length; $('#secAvaliacoes .setas').hidden=av.length<2;
  $('#carAval').innerHTML=av.map((u,i)=>`<div class="aval" data-zoom="${esc(linkFoto(u,1400))}" role="button" tabindex="0" aria-label="Ampliar avaliação ${i+1}"><img loading="lazy" src="${esc(linkFoto(u,700))}" alt="Avaliação de cliente"></div>`).join('');
  $('#avalCta').hidden=!link; if(link) $('#avalLink').href=link;
  faixaAvaliacoes(av.length);
  // 6. informações
  contatos();
}
let _timers={};
function contagem(sel, fim){
  clearInterval(_timers[sel]); const el=$(sel);
  if(!fim || fim<=new Date()){ el.hidden=true; return; }
  const tick=()=>{ const s=Math.max(0,(fim-new Date())/1000); if(s<=0){ clearInterval(_timers[sel]); el.hidden=true; return; }
    const d=Math.floor(s/86400), h=Math.floor(s%86400/3600), m=Math.floor(s%3600/60), ss=Math.floor(s%60);
    el.innerHTML='Termina em '+[[d,'dias'],[h,'horas'],[m,'min'],[ss,'seg']].map(([v,t])=>`<b>${String(v).padStart(2,'0')}<small>${t}</small></b>`).join(''); };
  el.hidden=false; tick(); _timers[sel]=setInterval(tick,1000);
}
/* faixa de avaliações: anda sozinha, pausa ao passar o mouse/tocar e no botão */
let avalTimer=null, avalPausado=false;
function faixaAvaliacoes(n){
  clearInterval(avalTimer); const t=$('#carAval');
  avalPausado = avalPausado || reduzMovimento();
  const btn=$('#avalPausa'); btn.textContent=avalPausado?'▶ Continuar':'❚❚ Pausar'; btn.setAttribute('aria-pressed',avalPausado);
  if(n<2) return;
  avalTimer=setInterval(()=>{
    if(avalPausado||t._parado||document.hidden||$('#tela-loja').hidden||$('#pg-vitrine').hidden) return;
    const passo=(t.firstElementChild?.offsetWidth||260)+14;
    if(t.scrollLeft+t.clientWidth>=t.scrollWidth-4) t.scrollTo({left:0,behavior:'smooth'}); else t.scrollBy({left:passo,behavior:'smooth'});
  },3500);
}
['mouseenter','focusin','touchstart'].forEach(ev=>$('#carAval').addEventListener(ev,()=>{ $('#carAval')._parado=true; },{passive:true}));
['mouseleave','focusout'].forEach(ev=>$('#carAval').addEventListener(ev,()=>{ $('#carAval')._parado=false; }));
$('#carAval').addEventListener('touchend',()=>setTimeout(()=>{ $('#carAval')._parado=false; },4000),{passive:true});
$('#avalPausa').onclick=()=>{ avalPausado=!avalPausado; faixaAvaliacoes((estado.aval[estado.loja]||[]).length); };
function contatos(){
  const l=estado.loja, c=CONFIG[l], ig=cfg('instagram'), h=cfg('horario'), w=c.whatsapp.replace(/^55/,'');
  $('#contatos').innerHTML=`<a href="https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da '+c.nome+'.')}" target="_blank" rel="noopener"><small>WhatsApp</small><b>(${w.slice(0,2)}) ${w.slice(2,7)}-${w.slice(7)}</b></a>`
    +(ig?`<a href="https://instagram.com/${esc(ig)}" target="_blank" rel="noopener"><small>Instagram</small><b>@${esc(ig)}</b></a>`:'')
    +`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.endereco)}" target="_blank" rel="noopener"><small>Endereço</small><b>${esc(c.endereco)}</b></a>`
    +(h?`<div><small>Horário</small><b>${esc(h)}</b></div>`:'');
}

/* =========================================================
   CARD DO PRODUTO PRINCIPAL
   ========================================================= */
function marcaVisivel(m){
  const c=CONFIG[estado.loja]; if(!c.mostrarMarca||!m) return '';
  return (c.ocultarMarcas||[]).includes(String(m).toLowerCase()) ? '' : m;
}
function selos(m){
  const s=[];
  if(m.estoque<=0) return ['<span class="selo esg">ESGOTADO</span>'];
  if(m.bf) s.push(`<span class="selo bf">BLACK FRIDAY${m.desc>=0.01?' -'+Math.round(m.desc*100)+'%':''}</span>`);
  else if(m.promo) s.push(m.desc>=0.01?`<span class="selo">-${Math.round(m.desc*100)}%</span>`:'<span class="selo">OFERTA</span>');
  if(estado.topIds && estado.topIds.has(m.id)) s.push('<span class="selo top">MAIS VENDIDO</span>');
  else if(m.destaque) s.push('<span class="selo dest">DESTAQUE</span>');
  if(m.lancamento||m.novo) s.push('<span class="selo novo">NOVO</span>');
  return s.slice(0,2);
}
function card(m){
  const l=estado.loja, marca=marcaVisivel(m.marca);
  const foto=m.foto?`<img src="${esc(linkFoto(m.foto,600))}" alt="${esc(m.nome)}" loading="lazy" onerror="this.remove()">`:'';
  const cores=m.cores.filter(c=>c.cor);
  const bol=cores.length?`<div class="bolinhas">${cores.slice(0,6).map(c=>bolinha(c.cor)).join('')}<small>${cores.length===1?esc(cores[0].cor):cores.length+' cores'}</small></div>`:'';
  const parc=CONFIG.parcelasMax>1?`<span class="parcela">ou ${CONFIG.parcelasMax}x de ${brl(m.pmin/CONFIG.parcelasMax)}</span>`:'';
  return `<a class="produto" href="${rotaHash(l,'p',m.slug)}">
    <div class="foto"><div class="sem-foto"><span class="ini">${esc(iniciais(m.nome))}</span><small>foto em breve</small></div>${foto}<div class="selos">${selos(m).join('')}</div></div>
    <div class="info">
      ${marca?`<span class="mc">${esc(marca)}</span>`:''}
      <h3>${esc(m.nome)}</h3>
      <div class="preco">${m.varia||cores.length>1&&m.pmax>m.pmin?'<span class="parcela">a partir de</span>':''}<b>${brl(m.pmin)}</b>${m.promo&&m.preco>m.pmin+0.009?`<s>${brl(m.preco)}</s>`:''}</div>
      ${parc}${bol}
      ${m.tams.length?`<span class="tams-resumo">Tam. ${esc(m.tams.slice(0,8).join(' · '))}${m.tams.length>8?'…':''}</span>`:''}
    </div></a>`;
}

/* =========================================================
   LISTAGEM: categoria, ofertas, Black Friday, lançamentos, busca
   ========================================================= */
function paginaLista(r){
  const l=estado.loja, c=CONFIG[l], maes=visiveis(l), q=r.q;
  estado.busca=q.get('q')||''; estado.ordem=q.get('ordem')||'padrao'; estado.gen=q.get('gen')||'Todos';
  let lista=[], titulo='', sub='', crumb='';
  $('#listaBf').hidden=true; estado.catAtual='';
  if(r.tipo==='categoria'){
    const cat=(estado['cats_'+l]||[]).find(k=>k.slug===r.slug);
    if(!cat){ lista=[]; titulo='Categoria não encontrada'; }
    else { lista=maes.filter(m=>m.deptoOrig===cat.orig); titulo=cat.nome; estado.catAtual=cat.slug; }
    crumb=titulo;
  } else if(r.tipo==='ofertas'){ lista=maes.filter(m=>m.promo).sort(porDesconto); titulo='Ofertas'; sub='Peças com preço especial'; crumb=titulo; }
  else if(r.tipo==='lancamentos'){ lista=lancamentos(maes); titulo='Lançamentos'; sub='Acabou de chegar na loja'; crumb=titulo; }
  else if(r.tipo==='bf'){
    lista=maes.filter(m=>m.bf).sort(porDesconto); titulo=''; crumb='Black Friday';
    $('#listaBf').hidden=false; $('#listaBfTitulo').textContent=cfg('bf_titulo')||'BLACK FRIDAY';
    $('#listaBfSub').textContent=cfg('bf_subtitulo'); $('#listaBfSub').hidden=!cfg('bf_subtitulo');
    contagem('#listaBfConta', dataFim(cfg('bf_fim')||(lista[0]||{}).bfFim));
    if(!lista.length) sub='A Black Friday não está valendo agora. Fique de olho nas nossas redes!';
  }
  else if(r.tipo==='busca'){ lista=maes; titulo='Buscar'; sub='Digite o nome, a cor ou a marca'; crumb='Busca'; }
  estado.listaBase=lista; estado.listaTipo=r.tipo;
  $('#listaTitulo').textContent=titulo; $('#listaTitulo').hidden=!titulo;
  $('#listaCrumbs').innerHTML=`<a href="${rotaHash(l)}">${esc(c.nome)}</a><span>›</span><span>${esc(crumb)}</span>`;
  document.title=(crumb||c.nome)+' | '+c.nome; meta(crumb+' na '+c.nome+': '+lista.length+' produtos. Escolha cor e tamanho e peça pelo WhatsApp.');
  $('#listaCont').dataset.sub=sub;
  $('#busca').value=estado.busca; $('#ordenar').value=estado.ordem;
  $('#busca').placeholder=r.tipo==='busca'?'Buscar produto, cor, marca...':'Buscar nesta página...';
  generos(lista); grade();
  if(r.tipo==='busca') setTimeout(()=>$('#busca').focus(),60);
}
function generos(lista){
  const G=CONFIG[estado.loja].generos;
  const gens=G?Object.keys(G).filter(g=>g!=='Unissex' && lista.some(m=>m.genero===g)):[];
  $('#generos').hidden=gens.length<2;
  $('#generos').innerHTML=['Todos',...gens].map(g=>`<button class="gen ${g===estado.gen?'ativo':''}" data-gen="${esc(g)}" aria-pressed="${g===estado.gen}">${g==='Todos'?'Todos':esc(G[g])}</button>`).join('');
}
function grade(){
  const termo=semAcento(estado.busca), G=CONFIG[estado.loja].generos;
  let lista=(estado.listaBase||[]).filter(m=>{
    if(estado.gen!=='Todos' && m.genero!==estado.gen && m.genero!=='Unissex') return false;
    if(!termo) return true;
    return termo.split(/\s+/).every(t=>(m.busca+' '+semAcento(G?.[m.genero]||'')).includes(t));
  });
  const o=estado.ordem;
  if(o==='menor') lista.sort((a,b)=>a.pmin-b.pmin);
  else if(o==='maior') lista.sort((a,b)=>b.pmin-a.pmin);
  else if(o==='az') lista.sort((a,b)=>a.nome.localeCompare(b.nome));
  else if(o==='vendidos') lista.sort((a,b)=>b.vendidos-a.vendidos);
  else if(o==='novos') lista.sort((a,b)=>(b.lancamento||b.novo)-(a.lancamento||a.novo));
  else if(o==='desconto') lista.sort(porDesconto);
  else if(estado.listaTipo!=='ofertas'&&estado.listaTipo!=='bf'&&estado.listaTipo!=='lancamentos') lista.sort((a,b)=>(b.destaque-a.destaque)||(a.ordem-b.ordem)||(b.vendidos-a.vendidos)||((!!b.foto)-(!!a.foto)));
  const sub=$('#listaCont').dataset.sub;
  $('#listaCont').textContent=(estado.listaTipo==='busca'&&!termo)?sub:(lista.length+(lista.length===1?' produto':' produtos')+(sub&&lista.length?' · '+sub:''));
  if(estado.listaTipo==='busca'&&!termo){ $('#grade').innerHTML=''; return; }
  $('#grade').innerHTML=lista.length?lista.map(card).join(''):`<div class="vazio">Nenhum produto encontrado. <a href="${rotaHash(estado.loja)}">Voltar ao início</a></div>`;
}
function filtrosNaUrl(){
  const r=estado.rota, q=new URLSearchParams();
  if(estado.busca) q.set('q',estado.busca); if(estado.ordem!=='padrao') q.set('ordem',estado.ordem); if(estado.gen!=='Todos') q.set('gen',estado.gen);
  const base=location.hash.split('?')[0], nh=base+(q.toString()?'?'+q:'');
  if(nh!==location.hash){ history.replaceState(null,'',nh); ultimoHash=location.hash; estado.voltar=location.hash; }
}
$('#busca').oninput=e=>{ estado.busca=e.target.value; grade(); clearTimeout($('#busca')._t); $('#busca')._t=setTimeout(filtrosNaUrl,400); };
$('#ordenar').onchange=e=>{ estado.ordem=e.target.value; grade(); filtrosNaUrl(); };
$('#btnBusca').onclick=()=>{ navNova=true; location.hash=rotaHash(estado.loja,'busca').slice(1); };

/* =========================================================
   PÁGINA DO PRODUTO: cor → tamanhos com estoque → preço
   ========================================================= */
let pSel={};
function paginaProduto(r){
  const l=estado.loja, c=CONFIG[l], m=visiveis(l).find(x=>x.slug===r.slug)||(estado.maes[l]||[]).find(x=>x.slug===r.slug);
  $('#secRelacionados').hidden=true;
  if(!m){ $('#prodCrumbs').innerHTML=`<a href="${rotaHash(l)}">${esc(c.nome)}</a>`; $('#prodCorpo').innerHTML=`<div class="vazio">Este produto não está mais disponível. <a href="${rotaHash(l)}">Ver a loja</a></div>`; document.title=c.nome; return; }
  const cat=(estado['cats_'+l]||[]).find(k=>k.orig===m.deptoOrig); estado.catAtual=cat?cat.slug:'';
  menus();
  let cor=m.cores.find(x=>x.slug===r.cor) || m.cores.find(x=>x.estoque>0) || m.cores[0];
  if(pSel.mae!==m.id || pSel.cor!==cor.codigo) pSel={mae:m.id, cor:cor.codigo, tam:'', qtd:1};
  document.title=m.nome+(cor.cor?' '+cor.cor:'')+' | '+c.nome;
  meta(m.nome+' na '+c.nome+'. '+(m.cores.length>1?m.cores.length+' cores. ':'')+'A partir de '+brl(m.pmin)+'. Peça pelo WhatsApp.');
  const voltar=estado.voltar&&estado.voltar!==location.hash?estado.voltar:(cat?rotaHash(l,'c',cat.slug):rotaHash(l));
  const voltarNome=estado.voltar&&/\/c\//.test(estado.voltar)?'Voltar para a categoria':estado.voltar&&!/\/(p)\//.test(estado.voltar)&&estado.voltar!==rotaHash(l)?'Voltar':(cat?'Ver mais '+cat.nome:'Voltar à loja');
  $('#prodCrumbs').innerHTML=`<a href="${rotaHash(l)}">${esc(c.nome)}</a><span>›</span>${cat?`<a href="${rotaHash(l,'c',cat.slug)}">${esc(cat.nome)}</a><span>›</span>`:''}<span>${esc(m.nome)}</span>`;
  desenharProduto(m, cor, voltar, voltarNome);
  const rel=visiveis(l).filter(x=>x!==m && x.deptoOrig===m.deptoOrig).sort((a,b)=>(b.destaque-a.destaque)||(b.vendidos-a.vendidos)).slice(0,CONFIG.maxCarrossel);
  $('#secRelacionados').hidden=!rel.length; $('#carRelacionados').innerHTML=rel.map(card).join('');
}
function desenharProduto(m, cor, voltar, voltarNome){
  const l=estado.loja, c=CONFIG[l], marca=marcaVisivel(m.marca);
  const tSel=cor.tamanhos.find(t=>t.n===pSel.tam && t.q>0);
  if(!tSel) pSel.tam='';
  const preco=tSel?tSel.p:cor.pmin, aPartir=!tSel&&cor.varia;
  const de=cor.preco>preco+0.009?cor.preco:0, off=de?Math.round((1-preco/de)*100):0;
  const foto=cor.foto||m.foto;
  const link=CONFIG.site+'?o=compartilhado#'+rotaHash(l,'p',m.slug,m.cores.length>1?cor.slug:'').slice(1);
  const msgDuvida='Olá! Tenho interesse nesta peça: '+m.nome+(cor.cor?' — '+cor.cor:'')+(pSel.tam?' (tam. '+pSel.tam+')':'')+' — cód. '+cor.codigo+'\n'+link;
  const maxQ=tSel?tSel.q:0; if(pSel.qtd>maxQ) pSel.qtd=Math.max(1,maxQ);
  const unica=cor.tamanhos.length===1 && /^(unico|único|u|padrao|padrão)$/i.test(cor.tamanhos[0].n);
  if(unica && cor.tamanhos[0].q>0 && !pSel.tam){ pSel.tam=cor.tamanhos[0].n; return desenharProduto(m,cor,voltar,voltarNome); }
  $('#prodCorpo').innerHTML=`<a class="p-voltar" href="${voltar}">← ${esc(voltarNome)}</a>
  <div class="p-pagina">
    <div class="p-galeria">
      <div class="p-foto" ${foto?`data-zoom="${esc(linkFoto(foto,1600))}"`:''}><div class="sem-foto"><span class="ini">${esc(iniciais(m.nome))}</span><small>foto em breve</small></div>${foto?`<img src="${esc(linkFoto(foto,1200))}" alt="${esc(m.nome+(cor.cor?' — '+cor.cor:''))}" onerror="this.remove()">`:''}<div class="selos">${selos(m).join('')}</div></div>
      ${m.cores.length>1?`<div class="p-miniaturas" role="list">${m.cores.map(x=>`<button role="listitem" class="${x===cor?'sel':''}" data-pcor="${esc(x.slug)}" aria-label="Cor ${esc(x.cor)}">${(x.foto||m.foto)?`<img src="${esc(linkFoto(x.foto||m.foto,200))}" alt="" loading="lazy">`:`<span>${esc(x.cor)}</span>`}</button>`).join('')}</div>`:''}
    </div>
    <div class="p-info">
      ${marca?`<span class="mc" style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(marca)}</span>`:''}
      <h1>${esc(m.nome)}</h1>
      <div><div class="preco">${aPartir?'<span class="parcela">a partir de</span>':''}<b>${brl(preco)}</b>${de?`<s>${brl(de)}</s><span class="off">-${off}%</span>`:''}</div>
        ${CONFIG.parcelasMax>1?`<span class="parcela">ou ${CONFIG.parcelasMax}x de ${brl(preco/CONFIG.parcelasMax)} no cartão</span>`:''}</div>
      ${cor.bf?`<div class="p-bf"><b>${esc(cfg('bf_titulo')||'BLACK FRIDAY')}</b><span>Preço especial por tempo limitado${cor.bfRestam!=null?` · restam ${cor.bfRestam} peça(s) nesta oferta`:''}</span><span class="contagem" id="pBfConta" hidden></span></div>`:''}
      ${m.cores.some(x=>x.cor)?`<div class="p-bloco"><h4>Cor <span>${esc(cor.cor||'Única')}</span></h4><div class="cores-sel">${m.cores.map(x=>`<button class="cor-btn ${x===cor?'sel':''}" data-pcor="${esc(x.slug)}" aria-pressed="${x===cor}">${bolinha(x.cor)}${esc(x.cor||'Única')}</button>`).join('')}</div></div>`:''}
      ${unica?'':`<div class="p-bloco"><h4>Tamanho <span>${pSel.tam?'Tam. '+esc(pSel.tam):'Escolha um tamanho'}</span></h4><div class="tams">${cor.tamanhos.map(t=>`<button class="tam ${pSel.tam===t.n?'sel':''}" data-ptam="${esc(t.n)}" ${t.q<=0?'disabled aria-label="'+esc(t.n)+' esgotado"':''}><b>${esc(t.n)}</b>${t.q<=0?'<small>esgotado</small>':t.q===1?'<small>última</small>':cor.varia?`<small>${brl(t.p).replace('R$ ','')}</small>`:''}</button>`).join('')}</div></div>`}
      <div class="p-acoes">
        <div class="qtd-sel"><button data-pqtd="-1" aria-label="Diminuir">−</button><span>${pSel.qtd}</span><button data-pqtd="1" aria-label="Aumentar">+</button></div>
        <button class="add" id="pAdd" ${tSel?'':'disabled'}>${tSel?'Adicionar à sacola':'Escolha o tamanho'}</button>
      </div>
      <a class="p-zap" href="https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msgDuvida)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>Tirar dúvida no WhatsApp</a>
      <p class="p-aviso">A disponibilidade é confirmada pela nossa equipe no WhatsApp antes do pagamento. Cód. ${esc(cor.codigo)}</p>
      <div class="m-share"><a href="https://wa.me/?text=${encodeURIComponent('Olha essa peça da '+c.nome+': '+m.nome+' — '+link)}" target="_blank" rel="noopener">Enviar para alguém</a><button id="mCopiar" type="button">Copiar link</button></div>
    </div>
  </div>`;
  if(cor.bf) contagem('#pBfConta', dataFim(cfg('bf_fim')||cor.bfFim));
  $('#mCopiar').onclick=()=>copiar(link);
  $('#pAdd').onclick=()=>{ if(!pSel.tam){ toast('Escolha um tamanho'); return; } adicionar(m, cor, pSel.tam, pSel.qtd); };
  pSel._ctx={m,cor,voltar,voltarNome};
}
function trocarCor(slugCor){
  const {m,voltar,voltarNome}=pSel._ctx||{}; if(!m) return;
  const cor=m.cores.find(x=>x.slug===slugCor); if(!cor) return;
  pSel.cor=cor.codigo; pSel.tam=''; pSel.qtd=1;
  history.replaceState(null,'',rotaHash(estado.loja,'p',m.slug,cor.slug)); ultimoHash=location.hash;
  desenharProduto(m, cor, voltar, voltarNome);
}

/* cliques (delegação) */
document.addEventListener('click', e=>{
  const t=e.target.closest('[data-pcor],[data-ptam],[data-pqtd],[data-gen],[data-car],[data-aval],[data-zoom],[data-fechar]');
  if(!t) return;
  if(t.dataset.pcor){ trocarCor(t.dataset.pcor); return; }
  if(t.dataset.ptam){ pSel.tam=t.dataset.ptam; pSel.qtd=1; const x=pSel._ctx; desenharProduto(x.m,x.cor,x.voltar,x.voltarNome); return; }
  if(t.dataset.pqtd){ const x=pSel._ctx, T=x.cor.tamanhos.find(z=>z.n===pSel.tam); const max=T?T.q:1; pSel.qtd=Math.min(max,Math.max(1,pSel.qtd+Number(t.dataset.pqtd))); if(T&&pSel.qtd>=max&&Number(t.dataset.pqtd)>0) toast('Quantidade máxima disponível'); desenharProduto(x.m,x.cor,x.voltar,x.voltarNome); return; }
  if(t.dataset.gen){ estado.gen=t.dataset.gen; generos(estado.listaBase||[]); grade(); filtrosNaUrl(); return; }
  if(t.dataset.car){ const c=document.getElementById(t.dataset.car); c.scrollBy({left:Number(t.dataset.dir)*c.clientWidth*0.85,behavior:'smooth'}); return; }
  if(t.dataset.aval){ const c=$('#carAval'); c.scrollBy({left:Number(t.dataset.aval)*((c.firstElementChild?.offsetWidth||260)+14),behavior:'smooth'}); return; }
  if(t.dataset.zoom){ const lb=document.createElement('div'); lb.className='lightbox'; lb.innerHTML=`<img src="${esc(t.dataset.zoom)}" alt="">`; lb.onclick=()=>lb.remove(); document.body.appendChild(lb); return; }
  if(t.hasAttribute('data-fechar')){ fecharTudo(); return; }
});
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.zoom) e.target.click(); });
function fecharTudo(silencioso){
  $('#gaveta').classList.remove('on'); $('#gavetaCats').classList.remove('on'); $('#fundo').classList.remove('on');
}
$('#fundo').onclick=()=>fecharTudo();
$('#gavetaCats').addEventListener('click',e=>{ if(e.target.closest('a')) fecharTudo(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ fecharTudo(); $$('.lightbox').forEach(x=>x.remove()); } });

/* =========================================================
   SACOLA
   ========================================================= */
function adicionar(m, cor, tam, qtd){
  const l=estado.loja, T=cor.tamanhos.find(t=>t.n===tam)||{}, maxQ=T.q||0;
  if(maxQ<=0){ toast('Tamanho esgotado'); return; }
  const cart=carrinhos[l], ex=cart.find(i=>i.codigo===cor.codigo&&i.tam===tam);
  const nome=m.nome+(cor.cor&&!m.nome.toLowerCase().includes(cor.cor.toLowerCase())?' — '+cor.cor:'');
  if(ex){ if(ex.qtd>=maxQ){ toast('Quantidade máxima disponível'); return; } ex.qtd=Math.min(maxQ,ex.qtd+qtd); ex.preco=T.p; }
  else cart.push({codigo:cor.codigo,nome,marca:marcaVisivel(m.marca),tam,qtd:Math.min(qtd,maxQ),preco:T.p,foto:cor.foto||m.foto,max:maxQ});
  salvar(); toast('Adicionado à sacola ✓');
}
function salvar(){ store.set('sacola_'+estado.loja, carrinhos[estado.loja]); sincronizarSacola(estado.loja,'mudou'); atualizarContador(); if($('#gaveta').classList.contains('on')) desenharSacola(); }
function atualizarContador(){ if(!estado.loja) return; const n=carrinhos[estado.loja].reduce((s,i)=>s+i.qtd,0); $('#qtdCarrinho').textContent=n; $('#qtdCarrinho').hidden=n===0; }
function desenharSacola(){
  const l=estado.loja, cart=carrinhos[l];
  $('#gTitulo').textContent='Sacola '+CONFIG[l].nome; $('#gRodape').hidden=!cart.length;
  if(!cart.length){ $('#gItens').innerHTML='<div class="g-vazio">Sua sacola está vazia.<br>Escolha um produto, a cor e o tamanho para começar.</div>'; return; }
  $('#gItens').innerHTML=cart.map((i,k)=>`<div class="item">
      <div class="mini">${i.foto?`<img src="${esc(linkFoto(i.foto,200))}" alt="">`:esc(iniciais(i.nome))}</div>
      <div><h4>${esc(i.nome)}</h4><small>Tam. ${esc(i.tam)} · ${brl(i.preco)}</small>
        <div class="qtdbox"><button data-m="${k}" aria-label="Diminuir">−</button><span>${i.qtd}</span><button data-mais="${k}" aria-label="Aumentar">+</button></div></div>
      <div class="valor">${brl(i.preco*i.qtd)}<button class="rm" data-r="${k}">remover</button></div></div>`).join('');
  $('#gTotal').textContent=brl(cart.reduce((s,i)=>s+i.preco*i.qtd,0));
  $$('#gItens [data-m]').forEach(b=>b.onclick=()=>{ const i=cart[b.dataset.m]; i.qtd--; if(i.qtd<=0) cart.splice(b.dataset.m,1); salvar(); });
  $$('#gItens [data-mais]').forEach(b=>b.onclick=()=>{ const i=cart[b.dataset.mais]; if(i.max&&i.qtd>=i.max){toast('Quantidade máxima disponível');return;} i.qtd++; salvar(); });
  $$('#gItens [data-r]').forEach(b=>b.onclick=()=>{ cart.splice(b.dataset.r,1); salvar(); });
}
$('#btnCarrinho').onclick=()=>{ desenharSacola(); $('#gaveta').classList.add('on'); $('#fundo').classList.add('on'); };
$('#cReceber').onchange=e=>{ $('#campoEnd').hidden=!e.target.value.startsWith('Entrega'); };
$('#cNome').value=store.get('cliente_nome','');
$('#btnZap').onclick=()=>{
  const l=estado.loja, c=CONFIG[l], cart=carrinhos[l], nome=$('#cNome').value.trim();
  if(!nome){ $('#cNome').focus(); toast('Informe seu nome'); return; }
  store.set('cliente_nome',nome);
  const total=cart.reduce((s,i)=>s+i.preco*i.qtd,0), entrega=$('#cReceber').value, end=$('#cEnd').value.trim(), obs=$('#cObs').value.trim();
  let msg=`Olá! Quero fazer um pedido na *${c.nome}* pelo site:\n\n`;
  cart.forEach(i=>{ msg+=`• ${i.qtd}x ${i.nome}${i.marca?' ('+i.marca+')':''} - Tam. ${i.tam} - ${brl(i.preco*i.qtd)}\n   Cód: ${i.codigo}\n`; });
  msg+=`\n*Total: ${brl(total)}*\n\nNome: ${nome}\nRecebimento: ${entrega}${entrega.startsWith('Entrega')&&end?'\nEndereço: '+end:''}\nPagamento: ${$('#cPagto').value}`;
  if(obs) msg+=`\nObs.: ${obs}`;
  window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`,'_blank');
  sincronizarSacola(l,'enviada');
};

/* RODAPÉ */
function rodape(){
  const bloco=k=>{ const c=CONFIG[k], cf=estado.cfg[k]||{};
    return `<div><h4>${c.nome}</h4>${esc(c.endereco)}<br><a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>${cf.instagram?` · <a href="https://instagram.com/${esc(cf.instagram)}" target="_blank" rel="noopener">@${esc(cf.instagram)}</a>`:''}${cf.horario?`<br>${esc(cf.horario)}`:''}</div>`; };
  const lojas=estado.loja?[estado.loja]:LOJAS;
  $('#rodape').innerHTML=lojas.map(bloco).join('')+`<div class="legal">© ${new Date().getFullYear()} Group BRV · CNPJ ${CONFIG.cnpj} · Preços e disponibilidade sujeitos a confirmação no atendimento.<a href="#admin" class="link-adm">🔒 Área do lojista</a></div>`;
}
