// Shared scripts for the judges pages: diagram, score chart and map.
(function(){
  if (window.mermaid) {
    mermaid.initialize({startOnLoad:true, theme:'base', themeVariables:{fontSize:'20px', fontFamily:'Source Serif 4, Georgia, serif', primaryColor:'#fbf9f3', primaryBorderColor:'#1f4e6b', primaryTextColor:'#12304a', lineColor:'#1f4e6b'}, flowchart:{htmlLabels:true, curve:'basis', useMaxWidth:true}});
  }
  // Score chart
  var c = window.JUDGE_CHART, el = document.getElementById('scoreChart');
  if (c && el && window.Chart) {
    Chart.defaults.font.family = "'Source Serif 4', Georgia, serif"; Chart.defaults.font.size = 16; Chart.defaults.color = '#2a261e';
    new Chart(el, {type:'bar', data:{labels:c.labels, datasets:[
      {label:'This judge', data:c.judge, backgroundColor:'#1d6b57'},
      {label:c.peerLabel, data:c.peers, backgroundColor:'#1f4e6b'},
      {label:'JPEC minimum (3.6)', data:c.labels.map(function(){return c.min;}), backgroundColor:'#c7bda3'}]},
      options:{indexAxis:'y', maintainAspectRatio:false, scales:{x:{min:1, max:5, ticks:{stepSize:0.5}}}, plugins:{legend:{position:'bottom'}, tooltip:{callbacks:{label:function(x){return ' '+x.dataset.label+': '+x.parsed.x;}}}}}});
  }
  // Map
  function draw(){
    var g = window.JUDGE_GEO, box = document.getElementById('judgeMap');
    if (!g || !box) return true;
    if (!(window.L && typeof UTAH_GEO !== 'undefined')) return false;
    var m = L.map('judgeMap', {scrollWheelZoom:false, zoomSnap:0.25});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors', maxZoom:18}).addTo(m);
    var cl = L.geoJSON(UTAH_GEO.counties, {filter:function(f){return g.statewide || g.counties.indexOf(f.properties.n) > -1;}, style:{color:'#12304a', weight:2.5, fillColor:'#1d6b57', fillOpacity:g.cities.length ? 0.08 : 0.22}}).addTo(m);
    cl.eachLayer(function(l){ l.bindTooltip(l.feature.properties.n + ' County', {sticky:true}); });
    var ct = null;
    if (g.cities.length) {
      ct = L.geoJSON(UTAH_GEO.cities, {filter:function(f){return g.cities.indexOf(f.properties.n) > -1;}, style:{color:'#a5301e', weight:3, fillColor:'#d9a441', fillOpacity:0.45}}).addTo(m);
      ct.eachLayer(function(l){ l.bindTooltip(l.feature.properties.n, {sticky:true}); });
    }
    if (typeof addUtahOutlines === 'function') addUtahOutlines(m, {alwaysLabel:g.cities, cityLabelZoom:11});
    var b = (ct && ct.getLayers().length) ? ct.getBounds() : cl.getBounds();
    m.fitBounds(b, {padding:[18,18], maxZoom: g.cities.length ? 12 : 9});
    return true;
  }
  function fail(){
    var box = document.getElementById('judgeMap');
    if (box && !box.querySelector('.leaflet-pane')) {
      box.style.display='flex'; box.style.alignItems='center'; box.style.justifyContent='center'; box.style.padding='24px'; box.style.textAlign='center';
      box.innerHTML = '<p style="max-width:460px;margin:0;">The map could not load in this view. It loads on the live page.</p>';
    }
  }
  function load(src){ return new Promise(function(ok,bad){ var s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=bad; document.head.appendChild(s); }); }
  if (!draw()) {
    var need = [];
    if (typeof UTAH_GEO === 'undefined') need.push(load('https://cdn.jsdelivr.net/gh/Weber-County-Hive/utah-maps@main/utah-geo.js'));
    Promise.all(need).then(function(){ if(!draw()) fail(); }).catch(fail);
  }
})();
