(() => {
  'use strict';
  let installPrompt=null;
  function loadCss(){const l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';l.crossOrigin='';document.head.appendChild(l)}
  function loadJs(){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.crossOrigin='';s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);setTimeout(()=>reject(new Error('Leaflet timeout')),5000)})}
  window.addEventListener('load',()=>{loadCss();loadJs().then(()=>window.dispatchEvent(new Event('cowork:leaflet-ready'))).catch(()=>{})});

  // PWA install shim: the legacy app handler referenced a block-scoped variable outside its scope.
  // Capturing the install event here keeps installation functional without exposing globals.
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();e.stopImmediatePropagation();installPrompt=e;
    document.getElementById('installBanner')?.classList.add('show');
  },true);
  document.addEventListener('click',async e=>{
    if(e.target?.id==='installAppBtn'){
      e.preventDefault();e.stopImmediatePropagation();
      if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}
      document.getElementById('installBanner')?.classList.remove('show');
    }
    if(e.target?.id==='dismissInstallBtn'){
      e.preventDefault();e.stopImmediatePropagation();document.getElementById('installBanner')?.classList.remove('show');
    }
  },true);
})();
