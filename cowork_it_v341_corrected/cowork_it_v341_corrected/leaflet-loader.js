(() => {
  function loadCss(){const l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';l.crossOrigin='';document.head.appendChild(l)}
  function loadJs(){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.crossOrigin='';s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);setTimeout(()=>reject(new Error('Leaflet timeout')),5000)})}
  window.addEventListener('load',()=>{loadCss();loadJs().then(()=>window.dispatchEvent(new Event('cowork:leaflet-ready'))).catch(()=>{})});
})();
