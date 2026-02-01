// script.js - Loads dummy data, renders plots, handles filters and contact modal

let DATA = null; // will hold fetched JSON data
let currentPlots = [];

// Utility: format currency
function formatCurrency(n){
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

// Fetch data.json and initialize
async function init(){
  try{
    const res = await fetch('data.json');
    DATA = await res.json();
    currentPlots = DATA.plots.slice();
    populateVenturesFilter();
    renderPlots(currentPlots);
    renderVentures(DATA.ventures);
    attachListeners();
  }catch(e){
    console.error('Failed to load data.json', e);
    document.getElementById('results').innerHTML = '<p style="color:#e11">Failed to load data.json</p>'
  }
}

// Populate venture select options
function populateVenturesFilter(){
  const sel = document.getElementById('filterVenture');
  const names = Array.from(new Set(DATA.ventures.map(v=>v.name)));
  names.forEach(n=>{
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = n;
    sel.appendChild(opt);
  });
}

// Render plot cards into #results
function renderPlots(plots){
  const container = document.getElementById('results');
  container.innerHTML = '';
  if(!plots.length){
    container.innerHTML = '<p>No plots match your filters.</p>';
    return;
  }
  plots.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="Plot ${p.id}" />
      <div class="card-body">
        <h3 class="card-title">${p.venture} — ${p.location} <span class="status-pill status-${p.status}">${p.status}</span></h3>
        <div class="card-meta">${p.area_sq_yards} sq yards • ${p.area_acres} acres</div>
        <div class="card-meta">${p.description}</div>
        <div class="card-foot">
          <div class="price">${formatCurrency(p.price)}</div>
          <div>
            <button class="btn" onclick="openContact(${p.id})">Buy / Contact</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render ventures list
function renderVentures(ventures){
  const container = document.getElementById('venturesList');
  container.innerHTML = '';
  ventures.forEach(v=>{
    const el = document.createElement('div');
    el.className = 'venture';
    const statusClass = v.status === 'New' ? 'status-new' : (v.status === 'Ongoing' ? 'status-ongoing' : 'status-upcoming');
    el.innerHTML = `
      <h4>${v.name}</h4>
      <div class="card-meta">${v.location}</div>
      <div class="status ${statusClass}">${v.status}</div>
      <p style="margin-top:8px;color:var(--muted);">${v.description}</p>
    `;
    container.appendChild(el);
  });
}

// Attach UI listeners for filters, tabs, modal
function attachListeners(){
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', clearFilters);
  // ventures tabs
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      filterVentures(btn.dataset.status);
    });
  });
  // modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelContact').addEventListener('click', closeModal);
  document.getElementById('sendContact').addEventListener('click', ()=>{
    alert('Contact request sent (demo). Thank you!');
    closeModal();
  });
}

// Apply filters based on form inputs
function applyFilters(){
  const loc = document.getElementById('filterLocation').value.trim().toLowerCase();
  const venture = document.getElementById('filterVenture').value;
  const areaMin = parseFloat(document.getElementById('filterAreaMin').value) || 0;
  const areaMax = parseFloat(document.getElementById('filterAreaMax').value) || Infinity;
  const priceMin = parseFloat(document.getElementById('filterPriceMin').value) || 0;
  const priceMax = parseFloat(document.getElementById('filterPriceMax').value) || Infinity;

  const filtered = DATA.plots.filter(p=>{
    if(loc && !p.location.toLowerCase().includes(loc) && !p.venture.toLowerCase().includes(loc)) return false;
    if(venture && p.venture !== venture) return false;
    if(p.area_sq_yards < areaMin) return false;
    if(p.area_sq_yards > areaMax) return false;
    if(p.price < priceMin) return false;
    if(p.price > priceMax) return false;
    return true;
  });
  currentPlots = filtered;
  renderPlots(currentPlots);
}

// Clear filters and reset
function clearFilters(){
  document.getElementById('filterForm').reset();
  currentPlots = DATA.plots.slice();
  renderPlots(currentPlots);
}

// Venture filtering for ventures section (simple filter to highlight)
function filterVentures(status){
  const list = document.getElementById('venturesList');
  list.innerHTML = '';
  const filtered = DATA.ventures.filter(v=>v.status === status);
  if(!filtered.length){
    list.innerHTML = '<p>No ventures for this status.</p>';
    return;
  }
  renderVentures(filtered);
}

// Contact modal logic -- find plot by id and populate modal
function openContact(id){
  const plot = DATA.plots.find(p=>p.id === id);
  const modal = document.getElementById('contactModal');
  document.getElementById('modalPlotInfo').textContent = `${plot.venture} — ${plot.location} (${plot.area_sq_yards} sq yards) — ${formatCurrency(plot.price)}`;
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){
  document.getElementById('contactModal').setAttribute('aria-hidden','true');
}

// Kick off init after DOM loaded
window.addEventListener('DOMContentLoaded', init);
