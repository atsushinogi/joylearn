import assert from 'node:assert/strict';
import { solve } from './dist/physics.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(const mode of ['single','series','parallel','advanced'])for(const mass of [0,10,100,300])for(const a of [10,20,40])for(const b of [10,20,40])for(const middle of [0,50,150]){
 const r=solve({mode,mass,a,b,middle});
 near(r.loadA,a*r.xA);near(r.loadB,b*r.xB);
 if(mode==='parallel'){near(r.loadA+r.loadB,mass);near(r.xA,r.xB);near(r.total,8+r.xA);}
 if(mode==='series'){near(r.loadA,mass);near(r.loadB,mass);near(r.total,16+r.xA+r.xB);}
 if(mode==='advanced'){near(r.loadA,mass+middle);near(r.loadB,mass);near(r.total,16+r.xA+r.xB);}
 if(mode==='single'){near(r.total,8+r.xA);}
 assert.ok(r.extension>=0 && Number.isFinite(r.total));
}
near(solve({mode:'single',mass:100,a:20}).xA,5);
near(solve({mode:'series',mass:100,a:20,b:20}).extension,10);
near(solve({mode:'parallel',mass:100,a:20,b:20}).extension,2.5);
near(solve({mode:'advanced',mass:100,middle:50,a:20,b:20}).loadA,150);
console.log('PASS: 432 equilibrium cases; load balance, equal parallel extensions, natural lengths and quiz answers.');
