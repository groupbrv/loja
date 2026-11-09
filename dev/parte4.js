
/* =========================================================
   ÁREA DO LOJISTA
   ========================================================= */
const adm={ loja:store.get('adm_loja','bravus'), itens:[], cfg:{}, aval:[], ocupado:{}, aba:'produtos', bf:null, bfEdit:{}, bfSel:new Set() };
const sess={ get(l){ try{ return sessionStorage.getItem('adm_tk_'+l)||''; }catch(e){ return ''; } }, set(l,v){ try{ v?sessionStorage.setItem('adm_tk_'+l,v):sessionStorage.removeItem('adm_tk_'+l); }catch(e){} } };
async function api(l,dados){
  const r=await fetch(CONFIG[l].api,{method:'POST',body:JSON.stringify(dados)});
  const j=await r.json();
  if(!j.ok){ if(j.erro==='SESSAO_EXPIRADA'){ sess.set(l,''); if(l===adm.loja) mostrarLogin(); } throw new Error(j.erro==='SESSAO_EXPIRADA'?'Sessão expirada, entre de novo.':j.erro); }
  return j;
}
const tk=()=>sess.get(adm.loja);
function abrirAdmin(){
  document.body.dataset.tema='admin'; document.title='Área do lojista';
  $('#tela-inicio').hidden=true; $('#tela-loja').hidden=true; $('#btnCarrinho').hidden=true; $('#btnBusca').hidden=true; $('#avisoTopo').hidden=true; $('#zapFlutua').hidden=true;
  $('#tela-admin').hidden=false; document.querySelector('footer').hidden=true; estado.loja=null; pararCapa();
  $$('.aba').forEach(a=>a.classList.remove('ativa'));
  trocarLojaAdm(adm.loja);
}
function trocarLojaAdm(l){
  adm.loja=l; store.set('adm_loja',l); adm.bf=null; adm.bfEdit={}; adm.bfSel=new Set(); adm.rel=null; adm.cli=null;
  $$('.adm-lojas button').forEach(b=>b.classList.toggle('on',b.dataset.l===l));
  if(sess.get(l)) carregarAdm(); else mostrarLogin();
}
function mostrarLogin(){ $('#admLogin').hidden=false; $('#admArea').hidden=true; $('#admErro').textContent=''; $('#admPin').value=''; $('#admUser').value=store.get('adm_user_'+adm.loja,''); $('#admUser').placeholder='Usuário do PDV '+CONFIG[adm.loja].nome; setTimeout(()=>$('#admUser').focus(),50); }
$$('.adm-lojas button').forEach(b=>b.onclick=()=>trocarLojaAdm(b.dataset.l));
$('#admForm').onsubmit=async e=>{
  e.preventDefault(); const l=adm.loja, bt=$('#admEntrar');
  bt.disabled=true; bt.textContent='Entrando…'; $('#admErro').textContent='';
  try{ const j=await api(l,{acao:'login',user:$('#admUser').value.trim(),pin:$('#admPin').value}); sess.set(l,j.token); store.set('adm_user_'+l,$('#admUser').value.trim()); carregarAdm(); }
  catch(err){ $('#admErro').textContent=err.message+(/incorreto/.test(err.message)?' Use o usuário do PDV da '+CONFIG[l].nome+' (cada loja tem o seu).':''); }
  bt.disabled=false; bt.textContent='Entrar';
};
function abrirAba(t){
  adm.aba=t; $$('#admTabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
  $$('[data-painel]').forEach(p=>p.hidden=p.dataset.painel!==t);
  if(t==='clientes') carregarClientes();
  if(t==='bf') carregarBf();
  if(t==='origens') carregarRelatorio();
  if(t==='categorias') desenharCategoriasAdm();
}
$$('#admTabs button').forEach(b=>b.onclick=()=>{
  if(b.dataset.t==='sair'){ sess.set(adm.loja,''); mostrarLogin(); return; }
  abrirAba(b.dataset.t);
});
$('#admBusca').oninput=desenharAdm; $('#admFiltro').onchange=desenharAdm;
async function carregarAdm(){
  $('#admLogin').hidden=true; $('#admArea').hidden=false;
  $('#admItens').innerHTML='<p class="adm-cont">Carregando…</p>'; $('#admCont').textContent='';
  try{
    const [j,c]=await Promise.all([api(adm.loja,{acao:'listar',token:tk()}), api(adm.loja,{acao:'config_get',token:tk()})]);
    adm.itens=j.itens; adm.cfg=c.cfg||{}; adm.aval=c.feedbacks||[]; desenharAdm(); preencherCfg(); abrirAba(adm.aba);
  }catch(err){ $('#admItens').innerHTML='<p class="adm-erro">'+esc(err.message)+'</p>'; }
}
function invalidar(){ delete estado.maes[adm.loja]; }

/* ---------- produtos: um bloco por produto principal, com as cores dentro ---------- */
function maesAdm(){
  const g=new Map();
  adm.itens.forEach(i=>{ const k=i.mae||i.codigo; if(!g.has(k)) g.set(k,{mae:k, nome:i.maeNome||i.nome, cores:[]}); g.get(k).cores.push(i); });
  return [...g.values()].map(m=>{ const cs=m.cores;
    Object.assign(m,{ destaque:cs.some(i=>i.destaque), lancamento:cs.some(i=>i.lancamento), ativo:cs.some(i=>i.ativo), naVitrine:cs.some(i=>i.naVitrine),
      ordem:(cs.find(i=>i.ordem)||{}).ordem||'', bf:cs.some(i=>i.bf), promo:cs.some(i=>i.promo), vendidos:cs.reduce((s,i)=>s+(i.vendidos||0),0),
      categoria:(cs.find(i=>i.categoria)||{}).categoria||'', semFoto:cs.some(i=>!i.foto&&i.naVitrine), comFoto:cs.some(i=>i.foto) }); return m; });
}
function desenharAdm(){
  const f=$('#admFiltro').value, t=semAcento($('#admBusca').value);
  const lista=maesAdm().filter(m=>{
    if(f==='semfoto'&&(!m.semFoto||!m.ativo)) return false;
    if(f==='comfoto'&&!m.comFoto) return false;
    if(f==='destaque'&&!m.destaque) return false;
    if(f==='lancamento'&&!m.lancamento) return false;
    if(f==='promo'&&!m.promo) return false;
    if(f==='bf'&&!m.bf) return false;
    if(f==='ocultos'&&m.ativo) return false;
    return !t||semAcento(m.nome+' '+m.categoria+' '+m.cores.map(c=>c.codigo+' '+c.cor).join(' ')).includes(t);
  }).sort((a,b)=>(b.naVitrine-a.naVitrine)||(b.destaque-a.destaque)||((Number(a.ordem)||999)-(Number(b.ordem)||999))||a.nome.localeCompare(b.nome));
  const semFoto=adm.itens.filter(i=>!i.foto&&i.ativo&&i.naVitrine).length;
  $('#admCont').textContent=`${lista.length} produto(s) · ${semFoto} cor(es) na vitrine ainda sem foto`;
  $('#admItens').innerHTML=lista.slice(0,400).map(m=>{
    const k=esc(m.mae);
    return `<div class="adm-mae"><div class="adm-mae-topo"><div><div class="adm-nome">${esc(m.nome)}${!m.naVitrine?'<span class="adm-tag">sem estoque</span>':''}${!m.ativo?'<span class="adm-tag">oculto</span>':''}${m.bf?'<span class="adm-tag bf">Black Friday</span>':''}${m.vendidos>0?`<span class="adm-tag">${m.vendidos} vendido(s) em 30 dias</span>`:''}</div>
        <div class="adm-meta">${esc(m.categoria)} · ${m.cores.length} cor(es)</div></div>
      <div class="adm-acoes">
        <button data-mdest="${k}" class="${m.destaque?'on':''}">${m.destaque?'★ Destaque':'☆ Destacar'}</button>
        <button data-mlanc="${k}" class="${m.lancamento?'on':''}">${m.lancamento?'✓ Lançamento':'Lançamento'}</button>
        <label style="display:flex;align-items:center;gap:6px;border:none;background:none;padding:0">Ordem <input class="ordem" type="number" min="1" max="999" value="${esc(m.ordem)}" data-mord="${k}" placeholder="—" aria-label="Ordem nos destaques"></label>
        <button data-mvis="${k}" class="${m.ativo?'':'off'}">${m.ativo?'Visível':'Oculto'}</button>
      </div></div>
      <div class="adm-cores">${m.cores.map(i=>{ const c=esc(i.codigo), env=adm.ocupado[i.codigo];
        return `<div class="adm-item"><div class="adm-foto">${i.foto?`<img src="${esc(linkFoto(i.foto,300))}" alt="">`:'sem foto'}${env?'<div class="env">'+esc(env)+'</div>':''}</div>
          <div><div style="font-weight:600;font-size:14px">${esc(i.cor||'Cor única')}${!i.naVitrine?'<span class="adm-tag">sem estoque</span>':''}</div>
          <div class="adm-meta">${i.preco?brl(num(i.preco)):''}${i.promo?' → <b>'+brl(num(i.promo))+'</b>':''} · cód. ${c}${i.tamanhos?' · '+esc(String(i.tamanhos).split('|').map(x=>x.split(':').slice(0,2).join(':')).join(' ')):''}</div>
          <div class="adm-acoes"><label class="prim">${i.foto?'Trocar foto':'Adicionar foto'}<input type="file" accept="image/*" hidden data-foto="${c}"></label>
            ${i.foto?`<button data-rm="${c}">Remover foto</button>`:''}
            ${m.bf?'':`<button data-promo="${c}" class="${i.promo?'promo-on':''}">${i.promo?'% Em promoção':'% Promoção'}</button>`}</div></div></div>`; }).join('')}</div></div>`;
  }).join('')||'<p class="adm-cont">Nada por aqui.</p>';
  const codsMae=k=>adm.itens.filter(i=>(i.mae||i.codigo)===k).map(i=>i.codigo);
  $$('#admItens [data-foto]').forEach(inp=>inp.onchange=()=>{ if(inp.files[0]) enviarFoto(inp.dataset.foto,inp.files[0]); });
  $$('#admItens [data-rm]').forEach(b=>b.onclick=()=>{ if(confirm('Remover a foto desta cor?')) acaoAdm(b.dataset.rm,{acao:'remover_foto'},i=>i.foto=''); });
  $$('#admItens [data-mdest]').forEach(b=>b.onclick=()=>{ const m=maesAdm().find(x=>x.mae===b.dataset.mdest); acaoMae(codsMae(m.mae),{destaque:!m.destaque},i=>i.destaque=!m.destaque); });
  $$('#admItens [data-mlanc]').forEach(b=>b.onclick=()=>{ const m=maesAdm().find(x=>x.mae===b.dataset.mlanc); acaoMae(codsMae(m.mae),{lancamento:!m.lancamento},i=>i.lancamento=!m.lancamento); });
  $$('#admItens [data-mvis]').forEach(b=>b.onclick=()=>{ const m=maesAdm().find(x=>x.mae===b.dataset.mvis); acaoMae(codsMae(m.mae),{ativo:!m.ativo},i=>i.ativo=!m.ativo); });
  $$('#admItens [data-mord]').forEach(inp=>inp.onchange=()=>{ const v=inp.value.trim(); if(v&&!/^\d{1,3}$/.test(v)){ alert('Use um número de 1 a 999.'); return; } acaoMae(codsMae(inp.dataset.mord),{ordem:v},i=>i.ordem=v); });
  $$('#admItens [data-promo]').forEach(b=>b.onclick=()=>{
    const i=adm.itens.find(x=>x.codigo===b.dataset.promo);
    const v=prompt(`Preço promocional de "${i.nome}"\nPreço normal: ${brl(num(i.preco))}\n\nDigite o valor (ex.: 89,90). Deixe vazio para DESATIVAR a promoção.`, i.promo?String(num(i.promo)).replace('.',','):'');
    if(v===null) return;
    const val=num(v);
    if(v.trim() && (!val || val>=num(i.preco))){ alert('O preço promocional precisa ser menor que o preço normal.'); return; }
    acaoAdm(i.codigo,{acao:'promo',ativa:!!v.trim(),valor:val},x=>x.promo=v.trim()?String(val):'');
  });
}
async function acaoMae(cods,dados,aplicar){
  cods.forEach(c=>adm.ocupado[c]='Salvando…'); desenharAdm();
  try{ await api(adm.loja,Object.assign({acao:'editar',token:tk(),codigos:cods},dados)); adm.itens.filter(i=>cods.includes(i.codigo)).forEach(i=>aplicar(i)); invalidar(); toast('Salvo ✓'); }
  catch(err){ alert(err.message); }
  cods.forEach(c=>delete adm.ocupado[c]); desenharAdm();
}
async function acaoAdm(cod,dados,aplicar){
  const l=adm.loja; adm.ocupado[cod]='Salvando…'; desenharAdm();
  try{ const j=await api(l,Object.assign({token:tk(),codigo:cod},dados)); const i=adm.itens.find(x=>x.codigo===cod); if(i) aplicar(i,j); invalidar(); toast('Salvo ✓'); }
  catch(err){ alert(err.message); }
  delete adm.ocupado[cod]; desenharAdm();
}
async function reduzirFoto(file,max){
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((ok,erro)=>{ const im=new Image(); im.onload=()=>ok(im); im.onerror=()=>erro(new Error('Não consegui abrir essa imagem.')); im.src=url; });
    const k=Math.min(1,(max||1200)/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement('canvas'); c.width=Math.round(img.naturalWidth*k); c.height=Math.round(img.naturalHeight*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    return c.toDataURL('image/jpeg',0.82).split(',')[1];
  } finally { URL.revokeObjectURL(url); }
}
async function enviarFoto(cod,file){
  adm.ocupado[cod]='Enviando…'; desenharAdm();
  try{ const b64=await reduzirFoto(file,1200); await acaoAdm(cod,{acao:'foto',base64:b64,mime:'image/jpeg'},(i,j)=>i.foto=j.foto); }
  catch(err){ alert(err.message); delete adm.ocupado[cod]; desenharAdm(); }
}

/* ---------- Black Friday ---------- */
async function carregarBf(){
  if(adm.bf){ desenharBf(); return; }
  $('#bfTabela').innerHTML='<tr><td class="adm-cont">Carregando…</td></tr>';
  try{ const j=await api(adm.loja,{acao:'bf_listar',token:tk()}); adm.bf=j; adm.bfEdit={}; desenharBf(); }
  catch(err){ $('#bfTabela').innerHTML='<tr><td class="adm-erro">'+esc(err.message)+'</td></tr>'; }
}
const pctDe=(preco,base)=>preco>0&&base>0&&preco<base?Math.round((1-preco/base)*100):0;
function valBf(it){ const e=adm.bfEdit[it.mae]||{}; return Object.assign({participa:!!it.participa, preco:it.preco||'', limite:it.limite||'', inicio:it.inicio||'', fim:it.fim||''}, e); }
function stClasse(s){ return /^Ativa/.test(s)?'ativa':/Agendada/.test(s)?'agendada':/inválido|não encontrado|Limite/.test(s)?'erro':''; }
function desenharBf(){
  if(!adm.bf) return;
  const t=semAcento($('#bfBusca').value), f=$('#bfFiltro').value;
  const lista=adm.bf.itens.filter(it=>{ const v=valBf(it); if(f==='sim'&&!v.participa) return false; if(f==='nao'&&v.participa) return false; return !t||semAcento(it.nome+' '+it.categoria+' '+(it.cores||[]).join(' ')).includes(t); });
  $('#bfSelQtd').textContent=adm.bfSel.size;
  $('#bfTabela').innerHTML=`<thead><tr><th><input type="checkbox" id="bfTodos" aria-label="Selecionar todos"></th><th>Produto</th><th class="n">Preço normal</th><th>Preço Black Friday</th><th class="n">Desconto</th><th>Participa</th><th>Limite (peças)</th><th>Início (opcional)</th><th>Fim (opcional)</th><th>Situação</th></tr></thead><tbody>`+
    lista.slice(0,500).map(it=>{ const v=valBf(it), k=esc(it.mae), p=num(v.preco), pct=pctDe(p,it.precoMin);
      return `<tr class="bf-linha"><td><input type="checkbox" data-bfsel="${k}" ${adm.bfSel.has(it.mae)?'checked':''} aria-label="Selecionar ${esc(it.nome)}"></td>
        <td><div class="pf">${it.foto?`<img src="${esc(linkFoto(it.foto,120))}" alt="">`:'<span class="sf"></span>'}<div><b style="font-size:13px">${esc(it.nome)}</b><div class="dica">${esc((it.cores||[]).join(', ')||'cor única')} · ${it.estoque} em estoque</div></div></div></td>
        <td class="n">${brl(it.precoMin)}${it.precoMax>it.precoMin+0.009?'<br><span class="dica">até '+brl(it.precoMax)+'</span>':''}</td>
        <td><input type="text" inputmode="decimal" data-bfp="${k}" value="${v.preco===''?'':String(v.preco).replace('.',',')}" placeholder="0,00" aria-label="Preço Black Friday"></td>
        <td class="n">${pct?'<b>-'+pct+'%</b>':p&&p>=it.precoMin?'<span class="st erro">preço maior</span>':'—'}</td>
        <td><input type="checkbox" data-bfpart="${k}" ${v.participa?'checked':''} aria-label="Participa"></td>
        <td><input type="number" min="0" data-bflim="${k}" value="${esc(v.limite)}" placeholder="sem limite" aria-label="Limite"></td>
        <td><input type="datetime-local" data-bfini="${k}" value="${esc(v.inicio)}" aria-label="Início"></td>
        <td><input type="datetime-local" data-bffim="${k}" value="${esc(v.fim)}" aria-label="Fim"></td>
        <td><span class="st ${stClasse(it.status)}">${esc(it.status)}${it.restam!=null&&/^Ativa/.test(it.status)?' · restam '+it.restam:''}</span>${adm.bfEdit[it.mae]?'<br><span class="dica">não salvo</span>':''}</td></tr>`; }).join('')+'</tbody>';
  const ed=(k,campo,val)=>{ adm.bfEdit[k]=Object.assign(adm.bfEdit[k]||{},{[campo]:val}); };
  $$('[data-bfsel]').forEach(c=>c.onchange=()=>{ c.checked?adm.bfSel.add(c.dataset.bfsel):adm.bfSel.delete(c.dataset.bfsel); $('#bfSelQtd').textContent=adm.bfSel.size; });
  $('#bfTodos').onchange=e=>{ lista.forEach(it=>e.target.checked?adm.bfSel.add(it.mae):adm.bfSel.delete(it.mae)); desenharBf(); };
  $$('[data-bfp]').forEach(i=>i.onchange=()=>{ ed(i.dataset.bfp,'preco',num(i.value)||''); if(num(i.value)>0) ed(i.dataset.bfp,'participa',true); desenharBf(); });
  $$('[data-bfpart]').forEach(i=>i.onchange=()=>{ ed(i.dataset.bfpart,'participa',i.checked); desenharBf(); });
  $$('[data-bflim]').forEach(i=>i.onchange=()=>{ ed(i.dataset.bflim,'limite',i.value); desenharBf(); });
  $$('[data-bfini]').forEach(i=>i.onchange=()=>{ ed(i.dataset.bfini,'inicio',i.value); desenharBf(); });
  $$('[data-bffim]').forEach(i=>i.onchange=()=>{ ed(i.dataset.bffim,'fim',i.value); desenharBf(); });
}
$('#bfBusca').oninput=desenharBf; $('#bfFiltro').onchange=desenharBf;
$('#bfAplicarPct').onclick=()=>{
  const pct=num($('#bfPct').value); if(!(pct>0&&pct<91)){ alert('Informe um desconto entre 1% e 90%.'); return; }
  if(!adm.bfSel.size){ alert('Selecione os produtos na lista.'); return; }
  adm.bf.itens.filter(it=>adm.bfSel.has(it.mae)).forEach(it=>{ const p=Math.floor(it.precoMin*(1-pct/100)*10)/10; adm.bfEdit[it.mae]=Object.assign(adm.bfEdit[it.mae]||{},{participa:true,preco:p}); });
  desenharBf(); toast('Preços calculados. Confira e clique em Salvar produtos.');
};
$('#bfRetirar').onclick=()=>{ if(!adm.bfSel.size){ alert('Selecione os produtos na lista.'); return; } adm.bfSel.forEach(k=>{ adm.bfEdit[k]=Object.assign(adm.bfEdit[k]||{},{participa:false}); }); desenharBf(); };
$('#bfSalvar').onclick=async()=>{
  const ks=Object.keys(adm.bfEdit); if(!ks.length){ toast('Nada para salvar'); return; }
  const itens=ks.map(k=>{ const it=adm.bf.itens.find(x=>x.mae===k), v=valBf(it); return {mae:k, participa:!!v.participa, preco:v.preco===''?'':num(v.preco), limite:v.limite===''?0:num(v.limite), inicio:v.inicio||'', fim:v.fim||''}; });
  const bt=$('#bfSalvar'); bt.disabled=true; $('#bfOk').textContent='Salvando…'; $('#bfErros').innerHTML='';
  try{
    const j=await api(adm.loja,{acao:'bf_salvar',token:tk(),itens});
    const errs=j.erros||[]; const comErro=new Set(errs.map(e=>e.mae));
    ks.forEach(k=>{ if(!comErro.has(k)) delete adm.bfEdit[k]; });
    $('#bfErros').innerHTML=errs.map(e=>esc((e.nome||e.mae)+': '+e.erro)).join('<br>');
    const n=await api(adm.loja,{acao:'bf_listar',token:tk()}); adm.bf=n; desenharBf(); invalidar();
    $('#bfOk').textContent=errs.length?'Salvo, com '+errs.length+' erro(s)':'Salvo ✓ (no site em até 5 minutos)';
  }catch(err){ $('#bfOk').textContent=''; alert(err.message); }
  bt.disabled=false;
};

/* ---------- origem dos clientes ---------- */
async function carregarRelatorio(){
  $('#relCorpo').innerHTML='<p class="adm-cont">Carregando…</p>';
  try{ const j=await api(adm.loja,{acao:'relatorio',token:tk(),dias:Number($('#relDias').value)}); adm.rel=j; desenharRelatorio(); }
  catch(err){ $('#relCorpo').innerHTML='<p class="adm-erro">'+esc(err.message)+'</p>'; }
  comparativo(); linkRastreavel();
}
const pctTxt=(a,b)=>b?(Math.round(a/b*1000)/10).toString().replace('.',',')+'%':'—';
function desenharRelatorio(){
  const r=adm.rel; if(!r) return; const t=r.totais;
  const maxC=Math.max(1,...r.porOrigem.map(o=>o.cadastros));
  const maxS=Math.max(1,...r.porSemana.map(s=>Math.max(s.cadastros,s.acessos)));
  $('#relCorpo').innerHTML=`<div class="adm-resumo">
      <div><b>${t.acessos}</b><small>acessos ao site</small></div><div><b>${t.cadastros}</b><small>cadastros${r.dias?'':' (total)'}</small></div>
      <div><b>${t.pedidos}</b><small>pedidos enviados ao WhatsApp</small></div><div><b>${t.compradores}</b><small>cadastros que compraram no PDV</small></div>
      <div><b>${brl(t.faturamento)}</b><small>vendido para esses clientes</small></div><div><b>${pctTxt(t.compradores,t.cadastros)}</b><small>cadastro → compra</small></div></div>
    <p class="dica" style="margin-bottom:10px">Total de cadastros desde o início: <b>${r.totalCadastros}</b>. "Comprou" = venda concluída no PDV para o mesmo telefone, depois do cadastro. Acessos contam a partir desta versão do site.</p>
    <div class="rolar-x"><table class="tabela"><thead><tr><th>Origem</th><th class="n">Acessos</th><th class="n">Cadastros</th><th></th><th class="n">Pedidos</th><th class="n">Compraram</th><th class="n">Conversão</th><th class="n">Vendido</th></tr></thead><tbody>
      ${r.porOrigem.map(o=>`<tr><td><b>${esc(o.origem)}</b></td><td class="n">${o.acessos}</td><td class="n">${o.cadastros}</td><td style="width:22%"><div class="barrinha" style="width:${Math.round(o.cadastros/maxC*100)}%"></div></td><td class="n">${o.pedidos}</td><td class="n">${o.compradores}</td><td class="n">${pctTxt(o.compradores,o.cadastros)}</td><td class="n">${brl(o.faturamento)}</td></tr>`).join('')||'<tr><td colspan="8" class="adm-cont">Sem dados no período.</td></tr>'}
    </tbody></table></div>
    <h3 style="font-size:15px;margin:18px 0 6px">Por campanha</h3>
    <div class="rolar-x"><table class="tabela"><thead><tr><th>Campanha</th><th>Origem</th><th class="n">Cadastros</th><th class="n">Compraram</th><th class="n">Vendido</th></tr></thead><tbody>
      ${r.porCampanha.map(c=>`<tr><td>${esc(c.campanha)}</td><td>${esc(c.origem)}</td><td class="n">${c.cadastros}</td><td class="n">${c.compradores}</td><td class="n">${brl(c.faturamento)}</td></tr>`).join('')||'<tr><td colspan="5" class="adm-cont">Nenhuma campanha no período.</td></tr>'}
    </tbody></table></div>
    <h3 style="font-size:15px;margin:18px 0 6px">Cadastros por semana</h3>
    <div class="semanas" aria-label="Cadastros por semana">${r.porSemana.map(s=>`<div title="Semana de ${esc(s.semana.split('-').reverse().join('/'))}: ${s.cadastros} cadastro(s), ${s.acessos} acesso(s)"><small>${s.cadastros}</small><i style="height:${Math.max(2,Math.round(s.cadastros/maxS*90))}px"></i><small>${esc(s.semana.slice(8,10)+'/'+s.semana.slice(5,7))}</small></div>`).join('')||'<span class="adm-cont">Sem dados.</span>'}</div>`;
}
async function comparativo(){
  const box=$('#relComp'), outra=LOJAS.find(x=>x!==adm.loja), dias=Number($('#relDias').value);
  if(!sess.get(outra)){ box.innerHTML=`<p class="dica">Para comparar, entre também na ${CONFIG[outra].nome} (cada loja usa o seu usuário do PDV). Os dados continuam separados. <button class="adm-btn sec" type="button" id="relOutra">Entrar na ${CONFIG[outra].nome}</button></p>`; $('#relOutra').onclick=()=>trocarLojaAdm(outra); return; }
  box.innerHTML='<p class="adm-cont">Carregando…</p>';
  try{
    const [a,b]=await Promise.all(LOJAS.map(l=>l===adm.loja&&adm.rel?Promise.resolve(adm.rel):api(l,{acao:'relatorio',token:sess.get(l),dias})));
    const linha=(n,f)=>`<tr><td>${n}</td><td class="n">${f(a)}</td><td class="n">${f(b)}</td></tr>`;
    const top=r=>(r.porOrigem.slice().sort((x,y)=>y.compradores-x.compradores||y.cadastros-x.cadastros)[0]||{}).origem||'—';
    box.innerHTML=`<div class="rolar-x"><table class="tabela"><thead><tr><th></th><th class="n">BRAVUS</th><th class="n">Bravinhos</th></tr></thead><tbody>
      ${linha('Acessos',r=>r.totais.acessos)}${linha('Cadastros',r=>r.totais.cadastros)}${linha('Pedidos pelo WhatsApp',r=>r.totais.pedidos)}${linha('Cadastros que compraram',r=>r.totais.compradores)}
      ${linha('Conversão cadastro → compra',r=>pctTxt(r.totais.compradores,r.totais.cadastros))}${linha('Vendido para esses clientes',r=>brl(r.totais.faturamento))}${linha('Origem que mais converte',top)}</tbody></table></div>`;
  }catch(err){ box.innerHTML='<p class="adm-erro">'+esc(err.message)+'</p>'; }
}
function linkRastreavel(){
  const o=$('#lkOrigem').value, camp=$('#lkCamp').value.trim(), pg=$('#lkPagina').value, q=new URLSearchParams();
  if(o==='instagram'){ q.set('utm_source','instagram'); q.set('utm_medium','social'); }
  else if(o==='ads'){ q.set('utm_source','meta'); q.set('utm_medium','cpc'); }
  else q.set('o',o);
  if(camp) q.set('utm_campaign',slug(camp));
  $('#lkTxt').textContent=CONFIG.site+'?'+q.toString()+'#'+rotaHash(adm.loja,pg).slice(1);
}
['lkOrigem','lkCamp','lkPagina'].forEach(id=>$('#'+id).addEventListener('input',linkRastreavel));
$('#lkCopiar').onclick=()=>copiar($('#lkTxt').textContent);
$('#relDias').onchange=carregarRelatorio; $('#relAtualizar').onclick=carregarRelatorio;

/* ---------- clientes e sacolas ---------- */
function dataBR(ms){ if(!ms) return ''; const d=new Date(ms); return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
function foneBR(t){ const n=String(t||'').replace(/\D/g,'').replace(/^55/,''); return n.length===11?`(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`:n.length===10?`(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`:String(t||''); }
function abandonada(s){ return s.situacao==='Aberta' && s.itens.length>0 && Date.now()-s.data>36e5 && !/Vendido|Sem interesse/.test(s.follow); }
async function carregarClientes(){
  $('#cliLista').innerHTML='<p class="adm-cont">Carregando…</p>'; $('#cliResumo').innerHTML=''; $('#cliCont').textContent='';
  try{ const j=await api(adm.loja,{acao:'clientes',token:tk()}); adm.cli={leads:j.leads||[],sacolas:j.sacolas||[]};
    const os=[...new Set(adm.cli.leads.map(l=>l.origem).filter(Boolean))].sort();
    $('#cliOrigem').innerHTML='<option value="">Todas as origens</option>'+os.map(o=>`<option>${esc(o)}</option>`).join('');
    desenharClientes(); }
  catch(err){ $('#cliLista').innerHTML='<p class="adm-erro">'+esc(err.message)+'</p>'; }
}
function msgFollow(x){
  const c=CONFIG[adm.loja], pn=String(x.nome||'').split(' ')[0];
  if(x.itens && x.itens.length) return `Olá, ${pn}! Aqui é da ${c.nome} 😊 Vi que você separou ${x.itens.length>1?'algumas peças':'uma peça'} na nossa loja online (${x.itens.slice(0,3).map(i=>i.n+' tam. '+i.t).join(', ')}). Ainda tem interesse? Posso confirmar a disponibilidade e te ajudar a finalizar.`;
  return `Olá, ${pn}! Aqui é da ${c.nome} 😊 Obrigado por visitar nossa loja online. Posso te ajudar a encontrar alguma peça?`;
}
function desenharClientes(){
  if(!adm.cli) return;
  const {leads,sacolas}=adm.cli, f=$('#cliFiltro').value, og=$('#cliOrigem').value, t=semAcento($('#cliBusca').value.trim()), td=t.replace(/\D/g,'');
  const ab=sacolas.filter(abandonada), env=sacolas.filter(s=>s.situacao==='Enviada ao WhatsApp'), d30=Date.now()-30*864e5;
  $('#cliResumo').innerHTML=`<div><b>${leads.length}</b><small>cadastros no site</small></div><div><b>${leads.filter(l=>l.cadastro>d30).length}</b><small>novos nos últimos 30 dias</small></div><div><b>${ab.length}</b><small>sacolas abandonadas</small></div><div><b>${brl(ab.reduce((s,x)=>s+x.total,0))}</b><small>em sacolas abandonadas</small></div><div><b>${env.length}</b><small>pedidos enviados ao WhatsApp</small></div>`;
  const tipo=f==='leads'?'lead':'sacola';
  $('#cliOrigem').hidden=tipo!=='lead';
  let lista=(f==='leads'?leads:f==='abandonadas'?ab:f==='enviadas'?env:sacolas).filter(x=>(!t||semAcento(x.nome).includes(t)||(td&&x.telefone.includes(td)))&&(tipo!=='lead'||!og||x.origem===og));
  $('#cliCont').textContent=lista.length+(tipo==='lead'?' cadastro(s)':' sacola(s)')+(f==='abandonadas'?' com produtos há mais de 1 hora, sem pedido enviado':'');
  if(!lista.length){ $('#cliLista').innerHTML='<p class="adm-cont">Nada por aqui ainda.</p>'; return; }
  const opts=v=>['','Contatado','Vendido','Sem interesse'].map(o=>`<option value="${o}"${o===v?' selected':''}>${o||'Follow-up pendente'}</option>`).join('');
  $('#cliLista').innerHTML=lista.slice(0,300).map(x=>{
    const sit=tipo==='sacola'?(abandonada(x)?'<span class="sit sit-ab">abandonada</span>':x.situacao==='Enviada ao WhatsApp'?'<span class="sit sit-en">pedido enviado</span>':`<span class="sit sit-ou">${esc(x.situacao.toLowerCase())}</span>`):(x.ofertas?'<span class="sit sit-en">aceita ofertas</span>':'');
    const meta=tipo==='lead'?`cadastro ${dataBR(x.cadastro)} · ${x.visitas} visita(s) · última ${dataBR(x.ultima)}<br>origem: <b>${esc(x.origem||'—')}</b>${x.campanha?' · campanha '+esc(x.campanha):''}${x.ultOrigem&&x.ultOrigem!==x.origem?' · última: '+esc(x.ultOrigem):''}`:`${dataBR(x.data)} · ${x.pecas} peça(s) · <b>${brl(x.total)}</b>`;
    const zap=x.telefone?`<a href="https://wa.me/${esc(x.telefone)}?text=${encodeURIComponent(msgFollow(tipo==='lead'?{nome:x.nome}:x))}" target="_blank" rel="noopener">Chamar no WhatsApp</a>`:'<span class="cli-meta">sem telefone</span>';
    return `<div class="cli"><div><span class="cli-nome">${esc(x.nome||'Visitante sem cadastro')}</span>${sit}<div class="cli-meta">${esc(foneBR(x.telefone))} · ${meta}</div></div>
      ${tipo==='sacola'?`<div class="cli-itens">${esc(x.itens.map(i=>i.q+'x '+i.n+' ('+i.t+')').join(' · ')||x.resumo)}</div>`:''}
      <div class="adm-acoes">${zap}<select data-cli="${tipo}|${x.linha}|${esc(x.telefone)}" aria-label="Follow-up">${opts(x.follow)}</select></div></div>`;
  }).join('');
  $$('#cliLista select[data-cli]').forEach(s=>s.onchange=async()=>{
    const [tp,linha,tel]=s.dataset.cli.split('|'); s.disabled=true;
    try{ await api(adm.loja,{acao:'cliente_status',token:tk(),tipo:tp,linha:+linha,telefone:tel,follow:s.value});
      const it=(tp==='lead'?adm.cli.leads:adm.cli.sacolas).find(z=>String(z.linha)===linha); if(it) it.follow=s.value; toast('Follow-up salvo'); desenharClientes(); }
    catch(err){ toast(err.message); s.disabled=false; }
  });
}
$('#cliFiltro').onchange=desenharClientes; $('#cliOrigem').onchange=desenharClientes; $('#cliBusca').oninput=desenharClientes; $('#cliAtualizar').onclick=carregarClientes;
$('#cliExportar').onclick=()=>{
  if(!adm.cli) return; const L=$('#cliFiltro').value==='leads';
  const cel=v=>{ v=String(v??''); if(/^[=+\-@]/.test(v)) v="'"+v; return '"'+v.replace(/"/g,'""')+'"'; };
  const linhas=L?[['Nome','Telefone','Cadastro','Última visita','Visitas','Aceita ofertas','Origem','Campanha','Última origem','Follow-up']].concat(adm.cli.leads.map(l=>[l.nome,l.telefone,dataBR(l.cadastro),dataBR(l.ultima),l.visitas,l.ofertas?'Sim':'Não',l.origem,l.campanha,l.ultOrigem,l.follow]))
    :[['Nome','Telefone','Atualizada','Situação','Peças','Total','Itens','Follow-up']].concat(adm.cli.sacolas.map(s=>[s.nome,s.telefone,dataBR(s.data),abandonada(s)?'Abandonada':s.situacao,s.pecas,String(s.total).replace('.',','),s.itens.map(i=>i.q+'x '+i.n+' ('+i.t+')').join(' | '),s.follow]));
  const csv='﻿'+linhas.map(r=>r.map(cel).join(';')).join('\r\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download=(L?'leads-':'sacolas-')+adm.loja+'.csv'; a.click();
};

/* ---------- categorias ---------- */
async function desenharCategoriasAdm(){
  const box=$('#catAdm'); box.innerHTML='<p class="adm-cont">Carregando categorias…</p>';
  await carregar(adm.loja, true);
  const a=ajustesCategorias(adm.loja), maes=estado.maes[adm.loja]||[], cont={};
  maes.forEach(m=>cont[m.deptoOrig]=(cont[m.deptoOrig]||0)+1);
  const padrao=CONFIG[adm.loja].categorias.map(x=>x[0]);
  const pos=d=>{ const i=a.ordem.indexOf(d); if(i>=0) return i; const j=padrao.indexOf(d); return j>=0?100+j:200; };
  adm.cats=Object.keys(cont).sort((x,y)=>pos(x)-pos(y)||cont[y]-cont[x]).map(orig=>({orig, nome:a.nomes[orig]||'', oculta:a.ocultas.includes(orig), n:cont[orig]}));
  desenharCats();
}
function desenharCats(){
  $('#catAdm').innerHTML=adm.cats.map((c,i)=>`<div class="cat-adm"><div class="mv"><button type="button" data-cmv="${i}|-1" aria-label="Subir" ${i?'':'disabled'}>↑</button><button type="button" data-cmv="${i}|1" aria-label="Descer" ${i<adm.cats.length-1?'':'disabled'}>↓</button></div>
    <label style="display:grid;gap:3px;font-size:12px;color:var(--muted)">${esc(c.orig)} · ${c.n} produto(s)<input type="text" data-cnome="${i}" value="${esc(c.nome)}" placeholder="Nome no site: ${esc(c.orig)}"></label>
    <label class="adm-check" style="font-size:13px"><input type="checkbox" data-coc="${i}" ${c.oculta?'checked':''}> Esconder</label><span></span></div>`).join('')||'<p class="adm-cont">Nenhuma categoria com produtos.</p>';
  $$('[data-cmv]').forEach(b=>b.onclick=()=>{ const [i,d]=b.dataset.cmv.split('|').map(Number), j=i+d; [adm.cats[i],adm.cats[j]]=[adm.cats[j],adm.cats[i]]; desenharCats(); });
  $$('[data-cnome]').forEach(inp=>inp.oninput=()=>{ adm.cats[inp.dataset.cnome].nome=inp.value; });
  $$('[data-coc]').forEach(inp=>inp.onchange=()=>{ adm.cats[inp.dataset.coc].oculta=inp.checked; });
}
$('#catSalvar').onclick=async()=>{
  const nomes={}; adm.cats.forEach(c=>{ const n=c.nome.trim(); if(n&&n!==c.orig) nomes[c.orig]=n.slice(0,40); });
  const val=JSON.stringify({ordem:adm.cats.map(c=>c.orig), nomes, ocultas:adm.cats.filter(c=>c.oculta).map(c=>c.orig)});
  if(val.length>4000){ alert('Categorias demais para salvar de uma vez.'); return; }
  $('#catOk').textContent='Salvando…';
  try{ await api(adm.loja,{acao:'config_set',token:tk(),dados:{categorias:val}}); adm.cfg.categorias=val; invalidar(); $('#catOk').textContent='Salvo ✓ (no site em até 5 minutos)'; }
  catch(err){ $('#catOk').textContent=''; alert(err.message); }
};

/* ---------- capa, vídeo, faixa de campanha, avaliações, informações ---------- */
const CHAVES=['capa_titulo','capa_subtitulo','capa_botao','destaques_titulo','campanha_ativa','campanha_tipo','campanha_titulo','campanha_subtitulo','campanha_fim','avaliacao_link','aviso','instagram','horario','video_url','video_formato','bf_ativa','bf_titulo','bf_subtitulo','bf_inicio','bf_fim'];
function preencherCfg(){
  CHAVES.forEach(k=>{ const el=document.getElementById('cfg_'+k); if(!el) return; const v=adm.cfg[k]||'';
    if(el.type==='checkbox') el.checked=sim(v); else if(el.type==='datetime-local') el.value=v?String(v).slice(0,16):''; else el.value=v; });
  if(!adm.cfg.campanha_tipo) $('#cfg_campanha_tipo').value='liquida';
  if(!adm.cfg.video_formato) $('#cfg_video_formato').value='horizontal';
  const f=adm.cfg.capa_foto; $('#admCapaPrev').style.backgroundImage=f?'url("'+linkFoto(f,1200)+'")':''; $('#admCapaPrev').textContent=f?'':'sem foto de capa'; $('#admCapaRm').hidden=!f;
  const v=adm.cfg.video_capa||adm.cfg.video_url, pv=$('#admVideoPrev');
  pv.hidden=!v; if(v){ if(pv.dataset.src!==linkVideo(v)){ pv.dataset.src=linkVideo(v); pv.src=linkVideo(v); } } else { pv.removeAttribute('src'); pv.dataset.src=''; }
  $('#admVideoInfo').textContent=adm.cfg.video_capa?'Vídeo enviado e publicado na capa.':adm.cfg.video_url?'Usando o link de vídeo informado abaixo.':'Sem vídeo: a capa mostra a foto (ou as cores da loja).';
  $('#admVideoRm').hidden=!adm.cfg.video_capa;
  $('#admAvals').innerHTML=adm.aval.map(a=>`<div class="${a.ativo?'':'desat'}"><img src="${esc(linkFoto(a.url,400))}" alt=""><div class="bts"><button type="button" data-tgaval="${esc(a.url)}">${a.ativo?'Desativar':'Ativar'}</button><button type="button" data-delaval="${esc(a.url)}">Remover</button></div></div>`).join('') || '<p class="adm-cont">Nenhum print enviado ainda.</p>';
  $$('[data-delaval]').forEach(b=>b.onclick=async()=>{ if(!confirm('Remover este print de vez?')) return; try{ await api(adm.loja,{acao:'feedback_del',token:tk(),url:b.dataset.delaval}); adm.aval=adm.aval.filter(x=>x.url!==b.dataset.delaval); invalidar(); preencherCfg(); toast('Removido ✓'); }catch(err){ alert(err.message); } });
  $$('[data-tgaval]').forEach(b=>b.onclick=async()=>{ const a=adm.aval.find(x=>x.url===b.dataset.tgaval); b.disabled=true; try{ await api(adm.loja,{acao:'feedback_toggle',token:tk(),url:a.url,ativo:!a.ativo}); a.ativo=!a.ativo; invalidar(); preencherCfg(); toast(a.ativo?'Depoimento ativado ✓':'Depoimento desativado ✓'); }catch(err){ alert(err.message); b.disabled=false; } });
}
$$('[data-salvar]').forEach(b=>b.onclick=async()=>{
  const dados={}; b.dataset.salvar.split(',').forEach(k=>{ const el=document.getElementById('cfg_'+k); dados[k]=el.type==='checkbox'?(el.checked?'sim':'não'):el.value.trim(); });
  if('bf_inicio' in dados && dados.bf_inicio && dados.bf_fim && dados.bf_fim<=dados.bf_inicio){ alert('O fim da Black Friday precisa ser depois do início.'); return; }
  const ok=b.parentElement.querySelector('[data-ok]'); b.disabled=true; ok.textContent='Salvando…';
  try{ await api(adm.loja,{acao:'config_set',token:tk(),dados}); Object.assign(adm.cfg,dados); invalidar(); ok.textContent='Salvo ✓ (no site em até 5 minutos)'; preencherCfg(); if('bf_ativa' in dados){ adm.bf=null; carregarBf(); } }
  catch(err){ ok.textContent=''; alert(err.message); }
  b.disabled=false;
});
$('#admCapaFile').onchange=async e=>{
  const f=e.target.files[0]; if(!f) return; $('#admCapaPrev').textContent='Enviando…';
  try{ const b64=await reduzirFoto(f,1920); const j=await api(adm.loja,{acao:'capa',token:tk(),base64:b64,mime:'image/jpeg'}); adm.cfg.capa_foto=j.foto; invalidar(); preencherCfg(); toast('Capa atualizada ✓'); }
  catch(err){ alert(err.message); preencherCfg(); }
  e.target.value='';
};
$('#admCapaRm').onclick=async()=>{ if(!confirm('Remover a foto de capa?')) return; try{ await api(adm.loja,{acao:'capa_remover',token:tk()}); adm.cfg.capa_foto=''; invalidar(); preencherCfg(); }catch(err){ alert(err.message); } };
$('#admVideoFile').onchange=async e=>{
  const f=e.target.files[0]; e.target.value=''; if(!f) return;
  if(!/^video\/(mp4|webm|quicktime)$/.test(f.type)){ alert('Use um vídeo MP4 (recomendado) ou WebM.'); return; }
  if(f.size>20*1024*1024){ alert('Vídeo grande demais ('+(f.size/1048576).toFixed(1)+' MB). O máximo é 20 MB: use um vídeo de 10 a 20 segundos.'); return; }
  $('#admVideoInfo').textContent='Enviando o vídeo ('+(f.size/1048576).toFixed(1)+' MB)… pode levar até 1 minuto. Não feche esta página.';
  try{
    const b64=await new Promise((ok,erro)=>{ const r=new FileReader(); r.onload=()=>ok(String(r.result).split(',')[1]); r.onerror=()=>erro(new Error('Não consegui ler o vídeo.')); r.readAsDataURL(f); });
    const j=await api(adm.loja,{acao:'video',token:tk(),base64:b64,mime:f.type});
    adm.cfg.video_capa=j.video; invalidar(); preencherCfg(); toast('Vídeo publicado ✓');
  }catch(err){ alert(err.message); preencherCfg(); }
};
$('#admVideoRm').onclick=async()=>{ if(!confirm('Remover o vídeo da capa?')) return; try{ await api(adm.loja,{acao:'video_remover',token:tk()}); adm.cfg.video_capa=''; invalidar(); preencherCfg(); toast('Vídeo removido'); }catch(err){ alert(err.message); } };
$('#admAvalFile').onchange=async e=>{
  const fs=[...e.target.files]; if(!fs.length) return;
  for(const [n,f] of fs.entries()){
    $('#admAvals').insertAdjacentHTML('afterbegin',`<p class="adm-cont" id="envAval">Enviando ${n+1} de ${fs.length}…</p>`);
    try{ const b64=await reduzirFoto(f,1400); const j=await api(adm.loja,{acao:'feedback_add',token:tk(),base64:b64,mime:'image/jpeg'}); adm.aval.push({url:j.foto,ativo:true}); }
    catch(err){ alert(err.message); }
    $('#envAval')?.remove();
  }
  invalidar(); preencherCfg(); toast('Prints enviados ✓'); e.target.value='';
};

rota();
</script>
</body>
</html>
