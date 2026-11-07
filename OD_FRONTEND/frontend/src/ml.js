// On-device quality + face/document checks (no model download). Uses the browser FaceDetector API when present.
// To upgrade: send the captured image to a backend endpoint running real face-match / OCR.
export async function analyze(src,kind){
 const W=96,cv=document.createElement('canvas');cv.width=cv.height=W;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,W,W);
 const d=x.getImageData(0,0,W,W).data,g=[];let br=0,sk=0,skc=0,n=0;
 for(let i=0;i<d.length;i+=4){const R=d[i],G=d[i+1],B=d[i+2];g.push(.299*R+.587*G+.114*B);br+=g[g.length-1];
  const cb=128-.169*R-.331*G+.5*B,cr=128+.5*R-.419*G-.081*B;
  if(cb>77&&cb<127&&cr>133&&cr<173){sk++;const p=i/4,px=p%W,py=(p/W)|0;if(Math.abs(px-W/2)<W*.25&&Math.abs(py-W*.45)<W*.3)skc++}n++}
 br/=n;let lv=0;for(let y=1;y<W-1;y++)for(let c=1;c<W-1;c++){const i=y*W+c,l=4*g[i]-g[i-1]-g[i+1]-g[i-W]-g[i+W];lv+=l*l}lv/=(W-2)*(W-2);
 const checks=[['Lighting is adequate',br>55&&br<220],['Image is sharp (not blurry)',lv>60]];
 if(kind==='face'){let fd=null;try{if('FaceDetector' in window)fd=(await new FaceDetector().detect(src)).length===1}catch{}
  checks.push(fd===null?['Face centred in frame',skc/n>.08&&sk/n<.7]:['Exactly one face detected',fd])}
 else checks.push(['Document edges / text detected',lv>120],['Document fills the frame',sk/n<.55]);
 return{ok:checks.every(c=>c[1]),checks}}
