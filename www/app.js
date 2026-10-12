const KEY='smartsense-data-v1';
const today=()=>new Date().toISOString().slice(0,10);
const seedProducts=[
{id:'sku-1001',name:'Premium Rice · 2kg',sku:'GRC-001',cost:180,price:250,stock:24,min:8,sold:0,emoji:'▦'},
{id:'sku-1002',name:'Cooking Oil · 1L',sku:'OIL-002',cost:210,price:280,stock:6,min:8,sold:0,emoji:'◉'},
{id:'sku-1003',name:'Laundry Soap',sku:'HOM-003',cost:75,price:110,stock:18,min:5,sold:0,emoji:'✦'},
{id:'sku-1004',name:'Maize Flour · 2kg',sku:'GRC-004',cost:130,price:180,stock:31,min:10,sold:0,emoji:'▤'},
{id:'sku-1005',name:'Tea Leaves · 500g',sku:'BEV-005',cost:160,price:220,stock:4,min:7,sold:0,emoji:'◌'},
{id:'sku-1006',name:'Wheat Flour · 2kg',sku:'GRC-006',cost:145,price:195,stock:15,min:6,sold:0,emoji:'▥'},
{id:'sku-1007',name:'Dishwashing Liquid',sku:'HOM-007',cost:95,price:145,stock:9,min:5,sold:0,emoji:'◍'}
];
function freshState(){return {products:seedProducts.map(function(p){return Object.assign({},p)}),sales:[{id:'sale-1',productId:'sku-1001',productName:'Premium Rice · 2kg',qty:2,total:500,cost:360,date:today()},{id:'sale-2',productId:'sku-1003',productName:'Laundry Soap',qty:3,total:330,cost:225,date:today()},{id:'sale-3',productId:'sku-1006',productName:'Wheat Flour · 2kg',qty:1,total:195,cost:145,date:today()}]};}
let state;
try{state=JSON.parse(localStorage.getItem(KEY))||freshState();}catch(e){state=freshState();}
if(!state.products||!state.sales)state=freshState();
const $=function(id){return document.getElementById(id)};
const money=function(n){return 'KSh '+Math.round(Number(n)||0).toLocaleString('en-KE')};
const num=function(n){return Number(n)||0};
const esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
const margin=function(p){return p.price>0?(p.price-p.cost)/p.price*100:0};
const profit=function(p){return p.price-p.cost};
const isLow=function(p){return p.stock<=p.min};
const stockValue=function(){return state.products.reduce(function(a,p){return a+p.stock*p.cost},0)};
const potentialMargin=function(){return state.products.reduce(function(a,p){return a+p.stock*(p.price-p.cost)},0)};
const totalSales=function(){return state.sales.reduce(function(a,s){return a+s.total},0)};
const todaySales=function(){return state.sales.filter(function(s){return s.date===today()})};
const todayRevenue=function(){return todaySales().reduce(function(a,s){return a+s.total},0)};
const todayProfit=function(){return todaySales().reduce(function(a,s){return a+s.total-s.cost},0)};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){showToast('Could not save in this browser. Check storage settings.');}}
let toastTimer;
function showToast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){$('toast').classList.remove('show')},2600);}
function statusMarkup(p){if(p.stock===0)return '<span class="status critical">Out of stock</span>';return isLow(p)?'<span class="status low">Low stock</span>':'<span class="status healthy">Healthy</span>';}
function productCell(p){return '<div class="product-cell"><span class="product-symbol">'+esc(p.emoji||'▦')+'</span><span class="product-name"><strong>'+esc(p.name)+'</strong><small>'+esc(p.sku)+'</small></span></div>';}
function stockCell(p){const pct=Math.max(0,Math.min(100,p.min>0?p.stock/Math.max(p.min*2,p.stock,1)*100:100));return '<div class="stock-cell"><span class="stock-qty">'+p.stock+' units</span><div class="stock-track"><span class="'+(isLow(p)?'low':'')+'" style="width:'+pct+'%"></span></div></div>';}
function renderOverview(){
 const low=state.products.filter(isLow).sort(function(a,b){return a.stock-b.stock});
 $('metricValue').textContent=money(stockValue());
 $('metricSku').textContent='Across '+state.products.length+' products';
 $('metricMargin').textContent=money(potentialMargin());
 $('metricLow').innerHTML=low.length+' <small>items</small>';
 $('lowFoot').textContent=low.length?low.length+' need a stock review':'Stock levels look healthy';
 $('metricSales').textContent=money(todayRevenue());
 $('metricSalesFoot').textContent=todaySales().length+' transactions recorded today';
 $('navStockCount').textContent=low.length;
 const health=prefs&&prefs.alerts===false?[]:low.slice(0,4);
 if(prefs&&prefs.alerts===false){$('stockHealth').innerHTML='<div class="empty-state">Low-stock alerts are turned off in Settings.</div>';}
 else if(!health.length){$('stockHealth').innerHTML='<div class="empty-state">All products are above their minimum stock threshold. Keep monitoring movement.</div>';}
 else $('stockHealth').innerHTML=health.map(function(p){return '<div class="health-row"><span class="product-symbol">'+esc(p.emoji||'▦')+'</span><div class="health-copy"><strong>'+esc(p.name)+'</strong><small>'+esc(p.sku)+' · reorder point '+p.min+'</small></div><div class="health-level"><div class="level-text"><span>On hand</span><b>'+p.stock+'</b></div><div class="level-track"><div class="level-fill low" style="width:'+Math.min(100,p.stock/Math.max(1,p.min)*100)+'%"></div></div></div>'+statusMarkup(p)+'</div>';}).join('');
 const rec=$('recommendation');
 if(low.length){const p=low[0];const qty=Math.max(0,p.min*2-p.stock);rec.innerHTML='<span class="rec-tag">RESTOCK PRIORITY</span><h3>'+esc(p.name)+' is running low</h3><p>You have '+p.stock+' units left against a minimum of '+p.min+'. Consider reviewing demand and supplier lead time before the shelf runs empty.</p><div class="rec-metric"><span>Suggested review quantity</span><strong>'+qty+' units</strong></div><div class="rec-metric"><span>Estimated purchase cost</span><strong>'+money(qty*p.cost)+'</strong></div>';}
 else {const best=state.products.slice().sort(function(a,b){return profit(b)-profit(a)})[0];rec.innerHTML='<span class="rec-tag">MARGIN OPPORTUNITY</span><h3>Your stock levels look steady</h3><p>Review your highest-margin products and track how quickly they sell. Strong unit margin alone does not guarantee demand.</p><div class="rec-metric"><span>Top unit margin</span><strong>'+(best?money(profit(best)):'—')+'</strong></div><div class="rec-metric"><span>Product</span><strong>'+(best?esc(best.name):'Add a product')+'</strong></div>';}
 const rows=state.products.slice().sort(function(a,b){return a.stock-b.stock}).slice(0,6);
 $('overviewProducts').innerHTML=rows.map(function(p){return '<tr><td>'+productCell(p)+'</td><td>'+stockCell(p)+'</td><td class="td-strong">'+money(p.cost)+'</td><td class="td-strong">'+money(p.price)+'</td><td class="margin-positive">'+Math.round(margin(p))+'%</td><td>'+statusMarkup(p)+'</td></tr>';}).join('')||'<tr><td colspan="6" class="empty-state">No products yet. Add your first product to get started.</td></tr>';
 $('tableSummary').textContent='Showing '+rows.length+' of '+state.products.length+' products';
}
function renderInventory(){
 const search=($('productSearch').value||'').trim().toLowerCase(),filter=$('stockFilter').value;
 const list=state.products.filter(function(p){const matches=(p.name+' '+p.sku).toLowerCase().includes(search);const fm=filter==='all'||(filter==='low'&&isLow(p))||(filter==='healthy'&&!isLow(p));return matches&&fm;}).sort(function(a,b){return a.name.localeCompare(b.name)});
 const low=state.products.filter(isLow).length;
 $('inventorySummary').innerHTML='<div class="summary-card"><span>PRODUCTS TRACKED</span><strong>'+state.products.length+'</strong><small>Unique items in catalogue</small></div><div class="summary-card"><span>STOCK AT COST</span><strong>'+money(stockValue())+'</strong><small>Estimated value of stock on hand</small></div><div class="summary-card"><span>NEEDS ATTENTION</span><strong style="color:'+(low?'#a66b10':'#16845c')+'">'+low+'</strong><small>'+(low?'At or below minimum threshold':'No low-stock alerts')+'</small></div>';
 $('inventoryRows').innerHTML=list.map(function(p){return '<tr><td>'+productCell(p)+'</td><td>'+esc(p.sku)+'</td><td>'+stockCell(p)+'</td><td class="td-strong">'+money(p.cost)+'</td><td class="td-strong">'+money(p.price)+'</td><td class="margin-positive">'+money(profit(p))+' <small style="color:#8a99aa">('+Math.round(margin(p))+'%)</small></td><td>'+statusMarkup(p)+'</td><td><div class="row-actions"><button class="row-action" data-restock="'+esc(p.id)+'">+ Stock</button></div></td></tr>';}).join('')||'<tr><td colspan="8" class="empty-state">No matching products. Try another search or add a product.</td></tr>';
 $('inventoryCount').textContent='Showing '+list.length+' of '+state.products.length+' products';
 document.querySelectorAll('[data-restock]').forEach(function(b){b.addEventListener('click',function(){restock(b.getAttribute('data-restock'));});});
}
function renderSales(){
 const tx=todaySales(),revenue=tx.reduce(function(a,s){return a+s.total},0),cogs=tx.reduce(function(a,s){return a+s.cost},0),gross=revenue-cogs;
 $('salesMetrics').innerHTML='<div class="summary-card"><span>SALES TODAY</span><strong>'+money(revenue)+'</strong><small>'+tx.length+' transactions</small></div><div class="summary-card"><span>EST. GROSS PROFIT TODAY</span><strong style="color:#16845c">'+money(gross)+'</strong><small>Revenue less recorded product cost</small></div><div class="summary-card"><span>UNITS SOLD TODAY</span><strong>'+tx.reduce(function(a,s){return a+s.qty},0)+'</strong><small>Across '+new Set(tx.map(function(s){return s.productId})).size+' products</small></div>';
 $('salesRows').innerHTML=state.sales.slice().sort(function(a,b){return b.date.localeCompare(a.date)}).map(function(s){return '<tr><td><div class="product-name"><strong>'+esc(s.productName)+'</strong><small>Sale '+esc(s.id.slice(-6).toUpperCase())+'</small></div></td><td>'+esc(s.date)+'</td><td>'+s.qty+' units</td><td class="td-strong">'+money(s.total)+'</td><td class="margin-positive">'+money(s.total-s.cost)+'</td></tr>';}).join('')||'<tr><td colspan="5" class="empty-state">No sales recorded yet.</td></tr>';
}
function renderInsights(){
 const low=state.products.filter(isLow).sort(function(a,b){return a.stock-b.stock});
 const top=state.products.slice().sort(function(a,b){return profit(b)-profit(a)}).slice(0,3);
 const list=[];
 if(low.length){list.push({icon:'!',title:low.length+' product'+(low.length===1?'':'s')+' at restock risk',body:low.slice(0,3).map(function(p){return p.name+' ('+p.stock+' left)'}).join(', ')+'. Check supplier lead times and recent demand.'});}
 else list.push({icon:'✓',title:'Stock is above minimum levels',body:'No items are currently at or below their set threshold. Review these thresholds as demand changes.'});
 if(top[0])list.push({icon:'↗',title:'Highest unit gross profit: '+top[0].name,body:'Current selling price minus recorded unit cost is '+money(profit(top[0]))+'. Check sales volume before increasing purchase quantities.'});
 const slow=state.products.filter(function(p){return p.sold===0});
 list.push({icon:'◷',title:slow.length+' product'+(slow.length===1?'':'s')+' without recorded sales',body:slow.length?slow.slice(0,3).map(function(p){return p.name}).join(', ')+'. This means no sales are recorded in this demo, not necessarily that real-world demand is zero.':'Every product has at least one recorded sale.'});
 $('insightList').innerHTML=list.map(function(x){return '<div class="insight-item"><span class="insight-bullet">'+esc(x.icon)+'</span><div><strong>'+esc(x.title)+'</strong><p>'+esc(x.body)+'</p></div></div>';}).join('');
 $('marginOpportunities').innerHTML=top.map(function(p){return '<div class="opportunity"><strong>'+esc(p.name)+'</strong><span>'+money(p.price)+' sell · '+money(p.cost)+' cost</span><b>'+money(profit(p))+'<small style="font:500 9px DM Sans;color:#8b99aa"> / unit</small></b></div>';}).join('')||'<div class="empty-state">Add products to see margin opportunities.</div>';
 updatePlanner();
}
function updatePlanner(){
 const cash=num($('cashInput').value),bills=num($('billsInput').value),expenses=num($('expensesInput').value),purchase=num($('purchaseInput').value);
 const before=cash-bills-expenses,after=before-purchase;
 $('cashBefore').textContent=money(before);$('cashAfter').textContent=(after<0?'−':'')+money(Math.abs(after));$('cashAfter').classList.toggle('negative',after<0);$('plannerStatus').textContent=after<0?'SHORTFALL '+money(Math.abs(after)):'PURCHASE FITS THIS CASH PLAN';
 $('plannerStatus').style.color=after<0?'#c44848':'#16845c';$('plannerStatus').style.background=after<0?'#fff0ef':'#e5f6ee';
}
function renderAll(){renderOverview();renderInventory();renderSales();renderInsights();save();}
function openProduct(){ $('productForm').reset();$('pMin').value='5';$('modalBackdrop').classList.add('open');$('modalBackdrop').setAttribute('aria-hidden','false');setTimeout(function(){$('pName').focus()},80);}
function closeProduct(){$('modalBackdrop').classList.remove('open');$('modalBackdrop').setAttribute('aria-hidden','true');}
function addProduct(e){
 e.preventDefault();const name=$('pName').value.trim(),sku=$('pSku').value.trim()||('SKU-'+String(Date.now()).slice(-6)),cost=num($('pCost').value),price=num($('pPrice').value),stock=num($('pQty').value),min=num($('pMin').value);
 if(!name||cost<=0||price<=0||stock<0||min<0){showToast('Check the product details and try again.');return;}
 if(state.products.some(function(p){return p.sku.toLowerCase()===sku.toLowerCase()})){showToast('That SKU already exists. Use a unique product code.');return;}
 state.products.push({id:'p-'+Date.now(),name:name,sku:sku,cost:cost,price:price,stock:Math.floor(stock),min:Math.floor(min),sold:0,emoji:['▦','◉','✦','▤','◌'][state.products.length%5]});
 closeProduct();renderAll();showToast(name+' added to your inventory.');
}
function openSale(){
 if(!state.products.length){showToast('Add a product before recording a sale.');return;}
 $('saleProduct').innerHTML=state.products.map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.name)+' — '+p.stock+' in stock</option>';}).join('');
 $('saleQty').value='1';updateSalePreview();$('saleBackdrop').classList.add('open');$('saleBackdrop').setAttribute('aria-hidden','false');
}
function closeSale(){$('saleBackdrop').classList.remove('open');$('saleBackdrop').setAttribute('aria-hidden','true');}
function updateSalePreview(){const p=state.products.find(function(x){return x.id===$('saleProduct').value});const q=Math.floor(num($('saleQty').value));if(!p){$('salePreview').textContent='No product selected.';return;}$('salePreview').innerHTML='Unit price: <strong>'+money(p.price)+'</strong><br>Sale total: <strong>'+money(p.price*q)+'</strong><br>Available stock: <strong>'+p.stock+' units</strong>'+(q>p.stock?'<br><span style="color:#c44848">Not enough stock for this quantity.</span>':'');}
function recordSale(e){e.preventDefault();const p=state.products.find(function(x){return x.id===$('saleProduct').value}),qty=Math.floor(num($('saleQty').value));if(!p||qty<1){showToast('Enter a valid sale quantity.');return;}if(qty>p.stock){showToast('Not enough stock. Only '+p.stock+' units available.');return;}if(prefs.confirmSales&&!window.confirm('Record '+qty+' × '+p.name+' for '+money(p.price*qty)+'? Stock will be reduced immediately.'))return;const sale={id:'sale-'+Date.now(),productId:p.id,productName:p.name,qty:qty,total:p.price*qty,cost:p.cost*qty,date:today()};p.stock-=qty;p.sold=(p.sold||0)+qty;state.sales.unshift(sale);closeSale();renderAll();showToast('Sale recorded. Stock and sales totals updated.');}
function restock(id){const p=state.products.find(function(x){return x.id===id});if(!p)return;const raw=window.prompt('How many units of '+p.name+' are you adding?',String(Math.max(1,p.min*2-p.stock)));if(raw===null)return;const qty=Number(raw);if(!Number.isInteger(qty)||qty<1){showToast('Enter a whole number greater than zero.');return;}p.stock+=qty;renderAll();showToast(qty+' units added to '+p.name+'.');}
function exportCSV(){const rows=[['Product','SKU','Quantity on hand','Unit cost KSh','Selling price KSh','Unit gross profit KSh','Margin percent','Minimum stock','Status']].concat(state.products.map(function(p){return [p.name,p.sku,p.stock,p.cost,p.price,profit(p),Math.round(margin(p)),p.min,isLow(p)?'Low stock':'Healthy']}));const csv=rows.map(function(row){return row.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='smartsense-inventory.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast('Inventory CSV exported.');}
function setView(name){document.querySelectorAll('.view').forEach(function(v){v.classList.toggle('active',v.id==='view-'+name)});document.querySelectorAll('.nav-item').forEach(function(b){b.classList.toggle('active',b.dataset.view===name)});const names={overview:'Overview',inventory:'Inventory',sales:'Sales & movement',insights:'Smart insights',settings:'Settings',about:'About SmartSense',help:'Help & getting started',privacy:'Privacy Policy',terms:'Terms & Conditions'};$('crumbTitle').textContent=names[name]||'Overview';$('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.view)})});
document.querySelectorAll('[data-goto]').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.goto)})});
$('topAddBtn').addEventListener('click',openProduct);$('inventoryAddBtn').addEventListener('click',openProduct);$('productForm').addEventListener('submit',addProduct);$('modalClose').addEventListener('click',closeProduct);$('modalCancel').addEventListener('click',closeProduct);
$('overviewRecordSale').addEventListener('click',openSale);$('salesRecordBtn').addEventListener('click',openSale);$('saleClose').addEventListener('click',closeSale);$('saleCancel').addEventListener('click',closeSale);$('saleForm').addEventListener('submit',recordSale);$('saleProduct').addEventListener('change',updateSalePreview);$('saleQty').addEventListener('input',updateSalePreview);
$('productSearch').addEventListener('input',renderInventory);$('stockFilter').addEventListener('change',renderInventory);$('exportBtn').addEventListener('click',exportCSV);$('inventoryExport').addEventListener('click',exportCSV);
['cashInput','billsInput','expensesInput','purchaseInput'].forEach(function(id){$(id).addEventListener('input',updatePlanner)});
$('mobileMenu').addEventListener('click',function(){$('sidebar').classList.toggle('open')});
$('modalBackdrop').addEventListener('click',function(e){if(e.target===$('modalBackdrop'))closeProduct()});$('saleBackdrop').addEventListener('click',function(e){if(e.target===$('saleBackdrop'))closeSale()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeProduct();closeSale();$('sidebar').classList.remove('open')}});
const PREF_KEY='smartsense-preferences-v1';
let prefs={alerts:true,confirmSales:true,showDemo:true,businessName:'Sample Business',businessCategory:'Retail & general trade',businessOwner:''};
try{prefs=Object.assign(prefs,JSON.parse(localStorage.getItem(PREF_KEY))||{});}catch(e){}
function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs));}catch(e){}}
function applyPrefs(){if($('businessName'))$('businessName').value=prefs.businessName||'Sample Business';if($('businessCategory'))$('businessCategory').value=prefs.businessCategory||'Retail & general trade';if($('businessOwner'))$('businessOwner').value=prefs.businessOwner||'';if($('prefAlerts'))$('prefAlerts').checked=prefs.alerts!==false;if($('prefConfirm'))$('prefConfirm').checked=prefs.confirmSales!==false;if($('prefDemo'))$('prefDemo').checked=prefs.showDemo!==false;const profile=$('.profile-row strong');if(profile)profile.textContent=prefs.businessName||'Sample Business';const initials=(prefs.businessName||'SB').trim().split(/\\s+/).slice(0,2).map(function(s){return s[0]||''}).join('').toUpperCase();if($('.avatar'))$('.avatar').textContent=initials||'SB';if(!prefs.alerts){$('stockHealth').innerHTML='<div class="empty-state">Low-stock alerts are turned off in Settings.</div>';}}
$('settingsForm').addEventListener('submit',function(e){e.preventDefault();prefs.businessName=$('businessName').value.trim()||'My Business';prefs.businessCategory=$('businessCategory').value;prefs.businessOwner=$('businessOwner').value.trim();savePrefs();applyPrefs();showToast('Workspace preferences saved on this device.');});
$('prefAlerts').addEventListener('change',function(){prefs.alerts=$('prefAlerts').checked;savePrefs();renderOverview();showToast(prefs.alerts?'Low-stock alerts enabled.':'Low-stock alerts hidden on the overview.');});
$('prefConfirm').addEventListener('change',function(){prefs.confirmSales=$('prefConfirm').checked;savePrefs();showToast('Sale confirmation preference updated.');});
$('prefDemo').addEventListener('change',function(){prefs.showDemo=$('prefDemo').checked;savePrefs();if(!prefs.showDemo&&state.products.some(function(p){return /^sku-100[1-7]$/.test(p.id)})){if(window.confirm('Remove the sample products and sample transactions from this browser? Your own products will be kept.')){const sampleIds=state.products.filter(function(p){return /^sku-100[1-7]$/.test(p.id)}).map(function(p){return p.id});state.products=state.products.filter(function(p){return sampleIds.indexOf(p.id)<0});state.sales=state.sales.filter(function(s){return sampleIds.indexOf(s.productId)<0});renderAll();showToast('Sample records removed. Your own records were kept.');}else{prefs.showDemo=true;$('prefDemo').checked=true;savePrefs();}}});
$('settingsExport').addEventListener('click',exportCSV);
$('resetDemo').addEventListener('click',function(){if(!window.confirm('Reset this browser workspace to the original SmartSense sample data? This replaces current local records. Export your catalogue first if you need it.'))return;state=freshState();prefs={alerts:true,confirmSales:true,showDemo:true,businessName:'Sample Business',businessCategory:'Retail & general trade',businessOwner:''};savePrefs();save();applyPrefs();renderAll();showToast('Demo workspace reset.');});
document.querySelectorAll('[data-view]').forEach(function(b){if(!b.dataset.boundView){b.dataset.boundView='1';b.addEventListener('click',function(){setView(b.dataset.view);});}});
const dateLabel=new Date().toLocaleDateString('en-KE',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();document.querySelector('.eyebrow').textContent=dateLabel+' · YOUR BUSINESS AT A GLANCE';
applyPrefs();
renderAll();