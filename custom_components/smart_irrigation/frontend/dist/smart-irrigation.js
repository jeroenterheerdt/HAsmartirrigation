!(function (e) {
  "use strict";
  var t = function (e, a) {
    return (
      (t =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (e, t) {
            e.__proto__ = t;
          }) ||
        function (e, t) {
          for (var a in t)
            Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
        }),
      t(e, a)
    );
  };
  function a(e, a) {
    if ("function" != typeof a && null !== a)
      throw new TypeError(
        "Class extends value " + String(a) + " is not a constructor or null"
      );
    function i() {
      this.constructor = e;
    }
    t(e, a),
      (e.prototype =
        null === a ? Object.create(a) : ((i.prototype = a.prototype), new i()));
  }
  var i = function () {
    return (
      (i =
        Object.assign ||
        function (e) {
          for (var t, a = 1, i = arguments.length; a < i; a++)
            for (var n in (t = arguments[a]))
              Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
          return e;
        }),
      i.apply(this, arguments)
    );
  };
  function n(e, t, a, i) {
    var n,
      s = arguments.length,
      r =
        s < 3
          ? t
          : null === i
          ? (i = Object.getOwnPropertyDescriptor(t, a))
          : i;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
      r = Reflect.decorate(e, t, a, i);
    else
      for (var o = e.length - 1; o >= 0; o--)
        (n = e[o]) && (r = (s < 3 ? n(r) : s > 3 ? n(t, a, r) : n(t, a)) || r);
    return s > 3 && r && Object.defineProperty(t, a, r), r;
  }
  function s(e, t, a) {
    if (a || 2 === arguments.length)
      for (var i, n = 0, s = t.length; n < s; n++)
        (!i && n in t) ||
          (i || (i = Array.prototype.slice.call(t, 0, n)), (i[n] = t[n]));
    return e.concat(i || Array.prototype.slice.call(t));
  }
  "function" == typeof SuppressedError && SuppressedError;
  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const r = window,
    o =
      r.ShadowRoot &&
      (void 0 === r.ShadyCSS || r.ShadyCSS.nativeShadow) &&
      "adoptedStyleSheets" in Document.prototype &&
      "replace" in CSSStyleSheet.prototype,
    l = Symbol(),
    u = new WeakMap();
  class d {
    constructor(e, t, a) {
      if (((this._$cssResult$ = !0), a !== l))
        throw Error(
          "CSSResult is not constructable. Use `unsafeCSS` or `css` instead."
        );
      (this.cssText = e), (this.t = t);
    }
    get styleSheet() {
      let e = this.o;
      const t = this.t;
      if (o && void 0 === e) {
        const a = void 0 !== t && 1 === t.length;
        a && (e = u.get(t)),
          void 0 === e &&
            ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText),
            a && u.set(t, e));
      }
      return e;
    }
    toString() {
      return this.cssText;
    }
  }
  const c = (e, ...t) => {
      const a =
        1 === e.length
          ? e[0]
          : t.reduce(
              (t, a, i) =>
                t +
                ((e) => {
                  if (!0 === e._$cssResult$) return e.cssText;
                  if ("number" == typeof e) return e;
                  throw Error(
                    "Value passed to 'css' function must be a 'css' function result: " +
                      e +
                      ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security."
                  );
                })(a) +
                e[i + 1],
              e[0]
            );
      return new d(a, e, l);
    },
    h = o
      ? (e) => e
      : (e) =>
          e instanceof CSSStyleSheet
            ? ((e) => {
                let t = "";
                for (const a of e.cssRules) t += a.cssText;
                return ((e) =>
                  new d("string" == typeof e ? e : e + "", void 0, l))(t);
              })(e)
            : e;
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ var p;
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
      },
    },
    y = (e, t) => t !== e && (t == t || e == e),
    _ = {
      attribute: !0,
      type: String,
      converter: b,
      reflect: !1,
      hasChanged: y,
    },
    w = "finalized";
  class k extends HTMLElement {
    constructor() {
      super(),
        (this._$Ei = new Map()),
        (this.isUpdatePending = !1),
        (this.hasUpdated = !1),
        (this._$El = null),
        this.u();
    }
    static addInitializer(e) {
      var t;
      this.finalize(),
        (null !== (t = this.h) && void 0 !== t ? t : (this.h = [])).push(e);
    }
    static get observedAttributes() {
      this.finalize();
      const e = [];
      return (
        this.elementProperties.forEach((t, a) => {
          const i = this._$Ep(a, t);
          void 0 !== i && (this._$Ev.set(i, a), e.push(i));
        }),
        e
      );
    }
    static createProperty(e, t = _) {
      if (
        (t.state && (t.attribute = !1),
        this.finalize(),
        this.elementProperties.set(e, t),
        !t.noAccessor && !this.prototype.hasOwnProperty(e))
      ) {
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
          (this[t] = i), this.requestUpdate(e, n, a);
        },
        configurable: !0,
        enumerable: !0,
      };
    }
    static getPropertyOptions(e) {
      return this.elementProperties.get(e) || _;
    }
    static finalize() {
      if (this.hasOwnProperty(w)) return !1;
      this[w] = !0;
      const e = Object.getPrototypeOf(this);
      if (
        (e.finalize(),
        void 0 !== e.h && (this.h = [...e.h]),
        (this.elementProperties = new Map(e.elementProperties)),
        (this._$Ev = new Map()),
        this.hasOwnProperty("properties"))
      ) {
        const e = this.properties,
          t = [
            ...Object.getOwnPropertyNames(e),
            ...Object.getOwnPropertySymbols(e),
          ];
        for (const a of t) this.createProperty(a, e[a]);
      }
      return (this.elementStyles = this.finalizeStyles(this.styles)), !0;
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
      return !1 === a
        ? void 0
        : "string" == typeof a
        ? a
        : "string" == typeof e
        ? e.toLowerCase()
        : void 0;
    }
    u() {
      var e;
      (this._$E_ = new Promise((e) => (this.enableUpdating = e))),
        (this._$AL = new Map()),
        this._$Eg(),
        this.requestUpdate(),
        null === (e = this.constructor.h) ||
          void 0 === e ||
          e.forEach((e) => e(this));
    }
    addController(e) {
      var t, a;
      (null !== (t = this._$ES) && void 0 !== t ? t : (this._$ES = [])).push(e),
        void 0 !== this.renderRoot &&
          this.isConnected &&
          (null === (a = e.hostConnected) || void 0 === a || a.call(e));
    }
    removeController(e) {
      var t;
      null === (t = this._$ES) ||
        void 0 === t ||
        t.splice(this._$ES.indexOf(e) >>> 0, 1);
    }
    _$Eg() {
      this.constructor.elementProperties.forEach((e, t) => {
        this.hasOwnProperty(t) && (this._$Ei.set(t, this[t]), delete this[t]);
      });
    }
    createRenderRoot() {
      var e;
      const t =
        null !== (e = this.shadowRoot) && void 0 !== e
          ? e
          : this.attachShadow(this.constructor.shadowRootOptions);
      return (
        ((e, t) => {
          o
            ? (e.adoptedStyleSheets = t.map((e) =>
                e instanceof CSSStyleSheet ? e : e.styleSheet
              ))
            : t.forEach((t) => {
                const a = document.createElement("style"),
                  i = r.litNonce;
                void 0 !== i && a.setAttribute("nonce", i),
                  (a.textContent = t.cssText),
                  e.appendChild(a);
              });
        })(t, this.constructor.elementStyles),
        t
      );
    }
    connectedCallback() {
      var e;
      void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()),
        this.enableUpdating(!0),
        null === (e = this._$ES) ||
          void 0 === e ||
          e.forEach((e) => {
            var t;
            return null === (t = e.hostConnected) || void 0 === t
              ? void 0
              : t.call(e);
          });
    }
    enableUpdating(e) {}
    disconnectedCallback() {
      var e;
      null === (e = this._$ES) ||
        void 0 === e ||
        e.forEach((e) => {
          var t;
          return null === (t = e.hostDisconnected) || void 0 === t
            ? void 0
            : t.call(e);
        });
    }
    attributeChangedCallback(e, t, a) {
      this._$AK(e, a);
    }
    _$EO(e, t, a = _) {
      var i;
      const n = this.constructor._$Ep(e, a);
      if (void 0 !== n && !0 === a.reflect) {
        const s = (
          void 0 !==
          (null === (i = a.converter) || void 0 === i ? void 0 : i.toAttribute)
            ? a.converter
            : b
        ).toAttribute(t, a.type);
        (this._$El = e),
          null == s ? this.removeAttribute(n) : this.setAttribute(n, s),
          (this._$El = null);
      }
    }
    _$AK(e, t) {
      var a;
      const i = this.constructor,
        n = i._$Ev.get(e);
      if (void 0 !== n && this._$El !== n) {
        const e = i.getPropertyOptions(n),
          s =
            "function" == typeof e.converter
              ? { fromAttribute: e.converter }
              : void 0 !==
                (null === (a = e.converter) || void 0 === a
                  ? void 0
                  : a.fromAttribute)
              ? e.converter
              : b;
        (this._$El = n),
          (this[n] = s.fromAttribute(t, e.type)),
          (this._$El = null);
      }
    }
    requestUpdate(e, t, a) {
      let i = !0;
      void 0 !== e &&
        (((a = a || this.constructor.getPropertyOptions(e)).hasChanged || y)(
          this[e],
          t
        )
          ? (this._$AL.has(e) || this._$AL.set(e, t),
            !0 === a.reflect &&
              this._$El !== e &&
              (void 0 === this._$EC && (this._$EC = new Map()),
              this._$EC.set(e, a)))
          : (i = !1)),
        !this.isUpdatePending && i && (this._$E_ = this._$Ej());
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
      this.hasUpdated,
        this._$Ei &&
          (this._$Ei.forEach((e, t) => (this[t] = e)), (this._$Ei = void 0));
      let t = !1;
      const a = this._$AL;
      try {
        (t = this.shouldUpdate(a)),
          t
            ? (this.willUpdate(a),
              null === (e = this._$ES) ||
                void 0 === e ||
                e.forEach((e) => {
                  var t;
                  return null === (t = e.hostUpdate) || void 0 === t
                    ? void 0
                    : t.call(e);
                }),
              this.update(a))
            : this._$Ek();
      } catch (e) {
        throw ((t = !1), this._$Ek(), e);
      }
      t && this._$AE(a);
    }
    willUpdate(e) {}
    _$AE(e) {
      var t;
      null === (t = this._$ES) ||
        void 0 === t ||
        t.forEach((e) => {
          var t;
          return null === (t = e.hostUpdated) || void 0 === t
            ? void 0
            : t.call(e);
        }),
        this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(e)),
        this.updated(e);
    }
    _$Ek() {
      (this._$AL = new Map()), (this.isUpdatePending = !1);
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
      void 0 !== this._$EC &&
        (this._$EC.forEach((e, t) => this._$EO(t, this[t], e)),
        (this._$EC = void 0)),
        this._$Ek();
    }
    updated(e) {}
    firstUpdated(e) {}
  }
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var S;
  (k[w] = !0),
    (k.elementProperties = new Map()),
    (k.elementStyles = []),
    (k.shadowRootOptions = { mode: "open" }),
    null == v || v({ ReactiveElement: k }),
    (null !== (p = m.reactiveElementVersions) && void 0 !== p
      ? p
      : (m.reactiveElementVersions = [])
    ).push("1.6.2");
  const E = window,
    A = E.trustedTypes,
    $ = A ? A.createPolicy("lit-html", { createHTML: (e) => e }) : void 0,
    M = "$lit$",
    T = `lit$${(Math.random() + "").slice(9)}$`,
    O = "?" + T,
    x = `<${O}>`,
    z = document,
    D = () => z.createComment(""),
    H = (e) => null === e || ("object" != typeof e && "function" != typeof e),
    P = Array.isArray,
    N = "[ \t\n\f\r]",
    C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
    j = /-->/g,
    L = />/g,
    B = RegExp(
      `>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,
      "g"
    ),
    I = /'/g,
    R = /"/g,
    U = /^(?:script|style|textarea|title)$/i,
    Y = (
      (e) =>
      (t, ...a) => ({ _$litType$: e, strings: t, values: a })
    )(1),
    V = Symbol.for("lit-noChange"),
    G = Symbol.for("lit-nothing"),
    F = new WeakMap(),
    W = z.createTreeWalker(z, 129, null, !1),
    Z = (e, t) => {
      const a = e.length - 1,
        i = [];
      let n,
        s = 2 === t ? "<svg>" : "",
        r = C;
      for (let t = 0; t < a; t++) {
        const a = e[t];
        let o,
          l,
          u = -1,
          d = 0;
        for (
          ;
          d < a.length && ((r.lastIndex = d), (l = r.exec(a)), null !== l);

        )
          (d = r.lastIndex),
            r === C
              ? "!--" === l[1]
                ? (r = j)
                : void 0 !== l[1]
                ? (r = L)
                : void 0 !== l[2]
                ? (U.test(l[2]) && (n = RegExp("</" + l[2], "g")), (r = B))
                : void 0 !== l[3] && (r = B)
              : r === B
              ? ">" === l[0]
                ? ((r = null != n ? n : C), (u = -1))
                : void 0 === l[1]
                ? (u = -2)
                : ((u = r.lastIndex - l[2].length),
                  (o = l[1]),
                  (r = void 0 === l[3] ? B : '"' === l[3] ? R : I))
              : r === R || r === I
              ? (r = B)
              : r === j || r === L
              ? (r = C)
              : ((r = B), (n = void 0));
        const c = r === B && e[t + 1].startsWith("/>") ? " " : "";
        s +=
          r === C
            ? a + x
            : u >= 0
            ? (i.push(o), a.slice(0, u) + M + a.slice(u) + T + c)
            : a + T + (-2 === u ? (i.push(void 0), t) : c);
      }
      const o = s + (e[a] || "<?>") + (2 === t ? "</svg>" : "");
      if (!Array.isArray(e) || !e.hasOwnProperty("raw"))
        throw Error("invalid template strings array");
      return [void 0 !== $ ? $.createHTML(o) : o, i];
    };
  class q {
    constructor({ strings: e, _$litType$: t }, a) {
      let i;
      this.parts = [];
      let n = 0,
        s = 0;
      const r = e.length - 1,
        o = this.parts,
        [l, u] = Z(e, t);
      if (
        ((this.el = q.createElement(l, a)),
        (W.currentNode = this.el.content),
        2 === t)
      ) {
        const e = this.el.content,
          t = e.firstChild;
        t.remove(), e.append(...t.childNodes);
      }
      for (; null !== (i = W.nextNode()) && o.length < r; ) {
        if (1 === i.nodeType) {
          if (i.hasAttributes()) {
            const e = [];
            for (const t of i.getAttributeNames())
              if (t.endsWith(M) || t.startsWith(T)) {
                const a = u[s++];
                if ((e.push(t), void 0 !== a)) {
                  const e = i.getAttribute(a.toLowerCase() + M).split(T),
                    t = /([.?@])?(.*)/.exec(a);
                  o.push({
                    type: 1,
                    index: n,
                    name: t[2],
                    strings: e,
                    ctor:
                      "." === t[1]
                        ? ee
                        : "?" === t[1]
                        ? ae
                        : "@" === t[1]
                        ? ie
                        : Q,
                  });
                } else o.push({ type: 6, index: n });
              }
            for (const t of e) i.removeAttribute(t);
          }
          if (U.test(i.tagName)) {
            const e = i.textContent.split(T),
              t = e.length - 1;
            if (t > 0) {
              i.textContent = A ? A.emptyScript : "";
              for (let a = 0; a < t; a++)
                i.append(e[a], D()),
                  W.nextNode(),
                  o.push({ type: 2, index: ++n });
              i.append(e[t], D());
            }
          }
        } else if (8 === i.nodeType)
          if (i.data === O) o.push({ type: 2, index: n });
          else {
            let e = -1;
            for (; -1 !== (e = i.data.indexOf(T, e + 1)); )
              o.push({ type: 7, index: n }), (e += T.length - 1);
          }
        n++;
      }
    }
    static createElement(e, t) {
      const a = z.createElement("template");
      return (a.innerHTML = e), a;
    }
  }
  function K(e, t, a = e, i) {
    var n, s, r, o;
    if (t === V) return t;
    let l =
      void 0 !== i
        ? null === (n = a._$Co) || void 0 === n
          ? void 0
          : n[i]
        : a._$Cl;
    const u = H(t) ? void 0 : t._$litDirective$;
    return (
      (null == l ? void 0 : l.constructor) !== u &&
        (null === (s = null == l ? void 0 : l._$AO) ||
          void 0 === s ||
          s.call(l, !1),
        void 0 === u ? (l = void 0) : ((l = new u(e)), l._$AT(e, a, i)),
        void 0 !== i
          ? ((null !== (r = (o = a)._$Co) && void 0 !== r ? r : (o._$Co = []))[
              i
            ] = l)
          : (a._$Cl = l)),
      void 0 !== l && (t = K(e, l._$AS(e, t.values), l, i)),
      t
    );
  }
  class X {
    constructor(e, t) {
      (this._$AV = []), (this._$AN = void 0), (this._$AD = e), (this._$AM = t);
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
          el: { content: a },
          parts: i,
        } = this._$AD,
        n = (
          null !== (t = null == e ? void 0 : e.creationScope) && void 0 !== t
            ? t
            : z
        ).importNode(a, !0);
      W.currentNode = n;
      let s = W.nextNode(),
        r = 0,
        o = 0,
        l = i[0];
      for (; void 0 !== l; ) {
        if (r === l.index) {
          let t;
          2 === l.type
            ? (t = new J(s, s.nextSibling, this, e))
            : 1 === l.type
            ? (t = new l.ctor(s, l.name, l.strings, this, e))
            : 6 === l.type && (t = new ne(s, this, e)),
            this._$AV.push(t),
            (l = i[++o]);
        }
        r !== (null == l ? void 0 : l.index) && ((s = W.nextNode()), r++);
      }
      return (W.currentNode = z), n;
    }
    v(e) {
      let t = 0;
      for (const a of this._$AV)
        void 0 !== a &&
          (void 0 !== a.strings
            ? (a._$AI(e, a, t), (t += a.strings.length - 2))
            : a._$AI(e[t])),
          t++;
    }
  }
  class J {
    constructor(e, t, a, i) {
      var n;
      (this.type = 2),
        (this._$AH = G),
        (this._$AN = void 0),
        (this._$AA = e),
        (this._$AB = t),
        (this._$AM = a),
        (this.options = i),
        (this._$Cp =
          null === (n = null == i ? void 0 : i.isConnected) ||
          void 0 === n ||
          n);
    }
    get _$AU() {
      var e, t;
      return null !==
        (t = null === (e = this._$AM) || void 0 === e ? void 0 : e._$AU) &&
        void 0 !== t
        ? t
        : this._$Cp;
    }
    get parentNode() {
      let e = this._$AA.parentNode;
      const t = this._$AM;
      return (
        void 0 !== t &&
          11 === (null == e ? void 0 : e.nodeType) &&
          (e = t.parentNode),
        e
      );
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(e, t = this) {
      (e = K(this, e, t)),
        H(e)
          ? e === G || null == e || "" === e
            ? (this._$AH !== G && this._$AR(), (this._$AH = G))
            : e !== this._$AH && e !== V && this._(e)
          : void 0 !== e._$litType$
          ? this.g(e)
          : void 0 !== e.nodeType
          ? this.$(e)
          : ((e) =>
              P(e) ||
              "function" == typeof (null == e ? void 0 : e[Symbol.iterator]))(e)
          ? this.T(e)
          : this._(e);
    }
    k(e) {
      return this._$AA.parentNode.insertBefore(e, this._$AB);
    }
    $(e) {
      this._$AH !== e && (this._$AR(), (this._$AH = this.k(e)));
    }
    _(e) {
      this._$AH !== G && H(this._$AH)
        ? (this._$AA.nextSibling.data = e)
        : this.$(z.createTextNode(e)),
        (this._$AH = e);
    }
    g(e) {
      var t;
      const { values: a, _$litType$: i } = e,
        n =
          "number" == typeof i
            ? this._$AC(e)
            : (void 0 === i.el && (i.el = q.createElement(i.h, this.options)),
              i);
      if ((null === (t = this._$AH) || void 0 === t ? void 0 : t._$AD) === n)
        this._$AH.v(a);
      else {
        const e = new X(n, this),
          t = e.u(this.options);
        e.v(a), this.$(t), (this._$AH = e);
      }
    }
    _$AC(e) {
      let t = F.get(e.strings);
      return void 0 === t && F.set(e.strings, (t = new q(e))), t;
    }
    T(e) {
      P(this._$AH) || ((this._$AH = []), this._$AR());
      const t = this._$AH;
      let a,
        i = 0;
      for (const n of e)
        i === t.length
          ? t.push((a = new J(this.k(D()), this.k(D()), this, this.options)))
          : (a = t[i]),
          a._$AI(n),
          i++;
      i < t.length && (this._$AR(a && a._$AB.nextSibling, i), (t.length = i));
    }
    _$AR(e = this._$AA.nextSibling, t) {
      var a;
      for (
        null === (a = this._$AP) || void 0 === a || a.call(this, !1, !0, t);
        e && e !== this._$AB;

      ) {
        const t = e.nextSibling;
        e.remove(), (e = t);
      }
    }
    setConnected(e) {
      var t;
      void 0 === this._$AM &&
        ((this._$Cp = e),
        null === (t = this._$AP) || void 0 === t || t.call(this, e));
    }
  }
  class Q {
    constructor(e, t, a, i, n) {
      (this.type = 1),
        (this._$AH = G),
        (this._$AN = void 0),
        (this.element = e),
        (this.name = t),
        (this._$AM = i),
        (this.options = n),
        a.length > 2 || "" !== a[0] || "" !== a[1]
          ? ((this._$AH = Array(a.length - 1).fill(new String())),
            (this.strings = a))
          : (this._$AH = G);
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
      if (void 0 === n)
        (e = K(this, e, t, 0)),
          (s = !H(e) || (e !== this._$AH && e !== V)),
          s && (this._$AH = e);
      else {
        const i = e;
        let r, o;
        for (e = n[0], r = 0; r < n.length - 1; r++)
          (o = K(this, i[a + r], t, r)),
            o === V && (o = this._$AH[r]),
            s || (s = !H(o) || o !== this._$AH[r]),
            o === G
              ? (e = G)
              : e !== G && (e += (null != o ? o : "") + n[r + 1]),
            (this._$AH[r] = o);
      }
      s && !i && this.j(e);
    }
    j(e) {
      e === G
        ? this.element.removeAttribute(this.name)
        : this.element.setAttribute(this.name, null != e ? e : "");
    }
  }
  class ee extends Q {
    constructor() {
      super(...arguments), (this.type = 3);
    }
    j(e) {
      this.element[this.name] = e === G ? void 0 : e;
    }
  }
  const te = A ? A.emptyScript : "";
  class ae extends Q {
    constructor() {
      super(...arguments), (this.type = 4);
    }
    j(e) {
      e && e !== G
        ? this.element.setAttribute(this.name, te)
        : this.element.removeAttribute(this.name);
    }
  }
  class ie extends Q {
    constructor(e, t, a, i, n) {
      super(e, t, a, i, n), (this.type = 5);
    }
    _$AI(e, t = this) {
      var a;
      if ((e = null !== (a = K(this, e, t, 0)) && void 0 !== a ? a : G) === V)
        return;
      const i = this._$AH,
        n =
          (e === G && i !== G) ||
          e.capture !== i.capture ||
          e.once !== i.once ||
          e.passive !== i.passive,
        s = e !== G && (i === G || n);
      n && this.element.removeEventListener(this.name, this, i),
        s && this.element.addEventListener(this.name, this, e),
        (this._$AH = e);
    }
    handleEvent(e) {
      var t, a;
      "function" == typeof this._$AH
        ? this._$AH.call(
            null !==
              (a =
                null === (t = this.options) || void 0 === t
                  ? void 0
                  : t.host) && void 0 !== a
              ? a
              : this.element,
            e
          )
        : this._$AH.handleEvent(e);
    }
  }
  class ne {
    constructor(e, t, a) {
      (this.element = e),
        (this.type = 6),
        (this._$AN = void 0),
        (this._$AM = t),
        (this.options = a);
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(e) {
      K(this, e);
    }
  }
  const se = E.litHtmlPolyfillSupport;
  null == se || se(q, J),
    (null !== (S = E.litHtmlVersions) && void 0 !== S
      ? S
      : (E.litHtmlVersions = [])
    ).push("2.7.4");
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var re, oe;
  class le extends k {
    constructor() {
      super(...arguments),
        (this.renderOptions = { host: this }),
        (this._$Do = void 0);
    }
    createRenderRoot() {
      var e, t;
      const a = super.createRenderRoot();
      return (
        (null !== (e = (t = this.renderOptions).renderBefore) &&
          void 0 !== e) ||
          (t.renderBefore = a.firstChild),
        a
      );
    }
    update(e) {
      const t = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
        super.update(e),
        (this._$Do = ((e, t, a) => {
          var i, n;
          const s =
            null !== (i = null == a ? void 0 : a.renderBefore) && void 0 !== i
              ? i
              : t;
          let r = s._$litPart$;
          if (void 0 === r) {
            const e =
              null !== (n = null == a ? void 0 : a.renderBefore) && void 0 !== n
                ? n
                : null;
            s._$litPart$ = r = new J(
              t.insertBefore(D(), e),
              e,
              void 0,
              null != a ? a : {}
            );
          }
          return r._$AI(e), r;
        })(t, this.renderRoot, this.renderOptions));
    }
    connectedCallback() {
      var e;
      super.connectedCallback(),
        null === (e = this._$Do) || void 0 === e || e.setConnected(!0);
    }
    disconnectedCallback() {
      var e;
      super.disconnectedCallback(),
        null === (e = this._$Do) || void 0 === e || e.setConnected(!1);
    }
    render() {
      return V;
    }
  }
  (le.finalized = !0),
    (le._$litElement$ = !0),
    null === (re = globalThis.litElementHydrateSupport) ||
      void 0 === re ||
      re.call(globalThis, { LitElement: le });
  const ue = globalThis.litElementPolyfillSupport;
  null == ue || ue({ LitElement: le }),
    (null !== (oe = globalThis.litElementVersions) && void 0 !== oe
      ? oe
      : (globalThis.litElementVersions = [])
    ).push("3.3.2");
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const de = (e) => (t) =>
      "function" == typeof t
        ? ((e, t) => (customElements.define(e, t), t))(e, t)
        : ((e, t) => {
            const { kind: a, elements: i } = t;
            return {
              kind: a,
              elements: i,
              finisher(t) {
                customElements.define(e, t);
              },
            };
          })(e, t),
    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */ ce = (e, t) =>
      "method" === t.kind && t.descriptor && !("value" in t.descriptor)
        ? {
            ...t,
            finisher(a) {
              a.createProperty(t.key, e);
            },
          }
        : {
            kind: "field",
            key: Symbol(),
            placement: "own",
            descriptor: {},
            originalKey: t.key,
            initializer() {
              "function" == typeof t.initializer &&
                (this[t.key] = t.initializer.call(this));
            },
            finisher(a) {
              a.createProperty(t.key, e);
            },
          },
    he = (e, t, a) => {
      t.constructor.createProperty(a, e);
    };
  function pe(e) {
    return (t, a) => (void 0 !== a ? he(e, t, a) : ce(e, t));
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
    return (
      ({ finisher: e, descriptor: t }) =>
      (a, i) => {
        var n;
        if (void 0 === i) {
          const i = null !== (n = a.originalKey) && void 0 !== n ? n : a.key,
            s =
              null != t
                ? {
                    kind: "method",
                    placement: "prototype",
                    key: i,
                    descriptor: t(a.key),
                  }
                : { ...a, key: i };
          return (
            null != e &&
              (s.finisher = function (t) {
                e(t, i);
              }),
            s
          );
        }
        {
          const n = a.constructor;
          void 0 !== t && Object.defineProperty(a, i, t(i)),
            null == e || e(n, i);
        }
      }
    )({
      descriptor: (a) => {
        const i = {
          get() {
            var t, a;
            return null !==
              (a =
                null === (t = this.renderRoot) || void 0 === t
                  ? void 0
                  : t.querySelector(e)) && void 0 !== a
              ? a
              : null;
          },
          enumerable: !0,
          configurable: !0,
        };
        if (t) {
          const t = "symbol" == typeof a ? Symbol() : "__" + a;
          i.get = function () {
            var a, i;
            return (
              void 0 === this[t] &&
                (this[t] =
                  null !==
                    (i =
                      null === (a = this.renderRoot) || void 0 === a
                        ? void 0
                        : a.querySelector(e)) && void 0 !== i
                    ? i
                    : null),
              this[t]
            );
          };
        }
        return i;
      },
    });
  }
  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ var ge, fe, ve;
  null === (ge = window.HTMLSlotElement) ||
    void 0 === ge ||
    ge.prototype.assignedElements,
    (function (e) {
      (e.language = "language"),
        (e.system = "system"),
        (e.comma_decimal = "comma_decimal"),
        (e.decimal_comma = "decimal_comma"),
        (e.space_comma = "space_comma"),
        (e.none = "none");
    })(fe || (fe = {})),
    (function (e) {
      (e.language = "language"),
        (e.system = "system"),
        (e.am_pm = "12"),
        (e.twenty_four = "24");
    })(ve || (ve = {}));
  var be = function (e, t, a, i) {
    (i = i || {}), (a = null == a ? {} : a);
    var n = new Event(t, {
      bubbles: void 0 === i.bubbles || i.bubbles,
      cancelable: Boolean(i.cancelable),
      composed: void 0 === i.composed || i.composed,
    });
    return (n.detail = a), e.dispatchEvent(n), n;
  };
  const ye = async () => {
      if (customElements.get("ha-checkbox") && customElements.get("ha-slider"))
        return;
      await customElements.whenDefined("partial-panel-resolver");
      const e = document.createElement("partial-panel-resolver");
      (e.hass = { panels: [{ url_path: "tmp", component_name: "config" }] }),
        e._updateRoutes(),
        await e.routerOptions.routes.tmp.load(),
        await customElements.whenDefined("ha-panel-config");
      const t = document.createElement("ha-panel-config");
      await t.routerOptions.routes.automation.load();
    },
    _e = "smart_irrigation",
    we = "minutes",
    ke = "hours",
    Se = "days",
    Ee = "imperial",
    Ae = "metric",
    $e = "Dewpoint",
    Me = "Evapotranspiration",
    Te = "Humidity",
    Oe = "Precipitation",
    xe = "Pressure",
    ze = "Solar Radiation",
    De = "Temperature",
    He = "Windspeed",
    Pe = "weather_service",
    Ne = "sensor",
    Ce = "static",
    je = "pressure_type",
    Le = "absolute",
    Be = "relative",
    Ie = "none",
    Re = "source",
    Ue = "sensorentity",
    Ye = "static_value",
    Ve = "unit",
    Ge = "aggregate",
    Fe = ["average", "first", "last", "maximum", "median", "minimum", "sum"],
    We = "size",
    Ze = "throughput",
    qe = "duration",
    Ke = "bucket",
    Xe = (e) => e.callWS({ type: _e + "/config" }),
    Je = (e) => e.callWS({ type: _e + "/zones" }),
    Qe = (e) => e.callWS({ type: _e + "/modules" }),
    et = (e) => e.callWS({ type: _e + "/mappings" }),
    tt = (e) => {
      class t extends e {
        connectedCallback() {
          super.connectedCallback(), this.__checkSubscribed();
        }
        disconnectedCallback() {
          if ((super.disconnectedCallback(), this.__unsubs)) {
            for (; this.__unsubs.length; ) {
              const e = this.__unsubs.pop();
              e instanceof Promise ? e.then((e) => e()) : e();
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
          void 0 === this.__unsubs &&
            this.isConnected &&
            void 0 !== this.hass &&
            (this.__unsubs = this.hassSubscribe());
        }
      }
      return n([pe({ attribute: !1 })], t.prototype, "hass", void 0), t;
    };
  var at,
    it,
    nt,
    st = {
      actions: { delete: "Lösche" },
      labels: { module: "Modul", no: "Nein", select: "Wähle", yes: "Ja" },
      attributes: { size: "Größe", throughput: "Durchfluss", state: "Zustand" },
    },
    rt = {
      "default-zone": "Standard Zone",
      "default-mapping": "Standard Sensorgruppe",
    },
    ot = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "Beachte: Diese Beschreibung nutzt '.' als Dezimalzeichen und zeigt gerundete Werte. Das Modul berechnete einen Evapotranspirationsmangel von",
          "bucket-was": "Der alte Vorrat war",
          "new-bucket-values-is": "Der neue Vorrat ist",
          "old-bucket-variable": "alter_Vorrat",
          delta: "Veränderung",
          "bucket-less-than-zero-irrigation-necessary":
            "Wenn der Vorrat < 0 ist, ist eine Bewässerung nötig.",
          "steps-taken-to-calculate-duration":
            "Für eine exakte Berechnung der Dauer, wurden folgende Schritte durchgeführt",
          "precipitation-rate-defined-as": "Der Niederschlag ist",
          "duration-is-calculated-as": "Die Dauer ist",
          bucket: "Vorrat",
          "precipitation-rate-variable": "Niederschlag",
          "multiplier-is-applied":
            "Der Multiplikator wird angewendet. Der Multiplikator ist",
          "duration-after-multiplier-is": "also ist die Dauer",
          "maximum-duration-is-applied":
            "Die maximale Dauer wird angewendet. Diese ist",
          "duration-after-maximum-duration-is": "also ist die Dauer",
          "lead-time-is-applied":
            "Zuletzt wird die Vorlaufzeit angewendet. Die Vorlaufzeit ist",
          "duration-after-lead-time-is": "also ist die Dauer",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Wenn der Vorrat >= 0 ist, ist keine Bewässerung nötig und die Dauer ist gleich",
          "maximum-bucket-is": "Der maximale Vorrat ist",
        },
      },
    },
    lt = {
      pyeto: {
        description:
          "Die Berechnung der Verunstungsrate basiert auf der FAO56-Formel aus der PyETO-Bibliothek",
      },
      static: {
        description:
          "Modul mit einer statisch konfigurierbaren Verdunstungsrate.",
      },
      passthrough: {
        description:
          "Pass Through übernimmt den Evapotranspirationssensor und gibt seinen Wert zurück. Auf diese Weise werden alle Berechnungen der Verdunstung umgangen, außer der Anwendung von Aggregaten wie Summe, Durchschnitt etc).",
      },
    },
    ut = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatische Berechnung der Bewässerungsdauer",
            description:
              "Die Berechnung berücksichtigt die bis zu diesem Zeitpunkt gesammelten Wetterdaten und aktualisiert den Vorrat für jede automatische Zone. Anschließend wird die Dauer basierend auf dem neuen Vorrat angepasst und die gesammelten Wetterdaten entfernt.",
            labels: {
              "auto-calc-enabled": "Automatische Berechnung der Dauer pro Zone",
              "auto-calc-time": "Berechne um",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Hinweis: Die automatische Aktualisierung der Wetterdaten erfolgt bei oder nach der automatischen Berechnung der Bewässerungsdauer",
            },
            header: "Automatische Aktualisierung der Wetterdaten",
            description:
              "Die Wetterdaten werden automatisch gesammelt und gespeichert. Zur Berechnung der Zonen und Bewässerungsdauer sind Wetterdaten erforderlich.",
            labels: {
              "auto-update-enabled": "Automatisches Update der Wetterdaten",
              "auto-update-delay": "Update Verzögerung",
              "auto-update-interval": "Update der Sensordaten alle",
            },
            options: { days: "Tage", hours: "Stunden", minutes: "Minuten" },
          },
          "automatic-clear": {
            header: "Automatisches Löschen der Wetterdaten",
            description:
              "Gesammelte Wetterdaten zu einem bestimmten Zeitpunkt automatisch entfernen. Damit wird sicher gestellt, dass keine Wetterdaten von vergangenen Tagen übrig bleiben. Entferne die Wetterdaten nicht vor der Berechnung und verwende diese Option nur, wenn du erwartest, dass das automatische Update Wetterdaten erfasst hat, nachdem der Tag berechnet wurde. Idealerweise sollte dieser Schnitt so spät wie möglich Tag durchgeführt werden.",
            labels: {
              "automatic-clear-enabled":
                "Automatisches Löschen der Wetterdaten",
              "automatic-clear-time": "Löschen der Wetterdaten um",
            },
          },
        },
        description: "Diese Seite ist für allgemeine Einstellungen.",
        title: "Allgemein",
      },
      help: {
        title: "Hilfe",
        cards: {
          "how-to-get-help": {
            title: "Hilfe bekommen",
            "first-read-the": "Lies zuerst im",
            wiki: "Wiki",
            "if-you-still-need-help":
              "Benötigst du weiterhin Hilfe, wende dich an das",
            "community-forum": "Community Forum",
            "or-open-a": "oder eröffne einen",
            "github-issue": "Github Issue",
            "english-only": "nur Englisch",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Hinzufügen" },
            header: "Sensorgruppe hinzufügen",
          },
          mapping: {
            aggregates: {
              average: "Durchschnitt",
              first: "Erster",
              last: "Letzter",
              maximum: "Maximum",
              median: "Median",
              minimum: "Minimum",
              sum: "Summe",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "Diese Sensorgruppe kann nicht entfernt werden, da sie von mindestens einer Zone verwendet wird.",
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
              windspeed: "Windgeschwindigkeit",
            },
            pressure_types: { absolute: "absolut", relative: "relativ" },
            "pressure-type": "Der Luftdruck ist",
            "sensor-aggregate-of-sensor-values-to-calculate":
              "des Sensors für die Berechnung.",
            "sensor-aggregate-use-the": "Nutze den/die/das",
            "sensor-entity": "Sensor Entität",
            static_value: "Wert",
            "input-units": "Sensor Werte in",
            source: "Quelle",
            sources: {
              none: "Keine",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Fester Wert",
            },
          },
        },
        description:
          "Füge eine oder mehrere Sensorgruppen hinzu, die Wetterdaten von Weather service, Sensoren oder einer Kombination daraus abrufen. Jede Sensorgruppe kann für eine oder mehrere Zonen verwendet werden",
        labels: { "mapping-name": "Name" },
        no_items: "Es ist noch keine Sensorgruppe angelegt.",
        title: "Sensorgruppen",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Hinzufügen" },
            header: "Modul hinzufügen",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "Dieses Modul kann nicht entfernt werden, da es von mindestens einer Zone verwendet wird.",
            },
            labels: {
              configuration: "Konfiguration",
              required: "Feld ist erforderlich",
            },
            "translated-options": {
              DontEstimate: "Nicht berechnen",
              EstimateFromSunHours: "Basierend auf den Sonnenstunden",
              EstimateFromTemp: "Basierend auf der Temperatur",
              EstimateFromSunHoursAndTemperature:
                "Basierend auf dem Durchschnitt von Sonnenstunden und Temperatur",
            },
          },
        },
        description:
          "Füge ein oder mehrere Module hinzu. Module berechnen die Bewässerungsdauer. Jedes Modul hat seine eigene Konfiguration und kann zur Berechnung der Bewässerungsdauer für eine oder mehrere Zonen verwendet werden.",
        no_items: "Es ist noch kein Module angelegt.",
        title: "Module",
      },
      zones: {
        actions: {
          add: "Hinzufügen",
          calculate: "Bewässerungsdauer berechnen.",
          information: "Information",
          update: "Wetterdaten aktualisieren.",
          "reset-bucket": "Vorrat zurücksetzen",
        },
        cards: {
          "add-zone": {
            actions: { add: "Hinzufügen" },
            header: "Zone hinzufügen",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Alle Zonen berechnen",
              "update-all": "Alle Zonen aktualisieren",
              "reset-all-buckets": "Alle Vorräte zurücksetzen",
              "clear-all-weatherdata": "Alle Wetterdaten löschen",
            },
            header: "Aktionen für alle Zonen",
          },
        },
        description:
          "Füge eine oder mehrere Zonen hinzu. Die Bewässerungsdauer wird pro Zone, abhängig von Größe, Durchsatz, Status, Modul und Sensorgruppe berechnet.",
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
            manual: "Manuell",
          },
          throughput: "Durchfluss",
          "maximum-bucket": "Maximaler Vorrat",
          last_calculated: "Zuletzt berechnet",
          "data-last-updated": "Daten zuletzt aktualisiert",
          "data-number-of-data-points": "Anzahl der Messungen",
        },
        no_items: "Es ist noch keine Zone vorhanden.",
        title: "Zonen",
      },
    },
    dt = "Smart Irrigation",
    ct = {
      common: st,
      defaults: rt,
      module: ot,
      calcmodules: lt,
      panels: ut,
      title: dt,
    },
    ht = Object.freeze({
      __proto__: null,
      common: st,
      defaults: rt,
      module: ot,
      calcmodules: lt,
      panels: ut,
      title: dt,
      default: ct,
    }),
    pt = {
      actions: { delete: "Delete" },
      labels: { module: "Module", no: "No", select: "Select", yes: "Yes" },
      attributes: {
        size: "size",
        throughput: "throughput",
        state: "state",
        bucket: "bucket",
        last_updated: "last updated",
        last_calculated: "last calculated",
        number_of_data_points: "number of data points",
      },
    },
    mt = {
      "default-zone": "Default zone",
      "default-mapping": "Default sensor group",
    },
    gt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "Note: this explanation uses '.' as decimal separator, shows rounded and metric values. Module returned Evapotranspiration deficiency of",
          "bucket-was": "Bucket was",
          "new-bucket-values-is": "New bucket value is",
          "old-bucket-variable": "old_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary":
            "Since bucket < 0, irrigation is necessary",
          "steps-taken-to-calculate-duration":
            "To calculate the exact duration, the following steps were taken",
          "precipitation-rate-defined-as":
            "The precipitation rate is defined as",
          "duration-is-calculated-as": "The duration is calculated as",
          bucket: "bucket",
          "precipitation-rate-variable": "precipitation_rate",
          "multiplier-is-applied":
            "Now, the multiplier is applied. The multiplier is",
          "duration-after-multiplier-is": "hence the duration is",
          "maximum-duration-is-applied":
            "Then, the maximum duration is applied. The maximum duration is",
          "duration-after-maximum-duration-is": "hence the duration is",
          "lead-time-is-applied":
            "Finally, the lead time is applied. The lead time is",
          "duration-after-lead-time-is": "hence the final duration is",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Since bucket >= 0, no irrigation is necessary and duration is set to",
          "maximum-bucket-is": "maximum bucket size is",
        },
      },
    },
    ft = {
      pyeto: {
        description:
          "Calculate duration based on the FAO56 calculation from the PyETO library",
      },
      static: {
        description: "'Dummy' module with a static configurable delta",
      },
      passthrough: {
        description:
          "Passthrough module that returns the value of an Evapotranspiration sensor as delta",
      },
    },
    vt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatic duration calculation",
            description:
              "Calculation takes collected weatherdata up to that point and updates the bucket for each automatic zone. Then, the duration is adjusted based on the new bucket value and the collected weatherdata is removed.",
            labels: {
              "auto-calc-enabled": "Automatically calculate zone durations",
              "auto-calc-time": "Calculate at",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Warning: weatherdata update time on or after calculation time",
            },
            header: "Automatic weather data update",
            description:
              "Collect and store weather data automatically. Weather data is required to calculate zone buckets and durations.",
            labels: {
              "auto-update-enabled": "Automatically update weather data",
              "auto-update-delay": "Update delay",
              "auto-update-interval": "Update sensor data every",
            },
            options: { days: "days", hours: "hours", minutes: "minutes" },
          },
          "automatic-clear": {
            header: "Automatic weather data pruning",
            description:
              "Automatically remove collected weatherdata at a configured time. Use this to make sure that there is no left over weatherdata from previous days. Don't remove the weatherdata before you calculate and only use this option if you expect the automatic update to collect weatherdata after you calculated for the day. Ideally, you want to prune as late in the day as possible.",
            labels: {
              "automatic-clear-enabled":
                "Automatically clear collected weather data",
              "automatic-clear-time": "Clear weather data at",
            },
          },
        },
        description: "This page provides global settings.",
        title: "General",
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
            "english-only": "English only",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Add sensor group" },
            header: "Add sensor groups",
          },
          mapping: {
            aggregates: {
              average: "Average",
              first: "First",
              last: "Last",
              maximum: "Maximum",
              median: "Median",
              minimum: "Minimum",
              sum: "Sum",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "You cannot delete this sensor group because there is at least one zone using it.",
              invalid_source: "Invalid source",
              source_does_not_exist:
                "Source does not exist. Please enter a valid source, such as 'sensor.mysensor'.",
            },
            items: {
              dewpoint: "Dewpoint",
              evapotranspiration: "Evapotranspiration",
              humidity: "Humidity",
              "maximum temperature": "Maximum temperature",
              "minimum temperature": "Minimum temperature",
              precipitation: "Total precipitation",
              pressure: "Pressure",
              "solar radiation": "Solar radiation",
              temperature: "Temperature",
              windspeed: "Wind speed",
            },
            pressure_types: { absolute: "absolute", relative: "relative" },
            "pressure-type": "Pressure is",
            "sensor-aggregate-of-sensor-values-to-calculate":
              "of sensor values to calculate duration",
            "sensor-aggregate-use-the": "Use the",
            "sensor-entity": "Sensor entity",
            static_value: "Value",
            "input-units": "Input provides values in",
            source: "Source",
            sources: {
              none: "None",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Static value",
            },
          },
        },
        description:
          "Add one or more sensor groups that retrieve weather data from Weather service, from sensors or a combination of these. You can map each sensor group to one or more zones",
        labels: { "mapping-name": "Name" },
        no_items: "There are no sensor group defined yet.",
        title: "Sensor Groups",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Add module" },
            header: "Add module",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "You cannot delete this module because there is at least one zone using it.",
            },
            labels: {
              configuration: "Configuration",
              required: "indicates a required field",
            },
            "translated-options": {
              DontEstimate: "Do not estimate",
              EstimateFromSunHours: "Estimate from sun hours",
              EstimateFromTemp: "Estimate from temperature",
              EstimateFromSunHoursAndTemperature:
                "Estimate from average of sun hours and temperature",
            },
          },
        },
        description:
          "Add one or more modules that calculate irrigation duration. Each module comes with its own configuration and can be used to calculate duration for one or more zones.",
        no_items: "There are no modules defined yet.",
        title: "Modules",
      },
      zones: {
        actions: {
          add: "Add",
          calculate: "Calculate",
          information: "Information",
          update: "Update",
          "reset-bucket": "Reset bucket",
        },
        cards: {
          "add-zone": { actions: { add: "Add zone" }, header: "Add zone" },
          "zone-actions": {
            actions: {
              "calculate-all": "Calculate all zones",
              "update-all": "Update all zones",
              "reset-all-buckets": "Reset all buckets",
              "clear-all-weatherdata": "Clear all weatherdata",
            },
            header: "Actions on all zones",
          },
        },
        description:
          "Specify one or more irrigation zones here. The irrigation duration is calculated per zone, depending on size, throughput, state, module and sensor group.",
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
            manual: "Manual",
          },
          throughput: "Throughput",
          "maximum-bucket": "Maximum bucket",
          last_calculated: "Last calculated",
          "data-last-updated": "Data last updated",
          "data-number-of-data-points": "Number of data points",
        },
        no_items: "There are no zones defined yet.",
        title: "Zones",
      },
    },
    bt = "Smart Irrigation",
    yt = {
      common: pt,
      defaults: mt,
      module: gt,
      calcmodules: ft,
      panels: vt,
      title: bt,
    },
    _t = Object.freeze({
      __proto__: null,
      common: pt,
      defaults: mt,
      module: gt,
      calcmodules: ft,
      panels: vt,
      title: bt,
      default: yt,
    }),
    wt = {
      actions: { delete: "Eliminar" },
      labels: { module: "Módulo", no: "No", select: "Seleccionar", yes: "Sí" },
      attributes: {
        size: "Tamaño",
        throughput: "Rendimiento",
        state: "Estado",
      },
    },
    kt = {
      "default-zone": "Zona de riego predeterminada",
      "default-mapping": "Grupo de sensores predeterminado",
    },
    St = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "Nota: esta explicación utiliza '.' como separador decimal y muestra valores redondeados. El módulo devuelve una deficiencia de evapotranspiración de",
          "bucket-was": "El cubo era",
          "new-bucket-values-is": "El nuevo valor del cubo es",
          "old-bucket-variable": "old_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary":
            "Dado que cubo < 0, el riego es necesario",
          "steps-taken-to-calculate-duration":
            "Para calcular la duración exacta, se siguieron los siguientes pasos",
          "precipitation-rate-defined-as":
            "La tasa de precipitación se define como",
          "duration-is-calculated-as": "La duración se calcula como",
          bucket: "cubo",
          "precipitation-rate-variable": "precipitation_rate",
          "multiplier-is-applied":
            "A continuación, se aplica el multiplicador. El multiplicador es",
          "duration-after-multiplier-is": "por lo que la duración es",
          "maximum-duration-is-applied":
            "A continuación, se aplica la duración máxima. La duración máxima es",
          "duration-after-maximum-duration-is": "por lo que la duración es",
          "lead-time-is-applied":
            "Por último, se aplica el plazo de entrega. El plazo de entrega es",
          "duration-after-lead-time-is": "por lo que la duración final es",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Como cubo >= 0, no es necesario regar y la duración se fija en",
          "maximum-bucket-is": "El tamaño máximo de cubo es",
        },
      },
    },
    Et = {
      pyeto: {
        description:
          "Calcular la duración a partir del cálculo FAO56 de la biblioteca PyETO",
      },
      static: {
        description: "Módulo 'de prueba' con un delta estático configurable",
      },
      passthrough: {
        description:
          "Módulo de paso que devuelve el valor de un sensor de evapotranspiración como delta",
      },
    },
    At = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Cálculo automático de la duración",
            labels: {
              "auto-calc-enabled":
                "Cálculo automático de la duración de las zonas",
              "auto-calc-time": "Calcular en",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Advertencia: la hora de actualización de los datos meteorológicos es igual o posterior a la hora de cálculo",
            },
            header: "Actualización automática de los datos meteorológicos",
            labels: {
              "auto-update-enabled":
                "Actualizar automáticamente los datos meteorológicos",
              "auto-update-first-update": "(Primer) Actualización a las",
              "auto-update-interval": "Actualizar datos del sensor cada",
            },
            options: { days: "días", hours: "horas", minutes: "minutos" },
          },
        },
        description: "Esta página provee configuraciones globales.",
        title: "General",
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
            "english-only": "sólo en inglés",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Añadir grupo de sensores" },
            header: "Añadir grupos de sensores",
          },
          mapping: {
            aggregates: {
              average: "Promedio",
              first: "Primero",
              last: "Último",
              maximum: "Máximo",
              median: "Mediana",
              minimum: "Mínimo",
              sum: "Suma",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "No puedes eliminar este grupo de sensores porque hay al menos una zona que lo está usando.",
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
              windspeed: "Velocidad del viento",
            },
            "sensor-aggregate-of-sensor-values-to-calculate":
              "de los valores de los sensores para calcular la duración",
            "sensor-aggregate-use-the": "Usar la",
            "sensor-entity": "Entidad de sensor",
            static_value: "Valor estático",
            "input-units": "Unidades de entrada",
            source: "Fuente",
            sources: {
              none: "Ninguno",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Valor estático",
            },
          },
        },
        description:
          "Añada uno o más grupos de sensores que recuperen datos meteorológicos de Weather service, de sensores o de una combinación de éstos. Puede asignar cada grupo de sensores a una o más zonas",
        labels: { "mapping-name": "Nombre del grupo de sensores" },
        no_items: "Aún no hay grupos de sensores definidos.",
        title: "Grupos de sensores",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Añadir módulo" },
            header: "Añadir módulo",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "No puedes eliminar este módulo porque hay al menos una zona que lo está usando.",
            },
            labels: { configuration: "Configuración", required: "Requerido" },
            "translated-options": {
              DontEstimate: "No estimar",
              EstimateFromSunHours: "Estimar desde horas de sol",
              EstimateFromTemp: "Estimar desde temperatura",
            },
          },
        },
        description:
          "Añada uno o varios módulos que calculen la duración del riego. Cada módulo tiene su propia configuración y puede utilizarse para calcular la duración de una o varias zonas.",
        no_items: "Aún no hay módulos definidos.",
        title: "Módulos",
      },
      zones: {
        actions: {
          add: "Añadir",
          calculate: "Calcular",
          information: "Información",
          update: "Actualizar",
          "reset-bucket": "Resetear cubo",
        },
        cards: {
          "add-zone": {
            actions: { add: "Añadir zona" },
            header: "Añadir zona",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calcular todas las zonas",
              "update-all": "Actualizar todas las zonas",
              "reset-all-buckets": "Resetear todos los cubos",
            },
            header: "Acciones en todas las zonas",
          },
        },
        description:
          "Especifique aquí una o varias zonas de riego. La duración del riego se calcula por zona, en función del tamaño, el rendimiento, el estado, el módulo y el grupo de sensores.",
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
            manual: "Manual",
          },
          throughput: "Rendimiento",
          "maximum-bucket": "Cubo máximo",
        },
        no_items: "Aún no hay zonas definidas.",
        title: "Zonas",
      },
    },
    $t = "Smart Irrigation",
    Mt = {
      common: wt,
      defaults: kt,
      module: St,
      calcmodules: Et,
      panels: At,
      title: $t,
    },
    Tt = Object.freeze({
      __proto__: null,
      common: wt,
      defaults: kt,
      module: St,
      calcmodules: Et,
      panels: At,
      title: $t,
      default: Mt,
    }),
    Ot = {
      actions: { delete: "Suppression" },
      labels: {
        module: "Module",
        no: "Non",
        select: "Sélectionner",
        yes: "Oui",
      },
      attributes: { size: "taille", throughput: "débit", state: "état" },
    },
    xt = {
      "default-zone": "Zone par défaut",
      "default-mapping": "Groupe de capteurs par défaut",
    },
    zt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "NB: cette explication utilise '.' comme séparateur décimal, et affiche des valeurs arrondies. Le module a donné un manque d'Évapotranspiration de",
          "bucket-was": "Le seau (bucket) était de",
          "new-bucket-values-is": "La nouvelle valeur du seau (bucket) est",
          "old-bucket-variable": "ancien_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary":
            "Puisque le seau (bucket) est < 0, l'irrigation est nécessaire",
          "steps-taken-to-calculate-duration":
            "Pour calculer la durée d'irrigation, les étapes suivantes ont été réalisées",
          "precipitation-rate-defined-as":
            "Le taux de précipitation est défini comme",
          "duration-is-calculated-as":
            "La durée d'irrigation est calculée avec",
          bucket: "seau (bucket)",
          "precipitation-rate-variable": "taux_precipitation",
          "multiplier-is-applied":
            "Le multiplicateur est appliqué. Le multiplicateur est",
          "duration-after-multiplier-is": "donc la durée d'irrigation est de",
          "maximum-duration-is-applied":
            "Ensuite la durée maximale est appliquée. La durée maximale est de",
          "duration-after-maximum-duration-is":
            "donc la durée d'irrigation est de",
          "lead-time-is-applied":
            "Enfin, le délai est appliqué. Le délai est de",
          "duration-after-lead-time-is": "et donc la durée finale est de",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Puisque le seau (bucket) est >= 0, l'irrigation n'est pas nécessaire, et la durée est réglée à",
          "maximum-bucket-is": "la taille du seau (bucket) maximale est",
        },
      },
    },
    Dt = {
      pyeto: {
        description:
          "Le calcul de durée est basée sur le calcul FAO56 de la bibliothèque PyETO",
      },
      static: {
        description: "Module 'Dummy' avec un delta statique configurable",
      },
      passthrough: {
        description:
          "Module passerelle qui renvoie la valeur d'un capteur d'Évapotranspiration comme delta",
      },
    },
    Ht = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Calcul automatique de la durée",
            labels: {
              "auto-calc-enabled": "Calcule automatiquement la durée par zone",
              "auto-calc-time": "Calcule à",
            },
            description:
              "Le calcul prend en compte les données météo jusqu'à ce point et met à jour le seau (bucket) pour chaque zone automatique. Ensuite, la durée est ajustée par la nouvelle valeur de seau (bucket) et les données météo sont supprimées.",
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Attention: mise à jour des données météo au moment du, ou après le, calcul",
            },
            header: "Mise à jour automatique des données météo",
            labels: {
              "auto-update-enabled":
                "Met à jour les données météo automatiquement",
              "auto-update-first-update": "(Première) Mise à jour à",
              "auto-update-interval":
                "Mettre à jour les données des capteurs toutes les",
              "auto-update-delay": "Délai de mise à jour",
            },
            options: { days: "jours", hours: "heures", minutes: "minutes" },
            description:
              "Récupère et stocke les données météo automatiquement. Des données météo sont nécessaires pour calculer les seaux (buckets) par zone et les durées.",
          },
          "automatic-clear": {
            header: "Délestage automatique des données météo",
            description:
              "Suppression automatique des données météo collectées à une heure données. Utilisez ceci pour être sûr qu'il n'y ait plus de restes des données météo des jours précédents. Ne supprimez pas les données météo avant le calcul et n'utilisez cette option que si vous vous attendez à ce que les données météo soient récupérées après le calcul du jour. Idéalement, vous voudrez \"élaguer\" les données les plus tard possible dans la journée.",
            labels: {
              "automatic-clear-enabled":
                "Suppression automatique des données météo collectées",
              "automatic-clear-time": "Supprimer les données météo à",
            },
          },
        },
        description: "Cette page fournit les réglages globaux.",
        title: "Général",
      },
      help: {
        title: "Aide",
        cards: {
          "how-to-get-help": {
            title: "Comment obtenir de l'aide",
            "first-read-the": "Premièrement, lisez ",
            wiki: "Wiki",
            "if-you-still-need-help":
              "Si vous avez toujours besoin d'aide, adressez vous sur le",
            "community-forum": "forum communautaire",
            "or-open-a": "ou ouvrez un",
            "github-issue": "problème Github",
            "english-only": "en Anglais uniquement",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Ajouter un groupe de capteurs" },
            header: "Ajouter des groupes de capteurs",
          },
          mapping: {
            aggregates: {
              average: "Moyenne",
              first: "Premier",
              last: "Dernier",
              maximum: "Maximum",
              median: "Médian",
              minimum: "Minimum",
              sum: "Somme",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "Vous ne pouvez pas supprimer ce groupe de capteurs car au moins une zone l'utilise.",
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
              windspeed: "Vitesse du vent",
            },
            "sensor-aggregate-of-sensor-values-to-calculate":
              "des valeurs des capteurs pour calculer la durée",
            "sensor-aggregate-use-the": "Utiliser les",
            "sensor-entity": "Entité capteur",
            static_value: "Valeur",
            "input-units": "L'entité fournit des entrées en",
            source: "Source",
            sources: {
              none: "Aucun",
              weather_service: "Weather service",
              sensor: "Capteur",
              static: "Valeur statique",
            },
            pressure_types: { relative: "relative", absolute: "absolue" },
            "pressure-type": "La pression est",
            "sensor-units": "Le capteur fournit les valeurs en",
          },
        },
        description:
          "Ajouter un ou plusieurs groupes de capteurs qui récupèrent les données météo de Weather service, de capteurs locaux ou d'une combinaison de tous ceux-ci. Vous pouvez associer chaque groupe de capteurs avec une ou plusieurs zones",
        labels: { "mapping-name": "Nom" },
        no_items: "Il n'y a pas encore de groupe de capteurs définis.",
        title: "Groupes de capteurs",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Ajouter un module" },
            header: "Ajout d'un module",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "Vous ne pouvez pas supprimer ce module car au moins une zone l'utilise.",
            },
            labels: {
              configuration: "Configuration",
              required: "indique un champ requis",
            },
            "translated-options": {
              DontEstimate: "Ne fait pas d'estimation",
              EstimateFromSunHours:
                "Estimation à partir des heures d'ensoleillement",
              EstimateFromTemp: "Estimation à partir de la température",
            },
          },
        },
        description:
          "Ajouter un ou plusieurs modules qui calcule la durée d'irrigation. Chaque module vient avec sa propre configuration et peut être utilisé pour calculer la durée d'irrigation d'une ou plusieurs zones.",
        no_items: "Il n'y a aucun module défini pour l'instant.",
        title: "Modules",
      },
      zones: {
        actions: {
          add: "Ajouter",
          calculate: "Calculer",
          information: "Information",
          update: "Mise à jour",
          "reset-bucket": "Mise à zéro du seau (bucket)",
        },
        cards: {
          "add-zone": {
            actions: { add: "Ajouter une zone" },
            header: "Ajout d'une zone",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calculer pour toutes les zones",
              "update-all": "Mise à jour de toutes les zones",
              "reset-all-buckets": "Mise à zéro de tous les seaux (buckets)",
              "clear-all-weatherdata":
                "Mise à zéro de toutes les données météo",
            },
            header: "Actions sur toutes les zones",
          },
        },
        description:
          "Spécifiez une ou plusieurs zones d'irrigation ici. La durée d'irrigation est calculée par zone, en fonction de la taille, du débit, état, module et groupe de capteurs.",
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
            manual: "Manuel",
          },
          throughput: "Débit",
          "maximum-bucket": "Seau (bucket) maximum",
          last_calculated: "Dernier calcul",
          "data-last-updated": "Dernière mise à jour",
          "data-number-of-data-points": "Nombre de points de données",
        },
        no_items: "Il n'y a pas encore de zone définie.",
        title: "Zones",
      },
    },
    Pt = "Smart Irrigation",
    Nt = {
      common: Ot,
      defaults: xt,
      module: zt,
      calcmodules: Dt,
      panels: Ht,
      title: Pt,
    },
    Ct = Object.freeze({
      __proto__: null,
      common: Ot,
      defaults: xt,
      module: zt,
      calcmodules: Dt,
      panels: Ht,
      title: Pt,
      default: Nt,
    }),
    jt = {
      actions: { delete: "Cancella" },
      labels: { module: "Modulo", no: "No", select: "Seleziona", yes: "Si" },
      attributes: {
        size: "size",
        throughput: "throughput",
        state: "state",
        bucket: "secchio",
        last_updated: "ultimo aggiornamento",
        last_calculated: "ultimo calcolo",
        number_of_data_points: "numero di punti dati",
      },
    },
    Lt = {
      "default-zone": "Zona predefinita",
      "default-mapping": "Mappatura predefinita",
    },
    Bt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "Il modulo ha restituito un deficit di evapotraspirazione del",
          "bucket-was": "Il secchio era",
          "new-bucket-values-is": "Il nuovo valore del secchio è",
          "old-bucket-variable": "old_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary":
            "Poiché secchio < 0, è necessaria l'irrigazione",
          "steps-taken-to-calculate-duration":
            "Per calcolare la durata esatta, sono stati eseguiti i seguenti passaggi",
          "precipitation-rate-defined-as":
            "Il tasso di precipitazione è definito come",
          "duration-is-calculated-as": "La durata viene calcolata come",
          bucket: "bucket",
          "precipitation-rate-variable": "precipitation_rate",
          "multiplier-is-applied":
            "Ora viene applicato il moltiplicatore. Il moltiplicatore è",
          "duration-after-multiplier-is": "quindi la durata è",
          "maximum-duration-is-applied":
            "Quindi, viene applicata la durata massima. La durata massima è",
          "duration-after-maximum-duration-is": "quindi la durata è",
          "lead-time-is-applied":
            "Infine, viene applicato il lead time. Il tempo di consegna è",
          "duration-after-lead-time-is": "quindi la durata finale è",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Poiché secchio >= 0, non è necessaria alcuna irrigazione e la durata è impostata su",
          "maximum-bucket-is": "la dimensione massima del secchio è",
        },
      },
    },
    It = {
      pyeto: {
        description:
          "Calcola la durata in base al calcolo FAO56 dalla libreria PyETO",
      },
      static: {
        description: "Modulo 'fittizio' con un delta configurabile statico",
      },
      passthrough: {
        description:
          "Modulo passthrough che restituisce il valore di un sensore di Evapotraspirazione sotto forma di delta",
      },
    },
    Rt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Calcolo automatico della durata",
            description:
              "Il calcolo prende i dati meteorologici raccolti fino a quel momento e aggiorna il bucket per ciascuna zona automatica. Quindi, la durata viene regolata in base al nuovo valore del segmento e i dati meteorologici raccolti vengono rimossi.",
            labels: {
              "auto-calc-enabled":
                "Calcola automaticamente la durata delle zone",
              "auto-calc-time": "Calcola a",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Attenzione: ora di aggiornamento dei dati meteorologici in corrispondenza o dopo l'ora di calcolo",
            },
            header: "Aggiornamento automatico dei dati meteorologici",
            description:
              "Raccogli e archivia automaticamente i dati meteorologici. I dati meteorologici sono necessari per calcolare gli intervalli e le durate delle zone.",
            labels: {
              "auto-update-enabled":
                "Aggiorna automaticamente i dati meteorologici",
              "auto-update-first-update": "(Primo) aggiornamento alle",
              "auto-update-interval": "Aggiorna i dati del sensore ogni",
            },
            options: { days: "giorni", hours: "ore", minutes: "minuti" },
          },
          "automatic-clear": {
            header: "Eliminazione automatica dei dati meteo",
            description:
              "Rimuovi automaticamente i dati meteorologici raccolti all'orario configurato. Usalo per assicurarti che non siano rimasti dati meteorologici dei giorni precedenti. Non rimuovere i dati meteo prima del calcolo e utilizza questa opzione solo se prevedi che l'aggiornamento automatico raccolga i dati meteo dopo aver calcolato per la giornata. Idealmente, dovresti potare il più tardi possibile nella giornata.",
            labels: {
              "automatic-clear-enabled":
                "Cancella automaticamente i dati meteorologici raccolti",
              "automatic-clear-time": "Cancella dati meteo a",
            },
          },
        },
        description: "Questa pagina fornisce le impostazioni globali.",
        title: "Generale",
      },
      help: {
        title: "Aiuto",
        cards: {
          "how-to-get-help": {
            title: "Come ottenere aiuto",
            "first-read-the": "Per prima cosa, leggi il",
            wiki: "Wiki",
            "if-you-still-need-help":
              "Se hai ancora bisogno di aiuto, contatta il",
            "community-forum": "Forum della Comunità",
            "or-open-a": "oppure apri un",
            "github-issue": "Problema su Github",
            "english-only": "soltanto in Inglese",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Aggiungi gruppo di sensori" },
            header: "Aggiungi gruppo di sensori",
          },
          mapping: {
            aggregates: {
              average: "Media",
              first: "Primo",
              last: "Ultimo",
              maximum: "Massimo",
              median: "Mediana",
              minimum: "Minimo",
              sum: "Somma",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "Non è possibile eliminare questo gruppo di sensori perché almeno una zona lo utilizza.",
            },
            items: {
              dewpoint: "Punto di rugiada",
              evapotranspiration: "Evapotraspirazione",
              humidity: "Umidità",
              "maximum temperature": "Temperatura massima",
              "minimum temperature": "Temperatura minima",
              precipitation: "Precipitazione",
              pressure: "Pressione",
              "solar radiation": "Irradiamento solare",
              temperature: "Temperatura",
              windspeed: "Velocità del vento",
            },
            pressure_types: { absolute: "assoluta", relative: "relativa" },
            "pressure-type": "La pressione è",
            "sensor-aggregate-of-sensor-values-to-calculate":
              "dei valori del sensore per calcolare la durata",
            "sensor-aggregate-use-the": "Usa il",
            "sensor-entity": "Entità sensore",
            static_value: "Valore",
            "input-units": "L'input fornisce valori in",
            source: "Fonte",
            sources: {
              none: "Nessuna",
              weather_service: "Weather service",
              sensor: "Sensore",
              static: "Valore statico",
            },
          },
        },
        description:
          "Aggiungi uno o più gruppi di sensori che recuperano i dati meteorologici da Weather service, da sensori o da una combinazione di questi. È possibile mappare ciascun gruppo di sensori su una o più zone",
        labels: { "mapping-name": "Nome" },
        no_items: "Non è ancora stato definito alcun gruppo di sensori.",
        title: "Gruppi di sensori",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Aggiungi modulo" },
            header: "Aggiungi modulo",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "Non puoi eliminare questo modulo perché almeno una zona lo utilizza.",
            },
            labels: {
              configuration: "Configurazione",
              required: "indica un campo richiesto",
            },
            "translated-options": {
              DontEstimate: "Non stimare",
              EstimateFromSunHours: "Stima dalle ore solari",
              EstimateFromTemp: "Stima dalla temperatura",
              EstimateFromSunHoursAndTemperature:
                "Stima dalla media delle ore di sole e della temperatura",
            },
          },
        },
        description:
          "Aggiungi uno o più moduli che calcolano la durata dell'irrigazione. Ogni modulo viene fornito con la propria configurazione e può essere utilizzato per calcolare la durata di una o più zone.",
        no_items: "Non ci sono ancora moduli definiti.",
        title: "Moduli",
      },
      zones: {
        actions: {
          add: "Aggiungi",
          calculate: "Calcola",
          information: "Informazioni",
          update: "Aggiorna",
          "reset-bucket": "Reimposta il secchio",
        },
        cards: {
          "add-zone": {
            actions: { add: "Aggiungi zona" },
            header: "Aggiungi zona",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Calcola tutte le zone",
              "update-all": "Aggiorna tutte le zone",
              "reset-all-buckets": "Reimposta tutte le zone",
              "clear-all-weatherdata": "Cancella tutti i dati meteo",
            },
            header: "Azioni su tutte le zone",
          },
        },
        description:
          "Specificare qui una o più zone di irrigazione. La durata dell'irrigazione viene calcolata per zona, a seconda delle dimensioni, della produttività, dello stato, del modulo e del gruppo di sensori.",
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
            manual: "Manuale",
          },
          throughput: "Portata",
          "maximum-bucket": "Secchio massimo",
          last_calculated: "Ultimo calcolo",
          "data-last-updated": "Ultimo aggiornamento dei dati",
          "data-number-of-data-points": "Numero di dati",
        },
        no_items: "Non ci sono ancora zone definite.",
        title: "Zone",
      },
    },
    Ut = "Irrigazione Intelligente",
    Yt = {
      common: jt,
      defaults: Lt,
      module: Bt,
      calcmodules: It,
      panels: Rt,
      title: Ut,
    },
    Vt = Object.freeze({
      __proto__: null,
      common: jt,
      defaults: Lt,
      module: Bt,
      calcmodules: It,
      panels: Rt,
      title: Ut,
      default: Yt,
    }),
    Gt = {
      actions: { delete: "Verwijderen" },
      labels: { module: "Module", no: "Nee", select: "Kies", yes: "Ja" },
      attributes: { size: "afmeting", throughput: "doorvoer", state: "status" },
    },
    Ft = {
      "default-zone": "Standaard zone",
      "default-mapping": "Standaard sensorgroep",
    },
    Wt = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "NB: in deze uitleg wordt de '.' as decimaalscheidingsteken gebruikt, worden afgeronde en metrische getallen getoond. Module berekende ET waarde van",
          "bucket-was": "Voorraad was",
          "new-bucket-values-is": "Nieuwe voorraad is",
          "old-bucket-variable": "oude_voorraad",
          delta: "verandering",
          "bucket-less-than-zero-irrigation-necessary":
            "Omdat de voorraad < 0 is, is irrigatie nodig",
          "steps-taken-to-calculate-duration":
            "On de exacte duur te berekenen werd het volgende gedaan",
          "precipitation-rate-defined-as": "De neerslag is",
          "duration-is-calculated-as": "De duur is",
          bucket: "voorraad",
          "precipitation-rate-variable": "neerslag",
          "multiplier-is-applied":
            "De vermenigvuldiger wordt toegepast. Deze is",
          "duration-after-multiplier-is": "dus de duur is",
          "maximum-duration-is-applied":
            "De maximum duur wordt toegepast. Deze is",
          "duration-after-maximum-duration-is": "dus de duur is",
          "lead-time-is-applied":
            "As laatste wordt de aanlooptijd toegepast. Deze is",
          "duration-after-lead-time-is": "dus de uiteindelijke duur is",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Omdat de voorraad >= 0 is er geen irrigatie nodig en is de duur gelijk aan",
          "maximum-bucket-is": "maximale voorraad grootte is",
        },
      },
    },
    Zt = {
      pyeto: {
        description:
          "Bereken duur op basis van de FAU56 formule en de PyETO library",
      },
      static: { description: "Module met instelbare verandering" },
      passthrough: {
        description: "Geeft waarde van ET sensor as verandering terug",
      },
    },
    qt = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatische berekening van irrigatietijd",
            description:
              "Bij het berekenen wordt de verzamelde weersinformatie gebruikt om the voorraad en irrigatieduur per zone aan te passen. Daarna wordt de verzamelde weersinformatie verwijderd.",
            labels: {
              "auto-calc-enabled":
                "Automatisch irrigatietijd berekening voor elke zone",
              "auto-calc-time": "Berekenen op",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Let op: het automatisch bijwerken van weersinformatie vind plaats op of na de automatische berekening van irrigatietijd",
            },
            header: "Automatisch bijwerken van weersinformatie",
            description:
              "Verzamel en bewaar weersinformatie automatisch. Weersinformatie is nodig om vorraad en irrigatieduur per zone te berekenen.",
            labels: {
              "auto-update-enabled": "Automatisch weersinformatie bijwerken",
              "auto-update-delay": "Vertraging",
              "auto-update-interval": "Sensor data bijwerken elke",
            },
            options: { days: "dagen", hours: "uren", minutes: "minuten" },
          },
          "automatic-clear": {
            header: "Automatisch weersinformatie opruimen",
            description:
              "Verwijder weersinformatie op het ingestelde moment. Dit zorgt ervoor dat er geen weersinformatie van de vorige dag gebruikt kan worden voor berekeningen. Let op: verwijder geen weersinformatie voordat de berekening heeft plaatsgevonden. Gebruik deze optie als je verwacht dat er weersinformatie zal worden verzameld nadat de berekeningen voor de dag gedaan zijn. Verwijder weersinformatie zo laat mogelijk op de dag.",
            labels: {
              "automatic-clear-enabled":
                "Automatisch weersinformatie verwijderen",
              "automatic-clear-time": "Verwijder weersinformatie om",
            },
          },
        },
        description: "Dit zijn de algemene instellingen.",
        title: "Algemeen",
      },
      help: {
        title: "Hulp",
        cards: {
          "how-to-get-help": {
            title: "Hulp vragen",
            "first-read-the": "Allereerst, lees de",
            wiki: "Wiki",
            "if-you-still-need-help":
              "Als je hierna nog steeds hulp nodig hebt, laat een bericht achter op het",
            "community-forum": "Community forum",
            "or-open-a": "of open een",
            "github-issue": "Github Issue",
            "english-only": "alleen Engels",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Toevoegen" },
            header: "Voeg sensorgroep toe",
          },
          mapping: {
            aggregates: {
              average: "Gemiddelde",
              first: "Eerste",
              last: "Laatste",
              maximum: "Maximum",
              median: "Mediaan",
              minimum: "Minimum",
              sum: "Totaal",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "Deze sensorgroep kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt.",
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
              windspeed: "Wind snelheid",
            },
            pressure_types: { absolute: "absoluut", relative: "relatief" },
            "pressure-type": "Druk is",
            "sensor-aggregate-of-sensor-values-to-calculate":
              "van de sensor waardes om irrigatietijd te berekenen",
            "sensor-aggregate-use-the": "Gebruik de/het",
            "sensor-entity": "Sensor entiteit",
            "input-units": "Invoer geeft waardes in",
            static_value: "Waarde",
            source: "Bron",
            sources: {
              none: "Geen",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Vaste waarde",
            },
          },
        },
        description:
          "Voeg een of meer sensorgroepen toe die weergegevens ophalen van Weather service, van sensoren of een combinatie. Elke sensorgroep kan worden gebruikt voor een of meerdere zones",
        labels: { "mapping-name": "Name" },
        no_items: "Er zijn nog geen sensorgroepen.",
        title: "Sensorgroepen",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Toevoegen" },
            header: "Voeg module toe",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "Deze module kan niet worden verwijderd omdat er minimaal een zone gebruik van maakt.",
            },
            labels: {
              configuration: "Instellingen",
              required: "verplicht veld",
            },
            "translated-options": {
              DontEstimate: "Niet berekenen",
              EstimateFromSunHours: "Gebaseerd op zon uren",
              EstimateFromTemp: "Gebaseerd op temperatuur",
            },
          },
        },
        description:
          "Voeg een of meerdere modules toe. Modules berekenen irrigatietijd. Elke module heeft zijn eigen configuratie and kan worden gebruikt voor het berekening van irrigatietijd voor een of meerdere zones.",
        no_items: "Er zijn nog geen modules.",
        title: "Modules",
      },
      zones: {
        actions: {
          add: "Toevoegen",
          calculate: "Bereken",
          information: "Informatie",
          update: "Bijwerken",
          "reset-bucket": "Leeg voorraad",
        },
        cards: {
          "add-zone": {
            actions: { add: "Toevoegen" },
            header: "Voeg zone toe",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Bereken alle zones",
              "update-all": "Werk alle zone data bij",
              "reset-all-buckets": "Leeg alle voorraden",
              "clear-all-weatherdata": "Verwijder alle weersinformatie",
            },
            header: "Acties voor alle zones",
          },
        },
        description:
          "Voeg een of meerdere zones toe. Per zone wordt de irrigatietijd berekend, afhankelijk van de afmeting, doorvoer, status, module en sensorgroep.",
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
            manual: "Manueel",
          },
          throughput: "Doorvoer",
          "maximum-bucket": "Maximale voorraad",
          last_calculated: "Berekend op",
          "data-last-updated": "Bijgewerkt op",
          "data-number-of-data-points": "Aantal datapunten",
        },
        no_items: "Er zijn nog geen zones.",
        title: "Zones",
      },
    },
    Kt = "Smart Irrigation",
    Xt = {
      common: Gt,
      defaults: Ft,
      module: Wt,
      calcmodules: Zt,
      panels: qt,
      title: Kt,
    },
    Jt = Object.freeze({
      __proto__: null,
      common: Gt,
      defaults: Ft,
      module: Wt,
      calcmodules: Zt,
      panels: qt,
      title: Kt,
      default: Xt,
    }),
    Qt = {
      actions: { delete: "Slett" },
      labels: { module: "Modul", no: "Nei", select: "Velg", yes: "Ja" },
      attributes: {
        size: "størrelse",
        throughput: "kapasitet",
        state: "status",
      },
    },
    ea = {
      "default-zone": "Standard sone",
      "default-mapping": "Standard sensorguppe",
    },
    ta = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "Merk: Denne forklaringen bruker '.' som desimaltegn og viser avrundede verdier. Modulen returnerte evapotranspirasjonsunderskudd på",
          "bucket-was": "Bucket var",
          "new-bucket-values-is": "Ny bucket verdien er",
          "old-bucket-variable": "gammel_bucket",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary":
            "Siden bucket < 0, Vanning er nødvendig.",
          "steps-taken-to-calculate-duration":
            "For å beregne nøyaktig varighet, ble følgende trinn utført",
          "precipitation-rate-defined-as": "Nedbørshastigheten er definert som",
          "duration-is-calculated-as": "Varigheten beregnes som",
          bucket: "bucket",
          "precipitation-rate-variable": "nedbørshastighet",
          "multiplier-is-applied":
            "Nå blir multiplikatoren brukt. Multiplikatoren er",
          "duration-after-multiplier-is": "derfor er varigheten",
          "maximum-duration-is-applied":
            "Deretter blir den maksimale varigheten brukt. Den maksimale varigheten er",
          "duration-after-maximum-duration-is": "derfor er varigheten",
          "lead-time-is-applied":
            "Til slutt blir ledetiden brukt. Ledetiden er",
          "duration-after-lead-time-is": "derfor er den endelige varigheten",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Siden bucket >= 0, Ingen vanning er nødvendig, og varigheten er satt til",
          "maximum-bucket-is": "maksimum bucket stærrelse er",
        },
      },
    },
    aa = {
      pyeto: {
        description:
          "Beregn varigheten basert på FAO56-beregningen fra PyETO-biblioteket",
      },
      static: {
        description:
          "'Dummy'-modul med en statisk konfigurerbar endring (delta)",
      },
      passthrough: {
        description:
          "En 'Passthrough'-modul som returnerer verdien av en Evapotranspiration-sensor som delta",
      },
    },
    ia = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatisk varighetsberegning",
            labels: {
              "auto-calc-enabled": "Beregn sonevarigheter automatisk",
              "auto-calc-time": "Beregn ved",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Advarsel: Oppdateringstidspunkt for værdata på eller etter beregningstidspunktet",
            },
            header: "Automatisk oppdatering av værdata",
            labels: {
              "auto-update-enabled": "Oppdater værdata automatisk",
              "auto-update-first-update": "(Første) Oppdatering kl",
              "auto-update-interval": "Oppdater sensordata hvert",
            },
            options: { days: "dager", hours: "timer", minutes: "minutter" },
          },
        },
        description: "Denne siden gir globale innstillinger.",
        title: "Generelt",
      },
      help: {
        title: "Hjelp",
        cards: {
          "how-to-get-help": {
            title: "Hvordan få hjelp",
            "first-read-the": "Først, les",
            wiki: "Wikien",
            "if-you-still-need-help":
              "Hvis du fremdeles trenger hjelp, ta kontakt på",
            "community-forum": "Fellesskapsforumet",
            "or-open-a": "eller åpne en",
            "github-issue": "Github-sak",
            "english-only": "Kun på engelsk",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Legg til sensorguppe" },
            header: "Legg til sensorgupper",
          },
          mapping: {
            aggregates: {
              average: "Gjennomsnitt",
              first: "Første",
              last: "Siste",
              maximum: "Maksimum",
              median: "Median",
              minimum: "Minimum",
              sum: "Sum",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "Du kan ikke slette denne sensorguppen fordi minst én sone bruker den.",
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
              windspeed: "Vindhastighet",
            },
            "sensor-aggregate-of-sensor-values-to-calculate":
              "av sensordata for å beregne varighet",
            "sensor-aggregate-use-the": "Bruk",
            "sensor-entity": "Sensorenhet",
            static_value: "Verdi",
            "input-units": "Inndata gir verdier i",
            source: "Kilde",
            sources: {
              none: "Ingen",
              weather_service: "Weather service",
              sensor: "Sensor",
              static: "Statisk verdi",
            },
          },
        },
        description:
          "Legg til en eller flere sensorgupper som henter værdata fra Weather service, fra sensorer eller en kombinasjon av disse. Du kan tilordne hver sensorguppe til en eller flere soner",
        labels: { "mapping-name": "Navn" },
        no_items: "Det er ingen definerte sensorgupper ennå.",
        title: "Sensorgupper",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Legg til modul" },
            header: "Legg til modul",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "Du kan ikke slette denne modulen fordi minst én sone bruker den.",
            },
            labels: {
              configuration: "Konfigurasjon",
              required: "indikerer et obligatorisk felt",
            },
            "translated-options": {
              DontEstimate: "Ikke beregn",
              EstimateFromSunHours: "Beregn fra soltimer",
              EstimateFromTemp: "Beregn fra temperatur",
            },
          },
        },
        description:
          "Legg til en eller flere moduler som beregner vanningsvarighet. Hver modul har sin egen konfigurasjon og kan brukes til å beregne varighet for en eller flere soner.",
        no_items: "Det er ingen definerte moduler ennå.",
        title: "Moduler",
      },
      zones: {
        actions: {
          add: "Legg til",
          calculate: "Beregn",
          information: "Informasjon",
          update: "Oppdater",
          "reset-bucket": "Nullstill bøtte",
        },
        cards: {
          "add-zone": {
            actions: { add: "Legg til sone" },
            header: "Legg til sone",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Beregn alle soner",
              "update-all": "Oppdater alle soner",
              "reset-all-buckets": "Nullstill alle bøtter",
            },
            header: "Handlinger på alle soner",
          },
        },
        description:
          "Spesifiser en eller flere vanningssoner her. Vanningens varighet beregnes per sone, avhengig av størrelse, gjennomstrømning, tilstand, modul og sensorguppe.",
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
            manual: "Manuell",
          },
          throughput: "Gjennomstrømning",
          "maximum-bucket": "Maksimal bøtte",
        },
        no_items: "Det er ingen definerte soner ennå.",
        title: "Soner",
      },
      title: "Smart vanning",
    },
    na = { common: Qt, defaults: ea, module: ta, calcmodules: aa, panels: ia },
    sa = Object.freeze({
      __proto__: null,
      common: Qt,
      defaults: ea,
      module: ta,
      calcmodules: aa,
      panels: ia,
      default: na,
    }),
    ra = {
      actions: { delete: "Zmazať" },
      labels: { module: "Modul", no: "Nie", select: "Zvoliť", yes: "Áno" },
      attributes: {
        size: "size",
        throughput: "priepustnosť",
        state: "stav",
        bucket: "nádoba",
      },
    },
    oa = {
      "default-zone": "Predvolená zóna",
      "default-mapping": "Predvolená skupina snímačov",
    },
    la = {
      calculation: {
        explanation: {
          "module-returned-evapotranspiration-deficiency":
            "Poznámka: toto vysvetlenie používa '.' ako oddeľovač desatinných miest zobrazuje zaokrúhlené a metrické hodnoty. Modul vrátil nedostatok evapotranspirácie",
          "bucket-was": "Vedro bolo",
          "new-bucket-values-is": "Hodnota nového vedra je",
          "old-bucket-variable": "staré_vedro",
          delta: "delta",
          "bucket-less-than-zero-irrigation-necessary":
            "Keďže vedro < 0, je potrebné zavlažovanie",
          "steps-taken-to-calculate-duration":
            "Na výpočet presného trvania sa vykonali nasledujúce kroky",
          "precipitation-rate-defined-as": "Miera zrážok je definovaná ako",
          "duration-is-calculated-as": "Trvanie sa vypočíta ako",
          bucket: "vedro",
          "precipitation-rate-variable": "úhrn zrážok",
          "multiplier-is-applied":
            "Teraz sa použije multiplikátor. Násobiteľ je",
          "duration-after-multiplier-is": "teda trvanie je",
          "maximum-duration-is-applied":
            "Potom sa použije maximálne trvanie. Maximálne trvanie je",
          "duration-after-maximum-duration-is": "teda trvanie je",
          "lead-time-is-applied":
            "Nakoniec sa použije dodacia lehota. Dodacia lehota je",
          "duration-after-lead-time-is": "teda konečné trvanie je",
          "bucket-larger-than-or-equal-to-zero-no-irrigation-necessary":
            "Keďže vedro >= 0, nie je potrebné žiadne zavlažovanie a trvanie je nastavené na",
          "maximum-bucket-is": "maximálna veľkosť vedra je",
        },
      },
    },
    ua = {
      pyeto: {
        description:
          "Vypočítajte trvanie na základe výpočtu FAO56 z knižnice PyETO",
      },
      static: {
        description: "'Atrapa' modul so statickou konfigurovateľnou deltou",
      },
      passthrough: {
        description:
          "Priechodný modul, ktorý vracia hodnotu evapotranspiračného senzora ako delta",
      },
    },
    da = {
      general: {
        cards: {
          "automatic-duration-calculation": {
            header: "Automatický výpočet trvania",
            description:
              "Výpočet berie zhromaždené údaje o počasí až do tohto bodu a aktualizuje vedro pre každú automatickú zónu. Potom sa trvanie upraví na základe novej hodnoty segmentu a zhromaždené údaje o počasí sa odstránia.",
            labels: {
              "auto-calc-enabled": "Automaticky vypočítajte trvanie zón",
              "auto-calc-time": "Vypočítajte pri",
            },
          },
          "automatic-update": {
            errors: {
              "warning-update-time-on-or-after-calc-time":
                "Upozornenie: Čas aktualizácie údajov o počasí v čase výpočtu alebo po ňom",
            },
            header: "Automatic weather data update",
            description:
              "Automaticky zbierajte a ukladajte údaje o počasí. Údaje o počasí sú potrebné na výpočet segmentov zón a trvania.",
            labels: {
              "auto-update-enabled": "Automaticky aktualizovať údaje o počasí",
              "auto-update-delay": "Oneskorenie aktualizácie",
              "auto-update-interval": "Aktualizujte údaje snímača každý",
            },
            options: { days: "dni", hours: "hodiny", minutes: "minúty" },
          },
          "automatic-clear": {
            header: "Automatické orezávanie údajov o počasí",
            description:
              "Automaticky odstráňte zhromaždené údaje o počasí v nakonfigurovanom čase. Použite to, aby ste sa uistili, že nezostali žiadne údaje o počasí z predchádzajúcich dní. Neodstraňujte údaje o počasí pred výpočtom a túto možnosť použite iba vtedy, ak očakávate, že automatická aktualizácia bude zhromažďovať údaje o počasí až po výpočte na daný deň. V ideálnom prípade chcete prerezávať tak neskoro, ako je to možné.",
            labels: {
              "automatic-clear-enabled":
                "Automaticky vymazať zhromaždené údaje o počasí",
              "automatic-clear-time": "Vymazať údaje o počasí o",
            },
          },
        },
        description: "Táto stránka poskytuje globálne nastavenia.",
        title: "Všeobecné",
      },
      help: {
        title: "Pomoc",
        cards: {
          "how-to-get-help": {
            title: "Ako získať pomoc",
            "first-read-the": "Najprv si prečítajte",
            wiki: "Wiki",
            "if-you-still-need-help":
              "Ak stále potrebujete pomoc, obráťte sa na",
            "community-forum": "komunitné fórum",
            "or-open-a": "alebo otvorte a",
            "github-issue": "Problém Github",
            "english-only": "len anglicky",
          },
        },
      },
      mappings: {
        cards: {
          "add-mapping": {
            actions: { add: "Pridať skupinu snímačov" },
            header: "Pridajte skupiny senzorov",
          },
          mapping: {
            aggregates: {
              average: "Priemer",
              first: "Prvý",
              last: "Posledný",
              maximum: "Maximum",
              median: "Medián",
              minimum: "Minimum",
              sum: "Sum",
            },
            errors: {
              "cannot-delete-mapping-because-zones-use-it":
                "Túto skupinu senzorov nemôžete vymazať, pretože ju používa aspoň jedna zóna.",
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
              windspeed: "Rýchlosť vetra",
            },
            pressure_types: { absolute: "absolútne", relative: "relatítne" },
            "pressure-type": "Tlak je",
            "sensor-aggregate-of-sensor-values-to-calculate":
              "hodnôt snímača na výpočet trvania",
            "sensor-aggregate-use-the": "Použiť",
            "sensor-entity": "Entita snímača",
            static_value: "Hodnota",
            "input-units": "Vstup poskytuje hodnoty v",
            source: "Zdroj",
            sources: {
              none: "Nie je",
              weather_service: "Weather service",
              sensor: "Snímač",
              static: "Statická hodnota",
            },
          },
        },
        description:
          "Pridajte jednu alebo viac skupín senzorov, ktoré získavajú údaje o počasí z Weather service, zo senzorov alebo ich kombinácie. Každú skupinu senzorov môžete namapovať na jednu alebo viac zón",
        labels: { "mapping-name": "Názov" },
        no_items: "Zatiaľ nie je definovaná žiadna skupina senzorov.",
        title: "Skupiny senzorov",
      },
      modules: {
        cards: {
          "add-module": {
            actions: { add: "Pridať modul" },
            header: "Pridať modul",
          },
          module: {
            errors: {
              "cannot-delete-module-because-zones-use-it":
                "Tento modul nemôžete vymazať, pretože ho používa aspoň jedna zóna.",
            },
            labels: {
              configuration: "Konfigurácia",
              required: "označuje povinné pole",
            },
            "translated-options": {
              DontEstimate: "Bez odhadu",
              EstimateFromSunHours: "Odhad zo slnečných hodín",
              EstimateFromTemp: "Odhad z teploty",
            },
          },
        },
        description:
          "Pridajte jeden alebo viac modulov, ktoré vypočítavajú trvanie zavlažovania. Každý modul sa dodáva s vlastnou konfiguráciou a možno ho použiť na výpočet trvania pre jednu alebo viac zón.",
        no_items: "Zatiaľ nie sú definované žiadne moduly.",
        title: "Moduly",
      },
      zones: {
        actions: {
          add: "Pridať",
          calculate: "Vypočítať",
          information: "Informácia",
          update: "Aktualizovať",
          "reset-bucket": "Resetovať vedro",
        },
        cards: {
          "add-zone": {
            actions: { add: "Pridať zónu" },
            header: "Pridať zónu",
          },
          "zone-actions": {
            actions: {
              "calculate-all": "Vypočítajte všetky zóny",
              "update-all": "Aktualizujte všetky zóny",
              "reset-all-buckets": "Obnovte všetky vedrá",
              "clear-all-weatherdata": "Vymazať všetky údaje o počasí",
            },
            header: "Akcie vo všetkých zónach",
          },
        },
        description:
          "Tu špecifikujte jednu alebo viac zavlažovacích zón. Trvanie zavlažovania sa vypočíta pre zónu v závislosti od veľkosti, výkonu, stavu, modulu a skupiny senzorov.",
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
            manual: "Manuány",
          },
          throughput: "Priepustnosť",
          "maximum-bucket": "Maximálne vedro",
          last_calculated: "Naposledy vypočítané",
          "data-last-updated": "Údaje boli naposledy aktualizované",
          "data-number-of-data-points": "Počet údajových bodov",
        },
        no_items: "Zatiaľ nie sú definované žiadne zóny.",
        title: "Zóny",
      },
    },
    ca = "Inteligentné zavlažovanie",
    ha = {
      common: ra,
      defaults: oa,
      module: la,
      calcmodules: ua,
      panels: da,
      title: ca,
    },
    pa = Object.freeze({
      __proto__: null,
      common: ra,
      defaults: oa,
      module: la,
      calcmodules: ua,
      panels: da,
      title: ca,
      default: ha,
    });
  function ma(e) {
    return e.type === it.literal;
  }
  function ga(e) {
    return e.type === it.argument;
  }
  function fa(e) {
    return e.type === it.number;
  }
  function va(e) {
    return e.type === it.date;
  }
  function ba(e) {
    return e.type === it.time;
  }
  function ya(e) {
    return e.type === it.select;
  }
  function _a(e) {
    return e.type === it.plural;
  }
  function wa(e) {
    return e.type === it.pound;
  }
  function ka(e) {
    return e.type === it.tag;
  }
  function Sa(e) {
    return !(!e || "object" != typeof e || e.type !== nt.number);
  }
  function Ea(e) {
    return !(!e || "object" != typeof e || e.type !== nt.dateTime);
  }
  !(function (e) {
    (e[(e.EXPECT_ARGUMENT_CLOSING_BRACE = 1)] =
      "EXPECT_ARGUMENT_CLOSING_BRACE"),
      (e[(e.EMPTY_ARGUMENT = 2)] = "EMPTY_ARGUMENT"),
      (e[(e.MALFORMED_ARGUMENT = 3)] = "MALFORMED_ARGUMENT"),
      (e[(e.EXPECT_ARGUMENT_TYPE = 4)] = "EXPECT_ARGUMENT_TYPE"),
      (e[(e.INVALID_ARGUMENT_TYPE = 5)] = "INVALID_ARGUMENT_TYPE"),
      (e[(e.EXPECT_ARGUMENT_STYLE = 6)] = "EXPECT_ARGUMENT_STYLE"),
      (e[(e.INVALID_NUMBER_SKELETON = 7)] = "INVALID_NUMBER_SKELETON"),
      (e[(e.INVALID_DATE_TIME_SKELETON = 8)] = "INVALID_DATE_TIME_SKELETON"),
      (e[(e.EXPECT_NUMBER_SKELETON = 9)] = "EXPECT_NUMBER_SKELETON"),
      (e[(e.EXPECT_DATE_TIME_SKELETON = 10)] = "EXPECT_DATE_TIME_SKELETON"),
      (e[(e.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE = 11)] =
        "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"),
      (e[(e.EXPECT_SELECT_ARGUMENT_OPTIONS = 12)] =
        "EXPECT_SELECT_ARGUMENT_OPTIONS"),
      (e[(e.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE = 13)] =
        "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"),
      (e[(e.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE = 14)] =
        "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"),
      (e[(e.EXPECT_SELECT_ARGUMENT_SELECTOR = 15)] =
        "EXPECT_SELECT_ARGUMENT_SELECTOR"),
      (e[(e.EXPECT_PLURAL_ARGUMENT_SELECTOR = 16)] =
        "EXPECT_PLURAL_ARGUMENT_SELECTOR"),
      (e[(e.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT = 17)] =
        "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"),
      (e[(e.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT = 18)] =
        "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"),
      (e[(e.INVALID_PLURAL_ARGUMENT_SELECTOR = 19)] =
        "INVALID_PLURAL_ARGUMENT_SELECTOR"),
      (e[(e.DUPLICATE_PLURAL_ARGUMENT_SELECTOR = 20)] =
        "DUPLICATE_PLURAL_ARGUMENT_SELECTOR"),
      (e[(e.DUPLICATE_SELECT_ARGUMENT_SELECTOR = 21)] =
        "DUPLICATE_SELECT_ARGUMENT_SELECTOR"),
      (e[(e.MISSING_OTHER_CLAUSE = 22)] = "MISSING_OTHER_CLAUSE"),
      (e[(e.INVALID_TAG = 23)] = "INVALID_TAG"),
      (e[(e.INVALID_TAG_NAME = 25)] = "INVALID_TAG_NAME"),
      (e[(e.UNMATCHED_CLOSING_TAG = 26)] = "UNMATCHED_CLOSING_TAG"),
      (e[(e.UNCLOSED_TAG = 27)] = "UNCLOSED_TAG");
  })(at || (at = {})),
    (function (e) {
      (e[(e.literal = 0)] = "literal"),
        (e[(e.argument = 1)] = "argument"),
        (e[(e.number = 2)] = "number"),
        (e[(e.date = 3)] = "date"),
        (e[(e.time = 4)] = "time"),
        (e[(e.select = 5)] = "select"),
        (e[(e.plural = 6)] = "plural"),
        (e[(e.pound = 7)] = "pound"),
        (e[(e.tag = 8)] = "tag");
    })(it || (it = {})),
    (function (e) {
      (e[(e.number = 0)] = "number"), (e[(e.dateTime = 1)] = "dateTime");
    })(nt || (nt = {}));
  var Aa = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
    $a =
      /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
  function Ma(e) {
    var t = {};
    return (
      e.replace($a, function (e) {
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
            throw new RangeError(
              "`Y/u/U/r` (year) patterns are not supported, use `y` instead"
            );
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
            throw new RangeError(
              "`D/F/g` (day) patterns are not supported, use `d` instead"
            );
          case "E":
            t.weekday = 4 === a ? "short" : 5 === a ? "narrow" : "short";
            break;
          case "e":
            if (a < 4)
              throw new RangeError(
                "`e..eee` (weekday) patterns are not supported"
              );
            t.weekday = ["short", "long", "narrow", "short"][a - 4];
            break;
          case "c":
            if (a < 4)
              throw new RangeError(
                "`c..ccc` (weekday) patterns are not supported"
              );
            t.weekday = ["short", "long", "narrow", "short"][a - 4];
            break;
          case "a":
            t.hour12 = !0;
            break;
          case "b":
          case "B":
            throw new RangeError(
              "`b/B` (period) patterns are not supported, use `a` instead"
            );
          case "h":
            (t.hourCycle = "h12"), (t.hour = ["numeric", "2-digit"][a - 1]);
            break;
          case "H":
            (t.hourCycle = "h23"), (t.hour = ["numeric", "2-digit"][a - 1]);
            break;
          case "K":
            (t.hourCycle = "h11"), (t.hour = ["numeric", "2-digit"][a - 1]);
            break;
          case "k":
            (t.hourCycle = "h24"), (t.hour = ["numeric", "2-digit"][a - 1]);
            break;
          case "j":
          case "J":
          case "C":
            throw new RangeError(
              "`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead"
            );
          case "m":
            t.minute = ["numeric", "2-digit"][a - 1];
            break;
          case "s":
            t.second = ["numeric", "2-digit"][a - 1];
            break;
          case "S":
          case "A":
            throw new RangeError(
              "`S/A` (second) patterns are not supported, use `s` instead"
            );
          case "z":
            t.timeZoneName = a < 4 ? "short" : "long";
            break;
          case "Z":
          case "O":
          case "v":
          case "V":
          case "X":
          case "x":
            throw new RangeError(
              "`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead"
            );
        }
        return "";
      }),
      t
    );
  }
  var Ta = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
  var Oa = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g,
    xa = /^(@+)?(\+|#+)?[rs]?$/g,
    za = /(\*)(0+)|(#+)(0+)|(0+)/g,
    Da = /^(0+)$/;
  function Ha(e) {
    var t = {};
    return (
      "r" === e[e.length - 1]
        ? (t.roundingPriority = "morePrecision")
        : "s" === e[e.length - 1] && (t.roundingPriority = "lessPrecision"),
      e.replace(xa, function (e, a, i) {
        return (
          "string" != typeof i
            ? ((t.minimumSignificantDigits = a.length),
              (t.maximumSignificantDigits = a.length))
            : "+" === i
            ? (t.minimumSignificantDigits = a.length)
            : "#" === a[0]
            ? (t.maximumSignificantDigits = a.length)
            : ((t.minimumSignificantDigits = a.length),
              (t.maximumSignificantDigits =
                a.length + ("string" == typeof i ? i.length : 0))),
          ""
        );
      }),
      t
    );
  }
  function Pa(e) {
    switch (e) {
      case "sign-auto":
        return { signDisplay: "auto" };
      case "sign-accounting":
      case "()":
        return { currencySign: "accounting" };
      case "sign-always":
      case "+!":
        return { signDisplay: "always" };
      case "sign-accounting-always":
      case "()!":
        return { signDisplay: "always", currencySign: "accounting" };
      case "sign-except-zero":
      case "+?":
        return { signDisplay: "exceptZero" };
      case "sign-accounting-except-zero":
      case "()?":
        return { signDisplay: "exceptZero", currencySign: "accounting" };
      case "sign-never":
      case "+_":
        return { signDisplay: "never" };
    }
  }
  function Na(e) {
    var t;
    if (
      ("E" === e[0] && "E" === e[1]
        ? ((t = { notation: "engineering" }), (e = e.slice(2)))
        : "E" === e[0] && ((t = { notation: "scientific" }), (e = e.slice(1))),
      t)
    ) {
      var a = e.slice(0, 2);
      if (
        ("+!" === a
          ? ((t.signDisplay = "always"), (e = e.slice(2)))
          : "+?" === a && ((t.signDisplay = "exceptZero"), (e = e.slice(2))),
        !Da.test(e))
      )
        throw new Error("Malformed concise eng/scientific notation");
      t.minimumIntegerDigits = e.length;
    }
    return t;
  }
  function Ca(e) {
    var t = Pa(e);
    return t || {};
  }
  function ja(e) {
    for (var t = {}, a = 0, n = e; a < n.length; a++) {
      var s = n[a];
      switch (s.stem) {
        case "percent":
        case "%":
          t.style = "percent";
          continue;
        case "%x100":
          (t.style = "percent"), (t.scale = 100);
          continue;
        case "currency":
          (t.style = "currency"), (t.currency = s.options[0]);
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
          (t.style = "unit"), (t.unit = s.options[0].replace(/^(.*?)-/, ""));
          continue;
        case "compact-short":
        case "K":
          (t.notation = "compact"), (t.compactDisplay = "short");
          continue;
        case "compact-long":
        case "KK":
          (t.notation = "compact"), (t.compactDisplay = "long");
          continue;
        case "scientific":
          t = i(
            i(i({}, t), { notation: "scientific" }),
            s.options.reduce(function (e, t) {
              return i(i({}, e), Ca(t));
            }, {})
          );
          continue;
        case "engineering":
          t = i(
            i(i({}, t), { notation: "engineering" }),
            s.options.reduce(function (e, t) {
              return i(i({}, e), Ca(t));
            }, {})
          );
          continue;
        case "notation-simple":
          t.notation = "standard";
          continue;
        case "unit-width-narrow":
          (t.currencyDisplay = "narrowSymbol"), (t.unitDisplay = "narrow");
          continue;
        case "unit-width-short":
          (t.currencyDisplay = "code"), (t.unitDisplay = "short");
          continue;
        case "unit-width-full-name":
          (t.currencyDisplay = "name"), (t.unitDisplay = "long");
          continue;
        case "unit-width-iso-code":
          t.currencyDisplay = "symbol";
          continue;
        case "scale":
          t.scale = parseFloat(s.options[0]);
          continue;
        case "integer-width":
          if (s.options.length > 1)
            throw new RangeError(
              "integer-width stems only accept a single optional option"
            );
          s.options[0].replace(za, function (e, a, i, n, s, r) {
            if (a) t.minimumIntegerDigits = i.length;
            else {
              if (n && s)
                throw new Error(
                  "We currently do not support maximum integer digits"
                );
              if (r)
                throw new Error(
                  "We currently do not support exact integer digits"
                );
            }
            return "";
          });
          continue;
      }
      if (Da.test(s.stem)) t.minimumIntegerDigits = s.stem.length;
      else if (Oa.test(s.stem)) {
        if (s.options.length > 1)
          throw new RangeError(
            "Fraction-precision stems only accept a single optional option"
          );
        s.stem.replace(Oa, function (e, a, i, n, s, r) {
          return (
            "*" === i
              ? (t.minimumFractionDigits = a.length)
              : n && "#" === n[0]
              ? (t.maximumFractionDigits = n.length)
              : s && r
              ? ((t.minimumFractionDigits = s.length),
                (t.maximumFractionDigits = s.length + r.length))
              : ((t.minimumFractionDigits = a.length),
                (t.maximumFractionDigits = a.length)),
            ""
          );
        });
        var r = s.options[0];
        "w" === r
          ? (t = i(i({}, t), { trailingZeroDisplay: "stripIfInteger" }))
          : r && (t = i(i({}, t), Ha(r)));
      } else if (xa.test(s.stem)) t = i(i({}, t), Ha(s.stem));
      else {
        var o = Pa(s.stem);
        o && (t = i(i({}, t), o));
        var l = Na(s.stem);
        l && (t = i(i({}, t), l));
      }
    }
    return t;
  }
  var La,
    Ba = {
      AX: ["H"],
      BQ: ["H"],
      CP: ["H"],
      CZ: ["H"],
      DK: ["H"],
      FI: ["H"],
      ID: ["H"],
      IS: ["H"],
      ML: ["H"],
      NE: ["H"],
      RU: ["H"],
      SE: ["H"],
      SJ: ["H"],
      SK: ["H"],
      AS: ["h", "H"],
      BT: ["h", "H"],
      DJ: ["h", "H"],
      ER: ["h", "H"],
      GH: ["h", "H"],
      IN: ["h", "H"],
      LS: ["h", "H"],
      PG: ["h", "H"],
      PW: ["h", "H"],
      SO: ["h", "H"],
      TO: ["h", "H"],
      VU: ["h", "H"],
      WS: ["h", "H"],
      "001": ["H", "h"],
      AL: ["h", "H", "hB"],
      TD: ["h", "H", "hB"],
      "ca-ES": ["H", "h", "hB"],
      CF: ["H", "h", "hB"],
      CM: ["H", "h", "hB"],
      "fr-CA": ["H", "h", "hB"],
      "gl-ES": ["H", "h", "hB"],
      "it-CH": ["H", "h", "hB"],
      "it-IT": ["H", "h", "hB"],
      LU: ["H", "h", "hB"],
      NP: ["H", "h", "hB"],
      PF: ["H", "h", "hB"],
      SC: ["H", "h", "hB"],
      SM: ["H", "h", "hB"],
      SN: ["H", "h", "hB"],
      TF: ["H", "h", "hB"],
      VA: ["H", "h", "hB"],
      CY: ["h", "H", "hb", "hB"],
      GR: ["h", "H", "hb", "hB"],
      CO: ["h", "H", "hB", "hb"],
      DO: ["h", "H", "hB", "hb"],
      KP: ["h", "H", "hB", "hb"],
      KR: ["h", "H", "hB", "hb"],
      NA: ["h", "H", "hB", "hb"],
      PA: ["h", "H", "hB", "hb"],
      PR: ["h", "H", "hB", "hb"],
      VE: ["h", "H", "hB", "hb"],
      AC: ["H", "h", "hb", "hB"],
      AI: ["H", "h", "hb", "hB"],
      BW: ["H", "h", "hb", "hB"],
      BZ: ["H", "h", "hb", "hB"],
      CC: ["H", "h", "hb", "hB"],
      CK: ["H", "h", "hb", "hB"],
      CX: ["H", "h", "hb", "hB"],
      DG: ["H", "h", "hb", "hB"],
      FK: ["H", "h", "hb", "hB"],
      GB: ["H", "h", "hb", "hB"],
      GG: ["H", "h", "hb", "hB"],
      GI: ["H", "h", "hb", "hB"],
      IE: ["H", "h", "hb", "hB"],
      IM: ["H", "h", "hb", "hB"],
      IO: ["H", "h", "hb", "hB"],
      JE: ["H", "h", "hb", "hB"],
      LT: ["H", "h", "hb", "hB"],
      MK: ["H", "h", "hb", "hB"],
      MN: ["H", "h", "hb", "hB"],
      MS: ["H", "h", "hb", "hB"],
      NF: ["H", "h", "hb", "hB"],
      NG: ["H", "h", "hb", "hB"],
      NR: ["H", "h", "hb", "hB"],
      NU: ["H", "h", "hb", "hB"],
      PN: ["H", "h", "hb", "hB"],
      SH: ["H", "h", "hb", "hB"],
      SX: ["H", "h", "hb", "hB"],
      TA: ["H", "h", "hb", "hB"],
      ZA: ["H", "h", "hb", "hB"],
      "af-ZA": ["H", "h", "hB", "hb"],
      AR: ["H", "h", "hB", "hb"],
      CL: ["H", "h", "hB", "hb"],
      CR: ["H", "h", "hB", "hb"],
      CU: ["H", "h", "hB", "hb"],
      EA: ["H", "h", "hB", "hb"],
      "es-BO": ["H", "h", "hB", "hb"],
      "es-BR": ["H", "h", "hB", "hb"],
      "es-EC": ["H", "h", "hB", "hb"],
      "es-ES": ["H", "h", "hB", "hb"],
      "es-GQ": ["H", "h", "hB", "hb"],
      "es-PE": ["H", "h", "hB", "hb"],
      GT: ["H", "h", "hB", "hb"],
      HN: ["H", "h", "hB", "hb"],
      IC: ["H", "h", "hB", "hb"],
      KG: ["H", "h", "hB", "hb"],
      KM: ["H", "h", "hB", "hb"],
      LK: ["H", "h", "hB", "hb"],
      MA: ["H", "h", "hB", "hb"],
      MX: ["H", "h", "hB", "hb"],
      NI: ["H", "h", "hB", "hb"],
      PY: ["H", "h", "hB", "hb"],
      SV: ["H", "h", "hB", "hb"],
      UY: ["H", "h", "hB", "hb"],
      JP: ["H", "h", "K"],
      AD: ["H", "hB"],
      AM: ["H", "hB"],
      AO: ["H", "hB"],
      AT: ["H", "hB"],
      AW: ["H", "hB"],
      BE: ["H", "hB"],
      BF: ["H", "hB"],
      BJ: ["H", "hB"],
      BL: ["H", "hB"],
      BR: ["H", "hB"],
      CG: ["H", "hB"],
      CI: ["H", "hB"],
      CV: ["H", "hB"],
      DE: ["H", "hB"],
      EE: ["H", "hB"],
      FR: ["H", "hB"],
      GA: ["H", "hB"],
      GF: ["H", "hB"],
      GN: ["H", "hB"],
      GP: ["H", "hB"],
      GW: ["H", "hB"],
      HR: ["H", "hB"],
      IL: ["H", "hB"],
      IT: ["H", "hB"],
      KZ: ["H", "hB"],
      MC: ["H", "hB"],
      MD: ["H", "hB"],
      MF: ["H", "hB"],
      MQ: ["H", "hB"],
      MZ: ["H", "hB"],
      NC: ["H", "hB"],
      NL: ["H", "hB"],
      PM: ["H", "hB"],
      PT: ["H", "hB"],
      RE: ["H", "hB"],
      RO: ["H", "hB"],
      SI: ["H", "hB"],
      SR: ["H", "hB"],
      ST: ["H", "hB"],
      TG: ["H", "hB"],
      TR: ["H", "hB"],
      WF: ["H", "hB"],
      YT: ["H", "hB"],
      BD: ["h", "hB", "H"],
      PK: ["h", "hB", "H"],
      AZ: ["H", "hB", "h"],
      BA: ["H", "hB", "h"],
      BG: ["H", "hB", "h"],
      CH: ["H", "hB", "h"],
      GE: ["H", "hB", "h"],
      LI: ["H", "hB", "h"],
      ME: ["H", "hB", "h"],
      RS: ["H", "hB", "h"],
      UA: ["H", "hB", "h"],
      UZ: ["H", "hB", "h"],
      XK: ["H", "hB", "h"],
      AG: ["h", "hb", "H", "hB"],
      AU: ["h", "hb", "H", "hB"],
      BB: ["h", "hb", "H", "hB"],
      BM: ["h", "hb", "H", "hB"],
      BS: ["h", "hb", "H", "hB"],
      CA: ["h", "hb", "H", "hB"],
      DM: ["h", "hb", "H", "hB"],
      "en-001": ["h", "hb", "H", "hB"],
      FJ: ["h", "hb", "H", "hB"],
      FM: ["h", "hb", "H", "hB"],
      GD: ["h", "hb", "H", "hB"],
      GM: ["h", "hb", "H", "hB"],
      GU: ["h", "hb", "H", "hB"],
      GY: ["h", "hb", "H", "hB"],
      JM: ["h", "hb", "H", "hB"],
      KI: ["h", "hb", "H", "hB"],
      KN: ["h", "hb", "H", "hB"],
      KY: ["h", "hb", "H", "hB"],
      LC: ["h", "hb", "H", "hB"],
      LR: ["h", "hb", "H", "hB"],
      MH: ["h", "hb", "H", "hB"],
      MP: ["h", "hb", "H", "hB"],
      MW: ["h", "hb", "H", "hB"],
      NZ: ["h", "hb", "H", "hB"],
      SB: ["h", "hb", "H", "hB"],
      SG: ["h", "hb", "H", "hB"],
      SL: ["h", "hb", "H", "hB"],
      SS: ["h", "hb", "H", "hB"],
      SZ: ["h", "hb", "H", "hB"],
      TC: ["h", "hb", "H", "hB"],
      TT: ["h", "hb", "H", "hB"],
      UM: ["h", "hb", "H", "hB"],
      US: ["h", "hb", "H", "hB"],
      VC: ["h", "hb", "H", "hB"],
      VG: ["h", "hb", "H", "hB"],
      VI: ["h", "hb", "H", "hB"],
      ZM: ["h", "hb", "H", "hB"],
      BO: ["H", "hB", "h", "hb"],
      EC: ["H", "hB", "h", "hb"],
      ES: ["H", "hB", "h", "hb"],
      GQ: ["H", "hB", "h", "hb"],
      PE: ["H", "hB", "h", "hb"],
      AE: ["h", "hB", "hb", "H"],
      "ar-001": ["h", "hB", "hb", "H"],
      BH: ["h", "hB", "hb", "H"],
      DZ: ["h", "hB", "hb", "H"],
      EG: ["h", "hB", "hb", "H"],
      EH: ["h", "hB", "hb", "H"],
      HK: ["h", "hB", "hb", "H"],
      IQ: ["h", "hB", "hb", "H"],
      JO: ["h", "hB", "hb", "H"],
      KW: ["h", "hB", "hb", "H"],
      LB: ["h", "hB", "hb", "H"],
      LY: ["h", "hB", "hb", "H"],
      MO: ["h", "hB", "hb", "H"],
      MR: ["h", "hB", "hb", "H"],
      OM: ["h", "hB", "hb", "H"],
      PH: ["h", "hB", "hb", "H"],
      PS: ["h", "hB", "hb", "H"],
      QA: ["h", "hB", "hb", "H"],
      SA: ["h", "hB", "hb", "H"],
      SD: ["h", "hB", "hb", "H"],
      SY: ["h", "hB", "hb", "H"],
      TN: ["h", "hB", "hb", "H"],
      YE: ["h", "hB", "hb", "H"],
      AF: ["H", "hb", "hB", "h"],
      LA: ["H", "hb", "hB", "h"],
      CN: ["H", "hB", "hb", "h"],
      LV: ["H", "hB", "hb", "h"],
      TL: ["H", "hB", "hb", "h"],
      "zu-ZA": ["H", "hB", "hb", "h"],
      CD: ["hB", "H"],
      IR: ["hB", "H"],
      "hi-IN": ["hB", "h", "H"],
      "kn-IN": ["hB", "h", "H"],
      "ml-IN": ["hB", "h", "H"],
      "te-IN": ["hB", "h", "H"],
      KH: ["hB", "h", "H", "hb"],
      "ta-IN": ["hB", "h", "hb", "H"],
      BN: ["hb", "hB", "h", "H"],
      MY: ["hb", "hB", "h", "H"],
      ET: ["hB", "hb", "h", "H"],
      "gu-IN": ["hB", "hb", "h", "H"],
      "mr-IN": ["hB", "hb", "h", "H"],
      "pa-IN": ["hB", "hb", "h", "H"],
      TW: ["hB", "hb", "h", "H"],
      KE: ["hB", "hb", "H", "h"],
      MM: ["hB", "hb", "H", "h"],
      TZ: ["hB", "hb", "H", "h"],
      UG: ["hB", "hb", "H", "h"],
    };
  function Ia(e) {
    var t = e.hourCycle;
    if (
      (void 0 === t &&
        e.hourCycles &&
        e.hourCycles.length &&
        (t = e.hourCycles[0]),
      t)
    )
      switch (t) {
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
    return (
      "root" !== i && (a = e.maximize().region),
      (Ba[a || ""] || Ba[i || ""] || Ba["".concat(i, "-001")] || Ba["001"])[0]
    );
  }
  var Ra = new RegExp("^".concat(Aa.source, "*")),
    Ua = new RegExp("".concat(Aa.source, "*$"));
  function Ya(e, t) {
    return { start: e, end: t };
  }
  var Va = !!String.prototype.startsWith,
    Ga = !!String.fromCodePoint,
    Fa = !!Object.fromEntries,
    Wa = !!String.prototype.codePointAt,
    Za = !!String.prototype.trimStart,
    qa = !!String.prototype.trimEnd,
    Ka = !!Number.isSafeInteger
      ? Number.isSafeInteger
      : function (e) {
          return (
            "number" == typeof e &&
            isFinite(e) &&
            Math.floor(e) === e &&
            Math.abs(e) <= 9007199254740991
          );
        },
    Xa = !0;
  try {
    Xa =
      "a" ===
      (null ===
        (La = si("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu").exec(
          "a"
        )) || void 0 === La
        ? void 0
        : La[0]);
  } catch (j) {
    Xa = !1;
  }
  var Ja,
    Qa = Va
      ? function (e, t, a) {
          return e.startsWith(t, a);
        }
      : function (e, t, a) {
          return e.slice(a, a + t.length) === t;
        },
    ei = Ga
      ? String.fromCodePoint
      : function () {
          for (var e = [], t = 0; t < arguments.length; t++)
            e[t] = arguments[t];
          for (var a, i = "", n = e.length, s = 0; n > s; ) {
            if ((a = e[s++]) > 1114111)
              throw RangeError(a + " is not a valid code point");
            i +=
              a < 65536
                ? String.fromCharCode(a)
                : String.fromCharCode(
                    55296 + ((a -= 65536) >> 10),
                    (a % 1024) + 56320
                  );
          }
          return i;
        },
    ti = Fa
      ? Object.fromEntries
      : function (e) {
          for (var t = {}, a = 0, i = e; a < i.length; a++) {
            var n = i[a],
              s = n[0],
              r = n[1];
            t[s] = r;
          }
          return t;
        },
    ai = Wa
      ? function (e, t) {
          return e.codePointAt(t);
        }
      : function (e, t) {
          var a = e.length;
          if (!(t < 0 || t >= a)) {
            var i,
              n = e.charCodeAt(t);
            return n < 55296 ||
              n > 56319 ||
              t + 1 === a ||
              (i = e.charCodeAt(t + 1)) < 56320 ||
              i > 57343
              ? n
              : i - 56320 + ((n - 55296) << 10) + 65536;
          }
        },
    ii = Za
      ? function (e) {
          return e.trimStart();
        }
      : function (e) {
          return e.replace(Ra, "");
        },
    ni = qa
      ? function (e) {
          return e.trimEnd();
        }
      : function (e) {
          return e.replace(Ua, "");
        };
  function si(e, t) {
    return new RegExp(e, t);
  }
  if (Xa) {
    var ri = si("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
    Ja = function (e, t) {
      var a;
      return (
        (ri.lastIndex = t),
        null !== (a = ri.exec(e)[1]) && void 0 !== a ? a : ""
      );
    };
  } else
    Ja = function (e, t) {
      for (var a = []; ; ) {
        var i = ai(e, t);
        if (void 0 === i || di(i) || ci(i)) break;
        a.push(i), (t += i >= 65536 ? 2 : 1);
      }
      return ei.apply(void 0, a);
    };
  var oi = (function () {
    function e(e, t) {
      void 0 === t && (t = {}),
        (this.message = e),
        (this.position = { offset: 0, line: 1, column: 1 }),
        (this.ignoreTag = !!t.ignoreTag),
        (this.locale = t.locale),
        (this.requiresOtherClause = !!t.requiresOtherClause),
        (this.shouldParseSkeletons = !!t.shouldParseSkeletons);
    }
    return (
      (e.prototype.parse = function () {
        if (0 !== this.offset()) throw Error("parser can only be used once");
        return this.parseMessage(0, "", !1);
      }),
      (e.prototype.parseMessage = function (e, t, a) {
        for (var i = []; !this.isEOF(); ) {
          var n = this.char();
          if (123 === n) {
            if ((s = this.parseArgument(e, a)).err) return s;
            i.push(s.val);
          } else {
            if (125 === n && e > 0) break;
            if (35 !== n || ("plural" !== t && "selectordinal" !== t)) {
              if (60 === n && !this.ignoreTag && 47 === this.peek()) {
                if (a) break;
                return this.error(
                  at.UNMATCHED_CLOSING_TAG,
                  Ya(this.clonePosition(), this.clonePosition())
                );
              }
              if (60 === n && !this.ignoreTag && li(this.peek() || 0)) {
                if ((s = this.parseTag(e, t)).err) return s;
                i.push(s.val);
              } else {
                var s;
                if ((s = this.parseLiteral(e, t)).err) return s;
                i.push(s.val);
              }
            } else {
              var r = this.clonePosition();
              this.bump(),
                i.push({
                  type: it.pound,
                  location: Ya(r, this.clonePosition()),
                });
            }
          }
        }
        return { val: i, err: null };
      }),
      (e.prototype.parseTag = function (e, t) {
        var a = this.clonePosition();
        this.bump();
        var i = this.parseTagName();
        if ((this.bumpSpace(), this.bumpIf("/>")))
          return {
            val: {
              type: it.literal,
              value: "<".concat(i, "/>"),
              location: Ya(a, this.clonePosition()),
            },
            err: null,
          };
        if (this.bumpIf(">")) {
          var n = this.parseMessage(e + 1, t, !0);
          if (n.err) return n;
          var s = n.val,
            r = this.clonePosition();
          if (this.bumpIf("</")) {
            if (this.isEOF() || !li(this.char()))
              return this.error(at.INVALID_TAG, Ya(r, this.clonePosition()));
            var o = this.clonePosition();
            return i !== this.parseTagName()
              ? this.error(
                  at.UNMATCHED_CLOSING_TAG,
                  Ya(o, this.clonePosition())
                )
              : (this.bumpSpace(),
                this.bumpIf(">")
                  ? {
                      val: {
                        type: it.tag,
                        value: i,
                        children: s,
                        location: Ya(a, this.clonePosition()),
                      },
                      err: null,
                    }
                  : this.error(at.INVALID_TAG, Ya(r, this.clonePosition())));
          }
          return this.error(at.UNCLOSED_TAG, Ya(a, this.clonePosition()));
        }
        return this.error(at.INVALID_TAG, Ya(a, this.clonePosition()));
      }),
      (e.prototype.parseTagName = function () {
        var e = this.offset();
        for (this.bump(); !this.isEOF() && ui(this.char()); ) this.bump();
        return this.message.slice(e, this.offset());
      }),
      (e.prototype.parseLiteral = function (e, t) {
        for (var a = this.clonePosition(), i = ""; ; ) {
          var n = this.tryParseQuote(t);
          if (n) i += n;
          else {
            var s = this.tryParseUnquoted(e, t);
            if (s) i += s;
            else {
              var r = this.tryParseLeftAngleBracket();
              if (!r) break;
              i += r;
            }
          }
        }
        var o = Ya(a, this.clonePosition());
        return { val: { type: it.literal, value: i, location: o }, err: null };
      }),
      (e.prototype.tryParseLeftAngleBracket = function () {
        return this.isEOF() ||
          60 !== this.char() ||
          (!this.ignoreTag && (li((e = this.peek() || 0)) || 47 === e))
          ? null
          : (this.bump(), "<");
        var e;
      }),
      (e.prototype.tryParseQuote = function (e) {
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
        for (this.bump(); !this.isEOF(); ) {
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
        return ei.apply(void 0, t);
      }),
      (e.prototype.tryParseUnquoted = function (e, t) {
        if (this.isEOF()) return null;
        var a = this.char();
        return 60 === a ||
          123 === a ||
          (35 === a && ("plural" === t || "selectordinal" === t)) ||
          (125 === a && e > 0)
          ? null
          : (this.bump(), ei(a));
      }),
      (e.prototype.parseArgument = function (e, t) {
        var a = this.clonePosition();
        if ((this.bump(), this.bumpSpace(), this.isEOF()))
          return this.error(
            at.EXPECT_ARGUMENT_CLOSING_BRACE,
            Ya(a, this.clonePosition())
          );
        if (125 === this.char())
          return (
            this.bump(),
            this.error(at.EMPTY_ARGUMENT, Ya(a, this.clonePosition()))
          );
        var i = this.parseIdentifierIfPossible().value;
        if (!i)
          return this.error(at.MALFORMED_ARGUMENT, Ya(a, this.clonePosition()));
        if ((this.bumpSpace(), this.isEOF()))
          return this.error(
            at.EXPECT_ARGUMENT_CLOSING_BRACE,
            Ya(a, this.clonePosition())
          );
        switch (this.char()) {
          case 125:
            return (
              this.bump(),
              {
                val: {
                  type: it.argument,
                  value: i,
                  location: Ya(a, this.clonePosition()),
                },
                err: null,
              }
            );
          case 44:
            return (
              this.bump(),
              this.bumpSpace(),
              this.isEOF()
                ? this.error(
                    at.EXPECT_ARGUMENT_CLOSING_BRACE,
                    Ya(a, this.clonePosition())
                  )
                : this.parseArgumentOptions(e, t, i, a)
            );
          default:
            return this.error(
              at.MALFORMED_ARGUMENT,
              Ya(a, this.clonePosition())
            );
        }
      }),
      (e.prototype.parseIdentifierIfPossible = function () {
        var e = this.clonePosition(),
          t = this.offset(),
          a = Ja(this.message, t),
          i = t + a.length;
        return (
          this.bumpTo(i), { value: a, location: Ya(e, this.clonePosition()) }
        );
      }),
      (e.prototype.parseArgumentOptions = function (e, t, a, n) {
        var s,
          r = this.clonePosition(),
          o = this.parseIdentifierIfPossible().value,
          l = this.clonePosition();
        switch (o) {
          case "":
            return this.error(at.EXPECT_ARGUMENT_TYPE, Ya(r, l));
          case "number":
          case "date":
          case "time":
            this.bumpSpace();
            var u = null;
            if (this.bumpIf(",")) {
              this.bumpSpace();
              var d = this.clonePosition();
              if ((b = this.parseSimpleArgStyleIfPossible()).err) return b;
              if (0 === (m = ni(b.val)).length)
                return this.error(
                  at.EXPECT_ARGUMENT_STYLE,
                  Ya(this.clonePosition(), this.clonePosition())
                );
              u = { style: m, styleLocation: Ya(d, this.clonePosition()) };
            }
            if ((y = this.tryParseArgumentClose(n)).err) return y;
            var c = Ya(n, this.clonePosition());
            if (u && Qa(null == u ? void 0 : u.style, "::", 0)) {
              var h = ii(u.style.slice(2));
              if ("number" === o)
                return (b = this.parseNumberSkeletonFromString(
                  h,
                  u.styleLocation
                )).err
                  ? b
                  : {
                      val: {
                        type: it.number,
                        value: a,
                        location: c,
                        style: b.val,
                      },
                      err: null,
                    };
              if (0 === h.length)
                return this.error(at.EXPECT_DATE_TIME_SKELETON, c);
              var p = h;
              this.locale &&
                (p = (function (e, t) {
                  for (var a = "", i = 0; i < e.length; i++) {
                    var n = e.charAt(i);
                    if ("j" === n) {
                      for (
                        var s = 0;
                        i + 1 < e.length && e.charAt(i + 1) === n;

                      )
                        s++, i++;
                      var r = 1 + (1 & s),
                        o = s < 2 ? 1 : 3 + (s >> 1),
                        l = Ia(t);
                      for (("H" != l && "k" != l) || (o = 0); o-- > 0; )
                        a += "a";
                      for (; r-- > 0; ) a = l + a;
                    } else a += "J" === n ? "H" : n;
                  }
                  return a;
                })(h, this.locale));
              var m = {
                type: nt.dateTime,
                pattern: p,
                location: u.styleLocation,
                parsedOptions: this.shouldParseSkeletons ? Ma(p) : {},
              };
              return {
                val: {
                  type: "date" === o ? it.date : it.time,
                  value: a,
                  location: c,
                  style: m,
                },
                err: null,
              };
            }
            return {
              val: {
                type:
                  "number" === o ? it.number : "date" === o ? it.date : it.time,
                value: a,
                location: c,
                style:
                  null !== (s = null == u ? void 0 : u.style) && void 0 !== s
                    ? s
                    : null,
              },
              err: null,
            };
          case "plural":
          case "selectordinal":
          case "select":
            var g = this.clonePosition();
            if ((this.bumpSpace(), !this.bumpIf(",")))
              return this.error(
                at.EXPECT_SELECT_ARGUMENT_OPTIONS,
                Ya(g, i({}, g))
              );
            this.bumpSpace();
            var f = this.parseIdentifierIfPossible(),
              v = 0;
            if ("select" !== o && "offset" === f.value) {
              if (!this.bumpIf(":"))
                return this.error(
                  at.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,
                  Ya(this.clonePosition(), this.clonePosition())
                );
              var b;
              if (
                (this.bumpSpace(),
                (b = this.tryParseDecimalInteger(
                  at.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE,
                  at.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE
                )).err)
              )
                return b;
              this.bumpSpace(),
                (f = this.parseIdentifierIfPossible()),
                (v = b.val);
            }
            var y,
              _ = this.tryParsePluralOrSelectOptions(e, o, t, f);
            if (_.err) return _;
            if ((y = this.tryParseArgumentClose(n)).err) return y;
            var w = Ya(n, this.clonePosition());
            return "select" === o
              ? {
                  val: {
                    type: it.select,
                    value: a,
                    options: ti(_.val),
                    location: w,
                  },
                  err: null,
                }
              : {
                  val: {
                    type: it.plural,
                    value: a,
                    options: ti(_.val),
                    offset: v,
                    pluralType: "plural" === o ? "cardinal" : "ordinal",
                    location: w,
                  },
                  err: null,
                };
          default:
            return this.error(at.INVALID_ARGUMENT_TYPE, Ya(r, l));
        }
      }),
      (e.prototype.tryParseArgumentClose = function (e) {
        return this.isEOF() || 125 !== this.char()
          ? this.error(
              at.EXPECT_ARGUMENT_CLOSING_BRACE,
              Ya(e, this.clonePosition())
            )
          : (this.bump(), { val: !0, err: null });
      }),
      (e.prototype.parseSimpleArgStyleIfPossible = function () {
        for (var e = 0, t = this.clonePosition(); !this.isEOF(); ) {
          switch (this.char()) {
            case 39:
              this.bump();
              var a = this.clonePosition();
              if (!this.bumpUntil("'"))
                return this.error(
                  at.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE,
                  Ya(a, this.clonePosition())
                );
              this.bump();
              break;
            case 123:
              (e += 1), this.bump();
              break;
            case 125:
              if (!(e > 0))
                return {
                  val: this.message.slice(t.offset, this.offset()),
                  err: null,
                };
              e -= 1;
              break;
            default:
              this.bump();
          }
        }
        return { val: this.message.slice(t.offset, this.offset()), err: null };
      }),
      (e.prototype.parseNumberSkeletonFromString = function (e, t) {
        var a = [];
        try {
          a = (function (e) {
            if (0 === e.length)
              throw new Error("Number skeleton cannot be empty");
            for (
              var t = e.split(Ta).filter(function (e) {
                  return e.length > 0;
                }),
                a = [],
                i = 0,
                n = t;
              i < n.length;
              i++
            ) {
              var s = n[i].split("/");
              if (0 === s.length) throw new Error("Invalid number skeleton");
              for (
                var r = s[0], o = s.slice(1), l = 0, u = o;
                l < u.length;
                l++
              )
                if (0 === u[l].length)
                  throw new Error("Invalid number skeleton");
              a.push({ stem: r, options: o });
            }
            return a;
          })(e);
        } catch (e) {
          return this.error(at.INVALID_NUMBER_SKELETON, t);
        }
        return {
          val: {
            type: nt.number,
            tokens: a,
            location: t,
            parsedOptions: this.shouldParseSkeletons ? ja(a) : {},
          },
          err: null,
        };
      }),
      (e.prototype.tryParsePluralOrSelectOptions = function (e, t, a, i) {
        for (
          var n, s = !1, r = [], o = new Set(), l = i.value, u = i.location;
          ;

        ) {
          if (0 === l.length) {
            var d = this.clonePosition();
            if ("select" === t || !this.bumpIf("=")) break;
            var c = this.tryParseDecimalInteger(
              at.EXPECT_PLURAL_ARGUMENT_SELECTOR,
              at.INVALID_PLURAL_ARGUMENT_SELECTOR
            );
            if (c.err) return c;
            (u = Ya(d, this.clonePosition())),
              (l = this.message.slice(d.offset, this.offset()));
          }
          if (o.has(l))
            return this.error(
              "select" === t
                ? at.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                : at.DUPLICATE_PLURAL_ARGUMENT_SELECTOR,
              u
            );
          "other" === l && (s = !0), this.bumpSpace();
          var h = this.clonePosition();
          if (!this.bumpIf("{"))
            return this.error(
              "select" === t
                ? at.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                : at.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT,
              Ya(this.clonePosition(), this.clonePosition())
            );
          var p = this.parseMessage(e + 1, t, a);
          if (p.err) return p;
          var m = this.tryParseArgumentClose(h);
          if (m.err) return m;
          r.push([l, { value: p.val, location: Ya(h, this.clonePosition()) }]),
            o.add(l),
            this.bumpSpace(),
            (l = (n = this.parseIdentifierIfPossible()).value),
            (u = n.location);
        }
        return 0 === r.length
          ? this.error(
              "select" === t
                ? at.EXPECT_SELECT_ARGUMENT_SELECTOR
                : at.EXPECT_PLURAL_ARGUMENT_SELECTOR,
              Ya(this.clonePosition(), this.clonePosition())
            )
          : this.requiresOtherClause && !s
          ? this.error(
              at.MISSING_OTHER_CLAUSE,
              Ya(this.clonePosition(), this.clonePosition())
            )
          : { val: r, err: null };
      }),
      (e.prototype.tryParseDecimalInteger = function (e, t) {
        var a = 1,
          i = this.clonePosition();
        this.bumpIf("+") || (this.bumpIf("-") && (a = -1));
        for (var n = !1, s = 0; !this.isEOF(); ) {
          var r = this.char();
          if (!(r >= 48 && r <= 57)) break;
          (n = !0), (s = 10 * s + (r - 48)), this.bump();
        }
        var o = Ya(i, this.clonePosition());
        return n
          ? Ka((s *= a))
            ? { val: s, err: null }
            : this.error(t, o)
          : this.error(e, o);
      }),
      (e.prototype.offset = function () {
        return this.position.offset;
      }),
      (e.prototype.isEOF = function () {
        return this.offset() === this.message.length;
      }),
      (e.prototype.clonePosition = function () {
        return {
          offset: this.position.offset,
          line: this.position.line,
          column: this.position.column,
        };
      }),
      (e.prototype.char = function () {
        var e = this.position.offset;
        if (e >= this.message.length) throw Error("out of bound");
        var t = ai(this.message, e);
        if (void 0 === t)
          throw Error(
            "Offset ".concat(e, " is at invalid UTF-16 code unit boundary")
          );
        return t;
      }),
      (e.prototype.error = function (e, t) {
        return {
          val: null,
          err: { kind: e, message: this.message, location: t },
        };
      }),
      (e.prototype.bump = function () {
        if (!this.isEOF()) {
          var e = this.char();
          10 === e
            ? ((this.position.line += 1),
              (this.position.column = 1),
              (this.position.offset += 1))
            : ((this.position.column += 1),
              (this.position.offset += e < 65536 ? 1 : 2));
        }
      }),
      (e.prototype.bumpIf = function (e) {
        if (Qa(this.message, e, this.offset())) {
          for (var t = 0; t < e.length; t++) this.bump();
          return !0;
        }
        return !1;
      }),
      (e.prototype.bumpUntil = function (e) {
        var t = this.offset(),
          a = this.message.indexOf(e, t);
        return a >= 0
          ? (this.bumpTo(a), !0)
          : (this.bumpTo(this.message.length), !1);
      }),
      (e.prototype.bumpTo = function (e) {
        if (this.offset() > e)
          throw Error(
            "targetOffset "
              .concat(
                e,
                " must be greater than or equal to the current offset "
              )
              .concat(this.offset())
          );
        for (e = Math.min(e, this.message.length); ; ) {
          var t = this.offset();
          if (t === e) break;
          if (t > e)
            throw Error(
              "targetOffset ".concat(
                e,
                " is at invalid UTF-16 code unit boundary"
              )
            );
          if ((this.bump(), this.isEOF())) break;
        }
      }),
      (e.prototype.bumpSpace = function () {
        for (; !this.isEOF() && di(this.char()); ) this.bump();
      }),
      (e.prototype.peek = function () {
        if (this.isEOF()) return null;
        var e = this.char(),
          t = this.offset(),
          a = this.message.charCodeAt(t + (e >= 65536 ? 2 : 1));
        return null != a ? a : null;
      }),
      e
    );
  })();
  function li(e) {
    return (e >= 97 && e <= 122) || (e >= 65 && e <= 90);
  }
  function ui(e) {
    return (
      45 === e ||
      46 === e ||
      (e >= 48 && e <= 57) ||
      95 === e ||
      (e >= 97 && e <= 122) ||
      (e >= 65 && e <= 90) ||
      183 == e ||
      (e >= 192 && e <= 214) ||
      (e >= 216 && e <= 246) ||
      (e >= 248 && e <= 893) ||
      (e >= 895 && e <= 8191) ||
      (e >= 8204 && e <= 8205) ||
      (e >= 8255 && e <= 8256) ||
      (e >= 8304 && e <= 8591) ||
      (e >= 11264 && e <= 12271) ||
      (e >= 12289 && e <= 55295) ||
      (e >= 63744 && e <= 64975) ||
      (e >= 65008 && e <= 65533) ||
      (e >= 65536 && e <= 983039)
    );
  }
  function di(e) {
    return (
      (e >= 9 && e <= 13) ||
      32 === e ||
      133 === e ||
      (e >= 8206 && e <= 8207) ||
      8232 === e ||
      8233 === e
    );
  }
  function ci(e) {
    return (
      (e >= 33 && e <= 35) ||
      36 === e ||
      (e >= 37 && e <= 39) ||
      40 === e ||
      41 === e ||
      42 === e ||
      43 === e ||
      44 === e ||
      45 === e ||
      (e >= 46 && e <= 47) ||
      (e >= 58 && e <= 59) ||
      (e >= 60 && e <= 62) ||
      (e >= 63 && e <= 64) ||
      91 === e ||
      92 === e ||
      93 === e ||
      94 === e ||
      96 === e ||
      123 === e ||
      124 === e ||
      125 === e ||
      126 === e ||
      161 === e ||
      (e >= 162 && e <= 165) ||
      166 === e ||
      167 === e ||
      169 === e ||
      171 === e ||
      172 === e ||
      174 === e ||
      176 === e ||
      177 === e ||
      182 === e ||
      187 === e ||
      191 === e ||
      215 === e ||
      247 === e ||
      (e >= 8208 && e <= 8213) ||
      (e >= 8214 && e <= 8215) ||
      8216 === e ||
      8217 === e ||
      8218 === e ||
      (e >= 8219 && e <= 8220) ||
      8221 === e ||
      8222 === e ||
      8223 === e ||
      (e >= 8224 && e <= 8231) ||
      (e >= 8240 && e <= 8248) ||
      8249 === e ||
      8250 === e ||
      (e >= 8251 && e <= 8254) ||
      (e >= 8257 && e <= 8259) ||
      8260 === e ||
      8261 === e ||
      8262 === e ||
      (e >= 8263 && e <= 8273) ||
      8274 === e ||
      8275 === e ||
      (e >= 8277 && e <= 8286) ||
      (e >= 8592 && e <= 8596) ||
      (e >= 8597 && e <= 8601) ||
      (e >= 8602 && e <= 8603) ||
      (e >= 8604 && e <= 8607) ||
      8608 === e ||
      (e >= 8609 && e <= 8610) ||
      8611 === e ||
      (e >= 8612 && e <= 8613) ||
      8614 === e ||
      (e >= 8615 && e <= 8621) ||
      8622 === e ||
      (e >= 8623 && e <= 8653) ||
      (e >= 8654 && e <= 8655) ||
      (e >= 8656 && e <= 8657) ||
      8658 === e ||
      8659 === e ||
      8660 === e ||
      (e >= 8661 && e <= 8691) ||
      (e >= 8692 && e <= 8959) ||
      (e >= 8960 && e <= 8967) ||
      8968 === e ||
      8969 === e ||
      8970 === e ||
      8971 === e ||
      (e >= 8972 && e <= 8991) ||
      (e >= 8992 && e <= 8993) ||
      (e >= 8994 && e <= 9e3) ||
      9001 === e ||
      9002 === e ||
      (e >= 9003 && e <= 9083) ||
      9084 === e ||
      (e >= 9085 && e <= 9114) ||
      (e >= 9115 && e <= 9139) ||
      (e >= 9140 && e <= 9179) ||
      (e >= 9180 && e <= 9185) ||
      (e >= 9186 && e <= 9254) ||
      (e >= 9255 && e <= 9279) ||
      (e >= 9280 && e <= 9290) ||
      (e >= 9291 && e <= 9311) ||
      (e >= 9472 && e <= 9654) ||
      9655 === e ||
      (e >= 9656 && e <= 9664) ||
      9665 === e ||
      (e >= 9666 && e <= 9719) ||
      (e >= 9720 && e <= 9727) ||
      (e >= 9728 && e <= 9838) ||
      9839 === e ||
      (e >= 9840 && e <= 10087) ||
      10088 === e ||
      10089 === e ||
      10090 === e ||
      10091 === e ||
      10092 === e ||
      10093 === e ||
      10094 === e ||
      10095 === e ||
      10096 === e ||
      10097 === e ||
      10098 === e ||
      10099 === e ||
      10100 === e ||
      10101 === e ||
      (e >= 10132 && e <= 10175) ||
      (e >= 10176 && e <= 10180) ||
      10181 === e ||
      10182 === e ||
      (e >= 10183 && e <= 10213) ||
      10214 === e ||
      10215 === e ||
      10216 === e ||
      10217 === e ||
      10218 === e ||
      10219 === e ||
      10220 === e ||
      10221 === e ||
      10222 === e ||
      10223 === e ||
      (e >= 10224 && e <= 10239) ||
      (e >= 10240 && e <= 10495) ||
      (e >= 10496 && e <= 10626) ||
      10627 === e ||
      10628 === e ||
      10629 === e ||
      10630 === e ||
      10631 === e ||
      10632 === e ||
      10633 === e ||
      10634 === e ||
      10635 === e ||
      10636 === e ||
      10637 === e ||
      10638 === e ||
      10639 === e ||
      10640 === e ||
      10641 === e ||
      10642 === e ||
      10643 === e ||
      10644 === e ||
      10645 === e ||
      10646 === e ||
      10647 === e ||
      10648 === e ||
      (e >= 10649 && e <= 10711) ||
      10712 === e ||
      10713 === e ||
      10714 === e ||
      10715 === e ||
      (e >= 10716 && e <= 10747) ||
      10748 === e ||
      10749 === e ||
      (e >= 10750 && e <= 11007) ||
      (e >= 11008 && e <= 11055) ||
      (e >= 11056 && e <= 11076) ||
      (e >= 11077 && e <= 11078) ||
      (e >= 11079 && e <= 11084) ||
      (e >= 11085 && e <= 11123) ||
      (e >= 11124 && e <= 11125) ||
      (e >= 11126 && e <= 11157) ||
      11158 === e ||
      (e >= 11159 && e <= 11263) ||
      (e >= 11776 && e <= 11777) ||
      11778 === e ||
      11779 === e ||
      11780 === e ||
      11781 === e ||
      (e >= 11782 && e <= 11784) ||
      11785 === e ||
      11786 === e ||
      11787 === e ||
      11788 === e ||
      11789 === e ||
      (e >= 11790 && e <= 11798) ||
      11799 === e ||
      (e >= 11800 && e <= 11801) ||
      11802 === e ||
      11803 === e ||
      11804 === e ||
      11805 === e ||
      (e >= 11806 && e <= 11807) ||
      11808 === e ||
      11809 === e ||
      11810 === e ||
      11811 === e ||
      11812 === e ||
      11813 === e ||
      11814 === e ||
      11815 === e ||
      11816 === e ||
      11817 === e ||
      (e >= 11818 && e <= 11822) ||
      11823 === e ||
      (e >= 11824 && e <= 11833) ||
      (e >= 11834 && e <= 11835) ||
      (e >= 11836 && e <= 11839) ||
      11840 === e ||
      11841 === e ||
      11842 === e ||
      (e >= 11843 && e <= 11855) ||
      (e >= 11856 && e <= 11857) ||
      11858 === e ||
      (e >= 11859 && e <= 11903) ||
      (e >= 12289 && e <= 12291) ||
      12296 === e ||
      12297 === e ||
      12298 === e ||
      12299 === e ||
      12300 === e ||
      12301 === e ||
      12302 === e ||
      12303 === e ||
      12304 === e ||
      12305 === e ||
      (e >= 12306 && e <= 12307) ||
      12308 === e ||
      12309 === e ||
      12310 === e ||
      12311 === e ||
      12312 === e ||
      12313 === e ||
      12314 === e ||
      12315 === e ||
      12316 === e ||
      12317 === e ||
      (e >= 12318 && e <= 12319) ||
      12320 === e ||
      12336 === e ||
      64830 === e ||
      64831 === e ||
      (e >= 65093 && e <= 65094)
    );
  }
  function hi(e) {
    e.forEach(function (e) {
      if ((delete e.location, ya(e) || _a(e)))
        for (var t in e.options)
          delete e.options[t].location, hi(e.options[t].value);
      else
        (fa(e) && Sa(e.style)) || ((va(e) || ba(e)) && Ea(e.style))
          ? delete e.style.location
          : ka(e) && hi(e.children);
    });
  }
  function pi(e, t) {
    void 0 === t && (t = {}),
      (t = i({ shouldParseSkeletons: !0, requiresOtherClause: !0 }, t));
    var a = new oi(e, t).parse();
    if (a.err) {
      var n = SyntaxError(at[a.err.kind]);
      throw (
        ((n.location = a.err.location), (n.originalMessage = a.err.message), n)
      );
    }
    return (null == t ? void 0 : t.captureLocation) || hi(a.val), a.val;
  }
  function mi(e, t) {
    var a = t && t.cache ? t.cache : ki,
      i = t && t.serializer ? t.serializer : yi;
    return (t && t.strategy ? t.strategy : bi)(e, { cache: a, serializer: i });
  }
  function gi(e, t, a, i) {
    var n,
      s =
        null == (n = i) || "number" == typeof n || "boolean" == typeof n
          ? i
          : a(i),
      r = t.get(s);
    return void 0 === r && ((r = e.call(this, i)), t.set(s, r)), r;
  }
  function fi(e, t, a) {
    var i = Array.prototype.slice.call(arguments, 3),
      n = a(i),
      s = t.get(n);
    return void 0 === s && ((s = e.apply(this, i)), t.set(n, s)), s;
  }
  function vi(e, t, a, i, n) {
    return a.bind(t, e, i, n);
  }
  function bi(e, t) {
    return vi(
      e,
      this,
      1 === e.length ? gi : fi,
      t.cache.create(),
      t.serializer
    );
  }
  var yi = function () {
    return JSON.stringify(arguments);
  };
  function _i() {
    this.cache = Object.create(null);
  }
  (_i.prototype.get = function (e) {
    return this.cache[e];
  }),
    (_i.prototype.set = function (e, t) {
      this.cache[e] = t;
    });
  var wi,
    ki = {
      create: function () {
        return new _i();
      },
    },
    Si = {
      variadic: function (e, t) {
        return vi(e, this, fi, t.cache.create(), t.serializer);
      },
      monadic: function (e, t) {
        return vi(e, this, gi, t.cache.create(), t.serializer);
      },
    };
  !(function (e) {
    (e.MISSING_VALUE = "MISSING_VALUE"),
      (e.INVALID_VALUE = "INVALID_VALUE"),
      (e.MISSING_INTL_API = "MISSING_INTL_API");
  })(wi || (wi = {}));
  var Ei,
    Ai = (function (e) {
      function t(t, a, i) {
        var n = e.call(this, t) || this;
        return (n.code = a), (n.originalMessage = i), n;
      }
      return (
        a(t, e),
        (t.prototype.toString = function () {
          return "[formatjs Error: "
            .concat(this.code, "] ")
            .concat(this.message);
        }),
        t
      );
    })(Error),
    $i = (function (e) {
      function t(t, a, i, n) {
        return (
          e.call(
            this,
            'Invalid values for "'
              .concat(t, '": "')
              .concat(a, '". Options are "')
              .concat(Object.keys(i).join('", "'), '"'),
            wi.INVALID_VALUE,
            n
          ) || this
        );
      }
      return a(t, e), t;
    })(Ai),
    Mi = (function (e) {
      function t(t, a, i) {
        return (
          e.call(
            this,
            'Value for "'.concat(t, '" must be of type ').concat(a),
            wi.INVALID_VALUE,
            i
          ) || this
        );
      }
      return a(t, e), t;
    })(Ai),
    Ti = (function (e) {
      function t(t, a) {
        return (
          e.call(
            this,
            'The intl string context variable "'
              .concat(t, '" was not provided to the string "')
              .concat(a, '"'),
            wi.MISSING_VALUE,
            a
          ) || this
        );
      }
      return a(t, e), t;
    })(Ai);
  function Oi(e) {
    return "function" == typeof e;
  }
  function xi(e, t, a, i, n, s, r) {
    if (1 === e.length && ma(e[0]))
      return [{ type: Ei.literal, value: e[0].value }];
    for (var o = [], l = 0, u = e; l < u.length; l++) {
      var d = u[l];
      if (ma(d)) o.push({ type: Ei.literal, value: d.value });
      else if (wa(d))
        "number" == typeof s &&
          o.push({ type: Ei.literal, value: a.getNumberFormat(t).format(s) });
      else {
        var c = d.value;
        if (!n || !(c in n)) throw new Ti(c, r);
        var h = n[c];
        if (ga(d))
          (h && "string" != typeof h && "number" != typeof h) ||
            (h = "string" == typeof h || "number" == typeof h ? String(h) : ""),
            o.push({
              type: "string" == typeof h ? Ei.literal : Ei.object,
              value: h,
            });
        else if (va(d)) {
          var p =
            "string" == typeof d.style
              ? i.date[d.style]
              : Ea(d.style)
              ? d.style.parsedOptions
              : void 0;
          o.push({
            type: Ei.literal,
            value: a.getDateTimeFormat(t, p).format(h),
          });
        } else if (ba(d)) {
          p =
            "string" == typeof d.style
              ? i.time[d.style]
              : Ea(d.style)
              ? d.style.parsedOptions
              : i.time.medium;
          o.push({
            type: Ei.literal,
            value: a.getDateTimeFormat(t, p).format(h),
          });
        } else if (fa(d)) {
          (p =
            "string" == typeof d.style
              ? i.number[d.style]
              : Sa(d.style)
              ? d.style.parsedOptions
              : void 0) &&
            p.scale &&
            (h *= p.scale || 1),
            o.push({
              type: Ei.literal,
              value: a.getNumberFormat(t, p).format(h),
            });
        } else {
          if (ka(d)) {
            var m = d.children,
              g = d.value,
              f = n[g];
            if (!Oi(f)) throw new Mi(g, "function", r);
            var v = f(
              xi(m, t, a, i, n, s).map(function (e) {
                return e.value;
              })
            );
            Array.isArray(v) || (v = [v]),
              o.push.apply(
                o,
                v.map(function (e) {
                  return {
                    type: "string" == typeof e ? Ei.literal : Ei.object,
                    value: e,
                  };
                })
              );
          }
          if (ya(d)) {
            if (!(b = d.options[h] || d.options.other))
              throw new $i(d.value, h, Object.keys(d.options), r);
            o.push.apply(o, xi(b.value, t, a, i, n));
          } else if (_a(d)) {
            var b;
            if (!(b = d.options["=".concat(h)])) {
              if (!Intl.PluralRules)
                throw new Ai(
                  'Intl.PluralRules is not available in this environment.\nTry polyfilling it using "@formatjs/intl-pluralrules"\n',
                  wi.MISSING_INTL_API,
                  r
                );
              var y = a
                .getPluralRules(t, { type: d.pluralType })
                .select(h - (d.offset || 0));
              b = d.options[y] || d.options.other;
            }
            if (!b) throw new $i(d.value, h, Object.keys(d.options), r);
            o.push.apply(o, xi(b.value, t, a, i, n, h - (d.offset || 0)));
          } else;
        }
      }
    }
    return (function (e) {
      return e.length < 2
        ? e
        : e.reduce(function (e, t) {
            var a = e[e.length - 1];
            return (
              a && a.type === Ei.literal && t.type === Ei.literal
                ? (a.value += t.value)
                : e.push(t),
              e
            );
          }, []);
    })(o);
  }
  function zi(e, t) {
    return t
      ? Object.keys(e).reduce(function (a, n) {
          var s, r;
          return (
            (a[n] =
              ((s = e[n]),
              (r = t[n])
                ? i(
                    i(i({}, s || {}), r || {}),
                    Object.keys(s).reduce(function (e, t) {
                      return (e[t] = i(i({}, s[t]), r[t] || {})), e;
                    }, {})
                  )
                : s)),
            a
          );
        }, i({}, e))
      : e;
  }
  function Di(e) {
    return {
      create: function () {
        return {
          get: function (t) {
            return e[t];
          },
          set: function (t, a) {
            e[t] = a;
          },
        };
      },
    };
  }
  !(function (e) {
    (e[(e.literal = 0)] = "literal"), (e[(e.object = 1)] = "object");
  })(Ei || (Ei = {}));
  var Hi = (function () {
      function e(t, a, i, n) {
        var r,
          o = this;
        if (
          (void 0 === a && (a = e.defaultLocale),
          (this.formatterCache = { number: {}, dateTime: {}, pluralRules: {} }),
          (this.format = function (e) {
            var t = o.formatToParts(e);
            if (1 === t.length) return t[0].value;
            var a = t.reduce(function (e, t) {
              return (
                e.length &&
                t.type === Ei.literal &&
                "string" == typeof e[e.length - 1]
                  ? (e[e.length - 1] += t.value)
                  : e.push(t.value),
                e
              );
            }, []);
            return a.length <= 1 ? a[0] || "" : a;
          }),
          (this.formatToParts = function (e) {
            return xi(
              o.ast,
              o.locales,
              o.formatters,
              o.formats,
              e,
              void 0,
              o.message
            );
          }),
          (this.resolvedOptions = function () {
            return { locale: o.resolvedLocale.toString() };
          }),
          (this.getAst = function () {
            return o.ast;
          }),
          (this.locales = a),
          (this.resolvedLocale = e.resolveLocale(a)),
          "string" == typeof t)
        ) {
          if (((this.message = t), !e.__parse))
            throw new TypeError(
              "IntlMessageFormat.__parse must be set to process `message` of type `string`"
            );
          this.ast = e.__parse(t, {
            ignoreTag: null == n ? void 0 : n.ignoreTag,
            locale: this.resolvedLocale,
          });
        } else this.ast = t;
        if (!Array.isArray(this.ast))
          throw new TypeError("A message must be provided as a String or AST.");
        (this.formats = zi(e.formats, i)),
          (this.formatters =
            (n && n.formatters) ||
            (void 0 === (r = this.formatterCache) &&
              (r = { number: {}, dateTime: {}, pluralRules: {} }),
            {
              getNumberFormat: mi(
                function () {
                  for (var e, t = [], a = 0; a < arguments.length; a++)
                    t[a] = arguments[a];
                  return new ((e = Intl.NumberFormat).bind.apply(
                    e,
                    s([void 0], t, !1)
                  ))();
                },
                { cache: Di(r.number), strategy: Si.variadic }
              ),
              getDateTimeFormat: mi(
                function () {
                  for (var e, t = [], a = 0; a < arguments.length; a++)
                    t[a] = arguments[a];
                  return new ((e = Intl.DateTimeFormat).bind.apply(
                    e,
                    s([void 0], t, !1)
                  ))();
                },
                { cache: Di(r.dateTime), strategy: Si.variadic }
              ),
              getPluralRules: mi(
                function () {
                  for (var e, t = [], a = 0; a < arguments.length; a++)
                    t[a] = arguments[a];
                  return new ((e = Intl.PluralRules).bind.apply(
                    e,
                    s([void 0], t, !1)
                  ))();
                },
                { cache: Di(r.pluralRules), strategy: Si.variadic }
              ),
            }));
      }
      return (
        Object.defineProperty(e, "defaultLocale", {
          get: function () {
            return (
              e.memoizedDefaultLocale ||
                (e.memoizedDefaultLocale =
                  new Intl.NumberFormat().resolvedOptions().locale),
              e.memoizedDefaultLocale
            );
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.memoizedDefaultLocale = null),
        (e.resolveLocale = function (e) {
          var t = Intl.NumberFormat.supportedLocalesOf(e);
          return t.length > 0
            ? new Intl.Locale(t[0])
            : new Intl.Locale("string" == typeof e ? e : e[0]);
        }),
        (e.__parse = pi),
        (e.formats = {
          number: {
            integer: { maximumFractionDigits: 0 },
            currency: { style: "currency" },
            percent: { style: "percent" },
          },
          date: {
            short: { month: "numeric", day: "numeric", year: "2-digit" },
            medium: { month: "short", day: "numeric", year: "numeric" },
            long: { month: "long", day: "numeric", year: "numeric" },
            full: {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            },
          },
          time: {
            short: { hour: "numeric", minute: "numeric" },
            medium: { hour: "numeric", minute: "numeric", second: "numeric" },
            long: {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              timeZoneName: "short",
            },
            full: {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              timeZoneName: "short",
            },
          },
        }),
        e
      );
    })(),
    Pi = Hi;
  const Ni = { de: ht, en: _t, es: Tt, fr: Ct, it: Vt, nl: Jt, no: sa, sk: pa };
  function Ci(e, t, ...a) {
    const i = t.replace(/['"]+/g, "");
    let n;
    try {
      n = e.split(".").reduce((e, t) => e[t], Ni[i]);
    } catch (t) {
      n = e.split(".").reduce((e, t) => e[t], Ni.en);
    }
    if (
      (void 0 === n && (n = e.split(".").reduce((e, t) => e[t], Ni.en)),
      !a.length)
    )
      return n;
    const s = {};
    for (let e = 0; e < a.length; e += 2) {
      let t = a[e];
      (t = t.replace(/^{([^}]+)?}$/, "$1")), (s[t] = a[e + 1]);
    }
    try {
      return new Pi(n, t).format(s);
    } catch (e) {
      return "Translation " + e;
    }
  }
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ const ji = 2;
  class Li {
    constructor(e) {}
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(e, t, a) {
      (this._$Ct = e), (this._$AM = t), (this._$Ci = a);
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
   */ class Bi extends Li {
    constructor(e) {
      if ((super(e), (this.et = G), e.type !== ji))
        throw Error(
          this.constructor.directiveName +
            "() can only be used in child bindings"
        );
    }
    render(e) {
      if (e === G || null == e) return (this.ft = void 0), (this.et = e);
      if (e === V) return e;
      if ("string" != typeof e)
        throw Error(
          this.constructor.directiveName + "() called with a non-string value"
        );
      if (e === this.et) return this.ft;
      this.et = e;
      const t = [e];
      return (
        (t.raw = t),
        (this.ft = {
          _$litType$: this.constructor.resultType,
          strings: t,
          values: [],
        })
      );
    }
  }
  (Bi.directiveName = "unsafeHTML"), (Bi.resultType = 1);
  const Ii = (
    (e) =>
    (...t) => ({ _$litDirective$: e, values: t })
  )(Bi);
  function Ri(e) {
    return (
      "true" === (e = null == e ? void 0 : e.toString().toLowerCase()) ||
      "1" === e
    );
  }
  function Ui(e, t) {
    return (e = e.toString()).split(",")[t];
  }
  function Yi(e, t) {
    switch (t) {
      case Ke:
        return e.units == Ae ? Y`${Ii("mm")}` : Y`${Ii("in")}`;
      case We:
        return e.units == Ae ? Y`${Ii("m<sup>2</sup>")}` : Y`${Ii("sq ft")}`;
      case Ze:
        return e.units == Ae ? Y`${Ii("l/minute")}` : Y`${Ii("gal/minute")}`;
      default:
        return Y``;
    }
  }
  function Vi(e, t) {
    !(function (e, t) {
      be(e, "show-dialog", {
        dialogTag: "error-dialog",
        dialogImport: () =>
          Promise.resolve().then(function () {
            return rn;
          }),
        dialogParams: { error: t },
      });
    })(
      t,
      Y`
    ${e.error}:${e.body.message ? Y` ${e.body.message} ` : ""}
  `
    );
  }
  const Gi = c`
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
`;
  var Fi =
      "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
    Wi =
      "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z";
  let Zi = class extends tt(le) {
    hassSubscribe() {
      return (
        this._fetchData(),
        [
          this.hass.connection.subscribeMessage(() => this._fetchData(), {
            type: _e + "_config_updated",
          }),
        ]
      );
    }
    async _fetchData() {
      var e, t;
      this.hass &&
        ((this.config = await Xe(this.hass)),
        (this.data =
          ((e = this.config),
          (t = [
            "calctime",
            "autocalcenabled",
            "autoupdateenabled",
            "autoupdateschedule",
            "autoupdatefirsttime",
            "autoupdateinterval",
            "autoclearenabled",
            "cleardatatime",
          ]),
          e
            ? Object.entries(e)
                .filter(([e]) => t.includes(e))
                .reduce((e, [t, a]) => Object.assign(e, { [t]: a }), {})
            : {})));
    }
    firstUpdated() {
      (async () => {
        await ye();
      })();
    }
    render() {
      if (this.hass && this.config && this.data) {
        let e = Y` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautocalcdescription"
            @click="${() => this.toggleInformation("autocalcdescription")}"
          >
            >
            <title>
              ${Ci("panels.zones.actions.information", this.hass.language)}
            </title>
            <path fill="#404040" d="${Wi}" />
          </svg>
        </div>

        <div class="card-content">
          <label class="hidden" id="autocalcdescription">
            ${Ci(
              "panels.general.cards.automatic-duration-calculation.description",
              this.hass.language
            )}
          </label>
        </div>
        <div class="card-content">
          <label for="autocalcenabled"
            >${Ci(
              "panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",
              this.hass.language
            )}:</label
          >
          <input
            type="radio"
            id="autocalcon"
            name="autocalcenabled"
            value="True"
            ?checked="${this.config.autocalcenabled}"
            @change="${(e) => {
              this.saveData({ autocalcenabled: Ri(e.target.value) });
            }}"
          /><label for="autocalcon"
            >${Ci("common.labels.yes", this.hass.language)}</label
          >
          <input
            type="radio"
            id="autocalcoff"
            name="autocalcenabled"
            value="False"
            ?checked="${!this.config.autocalcenabled}"
            @change="${(e) => {
              this.saveData({ autocalcenabled: Ri(e.target.value) });
            }}"
          /><label for="autocalcoff"
            >${Ci("common.labels.no", this.hass.language)}</label
          >
        </div>`;
        this.data.autocalcenabled &&
          (e = Y`${e}
          <div class="card-content">
            <label for="calctime"
              >${Ci(
                "panels.general.cards.automatic-duration-calculation.labels.auto-calc-time",
                this.hass.language
              )}</label
            >:
            <input
              id="calctime"
              type="text"
              class="shortinput"
              .value="${this.config.calctime}"
              @input=${(e) => {
                this.saveData({ calctime: e.target.value });
              }}
            />
          </div>`),
          (e = Y`<ha-card
        header="${Ci(
          "panels.general.cards.automatic-duration-calculation.header",
          this.hass.language
        )}"
      >
        ${e}</ha-card
      >`);
        let t = Y` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautoupdatedescription"
            @click="${() => this.toggleInformation("autoupdatedescription")}"
          >
            >
            <title>
              ${Ci("panels.zones.actions.information", this.hass.language)}
            </title>
            <path fill="#404040" d="${Wi}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="autoupdatedescription">
            ${Ci(
              "panels.general.cards.automatic-update.description",
              this.hass.language
            )}
          </label>
        </div>
        <div class="card-content">
          <label for="autoupdateenabled"
            >${Ci(
              "panels.general.cards.automatic-update.labels.auto-update-enabled",
              this.hass.language
            )}:</label
          >
          <input
            type="radio"
            id="autoupdateon"
            name="autoupdateenabled"
            value="True"
            ?checked="${this.config.autoupdateenabled}"
            @change="${(e) => {
              this.saveData({ autoupdateenabled: Ri(e.target.value) });
            }}"
          /><label for="autoupdateon"
            >${Ci("common.labels.yes", this.hass.language)}</label
          >
          <input
            type="radio"
            id="autoupdateoff"
            name="autoupdateenabled"
            value="False"
            ?checked="${!this.config.autoupdateenabled}"
            @change="${(e) => {
              this.saveData({ autoupdateenabled: Ri(e.target.value) });
            }}"
          /><label for="autoupdateoff"
            >${Ci("common.labels.no", this.hass.language)}</label
          >
        </div>`;
        this.data.autoupdateenabled &&
          (t = Y`${t}
          <div class="card-content">
            <label for="autoupdateinterval"
              >${Ci(
                "panels.general.cards.automatic-update.labels.auto-update-interval",
                this.hass.language
              )}:</label
            >
            <input
              name="autoupdateinterval"
              class="shortinput"
              type="number"
              value="${this.data.autoupdateinterval}"
              @input="${(e) => {
                this.saveData({ autoupdateinterval: parseInt(e.target.value) });
              }}"
            />
            <select
              type="text"
              id="autoupdateschedule"
              @change="${(e) => {
                this.saveData({ autoupdateschedule: e.target.value });
              }}"
            >
              <option
                value="${we}"
                ?selected="${this.data.autoupdateschedule === we}"
              >
                ${Ci(
                  "panels.general.cards.automatic-update.options.minutes",
                  this.hass.language
                )}
              </option>
              <option
                value="${ke}"
                ?selected="${this.data.autoupdateschedule === ke}"
              >
                ${Ci(
                  "panels.general.cards.automatic-update.options.hours",
                  this.hass.language
                )}
              </option>
              <option
                value="${Se}"
                ?selected="${this.data.autoupdateschedule === Se}"
              >
                ${Ci(
                  "panels.general.cards.automatic-update.options.days",
                  this.hass.language
                )}
              </option>
            </select>
          </div>
          <div class="card-content">
            <label for="updatedelay"
              >${Ci(
                "panels.general.cards.automatic-update.labels.auto-update-delay",
                this.hass.language
              )}
              (s):</label
            >
            <input
              id="updatedelay"
              type="text"
              class="shortinput"
              .value="${this.config.autoupdatedelay}"
              @input=${(e) => {
                this.saveData({ autoupdatedelay: parseInt(e.target.value) });
              }}
            />
          </div>`),
          (t = Y`<ha-card header="${Ci(
            "panels.general.cards.automatic-update.header",
            this.hass.language
          )}",
      this.hass.language)}">${t}</ha-card>`);
        let a = Y` <div class="card-content">
          <svg
            style="width:24px;height:24px"
            viewBox="0 0 24 24"
            id="showautocleardescription"
            @click="${() => this.toggleInformation("autocleardescription")}"
          >
            <title>
              ${Ci("panels.zones.actions.information", this.hass.language)}
            </title>

            <path fill="#404040" d="${Wi}" />
          </svg>
        </div>
        <div class="card-content">
          <label class="hidden" id="autocleardescription">
            ${Ci(
              "panels.general.cards.automatic-clear.description",
              this.hass.language
            )}
          </label>
        </div>
        <div class="card-content">
          <label for="autoclearenabled"
            >${Ci(
              "panels.general.cards.automatic-clear.labels.automatic-clear-enabled",
              this.hass.language
            )}:</label
          >
          <input
            type="radio"
            id="autoclearon"
            name="autoclearenabled"
            value="True"
            ?checked="${this.config.autoclearenabled}"
            @change="${(e) => {
              this.saveData({ autoclearenabled: Ri(e.target.value) });
            }}"
          /><label for="autoclearon"
            >${Ci("common.labels.yes", this.hass.language)}</label
          >
          <input
            type="radio"
            id="autoclearoff"
            name="autoclearenabled"
            value="False"
            ?checked="${!this.config.autoclearenabled}"
            @change="${(e) => {
              this.saveData({ autoclearenabled: Ri(e.target.value) });
            }}"
          /><label for="autoclearoff"
            >${Ci("common.labels.no", this.hass.language)}</label
          >
        </div>`;
        this.data.autoclearenabled &&
          (a = Y`${a}
          <div class="card-content">
            <label for="calctime"
              >${Ci(
                "panels.general.cards.automatic-clear.labels.automatic-clear-time",
                this.hass.language
              )}</label
            >:
            <input
              id="cleardatatime"
              type="text"
              class="shortinput"
              .value="${this.config.cleardatatime}"
              @input=${(e) => {
                this.saveData({ cleardatatime: e.target.value });
              }}
            />
          </div>`),
          (a = Y`<ha-card header="${Ci(
            "panels.general.cards.automatic-clear.header",
            this.hass.language
          )}" >${a}</div></ha-card>`);
        return Y`<ha-card
          header="${Ci("panels.general.title", this.hass.language)}"
        >
          <div class="card-content">
            ${Ci("panels.general.description", this.hass.language)}
          </div> </ha-card
        >${t}${e}${a}`;
      }
      return Y``;
    }
    saveData(e) {
      var t, a;
      this.hass &&
        this.data &&
        ((this.data = Object.assign(Object.assign({}, this.data), e)),
        ((t = this.hass), (a = this.data), t.callApi("POST", _e + "/config", a))
          .catch((e) => Vi(e, this.shadowRoot.querySelector("ha-card")))
          .then());
    }
    toggleInformation(e) {
      var t;
      const a =
        null === (t = this.shadowRoot) || void 0 === t
          ? void 0
          : t.querySelector("#" + e);
      a &&
        ("hidden" != a.className
          ? (a.className = "hidden")
          : (a.className = "information"));
    }
    static get styles() {
      return c`
      ${Gi}
      .hidden {
        display: none;
      }
      .shortinput {
        width: 50px;
      }
      .information {
        margin-left: 20px;
        margin-top: 5px;
      }
    `;
    }
  };
  var qi;
  n([pe()], Zi.prototype, "narrow", void 0),
    n([pe()], Zi.prototype, "path", void 0),
    n([pe()], Zi.prototype, "data", void 0),
    n([pe()], Zi.prototype, "config", void 0),
    (Zi = n([de("smart-irrigation-view-general")], Zi)),
    (function (e) {
      (e.Disabled = "disabled"),
        (e.Manual = "manual"),
        (e.Automatic = "automatic");
    })(qi || (qi = {}));
  "undefined" != typeof globalThis
    ? globalThis
    : "undefined" != typeof window
    ? window
    : "undefined" != typeof global
    ? global
    : "undefined" != typeof self && self;
  function Ki(e) {
    return e &&
      e.__esModule &&
      Object.prototype.hasOwnProperty.call(e, "default")
      ? e.default
      : e;
  }
  function Xi(e) {
    throw new Error(
      'Could not dynamically require "' +
        e +
        '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.'
    );
  }
  var Ji = { exports: {} };
  !(function (e, t) {
    e.exports = (function () {
      var t, a;
      function i() {
        return t.apply(null, arguments);
      }
      function n(e) {
        t = e;
      }
      function s(e) {
        return (
          e instanceof Array ||
          "[object Array]" === Object.prototype.toString.call(e)
        );
      }
      function r(e) {
        return (
          null != e && "[object Object]" === Object.prototype.toString.call(e)
        );
      }
      function o(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
      }
      function l(e) {
        if (Object.getOwnPropertyNames)
          return 0 === Object.getOwnPropertyNames(e).length;
        var t;
        for (t in e) if (o(e, t)) return !1;
        return !0;
      }
      function u(e) {
        return void 0 === e;
      }
      function d(e) {
        return (
          "number" == typeof e ||
          "[object Number]" === Object.prototype.toString.call(e)
        );
      }
      function c(e) {
        return (
          e instanceof Date ||
          "[object Date]" === Object.prototype.toString.call(e)
        );
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
        return (
          o(t, "toString") && (e.toString = t.toString),
          o(t, "valueOf") && (e.valueOf = t.valueOf),
          e
        );
      }
      function m(e, t, a, i) {
        return Wa(e, t, a, i, !0).utc();
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
          weekdayMismatch: !1,
        };
      }
      function f(e) {
        return null == e._pf && (e._pf = g()), e._pf;
      }
      function v(e) {
        if (null == e._isValid) {
          var t = f(e),
            i = a.call(t.parsedDateParts, function (e) {
              return null != e;
            }),
            n =
              !isNaN(e._d.getTime()) &&
              t.overflow < 0 &&
              !t.empty &&
              !t.invalidEra &&
              !t.invalidMonth &&
              !t.invalidWeekday &&
              !t.weekdayMismatch &&
              !t.nullInput &&
              !t.invalidFormat &&
              !t.userInvalidated &&
              (!t.meridiem || (t.meridiem && i));
          if (
            (e._strict &&
              (n =
                n &&
                0 === t.charsLeftOver &&
                0 === t.unusedTokens.length &&
                void 0 === t.bigHour),
            null != Object.isFrozen && Object.isFrozen(e))
          )
            return n;
          e._isValid = n;
        }
        return e._isValid;
      }
      function b(e) {
        var t = m(NaN);
        return null != e ? p(f(t), e) : (f(t).userInvalidated = !0), t;
      }
      a = Array.prototype.some
        ? Array.prototype.some
        : function (e) {
            var t,
              a = Object(this),
              i = a.length >>> 0;
            for (t = 0; t < i; t++)
              if (t in a && e.call(this, a[t], t, a)) return !0;
            return !1;
          };
      var y = (i.momentProperties = []),
        _ = !1;
      function w(e, t) {
        var a,
          i,
          n,
          s = y.length;
        if (
          (u(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject),
          u(t._i) || (e._i = t._i),
          u(t._f) || (e._f = t._f),
          u(t._l) || (e._l = t._l),
          u(t._strict) || (e._strict = t._strict),
          u(t._tzm) || (e._tzm = t._tzm),
          u(t._isUTC) || (e._isUTC = t._isUTC),
          u(t._offset) || (e._offset = t._offset),
          u(t._pf) || (e._pf = f(t)),
          u(t._locale) || (e._locale = t._locale),
          s > 0)
        )
          for (a = 0; a < s; a++) u((n = t[(i = y[a])])) || (e[i] = n);
        return e;
      }
      function k(e) {
        w(this, e),
          (this._d = new Date(null != e._d ? e._d.getTime() : NaN)),
          this.isValid() || (this._d = new Date(NaN)),
          !1 === _ && ((_ = !0), i.updateOffset(this), (_ = !1));
      }
      function S(e) {
        return e instanceof k || (null != e && null != e._isAMomentObject);
      }
      function E(e) {
        !1 === i.suppressDeprecationWarnings &&
          "undefined" != typeof console &&
          console.warn &&
          console.warn("Deprecation warning: " + e);
      }
      function A(e, t) {
        var a = !0;
        return p(function () {
          if (
            (null != i.deprecationHandler && i.deprecationHandler(null, e), a)
          ) {
            var n,
              s,
              r,
              l = [],
              u = arguments.length;
            for (s = 0; s < u; s++) {
              if (((n = ""), "object" == typeof arguments[s])) {
                for (r in ((n += "\n[" + s + "] "), arguments[0]))
                  o(arguments[0], r) &&
                    (n += r + ": " + arguments[0][r] + ", ");
                n = n.slice(0, -2);
              } else n = arguments[s];
              l.push(n);
            }
            E(
              e +
                "\nArguments: " +
                Array.prototype.slice.call(l).join("") +
                "\n" +
                new Error().stack
            ),
              (a = !1);
          }
          return t.apply(this, arguments);
        }, t);
      }
      var $,
        M = {};
      function T(e, t) {
        null != i.deprecationHandler && i.deprecationHandler(e, t),
          M[e] || (E(t), (M[e] = !0));
      }
      function O(e) {
        return (
          ("undefined" != typeof Function && e instanceof Function) ||
          "[object Function]" === Object.prototype.toString.call(e)
        );
      }
      function x(e) {
        var t, a;
        for (a in e)
          o(e, a) && (O((t = e[a])) ? (this[a] = t) : (this["_" + a] = t));
        (this._config = e),
          (this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
              "|" +
              /\d{1,2}/.source
          ));
      }
      function z(e, t) {
        var a,
          i = p({}, e);
        for (a in t)
          o(t, a) &&
            (r(e[a]) && r(t[a])
              ? ((i[a] = {}), p(i[a], e[a]), p(i[a], t[a]))
              : null != t[a]
              ? (i[a] = t[a])
              : delete i[a]);
        for (a in e) o(e, a) && !o(t, a) && r(e[a]) && (i[a] = p({}, i[a]));
        return i;
      }
      function D(e) {
        null != e && this.set(e);
      }
      (i.suppressDeprecationWarnings = !1),
        (i.deprecationHandler = null),
        ($ = Object.keys
          ? Object.keys
          : function (e) {
              var t,
                a = [];
              for (t in e) o(e, t) && a.push(t);
              return a;
            });
      var H = {
        sameDay: "[Today at] LT",
        nextDay: "[Tomorrow at] LT",
        nextWeek: "dddd [at] LT",
        lastDay: "[Yesterday at] LT",
        lastWeek: "[Last] dddd [at] LT",
        sameElse: "L",
      };
      function P(e, t, a) {
        var i = this._calendar[e] || this._calendar.sameElse;
        return O(i) ? i.call(t, a) : i;
      }
      function N(e, t, a) {
        var i = "" + Math.abs(e),
          n = t - i.length;
        return (
          (e >= 0 ? (a ? "+" : "") : "-") +
          Math.pow(10, Math.max(0, n)).toString().substr(1) +
          i
        );
      }
      var C =
          /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        j = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        L = {},
        B = {};
      function I(e, t, a, i) {
        var n = i;
        "string" == typeof i &&
          (n = function () {
            return this[i]();
          }),
          e && (B[e] = n),
          t &&
            (B[t[0]] = function () {
              return N(n.apply(this, arguments), t[1], t[2]);
            }),
          a &&
            (B[a] = function () {
              return this.localeData().ordinal(n.apply(this, arguments), e);
            });
      }
      function R(e) {
        return e.match(/\[[\s\S]/)
          ? e.replace(/^\[|\]$/g, "")
          : e.replace(/\\/g, "");
      }
      function U(e) {
        var t,
          a,
          i = e.match(C);
        for (t = 0, a = i.length; t < a; t++)
          B[i[t]] ? (i[t] = B[i[t]]) : (i[t] = R(i[t]));
        return function (t) {
          var n,
            s = "";
          for (n = 0; n < a; n++) s += O(i[n]) ? i[n].call(t, e) : i[n];
          return s;
        };
      }
      function Y(e, t) {
        return e.isValid()
          ? ((t = V(t, e.localeData())), (L[t] = L[t] || U(t)), L[t](e))
          : e.localeData().invalidDate();
      }
      function V(e, t) {
        var a = 5;
        function i(e) {
          return t.longDateFormat(e) || e;
        }
        for (j.lastIndex = 0; a >= 0 && j.test(e); )
          (e = e.replace(j, i)), (j.lastIndex = 0), (a -= 1);
        return e;
      }
      var G = {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A",
      };
      function F(e) {
        var t = this._longDateFormat[e],
          a = this._longDateFormat[e.toUpperCase()];
        return t || !a
          ? t
          : ((this._longDateFormat[e] = a
              .match(C)
              .map(function (e) {
                return "MMMM" === e || "MM" === e || "DD" === e || "dddd" === e
                  ? e.slice(1)
                  : e;
              })
              .join("")),
            this._longDateFormat[e]);
      }
      var W = "Invalid date";
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
        yy: "%d years",
      };
      function Q(e, t, a, i) {
        var n = this._relativeTime[a];
        return O(n) ? n(e, t, a, i) : n.replace(/%d/i, e);
      }
      function ee(e, t) {
        var a = this._relativeTime[e > 0 ? "future" : "past"];
        return O(a) ? a(t) : a.replace(/%s/i, t);
      }
      var te = {};
      function ae(e, t) {
        var a = e.toLowerCase();
        te[a] = te[a + "s"] = te[t] = e;
      }
      function ie(e) {
        return "string" == typeof e ? te[e] || te[e.toLowerCase()] : void 0;
      }
      function ne(e) {
        var t,
          a,
          i = {};
        for (a in e) o(e, a) && (t = ie(a)) && (i[t] = e[a]);
        return i;
      }
      var se = {};
      function re(e, t) {
        se[e] = t;
      }
      function oe(e) {
        var t,
          a = [];
        for (t in e) o(e, t) && a.push({ unit: t, priority: se[t] });
        return (
          a.sort(function (e, t) {
            return e.priority - t.priority;
          }),
          a
        );
      }
      function le(e) {
        return (e % 4 == 0 && e % 100 != 0) || e % 400 == 0;
      }
      function ue(e) {
        return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
      }
      function de(e) {
        var t = +e,
          a = 0;
        return 0 !== t && isFinite(t) && (a = ue(t)), a;
      }
      function ce(e, t) {
        return function (a) {
          return null != a
            ? (pe(this, e, a), i.updateOffset(this, t), this)
            : he(this, e);
        };
      }
      function he(e, t) {
        return e.isValid() ? e._d["get" + (e._isUTC ? "UTC" : "") + t]() : NaN;
      }
      function pe(e, t, a) {
        e.isValid() &&
          !isNaN(a) &&
          ("FullYear" === t &&
          le(e.year()) &&
          1 === e.month() &&
          29 === e.date()
            ? ((a = de(a)),
              e._d["set" + (e._isUTC ? "UTC" : "") + t](
                a,
                e.month(),
                Qe(a, e.month())
              ))
            : e._d["set" + (e._isUTC ? "UTC" : "") + t](a));
      }
      function me(e) {
        return O(this[(e = ie(e))]) ? this[e]() : this;
      }
      function ge(e, t) {
        if ("object" == typeof e) {
          var a,
            i = oe((e = ne(e))),
            n = i.length;
          for (a = 0; a < n; a++) this[i[a].unit](e[i[a].unit]);
        } else if (O(this[(e = ie(e))])) return this[e](t);
        return this;
      }
      var fe,
        ve = /\d/,
        be = /\d\d/,
        ye = /\d{3}/,
        _e = /\d{4}/,
        we = /[+-]?\d{6}/,
        ke = /\d\d?/,
        Se = /\d\d\d\d?/,
        Ee = /\d\d\d\d\d\d?/,
        Ae = /\d{1,3}/,
        $e = /\d{1,4}/,
        Me = /[+-]?\d{1,6}/,
        Te = /\d+/,
        Oe = /[+-]?\d+/,
        xe = /Z|[+-]\d\d:?\d\d/gi,
        ze = /Z|[+-]\d\d(?::?\d\d)?/gi,
        De = /[+-]?\d+(\.\d{1,3})?/,
        He =
          /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;
      function Pe(e, t, a) {
        fe[e] = O(t)
          ? t
          : function (e, i) {
              return e && a ? a : t;
            };
      }
      function Ne(e, t) {
        return o(fe, e) ? fe[e](t._strict, t._locale) : new RegExp(Ce(e));
      }
      function Ce(e) {
        return je(
          e
            .replace("\\", "")
            .replace(
              /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
              function (e, t, a, i, n) {
                return t || a || i || n;
              }
            )
        );
      }
      function je(e) {
        return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      fe = {};
      var Le = {};
      function Be(e, t) {
        var a,
          i,
          n = t;
        for (
          "string" == typeof e && (e = [e]),
            d(t) &&
              (n = function (e, a) {
                a[t] = de(e);
              }),
            i = e.length,
            a = 0;
          a < i;
          a++
        )
          Le[e[a]] = n;
      }
      function Ie(e, t) {
        Be(e, function (e, a, i, n) {
          (i._w = i._w || {}), t(e, i._w, i, n);
        });
      }
      function Re(e, t, a) {
        null != t && o(Le, e) && Le[e](t, a._a, a, e);
      }
      var Ue,
        Ye = 0,
        Ve = 1,
        Ge = 2,
        Fe = 3,
        We = 4,
        Ze = 5,
        qe = 6,
        Ke = 7,
        Xe = 8;
      function Je(e, t) {
        return ((e % t) + t) % t;
      }
      function Qe(e, t) {
        if (isNaN(e) || isNaN(t)) return NaN;
        var a = Je(t, 12);
        return (
          (e += (t - a) / 12), 1 === a ? (le(e) ? 29 : 28) : 31 - ((a % 7) % 2)
        );
      }
      (Ue = Array.prototype.indexOf
        ? Array.prototype.indexOf
        : function (e) {
            var t;
            for (t = 0; t < this.length; ++t) if (this[t] === e) return t;
            return -1;
          }),
        I("M", ["MM", 2], "Mo", function () {
          return this.month() + 1;
        }),
        I("MMM", 0, 0, function (e) {
          return this.localeData().monthsShort(this, e);
        }),
        I("MMMM", 0, 0, function (e) {
          return this.localeData().months(this, e);
        }),
        ae("month", "M"),
        re("month", 8),
        Pe("M", ke),
        Pe("MM", ke, be),
        Pe("MMM", function (e, t) {
          return t.monthsShortRegex(e);
        }),
        Pe("MMMM", function (e, t) {
          return t.monthsRegex(e);
        }),
        Be(["M", "MM"], function (e, t) {
          t[Ve] = de(e) - 1;
        }),
        Be(["MMM", "MMMM"], function (e, t, a, i) {
          var n = a._locale.monthsParse(e, i, a._strict);
          null != n ? (t[Ve] = n) : (f(a).invalidMonth = e);
        });
      var et =
          "January_February_March_April_May_June_July_August_September_October_November_December".split(
            "_"
          ),
        tt = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        at = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        it = He,
        nt = He;
      function st(e, t) {
        return e
          ? s(this._months)
            ? this._months[e.month()]
            : this._months[
                (this._months.isFormat || at).test(t) ? "format" : "standalone"
              ][e.month()]
          : s(this._months)
          ? this._months
          : this._months.standalone;
      }
      function rt(e, t) {
        return e
          ? s(this._monthsShort)
            ? this._monthsShort[e.month()]
            : this._monthsShort[at.test(t) ? "format" : "standalone"][e.month()]
          : s(this._monthsShort)
          ? this._monthsShort
          : this._monthsShort.standalone;
      }
      function ot(e, t, a) {
        var i,
          n,
          s,
          r = e.toLocaleLowerCase();
        if (!this._monthsParse)
          for (
            this._monthsParse = [],
              this._longMonthsParse = [],
              this._shortMonthsParse = [],
              i = 0;
            i < 12;
            ++i
          )
            (s = m([2e3, i])),
              (this._shortMonthsParse[i] = this.monthsShort(
                s,
                ""
              ).toLocaleLowerCase()),
              (this._longMonthsParse[i] = this.months(
                s,
                ""
              ).toLocaleLowerCase());
        return a
          ? "MMM" === t
            ? -1 !== (n = Ue.call(this._shortMonthsParse, r))
              ? n
              : null
            : -1 !== (n = Ue.call(this._longMonthsParse, r))
            ? n
            : null
          : "MMM" === t
          ? -1 !== (n = Ue.call(this._shortMonthsParse, r)) ||
            -1 !== (n = Ue.call(this._longMonthsParse, r))
            ? n
            : null
          : -1 !== (n = Ue.call(this._longMonthsParse, r)) ||
            -1 !== (n = Ue.call(this._shortMonthsParse, r))
          ? n
          : null;
      }
      function lt(e, t, a) {
        var i, n, s;
        if (this._monthsParseExact) return ot.call(this, e, t, a);
        for (
          this._monthsParse ||
            ((this._monthsParse = []),
            (this._longMonthsParse = []),
            (this._shortMonthsParse = [])),
            i = 0;
          i < 12;
          i++
        ) {
          if (
            ((n = m([2e3, i])),
            a &&
              !this._longMonthsParse[i] &&
              ((this._longMonthsParse[i] = new RegExp(
                "^" + this.months(n, "").replace(".", "") + "$",
                "i"
              )),
              (this._shortMonthsParse[i] = new RegExp(
                "^" + this.monthsShort(n, "").replace(".", "") + "$",
                "i"
              ))),
            a ||
              this._monthsParse[i] ||
              ((s = "^" + this.months(n, "") + "|^" + this.monthsShort(n, "")),
              (this._monthsParse[i] = new RegExp(s.replace(".", ""), "i"))),
            a && "MMMM" === t && this._longMonthsParse[i].test(e))
          )
            return i;
          if (a && "MMM" === t && this._shortMonthsParse[i].test(e)) return i;
          if (!a && this._monthsParse[i].test(e)) return i;
        }
      }
      function ut(e, t) {
        var a;
        if (!e.isValid()) return e;
        if ("string" == typeof t)
          if (/^\d+$/.test(t)) t = de(t);
          else if (!d((t = e.localeData().monthsParse(t)))) return e;
        return (
          (a = Math.min(e.date(), Qe(e.year(), t))),
          e._d["set" + (e._isUTC ? "UTC" : "") + "Month"](t, a),
          e
        );
      }
      function dt(e) {
        return null != e
          ? (ut(this, e), i.updateOffset(this, !0), this)
          : he(this, "Month");
      }
      function ct() {
        return Qe(this.year(), this.month());
      }
      function ht(e) {
        return this._monthsParseExact
          ? (o(this, "_monthsRegex") || mt.call(this),
            e ? this._monthsShortStrictRegex : this._monthsShortRegex)
          : (o(this, "_monthsShortRegex") || (this._monthsShortRegex = it),
            this._monthsShortStrictRegex && e
              ? this._monthsShortStrictRegex
              : this._monthsShortRegex);
      }
      function pt(e) {
        return this._monthsParseExact
          ? (o(this, "_monthsRegex") || mt.call(this),
            e ? this._monthsStrictRegex : this._monthsRegex)
          : (o(this, "_monthsRegex") || (this._monthsRegex = nt),
            this._monthsStrictRegex && e
              ? this._monthsStrictRegex
              : this._monthsRegex);
      }
      function mt() {
        function e(e, t) {
          return t.length - e.length;
        }
        var t,
          a,
          i = [],
          n = [],
          s = [];
        for (t = 0; t < 12; t++)
          (a = m([2e3, t])),
            i.push(this.monthsShort(a, "")),
            n.push(this.months(a, "")),
            s.push(this.months(a, "")),
            s.push(this.monthsShort(a, ""));
        for (i.sort(e), n.sort(e), s.sort(e), t = 0; t < 12; t++)
          (i[t] = je(i[t])), (n[t] = je(n[t]));
        for (t = 0; t < 24; t++) s[t] = je(s[t]);
        (this._monthsRegex = new RegExp("^(" + s.join("|") + ")", "i")),
          (this._monthsShortRegex = this._monthsRegex),
          (this._monthsStrictRegex = new RegExp("^(" + n.join("|") + ")", "i")),
          (this._monthsShortStrictRegex = new RegExp(
            "^(" + i.join("|") + ")",
            "i"
          ));
      }
      function gt(e) {
        return le(e) ? 366 : 365;
      }
      I("Y", 0, 0, function () {
        var e = this.year();
        return e <= 9999 ? N(e, 4) : "+" + e;
      }),
        I(0, ["YY", 2], 0, function () {
          return this.year() % 100;
        }),
        I(0, ["YYYY", 4], 0, "year"),
        I(0, ["YYYYY", 5], 0, "year"),
        I(0, ["YYYYYY", 6, !0], 0, "year"),
        ae("year", "y"),
        re("year", 1),
        Pe("Y", Oe),
        Pe("YY", ke, be),
        Pe("YYYY", $e, _e),
        Pe("YYYYY", Me, we),
        Pe("YYYYYY", Me, we),
        Be(["YYYYY", "YYYYYY"], Ye),
        Be("YYYY", function (e, t) {
          t[Ye] = 2 === e.length ? i.parseTwoDigitYear(e) : de(e);
        }),
        Be("YY", function (e, t) {
          t[Ye] = i.parseTwoDigitYear(e);
        }),
        Be("Y", function (e, t) {
          t[Ye] = parseInt(e, 10);
        }),
        (i.parseTwoDigitYear = function (e) {
          return de(e) + (de(e) > 68 ? 1900 : 2e3);
        });
      var ft = ce("FullYear", !0);
      function vt() {
        return le(this.year());
      }
      function bt(e, t, a, i, n, s, r) {
        var o;
        return (
          e < 100 && e >= 0
            ? ((o = new Date(e + 400, t, a, i, n, s, r)),
              isFinite(o.getFullYear()) && o.setFullYear(e))
            : (o = new Date(e, t, a, i, n, s, r)),
          o
        );
      }
      function yt(e) {
        var t, a;
        return (
          e < 100 && e >= 0
            ? (((a = Array.prototype.slice.call(arguments))[0] = e + 400),
              (t = new Date(Date.UTC.apply(null, a))),
              isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e))
            : (t = new Date(Date.UTC.apply(null, arguments))),
          t
        );
      }
      function _t(e, t, a) {
        var i = 7 + t - a;
        return (-(7 + yt(e, 0, i).getUTCDay() - t) % 7) + i - 1;
      }
      function wt(e, t, a, i, n) {
        var s,
          r,
          o = 1 + 7 * (t - 1) + ((7 + a - i) % 7) + _t(e, i, n);
        return (
          o <= 0
            ? (r = gt((s = e - 1)) + o)
            : o > gt(e)
            ? ((s = e + 1), (r = o - gt(e)))
            : ((s = e), (r = o)),
          { year: s, dayOfYear: r }
        );
      }
      function kt(e, t, a) {
        var i,
          n,
          s = _t(e.year(), t, a),
          r = Math.floor((e.dayOfYear() - s - 1) / 7) + 1;
        return (
          r < 1
            ? (i = r + St((n = e.year() - 1), t, a))
            : r > St(e.year(), t, a)
            ? ((i = r - St(e.year(), t, a)), (n = e.year() + 1))
            : ((n = e.year()), (i = r)),
          { week: i, year: n }
        );
      }
      function St(e, t, a) {
        var i = _t(e, t, a),
          n = _t(e + 1, t, a);
        return (gt(e) - i + n) / 7;
      }
      function Et(e) {
        return kt(e, this._week.dow, this._week.doy).week;
      }
      I("w", ["ww", 2], "wo", "week"),
        I("W", ["WW", 2], "Wo", "isoWeek"),
        ae("week", "w"),
        ae("isoWeek", "W"),
        re("week", 5),
        re("isoWeek", 5),
        Pe("w", ke),
        Pe("ww", ke, be),
        Pe("W", ke),
        Pe("WW", ke, be),
        Ie(["w", "ww", "W", "WW"], function (e, t, a, i) {
          t[i.substr(0, 1)] = de(e);
        });
      var At = { dow: 0, doy: 6 };
      function $t() {
        return this._week.dow;
      }
      function Mt() {
        return this._week.doy;
      }
      function Tt(e) {
        var t = this.localeData().week(this);
        return null == e ? t : this.add(7 * (e - t), "d");
      }
      function Ot(e) {
        var t = kt(this, 1, 4).week;
        return null == e ? t : this.add(7 * (e - t), "d");
      }
      function xt(e, t) {
        return "string" != typeof e
          ? e
          : isNaN(e)
          ? "number" == typeof (e = t.weekdaysParse(e))
            ? e
            : null
          : parseInt(e, 10);
      }
      function zt(e, t) {
        return "string" == typeof e
          ? t.weekdaysParse(e) % 7 || 7
          : isNaN(e)
          ? null
          : e;
      }
      function Dt(e, t) {
        return e.slice(t, 7).concat(e.slice(0, t));
      }
      I("d", 0, "do", "day"),
        I("dd", 0, 0, function (e) {
          return this.localeData().weekdaysMin(this, e);
        }),
        I("ddd", 0, 0, function (e) {
          return this.localeData().weekdaysShort(this, e);
        }),
        I("dddd", 0, 0, function (e) {
          return this.localeData().weekdays(this, e);
        }),
        I("e", 0, 0, "weekday"),
        I("E", 0, 0, "isoWeekday"),
        ae("day", "d"),
        ae("weekday", "e"),
        ae("isoWeekday", "E"),
        re("day", 11),
        re("weekday", 11),
        re("isoWeekday", 11),
        Pe("d", ke),
        Pe("e", ke),
        Pe("E", ke),
        Pe("dd", function (e, t) {
          return t.weekdaysMinRegex(e);
        }),
        Pe("ddd", function (e, t) {
          return t.weekdaysShortRegex(e);
        }),
        Pe("dddd", function (e, t) {
          return t.weekdaysRegex(e);
        }),
        Ie(["dd", "ddd", "dddd"], function (e, t, a, i) {
          var n = a._locale.weekdaysParse(e, i, a._strict);
          null != n ? (t.d = n) : (f(a).invalidWeekday = e);
        }),
        Ie(["d", "e", "E"], function (e, t, a, i) {
          t[i] = de(e);
        });
      var Ht = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split(
          "_"
        ),
        Pt = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        Nt = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        Ct = He,
        jt = He,
        Lt = He;
      function Bt(e, t) {
        var a = s(this._weekdays)
          ? this._weekdays
          : this._weekdays[
              e && !0 !== e && this._weekdays.isFormat.test(t)
                ? "format"
                : "standalone"
            ];
        return !0 === e ? Dt(a, this._week.dow) : e ? a[e.day()] : a;
      }
      function It(e) {
        return !0 === e
          ? Dt(this._weekdaysShort, this._week.dow)
          : e
          ? this._weekdaysShort[e.day()]
          : this._weekdaysShort;
      }
      function Rt(e) {
        return !0 === e
          ? Dt(this._weekdaysMin, this._week.dow)
          : e
          ? this._weekdaysMin[e.day()]
          : this._weekdaysMin;
      }
      function Ut(e, t, a) {
        var i,
          n,
          s,
          r = e.toLocaleLowerCase();
        if (!this._weekdaysParse)
          for (
            this._weekdaysParse = [],
              this._shortWeekdaysParse = [],
              this._minWeekdaysParse = [],
              i = 0;
            i < 7;
            ++i
          )
            (s = m([2e3, 1]).day(i)),
              (this._minWeekdaysParse[i] = this.weekdaysMin(
                s,
                ""
              ).toLocaleLowerCase()),
              (this._shortWeekdaysParse[i] = this.weekdaysShort(
                s,
                ""
              ).toLocaleLowerCase()),
              (this._weekdaysParse[i] = this.weekdays(
                s,
                ""
              ).toLocaleLowerCase());
        return a
          ? "dddd" === t
            ? -1 !== (n = Ue.call(this._weekdaysParse, r))
              ? n
              : null
            : "ddd" === t
            ? -1 !== (n = Ue.call(this._shortWeekdaysParse, r))
              ? n
              : null
            : -1 !== (n = Ue.call(this._minWeekdaysParse, r))
            ? n
            : null
          : "dddd" === t
          ? -1 !== (n = Ue.call(this._weekdaysParse, r)) ||
            -1 !== (n = Ue.call(this._shortWeekdaysParse, r)) ||
            -1 !== (n = Ue.call(this._minWeekdaysParse, r))
            ? n
            : null
          : "ddd" === t
          ? -1 !== (n = Ue.call(this._shortWeekdaysParse, r)) ||
            -1 !== (n = Ue.call(this._weekdaysParse, r)) ||
            -1 !== (n = Ue.call(this._minWeekdaysParse, r))
            ? n
            : null
          : -1 !== (n = Ue.call(this._minWeekdaysParse, r)) ||
            -1 !== (n = Ue.call(this._weekdaysParse, r)) ||
            -1 !== (n = Ue.call(this._shortWeekdaysParse, r))
          ? n
          : null;
      }
      function Yt(e, t, a) {
        var i, n, s;
        if (this._weekdaysParseExact) return Ut.call(this, e, t, a);
        for (
          this._weekdaysParse ||
            ((this._weekdaysParse = []),
            (this._minWeekdaysParse = []),
            (this._shortWeekdaysParse = []),
            (this._fullWeekdaysParse = [])),
            i = 0;
          i < 7;
          i++
        ) {
          if (
            ((n = m([2e3, 1]).day(i)),
            a &&
              !this._fullWeekdaysParse[i] &&
              ((this._fullWeekdaysParse[i] = new RegExp(
                "^" + this.weekdays(n, "").replace(".", "\\.?") + "$",
                "i"
              )),
              (this._shortWeekdaysParse[i] = new RegExp(
                "^" + this.weekdaysShort(n, "").replace(".", "\\.?") + "$",
                "i"
              )),
              (this._minWeekdaysParse[i] = new RegExp(
                "^" + this.weekdaysMin(n, "").replace(".", "\\.?") + "$",
                "i"
              ))),
            this._weekdaysParse[i] ||
              ((s =
                "^" +
                this.weekdays(n, "") +
                "|^" +
                this.weekdaysShort(n, "") +
                "|^" +
                this.weekdaysMin(n, "")),
              (this._weekdaysParse[i] = new RegExp(s.replace(".", ""), "i"))),
            a && "dddd" === t && this._fullWeekdaysParse[i].test(e))
          )
            return i;
          if (a && "ddd" === t && this._shortWeekdaysParse[i].test(e)) return i;
          if (a && "dd" === t && this._minWeekdaysParse[i].test(e)) return i;
          if (!a && this._weekdaysParse[i].test(e)) return i;
        }
      }
      function Vt(e) {
        if (!this.isValid()) return null != e ? this : NaN;
        var t = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        return null != e
          ? ((e = xt(e, this.localeData())), this.add(e - t, "d"))
          : t;
      }
      function Gt(e) {
        if (!this.isValid()) return null != e ? this : NaN;
        var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return null == e ? t : this.add(e - t, "d");
      }
      function Ft(e) {
        if (!this.isValid()) return null != e ? this : NaN;
        if (null != e) {
          var t = zt(e, this.localeData());
          return this.day(this.day() % 7 ? t : t - 7);
        }
        return this.day() || 7;
      }
      function Wt(e) {
        return this._weekdaysParseExact
          ? (o(this, "_weekdaysRegex") || Kt.call(this),
            e ? this._weekdaysStrictRegex : this._weekdaysRegex)
          : (o(this, "_weekdaysRegex") || (this._weekdaysRegex = Ct),
            this._weekdaysStrictRegex && e
              ? this._weekdaysStrictRegex
              : this._weekdaysRegex);
      }
      function Zt(e) {
        return this._weekdaysParseExact
          ? (o(this, "_weekdaysRegex") || Kt.call(this),
            e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex)
          : (o(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = jt),
            this._weekdaysShortStrictRegex && e
              ? this._weekdaysShortStrictRegex
              : this._weekdaysShortRegex);
      }
      function qt(e) {
        return this._weekdaysParseExact
          ? (o(this, "_weekdaysRegex") || Kt.call(this),
            e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex)
          : (o(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = Lt),
            this._weekdaysMinStrictRegex && e
              ? this._weekdaysMinStrictRegex
              : this._weekdaysMinRegex);
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
        for (t = 0; t < 7; t++)
          (a = m([2e3, 1]).day(t)),
            (i = je(this.weekdaysMin(a, ""))),
            (n = je(this.weekdaysShort(a, ""))),
            (s = je(this.weekdays(a, ""))),
            r.push(i),
            o.push(n),
            l.push(s),
            u.push(i),
            u.push(n),
            u.push(s);
        r.sort(e),
          o.sort(e),
          l.sort(e),
          u.sort(e),
          (this._weekdaysRegex = new RegExp("^(" + u.join("|") + ")", "i")),
          (this._weekdaysShortRegex = this._weekdaysRegex),
          (this._weekdaysMinRegex = this._weekdaysRegex),
          (this._weekdaysStrictRegex = new RegExp(
            "^(" + l.join("|") + ")",
            "i"
          )),
          (this._weekdaysShortStrictRegex = new RegExp(
            "^(" + o.join("|") + ")",
            "i"
          )),
          (this._weekdaysMinStrictRegex = new RegExp(
            "^(" + r.join("|") + ")",
            "i"
          ));
      }
      function Xt() {
        return this.hours() % 12 || 12;
      }
      function Jt() {
        return this.hours() || 24;
      }
      function Qt(e, t) {
        I(e, 0, 0, function () {
          return this.localeData().meridiem(this.hours(), this.minutes(), t);
        });
      }
      function ea(e, t) {
        return t._meridiemParse;
      }
      function ta(e) {
        return "p" === (e + "").toLowerCase().charAt(0);
      }
      I("H", ["HH", 2], 0, "hour"),
        I("h", ["hh", 2], 0, Xt),
        I("k", ["kk", 2], 0, Jt),
        I("hmm", 0, 0, function () {
          return "" + Xt.apply(this) + N(this.minutes(), 2);
        }),
        I("hmmss", 0, 0, function () {
          return (
            "" + Xt.apply(this) + N(this.minutes(), 2) + N(this.seconds(), 2)
          );
        }),
        I("Hmm", 0, 0, function () {
          return "" + this.hours() + N(this.minutes(), 2);
        }),
        I("Hmmss", 0, 0, function () {
          return (
            "" + this.hours() + N(this.minutes(), 2) + N(this.seconds(), 2)
          );
        }),
        Qt("a", !0),
        Qt("A", !1),
        ae("hour", "h"),
        re("hour", 13),
        Pe("a", ea),
        Pe("A", ea),
        Pe("H", ke),
        Pe("h", ke),
        Pe("k", ke),
        Pe("HH", ke, be),
        Pe("hh", ke, be),
        Pe("kk", ke, be),
        Pe("hmm", Se),
        Pe("hmmss", Ee),
        Pe("Hmm", Se),
        Pe("Hmmss", Ee),
        Be(["H", "HH"], Fe),
        Be(["k", "kk"], function (e, t, a) {
          var i = de(e);
          t[Fe] = 24 === i ? 0 : i;
        }),
        Be(["a", "A"], function (e, t, a) {
          (a._isPm = a._locale.isPM(e)), (a._meridiem = e);
        }),
        Be(["h", "hh"], function (e, t, a) {
          (t[Fe] = de(e)), (f(a).bigHour = !0);
        }),
        Be("hmm", function (e, t, a) {
          var i = e.length - 2;
          (t[Fe] = de(e.substr(0, i))),
            (t[We] = de(e.substr(i))),
            (f(a).bigHour = !0);
        }),
        Be("hmmss", function (e, t, a) {
          var i = e.length - 4,
            n = e.length - 2;
          (t[Fe] = de(e.substr(0, i))),
            (t[We] = de(e.substr(i, 2))),
            (t[Ze] = de(e.substr(n))),
            (f(a).bigHour = !0);
        }),
        Be("Hmm", function (e, t, a) {
          var i = e.length - 2;
          (t[Fe] = de(e.substr(0, i))), (t[We] = de(e.substr(i)));
        }),
        Be("Hmmss", function (e, t, a) {
          var i = e.length - 4,
            n = e.length - 2;
          (t[Fe] = de(e.substr(0, i))),
            (t[We] = de(e.substr(i, 2))),
            (t[Ze] = de(e.substr(n)));
        });
      var aa = /[ap]\.?m?\.?/i,
        ia = ce("Hours", !0);
      function na(e, t, a) {
        return e > 11 ? (a ? "pm" : "PM") : a ? "am" : "AM";
      }
      var sa,
        ra = {
          calendar: H,
          longDateFormat: G,
          invalidDate: W,
          ordinal: q,
          dayOfMonthOrdinalParse: K,
          relativeTime: J,
          months: et,
          monthsShort: tt,
          week: At,
          weekdays: Ht,
          weekdaysMin: Nt,
          weekdaysShort: Pt,
          meridiemParse: aa,
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
        for (var t, a, i, n, s = 0; s < e.length; ) {
          for (
            t = (n = da(e[s]).split("-")).length,
              a = (a = da(e[s + 1])) ? a.split("-") : null;
            t > 0;

          ) {
            if ((i = pa(n.slice(0, t).join("-")))) return i;
            if (a && a.length >= t && ua(n, a) >= t - 1) break;
            t--;
          }
          s++;
        }
        return sa;
      }
      function ha(e) {
        return null != e.match("^[^/\\\\]*$");
      }
      function pa(t) {
        var a = null;
        if (void 0 === oa[t] && e && e.exports && ha(t))
          try {
            (a = sa._abbr), Xi("./locale/" + t), ma(a);
          } catch (e) {
            oa[t] = null;
          }
        return oa[t];
      }
      function ma(e, t) {
        var a;
        return (
          e &&
            ((a = u(t) ? va(e) : ga(e, t))
              ? (sa = a)
              : "undefined" != typeof console &&
                console.warn &&
                console.warn(
                  "Locale " + e + " not found. Did you forget to load it?"
                )),
          sa._abbr
        );
      }
      function ga(e, t) {
        if (null !== t) {
          var a,
            i = ra;
          if (((t.abbr = e), null != oa[e]))
            T(
              "defineLocaleOverride",
              "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."
            ),
              (i = oa[e]._config);
          else if (null != t.parentLocale)
            if (null != oa[t.parentLocale]) i = oa[t.parentLocale]._config;
            else {
              if (null == (a = pa(t.parentLocale)))
                return (
                  la[t.parentLocale] || (la[t.parentLocale] = []),
                  la[t.parentLocale].push({ name: e, config: t }),
                  null
                );
              i = a._config;
            }
          return (
            (oa[e] = new D(z(i, t))),
            la[e] &&
              la[e].forEach(function (e) {
                ga(e.name, e.config);
              }),
            ma(e),
            oa[e]
          );
        }
        return delete oa[e], null;
      }
      function fa(e, t) {
        if (null != t) {
          var a,
            i,
            n = ra;
          null != oa[e] && null != oa[e].parentLocale
            ? oa[e].set(z(oa[e]._config, t))
            : (null != (i = pa(e)) && (n = i._config),
              (t = z(n, t)),
              null == i && (t.abbr = e),
              ((a = new D(t)).parentLocale = oa[e]),
              (oa[e] = a)),
            ma(e);
        } else
          null != oa[e] &&
            (null != oa[e].parentLocale
              ? ((oa[e] = oa[e].parentLocale), e === ma() && ma(e))
              : null != oa[e] && delete oa[e]);
        return oa[e];
      }
      function va(e) {
        var t;
        if ((e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e))
          return sa;
        if (!s(e)) {
          if ((t = pa(e))) return t;
          e = [e];
        }
        return ca(e);
      }
      function ba() {
        return $(oa);
      }
      function ya(e) {
        var t,
          a = e._a;
        return (
          a &&
            -2 === f(e).overflow &&
            ((t =
              a[Ve] < 0 || a[Ve] > 11
                ? Ve
                : a[Ge] < 1 || a[Ge] > Qe(a[Ye], a[Ve])
                ? Ge
                : a[Fe] < 0 ||
                  a[Fe] > 24 ||
                  (24 === a[Fe] && (0 !== a[We] || 0 !== a[Ze] || 0 !== a[qe]))
                ? Fe
                : a[We] < 0 || a[We] > 59
                ? We
                : a[Ze] < 0 || a[Ze] > 59
                ? Ze
                : a[qe] < 0 || a[qe] > 999
                ? qe
                : -1),
            f(e)._overflowDayOfYear && (t < Ye || t > Ge) && (t = Ge),
            f(e)._overflowWeeks && -1 === t && (t = Ke),
            f(e)._overflowWeekday && -1 === t && (t = Xe),
            (f(e).overflow = t)),
          e
        );
      }
      var _a =
          /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        wa =
          /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        ka = /Z|[+-]\d\d(?::?\d\d)?/,
        Sa = [
          ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
          ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
          ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
          ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
          ["YYYY-DDD", /\d{4}-\d{3}/],
          ["YYYY-MM", /\d{4}-\d\d/, !1],
          ["YYYYYYMMDD", /[+-]\d{10}/],
          ["YYYYMMDD", /\d{8}/],
          ["GGGG[W]WWE", /\d{4}W\d{3}/],
          ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
          ["YYYYDDD", /\d{7}/],
          ["YYYYMM", /\d{6}/, !1],
          ["YYYY", /\d{4}/, !1],
        ],
        Ea = [
          ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
          ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
          ["HH:mm:ss", /\d\d:\d\d:\d\d/],
          ["HH:mm", /\d\d:\d\d/],
          ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
          ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
          ["HHmmss", /\d\d\d\d\d\d/],
          ["HHmm", /\d\d\d\d/],
          ["HH", /\d\d/],
        ],
        Aa = /^\/?Date\((-?\d+)/i,
        $a =
          /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
        Ma = {
          UT: 0,
          GMT: 0,
          EDT: -240,
          EST: -300,
          CDT: -300,
          CST: -360,
          MDT: -360,
          MST: -420,
          PDT: -420,
          PST: -480,
        };
      function Ta(e) {
        var t,
          a,
          i,
          n,
          s,
          r,
          o = e._i,
          l = _a.exec(o) || wa.exec(o),
          u = Sa.length,
          d = Ea.length;
        if (l) {
          for (f(e).iso = !0, t = 0, a = u; t < a; t++)
            if (Sa[t][1].exec(l[1])) {
              (n = Sa[t][0]), (i = !1 !== Sa[t][2]);
              break;
            }
          if (null == n) return void (e._isValid = !1);
          if (l[3]) {
            for (t = 0, a = d; t < a; t++)
              if (Ea[t][1].exec(l[3])) {
                s = (l[2] || " ") + Ea[t][0];
                break;
              }
            if (null == s) return void (e._isValid = !1);
          }
          if (!i && null != s) return void (e._isValid = !1);
          if (l[4]) {
            if (!ka.exec(l[4])) return void (e._isValid = !1);
            r = "Z";
          }
          (e._f = n + (s || "") + (r || "")), Ia(e);
        } else e._isValid = !1;
      }
      function Oa(e, t, a, i, n, s) {
        var r = [
          xa(e),
          tt.indexOf(t),
          parseInt(a, 10),
          parseInt(i, 10),
          parseInt(n, 10),
        ];
        return s && r.push(parseInt(s, 10)), r;
      }
      function xa(e) {
        var t = parseInt(e, 10);
        return t <= 49 ? 2e3 + t : t <= 999 ? 1900 + t : t;
      }
      function za(e) {
        return e
          .replace(/\([^()]*\)|[\n\t]/g, " ")
          .replace(/(\s\s+)/g, " ")
          .replace(/^\s\s*/, "")
          .replace(/\s\s*$/, "");
      }
      function Da(e, t, a) {
        return (
          !e ||
          Pt.indexOf(e) === new Date(t[0], t[1], t[2]).getDay() ||
          ((f(a).weekdayMismatch = !0), (a._isValid = !1), !1)
        );
      }
      function Ha(e, t, a) {
        if (e) return Ma[e];
        if (t) return 0;
        var i = parseInt(a, 10),
          n = i % 100;
        return ((i - n) / 100) * 60 + n;
      }
      function Pa(e) {
        var t,
          a = $a.exec(za(e._i));
        if (a) {
          if (((t = Oa(a[4], a[3], a[2], a[5], a[6], a[7])), !Da(a[1], t, e)))
            return;
          (e._a = t),
            (e._tzm = Ha(a[8], a[9], a[10])),
            (e._d = yt.apply(null, e._a)),
            e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm),
            (f(e).rfc2822 = !0);
        } else e._isValid = !1;
      }
      function Na(e) {
        var t = Aa.exec(e._i);
        null === t
          ? (Ta(e),
            !1 === e._isValid &&
              (delete e._isValid,
              Pa(e),
              !1 === e._isValid &&
                (delete e._isValid,
                e._strict ? (e._isValid = !1) : i.createFromInputFallback(e))))
          : (e._d = new Date(+t[1]));
      }
      function Ca(e, t, a) {
        return null != e ? e : null != t ? t : a;
      }
      function ja(e) {
        var t = new Date(i.now());
        return e._useUTC
          ? [t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()]
          : [t.getFullYear(), t.getMonth(), t.getDate()];
      }
      function La(e) {
        var t,
          a,
          i,
          n,
          s,
          r = [];
        if (!e._d) {
          for (
            i = ja(e),
              e._w && null == e._a[Ge] && null == e._a[Ve] && Ba(e),
              null != e._dayOfYear &&
                ((s = Ca(e._a[Ye], i[Ye])),
                (e._dayOfYear > gt(s) || 0 === e._dayOfYear) &&
                  (f(e)._overflowDayOfYear = !0),
                (a = yt(s, 0, e._dayOfYear)),
                (e._a[Ve] = a.getUTCMonth()),
                (e._a[Ge] = a.getUTCDate())),
              t = 0;
            t < 3 && null == e._a[t];
            ++t
          )
            e._a[t] = r[t] = i[t];
          for (; t < 7; t++)
            e._a[t] = r[t] = null == e._a[t] ? (2 === t ? 1 : 0) : e._a[t];
          24 === e._a[Fe] &&
            0 === e._a[We] &&
            0 === e._a[Ze] &&
            0 === e._a[qe] &&
            ((e._nextDay = !0), (e._a[Fe] = 0)),
            (e._d = (e._useUTC ? yt : bt).apply(null, r)),
            (n = e._useUTC ? e._d.getUTCDay() : e._d.getDay()),
            null != e._tzm && e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm),
            e._nextDay && (e._a[Fe] = 24),
            e._w &&
              void 0 !== e._w.d &&
              e._w.d !== n &&
              (f(e).weekdayMismatch = !0);
        }
      }
      function Ba(e) {
        var t, a, i, n, s, r, o, l, u;
        null != (t = e._w).GG || null != t.W || null != t.E
          ? ((s = 1),
            (r = 4),
            (a = Ca(t.GG, e._a[Ye], kt(Za(), 1, 4).year)),
            (i = Ca(t.W, 1)),
            ((n = Ca(t.E, 1)) < 1 || n > 7) && (l = !0))
          : ((s = e._locale._week.dow),
            (r = e._locale._week.doy),
            (u = kt(Za(), s, r)),
            (a = Ca(t.gg, e._a[Ye], u.year)),
            (i = Ca(t.w, u.week)),
            null != t.d
              ? ((n = t.d) < 0 || n > 6) && (l = !0)
              : null != t.e
              ? ((n = t.e + s), (t.e < 0 || t.e > 6) && (l = !0))
              : (n = s)),
          i < 1 || i > St(a, s, r)
            ? (f(e)._overflowWeeks = !0)
            : null != l
            ? (f(e)._overflowWeekday = !0)
            : ((o = wt(a, i, n, s, r)),
              (e._a[Ye] = o.year),
              (e._dayOfYear = o.dayOfYear));
      }
      function Ia(e) {
        if (e._f !== i.ISO_8601)
          if (e._f !== i.RFC_2822) {
            (e._a = []), (f(e).empty = !0);
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
            for (
              l = (n = V(e._f, e._locale).match(C) || []).length, t = 0;
              t < l;
              t++
            )
              (s = n[t]),
                (a = (u.match(Ne(s, e)) || [])[0]) &&
                  ((r = u.substr(0, u.indexOf(a))).length > 0 &&
                    f(e).unusedInput.push(r),
                  (u = u.slice(u.indexOf(a) + a.length)),
                  (c += a.length)),
                B[s]
                  ? (a ? (f(e).empty = !1) : f(e).unusedTokens.push(s),
                    Re(s, a, e))
                  : e._strict && !a && f(e).unusedTokens.push(s);
            (f(e).charsLeftOver = d - c),
              u.length > 0 && f(e).unusedInput.push(u),
              e._a[Fe] <= 12 &&
                !0 === f(e).bigHour &&
                e._a[Fe] > 0 &&
                (f(e).bigHour = void 0),
              (f(e).parsedDateParts = e._a.slice(0)),
              (f(e).meridiem = e._meridiem),
              (e._a[Fe] = Ra(e._locale, e._a[Fe], e._meridiem)),
              null !== (o = f(e).era) &&
                (e._a[Ye] = e._locale.erasConvertYear(o, e._a[Ye])),
              La(e),
              ya(e);
          } else Pa(e);
        else Ta(e);
      }
      function Ra(e, t, a) {
        var i;
        return null == a
          ? t
          : null != e.meridiemHour
          ? e.meridiemHour(t, a)
          : null != e.isPM
          ? ((i = e.isPM(a)) && t < 12 && (t += 12),
            i || 12 !== t || (t = 0),
            t)
          : t;
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
        if (0 === l)
          return (f(e).invalidFormat = !0), void (e._d = new Date(NaN));
        for (n = 0; n < l; n++)
          (s = 0),
            (r = !1),
            (t = w({}, e)),
            null != e._useUTC && (t._useUTC = e._useUTC),
            (t._f = e._f[n]),
            Ia(t),
            v(t) && (r = !0),
            (s += f(t).charsLeftOver),
            (s += 10 * f(t).unusedTokens.length),
            (f(t).score = s),
            o
              ? s < i && ((i = s), (a = t))
              : (null == i || s < i || r) && ((i = s), (a = t), r && (o = !0));
        p(e, a || t);
      }
      function Ya(e) {
        if (!e._d) {
          var t = ne(e._i),
            a = void 0 === t.day ? t.date : t.day;
          (e._a = h(
            [t.year, t.month, a, t.hour, t.minute, t.second, t.millisecond],
            function (e) {
              return e && parseInt(e, 10);
            }
          )),
            La(e);
        }
      }
      function Va(e) {
        var t = new k(ya(Ga(e)));
        return t._nextDay && (t.add(1, "d"), (t._nextDay = void 0)), t;
      }
      function Ga(e) {
        var t = e._i,
          a = e._f;
        return (
          (e._locale = e._locale || va(e._l)),
          null === t || (void 0 === a && "" === t)
            ? b({ nullInput: !0 })
            : ("string" == typeof t && (e._i = t = e._locale.preparse(t)),
              S(t)
                ? new k(ya(t))
                : (c(t) ? (e._d = t) : s(a) ? Ua(e) : a ? Ia(e) : Fa(e),
                  v(e) || (e._d = null),
                  e))
        );
      }
      function Fa(e) {
        var t = e._i;
        u(t)
          ? (e._d = new Date(i.now()))
          : c(t)
          ? (e._d = new Date(t.valueOf()))
          : "string" == typeof t
          ? Na(e)
          : s(t)
          ? ((e._a = h(t.slice(0), function (e) {
              return parseInt(e, 10);
            })),
            La(e))
          : r(t)
          ? Ya(e)
          : d(t)
          ? (e._d = new Date(t))
          : i.createFromInputFallback(e);
      }
      function Wa(e, t, a, i, n) {
        var o = {};
        return (
          (!0 !== t && !1 !== t) || ((i = t), (t = void 0)),
          (!0 !== a && !1 !== a) || ((i = a), (a = void 0)),
          ((r(e) && l(e)) || (s(e) && 0 === e.length)) && (e = void 0),
          (o._isAMomentObject = !0),
          (o._useUTC = o._isUTC = n),
          (o._l = a),
          (o._i = e),
          (o._f = t),
          (o._strict = i),
          Va(o)
        );
      }
      function Za(e, t, a, i) {
        return Wa(e, t, a, i, !1);
      }
      (i.createFromInputFallback = A(
        "value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",
        function (e) {
          e._d = new Date(e._i + (e._useUTC ? " UTC" : ""));
        }
      )),
        (i.ISO_8601 = function () {}),
        (i.RFC_2822 = function () {});
      var qa = A(
          "moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",
          function () {
            var e = Za.apply(null, arguments);
            return this.isValid() && e.isValid() ? (e < this ? this : e) : b();
          }
        ),
        Ka = A(
          "moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",
          function () {
            var e = Za.apply(null, arguments);
            return this.isValid() && e.isValid() ? (e > this ? this : e) : b();
          }
        );
      function Xa(e, t) {
        var a, i;
        if ((1 === t.length && s(t[0]) && (t = t[0]), !t.length)) return Za();
        for (a = t[0], i = 1; i < t.length; ++i)
          (t[i].isValid() && !t[i][e](a)) || (a = t[i]);
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
        ti = [
          "year",
          "quarter",
          "month",
          "week",
          "day",
          "hour",
          "minute",
          "second",
          "millisecond",
        ];
      function ai(e) {
        var t,
          a,
          i = !1,
          n = ti.length;
        for (t in e)
          if (
            o(e, t) &&
            (-1 === Ue.call(ti, t) || (null != e[t] && isNaN(e[t])))
          )
            return !1;
        for (a = 0; a < n; ++a)
          if (e[ti[a]]) {
            if (i) return !1;
            parseFloat(e[ti[a]]) !== de(e[ti[a]]) && (i = !0);
          }
        return !0;
      }
      function ii() {
        return this._isValid;
      }
      function ni() {
        return Mi(NaN);
      }
      function si(e) {
        var t = ne(e),
          a = t.year || 0,
          i = t.quarter || 0,
          n = t.month || 0,
          s = t.week || t.isoWeek || 0,
          r = t.day || 0,
          o = t.hour || 0,
          l = t.minute || 0,
          u = t.second || 0,
          d = t.millisecond || 0;
        (this._isValid = ai(t)),
          (this._milliseconds = +d + 1e3 * u + 6e4 * l + 1e3 * o * 60 * 60),
          (this._days = +r + 7 * s),
          (this._months = +n + 3 * i + 12 * a),
          (this._data = {}),
          (this._locale = va()),
          this._bubble();
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
        for (i = 0; i < n; i++)
          ((a && e[i] !== t[i]) || (!a && de(e[i]) !== de(t[i]))) && r++;
        return r + s;
      }
      function ui(e, t) {
        I(e, 0, 0, function () {
          var e = this.utcOffset(),
            a = "+";
          return (
            e < 0 && ((e = -e), (a = "-")),
            a + N(~~(e / 60), 2) + t + N(~~e % 60, 2)
          );
        });
      }
      ui("Z", ":"),
        ui("ZZ", ""),
        Pe("Z", ze),
        Pe("ZZ", ze),
        Be(["Z", "ZZ"], function (e, t, a) {
          (a._useUTC = !0), (a._tzm = ci(ze, e));
        });
      var di = /([\+\-]|\d\d)/gi;
      function ci(e, t) {
        var a,
          i,
          n = (t || "").match(e);
        return null === n
          ? null
          : 0 ===
            (i =
              60 *
                (a = ((n[n.length - 1] || []) + "").match(di) || [
                  "-",
                  0,
                  0,
                ])[1] +
              de(a[2]))
          ? 0
          : "+" === a[0]
          ? i
          : -i;
      }
      function hi(e, t) {
        var a, n;
        return t._isUTC
          ? ((a = t.clone()),
            (n = (S(e) || c(e) ? e.valueOf() : Za(e).valueOf()) - a.valueOf()),
            a._d.setTime(a._d.valueOf() + n),
            i.updateOffset(a, !1),
            a)
          : Za(e).local();
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
            if (null === (e = ci(ze, e))) return this;
          } else Math.abs(e) < 16 && !a && (e *= 60);
          return (
            !this._isUTC && t && (n = pi(this)),
            (this._offset = e),
            (this._isUTC = !0),
            null != n && this.add(n, "m"),
            s !== e &&
              (!t || this._changeInProgress
                ? Di(this, Mi(e - s, "m"), 1, !1)
                : this._changeInProgress ||
                  ((this._changeInProgress = !0),
                  i.updateOffset(this, !0),
                  (this._changeInProgress = null))),
            this
          );
        }
        return this._isUTC ? s : pi(this);
      }
      function gi(e, t) {
        return null != e
          ? ("string" != typeof e && (e = -e), this.utcOffset(e, t), this)
          : -this.utcOffset();
      }
      function fi(e) {
        return this.utcOffset(0, e);
      }
      function vi(e) {
        return (
          this._isUTC &&
            (this.utcOffset(0, e),
            (this._isUTC = !1),
            e && this.subtract(pi(this), "m")),
          this
        );
      }
      function bi() {
        if (null != this._tzm) this.utcOffset(this._tzm, !1, !0);
        else if ("string" == typeof this._i) {
          var e = ci(xe, this._i);
          null != e ? this.utcOffset(e) : this.utcOffset(0, !0);
        }
        return this;
      }
      function yi(e) {
        return (
          !!this.isValid() &&
          ((e = e ? Za(e).utcOffset() : 0), (this.utcOffset() - e) % 60 == 0)
        );
      }
      function _i() {
        return (
          this.utcOffset() > this.clone().month(0).utcOffset() ||
          this.utcOffset() > this.clone().month(5).utcOffset()
        );
      }
      function wi() {
        if (!u(this._isDSTShifted)) return this._isDSTShifted;
        var e,
          t = {};
        return (
          w(t, this),
          (t = Ga(t))._a
            ? ((e = t._isUTC ? m(t._a) : Za(t._a)),
              (this._isDSTShifted =
                this.isValid() && li(t._a, e.toArray()) > 0))
            : (this._isDSTShifted = !1),
          this._isDSTShifted
        );
      }
      function ki() {
        return !!this.isValid() && !this._isUTC;
      }
      function Si() {
        return !!this.isValid() && this._isUTC;
      }
      function Ei() {
        return !!this.isValid() && this._isUTC && 0 === this._offset;
      }
      i.updateOffset = function () {};
      var Ai = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
        $i =
          /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
      function Mi(e, t) {
        var a,
          i,
          n,
          s = e,
          r = null;
        return (
          ri(e)
            ? (s = { ms: e._milliseconds, d: e._days, M: e._months })
            : d(e) || !isNaN(+e)
            ? ((s = {}), t ? (s[t] = +e) : (s.milliseconds = +e))
            : (r = Ai.exec(e))
            ? ((a = "-" === r[1] ? -1 : 1),
              (s = {
                y: 0,
                d: de(r[Ge]) * a,
                h: de(r[Fe]) * a,
                m: de(r[We]) * a,
                s: de(r[Ze]) * a,
                ms: de(oi(1e3 * r[qe])) * a,
              }))
            : (r = $i.exec(e))
            ? ((a = "-" === r[1] ? -1 : 1),
              (s = {
                y: Ti(r[2], a),
                M: Ti(r[3], a),
                w: Ti(r[4], a),
                d: Ti(r[5], a),
                h: Ti(r[6], a),
                m: Ti(r[7], a),
                s: Ti(r[8], a),
              }))
            : null == s
            ? (s = {})
            : "object" == typeof s &&
              ("from" in s || "to" in s) &&
              ((n = xi(Za(s.from), Za(s.to))),
              ((s = {}).ms = n.milliseconds),
              (s.M = n.months)),
          (i = new si(s)),
          ri(e) && o(e, "_locale") && (i._locale = e._locale),
          ri(e) && o(e, "_isValid") && (i._isValid = e._isValid),
          i
        );
      }
      function Ti(e, t) {
        var a = e && parseFloat(e.replace(",", "."));
        return (isNaN(a) ? 0 : a) * t;
      }
      function Oi(e, t) {
        var a = {};
        return (
          (a.months = t.month() - e.month() + 12 * (t.year() - e.year())),
          e.clone().add(a.months, "M").isAfter(t) && --a.months,
          (a.milliseconds = +t - +e.clone().add(a.months, "M")),
          a
        );
      }
      function xi(e, t) {
        var a;
        return e.isValid() && t.isValid()
          ? ((t = hi(t, e)),
            e.isBefore(t)
              ? (a = Oi(e, t))
              : (((a = Oi(t, e)).milliseconds = -a.milliseconds),
                (a.months = -a.months)),
            a)
          : { milliseconds: 0, months: 0 };
      }
      function zi(e, t) {
        return function (a, i) {
          var n;
          return (
            null === i ||
              isNaN(+i) ||
              (T(
                t,
                "moment()." +
                  t +
                  "(period, number) is deprecated. Please use moment()." +
                  t +
                  "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."
              ),
              (n = a),
              (a = i),
              (i = n)),
            Di(this, Mi(a, i), e),
            this
          );
        };
      }
      function Di(e, t, a, n) {
        var s = t._milliseconds,
          r = oi(t._days),
          o = oi(t._months);
        e.isValid() &&
          ((n = null == n || n),
          o && ut(e, he(e, "Month") + o * a),
          r && pe(e, "Date", he(e, "Date") + r * a),
          s && e._d.setTime(e._d.valueOf() + s * a),
          n && i.updateOffset(e, r || o));
      }
      (Mi.fn = si.prototype), (Mi.invalid = ni);
      var Hi = zi(1, "add"),
        Pi = zi(-1, "subtract");
      function Ni(e) {
        return "string" == typeof e || e instanceof String;
      }
      function Ci(e) {
        return S(e) || c(e) || Ni(e) || d(e) || Li(e) || ji(e) || null == e;
      }
      function ji(e) {
        var t,
          a,
          i = r(e) && !l(e),
          n = !1,
          s = [
            "years",
            "year",
            "y",
            "months",
            "month",
            "M",
            "days",
            "day",
            "d",
            "dates",
            "date",
            "D",
            "hours",
            "hour",
            "h",
            "minutes",
            "minute",
            "m",
            "seconds",
            "second",
            "s",
            "milliseconds",
            "millisecond",
            "ms",
          ],
          u = s.length;
        for (t = 0; t < u; t += 1) (a = s[t]), (n = n || o(e, a));
        return i && n;
      }
      function Li(e) {
        var t = s(e),
          a = !1;
        return (
          t &&
            (a =
              0 ===
              e.filter(function (t) {
                return !d(t) && Ni(e);
              }).length),
          t && a
        );
      }
      function Bi(e) {
        var t,
          a,
          i = r(e) && !l(e),
          n = !1,
          s = [
            "sameDay",
            "nextDay",
            "lastDay",
            "nextWeek",
            "lastWeek",
            "sameElse",
          ];
        for (t = 0; t < s.length; t += 1) (a = s[t]), (n = n || o(e, a));
        return i && n;
      }
      function Ii(e, t) {
        var a = e.diff(t, "days", !0);
        return a < -6
          ? "sameElse"
          : a < -1
          ? "lastWeek"
          : a < 0
          ? "lastDay"
          : a < 1
          ? "sameDay"
          : a < 2
          ? "nextDay"
          : a < 7
          ? "nextWeek"
          : "sameElse";
      }
      function Ri(e, t) {
        1 === arguments.length &&
          (arguments[0]
            ? Ci(arguments[0])
              ? ((e = arguments[0]), (t = void 0))
              : Bi(arguments[0]) && ((t = arguments[0]), (e = void 0))
            : ((e = void 0), (t = void 0)));
        var a = e || Za(),
          n = hi(a, this).startOf("day"),
          s = i.calendarFormat(this, n) || "sameElse",
          r = t && (O(t[s]) ? t[s].call(this, a) : t[s]);
        return this.format(r || this.localeData().calendar(s, this, Za(a)));
      }
      function Ui() {
        return new k(this);
      }
      function Yi(e, t) {
        var a = S(e) ? e : Za(e);
        return (
          !(!this.isValid() || !a.isValid()) &&
          ("millisecond" === (t = ie(t) || "millisecond")
            ? this.valueOf() > a.valueOf()
            : a.valueOf() < this.clone().startOf(t).valueOf())
        );
      }
      function Vi(e, t) {
        var a = S(e) ? e : Za(e);
        return (
          !(!this.isValid() || !a.isValid()) &&
          ("millisecond" === (t = ie(t) || "millisecond")
            ? this.valueOf() < a.valueOf()
            : this.clone().endOf(t).valueOf() < a.valueOf())
        );
      }
      function Gi(e, t, a, i) {
        var n = S(e) ? e : Za(e),
          s = S(t) ? t : Za(t);
        return (
          !!(this.isValid() && n.isValid() && s.isValid()) &&
          ("(" === (i = i || "()")[0]
            ? this.isAfter(n, a)
            : !this.isBefore(n, a)) &&
          (")" === i[1] ? this.isBefore(s, a) : !this.isAfter(s, a))
        );
      }
      function Fi(e, t) {
        var a,
          i = S(e) ? e : Za(e);
        return (
          !(!this.isValid() || !i.isValid()) &&
          ("millisecond" === (t = ie(t) || "millisecond")
            ? this.valueOf() === i.valueOf()
            : ((a = i.valueOf()),
              this.clone().startOf(t).valueOf() <= a &&
                a <= this.clone().endOf(t).valueOf()))
        );
      }
      function Wi(e, t) {
        return this.isSame(e, t) || this.isAfter(e, t);
      }
      function Zi(e, t) {
        return this.isSame(e, t) || this.isBefore(e, t);
      }
      function qi(e, t, a) {
        var i, n, s;
        if (!this.isValid()) return NaN;
        if (!(i = hi(e, this)).isValid()) return NaN;
        switch (((n = 6e4 * (i.utcOffset() - this.utcOffset())), (t = ie(t)))) {
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
        return a ? s : ue(s);
      }
      function Ki(e, t) {
        if (e.date() < t.date()) return -Ki(t, e);
        var a = 12 * (t.year() - e.year()) + (t.month() - e.month()),
          i = e.clone().add(a, "months");
        return (
          -(
            a +
            (t - i < 0
              ? (t - i) / (i - e.clone().add(a - 1, "months"))
              : (t - i) / (e.clone().add(a + 1, "months") - i))
          ) || 0
        );
      }
      function Ji() {
        return this.clone()
          .locale("en")
          .format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
      }
      function Qi(e) {
        if (!this.isValid()) return null;
        var t = !0 !== e,
          a = t ? this.clone().utc() : this;
        return a.year() < 0 || a.year() > 9999
          ? Y(
              a,
              t
                ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]"
                : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"
            )
          : O(Date.prototype.toISOString)
          ? t
            ? this.toDate().toISOString()
            : new Date(this.valueOf() + 60 * this.utcOffset() * 1e3)
                .toISOString()
                .replace("Z", Y(a, "Z"))
          : Y(
              a,
              t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
            );
      }
      function en() {
        if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
        var e,
          t,
          a,
          i,
          n = "moment",
          s = "";
        return (
          this.isLocal() ||
            ((n = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone"),
            (s = "Z")),
          (e = "[" + n + '("]'),
          (t = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY"),
          (a = "-MM-DD[T]HH:mm:ss.SSS"),
          (i = s + '[")]'),
          this.format(e + t + a + i)
        );
      }
      function tn(e) {
        e || (e = this.isUtc() ? i.defaultFormatUtc : i.defaultFormat);
        var t = Y(this, e);
        return this.localeData().postformat(t);
      }
      function an(e, t) {
        return this.isValid() && ((S(e) && e.isValid()) || Za(e).isValid())
          ? Mi({ to: this, from: e }).locale(this.locale()).humanize(!t)
          : this.localeData().invalidDate();
      }
      function nn(e) {
        return this.from(Za(), e);
      }
      function sn(e, t) {
        return this.isValid() && ((S(e) && e.isValid()) || Za(e).isValid())
          ? Mi({ from: this, to: e }).locale(this.locale()).humanize(!t)
          : this.localeData().invalidDate();
      }
      function rn(e) {
        return this.to(Za(), e);
      }
      function on(e) {
        var t;
        return void 0 === e
          ? this._locale._abbr
          : (null != (t = va(e)) && (this._locale = t), this);
      }
      (i.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ"),
        (i.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]");
      var ln = A(
        "moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",
        function (e) {
          return void 0 === e ? this.localeData() : this.locale(e);
        }
      );
      function un() {
        return this._locale;
      }
      var dn = 1e3,
        cn = 60 * dn,
        hn = 60 * cn,
        pn = 3506328 * hn;
      function mn(e, t) {
        return ((e % t) + t) % t;
      }
      function gn(e, t, a) {
        return e < 100 && e >= 0
          ? new Date(e + 400, t, a) - pn
          : new Date(e, t, a).valueOf();
      }
      function fn(e, t, a) {
        return e < 100 && e >= 0
          ? Date.UTC(e + 400, t, a) - pn
          : Date.UTC(e, t, a);
      }
      function vn(e) {
        var t, a;
        if (void 0 === (e = ie(e)) || "millisecond" === e || !this.isValid())
          return this;
        switch (((a = this._isUTC ? fn : gn), e)) {
          case "year":
            t = a(this.year(), 0, 1);
            break;
          case "quarter":
            t = a(this.year(), this.month() - (this.month() % 3), 1);
            break;
          case "month":
            t = a(this.year(), this.month(), 1);
            break;
          case "week":
            t = a(this.year(), this.month(), this.date() - this.weekday());
            break;
          case "isoWeek":
            t = a(
              this.year(),
              this.month(),
              this.date() - (this.isoWeekday() - 1)
            );
            break;
          case "day":
          case "date":
            t = a(this.year(), this.month(), this.date());
            break;
          case "hour":
            (t = this._d.valueOf()),
              (t -= mn(t + (this._isUTC ? 0 : this.utcOffset() * cn), hn));
            break;
          case "minute":
            (t = this._d.valueOf()), (t -= mn(t, cn));
            break;
          case "second":
            (t = this._d.valueOf()), (t -= mn(t, dn));
        }
        return this._d.setTime(t), i.updateOffset(this, !0), this;
      }
      function bn(e) {
        var t, a;
        if (void 0 === (e = ie(e)) || "millisecond" === e || !this.isValid())
          return this;
        switch (((a = this._isUTC ? fn : gn), e)) {
          case "year":
            t = a(this.year() + 1, 0, 1) - 1;
            break;
          case "quarter":
            t = a(this.year(), this.month() - (this.month() % 3) + 3, 1) - 1;
            break;
          case "month":
            t = a(this.year(), this.month() + 1, 1) - 1;
            break;
          case "week":
            t =
              a(this.year(), this.month(), this.date() - this.weekday() + 7) -
              1;
            break;
          case "isoWeek":
            t =
              a(
                this.year(),
                this.month(),
                this.date() - (this.isoWeekday() - 1) + 7
              ) - 1;
            break;
          case "day":
          case "date":
            t = a(this.year(), this.month(), this.date() + 1) - 1;
            break;
          case "hour":
            (t = this._d.valueOf()),
              (t +=
                hn - mn(t + (this._isUTC ? 0 : this.utcOffset() * cn), hn) - 1);
            break;
          case "minute":
            (t = this._d.valueOf()), (t += cn - mn(t, cn) - 1);
            break;
          case "second":
            (t = this._d.valueOf()), (t += dn - mn(t, dn) - 1);
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
        return [
          e.year(),
          e.month(),
          e.date(),
          e.hour(),
          e.minute(),
          e.second(),
          e.millisecond(),
        ];
      }
      function Sn() {
        var e = this;
        return {
          years: e.year(),
          months: e.month(),
          date: e.date(),
          hours: e.hours(),
          minutes: e.minutes(),
          seconds: e.seconds(),
          milliseconds: e.milliseconds(),
        };
      }
      function En() {
        return this.isValid() ? this.toISOString() : null;
      }
      function An() {
        return v(this);
      }
      function $n() {
        return p({}, f(this));
      }
      function Mn() {
        return f(this).overflow;
      }
      function Tn() {
        return {
          input: this._i,
          format: this._f,
          locale: this._locale,
          isUTC: this._isUTC,
          strict: this._strict,
        };
      }
      function On(e, t) {
        var a,
          n,
          s,
          r = this._eras || va("en")._eras;
        for (a = 0, n = r.length; a < n; ++a)
          switch (
            ("string" == typeof r[a].since &&
              ((s = i(r[a].since).startOf("day")), (r[a].since = s.valueOf())),
            typeof r[a].until)
          ) {
            case "undefined":
              r[a].until = 1 / 0;
              break;
            case "string":
              (s = i(r[a].until).startOf("day").valueOf()),
                (r[a].until = s.valueOf());
          }
        return r;
      }
      function xn(e, t, a) {
        var i,
          n,
          s,
          r,
          o,
          l = this.eras();
        for (e = e.toUpperCase(), i = 0, n = l.length; i < n; ++i)
          if (
            ((s = l[i].name.toUpperCase()),
            (r = l[i].abbr.toUpperCase()),
            (o = l[i].narrow.toUpperCase()),
            a)
          )
            switch (t) {
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
            }
          else if ([s, r, o].indexOf(e) >= 0) return l[i];
      }
      function zn(e, t) {
        var a = e.since <= e.until ? 1 : -1;
        return void 0 === t
          ? i(e.since).year()
          : i(e.since).year() + (t - e.offset) * a;
      }
      function Dn() {
        var e,
          t,
          a,
          i = this.localeData().eras();
        for (e = 0, t = i.length; e < t; ++e) {
          if (
            ((a = this.clone().startOf("day").valueOf()),
            i[e].since <= a && a <= i[e].until)
          )
            return i[e].name;
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
          if (
            ((a = this.clone().startOf("day").valueOf()),
            i[e].since <= a && a <= i[e].until)
          )
            return i[e].narrow;
          if (i[e].until <= a && a <= i[e].since) return i[e].narrow;
        }
        return "";
      }
      function Pn() {
        var e,
          t,
          a,
          i = this.localeData().eras();
        for (e = 0, t = i.length; e < t; ++e) {
          if (
            ((a = this.clone().startOf("day").valueOf()),
            i[e].since <= a && a <= i[e].until)
          )
            return i[e].abbr;
          if (i[e].until <= a && a <= i[e].since) return i[e].abbr;
        }
        return "";
      }
      function Nn() {
        var e,
          t,
          a,
          n,
          s = this.localeData().eras();
        for (e = 0, t = s.length; e < t; ++e)
          if (
            ((a = s[e].since <= s[e].until ? 1 : -1),
            (n = this.clone().startOf("day").valueOf()),
            (s[e].since <= n && n <= s[e].until) ||
              (s[e].until <= n && n <= s[e].since))
          )
            return (this.year() - i(s[e].since).year()) * a + s[e].offset;
        return this.year();
      }
      function Cn(e) {
        return (
          o(this, "_erasNameRegex") || Yn.call(this),
          e ? this._erasNameRegex : this._erasRegex
        );
      }
      function jn(e) {
        return (
          o(this, "_erasAbbrRegex") || Yn.call(this),
          e ? this._erasAbbrRegex : this._erasRegex
        );
      }
      function Ln(e) {
        return (
          o(this, "_erasNarrowRegex") || Yn.call(this),
          e ? this._erasNarrowRegex : this._erasRegex
        );
      }
      function Bn(e, t) {
        return t.erasAbbrRegex(e);
      }
      function In(e, t) {
        return t.erasNameRegex(e);
      }
      function Rn(e, t) {
        return t.erasNarrowRegex(e);
      }
      function Un(e, t) {
        return t._eraYearOrdinalRegex || Te;
      }
      function Yn() {
        var e,
          t,
          a = [],
          i = [],
          n = [],
          s = [],
          r = this.eras();
        for (e = 0, t = r.length; e < t; ++e)
          i.push(je(r[e].name)),
            a.push(je(r[e].abbr)),
            n.push(je(r[e].narrow)),
            s.push(je(r[e].name)),
            s.push(je(r[e].abbr)),
            s.push(je(r[e].narrow));
        (this._erasRegex = new RegExp("^(" + s.join("|") + ")", "i")),
          (this._erasNameRegex = new RegExp("^(" + i.join("|") + ")", "i")),
          (this._erasAbbrRegex = new RegExp("^(" + a.join("|") + ")", "i")),
          (this._erasNarrowRegex = new RegExp("^(" + n.join("|") + ")", "i"));
      }
      function Vn(e, t) {
        I(0, [e, e.length], 0, t);
      }
      function Gn(e) {
        return Xn.call(
          this,
          e,
          this.week(),
          this.weekday(),
          this.localeData()._week.dow,
          this.localeData()._week.doy
        );
      }
      function Fn(e) {
        return Xn.call(this, e, this.isoWeek(), this.isoWeekday(), 1, 4);
      }
      function Wn() {
        return St(this.year(), 1, 4);
      }
      function Zn() {
        return St(this.isoWeekYear(), 1, 4);
      }
      function qn() {
        var e = this.localeData()._week;
        return St(this.year(), e.dow, e.doy);
      }
      function Kn() {
        var e = this.localeData()._week;
        return St(this.weekYear(), e.dow, e.doy);
      }
      function Xn(e, t, a, i, n) {
        var s;
        return null == e
          ? kt(this, i, n).year
          : (t > (s = St(e, i, n)) && (t = s), Jn.call(this, e, t, a, i, n));
      }
      function Jn(e, t, a, i, n) {
        var s = wt(e, t, a, i, n),
          r = yt(s.year, 0, s.dayOfYear);
        return (
          this.year(r.getUTCFullYear()),
          this.month(r.getUTCMonth()),
          this.date(r.getUTCDate()),
          this
        );
      }
      function Qn(e) {
        return null == e
          ? Math.ceil((this.month() + 1) / 3)
          : this.month(3 * (e - 1) + (this.month() % 3));
      }
      I("N", 0, 0, "eraAbbr"),
        I("NN", 0, 0, "eraAbbr"),
        I("NNN", 0, 0, "eraAbbr"),
        I("NNNN", 0, 0, "eraName"),
        I("NNNNN", 0, 0, "eraNarrow"),
        I("y", ["y", 1], "yo", "eraYear"),
        I("y", ["yy", 2], 0, "eraYear"),
        I("y", ["yyy", 3], 0, "eraYear"),
        I("y", ["yyyy", 4], 0, "eraYear"),
        Pe("N", Bn),
        Pe("NN", Bn),
        Pe("NNN", Bn),
        Pe("NNNN", In),
        Pe("NNNNN", Rn),
        Be(["N", "NN", "NNN", "NNNN", "NNNNN"], function (e, t, a, i) {
          var n = a._locale.erasParse(e, i, a._strict);
          n ? (f(a).era = n) : (f(a).invalidEra = e);
        }),
        Pe("y", Te),
        Pe("yy", Te),
        Pe("yyy", Te),
        Pe("yyyy", Te),
        Pe("yo", Un),
        Be(["y", "yy", "yyy", "yyyy"], Ye),
        Be(["yo"], function (e, t, a, i) {
          var n;
          a._locale._eraYearOrdinalRegex &&
            (n = e.match(a._locale._eraYearOrdinalRegex)),
            a._locale.eraYearOrdinalParse
              ? (t[Ye] = a._locale.eraYearOrdinalParse(e, n))
              : (t[Ye] = parseInt(e, 10));
        }),
        I(0, ["gg", 2], 0, function () {
          return this.weekYear() % 100;
        }),
        I(0, ["GG", 2], 0, function () {
          return this.isoWeekYear() % 100;
        }),
        Vn("gggg", "weekYear"),
        Vn("ggggg", "weekYear"),
        Vn("GGGG", "isoWeekYear"),
        Vn("GGGGG", "isoWeekYear"),
        ae("weekYear", "gg"),
        ae("isoWeekYear", "GG"),
        re("weekYear", 1),
        re("isoWeekYear", 1),
        Pe("G", Oe),
        Pe("g", Oe),
        Pe("GG", ke, be),
        Pe("gg", ke, be),
        Pe("GGGG", $e, _e),
        Pe("gggg", $e, _e),
        Pe("GGGGG", Me, we),
        Pe("ggggg", Me, we),
        Ie(["gggg", "ggggg", "GGGG", "GGGGG"], function (e, t, a, i) {
          t[i.substr(0, 2)] = de(e);
        }),
        Ie(["gg", "GG"], function (e, t, a, n) {
          t[n] = i.parseTwoDigitYear(e);
        }),
        I("Q", 0, "Qo", "quarter"),
        ae("quarter", "Q"),
        re("quarter", 7),
        Pe("Q", ve),
        Be("Q", function (e, t) {
          t[Ve] = 3 * (de(e) - 1);
        }),
        I("D", ["DD", 2], "Do", "date"),
        ae("date", "D"),
        re("date", 9),
        Pe("D", ke),
        Pe("DD", ke, be),
        Pe("Do", function (e, t) {
          return e
            ? t._dayOfMonthOrdinalParse || t._ordinalParse
            : t._dayOfMonthOrdinalParseLenient;
        }),
        Be(["D", "DD"], Ge),
        Be("Do", function (e, t) {
          t[Ge] = de(e.match(ke)[0]);
        });
      var es = ce("Date", !0);
      function ts(e) {
        var t =
          Math.round(
            (this.clone().startOf("day") - this.clone().startOf("year")) / 864e5
          ) + 1;
        return null == e ? t : this.add(e - t, "d");
      }
      I("DDD", ["DDDD", 3], "DDDo", "dayOfYear"),
        ae("dayOfYear", "DDD"),
        re("dayOfYear", 4),
        Pe("DDD", Ae),
        Pe("DDDD", ye),
        Be(["DDD", "DDDD"], function (e, t, a) {
          a._dayOfYear = de(e);
        }),
        I("m", ["mm", 2], 0, "minute"),
        ae("minute", "m"),
        re("minute", 14),
        Pe("m", ke),
        Pe("mm", ke, be),
        Be(["m", "mm"], We);
      var as = ce("Minutes", !1);
      I("s", ["ss", 2], 0, "second"),
        ae("second", "s"),
        re("second", 15),
        Pe("s", ke),
        Pe("ss", ke, be),
        Be(["s", "ss"], Ze);
      var is,
        ns,
        ss = ce("Seconds", !1);
      for (
        I("S", 0, 0, function () {
          return ~~(this.millisecond() / 100);
        }),
          I(0, ["SS", 2], 0, function () {
            return ~~(this.millisecond() / 10);
          }),
          I(0, ["SSS", 3], 0, "millisecond"),
          I(0, ["SSSS", 4], 0, function () {
            return 10 * this.millisecond();
          }),
          I(0, ["SSSSS", 5], 0, function () {
            return 100 * this.millisecond();
          }),
          I(0, ["SSSSSS", 6], 0, function () {
            return 1e3 * this.millisecond();
          }),
          I(0, ["SSSSSSS", 7], 0, function () {
            return 1e4 * this.millisecond();
          }),
          I(0, ["SSSSSSSS", 8], 0, function () {
            return 1e5 * this.millisecond();
          }),
          I(0, ["SSSSSSSSS", 9], 0, function () {
            return 1e6 * this.millisecond();
          }),
          ae("millisecond", "ms"),
          re("millisecond", 16),
          Pe("S", Ae, ve),
          Pe("SS", Ae, be),
          Pe("SSS", Ae, ye),
          is = "SSSS";
        is.length <= 9;
        is += "S"
      )
        Pe(is, Te);
      function rs(e, t) {
        t[qe] = de(1e3 * ("0." + e));
      }
      for (is = "S"; is.length <= 9; is += "S") Be(is, rs);
      function os() {
        return this._isUTC ? "UTC" : "";
      }
      function ls() {
        return this._isUTC ? "Coordinated Universal Time" : "";
      }
      (ns = ce("Milliseconds", !1)),
        I("z", 0, 0, "zoneAbbr"),
        I("zz", 0, 0, "zoneName");
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
      (us.add = Hi),
        (us.calendar = Ri),
        (us.clone = Ui),
        (us.diff = qi),
        (us.endOf = bn),
        (us.format = tn),
        (us.from = an),
        (us.fromNow = nn),
        (us.to = sn),
        (us.toNow = rn),
        (us.get = me),
        (us.invalidAt = Mn),
        (us.isAfter = Yi),
        (us.isBefore = Vi),
        (us.isBetween = Gi),
        (us.isSame = Fi),
        (us.isSameOrAfter = Wi),
        (us.isSameOrBefore = Zi),
        (us.isValid = An),
        (us.lang = ln),
        (us.locale = on),
        (us.localeData = un),
        (us.max = Ka),
        (us.min = qa),
        (us.parsingFlags = $n),
        (us.set = ge),
        (us.startOf = vn),
        (us.subtract = Pi),
        (us.toArray = kn),
        (us.toObject = Sn),
        (us.toDate = wn),
        (us.toISOString = Qi),
        (us.inspect = en),
        "undefined" != typeof Symbol &&
          null != Symbol.for &&
          (us[Symbol.for("nodejs.util.inspect.custom")] = function () {
            return "Moment<" + this.format() + ">";
          }),
        (us.toJSON = En),
        (us.toString = Ji),
        (us.unix = _n),
        (us.valueOf = yn),
        (us.creationData = Tn),
        (us.eraName = Dn),
        (us.eraNarrow = Hn),
        (us.eraAbbr = Pn),
        (us.eraYear = Nn),
        (us.year = ft),
        (us.isLeapYear = vt),
        (us.weekYear = Gn),
        (us.isoWeekYear = Fn),
        (us.quarter = us.quarters = Qn),
        (us.month = dt),
        (us.daysInMonth = ct),
        (us.week = us.weeks = Tt),
        (us.isoWeek = us.isoWeeks = Ot),
        (us.weeksInYear = qn),
        (us.weeksInWeekYear = Kn),
        (us.isoWeeksInYear = Wn),
        (us.isoWeeksInISOWeekYear = Zn),
        (us.date = es),
        (us.day = us.days = Vt),
        (us.weekday = Gt),
        (us.isoWeekday = Ft),
        (us.dayOfYear = ts),
        (us.hour = us.hours = ia),
        (us.minute = us.minutes = as),
        (us.second = us.seconds = ss),
        (us.millisecond = us.milliseconds = ns),
        (us.utcOffset = mi),
        (us.utc = fi),
        (us.local = vi),
        (us.parseZone = bi),
        (us.hasAlignedHourOffset = yi),
        (us.isDST = _i),
        (us.isLocal = ki),
        (us.isUtcOffset = Si),
        (us.isUtc = Ei),
        (us.isUTC = Ei),
        (us.zoneAbbr = os),
        (us.zoneName = ls),
        (us.dates = A("dates accessor is deprecated. Use date instead.", es)),
        (us.months = A("months accessor is deprecated. Use month instead", dt)),
        (us.years = A("years accessor is deprecated. Use year instead", ft)),
        (us.zone = A(
          "moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",
          gi
        )),
        (us.isDSTShifted = A(
          "isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",
          wi
        ));
      var ps = D.prototype;
      function ms(e, t, a, i) {
        var n = va(),
          s = m().set(i, t);
        return n[a](s, e);
      }
      function gs(e, t, a) {
        if ((d(e) && ((t = e), (e = void 0)), (e = e || ""), null != t))
          return ms(e, t, a, "month");
        var i,
          n = [];
        for (i = 0; i < 12; i++) n[i] = ms(e, i, a, "month");
        return n;
      }
      function fs(e, t, a, i) {
        "boolean" == typeof e
          ? (d(t) && ((a = t), (t = void 0)), (t = t || ""))
          : ((a = t = e),
            (e = !1),
            d(t) && ((a = t), (t = void 0)),
            (t = t || ""));
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
      (ps.calendar = P),
        (ps.longDateFormat = F),
        (ps.invalidDate = Z),
        (ps.ordinal = X),
        (ps.preparse = hs),
        (ps.postformat = hs),
        (ps.relativeTime = Q),
        (ps.pastFuture = ee),
        (ps.set = x),
        (ps.eras = On),
        (ps.erasParse = xn),
        (ps.erasConvertYear = zn),
        (ps.erasAbbrRegex = jn),
        (ps.erasNameRegex = Cn),
        (ps.erasNarrowRegex = Ln),
        (ps.months = st),
        (ps.monthsShort = rt),
        (ps.monthsParse = lt),
        (ps.monthsRegex = pt),
        (ps.monthsShortRegex = ht),
        (ps.week = Et),
        (ps.firstDayOfYear = Mt),
        (ps.firstDayOfWeek = $t),
        (ps.weekdays = Bt),
        (ps.weekdaysMin = Rt),
        (ps.weekdaysShort = It),
        (ps.weekdaysParse = Yt),
        (ps.weekdaysRegex = Wt),
        (ps.weekdaysShortRegex = Zt),
        (ps.weekdaysMinRegex = qt),
        (ps.isPM = ta),
        (ps.meridiem = na),
        ma("en", {
          eras: [
            {
              since: "0001-01-01",
              until: 1 / 0,
              offset: 1,
              name: "Anno Domini",
              narrow: "AD",
              abbr: "AD",
            },
            {
              since: "0000-12-31",
              until: -1 / 0,
              offset: 1,
              name: "Before Christ",
              narrow: "BC",
              abbr: "BC",
            },
          ],
          dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
          ordinal: function (e) {
            var t = e % 10;
            return (
              e +
              (1 === de((e % 100) / 10)
                ? "th"
                : 1 === t
                ? "st"
                : 2 === t
                ? "nd"
                : 3 === t
                ? "rd"
                : "th")
            );
          },
        }),
        (i.lang = A(
          "moment.lang is deprecated. Use moment.locale instead.",
          ma
        )),
        (i.langData = A(
          "moment.langData is deprecated. Use moment.localeData instead.",
          va
        ));
      var ks = Math.abs;
      function Ss() {
        var e = this._data;
        return (
          (this._milliseconds = ks(this._milliseconds)),
          (this._days = ks(this._days)),
          (this._months = ks(this._months)),
          (e.milliseconds = ks(e.milliseconds)),
          (e.seconds = ks(e.seconds)),
          (e.minutes = ks(e.minutes)),
          (e.hours = ks(e.hours)),
          (e.months = ks(e.months)),
          (e.years = ks(e.years)),
          this
        );
      }
      function Es(e, t, a, i) {
        var n = Mi(t, a);
        return (
          (e._milliseconds += i * n._milliseconds),
          (e._days += i * n._days),
          (e._months += i * n._months),
          e._bubble()
        );
      }
      function As(e, t) {
        return Es(this, e, t, 1);
      }
      function $s(e, t) {
        return Es(this, e, t, -1);
      }
      function Ms(e) {
        return e < 0 ? Math.floor(e) : Math.ceil(e);
      }
      function Ts() {
        var e,
          t,
          a,
          i,
          n,
          s = this._milliseconds,
          r = this._days,
          o = this._months,
          l = this._data;
        return (
          (s >= 0 && r >= 0 && o >= 0) ||
            (s <= 0 && r <= 0 && o <= 0) ||
            ((s += 864e5 * Ms(xs(o) + r)), (r = 0), (o = 0)),
          (l.milliseconds = s % 1e3),
          (e = ue(s / 1e3)),
          (l.seconds = e % 60),
          (t = ue(e / 60)),
          (l.minutes = t % 60),
          (a = ue(t / 60)),
          (l.hours = a % 24),
          (r += ue(a / 24)),
          (o += n = ue(Os(r))),
          (r -= Ms(xs(n))),
          (i = ue(o / 12)),
          (o %= 12),
          (l.days = r),
          (l.months = o),
          (l.years = i),
          this
        );
      }
      function Os(e) {
        return (4800 * e) / 146097;
      }
      function xs(e) {
        return (146097 * e) / 4800;
      }
      function zs(e) {
        if (!this.isValid()) return NaN;
        var t,
          a,
          i = this._milliseconds;
        if ("month" === (e = ie(e)) || "quarter" === e || "year" === e)
          switch (
            ((t = this._days + i / 864e5), (a = this._months + Os(t)), e)
          ) {
            case "month":
              return a;
            case "quarter":
              return a / 3;
            case "year":
              return a / 12;
          }
        else
          switch (((t = this._days + Math.round(xs(this._months))), e)) {
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
      function Ds() {
        return this.isValid()
          ? this._milliseconds +
              864e5 * this._days +
              (this._months % 12) * 2592e6 +
              31536e6 * de(this._months / 12)
          : NaN;
      }
      function Hs(e) {
        return function () {
          return this.as(e);
        };
      }
      var Ps = Hs("ms"),
        Ns = Hs("s"),
        Cs = Hs("m"),
        js = Hs("h"),
        Ls = Hs("d"),
        Bs = Hs("w"),
        Is = Hs("M"),
        Rs = Hs("Q"),
        Us = Hs("y");
      function Ys() {
        return Mi(this);
      }
      function Vs(e) {
        return (e = ie(e)), this.isValid() ? this[e + "s"]() : NaN;
      }
      function Gs(e) {
        return function () {
          return this.isValid() ? this._data[e] : NaN;
        };
      }
      var Fs = Gs("milliseconds"),
        Ws = Gs("seconds"),
        Zs = Gs("minutes"),
        qs = Gs("hours"),
        Ks = Gs("days"),
        Xs = Gs("months"),
        Js = Gs("years");
      function Qs() {
        return ue(this.days() / 7);
      }
      var er = Math.round,
        tr = { ss: 44, s: 45, m: 45, h: 22, d: 26, w: null, M: 11 };
      function ar(e, t, a, i, n) {
        return n.relativeTime(t || 1, !!a, e, i);
      }
      function ir(e, t, a, i) {
        var n = Mi(e).abs(),
          s = er(n.as("s")),
          r = er(n.as("m")),
          o = er(n.as("h")),
          l = er(n.as("d")),
          u = er(n.as("M")),
          d = er(n.as("w")),
          c = er(n.as("y")),
          h =
            (s <= a.ss && ["s", s]) ||
            (s < a.s && ["ss", s]) ||
            (r <= 1 && ["m"]) ||
            (r < a.m && ["mm", r]) ||
            (o <= 1 && ["h"]) ||
            (o < a.h && ["hh", o]) ||
            (l <= 1 && ["d"]) ||
            (l < a.d && ["dd", l]);
        return (
          null != a.w && (h = h || (d <= 1 && ["w"]) || (d < a.w && ["ww", d])),
          ((h = h ||
            (u <= 1 && ["M"]) ||
            (u < a.M && ["MM", u]) ||
            (c <= 1 && ["y"]) || ["yy", c])[2] = t),
          (h[3] = +e > 0),
          (h[4] = i),
          ar.apply(null, h)
        );
      }
      function nr(e) {
        return void 0 === e ? er : "function" == typeof e && ((er = e), !0);
      }
      function sr(e, t) {
        return (
          void 0 !== tr[e] &&
          (void 0 === t
            ? tr[e]
            : ((tr[e] = t), "s" === e && (tr.ss = t - 1), !0))
        );
      }
      function rr(e, t) {
        if (!this.isValid()) return this.localeData().invalidDate();
        var a,
          i,
          n = !1,
          s = tr;
        return (
          "object" == typeof e && ((t = e), (e = !1)),
          "boolean" == typeof e && (n = e),
          "object" == typeof t &&
            ((s = Object.assign({}, tr, t)),
            null != t.s && null == t.ss && (s.ss = t.s - 1)),
          (i = ir(this, !n, s, (a = this.localeData()))),
          n && (i = a.pastFuture(+this, i)),
          a.postformat(i)
        );
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
        return c
          ? ((e = ue(l / 60)),
            (t = ue(e / 60)),
            (l %= 60),
            (e %= 60),
            (a = ue(d / 12)),
            (d %= 12),
            (i = l ? l.toFixed(3).replace(/\.?0+$/, "") : ""),
            (n = c < 0 ? "-" : ""),
            (s = lr(this._months) !== lr(c) ? "-" : ""),
            (r = lr(this._days) !== lr(c) ? "-" : ""),
            (o = lr(this._milliseconds) !== lr(c) ? "-" : ""),
            n +
              "P" +
              (a ? s + a + "Y" : "") +
              (d ? s + d + "M" : "") +
              (u ? r + u + "D" : "") +
              (t || e || l ? "T" : "") +
              (t ? o + t + "H" : "") +
              (e ? o + e + "M" : "") +
              (l ? o + i + "S" : ""))
          : "P0D";
      }
      var dr = si.prototype;
      return (
        (dr.isValid = ii),
        (dr.abs = Ss),
        (dr.add = As),
        (dr.subtract = $s),
        (dr.as = zs),
        (dr.asMilliseconds = Ps),
        (dr.asSeconds = Ns),
        (dr.asMinutes = Cs),
        (dr.asHours = js),
        (dr.asDays = Ls),
        (dr.asWeeks = Bs),
        (dr.asMonths = Is),
        (dr.asQuarters = Rs),
        (dr.asYears = Us),
        (dr.valueOf = Ds),
        (dr._bubble = Ts),
        (dr.clone = Ys),
        (dr.get = Vs),
        (dr.milliseconds = Fs),
        (dr.seconds = Ws),
        (dr.minutes = Zs),
        (dr.hours = qs),
        (dr.days = Ks),
        (dr.weeks = Qs),
        (dr.months = Xs),
        (dr.years = Js),
        (dr.humanize = rr),
        (dr.toISOString = ur),
        (dr.toString = ur),
        (dr.toJSON = ur),
        (dr.locale = on),
        (dr.localeData = un),
        (dr.toIsoString = A(
          "toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",
          ur
        )),
        (dr.lang = ln),
        I("X", 0, 0, "unix"),
        I("x", 0, 0, "valueOf"),
        Pe("x", Oe),
        Pe("X", De),
        Be("X", function (e, t, a) {
          a._d = new Date(1e3 * parseFloat(e));
        }),
        Be("x", function (e, t, a) {
          a._d = new Date(de(e));
        }),
        //! moment.js
        (i.version = "2.29.4"),
        n(Za),
        (i.fn = us),
        (i.min = Ja),
        (i.max = Qa),
        (i.now = ei),
        (i.utc = m),
        (i.unix = ds),
        (i.months = vs),
        (i.isDate = c),
        (i.locale = ma),
        (i.invalid = b),
        (i.duration = Mi),
        (i.isMoment = S),
        (i.weekdays = ys),
        (i.parseZone = cs),
        (i.localeData = va),
        (i.isDuration = ri),
        (i.monthsShort = bs),
        (i.weekdaysMin = ws),
        (i.defineLocale = ga),
        (i.updateLocale = fa),
        (i.locales = ba),
        (i.weekdaysShort = _s),
        (i.normalizeUnits = ie),
        (i.relativeTimeRounding = nr),
        (i.relativeTimeThreshold = sr),
        (i.calendarFormat = Ii),
        (i.prototype = us),
        (i.HTML5_FMT = {
          DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
          DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
          DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
          DATE: "YYYY-MM-DD",
          TIME: "HH:mm",
          TIME_SECONDS: "HH:mm:ss",
          TIME_MS: "HH:mm:ss.SSS",
          WEEK: "GGGG-[W]WW",
          MONTH: "YYYY-MM",
        }),
        i
      );
    })();
  })(Ji);
  var Qi = Ki(Ji.exports);
  let en = class extends tt(le) {
    constructor() {
      super(...arguments),
        (this.zones = []),
        (this.modules = []),
        (this.mappings = []);
    }
    firstUpdated() {
      (async () => {
        await ye();
      })();
    }
    hassSubscribe() {
      return (
        this._fetchData(),
        [
          this.hass.connection.subscribeMessage(() => this._fetchData(), {
            type: _e + "_config_updated",
          }),
        ]
      );
    }
    async _fetchData() {
      this.hass &&
        ((this.config = await Xe(this.hass)),
        (this.zones = await Je(this.hass)),
        (this.modules = await Qe(this.hass)),
        (this.mappings = await et(this.hass)));
    }
    handleCalculateAllZones() {
      this.hass &&
        this.hass.callApi("POST", _e + "/zones", { calculate_all: !0 });
    }
    handleUpdateAllZones() {
      this.hass && this.hass.callApi("POST", _e + "/zones", { update_all: !0 });
    }
    handleResetAllBuckets() {
      this.hass &&
        this.hass.callApi("POST", _e + "/zones", { reset_all_buckets: !0 });
    }
    handleClearAllWeatherdata() {
      this.hass &&
        this.hass.callApi("POST", _e + "/zones", { clear_all_weatherdata: !0 });
    }
    handleAddZone() {
      const e = {
        id: this.zones.length + 1,
        name: this.nameInput.value,
        size: parseFloat(this.sizeInput.value),
        throughput: parseFloat(this.throughputInput.value),
        state: qi.Automatic,
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
      };
      (this.zones = [...this.zones, e]), this.saveToHA(e);
    }
    handleEditZone(e, t) {
      this.hass &&
        ((this.zones = Object.values(this.zones).map((a, i) =>
          i === e ? t : a
        )),
        this.saveToHA(t));
    }
    handleRemoveZone(e, t) {
      if (!this.hass) return;
      const a = Object.values(this.zones).at(t);
      var i, n;
      a &&
        ((this.zones = this.zones.filter((e, a) => a !== t)),
        this.hass &&
          ((i = this.hass),
          (n = a.id.toString()),
          i.callApi("POST", _e + "/zones", { id: n, remove: !0 })));
    }
    handleCalculateZone(e) {
      const t = Object.values(this.zones).at(e);
      var a, i;
      t &&
        this.hass &&
        ((a = this.hass),
        (i = t.id.toString()),
        a.callApi("POST", _e + "/zones", {
          id: i,
          calculate: !0,
          override_cache: !0,
        }));
    }
    handleUpdateZone(e) {
      const t = Object.values(this.zones).at(e);
      var a, i;
      t &&
        this.hass &&
        ((a = this.hass),
        (i = t.id.toString()),
        a.callApi("POST", _e + "/zones", { id: i, update: !0 }));
    }
    saveToHA(e) {
      var t, a;
      this.hass &&
        ((t = this.hass), (a = e), t.callApi("POST", _e + "/zones", a));
    }
    renderTheOptions(e, t) {
      if (this.hass) {
        let a = Y`<option value="" ?selected=${void 0 === t}">---${Ci(
          "common.labels.select",
          this.hass.language
        )}---</option>`;
        return (
          Object.entries(e).map(
            ([e, i]) =>
              (a = Y`${a}
            <option
              value="${i.id}"
              ?selected="${t === i.id}"
            >
              ${i.id}: ${i.name}
            </option>`)
          ),
          a
        );
      }
      return Y``;
    }
    renderZone(e, t) {
      if (this.hass) {
        let a, i, n;
        null != e.explanation &&
          e.explanation.length > 0 &&
          (a = Y`<svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          id="showcalcresults${t}"
          @click="${() => this.toggleExplanation(t)}"
        >
          <title>
            ${Ci("panels.zones.actions.information", this.hass.language)}
          </title>
          <path fill="#404040" d="${Wi}" />
        </svg>`),
          e.state === qi.Automatic &&
            (i = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleCalculateZone(t)}"
        >
          <title>
            ${Ci("panels.zones.actions.calculate", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V8H17V4H7M7,10V12H9V10H7M11,10V12H13V10H11M15,10V12H17V10H15M7,14V16H9V14H7M11,14V16H13V14H11M15,14V16H17V14H15M7,18V20H9V18H7M11,18V20H13V18H11M15,18V20H17V18H15Z"}" />
        </svg>`),
          e.state === qi.Automatic &&
            (n = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() => this.handleUpdateZone(t)}"
        >
          <title>
            ${Ci("panels.zones.actions.update", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z"}" />
        </svg>`);
        const s = Y` <svg
          style="width:24px;height:24px"
          viewBox="0 0 24 24"
          @click="${() =>
            this.handleEditZone(
              t,
              Object.assign(Object.assign({}, e), { [Ke]: 0 })
            )}"}"
        >
          <title>
            ${Ci("panels.zones.actions.reset-bucket", this.hass.language)}
          </title>
          <path fill="#404040" d="${"M12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36M13 19C13 15.82 15.47 13.23 18.6 13L20 6H21V4H3V6H4L4.76 9.79L10.71 6.36C11.09 6.13 11.53 6 12 6C13.38 6 14.5 7.12 14.5 8.5C14.5 9.44 14 10.26 13.21 10.69L5.79 14.97L7 21H13.35C13.13 20.37 13 19.7 13 19M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z"}" />
        </svg>`;
        let r;
        return (
          null != e.mapping &&
            ((r = this.mappings.filter((t) => t.id === e.mapping)[0]),
            null != r &&
              null != r.data_last_updated &&
              ((e.last_updated = r.data_last_updated),
              null != r.data && (e.number_of_data_points = r.data.length))),
          Y`
        <ha-card header="${e.name}">
          <div class="card-content">
            <label for="last_calculated${t}"
              >${Ci("panels.zones.labels.last_calculated", this.hass.language)}:
              ${
                e.last_calculated
                  ? Qi(e.last_calculated).format("YYYY-MM-DD HH:mm:ss")
                  : "-"
              }</label
            >
          </div>
          <div class="card-content">
            <label for="last_updated${t}"
              >${Ci(
                "panels.zones.labels.data-last-updated",
                this.hass.language
              )}:
              ${
                e.last_updated
                  ? Qi(e.last_updated).format("YYYY-MM-DD HH:mm:ss")
                  : "-"
              }</label
            >
          </div>
          <div class="card-content">
            <label for="last_updated${t}"
              >${Ci(
                "panels.zones.labels.data-number-of-data-points",
                this.hass.language
              )}:
              ${e.number_of_data_points}</label
            >
          </div>
          <div class="card-content">
            <label for="name${t}"
              >${Ci("panels.zones.labels.name", this.hass.language)}:</label
            >
            <input
              id="name${t}"
              type="text"
              .value="${e.name}"
              @input="${(a) =>
                this.handleEditZone(
                  t,
                  Object.assign(Object.assign({}, e), { name: a.target.value })
                )}"
            />
            <div class="zoneline">
              <label for="size${t}"
                >${Ci("panels.zones.labels.size", this.hass.language)}
                (${Yi(this.config, We)}):</label
              >
              <input class="shortinput" id="size${t}" type="number""
              .value="${e.size}"
              @input="${(a) =>
                this.handleEditZone(
                  t,
                  Object.assign(Object.assign({}, e), {
                    [We]: parseFloat(a.target.value),
                  })
                )}"
              />
            </div>
            <div class="zoneline">
              <label for="throughput${t}"
                >${Ci("panels.zones.labels.throughput", this.hass.language)}
                (${Yi(this.config, Ze)}):</label
              >
              <input
                class="shortinput"
                id="throughput${t}"
                type="number"
                .value="${e.throughput}"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      [Ze]: parseFloat(a.target.value),
                    })
                  )}"
              />
            </div>
            <div class="zoneline">
              <label for="state${t}"
                >${Ci("panels.zones.labels.state", this.hass.language)}:</label
              >
              <select
                required
                id="state${t}"
                @change="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      state: a.target.value,
                      [qe]: 0,
                    })
                  )}"
              >
                <option
                  value="${qi.Automatic}"
                  ?selected="${e.state === qi.Automatic}"
                >
                  ${Ci(
                    "panels.zones.labels.states.automatic",
                    this.hass.language
                  )}
                </option>
                <option
                  value="${qi.Disabled}"
                  ?selected="${e.state === qi.Disabled}"
                >
                  ${Ci(
                    "panels.zones.labels.states.disabled",
                    this.hass.language
                  )}
                </option>
                <option
                  value="${qi.Manual}"
                  ?selected="${e.state === qi.Manual}"
                >
                  ${Ci("panels.zones.labels.states.manual", this.hass.language)}
                </option>
              </select>
              <label for="module${t}"
                >${Ci("common.labels.module", this.hass.language)}:</label
              >

              <select
                id="module${t}"
                @change="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      module: parseInt(a.target.value),
                    })
                  )}"
              >
                ${this.renderTheOptions(this.modules, e.module)}
              </select>
              <label for="module${t}"
                >${Ci(
                  "panels.zones.labels.mapping",
                  this.hass.language
                )}:</label
              >

              <select
                id="mapping${t}"
                @change="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      mapping: parseInt(a.target.value),
                    })
                  )}"
              >
                ${this.renderTheOptions(this.mappings, e.mapping)}
              </select>
            </div>
            <div class="zoneline">
              <label for="bucket${t}"
                >${Ci("panels.zones.labels.bucket", this.hass.language)}
                (${Yi(this.config, Ke)}):</label
              >
              <input
                class="shortinput"
                id="bucket${t}"
                type="number"
                .value="${Number(e.bucket).toFixed(1)}"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      [Ke]: parseFloat(a.target.value),
                    })
                  )}"
              />
              <label for="maximum-bucket${t}"
                >${Ci("panels.zones.labels.maximum-bucket", this.hass.language)}
                (${Yi(this.config, Ke)}):</label
              >
              <input
                class="shortinput"
                id="maximum-bucket${t}"
                type="number"
                .value="${Number(e.maximum_bucket).toFixed(1)}"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      maximum_bucket: parseFloat(a.target.value),
                    })
                  )}"
              />
              <br />
              <label for="lead_time${t}"
                >${Ci("panels.zones.labels.lead-time", this.hass.language)}
                (s):</label
              >
              <input
                class="shortinput"
                id="lead_time${t}"
                type="number"
                .value="${e.lead_time}"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      lead_time: parseInt(a.target.value, 10),
                    })
                  )}"
              />
              <label for="maximum-duration${t}"
                >${Ci(
                  "panels.zones.labels.maximum-duration",
                  this.hass.language
                )}
                (s):</label
              >
              <input
                class="shortinput"
                id="maximum-duration${t}"
                type="number"
                .value="${e.maximum_duration}"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      maximum_duration: parseInt(a.target.value, 10),
                    })
                  )}"
              />
            </div>
            <div class="zoneline">
              <label for="multiplier${t}"
                >${Ci(
                  "panels.zones.labels.multiplier",
                  this.hass.language
                )}:</label
              >
              <input
                class="shortinput"
                id="multiplier${t}"
                type="number"
                .value="${e.multiplier}"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      multiplier: parseFloat(a.target.value),
                    })
                  )}"
              />
              <label for="duration${t}"
                >${Ci("panels.zones.labels.duration", this.hass.language)}
                (${"s"}):</label
              >
              <input
                class="shortinput"
                id="duration${t}"
                type="number"
                .value="${e.duration}"
                ?readonly="${
                  e.state === qi.Disabled || e.state === qi.Automatic
                }"
                @input="${(a) =>
                  this.handleEditZone(
                    t,
                    Object.assign(Object.assign({}, e), {
                      [qe]: parseInt(a.target.value, 10),
                    })
                  )}"
              />
            </div>
            <div class="zoneline">
              ${n} ${i}
              ${a} ${s}
              <svg
                style="width:24px;height:24px"
                viewBox="0 0 24 24"
                id="deleteZone${t}"
                @click="${(e) => this.handleRemoveZone(e, t)}"
              >
                <title>
                  ${Ci("common.actions.delete", this.hass.language)}
                </title>
                <path fill="#404040" d="${Fi}" />
              </svg>
            </div>
            <div class="zoneline">
              <div>
                <label class="hidden" id="calcresults${t}"
                  >${Ii("<br/>" + e.explanation)}</label
                >
              </div>
            </div>
          </div>
        </ha-card>
      `
        );
      }
      return Y``;
    }
    toggleExplanation(e) {
      var t;
      const a =
        null === (t = this.shadowRoot) || void 0 === t
          ? void 0
          : t.querySelector("#calcresults" + e);
      a &&
        ("hidden" != a.className
          ? (a.className = "hidden")
          : (a.className = "explanation"));
    }
    render() {
      return this.hass && this.config
        ? Y`
        <ha-card header="${Ci("panels.zones.title", this.hass.language)}">
          <div class="card-content">
            ${Ci("panels.zones.description", this.hass.language)}
          </div>
        </ha-card>
          <ha-card header="${Ci(
            "panels.zones.cards.add-zone.header",
            this.hass.language
          )}">
            <div class="card-content">
              <div class="zoneline"><label for="nameInput">${Ci(
                "panels.zones.labels.name",
                this.hass.language
              )}:</label>
              <input id="nameInput" type="text"/>
              </div>
              <div class="zoneline">
              <label for="sizeInput">${Ci(
                "panels.zones.labels.size",
                this.hass.language
              )} (${Yi(this.config, We)}):</label>
              <input class="shortinput" id="sizeInput" type="number"/>
              </div>
              <div class="zoneline">
              <label for="throughputInput">${Ci(
                "panels.zones.labels.throughput",
                this.hass.language
              )} (${Yi(this.config, Ze)}):</label>
              <input id="throughputInput" class="shortinput" type="number"/>
              </div>
              <div class="zoneline">
              <button @click="${this.handleAddZone}">${Ci(
            "panels.zones.cards.add-zone.actions.add",
            this.hass.language
          )}</button>
              </div>
            </div>
            </ha-card>
            <ha-card header="${Ci(
              "panels.zones.cards.zone-actions.header",
              this.hass.language
            )}">
            <div class="card-content">
                <button @click="${this.handleUpdateAllZones}">${Ci(
            "panels.zones.cards.zone-actions.actions.update-all",
            this.hass.language
          )}</button>
                <button @click="${this.handleCalculateAllZones}">${Ci(
            "panels.zones.cards.zone-actions.actions.calculate-all",
            this.hass.language
          )}</button>
                <button @click="${this.handleResetAllBuckets}">${Ci(
            "panels.zones.cards.zone-actions.actions.reset-all-buckets",
            this.hass.language
          )}</button>
      <button @click="${this.handleClearAllWeatherdata}">${Ci(
            "panels.zones.cards.zone-actions.actions.clear-all-weatherdata",
            this.hass.language
          )}</button>
            </div>
          </ha-card>

          ${Object.entries(this.zones).map(([e, t]) =>
            this.renderZone(t, parseInt(e))
          )}
        </ha-card>
      `
        : Y``;
    }
    static get styles() {
      return c`
      ${Gi}
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
    `;
    }
  };
  n([pe()], en.prototype, "config", void 0),
    n([pe({ type: Array })], en.prototype, "zones", void 0),
    n([pe({ type: Array })], en.prototype, "modules", void 0),
    n([pe({ type: Array })], en.prototype, "mappings", void 0),
    n([me("#nameInput")], en.prototype, "nameInput", void 0),
    n([me("#sizeInput")], en.prototype, "sizeInput", void 0),
    n([me("#throughputInput")], en.prototype, "throughputInput", void 0),
    (en = n([de("smart-irrigation-view-zones")], en));
  let tn = class extends tt(le) {
    constructor() {
      super(...arguments),
        (this.zones = []),
        (this.modules = []),
        (this.allmodules = []);
    }
    firstUpdated() {
      (async () => {
        await ye();
      })();
    }
    hassSubscribe() {
      return (
        this._fetchData(),
        [
          this.hass.connection.subscribeMessage(() => this._fetchData(), {
            type: _e + "_config_updated",
          }),
        ]
      );
    }
    async _fetchData() {
      var e;
      this.hass &&
        ((this.config = await Xe(this.hass)),
        (this.zones = await Je(this.hass)),
        (this.modules = await Qe(this.hass)),
        (this.allmodules = await ((e = this.hass),
        e.callWS({ type: _e + "/allmodules" }))));
    }
    handleAddModule() {
      const e = this.allmodules.filter(
        (e) => e.name == this.moduleInput.selectedOptions[0].text
      )[0];
      if (!e) return;
      const t = {
        id: this.modules.length + 1,
        name: this.moduleInput.selectedOptions[0].text,
        description: e.description,
        config: e.config,
        schema: e.schema,
      };
      (this.modules = [...this.modules, t]), this.saveToHA(t);
    }
    handleRemoveModule(e, t) {
      var a, i;
      ((this.modules = this.modules.filter((e, a) => a !== t)), this.hass) &&
        ((a = this.hass),
        (i = t.toString()),
        a.callApi("POST", _e + "/modules", { id: i, remove: !0 }));
    }
    saveToHA(e) {
      var t, a;
      this.hass &&
        ((t = this.hass),
        (a = e),
        t.callApi("POST", _e + "/modules", a),
        this._fetchData());
    }
    renderModule(e, t) {
      if (this.hass) {
        const a = this.zones.filter((t) => t.module === e.id).length;
        return Y`
        <ha-card header="${e.id}: ${e.name}">
          <div class="card-content">
            <div class="moduledescription${t}">${e.description}</div>
            <div class="moduleconfig">
              <label class="subheader"
                >${Ci(
                  "panels.modules.cards.module.labels.configuration",
                  this.hass.language
                )}
                (*
                ${Ci(
                  "panels.modules.cards.module.labels.required",
                  this.hass.language
                )})</label
              >
              ${
                e.schema
                  ? Object.entries(e.schema).map(([e]) =>
                      this.renderConfig(t, e)
                    )
                  : null
              }
            </div>
            ${
              a
                ? Y` ${Ci(
                    "panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",
                    this.hass.language
                  )}`
                : Y` <svg
                  style="width:24px;height:24px"
                  viewBox="0 0 24 24"
                  id="deleteZone${t}"
                  @click="${(e) => this.handleRemoveModule(e, t)}"
                >
                  <title>
                    ${Ci("common.actions.delete", this.hass.language)}
                  </title>
                  <path fill="#404040" d="${Fi}" />
                </svg>`
            }
          </div>
        </ha-card>
      `;
      }
      return Y``;
    }
    renderConfig(e, t) {
      const a = Object.values(this.modules).at(e);
      if (!a || !this.hass) return;
      const i = a.schema[t],
        n = i.name,
        s = (function (e) {
          if (e)
            return (
              (e = e.replace("_", " ")).charAt(0).toUpperCase() + e.slice(1)
            );
        })(n);
      let r = "";
      null == a.config && (a.config = []), n in a.config && (r = a.config[n]);
      let o = Y`<label for="${n + e}"
      >${s} </label
    `;
      if ("boolean" == i.type)
        o = Y`${o}<input
          type="checkbox"
          id="${n + e}"
          .checked=${r}
          @input="${(t) =>
            this.handleEditConfig(
              e,
              Object.assign(Object.assign({}, a), {
                config: Object.assign(Object.assign({}, a.config), {
                  [n]: t.target.checked,
                }),
              })
            )}"
        />`;
      else if ("float" == i.type || "integer" == i.type)
        o = Y`${o}<input
          type="number"
          class="shortinput"
          id="${i.name + e}"
          .value="${a.config[i.name]}"
          @input="${(t) =>
            this.handleEditConfig(
              e,
              Object.assign(Object.assign({}, a), {
                config: Object.assign(Object.assign({}, a.config), {
                  [n]: t.target.value,
                }),
              })
            )}"
        />`;
      else if ("string" == i.type)
        o = Y`${o}<input
          type="text"
          id="${n + e}"
          .value="${r}"
          @input="${(t) =>
            this.handleEditConfig(
              e,
              Object.assign(Object.assign({}, a), {
                config: Object.assign(Object.assign({}, a.config), {
                  [n]: t.target.value,
                }),
              })
            )}"
        />`;
      else if ("select" == i.type) {
        const t = this.hass.language;
        o = Y`${o}<select
          id="${n + e}"
          @change="${(t) =>
            this.handleEditConfig(
              e,
              Object.assign(Object.assign({}, a), {
                config: Object.assign(Object.assign({}, a.config), {
                  [n]: t.target.value,
                }),
              })
            )}"
        >
          ${Object.entries(i.options).map(
            ([e, a]) => Y`<option
                value="${Ui(a, 0)}"
                ?selected="${r === Ui(a, 0)}"
              >
                ${Ci(
                  "panels.modules.cards.module.translated-options." + Ui(a, 1),
                  t
                )}
              </option>`
          )}
        </select>`;
      }
      return (
        i.required && (o = Y`${o} *`),
        (o = Y`<div class="schemaline">${o}</div>`),
        o
      );
    }
    handleEditConfig(e, t) {
      (this.modules = Object.values(this.modules).map((a, i) =>
        i === e ? t : a
      )),
        this.saveToHA(t);
    }
    renderOption(e, t) {
      return this.hass ? Y`<option value="${e}>${t}</option>` : Y``;
    }
    render() {
      return this.hass
        ? Y`
        <ha-card
          header="${Ci("panels.modules.title", this.hass.language)}"
        >
          <div class="card-content">
            ${Ci("panels.modules.description", this.hass.language)}
          </div>
        </ha-card>
        <ha-card
          header="${Ci(
            "panels.modules.cards.add-module.header",
            this.hass.language
          )}"
        >
          <div class="card-content">
            <label for="moduleInput"
              >${Ci("common.labels.module", this.hass.language)}:</label
            >
            <select id="moduleInput">
              ${Object.entries(this.allmodules).map(
                ([e, t]) => Y`<option value="${t.id}">${t.name}</option>`
              )}
            </select>
            <button @click="${this.handleAddModule}">
              ${Ci(
                "panels.modules.cards.add-module.actions.add",
                this.hass.language
              )}
            </button>
          </div>
        </ha-card>

        ${Object.entries(this.modules).map(([e, t]) =>
          this.renderModule(t, parseInt(e))
        )}
      `
        : Y``;
    }
    static get styles() {
      return c`
      ${Gi}
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
    `;
    }
  };
  n([pe()], tn.prototype, "config", void 0),
    n([pe({ type: Array })], tn.prototype, "zones", void 0),
    n([pe({ type: Array })], tn.prototype, "modules", void 0),
    n([pe({ type: Array })], tn.prototype, "allmodules", void 0),
    n([me("#moduleInput")], tn.prototype, "moduleInput", void 0),
    (tn = n([de("smart-irrigation-view-modules")], tn));
  let an = class extends tt(le) {
    constructor() {
      super(...arguments), (this.zones = []), (this.mappings = []);
    }
    firstUpdated() {
      (async () => {
        await ye();
      })();
    }
    hassSubscribe() {
      return (
        this._fetchData(),
        [
          this.hass.connection.subscribeMessage(() => this._fetchData(), {
            type: _e + "_config_updated",
          }),
        ]
      );
    }
    async _fetchData() {
      this.hass &&
        ((this.config = await Xe(this.hass)),
        (this.zones = await Je(this.hass)),
        (this.mappings = await et(this.hass)));
    }
    handleAddMapping() {
      const e = {
          [$e]: "",
          [Me]: "",
          [Te]: "",
          [Oe]: "",
          [xe]: "",
          [ze]: "",
          [De]: "",
          [He]: "",
        },
        t = {
          id: this.mappings.length + 1,
          name: this.mappingNameInput.value,
          mappings: e,
        };
      (this.mappings = [...this.mappings, t]),
        this.saveToHA(t),
        this._fetchData();
    }
    handleRemoveMapping(e, t) {
      var a, i;
      ((this.mappings = this.mappings.filter((e, a) => a !== t)), this.hass) &&
        ((a = this.hass),
        (i = t.toString()),
        a.callApi("POST", _e + "/mappings", { id: i, remove: !0 }));
    }
    handleEditMapping(e, t) {
      (this.mappings = Object.values(this.mappings).map((a, i) =>
        i === e ? t : a
      )),
        this.saveToHA(t);
    }
    saveToHA(e) {
      if (!this.hass) return;
      let t = !0;
      for (const a in e.mappings)
        if (
          null != e.mappings[a].sensorentity &&
          "" != e.mappings[a].sensorentity &&
          (console.log(e.mappings[a].sensorentity),
          !(e.mappings[a].sensorentity in this.hass.states))
        ) {
          (t = !1),
            Vi(
              {
                body: {
                  message: Ci(
                    "panels.mappings.cards.mapping.errors.source_does_not_exist",
                    this.hass.language
                  ),
                },
                error: Ci(
                  "panels.mappings.cards.mapping.errors.invalid_source",
                  this.hass.language
                ),
              },
              this.shadowRoot.querySelector("ha-card")
            );
          break;
        }
      var a, i;
      t && ((a = this.hass), (i = e), a.callApi("POST", _e + "/mappings", i));
    }
    renderMapping(e, t) {
      if (this.hass) {
        const a = this.zones.filter((t) => t.mapping === e.id).length;
        return Y`
        <ha-card header="${e.id}: ${e.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${e.id}"
              >${Ci(
                "panels.mappings.labels.mapping-name",
                this.hass.language
              )}:</label
            >
            <input
              id="name${e.id}"
              type="text"
              .value="${e.name}"
              @input="${(a) =>
                this.handleEditMapping(
                  t,
                  Object.assign(Object.assign({}, e), { name: a.target.value })
                )}"
            />
            ${Object.entries(e.mappings).map(([e]) =>
              this.renderMappingSetting(t, e)
            )}
            ${
              a
                ? Y`${Ci(
                    "panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",
                    this.hass.language
                  )}`
                : Y` <svg
                    style="width:24px;height:24px"
                    viewBox="0 0 24 24"
                    id="deleteZone${t}"
                    @click="${(e) => this.handleRemoveMapping(e, t)}"
                  >
                    <title>
                      ${Ci("common.actions.delete", this.hass.language)}
                    </title>
                    <path fill="#404040" d="${Fi}" />
                  </svg>`
            }
          </div>
        </ha-card>
      `;
      }
      return Y``;
    }
    renderMappingSetting(e, t) {
      var a, i, n;
      const s = Object.values(this.mappings).at(e);
      if (!s || !this.hass) return;
      const r = s.mappings[t];
      let o = Y`<div class="mappingsettingname">
      <label for="${t + e}"
        >${Ci(
          "panels.mappings.cards.mapping.items." + t.toLowerCase(),
          this.hass.language
        )}
      </label>
    </div> `;
      if (
        ((o = Y`${o}
      <div class="mappingsettingline">
        <label for="${t + e + Re}"
          >${Ci(
            "panels.mappings.cards.mapping.source",
            this.hass.language
          )}:</label
        >
      </div>`),
        t == Me || t == ze)
      )
        o = Y`${o}
        <input
          type="radio"
          id="${t + e + Ie}"
          value="${Ie}"
          name="${t + e + Re}"
          ?checked="${r[Re] === Ie}"
          @change="${(a) =>
            this.handleEditMapping(
              e,
              Object.assign(Object.assign({}, s), {
                mappings: Object.assign(Object.assign({}, s.mappings), {
                  [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                    source: a.target.value,
                  }),
                }),
              })
            )}"
        /><label for="${t + e + Ie}"
          >${Ci(
            "panels.mappings.cards.mapping.sources.none",
            this.hass.language
          )}</label
        > `;
      else {
        let l = "";
        (null === (a = this.config) || void 0 === a
          ? void 0
          : a.use_weather_service) || (l = "strikethrough"),
          (o = Y`${o}
        <input
          type="radio"
          id="${t + e + Pe}"
          value="${Pe}"
          name="${t + e + Re}"
          ?enabled="${
            null === (i = this.config) || void 0 === i
              ? void 0
              : i.use_weather_service
          }"
          ?checked="${
            (null === (n = this.config) || void 0 === n
              ? void 0
              : n.use_weather_service) && r[Re] === Pe
          }"
          @change="${(a) =>
            this.handleEditMapping(
              e,
              Object.assign(Object.assign({}, s), {
                mappings: Object.assign(Object.assign({}, s.mappings), {
                  [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                    source: a.target.value,
                  }),
                }),
              })
            )}"
        /><label
          class="${l}"
          for="${t + e + Pe}"
          >${Ci(
            "panels.mappings.cards.mapping.sources.weather_service",
            this.hass.language
          )}</label
        >`);
      }
      return (
        (o = Y`${o}
        <input
          type="radio"
          id="${t + e + Ne}"
          value="${Ne}"
          name="${t + e + Re}"
          ?checked="${r[Re] === Ne}"
          @change="${(a) =>
            this.handleEditMapping(
              e,
              Object.assign(Object.assign({}, s), {
                mappings: Object.assign(Object.assign({}, s.mappings), {
                  [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                    [Re]: a.target.value,
                  }),
                }),
              })
            )}"
        /><label for="${t + e + Ne}"
          >${Ci(
            "panels.mappings.cards.mapping.sources.sensor",
            this.hass.language
          )}</label
        >
      </div>`),
        (o = Y`${o}
      <input
        type="radio"
        id="${t + e + Ce}"
        value="${Ce}"
        name="${t + e + Re}"
        ?checked="${r[Re] === Ce}"
        @change="${(a) =>
          this.handleEditMapping(
            e,
            Object.assign(Object.assign({}, s), {
              mappings: Object.assign(Object.assign({}, s.mappings), {
                [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                  [Re]: a.target.value,
                }),
              }),
            })
          )}"
      /><label for="${t + e + Ce}"
        >${Ci(
          "panels.mappings.cards.mapping.sources.static",
          this.hass.language
        )}</label
      >
    </div>`),
        r[Re] == Ne &&
          (o = Y`${o}
        <div class="mappingsettingline">
          <label for="${t + e + Ue}"
            >${Ci(
              "panels.mappings.cards.mapping.sensor-entity",
              this.hass.language
            )}:</label
          >
          <input
            type="text"
            id="${t + e + Ue}"
            value="${r[Ue]}"
            @change="${(a) =>
              this.handleEditMapping(
                e,
                Object.assign(Object.assign({}, s), {
                  mappings: Object.assign(Object.assign({}, s.mappings), {
                    [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                      [Ue]: a.target.value,
                    }),
                  }),
                })
              )}"
          />
        </div>`),
        r[Re] == Ce &&
          (o = Y`${o}
        <div class="mappingsettingline">
          <label for="${t + e + Ye}"
            >${Ci(
              "panels.mappings.cards.mapping.static_value",
              this.hass.language
            )}:</label
          >
          <input
            type="text"
            id="${t + e + Ye}"
            value="${r[Ye]}"
            @input="${(a) =>
              this.handleEditMapping(
                e,
                Object.assign(Object.assign({}, s), {
                  mappings: Object.assign(Object.assign({}, s.mappings), {
                    [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                      [Ye]: a.target.value,
                    }),
                  }),
                })
              )}"
          />
        </div>`),
        (r[Re] != Ne && r[Re] != Ce) ||
          ((o = Y`${o}
        <div class="mappingsettingline">
          <label for="${t + e + Ve}"
            >${Ci(
              "panels.mappings.cards.mapping.input-units",
              this.hass.language
            )}:</label
          >
          <select
            type="text"
            id="${t + e + Ve}"
            @change="${(a) =>
              this.handleEditMapping(
                e,
                Object.assign(Object.assign({}, s), {
                  mappings: Object.assign(Object.assign({}, s.mappings), {
                    [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                      [Ve]: a.target.value,
                    }),
                  }),
                })
              )}"
          >
            ${this.renderUnitOptionsForMapping(t, r)}
          </select>
        </div>`),
          t == xe &&
            (o = Y`${o}
          <div class="mappingsettingline">
            <label for="${t + e + je}"
              >${Ci(
                "panels.mappings.cards.mapping.pressure-type",
                this.hass.language
              )}:</label
            >
            <select
              type="text"
              id="${t + e + je}"
              @change="${(a) =>
                this.handleEditMapping(
                  e,
                  Object.assign(Object.assign({}, s), {
                    mappings: Object.assign(Object.assign({}, s.mappings), {
                      [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                        [je]: a.target.value,
                      }),
                    }),
                  })
                )}"
            >
              ${this.renderPressureTypes(t, r)}
            </select>
          </div>`)),
        r[Re] == Ne &&
          (o = Y`${o}
        <div class="mappingsettingline">
          <label for="${t + e + Ge}"
            >${Ci(
              "panels.mappings.cards.mapping.sensor-aggregate-use-the",
              this.hass.language
            )}
          </label>
          <select
            type="text"
            id="${t + e + Ge}"
            @change="${(a) =>
              this.handleEditMapping(
                e,
                Object.assign(Object.assign({}, s), {
                  mappings: Object.assign(Object.assign({}, s.mappings), {
                    [t]: Object.assign(Object.assign({}, s.mappings[t]), {
                      [Ge]: a.target.value,
                    }),
                  }),
                })
              )}"
          >
            ${this.renderAggregateOptionsForMapping(t, r)}
          </select>
          <label for="${t + e + Ge}"
            >${Ci(
              "panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",
              this.hass.language
            )}</label
          >
        </div>`),
        (o = Y`<div class="mappingline">${o}</div>`),
        o
      );
    }
    renderAggregateOptionsForMapping(e, t) {
      if (this.hass && this.config) {
        let a = Y``,
          i = "average";
        e === Oe && (i = "maximum"), t[Ge] && (i = t[Ge]);
        for (const e of Fe) {
          const t = this.renderAggregateOption(e, i);
          a = Y`${a}${t}`;
        }
        return a;
      }
      return Y``;
    }
    renderAggregateOption(e, t) {
      if (this.hass && this.config) {
        return Y`<option value="${e}" ?selected="${e === t}">
        ${Ci(
          "panels.mappings.cards.mapping.aggregates." + e,
          this.hass.language
        )}
      </option>`;
      }
      return Y``;
    }
    renderPressureTypes(e, t) {
      if (this.hass && this.config) {
        let e = Y``;
        const a = t[je];
        return (
          (e = Y`${e}
        <option
          value="${Le}"
          ?selected="${a === Le}"
        >
          ${Ci(
            "panels.mappings.cards.mapping.pressure_types." + Le,
            this.hass.language
          )}
        </option>
        <option
          value="${Be}"
          ?selected="${a === Be}"
        >
          ${Ci(
            "panels.mappings.cards.mapping.pressure_types." + Be,
            this.hass.language
          )}
        </option>`),
          e
        );
      }
      return Y``;
    }
    renderUnitOptionsForMapping(e, t) {
      if (this.hass && this.config) {
        const a = (function (e) {
          switch (e) {
            case $e:
            case De:
              return [
                { unit: "°C", system: Ae },
                { unit: "°F", system: Ee },
              ];
            case Oe:
            case Me:
              return [
                { unit: "mm", system: Ae },
                { unit: "in", system: Ee },
              ];
            case Te:
              return [{ unit: "%", system: [Ae, Ee] }];
            case xe:
              return [
                { unit: "millibar", system: Ae },
                { unit: "hPa", system: Ae },
                { unit: "psi", system: Ee },
                { unit: "inch Hg", system: Ee },
              ];
            case He:
              return [
                { unit: "km/h", system: Ae },
                { unit: "meter/s", system: Ae },
                { unit: "mile/h", system: Ee },
              ];
            case ze:
              return [
                { unit: "W/m2", system: Ae },
                { unit: "MJ/day/m2", system: Ae },
                { unit: "W/sq ft", system: Ee },
                { unit: "MJ/day/sq ft", system: Ee },
              ];
            default:
              return [];
          }
        })(e);
        let i = Y``,
          n = t[Ve];
        const s = this.config.units;
        return (
          t[Ve] ||
            a.forEach(function (e) {
              "string" == typeof e.system
                ? s == e.system && (n = e.unit)
                : e.system.forEach(function (t) {
                    s == t.system && (n = e.unit);
                  });
            }),
          a.forEach(function (e) {
            i = Y`${i}
          <option value="${e.unit}" ?selected="${n === e.unit}">
            ${e.unit}
          </option>`;
          }),
          i
        );
      }
      return Y``;
    }
    render() {
      return this.hass
        ? Y`
        <ha-card
          header="${Ci("panels.mappings.title", this.hass.language)}"
        >
          <div class="card-content">
            ${Ci("panels.mappings.description", this.hass.language)}.
          </div>
        </ha-card>
        <ha-card
          header="${Ci(
            "panels.mappings.cards.add-mapping.header",
            this.hass.language
          )}"
        >
          <div class="card-content">
            <label for="mappingNameInput"
              >${Ci(
                "panels.mappings.labels.mapping-name",
                this.hass.language
              )}:</label
            >
            <input id="mappingNameInput" type="text" />
            <button @click="${this.handleAddMapping}">
              ${Ci(
                "panels.mappings.cards.add-mapping.actions.add",
                this.hass.language
              )}
            </button>
          </div>
        </ha-card>

        ${Object.entries(this.mappings).map(([e, t]) =>
          this.renderMapping(t, parseInt(e))
        )}
      `
        : Y``;
    }
    static get styles() {
      return c`
      ${Gi}
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
    `;
    }
  };
  n([pe()], an.prototype, "config", void 0),
    n([pe({ type: Array })], an.prototype, "zones", void 0),
    n([pe({ type: Array })], an.prototype, "mappings", void 0),
    n([me("#mappingNameInput")], an.prototype, "mappingNameInput", void 0),
    (an = n([de("smart-irrigation-view-mappings")], an));
  const nn = () => {
    const e = (e) => {
        let t = {};
        for (let a = 0; a < e.length; a += 2) {
          const i = e[a],
            n = a < e.length ? e[a + 1] : void 0;
          t = Object.assign(Object.assign({}, t), { [i]: n });
        }
        return t;
      },
      t = window.location.pathname.split("/");
    let a = { page: t[2] || "general", params: {} };
    if (t.length > 3) {
      let i = t.slice(3);
      if (t.includes("filter")) {
        const t = i.findIndex((e) => "filter" == e),
          n = i.slice(t + 1);
        (i = i.slice(0, t)),
          (a = Object.assign(Object.assign({}, a), { filter: e(n) }));
      }
      i.length &&
        (i.length % 2 &&
          (a = Object.assign(Object.assign({}, a), { subpage: i.shift() })),
        i.length &&
          (a = Object.assign(Object.assign({}, a), { params: e(i) })));
    }
    return a;
  };
  (e.SmartIrrigationPanel = class extends le {
    async firstUpdated() {
      window.addEventListener("location-changed", () => {
        window.location.pathname.includes("smart-irrigation") &&
          this.requestUpdate();
      }),
        await ye(),
        this.requestUpdate();
    }
    render() {
      if (!customElements.get("ha-panel-config")) return Y` loading... `;
      const e = nn();
      return Y`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${Ci("title", this.hass.language)}</div>
          <div class="version">${"v2024.7.2"}</div>
        </div>

        <ha-tabs
          scrollable
          attr-for-selected="page-name"
          .selected=${e.page}
          @iron-activate=${this.handlePageSelected}
        >
          <paper-tab page-name="general">
            ${Ci("panels.general.title", this.hass.language)}
          </paper-tab>
          <paper-tab page-name="zones">
            ${Ci("panels.zones.title", this.hass.language)}
          </paper-tab>
          <paper-tab page-name="modules"
            >${Ci("panels.modules.title", this.hass.language)}</paper-tab
          >
          <paper-tab page-name="mappings"
            >${Ci("panels.mappings.title", this.hass.language)}</paper-tab
          >
          <paper-tab page-name="help"
            >${Ci("panels.help.title", this.hass.language)}</paper-tab
          >
        </ha-tabs>
      </div>
      <div class="view">${this.getView(e)}</div>
    `;
    }
    getView(e) {
      switch (e.page) {
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
          header="${Ci(
            "panels.help.cards.how-to-get-help.title",
            this.hass.language
          )}"
        >
          <div class="card-content">
          ${Ci(
            "panels.help.cards.how-to-get-help.first-read-the",
            this.hass.language
          )} <a href="https://github.com/jeroenterheerdt/HAsmartirrigation/wiki"
              >${Ci(
                "panels.help.cards.how-to-get-help.wiki",
                this.hass.language
              )}</a
            >. ${Ci(
              "panels.help.cards.how-to-get-help.if-you-still-need-help",
              this.hass.language
            )}
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >${Ci(
                "panels.help.cards.how-to-get-help.community-forum",
                this.hass.language
              )}</a
            >
            ${Ci(
              "panels.help.cards.how-to-get-help.or-open-a",
              this.hass.language
            )}
            <a
              href="https://github.com/jeroenterheerdt/HAsmartirrigation/issues"
              >${Ci(
                "panels.help.cards.how-to-get-help.github-issue",
                this.hass.language
              )}</a
            >
            (${Ci(
              "panels.help.cards.how-to-get-help.english-only",
              this.hass.language
            )}).
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
      const t = e.detail.item.getAttribute("page-name");
      t !== nn().page
        ? (!(function (e, t, a) {
            void 0 === a && (a = !1),
              a
                ? history.replaceState(null, "", t)
                : history.pushState(null, "", t),
              be(window, "location-changed", { replace: a });
          })(
            0,
            ((e, ...t) => {
              let a = { page: e, params: {} };
              t.forEach((e) => {
                "string" == typeof e
                  ? (a = Object.assign(Object.assign({}, a), { subpage: e }))
                  : "params" in e
                  ? (a = Object.assign(Object.assign({}, a), {
                      params: e.params,
                    }))
                  : "filter" in e &&
                    (a = Object.assign(Object.assign({}, a), {
                      filter: e.filter,
                    }));
              });
              const i = (e) => {
                let t = Object.keys(e);
                (t = t.filter((t) => e[t])), t.sort();
                let a = "";
                return (
                  t.forEach((t) => {
                    const i = e[t];
                    a = a.length ? `${a}/${t}/${i}` : `${t}/${i}`;
                  }),
                  a
                );
              };
              let n = `/${_e}/${a.page}`;
              return (
                a.subpage && (n = `${n}/${a.subpage}`),
                i(a.params).length && (n = `${n}/${i(a.params)}`),
                a.filter && (n = `${n}/filter/${i(a.filter)}`),
                n
              );
            })(t)
          ),
          this.requestUpdate())
        : scrollTo(0, 0);
    }
    static get styles() {
      return c`
      ${Gi} :host {
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
    `;
    }
  }),
    n([pe()], e.SmartIrrigationPanel.prototype, "hass", void 0),
    n(
      [pe({ type: Boolean, reflect: !0 })],
      e.SmartIrrigationPanel.prototype,
      "narrow",
      void 0
    ),
    (e.SmartIrrigationPanel = n(
      [de("smart-irrigation")],
      e.SmartIrrigationPanel
    ));
  let sn = class extends le {
    async showDialog(e) {
      (this._params = e), await this.updateComplete;
    }
    async closeDialog() {
      this._params = void 0;
    }
    render() {
      return this._params
        ? Y`
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
    `
        : Y``;
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
  n([pe({ attribute: !1 })], sn.prototype, "hass", void 0),
    n(
      [
        (function (e) {
          return pe({ ...e, state: !0 });
        })(),
        /**
         * @license
         * Copyright 2017 Google LLC
         * SPDX-License-Identifier: BSD-3-Clause
         */
      ],
      sn.prototype,
      "_params",
      void 0
    ),
    (sn = n([de("error-dialog")], sn));
  var rn = Object.freeze({
    __proto__: null,
    get ErrorDialog() {
      return sn;
    },
  });
  Object.defineProperty(e, "__esModule", { value: !0 });
})({});
