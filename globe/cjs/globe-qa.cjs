const {chromium}=require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;window.contextTypes=[];HTMLCanvasElement.prototype.getContext=function(type,...args){window.contextTypes.push(type);if(/webgl|webgpu/i.test(type))throw new Error('GPU rendering forbidden');return old.call(this,type,...args);};});
 await page.goto('file:///content/drive/MyDrive/work/dist/index.html');
 await page.waitForFunction(()=>window.globeDiagnostics?.renderCount>0,{timeout:30000});
 await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);
 console.log('INITIAL',JSON.stringify(await page.evaluate(()=>({diagnostics:globeDiagnostics,contexts:contextTypes,coordinates:document.getElementById('coordinates').textContent}))));
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>globeDiagnostics.renderer),'CPU / Canvas 2D');
 const shades=await page.evaluate(()=>{const c=document.getElementById('earth'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let day=0,night=0;for(let i=0;i<d.length;i+=4){if(d[i]===35&&d[i+1]===81&&d[i+2]===108)day++;if(d[i]===27&&d[i+1]===63&&d[i+2]===84)night++;}return{day,night};});assert(shades.day>1000&&shades.night>1000,'Uniform day and lightly shaded night oceans');console.log('SHADING',JSON.stringify(shades));
 await page.screenshot({path:'/tmp/globe-desktop.png'});
 const box=await page.locator('#scene').boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
 const before=await page.evaluate(()=>({q:globeDiagnostics.q,axis:document.getElementById('axis-back').outerHTML,count:globeDiagnostics.renderCount}));
 await page.mouse.move(cx,cy);await page.mouse.down();
 const latencies=[];
 for(let i=1;i<=30;i++){await page.mouse.move(cx+i*5,cy+Math.sin(i/7)*60);latencies.push(await page.evaluate(()=>({ms:globeDiagnostics.lastRenderMs,rtt:globeDiagnostics.lastRoundtripMs,count:globeDiagnostics.renderCount})));}
 await page.mouse.up();await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);
 const after=await page.evaluate(()=>({q:globeDiagnostics.q,axis:document.getElementById('axis-back').outerHTML,count:globeDiagnostics.renderCount,diagnostics:globeDiagnostics}));
 assert.notDeepEqual(before.q,after.q);assert.notEqual(before.axis,after.axis);assert(after.count>before.count+5,'Expected continuous frames while dragging');
 const axis=await page.evaluate(()=>{const [x,y,z,w]=globeDiagnostics.currentFrame.q,zoom=globeDiagnostics.zoom,ax=2*(x*y-z*w),ay=1-2*(x*x+z*z),e=document.getElementById('axis-back');return{actual:[+e.getAttribute('x1'),+e.getAttribute('y1')],expected:[500+ax*390*zoom*1.17,500-ay*390*zoom*1.17]};});assert(Math.hypot(...axis.actual.map((v,i)=>v-axis.expected[i]))<.001,'Axis must share the globe orientation');
 console.log('DRAG',JSON.stringify({frames:after.count-before.count,samples:latencies.filter(v=>v.count>before.count),last:after.diagnostics}));
 await page.locator('#zoom-in').click();await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);assert((await page.evaluate(()=>globeDiagnostics.zoom))>1);
 await page.locator('#night-brightness').fill('90');await page.locator('#night-brightness').dispatchEvent('input');await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);assert.equal(await page.evaluate(()=>globeDiagnostics.brightness),.9);
 for(const id of ['grid-toggle','axis-toggle','label-toggle']){await page.locator('#'+id).click();assert.equal(await page.locator('#'+id).getAttribute('aria-pressed'),'false');await page.locator('#'+id).click();}
 await page.locator('#reset').click();await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);assert.equal(await page.evaluate(()=>globeDiagnostics.zoom),1);
 const home=await page.evaluate(()=>globeDiagnostics.q);assert(Math.max(...home.map((x,i)=>Math.abs(x-before.q[i])))<1e-10);
 await page.locator('#scene').focus();await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);assert.notDeepEqual(await page.evaluate(()=>globeDiagnostics.q),home);
 await page.keyboard.press('Home');await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);
 // Independently rasterize the embedded source and verify places and antimeridian/polar coverage.
 const geo=await page.evaluate(()=>{const t=JSON.parse(document.getElementById('geo-data').textContent),c=document.createElement('canvas');c.width=4096;c.height=2048;const x=c.getContext('2d',{willReadFrequently:true}),p=d3.geoEquirectangular().scale(4096/(2*Math.PI)).translate([2048,1024]);x.fillStyle='#000';x.fillRect(0,0,4096,2048);x.beginPath();d3.geoPath(p,x)(topojson.feature(t,t.objects.land));x.fillStyle='#fff';x.fill();const places=[['Tokyo',139.6917,35.6895,true],['Delhi',77.2,28.6,true],['Paris',2.35,48.85,true],['Newark',-74.17,40.73,true],['Sydney',151.1,-33.8,true],['Madagascar',47,-19,true],['Antarctica',0,-89,true],['Pacific',-150,0,false],['Atlantic',-30,0,false],['Indian Ocean',75,-25,false],['Dateline N',179,20,false],['Dateline S',-179,-20,false]];return places.map(([name,lon,lat,expected])=>{const a=p([lon,lat]);return {name,expected,land:x.getImageData(Math.floor(a[0]),Math.floor(a[1]),1,1).data[0]>128};});});
 for(const p of geo)assert.equal(p.land,p.expected,p.name);console.log('GEOGRAPHY',JSON.stringify(geo));
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);await page.screenshot({path:'/tmp/globe-mobile.png'});
 const overflow=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,height:document.documentElement.scrollHeight,viewportHeight:innerHeight}));assert(overflow.width<=overflow.viewport,'horizontal overflow');
 console.log('MOBILE',JSON.stringify(overflow));console.log('ERRORS',JSON.stringify(errors));console.log('REQUESTS',JSON.stringify(requests));assert.deepEqual(errors,[]);assert.equal(requests.filter(s=>/^https?:/.test(s)).length,0,'Must work fully offline');
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const touchErrors=[];mobile.on('pageerror',e=>touchErrors.push(e.message));await mobile.goto('file:///content/drive/MyDrive/work/dist/index.html');await mobile.waitForFunction(()=>window.globeDiagnostics?.renderCount>0&&!globeDiagnostics.busy&&!globeDiagnostics.pending);await mobile.screenshot({path:'/tmp/globe-mobile-clean.png'});
 const touchBox=await mobile.locator('#scene').boundingBox(),tx=touchBox.x+touchBox.width/2,ty=touchBox.y+touchBox.height/2,session=await mobile.context().newCDPSession(mobile);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx-45,y:ty,id:1},{x:tx+45,y:ty,id:2}]});
 for(let i=1;i<=15;i++){const a=i/15*.4,r=45+i*2;await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx-r*Math.cos(a),y:ty-r*Math.sin(a),id:1},{x:tx+r*Math.cos(a),y:ty+r*Math.sin(a),id:2}]});}
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);const pinch=await mobile.evaluate(()=>globeDiagnostics);assert(pinch.zoom>1.5,'Touch pinch must zoom');assert.notDeepEqual(pinch.q,home,'Two-finger twist must rotate axis');assert.deepEqual(touchErrors,[]);console.log('PINCH',JSON.stringify({zoom:pinch.zoom,q:pinch.q}));
 await mobile.setViewportSize({width:320,height:568});await mobile.locator('#reset').click();await mobile.waitForFunction(()=>!globeDiagnostics.busy&&!globeDiagnostics.pending);await mobile.screenshot({path:'/tmp/globe-small.png'});const layout=await mobile.evaluate(()=>{const ids=['grid-toggle','label-toggle','zoom-in','reset','night-brightness'],rects=Object.fromEntries(ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return[id,{x:r.x,y:r.y,right:r.right,bottom:r.bottom}];}));return{width:document.documentElement.scrollWidth,rects};});assert(layout.width<=320);assert(layout.rects['label-toggle'].right<layout.rects['zoom-in'].x,'Mobile controls must not overlap');console.log('SMALL_LAYOUT',JSON.stringify(layout));
 const fallback=await browser.newPage({viewport:{width:1000,height:720}});await fallback.addInitScript(()=>Object.defineProperty(window,'Worker',{value:undefined}));await fallback.goto('file:///content/drive/MyDrive/work/dist/index.html');await fallback.waitForFunction(()=>window.globeDiagnostics?.renderCount>0&&!globeDiagnostics.busy);assert.equal(await fallback.evaluate(()=>globeDiagnostics.worker),false);console.log('FALLBACK','CPU renderer works without Worker');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
