import {S as Si$1,v as vi,j}from'./chunk-C8AV8Uj3.js';import {g,n,p,f as fn$1,H as Hg,d as de$1,F as FV,a as gw,b as Hn,W as Wn,m as mi$1,c as di,u as us,M as MC,X as Xu,h as hg,L as Lw,e as LE,j as jw,i as ag,r as rl,A as Am,k as F,l as go$1,V as Vn,o as j2,q as lr,w as we,s as ub,S as Sh,t as to$1,C,N as Ne$1,K as Kj,J as Ju,v as ug,x as el,y as Cg,Q as Qu,z as yC,B as bg,D as zj,G as Gj,I as Ia,E as mi$2,O as Ds,P as Ea,R as os,T as Cs,U as tl,Y as ng,Z as nl,_ as cg,$ as ln$1,a0 as ue,a1 as Ct,a2 as oe,a3 as yy,a4 as xy,a5 as V,a6 as q,a7 as Qe,a8 as Ee$1,a9 as Ma,aa as Ht$2,ab as wa,ac as Da,ad as Ca,ae as Vi$1,af as Ns,ag as Ss,ah as TI,ai as Vw,aj as Bw,ak as SI,al as Hw,am as Cp,an as eg,ao as eC,ap as tC,aq as Lg,ar as ws,as as Qj,at as dg,au as xg,av as qw,aw as Zd,ax as Xw,ay as Yd,az as Ye,aA as qe,aB as Qt$1,aC as Rn,aD as ct,aE as Dt$1,aF as jt$1,aG as ir,aH as at,aI as ET,aJ as Ut$1,aK as mt,aL as Dy,aM as cr,aN as vi$1,aO as fg,aP as Rn$1,aQ as Ae,aR as Iw,aS as Yt,aT as Qg,aU as mT,aV as Q,aW as lo$1,aX as he,aY as Cr,aZ as Ug,a_ as da,a$ as ze,b0 as S,b1 as Si$2,b2 as rt,b3 as ay,b4 as ra,b5 as gy,b6 as Ey,b7 as iy,b8 as oy,b9 as yg,ba as rC,bb as oC,bc as fr,bd as hu,be as kg,bf as Og,bg as Nt$1,bh as zs,bi as rr,bj as Vs,bk as fE,bl as hT,bm as vg,bn as en,bo as Ys,bp as yn$1,bq as RC}from'./main-NAFYDWEG.js';import {I,W as We$1,$ as $e$1}from'./chunk-DCH_kjvQ.js';import {H as Ht$1,F as Fe,w as we$1,q as qt$1}from'./chunk-47nU-eMB.js';function Li(n,o){n&1&&ug(0,"div",2);}var Vi=new C("MAT_PROGRESS_BAR_DEFAULT_OPTIONS");var ui=(()=>{class n{_elementRef=g(lr);_ngZone=g(we);_changeDetectorRef=g(ub);_renderer=g(Sh);_cleanupTransitionEnd;constructor(){let e=to$1(),t=g(Vi,{optional:true});this._isNoopAnimation=e==="di-disabled",e==="reduced-motion"&&this._elementRef.nativeElement.classList.add("mat-progress-bar-reduced-motion"),t&&(t.color&&(this.color=this._defaultColor=t.color),this.mode=t.mode||this.mode);}_isNoopAnimation;get color(){return this._color||this._defaultColor}set color(e){this._color=e;}_color;_defaultColor="primary";get value(){return this._value}set value(e){this._value=mi(e||0),this._changeDetectorRef.markForCheck();}_value=0;get bufferValue(){return this._bufferValue||0}set bufferValue(e){this._bufferValue=mi(e||0),this._changeDetectorRef.markForCheck();}_bufferValue=0;animationEnd=new Ne$1;get mode(){return this._mode}set mode(e){this._mode=e,this._changeDetectorRef.markForCheck();}_mode="determinate";ngAfterViewInit(){this._ngZone.runOutsideAngular(()=>{this._cleanupTransitionEnd=this._renderer.listen(this._elementRef.nativeElement,"transitionend",this._transitionendHandler);});}ngOnDestroy(){this._cleanupTransitionEnd?.();}_getPrimaryBarTransform(){return `scaleX(${this._isIndeterminate()?1:this.value/100})`}_getBufferBarFlexBasis(){return `${this.mode==="buffer"?this.bufferValue:100}%`}_isIndeterminate(){return this.mode==="indeterminate"||this.mode==="query"}_transitionendHandler=e=>{this.animationEnd.observers.length===0||!e.target||!e.target.classList.contains("mdc-linear-progress__primary-bar")||(this.mode==="determinate"||this.mode==="buffer")&&this._ngZone.run(()=>this.animationEnd.next({value:this.value}));};static \u0275fac=function(t){return new(t||n)};static \u0275cmp=gw({type:n,selectors:[["mat-progress-bar"]],hostAttrs:["role","progressbar","aria-valuemin","0","aria-valuemax","100","tabindex","-1",1,"mat-mdc-progress-bar","mdc-linear-progress"],hostVars:10,hostBindings:function(t,i){t&2&&(Qu("aria-valuenow",i._isIndeterminate()?null:i.value)("mode",i.mode),yC("mat-"+i.color),bg("_mat-animation-noopable",i._isNoopAnimation)("mdc-linear-progress--animation-ready",!i._isNoopAnimation)("mdc-linear-progress--indeterminate",i._isIndeterminate()));},inputs:{color:"color",value:[2,"value","value",Kj],bufferValue:[2,"bufferValue","bufferValue",Kj],mode:"mode"},outputs:{animationEnd:"animationEnd"},exportAs:["matProgressBar"],decls:7,vars:5,consts:[["aria-hidden","true",1,"mdc-linear-progress__buffer"],[1,"mdc-linear-progress__buffer-bar"],[1,"mdc-linear-progress__buffer-dots"],["aria-hidden","true",1,"mdc-linear-progress__bar","mdc-linear-progress__primary-bar"],[1,"mdc-linear-progress__bar-inner"],["aria-hidden","true",1,"mdc-linear-progress__bar","mdc-linear-progress__secondary-bar"]],template:function(t,i){t&1&&(Ju(0,"div",0),ug(1,"div",1),Lw(2,Li,1,0,"div",2),el(),Ju(3,"div",3),ug(4,"span",4),el(),Ju(5,"div",5),ug(6,"span",4),el()),t&2&&(LE(),Cg("flex-basis",i._getBufferBarFlexBasis()),LE(),jw(i.mode==="buffer"?2:-1),LE(),Cg("transform",i._getPrimaryBarTransform()));},styles:[`.mat-mdc-progress-bar {
  --%NS%mat-progress-bar-animation-multiplier: 1;
  display: block;
  text-align: start;
}
.mat-mdc-progress-bar[mode=query] {
  transform: scaleX(-1);
}
.mat-mdc-progress-bar._mat-animation-noopable .mdc-linear-progress__buffer-dots,
.mat-mdc-progress-bar._mat-animation-noopable .mdc-linear-progress__primary-bar,
.mat-mdc-progress-bar._mat-animation-noopable .mdc-linear-progress__secondary-bar,
.mat-mdc-progress-bar._mat-animation-noopable .mdc-linear-progress__bar-inner.mdc-linear-progress__bar-inner {
  animation: none;
}
.mat-mdc-progress-bar._mat-animation-noopable .mdc-linear-progress__primary-bar,
.mat-mdc-progress-bar._mat-animation-noopable .mdc-linear-progress__buffer-bar {
  transition: transform 1ms;
}

.mat-progress-bar-reduced-motion {
  --%NS%mat-progress-bar-animation-multiplier: 2;
}

.mdc-linear-progress {
  position: relative;
  width: 100%;
  transform: translateZ(0);
  outline: 1px solid transparent;
  overflow-x: hidden;
  transition: opacity 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  height: max(var(--%NS%mat-progress-bar-track-height, 4px), var(--%NS%mat-progress-bar-active-indicator-height, 4px));
}
@media (forced-colors: active) {
  .mdc-linear-progress {
    outline-color: CanvasText;
  }
}

.mdc-linear-progress__bar {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  width: 100%;
  animation: none;
  transform-origin: top left;
  transition: transform 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  height: var(--%NS%mat-progress-bar-active-indicator-height, 4px);
}
.mdc-linear-progress--indeterminate .mdc-linear-progress__bar {
  transition: none;
}
[dir=rtl] .mdc-linear-progress__bar {
  right: 0;
  transform-origin: center right;
}

.mdc-linear-progress__bar-inner {
  display: inline-block;
  position: absolute;
  width: 100%;
  animation: none;
  border-top-style: solid;
  border-color: var(--%NS%mat-progress-bar-active-indicator-color, var(--%NS%mat-sys-primary));
  border-top-width: var(--%NS%mat-progress-bar-active-indicator-height, 4px);
}

.mdc-linear-progress__buffer {
  display: flex;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  width: 100%;
  overflow: hidden;
  height: var(--%NS%mat-progress-bar-track-height, 4px);
  border-radius: var(--%NS%mat-progress-bar-track-shape, var(--%NS%mat-sys-corner-none));
}

.mdc-linear-progress__buffer-dots {
  background-image: radial-gradient(circle, var(--%NS%mat-progress-bar-track-color, var(--%NS%mat-sys-surface-variant)) calc(var(--%NS%mat-progress-bar-track-height, 4px) / 2), transparent 0);
  background-repeat: repeat-x;
  background-size: calc(calc(var(--%NS%mat-progress-bar-track-height, 4px) / 2) * 5);
  background-position: left;
  flex: auto;
  transform: rotate(180deg);
  animation: mdc-linear-progress-buffering calc(250ms * var(--%NS%mat-progress-bar-animation-multiplier)) infinite linear;
}
@media (forced-colors: active) {
  .mdc-linear-progress__buffer-dots {
    background-color: ButtonBorder;
  }
}
[dir=rtl] .mdc-linear-progress__buffer-dots {
  animation: mdc-linear-progress-buffering-reverse calc(250ms * var(--%NS%mat-progress-bar-animation-multiplier)) infinite linear;
  transform: rotate(0);
}

.mdc-linear-progress__buffer-bar {
  flex: 0 1 100%;
  transition: flex-basis 250ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
  background-color: var(--%NS%mat-progress-bar-track-color, var(--%NS%mat-sys-surface-variant));
}

.mdc-linear-progress__primary-bar {
  transform: scaleX(0);
}
.mdc-linear-progress--indeterminate .mdc-linear-progress__primary-bar {
  left: -145.166611%;
}
.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__primary-bar {
  animation: mdc-linear-progress-primary-indeterminate-translate calc(2s * var(--%NS%mat-progress-bar-animation-multiplier)) infinite linear;
}
.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__primary-bar > .mdc-linear-progress__bar-inner {
  animation: mdc-linear-progress-primary-indeterminate-scale calc(2s * var(--%NS%mat-progress-bar-animation-multiplier)) infinite linear;
}
[dir=rtl] .mdc-linear-progress.mdc-linear-progress--animation-ready .mdc-linear-progress__primary-bar {
  animation-name: mdc-linear-progress-primary-indeterminate-translate-reverse;
}
[dir=rtl] .mdc-linear-progress.mdc-linear-progress--indeterminate .mdc-linear-progress__primary-bar {
  right: -145.166611%;
  left: auto;
}

.mdc-linear-progress__secondary-bar {
  display: none;
}
.mdc-linear-progress--indeterminate .mdc-linear-progress__secondary-bar {
  left: -54.888891%;
  display: block;
}
.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__secondary-bar {
  animation: mdc-linear-progress-secondary-indeterminate-translate calc(2s * var(--%NS%mat-progress-bar-animation-multiplier)) infinite linear;
}
.mdc-linear-progress--indeterminate.mdc-linear-progress--animation-ready .mdc-linear-progress__secondary-bar > .mdc-linear-progress__bar-inner {
  animation: mdc-linear-progress-secondary-indeterminate-scale calc(2s * var(--%NS%mat-progress-bar-animation-multiplier)) infinite linear;
}
[dir=rtl] .mdc-linear-progress.mdc-linear-progress--animation-ready .mdc-linear-progress__secondary-bar {
  animation-name: mdc-linear-progress-secondary-indeterminate-translate-reverse;
}
[dir=rtl] .mdc-linear-progress.mdc-linear-progress--indeterminate .mdc-linear-progress__secondary-bar {
  right: -54.888891%;
  left: auto;
}

@keyframes mdc-linear-progress-buffering {
  from {
    transform: rotate(180deg) translateX(calc(var(--%NS%mat-progress-bar-track-height, 4px) * -2.5));
  }
}
@keyframes mdc-linear-progress-primary-indeterminate-translate {
  0% {
    transform: translateX(0);
  }
  20% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(0);
  }
  59.15% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(83.67142%);
  }
  100% {
    transform: translateX(200.611057%);
  }
}
@keyframes mdc-linear-progress-primary-indeterminate-scale {
  0% {
    transform: scaleX(0.08);
  }
  36.65% {
    animation-timing-function: cubic-bezier(0.334731, 0.12482, 0.785844, 1);
    transform: scaleX(0.08);
  }
  69.15% {
    animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);
    transform: scaleX(0.661479);
  }
  100% {
    transform: scaleX(0.08);
  }
}
@keyframes mdc-linear-progress-secondary-indeterminate-translate {
  0% {
    animation-timing-function: cubic-bezier(0.15, 0, 0.515058, 0.409685);
    transform: translateX(0);
  }
  25% {
    animation-timing-function: cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);
    transform: translateX(37.651913%);
  }
  48.35% {
    animation-timing-function: cubic-bezier(0.4, 0.627035, 0.6, 0.902026);
    transform: translateX(84.386165%);
  }
  100% {
    transform: translateX(160.277782%);
  }
}
@keyframes mdc-linear-progress-secondary-indeterminate-scale {
  0% {
    animation-timing-function: cubic-bezier(0.205028, 0.057051, 0.57661, 0.453971);
    transform: scaleX(0.08);
  }
  19.15% {
    animation-timing-function: cubic-bezier(0.152313, 0.196432, 0.648374, 1.004315);
    transform: scaleX(0.457104);
  }
  44.15% {
    animation-timing-function: cubic-bezier(0.257759, -0.003163, 0.211762, 1.38179);
    transform: scaleX(0.72796);
  }
  100% {
    transform: scaleX(0.08);
  }
}
@keyframes mdc-linear-progress-primary-indeterminate-translate-reverse {
  0% {
    transform: translateX(0);
  }
  20% {
    animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
    transform: translateX(0);
  }
  59.15% {
    animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
    transform: translateX(-83.67142%);
  }
  100% {
    transform: translateX(-200.611057%);
  }
}
@keyframes mdc-linear-progress-secondary-indeterminate-translate-reverse {
  0% {
    animation-timing-function: cubic-bezier(0.15, 0, 0.515058, 0.409685);
    transform: translateX(0);
  }
  25% {
    animation-timing-function: cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);
    transform: translateX(-37.651913%);
  }
  48.35% {
    animation-timing-function: cubic-bezier(0.4, 0.627035, 0.6, 0.902026);
    transform: translateX(-84.386165%);
  }
  100% {
    transform: translateX(-160.277782%);
  }
}
@keyframes mdc-linear-progress-buffering-reverse {
  from {
    transform: translateX(-10px);
  }
}
`],encapsulation:2})}return n})();function mi(n,o=0,e=100){return Math.max(o,Math.min(e,n))}var fi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=go$1({type:n});static \u0275inj=Vn({imports:[j2]})}return n})();var Me=class n{http=g(Am);list(){return this.http.get("/queues")}get(o){return this.http.get(`/queues/${encodeURIComponent(o)}`)}create(o,e,t,i){let a={name:o,plugin:e};return t!=null&&(a.threads=t),i!=null&&(a.sort=i),this.http.post("/queues",a)}update(o,e){return this.http.post(`/queues/${encodeURIComponent(o)}`,e)}delete(o){return this.http.delete(`/queues/${encodeURIComponent(o)}`)}static queueParam(o){return {queue:o}}static \u0275fac=function(e){return new(e||n)};static \u0275prov=F({token:n,factory:n.\u0275fac,providedIn:"root"})};var Ne=class n{http=g(Am);list(){return this.http.get("/nodes")}get(o){return this.http.get(`/nodes/${encodeURIComponent(o)}`)}updateMaxThreads(o,e){return this.http.post(`/nodes/${encodeURIComponent(o)}`,{maxthreads:e})}static \u0275fac=function(e){return new(e||n)};static \u0275prov=F({token:n,factory:n.\u0275fac,providedIn:"root"})};var Dt=class n{http=g(Am);list(){return this.http.get("/plugins")}static \u0275fac=function(e){return new(e||n)};static \u0275prov=F({token:n,factory:n.\u0275fac,providedIn:"root"})};var Qi=[[["caption"]],[["colgroup"],["col"]],"*"],Hi=["caption","colgroup, col","*"];function ji(n,o){n&1&&tC(0,2);}function qi(n,o){n&1&&(us(0,"thead",0),dg(1,1),Xu(),us(2,"tbody",0),dg(3,2)(4,3),Xu(),us(5,"tfoot",0),dg(6,4),Xu());}function Ui(n,o){n&1&&dg(0,1)(1,2)(2,3)(3,4);}var $=new C("CDK_TABLE");var xt=(()=>{class n{template=g(ir);static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","cdkCellDef",""]]})}return n})(),kt=(()=>{class n{template=g(ir);static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","cdkHeaderCellDef",""]]})}return n})(),gi=(()=>{class n{template=g(ir);static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","cdkFooterCellDef",""]]})}return n})(),Ee=(()=>{class n{_table=g($,{optional:true});_hasStickyChanged=false;get name(){return this._name}set name(e){this._setNameInput(e);}_name;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;get stickyEnd(){return this._stickyEnd}set stickyEnd(e){e!==this._stickyEnd&&(this._stickyEnd=e,this._hasStickyChanged=true);}_stickyEnd=false;cell;headerCell;footerCell;cssClassFriendlyName;_columnCssClassName;hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}_updateColumnCssClassName(){this._columnCssClassName=[`cdk-column-${this.cssClassFriendlyName}`];}_setNameInput(e){e&&(this._name=e,this.cssClassFriendlyName=e.replace(/[^a-z0-9_-]/gi,"-"),this._updateColumnCssClassName());}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","cdkColumnDef",""]],contentQueries:function(t,i,a){if(t&1&&yg(a,xt,5)(a,kt,5)(a,gi,5),t&2){let r;rC(r=oC())&&(i.cell=r.first),rC(r=oC())&&(i.headerCell=r.first),rC(r=oC())&&(i.footerCell=r.first);}},inputs:{name:[0,"cdkColumnDef","name"],sticky:[2,"sticky","sticky",Qj],stickyEnd:[2,"stickyEnd","stickyEnd",Qj]}})}return n})(),Rt=class{constructor(o,e){e.nativeElement.classList.add(...o._columnCssClassName);}},_i=(()=>{class n extends Rt{constructor(){super(g(Ee),g(lr));}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["cdk-header-cell"],["th","cdk-header-cell",""]],hostAttrs:["role","columnheader",1,"cdk-header-cell"],features:[eg]})}return n})();var yi=(()=>{class n extends Rt{constructor(){let e=g(Ee),t=g(lr);super(e,t);let i=e._table?._getCellRole();i&&t.nativeElement.setAttribute("role",i);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["cdk-cell"],["td","cdk-cell",""]],hostAttrs:[1,"cdk-cell"],features:[eg]})}return n})();var sn=(()=>{class n{template=g(ir);_differs=g(Qg);columns;_columnsDiffer;ngOnChanges(e){if(!this._columnsDiffer){let t=e.columns&&e.columns.currentValue||[];this._columnsDiffer=this._differs.find(t).create(),this._columnsDiffer.diff(t);}}getColumnsDiff(){return this._columnsDiffer.diff(this.columns)}extractCellTemplate(e){return this instanceof $e?e.headerCell.template:this instanceof ln?e.footerCell.template:e.cell.template}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,features:[hu]})}return n})(),$e=(()=>{class n extends sn{_table=g($,{optional:true});_hasStickyChanged=false;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;ngOnChanges(e){super.ngOnChanges(e);}hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","cdkHeaderRowDef",""]],inputs:{columns:[0,"cdkHeaderRowDef","columns"],sticky:[2,"cdkHeaderRowDefSticky","sticky",Qj]},features:[eg,hu]})}return n})(),ln=(()=>{class n extends sn{_table=g($,{optional:true});_hasStickyChanged=false;get sticky(){return this._sticky}set sticky(e){e!==this._sticky&&(this._sticky=e,this._hasStickyChanged=true);}_sticky=false;ngOnChanges(e){super.ngOnChanges(e);}hasStickyChanged(){let e=this._hasStickyChanged;return this.resetStickyChanged(),e}resetStickyChanged(){this._hasStickyChanged=false;}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","cdkFooterRowDef",""]],inputs:{columns:[0,"cdkFooterRowDef","columns"],sticky:[2,"cdkFooterRowDefSticky","sticky",Qj]},features:[eg,hu]})}return n})(),Tt=(()=>{class n extends sn{_table=g($,{optional:true});when;static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","cdkRowDef",""]],inputs:{columns:[0,"cdkRowDefColumns","columns"],when:[0,"cdkRowDefWhen","when"]},features:[eg]})}return n})(),de=(()=>{class n{_viewContainer=g(fr);cells;context;static mostRecentCellOutlet=null;constructor(){n.mostRecentCellOutlet=this;}ngOnDestroy(){n.mostRecentCellOutlet===this&&(n.mostRecentCellOutlet=null);}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","cdkCellOutlet",""]]})}return n})(),dn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=gw({type:n,selectors:[["cdk-header-row"],["tr","cdk-header-row",""]],hostAttrs:["role","row",1,"cdk-header-row"],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&dg(0,0);},dependencies:[de],encapsulation:2,changeDetection:1})}return n})();var cn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=gw({type:n,selectors:[["cdk-row"],["tr","cdk-row",""]],hostAttrs:["role","row",1,"cdk-row"],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&dg(0,0);},dependencies:[de],encapsulation:2,changeDetection:1})}return n})(),bi=(()=>{class n{templateRef=g(ir);_contentClassNames=["cdk-no-data-row","cdk-row"];_cellClassNames=["cdk-cell","cdk-no-data-cell"];_cellSelector="td, cdk-cell, [cdk-cell], .cdk-cell";static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["ng-template","cdkNoDataRow",""]]})}return n})(),hi=["top","bottom","left","right"],rn=class{_isNativeHtmlTable;_stickCellCss;_isBrowser;_needsPositionStickyOnElement;direction;_positionListener;_tableInjector;_elemSizeCache=new WeakMap;_resizeObserver=globalThis?.ResizeObserver?new globalThis.ResizeObserver(o=>this._updateCachedSizes(o)):null;_updatedStickyColumnsParamsToReplay=[];_stickyColumnsReplayTimeout=null;_cachedCellWidths=[];_borderCellCss;_destroyed=false;constructor(o,e,t=true,i=true,a,r,c){this._isNativeHtmlTable=o,this._stickCellCss=e,this._isBrowser=t,this._needsPositionStickyOnElement=i,this.direction=a,this._positionListener=r,this._tableInjector=c,this._borderCellCss={top:`${e}-border-elem-top`,bottom:`${e}-border-elem-bottom`,left:`${e}-border-elem-left`,right:`${e}-border-elem-right`};}clearStickyPositioning(o,e){(e.includes("left")||e.includes("right"))&&this._removeFromStickyColumnReplayQueue(o);let t=[];for(let i of o)i.nodeType===i.ELEMENT_NODE&&t.push(i,...Array.from(i.children));fE({write:()=>{for(let i of t)this._removeStickyStyle(i,e);}},{injector:this._tableInjector});}updateStickyColumns(o,e,t,i=true,a=true){if(!o.length||!this._isBrowser||!(e.some(z=>z)||t.some(z=>z))){this._positionListener?.stickyColumnsUpdated({sizes:[]}),this._positionListener?.stickyEndColumnsUpdated({sizes:[]});return}let r=o[0],c=r.children.length,f=this.direction==="rtl",g=f?"right":"left",C=f?"left":"right",L=e.lastIndexOf(true),T=t.indexOf(true),M,vn,wn;a&&this._updateStickyColumnReplayQueue({rows:[...o],stickyStartStates:[...e],stickyEndStates:[...t]}),fE({earlyRead:()=>{M=this._getCellWidths(r,i),vn=this._getStickyStartColumnPositions(M,e),wn=this._getStickyEndColumnPositions(M,t);},write:()=>{for(let z of o)for(let P=0;P<c;P++){let Dn=z.children[P];e[P]&&this._addStickyStyle(Dn,g,vn[P],P===L),t[P]&&this._addStickyStyle(Dn,C,wn[P],P===T);}this._positionListener&&M.some(z=>!!z)&&(this._positionListener.stickyColumnsUpdated({sizes:L===-1?[]:M.slice(0,L+1).map((z,P)=>e[P]?z:null)}),this._positionListener.stickyEndColumnsUpdated({sizes:T===-1?[]:M.slice(T).map((z,P)=>t[P+T]?z:null).reverse()}));}},{injector:this._tableInjector});}stickRows(o,e,t){if(!this._isBrowser)return;let i=t==="bottom"?o.slice().reverse():o,a=t==="bottom"?e.slice().reverse():e,r=[],c=[],f=[];fE({earlyRead:()=>{for(let g=0,C=0;g<i.length;g++){if(!a[g])continue;r[g]=C;let L=i[g];f[g]=this._isNativeHtmlTable?Array.from(L.children):[L];let T=this._retrieveElementSize(L).height;C+=T,c[g]=T;}},write:()=>{let g=a.lastIndexOf(true);for(let C=0;C<i.length;C++){if(!a[C])continue;let L=r[C],T=C===g;for(let M of f[C])this._addStickyStyle(M,t,L,T);}t==="top"?this._positionListener?.stickyHeaderRowsUpdated({sizes:c,offsets:r,elements:f}):this._positionListener?.stickyFooterRowsUpdated({sizes:c,offsets:r,elements:f});}},{injector:this._tableInjector});}updateStickyFooterContainer(o,e){this._isNativeHtmlTable&&fE({write:()=>{let t=o.querySelector("tfoot");t&&(e.some(i=>!i)?this._removeStickyStyle(t,["bottom"]):this._addStickyStyle(t,"bottom",0,false));}},{injector:this._tableInjector});}destroy(){this._stickyColumnsReplayTimeout&&clearTimeout(this._stickyColumnsReplayTimeout),this._resizeObserver?.disconnect(),this._destroyed=true;}_removeStickyStyle(o,e){if(!o.classList.contains(this._stickCellCss))return;for(let i of e)o.style[i]="",o.classList.remove(this._borderCellCss[i]);hi.some(i=>e.indexOf(i)===-1&&o.style[i])?o.style.zIndex=this._getCalculatedZIndex(o):(o.style.zIndex="",this._needsPositionStickyOnElement&&(o.style.position=""),o.classList.remove(this._stickCellCss));}_addStickyStyle(o,e,t,i){o.classList.add(this._stickCellCss),i&&o.classList.add(this._borderCellCss[e]),o.style[e]=`${t}px`,o.style.zIndex=this._getCalculatedZIndex(o),this._needsPositionStickyOnElement&&(o.style.cssText+="position: -webkit-sticky; position: sticky; ");}_getCalculatedZIndex(o){let e={top:100,bottom:10,left:1,right:1},t=0;for(let i of hi)o.style[i]&&(t+=e[i]);return t?`${t}`:""}_getCellWidths(o,e=true){if(!e&&this._cachedCellWidths.length)return this._cachedCellWidths;let t=[],i=o.children;for(let a=0;a<i.length;a++){let r=i[a];t.push(this._retrieveElementSize(r).width);}return this._cachedCellWidths=t,t}_getStickyStartColumnPositions(o,e){let t=[],i=0;for(let a=0;a<o.length;a++)e[a]&&(t[a]=i,i+=o[a]);return t}_getStickyEndColumnPositions(o,e){let t=[],i=0;for(let a=o.length;a>0;a--)e[a]&&(t[a]=i,i+=o[a]);return t}_retrieveElementSize(o){let e=this._elemSizeCache.get(o);if(e)return e;let t=o.getBoundingClientRect(),i={width:t.width,height:t.height};return this._resizeObserver&&(this._elemSizeCache.set(o,i),this._resizeObserver.observe(o,{box:"border-box"})),i}_updateStickyColumnReplayQueue(o){this._removeFromStickyColumnReplayQueue(o.rows),this._stickyColumnsReplayTimeout||this._updatedStickyColumnsParamsToReplay.push(o);}_removeFromStickyColumnReplayQueue(o){let e=new Set(o);for(let t of this._updatedStickyColumnsParamsToReplay)t.rows=t.rows.filter(i=>!e.has(i));this._updatedStickyColumnsParamsToReplay=this._updatedStickyColumnsParamsToReplay.filter(t=>!!t.rows.length);}_updateCachedSizes(o){let e=false;for(let t of o){let i=t.borderBoxSize?.length?{width:t.borderBoxSize[0].inlineSize,height:t.borderBoxSize[0].blockSize}:{width:t.contentRect.width,height:t.contentRect.height};i.width!==this._elemSizeCache.get(t.target)?.width&&Wi(t.target)&&(e=true),this._elemSizeCache.set(t.target,i);}e&&this._updatedStickyColumnsParamsToReplay.length&&(this._stickyColumnsReplayTimeout&&clearTimeout(this._stickyColumnsReplayTimeout),this._stickyColumnsReplayTimeout=setTimeout(()=>{if(!this._destroyed){for(let t of this._updatedStickyColumnsParamsToReplay)this.updateStickyColumns(t.rows,t.stickyStartStates,t.stickyEndStates,true,false);this._updatedStickyColumnsParamsToReplay=[],this._stickyColumnsReplayTimeout=null;}},0));}};function Wi(n){return ["cdk-cell","cdk-header-cell","cdk-footer-cell"].some(o=>n.classList.contains(o))}var We=new C("STICKY_POSITIONING_LISTENER");var mn=(()=>{class n{viewContainer=g(fr);elementRef=g(lr);constructor(){let e=g($);e._rowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","rowOutlet",""]]})}return n})(),un=(()=>{class n{viewContainer=g(fr);elementRef=g(lr);constructor(){let e=g($);e._headerRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","headerRowOutlet",""]]})}return n})(),fn=(()=>{class n{viewContainer=g(fr);elementRef=g(lr);constructor(){let e=g($);e._footerRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","footerRowOutlet",""]]})}return n})(),hn=(()=>{class n{viewContainer=g(fr);elementRef=g(lr);constructor(){let e=g($);e._noDataRowOutlet=this,e._outletAssigned();}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","noDataRowOutlet",""]]})}return n})(),pn=(()=>{class n{_differs=g(Qg);_changeDetectorRef=g(ub);_elementRef=g(lr);_dir=g(ET,{optional:true});_platform=g(mT);_viewRepeater;_viewportRuler=g(Q);_injector=g(ue);_virtualScrollViewport=g(lo$1,{optional:true,host:true});_positionListener=g(We,{optional:true})||g(We,{optional:true,skipSelf:true});_document=g(he);_data;_renderedRange;_onDestroy=new oe;_renderRows;_renderChangeSubscription=null;_columnDefsByName=new Map;_rowDefs;_headerRowDefs;_footerRowDefs;_dataDiffer;_defaultRowDef=null;_customColumnDefs=new Set;_customRowDefs=new Set;_customHeaderRowDefs=new Set;_customFooterRowDefs=new Set;_customNoDataRow=null;_headerRowDefChanged=true;_footerRowDefChanged=true;_stickyColumnStylesNeedReset=true;_forceRecalculateCellWidths=true;_cachedRenderRowsMap=new Map;_isNativeHtmlTable;_stickyStyler;stickyCssClass="cdk-table-sticky";needsPositionStickyOnElement=true;_isServer;_isShowingNoDataRow=false;_hasAllOutlets=false;_hasInitialized=false;_headerRowStickyUpdates=new oe;_footerRowStickyUpdates=new oe;_disableVirtualScrolling=false;_getCellRole(){if(this._cellRoleInternal===void 0){let e=this._elementRef.nativeElement.getAttribute("role");return e==="grid"||e==="treegrid"?"gridcell":"cell"}return this._cellRoleInternal}_cellRoleInternal=void 0;get trackBy(){return this._trackByFn}set trackBy(e){this._trackByFn=e;}_trackByFn;get dataSource(){return this._dataSource}set dataSource(e){this._dataSource!==e&&(this._switchDataSource(e),this._changeDetectorRef.markForCheck());}_dataSource;_dataSourceChanges=new oe;_dataStream=new oe;get multiTemplateDataRows(){return this._multiTemplateDataRows}set multiTemplateDataRows(e){this._multiTemplateDataRows=e,this._rowOutlet&&this._rowOutlet.viewContainer.length&&(this._forceRenderDataRows(),this.updateStickyColumnStyles());}_multiTemplateDataRows=false;get fixedLayout(){return this._virtualScrollEnabled()?true:this._fixedLayout}set fixedLayout(e){this._fixedLayout=e,this._forceRecalculateCellWidths=true,this._stickyColumnStylesNeedReset=true;}_fixedLayout=false;recycleRows=false;contentChanged=new Ne$1;viewChange=new Cr({start:0,end:Number.MAX_VALUE});_rowOutlet;_headerRowOutlet;_footerRowOutlet;_noDataRowOutlet;_contentColumnDefs;_contentRowDefs;_contentHeaderRowDefs;_contentFooterRowDefs;_noDataRow;get renderedRows(){return this._renderRows}constructor(){g(new Ug("role"),{optional:true})||this._elementRef.nativeElement.setAttribute("role","table"),this._isServer=!this._platform.isBrowser,this._isNativeHtmlTable=this._elementRef.nativeElement.nodeName==="TABLE",this._dataDiffer=this._differs.find([]).create((t,i)=>this.trackBy?this.trackBy(i.dataIndex,i.data):i);}ngOnInit(){this._setupStickyStyler(),this._viewportRuler.change().pipe(da(this._onDestroy)).subscribe(()=>{this._forceRecalculateCellWidths=true;});}ngAfterContentInit(){this._viewRepeater=this.recycleRows||this._virtualScrollEnabled()?new ze:new S,this._virtualScrollEnabled()&&this._setupVirtualScrolling(this._virtualScrollViewport),this._hasInitialized=true;}ngAfterContentChecked(){this._canRender()&&this._render();}ngOnDestroy(){this._stickyStyler?.destroy(),[this._rowOutlet?.viewContainer,this._headerRowOutlet?.viewContainer,this._footerRowOutlet?.viewContainer,this._cachedRenderRowsMap,this._customColumnDefs,this._customRowDefs,this._customHeaderRowDefs,this._customFooterRowDefs,this._columnDefsByName].forEach(e=>{e?.clear();}),this._headerRowDefs=[],this._footerRowDefs=[],this._defaultRowDef=null,this._headerRowStickyUpdates.complete(),this._footerRowStickyUpdates.complete(),this._onDestroy.next(),this._onDestroy.complete(),Si$2(this.dataSource)&&this.dataSource.disconnect(this);}renderRows(){this._renderRows=this._getAllRenderRows();let e=this._dataDiffer.diff(this._renderRows);if(!e){this._updateNoDataRow(),this.contentChanged.next();return}let t=this._rowOutlet.viewContainer;this._viewRepeater.applyChanges(e,t,(i,a,r)=>this._getEmbeddedViewArgs(i.item,r),i=>i.item.data,i=>{i.operation===rt.INSERTED&&i.context&&this._renderCellTemplateForItem(i.record.item.rowDef,i.context);}),this._updateRowIndexContext(),e.forEachIdentityChange(i=>{let a=t.get(i.currentIndex);a.context.$implicit=i.item.data;}),this._updateNoDataRow(),this.contentChanged.next(),this.updateStickyColumnStyles();}addColumnDef(e){this._customColumnDefs.add(e);}removeColumnDef(e){this._customColumnDefs.delete(e);}addRowDef(e){this._customRowDefs.add(e);}removeRowDef(e){this._customRowDefs.delete(e);}addHeaderRowDef(e){this._customHeaderRowDefs.add(e),this._headerRowDefChanged=true;}removeHeaderRowDef(e){this._customHeaderRowDefs.delete(e),this._headerRowDefChanged=true;}addFooterRowDef(e){this._customFooterRowDefs.add(e),this._footerRowDefChanged=true;}removeFooterRowDef(e){this._customFooterRowDefs.delete(e),this._footerRowDefChanged=true;}setNoDataRow(e){this._customNoDataRow=e;}updateStickyHeaderRowStyles(){let e=this._getRenderedRows(this._headerRowOutlet);if(this._isNativeHtmlTable){let i=pi(this._headerRowOutlet,"thead");i&&(i.style.display=e.length?"":"none");}let t=this._headerRowDefs.map(i=>i.sticky);this._stickyStyler.clearStickyPositioning(e,["top"]),this._stickyStyler.stickRows(e,t,"top"),this._headerRowDefs.forEach(i=>i.resetStickyChanged());}updateStickyFooterRowStyles(){let e=this._getRenderedRows(this._footerRowOutlet);if(this._isNativeHtmlTable){let i=pi(this._footerRowOutlet,"tfoot");i&&(i.style.display=e.length?"":"none");}let t=this._footerRowDefs.map(i=>i.sticky);this._stickyStyler.clearStickyPositioning(e,["bottom"]),this._stickyStyler.stickRows(e,t,"bottom"),this._stickyStyler.updateStickyFooterContainer(this._elementRef.nativeElement,t),this._footerRowDefs.forEach(i=>i.resetStickyChanged());}updateStickyColumnStyles(){let e=this._getRenderedRows(this._headerRowOutlet),t=this._getRenderedRows(this._rowOutlet),i=this._getRenderedRows(this._footerRowOutlet);(this._isNativeHtmlTable&&!this.fixedLayout||this._stickyColumnStylesNeedReset)&&(this._stickyStyler.clearStickyPositioning([...e,...t,...i],["left","right"]),this._stickyColumnStylesNeedReset=false),e.forEach((a,r)=>{this._addStickyColumnStyles([a],this._headerRowDefs[r]);}),this._rowDefs.forEach(a=>{let r=[];for(let c=0;c<t.length;c++)this._renderRows[c].rowDef===a&&r.push(t[c]);this._addStickyColumnStyles(r,a);}),i.forEach((a,r)=>{this._addStickyColumnStyles([a],this._footerRowDefs[r]);}),Array.from(this._columnDefsByName.values()).forEach(a=>a.resetStickyChanged());}stickyColumnsUpdated(e){this._positionListener?.stickyColumnsUpdated(e);}stickyEndColumnsUpdated(e){this._positionListener?.stickyEndColumnsUpdated(e);}stickyHeaderRowsUpdated(e){this._headerRowStickyUpdates.next(e),this._positionListener?.stickyHeaderRowsUpdated(e);}stickyFooterRowsUpdated(e){this._footerRowStickyUpdates.next(e),this._positionListener?.stickyFooterRowsUpdated(e);}_outletAssigned(){!this._hasAllOutlets&&this._rowOutlet&&this._headerRowOutlet&&this._footerRowOutlet&&this._noDataRowOutlet&&(this._hasAllOutlets=true,this._canRender()&&this._render());}_canRender(){return this._hasAllOutlets&&this._hasInitialized}_render(){this._cacheRowDefs(),this._cacheColumnDefs(),!this._headerRowDefs.length&&!this._footerRowDefs.length&&this._rowDefs.length;let t=this._renderUpdatedColumns()||this._headerRowDefChanged||this._footerRowDefChanged;this._stickyColumnStylesNeedReset=this._stickyColumnStylesNeedReset||t,this._forceRecalculateCellWidths=t,this._headerRowDefChanged&&(this._forceRenderHeaderRows(),this._headerRowDefChanged=false),this._footerRowDefChanged&&(this._forceRenderFooterRows(),this._footerRowDefChanged=false),this.dataSource&&this._rowDefs.length>0&&!this._renderChangeSubscription?this._observeRenderChanges():this._stickyColumnStylesNeedReset&&this.updateStickyColumnStyles(),this._checkStickyStates();}_getAllRenderRows(){if(!Array.isArray(this._data)||!this._renderedRange)return [];let e=[],t=Math.min(this._data.length,this._renderedRange.end),i=this._cachedRenderRowsMap;this._cachedRenderRowsMap=new Map;for(let a=this._renderedRange.start;a<t;a++){let r=this._data[a],c=this._getRenderRowsForData(r,a,i.get(r));this._cachedRenderRowsMap.has(r)||this._cachedRenderRowsMap.set(r,new WeakMap);for(let f=0;f<c.length;f++){let g=c[f],C=this._cachedRenderRowsMap.get(g.data);C.has(g.rowDef)?C.get(g.rowDef).push(g):C.set(g.rowDef,[g]),e.push(g);}}return e}_getRenderRowsForData(e,t,i){return this._getRowDefs(e,t).map(r=>{let c=i&&i.has(r)?i.get(r):[];if(c.length){let f=c.shift();return f.dataIndex=t,f}else return {data:e,rowDef:r,dataIndex:t}})}_cacheColumnDefs(){this._columnDefsByName.clear(),St(this._getOwnDefs(this._contentColumnDefs),this._customColumnDefs).forEach(t=>{this._columnDefsByName.has(t.name),this._columnDefsByName.set(t.name,t);});}_cacheRowDefs(){this._headerRowDefs=St(this._getOwnDefs(this._contentHeaderRowDefs),this._customHeaderRowDefs),this._footerRowDefs=St(this._getOwnDefs(this._contentFooterRowDefs),this._customFooterRowDefs),this._rowDefs=St(this._getOwnDefs(this._contentRowDefs),this._customRowDefs);let e=this._rowDefs.filter(t=>!t.when);this._defaultRowDef=e[0];}_renderUpdatedColumns(){let e=(r,c)=>{let f=!!c.getColumnsDiff();return r||f},t=this._rowDefs.reduce(e,false);t&&this._forceRenderDataRows();let i=this._headerRowDefs.reduce(e,false);i&&this._forceRenderHeaderRows();let a=this._footerRowDefs.reduce(e,false);return a&&this._forceRenderFooterRows(),t||i||a}_switchDataSource(e){this._data=[],Si$2(this.dataSource)&&this.dataSource.disconnect(this),this._renderChangeSubscription&&(this._renderChangeSubscription.unsubscribe(),this._renderChangeSubscription=null),e||(this._dataDiffer&&this._dataDiffer.diff([]),this._rowOutlet&&this._rowOutlet.viewContainer.clear()),this._dataSource=e;}_observeRenderChanges(){if(!this.dataSource)return;let e;Si$2(this.dataSource)?e=this.dataSource.connect(this):ay(this.dataSource)?e=this.dataSource:Array.isArray(this.dataSource)&&(e=ra(this.dataSource)),this._renderChangeSubscription=gy([e,this.viewChange]).pipe(da(this._onDestroy)).subscribe(([t,i])=>{this._data=t||[],this._renderedRange=i,this._dataStream.next(t),this.renderRows();});}_forceRenderHeaderRows(){this._headerRowOutlet.viewContainer.length>0&&this._headerRowOutlet.viewContainer.clear(),this._headerRowDefs.forEach((e,t)=>this._renderRow(this._headerRowOutlet,e,t)),this.updateStickyHeaderRowStyles();}_forceRenderFooterRows(){this._footerRowOutlet.viewContainer.length>0&&this._footerRowOutlet.viewContainer.clear(),this._footerRowDefs.forEach((e,t)=>this._renderRow(this._footerRowOutlet,e,t)),this.updateStickyFooterRowStyles();}_addStickyColumnStyles(e,t){let i=Array.from(t?.columns||[]).map(c=>{let f=this._columnDefsByName.get(c);return f}),a=i.map(c=>c.sticky),r=i.map(c=>c.stickyEnd);this._stickyStyler.updateStickyColumns(e,a,r,!this.fixedLayout||this._forceRecalculateCellWidths);}_getRenderedRows(e){let t=[];for(let i=0;i<e.viewContainer.length;i++){let a=e.viewContainer.get(i);t.push(a.rootNodes[0]);}return t}_getRowDefs(e,t){if(this._rowDefs.length===1)return [this._rowDefs[0]];let i=[];if(this.multiTemplateDataRows)i=this._rowDefs.filter(a=>!a.when||a.when(t,e));else {let a=this._rowDefs.find(r=>r.when&&r.when(t,e))||this._defaultRowDef;a&&i.push(a);}return i.length,i}_getEmbeddedViewArgs(e,t){let i=e.rowDef,a={$implicit:e.data};return {templateRef:i.template,context:a,index:t}}_renderRow(e,t,i,a={}){let r=e.viewContainer.createEmbeddedView(t.template,a,i);return this._renderCellTemplateForItem(t,a),r}_renderCellTemplateForItem(e,t){for(let i of this._getCellTemplates(e))de.mostRecentCellOutlet&&de.mostRecentCellOutlet._viewContainer.createEmbeddedView(i,t);this._changeDetectorRef.markForCheck();}_updateRowIndexContext(){let e=this._rowOutlet.viewContainer;for(let t=0,i=e.length;t<i;t++){let r=e.get(t).context;r.count=i,r.first=t===0,r.last=t===i-1,r.even=t%2===0,r.odd=!r.even,this.multiTemplateDataRows?(r.dataIndex=this._renderRows[t].dataIndex,r.renderIndex=t):r.index=this._renderRows[t].dataIndex;}}_getCellTemplates(e){return !e||!e.columns?[]:Array.from(e.columns,t=>{let i=this._columnDefsByName.get(t);return e.extractCellTemplate(i)})}_forceRenderDataRows(){this._dataDiffer.diff([]),this._rowOutlet.viewContainer.clear(),this.renderRows();}_checkStickyStates(){let e=(t,i)=>t||i.hasStickyChanged();this._headerRowDefs.reduce(e,false)&&this.updateStickyHeaderRowStyles(),this._footerRowDefs.reduce(e,false)&&this.updateStickyFooterRowStyles(),Array.from(this._columnDefsByName.values()).reduce(e,false)&&(this._stickyColumnStylesNeedReset=true,this.updateStickyColumnStyles());}_setupStickyStyler(){let e=this._dir?this._dir.value:"ltr",t=this._injector;this._stickyStyler=new rn(this._isNativeHtmlTable,this.stickyCssClass,this._platform.isBrowser,this.needsPositionStickyOnElement,e,this,t),(this._dir?this._dir.change:ra()).pipe(da(this._onDestroy)).subscribe(i=>{this._stickyStyler.direction=i,this.updateStickyColumnStyles();});}_setupVirtualScrolling(e){let t=typeof requestAnimationFrame<"u"?iy:oy;this.viewChange.next({start:0,end:0}),e.renderedRangeStream.pipe(Ey(0,t),da(this._onDestroy)).subscribe(this.viewChange),e.attach({dataStream:this._dataStream,measureRangeSize:(i,a)=>this._measureRangeSize(i,a)}),gy([e.renderedContentOffset,this._headerRowStickyUpdates]).pipe(da(this._onDestroy)).subscribe(([i,a])=>{if(!(!a.sizes||!a.offsets||!a.elements))for(let r=0;r<a.elements.length;r++){let c=a.elements[r];if(c){let f=a.offsets[r],g=i!==0?Math.max(i-f,f):-f;for(let C of c)C.style.top=`${-g}px`;}}}),gy([e.renderedContentOffset,this._footerRowStickyUpdates]).pipe(da(this._onDestroy)).subscribe(([i,a])=>{if(!(!a.sizes||!a.offsets||!a.elements))for(let r=0;r<a.elements.length;r++){let c=a.elements[r];if(c)for(let f of c)f.style.bottom=`${i+a.offsets[r]}px`;}});}_getOwnDefs(e){return e.filter(t=>!t._table||t._table===this)}_updateNoDataRow(){let e=this._customNoDataRow||this._noDataRow;if(!e)return;let t=this._rowOutlet.viewContainer.length===0;if(t===this._isShowingNoDataRow)return;let i=this._noDataRowOutlet.viewContainer;if(t){let a=i.createEmbeddedView(e.templateRef),r=a.rootNodes[0];if(a.rootNodes.length===1&&r?.nodeType===this._document.ELEMENT_NODE){r.setAttribute("role","row"),r.classList.add(...e._contentClassNames);let c=r.querySelectorAll(e._cellSelector);for(let f=0;f<c.length;f++)c[f].classList.add(...e._cellClassNames);}}else i.clear();this._isShowingNoDataRow=t,this._changeDetectorRef.markForCheck();}_measureRangeSize(e,t){if(e.start>=e.end||t!=="vertical")return 0;let i=this.viewChange.value,a=this._rowOutlet.viewContainer;e.start<i.start||e.end>i.end;let r=e.start-i.start,c=e.end-e.start,f,g;for(let T=0;T<c;T++){let M=a.get(T+r);if(M&&M.rootNodes.length){f=g=M.rootNodes[0];break}}for(let T=c-1;T>-1;T--){let M=a.get(T+r);if(M&&M.rootNodes.length){g=M.rootNodes[M.rootNodes.length-1];break}}let C=f?.getBoundingClientRect?.(),L=g?.getBoundingClientRect?.();return C&&L?L.bottom-C.top:0}_virtualScrollEnabled(){return !this._disableVirtualScrolling&&this._virtualScrollViewport!=null}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=gw({type:n,selectors:[["cdk-table"],["table","cdk-table",""]],contentQueries:function(t,i,a){if(t&1&&yg(a,bi,5)(a,Ee,5)(a,Tt,5)(a,$e,5)(a,ln,5),t&2){let r;rC(r=oC())&&(i._noDataRow=r.first),rC(r=oC())&&(i._contentColumnDefs=r),rC(r=oC())&&(i._contentRowDefs=r),rC(r=oC())&&(i._contentHeaderRowDefs=r),rC(r=oC())&&(i._contentFooterRowDefs=r);}},hostAttrs:[1,"cdk-table"],hostVars:2,hostBindings:function(t,i){t&2&&bg("cdk-table-fixed-layout",i.fixedLayout);},inputs:{trackBy:"trackBy",dataSource:"dataSource",multiTemplateDataRows:[2,"multiTemplateDataRows","multiTemplateDataRows",Qj],fixedLayout:[2,"fixedLayout","fixedLayout",Qj],recycleRows:[2,"recycleRows","recycleRows",Qj]},outputs:{contentChanged:"contentChanged"},exportAs:["cdkTable"],features:[Lg([{provide:$,useExisting:n},{provide:We,useValue:null}])],ngContentSelectors:Hi,decls:5,vars:2,consts:[["role","rowgroup"],["headerRowOutlet",""],["rowOutlet",""],["noDataRowOutlet",""],["footerRowOutlet",""]],template:function(t,i){t&1&&(eC(Qi),tC(0),tC(1,1),Lw(2,ji,1,0),Lw(3,qi,7,0)(4,Ui,4,0)),t&2&&(LE(2),jw(i._isServer?2:-1),LE(),jw(i._isNativeHtmlTable?3:4));},dependencies:[un,mn,hn,fn],styles:[`.cdk-table-fixed-layout {
  table-layout: fixed;
}
`],encapsulation:2,changeDetection:1})}return n})();function St(n,o){return n.concat(Array.from(o))}function pi(n,o){let e=o.toUpperCase(),t=n.viewContainer.element.nativeElement;for(;t;){let i=t.nodeType===1?t.nodeName:null;if(i===e)return t;if(i==="TABLE")break;t=t.parentNode;}return null}var Ci=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=go$1({type:n});static \u0275inj=Vn({imports:[Yt]})}return n})();var $i=[[["caption"]],[["colgroup"],["col"]],"*"],Xi=["caption","colgroup, col","*"];function Gi(n,o){n&1&&tC(0,2);}function Zi(n,o){n&1&&(us(0,"thead",0),dg(1,1),Xu(),us(2,"tbody",2),dg(3,3)(4,4),Xu(),us(5,"tfoot",0),dg(6,5),Xu());}function Ki(n,o){n&1&&dg(0,1)(1,3)(2,4)(3,5);}var Mt=(()=>{class n extends pn{stickyCssClass="mat-mdc-table-sticky";needsPositionStickyOnElement=false;static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275cmp=gw({type:n,selectors:[["mat-table"],["table","mat-table",""]],hostAttrs:[1,"mat-mdc-table","mdc-data-table__table"],hostVars:2,hostBindings:function(t,i){t&2&&bg("mat-table-fixed-layout",i.fixedLayout);},exportAs:["matTable"],features:[Lg([{provide:pn,useExisting:n},{provide:$,useExisting:n},{provide:We,useValue:null}]),eg],ngContentSelectors:Xi,decls:5,vars:2,consts:[["role","rowgroup"],["headerRowOutlet",""],["role","rowgroup",1,"mdc-data-table__content"],["rowOutlet",""],["noDataRowOutlet",""],["footerRowOutlet",""]],template:function(t,i){t&1&&(eC($i),tC(0),tC(1,1),Lw(2,Gi,1,0),Lw(3,Zi,7,0)(4,Ki,4,0)),t&2&&(LE(2),jw(i._isServer?2:-1),LE(),jw(i._isNativeHtmlTable?3:4));},dependencies:[un,mn,hn,fn],styles:[`.mat-mdc-table-sticky {
  position: sticky !important;
}

mat-table {
  display: block;
}

mat-header-row {
  min-height: var(--%NS%mat-table-header-container-height, 56px);
}

mat-row {
  min-height: var(--%NS%mat-table-row-item-container-height, 52px);
}

mat-footer-row {
  min-height: var(--%NS%mat-table-footer-container-height, 52px);
}

mat-row, mat-header-row, mat-footer-row {
  display: flex;
  border-width: 0;
  border-bottom-width: 1px;
  border-style: solid;
  align-items: center;
  box-sizing: border-box;
}

mat-cell:first-of-type, mat-header-cell:first-of-type, mat-footer-cell:first-of-type {
  padding-left: 24px;
}
[dir=rtl] mat-cell:first-of-type:not(:only-of-type), [dir=rtl] mat-header-cell:first-of-type:not(:only-of-type), [dir=rtl] mat-footer-cell:first-of-type:not(:only-of-type) {
  padding-left: 0;
  padding-right: 24px;
}
mat-cell:last-of-type, mat-header-cell:last-of-type, mat-footer-cell:last-of-type {
  padding-right: 24px;
}
[dir=rtl] mat-cell:last-of-type:not(:only-of-type), [dir=rtl] mat-header-cell:last-of-type:not(:only-of-type), [dir=rtl] mat-footer-cell:last-of-type:not(:only-of-type) {
  padding-right: 0;
  padding-left: 24px;
}

mat-cell, mat-header-cell, mat-footer-cell {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  word-wrap: break-word;
  min-height: inherit;
}

.mat-mdc-table {
  min-width: 100%;
  border: 0;
  border-spacing: 0;
  table-layout: auto;
  white-space: normal;
  background-color: var(--%NS%mat-table-background-color, var(--%NS%mat-sys-surface));
}

.mat-table-fixed-layout {
  table-layout: fixed;
}

.mdc-data-table__cell {
  box-sizing: border-box;
  overflow: hidden;
  text-align: start;
  text-overflow: ellipsis;
}

.mdc-data-table__cell,
.mdc-data-table__header-cell {
  padding: 0 16px;
}

.mat-mdc-header-row {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  height: var(--%NS%mat-table-header-container-height, 56px);
  color: var(--%NS%mat-table-header-headline-color, var(--%NS%mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--%NS%mat-table-header-headline-font, var(--%NS%mat-sys-title-small-font, Roboto, sans-serif));
  line-height: var(--%NS%mat-table-header-headline-line-height, var(--%NS%mat-sys-title-small-line-height));
  font-size: var(--%NS%mat-table-header-headline-size, var(--%NS%mat-sys-title-small-size, 14px));
  font-weight: var(--%NS%mat-table-header-headline-weight, var(--%NS%mat-sys-title-small-weight, 500));
}

.mat-mdc-row {
  height: var(--%NS%mat-table-row-item-container-height, 52px);
  color: var(--%NS%mat-table-row-item-label-text-color, var(--%NS%mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
}

.mat-mdc-row,
.mdc-data-table__content {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: var(--%NS%mat-table-row-item-label-text-font, var(--%NS%mat-sys-body-medium-font, Roboto, sans-serif));
  line-height: var(--%NS%mat-table-row-item-label-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-table-row-item-label-text-size, var(--%NS%mat-sys-body-medium-size, 14px));
  font-weight: var(--%NS%mat-table-row-item-label-text-weight, var(--%NS%mat-sys-body-medium-weight));
}

.mat-mdc-footer-row {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  height: var(--%NS%mat-table-footer-container-height, 52px);
  color: var(--%NS%mat-table-row-item-label-text-color, var(--%NS%mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--%NS%mat-table-footer-supporting-text-font, var(--%NS%mat-sys-body-medium-font, Roboto, sans-serif));
  line-height: var(--%NS%mat-table-footer-supporting-text-line-height, var(--%NS%mat-sys-body-medium-line-height));
  font-size: var(--%NS%mat-table-footer-supporting-text-size, var(--%NS%mat-sys-body-medium-size, 14px));
  font-weight: var(--%NS%mat-table-footer-supporting-text-weight, var(--%NS%mat-sys-body-medium-weight));
  letter-spacing: var(--%NS%mat-table-footer-supporting-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
}

.mat-mdc-header-cell {
  border-bottom-color: var(--%NS%mat-table-row-item-outline-color, var(--%NS%mat-sys-outline, rgba(0, 0, 0, 0.12)));
  border-bottom-width: var(--%NS%mat-table-row-item-outline-width, 1px);
  border-bottom-style: solid;
  letter-spacing: var(--%NS%mat-table-header-headline-tracking, var(--%NS%mat-sys-title-small-tracking));
  font-weight: inherit;
  line-height: inherit;
  box-sizing: border-box;
  text-overflow: ellipsis;
  overflow: hidden;
  outline: none;
  text-align: start;
}
.mdc-data-table__row:last-child > .mat-mdc-header-cell {
  border-bottom: none;
}

.mat-mdc-cell {
  border-bottom-color: var(--%NS%mat-table-row-item-outline-color, var(--%NS%mat-sys-outline, rgba(0, 0, 0, 0.12)));
  border-bottom-width: var(--%NS%mat-table-row-item-outline-width, 1px);
  border-bottom-style: solid;
  letter-spacing: var(--%NS%mat-table-row-item-label-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
  line-height: inherit;
}
.mdc-data-table__row:last-child > .mat-mdc-cell {
  border-bottom: none;
}

.mat-mdc-footer-cell {
  letter-spacing: var(--%NS%mat-table-row-item-label-text-tracking, var(--%NS%mat-sys-body-medium-tracking));
}

mat-row.mat-mdc-row,
mat-header-row.mat-mdc-header-row,
mat-footer-row.mat-mdc-footer-row {
  border-bottom: none;
}

.mat-mdc-table tbody,
.mat-mdc-table tfoot,
.mat-mdc-table thead,
.mat-mdc-cell,
.mat-mdc-footer-cell,
.mat-mdc-header-row,
.mat-mdc-row,
.mat-mdc-footer-row,
.mat-mdc-table .mat-mdc-header-cell {
  background: inherit;
}

.mat-mdc-table mat-header-row.mat-mdc-header-row,
.mat-mdc-table mat-row.mat-mdc-row,
.mat-mdc-table mat-footer-row.mat-mdc-footer-cell {
  height: unset;
}

mat-header-cell.mat-mdc-header-cell,
mat-cell.mat-mdc-cell,
mat-footer-cell.mat-mdc-footer-cell {
  align-self: stretch;
}
`],encapsulation:2,changeDetection:1})}return n})(),Nt=(()=>{class n extends xt{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","matCellDef",""]],features:[Lg([{provide:xt,useExisting:n}]),eg]})}return n})(),Et=(()=>{class n extends kt{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","matHeaderCellDef",""]],features:[Lg([{provide:kt,useExisting:n}]),eg]})}return n})();var Ot=(()=>{class n extends Ee{get name(){return this._name}set name(e){this._setNameInput(e);}_updateColumnCssClassName(){super._updateColumnCssClassName(),this._columnCssClassName.push(`mat-column-${this.cssClassFriendlyName}`);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","matColumnDef",""]],inputs:{name:[0,"matColumnDef","name"]},features:[Lg([{provide:Ee,useExisting:n}]),eg]})}return n})(),Ft=(()=>{class n extends _i{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["mat-header-cell"],["th","mat-header-cell",""]],hostAttrs:["role","columnheader",1,"mat-mdc-header-cell","mdc-data-table__header-cell"],features:[eg]})}return n})();var It=(()=>{class n extends yi{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["mat-cell"],["td","mat-cell",""]],hostAttrs:[1,"mat-mdc-cell","mdc-data-table__cell"],features:[eg]})}return n})();var At=(()=>{class n extends $e{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","matHeaderRowDef",""]],inputs:{columns:[0,"matHeaderRowDef","columns"],sticky:[2,"matHeaderRowDefSticky","sticky",Qj]},features:[Lg([{provide:$e,useExisting:n}]),eg]})}return n})();var Pt=(()=>{class n extends Tt{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","matRowDef",""]],inputs:{columns:[0,"matRowDefColumns","columns"],when:[0,"matRowDefWhen","when"]},features:[Lg([{provide:Tt,useExisting:n}]),eg]})}return n})(),Bt=(()=>{class n extends dn{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275cmp=gw({type:n,selectors:[["mat-header-row"],["tr","mat-header-row",""]],hostAttrs:["role","row",1,"mat-mdc-header-row","mdc-data-table__header-row"],exportAs:["matHeaderRow"],features:[Lg([{provide:dn,useExisting:n}]),eg],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&dg(0,0);},dependencies:[de],encapsulation:2,changeDetection:1})}return n})();var Lt=(()=>{class n extends cn{static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275cmp=gw({type:n,selectors:[["mat-row"],["tr","mat-row",""]],hostAttrs:["role","row",1,"mat-mdc-row","mdc-data-table__row"],exportAs:["matRow"],features:[Lg([{provide:cn,useExisting:n}]),eg],decls:1,vars:0,consts:[["cdkCellOutlet",""]],template:function(t,i){t&1&&dg(0,0);},dependencies:[de],encapsulation:2,changeDetection:1})}return n})();var Vt=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=go$1({type:n});static \u0275inj=Vn({imports:[Ci,j2]})}return n})();function Yi(n,o){}var re=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;positionStrategy;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;scrollStrategy;closeOnNavigation=true;closeOnDestroy=true;closeOnOverlayDetachments=true;disableAnimations=false;providers;container;templateContext;bindings};var _n=(()=>{class n extends Nt$1{_elementRef=g(lr);_focusTrapFactory=g(zs);_config;_interactivityChecker=g(rr);_ngZone=g(we);_focusMonitor=g(Vs);_renderer=g(Sh);_changeDetectorRef=g(ub);_injector=g(ue);_platform=g(mT);_document=g(he);_portalOutlet;_focusTrapped=new oe;_focusTrap=null;_elementFocusedBeforeDialogWasOpened=null;_closeInteractionType=null;_ariaLabelledByQueue=[];_isDestroyed=false;constructor(){super(),this._config=g(re,{optional:true})||new re,this._config.ariaLabelledBy&&this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);}_addAriaLabelledBy(e){this._ariaLabelledByQueue.push(e),this._changeDetectorRef.markForCheck();}_removeAriaLabelledBy(e){let t=this._ariaLabelledByQueue.indexOf(e);t>-1&&(this._ariaLabelledByQueue.splice(t,1),this._changeDetectorRef.markForCheck());}_contentAttached(){this._initializeFocusTrap(),this._captureInitialFocus();}_captureInitialFocus(){this._trapFocus();}ngOnDestroy(){this._focusTrapped.complete(),this._isDestroyed=true,this._restoreFocus();}attachComponentPortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachComponentPortal(e);return this._contentAttached(),t}attachTemplatePortal(e){this._portalOutlet.hasAttached();let t=this._portalOutlet.attachTemplatePortal(e);return this._contentAttached(),t}attachDomPortal=e=>{this._portalOutlet.hasAttached();let t=this._portalOutlet.attachDomPortal(e);return this._contentAttached(),t};_recaptureFocus(){this._containsFocus()||this._trapFocus();}_forceFocus(e,t){this._interactivityChecker.isFocusable(e)||(e.tabIndex=-1,this._ngZone.runOutsideAngular(()=>{let i=()=>{a(),r(),e.removeAttribute("tabindex");},a=this._renderer.listen(e,"blur",i),r=this._renderer.listen(e,"mousedown",i);})),e.focus(t);}_focusByCssSelector(e,t){let i=this._elementRef.nativeElement.querySelector(e);i&&this._forceFocus(i,t);}_trapFocus(e){this._isDestroyed||fE(()=>{let t=this._elementRef.nativeElement;switch(this._config.autoFocus){case  false:case "dialog":this._containsFocus()||t.focus(e);break;case  true:case "first-tabbable":this._focusTrap?.focusInitialElement(e)||this._focusDialogContainer(e);break;case "first-heading":this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]',e);break;default:this._focusByCssSelector(this._config.autoFocus,e);break}this._focusTrapped.next();},{injector:this._injector});}_restoreFocus(){let e=this._config.restoreFocus,t=null;if(typeof e=="string"?t=this._document.querySelector(e):typeof e=="boolean"?t=e?this._elementFocusedBeforeDialogWasOpened:null:e&&(t=e),this._config.restoreFocus&&t&&typeof t.focus=="function"){let i=hT(),a=this._elementRef.nativeElement;(!i||i===this._document.body||i===a||a.contains(i))&&(this._focusMonitor?(this._focusMonitor.focusVia(t,this._closeInteractionType),this._closeInteractionType=null):t.focus());}this._focusTrap&&this._focusTrap.destroy();}_focusDialogContainer(e){this._elementRef.nativeElement.focus?.(e);}_containsFocus(){let e=this._elementRef.nativeElement,t=hT();return e===t||e.contains(t)}_initializeFocusTrap(){this._platform.isBrowser&&(this._focusTrap=this._focusTrapFactory.create(this._elementRef.nativeElement),this._document&&(this._elementFocusedBeforeDialogWasOpened=hT()));}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=gw({type:n,selectors:[["cdk-dialog-container"]],viewQuery:function(t,i){if(t&1&&vg(vi$1,7),t&2){let a;rC(a=oC())&&(i._portalOutlet=a.first);}},hostAttrs:["tabindex","-1",1,"cdk-dialog-container"],hostVars:6,hostBindings:function(t,i){t&2&&Qu("id",i._config.id||null)("role",i._config.role)("aria-modal",i._config.ariaModal)("aria-labelledby",i._config.ariaLabel?null:i._ariaLabelledByQueue[0])("aria-label",i._config.ariaLabel)("aria-describedby",i._config.ariaDescribedBy||null);},features:[eg],decls:1,vars:0,consts:[["cdkPortalOutlet",""]],template:function(t,i){t&1&&ng(0,Yi,0,0,"ng-template",0);},dependencies:[vi$1],styles:[`.cdk-dialog-container {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
}
`],encapsulation:2,changeDetection:1})}return n})(),Xe=class{overlayRef;config;componentInstance=null;componentRef=null;containerInstance;disableClose;closed=new oe;backdropClick;keydownEvents;outsidePointerEvents;id;_detachSubscription;constructor(o,e){this.overlayRef=o,this.config=e,this.disableClose=e.disableClose,this.backdropClick=o.backdropClick(),this.keydownEvents=o.keydownEvents(),this.outsidePointerEvents=o.outsidePointerEvents(),this.id=e.id,this.keydownEvents.subscribe(t=>{t.keyCode===27&&!this.disableClose&&!cr(t)&&(t.preventDefault(),this.close(void 0,{focusOrigin:"keyboard"}));}),this.backdropClick.subscribe(()=>{!this.disableClose&&this._canClose()?this.close(void 0,{focusOrigin:"mouse"}):this.containerInstance._recaptureFocus?.();}),this._detachSubscription=o.detachments().subscribe(()=>{e.closeOnOverlayDetachments!==false&&this.close();});}close(o,e){if(this._canClose(o)){let t=this.closed;this.containerInstance._closeInteractionType=e?.focusOrigin||"program",this._detachSubscription.unsubscribe(),this.overlayRef.dispose(),t.next(o),t.complete(),this.componentInstance=this.containerInstance=null;}}updatePosition(){return this.overlayRef.updatePosition(),this}updateSize(o="",e=""){return this.overlayRef.updateSize({width:o,height:e}),this}addPanelClass(o){return this.overlayRef.addPanelClass(o),this}removePanelClass(o){return this.overlayRef.removePanelClass(o),this}_canClose(o){let e=this.config;return !!this.containerInstance&&(!e.closePredicate||e.closePredicate(o,e,this.componentInstance))}},Ji=new C("DialogScrollStrategy",{providedIn:"root",factory:()=>{let n=g(ue);return ()=>Ye(n)}}),eo=new C("DialogData"),to=new C("DefaultDialogConfig");function no(n){let o=fn$1(n),e=new Ne$1;return {valueSignal:o,get value(){return o()},change:e,ngOnDestroy(){e.complete();}}}var yn=(()=>{class n{_injector=g(ue);_defaultOptions=g(to,{optional:true});_parentDialog=g(n,{optional:true,skipSelf:true});_overlayContainer=g(qe);_idGenerator=g(ln$1);_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new oe;_afterOpenedAtThisLevel=new oe;_ariaHiddenElements=new Map;_scrollStrategy=g(Ji);get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}afterAllClosed=yy(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(xy(void 0)));open(e,t){let i=this._defaultOptions||new re;t=V(V({},i),t),t.id=t.id||this._idGenerator.getId("cdk-dialog-"),t.id&&this.getDialogById(t.id);let a=this._getOverlayConfig(t),r=Qt$1(this._injector,a),c=new Xe(r,t),f=this._attachContainer(r,c,t);if(c.containerInstance=f,!this.openDialogs.length){let g=this._overlayContainer.getContainerElement();f._focusTrapped?f._focusTrapped.pipe(Rn(1)).subscribe(()=>{this._hideNonDialogContentFromAssistiveTechnology(g);}):this._hideNonDialogContentFromAssistiveTechnology(g);}return this._attachDialogContent(e,c,f,t),this.openDialogs.push(c),c.closed.subscribe(()=>this._removeOpenDialog(c,true)),this.afterOpened.next(c),c}closeAll(){gn(this.openDialogs,e=>e.close());}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){gn(this._openDialogsAtThisLevel,e=>{e.config.closeOnDestroy===false&&this._removeOpenDialog(e,false);}),gn(this._openDialogsAtThisLevel,e=>e.close()),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete(),this._openDialogsAtThisLevel=[];}_getOverlayConfig(e){let t=new ct({positionStrategy:e.positionStrategy||Qe().centerHorizontally().centerVertically(),scrollStrategy:e.scrollStrategy||this._scrollStrategy(),panelClass:e.panelClass,hasBackdrop:e.hasBackdrop,direction:e.direction,minWidth:e.minWidth,minHeight:e.minHeight,maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height,disposeOnNavigation:e.closeOnNavigation,disableAnimations:e.disableAnimations});return e.backdropClass&&(t.backdropClass=e.backdropClass),t}_attachContainer(e,t,i){let a=i.injector||i.viewContainerRef?.injector,r=[{provide:re,useValue:i},{provide:Xe,useValue:t},{provide:Dt$1,useValue:e}],c;i.container?typeof i.container=="function"?c=i.container:(c=i.container.type,r.push(...i.container.providers(i))):c=_n;let f=new jt$1(c,i.viewContainerRef,ue.create({parent:a||this._injector,providers:r}));return e.attach(f).instance}_attachDialogContent(e,t,i,a){if(e instanceof ir){let r=this._createInjector(a,t,i,void 0),c={$implicit:a.data,dialogRef:t};a.templateContext&&(c=V(V({},c),typeof a.templateContext=="function"?a.templateContext():a.templateContext)),i.attachTemplatePortal(new at(e,null,c,r));}else {let r=this._createInjector(a,t,i,this._injector),c=i.attachComponentPortal(new jt$1(e,a.viewContainerRef,r,null,a.bindings));t.componentRef=c,t.componentInstance=c.instance;}}_createInjector(e,t,i,a){let r=e.injector||e.viewContainerRef?.injector,c=[{provide:eo,useValue:e.data},{provide:Xe,useValue:t}];return e.providers&&(typeof e.providers=="function"?c.push(...e.providers(t,e,i)):c.push(...e.providers)),e.direction&&(!r||!r.get(ET,null,{optional:true}))&&c.push({provide:ET,useValue:no(e.direction)}),ue.create({parent:r||a,providers:c})}_removeOpenDialog(e,t){let i=this.openDialogs.indexOf(e);i>-1&&(this.openDialogs.splice(i,1),this.openDialogs.length||(this._ariaHiddenElements.forEach((a,r)=>{a?r.setAttribute("aria-hidden",a):r.removeAttribute("aria-hidden");}),this._ariaHiddenElements.clear(),t&&this._getAfterAllClosed().next()));}_hideNonDialogContentFromAssistiveTechnology(e){if(e.parentElement){let t=e.parentElement.children;for(let i=t.length-1;i>-1;i--){let a=t[i];a!==e&&a.nodeName!=="SCRIPT"&&a.nodeName!=="STYLE"&&!a.hasAttribute("aria-live")&&!a.hasAttribute("popover")&&(this._ariaHiddenElements.set(a,a.getAttribute("aria-hidden")),a.setAttribute("aria-hidden","true"));}}}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ee$1({token:n,factory:n.\u0275fac})}return n})();function gn(n,o){let e=n.length;for(;e--;)o(n[e]);}var Di=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=go$1({type:n});static \u0275inj=Vn({providers:[yn],imports:[Rn$1,Ae,Ys,Ae]})}return n})();function io(n,o){}var Qt=class{viewContainerRef;injector;id;role="dialog";panelClass="";hasBackdrop=true;backdropClass="";disableClose=false;closePredicate;width="";height="";minWidth;minHeight;maxWidth;maxHeight;position;data=null;direction;ariaDescribedBy=null;ariaLabelledBy=null;ariaLabel=null;ariaModal=false;autoFocus="first-tabbable";restoreFocus=true;delayFocusTrap=true;scrollStrategy;closeOnNavigation=true;enterAnimationDuration;exitAnimationDuration;bindings},bn="mdc-dialog--open",Si="mdc-dialog--opening",Ri="mdc-dialog--closing",oo=150,ao=75,ro=(()=>{class n extends _n{_animationStateChanged=new Ne$1;_animationsEnabled=!Ct();_actionSectionCount=0;_hostElement=this._elementRef.nativeElement;_enterAnimationDuration=this._animationsEnabled?ki(this._config.enterAnimationDuration)??oo:0;_exitAnimationDuration=this._animationsEnabled?ki(this._config.exitAnimationDuration)??ao:0;_animationTimer=null;_contentAttached(){super._contentAttached(),this._startOpenAnimation();}_startOpenAnimation(){this._animationStateChanged.emit({state:"opening",totalTime:this._enterAnimationDuration}),this._animationsEnabled?(this._hostElement.style.setProperty(xi,`${this._enterAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Si,bn)),this._waitForAnimationToComplete(this._enterAnimationDuration,this._finishDialogOpen)):(this._hostElement.classList.add(bn),Promise.resolve().then(()=>this._finishDialogOpen()));}_startExitAnimation(){this._animationStateChanged.emit({state:"closing",totalTime:this._exitAnimationDuration}),this._hostElement.classList.remove(bn),this._animationsEnabled?(this._hostElement.style.setProperty(xi,`${this._exitAnimationDuration}ms`),this._requestAnimationFrame(()=>this._hostElement.classList.add(Ri)),this._waitForAnimationToComplete(this._exitAnimationDuration,this._finishDialogClose)):Promise.resolve().then(()=>this._finishDialogClose());}_updateActionSectionCount(e){this._actionSectionCount+=e,this._changeDetectorRef.markForCheck();}_finishDialogOpen=()=>{this._clearAnimationClasses(),this._openAnimationDone(this._enterAnimationDuration);};_finishDialogClose=()=>{this._clearAnimationClasses(),this._animationStateChanged.emit({state:"closed",totalTime:this._exitAnimationDuration});};_clearAnimationClasses(){this._hostElement.classList.remove(Si,Ri);}_waitForAnimationToComplete(e,t){this._animationTimer!==null&&clearTimeout(this._animationTimer),this._animationTimer=setTimeout(t,e);}_requestAnimationFrame(e){this._ngZone.runOutsideAngular(()=>{typeof requestAnimationFrame=="function"?requestAnimationFrame(e):e();});}_captureInitialFocus(){this._config.delayFocusTrap||this._trapFocus();}_openAnimationDone(e){this._config.delayFocusTrap&&this._trapFocus(),this._animationStateChanged.next({state:"opened",totalTime:e});}ngOnDestroy(){super.ngOnDestroy(),this._animationTimer!==null&&clearTimeout(this._animationTimer);}attachComponentPortal(e){let t=super.attachComponentPortal(e);return t.location.nativeElement.classList.add("mat-mdc-dialog-component-host"),t}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275cmp=gw({type:n,selectors:[["mat-dialog-container"]],hostAttrs:["tabindex","-1",1,"mat-mdc-dialog-container","mdc-dialog"],hostVars:10,hostBindings:function(t,i){t&2&&(fg("id",i._config.id),Qu("aria-modal",i._config.ariaModal)("role",i._config.role)("aria-labelledby",i._config.ariaLabel?null:i._ariaLabelledByQueue[0])("aria-label",i._config.ariaLabel)("aria-describedby",i._config.ariaDescribedBy||null),bg("_mat-animation-noopable",!i._animationsEnabled)("mat-mdc-dialog-container-with-actions",i._actionSectionCount>0));},features:[eg],decls:3,vars:0,consts:[[1,"mat-mdc-dialog-inner-container","mdc-dialog__container"],[1,"mat-mdc-dialog-surface","mdc-dialog__surface"],["cdkPortalOutlet",""]],template:function(t,i){t&1&&(us(0,"div",0)(1,"div",1),ng(2,io,0,0,"ng-template",2),Xu()());},dependencies:[vi$1],styles:[`.mat-mdc-dialog-container {
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  outline: 0;
}

.cdk-overlay-pane.mat-mdc-dialog-panel {
  max-width: var(--%NS%mat-dialog-container-max-width, 560px);
  min-width: var(--%NS%mat-dialog-container-min-width, 280px);
}
@media (max-width: 599px) {
  .cdk-overlay-pane.mat-mdc-dialog-panel {
    max-width: var(--%NS%mat-dialog-container-small-max-width, calc(100vw - 32px));
  }
}

.mat-mdc-dialog-inner-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  height: 100%;
  opacity: 0;
  transition: opacity linear var(--%NS%mat-dialog-transition-duration, 0ms);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
}
.mdc-dialog--closing .mat-mdc-dialog-inner-container {
  transition: opacity 75ms linear;
  transform: none;
}
.mdc-dialog--open .mat-mdc-dialog-inner-container {
  opacity: 1;
}
._mat-animation-noopable .mat-mdc-dialog-inner-container {
  transition: none;
}

.mat-mdc-dialog-surface {
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  outline: 0;
  transform: scale(0.8);
  transition: transform var(--%NS%mat-dialog-transition-duration, 0ms) cubic-bezier(0, 0, 0.2, 1);
  max-height: inherit;
  min-height: inherit;
  min-width: inherit;
  max-width: inherit;
  box-shadow: var(--%NS%mat-dialog-container-elevation-shadow, none);
  border-radius: var(--%NS%mat-dialog-container-shape, var(--%NS%mat-sys-corner-extra-large, 4px));
  background-color: var(--%NS%mat-dialog-container-color, var(--%NS%mat-sys-surface, white));
}
[dir=rtl] .mat-mdc-dialog-surface {
  text-align: right;
}
.mdc-dialog--open .mat-mdc-dialog-surface, .mdc-dialog--closing .mat-mdc-dialog-surface {
  transform: none;
}
._mat-animation-noopable .mat-mdc-dialog-surface {
  transition: none;
}
.mat-mdc-dialog-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}

.mat-mdc-dialog-title {
  display: block;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  margin: 0 0 1px;
  padding: var(--%NS%mat-dialog-headline-padding, 6px 24px 13px);
}
.mat-mdc-dialog-title::before {
  display: inline-block;
  width: 0;
  height: 40px;
  content: "";
  vertical-align: 0;
}
[dir=rtl] .mat-mdc-dialog-title {
  text-align: right;
}
.mat-mdc-dialog-container .mat-mdc-dialog-title {
  color: var(--%NS%mat-dialog-subhead-color, var(--%NS%mat-sys-on-surface, rgba(0, 0, 0, 0.87)));
  font-family: var(--%NS%mat-dialog-subhead-font, var(--%NS%mat-sys-headline-small-font, inherit));
  line-height: var(--%NS%mat-dialog-subhead-line-height, var(--%NS%mat-sys-headline-small-line-height, 1.5rem));
  font-size: var(--%NS%mat-dialog-subhead-size, var(--%NS%mat-sys-headline-small-size, 1rem));
  font-weight: var(--%NS%mat-dialog-subhead-weight, var(--%NS%mat-sys-headline-small-weight, 400));
  letter-spacing: var(--%NS%mat-dialog-subhead-tracking, var(--%NS%mat-sys-headline-small-tracking, 0.03125em));
}

.mat-mdc-dialog-content {
  display: block;
  flex-grow: 1;
  box-sizing: border-box;
  margin: 0;
  overflow: auto;
  max-height: 65vh;
}
.mat-mdc-dialog-content > :first-child {
  margin-top: 0;
}
.mat-mdc-dialog-content > :last-child {
  margin-bottom: 0;
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  color: var(--%NS%mat-dialog-supporting-text-color, var(--%NS%mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6)));
  font-family: var(--%NS%mat-dialog-supporting-text-font, var(--%NS%mat-sys-body-medium-font, inherit));
  line-height: var(--%NS%mat-dialog-supporting-text-line-height, var(--%NS%mat-sys-body-medium-line-height, 1.5rem));
  font-size: var(--%NS%mat-dialog-supporting-text-size, var(--%NS%mat-sys-body-medium-size, 1rem));
  font-weight: var(--%NS%mat-dialog-supporting-text-weight, var(--%NS%mat-sys-body-medium-weight, 400));
  letter-spacing: var(--%NS%mat-dialog-supporting-text-tracking, var(--%NS%mat-sys-body-medium-tracking, 0.03125em));
}
.mat-mdc-dialog-container .mat-mdc-dialog-content {
  padding: var(--%NS%mat-dialog-content-padding, 20px 24px);
}
.mat-mdc-dialog-container-with-actions .mat-mdc-dialog-content {
  padding: var(--%NS%mat-dialog-with-actions-content-padding, 20px 24px 0);
}
.mat-mdc-dialog-container .mat-mdc-dialog-title + .mat-mdc-dialog-content {
  padding-top: 0;
}

.mat-mdc-dialog-actions {
  display: flex;
  position: relative;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  min-height: 52px;
  margin: 0;
  border-top: 1px solid transparent;
  padding: var(--%NS%mat-dialog-actions-padding, 16px 24px);
  justify-content: var(--%NS%mat-dialog-actions-alignment, flex-end);
}
@media (forced-colors: active) {
  .mat-mdc-dialog-actions {
    border-top-color: CanvasText;
  }
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-start, .mat-mdc-dialog-actions[align=start] {
  justify-content: start;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-center, .mat-mdc-dialog-actions[align=center] {
  justify-content: center;
}
.mat-mdc-dialog-actions.mat-mdc-dialog-actions-align-end, .mat-mdc-dialog-actions[align=end] {
  justify-content: flex-end;
}
.mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
.mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 8px;
}
[dir=rtl] .mat-mdc-dialog-actions .mat-button-base + .mat-button-base,
[dir=rtl] .mat-mdc-dialog-actions .mat-mdc-button-base + .mat-mdc-button-base {
  margin-left: 0;
  margin-right: 8px;
}

.mat-mdc-dialog-component-host {
  display: contents;
}
`],encapsulation:2,changeDetection:1})}return n})(),xi="--mat-dialog-transition-duration";function ki(n){return n==null?null:typeof n=="number"?n:n.endsWith("ms")?en(n.substring(0,n.length-2)):n.endsWith("s")?en(n.substring(0,n.length-1))*1e3:n==="0"?0:null}var zt=(function(n){return n[n.OPEN=0]="OPEN",n[n.CLOSING=1]="CLOSING",n[n.CLOSED=2]="CLOSED",n})(zt||{}),Oe=class{_ref;_config;_containerInstance;componentInstance;componentRef=null;disableClose;id;_afterOpened=new Ut$1(1);_beforeClosed=new Ut$1(1);_result;_closeFallbackTimeout;_state=zt.OPEN;_closeInteractionType;constructor(o,e,t){this._ref=o,this._config=e,this._containerInstance=t,this.disableClose=e.disableClose,this.id=o.id,o.addPanelClass("mat-mdc-dialog-panel"),t._animationStateChanged.pipe(mt(i=>i.state==="opened"),Rn(1)).subscribe(()=>{this._afterOpened.next(),this._afterOpened.complete();}),t._animationStateChanged.pipe(mt(i=>i.state==="closed"),Rn(1)).subscribe(()=>{clearTimeout(this._closeFallbackTimeout),this._finishDialogClose();}),o.overlayRef.detachments().subscribe(()=>{this._beforeClosed.next(this._result),this._beforeClosed.complete(),this._finishDialogClose();}),Dy(this.backdropClick(),this.keydownEvents().pipe(mt(i=>i.keyCode===27&&!this.disableClose&&!cr(i)))).subscribe(i=>{this.disableClose||(i.preventDefault(),so(this,i.type==="keydown"?"keyboard":"mouse"));});}close(o){let e=this._config.closePredicate;e&&!e(o,this._config,this.componentInstance)||(this._result=o,this._containerInstance._animationStateChanged.pipe(mt(t=>t.state==="closing"),Rn(1)).subscribe(t=>{this._beforeClosed.next(o),this._beforeClosed.complete(),this._ref.overlayRef.detachBackdrop(),this._closeFallbackTimeout=setTimeout(()=>this._finishDialogClose(),t.totalTime+100);}),this._state=zt.CLOSING,this._containerInstance._startExitAnimation());}afterOpened(){return this._afterOpened}afterClosed(){return this._ref.closed}beforeClosed(){return this._beforeClosed}backdropClick(){return this._ref.backdropClick}keydownEvents(){return this._ref.keydownEvents}updatePosition(o){let e=this._ref.config.positionStrategy;return o&&(o.left||o.right)?o.left?e.left(o.left):e.right(o.right):e.centerHorizontally(),o&&(o.top||o.bottom)?o.top?e.top(o.top):e.bottom(o.bottom):e.centerVertically(),this._ref.updatePosition(),this}updateSize(o="",e=""){return this._ref.updateSize(o,e),this}addPanelClass(o){return this._ref.addPanelClass(o),this}removePanelClass(o){return this._ref.removePanelClass(o),this}getState(){return this._state}_finishDialogClose(){this._state=zt.CLOSED,this._ref.close(this._result,{focusOrigin:this._closeInteractionType}),this.componentInstance=null;}};function so(n,o,e){return n._closeInteractionType=o,n.close(e)}var lo=new C("MatMdcDialogData"),co=new C("mat-mdc-dialog-default-options"),mo=new C("mat-mdc-dialog-scroll-strategy",{providedIn:"root",factory:()=>{let n=g(ue);return ()=>Ye(n)}}),Ht=(()=>{class n{_defaultOptions=g(co,{optional:true});_scrollStrategy=g(mo);_parentDialog=g(n,{optional:true,skipSelf:true});_idGenerator=g(ln$1);_injector=g(ue);_dialog=g(yn);_animationsDisabled=Ct();_openDialogsAtThisLevel=[];_afterAllClosedAtThisLevel=new oe;_afterOpenedAtThisLevel=new oe;dialogConfigClass=Qt;_dialogRefConstructor;_dialogContainerType;_dialogDataToken;get openDialogs(){return this._parentDialog?this._parentDialog.openDialogs:this._openDialogsAtThisLevel}get afterOpened(){return this._parentDialog?this._parentDialog.afterOpened:this._afterOpenedAtThisLevel}_getAfterAllClosed(){let e=this._parentDialog;return e?e._getAfterAllClosed():this._afterAllClosedAtThisLevel}afterAllClosed=yy(()=>this.openDialogs.length?this._getAfterAllClosed():this._getAfterAllClosed().pipe(xy(void 0)));constructor(){this._dialogRefConstructor=Oe,this._dialogContainerType=ro,this._dialogDataToken=lo;}open(e,t){let i;t=V(V({},this._defaultOptions||new Qt),t),t.id=t.id||this._idGenerator.getId("mat-mdc-dialog-"),t.scrollStrategy=t.scrollStrategy||this._scrollStrategy();let a=this._dialog.open(e,q(V({},t),{positionStrategy:Qe(this._injector).centerHorizontally().centerVertically(),disableClose:true,closePredicate:void 0,closeOnDestroy:false,closeOnOverlayDetachments:false,disableAnimations:this._animationsDisabled||t.enterAnimationDuration?.toLocaleString()==="0"||t.exitAnimationDuration?.toString()==="0",container:{type:this._dialogContainerType,providers:()=>[{provide:this.dialogConfigClass,useValue:t},{provide:re,useValue:t}]},templateContext:()=>({dialogRef:i}),providers:(r,c,f)=>(i=new this._dialogRefConstructor(r,t,f),i.updatePosition(t?.position),[{provide:this._dialogContainerType,useValue:f},{provide:this._dialogDataToken,useValue:c.data},{provide:this._dialogRefConstructor,useValue:i}])}));return i.componentRef=a.componentRef,i.componentInstance=a.componentInstance,this.openDialogs.push(i),this.afterOpened.next(i),i.afterClosed().subscribe(()=>{let r=this.openDialogs.indexOf(i);r>-1&&(this.openDialogs.splice(r,1),this.openDialogs.length||this._getAfterAllClosed().next());}),i}closeAll(){this._closeDialogs(this.openDialogs);}getDialogById(e){return this.openDialogs.find(t=>t.id===e)}ngOnDestroy(){this._closeDialogs(this._openDialogsAtThisLevel),this._afterAllClosedAtThisLevel.complete(),this._afterOpenedAtThisLevel.complete();}_closeDialogs(e){let t=e.length;for(;t--;)e[t].close();}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ee$1({token:n,factory:n.\u0275fac})}return n})();var Ti=(()=>{class n{_dialogRef=g(Oe,{optional:true});_elementRef=g(lr);_dialog=g(Ht);ngOnInit(){this._dialogRef||(this._dialogRef=uo(this._elementRef,this._dialog.openDialogs)),this._dialogRef&&Promise.resolve().then(()=>{this._onAdd();});}ngOnDestroy(){this._dialogRef?._containerInstance&&Promise.resolve().then(()=>{this._onRemove();});}static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n})}return n})(),Mi=(()=>{class n extends Ti{id=g(ln$1).getId("mat-mdc-dialog-title-");_onAdd(){this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);}_onRemove(){this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","mat-dialog-title",""],["","matDialogTitle",""]],hostAttrs:[1,"mat-mdc-dialog-title","mdc-dialog__title"],hostVars:1,hostBindings:function(t,i){t&2&&fg("id",i.id);},inputs:{id:"id"},exportAs:["matDialogTitle"],features:[eg]})}return n})(),Ni=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=ws({type:n,selectors:[["","mat-dialog-content",""],["mat-dialog-content"],["","matDialogContent",""]],hostAttrs:[1,"mat-mdc-dialog-content","mdc-dialog__content"],features:[Iw([yn$1])]})}return n})(),Ei=(()=>{class n extends Ti{align;_onAdd(){this._dialogRef._containerInstance?._updateActionSectionCount?.(1);}_onRemove(){this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);}static \u0275fac=(()=>{let e;return function(i){return (e||(e=Cp(n)))(i||n)}})();static \u0275dir=ws({type:n,selectors:[["","mat-dialog-actions",""],["mat-dialog-actions"],["","matDialogActions",""]],hostAttrs:[1,"mat-mdc-dialog-actions","mdc-dialog__actions"],hostVars:6,hostBindings:function(t,i){t&2&&bg("mat-mdc-dialog-actions-align-start",i.align==="start")("mat-mdc-dialog-actions-align-center",i.align==="center")("mat-mdc-dialog-actions-align-end",i.align==="end");},inputs:{align:"align"},features:[eg]})}return n})();function uo(n,o){let e=n.nativeElement.parentElement;for(;e&&!e.classList.contains("mat-mdc-dialog-container");)e=e.parentElement;return e?o.find(t=>t.id===e.id):null}var Oi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=go$1({type:n});static \u0275inj=Vn({providers:[Ht],imports:[Di,Rn$1,Ae,j2]})}return n})();function Ge(n){return String(n??"").trim()}function jt(n){let o=Ge(n);return o===""?null:Number(o)}function qt(n,o){return Ge(n)===Ge(o)}function po(n,o){n&1&&(us(0,"mat-error"),MC(1,"Name is required"),Xu());}function go(n,o){if(n&1&&(us(0,"mat-option",5),MC(1),Xu()),n&2){let e=o.$implicit;ag("value",e),LE(),xg(e);}}function _o(n,o){n&1&&(us(0,"mat-error"),MC(1,"Plugin is required"),Xu());}var Ut=class n{fb=g(Ma);ref=g(Oe);plugins=fn$1([]);form=this.fb.nonNullable.group({name:["",Ht$2.required],plugin:["",Ht$2.required],threads:this.fb.control(null),sort:this.fb.control(null)});setPlugins(o){this.plugins.set(o);}submit(){if(this.form.invalid){this.form.markAllAsTouched();return}let o=this.form.getRawValue();this.ref.close({name:o.name.trim(),plugin:o.plugin,threads:o.threads,sort:o.sort});}cancel(){this.ref.close();}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=gw({type:n,selectors:[["app-queue-create-dialog"]],decls:38,vars:6,consts:[["mat-dialog-title",""],[3,"ngSubmit","formGroup"],["appearance","outline",1,"full-width"],["matInput","","formControlName","name","required",""],["formControlName","plugin","required",""],[3,"value"],[1,"row"],["appearance","outline"],["matInput","","type","number","formControlName","threads","min","0"],["formControlName","sort"],["align","end"],["mat-button","","type","button",3,"click"],["mat-flat-button","","color","primary","type","submit"]],template:function(e,t){e&1&&(us(0,"h2",0),MC(1,"Create new queue"),Xu(),us(2,"form",1),hg("ngSubmit",function(){return t.submit()}),us(3,"mat-dialog-content")(4,"mat-form-field",2)(5,"mat-label"),MC(6,"Name"),Xu(),cg(7,"input",3),TI(),Lw(8,po,2,0,"mat-error"),Xu(),us(9,"mat-form-field",2)(10,"mat-label"),MC(11,"Type (plugin)"),Xu(),us(12,"mat-select",4),Vw(13,go,2,2,"mat-option",5,Bw),Xu(),TI(),Lw(15,_o,2,0,"mat-error"),Xu(),us(16,"div",6)(17,"mat-form-field",7)(18,"mat-label"),MC(19,"Threads"),Xu(),cg(20,"input",8),TI(),us(21,"mat-hint"),MC(22,"blank = unlimited"),Xu()(),us(23,"mat-form-field",7)(24,"mat-label"),MC(25,"Sort"),Xu(),us(26,"mat-select",9)(27,"mat-option",5),MC(28,"default"),Xu(),us(29,"mat-option",5),MC(30,"fifo"),Xu(),us(31,"mat-option",5),MC(32,"lifo"),Xu()(),TI(),Xu()()(),us(33,"mat-dialog-actions",10)(34,"button",11),hg("click",function(){return t.cancel()}),MC(35,"Cancel"),Xu(),us(36,"button",12),MC(37,"Create"),Xu()()()),e&2&&(LE(2),ag("formGroup",t.form),LE(5),SI(),LE(),jw(t.form.controls.name.hasError("required")&&t.form.controls.name.touched?8:-1),LE(4),SI(),LE(),Hw(t.plugins()),LE(2),jw(t.form.controls.plugin.hasError("required")&&t.form.controls.plugin.touched?15:-1),LE(5),SI(),LE(6),SI(),LE(),ag("value","default"),LE(2),ag("value","fifo"),LE(2),ag("value","lifo"));},dependencies:[wa,Da,mi$2,Ds,Ea,Ca,Vi$1,os,Ns,Ss,Hn,Wn,Oi,Mi,Ei,Ni,I,Ht$1,Fe,we$1,qt$1,We$1,$e$1,Si$1,vi,j],encapsulation:2})};function bo(n,o){n&1&&(us(0,"th",17),MC(1,"ID"),Xu());}function Co(n,o){if(n&1&&(us(0,"td",18),MC(1),Xu()),n&2){let e=o.$implicit;LE(),xg(e.id);}}function vo(n,o){n&1&&(us(0,"th",17),MC(1,"Type"),Xu());}function wo(n,o){if(n&1&&(us(0,"mat-option",22),MC(1),Xu()),n&2){let e=o.$implicit;ag("value",e),LE(),xg(e);}}function Do(n,o){if(n&1){let e=qw();us(0,"td",19)(1,"mat-form-field",20)(2,"mat-select",21),hg("selectionChange",function(i){let a=Zd(e).$implicit,r=Xw();return Yd(r.commitPlugin(a,i.value))})("openedChange",function(i){Zd(e);let a=Xw();return Yd(a.editingChange.emit(i))}),Vw(3,wo,2,2,"mat-option",22,Bw),Xu()()();}if(n&2){let e=o.$implicit,t=Xw();LE(2),ag("value",e.plugin),LE(),Hw(t.plugins());}}function So(n,o){n&1&&(us(0,"th",17),MC(1,"Name"),Xu());}function Ro(n,o){if(n&1){let e=qw();us(0,"mat-form-field",20)(1,"input",24),kg("ngModelChange",function(i){Zd(e);let a=Xw(2);return RC(a.editValue,i)||(a.editValue=i),Yd(i)}),hg("keydown.enter",function(){Zd(e);let i=Xw().$implicit,a=Xw();return Yd(a.commitEdit(i,"name"))})("keydown.escape",function(){Zd(e);let i=Xw(2);return Yd(i.cancelEdit())})("blur",function(){Zd(e);let i=Xw().$implicit,a=Xw();return Yd(a.commitEdit(i,"name"))}),Xu(),TI(),Xu();}if(n&2){let e=Xw(2);LE(),Og("ngModel",e.editValue),SI();}}function xo(n,o){if(n&1&&MC(0),n&2){let e=Xw().$implicit;rl(" ",e.name," ");}}function ko(n,o){if(n&1){let e=qw();us(0,"td",23),hg("click",function(){let i=Zd(e).$implicit,a=Xw();return Yd(a.startEdit(i,"name"))}),Lw(1,Ro,2,1,"mat-form-field",20)(2,xo,1,1),Xu();}if(n&2){let e=o.$implicit,t=Xw();LE(),jw(t.isEditing(e,"name")?1:2);}}function To(n,o){n&1&&(us(0,"th",17),MC(1,"Threads"),Xu());}function Mo(n,o){if(n&1){let e=qw();us(0,"mat-form-field",20)(1,"input",25),kg("ngModelChange",function(i){Zd(e);let a=Xw(2);return RC(a.editValue,i)||(a.editValue=i),Yd(i)}),hg("keydown.enter",function(){Zd(e);let i=Xw().$implicit,a=Xw();return Yd(a.commitEdit(i,"threads"))})("keydown.escape",function(){Zd(e);let i=Xw(2);return Yd(i.cancelEdit())})("blur",function(){Zd(e);let i=Xw().$implicit,a=Xw();return Yd(a.commitEdit(i,"threads"))}),Xu(),TI(),Xu();}if(n&2){let e=Xw(2);LE(),Og("ngModel",e.editValue),SI();}}function No(n,o){if(n&1&&MC(0),n&2){let e=Xw().$implicit;rl(" ",e.threads==null?"\u2014":e.threads," ");}}function Eo(n,o){if(n&1){let e=qw();us(0,"td",23),hg("click",function(){let i=Zd(e).$implicit,a=Xw();return Yd(a.startEdit(i,"threads"))}),Lw(1,Mo,2,1,"mat-form-field",20)(2,No,1,1),Xu();}if(n&2){let e=o.$implicit,t=Xw();LE(),jw(t.isEditing(e,"threads")?1:2);}}function Oo(n,o){n&1&&(us(0,"th",17),MC(1,"Queued"),Xu());}function Fo(n,o){if(n&1&&(us(0,"td",19),MC(1),Xu()),n&2){let e=o.$implicit;LE(),xg(e.queued);}}function Io(n,o){n&1&&(us(0,"th",17),MC(1,"Running"),Xu());}function Ao(n,o){if(n&1&&(us(0,"td",19),MC(1),Xu()),n&2){let e=o.$implicit;LE(),xg(e.running);}}function Po(n,o){n&1&&(us(0,"th",17),MC(1,"Completed"),Xu());}function Bo(n,o){if(n&1&&(us(0,"td",19),MC(1),Xu()),n&2){let e=o.$implicit;LE(),xg(e.completed);}}function Lo(n,o){n&1&&cg(0,"tr",26);}function Vo(n,o){n&1&&cg(0,"tr",27);}function zo(n,o){n&1&&(us(0,"p",14),MC(1,"No queues defined."),Xu());}var Wt=class n{queuesService=g(Me);dialog=g(Ht);queues=zj([]);plugins=zj([]);changed=Gj();editingChange=Gj();columns=["id","plugin","name","threads","queued","running","completed"];editing=fn$1(null);editValue=fn$1("");isEditing(o,e){let t=this.editing();return t?.id===o.id&&t?.field===e}startEdit(o,e){this.isEditing(o,e)||(this.editing.set({id:o.id,field:e}),this.editValue.set(e==="threads"?o.threads==null?"":String(o.threads):o[e]),this.editingChange.emit(true));}cancelEdit(){this.editing()&&(this.editing.set(null),this.editingChange.emit(false));}commitEdit(o,e){if(!this.isEditing(o,e))return;this.editing.set(null),this.editingChange.emit(false);let t=this.editValue(),i=e==="threads"?o.threads:o[e];if(qt(t,i))return;let a=e==="threads"?jt(t):Ge(t);this.postUpdate(o.id,{[e]:a});}commitPlugin(o,e){e!==o.plugin&&this.postUpdate(o.id,{plugin:e});}postUpdate(o,e){this.queuesService.update(o,e).subscribe({next:()=>this.changed.emit(),error:()=>this.changed.emit()});}openNewQueue(){this.editingChange.emit(true);let o=this.dialog.open(Ut,{width:"420px"});o.componentInstance.setPlugins(this.plugins()),o.afterClosed().subscribe(e=>{this.editingChange.emit(false),e&&this.queuesService.create(e.name,e.plugin,e.threads??void 0,e.sort??void 0).subscribe({next:()=>this.changed.emit(),error:()=>this.changed.emit()});});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=gw({type:n,selectors:[["app-queue-table"]],inputs:{queues:[1,"queues"],plugins:[1,"plugins"]},outputs:{changed:"changed",editingChange:"editingChange"},decls:30,vars:4,consts:[["mat-table","",1,"disbatch-table",3,"dataSource"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","","class","mono",4,"matCellDef"],["matColumnDef","plugin"],["mat-cell","",4,"matCellDef"],["matColumnDef","name"],["mat-cell","","class","editable",3,"click",4,"matCellDef"],["matColumnDef","threads"],["matColumnDef","queued"],["matColumnDef","running"],["matColumnDef","completed"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[1,"empty-note"],[1,"table-actions"],["mat-flat-button","","color","primary",3,"click"],["mat-header-cell",""],["mat-cell","",1,"mono"],["mat-cell",""],["appearance","outline","subscriptSizing","dynamic",1,"cell-field"],[3,"selectionChange","openedChange","value"],[3,"value"],["mat-cell","",1,"editable",3,"click"],["matInput","","cdkFocusInitial","",3,"ngModelChange","keydown.enter","keydown.escape","blur","ngModel"],["matInput","","type","number","min","0","placeholder","unlimited","cdkFocusInitial","",3,"ngModelChange","keydown.enter","keydown.escape","blur","ngModel"],["mat-header-row",""],["mat-row",""]],template:function(e,t){e&1&&(us(0,"table",0),tl(1,1),ng(2,bo,2,0,"th",2)(3,Co,2,1,"td",3),nl(),tl(4,4),ng(5,vo,2,0,"th",2)(6,Do,5,1,"td",5),nl(),tl(7,6),ng(8,So,2,0,"th",2)(9,ko,3,1,"td",7),nl(),tl(10,8),ng(11,To,2,0,"th",2)(12,Eo,3,1,"td",7),nl(),tl(13,9),ng(14,Oo,2,0,"th",2)(15,Fo,2,1,"td",5),nl(),tl(16,10),ng(17,Io,2,0,"th",2)(18,Ao,2,1,"td",5),nl(),tl(19,11),ng(20,Po,2,0,"th",2)(21,Bo,2,1,"td",5),nl(),ng(22,Lo,1,0,"tr",12)(23,Vo,1,0,"tr",13),Xu(),Lw(24,zo,2,0,"p",14),us(25,"div",15)(26,"button",16),hg("click",function(){return t.openNewQueue()}),us(27,"mat-icon"),MC(28,"add"),Xu(),MC(29," New Queue "),Xu()()),e&2&&(ag("dataSource",t.queues()),LE(22),ag("matHeaderRowDef",t.columns),LE(),ag("matRowDefColumns",t.columns),LE(),jw(t.queues().length?-1:24));},dependencies:[Ia,mi$2,Ds,Ea,os,Cs,Vt,Mt,Et,At,Ot,Nt,Pt,Ft,It,Bt,Lt,I,Ht$1,We$1,$e$1,Si$1,vi,j,Hn,Wn,mi$1,di],styles:[".disbatch-table[_ngcontent-%COMP%]{width:100%;margin-bottom:8px}.mono[_ngcontent-%COMP%]{font-family:Roboto Mono,ui-monospace,monospace;font-size:12px}td.editable[_ngcontent-%COMP%]{cursor:pointer}td.editable[_ngcontent-%COMP%]:hover{background:#0000000a}.cell-field[_ngcontent-%COMP%]{width:100%;min-width:80px}.cell-field[_ngcontent-%COMP%]   .mat-mdc-form-field-subscript-wrapper[_ngcontent-%COMP%]{display:none}.empty-note[_ngcontent-%COMP%]{color:#0000008a;font-style:italic}.table-actions[_ngcontent-%COMP%]{display:flex;gap:8px;margin:8px 0 24px}"]})};function Qo(n,o){n&1&&(us(0,"th",12),MC(1,"ID"),Xu());}function Ho(n,o){if(n&1&&(us(0,"td",13),MC(1),Xu()),n&2){let e=o.$implicit;LE(),xg(e.id);}}function jo(n,o){n&1&&(us(0,"th",12),MC(1,"Node"),Xu());}function qo(n,o){if(n&1&&(us(0,"td",14),MC(1),Xu()),n&2){let e=o.$implicit;LE(),xg(e.node);}}function Uo(n,o){n&1&&(us(0,"th",12),MC(1,"Max Threads"),Xu());}function Wo(n,o){if(n&1){let e=qw();us(0,"mat-form-field",16)(1,"input",17),kg("ngModelChange",function(i){Zd(e);let a=Xw(2);return RC(a.editValue,i)||(a.editValue=i),Yd(i)}),hg("keydown.enter",function(){Zd(e);let i=Xw().$implicit,a=Xw();return Yd(a.commitEdit(i))})("keydown.escape",function(){Zd(e);let i=Xw(2);return Yd(i.cancelEdit())})("blur",function(){Zd(e);let i=Xw().$implicit,a=Xw();return Yd(a.commitEdit(i))}),Xu(),TI(),Xu();}if(n&2){let e=Xw(2);LE(),Og("ngModel",e.editValue),SI();}}function $o(n,o){if(n&1&&MC(0),n&2){let e=Xw().$implicit;rl(" ",e.maxthreads==null?"\u2014":e.maxthreads," ");}}function Xo(n,o){if(n&1){let e=qw();us(0,"td",15),hg("click",function(){let i=Zd(e).$implicit,a=Xw();return Yd(a.startEdit(i))}),Lw(1,Wo,2,1,"mat-form-field",16)(2,$o,1,1),Xu();}if(n&2){let e=o.$implicit,t=Xw();LE(),jw(t.isEditing(e)?1:2);}}function Go(n,o){n&1&&(us(0,"th",12),MC(1,"Timestamp"),Xu());}function Zo(n,o){if(n&1&&(us(0,"td",14),MC(1),Xu()),n&2){let e=o.$implicit,t=Xw();LE(),xg(t.formatTimestamp(e.timestamp));}}function Ko(n,o){n&1&&cg(0,"tr",18);}function Yo(n,o){n&1&&cg(0,"tr",19);}function Jo(n,o){n&1&&(us(0,"p",11),MC(1,"None."),Xu());}var $t=class n{nodesService=g(Ne);nodes=zj([]);changed=Gj();editingChange=Gj();columns=["id","node","maxthreads","timestamp"];editingNode=fn$1(null);editValue=fn$1("");isEditing(o){return this.editingNode()===o.node}formatTimestamp(o){return !o&&o!==0?"":new Date(o).toLocaleString()}startEdit(o){this.isEditing(o)||(this.editingNode.set(o.node),this.editValue.set(o.maxthreads==null?"":String(o.maxthreads)),this.editingChange.emit(true));}cancelEdit(){this.editingNode()!==null&&(this.editingNode.set(null),this.editingChange.emit(false));}commitEdit(o){if(!this.isEditing(o)||(this.editingNode.set(null),this.editingChange.emit(false),qt(this.editValue(),o.maxthreads)))return;let e=jt(this.editValue());this.nodesService.updateMaxThreads(o.node,e).subscribe({next:()=>this.changed.emit(),error:()=>this.changed.emit()});}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=gw({type:n,selectors:[["app-node-table"]],inputs:{nodes:[1,"nodes"]},outputs:{changed:"changed",editingChange:"editingChange"},decls:16,vars:4,consts:[["mat-table","",1,"disbatch-table",3,"dataSource"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","","class","mono",4,"matCellDef"],["matColumnDef","node"],["mat-cell","",4,"matCellDef"],["matColumnDef","maxthreads"],["mat-cell","","class","editable",3,"click",4,"matCellDef"],["matColumnDef","timestamp"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[1,"empty-note"],["mat-header-cell",""],["mat-cell","",1,"mono"],["mat-cell",""],["mat-cell","",1,"editable",3,"click"],["appearance","outline","subscriptSizing","dynamic",1,"cell-field"],["matInput","","type","number","min","0","placeholder","unlimited","cdkFocusInitial","",3,"ngModelChange","keydown.enter","keydown.escape","blur","ngModel"],["mat-header-row",""],["mat-row",""]],template:function(e,t){e&1&&(us(0,"table",0),tl(1,1),ng(2,Qo,2,0,"th",2)(3,Ho,2,1,"td",3),nl(),tl(4,4),ng(5,jo,2,0,"th",2)(6,qo,2,1,"td",5),nl(),tl(7,6),ng(8,Uo,2,0,"th",2)(9,Xo,3,1,"td",7),nl(),tl(10,8),ng(11,Go,2,0,"th",2)(12,Zo,2,1,"td",5),nl(),ng(13,Ko,1,0,"tr",9)(14,Yo,1,0,"tr",10),Xu(),Lw(15,Jo,2,0,"p",11)),e&2&&(ag("dataSource",t.nodes()),LE(13),ag("matHeaderRowDef",t.columns),LE(),ag("matRowDefColumns",t.columns),LE(),jw(t.nodes().length?-1:15));},dependencies:[Ia,mi$2,Ds,Ea,os,Cs,Vt,Mt,Et,At,Ot,Nt,Pt,Ft,It,Bt,Lt,I,Ht$1,We$1,$e$1],styles:[".disbatch-table[_ngcontent-%COMP%]{width:100%;margin-bottom:8px}.mono[_ngcontent-%COMP%]{font-family:Roboto Mono,ui-monospace,monospace;font-size:12px}td.editable[_ngcontent-%COMP%]{cursor:pointer}td.editable[_ngcontent-%COMP%]:hover{background:#0000000a}.cell-field[_ngcontent-%COMP%]{width:100%;min-width:80px}.cell-field[_ngcontent-%COMP%]   .mat-mdc-form-field-subscript-wrapper[_ngcontent-%COMP%]{display:none}.empty-note[_ngcontent-%COMP%]{color:#0000008a;font-style:italic}.table-actions[_ngcontent-%COMP%]{display:flex;gap:8px;margin:8px 0 24px}"]})};function ea(n,o){n&1&&cg(0,"mat-progress-bar",2);}var ta=15e3;function na(n){let o=Math.round(n/1e3);if(o%60===0&&o>=60){let e=o/60;return `${e} minute${e===1?"":"s"}`}return `${o} second${o===1?"":"s"}`}var Bi=class n$1{queuesService=g(Me);nodesService=g(Ne);pluginsService=g(Dt);infoService=g(n);refreshService=g(p);queues=fn$1([]);nodes=fn$1([]);plugins=fn$1([]);loading=fn$1(false);editCount=0;editing=fn$1(false);liveWindowMs=fn$1(ta);liveNodes=Hg(()=>{let o=Date.now(),e=this.liveWindowMs();return this.nodes().filter(t=>t.timestamp+e>=o)});deadNodes=Hg(()=>{let o=Date.now(),e=this.liveWindowMs();return this.nodes().filter(t=>t.timestamp+e<o)});liveWindowLabel=Hg(()=>na(this.liveWindowMs()));destroyRef=g(de$1);ngOnInit(){this.pluginsService.list().pipe(FV(this.destroyRef)).subscribe(o=>this.plugins.set(o)),this.infoService.get().pipe(FV(this.destroyRef)).subscribe(o=>{let e=o.dashboard?.live_window_ms;e!=null&&e>0&&this.liveWindowMs.set(e);}),this.refreshService.tick$.pipe(FV(this.destroyRef)).subscribe(()=>{this.editing()||this.reload();});}setEditing(o){this.editCount+=o?1:-1,this.editCount<0&&(this.editCount=0),this.editing.set(this.editCount>0);}reload(){this.loading.set(true);let o=2,e=()=>{o-=1,o===0&&this.loading.set(false);};this.queuesService.list().pipe(FV(this.destroyRef)).subscribe({next:t=>{this.queues.set(t),e();},error:()=>e()}),this.nodesService.list().pipe(FV(this.destroyRef)).subscribe({next:t=>{this.nodes.set(t),e();},error:()=>e()});}static \u0275fac=function(e){return new(e||n$1)};static \u0275cmp=gw({type:n$1,selectors:[["app-dashboard"]],decls:19,vars:6,consts:[[1,"dashboard-header"],["mat-stroked-button","",3,"click"],["mode","indeterminate"],[3,"changed","editingChange","queues","plugins"],[1,"hint"],[3,"changed","editingChange","nodes"]],template:function(e,t){e&1&&(us(0,"div",0)(1,"h1"),MC(2,"Queues"),Xu(),us(3,"button",1),hg("click",function(){return t.reload()}),us(4,"mat-icon"),MC(5,"refresh"),Xu(),MC(6," Refresh"),Xu()(),Lw(7,ea,1,0,"mat-progress-bar",2),us(8,"app-queue-table",3),hg("changed",function(){return t.reload()})("editingChange",function(a){return t.setEditing(a)}),Xu(),us(9,"h1"),MC(10,"Disbatch Execution Nodes"),Xu(),us(11,"p",4),MC(12,"If Max Threads is blank, the DEN uses unlimited threads."),Xu(),us(13,"app-node-table",5),hg("changed",function(){return t.reload()})("editingChange",function(a){return t.setEditing(a)}),Xu(),us(14,"h1"),MC(15,"Non-Running Disbatch Execution Nodes"),Xu(),us(16,"p",4),MC(17),Xu(),us(18,"app-node-table",5),hg("changed",function(){return t.reload()})("editingChange",function(a){return t.setEditing(a)}),Xu()),e&2&&(LE(7),jw(t.loading()?7:-1),LE(),ag("queues",t.queues())("plugins",t.plugins()),LE(5),ag("nodes",t.liveNodes()),LE(4),rl("Nodes that have not reported within the last ",t.liveWindowLabel(),"."),LE(),ag("nodes",t.deadNodes()));},dependencies:[Hn,Wn,mi$1,di,fi,ui,Wt,$t],styles:[".dashboard-header[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:16px}h1[_ngcontent-%COMP%]{font-size:20px;font-weight:500;margin:24px 0 8px}.hint[_ngcontent-%COMP%]{color:#0000008a;margin:0 0 8px;font-size:13px}"]})};export{Bi as Dashboard,na as formatDuration};