!function(e){"use strict";var t=function(e,a){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var a in t)Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a])},t(e,a)};function a(e,a){if("function"!=typeof a&&null!==a)throw new TypeError("Class extends value "+String(a)+" is not a constructor or null");function i(){this.constructor=e}t(e,a),e.prototype=null===a?Object.create(a):(i.prototype=a.prototype,new i)}var i=function(){return i=Object.assign||function(e){for(var t,a=1,i=arguments.length;a<i;a++)for(var s in t=arguments[a])Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s]);return e},i.apply(this,arguments)};function s(e,t,a,i){var s,n=arguments.length,r=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,a):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,a,i);else for(var o=e.length-1;o>=0;o--)(s=e[o])&&(r=(n<3?s(r):n>3?s(t,a,r):s(t,a))||r);return n>3&&r&&Object.defineProperty(t,a,r),r}function n(e,t,a){if(a||2===arguments.length)for(var i,s=0,n=t.length;s<n;s++)!i&&s in t||(i||(i=Array.prototype.slice.call(t,0,s)),i[s]=t[s]);return e.concat(i||Array.prototype.slice.call(t))}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const r=window,o=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,l=Symbol(),h=new WeakMap;class u{constructor(e,t,a){if(this._$cssResult$=!0,a!==l)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(o&&void 0===e){const a=void 0!==t&&1===t.length;a&&(e=h.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),a&&h.set(t,e))}return e}toString(){return this.cssText}}const c=(e,...t)=>{const a=1===e.length?e[0]:t.reduce(((t,a,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+e[i+1]),e[0]);return new u(a,e,l)},p=o?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const a of e.cssRules)t+=a.cssText;return(e=>new u("string"==typeof e?e:e+"",void 0,l))(t)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */;var d;const g=window,m=g.trustedTypes,f=m?m.emptyScript:"",b=g.reactiveElementPolyfillSupport,v={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let a=e;switch(t){case Boolean:a=null!==e;break;case Number:a=null===e?null:Number(e);break;case Object:case Array:try{a=JSON.parse(e)}catch(e){a=null}}return a}},y=(e,t)=>t!==e&&(t==t||e==e),$={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:y},E="finalized";class _ extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach(((t,a)=>{const i=this._$Ep(a,t);void 0!==i&&(this._$Ev.set(i,a),e.push(i))})),e}static createProperty(e,t=$){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const a="symbol"==typeof e?Symbol():"__"+e,i=this.getPropertyDescriptor(e,a,t);void 0!==i&&Object.defineProperty(this.prototype,e,i)}}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(i){const s=this[e];this[t]=i,this.requestUpdate(e,s,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||$}static finalize(){if(this.hasOwnProperty(E))return!1;this[E]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const a of t)this.createProperty(a,e[a])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const a=new Set(e.flat(1/0).reverse());for(const e of a)t.unshift(p(e))}else void 0!==e&&t.push(p(e));return t}static _$Ep(e,t){const a=t.attribute;return!1===a?void 0:"string"==typeof a?a:"string"==typeof e?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach((e=>e(this)))}addController(e){var t,a;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(a=e.hostConnected)||void 0===a||a.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;const t=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{o?e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet)):t.forEach((t=>{const a=document.createElement("style"),i=r.litNonce;void 0!==i&&a.setAttribute("nonce",i),a.textContent=t.cssText,e.appendChild(a)}))})(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)}))}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)}))}attributeChangedCallback(e,t,a){this._$AK(e,a)}_$EO(e,t,a=$){var i;const s=this.constructor._$Ep(e,a);if(void 0!==s&&!0===a.reflect){const n=(void 0!==(null===(i=a.converter)||void 0===i?void 0:i.toAttribute)?a.converter:v).toAttribute(t,a.type);this._$El=e,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$El=null}}_$AK(e,t){var a;const i=this.constructor,s=i._$Ev.get(e);if(void 0!==s&&this._$El!==s){const e=i.getPropertyOptions(s),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(a=e.converter)||void 0===a?void 0:a.fromAttribute)?e.converter:v;this._$El=s,this[s]=n.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,a){let i=!0;void 0!==e&&(((a=a||this.constructor.getPropertyOptions(e)).hasChanged||y)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===a.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,a))):i=!1),!this.isUpdatePending&&i&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((e,t)=>this[t]=e)),this._$Ei=void 0);let t=!1;const a=this._$AL;try{t=this.shouldUpdate(a),t?(this.willUpdate(a),null===(e=this._$ES)||void 0===e||e.forEach((e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)})),this.update(a)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(a)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach((e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach(((e,t)=>this._$EO(t,this[t],e))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var A;_[E]=!0,_.elementProperties=new Map,_.elementStyles=[],_.shadowRootOptions={mode:"open"},null==b||b({ReactiveElement:_}),(null!==(d=g.reactiveElementVersions)&&void 0!==d?d:g.reactiveElementVersions=[]).push("1.6.2");const w=window,H=w.trustedTypes,S=H?H.createPolicy("lit-html",{createHTML:e=>e}):void 0,T="$lit$",O=`lit$${(Math.random()+"").slice(9)}$`,B="?"+O,M=`<${B}>`,P=document,C=()=>P.createComment(""),x=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,I="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,k=/-->/g,R=/>/g,z=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,U=/"/g,D=/^(?:script|style|textarea|title)$/i,G=(e=>(t,...a)=>({_$litType$:e,strings:t,values:a}))(1),F=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),Z=new WeakMap,W=P.createTreeWalker(P,129,null,!1),K=(e,t)=>{const a=e.length-1,i=[];let s,n=2===t?"<svg>":"",r=N;for(let t=0;t<a;t++){const a=e[t];let o,l,h=-1,u=0;for(;u<a.length&&(r.lastIndex=u,l=r.exec(a),null!==l);)u=r.lastIndex,r===N?"!--"===l[1]?r=k:void 0!==l[1]?r=R:void 0!==l[2]?(D.test(l[2])&&(s=RegExp("</"+l[2],"g")),r=z):void 0!==l[3]&&(r=z):r===z?">"===l[0]?(r=null!=s?s:N,h=-1):void 0===l[1]?h=-2:(h=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?z:'"'===l[3]?U:j):r===U||r===j?r=z:r===k||r===R?r=N:(r=z,s=void 0);const c=r===z&&e[t+1].startsWith("/>")?" ":"";n+=r===N?a+M:h>=0?(i.push(o),a.slice(0,h)+T+a.slice(h)+O+c):a+O+(-2===h?(i.push(void 0),t):c)}const o=n+(e[a]||"<?>")+(2===t?"</svg>":"");if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==S?S.createHTML(o):o,i]};class X{constructor({strings:e,_$litType$:t},a){let i;this.parts=[];let s=0,n=0;const r=e.length-1,o=this.parts,[l,h]=K(e,t);if(this.el=X.createElement(l,a),W.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(i=W.nextNode())&&o.length<r;){if(1===i.nodeType){if(i.hasAttributes()){const e=[];for(const t of i.getAttributeNames())if(t.endsWith(T)||t.startsWith(O)){const a=h[n++];if(e.push(t),void 0!==a){const e=i.getAttribute(a.toLowerCase()+T).split(O),t=/([.?@])?(.*)/.exec(a);o.push({type:1,index:s,name:t[2],strings:e,ctor:"."===t[1]?ee:"?"===t[1]?ae:"@"===t[1]?ie:Q})}else o.push({type:6,index:s})}for(const t of e)i.removeAttribute(t)}if(D.test(i.tagName)){const e=i.textContent.split(O),t=e.length-1;if(t>0){i.textContent=H?H.emptyScript:"";for(let a=0;a<t;a++)i.append(e[a],C()),W.nextNode(),o.push({type:2,index:++s});i.append(e[t],C())}}}else if(8===i.nodeType)if(i.data===B)o.push({type:2,index:s});else{let e=-1;for(;-1!==(e=i.data.indexOf(O,e+1));)o.push({type:7,index:s}),e+=O.length-1}s++}}static createElement(e,t){const a=P.createElement("template");return a.innerHTML=e,a}}function Y(e,t,a=e,i){var s,n,r,o;if(t===F)return t;let l=void 0!==i?null===(s=a._$Co)||void 0===s?void 0:s[i]:a._$Cl;const h=x(t)?void 0:t._$litDirective$;return(null==l?void 0:l.constructor)!==h&&(null===(n=null==l?void 0:l._$AO)||void 0===n||n.call(l,!1),void 0===h?l=void 0:(l=new h(e),l._$AT(e,a,i)),void 0!==i?(null!==(r=(o=a)._$Co)&&void 0!==r?r:o._$Co=[])[i]=l:a._$Cl=l),void 0!==l&&(t=Y(e,l._$AS(e,t.values),l,i)),t}class q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:a},parts:i}=this._$AD,s=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:P).importNode(a,!0);W.currentNode=s;let n=W.nextNode(),r=0,o=0,l=i[0];for(;void 0!==l;){if(r===l.index){let t;2===l.type?t=new J(n,n.nextSibling,this,e):1===l.type?t=new l.ctor(n,l.name,l.strings,this,e):6===l.type&&(t=new se(n,this,e)),this._$AV.push(t),l=i[++o]}r!==(null==l?void 0:l.index)&&(n=W.nextNode(),r++)}return W.currentNode=P,s}v(e){let t=0;for(const a of this._$AV)void 0!==a&&(void 0!==a.strings?(a._$AI(e,a,t),t+=a.strings.length-2):a._$AI(e[t])),t++}}class J{constructor(e,t,a,i){var s;this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=a,this.options=i,this._$Cp=null===(s=null==i?void 0:i.isConnected)||void 0===s||s}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),x(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>L(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==V&&x(this._$AH)?this._$AA.nextSibling.data=e:this.$(P.createTextNode(e)),this._$AH=e}g(e){var t;const{values:a,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=X.createElement(i.h,this.options)),i);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===s)this._$AH.v(a);else{const e=new q(s,this),t=e.u(this.options);e.v(a),this.$(t),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new X(e)),t}T(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let a,i=0;for(const s of e)i===t.length?t.push(a=new J(this.k(C()),this.k(C()),this,this.options)):a=t[i],a._$AI(s),i++;i<t.length&&(this._$AR(a&&a._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){var a;for(null===(a=this._$AP)||void 0===a||a.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class Q{constructor(e,t,a,i,s){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=s,a.length>2||""!==a[0]||""!==a[1]?(this._$AH=Array(a.length-1).fill(new String),this.strings=a):this._$AH=V}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,a,i){const s=this.strings;let n=!1;if(void 0===s)e=Y(this,e,t,0),n=!x(e)||e!==this._$AH&&e!==F,n&&(this._$AH=e);else{const i=e;let r,o;for(e=s[0],r=0;r<s.length-1;r++)o=Y(this,i[a+r],t,r),o===F&&(o=this._$AH[r]),n||(n=!x(o)||o!==this._$AH[r]),o===V?e=V:e!==V&&(e+=(null!=o?o:"")+s[r+1]),this._$AH[r]=o}n&&!i&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class ee extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}const te=H?H.emptyScript:"";class ae extends Q{constructor(){super(...arguments),this.type=4}j(e){e&&e!==V?this.element.setAttribute(this.name,te):this.element.removeAttribute(this.name)}}class ie extends Q{constructor(e,t,a,i,s){super(e,t,a,i,s),this.type=5}_$AI(e,t=this){var a;if((e=null!==(a=Y(this,e,t,0))&&void 0!==a?a:V)===F)return;const i=this._$AH,s=e===V&&i!==V||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==V&&(i===V||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,a;"function"==typeof this._$AH?this._$AH.call(null!==(a=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==a?a:this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,a){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=a}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ne=w.litHtmlPolyfillSupport;null==ne||ne(X,J),(null!==(A=w.litHtmlVersions)&&void 0!==A?A:w.litHtmlVersions=[]).push("2.7.4");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var re,oe;class le extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const a=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=a.firstChild),a}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,a)=>{var i,s;const n=null!==(i=null==a?void 0:a.renderBefore)&&void 0!==i?i:t;let r=n._$litPart$;if(void 0===r){const e=null!==(s=null==a?void 0:a.renderBefore)&&void 0!==s?s:null;n._$litPart$=r=new J(t.insertBefore(C(),e),e,void 0,null!=a?a:{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return F}}le.finalized=!0,le._$litElement$=!0,null===(re=globalThis.litElementHydrateSupport)||void 0===re||re.call(globalThis,{LitElement:le});const he=globalThis.litElementPolyfillSupport;null==he||he({LitElement:le}),(null!==(oe=globalThis.litElementVersions)&&void 0!==oe?oe:globalThis.litElementVersions=[]).push("3.3.2");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ue=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:a,elements:i}=t;return{kind:a,elements:i,finisher(t){customElements.define(e,t)}}})(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,ce=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(a){a.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(a){a.createProperty(t.key,e)}},pe=(e,t,a)=>{t.constructor.createProperty(a,e)};function de(e){return(t,a)=>void 0!==a?pe(e,t,a):ce(e,t)
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
function ge(e,t){return(({finisher:e,descriptor:t})=>(a,i)=>{var s;if(void 0===i){const i=null!==(s=a.originalKey)&&void 0!==s?s:a.key,n=null!=t?{kind:"method",placement:"prototype",key:i,descriptor:t(a.key)}:{...a,key:i};return null!=e&&(n.finisher=function(t){e(t,i)}),n}{const s=a.constructor;void 0!==t&&Object.defineProperty(a,i,t(i)),null==e||e(s,i)}})({descriptor:a=>{const i={get(){var t,a;return null!==(a=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector(e))&&void 0!==a?a:null},enumerable:!0,configurable:!0};if(t){const t="symbol"==typeof a?Symbol():"__"+a;i.get=function(){var a,i;return void 0===this[t]&&(this[t]=null!==(i=null===(a=this.renderRoot)||void 0===a?void 0:a.querySelector(e))&&void 0!==i?i:null),this[t]}}return i}})}
/**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var me,fe,be;null===(me=window.HTMLSlotElement)||void 0===me||me.prototype.assignedElements,function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(fe||(fe={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(be||(be={}));var ve=function(e,t,a,i){i=i||{},a=null==a?{}:a;var s=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return s.detail=a,e.dispatchEvent(s),s};const ye=async()=>{if(customElements.get("ha-checkbox")&&customElements.get("ha-slider"))return;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");e.hass={panels:[{url_path:"tmp",component_name:"config"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config");const t=document.createElement("ha-panel-config");await t.routerOptions.routes.automation.load()},$e="smart_irrigation",Ee="minutes",_e="hours",Ae="days",we="imperial",He="metric",Se="Dewpoint",Te="Evapotranspiration",Oe="Humidity",Be="Maximum Temperature",Me="Minimum Temperature",Pe="Precipitation",Ce="Pressure",xe="Solar Radiation",Le="Temperature",Ie="Windspeed",Ne="owm",ke="sensor",Re="static",ze="none",je="source",Ue="sensorentity",De="static_value",Ge="unit",Fe="aggregate",Ve=["average","first","last","maximum","median","minimum","sum"],Ze="size",We="throughput",Ke="duration",Xe="bucket",Ye=e=>e.callWS({type:$e+"/config"}),qe=e=>e.callWS({type:$e+"/zones"}),Je=e=>e.callWS({type:$e+"/modules"}),Qe=e=>e.callWS({type:$e+"/mappings"}),et=e=>{class t extends e{connectedCallback(){super.connectedCallback(),this.__checkSubscribed()}disconnectedCallback(){if(super.disconnectedCallback(),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then((e=>e())):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return[]}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}}return s([de({attribute:!1})],t.prototype,"hass",void 0),t};var tt,at,it,st={actions:{delete:"Delete"},labels:{module:"Module",no:"No",select:"Select",yes:"Yes"}},nt={general:{cards:{"automatic-duration-calculation":{header:"Automatic duration calculation",labels:{"auto-calc-enabled":"Automatically calculate zone durations","auto-calc-time":"Calculate at"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Warning: weatherdata update time on or after calculation time"},header:"Automatic weather data update",labels:{"auto-update-enabled":"Automatically update weather data","auto-update-first-update":"(First) Update at","auto-update-interval":"Update sensor data every"},options:{days:"days",hours:"hours",minutes:"minutes"}}},description:"This page provides global settings.",title:"General"},help:{title:"Help",cards:{"how-to-get-help":{title:"How to get help","first-read-the":"First, read the",wiki:"Wiki","if-you-still-need-help":"If you still need help reach out on the","community-forum":"Community forum","or-open-a":"or open a","github-issue":"Github Issue","english-only":"English only"}}},mappings:{cards:{"add-mapping":{actions:{add:"Add sensor group"},header:"Add sensor groups"},mapping:{aggregates:{average:"Average",first:"First",last:"Last",maximum:"Maximum",median:"Median",minimum:"Minimum",sum:"Sum"},errors:{"cannot-delete-mapping-because-zones-use-it":"You cannot delete this sensor group because there is at least one zone using it."},items:{dewpoint:"Dewpoint",evapotranspiration:"Evapotranspiration",humidity:"Humidity","maximum temperature":"Maximum temperature","minimum temperature":"Minimum temperature",precipitation:"Total precipitation",pressure:"Pressure","solar radiation":"Solar radiation",temperature:"Temperature",windspeed:"Wind speed"},"sensor-aggregate-of-sensor-values-to-calculate":"of sensor values to calculate duration","sensor-aggregate-use-the":"Use the","sensor-entity":"Sensor entity",static_value:"Value","input-units":"Input provides values in",source:"Source",sources:{none:"None",openweathermap:"OpenWeatherMap",sensor:"Sensor",static:"Static value"}}},description:"Add one or more sensor groups that retrieve weather data from OpenWeatherMap, from sensors or a combination of these. You can map each sensor group to one or more zones",labels:{"mapping-name":"Name"},no_items:"There are no sensor group defined yet.",title:"Sensor Groups"},modules:{cards:{"add-module":{actions:{add:"Add module"},header:"Add module"},module:{errors:{"cannot-delete-module-because-zones-use-it":"You cannot delete this module because there is at least one zone using it."},labels:{configuration:"Configuration",required:"indicates a required field"},"translated-options":{DontEstimate:"Do not estimate",EstimateFromSunHours:"Estimate from sun hours",EstimateFromTemp:"Estimate from temperature"}}},description:"Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",no_items:"There are no modules defined yet.",title:"Modules"},zones:{actions:{add:"Add",calculate:"Calculate",information:"Information",update:"Update","reset-bucket":"Reset bucket"},cards:{"add-zone":{actions:{add:"Add zone"},header:"Add zone"},"zone-actions":{actions:{"calculate-all":"Calculate all zones","update-all":"Update all zones","reset-all-buckets":"Reset all buckets"},header:"Actions on all zones"}},description:"Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",labels:{bucket:"Bucket",duration:"Duration","lead-time":"Lead time",mapping:"Sensor Group","maximum-duration":"Maximum duration",multiplier:"Multiplier",name:"Name",size:"Size",state:"State",states:{automatic:"Automatic",disabled:"Disabled",manual:"Manual"},throughput:"Throughput","maximum-bucket":"Maximum bucket"},no_items:"There are no zones defined yet.",title:"Zones"}},rt="Smart Irrigation",ot={common:st,panels:nt,title:rt},lt=Object.freeze({__proto__:null,common:st,panels:nt,title:rt,default:ot}),ht={actions:{delete:"Verwijderen"},labels:{module:"Module",no:"Nee",select:"Kies",yes:"Ja"}},ut={general:{cards:{"automatic-duration-calculation":{header:"Automatische berekening van irrigatietijd",labels:{"auto-calc-enabled":"Automatisch irrigatietijd berekening voor elke zone","auto-calc-time":"Berekenen op"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Let op: het automatisch bijwerken van weer gegevens vind plaats op of na de automatische berekening van irrigatietijd"},header:"Automatisch bijwerken van weer gegevens",labels:{"auto-update-enabled":"Automatisch weergegevens bijwerken","auto-update-first-update":"(Eerste keer) Bijwerken op ","auto-update-interval":"Sensor data bijwerken elke"},options:{days:"dagen",hours:"uren",minutes:"minuten"}}},description:"Dit zijn de algemene instellingen.",title:"Algemeen"},help:{title:"Hulp",cards:{"how-to-get-help":{title:"Hulp vragen","first-read-the":"Allereerst, lees de",wiki:"Wiki","if-you-still-need-help":"Als je hierna nog steeds hulp nodig hebt, laat een bericht achter op het","community-forum":"Community forum","or-open-a":"of open een","github-issue":"Github Issue","english-only":"alleen Engels"}}},mappings:{cards:{"add-mapping":{actions:{add:"Toevoegen"},header:"Voeg sensorgroep toe"},mapping:{aggregates:{average:"Gemiddelde",first:"Eerste",last:"Laatste",maximum:"Maximum",median:"Mediaan",minimum:"Minimum",sum:"Totaal"},errors:{"cannot-delete-mapping-because-zones-use-it":"Deze sensorgroep kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."},items:{dewpoint:"Dauwpunt",evapotranspiration:"Verdamping",humidity:"Vochtigheid","maximum temperature":"Maximum temperatuur","minimum temperature":"Minimum temperatuur",precipitation:"Totale neerslag",pressure:"Druk","solar radiation":"Zonnestraling",temperature:"Temperatuur",windspeed:"Wind snelheid"},"sensor-aggregate-of-sensor-values-to-calculate":"van de sensor waardes om irrigatietijd te berekenen","sensor-aggregate-use-the":"Gebruik de/het","sensor-entity":"Sensor entiteit","input-units":"Invoer geeft waardes in",static_value:"Waarde",source:"Bron",sources:{none:"Geen",openweathermap:"OpenWeatherMap",sensor:"Sensor",static:"Vaste waarde"}}},description:"Voeg een of meer sensorgroepen toe die weergegevens ophalen van OpenWeatherMap, van sensoren of een combinatie. Elke sensorgroep kan worden gebruikt voor een of meerdere zones",labels:{"mapping-name":"Name"},no_items:"Er zijn nog geen sensorgroepen.",title:"Sensorgroepen"},modules:{cards:{"add-module":{actions:{add:"Toevoegen"},header:"Voeg module toe"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Deze module kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."},labels:{configuration:"Instellingen",required:"verplicht veld"},"translated-options":{DontEstimate:"Niet berekenen",EstimateFromSunHours:"Gebaseerd op zon uren",EstimateFromTemp:"Gebaseerd op temperatuur"}}},description:"Voeg een of meerdere modules toe. Modules berekenen irrigatietijd. Elke module heeft zijn eigen configuratie and kan worden gebruikt voor het berekening van irrigatietijd voor een of meerdere zones.",no_items:"Er zijn nog geen modules.",title:"Modules"},zones:{actions:{add:"Toevoegen",calculate:"Bereken",information:"Informatie",update:"Bijwerken","reset-bucket":"Leeg voorraad"},cards:{"add-zone":{actions:{add:"Toevoegen"},header:"Voeg zone toe"},"zone-actions":{actions:{"calculate-all":"Bereken alle zones","update-all":"Werk alle zone data bij","reset-all-buckets":"Leeg alle voorraden"},header:"Acties voor alle zones"}},description:"Voeg een of meerdere zones toe. Per zone wordt de irrigatietijd berekend, afhankelijk van de afmeting, doorvoer, status, module en sensorgroep.",labels:{bucket:"Voorraad",duration:"Irrigatieduur","lead-time":"Aanlooptijd",mapping:"Sensorgroep","maximum-duration":"Maximale duur",multiplier:"Vermenigvuldiger",name:"Naam",size:"Afmeting",state:"Status",states:{automatic:"Automatisch",disabled:"Uit",manual:"Manueel"},throughput:"Doorvoer","maximum-bucket":"Maximale voorraad"},no_items:"Er zijn nog geen zones.",title:"Zones"}},ct="Smart Irrigation",pt={common:ht,panels:ut,title:ct},dt=Object.freeze({__proto__:null,common:ht,panels:ut,title:ct,default:pt}),gt={actions:{delete:"Lösche"},labels:{module:"Modul",no:"Nein",select:"Wähle",yes:"Ja"}},mt={general:{cards:{"automatic-duration-calculation":{header:"Automatische Berechnung der Bewässerungsdauer",labels:{"auto-calc-enabled":"Automatische Berechnung der Dauer pro Zone","auto-calc-time":"Berechne um"}},"automatic-update":{errors:{"warning-update-time-on-or-after-calc-time":"Hinweis: Die automatische Aktualisierung der Wetterdaten erfolgt bei oder nach der automatischen Berechnung der Bewässerungsdauer"},header:"Automatische Aktualisierung der Wetterdaten",labels:{"auto-update-enabled":"Automatisches Update der Wetterdaten","auto-update-first-update":"(Erster) Update um","auto-update-interval":"Update der Sensordaten alle"},options:{days:"Tage",hours:"Stunden",minutes:"Minuten"}}},description:"Diese Seite ist für allgemeine Einstellungen.",title:"Allgemein"},help:{title:"Hilfe"},mappings:{cards:{"add-mapping":{actions:{add:"Hinzufügen"},header:"Sensorgruppe hinzufügen"},mapping:{aggregates:{average:"Durchschnitt",first:"Erster",last:"Letzter",maximum:"Maximum",median:"Median",minimum:"Minimum",sum:"Summe"},errors:{"cannot-delete-mapping-because-zones-use-it":"Diese Sensorgruppe kann nicht entfernt werden, da sie von mindestens einer Zone verwendet wird."},items:{dewpoint:"Taupunkt",evapotranspiration:"Verdunstung",humidity:"Feuchtigkeit","maximum temperature":"Maximum-Temperatur","minimum temperature":"Minimum-Temperatur",precipitation:"Gesamtniederschlag",pressure:"Luftdruck","solar radiation":"Sonnenstrahlung",temperature:"Temperatur",windspeed:"Windgeschwindikeit"},"sensor-aggregate-of-sensor-values-to-calculate":"des Sensors für die Berechnung.","sensor-aggregate-use-the":"Nutze den/die/das","sensor-entity":"Sensor Entität","input-units":"Sensor Werte in",source:"Quelle",sources:{none:"Kein",openweathermap:"OpenWeatherMap",sensor:"Sensor"}}},description:"Füge eine oder mehrere Sensorgruppen hinzu, die Wetterdaten von OpenWeatherMap, Sensoren oder einer Kombination daraus abrufen. Jede Sensorgruppe kann für eine oder mehrere Zonen verwendet werden",labels:{"mapping-name":"Name"},no_items:"Es ist noch keine Sensorgruppe angelegt.",title:"Sensorgruppen"},modules:{cards:{"add-module":{actions:{add:"Hinzufügen"},header:"Modul hinzufügen"},module:{errors:{"cannot-delete-module-because-zones-use-it":"Dieses Modul kann nicht entfernt werden, da es von mindestens einer Zone verwendet wird."},labels:{configuration:"Konfiguration",required:"Feld ist erforderlich"},"translated-options":{DontEstimate:"Nicht berechnen",EstimateFromSunHours:"Basierend auf den Sonnenstunden",EstimateFromTemp:"Basierend auf der Temperatur"}}},description:"Füge ein oder mehrere Module hinzu. Module berechnen die Bewässerungsdauer. Jedes Modul hat seine eigene Konfiguration und kann zur Berechnung der Bewässerungsdauer für eine oder mehrere Zonen verwendet werden.",no_items:"Es ist noch kein Module angelegt.",title:"Module"},zones:{actions:{add:"Hinzufügen",calculate:"Bewässerungsdauer berechnen.",information:"Information",update:"Wetterdaten aktualisieren."},cards:{"add-zone":{actions:{add:"Hinzufügen"},header:"Zone hinzufügen"},"zone-actions":{actions:{"calculate-all":"Alle Zonen berechnen","update-all":"Alle Zonen aktualisieren"},header:"Aktionen für alle Zonen"}},description:"Füge eine oder mehrere Zonen hinzu. Die Bewässerungsdauer wird pro Zone, abhängig von Größe, Durchsatz, Status, Modul und Sensorgruppe berechnet.",labels:{bucket:"Vorrat",duration:"Dauer","lead-time":"Anlaufzeit",mapping:"Sensorgruppe","maximum-duration":"Maximale Dauer",multiplier:"Multiplikator",name:"Name",size:"Größe",state:"Berechnung",states:{automatic:"Automatisch",disabled:"Aus",manual:"Manuell"},throughput:"Durchfluss"},no_items:"Es ist noch keine Zone vorhanden.",title:"Zonen"}},ft="Smart Irrigation",bt={common:gt,panels:mt,title:ft},vt=Object.freeze({__proto__:null,common:gt,panels:mt,title:ft,default:bt});function yt(e){return e.type===at.literal}function $t(e){return e.type===at.argument}function Et(e){return e.type===at.number}function _t(e){return e.type===at.date}function At(e){return e.type===at.time}function wt(e){return e.type===at.select}function Ht(e){return e.type===at.plural}function St(e){return e.type===at.pound}function Tt(e){return e.type===at.tag}function Ot(e){return!(!e||"object"!=typeof e||e.type!==it.number)}function Bt(e){return!(!e||"object"!=typeof e||e.type!==it.dateTime)}!function(e){e[e.EXPECT_ARGUMENT_CLOSING_BRACE=1]="EXPECT_ARGUMENT_CLOSING_BRACE",e[e.EMPTY_ARGUMENT=2]="EMPTY_ARGUMENT",e[e.MALFORMED_ARGUMENT=3]="MALFORMED_ARGUMENT",e[e.EXPECT_ARGUMENT_TYPE=4]="EXPECT_ARGUMENT_TYPE",e[e.INVALID_ARGUMENT_TYPE=5]="INVALID_ARGUMENT_TYPE",e[e.EXPECT_ARGUMENT_STYLE=6]="EXPECT_ARGUMENT_STYLE",e[e.INVALID_NUMBER_SKELETON=7]="INVALID_NUMBER_SKELETON",e[e.INVALID_DATE_TIME_SKELETON=8]="INVALID_DATE_TIME_SKELETON",e[e.EXPECT_NUMBER_SKELETON=9]="EXPECT_NUMBER_SKELETON",e[e.EXPECT_DATE_TIME_SKELETON=10]="EXPECT_DATE_TIME_SKELETON",e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE=11]="UNCLOSED_QUOTE_IN_ARGUMENT_STYLE",e[e.EXPECT_SELECT_ARGUMENT_OPTIONS=12]="EXPECT_SELECT_ARGUMENT_OPTIONS",e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE=13]="EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE=14]="INVALID_PLURAL_ARGUMENT_OFFSET_VALUE",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR=15]="EXPECT_SELECT_ARGUMENT_SELECTOR",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR=16]="EXPECT_PLURAL_ARGUMENT_SELECTOR",e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT=17]="EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT",e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT=18]="EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT",e[e.INVALID_PLURAL_ARGUMENT_SELECTOR=19]="INVALID_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR=20]="DUPLICATE_PLURAL_ARGUMENT_SELECTOR",e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR=21]="DUPLICATE_SELECT_ARGUMENT_SELECTOR",e[e.MISSING_OTHER_CLAUSE=22]="MISSING_OTHER_CLAUSE",e[e.INVALID_TAG=23]="INVALID_TAG",e[e.INVALID_TAG_NAME=25]="INVALID_TAG_NAME",e[e.UNMATCHED_CLOSING_TAG=26]="UNMATCHED_CLOSING_TAG",e[e.UNCLOSED_TAG=27]="UNCLOSED_TAG"}(tt||(tt={})),function(e){e[e.literal=0]="literal",e[e.argument=1]="argument",e[e.number=2]="number",e[e.date=3]="date",e[e.time=4]="time",e[e.select=5]="select",e[e.plural=6]="plural",e[e.pound=7]="pound",e[e.tag=8]="tag"}(at||(at={})),function(e){e[e.number=0]="number",e[e.dateTime=1]="dateTime"}(it||(it={}));var Mt=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,Pt=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;function Ct(e){var t={};return e.replace(Pt,(function(e){var a=e.length;switch(e[0]){case"G":t.era=4===a?"long":5===a?"narrow":"short";break;case"y":t.year=2===a?"2-digit":"numeric";break;case"Y":case"u":case"U":case"r":throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");case"q":case"Q":throw new RangeError("`q/Q` (quarter) patterns are not supported");case"M":case"L":t.month=["numeric","2-digit","short","long","narrow"][a-1];break;case"w":case"W":throw new RangeError("`w/W` (week) patterns are not supported");case"d":t.day=["numeric","2-digit"][a-1];break;case"D":case"F":case"g":throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");case"E":t.weekday=4===a?"short":5===a?"narrow":"short";break;case"e":if(a<4)throw new RangeError("`e..eee` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][a-4];break;case"c":if(a<4)throw new RangeError("`c..ccc` (weekday) patterns are not supported");t.weekday=["short","long","narrow","short"][a-4];break;case"a":t.hour12=!0;break;case"b":case"B":throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");case"h":t.hourCycle="h12",t.hour=["numeric","2-digit"][a-1];break;case"H":t.hourCycle="h23",t.hour=["numeric","2-digit"][a-1];break;case"K":t.hourCycle="h11",t.hour=["numeric","2-digit"][a-1];break;case"k":t.hourCycle="h24",t.hour=["numeric","2-digit"][a-1];break;case"j":case"J":case"C":throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");case"m":t.minute=["numeric","2-digit"][a-1];break;case"s":t.second=["numeric","2-digit"][a-1];break;case"S":case"A":throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");case"z":t.timeZoneName=a<4?"short":"long";break;case"Z":case"O":case"v":case"V":case"X":case"x":throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead")}return""})),t}var xt=/[\t-\r \x85\u200E\u200F\u2028\u2029]/i;var Lt=/^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,It=/^(@+)?(\+|#+)?[rs]?$/g,Nt=/(\*)(0+)|(#+)(0+)|(0+)/g,kt=/^(0+)$/;function Rt(e){var t={};return"r"===e[e.length-1]?t.roundingPriority="morePrecision":"s"===e[e.length-1]&&(t.roundingPriority="lessPrecision"),e.replace(It,(function(e,a,i){return"string"!=typeof i?(t.minimumSignificantDigits=a.length,t.maximumSignificantDigits=a.length):"+"===i?t.minimumSignificantDigits=a.length:"#"===a[0]?t.maximumSignificantDigits=a.length:(t.minimumSignificantDigits=a.length,t.maximumSignificantDigits=a.length+("string"==typeof i?i.length:0)),""})),t}function zt(e){switch(e){case"sign-auto":return{signDisplay:"auto"};case"sign-accounting":case"()":return{currencySign:"accounting"};case"sign-always":case"+!":return{signDisplay:"always"};case"sign-accounting-always":case"()!":return{signDisplay:"always",currencySign:"accounting"};case"sign-except-zero":case"+?":return{signDisplay:"exceptZero"};case"sign-accounting-except-zero":case"()?":return{signDisplay:"exceptZero",currencySign:"accounting"};case"sign-never":case"+_":return{signDisplay:"never"}}}function jt(e){var t;if("E"===e[0]&&"E"===e[1]?(t={notation:"engineering"},e=e.slice(2)):"E"===e[0]&&(t={notation:"scientific"},e=e.slice(1)),t){var a=e.slice(0,2);if("+!"===a?(t.signDisplay="always",e=e.slice(2)):"+?"===a&&(t.signDisplay="exceptZero",e=e.slice(2)),!kt.test(e))throw new Error("Malformed concise eng/scientific notation");t.minimumIntegerDigits=e.length}return t}function Ut(e){var t=zt(e);return t||{}}function Dt(e){for(var t={},a=0,s=e;a<s.length;a++){var n=s[a];switch(n.stem){case"percent":case"%":t.style="percent";continue;case"%x100":t.style="percent",t.scale=100;continue;case"currency":t.style="currency",t.currency=n.options[0];continue;case"group-off":case",_":t.useGrouping=!1;continue;case"precision-integer":case".":t.maximumFractionDigits=0;continue;case"measure-unit":case"unit":t.style="unit",t.unit=n.options[0].replace(/^(.*?)-/,"");continue;case"compact-short":case"K":t.notation="compact",t.compactDisplay="short";continue;case"compact-long":case"KK":t.notation="compact",t.compactDisplay="long";continue;case"scientific":t=i(i(i({},t),{notation:"scientific"}),n.options.reduce((function(e,t){return i(i({},e),Ut(t))}),{}));continue;case"engineering":t=i(i(i({},t),{notation:"engineering"}),n.options.reduce((function(e,t){return i(i({},e),Ut(t))}),{}));continue;case"notation-simple":t.notation="standard";continue;case"unit-width-narrow":t.currencyDisplay="narrowSymbol",t.unitDisplay="narrow";continue;case"unit-width-short":t.currencyDisplay="code",t.unitDisplay="short";continue;case"unit-width-full-name":t.currencyDisplay="name",t.unitDisplay="long";continue;case"unit-width-iso-code":t.currencyDisplay="symbol";continue;case"scale":t.scale=parseFloat(n.options[0]);continue;case"integer-width":if(n.options.length>1)throw new RangeError("integer-width stems only accept a single optional option");n.options[0].replace(Nt,(function(e,a,i,s,n,r){if(a)t.minimumIntegerDigits=i.length;else{if(s&&n)throw new Error("We currently do not support maximum integer digits");if(r)throw new Error("We currently do not support exact integer digits")}return""}));continue}if(kt.test(n.stem))t.minimumIntegerDigits=n.stem.length;else if(Lt.test(n.stem)){if(n.options.length>1)throw new RangeError("Fraction-precision stems only accept a single optional option");n.stem.replace(Lt,(function(e,a,i,s,n,r){return"*"===i?t.minimumFractionDigits=a.length:s&&"#"===s[0]?t.maximumFractionDigits=s.length:n&&r?(t.minimumFractionDigits=n.length,t.maximumFractionDigits=n.length+r.length):(t.minimumFractionDigits=a.length,t.maximumFractionDigits=a.length),""}));var r=n.options[0];"w"===r?t=i(i({},t),{trailingZeroDisplay:"stripIfInteger"}):r&&(t=i(i({},t),Rt(r)))}else if(It.test(n.stem))t=i(i({},t),Rt(n.stem));else{var o=zt(n.stem);o&&(t=i(i({},t),o));var l=jt(n.stem);l&&(t=i(i({},t),l))}}return t}var Gt,Ft={AX:["H"],BQ:["H"],CP:["H"],CZ:["H"],DK:["H"],FI:["H"],ID:["H"],IS:["H"],ML:["H"],NE:["H"],RU:["H"],SE:["H"],SJ:["H"],SK:["H"],AS:["h","H"],BT:["h","H"],DJ:["h","H"],ER:["h","H"],GH:["h","H"],IN:["h","H"],LS:["h","H"],PG:["h","H"],PW:["h","H"],SO:["h","H"],TO:["h","H"],VU:["h","H"],WS:["h","H"],"001":["H","h"],AL:["h","H","hB"],TD:["h","H","hB"],"ca-ES":["H","h","hB"],CF:["H","h","hB"],CM:["H","h","hB"],"fr-CA":["H","h","hB"],"gl-ES":["H","h","hB"],"it-CH":["H","h","hB"],"it-IT":["H","h","hB"],LU:["H","h","hB"],NP:["H","h","hB"],PF:["H","h","hB"],SC:["H","h","hB"],SM:["H","h","hB"],SN:["H","h","hB"],TF:["H","h","hB"],VA:["H","h","hB"],CY:["h","H","hb","hB"],GR:["h","H","hb","hB"],CO:["h","H","hB","hb"],DO:["h","H","hB","hb"],KP:["h","H","hB","hb"],KR:["h","H","hB","hb"],NA:["h","H","hB","hb"],PA:["h","H","hB","hb"],PR:["h","H","hB","hb"],VE:["h","H","hB","hb"],AC:["H","h","hb","hB"],AI:["H","h","hb","hB"],BW:["H","h","hb","hB"],BZ:["H","h","hb","hB"],CC:["H","h","hb","hB"],CK:["H","h","hb","hB"],CX:["H","h","hb","hB"],DG:["H","h","hb","hB"],FK:["H","h","hb","hB"],GB:["H","h","hb","hB"],GG:["H","h","hb","hB"],GI:["H","h","hb","hB"],IE:["H","h","hb","hB"],IM:["H","h","hb","hB"],IO:["H","h","hb","hB"],JE:["H","h","hb","hB"],LT:["H","h","hb","hB"],MK:["H","h","hb","hB"],MN:["H","h","hb","hB"],MS:["H","h","hb","hB"],NF:["H","h","hb","hB"],NG:["H","h","hb","hB"],NR:["H","h","hb","hB"],NU:["H","h","hb","hB"],PN:["H","h","hb","hB"],SH:["H","h","hb","hB"],SX:["H","h","hb","hB"],TA:["H","h","hb","hB"],ZA:["H","h","hb","hB"],"af-ZA":["H","h","hB","hb"],AR:["H","h","hB","hb"],CL:["H","h","hB","hb"],CR:["H","h","hB","hb"],CU:["H","h","hB","hb"],EA:["H","h","hB","hb"],"es-BO":["H","h","hB","hb"],"es-BR":["H","h","hB","hb"],"es-EC":["H","h","hB","hb"],"es-ES":["H","h","hB","hb"],"es-GQ":["H","h","hB","hb"],"es-PE":["H","h","hB","hb"],GT:["H","h","hB","hb"],HN:["H","h","hB","hb"],IC:["H","h","hB","hb"],KG:["H","h","hB","hb"],KM:["H","h","hB","hb"],LK:["H","h","hB","hb"],MA:["H","h","hB","hb"],MX:["H","h","hB","hb"],NI:["H","h","hB","hb"],PY:["H","h","hB","hb"],SV:["H","h","hB","hb"],UY:["H","h","hB","hb"],JP:["H","h","K"],AD:["H","hB"],AM:["H","hB"],AO:["H","hB"],AT:["H","hB"],AW:["H","hB"],BE:["H","hB"],BF:["H","hB"],BJ:["H","hB"],BL:["H","hB"],BR:["H","hB"],CG:["H","hB"],CI:["H","hB"],CV:["H","hB"],DE:["H","hB"],EE:["H","hB"],FR:["H","hB"],GA:["H","hB"],GF:["H","hB"],GN:["H","hB"],GP:["H","hB"],GW:["H","hB"],HR:["H","hB"],IL:["H","hB"],IT:["H","hB"],KZ:["H","hB"],MC:["H","hB"],MD:["H","hB"],MF:["H","hB"],MQ:["H","hB"],MZ:["H","hB"],NC:["H","hB"],NL:["H","hB"],PM:["H","hB"],PT:["H","hB"],RE:["H","hB"],RO:["H","hB"],SI:["H","hB"],SR:["H","hB"],ST:["H","hB"],TG:["H","hB"],TR:["H","hB"],WF:["H","hB"],YT:["H","hB"],BD:["h","hB","H"],PK:["h","hB","H"],AZ:["H","hB","h"],BA:["H","hB","h"],BG:["H","hB","h"],CH:["H","hB","h"],GE:["H","hB","h"],LI:["H","hB","h"],ME:["H","hB","h"],RS:["H","hB","h"],UA:["H","hB","h"],UZ:["H","hB","h"],XK:["H","hB","h"],AG:["h","hb","H","hB"],AU:["h","hb","H","hB"],BB:["h","hb","H","hB"],BM:["h","hb","H","hB"],BS:["h","hb","H","hB"],CA:["h","hb","H","hB"],DM:["h","hb","H","hB"],"en-001":["h","hb","H","hB"],FJ:["h","hb","H","hB"],FM:["h","hb","H","hB"],GD:["h","hb","H","hB"],GM:["h","hb","H","hB"],GU:["h","hb","H","hB"],GY:["h","hb","H","hB"],JM:["h","hb","H","hB"],KI:["h","hb","H","hB"],KN:["h","hb","H","hB"],KY:["h","hb","H","hB"],LC:["h","hb","H","hB"],LR:["h","hb","H","hB"],MH:["h","hb","H","hB"],MP:["h","hb","H","hB"],MW:["h","hb","H","hB"],NZ:["h","hb","H","hB"],SB:["h","hb","H","hB"],SG:["h","hb","H","hB"],SL:["h","hb","H","hB"],SS:["h","hb","H","hB"],SZ:["h","hb","H","hB"],TC:["h","hb","H","hB"],TT:["h","hb","H","hB"],UM:["h","hb","H","hB"],US:["h","hb","H","hB"],VC:["h","hb","H","hB"],VG:["h","hb","H","hB"],VI:["h","hb","H","hB"],ZM:["h","hb","H","hB"],BO:["H","hB","h","hb"],EC:["H","hB","h","hb"],ES:["H","hB","h","hb"],GQ:["H","hB","h","hb"],PE:["H","hB","h","hb"],AE:["h","hB","hb","H"],"ar-001":["h","hB","hb","H"],BH:["h","hB","hb","H"],DZ:["h","hB","hb","H"],EG:["h","hB","hb","H"],EH:["h","hB","hb","H"],HK:["h","hB","hb","H"],IQ:["h","hB","hb","H"],JO:["h","hB","hb","H"],KW:["h","hB","hb","H"],LB:["h","hB","hb","H"],LY:["h","hB","hb","H"],MO:["h","hB","hb","H"],MR:["h","hB","hb","H"],OM:["h","hB","hb","H"],PH:["h","hB","hb","H"],PS:["h","hB","hb","H"],QA:["h","hB","hb","H"],SA:["h","hB","hb","H"],SD:["h","hB","hb","H"],SY:["h","hB","hb","H"],TN:["h","hB","hb","H"],YE:["h","hB","hb","H"],AF:["H","hb","hB","h"],LA:["H","hb","hB","h"],CN:["H","hB","hb","h"],LV:["H","hB","hb","h"],TL:["H","hB","hb","h"],"zu-ZA":["H","hB","hb","h"],CD:["hB","H"],IR:["hB","H"],"hi-IN":["hB","h","H"],"kn-IN":["hB","h","H"],"ml-IN":["hB","h","H"],"te-IN":["hB","h","H"],KH:["hB","h","H","hb"],"ta-IN":["hB","h","hb","H"],BN:["hb","hB","h","H"],MY:["hb","hB","h","H"],ET:["hB","hb","h","H"],"gu-IN":["hB","hb","h","H"],"mr-IN":["hB","hb","h","H"],"pa-IN":["hB","hb","h","H"],TW:["hB","hb","h","H"],KE:["hB","hb","H","h"],MM:["hB","hb","H","h"],TZ:["hB","hb","H","h"],UG:["hB","hb","H","h"]};function Vt(e){var t=e.hourCycle;if(void 0===t&&e.hourCycles&&e.hourCycles.length&&(t=e.hourCycles[0]),t)switch(t){case"h24":return"k";case"h23":return"H";case"h12":return"h";case"h11":return"K";default:throw new Error("Invalid hourCycle")}var a,i=e.language;return"root"!==i&&(a=e.maximize().region),(Ft[a||""]||Ft[i||""]||Ft["".concat(i,"-001")]||Ft["001"])[0]}var Zt=new RegExp("^".concat(Mt.source,"*")),Wt=new RegExp("".concat(Mt.source,"*$"));function Kt(e,t){return{start:e,end:t}}var Xt=!!String.prototype.startsWith,Yt=!!String.fromCodePoint,qt=!!Object.fromEntries,Jt=!!String.prototype.codePointAt,Qt=!!String.prototype.trimStart,ea=!!String.prototype.trimEnd,ta=!!Number.isSafeInteger?Number.isSafeInteger:function(e){return"number"==typeof e&&isFinite(e)&&Math.floor(e)===e&&Math.abs(e)<=9007199254740991},aa=!0;try{aa="a"===(null===(Gt=ua("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu").exec("a"))||void 0===Gt?void 0:Gt[0])}catch(k){aa=!1}var ia,sa=Xt?function(e,t,a){return e.startsWith(t,a)}:function(e,t,a){return e.slice(a,a+t.length)===t},na=Yt?String.fromCodePoint:function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var a,i="",s=e.length,n=0;s>n;){if((a=e[n++])>1114111)throw RangeError(a+" is not a valid code point");i+=a<65536?String.fromCharCode(a):String.fromCharCode(55296+((a-=65536)>>10),a%1024+56320)}return i},ra=qt?Object.fromEntries:function(e){for(var t={},a=0,i=e;a<i.length;a++){var s=i[a],n=s[0],r=s[1];t[n]=r}return t},oa=Jt?function(e,t){return e.codePointAt(t)}:function(e,t){var a=e.length;if(!(t<0||t>=a)){var i,s=e.charCodeAt(t);return s<55296||s>56319||t+1===a||(i=e.charCodeAt(t+1))<56320||i>57343?s:i-56320+(s-55296<<10)+65536}},la=Qt?function(e){return e.trimStart()}:function(e){return e.replace(Zt,"")},ha=ea?function(e){return e.trimEnd()}:function(e){return e.replace(Wt,"")};function ua(e,t){return new RegExp(e,t)}if(aa){var ca=ua("([^\\p{White_Space}\\p{Pattern_Syntax}]*)","yu");ia=function(e,t){var a;return ca.lastIndex=t,null!==(a=ca.exec(e)[1])&&void 0!==a?a:""}}else ia=function(e,t){for(var a=[];;){var i=oa(e,t);if(void 0===i||ma(i)||fa(i))break;a.push(i),t+=i>=65536?2:1}return na.apply(void 0,a)};var pa=function(){function e(e,t){void 0===t&&(t={}),this.message=e,this.position={offset:0,line:1,column:1},this.ignoreTag=!!t.ignoreTag,this.locale=t.locale,this.requiresOtherClause=!!t.requiresOtherClause,this.shouldParseSkeletons=!!t.shouldParseSkeletons}return e.prototype.parse=function(){if(0!==this.offset())throw Error("parser can only be used once");return this.parseMessage(0,"",!1)},e.prototype.parseMessage=function(e,t,a){for(var i=[];!this.isEOF();){var s=this.char();if(123===s){if((n=this.parseArgument(e,a)).err)return n;i.push(n.val)}else{if(125===s&&e>0)break;if(35!==s||"plural"!==t&&"selectordinal"!==t){if(60===s&&!this.ignoreTag&&47===this.peek()){if(a)break;return this.error(tt.UNMATCHED_CLOSING_TAG,Kt(this.clonePosition(),this.clonePosition()))}if(60===s&&!this.ignoreTag&&da(this.peek()||0)){if((n=this.parseTag(e,t)).err)return n;i.push(n.val)}else{var n;if((n=this.parseLiteral(e,t)).err)return n;i.push(n.val)}}else{var r=this.clonePosition();this.bump(),i.push({type:at.pound,location:Kt(r,this.clonePosition())})}}}return{val:i,err:null}},e.prototype.parseTag=function(e,t){var a=this.clonePosition();this.bump();var i=this.parseTagName();if(this.bumpSpace(),this.bumpIf("/>"))return{val:{type:at.literal,value:"<".concat(i,"/>"),location:Kt(a,this.clonePosition())},err:null};if(this.bumpIf(">")){var s=this.parseMessage(e+1,t,!0);if(s.err)return s;var n=s.val,r=this.clonePosition();if(this.bumpIf("</")){if(this.isEOF()||!da(this.char()))return this.error(tt.INVALID_TAG,Kt(r,this.clonePosition()));var o=this.clonePosition();return i!==this.parseTagName()?this.error(tt.UNMATCHED_CLOSING_TAG,Kt(o,this.clonePosition())):(this.bumpSpace(),this.bumpIf(">")?{val:{type:at.tag,value:i,children:n,location:Kt(a,this.clonePosition())},err:null}:this.error(tt.INVALID_TAG,Kt(r,this.clonePosition())))}return this.error(tt.UNCLOSED_TAG,Kt(a,this.clonePosition()))}return this.error(tt.INVALID_TAG,Kt(a,this.clonePosition()))},e.prototype.parseTagName=function(){var e=this.offset();for(this.bump();!this.isEOF()&&ga(this.char());)this.bump();return this.message.slice(e,this.offset())},e.prototype.parseLiteral=function(e,t){for(var a=this.clonePosition(),i="";;){var s=this.tryParseQuote(t);if(s)i+=s;else{var n=this.tryParseUnquoted(e,t);if(n)i+=n;else{var r=this.tryParseLeftAngleBracket();if(!r)break;i+=r}}}var o=Kt(a,this.clonePosition());return{val:{type:at.literal,value:i,location:o},err:null}},e.prototype.tryParseLeftAngleBracket=function(){return this.isEOF()||60!==this.char()||!this.ignoreTag&&(da(e=this.peek()||0)||47===e)?null:(this.bump(),"<");var e},e.prototype.tryParseQuote=function(e){if(this.isEOF()||39!==this.char())return null;switch(this.peek()){case 39:return this.bump(),this.bump(),"'";case 123:case 60:case 62:case 125:break;case 35:if("plural"===e||"selectordinal"===e)break;return null;default:return null}this.bump();var t=[this.char()];for(this.bump();!this.isEOF();){var a=this.char();if(39===a){if(39!==this.peek()){this.bump();break}t.push(39),this.bump()}else t.push(a);this.bump()}return na.apply(void 0,t)},e.prototype.tryParseUnquoted=function(e,t){if(this.isEOF())return null;var a=this.char();return 60===a||123===a||35===a&&("plural"===t||"selectordinal"===t)||125===a&&e>0?null:(this.bump(),na(a))},e.prototype.parseArgument=function(e,t){var a=this.clonePosition();if(this.bump(),this.bumpSpace(),this.isEOF())return this.error(tt.EXPECT_ARGUMENT_CLOSING_BRACE,Kt(a,this.clonePosition()));if(125===this.char())return this.bump(),this.error(tt.EMPTY_ARGUMENT,Kt(a,this.clonePosition()));var i=this.parseIdentifierIfPossible().value;if(!i)return this.error(tt.MALFORMED_ARGUMENT,Kt(a,this.clonePosition()));if(this.bumpSpace(),this.isEOF())return this.error(tt.EXPECT_ARGUMENT_CLOSING_BRACE,Kt(a,this.clonePosition()));switch(this.char()){case 125:return this.bump(),{val:{type:at.argument,value:i,location:Kt(a,this.clonePosition())},err:null};case 44:return this.bump(),this.bumpSpace(),this.isEOF()?this.error(tt.EXPECT_ARGUMENT_CLOSING_BRACE,Kt(a,this.clonePosition())):this.parseArgumentOptions(e,t,i,a);default:return this.error(tt.MALFORMED_ARGUMENT,Kt(a,this.clonePosition()))}},e.prototype.parseIdentifierIfPossible=function(){var e=this.clonePosition(),t=this.offset(),a=ia(this.message,t),i=t+a.length;return this.bumpTo(i),{value:a,location:Kt(e,this.clonePosition())}},e.prototype.parseArgumentOptions=function(e,t,a,s){var n,r=this.clonePosition(),o=this.parseIdentifierIfPossible().value,l=this.clonePosition();switch(o){case"":return this.error(tt.EXPECT_ARGUMENT_TYPE,Kt(r,l));case"number":case"date":case"time":this.bumpSpace();var h=null;if(this.bumpIf(",")){this.bumpSpace();var u=this.clonePosition();if((v=this.parseSimpleArgStyleIfPossible()).err)return v;if(0===(g=ha(v.val)).length)return this.error(tt.EXPECT_ARGUMENT_STYLE,Kt(this.clonePosition(),this.clonePosition()));h={style:g,styleLocation:Kt(u,this.clonePosition())}}if((y=this.tryParseArgumentClose(s)).err)return y;var c=Kt(s,this.clonePosition());if(h&&sa(null==h?void 0:h.style,"::",0)){var p=la(h.style.slice(2));if("number"===o)return(v=this.parseNumberSkeletonFromString(p,h.styleLocation)).err?v:{val:{type:at.number,value:a,location:c,style:v.val},err:null};if(0===p.length)return this.error(tt.EXPECT_DATE_TIME_SKELETON,c);var d=p;this.locale&&(d=function(e,t){for(var a="",i=0;i<e.length;i++){var s=e.charAt(i);if("j"===s){for(var n=0;i+1<e.length&&e.charAt(i+1)===s;)n++,i++;var r=1+(1&n),o=n<2?1:3+(n>>1),l=Vt(t);for("H"!=l&&"k"!=l||(o=0);o-- >0;)a+="a";for(;r-- >0;)a=l+a}else a+="J"===s?"H":s}return a}(p,this.locale));var g={type:it.dateTime,pattern:d,location:h.styleLocation,parsedOptions:this.shouldParseSkeletons?Ct(d):{}};return{val:{type:"date"===o?at.date:at.time,value:a,location:c,style:g},err:null}}return{val:{type:"number"===o?at.number:"date"===o?at.date:at.time,value:a,location:c,style:null!==(n=null==h?void 0:h.style)&&void 0!==n?n:null},err:null};case"plural":case"selectordinal":case"select":var m=this.clonePosition();if(this.bumpSpace(),!this.bumpIf(","))return this.error(tt.EXPECT_SELECT_ARGUMENT_OPTIONS,Kt(m,i({},m)));this.bumpSpace();var f=this.parseIdentifierIfPossible(),b=0;if("select"!==o&&"offset"===f.value){if(!this.bumpIf(":"))return this.error(tt.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,Kt(this.clonePosition(),this.clonePosition()));var v;if(this.bumpSpace(),(v=this.tryParseDecimalInteger(tt.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,tt.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE)).err)return v;this.bumpSpace(),f=this.parseIdentifierIfPossible(),b=v.val}var y,$=this.tryParsePluralOrSelectOptions(e,o,t,f);if($.err)return $;if((y=this.tryParseArgumentClose(s)).err)return y;var E=Kt(s,this.clonePosition());return"select"===o?{val:{type:at.select,value:a,options:ra($.val),location:E},err:null}:{val:{type:at.plural,value:a,options:ra($.val),offset:b,pluralType:"plural"===o?"cardinal":"ordinal",location:E},err:null};default:return this.error(tt.INVALID_ARGUMENT_TYPE,Kt(r,l))}},e.prototype.tryParseArgumentClose=function(e){return this.isEOF()||125!==this.char()?this.error(tt.EXPECT_ARGUMENT_CLOSING_BRACE,Kt(e,this.clonePosition())):(this.bump(),{val:!0,err:null})},e.prototype.parseSimpleArgStyleIfPossible=function(){for(var e=0,t=this.clonePosition();!this.isEOF();){switch(this.char()){case 39:this.bump();var a=this.clonePosition();if(!this.bumpUntil("'"))return this.error(tt.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,Kt(a,this.clonePosition()));this.bump();break;case 123:e+=1,this.bump();break;case 125:if(!(e>0))return{val:this.message.slice(t.offset,this.offset()),err:null};e-=1;break;default:this.bump()}}return{val:this.message.slice(t.offset,this.offset()),err:null}},e.prototype.parseNumberSkeletonFromString=function(e,t){var a=[];try{a=function(e){if(0===e.length)throw new Error("Number skeleton cannot be empty");for(var t=e.split(xt).filter((function(e){return e.length>0})),a=[],i=0,s=t;i<s.length;i++){var n=s[i].split("/");if(0===n.length)throw new Error("Invalid number skeleton");for(var r=n[0],o=n.slice(1),l=0,h=o;l<h.length;l++)if(0===h[l].length)throw new Error("Invalid number skeleton");a.push({stem:r,options:o})}return a}(e)}catch(e){return this.error(tt.INVALID_NUMBER_SKELETON,t)}return{val:{type:it.number,tokens:a,location:t,parsedOptions:this.shouldParseSkeletons?Dt(a):{}},err:null}},e.prototype.tryParsePluralOrSelectOptions=function(e,t,a,i){for(var s,n=!1,r=[],o=new Set,l=i.value,h=i.location;;){if(0===l.length){var u=this.clonePosition();if("select"===t||!this.bumpIf("="))break;var c=this.tryParseDecimalInteger(tt.EXPECT_PLURAL_ARGUMENT_SELECTOR,tt.INVALID_PLURAL_ARGUMENT_SELECTOR);if(c.err)return c;h=Kt(u,this.clonePosition()),l=this.message.slice(u.offset,this.offset())}if(o.has(l))return this.error("select"===t?tt.DUPLICATE_SELECT_ARGUMENT_SELECTOR:tt.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,h);"other"===l&&(n=!0),this.bumpSpace();var p=this.clonePosition();if(!this.bumpIf("{"))return this.error("select"===t?tt.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT:tt.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,Kt(this.clonePosition(),this.clonePosition()));var d=this.parseMessage(e+1,t,a);if(d.err)return d;var g=this.tryParseArgumentClose(p);if(g.err)return g;r.push([l,{value:d.val,location:Kt(p,this.clonePosition())}]),o.add(l),this.bumpSpace(),l=(s=this.parseIdentifierIfPossible()).value,h=s.location}return 0===r.length?this.error("select"===t?tt.EXPECT_SELECT_ARGUMENT_SELECTOR:tt.EXPECT_PLURAL_ARGUMENT_SELECTOR,Kt(this.clonePosition(),this.clonePosition())):this.requiresOtherClause&&!n?this.error(tt.MISSING_OTHER_CLAUSE,Kt(this.clonePosition(),this.clonePosition())):{val:r,err:null}},e.prototype.tryParseDecimalInteger=function(e,t){var a=1,i=this.clonePosition();this.bumpIf("+")||this.bumpIf("-")&&(a=-1);for(var s=!1,n=0;!this.isEOF();){var r=this.char();if(!(r>=48&&r<=57))break;s=!0,n=10*n+(r-48),this.bump()}var o=Kt(i,this.clonePosition());return s?ta(n*=a)?{val:n,err:null}:this.error(t,o):this.error(e,o)},e.prototype.offset=function(){return this.position.offset},e.prototype.isEOF=function(){return this.offset()===this.message.length},e.prototype.clonePosition=function(){return{offset:this.position.offset,line:this.position.line,column:this.position.column}},e.prototype.char=function(){var e=this.position.offset;if(e>=this.message.length)throw Error("out of bound");var t=oa(this.message,e);if(void 0===t)throw Error("Offset ".concat(e," is at invalid UTF-16 code unit boundary"));return t},e.prototype.error=function(e,t){return{val:null,err:{kind:e,message:this.message,location:t}}},e.prototype.bump=function(){if(!this.isEOF()){var e=this.char();10===e?(this.position.line+=1,this.position.column=1,this.position.offset+=1):(this.position.column+=1,this.position.offset+=e<65536?1:2)}},e.prototype.bumpIf=function(e){if(sa(this.message,e,this.offset())){for(var t=0;t<e.length;t++)this.bump();return!0}return!1},e.prototype.bumpUntil=function(e){var t=this.offset(),a=this.message.indexOf(e,t);return a>=0?(this.bumpTo(a),!0):(this.bumpTo(this.message.length),!1)},e.prototype.bumpTo=function(e){if(this.offset()>e)throw Error("targetOffset ".concat(e," must be greater than or equal to the current offset ").concat(this.offset()));for(e=Math.min(e,this.message.length);;){var t=this.offset();if(t===e)break;if(t>e)throw Error("targetOffset ".concat(e," is at invalid UTF-16 code unit boundary"));if(this.bump(),this.isEOF())break}},e.prototype.bumpSpace=function(){for(;!this.isEOF()&&ma(this.char());)this.bump()},e.prototype.peek=function(){if(this.isEOF())return null;var e=this.char(),t=this.offset(),a=this.message.charCodeAt(t+(e>=65536?2:1));return null!=a?a:null},e}();function da(e){return e>=97&&e<=122||e>=65&&e<=90}function ga(e){return 45===e||46===e||e>=48&&e<=57||95===e||e>=97&&e<=122||e>=65&&e<=90||183==e||e>=192&&e<=214||e>=216&&e<=246||e>=248&&e<=893||e>=895&&e<=8191||e>=8204&&e<=8205||e>=8255&&e<=8256||e>=8304&&e<=8591||e>=11264&&e<=12271||e>=12289&&e<=55295||e>=63744&&e<=64975||e>=65008&&e<=65533||e>=65536&&e<=983039}function ma(e){return e>=9&&e<=13||32===e||133===e||e>=8206&&e<=8207||8232===e||8233===e}function fa(e){return e>=33&&e<=35||36===e||e>=37&&e<=39||40===e||41===e||42===e||43===e||44===e||45===e||e>=46&&e<=47||e>=58&&e<=59||e>=60&&e<=62||e>=63&&e<=64||91===e||92===e||93===e||94===e||96===e||123===e||124===e||125===e||126===e||161===e||e>=162&&e<=165||166===e||167===e||169===e||171===e||172===e||174===e||176===e||177===e||182===e||187===e||191===e||215===e||247===e||e>=8208&&e<=8213||e>=8214&&e<=8215||8216===e||8217===e||8218===e||e>=8219&&e<=8220||8221===e||8222===e||8223===e||e>=8224&&e<=8231||e>=8240&&e<=8248||8249===e||8250===e||e>=8251&&e<=8254||e>=8257&&e<=8259||8260===e||8261===e||8262===e||e>=8263&&e<=8273||8274===e||8275===e||e>=8277&&e<=8286||e>=8592&&e<=8596||e>=8597&&e<=8601||e>=8602&&e<=8603||e>=8604&&e<=8607||8608===e||e>=8609&&e<=8610||8611===e||e>=8612&&e<=8613||8614===e||e>=8615&&e<=8621||8622===e||e>=8623&&e<=8653||e>=8654&&e<=8655||e>=8656&&e<=8657||8658===e||8659===e||8660===e||e>=8661&&e<=8691||e>=8692&&e<=8959||e>=8960&&e<=8967||8968===e||8969===e||8970===e||8971===e||e>=8972&&e<=8991||e>=8992&&e<=8993||e>=8994&&e<=9e3||9001===e||9002===e||e>=9003&&e<=9083||9084===e||e>=9085&&e<=9114||e>=9115&&e<=9139||e>=9140&&e<=9179||e>=9180&&e<=9185||e>=9186&&e<=9254||e>=9255&&e<=9279||e>=9280&&e<=9290||e>=9291&&e<=9311||e>=9472&&e<=9654||9655===e||e>=9656&&e<=9664||9665===e||e>=9666&&e<=9719||e>=9720&&e<=9727||e>=9728&&e<=9838||9839===e||e>=9840&&e<=10087||10088===e||10089===e||10090===e||10091===e||10092===e||10093===e||10094===e||10095===e||10096===e||10097===e||10098===e||10099===e||10100===e||10101===e||e>=10132&&e<=10175||e>=10176&&e<=10180||10181===e||10182===e||e>=10183&&e<=10213||10214===e||10215===e||10216===e||10217===e||10218===e||10219===e||10220===e||10221===e||10222===e||10223===e||e>=10224&&e<=10239||e>=10240&&e<=10495||e>=10496&&e<=10626||10627===e||10628===e||10629===e||10630===e||10631===e||10632===e||10633===e||10634===e||10635===e||10636===e||10637===e||10638===e||10639===e||10640===e||10641===e||10642===e||10643===e||10644===e||10645===e||10646===e||10647===e||10648===e||e>=10649&&e<=10711||10712===e||10713===e||10714===e||10715===e||e>=10716&&e<=10747||10748===e||10749===e||e>=10750&&e<=11007||e>=11008&&e<=11055||e>=11056&&e<=11076||e>=11077&&e<=11078||e>=11079&&e<=11084||e>=11085&&e<=11123||e>=11124&&e<=11125||e>=11126&&e<=11157||11158===e||e>=11159&&e<=11263||e>=11776&&e<=11777||11778===e||11779===e||11780===e||11781===e||e>=11782&&e<=11784||11785===e||11786===e||11787===e||11788===e||11789===e||e>=11790&&e<=11798||11799===e||e>=11800&&e<=11801||11802===e||11803===e||11804===e||11805===e||e>=11806&&e<=11807||11808===e||11809===e||11810===e||11811===e||11812===e||11813===e||11814===e||11815===e||11816===e||11817===e||e>=11818&&e<=11822||11823===e||e>=11824&&e<=11833||e>=11834&&e<=11835||e>=11836&&e<=11839||11840===e||11841===e||11842===e||e>=11843&&e<=11855||e>=11856&&e<=11857||11858===e||e>=11859&&e<=11903||e>=12289&&e<=12291||12296===e||12297===e||12298===e||12299===e||12300===e||12301===e||12302===e||12303===e||12304===e||12305===e||e>=12306&&e<=12307||12308===e||12309===e||12310===e||12311===e||12312===e||12313===e||12314===e||12315===e||12316===e||12317===e||e>=12318&&e<=12319||12320===e||12336===e||64830===e||64831===e||e>=65093&&e<=65094}function ba(e){e.forEach((function(e){if(delete e.location,wt(e)||Ht(e))for(var t in e.options)delete e.options[t].location,ba(e.options[t].value);else Et(e)&&Ot(e.style)||(_t(e)||At(e))&&Bt(e.style)?delete e.style.location:Tt(e)&&ba(e.children)}))}function va(e,t){void 0===t&&(t={}),t=i({shouldParseSkeletons:!0,requiresOtherClause:!0},t);var a=new pa(e,t).parse();if(a.err){var s=SyntaxError(tt[a.err.kind]);throw s.location=a.err.location,s.originalMessage=a.err.message,s}return(null==t?void 0:t.captureLocation)||ba(a.val),a.val}function ya(e,t){var a=t&&t.cache?t.cache:Ta,i=t&&t.serializer?t.serializer:wa;return(t&&t.strategy?t.strategy:Aa)(e,{cache:a,serializer:i})}function $a(e,t,a,i){var s,n=null==(s=i)||"number"==typeof s||"boolean"==typeof s?i:a(i),r=t.get(n);return void 0===r&&(r=e.call(this,i),t.set(n,r)),r}function Ea(e,t,a){var i=Array.prototype.slice.call(arguments,3),s=a(i),n=t.get(s);return void 0===n&&(n=e.apply(this,i),t.set(s,n)),n}function _a(e,t,a,i,s){return a.bind(t,e,i,s)}function Aa(e,t){return _a(e,this,1===e.length?$a:Ea,t.cache.create(),t.serializer)}var wa=function(){return JSON.stringify(arguments)};function Ha(){this.cache=Object.create(null)}Ha.prototype.get=function(e){return this.cache[e]},Ha.prototype.set=function(e,t){this.cache[e]=t};var Sa,Ta={create:function(){return new Ha}},Oa={variadic:function(e,t){return _a(e,this,Ea,t.cache.create(),t.serializer)},monadic:function(e,t){return _a(e,this,$a,t.cache.create(),t.serializer)}};!function(e){e.MISSING_VALUE="MISSING_VALUE",e.INVALID_VALUE="INVALID_VALUE",e.MISSING_INTL_API="MISSING_INTL_API"}(Sa||(Sa={}));var Ba,Ma=function(e){function t(t,a,i){var s=e.call(this,t)||this;return s.code=a,s.originalMessage=i,s}return a(t,e),t.prototype.toString=function(){return"[formatjs Error: ".concat(this.code,"] ").concat(this.message)},t}(Error),Pa=function(e){function t(t,a,i,s){return e.call(this,'Invalid values for "'.concat(t,'": "').concat(a,'". Options are "').concat(Object.keys(i).join('", "'),'"'),Sa.INVALID_VALUE,s)||this}return a(t,e),t}(Ma),Ca=function(e){function t(t,a,i){return e.call(this,'Value for "'.concat(t,'" must be of type ').concat(a),Sa.INVALID_VALUE,i)||this}return a(t,e),t}(Ma),xa=function(e){function t(t,a){return e.call(this,'The intl string context variable "'.concat(t,'" was not provided to the string "').concat(a,'"'),Sa.MISSING_VALUE,a)||this}return a(t,e),t}(Ma);function La(e){return"function"==typeof e}function Ia(e,t,a,i,s,n,r){if(1===e.length&&yt(e[0]))return[{type:Ba.literal,value:e[0].value}];for(var o=[],l=0,h=e;l<h.length;l++){var u=h[l];if(yt(u))o.push({type:Ba.literal,value:u.value});else if(St(u))"number"==typeof n&&o.push({type:Ba.literal,value:a.getNumberFormat(t).format(n)});else{var c=u.value;if(!s||!(c in s))throw new xa(c,r);var p=s[c];if($t(u))p&&"string"!=typeof p&&"number"!=typeof p||(p="string"==typeof p||"number"==typeof p?String(p):""),o.push({type:"string"==typeof p?Ba.literal:Ba.object,value:p});else if(_t(u)){var d="string"==typeof u.style?i.date[u.style]:Bt(u.style)?u.style.parsedOptions:void 0;o.push({type:Ba.literal,value:a.getDateTimeFormat(t,d).format(p)})}else if(At(u)){d="string"==typeof u.style?i.time[u.style]:Bt(u.style)?u.style.parsedOptions:i.time.medium;o.push({type:Ba.literal,value:a.getDateTimeFormat(t,d).format(p)})}else if(Et(u)){(d="string"==typeof u.style?i.number[u.style]:Ot(u.style)?u.style.parsedOptions:void 0)&&d.scale&&(p*=d.scale||1),o.push({type:Ba.literal,value:a.getNumberFormat(t,d).format(p)})}else{if(Tt(u)){var g=u.children,m=u.value,f=s[m];if(!La(f))throw new Ca(m,"function",r);var b=f(Ia(g,t,a,i,s,n).map((function(e){return e.value})));Array.isArray(b)||(b=[b]),o.push.apply(o,b.map((function(e){return{type:"string"==typeof e?Ba.literal:Ba.object,value:e}})))}if(wt(u)){if(!(v=u.options[p]||u.options.other))throw new Pa(u.value,p,Object.keys(u.options),r);o.push.apply(o,Ia(v.value,t,a,i,s))}else if(Ht(u)){var v;if(!(v=u.options["=".concat(p)])){if(!Intl.PluralRules)throw new Ma('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',Sa.MISSING_INTL_API,r);var y=a.getPluralRules(t,{type:u.pluralType}).select(p-(u.offset||0));v=u.options[y]||u.options.other}if(!v)throw new Pa(u.value,p,Object.keys(u.options),r);o.push.apply(o,Ia(v.value,t,a,i,s,p-(u.offset||0)))}else;}}}return function(e){return e.length<2?e:e.reduce((function(e,t){var a=e[e.length-1];return a&&a.type===Ba.literal&&t.type===Ba.literal?a.value+=t.value:e.push(t),e}),[])}(o)}function Na(e,t){return t?Object.keys(e).reduce((function(a,s){var n,r;return a[s]=(n=e[s],(r=t[s])?i(i(i({},n||{}),r||{}),Object.keys(n).reduce((function(e,t){return e[t]=i(i({},n[t]),r[t]||{}),e}),{})):n),a}),i({},e)):e}function ka(e){return{create:function(){return{get:function(t){return e[t]},set:function(t,a){e[t]=a}}}}}!function(e){e[e.literal=0]="literal",e[e.object=1]="object"}(Ba||(Ba={}));var Ra=function(){function e(t,a,i,s){var r,o=this;if(void 0===a&&(a=e.defaultLocale),this.formatterCache={number:{},dateTime:{},pluralRules:{}},this.format=function(e){var t=o.formatToParts(e);if(1===t.length)return t[0].value;var a=t.reduce((function(e,t){return e.length&&t.type===Ba.literal&&"string"==typeof e[e.length-1]?e[e.length-1]+=t.value:e.push(t.value),e}),[]);return a.length<=1?a[0]||"":a},this.formatToParts=function(e){return Ia(o.ast,o.locales,o.formatters,o.formats,e,void 0,o.message)},this.resolvedOptions=function(){return{locale:o.resolvedLocale.toString()}},this.getAst=function(){return o.ast},this.locales=a,this.resolvedLocale=e.resolveLocale(a),"string"==typeof t){if(this.message=t,!e.__parse)throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");this.ast=e.__parse(t,{ignoreTag:null==s?void 0:s.ignoreTag,locale:this.resolvedLocale})}else this.ast=t;if(!Array.isArray(this.ast))throw new TypeError("A message must be provided as a String or AST.");this.formats=Na(e.formats,i),this.formatters=s&&s.formatters||(void 0===(r=this.formatterCache)&&(r={number:{},dateTime:{},pluralRules:{}}),{getNumberFormat:ya((function(){for(var e,t=[],a=0;a<arguments.length;a++)t[a]=arguments[a];return new((e=Intl.NumberFormat).bind.apply(e,n([void 0],t,!1)))}),{cache:ka(r.number),strategy:Oa.variadic}),getDateTimeFormat:ya((function(){for(var e,t=[],a=0;a<arguments.length;a++)t[a]=arguments[a];return new((e=Intl.DateTimeFormat).bind.apply(e,n([void 0],t,!1)))}),{cache:ka(r.dateTime),strategy:Oa.variadic}),getPluralRules:ya((function(){for(var e,t=[],a=0;a<arguments.length;a++)t[a]=arguments[a];return new((e=Intl.PluralRules).bind.apply(e,n([void 0],t,!1)))}),{cache:ka(r.pluralRules),strategy:Oa.variadic})})}return Object.defineProperty(e,"defaultLocale",{get:function(){return e.memoizedDefaultLocale||(e.memoizedDefaultLocale=(new Intl.NumberFormat).resolvedOptions().locale),e.memoizedDefaultLocale},enumerable:!1,configurable:!0}),e.memoizedDefaultLocale=null,e.resolveLocale=function(e){var t=Intl.NumberFormat.supportedLocalesOf(e);return t.length>0?new Intl.Locale(t[0]):new Intl.Locale("string"==typeof e?e:e[0])},e.__parse=va,e.formats={number:{integer:{maximumFractionDigits:0},currency:{style:"currency"},percent:{style:"percent"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},e}(),za=Ra;const ja={de:vt,en:lt,nl:dt};function Ua(e,t,...a){const i=t.replace(/['"]+/g,"");let s;try{s=e.split(".").reduce(((e,t)=>e[t]),ja[i])}catch(t){s=e.split(".").reduce(((e,t)=>e[t]),ja.en)}if(void 0===s&&(s=e.split(".").reduce(((e,t)=>e[t]),ja.en)),!a.length)return s;const n={};for(let e=0;e<a.length;e+=2){let t=a[e];t=t.replace(/^{([^}]+)?}$/,"$1"),n[t]=a[e+1]}try{return new za(s,t).format(n)}catch(e){return"Translation "+e}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const Da=2;class Ga{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,a){this._$Ct=e,this._$AM=t,this._$Ci=a}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class Fa extends Ga{constructor(e){if(super(e),this.et=V,e.type!==Da)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===V||null==e)return this.ft=void 0,this.et=e;if(e===F)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;const t=[e];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Fa.directiveName="unsafeHTML",Fa.resultType=1;const Va=(e=>(...t)=>({_$litDirective$:e,values:t}))(Fa);function Za(e){return"true"===(e=null==e?void 0:e.toString().toLowerCase())||"1"===e}function Wa(e,t){return(e=e.toString()).split(",")[t]}function Ka(e,t){switch(t){case Ze:return e.units==He?G`${Va("m<sup>2</sup>")}`:G`${Va("sq ft")}`;case We:return e.units==He?G`${Va("l/minute")}`:G`${Va("gal/minute")}`;default:return G``}}function Xa(e,t){!function(e,t){const a=e.hasOwnProperty("tagName")?e:e.target;ve(a,"show-dialog",{dialogTag:"error-dialog",dialogImport:()=>Promise.resolve().then((function(){return ni})),dialogParams:{error:t}})}(t,G`
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
  `)}const Ya=c`
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
`;let qa=class extends(et(le)){hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:$e+"_config_updated"})]}async _fetchData(){var e,t;this.hass&&(this.config=await Ye(this.hass),this.data=(e=this.config,t=["calctime","autocalcenabled","autoupdateenabled","autoupdateschedule","autoupdatefirsttime","autoupdateinterval"],e?Object.entries(e).filter((([e])=>t.includes(e))).reduce(((e,[t,a])=>Object.assign(e,{[t]:a})),{}):{}))}firstUpdated(){(async()=>{await ye()})()}render(){if(this.hass&&this.config&&this.data){let e=G` <div class="card-content">
        <label for="autocalcenabled"
          >${Ua("panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",this.hass.language)}:</label
        >
        <input
          type="radio"
          id="autocalcon"
          name="autocalcenabled"
          value="True"
          ?checked="${this.config.autocalcenabled}"
          @change="${e=>{this.saveData({autocalcenabled:Za(e.target.value)})}}"
        /><label for="autocalcon"
          >${Ua("common.labels.yes",this.hass.language)}</label
        >
        <input
          type="radio"
          id="autocalcoff"
          name="autocalcenabled"
          value="False"
          ?checked="${!this.config.autocalcenabled}"
          @change="${e=>{this.saveData({autocalcenabled:Za(e.target.value)})}}"
        /><label for="autocalcoff"
          >${Ua("common.labels.no",this.hass.language)}</label
        >
      </div>`;this.data.autocalcenabled&&(e=G`${e}
          <div class="card-content">
            <label for="calctime"
              >${Ua("panels.general.cards.automatic-duration-calculation.labels.auto-calc-time",this.hass.language)}</label
            >
            <input
              id="calctime"
              type="text"
              class="shortinput"
              .value="${this.config.calctime}"
              @input=${e=>{this.saveData({calctime:e.target.value})}}
            />
          </div>`),e=G`<ha-card header="${Ua("panels.general.cards.automatic-duration-calculation.header",this.hass.language)}" >${e}</div></ha-card>`;let t=G` <div class="card-content">
        <label for="autoupdateenabled"
          >${Ua("panels.general.cards.automatic-update.labels.auto-update-enabled",this.hass.language)}:</label
        >
        <input
          type="radio"
          id="autoupdateon"
          name="autoupdateenabled"
          value="True"
          ?checked="${this.config.autoupdateenabled}"
          @change="${e=>{this.saveData({autoupdateenabled:Za(e.target.value)})}}"
        /><label for="autoupdateon"
          >${Ua("common.labels.yes",this.hass.language)}</label
        >
        <input
          type="radio"
          id="autoupdateoff"
          name="autoupdateenabled"
          value="False"
          ?checked="${!this.config.autoupdateenabled}"
          @change="${e=>{this.saveData({autoupdateenabled:Za(e.target.value)})}}"
        /><label for="autoupdateoff"
          >${Ua("common.labels.no",this.hass.language)}</label
        >
      </div>`;this.data.autoupdateenabled&&(t=G`${t}
          <div class="card-content">
            <label for="autoupdateinterval"
              >${Ua("panels.general.cards.automatic-update.labels.auto-update-interval",this.hass.language)}:</label
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
                value="${Ee}"
                ?selected="${this.data.autoupdateschedule===Ee}"
              >
                ${Ua("panels.general.cards.automatic-update.options.minutes",this.hass.language)}
              </option>
              <option
                value="${_e}"
                ?selected="${this.data.autoupdateschedule===_e}"
              >
                ${Ua("panels.general.cards.automatic-update.options.hours",this.hass.language)}
              </option>
              <option
                value="${Ae}"
                ?selected="${this.data.autoupdateschedule===Ae}"
              >
                ${Ua("panels.general.cards.automatic-update.options.days",this.hass.language)}
              </option>
            </select>
          </div>
          <div class="card-content">
            <label for="updatetime"
              >${Ua("panels.general.cards.automatic-update.labels.auto-update-first-update",this.hass.language)}:</label
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
              ${Ua("panels.general.cards.automatic-update.errors.warning-update-time-on-or-after-calc-time",this.hass.language)}!
            </div>`),t=G`<ha-card header="${Ua("panels.general.cards.automatic-update.header",this.hass.language)}",
      this.hass.language)}">${t}</ha-card>`;return G`<ha-card
          header="${Ua("panels.general.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Ua("panels.general.description",this.hass.language)}
          </div> </ha-card
        >${t}${e}`}return G``}saveData(e){var t,a;this.hass&&this.data&&(this.data=Object.assign(Object.assign({},this.data),e),(t=this.hass,a=this.data,t.callApi("POST",$e+"/config",a)).catch((e=>Xa(e,this.shadowRoot.querySelector("ha-card")))).then())}static get styles(){return c`
      ${Ya}
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
    `}};s([de()],qa.prototype,"narrow",void 0),s([de()],qa.prototype,"path",void 0),s([de()],qa.prototype,"data",void 0),s([de()],qa.prototype,"config",void 0),qa=s([ue("smart-irrigation-view-general")],qa);var Ja,Qa="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z";!function(e){e.Disabled="disabled",e.Manual="manual",e.Automatic="automatic"}(Ja||(Ja={}));let ei=class extends(et(le)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.mappings=[]}firstUpdated(){(async()=>{await ye()})()}hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:$e+"_config_updated"})]}async _fetchData(){this.hass&&(this.config=await Ye(this.hass),this.zones=await qe(this.hass),this.modules=await Je(this.hass),this.mappings=await Qe(this.hass))}handleCalculateAllZones(){this.hass&&this.hass.callApi("POST",$e+"/zones",{calculate_all:!0})}handleUpdateAllZones(){this.hass&&this.hass.callApi("POST",$e+"/zones",{update_all:!0})}handleResetAllBuckets(){this.hass&&this.hass.callApi("POST",$e+"/zones",{reset_all_buckets:!0})}handleAddZone(){const e={id:this.zones.length,name:this.nameInput.value,size:parseFloat(this.sizeInput.value),throughput:parseFloat(this.throughputInput.value),state:Ja.Automatic,duration:0,bucket:0,module:void 0,old_bucket:0,delta:0,explanation:"",multiplier:1,mapping:void 0,lead_time:0,maximum_duration:void 0,maximum_bucket:void 0};this.zones=[...this.zones,e],this.saveToHA(e)}handleEditZone(e,t){this.hass&&(this.zones=Object.values(this.zones).map(((a,i)=>i===e?t:a)),this.saveToHA(t))}handleRemoveZone(e,t){if(!this.hass)return;const a=Object.values(this.zones).at(t);var i,s;a&&(this.zones=this.zones.filter(((e,a)=>a!==t)),this.hass&&(i=this.hass,s=a.id.toString(),i.callApi("POST",$e+"/zones",{id:s,remove:!0})))}handleCalculateZone(e){const t=Object.values(this.zones).at(e);var a,i;t&&(this.hass&&(a=this.hass,i=t.id.toString(),a.callApi("POST",$e+"/zones",{id:i,calculate:!0,override_cache:!0})))}handleUpdateZone(e){const t=Object.values(this.zones).at(e);var a,i;t&&(this.hass&&(a=this.hass,i=t.id.toString(),a.callApi("POST",$e+"/zones",{id:i,update:!0})))}saveToHA(e){var t,a;this.hass&&(t=this.hass,a=e,t.callApi("POST",$e+"/zones",a))}renderTheOptions(e,t){if(this.hass){let a=G`<option value="" ?selected=${void 0===t}">---${Ua("common.labels.select",this.hass.language)}---</option>`;return Object.entries(e).map((([e,i])=>a=G`${a}
            <option
              value="${i.id}"
              ?selected="${t===i.id}"
            >
              ${i.id}: ${i.name}
            </option>`)),a}return G``}renderZone(e,t){if(this.hass){let a,i,s;null!=e.explanation&&e.explanation.length>0&&(a=G`<svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          id="showcalcresults${t}"
          @click="${()=>this.toggleExplanation(t)}"
        >
          <title>
            ${Ua("panels.zones.actions.information",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"}" />
        </svg>`),e.state===Ja.Automatic&&(i=G` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${()=>this.handleCalculateZone(t)}"
        >
          <title>
            ${Ua("panels.zones.actions.calculate",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z"}" />
        </svg>`),e.state===Ja.Automatic&&(s=G` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${()=>this.handleUpdateZone(t)}"
        >
          <title>
            ${Ua("panels.zones.actions.update",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z"}" />
        </svg>`);const n=G` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${()=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Xe]:0}))}"}"
        >
          <title>
            ${Ua("panels.zones.actions.reset-bucket",this.hass.language)}
          </title>
          <path fill="#404040" d="${"M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z"}" />
        </svg>`;return G`
        <ha-card header="${e.name}">
          <div class="card-content">
            <label for="name${t}"
              >${Ua("panels.zones.labels.name",this.hass.language)}:</label
            >
            <input
              id="name${t}"
              type="text"
              .value="${e.name}"
              @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{name:a.target.value}))}"
            />
            <div class="zoneline">
              <label for="size${t}"
                >${Ua("panels.zones.labels.size",this.hass.language)}
                (${Ka(this.config,Ze)}):</label
              >
              <input class="shortinput" id="size${t}" type="number""
              .value="${e.size}"
              @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ze]:parseFloat(a.target.value)}))}"
              />
            </div>
            <div class="zoneline">
              <label for="throughput${t}"
                >${Ua("panels.zones.labels.throughput",this.hass.language)}
                (${Ka(this.config,We)}):</label
              >
              <input
                class="shortinput"
                id="throughput${t}"
                type="number"
                .value="${e.throughput}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[We]:parseFloat(a.target.value)}))}"
              />
            </div>
            <div class="zoneline">
              <label for="state${t}"
                >${Ua("panels.zones.labels.state",this.hass.language)}:</label
              >
              <select
                required
                id="state${t}"
                @change="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{state:a.target.value,[Ke]:0}))}"
              >
                <option
                  value="${Ja.Automatic}"
                  ?selected="${e.state===Ja.Automatic}"
                >
                  ${Ua("panels.zones.labels.states.automatic",this.hass.language)}
                </option>
                <option
                  value="${Ja.Disabled}"
                  ?selected="${e.state===Ja.Disabled}"
                >
                  ${Ua("panels.zones.labels.states.disabled",this.hass.language)}
                </option>
                <option
                  value="${Ja.Manual}"
                  ?selected="${e.state===Ja.Manual}"
                >
                  ${Ua("panels.zones.labels.states.manual",this.hass.language)}
                </option>
              </select>
              <label for="module${t}"
                >${Ua("common.labels.module",this.hass.language)}:</label
              >

              <select
                id="module${t}"
                @change="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{module:parseInt(a.target.value)}))}"
              >
                ${this.renderTheOptions(this.modules,e.module)}
              </select>
              <label for="module${t}"
                >${Ua("panels.zones.labels.mapping",this.hass.language)}:</label
              >

              <select
                id="mapping${t}"
                @change="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{mapping:parseInt(a.target.value)}))}"
              >
                ${this.renderTheOptions(this.mappings,e.mapping)}
              </select>
            </div>
            <div class="zoneline">
              <label for="bucket${t}"
                >${Ua("panels.zones.labels.bucket",this.hass.language)}:</label
              >
              <input
                class="shortinput"
                id="bucket${t}"
                type="number"
                .value="${Number(e.bucket).toFixed(1)}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Xe]:parseFloat(a.target.value)}))}"
              />
              <label for="maximum-bucket${t}"
                >${Ua("panels.zones.labels.maximum-bucket",this.hass.language)}:</label
              >
              <input
                class="shortinput"
                id="maximum-bucket${t}"
                type="number"
                .value="${Number(e.maximum_bucket).toFixed(1)}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{maximum_bucket:parseFloat(a.target.value)}))}"
              />
              <br />
              <label for="lead_time${t}"
                >${Ua("panels.zones.labels.lead-time",this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="lead_time${t}"
                type="number"
                .value="${e.lead_time}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{lead_time:parseInt(a.target.value,10)}))}"
              />
              <label for="maximum-duration${t}"
                >${Ua("panels.zones.labels.maximum-duration",this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="maximum-duration${t}"
                type="number"
                .value="${e.maximum_duration}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{maximum_duration:parseInt(a.target.value,10)}))}"
              />
            </div>
            <div class="zoneline">
              <label for="multiplier${t}"
                >${Ua("panels.zones.labels.multiplier",this.hass.language)}:</label
              >
              <input
                class="shortinput"
                id="multiplier${t}"
                type="number"
                .value="${e.multiplier}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{multiplier:parseFloat(a.target.value)}))}"
              />
              <label for="duration${t}"
                >${Ua("panels.zones.labels.duration",this.hass.language)}
                (${"s"}):</label
              >
              <input
                class="shortinput"
                id="duration${t}"
                type="number"
                .value="${e.duration}"
                ?readonly="${e.state===Ja.Disabled||e.state===Ja.Automatic}"
                @input="${a=>this.handleEditZone(t,Object.assign(Object.assign({},e),{[Ke]:parseInt(a.target.value,10)}))}"
              />
            </div>
            <div class="zoneline">
              ${s} ${i}
              ${a} ${n}
              <svg
                style="width:24px;height:24px"
                viewBox="0 0 24 24"
                id="deleteZone${t}"
                @click="${e=>this.handleRemoveZone(e,t)}"
              >
                <title>
                  ${Ua("common.actions.delete",this.hass.language)}
                </title>
                <path fill="#404040" d="${Qa}" />
              </svg>
            </div>
            <div class="zoneline">
              <div>
                <label class="hidden" id="calcresults${t}"
                  >${Va("<br/>"+e.explanation)}</label
                >
              </div>
            </div>
          </div>
        </ha-card>
      `}return G``}toggleExplanation(e){var t;const a=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("#calcresults"+e);a&&("hidden"!=a.className?a.className="hidden":a.className="explanation")}render(){return this.hass&&this.config?G`
        <ha-card header="${Ua("panels.zones.title",this.hass.language)}">
          <div class="card-content">
            ${Ua("panels.zones.description",this.hass.language)}
          </div>
        </ha-card>
          <ha-card header="${Ua("panels.zones.cards.add-zone.header",this.hass.language)}">
            <div class="card-content">
              <div class="zoneline"><label for="nameInput">${Ua("panels.zones.labels.name",this.hass.language)}:</label>
              <input id="nameInput" type="text"/>
              </div>
              <div class="zoneline">
              <label for="sizeInput">${Ua("panels.zones.labels.size",this.hass.language)} (${Ka(this.config,Ze)}):</label>
              <input class="shortinput" id="sizeInput" type="number"/>
              </div>
              <div class="zoneline">
              <label for="throughputInput">${Ua("panels.zones.labels.throughput",this.hass.language)} (${Ka(this.config,We)}):</label>
              <input id="throughputInput" class="shortinput" type="number"/>
              </div>
              <div class="zoneline">
              <button @click="${this.handleAddZone}">${Ua("panels.zones.cards.add-zone.actions.add",this.hass.language)}</button>
              </div>
            </div>
            </ha-card>
            <ha-card header="${Ua("panels.zones.cards.zone-actions.header",this.hass.language)}">
            <div class="card-content">
                <button @click="${this.handleUpdateAllZones}">${Ua("panels.zones.cards.zone-actions.actions.update-all",this.hass.language)}</button>
                <button @click="${this.handleCalculateAllZones}">${Ua("panels.zones.cards.zone-actions.actions.calculate-all",this.hass.language)}</button>
                <button @click="${this.handleResetAllBuckets}">${Ua("panels.zones.cards.zone-actions.actions.reset-all-buckets",this.hass.language)}</button>
            </div>
          </ha-card>

          ${Object.entries(this.zones).map((([e,t])=>this.renderZone(t,parseInt(e))))}
        </ha-card>
      `:G``}static get styles(){return c`
      ${Ya}
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
    `}};s([de()],ei.prototype,"config",void 0),s([de({type:Array})],ei.prototype,"zones",void 0),s([de({type:Array})],ei.prototype,"modules",void 0),s([de({type:Array})],ei.prototype,"mappings",void 0),s([ge("#nameInput")],ei.prototype,"nameInput",void 0),s([ge("#sizeInput")],ei.prototype,"sizeInput",void 0),s([ge("#throughputInput")],ei.prototype,"throughputInput",void 0),ei=s([ue("smart-irrigation-view-zones")],ei);let ti=class extends(et(le)){constructor(){super(...arguments),this.zones=[],this.modules=[],this.allmodules=[]}firstUpdated(){(async()=>{await ye()})()}hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:$e+"_config_updated"})]}async _fetchData(){var e;this.hass&&(this.config=await Ye(this.hass),this.zones=await qe(this.hass),this.modules=await Je(this.hass),this.allmodules=await(e=this.hass,e.callWS({type:$e+"/allmodules"})))}handleAddModule(){const e=this.allmodules.filter((e=>e.name==this.moduleInput.selectedOptions[0].text))[0];if(!e)return;const t={id:this.modules.length,name:this.moduleInput.selectedOptions[0].text,description:e.description,config:e.config,schema:e.schema};this.modules=[...this.modules,t],this.saveToHA(t),this._fetchData()}handleRemoveModule(e,t){var a,i;(this.modules=this.modules.filter(((e,a)=>a!==t)),this.hass)&&(a=this.hass,i=t.toString(),a.callApi("POST",$e+"/modules",{id:i,remove:!0}))}saveToHA(e){var t,a;this.hass&&(t=this.hass,a=e,t.callApi("POST",$e+"/modules",a))}renderModule(e,t){if(this.hass){const a=this.zones.filter((t=>t.module===e.id)).length;return G`
        <ha-card header="${e.id}: ${e.name}">
          <div class="card-content">
            <div class="moduledescription${t}">${e.description}</div>
            <div class="moduleconfig">
              <label class="subheader"
                >${Ua("panels.modules.cards.module.labels.configuration",this.hass.language)}
                (*
                ${Ua("panels.modules.cards.module.labels.required",this.hass.language)})</label
              >
              ${e.schema?Object.entries(e.schema).map((([e])=>this.renderConfig(t,e))):null}
            </div>
            ${a?G` ${Ua("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",this.hass.language)}.`:G` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${t}"
                  @click="${e=>this.handleRemoveModule(e,t)}"
                >
                  <title>
                    ${Ua("common.actions.delete",this.hass.language)}
                  </title>
                  <path fill="#404040" d="${Qa}" />
                </svg>`}
          </div>
        </ha-card>
      `}return G``}renderConfig(e,t){const a=Object.values(this.modules).at(e);if(!a||!this.hass)return;const i=a.schema[t],s=i.name,n=function(e){if(e)return(e=e.replace("_"," ")).charAt(0).toUpperCase()+e.slice(1)}(s);let r="";null==a.config&&(a.config=[]),s in a.config&&(r=a.config[s]);let o=G`<label for="${s+e}"
      >${n} </label
    `;if("boolean"==i.type)o=G`${o}<input
          type="checkbox"
          id="${s+e}"
          .value="${r}"
          @input="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[s]:t.target.checked})}))}"
        />`;else if("float"==i.type||"integer"==i.type)o=G`${o}<input
          type="number"
          class="shortinput"
          id="${i.name+e}"
          .value="${a.config[i.name]}"
          @input="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[s]:t.target.value})}))}"
        />`;else if("string"==i.type)o=G`${o}<input
          type="text"
          id="${s+e}"
          .value="${r}"
          @input="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[s]:t.target.value})}))}"
        />`;else if("select"==i.type){const t=this.hass.language;o=G`${o}<select
          id="${s+e}"
          @change="${t=>this.handleEditConfig(e,Object.assign(Object.assign({},a),{config:Object.assign(Object.assign({},a.config),{[s]:t.target.value})}))}"
        >

          ${Object.entries(i.options).map((([e,a])=>G`<option
                value="${Wa(a,0)}"
                ?selected="${r===Wa(a,0)}"
              >
                ${Ua("panels.modules.cards.module.translated-options."+Wa(a,1),t)}
              </option>`))}
        </select>`}return i.required&&(o=G`${o} *`),o=G`<div class="schemaline">${o}</div>`,o}handleEditConfig(e,t){this.modules=Object.values(this.modules).map(((a,i)=>i===e?t:a)),this.saveToHA(t)}renderOption(e,t){return this.hass?G`<option value="${e}>${t}</option>`:G``}render(){return this.hass?G`
        <ha-card
          header="${Ua("panels.modules.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Ua("panels.modules.description",this.hass.language)}
          </div>
        </ha-card>
        <ha-card
          header="${Ua("panels.modules.cards.add-module.header",this.hass.language)}"
        >
          <div class="card-content">
            <label for="moduleInput"
              >${Ua("common.labels.module",this.hass.language)}:</label
            >
            <select id="moduleInput">
              ${Object.entries(this.allmodules).map((([e,t])=>G`<option value="${t.id}">${t.name}</option>`))}
            </select>
            <button @click="${this.handleAddModule}">
              ${Ua("panels.modules.cards.add-module.actions.add",this.hass.language)}
            </button>
          </div>
        </ha-card>

        ${Object.entries(this.modules).map((([e,t])=>this.renderModule(t,parseInt(e))))}
      `:G``}static get styles(){return c`
      ${Ya}
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
    `}};s([de()],ti.prototype,"config",void 0),s([de({type:Array})],ti.prototype,"zones",void 0),s([de({type:Array})],ti.prototype,"modules",void 0),s([de({type:Array})],ti.prototype,"allmodules",void 0),s([ge("#moduleInput")],ti.prototype,"moduleInput",void 0),ti=s([ue("smart-irrigation-view-modules")],ti);let ai=class extends(et(le)){constructor(){super(...arguments),this.zones=[],this.mappings=[]}firstUpdated(){(async()=>{await ye()})()}hassSubscribe(){return this._fetchData(),[this.hass.connection.subscribeMessage((()=>this._fetchData()),{type:$e+"_config_updated"})]}async _fetchData(){this.hass&&(this.config=await Ye(this.hass),this.zones=await qe(this.hass),this.mappings=await Qe(this.hass))}handleAddMapping(){const e={[Se]:"",[Te]:"",[Oe]:"",[Be]:"",[Me]:"",[Pe]:"",[Ce]:"",[xe]:"",[Le]:"",[Ie]:""},t={id:this.mappings.length,name:this.mappingNameInput.value,mappings:e};this.mappings=[...this.mappings,t],this.saveToHA(t),this._fetchData()}handleRemoveMapping(e,t){var a,i;(this.mappings=this.mappings.filter(((e,a)=>a!==t)),this.hass)&&(a=this.hass,i=t.toString(),a.callApi("POST",$e+"/mappings",{id:i,remove:!0}))}handleEditMapping(e,t){this.mappings=Object.values(this.mappings).map(((a,i)=>i===e?t:a)),this.saveToHA(t)}saveToHA(e){var t,a;this.hass&&(t=this.hass,a=e,t.callApi("POST",$e+"/mappings",a))}renderMapping(e,t){if(this.hass){const a=this.zones.filter((t=>t.mapping===e.id)).length;return G`
        <ha-card header="${e.id}: ${e.name}">
          <div class="card-content">
            <label for="name${e.id}"
              >${Ua("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @input="${a=>this.handleEditMapping(t,Object.assign(Object.assign({},e),{name:a.target.value}))}"
            />
            ${Object.entries(e.mappings).map((([e])=>this.renderMappingSetting(t,e)))}
            ${a?G`${Ua("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",this.hass.language)}`:G` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${t}"
                  @click="${e=>this.handleRemoveMapping(e,t)}"
                >
                  <title>
                    ${Ua("common.actions.delete",this.hass.language)}
                  </title>
                  <path fill="#404040" d="${Qa}" />
                </svg>`}
          </div>
        </ha-card>
      `}return G``}renderMappingSetting(e,t){var a,i,s;const n=Object.values(this.mappings).at(e);if(!n||!this.hass)return;const r=n.mappings[t];let o=G`<div class="mappingsettingname">
      <label for="${t+e}"
        >${Ua("panels.mappings.cards.mapping.items."+t.toLowerCase(),this.hass.language)}
      </label>
    </div> `;if(o=G`${o}
      <div class="mappingsettingline">
        <label for="${t+e+je}"
          >${Ua("panels.mappings.cards.mapping.source",this.hass.language)}:</label
        >
      </div>`,t==Te||t==xe)o=G`${o}
        <input
          type="radio"
          id="${t+e+ze}"
          value="${ze}"
          name="${t+e+je}"
          ?checked="${r[je]===ze}"
          @change="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{source:a.target.value})})}))}"
        /><label for="${t+e+ze}"
          >${Ua("panels.mappings.cards.mapping.sources.none",this.hass.language)}</label
        > `;else{let l="";(null===(a=this.config)||void 0===a?void 0:a.use_owm)||(l="strikethrough"),o=G`${o}
        <input
          type="radio"
          id="${t+e+Ne}"
          value="${Ne}"
          name="${t+e+je}"
          ?enabled="${null===(i=this.config)||void 0===i?void 0:i.use_owm}"
          ?checked="${(null===(s=this.config)||void 0===s?void 0:s.use_owm)&&r[je]===Ne}"
          @change="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{source:a.target.value})})}))}"
        /><label
          class="${l}"
          for="${t+e+Ne}"
          >${Ua("panels.mappings.cards.mapping.sources.openweathermap",this.hass.language)}</label
        >`}return o=G`${o}
        <input
          type="radio"
          id="${t+e+ke}"
          value="${ke}"
          name="${t+e+je}"
          ?checked="${r[je]===ke}"
          @change="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[je]:a.target.value})})}))}"
        /><label for="${t+e+ke}"
          >${Ua("panels.mappings.cards.mapping.sources.sensor",this.hass.language)}</label
        >
      </div>`,o=G`${o}
      <input
        type="radio"
        id="${t+e+Re}"
        value="${Re}"
        name="${t+e+je}"
        ?checked="${r[je]===Re}"
        @change="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[je]:a.target.value})})}))}"
      /><label for="${t+e+Re}"
        >${Ua("panels.mappings.cards.mapping.sources.static",this.hass.language)}</label
      >
    </div>`,r[je]==ke&&(o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+Ue}"
            >${Ua("panels.mappings.cards.mapping.sensor-entity",this.hass.language)}:</label
          >
          <input
            type="text"
            id="${t+e+Ue}"
            value="${r[Ue]}"
            @input="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[Ue]:a.target.value})})}))}"
          />
        </div>`),r[je]==Re&&(o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+De}"
            >${Ua("panels.mappings.cards.mapping.static_value",this.hass.language)}:</label
          >
          <input
            type="text"
            id="${t+e+De}"
            value="${r[De]}"
            @input="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[De]:a.target.value})})}))}"
          />
        </div>`),r[je]!=ke&&r[je]!=Re||(o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+Ge}"
            >${Ua("panels.mappings.cards.mapping.input-units",this.hass.language)}:</label
          >
          <select
            type="text"
            id="${t+e+Ge}"
            @change="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[Ge]:a.target.value})})}))}"
          >
            ${this.renderUnitOptionsForMapping(t,r)}
          </select>
        </div>`),r[je]==ke&&(o=G`${o}
        <div class="mappingsettingline">
          <label for="${t+e+Fe}"
            >${Ua("panels.mappings.cards.mapping.sensor-aggregate-use-the",this.hass.language)}
          </label>
          <select
            type="text"
            id="${t+e+Fe}"
            @change="${a=>this.handleEditMapping(e,Object.assign(Object.assign({},n),{mappings:Object.assign(Object.assign({},n.mappings),{[t]:Object.assign(Object.assign({},n.mappings[t]),{[Fe]:a.target.value})})}))}"
          >
            ${this.renderAggregateOptionsForMapping(t,r)}
          </select>
          <label for="${t+e+Fe}"
            >${Ua("panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",this.hass.language)}</label
          >
        </div>`),o=G`<div class="mappingline">${o}</div>`,o}renderAggregateOptionsForMapping(e,t){if(this.hass&&this.config){let a=G``,i="average";e===Pe?i="last":e===Be?i="maximum":e===Me&&(i="minimum"),t[Fe]&&(i=t[Fe]);for(const e of Ve){const t=this.renderAggregateOption(e,i);a=G`${a}${t}`}return a}return G``}renderAggregateOption(e,t){if(this.hass&&this.config){return G`<option value="${e}" ?selected="${e===t}">
        ${Ua("panels.mappings.cards.mapping.aggregates."+e,this.hass.language)}
      </option>`}return G``}renderUnitOptionsForMapping(e,t){if(this.hass&&this.config){const a=function(e){switch(e){case Se:case Me:case Be:case Le:return[{unit:"°C",system:He},{unit:"°F",system:we}];case Pe:case Te:return[{unit:"mm",system:He},{unit:"in",system:we}];case Oe:return[{unit:"%",system:[He,we]}];case Ce:return[{unit:"millibar",system:He},{unit:"hPa",system:He},{unit:"psi",system:we},{unit:"inch Hg",system:we}];case Ie:return[{unit:"km/h",system:He},{unit:"meter/s",system:He},{unit:"mile/h",system:we}];case xe:return[{unit:"W/m2",system:He},{unit:"MJ/day/m2",system:He},{unit:"W/sq ft",system:we},{unit:"MJ/day/sq ft",system:we}];default:return[]}}(e);let i=G``,s=t[Ge];const n=this.config.units;return t[Ge]||a.forEach((function(e){"string"==typeof e.system?n==e.system&&(s=e.unit):e.system.forEach((function(t){n==t.system&&(s=e.unit)}))})),a.forEach((function(e){i=G`${i}
          <option value="${e.unit}" ?selected="${s===e.unit}">
            ${e.unit}
          </option>`})),i}return G``}render(){return this.hass?G`
        <ha-card
          header="${Ua("panels.mappings.title",this.hass.language)}"
        >
          <div class="card-content">
            ${Ua("panels.mappings.description",this.hass.language)}.
          </div>
        </ha-card>
        <ha-card
          header="${Ua("panels.mappings.cards.add-mapping.header",this.hass.language)}"
        >
          <div class="card-content">
            <label for="mappingNameInput"
              >${Ua("panels.mappings.labels.mapping-name",this.hass.language)}:</label
            >
            <input id="mappingNameInput" type="text" />
            <button @click="${this.handleAddMapping}">
              ${Ua("panels.mappings.cards.add-mapping.actions.add",this.hass.language)}
            </button>
          </div>
        </ha-card>

        ${Object.entries(this.mappings).map((([e,t])=>this.renderMapping(t,parseInt(e))))}
      `:G``}static get styles(){return c`
      ${Ya}
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
    `}};s([de()],ai.prototype,"config",void 0),s([de({type:Array})],ai.prototype,"zones",void 0),s([de({type:Array})],ai.prototype,"mappings",void 0),s([ge("#mappingNameInput")],ai.prototype,"mappingNameInput",void 0),ai=s([ue("smart-irrigation-view-mappings")],ai);const ii=()=>{const e=e=>{let t={};for(let a=0;a<e.length;a+=2){const i=e[a],s=a<e.length?e[a+1]:void 0;t=Object.assign(Object.assign({},t),{[i]:s})}return t},t=window.location.pathname.split("/");let a={page:t[2]||"general",params:{}};if(t.length>3){let i=t.slice(3);if(t.includes("filter")){const t=i.findIndex((e=>"filter"==e)),s=i.slice(t+1);i=i.slice(0,t),a=Object.assign(Object.assign({},a),{filter:e(s)})}i.length&&(i.length%2&&(a=Object.assign(Object.assign({},a),{subpage:i.shift()})),i.length&&(a=Object.assign(Object.assign({},a),{params:e(i)})))}return a};e.SmartIrrigationPanel=class extends le{async firstUpdated(){window.addEventListener("location-changed",(()=>{window.location.pathname.includes("smart-irrigation")&&this.requestUpdate()})),await ye(),this.requestUpdate()}render(){if(!customElements.get("ha-panel-config"))return G` loading... `;const e=ii();return G`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${Ua("title",this.hass.language)}</div>
          <div class="version">${"v2023.9.0-beta9"}</div>
        </div>

        <ha-tabs
          scrollable
          attr-for-selected="page-name"
          .selected=${e.page}
          @iron-activate=${this.handlePageSelected}
        >
          <paper-tab page-name="general">
            ${Ua("panels.general.title",this.hass.language)}
          </paper-tab>
          <paper-tab page-name="zones">
            ${Ua("panels.zones.title",this.hass.language)}
          </paper-tab>
          <paper-tab page-name="modules"
            >${Ua("panels.modules.title",this.hass.language)}</paper-tab
          >
          <paper-tab page-name="mappings"
            >${Ua("panels.mappings.title",this.hass.language)}</paper-tab
          >
          <paper-tab page-name="help"
            >${Ua("panels.help.title",this.hass.language)}</paper-tab
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
        `;case"help":return G`<ha-card
          header="${Ua("panels.help.cards.how-to-get-help.title",this.hass.language)}"
        >
          <div class="card-content">
          ${Ua("panels.help.cards.how-to-get-help.first-read-the",this.hass.language)} <a href="https://github.com/jeroenterheerdt/HAsmartirrigation/wiki"
              >${Ua("panels.help.cards.how-to-get-help.wiki",this.hass.language)}</a
            >. ${Ua("panels.help.cards.how-to-get-help.if-you-still-need-help",this.hass.language)}
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >${Ua("panels.help.cards.how-to-get-help.community-forum",this.hass.language)}</a
            >
            ${Ua("panels.help.cards.how-to-get-help.or-open-a",this.hass.language)}
            <a
              href="https://github.com/jeroenterheerdt/HAsmartirrigation/issues"
              >${Ua("panels.help.cards.how-to-get-help.github-issue",this.hass.language)}</a
            >
            (${Ua("panels.help.cards.how-to-get-help.english-only",this.hass.language)}).
          </div></ha-card
        >`;default:return G`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `}}handlePageSelected(e){const t=e.detail.item.getAttribute("page-name");t!==ii().page?(!function(e,t,a){void 0===a&&(a=!1),a?history.replaceState(null,"",t):history.pushState(null,"",t),ve(window,"location-changed",{replace:a})}(0,((e,...t)=>{let a={page:e,params:{}};t.forEach((e=>{"string"==typeof e?a=Object.assign(Object.assign({},a),{subpage:e}):"params"in e?a=Object.assign(Object.assign({},a),{params:e.params}):"filter"in e&&(a=Object.assign(Object.assign({},a),{filter:e.filter}))}));const i=e=>{let t=Object.keys(e);t=t.filter((t=>e[t])),t.sort();let a="";return t.forEach((t=>{const i=e[t];a=a.length?`${a}/${t}/${i}`:`${t}/${i}`})),a};let s=`/${$e}/${a.page}`;return a.subpage&&(s=`${s}/${a.subpage}`),i(a.params).length&&(s=`${s}/${i(a.params)}`),a.filter&&(s=`${s}/filter/${i(a.filter)}`),s})(t)),this.requestUpdate()):scrollTo(0,0)}static get styles(){return c`
      ${Ya} :host {
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
    `}},s([de()],e.SmartIrrigationPanel.prototype,"hass",void 0),s([de({type:Boolean,reflect:!0})],e.SmartIrrigationPanel.prototype,"narrow",void 0),e.SmartIrrigationPanel=s([ue("smart-irrigation")],e.SmartIrrigationPanel);let si=class extends le{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params=void 0}render(){return this._params?G`
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
    `}};s([de({attribute:!1})],si.prototype,"hass",void 0),s([function(e){return de({...e,state:!0})}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */()],si.prototype,"_params",void 0),si=s([ue("error-dialog")],si);var ni=Object.freeze({__proto__:null,get ErrorDialog(){return si}});Object.defineProperty(e,"__esModule",{value:!0})}({});
//# sourceMappingURL=smart-irrigation.js.map
