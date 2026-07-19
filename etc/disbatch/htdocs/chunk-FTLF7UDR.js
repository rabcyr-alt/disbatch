import{$ as f,$a as he,$b as Z,Aa as Ft,Ac as Kn,Ba as Sn,C as Je,Ca as xe,Da as Mn,E as vn,Ea as ue,F as yn,Fa as Fn,Fb as $n,G as qe,Ga as de,Gb as Hn,H as Qe,Ha as rt,Hb as pe,I as _n,Ia as le,J as et,Ja as me,Ka as xn,La as Rn,Ma as On,N as Dn,Na as Nn,Oa as Ln,P as tt,Pa as kn,Q as En,Qa as Pn,Qb as ge,R as wn,Ra as T,Rb as K,S as nt,U as ce,V as E,Va as fe,Wa as Bn,Xa as it,Y as d,Z as C,Za as Un,a as y,aa as m,ab as xt,ac as at,ba as a,bb as jn,ca as Tt,d as Ze,da as An,db as zn,e as Ye,ea as Me,fa as Cn,g as Xe,hb as N,i as F,ib as I,j as fn,jb as z,ka as O,la as p,lb as ot,oa as St,p as k,pa as w,pb as st,pc as Vn,q as hn,qa as te,sa as Fe,sb as Rt,t as A,tb as Re,u as pn,ua as In,va as Tn,wa as Mt,wc as Gn,x as gn,xc as Y,yc as Wn,z as bn,za as P}from"./chunk-L2QY6HWW.js";var Zn=null;function V(){return Zn}function Ot(n){Zn??=n}var Oe=class{},X=(()=>{class n{historyGo(e){throw new Error("")}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:()=>a(Yn),providedIn:"platform"})}return n})();var Yn=(()=>{class n extends X{_location;_history;_doc=a(p);constructor(){super(),this._location=window.location,this._history=window.history}getBaseHrefFromDOM(){return V().getBaseHref(this._doc)}onPopState(e){let t=V().getGlobalEventTarget(this._doc,"window");return t.addEventListener("popstate",e,!1),()=>t.removeEventListener("popstate",e)}onHashChange(e){let t=V().getGlobalEventTarget(this._doc,"window");return t.addEventListener("hashchange",e,!1),()=>t.removeEventListener("hashchange",e)}get href(){return this._location.href}get protocol(){return this._location.protocol}get hostname(){return this._location.hostname}get port(){return this._location.port}get pathname(){return this._location.pathname}get search(){return this._location.search}get hash(){return this._location.hash}set pathname(e){this._location.pathname=e}pushState(e,t,i){this._history.pushState(e,t,i)}replaceState(e,t,i){this._history.replaceState(e,t,i)}forward(){this._history.forward()}back(){this._history.back()}historyGo(e=0){this._history.go(e)}getState(){return this._history.state}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:()=>new n,providedIn:"platform"})}return n})();function ct(n,r){return n?r?n.endsWith("/")?r.startsWith("/")?n+r.slice(1):n+r:r.startsWith("/")?n+r:`${n}/${r}`:n:r}function Xn(n){let r=n.search(/#|\?|$/);return n[r-1]==="/"?n.slice(0,r-1)+n.slice(r):n}function B(n){return n&&n[0]!=="?"?`?${n}`:n}var be=(()=>{class n{historyGo(e){throw new Error("")}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:()=>a(di),providedIn:"root"})}return n})(),Nt=new f(""),di=(()=>{class n extends be{_platformLocation;_baseHref;_removeListenerFns=[];constructor(e,t){super(),this._platformLocation=e,this._baseHref=t??this._platformLocation.getBaseHrefFromDOM()??a(p).location?.origin??""}ngOnDestroy(){for(;this._removeListenerFns.length;)this._removeListenerFns.pop()()}onPopState(e){this._removeListenerFns.push(this._platformLocation.onPopState(e),this._platformLocation.onHashChange(e))}getBaseHref(){return this._baseHref}prepareExternalUrl(e){return ct(this._baseHref,e)}path(e=!1){let t=this._platformLocation.pathname+B(this._platformLocation.search),i=this._platformLocation.hash;return i&&e?`${t}${i}`:t}pushState(e,t,i,o){let s=this.prepareExternalUrl(i+B(o));this._platformLocation.pushState(e,t,s)}replaceState(e,t,i,o){let s=this.prepareExternalUrl(i+B(o));this._platformLocation.replaceState(e,t,s)}forward(){this._platformLocation.forward()}back(){this._platformLocation.back()}getState(){return this._platformLocation.getState()}historyGo(e=0){this._platformLocation.historyGo?.(e)}static \u0275fac=function(t){return new(t||n)(m(X),m(Nt,8))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var qn=(()=>{class n{_subject=new F;_basePath;_locationStrategy;_urlChangeListeners=[];_urlChangeSubscription=null;constructor(e){this._locationStrategy=e;let t=this._locationStrategy.getBaseHref();this._basePath=fi(Xn(Jn(t))),this._locationStrategy.onPopState(i=>{this._subject.next({url:this.path(!0),pop:!0,state:i.state,type:i.type})})}ngOnDestroy(){this._urlChangeSubscription?.unsubscribe(),this._urlChangeListeners=[]}path(e=!1){return this.normalize(this._locationStrategy.path(e))}getState(){return this._locationStrategy.getState()}isCurrentPathEqualTo(e,t=""){return this.path()==this.normalize(e+B(t))}normalize(e){return n.stripTrailingSlash(mi(this._basePath,Jn(e)))}prepareExternalUrl(e){return e&&e[0]!=="/"&&(e="/"+e),this._locationStrategy.prepareExternalUrl(e)}go(e,t="",i=null){this._locationStrategy.pushState(i,"",e,t),this._notifyUrlChangeListeners(this.prepareExternalUrl(e+B(t)),i)}replaceState(e,t="",i=null){this._locationStrategy.replaceState(i,"",e,t),this._notifyUrlChangeListeners(this.prepareExternalUrl(e+B(t)),i)}forward(){this._locationStrategy.forward()}back(){this._locationStrategy.back()}historyGo(e=0){this._locationStrategy.historyGo?.(e)}onUrlChange(e){return this._urlChangeListeners.push(e),this._urlChangeSubscription??=this.subscribe(t=>{this._notifyUrlChangeListeners(t.url,t.state)}),()=>{let t=this._urlChangeListeners.indexOf(e);this._urlChangeListeners.splice(t,1),this._urlChangeListeners.length===0&&(this._urlChangeSubscription?.unsubscribe(),this._urlChangeSubscription=null)}}_notifyUrlChangeListeners(e="",t){this._urlChangeListeners.forEach(i=>i(e,t))}subscribe(e,t,i){return this._subject.subscribe({next:e,error:t??void 0,complete:i??void 0})}static normalizeQueryParams=B;static joinWithSlash=ct;static stripTrailingSlash=Xn;static \u0275fac=function(t){return new(t||n)(m(be))};static \u0275prov=d({token:n,factory:()=>li(),providedIn:"root"})}return n})();function li(){return new qn(m(be))}function mi(n,r){if(!n||!r.startsWith(n))return r;let e=r.substring(n.length);return e===""||["/",";","?","#"].includes(e[0])?e:r}function Jn(n){return n.replace(/\/index\.html$/,"")}function fi(n){if(new RegExp("^(https?:)?//").test(n)){let[,e]=n.split(/\/\/[^\/]+/);return e}return n}var hi=(()=>{class n extends be{_platformLocation;_baseHref="";_removeListenerFns=[];constructor(e,t){super(),this._platformLocation=e,t!=null&&(this._baseHref=t)}ngOnDestroy(){for(;this._removeListenerFns.length;)this._removeListenerFns.pop()()}onPopState(e){this._removeListenerFns.push(this._platformLocation.onPopState(e),this._platformLocation.onHashChange(e))}getBaseHref(){return this._baseHref}path(e=!1){let t=this._platformLocation.hash??"#";return t.length>0?t.substring(1):t}prepareExternalUrl(e){let t=ct(this._baseHref,e);return t.length>0?"#"+t:t}pushState(e,t,i,o){let s=this.prepareExternalUrl(i+B(o))||this._platformLocation.pathname;this._platformLocation.pushState(e,t,s)}replaceState(e,t,i,o){let s=this.prepareExternalUrl(i+B(o))||this._platformLocation.pathname;this._platformLocation.replaceState(e,t,s)}forward(){this._platformLocation.forward()}back(){this._platformLocation.back()}getState(){return this._platformLocation.getState()}historyGo(e=0){this._platformLocation.historyGo?.(e)}static \u0275fac=function(t){return new(t||n)(m(X),m(Nt,8))};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})();var pi=(()=>{class n{_viewContainerRef;_viewRef=null;ngTemplateOutletContext=null;ngTemplateOutlet=null;ngTemplateOutletInjector=null;injector=a(O);constructor(e){this._viewContainerRef=e}ngOnChanges(e){if(this._shouldRecreateView(e)){let t=this._viewContainerRef;if(this._viewRef&&t.remove(t.indexOf(this._viewRef)),!this.ngTemplateOutlet){this._viewRef=null;return}let i=this._createContextForwardProxy();this._viewRef=t.createEmbeddedView(this.ngTemplateOutlet,i,{injector:this._getInjector()})}}_getInjector(){return this.ngTemplateOutletInjector==="outlet"?this.injector:this.ngTemplateOutletInjector??void 0}_shouldRecreateView(e){return!!e.ngTemplateOutlet||!!e.ngTemplateOutletInjector}_createContextForwardProxy(){return new Proxy({},{set:(e,t,i)=>this.ngTemplateOutletContext?Reflect.set(this.ngTemplateOutletContext,t,i):!1,get:(e,t,i)=>{if(this.ngTemplateOutletContext)return Reflect.get(this.ngTemplateOutletContext,t,i)}})}static \u0275fac=function(t){return new(t||n)(jn(zn))};static \u0275dir=z({type:n,selectors:[["","ngTemplateOutlet",""]],inputs:{ngTemplateOutletContext:"ngTemplateOutletContext",ngTemplateOutlet:"ngTemplateOutlet",ngTemplateOutletInjector:"ngTemplateOutletInjector"},features:[Mt]})}return n})();function Ne(n,r){r=encodeURIComponent(r);for(let e of n.split(";")){let t=e.indexOf("="),[i,o]=t==-1?[e,""]:[e.slice(0,t),e.slice(t+1)];if(i.trim()===r)return decodeURIComponent(o)}return null}var ne=class{};var Lt="browser";function er(n){return n===Lt}var Le=class{_doc;constructor(r){this._doc=r}manager},ut=(()=>{class n extends Le{constructor(e){super(e)}supports(e){return!0}addEventListener(e,t,i,o){return e.addEventListener(t,i,o),()=>this.removeEventListener(e,t,i,o)}removeEventListener(e,t,i,o){return e.removeEventListener(t,i,o)}static \u0275fac=function(t){return new(t||n)(m(p))};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})(),mt=new f(""),Ut=(()=>{class n{_zone;_plugins;_eventNameToPlugin=new Map;constructor(e,t){this._zone=t,e.forEach(s=>{s.manager=this});let i=e.filter(s=>!(s instanceof ut));this._plugins=i.slice().reverse();let o=e.find(s=>s instanceof ut);o&&this._plugins.push(o)}addEventListener(e,t,i,o){return this._findPluginFor(t).addEventListener(e,t,i,o)}getZone(){return this._zone}_findPluginFor(e){let t=this._eventNameToPlugin.get(e);if(t)return t;if(t=this._plugins.find(o=>o.supports(e)),!t)throw new E(5101,!1);return this._eventNameToPlugin.set(e,t),t}static \u0275fac=function(t){return new(t||n)(m(mt),m(w))};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})(),kt="ng-app-id";function tr(n){for(let r of n)r.remove()}function nr(n,r){let e=r.createElement("style");return e.textContent=n,e}function yi(n,r,e,t){let i=n.head?.querySelectorAll(`style[${kt}="${r}"],link[${kt}="${r}"]`);if(i)for(let o of i)o.removeAttribute(kt),o instanceof HTMLLinkElement?t.set(o.href.slice(o.href.lastIndexOf("/")+1),{usage:0,elements:[o]}):o.textContent&&e.set(o.textContent,{usage:0,elements:[o]})}function Bt(n,r){let e=r.createElement("link");return e.setAttribute("rel","stylesheet"),e.setAttribute("href",n),e}var jt=(()=>{class n{doc;appId;nonce;inline=new Map;external=new Map;hosts=new Set;constructor(e,t,i,o={}){this.doc=e,this.appId=t,this.nonce=i,yi(e,t,this.inline,this.external),this.hosts.add(e.head)}addStyles(e,t){for(let i of e)this.addUsage(i,this.inline,nr);t?.forEach(i=>this.addUsage(i,this.external,Bt))}removeStyles(e,t){for(let i of e)this.removeUsage(i,this.inline);t?.forEach(i=>this.removeUsage(i,this.external))}addUsage(e,t,i){let o=t.get(e);o?o.usage++:t.set(e,{usage:1,elements:[...this.hosts].map(s=>this.addElement(s,i(e,this.doc)))})}removeUsage(e,t){let i=t.get(e);i&&(i.usage--,i.usage<=0&&(tr(i.elements),t.delete(e)))}ngOnDestroy(){for(let[,{elements:e}]of[...this.inline,...this.external])tr(e);this.hosts.clear()}addHost(e){this.hosts.add(e);for(let[t,{elements:i}]of this.inline)i.push(this.addElement(e,nr(t,this.doc)));for(let[t,{elements:i}]of this.external)i.push(this.addElement(e,Bt(t,this.doc)))}removeHost(e){this.hosts.delete(e)}addElement(e,t){return this.nonce&&t.setAttribute("nonce",this.nonce),e.appendChild(t)}static \u0275fac=function(t){return new(t||n)(m(p),m(xe),m(de,8),m(ue))};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})(),Pt={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/",math:"http://www.w3.org/1998/Math/MathML"},zt=/%COMP%/g;var ir="%COMP%",_i=`_nghost-${ir}`,Di=`_ngcontent-${ir}`,Ei=!0,wi=new f("",{factory:()=>Ei});function Ai(n){return Di.replace(zt,n)}function Ci(n){return _i.replace(zt,n)}function or(n,r){return r.map(e=>e.replace(zt,n))}var $t=(()=>{class n{eventManager;sharedStylesHost;appId;removeStylesOnCompDestroy;doc;ngZone;nonce;tracingService;rendererByCompId=new Map;defaultRenderer;constructor(e,t,i,o,s,c,u=null,l=null){this.eventManager=e,this.sharedStylesHost=t,this.appId=i,this.removeStylesOnCompDestroy=o,this.doc=s,this.ngZone=c,this.nonce=u,this.tracingService=l,this.defaultRenderer=new ke(e,s,c,this.tracingService)}createRenderer(e,t){if(!e||!t)return this.defaultRenderer;let i=this.getOrCreateRenderer(e,t);return i instanceof lt?i.applyToHost(e):i instanceof Pe&&i.applyStyles(),i}getOrCreateRenderer(e,t){let i=this.rendererByCompId,o=i.get(t.id);if(!o){let s=this.doc,c=this.ngZone,u=this.eventManager,l=this.sharedStylesHost,h=this.removeStylesOnCompDestroy,_=this.tracingService;switch(t.encapsulation){case rt.Emulated:o=new lt(u,l,t,this.appId,h,s,c,_);break;case rt.ShadowDom:return new dt(u,e,t,s,c,this.nonce,_,l);case rt.ExperimentalIsolatedShadowDom:return new dt(u,e,t,s,c,this.nonce,_);default:o=new Pe(u,l,t,h,s,c,_);break}i.set(t.id,o)}return o}ngOnDestroy(){this.rendererByCompId.clear()}componentReplaced(e){this.rendererByCompId.delete(e)}static \u0275fac=function(t){return new(t||n)(m(Ut),m(jt),m(xe),m(wi),m(p),m(w),m(de),m(it,8))};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})(),ke=class{eventManager;doc;ngZone;tracingService;data=Object.create(null);throwOnSyntheticProps=!0;constructor(r,e,t,i){this.eventManager=r,this.doc=e,this.ngZone=t,this.tracingService=i}destroy(){}destroyNode=null;createElement(r,e){return e?this.doc.createElementNS(Pt[e]||e,r):this.doc.createElement(r)}createComment(r){return this.doc.createComment(r)}createText(r){return this.doc.createTextNode(r)}appendChild(r,e){(rr(r)?r.content:r).appendChild(e)}insertBefore(r,e,t){r&&(rr(r)?r.content:r).insertBefore(e,t)}removeChild(r,e){e.remove()}selectRootElement(r,e){let t=typeof r=="string"?this.doc.querySelector(r):r;if(!t)throw new E(-5104,!1);return e||(t.textContent=""),t}parentNode(r){return r.parentNode}nextSibling(r){return r.nextSibling}setAttribute(r,e,t,i){if(i){e=i+":"+e;let o=Pt[i];o?r.setAttributeNS(o,e,t):r.setAttribute(e,t)}else r.setAttribute(e,t)}removeAttribute(r,e,t){if(t){let i=Pt[t];i?r.removeAttributeNS(i,e):r.removeAttribute(`${t}:${e}`)}else r.removeAttribute(e)}addClass(r,e){r.classList.add(e)}removeClass(r,e){r.classList.remove(e)}setStyle(r,e,t,i){i&(fe.DashCase|fe.Important)?r.style.setProperty(e,t,i&fe.Important?"important":""):r.style[e]=t}removeStyle(r,e,t){t&fe.DashCase?r.style.removeProperty(e):r.style[e]=""}setProperty(r,e,t){r!=null&&(r[e]=t)}setValue(r,e){r.nodeValue=e}listen(r,e,t,i){if(typeof r=="string"&&(r=V().getGlobalEventTarget(this.doc,r),!r))throw new E(5102,!1);let o=this.decoratePreventDefault(t);return this.tracingService?.wrapEventListener&&(o=this.tracingService.wrapEventListener(r,e,o)),this.eventManager.addEventListener(r,e,o,i)}decoratePreventDefault(r){return e=>{if(e==="__ngUnwrap__")return r;r(e)===!1&&e.preventDefault()}}};function rr(n){return n.tagName==="TEMPLATE"&&n.content!==void 0}var dt=class extends ke{hostEl;sharedStylesHost;shadowRoot;constructor(r,e,t,i,o,s,c,u){super(r,i,o,c),this.hostEl=e,this.sharedStylesHost=u,this.shadowRoot=e.attachShadow({mode:"open"}),this.sharedStylesHost&&this.sharedStylesHost.addHost(this.shadowRoot);let l=t.styles;l=or(t.id,l);for(let _ of l){let S=document.createElement("style");s&&S.setAttribute("nonce",s),S.textContent=_,this.shadowRoot.appendChild(S)}let h=t.getExternalStyles?.();if(h)for(let _ of h){let S=Bt(_,i);s&&S.setAttribute("nonce",s),this.shadowRoot.appendChild(S)}}nodeOrShadowRoot(r){return r===this.hostEl?this.shadowRoot:r}appendChild(r,e){return super.appendChild(this.nodeOrShadowRoot(r),e)}insertBefore(r,e,t){return super.insertBefore(this.nodeOrShadowRoot(r),e,t)}removeChild(r,e){return super.removeChild(null,e)}parentNode(r){return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(r)))}destroy(){this.sharedStylesHost&&this.sharedStylesHost.removeHost(this.shadowRoot)}},Pe=class extends ke{sharedStylesHost;removeStylesOnCompDestroy;styles;styleUrls;constructor(r,e,t,i,o,s,c,u){super(r,o,s,c),this.sharedStylesHost=e,this.removeStylesOnCompDestroy=i;let l=t.styles;this.styles=u?or(u,l):l,this.styleUrls=t.getExternalStyles?.(u)}applyStyles(){this.sharedStylesHost.addStyles(this.styles,this.styleUrls)}destroy(){this.removeStylesOnCompDestroy&&Bn.size===0&&this.sharedStylesHost.removeStyles(this.styles,this.styleUrls)}},lt=class extends Pe{contentAttr;hostAttr;constructor(r,e,t,i,o,s,c,u){let l=i+"-"+t.id;super(r,e,t,o,s,c,u,l),this.contentAttr=Ai(l),this.hostAttr=Ci(l)}applyToHost(r){this.applyStyles(),this.setAttribute(r,this.hostAttr,"")}createElement(r,e){let t=super.createElement(r,e);return super.setAttribute(t,this.contentAttr,""),t}};var ft=class n extends Oe{supportsDOMEvents=!0;static makeCurrent(){Ot(new n)}onAndCancel(r,e,t,i){return r.addEventListener(e,t,i),()=>{r.removeEventListener(e,t,i)}}dispatchEvent(r,e){r.dispatchEvent(e)}remove(r){r.remove()}createElement(r,e){return e=e||this.getDefaultDocument(),e.createElement(r)}createHtmlDocument(){return document.implementation.createHTMLDocument("fakeTitle")}getDefaultDocument(){return document}isElementNode(r){return r.nodeType===Node.ELEMENT_NODE}isShadowRoot(r){return r instanceof DocumentFragment}getGlobalEventTarget(r,e){return e==="window"?window:e==="document"?r:e==="body"?r.body:null}getBaseHref(r){let e=Ti();return e==null?null:Si(e)}resetBaseElement(){Be=null}getUserAgent(){return window.navigator.userAgent}getCookie(r){return Ne(document.cookie,r)}},Be=null;function Ti(){return Be=Be||document.head.querySelector("base"),Be?Be.getAttribute("href"):null}function Si(n){return new URL(n,document.baseURI).pathname}var Mi=(()=>{class n{build(){return new XMLHttpRequest}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})(),sr=["alt","control","meta","shift"],Fi={"\b":"Backspace","	":"Tab","\x7F":"Delete","\x1B":"Escape",Del:"Delete",Esc:"Escape",Left:"ArrowLeft",Right:"ArrowRight",Up:"ArrowUp",Down:"ArrowDown",Menu:"ContextMenu",Scroll:"ScrollLock",Win:"OS"},xi={alt:n=>n.altKey,control:n=>n.ctrlKey,meta:n=>n.metaKey,shift:n=>n.shiftKey},ar=(()=>{class n extends Le{constructor(e){super(e)}supports(e){return n.parseEventName(e)!=null}addEventListener(e,t,i,o){let s=n.parseEventName(t),c=n.eventCallback(s.fullKey,i,this.manager.getZone());return this.manager.getZone().runOutsideAngular(()=>V().onAndCancel(e,s.domEventName,c,o))}static parseEventName(e){let t=e.toLowerCase().split("."),i=t.shift();if(t.length===0||!(i==="keydown"||i==="keyup"))return null;let o=n._normalizeKey(t.pop()),s="",c=t.indexOf("code");if(c>-1&&(t.splice(c,1),s="code."),sr.forEach(l=>{let h=t.indexOf(l);h>-1&&(t.splice(h,1),s+=l+".")}),s+=o,t.length!=0||o.length===0)return null;let u={};return u.domEventName=i,u.fullKey=s,u}static matchEventFullKeyCode(e,t){let i=Fi[e.key]||e.key,o="";return t.indexOf("code.")>-1&&(i=e.code,o="code."),i==null||!i?!1:(i=i.toLowerCase(),i===" "?i="space":i==="."&&(i="dot"),sr.forEach(s=>{if(s!==i){let c=xi[s];c(e)&&(o+=s+".")}}),o+=i,o===t)}static eventCallback(e,t,i){return o=>{n.matchEventFullKeyCode(o,e)&&i.runGuarded(()=>t(o))}}static _normalizeKey(e){return e==="esc"?"escape":e}static \u0275fac=function(t){return new(t||n)(m(p))};static \u0275prov=d({token:n,factory:n.\u0275fac})}return n})();function Ri(n,r,e){return Ze(this,null,function*(){let t=y({rootComponent:n},Oi(r,e));return Gn(t)})}function Oi(n,r){return{platformRef:r?.platformRef,appProviders:[...Bi,...n?.providers??[]],platformProviders:Pi}}function Ni(){ft.makeCurrent()}function Li(){return new te}function ki(){return Sn(document),document}var Pi=[{provide:ue,useValue:Lt},{provide:Mn,useValue:Ni,multi:!0},{provide:p,useFactory:ki}];var Bi=[{provide:An,useValue:"root"},{provide:te,useFactory:Li},{provide:mt,useClass:ut,multi:!0},{provide:mt,useClass:ar,multi:!0},$t,jt,Ut,{provide:he,useExisting:$t},{provide:ne,useClass:Mi},[]];var $=class n{headers;normalizedNames=new Map;lazyInit;lazyUpdate=null;constructor(r){r?typeof r=="string"?this.lazyInit=()=>{this.headers=new Map,r.split(`
`).forEach(e=>{let t=e.indexOf(":");if(t>0){let i=e.slice(0,t),o=e.slice(t+1).trim();this.addHeaderEntry(i,o)}})}:typeof Headers<"u"&&r instanceof Headers?(this.headers=new Map,r.forEach((e,t)=>{this.addHeaderEntry(t,e)})):this.lazyInit=()=>{this.headers=new Map,Object.entries(r).forEach(([e,t])=>{this.setHeaderEntries(e,t)})}:this.headers=new Map}has(r){return this.init(),this.headers.has(r.toLowerCase())}get(r){this.init();let e=this.headers.get(r.toLowerCase());return e&&e.length>0?e[0]:null}keys(){return this.init(),Array.from(this.normalizedNames.values())}getAll(r){return this.init(),this.headers.get(r.toLowerCase())||null}append(r,e){return this.clone({name:r,value:e,op:"a"})}set(r,e){return this.clone({name:r,value:e,op:"s"})}delete(r,e){return this.clone({name:r,value:e,op:"d"})}maybeSetNormalizedName(r,e){this.normalizedNames.has(e)||this.normalizedNames.set(e,r)}init(){this.lazyInit&&(this.lazyInit instanceof n?this.copyFrom(this.lazyInit):this.lazyInit(),this.lazyInit=null,this.lazyUpdate&&(this.lazyUpdate.forEach(r=>this.applyUpdate(r)),this.lazyUpdate=null))}copyFrom(r){r.init(),Array.from(r.headers.keys()).forEach(e=>{this.headers.set(e,r.headers.get(e)),this.normalizedNames.set(e,r.normalizedNames.get(e))})}clone(r){let e=new n;return e.lazyInit=this.lazyInit&&this.lazyInit instanceof n?this.lazyInit:this,e.lazyUpdate=(this.lazyUpdate||[]).concat([r]),e}applyUpdate(r){let e=r.name.toLowerCase();switch(r.op){case"a":case"s":let t=r.value;if(typeof t=="string"&&(t=[t]),t.length===0)return;this.maybeSetNormalizedName(r.name,e);let i=(r.op==="a"?this.headers.get(e):void 0)||[];i.push(...t),this.headers.set(e,i);break;case"d":let o=r.value;if(!o)this.headers.delete(e),this.normalizedNames.delete(e);else{let s=this.headers.get(e);if(!s)return;s=s.filter(c=>o.indexOf(c)===-1),s.length===0?(this.headers.delete(e),this.normalizedNames.delete(e)):this.headers.set(e,s)}break}}addHeaderEntry(r,e){let t=r.toLowerCase();this.maybeSetNormalizedName(r,t),this.headers.has(t)?this.headers.get(t).push(e):this.headers.set(t,[e])}setHeaderEntries(r,e){let t=(Array.isArray(e)?e:[e]).map(o=>o.toString()),i=r.toLowerCase();this.headers.set(i,t),this.maybeSetNormalizedName(r,i)}forEach(r){this.init(),Array.from(this.normalizedNames.keys()).forEach(e=>r(this.normalizedNames.get(e),this.headers.get(e)))}};var pt=class{map=new Map;set(r,e){return this.map.set(r,e),this}get(r){return this.map.has(r)||this.map.set(r,r.defaultValue()),this.map.get(r)}delete(r){return this.map.delete(r),this}has(r){return this.map.has(r)}keys(){return this.map.keys()}},gt=class{encodeKey(r){return cr(r)}encodeValue(r){return cr(r)}decodeKey(r){return decodeURIComponent(r)}decodeValue(r){return decodeURIComponent(r)}};function Ui(n,r){let e=new Map;return n.length>0&&n.replace(/^\?/,"").split("&").forEach(i=>{let o=i.indexOf("="),[s,c]=o==-1?[r.decodeKey(i),""]:[r.decodeKey(i.slice(0,o)),r.decodeValue(i.slice(o+1))],u=e.get(s)||[];u.push(c),e.set(s,u)}),e}var ji=/%(\d[a-f0-9])/gi,zi={40:"@","3A":":",24:"$","2C":",","3B":";","3D":"=","3F":"?","2F":"/"};function cr(n){return encodeURIComponent(n).replace(ji,(r,e)=>zi[e]??r)}function ht(n){return`${n}`}var U=class n{map;encoder;updates=null;cloneFrom=null;constructor(r={}){if(this.encoder=r.encoder||new gt,r.fromString){if(r.fromObject)throw new E(2805,!1);this.map=Ui(r.fromString,this.encoder)}else r.fromObject?(this.map=new Map,Object.keys(r.fromObject).forEach(e=>{let t=r.fromObject[e],i=Array.isArray(t)?t.map(ht):[ht(t)];this.map.set(e,i)})):this.map=null}has(r){return this.init(),this.map.has(r)}get(r){this.init();let e=this.map.get(r);return e?e[0]:null}getAll(r){return this.init(),this.map.get(r)||null}keys(){return this.init(),Array.from(this.map.keys())}append(r,e){return this.clone({param:r,value:e,op:"a"})}appendAll(r){let e=[];return Object.keys(r).forEach(t=>{let i=r[t];Array.isArray(i)?i.forEach(o=>{e.push({param:t,value:o,op:"a"})}):e.push({param:t,value:i,op:"a"})}),this.clone(e)}set(r,e){return this.clone({param:r,value:e,op:"s"})}delete(r,e){return this.clone({param:r,value:e,op:"d"})}toString(){return this.init(),this.keys().map(r=>{let e=this.encoder.encodeKey(r);return this.map.get(r).map(t=>e+"="+this.encoder.encodeValue(t)).join("&")}).filter(r=>r!=="").join("&")}clone(r){let e=new n({encoder:this.encoder});return e.cloneFrom=this.cloneFrom||this,e.updates=(this.updates||[]).concat(r),e}init(){this.map===null&&(this.map=new Map),this.cloneFrom!==null&&(this.cloneFrom.init(),this.cloneFrom.keys().forEach(r=>this.map.set(r,this.cloneFrom.map.get(r))),this.updates.forEach(r=>{switch(r.op){case"a":case"s":let e=(r.op==="a"?this.map.get(r.param):void 0)||[];e.push(ht(r.value)),this.map.set(r.param,e);break;case"d":if(r.value!==void 0){let t=this.map.get(r.param)||[],i=t.indexOf(ht(r.value));i!==-1&&t.splice(i,1),t.length>0?this.map.set(r.param,t):this.map.delete(r.param)}else{this.map.delete(r.param);break}}}),this.cloneFrom=this.updates=null)}};function $i(n){switch(n){case"DELETE":case"GET":case"HEAD":case"OPTIONS":case"JSONP":return!1;default:return!0}}function ur(n){return typeof ArrayBuffer<"u"&&n instanceof ArrayBuffer}function dr(n){return typeof Blob<"u"&&n instanceof Blob}function lr(n){return typeof FormData<"u"&&n instanceof FormData}function Hi(n){return typeof URLSearchParams<"u"&&n instanceof URLSearchParams}var mr="Content-Type",fr="Accept",hr="text/plain",pr="application/json",Vi=`${pr}, ${hr}, */*`,ve=class n{url;body=null;headers;context;reportProgress=!1;withCredentials=!1;credentials;keepalive=!1;cache;priority;mode;redirect;referrer;integrity;referrerPolicy;responseType="json";method;params;urlWithParams;transferCache;timeout;constructor(r,e,t,i){this.url=e,this.method=r.toUpperCase();let o;if($i(this.method)||i?(this.body=t!==void 0?t:null,o=i):o=t,o){if(this.reportProgress=!!o.reportProgress,this.withCredentials=!!o.withCredentials,this.keepalive=!!o.keepalive,o.responseType&&(this.responseType=o.responseType),o.headers&&(this.headers=o.headers),o.context&&(this.context=o.context),o.params&&(this.params=o.params),o.priority&&(this.priority=o.priority),o.cache&&(this.cache=o.cache),o.credentials&&(this.credentials=o.credentials),typeof o.timeout=="number"){if(o.timeout<1||!Number.isInteger(o.timeout))throw new E(2822,"");this.timeout=o.timeout}o.mode&&(this.mode=o.mode),o.redirect&&(this.redirect=o.redirect),o.integrity&&(this.integrity=o.integrity),o.referrer!==void 0&&(this.referrer=o.referrer),o.referrerPolicy&&(this.referrerPolicy=o.referrerPolicy),this.transferCache=o.transferCache}if(this.headers??=new $,this.context??=new pt,!this.params)this.params=new U,this.urlWithParams=e;else{let s=this.params.toString();if(s.length===0)this.urlWithParams=e;else{let c=e.indexOf("?"),u=c===-1?"?":c<e.length-1?"&":"";this.urlWithParams=e+u+s}}}serializeBody(){return this.body===null?null:typeof this.body=="string"||ur(this.body)||dr(this.body)||lr(this.body)||Hi(this.body)?this.body:this.body instanceof U?this.body.toString():typeof this.body=="object"||typeof this.body=="boolean"||Array.isArray(this.body)?JSON.stringify(this.body):this.body.toString()}detectContentTypeHeader(){return this.body===null||lr(this.body)?null:dr(this.body)?this.body.type||null:ur(this.body)?null:typeof this.body=="string"?hr:this.body instanceof U?"application/x-www-form-urlencoded;charset=UTF-8":typeof this.body=="object"||typeof this.body=="number"||typeof this.body=="boolean"?pr:null}clone(r={}){let e=r.method||this.method,t=r.url||this.url,i=r.responseType||this.responseType,o=r.keepalive??this.keepalive,s=r.priority||this.priority,c=r.cache||this.cache,u=r.mode||this.mode,l=r.redirect||this.redirect,h=r.credentials||this.credentials,_=r.referrer??this.referrer,S=r.integrity||this.integrity,Q=r.referrerPolicy||this.referrerPolicy,W=r.transferCache??this.transferCache,R=r.timeout??this.timeout,g=r.body!==void 0?r.body:this.body,b=r.withCredentials??this.withCredentials,M=r.reportProgress??this.reportProgress,H=r.headers||this.headers,D=r.params||this.params,Te=r.context??this.context;return r.setHeaders!==void 0&&(H=Object.keys(r.setHeaders).reduce((Se,ee)=>Se.set(ee,r.setHeaders[ee]),H)),r.setParams&&(D=Object.keys(r.setParams).reduce((Se,ee)=>Se.set(ee,r.setParams[ee]),D)),new n(e,t,g,{params:D,headers:H,context:Te,reportProgress:M,responseType:i,withCredentials:b,transferCache:W,keepalive:o,cache:c,priority:s,timeout:R,mode:u,redirect:l,credentials:h,referrer:_,integrity:S,referrerPolicy:Q})}},re=(function(n){return n[n.Sent=0]="Sent",n[n.UploadProgress=1]="UploadProgress",n[n.ResponseHeader=2]="ResponseHeader",n[n.DownloadProgress=3]="DownloadProgress",n[n.Response=4]="Response",n[n.User=5]="User",n})(re||{}),_e=class{headers;status;statusText;url;ok;type;redirected;responseType;constructor(r,e=200,t="OK"){this.headers=r.headers||new $,this.status=r.status!==void 0?r.status:e,this.statusText=r.statusText||t,this.url=r.url||null,this.redirected=r.redirected,this.responseType=r.responseType,this.ok=this.status>=200&&this.status<300}},bt=class n extends _e{constructor(r={}){super(r)}type=re.ResponseHeader;clone(r={}){return new n({headers:r.headers||this.headers,status:r.status!==void 0?r.status:this.status,statusText:r.statusText||this.statusText,url:r.url||this.url||void 0})}},Ue=class n extends _e{body;constructor(r={}){super(r),this.body=r.body!==void 0?r.body:null}type=re.Response;clone(r={}){return new n({body:r.body!==void 0?r.body:this.body,headers:r.headers||this.headers,status:r.status!==void 0?r.status:this.status,statusText:r.statusText||this.statusText,url:r.url||this.url||void 0,redirected:r.redirected??this.redirected,responseType:r.responseType??this.responseType})}},ye=class extends _e{name="HttpErrorResponse";message;error;ok=!1;constructor(r){super(r,0,"Unknown Error"),this.status>=200&&this.status<300?this.message=`Http failure during parsing for ${r.url||"(unknown url)"}`:this.message=`Http failure response for ${r.url||"(unknown url)"}: ${r.status} ${r.statusText}`,this.error=r.error||null}},Gi=200,Wi=204;var Ki=new f("");var Zi=/^\)\]\}',?\n/;var Vt=(()=>{class n{xhrFactory;tracingService=a(it,{optional:!0});constructor(e){this.xhrFactory=e}maybePropagateTrace(e){return this.tracingService?.propagate?this.tracingService.propagate(e):e}handle(e){if(e.method==="JSONP")throw new E(-2800,!1);let t=this.xhrFactory;return k(null).pipe(wn(()=>new Xe(o=>{let s=t.build();if(s.open(e.method,e.urlWithParams),e.withCredentials&&(s.withCredentials=!0),e.headers.forEach((g,b)=>s.setRequestHeader(g,b.join(","))),e.headers.has(fr)||s.setRequestHeader(fr,Vi),!e.headers.has(mr)){let g=e.detectContentTypeHeader();g!==null&&s.setRequestHeader(mr,g)}if(e.timeout&&(s.timeout=e.timeout),e.responseType){let g=e.responseType.toLowerCase();s.responseType=g!=="json"?g:"text"}let c=e.serializeBody(),u=null,l=()=>{if(u!==null)return u;let g=s.statusText||"OK",b=new $(s.getAllResponseHeaders()),M=s.responseURL||e.url;return u=new bt({headers:b,status:s.status,statusText:g,url:M}),u},h=this.maybePropagateTrace(()=>{let{headers:g,status:b,statusText:M,url:H}=l(),D=null;b!==Wi&&(D=typeof s.response>"u"?s.responseText:s.response),b===0&&(b=D?Gi:0);let Te=b>=200&&b<300;if(e.responseType==="json"&&typeof D=="string"){let Se=D;D=D.replace(Zi,"");try{D=D!==""?JSON.parse(D):null}catch(ee){D=Se,Te&&(Te=!1,D={error:ee,text:D})}}Te?(o.next(new Ue({body:D,headers:g,status:b,statusText:M,url:H||void 0})),o.complete()):o.error(new ye({error:D,headers:g,status:b,statusText:M,url:H||void 0}))}),_=this.maybePropagateTrace(g=>{let{url:b}=l(),M=new ye({error:g,status:s.status||0,statusText:s.statusText||"Unknown Error",url:b||void 0});o.error(M)}),S=_;e.timeout&&(S=this.maybePropagateTrace(g=>{let{url:b}=l(),M=new ye({error:new DOMException("Request timed out","TimeoutError"),status:s.status||0,statusText:s.statusText||"Request timeout",url:b||void 0});o.error(M)}));let Q=!1,W=this.maybePropagateTrace(g=>{Q||(o.next(l()),Q=!0);let b={type:re.DownloadProgress,loaded:g.loaded};g.lengthComputable&&(b.total=g.total),e.responseType==="text"&&s.responseText&&(b.partialText=s.responseText),o.next(b)}),R=this.maybePropagateTrace(g=>{let b={type:re.UploadProgress,loaded:g.loaded};g.lengthComputable&&(b.total=g.total),o.next(b)});return s.addEventListener("load",h),s.addEventListener("error",_),s.addEventListener("timeout",S),s.addEventListener("abort",_),e.reportProgress&&(s.addEventListener("progress",W),c!==null&&s.upload&&s.upload.addEventListener("progress",R)),s.send(c),o.next({type:re.Sent}),()=>{s.removeEventListener("error",_),s.removeEventListener("abort",_),s.removeEventListener("load",h),s.removeEventListener("timeout",S),e.reportProgress&&(s.removeEventListener("progress",W),c!==null&&s.upload&&s.upload.removeEventListener("progress",R)),s.readyState!==s.DONE&&s.abort()}})))}static \u0275fac=function(t){return new(t||n)(m(ne))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function Yi(n,r){return r(n)}function Xi(n,r,e){return(t,i)=>Cn(e,()=>r(t,o=>n(o,i)))}var gr=new f("",{factory:()=>[]}),br=new f(""),vr=new f("",{factory:()=>!0});var Gt=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=m(Vt),i},providedIn:"root"})}return n})();var vt=(()=>{class n{backend;injector;chain=null;pendingTasks=a(In);contributeToStability=a(vr);constructor(e,t){this.backend=e,this.injector=t}handle(e){if(this.chain===null){let t=Array.from(new Set([...this.injector.get(gr),...this.injector.get(br,[])]));this.chain=t.reduceRight((i,o)=>Xi(i,o,this.injector),Yi)}if(this.contributeToStability){let t=this.pendingTasks.add();return this.chain(e,i=>this.backend.handle(i)).pipe(et(t))}else return this.chain(e,t=>this.backend.handle(t))}static \u0275fac=function(t){return new(t||n)(m(Gt),m(Me))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),Wt=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=m(vt),i},providedIn:"root"})}return n})();function Ht(n,r){return{body:r,headers:n.headers,context:n.context,observe:n.observe,params:n.params,reportProgress:n.reportProgress,responseType:n.responseType,withCredentials:n.withCredentials,credentials:n.credentials,transferCache:n.transferCache,timeout:n.timeout,keepalive:n.keepalive,priority:n.priority,cache:n.cache,mode:n.mode,redirect:n.redirect,integrity:n.integrity,referrer:n.referrer,referrerPolicy:n.referrerPolicy}}var De=(()=>{class n{handler;constructor(e){this.handler=e}request(e,t,i={}){let o;if(e instanceof ve)o=e;else{let u;i.headers instanceof $?u=i.headers:u=new $(i.headers);let l;i.params&&(i.params instanceof U?l=i.params:l=new U({fromObject:i.params})),o=new ve(e,t,i.body!==void 0?i.body:null,{headers:u,context:i.context,params:l,reportProgress:i.reportProgress,responseType:i.responseType||"json",withCredentials:i.withCredentials,transferCache:i.transferCache,keepalive:i.keepalive,priority:i.priority,cache:i.cache,mode:i.mode,redirect:i.redirect,credentials:i.credentials,referrer:i.referrer,referrerPolicy:i.referrerPolicy,integrity:i.integrity,timeout:i.timeout})}let s=k(o).pipe(yn(u=>this.handler.handle(u)));if(e instanceof ve||i.observe==="events")return s;let c=s.pipe(Je(u=>u instanceof Ue));switch(i.observe||"body"){case"body":switch(o.responseType){case"arraybuffer":return c.pipe(A(u=>{if(u.body!==null&&!(u.body instanceof ArrayBuffer))throw new E(2806,!1);return u.body}));case"blob":return c.pipe(A(u=>{if(u.body!==null&&!(u.body instanceof Blob))throw new E(2807,!1);return u.body}));case"text":return c.pipe(A(u=>{if(u.body!==null&&typeof u.body!="string")throw new E(2808,!1);return u.body}));default:return c.pipe(A(u=>u.body))}case"response":return c;default:throw new E(2809,!1)}}delete(e,t={}){return this.request("DELETE",e,t)}get(e,t={}){return this.request("GET",e,t)}head(e,t={}){return this.request("HEAD",e,t)}jsonp(e,t){return this.request("JSONP",e,{params:new U().append(t,"JSONP_CALLBACK"),observe:"body",responseType:"json"})}options(e,t={}){return this.request("OPTIONS",e,t)}patch(e,t,i={}){return this.request("PATCH",e,Ht(i,t))}post(e,t,i={}){return this.request("POST",e,Ht(i,t))}put(e,t,i={}){return this.request("PUT",e,Ht(i,t))}static \u0275fac=function(t){return new(t||n)(m(Wt))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var Ji=new f("",{factory:()=>!0}),qi="XSRF-TOKEN",Qi=new f("",{factory:()=>qi}),eo="X-XSRF-TOKEN",to=new f("",{factory:()=>eo}),no=(()=>{class n{cookieName=a(Qi);doc=a(p);lastCookieString="";lastToken=null;parseCount=0;getToken(){let e=this.doc.cookie||"";return e!==this.lastCookieString&&(this.parseCount++,this.lastToken=Ne(e,this.cookieName),this.lastCookieString=e),this.lastToken}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),yr=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=m(no),i},providedIn:"root"})}return n})();function ro(n,r){if(!a(Ji)||n.method==="GET"||n.method==="HEAD")return r(n);try{let i=a(X).href,{origin:o}=new URL(i),{origin:s}=new URL(n.url,o);if(o!==s)return r(n)}catch(i){return r(n)}let e=a(yr).getToken(),t=a(to);return e!=null&&!n.headers.has(t)&&(n=n.clone({headers:n.headers.set(t,e)})),r(n)}function io(...n){let r=[De,vt,{provide:Wt,useExisting:vt},{provide:Gt,useFactory:()=>a(Ki,{optional:!0})??a(Vt)},{provide:gr,useValue:ro,multi:!0}];for(let e of n)r.push(...e.\u0275providers);return Tt(r)}var xu=(()=>{class n{_doc;constructor(e){this._doc=e}getTitle(){return this._doc.title}setTitle(e){this._doc.title=e||""}static \u0275fac=function(t){return new(t||n)(m(p))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var je=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:function(t){let i=null;return t?i=new(t||n):i=m(oo),i},providedIn:"root"})}return n})(),oo=(()=>{class n extends je{_doc;constructor(e){super(),this._doc=e}sanitize(e,t){if(t==null)return null;switch(e){case T.NONE:return t;case T.HTML:return me(t,"HTML")?le(t):Pn(this._doc,String(t)).toString();case T.STYLE:return me(t,"Style")?le(t):t;case T.SCRIPT:if(me(t,"Script"))return le(t);throw new E(5200,!1);case T.URL:return me(t,"URL")?le(t):kn(String(t));case T.RESOURCE_URL:if(me(t,"ResourceURL"))return le(t);throw new E(5201,!1);default:throw new E(5202,!1)}}bypassSecurityTrustHtml(e){return xn(e)}bypassSecurityTrustStyle(e){return Rn(e)}bypassSecurityTrustScript(e){return On(e)}bypassSecurityTrustUrl(e){return Nn(e)}bypassSecurityTrustResourceUrl(e){return Ln(e)}static \u0275fac=function(t){return new(t||n)(m(p))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function ze(n){return n.buttons===0||n.detail===0}function $e(n){let r=n.touches&&n.touches[0]||n.changedTouches&&n.changedTouches[0];return!!r&&r.identifier===-1&&(r.radiusX==null||r.radiusX===1)&&(r.radiusY==null||r.radiusY===1)}var Kt;function Dr(){if(Kt==null){let n=typeof document<"u"?document.head:null;Kt=!!(n&&(n.createShadowRoot||n.attachShadow))}return Kt}function Zt(n){if(Dr()){let r=n.getRootNode?n.getRootNode():null;if(typeof ShadowRoot<"u"&&ShadowRoot&&r instanceof ShadowRoot)return r}return null}function ao(){let n=typeof document<"u"&&document?document.activeElement:null;for(;n&&n.shadowRoot;){let r=n.shadowRoot.activeElement;if(r===n)break;n=r}return n}function j(n){return n.composedPath?n.composedPath()[0]:n.target}var Yt;try{Yt=typeof Intl<"u"&&Intl.v8BreakIterator}catch(n){Yt=!1}var x=(()=>{class n{_platformId=a(ue);isBrowser=this._platformId?er(this._platformId):typeof document=="object"&&!!document;EDGE=this.isBrowser&&/(edge)/i.test(navigator.userAgent);TRIDENT=this.isBrowser&&/(msie|trident)/i.test(navigator.userAgent);BLINK=this.isBrowser&&!!(window.chrome||Yt)&&typeof CSS<"u"&&!this.EDGE&&!this.TRIDENT;WEBKIT=this.isBrowser&&/AppleWebKit/i.test(navigator.userAgent)&&!this.BLINK&&!this.EDGE&&!this.TRIDENT;IOS=this.isBrowser&&/iPad|iPhone|iPod/.test(navigator.userAgent)&&!("MSStream"in window);FIREFOX=this.isBrowser&&/(firefox|minefield)/i.test(navigator.userAgent);ANDROID=this.isBrowser&&/android/i.test(navigator.userAgent)&&!this.TRIDENT;SAFARI=this.isBrowser&&/safari/i.test(navigator.userAgent)&&this.WEBKIT;constructor(){}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var He;function Er(){if(He==null&&typeof window<"u")try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:()=>He=!0}))}finally{He=He||!1}return He}function Ee(n){return Er()?n:!!n.capture}function co(n,r=0){return wr(n)?Number(n):arguments.length===2?r:0}function wr(n){return!isNaN(parseFloat(n))&&!isNaN(Number(n))}function J(n){return n instanceof P?n.nativeElement:n}var Ar=new f("cdk-input-modality-detector-options"),Cr={ignoreKeys:[18,17,224,91,16]},Ir=650,Xt={passive:!0,capture:!0},Tr=(()=>{class n{_platform=a(x);_listenerCleanups;modalityDetected;modalityChanged;get mostRecentModality(){return this._modality.value}_mostRecentTarget=null;_modality=new fn(null);_options;_lastTouchMs=0;_onKeydown=e=>{this._options?.ignoreKeys?.some(t=>t===e.keyCode)||(this._modality.next("keyboard"),this._mostRecentTarget=j(e))};_onMousedown=e=>{Date.now()-this._lastTouchMs<Ir||(this._modality.next(ze(e)?"keyboard":"mouse"),this._mostRecentTarget=j(e))};_onTouchstart=e=>{if($e(e)){this._modality.next("keyboard");return}this._lastTouchMs=Date.now(),this._modality.next("touch"),this._mostRecentTarget=j(e)};constructor(){let e=a(w),t=a(p),i=a(Ar,{optional:!0});if(this._options=y(y({},Cr),i),this.modalityDetected=this._modality.pipe(tt(1)),this.modalityChanged=this.modalityDetected.pipe(_n()),this._platform.isBrowser){let o=a(he).createRenderer(null,null);this._listenerCleanups=e.runOutsideAngular(()=>[o.listen(t,"keydown",this._onKeydown,Xt),o.listen(t,"mousedown",this._onMousedown,Xt),o.listen(t,"touchstart",this._onTouchstart,Xt)])}}ngOnDestroy(){this._modality.complete(),this._listenerCleanups?.forEach(e=>e())}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),Ve=(function(n){return n[n.IMMEDIATE=0]="IMMEDIATE",n[n.EVENTUAL=1]="EVENTUAL",n})(Ve||{}),Sr=new f("cdk-focus-monitor-default-options"),yt=Ee({passive:!0,capture:!0}),Jt=(()=>{class n{_ngZone=a(w);_platform=a(x);_inputModalityDetector=a(Tr);_origin=null;_lastFocusOrigin=null;_windowFocused=!1;_windowFocusTimeoutId;_originTimeoutId;_originFromTouchInteraction=!1;_elementInfo=new Map;_monitoredElementCount=0;_rootNodeFocusListenerCount=new Map;_detectionMode;_windowFocusListener=()=>{this._windowFocused=!0,this._windowFocusTimeoutId=setTimeout(()=>this._windowFocused=!1)};_document=a(p);_stopInputModalityDetector=new F;constructor(){let e=a(Sr,{optional:!0});this._detectionMode=e?.detectionMode||Ve.IMMEDIATE}_rootNodeFocusAndBlurListener=e=>{let t=j(e);for(let i=t;i;i=i.parentElement)e.type==="focus"?this._onFocus(e,i):this._onBlur(e,i)};monitor(e,t=!1){let i=J(e);if(!this._platform.isBrowser||i.nodeType!==1)return k();let o=Zt(i)||this._document,s=this._elementInfo.get(i);if(s)return t&&(s.checkChildren=!0),s.subject;let c={checkChildren:t,subject:new F,rootNode:o};return this._elementInfo.set(i,c),this._registerGlobalListeners(c),c.subject}stopMonitoring(e){let t=J(e),i=this._elementInfo.get(t);i&&(i.subject.complete(),this._setClasses(t),this._elementInfo.delete(t),this._removeGlobalListeners(i))}focusVia(e,t,i){let o=J(e),s=this._document.activeElement;o===s?this._getClosestElementsInfo(o).forEach(([c,u])=>this._originChanged(c,t,u)):(this._setOrigin(t),typeof o.focus=="function"&&o.focus(i))}ngOnDestroy(){this._elementInfo.forEach((e,t)=>this.stopMonitoring(t))}_getWindow(){return this._document.defaultView||window}_getFocusOrigin(e){return this._origin?this._originFromTouchInteraction?this._shouldBeAttributedToTouch(e)?"touch":"program":this._origin:this._windowFocused&&this._lastFocusOrigin?this._lastFocusOrigin:e&&this._isLastInteractionFromInputLabel(e)?"mouse":"program"}_shouldBeAttributedToTouch(e){return this._detectionMode===Ve.EVENTUAL||!!e?.contains(this._inputModalityDetector._mostRecentTarget)}_setClasses(e,t){e.classList.toggle("cdk-focused",!!t),e.classList.toggle("cdk-touch-focused",t==="touch"),e.classList.toggle("cdk-keyboard-focused",t==="keyboard"),e.classList.toggle("cdk-mouse-focused",t==="mouse"),e.classList.toggle("cdk-program-focused",t==="program")}_setOrigin(e,t=!1){this._ngZone.runOutsideAngular(()=>{if(this._origin=e,this._originFromTouchInteraction=e==="touch"&&t,this._detectionMode===Ve.IMMEDIATE){clearTimeout(this._originTimeoutId);let i=this._originFromTouchInteraction?Ir:1;this._originTimeoutId=setTimeout(()=>this._origin=null,i)}})}_onFocus(e,t){let i=this._elementInfo.get(t),o=j(e);!i||!i.checkChildren&&t!==o||this._originChanged(t,this._getFocusOrigin(o),i)}_onBlur(e,t){let i=this._elementInfo.get(t);!i||i.checkChildren&&e.relatedTarget instanceof Node&&t.contains(e.relatedTarget)||(this._setClasses(t),this._emitOrigin(i,null))}_emitOrigin(e,t){e.subject.observers.length&&this._ngZone.run(()=>e.subject.next(t))}_registerGlobalListeners(e){if(!this._platform.isBrowser)return;let t=e.rootNode,i=this._rootNodeFocusListenerCount.get(t)||0;i||this._ngZone.runOutsideAngular(()=>{t.addEventListener("focus",this._rootNodeFocusAndBlurListener,yt),t.addEventListener("blur",this._rootNodeFocusAndBlurListener,yt)}),this._rootNodeFocusListenerCount.set(t,i+1),++this._monitoredElementCount===1&&(this._ngZone.runOutsideAngular(()=>{this._getWindow().addEventListener("focus",this._windowFocusListener)}),this._inputModalityDetector.modalityDetected.pipe(nt(this._stopInputModalityDetector)).subscribe(o=>{this._setOrigin(o,!0)}))}_removeGlobalListeners(e){let t=e.rootNode;if(this._rootNodeFocusListenerCount.has(t)){let i=this._rootNodeFocusListenerCount.get(t);i>1?this._rootNodeFocusListenerCount.set(t,i-1):(t.removeEventListener("focus",this._rootNodeFocusAndBlurListener,yt),t.removeEventListener("blur",this._rootNodeFocusAndBlurListener,yt),this._rootNodeFocusListenerCount.delete(t))}--this._monitoredElementCount||(this._getWindow().removeEventListener("focus",this._windowFocusListener),this._stopInputModalityDetector.next(),clearTimeout(this._windowFocusTimeoutId),clearTimeout(this._originTimeoutId))}_originChanged(e,t,i){this._setClasses(e,t),this._emitOrigin(i,t),this._lastFocusOrigin=t}_getClosestElementsInfo(e){let t=[];return this._elementInfo.forEach((i,o)=>{(o===e||i.checkChildren&&o.contains(e))&&t.push([o,i])}),t}_isLastInteractionFromInputLabel(e){let{_mostRecentTarget:t,mostRecentModality:i}=this._inputModalityDetector;if(i!=="mouse"||!t||t===e||e.nodeName!=="INPUT"&&e.nodeName!=="TEXTAREA"||e.disabled)return!1;let o=e.labels;if(o){for(let s=0;s<o.length;s++)if(o[s].contains(t))return!0}return!1}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var _t=new WeakMap,ie=(()=>{class n{_appRef;_injector=a(O);_environmentInjector=a(Me);load(e){let t=this._appRef=this._appRef||this._injector.get(Rt),i=_t.get(t);i||(i={loaders:new Set,refs:[]},_t.set(t,i),t.onDestroy(()=>{_t.get(t)?.refs.forEach(o=>o.destroy()),_t.delete(t)})),i.loaders.has(e)||(i.loaders.add(e),i.refs.push(Kn(e,{environmentInjector:this._environmentInjector})))}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var Mr=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=N({type:n,selectors:[["ng-component"]],exportAs:["cdkVisuallyHidden"],decls:0,vars:0,template:function(t,i){},styles:[`.cdk-visually-hidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  left: 0;
}
[dir=rtl] .cdk-visually-hidden {
  left: auto;
  right: 0;
}
`],encapsulation:2,changeDetection:0})}return n})(),Dt;function uo(){if(Dt===void 0&&(Dt=null,typeof window<"u")){let n=window;n.trustedTypes!==void 0&&(Dt=n.trustedTypes.createPolicy("angular#components",{createHTML:r=>r}))}return Dt}function oe(n){return uo()?.createHTML(n)||n}function Fr(n,r,e){let t=e.sanitize(T.HTML,r);n.innerHTML=oe(t||"")}function qt(n){return Array.isArray(n)?n:[n]}var xr=new Set,se,Et=(()=>{class n{_platform=a(x);_nonce=a(de,{optional:!0});_matchMedia;constructor(){this._matchMedia=this._platform.isBrowser&&window.matchMedia?window.matchMedia.bind(window):mo}matchMedia(e){return(this._platform.WEBKIT||this._platform.BLINK)&&lo(e,this._nonce),this._matchMedia(e)}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function lo(n,r){if(!xr.has(n))try{se||(se=document.createElement("style"),r&&se.setAttribute("nonce",r),se.setAttribute("type","text/css"),document.head.appendChild(se)),se.sheet&&(se.sheet.insertRule(`@media ${n} {body{ }}`,0),xr.add(n))}catch(e){console.error(e)}}function mo(n){return{matches:n==="all"||n==="",media:n,addListener:()=>{},removeListener:()=>{}}}var Qt=(()=>{class n{_mediaMatcher=a(Et);_zone=a(w);_queries=new Map;_destroySubject=new F;constructor(){}ngOnDestroy(){this._destroySubject.next(),this._destroySubject.complete()}isMatched(e){return Rr(qt(e)).some(i=>this._registerQuery(i).mql.matches)}observe(e){let i=Rr(qt(e)).map(s=>this._registerQuery(s).observable),o=pn(i);return o=gn(o.pipe(Qe(1)),o.pipe(tt(1),qe(0))),o.pipe(A(s=>{let c={matches:!1,breakpoints:{}};return s.forEach(({matches:u,query:l})=>{c.matches=c.matches||u,c.breakpoints[l]=u}),c}))}_registerQuery(e){if(this._queries.has(e))return this._queries.get(e);let t=this._mediaMatcher.matchMedia(e),o={observable:new Xe(s=>{let c=u=>this._zone.run(()=>s.next(u));return t.addListener(c),()=>{t.removeListener(c)}}).pipe(En(t),A(({matches:s})=>({query:e,matches:s})),nt(this._destroySubject)),mql:t};return this._queries.set(e,o),o}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function Rr(n){return n.map(r=>r.split(",")).reduce((r,e)=>r.concat(e)).map(r=>r.trim())}var fo=(()=>{class n{create(e){return typeof MutationObserver>"u"?null:new MutationObserver(e)}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var Or=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=I({type:n});static \u0275inj=C({providers:[fo]})}return n})();var ho=(()=>{class n{_platform=a(x);constructor(){}isDisabled(e){return e.hasAttribute("disabled")}isVisible(e){return go(e)&&getComputedStyle(e).visibility==="visible"}isTabbable(e){if(!this._platform.isBrowser)return!1;let t=po(Ao(e));if(t&&(Nr(t)===-1||!this.isVisible(t)))return!1;let i=e.nodeName.toLowerCase(),o=Nr(e);return e.hasAttribute("contenteditable")?o!==-1:i==="iframe"||i==="object"||this._platform.WEBKIT&&this._platform.IOS&&!Eo(e)?!1:i==="audio"?e.hasAttribute("controls")?o!==-1:!1:i==="video"?o===-1?!1:o!==null?!0:this._platform.FIREFOX||e.hasAttribute("controls"):e.tabIndex>=0}isFocusable(e,t){return wo(e)&&!this.isDisabled(e)&&(t?.ignoreVisibility||this.isVisible(e))}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function po(n){try{return n.frameElement}catch(r){return null}}function go(n){return!!(n.offsetWidth||n.offsetHeight||typeof n.getClientRects=="function"&&n.getClientRects().length)}function bo(n){let r=n.nodeName.toLowerCase();return r==="input"||r==="select"||r==="button"||r==="textarea"}function vo(n){return _o(n)&&n.type=="hidden"}function yo(n){return Do(n)&&n.hasAttribute("href")}function _o(n){return n.nodeName.toLowerCase()=="input"}function Do(n){return n.nodeName.toLowerCase()=="a"}function Pr(n){if(!n.hasAttribute("tabindex")||n.tabIndex===void 0)return!1;let r=n.getAttribute("tabindex");return!!(r&&!isNaN(parseInt(r,10)))}function Nr(n){if(!Pr(n))return null;let r=parseInt(n.getAttribute("tabindex")||"",10);return isNaN(r)?-1:r}function Eo(n){let r=n.nodeName.toLowerCase(),e=r==="input"&&n.type;return e==="text"||e==="password"||r==="select"||r==="textarea"}function wo(n){return vo(n)?!1:bo(n)||yo(n)||n.hasAttribute("contenteditable")||Pr(n)}function Ao(n){return n.ownerDocument&&n.ownerDocument.defaultView||window}var tn=class{_element;_checker;_ngZone;_document;_injector;_startAnchor=null;_endAnchor=null;_hasAttached=!1;startAnchorListener=()=>this.focusLastTabbableElement();endAnchorListener=()=>this.focusFirstTabbableElement();get enabled(){return this._enabled}set enabled(r){this._enabled=r,this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(r,this._startAnchor),this._toggleAnchorTabIndex(r,this._endAnchor))}_enabled=!0;constructor(r,e,t,i,o=!1,s){this._element=r,this._checker=e,this._ngZone=t,this._document=i,this._injector=s,o||this.attachAnchors()}destroy(){let r=this._startAnchor,e=this._endAnchor;r&&(r.removeEventListener("focus",this.startAnchorListener),r.remove()),e&&(e.removeEventListener("focus",this.endAnchorListener),e.remove()),this._startAnchor=this._endAnchor=null,this._hasAttached=!1}attachAnchors(){return this._hasAttached?!0:(this._ngZone.runOutsideAngular(()=>{this._startAnchor||(this._startAnchor=this._createAnchor(),this._startAnchor.addEventListener("focus",this.startAnchorListener)),this._endAnchor||(this._endAnchor=this._createAnchor(),this._endAnchor.addEventListener("focus",this.endAnchorListener))}),this._element.parentNode&&(this._element.parentNode.insertBefore(this._startAnchor,this._element),this._element.parentNode.insertBefore(this._endAnchor,this._element.nextSibling),this._hasAttached=!0),this._hasAttached)}focusInitialElementWhenReady(r){return new Promise(e=>{this._executeOnStable(()=>e(this.focusInitialElement(r)))})}focusFirstTabbableElementWhenReady(r){return new Promise(e=>{this._executeOnStable(()=>e(this.focusFirstTabbableElement(r)))})}focusLastTabbableElementWhenReady(r){return new Promise(e=>{this._executeOnStable(()=>e(this.focusLastTabbableElement(r)))})}_getRegionBoundary(r){let e=this._element.querySelectorAll(`[cdk-focus-region-${r}], [cdkFocusRegion${r}], [cdk-focus-${r}]`);return r=="start"?e.length?e[0]:this._getFirstTabbableElement(this._element):e.length?e[e.length-1]:this._getLastTabbableElement(this._element)}focusInitialElement(r){let e=this._element.querySelector("[cdk-focus-initial], [cdkFocusInitial]");if(e){if(!this._checker.isFocusable(e)){let t=this._getFirstTabbableElement(e);return t?.focus(r),!!t}return e.focus(r),!0}return this.focusFirstTabbableElement(r)}focusFirstTabbableElement(r){let e=this._getRegionBoundary("start");return e&&e.focus(r),!!e}focusLastTabbableElement(r){let e=this._getRegionBoundary("end");return e&&e.focus(r),!!e}hasAttached(){return this._hasAttached}_getFirstTabbableElement(r){if(this._checker.isFocusable(r)&&this._checker.isTabbable(r))return r;let e=r.children;for(let t=0;t<e.length;t++){let i=e[t].nodeType===this._document.ELEMENT_NODE?this._getFirstTabbableElement(e[t]):null;if(i)return i}return null}_getLastTabbableElement(r){if(this._checker.isFocusable(r)&&this._checker.isTabbable(r))return r;let e=r.children;for(let t=e.length-1;t>=0;t--){let i=e[t].nodeType===this._document.ELEMENT_NODE?this._getLastTabbableElement(e[t]):null;if(i)return i}return null}_createAnchor(){let r=this._document.createElement("div");return this._toggleAnchorTabIndex(this._enabled,r),r.classList.add("cdk-visually-hidden"),r.classList.add("cdk-focus-trap-anchor"),r.setAttribute("aria-hidden","true"),r}_toggleAnchorTabIndex(r,e){r?e.setAttribute("tabindex","0"):e.removeAttribute("tabindex")}toggleAnchors(r){this._startAnchor&&this._endAnchor&&(this._toggleAnchorTabIndex(r,this._startAnchor),this._toggleAnchorTabIndex(r,this._endAnchor))}_executeOnStable(r){this._injector?Un(r,{injector:this._injector}):setTimeout(r)}},Co=(()=>{class n{_checker=a(ho);_ngZone=a(w);_document=a(p);_injector=a(O);constructor(){a(ie).load(Mr)}create(e,t=!1){return new tn(e,this._checker,this._ngZone,this._document,t,this._injector)}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var Br=new f("liveAnnouncerElement",{providedIn:"root",factory:()=>null}),Ur=new f("LIVE_ANNOUNCER_DEFAULT_OPTIONS"),Io=0,To=(()=>{class n{_ngZone=a(w);_defaultOptions=a(Ur,{optional:!0});_liveElement;_document=a(p);_sanitizer=a(je);_previousTimeout;_currentPromise;_currentResolve;constructor(){let e=a(Br,{optional:!0});this._liveElement=e||this._createLiveElement()}announce(e,...t){let i=this._defaultOptions,o,s;return t.length===1&&typeof t[0]=="number"?s=t[0]:[o,s]=t,this.clear(),clearTimeout(this._previousTimeout),o||(o=i&&i.politeness?i.politeness:"polite"),s==null&&i&&(s=i.duration),this._liveElement.setAttribute("aria-live",o),this._liveElement.id&&this._exposeAnnouncerToModals(this._liveElement.id),this._ngZone.runOutsideAngular(()=>(this._currentPromise||(this._currentPromise=new Promise(c=>this._currentResolve=c)),clearTimeout(this._previousTimeout),this._previousTimeout=setTimeout(()=>{!e||typeof e=="string"?this._liveElement.textContent=e:Fr(this._liveElement,e,this._sanitizer),typeof s=="number"&&(this._previousTimeout=setTimeout(()=>this.clear(),s)),this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0},100),this._currentPromise))}clear(){this._liveElement&&(this._liveElement.textContent="")}ngOnDestroy(){clearTimeout(this._previousTimeout),this._liveElement?.remove(),this._liveElement=null,this._currentResolve?.(),this._currentPromise=this._currentResolve=void 0}_createLiveElement(){let e="cdk-live-announcer-element",t=this._document.getElementsByClassName(e),i=this._document.createElement("div");for(let o=0;o<t.length;o++)t[o].remove();return i.classList.add(e),i.classList.add("cdk-visually-hidden"),i.setAttribute("aria-atomic","true"),i.setAttribute("aria-live","polite"),i.id=`cdk-live-announcer-${Io++}`,this._document.body.appendChild(i),i}_exposeAnnouncerToModals(e){let t=this._document.querySelectorAll('body > .cdk-overlay-container [aria-modal="true"]');for(let i=0;i<t.length;i++){let o=t[i],s=o.getAttribute("aria-owns");s?s.indexOf(e)===-1&&o.setAttribute("aria-owns",s+" "+e):o.setAttribute("aria-owns",e)}}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var q=(function(n){return n[n.NONE=0]="NONE",n[n.BLACK_ON_WHITE=1]="BLACK_ON_WHITE",n[n.WHITE_ON_BLACK=2]="WHITE_ON_BLACK",n})(q||{}),Lr="cdk-high-contrast-black-on-white",kr="cdk-high-contrast-white-on-black",en="cdk-high-contrast-active",jr=(()=>{class n{_platform=a(x);_hasCheckedHighContrastMode=!1;_document=a(p);_breakpointSubscription;constructor(){this._breakpointSubscription=a(Qt).observe("(forced-colors: active)").subscribe(()=>{this._hasCheckedHighContrastMode&&(this._hasCheckedHighContrastMode=!1,this._applyBodyHighContrastModeCssClasses())})}getHighContrastMode(){if(!this._platform.isBrowser)return q.NONE;let e=this._document.createElement("div");e.style.backgroundColor="rgb(1,2,3)",e.style.position="absolute",this._document.body.appendChild(e);let t=this._document.defaultView||window,i=t&&t.getComputedStyle?t.getComputedStyle(e):null,o=(i&&i.backgroundColor||"").replace(/ /g,"");switch(e.remove(),o){case"rgb(0,0,0)":case"rgb(45,50,54)":case"rgb(32,32,32)":return q.WHITE_ON_BLACK;case"rgb(255,255,255)":case"rgb(255,250,239)":return q.BLACK_ON_WHITE}return q.NONE}ngOnDestroy(){this._breakpointSubscription.unsubscribe()}_applyBodyHighContrastModeCssClasses(){if(!this._hasCheckedHighContrastMode&&this._platform.isBrowser&&this._document.body){let e=this._document.body.classList;e.remove(en,Lr,kr),this._hasCheckedHighContrastMode=!0;let t=this.getHighContrastMode();t===q.BLACK_ON_WHITE?e.add(en,Lr):t===q.WHITE_ON_BLACK&&e.add(en,kr)}}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),So=(()=>{class n{constructor(){a(jr)._applyBodyHighContrastModeCssClasses()}static \u0275fac=function(t){return new(t||n)};static \u0275mod=I({type:n});static \u0275inj=C({imports:[Or]})}return n})();var Mo=200,wt=class{_letterKeyStream=new F;_items=[];_selectedItemIndex=-1;_pressedLetters=[];_skipPredicateFn;_selectedItem=new F;selectedItem=this._selectedItem;constructor(r,e){let t=typeof e?.debounceInterval=="number"?e.debounceInterval:Mo;e?.skipPredicate&&(this._skipPredicateFn=e.skipPredicate),this.setItems(r),this._setupKeyHandler(t)}destroy(){this._pressedLetters=[],this._letterKeyStream.complete(),this._selectedItem.complete()}setCurrentSelectedItemIndex(r){this._selectedItemIndex=r}setItems(r){this._items=r}handleKey(r){let e=r.keyCode;r.key&&r.key.length===1?this._letterKeyStream.next(r.key.toLocaleUpperCase()):(e>=65&&e<=90||e>=48&&e<=57)&&this._letterKeyStream.next(String.fromCharCode(e))}isTyping(){return this._pressedLetters.length>0}reset(){this._pressedLetters=[]}_setupKeyHandler(r){this._letterKeyStream.pipe(ce(e=>this._pressedLetters.push(e)),qe(r),Je(()=>this._pressedLetters.length>0),A(()=>this._pressedLetters.join("").toLocaleUpperCase())).subscribe(e=>{for(let t=1;t<this._items.length+1;t++){let i=(this._selectedItemIndex+t)%this._items.length,o=this._items[i];if(!this._skipPredicateFn?.(o)&&o.getLabel?.().toLocaleUpperCase().trim().indexOf(e)===0){this._selectedItem.next(o);break}}this._pressedLetters=[]})}};function zr(n,...r){return r.length?r.some(e=>n[e]):n.altKey||n.shiftKey||n.ctrlKey||n.metaKey}var we=class{_items;_activeItemIndex=Fe(-1);_activeItem=Fe(null);_wrap=!1;_typeaheadSubscription=Ye.EMPTY;_itemChangesSubscription;_vertical=!0;_horizontal=null;_allowedModifierKeys=[];_homeAndEnd=!1;_pageUpAndDown={enabled:!1,delta:10};_effectRef;_typeahead;_skipPredicateFn=r=>r.disabled;constructor(r,e){this._items=r,r instanceof Ft?this._itemChangesSubscription=r.changes.subscribe(t=>this._itemsChanged(t.toArray())):st(r)&&(this._effectRef=Tn(()=>this._itemsChanged(r()),{injector:e}))}tabOut=new F;change=new F;skipPredicate(r){return this._skipPredicateFn=r,this}withWrap(r=!0){return this._wrap=r,this}withVerticalOrientation(r=!0){return this._vertical=r,this}withHorizontalOrientation(r){return this._horizontal=r,this}withAllowedModifierKeys(r){return this._allowedModifierKeys=r,this}withTypeAhead(r=200){this._typeaheadSubscription.unsubscribe();let e=this._getItemsArray();return this._typeahead=new wt(e,{debounceInterval:typeof r=="number"?r:void 0,skipPredicate:t=>this._skipPredicateFn(t)}),this._typeaheadSubscription=this._typeahead.selectedItem.subscribe(t=>{this.setActiveItem(t)}),this}cancelTypeahead(){return this._typeahead?.reset(),this}withHomeAndEnd(r=!0){return this._homeAndEnd=r,this}withPageUpDown(r=!0,e=10){return this._pageUpAndDown={enabled:r,delta:e},this}setActiveItem(r){let e=this._activeItem();this.updateActiveItem(r),this._activeItem()!==e&&this.change.next(this._activeItemIndex())}onKeydown(r){let e=r.keyCode,i=["altKey","ctrlKey","metaKey","shiftKey"].every(o=>!r[o]||this._allowedModifierKeys.indexOf(o)>-1);switch(e){case 9:this.tabOut.next();return;case 40:if(this._vertical&&i){this.setNextItemActive();break}else return;case 38:if(this._vertical&&i){this.setPreviousItemActive();break}else return;case 39:if(this._horizontal&&i){this._horizontal==="rtl"?this.setPreviousItemActive():this.setNextItemActive();break}else return;case 37:if(this._horizontal&&i){this._horizontal==="rtl"?this.setNextItemActive():this.setPreviousItemActive();break}else return;case 36:if(this._homeAndEnd&&i){this.setFirstItemActive();break}else return;case 35:if(this._homeAndEnd&&i){this.setLastItemActive();break}else return;case 33:if(this._pageUpAndDown.enabled&&i){let o=this._activeItemIndex()-this._pageUpAndDown.delta;this._setActiveItemByIndex(o>0?o:0,1);break}else return;case 34:if(this._pageUpAndDown.enabled&&i){let o=this._activeItemIndex()+this._pageUpAndDown.delta,s=this._getItemsArray().length;this._setActiveItemByIndex(o<s?o:s-1,-1);break}else return;default:(i||zr(r,"shiftKey"))&&this._typeahead?.handleKey(r);return}this._typeahead?.reset(),r.preventDefault()}get activeItemIndex(){return this._activeItemIndex()}get activeItem(){return this._activeItem()}isTyping(){return!!this._typeahead&&this._typeahead.isTyping()}setFirstItemActive(){this._setActiveItemByIndex(0,1)}setLastItemActive(){this._setActiveItemByIndex(this._getItemsArray().length-1,-1)}setNextItemActive(){this._activeItemIndex()<0?this.setFirstItemActive():this._setActiveItemByDelta(1)}setPreviousItemActive(){this._activeItemIndex()<0&&this._wrap?this.setLastItemActive():this._setActiveItemByDelta(-1)}updateActiveItem(r){let e=this._getItemsArray(),t=typeof r=="number"?r:e.indexOf(r),i=e[t];this._activeItem.set(i??null),this._activeItemIndex.set(t),this._typeahead?.setCurrentSelectedItemIndex(t)}destroy(){this._typeaheadSubscription.unsubscribe(),this._itemChangesSubscription?.unsubscribe(),this._effectRef?.destroy(),this._typeahead?.destroy(),this.tabOut.complete(),this.change.complete()}_setActiveItemByDelta(r){this._wrap?this._setActiveInWrapMode(r):this._setActiveInDefaultMode(r)}_setActiveInWrapMode(r){let e=this._getItemsArray();for(let t=1;t<=e.length;t++){let i=(this._activeItemIndex()+r*t+e.length)%e.length,o=e[i];if(!this._skipPredicateFn(o)){this.setActiveItem(i);return}}}_setActiveInDefaultMode(r){this._setActiveItemByIndex(this._activeItemIndex()+r,r)}_setActiveItemByIndex(r,e){let t=this._getItemsArray();if(t[r]){for(;this._skipPredicateFn(t[r]);)if(r+=e,!t[r])return;this.setActiveItem(r)}}_getItemsArray(){return st(this._items)?this._items():this._items instanceof Ft?this._items.toArray():this._items}_itemsChanged(r){this._typeahead?.setItems(r);let e=this._activeItem();if(e){let t=r.indexOf(e);t>-1&&t!==this._activeItemIndex()&&(this._activeItemIndex.set(t),this._typeahead?.setCurrentSelectedItemIndex(t))}}};var nn=class extends we{setActiveItem(r){this.activeItem&&this.activeItem.setInactiveStyles(),super.setActiveItem(r),this.activeItem&&this.activeItem.setActiveStyles()}};var rn=class extends we{_origin="program";setFocusOrigin(r){return this._origin=r,this}setActiveItem(r){super.setActiveItem(r),this.activeItem&&this.activeItem.focus(this._origin)}};var on={},sn=class n{_appId=a(xe);static _infix=`a${Math.floor(Math.random()*1e5).toString()}`;getId(r,e=!1){return this._appId!=="ng"&&(r+=this._appId),on.hasOwnProperty(r)||(on[r]=0),`${r}${e?n._infix+"-":""}${on[r]++}`}static \u0275fac=function(e){return new(e||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})};var $r=" ";function gl(n,r,e){let t=Hr(n,r);e=e.trim(),!t.some(i=>i.trim()===e)&&(t.push(e),n.setAttribute(r,t.join($r)))}function bl(n,r,e){let t=Hr(n,r);e=e.trim();let i=t.filter(o=>o!==e);i.length?n.setAttribute(r,i.join($r)):n.removeAttribute(r)}function Hr(n,r){return n.getAttribute(r)?.match(/\S+/g)??[]}var Ge=(function(n){return n[n.NORMAL=0]="NORMAL",n[n.NEGATED=1]="NEGATED",n[n.INVERTED=2]="INVERTED",n})(Ge||{}),At,ae;function Cl(){if(ae==null){if(typeof document!="object"||!document||typeof Element!="function"||!Element)return ae=!1,ae;if(document.documentElement?.style&&"scrollBehavior"in document.documentElement.style)ae=!0;else{let n=Element.prototype.scrollTo;n?ae=!/\{\s*\[native code\]\s*\}/.test(n.toString()):ae=!1}}return ae}function Il(){if(typeof document!="object"||!document)return Ge.NORMAL;if(At==null){let n=document.createElement("div"),r=n.style;n.dir="rtl",r.width="1px",r.overflow="auto",r.visibility="hidden",r.pointerEvents="none",r.position="absolute";let e=document.createElement("div"),t=e.style;t.width="2px",t.height="1px",n.appendChild(e),document.body.appendChild(n),At=Ge.NORMAL,n.scrollLeft===0&&(n.scrollLeft=1,At=n.scrollLeft===0?Ge.NEGATED:Ge.INVERTED),n.remove()}return At}function Sl(){return typeof __karma__<"u"&&!!__karma__||typeof jasmine<"u"&&!!jasmine||typeof jest<"u"&&!!jest||typeof Mocha<"u"&&!!Mocha}var Ae,Vr=["color","button","checkbox","date","datetime-local","email","file","hidden","image","month","number","password","radio","range","reset","search","submit","tel","text","time","url","week"];function Fl(){if(Ae)return Ae;if(typeof document!="object"||!document)return Ae=new Set(Vr),Ae;let n=document.createElement("input");return Ae=new Set(Vr.filter(r=>(n.setAttribute("type",r),n.type===r))),Ae}var Ll={XSmall:"(max-width: 599.98px)",Small:"(min-width: 600px) and (max-width: 959.98px)",Medium:"(min-width: 960px) and (max-width: 1279.98px)",Large:"(min-width: 1280px) and (max-width: 1919.98px)",XLarge:"(min-width: 1920px)",Handset:"(max-width: 599.98px) and (orientation: portrait), (max-width: 959.98px) and (orientation: landscape)",Tablet:"(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), (min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)",Web:"(min-width: 840px) and (orientation: portrait), (min-width: 1280px) and (orientation: landscape)",HandsetPortrait:"(max-width: 599.98px) and (orientation: portrait)",TabletPortrait:"(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)",WebPortrait:"(min-width: 840px) and (orientation: portrait)",HandsetLandscape:"(max-width: 959.98px) and (orientation: landscape)",TabletLandscape:"(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)",WebLandscape:"(min-width: 1280px) and (orientation: landscape)"};var Fo=new f("MATERIAL_ANIMATIONS"),Gr=null;function xo(){return a(Fo,{optional:!0})?.animationsDisabled||a(Fn,{optional:!0})==="NoopAnimations"?"di-disabled":(Gr??=a(Et).matchMedia("(prefers-reduced-motion)").matches,Gr?"reduced-motion":"enabled")}function Ce(){return xo()!=="enabled"}function zl(n){return n==null?"":typeof n=="string"?n:`${n}px`}function Hl(n){return n!=null&&`${n}`!="false"}var L=(function(n){return n[n.FADING_IN=0]="FADING_IN",n[n.VISIBLE=1]="VISIBLE",n[n.FADING_OUT=2]="FADING_OUT",n[n.HIDDEN=3]="HIDDEN",n})(L||{}),an=class{_renderer;element;config;_animationForciblyDisabledThroughCss;state=L.HIDDEN;constructor(r,e,t,i=!1){this._renderer=r,this.element=e,this.config=t,this._animationForciblyDisabledThroughCss=i}fadeOut(){this._renderer.fadeOutRipple(this)}},Wr=Ee({passive:!0,capture:!0}),cn=class{_events=new Map;addHandler(r,e,t,i){let o=this._events.get(e);if(o){let s=o.get(t);s?s.add(i):o.set(t,new Set([i]))}else this._events.set(e,new Map([[t,new Set([i])]])),r.runOutsideAngular(()=>{document.addEventListener(e,this._delegateEventHandler,Wr)})}removeHandler(r,e,t){let i=this._events.get(r);if(!i)return;let o=i.get(e);o&&(o.delete(t),o.size===0&&i.delete(e),i.size===0&&(this._events.delete(r),document.removeEventListener(r,this._delegateEventHandler,Wr)))}_delegateEventHandler=r=>{let e=j(r);e&&this._events.get(r.type)?.forEach((t,i)=>{(i===e||i.contains(e))&&t.forEach(o=>o.handleEvent(r))})}},We={enterDuration:225,exitDuration:150},Ro=800,Kr=Ee({passive:!0,capture:!0}),Zr=["mousedown","touchstart"],Yr=["mouseup","mouseleave","touchend","touchcancel"],Oo=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=N({type:n,selectors:[["ng-component"]],hostAttrs:["mat-ripple-style-loader",""],decls:0,vars:0,template:function(t,i){},styles:[`.mat-ripple {
  overflow: hidden;
  position: relative;
}
.mat-ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-ripple.mat-ripple-unbounded {
  overflow: visible;
}

.mat-ripple-element {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  transition: opacity, transform 0ms cubic-bezier(0, 0, 0.2, 1);
  transform: scale3d(0, 0, 0);
  background-color: var(--mat-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent));
}
@media (forced-colors: active) {
  .mat-ripple-element {
    display: none;
  }
}
.cdk-drag-preview .mat-ripple-element, .cdk-drag-placeholder .mat-ripple-element {
  display: none;
}
`],encapsulation:2,changeDetection:0})}return n})(),Ke=class n{_target;_ngZone;_platform;_containerElement;_triggerElement=null;_isPointerDown=!1;_activeRipples=new Map;_mostRecentTransientRipple=null;_lastTouchStartEvent;_pointerUpEventsRegistered=!1;_containerRect=null;static _eventManager=new cn;constructor(r,e,t,i,o){this._target=r,this._ngZone=e,this._platform=i,i.isBrowser&&(this._containerElement=J(t)),o&&o.get(ie).load(Oo)}fadeInRipple(r,e,t={}){let i=this._containerRect=this._containerRect||this._containerElement.getBoundingClientRect(),o=y(y({},We),t.animation);t.centered&&(r=i.left+i.width/2,e=i.top+i.height/2);let s=t.radius||No(r,e,i),c=r-i.left,u=e-i.top,l=o.enterDuration,h=document.createElement("div");h.classList.add("mat-ripple-element"),h.style.left=`${c-s}px`,h.style.top=`${u-s}px`,h.style.height=`${s*2}px`,h.style.width=`${s*2}px`,t.color!=null&&(h.style.backgroundColor=t.color),h.style.transitionDuration=`${l}ms`,this._containerElement.appendChild(h);let _=window.getComputedStyle(h),S=_.transitionProperty,Q=_.transitionDuration,W=S==="none"||Q==="0s"||Q==="0s, 0s"||i.width===0&&i.height===0,R=new an(this,h,t,W);h.style.transform="scale3d(1, 1, 1)",R.state=L.FADING_IN,t.persistent||(this._mostRecentTransientRipple=R);let g=null;return!W&&(l||o.exitDuration)&&this._ngZone.runOutsideAngular(()=>{let b=()=>{g&&(g.fallbackTimer=null),clearTimeout(H),this._finishRippleTransition(R)},M=()=>this._destroyRipple(R),H=setTimeout(M,l+100);h.addEventListener("transitionend",b),h.addEventListener("transitioncancel",M),g={onTransitionEnd:b,onTransitionCancel:M,fallbackTimer:H}}),this._activeRipples.set(R,g),(W||!l)&&this._finishRippleTransition(R),R}fadeOutRipple(r){if(r.state===L.FADING_OUT||r.state===L.HIDDEN)return;let e=r.element,t=y(y({},We),r.config.animation);e.style.transitionDuration=`${t.exitDuration}ms`,e.style.opacity="0",r.state=L.FADING_OUT,(r._animationForciblyDisabledThroughCss||!t.exitDuration)&&this._finishRippleTransition(r)}fadeOutAll(){this._getActiveRipples().forEach(r=>r.fadeOut())}fadeOutAllNonPersistent(){this._getActiveRipples().forEach(r=>{r.config.persistent||r.fadeOut()})}setupTriggerEvents(r){let e=J(r);!this._platform.isBrowser||!e||e===this._triggerElement||(this._removeTriggerEvents(),this._triggerElement=e,Zr.forEach(t=>{n._eventManager.addHandler(this._ngZone,t,e,this)}))}handleEvent(r){r.type==="mousedown"?this._onMousedown(r):r.type==="touchstart"?this._onTouchStart(r):this._onPointerUp(),this._pointerUpEventsRegistered||(this._ngZone.runOutsideAngular(()=>{Yr.forEach(e=>{this._triggerElement.addEventListener(e,this,Kr)})}),this._pointerUpEventsRegistered=!0)}_finishRippleTransition(r){r.state===L.FADING_IN?this._startFadeOutTransition(r):r.state===L.FADING_OUT&&this._destroyRipple(r)}_startFadeOutTransition(r){let e=r===this._mostRecentTransientRipple,{persistent:t}=r.config;r.state=L.VISIBLE,!t&&(!e||!this._isPointerDown)&&r.fadeOut()}_destroyRipple(r){let e=this._activeRipples.get(r)??null;this._activeRipples.delete(r),this._activeRipples.size||(this._containerRect=null),r===this._mostRecentTransientRipple&&(this._mostRecentTransientRipple=null),r.state=L.HIDDEN,e!==null&&(r.element.removeEventListener("transitionend",e.onTransitionEnd),r.element.removeEventListener("transitioncancel",e.onTransitionCancel),e.fallbackTimer!==null&&clearTimeout(e.fallbackTimer)),r.element.remove()}_onMousedown(r){let e=ze(r),t=this._lastTouchStartEvent&&Date.now()<this._lastTouchStartEvent+Ro;!this._target.rippleDisabled&&!e&&!t&&(this._isPointerDown=!0,this.fadeInRipple(r.clientX,r.clientY,this._target.rippleConfig))}_onTouchStart(r){if(!this._target.rippleDisabled&&!$e(r)){this._lastTouchStartEvent=Date.now(),this._isPointerDown=!0;let e=r.changedTouches;if(e)for(let t=0;t<e.length;t++)this.fadeInRipple(e[t].clientX,e[t].clientY,this._target.rippleConfig)}}_onPointerUp(){this._isPointerDown&&(this._isPointerDown=!1,this._getActiveRipples().forEach(r=>{let e=r.state===L.VISIBLE||r.config.terminateOnPointerUp&&r.state===L.FADING_IN;!r.config.persistent&&e&&r.fadeOut()}))}_getActiveRipples(){return Array.from(this._activeRipples.keys())}_removeTriggerEvents(){let r=this._triggerElement;r&&(Zr.forEach(e=>n._eventManager.removeHandler(e,r,this)),this._pointerUpEventsRegistered&&(Yr.forEach(e=>r.removeEventListener(e,this,Kr)),this._pointerUpEventsRegistered=!1))}};function No(n,r,e){let t=Math.max(Math.abs(n-e.left),Math.abs(n-e.right)),i=Math.max(Math.abs(r-e.top),Math.abs(r-e.bottom));return Math.sqrt(t*t+i*i)}var un=new f("mat-ripple-global-options"),rm=(()=>{class n{_elementRef=a(P);_animationsDisabled=Ce();color;unbounded=!1;centered=!1;radius=0;animation;get disabled(){return this._disabled}set disabled(e){e&&this.fadeOutAllNonPersistent(),this._disabled=e,this._setupTriggerEventsIfEnabled()}_disabled=!1;get trigger(){return this._trigger||this._elementRef.nativeElement}set trigger(e){this._trigger=e,this._setupTriggerEventsIfEnabled()}_trigger;_rippleRenderer;_globalOptions;_isInitialized=!1;constructor(){let e=a(w),t=a(x),i=a(un,{optional:!0}),o=a(O);this._globalOptions=i||{},this._rippleRenderer=new Ke(this,e,this._elementRef,t,o)}ngOnInit(){this._isInitialized=!0,this._setupTriggerEventsIfEnabled()}ngOnDestroy(){this._rippleRenderer._removeTriggerEvents()}fadeOutAll(){this._rippleRenderer.fadeOutAll()}fadeOutAllNonPersistent(){this._rippleRenderer.fadeOutAllNonPersistent()}get rippleConfig(){return{centered:this.centered,radius:this.radius,color:this.color,animation:y(y(y({},this._globalOptions.animation),this._animationsDisabled?{enterDuration:0,exitDuration:0}:{}),this.animation),terminateOnPointerUp:this._globalOptions.terminateOnPointerUp}}get rippleDisabled(){return this.disabled||!!this._globalOptions.disabled}_setupTriggerEventsIfEnabled(){!this.disabled&&this._isInitialized&&this._rippleRenderer.setupTriggerEvents(this.trigger)}launch(e,t=0,i){return typeof e=="number"?this._rippleRenderer.fadeInRipple(e,t,y(y({},this.rippleConfig),i)):this._rippleRenderer.fadeInRipple(0,0,y(y({},this.rippleConfig),e))}static \u0275fac=function(t){return new(t||n)};static \u0275dir=z({type:n,selectors:[["","mat-ripple",""],["","matRipple",""]],hostAttrs:[1,"mat-ripple"],hostVars:2,hostBindings:function(t,i){t&2&&Z("mat-ripple-unbounded",i.unbounded)},inputs:{color:[0,"matRippleColor","color"],unbounded:[0,"matRippleUnbounded","unbounded"],centered:[0,"matRippleCentered","centered"],radius:[0,"matRippleRadius","radius"],animation:[0,"matRippleAnimation","animation"],disabled:[0,"matRippleDisabled","disabled"],trigger:[0,"matRippleTrigger","trigger"]},exportAs:["matRipple"]})}return n})();var Lo={capture:!0},ko=["focus","mousedown","mouseenter","touchstart"],dn="mat-ripple-loader-uninitialized",ln="mat-ripple-loader-class-name",Xr="mat-ripple-loader-centered",Ct="mat-ripple-loader-disabled",Jr=(()=>{class n{_document=a(p);_animationsDisabled=Ce();_globalRippleOptions=a(un,{optional:!0});_platform=a(x);_ngZone=a(w);_injector=a(O);_eventCleanups;_hosts=new Map;constructor(){let e=a(he).createRenderer(null,null);this._eventCleanups=this._ngZone.runOutsideAngular(()=>ko.map(t=>e.listen(this._document,t,this._onInteraction,Lo)))}ngOnDestroy(){let e=this._hosts.keys();for(let t of e)this.destroyRipple(t);this._eventCleanups.forEach(t=>t())}configureRipple(e,t){e.setAttribute(dn,this._globalRippleOptions?.namespace??""),(t.className||!e.hasAttribute(ln))&&e.setAttribute(ln,t.className||""),t.centered&&e.setAttribute(Xr,""),t.disabled&&e.setAttribute(Ct,"")}setDisabled(e,t){let i=this._hosts.get(e);i?(i.target.rippleDisabled=t,!t&&!i.hasSetUpEvents&&(i.hasSetUpEvents=!0,i.renderer.setupTriggerEvents(e))):t?e.setAttribute(Ct,""):e.removeAttribute(Ct)}_onInteraction=e=>{let t=j(e);if(t instanceof HTMLElement){let i=t.closest(`[${dn}="${this._globalRippleOptions?.namespace??""}"]`);i&&this._createRipple(i)}};_createRipple(e){if(!this._document||this._hosts.has(e))return;e.querySelector(".mat-ripple")?.remove();let t=this._document.createElement("span");t.classList.add("mat-ripple",e.getAttribute(ln)),e.append(t);let i=this._globalRippleOptions,o=this._animationsDisabled?0:i?.animation?.enterDuration??We.enterDuration,s=this._animationsDisabled?0:i?.animation?.exitDuration??We.exitDuration,c={rippleDisabled:this._animationsDisabled||i?.disabled||e.hasAttribute(Ct),rippleConfig:{centered:e.hasAttribute(Xr),terminateOnPointerUp:i?.terminateOnPointerUp,animation:{enterDuration:o,exitDuration:s}}},u=new Ke(c,this._ngZone,t,this._platform,this._injector),l=!c.rippleDisabled;l&&u.setupTriggerEvents(e),this._hosts.set(e,{target:c,renderer:u,hasSetUpEvents:l}),e.removeAttribute(dn)}destroyRipple(e){let t=this._hosts.get(e);t&&(t.renderer._removeTriggerEvents(),this._hosts.delete(e))}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var qr=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275cmp=N({type:n,selectors:[["structural-styles"]],decls:0,vars:0,template:function(t,i){},styles:[`.mat-focus-indicator {
  position: relative;
}
.mat-focus-indicator::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  box-sizing: border-box;
  pointer-events: none;
  display: var(--mat-focus-indicator-display, none);
  border-width: var(--mat-focus-indicator-border-width, 3px);
  border-style: var(--mat-focus-indicator-border-style, solid);
  border-color: var(--mat-focus-indicator-border-color, transparent);
  border-radius: var(--mat-focus-indicator-border-radius, 4px);
}
.mat-focus-indicator:focus-visible::before {
  content: "";
}

@media (forced-colors: active) {
  html {
    --mat-focus-indicator-display: block;
  }
}
`],encapsulation:2,changeDetection:0})}return n})();var Po=["mat-icon-button",""],Bo=["*"],Uo=new f("MAT_BUTTON_CONFIG");function Qr(n){return n==null?void 0:Wn(n)}var mn=(()=>{class n{_elementRef=a(P);_ngZone=a(w);_animationsDisabled=Ce();_config=a(Uo,{optional:!0});_focusMonitor=a(Jt);_cleanupClick;_renderer=a(xt);_rippleLoader=a(Jr);_isAnchor;_isFab=!1;color;get disableRipple(){return this._disableRipple}set disableRipple(e){this._disableRipple=e,this._updateRippleDisabled()}_disableRipple=!1;get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._updateRippleDisabled()}_disabled=!1;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(e){this.tabIndex=e}constructor(){a(ie).load(qr);let e=this._elementRef.nativeElement;this._isAnchor=e.tagName==="A",this.disabledInteractive=this._config?.disabledInteractive??!1,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(e,{className:"mat-mdc-button-ripple"})}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0),this._isAnchor&&this._setupAsAnchor()}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement)}focus(e="program",t){e?this._focusMonitor.focusVia(this._elementRef.nativeElement,e,t):this._elementRef.nativeElement.focus(t)}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:!0}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled)}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,"click",e=>{this.disabled&&(e.preventDefault(),e.stopImmediatePropagation())}))}static \u0275fac=function(t){return new(t||n)};static \u0275dir=z({type:n,hostAttrs:[1,"mat-mdc-button-base"],hostVars:13,hostBindings:function(t,i){t&2&&(Re("disabled",i._getDisabledAttribute())("aria-disabled",i._getAriaDisabled())("tabindex",i._getTabIndex()),at(i.color?"mat-"+i.color:""),Z("mat-mdc-button-disabled",i.disabled)("mat-mdc-button-disabled-interactive",i.disabledInteractive)("mat-unthemed",!i.color)("_mat-animation-noopable",i._animationsDisabled))},inputs:{color:"color",disableRipple:[2,"disableRipple","disableRipple",Y],disabled:[2,"disabled","disabled",Y],ariaDisabled:[2,"aria-disabled","ariaDisabled",Y],disabledInteractive:[2,"disabledInteractive","disabledInteractive",Y],tabIndex:[2,"tabIndex","tabIndex",Qr],_tabindex:[2,"tabindex","_tabindex",Qr]}})}return n})(),jo=(()=>{class n extends mn{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:!0})}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=N({type:n,selectors:[["button","mat-icon-button",""],["a","mat-icon-button",""],["button","matIconButton",""],["a","matIconButton",""]],hostAttrs:[1,"mdc-icon-button","mat-mdc-icon-button"],exportAs:["matButton","matAnchor"],features:[ot],attrs:Po,ngContentSelectors:Bo,decls:4,vars:0,consts:[[1,"mat-mdc-button-persistent-ripple","mdc-icon-button__ripple"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(t,i){t&1&&(ge(),pe(0,"span",0),K(1),pe(2,"span",1)(3,"span",2))},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--mat-icon-button-state-layer-size, 40px);
  height: var(--mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--mat-icon-button-state-layer-size, 40px) - var(--mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--mat-icon-button-icon-size, 24px);
  color: var(--mat-icon-button-icon-color, var(--mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--mat-icon-button-ripple-color, color-mix(in srgb, var(--mat-sys-on-surface-variant) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-icon-button-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-icon-button-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-icon-button-touch-target-size, 48px);
  display: var(--mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--mat-icon-button-icon-size, 24px);
  height: var(--mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--mat-icon-button-container-shape, var(--mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2,changeDetection:0})}return n})();var zo=new f("cdk-dir-doc",{providedIn:"root",factory:()=>a(p)}),$o=/^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;function ei(n){let r=n?.toLowerCase()||"";return r==="auto"&&typeof navigator<"u"&&navigator?.language?$o.test(navigator.language)?"rtl":"ltr":r==="rtl"?"rtl":"ltr"}var Ho=(()=>{class n{get value(){return this.valueSignal()}valueSignal=Fe("ltr");change=new St;constructor(){let e=a(zo,{optional:!0});if(e){let t=e.body?e.body.dir:null,i=e.documentElement?e.documentElement.dir:null;this.valueSignal.set(ei(t||i||"ltr"))}}ngOnDestroy(){this.change.complete()}static \u0275fac=function(t){return new(t||n)};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var Ie=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=I({type:n});static \u0275inj=C({})}return n})();var ti=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=I({type:n});static \u0275inj=C({imports:[Ie]})}return n})();var Vo=["matButton",""],Go=[[["",8,"material-icons",3,"iconPositionEnd",""],["mat-icon",3,"iconPositionEnd",""],["","matButtonIcon","",3,"iconPositionEnd",""]],"*",[["","iconPositionEnd","",8,"material-icons"],["mat-icon","iconPositionEnd",""],["","matButtonIcon","","iconPositionEnd",""]]],Wo=[".material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd])","*",".material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd]"];var ni=new Map([["text",["mat-mdc-button"]],["filled",["mdc-button--unelevated","mat-mdc-unelevated-button"]],["elevated",["mdc-button--raised","mat-mdc-raised-button"]],["outlined",["mdc-button--outlined","mat-mdc-outlined-button"]],["tonal",["mat-tonal-button"]]]),km=(()=>{class n extends mn{get appearance(){return this._appearance}set appearance(e){this.setAppearance(e||this._config?.defaultAppearance||"text")}_appearance=null;constructor(){super();let e=Ko(this._elementRef.nativeElement);e&&this.setAppearance(e)}setAppearance(e){if(e===this._appearance)return;let t=this._elementRef.nativeElement.classList,i=this._appearance?ni.get(this._appearance):null,o=ni.get(e);i&&t.remove(...i),t.add(...o),this._appearance=e}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=N({type:n,selectors:[["button","matButton",""],["a","matButton",""],["button","mat-button",""],["button","mat-raised-button",""],["button","mat-flat-button",""],["button","mat-stroked-button",""],["a","mat-button",""],["a","mat-raised-button",""],["a","mat-flat-button",""],["a","mat-stroked-button",""]],hostAttrs:[1,"mdc-button"],inputs:{appearance:[0,"matButton","appearance"]},exportAs:["matButton","matAnchor"],features:[ot],attrs:Vo,ngContentSelectors:Wo,decls:7,vars:4,consts:[[1,"mat-mdc-button-persistent-ripple"],[1,"mdc-button__label"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(t,i){t&1&&(ge(Go),pe(0,"span",0),K(1),$n(2,"span",1),K(3,1),Hn(),K(4,2),pe(5,"span",2)(6,"span",3)),t&2&&Z("mdc-button__ripple",!i._isFab)("mdc-fab__ripple",i._isFab)},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--mat-button-text-horizontal-padding, 12px);
  height: var(--mat-button-text-container-height, 40px);
  font-family: var(--mat-button-text-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-text-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-text-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-text-label-text-transform);
  font-weight: var(--mat-button-text-label-text-weight, var(--mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--mat-button-text-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--mat-button-text-label-text-color, var(--mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding: 0 var(--mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-offset, -4px);
  margin-left: var(--mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-text-icon-spacing, 8px);
  margin-left: var(--mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--mat-button-text-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-text-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-text-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-text-touch-target-size, 48px);
  display: var(--mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-filled-container-height, 40px);
  font-family: var(--mat-button-filled-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-filled-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-filled-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-filled-label-text-transform);
  font-weight: var(--mat-button-filled-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-offset, -8px);
  margin-left: var(--mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-filled-icon-spacing, 8px);
  margin-left: var(--mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--mat-button-filled-ripple-color, color-mix(in srgb, var(--mat-sys-on-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-state-layer-color, var(--mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-filled-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-filled-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-filled-touch-target-size, 48px);
  display: var(--mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--mat-button-filled-label-text-color, var(--mat-sys-on-primary));
  background-color: var(--mat-button-filled-container-color, var(--mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--mat-button-filled-container-shape, var(--mat-sys-corner-full));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-filled-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--mat-button-protected-container-elevation-shadow, var(--mat-sys-level1));
  height: var(--mat-button-protected-container-height, 40px);
  font-family: var(--mat-button-protected-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-protected-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-protected-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-protected-label-text-transform);
  font-weight: var(--mat-button-protected-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-offset, -8px);
  margin-left: var(--mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-protected-icon-spacing, 8px);
  margin-left: var(--mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--mat-button-protected-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-protected-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-protected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-protected-touch-target-size, 48px);
  display: var(--mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--mat-button-protected-label-text-color, var(--mat-sys-primary));
  background-color: var(--mat-button-protected-container-color, var(--mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--mat-button-protected-container-shape, var(--mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--mat-button-protected-hover-container-elevation-shadow, var(--mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--mat-button-protected-focus-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--mat-button-protected-pressed-container-elevation-shadow, var(--mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-protected-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--mat-button-protected-disabled-container-elevation-shadow, var(--mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-outlined-container-height, 40px);
  font-family: var(--mat-button-outlined-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-outlined-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-outlined-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-outlined-label-text-transform);
  font-weight: var(--mat-button-outlined-label-text-weight, var(--mat-sys-label-large-weight));
  border-radius: var(--mat-button-outlined-container-shape, var(--mat-sys-corner-full));
  border-width: var(--mat-button-outlined-outline-width, 1px);
  padding: 0 var(--mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-offset, -8px);
  margin-left: var(--mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--mat-button-outlined-ripple-color, color-mix(in srgb, var(--mat-sys-primary) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-state-layer-color, var(--mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-outlined-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-outlined-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-outlined-touch-target-size, 48px);
  display: var(--mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--mat-button-outlined-label-text-color, var(--mat-sys-primary));
  border-color: var(--mat-button-outlined-outline-color, var(--mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: var(--mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--mat-button-tonal-container-height, 40px);
  font-family: var(--mat-button-tonal-label-text-font, var(--mat-sys-label-large-font));
  font-size: var(--mat-button-tonal-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-button-tonal-label-text-tracking, var(--mat-sys-label-large-tracking));
  text-transform: var(--mat-button-tonal-label-text-transform);
  font-weight: var(--mat-button-tonal-label-text-weight, var(--mat-sys-label-large-weight));
  padding: 0 var(--mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--mat-button-tonal-label-text-color, var(--mat-sys-on-secondary-container));
  background-color: var(--mat-button-tonal-container-color, var(--mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--mat-button-tonal-container-shape, var(--mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  background-color: var(--mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-offset, -8px);
  margin-left: var(--mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--mat-button-tonal-ripple-color, color-mix(in srgb, var(--mat-sys-on-secondary-container) calc(var(--mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-state-layer-color, var(--mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--mat-button-tonal-disabled-state-layer-color, var(--mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--mat-button-tonal-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--mat-button-tonal-touch-target-size, 48px);
  display: var(--mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2,changeDetection:0})}return n})();function Ko(n){return n.hasAttribute("mat-raised-button")?"elevated":n.hasAttribute("mat-stroked-button")?"outlined":n.hasAttribute("mat-flat-button")?"filled":n.hasAttribute("mat-button")?"text":null}var Pm=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=I({type:n});static \u0275inj=C({imports:[ti,Ie]})}return n})();function ri(n){return Error(`Unable to find icon with the name "${n}"`)}function Zo(){return Error("Could not find HttpClient for use with Angular Material icons. Please add provideHttpClient() to your providers.")}function ii(n){return Error(`The URL provided to MatIconRegistry was not trusted as a resource URL via Angular's DomSanitizer. Attempted URL was "${n}".`)}function oi(n){return Error(`The literal provided to MatIconRegistry was not trusted as safe HTML by Angular's DomSanitizer. Attempted literal was "${n}".`)}var G=class{url;svgText;options;svgElement=null;constructor(r,e,t){this.url=r,this.svgText=e,this.options=t}},ai=(()=>{class n{_httpClient;_sanitizer;_errorHandler;_document;_svgIconConfigs=new Map;_iconSetConfigs=new Map;_cachedIconsByUrl=new Map;_inProgressUrlFetches=new Map;_fontCssClassesByAlias=new Map;_resolvers=[];_defaultFontSetClass=["material-icons","mat-ligature-font"];constructor(e,t,i,o){this._httpClient=e,this._sanitizer=t,this._errorHandler=o,this._document=i}addSvgIcon(e,t,i){return this.addSvgIconInNamespace("",e,t,i)}addSvgIconLiteral(e,t,i){return this.addSvgIconLiteralInNamespace("",e,t,i)}addSvgIconInNamespace(e,t,i,o){return this._addSvgIconConfig(e,t,new G(i,null,o))}addSvgIconResolver(e){return this._resolvers.push(e),this}addSvgIconLiteralInNamespace(e,t,i,o){let s=this._sanitizer.sanitize(T.HTML,i);if(!s)throw oi(i);let c=oe(s);return this._addSvgIconConfig(e,t,new G("",c,o))}addSvgIconSet(e,t){return this.addSvgIconSetInNamespace("",e,t)}addSvgIconSetLiteral(e,t){return this.addSvgIconSetLiteralInNamespace("",e,t)}addSvgIconSetInNamespace(e,t,i){return this._addSvgIconSetConfig(e,new G(t,null,i))}addSvgIconSetLiteralInNamespace(e,t,i){let o=this._sanitizer.sanitize(T.HTML,t);if(!o)throw oi(t);let s=oe(o);return this._addSvgIconSetConfig(e,new G("",s,i))}registerFontClassAlias(e,t=e){return this._fontCssClassesByAlias.set(e,t),this}classNameForFontAlias(e){return this._fontCssClassesByAlias.get(e)||e}setDefaultFontSetClass(...e){return this._defaultFontSetClass=e,this}getDefaultFontSetClass(){return this._defaultFontSetClass}getSvgIconFromUrl(e){let t=this._sanitizer.sanitize(T.RESOURCE_URL,e);if(!t)throw ii(e);let i=this._cachedIconsByUrl.get(t);return i?k(It(i)):this._loadSvgIconFromConfig(new G(e,null)).pipe(ce(o=>this._cachedIconsByUrl.set(t,o)),A(o=>It(o)))}getNamedSvgIcon(e,t=""){let i=si(t,e),o=this._svgIconConfigs.get(i);if(o)return this._getSvgFromConfig(o);if(o=this._getIconConfigFromResolvers(t,e),o)return this._svgIconConfigs.set(i,o),this._getSvgFromConfig(o);let s=this._iconSetConfigs.get(t);return s?this._getSvgFromIconSetConfigs(e,s):hn(ri(i))}ngOnDestroy(){this._resolvers=[],this._svgIconConfigs.clear(),this._iconSetConfigs.clear(),this._cachedIconsByUrl.clear()}_getSvgFromConfig(e){return e.svgText?k(It(this._svgElementFromConfig(e))):this._loadSvgIconFromConfig(e).pipe(A(t=>It(t)))}_getSvgFromIconSetConfigs(e,t){let i=this._extractIconWithNameFromAnySet(e,t);if(i)return k(i);let o=t.filter(s=>!s.svgText).map(s=>this._loadSvgIconSetFromConfig(s).pipe(vn(c=>{let l=`Loading icon set URL: ${this._sanitizer.sanitize(T.RESOURCE_URL,s.url)} failed: ${c.message}`;return this._errorHandler.handleError(new Error(l)),k(null)})));return bn(o).pipe(A(()=>{let s=this._extractIconWithNameFromAnySet(e,t);if(!s)throw ri(e);return s}))}_extractIconWithNameFromAnySet(e,t){for(let i=t.length-1;i>=0;i--){let o=t[i];if(o.svgText&&o.svgText.toString().indexOf(e)>-1){let s=this._svgElementFromConfig(o),c=this._extractSvgIconFromSet(s,e,o.options);if(c)return c}}return null}_loadSvgIconFromConfig(e){return this._fetchIcon(e).pipe(ce(t=>e.svgText=t),A(()=>this._svgElementFromConfig(e)))}_loadSvgIconSetFromConfig(e){return e.svgText?k(null):this._fetchIcon(e).pipe(ce(t=>e.svgText=t))}_extractSvgIconFromSet(e,t,i){let o=e.querySelector(`[id="${t}"]`);if(!o)return null;let s=o.cloneNode(!0);if(s.removeAttribute("id"),s.nodeName.toLowerCase()==="svg")return this._setSvgAttributes(s,i);if(s.nodeName.toLowerCase()==="symbol")return this._setSvgAttributes(this._toSvgElement(s),i);let c=this._svgElementFromString(oe("<svg></svg>"));return c.appendChild(s),this._setSvgAttributes(c,i)}_svgElementFromString(e){let t=this._document.createElement("DIV");t.innerHTML=e;let i=t.querySelector("svg");if(!i)throw Error("<svg> tag not found");return i}_toSvgElement(e){let t=this._svgElementFromString(oe("<svg></svg>")),i=e.attributes;for(let o=0;o<i.length;o++){let{name:s,value:c}=i[o];s!=="id"&&t.setAttribute(s,c)}for(let o=0;o<e.childNodes.length;o++)e.childNodes[o].nodeType===this._document.ELEMENT_NODE&&t.appendChild(e.childNodes[o].cloneNode(!0));return t}_setSvgAttributes(e,t){return e.setAttribute("fit",""),e.setAttribute("height","100%"),e.setAttribute("width","100%"),e.setAttribute("preserveAspectRatio","xMidYMid meet"),e.setAttribute("focusable","false"),t&&t.viewBox&&e.setAttribute("viewBox",t.viewBox),e}_fetchIcon(e){let{url:t,options:i}=e,o=i?.withCredentials??!1;if(!this._httpClient)throw Zo();if(t==null)throw Error(`Cannot fetch icon from URL "${t}".`);let s=this._sanitizer.sanitize(T.RESOURCE_URL,t);if(!s)throw ii(t);let c=this._inProgressUrlFetches.get(s);if(c)return c;let u=this._httpClient.get(s,{responseType:"text",withCredentials:o}).pipe(A(l=>oe(l)),et(()=>this._inProgressUrlFetches.delete(s)),Dn());return this._inProgressUrlFetches.set(s,u),u}_addSvgIconConfig(e,t,i){return this._svgIconConfigs.set(si(e,t),i),this}_addSvgIconSetConfig(e,t){let i=this._iconSetConfigs.get(e);return i?i.push(t):this._iconSetConfigs.set(e,[t]),this}_svgElementFromConfig(e){if(!e.svgElement){let t=this._svgElementFromString(e.svgText);this._setSvgAttributes(t,e.options),e.svgElement=t}return e.svgElement}_getIconConfigFromResolvers(e,t){for(let i=0;i<this._resolvers.length;i++){let o=this._resolvers[i](t,e);if(o)return Yo(o)?new G(o.url,null,o.options):new G(o,null)}}static \u0275fac=function(t){return new(t||n)(m(De,8),m(je),m(p,8),m(te))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function It(n){return n.cloneNode(!0)}function si(n,r){return n+":"+r}function Yo(n){return!!(n.url&&n.options)}var Xo=["*"],Jo=new f("MAT_ICON_DEFAULT_OPTIONS"),qo=new f("mat-icon-location",{providedIn:"root",factory:()=>{let n=a(p),r=n?n.location:null;return{getPathname:()=>r?r.pathname+r.search:""}}}),ci=["clip-path","color-profile","src","cursor","fill","filter","marker","marker-start","marker-mid","marker-end","mask","stroke"],Qo=ci.map(n=>`[${n}]`).join(", "),es=/^url\(['"]?#(.*?)['"]?\)$/,rf=(()=>{class n{_elementRef=a(P);_iconRegistry=a(ai);_location=a(qo);_errorHandler=a(te);_defaultColor;get color(){return this._color||this._defaultColor}set color(e){this._color=e}_color;inline=!1;get svgIcon(){return this._svgIcon}set svgIcon(e){e!==this._svgIcon&&(e?this._updateSvgIcon(e):this._svgIcon&&this._clearSvgElement(),this._svgIcon=e)}_svgIcon;get fontSet(){return this._fontSet}set fontSet(e){let t=this._cleanupFontValue(e);t!==this._fontSet&&(this._fontSet=t,this._updateFontIconClasses())}_fontSet;get fontIcon(){return this._fontIcon}set fontIcon(e){let t=this._cleanupFontValue(e);t!==this._fontIcon&&(this._fontIcon=t,this._updateFontIconClasses())}_fontIcon;_previousFontSetClass=[];_previousFontIconClass;_svgName=null;_svgNamespace=null;_previousPath;_elementsWithExternalReferences;_currentIconFetch=Ye.EMPTY;constructor(){let e=a(new Vn("aria-hidden"),{optional:!0}),t=a(Jo,{optional:!0});t&&(t.color&&(this.color=this._defaultColor=t.color),t.fontSet&&(this.fontSet=t.fontSet)),e||this._elementRef.nativeElement.setAttribute("aria-hidden","true")}_splitIconName(e){if(!e)return["",""];let t=e.split(":");switch(t.length){case 1:return["",t[0]];case 2:return t;default:throw Error(`Invalid icon name: "${e}"`)}}ngOnInit(){this._updateFontIconClasses()}ngAfterViewChecked(){let e=this._elementsWithExternalReferences;if(e&&e.size){let t=this._location.getPathname();t!==this._previousPath&&(this._previousPath=t,this._prependPathToReferences(t))}}ngOnDestroy(){this._currentIconFetch.unsubscribe(),this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear()}_usingFontIcon(){return!this.svgIcon}_setSvgElement(e){this._clearSvgElement();let t=this._location.getPathname();this._previousPath=t,this._cacheChildrenWithExternalReferences(e),this._prependPathToReferences(t),this._elementRef.nativeElement.appendChild(e)}_clearSvgElement(){let e=this._elementRef.nativeElement,t=e.childNodes.length;for(this._elementsWithExternalReferences&&this._elementsWithExternalReferences.clear();t--;){let i=e.childNodes[t];(i.nodeType!==1||i.nodeName.toLowerCase()==="svg")&&i.remove()}}_updateFontIconClasses(){if(!this._usingFontIcon())return;let e=this._elementRef.nativeElement,t=(this.fontSet?this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/):this._iconRegistry.getDefaultFontSetClass()).filter(i=>i.length>0);this._previousFontSetClass.forEach(i=>e.classList.remove(i)),t.forEach(i=>e.classList.add(i)),this._previousFontSetClass=t,this.fontIcon!==this._previousFontIconClass&&!t.includes("mat-ligature-font")&&(this._previousFontIconClass&&e.classList.remove(this._previousFontIconClass),this.fontIcon&&e.classList.add(this.fontIcon),this._previousFontIconClass=this.fontIcon)}_cleanupFontValue(e){return typeof e=="string"?e.trim().split(" ")[0]:e}_prependPathToReferences(e){let t=this._elementsWithExternalReferences;t&&t.forEach((i,o)=>{i.forEach(s=>{o.setAttribute(s.name,`url('${e}#${s.value}')`)})})}_cacheChildrenWithExternalReferences(e){let t=e.querySelectorAll(Qo),i=this._elementsWithExternalReferences=this._elementsWithExternalReferences||new Map;for(let o=0;o<t.length;o++)ci.forEach(s=>{let c=t[o],u=c.getAttribute(s),l=u?u.match(es):null;if(l){let h=i.get(c);h||(h=[],i.set(c,h)),h.push({name:s,value:l[1]})}})}_updateSvgIcon(e){if(this._svgNamespace=null,this._svgName=null,this._currentIconFetch.unsubscribe(),e){let[t,i]=this._splitIconName(e);t&&(this._svgNamespace=t),i&&(this._svgName=i),this._currentIconFetch=this._iconRegistry.getNamedSvgIcon(i,t).pipe(Qe(1)).subscribe(o=>this._setSvgElement(o),o=>{let s=`Error retrieving icon ${t}:${i}! ${o.message}`;this._errorHandler.handleError(new Error(s))})}}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=N({type:n,selectors:[["mat-icon"]],hostAttrs:["role","img",1,"mat-icon","notranslate"],hostVars:10,hostBindings:function(t,i){t&2&&(Re("data-mat-icon-type",i._usingFontIcon()?"font":"svg")("data-mat-icon-name",i._svgName||i.fontIcon)("data-mat-icon-namespace",i._svgNamespace||i.fontSet)("fontIcon",i._usingFontIcon()?i.fontIcon:null),at(i.color?"mat-"+i.color:""),Z("mat-icon-inline",i.inline)("mat-icon-no-color",i.color!=="primary"&&i.color!=="accent"&&i.color!=="warn"))},inputs:{color:"color",inline:[2,"inline","inline",Y],svgIcon:"svgIcon",fontSet:"fontSet",fontIcon:"fontIcon"},exportAs:["matIcon"],ngContentSelectors:Xo,decls:1,vars:0,template:function(t,i){t&1&&(ge(),K(0))},styles:[`mat-icon, mat-icon.mat-primary, mat-icon.mat-accent, mat-icon.mat-warn {
  color: var(--mat-icon-color, inherit);
}

.mat-icon {
  -webkit-user-select: none;
  user-select: none;
  background-repeat: no-repeat;
  display: inline-block;
  fill: currentColor;
  height: 24px;
  width: 24px;
  overflow: hidden;
}
.mat-icon.mat-icon-inline {
  font-size: inherit;
  height: inherit;
  line-height: inherit;
  width: inherit;
}
.mat-icon.mat-ligature-font[fontIcon]::before {
  content: attr(fontIcon);
}

[dir=rtl] .mat-icon-rtl-mirror {
  transform: scale(-1, 1);
}

.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon {
  display: block;
}
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-prefix .mat-icon-button .mat-icon,
.mat-form-field:not(.mat-form-field-appearance-legacy) .mat-form-field-suffix .mat-icon-button .mat-icon {
  margin: auto;
}
`],encapsulation:2,changeDetection:0})}return n})(),of=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=I({type:n});static \u0275inj=C({imports:[Ie]})}return n})();var ui=class n{constructor(r){this.http=r}http;jsonHeaders=new $({Accept:"application/json"});getInfo(){return this.http.get("/info",{headers:this.jsonHeaders})}getMonitoring(){return this.http.get("/monitoring",{headers:this.jsonHeaders})}getNodes(){return this.http.get("/nodes",{headers:this.jsonHeaders})}updateNode(r,e){return this.http.post("/nodes/"+encodeURIComponent(r),e,{headers:this.jsonHeaders})}getPlugins(){return this.http.get("/plugins",{headers:this.jsonHeaders})}getQueues(){return this.http.get("/queues",{headers:this.jsonHeaders})}createQueue(r){return this.http.post("/queues",r,{headers:this.jsonHeaders})}updateQueue(r,e){return this.http.post("/queues/"+encodeURIComponent(r),e,{headers:this.jsonHeaders})}getTasks(r,e){let t=new U;for(let[i,o]of Object.entries(r))if(Array.isArray(o))for(let s of o)s!==""&&(t=t.append(i,s));else o!==""&&o!=null&&(t=t.append(i,o));for(let[i,o]of Object.entries(e))o==null||o===""||o===!1||(t=t.append(i,o===!0?"1":String(o)));return this.http.get("/tasks",{headers:this.jsonHeaders,params:t})}getTask(r){return this.http.get("/tasks/"+encodeURIComponent(r),{headers:this.jsonHeaders})}getBalance(){return this.http.get("/balance",{headers:this.jsonHeaders})}postBalance(r){return this.http.post("/balance",r,{headers:this.jsonHeaders})}static \u0275fac=function(e){return new(e||n)(m(De))};static \u0275prov=d({token:n,factory:n.\u0275fac,providedIn:"root"})};export{V as a,be as b,qn as c,hi as d,pi as e,$t as f,Ri as g,ye as h,io as i,xu as j,ze as k,$e as l,ao as m,j as n,x as o,co as p,J as q,Jt as r,ie as s,Mr as t,qt as u,Qt as v,Or as w,ho as x,Co as y,To as z,So as A,zr as B,nn as C,rn as D,sn as E,gl as F,bl as G,Ge as H,Cl as I,Il as J,Sl as K,Fl as L,Ll as M,xo as N,Ce as O,zl as P,Hl as Q,rm as R,qr as S,jo as T,Ho as U,Ie as V,ti as W,km as X,Pm as Y,rf as Z,of as _,ui as $};
