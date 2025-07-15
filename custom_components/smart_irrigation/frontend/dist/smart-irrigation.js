!function (e) {
  "use strict";

  var t = function (e, a) {
    return t = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (e, t) {
      e.__proto__ = t;
    } || function (e, t) {
      for (var a in t) Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
    }, t(e, a);
  };
  function a(e, a) {
    if ("function" != typeof a && null !== a) throw new TypeError("Class extends value " + String(a) + " is not a constructor or null");
    function i() {
      this.constructor = e;
    }
    t(e, a), e.prototype = null === a ? Object.create(a) : (i.prototype = a.prototype, new i());
  }
  var i = function () {
    return i = Object.assign || function (e) {
      for (var t, a = 1, i = arguments.length; a < i; a++) for (var n in t = arguments[a]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
      return e;
    }, i.apply(this, arguments);
  };
  function n(e, t, a, i) {
    var n,
      s = arguments.length,
      r = s < 3 ? t : null === i ? i = Object.getOwnPropertyDescriptor(t, a) : i;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(e, t, a, i);else for (var o = e.length - 1; o >= 0; o--) (n = e[o]) && (r = (s < 3 ? n(r) : s > 3 ? n(t, a, r) : n(t, a)) || r);
    return s > 3 && r && Object.defineProperty(t, a, r), r;
  }
  function s(e, t, a) {
    if (a || 2 === arguments.length) for (var i, n = 0, s = t.length; n < s; n++) !i && n in t || (i || (i = Array.prototype.slice.call(t, 0, n)), i[n] = t[n]);
    return e.concat(i || Array.prototype.slice.call(t));
  }
  "function" == typeof SuppressedError && SuppressedError;
  /**
       * @license
       * Copyright 2019 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  const r = window,
    o = r.ShadowRoot && (void 0 === r.ShadyCSS || r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype,
    l = Symbol(),
    u = new WeakMap();
  class d {
    constructor(e, t, a) {
      if (this._$cssResult$ = !0, a !== l) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = e, this.t = t;
    }
    get styleSheet() {
      let e = this.o;
      const t = this.t;
      if (o && void 0 === e) {
        const a = void 0 !== t && 1 === t.length;
        a && (e = u.get(t)), void 0 === e && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && u.set(t, e));
      }
      return e;
    }
    toString() {
      return this.cssText;
    }
  }
  const c = (e, ...t) => {
      const a = 1 === e.length ? e[0] : t.reduce((t, a, i) => t + (e => {
        if (!0 === e._$cssResult$) return e.cssText;
        if ("number" == typeof e) return e;
        throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
      })(a) + e[i + 1], e[0]);
      return new d(a, e, l);
    },
    h = o ? e => e : e => e instanceof CSSStyleSheet ? (e => {
      let t = "";
      for (const a of e.cssRules) t += a.cssText;
      return (e => new d("string" == typeof e ? e : e + "", void 0, l))(t);
    })(e) : e
    /**
         * @license
         * Copyright 2017 Google LLC
         * SPDX-License-Identifier: BSD-3-Clause
         */;
  var p;
  const m = window,
    g = m.trustedTypes,
    f = g ? g.emptyScript : "",
    v = m.reactiveElementPolyfillSupport,
    b = {
      toAttribute(e, t) {
        switch (t) {
          case Boolean:
            e = e ? f : null;
            break;
          case Object:
          case Array:
            e = null == e ? e : JSON.stringify(e);
        }
        return e;
      },
      fromAttribute(e, t) {
        let a = e;
        switch (t) {
          case Boolean:
            a = null !== e;
            break;
          case Number:
            a = null === e ? null : Number(e);
            break;
          case Object:
          case Array:
            try {
              a = JSON.parse(e);
            } catch (e) {
              a = null;
            }
        }
        return a;
      }
    },
    y = (e, t) => t !== e && (t == t || e == e),
    _ = {
      attribute: !0,
      type: String,
      converter: b,
      reflect: !1,
      hasChanged: y
    },
    w = "finalized";
  class k extends HTMLElement {
    constructor() {
      super(), this._$Ei = new Map(), this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
    }
    static addInitializer(e) {
      var t;
      this.finalize(), (null !== (t = this.h) && void 0 !== t ? t : this.h = []).push(e);
    }
    static get observedAttributes() {
      this.finalize();
      const e = [];
      return this.elementProperties.forEach((t, a) => {
        const i = this._$Ep(a, t);
        void 0 !== i && (this._$Ev.set(i, a), e.push(i));
      }), e;
    }
    static createProperty(e, t = _) {
      if (t.state && (t.attribute = !1), this.finalize(), this.elementProperties.set(e, t), !t.noAccessor && !this.prototype.hasOwnProperty(e)) {
        const a = "symbol" == typeof e ? Symbol() : "__" + e,
          i = this.getPropertyDescriptor(e, a, t);
        void 0 !== i && Object.defineProperty(this.prototype, e, i);
      }
    }
    static getPropertyDescriptor(e, t, a) {
      return {
        get() {
          return this[t];
        },
        set(i) {
          const n = this[e];
          this[t] = i, this.requestUpdate(e, n, a);
        },
        configurable: !0,
        enumerable: !0
      };
    }
    static getPropertyOptions(e) {
      return this.elementProperties.get(e) || _;
    }
    static finalize() {
      if (this.hasOwnProperty(w)) return !1;
      this[w] = !0;
      const e = Object.getPrototypeOf(this);
      if (e.finalize(), void 0 !== e.h && (this.h = [...e.h]), this.elementProperties = new Map(e.elementProperties), this._$Ev = new Map(), this.hasOwnProperty("properties")) {
        const e = this.properties,
          t = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertySymbols(e)];
        for (const a of t) this.createProperty(a, e[a]);
      }
      return this.elementStyles = this.finalizeStyles(this.styles), !0;
    }
    static finalizeStyles(e) {
      const t = [];
      if (Array.isArray(e)) {
        const a = new Set(e.flat(1 / 0).reverse());
        for (const e of a) t.unshift(h(e));
      } else void 0 !== e && t.push(h(e));
      return t;
    }
    static _$Ep(e, t) {
      const a = t.attribute;
      return !1 === a ? void 0 : "string" == typeof a ? a : "string" == typeof e ? e.toLowerCase() : void 0;
    }
    _$Eu() {
      var e;
      this._$E_ = new Promise(e => this.enableUpdating = e), this._$AL = new Map(), this._$Eg(), this.requestUpdate(), null === (e = this.constructor.h) || void 0 === e || e.forEach(e => e(this));
    }
    addController(e) {
      var t, a;
      (null !== (t = this._$ES) && void 0 !== t ? t : this._$ES = []).push(e), void 0 !== this.renderRoot && this.isConnected && (null === (a = e.hostConnected) || void 0 === a || a.call(e));
    }
    removeController(e) {
      var t;
      null === (t = this._$ES) || void 0 === t || t.splice(this._$ES.indexOf(e) >>> 0, 1);
    }
    _$Eg() {
      this.constructor.elementProperties.forEach((e, t) => {
        this.hasOwnProperty(t) && (this._$Ei.set(t, this[t]), delete this[t]);
      });
    }
    createRenderRoot() {
      var e;
      const t = null !== (e = this.shadowRoot) && void 0 !== e ? e : this.attachShadow(this.constructor.shadowRootOptions);
      return ((e, t) => {
        o ? e.adoptedStyleSheets = t.map(e => e instanceof CSSStyleSheet ? e : e.styleSheet) : t.forEach(t => {
          const a = document.createElement("style"),
            i = r.litNonce;
          void 0 !== i && a.setAttribute("nonce", i), a.textContent = t.cssText, e.appendChild(a);
        });
      })(t, this.constructor.elementStyles), t;
    }
    connectedCallback() {
      var e;
      void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (e = this._$ES) || void 0 === e || e.forEach(e => {
        var t;
        return null === (t = e.hostConnected) || void 0 === t ? void 0 : t.call(e);
      });
    }
    enableUpdating(e) {}
    disconnectedCallback() {
      var e;
      null === (e = this._$ES) || void 0 === e || e.forEach(e => {
        var t;
        return null === (t = e.hostDisconnected) || void 0 === t ? void 0 : t.call(e);
      });
    }
    attributeChangedCallback(e, t, a) {
      this._$AK(e, a);
    }
    _$EO(e, t, a = _) {
      var i;
      const n = this.constructor._$Ep(e, a);
      if (void 0 !== n && !0 === a.reflect) {
        const s = (void 0 !== (null === (i = a.converter) || void 0 === i ? void 0 : i.toAttribute) ? a.converter : b).toAttribute(t, a.type);
        this._$El = e, null == s ? this.removeAttribute(n) : this.setAttribute(n, s), this._$El = null;
      }
    }
    _$AK(e, t) {
      var a;
      const i = this.constructor,
        n = i._$Ev.get(e);
      if (void 0 !== n && this._$El !== n) {
        const e = i.getPropertyOptions(n),
          s = "function" == typeof e.converter ? {
            fromAttribute: e.converter
          } : void 0 !== (null === (a = e.converter) || void 0 === a ? void 0 : a.fromAttribute) ? e.converter : b;
        this._$El = n, this[n] = s.fromAttribute(t, e.type), this._$El = null;
      }
    }
    requestUpdate(e, t, a) {
      let i = !0;
      void 0 !== e && (((a = a || this.constructor.getPropertyOptions(e)).hasChanged || y)(this[e], t) ? (this._$AL.has(e) || this._$AL.set(e, t), !0 === a.reflect && this._$El !== e && (void 0 === this._$EC && (this._$EC = new Map()), this._$EC.set(e, a))) : i = !1), !this.isUpdatePending && i && (this._$E_ = this._$Ej());
    }
    async _$Ej() {
      this.isUpdatePending = !0;
      try {
        await this._$E_;
      } catch (e) {
        Promise.reject(e);
      }
      const e = this.scheduleUpdate();
      return null != e && (await e), !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var e;
      if (!this.isUpdatePending) return;
      this.hasUpdated, this._$Ei && (this._$Ei.forEach((e, t) => this[t] = e), this._$Ei = void 0);
      let t = !1;
      const a = this._$AL;
      try {
        t = this.shouldUpdate(a), t ? (this.willUpdate(a), null === (e = this._$ES) || void 0 === e || e.forEach(e => {
          var t;
          return null === (t = e.hostUpdate) || void 0 === t ? void 0 : t.call(e);
        }), this.update(a)) : this._$Ek();
      } catch (e) {
        throw t = !1, this._$Ek(), e;
      }
      t && this._$AE(a);
    }
    willUpdate(e) {}
    _$AE(e) {
      var t;
      null === (t = this._$ES) || void 0 === t || t.forEach(e => {
        var t;
        return null === (t = e.hostUpdated) || void 0 === t ? void 0 : t.call(e);
      }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
    }
    _$Ek() {
      this._$AL = new Map(), this.isUpdatePending = !1;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$E_;
    }
    shouldUpdate(e) {
      return !0;
    }
    update(e) {
      void 0 !== this._$EC && (this._$EC.forEach((e, t) => this._$EO(t, this[t], e)), this._$EC = void 0), this._$Ek();
    }
    updated(e) {}
    firstUpdated(e) {}
  }
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  var $;
  k[w] = !0, k.elementProperties = new Map(), k.elementStyles = [], k.shadowRootOptions = {
    mode: "open"
  }, null == v || v({
    ReactiveElement: k
  }), (null !== (p = m.reactiveElementVersions) && void 0 !== p ? p : m.reactiveElementVersions = []).push("1.6.3");
  const S = window,
    E = S.trustedTypes,
    M = E ? E.createPolicy("lit-html", {
      createHTML: e => e
    }) : void 0,
    A = "$lit$",
    x = `lit$${(Math.random() + "").slice(9)}$`,
    T = "?" + x,
    z = `<${T}>`,
    O = document,
    D = () => O.createComment(""),
    H = e => null === e || "object" != typeof e && "function" != typeof e,
    C = Array.isArray,
    P = "[ \t\n\f\r]",
    N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
    L = /-->/g,
    j = />/g,
    I = RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"),
    R = /'/g,
    B = /"/g,
    U = /^(?:script|style|textarea|title)$/i,
    Y = (e => (t, ...a) => ({
      _$litType$: e,
      strings: t,
      values: a
    }))(1),
    F = Symbol.for("lit-noChange"),
    V = Symbol.for("lit-nothing"),
    W = new WeakMap(),
    G = O.createTreeWalker(O, 129, null, !1);
  function Z(e, t) {
    if (!Array.isArray(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== M ? M.createHTML(t) : t;
  }
  const q = (e, t) => {
    const a = e.length - 1,
      i = [];
    let n,
      s = 2 === t ? "<svg>" : "",
      r = N;
    for (let t = 0; t < a; t++) {
      const a = e[t];
      let o,
        l,
        u = -1,
        d = 0;
      for (; d < a.length && (r.lastIndex = d, l = r.exec(a), null !== l);) d = r.lastIndex, r === N ? "!--" === l[1] ? r = L : void 0 !== l[1] ? r = j : void 0 !== l[2] ? (U.test(l[2]) && (n = RegExp("</" + l[2], "g")), r = I) : void 0 !== l[3] && (r = I) : r === I ? ">" === l[0] ? (r = null != n ? n : N, u = -1) : void 0 === l[1] ? u = -2 : (u = r.lastIndex - l[2].length, o = l[1], r = void 0 === l[3] ? I : '"' === l[3] ? B : R) : r === B || r === R ? r = I : r === L || r === j ? r = N : (r = I, n = void 0);
      const c = r === I && e[t + 1].startsWith("/>") ? " " : "";
      s += r === N ? a + z : u >= 0 ? (i.push(o), a.slice(0, u) + A + a.slice(u) + x + c) : a + x + (-2 === u ? (i.push(void 0), t) : c);
    }
    return [Z(e, s + (e[a] || "<?>") + (2 === t ? "</svg>" : "")), i];
  };
  class K {
    constructor({
      strings: e,
      _$litType$: t
    }, a) {
      let i;
      this.parts = [];
      let n = 0,
        s = 0;
      const r = e.length - 1,
        o = this.parts,
        [l, u] = q(e, t);
      if (this.el = K.createElement(l, a), G.currentNode = this.el.content, 2 === t) {
        const e = this.el.content,
          t = e.firstChild;
        t.remove(), e.append(...t.childNodes);
      }
      for (; null !== (i = G.nextNode()) && o.length < r;) {
        if (1 === i.nodeType) {
          if (i.hasAttributes()) {
            const e = [];
            for (const t of i.getAttributeNames()) if (t.endsWith(A) || t.startsWith(x)) {
              const a = u[s++];
              if (e.push(t), void 0 !== a) {
                const e = i.getAttribute(a.toLowerCase() + A).split(x),
                  t = /([.?@])?(.*)/.exec(a);
                o.push({
                  type: 1,
                  index: n,
                  name: t[2],
                  strings: e,
                  ctor: "." === t[1] ? te : "?" === t[1] ? ie : "@" === t[1] ? ne : ee
                });
              } else o.push({
                type: 6,
                index: n
              });
            }
            for (const t of e) i.removeAttribute(t);
          }
          if (U.test(i.tagName)) {
            const e = i.textContent.split(x),
              t = e.length - 1;
            if (t > 0) {
              i.textContent = E ? E.emptyScript : "";
              for (let a = 0; a < t; a++) i.append(e[a], D()), G.nextNode(), o.push({
                type: 2,
                index: ++n
              });
              i.append(e[t], D());
            }
          }
        } else if (8 === i.nodeType) if (i.data === T) o.push({
          type: 2,
          index: n
        });else {
          let e = -1;
          for (; -1 !== (e = i.data.indexOf(x, e + 1));) o.push({
            type: 7,
            index: n
          }), e += x.length - 1;
        }
        n++;
      }
    }
    static createElement(e, t) {
      const a = O.createElement("template");
      return a.innerHTML = e, a;
    }
  }
  function X(e, t, a = e, i) {
    var n, s, r, o;
    if (t === F) return t;
    let l = void 0 !== i ? null === (n = a._$Co) || void 0 === n ? void 0 : n[i] : a._$Cl;
    const u = H(t) ? void 0 : t._$litDirective$;
    return (null == l ? void 0 : l.constructor) !== u && (null === (s = null == l ? void 0 : l._$AO) || void 0 === s || s.call(l, !1), void 0 === u ? l = void 0 : (l = new u(e), l._$AT(e, a, i)), void 0 !== i ? (null !== (r = (o = a)._$Co) && void 0 !== r ? r : o._$Co = [])[i] = l : a._$Cl = l), void 0 !== l && (t = X(e, l._$AS(e, t.values), l, i)), t;
  }
  class J {
    constructor(e, t) {
      this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(e) {
      var t;
      const {
          el: {
            content: a
          },
          parts: i
        } = this._$AD,
        n = (null !== (t = null == e ? void 0 : e.creationScope) && void 0 !== t ? t : O).importNode(a, !0);
      G.currentNode = n;
      let s = G.nextNode(),
        r = 0,
        o = 0,
        l = i[0];
      for (; void 0 !== l;) {
        if (r === l.index) {
          let t;
          2 === l.type ? t = new Q(s, s.nextSibling, this, e) : 1 === l.type ? t = new l.ctor(s, l.name, l.strings, this, e) : 6 === l.type && (t = new se(s, this, e)), this._$AV.push(t), l = i[++o];
        }
        r !== (null == l ? void 0 : l.index) && (s = G.nextNode(), r++);
      }
      return G.currentNode = O, n;
    }
    v(e) {
      let t = 0;
      for (const a of this._$AV) void 0 !== a && (void 0 !== a.strings ? (a._$AI(e, a, t), t += a.strings.length - 2) : a._$AI(e[t])), t++;
    }
  }
  class Q {
    constructor(e, t, a, i) {
      var n;
      this.type = 2, this._$AH = V, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = a, this.options = i, this._$Cp = null === (n = null == i ? void 0 : i.isConnected) || void 0 === n || n;
    }
    get _$AU() {
      var e, t;
      return null !== (t = null === (e = this._$AM) || void 0 === e ? void 0 : e._$AU) && void 0 !== t ? t : this._$Cp;
    }
    get parentNode() {
      let e = this._$AA.parentNode;
      const t = this._$AM;
      return void 0 !== t && 11 === (null == e ? void 0 : e.nodeType) && (e = t.parentNode), e;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(e, t = this) {
      e = X(this, e, t), H(e) ? e === V || null == e || "" === e ? (this._$AH !== V && this._$AR(), this._$AH = V) : e !== this._$AH && e !== F && this._(e) : void 0 !== e._$litType$ ? this.g(e) : void 0 !== e.nodeType ? this.$(e) : (e => C(e) || "function" == typeof (null == e ? void 0 : e[Symbol.iterator]))(e) ? this.T(e) : this._(e);
    }
    k(e) {
      return this._$AA.parentNode.insertBefore(e, this._$AB);
    }
    $(e) {
      this._$AH !== e && (this._$AR(), this._$AH = this.k(e));
    }
    _(e) {
      this._$AH !== V && H(this._$AH) ? this._$AA.nextSibling.data = e : this.$(O.createTextNode(e)), this._$AH = e;
    }
    g(e) {
      var t;
      const {
          values: a,
          _$litType$: i
        } = e,
        n = "number" == typeof i ? this._$AC(e) : (void 0 === i.el && (i.el = K.createElement(Z(i.h, i.h[0]), this.options)), i);
      if ((null === (t = this._$AH) || void 0 === t ? void 0 : t._$AD) === n) this._$AH.v(a);else {
        const e = new J(n, this),
          t = e.u(this.options);
        e.v(a), this.$(t), this._$AH = e;
      }
    }
    _$AC(e) {
      let t = W.get(e.strings);
      return void 0 === t && W.set(e.strings, t = new K(e)), t;
    }
    T(e) {
      C(this._$AH) || (this._$AH = [], this._$AR());
      const t = this._$AH;
      let a,
        i = 0;
      for (const n of e) i === t.length ? t.push(a = new Q(this.k(D()), this.k(D()), this, this.options)) : a = t[i], a._$AI(n), i++;
      i < t.length && (this._$AR(a && a._$AB.nextSibling, i), t.length = i);
    }
    _$AR(e = this._$AA.nextSibling, t) {
      var a;
      for (null === (a = this._$AP) || void 0 === a || a.call(this, !1, !0, t); e && e !== this._$AB;) {
        const t = e.nextSibling;
        e.remove(), e = t;
      }
    }
    setConnected(e) {
      var t;
      void 0 === this._$AM && (this._$Cp = e, null === (t = this._$AP) || void 0 === t || t.call(this, e));
    }
  }
  class ee {
    constructor(e, t, a, i, n) {
      this.type = 1, this._$AH = V, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = n, a.length > 2 || "" !== a[0] || "" !== a[1] ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = V;
    }
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(e, t = this, a, i) {
      const n = this.strings;
      let s = !1;
      if (void 0 === n) e = X(this, e, t, 0), s = !H(e) || e !== this._$AH && e !== F, s && (this._$AH = e);else {
        const i = e;
        let r, o;
        for (e = n[0], r = 0; r < n.length - 1; r++) o = X(this, i[a + r], t, r), o === F && (o = this._$AH[r]), s || (s = !H(o) || o !== this._$AH[r]), o === V ? e = V : e !== V && (e += (null != o ? o : "") + n[r + 1]), this._$AH[r] = o;
      }
      s && !i && this.j(e);
    }
    j(e) {
      e === V ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != e ? e : "");
    }
  }
  class te extends ee {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(e) {
      this.element[this.name] = e === V ? void 0 : e;
    }
  }
  const ae = E ? E.emptyScript : "";
  class ie extends ee {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(e) {
      e && e !== V ? this.element.setAttribute(this.name, ae) : this.element.removeAttribute(this.name);
    }
  }
  class ne extends ee {
    constructor(e, t, a, i, n) {
      super(e, t, a, i, n), this.type = 5;
    }
    _$AI(e, t = this) {
      var a;
      if ((e = null !== (a = X(this, e, t, 0)) && void 0 !== a ? a : V) === F) return;
      const i = this._$AH,
        n = e === V && i !== V || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive,
        s = e !== V && (i === V || n);
      n && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
    }
    handleEvent(e) {
      var t, a;
      "function" == typeof this._$AH ? this._$AH.call(null !== (a = null === (t = this.options) || void 0 === t ? void 0 : t.host) && void 0 !== a ? a : this.element, e) : this._$AH.handleEvent(e);
    }
  }
  class se {
    constructor(e, t, a) {
      this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = a;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(e) {
      X(this, e);
    }
  }
  const re = S.litHtmlPolyfillSupport;
  null == re || re(K, Q), (null !== ($ = S.litHtmlVersions) && void 0 !== $ ? $ : S.litHtmlVersions = []).push("2.8.0");
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  var oe, le;
  class ue extends k {
    constructor() {
      super(...arguments), this.renderOptions = {
        host: this
      }, this._$Do = void 0;
    }
    createRenderRoot() {
      var e, t;
      const a = super.createRenderRoot();
      return null !== (e = (t = this.renderOptions).renderBefore) && void 0 !== e || (t.renderBefore = a.firstChild), a;
    }
    update(e) {
      const t = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ((e, t, a) => {
        var i, n;
        const s = null !== (i = null == a ? void 0 : a.renderBefore) && void 0 !== i ? i : t;
        let r = s._$litPart$;
        if (void 0 === r) {
          const e = null !== (n = null == a ? void 0 : a.renderBefore) && void 0 !== n ? n : null;
          s._$litPart$ = r = new Q(t.insertBefore(D(), e), e, void 0, null != a ? a : {});
        }
        return r._$AI(e), r;
      })(t, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      var e;
      super.connectedCallback(), null === (e = this._$Do) || void 0 === e || e.setConnected(!0);
    }
    disconnectedCallback() {
      var e;
      super.disconnectedCallback(), null === (e = this._$Do) || void 0 === e || e.setConnected(!1);
    }
    render() {
      return F;
    }
  }
  ue.finalized = !0, ue._$litElement$ = !0, null === (oe = globalThis.litElementHydrateSupport) || void 0 === oe || oe.call(globalThis, {
    LitElement: ue
  });
  const de = globalThis.litElementPolyfillSupport;
  null == de || de({
    LitElement: ue
  }), (null !== (le = globalThis.litElementVersions) && void 0 !== le ? le : globalThis.litElementVersions = []).push("3.3.3");
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  const ce = e => t => "function" == typeof t ? ((e, t) => (customElements.define(e, t), t))(e, t) : ((e, t) => {
      const {
        kind: a,
        elements: i
      } = t;
      return {
        kind: a,
        elements: i,
        finisher(t) {
          customElements.define(e, t);
        }
      };
    })(e, t)
    /**
         * @license
         * Copyright 2017 Google LLC
         * SPDX-License-Identifier: BSD-3-Clause
         */,
    he = (e, t) => "method" === t.kind && t.descriptor && !("value" in t.descriptor) ? {
      ...t,
      finisher(a) {
        a.createProperty(t.key, e);
      }
    } : {
      kind: "field",
      key: Symbol(),
      placement: "own",
      descriptor: {},
      originalKey: t.key,
      initializer() {
        "function" == typeof t.initializer && (this[t.key] = t.initializer.call(this));
      },
      finisher(a) {
        a.createProperty(t.key, e);
      }
    };
  function pe(e) {
    return (t, a) => void 0 !== a ? ((e, t, a) => {
      t.constructor.createProperty(a, e);
    })(e, t, a) : he(e, t);
    /**
         * @license
         * Copyright 2017 Google LLC
         * SPDX-License-Identifier: BSD-3-Clause
         */
  }
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  function me(e, t) {
    return (({
      finisher: e,
      descriptor: t
    }) => (a, i) => {
      var n;
      if (void 0 === i) {
        const i = null !== (n = a.originalKey) && void 0 !== n ? n : a.key,
          s = null != t ? {
            kind: "method",
            placement: "prototype",
            key: i,
            descriptor: t(a.key)
          } : {
            ...a,
            key: i
          };
        return null != e && (s.finisher = function (t) {
          e(t, i);
        }), s;
      }
      {
        const n = a.constructor;
        void 0 !== t && Object.defineProperty(a, i, t(i)), null == e || e(n, i);
      }
    })({
      descriptor: a => {
        const i = {
          get() {
            var t, a;
            return null !== (a = null === (t = this.renderRoot) || void 0 === t ? void 0 : t.querySelector(e)) && void 0 !== a ? a : null;
          },
          enumerable: !0,
          configurable: !0
        };
        if (t) {
          const t = "symbol" == typeof a ? Symbol() : "__" + a;
          i.get = function () {
            var a, i;
            return void 0 === this[t] && (this[t] = null !== (i = null === (a = this.renderRoot) || void 0 === a ? void 0 : a.querySelector(e)) && void 0 !== i ? i : null), this[t];
          };
        }
        return i;
      }
    });
  }
  /**
       * @license
       * Copyright 2021 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  var ge, fe, ve;
  null === (ge = window.HTMLSlotElement) || void 0 === ge || ge.prototype.assignedElements, function (e) {
    e.language = "language", e.system = "system", e.comma_decimal = "comma_decimal", e.decimal_comma = "decimal_comma", e.space_comma = "space_comma", e.none = "none";
  }(fe || (fe = {})), function (e) {
    e.language = "language", e.system = "system", e.am_pm = "12", e.twenty_four = "24";
  }(ve || (ve = {}));
  var be = function (e, t, a, i) {
    i = i || {}, a = null == a ? {} : a;
    var n = new Event(t, {
      bubbles: void 0 === i.bubbles || i.bubbles,
      cancelable: Boolean(i.cancelable),
      composed: void 0 === i.composed || i.composed
    });
    return n.detail = a, e.dispatchEvent(n), n;
  };
  let ye = !1,
    _e = null;
  const we = async () => {
    if (ye && _e) return _e;
    if (customElements.get("ha-checkbox") && customElements.get("ha-slider") && customElements.get("ha-panel-config")) return Promise.resolve();
    ye = !0, _e = async function () {
      try {
        await new Promise(e => {
          "requestIdleCallback" in window ? requestIdleCallback(() => e()) : setTimeout(() => e(), 0);
        }), await customElements.whenDefined("partial-panel-resolver");
        const e = document.createDocumentFragment(),
          t = document.createElement("partial-panel-resolver");
        e.appendChild(t), t.hass = {
          panels: [{
            url_path: "tmp",
            component_name: "config"
          }]
        }, await new Promise(e => queueMicrotask(() => e())), t._updateRoutes(), await t.routerOptions.routes.tmp.load(), await customElements.whenDefined("ha-panel-config"), await new Promise(e => queueMicrotask(() => e()));
        const a = document.createElement("ha-panel-config");
        e.appendChild(a), await a.routerOptions.routes.automation.load(), e.textContent = "";
      } catch (e) {
        console.error("Failed to load HA form elements:", e);
      }
    }();
    try {
      await _e;
    } finally {
      ye = !1, _e = null;
    }
  };
  const ke = "smart_irrigation",
    $e = "minutes",
    Se = "hours",
    Ee = "days",
    Me = "imperial",
    Ae = "metric",
    xe = "Dewpoint",
    Te = "Evapotranspiration",
    ze = "Humidity",
    Oe = "Precipitation",
    De = "Current Precipitation",
    He = "Pressure",
    Ce = "Solar Radiation",
    Pe = "Temperature",
    Ne = "Windspeed",
    Le = "weather_service",
    je = "sensor",
    Ie = "static",
    Re = "pressure_type",
    Be = "absolute",
    Ue = "relative",
    Ye = "none",
    Fe = "source",
    Ve = "sensorentity",
    We = "static_value",
    Ge = "unit",
    Ze = "aggregate",
    qe = ["average", "first", "last", "maximum", "median", "minimum", "riemannsum", "sum"],
    Ke = "mm/h",
    Xe = "in/h",
    Je = "name",
    Qe = "size",
    et = "throughput",
    tt = "state",
    at = "duration",
    it = "module",
    nt = "bucket",
    st = "multiplier",
    rt = "mapping",
    ot = "lead_time",
    lt = "maximum_duration",
    ut = "maximum_bucket",
    dt = "drainage_rate",
    ct = e => e.callWS({
      type: ke + "/config"
    }),
    ht = e => e.callWS({
      type: ke + "/zones"
    }),
    pt = e => e.callWS({
      type: ke + "/modules"
    }),
    mt = e => e.callWS({
      type: ke + "/mappings"
    }),
    gt = (e, t, a = 10) => e.callWS({
      type: ke + "/weather_records",
      mapping_id: t,
      limit: a
    }),
    ft = e => {
      class t extends e {
        connectedCallback() {
          super.connectedCallback(), this.__checkSubscribed();
        }
        disconnectedCallback() {
          if (super.disconnectedCallback(), this.__unsubs) {
            for (; this.__unsubs.length;) {
              const e = this.__unsubs.pop();
              e instanceof Promise ? e.then(e => e()) : e();
            }
            this.__unsubs = void 0;
          }
        }
        updated(e) {
          super.updated(e), e.has("hass") && this.__checkSubscribed();
        }
        hassSubscribe() {
          return [];
        }
        __checkSubscribed() {
          void 0 === this.__unsubs && this.isConnected && void 0 !== this.hass && (this.__unsubs = this.hassSubscribe());
        }
      }
      return n([pe({
        attribute: !1
      })], t.prototype, "hass", void 0), t;
    };
  var vt = {
      actions: {
        delete: "Lösche"
      },
      labels: {
        module: "Modul",
        no: "Nein",
        select: "Wähle",
        yes: "Ja"
      },
      attributes: {
        size: "Größe",
        throughput: "Durchfluss",
        state: "Zustand"
      }
    },
    bt = {
      "default-zone": "Standard Zone",
      "default-mapping": "Standard Sensorgruppe"
    },
    yt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "Beachte: Diese Beschreibung nutzt '.' als Dezimalzeichen und zeigt gerundete Werte. Das Modul berechnete einen Evapotranspirationsmangel von",
          "bucket-was": "Der alte Vorrat war",
          "new-bucket-values-is": "Der neue Vorrat ist",
          "old-bucket-variable": "alter_Vorrat",
          delta: "Veränderung",
          "bucket-less-than-zero-irrigation-necessary": "Wenn der Vorrat < 0 ist, ist eine Bewässerung nötig.",
          "steps-taken-to-calculate-duration": "Für eine exakte Berechnung der Dauer, wurden folgende Schritte durchgeführt",
          "precipitation-rate-defined-as": "Der Niederschlag ist",
          "duration-is-calculated-as": "Die Dauer ist",
          bucket: "Vorrat",
          "precipitation-rate-variable": "Niederschlag",
          "multiplier-is-applied": "Der Multiplikator wird angewendet. Der Multiplikator ist",
          "duration-after-multiplier-is": "also ist die Dauer",
          "maximum-duration-is-applied": "Die maximale Dauer wird angewendet. Diese ist",
          "duration-after-maximum-duration-is": "also ist die Dauer",
          "lead-time-is-applied": "Zuletzt wird die Vorlaufzeit angewendet. Die Vorlaufzeit ist",
          "duration-after-lead-time-is": "also ist die Dauer",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Wenn der Vorrat >= 0 ist, ist keine Bewässerung nötig und die Dauer ist gleich",
          "maximum-bucket-is": "Der maximale Vorrat ist"
        }
      }
    },
    _t = {
      pyeto: {
        description: "Die Berechnung der Verunstungsrate basiert auf der FAO56-Formel aus der PyETO-Bibliothek"
      },
      static: {
        description: "Modul mit einer statisch konfigurierbaren Verdunstungsrate."
      },
      passthrough: {
        description: "Pass Through übernimmt den Evapotranspirationssensor und gibt seinen Wert zurück. Auf diese Weise werden alle Berechnungen der Verdunstung umgangen, außer der Anwendung von Aggregaten wie Summe, Durchschnitt etc)."
      }
    },
    wt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatische Berechnung der Bewässerungsdauer",
            description: "Die Berechnung berücksichtigt die bis zu diesem Zeitpunkt gesammelten Wetterdaten und aktualisiert den Vorrat für jede automatische Zone. Anschließend wird die Dauer basierend auf dem neuen Vorrat angepasst und die gesammelten Wetterdaten entfernt.",
            labels: {
              "auto-calc-enabled": "Automatische Berechnung der Dauer pro Zone",
              "auto-calc-time": "Berechne um"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Hinweis: Die automatische Aktualisierung der Wetterdaten erfolgt bei oder nach der automatischen Berechnung der Bewässerungsdauer"
            },
            header: "Automatische Aktualisierung der Wetterdaten",
            description: "Die Wetterdaten werden automatisch gesammelt und gespeichert. Zur Berechnung der Zonen und Bewässerungsdauer sind Wetterdaten erforderlich.",
            labels: {
              "auto-update-enabled": "Automatisches Update der Wetterdaten",
              "auto-update-delay": "Update Verzögerung",
              "auto-update-interval": "Update der Sensordaten alle"
            },
            options: {
              days: "Tage",
              hours: "Stunden",
              minutes: "Minuten"
            }
          },
          "automatic-clear": {
            header: "Automatisches Löschen der Wetterdaten",
            description: "Gesammelte Wetterdaten zu einem bestimmten Zeitpunkt automatisch entfernen. Damit wird sicher gestellt, dass keine Wetterdaten von vergangenen Tagen übrig bleiben. Entferne die Wetterdaten nicht vor der Berechnung und verwende diese Option nur, wenn du erwartest, dass das automatische Update Wetterdaten erfasst hat, nachdem der Tag berechnet wurde. Idealerweise sollte dieser Schnitt so spät wie möglich Tag durchgeführt werden.",
            labels: {
              "automatic-clear-enabled": "Automatisches Löschen der Wetterdaten",
              "automatic-clear-time": "Löschen der Wetterdaten um"
            }
          }
        },
        description: "Diese Seite ist für allgemeine Einstellungen.",
        title: "Allgemein"
      },
      help: {
        title: "Hilfe",
        cards: {
          "how-to-get-help": {
            title: "Hilfe bekommen",
            "first-read-the": "Lies zuerst im",
            wiki: "Wiki",
            "if-you-still-need-help": "Benötigst du weiterhin Hilfe, wende dich an das",
            "community-forum": "Community Forum",
            "or-open-a": "oder eröffne einen",
            "github-issue": "Github Issue",
            "english-only": "nur Englisch"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Hinzufügen"
            },
            header: "Sensorgruppe hinzufügen"
          },
          mapping: {
            aggregates: {
              average: "Durchschnitt",
              first: "Erster",
              last: "Letzter",
              maximum: "Maximum",
              median: "Median",
              minimum: "Minimum",
              sum: "Summe"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "Diese Sensorgruppe kann nicht entfernt werden, da sie von mindestens einer Zone verwendet wird."
            },
            items: {
              dewpoint: "Taupunkt",
              evapotranspiration: "Verdunstung",
              humidity: "Feuchtigkeit",
              "maximum temperature": "Maximum-Temperatur",
              "minimum temperature": "Minimum-Temperatur",
              precipitation: "Gesamtniederschlag",
              pressure: "Luftdruck",
              "solar radiation": "Sonnenstrahlung",
              temperature: "Temperatur",
              windspeed: "Windgeschwindigkeit"
            },
            pressure_types: {
              absolute: "absolut",
              relative: "relativ"
            },
            "pressure-type": "Der Luftdruck ist",
            "sensor-aggregate-of-sensor-values-to-calculate": "des Sensors für die Berechnung.",
            "sensor-aggregate-use-the": "Nutze den/die/das",
            "sensor-entity": "Sensor Entität",
            static_value: "Wert",
            "input-units": "Sensor Werte in",
            source: "Quelle",
            sources: {
              none: "Keine",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Fester Wert"
            }
          }
        },
        description: "Füge eine oder mehrere Sensorgruppen hinzu, die Wetterdaten von Weather service, Sensoren oder einer Kombination daraus abrufen. Jede Sensorgruppe kann für eine oder mehrere Zonen verwendet werden",
        labels: {
          "mapping-name": "Name"
        },
        no_items: "Es ist noch keine Sensorgruppe angelegt.",
        title: "Sensorgruppen"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Hinzufügen"
            },
            header: "Modul hinzufügen"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "Dieses Modul kann nicht entfernt werden, da es von mindestens einer Zone verwendet wird."
            },
            labels: {
              configuration: "Konfiguration",
              required: "Feld ist erforderlich"
            },
            "translated-options": {
              DontEstimate: "Nicht berechnen",
              EstimateFromSunHours: "Basierend auf den Sonnenstunden",
              EstimateFromTemp: "Basierend auf der Temperatur",
              EstimateFromSunHoursAndTemperature: "Basierend auf dem Durchschnitt von Sonnenstunden und Temperatur"
            }
          }
        },
        description: "Füge ein oder mehrere Module hinzu. Module berechnen die Bewässerungsdauer. Jedes Modul hat seine eigene Konfiguration und kann zur Berechnung der Bewässerungsdauer für eine oder mehrere Zonen verwendet werden.",
        no_items: "Es ist noch kein Module angelegt.",
        title: "Module"
      },
      zones: {
        actions: {
          add: "Hinzufügen",
          calculate: "Bewässerungsdauer berechnen.",
          information: "Information",
          update: "Wetterdaten aktualisieren.",
          "reset-bucket": "Vorrat zurücksetzen"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Hinzufügen"
            },
            header: "Zone hinzufügen"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Alle Zonen berechnen",
              "update-all": "Alle Zonen aktualisieren",
              "reset-all-buckets": "Alle Vorräte zurücksetzen",
              "clear-all-weatherdata": "Alle Wetterdaten löschen"
            },
            header: "Aktionen für alle Zonen"
          }
        },
        description: "Füge eine oder mehrere Zonen hinzu. Die Bewässerungsdauer wird pro Zone, abhängig von Größe, Durchsatz, Status, Modul und Sensorgruppe berechnet.",
        labels: {
          bucket: "Vorrat",
          duration: "Dauer",
          "lead-time": "Vorlaufzeit",
          mapping: "Sensorgruppe",
          "maximum-duration": "Maximale Dauer",
          multiplier: "Multiplikator",
          name: "Name",
          size: "Größe",
          state: "Berechnung",
          states: {
            automatic: "Automatisch",
            disabled: "Aus",
            manual: "Manuell"
          },
          throughput: "Durchfluss",
          "maximum-bucket": "Maximaler Vorrat",
          last_calculated: "Zuletzt berechnet",
          "data-last-updated": "Daten zuletzt aktualisiert",
          "data-number-of-data-points": "Anzahl der Messungen"
        },
        no_items: "Es ist noch keine Zone vorhanden.",
        title: "Zonen"
      }
    },
    kt = "Smart Irrigation",
    $t = {
      common: vt,
      defaults: bt,
      module: yt,
      calcmodules: _t,
      panels: wt,
      title: kt
    },
    St = Object.freeze({
      __proto__: null,
      common: vt,
      defaults: bt,
      module: yt,
      calcmodules: _t,
      panels: wt,
      title: kt,
      default: $t
    }),
    Et = {
      loading: "Loading",
      saving: "Saving",
      actions: {
        delete: "Delete"
      },
      labels: {
        module: "Module",
        no: "No",
        select: "Select",
        yes: "Yes"
      },
      units: {
        seconds: "seconds"
      },
      attributes: {
        size: "size",
        throughput: "throughput",
        state: "state",
        bucket: "bucket",
        last_updated: "last updated",
        last_calculated: "last calculated",
        number_of_data_points: "number of data points"
      }
    },
    Mt = {
      "default-zone": "Default zone",
      "default-mapping": "Default sensor group"
    },
    At = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "Note: this explanation uses '.' as decimal separator, shows rounded and metric values. Module returned Evapotranspiration deficiency of",
          "bucket-was": "Bucket was",
          "new-bucket-values-is": "New bucket value is",
          bucket: "bucket",
          "old-bucket-variable": "old_bucket",
          "max-bucket-variable": "max_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary": "Since bucket < 0, irrigation is necessary",
          "steps-taken-to-calculate-duration": "To calculate the exact duration, the following steps were taken",
          "precipitation-rate-defined-as": "The precipitation rate is defined as",
          "duration-is-calculated-as": "The duration is calculated as",
          drainage: "drainage",
          "drainage-rate": "drainage_rate",
          hours: "hours",
          "precipitation-rate-variable": "precipitation_rate",
          "multiplier-is-applied": "Now, the multiplier is applied. The multiplier is",
          "duration-after-multiplier-is": "hence the duration is",
          "maximum-duration-is-applied": "Then, the maximum duration is applied. The maximum duration is",
          "duration-after-maximum-duration-is": "hence the duration is",
          "lead-time-is-applied": "Finally, the lead time is applied. The lead time is",
          "duration-after-lead-time-is": "hence the final duration is",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Since bucket >= 0, no irrigation is necessary and duration is set to",
          "maximum-bucket-is": "Maximum bucket size is",
          "drainage-rate-is": "Drainage rate when saturated (bucket at max) is",
          "current-drainage-is": "Current drainage is calculated as",
          "no-drainage": "Current drainage is 0 because"
        }
      }
    },
    xt = {
      pyeto: {
        description: "Calculate duration based on the FAO56 calculation from the PyETO library"
      },
      static: {
        description: "'Dummy' module with a static configurable delta"
      },
      passthrough: {
        description: "Passthrough module that returns the value of an Evapotranspiration sensor as delta"
      }
    },
    Tt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatic duration calculation",
            description: "Calculation takes collected weatherdata up to that point and updates the bucket for each automatic zone. Then, the duration is adjusted based on the new bucket value and the collected weatherdata is removed.",
            labels: {
              "auto-calc-enabled": "Automatically calculate zone durations",
              "auto-calc-time": "Calculate at"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Warning: weatherdata update time on or after calculation time"
            },
            header: "Automatic weather data update",
            description: "Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",
            labels: {
              "auto-update-enabled": "Automatically update weather data",
              "auto-update-delay": "Update delay",
              "auto-update-interval": "Update sensor data every"
            },
            options: {
              days: "days",
              hours: "hours",
              minutes: "minutes"
            }
          },
          "automatic-clear": {
            header: "Automatic weather data pruning",
            description: "Automatically remove collected weatherdata at a configured time. Use this to make sure that there is no left over weatherdata from previous days. Don't remove the weatherdata before you calculate and only use this option if you expect the automatic update to collect weatherdata after you calculated for the day. Ideally, you want to prune as late in the day as possible.",
            labels: {
              "automatic-clear-enabled": "Automatically clear collected weather data",
              "automatic-clear-time": "Clear weather data at"
            }
          },
          continuousupdates: {
            header: "Continuous updates for sensors (experimental)",
            description: "This experimental feature will continuously update the sensor data. This is useful for sensor groups that use sources that provide continuous data, such as weather stations. This feature cannot be used for sensor groups that at least partly rely on weather services as continous polling of APIs will incur costs. Keep in mind that this is experimental and may not work as expected. Use at your own risk.",
            labels: {
              continuousupdates: "Enable continuous updates",
              sensor_debounce: "Sensor debounce"
            }
          }
        },
        description: "This page provides global settings.",
        title: "General"
      },
      help: {
        title: "Help",
        cards: {
          "how-to-get-help": {
            title: "How to get help",
            "first-read-the": "First, read the",
            wiki: "Wiki",
            "if-you-still-need-help": "If you still need help reach out on the",
            "community-forum": "Community forum",
            "or-open-a": "or open a",
            "github-issue": "Github Issue",
            "english-only": "English only"
          }
        }
      },
      info: {
        title: "Info",
        description: "View information about next irrigation and system status.",
        cards: {
          "next-irrigation": {
            title: "Next Irrigation",
            labels: {
              "next-start": "Next start",
              duration: "Duration",
              zones: "Zones"
            },
            "no-data": "No data available",
            "backend-todo": "TODO: Backend API needed for irrigation info"
          },
          "irrigation-reason": {
            title: "Irrigation Reason",
            labels: {
              reason: "Reason",
              sunrise: "Sunrise",
              "total-duration": "Total duration",
              explanation: "Explanation"
            },
            "no-data": "No data available",
            "backend-todo": "TODO: Backend API needed for irrigation reason"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Add sensor group"
            },
            header: "Add sensor groups"
          },
          mapping: {
            aggregates: {
              average: "Average",
              first: "First",
              last: "Last",
              maximum: "Maximum",
              median: "Median",
              minimum: "Minimum",
              riemannsum: "Riemann sum",
              sum: "Sum"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "You cannot delete this sensor group because there is at least one zone using it.",
              invalid_source: "Invalid source",
              source_does_not_exist: "Source does not exist. Please enter a valid source, such as 'sensor.mysensor'."
            },
            items: {
              dewpoint: "Dewpoint",
              evapotranspiration: "Evapotranspiration",
              humidity: "Humidity",
              "maximum temperature": "Maximum temperature",
              "minimum temperature": "Minimum temperature",
              precipitation: "Total precipitation",
              "current precipitation": "Current precipitation",
              pressure: "Pressure",
              "solar radiation": "Solar radiation",
              temperature: "Temperature",
              windspeed: "Wind speed"
            },
            pressure_types: {
              absolute: "absolute",
              relative: "relative"
            },
            "pressure-type": "Pressure is",
            "sensor-aggregate-of-sensor-values-to-calculate": "of sensor values to calculate duration",
            "sensor-aggregate-use-the": "Use the",
            "sensor-entity": "Sensor entity",
            static_value: "Value",
            "input-units": "Input provides values in",
            source: "Source",
            sources: {
              none: "None",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Static value"
            }
          }
        },
        description: "Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",
        labels: {
          "mapping-name": "Name"
        },
        no_items: "There are no sensor group defined yet.",
        title: "Sensor Groups",
        "weather-records": {
          title: "Weather Records (Last 10)",
          timestamp: "Time",
          temperature: "Temp",
          humidity: "Humidity",
          precipitation: "Precip",
          "retrieval-time": "Retrieved",
          "no-data": "No weather data available for this sensor group"
        }
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Add module"
            },
            header: "Add module"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "You cannot delete this module because there is at least one zone using it."
            },
            labels: {
              configuration: "Configuration",
              required: "indicates a required field"
            },
            "translated-options": {
              DontEstimate: "Do not estimate",
              EstimateFromSunHours: "Estimate from sun hours",
              EstimateFromTemp: "Estimate from temperature",
              EstimateFromSunHoursAndTemperature: "Estimate from average of sun hours and temperature"
            }
          }
        },
        description: "Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",
        no_items: "There are no modules defined yet.",
        title: "Modules"
      },
      zones: {
        actions: {
          add: "Add",
          calculate: "Calculate",
          information: "Information",
          update: "Update",
          "reset-bucket": "Reset bucket",
          "view-weather-info": "View weather info",
          "view-weather-info-message": "Weather info available for",
          "view-weather-info-todo": "TODO: Implement navigation to sensor group details",
          "view-watering-calendar": "View watering calendar"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Add zone"
            },
            header: "Add zone"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calculate all zones",
              "update-all": "Update all zones",
              "reset-all-buckets": "Reset all buckets",
              "clear-all-weatherdata": "Clear all weatherdata"
            },
            header: "Actions on all zones"
          }
        },
        description: "Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",
        labels: {
          bucket: "Bucket",
          duration: "Duration",
          "lead-time": "Lead time",
          mapping: "Sensor Group",
          "maximum-duration": "Maximum duration",
          multiplier: "Multiplier",
          name: "Name",
          size: "Size",
          state: "State",
          states: {
            automatic: "Automatic",
            disabled: "Disabled",
            manual: "Manual"
          },
          throughput: "Throughput",
          "maximum-bucket": "Maximum bucket",
          last_calculated: "Last calculated",
          "data-last-updated": "Data last updated",
          "data-number-of-data-points": "Number of data points",
          drainage_rate: "Drainage rate"
        },
        no_items: "There are no zones defined yet.",
        title: "Zones"
      }
    },
    zt = "Smart Irrigation",
    Ot = {
      common: Et,
      defaults: Mt,
      module: At,
      calcmodules: xt,
      panels: Tt,
      title: zt
    },
    Dt = Object.freeze({
      __proto__: null,
      common: Et,
      defaults: Mt,
      module: At,
      calcmodules: xt,
      panels: Tt,
      title: zt,
      default: Ot
    }),
    Ht = {
      actions: {
        delete: "Eliminar"
      },
      labels: {
        module: "Módulo",
        no: "No",
        select: "Seleccionar",
        yes: "Sí"
      },
      attributes: {
        size: "Tamaño",
        throughput: "Rendimiento",
        state: "Estado"
      }
    },
    Ct = {
      "default-zone": "Zona de riego predeterminada",
      "default-mapping": "Grupo de sensores predeterminado"
    },
    Pt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "Nota: esta explicación utiliza '.' como separador decimal y muestra valores redondeados. El módulo devuelve una deficiencia de evapotranspiración de",
          "bucket-was": "El cubo era",
          "new-bucket-values-is": "El nuevo valor del cubo es",
          "old-bucket-variable": "old_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary": "Dado que cubo < 0, el riego es necesario",
          "steps-taken-to-calculate-duration": "Para calcular la duración exacta, se siguieron los siguientes pasos",
          "precipitation-rate-defined-as": "La tasa de precipitación se define como",
          "duration-is-calculated-as": "La duración se calcula como",
          bucket: "cubo",
          "precipitation-rate-variable": "precipitation_rate",
          "multiplier-is-applied": "A continuación, se aplica el multiplicador. El multiplicador es",
          "duration-after-multiplier-is": "por lo que la duración es",
          "maximum-duration-is-applied": "A continuación, se aplica la duración máxima. La duración máxima es",
          "duration-after-maximum-duration-is": "por lo que la duración es",
          "lead-time-is-applied": "Por último, se aplica el plazo de entrega. El plazo de entrega es",
          "duration-after-lead-time-is": "por lo que la duración final es",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Como cubo >= 0, no es necesario regar y la duración se fija en",
          "maximum-bucket-is": "El tamaño máximo de cubo es"
        }
      }
    },
    Nt = {
      pyeto: {
        description: "Calcular la duración a partir del cálculo FAO56 de la biblioteca PyETO"
      },
      static: {
        description: "Módulo 'de prueba' con un delta estático configurable"
      },
      passthrough: {
        description: "Módulo de paso que devuelve el valor de un sensor de evapotranspiración como delta"
      }
    },
    Lt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Cálculo automático de la duración",
            labels: {
              "auto-calc-enabled": "Cálculo automático de la duración de las zonas",
              "auto-calc-time": "Calcular en"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Advertencia: la hora de actualización de los datos meteorológicos es igual o posterior a la hora de cálculo"
            },
            header: "Actualización automática de los datos meteorológicos",
            labels: {
              "auto-update-enabled": "Actualizar automáticamente los datos meteorológicos",
              "auto-update-first-update": "(Primer) Actualización a las",
              "auto-update-interval": "Actualizar datos del sensor cada"
            },
            options: {
              days: "días",
              hours: "horas",
              minutes: "minutos"
            }
          }
        },
        description: "Esta página provee configuraciones globales.",
        title: "General"
      },
      help: {
        title: "Ayuda",
        cards: {
          "how-to-get-help": {
            title: "Cómo obtener ayuda",
            "first-read-the": "Primero lee la",
            wiki: "Wiki",
            "if-you-still-need-help": "Si aún necesitas ayuda, puedes:",
            "community-forum": "Comunidad/Foro",
            "or-open-a": "o abrir un",
            "github-issue": "Github Issue",
            "english-only": "sólo en inglés"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Añadir grupo de sensores"
            },
            header: "Añadir grupos de sensores"
          },
          mapping: {
            aggregates: {
              average: "Promedio",
              first: "Primero",
              last: "Último",
              maximum: "Máximo",
              median: "Mediana",
              minimum: "Mínimo",
              sum: "Suma"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "No puedes eliminar este grupo de sensores porque hay al menos una zona que lo está usando."
            },
            items: {
              dewpoint: "Punto de rocío",
              evapotranspiration: "Evapotranspiración",
              humidity: "Humedad",
              "maximum temperature": "Temperatura máxima",
              "minimum temperature": "Temperatura mínima",
              precipitation: "Precipitación total",
              pressure: "Presión",
              "solar radiation": "Radiación solar",
              temperature: "Temperatura",
              windspeed: "Velocidad del viento"
            },
            "sensor-aggregate-of-sensor-values-to-calculate": "de los valores de los sensores para calcular la duración",
            "sensor-aggregate-use-the": "Usar la",
            "sensor-entity": "Entidad de sensor",
            static_value: "Valor estático",
            "input-units": "Unidades de entrada",
            source: "Fuente",
            sources: {
              none: "Ninguno",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Valor estático"
            }
          }
        },
        description: "Añada uno o más grupos de sensores que recuperen datos meteorológicos de Weather service, de sensores o de una combinación de éstos. Puede asignar cada grupo de sensores a una o más zonas",
        labels: {
          "mapping-name": "Nombre del grupo de sensores"
        },
        no_items: "Aún no hay grupos de sensores definidos.",
        title: "Grupos de sensores"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Añadir módulo"
            },
            header: "Añadir módulo"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "No puedes eliminar este módulo porque hay al menos una zona que lo está usando."
            },
            labels: {
              configuration: "Configuración",
              required: "Requerido"
            },
            "translated-options": {
              DontEstimate: "No estimar",
              EstimateFromSunHours: "Estimar desde horas de sol",
              EstimateFromTemp: "Estimar desde temperatura"
            }
          }
        },
        description: "Añada uno o varios módulos que calculen la duración del riego. Cada módulo tiene su propia configuración y puede utilizarse para calcular la duración de una o varias zonas.",
        no_items: "Aún no hay módulos definidos.",
        title: "Módulos"
      },
      zones: {
        actions: {
          add: "Añadir",
          calculate: "Calcular",
          information: "Información",
          update: "Actualizar",
          "reset-bucket": "Resetear cubo"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Añadir zona"
            },
            header: "Añadir zona"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calcular todas las zonas",
              "update-all": "Actualizar todas las zonas",
              "reset-all-buckets": "Resetear todos los cubos"
            },
            header: "Acciones en todas las zonas"
          }
        },
        description: "Especifique aquí una o varias zonas de riego. La duración del riego se calcula por zona, en función del tamaño, el rendimiento, el estado, el módulo y el grupo de sensores.",
        labels: {
          bucket: "Cubo",
          duration: "Duración",
          "lead-time": "Tiempo de espera",
          mapping: "Grupo de sensores",
          "maximum-duration": "Duración máxima",
          multiplier: "Multiplicador",
          name: "Nombre",
          size: "Tamaño",
          state: "Estado",
          states: {
            automatic: "Automático",
            disabled: "Desactivado",
            manual: "Manual"
          },
          throughput: "Rendimiento",
          "maximum-bucket": "Cubo máximo"
        },
        no_items: "Aún no hay zonas definidas.",
        title: "Zonas"
      }
    },
    jt = "Smart Irrigation",
    It = {
      common: Ht,
      defaults: Ct,
      module: Pt,
      calcmodules: Nt,
      panels: Lt,
      title: jt
    },
    Rt = Object.freeze({
      __proto__: null,
      common: Ht,
      defaults: Ct,
      module: Pt,
      calcmodules: Nt,
      panels: Lt,
      title: jt,
      default: It
    }),
    Bt = {
      actions: {
        delete: "Suppression"
      },
      labels: {
        module: "Module",
        no: "Non",
        select: "Sélectionner",
        yes: "Oui"
      },
      attributes: {
        size: "taille",
        throughput: "débit",
        state: "état"
      }
    },
    Ut = {
      "default-zone": "Zone par défaut",
      "default-mapping": "Groupe de capteurs par défaut"
    },
    Yt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "NB: cette explication utilise '.' comme séparateur décimal, et affiche des valeurs arrondies. Le module a donné un manque d'Évapotranspiration de",
          "bucket-was": "Le seau (bucket) était de",
          "new-bucket-values-is": "La nouvelle valeur du seau (bucket) est",
          "old-bucket-variable": "ancien_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary": "Puisque le seau (bucket) est < 0, l'irrigation est nécessaire",
          "steps-taken-to-calculate-duration": "Pour calculer la durée d'irrigation, les étapes suivantes ont été réalisées",
          "precipitation-rate-defined-as": "Le taux de précipitation est défini comme",
          "duration-is-calculated-as": "La durée d'irrigation est calculée avec",
          bucket: "seau (bucket)",
          "precipitation-rate-variable": "taux_precipitation",
          "multiplier-is-applied": "Le multiplicateur est appliqué. Le multiplicateur est",
          "duration-after-multiplier-is": "donc la durée d'irrigation est de",
          "maximum-duration-is-applied": "Ensuite la durée maximale est appliquée. La durée maximale est de",
          "duration-after-maximum-duration-is": "donc la durée d'irrigation est de",
          "lead-time-is-applied": "Enfin, le délai est appliqué. Le délai est de",
          "duration-after-lead-time-is": "et donc la durée finale est de",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Puisque le seau (bucket) est >= 0, l'irrigation n'est pas nécessaire, et la durée est réglée à",
          "maximum-bucket-is": "la taille du seau (bucket) maximale est"
        }
      }
    },
    Ft = {
      pyeto: {
        description: "Le calcul de durée est basée sur le calcul FAO56 de la bibliothèque PyETO"
      },
      static: {
        description: "Module 'Dummy' avec un delta statique configurable"
      },
      passthrough: {
        description: "Module passerelle qui renvoie la valeur d'un capteur d'Évapotranspiration comme delta"
      }
    },
    Vt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Calcul automatique de la durée",
            labels: {
              "auto-calc-enabled": "Calcule automatiquement la durée par zone",
              "auto-calc-time": "Calcule à"
            },
            description: "Le calcul prend en compte les données météo jusqu'à ce point et met à jour le seau (bucket) pour chaque zone automatique. Ensuite, la durée est ajustée par la nouvelle valeur de seau (bucket) et les données météo sont supprimées."
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Attention: mise à jour des données météo au moment du, ou après le, calcul"
            },
            header: "Mise à jour automatique des données météo",
            labels: {
              "auto-update-enabled": "Met à jour les données météo automatiquement",
              "auto-update-first-update": "(Première) Mise à jour à",
              "auto-update-interval": "Mettre à jour les données des capteurs toutes les",
              "auto-update-delay": "Délai de mise à jour"
            },
            options: {
              days: "jours",
              hours: "heures",
              minutes: "minutes"
            },
            description: "Récupère et stocke les données météo automatiquement. Des données météo sont nécessaires pour calculer les seaux (buckets) par zone et les durées."
          },
          "automatic-clear": {
            header: "Délestage automatique des données météo",
            description: "Suppression automatique des données météo collectées à une heure données. Utilisez ceci pour être sûr qu'il n'y ait plus de restes des données météo des jours précédents. Ne supprimez pas les données météo avant le calcul et n'utilisez cette option que si vous vous attendez à ce que les données météo soient récupérées après le calcul du jour. Idéalement, vous voudrez \"élaguer\" les données les plus tard possible dans la journée.",
            labels: {
              "automatic-clear-enabled": "Suppression automatique des données météo collectées",
              "automatic-clear-time": "Supprimer les données météo à"
            }
          }
        },
        description: "Cette page fournit les réglages globaux.",
        title: "Général"
      },
      help: {
        title: "Aide",
        cards: {
          "how-to-get-help": {
            title: "Comment obtenir de l'aide",
            "first-read-the": "Premièrement, lisez ",
            wiki: "Wiki",
            "if-you-still-need-help": "Si vous avez toujours besoin d'aide, adressez vous sur le",
            "community-forum": "forum communautaire",
            "or-open-a": "ou ouvrez un",
            "github-issue": "problème Github",
            "english-only": "en Anglais uniquement"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Ajouter un groupe de capteurs"
            },
            header: "Ajouter des groupes de capteurs"
          },
          mapping: {
            aggregates: {
              average: "Moyenne",
              first: "Premier",
              last: "Dernier",
              maximum: "Maximum",
              median: "Médian",
              minimum: "Minimum",
              sum: "Somme"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "Vous ne pouvez pas supprimer ce groupe de capteurs car au moins une zone l'utilise."
            },
            items: {
              dewpoint: "Point de rosée",
              evapotranspiration: "Évapotranspiration",
              humidity: "Humidité",
              "maximum temperature": "Température maximale",
              "minimum temperature": "Température minimale",
              precipitation: "Précipitation totale",
              pressure: "Pression",
              "solar radiation": "Rayonnement solaire",
              temperature: "Température",
              windspeed: "Vitesse du vent"
            },
            "sensor-aggregate-of-sensor-values-to-calculate": "des valeurs des capteurs pour calculer la durée",
            "sensor-aggregate-use-the": "Utiliser les",
            "sensor-entity": "Entité capteur",
            static_value: "Valeur",
            "input-units": "L'entité fournit des entrées en",
            source: "Source",
            sources: {
              none: "Aucun",
              weather_service: "Weather service",
              sensor: "Capteur",
              static: "Valeur statique"
            },
            pressure_types: {
              relative: "relative",
              absolute: "absolue"
            },
            "pressure-type": "La pression est",
            "sensor-units": "Le capteur fournit les valeurs en"
          }
        },
        description: "Ajouter un ou plusieurs groupes de capteurs qui récupèrent les données météo de Weather service, de capteurs locaux ou d'une combinaison de tous ceux-ci. Vous pouvez associer chaque groupe de capteurs avec une ou plusieurs zones",
        labels: {
          "mapping-name": "Nom"
        },
        no_items: "Il n'y a pas encore de groupe de capteurs définis.",
        title: "Groupes de capteurs"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Ajouter un module"
            },
            header: "Ajout d'un module"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "Vous ne pouvez pas supprimer ce module car au moins une zone l'utilise."
            },
            labels: {
              configuration: "Configuration",
              required: "indique un champ requis"
            },
            "translated-options": {
              DontEstimate: "Ne fait pas d'estimation",
              EstimateFromSunHours: "Estimation à partir des heures d'ensoleillement",
              EstimateFromTemp: "Estimation à partir de la température"
            }
          }
        },
        description: "Ajouter un ou plusieurs modules qui calcule la durée d'irrigation. Chaque module vient avec sa propre configuration et peut être utilisé pour calculer la durée d'irrigation d'une ou plusieurs zones.",
        no_items: "Il n'y a aucun module défini pour l'instant.",
        title: "Modules"
      },
      zones: {
        actions: {
          add: "Ajouter",
          calculate: "Calculer",
          information: "Information",
          update: "Mise à jour",
          "reset-bucket": "Mise à zéro du seau (bucket)"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Ajouter une zone"
            },
            header: "Ajout d'une zone"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calculer pour toutes les zones",
              "update-all": "Mise à jour de toutes les zones",
              "reset-all-buckets": "Mise à zéro de tous les seaux (buckets)",
              "clear-all-weatherdata": "Mise à zéro de toutes les données météo"
            },
            header: "Actions sur toutes les zones"
          }
        },
        description: "Spécifiez une ou plusieurs zones d'irrigation ici. La durée d'irrigation est calculée par zone, en fonction de la taille, du débit, état, module et groupe de capteurs.",
        labels: {
          bucket: "Seau",
          duration: "Durée",
          "lead-time": "Délai",
          mapping: "Groupe de capteurs",
          "maximum-duration": "Durée maximale",
          multiplier: "Multiplicateur",
          name: "Nom",
          size: "Taille",
          state: "État",
          states: {
            automatic: "Automatique",
            disabled: "Désactivé",
            manual: "Manuel"
          },
          throughput: "Débit",
          "maximum-bucket": "Seau (bucket) maximum",
          last_calculated: "Dernier calcul",
          "data-last-updated": "Dernière mise à jour",
          "data-number-of-data-points": "Nombre de points de données"
        },
        no_items: "Il n'y a pas encore de zone définie.",
        title: "Zones"
      }
    },
    Wt = "Smart Irrigation",
    Gt = {
      common: Bt,
      defaults: Ut,
      module: Yt,
      calcmodules: Ft,
      panels: Vt,
      title: Wt
    },
    Zt = Object.freeze({
      __proto__: null,
      common: Bt,
      defaults: Ut,
      module: Yt,
      calcmodules: Ft,
      panels: Vt,
      title: Wt,
      default: Gt
    }),
    qt = {
      actions: {
        delete: "Cancella"
      },
      labels: {
        module: "Modulo",
        no: "No",
        select: "Seleziona",
        yes: "Si"
      },
      attributes: {
        size: "size",
        throughput: "throughput",
        state: "state",
        bucket: "secchio",
        last_updated: "ultimo aggiornamento",
        last_calculated: "ultimo calcolo",
        number_of_data_points: "numero di punti dati"
      }
    },
    Kt = {
      "default-zone": "Zona predefinita",
      "default-mapping": "Mappatura predefinita"
    },
    Xt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "Il modulo ha restituito un deficit di evapotraspirazione del",
          "bucket-was": "Il secchio era",
          "new-bucket-values-is": "Il nuovo valore del secchio è",
          "old-bucket-variable": "old_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary": "Poiché secchio < 0, è necessaria l'irrigazione",
          "steps-taken-to-calculate-duration": "Per calcolare la durata esatta, sono stati eseguiti i seguenti passaggi",
          "precipitation-rate-defined-as": "Il tasso di precipitazione è definito come",
          "duration-is-calculated-as": "La durata viene calcolata come",
          bucket: "bucket",
          "precipitation-rate-variable": "precipitation_rate",
          "multiplier-is-applied": "Ora viene applicato il moltiplicatore. Il moltiplicatore è",
          "duration-after-multiplier-is": "quindi la durata è",
          "maximum-duration-is-applied": "Quindi, viene applicata la durata massima. La durata massima è",
          "duration-after-maximum-duration-is": "quindi la durata è",
          "lead-time-is-applied": "Infine, viene applicato il lead time. Il tempo di consegna è",
          "duration-after-lead-time-is": "quindi la durata finale è",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Poiché secchio >= 0, non è necessaria alcuna irrigazione e la durata è impostata su",
          "maximum-bucket-is": "la dimensione massima del secchio è"
        }
      }
    },
    Jt = {
      pyeto: {
        description: "Calcola la durata in base al calcolo FAO56 dalla libreria PyETO"
      },
      static: {
        description: "Modulo 'fittizio' con un delta configurabile statico"
      },
      passthrough: {
        description: "Modulo passthrough che restituisce il valore di un sensore di Evapotraspirazione sotto forma di delta"
      }
    },
    Qt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Calcolo automatico della durata",
            description: "Il calcolo prende i dati meteorologici raccolti fino a quel momento e aggiorna il bucket per ciascuna zona automatica. Quindi, la durata viene regolata in base al nuovo valore del segmento e i dati meteorologici raccolti vengono rimossi.",
            labels: {
              "auto-calc-enabled": "Calcola automaticamente la durata delle zone",
              "auto-calc-time": "Calcola a"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Attenzione: ora di aggiornamento dei dati meteorologici in corrispondenza o dopo l'ora di calcolo"
            },
            header: "Aggiornamento automatico dei dati meteorologici",
            description: "Raccogli e archivia automaticamente i dati meteorologici. I dati meteorologici sono necessari per calcolare gli intervalli e le durate delle zone.",
            labels: {
              "auto-update-enabled": "Aggiorna automaticamente i dati meteorologici",
              "auto-update-first-update": "(Primo) aggiornamento alle",
              "auto-update-interval": "Aggiorna i dati del sensore ogni"
            },
            options: {
              days: "giorni",
              hours: "ore",
              minutes: "minuti"
            }
          },
          "automatic-clear": {
            header: "Eliminazione automatica dei dati meteo",
            description: "Rimuovi automaticamente i dati meteorologici raccolti all'orario configurato. Usalo per assicurarti che non siano rimasti dati meteorologici dei giorni precedenti. Non rimuovere i dati meteo prima del calcolo e utilizza questa opzione solo se prevedi che l'aggiornamento automatico raccolga i dati meteo dopo aver calcolato per la giornata. Idealmente, dovresti potare il più tardi possibile nella giornata.",
            labels: {
              "automatic-clear-enabled": "Cancella automaticamente i dati meteorologici raccolti",
              "automatic-clear-time": "Cancella dati meteo a"
            }
          },
          continuousupdates: {
            header: "Aggiornamenti continui per i sensori (sperimentale)",
            description: "Questa funzione sperimentale aggiorna continuamente i dati dei sensori. È utile per i gruppi di sensori che utilizzano fonti che forniscono dati continui, come le stazioni meteorologiche. Questa funzione non può essere utilizzata per i gruppi di sensori che si affidano almeno in parte ai servizi meteo, poiché il polling continuo delle API comporta dei costi. Tenere presente che si tratta di una funzione sperimentale e che potrebbe non funzionare come previsto. Utilizzatela a vostro rischio e pericolo.",
            etichette: {
              continuousupdates: "Abilita gli aggiornamenti continui"
            }
          }
        },
        description: "Questa pagina fornisce le impostazioni globali.",
        title: "Generale"
      },
      help: {
        title: "Aiuto",
        cards: {
          "how-to-get-help": {
            title: "Come ottenere aiuto",
            "first-read-the": "Per prima cosa, leggi il",
            wiki: "Wiki",
            "if-you-still-need-help": "Se hai ancora bisogno di aiuto, contatta il",
            "community-forum": "Forum della Comunità",
            "or-open-a": "oppure apri un",
            "github-issue": "Problema su Github",
            "english-only": "soltanto in Inglese"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Aggiungi gruppo di sensori"
            },
            header: "Aggiungi gruppo di sensori"
          },
          mapping: {
            aggregates: {
              average: "Media",
              first: "Primo",
              last: "Ultimo",
              maximum: "Massimo",
              median: "Mediana",
              minimum: "Minimo",
              sum: "Somma"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "Non è possibile eliminare questo gruppo di sensori perché almeno una zona lo utilizza.",
              invalid_source: "Fonte non valida",
              fonte_non_esiste: "La fonte non esiste. Inserire una fonte valida, ad esempio 'sensor.mysensor'."
            },
            items: {
              dewpoint: "Punto di rugiada",
              evapotranspiration: "Evapotraspirazione",
              humidity: "Umidità",
              "maximum temperature": "Temperatura massima",
              "minimum temperature": "Temperatura minima",
              precipitation: "Precipitazione",
              "precipitazioni attuali": "Precipitazioni attuali",
              pressure: "Pressione",
              "solar radiation": "Irradiamento solare",
              temperature: "Temperatura",
              windspeed: "Velocità del vento"
            },
            pressure_types: {
              absolute: "assoluta",
              relative: "relativa"
            },
            "pressure-type": "La pressione è",
            "sensor-aggregate-of-sensor-values-to-calculate": "dei valori del sensore per calcolare la durata",
            "sensor-aggregate-use-the": "Usa il",
            "sensor-entity": "Entità sensore",
            static_value: "Valore",
            "input-units": "L'input fornisce valori in",
            source: "Fonte",
            sources: {
              none: "Nessuna",
              weather_service: "Weather service",
              sensor: "Sensore",
              static: "Valore statico"
            }
          }
        },
        description: "Aggiungi uno o più gruppi di sensori che recuperano i dati meteorologici da Weather service, da sensori o da una combinazione di questi. È possibile mappare ciascun gruppo di sensori su una o più zone",
        labels: {
          "mapping-name": "Nome"
        },
        no_items: "Non è ancora stato definito alcun gruppo di sensori.",
        title: "Gruppi di sensori"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Aggiungi modulo"
            },
            header: "Aggiungi modulo"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "Non puoi eliminare questo modulo perché almeno una zona lo utilizza."
            },
            labels: {
              configuration: "Configurazione",
              required: "indica un campo richiesto"
            },
            "translated-options": {
              DontEstimate: "Non stimare",
              EstimateFromSunHours: "Stima dalle ore solari",
              EstimateFromTemp: "Stima dalla temperatura",
              EstimateFromSunHoursAndTemperature: "Stima dalla media delle ore di sole e della temperatura"
            }
          }
        },
        description: "Aggiungi uno o più moduli che calcolano la durata dell'irrigazione. Ogni modulo viene fornito con la propria configurazione e può essere utilizzato per calcolare la durata di una o più zone.",
        no_items: "Non ci sono ancora moduli definiti.",
        title: "Moduli"
      },
      zones: {
        actions: {
          add: "Aggiungi",
          calculate: "Calcola",
          information: "Informazioni",
          update: "Aggiorna",
          "reset-bucket": "Reimposta il secchio"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Aggiungi zona"
            },
            header: "Aggiungi zona"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calcola tutte le zone",
              "update-all": "Aggiorna tutte le zone",
              "reset-all-buckets": "Reimposta tutte le zone",
              "clear-all-weatherdata": "Cancella tutti i dati meteo"
            },
            header: "Azioni su tutte le zone"
          }
        },
        description: "Specificare qui una o più zone di irrigazione. La durata dell'irrigazione viene calcolata per zona, a seconda delle dimensioni, della produttività, dello stato, del modulo e del gruppo di sensori.",
        labels: {
          bucket: "Secchio",
          duration: "Durata",
          "lead-time": "Tempi di esecuzione",
          mapping: "Gruppo di sensori",
          "maximum-duration": "Durata massima",
          multiplier: "Moltiplicatore",
          name: "Nome",
          size: "Misura",
          state: "Stato",
          states: {
            automatic: "Automatico",
            disabled: "Disabilitato",
            manual: "Manuale"
          },
          throughput: "Portata",
          "maximum-bucket": "Secchio massimo",
          last_calculated: "Ultimo calcolo",
          "data-last-updated": "Ultimo aggiornamento dei dati",
          "data-number-of-data-points": "Numero di dati",
          tasso_di_drenaggio: "tasso di drenaggio"
        },
        no_items: "Non ci sono ancora zone definite.",
        title: "Zone"
      }
    },
    ea = "Irrigazione Intelligente",
    ta = {
      common: qt,
      defaults: Kt,
      module: Xt,
      calcmodules: Jt,
      panels: Qt,
      title: ea
    },
    aa = Object.freeze({
      __proto__: null,
      common: qt,
      defaults: Kt,
      module: Xt,
      calcmodules: Jt,
      panels: Qt,
      title: ea,
      default: ta
    }),
    ia = {
      actions: {
        delete: "Verwijderen"
      },
      labels: {
        module: "Module",
        no: "Nee",
        select: "Kies",
        yes: "Ja"
      },
      attributes: {
        size: "afmeting",
        throughput: "doorvoer",
        state: "status"
      }
    },
    na = {
      "default-zone": "Standaard zone",
      "default-mapping": "Standaard sensorgroep"
    },
    sa = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "NB: in deze uitleg wordt de '.' as decimaalscheidingsteken gebruikt, worden afgeronde en metrische getallen getoond. Module berekende ET waarde van",
          "bucket-was": "Voorraad was",
          "new-bucket-values-is": "Nieuwe voorraad is",
          "old-bucket-variable": "oude_voorraad",
          delta: "verandering",
          "bucket-less-than-zero-irrigation-necessary": "Omdat de voorraad < 0 is, is irrigatie nodig",
          "steps-taken-to-calculate-duration": "On de exacte duur te berekenen werd het volgende gedaan",
          "precipitation-rate-defined-as": "De neerslag is",
          "duration-is-calculated-as": "De duur is",
          bucket: "voorraad",
          "precipitation-rate-variable": "neerslag",
          "multiplier-is-applied": "De vermenigvuldiger wordt toegepast. Deze is",
          "duration-after-multiplier-is": "dus de duur is",
          "maximum-duration-is-applied": "De maximum duur wordt toegepast. Deze is",
          "duration-after-maximum-duration-is": "dus de duur is",
          "lead-time-is-applied": "As laatste wordt de aanlooptijd toegepast. Deze is",
          "duration-after-lead-time-is": "dus de uiteindelijke duur is",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Omdat de voorraad >= 0 is er geen irrigatie nodig en is de duur gelijk aan",
          "maximum-bucket-is": "maximale voorraad grootte is"
        }
      }
    },
    ra = {
      pyeto: {
        description: "Bereken duur op basis van de FAU56 formule en de PyETO library"
      },
      static: {
        description: "Module met instelbare verandering"
      },
      passthrough: {
        description: "Geeft waarde van ET sensor as verandering terug"
      }
    },
    oa = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatische berekening van irrigatietijd",
            description: "Bij het berekenen wordt de verzamelde weersinformatie gebruikt om the voorraad en irrigatieduur per zone aan te passen. Daarna wordt de verzamelde weersinformatie verwijderd.",
            labels: {
              "auto-calc-enabled": "Automatisch irrigatietijd berekening voor elke zone",
              "auto-calc-time": "Berekenen op"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Let op: het automatisch bijwerken van weersinformatie vind plaats op of na de automatische berekening van irrigatietijd"
            },
            header: "Automatisch bijwerken van weersinformatie",
            description: "Verzamel en bewaar weersinformatie automatisch. Weersinformatie is nodig om vorraad en irrigatieduur per zone te berekenen.",
            labels: {
              "auto-update-enabled": "Automatisch weersinformatie bijwerken",
              "auto-update-delay": "Vertraging",
              "auto-update-interval": "Sensor data bijwerken elke"
            },
            options: {
              days: "dagen",
              hours: "uren",
              minutes: "minuten"
            }
          },
          "automatic-clear": {
            header: "Automatisch weersinformatie opruimen",
            description: "Verwijder weersinformatie op het ingestelde moment. Dit zorgt ervoor dat er geen weersinformatie van de vorige dag gebruikt kan worden voor berekeningen. Let op: verwijder geen weersinformatie voordat de berekening heeft plaatsgevonden. Gebruik deze optie als je verwacht dat er weersinformatie zal worden verzameld nadat de berekeningen voor de dag gedaan zijn. Verwijder weersinformatie zo laat mogelijk op de dag.",
            labels: {
              "automatic-clear-enabled": "Automatisch weersinformatie verwijderen",
              "automatic-clear-time": "Verwijder weersinformatie om"
            }
          }
        },
        description: "Dit zijn de algemene instellingen.",
        title: "Algemeen"
      },
      help: {
        title: "Hulp",
        cards: {
          "how-to-get-help": {
            title: "Hulp vragen",
            "first-read-the": "Allereerst, lees de",
            wiki: "Wiki",
            "if-you-still-need-help": "Als je hierna nog steeds hulp nodig hebt, laat een bericht achter op het",
            "community-forum": "Community forum",
            "or-open-a": "of open een",
            "github-issue": "Github Issue",
            "english-only": "alleen Engels"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Toevoegen"
            },
            header: "Voeg sensorgroep toe"
          },
          mapping: {
            aggregates: {
              average: "Gemiddelde",
              first: "Eerste",
              last: "Laatste",
              maximum: "Maximum",
              median: "Mediaan",
              minimum: "Minimum",
              sum: "Totaal"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "Deze sensorgroep kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."
            },
            items: {
              dewpoint: "Dauwpunt",
              evapotranspiration: "Verdamping",
              humidity: "Vochtigheid",
              "maximum temperature": "Maximum temperatuur",
              "minimum temperature": "Minimum temperatuur",
              precipitation: "Totale neerslag",
              pressure: "Druk",
              "solar radiation": "Zonnestraling",
              temperature: "Temperatuur",
              windspeed: "Wind snelheid"
            },
            pressure_types: {
              absolute: "absoluut",
              relative: "relatief"
            },
            "pressure-type": "Druk is",
            "sensor-aggregate-of-sensor-values-to-calculate": "van de sensor waardes om irrigatietijd te berekenen",
            "sensor-aggregate-use-the": "Gebruik de/het",
            "sensor-entity": "Sensor entiteit",
            "input-units": "Invoer geeft waardes in",
            static_value: "Waarde",
            source: "Bron",
            sources: {
              none: "Geen",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Vaste waarde"
            }
          }
        },
        description: "Voeg een of meer sensorgroepen toe die weergegevens ophalen van Weather service, van sensoren of een combinatie. Elke sensorgroep kan worden gebruikt voor een of meerdere zones",
        labels: {
          "mapping-name": "Name"
        },
        no_items: "Er zijn nog geen sensorgroepen.",
        title: "Sensorgroepen"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Toevoegen"
            },
            header: "Voeg module toe"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "Deze module kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt."
            },
            labels: {
              configuration: "Instellingen",
              required: "verplicht veld"
            },
            "translated-options": {
              DontEstimate: "Niet berekenen",
              EstimateFromSunHours: "Gebaseerd op zon uren",
              EstimateFromTemp: "Gebaseerd op temperatuur"
            }
          }
        },
        description: "Voeg een of meerdere modules toe. Modules berekenen irrigatietijd. Elke module heeft zijn eigen configuratie and kan worden gebruikt voor het berekening van irrigatietijd voor een of meerdere zones.",
        no_items: "Er zijn nog geen modules.",
        title: "Modules"
      },
      zones: {
        actions: {
          add: "Toevoegen",
          calculate: "Bereken",
          information: "Informatie",
          update: "Bijwerken",
          "reset-bucket": "Leeg voorraad"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Toevoegen"
            },
            header: "Voeg zone toe"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Bereken alle zones",
              "update-all": "Werk alle zone data bij",
              "reset-all-buckets": "Leeg alle voorraden",
              "clear-all-weatherdata": "Verwijder alle weersinformatie"
            },
            header: "Acties voor alle zones"
          }
        },
        description: "Voeg een of meerdere zones toe. Per zone wordt de irrigatietijd berekend, afhankelijk van de afmeting, doorvoer, status, module en sensorgroep.",
        labels: {
          bucket: "Voorraad",
          duration: "Irrigatieduur",
          "lead-time": "Aanlooptijd",
          mapping: "Sensorgroep",
          "maximum-duration": "Maximale duur",
          multiplier: "Vermenigvuldiger",
          name: "Naam",
          size: "Afmeting",
          state: "Status",
          states: {
            automatic: "Automatisch",
            disabled: "Uit",
            manual: "Manueel"
          },
          throughput: "Doorvoer",
          "maximum-bucket": "Maximale voorraad",
          last_calculated: "Berekend op",
          "data-last-updated": "Bijgewerkt op",
          "data-number-of-data-points": "Aantal datapunten"
        },
        no_items: "Er zijn nog geen zones.",
        title: "Zones"
      }
    },
    la = "Smart Irrigation",
    ua = {
      common: ia,
      defaults: na,
      module: sa,
      calcmodules: ra,
      panels: oa,
      title: la
    },
    da = Object.freeze({
      __proto__: null,
      common: ia,
      defaults: na,
      module: sa,
      calcmodules: ra,
      panels: oa,
      title: la,
      default: ua
    }),
    ca = {
      actions: {
        delete: "Slett"
      },
      labels: {
        module: "Modul",
        no: "Nei",
        select: "Velg",
        yes: "Ja"
      },
      attributes: {
        size: "størrelse",
        throughput: "kapasitet",
        state: "status"
      }
    },
    ha = {
      "default-zone": "Standard sone",
      "default-mapping": "Standard sensorguppe"
    },
    pa = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "Merk: Denne forklaringen bruker '.' som desimaltegn og viser avrundede verdier. Modulen returnerte evapotranspirasjonsunderskudd på",
          "bucket-was": "Bucket var",
          "new-bucket-values-is": "Ny bucket verdien er",
          "old-bucket-variable": "gammel_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary": "Siden bucket < 0, Vanning er nødvendig.",
          "steps-taken-to-calculate-duration": "For å beregne nøyaktig varighet, ble følgende trinn utført",
          "precipitation-rate-defined-as": "Nedbørshastigheten er definert som",
          "duration-is-calculated-as": "Varigheten beregnes som",
          bucket: "bucket",
          "precipitation-rate-variable": "nedbørshastighet",
          "multiplier-is-applied": "Nå blir multiplikatoren brukt. Multiplikatoren er",
          "duration-after-multiplier-is": "derfor er varigheten",
          "maximum-duration-is-applied": "Deretter blir den maksimale varigheten brukt. Den maksimale varigheten er",
          "duration-after-maximum-duration-is": "derfor er varigheten",
          "lead-time-is-applied": "Til slutt blir ledetiden brukt. Ledetiden er",
          "duration-after-lead-time-is": "derfor er den endelige varigheten",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Siden bucket >= 0, Ingen vanning er nødvendig, og varigheten er satt til",
          "maximum-bucket-is": "maksimum bucket stærrelse er"
        }
      }
    },
    ma = {
      pyeto: {
        description: "Beregn varigheten basert på FAO56-beregningen fra PyETO-biblioteket"
      },
      static: {
        description: "'Dummy'-modul med en statisk konfigurerbar endring (delta)"
      },
      passthrough: {
        description: "En 'Passthrough'-modul som returnerer verdien av en Evapotranspiration-sensor som delta"
      }
    },
    ga = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatisk varighetsberegning",
            labels: {
              "auto-calc-enabled": "Beregn sonevarigheter automatisk",
              "auto-calc-time": "Beregn ved"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Advarsel: Oppdateringstidspunkt for værdata på eller etter beregningstidspunktet"
            },
            header: "Automatisk oppdatering av værdata",
            labels: {
              "auto-update-enabled": "Oppdater værdata automatisk",
              "auto-update-first-update": "(Første) Oppdatering kl",
              "auto-update-interval": "Oppdater sensordata hvert"
            },
            options: {
              days: "dager",
              hours: "timer",
              minutes: "minutter"
            }
          }
        },
        description: "Denne siden gir globale innstillinger.",
        title: "Generelt"
      },
      help: {
        title: "Hjelp",
        cards: {
          "how-to-get-help": {
            title: "Hvordan få hjelp",
            "first-read-the": "Først, les",
            wiki: "Wikien",
            "if-you-still-need-help": "Hvis du fremdeles trenger hjelp, ta kontakt på",
            "community-forum": "Fellesskapsforumet",
            "or-open-a": "eller åpne en",
            "github-issue": "Github-sak",
            "english-only": "Kun på engelsk"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Legg til sensorguppe"
            },
            header: "Legg til sensorgupper"
          },
          mapping: {
            aggregates: {
              average: "Gjennomsnitt",
              first: "Første",
              last: "Siste",
              maximum: "Maksimum",
              median: "Median",
              minimum: "Minimum",
              sum: "Sum"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "Du kan ikke slette denne sensorguppen fordi minst én sone bruker den."
            },
            items: {
              dewpoint: "Duggpunkt",
              evapotranspiration: "Evapotranspirasjon",
              humidity: "Luftfuktighet",
              "maximum temperature": "Maksimumstemperatur",
              "minimum temperature": "Minimumstemperatur",
              precipitation: "Total nedbør",
              pressure: "Trykk",
              "solar radiation": "Solstråling",
              temperature: "Temperatur",
              windspeed: "Vindhastighet"
            },
            "sensor-aggregate-of-sensor-values-to-calculate": "av sensordata for å beregne varighet",
            "sensor-aggregate-use-the": "Bruk",
            "sensor-entity": "Sensorenhet",
            static_value: "Verdi",
            "input-units": "Inndata gir verdier i",
            source: "Kilde",
            sources: {
              none: "Ingen",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Statisk verdi"
            }
          }
        },
        description: "Legg til en eller flere sensorgupper som henter værdata fra Weather service, fra sensorer eller en kombinasjon av disse. Du kan tilordne hver sensorguppe til en eller flere soner",
        labels: {
          "mapping-name": "Navn"
        },
        no_items: "Det er ingen definerte sensorgupper ennå.",
        title: "Sensorgupper"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Legg til modul"
            },
            header: "Legg til modul"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "Du kan ikke slette denne modulen fordi minst én sone bruker den."
            },
            labels: {
              configuration: "Konfigurasjon",
              required: "indikerer et obligatorisk felt"
            },
            "translated-options": {
              DontEstimate: "Ikke beregn",
              EstimateFromSunHours: "Beregn fra soltimer",
              EstimateFromTemp: "Beregn fra temperatur"
            }
          }
        },
        description: "Legg til en eller flere moduler som beregner vanningsvarighet. Hver modul har sin egen konfigurasjon og kan brukes til å beregne varighet for en eller flere soner.",
        no_items: "Det er ingen definerte moduler ennå.",
        title: "Moduler"
      },
      zones: {
        actions: {
          add: "Legg til",
          calculate: "Beregn",
          information: "Informasjon",
          update: "Oppdater",
          "reset-bucket": "Nullstill bøtte"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Legg til sone"
            },
            header: "Legg til sone"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Beregn alle soner",
              "update-all": "Oppdater alle soner",
              "reset-all-buckets": "Nullstill alle bøtter"
            },
            header: "Handlinger på alle soner"
          }
        },
        description: "Spesifiser en eller flere vanningssoner her. Vanningens varighet beregnes per sone, avhengig av størrelse, gjennomstrømning, tilstand, modul og sensorguppe.",
        labels: {
          bucket: "Bøtte",
          duration: "Varighet",
          "lead-time": "Ledetid",
          mapping: "Sensorguppe",
          "maximum-duration": "Maksimal varighet",
          multiplier: "Multiplikator",
          name: "Navn",
          size: "Størrelse",
          state: "Tilstand",
          states: {
            automatic: "Automatisk",
            disabled: "Deaktivert",
            manual: "Manuell"
          },
          throughput: "Gjennomstrømning",
          "maximum-bucket": "Maksimal bøtte"
        },
        no_items: "Det er ingen definerte soner ennå.",
        title: "Soner"
      },
      title: "Smart vanning"
    },
    fa = {
      common: ca,
      defaults: ha,
      module: pa,
      calcmodules: ma,
      panels: ga
    },
    va = Object.freeze({
      __proto__: null,
      common: ca,
      defaults: ha,
      module: pa,
      calcmodules: ma,
      panels: ga,
      default: fa
    }),
    ba = {
      actions: {
        delete: "Zmazať"
      },
      labels: {
        module: "Modul",
        no: "Nie",
        select: "Zvoliť",
        yes: "Áno"
      },
      attributes: {
        size: "size",
        throughput: "priepustnosť",
        state: "stav",
        bucket: "nádoba"
      }
    },
    ya = {
      "default-zone": "Predvolená zóna",
      "default-mapping": "Predvolená skupina snímačov"
    },
    _a = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency": "Poznámka: toto vysvetlenie používa '.' ako oddeľovač desatinných miest zobrazuje zaokrúhlené a metrické hodnoty. Modul vrátil nedostatok evapotranspirácie",
          "bucket-was": "Vedro bolo",
          "new-bucket-values-is": "Hodnota nového vedra je",
          "old-bucket-variable": "staré_vedro",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary": "Keďže vedro < 0, je potrebné zavlažovanie",
          "steps-taken-to-calculate-duration": "Na výpočet presného trvania sa vykonali nasledujúce kroky",
          "precipitation-rate-defined-as": "Miera zrážok je definovaná ako",
          "duration-is-calculated-as": "Trvanie sa vypočíta ako",
          bucket: "vedro",
          "precipitation-rate-variable": "úhrn zrážok",
          "multiplier-is-applied": "Teraz sa použije multiplikátor. Násobiteľ je",
          "duration-after-multiplier-is": "teda trvanie je",
          "maximum-duration-is-applied": "Potom sa použije maximálne trvanie. Maximálne trvanie je",
          "duration-after-maximum-duration-is": "teda trvanie je",
          "lead-time-is-applied": "Nakoniec sa použije dodacia lehota. Dodacia lehota je",
          "duration-after-lead-time-is": "teda konečné trvanie je",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary": "Keďže vedro >= 0, nie je potrebné žiadne zavlažovanie a trvanie je nastavené na",
          "maximum-bucket-is": "maximálna veľkosť vedra je"
        }
      }
    },
    wa = {
      pyeto: {
        description: "Vypočítajte trvanie na základe výpočtu FAO56 z knižnice PyETO"
      },
      static: {
        description: "'Atrapa' modul so statickou konfigurovateľnou deltou"
      },
      passthrough: {
        description: "Priechodný modul, ktorý vracia hodnotu evapotranspiračného senzora ako delta"
      }
    },
    ka = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatický výpočet trvania",
            description: "Výpočet berie zhromaždené údaje o počasí až do tohto bodu a aktualizuje vedro pre každú automatickú zónu. Potom sa trvanie upraví na základe novej hodnoty segmentu a zhromaždené údaje o počasí sa odstránia.",
            labels: {
              "auto-calc-enabled": "Automaticky vypočítajte trvanie zón",
              "auto-calc-time": "Vypočítajte pri"
            }
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time": "Upozornenie: Čas aktualizácie údajov o počasí v čase výpočtu alebo po ňom"
            },
            header: "Automatic weather data update",
            description: "Automaticky zbierajte a ukladajte údaje o počasí. Údaje o počasí sú potrebné na výpočet segmentov zón a trvania.",
            labels: {
              "auto-update-enabled": "Automaticky aktualizovať údaje o počasí",
              "auto-update-delay": "Oneskorenie aktualizácie",
              "auto-update-interval": "Aktualizujte údaje snímača každý"
            },
            options: {
              days: "dni",
              hours: "hodiny",
              minutes: "minúty"
            }
          },
          "automatic-clear": {
            header: "Automatické orezávanie údajov o počasí",
            description: "Automaticky odstráňte zhromaždené údaje o počasí v nakonfigurovanom čase. Použite to, aby ste sa uistili, že nezostali žiadne údaje o počasí z predchádzajúcich dní. Neodstraňujte údaje o počasí pred výpočtom a túto možnosť použite iba vtedy, ak očakávate, že automatická aktualizácia bude zhromažďovať údaje o počasí až po výpočte na daný deň. V ideálnom prípade chcete prerezávať tak neskoro, ako je to možné.",
            labels: {
              "automatic-clear-enabled": "Automaticky vymazať zhromaždené údaje o počasí",
              "automatic-clear-time": "Vymazať údaje o počasí o"
            }
          }
        },
        description: "Táto stránka poskytuje globálne nastavenia.",
        title: "Všeobecné"
      },
      help: {
        title: "Pomoc",
        cards: {
          "how-to-get-help": {
            title: "Ako získať pomoc",
            "first-read-the": "Najprv si prečítajte",
            wiki: "Wiki",
            "if-you-still-need-help": "Ak stále potrebujete pomoc, obráťte sa na",
            "community-forum": "komunitné fórum",
            "or-open-a": "alebo otvorte a",
            "github-issue": "Problém Github",
            "english-only": "len anglicky"
          }
        }
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: {
              add: "Pridať skupinu snímačov"
            },
            header: "Pridajte skupiny senzorov"
          },
          mapping: {
            aggregates: {
              average: "Priemer",
              first: "Prvý",
              last: "Posledný",
              maximum: "Maximum",
              median: "Medián",
              minimum: "Minimum",
              sum: "Sum"
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it": "Túto skupinu senzorov nemôžete vymazať, pretože ju používa aspoň jedna zóna."
            },
            items: {
              dewpoint: "Rosný bod",
              evapotranspiration: "Evapotranspirácia",
              humidity: "Vlhkosť",
              "maximum temperature": "Maximálna teplota",
              "minimum temperature": "Minimálna teplota",
              precipitation: "Úhrn zrážok",
              pressure: "Tlak",
              "solar radiation": "Slnečné žiarenie",
              temperature: "Teplota",
              windspeed: "Rýchlosť vetra"
            },
            pressure_types: {
              absolute: "absolútne",
              relative: "relatítne"
            },
            "pressure-type": "Tlak je",
            "sensor-aggregate-of-sensor-values-to-calculate": "hodnôt snímača na výpočet trvania",
            "sensor-aggregate-use-the": "Použiť",
            "sensor-entity": "Entita snímača",
            static_value: "Hodnota",
            "input-units": "Vstup poskytuje hodnoty v",
            source: "Zdroj",
            sources: {
              none: "Nie je",
              weather_service: "Weather service",
              sensor: "Snímač",
              static: "Statická hodnota"
            }
          }
        },
        description: "Pridajte jednu alebo viac skupín senzorov, ktoré získavajú údaje o počasí z Weather service, zo senzorov alebo ich kombinácie. Každú skupinu senzorov môžete namapovať na jednu alebo viac zón",
        labels: {
          "mapping-name": "Názov"
        },
        no_items: "Zatiaľ nie je definovaná žiadna skupina senzorov.",
        title: "Skupiny senzorov"
      },
      modules: {
        cards: {
          "add-module": {
            actions: {
              add: "Pridať modul"
            },
            header: "Pridať modul"
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it": "Tento modul nemôžete vymazať, pretože ho používa aspoň jedna zóna."
            },
            labels: {
              configuration: "Konfigurácia",
              required: "označuje povinné pole"
            },
            "translated-options": {
              DontEstimate: "Bez odhadu",
              EstimateFromSunHours: "Odhad zo slnečných hodín",
              EstimateFromTemp: "Odhad z teploty"
            }
          }
        },
        description: "Pridajte jeden alebo viac modulov, ktoré vypočítavajú trvanie zavlažovania. Každý modul sa dodáva s vlastnou konfiguráciou a možno ho použiť na výpočet trvania pre jednu alebo viac zón.",
        no_items: "Zatiaľ nie sú definované žiadne moduly.",
        title: "Moduly"
      },
      zones: {
        actions: {
          add: "Pridať",
          calculate: "Vypočítať",
          information: "Informácia",
          update: "Aktualizovať",
          "reset-bucket": "Resetovať vedro"
        },
        cards: {
          "add-zone": {
            actions: {
              add: "Pridať zónu"
            },
            header: "Pridať zónu"
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Vypočítajte všetky zóny",
              "update-all": "Aktualizujte všetky zóny",
              "reset-all-buckets": "Obnovte všetky vedrá",
              "clear-all-weatherdata": "Vymazať všetky údaje o počasí"
            },
            header: "Akcie vo všetkých zónach"
          }
        },
        description: "Tu špecifikujte jednu alebo viac zavlažovacích zón. Trvanie zavlažovania sa vypočíta pre zónu v závislosti od veľkosti, výkonu, stavu, modulu a skupiny senzorov.",
        labels: {
          bucket: "Vedro",
          duration: "Trvanie",
          "lead-time": "Dodacia lehota",
          mapping: "Skupina senzorov",
          "maximum-duration": "Maximálne trvanie",
          multiplier: "Násobiteľ",
          name: "Názov",
          size: "Veľkosť",
          state: "Stav",
          states: {
            automatic: "Automatický",
            disabled: "Zakázaný",
            manual: "Manuány"
          },
          throughput: "Priepustnosť",
          "maximum-bucket": "Maximálne vedro",
          last_calculated: "Naposledy vypočítané",
          "data-last-updated": "Údaje boli naposledy aktualizované",
          "data-number-of-data-points": "Počet údajových bodov"
        },
        no_items: "Zatiaľ nie sú definované žiadne zóny.",
        title: "Zóny"
      }
    },
    $a = "Inteligentné zavlažovanie",
    Sa = {
      common: ba,
      defaults: ya,
      module: _a,
      calcmodules: wa,
      panels: ka,
      title: $a
    },
    Ea = Object.freeze({
      __proto__: null,
      common: ba,
      defaults: ya,
      module: _a,
      calcmodules: wa,
      panels: ka,
      title: $a,
      default: Sa
    });
  function Ma(e, t) {
    var a = t && t.cache ? t.cache : Na,
      i = t && t.serializer ? t.serializer : Oa;
    return (t && t.strategy ? t.strategy : za)(e, {
      cache: a,
      serializer: i
    });
  }
  function Aa(e, t, a, i) {
    var n,
      s = null == (n = i) || "number" == typeof n || "boolean" == typeof n ? i : a(i),
      r = t.get(s);
    return void 0 === r && (r = e.call(this, i), t.set(s, r)), r;
  }
  function xa(e, t, a) {
    var i = Array.prototype.slice.call(arguments, 3),
      n = a(i),
      s = t.get(n);
    return void 0 === s && (s = e.apply(this, i), t.set(n, s)), s;
  }
  function Ta(e, t, a, i, n) {
    return a.bind(t, e, i, n);
  }
  function za(e, t) {
    return Ta(e, this, 1 === e.length ? Aa : xa, t.cache.create(), t.serializer);
  }
  var Oa = function () {
    return JSON.stringify(arguments);
  };
  function Da() {
    this.cache = Object.create(null);
  }
  Da.prototype.get = function (e) {
    return this.cache[e];
  }, Da.prototype.set = function (e, t) {
    this.cache[e] = t;
  };
  var Ha,
    Ca,
    Pa,
    Na = {
      create: function () {
        return new Da();
      }
    },
    La = {
      variadic: function (e, t) {
        return Ta(e, this, xa, t.cache.create(), t.serializer);
      },
      monadic: function (e, t) {
        return Ta(e, this, Aa, t.cache.create(), t.serializer);
      }
    };
  function ja(e) {
    return e.type === Ca.literal;
  }
  function Ia(e) {
    return e.type === Ca.argument;
  }
  function Ra(e) {
    return e.type === Ca.number;
  }
  function Ba(e) {
    return e.type === Ca.date;
  }
  function Ua(e) {
    return e.type === Ca.time;
  }
  function Ya(e) {
    return e.type === Ca.select;
  }
  function Fa(e) {
    return e.type === Ca.plural;
  }
  function Va(e) {
    return e.type === Ca.pound;
  }
  function Wa(e) {
    return e.type === Ca.tag;
  }
  function Ga(e) {
    return !(!e || "object" != typeof e || e.type !== Pa.number);
  }
  function Za(e) {
    return !(!e || "object" != typeof e || e.type !== Pa.dateTime);
  }
  !function (e) {
    e[e.EXPECT_ARGUMENT_CLOSING_BRACE = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE", e[e.EMPTY_ARGUMENT = 2] = "EMPTY_ARGUMENT", e[e.MALFORMED_ARGUMENT = 3] = "MALFORMED_ARGUMENT", e[e.EXPECT_ARGUMENT_TYPE = 4] = "EXPECT_ARGUMENT_TYPE", e[e.INVALID_ARGUMENT_TYPE = 5] = "INVALID_ARGUMENT_TYPE", e[e.EXPECT_ARGUMENT_STYLE = 6] = "EXPECT_ARGUMENT_STYLE", e[e.INVALID_NUMBER_SKELETON = 7] = "INVALID_NUMBER_SKELETON", e[e.INVALID_DATE_TIME_SKELETON = 8] = "INVALID_DATE_TIME_SKELETON", e[e.EXPECT_NUMBER_SKELETON = 9] = "EXPECT_NUMBER_SKELETON", e[e.EXPECT_DATE_TIME_SKELETON = 10] = "EXPECT_DATE_TIME_SKELETON", e[e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE", e[e.EXPECT_SELECT_ARGUMENT_OPTIONS = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS", e[e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE", e[e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE", e[e.EXPECT_SELECT_ARGUMENT_SELECTOR = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR", e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR", e[e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT", e[e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT", e[e.INVALID_PLURAL_ARGUMENT_SELECTOR = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR", e[e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR", e[e.DUPLICATE_SELECT_ARGUMENT_SELECTOR = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR", e[e.MISSING_OTHER_CLAUSE = 22] = "MISSING_OTHER_CLAUSE", e[e.INVALID_TAG = 23] = "INVALID_TAG", e[e.INVALID_TAG_NAME = 25] = "INVALID_TAG_NAME", e[e.UNMATCHED_CLOSING_TAG = 26] = "UNMATCHED_CLOSING_TAG", e[e.UNCLOSED_TAG = 27] = "UNCLOSED_TAG";
  }(Ha || (Ha = {})), function (e) {
    e[e.literal = 0] = "literal", e[e.argument = 1] = "argument", e[e.number = 2] = "number", e[e.date = 3] = "date", e[e.time = 4] = "time", e[e.select = 5] = "select", e[e.plural = 6] = "plural", e[e.pound = 7] = "pound", e[e.tag = 8] = "tag";
  }(Ca || (Ca = {})), function (e) {
    e[e.number = 0] = "number", e[e.dateTime = 1] = "dateTime";
  }(Pa || (Pa = {}));
  var qa = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
    Ka = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
  function Xa(e) {
    var t = {};
    return e.replace(Ka, function (e) {
      var a = e.length;
      switch (e[0]) {
        case "G":
          t.era = 4 === a ? "long" : 5 === a ? "narrow" : "short";
          break;
        case "y":
          t.year = 2 === a ? "2-digit" : "numeric";
          break;
        case "Y":
        case "u":
        case "U":
        case "r":
          throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");
        case "q":
        case "Q":
          throw new RangeError("`q/Q` (quarter) patterns are not supported");
        case "M":
        case "L":
          t.month = ["numeric", "2-digit", "short", "long", "narrow"][a - 1];
          break;
        case "w":
        case "W":
          throw new RangeError("`w/W` (week) patterns are not supported");
        case "d":
          t.day = ["numeric", "2-digit"][a - 1];
          break;
        case "D":
        case "F":
        case "g":
          throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");
        case "E":
          t.weekday = 4 === a ? "long" : 5 === a ? "narrow" : "short";
          break;
        case "e":
          if (a < 4) throw new RangeError("`e..eee` (weekday) patterns are not supported");
          t.weekday = ["short", "long", "narrow", "short"][a - 4];
          break;
        case "c":
          if (a < 4) throw new RangeError("`c..ccc` (weekday) patterns are not supported");
          t.weekday = ["short", "long", "narrow", "short"][a - 4];
          break;
        case "a":
          t.hour12 = !0;
          break;
        case "b":
        case "B":
          throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");
        case "h":
          t.hourCycle = "h12", t.hour = ["numeric", "2-digit"][a - 1];
          break;
        case "H":
          t.hourCycle = "h23", t.hour = ["numeric", "2-digit"][a - 1];
          break;
        case "K":
          t.hourCycle = "h11", t.hour = ["numeric", "2-digit"][a - 1];
          break;
        case "k":
          t.hourCycle = "h24", t.hour = ["numeric", "2-digit"][a - 1];
          break;
        case "j":
        case "J":
        case "C":
          throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");
        case "m":
          t.minute = ["numeric", "2-digit"][a - 1];
          break;
        case "s":
          t.second = ["numeric", "2-digit"][a - 1];
          break;
        case "S":
        case "A":
          throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");
        case "z":
          t.timeZoneName = a < 4 ? "short" : "long";
          break;
        case "Z":
        case "O":
        case "v":
        case "V":
        case "X":
        case "x":
          throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead");
      }
      return "";
    }), t;
  }
  var Ja = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
  var Qa = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,
    ei = /^(@+)?(\+|#+)?[rs]?$/g,
    ti = /(\*)(0+)|(#+)(0+)|(0+)/g,
    ai = /^(0+)$/;
  function ii(e) {
    var t = {};
    return "r" === e[e.length - 1] ? t.roundingPriority = "morePrecision" : "s" === e[e.length - 1] && (t.roundingPriority = "lessPrecision"), e.replace(ei, function (e, a, i) {
      return "string" != typeof i ? (t.minimumSignificantDigits = a.length, t.maximumSignificantDigits = a.length) : "+" === i ? t.minimumSignificantDigits = a.length : "#" === a[0] ? t.maximumSignificantDigits = a.length : (t.minimumSignificantDigits = a.length, t.maximumSignificantDigits = a.length + ("string" == typeof i ? i.length : 0)), "";
    }), t;
  }
  function ni(e) {
    switch (e) {
      case "sign-auto":
        return {
          signDisplay: "auto"
        };
      case "sign-accounting":
      case "()":
        return {
          currencySign: "accounting"
        };
      case "sign-always":
      case "+!":
        return {
          signDisplay: "always"
        };
      case "sign-accounting-always":
      case "()!":
        return {
          signDisplay: "always",
          currencySign: "accounting"
        };
      case "sign-except-zero":
      case "+?":
        return {
          signDisplay: "exceptZero"
        };
      case "sign-accounting-except-zero":
      case "()?":
        return {
          signDisplay: "exceptZero",
          currencySign: "accounting"
        };
      case "sign-never":
      case "+_":
        return {
          signDisplay: "never"
        };
    }
  }
  function si(e) {
    var t;
    if ("E" === e[0] && "E" === e[1] ? (t = {
      notation: "engineering"
    }, e = e.slice(2)) : "E" === e[0] && (t = {
      notation: "scientific"
    }, e = e.slice(1)), t) {
      var a = e.slice(0, 2);
      if ("+!" === a ? (t.signDisplay = "always", e = e.slice(2)) : "+?" === a && (t.signDisplay = "exceptZero", e = e.slice(2)), !ai.test(e)) throw new Error("Malformed concise eng/scientific notation");
      t.minimumIntegerDigits = e.length;
    }
    return t;
  }
  function ri(e) {
    var t = ni(e);
    return t || {};
  }
  function oi(e) {
    for (var t = {}, a = 0, n = e; a < n.length; a++) {
      var s = n[a];
      switch (s.stem) {
        case "percent":
        case "%":
          t.style = "percent";
          continue;
        case "%x100":
          t.style = "percent", t.scale = 100;
          continue;
        case "currency":
          t.style = "currency", t.currency = s.options[0];
          continue;
        case "group-off":
        case ",_":
          t.useGrouping = !1;
          continue;
        case "precision-integer":
        case ".":
          t.maximumFractionDigits = 0;
          continue;
        case "measure-unit":
        case "unit":
          t.style = "unit", t.unit = s.options[0].replace(/^(.*?)-/, "");
          continue;
        case "compact-short":
        case "K":
          t.notation = "compact", t.compactDisplay = "short";
          continue;
        case "compact-long":
        case "KK":
          t.notation = "compact", t.compactDisplay = "long";
          continue;
        case "scientific":
          t = i(i(i({}, t), {
            notation: "scientific"
          }), s.options.reduce(function (e, t) {
            return i(i({}, e), ri(t));
          }, {}));
          continue;
        case "engineering":
          t = i(i(i({}, t), {
            notation: "engineering"
          }), s.options.reduce(function (e, t) {
            return i(i({}, e), ri(t));
          }, {}));
          continue;
        case "notation-simple":
          t.notation = "standard";
          continue;
        case "unit-width-narrow":
          t.currencyDisplay = "narrowSymbol", t.unitDisplay = "narrow";
          continue;
        case "unit-width-short":
          t.currencyDisplay = "code", t.unitDisplay = "short";
          continue;
        case "unit-width-full-name":
          t.currencyDisplay = "name", t.unitDisplay = "long";
          continue;
        case "unit-width-iso-code":
          t.currencyDisplay = "symbol";
          continue;
        case "scale":
          t.scale = parseFloat(s.options[0]);
          continue;
        case "rounding-mode-floor":
          t.roundingMode = "floor";
          continue;
        case "rounding-mode-ceiling":
          t.roundingMode = "ceil";
          continue;
        case "rounding-mode-down":
          t.roundingMode = "trunc";
          continue;
        case "rounding-mode-up":
          t.roundingMode = "expand";
          continue;
        case "rounding-mode-half-even":
          t.roundingMode = "halfEven";
          continue;
        case "rounding-mode-half-down":
          t.roundingMode = "halfTrunc";
          continue;
        case "rounding-mode-half-up":
          t.roundingMode = "halfExpand";
          continue;
        case "integer-width":
          if (s.options.length > 1) throw new RangeError("integer-width stems only accept a single optional option");
          s.options[0].replace(ti, function (e, a, i, n, s, r) {
            if (a) t.minimumIntegerDigits = i.length;else {
              if (n && s) throw new Error("We currently do not support maximum integer digits");
              if (r) throw new Error("We currently do not support exact integer digits");
            }
            return "";
          });
          continue;
      }
      if (ai.test(s.stem)) t.minimumIntegerDigits = s.stem.length;else if (Qa.test(s.stem)) {
        if (s.options.length > 1) throw new RangeError("Fraction-precision stems only accept a single optional option");
        s.stem.replace(Qa, function (e, a, i, n, s, r) {
          return "*" === i ? t.minimumFractionDigits = a.length : n && "#" === n[0] ? t.maximumFractionDigits = n.length : s && r ? (t.minimumFractionDigits = s.length, t.maximumFractionDigits = s.length + r.length) : (t.minimumFractionDigits = a.length, t.maximumFractionDigits = a.length), "";
        });
        var r = s.options[0];
        "w" === r ? t = i(i({}, t), {
          trailingZeroDisplay: "stripIfInteger"
        }) : r && (t = i(i({}, t), ii(r)));
      } else if (ei.test(s.stem)) t = i(i({}, t), ii(s.stem));else {
        var o = ni(s.stem);
        o && (t = i(i({}, t), o));
        var l = si(s.stem);
        l && (t = i(i({}, t), l));
      }
    }
    return t;
  }
  var li,
    ui = {
      "001": ["H", "h"],
      419: ["h", "H", "hB", "hb"],
      AC: ["H", "h", "hb", "hB"],
      AD: ["H", "hB"],
      AE: ["h", "hB", "hb", "H"],
      AF: ["H", "hb", "hB", "h"],
      AG: ["h", "hb", "H", "hB"],
      AI: ["H", "h", "hb", "hB"],
      AL: ["h", "H", "hB"],
      AM: ["H", "hB"],
      AO: ["H", "hB"],
      AR: ["h", "H", "hB", "hb"],
      AS: ["h", "H"],
      AT: ["H", "hB"],
      AU: ["h", "hb", "H", "hB"],
      AW: ["H", "hB"],
      AX: ["H"],
      AZ: ["H", "hB", "h"],
      BA: ["H", "hB", "h"],
      BB: ["h", "hb", "H", "hB"],
      BD: ["h", "hB", "H"],
      BE: ["H", "hB"],
      BF: ["H", "hB"],
      BG: ["H", "hB", "h"],
      BH: ["h", "hB", "hb", "H"],
      BI: ["H", "h"],
      BJ: ["H", "hB"],
      BL: ["H", "hB"],
      BM: ["h", "hb", "H", "hB"],
      BN: ["hb", "hB", "h", "H"],
      BO: ["h", "H", "hB", "hb"],
      BQ: ["H"],
      BR: ["H", "hB"],
      BS: ["h", "hb", "H", "hB"],
      BT: ["h", "H"],
      BW: ["H", "h", "hb", "hB"],
      BY: ["H", "h"],
      BZ: ["H", "h", "hb", "hB"],
      CA: ["h", "hb", "H", "hB"],
      CC: ["H", "h", "hb", "hB"],
      CD: ["hB", "H"],
      CF: ["H", "h", "hB"],
      CG: ["H", "hB"],
      CH: ["H", "hB", "h"],
      CI: ["H", "hB"],
      CK: ["H", "h", "hb", "hB"],
      CL: ["h", "H", "hB", "hb"],
      CM: ["H", "h", "hB"],
      CN: ["H", "hB", "hb", "h"],
      CO: ["h", "H", "hB", "hb"],
      CP: ["H"],
      CR: ["h", "H", "hB", "hb"],
      CU: ["h", "H", "hB", "hb"],
      CV: ["H", "hB"],
      CW: ["H", "hB"],
      CX: ["H", "h", "hb", "hB"],
      CY: ["h", "H", "hb", "hB"],
      CZ: ["H"],
      DE: ["H", "hB"],
      DG: ["H", "h", "hb", "hB"],
      DJ: ["h", "H"],
      DK: ["H"],
      DM: ["h", "hb", "H", "hB"],
      DO: ["h", "H", "hB", "hb"],
      DZ: ["h", "hB", "hb", "H"],
      EA: ["H", "h", "hB", "hb"],
      EC: ["h", "H", "hB", "hb"],
      EE: ["H", "hB"],
      EG: ["h", "hB", "hb", "H"],
      EH: ["h", "hB", "hb", "H"],
      ER: ["h", "H"],
      ES: ["H", "hB", "h", "hb"],
      ET: ["hB", "hb", "h", "H"],
      FI: ["H"],
      FJ: ["h", "hb", "H", "hB"],
      FK: ["H", "h", "hb", "hB"],
      FM: ["h", "hb", "H", "hB"],
      FO: ["H", "h"],
      FR: ["H", "hB"],
      GA: ["H", "hB"],
      GB: ["H", "h", "hb", "hB"],
      GD: ["h", "hb", "H", "hB"],
      GE: ["H", "hB", "h"],
      GF: ["H", "hB"],
      GG: ["H", "h", "hb", "hB"],
      GH: ["h", "H"],
      GI: ["H", "h", "hb", "hB"],
      GL: ["H", "h"],
      GM: ["h", "hb", "H", "hB"],
      GN: ["H", "hB"],
      GP: ["H", "hB"],
      GQ: ["H", "hB", "h", "hb"],
      GR: ["h", "H", "hb", "hB"],
      GT: ["h", "H", "hB", "hb"],
      GU: ["h", "hb", "H", "hB"],
      GW: ["H", "hB"],
      GY: ["h", "hb", "H", "hB"],
      HK: ["h", "hB", "hb", "H"],
      HN: ["h", "H", "hB", "hb"],
      HR: ["H", "hB"],
      HU: ["H", "h"],
      IC: ["H", "h", "hB", "hb"],
      ID: ["H"],
      IE: ["H", "h", "hb", "hB"],
      IL: ["H", "hB"],
      IM: ["H", "h", "hb", "hB"],
      IN: ["h", "H"],
      IO: ["H", "h", "hb", "hB"],
      IQ: ["h", "hB", "hb", "H"],
      IR: ["hB", "H"],
      IS: ["H"],
      IT: ["H", "hB"],
      JE: ["H", "h", "hb", "hB"],
      JM: ["h", "hb", "H", "hB"],
      JO: ["h", "hB", "hb", "H"],
      JP: ["H", "K", "h"],
      KE: ["hB", "hb", "H", "h"],
      KG: ["H", "h", "hB", "hb"],
      KH: ["hB", "h", "H", "hb"],
      KI: ["h", "hb", "H", "hB"],
      KM: ["H", "h", "hB", "hb"],
      KN: ["h", "hb", "H", "hB"],
      KP: ["h", "H", "hB", "hb"],
      KR: ["h", "H", "hB", "hb"],
      KW: ["h", "hB", "hb", "H"],
      KY: ["h", "hb", "H", "hB"],
      KZ: ["H", "hB"],
      LA: ["H", "hb", "hB", "h"],
      LB: ["h", "hB", "hb", "H"],
      LC: ["h", "hb", "H", "hB"],
      LI: ["H", "hB", "h"],
      LK: ["H", "h", "hB", "hb"],
      LR: ["h", "hb", "H", "hB"],
      LS: ["h", "H"],
      LT: ["H", "h", "hb", "hB"],
      LU: ["H", "h", "hB"],
      LV: ["H", "hB", "hb", "h"],
      LY: ["h", "hB", "hb", "H"],
      MA: ["H", "h", "hB", "hb"],
      MC: ["H", "hB"],
      MD: ["H", "hB"],
      ME: ["H", "hB", "h"],
      MF: ["H", "hB"],
      MG: ["H", "h"],
      MH: ["h", "hb", "H", "hB"],
      MK: ["H", "h", "hb", "hB"],
      ML: ["H"],
      MM: ["hB", "hb", "H", "h"],
      MN: ["H", "h", "hb", "hB"],
      MO: ["h", "hB", "hb", "H"],
      MP: ["h", "hb", "H", "hB"],
      MQ: ["H", "hB"],
      MR: ["h", "hB", "hb", "H"],
      MS: ["H", "h", "hb", "hB"],
      MT: ["H", "h"],
      MU: ["H", "h"],
      MV: ["H", "h"],
      MW: ["h", "hb", "H", "hB"],
      MX: ["h", "H", "hB", "hb"],
      MY: ["hb", "hB", "h", "H"],
      MZ: ["H", "hB"],
      NA: ["h", "H", "hB", "hb"],
      NC: ["H", "hB"],
      NE: ["H"],
      NF: ["H", "h", "hb", "hB"],
      NG: ["H", "h", "hb", "hB"],
      NI: ["h", "H", "hB", "hb"],
      NL: ["H", "hB"],
      NO: ["H", "h"],
      NP: ["H", "h", "hB"],
      NR: ["H", "h", "hb", "hB"],
      NU: ["H", "h", "hb", "hB"],
      NZ: ["h", "hb", "H", "hB"],
      OM: ["h", "hB", "hb", "H"],
      PA: ["h", "H", "hB", "hb"],
      PE: ["h", "H", "hB", "hb"],
      PF: ["H", "h", "hB"],
      PG: ["h", "H"],
      PH: ["h", "hB", "hb", "H"],
      PK: ["h", "hB", "H"],
      PL: ["H", "h"],
      PM: ["H", "hB"],
      PN: ["H", "h", "hb", "hB"],
      PR: ["h", "H", "hB", "hb"],
      PS: ["h", "hB", "hb", "H"],
      PT: ["H", "hB"],
      PW: ["h", "H"],
      PY: ["h", "H", "hB", "hb"],
      QA: ["h", "hB", "hb", "H"],
      RE: ["H", "hB"],
      RO: ["H", "hB"],
      RS: ["H", "hB", "h"],
      RU: ["H"],
      RW: ["H", "h"],
      SA: ["h", "hB", "hb", "H"],
      SB: ["h", "hb", "H", "hB"],
      SC: ["H", "h", "hB"],
      SD: ["h", "hB", "hb", "H"],
      SE: ["H"],
      SG: ["h", "hb", "H", "hB"],
      SH: ["H", "h", "hb", "hB"],
      SI: ["H", "hB"],
      SJ: ["H"],
      SK: ["H"],
      SL: ["h", "hb", "H", "hB"],
      SM: ["H", "h", "hB"],
      SN: ["H", "h", "hB"],
      SO: ["h", "H"],
      SR: ["H", "hB"],
      SS: ["h", "hb", "H", "hB"],
      ST: ["H", "hB"],
      SV: ["h", "H", "hB", "hb"],
      SX: ["H", "h", "hb", "hB"],
      SY: ["h", "hB", "hb", "H"],
      SZ: ["h", "hb", "H", "hB"],
      TA: ["H", "h", "hb", "hB"],
      TC: ["h", "hb", "H", "hB"],
      TD: ["h", "H", "hB"],
      TF: ["H", "h", "hB"],
      TG: ["H", "hB"],
      TH: ["H", "h"],
      TJ: ["H", "h"],
      TL: ["H", "hB", "hb", "h"],
      TM: ["H", "h"],
      TN: ["h", "hB", "hb", "H"],
      TO: ["h", "H"],
      TR: ["H", "hB"],
      TT: ["h", "hb", "H", "hB"],
      TW: ["hB", "hb", "h", "H"],
      TZ: ["hB", "hb", "H", "h"],
      UA: ["H", "hB", "h"],
      UG: ["hB", "hb", "H", "h"],
      UM: ["h", "hb", "H", "hB"],
      US: ["h", "hb", "H", "hB"],
      UY: ["h", "H", "hB", "hb"],
      UZ: ["H", "hB", "h"],
      VA: ["H", "h", "hB"],
      VC: ["h", "hb", "H", "hB"],
      VE: ["h", "H", "hB", "hb"],
      VG: ["h", "hb", "H", "hB"],
      VI: ["h", "hb", "H", "hB"],
      VN: ["H", "h"],
      VU: ["h", "H"],
      WF: ["H", "hB"],
      WS: ["h", "H"],
      XK: ["H", "hB", "h"],
      YE: ["h", "hB", "hb", "H"],
      YT: ["H", "hB"],
      ZA: ["H", "h", "hb", "hB"],
      ZM: ["h", "hb", "H", "hB"],
      ZW: ["H", "h"],
      "af-ZA": ["H", "h", "hB", "hb"],
      "ar-001": ["h", "hB", "hb", "H"],
      "ca-ES": ["H", "h", "hB"],
      "en-001": ["h", "hb", "H", "hB"],
      "en-HK": ["h", "hb", "H", "hB"],
      "en-IL": ["H", "h", "hb", "hB"],
      "en-MY": ["h", "hb", "H", "hB"],
      "es-BR": ["H", "h", "hB", "hb"],
      "es-ES": ["H", "h", "hB", "hb"],
      "es-GQ": ["H", "h", "hB", "hb"],
      "fr-CA": ["H", "h", "hB"],
      "gl-ES": ["H", "h", "hB"],
      "gu-IN": ["hB", "hb", "h", "H"],
      "hi-IN": ["hB", "h", "H"],
      "it-CH": ["H", "h", "hB"],
      "it-IT": ["H", "h", "hB"],
      "kn-IN": ["hB", "h", "H"],
      "ml-IN": ["hB", "h", "H"],
      "mr-IN": ["hB", "hb", "h", "H"],
      "pa-IN": ["hB", "hb", "h", "H"],
      "ta-IN": ["hB", "h", "hb", "H"],
      "te-IN": ["hB", "h", "H"],
      "zu-ZA": ["H", "hB", "hb", "h"]
    };
  function di(e) {
    var t = e.hourCycle;
    if (void 0 === t && e.hourCycles && e.hourCycles.length && (t = e.hourCycles[0]), t) switch (t) {
      case "h24":
        return "k";
      case "h23":
        return "H";
      case "h12":
        return "h";
      case "h11":
        return "K";
      default:
        throw new Error("Invalid hourCycle");
    }
    var a,
      i = e.language;
    return "root" !== i && (a = e.maximize().region), (ui[a || ""] || ui[i || ""] || ui["".concat(i, "-001")] || ui["001"])[0];
  }
  var ci = new RegExp("^".concat(qa.source, "*")),
    hi = new RegExp("".concat(qa.source, "*$"));
  function pi(e, t) {
    return {
      start: e,
      end: t
    };
  }
  var mi = !!String.prototype.startsWith && "_a".startsWith("a", 1),
    gi = !!String.fromCodePoint,
    fi = !!Object.fromEntries,
    vi = !!String.prototype.codePointAt,
    bi = !!String.prototype.trimStart,
    yi = !!String.prototype.trimEnd,
    _i = !!Number.isSafeInteger ? Number.isSafeInteger : function (e) {
      return "number" == typeof e && isFinite(e) && Math.floor(e) === e && Math.abs(e) <= 9007199254740991;
    },
    wi = !0;
  try {
    wi = "a" === (null === (li = Ti("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu").exec("a")) || void 0 === li ? void 0 : li[0]);
  } catch (L) {
    wi = !1;
  }
  var ki,
    $i = mi ? function (e, t, a) {
      return e.startsWith(t, a);
    } : function (e, t, a) {
      return e.slice(a, a + t.length) === t;
    },
    Si = gi ? String.fromCodePoint : function () {
      for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
      for (var a, i = "", n = e.length, s = 0; n > s;) {
        if ((a = e[s++]) > 1114111) throw RangeError(a + " is not a valid code point");
        i += a < 65536 ? String.fromCharCode(a) : String.fromCharCode(55296 + ((a -= 65536) >> 10), a % 1024 + 56320);
      }
      return i;
    },
    Ei = fi ? Object.fromEntries : function (e) {
      for (var t = {}, a = 0, i = e; a < i.length; a++) {
        var n = i[a],
          s = n[0],
          r = n[1];
        t[s] = r;
      }
      return t;
    },
    Mi = vi ? function (e, t) {
      return e.codePointAt(t);
    } : function (e, t) {
      var a = e.length;
      if (!(t < 0 || t >= a)) {
        var i,
          n = e.charCodeAt(t);
        return n < 55296 || n > 56319 || t + 1 === a || (i = e.charCodeAt(t + 1)) < 56320 || i > 57343 ? n : i - 56320 + (n - 55296 << 10) + 65536;
      }
    },
    Ai = bi ? function (e) {
      return e.trimStart();
    } : function (e) {
      return e.replace(ci, "");
    },
    xi = yi ? function (e) {
      return e.trimEnd();
    } : function (e) {
      return e.replace(hi, "");
    };
  function Ti(e, t) {
    return new RegExp(e, t);
  }
  if (wi) {
    var zi = Ti("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
    ki = function (e, t) {
      var a;
      return zi.lastIndex = t, null !== (a = zi.exec(e)[1]) && void 0 !== a ? a : "";
    };
  } else ki = function (e, t) {
    for (var a = [];;) {
      var i = Mi(e, t);
      if (void 0 === i || Pi(i) || Ni(i)) break;
      a.push(i), t += i >= 65536 ? 2 : 1;
    }
    return Si.apply(void 0, a);
  };
  var Oi,
    Di = function () {
      function e(e, t) {
        void 0 === t && (t = {}), this.message = e, this.position = {
          offset: 0,
          line: 1,
          column: 1
        }, this.ignoreTag = !!t.ignoreTag, this.locale = t.locale, this.requiresOtherClause = !!t.requiresOtherClause, this.shouldParseSkeletons = !!t.shouldParseSkeletons;
      }
      return e.prototype.parse = function () {
        if (0 !== this.offset()) throw Error("parser can only be used once");
        return this.parseMessage(0, "", !1);
      }, e.prototype.parseMessage = function (e, t, a) {
        for (var i = []; !this.isEOF();) {
          var n = this.char();
          if (123 === n) {
            if ((s = this.parseArgument(e, a)).err) return s;
            i.push(s.val);
          } else {
            if (125 === n && e > 0) break;
            if (35 !== n || "plural" !== t && "selectordinal" !== t) {
              if (60 === n && !this.ignoreTag && 47 === this.peek()) {
                if (a) break;
                return this.error(Ha.UNMATCHED_CLOSING_TAG, pi(this.clonePosition(), this.clonePosition()));
              }
              if (60 === n && !this.ignoreTag && Hi(this.peek() || 0)) {
                if ((s = this.parseTag(e, t)).err) return s;
                i.push(s.val);
              } else {
                var s;
                if ((s = this.parseLiteral(e, t)).err) return s;
                i.push(s.val);
              }
            } else {
              var r = this.clonePosition();
              this.bump(), i.push({
                type: Ca.pound,
                location: pi(r, this.clonePosition())
              });
            }
          }
        }
        return {
          val: i,
          err: null
        };
      }, e.prototype.parseTag = function (e, t) {
        var a = this.clonePosition();
        this.bump();
        var i = this.parseTagName();
        if (this.bumpSpace(), this.bumpIf("/>")) return {
          val: {
            type: Ca.literal,
            value: "<".concat(i, "/>"),
            location: pi(a, this.clonePosition())
          },
          err: null
        };
        if (this.bumpIf(">")) {
          var n = this.parseMessage(e + 1, t, !0);
          if (n.err) return n;
          var s = n.val,
            r = this.clonePosition();
          if (this.bumpIf("</")) {
            if (this.isEOF() || !Hi(this.char())) return this.error(Ha.INVALID_TAG, pi(r, this.clonePosition()));
            var o = this.clonePosition();
            return i !== this.parseTagName() ? this.error(Ha.UNMATCHED_CLOSING_TAG, pi(o, this.clonePosition())) : (this.bumpSpace(), this.bumpIf(">") ? {
              val: {
                type: Ca.tag,
                value: i,
                children: s,
                location: pi(a, this.clonePosition())
              },
              err: null
            } : this.error(Ha.INVALID_TAG, pi(r, this.clonePosition())));
          }
          return this.error(Ha.UNCLOSED_TAG, pi(a, this.clonePosition()));
        }
        return this.error(Ha.INVALID_TAG, pi(a, this.clonePosition()));
      }, e.prototype.parseTagName = function () {
        var e = this.offset();
        for (this.bump(); !this.isEOF() && Ci(this.char());) this.bump();
        return this.message.slice(e, this.offset());
      }, e.prototype.parseLiteral = function (e, t) {
        for (var a = this.clonePosition(), i = "";;) {
          var n = this.tryParseQuote(t);
          if (n) i += n;else {
            var s = this.tryParseUnquoted(e, t);
            if (s) i += s;else {
              var r = this.tryParseLeftAngleBracket();
              if (!r) break;
              i += r;
            }
          }
        }
        var o = pi(a, this.clonePosition());
        return {
          val: {
            type: Ca.literal,
            value: i,
            location: o
          },
          err: null
        };
      }, e.prototype.tryParseLeftAngleBracket = function () {
        return this.isEOF() || 60 !== this.char() || !this.ignoreTag && (Hi(e = this.peek() || 0) || 47 === e) ? null : (this.bump(), "<");
        var e;
      }, e.prototype.tryParseQuote = function (e) {
        if (this.isEOF() || 39 !== this.char()) return null;
        switch (this.peek()) {
          case 39:
            return this.bump(), this.bump(), "'";
          case 123:
          case 60:
          case 62:
          case 125:
            break;
          case 35:
            if ("plural" === e || "selectordinal" === e) break;
            return null;
          default:
            return null;
        }
        this.bump();
        var t = [this.char()];
        for (this.bump(); !this.isEOF();) {
          var a = this.char();
          if (39 === a) {
            if (39 !== this.peek()) {
              this.bump();
              break;
            }
            t.push(39), this.bump();
          } else t.push(a);
          this.bump();
        }
        return Si.apply(void 0, t);
      }, e.prototype.tryParseUnquoted = function (e, t) {
        if (this.isEOF()) return null;
        var a = this.char();
        return 60 === a || 123 === a || 35 === a && ("plural" === t || "selectordinal" === t) || 125 === a && e > 0 ? null : (this.bump(), Si(a));
      }, e.prototype.parseArgument = function (e, t) {
        var a = this.clonePosition();
        if (this.bump(), this.bumpSpace(), this.isEOF()) return this.error(Ha.EXPECT_ARGUMENT_CLOSING_BRACE, pi(a, this.clonePosition()));
        if (125 === this.char()) return this.bump(), this.error(Ha.EMPTY_ARGUMENT, pi(a, this.clonePosition()));
        var i = this.parseIdentifierIfPossible().value;
        if (!i) return this.error(Ha.MALFORMED_ARGUMENT, pi(a, this.clonePosition()));
        if (this.bumpSpace(), this.isEOF()) return this.error(Ha.EXPECT_ARGUMENT_CLOSING_BRACE, pi(a, this.clonePosition()));
        switch (this.char()) {
          case 125:
            return this.bump(), {
              val: {
                type: Ca.argument,
                value: i,
                location: pi(a, this.clonePosition())
              },
              err: null
            };
          case 44:
            return this.bump(), this.bumpSpace(), this.isEOF() ? this.error(Ha.EXPECT_ARGUMENT_CLOSING_BRACE, pi(a, this.clonePosition())) : this.parseArgumentOptions(e, t, i, a);
          default:
            return this.error(Ha.MALFORMED_ARGUMENT, pi(a, this.clonePosition()));
        }
      }, e.prototype.parseIdentifierIfPossible = function () {
        var e = this.clonePosition(),
          t = this.offset(),
          a = ki(this.message, t),
          i = t + a.length;
        return this.bumpTo(i), {
          value: a,
          location: pi(e, this.clonePosition())
        };
      }, e.prototype.parseArgumentOptions = function (e, t, a, n) {
        var s,
          r = this.clonePosition(),
          o = this.parseIdentifierIfPossible().value,
          l = this.clonePosition();
        switch (o) {
          case "":
            return this.error(Ha.EXPECT_ARGUMENT_TYPE, pi(r, l));
          case "number":
          case "date":
          case "time":
            this.bumpSpace();
            var u = null;
            if (this.bumpIf(",")) {
              this.bumpSpace();
              var d = this.clonePosition();
              if ((b = this.parseSimpleArgStyleIfPossible()).err) return b;
              if (0 === (m = xi(b.val)).length) return this.error(Ha.EXPECT_ARGUMENT_STYLE, pi(this.clonePosition(), this.clonePosition()));
              u = {
                style: m,
                styleLocation: pi(d, this.clonePosition())
              };
            }
            if ((y = this.tryParseArgumentClose(n)).err) return y;
            var c = pi(n, this.clonePosition());
            if (u && $i(null == u ? void 0 : u.style, "::", 0)) {
              var h = Ai(u.style.slice(2));
              if ("number" === o) return (b = this.parseNumberSkeletonFromString(h, u.styleLocation)).err ? b : {
                val: {
                  type: Ca.number,
                  value: a,
                  location: c,
                  style: b.val
                },
                err: null
              };
              if (0 === h.length) return this.error(Ha.EXPECT_DATE_TIME_SKELETON, c);
              var p = h;
              this.locale && (p = function (e, t) {
                for (var a = "", i = 0; i < e.length; i++) {
                  var n = e.charAt(i);
                  if ("j" === n) {
                    for (var s = 0; i + 1 < e.length && e.charAt(i + 1) === n;) s++, i++;
                    var r = 1 + (1 & s),
                      o = s < 2 ? 1 : 3 + (s >> 1),
                      l = di(t);
                    for ("H" != l && "k" != l || (o = 0); o-- > 0;) a += "a";
                    for (; r-- > 0;) a = l + a;
                  } else a += "J" === n ? "H" : n;
                }
                return a;
              }(h, this.locale));
              var m = {
                type: Pa.dateTime,
                pattern: p,
                location: u.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? Xa(p) : {}
              };
              return {
                val: {
                  type: "date" === o ? Ca.date : Ca.time,
                  value: a,
                  location: c,
                  style: m
                },
                err: null
              };
            }
            return {
              val: {
                type: "number" === o ? Ca.number : "date" === o ? Ca.date : Ca.time,
                value: a,
                location: c,
                style: null !== (s = null == u ? void 0 : u.style) && void 0 !== s ? s : null
              },
              err: null
            };
          case "plural":
          case "selectordinal":
          case "select":
            var g = this.clonePosition();
            if (this.bumpSpace(), !this.bumpIf(",")) return this.error(Ha.EXPECT_SELECT_ARGUMENT_OPTIONS, pi(g, i({}, g)));
            this.bumpSpace();
            var f = this.parseIdentifierIfPossible(),
              v = 0;
            if ("select" !== o && "offset" === f.value) {
              if (!this.bumpIf(":")) return this.error(Ha.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, pi(this.clonePosition(), this.clonePosition()));
              var b;
              if (this.bumpSpace(), (b = this.tryParseDecimalInteger(Ha.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, Ha.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE)).err) return b;
              this.bumpSpace(), f = this.parseIdentifierIfPossible(), v = b.val;
            }
            var y,
              _ = this.tryParsePluralOrSelectOptions(e, o, t, f);
            if (_.err) return _;
            if ((y = this.tryParseArgumentClose(n)).err) return y;
            var w = pi(n, this.clonePosition());
            return "select" === o ? {
              val: {
                type: Ca.select,
                value: a,
                options: Ei(_.val),
                location: w
              },
              err: null
            } : {
              val: {
                type: Ca.plural,
                value: a,
                options: Ei(_.val),
                offset: v,
                pluralType: "plural" === o ? "cardinal" : "ordinal",
                location: w
              },
              err: null
            };
          default:
            return this.error(Ha.INVALID_ARGUMENT_TYPE, pi(r, l));
        }
      }, e.prototype.tryParseArgumentClose = function (e) {
        return this.isEOF() || 125 !== this.char() ? this.error(Ha.EXPECT_ARGUMENT_CLOSING_BRACE, pi(e, this.clonePosition())) : (this.bump(), {
          val: !0,
          err: null
        });
      }, e.prototype.parseSimpleArgStyleIfPossible = function () {
        for (var e = 0, t = this.clonePosition(); !this.isEOF();) {
          switch (this.char()) {
            case 39:
              this.bump();
              var a = this.clonePosition();
              if (!this.bumpUntil("'")) return this.error(Ha.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, pi(a, this.clonePosition()));
              this.bump();
              break;
            case 123:
              e += 1, this.bump();
              break;
            case 125:
              if (!(e > 0)) return {
                val: this.message.slice(t.offset, this.offset()),
                err: null
              };
              e -= 1;
              break;
            default:
              this.bump();
          }
        }
        return {
          val: this.message.slice(t.offset, this.offset()),
          err: null
        };
      }, e.prototype.parseNumberSkeletonFromString = function (e, t) {
        var a = [];
        try {
          a = function (e) {
            if (0 === e.length) throw new Error("Number skeleton cannot be empty");
            for (var t = e.split(Ja).filter(function (e) {
                return e.length > 0;
              }), a = [], i = 0, n = t; i < n.length; i++) {
              var s = n[i].split("/");
              if (0 === s.length) throw new Error("Invalid number skeleton");
              for (var r = s[0], o = s.slice(1), l = 0, u = o; l < u.length; l++) if (0 === u[l].length) throw new Error("Invalid number skeleton");
              a.push({
                stem: r,
                options: o
              });
            }
            return a;
          }(e);
        } catch (e) {
          return this.error(Ha.INVALID_NUMBER_SKELETON, t);
        }
        return {
          val: {
            type: Pa.number,
            tokens: a,
            location: t,
            parsedOptions: this.shouldParseSkeletons ? oi(a) : {}
          },
          err: null
        };
      }, e.prototype.tryParsePluralOrSelectOptions = function (e, t, a, i) {
        for (var n, s = !1, r = [], o = new Set(), l = i.value, u = i.location;;) {
          if (0 === l.length) {
            var d = this.clonePosition();
            if ("select" === t || !this.bumpIf("=")) break;
            var c = this.tryParseDecimalInteger(Ha.EXPECT_PLURAL_ARGUMENT_SELECTOR, Ha.INVALID_PLURAL_ARGUMENT_SELECTOR);
            if (c.err) return c;
            u = pi(d, this.clonePosition()), l = this.message.slice(d.offset, this.offset());
          }
          if (o.has(l)) return this.error("select" === t ? Ha.DUPLICATE_SELECT_ARGUMENT_SELECTOR : Ha.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, u);
          "other" === l && (s = !0), this.bumpSpace();
          var h = this.clonePosition();
          if (!this.bumpIf("{")) return this.error("select" === t ? Ha.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT : Ha.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, pi(this.clonePosition(), this.clonePosition()));
          var p = this.parseMessage(e + 1, t, a);
          if (p.err) return p;
          var m = this.tryParseArgumentClose(h);
          if (m.err) return m;
          r.push([l, {
            value: p.val,
            location: pi(h, this.clonePosition())
          }]), o.add(l), this.bumpSpace(), l = (n = this.parseIdentifierIfPossible()).value, u = n.location;
        }
        return 0 === r.length ? this.error("select" === t ? Ha.EXPECT_SELECT_ARGUMENT_SELECTOR : Ha.EXPECT_PLURAL_ARGUMENT_SELECTOR, pi(this.clonePosition(), this.clonePosition())) : this.requiresOtherClause && !s ? this.error(Ha.MISSING_OTHER_CLAUSE, pi(this.clonePosition(), this.clonePosition())) : {
          val: r,
          err: null
        };
      }, e.prototype.tryParseDecimalInteger = function (e, t) {
        var a = 1,
          i = this.clonePosition();
        this.bumpIf("+") || this.bumpIf("-") && (a = -1);
        for (var n = !1, s = 0; !this.isEOF();) {
          var r = this.char();
          if (!(r >= 48 && r <= 57)) break;
          n = !0, s = 10 * s + (r - 48), this.bump();
        }
        var o = pi(i, this.clonePosition());
        return n ? _i(s *= a) ? {
          val: s,
          err: null
        } : this.error(t, o) : this.error(e, o);
      }, e.prototype.offset = function () {
        return this.position.offset;
      }, e.prototype.isEOF = function () {
        return this.offset() === this.message.length;
      }, e.prototype.clonePosition = function () {
        return {
          offset: this.position.offset,
          line: this.position.line,
          column: this.position.column
        };
      }, e.prototype.char = function () {
        var e = this.position.offset;
        if (e >= this.message.length) throw Error("out of bound");
        var t = Mi(this.message, e);
        if (void 0 === t) throw Error("Offset ".concat(e, " is at invalid UTF-16 code unit boundary"));
        return t;
      }, e.prototype.error = function (e, t) {
        return {
          val: null,
          err: {
            kind: e,
            message: this.message,
            location: t
          }
        };
      }, e.prototype.bump = function () {
        if (!this.isEOF()) {
          var e = this.char();
          10 === e ? (this.position.line += 1, this.position.column = 1, this.position.offset += 1) : (this.position.column += 1, this.position.offset += e < 65536 ? 1 : 2);
        }
      }, e.prototype.bumpIf = function (e) {
        if ($i(this.message, e, this.offset())) {
          for (var t = 0; t < e.length; t++) this.bump();
          return !0;
        }
        return !1;
      }, e.prototype.bumpUntil = function (e) {
        var t = this.offset(),
          a = this.message.indexOf(e, t);
        return a >= 0 ? (this.bumpTo(a), !0) : (this.bumpTo(this.message.length), !1);
      }, e.prototype.bumpTo = function (e) {
        if (this.offset() > e) throw Error("targetOffset ".concat(e, " must be greater than or equal to the current offset ").concat(this.offset()));
        for (e = Math.min(e, this.message.length);;) {
          var t = this.offset();
          if (t === e) break;
          if (t > e) throw Error("targetOffset ".concat(e, " is at invalid UTF-16 code unit boundary"));
          if (this.bump(), this.isEOF()) break;
        }
      }, e.prototype.bumpSpace = function () {
        for (; !this.isEOF() && Pi(this.char());) this.bump();
      }, e.prototype.peek = function () {
        if (this.isEOF()) return null;
        var e = this.char(),
          t = this.offset(),
          a = this.message.charCodeAt(t + (e >= 65536 ? 2 : 1));
        return null != a ? a : null;
      }, e;
    }();
  function Hi(e) {
    return e >= 97 && e <= 122 || e >= 65 && e <= 90;
  }
  function Ci(e) {
    return 45 === e || 46 === e || e >= 48 && e <= 57 || 95 === e || e >= 97 && e <= 122 || e >= 65 && e <= 90 || 183 == e || e >= 192 && e <= 214 || e >= 216 && e <= 246 || e >= 248 && e <= 893 || e >= 895 && e <= 8191 || e >= 8204 && e <= 8205 || e >= 8255 && e <= 8256 || e >= 8304 && e <= 8591 || e >= 11264 && e <= 12271 || e >= 12289 && e <= 55295 || e >= 63744 && e <= 64975 || e >= 65008 && e <= 65533 || e >= 65536 && e <= 983039;
  }
  function Pi(e) {
    return e >= 9 && e <= 13 || 32 === e || 133 === e || e >= 8206 && e <= 8207 || 8232 === e || 8233 === e;
  }
  function Ni(e) {
    return e >= 33 && e <= 35 || 36 === e || e >= 37 && e <= 39 || 40 === e || 41 === e || 42 === e || 43 === e || 44 === e || 45 === e || e >= 46 && e <= 47 || e >= 58 && e <= 59 || e >= 60 && e <= 62 || e >= 63 && e <= 64 || 91 === e || 92 === e || 93 === e || 94 === e || 96 === e || 123 === e || 124 === e || 125 === e || 126 === e || 161 === e || e >= 162 && e <= 165 || 166 === e || 167 === e || 169 === e || 171 === e || 172 === e || 174 === e || 176 === e || 177 === e || 182 === e || 187 === e || 191 === e || 215 === e || 247 === e || e >= 8208 && e <= 8213 || e >= 8214 && e <= 8215 || 8216 === e || 8217 === e || 8218 === e || e >= 8219 && e <= 8220 || 8221 === e || 8222 === e || 8223 === e || e >= 8224 && e <= 8231 || e >= 8240 && e <= 8248 || 8249 === e || 8250 === e || e >= 8251 && e <= 8254 || e >= 8257 && e <= 8259 || 8260 === e || 8261 === e || 8262 === e || e >= 8263 && e <= 8273 || 8274 === e || 8275 === e || e >= 8277 && e <= 8286 || e >= 8592 && e <= 8596 || e >= 8597 && e <= 8601 || e >= 8602 && e <= 8603 || e >= 8604 && e <= 8607 || 8608 === e || e >= 8609 && e <= 8610 || 8611 === e || e >= 8612 && e <= 8613 || 8614 === e || e >= 8615 && e <= 8621 || 8622 === e || e >= 8623 && e <= 8653 || e >= 8654 && e <= 8655 || e >= 8656 && e <= 8657 || 8658 === e || 8659 === e || 8660 === e || e >= 8661 && e <= 8691 || e >= 8692 && e <= 8959 || e >= 8960 && e <= 8967 || 8968 === e || 8969 === e || 8970 === e || 8971 === e || e >= 8972 && e <= 8991 || e >= 8992 && e <= 8993 || e >= 8994 && e <= 9e3 || 9001 === e || 9002 === e || e >= 9003 && e <= 9083 || 9084 === e || e >= 9085 && e <= 9114 || e >= 9115 && e <= 9139 || e >= 9140 && e <= 9179 || e >= 9180 && e <= 9185 || e >= 9186 && e <= 9254 || e >= 9255 && e <= 9279 || e >= 9280 && e <= 9290 || e >= 9291 && e <= 9311 || e >= 9472 && e <= 9654 || 9655 === e || e >= 9656 && e <= 9664 || 9665 === e || e >= 9666 && e <= 9719 || e >= 9720 && e <= 9727 || e >= 9728 && e <= 9838 || 9839 === e || e >= 9840 && e <= 10087 || 10088 === e || 10089 === e || 10090 === e || 10091 === e || 10092 === e || 10093 === e || 10094 === e || 10095 === e || 10096 === e || 10097 === e || 10098 === e || 10099 === e || 10100 === e || 10101 === e || e >= 10132 && e <= 10175 || e >= 10176 && e <= 10180 || 10181 === e || 10182 === e || e >= 10183 && e <= 10213 || 10214 === e || 10215 === e || 10216 === e || 10217 === e || 10218 === e || 10219 === e || 10220 === e || 10221 === e || 10222 === e || 10223 === e || e >= 10224 && e <= 10239 || e >= 10240 && e <= 10495 || e >= 10496 && e <= 10626 || 10627 === e || 10628 === e || 10629 === e || 10630 === e || 10631 === e || 10632 === e || 10633 === e || 10634 === e || 10635 === e || 10636 === e || 10637 === e || 10638 === e || 10639 === e || 10640 === e || 10641 === e || 10642 === e || 10643 === e || 10644 === e || 10645 === e || 10646 === e || 10647 === e || 10648 === e || e >= 10649 && e <= 10711 || 10712 === e || 10713 === e || 10714 === e || 10715 === e || e >= 10716 && e <= 10747 || 10748 === e || 10749 === e || e >= 10750 && e <= 11007 || e >= 11008 && e <= 11055 || e >= 11056 && e <= 11076 || e >= 11077 && e <= 11078 || e >= 11079 && e <= 11084 || e >= 11085 && e <= 11123 || e >= 11124 && e <= 11125 || e >= 11126 && e <= 11157 || 11158 === e || e >= 11159 && e <= 11263 || e >= 11776 && e <= 11777 || 11778 === e || 11779 === e || 11780 === e || 11781 === e || e >= 11782 && e <= 11784 || 11785 === e || 11786 === e || 11787 === e || 11788 === e || 11789 === e || e >= 11790 && e <= 11798 || 11799 === e || e >= 11800 && e <= 11801 || 11802 === e || 11803 === e || 11804 === e || 11805 === e || e >= 11806 && e <= 11807 || 11808 === e || 11809 === e || 11810 === e || 11811 === e || 11812 === e || 11813 === e || 11814 === e || 11815 === e || 11816 === e || 11817 === e || e >= 11818 && e <= 11822 || 11823 === e || e >= 11824 && e <= 11833 || e >= 11834 && e <= 11835 || e >= 11836 && e <= 11839 || 11840 === e || 11841 === e || 11842 === e || e >= 11843 && e <= 11855 || e >= 11856 && e <= 11857 || 11858 === e || e >= 11859 && e <= 11903 || e >= 12289 && e <= 12291 || 12296 === e || 12297 === e || 12298 === e || 12299 === e || 12300 === e || 12301 === e || 12302 === e || 12303 === e || 12304 === e || 12305 === e || e >= 12306 && e <= 12307 || 12308 === e || 12309 === e || 12310 === e || 12311 === e || 12312 === e || 12313 === e || 12314 === e || 12315 === e || 12316 === e || 12317 === e || e >= 12318 && e <= 12319 || 12320 === e || 12336 === e || 64830 === e || 64831 === e || e >= 65093 && e <= 65094;
  }
  function Li(e) {
    e.forEach(function (e) {
      if (delete e.location, Ya(e) || Fa(e)) for (var t in e.options) delete e.options[t].location, Li(e.options[t].value);else Ra(e) && Ga(e.style) || (Ba(e) || Ua(e)) && Za(e.style) ? delete e.style.location : Wa(e) && Li(e.children);
    });
  }
  function ji(e, t) {
    void 0 === t && (t = {}), t = i({
      shouldParseSkeletons: !0,
      requiresOtherClause: !0
    }, t);
    var a = new Di(e, t).parse();
    if (a.err) {
      var n = SyntaxError(Ha[a.err.kind]);
      throw n.location = a.err.location, n.originalMessage = a.err.message, n;
    }
    return (null == t ? void 0 : t.captureLocation) || Li(a.val), a.val;
  }
  !function (e) {
    e.MISSING_VALUE = "MISSING_VALUE", e.INVALID_VALUE = "INVALID_VALUE", e.MISSING_INTL_API = "MISSING_INTL_API";
  }(Oi || (Oi = {}));
  var Ii,
    Ri = function (e) {
      function t(t, a, i) {
        var n = e.call(this, t) || this;
        return n.code = a, n.originalMessage = i, n;
      }
      return a(t, e), t.prototype.toString = function () {
        return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
      }, t;
    }(Error),
    Bi = function (e) {
      function t(t, a, i, n) {
        return e.call(this, 'Invalid values for "'.concat(t, '": "').concat(a, '". Options are "').concat(Object.keys(i).join('", "'), '"'), Oi.INVALID_VALUE, n) || this;
      }
      return a(t, e), t;
    }(Ri),
    Ui = function (e) {
      function t(t, a, i) {
        return e.call(this, 'Value for "'.concat(t, '" must be of type ').concat(a), Oi.INVALID_VALUE, i) || this;
      }
      return a(t, e), t;
    }(Ri),
    Yi = function (e) {
      function t(t, a) {
        return e.call(this, 'The intl string context variable "'.concat(t, '" was not provided to the string "').concat(a, '"'), Oi.MISSING_VALUE, a) || this;
      }
      return a(t, e), t;
    }(Ri);
  function Fi(e) {
    return "function" == typeof e;
  }
  function Vi(e, t, a, i, n, s, r) {
    if (1 === e.length && ja(e[0])) return [{
      type: Ii.literal,
      value: e[0].value
    }];
    for (var o = [], l = 0, u = e; l < u.length; l++) {
      var d = u[l];
      if (ja(d)) o.push({
        type: Ii.literal,
        value: d.value
      });else if (Va(d)) "number" == typeof s && o.push({
        type: Ii.literal,
        value: a.getNumberFormat(t).format(s)
      });else {
        var c = d.value;
        if (!n || !(c in n)) throw new Yi(c, r);
        var h = n[c];
        if (Ia(d)) h && "string" != typeof h && "number" != typeof h || (h = "string" == typeof h || "number" == typeof h ? String(h) : ""), o.push({
          type: "string" == typeof h ? Ii.literal : Ii.object,
          value: h
        });else if (Ba(d)) {
          var p = "string" == typeof d.style ? i.date[d.style] : Za(d.style) ? d.style.parsedOptions : void 0;
          o.push({
            type: Ii.literal,
            value: a.getDateTimeFormat(t, p).format(h)
          });
        } else if (Ua(d)) {
          p = "string" == typeof d.style ? i.time[d.style] : Za(d.style) ? d.style.parsedOptions : i.time.medium;
          o.push({
            type: Ii.literal,
            value: a.getDateTimeFormat(t, p).format(h)
          });
        } else if (Ra(d)) {
          (p = "string" == typeof d.style ? i.number[d.style] : Ga(d.style) ? d.style.parsedOptions : void 0) && p.scale && (h *= p.scale || 1), o.push({
            type: Ii.literal,
            value: a.getNumberFormat(t, p).format(h)
          });
        } else {
          if (Wa(d)) {
            var m = d.children,
              g = d.value,
              f = n[g];
            if (!Fi(f)) throw new Ui(g, "function", r);
            var v = f(Vi(m, t, a, i, n, s).map(function (e) {
              return e.value;
            }));
            Array.isArray(v) || (v = [v]), o.push.apply(o, v.map(function (e) {
              return {
                type: "string" == typeof e ? Ii.literal : Ii.object,
                value: e
              };
            }));
          }
          if (Ya(d)) {
            if (!(b = d.options[h] || d.options.other)) throw new Bi(d.value, h, Object.keys(d.options), r);
            o.push.apply(o, Vi(b.value, t, a, i, n));
          } else if (Fa(d)) {
            var b;
            if (!(b = d.options["=".concat(h)])) {
              if (!Intl.PluralRules) throw new Ri('Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n', Oi.MISSING_INTL_API, r);
              var y = a.getPluralRules(t, {
                type: d.pluralType
              }).select(h - (d.offset || 0));
              b = d.options[y] || d.options.other;
            }
            if (!b) throw new Bi(d.value, h, Object.keys(d.options), r);
            o.push.apply(o, Vi(b.value, t, a, i, n, h - (d.offset || 0)));
          } else ;
        }
      }
    }
    return function (e) {
      return e.length < 2 ? e : e.reduce(function (e, t) {
        var a = e[e.length - 1];
        return a && a.type === Ii.literal && t.type === Ii.literal ? a.value += t.value : e.push(t), e;
      }, []);
    }(o);
  }
  function Wi(e, t) {
    return t ? Object.keys(e).reduce(function (a, n) {
      var s, r;
      return a[n] = (s = e[n], (r = t[n]) ? i(i(i({}, s || {}), r || {}), Object.keys(s).reduce(function (e, t) {
        return e[t] = i(i({}, s[t]), r[t] || {}), e;
      }, {})) : s), a;
    }, i({}, e)) : e;
  }
  function Gi(e) {
    return {
      create: function () {
        return {
          get: function (t) {
            return e[t];
          },
          set: function (t, a) {
            e[t] = a;
          }
        };
      }
    };
  }
  !function (e) {
    e[e.literal = 0] = "literal", e[e.object = 1] = "object";
  }(Ii || (Ii = {}));
  var Zi = function () {
      function e(t, a, n, r) {
        void 0 === a && (a = e.defaultLocale);
        var o,
          l = this;
        if (this.formatterCache = {
          number: {},
          dateTime: {},
          pluralRules: {}
        }, this.format = function (e) {
          var t = l.formatToParts(e);
          if (1 === t.length) return t[0].value;
          var a = t.reduce(function (e, t) {
            return e.length && t.type === Ii.literal && "string" == typeof e[e.length - 1] ? e[e.length - 1] += t.value : e.push(t.value), e;
          }, []);
          return a.length <= 1 ? a[0] || "" : a;
        }, this.formatToParts = function (e) {
          return Vi(l.ast, l.locales, l.formatters, l.formats, e, void 0, l.message);
        }, this.resolvedOptions = function () {
          var e;
          return {
            locale: (null === (e = l.resolvedLocale) || void 0 === e ? void 0 : e.toString()) || Intl.NumberFormat.supportedLocalesOf(l.locales)[0]
          };
        }, this.getAst = function () {
          return l.ast;
        }, this.locales = a, this.resolvedLocale = e.resolveLocale(a), "string" == typeof t) {
          if (this.message = t, !e.__parse) throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
          var u = r || {};
          u.formatters;
          var d = function (e, t) {
            var a = {};
            for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && t.indexOf(i) < 0 && (a[i] = e[i]);
            if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
              var n = 0;
              for (i = Object.getOwnPropertySymbols(e); n < i.length; n++) t.indexOf(i[n]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[n]) && (a[i[n]] = e[i[n]]);
            }
            return a;
          }(u, ["formatters"]);
          this.ast = e.__parse(t, i(i({}, d), {
            locale: this.resolvedLocale
          }));
        } else this.ast = t;
        if (!Array.isArray(this.ast)) throw new TypeError("A message must be provided as a String or AST.");
        this.formats = Wi(e.formats, n), this.formatters = r && r.formatters || (void 0 === (o = this.formatterCache) && (o = {
          number: {},
          dateTime: {},
          pluralRules: {}
        }), {
          getNumberFormat: Ma(function () {
            for (var e, t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
            return new ((e = Intl.NumberFormat).bind.apply(e, s([void 0], t, !1)))();
          }, {
            cache: Gi(o.number),
            strategy: La.variadic
          }),
          getDateTimeFormat: Ma(function () {
            for (var e, t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
            return new ((e = Intl.DateTimeFormat).bind.apply(e, s([void 0], t, !1)))();
          }, {
            cache: Gi(o.dateTime),
            strategy: La.variadic
          }),
          getPluralRules: Ma(function () {
            for (var e, t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
            return new ((e = Intl.PluralRules).bind.apply(e, s([void 0], t, !1)))();
          }, {
            cache: Gi(o.pluralRules),
            strategy: La.variadic
          })
        });
      }
      return Object.defineProperty(e, "defaultLocale", {
        get: function () {
          return e.memoizedDefaultLocale || (e.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale), e.memoizedDefaultLocale;
        },
        enumerable: !1,
        configurable: !0
      }), e.memoizedDefaultLocale = null, e.resolveLocale = function (e) {
        if (void 0 !== Intl.Locale) {
          var t = Intl.NumberFormat.supportedLocalesOf(e);
          return t.length > 0 ? new Intl.Locale(t[0]) : new Intl.Locale("string" == typeof e ? e : e[0]);
        }
      }, e.__parse = ji, e.formats = {
        number: {
          integer: {
            maximumFractionDigits: 0
          },
          currency: {
            style: "currency"
          },
          percent: {
            style: "percent"
          }
        },
        date: {
          short: {
            month: "numeric",
            day: "numeric",
            year: "2-digit"
          },
          medium: {
            month: "short",
            day: "numeric",
            year: "numeric"
          },
          long: {
            month: "long",
            day: "numeric",
            year: "numeric"
          },
          full: {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
          }
        },
        time: {
          short: {
            hour: "numeric",
            minute: "numeric"
          },
          medium: {
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
          },
          long: {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short"
          },
          full: {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short"
          }
        }
      }, e;
    }(),
    qi = Zi;
  const Ki = {
    de: St,
    en: Dt,
    es: Rt,
    fr: Zt,
    it: aa,
    nl: da,
    no: va,
    sk: Ea
  };
  function Xi(e, t, ...a) {
    const i = t.replace(/['"]+/g, "");
    let n;
    try {
      n = e.split(".").reduce((e, t) => e[t], Ki[i]);
    } catch (t) {
      n = e.split(".").reduce((e, t) => e[t], Ki.en);
    }
    if (void 0 === n && (n = e.split(".").reduce((e, t) => e[t], Ki.en)), !a.length) return n;
    const s = {};
    for (let e = 0; e < a.length; e += 2) {
      let t = a[e];
      t = t.replace(/^{([^}]+)?}$/, "$1"), s[t] = a[e + 1];
    }
    try {
      return new qi(n, t).format(s);
    } catch (e) {
      return "Translation " + e;
    }
  }
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  const Ji = 2;
  class Qi {
    constructor(e) {}
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(e, t, a) {
      this._$Ct = e, this._$AM = t, this._$Ci = a;
    }
    _$AS(e, t) {
      return this.update(e, t);
    }
    update(e, t) {
      return this.render(...t);
    }
  }
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */
  class en extends Qi {
    constructor(e) {
      if (super(e), this.et = V, e.type !== Ji) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
    }
    render(e) {
      if (e === V || null == e) return this.ft = void 0, this.et = e;
      if (e === F) return e;
      if ("string" != typeof e) throw Error(this.constructor.directiveName + "() called with a non-string value");
      if (e === this.et) return this.ft;
      this.et = e;
      const t = [e];
      return t.raw = t, this.ft = {
        _$litType$: this.constructor.resultType,
        strings: t,
        values: []
      };
    }
  }
  en.directiveName = "unsafeHTML", en.resultType = 1;
  const tn = (e => (...t) => ({
    _$litDirective$: e,
    values: t
  }))(en);
  function an(e) {
    return "on" === (e = null == e ? void 0 : e.toString().toLowerCase()) || "true" === e || "1" === e;
  }
  function nn(e, t) {
    return (e = e.toString()).split(",")[t];
  }
  function sn(e, t) {
    switch (t) {
      case dt:
        return e.units == Ae ? Y`${tn(Ke)}` : Y`${tn(Xe)}`;
      case nt:
        return e.units == Ae ? Y`${tn("mm")}` : Y`${tn("in")}`;
      case Qe:
        return e.units == Ae ? Y`${tn("m<sup>2</sup>")}` : Y`${tn("sq ft")}`;
      case et:
        return e.units == Ae ? Y`${tn("l/minute")}` : Y`${tn("gal/minute")}`;
      default:
        return Y``;
    }
  }
  function rn(e, t) {
    !function (e, t) {
      be(e, "show-dialog", {
        dialogTag: "error-dialog",
        dialogImport: () => Promise.resolve().then(function () {
          return En;
        }),
        dialogParams: {
          error: t
        }
      });
    }(t, Y`
    ${e.error}:${e.body.message ? Y` ${e.body.message} ` : ""}
  `);
  }
  const on = c`
  /* Existing common styles */
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

  /* Common utility classes shared across views */
  .hidden {
    display: none;
  }

  .shortinput {
    width: 50px;
  }

  .loading-indicator {
    text-align: center;
    padding: 20px;
    color: var(--primary-text-color);
    font-style: italic;
  }

  .saving {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .saving-indicator {
    color: var(--primary-color);
    font-style: italic;
    margin-top: 8px;
    font-size: 0.9em;
  }

  /* Disabled input styling */
  button:disabled,
  select:disabled,
  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Common line/row layouts */
  .zoneline,
  .mappingsettingline,
  .schemaline {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    margin-left: 0;
    margin-top: 8px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .zoneline label,
  .mappingsettingline label,
  .schemaline label {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  .zoneline input,
  .zoneline select,
  .mappingsettingline input,
  .mappingsettingline select,
  .schemaline input,
  .schemaline select {
    justify-self: end;
  }

  /* Common container styles */
  .zone,
  .mapping {
    margin-top: 25px;
    margin-bottom: 25px;
  }

  /* Mapping-specific container */
  .mappingline {
    margin-top: 16px;
    padding: 8px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
  }

  /* Note/alert styles - consolidated */
  .weather-note,
  .calendar-note,
  .info-note {
    padding: 8px;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border-radius: 4px;
    font-size: 0.9em;
    font-style: italic;
  }

  .info-note {
    margin-top: 16px;
    background: var(--warning-color);
    color: var(--text-primary-color);
  }

  /* Radio button group styling */
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 8px 0;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  .radio-group input[type="radio"] {
    margin: 0;
  }

  input[type="radio"] {
    margin-right: 5px;
    margin-left: 10px;
  }

  input[type="radio"] + label {
    margin-right: 15px;
  }

  /* Common header styles */
  .subheader,
  .mappingsettingname {
    font-weight: bold;
  }

  /* Load more button styling */
  .load-more {
    text-align: center;
    padding: 16px;
  }

  .load-more button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .load-more button:hover {
    background: var(--primary-color-dark, var(--primary-color));
  }

  /* Strikethrough utility */
  .strikethrough {
    text-decoration: line-through;
  }

  /* Information text styling */
  .information {
    margin-left: 20px;
    margin-top: 5px;
  }

  /* Calendar and weather table styles */
  .watering-calendar,
  .weather-records {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .watering-calendar h4,
  .weather-records h4 {
    margin: 0 0 12px 0;
    font-size: 1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .calendar-table,
  .weather-table {
    display: grid;
    gap: 8px;
    font-size: 0.85em;
  }

  .calendar-table {
    grid-template-columns: 1fr 0.8fr 1fr 0.8fr 0.8fr;
  }

  .weather-table {
    grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 1fr;
  }

  .calendar-header,
  .weather-header {
    display: contents;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .calendar-header span,
  .weather-header span {
    padding: 4px;
    background: var(--card-background-color);
    border-bottom: 2px solid var(--primary-color);
  }

  .calendar-row,
  .weather-row {
    display: contents;
    color: var(--secondary-text-color);
  }

  .calendar-row span,
  .weather-row span {
    padding: 4px;
    border-bottom: 1px solid var(--divider-color);
  }

  .calendar-info {
    margin-top: 8px;
    padding: 4px 8px;
    background: var(--info-color, var(--primary-color));
    color: white;
    border-radius: 4px;
    font-size: 0.8em;
  }

  /* Zone info table styles */
  .zone-info-table {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    margin-bottom: 16px;
  }

  .zone-info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .zone-info-label {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  .zone-info-value {
    color: var(--secondary-text-color);
    text-align: right;
  }

  /* Info item styles */
  .info-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .info-item label {
    font-weight: 500;
    min-width: 120px;
    color: var(--primary-text-color);
  }

  .info-item .value {
    color: var(--secondary-text-color);
    font-family: monospace;
    text-align: right;
    justify-self: end;
  }

  .info-item.explanation {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .explanation-text {
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    padding: 8px;
    font-size: 0.9em;
    line-height: 1.4;
    white-space: pre-wrap;
    margin-top: 4px;
    width: 100%;
    box-sizing: border-box;
  }
`;
  c`
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
      --mdc-dialog-min-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-max-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-min-height: 100%;
      --mdc-dialog-max-height: 100%;
      --vertial-align-dialog: flex-end;
      --ha-dialog-border-radius: 0px;
    }
  }
  ha-dialog div.description {
    margin-bottom: 10px;
  }
`;
  var ln = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
    un = "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z";
  let dn = class extends ft(ue) {
    constructor() {
      super(...arguments), this.isLoading = !0, this.isSaving = !1, this._updateScheduled = !1, this.debouncedSave = (() => {
        let e = null;
        return t => {
          e && clearTimeout(e), e = window.setTimeout(() => {
            this.saveData(t), e = null;
          }, 500);
        };
      })();
    }
    _scheduleUpdate() {
      this._updateScheduled || (this._updateScheduled = !0, requestAnimationFrame(() => {
        this._updateScheduled = !1, this.requestUpdate();
      }));
    }
    hassSubscribe() {
      return this._fetchData().catch(e => {
        console.error("Failed to fetch initial data:", e);
      }), [this.hass.connection.subscribeMessage(() => {
        this._fetchData().catch(e => {
          console.error("Failed to fetch data on config update:", e);
        });
      }, {
        type: ke + "_config_updated"
      })];
    }
    async _fetchData() {
      if (this.hass) {
        this.isLoading = !0, this._scheduleUpdate();
        try {
          this.config = await ct(this.hass), this.data = (e = this.config, t = ["calctime", "autocalcenabled", "autoupdateenabled", "autoupdateschedule", "autoupdatefirsttime", "autoupdateinterval", "autoclearenabled", "cleardatatime", "continuousupdates", "sensor_debounce"], e ? Object.entries(e).filter(([e]) => t.includes(e)).reduce((e, [t, a]) => Object.assign(e, {
            [t]: a
          }), {}) : {});
        } catch (e) {
          console.error("Error fetching data:", e);
        } finally {
          this.isLoading = !1, this._scheduleUpdate();
        }
        var e, t;
      }
    }
    firstUpdated() {
      we().catch(e => {
        console.error("Failed to load HA form:", e);
      });
    }
    render() {
      if (!this.hass || !this.config || !this.data) return Y`<div class="loading-indicator">
        Loading configuration...
      </div>`;
      if (this.isLoading) return Y`<div class="loading-indicator">Loading...</div>`;
      {
        let e = Y` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautocalcdescription"
            @click="${() => this.toggleInformation("autocalcdescription")}"
          >
            >
            <title>
              ${Xi("panels.zones.actions.information", this.hass.language)}
            </title>
            <path fill="#404040" d="${un}" />
          </svg>
        </div>

        <div class="card-content">
          <label class="hidden" id="autocalcdescription">
            ${Xi("panels.general.cards.automatic-duration-calculation.description", this.hass.language)}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="autocalcenabled"
              >${Xi("panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled", this.hass.language)}:</label
            >
            <div>
              <input
                type="radio"
                id="autocalcon"
                name="autocalcenabled"
                value="True"
                ?checked="${this.config.autocalcenabled}"
                @change="${e => {
          this.handleConfigChange({
            autocalcenabled: an(e.target.value)
          });
        }}"
              /><label for="autocalcon"
                >${Xi("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="autocalcoff"
                name="autocalcenabled"
                value="False"
                ?checked="${!this.config.autocalcenabled}"
                @change="${e => {
          this.handleConfigChange({
            autocalcenabled: an(e.target.value)
          });
        }}"
              /><label for="autocalcoff"
                >${Xi("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
        this.data.autocalcenabled && (e = Y`${e}
          <div class="card-content">
            <div class="zoneline">
              <label for="calctime"
                >${Xi("panels.general.cards.automatic-duration-calculation.labels.auto-calc-time", this.hass.language)}:</label
              >
              <input
                id="calctime"
                type="text"
                class="shortinput"
                .value="${this.config.calctime}"
                @input=${e => {
          this.handleConfigChange({
            calctime: e.target.value
          });
        }}
              />
            </div>
          </div>`), e = Y`<ha-card
        header="${Xi("panels.general.cards.automatic-duration-calculation.header", this.hass.language)}"
      >
        ${e}</ha-card
      >`;
        let t = Y` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautoupdatedescription"
            @click="${() => this.toggleInformation("autoupdatedescription")}"
          >
            >
            <title>
              ${Xi("panels.zones.actions.information", this.hass.language)}
            </title>
            <path fill="#404040" d="${un}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="autoupdatedescription">
            ${Xi("panels.general.cards.automatic-update.description", this.hass.language)}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="autoupdateenabled"
              >${Xi("panels.general.cards.automatic-update.labels.auto-update-enabled", this.hass.language)}:</label
            >
            <div>
              <input
                type="radio"
                id="autoupdateon"
                name="autoupdateenabled"
                value="True"
                ?checked="${this.config.autoupdateenabled}"
                @change="${e => {
          this.saveData({
            autoupdateenabled: an(e.target.value)
          });
        }}"
              /><label for="autoupdateon"
                >${Xi("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="autoupdateoff"
                name="autoupdateenabled"
                value="False"
                ?checked="${!this.config.autoupdateenabled}"
                @change="${e => {
          this.saveData({
            autoupdateenabled: an(e.target.value)
          });
        }}"
              /><label for="autoupdateoff"
                >${Xi("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
        this.data.autoupdateenabled && (t = Y`${t}
          <div class="card-content">
            <div class="zoneline">
              <label for="autoupdateinterval"
                >${Xi("panels.general.cards.automatic-update.labels.auto-update-interval", this.hass.language)}:</label
              >
              <div style="display: flex; gap: 8px; align-items: center;">
                <input
                  name="autoupdateinterval"
                  class="shortinput"
                  type="number"
                  value="${this.data.autoupdateinterval}"
                  @input="${e => {
          this.saveData({
            autoupdateinterval: parseInt(e.target.value)
          });
        }}"
                />
                <select
                  type="text"
                  id="autoupdateschedule"
                  @change="${e => {
          this.saveData({
            autoupdateschedule: e.target.value
          });
        }}"
                >
                  <option
                    value="${$e}"
                    ?selected="${this.data.autoupdateschedule === $e}"
                  >
                    ${Xi("panels.general.cards.automatic-update.options.minutes", this.hass.language)}
                  </option>
                  <option
                    value="${Se}"
                    ?selected="${this.data.autoupdateschedule === Se}"
                  >
                    ${Xi("panels.general.cards.automatic-update.options.hours", this.hass.language)}
                  </option>
                  <option
                    value="${Ee}"
                    ?selected="${this.data.autoupdateschedule === Ee}"
                  >
                    ${Xi("panels.general.cards.automatic-update.options.days", this.hass.language)}
                  </option>
                </select>
              </div>
            </div>
          </div>`), this.data.autoupdateenabled && (t = Y`${t}
          <div class="card-content">
            <div class="zoneline">
              <label for="updatedelay"
                >${Xi("panels.general.cards.automatic-update.labels.auto-update-delay", this.hass.language)}
                (s):</label
              >
              <input
                id="updatedelay"
                type="text"
                class="shortinput"
                .value="${this.config.autoupdatedelay}"
                @input=${e => {
          this.saveData({
            autoupdatedelay: parseInt(e.target.value)
          });
        }}
              />
            </div>
          </div>`), t = Y`<ha-card header="${Xi("panels.general.cards.automatic-update.header", this.hass.language)}",
      this.hass.language)}">${t}</ha-card>`;
        let a = Y` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautocleardescription"
            @click="${() => this.toggleInformation("autocleardescription")}"
          >
            <title>
              ${Xi("panels.zones.actions.information", this.hass.language)}
            </title>

            <path fill="#404040" d="${un}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="autocleardescription">
            ${Xi("panels.general.cards.automatic-clear.description", this.hass.language)}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="autoclearenabled"
              >${Xi("panels.general.cards.automatic-clear.labels.automatic-clear-enabled", this.hass.language)}:</label
            >
            <div>
              <input
                type="radio"
                id="autoclearon"
                name="autoclearenabled"
                value="True"
                ?checked="${this.config.autoclearenabled}"
                @change="${e => {
          this.handleConfigChange({
            autoclearenabled: an(e.target.value)
          });
        }}"
              /><label for="autoclearon"
                >${Xi("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="autoclearoff"
                name="autoclearenabled"
                value="False"
                ?checked="${!this.config.autoclearenabled}"
                @change="${e => {
          this.handleConfigChange({
            autoclearenabled: an(e.target.value)
          });
        }}"
              /><label for="autoclearoff"
                >${Xi("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
        this.data.autoclearenabled && (a = Y`${a}
          <div class="card-content">
            <div class="zoneline">
              <label for="calctime"
                >${Xi("panels.general.cards.automatic-clear.labels.automatic-clear-time", this.hass.language)}:</label
              >
              <input
                id="cleardatatime"
                type="text"
                class="shortinput"
                .value="${this.config.cleardatatime}"
                @input=${e => {
          this.handleConfigChange({
            cleardatatime: e.target.value
          });
        }}
              />
            </div>
          </div>`), a = Y`<ha-card header="${Xi("panels.general.cards.automatic-clear.header", this.hass.language)}" >${a}</ha-card>`;
        let i = Y`<div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showcontinuousupdatesdescription"
            @click="${() => this.toggleInformation("continuousupdatesdescription")}"
          >
            >
            <title>
              ${Xi("panels.zones.actions.information", this.hass.language)}
            </title>
            <path fill="#404040" d="${un}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="continuousupdatesdescription">
            ${Xi("panels.general.cards.continuousupdates.description", this.hass.language)}
          </label>
        </div>
        <div class="card-content">
          <div class="zoneline">
            <label for="continuousupdates"
              >${Xi("panels.general.cards.continuousupdates.labels.continuousupdates", this.hass.language)}:</label
            >
            <div>
              <input
                type="radio"
                id="continuousupdateson"
                name="continuousupdates"
                value="True"
                ?checked="${this.config.continuousupdates}"
                @change="${e => {
          this.handleConfigChange({
            continuousupdates: an(e.target.value)
          });
        }}"
              /><label for="continuousupdateson"
                >${Xi("common.labels.yes", this.hass.language)}</label
              >
              <input
                type="radio"
                id="continuousupdatesoff"
                name="continuousupdates"
                value="False"
                ?checked="${!this.config.continuousupdates}"
                @change="${e => {
          this.handleConfigChange({
            continuousupdates: an(e.target.value)
          });
        }}"
              /><label for="continuousupdatesoff"
                >${Xi("common.labels.no", this.hass.language)}</label
              >
            </div>
          </div>
        </div>`;
        this.data.continuousupdates && (i = Y`${i}
          <div class="card-content">
            <div class="zoneline">
              <label for="sensor_debounce"
                >${Xi("panels.general.cards.continuousupdates.labels.sensor_debounce", this.hass.language)}
                (ms):</label
              >
              <input
                id="sensor_debounce"
                type="text"
                class="shortinput"
                .value="${this.config.sensor_debounce}"
                @input=${e => {
          this.handleConfigChange({
            sensor_debounce: parseInt(e.target.value)
          });
        }}
              />
            </div>
          </div>`), i = Y`<ha-card
        header="${Xi("panels.general.cards.continuousupdates.header", this.hass.language)}"
        >${i}</ha-card
      > `;
        return Y`<ha-card
          header="${Xi("panels.general.title", this.hass.language)}"
        >
          <div class="card-content">
            ${Xi("panels.general.description", this.hass.language)}
          </div> </ha-card
        >${t}${e}${a}${i}`;
      }
    }
    async saveData(e) {
      if (this.hass && this.data) {
        this.isSaving = !0, this._scheduleUpdate();
        try {
          this.data = Object.assign(Object.assign({}, this.data), e), this._scheduleUpdate(), await (t = this.hass, a = this.data, t.callApi("POST", ke + "/config", a));
        } catch (e) {
          console.error("Error saving config:", e), rn(e, this.shadowRoot.querySelector("ha-card")), await this._fetchData();
        } finally {
          this.isSaving = !1, this._scheduleUpdate();
        }
        var t, a;
      }
    }
    handleConfigChange(e) {
      this.debouncedSave(e);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
    }
    toggleInformation(e) {
      var t;
      const a = null === (t = this.shadowRoot) || void 0 === t ? void 0 : t.querySelector("#" + e);
      a && ("hidden" != a.className ? a.className = "hidden" : a.className = "information");
    }
    static get styles() {
      return c`
      ${on}
      /* View-specific styles only - most common styles are now in globalStyle */
    `;
    }
  };
  var cn;
  function hn(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
  }
  function pn(e) {
    throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
  }
  n([pe()], dn.prototype, "narrow", void 0), n([pe()], dn.prototype, "path", void 0), n([pe()], dn.prototype, "data", void 0), n([pe()], dn.prototype, "config", void 0), n([pe({
    type: Boolean
  })], dn.prototype, "isLoading", void 0), n([pe({
    type: Boolean
  })], dn.prototype, "isSaving", void 0), dn = n([ce("smart-irrigation-view-general")], dn), function (e) {
    e.Disabled = "disabled", e.Manual = "manual", e.Automatic = "automatic";
  }(cn || (cn = {}));
  var mn,
    gn = {
      exports: {}
    };
  var fn = (mn || (mn = 1, function (e) {
      e.exports = function () {
        var t, a;
        function i() {
          return t.apply(null, arguments);
        }
        function n(e) {
          t = e;
        }
        function s(e) {
          return e instanceof Array || "[object Array]" === Object.prototype.toString.call(e);
        }
        function r(e) {
          return null != e && "[object Object]" === Object.prototype.toString.call(e);
        }
        function o(e, t) {
          return Object.prototype.hasOwnProperty.call(e, t);
        }
        function l(e) {
          if (Object.getOwnPropertyNames) return 0 === Object.getOwnPropertyNames(e).length;
          var t;
          for (t in e) if (o(e, t)) return !1;
          return !0;
        }
        function u(e) {
          return void 0 === e;
        }
        function d(e) {
          return "number" == typeof e || "[object Number]" === Object.prototype.toString.call(e);
        }
        function c(e) {
          return e instanceof Date || "[object Date]" === Object.prototype.toString.call(e);
        }
        function h(e, t) {
          var a,
            i = [],
            n = e.length;
          for (a = 0; a < n; ++a) i.push(t(e[a], a));
          return i;
        }
        function p(e, t) {
          for (var a in t) o(t, a) && (e[a] = t[a]);
          return o(t, "toString") && (e.toString = t.toString), o(t, "valueOf") && (e.valueOf = t.valueOf), e;
        }
        function m(e, t, a, i) {
          return Ga(e, t, a, i, !0).utc();
        }
        function g() {
          return {
            empty: !1,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: !1,
            invalidEra: null,
            invalidMonth: null,
            invalidFormat: !1,
            userInvalidated: !1,
            iso: !1,
            parsedDateParts: [],
            era: null,
            meridiem: null,
            rfc2822: !1,
            weekdayMismatch: !1
          };
        }
        function f(e) {
          return null == e._pf && (e._pf = g()), e._pf;
        }
        function v(e) {
          var t = null,
            i = !1,
            n = e._d && !isNaN(e._d.getTime());
          return n && (t = f(e), i = a.call(t.parsedDateParts, function (e) {
            return null != e;
          }), n = t.overflow < 0 && !t.empty && !t.invalidEra && !t.invalidMonth && !t.invalidWeekday && !t.weekdayMismatch && !t.nullInput && !t.invalidFormat && !t.userInvalidated && (!t.meridiem || t.meridiem && i), e._strict && (n = n && 0 === t.charsLeftOver && 0 === t.unusedTokens.length && void 0 === t.bigHour)), null != Object.isFrozen && Object.isFrozen(e) ? n : (e._isValid = n, e._isValid);
        }
        function b(e) {
          var t = m(NaN);
          return null != e ? p(f(t), e) : f(t).userInvalidated = !0, t;
        }
        a = Array.prototype.some ? Array.prototype.some : function (e) {
          var t,
            a = Object(this),
            i = a.length >>> 0;
          for (t = 0; t < i; t++) if (t in a && e.call(this, a[t], t, a)) return !0;
          return !1;
        };
        var y = i.momentProperties = [],
          _ = !1;
        function w(e, t) {
          var a,
            i,
            n,
            s = y.length;
          if (u(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject), u(t._i) || (e._i = t._i), u(t._f) || (e._f = t._f), u(t._l) || (e._l = t._l), u(t._strict) || (e._strict = t._strict), u(t._tzm) || (e._tzm = t._tzm), u(t._isUTC) || (e._isUTC = t._isUTC), u(t._offset) || (e._offset = t._offset), u(t._pf) || (e._pf = f(t)), u(t._locale) || (e._locale = t._locale), s > 0) for (a = 0; a < s; a++) u(n = t[i = y[a]]) || (e[i] = n);
          return e;
        }
        function k(e) {
          w(this, e), this._d = new Date(null != e._d ? e._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)), !1 === _ && (_ = !0, i.updateOffset(this), _ = !1);
        }
        function $(e) {
          return e instanceof k || null != e && null != e._isAMomentObject;
        }
        function S(e) {
          !1 === i.suppressDeprecationWarnings && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + e);
        }
        function E(e, t) {
          var a = !0;
          return p(function () {
            if (null != i.deprecationHandler && i.deprecationHandler(null, e), a) {
              var n,
                s,
                r,
                l = [],
                u = arguments.length;
              for (s = 0; s < u; s++) {
                if (n = "", "object" == typeof arguments[s]) {
                  for (r in n += "\n[" + s + "] ", arguments[0]) o(arguments[0], r) && (n += r + ": " + arguments[0][r] + ", ");
                  n = n.slice(0, -2);
                } else n = arguments[s];
                l.push(n);
              }
              S(e + "\nArguments: " + Array.prototype.slice.call(l).join("") + "\n" + new Error().stack), a = !1;
            }
            return t.apply(this, arguments);
          }, t);
        }
        var M,
          A = {};
        function x(e, t) {
          null != i.deprecationHandler && i.deprecationHandler(e, t), A[e] || (S(t), A[e] = !0);
        }
        function T(e) {
          return "undefined" != typeof Function && e instanceof Function || "[object Function]" === Object.prototype.toString.call(e);
        }
        function z(e) {
          var t, a;
          for (a in e) o(e, a) && (T(t = e[a]) ? this[a] = t : this["_" + a] = t);
          this._config = e, this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source);
        }
        function O(e, t) {
          var a,
            i = p({}, e);
          for (a in t) o(t, a) && (r(e[a]) && r(t[a]) ? (i[a] = {}, p(i[a], e[a]), p(i[a], t[a])) : null != t[a] ? i[a] = t[a] : delete i[a]);
          for (a in e) o(e, a) && !o(t, a) && r(e[a]) && (i[a] = p({}, i[a]));
          return i;
        }
        function D(e) {
          null != e && this.set(e);
        }
        i.suppressDeprecationWarnings = !1, i.deprecationHandler = null, M = Object.keys ? Object.keys : function (e) {
          var t,
            a = [];
          for (t in e) o(e, t) && a.push(t);
          return a;
        };
        var H = {
          sameDay: "[Today at] LT",
          nextDay: "[Tomorrow at] LT",
          nextWeek: "dddd [at] LT",
          lastDay: "[Yesterday at] LT",
          lastWeek: "[Last] dddd [at] LT",
          sameElse: "L"
        };
        function C(e, t, a) {
          var i = this._calendar[e] || this._calendar.sameElse;
          return T(i) ? i.call(t, a) : i;
        }
        function P(e, t, a) {
          var i = "" + Math.abs(e),
            n = t - i.length;
          return (e >= 0 ? a ? "+" : "" : "-") + Math.pow(10, Math.max(0, n)).toString().substr(1) + i;
        }
        var N = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
          L = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
          j = {},
          I = {};
        function R(e, t, a, i) {
          var n = i;
          "string" == typeof i && (n = function () {
            return this[i]();
          }), e && (I[e] = n), t && (I[t[0]] = function () {
            return P(n.apply(this, arguments), t[1], t[2]);
          }), a && (I[a] = function () {
            return this.localeData().ordinal(n.apply(this, arguments), e);
          });
        }
        function B(e) {
          return e.match(/\[[\s\S]/) ? e.replace(/^\[|\]$/g, "") : e.replace(/\\/g, "");
        }
        function U(e) {
          var t,
            a,
            i = e.match(N);
          for (t = 0, a = i.length; t < a; t++) I[i[t]] ? i[t] = I[i[t]] : i[t] = B(i[t]);
          return function (t) {
            var n,
              s = "";
            for (n = 0; n < a; n++) s += T(i[n]) ? i[n].call(t, e) : i[n];
            return s;
          };
        }
        function Y(e, t) {
          return e.isValid() ? (t = F(t, e.localeData()), j[t] = j[t] || U(t), j[t](e)) : e.localeData().invalidDate();
        }
        function F(e, t) {
          var a = 5;
          function i(e) {
            return t.longDateFormat(e) || e;
          }
          for (L.lastIndex = 0; a >= 0 && L.test(e);) e = e.replace(L, i), L.lastIndex = 0, a -= 1;
          return e;
        }
        var V = {
          LTS: "h:mm:ss A",
          LT: "h:mm A",
          L: "MM/DD/YYYY",
          LL: "MMMM D, YYYY",
          LLL: "MMMM D, YYYY h:mm A",
          LLLL: "dddd, MMMM D, YYYY h:mm A"
        };
        function W(e) {
          var t = this._longDateFormat[e],
            a = this._longDateFormat[e.toUpperCase()];
          return t || !a ? t : (this._longDateFormat[e] = a.match(N).map(function (e) {
            return "MMMM" === e || "MM" === e || "DD" === e || "dddd" === e ? e.slice(1) : e;
          }).join(""), this._longDateFormat[e]);
        }
        var G = "Invalid date";
        function Z() {
          return this._invalidDate;
        }
        var q = "%d",
          K = /\d{1,2}/;
        function X(e) {
          return this._ordinal.replace("%d", e);
        }
        var J = {
          future: "in %s",
          past: "%s ago",
          s: "a few seconds",
          ss: "%d seconds",
          m: "a minute",
          mm: "%d minutes",
          h: "an hour",
          hh: "%d hours",
          d: "a day",
          dd: "%d days",
          w: "a week",
          ww: "%d weeks",
          M: "a month",
          MM: "%d months",
          y: "a year",
          yy: "%d years"
        };
        function Q(e, t, a, i) {
          var n = this._relativeTime[a];
          return T(n) ? n(e, t, a, i) : n.replace(/%d/i, e);
        }
        function ee(e, t) {
          var a = this._relativeTime[e > 0 ? "future" : "past"];
          return T(a) ? a(t) : a.replace(/%s/i, t);
        }
        var te = {
          D: "date",
          dates: "date",
          date: "date",
          d: "day",
          days: "day",
          day: "day",
          e: "weekday",
          weekdays: "weekday",
          weekday: "weekday",
          E: "isoWeekday",
          isoweekdays: "isoWeekday",
          isoweekday: "isoWeekday",
          DDD: "dayOfYear",
          dayofyears: "dayOfYear",
          dayofyear: "dayOfYear",
          h: "hour",
          hours: "hour",
          hour: "hour",
          ms: "millisecond",
          milliseconds: "millisecond",
          millisecond: "millisecond",
          m: "minute",
          minutes: "minute",
          minute: "minute",
          M: "month",
          months: "month",
          month: "month",
          Q: "quarter",
          quarters: "quarter",
          quarter: "quarter",
          s: "second",
          seconds: "second",
          second: "second",
          gg: "weekYear",
          weekyears: "weekYear",
          weekyear: "weekYear",
          GG: "isoWeekYear",
          isoweekyears: "isoWeekYear",
          isoweekyear: "isoWeekYear",
          w: "week",
          weeks: "week",
          week: "week",
          W: "isoWeek",
          isoweeks: "isoWeek",
          isoweek: "isoWeek",
          y: "year",
          years: "year",
          year: "year"
        };
        function ae(e) {
          return "string" == typeof e ? te[e] || te[e.toLowerCase()] : void 0;
        }
        function ie(e) {
          var t,
            a,
            i = {};
          for (a in e) o(e, a) && (t = ae(a)) && (i[t] = e[a]);
          return i;
        }
        var ne = {
          date: 9,
          day: 11,
          weekday: 11,
          isoWeekday: 11,
          dayOfYear: 4,
          hour: 13,
          millisecond: 16,
          minute: 14,
          month: 8,
          quarter: 7,
          second: 15,
          weekYear: 1,
          isoWeekYear: 1,
          week: 5,
          isoWeek: 5,
          year: 1
        };
        function se(e) {
          var t,
            a = [];
          for (t in e) o(e, t) && a.push({
            unit: t,
            priority: ne[t]
          });
          return a.sort(function (e, t) {
            return e.priority - t.priority;
          }), a;
        }
        var re,
          oe = /\d/,
          le = /\d\d/,
          ue = /\d{3}/,
          de = /\d{4}/,
          ce = /[+-]?\d{6}/,
          he = /\d\d?/,
          pe = /\d\d\d\d?/,
          me = /\d\d\d\d\d\d?/,
          ge = /\d{1,3}/,
          fe = /\d{1,4}/,
          ve = /[+-]?\d{1,6}/,
          be = /\d+/,
          ye = /[+-]?\d+/,
          _e = /Z|[+-]\d\d:?\d\d/gi,
          we = /Z|[+-]\d\d(?::?\d\d)?/gi,
          ke = /[+-]?\d+(\.\d{1,3})?/,
          $e = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
          Se = /^[1-9]\d?/,
          Ee = /^([1-9]\d|\d)/;
        function Me(e, t, a) {
          re[e] = T(t) ? t : function (e, i) {
            return e && a ? a : t;
          };
        }
        function Ae(e, t) {
          return o(re, e) ? re[e](t._strict, t._locale) : new RegExp(xe(e));
        }
        function xe(e) {
          return Te(e.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (e, t, a, i, n) {
            return t || a || i || n;
          }));
        }
        function Te(e) {
          return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        }
        function ze(e) {
          return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
        }
        function Oe(e) {
          var t = +e,
            a = 0;
          return 0 !== t && isFinite(t) && (a = ze(t)), a;
        }
        re = {};
        var De = {};
        function He(e, t) {
          var a,
            i,
            n = t;
          for ("string" == typeof e && (e = [e]), d(t) && (n = function (e, a) {
            a[t] = Oe(e);
          }), i = e.length, a = 0; a < i; a++) De[e[a]] = n;
        }
        function Ce(e, t) {
          He(e, function (e, a, i, n) {
            i._w = i._w || {}, t(e, i._w, i, n);
          });
        }
        function Pe(e, t, a) {
          null != t && o(De, e) && De[e](t, a._a, a, e);
        }
        function Ne(e) {
          return e % 4 == 0 && e % 100 != 0 || e % 400 == 0;
        }
        var Le = 0,
          je = 1,
          Ie = 2,
          Re = 3,
          Be = 4,
          Ue = 5,
          Ye = 6,
          Fe = 7,
          Ve = 8;
        function We(e) {
          return Ne(e) ? 366 : 365;
        }
        R("Y", 0, 0, function () {
          var e = this.year();
          return e <= 9999 ? P(e, 4) : "+" + e;
        }), R(0, ["YY", 2], 0, function () {
          return this.year() % 100;
        }), R(0, ["YYYY", 4], 0, "year"), R(0, ["YYYYY", 5], 0, "year"), R(0, ["YYYYYY", 6, !0], 0, "year"), Me("Y", ye), Me("YY", he, le), Me("YYYY", fe, de), Me("YYYYY", ve, ce), Me("YYYYYY", ve, ce), He(["YYYYY", "YYYYYY"], Le), He("YYYY", function (e, t) {
          t[Le] = 2 === e.length ? i.parseTwoDigitYear(e) : Oe(e);
        }), He("YY", function (e, t) {
          t[Le] = i.parseTwoDigitYear(e);
        }), He("Y", function (e, t) {
          t[Le] = parseInt(e, 10);
        }), i.parseTwoDigitYear = function (e) {
          return Oe(e) + (Oe(e) > 68 ? 1900 : 2e3);
        };
        var Ge,
          Ze = Ke("FullYear", !0);
        function qe() {
          return Ne(this.year());
        }
        function Ke(e, t) {
          return function (a) {
            return null != a ? (Je(this, e, a), i.updateOffset(this, t), this) : Xe(this, e);
          };
        }
        function Xe(e, t) {
          if (!e.isValid()) return NaN;
          var a = e._d,
            i = e._isUTC;
          switch (t) {
            case "Milliseconds":
              return i ? a.getUTCMilliseconds() : a.getMilliseconds();
            case "Seconds":
              return i ? a.getUTCSeconds() : a.getSeconds();
            case "Minutes":
              return i ? a.getUTCMinutes() : a.getMinutes();
            case "Hours":
              return i ? a.getUTCHours() : a.getHours();
            case "Date":
              return i ? a.getUTCDate() : a.getDate();
            case "Day":
              return i ? a.getUTCDay() : a.getDay();
            case "Month":
              return i ? a.getUTCMonth() : a.getMonth();
            case "FullYear":
              return i ? a.getUTCFullYear() : a.getFullYear();
            default:
              return NaN;
          }
        }
        function Je(e, t, a) {
          var i, n, s, r, o;
          if (e.isValid() && !isNaN(a)) {
            switch (i = e._d, n = e._isUTC, t) {
              case "Milliseconds":
                return void (n ? i.setUTCMilliseconds(a) : i.setMilliseconds(a));
              case "Seconds":
                return void (n ? i.setUTCSeconds(a) : i.setSeconds(a));
              case "Minutes":
                return void (n ? i.setUTCMinutes(a) : i.setMinutes(a));
              case "Hours":
                return void (n ? i.setUTCHours(a) : i.setHours(a));
              case "Date":
                return void (n ? i.setUTCDate(a) : i.setDate(a));
              case "FullYear":
                break;
              default:
                return;
            }
            s = a, r = e.month(), o = 29 !== (o = e.date()) || 1 !== r || Ne(s) ? o : 28, n ? i.setUTCFullYear(s, r, o) : i.setFullYear(s, r, o);
          }
        }
        function Qe(e) {
          return T(this[e = ae(e)]) ? this[e]() : this;
        }
        function et(e, t) {
          if ("object" == typeof e) {
            var a,
              i = se(e = ie(e)),
              n = i.length;
            for (a = 0; a < n; a++) this[i[a].unit](e[i[a].unit]);
          } else if (T(this[e = ae(e)])) return this[e](t);
          return this;
        }
        function tt(e, t) {
          return (e % t + t) % t;
        }
        function at(e, t) {
          if (isNaN(e) || isNaN(t)) return NaN;
          var a = tt(t, 12);
          return e += (t - a) / 12, 1 === a ? Ne(e) ? 29 : 28 : 31 - a % 7 % 2;
        }
        Ge = Array.prototype.indexOf ? Array.prototype.indexOf : function (e) {
          var t;
          for (t = 0; t < this.length; ++t) if (this[t] === e) return t;
          return -1;
        }, R("M", ["MM", 2], "Mo", function () {
          return this.month() + 1;
        }), R("MMM", 0, 0, function (e) {
          return this.localeData().monthsShort(this, e);
        }), R("MMMM", 0, 0, function (e) {
          return this.localeData().months(this, e);
        }), Me("M", he, Se), Me("MM", he, le), Me("MMM", function (e, t) {
          return t.monthsShortRegex(e);
        }), Me("MMMM", function (e, t) {
          return t.monthsRegex(e);
        }), He(["M", "MM"], function (e, t) {
          t[je] = Oe(e) - 1;
        }), He(["MMM", "MMMM"], function (e, t, a, i) {
          var n = a._locale.monthsParse(e, i, a._strict);
          null != n ? t[je] = n : f(a).invalidMonth = e;
        });
        var it = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
          nt = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
          st = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
          rt = $e,
          ot = $e;
        function lt(e, t) {
          return e ? s(this._months) ? this._months[e.month()] : this._months[(this._months.isFormat || st).test(t) ? "format" : "standalone"][e.month()] : s(this._months) ? this._months : this._months.standalone;
        }
        function ut(e, t) {
          return e ? s(this._monthsShort) ? this._monthsShort[e.month()] : this._monthsShort[st.test(t) ? "format" : "standalone"][e.month()] : s(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone;
        }
        function dt(e, t, a) {
          var i,
            n,
            s,
            r = e.toLocaleLowerCase();
          if (!this._monthsParse) for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], i = 0; i < 12; ++i) s = m([2e3, i]), this._shortMonthsParse[i] = this.monthsShort(s, "").toLocaleLowerCase(), this._longMonthsParse[i] = this.months(s, "").toLocaleLowerCase();
          return a ? "MMM" === t ? -1 !== (n = Ge.call(this._shortMonthsParse, r)) ? n : null : -1 !== (n = Ge.call(this._longMonthsParse, r)) ? n : null : "MMM" === t ? -1 !== (n = Ge.call(this._shortMonthsParse, r)) || -1 !== (n = Ge.call(this._longMonthsParse, r)) ? n : null : -1 !== (n = Ge.call(this._longMonthsParse, r)) || -1 !== (n = Ge.call(this._shortMonthsParse, r)) ? n : null;
        }
        function ct(e, t, a) {
          var i, n, s;
          if (this._monthsParseExact) return dt.call(this, e, t, a);
          for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), i = 0; i < 12; i++) {
            if (n = m([2e3, i]), a && !this._longMonthsParse[i] && (this._longMonthsParse[i] = new RegExp("^" + this.months(n, "").replace(".", "") + "$", "i"), this._shortMonthsParse[i] = new RegExp("^" + this.monthsShort(n, "").replace(".", "") + "$", "i")), a || this._monthsParse[i] || (s = "^" + this.months(n, "") + "|^" + this.monthsShort(n, ""), this._monthsParse[i] = new RegExp(s.replace(".", ""), "i")), a && "MMMM" === t && this._longMonthsParse[i].test(e)) return i;
            if (a && "MMM" === t && this._shortMonthsParse[i].test(e)) return i;
            if (!a && this._monthsParse[i].test(e)) return i;
          }
        }
        function ht(e, t) {
          if (!e.isValid()) return e;
          if ("string" == typeof t) if (/^\d+$/.test(t)) t = Oe(t);else if (!d(t = e.localeData().monthsParse(t))) return e;
          var a = t,
            i = e.date();
          return i = i < 29 ? i : Math.min(i, at(e.year(), a)), e._isUTC ? e._d.setUTCMonth(a, i) : e._d.setMonth(a, i), e;
        }
        function pt(e) {
          return null != e ? (ht(this, e), i.updateOffset(this, !0), this) : Xe(this, "Month");
        }
        function mt() {
          return at(this.year(), this.month());
        }
        function gt(e) {
          return this._monthsParseExact ? (o(this, "_monthsRegex") || vt.call(this), e ? this._monthsShortStrictRegex : this._monthsShortRegex) : (o(this, "_monthsShortRegex") || (this._monthsShortRegex = rt), this._monthsShortStrictRegex && e ? this._monthsShortStrictRegex : this._monthsShortRegex);
        }
        function ft(e) {
          return this._monthsParseExact ? (o(this, "_monthsRegex") || vt.call(this), e ? this._monthsStrictRegex : this._monthsRegex) : (o(this, "_monthsRegex") || (this._monthsRegex = ot), this._monthsStrictRegex && e ? this._monthsStrictRegex : this._monthsRegex);
        }
        function vt() {
          function e(e, t) {
            return t.length - e.length;
          }
          var t,
            a,
            i,
            n,
            s = [],
            r = [],
            o = [];
          for (t = 0; t < 12; t++) a = m([2e3, t]), i = Te(this.monthsShort(a, "")), n = Te(this.months(a, "")), s.push(i), r.push(n), o.push(n), o.push(i);
          s.sort(e), r.sort(e), o.sort(e), this._monthsRegex = new RegExp("^(" + o.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + r.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + s.join("|") + ")", "i");
        }
        function bt(e, t, a, i, n, s, r) {
          var o;
          return e < 100 && e >= 0 ? (o = new Date(e + 400, t, a, i, n, s, r), isFinite(o.getFullYear()) && o.setFullYear(e)) : o = new Date(e, t, a, i, n, s, r), o;
        }
        function yt(e) {
          var t, a;
          return e < 100 && e >= 0 ? ((a = Array.prototype.slice.call(arguments))[0] = e + 400, t = new Date(Date.UTC.apply(null, a)), isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e)) : t = new Date(Date.UTC.apply(null, arguments)), t;
        }
        function _t(e, t, a) {
          var i = 7 + t - a;
          return -(7 + yt(e, 0, i).getUTCDay() - t) % 7 + i - 1;
        }
        function wt(e, t, a, i, n) {
          var s,
            r,
            o = 1 + 7 * (t - 1) + (7 + a - i) % 7 + _t(e, i, n);
          return o <= 0 ? r = We(s = e - 1) + o : o > We(e) ? (s = e + 1, r = o - We(e)) : (s = e, r = o), {
            year: s,
            dayOfYear: r
          };
        }
        function kt(e, t, a) {
          var i,
            n,
            s = _t(e.year(), t, a),
            r = Math.floor((e.dayOfYear() - s - 1) / 7) + 1;
          return r < 1 ? i = r + $t(n = e.year() - 1, t, a) : r > $t(e.year(), t, a) ? (i = r - $t(e.year(), t, a), n = e.year() + 1) : (n = e.year(), i = r), {
            week: i,
            year: n
          };
        }
        function $t(e, t, a) {
          var i = _t(e, t, a),
            n = _t(e + 1, t, a);
          return (We(e) - i + n) / 7;
        }
        function St(e) {
          return kt(e, this._week.dow, this._week.doy).week;
        }
        R("w", ["ww", 2], "wo", "week"), R("W", ["WW", 2], "Wo", "isoWeek"), Me("w", he, Se), Me("ww", he, le), Me("W", he, Se), Me("WW", he, le), Ce(["w", "ww", "W", "WW"], function (e, t, a, i) {
          t[i.substr(0, 1)] = Oe(e);
        });
        var Et = {
          dow: 0,
          doy: 6
        };
        function Mt() {
          return this._week.dow;
        }
        function At() {
          return this._week.doy;
        }
        function xt(e) {
          var t = this.localeData().week(this);
          return null == e ? t : this.add(7 * (e - t), "d");
        }
        function Tt(e) {
          var t = kt(this, 1, 4).week;
          return null == e ? t : this.add(7 * (e - t), "d");
        }
        function zt(e, t) {
          return "string" != typeof e ? e : isNaN(e) ? "number" == typeof (e = t.weekdaysParse(e)) ? e : null : parseInt(e, 10);
        }
        function Ot(e, t) {
          return "string" == typeof e ? t.weekdaysParse(e) % 7 || 7 : isNaN(e) ? null : e;
        }
        function Dt(e, t) {
          return e.slice(t, 7).concat(e.slice(0, t));
        }
        R("d", 0, "do", "day"), R("dd", 0, 0, function (e) {
          return this.localeData().weekdaysMin(this, e);
        }), R("ddd", 0, 0, function (e) {
          return this.localeData().weekdaysShort(this, e);
        }), R("dddd", 0, 0, function (e) {
          return this.localeData().weekdays(this, e);
        }), R("e", 0, 0, "weekday"), R("E", 0, 0, "isoWeekday"), Me("d", he), Me("e", he), Me("E", he), Me("dd", function (e, t) {
          return t.weekdaysMinRegex(e);
        }), Me("ddd", function (e, t) {
          return t.weekdaysShortRegex(e);
        }), Me("dddd", function (e, t) {
          return t.weekdaysRegex(e);
        }), Ce(["dd", "ddd", "dddd"], function (e, t, a, i) {
          var n = a._locale.weekdaysParse(e, i, a._strict);
          null != n ? t.d = n : f(a).invalidWeekday = e;
        }), Ce(["d", "e", "E"], function (e, t, a, i) {
          t[i] = Oe(e);
        });
        var Ht = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
          Ct = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
          Pt = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
          Nt = $e,
          Lt = $e,
          jt = $e;
        function It(e, t) {
          var a = s(this._weekdays) ? this._weekdays : this._weekdays[e && !0 !== e && this._weekdays.isFormat.test(t) ? "format" : "standalone"];
          return !0 === e ? Dt(a, this._week.dow) : e ? a[e.day()] : a;
        }
        function Rt(e) {
          return !0 === e ? Dt(this._weekdaysShort, this._week.dow) : e ? this._weekdaysShort[e.day()] : this._weekdaysShort;
        }
        function Bt(e) {
          return !0 === e ? Dt(this._weekdaysMin, this._week.dow) : e ? this._weekdaysMin[e.day()] : this._weekdaysMin;
        }
        function Ut(e, t, a) {
          var i,
            n,
            s,
            r = e.toLocaleLowerCase();
          if (!this._weekdaysParse) for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], i = 0; i < 7; ++i) s = m([2e3, 1]).day(i), this._minWeekdaysParse[i] = this.weekdaysMin(s, "").toLocaleLowerCase(), this._shortWeekdaysParse[i] = this.weekdaysShort(s, "").toLocaleLowerCase(), this._weekdaysParse[i] = this.weekdays(s, "").toLocaleLowerCase();
          return a ? "dddd" === t ? -1 !== (n = Ge.call(this._weekdaysParse, r)) ? n : null : "ddd" === t ? -1 !== (n = Ge.call(this._shortWeekdaysParse, r)) ? n : null : -1 !== (n = Ge.call(this._minWeekdaysParse, r)) ? n : null : "dddd" === t ? -1 !== (n = Ge.call(this._weekdaysParse, r)) || -1 !== (n = Ge.call(this._shortWeekdaysParse, r)) || -1 !== (n = Ge.call(this._minWeekdaysParse, r)) ? n : null : "ddd" === t ? -1 !== (n = Ge.call(this._shortWeekdaysParse, r)) || -1 !== (n = Ge.call(this._weekdaysParse, r)) || -1 !== (n = Ge.call(this._minWeekdaysParse, r)) ? n : null : -1 !== (n = Ge.call(this._minWeekdaysParse, r)) || -1 !== (n = Ge.call(this._weekdaysParse, r)) || -1 !== (n = Ge.call(this._shortWeekdaysParse, r)) ? n : null;
        }
        function Yt(e, t, a) {
          var i, n, s;
          if (this._weekdaysParseExact) return Ut.call(this, e, t, a);
          for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), i = 0; i < 7; i++) {
            if (n = m([2e3, 1]).day(i), a && !this._fullWeekdaysParse[i] && (this._fullWeekdaysParse[i] = new RegExp("^" + this.weekdays(n, "").replace(".", "\\.?") + "$", "i"), this._shortWeekdaysParse[i] = new RegExp("^" + this.weekdaysShort(n, "").replace(".", "\\.?") + "$", "i"), this._minWeekdaysParse[i] = new RegExp("^" + this.weekdaysMin(n, "").replace(".", "\\.?") + "$", "i")), this._weekdaysParse[i] || (s = "^" + this.weekdays(n, "") + "|^" + this.weekdaysShort(n, "") + "|^" + this.weekdaysMin(n, ""), this._weekdaysParse[i] = new RegExp(s.replace(".", ""), "i")), a && "dddd" === t && this._fullWeekdaysParse[i].test(e)) return i;
            if (a && "ddd" === t && this._shortWeekdaysParse[i].test(e)) return i;
            if (a && "dd" === t && this._minWeekdaysParse[i].test(e)) return i;
            if (!a && this._weekdaysParse[i].test(e)) return i;
          }
        }
        function Ft(e) {
          if (!this.isValid()) return null != e ? this : NaN;
          var t = Xe(this, "Day");
          return null != e ? (e = zt(e, this.localeData()), this.add(e - t, "d")) : t;
        }
        function Vt(e) {
          if (!this.isValid()) return null != e ? this : NaN;
          var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
          return null == e ? t : this.add(e - t, "d");
        }
        function Wt(e) {
          if (!this.isValid()) return null != e ? this : NaN;
          if (null != e) {
            var t = Ot(e, this.localeData());
            return this.day(this.day() % 7 ? t : t - 7);
          }
          return this.day() || 7;
        }
        function Gt(e) {
          return this._weekdaysParseExact ? (o(this, "_weekdaysRegex") || Kt.call(this), e ? this._weekdaysStrictRegex : this._weekdaysRegex) : (o(this, "_weekdaysRegex") || (this._weekdaysRegex = Nt), this._weekdaysStrictRegex && e ? this._weekdaysStrictRegex : this._weekdaysRegex);
        }
        function Zt(e) {
          return this._weekdaysParseExact ? (o(this, "_weekdaysRegex") || Kt.call(this), e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (o(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = Lt), this._weekdaysShortStrictRegex && e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex);
        }
        function qt(e) {
          return this._weekdaysParseExact ? (o(this, "_weekdaysRegex") || Kt.call(this), e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (o(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = jt), this._weekdaysMinStrictRegex && e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex);
        }
        function Kt() {
          function e(e, t) {
            return t.length - e.length;
          }
          var t,
            a,
            i,
            n,
            s,
            r = [],
            o = [],
            l = [],
            u = [];
          for (t = 0; t < 7; t++) a = m([2e3, 1]).day(t), i = Te(this.weekdaysMin(a, "")), n = Te(this.weekdaysShort(a, "")), s = Te(this.weekdays(a, "")), r.push(i), o.push(n), l.push(s), u.push(i), u.push(n), u.push(s);
          r.sort(e), o.sort(e), l.sort(e), u.sort(e), this._weekdaysRegex = new RegExp("^(" + u.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + l.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + o.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + r.join("|") + ")", "i");
        }
        function Xt() {
          return this.hours() % 12 || 12;
        }
        function Jt() {
          return this.hours() || 24;
        }
        function Qt(e, t) {
          R(e, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), t);
          });
        }
        function ea(e, t) {
          return t._meridiemParse;
        }
        function ta(e) {
          return "p" === (e + "").toLowerCase().charAt(0);
        }
        R("H", ["HH", 2], 0, "hour"), R("h", ["hh", 2], 0, Xt), R("k", ["kk", 2], 0, Jt), R("hmm", 0, 0, function () {
          return "" + Xt.apply(this) + P(this.minutes(), 2);
        }), R("hmmss", 0, 0, function () {
          return "" + Xt.apply(this) + P(this.minutes(), 2) + P(this.seconds(), 2);
        }), R("Hmm", 0, 0, function () {
          return "" + this.hours() + P(this.minutes(), 2);
        }), R("Hmmss", 0, 0, function () {
          return "" + this.hours() + P(this.minutes(), 2) + P(this.seconds(), 2);
        }), Qt("a", !0), Qt("A", !1), Me("a", ea), Me("A", ea), Me("H", he, Ee), Me("h", he, Se), Me("k", he, Se), Me("HH", he, le), Me("hh", he, le), Me("kk", he, le), Me("hmm", pe), Me("hmmss", me), Me("Hmm", pe), Me("Hmmss", me), He(["H", "HH"], Re), He(["k", "kk"], function (e, t, a) {
          var i = Oe(e);
          t[Re] = 24 === i ? 0 : i;
        }), He(["a", "A"], function (e, t, a) {
          a._isPm = a._locale.isPM(e), a._meridiem = e;
        }), He(["h", "hh"], function (e, t, a) {
          t[Re] = Oe(e), f(a).bigHour = !0;
        }), He("hmm", function (e, t, a) {
          var i = e.length - 2;
          t[Re] = Oe(e.substr(0, i)), t[Be] = Oe(e.substr(i)), f(a).bigHour = !0;
        }), He("hmmss", function (e, t, a) {
          var i = e.length - 4,
            n = e.length - 2;
          t[Re] = Oe(e.substr(0, i)), t[Be] = Oe(e.substr(i, 2)), t[Ue] = Oe(e.substr(n)), f(a).bigHour = !0;
        }), He("Hmm", function (e, t, a) {
          var i = e.length - 2;
          t[Re] = Oe(e.substr(0, i)), t[Be] = Oe(e.substr(i));
        }), He("Hmmss", function (e, t, a) {
          var i = e.length - 4,
            n = e.length - 2;
          t[Re] = Oe(e.substr(0, i)), t[Be] = Oe(e.substr(i, 2)), t[Ue] = Oe(e.substr(n));
        });
        var aa = /[ap]\.?m?\.?/i,
          ia = Ke("Hours", !0);
        function na(e, t, a) {
          return e > 11 ? a ? "pm" : "PM" : a ? "am" : "AM";
        }
        var sa,
          ra = {
            calendar: H,
            longDateFormat: V,
            invalidDate: G,
            ordinal: q,
            dayOfMonthOrdinalParse: K,
            relativeTime: J,
            months: it,
            monthsShort: nt,
            week: Et,
            weekdays: Ht,
            weekdaysMin: Pt,
            weekdaysShort: Ct,
            meridiemParse: aa
          },
          oa = {},
          la = {};
        function ua(e, t) {
          var a,
            i = Math.min(e.length, t.length);
          for (a = 0; a < i; a += 1) if (e[a] !== t[a]) return a;
          return i;
        }
        function da(e) {
          return e ? e.toLowerCase().replace("_", "-") : e;
        }
        function ca(e) {
          for (var t, a, i, n, s = 0; s < e.length;) {
            for (t = (n = da(e[s]).split("-")).length, a = (a = da(e[s + 1])) ? a.split("-") : null; t > 0;) {
              if (i = pa(n.slice(0, t).join("-"))) return i;
              if (a && a.length >= t && ua(n, a) >= t - 1) break;
              t--;
            }
            s++;
          }
          return sa;
        }
        function ha(e) {
          return !(!e || !e.match("^[^/\\\\]*$"));
        }
        function pa(t) {
          var a = null;
          if (void 0 === oa[t] && e && e.exports && ha(t)) try {
            a = sa._abbr, pn("./locale/" + t), ma(a);
          } catch (e) {
            oa[t] = null;
          }
          return oa[t];
        }
        function ma(e, t) {
          var a;
          return e && ((a = u(t) ? va(e) : ga(e, t)) ? sa = a : "undefined" != typeof console && console.warn && console.warn("Locale " + e + " not found. Did you forget to load it?")), sa._abbr;
        }
        function ga(e, t) {
          if (null !== t) {
            var a,
              i = ra;
            if (t.abbr = e, null != oa[e]) x("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), i = oa[e]._config;else if (null != t.parentLocale) if (null != oa[t.parentLocale]) i = oa[t.parentLocale]._config;else {
              if (null == (a = pa(t.parentLocale))) return la[t.parentLocale] || (la[t.parentLocale] = []), la[t.parentLocale].push({
                name: e,
                config: t
              }), null;
              i = a._config;
            }
            return oa[e] = new D(O(i, t)), la[e] && la[e].forEach(function (e) {
              ga(e.name, e.config);
            }), ma(e), oa[e];
          }
          return delete oa[e], null;
        }
        function fa(e, t) {
          if (null != t) {
            var a,
              i,
              n = ra;
            null != oa[e] && null != oa[e].parentLocale ? oa[e].set(O(oa[e]._config, t)) : (null != (i = pa(e)) && (n = i._config), t = O(n, t), null == i && (t.abbr = e), (a = new D(t)).parentLocale = oa[e], oa[e] = a), ma(e);
          } else null != oa[e] && (null != oa[e].parentLocale ? (oa[e] = oa[e].parentLocale, e === ma() && ma(e)) : null != oa[e] && delete oa[e]);
          return oa[e];
        }
        function va(e) {
          var t;
          if (e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e) return sa;
          if (!s(e)) {
            if (t = pa(e)) return t;
            e = [e];
          }
          return ca(e);
        }
        function ba() {
          return M(oa);
        }
        function ya(e) {
          var t,
            a = e._a;
          return a && -2 === f(e).overflow && (t = a[je] < 0 || a[je] > 11 ? je : a[Ie] < 1 || a[Ie] > at(a[Le], a[je]) ? Ie : a[Re] < 0 || a[Re] > 24 || 24 === a[Re] && (0 !== a[Be] || 0 !== a[Ue] || 0 !== a[Ye]) ? Re : a[Be] < 0 || a[Be] > 59 ? Be : a[Ue] < 0 || a[Ue] > 59 ? Ue : a[Ye] < 0 || a[Ye] > 999 ? Ye : -1, f(e)._overflowDayOfYear && (t < Le || t > Ie) && (t = Ie), f(e)._overflowWeeks && -1 === t && (t = Fe), f(e)._overflowWeekday && -1 === t && (t = Ve), f(e).overflow = t), e;
        }
        var _a = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
          wa = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
          ka = /Z|[+-]\d\d(?::?\d\d)?/,
          $a = [["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/], ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/], ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/], ["GGGG-[W]WW", /\d{4}-W\d\d/, !1], ["YYYY-DDD", /\d{4}-\d{3}/], ["YYYY-MM", /\d{4}-\d\d/, !1], ["YYYYYYMMDD", /[+-]\d{10}/], ["YYYYMMDD", /\d{8}/], ["GGGG[W]WWE", /\d{4}W\d{3}/], ["GGGG[W]WW", /\d{4}W\d{2}/, !1], ["YYYYDDD", /\d{7}/], ["YYYYMM", /\d{6}/, !1], ["YYYY", /\d{4}/, !1]],
          Sa = [["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/], ["HH:mm:ss", /\d\d:\d\d:\d\d/], ["HH:mm", /\d\d:\d\d/], ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/], ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/], ["HHmmss", /\d\d\d\d\d\d/], ["HHmm", /\d\d\d\d/], ["HH", /\d\d/]],
          Ea = /^\/?Date\((-?\d+)/i,
          Ma = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
          Aa = {
            UT: 0,
            GMT: 0,
            EDT: -240,
            EST: -300,
            CDT: -300,
            CST: -360,
            MDT: -360,
            MST: -420,
            PDT: -420,
            PST: -480
          };
        function xa(e) {
          var t,
            a,
            i,
            n,
            s,
            r,
            o = e._i,
            l = _a.exec(o) || wa.exec(o),
            u = $a.length,
            d = Sa.length;
          if (l) {
            for (f(e).iso = !0, t = 0, a = u; t < a; t++) if ($a[t][1].exec(l[1])) {
              n = $a[t][0], i = !1 !== $a[t][2];
              break;
            }
            if (null == n) return void (e._isValid = !1);
            if (l[3]) {
              for (t = 0, a = d; t < a; t++) if (Sa[t][1].exec(l[3])) {
                s = (l[2] || " ") + Sa[t][0];
                break;
              }
              if (null == s) return void (e._isValid = !1);
            }
            if (!i && null != s) return void (e._isValid = !1);
            if (l[4]) {
              if (!ka.exec(l[4])) return void (e._isValid = !1);
              r = "Z";
            }
            e._f = n + (s || "") + (r || ""), Ra(e);
          } else e._isValid = !1;
        }
        function Ta(e, t, a, i, n, s) {
          var r = [za(e), nt.indexOf(t), parseInt(a, 10), parseInt(i, 10), parseInt(n, 10)];
          return s && r.push(parseInt(s, 10)), r;
        }
        function za(e) {
          var t = parseInt(e, 10);
          return t <= 49 ? 2e3 + t : t <= 999 ? 1900 + t : t;
        }
        function Oa(e) {
          return e.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
        }
        function Da(e, t, a) {
          return !e || Ct.indexOf(e) === new Date(t[0], t[1], t[2]).getDay() || (f(a).weekdayMismatch = !0, a._isValid = !1, !1);
        }
        function Ha(e, t, a) {
          if (e) return Aa[e];
          if (t) return 0;
          var i = parseInt(a, 10),
            n = i % 100;
          return (i - n) / 100 * 60 + n;
        }
        function Ca(e) {
          var t,
            a = Ma.exec(Oa(e._i));
          if (a) {
            if (t = Ta(a[4], a[3], a[2], a[5], a[6], a[7]), !Da(a[1], t, e)) return;
            e._a = t, e._tzm = Ha(a[8], a[9], a[10]), e._d = yt.apply(null, e._a), e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), f(e).rfc2822 = !0;
          } else e._isValid = !1;
        }
        function Pa(e) {
          var t = Ea.exec(e._i);
          null === t ? (xa(e), !1 === e._isValid && (delete e._isValid, Ca(e), !1 === e._isValid && (delete e._isValid, e._strict ? e._isValid = !1 : i.createFromInputFallback(e)))) : e._d = new Date(+t[1]);
        }
        function Na(e, t, a) {
          return null != e ? e : null != t ? t : a;
        }
        function La(e) {
          var t = new Date(i.now());
          return e._useUTC ? [t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()] : [t.getFullYear(), t.getMonth(), t.getDate()];
        }
        function ja(e) {
          var t,
            a,
            i,
            n,
            s,
            r = [];
          if (!e._d) {
            for (i = La(e), e._w && null == e._a[Ie] && null == e._a[je] && Ia(e), null != e._dayOfYear && (s = Na(e._a[Le], i[Le]), (e._dayOfYear > We(s) || 0 === e._dayOfYear) && (f(e)._overflowDayOfYear = !0), a = yt(s, 0, e._dayOfYear), e._a[je] = a.getUTCMonth(), e._a[Ie] = a.getUTCDate()), t = 0; t < 3 && null == e._a[t]; ++t) e._a[t] = r[t] = i[t];
            for (; t < 7; t++) e._a[t] = r[t] = null == e._a[t] ? 2 === t ? 1 : 0 : e._a[t];
            24 === e._a[Re] && 0 === e._a[Be] && 0 === e._a[Ue] && 0 === e._a[Ye] && (e._nextDay = !0, e._a[Re] = 0), e._d = (e._useUTC ? yt : bt).apply(null, r), n = e._useUTC ? e._d.getUTCDay() : e._d.getDay(), null != e._tzm && e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), e._nextDay && (e._a[Re] = 24), e._w && void 0 !== e._w.d && e._w.d !== n && (f(e).weekdayMismatch = !0);
          }
        }
        function Ia(e) {
          var t, a, i, n, s, r, o, l, u;
          null != (t = e._w).GG || null != t.W || null != t.E ? (s = 1, r = 4, a = Na(t.GG, e._a[Le], kt(Za(), 1, 4).year), i = Na(t.W, 1), ((n = Na(t.E, 1)) < 1 || n > 7) && (l = !0)) : (s = e._locale._week.dow, r = e._locale._week.doy, u = kt(Za(), s, r), a = Na(t.gg, e._a[Le], u.year), i = Na(t.w, u.week), null != t.d ? ((n = t.d) < 0 || n > 6) && (l = !0) : null != t.e ? (n = t.e + s, (t.e < 0 || t.e > 6) && (l = !0)) : n = s), i < 1 || i > $t(a, s, r) ? f(e)._overflowWeeks = !0 : null != l ? f(e)._overflowWeekday = !0 : (o = wt(a, i, n, s, r), e._a[Le] = o.year, e._dayOfYear = o.dayOfYear);
        }
        function Ra(e) {
          if (e._f !== i.ISO_8601) {
            if (e._f !== i.RFC_2822) {
              e._a = [], f(e).empty = !0;
              var t,
                a,
                n,
                s,
                r,
                o,
                l,
                u = "" + e._i,
                d = u.length,
                c = 0;
              for (l = (n = F(e._f, e._locale).match(N) || []).length, t = 0; t < l; t++) s = n[t], (a = (u.match(Ae(s, e)) || [])[0]) && ((r = u.substr(0, u.indexOf(a))).length > 0 && f(e).unusedInput.push(r), u = u.slice(u.indexOf(a) + a.length), c += a.length), I[s] ? (a ? f(e).empty = !1 : f(e).unusedTokens.push(s), Pe(s, a, e)) : e._strict && !a && f(e).unusedTokens.push(s);
              f(e).charsLeftOver = d - c, u.length > 0 && f(e).unusedInput.push(u), e._a[Re] <= 12 && !0 === f(e).bigHour && e._a[Re] > 0 && (f(e).bigHour = void 0), f(e).parsedDateParts = e._a.slice(0), f(e).meridiem = e._meridiem, e._a[Re] = Ba(e._locale, e._a[Re], e._meridiem), null !== (o = f(e).era) && (e._a[Le] = e._locale.erasConvertYear(o, e._a[Le])), ja(e), ya(e);
            } else Ca(e);
          } else xa(e);
        }
        function Ba(e, t, a) {
          var i;
          return null == a ? t : null != e.meridiemHour ? e.meridiemHour(t, a) : null != e.isPM ? ((i = e.isPM(a)) && t < 12 && (t += 12), i || 12 !== t || (t = 0), t) : t;
        }
        function Ua(e) {
          var t,
            a,
            i,
            n,
            s,
            r,
            o = !1,
            l = e._f.length;
          if (0 === l) return f(e).invalidFormat = !0, void (e._d = new Date(NaN));
          for (n = 0; n < l; n++) s = 0, r = !1, t = w({}, e), null != e._useUTC && (t._useUTC = e._useUTC), t._f = e._f[n], Ra(t), v(t) && (r = !0), s += f(t).charsLeftOver, s += 10 * f(t).unusedTokens.length, f(t).score = s, o ? s < i && (i = s, a = t) : (null == i || s < i || r) && (i = s, a = t, r && (o = !0));
          p(e, a || t);
        }
        function Ya(e) {
          if (!e._d) {
            var t = ie(e._i),
              a = void 0 === t.day ? t.date : t.day;
            e._a = h([t.year, t.month, a, t.hour, t.minute, t.second, t.millisecond], function (e) {
              return e && parseInt(e, 10);
            }), ja(e);
          }
        }
        function Fa(e) {
          var t = new k(ya(Va(e)));
          return t._nextDay && (t.add(1, "d"), t._nextDay = void 0), t;
        }
        function Va(e) {
          var t = e._i,
            a = e._f;
          return e._locale = e._locale || va(e._l), null === t || void 0 === a && "" === t ? b({
            nullInput: !0
          }) : ("string" == typeof t && (e._i = t = e._locale.preparse(t)), $(t) ? new k(ya(t)) : (c(t) ? e._d = t : s(a) ? Ua(e) : a ? Ra(e) : Wa(e), v(e) || (e._d = null), e));
        }
        function Wa(e) {
          var t = e._i;
          u(t) ? e._d = new Date(i.now()) : c(t) ? e._d = new Date(t.valueOf()) : "string" == typeof t ? Pa(e) : s(t) ? (e._a = h(t.slice(0), function (e) {
            return parseInt(e, 10);
          }), ja(e)) : r(t) ? Ya(e) : d(t) ? e._d = new Date(t) : i.createFromInputFallback(e);
        }
        function Ga(e, t, a, i, n) {
          var o = {};
          return !0 !== t && !1 !== t || (i = t, t = void 0), !0 !== a && !1 !== a || (i = a, a = void 0), (r(e) && l(e) || s(e) && 0 === e.length) && (e = void 0), o._isAMomentObject = !0, o._useUTC = o._isUTC = n, o._l = a, o._i = e, o._f = t, o._strict = i, Fa(o);
        }
        function Za(e, t, a, i) {
          return Ga(e, t, a, i, !1);
        }
        i.createFromInputFallback = E("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function (e) {
          e._d = new Date(e._i + (e._useUTC ? " UTC" : ""));
        }), i.ISO_8601 = function () {}, i.RFC_2822 = function () {};
        var qa = E("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function () {
            var e = Za.apply(null, arguments);
            return this.isValid() && e.isValid() ? e < this ? this : e : b();
          }),
          Ka = E("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function () {
            var e = Za.apply(null, arguments);
            return this.isValid() && e.isValid() ? e > this ? this : e : b();
          });
        function Xa(e, t) {
          var a, i;
          if (1 === t.length && s(t[0]) && (t = t[0]), !t.length) return Za();
          for (a = t[0], i = 1; i < t.length; ++i) t[i].isValid() && !t[i][e](a) || (a = t[i]);
          return a;
        }
        function Ja() {
          return Xa("isBefore", [].slice.call(arguments, 0));
        }
        function Qa() {
          return Xa("isAfter", [].slice.call(arguments, 0));
        }
        var ei = function () {
            return Date.now ? Date.now() : +new Date();
          },
          ti = ["year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond"];
        function ai(e) {
          var t,
            a,
            i = !1,
            n = ti.length;
          for (t in e) if (o(e, t) && (-1 === Ge.call(ti, t) || null != e[t] && isNaN(e[t]))) return !1;
          for (a = 0; a < n; ++a) if (e[ti[a]]) {
            if (i) return !1;
            parseFloat(e[ti[a]]) !== Oe(e[ti[a]]) && (i = !0);
          }
          return !0;
        }
        function ii() {
          return this._isValid;
        }
        function ni() {
          return Ai(NaN);
        }
        function si(e) {
          var t = ie(e),
            a = t.year || 0,
            i = t.quarter || 0,
            n = t.month || 0,
            s = t.week || t.isoWeek || 0,
            r = t.day || 0,
            o = t.hour || 0,
            l = t.minute || 0,
            u = t.second || 0,
            d = t.millisecond || 0;
          this._isValid = ai(t), this._milliseconds = +d + 1e3 * u + 6e4 * l + 1e3 * o * 60 * 60, this._days = +r + 7 * s, this._months = +n + 3 * i + 12 * a, this._data = {}, this._locale = va(), this._bubble();
        }
        function ri(e) {
          return e instanceof si;
        }
        function oi(e) {
          return e < 0 ? -1 * Math.round(-1 * e) : Math.round(e);
        }
        function li(e, t, a) {
          var i,
            n = Math.min(e.length, t.length),
            s = Math.abs(e.length - t.length),
            r = 0;
          for (i = 0; i < n; i++) (a && e[i] !== t[i] || !a && Oe(e[i]) !== Oe(t[i])) && r++;
          return r + s;
        }
        function ui(e, t) {
          R(e, 0, 0, function () {
            var e = this.utcOffset(),
              a = "+";
            return e < 0 && (e = -e, a = "-"), a + P(~~(e / 60), 2) + t + P(~~e % 60, 2);
          });
        }
        ui("Z", ":"), ui("ZZ", ""), Me("Z", we), Me("ZZ", we), He(["Z", "ZZ"], function (e, t, a) {
          a._useUTC = !0, a._tzm = ci(we, e);
        });
        var di = /([\+\-]|\d\d)/gi;
        function ci(e, t) {
          var a,
            i,
            n = (t || "").match(e);
          return null === n ? null : 0 === (i = 60 * (a = ((n[n.length - 1] || []) + "").match(di) || ["-", 0, 0])[1] + Oe(a[2])) ? 0 : "+" === a[0] ? i : -i;
        }
        function hi(e, t) {
          var a, n;
          return t._isUTC ? (a = t.clone(), n = ($(e) || c(e) ? e.valueOf() : Za(e).valueOf()) - a.valueOf(), a._d.setTime(a._d.valueOf() + n), i.updateOffset(a, !1), a) : Za(e).local();
        }
        function pi(e) {
          return -Math.round(e._d.getTimezoneOffset());
        }
        function mi(e, t, a) {
          var n,
            s = this._offset || 0;
          if (!this.isValid()) return null != e ? this : NaN;
          if (null != e) {
            if ("string" == typeof e) {
              if (null === (e = ci(we, e))) return this;
            } else Math.abs(e) < 16 && !a && (e *= 60);
            return !this._isUTC && t && (n = pi(this)), this._offset = e, this._isUTC = !0, null != n && this.add(n, "m"), s !== e && (!t || this._changeInProgress ? Di(this, Ai(e - s, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, i.updateOffset(this, !0), this._changeInProgress = null)), this;
          }
          return this._isUTC ? s : pi(this);
        }
        function gi(e, t) {
          return null != e ? ("string" != typeof e && (e = -e), this.utcOffset(e, t), this) : -this.utcOffset();
        }
        function fi(e) {
          return this.utcOffset(0, e);
        }
        function vi(e) {
          return this._isUTC && (this.utcOffset(0, e), this._isUTC = !1, e && this.subtract(pi(this), "m")), this;
        }
        function bi() {
          if (null != this._tzm) this.utcOffset(this._tzm, !1, !0);else if ("string" == typeof this._i) {
            var e = ci(_e, this._i);
            null != e ? this.utcOffset(e) : this.utcOffset(0, !0);
          }
          return this;
        }
        function yi(e) {
          return !!this.isValid() && (e = e ? Za(e).utcOffset() : 0, (this.utcOffset() - e) % 60 == 0);
        }
        function _i() {
          return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
        }
        function wi() {
          if (!u(this._isDSTShifted)) return this._isDSTShifted;
          var e,
            t = {};
          return w(t, this), (t = Va(t))._a ? (e = t._isUTC ? m(t._a) : Za(t._a), this._isDSTShifted = this.isValid() && li(t._a, e.toArray()) > 0) : this._isDSTShifted = !1, this._isDSTShifted;
        }
        function ki() {
          return !!this.isValid() && !this._isUTC;
        }
        function $i() {
          return !!this.isValid() && this._isUTC;
        }
        function Si() {
          return !!this.isValid() && this._isUTC && 0 === this._offset;
        }
        i.updateOffset = function () {};
        var Ei = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
          Mi = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
        function Ai(e, t) {
          var a,
            i,
            n,
            s = e,
            r = null;
          return ri(e) ? s = {
            ms: e._milliseconds,
            d: e._days,
            M: e._months
          } : d(e) || !isNaN(+e) ? (s = {}, t ? s[t] = +e : s.milliseconds = +e) : (r = Ei.exec(e)) ? (a = "-" === r[1] ? -1 : 1, s = {
            y: 0,
            d: Oe(r[Ie]) * a,
            h: Oe(r[Re]) * a,
            m: Oe(r[Be]) * a,
            s: Oe(r[Ue]) * a,
            ms: Oe(oi(1e3 * r[Ye])) * a
          }) : (r = Mi.exec(e)) ? (a = "-" === r[1] ? -1 : 1, s = {
            y: xi(r[2], a),
            M: xi(r[3], a),
            w: xi(r[4], a),
            d: xi(r[5], a),
            h: xi(r[6], a),
            m: xi(r[7], a),
            s: xi(r[8], a)
          }) : null == s ? s = {} : "object" == typeof s && ("from" in s || "to" in s) && (n = zi(Za(s.from), Za(s.to)), (s = {}).ms = n.milliseconds, s.M = n.months), i = new si(s), ri(e) && o(e, "_locale") && (i._locale = e._locale), ri(e) && o(e, "_isValid") && (i._isValid = e._isValid), i;
        }
        function xi(e, t) {
          var a = e && parseFloat(e.replace(",", "."));
          return (isNaN(a) ? 0 : a) * t;
        }
        function Ti(e, t) {
          var a = {};
          return a.months = t.month() - e.month() + 12 * (t.year() - e.year()), e.clone().add(a.months, "M").isAfter(t) && --a.months, a.milliseconds = +t - +e.clone().add(a.months, "M"), a;
        }
        function zi(e, t) {
          var a;
          return e.isValid() && t.isValid() ? (t = hi(t, e), e.isBefore(t) ? a = Ti(e, t) : ((a = Ti(t, e)).milliseconds = -a.milliseconds, a.months = -a.months), a) : {
            milliseconds: 0,
            months: 0
          };
        }
        function Oi(e, t) {
          return function (a, i) {
            var n;
            return null === i || isNaN(+i) || (x(t, "moment()." + t + "(period, number) is deprecated. Please use moment()." + t + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), n = a, a = i, i = n), Di(this, Ai(a, i), e), this;
          };
        }
        function Di(e, t, a, n) {
          var s = t._milliseconds,
            r = oi(t._days),
            o = oi(t._months);
          e.isValid() && (n = null == n || n, o && ht(e, Xe(e, "Month") + o * a), r && Je(e, "Date", Xe(e, "Date") + r * a), s && e._d.setTime(e._d.valueOf() + s * a), n && i.updateOffset(e, r || o));
        }
        Ai.fn = si.prototype, Ai.invalid = ni;
        var Hi = Oi(1, "add"),
          Ci = Oi(-1, "subtract");
        function Pi(e) {
          return "string" == typeof e || e instanceof String;
        }
        function Ni(e) {
          return $(e) || c(e) || Pi(e) || d(e) || ji(e) || Li(e) || null == e;
        }
        function Li(e) {
          var t,
            a,
            i = r(e) && !l(e),
            n = !1,
            s = ["years", "year", "y", "months", "month", "M", "days", "day", "d", "dates", "date", "D", "hours", "hour", "h", "minutes", "minute", "m", "seconds", "second", "s", "milliseconds", "millisecond", "ms"],
            u = s.length;
          for (t = 0; t < u; t += 1) a = s[t], n = n || o(e, a);
          return i && n;
        }
        function ji(e) {
          var t = s(e),
            a = !1;
          return t && (a = 0 === e.filter(function (t) {
            return !d(t) && Pi(e);
          }).length), t && a;
        }
        function Ii(e) {
          var t,
            a,
            i = r(e) && !l(e),
            n = !1,
            s = ["sameDay", "nextDay", "lastDay", "nextWeek", "lastWeek", "sameElse"];
          for (t = 0; t < s.length; t += 1) a = s[t], n = n || o(e, a);
          return i && n;
        }
        function Ri(e, t) {
          var a = e.diff(t, "days", !0);
          return a < -6 ? "sameElse" : a < -1 ? "lastWeek" : a < 0 ? "lastDay" : a < 1 ? "sameDay" : a < 2 ? "nextDay" : a < 7 ? "nextWeek" : "sameElse";
        }
        function Bi(e, t) {
          1 === arguments.length && (arguments[0] ? Ni(arguments[0]) ? (e = arguments[0], t = void 0) : Ii(arguments[0]) && (t = arguments[0], e = void 0) : (e = void 0, t = void 0));
          var a = e || Za(),
            n = hi(a, this).startOf("day"),
            s = i.calendarFormat(this, n) || "sameElse",
            r = t && (T(t[s]) ? t[s].call(this, a) : t[s]);
          return this.format(r || this.localeData().calendar(s, this, Za(a)));
        }
        function Ui() {
          return new k(this);
        }
        function Yi(e, t) {
          var a = $(e) ? e : Za(e);
          return !(!this.isValid() || !a.isValid()) && ("millisecond" === (t = ae(t) || "millisecond") ? this.valueOf() > a.valueOf() : a.valueOf() < this.clone().startOf(t).valueOf());
        }
        function Fi(e, t) {
          var a = $(e) ? e : Za(e);
          return !(!this.isValid() || !a.isValid()) && ("millisecond" === (t = ae(t) || "millisecond") ? this.valueOf() < a.valueOf() : this.clone().endOf(t).valueOf() < a.valueOf());
        }
        function Vi(e, t, a, i) {
          var n = $(e) ? e : Za(e),
            s = $(t) ? t : Za(t);
          return !!(this.isValid() && n.isValid() && s.isValid()) && ("(" === (i = i || "()")[0] ? this.isAfter(n, a) : !this.isBefore(n, a)) && (")" === i[1] ? this.isBefore(s, a) : !this.isAfter(s, a));
        }
        function Wi(e, t) {
          var a,
            i = $(e) ? e : Za(e);
          return !(!this.isValid() || !i.isValid()) && ("millisecond" === (t = ae(t) || "millisecond") ? this.valueOf() === i.valueOf() : (a = i.valueOf(), this.clone().startOf(t).valueOf() <= a && a <= this.clone().endOf(t).valueOf()));
        }
        function Gi(e, t) {
          return this.isSame(e, t) || this.isAfter(e, t);
        }
        function Zi(e, t) {
          return this.isSame(e, t) || this.isBefore(e, t);
        }
        function qi(e, t, a) {
          var i, n, s;
          if (!this.isValid()) return NaN;
          if (!(i = hi(e, this)).isValid()) return NaN;
          switch (n = 6e4 * (i.utcOffset() - this.utcOffset()), t = ae(t)) {
            case "year":
              s = Ki(this, i) / 12;
              break;
            case "month":
              s = Ki(this, i);
              break;
            case "quarter":
              s = Ki(this, i) / 3;
              break;
            case "second":
              s = (this - i) / 1e3;
              break;
            case "minute":
              s = (this - i) / 6e4;
              break;
            case "hour":
              s = (this - i) / 36e5;
              break;
            case "day":
              s = (this - i - n) / 864e5;
              break;
            case "week":
              s = (this - i - n) / 6048e5;
              break;
            default:
              s = this - i;
          }
          return a ? s : ze(s);
        }
        function Ki(e, t) {
          if (e.date() < t.date()) return -Ki(t, e);
          var a = 12 * (t.year() - e.year()) + (t.month() - e.month()),
            i = e.clone().add(a, "months");
          return -(a + (t - i < 0 ? (t - i) / (i - e.clone().add(a - 1, "months")) : (t - i) / (e.clone().add(a + 1, "months") - i))) || 0;
        }
        function Xi() {
          return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        }
        function Ji(e) {
          if (!this.isValid()) return null;
          var t = !0 !== e,
            a = t ? this.clone().utc() : this;
          return a.year() < 0 || a.year() > 9999 ? Y(a, t ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ") : T(Date.prototype.toISOString) ? t ? this.toDate().toISOString() : new Date(this.valueOf() + 60 * this.utcOffset() * 1e3).toISOString().replace("Z", Y(a, "Z")) : Y(a, t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ");
        }
        function Qi() {
          if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
          var e,
            t,
            a,
            i,
            n = "moment",
            s = "";
          return this.isLocal() || (n = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", s = "Z"), e = "[" + n + '("]', t = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", a = "-MM-DD[T]HH:mm:ss.SSS", i = s + '[")]', this.format(e + t + a + i);
        }
        function en(e) {
          e || (e = this.isUtc() ? i.defaultFormatUtc : i.defaultFormat);
          var t = Y(this, e);
          return this.localeData().postformat(t);
        }
        function tn(e, t) {
          return this.isValid() && ($(e) && e.isValid() || Za(e).isValid()) ? Ai({
            to: this,
            from: e
          }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
        }
        function an(e) {
          return this.from(Za(), e);
        }
        function nn(e, t) {
          return this.isValid() && ($(e) && e.isValid() || Za(e).isValid()) ? Ai({
            from: this,
            to: e
          }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
        }
        function sn(e) {
          return this.to(Za(), e);
        }
        function rn(e) {
          var t;
          return void 0 === e ? this._locale._abbr : (null != (t = va(e)) && (this._locale = t), this);
        }
        i.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", i.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
        var on = E("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (e) {
          return void 0 === e ? this.localeData() : this.locale(e);
        });
        function ln() {
          return this._locale;
        }
        var un = 1e3,
          dn = 60 * un,
          cn = 60 * dn,
          hn = 3506328 * cn;
        function mn(e, t) {
          return (e % t + t) % t;
        }
        function gn(e, t, a) {
          return e < 100 && e >= 0 ? new Date(e + 400, t, a) - hn : new Date(e, t, a).valueOf();
        }
        function fn(e, t, a) {
          return e < 100 && e >= 0 ? Date.UTC(e + 400, t, a) - hn : Date.UTC(e, t, a);
        }
        function vn(e) {
          var t, a;
          if (void 0 === (e = ae(e)) || "millisecond" === e || !this.isValid()) return this;
          switch (a = this._isUTC ? fn : gn, e) {
            case "year":
              t = a(this.year(), 0, 1);
              break;
            case "quarter":
              t = a(this.year(), this.month() - this.month() % 3, 1);
              break;
            case "month":
              t = a(this.year(), this.month(), 1);
              break;
            case "week":
              t = a(this.year(), this.month(), this.date() - this.weekday());
              break;
            case "isoWeek":
              t = a(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
              break;
            case "day":
            case "date":
              t = a(this.year(), this.month(), this.date());
              break;
            case "hour":
              t = this._d.valueOf(), t -= mn(t + (this._isUTC ? 0 : this.utcOffset() * dn), cn);
              break;
            case "minute":
              t = this._d.valueOf(), t -= mn(t, dn);
              break;
            case "second":
              t = this._d.valueOf(), t -= mn(t, un);
          }
          return this._d.setTime(t), i.updateOffset(this, !0), this;
        }
        function bn(e) {
          var t, a;
          if (void 0 === (e = ae(e)) || "millisecond" === e || !this.isValid()) return this;
          switch (a = this._isUTC ? fn : gn, e) {
            case "year":
              t = a(this.year() + 1, 0, 1) - 1;
              break;
            case "quarter":
              t = a(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
              break;
            case "month":
              t = a(this.year(), this.month() + 1, 1) - 1;
              break;
            case "week":
              t = a(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
              break;
            case "isoWeek":
              t = a(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
              break;
            case "day":
            case "date":
              t = a(this.year(), this.month(), this.date() + 1) - 1;
              break;
            case "hour":
              t = this._d.valueOf(), t += cn - mn(t + (this._isUTC ? 0 : this.utcOffset() * dn), cn) - 1;
              break;
            case "minute":
              t = this._d.valueOf(), t += dn - mn(t, dn) - 1;
              break;
            case "second":
              t = this._d.valueOf(), t += un - mn(t, un) - 1;
          }
          return this._d.setTime(t), i.updateOffset(this, !0), this;
        }
        function yn() {
          return this._d.valueOf() - 6e4 * (this._offset || 0);
        }
        function _n() {
          return Math.floor(this.valueOf() / 1e3);
        }
        function wn() {
          return new Date(this.valueOf());
        }
        function kn() {
          var e = this;
          return [e.year(), e.month(), e.date(), e.hour(), e.minute(), e.second(), e.millisecond()];
        }
        function $n() {
          var e = this;
          return {
            years: e.year(),
            months: e.month(),
            date: e.date(),
            hours: e.hours(),
            minutes: e.minutes(),
            seconds: e.seconds(),
            milliseconds: e.milliseconds()
          };
        }
        function Sn() {
          return this.isValid() ? this.toISOString() : null;
        }
        function En() {
          return v(this);
        }
        function Mn() {
          return p({}, f(this));
        }
        function An() {
          return f(this).overflow;
        }
        function xn() {
          return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
          };
        }
        function Tn(e, t) {
          var a,
            n,
            s,
            r = this._eras || va("en")._eras;
          for (a = 0, n = r.length; a < n; ++a) switch ("string" == typeof r[a].since && (s = i(r[a].since).startOf("day"), r[a].since = s.valueOf()), typeof r[a].until) {
            case "undefined":
              r[a].until = 1 / 0;
              break;
            case "string":
              s = i(r[a].until).startOf("day").valueOf(), r[a].until = s.valueOf();
          }
          return r;
        }
        function zn(e, t, a) {
          var i,
            n,
            s,
            r,
            o,
            l = this.eras();
          for (e = e.toUpperCase(), i = 0, n = l.length; i < n; ++i) if (s = l[i].name.toUpperCase(), r = l[i].abbr.toUpperCase(), o = l[i].narrow.toUpperCase(), a) switch (t) {
            case "N":
            case "NN":
            case "NNN":
              if (r === e) return l[i];
              break;
            case "NNNN":
              if (s === e) return l[i];
              break;
            case "NNNNN":
              if (o === e) return l[i];
          } else if ([s, r, o].indexOf(e) >= 0) return l[i];
        }
        function On(e, t) {
          var a = e.since <= e.until ? 1 : -1;
          return void 0 === t ? i(e.since).year() : i(e.since).year() + (t - e.offset) * a;
        }
        function Dn() {
          var e,
            t,
            a,
            i = this.localeData().eras();
          for (e = 0, t = i.length; e < t; ++e) {
            if (a = this.clone().startOf("day").valueOf(), i[e].since <= a && a <= i[e].until) return i[e].name;
            if (i[e].until <= a && a <= i[e].since) return i[e].name;
          }
          return "";
        }
        function Hn() {
          var e,
            t,
            a,
            i = this.localeData().eras();
          for (e = 0, t = i.length; e < t; ++e) {
            if (a = this.clone().startOf("day").valueOf(), i[e].since <= a && a <= i[e].until) return i[e].narrow;
            if (i[e].until <= a && a <= i[e].since) return i[e].narrow;
          }
          return "";
        }
        function Cn() {
          var e,
            t,
            a,
            i = this.localeData().eras();
          for (e = 0, t = i.length; e < t; ++e) {
            if (a = this.clone().startOf("day").valueOf(), i[e].since <= a && a <= i[e].until) return i[e].abbr;
            if (i[e].until <= a && a <= i[e].since) return i[e].abbr;
          }
          return "";
        }
        function Pn() {
          var e,
            t,
            a,
            n,
            s = this.localeData().eras();
          for (e = 0, t = s.length; e < t; ++e) if (a = s[e].since <= s[e].until ? 1 : -1, n = this.clone().startOf("day").valueOf(), s[e].since <= n && n <= s[e].until || s[e].until <= n && n <= s[e].since) return (this.year() - i(s[e].since).year()) * a + s[e].offset;
          return this.year();
        }
        function Nn(e) {
          return o(this, "_erasNameRegex") || Yn.call(this), e ? this._erasNameRegex : this._erasRegex;
        }
        function Ln(e) {
          return o(this, "_erasAbbrRegex") || Yn.call(this), e ? this._erasAbbrRegex : this._erasRegex;
        }
        function jn(e) {
          return o(this, "_erasNarrowRegex") || Yn.call(this), e ? this._erasNarrowRegex : this._erasRegex;
        }
        function In(e, t) {
          return t.erasAbbrRegex(e);
        }
        function Rn(e, t) {
          return t.erasNameRegex(e);
        }
        function Bn(e, t) {
          return t.erasNarrowRegex(e);
        }
        function Un(e, t) {
          return t._eraYearOrdinalRegex || be;
        }
        function Yn() {
          var e,
            t,
            a,
            i,
            n,
            s = [],
            r = [],
            o = [],
            l = [],
            u = this.eras();
          for (e = 0, t = u.length; e < t; ++e) a = Te(u[e].name), i = Te(u[e].abbr), n = Te(u[e].narrow), r.push(a), s.push(i), o.push(n), l.push(a), l.push(i), l.push(n);
          this._erasRegex = new RegExp("^(" + l.join("|") + ")", "i"), this._erasNameRegex = new RegExp("^(" + r.join("|") + ")", "i"), this._erasAbbrRegex = new RegExp("^(" + s.join("|") + ")", "i"), this._erasNarrowRegex = new RegExp("^(" + o.join("|") + ")", "i");
        }
        function Fn(e, t) {
          R(0, [e, e.length], 0, t);
        }
        function Vn(e) {
          return Xn.call(this, e, this.week(), this.weekday() + this.localeData()._week.dow, this.localeData()._week.dow, this.localeData()._week.doy);
        }
        function Wn(e) {
          return Xn.call(this, e, this.isoWeek(), this.isoWeekday(), 1, 4);
        }
        function Gn() {
          return $t(this.year(), 1, 4);
        }
        function Zn() {
          return $t(this.isoWeekYear(), 1, 4);
        }
        function qn() {
          var e = this.localeData()._week;
          return $t(this.year(), e.dow, e.doy);
        }
        function Kn() {
          var e = this.localeData()._week;
          return $t(this.weekYear(), e.dow, e.doy);
        }
        function Xn(e, t, a, i, n) {
          var s;
          return null == e ? kt(this, i, n).year : (t > (s = $t(e, i, n)) && (t = s), Jn.call(this, e, t, a, i, n));
        }
        function Jn(e, t, a, i, n) {
          var s = wt(e, t, a, i, n),
            r = yt(s.year, 0, s.dayOfYear);
          return this.year(r.getUTCFullYear()), this.month(r.getUTCMonth()), this.date(r.getUTCDate()), this;
        }
        function Qn(e) {
          return null == e ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (e - 1) + this.month() % 3);
        }
        R("N", 0, 0, "eraAbbr"), R("NN", 0, 0, "eraAbbr"), R("NNN", 0, 0, "eraAbbr"), R("NNNN", 0, 0, "eraName"), R("NNNNN", 0, 0, "eraNarrow"), R("y", ["y", 1], "yo", "eraYear"), R("y", ["yy", 2], 0, "eraYear"), R("y", ["yyy", 3], 0, "eraYear"), R("y", ["yyyy", 4], 0, "eraYear"), Me("N", In), Me("NN", In), Me("NNN", In), Me("NNNN", Rn), Me("NNNNN", Bn), He(["N", "NN", "NNN", "NNNN", "NNNNN"], function (e, t, a, i) {
          var n = a._locale.erasParse(e, i, a._strict);
          n ? f(a).era = n : f(a).invalidEra = e;
        }), Me("y", be), Me("yy", be), Me("yyy", be), Me("yyyy", be), Me("yo", Un), He(["y", "yy", "yyy", "yyyy"], Le), He(["yo"], function (e, t, a, i) {
          var n;
          a._locale._eraYearOrdinalRegex && (n = e.match(a._locale._eraYearOrdinalRegex)), a._locale.eraYearOrdinalParse ? t[Le] = a._locale.eraYearOrdinalParse(e, n) : t[Le] = parseInt(e, 10);
        }), R(0, ["gg", 2], 0, function () {
          return this.weekYear() % 100;
        }), R(0, ["GG", 2], 0, function () {
          return this.isoWeekYear() % 100;
        }), Fn("gggg", "weekYear"), Fn("ggggg", "weekYear"), Fn("GGGG", "isoWeekYear"), Fn("GGGGG", "isoWeekYear"), Me("G", ye), Me("g", ye), Me("GG", he, le), Me("gg", he, le), Me("GGGG", fe, de), Me("gggg", fe, de), Me("GGGGG", ve, ce), Me("ggggg", ve, ce), Ce(["gggg", "ggggg", "GGGG", "GGGGG"], function (e, t, a, i) {
          t[i.substr(0, 2)] = Oe(e);
        }), Ce(["gg", "GG"], function (e, t, a, n) {
          t[n] = i.parseTwoDigitYear(e);
        }), R("Q", 0, "Qo", "quarter"), Me("Q", oe), He("Q", function (e, t) {
          t[je] = 3 * (Oe(e) - 1);
        }), R("D", ["DD", 2], "Do", "date"), Me("D", he, Se), Me("DD", he, le), Me("Do", function (e, t) {
          return e ? t._dayOfMonthOrdinalParse || t._ordinalParse : t._dayOfMonthOrdinalParseLenient;
        }), He(["D", "DD"], Ie), He("Do", function (e, t) {
          t[Ie] = Oe(e.match(he)[0]);
        });
        var es = Ke("Date", !0);
        function ts(e) {
          var t = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
          return null == e ? t : this.add(e - t, "d");
        }
        R("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), Me("DDD", ge), Me("DDDD", ue), He(["DDD", "DDDD"], function (e, t, a) {
          a._dayOfYear = Oe(e);
        }), R("m", ["mm", 2], 0, "minute"), Me("m", he, Ee), Me("mm", he, le), He(["m", "mm"], Be);
        var as = Ke("Minutes", !1);
        R("s", ["ss", 2], 0, "second"), Me("s", he, Ee), Me("ss", he, le), He(["s", "ss"], Ue);
        var is,
          ns,
          ss = Ke("Seconds", !1);
        for (R("S", 0, 0, function () {
          return ~~(this.millisecond() / 100);
        }), R(0, ["SS", 2], 0, function () {
          return ~~(this.millisecond() / 10);
        }), R(0, ["SSS", 3], 0, "millisecond"), R(0, ["SSSS", 4], 0, function () {
          return 10 * this.millisecond();
        }), R(0, ["SSSSS", 5], 0, function () {
          return 100 * this.millisecond();
        }), R(0, ["SSSSSS", 6], 0, function () {
          return 1e3 * this.millisecond();
        }), R(0, ["SSSSSSS", 7], 0, function () {
          return 1e4 * this.millisecond();
        }), R(0, ["SSSSSSSS", 8], 0, function () {
          return 1e5 * this.millisecond();
        }), R(0, ["SSSSSSSSS", 9], 0, function () {
          return 1e6 * this.millisecond();
        }), Me("S", ge, oe), Me("SS", ge, le), Me("SSS", ge, ue), is = "SSSS"; is.length <= 9; is += "S") Me(is, be);
        function rs(e, t) {
          t[Ye] = Oe(1e3 * ("0." + e));
        }
        for (is = "S"; is.length <= 9; is += "S") He(is, rs);
        function os() {
          return this._isUTC ? "UTC" : "";
        }
        function ls() {
          return this._isUTC ? "Coordinated Universal Time" : "";
        }
        ns = Ke("Milliseconds", !1), R("z", 0, 0, "zoneAbbr"), R("zz", 0, 0, "zoneName");
        var us = k.prototype;
        function ds(e) {
          return Za(1e3 * e);
        }
        function cs() {
          return Za.apply(null, arguments).parseZone();
        }
        function hs(e) {
          return e;
        }
        us.add = Hi, us.calendar = Bi, us.clone = Ui, us.diff = qi, us.endOf = bn, us.format = en, us.from = tn, us.fromNow = an, us.to = nn, us.toNow = sn, us.get = Qe, us.invalidAt = An, us.isAfter = Yi, us.isBefore = Fi, us.isBetween = Vi, us.isSame = Wi, us.isSameOrAfter = Gi, us.isSameOrBefore = Zi, us.isValid = En, us.lang = on, us.locale = rn, us.localeData = ln, us.max = Ka, us.min = qa, us.parsingFlags = Mn, us.set = et, us.startOf = vn, us.subtract = Ci, us.toArray = kn, us.toObject = $n, us.toDate = wn, us.toISOString = Ji, us.inspect = Qi, "undefined" != typeof Symbol && null != Symbol.for && (us[Symbol.for("nodejs.util.inspect.custom")] = function () {
          return "Moment<" + this.format() + ">";
        }), us.toJSON = Sn, us.toString = Xi, us.unix = _n, us.valueOf = yn, us.creationData = xn, us.eraName = Dn, us.eraNarrow = Hn, us.eraAbbr = Cn, us.eraYear = Pn, us.year = Ze, us.isLeapYear = qe, us.weekYear = Vn, us.isoWeekYear = Wn, us.quarter = us.quarters = Qn, us.month = pt, us.daysInMonth = mt, us.week = us.weeks = xt, us.isoWeek = us.isoWeeks = Tt, us.weeksInYear = qn, us.weeksInWeekYear = Kn, us.isoWeeksInYear = Gn, us.isoWeeksInISOWeekYear = Zn, us.date = es, us.day = us.days = Ft, us.weekday = Vt, us.isoWeekday = Wt, us.dayOfYear = ts, us.hour = us.hours = ia, us.minute = us.minutes = as, us.second = us.seconds = ss, us.millisecond = us.milliseconds = ns, us.utcOffset = mi, us.utc = fi, us.local = vi, us.parseZone = bi, us.hasAlignedHourOffset = yi, us.isDST = _i, us.isLocal = ki, us.isUtcOffset = $i, us.isUtc = Si, us.isUTC = Si, us.zoneAbbr = os, us.zoneName = ls, us.dates = E("dates accessor is deprecated. Use date instead.", es), us.months = E("months accessor is deprecated. Use month instead", pt), us.years = E("years accessor is deprecated. Use year instead", Ze), us.zone = E("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", gi), us.isDSTShifted = E("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", wi);
        var ps = D.prototype;
        function ms(e, t, a, i) {
          var n = va(),
            s = m().set(i, t);
          return n[a](s, e);
        }
        function gs(e, t, a) {
          if (d(e) && (t = e, e = void 0), e = e || "", null != t) return ms(e, t, a, "month");
          var i,
            n = [];
          for (i = 0; i < 12; i++) n[i] = ms(e, i, a, "month");
          return n;
        }
        function fs(e, t, a, i) {
          "boolean" == typeof e ? (d(t) && (a = t, t = void 0), t = t || "") : (a = t = e, e = !1, d(t) && (a = t, t = void 0), t = t || "");
          var n,
            s = va(),
            r = e ? s._week.dow : 0,
            o = [];
          if (null != a) return ms(t, (a + r) % 7, i, "day");
          for (n = 0; n < 7; n++) o[n] = ms(t, (n + r) % 7, i, "day");
          return o;
        }
        function vs(e, t) {
          return gs(e, t, "months");
        }
        function bs(e, t) {
          return gs(e, t, "monthsShort");
        }
        function ys(e, t, a) {
          return fs(e, t, a, "weekdays");
        }
        function _s(e, t, a) {
          return fs(e, t, a, "weekdaysShort");
        }
        function ws(e, t, a) {
          return fs(e, t, a, "weekdaysMin");
        }
        ps.calendar = C, ps.longDateFormat = W, ps.invalidDate = Z, ps.ordinal = X, ps.preparse = hs, ps.postformat = hs, ps.relativeTime = Q, ps.pastFuture = ee, ps.set = z, ps.eras = Tn, ps.erasParse = zn, ps.erasConvertYear = On, ps.erasAbbrRegex = Ln, ps.erasNameRegex = Nn, ps.erasNarrowRegex = jn, ps.months = lt, ps.monthsShort = ut, ps.monthsParse = ct, ps.monthsRegex = ft, ps.monthsShortRegex = gt, ps.week = St, ps.firstDayOfYear = At, ps.firstDayOfWeek = Mt, ps.weekdays = It, ps.weekdaysMin = Bt, ps.weekdaysShort = Rt, ps.weekdaysParse = Yt, ps.weekdaysRegex = Gt, ps.weekdaysShortRegex = Zt, ps.weekdaysMinRegex = qt, ps.isPM = ta, ps.meridiem = na, ma("en", {
          eras: [{
            since: "0001-01-01",
            until: 1 / 0,
            offset: 1,
            name: "Anno Domini",
            narrow: "AD",
            abbr: "AD"
          }, {
            since: "0000-12-31",
            until: -1 / 0,
            offset: 1,
            name: "Before Christ",
            narrow: "BC",
            abbr: "BC"
          }],
          dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
          ordinal: function (e) {
            var t = e % 10;
            return e + (1 === Oe(e % 100 / 10) ? "th" : 1 === t ? "st" : 2 === t ? "nd" : 3 === t ? "rd" : "th");
          }
        }), i.lang = E("moment.lang is deprecated. Use moment.locale instead.", ma), i.langData = E("moment.langData is deprecated. Use moment.localeData instead.", va);
        var ks = Math.abs;
        function $s() {
          var e = this._data;
          return this._milliseconds = ks(this._milliseconds), this._days = ks(this._days), this._months = ks(this._months), e.milliseconds = ks(e.milliseconds), e.seconds = ks(e.seconds), e.minutes = ks(e.minutes), e.hours = ks(e.hours), e.months = ks(e.months), e.years = ks(e.years), this;
        }
        function Ss(e, t, a, i) {
          var n = Ai(t, a);
          return e._milliseconds += i * n._milliseconds, e._days += i * n._days, e._months += i * n._months, e._bubble();
        }
        function Es(e, t) {
          return Ss(this, e, t, 1);
        }
        function Ms(e, t) {
          return Ss(this, e, t, -1);
        }
        function As(e) {
          return e < 0 ? Math.floor(e) : Math.ceil(e);
        }
        function xs() {
          var e,
            t,
            a,
            i,
            n,
            s = this._milliseconds,
            r = this._days,
            o = this._months,
            l = this._data;
          return s >= 0 && r >= 0 && o >= 0 || s <= 0 && r <= 0 && o <= 0 || (s += 864e5 * As(zs(o) + r), r = 0, o = 0), l.milliseconds = s % 1e3, e = ze(s / 1e3), l.seconds = e % 60, t = ze(e / 60), l.minutes = t % 60, a = ze(t / 60), l.hours = a % 24, r += ze(a / 24), o += n = ze(Ts(r)), r -= As(zs(n)), i = ze(o / 12), o %= 12, l.days = r, l.months = o, l.years = i, this;
        }
        function Ts(e) {
          return 4800 * e / 146097;
        }
        function zs(e) {
          return 146097 * e / 4800;
        }
        function Os(e) {
          if (!this.isValid()) return NaN;
          var t,
            a,
            i = this._milliseconds;
          if ("month" === (e = ae(e)) || "quarter" === e || "year" === e) switch (t = this._days + i / 864e5, a = this._months + Ts(t), e) {
            case "month":
              return a;
            case "quarter":
              return a / 3;
            case "year":
              return a / 12;
          } else switch (t = this._days + Math.round(zs(this._months)), e) {
            case "week":
              return t / 7 + i / 6048e5;
            case "day":
              return t + i / 864e5;
            case "hour":
              return 24 * t + i / 36e5;
            case "minute":
              return 1440 * t + i / 6e4;
            case "second":
              return 86400 * t + i / 1e3;
            case "millisecond":
              return Math.floor(864e5 * t) + i;
            default:
              throw new Error("Unknown unit " + e);
          }
        }
        function Ds(e) {
          return function () {
            return this.as(e);
          };
        }
        var Hs = Ds("ms"),
          Cs = Ds("s"),
          Ps = Ds("m"),
          Ns = Ds("h"),
          Ls = Ds("d"),
          js = Ds("w"),
          Is = Ds("M"),
          Rs = Ds("Q"),
          Bs = Ds("y"),
          Us = Hs;
        function Ys() {
          return Ai(this);
        }
        function Fs(e) {
          return e = ae(e), this.isValid() ? this[e + "s"]() : NaN;
        }
        function Vs(e) {
          return function () {
            return this.isValid() ? this._data[e] : NaN;
          };
        }
        var Ws = Vs("milliseconds"),
          Gs = Vs("seconds"),
          Zs = Vs("minutes"),
          qs = Vs("hours"),
          Ks = Vs("days"),
          Xs = Vs("months"),
          Js = Vs("years");
        function Qs() {
          return ze(this.days() / 7);
        }
        var er = Math.round,
          tr = {
            ss: 44,
            s: 45,
            m: 45,
            h: 22,
            d: 26,
            w: null,
            M: 11
          };
        function ar(e, t, a, i, n) {
          return n.relativeTime(t || 1, !!a, e, i);
        }
        function ir(e, t, a, i) {
          var n = Ai(e).abs(),
            s = er(n.as("s")),
            r = er(n.as("m")),
            o = er(n.as("h")),
            l = er(n.as("d")),
            u = er(n.as("M")),
            d = er(n.as("w")),
            c = er(n.as("y")),
            h = s <= a.ss && ["s", s] || s < a.s && ["ss", s] || r <= 1 && ["m"] || r < a.m && ["mm", r] || o <= 1 && ["h"] || o < a.h && ["hh", o] || l <= 1 && ["d"] || l < a.d && ["dd", l];
          return null != a.w && (h = h || d <= 1 && ["w"] || d < a.w && ["ww", d]), (h = h || u <= 1 && ["M"] || u < a.M && ["MM", u] || c <= 1 && ["y"] || ["yy", c])[2] = t, h[3] = +e > 0, h[4] = i, ar.apply(null, h);
        }
        function nr(e) {
          return void 0 === e ? er : "function" == typeof e && (er = e, !0);
        }
        function sr(e, t) {
          return void 0 !== tr[e] && (void 0 === t ? tr[e] : (tr[e] = t, "s" === e && (tr.ss = t - 1), !0));
        }
        function rr(e, t) {
          if (!this.isValid()) return this.localeData().invalidDate();
          var a,
            i,
            n = !1,
            s = tr;
          return "object" == typeof e && (t = e, e = !1), "boolean" == typeof e && (n = e), "object" == typeof t && (s = Object.assign({}, tr, t), null != t.s && null == t.ss && (s.ss = t.s - 1)), i = ir(this, !n, s, a = this.localeData()), n && (i = a.pastFuture(+this, i)), a.postformat(i);
        }
        var or = Math.abs;
        function lr(e) {
          return (e > 0) - (e < 0) || +e;
        }
        function ur() {
          if (!this.isValid()) return this.localeData().invalidDate();
          var e,
            t,
            a,
            i,
            n,
            s,
            r,
            o,
            l = or(this._milliseconds) / 1e3,
            u = or(this._days),
            d = or(this._months),
            c = this.asSeconds();
          return c ? (e = ze(l / 60), t = ze(e / 60), l %= 60, e %= 60, a = ze(d / 12), d %= 12, i = l ? l.toFixed(3).replace(/\.?0+$/, "") : "", n = c < 0 ? "-" : "", s = lr(this._months) !== lr(c) ? "-" : "", r = lr(this._days) !== lr(c) ? "-" : "", o = lr(this._milliseconds) !== lr(c) ? "-" : "", n + "P" + (a ? s + a + "Y" : "") + (d ? s + d + "M" : "") + (u ? r + u + "D" : "") + (t || e || l ? "T" : "") + (t ? o + t + "H" : "") + (e ? o + e + "M" : "") + (l ? o + i + "S" : "")) : "P0D";
        }
        var dr = si.prototype;
        return dr.isValid = ii, dr.abs = $s, dr.add = Es, dr.subtract = Ms, dr.as = Os, dr.asMilliseconds = Hs, dr.asSeconds = Cs, dr.asMinutes = Ps, dr.asHours = Ns, dr.asDays = Ls, dr.asWeeks = js, dr.asMonths = Is, dr.asQuarters = Rs, dr.asYears = Bs, dr.valueOf = Us, dr._bubble = xs, dr.clone = Ys, dr.get = Fs, dr.milliseconds = Ws, dr.seconds = Gs, dr.minutes = Zs, dr.hours = qs, dr.days = Ks, dr.weeks = Qs, dr.months = Xs, dr.years = Js, dr.humanize = rr, dr.toISOString = ur, dr.toString = ur, dr.toJSON = ur, dr.locale = rn, dr.localeData = ln, dr.toIsoString = E("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", ur), dr.lang = on, R("X", 0, 0, "unix"), R("x", 0, 0, "valueOf"), Me("x", ye), Me("X", ke), He("X", function (e, t, a) {
          a._d = new Date(1e3 * parseFloat(e));
        }), He("x", function (e, t, a) {
          a._d = new Date(Oe(e));
        }),
        //! moment.js
        i.version = "2.30.1", n(Za), i.fn = us, i.min = Ja, i.max = Qa, i.now = ei, i.utc = m, i.unix = ds, i.months = vs, i.isDate = c, i.locale = ma, i.invalid = b, i.duration = Ai, i.isMoment = $, i.weekdays = ys, i.parseZone = cs, i.localeData = va, i.isDuration = ri, i.monthsShort = bs, i.weekdaysMin = ws, i.defineLocale = ga, i.updateLocale = fa, i.locales = ba, i.weekdaysShort = _s, i.normalizeUnits = ae, i.relativeTimeRounding = nr, i.relativeTimeThreshold = sr, i.calendarFormat = Ri, i.prototype = us, i.HTML5_FMT = {
          DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
          DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
          DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
          DATE: "YYYY-MM-DD",
          TIME: "HH:mm",
          TIME_SECONDS: "HH:mm:ss",
          TIME_MS: "HH:mm:ss.SSS",
          WEEK: "GGGG-[W]WW",
          MONTH: "YYYY-MM"
        }, i;
      }();
    }(gn)), gn.exports),
    vn = hn(fn);
  let bn = class extends ft(ue) {
    constructor() {
      super(...arguments), this.zones = [], this.modules = [], this.mappings = [], this.wateringCalendars = new Map(), this.weatherRecords = new Map(), this.isLoading = !0, this.isSaving = !1, this._updateScheduled = !1, this.globalDebounceTimer = null, this.zoneCache = new Map();
    }
    _scheduleUpdate() {
      this._updateScheduled || (this._updateScheduled = !0, requestAnimationFrame(() => {
        this._updateScheduled = !1, this.requestUpdate();
      }));
    }
    firstUpdated() {
      we().catch(e => {
        console.error("Failed to load HA form:", e);
      });
    }
    hassSubscribe() {
      return this._fetchData().catch(e => {
        console.error("Failed to fetch initial data:", e);
      }), [this.hass.connection.subscribeMessage(() => {
        this._fetchData().catch(e => {
          console.error("Failed to fetch data on config update:", e);
        });
      }, {
        type: ke + "_config_updated"
      })];
    }
    async _fetchData() {
      if (this.hass) try {
        this.isLoading = !0;
        const [e, t, a, i] = await Promise.all([ct(this.hass), ht(this.hass), pt(this.hass), mt(this.hass)]);
        this.config = e, this.zones = t, this.modules = a, this.mappings = i, this._fetchWateringCalendars(), this._fetchWeatherRecords(), this.zoneCache.clear();
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        this.isLoading = !1, this._scheduleUpdate();
      }
    }
    handleCalculateAllZones() {
      var e;
      this.hass && (this.isSaving = !0, (e = this.hass, e.callApi("POST", ke + "/zones", {
        calculate_all: !0
      })).catch(e => {
        console.error("Failed to calculate all zones:", e);
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      }));
    }
    handleUpdateAllZones() {
      var e;
      this.hass && (this.isSaving = !0, (e = this.hass, e.callApi("POST", ke + "/zones", {
        update_all: !0
      })).catch(e => {
        console.error("Failed to update all zones:", e);
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      }));
    }
    handleResetAllBuckets() {
      var e;
      this.hass && (this.isSaving = !0, (e = this.hass, e.callApi("POST", ke + "/zones", {
        reset_all_buckets: !0
      })).catch(e => {
        console.error("Failed to reset all buckets:", e);
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      }));
    }
    handleClearAllWeatherdata() {
      var e;
      this.hass && (this.isSaving = !0, (e = this.hass, e.callApi("POST", ke + "/zones", {
        clear_all_weatherdata: !0
      })).catch(e => {
        console.error("Failed to clear all weather data:", e);
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      }));
    }
    handleAddZone() {
      if (!this.nameInput.value.trim()) return;
      const e = {
        name: this.nameInput.value.trim(),
        size: parseFloat(this.sizeInput.value) || 0,
        throughput: parseFloat(this.throughputInput.value) || 0,
        state: cn.Automatic,
        duration: 0,
        bucket: 0,
        module: void 0,
        old_bucket: 0,
        delta: 0,
        explanation: "",
        multiplier: 1,
        mapping: void 0,
        lead_time: 0,
        maximum_duration: void 0,
        maximum_bucket: void 0,
        drainage_rate: void 0,
        current_drainage: 0
      };
      this.zones = [...this.zones, e], this.isSaving = !0, this.saveToHA(e).then(() => (this.nameInput.value = "", this.sizeInput.value = "", this.throughputInput.value = "", this._fetchData())).catch(e => {
        console.error("Failed to add zone:", e), this.zones = this.zones.slice(0, -1);
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      });
    }
    handleEditZone(e, t) {
      this.hass && (this.zones[e] = t, t.id && this.zoneCache.delete(t.id.toString()), this.globalDebounceTimer && clearTimeout(this.globalDebounceTimer), this.globalDebounceTimer = window.setTimeout(() => {
        this.isSaving = !0, this.saveToHA(t).catch(e => {
          console.error("Failed to save zone:", e);
        }).finally(() => {
          this.isSaving = !1, this._scheduleUpdate();
        }), this.globalDebounceTimer = null;
      }, 500), this._scheduleUpdate());
    }
    handleRemoveZone(e, t) {
      if (!this.hass) return;
      const a = this.zones[t].id;
      if (!Object.values(this.zones).at(t) || null == a) return;
      const i = [...this.zones];
      var n, s;
      this.zones = this.zones.filter((e, a) => a !== t), this.zoneCache.delete(a.toString()), this.isSaving = !0, (n = this.hass, s = a.toString(), n.callApi("POST", ke + "/zones", {
        id: s,
        remove: !0
      })).catch(e => {
        console.error("Failed to delete zone:", e), this.zones = i, this._fetchData().catch(e => {
          console.error("Failed to refresh data after delete error:", e);
        });
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      });
    }
    handleCalculateZone(e) {
      const t = Object.values(this.zones).at(e);
      var a, i;
      t && null != t.id && this.hass && (a = this.hass, i = t.id.toString(), a.callApi("POST", ke + "/zones", {
        id: i,
        calculate: !0,
        override_cache: !0
      }));
    }
    handleUpdateZone(e) {
      const t = Object.values(this.zones).at(e);
      var a, i;
      t && null != t.id && this.hass && (a = this.hass, i = t.id.toString(), a.callApi("POST", ke + "/zones", {
        id: i,
        update: !0
      }));
    }
    handleViewWeatherInfo(e) {
      var t;
      console.log(`handleViewWeatherInfo: Received index=${e}`);
      const a = Object.values(this.zones);
      console.log("handleViewWeatherInfo: Object.values(this.zones)=", a);
      const i = a.at(e);
      if (console.log("handleViewWeatherInfo: Picked zone=", i), !i || null == i.mapping) return void console.log("handleViewWeatherInfo: Early return - zone not found or no mapping");
      const n = `#weather-section-${i.id}`;
      console.log(`handleViewWeatherInfo: Using selector="${n}"`);
      const s = null === (t = this.shadowRoot) || void 0 === t ? void 0 : t.querySelector(n),
        r = !!s;
      if (console.log(`handleViewWeatherInfo: Element found=${r}`), s) {
        const e = s.hasAttribute("hidden");
        console.log(`handleViewWeatherInfo: Hidden state before toggle=${e}`), e ? s.removeAttribute("hidden") : s.setAttribute("hidden", "");
        const t = s.hasAttribute("hidden");
        console.log(`handleViewWeatherInfo: Hidden state after toggle=${t}`);
      }
    }
    handleViewWateringCalendar(e) {
      var t;
      console.log(`handleViewWateringCalendar: Received index=${e}`);
      const a = Object.values(this.zones);
      console.log("handleViewWateringCalendar: Object.values(this.zones)=", a);
      const i = a.at(e);
      if (console.log("handleViewWateringCalendar: Picked zone=", i), !i || null == i.id) return void console.log("handleViewWateringCalendar: Early return - zone not found or no ID");
      const n = `#calendar-section-${i.id}`;
      console.log(`handleViewWateringCalendar: Using selector="${n}"`);
      const s = null === (t = this.shadowRoot) || void 0 === t ? void 0 : t.querySelector(n),
        r = !!s;
      if (console.log(`handleViewWateringCalendar: Element found=${r}`), s) {
        const e = s.hasAttribute("hidden");
        console.log(`handleViewWateringCalendar: Hidden state before toggle=${e}`), e ? s.removeAttribute("hidden") : s.setAttribute("hidden", "");
        const t = s.hasAttribute("hidden");
        console.log(`handleViewWateringCalendar: Hidden state after toggle=${t}`);
      }
    }
    async _fetchWeatherRecords() {
      if (this.hass) {
        for (const e of this.zones) if (void 0 !== e.id && void 0 !== e.mapping) try {
          const t = await gt(this.hass, e.mapping.toString(), 10);
          this.weatherRecords.set(e.id, t);
        } catch (t) {
          console.error(`Failed to fetch weather records for zone ${e.id} (mapping ${e.mapping}):`, t);
        }
        this._scheduleUpdate();
      }
    }
    async _fetchWateringCalendars() {
      if (this.hass) {
        for (const a of this.zones) if (void 0 !== a.id) try {
          const i = await (e = this.hass, t = a.id.toString(), e.callWS({
            type: ke + "/watering_calendar",
            zone_id: t
          }));
          this.wateringCalendars.set(a.id, i);
        } catch (e) {
          console.error(`Failed to fetch watering calendar for zone ${a.id}:`, e);
        }
        var e, t;
        this._scheduleUpdate();
      }
    }
    renderWeatherRecords(e) {
      if (!this.hass || !e.id) return Y``;
      const t = this.weatherRecords.get(e.id) || [];
      return Y`
      <div class="weather-records">
        <h4>${Xi("panels.mappings.weather-records.title", this.hass.language)}</h4>
        ${0 === t.length ? Y`
            <div class="weather-note">
              ${Xi("panels.mappings.weather-records.no-data", this.hass.language)}
            </div>
          ` : Y`
            <div class="weather-table">
              <div class="weather-header">
                <span>${Xi("panels.mappings.weather-records.timestamp", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.temperature", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.humidity", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.precipitation", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.retrieval-time", this.hass.language)}</span>
              </div>
              ${t.slice(0, 10).map(e => Y`
                <div class="weather-row">
                  <span>${vn(e.timestamp).format("MM-DD HH:mm")}</span>
                  <span>${e.temperature ? e.temperature.toFixed(1) + "°C" : "-"}</span>
                  <span>${e.humidity ? e.humidity.toFixed(1) + "%" : "-"}</span>
                  <span>${e.precipitation ? e.precipitation.toFixed(1) + "mm" : "-"}</span>
                  <span>${e.retrieval_time ? vn(e.retrieval_time).format("MM-DD HH:mm") : "-"}</span>
                </div>
              `)}
            </div>
          `}
      </div>
    `;
    }
    renderWateringCalendar(e) {
      if (!this.hass || !e.id) return Y``;
      const t = this.wateringCalendars.get(e.id),
        a = t && e.id in t ? t[e.id] : null,
        i = (null == a ? void 0 : a.monthly_estimates) || [];
      return Y`
      <div class="watering-calendar">
        <h4>Watering Calendar (12-Month Estimates)</h4>
        ${0 === i.length ? Y`
            <div class="calendar-note">
              ${(null == a ? void 0 : a.error) ? `Error generating calendar: ${a.error}` : "No watering calendar data available for this zone"}
            </div>
          ` : Y`
            <div class="calendar-table">
              <div class="calendar-header">
                <span>Month</span>
                <span>ET (mm)</span>
                <span>Precipitation (mm)</span>
                <span>Watering (L)</span>
                <span>Avg Temp (°C)</span>
              </div>
              ${i.map(e => Y`
                <div class="calendar-row">
                  <span>${e.month_name || `Month ${e.month}` || "-"}</span>
                  <span>${e.estimated_et_mm ? e.estimated_et_mm.toFixed(1) : "-"}</span>
                  <span>${e.average_precipitation_mm ? e.average_precipitation_mm.toFixed(1) : "-"}</span>
                  <span>${e.estimated_watering_volume_liters ? e.estimated_watering_volume_liters.toFixed(0) : "-"}</span>
                  <span>${e.average_temperature_c ? e.average_temperature_c.toFixed(1) : "-"}</span>
                </div>
              `)}
            </div>
            ${(null == a ? void 0 : a.calculation_method) ? Y`
              <div class="calendar-info">
                Method: ${a.calculation_method}
              </div>
            ` : ""}
          `}
      </div>
    `;
    }
    async saveToHA(e) {
      if (!this.hass) throw new Error("Home Assistant connection not available");
      var t, a;
      await (t = this.hass, a = e, t.callApi("POST", ke + "/zones", a));
    }
    renderTheOptions(e, t) {
      if (this.hass) {
        let a = Y`<option value="" ?selected=${void 0 === t}">---${Xi("common.labels.select", this.hass.language)}---</option>`;
        return Object.entries(e).map(([e, i]) => a = Y`${a}
            <option
              value="${i.id}"
              ?selected="${t === i.id}"
            >
              ${i.id}: ${i.name}
            </option>`), a;
      }
      return Y``;
    }
    renderZone(e, t) {
      if (this.hass) {
        let a, i, n;
        null != e.explanation && e.explanation.length > 0 && (a = Y`<svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          id="showcalcresults${t}"
          @click="${() => this.toggleExplanation(t)}"
        >
          <title>
            ${Xi("panels.zones.actions.information", this.hass.language)}
          </title>
          <path fill="#404040" d="${un}" />
        </svg>`), e.state === cn.Automatic && (i = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleCalculateZone(t)}"
        >
          <title>
            ${Xi("panels.zones.actions.calculate", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z"}" />
        </svg>`), e.state === cn.Automatic && (n = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleUpdateZone(t)}"
        >
          <title>
            ${Xi("panels.zones.actions.update", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z"}" />
        </svg>`);
        const s = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [nt]: 0
        }))}"}"
        >
          <title>
            ${Xi("panels.zones.actions.reset-bucket", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z"}" />
        </svg>`;
        let r;
        null != e.mapping && (r = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleViewWeatherInfo(t)}"
        >
          <title>
            ${Xi("panels.zones.actions.view-weather-info", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20M6.5 18H18.5Q19.55 18 20.27 17.27 21 16.55 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 9.93 6 8.46 7.46 7 8.93 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M12 12Z"}" />
        </svg>`);
        const o = Y` <svg
        style="width:24px;height:24px"
        viewBox="0 0 24 24"
        @click="${() => this.handleViewWateringCalendar(t)}"
      >
        <title>
          ${Xi("panels.zones.actions.view-watering-calendar", this.hass.language)}
        </title>
        <path fill="#404040" d="${"M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"}" />
      </svg>`;
        let l;
        return null != e.mapping && (l = this.mappings.filter(t => t.id === e.mapping)[0], null != l && null != l.data_last_updated && (e.last_updated = l.data_last_updated, null != l.data && (e.number_of_data_points = l.data.length))), Y`
        <ha-card header="${e.name}">
          <div class="card-content">
            <div class="zone-info-table">
              <div class="zone-info-row">
                <span class="zone-info-label">${Xi("panels.zones.labels.last_calculated", this.hass.language)}:</span>
                <span class="zone-info-value">${e.last_calculated ? vn(e.last_calculated).format("YYYY-MM-DD HH:mm:ss") : "-"}</span>
              </div>
              <div class="zone-info-row">
                <span class="zone-info-label">${Xi("panels.zones.labels.data-last-updated", this.hass.language)}:</span>
                <span class="zone-info-value">${e.last_updated ? vn(e.last_updated).format("YYYY-MM-DD HH:mm:ss") : "-"}</span>
              </div>
              <div class="zone-info-row">
                <span class="zone-info-label">${Xi("panels.zones.labels.data-number-of-data-points", this.hass.language)}:</span>
                <span class="zone-info-value">${e.number_of_data_points}</span>
              </div>
            </div>
          </div>
          <div class="card-content">
            <label for="name${t}"
              >${Xi("panels.zones.labels.name", this.hass.language)}:</label
            >
            <input
              id="name${t}"
              type="text"
              .value="${e.name}"
              @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [Je]: a.target.value
        }))}"
            />
            <div class="zoneline">
              <label for="size${t}"
                >${Xi("panels.zones.labels.size", this.hass.language)}
                (${sn(this.config, Qe)}):</label
              >
              <input class="shortinput" id="size${t}" type="number""
              .value="${e.size}"
              @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [Qe]: parseFloat(a.target.value)
        }))}"
              />
            </div>
            <div class="zoneline">
              <label for="throughput${t}"
                >${Xi("panels.zones.labels.throughput", this.hass.language)}
                (${sn(this.config, et)}):</label
              >
              <input
                class="shortinput"
                id="throughput${t}"
                type="number"
                .value="${e.throughput}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [et]: parseFloat(a.target.value)
        }))}"
              />
            </div>
            <div class="zoneline">
              <label for="drainage_rate${t}"
                >${Xi("panels.zones.labels.drainage_rate", this.hass.language)}
                (${sn(this.config, dt)}):</label
              >
              <input
                class="shortinput"
                id="drainage_rate${t}"
                type="number"
                .value="${e.drainage_rate}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [dt]: parseFloat(a.target.value)
        }))}"
              />
            </div>
            <div class="zoneline">
              <label for="state${t}"
                >${Xi("panels.zones.labels.state", this.hass.language)}:</label
              >
              <select
                required
                id="state${t}"
                @change="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [tt]: a.target.value,
          [at]: 0
        }))}"
              >
                <option
                  value="${cn.Automatic}"
                  ?selected="${e.state === cn.Automatic}"
                >
                  ${Xi("panels.zones.labels.states.automatic", this.hass.language)}
                </option>
                <option
                  value="${cn.Disabled}"
                  ?selected="${e.state === cn.Disabled}"
                >
                  ${Xi("panels.zones.labels.states.disabled", this.hass.language)}
                </option>
                <option
                  value="${cn.Manual}"
                  ?selected="${e.state === cn.Manual}"
                >
                  ${Xi("panels.zones.labels.states.manual", this.hass.language)}
                </option>
              </select>
              <label for="module${t}"
                >${Xi("common.labels.module", this.hass.language)}:</label
              >

              <select
                id="module${t}"
                @change="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [it]: parseInt(a.target.value)
        }))}"
              >
                ${this.renderTheOptions(this.modules, e.module)}
              </select>
              <label for="module${t}"
                >${Xi("panels.zones.labels.mapping", this.hass.language)}:</label
              >

              <select
                id="mapping${t}"
                @change="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [rt]: parseInt(a.target.value)
        }))}"
              >
                ${this.renderTheOptions(this.mappings, e.mapping)}
              </select>
            </div>
            <div class="zoneline">
              <label for="bucket${t}"
                >${Xi("panels.zones.labels.bucket", this.hass.language)}
                (${sn(this.config, nt)}):</label
              >
              <input
                class="shortinput"
                id="bucket${t}"
                type="number"
                .value="${Number(e.bucket).toFixed(1)}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [nt]: parseFloat(a.target.value)
        }))}"
              />
              <label for="maximum-bucket${t}"
                >${Xi("panels.zones.labels.maximum-bucket", this.hass.language)}
                (${sn(this.config, nt)}):</label
              >
              <input
                class="shortinput"
                id="maximum-bucket${t}"
                type="number"
                .value="${Number(e.maximum_bucket).toFixed(1)}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [ut]: parseFloat(a.target.value)
        }))}"
              />
            </div>
            <div class="zoneline">
              <label for="lead_time${t}"
                >${Xi("panels.zones.labels.lead-time", this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="lead_time${t}"
                type="number"
                .value="${e.lead_time}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [ot]: parseInt(a.target.value, 10)
        }))}"
              />
            </div>
            <div class="zoneline">
              <label for="maximum-duration${t}"
                >${Xi("panels.zones.labels.maximum-duration", this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="maximum-duration${t}"
                type="number"
                .value="${e.maximum_duration}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [lt]: parseInt(a.target.value, 10)
        }))}"
              />
            </div>
            <div class="zoneline">
              <label for="multiplier${t}"
                >${Xi("panels.zones.labels.multiplier", this.hass.language)}:</label
              >
              <input
                class="shortinput"
                id="multiplier${t}"
                type="number"
                .value="${e.multiplier}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [st]: parseFloat(a.target.value)
        }))}"
              />
              <label for="duration${t}"
                >${Xi("panels.zones.labels.duration", this.hass.language)}
                (${"s"}):</label
              >
              <input
                class="shortinput"
                id="duration${t}"
                type="number"
                .value="${e.duration}"
                ?readonly="${e.state === cn.Disabled || e.state === cn.Automatic}"
                @input="${a => this.handleEditZone(t, Object.assign(Object.assign({}, e), {
          [at]: parseInt(a.target.value, 10)
        }))}"
              />
            </div>
            <div class="zoneline">
              ${n} ${i}
              ${a} ${s}
              ${r} ${o}
              <svg
                style="width:24px;height:24px"
                viewBox="0 0 24 24"
                id="deleteZone${t}"
                @click="${e => this.handleRemoveZone(e, t)}"
              >
                <title>
                  ${Xi("common.actions.delete", this.hass.language)}
                </title>
                <path fill="#404040" d="${ln}" />
              </svg>
            </div>
            <div class="zoneline">
              <div>
                <label class="hidden" id="calcresults${t}"
                  >${tn("<br/>" + e.explanation)}</label
                >
              </div>
            </div>
            <div id="calendar-section-${e.id}" hidden>
              ${this.renderWateringCalendar(e)}
            </div>
            <div id="weather-section-${e.id}" hidden>
              ${this.renderWeatherRecords(e)}
            </div>
          </div>
        </ha-card>
      `;
      }
      return Y``;
    }
    toggleExplanation(e) {
      var t;
      const a = null === (t = this.shadowRoot) || void 0 === t ? void 0 : t.querySelector("#calcresults" + e);
      a && ("hidden" != a.className ? a.className = "hidden" : a.className = "explanation");
    }
    render() {
      return this.hass ? this.isLoading ? Y`
        <ha-card header="${Xi("panels.zones.title", this.hass.language)}">
          <div class="card-content">
            ${Xi("common.loading", this.hass.language)}...
          </div>
        </ha-card>
      ` : this.config ? Y`
      <ha-card header="${Xi("panels.zones.title", this.hass.language)}">
        <div class="card-content">
          ${Xi("panels.zones.description", this.hass.language)}
          ${this.isSaving ? Y`<div class="saving-indicator">
                ${Xi("common.saving", this.hass.language)}...
              </div>` : ""}
        </div>
      </ha-card>
      <ha-card
        header="${Xi("panels.zones.cards.add-zone.header", this.hass.language)}"
      >
        <div class="card-content">
          <div class="zoneline">
            <label for="nameInput"
              >${Xi("panels.zones.labels.name", this.hass.language)}:</label
            >
            <input id="nameInput" type="text" ?disabled="${this.isSaving}" />
          </div>
          <div class="zoneline">
            <label for="sizeInput"
              >${Xi("panels.zones.labels.size", this.hass.language)}
              (${sn(this.config, Qe)}):</label
            >
            <input
              class="shortinput"
              id="sizeInput"
              type="number"
              ?disabled="${this.isSaving}"
            />
          </div>
          <div class="zoneline">
            <label for="throughputInput"
              >${Xi("panels.zones.labels.throughput", this.hass.language)}
              (${sn(this.config, et)}):</label
            >
            <input
              id="throughputInput"
              class="shortinput"
              type="number"
              ?disabled="${this.isSaving}"
            />
          </div>
          <div class="zoneline">
            <span></span>
            <button @click="${this.handleAddZone}" ?disabled="${this.isSaving}">
              ${Xi("panels.zones.cards.add-zone.actions.add", this.hass.language)}
            </button>
          </div>
        </div>
      </ha-card>
      <ha-card
        header="${Xi("panels.zones.cards.zone-actions.header", this.hass.language)}"
      >
        <div class="card-content">
          <button
            @click="${this.handleUpdateAllZones}"
            ?disabled="${this.isSaving}"
          >
            ${Xi("panels.zones.cards.zone-actions.actions.update-all", this.hass.language)}
          </button>
          <button
            @click="${this.handleCalculateAllZones}"
            ?disabled="${this.isSaving}"
          >
            ${Xi("panels.zones.cards.zone-actions.actions.calculate-all", this.hass.language)}
          </button>
          <button
            @click="${this.handleResetAllBuckets}"
            ?disabled="${this.isSaving}"
          >
            ${Xi("panels.zones.cards.zone-actions.actions.reset-all-buckets", this.hass.language)}
          </button>
          <button
            @click="${this.handleClearAllWeatherdata}"
            ?disabled="${this.isSaving}"
          >
            ${Xi("panels.zones.cards.zone-actions.actions.clear-all-weatherdata", this.hass.language)}
          </button>
        </div>
      </ha-card>

      ${this.zones.map((e, t) => this.renderZone(e, t))}
    ` : Y`
        <ha-card header="${Xi("panels.zones.title", this.hass.language)}">
          <div class="card-content">Configuration not available.</div>
        </ha-card>
      ` : Y``;
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this.globalDebounceTimer && (clearTimeout(this.globalDebounceTimer), this.globalDebounceTimer = null), this.zoneCache.clear();
    }
    static get styles() {
      return c`
      ${on}
      /* View-specific styles only - most common styles are now in globalStyle */
    `;
    }
  };
  n([pe()], bn.prototype, "config", void 0), n([pe({
    type: Array
  })], bn.prototype, "zones", void 0), n([pe({
    type: Array
  })], bn.prototype, "modules", void 0), n([pe({
    type: Array
  })], bn.prototype, "mappings", void 0), n([pe({
    type: Map
  })], bn.prototype, "wateringCalendars", void 0), n([pe({
    type: Map
  })], bn.prototype, "weatherRecords", void 0), n([pe({
    type: Boolean
  })], bn.prototype, "isLoading", void 0), n([pe({
    type: Boolean
  })], bn.prototype, "isSaving", void 0), n([me("#nameInput")], bn.prototype, "nameInput", void 0), n([me("#sizeInput")], bn.prototype, "sizeInput", void 0), n([me("#throughputInput")], bn.prototype, "throughputInput", void 0), bn = n([ce("smart-irrigation-view-zones")], bn);
  let yn = class extends ft(ue) {
    constructor() {
      super(...arguments), this.zones = [], this.modules = [], this.allmodules = [], this.isLoading = !0, this.isSaving = !1, this._updateScheduled = !1, this.globalDebounceTimer = null, this.moduleCache = new Map(), this.debouncedSave = (() => {
        let e = null;
        return t => {
          e && clearTimeout(e), e = window.setTimeout(() => {
            this.saveToHA(t), e = null;
          }, 500);
        };
      })();
    }
    _scheduleUpdate() {
      this._updateScheduled || (this._updateScheduled = !0, requestAnimationFrame(() => {
        this._updateScheduled = !1, this.requestUpdate();
      }));
    }
    firstUpdated() {
      we().catch(e => {
        console.error("Failed to load HA form:", e);
      });
    }
    hassSubscribe() {
      return this._fetchData().catch(e => {
        console.error("Failed to fetch initial data:", e);
      }), [this.hass.connection.subscribeMessage(() => {
        this._fetchData().catch(e => {
          console.error("Failed to fetch data on config update:", e);
        });
      }, {
        type: ke + "_config_updated"
      })];
    }
    async _fetchData() {
      if (this.hass) {
        this.isLoading = !0, this._scheduleUpdate();
        try {
          const [t, a, i, n] = await Promise.all([ct(this.hass), ht(this.hass), pt(this.hass), (e = this.hass, e.callWS({
            type: ke + "/allmodules"
          }))]);
          this.config = t, this.zones = a, this.modules = i, this.allmodules = n, this.moduleCache.clear();
        } catch (e) {
          console.error("Error fetching data:", e);
        } finally {
          this.isLoading = !1, this._scheduleUpdate();
        }
        var e;
      }
    }
    async handleAddModule() {
      var e, t;
      if ((null === (t = null === (e = this.moduleInput) || void 0 === e ? void 0 : e.selectedOptions) || void 0 === t ? void 0 : t[0]) && !this.isSaving) {
        this.isSaving = !0, this._scheduleUpdate();
        try {
          const e = this.moduleInput.selectedOptions[0].text,
            t = this.allmodules.find(t => t.name === e);
          if (!t) return;
          const a = {
            name: e,
            description: t.description,
            config: t.config,
            schema: t.schema
          };
          this.modules = [...this.modules, a], this.moduleCache.clear(), this._scheduleUpdate(), await this.saveToHA(a), await this._fetchData();
        } catch (e) {
          console.error("Error adding module:", e), await this._fetchData();
        } finally {
          this.isSaving = !1, this._scheduleUpdate();
        }
      }
    }
    async handleRemoveModule(e, t) {
      if (!this.isSaving) {
        this.isSaving = !0, this._scheduleUpdate();
        try {
          const e = this.modules[t],
            n = null == e ? void 0 : e.id;
          this.modules;
          this.modules = this.modules.filter((e, a) => a !== t), this.moduleCache.clear(), this._scheduleUpdate(), this.hass && void 0 !== n && (await (a = this.hass, i = n.toString(), a.callApi("POST", ke + "/modules", {
            id: i,
            remove: !0
          })));
        } catch (e) {
          console.error("Error removing module:", e), await this._fetchData();
        } finally {
          this.isSaving = !1, this._scheduleUpdate();
        }
        var a, i;
      }
    }
    async saveToHA(e) {
      var t, a;
      if (this.hass) try {
        await (t = this.hass, a = e, t.callApi("POST", ke + "/modules", a));
      } catch (e) {
        throw console.error("Error saving module:", e), e;
      }
    }
    renderModule(e, t) {
      if (!this.hass) return Y``;
      const a = `module-${e.id || t}-${JSON.stringify(e)}`;
      if (this.moduleCache.has(a)) return this.moduleCache.get(a);
      const i = this.zones.filter(t => t.module === e.id).length,
        n = Y`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="moduledescription${t}">${e.description}</div>
          <div class="moduleconfig">
            <label class="subheader"
              >${Xi("panels.modules.cards.module.labels.configuration", this.hass.language)}
              (*
              ${Xi("panels.modules.cards.module.labels.required", this.hass.language)})</label
            >
            ${e.schema ? Object.entries(e.schema).map(([e]) => this.renderConfig(t, e)) : null}
          </div>
          ${i ? Y`<div class="weather-note">
                ${Xi("panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it", this.hass.language)}
              </div>` : Y` <svg
                style="width:24px;height:24px"
                viewBox="0 0 24 24"
                id="deleteZone${t}"
                @click="${e => this.handleRemoveModule(e, t)}"
              >
                <title>
                  ${Xi("common.actions.delete", this.hass.language)}
                </title>
                <path fill="#404040" d="${ln}" />
              </svg>`}
        </div>
      </ha-card>
    `;
      return this.moduleCache.set(a, n), n;
    }
    renderConfig(e, t) {
      const a = Object.values(this.modules).at(e);
      if (!a || !this.hass) return;
      const i = a.schema[t],
        n = i.name,
        s = function (e) {
          if (e) return (e = e.replace("_", " ")).charAt(0).toUpperCase() + e.slice(1);
        }(n);
      let r = "";
      null == a.config && (a.config = []), n in a.config && (r = a.config[n]);
      let o = Y`<label for="${n + e}"
      >${s} </label
    `;
      if ("boolean" == i.type) o = Y`${o}<input
          type="checkbox"
          id="${n + e}"
          .checked=${r}
          @input="${t => this.handleEditConfig(e, Object.assign(Object.assign({}, a), {
        config: Object.assign(Object.assign({}, a.config), {
          [n]: t.target.checked
        })
      }))}"
        />`;else if ("float" == i.type || "integer" == i.type) o = Y`${o}<input
          type="number"
          class="shortinput"
          id="${i.name + e}"
          .value="${a.config[i.name]}"
          @input="${t => this.handleEditConfig(e, Object.assign(Object.assign({}, a), {
        config: Object.assign(Object.assign({}, a.config), {
          [n]: t.target.value
        })
      }))}"
        />`;else if ("string" == i.type) o = Y`${o}<input
          type="text"
          id="${n + e}"
          .value="${r}"
          @input="${t => this.handleEditConfig(e, Object.assign(Object.assign({}, a), {
        config: Object.assign(Object.assign({}, a.config), {
          [n]: t.target.value
        })
      }))}"
        />`;else if ("select" == i.type) {
        const t = this.hass.language;
        o = Y`${o}<select
          id="${n + e}"
          @change="${t => this.handleEditConfig(e, Object.assign(Object.assign({}, a), {
          config: Object.assign(Object.assign({}, a.config), {
            [n]: t.target.value
          })
        }))}"
        >
          ${Object.entries(i.options).map(([e, a]) => Y`<option
                value="${nn(a, 0)}"
                ?selected="${r === nn(a, 0)}"
              >
                ${Xi("panels.modules.cards.module.translated-options." + nn(a, 1), t)}
              </option>`)}
        </select>`;
      }
      return i.required && (o = Y`${o}`), o = Y`<div class="schemaline">${o}</div>`, o;
    }
    handleEditConfig(e, t) {
      this.modules = Object.values(this.modules).map((a, i) => i === e ? t : a), this.moduleCache.clear(), this._scheduleUpdate(), this.debouncedSave(t);
    }
    renderOption(e, t) {
      return this.hass ? Y`<option value="${e}>${t}</option>` : Y``;
    }
    render() {
      return this.hass ? Y`
      <ha-card header="${Xi("panels.modules.title", this.hass.language)}">
        <div class="card-content">
          ${Xi("panels.modules.description", this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${Xi("panels.modules.cards.add-module.header", this.hass.language)}"
      >
        <div class="card-content">
          ${this.isLoading ? Y`<div class="loading-indicator">Loading...</div>` : Y`
                <div class="zoneline">
                  <label for="moduleInput"
                    >${Xi("common.labels.module", this.hass.language)}:</label
                  >
                  <select id="moduleInput" ?disabled="${this.isSaving}">
                    ${Object.entries(this.allmodules).map(([e, t]) => Y`<option value="${t.id}">${t.name}</option>`)}
                  </select>
                </div>
                <div class="zoneline">
                  <span></span>
                  <button
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                    class="${this.isSaving ? "saving" : ""}"
                  >
                    ${this.isSaving ? "Adding..." : Xi("panels.modules.cards.add-module.actions.add", this.hass.language)}
                  </button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading ? Y`<div class="loading-indicator">Loading modules...</div>` : Object.entries(this.modules).map(([e, t]) => this.renderModule(t, parseInt(e)))}
    ` : Y``;
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this.globalDebounceTimer && (clearTimeout(this.globalDebounceTimer), this.globalDebounceTimer = null), this.moduleCache.clear();
    }
    static get styles() {
      return c`
      ${on}
      /* View-specific styles only - most common styles are now in globalStyle */
    `;
    }
  };
  n([pe()], yn.prototype, "config", void 0), n([pe({
    type: Array
  })], yn.prototype, "zones", void 0), n([pe({
    type: Array
  })], yn.prototype, "modules", void 0), n([pe({
    type: Array
  })], yn.prototype, "allmodules", void 0), n([pe({
    type: Boolean
  })], yn.prototype, "isLoading", void 0), n([pe({
    type: Boolean
  })], yn.prototype, "isSaving", void 0), n([me("#moduleInput")], yn.prototype, "moduleInput", void 0), yn = n([ce("smart-irrigation-view-modules")], yn);
  let _n = class extends ft(ue) {
    constructor() {
      super(...arguments), this.zones = [], this.mappings = [], this.weatherRecords = new Map(), this.isLoading = !0, this.isSaving = !1, this.debounceTimers = new Map(), this.globalDebounceTimer = null, this.mappingCache = new Map(), this._updateScheduled = !1, this._lastUpdateTime = 0, this._updateThrottleDelay = 16;
    }
    _scheduleUpdate() {
      if (this._updateScheduled) return;
      const e = performance.now() - this._lastUpdateTime;
      e < this._updateThrottleDelay ? setTimeout(() => {
        this._updateScheduled = !1, this._lastUpdateTime = performance.now(), this.requestUpdate();
      }, this._updateThrottleDelay - e) : (this._updateScheduled = !0, requestAnimationFrame(() => {
        this._updateScheduled = !1, this._lastUpdateTime = performance.now(), this.requestUpdate();
      }));
    }
    firstUpdated() {
      we().catch(e => {
        console.error("Failed to load HA form:", e);
      });
    }
    hassSubscribe() {
      return this._fetchData().catch(e => {
        console.error("Failed to fetch initial data:", e);
      }), [this.hass.connection.subscribeMessage(() => {
        this._fetchData().catch(e => {
          console.error("Failed to fetch data on config update:", e);
        });
      }, {
        type: ke + "_config_updated"
      })];
    }
    async _fetchData() {
      var e;
      if (this.hass) try {
        this.isLoading = !0;
        const [e, t, a] = await Promise.all([ct(this.hass), ht(this.hass), mt(this.hass)]);
        this.config = e, this.zones = t, this.mappings = a, this._fetchWeatherRecords(), this.mappingCache.clear();
      } catch (t) {
        console.error("Error fetching data:", t), rn({
          body: {
            message: "Failed to load mapping data"
          },
          error: "Data fetch error"
        }, null === (e = this.shadowRoot) || void 0 === e ? void 0 : e.querySelector("ha-card"));
      } finally {
        this.isLoading = !1, this._scheduleUpdate();
      }
    }
    async _fetchWeatherRecords() {
      if (this.hass) {
        for (const e of this.mappings) if (void 0 !== e.id) try {
          const t = await gt(this.hass, e.id.toString(), 10);
          this.weatherRecords.set(e.id, t);
        } catch (t) {
          console.error(`Failed to fetch weather records for mapping ${e.id}:`, t);
        }
        this._scheduleUpdate();
      }
    }
    renderWeatherRecords(e) {
      if (!this.hass || !e.id) return Y``;
      const t = this.weatherRecords.get(e.id) || [];
      return Y`
      <div class="weather-records">
        <h4>${Xi("panels.mappings.weather-records.title", this.hass.language)}</h4>
        ${0 === t.length ? Y`
            <div class="weather-note">
              ${Xi("panels.mappings.weather-records.no-data", this.hass.language)}
            </div>
          ` : Y`
            <div class="weather-table">
              <div class="weather-header">
                <span>${Xi("panels.mappings.weather-records.timestamp", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.temperature", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.humidity", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.precipitation", this.hass.language)}</span>
                <span>${Xi("panels.mappings.weather-records.retrieval-time", this.hass.language)}</span>
              </div>
              ${t.slice(0, 10).map(e => Y`
                <div class="weather-row">
                  <span>${vn(e.timestamp).format("MM-DD HH:mm")}</span>
                  <span>${e.temperature ? e.temperature.toFixed(1) + "°C" : "-"}</span>
                  <span>${e.humidity ? e.humidity.toFixed(1) + "%" : "-"}</span>
                  <span>${e.precipitation ? e.precipitation.toFixed(1) + "mm" : "-"}</span>
                  <span>${e.retrieval_time ? vn(e.retrieval_time).format("MM-DD HH:mm") : "-"}</span>
                </div>
              `)}
            </div>
          `}
      </div>
    `;
    }
    handleAddMapping() {
      if (!this.mappingNameInput.value.trim()) return;
      const e = {
          [xe]: "",
          [Te]: "",
          [ze]: "",
          [Oe]: "",
          [De]: "",
          [He]: "",
          [Ce]: "",
          [Pe]: "",
          [Ne]: ""
        },
        t = {
          name: this.mappingNameInput.value.trim(),
          mappings: e
        };
      this.mappings = [...this.mappings, t], this.isSaving = !0, this.saveToHA(t).then(() => (this.mappingNameInput.value = "", this._fetchData())).catch(e => {
        console.error("Failed to add mapping:", e), this.mappings = this.mappings.slice(0, -1);
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      });
    }
    handleRemoveMapping(e, t) {
      const a = this.mappings[t].id;
      if (null == a) return;
      const i = [...this.mappings];
      var n, s;
      (this.mappings = this.mappings.filter((e, a) => a !== t), this.mappingCache.delete(a.toString()), this.hass) && (this.isSaving = !0, (n = this.hass, s = a.toString(), n.callApi("POST", ke + "/mappings", {
        id: s,
        remove: !0
      })).catch(e => {
        console.error("Failed to delete mapping:", e), this.mappings = i, this._fetchData().catch(e => {
          console.error("Failed to refresh data after delete error:", e);
        });
      }).finally(() => {
        this.isSaving = !1, this._scheduleUpdate();
      }));
    }
    handleEditMapping(e, t) {
      this.mappings[e] = t, t.id && this.mappingCache.delete(t.id.toString()), this.globalDebounceTimer && clearTimeout(this.globalDebounceTimer), this.globalDebounceTimer = window.setTimeout(() => {
        this.isSaving = !0, this.saveToHA(t).catch(e => {
          console.error("Failed to save mapping:", e);
        }).finally(() => {
          this.isSaving = !1, this._scheduleUpdate();
        }), this.globalDebounceTimer = null;
      }, 500), this._scheduleUpdate();
    }
    async saveToHA(e) {
      var t;
      if (!this.hass) throw new Error("Home Assistant connection not available");
      const a = [],
        i = this.hass.states;
      for (const t in e.mappings) {
        const n = e.mappings[t].sensorentity;
        if (n && "" !== n.trim()) {
          const s = n.trim();
          e.mappings[t].sensorentity = s, s in i || a.push(s);
        }
      }
      if (a.length > 0) {
        const e = null === (t = this.shadowRoot) || void 0 === t ? void 0 : t.querySelector("ha-card");
        throw e && rn({
          body: {
            message: Xi("panels.mappings.cards.mapping.errors.source_does_not_exist", this.hass.language) + ": " + a.join(", ")
          },
          error: Xi("panels.mappings.cards.mapping.errors.invalid_source", this.hass.language)
        }, e), new Error("Invalid sensor entities found");
      }
      var n, s;
      await (n = this.hass, s = e, n.callApi("POST", ke + "/mappings", s));
    }
    renderMapping(e, t) {
      if (!this.hass) return Y``;
      const a = `${e.id}_${JSON.stringify(e).slice(0, 100)}`;
      if (this.mappingCache.has(a)) return this.mappingCache.get(a);
      const i = this.zones.filter(t => t.mapping === e.id).length,
        n = Y`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${Xi("panels.mappings.labels.mapping-name", this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @input="${a => this.handleEditMapping(t, Object.assign(Object.assign({}, e), {
          name: a.target.value
        }))}"
            />
            ${Object.entries(e.mappings).map(([e]) => this.renderMappingSetting(t, e))}
            ${i ? Y`<div class="weather-note">
                  ${Xi("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it", this.hass.language)}
                </div>` : Y` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${e.id}"
                  @click="${e => this.handleRemoveMapping(e, t)}"
                >
                  <title>
                    ${Xi("common.actions.delete", this.hass.language)}
                  </title>
                  <path fill="#404040" d="${ln}" />
                </svg>`}
          </div>
        </div>
      </ha-card>
    `;
      return this.mappingCache.set(a, n), n;
    }
    renderMappingSetting(e, t) {
      const a = this.mappings[e];
      if (!a || !this.hass) return Y``;
      const i = a.mappings[t];
      return Y`
      <div class="mappingline">
        <div class="mappingsettingname">
          <label for="${`${t}_${e}`}">
            ${Xi(`panels.mappings.cards.mapping.items.${t.toLowerCase()}`, this.hass.language)}
          </label>
        </div>
        <div class="mappingsettingline">
          <label
            >${Xi("panels.mappings.cards.mapping.source", this.hass.language)}:</label
          >
          <div class="radio-group">
            ${this.renderSimpleRadioOptions(e, t, i)}
          </div>
        </div>
        ${this.renderMappingInputsSimple(e, t, i)}
      </div>
    `;
    }
    renderSimpleRadioOptions(e, t, a) {
      if (!this.hass || !this.config) return Y``;
      const i = t === Te || t === Ce,
        n = a[Fe];
      return Y`
      ${!i && this.config.use_weather_service ? Y`
            <label>
              <input
                type="radio"
                name="${t}_${e}_source"
                value="${Le}"
                ?checked="${n === Le}"
                @change="${a => this.handleSimpleSourceChange(e, t, a)}"
              />
              ${Xi("panels.mappings.cards.mapping.sources.weather_service", this.hass.language)}
            </label>
          ` : ""}
      ${i ? Y`
            <label>
              <input
                type="radio"
                name="${t}_${e}_source"
                value="${Ye}"
                ?checked="${n === Ye}"
                @change="${a => this.handleSimpleSourceChange(e, t, a)}"
              />
              ${Xi("panels.mappings.cards.mapping.sources.none", this.hass.language)}
            </label>
          ` : ""}

      <label>
        <input
          type="radio"
          name="${t}_${e}_source"
          value="${je}"
          ?checked="${n === je}"
          @change="${a => this.handleSimpleSourceChange(e, t, a)}"
        />
        ${Xi("panels.mappings.cards.mapping.sources.sensor", this.hass.language)}
      </label>

      <label>
        <input
          type="radio"
          name="${t}_${e}_source"
          value="${Ie}"
          ?checked="${n === Ie}"
          @change="${a => this.handleSimpleSourceChange(e, t, a)}"
        />
        ${Xi("panels.mappings.cards.mapping.sources.static", this.hass.language)}
      </label>
    `;
    }
    renderMappingInputsSimple(e, t, a) {
      if (!this.hass) return Y``;
      const i = a[Fe];
      return i === je ? Y`
        <div class="mappingsettingline">
          <label
            >${Xi("panels.mappings.cards.mapping.sensor-entity", this.hass.language)}:</label
          >
          <input
            type="text"
            .value="${a[Ve] || ""}"
            @change="${a => this.handleSimpleInputChange(e, t, Ve, a)}"
          />
        </div>
      ` : i === Ie ? Y`
        <div class="mappingsettingline">
          <label
            >${Xi("panels.mappings.cards.mapping.static_value", this.hass.language)}:</label
          >
          <input
            type="text"
            .value="${a[We] || ""}"
            @input="${a => this.handleSimpleInputChange(e, t, We, a)}"
          />
        </div>
      ` : Y``;
    }
    handleSimpleSourceChange(e, t, a) {
      const i = this.mappings[e],
        n = a.target.value;
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [Fe]: n,
            [Ve]: ""
          })
        })
      }));
    }
    handleSimpleInputChange(e, t, a, i) {
      const n = this.mappings[e],
        s = i.target.value;
      this.handleEditMapping(e, Object.assign(Object.assign({}, n), {
        mappings: Object.assign(Object.assign({}, n.mappings), {
          [t]: Object.assign(Object.assign({}, n.mappings[t]), {
            [a]: s
          })
        })
      }));
    }
    renderSourceOptions(e, t, a) {
      if (!this.hass) return Y``;
      const i = t === Te || t === Ce;
      return Y`
      <div class="mappingsettingline">
        <label for="${`${t}_${e}`}_source">
          ${Xi("panels.mappings.cards.mapping.source", this.hass.language)}:
        </label>
      </div>
      <div class="radio-group">
        ${i ? "" : this.renderWeatherServiceOption(e, t, a)}
        ${i ? this.renderNoneOption(e, t, a) : ""}
        ${this.renderSensorOption(e, t, a)}
        ${this.renderStaticValueOption(e, t, a)}
      </div>
    `;
    }
    renderWeatherServiceOption(e, t, a) {
      if (!this.hass || !this.config) return Y``;
      const i = `${t}_${e}`,
        n = !this.config.use_weather_service,
        s = this.config.use_weather_service && a[Fe] === Le;
      return Y`
      <label class="${n ? "strikethrough" : ""}">
        <input
          type="radio"
          id="${i}_weather"
          value="${Le}"
          name="${i}_source"
          ?checked="${s}"
          ?disabled="${n}"
          @change="${a => this.handleSourceChange(e, t, a)}"
        />
        ${Xi("panels.mappings.cards.mapping.sources.weather_service", this.hass.language)}
      </label>
    `;
    }
    renderNoneOption(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`,
        n = a[Fe] === Ye;
      return Y`
      <label>
        <input
          type="radio"
          id="${i}_none"
          value="${Ye}"
          name="${i}_source"
          ?checked="${n}"
          @change="${a => this.handleSourceChange(e, t, a)}"
        />
        ${Xi("panels.mappings.cards.mapping.sources.none", this.hass.language)}
      </label>
    `;
    }
    renderSensorOption(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`,
        n = a[Fe] === je;
      return Y`
      <label>
        <input
          type="radio"
          id="${i}_sensor"
          value="${je}"
          name="${i}_source"
          ?checked="${n}"
          @change="${a => this.handleSourceChange(e, t, a)}"
        />
        ${Xi("panels.mappings.cards.mapping.sources.sensor", this.hass.language)}
      </label>
    `;
    }
    renderStaticValueOption(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`,
        n = a[Fe] === Ie;
      return Y`
      <label>
        <input
          type="radio"
          id="${i}_static"
          value="${Ie}"
          name="${i}_source"
          ?checked="${n}"
          @change="${a => this.handleSourceChange(e, t, a)}"
        />
        ${Xi("panels.mappings.cards.mapping.sources.static", this.hass.language)}
      </label>
    `;
    }
    handleSourceChange(e, t, a) {
      const i = this.mappings[e],
        n = a.target.value;
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [Fe]: n,
            [Ve]: ""
          })
        })
      }));
    }
    renderMappingInputs(e, t, a) {
      if (!this.hass) return Y``;
      const i = a[Fe];
      return Y`
      ${i === je ? this.renderSensorInput(e, t, a) : ""}
      ${i === Ie ? this.renderStaticValueInput(e, t, a) : ""}
      ${i === je || i === Ie ? this.renderUnitSelect(e, t, a) : ""}
      ${t !== He || i !== je && i !== Ie ? "" : this.renderPressureTypeSelect(e, t, a)}
      ${i === je ? this.renderAggregateSelect(e, t, a) : ""}
    `;
    }
    renderSensorInput(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`;
      return Y`
      <div class="mappingsettingline">
        <label for="${i}_sensor_entity">
          ${Xi("panels.mappings.cards.mapping.sensor-entity", this.hass.language)}:
        </label>
        <input
          type="text"
          id="${i}_sensor_entity"
          .value="${a[Ve] || ""}"
          @change="${a => this.handleSensorChange(e, t, a)}"
        />
      </div>
    `;
    }
    renderStaticValueInput(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`;
      return Y`
      <div class="mappingsettingline">
        <label for="${i}_static_value">
          ${Xi("panels.mappings.cards.mapping.static_value", this.hass.language)}:
        </label>
        <input
          type="text"
          id="${i}_static_value"
          .value="${a[We] || ""}"
          @input="${a => this.handleStaticValueChange(e, t, a)}"
        />
      </div>
    `;
    }
    renderUnitSelect(e, t, a) {
      if (!this.hass || !this.config) return Y``;
      const i = `${t}_${e}`;
      return Y`
      <div class="mappingsettingline">
        <label for="${i}_unit">
          ${Xi("panels.mappings.cards.mapping.input-units", this.hass.language)}:
        </label>
        <select
          id="${i}_unit"
          @change="${a => this.handleUnitChange(e, t, a)}"
        >
          ${this.renderUnitOptionsForMapping(t, a)}
        </select>
      </div>
    `;
    }
    renderPressureTypeSelect(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`;
      return Y`
      <div class="mappingsettingline">
        <label for="${i}_pressure_type">
          ${Xi("panels.mappings.cards.mapping.pressure-type", this.hass.language)}:
        </label>
        <select
          id="${i}_pressure_type"
          @change="${a => this.handlePressureTypeChange(e, t, a)}"
        >
          ${this.renderPressureTypes(t, a)}
        </select>
      </div>
    `;
    }
    renderAggregateSelect(e, t, a) {
      if (!this.hass) return Y``;
      const i = `${t}_${e}`;
      return Y`
      <div class="mappingsettingline">
        <label for="${i}_aggregate">
          ${Xi("panels.mappings.cards.mapping.sensor-aggregate-use-the", this.hass.language)}
        </label>
        <select
          id="${i}_aggregate"
          @change="${a => this.handleAggregateChange(e, t, a)}"
        >
          ${this.renderAggregateOptionsForMapping(t, a)}
        </select>
        <label for="${i}_aggregate">
          ${Xi("panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate", this.hass.language)}
        </label>
      </div>
    `;
    }
    handleSensorChange(e, t, a) {
      const i = this.mappings[e];
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [Ve]: a.target.value
          })
        })
      }));
    }
    handleStaticValueChange(e, t, a) {
      const i = this.mappings[e];
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [We]: a.target.value
          })
        })
      }));
    }
    handleUnitChange(e, t, a) {
      const i = this.mappings[e];
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [Ge]: a.target.value
          })
        })
      }));
    }
    handlePressureTypeChange(e, t, a) {
      const i = this.mappings[e];
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [Re]: a.target.value
          })
        })
      }));
    }
    handleAggregateChange(e, t, a) {
      const i = this.mappings[e];
      this.handleEditMapping(e, Object.assign(Object.assign({}, i), {
        mappings: Object.assign(Object.assign({}, i.mappings), {
          [t]: Object.assign(Object.assign({}, i.mappings[t]), {
            [Ze]: a.target.value
          })
        })
      }));
    }
    renderAggregateOptionsForMapping(e, t) {
      if (!this.hass || !this.config) return Y``;
      let a = "average";
      return e === Oe && (a = "maximum"), e === De && (a = "last"), t[Ze] && (a = t[Ze]), Y`
      ${qe.map(e => this.renderAggregateOption(e, a))}
    `;
    }
    renderAggregateOption(e, t) {
      if (this.hass && this.config) {
        return Y`<option value="${e}" ?selected="${e === t}">
        ${Xi("panels.mappings.cards.mapping.aggregates." + e, this.hass.language)}
      </option>`;
      }
      return Y``;
    }
    renderPressureTypes(e, t) {
      if (this.hass && this.config) {
        let e = Y``;
        const a = t[Re];
        return e = Y`${e}
        <option
          value="${Be}"
          ?selected="${a === Be}"
        >
          ${Xi("panels.mappings.cards.mapping.pressure_types." + Be, this.hass.language)}
        </option>
        <option
          value="${Ue}"
          ?selected="${a === Ue}"
        >
          ${Xi("panels.mappings.cards.mapping.pressure_types." + Ue, this.hass.language)}
        </option>`, e;
      }
      return Y``;
    }
    renderUnitOptionsForMapping(e, t) {
      if (!this.hass || !this.config) return Y``;
      const a = function (e) {
        switch (e) {
          case xe:
          case Pe:
            return [{
              unit: "°C",
              system: Ae
            }, {
              unit: "°F",
              system: Me
            }];
          case Oe:
          case Te:
            return [{
              unit: "mm",
              system: Ae
            }, {
              unit: "in",
              system: Me
            }];
          case De:
            return [{
              unit: Ke,
              system: Ae
            }, {
              unit: Xe,
              system: Me
            }];
          case ze:
            return [{
              unit: "%",
              system: [Ae, Me]
            }];
          case He:
            return [{
              unit: "millibar",
              system: Ae
            }, {
              unit: "hPa",
              system: Ae
            }, {
              unit: "psi",
              system: Me
            }, {
              unit: "inch Hg",
              system: Me
            }];
          case Ne:
            return [{
              unit: "km/h",
              system: Ae
            }, {
              unit: "meter/s",
              system: Ae
            }, {
              unit: "mile/h",
              system: Me
            }];
          case Ce:
            return [{
              unit: "W/m2",
              system: Ae
            }, {
              unit: "MJ/day/m2",
              system: Ae
            }, {
              unit: "W/sq ft",
              system: Me
            }, {
              unit: "MJ/day/sq ft",
              system: Me
            }];
          default:
            return [];
        }
      }(e);
      let i = t[Ge];
      const n = this.config.units;
      if (!t[Ge]) for (const e of a) if ("string" == typeof e.system) {
        if (n === e.system) {
          i = e.unit;
          break;
        }
      } else {
        for (const t of e.system) if (n === t.system) {
          i = e.unit;
          break;
        }
        if (i === e.unit) break;
      }
      return Y`
      ${a.map(e => Y`
          <option value="${e.unit}" ?selected="${i === e.unit}">
            ${e.unit}
          </option>
        `)}
    `;
    }
    render() {
      return this.hass ? this.isLoading ? Y`
        <ha-card
          header="${Xi("panels.mappings.title", this.hass.language)}"
        >
          <div class="card-content">
            ${Xi("common.loading", this.hass.language)}...
          </div>
        </ha-card>
      ` : Y`
      <ha-card
        header="${Xi("panels.mappings.title", this.hass.language)}"
      >
        <div class="card-content">
          ${Xi("panels.mappings.description", this.hass.language)}.
          ${this.isSaving ? Y`<div class="saving-indicator">
                ${Xi("common.saving", this.hass.language)}...
              </div>` : ""}
        </div>
      </ha-card>
      <ha-card
        header="${Xi("panels.mappings.cards.add-mapping.header", this.hass.language)}"
      >
        <div class="card-content">
          <div class="zoneline">
            <label for="mappingNameInput"
              >${Xi("panels.mappings.labels.mapping-name", this.hass.language)}:</label
            >
            <input
              id="mappingNameInput"
              type="text"
              ?disabled="${this.isSaving}"
            />
          </div>
          <div class="zoneline">
            <span></span>
            <button
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving}"
            >
              ${Xi("panels.mappings.cards.add-mapping.actions.add", this.hass.language)}
            </button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    ` : Y``;
    }
    renderMappingsList() {
      const e = this.mappings.slice(0, Math.min(this.mappings.length, 10)),
        t = this.mappings.slice(10);
      return Y`
      ${e.map((e, t) => this.renderMappingCard(e, t))}
      ${t.length > 0 ? Y`
            <div class="load-more">
              <button @click="${this.loadMoreMappings}">
                Load ${t.length} more mappings...
              </button>
            </div>
          ` : ""}
    `;
    }
    renderMappingCard(e, t) {
      if (!this.hass) return Y``;
      const a = this.zones.filter(t => t.mapping === e.id).length;
      return Y`
      <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${Xi("panels.mappings.labels.mapping-name", this.hass.language)}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @input="${a => this.handleEditMapping(t, Object.assign(Object.assign({}, e), {
        name: a.target.value
      }))}"
            />
            ${this.renderMappingSettings(e, t)}
            ${this.renderWeatherRecords(e)}
            ${a ? Y`<div class="weather-note">
                  ${Xi("panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it", this.hass.language)}
                </div>` : Y` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${e.id}"
                  @click="${e => this.handleRemoveMapping(e, t)}"
                >
                  <title>
                    ${Xi("common.actions.delete", this.hass.language)}
                  </title>
                  <path fill="#404040" d="${ln}" />
                </svg>`}
          </div>
        </div>
      </ha-card>
    `;
    }
    renderMappingSettings(e, t) {
      const a = Object.entries(e.mappings);
      return Y`
      ${a.map(([e]) => this.renderMappingSetting(t, e))}
    `;
    }
    loadMoreMappings() {
      this._scheduleUpdate();
    }
    static get styles() {
      return c`
      ${on}
      /* View-specific styles only - most common styles are now in globalStyle */


    `;
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this.debounceTimers.forEach(e => {
        clearTimeout(e);
      }), this.debounceTimers.clear(), this.globalDebounceTimer && (clearTimeout(this.globalDebounceTimer), this.globalDebounceTimer = null), this.mappingCache.clear();
    }
  };
  n([pe()], _n.prototype, "config", void 0), n([pe({
    type: Array
  })], _n.prototype, "zones", void 0), n([pe({
    type: Array
  })], _n.prototype, "mappings", void 0), n([pe({
    type: Map
  })], _n.prototype, "weatherRecords", void 0), n([pe({
    type: Boolean
  })], _n.prototype, "isLoading", void 0), n([pe({
    type: Boolean
  })], _n.prototype, "isSaving", void 0), n([me("#mappingNameInput")], _n.prototype, "mappingNameInput", void 0), _n = n([ce("smart-irrigation-view-mappings")], _n);
  let wn = class extends ft(ue) {
    constructor() {
      super(...arguments), this.isLoading = !0, this._updateScheduled = !1;
    }
    _scheduleUpdate() {
      this._updateScheduled || (this._updateScheduled = !0, requestAnimationFrame(() => {
        this._updateScheduled = !1, this.requestUpdate();
      }));
    }
    firstUpdated() {
      we().catch(e => {
        console.error("Failed to load HA form:", e);
      });
    }
    hassSubscribe() {
      return this._fetchData().catch(e => {
        console.error("Failed to fetch initial data:", e);
      }), [this.hass.connection.subscribeMessage(() => {
        this._fetchData().catch(e => {
          console.error("Failed to fetch data on config update:", e);
        });
      }, {
        type: ke + "_config_updated"
      })];
    }
    async _fetchData() {
      var e;
      if (this.hass) try {
        this.isLoading = !0;
        const [t, a] = await Promise.all([ct(this.hass), (e = this.hass, e.callWS({
          type: ke + "/info"
        }))]);
        this.config = t, this.info = a;
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        this.isLoading = !1, this._scheduleUpdate();
      }
    }
    render() {
      return this.hass ? this.isLoading ? Y`
        <ha-card header="${Xi("panels.info.title", this.hass.language)}">
          <div class="card-content">
            ${Xi("common.loading", this.hass.language)}...
          </div>
        </ha-card>
      ` : this.config ? Y`
      <ha-card header="${Xi("panels.info.title", this.hass.language)}">
        <div class="card-content">
          ${Xi("panels.info.description", this.hass.language)}
        </div>
      </ha-card>
      
      ${this.renderNextIrrigationCard()}
      ${this.renderIrrigationReasonCard()}
    ` : Y`
        <ha-card header="${Xi("panels.info.title", this.hass.language)}">
          <div class="card-content">Configuration not available.</div>
        </ha-card>
      ` : Y``;
    }
    renderNextIrrigationCard() {
      var e, t, a, i, n, s, r, o;
      return this.hass && this.info ? Y`
      <ha-card header="${Xi("panels.info.cards.next-irrigation.title", this.hass.language)}">
        <div class="card-content">
          <div class="info-item">
            <label>${Xi("panels.info.cards.next-irrigation.labels.next-start", this.hass.language)}:</label>
            <span class="value">
              ${this.info.next_irrigation_start ? vn(this.info.next_irrigation_start).format("YYYY-MM-DD HH:mm:ss") : Xi("panels.info.cards.next-irrigation.no-data", this.hass.language)}
            </span>
          </div>
          
          ${this.info.next_irrigation_duration ? Y`
              <div class="info-item">
                <label>${Xi("panels.info.cards.next-irrigation.labels.duration", this.hass.language)}:</label>
                <span class="value">${this.info.next_irrigation_duration} ${Xi("common.units.seconds", this.hass.language)}</span>
              </div>
            ` : ""}
          
          ${this.info.next_irrigation_zones && this.info.next_irrigation_zones.length > 0 ? Y`
              <div class="info-item">
                <label>${Xi("panels.info.cards.next-irrigation.labels.zones", this.hass.language)}:</label>
                <span class="value">${this.info.next_irrigation_zones.join(", ")}</span>
              </div>
            ` : ""}
        </div>
      </ha-card>
    ` : Y`
        <ha-card header="${Xi("panels.info.cards.next-irrigation.title", null !== (t = null === (e = this.hass) || void 0 === e ? void 0 : e.language) && void 0 !== t ? t : "en")}">
          <div class="card-content">
            <div class="info-item">
              <label>${Xi("panels.info.cards.next-irrigation.labels.next-start", null !== (i = null === (a = this.hass) || void 0 === a ? void 0 : a.language) && void 0 !== i ? i : "en")}:</label>
              <span class="value">
                ${Xi("panels.info.cards.next-irrigation.no-data", null !== (s = null === (n = this.hass) || void 0 === n ? void 0 : n.language) && void 0 !== s ? s : "en")}
              </span>
            </div>
            <div class="info-note">
              ${Xi("panels.info.cards.next-irrigation.backend-todo", null !== (o = null === (r = this.hass) || void 0 === r ? void 0 : r.language) && void 0 !== o ? o : "en")}
            </div>
          </div>
        </ha-card>
      `;
    }
    renderIrrigationReasonCard() {
      var e, t, a, i, n, s, r, o;
      return this.hass && this.info ? Y`
      <ha-card header="${Xi("panels.info.cards.irrigation-reason.title", this.hass.language)}">
        <div class="card-content">
          <div class="info-item">
            <label>${Xi("panels.info.cards.irrigation-reason.labels.reason", this.hass.language)}:</label>
            <span class="value">
              ${this.info.irrigation_reason || Xi("panels.info.cards.irrigation-reason.no-data", this.hass.language)}
            </span>
          </div>
          
          ${this.info.sunrise_time ? Y`
              <div class="info-item">
                <label>${Xi("panels.info.cards.irrigation-reason.labels.sunrise", this.hass.language)}:</label>
                <span class="value">${vn(this.info.sunrise_time).format("HH:mm:ss")}</span>
              </div>
            ` : ""}
          
          ${void 0 !== this.info.total_irrigation_duration ? Y`
              <div class="info-item">
                <label>${Xi("panels.info.cards.irrigation-reason.labels.total-duration", this.hass.language)}:</label>
                <span class="value">${this.info.total_irrigation_duration} ${Xi("common.units.seconds", this.hass.language)}</span>
              </div>
            ` : ""}
          
          ${this.info.irrigation_explanation ? Y`
              <div class="info-item explanation">
                <label>${Xi("panels.info.cards.irrigation-reason.labels.explanation", this.hass.language)}:</label>
                <div class="explanation-text">${this.info.irrigation_explanation}</div>
              </div>
            ` : ""}
        </div>
      </ha-card>
    ` : Y`
        <ha-card header="${Xi("panels.info.cards.irrigation-reason.title", null !== (t = null === (e = this.hass) || void 0 === e ? void 0 : e.language) && void 0 !== t ? t : "en")}">
          <div class="card-content">
            <div class="info-item">
              <label>${Xi("panels.info.cards.irrigation-reason.labels.reason", null !== (i = null === (a = this.hass) || void 0 === a ? void 0 : a.language) && void 0 !== i ? i : "en")}:</label>
              <span class="value">
                ${Xi("panels.info.cards.irrigation-reason.no-data", null !== (s = null === (n = this.hass) || void 0 === n ? void 0 : n.language) && void 0 !== s ? s : "en")}
              </span>
            </div>
            <div class="info-note">
              ${Xi("panels.info.cards.irrigation-reason.backend-todo", null !== (o = null === (r = this.hass) || void 0 === r ? void 0 : r.language) && void 0 !== o ? o : "en")}
            </div>
          </div>
        </ha-card>
      `;
    }
    static get styles() {
      return c`
      ${on}
      /* View-specific styles only - most common styles are now in globalStyle */
    `;
    }
  };
  n([pe()], wn.prototype, "config", void 0), n([pe({
    type: Object
  })], wn.prototype, "info", void 0), n([pe({
    type: Boolean
  })], wn.prototype, "isLoading", void 0), wn = n([ce("smart-irrigation-view-info")], wn);
  const kn = on,
    $n = () => {
      const e = e => {
          let t = {};
          for (let a = 0; a < e.length; a += 2) {
            const i = e[a],
              n = a < e.length ? e[a + 1] : void 0;
            t = Object.assign(Object.assign({}, t), {
              [i]: n
            });
          }
          return t;
        },
        t = window.location.pathname.split("/");
      let a = {
        page: t[2] || "general",
        params: {}
      };
      if (t.length > 3) {
        let i = t.slice(3);
        if (t.includes("filter")) {
          const t = i.findIndex(e => "filter" == e),
            n = i.slice(t + 1);
          i = i.slice(0, t), a = Object.assign(Object.assign({}, a), {
            filter: e(n)
          });
        }
        i.length && (i.length % 2 && (a = Object.assign(Object.assign({}, a), {
          subpage: i.shift()
        })), i.length && (a = Object.assign(Object.assign({}, a), {
          params: e(i)
        })));
      }
      return a;
    };
  e.SmartIrrigationPanel = class extends ue {
    constructor() {
      super(...arguments), this._updateScheduled = !1, this._lastNavigationTime = 0, this._navigationThrottleDelay = 100;
    }
    _scheduleUpdate() {
      this._updateScheduled || (this._updateScheduled = !0, requestAnimationFrame(() => {
        this._updateScheduled = !1, this.requestUpdate();
      }));
    }
    async firstUpdated() {
      window.addEventListener("location-changed", () => {
        if (!window.location.pathname.includes("smart-irrigation")) return;
        const e = performance.now();
        e - this._lastNavigationTime < this._navigationThrottleDelay || (this._lastNavigationTime = e, this._scheduleUpdate());
      }), we().then(() => {
        this._scheduleUpdate();
      }).catch(e => {
        console.error("Failed to load HA form elements:", e), this._scheduleUpdate();
      });
    }
    render() {
      const e = $n();
      return Y`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${Xi("title", this.hass.language)}</div>
          <div class="version">${"v2025.7.0-beta9"}</div>
        </div>

        <sl-tab-group
          scrollable
          attr-for-selected="page-name"
          .selected=${e.page}
          @sl-tab-show=${this.handlePageSelected}
        >
          <sl-tab slot="nav" panel="info" .active=${"info" === e.page}>
            ${Xi("panels.info.title", this.hass.language)}
          </sl-tab>
          <sl-tab slot="nav" panel="general" .active=${"general" === e.page}>
            ${Xi("panels.general.title", this.hass.language)}
          </sl-tab>
          <sl-tab slot="nav" panel="zones" .active=${"zones" === e.page}>
            ${Xi("panels.zones.title", this.hass.language)}
          </sl-tab>
          <sl-tab slot="nav" panel="modules" .active=${"modules" === e.page}>
            ${Xi("panels.modules.title", this.hass.language)}
          </sl-tab>
          <sl-tab
            slot="nav"
            panel="mappings"
            .active=${"mappings" === e.page}
          >
            ${Xi("panels.mappings.title", this.hass.language)}
          </sl-tab>
          <sl-tab slot="nav" panel="help" .active=${"help" === e.page}>
            ${Xi("panels.help.title", this.hass.language)}
          </sl-tab>
        </sl-tab-group>
      </div>
      <div class="view">${this.getView(e)}</div>
    `;
    }
    getView(e) {
      switch (e.page) {
        case "info":
          return Y`
          <smart-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-info>
        `;
        case "general":
          return Y`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-general>
        `;
        case "zones":
          return Y`
          <smart-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-zones>
        `;
        case "modules":
          return Y`
          <smart-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-modules>
        `;
        case "mappings":
          return Y`
          <smart-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${e}
          ></smart-irrigation-view-mappings>
        `;
        case "help":
          return Y`<ha-card
          header="${Xi("panels.help.cards.how-to-get-help.title", this.hass.language)}"
        >
          <div class="card-content">
            ${Xi("panels.help.cards.how-to-get-help.first-read-the", this.hass.language)}
            <a href="https://github.com/jeroenterheerdt/HAsmartirrigation/wiki"
              >${Xi("panels.help.cards.how-to-get-help.wiki", this.hass.language)}</a
            >.
            ${Xi("panels.help.cards.how-to-get-help.if-you-still-need-help", this.hass.language)}
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >${Xi("panels.help.cards.how-to-get-help.community-forum", this.hass.language)}</a
            >
            ${Xi("panels.help.cards.how-to-get-help.or-open-a", this.hass.language)}
            <a
              href="https://github.com/jeroenterheerdt/HAsmartirrigation/issues"
              >${Xi("panels.help.cards.how-to-get-help.github-issue", this.hass.language)}</a
            >
            (${Xi("panels.help.cards.how-to-get-help.english-only", this.hass.language)}).
          </div></ha-card
        >`;
        default:
          return Y`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `;
      }
    }
    handlePageSelected(e) {
      var t, a, i, n;
      const s = e.detail.name || e.detail.panel || (null === (a = null === (t = e.target) || void 0 === t ? void 0 : t.getAttribute) || void 0 === a ? void 0 : a.call(t, "panel")) || (null === (n = null === (i = e.detail.item) || void 0 === i ? void 0 : i.getAttribute) || void 0 === n ? void 0 : n.call(i, "panel"));
      s && s !== $n().page ? function (e, t, a) {
        void 0 === a && (a = !1), a ? history.replaceState(null, "", t) : history.pushState(null, "", t), be(window, "location-changed", {
          replace: a
        });
      }(0, ((e, ...t) => {
        let a = {
          page: e,
          params: {}
        };
        t.forEach(e => {
          "string" == typeof e ? a = Object.assign(Object.assign({}, a), {
            subpage: e
          }) : "params" in e ? a = Object.assign(Object.assign({}, a), {
            params: e.params
          }) : "filter" in e && (a = Object.assign(Object.assign({}, a), {
            filter: e.filter
          }));
        });
        const i = e => {
          let t = Object.keys(e);
          t = t.filter(t => e[t]), t.sort();
          let a = "";
          return t.forEach(t => {
            const i = e[t];
            a = a.length ? `${a}/${t}/${i}` : `${t}/${i}`;
          }), a;
        };
        let n = `/${ke}/${a.page}`;
        return a.subpage && (n = `${n}/${a.subpage}`), i(a.params).length && (n = `${n}/${i(a.params)}`), a.filter && (n = `${n}/filter/${i(a.filter)}`), n;
      })(s)) : scrollTo(0, 0);
    }
    static get styles() {
      return c`
      ${kn} :host {
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
      sl-tab-group {
        margin-left: max(env(safe-area-inset-left), 24px);
        margin-right: max(env(safe-area-inset-right), 24px);
        --ha-tab-active-text-color: var(--app-header-text-color, white);
        --ha-tab-indicator-color: var(--app-header-text-color, white);
        --ha-tab-track-color: transparent;
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
    `;
    }
  }, n([pe({
    attribute: !1
  })], e.SmartIrrigationPanel.prototype, "hass", void 0), n([pe({
    type: Boolean,
    reflect: !0
  })], e.SmartIrrigationPanel.prototype, "narrow", void 0), e.SmartIrrigationPanel = n([ce("smart-irrigation")], e.SmartIrrigationPanel);
  let Sn = class extends ue {
    async showDialog(e) {
      this._params = e, await this.updateComplete;
    }
    async closeDialog() {
      this._params = void 0;
    }
    render() {
      return this._params ? Y`
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
            <span class="errortitle" slot="title">
              ${this.hass.localize("state_badge.default.error")}
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">${this._params.error || ""}</div>

        <mwc-button
          slot="primaryAction"
          style="float: left"
          @click=${this.closeDialog}
          dialogAction="close"
        >
          ${this.hass.localize("ui.dialogs.generic.ok")}
        </mwc-button>
      </ha-dialog>
    ` : Y``;
    }
    static get styles() {
      return c`
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.errortitle {
        font-size: 2em;
        font-weight: bold;
        vertical-align: bottom;
      }
    `;
    }
  };
  n([pe({
    attribute: !1
  })], Sn.prototype, "hass", void 0), n([function (e) {
    return pe({
      ...e,
      state: !0
    });
  }
  /**
       * @license
       * Copyright 2017 Google LLC
       * SPDX-License-Identifier: BSD-3-Clause
       */()], Sn.prototype, "_params", void 0), Sn = n([ce("error-dialog")], Sn);
  var En = Object.freeze({
    __proto__: null,
    get ErrorDialog() {
      return Sn;
    }
  });
  Object.defineProperty(e, "__esModule", {
    value: !0
  });
}({});
