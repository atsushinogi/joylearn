// The educational scale is grams of supported mass per centimetre of extension.
// All springs are ideal, massless, linear springs. Values describe static equilibrium.
export function solve({mode='single',mass=100,a=20,b=20,middle=50}) {
  const natural=8;
  let loadA=mass,loadB=0;
  if(mode==='parallel'){loadA=mass*a/(a+b);loadB=mass*b/(a+b);}
  if(mode==='series'||mode==='advanced'){loadA=mass+(mode==='advanced'?middle:0);loadB=mass;}
  const xA=loadA/a,xB=loadB/b;
  const two=mode!=='single';
  const extension=mode==='parallel'?xA:(xA+(two?xB:0));
  const rest=natural*((mode==='series'||mode==='advanced')?2:1);
  return {loadA,loadB,xA,xB,extension,natural:rest,total:rest+extension,two};
}
