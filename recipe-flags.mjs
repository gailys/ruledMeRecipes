const STORAGE_KEY='keto-recipe-additions-v1';
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function read(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');return {SIDE:value.SIDE||{},CONDIMENTS:value.CONDIMENTS||{},NOT_APPLICABLE:value.NOT_APPLICABLE||{}};}catch{return {SIDE:{},CONDIMENTS:{},NOT_APPLICABLE:{}};}}
const keyFor=recipe=>(recipe.url||recipe.id).replace(/\/$/,'');
export function reviewedRecipeKeys(){const data=read();return new Set([...Object.keys(data.SIDE),...Object.keys(data.CONDIMENTS),...Object.keys(data.NOT_APPLICABLE)]);}
export function recipeFlagButtons(recipe){
  const data=read(),key=keyFor(recipe);
  return '<div class="recipe-flags" aria-label="Pažymėti, ko trūksta recepte">'+[['SIDE','Garnyrai'],['CONDIMENTS','Pagardai'],['NOT_APPLICABLE','Netaikoma']].map(([kind,label])=>'<button type="button" class="ui-button recipe-flag" data-recipe-flag="'+kind+'" data-flag-key="'+escape(key)+'" data-flag-id="'+escape(recipe.id)+'" data-flag-url="'+escape(recipe.url)+'" data-flag-title="'+escape(recipe.title)+'" aria-pressed="'+Boolean(data[kind][key])+'" title="Palaikykite 1 sekundę: pažymėti arba atžymėti, kad receptui trūksta '+(kind==='SIDE'?'garnyro':kind==='CONDIMENTS'?'pagardo':'nei garnyro, nei pagardo')+'">'+(data[kind][key]?'✓ ':kind==='NOT_APPLICABLE'?'- ':'+ ')+label+'</button>').join('')+'</div>';
}
export function initializeRecipeFlags(showToast){
  let hold;
  function cancel(){if(!hold)return;clearTimeout(hold.timer);hold.button.classList.remove('holding');hold=undefined;}
  function refresh(){const data=read();document.querySelectorAll('[data-recipe-flag]').forEach(button=>{const active=Boolean(data[button.dataset.recipeFlag][button.dataset.flagKey]);button.setAttribute('aria-pressed',String(active));button.textContent=(active?'✓ ':button.dataset.recipeFlag==='NOT_APPLICABLE'?'- ':'+ ')+(button.dataset.recipeFlag==='SIDE'?'Garnyrai':button.dataset.recipeFlag==='CONDIMENTS'?'Pagardai':'Netaikoma');});}
  function start(button,event){
    if(hold||button.disabled)return;
    const state={button,x:event.clientX,y:event.clientY,pointerId:event.pointerId};hold=state;
    button.classList.add('holding');
    state.timer=setTimeout(()=>{
      if(!button.isConnected){cancel();return;}
      const data=read(),kind=button.dataset.recipeFlag,key=button.dataset.flagKey,active=Boolean(data[kind][key]);
      if(!active){if(kind==='NOT_APPLICABLE'){delete data.SIDE[key];delete data.CONDIMENTS[key];}else delete data.NOT_APPLICABLE[key];}
      if(active)delete data[kind][key];else data[kind][key]={id:button.dataset.flagId,title:button.dataset.flagTitle,url:button.dataset.flagUrl,markedAt:new Date().toISOString()};
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));refresh();document.dispatchEvent(new Event('recipe-flags-changed'));showToast(active?'Žyma pašalinta':kind==='SIDE'?'Pažymėta: receptui trūksta garnyro':kind==='CONDIMENTS'?'Pažymėta: receptui trūksta pagardo':'Pažymėta: garnyrai ir pagardai netaikomi');}catch{showToast('Nepavyko išsaugoti recepto žymos.');}
      cancel();
    },1000);
  }
  document.addEventListener('pointerdown',event=>{const button=event.target.closest('[data-recipe-flag]');if(button&&event.isPrimary!==false&&event.button===0){button.setPointerCapture?.(event.pointerId);start(button,event);}});
  document.addEventListener('pointermove',event=>{if(hold&&hold.pointerId===event.pointerId&&Math.hypot(event.clientX-hold.x,event.clientY-hold.y)>15)cancel();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(name,cancel);
  document.addEventListener('keydown',event=>{const button=event.target.closest('[data-recipe-flag]');if(button&&[' ','Enter'].includes(event.key)){event.preventDefault();if(!event.repeat)start(button,event);}});
  document.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key))cancel();});
  document.addEventListener('focusout',event=>{if(event.target===hold?.button)cancel();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});window.addEventListener('blur',cancel);window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY)refresh();});
  document.querySelector('#export-recipe-flags').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(read(),null,2)+'\n'],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='receptu-garnyrai-ir-pagardai.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
}
