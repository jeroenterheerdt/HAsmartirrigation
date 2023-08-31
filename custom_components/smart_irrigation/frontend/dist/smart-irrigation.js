!function(e){"use strict";var t=function(e,i){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])},t(e,i)};function i(e,i){if("function"!=typeof i&&null!==i)throw new TypeError("Class extends value "+String(i)+" is not a constructor or null");function a(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(a.prototype=i.prototype,new a)}var a=function(){return a=Object.assign||function(e){for(var t,i=1,a=arguments.length;i<a;i++)for(var s in t=arguments[i])Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s]);return e},a.apply(this,arguments)};function s(e,t,i,a){var s,n=arguments.length,r=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,a);else for(var o=e.length-1;o>=0;o--)(s=e[o])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r}function n(e,t,i){if(i||2===arguments.length)for(var a,s=0,n=t.length;s<n;s++)!a&&s in t||(a||(a=Array.prototype.slice.call(t,0,s)),a[s]=t[s]);return e.concat(a||Array.prototype.slice.call(t))}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const r=window,o=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,l=Symbol(),h=new WeakMap;class u{constructor(e,t,i){if(this._$cssResult$=!0,i!==l)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(o&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=h.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&h.set(t,e))}return e}toString(){return this.cssText}}const c=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,a)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1]),e[0]);return new u(i,e,l)},d=o?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new u("string"==typeof e?e:e+"",void 0,l))(t)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */;var p;const g=window,m=g.trustedTypes,f=m?m.emptyScript:"",b=g.reactiveElementPolyfillSupport,v={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>t!==e&&(t==t||e==e),E={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:y},$="finalized";class _ extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,i)=>{const a=this._$Ep(i,t);void 0!==a&&(this._$Ev.set(a,i),e.push(a))})),e}static createProperty(e,t=E){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i="symbol"==typeof e?Symbol():"__"+e,a=this.getPropertyDescriptor(e,i,t);void 0!==a&&Object.defineProperty(this.prototype,e,a)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(a){const s=this[e];this[t]=a,this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||E}static finalize(){if(this.hasOwnProperty($))return!1;this[$]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of t)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(d(e))}else void 0!==e&&t.push(d(e));return t}static _$Ep(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,i;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(i=e.hostConnected)||void 0===i||i.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;const t=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{o?e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):t.forEach((t=>{const i=document.createElement("style"),a=r.litNonce;void 0!==a&&i.setAttribute("nonce",a),i.textContent=t.cssText,e.appendChild(i)}))})(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=E){var a;const s=this.constructor._$Ep(e,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==(null===(a=i.converter)||void 0===a?void 0:a.toAttribute)?i.converter:v).toAttribute(t,i.type);this._$El=e,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$El=null}}_$AK(e,t){var i;const a=this.constructor,s=a._$Ev.get(e);if(void 0!==s&&this._$El!==s){const e=a.getPropertyOptions(s),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(i=e.converter)||void 0===i?void 0:i.fromAttribute)?e.converter:v;this._$El=s,this[s]=n.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let a=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||y)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):a=!1),!this.isUpdatePending&&a&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var A;_[$]=!0,_.elementProperties=new Map,_.elementStyles=[],_.shadowRootOptions={mode:"open"},null==b||b({ReactiveElement:_}),(null!==(p=g.reactiveElementVersions)&&void 0!==p?p:g.reactiveElementVersions=[]).push("1.6.2");const w=window,H=w.trustedTypes,S=H?H.createPolicy("lit-html",{createHTML:e=>e}):void 0,T="$lit$",O=`lit$${(Math.random()+"").slice(9)}$`,B="?"+O,P=`<${B}>`,M=document,C=()=>M.createComment(""),x=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,N="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,k=/-->/g,R=/>/g,z=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,j=/"/g,D=/^(?:script|style|textarea|title)$/i,G=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),Z=new WeakMap,W=M.createTreeWalker(M,129,null,!1),K=(e,t)=>{const i=e.length-1,a=[];let s,n=2===t?"<svg>":"",r=I;for(let t=0;t<i;t++){const i=e[t];let o,l,h=-1,u=0;for(;u<i.length&&(r.lastIndex=u,l=r.exec(i),null!==l);)u=r.lastIndex,r===I?"!--"===l[1]?r=k:void 0!==l[1]?r=R:void 0!==l[2]?(D.test(l[2])&&(s=RegExp("</"+l[2],"g")),r=z):void 0!==l[3]&&(r=z):r===z?">"===l[0]?(r=null!=s?s:I,h=-1):void 0===l[1]?h=-2:(h=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?z:'"'===l[3]?j:U):r===j||r===U?r=z:r===k||r===R?r=I:(r=z,s=void 0);const c=r===z&&e[t+1].startsWith("/>")?" ":"";n+=r===I?i+P:h>=0?(a.push(o),i.slice(0,h)+T+i.slice(h)+O+c):i+O+(-2===h?(a.push(void 0),t):c)}const o=n+(e[i]||"<?>")+(2===t?"</svg>":"");if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==S?S.createHTML(o):o,a]};class X{constructor({strings:e,_$litType$:t},i){let a;this.parts=[];let s=0,n=0;const r=e.length-1,o=this.parts,[l,h]=K(e,t);if(this.el=X.createElement(l,i),W.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(a=W.nextNode())&&o.length<r;){if(1===a.nodeType){if(a.hasAttributes()){const e=[];for(const t of a.getAttributeNames())if(t.endsWith(T)||t.startsWith(O)){const i=h[n++];if(e.push(t),void 0!==i){const e=a.getAttribute(i.toLowerCase()+T).split(O),t=/([.?@])?(.*)/.exec(i);o.push({type:1,index:s,name:t[2],strings:e,ctor:"."===t[1]?ee:"?"===t[1]?ie:"@"===t[1]?ae:Q})}else o.push({type:6,index:s})}for(const t of e)a.removeAttribute(t)}if(D.test(a.tagName)){const e=a.textContent.split(O),t=e.length-1;if(t>0){a.textContent=H?H.emptyScript:"";for(let i=0;i<t;i++)a.append(e[i],C()),W.nextNode(),o.push({type:2,index:++s});a.append(e[t],C())}}}else if(8===a.nodeType)if(a.data===B)o.push({type:2,index:s});else{let e=-1;for(;-1!==(e=a.data.indexOf(O,e+1));)o.push({type:7,index:s}),e+=O.length-1}s++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,a){var s,n,r,o;if(t===F)return t;let l=void 0!==a?null===(s=i._$Co)||void 0===s?void 0:s[a]:i._$Cl;const h=x(t)?void 0:t._$litDirective$;return(null==l?void 0:l.constructor)!==h&&(null===(n=null==l?void 0:l._$AO)||void 0===n||n.call(l,!1),void 0===h?l=void 0:(l=new h(e),l._$AT(e,i,a)),void 0!==a?(null!==(r=(o=i)._$Co)&&void 0!==r?r:o._$Co=[])[a]=l:i._$Cl=l),void 0!==l&&(t=Y(e,l._$AS(e,t.values),l,a)),t}class q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:a}=this._$AD,s=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:M).importNode(i,!0);W.currentNode=s;let n=W.nextNode(),r=0,o=0,l=a[0];for(;void 0!==l;){if(r===l.index){let t;2===l.type?t=new J(n,n.nextSibling,this,e):1===l.type?t=new l.ctor(n,l.name,l.strings,this,e):6===l.type&&(t=new se(n,this,e)),this._$AV.push(t),l=a[++o]}r!==(null==l?void 0:l.index)&&(n=W.nextNode(),r++)}return W.currentNode=M,s}v(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class J{constructor(e,t,i,a){var s;this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=a,this._$Cp=null===(s=null==a?void 0:a.isConnected)||void 0===s||s}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),x(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>L(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==V&&x(this._$AH)?this._$AA.nextSibling.data=e:this.$(M.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:a}=e,s="number"==typeof a?this._$AC(e):(void 0===a.el&&(a.el=X.createElement(a.h,this.options)),a);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===s)this._$AH.v(i);else{const e=new q(s,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new X(e)),t}T(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,a=0;for(const s of e)a===t.length?t.push(i=new J(this.k(C()),this.k(C()),this,this.options)):i=t[a],i._$AI(s),a++;a<t.length&&(this._$AR(i&&i._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class Q{constructor(e,t,i,a,s){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,a){const s=this.strings;let n=!1;if(void 0===s)e=Y(this,e,t,0),n=!x(e)||e!==this._$AH&&e!==F,n&&(this._$AH=e);else{const a=e;let r,o;for(e=s[0],r=0;r<s.length-1;r++)o=Y(this,a[i+r],t,r),o===F&&(o=this._$AH[r]),n||(n=!x(o)||o!==this._$AH[r]),o===V?e=V:e!==V&&(e+=(null!=o?o:"")+s[r+1]),this._$AH[r]=o}n&&!a&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class ee extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}const te=H?H.emptyScript:"";class ie extends Q{constructor(){super(...arguments),this.type=4}j(e){e&&e!==V?this.element.setAttribute(this.name,te):this.element.removeAttribute(this.name)}}class ae extends Q{constructor(e,t,i,a,s){super(e,t,i,a,s),this.type=5}_$AI(e,t=this){var i;if((e=null!==(i=Y(this,e,t,0))&&void 0!==i?i:V)===F)return;const a=this._$AH,s=e===V&&a!==V||e.capture!==a.capture||e.once!==a.once||e.passive!==a.passive,n=e!==V&&(a===V||s);s&&this.element.removeEventListener(this.name,this,a),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==i?i:this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ne=w.litHtmlPolyfillSupport;null==ne||ne(X,J),(null!==(A=w.litHtmlVersions)&&void 0!==A?A:w.litHtmlVersions=[]).push("2.7.4");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var re,oe;class le extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{var a,s;const n=null!==(a=null==i?void 0:i.renderBefore)&&void 0!==a?a:t;let r=n._$litPart$;if(void 0===r){const e=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:null;n._$litPart$=r=new J(t.insertBefore(C(),e),e,void 0,null!=i?i:{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return F}}le.finalized=!0,le._$litElement$=!0,null===(re=globalThis.litElementHydrateSupport)||void 0===re||re.call(globalThis,{LitElement:le});const he=globalThis.litElementPolyfillSupport;null==he||he({LitElement:le}),(null!==(oe=globalThis.litElementVersions)&&void 0!==oe?oe:globalThis.litElementVersions=[]).push("3.3.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ue=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:i,elements:a}=t;return{kind:i,elements:a,finisher(t){customElements.define(e,t)}}})(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,ce=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}},de=(e,t,i)=>{t.constructor.createProperty(i,e)};function pe(e){return(t,i)=>void 0!==i?de(e,t,i):ce(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
function ge(e,t){return(({finisher:e,descriptor:t})=>(i,a)=>{var s;if(void 0===a){const a=null!==(s=i.originalKey)&&void 0!==s?s:i.key,n=null!=t?{kind:"method",placement:"prototype",key:a,descriptor:t(i.key)}:{...i,key:a};return null!=e&&(n.finisher=function(t){e(t,a)}),n}{const s=i.constructor;void 0!==t&&Object.defineProperty(i,a,t(a)),null==e||e(s,a)}})({descriptor:i=>{const a={get(){var t,i;return null!==(i=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e))&&void 0!==i?i:null},enumerable:!0,configurable:!0};if(t){const t="symbol"==typeof i?Symbol():"__"+i;a.get=function(){var i,a;return void 0===this[t]&&(this[t]=null!==(a=null===(i=this.renderRoot)||void 0===i?void 0:i.querySelector(e))&&void 0!==a?a:null),this[t]}}return a}})}
/**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var me,fe,be;null===(me=window.HTMLSlotElement)||void 0===me||me.prototype.assignedElements,function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(fe||(fe={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(be||(be={}));var ve=function(e,t,i,a){a=a||{},i=null==i?{}:i;var s=new Event(t,{bubbles:void 0===a.bubbles||a.bubbles,cancelable:Boolean(a.cancelable),composed:void 0===a.composed||a.composed});return s.detail=i,e.dispatchEvent(s),s};const ye=async()=>{if(customElements.get("ha-checkbox")&&customElements.get("ha-slider"))return;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");e.hass={panels:[{url_path:"tmp",component_name:"config"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config");const t=document.createElement("ha-panel-config");await t.routerOptions.routes.automation.load()},Ee="smart_irrigation",$e="minutes",_e="hours",Ae="days",we="imperial",He="metric",Se="Dewpoint",Te="Evapotranspiration",Oe="Humidity",Be="Maximum Temperature",Pe="Minimum Temperature",Me="Precipitation",Ce="Pressure",xe="Solar Radiation",Le="Temperature",Ne="Windspeed",Ie="owm",ke="sensor",Re="none",ze="source",Ue="sensorentity",je="unit",De="aggregate",Ge=["average","first","last","maximum","median","minimum","sum"],Fe="size",Ve="throughput",Ze="duration",We=e=>e.callWS({type:Ee+"/config"}),Ke=e=>e.callWS({type:Ee+"/zones"}),Xe=e=>e.callWS({type:Ee+"/modules"}),Ye=e=>e.callWS({type:Ee+"/mappings"}),qe=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then((e=>e())):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return s([pe({attribute:!1})],t.prototype,"hass",void 0),t};var Je,Qe,et,tt={labels:{yes:"Yes",no:"No",module:"Module",select:"Select"},actions:{delete:"Delete"}},it="Smart Irrigation",at={general:{title:"General",description:"This page provides global settings.",cards:{"automatic-duration-calculation":{header:"Automatic duration calculation",labels:{"auto-calc-enabled":"Automatically calculate zone durations","auto-calc-time":"Calculate at"}},"automatic-update":{header:"Automatic weather data update",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-interval":"Update sensor data every","auto-update-first-update":"(First) Update at"},options:{minutes:"minutes",hours:"hours",days:"days"},errors:{"warning-update-time-on-or-after-calc-time":"Warning: weatherdata update time on or after calculation time"}}}},modules:{title:"Modules",description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones",no_items:"There are no modules defined yet.",cards:{"add-module":{header:"Add module",actions:{add:"Add module"}},module:{labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{EstimateFromTemp:"Estimate from temperature",EstimateFromSunHours:"Estimate from sun hours",DontEstimate:"Do not estimate"},errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it"}}}},mappings:{title:"Sensor Groups",description:"Add one or more sensor groups that retrieve weather data from OpenWeatherMap, from sensors or a combination of these. You can map each sensor group to one or more zones",no_items:"There are no sensor group defined yet.",cards:{"add-mapping":{header:"Add sensor groups",actions:{add:"Add sensor group"}},mapping:{source:"Source",sources:{openweathermap:"OpenWeatherMap",sensor:"Sensor",none:"None"},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},"sensor-entity":"Sensor entity","sensor-units":"Sensor provides values in","sensor-aggregate-use-the":"Use the","sensor-aggregate-of-sensor-values-to-calculate":"of sensor values to calculate duration",aggregates:{average:"Average",minimum:"Minimum",maximum:"Maximum",first:"First",last:"Last",median:"Median",sum:"Sum"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it"}}},labels:{"mapping-name":"Name"}},zones:{title:"Zones",description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",no_items:"There are no zones defined yet.",cards:{"add-zone":{header:"Add zone",actions:{add:"Add zone"}},"zone-actions":{header:"Actions on all zones",actions:{"update-all":"Update all zones","calculate-all":"Calculate all zones"}}},labels:{name:"Name",size:"Size",throughput:"Throughput",state:"State",states:{disabled:"Disabled",manual:"Manual",automatic:"Automatic"},mapping:"Sensor Group",bucket:"Bucket","lead-time":"Lead time","maximum-duration":"Maximum duration",multiplier:"Multiplier",duration:"Duration"},actions:{add:"Add",calculate:"Calculate",update:"Update",information:"Information"}},help:{title:"Help"}},st={common:tt,title:it,panels:at},nt=Object.freeze({__proto__:null,common:tt,title:it,panels:at,default:st}),rt={labels:{yes:"Ja",no:"Nee",module:"Module",select:"Kies"},actions:{delete:"Verwijderen"}},ot="Smart Irrigation",lt={general:{title:"Algemeen",description:"Dit zijn de algemene instellingen.",cards:{"automatic-duration-calculation":{header:"Automatische berekening van irrigatietijd",labels:{"auto-calc-enabled":"Automatisch irrigatietijd berekening voor elke zone","auto-calc-time":"Berekenen op"}},"automatic-update":{header:"Automatisch bijwerken van weer gegevens",labels:{"auto-update-enabled":"Automatisch weergegevens bijwerken","auto-update-interval":"Sensor data bijwerken elke","auto-update-first-update":"(Eerste keer) Bijwerken op "},options:{minutes:"minuten",hours:"uren",days:"dagen"},errors:{"warning-update-time-on-or-after-calc-time":"Let op: het automatisch bijwerken van weer gegevens vind plaats op of na de automatische berekening van irrigatietijd"}}}},modules:{title:"Modules",description:"Voeg een of meerdere modules toe. Modules berekenen irrigatietijd. Elke module heeft zijn eigen configuratie and kan worden gebruikt voor het berekening van irrigatietijd voor een of meerdere zones",no_items:"Er zijn nog geen modules.",cards:{"add-module":{header:"Voeg module toe",actions:{add:"Toevoegen"}},module:{labels:{configuration:"Instellingen",required:"verplicht veld"},"translated-options":{EstimateFromTemp:"Gebaseerd op temperatuur",EstimateFromSunHours:"Gebaseerd op zon uren",DontEstimate:"Niet berekenen"},errors:{"cannot-delete-module-because-zones-use-it":"Deze module kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt"}}}},mappings:{title:"Sensorgroepen",description:"Voeg een of meer sensorgroepen toe die weergegevens ophalen van OpenWeatherMap, van sensoren of een combinatie. Elke sensorgroep kan worden gebruikt voor een of meerdere zones",no_items:"Er zijn nog geen sensorgroepen.",cards:{"add-mapping":{header:"Voeg sensorgroep toe",actions:{add:"Toevoegen"}},mapping:{source:"Bron",sources:{openweathermap:"OpenWeatherMap",sensor:"Sensor",none:"Geen"},items:{dewpoint:"Dauwpunt",evapotranspiration:"Verdamping",humidity:"Vochtigheid","maximum temperature":"Maximum temperatuur","minimum temperature":"Minimum temperatuur",precipitation:"Neerslag",pressure:"Druk","solar radiation":"Zonnestraling",temperature:"Temperatuur",windspeed:"Wind snelheid"},"sensor-entity":"Sensor entiteit","sensor-units":"Sensor geeft waardes in","sensor-aggregate-use-the":"Gebruik de/het","sensor-aggregate-of-sensor-values-to-calculate":"van de sensor waardes om irrigatietijd te berekenen",aggregates:{average:"Gemiddelde",minimum:"Minimum",maximum:"Maximum",first:"Eerste",last:"Laatste",median:"Mediaan",sum:"Totaal"},errors:{"cannot-delete-mapping-because-zones-use-it":"Deze sensorgroep kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt"}}},labels:{"mapping-name":"Name"}},zones:{title:"Zones",description:"Voeg een of meerdere zones toe. Per zone wordt de irrigatietijd berekend, afhankelijk van de afmeting, doorvoer, status, module en sensorgroep.",no_items:"Er zijn nog geen zones.",cards:{"add-zone":{header:"Voeg zone toe",actions:{add:"Toevoegen"}},"zone-actions":{header:"Acties voor alle zones",actions:{"update-all":"Werk alle zone data bij","calculate-all":"Bereken alle zones"}}},labels:{name:"Naam",size:"Afmeting",throughput:"Doorvoer",state:"Status",states:{disabled:"Uit",manual:"Manueel",automatic:"Automatisch"},mapping:"Sensorgroep",bucket:"Voorraad","lead-time":"Aanlooptijd","maximum-duration":"Maximale duur",multiplier:"Vermenigvuldiger",duration:"Irrigatieduur"},actions:{add:"Toevoegen",calculate:"Bereken",update:"Bijwerken",information:"Informatie"}},help:{title:"Hulp"}},ht={common:rt,title:ot,panels:lt},ut=Object.freeze({__proto__:null,common:rt,title:ot,panels:lt,default:ht}),ct={labels:{yes:"Ja",no:"Nein",module:"Modul",select:"Wähle"},actions:{delete:"Lösche"}},dt="Smart Irrigation",pt={general:{title:"Allgemein",description:"Diese Seite bietet allgemeine Einstellungen.",cards:{"automatic-duration-calculation":{header:"Automatische Berechnung der Bewässerungsdauer",labels:{"auto-calc-enabled":"Automatische Berechnung der Dauer pro Zone","auto-calc-time":"Calculate at"}},"automatic-update":{header:"Automatische Aktualisierung der Wetterdaten",labels:{"auto-update-enabled":"Automatisches Update der Wetterdaten","auto-update-interval":"Update der Sensordaten alle","auto-update-first-update":"(Erster) Update um"},options:{minutes:"Minuten",hours:"Stunden",days:"Tage"},errors:{"warning-update-time-on-or-after-calc-time":"Hinweis: Die automatische Aktualisierung der Wetterdaten erfolgt bei oder nach der automatischen Berechnung der Bewässerungszeit"}}}},modules:{title:"Module",description:"Fügen Sie ein oder mehrere Module hinzu. Module berechnen die Bewässerungszeit. Jedes Modul hat seine eigene Konfiguration und kann zur Berechnung der Bewässerungszeit für eine oder mehrere Zonen verwendet werden",no_items:"Es sind noch kein Module vorhanden.",cards:{"add-module":{header:"Modul hinzufügen",actions:{add:"Hinzufügen"}},module:{labels:{configuration:"Konfiguration",required:"Feld ist erforderlich"},"translated-options":{EstimateFromTemp:"Basierend auf der Temperatur",EstimateFromSunHours:"Basierend auf den Sonnenstunden",DontEstimate:"Nicht berechnen"},errors:{"cannot-delete-module-because-zones-use-it":"Dieses Modul kann nicht entfernt werden, da es von mindestens einer Zone verwendet wird"}}}},mappings:{title:"Sensorgruppen",description:"Fügen Sie einen oder mehrere Sensorgruppen hinzu, die Wetterdaten von OpenWeatherMap, von Sensoren oder einer Kombination daraus abrufen. Jede Sensorgruppe kann für eine oder mehrere Zonen verwendet werden",no_items:"Es ist noch keine Sensorgruppe vorhanden.",cards:{"add-mapping":{header:"Sensorgruppe hinzufügen",actions:{add:"Hinzufügen"}},mapping:{source:"Quelle",sources:{openweathermap:"OpenWeatherMap",sensor:"Sensor",none:"Kein"},items:{dewpoint:"Taupunkt",evapotranspiration:"Verdunstung",humidity:"Feuchtigkeit","maximum temperature":"Maximum-Temperatur","minimum temperature":"Minimum-Temperatur",precipitation:"Niederschlag",pressure:"Luftdruck","solar radiation":"Sonnenstrahlung",temperature:"Temperatur",windspeed:"Windgeschwindikeit"},"sensor-entity":"Sensor Entität","sensor-units":"Sensor liefert Werte in","sensor-aggregate-use-the":"Nutze den/die/das","sensor-aggregate-of-sensor-values-to-calculate":"des Sensorwertes um die Bewässerungsdauer zu berechnen",aggregates:{average:"Durchschnitt",minimum:"Minimum",maximum:"Maximum",first:"Erster",last:"Letzter",median:"Median",sum:"Summe"},errors:{"cannot-delete-mapping-because-zones-use-it":"Diese Sensorgruppe kann nicht entfernt werden, da sie von mindestens einer Zone verwendet wird"}}},labels:{"mapping-name":"Name"}},zones:{title:"Zonen",description:"Fügen Sie eine oder mehrere Zonen hinzu. Die Bewässerungszeit wird pro Zone, abhängig von Größe, Durchsatz, Status, Modul und Sensorgruppe berechnet.",no_items:"Es sind noch kein Zonen vorhanden.",cards:{"add-zone":{header:"Zone hinzufügen",actions:{add:"Hinzufügen"}},"zone-actions":{header:"Aktionen für alle Zonen",actions:{"update-all":"Alle Zonen updaten","calculate-all":"All Zonen berechnen"}}},labels:{name:"Name",size:"Größe",throughput:"Durchfluss",state:"Zustand",states:{disabled:"Aus",manual:"Manuell",automatic:"Automatisch"},mapping:"Sensor Gruppe",bucket:"Vorrat","lead-time":"Anlaufzeit",multiplier:"Multiplikator",duration:"Dauer"},actions:{add:"Hinzufügen",calculate:"Berechnen",update:"Update",information:"Information"}},help:{title:"Hilfe"}},gt={common:ct,title:dt,panels:pt},mt=Object.freeze({__proto__:null,common:ct,title:dt,panels:pt,default:gt});function ft(e){return e.type===Qe.literal}function bt(e){return e.type===Qe.argument}function vt(e){return e.type===Qe.number}function yt(e){return e.type===Qe.date}function Et(e){return e.type===Qe.time}function $t(e){return e.type===Qe.select}function _t(e){return e.type===Qe.plural}function At(e){return e.type===Qe.pound}function wt(e){return e.type===Qe.tag}function Ht(e){return!(!e||"object"!=typeof e||e.type!==et.number)}function St(e){return!(!e||"object"!=typeof e||e.type!==et.dateTime)}!function(e){e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG"}(Je||(Je={})),function(e){e[e.literal=0]="literal",e[e.argument=1]="argument",e[e.number=2]="number",e[e.date=3]="date",e[e.time=4]="time",e[e.select=5]="select",e[e.plural=6]="plural",e[e.pound=7]="pound",e[e.tag=8]="tag"}(Qe||(Qe={})),function(e){e[e.number=0]="number",e[e.dateTime=1]="dateTime"}(et||(et={}));var Tt=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,Ot=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function Bt(e){var t={};return e.replace(Ot,(function(e){var i=e.length;switch(e[0]){case"G":t.era=4===i?"long":5===i?"narrow":"short";break;case"y":t.year=2===i?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][i-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][i-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===i?"short":5===i?"narrow":"short";break;case"e":if(i<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-4];break;case"c":if(i<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][i-4];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][i-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][i-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][i-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][i-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][i-1];break;case"s":t.second=["numeric","2-digit"][i-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=i<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),t}var Pt=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;var Mt=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,Ct=/^(@+)?(\+|#+)?[rs]?$/g,xt=/(\*)(0+)|(#+)(0+)|(0+)/g,Lt=/^(0+)$/;function Nt(e){var t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(Ct,(function(e,i,a){return"string"!=typeof a?(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length):"+"===a?t.minimumSignificantDigits=i.length:"#"===i[0]?t.maximumSignificantDigits=i.length:(t.minimumSignificantDigits=i.length,t.maximumSignificantDigits=i.length+("string"==typeof a?a.length:0)),""})),t}function It(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function kt(e){var t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){var i=e.slice(0,2);if("+!"===i?(t.signDisplay="always",e=e.slice(2)):"+?"===i&&(t.signDisplay="exceptZero",e=e.slice(2)),!Lt.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function Rt(e){var t=It(e);return t||{}}function zt(e){for(var t={},i=0,s=e;i<s.length;i++){var n=s[i];switch(n.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=n.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=n.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t=a(a(a({},t),{notation:"scientific"}),n.options.reduce((function(e,t){return a(a({},e),Rt(t))}),{}));continue;case"engineering":t=a(a(a({},t),{notation:"engineering"}),n.options.reduce((function(e,t){return a(a({},e),Rt(t))}),{}));continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(n.options[0]);continue;case"integer-width":if(n.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");n.options[0].replace(xt,(function(e,i,a,s,n,r){if(i)t.minimumIntegerDigits=a.length;else{if(s&&n)throw new Error("We currently do not support maximum integer digits");if(r)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(Lt.test(n.stem))t.minimumIntegerDigits=n.stem.length;else if(Mt.test(n.stem)){if(n.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");n.stem.replace(Mt,(function(e,i,a,s,n,r){return"*"===a?t.minimumFractionDigits=i.length:s&&"#"===s[0]?t.maximumFractionDigits=s.length:n&&r?(t.minimumFractionDigits=n.length,t.maximumFractionDigits=n.length+r.length):(t.minimumFractionDigits=i.length,t.maximumFractionDigits=i.length),""}));var r=n.options[0];"w"===r?t=a(a({},t),{trailingZeroDisplay:"stripIfInteger"}):r&&(t=a(a({},t),Nt(r)))}else if(Ct.test(n.stem))t=a(a({},t),Nt(n.stem));else{var o=It(n.stem);o&&(t=a(a({},t),o));var l=kt(n.stem);l&&(t=a(a({},t),l))}}return t}var Ut,jt={AX:["H"],BQ:["H"],CP:["H"],CZ:["H"],DK:["H"],FI:["H"],ID:["H"],IS:["H"],ML:["H"],NE:["H"],RU:["H"],SE:["H"],SJ:["H"],SK:["H"],AS:["h","H"],BT:["h","H"],DJ:["h","H"],ER:["h","H"],GH:["h","H"],IN:["h","H"],LS:["h","H"],PG:["h","H"],PW:["h","H"],SO:["h","H"],TO:["h","H"],VU:["h","H"],WS:["h","H"],"001":["H","h"],AL:["h","H","hB"],TD:["h","H","hB"],"ca-ES":["H","h","hB"],CF:["H","h","hB"],CM:["H","h","hB"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],LU:["H","h","hB"],NP:["H","h","hB"],PF:["H","h","hB"],SC:["H","h","hB"],SM:["H","h","hB"],SN:["H","h","hB"],TF:["H","h","hB"],VA:["H","h","hB"],CY:["h","H","hb","hB"],GR:["h","H","hb","hB"],CO:["h","H","hB","hb"],DO:["h","H","hB","hb"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],NA:["h","H","hB","hb"],PA:["h","H","hB","hb"],PR:["h","H","hB","hb"],VE:["h","H","hB","hb"],AC:["H","h","hb","hB"],AI:["H","h","hb","hB"],BW:["H","h","hb","hB"],BZ:["H","h","hb","hB"],CC:["H","h","hb","hB"],CK:["H","h","hb","hB"],CX:["H","h","hb","hB"],DG:["H","h","hb","hB"],FK:["H","h","hb","hB"],GB:["H","h","hb","hB"],GG:["H","h","hb","hB"],GI:["H","h","hb","hB"],IE:["H","h","hb","hB"],IM:["H","h","hb","hB"],IO:["H","h","hb","hB"],JE:["H","h","hb","hB"],LT:["H","h","hb","hB"],MK:["H","h","hb","hB"],MN:["H","h","hb","hB"],MS:["H","h","hb","hB"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],PN:["H","h","hb","hB"],SH:["H","h","hb","hB"],SX:["H","h","hb","hB"],TA:["H","h","hb","hB"],ZA:["H","h","hb","hB"],"af-ZA":["H","h","hB","hb"],AR:["H","h","hB","hb"],CL:["H","h","hB","hb"],CR:["H","h","hB","hb"],CU:["H","h","hB","hb"],EA:["H","h","hB","hb"],"es-BO":["H","h","hB","hb"],"es-BR":["H","h","hB","hb"],"es-EC":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"es-PE":["H","h","hB","hb"],GT:["H","h","hB","hb"],HN:["H","h","hB","hb"],IC:["H","h","hB","hb"],KG:["H","h","hB","hb"],KM:["H","h","hB","hb"],LK:["H","h","hB","hb"],MA:["H","h","hB","hb"],MX:["H","h","hB","hb"],NI:["H","h","hB","hb"],PY:["H","h","hB","hb"],SV:["H","h","hB","hb"],UY:["H","h","hB","hb"],JP:["H","h","K"],AD:["H","hB"],AM:["H","hB"],AO:["H","hB"],AT:["H","hB"],AW:["H","hB"],BE:["H","hB"],BF:["H","hB"],BJ:["H","hB"],BL:["H","hB"],BR:["H","hB"],CG:["H","hB"],CI:["H","hB"],CV:["H","hB"],DE:["H","hB"],EE:["H","hB"],FR:["H","hB"],GA:["H","hB"],GF:["H","hB"],GN:["H","hB"],GP:["H","hB"],GW:["H","hB"],HR:["H","hB"],IL:["H","hB"],IT:["H","hB"],KZ:["H","hB"],MC:["H","hB"],MD:["H","hB"],MF:["H","hB"],MQ:["H","hB"],MZ:["H","hB"],NC:["H","hB"],NL:["H","hB"],PM:["H","hB"],PT:["H","hB"],RE:["H","hB"],RO:["H","hB"],SI:["H","hB"],SR:["H","hB"],ST:["H","hB"],TG:["H","hB"],TR:["H","hB"],WF:["H","hB"],YT:["H","hB"],BD:["h","hB","H"],PK:["h","hB","H"],AZ:["H","hB","h"],BA:["H","hB","h"],BG:["H","hB","h"],CH:["H","hB","h"],GE:["H","hB","h"],LI:["H","hB","h"],ME:["H","hB","h"],RS:["H","hB","h"],UA:["H","hB","h"],UZ:["H","hB","h"],XK:["H","hB","h"],AG:["h","hb","H","hB"],AU:["h","hb","H","hB"],BB:["h","hb","H","hB"],BM:["h","hb","H","hB"],BS:["h","hb","H","hB"],CA:["h","hb","H","hB"],DM:["h","hb","H","hB"],"en-001":["h","hb","H","hB"],FJ:["h","hb","H","hB"],FM:["h","hb","H","hB"],GD:["h","hb","H","hB"],GM:["h","hb","H","hB"],GU:["h","hb","H","hB"],GY:["h","hb","H","hB"],JM:["h","hb","H","hB"],KI:["h","hb","H","hB"],KN:["h","hb","H","hB"],KY:["h","hb","H","hB"],LC:["h","hb","H","hB"],LR:["h","hb","H","hB"],MH:["h","hb","H","hB"],MP:["h","hb","H","hB"],MW:["h","hb","H","hB"],NZ:["h","hb","H","hB"],SB:["h","hb","H","hB"],SG:["h","hb","H","hB"],SL:["h","hb","H","hB"],SS:["h","hb","H","hB"],SZ:["h","hb","H","hB"],TC:["h","hb","H","hB"],TT:["h","hb","H","hB"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],VC:["h","hb","H","hB"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],ZM:["h","hb","H","hB"],BO:["H","hB","h","hb"],EC:["H","hB","h","hb"],ES:["H","hB","h","hb"],GQ:["H","hB","h","hb"],PE:["H","hB","h","hb"],AE:["h","hB","hb","H"],"ar-001":["h","hB","hb","H"],BH:["h","hB","hb","H"],DZ:["h","hB","hb","H"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],HK:["h","hB","hb","H"],IQ:["h","hB","hb","H"],JO:["h","hB","hb","H"],KW:["h","hB","hb","H"],LB:["h","hB","hb","H"],LY:["h","hB","hb","H"],MO:["h","hB","hb","H"],MR:["h","hB","hb","H"],OM:["h","hB","hb","H"],PH:["h","hB","hb","H"],PS:["h","hB","hb","H"],QA:["h","hB","hb","H"],SA:["h","hB","hb","H"],SD:["h","hB","hb","H"],SY:["h","hB","hb","H"],TN:["h","hB","hb","H"],YE:["h","hB","hb","H"],AF:["H","hb","hB","h"],LA:["H","hb","hB","h"],CN:["H","hB","hb","h"],LV:["H","hB","hb","h"],TL:["H","hB","hb","h"],"zu-ZA":["H","hB","hb","h"],CD:["hB","H"],IR:["hB","H"],"hi-IN":["hB","h","H"],"kn-IN":["hB","h","H"],"ml-IN":["hB","h","H"],"te-IN":["hB","h","H"],KH:["hB","h","H","hb"],"ta-IN":["hB","h","hb","H"],BN:["hb","hB","h","H"],MY:["hb","hB","h","H"],ET:["hB","hb","h","H"],"gu-IN":["hB","hb","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],TW:["hB","hb","h","H"],KE:["hB","hb","H","h"],MM:["hB","hb","H","h"],TZ:["hB","hb","H","h"],UG:["hB","hb","H","h"]};function Dt(e){var t=e.hourCycle;if(void 0===t&&e.hourCycles&&e.hourCycles.length&&(t=e.hourCycles[0]),t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}var i,a=e.language;return"root"!==a&&(i=e.maximize().region),(jt[i||""]||jt[a||""]||jt["".concat(a,"-001")]||jt["001"])[0]}var Gt=new RegExp("^".concat(Tt.source,"*")),Ft=new RegExp("".concat(Tt.source,"*$"));function Vt(e,t){return{start:e,end:t}}var Zt=!!String.prototype.startsWith,Wt=!!String.fromCodePoint,Kt=!!Object.fromEntries,Xt=!!String.prototype.codePointAt,Yt=!!String.prototype.trimStart,qt=!!String.prototype.trimEnd,Jt=!!Number.isSafeInteger?Number.isSafeInteger:function(e){return"number"==typeof e&&isFinite(e)&&Math.floor(e)===e&&Math.abs(e)<=9007199254740991},Qt=!0;try{Qt="a"===(null===(Ut=oi("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu").exec("a"))||void 0===Ut?void 0:Ut[0])}catch(k){Qt=!1}var ei,ti=Zt?function(e,t,i){return e.startsWith(t,i)}:function(e,t,i){return e.slice(i,i+t.length)===t},ii=Wt?String.fromCodePoint:function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var i,a="",s=e.length,n=0;s>n;){if((i=e[n++])>1114111)throw RangeError(i+" is not a valid code point");a+=i<65536?String.fromCharCode(i):String.fromCharCode(55296+((i-=65536)>>10),i%1024+56320)}return a},ai=Kt?Object.fromEntries:function(e){for(var t={},i=0,a=e;i<a.length;i++){var s=a[i],n=s[0],r=s[1];t[n]=r}return t},si=Xt?function(e,t){return e.codePointAt(t)}:function(e,t){var i=e.length;if(!(t<0||t>=i)){var a,s=e.charCodeAt(t);return s<55296||s>56319||t+1===i||(a=e.charCodeAt(t+1))<56320||a>57343?s:a-56320+(s-55296<<10)+65536}},ni=Yt?function(e){return e.trimStart()}:function(e){return e.replace(Gt,"")},ri=qt?function(e){return e.trimEnd()}:function(e){return e.replace(Ft,"")};function oi(e,t){return new RegExp(e,t)}if(Qt){var li=oi("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");ei=function(e,t){var i;return li.lastIndex=t,null!==(i=li.exec(e)[1])&&void 0!==i?i:""}}else ei=function(e,t){for(var i=[];;){var a=si(e,t);if(void 0===a||di(a)||pi(a))break;i.push(a),t+=a>=65536?2:1}return ii.apply(void 0,i)};var hi=function(){function e(e,t){void 0===t&&(t={}),this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}return e.prototype.parse=function(){if(0!==this.offset())throw Error("parser can only be used once");return this.parseMessage(0,"",!1)},e.prototype.parseMessage=function(e,t,i){for(var a=[];!this.isEOF();){var s=this.char();if(123===s){if((n=this.parseArgument(e,i)).err)return n;a.push(n.val)}else{if(125===s&&e>0)break;if(35!==s||"plural"!==t&&"selectordinal"!==t){if(60===s&&!this.ignoreTag&&47===this.peek()){if(i)break;return this.error(Je.UNMATCHED_CLOSING_TAG,Vt(this.clonePosition(),this.clonePosition()))}if(60===s&&!this.ignoreTag&&ui(this.peek()||0)){if((n=this.parseTag(e,t)).err)return n;a.push(n.val)}else{var n;if((n=this.parseLiteral(e,t)).err)return n;a.push(n.val)}}else{var r=this.clonePosition();this.bump(),a.push({type:Qe.pound,location:Vt(r,this.clonePosition())})}}}return{val:a,err:null}},e.prototype.parseTag=function(e,t){var i=this.clonePosition();this.bump();var a=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:Qe.literal,value:"<".concat(a,"/>"),location:Vt(i,this.clonePosition())},err:null};if(this.bumpIf(">")){var s=this.parseMessage(e+1,t,!0);if(s.err)return s;var n=s.val,r=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!ui(this.char()))return this.error(Je.INVALID_TAG,Vt(r,this.clonePosition()));var o=this.clonePosition();return a!==this.parseTagName()?this.error(Je.UNMATCHED_CLOSING_TAG,Vt(o,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:Qe.tag,value:a,children:n,location:Vt(i,this.clonePosition())},err:null}:this.error(Je.INVALID_TAG,Vt(r,this.clonePosition())))}return this.error(Je.UNCLOSED_TAG,Vt(i,this.clonePosition()))}return this.error(Je.INVALID_TAG,Vt(i,this.clonePosition()))},e.prototype.parseTagName=function(){var e=this.offset();for(this.bump();!this.isEOF()&&ci(this.char());)this.bump();return this.message.slice(e,this.offset())},e.prototype.parseLiteral=function(e,t){for(var i=this.clonePosition(),a="";;){var s=this.tryParseQuote(t);if(s)a+=s;else{var n=this.tryParseUnquoted(e,t);if(n)a+=n;else{var r=this.tryParseLeftAngleBracket();if(!r)break;a+=r}}}var o=Vt(i,this.clonePosition());return{val:{type:Qe.literal,value:a,location:o},err:null}},e.prototype.tryParseLeftAngleBracket=function(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(ui(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e},e.prototype.tryParseQuote=function(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();var t=[this.char()];for(this.bump();!this.isEOF();){var i=this.char();if(39===i){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(i);this.bump()}return ii.apply(void 0,t)},e.prototype.tryParseUnquoted=function(e,t){if(this.isEOF())return null;var i=this.char();return 60===i||123===i||35===i&&("plural"===t||"selectordinal"===t)||125===i&&e>0?null:(this.bump(),ii(i))},e.prototype.parseArgument=function(e,t){var i=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(Je.EXPECT_ARGUMENT_CLOSING_BRACE,Vt(i,this.clonePosition()));if(125===this.char())return this.bump(),this.error(Je.EMPTY_ARGUMENT,Vt(i,this.clonePosition()));var a=this.parseIdentifierIfPossible().value;if(!a)return this.error(Je.MALFORMED_ARGUMENT,Vt(i,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(Je.EXPECT_ARGUMENT_CLOSING_BRACE,Vt(i,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:Qe.argument,value:a,location:Vt(i,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(Je.EXPECT_ARGUMENT_CLOSING_BRACE,Vt(i,this.clonePosition())):this.parseArgumentOptions(e,t,a,i);default:return this.error(Je.MALFORMED_ARGUMENT,Vt(i,this.clonePosition()))}},e.prototype.parseIdentifierIfPossible=function(){var e=this.clonePosition(),t=this.offset(),i=ei(this.message,t),a=t+i.length;return this.bumpTo(a),{value:i,location:Vt(e,this.clonePosition())}},e.prototype.parseArgumentOptions=function(e,t,i,s){var n,r=this.clonePosition(),o=this.parseIdentifierIfPossible().value,l=this.clonePosition();switch(o){case"":return this.error(Je.EXPECT_ARGUMENT_TYPE,Vt(r,l));case"number":case"date":case"time":this.bumpSpace();var h=null;if(this.bumpIf(",")){this.bumpSpace();var u=this.clonePosition();if((v=this.parseSimpleArgStyleIfPossible()).err)return v;if(0===(g=ri(v.val)).length)return this.error(Je.EXPECT_ARGUMENT_STYLE,Vt(this.clonePosition(),this.clonePosition()));h={style:g,styleLocation:Vt(u,this.clonePosition())}}if((y=this.tryParseArgumentClose(s)).err)return y;var c=Vt(s,this.clonePosition());if(h&&ti(null==h?void 0:h.style,"::",0)){var d=ni(h.style.slice(2));if("number"===o)return(v=this.parseNumberSkeletonFromString(d,h.styleLocation)).err?v:{val:{type:Qe.number,value:i,location:c,style:v.val},err:null};if(0===d.length)return this.error(Je.EXPECT_DATE_TIME_SKELETON,c);var p=d;this.locale&&(p=function(e,t){for(var i="",a=0;a<e.length;a++){var s=e.charAt(a);if("j"===s){for(var n=0;a+1<e.length&&e.charAt(a+1)===s;)n++,a++;var r=1+(1&n),o=n<2?1:3+(n>>1),l=Dt(t);for("H"!=l&&"k"!=l||(o=0);o-- >0;)i+="a";for(;r-- >0;)i=l+i}else i+="J"===s?"H":s}return i}(d,this.locale));var g={type:et.dateTime,pattern:p,location:h.styleLocation,parsedOptions:this.shouldParseSkeletons?Bt(p):{}};return{val:{type:"date"===o?Qe.date:Qe.time,value:i,location:c,style:g},err:null}}return{val:{type:"number"===o?Qe.number:"date"===o?Qe.date:Qe.time,value:i,location:c,style:null!==(n=null==h?void 0:h.style)&&void 0!==n?n:null},err:null};case"plural":case"selectordinal":case"select":var m=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(Je.EXPECT_SELECT_ARGUMENT_OPTIONS,Vt(m,a({},m)));this.bumpSpace();var f=this.parseIdentifierIfPossible(),b=0;if("select"!==o&&"offset"===f.value){if(!this.bumpIf(":"))return this.error(Je.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,Vt(this.clonePosition(),this.clonePosition()));var v;if(this.bumpSpace(),(v=this.tryParseDecimalInteger(Je.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,Je.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE)).err)return v;this.bumpSpace(),f=this.parseIdentifierIfPossible(),b=v.val}var y,E=this.tryParsePluralOrSelectOptions(e,o,t,f);if(E.err)return E;if((y=this.tryParseArgumentClose(s)).err)return y;var $=Vt(s,this.clonePosition());return"select"===o?{val:{type:Qe.select,value:i,options:ai(E.val),location:$},err:null}:{val:{type:Qe.plural,value:i,options:ai(E.val),offset:b,pluralType:"plural"===o?"cardinal":"ordinal",location:$},err:null};default:return this.error(Je.INVALID_ARGUMENT_TYPE,Vt(r,l))}},e.prototype.tryParseArgumentClose=function(e){return this.isEOF()||125!==this.char()?this.error(Je.EXPECT_ARGUMENT_CLOSING_BRACE,Vt(e,this.clonePosition())):(this.bump(),{val:!0,err:null})},e.prototype.parseSimpleArgStyleIfPossible=function(){for(var e=0,t=this.clonePosition();!this.isEOF();){switch(this.char()){case 39:this.bump();var i=this.clonePosition();if(!this.bumpUntil("'"))return this.error(Je.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,Vt(i,this.clonePosition()));this.bump();break;case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}}return{val:this.message.slice(t.offset,this.offset()),err:null}},e.prototype.parseNumberSkeletonFromString=function(e,t){var i=[];try{i=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");for(var t=e.split(Pt).filter((function(e){return e.length>0})),i=[],a=0,s=t;a<s.length;a++){var n=s[a].split("/");if(0===n.length)throw new Error("Invalid number skeleton");for(var r=n[0],o=n.slice(1),l=0,h=o;l<h.length;l++)if(0===h[l].length)throw new Error("Invalid number skeleton");i.push({stem:r,options:o})}return i}(e)}catch(e){return this.error(Je.INVALID_NUMBER_SKELETON,t)}return{val:{type:et.number,tokens:i,location:t,parsedOptions:this.shouldParseSkeletons?zt(i):{}},err:null}},e.prototype.tryParsePluralOrSelectOptions=function(e,t,i,a){for(var s,n=!1,r=[],o=new Set,l=a.value,h=a.location;;){if(0===l.length){var u=this.clonePosition();if("select"===t||!this.bumpIf("="))break;var c=this.tryParseDecimalInteger(Je.EXPECT_PLURAL_ARGUMENT_SELECTOR,Je.INVALID_PLURAL_ARGUMENT_SELECTOR);if(c.err)return c;h=Vt(u,this.clonePosition()),l=this.message.slice(u.offset,this.offset())}if(o.has(l))return this.error("select"===t?Je.DUPLICATE_SELECT_ARGUMENT_SELECTOR:Je.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,h);"other"===l&&(n=!0),this.bumpSpace();var d=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?Je.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT:Je.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,Vt(this.clonePosition(),this.clonePosition()));var p=this.parseMessage(e+1,t,i);if(p.err)return p;var g=this.tryParseArgumentClose(d);if(g.err)return g;r.push([l,{value:p.val,location:Vt(d,this.clonePosition())}]),o.add(l),this.bumpSpace(),l=(s=this.parseIdentifierIfPossible()).value,h=s.location}return 0===r.length?this.error("select"===t?Je.EXPECT_SELECT_ARGUMENT_SELECTOR:Je.EXPECT_PLURAL_ARGUMENT_SELECTOR,Vt(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!n?this.error(Je.MISSING_OTHER_CLAUSE,Vt(this.clonePosition(),this.clonePosition())):{val:r,err:null}},e.prototype.tryParseDecimalInteger=function(e,t){var i=1,a=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(i=-1);for(var s=!1,n=0;!this.isEOF();){var r=this.char();if(!(r>=48&&r<=57))break;s=!0,n=10*n+(r-48),this.bump()}var o=Vt(a,this.clonePosition());return s?Jt(n*=i)?{val:n,err:null}:this.error(t,o):this.error(e,o)},e.prototype.offset=function(){return this.position.offset},e.prototype.isEOF=function(){return this.offset()===this.message.length},e.prototype.clonePosition=function(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}},e.prototype.char=function(){var e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");var t=si(this.message,e);if(void 0===t)throw Error("Offset ".concat(e," is at invalid UTF-16 code unit boundary"));return t},e.prototype.error=function(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}},e.prototype.bump=function(){if(!this.isEOF()){var e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}},e.prototype.bumpIf=function(e){if(ti(this.message,e,this.offset())){for(var t=0;t<e.length;t++)this.bump();return!0}return!1},e.prototype.bumpUntil=function(e){var t=this.offset(),i=this.message.indexOf(e,t);return i>=0?(this.bumpTo(i),!0):(this.bumpTo(this.message.length),!1)},e.prototype.bumpTo=function(e){if(this.offset()>e)throw Error("targetOffset ".concat(e," must be greater than or equal to the current offset ").concat(this.offset()));for(e=Math.min(e,this.message.length);;){var t=this.offset();if(t===e)break;if(t>e)throw Error("targetOffset ".concat(e," is at invalid UTF-16 code unit boundary"));if(this.bump(),this.isEOF())break}},e.prototype.bumpSpace=function(){for(;!this.isEOF()&&di(this.char());)this.bump()},e.prototype.peek=function(){if(this.isEOF())return null;var e=this.char(),t=this.offset(),i=this.message.charCodeAt(t+(e>=65536?2:1));return null!=i?i:null},e}();function ui(e){return e>=97&&e<=122||e>=65&&e<=90}function ci(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function di(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function pi(e){return e>=33&&e<=35||36===e||e>=37&&e<=39||40===e||41===e||42===e||43===e||44===e||45===e||e>=46&&e<=47||e>=58&&e<=59||e>=60&&e<=62||e>=63&&e<=64||91===e||92===e||93===e||94===e||96===e||123===e||124===e||125===e||126===e||161===e||e>=162&&e<=165||166===e||167===e||169===e||171===e||172===e||174===e||176===e||177===e||182===e||187===e||191===e||215===e||247===e||e>=8208&&e<=8213||e>=8214&&e<=8215||8216===e||8217===e||8218===e||e>=8219&&e<=8220||8221===e||8222===e||8223===e||e>=8224&&e<=8231||e>=8240&&e<=8248||8249===e||8250===e||e>=8251&&e<=8254||e>=8257&&e<=8259||8260===e||8261===e||8262===e||e>=8263&&e<=8273||8274===e||8275===e||e>=8277&&e<=8286||e>=8592&&e<=8596||e>=8597&&e<=8601||e>=8602&&e<=8603||e>=8604&&e<=8607||8608===e||e>=8609&&e<=8610||8611===e||e>=8612&&e<=8613||8614===e||e>=8615&&e<=8621||8622===e||e>=8623&&e<=8653||e>=8654&&e<=8655||e>=8656&&e<=8657||8658===e||8659===e||8660===e||e>=8661&&e<=8691||e>=8692&&e<=8959||e>=8960&&e<=8967||8968===e||8969===e||8970===e||8971===e||e>=8972&&e<=8991||e>=8992&&e<=8993||e>=8994&&e<=9e3||9001===e||9002===e||e>=9003&&e<=9083||9084===e||e>=9085&&e<=9114||e>=9115&&e<=9139||e>=9140&&e<=9179||e>=9180&&e<=9185||e>=9186&&e<=9254||e>=9255&&e<=9279||e>=9280&&e<=9290||e>=9291&&e<=9311||e>=9472&&e<=9654||9655===e||e>=9656&&e<=9664||9665===e||e>=9666&&e<=9719||e>=9720&&e<=9727||e>=9728&&e<=9838||9839===e||e>=9840&&e<=10087||10088===e||10089===e||10090===e||10091===e||10092===e||10093===e||10094===e||10095===e||10096===e||10097===e||10098===e||10099===e||10100===e||10101===e||e>=10132&&e<=10175||e>=10176&&e<=10180||10181===e||10182===e||e>=10183&&e<=10213||10214===e||10215===e||10216===e||10217===e||10218===e||10219===e||10220===e||10221===e||10222===e||10223===e||e>=10224&&e<=10239||e>=10240&&e<=10495||e>=10496&&e<=10626||10627===e||10628===e||10629===e||10630===e||10631===e||10632===e||10633===e||10634===e||10635===e||10636===e||10637===e||10638===e||10639===e||10640===e||10641===e||10642===e||10643===e||10644===e||10645===e||10646===e||10647===e||10648===e||e>=10649&&e<=10711||10712===e||10713===e||10714===e||10715===e||e>=10716&&e<=10747||10748===e||10749===e||e>=10750&&e<=11007||e>=11008&&e<=11055||e>=11056&&e<=11076||e>=11077&&e<=11078||e>=11079&&e<=11084||e>=11085&&e<=11123||e>=11124&&e<=11125||e>=11126&&e<=11157||11158===e||e>=11159&&e<=11263||e>=11776&&e<=11777||11778===e||11779===e||11780===e||11781===e||e>=11782&&e<=11784||11785===e||11786===e||11787===e||11788===e||11789===e||e>=11790&&e<=11798||11799===e||e>=11800&&e<=11801||11802===e||11803===e||11804===e||11805===e||e>=11806&&e<=11807||11808===e||11809===e||11810===e||11811===e||11812===e||11813===e||11814===e||11815===e||11816===e||11817===e||e>=11818&&e<=11822||11823===e||e>=11824&&e<=11833||e>=11834&&e<=11835||e>=11836&&e<=11839||11840===e||11841===e||11842===e||e>=11843&&e<=11855||e>=11856&&e<=11857||11858===e||e>=11859&&e<=11903||e>=12289&&e<=12291||12296===e||12297===e||12298===e||12299===e||12300===e||12301===e||12302===e||12303===e||12304===e||12305===e||e>=12306&&e<=12307||12308===e||12309===e||12310===e||12311===e||12312===e||12313===e||12314===e||12315===e||12316===e||12317===e||e>=12318&&e<=12319||12320===e||12336===e||64830===e||64831===e||e>=65093&&e<=65094}function gi(e){e.forEach((function(e){if(delete e.location,$t(e)||_t(e))for(var t in e.options)delete e.options[t].location,gi(e.options[t].value);else vt(e)&&Ht(e.style)||(yt(e)||Et(e))&&St(e.style)?delete e.style.location:wt(e)&&gi(e.children)}))}function mi(e,t){void 0===t&&(t={}),t=a({shouldParseSkeletons:!0,requiresOtherClause:!0},t);var i=new hi(e,t).parse();if(i.err){var s=SyntaxError(Je[i.err.kind]);throw s.location=i.err.location,s.originalMessage=i.err.message,s}return(null==t?void 0:t.captureLocation)||gi(i.val),i.val}function fi(e,t){var i=t&&t.cache?t.cache:wi,a=t&&t.serializer?t.serializer:$i;return(t&&t.strategy?t.strategy:Ei)(e,{cache:i,serializer:a})}function bi(e,t,i,a){var s,n=null==(s=a)||"number"==typeof s||"boolean"==typeof s?a:i(a),r=t.get(n);return void 0===r&&(r=e.call(this,a),t.set(n,r)),r}function vi(e,t,i){var a=Array.prototype.slice.call(arguments,3),s=i(a),n=t.get(s);return void 0===n&&(n=e.apply(this,a),t.set(s,n)),n}function yi(e,t,i,a,s){return i.bind(t,e,a,s)}function Ei(e,t){return yi(e,this,1===e.length?bi:vi,t.cache.create(),t.serializer)}var $i=function(){return JSON.stringify(arguments)};function _i(){this.cache=Object.create(null)}_i.prototype.get=function(e){return this.cache[e]},_i.prototype.set=function(e,t){this.cache[e]=t};var Ai,wi={create:function(){return new _i}},Hi={variadic:function(e,t){return yi(e,this,vi,t.cache.create(),t.serializer)},monadic:function(e,t){return yi(e,this,bi,t.cache.create(),t.serializer)}};!function(e){e.MISSING_VALUE="MISSING_VALUE",e.INVALID_VALUE="INVALID_VALUE",e.MISSING_INTL_API="MISSING_INTL_API"}(Ai||(Ai={}));var Si,Ti=function(e){function t(t,i,a){var s=e.call(this,t)||this;return s.code=i,s.originalMessage=a,s}return i(t,e),t.prototype.toString=function(){return"[formatjs Error: ".concat(this.code,"] ").concat(this.message)},t}(Error),Oi=function(e){function t(t,i,a,s){return e.call(this,'Invalid values for "'.concat(t,'": "').concat(i,'". Options are "').concat(Object.keys(a).join('", "'),'"'),Ai.INVALID_VALUE,s)||this}return i(t,e),t}(Ti),Bi=function(e){function t(t,i,a){return e.call(this,'Value for "'.concat(t,'" must be of type ').concat(i),Ai.INVALID_VALUE,a)||this}return i(t,e),t}(Ti),Pi=function(e){function t(t,i){return e.call(this,'The intl string context variable "'.concat(t,'" was not provided to the string "').concat(i,'"'),Ai.MISSING_VALUE,i)||this}return i(t,e),t}(Ti);function Mi(e){return"function"==typeof e}function Ci(e,t,i,a,s,n,r){if(1===e.length&&ft(e[0]))return[{type:Si.literal,value:e[0].value}];for(var o=[],l=0,h=e;l<h.length;l++){var u=h[l];if(ft(u))o.push({type:Si.literal,value:u.value});else if(At(u))"number"==typeof n&&o.push({type:Si.literal,value:i.getNumberFormat(t).format(n)});else{var c=u.value;if(!s||!(c in s))throw new Pi(c,r);var d=s[c];if(bt(u))d&&"string"!=typeof d&&"number"!=typeof d||(d="string"==typeof d||"number"==typeof d?String(d):""),o.push({type:"string"==typeof d?Si.literal:Si.object,value:d});else if(yt(u)){var p="string"==typeof u.style?a.date[u.style]:St(u.style)?u.style.parsedOptions:void 0;o.push({type:Si.literal,value:i.getDateTimeFormat(t,p).format(d)})}else if(Et(u)){p="string"==typeof u.style?a.time[u.style]:St(u.style)?u.style.parsedOptions:a.time.medium;o.push({type:Si.literal,value:i.getDateTimeFormat(t,p).format(d)})}else if(vt(u)){(p="string"==typeof u.style?a.number[u.style]:Ht(u.style)?u.style.parsedOptions:void 0)&&p.scale&&(d*=p.scale||1),o.push({type:Si.literal,value:i.getNumberFormat(t,p).format(d)})}else{if(wt(u)){var g=u.children,m=u.value,f=s[m];if(!Mi(f))throw new Bi(m,"function",r);var b=f(Ci(g,t,i,a,s,n).map((function(e){return e.value})));Array.isArray(b)||(b=[b]),o.push.apply(o,b.map((function(e){return{type:"string"==typeof e?Si.literal:Si.object,value:e}})))}if($t(u)){if(!(v=u.options[d]||u.options.other))throw new Oi(u.value,d,Object.keys(u.options),r);o.push.apply(o,Ci(v.value,t,i,a,s))}else if(_t(u)){var v;if(!(v=u.options["=".concat(d)])){if(!Intl.PluralRules)throw new Ti('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',Ai.MISSING_INTL_API,r);var y=i.getPluralRules(t,{type:u.pluralType}).select(d-(u.offset||0));v=u.options[y]||u.options.other}if(!v)throw new Oi(u.value,d,Object.keys(u.options),r);o.push.apply(o,Ci(v.value,t,i,a,s,d-(u.offset||0)))}else;}}}return function(e){return e.length<2?e:e.reduce((function(e,t){var i=e[e.length-1];return i&&i.type===Si.literal&&t.type===Si.literal?i.value+=t.value:e.push(t),e}),[])}(o)}function xi(e,t){return t?Object.keys(e).reduce((function(i,s){var n,r;return i[s]=(n=e[s],(r=t[s])?a(a(a({},n||{}),r||{}),Object.keys(n).reduce((function(e,t){return e[t]=a(a({},n[t]),r[t]||{}),e}),{})):n),i}),a({},e)):e}function Li(e){return{create:function(){return{get:function(t){return e[t]},set:function(t,i){e[t]=i}}}}}!function(e){e[e.literal=0]="literal",e[e.object=1]="object"}(Si||(Si={}));var Ni=function(){function e(t,i,a,s){var r,o=this;if(void 0===i&&(i=e.defaultLocale),this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=function(e){var t=o.formatToParts(e);if(1===t.length)return t[0].value;var i=t.reduce((function(e,t){return e.length&&t.type===Si.literal&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e}),[]);return i.length<=1?i[0]||"":i},this.formatToParts=function(e){return Ci(o.ast,o.locales,o.formatters,o.formats,e,void 0,o.message)},this.resolvedOptions=function(){return{locale:o.resolvedLocale.toString()}},this.getAst=function(){return o.ast},this.locales=i,this.resolvedLocale=e.resolveLocale(i),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");this.ast=e.__parse(t,{ignoreTag:null==s?void 0:s.ignoreTag,locale:this.resolvedLocale})}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=xi(e.formats,a),this.formatters=s&&s.formatters||(void 0===(r=this.formatterCache)&&(r={number:{},dateTime:{},pluralRules:{}}),{getNumberFormat:fi((function(){for(var e,t=[],i=0;i<arguments.length;i++)t[i]=arguments[i];return new((e=Intl.NumberFormat).bind.apply(e,n([void 0],t,!1)))}),{cache:Li(r.number),strategy:Hi.variadic}),getDateTimeFormat:fi((function(){for(var e,t=[],i=0;i<arguments.length;i++)t[i]=arguments[i];return new((e=Intl.DateTimeFormat).bind.apply(e,n([void 0],t,!1)))}),{cache:Li(r.dateTime),strategy:Hi.variadic}),getPluralRules:fi((function(){for(var e,t=[],i=0;i<arguments.length;i++)t[i]=arguments[i];return new((e=Intl.PluralRules).bind.apply(e,n([void 0],t,!1)))}),{cache:Li(r.pluralRules),strategy:Hi.variadic})})}return Object.defineProperty(e,"defaultLocale",{get:function(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale},enumerable:!1,configurable:!0}),e.memoizedDefaultLocale=null,e.resolveLocale=function(e){var t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])},e.__parse=mi,e.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},e}(),Ii=Ni;const ki={de:mt,en:nt,nl:ut};function Ri(e,t,...i){const a=t.replace(/['"]+/g,"");let s;try{s=e.split(".").reduce(((e,t)=>e[t]),ki[a])}catch(t){s=e.split(".").reduce(((e,t)=>e[t]),ki.en)}if(void 0===s&&(s=e.split(".").reduce(((e,t)=>e[t]),ki.en)),!i.length)return s;const n={};for(let e=0;e<i.length;e+=2){let t=i[e];t=t.replace(/^{([^}]+)?}$/,"$1"),n[t]=i[e+1]}try{return new Ii(s,t).format(n)}catch(e){return"Translation "+e}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const zi=2;class Ui{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class ji extends Ui{constructor(e){if(super(e),this.et=V,e.type!==zi)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===V||null==e)return this.ft=void 0,this.et=e;if(e===F)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;const t=[e];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}}ji.directiveName="unsafeHTML",ji.resultType=1;const Di=(e=>(...t)=>({_$litDirective$:e,values:t}))(ji);function Gi(e){return"true"===(e=null==e?void 0:e.toString().toLowerCase())||"1"===e}function Fi(e,t){return(e=e.toString()).split(",")[t]}function Vi(e,t){switch(t){case Fe:return e.units==He?G`${Di("m<sup>2</sup>")}`:G`${Di("sq ft")}`;case Ve:return e.units==He?G`${Di("l/minute")}`:G`${Di("gal/minute")}`;default:return G``}}function Zi(e,t){!function(e,t){const i=e.hasOwnProperty("tagName")?e:e.target;ve(i,"show-dialog",{dialogTag:"error-dialog",dialogImport:()=>Promise.resolve().then((function(){return ia})),dialogParams:{error:t}})}(t,G`
    <b>Something went wrong!</b>
    <br />
    ${e.body.message?G`
          ${e.body.message}
          <br />
          <br />
        `:""}
    ${e.error}
    <br />
    <br />
    Please
    <a href="https://github.com/jeroenterheerdt/HASmartIrrigation/issues"
      >report</a
    >
    the bug.
  `)}const Wi=c`
  ha-card {
    display: flex;
    flex-direction: column;
    margin: 5px;
    max-width: calc(100vw - 10px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
  }
  .card-header .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  div.warning {
    color: var(--error-color);
    margin-top: 20px;
  }

  div.checkbox-row {
    min-height: 40px;
    display: flex;
    align-items: center;
  }

  div.checkbox-row ha-switch {
    margin-right: 20px;
  }

  div.checkbox-row.right ha-switch {
    margin-left: 20px;
    position: absolute;
    right: 0px;
  }

  mwc-button.active {
    background: var(--primary-color);
    --mdc-theme-primary: var(--text-primary-color);
    border-radius: 4px;
  }
  mwc-button.warning {
    --mdc-theme-primary: var(--error-color);
  }
  mwc-button.success {
    --mdc-theme-primary: var(--success-color);
  }

  mwc-button.disabled.active {
    opacity: 0.5;
  }

  div.entity-row {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin: 10px 0px;
  }
  div.entity-row .info {
    margin-left: 16px;
    flex: 1 0 60px;
  }
  div.entity-row .info,
  div.entity-row .info > * {
    color: var(--primary-text-color);
    transition: color 0.2s ease-in-out;
  }
  div.entity-row .secondary {
    display: block;
    color: var(--secondary-text-color);
    transition: color 0.2s ease-in-out;
  }
  div.entity-row state-badge {
    flex: 0 0 40px;
  }

  ha-dialog div.wrapper {
    margin-bottom: -20px;
  }

  ha-textfield {
    min-width: 220px;
  }


  a,
  a:visited {
    color: var(--primary-color);
  }
  mwc-button ha-icon {
    padding-right: 11px;
  }
  mwc-button[trailingIcon] ha-icon {
    padding: 0px 0px 0px 6px;
  }
  mwc-button.vertical {
    height: 60px;
    --mdc-button-height: 60px;
    background: var(--primary-color);
    --mdc-theme-primary: var(--text-primary-color);
  }
  mwc-button.vertical div {
    display: flex;
    flex-direction: column;
  }
  mwc-button.vertical span {
    display: flex;
  }
  mwc-button.vertical ha-icon {
    display: flex;
    margin-left: 50%;
  }
  mwc-tab {
    --mdc-tab-color-default: var(--secondary-text-color);
    --mdc-tab-text-label-color-default: var(--secondary-text-color);
  }
  mwc-tab ha-icon {
    --mdc-icon-size: 20px;
  }
  mwc-tab.disabled {
    --mdc-theme-primary: var(--disabled-text-color);
    --mdc-tab-color-default: var(--disabled-text-color);
    --mdc-tab-text-label-color-default: var(--disabled-text-color);
  }

  ha-card settings-row:first-child,
  ha-card settings-row:first-of-type {
    border-top: 0px;
  }

  ha-card > ha-card {
    margin: 10px;
  }

`;c`
  /* mwc-dialog (ha-dialog) styles */
  ha-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-heading-ink-color: var(--primary-text-color);
    --mdc-dialog-content-ink-color: var(--primary-text-color);
    --justify-action-buttons: space-between;
  }
  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --mdc-dialog-min-width: calc(100vw - env(safe-area-inset-right) - env(safe-area-inset-left));
      --mdc-dialog-max-width: calc(100vw - env(safe-area-inset-right) - env(safe-area-inset-left));
      --mdc-dialog-min-height: 100%;
      --mdc-dialog-max-height: 100%;
      --vertial-align-dialog: flex-end;
      --ha-dialog-border-radius: 0px;
    }
  }
  ha-dialog div.description {
    margin-bottom: 10px;
  }
`;let Ki=class extends(qe(le)){hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:Ee+"_config_updated"})]}async _fetchData(){var e,t;this.hass&&(this.config=await We(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval"],e?Object.entries(e).filter((([e])=>t.includes(e))).reduce(((e,[t,i])=>Object.assign(e,{[t]:i})),{}):{}))}firstUpdated(){(async()=>{await ye()})()}render(){if(this.hass&&this.config&&this.data){let e=G` <div class="card-content">
        <label for="autocalcenabled"
          >${Ri("panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",this.hass.language)}:</label
        >
        <input
          type="radio"
          id="autocalcon"
          name="autocalcenabled"
          value="True"
          ?checked="${this.config.autocalcenabled}"
          @change="${e=>{this.saveData({autocalcenabled:Gi(e.target.value)})}}"
        /><label for="autocalcon"
          >${Ri("common.labels.yes",this.hass.language)}</label
        >
        <input
          type="radio"
          id="autocalcoff"
          name="autocalcenabled"
          value="False"
          ?checked="${!this.config.autocalcenabled}"
          @change="${e=>{this.saveData({autocalcenabled:Gi(e.target.value)})}}"
        /><label for="autocalcoff"
          >${Ri("common.labels.no",this.hass.language)}</label
        >
      </div>`;this.data.autocalcenabled&&(e=G`${e}
          <div class="card-content">
            <label for="calctime"
              >${Ri("panels.general.cards.automatic-duration-calculation.labels.auto-calc-time",this.hass.language)}</label
            >
            <input
              id="calctime"
              type="text"
              class="shortinput"
              .value="${this.config.calctime}"
              @input=${e=>{this.saveData({calctime:e.target.value})}}
            />
          </div>`),e=G`<ha-card header="${Ri("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}" >${e}</div></ha-card>`;let t=G` <div class="card-content">
        <label for="autoupdateenabled"
          >${Ri("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}:</label
        >
        <input
          type="radio"
          id="autoupdateon"
          name="autoupdateenabled"
          value="True"
          ?checked="${this.config.autoupdateenabled}"
          @change="${e=>{this.saveData({autoupdateenabled:Gi(e.target.value)})}}"
        /><label for="autoupdateon"
          >${Ri("common.labels.yes",this.hass.language)}</label
        >
        <input
          type="radio"
          id="autoupdateoff"
          name="autoupdateenabled"
          value="False"
          ?checked="${!this.config.autoupdateenabled}"
          @change="${e=>{this.saveData({autoupdateenabled:Gi(e.target.value)})}}"
        /><label for="autoupdateoff"
          >${Ri("common.labels.no",this.hass.language)}</label
        >
      </div>`;this.data.autoupdateenabled&&(t=G`${t}
          <div class="card-content">
            <label for="autoupdateinterval"
              >${Ri("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}:</label
            >
            <input
              name="autoupdateinterval"
              class="shortinput"
              type="number"
              value="${this.data.autoupdateinterval}"
              @input="${e=>{this.saveData({autoupdateinterval:parseInt(e.target.value)})}}"
            />
            <select
              type="text"
              id="autoupdateschedule"
              @change="${e=>{this.saveData({autoupdateschedule:e.target.value})}}"
            >
              <option
                value="${$e}"
                ?selected="${this.data.autoupdateschedule===$e}"
              >
                ${Ri("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
              </option>
              <option
                value="${_e}"
                ?selected="${this.data.autoupdateschedule===_e}"
              >
                ${Ri("panels.general.cards.automatic-update.options.hours",this.hass.language)}
              </option>
              <option
                value="${Ae}"
                ?selected="${this.data.autoupdateschedule===Ae}"
              >
                ${Ri("panels.general.cards.automatic-update.options.days",this.hass.language)}
              </option>
            </select>
          </div>
          <div class="card-content">
            <label for="updatetime"
              >${Ri("panels.general.cards.automatic-update.labels.auto-update-first-update",this.hass.language)}:</label
            >
            <input
              id="updatetime"
              type="text"
              class="shortinput"
              .value="${this.config.autoupdatefirsttime}"
              @input=${e=>{this.saveData({autoupdatefirsttime:e.target.value})}}
            />
          </div>`),this.data.autoupdateenabled&&this.data.autoupdatefirsttime&&this.data.calctime&&this.data.autoupdatefirsttime>=this.data.calctime&&(e=G`${e}
            <div class="card-content">
              ${Ri("panels.general.cards.automatic-update.errors.warning-update-time-on-or-after-calc-time",this.hass.language)}!
            </div>`),t=G`<ha-card header="${Ri("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${t}</ha-card>`;return G`<ha-card
          header="${Ri("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Ri("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${t}${e}`}return G``}saveData(e){var t,i;this.hass&&this.data&&(this.data=Object.assign(Object.assign({},this.data),e),(t=this.hass,i=this.data,t.callApi("POST",Ee+"/config",i)).catch((e=>Zi(e,this.shadowRoot.querySelector("ha-card")))).then())}static get styles(){return c`
      ${Wi}
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
    `}};s([pe()],Ki.prototype,"narrow",void 0),s([pe()],Ki.prototype,"path",void 0),s([pe()],Ki.prototype,"data",void 0),s([pe()],Ki.prototype,"config",void 0),Ki=s([ue("smart-irrigation-view-general")],Ki);var Xi,Yi="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z";!function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(Xi||(Xi={}));let qi=class extends(qe(le)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[]}firstUpdated(){(async()=>{await ye()})()}hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:Ee+"_config_updated"})]}async _fetchData(){this.hass&&(this.config=await We(this.hass),this.zones=await Ke(this.hass),this.modules=await Xe(this.hass),this.mappings=await Ye(this.hass))}handleCalculateAllZones(){this.hass&&this.hass.callApi("POST",Ee+"/zones",{calculate_all:!0})}handleUpdateAllZones(){this.hass&&this.hass.callApi("POST",Ee+"/zones",{update_all:!0})}handleAddZone(){const e={id:this.zones.length,name:this.nameInput.value,size:parseFloat(this.sizeInput.value),throughput:parseFloat(this.throughputInput.value),state:Xi.Automatic,duration:0,bucket:0,module:void 0,old_bucket:0,delta:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0};this.zones=[...this.zones,e],this.saveToHA(e)}handleEditZone(e,t){this.hass&&(this.zones=Object.values(this.zones).map(((i,a)=>a===e?t:i)),this.saveToHA(t))}handleRemoveZone(e,t){if(!this.hass)return;const i=Object.values(this.zones).at(t);var a,s;i&&(this.zones=this.zones.filter(((e,i)=>i!==t)),this.hass&&(a=this.hass,s=i.id.toString(),a.callApi("POST",Ee+"/zones",{id:s,remove:!0})))}handleCalculateZone(e){const t=Object.values(this.zones).at(e);var i,a;t&&(this.hass&&(i=this.hass,a=t.id.toString(),i.callApi("POST",Ee+"/zones",{id:a,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const t=Object.values(this.zones).at(e);var i,a;t&&(this.hass&&(i=this.hass,a=t.id.toString(),i.callApi("POST",Ee+"/zones",{id:a,update:!0})))}saveToHA(e){var t,i;this.hass&&(t=this.hass,i=e,t.callApi("POST",Ee+"/zones",i))}renderTheOptions(e,t){if(this.hass){let i=G`<option value="" ?selected=${void 0===t}">---${Ri("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map((([e,a])=>i=G`${i}
            <option
              value="${a.id}"
              ?selected="${t===a.id}"
            >
              ${a.id}: ${a.name}
            </option>`)),i}return G``}renderZone(e,t){if(this.hass){let i,a,s;return null!=e.explanation&&e.explanation.length>0&&(i=G`<svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          id="showcalcresults${t}"
          @click="${()=>this.toggleExplanation(t)}"
        >
          <title>
            ${Ri("panels.zones.actions.information",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"}" />
        </svg>`),e.state===Xi.Automatic&&(a=G` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${()=>this.handleCalculateZone(t)}"
        >
          <title>
            ${Ri("panels.zones.actions.calculate",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z"}" />
        </svg>`),e.state===Xi.Automatic&&(s=G` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${()=>this.handleUpdateZone(t)}"
        >
          <title>
            ${Ri("panels.zones.actions.update",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z"}" />
        </svg>`),G`
        <ha-card header="${e.name}">
          <div class="card-content">
            <label for="name${t}"
              >${Ri("panels.zones.labels.name",this.hass.language)}:</label
            >
            <input
              id="name${t}"
              type="text"
              .value="${e.name}"
              @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{name:i.target.value}))}"
            />
            <div class="zoneline">
              <label for="size${t}"
                >${Ri("panels.zones.labels.size",this.hass.language)}
                (${Vi(this.config,Fe)}):</label
              >
              <input class="shortinput" id="size${t}" type="number""
              .value="${e.size}"
              @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Fe]:parseFloat(i.target.value)}))}"
              />
            </div>
            <div class="zoneline">
              <label for="throughput${t}"
                >${Ri("panels.zones.labels.throughput",this.hass.language)}
                (${Vi(this.config,Ve)}):</label
              >
              <input
                class="shortinput"
                id="throughput${t}"
                type="number"
                .value="${e.throughput}"
                @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ve]:parseFloat(i.target.value)}))}"
              />
            </div>
            <div class="zoneline">
              <label for="state${t}"
                >${Ri("panels.zones.labels.state",this.hass.language)}:</label
              >
              <select
                required
                id="state${t}"
                @change="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{state:i.target.value,[Ze]:0}))}"
              >
                <option
                  value="${Xi.Automatic}"
                  ?selected="${e.state===Xi.Automatic}"
                >
                  ${Ri("panels.zones.labels.states.automatic",this.hass.language)}
                </option>
                <option
                  value="${Xi.Disabled}"
                  ?selected="${e.state===Xi.Disabled}"
                >
                  ${Ri("panels.zones.labels.states.disabled",this.hass.language)}
                </option>
                <option
                  value="${Xi.Manual}"
                  ?selected="${e.state===Xi.Manual}"
                >
                  ${Ri("panels.zones.labels.states.manual",this.hass.language)}
                </option>
              </select>
              <label for="module${t}"
                >${Ri("common.labels.module",this.hass.language)}:</label
              >

              <select
                id="module${t}"
                @change="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{module:parseInt(i.target.value)}))}"
              >
                ${this.renderTheOptions(this.modules,e.module)}
              </select>
              <label for="module${t}"
                >${Ri("panels.zones.labels.mapping",this.hass.language)}:</label
              >

              <select
                id="mapping${t}"
                @change="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{mapping:parseInt(i.target.value)}))}"
              >
              ${this.renderTheOptions(this.mappings,e.mapping)}
              </select>
            </div>
            <div class="zoneline">
              <label for="bucket${t}"
                >${Ri("panels.zones.labels.bucket",this.hass.language)}:</label
              >
              <input
                class="shortinput"
                id="bucket${t}"
                type="number"
                .value="${Number(e.bucket).toFixed(1)}"
                @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{bucket:parseFloat(i.target.value)}))}"
              />
              <label for="lead_time${t}"
                >${Ri("panels.zones.labels.lead-time",this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="lead_time${t}"
                type="number"
                .value="${e.lead_time}"
                @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{lead_time:parseInt(i.target.value,10)}))}"
              />
              <label for="maximum-duration${t}"
                >${Ri("panels.zones.labels.maximum-duration",this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="maximum-duration${t}"
                type="number"
                .value="${e.maximum_duration}"
                @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{maximum_duration:parseInt(i.target.value,10)}))}"
              />
            </div>
            <div class="zoneline">
              <label for="multiplier${t}"
                >${Ri("panels.zones.labels.multiplier",this.hass.language)}:</label
              >
              <input
                class="shortinput"
                id="multiplier${t}"
                type="number"
                .value="${e.multiplier}"
                @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{multiplier:parseFloat(i.target.value)}))}"
              />
              <label for="duration${t}"
                >${Ri("panels.zones.labels.duration",this.hass.language)}
                (${"s"}):</label
              >
              <input
                class="shortinput"
                id="duration${t}"
                type="number"
                .value="${e.duration}"
                ?readonly="${e.state===Xi.Disabled||e.state===Xi.Automatic}"
                @input="${i=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ze]:parseInt(i.target.value,10)}))}"
              />
            </div>
            <div class="zoneline">
              ${s} ${a}
              ${i}
              <svg
                style="width:24px;height:24px"
                viewBox="0 0 24 24"
                id="deleteZone${t}"
                @click="${e=>this.handleRemoveZone(e,t)}"
              >
                <title>
                  ${Ri("common.actions.delete",this.hass.language)}
                </title>
                <path fill="#404040" d="${Yi}" />
              </svg>
            </div>
            <div class="zoneline">
              <div>
                <label class="hidden" id="calcresults${t}"
                  >${Di("<br/>"+e.explanation)}</label
                >
              </div>
            </div>
          </div>
        </ha-card>
      `}return G``}toggleExplanation(e){var t;const i=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);i&&("hidden"!=i.className?i.className="hidden":i.className="explanation")}render(){return this.hass&&this.config?G`
        <ha-card header="${Ri("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${Ri("panels.zones.description",this.hass.language)}
          </div>
        </ha-card>
          <ha-card header="${Ri("panels.zones.cards.add-zone.header",this.hass.language)}">
            <div class="card-content">
              <div class="zoneline"><label for="nameInput">${Ri("panels.zones.labels.name",this.hass.language)}:</label>
              <input id="nameInput" type="text"/>
              </div>
              <div class="zoneline">
              <label for="sizeInput">${Ri("panels.zones.labels.size",this.hass.language)} (${Vi(this.config,Fe)}):</label>
              <input class="shortinput" id="sizeInput" type="number"/>
              </div>
              <div class="zoneline">
              <label for="throughputInput">${Ri("panels.zones.labels.throughput",this.hass.language)} (${Vi(this.config,Ve)}):</label>
              <input id="throughputInput" class="shortinput" type="number"/>
              </div>
              <div class="zoneline">
              <button @click="${this.handleAddZone}">${Ri("panels.zones.cards.add-zone.actions.add",this.hass.language)}</button>
              </div>
            </div>
            </ha-card>
            <ha-card header="${Ri("panels.zones.cards.zone-actions.header",this.hass.language)}">
            <div class="card-content">
                <button @click="${this.handleUpdateAllZones}">${Ri("panels.zones.cards.zone-actions.actions.update-all",this.hass.language)}</button>
                <button @click="${this.handleCalculateAllZones}">${Ri("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language)}</button>
            </div>
          </ha-card>

          ${Object.entries(this.zones).map((([e,t])=>this.renderZone(t,parseInt(e))))}
        </ha-card>
      `:G``}static get styles(){return c`
      ${Wi}
      .zone {
        margin-top: 25px;
        margin-bottom: 25px;
      }
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
      .zoneline {
        margin-left: 20px;
        margin-top: 5px;
      }
    `}};s([pe()],qi.prototype,"config",void 0),s([pe({type:Array})],qi.prototype,"zones",void 0),s([pe({type:Array})],qi.prototype,"modules",void 0),s([pe({type:Array})],qi.prototype,"mappings",void 0),s([ge("#nameInput")],qi.prototype,"nameInput",void 0),s([ge("#sizeInput")],qi.prototype,"sizeInput",void 0),s([ge("#throughputInput")],qi.prototype,"throughputInput",void 0),qi=s([ue("smart-irrigation-view-zones")],qi);let Ji=class extends(qe(le)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[]}firstUpdated(){(async()=>{await ye()})()}hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:Ee+"_config_updated"})]}async _fetchData(){var e;this.hass&&(this.config=await We(this.hass),this.zones=await Ke(this.hass),this.modules=await Xe(this.hass),this.allmodules=await(e=this.hass,e.callWS({type:Ee+"/allmodules"})))}handleAddModule(){const e=this.allmodules.filter((e=>e.name==this.moduleInput.selectedOptions[0].text))[0];if(!e)return;const t={id:this.modules.length,name:this.moduleInput.selectedOptions[0].text,description:e.description,config:e.config,schema:e.schema};this.modules=[...this.modules,t],this.saveToHA(t),this._fetchData()}handleRemoveModule(e,t){var i,a;(this.modules=this.modules.filter(((e,i)=>i!==t)),this.hass)&&(i=this.hass,a=t.toString(),i.callApi("POST",Ee+"/modules",{id:a,remove:!0}))}saveToHA(e){var t,i;this.hass&&(t=this.hass,i=e,t.callApi("POST",Ee+"/modules",i))}renderModule(e,t){if(this.hass){const i=this.zones.filter((t=>t.module===e.id)).length;return G`
        <ha-card header="${e.id}: ${e.name}">
          <div class="card-content">
            <div class="moduledescription${t}">${e.description}</div>
            <div class="moduleconfig">
              <label class="subheader"
                >${Ri("panels.modules.cards.module.labels.configuration",this.hass.language)}
                (*
                ${Ri("panels.modules.cards.module.labels.required",this.hass.language)})</label
              >
              ${e.schema?Object.entries(e.schema).map((([e])=>this.renderConfig(t,e))):null}
            </div>
            ${i?G` ${Ri("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}.`:G` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${t}"
                  @click="${e=>this.handleRemoveModule(e,t)}"
                >
                  <title>
                    ${Ri("common.actions.delete",this.hass.language)}
                  </title>
                  <path fill="#404040" d="${Yi}" />
                </svg>`}
          </div>
        </ha-card>
      `}return G``}renderConfig(e,t){const i=Object.values(this.modules).at(e);if(!i||!this.hass)return;const a=i.schema[t],s=a.name,n=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(s);let r="";null==i.config&&(i.config=[]),s in i.config&&(r=i.config[s]);let o=G`<label for="${s+e}"
      >${n} </label
    `;if("boolean"==a.type)o=G`${o}<input
          type="checkbox"
          id="${s+e}"
          .value="${r}"
          @input="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[s]:t.target.checked})}))}"
        />`;else if("float"==a.type||"integer"==a.type)o=G`${o}<input
          type="number"
          class="shortinput"
          id="${a.name+e}"
          .value="${i.config[a.name]}"
          @input="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[s]:t.target.value})}))}"
        />`;else if("string"==a.type)o=G`${o}<input
          type="text"
          id="${s+e}"
          .value="${r}"
          @input="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[s]:t.target.value})}))}"
        />`;else if("select"==a.type){const t=this.hass.language;o=G`${o}<select
          id="${s+e}"
          @change="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},i),{config:Object.assign(Object.assign({},i.config),{[s]:t.target.value})}))}"
        >

          ${Object.entries(a.options).map((([e,i])=>G`<option
                value="${Fi(i,0)}"
                ?selected="${r===Fi(i,0)}"
              >
                ${Ri("panels.modules.cards.module.translated-options."+Fi(i,1),t)}
              </option>`))}
        </select>`}return a.required&&(o=G`${o} *`),o=G`<div class="schemaline">${o}</div>`,o}handleEditConfig(e,t){this.modules=Object.values(this.modules).map(((i,a)=>a===e?t:i)),this.saveToHA(t)}renderOption(e,t){return this.hass?G`<option value="${e}>${t}</option>`:G``}render(){return this.hass?G`
        <ha-card
          header="${Ri("panels.modules.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Ri("panels.modules.description",this.hass.language)}
          </div>
        </ha-card>
        <ha-card
          header="${Ri("panels.modules.cards.add-module.header",this.hass.language)}"
        >
          <div class="card-content">
            <label for="moduleInput"
              >${Ri("common.labels.module",this.hass.language)}:</label
            >
            <select id="moduleInput">
              ${Object.entries(this.allmodules).map((([e,t])=>G`<option value="${t.id}">${t.name}</option>`))}
            </select>
            <button @click="${this.handleAddModule}">
              ${Ri("panels.modules.cards.add-module.actions.add",this.hass.language)}
            </button>
          </div>
        </ha-card>

        ${Object.entries(this.modules).map((([e,t])=>this.renderModule(t,parseInt(e))))}
      `:G``}static get styles(){return c`
      ${Wi}
      .zone {
        margin-top: 25px;
        margin-bottom: 25px;
      }
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
      .subheader {
        font-weight: bold;
      }
    `}};s([pe()],Ji.prototype,"config",void 0),s([pe({type:Array})],Ji.prototype,"zones",void 0),s([pe({type:Array})],Ji.prototype,"modules",void 0),s([pe({type:Array})],Ji.prototype,"allmodules",void 0),s([ge("#moduleInput")],Ji.prototype,"moduleInput",void 0),Ji=s([ue("smart-irrigation-view-modules")],Ji);let Qi=class extends(qe(le)){constructor(){super(...arguments),this.zones=[],this.mappings=[]}firstUpdated(){(async()=>{await ye()})()}hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:Ee+"_config_updated"})]}async _fetchData(){this.hass&&(this.config=await We(this.hass),this.zones=await Ke(this.hass),this.mappings=await Ye(this.hass))}handleAddMapping(){const e={[Se]:"",[Te]:"",[Oe]:"",[Be]:"",[Pe]:"",[Me]:"",[Ce]:"",[xe]:"",[Le]:"",[Ne]:""},t={id:this.mappings.length,name:this.mappingNameInput.value,mappings:e};this.mappings=[...this.mappings,t],this.saveToHA(t),this._fetchData()}handleRemoveMapping(e,t){var i,a;(this.mappings=this.mappings.filter(((e,i)=>i!==t)),this.hass)&&(i=this.hass,a=t.toString(),i.callApi("POST",Ee+"/mappings",{id:a,remove:!0}))}handleEditMapping(e,t){this.mappings=Object.values(this.mappings).map(((i,a)=>a===e?t:i)),this.saveToHA(t)}saveToHA(e){var t,i;this.hass&&(t=this.hass,i=e,t.callApi("POST",Ee+"/mappings",i))}renderMapping(e,t){if(this.hass){const i=this.zones.filter((t=>t.mapping===e.id)).length;return G`
        <ha-card header="${e.id}: ${e.name}">
          <div class="card-content">
            <label for="name${e.id}"
              >${Ri("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @input="${i=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:i.target.value}))}"
            />
            ${Object.entries(e.mappings).map((([e])=>this.renderMappingSetting(t,e)))}
            ${i?G`${Ri("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}`:G` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${t}"
                  @click="${e=>this.handleRemoveMapping(e,t)}"
                >
                  <title>
                    ${Ri("common.actions.delete",this.hass.language)}
                  </title>
                  <path fill="#404040" d="${Yi}" />
                </svg>`}
          </div>
        </ha-card>
      `}return G``}renderMappingSetting(e,t){var i,a,s;const n=Object.values(this.mappings).at(e);if(!n||!this.hass)return;const r=n.mappings[t];let o=G`<div class="mappingsettingname">
      <label for="${t+e}"
        >${Ri("panels.mappings.cards.mapping.items."+t.toLowerCase(),this.hass.language)}
      </label>
    </div> `;if(o=G`${o}
      <div class="mappingsettingline">
        <label for="${t+e+ze}"
          >${Ri("panels.mappings.cards.mapping.source",this.hass.language)}:</label
        >
      </div>`,t==Te||t==xe)o=G`${o}
        <input
          type="radio"
          id="${t+e+Re}"
          value="${Re}"
          name="${t+e+ze}"
          ?checked="${r[ze]===Re}"
          @change="${i=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{source:i.target.value})})}))}"
        /><label for="${t+e+Re}"
          >${Ri("panels.mappings.cards.mapping.sources.none",this.hass.language)}</label
        > `;else{let l="";(null===(i=this.config)||void 0===i?void 0:i.use_owm)||(l="strikethrough"),o=G`${o}
        <input
          type="radio"
          id="${t+e+Ie}"
          value="${Ie}"
          name="${t+e+ze}"
          ?enabled="${null===(a=this.config)||void 0===a?void 0:a.use_owm}"
          ?checked="${(null===(s=this.config)||void 0===s?void 0:s.use_owm)&&r[ze]===Ie}"
          @change="${i=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{source:i.target.value})})}))}"
        /><label
          class="${l}"
          for="${t+e+Ie}"
          >${Ri("panels.mappings.cards.mapping.sources.openweathermap",this.hass.language)}</label
        >`}return o=G`${o}
        <input
          type="radio"
          id="${t+e+ke}"
          value="${ke}"
          name="${t+e+ze}"
          ?checked="${r[ze]===ke}"
          @change="${i=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[ze]:i.target.value})})}))}"
        /><label for="${t+e+ke}"
          >${Ri("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}</label
        >
      </div>`,r[ze]==ke&&(o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+Ue}"
            >${Ri("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}:</label
          >
          <input
            type="text"
            id="${t+e+Ue}"
            value="${r[Ue]}"
            @input="${i=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[Ue]:i.target.value})})}))}"
          />
        </div>`,o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+je}"
            >${Ri("panels.mappings.cards.mapping.sensor-units",this.hass.language)}:</label
          >
          <select
            type="text"
            id="${t+e+je}"
            @change="${i=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[je]:i.target.value})})}))}"
          >
            ${this.renderUnitOptionsForMapping(t,r)}
          </select>
        </div>`,o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+De}"
            >${Ri("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
          </label>
          <select
            type="text"
            id="${t+e+De}"
            @change="${i=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[De]:i.target.value})})}))}"
          >
            ${this.renderAggregateOptionsForMapping(t,r)}
          </select>
          <label for="${t+e+De}"
            >${Ri("panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",this.hass.language)}</label
          >
        </div>`),o=G`<div class="mappingline">${o}</div>`,o}renderAggregateOptionsForMapping(e,t){if(this.hass&&this.config){let i=G``,a="average";e===Me?a="last":e===Be?a="maximum":e===Pe&&(a="minimum"),t[De]&&(a=t[De]);for(const e of Ge){const t=this.renderAggregateOption(e,a);i=G`${i}${t}`}return i}return G``}renderAggregateOption(e,t){if(this.hass&&this.config){return G`<option value="${e}" ?selected="${e===t}">
        ${Ri("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return G``}renderUnitOptionsForMapping(e,t){if(this.hass&&this.config){const i=function(e){switch(e){case Se:case Pe:case Be:case Le:return[{unit:"°C",system:He},{unit:"°F",system:we}];case Me:case Te:return[{unit:"mm",system:He},{unit:"in",system:we}];case Oe:return[{unit:"%",system:[He,we]}];case Ce:return[{unit:"millibar",system:He},{unit:"hPa",system:He},{unit:"psi",system:we},{unit:"inch Hg",system:we}];case Ne:return[{unit:"km/h",system:He},{unit:"meter/s",system:He},{unit:"mile/h",system:we}];case xe:return[{unit:"W/m2",system:He},{unit:"MJ/day/m2",system:He},{unit:"W/sq ft",system:we},{unit:"MJ/day/sq ft",system:we}];default:return[]}}(e);let a=G``,s=t[je];const n=this.config.units;return t[je]||i.forEach((function(e){"string"==typeof e.system?n==e.system&&(s=e.unit):e.system.forEach((function(t){n==t.system&&(s=e.unit)}))})),i.forEach((function(e){a=G`${a}
          <option value="${e.unit}" ?selected="${s===e.unit}">
            ${e.unit}
          </option>`})),a}return G``}render(){return this.hass?G`
        <ha-card
          header="${Ri("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Ri("panels.mappings.description",this.hass.language)}.
          </div>
        </ha-card>
        <ha-card
          header="${Ri("panels.mappings.cards.add-mapping.header",this.hass.language)}"
        >
          <div class="card-content">
            <label for="mappingNameInput"
              >${Ri("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input id="mappingNameInput" type="text" />
            <button @click="${this.handleAddMapping}">
              ${Ri("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </button>
          </div>
        </ha-card>

        ${Object.entries(this.mappings).map((([e,t])=>this.renderMapping(t,parseInt(e))))}
      `:G``}static get styles(){return c`
      ${Wi}
      .mapping {
        margin-top: 25px;
        margin-bottom: 25px;
      }
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
      .mappingsettingname {
        font-weight: bold;
      }
      .mappingline {
        margin-top: 25px;
      }
      .strikethrough {
        text-decoration: line-through;
      }
    `}};s([pe()],Qi.prototype,"config",void 0),s([pe({type:Array})],Qi.prototype,"zones",void 0),s([pe({type:Array})],Qi.prototype,"mappings",void 0),s([ge("#mappingNameInput")],Qi.prototype,"mappingNameInput",void 0),Qi=s([ue("smart-irrigation-view-mappings")],Qi);const ea=()=>{const e=e=>{let t={};for(let i=0;i<e.length;i+=2){const a=e[i],s=i<e.length?e[i+1]:void 0;t=Object.assign(Object.assign({},t),{[a]:s})}return t},t=window.location.pathname.split("/");let i={page:t[2]||"general",params:{}};if(t.length>3){let a=t.slice(3);if(t.includes("filter")){const t=a.findIndex((e=>"filter"==e)),s=a.slice(t+1);a=a.slice(0,t),i=Object.assign(Object.assign({},i),{filter:e(s)})}a.length&&(a.length%2&&(i=Object.assign(Object.assign({},i),{subpage:a.shift()})),a.length&&(i=Object.assign(Object.assign({},i),{params:e(a)})))}return i};e.SmartIrrigationPanel=class extends le{async firstUpdated(){window.addEventListener("location-changed",(()=>{window.location.pathname.includes("smart-irrigation")&&this.requestUpdate()})),await ye(),this.requestUpdate()}render(){if(!customElements.get("ha-panel-config"))return G` loading... `;const e=ea();return G`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${Ri("title",this.hass.language)}</div>
          <div class="version">${"v2023.8.0-beta28"}</div>
        </div>

        <ha-tabs
          scrollable
          attr-for-selected="page-name"
          .selected=${e.page}
          @iron-activate=${this.handlePageSelected}
        >
          <paper-tab page-name="general">
            ${Ri("panels.general.title",this.hass.language)}
          </paper-tab>
          <paper-tab page-name="zones">
            ${Ri("panels.zones.title",this.hass.language)}
          </paper-tab>
          <paper-tab page-name="modules"
            >${Ri("panels.modules.title",this.hass.language)}</paper-tab
          >
          <paper-tab page-name="mappings"
            >${Ri("panels.mappings.title",this.hass.language)}</paper-tab
          >
          <paper-tab page-name="help"
            >${Ri("panels.help.title",this.hass.language)}</paper-tab
          >
        </ha-tabs>
      </div>
      <div class="view">${this.getView(e)}</div>
    `}getView(e){switch(e.page){case"general":return G`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-general>
        `;case"zones":return G`
          <smart-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-zones>
        `;case"modules":return G`
          <smart-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-modules>
        `;case"mappings":return G`
          <smart-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-mappings>
        `;case"help":return G`<ha-card header="How to get help">
          <div class="card-content">
            First, read the
            <a href="https://github.com/jeroenterheerdt/HAsmartirrigation/wiki"
              >Wiki</a
            >. If you still need help reach out on the
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >Community forum</a
            >
            or open a
            <a
              href="https://github.com/jeroenterheerdt/HAsmartirrigation/issues"
              >Github Issue</a
            >
            (English only).
          </div></ha-card
        >`;default:return G`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `}}handlePageSelected(e){const t=e.detail.item.getAttribute("page-name");t!==ea().page?(!function(e,t,i){void 0===i&&(i=!1),i?history.replaceState(null,"",t):history.pushState(null,"",t),ve(window,"location-changed",{replace:i})}(0,((e,...t)=>{let i={page:e,params:{}};t.forEach((e=>{"string"==typeof e?i=Object.assign(Object.assign({},i),{subpage:e}):"params"in e?i=Object.assign(Object.assign({},i),{params:e.params}):"filter"in e&&(i=Object.assign(Object.assign({},i),{filter:e.filter}))}));const a=e=>{let t=Object.keys(e);t=t.filter((t=>e[t])),t.sort();let i="";return t.forEach((t=>{const a=e[t];i=i.length?`${i}/${t}/${a}`:`${t}/${a}`})),i};let s=`/${Ee}/${i.page}`;return i.subpage&&(s=`${s}/${i.subpage}`),a(i.params).length&&(s=`${s}/${a(i.params)}`),i.filter&&(s=`${s}/filter/${a(i.filter)}`),s})(t)),this.requestUpdate()):scrollTo(0,0)}static get styles(){return c`
      ${Wi} :host {
        color: var(--primary-text-color);
        --paper-card-header-color: var(--primary-text-color);
      }
      .header {
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color, white);
        border-bottom: var(--app-header-border-bottom, none);
      }
      .toolbar {
        height: var(--header-height);
        display: flex;
        align-items: center;
        font-size: 20px;
        padding: 0 16px;
        font-weight: 400;
        box-sizing: border-box;
      }
      .main-title {
        margin: 0 0 0 24px;
        line-height: 20px;
        flex-grow: 1;
      }
      ha-tabs {
        margin-left: max(env(safe-area-inset-left), 24px);
        margin-right: max(env(safe-area-inset-right), 24px);
        --paper-tabs-selection-bar-color: var(
          --app-header-selection-bar-color,
          var(--app-header-text-color, #fff)
        );
        text-transform: uppercase;
      }

      .view {
        height: calc(100vh - 112px);
        display: flex;
        justify-content: center;
      }

      .view > * {
        width: 600px;
        max-width: 600px;
      }

      .view > *:last-child {
        margin-bottom: 20px;
      }

      .version {
        font-size: 14px;
        font-weight: 500;
        color: rgba(var(--rgb-text-primary-color), 0.9);
      }
    `}},s([pe()],e.SmartIrrigationPanel.prototype,"hass",void 0),s([pe({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),e.SmartIrrigationPanel=s([ue("smart-irrigation")],e.SmartIrrigationPanel);let ta=class extends le{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?G`
      <ha-dialog
        open
        .heading=${!0}
        @closed=${this.closeDialog}
        @close-dialog=${this.closeDialog}
      >
        <div slot="heading">
          <ha-header-bar>
            <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
            ></ha-icon-button>
            <span slot="title">
              ${this.hass.localize("state_badge.default.error")}
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">${this._params.error||""}</div>

        <mwc-button
          slot="primaryAction"
          style="float: left"
          @click=${this.closeDialog}
          dialogAction="close"
        >
          ${this.hass.localize("ui.dialogs.generic.ok")}
        </mwc-button>
      </ha-dialog>
    `:G``}static get styles(){return c`
      div.wrapper {
        color: var(--primary-text-color);
      }
    `}};s([pe({attribute:!1})],ta.prototype,"hass",void 0),s([function(e){return pe({...e,state:!0})}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */()],ta.prototype,"_params",void 0),ta=s([ue("error-dialog")],ta);var ia=Object.freeze({__proto__:null,get ErrorDialog(){return ta}});Object.defineProperty(e,"__esModule",{value:!0})}({});
//# sourceMappingURL=smart-irrigation.js.map
