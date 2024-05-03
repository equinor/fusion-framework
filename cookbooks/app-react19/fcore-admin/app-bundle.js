var bp = { exports: {} }, W = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Yu = Symbol.for("react.transitional.element"), hy = Symbol.for("react.portal"), fy = Symbol.for("react.fragment"), py = Symbol.for("react.strict_mode"), gy = Symbol.for("react.profiler"), my = Symbol.for("react.consumer"), vy = Symbol.for("react.context"), yy = Symbol.for("react.forward_ref"), Ey = Symbol.for("react.suspense"), _y = Symbol.for("react.memo"), Rp = Symbol.for("react.lazy"), ch = Symbol.iterator;
function Cy(t) {
  return t === null || typeof t != "object" ? null : (t = ch && t[ch] || t["@@iterator"], typeof t == "function" ? t : null);
}
var Ip = {
  isMounted: function() {
    return !1;
  },
  enqueueForceUpdate: function() {
  },
  enqueueReplaceState: function() {
  },
  enqueueSetState: function() {
  }
}, Np = Object.assign, Op = {};
function Fi(t, e, n) {
  this.props = t, this.context = e, this.refs = Op, this.updater = n || Ip;
}
Fi.prototype.isReactComponent = {};
Fi.prototype.setState = function(t, e) {
  if (typeof t != "object" && typeof t != "function" && t != null)
    throw Error(
      "takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, t, e, "setState");
};
Fi.prototype.forceUpdate = function(t) {
  this.updater.enqueueForceUpdate(this, t, "forceUpdate");
};
function Mp() {
}
Mp.prototype = Fi.prototype;
function Qu(t, e, n) {
  this.props = t, this.context = e, this.refs = Op, this.updater = n || Ip;
}
var Vu = Qu.prototype = new Mp();
Vu.constructor = Qu;
Np(Vu, Fi.prototype);
Vu.isPureReactComponent = !0;
var lh = Array.isArray, be = { H: null, A: null, T: null }, kp = Object.prototype.hasOwnProperty;
function $u(t, e, n, r, i, o, a) {
  return n = a.ref, {
    $$typeof: Yu,
    type: t,
    key: e,
    ref: n !== void 0 ? n : null,
    props: a
  };
}
function Ty(t, e) {
  return $u(
    t.type,
    e,
    null,
    void 0,
    void 0,
    void 0,
    t.props
  );
}
function Xu(t) {
  return typeof t == "object" && t !== null && t.$$typeof === Yu;
}
function Sy(t) {
  var e = { "=": "=0", ":": "=2" };
  return "$" + t.replace(/[=:]/g, function(n) {
    return e[n];
  });
}
var uh = /\/+/g;
function zc(t, e) {
  return typeof t == "object" && t !== null && t.key != null ? Sy("" + t.key) : e.toString(36);
}
function dh() {
}
function wy(t) {
  switch (t.status) {
    case "fulfilled":
      return t.value;
    case "rejected":
      throw t.reason;
    default:
      switch (typeof t.status == "string" ? t.then(dh, dh) : (t.status = "pending", t.then(
        function(e) {
          t.status === "pending" && (t.status = "fulfilled", t.value = e);
        },
        function(e) {
          t.status === "pending" && (t.status = "rejected", t.reason = e);
        }
      )), t.status) {
        case "fulfilled":
          return t.value;
        case "rejected":
          throw t.reason;
      }
  }
  throw t;
}
function Zr(t, e, n, r, i) {
  var o = typeof t;
  (o === "undefined" || o === "boolean") && (t = null);
  var a = !1;
  if (t === null)
    a = !0;
  else
    switch (o) {
      case "bigint":
      case "string":
      case "number":
        a = !0;
        break;
      case "object":
        switch (t.$$typeof) {
          case Yu:
          case hy:
            a = !0;
            break;
          case Rp:
            return a = t._init, Zr(
              a(t._payload),
              e,
              n,
              r,
              i
            );
        }
    }
  if (a)
    return i = i(t), a = r === "" ? "." + zc(t, 0) : r, lh(i) ? (n = "", a != null && (n = a.replace(uh, "$&/") + "/"), Zr(i, e, n, "", function(l) {
      return l;
    })) : i != null && (Xu(i) && (i = Ty(
      i,
      n + (!i.key || t && t.key === i.key ? "" : ("" + i.key).replace(
        uh,
        "$&/"
      ) + "/") + a
    )), e.push(i)), 1;
  a = 0;
  var s = r === "" ? "." : r + ":";
  if (lh(t))
    for (var c = 0; c < t.length; c++)
      r = t[c], o = s + zc(r, c), a += Zr(
        r,
        e,
        n,
        o,
        i
      );
  else if (c = Cy(t), typeof c == "function")
    for (t = c.call(t), c = 0; !(r = t.next()).done; )
      r = r.value, o = s + zc(r, c++), a += Zr(
        r,
        e,
        n,
        o,
        i
      );
  else if (o === "object") {
    if (typeof t.then == "function")
      return Zr(
        wy(t),
        e,
        n,
        r,
        i
      );
    throw e = String(t), Error(
      "Objects are not valid as a React child (found: " + (e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e) + "). If you meant to render a collection of children, use an array instead."
    );
  }
  return a;
}
function ba(t, e, n) {
  if (t == null)
    return t;
  var r = [], i = 0;
  return Zr(t, r, "", "", function(o) {
    return e.call(n, o, i++);
  }), r;
}
function Ay(t) {
  if (t._status === -1) {
    var e = t._result;
    e = e(), e.then(
      function(n) {
        (t._status === 0 || t._status === -1) && (t._status = 1, t._result = n);
      },
      function(n) {
        (t._status === 0 || t._status === -1) && (t._status = 2, t._result = n);
      }
    ), t._status === -1 && (t._status = 0, t._result = e);
  }
  if (t._status === 1)
    return t._result.default;
  throw t._result;
}
var hh = typeof reportError == "function" ? reportError : function(t) {
  if (typeof window == "object" && typeof window.ErrorEvent == "function") {
    var e = new window.ErrorEvent("error", {
      bubbles: !0,
      cancelable: !0,
      message: typeof t == "object" && t !== null && typeof t.message == "string" ? String(t.message) : String(t),
      error: t
    });
    if (!window.dispatchEvent(e))
      return;
  } else if (typeof process == "object" && typeof process.emit == "function") {
    process.emit("uncaughtException", t);
    return;
  }
  console.error(t);
};
function by() {
}
W.Children = {
  map: ba,
  forEach: function(t, e, n) {
    ba(
      t,
      function() {
        e.apply(this, arguments);
      },
      n
    );
  },
  count: function(t) {
    var e = 0;
    return ba(t, function() {
      e++;
    }), e;
  },
  toArray: function(t) {
    return ba(t, function(e) {
      return e;
    }) || [];
  },
  only: function(t) {
    if (!Xu(t))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return t;
  }
};
W.Component = Fi;
W.Fragment = fy;
W.Profiler = gy;
W.PureComponent = Qu;
W.StrictMode = py;
W.Suspense = Ey;
W.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = be;
W.act = function() {
  throw Error("act(...) is not supported in production builds of React.");
};
W.cache = function(t) {
  return function() {
    return t.apply(null, arguments);
  };
};
W.cloneElement = function(t, e, n) {
  if (t == null)
    throw Error(
      "The argument must be a React element, but you passed " + t + "."
    );
  var r = Np({}, t.props), i = t.key, o = void 0;
  if (e != null)
    for (a in e.ref !== void 0 && (o = void 0), e.key !== void 0 && (i = "" + e.key), e)
      !kp.call(e, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && e.ref === void 0 || (r[a] = e[a]);
  var a = arguments.length - 2;
  if (a === 1)
    r.children = n;
  else if (1 < a) {
    for (var s = Array(a), c = 0; c < a; c++)
      s[c] = arguments[c + 2];
    r.children = s;
  }
  return $u(t.type, i, null, void 0, void 0, o, r);
};
W.createContext = function(t) {
  return t = {
    $$typeof: vy,
    _currentValue: t,
    _currentValue2: t,
    _threadCount: 0,
    Provider: null,
    Consumer: null
  }, t.Provider = t, t.Consumer = {
    $$typeof: my,
    _context: t
  }, t;
};
W.createElement = function(t, e, n) {
  var r, i = {}, o = null;
  if (e != null)
    for (r in e.key !== void 0 && (o = "" + e.key), e)
      kp.call(e, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = e[r]);
  var a = arguments.length - 2;
  if (a === 1)
    i.children = n;
  else if (1 < a) {
    for (var s = Array(a), c = 0; c < a; c++)
      s[c] = arguments[c + 2];
    i.children = s;
  }
  if (t && t.defaultProps)
    for (r in a = t.defaultProps, a)
      i[r] === void 0 && (i[r] = a[r]);
  return $u(t, o, null, void 0, void 0, null, i);
};
W.createRef = function() {
  return { current: null };
};
W.forwardRef = function(t) {
  return { $$typeof: yy, render: t };
};
W.isValidElement = Xu;
W.lazy = function(t) {
  return {
    $$typeof: Rp,
    _payload: { _status: -1, _result: t },
    _init: Ay
  };
};
W.memo = function(t, e) {
  return {
    $$typeof: _y,
    type: t,
    compare: e === void 0 ? null : e
  };
};
W.startTransition = function(t) {
  var e = be.T, n = /* @__PURE__ */ new Set();
  be.T = { _callbacks: n };
  var r = be.T;
  try {
    var i = t();
    typeof i == "object" && i !== null && typeof i.then == "function" && (n.forEach(function(o) {
      return o(r, i);
    }), i.then(by, hh));
  } catch (o) {
    hh(o);
  } finally {
    be.T = e;
  }
};
W.unstable_useCacheRefresh = function() {
  return be.H.useCacheRefresh();
};
W.use = function(t) {
  return be.H.use(t);
};
W.useActionState = function(t, e, n) {
  return be.H.useActionState(t, e, n);
};
W.useCallback = function(t, e) {
  return be.H.useCallback(t, e);
};
W.useContext = function(t) {
  return be.H.useContext(t);
};
W.useDebugValue = function() {
};
W.useDeferredValue = function(t, e) {
  return be.H.useDeferredValue(t, e);
};
W.useEffect = function(t, e) {
  return be.H.useEffect(t, e);
};
W.useId = function() {
  return be.H.useId();
};
W.useImperativeHandle = function(t, e, n) {
  return be.H.useImperativeHandle(t, e, n);
};
W.useInsertionEffect = function(t, e) {
  return be.H.useInsertionEffect(t, e);
};
W.useLayoutEffect = function(t, e) {
  return be.H.useLayoutEffect(t, e);
};
W.useMemo = function(t, e) {
  return be.H.useMemo(t, e);
};
W.useOptimistic = function(t, e) {
  return be.H.useOptimistic(t, e);
};
W.useReducer = function(t, e, n) {
  return be.H.useReducer(t, e, n);
};
W.useRef = function(t) {
  return be.H.useRef(t);
};
W.useState = function(t) {
  return be.H.useState(t);
};
W.useSyncExternalStore = function(t, e, n) {
  return be.H.useSyncExternalStore(
    t,
    e,
    n
  );
};
W.useTransition = function() {
  return be.H.useTransition();
};
W.version = "19.0.0-beta-73bcdfbae5-20240502";
bp.exports = W;
var zr = bp.exports, Up = { exports: {} }, gc = {}, Dp = { exports: {} }, Pp = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(t) {
  function e(T, O) {
    var I = T.length;
    T.push(O);
    e:
      for (; 0 < I; ) {
        var G = I - 1 >>> 1, Y = T[G];
        if (0 < i(Y, O))
          T[G] = O, T[I] = Y, I = G;
        else
          break e;
      }
  }
  function n(T) {
    return T.length === 0 ? null : T[0];
  }
  function r(T) {
    if (T.length === 0)
      return null;
    var O = T[0], I = T.pop();
    if (I !== O) {
      T[0] = I;
      e:
        for (var G = 0, Y = T.length, Z = Y >>> 1; G < Z; ) {
          var fe = 2 * (G + 1) - 1, Ye = T[fe], pe = fe + 1, rn = T[pe];
          if (0 > i(Ye, I))
            pe < Y && 0 > i(rn, Ye) ? (T[G] = rn, T[pe] = I, G = pe) : (T[G] = Ye, T[fe] = I, G = fe);
          else if (pe < Y && 0 > i(rn, I))
            T[G] = rn, T[pe] = I, G = pe;
          else
            break e;
        }
    }
    return O;
  }
  function i(T, O) {
    var I = T.sortIndex - O.sortIndex;
    return I !== 0 ? I : T.id - O.id;
  }
  if (t.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
    var o = performance;
    t.unstable_now = function() {
      return o.now();
    };
  } else {
    var a = Date, s = a.now();
    t.unstable_now = function() {
      return a.now() - s;
    };
  }
  var c = [], l = [], u = 1, d = null, h = 3, f = !1, m = !1, E = !1, N = typeof setTimeout == "function" ? setTimeout : null, g = typeof clearTimeout == "function" ? clearTimeout : null, p = typeof setImmediate < "u" ? setImmediate : null;
  function v(T) {
    for (var O = n(l); O !== null; ) {
      if (O.callback === null)
        r(l);
      else if (O.startTime <= T)
        r(l), O.sortIndex = O.expirationTime, e(c, O);
      else
        break;
      O = n(l);
    }
  }
  function C(T) {
    if (E = !1, v(T), !m)
      if (n(c) !== null)
        m = !0, U();
      else {
        var O = n(l);
        O !== null && j(C, O.startTime - T);
      }
  }
  var k = !1, D = -1, z = 5, H = -1;
  function we() {
    return !(t.unstable_now() - H < z);
  }
  function ee() {
    if (k) {
      var T = t.unstable_now();
      H = T;
      var O = !0;
      try {
        e: {
          m = !1, E && (E = !1, g(D), D = -1), f = !0;
          var I = h;
          try {
            t: {
              for (v(T), d = n(c); d !== null && !(d.expirationTime > T && we()); ) {
                var G = d.callback;
                if (typeof G == "function") {
                  d.callback = null, h = d.priorityLevel;
                  var Y = G(
                    d.expirationTime <= T
                  );
                  if (T = t.unstable_now(), typeof Y == "function") {
                    d.callback = Y, v(T), O = !0;
                    break t;
                  }
                  d === n(c) && r(c), v(T);
                } else
                  r(c);
                d = n(c);
              }
              if (d !== null)
                O = !0;
              else {
                var Z = n(l);
                Z !== null && j(
                  C,
                  Z.startTime - T
                ), O = !1;
              }
            }
            break e;
          } finally {
            d = null, h = I, f = !1;
          }
          O = void 0;
        }
      } finally {
        O ? tt() : k = !1;
      }
    }
  }
  var tt;
  if (typeof p == "function")
    tt = function() {
      p(ee);
    };
  else if (typeof MessageChannel < "u") {
    var jr = new MessageChannel(), q = jr.port2;
    jr.port1.onmessage = ee, tt = function() {
      q.postMessage(null);
    };
  } else
    tt = function() {
      N(ee, 0);
    };
  function U() {
    k || (k = !0, tt());
  }
  function j(T, O) {
    D = N(function() {
      T(t.unstable_now());
    }, O);
  }
  t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(T) {
    T.callback = null;
  }, t.unstable_continueExecution = function() {
    m || f || (m = !0, U());
  }, t.unstable_forceFrameRate = function(T) {
    0 > T || 125 < T ? console.error(
      "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
    ) : z = 0 < T ? Math.floor(1e3 / T) : 5;
  }, t.unstable_getCurrentPriorityLevel = function() {
    return h;
  }, t.unstable_getFirstCallbackNode = function() {
    return n(c);
  }, t.unstable_next = function(T) {
    switch (h) {
      case 1:
      case 2:
      case 3:
        var O = 3;
        break;
      default:
        O = h;
    }
    var I = h;
    h = O;
    try {
      return T();
    } finally {
      h = I;
    }
  }, t.unstable_pauseExecution = function() {
  }, t.unstable_requestPaint = function() {
  }, t.unstable_runWithPriority = function(T, O) {
    switch (T) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        T = 3;
    }
    var I = h;
    h = T;
    try {
      return O();
    } finally {
      h = I;
    }
  }, t.unstable_scheduleCallback = function(T, O, I) {
    var G = t.unstable_now();
    switch (typeof I == "object" && I !== null ? (I = I.delay, I = typeof I == "number" && 0 < I ? G + I : G) : I = G, T) {
      case 1:
        var Y = -1;
        break;
      case 2:
        Y = 250;
        break;
      case 5:
        Y = 1073741823;
        break;
      case 4:
        Y = 1e4;
        break;
      default:
        Y = 5e3;
    }
    return Y = I + Y, T = {
      id: u++,
      callback: O,
      priorityLevel: T,
      startTime: I,
      expirationTime: Y,
      sortIndex: -1
    }, I > G ? (T.sortIndex = I, e(l, T), n(c) === null && T === n(l) && (E ? (g(D), D = -1) : E = !0, j(C, I - G))) : (T.sortIndex = Y, e(c, T), m || f || (m = !0, U())), T;
  }, t.unstable_shouldYield = we, t.unstable_wrapCallback = function(T) {
    var O = h;
    return function() {
      var I = h;
      h = O;
      try {
        return T.apply(this, arguments);
      } finally {
        h = I;
      }
    };
  };
})(Pp);
Dp.exports = Pp;
var Ry = Dp.exports, Hp = { exports: {} }, gt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function Lp(t) {
  var e = "https://react.dev/errors/" + t;
  if (1 < arguments.length) {
    e += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var n = 2; n < arguments.length; n++)
      e += "&args[]=" + encodeURIComponent(arguments[n]);
  }
  return "Minified React error #" + t + "; visit " + e + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var bo = zr.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function jn() {
}
var dt = {
  d: {
    f: jn,
    r: function() {
      throw Error(Lp(522));
    },
    D: jn,
    C: jn,
    L: jn,
    m: jn,
    X: jn,
    S: jn,
    M: jn
  },
  p: 0,
  findDOMNode: null
}, Iy = Symbol.for("react.portal");
function Ny(t, e, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: Iy,
    key: r == null ? null : "" + r,
    children: t,
    containerInfo: e,
    implementation: n
  };
}
function mc(t, e) {
  if (t === "font")
    return "";
  if (typeof e == "string")
    return e === "use-credentials" ? e : "";
}
gt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = dt;
gt.createPortal = function(t, e) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
    throw Error(Lp(299));
  return Ny(t, e, null, n);
};
gt.flushSync = function(t) {
  var e = bo.T, n = dt.p;
  try {
    if (bo.T = null, dt.p = 2, t)
      return t();
  } finally {
    bo.T = e, dt.p = n, dt.d.f();
  }
};
gt.preconnect = function(t, e) {
  typeof t == "string" && (e ? (e = e.crossOrigin, e = typeof e == "string" ? e === "use-credentials" ? e : "" : void 0) : e = null, dt.d.C(t, e));
};
gt.prefetchDNS = function(t) {
  typeof t == "string" && dt.d.D(t);
};
gt.preinit = function(t, e) {
  if (typeof t == "string" && e && typeof e.as == "string") {
    var n = e.as, r = mc(n, e.crossOrigin), i = typeof e.integrity == "string" ? e.integrity : void 0, o = typeof e.fetchPriority == "string" ? e.fetchPriority : void 0;
    n === "style" ? dt.d.S(
      t,
      typeof e.precedence == "string" ? e.precedence : void 0,
      {
        crossOrigin: r,
        integrity: i,
        fetchPriority: o
      }
    ) : n === "script" && dt.d.X(t, {
      crossOrigin: r,
      integrity: i,
      fetchPriority: o,
      nonce: typeof e.nonce == "string" ? e.nonce : void 0
    });
  }
};
gt.preinitModule = function(t, e) {
  if (typeof t == "string")
    if (typeof e == "object" && e !== null) {
      if (e.as == null || e.as === "script") {
        var n = mc(
          e.as,
          e.crossOrigin
        );
        dt.d.M(t, {
          crossOrigin: n,
          integrity: typeof e.integrity == "string" ? e.integrity : void 0,
          nonce: typeof e.nonce == "string" ? e.nonce : void 0
        });
      }
    } else
      e == null && dt.d.M(t);
};
gt.preload = function(t, e) {
  if (typeof t == "string" && typeof e == "object" && e !== null && typeof e.as == "string") {
    var n = e.as, r = mc(n, e.crossOrigin);
    dt.d.L(t, n, {
      crossOrigin: r,
      integrity: typeof e.integrity == "string" ? e.integrity : void 0,
      nonce: typeof e.nonce == "string" ? e.nonce : void 0,
      type: typeof e.type == "string" ? e.type : void 0,
      fetchPriority: typeof e.fetchPriority == "string" ? e.fetchPriority : void 0,
      referrerPolicy: typeof e.referrerPolicy == "string" ? e.referrerPolicy : void 0,
      imageSrcSet: typeof e.imageSrcSet == "string" ? e.imageSrcSet : void 0,
      imageSizes: typeof e.imageSizes == "string" ? e.imageSizes : void 0,
      media: typeof e.media == "string" ? e.media : void 0
    });
  }
};
gt.preloadModule = function(t, e) {
  if (typeof t == "string")
    if (e) {
      var n = mc(e.as, e.crossOrigin);
      dt.d.m(t, {
        as: typeof e.as == "string" && e.as !== "script" ? e.as : void 0,
        crossOrigin: n,
        integrity: typeof e.integrity == "string" ? e.integrity : void 0
      });
    } else
      dt.d.m(t);
};
gt.requestFormReset = function(t) {
  dt.d.r(t);
};
gt.unstable_batchedUpdates = function(t, e) {
  return t(e);
};
gt.useFormState = function(t, e, n) {
  return bo.H.useFormState(t, e, n);
};
gt.useFormStatus = function() {
  return bo.H.useHostTransitionStatus();
};
gt.version = "19.0.0-beta-73bcdfbae5-20240502";
function xp() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(xp);
    } catch (t) {
      console.error(t);
    }
}
xp(), Hp.exports = gt;
var Oy = Hp.exports;
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ze = Ry, My = zr, ky = Oy;
function A(t) {
  var e = "https://react.dev/errors/" + t;
  if (1 < arguments.length) {
    e += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var n = 2; n < arguments.length; n++)
      e += "&args[]=" + encodeURIComponent(arguments[n]);
  }
  return "Minified React error #" + t + "; visit " + e + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
function qp(t) {
  return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
}
var Uy = Symbol.for("react.element"), Ra = Symbol.for("react.transitional.element"), Ia = Symbol.for("react.portal"), mo = Symbol.for("react.fragment"), Dy = Symbol.for("react.strict_mode"), fh = Symbol.for("react.profiler"), Py = Symbol.for("react.provider"), Hy = Symbol.for("react.consumer"), tr = Symbol.for("react.context"), Bp = Symbol.for("react.forward_ref"), ph = Symbol.for("react.suspense"), gh = Symbol.for("react.suspense_list"), zp = Symbol.for("react.memo"), vr = Symbol.for("react.lazy"), Gp = Symbol.for("react.offscreen"), mh = Symbol.iterator;
function io(t) {
  return t === null || typeof t != "object" ? null : (t = mh && t[mh] || t["@@iterator"], typeof t == "function" ? t : null);
}
function ji(t) {
  var e = t, n = t;
  if (t.alternate)
    for (; e.return; )
      e = e.return;
  else {
    t = e;
    do
      e = t, e.flags & 4098 && (n = e.return), t = e.return;
    while (t);
  }
  return e.tag === 3 ? n : null;
}
function Kp(t) {
  if (t.tag === 13) {
    var e = t.memoizedState;
    if (e === null && (t = t.alternate, t !== null && (e = t.memoizedState)), e !== null)
      return e.dehydrated;
  }
  return null;
}
function vh(t) {
  if (ji(t) !== t)
    throw Error(A(188));
}
function Ly(t) {
  var e = t.alternate;
  if (!e) {
    if (e = ji(t), e === null)
      throw Error(A(188));
    return e !== t ? null : t;
  }
  for (var n = t, r = e; ; ) {
    var i = n.return;
    if (i === null)
      break;
    var o = i.alternate;
    if (o === null) {
      if (r = i.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (i.child === o.child) {
      for (o = i.child; o; ) {
        if (o === n)
          return vh(i), t;
        if (o === r)
          return vh(i), e;
        o = o.sibling;
      }
      throw Error(A(188));
    }
    if (n.return !== r.return)
      n = i, r = o;
    else {
      for (var a = !1, s = i.child; s; ) {
        if (s === n) {
          a = !0, n = i, r = o;
          break;
        }
        if (s === r) {
          a = !0, r = i, n = o;
          break;
        }
        s = s.sibling;
      }
      if (!a) {
        for (s = o.child; s; ) {
          if (s === n) {
            a = !0, n = o, r = i;
            break;
          }
          if (s === r) {
            a = !0, r = o, n = i;
            break;
          }
          s = s.sibling;
        }
        if (!a)
          throw Error(A(189));
      }
    }
    if (n.alternate !== r)
      throw Error(A(190));
  }
  if (n.tag !== 3)
    throw Error(A(188));
  return n.stateNode.current === n ? t : e;
}
function Fp(t) {
  return t = Ly(t), t !== null ? jp(t) : null;
}
function jp(t) {
  var e = t.tag;
  if (e === 5 || e === 26 || e === 27 || e === 6)
    return t;
  for (t = t.child; t !== null; ) {
    if (e = jp(t), e !== null)
      return e;
    t = t.sibling;
  }
  return null;
}
var Se = Object.assign, vo = Array.isArray, ne = My.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Ce = ky.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Ro = {
  pending: !1,
  data: null,
  method: null,
  action: null
}, ql = [], ri = -1;
function vn(t) {
  return { current: t };
}
function je(t) {
  0 > ri || (t.current = ql[ri], ql[ri] = null, ri--);
}
function Te(t, e) {
  ri++, ql[ri] = t.current, t.current = e;
}
var dn = vn(null), Xo = vn(null), ir = vn(null), Bl = vn(null), Es = {
  $$typeof: tr,
  Provider: null,
  Consumer: null,
  _currentValue: null,
  _currentValue2: null,
  _threadCount: 0
};
function _s(t, e) {
  switch (Te(ir, e), Te(Xo, t), Te(dn, null), t = e.nodeType, t) {
    case 9:
    case 11:
      e = (e = e.documentElement) && (e = e.namespaceURI) ? ff(e) : 0;
      break;
    default:
      if (t = t === 8 ? e.parentNode : e, e = t.tagName, t = t.namespaceURI)
        t = ff(t), e = ov(t, e);
      else
        switch (e) {
          case "svg":
            e = 1;
            break;
          case "math":
            e = 2;
            break;
          default:
            e = 0;
        }
  }
  je(dn), Te(dn, e);
}
function Ui() {
  je(dn), je(Xo), je(ir);
}
function zl(t) {
  t.memoizedState !== null && Te(Bl, t);
  var e = dn.current, n = ov(e, t.type);
  e !== n && (Te(Xo, t), Te(dn, n));
}
function Cs(t) {
  Xo.current === t && (je(dn), je(Xo)), Bl.current === t && (je(Bl), Es._currentValue = null);
}
var Gl = Object.prototype.hasOwnProperty, Ju = ze.unstable_scheduleCallback, Gc = ze.unstable_cancelCallback, xy = ze.unstable_shouldYield, qy = ze.unstable_requestPaint, hn = ze.unstable_now, By = ze.unstable_getCurrentPriorityLevel, Zu = ze.unstable_ImmediatePriority, Yp = ze.unstable_UserBlockingPriority, Ts = ze.unstable_NormalPriority, zy = ze.unstable_LowPriority, Qp = ze.unstable_IdlePriority, Gy = ze.log, Ky = ze.unstable_setDisableYieldValue, ga = null, It = null;
function Fy(t) {
  if (It && typeof It.onCommitFiberRoot == "function")
    try {
      It.onCommitFiberRoot(
        ga,
        t,
        void 0,
        (t.current.flags & 128) === 128
      );
    } catch {
    }
}
function nr(t) {
  if (typeof Gy == "function" && Ky(t), It && typeof It.setStrictMode == "function")
    try {
      It.setStrictMode(ga, t);
    } catch {
    }
}
var qt = Math.clz32 ? Math.clz32 : Qy, jy = Math.log, Yy = Math.LN2;
function Qy(t) {
  return t >>>= 0, t === 0 ? 32 : 31 - (jy(t) / Yy | 0) | 0;
}
var Na = 128, Oa = 4194304;
function yo(t) {
  var e = t & 42;
  if (e !== 0)
    return e;
  switch (t & -t) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
      return 64;
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t & 4194176;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return t & 62914560;
    case 67108864:
      return 67108864;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 0;
    default:
      return t;
  }
}
function Ss(t, e) {
  var n = t.pendingLanes;
  if (n === 0)
    return 0;
  var r = 0, i = t.suspendedLanes;
  t = t.pingedLanes;
  var o = n & 134217727;
  return o !== 0 ? (n = o & ~i, n !== 0 ? r = yo(n) : (t &= o, t !== 0 && (r = yo(t)))) : (n &= ~i, n !== 0 ? r = yo(n) : t !== 0 && (r = yo(t))), r === 0 ? 0 : e !== 0 && e !== r && !(e & i) && (i = r & -r, t = e & -e, i >= t || i === 32 && (t & 4194176) !== 0) ? e : r;
}
function Vy(t, e) {
  switch (t) {
    case 1:
    case 2:
    case 4:
    case 8:
      return e + 250;
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return -1;
    case 67108864:
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Vp(t, e) {
  return t.errorRecoveryDisabledLanes & e ? 0 : (t = t.pendingLanes & -536870913, t !== 0 ? t : t & 536870912 ? 536870912 : 0);
}
function $p() {
  var t = Na;
  return Na <<= 1, !(Na & 4194176) && (Na = 128), t;
}
function Xp() {
  var t = Oa;
  return Oa <<= 1, !(Oa & 62914560) && (Oa = 4194304), t;
}
function Kc(t) {
  for (var e = [], n = 0; 31 > n; n++)
    e.push(t);
  return e;
}
function $y(t, e, n) {
  var r = t.pendingLanes & ~e;
  t.pendingLanes = e, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= e, t.entangledLanes &= e, t.errorRecoveryDisabledLanes &= e, t.shellSuspendCounter = 0, e = t.entanglements;
  for (var i = t.expirationTimes, o = t.hiddenUpdates; 0 < r; ) {
    var a = 31 - qt(r), s = 1 << a;
    e[a] = 0, i[a] = -1;
    var c = o[a];
    if (c !== null)
      for (o[a] = null, a = 0; a < c.length; a++) {
        var l = c[a];
        l !== null && (l.lane &= -536870913);
      }
    r &= ~s;
  }
  n !== 0 && Jp(t, n, 0);
}
function Jp(t, e, n) {
  t.pendingLanes |= e, t.suspendedLanes &= ~e;
  var r = 31 - qt(e);
  t.entangledLanes |= e, t.entanglements[r] = t.entanglements[r] | 1073741824 | n & 4194218;
}
function Zp(t, e) {
  var n = t.entangledLanes |= e;
  for (t = t.entanglements; n; ) {
    var r = 31 - qt(n), i = 1 << r;
    i & e | t[r] & e && (t[r] |= e), n &= ~i;
  }
}
function Wp(t) {
  return t &= -t, 2 < t ? 8 < t ? t & 134217727 ? 32 : 268435456 : 8 : 2;
}
function eg() {
  var t = Ce.p;
  return t !== 0 ? t : (t = window.event, t === void 0 ? 32 : pv(t.type));
}
function Xy(t, e) {
  var n = Ce.p;
  try {
    return Ce.p = t, e();
  } finally {
    Ce.p = n;
  }
}
var pr = Math.random().toString(36).slice(2), ot = "__reactFiber$" + pr, ht = "__reactProps$" + pr, Yi = "__reactContainer$" + pr, Kl = "__reactEvents$" + pr, Jy = "__reactListeners$" + pr, Zy = "__reactHandles$" + pr, yh = "__reactResources$" + pr, Jo = "__reactMarker$" + pr;
function Wu(t) {
  delete t[ot], delete t[ht], delete t[Kl], delete t[Jy], delete t[Zy];
}
function Sr(t) {
  var e = t[ot];
  if (e)
    return e;
  for (var n = t.parentNode; n; ) {
    if (e = n[Yi] || n[ot]) {
      if (n = e.alternate, e.child !== null || n !== null && n.child !== null)
        for (t = gf(t); t !== null; ) {
          if (n = t[ot])
            return n;
          t = gf(t);
        }
      return e;
    }
    t = n, n = t.parentNode;
  }
  return null;
}
function Qi(t) {
  if (t = t[ot] || t[Yi]) {
    var e = t.tag;
    if (e === 5 || e === 6 || e === 13 || e === 26 || e === 27 || e === 3)
      return t;
  }
  return null;
}
function Eo(t) {
  var e = t.tag;
  if (e === 5 || e === 26 || e === 27 || e === 6)
    return t.stateNode;
  throw Error(A(33));
}
function Ei(t) {
  var e = t[yh];
  return e || (e = t[yh] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), e;
}
function Fe(t) {
  t[Jo] = !0;
}
var tg = /* @__PURE__ */ new Set(), ng = {};
function Gr(t, e) {
  Di(t, e), Di(t + "Capture", e);
}
function Di(t, e) {
  for (ng[t] = e, t = 0; t < e.length; t++)
    tg.add(e[t]);
}
var xn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Wy = RegExp(
  "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
), Eh = {}, _h = {};
function eE(t) {
  return Gl.call(_h, t) ? !0 : Gl.call(Eh, t) ? !1 : Wy.test(t) ? _h[t] = !0 : (Eh[t] = !0, !1);
}
function Fl(t, e, n) {
  if (eE(e))
    if (n === null)
      t.removeAttribute(e);
    else {
      switch (typeof n) {
        case "undefined":
        case "function":
        case "symbol":
          t.removeAttribute(e);
          return;
        case "boolean":
          var r = e.toLowerCase().slice(0, 5);
          if (r !== "data-" && r !== "aria-") {
            t.removeAttribute(e);
            return;
          }
      }
      t.setAttribute(e, "" + n);
    }
}
function Fc(t, e, n) {
  if (n === null)
    t.removeAttribute(e);
  else {
    switch (typeof n) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        t.removeAttribute(e);
        return;
    }
    t.setAttribute(e, "" + n);
  }
}
function En(t, e, n, r) {
  if (r === null)
    t.removeAttribute(n);
  else {
    switch (typeof r) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        t.removeAttribute(n);
        return;
    }
    t.setAttributeNS(e, n, "" + r);
  }
}
var jc;
function _o(t) {
  if (jc === void 0)
    try {
      throw Error();
    } catch (n) {
      var e = n.stack.trim().match(/\n( *(at )?)/);
      jc = e && e[1] || "";
    }
  return `
` + jc + t;
}
var Yc = !1;
function Qc(t, e) {
  if (!t || Yc)
    return "";
  Yc = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  var r = {
    DetermineComponentFrameRoot: function() {
      try {
        if (e) {
          var d = function() {
            throw Error();
          };
          if (Object.defineProperty(d.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(d, []);
            } catch (f) {
              var h = f;
            }
            Reflect.construct(t, [], d);
          } else {
            try {
              d.call();
            } catch (f) {
              h = f;
            }
            t.call(d.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (f) {
            h = f;
          }
          (d = t()) && typeof d.catch == "function" && d.catch(function() {
          });
        }
      } catch (f) {
        if (f && h && typeof f.stack == "string")
          return [f.stack, h.stack];
      }
      return [null, null];
    }
  };
  r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
  var i = Object.getOwnPropertyDescriptor(
    r.DetermineComponentFrameRoot,
    "name"
  );
  i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", {
    value: "DetermineComponentFrameRoot"
  });
  try {
    var o = r.DetermineComponentFrameRoot(), a = o[0], s = o[1];
    if (a && s) {
      var c = a.split(`
`), l = s.split(`
`);
      for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot"); )
        r++;
      for (; i < l.length && !l[i].includes(
        "DetermineComponentFrameRoot"
      ); )
        i++;
      if (r === c.length || i === l.length)
        for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i]; )
          i--;
      for (; 1 <= r && 0 <= i; r--, i--)
        if (c[r] !== l[i]) {
          if (r !== 1 || i !== 1)
            do
              if (r--, i--, 0 > i || c[r] !== l[i]) {
                var u = `
` + c[r].replace(" at new ", " at ");
                return t.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", t.displayName)), u;
              }
            while (1 <= r && 0 <= i);
          break;
        }
    }
  } finally {
    Yc = !1, Error.prepareStackTrace = n;
  }
  return (n = t ? t.displayName || t.name : "") ? _o(n) : "";
}
function tE(t) {
  switch (t.tag) {
    case 26:
    case 27:
    case 5:
      return _o(t.type);
    case 16:
      return _o("Lazy");
    case 13:
      return _o("Suspense");
    case 19:
      return _o("SuspenseList");
    case 0:
    case 15:
      return t = Qc(t.type, !1), t;
    case 11:
      return t = Qc(t.type.render, !1), t;
    case 1:
      return t = Qc(t.type, !0), t;
    default:
      return "";
  }
}
function Ch(t) {
  try {
    var e = "";
    do
      e += tE(t), t = t.return;
    while (t);
    return e;
  } catch (n) {
    return `
Error generating stack: ` + n.message + `
` + n.stack;
  }
}
function Dt(t) {
  switch (typeof t) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return t;
    case "object":
      return t;
    default:
      return "";
  }
}
function rg(t) {
  var e = t.type;
  return (t = t.nodeName) && t.toLowerCase() === "input" && (e === "checkbox" || e === "radio");
}
function nE(t) {
  var e = rg(t) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(
    t.constructor.prototype,
    e
  ), r = "" + t[e];
  if (!t.hasOwnProperty(e) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var i = n.get, o = n.set;
    return Object.defineProperty(t, e, {
      configurable: !0,
      get: function() {
        return i.call(this);
      },
      set: function(a) {
        r = "" + a, o.call(this, a);
      }
    }), Object.defineProperty(t, e, {
      enumerable: n.enumerable
    }), {
      getValue: function() {
        return r;
      },
      setValue: function(a) {
        r = "" + a;
      },
      stopTracking: function() {
        t._valueTracker = null, delete t[e];
      }
    };
  }
}
function ws(t) {
  t._valueTracker || (t._valueTracker = nE(t));
}
function ig(t) {
  if (!t)
    return !1;
  var e = t._valueTracker;
  if (!e)
    return !0;
  var n = e.getValue(), r = "";
  return t && (r = rg(t) ? t.checked ? "true" : "false" : t.value), t = r, t !== n ? (e.setValue(t), !0) : !1;
}
function As(t) {
  if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u")
    return null;
  try {
    return t.activeElement || t.body;
  } catch {
    return t.body;
  }
}
var rE = /[\n"\\]/g;
function Lt(t) {
  return t.replace(
    rE,
    function(e) {
      return "\\" + e.charCodeAt(0).toString(16) + " ";
    }
  );
}
function jl(t, e, n, r, i, o, a, s) {
  t.name = "", a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" ? t.type = a : t.removeAttribute("type"), e != null ? a === "number" ? (e === 0 && t.value === "" || t.value != e) && (t.value = "" + Dt(e)) : t.value !== "" + Dt(e) && (t.value = "" + Dt(e)) : a !== "submit" && a !== "reset" || t.removeAttribute("value"), e != null ? Yl(t, a, Dt(e)) : n != null ? Yl(t, a, Dt(n)) : r != null && t.removeAttribute("value"), i == null && o != null && (t.defaultChecked = !!o), i != null && (t.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? t.name = "" + Dt(s) : t.removeAttribute("name");
}
function og(t, e, n, r, i, o, a, s) {
  if (o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (t.type = o), e != null || n != null) {
    if (!(o !== "submit" && o !== "reset" || e != null))
      return;
    n = n != null ? "" + Dt(n) : "", e = e != null ? "" + Dt(e) : n, s || e === t.value || (t.value = e), t.defaultValue = e;
  }
  r = r ?? i, r = typeof r != "function" && typeof r != "symbol" && !!r, t.checked = s ? t.checked : !!r, t.defaultChecked = !!r, a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (t.name = a);
}
function Yl(t, e, n) {
  e === "number" && As(t.ownerDocument) === t || t.defaultValue === "" + n || (t.defaultValue = "" + n);
}
function _i(t, e, n, r) {
  if (t = t.options, e) {
    e = {};
    for (var i = 0; i < n.length; i++)
      e["$" + n[i]] = !0;
    for (n = 0; n < t.length; n++)
      i = e.hasOwnProperty("$" + t[n].value), t[n].selected !== i && (t[n].selected = i), i && r && (t[n].defaultSelected = !0);
  } else {
    for (n = "" + Dt(n), e = null, i = 0; i < t.length; i++) {
      if (t[i].value === n) {
        t[i].selected = !0, r && (t[i].defaultSelected = !0);
        return;
      }
      e !== null || t[i].disabled || (e = t[i]);
    }
    e !== null && (e.selected = !0);
  }
}
function ag(t, e, n) {
  if (e != null && (e = "" + Dt(e), e !== t.value && (t.value = e), n == null)) {
    t.defaultValue !== e && (t.defaultValue = e);
    return;
  }
  t.defaultValue = n != null ? "" + Dt(n) : "";
}
function sg(t, e, n, r) {
  if (e == null) {
    if (r != null) {
      if (n != null)
        throw Error(A(92));
      if (vo(r)) {
        if (1 < r.length)
          throw Error(A(93));
        r = r[0];
      }
      n = r;
    }
    n == null && (n = ""), e = n;
  }
  n = Dt(e), t.defaultValue = n, r = t.textContent, r === n && r !== "" && r !== null && (t.value = r);
}
function Pi(t, e) {
  if (e) {
    var n = t.firstChild;
    if (n && n === t.lastChild && n.nodeType === 3) {
      n.nodeValue = e;
      return;
    }
  }
  t.textContent = e;
}
var iE = new Set(
  "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
    " "
  )
);
function Th(t, e, n) {
  var r = e.indexOf("--") === 0;
  n == null || typeof n == "boolean" || n === "" ? r ? t.setProperty(e, "") : e === "float" ? t.cssFloat = "" : t[e] = "" : r ? t.setProperty(e, n) : typeof n != "number" || n === 0 || iE.has(e) ? e === "float" ? t.cssFloat = n : t[e] = ("" + n).trim() : t[e] = n + "px";
}
function cg(t, e, n) {
  if (e != null && typeof e != "object")
    throw Error(A(62));
  if (t = t.style, n != null) {
    for (var r in n)
      !n.hasOwnProperty(r) || e != null && e.hasOwnProperty(r) || (r.indexOf("--") === 0 ? t.setProperty(r, "") : r === "float" ? t.cssFloat = "" : t[r] = "");
    for (var i in e)
      r = e[i], e.hasOwnProperty(i) && n[i] !== r && Th(t, i, r);
  } else
    for (var o in e)
      e.hasOwnProperty(o) && Th(t, o, e[o]);
}
function ed(t) {
  if (t.indexOf("-") === -1)
    return !1;
  switch (t) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var oE = /* @__PURE__ */ new Map([
  ["acceptCharset", "accept-charset"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
  ["crossOrigin", "crossorigin"],
  ["accentHeight", "accent-height"],
  ["alignmentBaseline", "alignment-baseline"],
  ["arabicForm", "arabic-form"],
  ["baselineShift", "baseline-shift"],
  ["capHeight", "cap-height"],
  ["clipPath", "clip-path"],
  ["clipRule", "clip-rule"],
  ["colorInterpolation", "color-interpolation"],
  ["colorInterpolationFilters", "color-interpolation-filters"],
  ["colorProfile", "color-profile"],
  ["colorRendering", "color-rendering"],
  ["dominantBaseline", "dominant-baseline"],
  ["enableBackground", "enable-background"],
  ["fillOpacity", "fill-opacity"],
  ["fillRule", "fill-rule"],
  ["floodColor", "flood-color"],
  ["floodOpacity", "flood-opacity"],
  ["fontFamily", "font-family"],
  ["fontSize", "font-size"],
  ["fontSizeAdjust", "font-size-adjust"],
  ["fontStretch", "font-stretch"],
  ["fontStyle", "font-style"],
  ["fontVariant", "font-variant"],
  ["fontWeight", "font-weight"],
  ["glyphName", "glyph-name"],
  ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
  ["glyphOrientationVertical", "glyph-orientation-vertical"],
  ["horizAdvX", "horiz-adv-x"],
  ["horizOriginX", "horiz-origin-x"],
  ["imageRendering", "image-rendering"],
  ["letterSpacing", "letter-spacing"],
  ["lightingColor", "lighting-color"],
  ["markerEnd", "marker-end"],
  ["markerMid", "marker-mid"],
  ["markerStart", "marker-start"],
  ["overlinePosition", "overline-position"],
  ["overlineThickness", "overline-thickness"],
  ["paintOrder", "paint-order"],
  ["panose-1", "panose-1"],
  ["pointerEvents", "pointer-events"],
  ["renderingIntent", "rendering-intent"],
  ["shapeRendering", "shape-rendering"],
  ["stopColor", "stop-color"],
  ["stopOpacity", "stop-opacity"],
  ["strikethroughPosition", "strikethrough-position"],
  ["strikethroughThickness", "strikethrough-thickness"],
  ["strokeDasharray", "stroke-dasharray"],
  ["strokeDashoffset", "stroke-dashoffset"],
  ["strokeLinecap", "stroke-linecap"],
  ["strokeLinejoin", "stroke-linejoin"],
  ["strokeMiterlimit", "stroke-miterlimit"],
  ["strokeOpacity", "stroke-opacity"],
  ["strokeWidth", "stroke-width"],
  ["textAnchor", "text-anchor"],
  ["textDecoration", "text-decoration"],
  ["textRendering", "text-rendering"],
  ["transformOrigin", "transform-origin"],
  ["underlinePosition", "underline-position"],
  ["underlineThickness", "underline-thickness"],
  ["unicodeBidi", "unicode-bidi"],
  ["unicodeRange", "unicode-range"],
  ["unitsPerEm", "units-per-em"],
  ["vAlphabetic", "v-alphabetic"],
  ["vHanging", "v-hanging"],
  ["vIdeographic", "v-ideographic"],
  ["vMathematical", "v-mathematical"],
  ["vectorEffect", "vector-effect"],
  ["vertAdvY", "vert-adv-y"],
  ["vertOriginX", "vert-origin-x"],
  ["vertOriginY", "vert-origin-y"],
  ["wordSpacing", "word-spacing"],
  ["writingMode", "writing-mode"],
  ["xmlnsXlink", "xmlns:xlink"],
  ["xHeight", "x-height"]
]), aE = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function Vc(t) {
  return aE.test("" + t) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : t;
}
var Ql = null;
function td(t) {
  return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
}
var ii = null, Ci = null;
function Sh(t) {
  var e = Qi(t);
  if (e && (t = e.stateNode)) {
    var n = t[ht] || null;
    e:
      switch (t = e.stateNode, e.type) {
        case "input":
          if (jl(
            t,
            n.value,
            n.defaultValue,
            n.defaultValue,
            n.checked,
            n.defaultChecked,
            n.type,
            n.name
          ), e = n.name, n.type === "radio" && e != null) {
            for (n = t; n.parentNode; )
              n = n.parentNode;
            for (n = n.querySelectorAll(
              'input[name="' + Lt(
                "" + e
              ) + '"][type="radio"]'
            ), e = 0; e < n.length; e++) {
              var r = n[e];
              if (r !== t && r.form === t.form) {
                var i = r[ht] || null;
                if (!i)
                  throw Error(A(90));
                jl(
                  r,
                  i.value,
                  i.defaultValue,
                  i.defaultValue,
                  i.checked,
                  i.defaultChecked,
                  i.type,
                  i.name
                );
              }
            }
            for (e = 0; e < n.length; e++)
              r = n[e], r.form === t.form && ig(r);
          }
          break e;
        case "textarea":
          ag(t, n.value, n.defaultValue);
          break e;
        case "select":
          e = n.value, e != null && _i(t, !!n.multiple, e, !1);
      }
  }
}
var $c = !1;
function lg(t, e, n) {
  if ($c)
    return t(e, n);
  $c = !0;
  try {
    var r = t(e);
    return r;
  } finally {
    if ($c = !1, (ii !== null || Ci !== null) && (Ic(), ii && (e = ii, t = Ci, Ci = ii = null, Sh(e), t)))
      for (e = 0; e < t.length; e++)
        Sh(t[e]);
  }
}
function Zo(t, e) {
  var n = t.stateNode;
  if (n === null)
    return null;
  var r = n[ht] || null;
  if (r === null)
    return null;
  n = r[e];
  e:
    switch (e) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (r = !r.disabled) || (t = t.type, r = !(t === "button" || t === "input" || t === "select" || t === "textarea")), t = !r;
        break e;
      default:
        t = !1;
    }
  if (t)
    return null;
  if (n && typeof n != "function")
    throw Error(
      A(231, e, typeof n)
    );
  return n;
}
var Vl = !1;
if (xn)
  try {
    var oo = {};
    Object.defineProperty(oo, "passive", {
      get: function() {
        Vl = !0;
      }
    }), window.addEventListener("test", oo, oo), window.removeEventListener("test", oo, oo);
  } catch {
    Vl = !1;
  }
var rr = null, nd = null, es = null;
function ug() {
  if (es)
    return es;
  var t, e = nd, n = e.length, r, i = "value" in rr ? rr.value : rr.textContent, o = i.length;
  for (t = 0; t < n && e[t] === i[t]; t++)
    ;
  var a = n - t;
  for (r = 1; r <= a && e[n - r] === i[o - r]; r++)
    ;
  return es = i.slice(t, 1 < r ? 1 - r : void 0);
}
function ts(t) {
  var e = t.keyCode;
  return "charCode" in t ? (t = t.charCode, t === 0 && e === 13 && (t = 13)) : t = e, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
}
function Ma() {
  return !0;
}
function wh() {
  return !1;
}
function Ot(t) {
  function e(n, r, i, o, a) {
    this._reactName = n, this._targetInst = i, this.type = r, this.nativeEvent = o, this.target = a, this.currentTarget = null;
    for (var s in t)
      t.hasOwnProperty(s) && (n = t[s], this[s] = n ? n(o) : o[s]);
    return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Ma : wh, this.isPropagationStopped = wh, this;
  }
  return Se(e.prototype, {
    preventDefault: function() {
      this.defaultPrevented = !0;
      var n = this.nativeEvent;
      n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Ma);
    },
    stopPropagation: function() {
      var n = this.nativeEvent;
      n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Ma);
    },
    persist: function() {
    },
    isPersistent: Ma
  }), e;
}
var Vi = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function(t) {
    return t.timeStamp || Date.now();
  },
  defaultPrevented: 0,
  isTrusted: 0
}, vc = Ot(Vi), ma = Se({}, Vi, { view: 0, detail: 0 }), sE = Ot(ma), Xc, Jc, ao, yc = Se({}, ma, {
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  getModifierState: rd,
  button: 0,
  buttons: 0,
  relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  },
  movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== ao && (ao && t.type === "mousemove" ? (Xc = t.screenX - ao.screenX, Jc = t.screenY - ao.screenY) : Jc = Xc = 0, ao = t), Xc);
  },
  movementY: function(t) {
    return "movementY" in t ? t.movementY : Jc;
  }
}), Ah = Ot(yc), cE = Se({}, yc, { dataTransfer: 0 }), lE = Ot(cE), uE = Se({}, ma, { relatedTarget: 0 }), Zc = Ot(uE), dE = Se({}, Vi, {
  animationName: 0,
  elapsedTime: 0,
  pseudoElement: 0
}), hE = Ot(dE), fE = Se({}, Vi, {
  clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  }
}), pE = Ot(fE), gE = Se({}, Vi, { data: 0 }), bh = Ot(gE), mE = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, vE = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, yE = {
  Alt: "altKey",
  Control: "ctrlKey",
  Meta: "metaKey",
  Shift: "shiftKey"
};
function EE(t) {
  var e = this.nativeEvent;
  return e.getModifierState ? e.getModifierState(t) : (t = yE[t]) ? !!e[t] : !1;
}
function rd() {
  return EE;
}
var _E = Se({}, ma, {
  key: function(t) {
    if (t.key) {
      var e = mE[t.key] || t.key;
      if (e !== "Unidentified")
        return e;
    }
    return t.type === "keypress" ? (t = ts(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? vE[t.keyCode] || "Unidentified" : "";
  },
  code: 0,
  location: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  repeat: 0,
  locale: 0,
  getModifierState: rd,
  charCode: function(t) {
    return t.type === "keypress" ? ts(t) : 0;
  },
  keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  },
  which: function(t) {
    return t.type === "keypress" ? ts(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }
}), CE = Ot(_E), TE = Se({}, yc, {
  pointerId: 0,
  width: 0,
  height: 0,
  pressure: 0,
  tangentialPressure: 0,
  tiltX: 0,
  tiltY: 0,
  twist: 0,
  pointerType: 0,
  isPrimary: 0
}), Rh = Ot(TE), SE = Se({}, ma, {
  touches: 0,
  targetTouches: 0,
  changedTouches: 0,
  altKey: 0,
  metaKey: 0,
  ctrlKey: 0,
  shiftKey: 0,
  getModifierState: rd
}), wE = Ot(SE), AE = Se({}, Vi, {
  propertyName: 0,
  elapsedTime: 0,
  pseudoElement: 0
}), bE = Ot(AE), RE = Se({}, yc, {
  deltaX: function(t) {
    return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
  },
  deltaY: function(t) {
    return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), IE = Ot(RE), NE = [9, 13, 27, 32], id = xn && "CompositionEvent" in window, Io = null;
xn && "documentMode" in document && (Io = document.documentMode);
var OE = xn && "TextEvent" in window && !Io, dg = xn && (!id || Io && 8 < Io && 11 >= Io), Ih = " ", Nh = !1;
function hg(t, e) {
  switch (t) {
    case "keyup":
      return NE.indexOf(e.keyCode) !== -1;
    case "keydown":
      return e.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function fg(t) {
  return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
}
var oi = !1;
function ME(t, e) {
  switch (t) {
    case "compositionend":
      return fg(e);
    case "keypress":
      return e.which !== 32 ? null : (Nh = !0, Ih);
    case "textInput":
      return t = e.data, t === Ih && Nh ? null : t;
    default:
      return null;
  }
}
function kE(t, e) {
  if (oi)
    return t === "compositionend" || !id && hg(t, e) ? (t = ug(), es = nd = rr = null, oi = !1, t) : null;
  switch (t) {
    case "paste":
      return null;
    case "keypress":
      if (!(e.ctrlKey || e.altKey || e.metaKey) || e.ctrlKey && e.altKey) {
        if (e.char && 1 < e.char.length)
          return e.char;
        if (e.which)
          return String.fromCharCode(e.which);
      }
      return null;
    case "compositionend":
      return dg && e.locale !== "ko" ? null : e.data;
    default:
      return null;
  }
}
var UE = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0
};
function Oh(t) {
  var e = t && t.nodeName && t.nodeName.toLowerCase();
  return e === "input" ? !!UE[t.type] : e === "textarea";
}
function pg(t, e, n, r) {
  ii ? Ci ? Ci.push(r) : Ci = [r] : ii = r, e = Rs(e, "onChange"), 0 < e.length && (n = new vc(
    "onChange",
    "change",
    null,
    n,
    r
  ), t.push({ event: n, listeners: e }));
}
var No = null, Wo = null;
function DE(t) {
  Ag(t, 0);
}
function Ec(t) {
  var e = Eo(t);
  if (ig(e))
    return t;
}
function Mh(t, e) {
  if (t === "change")
    return e;
}
var gg = !1;
if (xn) {
  var Wc;
  if (xn) {
    var el = "oninput" in document;
    if (!el) {
      var kh = document.createElement("div");
      kh.setAttribute("oninput", "return;"), el = typeof kh.oninput == "function";
    }
    Wc = el;
  } else
    Wc = !1;
  gg = Wc && (!document.documentMode || 9 < document.documentMode);
}
function Uh() {
  No && (No.detachEvent("onpropertychange", mg), Wo = No = null);
}
function mg(t) {
  if (t.propertyName === "value" && Ec(Wo)) {
    var e = [];
    pg(
      e,
      Wo,
      t,
      td(t)
    ), lg(DE, e);
  }
}
function PE(t, e, n) {
  t === "focusin" ? (Uh(), No = e, Wo = n, No.attachEvent("onpropertychange", mg)) : t === "focusout" && Uh();
}
function HE(t) {
  if (t === "selectionchange" || t === "keyup" || t === "keydown")
    return Ec(Wo);
}
function LE(t, e) {
  if (t === "click")
    return Ec(e);
}
function xE(t, e) {
  if (t === "input" || t === "change")
    return Ec(e);
}
function qE(t, e) {
  return t === e && (t !== 0 || 1 / t === 1 / e) || t !== t && e !== e;
}
var zt = typeof Object.is == "function" ? Object.is : qE;
function ea(t, e) {
  if (zt(t, e))
    return !0;
  if (typeof t != "object" || t === null || typeof e != "object" || e === null)
    return !1;
  var n = Object.keys(t), r = Object.keys(e);
  if (n.length !== r.length)
    return !1;
  for (r = 0; r < n.length; r++) {
    var i = n[r];
    if (!Gl.call(e, i) || !zt(t[i], e[i]))
      return !1;
  }
  return !0;
}
function Dh(t) {
  for (; t && t.firstChild; )
    t = t.firstChild;
  return t;
}
function Ph(t, e) {
  var n = Dh(t);
  t = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = t + n.textContent.length, t <= e && r >= e)
        return { node: n, offset: e - t };
      t = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Dh(n);
  }
}
function vg(t, e) {
  return t && e ? t === e ? !0 : t && t.nodeType === 3 ? !1 : e && e.nodeType === 3 ? vg(t, e.parentNode) : "contains" in t ? t.contains(e) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(e) & 16) : !1 : !1;
}
function yg() {
  for (var t = window, e = As(); e instanceof t.HTMLIFrameElement; ) {
    try {
      var n = typeof e.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n)
      t = e.contentWindow;
    else
      break;
    e = As(t.document);
  }
  return e;
}
function od(t) {
  var e = t && t.nodeName && t.nodeName.toLowerCase();
  return e && (e === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || e === "textarea" || t.contentEditable === "true");
}
function BE(t) {
  var e = yg(), n = t.focusedElem, r = t.selectionRange;
  if (e !== n && n && n.ownerDocument && vg(
    n.ownerDocument.documentElement,
    n
  )) {
    if (r !== null && od(n)) {
      if (e = r.start, t = r.end, t === void 0 && (t = e), "selectionStart" in n)
        n.selectionStart = e, n.selectionEnd = Math.min(
          t,
          n.value.length
        );
      else if (t = (e = n.ownerDocument || document) && e.defaultView || window, t.getSelection) {
        t = t.getSelection();
        var i = n.textContent.length, o = Math.min(r.start, i);
        r = r.end === void 0 ? o : Math.min(r.end, i), !t.extend && o > r && (i = r, r = o, o = i), i = Ph(n, o);
        var a = Ph(
          n,
          r
        );
        i && a && (t.rangeCount !== 1 || t.anchorNode !== i.node || t.anchorOffset !== i.offset || t.focusNode !== a.node || t.focusOffset !== a.offset) && (e = e.createRange(), e.setStart(i.node, i.offset), t.removeAllRanges(), o > r ? (t.addRange(e), t.extend(
          a.node,
          a.offset
        )) : (e.setEnd(a.node, a.offset), t.addRange(e)));
      }
    }
    for (e = [], t = n; t = t.parentNode; )
      t.nodeType === 1 && e.push({
        element: t,
        left: t.scrollLeft,
        top: t.scrollTop
      });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < e.length; n++)
      t = e[n], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
  }
}
var zE = xn && "documentMode" in document && 11 >= document.documentMode, ai = null, $l = null, Oo = null, Xl = !1;
function Hh(t, e, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Xl || ai == null || ai !== As(r) || (r = ai, "selectionStart" in r && od(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
    anchorNode: r.anchorNode,
    anchorOffset: r.anchorOffset,
    focusNode: r.focusNode,
    focusOffset: r.focusOffset
  }), Oo && ea(Oo, r) || (Oo = r, r = Rs($l, "onSelect"), 0 < r.length && (e = new vc(
    "onSelect",
    "select",
    null,
    e,
    n
  ), t.push({ event: e, listeners: r }), e.target = ai)));
}
function gr(t, e) {
  var n = {};
  return n[t.toLowerCase()] = e.toLowerCase(), n["Webkit" + t] = "webkit" + e, n["Moz" + t] = "moz" + e, n;
}
var si = {
  animationend: gr("Animation", "AnimationEnd"),
  animationiteration: gr("Animation", "AnimationIteration"),
  animationstart: gr("Animation", "AnimationStart"),
  transitionrun: gr("Transition", "TransitionRun"),
  transitionstart: gr("Transition", "TransitionStart"),
  transitioncancel: gr("Transition", "TransitionCancel"),
  transitionend: gr("Transition", "TransitionEnd")
}, tl = {}, Eg = {};
xn && (Eg = document.createElement("div").style, "AnimationEvent" in window || (delete si.animationend.animation, delete si.animationiteration.animation, delete si.animationstart.animation), "TransitionEvent" in window || delete si.transitionend.transition);
function Kr(t) {
  if (tl[t])
    return tl[t];
  if (!si[t])
    return t;
  var e = si[t], n;
  for (n in e)
    if (e.hasOwnProperty(n) && n in Eg)
      return tl[t] = e[n];
  return t;
}
var _g = Kr("animationend"), Cg = Kr("animationiteration"), Tg = Kr("animationstart"), GE = Kr("transitionrun"), KE = Kr("transitionstart"), FE = Kr("transitioncancel"), Sg = Kr("transitionend"), wg = /* @__PURE__ */ new Map(), Lh = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll scrollEnd toggle touchMove waiting wheel".split(
  " "
);
function en(t, e) {
  wg.set(t, e), Gr(e, [t]);
}
function jE(t, e, n, r, i) {
  if (e === "submit" && n && n.stateNode === i) {
    var o = (i[ht] || null).action, a = r.submitter;
    if (a && (e = (e = a[ht] || null) ? e.formAction : a.getAttribute("formAction"), e != null && (o = e, a = null)), typeof o == "function") {
      var s = new vc(
        "action",
        "action",
        null,
        r,
        i
      );
      t.push({
        event: s,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (!r.defaultPrevented) {
                if (s.preventDefault(), a) {
                  var c = a.ownerDocument.createElement("input");
                  c.name = a.name, c.value = a.value, i.id && c.setAttribute("form", i.id), a.parentNode.insertBefore(c, a);
                  var l = new FormData(i);
                  c.parentNode.removeChild(c);
                } else
                  l = new FormData(i);
                cm(
                  n,
                  {
                    pending: !0,
                    data: l,
                    method: i.method,
                    action: o
                  },
                  o,
                  l
                );
              }
            },
            currentTarget: i
          }
        ]
      });
    }
  }
}
for (var bs = typeof reportError == "function" ? reportError : function(t) {
  if (typeof window == "object" && typeof window.ErrorEvent == "function") {
    var e = new window.ErrorEvent("error", {
      bubbles: !0,
      cancelable: !0,
      message: typeof t == "object" && t !== null && typeof t.message == "string" ? String(t.message) : String(t),
      error: t
    });
    if (!window.dispatchEvent(e))
      return;
  } else if (typeof process == "object" && typeof process.emit == "function") {
    process.emit("uncaughtException", t);
    return;
  }
  console.error(t);
}, nl = 0; nl < Lh.length; nl++) {
  var rl = Lh[nl], YE = rl.toLowerCase(), QE = rl[0].toUpperCase() + rl.slice(1);
  en(
    YE,
    "on" + QE
  );
}
en(_g, "onAnimationEnd");
en(Cg, "onAnimationIteration");
en(Tg, "onAnimationStart");
en("dblclick", "onDoubleClick");
en("focusin", "onFocus");
en("focusout", "onBlur");
en(GE, "onTransitionRun");
en(KE, "onTransitionStart");
en(FE, "onTransitionCancel");
en(Sg, "onTransitionEnd");
Di("onMouseEnter", ["mouseout", "mouseover"]);
Di("onMouseLeave", ["mouseout", "mouseover"]);
Di("onPointerEnter", ["pointerout", "pointerover"]);
Di("onPointerLeave", ["pointerout", "pointerover"]);
Gr(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
Gr(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
Gr("onBeforeInput", [
  "compositionend",
  "keypress",
  "textInput",
  "paste"
]);
Gr(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
Gr(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
Gr(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var ta = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
  " "
), VE = new Set(
  "cancel close invalid load scroll scrollend toggle".split(" ").concat(ta)
);
function Ag(t, e) {
  e = (e & 4) !== 0;
  for (var n = 0; n < t.length; n++) {
    var r = t[n], i = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (e)
        for (var a = r.length - 1; 0 <= a; a--) {
          var s = r[a], c = s.instance, l = s.currentTarget;
          if (s = s.listener, c !== o && i.isPropagationStopped())
            break e;
          o = s, i.currentTarget = l;
          try {
            o(i);
          } catch (u) {
            bs(u);
          }
          i.currentTarget = null, o = c;
        }
      else
        for (a = 0; a < r.length; a++) {
          if (s = r[a], c = s.instance, l = s.currentTarget, s = s.listener, c !== o && i.isPropagationStopped())
            break e;
          o = s, i.currentTarget = l;
          try {
            o(i);
          } catch (u) {
            bs(u);
          }
          i.currentTarget = null, o = c;
        }
    }
  }
}
function de(t, e) {
  var n = e[Kl];
  n === void 0 && (n = e[Kl] = /* @__PURE__ */ new Set());
  var r = t + "__bubble";
  n.has(r) || (bg(e, t, 2, !1), n.add(r));
}
function il(t, e, n) {
  var r = 0;
  e && (r |= 4), bg(
    n,
    t,
    r,
    e
  );
}
var ka = "_reactListening" + Math.random().toString(36).slice(2);
function ad(t) {
  if (!t[ka]) {
    t[ka] = !0, tg.forEach(function(n) {
      n !== "selectionchange" && (VE.has(n) || il(n, !1, t), il(n, !0, t));
    });
    var e = t.nodeType === 9 ? t : t.ownerDocument;
    e === null || e[ka] || (e[ka] = !0, il("selectionchange", !1, e));
  }
}
function bg(t, e, n, r) {
  switch (pv(e)) {
    case 2:
      var i = eC;
      break;
    case 8:
      i = tC;
      break;
    default:
      i = Gd;
  }
  n = i.bind(
    null,
    e,
    n,
    t
  ), i = void 0, !Vl || e !== "touchstart" && e !== "touchmove" && e !== "wheel" || (i = !0), r ? i !== void 0 ? t.addEventListener(e, n, {
    capture: !0,
    passive: i
  }) : t.addEventListener(e, n, !0) : i !== void 0 ? t.addEventListener(e, n, {
    passive: i
  }) : t.addEventListener(e, n, !1);
}
function ol(t, e, n, r, i) {
  var o = r;
  if (!(e & 1) && !(e & 2) && r !== null)
    e:
      for (; ; ) {
        if (r === null)
          return;
        var a = r.tag;
        if (a === 3 || a === 4) {
          var s = r.stateNode.containerInfo;
          if (s === i || s.nodeType === 8 && s.parentNode === i)
            break;
          if (a === 4)
            for (a = r.return; a !== null; ) {
              var c = a.tag;
              if ((c === 3 || c === 4) && (c = a.stateNode.containerInfo, c === i || c.nodeType === 8 && c.parentNode === i))
                return;
              a = a.return;
            }
          for (; s !== null; ) {
            if (a = Sr(s), a === null)
              return;
            if (c = a.tag, c === 5 || c === 6 || c === 26 || c === 27) {
              r = o = a;
              continue e;
            }
            s = s.parentNode;
          }
        }
        r = r.return;
      }
  lg(function() {
    var l = o, u = td(n), d = [];
    e: {
      var h = wg.get(t);
      if (h !== void 0) {
        var f = vc, m = t;
        switch (t) {
          case "keypress":
            if (ts(n) === 0)
              break e;
          case "keydown":
          case "keyup":
            f = CE;
            break;
          case "focusin":
            m = "focus", f = Zc;
            break;
          case "focusout":
            m = "blur", f = Zc;
            break;
          case "beforeblur":
          case "afterblur":
            f = Zc;
            break;
          case "click":
            if (n.button === 2)
              break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            f = Ah;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            f = lE;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            f = wE;
            break;
          case _g:
          case Cg:
          case Tg:
            f = hE;
            break;
          case Sg:
            f = bE;
            break;
          case "scroll":
          case "scrollend":
            f = sE;
            break;
          case "wheel":
            f = IE;
            break;
          case "copy":
          case "cut":
          case "paste":
            f = pE;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            f = Rh;
        }
        var E = (e & 4) !== 0, N = !E && (t === "scroll" || t === "scrollend"), g = E ? h !== null ? h + "Capture" : null : h;
        E = [];
        for (var p = l, v; p !== null; ) {
          var C = p;
          if (v = C.stateNode, C = C.tag, C !== 5 && C !== 26 && C !== 27 || v === null || g === null || (C = Zo(p, g), C != null && E.push(
            na(p, C, v)
          )), N)
            break;
          p = p.return;
        }
        0 < E.length && (h = new f(
          h,
          m,
          null,
          n,
          u
        ), d.push({ event: h, listeners: E }));
      }
    }
    if (!(e & 7)) {
      e: {
        if (h = t === "mouseover" || t === "pointerover", f = t === "mouseout" || t === "pointerout", h && n !== Ql && (m = n.relatedTarget || n.fromElement) && (Sr(m) || m[Yi]))
          break e;
        if ((f || h) && (h = u.window === u ? u : (h = u.ownerDocument) ? h.defaultView || h.parentWindow : window, f ? (m = n.relatedTarget || n.toElement, f = l, m = m ? Sr(m) : null, m !== null && (N = ji(m), E = m.tag, m !== N || E !== 5 && E !== 27 && E !== 6) && (m = null)) : (f = null, m = l), f !== m)) {
          if (E = Ah, C = "onMouseLeave", g = "onMouseEnter", p = "mouse", (t === "pointerout" || t === "pointerover") && (E = Rh, C = "onPointerLeave", g = "onPointerEnter", p = "pointer"), N = f == null ? h : Eo(f), v = m == null ? h : Eo(m), h = new E(
            C,
            p + "leave",
            f,
            n,
            u
          ), h.target = N, h.relatedTarget = v, C = null, Sr(u) === l && (E = new E(
            g,
            p + "enter",
            m,
            n,
            u
          ), E.target = v, E.relatedTarget = N, C = E), N = C, f && m)
            t: {
              for (E = f, g = m, p = 0, v = E; v; v = Yr(v))
                p++;
              for (v = 0, C = g; C; C = Yr(C))
                v++;
              for (; 0 < p - v; )
                E = Yr(E), p--;
              for (; 0 < v - p; )
                g = Yr(g), v--;
              for (; p--; ) {
                if (E === g || g !== null && E === g.alternate)
                  break t;
                E = Yr(E), g = Yr(g);
              }
              E = null;
            }
          else
            E = null;
          f !== null && xh(
            d,
            h,
            f,
            E,
            !1
          ), m !== null && N !== null && xh(
            d,
            N,
            m,
            E,
            !0
          );
        }
      }
      e: {
        if (h = l ? Eo(l) : window, f = h.nodeName && h.nodeName.toLowerCase(), f === "select" || f === "input" && h.type === "file")
          var k = Mh;
        else if (Oh(h))
          if (gg)
            k = xE;
          else {
            k = HE;
            var D = PE;
          }
        else
          f = h.nodeName, !f || f.toLowerCase() !== "input" || h.type !== "checkbox" && h.type !== "radio" ? l && ed(l.elementType) && (k = Mh) : k = LE;
        if (k && (k = k(t, l))) {
          pg(
            d,
            k,
            n,
            u
          );
          break e;
        }
        D && D(t, h, l), t === "focusout" && l && h.type === "number" && l.memoizedProps.value != null && Yl(h, "number", h.value);
      }
      switch (D = l ? Eo(l) : window, t) {
        case "focusin":
          (Oh(D) || D.contentEditable === "true") && (ai = D, $l = l, Oo = null);
          break;
        case "focusout":
          Oo = $l = ai = null;
          break;
        case "mousedown":
          Xl = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Xl = !1, Hh(d, n, u);
          break;
        case "selectionchange":
          if (zE)
            break;
        case "keydown":
        case "keyup":
          Hh(d, n, u);
      }
      var z;
      if (id)
        e: {
          switch (t) {
            case "compositionstart":
              var H = "onCompositionStart";
              break e;
            case "compositionend":
              H = "onCompositionEnd";
              break e;
            case "compositionupdate":
              H = "onCompositionUpdate";
              break e;
          }
          H = void 0;
        }
      else
        oi ? hg(t, n) && (H = "onCompositionEnd") : t === "keydown" && n.keyCode === 229 && (H = "onCompositionStart");
      H && (dg && n.locale !== "ko" && (oi || H !== "onCompositionStart" ? H === "onCompositionEnd" && oi && (z = ug()) : (rr = u, nd = "value" in rr ? rr.value : rr.textContent, oi = !0)), D = Rs(l, H), 0 < D.length && (H = new bh(
        H,
        t,
        null,
        n,
        u
      ), d.push({ event: H, listeners: D }), z ? H.data = z : (z = fg(n), z !== null && (H.data = z)))), (z = OE ? ME(t, n) : kE(t, n)) && (H = Rs(l, "onBeforeInput"), 0 < H.length && (D = new bh(
        "onBeforeInput",
        "beforeinput",
        null,
        n,
        u
      ), d.push({
        event: D,
        listeners: H
      }), D.data = z)), jE(
        d,
        t,
        l,
        n,
        u
      );
    }
    Ag(d, e);
  });
}
function na(t, e, n) {
  return {
    instance: t,
    listener: e,
    currentTarget: n
  };
}
function Rs(t, e) {
  for (var n = e + "Capture", r = []; t !== null; ) {
    var i = t, o = i.stateNode;
    i = i.tag, i !== 5 && i !== 26 && i !== 27 || o === null || (i = Zo(t, n), i != null && r.unshift(
      na(t, i, o)
    ), i = Zo(t, e), i != null && r.push(
      na(t, i, o)
    )), t = t.return;
  }
  return r;
}
function Yr(t) {
  if (t === null)
    return null;
  do
    t = t.return;
  while (t && t.tag !== 5 && t.tag !== 27);
  return t || null;
}
function xh(t, e, n, r, i) {
  for (var o = e._reactName, a = []; n !== null && n !== r; ) {
    var s = n, c = s.alternate, l = s.stateNode;
    if (s = s.tag, c !== null && c === r)
      break;
    s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Zo(n, o), l != null && a.unshift(
      na(n, l, c)
    )) : i || (l = Zo(n, o), l != null && a.push(
      na(n, l, c)
    ))), n = n.return;
  }
  a.length !== 0 && t.push({ event: e, listeners: a });
}
var $E = /\r\n?/g, XE = /\u0000|\uFFFD/g;
function qh(t) {
  return (typeof t == "string" ? t : "" + t).replace($E, `
`).replace(XE, "");
}
function Rg(t, e) {
  return e = qh(e), qh(t) === e;
}
function _c() {
}
function _e(t, e, n, r, i, o) {
  switch (n) {
    case "children":
      typeof r == "string" ? e === "body" || e === "textarea" && r === "" || Pi(t, r) : (typeof r == "number" || typeof r == "bigint") && e !== "body" && Pi(t, "" + r);
      break;
    case "className":
      Fc(t, "class", r);
      break;
    case "tabIndex":
      Fc(t, "tabindex", r);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      Fc(t, n, r);
      break;
    case "style":
      cg(t, r, o);
      break;
    case "src":
    case "href":
      if (r === "" && (e !== "a" || n !== "href")) {
        t.removeAttribute(n);
        break;
      }
      if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
        t.removeAttribute(n);
        break;
      }
      r = Vc("" + r), t.setAttribute(n, r);
      break;
    case "action":
    case "formAction":
      if (typeof r == "function") {
        t.setAttribute(
          n,
          "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
        );
        break;
      } else
        typeof o == "function" && (n === "formAction" ? (e !== "input" && _e(t, e, "name", i.name, i, null), _e(
          t,
          e,
          "formEncType",
          i.formEncType,
          i,
          null
        ), _e(
          t,
          e,
          "formMethod",
          i.formMethod,
          i,
          null
        ), _e(
          t,
          e,
          "formTarget",
          i.formTarget,
          i,
          null
        )) : (_e(t, e, "encType", i.encType, i, null), _e(t, e, "method", i.method, i, null), _e(t, e, "target", i.target, i, null)));
      if (r == null || typeof r == "symbol" || typeof r == "boolean") {
        t.removeAttribute(n);
        break;
      }
      r = Vc("" + r), t.setAttribute(n, r);
      break;
    case "onClick":
      r != null && (t.onclick = _c);
      break;
    case "onScroll":
      r != null && de("scroll", t);
      break;
    case "onScrollEnd":
      r != null && de("scrollend", t);
      break;
    case "dangerouslySetInnerHTML":
      if (r != null) {
        if (typeof r != "object" || !("__html" in r))
          throw Error(A(61));
        if (n = r.__html, n != null) {
          if (i.children != null)
            throw Error(A(60));
          t.innerHTML = n;
        }
      }
      break;
    case "multiple":
      t.multiple = r && typeof r != "function" && typeof r != "symbol";
      break;
    case "muted":
      t.muted = r && typeof r != "function" && typeof r != "symbol";
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "ref":
      break;
    case "autoFocus":
      break;
    case "xlinkHref":
      if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
        t.removeAttribute("xlink:href");
        break;
      }
      n = Vc("" + r), t.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        n
      );
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      r != null && typeof r != "function" && typeof r != "symbol" ? t.setAttribute(n, "" + r) : t.removeAttribute(n);
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      r && typeof r != "function" && typeof r != "symbol" ? t.setAttribute(n, "") : t.removeAttribute(n);
      break;
    case "capture":
    case "download":
      r === !0 ? t.setAttribute(n, "") : r !== !1 && r != null && typeof r != "function" && typeof r != "symbol" ? t.setAttribute(n, r) : t.removeAttribute(n);
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? t.setAttribute(n, r) : t.removeAttribute(n);
      break;
    case "rowSpan":
    case "start":
      r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? t.removeAttribute(n) : t.setAttribute(n, r);
      break;
    case "xlinkActuate":
      En(
        t,
        "http://www.w3.org/1999/xlink",
        "xlink:actuate",
        r
      );
      break;
    case "xlinkArcrole":
      En(
        t,
        "http://www.w3.org/1999/xlink",
        "xlink:arcrole",
        r
      );
      break;
    case "xlinkRole":
      En(
        t,
        "http://www.w3.org/1999/xlink",
        "xlink:role",
        r
      );
      break;
    case "xlinkShow":
      En(
        t,
        "http://www.w3.org/1999/xlink",
        "xlink:show",
        r
      );
      break;
    case "xlinkTitle":
      En(
        t,
        "http://www.w3.org/1999/xlink",
        "xlink:title",
        r
      );
      break;
    case "xlinkType":
      En(
        t,
        "http://www.w3.org/1999/xlink",
        "xlink:type",
        r
      );
      break;
    case "xmlBase":
      En(
        t,
        "http://www.w3.org/XML/1998/namespace",
        "xml:base",
        r
      );
      break;
    case "xmlLang":
      En(
        t,
        "http://www.w3.org/XML/1998/namespace",
        "xml:lang",
        r
      );
      break;
    case "xmlSpace":
      En(
        t,
        "http://www.w3.org/XML/1998/namespace",
        "xml:space",
        r
      );
      break;
    case "is":
      Fl(t, "is", r);
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = oE.get(n) || n, Fl(t, n, r));
  }
}
function Jl(t, e, n, r, i, o) {
  switch (n) {
    case "style":
      cg(t, r, o);
      break;
    case "dangerouslySetInnerHTML":
      if (r != null) {
        if (typeof r != "object" || !("__html" in r))
          throw Error(A(61));
        if (n = r.__html, n != null) {
          if (i.children != null)
            throw Error(A(60));
          t.innerHTML = n;
        }
      }
      break;
    case "children":
      typeof r == "string" ? Pi(t, r) : (typeof r == "number" || typeof r == "bigint") && Pi(t, "" + r);
      break;
    case "onScroll":
      r != null && de("scroll", t);
      break;
    case "onScrollEnd":
      r != null && de("scrollend", t);
      break;
    case "onClick":
      r != null && (t.onclick = _c);
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "innerHTML":
    case "ref":
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!ng.hasOwnProperty(n))
        e: {
          if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), e = n.slice(2, i ? n.length - 7 : void 0), o = t[ht] || null, o = o != null ? o[n] : null, typeof o == "function" && t.removeEventListener(e, o, i), typeof r == "function")) {
            typeof o != "function" && o !== null && (n in t ? t[n] = null : t.hasAttribute(n) && t.removeAttribute(n)), t.addEventListener(e, r, i);
            break e;
          }
          n in t ? t[n] = r : r === !0 ? t.setAttribute(n, "") : Fl(t, n, r);
        }
  }
}
function Ze(t, e, n) {
  switch (e) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "input":
      de("invalid", t);
      var r = null, i = null, o = null, a = null, s = null, c = null;
      for (u in n)
        if (n.hasOwnProperty(u)) {
          var l = n[u];
          if (l != null)
            switch (u) {
              case "name":
                r = l;
                break;
              case "type":
                i = l;
                break;
              case "checked":
                s = l;
                break;
              case "defaultChecked":
                c = l;
                break;
              case "value":
                o = l;
                break;
              case "defaultValue":
                a = l;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (l != null)
                  throw Error(A(137, e));
                break;
              default:
                _e(t, e, u, l, n, null);
            }
        }
      og(
        t,
        o,
        a,
        s,
        c,
        i,
        r,
        !1
      ), ws(t);
      return;
    case "select":
      de("invalid", t);
      var u = i = o = null;
      for (r in n)
        if (n.hasOwnProperty(r) && (a = n[r], a != null))
          switch (r) {
            case "value":
              o = a;
              break;
            case "defaultValue":
              i = a;
              break;
            case "multiple":
              u = a;
            default:
              _e(t, e, r, a, n, null);
          }
      e = o, n = i, t.multiple = !!u, e != null ? _i(t, !!u, e, !1) : n != null && _i(t, !!u, n, !0);
      return;
    case "textarea":
      de("invalid", t), o = r = u = null;
      for (i in n)
        if (n.hasOwnProperty(i) && (a = n[i], a != null))
          switch (i) {
            case "value":
              u = a;
              break;
            case "defaultValue":
              r = a;
              break;
            case "children":
              o = a;
              break;
            case "dangerouslySetInnerHTML":
              if (a != null)
                throw Error(A(91));
              break;
            default:
              _e(t, e, i, a, n, null);
          }
      sg(t, u, r, o), ws(t);
      return;
    case "option":
      for (a in n)
        if (n.hasOwnProperty(a) && (u = n[a], u != null))
          switch (a) {
            case "selected":
              t.selected = u && typeof u != "function" && typeof u != "symbol";
              break;
            default:
              _e(t, e, a, u, n, null);
          }
      return;
    case "dialog":
      de("cancel", t), de("close", t);
      break;
    case "iframe":
    case "object":
      de("load", t);
      break;
    case "video":
    case "audio":
      for (u = 0; u < ta.length; u++)
        de(ta[u], t);
      break;
    case "image":
      de("error", t), de("load", t);
      break;
    case "details":
      de("toggle", t);
      break;
    case "embed":
    case "source":
    case "img":
    case "link":
      de("error", t), de("load", t);
    case "area":
    case "base":
    case "br":
    case "col":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "track":
    case "wbr":
    case "menuitem":
      for (s in n)
        if (n.hasOwnProperty(s) && (u = n[s], u != null))
          switch (s) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(A(137, e));
            default:
              _e(t, e, s, u, n, null);
          }
      return;
    default:
      if (ed(e)) {
        for (c in n)
          n.hasOwnProperty(c) && (u = n[c], u !== void 0 && Jl(
            t,
            e,
            c,
            u,
            n,
            void 0
          ));
        return;
      }
  }
  for (o in n)
    n.hasOwnProperty(o) && (u = n[o], u != null && _e(t, e, o, u, n, null));
}
function Bh(t, e, n, r) {
  switch (e) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "input":
      var i = null, o = null, a = null, s = null, c = null, l = null, u = null;
      for (f in n) {
        var d = n[f];
        if (n.hasOwnProperty(f) && d != null)
          switch (f) {
            case "checked":
              break;
            case "value":
              break;
            case "defaultValue":
              c = d;
            default:
              r.hasOwnProperty(f) || _e(t, e, f, null, r, d);
          }
      }
      for (var h in r) {
        var f = r[h];
        if (d = n[h], r.hasOwnProperty(h) && (f != null || d != null))
          switch (h) {
            case "type":
              o = f;
              break;
            case "name":
              i = f;
              break;
            case "checked":
              l = f;
              break;
            case "defaultChecked":
              u = f;
              break;
            case "value":
              a = f;
              break;
            case "defaultValue":
              s = f;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (f != null)
                throw Error(A(137, e));
              break;
            default:
              f !== d && _e(
                t,
                e,
                h,
                f,
                r,
                d
              );
          }
      }
      jl(
        t,
        a,
        s,
        c,
        l,
        u,
        o,
        i
      );
      return;
    case "select":
      f = a = s = h = null;
      for (o in n)
        if (c = n[o], n.hasOwnProperty(o) && c != null)
          switch (o) {
            case "value":
              break;
            case "multiple":
              f = c;
            default:
              r.hasOwnProperty(o) || _e(
                t,
                e,
                o,
                null,
                r,
                c
              );
          }
      for (i in r)
        if (o = r[i], c = n[i], r.hasOwnProperty(i) && (o != null || c != null))
          switch (i) {
            case "value":
              h = o;
              break;
            case "defaultValue":
              s = o;
              break;
            case "multiple":
              a = o;
            default:
              o !== c && _e(
                t,
                e,
                i,
                o,
                r,
                c
              );
          }
      e = s, n = a, r = f, h != null ? _i(t, !!n, h, !1) : !!r != !!n && (e != null ? _i(t, !!n, e, !0) : _i(t, !!n, n ? [] : "", !1));
      return;
    case "textarea":
      f = h = null;
      for (s in n)
        if (i = n[s], n.hasOwnProperty(s) && i != null && !r.hasOwnProperty(s))
          switch (s) {
            case "value":
              break;
            case "children":
              break;
            default:
              _e(t, e, s, null, r, i);
          }
      for (a in r)
        if (i = r[a], o = n[a], r.hasOwnProperty(a) && (i != null || o != null))
          switch (a) {
            case "value":
              h = i;
              break;
            case "defaultValue":
              f = i;
              break;
            case "children":
              break;
            case "dangerouslySetInnerHTML":
              if (i != null)
                throw Error(A(91));
              break;
            default:
              i !== o && _e(t, e, a, i, r, o);
          }
      ag(t, h, f);
      return;
    case "option":
      for (var m in n)
        if (h = n[m], n.hasOwnProperty(m) && h != null && !r.hasOwnProperty(m))
          switch (m) {
            case "selected":
              t.selected = !1;
              break;
            default:
              _e(t, e, m, null, r, h);
          }
      for (c in r)
        if (h = r[c], f = n[c], r.hasOwnProperty(c) && h !== f && (h != null || f != null))
          switch (c) {
            case "selected":
              t.selected = h && typeof h != "function" && typeof h != "symbol";
              break;
            default:
              _e(
                t,
                e,
                c,
                h,
                r,
                f
              );
          }
      return;
    case "img":
    case "link":
    case "area":
    case "base":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "source":
    case "track":
    case "wbr":
    case "menuitem":
      for (var E in n)
        h = n[E], n.hasOwnProperty(E) && h != null && !r.hasOwnProperty(E) && _e(t, e, E, null, r, h);
      for (l in r)
        if (h = r[l], f = n[l], r.hasOwnProperty(l) && h !== f && (h != null || f != null))
          switch (l) {
            case "children":
            case "dangerouslySetInnerHTML":
              if (h != null)
                throw Error(A(137, e));
              break;
            default:
              _e(t, e, l, h, r, f);
          }
      return;
    default:
      if (ed(e)) {
        for (var N in n)
          h = n[N], n.hasOwnProperty(N) && h !== void 0 && !r.hasOwnProperty(N) && Jl(
            t,
            e,
            N,
            void 0,
            r,
            h
          );
        for (u in r)
          h = r[u], f = n[u], !r.hasOwnProperty(u) || h === f || h === void 0 && f === void 0 || Jl(
            t,
            e,
            u,
            h,
            r,
            f
          );
        return;
      }
  }
  for (var g in n)
    h = n[g], n.hasOwnProperty(g) && h != null && !r.hasOwnProperty(g) && _e(t, e, g, null, r, h);
  for (d in r)
    h = r[d], f = n[d], !r.hasOwnProperty(d) || h === f || h == null && f == null || _e(t, e, d, h, r, f);
}
var kt = [], ci = 0, sd = 0;
function Cc() {
  for (var t = ci, e = sd = ci = 0; e < t; ) {
    var n = kt[e];
    kt[e++] = null;
    var r = kt[e];
    kt[e++] = null;
    var i = kt[e];
    kt[e++] = null;
    var o = kt[e];
    if (kt[e++] = null, r !== null && i !== null) {
      var a = r.pending;
      a === null ? i.next = i : (i.next = a.next, a.next = i), r.pending = i;
    }
    o !== 0 && Ig(n, i, o);
  }
}
function Tc(t, e, n, r) {
  kt[ci++] = t, kt[ci++] = e, kt[ci++] = n, kt[ci++] = r, sd |= r, t.lanes |= r, t = t.alternate, t !== null && (t.lanes |= r);
}
function cd(t, e, n, r) {
  return Tc(t, e, n, r), Is(t);
}
function hr(t, e) {
  return Tc(t, null, null, e), Is(t);
}
function Ig(t, e, n) {
  t.lanes |= n;
  var r = t.alternate;
  r !== null && (r.lanes |= n);
  for (var i = !1, o = t.return; o !== null; )
    o.childLanes |= n, r = o.alternate, r !== null && (r.childLanes |= n), o.tag === 22 && (t = o.stateNode, t === null || t._visibility & 1 || (i = !0)), t = o, o = o.return;
  i && e !== null && t.tag === 3 && (o = t.stateNode, i = 31 - qt(n), o = o.hiddenUpdates, t = o[i], t === null ? o[i] = [e] : t.push(e), e.lane = n | 536870912);
}
function Is(t) {
  xd();
  for (var e = t.return; e !== null; )
    t = e, e = t.return;
  return t.tag === 3 ? t.stateNode : null;
}
var li = {}, zh = /* @__PURE__ */ new WeakMap();
function xt(t, e) {
  if (typeof t == "object" && t !== null) {
    var n = zh.get(t);
    typeof n != "string" && (n = Ch(e), zh.set(t, n));
  } else
    n = Ch(e);
  return { value: t, source: e, stack: n };
}
var ui = [], di = 0, Ns = null, Os = 0, Pt = [], Ht = 0, Ir = null, In = 1, Nn = "";
function yr(t, e) {
  ui[di++] = Os, ui[di++] = Ns, Ns = t, Os = e;
}
function Ng(t, e, n) {
  Pt[Ht++] = In, Pt[Ht++] = Nn, Pt[Ht++] = Ir, Ir = t;
  var r = In;
  t = Nn;
  var i = 32 - qt(r) - 1;
  r &= ~(1 << i), n += 1;
  var o = 32 - qt(e) + i;
  if (30 < o) {
    var a = i - i % 5;
    o = (r & (1 << a) - 1).toString(32), r >>= a, i -= a, In = 1 << 32 - qt(e) + i | n << i | r, Nn = o + t;
  } else
    In = 1 << o | n << i | r, Nn = t;
}
function ld(t) {
  t.return !== null && (yr(t, 1), Ng(t, 1, 0));
}
function ud(t) {
  for (; t === Ns; )
    Ns = ui[--di], ui[di] = null, Os = ui[--di], ui[di] = null;
  for (; t === Ir; )
    Ir = Pt[--Ht], Pt[Ht] = null, Nn = Pt[--Ht], Pt[Ht] = null, In = Pt[--Ht], Pt[Ht] = null;
}
var ut = null, Xe = null, le = !1, Qt = null, cn = !1, Zl = Error(A(519));
function Ur(t) {
  var e = Error(A(418, ""));
  throw ra(xt(e, t)), Zl;
}
function Gh(t) {
  var e = t.stateNode, n = t.type, r = t.memoizedProps;
  switch (e[ot] = t, e[ht] = r, n) {
    case "dialog":
      de("cancel", e), de("close", e);
      break;
    case "iframe":
    case "object":
    case "embed":
      de("load", e);
      break;
    case "video":
    case "audio":
      for (n = 0; n < ta.length; n++)
        de(ta[n], e);
      break;
    case "source":
      de("error", e);
      break;
    case "img":
    case "image":
    case "link":
      de("error", e), de("load", e);
      break;
    case "details":
      de("toggle", e);
      break;
    case "input":
      de("invalid", e), og(
        e,
        r.value,
        r.defaultValue,
        r.checked,
        r.defaultChecked,
        r.type,
        r.name,
        !0
      ), ws(e);
      break;
    case "select":
      de("invalid", e);
      break;
    case "textarea":
      de("invalid", e), sg(e, r.value, r.defaultValue, r.children), ws(e);
  }
  n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || e.textContent === "" + n || r.suppressHydrationWarning === !0 || Rg(e.textContent, n) ? (r.onScroll != null && de("scroll", e), r.onScrollEnd != null && de("scrollend", e), r.onClick != null && (e.onclick = _c), e = !0) : e = !1, e || Ur(t);
}
function Kh(t) {
  for (ut = t.return; ut; )
    switch (ut.tag) {
      case 3:
      case 27:
        cn = !0;
        return;
      case 5:
      case 13:
        cn = !1;
        return;
      default:
        ut = ut.return;
    }
}
function so(t) {
  if (t !== ut)
    return !1;
  if (!le)
    return Kh(t), le = !0, !1;
  var e = !1, n;
  if ((n = t.tag !== 3 && t.tag !== 27) && ((n = t.tag === 5) && (n = t.type, n = !(n !== "form" && n !== "button") || Su(t.type, t.memoizedProps)), n = !n), n && (e = !0), e && Xe && Ur(t), Kh(t), t.tag === 13) {
    if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t)
      throw Error(A(317));
    e: {
      for (t = t.nextSibling, e = 0; t; ) {
        if (t.nodeType === 8)
          if (n = t.data, n === "/$") {
            if (e === 0) {
              Xe = Wt(t.nextSibling);
              break e;
            }
            e--;
          } else
            n !== "$" && n !== "$!" && n !== "$?" || e++;
        t = t.nextSibling;
      }
      Xe = null;
    }
  } else
    Xe = ut ? Wt(t.stateNode.nextSibling) : null;
  return !0;
}
function va() {
  Xe = ut = null, le = !1;
}
function ra(t) {
  Qt === null ? Qt = [t] : Qt.push(t);
}
var ns = Error(A(460)), Og = Error(A(474)), Wl = { then: function() {
} };
function Fh(t) {
  return t = t.status, t === "fulfilled" || t === "rejected";
}
function Ua() {
}
function Mg(t, e, n) {
  switch (n = t[n], n === void 0 ? t.push(e) : n !== e && (e.then(Ua, Ua), e = n), e.status) {
    case "fulfilled":
      return e.value;
    case "rejected":
      throw t = e.reason, t === ns ? Error(A(483)) : t;
    default:
      if (typeof e.status == "string")
        e.then(Ua, Ua);
      else {
        if (t = me, t !== null && 100 < t.shellSuspendCounter)
          throw Error(A(482));
        t = e, t.status = "pending", t.then(
          function(r) {
            if (e.status === "pending") {
              var i = e;
              i.status = "fulfilled", i.value = r;
            }
          },
          function(r) {
            if (e.status === "pending") {
              var i = e;
              i.status = "rejected", i.reason = r;
            }
          }
        );
      }
      switch (e.status) {
        case "fulfilled":
          return e.value;
        case "rejected":
          throw t = e.reason, t === ns ? Error(A(483)) : t;
      }
      throw Mo = e, ns;
  }
}
var Mo = null;
function jh() {
  if (Mo === null)
    throw Error(A(459));
  var t = Mo;
  return Mo = null, t;
}
var Ti = null, ia = 0;
function Da(t) {
  var e = ia;
  return ia += 1, Ti === null && (Ti = []), Mg(Ti, t, e);
}
function co(t, e, n, r) {
  t = r.props.ref, n.ref = t !== void 0 ? t : null;
}
function Pa(t, e) {
  throw e.$$typeof === Uy ? Error(A(525)) : (t = Object.prototype.toString.call(e), Error(
    A(
      31,
      t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t
    )
  ));
}
function Yh(t) {
  var e = t._init;
  return e(t._payload);
}
function kg(t) {
  function e(g, p) {
    if (t) {
      var v = g.deletions;
      v === null ? (g.deletions = [p], g.flags |= 16) : v.push(p);
    }
  }
  function n(g, p) {
    if (!t)
      return null;
    for (; p !== null; )
      e(g, p), p = p.sibling;
    return null;
  }
  function r(g) {
    for (var p = /* @__PURE__ */ new Map(); g !== null; )
      g.key !== null ? p.set(g.key, g) : p.set(g.index, g), g = g.sibling;
    return p;
  }
  function i(g, p) {
    return g = ar(g, p), g.index = 0, g.sibling = null, g;
  }
  function o(g, p, v) {
    return g.index = v, t ? (v = g.alternate, v !== null ? (v = v.index, v < p ? (g.flags |= 33554434, p) : v) : (g.flags |= 33554434, p)) : (g.flags |= 1048576, p);
  }
  function a(g) {
    return t && g.alternate === null && (g.flags |= 33554434), g;
  }
  function s(g, p, v, C) {
    return p === null || p.tag !== 6 ? (p = El(v, g.mode, C), p.return = g, p) : (p = i(p, v), p.return = g, p);
  }
  function c(g, p, v, C) {
    var k = v.type;
    return k === mo ? u(
      g,
      p,
      v.props.children,
      C,
      v.key
    ) : p !== null && (p.elementType === k || typeof k == "object" && k !== null && k.$$typeof === vr && Yh(k) === p.type) ? (C = i(p, v.props), co(g, p, C, v), C.return = g, C) : (C = ss(
      v.type,
      v.key,
      v.props,
      null,
      g.mode,
      C
    ), co(g, p, C, v), C.return = g, C);
  }
  function l(g, p, v, C) {
    return p === null || p.tag !== 4 || p.stateNode.containerInfo !== v.containerInfo || p.stateNode.implementation !== v.implementation ? (p = _l(v, g.mode, C), p.return = g, p) : (p = i(p, v.children || []), p.return = g, p);
  }
  function u(g, p, v, C, k) {
    return p === null || p.tag !== 7 ? (p = Or(
      v,
      g.mode,
      C,
      k
    ), p.return = g, p) : (p = i(p, v), p.return = g, p);
  }
  function d(g, p, v) {
    if (typeof p == "string" && p !== "" || typeof p == "number" || typeof p == "bigint")
      return p = El(
        "" + p,
        g.mode,
        v
      ), p.return = g, p;
    if (typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case Ra:
          return v = ss(
            p.type,
            p.key,
            p.props,
            null,
            g.mode,
            v
          ), co(g, null, v, p), v.return = g, v;
        case Ia:
          return p = _l(
            p,
            g.mode,
            v
          ), p.return = g, p;
        case vr:
          var C = p._init;
          return d(g, C(p._payload), v);
      }
      if (vo(p) || io(p))
        return p = Or(
          p,
          g.mode,
          v,
          null
        ), p.return = g, p;
      if (typeof p.then == "function")
        return d(g, Da(p), v);
      if (p.$$typeof === tr)
        return d(
          g,
          xa(g, p, v),
          v
        );
      Pa(g, p);
    }
    return null;
  }
  function h(g, p, v, C) {
    var k = p !== null ? p.key : null;
    if (typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint")
      return k !== null ? null : s(g, p, "" + v, C);
    if (typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case Ra:
          return v.key === k ? c(g, p, v, C) : null;
        case Ia:
          return v.key === k ? l(g, p, v, C) : null;
        case vr:
          return k = v._init, h(g, p, k(v._payload), C);
      }
      if (vo(v) || io(v))
        return k !== null ? null : u(g, p, v, C, null);
      if (typeof v.then == "function")
        return h(
          g,
          p,
          Da(v),
          C
        );
      if (v.$$typeof === tr)
        return h(
          g,
          p,
          xa(g, v, C),
          C
        );
      Pa(g, v);
    }
    return null;
  }
  function f(g, p, v, C, k) {
    if (typeof C == "string" && C !== "" || typeof C == "number" || typeof C == "bigint")
      return g = g.get(v) || null, s(p, g, "" + C, k);
    if (typeof C == "object" && C !== null) {
      switch (C.$$typeof) {
        case Ra:
          return g = g.get(
            C.key === null ? v : C.key
          ) || null, c(p, g, C, k);
        case Ia:
          return g = g.get(
            C.key === null ? v : C.key
          ) || null, l(p, g, C, k);
        case vr:
          var D = C._init;
          return f(
            g,
            p,
            v,
            D(C._payload),
            k
          );
      }
      if (vo(C) || io(C))
        return g = g.get(v) || null, u(p, g, C, k, null);
      if (typeof C.then == "function")
        return f(
          g,
          p,
          v,
          Da(C),
          k
        );
      if (C.$$typeof === tr)
        return f(
          g,
          p,
          v,
          xa(p, C, k),
          k
        );
      Pa(p, C);
    }
    return null;
  }
  function m(g, p, v, C) {
    for (var k = null, D = null, z = p, H = p = 0, we = null; z !== null && H < v.length; H++) {
      z.index > H ? (we = z, z = null) : we = z.sibling;
      var ee = h(
        g,
        z,
        v[H],
        C
      );
      if (ee === null) {
        z === null && (z = we);
        break;
      }
      t && z && ee.alternate === null && e(g, z), p = o(ee, p, H), D === null ? k = ee : D.sibling = ee, D = ee, z = we;
    }
    if (H === v.length)
      return n(g, z), le && yr(g, H), k;
    if (z === null) {
      for (; H < v.length; H++)
        z = d(g, v[H], C), z !== null && (p = o(
          z,
          p,
          H
        ), D === null ? k = z : D.sibling = z, D = z);
      return le && yr(g, H), k;
    }
    for (z = r(z); H < v.length; H++)
      we = f(
        z,
        g,
        H,
        v[H],
        C
      ), we !== null && (t && we.alternate !== null && z.delete(
        we.key === null ? H : we.key
      ), p = o(
        we,
        p,
        H
      ), D === null ? k = we : D.sibling = we, D = we);
    return t && z.forEach(function(tt) {
      return e(g, tt);
    }), le && yr(g, H), k;
  }
  function E(g, p, v, C) {
    if (v == null)
      throw Error(A(151));
    for (var k = null, D = null, z = p, H = p = 0, we = null, ee = v.next(); z !== null && !ee.done; H++, ee = v.next(), null) {
      z.index > H ? (we = z, z = null) : we = z.sibling;
      var tt = h(g, z, ee.value, C);
      if (tt === null) {
        z === null && (z = we);
        break;
      }
      t && z && tt.alternate === null && e(g, z), p = o(tt, p, H), D === null ? k = tt : D.sibling = tt, D = tt, z = we;
    }
    if (ee.done)
      return n(g, z), le && yr(g, H), k;
    if (z === null) {
      for (; !ee.done; H++, ee = v.next(), null)
        ee = d(g, ee.value, C), ee !== null && (p = o(ee, p, H), D === null ? k = ee : D.sibling = ee, D = ee);
      return le && yr(g, H), k;
    }
    for (z = r(z); !ee.done; H++, ee = v.next(), null)
      ee = f(z, g, H, ee.value, C), ee !== null && (t && ee.alternate !== null && z.delete(ee.key === null ? H : ee.key), p = o(ee, p, H), D === null ? k = ee : D.sibling = ee, D = ee);
    return t && z.forEach(function(jr) {
      return e(g, jr);
    }), le && yr(g, H), k;
  }
  function N(g, p, v, C) {
    if (typeof v == "object" && v !== null && v.type === mo && v.key === null && (v = v.props.children), typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case Ra:
          e: {
            for (var k = v.key, D = p; D !== null; ) {
              if (D.key === k) {
                if (k = v.type, k === mo) {
                  if (D.tag === 7) {
                    n(g, D.sibling), p = i(
                      D,
                      v.props.children
                    ), p.return = g, g = p;
                    break e;
                  }
                } else if (D.elementType === k || typeof k == "object" && k !== null && k.$$typeof === vr && Yh(k) === D.type) {
                  n(g, D.sibling), p = i(D, v.props), co(g, D, p, v), p.return = g, g = p;
                  break e;
                }
                n(g, D);
                break;
              } else
                e(g, D);
              D = D.sibling;
            }
            v.type === mo ? (p = Or(
              v.props.children,
              g.mode,
              C,
              v.key
            ), p.return = g, g = p) : (C = ss(
              v.type,
              v.key,
              v.props,
              null,
              g.mode,
              C
            ), co(g, p, C, v), C.return = g, g = C);
          }
          return a(g);
        case Ia:
          e: {
            for (D = v.key; p !== null; ) {
              if (p.key === D)
                if (p.tag === 4 && p.stateNode.containerInfo === v.containerInfo && p.stateNode.implementation === v.implementation) {
                  n(
                    g,
                    p.sibling
                  ), p = i(
                    p,
                    v.children || []
                  ), p.return = g, g = p;
                  break e;
                } else {
                  n(g, p);
                  break;
                }
              else
                e(g, p);
              p = p.sibling;
            }
            p = _l(
              v,
              g.mode,
              C
            ), p.return = g, g = p;
          }
          return a(g);
        case vr:
          return D = v._init, N(
            g,
            p,
            D(v._payload),
            C
          );
      }
      if (vo(v))
        return m(
          g,
          p,
          v,
          C
        );
      if (io(v)) {
        if (D = io(v), typeof D != "function")
          throw Error(A(150));
        return v = D.call(v), E(
          g,
          p,
          v,
          C
        );
      }
      if (typeof v.then == "function")
        return N(
          g,
          p,
          Da(v),
          C
        );
      if (v.$$typeof === tr)
        return N(
          g,
          p,
          xa(g, v, C),
          C
        );
      Pa(g, v);
    }
    return typeof v == "string" && v !== "" || typeof v == "number" || typeof v == "bigint" ? (v = "" + v, p !== null && p.tag === 6 ? (n(g, p.sibling), p = i(p, v), p.return = g, g = p) : (n(g, p), p = El(
      v,
      g.mode,
      C
    ), p.return = g, g = p), a(g)) : n(g, p);
  }
  return function(g, p, v, C) {
    return ia = 0, g = N(
      g,
      p,
      v,
      C
    ), Ti = null, g;
  };
}
var Dr = kg(!0), Ug = kg(!1), Hi = vn(null), Ms = vn(0);
function Qh(t, e) {
  t = zn, Te(Ms, t), Te(Hi, e), zn = t | e.baseLanes;
}
function eu() {
  Te(Ms, zn), Te(Hi, Hi.current);
}
function dd() {
  zn = Ms.current, je(Hi), je(Ms);
}
var pn = vn(null), fn = null;
function Xn(t) {
  var e = t.alternate;
  Te(Be, Be.current & 1), Te(pn, t), fn === null && (e === null || Hi.current !== null || e.memoizedState !== null) && (fn = t);
}
function Dg(t) {
  if (t.tag === 22) {
    if (Te(Be, Be.current), Te(pn, t), fn === null) {
      var e = t.alternate;
      e !== null && e.memoizedState !== null && (fn = t);
    }
  } else
    Jn();
}
function Jn() {
  Te(Be, Be.current), Te(pn, pn.current);
}
function On(t) {
  je(pn), fn === t && (fn = null), je(Be);
}
var Be = vn(0);
function ks(t) {
  for (var e = t; e !== null; ) {
    if (e.tag === 13) {
      var n = e.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!"))
        return e;
    } else if (e.tag === 19 && e.memoizedProps.revealOrder !== void 0) {
      if (e.flags & 128)
        return e;
    } else if (e.child !== null) {
      e.child.return = e, e = e.child;
      continue;
    }
    if (e === t)
      break;
    for (; e.sibling === null; ) {
      if (e.return === null || e.return === t)
        return null;
      e = e.return;
    }
    e.sibling.return = e.return, e = e.sibling;
  }
  return null;
}
var JE = typeof AbortController < "u" ? AbortController : function() {
  var t = [], e = this.signal = {
    aborted: !1,
    addEventListener: function(n, r) {
      t.push(r);
    }
  };
  this.abort = function() {
    e.aborted = !0, t.forEach(function(n) {
      return n();
    });
  };
}, ZE = ze.unstable_scheduleCallback, WE = ze.unstable_NormalPriority, xe = {
  $$typeof: tr,
  Consumer: null,
  Provider: null,
  _currentValue: null,
  _currentValue2: null,
  _threadCount: 0
};
function hd() {
  return {
    controller: new JE(),
    data: /* @__PURE__ */ new Map(),
    refCount: 0
  };
}
function ya(t) {
  t.refCount--, t.refCount === 0 && ZE(WE, function() {
    t.controller.abort();
  });
}
var Us = null, Wr = null, tu = !1, Ds = !1, al = !1, Si = 0;
function Tt(t) {
  t !== Wr && t.next === null && (Wr === null ? Us = Wr = t : Wr = Wr.next = t), Ds = !0, tu || (tu = !0, t_(e_));
}
function Ea(t) {
  if (!al && Ds) {
    al = !0;
    do
      for (var e = !1, n = Us; n !== null; ) {
        {
          var r = ae;
          r = Ss(
            n,
            n === me ? r : 0
          ), r & 3 && (e = !0, C_(n, r));
        }
        n = n.next;
      }
    while (e);
    al = !1;
  }
}
function e_() {
  Ds = tu = !1;
  for (var t = hn(), e = null, n = Us; n !== null; ) {
    var r = n.next;
    if (Si !== 0 && O_()) {
      var i = n, o = Si;
      i.pendingLanes |= 2, i.entangledLanes |= 2, i.entanglements[1] |= o;
    }
    i = Pg(n, t), i === 0 ? (n.next = null, e === null ? Us = r : e.next = r, r === null && (Wr = e)) : (e = n, i & 3 && (Ds = !0)), n = r;
  }
  Si = 0, Ea();
}
function Pg(t, e) {
  for (var n = t.suspendedLanes, r = t.pingedLanes, i = t.expirationTimes, o = t.pendingLanes & -62914561; 0 < o; ) {
    var a = 31 - qt(o), s = 1 << a, c = i[a];
    c === -1 ? (!(s & n) || s & r) && (i[a] = Vy(s, e)) : c <= e && (t.expiredLanes |= s), o &= ~s;
  }
  if (e = me, n = ae, n = Ss(
    t,
    t === e ? n : 0
  ), r = t.callbackNode, n === 0 || t === e && Ae === 2 || t.cancelPendingCommit !== null)
    return r !== null && r !== null && Gc(r), t.callbackNode = null, t.callbackPriority = 0;
  if (n & 3)
    return r !== null && r !== null && Gc(r), t.callbackPriority = 2, t.callbackNode = null, 2;
  if (e = n & -n, e === t.callbackPriority)
    return e;
  switch (r !== null && Gc(r), Wp(n)) {
    case 2:
      n = Zu;
      break;
    case 8:
      n = Yp;
      break;
    case 32:
      n = Ts;
      break;
    case 268435456:
      n = Qp;
      break;
    default:
      n = Ts;
  }
  return r = Xm.bind(null, t), n = Ju(n, r), t.callbackPriority = e, t.callbackNode = n, e;
}
function t_(t) {
  k_(function() {
    he & 6 ? Ju(Zu, t) : t();
  });
}
function fd() {
  return Si === 0 && (Si = $p()), Si;
}
var ko = null, nu = 0, Li = 0, wi = null;
function n_(t, e) {
  if (ko === null) {
    var n = ko = [];
    nu = 0, Li = fd(), wi = {
      status: "pending",
      value: void 0,
      then: function(r) {
        n.push(r);
      }
    };
  }
  return nu++, e.then(Vh, Vh), e;
}
function Vh() {
  if (ko !== null && --nu === 0) {
    wi !== null && (wi.status = "fulfilled");
    var t = ko;
    ko = null, Li = 0, wi = null;
    for (var e = 0; e < t.length; e++)
      (0, t[e])();
  }
}
function r_(t, e) {
  var n = [], r = {
    status: "pending",
    value: null,
    reason: null,
    then: function(i) {
      n.push(i);
    }
  };
  return t.then(
    function() {
      r.status = "fulfilled", r.value = e;
      for (var i = 0; i < n.length; i++)
        (0, n[i])(e);
    },
    function(i) {
      for (r.status = "rejected", r.reason = i, i = 0; i < n.length; i++)
        (0, n[i])(void 0);
    }
  ), r;
}
function pd() {
  var t = ne.T;
  return t !== null && t._callbacks.add(i_), t;
}
function i_(t, e) {
  n_(t, e);
}
function Hg(t, e) {
  t._callbacks.forEach(function(n) {
    return n(t, e);
  });
}
var Nr = vn(null);
function gd() {
  var t = Nr.current;
  return t !== null ? t : me.pooledCache;
}
function rs(t, e) {
  e === null ? Te(Nr, Nr.current) : Te(Nr, e.pool);
}
function Lg() {
  var t = gd();
  return t === null ? null : { parent: xe._currentValue, pool: t };
}
var fr = 0, te = null, ge = null, De = null, Ps = !1, Ai = !1, Pr = !1, Hs = 0, oa = 0, bi = null, o_ = 0;
function ke() {
  throw Error(A(321));
}
function md(t, e) {
  if (e === null)
    return !1;
  for (var n = 0; n < e.length && n < t.length; n++)
    if (!zt(t[n], e[n]))
      return !1;
  return !0;
}
function vd(t, e, n, r, i, o) {
  return fr = o, te = e, e.memoizedState = null, e.updateQueue = null, e.lanes = 0, ne.H = t === null || t.memoizedState === null ? $i : Xi, Pr = !1, t = n(r, i), Pr = !1, Ai && (t = qg(
    e,
    n,
    r,
    i
  )), xg(), t;
}
function xg() {
  ne.H = Bn;
  var t = ge !== null && ge.next !== null;
  if (fr = 0, De = ge = te = null, Ps = !1, oa = 0, bi = null, t)
    throw Error(A(300));
}
function qg(t, e, n, r) {
  te = t;
  var i = 0;
  do {
    if (Ai && (bi = null), oa = 0, Ai = !1, 25 <= i)
      throw Error(A(301));
    i += 1, De = ge = null, t.updateQueue = null, ne.H = Ji;
    var o = e(n, r);
  } while (Ai);
  return o;
}
function a_() {
  var t = ne.H, e = t.useState()[0];
  return e = typeof e.then == "function" ? _a(e) : e, t = t.useState()[0], (ge !== null ? ge.memoizedState : null) !== t && (te.flags |= 1024), e;
}
function yd() {
  var t = Hs !== 0;
  return Hs = 0, t;
}
function Ed(t, e, n) {
  e.updateQueue = t.updateQueue, e.flags &= -2053, t.lanes &= ~n;
}
function _d(t) {
  if (Ps) {
    for (t = t.memoizedState; t !== null; ) {
      var e = t.queue;
      e !== null && (e.pending = null), t = t.next;
    }
    Ps = !1;
  }
  fr = 0, De = ge = te = null, Ai = !1, oa = Hs = 0, bi = null;
}
function _t() {
  var t = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  return De === null ? te.memoizedState = De = t : De = De.next = t, De;
}
function He() {
  if (ge === null) {
    var t = te.alternate;
    t = t !== null ? t.memoizedState : null;
  } else
    t = ge.next;
  var e = De === null ? te.memoizedState : De.next;
  if (e !== null)
    De = e, ge = t;
  else {
    if (t === null)
      throw te.alternate === null ? Error(A(467)) : Error(A(310));
    ge = t, t = {
      memoizedState: ge.memoizedState,
      baseState: ge.baseState,
      baseQueue: ge.baseQueue,
      queue: ge.queue,
      next: null
    }, De === null ? te.memoizedState = De = t : De = De.next = t;
  }
  return De;
}
var Cd;
Cd = function() {
  return { lastEffect: null, events: null, stores: null };
};
function _a(t) {
  var e = oa;
  return oa += 1, bi === null && (bi = []), t = Mg(bi, t, e), te.alternate === null && (De === null ? te.memoizedState === null : De.next === null) && (ne.H = $i), t;
}
function Sc(t) {
  if (t !== null && typeof t == "object") {
    if (typeof t.then == "function")
      return _a(t);
    if (t.$$typeof === tr)
      return at(t);
  }
  throw Error(A(438, String(t)));
}
function qn(t, e) {
  return typeof e == "function" ? e(t) : e;
}
function is(t) {
  var e = He();
  return Td(e, ge, t);
}
function Td(t, e, n) {
  var r = t.queue;
  if (r === null)
    throw Error(A(311));
  r.lastRenderedReducer = n;
  var i = t.baseQueue, o = r.pending;
  if (o !== null) {
    if (i !== null) {
      var a = i.next;
      i.next = o.next, o.next = a;
    }
    e.baseQueue = i = o, r.pending = null;
  }
  if (o = t.baseState, i === null)
    t.memoizedState = o;
  else {
    e = i.next;
    var s = a = null, c = null, l = e, u = !1;
    do {
      var d = l.lane & -536870913;
      if (d !== l.lane ? (ae & d) === d : (fr & d) === d) {
        var h = l.revertLane;
        if (h === 0)
          c !== null && (c = c.next = {
            lane: 0,
            revertLane: 0,
            action: l.action,
            hasEagerState: l.hasEagerState,
            eagerState: l.eagerState,
            next: null
          }), d === Li && (u = !0);
        else if ((fr & h) === h) {
          l = l.next, h === Li && (u = !0);
          continue;
        } else
          d = {
            lane: 0,
            revertLane: l.revertLane,
            action: l.action,
            hasEagerState: l.hasEagerState,
            eagerState: l.eagerState,
            next: null
          }, c === null ? (s = c = d, a = o) : c = c.next = d, te.lanes |= h, Gn |= h;
        d = l.action, Pr && n(o, d), o = l.hasEagerState ? l.eagerState : n(o, d);
      } else
        h = {
          lane: d,
          revertLane: l.revertLane,
          action: l.action,
          hasEagerState: l.hasEagerState,
          eagerState: l.eagerState,
          next: null
        }, c === null ? (s = c = h, a = o) : c = c.next = h, te.lanes |= d, Gn |= d;
      l = l.next;
    } while (l !== null && l !== e);
    if (c === null ? a = o : c.next = s, !zt(o, t.memoizedState) && (Je = !0, u && (n = wi, n !== null)))
      throw n;
    t.memoizedState = o, t.baseState = a, t.baseQueue = c, r.lastRenderedState = o;
  }
  return i === null && (r.lanes = 0), [t.memoizedState, r.dispatch];
}
function sl(t) {
  var e = He(), n = e.queue;
  if (n === null)
    throw Error(A(311));
  n.lastRenderedReducer = t;
  var r = n.dispatch, i = n.pending, o = e.memoizedState;
  if (i !== null) {
    n.pending = null;
    var a = i = i.next;
    do
      o = t(o, a.action), a = a.next;
    while (a !== i);
    zt(o, e.memoizedState) || (Je = !0), e.memoizedState = o, e.baseQueue === null && (e.baseState = o), n.lastRenderedState = o;
  }
  return [o, r];
}
function Bg(t, e, n) {
  var r = te, i = He(), o = le;
  if (o) {
    if (n === void 0)
      throw Error(A(407));
    n = n();
  } else
    n = e();
  var a = !zt(
    (ge || i).memoizedState,
    n
  );
  if (a && (i.memoizedState = n, Je = !0), i = i.queue, Sd(Kg.bind(null, r, i, t), [
    t
  ]), i.getSnapshot !== e || a || De !== null && De.memoizedState.tag & 1) {
    if (r.flags |= 2048, xi(
      9,
      Gg.bind(
        null,
        r,
        i,
        n,
        e
      ),
      { destroy: void 0 },
      null
    ), me === null)
      throw Error(A(349));
    o || fr & 60 || zg(r, e, n);
  }
  return n;
}
function zg(t, e, n) {
  t.flags |= 16384, t = { getSnapshot: e, value: n }, e = te.updateQueue, e === null ? (e = Cd(), te.updateQueue = e, e.stores = [t]) : (n = e.stores, n === null ? e.stores = [t] : n.push(t));
}
function Gg(t, e, n, r) {
  e.value = n, e.getSnapshot = r, Fg(e) && jg(t);
}
function Kg(t, e, n) {
  return n(function() {
    Fg(e) && jg(t);
  });
}
function Fg(t) {
  var e = t.getSnapshot;
  t = t.value;
  try {
    var n = e();
    return !zt(t, n);
  } catch {
    return !0;
  }
}
function jg(t) {
  var e = hr(t, 2);
  e !== null && ft(e, t, 2);
}
function ru(t) {
  var e = _t();
  if (typeof t == "function") {
    var n = t;
    t = n(), Pr && (nr(!0), n(), nr(!1));
  }
  return e.memoizedState = e.baseState = t, e.queue = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: qn,
    lastRenderedState: t
  }, e;
}
function Yg(t, e, n, r) {
  return t.baseState = n, Td(
    t,
    ge,
    typeof r == "function" ? r : qn
  );
}
function s_(t, e, n, r, i) {
  if (Ac(t))
    throw Error(A(485));
  t = e.pending, t === null ? (t = { payload: i, next: null }, t.next = e.pending = t, Qg(e, n, r, i)) : e.pending = t.next = { payload: i, next: t.next };
}
function Qg(t, e, n, r) {
  var i = t.action, o = t.state, a = ne.T, s = { _callbacks: /* @__PURE__ */ new Set() };
  ne.T = s, e(!0);
  try {
    var c = i(o, r);
    c !== null && typeof c == "object" && typeof c.then == "function" ? (Hg(s, c), c.then(
      function(l) {
        t.state = l, Ha(
          t,
          e,
          n
        );
      },
      function() {
        return Ha(
          t,
          e,
          n
        );
      }
    ), n(c)) : (n(c), t.state = c, Ha(t, e, n));
  } catch (l) {
    n({ then: function() {
    }, status: "rejected", reason: l }), Ha(t, e, n);
  } finally {
    ne.T = a;
  }
}
function Ha(t, e, n) {
  var r = t.pending;
  if (r !== null) {
    var i = r.next;
    i === r ? t.pending = null : (i = i.next, r.next = i, Qg(
      t,
      e,
      n,
      i.payload
    ));
  }
}
function Vg(t, e) {
  return e;
}
function $g(t, e) {
  if (le) {
    var n = me.formState;
    if (n !== null) {
      e: {
        var r = te;
        if (le) {
          if (Xe) {
            t: {
              for (var i = Xe, o = cn; i.nodeType !== 8; ) {
                if (!o) {
                  i = null;
                  break t;
                }
                if (i = Wt(
                  i.nextSibling
                ), i === null) {
                  i = null;
                  break t;
                }
              }
              o = i.data, i = o === "F!" || o === "F" ? i : null;
            }
            if (i) {
              Xe = Wt(
                i.nextSibling
              ), r = i.data === "F!";
              break e;
            }
          }
          Ur(r);
        }
        r = !1;
      }
      r && (e = n[0]);
    }
  }
  return n = _t(), n.memoizedState = n.baseState = e, r = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: Vg,
    lastRenderedState: e
  }, n.queue = r, n = Ri.bind(
    null,
    te,
    r
  ), r.dispatch = n, r = ru(!1), o = Rd.bind(
    null,
    te,
    !1,
    r.queue
  ), r = _t(), i = {
    state: e,
    dispatch: null,
    action: t,
    pending: null
  }, r.queue = i, n = s_.bind(
    null,
    te,
    i,
    o,
    n
  ), i.dispatch = n, r.memoizedState = t, [e, n, !1];
}
function Xg(t) {
  var e = He();
  return Jg(e, ge, t);
}
function Jg(t, e, n) {
  e = Td(
    t,
    e,
    Vg
  )[0], t = is(qn)[0], e = typeof e == "object" && e !== null && typeof e.then == "function" ? _a(e) : e;
  var r = He(), i = r.queue, o = i.dispatch;
  return n !== r.memoizedState && (te.flags |= 2048, xi(
    9,
    c_.bind(null, i, n),
    { destroy: void 0 },
    null
  )), [e, o, t];
}
function c_(t, e) {
  t.action = e;
}
function Zg(t) {
  var e = He(), n = ge;
  if (n !== null)
    return Jg(e, n, t);
  He(), e = e.memoizedState, n = He();
  var r = n.queue.dispatch;
  return n.memoizedState = t, [e, r, !1];
}
function xi(t, e, n, r) {
  return t = { tag: t, create: e, inst: n, deps: r, next: null }, e = te.updateQueue, e === null ? (e = Cd(), te.updateQueue = e, e.lastEffect = t.next = t) : (n = e.lastEffect, n === null ? e.lastEffect = t.next = t : (r = n.next, n.next = t, t.next = r, e.lastEffect = t)), t;
}
function Wg() {
  return He().memoizedState;
}
function os(t, e, n, r) {
  var i = _t();
  te.flags |= t, i.memoizedState = xi(
    1 | e,
    n,
    { destroy: void 0 },
    r === void 0 ? null : r
  );
}
function wc(t, e, n, r) {
  var i = He();
  r = r === void 0 ? null : r;
  var o = i.memoizedState.inst;
  ge !== null && r !== null && md(r, ge.memoizedState.deps) ? i.memoizedState = xi(e, n, o, r) : (te.flags |= t, i.memoizedState = xi(1 | e, n, o, r));
}
function $h(t, e) {
  os(8390656, 8, t, e);
}
function Sd(t, e) {
  wc(2048, 8, t, e);
}
function em(t, e) {
  return wc(4, 2, t, e);
}
function tm(t, e) {
  return wc(4, 4, t, e);
}
function nm(t, e) {
  if (typeof e == "function") {
    t = t();
    var n = e(t);
    return function() {
      typeof n == "function" ? n() : e(null);
    };
  }
  if (e != null)
    return t = t(), e.current = t, function() {
      e.current = null;
    };
}
function rm(t, e, n) {
  n = n != null ? n.concat([t]) : null, wc(4, 4, nm.bind(null, e, t), n);
}
function wd() {
}
function im(t, e) {
  var n = He();
  e = e === void 0 ? null : e;
  var r = n.memoizedState;
  return e !== null && md(e, r[1]) ? r[0] : (n.memoizedState = [t, e], t);
}
function om(t, e) {
  var n = He();
  e = e === void 0 ? null : e;
  var r = n.memoizedState;
  return e !== null && md(e, r[1]) ? r[0] : (r = t(), Pr && (nr(!0), t(), nr(!1)), n.memoizedState = [r, e], r);
}
function Ad(t, e, n) {
  return n === void 0 || fr & 1073741824 ? t.memoizedState = e : (t.memoizedState = n, t = $m(), te.lanes |= t, Gn |= t, n);
}
function am(t, e, n, r) {
  return zt(n, e) ? n : Hi.current !== null ? (t = Ad(t, n, r), zt(t, e) || (Je = !0), t) : fr & 42 ? (t = $m(), te.lanes |= t, Gn |= t, e) : (Je = !0, t.memoizedState = n);
}
function sm(t, e, n, r, i) {
  var o = Ce.p;
  Ce.p = o !== 0 && 8 > o ? o : 8;
  var a = ne.T, s = { _callbacks: /* @__PURE__ */ new Set() };
  ne.T = s, Rd(t, !1, e, n);
  try {
    var c = i();
    if (c !== null && typeof c == "object" && typeof c.then == "function") {
      Hg(s, c);
      var l = r_(
        c,
        r
      );
      Ri(t, e, l);
    } else
      Ri(t, e, r);
  } catch (u) {
    Ri(t, e, {
      then: function() {
      },
      status: "rejected",
      reason: u
    });
  } finally {
    Ce.p = o, ne.T = a;
  }
}
function cm(t, e, n, r) {
  if (t.tag !== 5)
    throw Error(A(476));
  var i = lm(t).queue;
  sm(
    t,
    i,
    e,
    Ro,
    function() {
      return um(t), n(r);
    }
  );
}
function lm(t) {
  var e = t.memoizedState;
  if (e !== null)
    return e;
  e = {
    memoizedState: Ro,
    baseState: Ro,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: qn,
      lastRenderedState: Ro
    },
    next: null
  };
  var n = {};
  return e.next = {
    memoizedState: n,
    baseState: n,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: qn,
      lastRenderedState: n
    },
    next: null
  }, t.memoizedState = e, t = t.alternate, t !== null && (t.memoizedState = e), e;
}
function um(t) {
  pd();
  var e = lm(t).next.queue;
  Ri(t, e, {});
}
function bd() {
  var t = at(Es);
  return t !== null ? t : Ro;
}
function dm() {
  return He().memoizedState;
}
function hm() {
  return He().memoizedState;
}
function l_(t) {
  for (var e = t.return; e !== null; ) {
    switch (e.tag) {
      case 24:
      case 3:
        var n = Pn();
        t = Dn(n);
        var r = or(e, t, n);
        r !== null && (ft(r, e, n), Do(r, e, n)), e = { cache: hd() }, t.payload = e;
        return;
    }
    e = e.return;
  }
}
function u_(t, e, n) {
  var r = Pn();
  n = {
    lane: r,
    revertLane: 0,
    action: n,
    hasEagerState: !1,
    eagerState: null,
    next: null
  }, Ac(t) ? fm(e, n) : (n = cd(t, e, n, r), n !== null && (ft(n, t, r), pm(n, e, r)));
}
function Ri(t, e, n) {
  var r = Pn(), i = {
    lane: r,
    revertLane: 0,
    action: n,
    hasEagerState: !1,
    eagerState: null,
    next: null
  };
  if (Ac(t))
    fm(e, i);
  else {
    var o = t.alternate;
    if (t.lanes === 0 && (o === null || o.lanes === 0) && (o = e.lastRenderedReducer, o !== null))
      try {
        var a = e.lastRenderedState, s = o(a, n);
        if (i.hasEagerState = !0, i.eagerState = s, zt(s, a)) {
          Tc(t, e, i, 0), me === null && Cc();
          return;
        }
      } catch {
      } finally {
      }
    n = cd(t, e, i, r), n !== null && (ft(n, t, r), pm(n, e, r));
  }
}
function Rd(t, e, n, r) {
  if (pd(), r = {
    lane: 2,
    revertLane: fd(),
    action: r,
    hasEagerState: !1,
    eagerState: null,
    next: null
  }, Ac(t)) {
    if (e)
      throw Error(A(479));
  } else
    e = cd(
      t,
      n,
      r,
      2
    ), e !== null && ft(e, t, 2);
}
function Ac(t) {
  var e = t.alternate;
  return t === te || e !== null && e === te;
}
function fm(t, e) {
  Ai = Ps = !0;
  var n = t.pending;
  n === null ? e.next = e : (e.next = n.next, n.next = e), t.pending = e;
}
function pm(t, e, n) {
  if (n & 4194176) {
    var r = e.lanes;
    r &= t.pendingLanes, n |= r, e.lanes = n, Zp(t, n);
  }
}
var Bn = {
  readContext: at,
  use: Sc,
  useCallback: ke,
  useContext: ke,
  useEffect: ke,
  useImperativeHandle: ke,
  useLayoutEffect: ke,
  useInsertionEffect: ke,
  useMemo: ke,
  useReducer: ke,
  useRef: ke,
  useState: ke,
  useDebugValue: ke,
  useDeferredValue: ke,
  useTransition: ke,
  useSyncExternalStore: ke,
  useId: ke
};
Bn.useCacheRefresh = ke;
Bn.useHostTransitionStatus = ke;
Bn.useFormState = ke;
Bn.useActionState = ke;
Bn.useOptimistic = ke;
var $i = {
  readContext: at,
  use: Sc,
  useCallback: function(t, e) {
    return _t().memoizedState = [
      t,
      e === void 0 ? null : e
    ], t;
  },
  useContext: at,
  useEffect: $h,
  useImperativeHandle: function(t, e, n) {
    n = n != null ? n.concat([t]) : null, os(
      4194308,
      4,
      nm.bind(null, e, t),
      n
    );
  },
  useLayoutEffect: function(t, e) {
    return os(4194308, 4, t, e);
  },
  useInsertionEffect: function(t, e) {
    os(4, 2, t, e);
  },
  useMemo: function(t, e) {
    var n = _t();
    e = e === void 0 ? null : e;
    var r = t();
    return Pr && (nr(!0), t(), nr(!1)), n.memoizedState = [r, e], r;
  },
  useReducer: function(t, e, n) {
    var r = _t();
    if (n !== void 0) {
      var i = n(e);
      Pr && (nr(!0), n(e), nr(!1));
    } else
      i = e;
    return r.memoizedState = r.baseState = i, t = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: t,
      lastRenderedState: i
    }, r.queue = t, t = t.dispatch = u_.bind(
      null,
      te,
      t
    ), [r.memoizedState, t];
  },
  useRef: function(t) {
    var e = _t();
    return t = { current: t }, e.memoizedState = t;
  },
  useState: function(t) {
    t = ru(t);
    var e = t.queue, n = Ri.bind(null, te, e);
    return e.dispatch = n, [t.memoizedState, n];
  },
  useDebugValue: wd,
  useDeferredValue: function(t, e) {
    var n = _t();
    return Ad(n, t, e);
  },
  useTransition: function() {
    var t = ru(!1);
    return t = sm.bind(
      null,
      te,
      t.queue,
      !0,
      !1
    ), _t().memoizedState = t, [!1, t];
  },
  useSyncExternalStore: function(t, e, n) {
    var r = te, i = _t();
    if (le) {
      if (n === void 0)
        throw Error(A(407));
      n = n();
    } else {
      if (n = e(), me === null)
        throw Error(A(349));
      ae & 60 || zg(r, e, n);
    }
    i.memoizedState = n;
    var o = { value: n, getSnapshot: e };
    return i.queue = o, $h(Kg.bind(null, r, o, t), [
      t
    ]), r.flags |= 2048, xi(
      9,
      Gg.bind(
        null,
        r,
        o,
        n,
        e
      ),
      { destroy: void 0 },
      null
    ), n;
  },
  useId: function() {
    var t = _t(), e = me.identifierPrefix;
    if (le) {
      var n = Nn, r = In;
      n = (r & ~(1 << 32 - qt(r) - 1)).toString(32) + n, e = ":" + e + "R" + n, n = Hs++, 0 < n && (e += "H" + n.toString(32)), e += ":";
    } else
      n = o_++, e = ":" + e + "r" + n.toString(32) + ":";
    return t.memoizedState = e;
  },
  useCacheRefresh: function() {
    return _t().memoizedState = l_.bind(
      null,
      te
    );
  }
};
$i.useHostTransitionStatus = bd;
$i.useFormState = $g;
$i.useActionState = $g;
$i.useOptimistic = function(t) {
  var e = _t();
  e.memoizedState = e.baseState = t;
  var n = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: null,
    lastRenderedState: null
  };
  return e.queue = n, e = Rd.bind(
    null,
    te,
    !0,
    n
  ), n.dispatch = e, [t, e];
};
var Xi = {
  readContext: at,
  use: Sc,
  useCallback: im,
  useContext: at,
  useEffect: Sd,
  useImperativeHandle: rm,
  useInsertionEffect: em,
  useLayoutEffect: tm,
  useMemo: om,
  useReducer: is,
  useRef: Wg,
  useState: function() {
    return is(qn);
  },
  useDebugValue: wd,
  useDeferredValue: function(t, e) {
    var n = He();
    return am(
      n,
      ge.memoizedState,
      t,
      e
    );
  },
  useTransition: function() {
    var t = is(qn)[0], e = He().memoizedState;
    return [
      typeof t == "boolean" ? t : _a(t),
      e
    ];
  },
  useSyncExternalStore: Bg,
  useId: dm
};
Xi.useCacheRefresh = hm;
Xi.useHostTransitionStatus = bd;
Xi.useFormState = Xg;
Xi.useActionState = Xg;
Xi.useOptimistic = function(t, e) {
  var n = He();
  return Yg(n, ge, t, e);
};
var Ji = {
  readContext: at,
  use: Sc,
  useCallback: im,
  useContext: at,
  useEffect: Sd,
  useImperativeHandle: rm,
  useInsertionEffect: em,
  useLayoutEffect: tm,
  useMemo: om,
  useReducer: sl,
  useRef: Wg,
  useState: function() {
    return sl(qn);
  },
  useDebugValue: wd,
  useDeferredValue: function(t, e) {
    var n = He();
    return ge === null ? Ad(n, t, e) : am(
      n,
      ge.memoizedState,
      t,
      e
    );
  },
  useTransition: function() {
    var t = sl(qn)[0], e = He().memoizedState;
    return [
      typeof t == "boolean" ? t : _a(t),
      e
    ];
  },
  useSyncExternalStore: Bg,
  useId: dm
};
Ji.useCacheRefresh = hm;
Ji.useHostTransitionStatus = bd;
Ji.useFormState = Zg;
Ji.useActionState = Zg;
Ji.useOptimistic = function(t, e) {
  var n = He();
  return ge !== null ? Yg(n, ge, t, e) : (n.baseState = t, [t, n.queue.dispatch]);
};
function gm(t) {
  bs(t);
}
function mm(t) {
  console.error(t);
}
function vm(t) {
  bs(t);
}
function Ls(t, e) {
  try {
    var n = t.onUncaughtError;
    n(e.value, { componentStack: e.stack });
  } catch (r) {
    setTimeout(function() {
      throw r;
    });
  }
}
function Xh(t, e, n) {
  try {
    var r = t.onCaughtError;
    r(n.value, {
      componentStack: n.stack,
      errorBoundary: e.tag === 1 ? e.stateNode : null
    });
  } catch (i) {
    setTimeout(function() {
      throw i;
    });
  }
}
function iu(t, e, n) {
  return n = Dn(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
    Ls(t, e);
  }, n;
}
function ym(t) {
  return t = Dn(t), t.tag = 3, t;
}
function Em(t, e, n, r) {
  var i = n.type.getDerivedStateFromError;
  if (typeof i == "function") {
    var o = r.value;
    t.payload = function() {
      return i(o);
    }, t.callback = function() {
      Xh(e, n, r);
    };
  }
  var a = n.stateNode;
  a !== null && typeof a.componentDidCatch == "function" && (t.callback = function() {
    Xh(e, n, r), typeof i != "function" && (sr === null ? sr = /* @__PURE__ */ new Set([this]) : sr.add(this));
    var s = r.stack;
    this.componentDidCatch(r.value, {
      componentStack: s !== null ? s : ""
    });
  });
}
function d_(t, e, n, r, i) {
  if (n.flags |= 32768, r !== null && typeof r == "object" && typeof r.then == "function") {
    if (n = pn.current, n !== null) {
      switch (n.tag) {
        case 13:
          return fn === null ? Eu() : n.alternate === null && Oe === 0 && (Oe = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === Wl ? n.flags |= 16384 : (e = n.updateQueue, e === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : e.add(r), Cl(t, r, i)), !1;
        case 22:
          return n.flags |= 65536, r === Wl ? n.flags |= 16384 : (e = n.updateQueue, e === null ? (e = {
            transitions: null,
            markerInstances: null,
            retryQueue: /* @__PURE__ */ new Set([r])
          }, n.updateQueue = e) : (n = e.retryQueue, n === null ? e.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), Cl(t, r, i)), !1;
      }
      throw Error(A(435, n.tag));
    }
    return Cl(t, r, i), Eu(), !1;
  }
  if (le)
    return e = pn.current, e !== null ? (!(e.flags & 65536) && (e.flags |= 256), e.flags |= 65536, e.lanes = i, r !== Zl && (t = Error(A(422), { cause: r }), ra(xt(t, n)))) : (r !== Zl && (e = Error(A(423), {
      cause: r
    }), ra(
      xt(e, n)
    )), t = t.current.alternate, t.flags |= 65536, i &= -i, t.lanes |= i, r = xt(r, n), i = iu(
      t.stateNode,
      r,
      i
    ), fl(t, i), Oe !== 4 && (Oe = 2)), !1;
  var o = Error(A(520), { cause: r });
  if (o = xt(o, n), xo === null ? xo = [o] : xo.push(o), Oe !== 4 && (Oe = 2), e === null)
    return !0;
  r = xt(r, n), n = e;
  do {
    switch (n.tag) {
      case 3:
        return n.flags |= 65536, t = i & -i, n.lanes |= t, t = iu(n.stateNode, r, t), fl(n, t), !1;
      case 1:
        if (e = n.type, o = n.stateNode, (n.flags & 128) === 0 && (typeof e.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (sr === null || !sr.has(o))))
          return n.flags |= 65536, i &= -i, n.lanes |= i, i = ym(i), Em(
            i,
            t,
            n,
            r
          ), fl(n, i), !1;
    }
    n = n.return;
  } while (n !== null);
  return !1;
}
var _m = Error(A(461)), Je = !1;
function $e(t, e, n, r) {
  e.child = t === null ? Ug(e, null, n, r) : Dr(
    e,
    t.child,
    n,
    r
  );
}
function Jh(t, e, n, r, i) {
  n = n.render;
  var o = e.ref;
  if ("ref" in r) {
    var a = {};
    for (var s in r)
      s !== "ref" && (a[s] = r[s]);
  } else
    a = r;
  return Hr(e, i), r = vd(
    t,
    e,
    n,
    a,
    o,
    i
  ), s = yd(), t !== null && !Je ? (Ed(t, e, i), gn(t, e, i)) : (le && s && ld(e), e.flags |= 1, $e(t, e, r, i), e.child);
}
function Zh(t, e, n, r, i) {
  if (t === null) {
    var o = n.type;
    return typeof o == "function" && !Ud(o) && o.defaultProps === void 0 && n.compare === null ? (e.tag = 15, e.type = o, Cm(
      t,
      e,
      o,
      r,
      i
    )) : (t = ss(
      n.type,
      null,
      r,
      e,
      e.mode,
      i
    ), t.ref = e.ref, t.return = e, e.child = t);
  }
  if (o = t.child, !(t.lanes & i)) {
    var a = o.memoizedProps;
    if (n = n.compare, n = n !== null ? n : ea, n(a, r) && t.ref === e.ref)
      return gn(t, e, i);
  }
  return e.flags |= 1, t = ar(o, r), t.ref = e.ref, t.return = e, e.child = t;
}
function Cm(t, e, n, r, i) {
  if (t !== null) {
    var o = t.memoizedProps;
    if (ea(o, r) && t.ref === e.ref)
      if (Je = !1, e.pendingProps = r = o, (t.lanes & i) !== 0)
        t.flags & 131072 && (Je = !0);
      else
        return e.lanes = t.lanes, gn(t, e, i);
  }
  return ou(
    t,
    e,
    n,
    r,
    i
  );
}
function Tm(t, e, n) {
  var r = e.pendingProps, i = r.children, o = (e.stateNode._pendingVisibility & 2) !== 0, a = t !== null ? t.memoizedState : null;
  if (Uo(t, e), r.mode === "hidden" || o) {
    if (e.flags & 128) {
      if (n = a !== null ? a.baseLanes | n : n, t !== null) {
        for (r = e.child = t.child, i = 0; r !== null; )
          i = i | r.lanes | r.childLanes, r = r.sibling;
        e.childLanes = i & ~n;
      } else
        e.childLanes = 0, e.child = null;
      return Wh(
        t,
        e,
        n
      );
    }
    if (n & 536870912)
      e.memoizedState = { baseLanes: 0, cachePool: null }, t !== null && rs(
        e,
        a !== null ? a.cachePool : null
      ), a !== null ? Qh(e, a) : eu(), Dg(e);
    else
      return e.lanes = e.childLanes = 536870912, Wh(
        t,
        e,
        a !== null ? a.baseLanes | n : n
      );
  } else
    a !== null ? (rs(e, a.cachePool), Qh(e, a), Jn(), e.memoizedState = null) : (t !== null && rs(e, null), eu(), Jn());
  return $e(t, e, i, n), e.child;
}
function Wh(t, e, n) {
  var r = gd();
  return r = r === null ? null : { parent: xe._currentValue, pool: r }, e.memoizedState = {
    baseLanes: n,
    cachePool: r
  }, t !== null && rs(e, null), eu(), Dg(e), null;
}
function Uo(t, e) {
  var n = e.ref;
  if (n === null)
    t !== null && t.ref !== null && (e.flags |= 2097664);
  else {
    if (typeof n != "function" && typeof n != "object")
      throw Error(A(284));
    (t === null || t.ref !== n) && (e.flags |= 2097664);
  }
}
function ou(t, e, n, r, i) {
  return Hr(e, i), n = vd(
    t,
    e,
    n,
    r,
    void 0,
    i
  ), r = yd(), t !== null && !Je ? (Ed(t, e, i), gn(t, e, i)) : (le && r && ld(e), e.flags |= 1, $e(t, e, n, i), e.child);
}
function ef(t, e, n, r, i, o) {
  return Hr(e, o), n = qg(
    e,
    r,
    n,
    i
  ), xg(), r = yd(), t !== null && !Je ? (Ed(t, e, o), gn(t, e, o)) : (le && r && ld(e), e.flags |= 1, $e(t, e, n, o), e.child);
}
function tf(t, e, n, r, i) {
  if (Hr(e, i), e.stateNode === null) {
    var o = li, a = n.contextType;
    typeof a == "object" && a !== null && (o = at(a)), o = new n(r, o), e.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null, o.updater = hu, e.stateNode = o, o._reactInternals = e, o = e.stateNode, o.props = r, o.state = e.memoizedState, o.refs = {}, Nd(e), a = n.contextType, o.context = typeof a == "object" && a !== null ? at(a) : li, o.state = e.memoizedState, a = n.getDerivedStateFromProps, typeof a == "function" && (pl(
      e,
      n,
      a,
      r
    ), o.state = e.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (a = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), a !== o.state && hu.enqueueReplaceState(o, o.state, null), Ho(e, r, o, i), Po(), o.state = e.memoizedState), typeof o.componentDidMount == "function" && (e.flags |= 4194308), r = !0;
  } else if (t === null) {
    o = e.stateNode;
    var s = e.memoizedProps, c = Lr(n, s);
    o.props = c;
    var l = o.context, u = n.contextType;
    a = li, typeof u == "object" && u !== null && (a = at(u));
    var d = n.getDerivedStateFromProps;
    u = typeof d == "function" || typeof o.getSnapshotBeforeUpdate == "function", s = e.pendingProps !== s, u || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (s || l !== a) && af(
      e,
      o,
      r,
      a
    ), Qn = !1;
    var h = e.memoizedState;
    o.state = h, Ho(e, r, o, i), Po(), l = e.memoizedState, s || h !== l || Qn ? (typeof d == "function" && (pl(
      e,
      n,
      d,
      r
    ), l = e.memoizedState), (c = Qn || of(
      e,
      n,
      c,
      r,
      h,
      l,
      a
    )) ? (u || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()), typeof o.componentDidMount == "function" && (e.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (e.flags |= 4194308), e.memoizedProps = r, e.memoizedState = l), o.props = r, o.state = l, o.context = a, r = c) : (typeof o.componentDidMount == "function" && (e.flags |= 4194308), r = !1);
  } else {
    o = e.stateNode, uu(t, e), a = e.memoizedProps, u = Lr(n, a), o.props = u, d = e.pendingProps, h = o.context, l = n.contextType, c = li, typeof l == "object" && l !== null && (c = at(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (a !== d || h !== c) && af(
      e,
      o,
      r,
      c
    ), Qn = !1, h = e.memoizedState, o.state = h, Ho(e, r, o, i), Po();
    var f = e.memoizedState;
    a !== d || h !== f || Qn ? (typeof s == "function" && (pl(
      e,
      n,
      s,
      r
    ), f = e.memoizedState), (u = Qn || of(
      e,
      n,
      u,
      r,
      h,
      f,
      c
    ) || !1) ? (l || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, f, c), typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(
      r,
      f,
      c
    )), typeof o.componentDidUpdate == "function" && (e.flags |= 4), typeof o.getSnapshotBeforeUpdate == "function" && (e.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || a === t.memoizedProps && h === t.memoizedState || (e.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === t.memoizedProps && h === t.memoizedState || (e.flags |= 1024), e.memoizedProps = r, e.memoizedState = f), o.props = r, o.state = f, o.context = c, r = u) : (typeof o.componentDidUpdate != "function" || a === t.memoizedProps && h === t.memoizedState || (e.flags |= 4), typeof o.getSnapshotBeforeUpdate != "function" || a === t.memoizedProps && h === t.memoizedState || (e.flags |= 1024), r = !1);
  }
  return o = r, Uo(t, e), r = (e.flags & 128) !== 0, o || r ? (o = e.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : o.render(), e.flags |= 1, t !== null && r ? (e.child = Dr(
    e,
    t.child,
    null,
    i
  ), e.child = Dr(
    e,
    null,
    n,
    i
  )) : $e(t, e, n, i), e.memoizedState = o.state, t = e.child) : t = gn(
    t,
    e,
    i
  ), t;
}
function nf(t, e, n, r) {
  return va(), e.flags |= 256, $e(t, e, n, r), e.child;
}
var cl = { dehydrated: null, treeContext: null, retryLane: 0 };
function ll(t) {
  return { baseLanes: t, cachePool: Lg() };
}
function ul(t, e, n) {
  return t = t !== null ? t.childLanes & ~n : 0, e && (t |= St), t;
}
function Sm(t, e, n) {
  var r = e.pendingProps, i = !1, o = (e.flags & 128) !== 0, a;
  if ((a = o) || (a = t !== null && t.memoizedState === null ? !1 : (Be.current & 2) !== 0), a && (i = !0, e.flags &= -129), a = (e.flags & 32) !== 0, e.flags &= -33, t === null) {
    if (le) {
      if (i ? Xn(e) : Jn(), le) {
        var s = Xe, c;
        if (c = s) {
          e: {
            for (c = s, s = cn; c.nodeType !== 8; ) {
              if (!s) {
                s = null;
                break e;
              }
              if (c = Wt(
                c.nextSibling
              ), c === null) {
                s = null;
                break e;
              }
            }
            s = c;
          }
          s !== null ? (e.memoizedState = {
            dehydrated: s,
            treeContext: Ir !== null ? { id: In, overflow: Nn } : null,
            retryLane: 536870912
          }, c = Xt(18, null, null, 0), c.stateNode = s, c.return = e, e.child = c, ut = e, Xe = null, c = !0) : c = !1;
        }
        c || Ur(e);
      }
      if (s = e.memoizedState, s !== null && (s = s.dehydrated, s !== null))
        return s.data === "$!" ? e.lanes = 16 : e.lanes = 536870912, null;
      On(e);
    }
    return s = r.children, r = r.fallback, i ? (Jn(), i = e.mode, s = su(
      { mode: "hidden", children: s },
      i
    ), r = Or(
      r,
      i,
      n,
      null
    ), s.return = e, r.return = e, s.sibling = r, e.child = s, i = e.child, i.memoizedState = ll(n), i.childLanes = ul(
      t,
      a,
      n
    ), e.memoizedState = cl, r) : (Xn(e), au(e, s));
  }
  if (c = t.memoizedState, c !== null && (s = c.dehydrated, s !== null)) {
    if (o)
      e.flags & 256 ? (Xn(e), e.flags &= -257, e = dl(
        t,
        e,
        n
      )) : e.memoizedState !== null ? (Jn(), e.child = t.child, e.flags |= 128, e = null) : (Jn(), i = r.fallback, s = e.mode, r = su(
        { mode: "visible", children: r.children },
        s
      ), i = Or(
        i,
        s,
        n,
        null
      ), i.flags |= 2, r.return = e, i.return = e, r.sibling = i, e.child = r, Dr(
        e,
        t.child,
        null,
        n
      ), r = e.child, r.memoizedState = ll(n), r.childLanes = ul(
        t,
        a,
        n
      ), e.memoizedState = cl, e = i);
    else if (Xn(e), s.data === "$!") {
      if (a = s.nextSibling && s.nextSibling.dataset, a)
        var l = a.dgst;
      a = l, r = Error(A(419)), r.stack = "", r.digest = a, ra({ value: r, source: null, stack: null }), e = dl(
        t,
        e,
        n
      );
    } else if (a = (n & t.childLanes) !== 0, Je || a) {
      if (a = me, a !== null) {
        if (r = n & -n, r & 42)
          r = 1;
        else
          switch (r) {
            case 2:
              r = 1;
              break;
            case 8:
              r = 4;
              break;
            case 32:
              r = 16;
              break;
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
              r = 64;
              break;
            case 268435456:
              r = 134217728;
              break;
            default:
              r = 0;
          }
        if (r = r & (a.suspendedLanes | n) ? 0 : r, r !== 0 && r !== c.retryLane)
          throw c.retryLane = r, hr(t, r), ft(a, t, r), _m;
      }
      s.data === "$?" || Eu(), e = dl(
        t,
        e,
        n
      );
    } else
      s.data === "$?" ? (e.flags |= 128, e.child = t.child, e = R_.bind(
        null,
        t
      ), s._reactRetry = e, e = null) : (t = c.treeContext, Xe = Wt(
        s.nextSibling
      ), ut = e, le = !0, Qt = null, cn = !1, t !== null && (Pt[Ht++] = In, Pt[Ht++] = Nn, Pt[Ht++] = Ir, In = t.id, Nn = t.overflow, Ir = e), e = au(
        e,
        r.children
      ), e.flags |= 4096);
    return e;
  }
  return i ? (Jn(), i = r.fallback, s = e.mode, c = t.child, l = c.sibling, r = ar(c, {
    mode: "hidden",
    children: r.children
  }), r.subtreeFlags = c.subtreeFlags & 31457280, l !== null ? i = ar(l, i) : (i = Or(
    i,
    s,
    n,
    null
  ), i.flags |= 2), i.return = e, r.return = e, r.sibling = i, e.child = r, r = i, i = e.child, s = t.child.memoizedState, s === null ? s = ll(n) : (c = s.cachePool, c !== null ? (l = xe._currentValue, c = c.parent !== l ? { parent: l, pool: l } : c) : c = Lg(), s = {
    baseLanes: s.baseLanes | n,
    cachePool: c
  }), i.memoizedState = s, i.childLanes = ul(
    t,
    a,
    n
  ), e.memoizedState = cl, r) : (Xn(e), n = t.child, t = n.sibling, n = ar(n, {
    mode: "visible",
    children: r.children
  }), n.return = e, n.sibling = null, t !== null && (a = e.deletions, a === null ? (e.deletions = [t], e.flags |= 16) : a.push(t)), e.child = n, e.memoizedState = null, n);
}
function au(t, e) {
  return e = su(
    { mode: "visible", children: e },
    t.mode
  ), e.return = t, t.child = e;
}
function su(t, e) {
  return Qm(t, e, 0, null);
}
function dl(t, e, n) {
  return Dr(e, t.child, null, n), t = au(
    e,
    e.pendingProps.children
  ), t.flags |= 2, e.memoizedState = null, t;
}
function rf(t, e, n) {
  t.lanes |= e;
  var r = t.alternate;
  r !== null && (r.lanes |= e), lu(t.return, e, n);
}
function hl(t, e, n, r, i) {
  var o = t.memoizedState;
  o === null ? t.memoizedState = {
    isBackwards: e,
    rendering: null,
    renderingStartTime: 0,
    last: r,
    tail: n,
    tailMode: i
  } : (o.isBackwards = e, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i);
}
function wm(t, e, n) {
  var r = e.pendingProps, i = r.revealOrder, o = r.tail;
  if ($e(t, e, r.children, n), r = Be.current, r & 2)
    r = r & 1 | 2, e.flags |= 128;
  else {
    if (t !== null && t.flags & 128)
      e:
        for (t = e.child; t !== null; ) {
          if (t.tag === 13)
            t.memoizedState !== null && rf(t, n, e);
          else if (t.tag === 19)
            rf(t, n, e);
          else if (t.child !== null) {
            t.child.return = t, t = t.child;
            continue;
          }
          if (t === e)
            break e;
          for (; t.sibling === null; ) {
            if (t.return === null || t.return === e)
              break e;
            t = t.return;
          }
          t.sibling.return = t.return, t = t.sibling;
        }
    r &= 1;
  }
  switch (Te(Be, r), i) {
    case "forwards":
      for (n = e.child, i = null; n !== null; )
        t = n.alternate, t !== null && ks(t) === null && (i = n), n = n.sibling;
      n = i, n === null ? (i = e.child, e.child = null) : (i = n.sibling, n.sibling = null), hl(
        e,
        !1,
        i,
        n,
        o
      );
      break;
    case "backwards":
      for (n = null, i = e.child, e.child = null; i !== null; ) {
        if (t = i.alternate, t !== null && ks(t) === null) {
          e.child = i;
          break;
        }
        t = i.sibling, i.sibling = n, n = i, i = t;
      }
      hl(
        e,
        !0,
        n,
        null,
        o
      );
      break;
    case "together":
      hl(e, !1, null, null, void 0);
      break;
    default:
      e.memoizedState = null;
  }
  return e.child;
}
function gn(t, e, n) {
  if (t !== null && (e.dependencies = t.dependencies), Gn |= e.lanes, !(n & e.childLanes))
    return null;
  if (t !== null && e.child !== t.child)
    throw Error(A(153));
  if (e.child !== null) {
    for (t = e.child, n = ar(t, t.pendingProps), e.child = n, n.return = e; t.sibling !== null; )
      t = t.sibling, n = n.sibling = ar(t, t.pendingProps), n.return = e;
    n.sibling = null;
  }
  return e.child;
}
function h_(t, e, n) {
  switch (e.tag) {
    case 3:
      _s(e, e.stateNode.containerInfo), Zn(e, xe, t.memoizedState.cache), va();
      break;
    case 27:
    case 5:
      zl(e);
      break;
    case 4:
      _s(e, e.stateNode.containerInfo);
      break;
    case 10:
      Zn(
        e,
        e.type,
        e.memoizedProps.value
      );
      break;
    case 13:
      var r = e.memoizedState;
      if (r !== null)
        return r.dehydrated !== null ? (Xn(e), e.flags |= 128, null) : n & e.child.childLanes ? Sm(t, e, n) : (Xn(e), t = gn(
          t,
          e,
          n
        ), t !== null ? t.sibling : null);
      Xn(e);
      break;
    case 19:
      if (r = (n & e.childLanes) !== 0, t.flags & 128) {
        if (r)
          return wm(
            t,
            e,
            n
          );
        e.flags |= 128;
      }
      var i = e.memoizedState;
      if (i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Te(Be, Be.current), r)
        break;
      return null;
    case 22:
    case 23:
      return e.lanes = 0, Tm(t, e, n);
    case 24:
      Zn(e, xe, t.memoizedState.cache);
  }
  return gn(t, e, n);
}
function Am(t, e, n) {
  if (t !== null)
    if (t.memoizedProps !== e.pendingProps)
      Je = !0;
    else {
      if (!(t.lanes & n) && !(e.flags & 128))
        return Je = !1, h_(
          t,
          e,
          n
        );
      Je = !!(t.flags & 131072);
    }
  else
    Je = !1, le && e.flags & 1048576 && Ng(e, Os, e.index);
  switch (e.lanes = 0, e.tag) {
    case 16:
      e: {
        t = e.pendingProps;
        var r = e.elementType, i = r._init;
        if (r = i(r._payload), e.type = r, typeof r == "function")
          Ud(r) ? (t = Lr(r, t), e.tag = 1, e = tf(
            null,
            e,
            r,
            t,
            n
          )) : (e.tag = 0, e = ou(
            null,
            e,
            r,
            t,
            n
          ));
        else {
          if (r != null) {
            if (i = r.$$typeof, i === Bp) {
              e.tag = 11, e = Jh(
                null,
                e,
                r,
                t,
                n
              );
              break e;
            } else if (i === zp) {
              e.tag = 14, e = Zh(
                null,
                e,
                r,
                t,
                n
              );
              break e;
            }
          }
          throw Error(A(306, r, ""));
        }
      }
      return e;
    case 0:
      return ou(
        t,
        e,
        e.type,
        e.pendingProps,
        n
      );
    case 1:
      return r = e.type, i = Lr(
        r,
        e.pendingProps
      ), tf(
        t,
        e,
        r,
        i,
        n
      );
    case 3:
      e: {
        if (_s(
          e,
          e.stateNode.containerInfo
        ), t === null)
          throw Error(A(387));
        var o = e.pendingProps;
        i = e.memoizedState, r = i.element, uu(t, e), Ho(e, o, null, n);
        var a = e.memoizedState;
        if (o = a.cache, Zn(e, xe, o), o !== i.cache && La(e, xe, n), Po(), o = a.element, i.isDehydrated)
          if (i = {
            element: o,
            isDehydrated: !1,
            cache: a.cache
          }, e.updateQueue.baseState = i, e.memoizedState = i, e.flags & 256) {
            e = nf(
              t,
              e,
              o,
              n
            );
            break e;
          } else if (o !== r) {
            r = xt(
              Error(A(424)),
              e
            ), ra(r), e = nf(
              t,
              e,
              o,
              n
            );
            break e;
          } else
            for (Xe = Wt(
              e.stateNode.containerInfo.firstChild
            ), ut = e, le = !0, Qt = null, cn = !0, n = Ug(
              e,
              null,
              o,
              n
            ), e.child = n; n; )
              n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (va(), o === r) {
            e = gn(
              t,
              e,
              n
            );
            break e;
          }
          $e(t, e, o, n);
        }
        e = e.child;
      }
      return e;
    case 26:
      return Uo(t, e), n = e.memoizedState = j_(
        e.type,
        t === null ? null : t.memoizedProps,
        e.pendingProps
      ), t !== null || le || n !== null || (n = e.type, t = e.pendingProps, r = Gs(
        ir.current
      ).createElement(n), r[ot] = e, r[ht] = t, Ze(r, n, t), Fe(r), e.stateNode = r), null;
    case 27:
      return zl(e), t === null && le && (r = e.stateNode = sv(
        e.type,
        e.pendingProps,
        ir.current
      ), ut = e, cn = !0, Xe = Wt(
        r.firstChild
      )), r = e.pendingProps.children, t !== null || le ? $e(
        t,
        e,
        r,
        n
      ) : e.child = Dr(
        e,
        null,
        r,
        n
      ), Uo(t, e), e.child;
    case 5:
      return t === null && le && ((i = r = Xe) && (r = D_(
        r,
        e.type,
        e.pendingProps,
        cn
      ), r !== null ? (e.stateNode = r, ut = e, Xe = Wt(
        r.firstChild
      ), cn = !1, i = !0) : i = !1), i || Ur(e)), zl(e), i = e.type, o = e.pendingProps, a = t !== null ? t.memoizedProps : null, r = o.children, Su(i, o) ? r = null : a !== null && Su(i, a) && (e.flags |= 32), e.memoizedState !== null && (i = vd(
        t,
        e,
        a_,
        null,
        null,
        n
      ), Es._currentValue = i, Je && t !== null && t.memoizedState.memoizedState !== i && La(
        e,
        Es,
        n
      )), Uo(t, e), $e(t, e, r, n), e.child;
    case 6:
      return t === null && le && ((t = n = Xe) && (n = P_(
        n,
        e.pendingProps,
        cn
      ), n !== null ? (e.stateNode = n, ut = e, Xe = null, t = !0) : t = !1), t || Ur(e)), null;
    case 13:
      return Sm(t, e, n);
    case 4:
      return _s(
        e,
        e.stateNode.containerInfo
      ), r = e.pendingProps, t === null ? e.child = Dr(
        e,
        null,
        r,
        n
      ) : $e(
        t,
        e,
        r,
        n
      ), e.child;
    case 11:
      return Jh(
        t,
        e,
        e.type,
        e.pendingProps,
        n
      );
    case 7:
      return $e(
        t,
        e,
        e.pendingProps,
        n
      ), e.child;
    case 8:
      return $e(
        t,
        e,
        e.pendingProps.children,
        n
      ), e.child;
    case 12:
      return $e(
        t,
        e,
        e.pendingProps.children,
        n
      ), e.child;
    case 10:
      e: {
        if (r = e.type, i = e.pendingProps, o = e.memoizedProps, a = i.value, Zn(e, r, a), o !== null)
          if (zt(o.value, a)) {
            if (o.children === i.children) {
              e = gn(
                t,
                e,
                n
              );
              break e;
            }
          } else
            La(e, r, n);
        $e(t, e, i.children, n), e = e.child;
      }
      return e;
    case 9:
      return i = e.type._context, r = e.pendingProps.children, Hr(e, n), i = at(i), r = r(i), e.flags |= 1, $e(t, e, r, n), e.child;
    case 14:
      return Zh(
        t,
        e,
        e.type,
        e.pendingProps,
        n
      );
    case 15:
      return Cm(
        t,
        e,
        e.type,
        e.pendingProps,
        n
      );
    case 19:
      return wm(t, e, n);
    case 22:
      return Tm(t, e, n);
    case 24:
      return Hr(e, n), r = at(xe), t === null ? (i = gd(), i === null && (i = me, o = hd(), i.pooledCache = o, o.refCount++, o !== null && (i.pooledCacheLanes |= n), i = o), e.memoizedState = {
        parent: r,
        cache: i
      }, Nd(e), Zn(e, xe, i)) : (t.lanes & n && (uu(t, e), Ho(e, null, null, n), Po()), i = t.memoizedState, o = e.memoizedState, i.parent !== r ? (i = { parent: r, cache: r }, e.memoizedState = i, e.lanes === 0 && (e.memoizedState = e.updateQueue.baseState = i), Zn(e, xe, r)) : (r = o.cache, Zn(e, xe, r), r !== i.cache && La(
        e,
        xe,
        n
      ))), $e(
        t,
        e,
        e.pendingProps.children,
        n
      ), e.child;
  }
  throw Error(A(156, e.tag));
}
var cu = vn(null), bc = null, hi = null, Id = null;
function Rc() {
  Id = hi = bc = null;
}
function Zn(t, e, n) {
  Te(cu, e._currentValue), e._currentValue = n;
}
function Un(t) {
  t._currentValue = cu.current, je(cu);
}
function lu(t, e, n) {
  for (; t !== null; ) {
    var r = t.alternate;
    if ((t.childLanes & e) !== e ? (t.childLanes |= e, r !== null && (r.childLanes |= e)) : r !== null && (r.childLanes & e) !== e && (r.childLanes |= e), t === n)
      break;
    t = t.return;
  }
}
function La(t, e, n) {
  var r = t.child;
  for (r !== null && (r.return = t); r !== null; ) {
    var i = r.dependencies;
    if (i !== null)
      for (var o = r.child, a = i.firstContext; a !== null; ) {
        if (a.context === e) {
          if (r.tag === 1) {
            a = Dn(n & -n), a.tag = 2;
            var s = r.updateQueue;
            if (s !== null) {
              s = s.shared;
              var c = s.pending;
              c === null ? a.next = a : (a.next = c.next, c.next = a), s.pending = a;
            }
          }
          r.lanes |= n, a = r.alternate, a !== null && (a.lanes |= n), lu(
            r.return,
            n,
            t
          ), i.lanes |= n;
          break;
        }
        a = a.next;
      }
    else if (r.tag === 10)
      o = r.type === t.type ? null : r.child;
    else if (r.tag === 18) {
      if (o = r.return, o === null)
        throw Error(A(341));
      o.lanes |= n, i = o.alternate, i !== null && (i.lanes |= n), lu(o, n, t), o = r.sibling;
    } else
      o = r.child;
    if (o !== null)
      o.return = r;
    else
      for (o = r; o !== null; ) {
        if (o === t) {
          o = null;
          break;
        }
        if (r = o.sibling, r !== null) {
          r.return = o.return, o = r;
          break;
        }
        o = o.return;
      }
    r = o;
  }
}
function Hr(t, e) {
  bc = t, Id = hi = null, t = t.dependencies, t !== null && t.firstContext !== null && (t.lanes & e && (Je = !0), t.firstContext = null);
}
function at(t) {
  return bm(bc, t);
}
function xa(t, e, n) {
  return bc === null && Hr(t, n), bm(t, e);
}
function bm(t, e) {
  var n = e._currentValue;
  if (Id !== e)
    if (e = { context: e, memoizedValue: n, next: null }, hi === null) {
      if (t === null)
        throw Error(A(308));
      hi = e, t.dependencies = { lanes: 0, firstContext: e };
    } else
      hi = hi.next = e;
  return n;
}
var Qn = !1;
function Nd(t) {
  t.updateQueue = {
    baseState: t.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, lanes: 0, hiddenCallbacks: null },
    callbacks: null
  };
}
function uu(t, e) {
  t = t.updateQueue, e.updateQueue === t && (e.updateQueue = {
    baseState: t.baseState,
    firstBaseUpdate: t.firstBaseUpdate,
    lastBaseUpdate: t.lastBaseUpdate,
    shared: t.shared,
    callbacks: null
  });
}
function Dn(t) {
  return { lane: t, tag: 0, payload: null, callback: null, next: null };
}
function or(t, e, n) {
  var r = t.updateQueue;
  if (r === null)
    return null;
  if (r = r.shared, he & 2) {
    var i = r.pending;
    return i === null ? e.next = e : (e.next = i.next, i.next = e), r.pending = e, e = Is(t), Ig(t, null, n), e;
  }
  return Tc(t, r, e, n), Is(t);
}
function Do(t, e, n) {
  if (e = e.updateQueue, e !== null && (e = e.shared, (n & 4194176) !== 0)) {
    var r = e.lanes;
    r &= t.pendingLanes, n |= r, e.lanes = n, Zp(t, n);
  }
}
function fl(t, e) {
  var n = t.updateQueue, r = t.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var i = null, o = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var a = {
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: null,
          next: null
        };
        o === null ? i = o = a : o = o.next = a, n = n.next;
      } while (n !== null);
      o === null ? i = o = e : o = o.next = e;
    } else
      i = o = e;
    n = {
      baseState: r.baseState,
      firstBaseUpdate: i,
      lastBaseUpdate: o,
      shared: r.shared,
      callbacks: r.callbacks
    }, t.updateQueue = n;
    return;
  }
  t = n.lastBaseUpdate, t === null ? n.firstBaseUpdate = e : t.next = e, n.lastBaseUpdate = e;
}
var du = !1;
function Po() {
  if (du) {
    var t = wi;
    if (t !== null)
      throw t;
  }
}
function Ho(t, e, n, r) {
  du = !1;
  var i = t.updateQueue;
  Qn = !1;
  var o = i.firstBaseUpdate, a = i.lastBaseUpdate, s = i.shared.pending;
  if (s !== null) {
    i.shared.pending = null;
    var c = s, l = c.next;
    c.next = null, a === null ? o = l : a.next = l, a = c;
    var u = t.alternate;
    u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== a && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
  }
  if (o !== null) {
    var d = i.baseState;
    a = 0, u = l = c = null, s = o;
    do {
      var h = s.lane & -536870913, f = h !== s.lane;
      if (f ? (ae & h) === h : (r & h) === h) {
        h !== 0 && h === Li && (du = !0), u !== null && (u = u.next = {
          lane: 0,
          tag: s.tag,
          payload: s.payload,
          callback: null,
          next: null
        });
        e: {
          var m = t, E = s;
          h = e;
          var N = n;
          switch (E.tag) {
            case 1:
              if (m = E.payload, typeof m == "function") {
                d = m.call(N, d, h);
                break e;
              }
              d = m;
              break e;
            case 3:
              m.flags = m.flags & -65537 | 128;
            case 0:
              if (m = E.payload, h = typeof m == "function" ? m.call(N, d, h) : m, h == null)
                break e;
              d = Se({}, d, h);
              break e;
            case 2:
              Qn = !0;
          }
        }
        h = s.callback, h !== null && (t.flags |= 64, f && (t.flags |= 8192), f = i.callbacks, f === null ? i.callbacks = [h] : f.push(h));
      } else
        f = {
          lane: h,
          tag: s.tag,
          payload: s.payload,
          callback: s.callback,
          next: null
        }, u === null ? (l = u = f, c = d) : u = u.next = f, a |= h;
      if (s = s.next, s === null) {
        if (s = i.shared.pending, s === null)
          break;
        f = s, s = f.next, f.next = null, i.lastBaseUpdate = f, i.shared.pending = null;
      }
    } while (!0);
    u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, o === null && (i.shared.lanes = 0), Gn |= a, t.lanes = a, t.memoizedState = d;
  }
}
function Rm(t, e) {
  if (typeof t != "function")
    throw Error(A(191, t));
  t.call(e);
}
function Im(t, e) {
  var n = t.callbacks;
  if (n !== null)
    for (t.callbacks = null, t = 0; t < n.length; t++)
      Rm(n[t], e);
}
function pl(t, e, n, r) {
  e = t.memoizedState, n = n(r, e), n = n == null ? e : Se({}, e, n), t.memoizedState = n, t.lanes === 0 && (t.updateQueue.baseState = n);
}
var hu = {
  isMounted: function(t) {
    return (t = t._reactInternals) ? ji(t) === t : !1;
  },
  enqueueSetState: function(t, e, n) {
    t = t._reactInternals;
    var r = Pn(), i = Dn(r);
    i.payload = e, n != null && (i.callback = n), e = or(t, i, r), e !== null && (ft(e, t, r), Do(e, t, r));
  },
  enqueueReplaceState: function(t, e, n) {
    t = t._reactInternals;
    var r = Pn(), i = Dn(r);
    i.tag = 1, i.payload = e, n != null && (i.callback = n), e = or(t, i, r), e !== null && (ft(e, t, r), Do(e, t, r));
  },
  enqueueForceUpdate: function(t, e) {
    t = t._reactInternals;
    var n = Pn(), r = Dn(n);
    r.tag = 2, e != null && (r.callback = e), e = or(t, r, n), e !== null && (ft(e, t, n), Do(e, t, n));
  }
};
function of(t, e, n, r, i, o, a) {
  return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(r, o, a) : e.prototype && e.prototype.isPureReactComponent ? !ea(n, r) || !ea(i, o) : !0;
}
function af(t, e, n, r) {
  t = e.state, typeof e.componentWillReceiveProps == "function" && e.componentWillReceiveProps(n, r), typeof e.UNSAFE_componentWillReceiveProps == "function" && e.UNSAFE_componentWillReceiveProps(n, r), e.state !== t && hu.enqueueReplaceState(e, e.state, null);
}
function Lr(t, e) {
  var n = e;
  if ("ref" in e) {
    n = {};
    for (var r in e)
      r !== "ref" && (n[r] = e[r]);
  }
  if (t = t.defaultProps) {
    n === e && (n = Se({}, n));
    for (var i in t)
      n[i] === void 0 && (n[i] = t[i]);
  }
  return n;
}
var Rn = !1, rt = !1, gl = !1, sf = typeof WeakSet == "function" ? WeakSet : Set, Ke = null;
function Nm(t, e) {
  e.props = Lr(
    t.type,
    t.memoizedProps
  ), e.state = t.memoizedState, e.componentWillUnmount();
}
function wr(t, e) {
  try {
    var n = t.ref;
    if (n !== null) {
      var r = t.stateNode;
      switch (t.tag) {
        case 26:
        case 27:
        case 5:
          var i = r;
          break;
        default:
          i = r;
      }
      typeof n == "function" ? t.refCleanup = n(i) : n.current = i;
    }
  } catch (o) {
    ve(t, e, o);
  }
}
function bt(t, e) {
  var n = t.ref, r = t.refCleanup;
  if (n !== null)
    if (typeof r == "function")
      try {
        r();
      } catch (i) {
        ve(t, e, i);
      } finally {
        t.refCleanup = null, t = t.alternate, t != null && (t.refCleanup = null);
      }
    else if (typeof n == "function")
      try {
        n(null);
      } catch (i) {
        ve(t, e, i);
      }
    else
      n.current = null;
}
function fu(t, e, n) {
  try {
    n();
  } catch (r) {
    ve(t, e, r);
  }
}
var cf = !1;
function f_(t, e) {
  if (Cu = Ys, t = yg(), od(t)) {
    if ("selectionStart" in t)
      var n = {
        start: t.selectionStart,
        end: t.selectionEnd
      };
    else
      e: {
        n = (n = t.ownerDocument) && n.defaultView || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var i = r.anchorOffset, o = r.focusNode;
          r = r.focusOffset;
          try {
            n.nodeType, o.nodeType;
          } catch {
            n = null;
            break e;
          }
          var a = 0, s = -1, c = -1, l = 0, u = 0, d = t, h = null;
          t:
            for (; ; ) {
              for (var f; d !== n || i !== 0 && d.nodeType !== 3 || (s = a + i), d !== o || r !== 0 && d.nodeType !== 3 || (c = a + r), d.nodeType === 3 && (a += d.nodeValue.length), (f = d.firstChild) !== null; )
                h = d, d = f;
              for (; ; ) {
                if (d === t)
                  break t;
                if (h === n && ++l === i && (s = a), h === o && ++u === r && (c = a), (f = d.nextSibling) !== null)
                  break;
                d = h, h = d.parentNode;
              }
              d = f;
            }
          n = s === -1 || c === -1 ? null : { start: s, end: c };
        } else
          n = null;
      }
    n = n || { start: 0, end: 0 };
  } else
    n = null;
  for (Tu = { focusedElem: t, selectionRange: n }, Ys = !1, Ke = e; Ke !== null; )
    if (e = Ke, t = e.child, (e.subtreeFlags & 1028) !== 0 && t !== null)
      t.return = e, Ke = t;
    else
      for (; Ke !== null; ) {
        e = Ke;
        try {
          var m = e.alternate, E = e.flags;
          switch (e.tag) {
            case 0:
              break;
            case 11:
            case 15:
              break;
            case 1:
              if (E & 1024 && m !== null) {
                var N = m.memoizedState, g = e.stateNode, p = g.getSnapshotBeforeUpdate(
                  Lr(
                    e.type,
                    m.memoizedProps
                  ),
                  N
                );
                g.__reactInternalSnapshotBeforeUpdate = p;
              }
              break;
            case 3:
              if (E & 1024) {
                var v = e.stateNode.containerInfo, C = v.nodeType;
                if (C === 9)
                  wu(v);
                else if (C === 1)
                  switch (v.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      wu(v);
                      break;
                    default:
                      v.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if (E & 1024)
                throw Error(A(163));
          }
        } catch (k) {
          ve(e, e.return, k);
        }
        if (t = e.sibling, t !== null) {
          t.return = e.return, Ke = t;
          break;
        }
        Ke = e.return;
      }
  return m = cf, cf = !1, m;
}
function qi(t, e, n) {
  var r = e.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var i = r = r.next;
    do {
      if ((i.tag & t) === t) {
        var o = i.inst, a = o.destroy;
        a !== void 0 && (o.destroy = void 0, fu(e, n, a));
      }
      i = i.next;
    } while (i !== r);
  }
}
function Od(t, e) {
  if (e = e.updateQueue, e = e !== null ? e.lastEffect : null, e !== null) {
    var n = e = e.next;
    do {
      if ((n.tag & t) === t) {
        var r = n.create, i = n.inst;
        r = r(), i.destroy = r;
      }
      n = n.next;
    } while (n !== e);
  }
}
function Om(t, e) {
  try {
    Od(e, t);
  } catch (n) {
    ve(t, t.return, n);
  }
}
function Mm(t) {
  var e = t.updateQueue;
  if (e !== null) {
    var n = t.stateNode;
    try {
      Im(e, n);
    } catch (r) {
      ve(t, t.return, r);
    }
  }
}
function km(t) {
  var e = t.type, n = t.memoizedProps, r = t.stateNode;
  try {
    e:
      switch (e) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          n.autoFocus && r.focus();
          break e;
        case "img":
          n.src && (r.src = n.src);
      }
  } catch (i) {
    ve(t, t.return, i);
  }
}
function Um(t, e, n) {
  var r = n.flags;
  switch (n.tag) {
    case 0:
    case 11:
    case 15:
      Cn(t, n), r & 4 && Om(n, 5);
      break;
    case 1:
      if (Cn(t, n), r & 4)
        if (t = n.stateNode, e === null)
          try {
            t.componentDidMount();
          } catch (s) {
            ve(n, n.return, s);
          }
        else {
          var i = Lr(
            n.type,
            e.memoizedProps
          );
          e = e.memoizedState;
          try {
            t.componentDidUpdate(
              i,
              e,
              t.__reactInternalSnapshotBeforeUpdate
            );
          } catch (s) {
            ve(
              n,
              n.return,
              s
            );
          }
        }
      r & 64 && Mm(n), r & 512 && wr(n, n.return);
      break;
    case 3:
      if (Cn(t, n), r & 64 && (r = n.updateQueue, r !== null)) {
        if (t = null, n.child !== null)
          switch (n.child.tag) {
            case 27:
            case 5:
              t = n.child.stateNode;
              break;
            case 1:
              t = n.child.stateNode;
          }
        try {
          Im(r, t);
        } catch (s) {
          ve(n, n.return, s);
        }
      }
      break;
    case 26:
      Cn(t, n), r & 512 && wr(n, n.return);
      break;
    case 27:
    case 5:
      Cn(t, n), e === null && r & 4 && km(n), r & 512 && wr(n, n.return);
      break;
    case 12:
      Cn(t, n);
      break;
    case 13:
      Cn(t, n), r & 4 && Lm(t, n);
      break;
    case 22:
      if (i = n.memoizedState !== null || Rn, !i) {
        e = e !== null && e.memoizedState !== null || rt;
        var o = Rn, a = rt;
        Rn = i, (rt = e) && !a ? Yn(
          t,
          n,
          (n.subtreeFlags & 8772) !== 0
        ) : Cn(t, n), Rn = o, rt = a;
      }
      r & 512 && (n.memoizedProps.mode === "manual" ? wr(n, n.return) : bt(n, n.return));
      break;
    default:
      Cn(t, n);
  }
}
function Dm(t) {
  var e = t.alternate;
  e !== null && (t.alternate = null, Dm(e)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (e = t.stateNode, e !== null && Wu(e)), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
}
function Pm(t) {
  return t.tag === 5 || t.tag === 3 || t.tag === 26 || t.tag === 27 || t.tag === 4;
}
function ml(t) {
  e:
    for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || Pm(t.return))
          return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 27 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4)
          continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2))
        return t.stateNode;
    }
}
function pu(t, e, n) {
  var r = t.tag;
  if (r === 5 || r === 6)
    t = t.stateNode, e ? n.nodeType === 8 ? n.parentNode.insertBefore(t, e) : n.insertBefore(t, e) : (n.nodeType === 8 ? (e = n.parentNode, e.insertBefore(t, n)) : (e = n, e.appendChild(t)), n = n._reactRootContainer, n != null || e.onclick !== null || (e.onclick = _c));
  else if (r !== 4 && r !== 27 && (t = t.child, t !== null))
    for (pu(t, e, n), t = t.sibling; t !== null; )
      pu(t, e, n), t = t.sibling;
}
function xs(t, e, n) {
  var r = t.tag;
  if (r === 5 || r === 6)
    t = t.stateNode, e ? n.insertBefore(t, e) : n.appendChild(t);
  else if (r !== 4 && r !== 27 && (t = t.child, t !== null))
    for (xs(t, e, n), t = t.sibling; t !== null; )
      xs(t, e, n), t = t.sibling;
}
var Ue = null, At = !1;
function _n(t, e, n) {
  for (n = n.child; n !== null; )
    Hm(t, e, n), n = n.sibling;
}
function Hm(t, e, n) {
  if (It && typeof It.onCommitFiberUnmount == "function")
    try {
      It.onCommitFiberUnmount(ga, n);
    } catch {
    }
  switch (n.tag) {
    case 26:
      rt || bt(n, e), _n(
        t,
        e,
        n
      ), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
      break;
    case 27:
      rt || bt(n, e);
      var r = Ue, i = At;
      for (Ue = n.stateNode, _n(
        t,
        e,
        n
      ), n = n.stateNode, t = n.attributes; t.length; )
        n.removeAttributeNode(t[0]);
      Wu(n), Ue = r, At = i;
      break;
    case 5:
      rt || bt(n, e);
    case 6:
      r = Ue, i = At, Ue = null, _n(
        t,
        e,
        n
      ), Ue = r, At = i, Ue !== null && (At ? (t = Ue, n = n.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(n) : t.removeChild(n)) : Ue.removeChild(n.stateNode));
      break;
    case 18:
      Ue !== null && (At ? (t = Ue, n = n.stateNode, t.nodeType === 8 ? Sl(t.parentNode, n) : t.nodeType === 1 && Sl(t, n), ua(t)) : Sl(Ue, n.stateNode));
      break;
    case 4:
      r = Ue, i = At, Ue = n.stateNode.containerInfo, At = !0, _n(
        t,
        e,
        n
      ), Ue = r, At = i;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!rt && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        i = r = r.next;
        do {
          var o = i.tag, a = i.inst, s = a.destroy;
          s !== void 0 && (o & 2 || o & 4) && (a.destroy = void 0, fu(
            n,
            e,
            s
          )), i = i.next;
        } while (i !== r);
      }
      _n(
        t,
        e,
        n
      );
      break;
    case 1:
      if (!rt && (bt(n, e), r = n.stateNode, typeof r.componentWillUnmount == "function"))
        try {
          Nm(n, r);
        } catch (c) {
          ve(n, e, c);
        }
      _n(
        t,
        e,
        n
      );
      break;
    case 21:
      _n(
        t,
        e,
        n
      );
      break;
    case 22:
      bt(n, e), rt = (r = rt) || n.memoizedState !== null, _n(
        t,
        e,
        n
      ), rt = r;
      break;
    default:
      _n(
        t,
        e,
        n
      );
  }
}
function Lm(t, e) {
  if (e.memoizedState === null && (t = e.alternate, t !== null && (t = t.memoizedState, t !== null && (t = t.dehydrated, t !== null))))
    try {
      ua(t);
    } catch (n) {
      ve(e, e.return, n);
    }
}
function p_(t) {
  switch (t.tag) {
    case 13:
    case 19:
      var e = t.stateNode;
      return e === null && (e = t.stateNode = new sf()), e;
    case 22:
      return t = t.stateNode, e = t._retryCache, e === null && (e = t._retryCache = new sf()), e;
    default:
      throw Error(A(435, t.tag));
  }
}
function vl(t, e) {
  var n = p_(t);
  e.forEach(function(r) {
    var i = I_.bind(null, t, r);
    n.has(r) || (n.add(r), r.then(i, i));
  });
}
function Kt(t, e) {
  var n = e.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var i = n[r];
      try {
        var o = t, a = e, s = a;
        e:
          for (; s !== null; ) {
            switch (s.tag) {
              case 27:
              case 5:
                Ue = s.stateNode, At = !1;
                break e;
              case 3:
                Ue = s.stateNode.containerInfo, At = !0;
                break e;
              case 4:
                Ue = s.stateNode.containerInfo, At = !0;
                break e;
            }
            s = s.return;
          }
        if (Ue === null)
          throw Error(A(160));
        Hm(o, a, i), Ue = null, At = !1;
        var c = i.alternate;
        c !== null && (c.return = null), i.return = null;
      } catch (l) {
        ve(i, e, l);
      }
    }
  if (e.subtreeFlags & 13878)
    for (e = e.child; e !== null; )
      xm(e, t), e = e.sibling;
}
var Yt = null;
function xm(t, e) {
  var n = t.alternate, r = t.flags;
  switch (t.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Kt(e, t), Ft(t), r & 4) {
        try {
          qi(3, t, t.return), Od(3, t);
        } catch (f) {
          ve(t, t.return, f);
        }
        try {
          qi(5, t, t.return);
        } catch (f) {
          ve(t, t.return, f);
        }
      }
      break;
    case 1:
      Kt(e, t), Ft(t), r & 512 && n !== null && bt(n, n.return), r & 64 && Rn && (t = t.updateQueue, t !== null && (r = t.callbacks, r !== null && (n = t.shared.hiddenCallbacks, t.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
      break;
    case 26:
      var i = Yt;
      if (Kt(e, t), Ft(t), r & 512 && n !== null && bt(n, n.return), r & 4) {
        if (e = n !== null ? n.memoizedState : null, r = t.memoizedState, n === null)
          if (r === null)
            if (t.stateNode === null) {
              e: {
                r = t.type, n = t.memoizedProps, e = i.ownerDocument || i;
                t:
                  switch (r) {
                    case "title":
                      i = e.getElementsByTagName("title")[0], (!i || i[Jo] || i[ot] || i.namespaceURI === "http://www.w3.org/2000/svg" || i.hasAttribute("itemprop")) && (i = e.createElement(r), e.head.insertBefore(
                        i,
                        e.querySelector("head > title")
                      )), Ze(i, r, n), i[ot] = t, Fe(i), r = i;
                      break e;
                    case "link":
                      var o = yf(
                        "link",
                        "href",
                        e
                      ).get(r + (n.href || ""));
                      if (o) {
                        for (var a = 0; a < o.length; a++)
                          if (i = o[a], i.getAttribute("href") === (n.href == null ? null : n.href) && i.getAttribute("rel") === (n.rel == null ? null : n.rel) && i.getAttribute("title") === (n.title == null ? null : n.title) && i.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
                            o.splice(a, 1);
                            break t;
                          }
                      }
                      i = e.createElement(r), Ze(i, r, n), e.head.appendChild(i);
                      break;
                    case "meta":
                      if (o = yf(
                        "meta",
                        "content",
                        e
                      ).get(r + (n.content || ""))) {
                        for (a = 0; a < o.length; a++)
                          if (i = o[a], i.getAttribute("content") === (n.content == null ? null : "" + n.content) && i.getAttribute("name") === (n.name == null ? null : n.name) && i.getAttribute("property") === (n.property == null ? null : n.property) && i.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && i.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
                            o.splice(a, 1);
                            break t;
                          }
                      }
                      i = e.createElement(r), Ze(i, r, n), e.head.appendChild(i);
                      break;
                    default:
                      throw Error(A(468, r));
                  }
                i[ot] = t, Fe(i), r = i;
              }
              t.stateNode = r;
            } else
              Ef(
                i,
                t.type,
                t.stateNode
              );
          else
            t.stateNode = vf(
              i,
              r,
              t.memoizedProps
            );
        else if (e !== r)
          e === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : e.count--, r === null ? Ef(
            i,
            t.type,
            t.stateNode
          ) : vf(
            i,
            r,
            t.memoizedProps
          );
        else if (r === null && t.stateNode !== null)
          try {
            var s = t.stateNode, c = t.memoizedProps;
            Bh(
              s,
              t.type,
              n.memoizedProps,
              c
            ), s[ht] = c;
          } catch (f) {
            ve(
              t,
              t.return,
              f
            );
          }
      }
      break;
    case 27:
      if (r & 4 && t.alternate === null) {
        for (i = t.stateNode, o = t.memoizedProps, a = i.firstChild; a; ) {
          var l = a.nextSibling, u = a.nodeName;
          a[Jo] || u === "HEAD" || u === "BODY" || u === "SCRIPT" || u === "STYLE" || u === "LINK" && a.rel.toLowerCase() === "stylesheet" || i.removeChild(a), a = l;
        }
        for (a = t.type, l = i.attributes; l.length; )
          i.removeAttributeNode(l[0]);
        Ze(i, a, o), i[ot] = t, i[ht] = o;
      }
    case 5:
      if (Kt(e, t), Ft(t), r & 512 && n !== null && bt(n, n.return), t.flags & 32) {
        e = t.stateNode;
        try {
          Pi(e, "");
        } catch (f) {
          ve(t, t.return, f);
        }
      }
      if (r & 4 && (e = t.stateNode, e != null)) {
        i = t.memoizedProps, n = n !== null ? n.memoizedProps : i, o = t.type;
        try {
          Bh(e, o, n, i), e[ht] = i;
        } catch (f) {
          ve(t, t.return, f);
        }
      }
      r & 1024 && (gl = !0);
      break;
    case 6:
      if (Kt(e, t), Ft(t), r & 4) {
        if (t.stateNode === null)
          throw Error(A(162));
        r = t.stateNode, n = t.memoizedProps;
        try {
          r.nodeValue = n;
        } catch (f) {
          ve(t, t.return, f);
        }
      }
      break;
    case 3:
      if (ls = null, i = Yt, Yt = Ks(e.containerInfo), Kt(e, t), Yt = i, Ft(t), r & 4 && n !== null && n.memoizedState.isDehydrated)
        try {
          ua(e.containerInfo);
        } catch (f) {
          ve(t, t.return, f);
        }
      gl && (gl = !1, qm(t));
      break;
    case 4:
      r = Yt, Yt = Ks(
        t.stateNode.containerInfo
      ), Kt(e, t), Ft(t), Yt = r;
      break;
    case 13:
      Kt(e, t), Ft(t), t.child.flags & 8192 && t.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Hd = hn()), r & 4 && (r = t.updateQueue, r !== null && (t.updateQueue = null, vl(t, r)));
      break;
    case 22:
      r & 512 && n !== null && bt(n, n.return), s = t.memoizedState !== null, c = n !== null && n.memoizedState !== null;
      var d = Rn, h = rt;
      if (Rn = d || s, rt = h || c, Kt(e, t), rt = h, Rn = d, Ft(t), e = t.stateNode, e._current = t, e._visibility &= -3, e._visibility |= e._pendingVisibility & 2, r & 8192 && (e._visibility = s ? e._visibility & -2 : e._visibility | 1, s && (e = Rn || rt, n === null || c || e || ei(t)), t.memoizedProps === null || t.memoizedProps.mode !== "manual"))
        e:
          for (n = null, e = t; ; ) {
            if (e.tag === 5 || e.tag === 26 || e.tag === 27) {
              if (n === null) {
                n = e;
                try {
                  i = e.stateNode, s ? (o = i.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (a = e.stateNode, l = e.memoizedProps.style, u = l != null && l.hasOwnProperty("display") ? l.display : null, a.style.display = u == null || typeof u == "boolean" ? "" : ("" + u).trim());
                } catch (f) {
                  ve(
                    t,
                    t.return,
                    f
                  );
                }
              }
            } else if (e.tag === 6) {
              if (n === null)
                try {
                  e.stateNode.nodeValue = s ? "" : e.memoizedProps;
                } catch (f) {
                  ve(
                    t,
                    t.return,
                    f
                  );
                }
            } else if ((e.tag !== 22 && e.tag !== 23 || e.memoizedState === null || e === t) && e.child !== null) {
              e.child.return = e, e = e.child;
              continue;
            }
            if (e === t)
              break e;
            for (; e.sibling === null; ) {
              if (e.return === null || e.return === t)
                break e;
              n === e && (n = null), e = e.return;
            }
            n === e && (n = null), e.sibling.return = e.return, e = e.sibling;
          }
      r & 4 && (r = t.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, vl(t, n))));
      break;
    case 19:
      Kt(e, t), Ft(t), r & 4 && (r = t.updateQueue, r !== null && (t.updateQueue = null, vl(t, r)));
      break;
    case 21:
      break;
    default:
      Kt(e, t), Ft(t);
  }
}
function Ft(t) {
  var e = t.flags;
  if (e & 2) {
    try {
      if (t.tag !== 27) {
        e: {
          for (var n = t.return; n !== null; ) {
            if (Pm(n)) {
              var r = n;
              break e;
            }
            n = n.return;
          }
          throw Error(A(160));
        }
        switch (r.tag) {
          case 27:
            var i = r.stateNode, o = ml(t);
            xs(t, o, i);
            break;
          case 5:
            var a = r.stateNode;
            r.flags & 32 && (Pi(a, ""), r.flags &= -33);
            var s = ml(t);
            xs(t, s, a);
            break;
          case 3:
          case 4:
            var c = r.stateNode.containerInfo, l = ml(t);
            pu(
              t,
              l,
              c
            );
            break;
          default:
            throw Error(A(161));
        }
      }
    } catch (u) {
      ve(t, t.return, u);
    }
    t.flags &= -3;
  }
  e & 4096 && (t.flags &= -4097);
}
function qm(t) {
  if (t.subtreeFlags & 1024)
    for (t = t.child; t !== null; ) {
      var e = t;
      qm(e), e.tag === 5 && e.flags & 1024 && e.stateNode.reset(), t = t.sibling;
    }
}
function Cn(t, e) {
  if (e.subtreeFlags & 8772)
    for (e = e.child; e !== null; )
      Um(t, e.alternate, e), e = e.sibling;
}
function ei(t) {
  for (t = t.child; t !== null; ) {
    var e = t;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        qi(4, e, e.return), ei(e);
        break;
      case 1:
        bt(e, e.return);
        var n = e.stateNode;
        if (typeof n.componentWillUnmount == "function") {
          var r = e, i = e.return;
          try {
            Nm(r, n);
          } catch (o) {
            ve(r, i, o);
          }
        }
        ei(e);
        break;
      case 26:
      case 27:
      case 5:
        bt(e, e.return), ei(e);
        break;
      case 22:
        bt(e, e.return), e.memoizedState === null && ei(e);
        break;
      default:
        ei(e);
    }
    t = t.sibling;
  }
}
function Yn(t, e, n) {
  for (n = n && (e.subtreeFlags & 8772) !== 0, e = e.child; e !== null; ) {
    var r = e.alternate, i = t, o = e, a = o.flags;
    switch (o.tag) {
      case 0:
      case 11:
      case 15:
        Yn(
          i,
          o,
          n
        ), Om(o, 4);
        break;
      case 1:
        if (Yn(
          i,
          o,
          n
        ), i = o.stateNode, typeof i.componentDidMount == "function")
          try {
            i.componentDidMount();
          } catch (c) {
            ve(o, o.return, c);
          }
        if (r = o.updateQueue, r !== null) {
          var s = r.shared.hiddenCallbacks;
          if (s !== null)
            for (r.shared.hiddenCallbacks = null, r = 0; r < s.length; r++)
              Rm(s[r], i);
        }
        n && a & 64 && Mm(o), wr(o, o.return);
        break;
      case 26:
      case 27:
      case 5:
        Yn(
          i,
          o,
          n
        ), n && r === null && a & 4 && km(o), wr(o, o.return);
        break;
      case 12:
        Yn(
          i,
          o,
          n
        );
        break;
      case 13:
        Yn(
          i,
          o,
          n
        ), n && a & 4 && Lm(i, o);
        break;
      case 22:
        o.memoizedState === null && Yn(
          i,
          o,
          n
        ), wr(o, o.return);
        break;
      default:
        Yn(
          i,
          o,
          n
        );
    }
    e = e.sibling;
  }
}
function Bm(t, e) {
  try {
    Od(e, t);
  } catch (n) {
    ve(t, t.return, n);
  }
}
function Md(t, e) {
  var n = null;
  t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (n = t.memoizedState.cachePool.pool), t = null, e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), t !== n && (t != null && t.refCount++, n != null && ya(n));
}
function kd(t, e) {
  t = null, e.alternate !== null && (t = e.alternate.memoizedState.cache), e = e.memoizedState.cache, e !== t && (e.refCount++, t != null && ya(t));
}
function Qr(t, e, n, r) {
  if (e.subtreeFlags & 10256)
    for (e = e.child; e !== null; )
      zm(
        t,
        e,
        n,
        r
      ), e = e.sibling;
}
function zm(t, e, n, r) {
  var i = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 15:
      Qr(
        t,
        e,
        n,
        r
      ), i & 2048 && Bm(e, 9);
      break;
    case 3:
      Qr(
        t,
        e,
        n,
        r
      ), i & 2048 && (t = null, e.alternate !== null && (t = e.alternate.memoizedState.cache), e = e.memoizedState.cache, e !== t && (e.refCount++, t != null && ya(t)));
      break;
    case 23:
      break;
    case 22:
      var o = e.stateNode;
      e.memoizedState !== null ? o._visibility & 4 ? Qr(
        t,
        e,
        n,
        r
      ) : Lo(t, e) : o._visibility & 4 ? Qr(
        t,
        e,
        n,
        r
      ) : (o._visibility |= 4, ti(
        t,
        e,
        n,
        r,
        (e.subtreeFlags & 10256) !== 0
      )), i & 2048 && Md(
        e.alternate,
        e
      );
      break;
    case 24:
      Qr(
        t,
        e,
        n,
        r
      ), i & 2048 && kd(e.alternate, e);
      break;
    default:
      Qr(
        t,
        e,
        n,
        r
      );
  }
}
function ti(t, e, n, r, i) {
  for (i = i && (e.subtreeFlags & 10256) !== 0, e = e.child; e !== null; ) {
    var o = t, a = e, s = n, c = r, l = a.flags;
    switch (a.tag) {
      case 0:
      case 11:
      case 15:
        ti(
          o,
          a,
          s,
          c,
          i
        ), Bm(a, 8);
        break;
      case 23:
        break;
      case 22:
        var u = a.stateNode;
        a.memoizedState !== null ? u._visibility & 4 ? ti(
          o,
          a,
          s,
          c,
          i
        ) : Lo(
          o,
          a
        ) : (u._visibility |= 4, ti(
          o,
          a,
          s,
          c,
          i
        )), i && l & 2048 && Md(
          a.alternate,
          a
        );
        break;
      case 24:
        ti(
          o,
          a,
          s,
          c,
          i
        ), i && l & 2048 && kd(a.alternate, a);
        break;
      default:
        ti(
          o,
          a,
          s,
          c,
          i
        );
    }
    e = e.sibling;
  }
}
function Lo(t, e) {
  if (e.subtreeFlags & 10256)
    for (e = e.child; e !== null; ) {
      var n = t, r = e, i = r.flags;
      switch (r.tag) {
        case 22:
          Lo(n, r), i & 2048 && Md(
            r.alternate,
            r
          );
          break;
        case 24:
          Lo(n, r), i & 2048 && kd(r.alternate, r);
          break;
        default:
          Lo(n, r);
      }
      e = e.sibling;
    }
}
var Co = 8192;
function Vr(t) {
  if (t.subtreeFlags & Co)
    for (t = t.child; t !== null; )
      Gm(t), t = t.sibling;
}
function Gm(t) {
  switch (t.tag) {
    case 26:
      Vr(t), t.flags & Co && t.memoizedState !== null && $_(
        Yt,
        t.memoizedState,
        t.memoizedProps
      );
      break;
    case 5:
      Vr(t);
      break;
    case 3:
    case 4:
      var e = Yt;
      Yt = Ks(t.stateNode.containerInfo), Vr(t), Yt = e;
      break;
    case 22:
      t.memoizedState === null && (e = t.alternate, e !== null && e.memoizedState !== null ? (e = Co, Co = 16777216, Vr(t), Co = e) : Vr(t));
      break;
    default:
      Vr(t);
  }
}
function Km(t) {
  var e = t.alternate;
  if (e !== null && (t = e.child, t !== null)) {
    e.child = null;
    do
      e = t.sibling, t.sibling = null, t = e;
    while (t !== null);
  }
}
function yl(t) {
  var e = t.deletions;
  if (t.flags & 16) {
    if (e !== null)
      for (var n = 0; n < e.length; n++) {
        var r = e[n];
        Ke = r, jm(
          r,
          t
        );
      }
    Km(t);
  }
  if (t.subtreeFlags & 10256)
    for (t = t.child; t !== null; )
      Fm(t), t = t.sibling;
}
function Fm(t) {
  switch (t.tag) {
    case 0:
    case 11:
    case 15:
      yl(t), t.flags & 2048 && qi(9, t, t.return);
      break;
    case 22:
      var e = t.stateNode;
      t.memoizedState !== null && e._visibility & 4 && (t.return === null || t.return.tag !== 13) ? (e._visibility &= -5, as(t)) : yl(t);
      break;
    default:
      yl(t);
  }
}
function as(t) {
  var e = t.deletions;
  if (t.flags & 16) {
    if (e !== null)
      for (var n = 0; n < e.length; n++) {
        var r = e[n];
        Ke = r, jm(
          r,
          t
        );
      }
    Km(t);
  }
  for (t = t.child; t !== null; ) {
    switch (e = t, e.tag) {
      case 0:
      case 11:
      case 15:
        qi(8, e, e.return), as(e);
        break;
      case 22:
        n = e.stateNode, n._visibility & 4 && (n._visibility &= -5, as(e));
        break;
      default:
        as(e);
    }
    t = t.sibling;
  }
}
function jm(t, e) {
  for (; Ke !== null; ) {
    var n = Ke;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        qi(8, n, e);
        break;
      case 23:
      case 22:
        if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
          var r = n.memoizedState.cachePool.pool;
          r != null && r.refCount++;
        }
        break;
      case 24:
        ya(n.memoizedState.cache);
    }
    if (r = n.child, r !== null)
      r.return = n, Ke = r;
    else
      e:
        for (n = t; Ke !== null; ) {
          r = Ke;
          var i = r.sibling, o = r.return;
          if (Dm(r), r === n) {
            Ke = null;
            break e;
          }
          if (i !== null) {
            i.return = o, Ke = i;
            break e;
          }
          Ke = o;
        }
  }
}
function g_(t, e, n, r) {
  this.tag = t, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = e, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function Xt(t, e, n, r) {
  return new g_(t, e, n, r);
}
function Ud(t) {
  return t = t.prototype, !(!t || !t.isReactComponent);
}
function ar(t, e) {
  var n = t.alternate;
  return n === null ? (n = Xt(
    t.tag,
    e,
    t.key,
    t.mode
  ), n.elementType = t.elementType, n.type = t.type, n.stateNode = t.stateNode, n.alternate = t, t.alternate = n) : (n.pendingProps = e, n.type = t.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = t.flags & 31457280, n.childLanes = t.childLanes, n.lanes = t.lanes, n.child = t.child, n.memoizedProps = t.memoizedProps, n.memoizedState = t.memoizedState, n.updateQueue = t.updateQueue, e = t.dependencies, n.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }, n.sibling = t.sibling, n.index = t.index, n.ref = t.ref, n.refCleanup = t.refCleanup, n;
}
function Ym(t, e) {
  t.flags &= 31457282;
  var n = t.alternate;
  return n === null ? (t.childLanes = 0, t.lanes = e, t.child = null, t.subtreeFlags = 0, t.memoizedProps = null, t.memoizedState = null, t.updateQueue = null, t.dependencies = null, t.stateNode = null) : (t.childLanes = n.childLanes, t.lanes = n.lanes, t.child = n.child, t.subtreeFlags = 0, t.deletions = null, t.memoizedProps = n.memoizedProps, t.memoizedState = n.memoizedState, t.updateQueue = n.updateQueue, t.type = n.type, e = n.dependencies, t.dependencies = e === null ? null : {
    lanes: e.lanes,
    firstContext: e.firstContext
  }), t;
}
function ss(t, e, n, r, i, o) {
  var a = 0;
  if (r = t, typeof t == "function")
    Ud(t) && (a = 1);
  else if (typeof t == "string")
    a = Q_(
      t,
      n,
      dn.current
    ) ? 26 : t === "html" || t === "head" || t === "body" ? 27 : 5;
  else
    e:
      switch (t) {
        case mo:
          return Or(n.children, i, o, e);
        case Dy:
          a = 8, i |= 24;
          break;
        case fh:
          return t = Xt(12, n, e, i | 2), t.elementType = fh, t.lanes = o, t;
        case ph:
          return t = Xt(13, n, e, i), t.elementType = ph, t.lanes = o, t;
        case gh:
          return t = Xt(19, n, e, i), t.elementType = gh, t.lanes = o, t;
        case Gp:
          return Qm(n, i, o, e);
        default:
          if (typeof t == "object" && t !== null)
            switch (t.$$typeof) {
              case Py:
              case tr:
                a = 10;
                break e;
              case Hy:
                a = 9;
                break e;
              case Bp:
                a = 11;
                break e;
              case zp:
                a = 14;
                break e;
              case vr:
                a = 16, r = null;
                break e;
            }
          throw Error(
            A(130, t == null ? t : typeof t, "")
          );
      }
  return e = Xt(a, n, e, i), e.elementType = t, e.type = r, e.lanes = o, e;
}
function Or(t, e, n, r) {
  return t = Xt(7, t, r, e), t.lanes = n, t;
}
function Qm(t, e, n, r) {
  t = Xt(22, t, r, e), t.elementType = Gp, t.lanes = n;
  var i = {
    _visibility: 1,
    _pendingVisibility: 1,
    _pendingMarkers: null,
    _retryCache: null,
    _transitions: null,
    _current: null,
    detach: function() {
      var o = i._current;
      if (o === null)
        throw Error(A(456));
      if (!(i._pendingVisibility & 2)) {
        var a = hr(o, 2);
        a !== null && (i._pendingVisibility |= 2, ft(a, o, 2));
      }
    },
    attach: function() {
      var o = i._current;
      if (o === null)
        throw Error(A(456));
      if (i._pendingVisibility & 2) {
        var a = hr(o, 2);
        a !== null && (i._pendingVisibility &= -3, ft(a, o, 2));
      }
    }
  };
  return t.stateNode = i, t;
}
function El(t, e, n) {
  return t = Xt(6, t, null, e), t.lanes = n, t;
}
function _l(t, e, n) {
  return e = Xt(
    4,
    t.children !== null ? t.children : [],
    t.key,
    e
  ), e.lanes = n, e.stateNode = {
    containerInfo: t.containerInfo,
    pendingChildren: null,
    implementation: t.implementation
  }, e;
}
function Tn(t) {
  t.flags |= 4;
}
function lf(t, e) {
  if (e.type !== "stylesheet" || e.state.loading & 4)
    t.flags &= -16777217;
  else if (t.flags |= 16777216, (ae & 42) === 0 && (e = !(e.type === "stylesheet" && !(e.state.loading & 3)), !e))
    if (Wm())
      t.flags |= 8192;
    else
      throw Mo = Wl, Og;
}
function qa(t, e) {
  e !== null ? t.flags |= 4 : t.flags & 16384 && (e = t.tag !== 22 ? Xp() : 536870912, t.lanes |= e);
}
function lo(t, e) {
  if (!le)
    switch (t.tailMode) {
      case "hidden":
        e = t.tail;
        for (var n = null; e !== null; )
          e.alternate !== null && (n = e), e = e.sibling;
        n === null ? t.tail = null : n.sibling = null;
        break;
      case "collapsed":
        n = t.tail;
        for (var r = null; n !== null; )
          n.alternate !== null && (r = n), n = n.sibling;
        r === null ? e || t.tail === null ? t.tail = null : t.tail.sibling = null : r.sibling = null;
    }
}
function Re(t) {
  var e = t.alternate !== null && t.alternate.child === t.child, n = 0, r = 0;
  if (e)
    for (var i = t.child; i !== null; )
      n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 31457280, r |= i.flags & 31457280, i.return = t, i = i.sibling;
  else
    for (i = t.child; i !== null; )
      n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = t, i = i.sibling;
  return t.subtreeFlags |= r, t.childLanes = n, e;
}
function m_(t, e, n) {
  var r = e.pendingProps;
  switch (ud(e), e.tag) {
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return Re(e), null;
    case 1:
      return Re(e), null;
    case 3:
      return n = e.stateNode, r = null, t !== null && (r = t.memoizedState.cache), e.memoizedState.cache !== r && (e.flags |= 2048), Un(xe), Ui(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (t === null || t.child === null) && (so(e) ? Tn(e) : t === null || t.memoizedState.isDehydrated && !(e.flags & 256) || (e.flags |= 1024, Qt !== null && (yu(Qt), Qt = null))), Re(e), null;
    case 26:
      if (n = e.memoizedState, t === null)
        Tn(e), n !== null ? (Re(e), lf(e, n)) : (Re(e), e.flags &= -16777217);
      else {
        var i = t.memoizedState;
        n !== i && Tn(e), n !== null ? (Re(e), n === i ? e.flags &= -16777217 : lf(e, n)) : (t.memoizedProps !== r && Tn(e), Re(e), e.flags &= -16777217);
      }
      return null;
    case 27:
      if (Cs(e), n = ir.current, i = e.type, t !== null && e.stateNode != null)
        t.memoizedProps !== r && Tn(e);
      else {
        if (!r) {
          if (e.stateNode === null)
            throw Error(A(166));
          return Re(e), null;
        }
        t = dn.current, so(e) ? Gh(e) : (t = sv(
          i,
          r,
          n
        ), e.stateNode = t, Tn(e));
      }
      return Re(e), null;
    case 5:
      if (Cs(e), n = e.type, t !== null && e.stateNode != null)
        t.memoizedProps !== r && Tn(e);
      else {
        if (!r) {
          if (e.stateNode === null)
            throw Error(A(166));
          return Re(e), null;
        }
        if (t = dn.current, so(e))
          Gh(e);
        else {
          switch (i = Gs(
            ir.current
          ), t) {
            case 1:
              t = i.createElementNS(
                "http://www.w3.org/2000/svg",
                n
              );
              break;
            case 2:
              t = i.createElementNS(
                "http://www.w3.org/1998/Math/MathML",
                n
              );
              break;
            default:
              switch (n) {
                case "svg":
                  t = i.createElementNS(
                    "http://www.w3.org/2000/svg",
                    n
                  );
                  break;
                case "math":
                  t = i.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    n
                  );
                  break;
                case "script":
                  t = i.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild);
                  break;
                case "select":
                  t = typeof r.is == "string" ? i.createElement("select", {
                    is: r.is
                  }) : i.createElement("select"), r.multiple ? t.multiple = !0 : r.size && (t.size = r.size);
                  break;
                default:
                  t = typeof r.is == "string" ? i.createElement(n, {
                    is: r.is
                  }) : i.createElement(n);
              }
          }
          t[ot] = e, t[ht] = r;
          e:
            for (i = e.child; i !== null; ) {
              if (i.tag === 5 || i.tag === 6)
                t.appendChild(i.stateNode);
              else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                i.child.return = i, i = i.child;
                continue;
              }
              if (i === e)
                break e;
              for (; i.sibling === null; ) {
                if (i.return === null || i.return === e)
                  break e;
                i = i.return;
              }
              i.sibling.return = i.return, i = i.sibling;
            }
          e.stateNode = t;
          e:
            switch (Ze(t, n, r), n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                t = !!r.autoFocus;
                break e;
              case "img":
                t = !0;
                break e;
              default:
                t = !1;
            }
          t && Tn(e);
        }
      }
      return Re(e), e.flags &= -16777217, null;
    case 6:
      if (t && e.stateNode != null)
        t.memoizedProps !== r && Tn(e);
      else {
        if (typeof r != "string" && e.stateNode === null)
          throw Error(A(166));
        if (t = ir.current, so(e)) {
          if (t = e.stateNode, n = e.memoizedProps, r = null, i = ut, i !== null)
            switch (i.tag) {
              case 27:
              case 5:
                r = i.memoizedProps;
            }
          t[ot] = e, t = !!(t.nodeValue === n || r !== null && r.suppressHydrationWarning === !0 || Rg(t.nodeValue, n)), t || Ur(e);
        } else
          t = Gs(t).createTextNode(
            r
          ), t[ot] = e, e.stateNode = t;
      }
      return Re(e), null;
    case 13:
      if (r = e.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
        if (i = so(e), r !== null && r.dehydrated !== null) {
          if (t === null) {
            if (!i)
              throw Error(A(318));
            if (i = e.memoizedState, i = i !== null ? i.dehydrated : null, !i)
              throw Error(A(317));
            i[ot] = e;
          } else
            va(), !(e.flags & 128) && (e.memoizedState = null), e.flags |= 4;
          Re(e), i = !1;
        } else
          Qt !== null && (yu(Qt), Qt = null), i = !0;
        if (!i)
          return e.flags & 256 ? (On(e), e) : (On(e), null);
      }
      if (On(e), e.flags & 128)
        return e.lanes = n, e;
      if (n = r !== null, t = t !== null && t.memoizedState !== null, n) {
        r = e.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool);
        var o = null;
        r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== i && (r.flags |= 2048);
      }
      return n !== t && n && (e.child.flags |= 8192), qa(e, e.updateQueue), Re(e), null;
    case 4:
      return Ui(), t === null && ad(e.stateNode.containerInfo), Re(e), null;
    case 10:
      return Un(e.type), Re(e), null;
    case 19:
      if (je(Be), i = e.memoizedState, i === null)
        return Re(e), null;
      if (r = (e.flags & 128) !== 0, o = i.rendering, o === null)
        if (r)
          lo(i, !1);
        else {
          if (Oe !== 0 || t !== null && t.flags & 128)
            for (t = e.child; t !== null; ) {
              if (o = ks(t), o !== null) {
                for (e.flags |= 128, lo(i, !1), t = o.updateQueue, e.updateQueue = t, qa(e, t), e.subtreeFlags = 0, t = n, n = e.child; n !== null; )
                  Ym(n, t), n = n.sibling;
                return Te(
                  Be,
                  Be.current & 1 | 2
                ), e.child;
              }
              t = t.sibling;
            }
          i.tail !== null && hn() > Bs && (e.flags |= 128, r = !0, lo(i, !1), e.lanes = 4194304);
        }
      else {
        if (!r)
          if (t = ks(o), t !== null) {
            if (e.flags |= 128, r = !0, t = t.updateQueue, e.updateQueue = t, qa(e, t), lo(i, !0), i.tail === null && i.tailMode === "hidden" && !o.alternate && !le)
              return Re(e), null;
          } else
            2 * hn() - i.renderingStartTime > Bs && n !== 536870912 && (e.flags |= 128, r = !0, lo(i, !1), e.lanes = 4194304);
        i.isBackwards ? (o.sibling = e.child, e.child = o) : (t = i.last, t !== null ? t.sibling = o : e.child = o, i.last = o);
      }
      return i.tail !== null ? (e = i.tail, i.rendering = e, i.tail = e.sibling, i.renderingStartTime = hn(), e.sibling = null, t = Be.current, Te(Be, r ? t & 1 | 2 : t & 1), e) : (Re(e), null);
    case 22:
    case 23:
      return On(e), dd(), r = e.memoizedState !== null, t !== null ? t.memoizedState !== null !== r && (e.flags |= 8192) : r && (e.flags |= 8192), r ? n & 536870912 && !(e.flags & 128) && (Re(e), e.subtreeFlags & 6 && (e.flags |= 8192)) : Re(e), n = e.updateQueue, n !== null && qa(e, n.retryQueue), n = null, t !== null && t.memoizedState !== null && t.memoizedState.cachePool !== null && (n = t.memoizedState.cachePool.pool), r = null, e.memoizedState !== null && e.memoizedState.cachePool !== null && (r = e.memoizedState.cachePool.pool), r !== n && (e.flags |= 2048), t !== null && je(Nr), null;
    case 24:
      return n = null, t !== null && (n = t.memoizedState.cache), e.memoizedState.cache !== n && (e.flags |= 2048), Un(xe), Re(e), null;
    case 25:
      return null;
  }
  throw Error(A(156, e.tag));
}
function v_(t, e) {
  switch (ud(e), e.tag) {
    case 1:
      return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
    case 3:
      return Un(xe), Ui(), t = e.flags, t & 65536 && !(t & 128) ? (e.flags = t & -65537 | 128, e) : null;
    case 26:
    case 27:
    case 5:
      return Cs(e), null;
    case 13:
      if (On(e), t = e.memoizedState, t !== null && t.dehydrated !== null) {
        if (e.alternate === null)
          throw Error(A(340));
        va();
      }
      return t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
    case 19:
      return je(Be), null;
    case 4:
      return Ui(), null;
    case 10:
      return Un(e.type), null;
    case 22:
    case 23:
      return On(e), dd(), t !== null && je(Nr), t = e.flags, t & 65536 ? (e.flags = t & -65537 | 128, e) : null;
    case 24:
      return Un(xe), null;
    case 25:
      return null;
    default:
      return null;
  }
}
function Vm(t, e) {
  switch (ud(e), e.tag) {
    case 3:
      Un(xe), Ui();
      break;
    case 26:
    case 27:
    case 5:
      Cs(e);
      break;
    case 4:
      Ui();
      break;
    case 13:
      On(e);
      break;
    case 19:
      je(Be);
      break;
    case 10:
      Un(e.type);
      break;
    case 22:
    case 23:
      On(e), dd(), t !== null && je(Nr);
      break;
    case 24:
      Un(xe);
  }
}
var y_ = {
  getCacheForType: function(t) {
    var e = at(xe), n = e.data.get(t);
    return n === void 0 && (n = t(), e.data.set(t, n)), n;
  }
}, E_ = typeof WeakMap == "function" ? WeakMap : Map, he = 0, me = null, re = null, ae = 0, Ae = 0, Ut = null, Dd = !1, zn = 0, Oe = 0, Gn = 0, Zi = 0, Pd = 0, St = 0, xo = null, Jt = null, Bi = !1, qs = !1, Hd = 0, Bs = 1 / 0, aa = null, sr = null, Ba = !1, _r = null, qo = 0, gu = 0, mu = null, Bo = 0, vu = null;
function Pn() {
  if (he & 2 && ae !== 0)
    return ae & -ae;
  if (pd() !== null) {
    var t = Li;
    return t !== 0 ? t : fd();
  }
  return eg();
}
function $m() {
  St === 0 && (St = !(ae & 536870912) || le ? $p() : 536870912);
  var t = pn.current;
  return t !== null && (t.flags |= 32), St;
}
function ft(t, e, n) {
  (t === me && Ae === 2 || t.cancelPendingCommit !== null) && (Fr(t, 0), ln(
    t,
    ae,
    St
  )), Ca(t, n), (!(he & 2) || t !== me) && (t === me && (!(he & 2) && (Zi |= n), Oe === 4 && ln(
    t,
    ae,
    St
  )), Tt(t));
}
function Xm(t, e) {
  if (he & 6)
    throw Error(A(327));
  var n = t.callbackNode;
  if (Ii() && t.callbackNode !== n)
    return null;
  var r = Ss(
    t,
    t === me ? ae : 0
  );
  if (r === 0)
    return null;
  var i = (r & 60) === 0 && (r & t.expiredLanes) === 0 && !e;
  if (e = i ? S_(t, r) : zs(t, r), e !== 0) {
    var o = i;
    do {
      if (e === 6)
        ln(t, r, 0);
      else {
        if (i = t.current.alternate, o && !__(i)) {
          e = zs(t, r), o = !1;
          continue;
        }
        if (e === 2) {
          o = r;
          var a = Vp(
            t,
            o
          );
          if (a !== 0 && (r = a, e = Jm(
            t,
            o,
            a
          ), o = !1, e !== 2))
            continue;
        }
        if (e === 1) {
          Fr(t, 0), ln(t, r, 0);
          break;
        }
        t.finishedWork = i, t.finishedLanes = r;
        e: {
          switch (o = t, e) {
            case 0:
            case 1:
              throw Error(A(345));
            case 4:
              if ((r & 4194176) === r) {
                ln(
                  o,
                  r,
                  St
                );
                break e;
              }
              break;
            case 2:
              Jt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(A(329));
          }
          if ((r & 62914560) === r && (e = Hd + 300 - hn(), 10 < e)) {
            if (ln(
              o,
              r,
              St
            ), Ss(o, 0) !== 0)
              break e;
            o.timeoutHandle = av(
              uf.bind(
                null,
                o,
                i,
                Jt,
                aa,
                Bi,
                r,
                St
              ),
              e
            );
            break e;
          }
          uf(
            o,
            i,
            Jt,
            aa,
            Bi,
            r,
            St
          );
        }
      }
      break;
    } while (!0);
  }
  return Tt(t), Pg(t, hn()), t = t.callbackNode === n ? Xm.bind(null, t) : null, t;
}
function Jm(t, e, n) {
  var r = xo, i = t.current.memoizedState.isDehydrated;
  if (i && (Fr(t, n).flags |= 256), n = zs(t, n), n !== 2) {
    if (Dd && !i)
      return t.errorRecoveryDisabledLanes |= e, Zi |= e, 4;
    t = Jt, Jt = r, t !== null && yu(t);
  }
  return n;
}
function yu(t) {
  Jt === null ? Jt = t : Jt.push.apply(
    Jt,
    t
  );
}
function uf(t, e, n, r, i, o, a) {
  if (!(o & 42) && (sa = { stylesheets: null, count: 0, unsuspend: V_ }, Gm(e), e = X_(), e !== null)) {
    t.cancelPendingCommit = e(
      _u.bind(
        null,
        t,
        n,
        r,
        i
      )
    ), ln(t, o, a);
    return;
  }
  _u(
    t,
    n,
    r,
    i,
    a
  );
}
function __(t) {
  for (var e = t; ; ) {
    if (e.flags & 16384) {
      var n = e.updateQueue;
      if (n !== null && (n = n.stores, n !== null))
        for (var r = 0; r < n.length; r++) {
          var i = n[r], o = i.getSnapshot;
          i = i.value;
          try {
            if (!zt(o(), i))
              return !1;
          } catch {
            return !1;
          }
        }
    }
    if (n = e.child, e.subtreeFlags & 16384 && n !== null)
      n.return = e, e = n;
    else {
      if (e === t)
        break;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t)
          return !0;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
  }
  return !0;
}
function Ca(t, e) {
  t.pendingLanes |= e, e !== 268435456 && (t.suspendedLanes = 0, t.pingedLanes = 0), he & 2 ? Bi = !0 : he & 4 && (qs = !0), xd();
}
function ln(t, e, n) {
  e &= ~Pd, e &= ~Zi, t.suspendedLanes |= e, t.pingedLanes &= ~e;
  for (var r = t.expirationTimes, i = e; 0 < i; ) {
    var o = 31 - qt(i), a = 1 << o;
    r[o] = -1, i &= ~a;
  }
  n !== 0 && Jp(t, n, e);
}
function C_(t, e) {
  if (he & 6)
    throw Error(A(327));
  if (Ii())
    return Tt(t), null;
  var n = zs(t, e);
  if (n === 2) {
    var r = e, i = Vp(
      t,
      r
    );
    i !== 0 && (e = i, n = Jm(
      t,
      r,
      i
    ));
  }
  return n === 1 ? (Fr(t, 0), ln(t, e, 0), Tt(t), null) : n === 6 ? (ln(t, e, St), Tt(t), null) : (t.finishedWork = t.current.alternate, t.finishedLanes = e, _u(
    t,
    Jt,
    aa,
    Bi,
    St
  ), Tt(t), null);
}
function Ic() {
  return he & 6 ? !0 : (Ea(), !1);
}
function Ld() {
  if (re !== null) {
    if (Ae === 0)
      var t = re.return;
    else
      t = re, Rc(), _d(t), Ti = null, ia = 0, t = re;
    for (; t !== null; )
      Vm(t.alternate, t), t = t.return;
    re = null;
  }
}
function Fr(t, e) {
  t.finishedWork = null, t.finishedLanes = 0;
  var n = t.timeoutHandle;
  n !== -1 && (t.timeoutHandle = -1, M_(n)), n = t.cancelPendingCommit, n !== null && (t.cancelPendingCommit = null, n()), Ld(), me = t, re = n = ar(t.current, null), ae = e, Ae = 0, Ut = null, Dd = !1, St = Pd = Zi = Gn = Oe = 0, Jt = xo = null, Bi = !1, e & 8 && (e |= e & 32);
  var r = t.entangledLanes;
  if (r !== 0)
    for (t = t.entanglements, r &= e; 0 < r; ) {
      var i = 31 - qt(r), o = 1 << i;
      e |= t[i], r &= ~o;
    }
  return zn = e, Cc(), n;
}
function Zm(t, e) {
  te = null, ne.H = Bn, e === ns ? (e = jh(), Ae = Wm() && !(Gn & 134217727) && !(Zi & 134217727) ? 2 : 3) : e === Og ? (e = jh(), Ae = 4) : Ae = e === _m ? 8 : e !== null && typeof e == "object" && typeof e.then == "function" ? 6 : 1, Ut = e, re === null && (Oe = 1, Ls(
    t,
    xt(e, t.current)
  ));
}
function Wm() {
  var t = pn.current;
  return t === null ? !0 : (ae & 4194176) === ae ? fn === null : (ae & 62914560) === ae || ae & 536870912 ? t === fn : !1;
}
function ev() {
  var t = ne.H;
  return ne.H = Bn, t === null ? Bn : t;
}
function tv() {
  var t = ne.A;
  return ne.A = y_, t;
}
function Eu() {
  Oe = 4, !(Gn & 134217727) && !(Zi & 134217727) || me === null || ln(
    me,
    ae,
    St
  );
}
function zs(t, e) {
  var n = he;
  he |= 2;
  var r = ev(), i = tv();
  (me !== t || ae !== e) && (aa = null, Fr(t, e)), e = !1;
  e:
    do
      try {
        if (Ae !== 0 && re !== null) {
          var o = re, a = Ut;
          switch (Ae) {
            case 8:
              Ld(), Oe = 6;
              break e;
            case 3:
            case 2:
              e || pn.current !== null || (e = !0);
            default:
              Ae = 0, Ut = null, To(t, o, a);
          }
        }
        T_();
        break;
      } catch (s) {
        Zm(t, s);
      }
    while (!0);
  if (e && t.shellSuspendCounter++, Rc(), he = n, ne.H = r, ne.A = i, re !== null)
    throw Error(A(261));
  return me = null, ae = 0, Cc(), Oe;
}
function T_() {
  for (; re !== null; )
    nv(re);
}
function S_(t, e) {
  var n = he;
  he |= 2;
  var r = ev(), i = tv();
  (me !== t || ae !== e) && (aa = null, Bs = hn() + 500, Fr(t, e));
  e:
    do
      try {
        if (Ae !== 0 && re !== null) {
          e = re;
          var o = Ut;
          t:
            switch (Ae) {
              case 1:
                Ae = 0, Ut = null, To(t, e, o);
                break;
              case 2:
                if (Fh(o)) {
                  Ae = 0, Ut = null, df(e);
                  break;
                }
                e = function() {
                  Ae === 2 && me === t && (Ae = 7), Tt(t);
                }, o.then(e, e);
                break e;
              case 3:
                Ae = 7;
                break e;
              case 4:
                Ae = 5;
                break e;
              case 7:
                Fh(o) ? (Ae = 0, Ut = null, df(e)) : (Ae = 0, Ut = null, To(t, e, o));
                break;
              case 5:
                switch (re.tag) {
                  case 5:
                  case 26:
                  case 27:
                    e = re, Ae = 0, Ut = null;
                    var a = e.sibling;
                    if (a !== null)
                      re = a;
                    else {
                      var s = e.return;
                      s !== null ? (re = s, Nc(s)) : re = null;
                    }
                    break t;
                }
                Ae = 0, Ut = null, To(t, e, o);
                break;
              case 6:
                Ae = 0, Ut = null, To(t, e, o);
                break;
              case 8:
                Ld(), Oe = 6;
                break e;
              default:
                throw Error(A(462));
            }
        }
        w_();
        break;
      } catch (c) {
        Zm(t, c);
      }
    while (!0);
  return Rc(), ne.H = r, ne.A = i, he = n, re !== null ? 0 : (me = null, ae = 0, Cc(), Oe);
}
function w_() {
  for (; re !== null && !xy(); )
    nv(re);
}
function nv(t) {
  var e = Am(t.alternate, t, zn);
  t.memoizedProps = t.pendingProps, e === null ? Nc(t) : re = e;
}
function df(t) {
  var e = t.alternate;
  switch (t.tag) {
    case 15:
    case 0:
      e = ef(
        e,
        t,
        t.pendingProps,
        t.type,
        void 0,
        ae
      );
      break;
    case 11:
      e = ef(
        e,
        t,
        t.pendingProps,
        t.type.render,
        t.ref,
        ae
      );
      break;
    case 5:
      _d(t);
    default:
      Vm(e, t), t = re = Ym(t, zn), e = Am(e, t, zn);
  }
  t.memoizedProps = t.pendingProps, e === null ? Nc(t) : re = e;
}
function To(t, e, n) {
  Rc(), _d(e), Ti = null, ia = 0;
  var r = e.return;
  try {
    if (d_(
      t,
      r,
      e,
      n,
      ae
    )) {
      Oe = 1, Ls(
        t,
        xt(n, t.current)
      ), re = null;
      return;
    }
  } catch (i) {
    if (r !== null)
      throw re = r, i;
    Oe = 1, Ls(
      t,
      xt(n, t.current)
    ), re = null;
    return;
  }
  if (e.flags & 32768)
    e: {
      t = e;
      do {
        if (e = v_(t.alternate, t), e !== null) {
          e.flags &= 32767, re = e;
          break e;
        }
        t = t.return, t !== null && (t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null), re = t;
      } while (t !== null);
      Oe = 6, re = null;
    }
  else
    Nc(e);
}
function Nc(t) {
  var e = t;
  do {
    t = e.return;
    var n = m_(
      e.alternate,
      e,
      zn
    );
    if (n !== null) {
      re = n;
      return;
    }
    if (e = e.sibling, e !== null) {
      re = e;
      return;
    }
    re = e = t;
  } while (e !== null);
  Oe === 0 && (Oe = 5);
}
function _u(t, e, n, r, i) {
  var o = ne.T, a = Ce.p;
  try {
    Ce.p = 2, ne.T = null, A_(
      t,
      e,
      n,
      r,
      a,
      i
    );
  } finally {
    ne.T = o, Ce.p = a;
  }
  return null;
}
function A_(t, e, n, r, i, o) {
  do
    Ii();
  while (_r !== null);
  if (he & 6)
    throw Error(A(327));
  var a = t.finishedWork, s = t.finishedLanes;
  if (a === null)
    return null;
  if (t.finishedWork = null, t.finishedLanes = 0, a === t.current)
    throw Error(A(177));
  t.callbackNode = null, t.callbackPriority = 0, t.cancelPendingCommit = null;
  var c = a.lanes | a.childLanes;
  if (c |= sd, $y(t, c, o), qs = !1, t === me && (re = me = null, ae = 0), !(a.subtreeFlags & 10256) && !(a.flags & 10256) || Ba || (Ba = !0, gu = c, mu = n, N_(Ts, function() {
    return Ii(), null;
  })), n = (a.flags & 15990) !== 0, a.subtreeFlags & 15990 || n) {
    n = ne.T, ne.T = null, o = Ce.p, Ce.p = 2;
    var l = he;
    he |= 4, f_(t, a), xm(a, t), BE(Tu), Ys = !!Cu, Tu = Cu = null, t.current = a, Um(t, a.alternate, a), qy(), he = l, Ce.p = o, ne.T = n;
  } else
    t.current = a;
  if (Ba ? (Ba = !1, _r = t, qo = s) : rv(t, c), c = t.pendingLanes, c === 0 && (sr = null), Fy(a.stateNode), Tt(t), e !== null)
    for (i = t.onRecoverableError, a = 0; a < e.length; a++)
      c = e[a], i(c.value, {
        componentStack: c.stack
      });
  return qo & 3 && Ii(), c = t.pendingLanes, r || qs || s & 4194218 && c & 42 ? t === vu ? Bo++ : (Bo = 0, vu = t) : Bo = 0, Ea(), null;
}
function rv(t, e) {
  (t.pooledCacheLanes &= e) === 0 && (e = t.pooledCache, e != null && (t.pooledCache = null, ya(e)));
}
function Ii() {
  if (_r !== null) {
    var t = _r, e = gu;
    gu = 0;
    var n = Wp(qo), r = ne.T, i = Ce.p;
    try {
      if (Ce.p = 32 > n ? 32 : n, ne.T = null, _r === null)
        var o = !1;
      else {
        n = mu, mu = null;
        var a = _r, s = qo;
        if (_r = null, qo = 0, he & 6)
          throw Error(A(331));
        var c = he;
        if (he |= 4, Fm(a.current), zm(a, a.current, s, n), he = c, Ea(!1), It && typeof It.onPostCommitFiberRoot == "function")
          try {
            It.onPostCommitFiberRoot(ga, a);
          } catch {
          }
        o = !0;
      }
      return o;
    } finally {
      Ce.p = i, ne.T = r, rv(t, e);
    }
  }
  return !1;
}
function hf(t, e, n) {
  e = xt(n, e), e = iu(t.stateNode, e, 2), t = or(t, e, 2), t !== null && (Ca(t, 2), Tt(t));
}
function ve(t, e, n) {
  if (t.tag === 3)
    hf(t, t, n);
  else
    for (; e !== null; ) {
      if (e.tag === 3) {
        hf(
          e,
          t,
          n
        );
        break;
      } else if (e.tag === 1) {
        var r = e.stateNode;
        if (typeof e.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (sr === null || !sr.has(r))) {
          t = xt(n, t), n = ym(2), r = or(e, n, 2), r !== null && (Em(
            n,
            r,
            e,
            t
          ), Ca(r, 2), Tt(r));
          break;
        }
      }
      e = e.return;
    }
}
function Cl(t, e, n) {
  var r = t.pingCache;
  if (r === null) {
    r = t.pingCache = new E_();
    var i = /* @__PURE__ */ new Set();
    r.set(e, i);
  } else
    i = r.get(e), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(e, i));
  i.has(n) || (Dd = !0, i.add(n), t = b_.bind(null, t, e, n), e.then(t, t));
}
function b_(t, e, n) {
  var r = t.pingCache;
  r !== null && r.delete(e), t.pingedLanes |= t.suspendedLanes & n, he & 2 ? Bi = !0 : he & 4 && (qs = !0), xd(), me === t && (ae & n) === n && (Oe === 4 || Oe === 3 && (ae & 62914560) === ae && 300 > hn() - Hd ? !(he & 2) && Fr(t, 0) : Pd |= n), Tt(t);
}
function iv(t, e) {
  e === 0 && (e = Xp()), t = hr(t, e), t !== null && (Ca(t, e), Tt(t));
}
function R_(t) {
  var e = t.memoizedState, n = 0;
  e !== null && (n = e.retryLane), iv(t, n);
}
function I_(t, e) {
  var n = 0;
  switch (t.tag) {
    case 13:
      var r = t.stateNode, i = t.memoizedState;
      i !== null && (n = i.retryLane);
      break;
    case 19:
      r = t.stateNode;
      break;
    case 22:
      r = t.stateNode._retryCache;
      break;
    default:
      throw Error(A(314));
  }
  r !== null && r.delete(e), iv(t, n);
}
function xd() {
  if (50 < Bo)
    throw Bo = 0, vu = null, he & 2 && me !== null && (me.errorRecoveryDisabledLanes |= ae), Error(A(185));
}
function N_(t, e) {
  return Ju(t, e);
}
var Cu = null, Tu = null;
function Gs(t) {
  return t.nodeType === 9 ? t : t.ownerDocument;
}
function ff(t) {
  switch (t) {
    case "http://www.w3.org/2000/svg":
      return 1;
    case "http://www.w3.org/1998/Math/MathML":
      return 2;
    default:
      return 0;
  }
}
function ov(t, e) {
  if (t === 0)
    switch (e) {
      case "svg":
        return 1;
      case "math":
        return 2;
      default:
        return 0;
    }
  return t === 1 && e === "foreignObject" ? 0 : t;
}
function Su(t, e) {
  return t === "textarea" || t === "noscript" || typeof e.children == "string" || typeof e.children == "number" || typeof e.children == "bigint" || typeof e.dangerouslySetInnerHTML == "object" && e.dangerouslySetInnerHTML !== null && e.dangerouslySetInnerHTML.__html != null;
}
var Tl = null;
function O_() {
  var t = window.event;
  return t && t.type === "popstate" ? t === Tl ? !1 : (Tl = t, !0) : (Tl = null, !1);
}
var av = typeof setTimeout == "function" ? setTimeout : void 0, M_ = typeof clearTimeout == "function" ? clearTimeout : void 0, pf = typeof Promise == "function" ? Promise : void 0, k_ = typeof queueMicrotask == "function" ? queueMicrotask : typeof pf < "u" ? function(t) {
  return pf.resolve(null).then(t).catch(U_);
} : av;
function U_(t) {
  setTimeout(function() {
    throw t;
  });
}
function Sl(t, e) {
  var n = e, r = 0;
  do {
    var i = n.nextSibling;
    if (t.removeChild(n), i && i.nodeType === 8)
      if (n = i.data, n === "/$") {
        if (r === 0) {
          t.removeChild(i), ua(e);
          return;
        }
        r--;
      } else
        n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = i;
  } while (n);
  ua(e);
}
function wu(t) {
  var e = t.firstChild;
  for (e && e.nodeType === 10 && (e = e.nextSibling); e; ) {
    var n = e;
    switch (e = e.nextSibling, n.nodeName) {
      case "HTML":
      case "HEAD":
      case "BODY":
        wu(n), Wu(n);
        continue;
      case "SCRIPT":
      case "STYLE":
        continue;
      case "LINK":
        if (n.rel.toLowerCase() === "stylesheet")
          continue;
    }
    t.removeChild(n);
  }
}
function D_(t, e, n, r) {
  for (; t.nodeType === 1; ) {
    var i = n;
    if (t.nodeName.toLowerCase() !== e.toLowerCase()) {
      if (!r && (t.nodeName !== "INPUT" || t.type !== "hidden"))
        break;
    } else if (r) {
      if (!t[Jo])
        switch (e) {
          case "meta":
            if (!t.hasAttribute("itemprop"))
              break;
            return t;
          case "link":
            if (o = t.getAttribute("rel"), o === "stylesheet" && t.hasAttribute("data-precedence"))
              break;
            if (o !== i.rel || t.getAttribute("href") !== (i.href == null ? null : i.href) || t.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || t.getAttribute("title") !== (i.title == null ? null : i.title))
              break;
            return t;
          case "style":
            if (t.hasAttribute("data-precedence"))
              break;
            return t;
          case "script":
            if (o = t.getAttribute("src"), (o !== (i.src == null ? null : i.src) || t.getAttribute("type") !== (i.type == null ? null : i.type) || t.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && o && t.hasAttribute("async") && !t.hasAttribute("itemprop"))
              break;
            return t;
          default:
            return t;
        }
    } else if (e === "input" && t.type === "hidden") {
      var o = i.name == null ? null : "" + i.name;
      if (i.type === "hidden" && t.getAttribute("name") === o)
        return t;
    } else
      return t;
    if (t = Wt(t.nextSibling), t === null)
      break;
  }
  return null;
}
function P_(t, e, n) {
  if (e === "")
    return null;
  for (; t.nodeType !== 3; )
    if ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !n || (t = Wt(t.nextSibling), t === null))
      return null;
  return t;
}
function Wt(t) {
  for (; t != null; t = t.nextSibling) {
    var e = t.nodeType;
    if (e === 1 || e === 3)
      break;
    if (e === 8) {
      if (e = t.data, e === "$" || e === "$!" || e === "$?" || e === "F!" || e === "F")
        break;
      if (e === "/$")
        return null;
    }
  }
  return t;
}
function gf(t) {
  t = t.previousSibling;
  for (var e = 0; t; ) {
    if (t.nodeType === 8) {
      var n = t.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (e === 0)
          return t;
        e--;
      } else
        n === "/$" && e++;
    }
    t = t.previousSibling;
  }
  return null;
}
function sv(t, e, n) {
  switch (e = Gs(n), t) {
    case "html":
      if (t = e.documentElement, !t)
        throw Error(A(452));
      return t;
    case "head":
      if (t = e.head, !t)
        throw Error(A(453));
      return t;
    case "body":
      if (t = e.body, !t)
        throw Error(A(454));
      return t;
    default:
      throw Error(A(451));
  }
}
var Gt = /* @__PURE__ */ new Map(), mf = /* @__PURE__ */ new Set();
function Ks(t) {
  return typeof t.getRootNode == "function" ? t.getRootNode() : t.ownerDocument;
}
var Kn = Ce.d;
Ce.d = {
  f: H_,
  r: L_,
  D: x_,
  C: q_,
  L: B_,
  m: z_,
  X: K_,
  S: G_,
  M: F_
};
function H_() {
  var t = Kn.f(), e = Ic();
  return t || e;
}
function L_(t) {
  var e = Qi(t);
  e !== null && e.tag === 5 && e.type === "form" ? um(e) : Kn.r(t);
}
var Wi = typeof document > "u" ? null : document;
function cv(t, e, n) {
  var r = Wi;
  if (r && typeof e == "string" && e) {
    var i = Lt(e);
    i = 'link[rel="' + t + '"][href="' + i + '"]', typeof n == "string" && (i += '[crossorigin="' + n + '"]'), mf.has(i) || (mf.add(i), t = { rel: t, crossOrigin: n, href: e }, r.querySelector(i) === null && (e = r.createElement("link"), Ze(e, "link", t), Fe(e), r.head.appendChild(e)));
  }
}
function x_(t) {
  Kn.D(t), cv("dns-prefetch", t, null);
}
function q_(t, e) {
  Kn.C(t, e), cv("preconnect", t, e);
}
function B_(t, e, n) {
  Kn.L(t, e, n);
  var r = Wi;
  if (r && t && e) {
    var i = 'link[rel="preload"][as="' + Lt(e) + '"]';
    e === "image" && n && n.imageSrcSet ? (i += '[imagesrcset="' + Lt(
      n.imageSrcSet
    ) + '"]', typeof n.imageSizes == "string" && (i += '[imagesizes="' + Lt(
      n.imageSizes
    ) + '"]')) : i += '[href="' + Lt(t) + '"]';
    var o = i;
    switch (e) {
      case "style":
        o = zi(t);
        break;
      case "script":
        o = eo(t);
    }
    Gt.has(o) || (t = Se(
      {
        rel: "preload",
        href: e === "image" && n && n.imageSrcSet ? void 0 : t,
        as: e
      },
      n
    ), Gt.set(o, t), r.querySelector(i) !== null || e === "style" && r.querySelector(Ta(o)) || e === "script" && r.querySelector(Sa(o)) || (e = r.createElement("link"), Ze(e, "link", t), Fe(e), r.head.appendChild(e)));
  }
}
function z_(t, e) {
  Kn.m(t, e);
  var n = Wi;
  if (n && t) {
    var r = e && typeof e.as == "string" ? e.as : "script", i = 'link[rel="modulepreload"][as="' + Lt(r) + '"][href="' + Lt(t) + '"]', o = i;
    switch (r) {
      case "audioworklet":
      case "paintworklet":
      case "serviceworker":
      case "sharedworker":
      case "worker":
      case "script":
        o = eo(t);
    }
    if (!Gt.has(o) && (t = Se({ rel: "modulepreload", href: t }, e), Gt.set(o, t), n.querySelector(i) === null)) {
      switch (r) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          if (n.querySelector(Sa(o)))
            return;
      }
      r = n.createElement("link"), Ze(r, "link", t), Fe(r), n.head.appendChild(r);
    }
  }
}
function G_(t, e, n) {
  Kn.S(t, e, n);
  var r = Wi;
  if (r && t) {
    var i = Ei(r).hoistableStyles, o = zi(t);
    e = e || "default";
    var a = i.get(o);
    if (!a) {
      var s = { loading: 0, preload: null };
      if (a = r.querySelector(
        Ta(o)
      ))
        s.loading = 5;
      else {
        t = Se(
          { rel: "stylesheet", href: t, "data-precedence": e },
          n
        ), (n = Gt.get(o)) && qd(t, n);
        var c = a = r.createElement("link");
        Fe(c), Ze(c, "link", t), c._p = new Promise(function(l, u) {
          c.onload = l, c.onerror = u;
        }), c.addEventListener("load", function() {
          s.loading |= 1;
        }), c.addEventListener("error", function() {
          s.loading |= 2;
        }), s.loading |= 4, cs(a, e, r);
      }
      a = {
        type: "stylesheet",
        instance: a,
        count: 1,
        state: s
      }, i.set(o, a);
    }
  }
}
function K_(t, e) {
  Kn.X(t, e);
  var n = Wi;
  if (n && t) {
    var r = Ei(n).hoistableScripts, i = eo(t), o = r.get(i);
    o || (o = n.querySelector(Sa(i)), o || (t = Se({ src: t, async: !0 }, e), (e = Gt.get(i)) && Bd(t, e), o = n.createElement("script"), Fe(o), Ze(o, "link", t), n.head.appendChild(o)), o = {
      type: "script",
      instance: o,
      count: 1,
      state: null
    }, r.set(i, o));
  }
}
function F_(t, e) {
  Kn.M(t, e);
  var n = Wi;
  if (n && t) {
    var r = Ei(n).hoistableScripts, i = eo(t), o = r.get(i);
    o || (o = n.querySelector(Sa(i)), o || (t = Se({ src: t, async: !0, type: "module" }, e), (e = Gt.get(i)) && Bd(t, e), o = n.createElement("script"), Fe(o), Ze(o, "link", t), n.head.appendChild(o)), o = {
      type: "script",
      instance: o,
      count: 1,
      state: null
    }, r.set(i, o));
  }
}
function j_(t, e, n) {
  if (e = (e = ir.current) ? Ks(e) : null, !e)
    throw Error(A(446));
  switch (t) {
    case "meta":
    case "title":
      return null;
    case "style":
      return typeof n.precedence == "string" && typeof n.href == "string" ? (n = zi(n.href), e = Ei(e).hoistableStyles, t = e.get(n), t || (t = { type: "style", instance: null, count: 0, state: null }, e.set(n, t)), t) : { type: "void", instance: null, count: 0, state: null };
    case "link":
      if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
        t = zi(n.href);
        var r = Ei(e).hoistableStyles, i = r.get(t);
        return i || (e = e.ownerDocument || e, i = {
          type: "stylesheet",
          instance: null,
          count: 0,
          state: { loading: 0, preload: null }
        }, r.set(t, i), Gt.has(t) || Y_(
          e,
          t,
          {
            rel: "preload",
            as: "style",
            href: n.href,
            crossOrigin: n.crossOrigin,
            integrity: n.integrity,
            media: n.media,
            hrefLang: n.hrefLang,
            referrerPolicy: n.referrerPolicy
          },
          i.state
        )), i;
      }
      return null;
    case "script":
      return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (n = eo(n), e = Ei(e).hoistableScripts, t = e.get(n), t || (t = {
        type: "script",
        instance: null,
        count: 0,
        state: null
      }, e.set(n, t)), t) : { type: "void", instance: null, count: 0, state: null };
    default:
      throw Error(A(444, t));
  }
}
function zi(t) {
  return 'href="' + Lt(t) + '"';
}
function Ta(t) {
  return 'link[rel="stylesheet"][' + t + "]";
}
function lv(t) {
  return Se({}, t, {
    "data-precedence": t.precedence,
    precedence: null
  });
}
function Y_(t, e, n, r) {
  Gt.set(e, n), t.querySelector(Ta(e)) || (t.querySelector('link[rel="preload"][as="style"][' + e + "]") ? r.loading = 1 : (e = t.createElement("link"), r.preload = e, e.addEventListener("load", function() {
    return r.loading |= 1;
  }), e.addEventListener("error", function() {
    return r.loading |= 2;
  }), Ze(e, "link", n), Fe(e), t.head.appendChild(e)));
}
function eo(t) {
  return '[src="' + Lt(t) + '"]';
}
function Sa(t) {
  return "script[async]" + t;
}
function vf(t, e, n) {
  if (e.count++, e.instance === null)
    switch (e.type) {
      case "style":
        var r = t.querySelector(
          'style[data-href~="' + Lt(n.href) + '"]'
        );
        if (r)
          return e.instance = r, Fe(r), r;
        var i = Se({}, n, {
          "data-href": n.href,
          "data-precedence": n.precedence,
          href: null,
          precedence: null
        });
        return r = (t.ownerDocument || t).createElement(
          "style"
        ), Fe(r), Ze(r, "style", i), cs(r, n.precedence, t), e.instance = r;
      case "stylesheet":
        i = zi(n.href);
        var o = t.querySelector(
          Ta(i)
        );
        if (o)
          return e.state.loading |= 4, e.instance = o, Fe(o), o;
        r = lv(n), (i = Gt.get(i)) && qd(r, i), o = (t.ownerDocument || t).createElement("link"), Fe(o);
        var a = o;
        return a._p = new Promise(function(s, c) {
          a.onload = s, a.onerror = c;
        }), Ze(o, "link", r), e.state.loading |= 4, cs(o, n.precedence, t), e.instance = o;
      case "script":
        return o = eo(n.src), (i = t.querySelector(
          Sa(o)
        )) ? (e.instance = i, Fe(i), i) : (r = n, (i = Gt.get(o)) && (r = Se({}, n), Bd(r, i)), t = t.ownerDocument || t, i = t.createElement("script"), Fe(i), Ze(i, "link", r), t.head.appendChild(i), e.instance = i);
      case "void":
        return null;
      default:
        throw Error(A(443, e.type));
    }
  else
    e.type === "stylesheet" && !(e.state.loading & 4) && (r = e.instance, e.state.loading |= 4, cs(r, n.precedence, t));
  return e.instance;
}
function cs(t, e, n) {
  for (var r = n.querySelectorAll(
    'link[rel="stylesheet"][data-precedence],style[data-precedence]'
  ), i = r.length ? r[r.length - 1] : null, o = i, a = 0; a < r.length; a++) {
    var s = r[a];
    if (s.dataset.precedence === e)
      o = s;
    else if (o !== i)
      break;
  }
  o ? o.parentNode.insertBefore(t, o.nextSibling) : (e = n.nodeType === 9 ? n.head : n, e.insertBefore(t, e.firstChild));
}
function qd(t, e) {
  t.crossOrigin == null && (t.crossOrigin = e.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy), t.title == null && (t.title = e.title);
}
function Bd(t, e) {
  t.crossOrigin == null && (t.crossOrigin = e.crossOrigin), t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy), t.integrity == null && (t.integrity = e.integrity);
}
var ls = null;
function yf(t, e, n) {
  if (ls === null) {
    var r = /* @__PURE__ */ new Map(), i = ls = /* @__PURE__ */ new Map();
    i.set(n, r);
  } else
    i = ls, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
  if (r.has(t))
    return r;
  for (r.set(t, null), n = n.getElementsByTagName(t), i = 0; i < n.length; i++) {
    var o = n[i];
    if (!(o[Jo] || o[ot] || t === "link" && o.getAttribute("rel") === "stylesheet") && o.namespaceURI !== "http://www.w3.org/2000/svg") {
      var a = o.getAttribute(e) || "";
      a = t + a;
      var s = r.get(a);
      s ? s.push(o) : r.set(a, [o]);
    }
  }
  return r;
}
function Ef(t, e, n) {
  t = t.ownerDocument || t, t.head.insertBefore(
    n,
    e === "title" ? t.querySelector("head > title") : null
  );
}
function Q_(t, e, n) {
  if (n === 1 || e.itemProp != null)
    return !1;
  switch (t) {
    case "meta":
    case "title":
      return !0;
    case "style":
      if (typeof e.precedence != "string" || typeof e.href != "string" || e.href === "")
        break;
      return !0;
    case "link":
      if (typeof e.rel != "string" || typeof e.href != "string" || e.href === "" || e.onLoad || e.onError)
        break;
      switch (e.rel) {
        case "stylesheet":
          return t = e.disabled, typeof e.precedence == "string" && t == null;
        default:
          return !0;
      }
    case "script":
      if (e.async && typeof e.async != "function" && typeof e.async != "symbol" && !e.onLoad && !e.onError && e.src && typeof e.src == "string")
        return !0;
  }
  return !1;
}
var sa = null;
function V_() {
}
function $_(t, e, n) {
  if (sa === null)
    throw Error(A(475));
  var r = sa;
  if (e.type === "stylesheet" && (typeof n.media != "string" || matchMedia(n.media).matches !== !1) && !(e.state.loading & 4)) {
    if (e.instance === null) {
      var i = zi(n.href), o = t.querySelector(
        Ta(i)
      );
      if (o) {
        t = o._p, t !== null && typeof t == "object" && typeof t.then == "function" && (r.count++, r = Fs.bind(r), t.then(r, r)), e.state.loading |= 4, e.instance = o, Fe(o);
        return;
      }
      o = t.ownerDocument || t, n = lv(n), (i = Gt.get(i)) && qd(n, i), o = o.createElement("link"), Fe(o);
      var a = o;
      a._p = new Promise(function(s, c) {
        a.onload = s, a.onerror = c;
      }), Ze(o, "link", n), e.instance = o;
    }
    r.stylesheets === null && (r.stylesheets = /* @__PURE__ */ new Map()), r.stylesheets.set(e, t), (t = e.state.preload) && !(e.state.loading & 3) && (r.count++, e = Fs.bind(r), t.addEventListener("load", e), t.addEventListener("error", e));
  }
}
function X_() {
  if (sa === null)
    throw Error(A(475));
  var t = sa;
  return t.stylesheets && t.count === 0 && Au(t, t.stylesheets), 0 < t.count ? function(e) {
    var n = setTimeout(function() {
      if (t.stylesheets && Au(t, t.stylesheets), t.unsuspend) {
        var r = t.unsuspend;
        t.unsuspend = null, r();
      }
    }, 6e4);
    return t.unsuspend = e, function() {
      t.unsuspend = null, clearTimeout(n);
    };
  } : null;
}
function Fs() {
  if (this.count--, this.count === 0) {
    if (this.stylesheets)
      Au(this, this.stylesheets);
    else if (this.unsuspend) {
      var t = this.unsuspend;
      this.unsuspend = null, t();
    }
  }
}
var js = null;
function Au(t, e) {
  t.stylesheets = null, t.unsuspend !== null && (t.count++, js = /* @__PURE__ */ new Map(), e.forEach(J_, t), js = null, Fs.call(t));
}
function J_(t, e) {
  if (!(e.state.loading & 4)) {
    var n = js.get(t);
    if (n)
      var r = n.get(null);
    else {
      n = /* @__PURE__ */ new Map(), js.set(t, n);
      for (var i = t.querySelectorAll(
        "link[data-precedence],style[data-precedence]"
      ), o = 0; o < i.length; o++) {
        var a = i[o];
        (a.nodeName === "link" || a.getAttribute("media") !== "not all") && (n.set(a.dataset.precedence, a), r = a);
      }
      r && n.set(null, r);
    }
    i = e.instance, a = i.getAttribute("data-precedence"), o = n.get(a) || r, o === r && n.set(null, i), n.set(a, i), this.count++, r = Fs.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), o ? o.parentNode.insertBefore(i, o.nextSibling) : (t = t.nodeType === 9 ? t.head : t, t.insertBefore(i, t.firstChild)), e.state.loading |= 4;
  }
}
function Z_(t, e, n, r, i, o, a, s) {
  this.tag = 1, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Kc(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.finishedLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Kc(0), this.hiddenUpdates = Kc(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = o, this.onRecoverableError = a, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = s, this.incompleteTransitions = /* @__PURE__ */ new Map();
}
function uv(t, e, n, r, i, o, a, s, c, l, u, d, h) {
  return t = new Z_(
    t,
    e,
    n,
    s,
    c,
    l,
    u,
    h
  ), e = 1, o === !0 && (e |= 24), o = Xt(3, null, null, e), t.current = o, o.stateNode = t, e = hd(), e.refCount++, t.pooledCache = e, e.refCount++, o.memoizedState = {
    element: r,
    isDehydrated: n,
    cache: e
  }, Nd(o), t;
}
function dv(t) {
  return t ? (t = li, t) : li;
}
function hv(t, e, n, r, i, o) {
  i = dv(i), r.context === null ? r.context = i : r.pendingContext = i, r = Dn(e), r.payload = { element: n }, o = o === void 0 ? null : o, o !== null && (r.callback = o), n = or(t, r, e), n !== null && (ft(n, t, e), Do(n, t, e));
}
function _f(t, e) {
  if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
    var n = t.retryLane;
    t.retryLane = n !== 0 && n < e ? n : e;
  }
}
function zd(t, e) {
  _f(t, e), (t = t.alternate) && _f(t, e);
}
function fv(t) {
  if (t.tag === 13) {
    var e = hr(t, 67108864);
    e !== null && ft(e, t, 67108864), zd(t, 67108864);
  }
}
function W_() {
  return null;
}
var Ys = !0;
function eC(t, e, n, r) {
  var i = ne.T;
  ne.T = null;
  var o = Ce.p;
  try {
    Ce.p = 2, Gd(t, e, n, r);
  } finally {
    Ce.p = o, ne.T = i;
  }
}
function tC(t, e, n, r) {
  var i = ne.T;
  ne.T = null;
  var o = Ce.p;
  try {
    Ce.p = 8, Gd(t, e, n, r);
  } finally {
    Ce.p = o, ne.T = i;
  }
}
function Gd(t, e, n, r) {
  if (Ys) {
    var i = bu(r);
    if (i === null)
      ol(
        t,
        e,
        r,
        Qs,
        n
      ), Cf(t, r);
    else if (rC(
      i,
      t,
      e,
      n,
      r
    ))
      r.stopPropagation();
    else if (Cf(t, r), e & 4 && -1 < nC.indexOf(t)) {
      for (; i !== null; ) {
        var o = Qi(i);
        if (o !== null)
          switch (o.tag) {
            case 3:
              if (o = o.stateNode, o.current.memoizedState.isDehydrated) {
                var a = yo(o.pendingLanes);
                if (a !== 0) {
                  var s = o;
                  for (s.pendingLanes |= 2, s.entangledLanes |= 2; a; ) {
                    var c = 1 << 31 - qt(a);
                    s.entanglements[1] |= c, a &= ~c;
                  }
                  Tt(o), !(he & 6) && (Bs = hn() + 500, Ea());
                }
              }
              break;
            case 13:
              s = hr(o, 2), s !== null && ft(s, o, 2), Ic(), zd(o, 2);
          }
        if (o = bu(r), o === null && ol(
          t,
          e,
          r,
          Qs,
          n
        ), o === i)
          break;
        i = o;
      }
      i !== null && r.stopPropagation();
    } else
      ol(
        t,
        e,
        r,
        null,
        n
      );
  }
}
function bu(t) {
  return t = td(t), Kd(t);
}
var Qs = null;
function Kd(t) {
  if (Qs = null, t = Sr(t), t !== null) {
    var e = ji(t);
    if (e === null)
      t = null;
    else {
      var n = e.tag;
      if (n === 13) {
        if (t = Kp(e), t !== null)
          return t;
        t = null;
      } else if (n === 3) {
        if (e.stateNode.current.memoizedState.isDehydrated)
          return e.tag === 3 ? e.stateNode.containerInfo : null;
        t = null;
      } else
        e !== t && (t = null);
    }
  }
  return Qs = t, null;
}
function pv(t) {
  switch (t) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 2;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 8;
    case "message":
      switch (By()) {
        case Zu:
          return 2;
        case Yp:
          return 8;
        case Ts:
        case zy:
          return 32;
        case Qp:
          return 268435456;
        default:
          return 32;
      }
    default:
      return 32;
  }
}
var Ru = !1, cr = null, lr = null, ur = null, ca = /* @__PURE__ */ new Map(), la = /* @__PURE__ */ new Map(), Wn = [], nC = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
  " "
);
function Cf(t, e) {
  switch (t) {
    case "focusin":
    case "focusout":
      cr = null;
      break;
    case "dragenter":
    case "dragleave":
      lr = null;
      break;
    case "mouseover":
    case "mouseout":
      ur = null;
      break;
    case "pointerover":
    case "pointerout":
      ca.delete(e.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      la.delete(e.pointerId);
  }
}
function uo(t, e, n, r, i, o) {
  return t === null || t.nativeEvent !== o ? (t = {
    blockedOn: e,
    domEventName: n,
    eventSystemFlags: r,
    nativeEvent: o,
    targetContainers: [i]
  }, e !== null && (e = Qi(e), e !== null && fv(e)), t) : (t.eventSystemFlags |= r, e = t.targetContainers, i !== null && e.indexOf(i) === -1 && e.push(i), t);
}
function rC(t, e, n, r, i) {
  switch (e) {
    case "focusin":
      return cr = uo(
        cr,
        t,
        e,
        n,
        r,
        i
      ), !0;
    case "dragenter":
      return lr = uo(
        lr,
        t,
        e,
        n,
        r,
        i
      ), !0;
    case "mouseover":
      return ur = uo(
        ur,
        t,
        e,
        n,
        r,
        i
      ), !0;
    case "pointerover":
      var o = i.pointerId;
      return ca.set(
        o,
        uo(
          ca.get(o) || null,
          t,
          e,
          n,
          r,
          i
        )
      ), !0;
    case "gotpointercapture":
      return o = i.pointerId, la.set(
        o,
        uo(
          la.get(o) || null,
          t,
          e,
          n,
          r,
          i
        )
      ), !0;
  }
  return !1;
}
function gv(t) {
  var e = Sr(t.target);
  if (e !== null) {
    var n = ji(e);
    if (n !== null) {
      if (e = n.tag, e === 13) {
        if (e = Kp(n), e !== null) {
          t.blockedOn = e, Xy(t.priority, function() {
            if (n.tag === 13) {
              var r = Pn(), i = hr(n, r);
              i !== null && ft(i, n, r), zd(n, r);
            }
          });
          return;
        }
      } else if (e === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        t.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  t.blockedOn = null;
}
function us(t) {
  if (t.blockedOn !== null)
    return !1;
  for (var e = t.targetContainers; 0 < e.length; ) {
    var n = bu(t.nativeEvent);
    if (n === null) {
      n = t.nativeEvent;
      var r = new n.constructor(
        n.type,
        n
      );
      Ql = r, n.target.dispatchEvent(r), Ql = null;
    } else
      return e = Qi(n), e !== null && fv(e), t.blockedOn = n, !1;
    e.shift();
  }
  return !0;
}
function Tf(t, e, n) {
  us(t) && n.delete(e);
}
function iC() {
  Ru = !1, cr !== null && us(cr) && (cr = null), lr !== null && us(lr) && (lr = null), ur !== null && us(ur) && (ur = null), ca.forEach(Tf), la.forEach(Tf);
}
function za(t, e) {
  t.blockedOn === e && (t.blockedOn = null, Ru || (Ru = !0, ze.unstable_scheduleCallback(
    ze.unstable_NormalPriority,
    iC
  )));
}
var Ga = null;
function Sf(t) {
  Ga !== t && (Ga = t, ze.unstable_scheduleCallback(
    ze.unstable_NormalPriority,
    function() {
      Ga === t && (Ga = null);
      for (var e = 0; e < t.length; e += 3) {
        var n = t[e], r = t[e + 1], i = t[e + 2];
        if (typeof r != "function") {
          if (Kd(r || n) === null)
            continue;
          break;
        }
        var o = Qi(n);
        o !== null && (t.splice(e, 3), e -= 3, cm(
          o,
          {
            pending: !0,
            data: i,
            method: n.method,
            action: r
          },
          r,
          i
        ));
      }
    }
  ));
}
function ua(t) {
  function e(c) {
    return za(c, t);
  }
  cr !== null && za(cr, t), lr !== null && za(lr, t), ur !== null && za(ur, t), ca.forEach(e), la.forEach(e);
  for (var n = 0; n < Wn.length; n++) {
    var r = Wn[n];
    r.blockedOn === t && (r.blockedOn = null);
  }
  for (; 0 < Wn.length && (n = Wn[0], n.blockedOn === null); )
    gv(n), n.blockedOn === null && Wn.shift();
  if (n = (t.ownerDocument || t).$$reactFormReplay, n != null)
    for (r = 0; r < n.length; r += 3) {
      var i = n[r], o = n[r + 1], a = i[ht] || null;
      if (typeof o == "function")
        a || Sf(n);
      else if (a) {
        var s = null;
        if (o && o.hasAttribute("formAction")) {
          if (i = o, a = o[ht] || null)
            s = a.formAction;
          else if (Kd(i) !== null)
            continue;
        } else
          s = a.action;
        typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Sf(n);
      }
    }
}
function Fd(t) {
  this._internalRoot = t;
}
Oc.prototype.render = Fd.prototype.render = function(t) {
  var e = this._internalRoot;
  if (e === null)
    throw Error(A(409));
  var n = e.current, r = Pn();
  hv(n, r, t, e, null, null);
};
Oc.prototype.unmount = Fd.prototype.unmount = function() {
  var t = this._internalRoot;
  if (t !== null) {
    this._internalRoot = null;
    var e = t.containerInfo;
    t.tag === 0 && Ii(), hv(t.current, 2, null, t, null, null), Ic(), e[Yi] = null;
  }
};
function Oc(t) {
  this._internalRoot = t;
}
Oc.prototype.unstable_scheduleHydration = function(t) {
  if (t) {
    var e = eg();
    t = { blockedOn: null, target: t, priority: e };
    for (var n = 0; n < Wn.length && e !== 0 && e < Wn[n].priority; n++)
      ;
    Wn.splice(n, 0, t), n === 0 && gv(t);
  }
};
Ce.findDOMNode = function(t) {
  var e = t._reactInternals;
  if (e === void 0)
    throw typeof t.render == "function" ? Error(A(188)) : (t = Object.keys(t).join(","), Error(A(268, t)));
  return t = Fp(e), t = t === null ? null : t.stateNode, t;
};
var ho = {
  findFiberByHostInstance: Sr,
  bundleType: 0,
  version: "19.0.0-beta-73bcdfbae5-20240502",
  rendererPackageName: "react-dom"
}, oC = {
  bundleType: ho.bundleType,
  version: ho.version,
  rendererPackageName: ho.rendererPackageName,
  rendererConfig: ho.rendererConfig,
  overrideHookState: null,
  overrideHookStateDeletePath: null,
  overrideHookStateRenamePath: null,
  overrideProps: null,
  overridePropsDeletePath: null,
  overridePropsRenamePath: null,
  setErrorHandler: null,
  setSuspenseHandler: null,
  scheduleUpdate: null,
  currentDispatcherRef: ne,
  findHostInstanceByFiber: function(t) {
    return t = Fp(t), t === null ? null : t.stateNode;
  },
  findFiberByHostInstance: ho.findFiberByHostInstance || W_,
  findHostInstancesForRefresh: null,
  scheduleRefresh: null,
  scheduleRoot: null,
  setRefreshHandler: null,
  getCurrentFiber: null,
  reconcilerVersion: "19.0.0-beta-73bcdfbae5-20240502"
};
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ka = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ka.isDisabled && Ka.supportsFiber)
    try {
      ga = Ka.inject(
        oC
      ), It = Ka;
    } catch {
    }
}
gc.createRoot = function(t, e) {
  if (!qp(t))
    throw Error(A(299));
  var n = !1, r = "", i = gm, o = mm, a = vm, s = null;
  return e != null && (e.unstable_strictMode === !0 && (n = !0), e.identifierPrefix !== void 0 && (r = e.identifierPrefix), e.onUncaughtError !== void 0 && (i = e.onUncaughtError), e.onCaughtError !== void 0 && (o = e.onCaughtError), e.onRecoverableError !== void 0 && (a = e.onRecoverableError), e.unstable_transitionCallbacks !== void 0 && (s = e.unstable_transitionCallbacks)), e = uv(
    t,
    1,
    !1,
    null,
    null,
    n,
    !1,
    r,
    i,
    o,
    a,
    s,
    null
  ), t[Yi] = e.current, ad(
    t.nodeType === 8 ? t.parentNode : t
  ), new Fd(e);
};
gc.hydrateRoot = function(t, e, n) {
  if (!qp(t))
    throw Error(A(299));
  var r = !1, i = "", o = gm, a = mm, s = vm, c = null, l = null;
  return n != null && (n.unstable_strictMode === !0 && (r = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onUncaughtError !== void 0 && (o = n.onUncaughtError), n.onCaughtError !== void 0 && (a = n.onCaughtError), n.onRecoverableError !== void 0 && (s = n.onRecoverableError), n.unstable_transitionCallbacks !== void 0 && (c = n.unstable_transitionCallbacks), n.formState !== void 0 && (l = n.formState)), e = uv(
    t,
    1,
    !0,
    e,
    n ?? null,
    r,
    !1,
    i,
    o,
    a,
    s,
    c,
    l
  ), e.context = dv(null), n = e.current, r = Pn(), i = Dn(r), i.callback = null, or(n, i, r), e.current.lanes = r, Ca(e, r), Tt(e), t[Yi] = e.current, ad(t), new Oc(e);
};
gc.version = "19.0.0-beta-73bcdfbae5-20240502";
function mv() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(mv);
    } catch (t) {
      console.error(t);
    }
}
mv(), Up.exports = gc;
var aC = Up.exports, vv = { exports: {} }, Mc = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var sC = Symbol.for("react.transitional.element"), cC = Symbol.for("react.fragment");
function yv(t, e, n) {
  var r = null;
  if (n !== void 0 && (r = "" + n), e.key !== void 0 && (r = "" + e.key), "key" in e) {
    n = {};
    for (var i in e)
      i !== "key" && (n[i] = e[i]);
  } else
    n = e;
  return e = n.ref, {
    $$typeof: sC,
    type: t,
    key: r,
    ref: e !== void 0 ? e : null,
    props: n
  };
}
Mc.Fragment = cC;
Mc.jsx = yv;
Mc.jsxs = yv;
vv.exports = Mc;
var Vs = vv.exports, Iu = { exports: {} };
const lC = "2.0.0", Ev = 256, uC = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, dC = 16, hC = Ev - 6, fC = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var kc = {
  MAX_LENGTH: Ev,
  MAX_SAFE_COMPONENT_LENGTH: dC,
  MAX_SAFE_BUILD_LENGTH: hC,
  MAX_SAFE_INTEGER: uC,
  RELEASE_TYPES: fC,
  SEMVER_SPEC_VERSION: lC,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const pC = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
};
var Uc = pC;
(function(t, e) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: r,
    MAX_LENGTH: i
  } = kc, o = Uc;
  e = t.exports = {};
  const a = e.re = [], s = e.safeRe = [], c = e.src = [], l = e.t = {};
  let u = 0;
  const d = "[a-zA-Z0-9-]", h = [
    ["\\s", 1],
    ["\\d", i],
    [d, r]
  ], f = (E) => {
    for (const [N, g] of h)
      E = E.split(`${N}*`).join(`${N}{0,${g}}`).split(`${N}+`).join(`${N}{1,${g}}`);
    return E;
  }, m = (E, N, g) => {
    const p = f(N), v = u++;
    o(E, v, N), l[E] = v, c[v] = N, a[v] = new RegExp(N, g ? "g" : void 0), s[v] = new RegExp(p, g ? "g" : void 0);
  };
  m("NUMERICIDENTIFIER", "0|[1-9]\\d*"), m("NUMERICIDENTIFIERLOOSE", "\\d+"), m("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), m("MAINVERSION", `(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`), m("MAINVERSIONLOOSE", `(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`), m("PRERELEASEIDENTIFIER", `(?:${c[l.NUMERICIDENTIFIER]}|${c[l.NONNUMERICIDENTIFIER]})`), m("PRERELEASEIDENTIFIERLOOSE", `(?:${c[l.NUMERICIDENTIFIERLOOSE]}|${c[l.NONNUMERICIDENTIFIER]})`), m("PRERELEASE", `(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`), m("PRERELEASELOOSE", `(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`), m("BUILDIDENTIFIER", `${d}+`), m("BUILD", `(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`), m("FULLPLAIN", `v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`), m("FULL", `^${c[l.FULLPLAIN]}$`), m("LOOSEPLAIN", `[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`), m("LOOSE", `^${c[l.LOOSEPLAIN]}$`), m("GTLT", "((?:<|>)?=?)"), m("XRANGEIDENTIFIERLOOSE", `${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), m("XRANGEIDENTIFIER", `${c[l.NUMERICIDENTIFIER]}|x|X|\\*`), m("XRANGEPLAIN", `[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`), m("XRANGEPLAINLOOSE", `[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`), m("XRANGE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`), m("XRANGELOOSE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`), m("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`), m("COERCE", `${c[l.COERCEPLAIN]}(?:$|[^\\d])`), m("COERCEFULL", c[l.COERCEPLAIN] + `(?:${c[l.PRERELEASE]})?(?:${c[l.BUILD]})?(?:$|[^\\d])`), m("COERCERTL", c[l.COERCE], !0), m("COERCERTLFULL", c[l.COERCEFULL], !0), m("LONETILDE", "(?:~>?)"), m("TILDETRIM", `(\\s*)${c[l.LONETILDE]}\\s+`, !0), e.tildeTrimReplace = "$1~", m("TILDE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`), m("TILDELOOSE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`), m("LONECARET", "(?:\\^)"), m("CARETTRIM", `(\\s*)${c[l.LONECARET]}\\s+`, !0), e.caretTrimReplace = "$1^", m("CARET", `^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`), m("CARETLOOSE", `^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`), m("COMPARATORLOOSE", `^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`), m("COMPARATOR", `^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`), m("COMPARATORTRIM", `(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`, !0), e.comparatorTrimReplace = "$1$2$3", m("HYPHENRANGE", `^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`), m("HYPHENRANGELOOSE", `^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`), m("STAR", "(<|>)?=?\\s*\\*"), m("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), m("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Iu, Iu.exports);
var wa = Iu.exports;
const gC = Object.freeze({ loose: !0 }), mC = Object.freeze({}), vC = (t) => t ? typeof t != "object" ? gC : t : mC;
var jd = vC;
const wf = /^[0-9]+$/, _v = (t, e) => {
  const n = wf.test(t), r = wf.test(e);
  return n && r && (t = +t, e = +e), t === e ? 0 : n && !r ? -1 : r && !n ? 1 : t < e ? -1 : 1;
}, yC = (t, e) => _v(e, t);
var Cv = {
  compareIdentifiers: _v,
  rcompareIdentifiers: yC
};
const Fa = Uc, { MAX_LENGTH: Af, MAX_SAFE_INTEGER: ja } = kc, { safeRe: bf, t: Rf } = wa, EC = jd, { compareIdentifiers: $r } = Cv;
let _C = class on {
  constructor(e, n) {
    if (n = EC(n), e instanceof on) {
      if (e.loose === !!n.loose && e.includePrerelease === !!n.includePrerelease)
        return e;
      e = e.version;
    } else if (typeof e != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);
    if (e.length > Af)
      throw new TypeError(
        `version is longer than ${Af} characters`
      );
    Fa("SemVer", e, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
    const r = e.trim().match(n.loose ? bf[Rf.LOOSE] : bf[Rf.FULL]);
    if (!r)
      throw new TypeError(`Invalid Version: ${e}`);
    if (this.raw = e, this.major = +r[1], this.minor = +r[2], this.patch = +r[3], this.major > ja || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > ja || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > ja || this.patch < 0)
      throw new TypeError("Invalid patch version");
    r[4] ? this.prerelease = r[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < ja)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = r[5] ? r[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(e) {
    if (Fa("SemVer.compare", this.version, this.options, e), !(e instanceof on)) {
      if (typeof e == "string" && e === this.version)
        return 0;
      e = new on(e, this.options);
    }
    return e.version === this.version ? 0 : this.compareMain(e) || this.comparePre(e);
  }
  compareMain(e) {
    return e instanceof on || (e = new on(e, this.options)), $r(this.major, e.major) || $r(this.minor, e.minor) || $r(this.patch, e.patch);
  }
  comparePre(e) {
    if (e instanceof on || (e = new on(e, this.options)), this.prerelease.length && !e.prerelease.length)
      return -1;
    if (!this.prerelease.length && e.prerelease.length)
      return 1;
    if (!this.prerelease.length && !e.prerelease.length)
      return 0;
    let n = 0;
    do {
      const r = this.prerelease[n], i = e.prerelease[n];
      if (Fa("prerelease compare", n, r, i), r === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === i)
        continue;
      return $r(r, i);
    } while (++n);
  }
  compareBuild(e) {
    e instanceof on || (e = new on(e, this.options));
    let n = 0;
    do {
      const r = this.build[n], i = e.build[n];
      if (Fa("prerelease compare", n, r, i), r === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === i)
        continue;
      return $r(r, i);
    } while (++n);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(e, n, r) {
    switch (e) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, r);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, r);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", n, r), this.inc("pre", n, r);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", n, r), this.inc("pre", n, r);
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(r) ? 1 : 0;
        if (!n && r === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (n === this.prerelease.join(".") && r === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (n) {
          let o = [n, i];
          r === !1 && (o = [n]), $r(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${e}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var mt = _C;
const If = mt, CC = (t, e, n = !1) => {
  if (t instanceof If)
    return t;
  try {
    return new If(t, e);
  } catch (r) {
    if (!n)
      return null;
    throw r;
  }
};
var to = CC;
const TC = to, SC = (t, e) => {
  const n = TC(t, e);
  return n ? n.version : null;
};
var wC = SC;
const AC = to, bC = (t, e) => {
  const n = AC(t.trim().replace(/^[=v]+/, ""), e);
  return n ? n.version : null;
};
var RC = bC;
const Nf = mt, IC = (t, e, n, r, i) => {
  typeof n == "string" && (i = r, r = n, n = void 0);
  try {
    return new Nf(
      t instanceof Nf ? t.version : t,
      n
    ).inc(e, r, i).version;
  } catch {
    return null;
  }
};
var NC = IC;
const Of = to, OC = (t, e) => {
  const n = Of(t, null, !0), r = Of(e, null, !0), i = n.compare(r);
  if (i === 0)
    return null;
  const o = i > 0, a = o ? n : r, s = o ? r : n, c = !!a.prerelease.length;
  if (!!s.prerelease.length && !c)
    return !s.patch && !s.minor ? "major" : a.patch ? "patch" : a.minor ? "minor" : "major";
  const u = c ? "pre" : "";
  return n.major !== r.major ? u + "major" : n.minor !== r.minor ? u + "minor" : n.patch !== r.patch ? u + "patch" : "prerelease";
};
var MC = OC;
const kC = mt, UC = (t, e) => new kC(t, e).major;
var DC = UC;
const PC = mt, HC = (t, e) => new PC(t, e).minor;
var LC = HC;
const xC = mt, qC = (t, e) => new xC(t, e).patch;
var BC = qC;
const zC = to, GC = (t, e) => {
  const n = zC(t, e);
  return n && n.prerelease.length ? n.prerelease : null;
};
var KC = GC;
const Mf = mt, FC = (t, e, n) => new Mf(t, n).compare(new Mf(e, n));
var tn = FC;
const jC = tn, YC = (t, e, n) => jC(e, t, n);
var QC = YC;
const VC = tn, $C = (t, e) => VC(t, e, !0);
var XC = $C;
const kf = mt, JC = (t, e, n) => {
  const r = new kf(t, n), i = new kf(e, n);
  return r.compare(i) || r.compareBuild(i);
};
var Yd = JC;
const ZC = Yd, WC = (t, e) => t.sort((n, r) => ZC(n, r, e));
var eT = WC;
const tT = Yd, nT = (t, e) => t.sort((n, r) => tT(r, n, e));
var rT = nT;
const iT = tn, oT = (t, e, n) => iT(t, e, n) > 0;
var Dc = oT;
const aT = tn, sT = (t, e, n) => aT(t, e, n) < 0;
var Qd = sT;
const cT = tn, lT = (t, e, n) => cT(t, e, n) === 0;
var Tv = lT;
const uT = tn, dT = (t, e, n) => uT(t, e, n) !== 0;
var Sv = dT;
const hT = tn, fT = (t, e, n) => hT(t, e, n) >= 0;
var Vd = fT;
const pT = tn, gT = (t, e, n) => pT(t, e, n) <= 0;
var $d = gT;
const mT = Tv, vT = Sv, yT = Dc, ET = Vd, _T = Qd, CT = $d, TT = (t, e, n, r) => {
  switch (e) {
    case "===":
      return typeof t == "object" && (t = t.version), typeof n == "object" && (n = n.version), t === n;
    case "!==":
      return typeof t == "object" && (t = t.version), typeof n == "object" && (n = n.version), t !== n;
    case "":
    case "=":
    case "==":
      return mT(t, n, r);
    case "!=":
      return vT(t, n, r);
    case ">":
      return yT(t, n, r);
    case ">=":
      return ET(t, n, r);
    case "<":
      return _T(t, n, r);
    case "<=":
      return CT(t, n, r);
    default:
      throw new TypeError(`Invalid operator: ${e}`);
  }
};
var wv = TT;
const ST = mt, wT = to, { safeRe: Ya, t: Qa } = wa, AT = (t, e) => {
  if (t instanceof ST)
    return t;
  if (typeof t == "number" && (t = String(t)), typeof t != "string")
    return null;
  e = e || {};
  let n = null;
  if (!e.rtl)
    n = t.match(e.includePrerelease ? Ya[Qa.COERCEFULL] : Ya[Qa.COERCE]);
  else {
    const c = e.includePrerelease ? Ya[Qa.COERCERTLFULL] : Ya[Qa.COERCERTL];
    let l;
    for (; (l = c.exec(t)) && (!n || n.index + n[0].length !== t.length); )
      (!n || l.index + l[0].length !== n.index + n[0].length) && (n = l), c.lastIndex = l.index + l[1].length + l[2].length;
    c.lastIndex = -1;
  }
  if (n === null)
    return null;
  const r = n[2], i = n[3] || "0", o = n[4] || "0", a = e.includePrerelease && n[5] ? `-${n[5]}` : "", s = e.includePrerelease && n[6] ? `+${n[6]}` : "";
  return wT(`${r}.${i}.${o}${a}${s}`, e);
};
var bT = AT, wl, Uf;
function RT() {
  return Uf || (Uf = 1, wl = function(t) {
    t.prototype[Symbol.iterator] = function* () {
      for (let e = this.head; e; e = e.next)
        yield e.value;
    };
  }), wl;
}
var IT = se;
se.Node = xr;
se.create = se;
function se(t) {
  var e = this;
  if (e instanceof se || (e = new se()), e.tail = null, e.head = null, e.length = 0, t && typeof t.forEach == "function")
    t.forEach(function(i) {
      e.push(i);
    });
  else if (arguments.length > 0)
    for (var n = 0, r = arguments.length; n < r; n++)
      e.push(arguments[n]);
  return e;
}
se.prototype.removeNode = function(t) {
  if (t.list !== this)
    throw new Error("removing node which does not belong to this list");
  var e = t.next, n = t.prev;
  return e && (e.prev = n), n && (n.next = e), t === this.head && (this.head = e), t === this.tail && (this.tail = n), t.list.length--, t.next = null, t.prev = null, t.list = null, e;
};
se.prototype.unshiftNode = function(t) {
  if (t !== this.head) {
    t.list && t.list.removeNode(t);
    var e = this.head;
    t.list = this, t.next = e, e && (e.prev = t), this.head = t, this.tail || (this.tail = t), this.length++;
  }
};
se.prototype.pushNode = function(t) {
  if (t !== this.tail) {
    t.list && t.list.removeNode(t);
    var e = this.tail;
    t.list = this, t.prev = e, e && (e.next = t), this.tail = t, this.head || (this.head = t), this.length++;
  }
};
se.prototype.push = function() {
  for (var t = 0, e = arguments.length; t < e; t++)
    OT(this, arguments[t]);
  return this.length;
};
se.prototype.unshift = function() {
  for (var t = 0, e = arguments.length; t < e; t++)
    MT(this, arguments[t]);
  return this.length;
};
se.prototype.pop = function() {
  if (this.tail) {
    var t = this.tail.value;
    return this.tail = this.tail.prev, this.tail ? this.tail.next = null : this.head = null, this.length--, t;
  }
};
se.prototype.shift = function() {
  if (this.head) {
    var t = this.head.value;
    return this.head = this.head.next, this.head ? this.head.prev = null : this.tail = null, this.length--, t;
  }
};
se.prototype.forEach = function(t, e) {
  e = e || this;
  for (var n = this.head, r = 0; n !== null; r++)
    t.call(e, n.value, r, this), n = n.next;
};
se.prototype.forEachReverse = function(t, e) {
  e = e || this;
  for (var n = this.tail, r = this.length - 1; n !== null; r--)
    t.call(e, n.value, r, this), n = n.prev;
};
se.prototype.get = function(t) {
  for (var e = 0, n = this.head; n !== null && e < t; e++)
    n = n.next;
  if (e === t && n !== null)
    return n.value;
};
se.prototype.getReverse = function(t) {
  for (var e = 0, n = this.tail; n !== null && e < t; e++)
    n = n.prev;
  if (e === t && n !== null)
    return n.value;
};
se.prototype.map = function(t, e) {
  e = e || this;
  for (var n = new se(), r = this.head; r !== null; )
    n.push(t.call(e, r.value, this)), r = r.next;
  return n;
};
se.prototype.mapReverse = function(t, e) {
  e = e || this;
  for (var n = new se(), r = this.tail; r !== null; )
    n.push(t.call(e, r.value, this)), r = r.prev;
  return n;
};
se.prototype.reduce = function(t, e) {
  var n, r = this.head;
  if (arguments.length > 1)
    n = e;
  else if (this.head)
    r = this.head.next, n = this.head.value;
  else
    throw new TypeError("Reduce of empty list with no initial value");
  for (var i = 0; r !== null; i++)
    n = t(n, r.value, i), r = r.next;
  return n;
};
se.prototype.reduceReverse = function(t, e) {
  var n, r = this.tail;
  if (arguments.length > 1)
    n = e;
  else if (this.tail)
    r = this.tail.prev, n = this.tail.value;
  else
    throw new TypeError("Reduce of empty list with no initial value");
  for (var i = this.length - 1; r !== null; i--)
    n = t(n, r.value, i), r = r.prev;
  return n;
};
se.prototype.toArray = function() {
  for (var t = new Array(this.length), e = 0, n = this.head; n !== null; e++)
    t[e] = n.value, n = n.next;
  return t;
};
se.prototype.toArrayReverse = function() {
  for (var t = new Array(this.length), e = 0, n = this.tail; n !== null; e++)
    t[e] = n.value, n = n.prev;
  return t;
};
se.prototype.slice = function(t, e) {
  e = e || this.length, e < 0 && (e += this.length), t = t || 0, t < 0 && (t += this.length);
  var n = new se();
  if (e < t || e < 0)
    return n;
  t < 0 && (t = 0), e > this.length && (e = this.length);
  for (var r = 0, i = this.head; i !== null && r < t; r++)
    i = i.next;
  for (; i !== null && r < e; r++, i = i.next)
    n.push(i.value);
  return n;
};
se.prototype.sliceReverse = function(t, e) {
  e = e || this.length, e < 0 && (e += this.length), t = t || 0, t < 0 && (t += this.length);
  var n = new se();
  if (e < t || e < 0)
    return n;
  t < 0 && (t = 0), e > this.length && (e = this.length);
  for (var r = this.length, i = this.tail; i !== null && r > e; r--)
    i = i.prev;
  for (; i !== null && r > t; r--, i = i.prev)
    n.push(i.value);
  return n;
};
se.prototype.splice = function(t, e, ...n) {
  t > this.length && (t = this.length - 1), t < 0 && (t = this.length + t);
  for (var r = 0, i = this.head; i !== null && r < t; r++)
    i = i.next;
  for (var o = [], r = 0; i && r < e; r++)
    o.push(i.value), i = this.removeNode(i);
  i === null && (i = this.tail), i !== this.head && i !== this.tail && (i = i.prev);
  for (var r = 0; r < n.length; r++)
    i = NT(this, i, n[r]);
  return o;
};
se.prototype.reverse = function() {
  for (var t = this.head, e = this.tail, n = t; n !== null; n = n.prev) {
    var r = n.prev;
    n.prev = n.next, n.next = r;
  }
  return this.head = e, this.tail = t, this;
};
function NT(t, e, n) {
  var r = e === t.head ? new xr(n, null, e, t) : new xr(n, e, e.next, t);
  return r.next === null && (t.tail = r), r.prev === null && (t.head = r), t.length++, r;
}
function OT(t, e) {
  t.tail = new xr(e, t.tail, null, t), t.head || (t.head = t.tail), t.length++;
}
function MT(t, e) {
  t.head = new xr(e, null, t.head, t), t.tail || (t.tail = t.head), t.length++;
}
function xr(t, e, n, r) {
  if (!(this instanceof xr))
    return new xr(t, e, n, r);
  this.list = r, this.value = t, e ? (e.next = this, this.prev = e) : this.prev = null, n ? (n.prev = this, this.next = n) : this.next = null;
}
try {
  RT()(se);
} catch {
}
const kT = IT, Cr = Symbol("max"), bn = Symbol("length"), Xr = Symbol("lengthCalculator"), zo = Symbol("allowStale"), Ar = Symbol("maxAge"), wn = Symbol("dispose"), Df = Symbol("noDisposeOnSet"), Ge = Symbol("lruList"), jt = Symbol("cache"), Av = Symbol("updateAgeOnGet"), Al = () => 1;
class UT {
  constructor(e) {
    if (typeof e == "number" && (e = { max: e }), e || (e = {}), e.max && (typeof e.max != "number" || e.max < 0))
      throw new TypeError("max must be a non-negative number");
    this[Cr] = e.max || 1 / 0;
    const n = e.length || Al;
    if (this[Xr] = typeof n != "function" ? Al : n, this[zo] = e.stale || !1, e.maxAge && typeof e.maxAge != "number")
      throw new TypeError("maxAge must be a number");
    this[Ar] = e.maxAge || 0, this[wn] = e.dispose, this[Df] = e.noDisposeOnSet || !1, this[Av] = e.updateAgeOnGet || !1, this.reset();
  }
  // resize the cache when the max changes.
  set max(e) {
    if (typeof e != "number" || e < 0)
      throw new TypeError("max must be a non-negative number");
    this[Cr] = e || 1 / 0, fo(this);
  }
  get max() {
    return this[Cr];
  }
  set allowStale(e) {
    this[zo] = !!e;
  }
  get allowStale() {
    return this[zo];
  }
  set maxAge(e) {
    if (typeof e != "number")
      throw new TypeError("maxAge must be a non-negative number");
    this[Ar] = e, fo(this);
  }
  get maxAge() {
    return this[Ar];
  }
  // resize the cache when the lengthCalculator changes.
  set lengthCalculator(e) {
    typeof e != "function" && (e = Al), e !== this[Xr] && (this[Xr] = e, this[bn] = 0, this[Ge].forEach((n) => {
      n.length = this[Xr](n.value, n.key), this[bn] += n.length;
    })), fo(this);
  }
  get lengthCalculator() {
    return this[Xr];
  }
  get length() {
    return this[bn];
  }
  get itemCount() {
    return this[Ge].length;
  }
  rforEach(e, n) {
    n = n || this;
    for (let r = this[Ge].tail; r !== null; ) {
      const i = r.prev;
      Pf(this, e, r, n), r = i;
    }
  }
  forEach(e, n) {
    n = n || this;
    for (let r = this[Ge].head; r !== null; ) {
      const i = r.next;
      Pf(this, e, r, n), r = i;
    }
  }
  keys() {
    return this[Ge].toArray().map((e) => e.key);
  }
  values() {
    return this[Ge].toArray().map((e) => e.value);
  }
  reset() {
    this[wn] && this[Ge] && this[Ge].length && this[Ge].forEach((e) => this[wn](e.key, e.value)), this[jt] = /* @__PURE__ */ new Map(), this[Ge] = new kT(), this[bn] = 0;
  }
  dump() {
    return this[Ge].map((e) => $s(this, e) ? !1 : {
      k: e.key,
      v: e.value,
      e: e.now + (e.maxAge || 0)
    }).toArray().filter((e) => e);
  }
  dumpLru() {
    return this[Ge];
  }
  set(e, n, r) {
    if (r = r || this[Ar], r && typeof r != "number")
      throw new TypeError("maxAge must be a number");
    const i = r ? Date.now() : 0, o = this[Xr](n, e);
    if (this[jt].has(e)) {
      if (o > this[Cr])
        return Ni(this, this[jt].get(e)), !1;
      const c = this[jt].get(e).value;
      return this[wn] && (this[Df] || this[wn](e, c.value)), c.now = i, c.maxAge = r, c.value = n, this[bn] += o - c.length, c.length = o, this.get(e), fo(this), !0;
    }
    const a = new DT(e, n, o, i, r);
    return a.length > this[Cr] ? (this[wn] && this[wn](e, n), !1) : (this[bn] += a.length, this[Ge].unshift(a), this[jt].set(e, this[Ge].head), fo(this), !0);
  }
  has(e) {
    if (!this[jt].has(e))
      return !1;
    const n = this[jt].get(e).value;
    return !$s(this, n);
  }
  get(e) {
    return bl(this, e, !0);
  }
  peek(e) {
    return bl(this, e, !1);
  }
  pop() {
    const e = this[Ge].tail;
    return e ? (Ni(this, e), e.value) : null;
  }
  del(e) {
    Ni(this, this[jt].get(e));
  }
  load(e) {
    this.reset();
    const n = Date.now();
    for (let r = e.length - 1; r >= 0; r--) {
      const i = e[r], o = i.e || 0;
      if (o === 0)
        this.set(i.k, i.v);
      else {
        const a = o - n;
        a > 0 && this.set(i.k, i.v, a);
      }
    }
  }
  prune() {
    this[jt].forEach((e, n) => bl(this, n, !1));
  }
}
const bl = (t, e, n) => {
  const r = t[jt].get(e);
  if (r) {
    const i = r.value;
    if ($s(t, i)) {
      if (Ni(t, r), !t[zo])
        return;
    } else
      n && (t[Av] && (r.value.now = Date.now()), t[Ge].unshiftNode(r));
    return i.value;
  }
}, $s = (t, e) => {
  if (!e || !e.maxAge && !t[Ar])
    return !1;
  const n = Date.now() - e.now;
  return e.maxAge ? n > e.maxAge : t[Ar] && n > t[Ar];
}, fo = (t) => {
  if (t[bn] > t[Cr])
    for (let e = t[Ge].tail; t[bn] > t[Cr] && e !== null; ) {
      const n = e.prev;
      Ni(t, e), e = n;
    }
}, Ni = (t, e) => {
  if (e) {
    const n = e.value;
    t[wn] && t[wn](n.key, n.value), t[bn] -= n.length, t[jt].delete(n.key), t[Ge].removeNode(e);
  }
};
class DT {
  constructor(e, n, r, i, o) {
    this.key = e, this.value = n, this.length = r, this.now = i, this.maxAge = o || 0;
  }
}
const Pf = (t, e, n, r) => {
  let i = n.value;
  $s(t, i) && (Ni(t, n), t[zo] || (i = void 0)), i && e.call(r, i.value, i.key, t);
};
var PT = UT, Rl, Hf;
function nn() {
  if (Hf)
    return Rl;
  Hf = 1;
  class t {
    constructor(U, j) {
      if (j = r(j), U instanceof t)
        return U.loose === !!j.loose && U.includePrerelease === !!j.includePrerelease ? U : new t(U.raw, j);
      if (U instanceof i)
        return this.raw = U.value, this.set = [[U]], this.format(), this;
      if (this.options = j, this.loose = !!j.loose, this.includePrerelease = !!j.includePrerelease, this.raw = U.trim().split(/\s+/).join(" "), this.set = this.raw.split("||").map((T) => this.parseRange(T.trim())).filter((T) => T.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const T = this.set[0];
        if (this.set = this.set.filter((O) => !m(O[0])), this.set.length === 0)
          this.set = [T];
        else if (this.set.length > 1) {
          for (const O of this.set)
            if (O.length === 1 && E(O[0])) {
              this.set = [O];
              break;
            }
        }
      }
      this.format();
    }
    format() {
      return this.range = this.set.map((U) => U.join(" ").trim()).join("||").trim(), this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(U) {
      const T = ((this.options.includePrerelease && h) | (this.options.loose && f)) + ":" + U, O = n.get(T);
      if (O)
        return O;
      const I = this.options.loose, G = I ? s[c.HYPHENRANGELOOSE] : s[c.HYPHENRANGE];
      U = U.replace(G, tt(this.options.includePrerelease)), o("hyphen replace", U), U = U.replace(s[c.COMPARATORTRIM], l), o("comparator trim", U), U = U.replace(s[c.TILDETRIM], u), o("tilde trim", U), U = U.replace(s[c.CARETTRIM], d), o("caret trim", U);
      let Y = U.split(" ").map((pe) => g(pe, this.options)).join(" ").split(/\s+/).map((pe) => ee(pe, this.options));
      I && (Y = Y.filter((pe) => (o("loose invalid filter", pe, this.options), !!pe.match(s[c.COMPARATORLOOSE])))), o("range list", Y);
      const Z = /* @__PURE__ */ new Map(), fe = Y.map((pe) => new i(pe, this.options));
      for (const pe of fe) {
        if (m(pe))
          return [pe];
        Z.set(pe.value, pe);
      }
      Z.size > 1 && Z.has("") && Z.delete("");
      const Ye = [...Z.values()];
      return n.set(T, Ye), Ye;
    }
    intersects(U, j) {
      if (!(U instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((T) => N(T, j) && U.set.some((O) => N(O, j) && T.every((I) => O.every((G) => I.intersects(G, j)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(U) {
      if (!U)
        return !1;
      if (typeof U == "string")
        try {
          U = new a(U, this.options);
        } catch {
          return !1;
        }
      for (let j = 0; j < this.set.length; j++)
        if (jr(this.set[j], U, this.options))
          return !0;
      return !1;
    }
  }
  Rl = t;
  const e = PT, n = new e({ max: 1e3 }), r = jd, i = Pc(), o = Uc, a = mt, {
    safeRe: s,
    t: c,
    comparatorTrimReplace: l,
    tildeTrimReplace: u,
    caretTrimReplace: d
  } = wa, { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: f } = kc, m = (q) => q.value === "<0.0.0-0", E = (q) => q.value === "", N = (q, U) => {
    let j = !0;
    const T = q.slice();
    let O = T.pop();
    for (; j && T.length; )
      j = T.every((I) => O.intersects(I, U)), O = T.pop();
    return j;
  }, g = (q, U) => (o("comp", q, U), q = k(q, U), o("caret", q), q = v(q, U), o("tildes", q), q = z(q, U), o("xrange", q), q = we(q, U), o("stars", q), q), p = (q) => !q || q.toLowerCase() === "x" || q === "*", v = (q, U) => q.trim().split(/\s+/).map((j) => C(j, U)).join(" "), C = (q, U) => {
    const j = U.loose ? s[c.TILDELOOSE] : s[c.TILDE];
    return q.replace(j, (T, O, I, G, Y) => {
      o("tilde", q, T, O, I, G, Y);
      let Z;
      return p(O) ? Z = "" : p(I) ? Z = `>=${O}.0.0 <${+O + 1}.0.0-0` : p(G) ? Z = `>=${O}.${I}.0 <${O}.${+I + 1}.0-0` : Y ? (o("replaceTilde pr", Y), Z = `>=${O}.${I}.${G}-${Y} <${O}.${+I + 1}.0-0`) : Z = `>=${O}.${I}.${G} <${O}.${+I + 1}.0-0`, o("tilde return", Z), Z;
    });
  }, k = (q, U) => q.trim().split(/\s+/).map((j) => D(j, U)).join(" "), D = (q, U) => {
    o("caret", q, U);
    const j = U.loose ? s[c.CARETLOOSE] : s[c.CARET], T = U.includePrerelease ? "-0" : "";
    return q.replace(j, (O, I, G, Y, Z) => {
      o("caret", q, O, I, G, Y, Z);
      let fe;
      return p(I) ? fe = "" : p(G) ? fe = `>=${I}.0.0${T} <${+I + 1}.0.0-0` : p(Y) ? I === "0" ? fe = `>=${I}.${G}.0${T} <${I}.${+G + 1}.0-0` : fe = `>=${I}.${G}.0${T} <${+I + 1}.0.0-0` : Z ? (o("replaceCaret pr", Z), I === "0" ? G === "0" ? fe = `>=${I}.${G}.${Y}-${Z} <${I}.${G}.${+Y + 1}-0` : fe = `>=${I}.${G}.${Y}-${Z} <${I}.${+G + 1}.0-0` : fe = `>=${I}.${G}.${Y}-${Z} <${+I + 1}.0.0-0`) : (o("no pr"), I === "0" ? G === "0" ? fe = `>=${I}.${G}.${Y}${T} <${I}.${G}.${+Y + 1}-0` : fe = `>=${I}.${G}.${Y}${T} <${I}.${+G + 1}.0-0` : fe = `>=${I}.${G}.${Y} <${+I + 1}.0.0-0`), o("caret return", fe), fe;
    });
  }, z = (q, U) => (o("replaceXRanges", q, U), q.split(/\s+/).map((j) => H(j, U)).join(" ")), H = (q, U) => {
    q = q.trim();
    const j = U.loose ? s[c.XRANGELOOSE] : s[c.XRANGE];
    return q.replace(j, (T, O, I, G, Y, Z) => {
      o("xRange", q, T, O, I, G, Y, Z);
      const fe = p(I), Ye = fe || p(G), pe = Ye || p(Y), rn = pe;
      return O === "=" && rn && (O = ""), Z = U.includePrerelease ? "-0" : "", fe ? O === ">" || O === "<" ? T = "<0.0.0-0" : T = "*" : O && rn ? (Ye && (G = 0), Y = 0, O === ">" ? (O = ">=", Ye ? (I = +I + 1, G = 0, Y = 0) : (G = +G + 1, Y = 0)) : O === "<=" && (O = "<", Ye ? I = +I + 1 : G = +G + 1), O === "<" && (Z = "-0"), T = `${O + I}.${G}.${Y}${Z}`) : Ye ? T = `>=${I}.0.0${Z} <${+I + 1}.0.0-0` : pe && (T = `>=${I}.${G}.0${Z} <${I}.${+G + 1}.0-0`), o("xRange return", T), T;
    });
  }, we = (q, U) => (o("replaceStars", q, U), q.trim().replace(s[c.STAR], "")), ee = (q, U) => (o("replaceGTE0", q, U), q.trim().replace(s[U.includePrerelease ? c.GTE0PRE : c.GTE0], "")), tt = (q) => (U, j, T, O, I, G, Y, Z, fe, Ye, pe, rn, lb) => (p(T) ? j = "" : p(O) ? j = `>=${T}.0.0${q ? "-0" : ""}` : p(I) ? j = `>=${T}.${O}.0${q ? "-0" : ""}` : G ? j = `>=${j}` : j = `>=${j}${q ? "-0" : ""}`, p(fe) ? Z = "" : p(Ye) ? Z = `<${+fe + 1}.0.0-0` : p(pe) ? Z = `<${fe}.${+Ye + 1}.0-0` : rn ? Z = `<=${fe}.${Ye}.${pe}-${rn}` : q ? Z = `<${fe}.${Ye}.${+pe + 1}-0` : Z = `<=${Z}`, `${j} ${Z}`.trim()), jr = (q, U, j) => {
    for (let T = 0; T < q.length; T++)
      if (!q[T].test(U))
        return !1;
    if (U.prerelease.length && !j.includePrerelease) {
      for (let T = 0; T < q.length; T++)
        if (o(q[T].semver), q[T].semver !== i.ANY && q[T].semver.prerelease.length > 0) {
          const O = q[T].semver;
          if (O.major === U.major && O.minor === U.minor && O.patch === U.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Rl;
}
var Il, Lf;
function Pc() {
  if (Lf)
    return Il;
  Lf = 1;
  const t = Symbol("SemVer ANY");
  class e {
    static get ANY() {
      return t;
    }
    constructor(u, d) {
      if (d = n(d), u instanceof e) {
        if (u.loose === !!d.loose)
          return u;
        u = u.value;
      }
      u = u.trim().split(/\s+/).join(" "), a("comparator", u, d), this.options = d, this.loose = !!d.loose, this.parse(u), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(u) {
      const d = this.options.loose ? r[i.COMPARATORLOOSE] : r[i.COMPARATOR], h = u.match(d);
      if (!h)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = h[1] !== void 0 ? h[1] : "", this.operator === "=" && (this.operator = ""), h[2] ? this.semver = new s(h[2], this.options.loose) : this.semver = t;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (a("Comparator.test", u, this.options.loose), this.semver === t || u === t)
        return !0;
      if (typeof u == "string")
        try {
          u = new s(u, this.options);
        } catch {
          return !1;
        }
      return o(u, this.operator, this.semver, this.options);
    }
    intersects(u, d) {
      if (!(u instanceof e))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(u.value, d).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new c(this.value, d).test(u.semver) : (d = n(d), d.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !d.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || o(this.semver, "<", u.semver, d) && this.operator.startsWith(">") && u.operator.startsWith("<") || o(this.semver, ">", u.semver, d) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  Il = e;
  const n = jd, { safeRe: r, t: i } = wa, o = wv, a = Uc, s = mt, c = nn();
  return Il;
}
const HT = nn(), LT = (t, e, n) => {
  try {
    e = new HT(e, n);
  } catch {
    return !1;
  }
  return e.test(t);
};
var Hc = LT;
const xT = nn(), qT = (t, e) => new xT(t, e).set.map((n) => n.map((r) => r.value).join(" ").trim().split(" "));
var BT = qT;
const zT = mt, GT = nn(), KT = (t, e, n) => {
  let r = null, i = null, o = null;
  try {
    o = new GT(e, n);
  } catch {
    return null;
  }
  return t.forEach((a) => {
    o.test(a) && (!r || i.compare(a) === -1) && (r = a, i = new zT(r, n));
  }), r;
};
var FT = KT;
const jT = mt, YT = nn(), QT = (t, e, n) => {
  let r = null, i = null, o = null;
  try {
    o = new YT(e, n);
  } catch {
    return null;
  }
  return t.forEach((a) => {
    o.test(a) && (!r || i.compare(a) === 1) && (r = a, i = new jT(r, n));
  }), r;
};
var VT = QT;
const Nl = mt, $T = nn(), xf = Dc, XT = (t, e) => {
  t = new $T(t, e);
  let n = new Nl("0.0.0");
  if (t.test(n) || (n = new Nl("0.0.0-0"), t.test(n)))
    return n;
  n = null;
  for (let r = 0; r < t.set.length; ++r) {
    const i = t.set[r];
    let o = null;
    i.forEach((a) => {
      const s = new Nl(a.semver.version);
      switch (a.operator) {
        case ">":
          s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
        case "":
        case ">=":
          (!o || xf(s, o)) && (o = s);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${a.operator}`);
      }
    }), o && (!n || xf(n, o)) && (n = o);
  }
  return n && t.test(n) ? n : null;
};
var JT = XT;
const ZT = nn(), WT = (t, e) => {
  try {
    return new ZT(t, e).range || "*";
  } catch {
    return null;
  }
};
var eS = WT;
const tS = mt, bv = Pc(), { ANY: nS } = bv, rS = nn(), iS = Hc, qf = Dc, Bf = Qd, oS = $d, aS = Vd, sS = (t, e, n, r) => {
  t = new tS(t, r), e = new rS(e, r);
  let i, o, a, s, c;
  switch (n) {
    case ">":
      i = qf, o = oS, a = Bf, s = ">", c = ">=";
      break;
    case "<":
      i = Bf, o = aS, a = qf, s = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (iS(t, e, r))
    return !1;
  for (let l = 0; l < e.set.length; ++l) {
    const u = e.set[l];
    let d = null, h = null;
    if (u.forEach((f) => {
      f.semver === nS && (f = new bv(">=0.0.0")), d = d || f, h = h || f, i(f.semver, d.semver, r) ? d = f : a(f.semver, h.semver, r) && (h = f);
    }), d.operator === s || d.operator === c || (!h.operator || h.operator === s) && o(t, h.semver))
      return !1;
    if (h.operator === c && a(t, h.semver))
      return !1;
  }
  return !0;
};
var Xd = sS;
const cS = Xd, lS = (t, e, n) => cS(t, e, ">", n);
var uS = lS;
const dS = Xd, hS = (t, e, n) => dS(t, e, "<", n);
var fS = hS;
const zf = nn(), pS = (t, e, n) => (t = new zf(t, n), e = new zf(e, n), t.intersects(e, n));
var gS = pS;
const mS = Hc, vS = tn;
var yS = (t, e, n) => {
  const r = [];
  let i = null, o = null;
  const a = t.sort((u, d) => vS(u, d, n));
  for (const u of a)
    mS(u, e, n) ? (o = u, i || (i = u)) : (o && r.push([i, o]), o = null, i = null);
  i && r.push([i, null]);
  const s = [];
  for (const [u, d] of r)
    u === d ? s.push(u) : !d && u === a[0] ? s.push("*") : d ? u === a[0] ? s.push(`<=${d}`) : s.push(`${u} - ${d}`) : s.push(`>=${u}`);
  const c = s.join(" || "), l = typeof e.raw == "string" ? e.raw : String(e);
  return c.length < l.length ? c : e;
};
const Gf = nn(), Jd = Pc(), { ANY: Ol } = Jd, po = Hc, Zd = tn, ES = (t, e, n = {}) => {
  if (t === e)
    return !0;
  t = new Gf(t, n), e = new Gf(e, n);
  let r = !1;
  e:
    for (const i of t.set) {
      for (const o of e.set) {
        const a = CS(i, o, n);
        if (r = r || a !== null, a)
          continue e;
      }
      if (r)
        return !1;
    }
  return !0;
}, _S = [new Jd(">=0.0.0-0")], Kf = [new Jd(">=0.0.0")], CS = (t, e, n) => {
  if (t === e)
    return !0;
  if (t.length === 1 && t[0].semver === Ol) {
    if (e.length === 1 && e[0].semver === Ol)
      return !0;
    n.includePrerelease ? t = _S : t = Kf;
  }
  if (e.length === 1 && e[0].semver === Ol) {
    if (n.includePrerelease)
      return !0;
    e = Kf;
  }
  const r = /* @__PURE__ */ new Set();
  let i, o;
  for (const f of t)
    f.operator === ">" || f.operator === ">=" ? i = Ff(i, f, n) : f.operator === "<" || f.operator === "<=" ? o = jf(o, f, n) : r.add(f.semver);
  if (r.size > 1)
    return null;
  let a;
  if (i && o) {
    if (a = Zd(i.semver, o.semver, n), a > 0)
      return null;
    if (a === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const f of r) {
    if (i && !po(f, String(i), n) || o && !po(f, String(o), n))
      return null;
    for (const m of e)
      if (!po(f, String(m), n))
        return !1;
    return !0;
  }
  let s, c, l, u, d = o && !n.includePrerelease && o.semver.prerelease.length ? o.semver : !1, h = i && !n.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  d && d.prerelease.length === 1 && o.operator === "<" && d.prerelease[0] === 0 && (d = !1);
  for (const f of e) {
    if (u = u || f.operator === ">" || f.operator === ">=", l = l || f.operator === "<" || f.operator === "<=", i) {
      if (h && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === h.major && f.semver.minor === h.minor && f.semver.patch === h.patch && (h = !1), f.operator === ">" || f.operator === ">=") {
        if (s = Ff(i, f, n), s === f && s !== i)
          return !1;
      } else if (i.operator === ">=" && !po(i.semver, String(f), n))
        return !1;
    }
    if (o) {
      if (d && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === d.major && f.semver.minor === d.minor && f.semver.patch === d.patch && (d = !1), f.operator === "<" || f.operator === "<=") {
        if (c = jf(o, f, n), c === f && c !== o)
          return !1;
      } else if (o.operator === "<=" && !po(o.semver, String(f), n))
        return !1;
    }
    if (!f.operator && (o || i) && a !== 0)
      return !1;
  }
  return !(i && l && !o && a !== 0 || o && u && !i && a !== 0 || h || d);
}, Ff = (t, e, n) => {
  if (!t)
    return e;
  const r = Zd(t.semver, e.semver, n);
  return r > 0 ? t : r < 0 || e.operator === ">" && t.operator === ">=" ? e : t;
}, jf = (t, e, n) => {
  if (!t)
    return e;
  const r = Zd(t.semver, e.semver, n);
  return r < 0 ? t : r > 0 || e.operator === "<" && t.operator === "<=" ? e : t;
};
var TS = ES;
const Ml = wa, Yf = kc, SS = mt, Qf = Cv, wS = to, AS = wC, bS = RC, RS = NC, IS = MC, NS = DC, OS = LC, MS = BC, kS = KC, US = tn, DS = QC, PS = XC, HS = Yd, LS = eT, xS = rT, qS = Dc, BS = Qd, zS = Tv, GS = Sv, KS = Vd, FS = $d, jS = wv, YS = bT, QS = Pc(), VS = nn(), $S = Hc, XS = BT, JS = FT, ZS = VT, WS = JT, e0 = eS, t0 = Xd, n0 = uS, r0 = fS, i0 = gS, o0 = yS, a0 = TS;
var Vf = {
  parse: wS,
  valid: AS,
  clean: bS,
  inc: RS,
  diff: IS,
  major: NS,
  minor: OS,
  patch: MS,
  prerelease: kS,
  compare: US,
  rcompare: DS,
  compareLoose: PS,
  compareBuild: HS,
  sort: LS,
  rsort: xS,
  gt: qS,
  lt: BS,
  eq: zS,
  neq: GS,
  gte: KS,
  lte: FS,
  cmp: jS,
  coerce: YS,
  Comparator: QS,
  Range: VS,
  satisfies: $S,
  toComparators: XS,
  maxSatisfying: JS,
  minSatisfying: ZS,
  minVersion: WS,
  validRange: e0,
  outside: t0,
  gtr: n0,
  ltr: r0,
  intersects: i0,
  simplifyRange: o0,
  subset: a0,
  SemVer: SS,
  re: Ml.re,
  src: Ml.src,
  tokens: Ml.t,
  SEMVER_SPEC_VERSION: Yf.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Yf.RELEASE_TYPES,
  compareIdentifiers: Qf.compareIdentifiers,
  rcompareIdentifiers: Qf.rcompareIdentifiers
};
class ds extends Vf.SemVer {
  satisfies(e) {
    return Vf.satisfies(this, e);
  }
}
let s0 = class {
  constructor(e) {
    this.domain = e, this.level = 1;
  }
  _createMessage(e) {
    return [
      `%c FUSION FRAMEWORK %c ${this.domain} %c %s`,
      "background: rgb(179, 13, 47); color: white; padding: 1px;",
      "background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;",
      "background: none; color: inherit",
      ...e.reduce((n, r) => [...n, r, `
`], [])
    ];
  }
  debug(...e) {
    this.level > 3 && console.debug(...this._createMessage(e));
  }
  info(...e) {
    this.level > 2 && console.info(...this._createMessage(e));
  }
  warn(...e) {
    this.level > 1 && console.warn(...this._createMessage(e));
  }
  error(...e) {
    this.level > 0 && console.error(...this._createMessage(e));
  }
};
class Rv extends s0 {
  formatModuleName(e) {
    return `📦\x1B[1;32m${(typeof e == "string" ? e : e.name).replace(/([A-Z])/g, " $1").toUpperCase()}\x1B[0m`;
  }
}
var Nu = function(t, e) {
  return Nu = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Nu(t, e);
};
function Fn(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  Nu(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
var Xs = function() {
  return Xs = Object.assign || function(e) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n)
        Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
    }
    return e;
  }, Xs.apply(this, arguments);
};
function c0(t, e) {
  var n = {};
  for (var r in t)
    Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(t); i < r.length; i++)
      e.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[i]) && (n[r[i]] = t[r[i]]);
  return n;
}
function l0(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
}
function Iv(t, e) {
  var n = { label: 0, sent: function() {
    if (o[0] & 1)
      throw o[1];
    return o[1];
  }, trys: [], ops: [] }, r, i, o, a;
  return a = { next: s(0), throw: s(1), return: s(2) }, typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function s(l) {
    return function(u) {
      return c([l, u]);
    };
  }
  function c(l) {
    if (r)
      throw new TypeError("Generator is already executing.");
    for (; a && (a = 0, l[0] && (n = 0)), n; )
      try {
        if (r = 1, i && (o = l[0] & 2 ? i.return : l[0] ? i.throw || ((o = i.return) && o.call(i), 0) : i.next) && !(o = o.call(i, l[1])).done)
          return o;
        switch (i = 0, o && (l = [l[0] & 2, o.value]), l[0]) {
          case 0:
          case 1:
            o = l;
            break;
          case 4:
            return n.label++, { value: l[1], done: !1 };
          case 5:
            n.label++, i = l[1], l = [0];
            continue;
          case 7:
            l = n.ops.pop(), n.trys.pop();
            continue;
          default:
            if (o = n.trys, !(o = o.length > 0 && o[o.length - 1]) && (l[0] === 6 || l[0] === 2)) {
              n = 0;
              continue;
            }
            if (l[0] === 3 && (!o || l[1] > o[0] && l[1] < o[3])) {
              n.label = l[1];
              break;
            }
            if (l[0] === 6 && n.label < o[1]) {
              n.label = o[1], o = l;
              break;
            }
            if (o && n.label < o[2]) {
              n.label = o[2], n.ops.push(l);
              break;
            }
            o[2] && n.ops.pop(), n.trys.pop();
            continue;
        }
        l = e.call(t, n);
      } catch (u) {
        l = [6, u], i = 0;
      } finally {
        r = o = 0;
      }
    if (l[0] & 5)
      throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
function qr(t) {
  var e = typeof Symbol == "function" && Symbol.iterator, n = e && t[e], r = 0;
  if (n)
    return n.call(t);
  if (t && typeof t.length == "number")
    return {
      next: function() {
        return t && r >= t.length && (t = void 0), { value: t && t[r++], done: !t };
      }
    };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Js(t, e) {
  var n = typeof Symbol == "function" && t[Symbol.iterator];
  if (!n)
    return t;
  var r = n.call(t), i, o = [], a;
  try {
    for (; (e === void 0 || e-- > 0) && !(i = r.next()).done; )
      o.push(i.value);
  } catch (s) {
    a = { error: s };
  } finally {
    try {
      i && !i.done && (n = r.return) && n.call(r);
    } finally {
      if (a)
        throw a.error;
    }
  }
  return o;
}
function Zs(t, e, n) {
  if (n || arguments.length === 2)
    for (var r = 0, i = e.length, o; r < i; r++)
      (o || !(r in e)) && (o || (o = Array.prototype.slice.call(e, 0, r)), o[r] = e[r]);
  return t.concat(o || Array.prototype.slice.call(e));
}
function Oi(t) {
  return this instanceof Oi ? (this.v = t, this) : new Oi(t);
}
function u0(t, e, n) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(t, e || []), i, o = [];
  return i = {}, a("next"), a("throw"), a("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function a(h) {
    r[h] && (i[h] = function(f) {
      return new Promise(function(m, E) {
        o.push([h, f, m, E]) > 1 || s(h, f);
      });
    });
  }
  function s(h, f) {
    try {
      c(r[h](f));
    } catch (m) {
      d(o[0][3], m);
    }
  }
  function c(h) {
    h.value instanceof Oi ? Promise.resolve(h.value.v).then(l, u) : d(o[0][2], h);
  }
  function l(h) {
    s("next", h);
  }
  function u(h) {
    s("throw", h);
  }
  function d(h, f) {
    h(f), o.shift(), o.length && s(o[0][0], o[0][1]);
  }
}
function d0(t) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = t[Symbol.asyncIterator], n;
  return e ? e.call(t) : (t = typeof qr == "function" ? qr(t) : t[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(o) {
    n[o] = t[o] && function(a) {
      return new Promise(function(s, c) {
        a = t[o](a), i(s, c, a.done, a.value);
      });
    };
  }
  function i(o, a, s, c) {
    Promise.resolve(c).then(function(l) {
      o({ value: l, done: s });
    }, a);
  }
}
function Me(t) {
  return typeof t == "function";
}
function Lc(t) {
  var e = function(r) {
    Error.call(r), r.stack = new Error().stack;
  }, n = t(e);
  return n.prototype = Object.create(Error.prototype), n.prototype.constructor = n, n;
}
var kl = Lc(function(t) {
  return function(n) {
    t(this), this.message = n ? n.length + ` errors occurred during unsubscription:
` + n.map(function(r, i) {
      return i + 1 + ") " + r.toString();
    }).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = n;
  };
});
function Ws(t, e) {
  if (t) {
    var n = t.indexOf(e);
    0 <= n && t.splice(n, 1);
  }
}
var no = function() {
  function t(e) {
    this.initialTeardown = e, this.closed = !1, this._parentage = null, this._finalizers = null;
  }
  return t.prototype.unsubscribe = function() {
    var e, n, r, i, o;
    if (!this.closed) {
      this.closed = !0;
      var a = this._parentage;
      if (a)
        if (this._parentage = null, Array.isArray(a))
          try {
            for (var s = qr(a), c = s.next(); !c.done; c = s.next()) {
              var l = c.value;
              l.remove(this);
            }
          } catch (E) {
            e = { error: E };
          } finally {
            try {
              c && !c.done && (n = s.return) && n.call(s);
            } finally {
              if (e)
                throw e.error;
            }
          }
        else
          a.remove(this);
      var u = this.initialTeardown;
      if (Me(u))
        try {
          u();
        } catch (E) {
          o = E instanceof kl ? E.errors : [E];
        }
      var d = this._finalizers;
      if (d) {
        this._finalizers = null;
        try {
          for (var h = qr(d), f = h.next(); !f.done; f = h.next()) {
            var m = f.value;
            try {
              $f(m);
            } catch (E) {
              o = o ?? [], E instanceof kl ? o = Zs(Zs([], Js(o)), Js(E.errors)) : o.push(E);
            }
          }
        } catch (E) {
          r = { error: E };
        } finally {
          try {
            f && !f.done && (i = h.return) && i.call(h);
          } finally {
            if (r)
              throw r.error;
          }
        }
      }
      if (o)
        throw new kl(o);
    }
  }, t.prototype.add = function(e) {
    var n;
    if (e && e !== this)
      if (this.closed)
        $f(e);
      else {
        if (e instanceof t) {
          if (e.closed || e._hasParent(this))
            return;
          e._addParent(this);
        }
        (this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(e);
      }
  }, t.prototype._hasParent = function(e) {
    var n = this._parentage;
    return n === e || Array.isArray(n) && n.includes(e);
  }, t.prototype._addParent = function(e) {
    var n = this._parentage;
    this._parentage = Array.isArray(n) ? (n.push(e), n) : n ? [n, e] : e;
  }, t.prototype._removeParent = function(e) {
    var n = this._parentage;
    n === e ? this._parentage = null : Array.isArray(n) && Ws(n, e);
  }, t.prototype.remove = function(e) {
    var n = this._finalizers;
    n && Ws(n, e), e instanceof t && e._removeParent(this);
  }, t.EMPTY = function() {
    var e = new t();
    return e.closed = !0, e;
  }(), t;
}(), Nv = no.EMPTY;
function Ov(t) {
  return t instanceof no || t && "closed" in t && Me(t.remove) && Me(t.add) && Me(t.unsubscribe);
}
function $f(t) {
  Me(t) ? t() : t.unsubscribe();
}
var Mv = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1
}, kv = {
  setTimeout: function(t, e) {
    for (var n = [], r = 2; r < arguments.length; r++)
      n[r - 2] = arguments[r];
    return setTimeout.apply(void 0, Zs([t, e], Js(n)));
  },
  clearTimeout: function(t) {
    var e = kv.delegate;
    return ((e == null ? void 0 : e.clearTimeout) || clearTimeout)(t);
  },
  delegate: void 0
};
function Uv(t) {
  kv.setTimeout(function() {
    throw t;
  });
}
function Ou() {
}
function hs(t) {
  t();
}
var Wd = function(t) {
  Fn(e, t);
  function e(n) {
    var r = t.call(this) || this;
    return r.isStopped = !1, n ? (r.destination = n, Ov(n) && n.add(r)) : r.destination = g0, r;
  }
  return e.create = function(n, r, i) {
    return new ec(n, r, i);
  }, e.prototype.next = function(n) {
    this.isStopped || this._next(n);
  }, e.prototype.error = function(n) {
    this.isStopped || (this.isStopped = !0, this._error(n));
  }, e.prototype.complete = function() {
    this.isStopped || (this.isStopped = !0, this._complete());
  }, e.prototype.unsubscribe = function() {
    this.closed || (this.isStopped = !0, t.prototype.unsubscribe.call(this), this.destination = null);
  }, e.prototype._next = function(n) {
    this.destination.next(n);
  }, e.prototype._error = function(n) {
    try {
      this.destination.error(n);
    } finally {
      this.unsubscribe();
    }
  }, e.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }, e;
}(no), h0 = Function.prototype.bind;
function Ul(t, e) {
  return h0.call(t, e);
}
var f0 = function() {
  function t(e) {
    this.partialObserver = e;
  }
  return t.prototype.next = function(e) {
    var n = this.partialObserver;
    if (n.next)
      try {
        n.next(e);
      } catch (r) {
        Va(r);
      }
  }, t.prototype.error = function(e) {
    var n = this.partialObserver;
    if (n.error)
      try {
        n.error(e);
      } catch (r) {
        Va(r);
      }
    else
      Va(e);
  }, t.prototype.complete = function() {
    var e = this.partialObserver;
    if (e.complete)
      try {
        e.complete();
      } catch (n) {
        Va(n);
      }
  }, t;
}(), ec = function(t) {
  Fn(e, t);
  function e(n, r, i) {
    var o = t.call(this) || this, a;
    if (Me(n) || !n)
      a = {
        next: n ?? void 0,
        error: r ?? void 0,
        complete: i ?? void 0
      };
    else {
      var s;
      o && Mv.useDeprecatedNextContext ? (s = Object.create(n), s.unsubscribe = function() {
        return o.unsubscribe();
      }, a = {
        next: n.next && Ul(n.next, s),
        error: n.error && Ul(n.error, s),
        complete: n.complete && Ul(n.complete, s)
      }) : a = n;
    }
    return o.destination = new f0(a), o;
  }
  return e;
}(Wd);
function Va(t) {
  Uv(t);
}
function p0(t) {
  throw t;
}
var g0 = {
  closed: !0,
  next: Ou,
  error: p0,
  complete: Ou
}, eh = function() {
  return typeof Symbol == "function" && Symbol.observable || "@@observable";
}();
function th(t) {
  return t;
}
function m0(t) {
  return t.length === 0 ? th : t.length === 1 ? t[0] : function(n) {
    return t.reduce(function(r, i) {
      return i(r);
    }, n);
  };
}
var pt = function() {
  function t(e) {
    e && (this._subscribe = e);
  }
  return t.prototype.lift = function(e) {
    var n = new t();
    return n.source = this, n.operator = e, n;
  }, t.prototype.subscribe = function(e, n, r) {
    var i = this, o = y0(e) ? e : new ec(e, n, r);
    return hs(function() {
      var a = i, s = a.operator, c = a.source;
      o.add(s ? s.call(o, c) : c ? i._subscribe(o) : i._trySubscribe(o));
    }), o;
  }, t.prototype._trySubscribe = function(e) {
    try {
      return this._subscribe(e);
    } catch (n) {
      e.error(n);
    }
  }, t.prototype.forEach = function(e, n) {
    var r = this;
    return n = Xf(n), new n(function(i, o) {
      var a = new ec({
        next: function(s) {
          try {
            e(s);
          } catch (c) {
            o(c), a.unsubscribe();
          }
        },
        error: o,
        complete: i
      });
      r.subscribe(a);
    });
  }, t.prototype._subscribe = function(e) {
    var n;
    return (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(e);
  }, t.prototype[eh] = function() {
    return this;
  }, t.prototype.pipe = function() {
    for (var e = [], n = 0; n < arguments.length; n++)
      e[n] = arguments[n];
    return m0(e)(this);
  }, t.prototype.toPromise = function(e) {
    var n = this;
    return e = Xf(e), new e(function(r, i) {
      var o;
      n.subscribe(function(a) {
        return o = a;
      }, function(a) {
        return i(a);
      }, function() {
        return r(o);
      });
    });
  }, t.create = function(e) {
    return new t(e);
  }, t;
}();
function Xf(t) {
  var e;
  return (e = t ?? Mv.Promise) !== null && e !== void 0 ? e : Promise;
}
function v0(t) {
  return t && Me(t.next) && Me(t.error) && Me(t.complete);
}
function y0(t) {
  return t && t instanceof Wd || v0(t) && Ov(t);
}
function E0(t) {
  return Me(t == null ? void 0 : t.lift);
}
function vt(t) {
  return function(e) {
    if (E0(e))
      return e.lift(function(n) {
        try {
          return t(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function ct(t, e, n, r, i) {
  return new _0(t, e, n, r, i);
}
var _0 = function(t) {
  Fn(e, t);
  function e(n, r, i, o, a, s) {
    var c = t.call(this, n) || this;
    return c.onFinalize = a, c.shouldUnsubscribe = s, c._next = r ? function(l) {
      try {
        r(l);
      } catch (u) {
        n.error(u);
      }
    } : t.prototype._next, c._error = o ? function(l) {
      try {
        o(l);
      } catch (u) {
        n.error(u);
      } finally {
        this.unsubscribe();
      }
    } : t.prototype._error, c._complete = i ? function() {
      try {
        i();
      } catch (l) {
        n.error(l);
      } finally {
        this.unsubscribe();
      }
    } : t.prototype._complete, c;
  }
  return e.prototype.unsubscribe = function() {
    var n;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var r = this.closed;
      t.prototype.unsubscribe.call(this), !r && ((n = this.onFinalize) === null || n === void 0 || n.call(this));
    }
  }, e;
}(Wd), C0 = Lc(function(t) {
  return function() {
    t(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
  };
}), Mi = function(t) {
  Fn(e, t);
  function e() {
    var n = t.call(this) || this;
    return n.closed = !1, n.currentObservers = null, n.observers = [], n.isStopped = !1, n.hasError = !1, n.thrownError = null, n;
  }
  return e.prototype.lift = function(n) {
    var r = new Jf(this, this);
    return r.operator = n, r;
  }, e.prototype._throwIfClosed = function() {
    if (this.closed)
      throw new C0();
  }, e.prototype.next = function(n) {
    var r = this;
    hs(function() {
      var i, o;
      if (r._throwIfClosed(), !r.isStopped) {
        r.currentObservers || (r.currentObservers = Array.from(r.observers));
        try {
          for (var a = qr(r.currentObservers), s = a.next(); !s.done; s = a.next()) {
            var c = s.value;
            c.next(n);
          }
        } catch (l) {
          i = { error: l };
        } finally {
          try {
            s && !s.done && (o = a.return) && o.call(a);
          } finally {
            if (i)
              throw i.error;
          }
        }
      }
    });
  }, e.prototype.error = function(n) {
    var r = this;
    hs(function() {
      if (r._throwIfClosed(), !r.isStopped) {
        r.hasError = r.isStopped = !0, r.thrownError = n;
        for (var i = r.observers; i.length; )
          i.shift().error(n);
      }
    });
  }, e.prototype.complete = function() {
    var n = this;
    hs(function() {
      if (n._throwIfClosed(), !n.isStopped) {
        n.isStopped = !0;
        for (var r = n.observers; r.length; )
          r.shift().complete();
      }
    });
  }, e.prototype.unsubscribe = function() {
    this.isStopped = this.closed = !0, this.observers = this.currentObservers = null;
  }, Object.defineProperty(e.prototype, "observed", {
    get: function() {
      var n;
      return ((n = this.observers) === null || n === void 0 ? void 0 : n.length) > 0;
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype._trySubscribe = function(n) {
    return this._throwIfClosed(), t.prototype._trySubscribe.call(this, n);
  }, e.prototype._subscribe = function(n) {
    return this._throwIfClosed(), this._checkFinalizedStatuses(n), this._innerSubscribe(n);
  }, e.prototype._innerSubscribe = function(n) {
    var r = this, i = this, o = i.hasError, a = i.isStopped, s = i.observers;
    return o || a ? Nv : (this.currentObservers = null, s.push(n), new no(function() {
      r.currentObservers = null, Ws(s, n);
    }));
  }, e.prototype._checkFinalizedStatuses = function(n) {
    var r = this, i = r.hasError, o = r.thrownError, a = r.isStopped;
    i ? n.error(o) : a && n.complete();
  }, e.prototype.asObservable = function() {
    var n = new pt();
    return n.source = this, n;
  }, e.create = function(n, r) {
    return new Jf(n, r);
  }, e;
}(pt), Jf = function(t) {
  Fn(e, t);
  function e(n, r) {
    var i = t.call(this) || this;
    return i.destination = n, i.source = r, i;
  }
  return e.prototype.next = function(n) {
    var r, i;
    (i = (r = this.destination) === null || r === void 0 ? void 0 : r.next) === null || i === void 0 || i.call(r, n);
  }, e.prototype.error = function(n) {
    var r, i;
    (i = (r = this.destination) === null || r === void 0 ? void 0 : r.error) === null || i === void 0 || i.call(r, n);
  }, e.prototype.complete = function() {
    var n, r;
    (r = (n = this.destination) === null || n === void 0 ? void 0 : n.complete) === null || r === void 0 || r.call(n);
  }, e.prototype._subscribe = function(n) {
    var r, i;
    return (i = (r = this.source) === null || r === void 0 ? void 0 : r.subscribe(n)) !== null && i !== void 0 ? i : Nv;
  }, e;
}(Mi), T0 = function(t) {
  Fn(e, t);
  function e(n) {
    var r = t.call(this) || this;
    return r._value = n, r;
  }
  return Object.defineProperty(e.prototype, "value", {
    get: function() {
      return this.getValue();
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype._subscribe = function(n) {
    var r = t.prototype._subscribe.call(this, n);
    return !r.closed && n.next(this._value), r;
  }, e.prototype.getValue = function() {
    var n = this, r = n.hasError, i = n.thrownError, o = n._value;
    if (r)
      throw i;
    return this._throwIfClosed(), o;
  }, e.prototype.next = function(n) {
    t.prototype.next.call(this, this._value = n);
  }, e;
}(Mi), S0 = {
  now: function() {
    return Date.now();
  },
  delegate: void 0
}, w0 = function(t) {
  Fn(e, t);
  function e(n, r) {
    return t.call(this) || this;
  }
  return e.prototype.schedule = function(n, r) {
    return this;
  }, e;
}(no), Mu = {
  setInterval: function(t, e) {
    for (var n = [], r = 2; r < arguments.length; r++)
      n[r - 2] = arguments[r];
    return setInterval.apply(void 0, Zs([t, e], Js(n)));
  },
  clearInterval: function(t) {
    var e = Mu.delegate;
    return ((e == null ? void 0 : e.clearInterval) || clearInterval)(t);
  },
  delegate: void 0
}, A0 = function(t) {
  Fn(e, t);
  function e(n, r) {
    var i = t.call(this, n, r) || this;
    return i.scheduler = n, i.work = r, i.pending = !1, i;
  }
  return e.prototype.schedule = function(n, r) {
    var i;
    if (r === void 0 && (r = 0), this.closed)
      return this;
    this.state = n;
    var o = this.id, a = this.scheduler;
    return o != null && (this.id = this.recycleAsyncId(a, o, r)), this.pending = !0, this.delay = r, this.id = (i = this.id) !== null && i !== void 0 ? i : this.requestAsyncId(a, this.id, r), this;
  }, e.prototype.requestAsyncId = function(n, r, i) {
    return i === void 0 && (i = 0), Mu.setInterval(n.flush.bind(n, this), i);
  }, e.prototype.recycleAsyncId = function(n, r, i) {
    if (i === void 0 && (i = 0), i != null && this.delay === i && this.pending === !1)
      return r;
    r != null && Mu.clearInterval(r);
  }, e.prototype.execute = function(n, r) {
    if (this.closed)
      return new Error("executing a cancelled action");
    this.pending = !1;
    var i = this._execute(n, r);
    if (i)
      return i;
    this.pending === !1 && this.id != null && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
  }, e.prototype._execute = function(n, r) {
    var i = !1, o;
    try {
      this.work(n);
    } catch (a) {
      i = !0, o = a || new Error("Scheduled action threw falsy error");
    }
    if (i)
      return this.unsubscribe(), o;
  }, e.prototype.unsubscribe = function() {
    if (!this.closed) {
      var n = this, r = n.id, i = n.scheduler, o = i.actions;
      this.work = this.state = this.scheduler = null, this.pending = !1, Ws(o, this), r != null && (this.id = this.recycleAsyncId(i, r, null)), this.delay = null, t.prototype.unsubscribe.call(this);
    }
  }, e;
}(w0), Zf = function() {
  function t(e, n) {
    n === void 0 && (n = t.now), this.schedulerActionCtor = e, this.now = n;
  }
  return t.prototype.schedule = function(e, n, r) {
    return n === void 0 && (n = 0), new this.schedulerActionCtor(this, e).schedule(r, n);
  }, t.now = S0.now, t;
}(), b0 = function(t) {
  Fn(e, t);
  function e(n, r) {
    r === void 0 && (r = Zf.now);
    var i = t.call(this, n, r) || this;
    return i.actions = [], i._active = !1, i;
  }
  return e.prototype.flush = function(n) {
    var r = this.actions;
    if (this._active) {
      r.push(n);
      return;
    }
    var i;
    this._active = !0;
    do
      if (i = n.execute(n.state, n.delay))
        break;
    while (n = r.shift());
    if (this._active = !1, i) {
      for (; n = r.shift(); )
        n.unsubscribe();
      throw i;
    }
  }, e;
}(Zf), R0 = new b0(A0), Dv = new pt(function(t) {
  return t.complete();
});
function I0(t) {
  return t && Me(t.schedule);
}
function N0(t) {
  return t[t.length - 1];
}
function O0(t) {
  return I0(N0(t)) ? t.pop() : void 0;
}
var Pv = function(t) {
  return t && typeof t.length == "number" && typeof t != "function";
};
function Hv(t) {
  return Me(t == null ? void 0 : t.then);
}
function Lv(t) {
  return Me(t[eh]);
}
function xv(t) {
  return Symbol.asyncIterator && Me(t == null ? void 0 : t[Symbol.asyncIterator]);
}
function qv(t) {
  return new TypeError("You provided " + (t !== null && typeof t == "object" ? "an invalid object" : "'" + t + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
function M0() {
  return typeof Symbol != "function" || !Symbol.iterator ? "@@iterator" : Symbol.iterator;
}
var Bv = M0();
function zv(t) {
  return Me(t == null ? void 0 : t[Bv]);
}
function Gv(t) {
  return u0(this, arguments, function() {
    var n, r, i, o;
    return Iv(this, function(a) {
      switch (a.label) {
        case 0:
          n = t.getReader(), a.label = 1;
        case 1:
          a.trys.push([1, , 9, 10]), a.label = 2;
        case 2:
          return [4, Oi(n.read())];
        case 3:
          return r = a.sent(), i = r.value, o = r.done, o ? [4, Oi(void 0)] : [3, 5];
        case 4:
          return [2, a.sent()];
        case 5:
          return [4, Oi(i)];
        case 6:
          return [4, a.sent()];
        case 7:
          return a.sent(), [3, 2];
        case 8:
          return [3, 10];
        case 9:
          return n.releaseLock(), [7];
        case 10:
          return [2];
      }
    });
  });
}
function Kv(t) {
  return Me(t == null ? void 0 : t.getReader);
}
function yn(t) {
  if (t instanceof pt)
    return t;
  if (t != null) {
    if (Lv(t))
      return k0(t);
    if (Pv(t))
      return U0(t);
    if (Hv(t))
      return D0(t);
    if (xv(t))
      return Fv(t);
    if (zv(t))
      return P0(t);
    if (Kv(t))
      return H0(t);
  }
  throw qv(t);
}
function k0(t) {
  return new pt(function(e) {
    var n = t[eh]();
    if (Me(n.subscribe))
      return n.subscribe(e);
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function U0(t) {
  return new pt(function(e) {
    for (var n = 0; n < t.length && !e.closed; n++)
      e.next(t[n]);
    e.complete();
  });
}
function D0(t) {
  return new pt(function(e) {
    t.then(function(n) {
      e.closed || (e.next(n), e.complete());
    }, function(n) {
      return e.error(n);
    }).then(null, Uv);
  });
}
function P0(t) {
  return new pt(function(e) {
    var n, r;
    try {
      for (var i = qr(t), o = i.next(); !o.done; o = i.next()) {
        var a = o.value;
        if (e.next(a), e.closed)
          return;
      }
    } catch (s) {
      n = { error: s };
    } finally {
      try {
        o && !o.done && (r = i.return) && r.call(i);
      } finally {
        if (n)
          throw n.error;
      }
    }
    e.complete();
  });
}
function Fv(t) {
  return new pt(function(e) {
    L0(t, e).catch(function(n) {
      return e.error(n);
    });
  });
}
function H0(t) {
  return Fv(Gv(t));
}
function L0(t, e) {
  var n, r, i, o;
  return l0(this, void 0, void 0, function() {
    var a, s;
    return Iv(this, function(c) {
      switch (c.label) {
        case 0:
          c.trys.push([0, 5, 6, 11]), n = d0(t), c.label = 1;
        case 1:
          return [4, n.next()];
        case 2:
          if (r = c.sent(), !!r.done)
            return [3, 4];
          if (a = r.value, e.next(a), e.closed)
            return [2];
          c.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          return s = c.sent(), i = { error: s }, [3, 11];
        case 6:
          return c.trys.push([6, , 9, 10]), r && !r.done && (o = n.return) ? [4, o.call(n)] : [3, 8];
        case 7:
          c.sent(), c.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (i)
            throw i.error;
          return [7];
        case 10:
          return [7];
        case 11:
          return e.complete(), [2];
      }
    });
  });
}
function dr(t, e, n, r, i) {
  r === void 0 && (r = 0), i === void 0 && (i = !1);
  var o = e.schedule(function() {
    n(), i ? t.add(this.schedule(null, r)) : this.unsubscribe();
  }, r);
  if (t.add(o), !i)
    return o;
}
function jv(t, e) {
  return e === void 0 && (e = 0), vt(function(n, r) {
    n.subscribe(ct(r, function(i) {
      return dr(r, t, function() {
        return r.next(i);
      }, e);
    }, function() {
      return dr(r, t, function() {
        return r.complete();
      }, e);
    }, function(i) {
      return dr(r, t, function() {
        return r.error(i);
      }, e);
    }));
  });
}
function Yv(t, e) {
  return e === void 0 && (e = 0), vt(function(n, r) {
    r.add(t.schedule(function() {
      return n.subscribe(r);
    }, e));
  });
}
function x0(t, e) {
  return yn(t).pipe(Yv(e), jv(e));
}
function q0(t, e) {
  return yn(t).pipe(Yv(e), jv(e));
}
function B0(t, e) {
  return new pt(function(n) {
    var r = 0;
    return e.schedule(function() {
      r === t.length ? n.complete() : (n.next(t[r++]), n.closed || this.schedule());
    });
  });
}
function z0(t, e) {
  return new pt(function(n) {
    var r;
    return dr(n, e, function() {
      r = t[Bv](), dr(n, e, function() {
        var i, o, a;
        try {
          i = r.next(), o = i.value, a = i.done;
        } catch (s) {
          n.error(s);
          return;
        }
        a ? n.complete() : n.next(o);
      }, 0, !0);
    }), function() {
      return Me(r == null ? void 0 : r.return) && r.return();
    };
  });
}
function Qv(t, e) {
  if (!t)
    throw new Error("Iterable cannot be null");
  return new pt(function(n) {
    dr(n, e, function() {
      var r = t[Symbol.asyncIterator]();
      dr(n, e, function() {
        r.next().then(function(i) {
          i.done ? n.complete() : n.next(i.value);
        });
      }, 0, !0);
    });
  });
}
function G0(t, e) {
  return Qv(Gv(t), e);
}
function K0(t, e) {
  if (t != null) {
    if (Lv(t))
      return x0(t, e);
    if (Pv(t))
      return B0(t, e);
    if (Hv(t))
      return q0(t, e);
    if (xv(t))
      return Qv(t, e);
    if (zv(t))
      return z0(t, e);
    if (Kv(t))
      return G0(t, e);
  }
  throw qv(t);
}
function Tr(t, e) {
  return e ? K0(t, e) : yn(t);
}
function ku() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  var n = O0(t);
  return Tr(t, n);
}
function F0(t, e) {
  var n = Me(t) ? t : function() {
    return t;
  }, r = function(i) {
    return i.error(n());
  };
  return new pt(r);
}
var xc = Lc(function(t) {
  return function() {
    t(this), this.name = "EmptyError", this.message = "no elements in sequence";
  };
});
function Dl(t, e) {
  return new Promise(function(n, r) {
    var i = !1, o;
    t.subscribe({
      next: function(a) {
        o = a, i = !0;
      },
      error: r,
      complete: function() {
        i ? n(o) : r(new xc());
      }
    });
  });
}
function fs(t, e) {
  return new Promise(function(n, r) {
    var i = new ec({
      next: function(o) {
        n(o), i.unsubscribe();
      },
      error: r,
      complete: function() {
        r(new xc());
      }
    });
    t.subscribe(i);
  });
}
function j0(t) {
  return t instanceof Date && !isNaN(t);
}
var Y0 = Lc(function(t) {
  return function(n) {
    n === void 0 && (n = null), t(this), this.message = "Timeout has occurred", this.name = "TimeoutError", this.info = n;
  };
});
function Q0(t, e) {
  var n = j0(t) ? { first: t } : typeof t == "number" ? { each: t } : t, r = n.first, i = n.each, o = n.with, a = o === void 0 ? V0 : o, s = n.scheduler, c = s === void 0 ? R0 : s, l = n.meta, u = l === void 0 ? null : l;
  if (r == null && i == null)
    throw new TypeError("No timeout provided.");
  return vt(function(d, h) {
    var f, m, E = null, N = 0, g = function(p) {
      m = dr(h, c, function() {
        try {
          f.unsubscribe(), yn(a({
            meta: u,
            lastValue: E,
            seen: N
          })).subscribe(h);
        } catch (v) {
          h.error(v);
        }
      }, p);
    };
    f = d.subscribe(ct(h, function(p) {
      m == null || m.unsubscribe(), N++, h.next(E = p), i > 0 && g(i);
    }, void 0, void 0, function() {
      m != null && m.closed || m == null || m.unsubscribe(), E = null;
    })), !N && g(r != null ? typeof r == "number" ? r : +r - c.now() : i);
  });
}
function V0(t) {
  throw new Y0(t);
}
function Uu(t, e) {
  return vt(function(n, r) {
    var i = 0;
    n.subscribe(ct(r, function(o) {
      r.next(t.call(e, o, i++));
    }));
  });
}
function Vv(t, e, n, r, i, o, a, s) {
  var c = [], l = 0, u = 0, d = !1, h = function() {
    d && !c.length && !l && e.complete();
  }, f = function(E) {
    return l < r ? m(E) : c.push(E);
  }, m = function(E) {
    o && e.next(E), l++;
    var N = !1;
    yn(n(E, u++)).subscribe(ct(e, function(g) {
      i == null || i(g), o ? f(g) : e.next(g);
    }, function() {
      N = !0;
    }, void 0, function() {
      if (N)
        try {
          l--;
          for (var g = function() {
            var p = c.shift();
            a || m(p);
          }; c.length && l < r; )
            g();
          h();
        } catch (p) {
          e.error(p);
        }
    }));
  };
  return t.subscribe(ct(e, f, function() {
    d = !0, h();
  })), function() {
    s == null || s();
  };
}
function ps(t, e, n) {
  return n === void 0 && (n = 1 / 0), Me(e) ? ps(function(r, i) {
    return Uu(function(o, a) {
      return e(r, o, i, a);
    })(yn(t(r, i)));
  }, n) : (typeof e == "number" && (n = e), vt(function(r, i) {
    return Vv(r, i, t, n);
  }));
}
function Wf(t, e) {
  return vt(function(n, r) {
    var i = 0;
    n.subscribe(ct(r, function(o) {
      return t.call(e, o, i++) && r.next(o);
    }));
  });
}
function $v(t) {
  return vt(function(e, n) {
    var r = null, i = !1, o;
    r = e.subscribe(ct(n, void 0, void 0, function(a) {
      o = yn(t(a, $v(t)(e))), r ? (r.unsubscribe(), r = null, o.subscribe(n)) : i = !0;
    })), i && (r.unsubscribe(), r = null, o.subscribe(n));
  });
}
function $0(t, e, n, r, i) {
  return function(o, a) {
    var s = n, c = e, l = 0;
    o.subscribe(ct(a, function(u) {
      var d = l++;
      c = s ? t(c, u, d) : (s = !0, u), a.next(c);
    }, i));
  };
}
function X0(t) {
  return vt(function(e, n) {
    var r = !1;
    e.subscribe(ct(n, function(i) {
      r = !0, n.next(i);
    }, function() {
      r || n.next(t), n.complete();
    }));
  });
}
function J0(t) {
  return t === void 0 && (t = Z0), vt(function(e, n) {
    var r = !1;
    e.subscribe(ct(n, function(i) {
      r = !0, n.next(i);
    }, function() {
      return r ? n.complete() : n.error(t());
    }));
  });
}
function Z0() {
  return new xc();
}
function W0(t) {
  return t <= 0 ? function() {
    return Dv;
  } : vt(function(e, n) {
    var r = [];
    e.subscribe(ct(n, function(i) {
      r.push(i), t < r.length && r.shift();
    }, function() {
      var i, o;
      try {
        for (var a = qr(r), s = a.next(); !s.done; s = a.next()) {
          var c = s.value;
          n.next(c);
        }
      } catch (l) {
        i = { error: l };
      } finally {
        try {
          s && !s.done && (o = a.return) && o.call(a);
        } finally {
          if (i)
            throw i.error;
        }
      }
      n.complete();
    }, void 0, function() {
      r = null;
    }));
  });
}
function ew(t, e) {
  var n = arguments.length >= 2;
  return function(r) {
    return r.pipe(th, W0(1), n ? X0(e) : J0(function() {
      return new xc();
    }));
  };
}
function tw(t, e, n) {
  return vt(function(r, i) {
    var o = e;
    return Vv(r, i, function(a, s) {
      return t(o, a, s);
    }, n, function(a) {
      o = a;
    }, !1, void 0, function() {
      return o = null;
    });
  });
}
function nw(t, e) {
  return vt($0(t, e, arguments.length >= 2, !0));
}
function $a(t, e) {
  return vt(function(n, r) {
    var i = null, o = 0, a = !1, s = function() {
      return a && !i && r.complete();
    };
    n.subscribe(ct(r, function(c) {
      i == null || i.unsubscribe();
      var l = 0, u = o++;
      yn(t(c, u)).subscribe(i = ct(r, function(d) {
        return r.next(e ? e(c, d, u, l++) : d);
      }, function() {
        i = null, s();
      }));
    }, function() {
      a = !0, s();
    }));
  });
}
function rw(t) {
  return vt(function(e, n) {
    yn(t).subscribe(ct(n, function() {
      return n.complete();
    }, Ou)), !n.closed && e.subscribe(n);
  });
}
function tc(t, e, n) {
  var r = Me(t) || e || n ? { next: t, error: e, complete: n } : t;
  return r ? vt(function(i, o) {
    var a;
    (a = r.subscribe) === null || a === void 0 || a.call(r);
    var s = !0;
    i.subscribe(ct(o, function(c) {
      var l;
      (l = r.next) === null || l === void 0 || l.call(r, c), o.next(c);
    }, function() {
      var c;
      s = !1, (c = r.complete) === null || c === void 0 || c.call(r), o.complete();
    }, function(c) {
      var l;
      s = !1, (l = r.error) === null || l === void 0 || l.call(r, c), o.error(c);
    }, function() {
      var c, l;
      s && ((c = r.unsubscribe) === null || c === void 0 || c.call(r)), (l = r.finalize) === null || l === void 0 || l.call(r);
    }));
  }) : th;
}
var Xa = function(t, e, n, r) {
  if (n === "a" && !r)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? t !== e || !r : !e.has(t))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(t) : r ? r.value : e.get(t);
}, ep = function(t, e, n, r, i) {
  if (r === "m")
    throw new TypeError("Private method is not writable");
  if (r === "a" && !i)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof e == "function" ? t !== e || !i : !e.has(t))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(t, n) : i ? i.value = n : e.set(t, n), n;
}, gs, ni;
class iw {
  get version() {
    return Xa(this, gs, "f");
  }
  constructor(e) {
    gs.set(this, void 0), ni.set(this, void 0);
    const { version: n } = e;
    ep(this, gs, new ds(n), "f"), ep(this, ni, new no(), "f");
  }
  _addTeardown(e) {
    return Xa(this, ni, "f").add(e), () => Xa(this, ni, "f").remove(e);
  }
  dispose() {
    Xa(this, ni, "f").unsubscribe();
  }
}
gs = /* @__PURE__ */ new WeakMap(), ni = /* @__PURE__ */ new WeakMap();
var Sn = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
class ow extends Error {
  constructor() {
    super("It was too slow"), this.name = "RequiredModuleTimeoutError";
  }
}
class aw {
  constructor(e) {
    this.logger = new Rv("ModulesConfigurator"), this._configs = [], this._afterConfiguration = [], this._afterInit = [], this._modules = new Set(e);
  }
  get modules() {
    return [...this._modules];
  }
  configure(...e) {
    e.forEach((n) => this.addConfig(n));
  }
  addConfig(e) {
    const { module: n, afterConfig: r, afterInit: i, configure: o } = e;
    this._modules.add(n), o && this._configs.push((a, s) => o(a[n.name], s)), r && this._afterConfiguration.push((a) => r(a[n.name])), i && this._afterInit.push((a) => i(a[n.name]));
  }
  onConfigured(e) {
    this._afterConfiguration.push(e);
  }
  onInitialized(e) {
    this._afterInit.push(e);
  }
  initialize(e) {
    return Sn(this, void 0, void 0, function* () {
      const n = yield this._configure(e), r = yield this._initialize(n, e);
      return yield this._postInitialize(r, e), Object.seal(Object.assign({}, r, {
        dispose: () => this.dispose(r)
      }));
    });
  }
  _configure(e) {
    return Sn(this, void 0, void 0, function* () {
      const n = yield this._createConfig(e);
      return yield Promise.all(this._configs.map((r) => Promise.resolve(r(n, e)))), yield this._postConfigure(n), n;
    });
  }
  _createConfig(e) {
    const { modules: n, logger: r, _afterConfiguration: i, _afterInit: o } = this, a = Tr(n).pipe(ps((s) => Sn(this, void 0, void 0, function* () {
      var c;
      r.debug(`🛠 creating configurator ${r.formatModuleName(s)}`);
      try {
        const l = yield (c = s.configure) === null || c === void 0 ? void 0 : c.call(s, e);
        return r.debug(`🛠 created configurator for ${r.formatModuleName(s)}`, l), { [s.name]: l };
      } catch (l) {
        throw r.error(`🛠 Failed to created configurator for ${r.formatModuleName(s)}`, l), l;
      }
    })), nw((s, c) => Object.assign(s, c), {
      onAfterConfiguration(s) {
        i.push(s);
      },
      onAfterInit(s) {
        o.push(s);
      }
    }));
    return Dl(a);
  }
  _postConfigure(e) {
    return Sn(this, void 0, void 0, function* () {
      const { modules: n, logger: r, _afterConfiguration: i } = this;
      if (yield Promise.allSettled(n.filter((o) => !!o.postConfigure).map((o) => Sn(this, void 0, void 0, function* () {
        var a;
        try {
          yield (a = o.postConfigure) === null || a === void 0 ? void 0 : a.call(o, e), r.debug(`🏗📌 post configured ${r.formatModuleName(o)}`, o);
        } catch {
          r.warn(`🏗📌 post configure failed ${r.formatModuleName(o)}`);
        }
      }))), i.length)
        try {
          r.debug(`🏗📌 post configure hooks [${i.length}]`), yield Promise.allSettled(i.map((o) => Promise.resolve(o(e)))), r.debug("🏗📌 post configure hooks complete");
        } catch (o) {
          r.warn("🏗📌 post configure hook failed", o);
        }
    });
  }
  _initialize(e, n) {
    return Sn(this, void 0, void 0, function* () {
      const { modules: r, logger: i } = this, o = r.map((u) => u.name), a = new T0({}), s = (u) => o.includes(u), c = (u, d = 60) => {
        if (!o.includes(u))
          throw i.error(`🚀⌛️ Cannot not require ${i.formatModuleName(String(u))} since module is not defined!`), Error(`cannot not require [${String(u)}] since module is not defined!`);
        return a.value[u] ? (i.debug(`🚀⌛️ ${i.formatModuleName(String(u))} is initiated, skipping queue`), Promise.resolve(a.value[u])) : (i.debug(`🚀⌛️ Awaiting init ${i.formatModuleName(String(u))}, timeout ${d}s`), fs(a.pipe(Wf((h) => !!h[u]), Uu((h) => h[u]), Q0({
          each: d * 1e3,
          with: () => F0(() => new ow())
        }))));
      };
      Tr(r).pipe(ps((u) => {
        const d = u.name;
        return i.debug(`🚀 initializing ${i.formatModuleName(u)}`), Tr(Promise.resolve(u.initialize({
          ref: n,
          config: e[d],
          requireInstance: c,
          hasModule: s
        }))).pipe(Uu((h) => {
          var f;
          if (!(h instanceof iw) && !(h.version instanceof ds)) {
            i.debug("🤷 module does not extends the [BaseModuleProvider] or exposes [SemanticVersion]");
            try {
              h.version = u.version instanceof ds ? u.version : new ds((f = u.version) !== null && f !== void 0 ? f : "0.0.0-unknown");
            } catch {
              i.error("🚨 failed to set module version");
            }
          }
          return i.debug(`🚀 initialized ${i.formatModuleName(u)}`), [d, h];
        }));
      })).subscribe({
        next: ([u, d]) => {
          a.next(Object.assign(a.value, { [u]: d }));
        },
        complete: () => a.complete()
      });
      const l = yield Dl(a);
      return Object.seal(l), l;
    });
  }
  _postInitialize(e, n) {
    return Sn(this, void 0, void 0, function* () {
      const { modules: r, logger: i, _afterInit: o } = this, a = Tr(r).pipe(Wf((s) => !!s.postInitialize), tc((s) => i.debug(`🚀📌 post initializing moule ${i.formatModuleName(s)}`)), ps((s) => Tr(s.postInitialize({
        ref: n,
        modules: e,
        instance: e[s.name]
      })).pipe(tc(() => {
        i.debug(`🚀📌 post initialized moule ${i.formatModuleName(s)}`);
      }), $v((c) => (i.warn(`🚀📌 post initialize failed moule ${i.formatModuleName(s)}`, c), Dv)))));
      if (yield Dl(a), o.length)
        try {
          i.debug(`🚀📌 post configure hooks [${o.length}]`), yield Promise.allSettled(o.map((s) => Promise.resolve(s(e)))), i.debug("🚀📌 post configure hooks complete");
        } catch (s) {
          i.warn("🚀📌 post configure hook failed", s);
        }
      i.debug(`🎉 Modules initialized ${r.map(i.formatModuleName)}`, e), i.info("🟢 Modules initialized");
    });
  }
  dispose(e, n) {
    return Sn(this, void 0, void 0, function* () {
      const { modules: r } = this;
      yield Promise.allSettled(r.filter((i) => !!i.dispose).map((i) => Sn(this, void 0, void 0, function* () {
        var o;
        yield (o = i.dispose) === null || o === void 0 ? void 0 : o.call(i, {
          ref: n,
          modules: e,
          instance: e[i.name]
        });
      })));
    });
  }
}
const sw = zr.createContext({}), cw = sw.Provider;
var Jr = function(t, e, n, r, i) {
  if (r === "m")
    throw new TypeError("Private method is not writable");
  if (r === "a" && !i)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof e == "function" ? t !== e || !i : !e.has(t))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return r === "a" ? i.call(t, n) : i ? i.value = n : e.set(t, n), n;
}, mr = function(t, e, n, r) {
  if (n === "a" && !r)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? t !== e || !r : !e.has(t))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return n === "m" ? r : n === "a" ? r.call(t) : r ? r.value : e.get(t);
}, ms, vs, So, ys, wo, Du;
class lw {
  constructor(e, n) {
    this.__type = e, ms.set(this, void 0), vs.set(this, void 0), So.set(this, !1), ys.set(this, void 0), wo.set(this, void 0), Du.set(this, Date.now()), Jr(this, ms, n.detail, "f"), Jr(this, vs, n.source, "f"), Jr(this, ys, !!n.cancelable, "f"), Jr(this, wo, n.canBubble === void 0 ? !0 : n.canBubble, "f");
  }
  get bubbles() {
    return mr(this, wo, "f") && !mr(this, So, "f");
  }
  get created() {
    return mr(this, Du, "f");
  }
  get cancelable() {
    return mr(this, ys, "f");
  }
  get canceled() {
    return mr(this, So, "f");
  }
  get detail() {
    return mr(this, ms, "f");
  }
  get source() {
    return mr(this, vs, "f");
  }
  get type() {
    return this.__type;
  }
  preventDefault() {
    this.cancelable && Jr(this, So, !0, "f");
  }
  stopPropagation() {
    Jr(this, wo, !1, "f");
  }
}
ms = /* @__PURE__ */ new WeakMap(), vs = /* @__PURE__ */ new WeakMap(), So = /* @__PURE__ */ new WeakMap(), ys = /* @__PURE__ */ new WeakMap(), wo = /* @__PURE__ */ new WeakMap(), Du = /* @__PURE__ */ new WeakMap();
var uw = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
class dw {
  constructor({ onDispatch: e, onBubble: n }) {
    this.__onDispatch = e, this.__onBubble = n;
  }
  dispatch(e, n) {
    return uw(this, void 0, void 0, function* () {
      var r, i;
      try {
        yield (r = this.__onDispatch) === null || r === void 0 ? void 0 : r.call(this, e);
      } catch (a) {
        throw a;
      }
      const o = e;
      if (!o.dispatcher)
        o.dispatcher = this;
      else if (o.dispatcher === this)
        throw Error("loop detected");
      for (const a of n)
        e.cancelable ? e.canceled || (yield Promise.resolve(a(e))) : a(e);
      if (e.bubbles)
        try {
          yield (i = this.__onBubble) === null || i === void 0 ? void 0 : i.call(this, e);
        } catch (a) {
          throw a;
        }
    });
  }
}
var tp = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
class hw extends pt {
  get event$() {
    return this.__event$.asObservable();
  }
  get closed() {
    return this.__event$.closed;
  }
  constructor(e) {
    super((n) => {
      this.__event$.subscribe(n);
    }), this.__listeners = [], this.__event$ = new Mi(), this.__dispatcher = new dw({
      onDispatch: e.onDispatch,
      onBubble: e.onBubble
    });
  }
  addEventListener(e, n) {
    if (this.closed)
      throw Error("Cannot listen to events when provider is closed!");
    const r = { type: e, handler: n };
    return this.__listeners.push(r), () => {
      const i = this.__listeners.indexOf(r);
      0 <= i && this.__listeners.splice(i, 1);
    };
  }
  dispatchEvent(e, n) {
    return tp(this, void 0, void 0, function* () {
      if (typeof e == "string") {
        if (!n)
          throw Error("invalid arguments, missing [FrameworkEventInit]");
        return this._dispatchEvent(new lw(e, n));
      } else
        return this._dispatchEvent(e);
    });
  }
  _dispatchEvent(e) {
    return tp(this, void 0, void 0, function* () {
      if (this.closed)
        throw Error("Cannot dispatch events when provider is closed!");
      this.__event$.next(e);
      try {
        const n = this.__listeners.filter((r) => r.type === e.type).map(({ handler: r }) => r);
        yield this.__dispatcher.dispatch(e, n);
      } catch (n) {
        throw n;
      }
      return e;
    });
  }
  dispose() {
    this.__listeners = [], this.__event$.complete();
  }
}
var np = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const fw = "event", pw = {
  name: fw,
  configure: (t) => {
    const e = {}, n = t == null ? void 0 : t.event;
    return n && (e.onBubble = (r) => np(void 0, void 0, void 0, function* () {
      yield n.dispatchEvent(r);
    })), e;
  },
  initialize: ({ config: t }) => new hw(t),
  postInitialize: (t) => np(void 0, [t], void 0, function* ({ instance: e, modules: n }) {
    e.dispatchEvent("onModulesLoaded", { detail: n, source: e });
  }),
  dispose({ instance: t }) {
    t.dispose();
  }
};
class Xv {
  get operators() {
    return this._operators;
  }
  constructor(e) {
    e && "operators" in e ? this._operators = Object.assign({}, e.operators) : this._operators = e ?? {};
  }
  add(e, n) {
    if (Object.keys(this._operators).includes(e))
      throw Error(`Operator [${e}] already defined`);
    return this.set(e, n);
  }
  set(e, n) {
    return this._operators[e] = n, this;
  }
  get(e) {
    return this._operators[e];
  }
  process(e) {
    return Object.values(this._operators).length ? Tr(Object.values(this._operators)).pipe(tw((r, i) => Promise.resolve(i(r)).then((o) => o ?? r), e, 1), ew()) : ku(e);
  }
}
const gw = (t, e) => (n) => {
  const r = new Headers(n.headers);
  return r.append(t, e), Object.assign(Object.assign({}, n), { headers: r });
};
class Jv extends Xv {
  setHeader(e, n) {
    const r = gw(e, n);
    return this.set("header-" + e, r);
  }
}
class mw extends Xv {
}
class vw {
  get clients() {
    return Object.assign({}, this._clients);
  }
  constructor(e) {
    this._clients = {}, this.defaultHttpRequestHandler = new Jv(), this.defaultHttpClientCtor = e;
  }
  hasClient(e) {
    return Object.keys(this._clients).includes(e);
  }
  configureClient(e, n) {
    const r = typeof n == "string" ? (o) => o.uri = String(n) : n, i = typeof r == "function" ? { onCreate: r } : r;
    return this._clients[e] = Object.assign(Object.assign({}, this._clients[e]), i), this;
  }
}
class yw extends Error {
  constructor(e) {
    super(e);
  }
}
const Ew = (t) => new RegExp("^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$", "i").test(t);
class _w {
  get defaultHttpRequestHandler() {
    return this.config.defaultHttpRequestHandler;
  }
  constructor(e) {
    this.config = e;
  }
  hasClient(e) {
    return Object.keys(this.config.clients).includes(e);
  }
  createClient(e) {
    const n = this._resolveConfig(e), { baseUri: r, defaultScopes: i = [], onCreate: o, ctor: a = this.config.defaultHttpClientCtor, requestHandler: s = this.defaultHttpRequestHandler } = n, c = { requestHandler: s }, l = new a(r || "", c);
    return Object.assign(l, { defaultScopes: i }), o && o(l), l;
  }
  createCustomClient(e) {
    return this.createClient(e);
  }
  _resolveConfig(e) {
    if (typeof e == "string") {
      const n = this.config.clients[e];
      if (!n && Ew(e))
        return { baseUri: e };
      if (!n)
        throw new yw(`No registered http client for key [${e}]`);
      return n;
    }
    return e;
  }
}
function Cw(t, e) {
  e === void 0 && (e = {});
  var n = e.selector, r = c0(e, ["selector"]);
  return new pt(function(i) {
    var o = new AbortController(), a = o.signal, s = !0, c = r.signal;
    if (c)
      if (c.aborted)
        o.abort();
      else {
        var l = function() {
          a.aborted || o.abort();
        };
        c.addEventListener("abort", l), i.add(function() {
          return c.removeEventListener("abort", l);
        });
      }
    var u = Xs(Xs({}, r), { signal: a }), d = function(h) {
      s = !1, i.error(h);
    };
    return fetch(t, u).then(function(h) {
      n ? yn(n(h)).subscribe(ct(i, void 0, function() {
        s = !1, i.complete();
      }, d)) : (s = !1, i.next(h), i.complete());
    }).catch(d), function() {
      s && o.abort();
    };
  });
}
class nh extends Error {
  constructor(e, n, r) {
    super(e, r), this.response = n;
  }
}
nh.Name = "HttpResponseError";
class da extends nh {
  constructor(e, n, r) {
    super(e, n, r), this.name = da.Name, this.data = r == null ? void 0 : r.data;
  }
}
da.Name = "HttpJsonResponseError";
var Tw = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const Sw = (t) => Tw(void 0, void 0, void 0, function* () {
  if (t.status === 204)
    return Promise.resolve();
  try {
    const e = yield t.json();
    if (!t.ok)
      throw new da("network response was not OK", t, { data: e });
    return e;
  } catch (e) {
    throw new da("failed to parse response", t, { cause: e });
  }
}), ww = (t) => {
  if (!t.ok)
    throw new Error("network response was not OK");
  if (t.status === 204)
    throw new Error("no content");
  try {
    return t.blob();
  } catch {
    throw Error("failed to parse response");
  }
};
var rp = function(t, e) {
  var n = {};
  for (var r in t)
    Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(t); i < r.length; i++)
      e.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[i]) && (n[r[i]] = t[r[i]]);
  return n;
};
class Aw {
  get request$() {
    return this._request$.asObservable();
  }
  get response$() {
    return this._response$.asObservable();
  }
  constructor(e, n) {
    this.uri = e, this._request$ = new Mi(), this._response$ = new Mi(), this._abort$ = new Mi(), this.requestHandler = new Jv(n == null ? void 0 : n.requestHandler), this.responseHandler = new mw(n == null ? void 0 : n.responseHandler), this._init();
  }
  _init() {
  }
  fetch$(e, n) {
    return this._fetch$(e, n);
  }
  fetch(e, n) {
    return fs(this.fetch$(e, n));
  }
  fetchAsync(e, n) {
    return this.fetch(e, n);
  }
  json$(e, n) {
    var r;
    const i = typeof (n == null ? void 0 : n.body) == "object" ? JSON.stringify(n == null ? void 0 : n.body) : n == null ? void 0 : n.body, o = (r = n == null ? void 0 : n.selector) !== null && r !== void 0 ? r : Sw, a = new Headers(n == null ? void 0 : n.headers);
    return a.append("Accept", "application/json"), a.append("Content-Type", "application/json"), this.fetch$(e, Object.assign(Object.assign({}, n), {
      body: i,
      selector: o,
      headers: a
    }));
  }
  json(e, n) {
    return fs(this.json$(e, n));
  }
  blob$(e, n) {
    var r;
    const i = (r = n == null ? void 0 : n.selector) !== null && r !== void 0 ? r : ww;
    return this.fetch$(e, Object.assign(Object.assign({}, n), { selector: i }));
  }
  blob(e, n) {
    return fs(this.blob$(e, n));
  }
  jsonAsync(e, n) {
    return this.json(e, n);
  }
  execute(e, n, r) {
    return this[e](n, r);
  }
  abort() {
    this._abort$.next();
  }
  _fetch$(e, n) {
    const r = n || {}, { selector: i } = r, o = rp(r, ["selector"]);
    return ku(Object.assign(Object.assign({}, o), { uri: this._resolveUrl(e) })).pipe($a((s) => this._prepareRequest(s)), tc((s) => this._request$.next(s)), $a((s) => {
      var { uri: c, path: l } = s, u = rp(s, ["uri", "path"]);
      return Cw(c, u);
    }), $a((s) => this._prepareResponse(s)), tc((s) => this._response$.next(s)), $a((s) => {
      if (i)
        try {
          return i(s);
        } catch (c) {
          throw new nh("failed to execute response selector", s, {
            cause: c
          });
        }
      return ku(s);
    }), rw(this._abort$));
  }
  _prepareRequest(e) {
    return this.requestHandler.process(e);
  }
  _prepareResponse(e) {
    return this.responseHandler.process(e);
  }
  _resolveUrl(e) {
    const n = this.uri || window.location.origin;
    return new URL(e, n).href;
  }
}
class bw extends Aw {
  constructor() {
    super(...arguments), this.defaultScopes = [];
  }
  fetch$(e, n) {
    const r = Object.assign(n || {}, {
      scopes: this.defaultScopes.concat((n == null ? void 0 : n.scopes) || [])
    });
    return super._fetch$(e, r);
  }
}
var ip = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const nc = {
  name: "http",
  configure: () => new vw(bw),
  initialize: (t) => ip(void 0, [t], void 0, function* ({ config: e, hasModule: n, requireInstance: r }) {
    const i = new _w(e);
    if (n("auth")) {
      const o = yield r("auth");
      i.defaultHttpRequestHandler.set("MSAL", (a) => ip(void 0, void 0, void 0, function* () {
        const { scopes: s = [] } = a;
        if (s.length) {
          const c = yield o.acquireToken({
            scopes: s
          });
          if (c) {
            const l = new Headers(a.headers);
            return l.set("Authorization", `Bearer ${c.accessToken}`), Object.assign(Object.assign({}, a), { headers: l });
          }
        }
      }));
    }
    return i;
  })
}, Rw = (t) => ({
  module: nc,
  configure: t
}), Iw = (t, e) => ({
  module: nc,
  configure: (n) => {
    n.configureClient(t, e);
  }
}), Pl = "default";
class Nw {
  constructor() {
    this._configs = {}, this.requiresAuth = !0;
  }
  get defaultConfig() {
    return this._configs[Pl];
  }
  getClientConfig(e) {
    return this._configs[e];
  }
  configureClient(e, n) {
    return this._configs[e] = n, this;
  }
  configureDefault(e) {
    if (this._configs[Pl])
      throw Error("Default AuthClient already provided");
    this.configureClient(Pl, e);
  }
}
/*! @azure/msal-browser v2.38.4 2024-03-26 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var Pu = function(t, e) {
  return Pu = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Pu(t, e);
};
function et(t, e) {
  Pu(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
var B = function() {
  return B = Object.assign || function(e) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n)
        Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
    }
    return e;
  }, B.apply(this, arguments);
};
function op(t, e) {
  var n = {};
  for (var r in t)
    Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(t); i < r.length; i++)
      e.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[i]) && (n[r[i]] = t[r[i]]);
  return n;
}
function S(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, [])).next());
  });
}
function w(t, e) {
  var n = { label: 0, sent: function() {
    if (o[0] & 1)
      throw o[1];
    return o[1];
  }, trys: [], ops: [] }, r, i, o, a;
  return a = { next: s(0), throw: s(1), return: s(2) }, typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function s(l) {
    return function(u) {
      return c([l, u]);
    };
  }
  function c(l) {
    if (r)
      throw new TypeError("Generator is already executing.");
    for (; n; )
      try {
        if (r = 1, i && (o = l[0] & 2 ? i.return : l[0] ? i.throw || ((o = i.return) && o.call(i), 0) : i.next) && !(o = o.call(i, l[1])).done)
          return o;
        switch (i = 0, o && (l = [l[0] & 2, o.value]), l[0]) {
          case 0:
          case 1:
            o = l;
            break;
          case 4:
            return n.label++, { value: l[1], done: !1 };
          case 5:
            n.label++, i = l[1], l = [0];
            continue;
          case 7:
            l = n.ops.pop(), n.trys.pop();
            continue;
          default:
            if (o = n.trys, !(o = o.length > 0 && o[o.length - 1]) && (l[0] === 6 || l[0] === 2)) {
              n = 0;
              continue;
            }
            if (l[0] === 3 && (!o || l[1] > o[0] && l[1] < o[3])) {
              n.label = l[1];
              break;
            }
            if (l[0] === 6 && n.label < o[1]) {
              n.label = o[1], o = l;
              break;
            }
            if (o && n.label < o[2]) {
              n.label = o[2], n.ops.push(l);
              break;
            }
            o[2] && n.ops.pop(), n.trys.pop();
            continue;
        }
        l = e.call(t, n);
      } catch (u) {
        l = [6, u], i = 0;
      } finally {
        r = o = 0;
      }
    if (l[0] & 5)
      throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
function Ow(t, e) {
  var n = typeof Symbol == "function" && t[Symbol.iterator];
  if (!n)
    return t;
  var r = n.call(t), i, o = [], a;
  try {
    for (; (e === void 0 || e-- > 0) && !(i = r.next()).done; )
      o.push(i.value);
  } catch (s) {
    a = { error: s };
  } finally {
    try {
      i && !i.done && (n = r.return) && n.call(r);
    } finally {
      if (a)
        throw a.error;
    }
  }
  return o;
}
function rh() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t = t.concat(Ow(arguments[e]));
  return t;
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var Hu = function(t, e) {
  return Hu = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, Hu(t, e);
};
function wt(t, e) {
  Hu(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
var ce = function() {
  return ce = Object.assign || function(e) {
    for (var n, r = 1, i = arguments.length; r < i; r++) {
      n = arguments[r];
      for (var o in n)
        Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
    }
    return e;
  }, ce.apply(this, arguments);
};
function $(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, [])).next());
  });
}
function X(t, e) {
  var n = { label: 0, sent: function() {
    if (o[0] & 1)
      throw o[1];
    return o[1];
  }, trys: [], ops: [] }, r, i, o, a;
  return a = { next: s(0), throw: s(1), return: s(2) }, typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function s(l) {
    return function(u) {
      return c([l, u]);
    };
  }
  function c(l) {
    if (r)
      throw new TypeError("Generator is already executing.");
    for (; n; )
      try {
        if (r = 1, i && (o = l[0] & 2 ? i.return : l[0] ? i.throw || ((o = i.return) && o.call(i), 0) : i.next) && !(o = o.call(i, l[1])).done)
          return o;
        switch (i = 0, o && (l = [l[0] & 2, o.value]), l[0]) {
          case 0:
          case 1:
            o = l;
            break;
          case 4:
            return n.label++, { value: l[1], done: !1 };
          case 5:
            n.label++, i = l[1], l = [0];
            continue;
          case 7:
            l = n.ops.pop(), n.trys.pop();
            continue;
          default:
            if (o = n.trys, !(o = o.length > 0 && o[o.length - 1]) && (l[0] === 6 || l[0] === 2)) {
              n = 0;
              continue;
            }
            if (l[0] === 3 && (!o || l[1] > o[0] && l[1] < o[3])) {
              n.label = l[1];
              break;
            }
            if (l[0] === 6 && n.label < o[1]) {
              n.label = o[1], o = l;
              break;
            }
            if (o && n.label < o[2]) {
              n.label = o[2], n.ops.push(l);
              break;
            }
            o[2] && n.ops.pop(), n.trys.pop();
            continue;
        }
        l = e.call(t, n);
      } catch (u) {
        l = [6, u], i = 0;
      } finally {
        r = o = 0;
      }
    if (l[0] & 5)
      throw l[1];
    return { value: l[0] ? l[1] : void 0, done: !0 };
  }
}
function qc() {
  for (var t = 0, e = 0, n = arguments.length; e < n; e++)
    t += arguments[e].length;
  for (var r = Array(t), i = 0, e = 0; e < n; e++)
    for (var o = arguments[e], a = 0, s = o.length; a < s; a++, i++)
      r[i] = o[a];
  return r;
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
var y = {
  LIBRARY_NAME: "MSAL.JS",
  SKU: "msal.js.common",
  // Prefix for all library cache entries
  CACHE_PREFIX: "msal",
  // default authority
  DEFAULT_AUTHORITY: "https://login.microsoftonline.com/common/",
  DEFAULT_AUTHORITY_HOST: "login.microsoftonline.com",
  DEFAULT_COMMON_TENANT: "common",
  // ADFS String
  ADFS: "adfs",
  DSTS: "dstsv2",
  // Default AAD Instance Discovery Endpoint
  AAD_INSTANCE_DISCOVERY_ENDPT: "https://login.microsoftonline.com/common/discovery/instance?api-version=1.1&authorization_endpoint=",
  // CIAM URL
  CIAM_AUTH_URL: ".ciamlogin.com",
  AAD_TENANT_DOMAIN_SUFFIX: ".onmicrosoft.com",
  // Resource delimiter - used for certain cache entries
  RESOURCE_DELIM: "|",
  // Placeholder for non-existent account ids/objects
  NO_ACCOUNT: "NO_ACCOUNT",
  // Claims
  CLAIMS: "claims",
  // Consumer UTID
  CONSUMER_UTID: "9188040d-6c67-4c5b-b112-36a304b66dad",
  // Default scopes
  OPENID_SCOPE: "openid",
  PROFILE_SCOPE: "profile",
  OFFLINE_ACCESS_SCOPE: "offline_access",
  EMAIL_SCOPE: "email",
  // Default response type for authorization code flow
  CODE_RESPONSE_TYPE: "code",
  CODE_GRANT_TYPE: "authorization_code",
  RT_GRANT_TYPE: "refresh_token",
  FRAGMENT_RESPONSE_MODE: "fragment",
  S256_CODE_CHALLENGE_METHOD: "S256",
  URL_FORM_CONTENT_TYPE: "application/x-www-form-urlencoded;charset=utf-8",
  AUTHORIZATION_PENDING: "authorization_pending",
  NOT_DEFINED: "not_defined",
  EMPTY_STRING: "",
  NOT_APPLICABLE: "N/A",
  FORWARD_SLASH: "/",
  IMDS_ENDPOINT: "http://169.254.169.254/metadata/instance/compute/location",
  IMDS_VERSION: "2020-06-01",
  IMDS_TIMEOUT: 2e3,
  AZURE_REGION_AUTO_DISCOVER_FLAG: "TryAutoDetect",
  REGIONAL_AUTH_PUBLIC_CLOUD_SUFFIX: "login.microsoft.com",
  REGIONAL_AUTH_NON_MSI_QUERY_STRING: "allowestsrnonmsi=true",
  KNOWN_PUBLIC_CLOUDS: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"],
  TOKEN_RESPONSE_TYPE: "token",
  ID_TOKEN_RESPONSE_TYPE: "id_token",
  SHR_NONCE_VALIDITY: 240,
  INVALID_INSTANCE: "invalid_instance"
}, Aa = [
  y.OPENID_SCOPE,
  y.PROFILE_SCOPE,
  y.OFFLINE_ACCESS_SCOPE
], ap = qc(Aa, [
  y.EMAIL_SCOPE
]), Nt;
(function(t) {
  t.CONTENT_TYPE = "Content-Type", t.RETRY_AFTER = "Retry-After", t.CCS_HEADER = "X-AnchorMailbox", t.WWWAuthenticate = "WWW-Authenticate", t.AuthenticationInfo = "Authentication-Info", t.X_MS_REQUEST_ID = "x-ms-request-id", t.X_MS_HTTP_VERSION = "x-ms-httpver";
})(Nt || (Nt = {}));
var Le;
(function(t) {
  t.ID_TOKEN = "idtoken", t.CLIENT_INFO = "client.info", t.ADAL_ID_TOKEN = "adal.idtoken", t.ERROR = "error", t.ERROR_DESC = "error.description", t.ACTIVE_ACCOUNT = "active-account", t.ACTIVE_ACCOUNT_FILTERS = "active-account-filters";
})(Le || (Le = {}));
var Mr;
(function(t) {
  t.COMMON = "common", t.ORGANIZATIONS = "organizations", t.CONSUMERS = "consumers";
})(Mr || (Mr = {}));
var J;
(function(t) {
  t.CLIENT_ID = "client_id", t.REDIRECT_URI = "redirect_uri", t.RESPONSE_TYPE = "response_type", t.RESPONSE_MODE = "response_mode", t.GRANT_TYPE = "grant_type", t.CLAIMS = "claims", t.SCOPE = "scope", t.ERROR = "error", t.ERROR_DESCRIPTION = "error_description", t.ACCESS_TOKEN = "access_token", t.ID_TOKEN = "id_token", t.REFRESH_TOKEN = "refresh_token", t.EXPIRES_IN = "expires_in", t.STATE = "state", t.NONCE = "nonce", t.PROMPT = "prompt", t.SESSION_STATE = "session_state", t.CLIENT_INFO = "client_info", t.CODE = "code", t.CODE_CHALLENGE = "code_challenge", t.CODE_CHALLENGE_METHOD = "code_challenge_method", t.CODE_VERIFIER = "code_verifier", t.CLIENT_REQUEST_ID = "client-request-id", t.X_CLIENT_SKU = "x-client-SKU", t.X_CLIENT_VER = "x-client-VER", t.X_CLIENT_OS = "x-client-OS", t.X_CLIENT_CPU = "x-client-CPU", t.X_CLIENT_CURR_TELEM = "x-client-current-telemetry", t.X_CLIENT_LAST_TELEM = "x-client-last-telemetry", t.X_MS_LIB_CAPABILITY = "x-ms-lib-capability", t.X_APP_NAME = "x-app-name", t.X_APP_VER = "x-app-ver", t.POST_LOGOUT_URI = "post_logout_redirect_uri", t.ID_TOKEN_HINT = "id_token_hint", t.DEVICE_CODE = "device_code", t.CLIENT_SECRET = "client_secret", t.CLIENT_ASSERTION = "client_assertion", t.CLIENT_ASSERTION_TYPE = "client_assertion_type", t.TOKEN_TYPE = "token_type", t.REQ_CNF = "req_cnf", t.OBO_ASSERTION = "assertion", t.REQUESTED_TOKEN_USE = "requested_token_use", t.ON_BEHALF_OF = "on_behalf_of", t.FOCI = "foci", t.CCS_HEADER = "X-AnchorMailbox", t.RETURN_SPA_CODE = "return_spa_code", t.NATIVE_BROKER = "nativebroker", t.LOGOUT_HINT = "logout_hint";
})(J || (J = {}));
var fi;
(function(t) {
  t.ACCESS_TOKEN = "access_token", t.XMS_CC = "xms_cc";
})(fi || (fi = {}));
var st = {
  LOGIN: "login",
  SELECT_ACCOUNT: "select_account",
  CONSENT: "consent",
  NONE: "none",
  CREATE: "create",
  NO_SESSION: "no_session"
}, Go;
(function(t) {
  t.ACCOUNT = "account", t.SID = "sid", t.LOGIN_HINT = "login_hint", t.ID_TOKEN = "id_token", t.DOMAIN_HINT = "domain_hint", t.ORGANIZATIONS = "organizations", t.CONSUMERS = "consumers", t.ACCOUNT_ID = "accountIdentifier", t.HOMEACCOUNT_ID = "homeAccountIdentifier";
})(Go || (Go = {}));
var sp = {
  PLAIN: "plain",
  S256: "S256"
}, rc;
(function(t) {
  t.QUERY = "query", t.FRAGMENT = "fragment", t.FORM_POST = "form_post";
})(rc || (rc = {}));
var ic;
(function(t) {
  t.IMPLICIT_GRANT = "implicit", t.AUTHORIZATION_CODE_GRANT = "authorization_code", t.CLIENT_CREDENTIALS_GRANT = "client_credentials", t.RESOURCE_OWNER_PASSWORD_GRANT = "password", t.REFRESH_TOKEN_GRANT = "refresh_token", t.DEVICE_CODE_GRANT = "device_code", t.JWT_BEARER = "urn:ietf:params:oauth:grant-type:jwt-bearer";
})(ic || (ic = {}));
var An;
(function(t) {
  t.MSSTS_ACCOUNT_TYPE = "MSSTS", t.ADFS_ACCOUNT_TYPE = "ADFS", t.MSAV1_ACCOUNT_TYPE = "MSA", t.GENERIC_ACCOUNT_TYPE = "Generic";
})(An || (An = {}));
var qe;
(function(t) {
  t.CACHE_KEY_SEPARATOR = "-", t.CLIENT_INFO_SEPARATOR = ".";
})(qe || (qe = {}));
var F;
(function(t) {
  t.ID_TOKEN = "IdToken", t.ACCESS_TOKEN = "AccessToken", t.ACCESS_TOKEN_WITH_AUTH_SCHEME = "AccessToken_With_AuthScheme", t.REFRESH_TOKEN = "RefreshToken";
})(F || (F = {}));
var Mn;
(function(t) {
  t[t.ADFS = 1001] = "ADFS", t[t.MSA = 1002] = "MSA", t[t.MSSTS = 1003] = "MSSTS", t[t.GENERIC = 1004] = "GENERIC", t[t.ACCESS_TOKEN = 2001] = "ACCESS_TOKEN", t[t.REFRESH_TOKEN = 2002] = "REFRESH_TOKEN", t[t.ID_TOKEN = 2003] = "ID_TOKEN", t[t.APP_METADATA = 3001] = "APP_METADATA", t[t.UNDEFINED = 9999] = "UNDEFINED";
})(Mn || (Mn = {}));
var Lu = "appmetadata", Mw = "client_info", Ko = "1", Fo = {
  CACHE_KEY: "authority-metadata",
  REFRESH_TIME_SECONDS: 3600 * 24
  // 24 Hours
}, Mt;
(function(t) {
  t.CONFIG = "config", t.CACHE = "cache", t.NETWORK = "network", t.HARDCODED_VALUES = "hardcoded_values";
})(Mt || (Mt = {}));
var Qe = {
  SCHEMA_VERSION: 5,
  MAX_CUR_HEADER_BYTES: 80,
  MAX_LAST_HEADER_BYTES: 330,
  MAX_CACHED_ERRORS: 50,
  CACHE_KEY: "server-telemetry",
  CATEGORY_SEPARATOR: "|",
  VALUE_SEPARATOR: ",",
  OVERFLOW_TRUE: "1",
  OVERFLOW_FALSE: "0",
  UNKNOWN_ERROR: "unknown_error"
}, ue;
(function(t) {
  t.BEARER = "Bearer", t.POP = "pop", t.SSH = "ssh-cert";
})(ue || (ue = {}));
var jo = {
  // Default time to throttle RequestThumbprint in seconds
  DEFAULT_THROTTLE_TIME_SECONDS: 60,
  // Default maximum time to throttle in seconds, overrides what the server sends back
  DEFAULT_MAX_THROTTLE_TIME_SECONDS: 3600,
  // Prefix for storing throttling entries
  THROTTLING_PREFIX: "throttling",
  // Value assigned to the x-ms-lib-capability header to indicate to the server the library supports throttling
  X_MS_LIB_CAPABILITY_VALUE: "retry-after, h429"
}, cp = {
  INVALID_GRANT_ERROR: "invalid_grant",
  CLIENT_MISMATCH_ERROR: "client_mismatch"
}, oc;
(function(t) {
  t.username = "username", t.password = "password";
})(oc || (oc = {}));
var pi;
(function(t) {
  t[t.httpSuccess = 200] = "httpSuccess", t[t.httpBadRequest = 400] = "httpBadRequest";
})(pi || (pi = {}));
var Vn;
(function(t) {
  t.FAILED_AUTO_DETECTION = "1", t.INTERNAL_CACHE = "2", t.ENVIRONMENT_VARIABLE = "3", t.IMDS = "4";
})(Vn || (Vn = {}));
var Yo;
(function(t) {
  t.CONFIGURED_MATCHES_DETECTED = "1", t.CONFIGURED_NO_AUTO_DETECTION = "2", t.CONFIGURED_NOT_DETECTED = "3", t.AUTO_DETECTION_REQUESTED_SUCCESSFUL = "4", t.AUTO_DETECTION_REQUESTED_FAILED = "5";
})(Yo || (Yo = {}));
var er;
(function(t) {
  t.NO_CACHE_HIT = "0", t.FORCE_REFRESH = "1", t.NO_CACHED_ACCESS_TOKEN = "2", t.CACHED_ACCESS_TOKEN_EXPIRED = "3", t.REFRESH_CACHED_ACCESS_TOKEN = "4", t.CLAIMS_REQUESTED_CACHE_SKIPPED = "5";
})(er || (er = {}));
var xu;
(function(t) {
  t.Jwt = "JWT", t.Jwk = "JWK", t.Pop = "pop";
})(xu || (xu = {}));
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Ja = {
  unexpectedError: {
    code: "unexpected_error",
    desc: "Unexpected error in authentication."
  },
  postRequestFailed: {
    code: "post_request_failed",
    desc: "Post request failed from the network, could be a 4xx/5xx or a network unavailability. Please check the exact error code for details."
  }
}, K = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r, i) {
      var o = this, a = r ? n + ": " + r : n;
      return o = t.call(this, a) || this, Object.setPrototypeOf(o, e.prototype), o.errorCode = n || y.EMPTY_STRING, o.errorMessage = r || y.EMPTY_STRING, o.subError = i || y.EMPTY_STRING, o.name = "AuthError", o;
    }
    return e.prototype.setCorrelationId = function(n) {
      this.correlationId = n;
    }, e.createUnexpectedError = function(n) {
      return new e(Ja.unexpectedError.code, Ja.unexpectedError.desc + ": " + n);
    }, e.createPostRequestFailed = function(n) {
      return new e(Ja.postRequestFailed.code, Ja.postRequestFailed.desc + ": " + n);
    }, e;
  }(Error)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ac = {
  createNewGuid: function() {
    var t = "Crypto interface - createNewGuid() has not been implemented";
    throw K.createUnexpectedError(t);
  },
  base64Decode: function() {
    var t = "Crypto interface - base64Decode() has not been implemented";
    throw K.createUnexpectedError(t);
  },
  base64Encode: function() {
    var t = "Crypto interface - base64Encode() has not been implemented";
    throw K.createUnexpectedError(t);
  },
  generatePkceCodes: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Crypto interface - generatePkceCodes() has not been implemented", K.createUnexpectedError(t);
      });
    });
  },
  getPublicKeyThumbprint: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Crypto interface - getPublicKeyThumbprint() has not been implemented", K.createUnexpectedError(t);
      });
    });
  },
  removeTokenBindingKey: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Crypto interface - removeTokenBindingKey() has not been implemented", K.createUnexpectedError(t);
      });
    });
  },
  clearKeystore: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Crypto interface - clearKeystore() has not been implemented", K.createUnexpectedError(t);
      });
    });
  },
  signJwt: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Crypto interface - signJwt() has not been implemented", K.createUnexpectedError(t);
      });
    });
  },
  hashString: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Crypto interface - hashString() has not been implemented", K.createUnexpectedError(t);
      });
    });
  }
};
/*! @azure/msal-common v13.3.1 2023-10-27 */
var R = {
  clientInfoDecodingError: {
    code: "client_info_decoding_error",
    desc: "The client info could not be parsed/decoded correctly. Please review the trace to determine the root cause."
  },
  clientInfoEmptyError: {
    code: "client_info_empty_error",
    desc: "The client info was empty. Please review the trace to determine the root cause."
  },
  tokenParsingError: {
    code: "token_parsing_error",
    desc: "Token cannot be parsed. Please review stack trace to determine root cause."
  },
  nullOrEmptyToken: {
    code: "null_or_empty_token",
    desc: "The token is null or empty. Please review the trace to determine the root cause."
  },
  endpointResolutionError: {
    code: "endpoints_resolution_error",
    desc: "Error: could not resolve endpoints. Please check network and try again."
  },
  networkError: {
    code: "network_error",
    desc: "Network request failed. Please check network trace to determine root cause."
  },
  unableToGetOpenidConfigError: {
    code: "openid_config_error",
    desc: "Could not retrieve endpoints. Check your authority and verify the .well-known/openid-configuration endpoint returns the required endpoints."
  },
  hashNotDeserialized: {
    code: "hash_not_deserialized",
    desc: "The hash parameters could not be deserialized. Please review the trace to determine the root cause."
  },
  blankGuidGenerated: {
    code: "blank_guid_generated",
    desc: "The guid generated was blank. Please review the trace to determine the root cause."
  },
  invalidStateError: {
    code: "invalid_state",
    desc: "State was not the expected format. Please check the logs to determine whether the request was sent using ProtocolUtils.setRequestState()."
  },
  stateMismatchError: {
    code: "state_mismatch",
    desc: "State mismatch error. Please check your network. Continued requests may cause cache overflow."
  },
  stateNotFoundError: {
    code: "state_not_found",
    desc: "State not found"
  },
  nonceMismatchError: {
    code: "nonce_mismatch",
    desc: "Nonce mismatch error. This may be caused by a race condition in concurrent requests."
  },
  nonceNotFoundError: {
    code: "nonce_not_found",
    desc: "nonce not found"
  },
  authTimeNotFoundError: {
    code: "auth_time_not_found",
    desc: "Max Age was requested and the ID token is missing the auth_time variable. auth_time is an optional claim and is not enabled by default - it must be enabled. See https://aka.ms/msaljs/optional-claims for more information."
  },
  maxAgeTranspiredError: {
    code: "max_age_transpired",
    desc: "Max Age is set to 0, or too much time has elapsed since the last end-user authentication."
  },
  noTokensFoundError: {
    code: "no_tokens_found",
    desc: "No tokens were found for the given scopes, and no authorization code was passed to acquireToken. You must retrieve an authorization code before making a call to acquireToken()."
  },
  multipleMatchingTokens: {
    code: "multiple_matching_tokens",
    desc: "The cache contains multiple tokens satisfying the requirements. Call AcquireToken again providing more requirements such as authority or account."
  },
  multipleMatchingAccounts: {
    code: "multiple_matching_accounts",
    desc: "The cache contains multiple accounts satisfying the given parameters. Please pass more info to obtain the correct account"
  },
  multipleMatchingAppMetadata: {
    code: "multiple_matching_appMetadata",
    desc: "The cache contains multiple appMetadata satisfying the given parameters. Please pass more info to obtain the correct appMetadata"
  },
  tokenRequestCannotBeMade: {
    code: "request_cannot_be_made",
    desc: "Token request cannot be made without authorization code or refresh token."
  },
  appendEmptyScopeError: {
    code: "cannot_append_empty_scope",
    desc: "Cannot append null or empty scope to ScopeSet. Please check the stack trace for more info."
  },
  removeEmptyScopeError: {
    code: "cannot_remove_empty_scope",
    desc: "Cannot remove null or empty scope from ScopeSet. Please check the stack trace for more info."
  },
  appendScopeSetError: {
    code: "cannot_append_scopeset",
    desc: "Cannot append ScopeSet due to error."
  },
  emptyInputScopeSetError: {
    code: "empty_input_scopeset",
    desc: "Empty input ScopeSet cannot be processed."
  },
  DeviceCodePollingCancelled: {
    code: "device_code_polling_cancelled",
    desc: "Caller has cancelled token endpoint polling during device code flow by setting DeviceCodeRequest.cancel = true."
  },
  DeviceCodeExpired: {
    code: "device_code_expired",
    desc: "Device code is expired."
  },
  DeviceCodeUnknownError: {
    code: "device_code_unknown_error",
    desc: "Device code stopped polling for unknown reasons."
  },
  NoAccountInSilentRequest: {
    code: "no_account_in_silent_request",
    desc: "Please pass an account object, silent flow is not supported without account information"
  },
  invalidCacheRecord: {
    code: "invalid_cache_record",
    desc: "Cache record object was null or undefined."
  },
  invalidCacheEnvironment: {
    code: "invalid_cache_environment",
    desc: "Invalid environment when attempting to create cache entry"
  },
  noAccountFound: {
    code: "no_account_found",
    desc: "No account found in cache for given key."
  },
  CachePluginError: {
    code: "no cache plugin set on CacheManager",
    desc: "ICachePlugin needs to be set before using readFromStorage or writeFromStorage"
  },
  noCryptoObj: {
    code: "no_crypto_object",
    desc: "No crypto object detected. This is required for the following operation: "
  },
  invalidCacheType: {
    code: "invalid_cache_type",
    desc: "Invalid cache type"
  },
  unexpectedAccountType: {
    code: "unexpected_account_type",
    desc: "Unexpected account type."
  },
  unexpectedCredentialType: {
    code: "unexpected_credential_type",
    desc: "Unexpected credential type."
  },
  invalidAssertion: {
    code: "invalid_assertion",
    desc: "Client assertion must meet requirements described in https://tools.ietf.org/html/rfc7515"
  },
  invalidClientCredential: {
    code: "invalid_client_credential",
    desc: "Client credential (secret, certificate, or assertion) must not be empty when creating a confidential client. An application should at most have one credential"
  },
  tokenRefreshRequired: {
    code: "token_refresh_required",
    desc: "Cannot return token from cache because it must be refreshed. This may be due to one of the following reasons: forceRefresh parameter is set to true, claims have been requested, there is no cached access token or it is expired."
  },
  userTimeoutReached: {
    code: "user_timeout_reached",
    desc: "User defined timeout for device code polling reached"
  },
  tokenClaimsRequired: {
    code: "token_claims_cnf_required_for_signedjwt",
    desc: "Cannot generate a POP jwt if the token_claims are not populated"
  },
  noAuthorizationCodeFromServer: {
    code: "authorization_code_missing_from_server_response",
    desc: "Server response does not contain an authorization code to proceed"
  },
  noAzureRegionDetected: {
    code: "no_azure_region_detected",
    desc: "No azure region was detected and no fallback was made available"
  },
  accessTokenEntityNullError: {
    code: "access_token_entity_null",
    desc: "Access token entity is null, please check logs and cache to ensure a valid access token is present."
  },
  bindingKeyNotRemovedError: {
    code: "binding_key_not_removed",
    desc: "Could not remove the credential's binding key from storage."
  },
  logoutNotSupported: {
    code: "end_session_endpoint_not_supported",
    desc: "Provided authority does not support logout."
  },
  keyIdMissing: {
    code: "key_id_missing",
    desc: "A keyId value is missing from the requested bound token's cache record and is required to match the token to it's stored binding key."
  },
  noNetworkConnectivity: {
    code: "no_network_connectivity",
    desc: "No network connectivity. Check your internet connection."
  },
  userCanceledError: {
    code: "user_canceled",
    desc: "User canceled the flow."
  }
}, L = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r) {
      var i = t.call(this, n, r) || this;
      return i.name = "ClientAuthError", Object.setPrototypeOf(i, e.prototype), i;
    }
    return e.createClientInfoDecodingError = function(n) {
      return new e(R.clientInfoDecodingError.code, R.clientInfoDecodingError.desc + " Failed with error: " + n);
    }, e.createClientInfoEmptyError = function() {
      return new e(R.clientInfoEmptyError.code, "" + R.clientInfoEmptyError.desc);
    }, e.createTokenParsingError = function(n) {
      return new e(R.tokenParsingError.code, R.tokenParsingError.desc + " Failed with error: " + n);
    }, e.createTokenNullOrEmptyError = function(n) {
      return new e(R.nullOrEmptyToken.code, R.nullOrEmptyToken.desc + " Raw Token Value: " + n);
    }, e.createEndpointDiscoveryIncompleteError = function(n) {
      return new e(R.endpointResolutionError.code, R.endpointResolutionError.desc + " Detail: " + n);
    }, e.createNetworkError = function(n, r) {
      return new e(R.networkError.code, R.networkError.desc + " | Fetch client threw: " + r + " | Attempted to reach: " + n.split("?")[0]);
    }, e.createUnableToGetOpenidConfigError = function(n) {
      return new e(R.unableToGetOpenidConfigError.code, R.unableToGetOpenidConfigError.desc + " Attempted to retrieve endpoints from: " + n);
    }, e.createHashNotDeserializedError = function(n) {
      return new e(R.hashNotDeserialized.code, R.hashNotDeserialized.desc + " Given Object: " + n);
    }, e.createInvalidStateError = function(n, r) {
      return new e(R.invalidStateError.code, R.invalidStateError.desc + " Invalid State: " + n + ", Root Err: " + r);
    }, e.createStateMismatchError = function() {
      return new e(R.stateMismatchError.code, R.stateMismatchError.desc);
    }, e.createStateNotFoundError = function(n) {
      return new e(R.stateNotFoundError.code, R.stateNotFoundError.desc + ":  " + n);
    }, e.createNonceMismatchError = function() {
      return new e(R.nonceMismatchError.code, R.nonceMismatchError.desc);
    }, e.createAuthTimeNotFoundError = function() {
      return new e(R.authTimeNotFoundError.code, R.authTimeNotFoundError.desc);
    }, e.createMaxAgeTranspiredError = function() {
      return new e(R.maxAgeTranspiredError.code, R.maxAgeTranspiredError.desc);
    }, e.createNonceNotFoundError = function(n) {
      return new e(R.nonceNotFoundError.code, R.nonceNotFoundError.desc + ":  " + n);
    }, e.createMultipleMatchingTokensInCacheError = function() {
      return new e(R.multipleMatchingTokens.code, R.multipleMatchingTokens.desc + ".");
    }, e.createMultipleMatchingAccountsInCacheError = function() {
      return new e(R.multipleMatchingAccounts.code, R.multipleMatchingAccounts.desc);
    }, e.createMultipleMatchingAppMetadataInCacheError = function() {
      return new e(R.multipleMatchingAppMetadata.code, R.multipleMatchingAppMetadata.desc);
    }, e.createTokenRequestCannotBeMadeError = function() {
      return new e(R.tokenRequestCannotBeMade.code, R.tokenRequestCannotBeMade.desc);
    }, e.createAppendEmptyScopeToSetError = function(n) {
      return new e(R.appendEmptyScopeError.code, R.appendEmptyScopeError.desc + " Given Scope: " + n);
    }, e.createRemoveEmptyScopeFromSetError = function(n) {
      return new e(R.removeEmptyScopeError.code, R.removeEmptyScopeError.desc + " Given Scope: " + n);
    }, e.createAppendScopeSetError = function(n) {
      return new e(R.appendScopeSetError.code, R.appendScopeSetError.desc + " Detail Error: " + n);
    }, e.createEmptyInputScopeSetError = function() {
      return new e(R.emptyInputScopeSetError.code, "" + R.emptyInputScopeSetError.desc);
    }, e.createDeviceCodeCancelledError = function() {
      return new e(R.DeviceCodePollingCancelled.code, "" + R.DeviceCodePollingCancelled.desc);
    }, e.createDeviceCodeExpiredError = function() {
      return new e(R.DeviceCodeExpired.code, "" + R.DeviceCodeExpired.desc);
    }, e.createDeviceCodeUnknownError = function() {
      return new e(R.DeviceCodeUnknownError.code, "" + R.DeviceCodeUnknownError.desc);
    }, e.createNoAccountInSilentRequestError = function() {
      return new e(R.NoAccountInSilentRequest.code, "" + R.NoAccountInSilentRequest.desc);
    }, e.createNullOrUndefinedCacheRecord = function() {
      return new e(R.invalidCacheRecord.code, R.invalidCacheRecord.desc);
    }, e.createInvalidCacheEnvironmentError = function() {
      return new e(R.invalidCacheEnvironment.code, R.invalidCacheEnvironment.desc);
    }, e.createNoAccountFoundError = function() {
      return new e(R.noAccountFound.code, R.noAccountFound.desc);
    }, e.createCachePluginError = function() {
      return new e(R.CachePluginError.code, "" + R.CachePluginError.desc);
    }, e.createNoCryptoObjectError = function(n) {
      return new e(R.noCryptoObj.code, "" + R.noCryptoObj.desc + n);
    }, e.createInvalidCacheTypeError = function() {
      return new e(R.invalidCacheType.code, "" + R.invalidCacheType.desc);
    }, e.createUnexpectedAccountTypeError = function() {
      return new e(R.unexpectedAccountType.code, "" + R.unexpectedAccountType.desc);
    }, e.createUnexpectedCredentialTypeError = function() {
      return new e(R.unexpectedCredentialType.code, "" + R.unexpectedCredentialType.desc);
    }, e.createInvalidAssertionError = function() {
      return new e(R.invalidAssertion.code, "" + R.invalidAssertion.desc);
    }, e.createInvalidCredentialError = function() {
      return new e(R.invalidClientCredential.code, "" + R.invalidClientCredential.desc);
    }, e.createRefreshRequiredError = function() {
      return new e(R.tokenRefreshRequired.code, R.tokenRefreshRequired.desc);
    }, e.createUserTimeoutReachedError = function() {
      return new e(R.userTimeoutReached.code, R.userTimeoutReached.desc);
    }, e.createTokenClaimsRequiredError = function() {
      return new e(R.tokenClaimsRequired.code, R.tokenClaimsRequired.desc);
    }, e.createNoAuthCodeInServerResponseError = function() {
      return new e(R.noAuthorizationCodeFromServer.code, R.noAuthorizationCodeFromServer.desc);
    }, e.createBindingKeyNotRemovedError = function() {
      return new e(R.bindingKeyNotRemovedError.code, R.bindingKeyNotRemovedError.desc);
    }, e.createLogoutNotSupportedError = function() {
      return new e(R.logoutNotSupported.code, R.logoutNotSupported.desc);
    }, e.createKeyIdMissingError = function() {
      return new e(R.keyIdMissing.code, R.keyIdMissing.desc);
    }, e.createNoNetworkConnectivityError = function() {
      return new e(R.noNetworkConnectivity.code, R.noNetworkConnectivity.desc);
    }, e.createUserCanceledError = function() {
      return new e(R.userCanceledError.code, R.userCanceledError.desc);
    }, e;
  }(K)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var P = (
  /** @class */
  function() {
    function t() {
    }
    return t.decodeAuthToken = function(e) {
      if (t.isEmpty(e))
        throw L.createTokenNullOrEmptyError(e);
      var n = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/, r = n.exec(e);
      if (!r || r.length < 4)
        throw L.createTokenParsingError("Given token is malformed: " + JSON.stringify(e));
      var i = {
        header: r[1],
        JWSPayload: r[2],
        JWSSig: r[3]
      };
      return i;
    }, t.isEmpty = function(e) {
      return typeof e > "u" || !e || e.length === 0;
    }, t.isEmptyObj = function(e) {
      if (e && !t.isEmpty(e))
        try {
          var n = JSON.parse(e);
          return Object.keys(n).length === 0;
        } catch {
        }
      return !0;
    }, t.startsWith = function(e, n) {
      return e.indexOf(n) === 0;
    }, t.endsWith = function(e, n) {
      return e.length >= n.length && e.lastIndexOf(n) === e.length - n.length;
    }, t.queryStringToObject = function(e) {
      var n = {}, r = e.split("&"), i = function(o) {
        return decodeURIComponent(o.replace(/\+/g, " "));
      };
      return r.forEach(function(o) {
        if (o.trim()) {
          var a = o.split(/=(.+)/g, 2), s = a[0], c = a[1];
          s && c && (n[i(s)] = i(c));
        }
      }), n;
    }, t.trimArrayEntries = function(e) {
      return e.map(function(n) {
        return n.trim();
      });
    }, t.removeEmptyStringsFromArray = function(e) {
      return e.filter(function(n) {
        return !t.isEmpty(n);
      });
    }, t.jsonParseHelper = function(e) {
      try {
        return JSON.parse(e);
      } catch {
        return null;
      }
    }, t.matchPattern = function(e, n) {
      var r = new RegExp(e.replace(/\\/g, "\\\\").replace(/\*/g, "[^ ]*").replace(/\?/g, "\\?"));
      return r.test(n);
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Ie;
(function(t) {
  t[t.Error = 0] = "Error", t[t.Warning = 1] = "Warning", t[t.Info = 2] = "Info", t[t.Verbose = 3] = "Verbose", t[t.Trace = 4] = "Trace";
})(Ie || (Ie = {}));
var Bc = (
  /** @class */
  function() {
    function t(e, n, r) {
      this.level = Ie.Info;
      var i = function() {
      }, o = e || t.createDefaultLoggerOptions();
      this.localCallback = o.loggerCallback || i, this.piiLoggingEnabled = o.piiLoggingEnabled || !1, this.level = typeof o.logLevel == "number" ? o.logLevel : Ie.Info, this.correlationId = o.correlationId || y.EMPTY_STRING, this.packageName = n || y.EMPTY_STRING, this.packageVersion = r || y.EMPTY_STRING;
    }
    return t.createDefaultLoggerOptions = function() {
      return {
        loggerCallback: function() {
        },
        piiLoggingEnabled: !1,
        logLevel: Ie.Info
      };
    }, t.prototype.clone = function(e, n, r) {
      return new t({ loggerCallback: this.localCallback, piiLoggingEnabled: this.piiLoggingEnabled, logLevel: this.level, correlationId: r || this.correlationId }, e, n);
    }, t.prototype.logMessage = function(e, n) {
      if (!(n.logLevel > this.level || !this.piiLoggingEnabled && n.containsPii)) {
        var r = (/* @__PURE__ */ new Date()).toUTCString(), i;
        P.isEmpty(n.correlationId) ? P.isEmpty(this.correlationId) ? i = "[" + r + "]" : i = "[" + r + "] : [" + this.correlationId + "]" : i = "[" + r + "] : [" + n.correlationId + "]";
        var o = i + " : " + this.packageName + "@" + this.packageVersion + " : " + Ie[n.logLevel] + " - " + e;
        this.executeCallback(n.logLevel, o, n.containsPii || !1);
      }
    }, t.prototype.executeCallback = function(e, n, r) {
      this.localCallback && this.localCallback(e, n, r);
    }, t.prototype.error = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Error,
        containsPii: !1,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.errorPii = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Error,
        containsPii: !0,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.warning = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Warning,
        containsPii: !1,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.warningPii = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Warning,
        containsPii: !0,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.info = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Info,
        containsPii: !1,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.infoPii = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Info,
        containsPii: !0,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.verbose = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Verbose,
        containsPii: !1,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.verbosePii = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Verbose,
        containsPii: !0,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.trace = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Trace,
        containsPii: !1,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.tracePii = function(e, n) {
      this.logMessage(e, {
        logLevel: Ie.Trace,
        containsPii: !0,
        correlationId: n || y.EMPTY_STRING
      });
    }, t.prototype.isPiiLoggingEnabled = function() {
      return this.piiLoggingEnabled || !1;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Zv = "@azure/msal-common", ih = "13.3.1";
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ha;
(function(t) {
  t[t.None = 0] = "None", t.AzurePublic = "https://login.microsoftonline.com", t.AzurePpe = "https://login.windows-ppe.net", t.AzureChina = "https://login.chinacloudapi.cn", t.AzureGermany = "https://login.microsoftonline.de", t.AzureUsGovernment = "https://login.microsoftonline.us";
})(ha || (ha = {}));
/*! @azure/msal-common v13.3.1 2023-10-27 */
var V = {
  redirectUriNotSet: {
    code: "redirect_uri_empty",
    desc: "A redirect URI is required for all calls, and none has been set."
  },
  postLogoutUriNotSet: {
    code: "post_logout_uri_empty",
    desc: "A post logout redirect has not been set."
  },
  claimsRequestParsingError: {
    code: "claims_request_parsing_error",
    desc: "Could not parse the given claims request object."
  },
  authorityUriInsecure: {
    code: "authority_uri_insecure",
    desc: "Authority URIs must use https.  Please see here for valid authority configuration options: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications#configuration-options"
  },
  urlParseError: {
    code: "url_parse_error",
    desc: "URL could not be parsed into appropriate segments."
  },
  urlEmptyError: {
    code: "empty_url_error",
    desc: "URL was empty or null."
  },
  emptyScopesError: {
    code: "empty_input_scopes_error",
    desc: "Scopes cannot be passed as null, undefined or empty array because they are required to obtain an access token."
  },
  nonArrayScopesError: {
    code: "nonarray_input_scopes_error",
    desc: "Scopes cannot be passed as non-array."
  },
  clientIdSingleScopeError: {
    code: "clientid_input_scopes_error",
    desc: "Client ID can only be provided as a single scope."
  },
  invalidPrompt: {
    code: "invalid_prompt_value",
    desc: "Supported prompt values are 'login', 'select_account', 'consent', 'create', 'none' and 'no_session'.  Please see here for valid configuration options: https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_common.html#commonauthorizationurlrequest"
  },
  invalidClaimsRequest: {
    code: "invalid_claims",
    desc: "Given claims parameter must be a stringified JSON object."
  },
  tokenRequestEmptyError: {
    code: "token_request_empty",
    desc: "Token request was empty and not found in cache."
  },
  logoutRequestEmptyError: {
    code: "logout_request_empty",
    desc: "The logout request was null or undefined."
  },
  invalidCodeChallengeMethod: {
    code: "invalid_code_challenge_method",
    desc: 'code_challenge_method passed is invalid. Valid values are "plain" and "S256".'
  },
  invalidCodeChallengeParams: {
    code: "pkce_params_missing",
    desc: "Both params: code_challenge and code_challenge_method are to be passed if to be sent in the request"
  },
  invalidCloudDiscoveryMetadata: {
    code: "invalid_cloud_discovery_metadata",
    desc: "Invalid cloudDiscoveryMetadata provided. Must be a stringified JSON object containing tenant_discovery_endpoint and metadata fields"
  },
  invalidAuthorityMetadata: {
    code: "invalid_authority_metadata",
    desc: "Invalid authorityMetadata provided. Must by a stringified JSON object containing authorization_endpoint, token_endpoint, issuer fields."
  },
  untrustedAuthority: {
    code: "untrusted_authority",
    desc: "The provided authority is not a trusted authority. Please include this authority in the knownAuthorities config parameter."
  },
  invalidAzureCloudInstance: {
    code: "invalid_azure_cloud_instance",
    desc: "Invalid AzureCloudInstance provided. Please refer MSAL JS docs: aks.ms/msaljs/azure_cloud_instance for valid values"
  },
  missingSshJwk: {
    code: "missing_ssh_jwk",
    desc: "Missing sshJwk in SSH certificate request. A stringified JSON Web Key is required when using the SSH authentication scheme."
  },
  missingSshKid: {
    code: "missing_ssh_kid",
    desc: "Missing sshKid in SSH certificate request. A string that uniquely identifies the public SSH key is required when using the SSH authentication scheme."
  },
  missingNonceAuthenticationHeader: {
    code: "missing_nonce_authentication_header",
    desc: "Unable to find an authentication header containing server nonce. Either the Authentication-Info or WWW-Authenticate headers must be present in order to obtain a server nonce."
  },
  invalidAuthenticationHeader: {
    code: "invalid_authentication_header",
    desc: "Invalid authentication header provided"
  },
  authorityMismatch: {
    code: "authority_mismatch",
    desc: "Authority mismatch error. Authority provided in login request or PublicClientApplication config does not match the environment of the provided account. Please use a matching account or make an interactive request to login to this authority."
  }
}, Ee = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r) {
      var i = t.call(this, n, r) || this;
      return i.name = "ClientConfigurationError", Object.setPrototypeOf(i, e.prototype), i;
    }
    return e.createRedirectUriEmptyError = function() {
      return new e(V.redirectUriNotSet.code, V.redirectUriNotSet.desc);
    }, e.createPostLogoutRedirectUriEmptyError = function() {
      return new e(V.postLogoutUriNotSet.code, V.postLogoutUriNotSet.desc);
    }, e.createClaimsRequestParsingError = function(n) {
      return new e(V.claimsRequestParsingError.code, V.claimsRequestParsingError.desc + " Given value: " + n);
    }, e.createInsecureAuthorityUriError = function(n) {
      return new e(V.authorityUriInsecure.code, V.authorityUriInsecure.desc + " Given URI: " + n);
    }, e.createUrlParseError = function(n) {
      return new e(V.urlParseError.code, V.urlParseError.desc + " Given Error: " + n);
    }, e.createUrlEmptyError = function() {
      return new e(V.urlEmptyError.code, V.urlEmptyError.desc);
    }, e.createEmptyScopesArrayError = function() {
      return new e(V.emptyScopesError.code, "" + V.emptyScopesError.desc);
    }, e.createClientIdSingleScopeError = function(n) {
      return new e(V.clientIdSingleScopeError.code, V.clientIdSingleScopeError.desc + " Given Scopes: " + n);
    }, e.createInvalidPromptError = function(n) {
      return new e(V.invalidPrompt.code, V.invalidPrompt.desc + " Given value: " + n);
    }, e.createInvalidClaimsRequestError = function() {
      return new e(V.invalidClaimsRequest.code, V.invalidClaimsRequest.desc);
    }, e.createEmptyLogoutRequestError = function() {
      return new e(V.logoutRequestEmptyError.code, V.logoutRequestEmptyError.desc);
    }, e.createEmptyTokenRequestError = function() {
      return new e(V.tokenRequestEmptyError.code, V.tokenRequestEmptyError.desc);
    }, e.createInvalidCodeChallengeMethodError = function() {
      return new e(V.invalidCodeChallengeMethod.code, V.invalidCodeChallengeMethod.desc);
    }, e.createInvalidCodeChallengeParamsError = function() {
      return new e(V.invalidCodeChallengeParams.code, V.invalidCodeChallengeParams.desc);
    }, e.createInvalidCloudDiscoveryMetadataError = function() {
      return new e(V.invalidCloudDiscoveryMetadata.code, V.invalidCloudDiscoveryMetadata.desc);
    }, e.createInvalidAuthorityMetadataError = function() {
      return new e(V.invalidAuthorityMetadata.code, V.invalidAuthorityMetadata.desc);
    }, e.createUntrustedAuthorityError = function() {
      return new e(V.untrustedAuthority.code, V.untrustedAuthority.desc);
    }, e.createInvalidAzureCloudInstanceError = function() {
      return new e(V.invalidAzureCloudInstance.code, V.invalidAzureCloudInstance.desc);
    }, e.createMissingSshJwkError = function() {
      return new e(V.missingSshJwk.code, V.missingSshJwk.desc);
    }, e.createMissingSshKidError = function() {
      return new e(V.missingSshKid.code, V.missingSshKid.desc);
    }, e.createMissingNonceAuthenticationHeadersError = function() {
      return new e(V.missingNonceAuthenticationHeader.code, V.missingNonceAuthenticationHeader.desc);
    }, e.createInvalidAuthenticationHeaderError = function(n, r) {
      return new e(V.invalidAuthenticationHeader.code, V.invalidAuthenticationHeader.desc + ". Invalid header: " + n + ". Details: " + r);
    }, e.createAuthorityMismatchError = function() {
      return new e(V.authorityMismatch.code, V.authorityMismatch.desc);
    }, e;
  }(L)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var it = (
  /** @class */
  function() {
    function t(e) {
      var n = this, r = e ? P.trimArrayEntries(qc(e)) : [], i = r ? P.removeEmptyStringsFromArray(r) : [];
      this.validateInputScopes(i), this.scopes = /* @__PURE__ */ new Set(), i.forEach(function(o) {
        return n.scopes.add(o);
      });
    }
    return t.fromString = function(e) {
      var n = e || y.EMPTY_STRING, r = n.split(" ");
      return new t(r);
    }, t.createSearchScopes = function(e) {
      var n = new t(e);
      return n.containsOnlyOIDCScopes() ? n.removeScope(y.OFFLINE_ACCESS_SCOPE) : n.removeOIDCScopes(), n;
    }, t.prototype.validateInputScopes = function(e) {
      if (!e || e.length < 1)
        throw Ee.createEmptyScopesArrayError();
    }, t.prototype.containsScope = function(e) {
      var n = this.printScopesLowerCase().split(" "), r = new t(n);
      return P.isEmpty(e) ? !1 : r.scopes.has(e.toLowerCase());
    }, t.prototype.containsScopeSet = function(e) {
      var n = this;
      return !e || e.scopes.size <= 0 ? !1 : this.scopes.size >= e.scopes.size && e.asArray().every(function(r) {
        return n.containsScope(r);
      });
    }, t.prototype.containsOnlyOIDCScopes = function() {
      var e = this, n = 0;
      return ap.forEach(function(r) {
        e.containsScope(r) && (n += 1);
      }), this.scopes.size === n;
    }, t.prototype.appendScope = function(e) {
      P.isEmpty(e) || this.scopes.add(e.trim());
    }, t.prototype.appendScopes = function(e) {
      var n = this;
      try {
        e.forEach(function(r) {
          return n.appendScope(r);
        });
      } catch (r) {
        throw L.createAppendScopeSetError(r);
      }
    }, t.prototype.removeScope = function(e) {
      if (P.isEmpty(e))
        throw L.createRemoveEmptyScopeFromSetError(e);
      this.scopes.delete(e.trim());
    }, t.prototype.removeOIDCScopes = function() {
      var e = this;
      ap.forEach(function(n) {
        e.scopes.delete(n);
      });
    }, t.prototype.unionScopeSets = function(e) {
      if (!e)
        throw L.createEmptyInputScopeSetError();
      var n = /* @__PURE__ */ new Set();
      return e.scopes.forEach(function(r) {
        return n.add(r.toLowerCase());
      }), this.scopes.forEach(function(r) {
        return n.add(r.toLowerCase());
      }), n;
    }, t.prototype.intersectingScopeSets = function(e) {
      if (!e)
        throw L.createEmptyInputScopeSetError();
      e.containsOnlyOIDCScopes() || e.removeOIDCScopes();
      var n = this.unionScopeSets(e), r = e.getScopeCount(), i = this.getScopeCount(), o = n.size;
      return o < i + r;
    }, t.prototype.getScopeCount = function() {
      return this.scopes.size;
    }, t.prototype.asArray = function() {
      var e = [];
      return this.scopes.forEach(function(n) {
        return e.push(n);
      }), e;
    }, t.prototype.printScopes = function() {
      if (this.scopes) {
        var e = this.asArray();
        return e.join(" ");
      }
      return y.EMPTY_STRING;
    }, t.prototype.printScopesLowerCase = function() {
      return this.printScopes().toLowerCase();
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
function sc(t, e) {
  if (P.isEmpty(t))
    throw L.createClientInfoEmptyError();
  try {
    var n = e.base64Decode(t);
    return JSON.parse(n);
  } catch (r) {
    throw L.createClientInfoDecodingError(r.message);
  }
}
function gi(t) {
  if (P.isEmpty(t))
    throw L.createClientInfoDecodingError("Home account ID was empty.");
  var e = t.split(qe.CLIENT_INFO_SEPARATOR, 2);
  return {
    uid: e[0],
    utid: e.length < 2 ? y.EMPTY_STRING : e[1]
  };
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
var lt;
(function(t) {
  t[t.Default = 0] = "Default", t[t.Adfs = 1] = "Adfs", t[t.Dsts = 2] = "Dsts", t[t.Ciam = 3] = "Ciam";
})(lt || (lt = {}));
/*! @azure/msal-common v13.3.1 2023-10-27 */
var We = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.generateAccountId = function() {
      var e = [this.homeAccountId, this.environment];
      return e.join(qe.CACHE_KEY_SEPARATOR).toLowerCase();
    }, t.prototype.generateAccountKey = function() {
      return t.generateAccountCacheKey({
        homeAccountId: this.homeAccountId,
        environment: this.environment,
        tenantId: this.realm,
        username: this.username,
        localAccountId: this.localAccountId
      });
    }, t.prototype.generateType = function() {
      switch (this.authorityType) {
        case An.ADFS_ACCOUNT_TYPE:
          return Mn.ADFS;
        case An.MSAV1_ACCOUNT_TYPE:
          return Mn.MSA;
        case An.MSSTS_ACCOUNT_TYPE:
          return Mn.MSSTS;
        case An.GENERIC_ACCOUNT_TYPE:
          return Mn.GENERIC;
        default:
          throw L.createUnexpectedAccountTypeError();
      }
    }, t.prototype.getAccountInfo = function() {
      return {
        homeAccountId: this.homeAccountId,
        environment: this.environment,
        tenantId: this.realm,
        username: this.username,
        localAccountId: this.localAccountId,
        name: this.name,
        idTokenClaims: this.idTokenClaims,
        nativeAccountId: this.nativeAccountId
      };
    }, t.generateAccountCacheKey = function(e) {
      var n = [
        e.homeAccountId,
        e.environment || y.EMPTY_STRING,
        e.tenantId || y.EMPTY_STRING
      ];
      return n.join(qe.CACHE_KEY_SEPARATOR).toLowerCase();
    }, t.createAccount = function(e, n, r, i, o, a, s, c) {
      var l, u, d, h, f, m, E = new t();
      E.authorityType = An.MSSTS_ACCOUNT_TYPE, E.clientInfo = e, E.homeAccountId = n, E.nativeAccountId = c;
      var N = s || i && i.getPreferredCache();
      if (!N)
        throw L.createInvalidCacheEnvironmentError();
      if (E.environment = N, E.realm = ((l = r == null ? void 0 : r.claims) === null || l === void 0 ? void 0 : l.tid) || y.EMPTY_STRING, r) {
        E.idTokenClaims = r.claims, E.localAccountId = ((u = r == null ? void 0 : r.claims) === null || u === void 0 ? void 0 : u.oid) || ((d = r == null ? void 0 : r.claims) === null || d === void 0 ? void 0 : d.sub) || y.EMPTY_STRING;
        var g = (h = r == null ? void 0 : r.claims) === null || h === void 0 ? void 0 : h.preferred_username, p = !((f = r == null ? void 0 : r.claims) === null || f === void 0) && f.emails ? r.claims.emails[0] : null;
        E.username = g || p || y.EMPTY_STRING, E.name = (m = r == null ? void 0 : r.claims) === null || m === void 0 ? void 0 : m.name;
      }
      return E.cloudGraphHostName = o, E.msGraphHost = a, E;
    }, t.createGenericAccount = function(e, n, r, i, o, a) {
      var s, c, l, u, d = new t();
      d.authorityType = r && r.authorityType === lt.Adfs ? An.ADFS_ACCOUNT_TYPE : An.GENERIC_ACCOUNT_TYPE, d.homeAccountId = e, d.realm = y.EMPTY_STRING;
      var h = a || r && r.getPreferredCache();
      if (!h)
        throw L.createInvalidCacheEnvironmentError();
      return n && (d.localAccountId = ((s = n == null ? void 0 : n.claims) === null || s === void 0 ? void 0 : s.oid) || ((c = n == null ? void 0 : n.claims) === null || c === void 0 ? void 0 : c.sub) || y.EMPTY_STRING, d.username = ((l = n == null ? void 0 : n.claims) === null || l === void 0 ? void 0 : l.upn) || y.EMPTY_STRING, d.name = ((u = n == null ? void 0 : n.claims) === null || u === void 0 ? void 0 : u.name) || y.EMPTY_STRING, d.idTokenClaims = n == null ? void 0 : n.claims), d.environment = h, d.cloudGraphHostName = i, d.msGraphHost = o, d;
    }, t.generateHomeAccountId = function(e, n, r, i, o) {
      var a, s = !((a = o == null ? void 0 : o.claims) === null || a === void 0) && a.sub ? o.claims.sub : y.EMPTY_STRING;
      if (n === lt.Adfs || n === lt.Dsts)
        return s;
      if (e)
        try {
          var c = sc(e, i);
          if (!P.isEmpty(c.uid) && !P.isEmpty(c.utid))
            return "" + c.uid + qe.CLIENT_INFO_SEPARATOR + c.utid;
        } catch {
        }
      return r.verbose("No client info in response"), s;
    }, t.isAccountEntity = function(e) {
      return e ? e.hasOwnProperty("homeAccountId") && e.hasOwnProperty("environment") && e.hasOwnProperty("realm") && e.hasOwnProperty("localAccountId") && e.hasOwnProperty("username") && e.hasOwnProperty("authorityType") : !1;
    }, t.accountInfoIsEqual = function(e, n, r) {
      if (!e || !n)
        return !1;
      var i = !0;
      if (r) {
        var o = e.idTokenClaims || {}, a = n.idTokenClaims || {};
        i = o.iat === a.iat && o.nonce === a.nonce;
      }
      return e.homeAccountId === n.homeAccountId && e.localAccountId === n.localAccountId && e.username === n.username && e.tenantId === n.tenantId && e.environment === n.environment && e.nativeAccountId === n.nativeAccountId && i;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var mn = (
  /** @class */
  function() {
    function t(e, n) {
      if (P.isEmpty(e))
        throw L.createTokenNullOrEmptyError(e);
      this.rawToken = e, this.claims = t.extractTokenClaims(e, n);
    }
    return t.extractTokenClaims = function(e, n) {
      var r = P.decodeAuthToken(e);
      try {
        var i = r.JWSPayload, o = n.base64Decode(i);
        return JSON.parse(o);
      } catch (a) {
        throw L.createTokenParsingError(a);
      }
    }, t.checkMaxAge = function(e, n) {
      var r = 3e5;
      if (n === 0 || Date.now() - r > e + n)
        throw L.createMaxAgeTranspiredError();
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Et = (
  /** @class */
  function() {
    function t(e, n, r) {
      this.clientId = e, this.cryptoImpl = n, this.commonLogger = r.clone(Zv, ih);
    }
    return t.prototype.getAllAccounts = function() {
      var e = this, n = this.getAccountKeys();
      if (n.length < 1)
        return [];
      var r = n.reduce(function(o, a) {
        var s = e.getAccount(a);
        return s && o.push(s), o;
      }, []);
      if (r.length < 1)
        return [];
      var i = r.map(function(o) {
        return e.getAccountInfoFromEntity(o);
      });
      return i;
    }, t.prototype.getAccountInfoFilteredBy = function(e) {
      var n = this.getAccountsFilteredBy(e);
      return n.length > 0 ? this.getAccountInfoFromEntity(n[0]) : null;
    }, t.prototype.getAccountInfoFromEntity = function(e) {
      var n = e.getAccountInfo(), r = this.getIdToken(n);
      return r && (n.idToken = r.secret, n.idTokenClaims = new mn(r.secret, this.cryptoImpl).claims), n;
    }, t.prototype.saveCacheRecord = function(e) {
      return $(this, void 0, void 0, function() {
        return X(this, function(n) {
          switch (n.label) {
            case 0:
              if (!e)
                throw L.createNullOrUndefinedCacheRecord();
              return e.account && this.setAccount(e.account), e.idToken && this.setIdTokenCredential(e.idToken), e.accessToken ? [4, this.saveAccessToken(e.accessToken)] : [3, 2];
            case 1:
              n.sent(), n.label = 2;
            case 2:
              return e.refreshToken && this.setRefreshTokenCredential(e.refreshToken), e.appMetadata && this.setAppMetadata(e.appMetadata), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.saveAccessToken = function(e) {
      return $(this, void 0, void 0, function() {
        var n, r, i, o, a = this;
        return X(this, function(s) {
          switch (s.label) {
            case 0:
              return n = {
                clientId: e.clientId,
                credentialType: e.credentialType,
                environment: e.environment,
                homeAccountId: e.homeAccountId,
                realm: e.realm,
                tokenType: e.tokenType,
                requestedClaimsHash: e.requestedClaimsHash
              }, r = this.getTokenKeys(), i = it.fromString(e.target), o = [], r.accessToken.forEach(function(c) {
                if (a.accessTokenKeyMatchesFilter(c, n, !1)) {
                  var l = a.getAccessTokenCredential(c);
                  if (l && a.credentialMatchesFilter(l, n)) {
                    var u = it.fromString(l.target);
                    u.intersectingScopeSets(i) && o.push(a.removeAccessToken(c));
                  }
                }
              }), [4, Promise.all(o)];
            case 1:
              return s.sent(), this.setAccessTokenCredential(e), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.getAccountsFilteredBy = function(e) {
      var n = this, r = this.getAccountKeys(), i = [];
      return r.forEach(function(o) {
        if (n.isAccountKey(o, e.homeAccountId, e.realm)) {
          var a = n.getAccount(o);
          a && (e.homeAccountId && !n.matchHomeAccountId(a, e.homeAccountId) || e.localAccountId && !n.matchLocalAccountId(a, e.localAccountId) || e.username && !n.matchUsername(a, e.username) || e.environment && !n.matchEnvironment(a, e.environment) || e.realm && !n.matchRealm(a, e.realm) || e.nativeAccountId && !n.matchNativeAccountId(a, e.nativeAccountId) || i.push(a));
        }
      }), i;
    }, t.prototype.isAccountKey = function(e, n, r) {
      return !(e.split(qe.CACHE_KEY_SEPARATOR).length < 3 || n && !e.toLowerCase().includes(n.toLowerCase()) || r && !e.toLowerCase().includes(r.toLowerCase()));
    }, t.prototype.isCredentialKey = function(e) {
      if (e.split(qe.CACHE_KEY_SEPARATOR).length < 6)
        return !1;
      var n = e.toLowerCase();
      if (n.indexOf(F.ID_TOKEN.toLowerCase()) === -1 && n.indexOf(F.ACCESS_TOKEN.toLowerCase()) === -1 && n.indexOf(F.ACCESS_TOKEN_WITH_AUTH_SCHEME.toLowerCase()) === -1 && n.indexOf(F.REFRESH_TOKEN.toLowerCase()) === -1)
        return !1;
      if (n.indexOf(F.REFRESH_TOKEN.toLowerCase()) > -1) {
        var r = "" + F.REFRESH_TOKEN + qe.CACHE_KEY_SEPARATOR + this.clientId + qe.CACHE_KEY_SEPARATOR, i = "" + F.REFRESH_TOKEN + qe.CACHE_KEY_SEPARATOR + Ko + qe.CACHE_KEY_SEPARATOR;
        if (n.indexOf(r.toLowerCase()) === -1 && n.indexOf(i.toLowerCase()) === -1)
          return !1;
      } else if (n.indexOf(this.clientId.toLowerCase()) === -1)
        return !1;
      return !0;
    }, t.prototype.credentialMatchesFilter = function(e, n) {
      return !(n.clientId && !this.matchClientId(e, n.clientId) || n.userAssertionHash && !this.matchUserAssertionHash(e, n.userAssertionHash) || typeof n.homeAccountId == "string" && !this.matchHomeAccountId(e, n.homeAccountId) || n.environment && !this.matchEnvironment(e, n.environment) || n.realm && !this.matchRealm(e, n.realm) || n.credentialType && !this.matchCredentialType(e, n.credentialType) || n.familyId && !this.matchFamilyId(e, n.familyId) || n.target && !this.matchTarget(e, n.target) || (n.requestedClaimsHash || e.requestedClaimsHash) && e.requestedClaimsHash !== n.requestedClaimsHash || e.credentialType === F.ACCESS_TOKEN_WITH_AUTH_SCHEME && (n.tokenType && !this.matchTokenType(e, n.tokenType) || n.tokenType === ue.SSH && n.keyId && !this.matchKeyId(e, n.keyId)));
    }, t.prototype.getAppMetadataFilteredBy = function(e) {
      return this.getAppMetadataFilteredByInternal(e.environment, e.clientId);
    }, t.prototype.getAppMetadataFilteredByInternal = function(e, n) {
      var r = this, i = this.getKeys(), o = {};
      return i.forEach(function(a) {
        if (r.isAppMetadata(a)) {
          var s = r.getAppMetadata(a);
          s && (e && !r.matchEnvironment(s, e) || n && !r.matchClientId(s, n) || (o[a] = s));
        }
      }), o;
    }, t.prototype.getAuthorityMetadataByAlias = function(e) {
      var n = this, r = this.getAuthorityMetadataKeys(), i = null;
      return r.forEach(function(o) {
        if (!(!n.isAuthorityMetadata(o) || o.indexOf(n.clientId) === -1)) {
          var a = n.getAuthorityMetadata(o);
          a && a.aliases.indexOf(e) !== -1 && (i = a);
        }
      }), i;
    }, t.prototype.removeAllAccounts = function() {
      return $(this, void 0, void 0, function() {
        var e, n, r = this;
        return X(this, function(i) {
          switch (i.label) {
            case 0:
              return e = this.getAccountKeys(), n = [], e.forEach(function(o) {
                n.push(r.removeAccount(o));
              }), [4, Promise.all(n)];
            case 1:
              return i.sent(), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.removeAccount = function(e) {
      return $(this, void 0, void 0, function() {
        var n;
        return X(this, function(r) {
          switch (r.label) {
            case 0:
              if (n = this.getAccount(e), !n)
                throw L.createNoAccountFoundError();
              return [4, this.removeAccountContext(n)];
            case 1:
              return r.sent(), this.removeItem(e), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.removeAccountContext = function(e) {
      return $(this, void 0, void 0, function() {
        var n, r, i, o = this;
        return X(this, function(a) {
          switch (a.label) {
            case 0:
              return n = this.getTokenKeys(), r = e.generateAccountId(), i = [], n.idToken.forEach(function(s) {
                s.indexOf(r) === 0 && o.removeIdToken(s);
              }), n.accessToken.forEach(function(s) {
                s.indexOf(r) === 0 && i.push(o.removeAccessToken(s));
              }), n.refreshToken.forEach(function(s) {
                s.indexOf(r) === 0 && o.removeRefreshToken(s);
              }), [4, Promise.all(i)];
            case 1:
              return a.sent(), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.removeAccessToken = function(e) {
      return $(this, void 0, void 0, function() {
        var n, r, i;
        return X(this, function(o) {
          switch (o.label) {
            case 0:
              if (n = this.getAccessTokenCredential(e), !n)
                return [
                  2
                  /*return*/
                ];
              if (n.credentialType.toLowerCase() !== F.ACCESS_TOKEN_WITH_AUTH_SCHEME.toLowerCase())
                return [3, 4];
              if (n.tokenType !== ue.POP)
                return [3, 4];
              if (r = n, i = r.keyId, !i)
                return [3, 4];
              o.label = 1;
            case 1:
              return o.trys.push([1, 3, , 4]), [4, this.cryptoImpl.removeTokenBindingKey(i)];
            case 2:
              return o.sent(), [3, 4];
            case 3:
              throw o.sent(), L.createBindingKeyNotRemovedError();
            case 4:
              return [2, this.removeItem(e)];
          }
        });
      });
    }, t.prototype.removeAppMetadata = function() {
      var e = this, n = this.getKeys();
      return n.forEach(function(r) {
        e.isAppMetadata(r) && e.removeItem(r);
      }), !0;
    }, t.prototype.readCacheRecord = function(e, n, r) {
      var i = this.getTokenKeys(), o = this.readAccountFromCache(e), a = this.getIdToken(e, i), s = this.getAccessToken(e, n, i), c = this.getRefreshToken(e, !1, i), l = this.readAppMetadataFromCache(r);
      return o && a && (o.idTokenClaims = new mn(a.secret, this.cryptoImpl).claims), {
        account: o,
        idToken: a,
        accessToken: s,
        refreshToken: c,
        appMetadata: l
      };
    }, t.prototype.readAccountFromCache = function(e) {
      var n = We.generateAccountCacheKey(e);
      return this.getAccount(n);
    }, t.prototype.getIdToken = function(e, n) {
      var r = this;
      this.commonLogger.trace("CacheManager - getIdToken called");
      var i = {
        homeAccountId: e.homeAccountId,
        environment: e.environment,
        credentialType: F.ID_TOKEN,
        clientId: this.clientId,
        realm: e.tenantId
      }, o = this.getIdTokensByFilter(i, n), a = o.length;
      return a < 1 ? (this.commonLogger.info("CacheManager:getIdToken - No token found"), null) : a > 1 ? (this.commonLogger.info("CacheManager:getIdToken - Multiple id tokens found, clearing them"), o.forEach(function(s) {
        r.removeIdToken(s.generateCredentialKey());
      }), null) : (this.commonLogger.info("CacheManager:getIdToken - Returning id token"), o[0]);
    }, t.prototype.getIdTokensByFilter = function(e, n) {
      var r = this, i = n && n.idToken || this.getTokenKeys().idToken, o = [];
      return i.forEach(function(a) {
        if (r.idTokenKeyMatchesFilter(a, ce({ clientId: r.clientId }, e))) {
          var s = r.getIdTokenCredential(a);
          s && r.credentialMatchesFilter(s, e) && o.push(s);
        }
      }), o;
    }, t.prototype.idTokenKeyMatchesFilter = function(e, n) {
      var r = e.toLowerCase();
      return !(n.clientId && r.indexOf(n.clientId.toLowerCase()) === -1 || n.homeAccountId && r.indexOf(n.homeAccountId.toLowerCase()) === -1);
    }, t.prototype.removeIdToken = function(e) {
      this.removeItem(e);
    }, t.prototype.removeRefreshToken = function(e) {
      this.removeItem(e);
    }, t.prototype.getAccessToken = function(e, n, r) {
      var i = this;
      this.commonLogger.trace("CacheManager - getAccessToken called");
      var o = it.createSearchScopes(n.scopes), a = n.authenticationScheme || ue.BEARER, s = a && a.toLowerCase() !== ue.BEARER.toLowerCase() ? F.ACCESS_TOKEN_WITH_AUTH_SCHEME : F.ACCESS_TOKEN, c = {
        homeAccountId: e.homeAccountId,
        environment: e.environment,
        credentialType: s,
        clientId: this.clientId,
        realm: e.tenantId,
        target: o,
        tokenType: a,
        keyId: n.sshKid,
        requestedClaimsHash: n.requestedClaimsHash
      }, l = r && r.accessToken || this.getTokenKeys().accessToken, u = [];
      l.forEach(function(h) {
        if (i.accessTokenKeyMatchesFilter(h, c, !0)) {
          var f = i.getAccessTokenCredential(h);
          f && i.credentialMatchesFilter(f, c) && u.push(f);
        }
      });
      var d = u.length;
      return d < 1 ? (this.commonLogger.info("CacheManager:getAccessToken - No token found"), null) : d > 1 ? (this.commonLogger.info("CacheManager:getAccessToken - Multiple access tokens found, clearing them"), u.forEach(function(h) {
        i.removeAccessToken(h.generateCredentialKey());
      }), null) : (this.commonLogger.info("CacheManager:getAccessToken - Returning access token"), u[0]);
    }, t.prototype.accessTokenKeyMatchesFilter = function(e, n, r) {
      var i = e.toLowerCase();
      if (n.clientId && i.indexOf(n.clientId.toLowerCase()) === -1 || n.homeAccountId && i.indexOf(n.homeAccountId.toLowerCase()) === -1 || n.realm && i.indexOf(n.realm.toLowerCase()) === -1 || n.requestedClaimsHash && i.indexOf(n.requestedClaimsHash.toLowerCase()) === -1)
        return !1;
      if (n.target)
        for (var o = n.target.asArray(), a = 0; a < o.length; a++) {
          if (r && !i.includes(o[a].toLowerCase()))
            return !1;
          if (!r && i.includes(o[a].toLowerCase()))
            return !0;
        }
      return !0;
    }, t.prototype.getAccessTokensByFilter = function(e) {
      var n = this, r = this.getTokenKeys(), i = [];
      return r.accessToken.forEach(function(o) {
        if (n.accessTokenKeyMatchesFilter(o, e, !0)) {
          var a = n.getAccessTokenCredential(o);
          a && n.credentialMatchesFilter(a, e) && i.push(a);
        }
      }), i;
    }, t.prototype.getRefreshToken = function(e, n, r) {
      var i = this;
      this.commonLogger.trace("CacheManager - getRefreshToken called");
      var o = n ? Ko : void 0, a = {
        homeAccountId: e.homeAccountId,
        environment: e.environment,
        credentialType: F.REFRESH_TOKEN,
        clientId: this.clientId,
        familyId: o
      }, s = r && r.refreshToken || this.getTokenKeys().refreshToken, c = [];
      s.forEach(function(u) {
        if (i.refreshTokenKeyMatchesFilter(u, a)) {
          var d = i.getRefreshTokenCredential(u);
          d && i.credentialMatchesFilter(d, a) && c.push(d);
        }
      });
      var l = c.length;
      return l < 1 ? (this.commonLogger.info("CacheManager:getRefreshToken - No refresh token found."), null) : (this.commonLogger.info("CacheManager:getRefreshToken - returning refresh token"), c[0]);
    }, t.prototype.refreshTokenKeyMatchesFilter = function(e, n) {
      var r = e.toLowerCase();
      return !(n.familyId && r.indexOf(n.familyId.toLowerCase()) === -1 || !n.familyId && n.clientId && r.indexOf(n.clientId.toLowerCase()) === -1 || n.homeAccountId && r.indexOf(n.homeAccountId.toLowerCase()) === -1);
    }, t.prototype.readAppMetadataFromCache = function(e) {
      var n = {
        environment: e,
        clientId: this.clientId
      }, r = this.getAppMetadataFilteredBy(n), i = Object.keys(r).map(function(a) {
        return r[a];
      }), o = i.length;
      if (o < 1)
        return null;
      if (o > 1)
        throw L.createMultipleMatchingAppMetadataInCacheError();
      return i[0];
    }, t.prototype.isAppMetadataFOCI = function(e) {
      var n = this.readAppMetadataFromCache(e);
      return !!(n && n.familyId === Ko);
    }, t.prototype.matchHomeAccountId = function(e, n) {
      return typeof e.homeAccountId == "string" && n === e.homeAccountId;
    }, t.prototype.matchLocalAccountId = function(e, n) {
      return typeof e.localAccountId == "string" && n === e.localAccountId;
    }, t.prototype.matchUsername = function(e, n) {
      return typeof e.username == "string" && n.toLowerCase() === e.username.toLowerCase();
    }, t.prototype.matchUserAssertionHash = function(e, n) {
      return !!(e.userAssertionHash && n === e.userAssertionHash);
    }, t.prototype.matchEnvironment = function(e, n) {
      var r = this.getAuthorityMetadataByAlias(n);
      return !!(r && r.aliases.indexOf(e.environment) > -1);
    }, t.prototype.matchCredentialType = function(e, n) {
      return e.credentialType && n.toLowerCase() === e.credentialType.toLowerCase();
    }, t.prototype.matchClientId = function(e, n) {
      return !!(e.clientId && n === e.clientId);
    }, t.prototype.matchFamilyId = function(e, n) {
      return !!(e.familyId && n === e.familyId);
    }, t.prototype.matchRealm = function(e, n) {
      return !!(e.realm && n === e.realm);
    }, t.prototype.matchNativeAccountId = function(e, n) {
      return !!(e.nativeAccountId && n === e.nativeAccountId);
    }, t.prototype.matchTarget = function(e, n) {
      var r = e.credentialType !== F.ACCESS_TOKEN && e.credentialType !== F.ACCESS_TOKEN_WITH_AUTH_SCHEME;
      if (r || !e.target)
        return !1;
      var i = it.fromString(e.target);
      return i.containsScopeSet(n);
    }, t.prototype.matchTokenType = function(e, n) {
      return !!(e.tokenType && e.tokenType === n);
    }, t.prototype.matchKeyId = function(e, n) {
      return !!(e.keyId && e.keyId === n);
    }, t.prototype.isAppMetadata = function(e) {
      return e.indexOf(Lu) !== -1;
    }, t.prototype.isAuthorityMetadata = function(e) {
      return e.indexOf(Fo.CACHE_KEY) !== -1;
    }, t.prototype.generateAuthorityMetadataCacheKey = function(e) {
      return Fo.CACHE_KEY + "-" + this.clientId + "-" + e;
    }, t.toObject = function(e, n) {
      for (var r in n)
        e[r] = n[r];
      return e;
    }, t;
  }()
), kw = (
  /** @class */
  function(t) {
    wt(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.setAccount = function() {
      var n = "Storage interface - setAccount() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getAccount = function() {
      var n = "Storage interface - getAccount() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setIdTokenCredential = function() {
      var n = "Storage interface - setIdTokenCredential() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getIdTokenCredential = function() {
      var n = "Storage interface - getIdTokenCredential() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setAccessTokenCredential = function() {
      var n = "Storage interface - setAccessTokenCredential() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getAccessTokenCredential = function() {
      var n = "Storage interface - getAccessTokenCredential() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setRefreshTokenCredential = function() {
      var n = "Storage interface - setRefreshTokenCredential() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getRefreshTokenCredential = function() {
      var n = "Storage interface - getRefreshTokenCredential() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setAppMetadata = function() {
      var n = "Storage interface - setAppMetadata() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getAppMetadata = function() {
      var n = "Storage interface - getAppMetadata() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setServerTelemetry = function() {
      var n = "Storage interface - setServerTelemetry() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getServerTelemetry = function() {
      var n = "Storage interface - getServerTelemetry() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setAuthorityMetadata = function() {
      var n = "Storage interface - setAuthorityMetadata() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getAuthorityMetadata = function() {
      var n = "Storage interface - getAuthorityMetadata() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getAuthorityMetadataKeys = function() {
      var n = "Storage interface - getAuthorityMetadataKeys() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.setThrottlingCache = function() {
      var n = "Storage interface - setThrottlingCache() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getThrottlingCache = function() {
      var n = "Storage interface - getThrottlingCache() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.removeItem = function() {
      var n = "Storage interface - removeItem() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.containsKey = function() {
      var n = "Storage interface - containsKey() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getKeys = function() {
      var n = "Storage interface - getKeys() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getAccountKeys = function() {
      var n = "Storage interface - getAccountKeys() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.getTokenKeys = function() {
      var n = "Storage interface - getTokenKeys() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e.prototype.clear = function() {
      return $(this, void 0, void 0, function() {
        var n;
        return X(this, function(r) {
          throw n = "Storage interface - clear() has not been implemented for the cacheStorage interface.", K.createUnexpectedError(n);
        });
      });
    }, e.prototype.updateCredentialCacheKey = function() {
      var n = "Storage interface - updateCredentialCacheKey() has not been implemented for the cacheStorage interface.";
      throw K.createUnexpectedError(n);
    }, e;
  }(Et)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Uw = 300, Wv = {
  tokenRenewalOffsetSeconds: Uw,
  preventCorsPreflight: !1
}, Dw = {
  loggerCallback: function() {
  },
  piiLoggingEnabled: !1,
  logLevel: Ie.Info,
  correlationId: y.EMPTY_STRING
}, Pw = {
  claimsBasedCachingEnabled: !0
}, Hw = {
  sendGetRequestAsync: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Network interface - sendGetRequestAsync() has not been implemented", K.createUnexpectedError(t);
      });
    });
  },
  sendPostRequestAsync: function() {
    return $(this, void 0, void 0, function() {
      var t;
      return X(this, function(e) {
        throw t = "Network interface - sendPostRequestAsync() has not been implemented", K.createUnexpectedError(t);
      });
    });
  }
}, Lw = {
  sku: y.SKU,
  version: ih,
  cpu: y.EMPTY_STRING,
  os: y.EMPTY_STRING
}, xw = {
  clientSecret: y.EMPTY_STRING,
  clientAssertion: void 0
}, qw = {
  azureCloudInstance: ha.None,
  tenant: "" + y.DEFAULT_COMMON_TENANT
}, Bw = {
  application: {
    appName: "",
    appVersion: ""
  }
};
function zw(t) {
  var e = t.authOptions, n = t.systemOptions, r = t.loggerOptions, i = t.cacheOptions, o = t.storageInterface, a = t.networkInterface, s = t.cryptoInterface, c = t.clientCredentials, l = t.libraryInfo, u = t.telemetry, d = t.serverTelemetryManager, h = t.persistencePlugin, f = t.serializableCache, m = ce(ce({}, Dw), r);
  return {
    authOptions: Gw(e),
    systemOptions: ce(ce({}, Wv), n),
    loggerOptions: m,
    cacheOptions: ce(ce({}, Pw), i),
    storageInterface: o || new kw(e.clientId, ac, new Bc(m)),
    networkInterface: a || Hw,
    cryptoInterface: s || ac,
    clientCredentials: c || xw,
    libraryInfo: ce(ce({}, Lw), l),
    telemetry: ce(ce({}, Bw), u),
    serverTelemetryManager: d || null,
    persistencePlugin: h || null,
    serializableCache: f || null
  };
}
function Gw(t) {
  return ce({ clientCapabilities: [], azureCloudOptions: qw, skipAuthorityMetadataCache: !1 }, t);
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Br = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r, i) {
      var o = t.call(this, n, r, i) || this;
      return o.name = "ServerError", Object.setPrototypeOf(o, e.prototype), o;
    }
    return e;
  }(K)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var cc = (
  /** @class */
  function() {
    function t() {
    }
    return t.generateThrottlingStorageKey = function(e) {
      return jo.THROTTLING_PREFIX + "." + JSON.stringify(e);
    }, t.preProcess = function(e, n) {
      var r, i = t.generateThrottlingStorageKey(n), o = e.getThrottlingCache(i);
      if (o) {
        if (o.throttleTime < Date.now()) {
          e.removeItem(i);
          return;
        }
        throw new Br(((r = o.errorCodes) === null || r === void 0 ? void 0 : r.join(" ")) || y.EMPTY_STRING, o.errorMessage, o.subError);
      }
    }, t.postProcess = function(e, n, r) {
      if (t.checkResponseStatus(r) || t.checkResponseForRetryAfter(r)) {
        var i = {
          throttleTime: t.calculateThrottleTime(parseInt(r.headers[Nt.RETRY_AFTER])),
          error: r.body.error,
          errorCodes: r.body.error_codes,
          errorMessage: r.body.error_description,
          subError: r.body.suberror
        };
        e.setThrottlingCache(t.generateThrottlingStorageKey(n), i);
      }
    }, t.checkResponseStatus = function(e) {
      return e.status === 429 || e.status >= 500 && e.status < 600;
    }, t.checkResponseForRetryAfter = function(e) {
      return e.headers ? e.headers.hasOwnProperty(Nt.RETRY_AFTER) && (e.status < 200 || e.status >= 300) : !1;
    }, t.calculateThrottleTime = function(e) {
      var n = e <= 0 ? 0 : e, r = Date.now() / 1e3;
      return Math.floor(Math.min(r + (n || jo.DEFAULT_THROTTLE_TIME_SECONDS), r + jo.DEFAULT_MAX_THROTTLE_TIME_SECONDS) * 1e3);
    }, t.removeThrottle = function(e, n, r, i) {
      var o = {
        clientId: n,
        authority: r.authority,
        scopes: r.scopes,
        homeAccountIdentifier: i,
        claims: r.claims,
        authenticationScheme: r.authenticationScheme,
        resourceRequestMethod: r.resourceRequestMethod,
        resourceRequestUri: r.resourceRequestUri,
        shrClaims: r.shrClaims,
        sshKid: r.sshKid
      }, a = this.generateThrottlingStorageKey(o);
      e.removeItem(a);
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Kw = (
  /** @class */
  function() {
    function t(e, n) {
      this.networkClient = e, this.cacheManager = n;
    }
    return t.prototype.sendPostRequest = function(e, n, r) {
      return $(this, void 0, void 0, function() {
        var i, o;
        return X(this, function(a) {
          switch (a.label) {
            case 0:
              cc.preProcess(this.cacheManager, e), a.label = 1;
            case 1:
              return a.trys.push([1, 3, , 4]), [4, this.networkClient.sendPostRequestAsync(n, r)];
            case 2:
              return i = a.sent(), [3, 4];
            case 3:
              throw o = a.sent(), o instanceof K ? o : L.createNetworkError(n, o);
            case 4:
              return cc.postProcess(this.cacheManager, e, i), [2, i];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Rt;
(function(t) {
  t.HOME_ACCOUNT_ID = "home_account_id", t.UPN = "UPN";
})(Rt || (Rt = {}));
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Er = (
  /** @class */
  function() {
    function t() {
    }
    return t.validateRedirectUri = function(e) {
      if (P.isEmpty(e))
        throw Ee.createRedirectUriEmptyError();
    }, t.validatePrompt = function(e) {
      var n = [];
      for (var r in st)
        n.push(st[r]);
      if (n.indexOf(e) < 0)
        throw Ee.createInvalidPromptError(e);
    }, t.validateClaims = function(e) {
      try {
        JSON.parse(e);
      } catch {
        throw Ee.createInvalidClaimsRequestError();
      }
    }, t.validateCodeChallengeParams = function(e, n) {
      if (P.isEmpty(e) || P.isEmpty(n))
        throw Ee.createInvalidCodeChallengeParamsError();
      this.validateCodeChallengeMethod(n);
    }, t.validateCodeChallengeMethod = function(e) {
      if ([
        sp.PLAIN,
        sp.S256
      ].indexOf(e) < 0)
        throw Ee.createInvalidCodeChallengeMethodError();
    }, t.sanitizeEQParams = function(e, n) {
      return e ? (n.forEach(function(r, i) {
        e[i] && delete e[i];
      }), Object.fromEntries(Object.entries(e).filter(function(r) {
        var i = r[1];
        return i !== "";
      }))) : {};
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Qo = (
  /** @class */
  function() {
    function t() {
      this.parameters = /* @__PURE__ */ new Map();
    }
    return t.prototype.addResponseTypeCode = function() {
      this.parameters.set(J.RESPONSE_TYPE, encodeURIComponent(y.CODE_RESPONSE_TYPE));
    }, t.prototype.addResponseTypeForTokenAndIdToken = function() {
      this.parameters.set(J.RESPONSE_TYPE, encodeURIComponent(y.TOKEN_RESPONSE_TYPE + " " + y.ID_TOKEN_RESPONSE_TYPE));
    }, t.prototype.addResponseMode = function(e) {
      this.parameters.set(J.RESPONSE_MODE, encodeURIComponent(e || rc.QUERY));
    }, t.prototype.addNativeBroker = function() {
      this.parameters.set(J.NATIVE_BROKER, encodeURIComponent("1"));
    }, t.prototype.addScopes = function(e, n) {
      n === void 0 && (n = !0);
      var r = n ? qc(e || [], Aa) : e || [], i = new it(r);
      this.parameters.set(J.SCOPE, encodeURIComponent(i.printScopes()));
    }, t.prototype.addClientId = function(e) {
      this.parameters.set(J.CLIENT_ID, encodeURIComponent(e));
    }, t.prototype.addRedirectUri = function(e) {
      Er.validateRedirectUri(e), this.parameters.set(J.REDIRECT_URI, encodeURIComponent(e));
    }, t.prototype.addPostLogoutRedirectUri = function(e) {
      Er.validateRedirectUri(e), this.parameters.set(J.POST_LOGOUT_URI, encodeURIComponent(e));
    }, t.prototype.addIdTokenHint = function(e) {
      this.parameters.set(J.ID_TOKEN_HINT, encodeURIComponent(e));
    }, t.prototype.addDomainHint = function(e) {
      this.parameters.set(Go.DOMAIN_HINT, encodeURIComponent(e));
    }, t.prototype.addLoginHint = function(e) {
      this.parameters.set(Go.LOGIN_HINT, encodeURIComponent(e));
    }, t.prototype.addCcsUpn = function(e) {
      this.parameters.set(Nt.CCS_HEADER, encodeURIComponent("UPN:" + e));
    }, t.prototype.addCcsOid = function(e) {
      this.parameters.set(Nt.CCS_HEADER, encodeURIComponent("Oid:" + e.uid + "@" + e.utid));
    }, t.prototype.addSid = function(e) {
      this.parameters.set(Go.SID, encodeURIComponent(e));
    }, t.prototype.addClaims = function(e, n) {
      var r = this.addClientCapabilitiesToClaims(e, n);
      Er.validateClaims(r), this.parameters.set(J.CLAIMS, encodeURIComponent(r));
    }, t.prototype.addCorrelationId = function(e) {
      this.parameters.set(J.CLIENT_REQUEST_ID, encodeURIComponent(e));
    }, t.prototype.addLibraryInfo = function(e) {
      this.parameters.set(J.X_CLIENT_SKU, e.sku), this.parameters.set(J.X_CLIENT_VER, e.version), e.os && this.parameters.set(J.X_CLIENT_OS, e.os), e.cpu && this.parameters.set(J.X_CLIENT_CPU, e.cpu);
    }, t.prototype.addApplicationTelemetry = function(e) {
      e != null && e.appName && this.parameters.set(J.X_APP_NAME, e.appName), e != null && e.appVersion && this.parameters.set(J.X_APP_VER, e.appVersion);
    }, t.prototype.addPrompt = function(e) {
      Er.validatePrompt(e), this.parameters.set("" + J.PROMPT, encodeURIComponent(e));
    }, t.prototype.addState = function(e) {
      P.isEmpty(e) || this.parameters.set(J.STATE, encodeURIComponent(e));
    }, t.prototype.addNonce = function(e) {
      this.parameters.set(J.NONCE, encodeURIComponent(e));
    }, t.prototype.addCodeChallengeParams = function(e, n) {
      if (Er.validateCodeChallengeParams(e, n), e && n)
        this.parameters.set(J.CODE_CHALLENGE, encodeURIComponent(e)), this.parameters.set(J.CODE_CHALLENGE_METHOD, encodeURIComponent(n));
      else
        throw Ee.createInvalidCodeChallengeParamsError();
    }, t.prototype.addAuthorizationCode = function(e) {
      this.parameters.set(J.CODE, encodeURIComponent(e));
    }, t.prototype.addDeviceCode = function(e) {
      this.parameters.set(J.DEVICE_CODE, encodeURIComponent(e));
    }, t.prototype.addRefreshToken = function(e) {
      this.parameters.set(J.REFRESH_TOKEN, encodeURIComponent(e));
    }, t.prototype.addCodeVerifier = function(e) {
      this.parameters.set(J.CODE_VERIFIER, encodeURIComponent(e));
    }, t.prototype.addClientSecret = function(e) {
      this.parameters.set(J.CLIENT_SECRET, encodeURIComponent(e));
    }, t.prototype.addClientAssertion = function(e) {
      P.isEmpty(e) || this.parameters.set(J.CLIENT_ASSERTION, encodeURIComponent(e));
    }, t.prototype.addClientAssertionType = function(e) {
      P.isEmpty(e) || this.parameters.set(J.CLIENT_ASSERTION_TYPE, encodeURIComponent(e));
    }, t.prototype.addOboAssertion = function(e) {
      this.parameters.set(J.OBO_ASSERTION, encodeURIComponent(e));
    }, t.prototype.addRequestTokenUse = function(e) {
      this.parameters.set(J.REQUESTED_TOKEN_USE, encodeURIComponent(e));
    }, t.prototype.addGrantType = function(e) {
      this.parameters.set(J.GRANT_TYPE, encodeURIComponent(e));
    }, t.prototype.addClientInfo = function() {
      this.parameters.set(Mw, "1");
    }, t.prototype.addExtraQueryParameters = function(e) {
      var n = this, r = Er.sanitizeEQParams(e, this.parameters);
      Object.keys(r).forEach(function(i) {
        n.parameters.set(i, e[i]);
      });
    }, t.prototype.addClientCapabilitiesToClaims = function(e, n) {
      var r;
      if (!e)
        r = {};
      else
        try {
          r = JSON.parse(e);
        } catch {
          throw Ee.createInvalidClaimsRequestError();
        }
      return n && n.length > 0 && (r.hasOwnProperty(fi.ACCESS_TOKEN) || (r[fi.ACCESS_TOKEN] = {}), r[fi.ACCESS_TOKEN][fi.XMS_CC] = {
        values: n
      }), JSON.stringify(r);
    }, t.prototype.addUsername = function(e) {
      this.parameters.set(oc.username, encodeURIComponent(e));
    }, t.prototype.addPassword = function(e) {
      this.parameters.set(oc.password, encodeURIComponent(e));
    }, t.prototype.addPopToken = function(e) {
      P.isEmpty(e) || (this.parameters.set(J.TOKEN_TYPE, ue.POP), this.parameters.set(J.REQ_CNF, encodeURIComponent(e)));
    }, t.prototype.addSshJwk = function(e) {
      P.isEmpty(e) || (this.parameters.set(J.TOKEN_TYPE, ue.SSH), this.parameters.set(J.REQ_CNF, encodeURIComponent(e)));
    }, t.prototype.addServerTelemetry = function(e) {
      this.parameters.set(J.X_CLIENT_CURR_TELEM, e.generateCurrentRequestHeaderValue()), this.parameters.set(J.X_CLIENT_LAST_TELEM, e.generateLastRequestHeaderValue());
    }, t.prototype.addThrottling = function() {
      this.parameters.set(J.X_MS_LIB_CAPABILITY, jo.X_MS_LIB_CAPABILITY_VALUE);
    }, t.prototype.addLogoutHint = function(e) {
      this.parameters.set(J.LOGOUT_HINT, encodeURIComponent(e));
    }, t.prototype.createQueryString = function() {
      var e = new Array();
      return this.parameters.forEach(function(n, r) {
        e.push(r + "=" + n);
      }), e.join("&");
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var oh = (
  /** @class */
  function() {
    function t(e, n) {
      this.config = zw(e), this.logger = new Bc(this.config.loggerOptions, Zv, ih), this.cryptoUtils = this.config.cryptoInterface, this.cacheManager = this.config.storageInterface, this.networkClient = this.config.networkInterface, this.networkManager = new Kw(this.networkClient, this.cacheManager), this.serverTelemetryManager = this.config.serverTelemetryManager, this.authority = this.config.authOptions.authority, this.performanceClient = n;
    }
    return t.prototype.createTokenRequestHeaders = function(e) {
      var n = {};
      if (n[Nt.CONTENT_TYPE] = y.URL_FORM_CONTENT_TYPE, !this.config.systemOptions.preventCorsPreflight && e)
        switch (e.type) {
          case Rt.HOME_ACCOUNT_ID:
            try {
              var r = gi(e.credential);
              n[Nt.CCS_HEADER] = "Oid:" + r.uid + "@" + r.utid;
            } catch (i) {
              this.logger.verbose("Could not parse home account ID for CCS Header: " + i);
            }
            break;
          case Rt.UPN:
            n[Nt.CCS_HEADER] = "UPN: " + e.credential;
            break;
        }
      return n;
    }, t.prototype.executePostToTokenEndpoint = function(e, n, r, i) {
      return $(this, void 0, void 0, function() {
        var o;
        return X(this, function(a) {
          switch (a.label) {
            case 0:
              return [4, this.networkManager.sendPostRequest(i, e, { body: n, headers: r })];
            case 1:
              return o = a.sent(), this.config.serverTelemetryManager && o.status < 500 && o.status !== 429 && this.config.serverTelemetryManager.clearTelemetryCache(), [2, o];
          }
        });
      });
    }, t.prototype.updateAuthority = function(e) {
      if (!e.discoveryComplete())
        throw L.createEndpointDiscoveryIncompleteError("Updated authority has not completed endpoint discovery.");
      this.authority = e;
    }, t.prototype.createTokenQueryParameters = function(e) {
      var n = new Qo();
      return e.tokenQueryParameters && n.addExtraQueryParameters(e.tokenQueryParameters), n.createQueryString();
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ah = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.generateAccountId = function() {
      return t.generateAccountIdForCacheKey(this.homeAccountId, this.environment);
    }, t.prototype.generateCredentialId = function() {
      return t.generateCredentialIdForCacheKey(this.credentialType, this.clientId, this.realm, this.familyId);
    }, t.prototype.generateTarget = function() {
      return t.generateTargetForCacheKey(this.target);
    }, t.prototype.generateCredentialKey = function() {
      return t.generateCredentialCacheKey(this.homeAccountId, this.environment, this.credentialType, this.clientId, this.realm, this.target, this.familyId, this.tokenType, this.requestedClaimsHash);
    }, t.prototype.generateType = function() {
      switch (this.credentialType) {
        case F.ID_TOKEN:
          return Mn.ID_TOKEN;
        case F.ACCESS_TOKEN:
        case F.ACCESS_TOKEN_WITH_AUTH_SCHEME:
          return Mn.ACCESS_TOKEN;
        case F.REFRESH_TOKEN:
          return Mn.REFRESH_TOKEN;
        default:
          throw L.createUnexpectedCredentialTypeError();
      }
    }, t.generateCredentialCacheKey = function(e, n, r, i, o, a, s, c, l) {
      var u = [
        this.generateAccountIdForCacheKey(e, n),
        this.generateCredentialIdForCacheKey(r, i, o, s),
        this.generateTargetForCacheKey(a),
        this.generateClaimsHashForCacheKey(l),
        this.generateSchemeForCacheKey(c)
      ];
      return u.join(qe.CACHE_KEY_SEPARATOR).toLowerCase();
    }, t.generateAccountIdForCacheKey = function(e, n) {
      var r = [e, n];
      return r.join(qe.CACHE_KEY_SEPARATOR).toLowerCase();
    }, t.generateCredentialIdForCacheKey = function(e, n, r, i) {
      var o = e === F.REFRESH_TOKEN && i || n, a = [
        e,
        o,
        r || y.EMPTY_STRING
      ];
      return a.join(qe.CACHE_KEY_SEPARATOR).toLowerCase();
    }, t.generateTargetForCacheKey = function(e) {
      return (e || y.EMPTY_STRING).toLowerCase();
    }, t.generateClaimsHashForCacheKey = function(e) {
      return (e || y.EMPTY_STRING).toLowerCase();
    }, t.generateSchemeForCacheKey = function(e) {
      return e && e.toLowerCase() !== ue.BEARER.toLowerCase() ? e.toLowerCase() : y.EMPTY_STRING;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var br = (
  /** @class */
  function(t) {
    wt(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.createIdTokenEntity = function(n, r, i, o, a) {
      var s = new e();
      return s.credentialType = F.ID_TOKEN, s.homeAccountId = n, s.environment = r, s.clientId = o, s.secret = i, s.realm = a, s;
    }, e.isIdTokenEntity = function(n) {
      return n ? n.hasOwnProperty("homeAccountId") && n.hasOwnProperty("environment") && n.hasOwnProperty("credentialType") && n.hasOwnProperty("realm") && n.hasOwnProperty("clientId") && n.hasOwnProperty("secret") && n.credentialType === F.ID_TOKEN : !1;
    }, e;
  }(ah)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Bt = (
  /** @class */
  function() {
    function t() {
    }
    return t.nowSeconds = function() {
      return Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    }, t.isTokenExpired = function(e, n) {
      var r = Number(e) || 0, i = t.nowSeconds() + n;
      return i > r;
    }, t.wasClockTurnedBack = function(e) {
      var n = Number(e);
      return n > t.nowSeconds();
    }, t.delay = function(e, n) {
      return new Promise(function(r) {
        return setTimeout(function() {
          return r(n);
        }, e);
      });
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Rr = (
  /** @class */
  function(t) {
    wt(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.createAccessTokenEntity = function(n, r, i, o, a, s, c, l, u, d, h, f, m, E, N) {
      var g, p, v = new e();
      v.homeAccountId = n, v.credentialType = F.ACCESS_TOKEN, v.secret = i;
      var C = Bt.nowSeconds();
      if (v.cachedAt = C.toString(), v.expiresOn = c.toString(), v.extendedExpiresOn = l.toString(), d && (v.refreshOn = d.toString()), v.environment = r, v.clientId = o, v.realm = a, v.target = s, v.userAssertionHash = f, v.tokenType = P.isEmpty(h) ? ue.BEARER : h, E && (v.requestedClaims = E, v.requestedClaimsHash = N), ((g = v.tokenType) === null || g === void 0 ? void 0 : g.toLowerCase()) !== ue.BEARER.toLowerCase())
        switch (v.credentialType = F.ACCESS_TOKEN_WITH_AUTH_SCHEME, v.tokenType) {
          case ue.POP:
            var k = mn.extractTokenClaims(i, u);
            if (!(!((p = k == null ? void 0 : k.cnf) === null || p === void 0) && p.kid))
              throw L.createTokenClaimsRequiredError();
            v.keyId = k.cnf.kid;
            break;
          case ue.SSH:
            v.keyId = m;
        }
      return v;
    }, e.isAccessTokenEntity = function(n) {
      return n ? n.hasOwnProperty("homeAccountId") && n.hasOwnProperty("environment") && n.hasOwnProperty("credentialType") && n.hasOwnProperty("realm") && n.hasOwnProperty("clientId") && n.hasOwnProperty("secret") && n.hasOwnProperty("target") && (n.credentialType === F.ACCESS_TOKEN || n.credentialType === F.ACCESS_TOKEN_WITH_AUTH_SCHEME) : !1;
    }, e;
  }(ah)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var mi = (
  /** @class */
  function(t) {
    wt(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.createRefreshTokenEntity = function(n, r, i, o, a, s) {
      var c = new e();
      return c.clientId = o, c.credentialType = F.REFRESH_TOKEN, c.environment = r, c.homeAccountId = n, c.secret = i, c.userAssertionHash = s, a && (c.familyId = a), c;
    }, e.isRefreshTokenEntity = function(n) {
      return n ? n.hasOwnProperty("homeAccountId") && n.hasOwnProperty("environment") && n.hasOwnProperty("credentialType") && n.hasOwnProperty("clientId") && n.hasOwnProperty("secret") && n.credentialType === F.REFRESH_TOKEN : !1;
    }, e;
  }(ah)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var lp = [
  "interaction_required",
  "consent_required",
  "login_required"
], Fw = [
  "message_only",
  "additional_action",
  "basic_action",
  "user_password_expired",
  "consent_required"
], vi = {
  noTokensFoundError: {
    code: "no_tokens_found",
    desc: "No refresh token found in the cache. Please sign-in."
  },
  native_account_unavailable: {
    code: "native_account_unavailable",
    desc: "The requested account is not available in the native broker. It may have been deleted or logged out. Please sign-in again using an interactive API."
  }
}, Zt = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r, i, o, a, s, c) {
      var l = t.call(this, n, r, i) || this;
      return Object.setPrototypeOf(l, e.prototype), l.timestamp = o || y.EMPTY_STRING, l.traceId = a || y.EMPTY_STRING, l.correlationId = s || y.EMPTY_STRING, l.claims = c || y.EMPTY_STRING, l.name = "InteractionRequiredAuthError", l;
    }
    return e.isInteractionRequiredError = function(n, r, i) {
      var o = !!n && lp.indexOf(n) > -1, a = !!i && Fw.indexOf(i) > -1, s = !!r && lp.some(function(c) {
        return r.indexOf(c) > -1;
      });
      return o || s || a;
    }, e.createNoTokensFoundError = function() {
      return new e(vi.noTokensFoundError.code, vi.noTokensFoundError.desc);
    }, e.createNativeAccountUnavailableError = function() {
      return new e(vi.native_account_unavailable.code, vi.native_account_unavailable.desc);
    }, e;
  }(K)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Vo = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e, n, r, i, o) {
      this.account = e || null, this.idToken = n || null, this.accessToken = r || null, this.refreshToken = i || null, this.appMetadata = o || null;
    }
    return t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Hn = (
  /** @class */
  function() {
    function t() {
    }
    return t.setRequestState = function(e, n, r) {
      var i = t.generateLibraryState(e, r);
      return P.isEmpty(n) ? i : "" + i + y.RESOURCE_DELIM + n;
    }, t.generateLibraryState = function(e, n) {
      if (!e)
        throw L.createNoCryptoObjectError("generateLibraryState");
      var r = {
        id: e.createNewGuid()
      };
      n && (r.meta = n);
      var i = JSON.stringify(r);
      return e.base64Encode(i);
    }, t.parseRequestState = function(e, n) {
      if (!e)
        throw L.createNoCryptoObjectError("parseRequestState");
      if (P.isEmpty(n))
        throw L.createInvalidStateError(n, "Null, undefined or empty state");
      try {
        var r = n.split(y.RESOURCE_DELIM), i = r[0], o = r.length > 1 ? r.slice(1).join(y.RESOURCE_DELIM) : y.EMPTY_STRING, a = e.base64Decode(i), s = JSON.parse(a);
        return {
          userRequestState: P.isEmpty(o) ? y.EMPTY_STRING : o,
          libraryState: s
        };
      } catch (c) {
        throw L.createInvalidStateError(n, c);
      }
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ie = (
  /** @class */
  function() {
    function t(e) {
      if (this._urlString = e, P.isEmpty(this._urlString))
        throw Ee.createUrlEmptyError();
      P.isEmpty(this.getHash()) && (this._urlString = t.canonicalizeUri(e));
    }
    return Object.defineProperty(t.prototype, "urlString", {
      get: function() {
        return this._urlString;
      },
      enumerable: !1,
      configurable: !0
    }), t.canonicalizeUri = function(e) {
      if (e) {
        var n = e.toLowerCase();
        return P.endsWith(n, "?") ? n = n.slice(0, -1) : P.endsWith(n, "?/") && (n = n.slice(0, -2)), P.endsWith(n, "/") || (n += "/"), n;
      }
      return e;
    }, t.prototype.validateAsUri = function() {
      var e;
      try {
        e = this.getUrlComponents();
      } catch (n) {
        throw Ee.createUrlParseError(n);
      }
      if (!e.HostNameAndPort || !e.PathSegments)
        throw Ee.createUrlParseError("Given url string: " + this.urlString);
      if (!e.Protocol || e.Protocol.toLowerCase() !== "https:")
        throw Ee.createInsecureAuthorityUriError(this.urlString);
    }, t.appendQueryString = function(e, n) {
      return P.isEmpty(n) ? e : e.indexOf("?") < 0 ? e + "?" + n : e + "&" + n;
    }, t.removeHashFromUrl = function(e) {
      return t.canonicalizeUri(e.split("#")[0]);
    }, t.prototype.replaceTenantPath = function(e) {
      var n = this.getUrlComponents(), r = n.PathSegments;
      return e && r.length !== 0 && (r[0] === Mr.COMMON || r[0] === Mr.ORGANIZATIONS) && (r[0] = e), t.constructAuthorityUriFromObject(n);
    }, t.prototype.getHash = function() {
      return t.parseHash(this.urlString);
    }, t.prototype.getUrlComponents = function() {
      var e = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?"), n = this.urlString.match(e);
      if (!n)
        throw Ee.createUrlParseError("Given url string: " + this.urlString);
      var r = {
        Protocol: n[1],
        HostNameAndPort: n[4],
        AbsolutePath: n[5],
        QueryString: n[7]
      }, i = r.AbsolutePath.split("/");
      return i = i.filter(function(o) {
        return o && o.length > 0;
      }), r.PathSegments = i, !P.isEmpty(r.QueryString) && r.QueryString.endsWith("/") && (r.QueryString = r.QueryString.substring(0, r.QueryString.length - 1)), r;
    }, t.getDomainFromUrl = function(e) {
      var n = RegExp("^([^:/?#]+://)?([^/?#]*)"), r = e.match(n);
      if (!r)
        throw Ee.createUrlParseError("Given url string: " + e);
      return r[2];
    }, t.getAbsoluteUrl = function(e, n) {
      if (e[0] === y.FORWARD_SLASH) {
        var r = new t(n), i = r.getUrlComponents();
        return i.Protocol + "//" + i.HostNameAndPort + e;
      }
      return e;
    }, t.parseHash = function(e) {
      var n = e.indexOf("#"), r = e.indexOf("#/");
      return r > -1 ? e.substring(r + 2) : n > -1 ? e.substring(n + 1) : y.EMPTY_STRING;
    }, t.parseQueryString = function(e) {
      var n = e.indexOf("?"), r = e.indexOf("/?");
      return r > -1 ? e.substring(r + 2) : n > -1 ? e.substring(n + 1) : y.EMPTY_STRING;
    }, t.constructAuthorityUriFromObject = function(e) {
      return new t(e.Protocol + "//" + e.HostNameAndPort + "/" + e.PathSegments.join("/"));
    }, t.getDeserializedHash = function(e) {
      if (P.isEmpty(e))
        return {};
      var n = t.parseHash(e), r = P.queryStringToObject(P.isEmpty(n) ? e : n);
      if (!r)
        throw L.createHashNotDeserializedError(JSON.stringify(r));
      return r;
    }, t.getDeserializedQueryString = function(e) {
      if (P.isEmpty(e))
        return {};
      var n = t.parseQueryString(e), r = P.queryStringToObject(P.isEmpty(n) ? e : n);
      if (!r)
        throw L.createHashNotDeserializedError(JSON.stringify(r));
      return r;
    }, t.hashContainsKnownProperties = function(e) {
      if (P.isEmpty(e) || e.indexOf("=") < 0)
        return !1;
      var n = t.getDeserializedHash(e);
      return !!(n.code || n.error_description || n.error || n.state);
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var _;
(function(t) {
  t.AcquireTokenByCode = "acquireTokenByCode", t.AcquireTokenByRefreshToken = "acquireTokenByRefreshToken", t.AcquireTokenSilent = "acquireTokenSilent", t.AcquireTokenSilentAsync = "acquireTokenSilentAsync", t.AcquireTokenPopup = "acquireTokenPopup", t.CryptoOptsGetPublicKeyThumbprint = "cryptoOptsGetPublicKeyThumbprint", t.CryptoOptsSignJwt = "cryptoOptsSignJwt", t.SilentCacheClientAcquireToken = "silentCacheClientAcquireToken", t.SilentIframeClientAcquireToken = "silentIframeClientAcquireToken", t.SilentRefreshClientAcquireToken = "silentRefreshClientAcquireToken", t.SsoSilent = "ssoSilent", t.StandardInteractionClientGetDiscoveredAuthority = "standardInteractionClientGetDiscoveredAuthority", t.FetchAccountIdWithNativeBroker = "fetchAccountIdWithNativeBroker", t.NativeInteractionClientAcquireToken = "nativeInteractionClientAcquireToken", t.BaseClientCreateTokenRequestHeaders = "baseClientCreateTokenRequestHeaders", t.BrokerHandhshake = "brokerHandshake", t.AcquireTokenByRefreshTokenInBroker = "acquireTokenByRefreshTokenInBroker", t.AcquireTokenByBroker = "acquireTokenByBroker", t.RefreshTokenClientExecuteTokenRequest = "refreshTokenClientExecuteTokenRequest", t.RefreshTokenClientAcquireToken = "refreshTokenClientAcquireToken", t.RefreshTokenClientAcquireTokenWithCachedRefreshToken = "refreshTokenClientAcquireTokenWithCachedRefreshToken", t.RefreshTokenClientAcquireTokenByRefreshToken = "refreshTokenClientAcquireTokenByRefreshToken", t.RefreshTokenClientCreateTokenRequestBody = "refreshTokenClientCreateTokenRequestBody", t.AcquireTokenFromCache = "acquireTokenFromCache", t.AcquireTokenBySilentIframe = "acquireTokenBySilentIframe", t.InitializeBaseRequest = "initializeBaseRequest", t.InitializeSilentRequest = "initializeSilentRequest", t.InitializeClientApplication = "initializeClientApplication", t.SilentIframeClientTokenHelper = "silentIframeClientTokenHelper", t.SilentHandlerInitiateAuthRequest = "silentHandlerInitiateAuthRequest", t.SilentHandlerMonitorIframeForHash = "silentHandlerMonitorIframeForHash", t.SilentHandlerLoadFrame = "silentHandlerLoadFrame", t.StandardInteractionClientCreateAuthCodeClient = "standardInteractionClientCreateAuthCodeClient", t.StandardInteractionClientGetClientConfiguration = "standardInteractionClientGetClientConfiguration", t.StandardInteractionClientInitializeAuthorizationRequest = "standardInteractionClientInitializeAuthorizationRequest", t.StandardInteractionClientInitializeAuthorizationCodeRequest = "standardInteractionClientInitializeAuthorizationCodeRequest", t.GetAuthCodeUrl = "getAuthCodeUrl", t.HandleCodeResponseFromServer = "handleCodeResponseFromServer", t.HandleCodeResponseFromHash = "handleCodeResponseFromHash", t.UpdateTokenEndpointAuthority = "updateTokenEndpointAuthority", t.AuthClientAcquireToken = "authClientAcquireToken", t.AuthClientExecuteTokenRequest = "authClientExecuteTokenRequest", t.AuthClientCreateTokenRequestBody = "authClientCreateTokenRequestBody", t.AuthClientCreateQueryString = "authClientCreateQueryString", t.PopTokenGenerateCnf = "popTokenGenerateCnf", t.PopTokenGenerateKid = "popTokenGenerateKid", t.HandleServerTokenResponse = "handleServerTokenResponse", t.AuthorityFactoryCreateDiscoveredInstance = "authorityFactoryCreateDiscoveredInstance", t.AuthorityResolveEndpointsAsync = "authorityResolveEndpointsAsync", t.AuthorityGetCloudDiscoveryMetadataFromNetwork = "authorityGetCloudDiscoveryMetadataFromNetwork", t.AuthorityUpdateCloudDiscoveryMetadata = "authorityUpdateCloudDiscoveryMetadata", t.AuthorityGetEndpointMetadataFromNetwork = "authorityGetEndpointMetadataFromNetwork", t.AuthorityUpdateEndpointMetadata = "authorityUpdateEndpointMetadata", t.AuthorityUpdateMetadataWithRegionalInformation = "authorityUpdateMetadataWithRegionalInformation", t.RegionDiscoveryDetectRegion = "regionDiscoveryDetectRegion", t.RegionDiscoveryGetRegionFromIMDS = "regionDiscoveryGetRegionFromIMDS", t.RegionDiscoveryGetCurrentVersion = "regionDiscoveryGetCurrentVersion", t.AcquireTokenByCodeAsync = "acquireTokenByCodeAsync", t.GetEndpointMetadataFromNetwork = "getEndpointMetadataFromNetwork", t.GetCloudDiscoveryMetadataFromNetworkMeasurement = "getCloudDiscoveryMetadataFromNetworkMeasurement", t.HandleRedirectPromiseMeasurement = "handleRedirectPromiseMeasurement", t.UpdateCloudDiscoveryMetadataMeasurement = "updateCloudDiscoveryMetadataMeasurement", t.UsernamePasswordClientAcquireToken = "usernamePasswordClientAcquireToken", t.NativeMessageHandlerHandshake = "nativeMessageHandlerHandshake", t.ClearTokensAndKeysWithClaims = "clearTokensAndKeysWithClaims";
})(_ || (_ = {}));
var lc;
(function(t) {
  t[t.NotStarted = 0] = "NotStarted", t[t.InProgress = 1] = "InProgress", t[t.Completed = 2] = "Completed";
})(lc || (lc = {}));
var jw = /* @__PURE__ */ new Set([
  "accessTokenSize",
  "durationMs",
  "idTokenSize",
  "matsSilentStatus",
  "matsHttpStatus",
  "refreshTokenSize",
  "queuedTimeMs",
  "startTimeMs",
  "status"
]);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var qu;
(function(t) {
  t.SW = "sw", t.UHW = "uhw";
})(qu || (qu = {}));
var Gi = (
  /** @class */
  function() {
    function t(e, n) {
      this.cryptoUtils = e, this.performanceClient = n;
    }
    return t.prototype.generateCnf = function(e) {
      var n, r;
      return $(this, void 0, void 0, function() {
        var i, o, a;
        return X(this, function(s) {
          switch (s.label) {
            case 0:
              return (n = this.performanceClient) === null || n === void 0 || n.addQueueMeasurement(_.PopTokenGenerateCnf, e.correlationId), (r = this.performanceClient) === null || r === void 0 || r.setPreQueueTime(_.PopTokenGenerateKid, e.correlationId), [4, this.generateKid(e)];
            case 1:
              return i = s.sent(), o = this.cryptoUtils.base64Encode(JSON.stringify(i)), a = {
                kid: i.kid,
                reqCnfString: o
              }, [4, this.cryptoUtils.hashString(o)];
            case 2:
              return [2, (a.reqCnfHash = s.sent(), a)];
          }
        });
      });
    }, t.prototype.generateKid = function(e) {
      var n;
      return $(this, void 0, void 0, function() {
        var r;
        return X(this, function(i) {
          switch (i.label) {
            case 0:
              return (n = this.performanceClient) === null || n === void 0 || n.addQueueMeasurement(_.PopTokenGenerateKid, e.correlationId), [4, this.cryptoUtils.getPublicKeyThumbprint(e)];
            case 1:
              return r = i.sent(), [2, {
                kid: r,
                xms_ksl: qu.SW
              }];
          }
        });
      });
    }, t.prototype.signPopToken = function(e, n, r) {
      return $(this, void 0, void 0, function() {
        return X(this, function(i) {
          return [2, this.signPayload(e, n, r)];
        });
      });
    }, t.prototype.signPayload = function(e, n, r, i) {
      return $(this, void 0, void 0, function() {
        var o, a, s, c, l, u;
        return X(this, function(d) {
          switch (d.label) {
            case 0:
              return o = r.resourceRequestMethod, a = r.resourceRequestUri, s = r.shrClaims, c = r.shrNonce, l = a ? new ie(a) : void 0, u = l == null ? void 0 : l.getUrlComponents(), [4, this.cryptoUtils.signJwt(ce({ at: e, ts: Bt.nowSeconds(), m: o == null ? void 0 : o.toUpperCase(), u: u == null ? void 0 : u.HostNameAndPort, nonce: c || this.cryptoUtils.createNewGuid(), p: u == null ? void 0 : u.AbsolutePath, q: u != null && u.QueryString ? [[], u.QueryString] : void 0, client_claims: s || void 0 }, i), n, r.correlationId)];
            case 1:
              return [2, d.sent()];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Bu = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.generateAppMetadataKey = function() {
      return t.generateAppMetadataCacheKey(this.environment, this.clientId);
    }, t.generateAppMetadataCacheKey = function(e, n) {
      var r = [
        Lu,
        e,
        n
      ];
      return r.join(qe.CACHE_KEY_SEPARATOR).toLowerCase();
    }, t.createAppMetadataEntity = function(e, n, r) {
      var i = new t();
      return i.clientId = e, i.environment = n, r && (i.familyId = r), i;
    }, t.isAppMetadataEntity = function(e, n) {
      return n ? e.indexOf(Lu) === 0 && n.hasOwnProperty("clientId") && n.hasOwnProperty("environment") : !1;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Yw = (
  /** @class */
  function() {
    function t(e, n) {
      this.cache = e, this.hasChanged = n;
    }
    return Object.defineProperty(t.prototype, "cacheHasChanged", {
      /**
       * boolean which indicates the changes in cache
       */
      get: function() {
        return this.hasChanged;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "tokenCache", {
      /**
       * function to retrieve the token cache
       */
      get: function() {
        return this.cache;
      },
      enumerable: !1,
      configurable: !0
    }), t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var uc = (
  /** @class */
  function() {
    function t(e, n, r, i, o, a, s) {
      this.clientId = e, this.cacheStorage = n, this.cryptoObj = r, this.logger = i, this.serializableCache = o, this.persistencePlugin = a, this.performanceClient = s;
    }
    return t.prototype.validateServerAuthorizationCodeResponse = function(e, n, r) {
      if (!e.state || !n)
        throw e.state ? L.createStateNotFoundError("Cached State") : L.createStateNotFoundError("Server State");
      if (decodeURIComponent(e.state) !== decodeURIComponent(n))
        throw L.createStateMismatchError();
      if (e.error || e.error_description || e.suberror)
        throw Zt.isInteractionRequiredError(e.error, e.error_description, e.suberror) ? new Zt(e.error || y.EMPTY_STRING, e.error_description, e.suberror, e.timestamp || y.EMPTY_STRING, e.trace_id || y.EMPTY_STRING, e.correlation_id || y.EMPTY_STRING, e.claims || y.EMPTY_STRING) : new Br(e.error || y.EMPTY_STRING, e.error_description, e.suberror);
      e.client_info && sc(e.client_info, r);
    }, t.prototype.validateTokenResponse = function(e) {
      if (e.error || e.error_description || e.suberror) {
        if (Zt.isInteractionRequiredError(e.error, e.error_description, e.suberror))
          throw new Zt(e.error, e.error_description, e.suberror, e.timestamp || y.EMPTY_STRING, e.trace_id || y.EMPTY_STRING, e.correlation_id || y.EMPTY_STRING, e.claims || y.EMPTY_STRING);
        var n = e.error_codes + " - [" + e.timestamp + "]: " + e.error_description + " - Correlation ID: " + e.correlation_id + " - Trace ID: " + e.trace_id;
        throw new Br(e.error, n, e.suberror);
      }
    }, t.prototype.handleServerTokenResponse = function(e, n, r, i, o, a, s, c, l) {
      var u;
      return $(this, void 0, void 0, function() {
        var d, h, f, m, E, N, g;
        return X(this, function(p) {
          switch (p.label) {
            case 0:
              if ((u = this.performanceClient) === null || u === void 0 || u.addQueueMeasurement(_.HandleServerTokenResponse, e.correlation_id), e.id_token) {
                if (d = new mn(e.id_token || y.EMPTY_STRING, this.cryptoObj), o && !P.isEmpty(o.nonce) && d.claims.nonce !== o.nonce)
                  throw L.createNonceMismatchError();
                if (i.maxAge || i.maxAge === 0) {
                  if (h = d.claims.auth_time, !h)
                    throw L.createAuthTimeNotFoundError();
                  mn.checkMaxAge(h, i.maxAge);
                }
              }
              this.homeAccountIdentifier = We.generateHomeAccountId(e.client_info || y.EMPTY_STRING, n.authorityType, this.logger, this.cryptoObj, d), o && o.state && (f = Hn.parseRequestState(this.cryptoObj, o.state)), e.key_id = e.key_id || i.sshKid || void 0, m = this.generateCacheRecord(e, n, r, i, d, a, o), p.label = 1;
            case 1:
              return p.trys.push([1, , 5, 8]), this.persistencePlugin && this.serializableCache ? (this.logger.verbose("Persistence enabled, calling beforeCacheAccess"), E = new Yw(this.serializableCache, !0), [4, this.persistencePlugin.beforeCacheAccess(E)]) : [3, 3];
            case 2:
              p.sent(), p.label = 3;
            case 3:
              return s && !c && m.account && (N = m.account.generateAccountKey(), g = this.cacheStorage.getAccount(N), !g) ? (this.logger.warning("Account used to refresh tokens not in persistence, refreshed tokens will not be stored in the cache"), [2, t.generateAuthenticationResult(this.cryptoObj, n, m, !1, i, d, f, void 0, l)]) : [4, this.cacheStorage.saveCacheRecord(m)];
            case 4:
              return p.sent(), [3, 8];
            case 5:
              return this.persistencePlugin && this.serializableCache && E ? (this.logger.verbose("Persistence enabled, calling afterCacheAccess"), [4, this.persistencePlugin.afterCacheAccess(E)]) : [3, 7];
            case 6:
              p.sent(), p.label = 7;
            case 7:
              return [
                7
                /*endfinally*/
              ];
            case 8:
              return [2, t.generateAuthenticationResult(this.cryptoObj, n, m, !1, i, d, f, e, l)];
          }
        });
      });
    }, t.prototype.generateCacheRecord = function(e, n, r, i, o, a, s) {
      var c = n.getPreferredCache();
      if (P.isEmpty(c))
        throw L.createInvalidCacheEnvironmentError();
      var l, u;
      !P.isEmpty(e.id_token) && o && (l = br.createIdTokenEntity(this.homeAccountIdentifier, c, e.id_token || y.EMPTY_STRING, this.clientId, o.claims.tid || y.EMPTY_STRING), u = this.generateAccountEntity(e, o, n, s));
      var d = null;
      if (!P.isEmpty(e.access_token)) {
        var h = e.scope ? it.fromString(e.scope) : new it(i.scopes || []), f = (typeof e.expires_in == "string" ? parseInt(e.expires_in, 10) : e.expires_in) || 0, m = (typeof e.ext_expires_in == "string" ? parseInt(e.ext_expires_in, 10) : e.ext_expires_in) || 0, E = (typeof e.refresh_in == "string" ? parseInt(e.refresh_in, 10) : e.refresh_in) || void 0, N = r + f, g = N + m, p = E && E > 0 ? r + E : void 0;
        d = Rr.createAccessTokenEntity(this.homeAccountIdentifier, c, e.access_token || y.EMPTY_STRING, this.clientId, o ? o.claims.tid || y.EMPTY_STRING : n.tenant, h.printScopes(), N, g, this.cryptoObj, p, e.token_type, a, e.key_id, i.claims, i.requestedClaimsHash);
      }
      var v = null;
      P.isEmpty(e.refresh_token) || (v = mi.createRefreshTokenEntity(this.homeAccountIdentifier, c, e.refresh_token || y.EMPTY_STRING, this.clientId, e.foci, a));
      var C = null;
      return P.isEmpty(e.foci) || (C = Bu.createAppMetadataEntity(this.clientId, c, e.foci)), new Vo(u, l, d, v, C);
    }, t.prototype.generateAccountEntity = function(e, n, r, i) {
      var o = r.authorityType, a = i ? i.cloud_graph_host_name : y.EMPTY_STRING, s = i ? i.msgraph_host : y.EMPTY_STRING;
      if (o === lt.Adfs)
        return this.logger.verbose("Authority type is ADFS, creating ADFS account"), We.createGenericAccount(this.homeAccountIdentifier, n, r, a, s);
      if (P.isEmpty(e.client_info) && r.protocolMode === "AAD")
        throw L.createClientInfoEmptyError();
      return e.client_info ? We.createAccount(e.client_info, this.homeAccountIdentifier, n, r, a, s) : We.createGenericAccount(this.homeAccountIdentifier, n, r, a, s);
    }, t.generateAuthenticationResult = function(e, n, r, i, o, a, s, c, l) {
      var u, d, h;
      return $(this, void 0, void 0, function() {
        var f, m, E, N, g, p, v, C, k, D, z;
        return X(this, function(H) {
          switch (H.label) {
            case 0:
              if (f = y.EMPTY_STRING, m = [], E = null, g = y.EMPTY_STRING, !r.accessToken)
                return [3, 4];
              if (r.accessToken.tokenType !== ue.POP)
                return [3, 2];
              if (p = new Gi(e), v = r.accessToken, C = v.secret, k = v.keyId, !k)
                throw L.createKeyIdMissingError();
              return [4, p.signPopToken(C, k, o)];
            case 1:
              return f = H.sent(), [3, 3];
            case 2:
              f = r.accessToken.secret, H.label = 3;
            case 3:
              m = it.fromString(r.accessToken.target).asArray(), E = new Date(Number(r.accessToken.expiresOn) * 1e3), N = new Date(Number(r.accessToken.extendedExpiresOn) * 1e3), H.label = 4;
            case 4:
              return r.appMetadata && (g = r.appMetadata.familyId === Ko ? Ko : y.EMPTY_STRING), D = (a == null ? void 0 : a.claims.oid) || (a == null ? void 0 : a.claims.sub) || y.EMPTY_STRING, z = (a == null ? void 0 : a.claims.tid) || y.EMPTY_STRING, c != null && c.spa_accountid && r.account && (r.account.nativeAccountId = c == null ? void 0 : c.spa_accountid), [2, {
                authority: n.canonicalAuthority,
                uniqueId: D,
                tenantId: z,
                scopes: m,
                account: r.account ? r.account.getAccountInfo() : null,
                idToken: a ? a.rawToken : y.EMPTY_STRING,
                idTokenClaims: a ? a.claims : {},
                accessToken: f,
                fromCache: i,
                expiresOn: E,
                correlationId: o.correlationId,
                requestId: l || y.EMPTY_STRING,
                extExpiresOn: N,
                familyId: g,
                tokenType: ((u = r.accessToken) === null || u === void 0 ? void 0 : u.tokenType) || y.EMPTY_STRING,
                state: s ? s.userRequestState : y.EMPTY_STRING,
                cloudGraphHostName: ((d = r.account) === null || d === void 0 ? void 0 : d.cloudGraphHostName) || y.EMPTY_STRING,
                msGraphHost: ((h = r.account) === null || h === void 0 ? void 0 : h.msGraphHost) || y.EMPTY_STRING,
                code: c == null ? void 0 : c.spa_code,
                fromNativeBroker: !1
              }];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ey = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r) {
      var i = t.call(this, n, r) || this;
      return i.includeRedirectUri = !0, i;
    }
    return e.prototype.getAuthCodeUrl = function(n) {
      var r, i;
      return $(this, void 0, void 0, function() {
        var o;
        return X(this, function(a) {
          switch (a.label) {
            case 0:
              return (r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.GetAuthCodeUrl, n.correlationId), (i = this.performanceClient) === null || i === void 0 || i.setPreQueueTime(_.AuthClientCreateQueryString, n.correlationId), [4, this.createAuthCodeUrlQueryString(n)];
            case 1:
              return o = a.sent(), [2, ie.appendQueryString(this.authority.authorizationEndpoint, o)];
          }
        });
      });
    }, e.prototype.acquireToken = function(n, r) {
      var i, o, a, s, c, l;
      return $(this, void 0, void 0, function() {
        var u, d, h, f, m, E, N = this;
        return X(this, function(g) {
          switch (g.label) {
            case 0:
              if (!n || !n.code)
                throw L.createTokenRequestCannotBeMadeError();
              return (i = this.performanceClient) === null || i === void 0 || i.addQueueMeasurement(_.AuthClientAcquireToken, n.correlationId), u = (o = this.performanceClient) === null || o === void 0 ? void 0 : o.startMeasurement("AuthCodeClientAcquireToken", n.correlationId), this.logger.info("in acquireToken call in auth-code client"), d = Bt.nowSeconds(), (a = this.performanceClient) === null || a === void 0 || a.setPreQueueTime(_.AuthClientExecuteTokenRequest, n.correlationId), [4, this.executeTokenRequest(this.authority, n)];
            case 1:
              return h = g.sent(), f = (s = h.headers) === null || s === void 0 ? void 0 : s[Nt.X_MS_REQUEST_ID], m = (c = h.headers) === null || c === void 0 ? void 0 : c[Nt.X_MS_HTTP_VERSION], m && (u == null || u.addStaticFields({
                httpVerAuthority: m
              })), E = new uc(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin, this.performanceClient), E.validateTokenResponse(h.body), (l = this.performanceClient) === null || l === void 0 || l.setPreQueueTime(_.HandleServerTokenResponse, n.correlationId), [2, E.handleServerTokenResponse(h.body, this.authority, d, n, r, void 0, void 0, void 0, f).then(function(p) {
                return u == null || u.endMeasurement({
                  success: !0
                }), p;
              }).catch(function(p) {
                throw N.logger.verbose("Error in fetching token in ACC", n.correlationId), u == null || u.endMeasurement({
                  errorCode: p.errorCode,
                  subErrorCode: p.subError,
                  success: !1
                }), p;
              })];
          }
        });
      });
    }, e.prototype.handleFragmentResponse = function(n, r) {
      var i = new uc(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, null, null), o = new ie(n), a = ie.getDeserializedHash(o.getHash());
      if (i.validateServerAuthorizationCodeResponse(a, r, this.cryptoUtils), !a.code)
        throw L.createNoAuthCodeInServerResponseError();
      return ce(ce({}, a), {
        // Code param is optional in ServerAuthorizationCodeResponse but required in AuthorizationCodePaylod
        code: a.code
      });
    }, e.prototype.getLogoutUri = function(n) {
      if (!n)
        throw Ee.createEmptyLogoutRequestError();
      var r = this.createLogoutUrlQueryString(n);
      return ie.appendQueryString(this.authority.endSessionEndpoint, r);
    }, e.prototype.executeTokenRequest = function(n, r) {
      var i, o;
      return $(this, void 0, void 0, function() {
        var a, s, c, l, u, d, h;
        return X(this, function(f) {
          switch (f.label) {
            case 0:
              return (i = this.performanceClient) === null || i === void 0 || i.addQueueMeasurement(_.AuthClientExecuteTokenRequest, r.correlationId), (o = this.performanceClient) === null || o === void 0 || o.setPreQueueTime(_.AuthClientCreateTokenRequestBody, r.correlationId), a = this.createTokenQueryParameters(r), s = ie.appendQueryString(n.tokenEndpoint, a), [4, this.createTokenRequestBody(r)];
            case 1:
              if (c = f.sent(), l = void 0, r.clientInfo)
                try {
                  u = sc(r.clientInfo, this.cryptoUtils), l = {
                    credential: "" + u.uid + qe.CLIENT_INFO_SEPARATOR + u.utid,
                    type: Rt.HOME_ACCOUNT_ID
                  };
                } catch (m) {
                  this.logger.verbose("Could not parse client info for CCS Header: " + m);
                }
              return d = this.createTokenRequestHeaders(l || r.ccsCredential), h = {
                clientId: this.config.authOptions.clientId,
                authority: n.canonicalAuthority,
                scopes: r.scopes,
                claims: r.claims,
                authenticationScheme: r.authenticationScheme,
                resourceRequestMethod: r.resourceRequestMethod,
                resourceRequestUri: r.resourceRequestUri,
                shrClaims: r.shrClaims,
                sshKid: r.sshKid
              }, [2, this.executePostToTokenEndpoint(s, c, d, h)];
          }
        });
      });
    }, e.prototype.createTokenRequestBody = function(n) {
      var r, i;
      return $(this, void 0, void 0, function() {
        var o, a, s, c, l, u, d, d, h;
        return X(this, function(f) {
          switch (f.label) {
            case 0:
              return (r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.AuthClientCreateTokenRequestBody, n.correlationId), o = new Qo(), o.addClientId(this.config.authOptions.clientId), this.includeRedirectUri ? o.addRedirectUri(n.redirectUri) : Er.validateRedirectUri(n.redirectUri), o.addScopes(n.scopes), o.addAuthorizationCode(n.code), o.addLibraryInfo(this.config.libraryInfo), o.addApplicationTelemetry(this.config.telemetry.application), o.addThrottling(), this.serverTelemetryManager && o.addServerTelemetry(this.serverTelemetryManager), n.codeVerifier && o.addCodeVerifier(n.codeVerifier), this.config.clientCredentials.clientSecret && o.addClientSecret(this.config.clientCredentials.clientSecret), this.config.clientCredentials.clientAssertion && (a = this.config.clientCredentials.clientAssertion, o.addClientAssertion(a.assertion), o.addClientAssertionType(a.assertionType)), o.addGrantType(ic.AUTHORIZATION_CODE_GRANT), o.addClientInfo(), n.authenticationScheme !== ue.POP ? [3, 2] : (s = new Gi(this.cryptoUtils, this.performanceClient), (i = this.performanceClient) === null || i === void 0 || i.setPreQueueTime(_.PopTokenGenerateCnf, n.correlationId), [4, s.generateCnf(n)]);
            case 1:
              return c = f.sent(), o.addPopToken(c.reqCnfString), [3, 3];
            case 2:
              if (n.authenticationScheme === ue.SSH)
                if (n.sshJwk)
                  o.addSshJwk(n.sshJwk);
                else
                  throw Ee.createMissingSshJwkError();
              f.label = 3;
            case 3:
              if (l = n.correlationId || this.config.cryptoInterface.createNewGuid(), o.addCorrelationId(l), (!P.isEmptyObj(n.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) && o.addClaims(n.claims, this.config.authOptions.clientCapabilities), u = void 0, n.clientInfo)
                try {
                  d = sc(n.clientInfo, this.cryptoUtils), u = {
                    credential: "" + d.uid + qe.CLIENT_INFO_SEPARATOR + d.utid,
                    type: Rt.HOME_ACCOUNT_ID
                  };
                } catch (m) {
                  this.logger.verbose("Could not parse client info for CCS Header: " + m);
                }
              else
                u = n.ccsCredential;
              if (this.config.systemOptions.preventCorsPreflight && u)
                switch (u.type) {
                  case Rt.HOME_ACCOUNT_ID:
                    try {
                      d = gi(u.credential), o.addCcsOid(d);
                    } catch (m) {
                      this.logger.verbose("Could not parse home account ID for CCS Header: " + m);
                    }
                    break;
                  case Rt.UPN:
                    o.addCcsUpn(u.credential);
                    break;
                }
              return n.tokenBodyParameters && o.addExtraQueryParameters(n.tokenBodyParameters), n.enableSpaAuthorizationCode && (!n.tokenBodyParameters || !n.tokenBodyParameters[J.RETURN_SPA_CODE]) && o.addExtraQueryParameters((h = {}, h[J.RETURN_SPA_CODE] = "1", h)), [2, o.createQueryString()];
          }
        });
      });
    }, e.prototype.createAuthCodeUrlQueryString = function(n) {
      var r;
      return $(this, void 0, void 0, function() {
        var i, o, a, s, c, l, l, l, u, d;
        return X(this, function(h) {
          switch (h.label) {
            case 0:
              if ((r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.AuthClientCreateQueryString, n.correlationId), i = new Qo(), i.addClientId(this.config.authOptions.clientId), o = qc(n.scopes || [], n.extraScopesToConsent || []), i.addScopes(o), i.addRedirectUri(n.redirectUri), a = n.correlationId || this.config.cryptoInterface.createNewGuid(), i.addCorrelationId(a), i.addResponseMode(n.responseMode), i.addResponseTypeCode(), i.addLibraryInfo(this.config.libraryInfo), i.addApplicationTelemetry(this.config.telemetry.application), i.addClientInfo(), n.codeChallenge && n.codeChallengeMethod && i.addCodeChallengeParams(n.codeChallenge, n.codeChallengeMethod), n.prompt && i.addPrompt(n.prompt), n.domainHint && i.addDomainHint(n.domainHint), n.prompt !== st.SELECT_ACCOUNT)
                if (n.sid && n.prompt === st.NONE)
                  this.logger.verbose("createAuthCodeUrlQueryString: Prompt is none, adding sid from request"), i.addSid(n.sid);
                else if (n.account) {
                  if (s = this.extractAccountSid(n.account), c = this.extractLoginHint(n.account), c) {
                    this.logger.verbose("createAuthCodeUrlQueryString: login_hint claim present on account"), i.addLoginHint(c);
                    try {
                      l = gi(n.account.homeAccountId), i.addCcsOid(l);
                    } catch {
                      this.logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
                    }
                  } else if (s && n.prompt === st.NONE) {
                    this.logger.verbose("createAuthCodeUrlQueryString: Prompt is none, adding sid from account"), i.addSid(s);
                    try {
                      l = gi(n.account.homeAccountId), i.addCcsOid(l);
                    } catch {
                      this.logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
                    }
                  } else if (n.loginHint)
                    this.logger.verbose("createAuthCodeUrlQueryString: Adding login_hint from request"), i.addLoginHint(n.loginHint), i.addCcsUpn(n.loginHint);
                  else if (n.account.username) {
                    this.logger.verbose("createAuthCodeUrlQueryString: Adding login_hint from account"), i.addLoginHint(n.account.username);
                    try {
                      l = gi(n.account.homeAccountId), i.addCcsOid(l);
                    } catch {
                      this.logger.verbose("createAuthCodeUrlQueryString: Could not parse home account ID for CCS Header");
                    }
                  }
                } else
                  n.loginHint && (this.logger.verbose("createAuthCodeUrlQueryString: No account, adding login_hint from request"), i.addLoginHint(n.loginHint), i.addCcsUpn(n.loginHint));
              else
                this.logger.verbose("createAuthCodeUrlQueryString: Prompt is select_account, ignoring account hints");
              return n.nonce && i.addNonce(n.nonce), n.state && i.addState(n.state), (!P.isEmpty(n.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) && i.addClaims(n.claims, this.config.authOptions.clientCapabilities), n.extraQueryParameters && i.addExtraQueryParameters(n.extraQueryParameters), n.nativeBroker ? (i.addNativeBroker(), n.authenticationScheme !== ue.POP ? [3, 2] : (u = new Gi(this.cryptoUtils), [4, u.generateCnf(n)])) : [3, 2];
            case 1:
              d = h.sent(), i.addPopToken(d.reqCnfString), h.label = 2;
            case 2:
              return [2, i.createQueryString()];
          }
        });
      });
    }, e.prototype.createLogoutUrlQueryString = function(n) {
      var r = new Qo();
      return n.postLogoutRedirectUri && r.addPostLogoutRedirectUri(n.postLogoutRedirectUri), n.correlationId && r.addCorrelationId(n.correlationId), n.idTokenHint && r.addIdTokenHint(n.idTokenHint), n.state && r.addState(n.state), n.logoutHint && r.addLogoutHint(n.logoutHint), n.extraQueryParameters && r.addExtraQueryParameters(n.extraQueryParameters), r.createQueryString();
    }, e.prototype.extractAccountSid = function(n) {
      var r;
      return ((r = n.idTokenClaims) === null || r === void 0 ? void 0 : r.sid) || null;
    }, e.prototype.extractLoginHint = function(n) {
      var r;
      return ((r = n.idTokenClaims) === null || r === void 0 ? void 0 : r.login_hint) || null;
    }, e;
  }(oh)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ty = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r) {
      return t.call(this, n, r) || this;
    }
    return e.prototype.acquireToken = function(n) {
      var r, i, o, a, s, c, l;
      return $(this, void 0, void 0, function() {
        var u, d, h, f, m, E, N = this;
        return X(this, function(g) {
          switch (g.label) {
            case 0:
              return (r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.RefreshTokenClientAcquireToken, n.correlationId), u = (i = this.performanceClient) === null || i === void 0 ? void 0 : i.startMeasurement(_.RefreshTokenClientAcquireToken, n.correlationId), this.logger.verbose("RefreshTokenClientAcquireToken called", n.correlationId), d = Bt.nowSeconds(), (o = this.performanceClient) === null || o === void 0 || o.setPreQueueTime(_.RefreshTokenClientExecuteTokenRequest, n.correlationId), [4, this.executeTokenRequest(n, this.authority)];
            case 1:
              return h = g.sent(), f = (a = h.headers) === null || a === void 0 ? void 0 : a[Nt.X_MS_HTTP_VERSION], u == null || u.addStaticFields({
                refreshTokenSize: ((s = h.body.refresh_token) === null || s === void 0 ? void 0 : s.length) || 0
              }), f && (u == null || u.addStaticFields({
                httpVerToken: f
              })), m = (c = h.headers) === null || c === void 0 ? void 0 : c[Nt.X_MS_REQUEST_ID], E = new uc(this.config.authOptions.clientId, this.cacheManager, this.cryptoUtils, this.logger, this.config.serializableCache, this.config.persistencePlugin), E.validateTokenResponse(h.body), (l = this.performanceClient) === null || l === void 0 || l.setPreQueueTime(_.HandleServerTokenResponse, n.correlationId), [2, E.handleServerTokenResponse(h.body, this.authority, d, n, void 0, void 0, !0, n.forceCache, m).then(function(p) {
                return u == null || u.endMeasurement({
                  success: !0
                }), p;
              }).catch(function(p) {
                throw N.logger.verbose("Error in fetching refresh token", n.correlationId), u == null || u.endMeasurement({
                  errorCode: p.errorCode,
                  subErrorCode: p.subError,
                  success: !1
                }), p;
              })];
          }
        });
      });
    }, e.prototype.acquireTokenByRefreshToken = function(n) {
      var r, i, o, a;
      return $(this, void 0, void 0, function() {
        var s, c, l;
        return X(this, function(u) {
          if (!n)
            throw Ee.createEmptyTokenRequestError();
          if ((r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.RefreshTokenClientAcquireTokenByRefreshToken, n.correlationId), !n.account)
            throw L.createNoAccountInSilentRequestError();
          if (s = this.cacheManager.isAppMetadataFOCI(n.account.environment), s)
            try {
              return (i = this.performanceClient) === null || i === void 0 || i.setPreQueueTime(_.RefreshTokenClientAcquireTokenWithCachedRefreshToken, n.correlationId), [2, this.acquireTokenWithCachedRefreshToken(n, !0)];
            } catch (d) {
              if (c = d instanceof Zt && d.errorCode === vi.noTokensFoundError.code, l = d instanceof Br && d.errorCode === cp.INVALID_GRANT_ERROR && d.subError === cp.CLIENT_MISMATCH_ERROR, c || l)
                return (o = this.performanceClient) === null || o === void 0 || o.setPreQueueTime(_.RefreshTokenClientAcquireTokenWithCachedRefreshToken, n.correlationId), [2, this.acquireTokenWithCachedRefreshToken(n, !1)];
              throw d;
            }
          return (a = this.performanceClient) === null || a === void 0 || a.setPreQueueTime(_.RefreshTokenClientAcquireTokenWithCachedRefreshToken, n.correlationId), [2, this.acquireTokenWithCachedRefreshToken(n, !1)];
        });
      });
    }, e.prototype.acquireTokenWithCachedRefreshToken = function(n, r) {
      var i, o, a;
      return $(this, void 0, void 0, function() {
        var s, c, l;
        return X(this, function(u) {
          if ((i = this.performanceClient) === null || i === void 0 || i.addQueueMeasurement(_.RefreshTokenClientAcquireTokenWithCachedRefreshToken, n.correlationId), s = (o = this.performanceClient) === null || o === void 0 ? void 0 : o.startMeasurement(_.RefreshTokenClientAcquireTokenWithCachedRefreshToken, n.correlationId), this.logger.verbose("RefreshTokenClientAcquireTokenWithCachedRefreshToken called", n.correlationId), c = this.cacheManager.getRefreshToken(n.account, r), !c)
            throw s == null || s.discardMeasurement(), Zt.createNoTokensFoundError();
          return s == null || s.endMeasurement({
            success: !0
          }), l = ce(ce({}, n), { refreshToken: c.secret, authenticationScheme: n.authenticationScheme || ue.BEARER, ccsCredential: {
            credential: n.account.homeAccountId,
            type: Rt.HOME_ACCOUNT_ID
          } }), (a = this.performanceClient) === null || a === void 0 || a.setPreQueueTime(_.RefreshTokenClientAcquireToken, n.correlationId), [2, this.acquireToken(l)];
        });
      });
    }, e.prototype.executeTokenRequest = function(n, r) {
      var i, o, a;
      return $(this, void 0, void 0, function() {
        var s, c, l, u, d, h;
        return X(this, function(f) {
          switch (f.label) {
            case 0:
              return (i = this.performanceClient) === null || i === void 0 || i.addQueueMeasurement(_.RefreshTokenClientExecuteTokenRequest, n.correlationId), s = (o = this.performanceClient) === null || o === void 0 ? void 0 : o.startMeasurement(_.RefreshTokenClientExecuteTokenRequest, n.correlationId), (a = this.performanceClient) === null || a === void 0 || a.setPreQueueTime(_.RefreshTokenClientCreateTokenRequestBody, n.correlationId), c = this.createTokenQueryParameters(n), l = ie.appendQueryString(r.tokenEndpoint, c), [4, this.createTokenRequestBody(n)];
            case 1:
              return u = f.sent(), d = this.createTokenRequestHeaders(n.ccsCredential), h = {
                clientId: this.config.authOptions.clientId,
                authority: r.canonicalAuthority,
                scopes: n.scopes,
                claims: n.claims,
                authenticationScheme: n.authenticationScheme,
                resourceRequestMethod: n.resourceRequestMethod,
                resourceRequestUri: n.resourceRequestUri,
                shrClaims: n.shrClaims,
                sshKid: n.sshKid
              }, [2, this.executePostToTokenEndpoint(l, u, d, h).then(function(m) {
                return s == null || s.endMeasurement({
                  success: !0
                }), m;
              }).catch(function(m) {
                throw s == null || s.endMeasurement({
                  success: !1
                }), m;
              })];
          }
        });
      });
    }, e.prototype.createTokenRequestBody = function(n) {
      var r, i, o;
      return $(this, void 0, void 0, function() {
        var a, s, c, l, u, d, h;
        return X(this, function(f) {
          switch (f.label) {
            case 0:
              return (r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.RefreshTokenClientCreateTokenRequestBody, n.correlationId), a = n.correlationId, s = (i = this.performanceClient) === null || i === void 0 ? void 0 : i.startMeasurement(_.BaseClientCreateTokenRequestHeaders, a), c = new Qo(), c.addClientId(this.config.authOptions.clientId), c.addScopes(n.scopes), c.addGrantType(ic.REFRESH_TOKEN_GRANT), c.addClientInfo(), c.addLibraryInfo(this.config.libraryInfo), c.addApplicationTelemetry(this.config.telemetry.application), c.addThrottling(), this.serverTelemetryManager && c.addServerTelemetry(this.serverTelemetryManager), c.addCorrelationId(a), c.addRefreshToken(n.refreshToken), this.config.clientCredentials.clientSecret && c.addClientSecret(this.config.clientCredentials.clientSecret), this.config.clientCredentials.clientAssertion && (l = this.config.clientCredentials.clientAssertion, c.addClientAssertion(l.assertion), c.addClientAssertionType(l.assertionType)), n.authenticationScheme !== ue.POP ? [3, 2] : (u = new Gi(this.cryptoUtils, this.performanceClient), (o = this.performanceClient) === null || o === void 0 || o.setPreQueueTime(_.PopTokenGenerateCnf, n.correlationId), [4, u.generateCnf(n)]);
            case 1:
              return d = f.sent(), c.addPopToken(d.reqCnfString), [3, 3];
            case 2:
              if (n.authenticationScheme === ue.SSH)
                if (n.sshJwk)
                  c.addSshJwk(n.sshJwk);
                else
                  throw s == null || s.endMeasurement({
                    success: !1
                  }), Ee.createMissingSshJwkError();
              f.label = 3;
            case 3:
              if ((!P.isEmptyObj(n.claims) || this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0) && c.addClaims(n.claims, this.config.authOptions.clientCapabilities), this.config.systemOptions.preventCorsPreflight && n.ccsCredential)
                switch (n.ccsCredential.type) {
                  case Rt.HOME_ACCOUNT_ID:
                    try {
                      h = gi(n.ccsCredential.credential), c.addCcsOid(h);
                    } catch (m) {
                      this.logger.verbose("Could not parse home account ID for CCS Header: " + m);
                    }
                    break;
                  case Rt.UPN:
                    c.addCcsUpn(n.ccsCredential.credential);
                    break;
                }
              return s == null || s.endMeasurement({
                success: !0
              }), [2, c.createQueryString()];
          }
        });
      });
    }, e;
  }(oh)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Qw = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r) {
      return t.call(this, n, r) || this;
    }
    return e.prototype.acquireToken = function(n) {
      return $(this, void 0, void 0, function() {
        var r, i;
        return X(this, function(o) {
          switch (o.label) {
            case 0:
              return o.trys.push([0, 2, , 3]), [4, this.acquireCachedToken(n)];
            case 1:
              return [2, o.sent()];
            case 2:
              if (r = o.sent(), r instanceof L && r.errorCode === R.tokenRefreshRequired.code)
                return i = new ty(this.config, this.performanceClient), [2, i.acquireTokenByRefreshToken(n)];
              throw r;
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.acquireCachedToken = function(n) {
      var r, i, o, a, s;
      return $(this, void 0, void 0, function() {
        var c, l;
        return X(this, function(u) {
          switch (u.label) {
            case 0:
              if (!n)
                throw Ee.createEmptyTokenRequestError();
              if (n.forceRefresh)
                throw (r = this.serverTelemetryManager) === null || r === void 0 || r.setCacheOutcome(er.FORCE_REFRESH), this.logger.info("SilentFlowClient:acquireCachedToken - Skipping cache because forceRefresh is true."), L.createRefreshRequiredError();
              if (!this.config.cacheOptions.claimsBasedCachingEnabled && !P.isEmptyObj(n.claims))
                throw (i = this.serverTelemetryManager) === null || i === void 0 || i.setCacheOutcome(er.CLAIMS_REQUESTED_CACHE_SKIPPED), this.logger.info("SilentFlowClient:acquireCachedToken - Skipping cache because claims-based caching is disabled and claims were requested."), L.createRefreshRequiredError();
              if (!n.account)
                throw L.createNoAccountInSilentRequestError();
              if (c = n.authority || this.authority.getPreferredCache(), l = this.cacheManager.readCacheRecord(n.account, n, c), l.accessToken) {
                if (Bt.wasClockTurnedBack(l.accessToken.cachedAt) || Bt.isTokenExpired(l.accessToken.expiresOn, this.config.systemOptions.tokenRenewalOffsetSeconds))
                  throw (a = this.serverTelemetryManager) === null || a === void 0 || a.setCacheOutcome(er.CACHED_ACCESS_TOKEN_EXPIRED), this.logger.info("SilentFlowClient:acquireCachedToken - Cached access token is expired or will expire within " + this.config.systemOptions.tokenRenewalOffsetSeconds + " seconds."), L.createRefreshRequiredError();
                if (l.accessToken.refreshOn && Bt.isTokenExpired(l.accessToken.refreshOn, 0))
                  throw (s = this.serverTelemetryManager) === null || s === void 0 || s.setCacheOutcome(er.REFRESH_CACHED_ACCESS_TOKEN), this.logger.info("SilentFlowClient:acquireCachedToken - Cached access token's refreshOn property has been exceeded'."), L.createRefreshRequiredError();
              } else
                throw (o = this.serverTelemetryManager) === null || o === void 0 || o.setCacheOutcome(er.NO_CACHED_ACCESS_TOKEN), this.logger.info("SilentFlowClient:acquireCachedToken - No access token found in cache for the given properties."), L.createRefreshRequiredError();
              return this.config.serverTelemetryManager && this.config.serverTelemetryManager.incrementCacheHits(), [4, this.generateResultFromCacheRecord(l, n)];
            case 1:
              return [2, u.sent()];
          }
        });
      });
    }, e.prototype.generateResultFromCacheRecord = function(n, r) {
      return $(this, void 0, void 0, function() {
        var i, o;
        return X(this, function(a) {
          switch (a.label) {
            case 0:
              if (n.idToken && (i = new mn(n.idToken.secret, this.config.cryptoInterface)), r.maxAge || r.maxAge === 0) {
                if (o = i == null ? void 0 : i.claims.auth_time, !o)
                  throw L.createAuthTimeNotFoundError();
                mn.checkMaxAge(o, r.maxAge);
              }
              return [4, uc.generateAuthenticationResult(this.cryptoUtils, this.authority, n, !0, r, i)];
            case 1:
              return [2, a.sent()];
          }
        });
      });
    }, e;
  }(oh)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
function Vw(t) {
  return t.hasOwnProperty("authorization_endpoint") && t.hasOwnProperty("token_endpoint") && t.hasOwnProperty("issuer") && t.hasOwnProperty("jwks_uri");
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ny = { endpointMetadata: { "https://login.microsoftonline.com/common/": { token_endpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.microsoftonline.com/common/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.microsoftonline.com/{tenantid}/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo", authorization_endpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.microsoftonline.com/common/kerberos", tenant_region_scope: null, cloud_instance_name: "microsoftonline.com", cloud_graph_host_name: "graph.windows.net", msgraph_host: "graph.microsoft.com", rbac_url: "https://pas.windows.net" }, "https://login.chinacloudapi.cn/common/": { token_endpoint: "https://login.chinacloudapi.cn/common/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.chinacloudapi.cn/common/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.partner.microsoftonline.cn/{tenantid}/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://microsoftgraph.chinacloudapi.cn/oidc/userinfo", authorization_endpoint: "https://login.chinacloudapi.cn/common/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.chinacloudapi.cn/common/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.chinacloudapi.cn/common/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.chinacloudapi.cn/common/kerberos", tenant_region_scope: null, cloud_instance_name: "partner.microsoftonline.cn", cloud_graph_host_name: "graph.chinacloudapi.cn", msgraph_host: "microsoftgraph.chinacloudapi.cn", rbac_url: "https://pas.chinacloudapi.cn" }, "https://login.microsoftonline.us/common/": { token_endpoint: "https://login.microsoftonline.us/common/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.microsoftonline.us/common/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.microsoftonline.us/{tenantid}/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo", authorization_endpoint: "https://login.microsoftonline.us/common/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.microsoftonline.us/common/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.microsoftonline.us/common/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.microsoftonline.us/common/kerberos", tenant_region_scope: null, cloud_instance_name: "microsoftonline.us", cloud_graph_host_name: "graph.windows.net", msgraph_host: "graph.microsoft.com", rbac_url: "https://pasff.usgovcloudapi.net" }, "https://login.microsoftonline.com/consumers/": { token_endpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.microsoftonline.com/consumers/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo", authorization_endpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.microsoftonline.com/consumers/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.microsoftonline.com/consumers/kerberos", tenant_region_scope: null, cloud_instance_name: "microsoftonline.com", cloud_graph_host_name: "graph.windows.net", msgraph_host: "graph.microsoft.com", rbac_url: "https://pas.windows.net" }, "https://login.chinacloudapi.cn/consumers/": { token_endpoint: "https://login.chinacloudapi.cn/consumers/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.chinacloudapi.cn/consumers/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.partner.microsoftonline.cn/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://microsoftgraph.chinacloudapi.cn/oidc/userinfo", authorization_endpoint: "https://login.chinacloudapi.cn/consumers/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.chinacloudapi.cn/consumers/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.chinacloudapi.cn/consumers/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.chinacloudapi.cn/consumers/kerberos", tenant_region_scope: null, cloud_instance_name: "partner.microsoftonline.cn", cloud_graph_host_name: "graph.chinacloudapi.cn", msgraph_host: "microsoftgraph.chinacloudapi.cn", rbac_url: "https://pas.chinacloudapi.cn" }, "https://login.microsoftonline.us/consumers/": { token_endpoint: "https://login.microsoftonline.us/consumers/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.microsoftonline.us/consumers/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.microsoftonline.us/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo", authorization_endpoint: "https://login.microsoftonline.us/consumers/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.microsoftonline.us/consumers/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.microsoftonline.us/consumers/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.microsoftonline.us/consumers/kerberos", tenant_region_scope: null, cloud_instance_name: "microsoftonline.us", cloud_graph_host_name: "graph.windows.net", msgraph_host: "graph.microsoft.com", rbac_url: "https://pasff.usgovcloudapi.net" }, "https://login.microsoftonline.com/organizations/": { token_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.microsoftonline.com/organizations/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.microsoftonline.com/{tenantid}/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo", authorization_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.microsoftonline.com/organizations/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.microsoftonline.com/organizations/kerberos", tenant_region_scope: null, cloud_instance_name: "microsoftonline.com", cloud_graph_host_name: "graph.windows.net", msgraph_host: "graph.microsoft.com", rbac_url: "https://pas.windows.net" }, "https://login.chinacloudapi.cn/organizations/": { token_endpoint: "https://login.chinacloudapi.cn/organizations/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.chinacloudapi.cn/organizations/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.partner.microsoftonline.cn/{tenantid}/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://microsoftgraph.chinacloudapi.cn/oidc/userinfo", authorization_endpoint: "https://login.chinacloudapi.cn/organizations/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.chinacloudapi.cn/organizations/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.chinacloudapi.cn/organizations/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.chinacloudapi.cn/organizations/kerberos", tenant_region_scope: null, cloud_instance_name: "partner.microsoftonline.cn", cloud_graph_host_name: "graph.chinacloudapi.cn", msgraph_host: "microsoftgraph.chinacloudapi.cn", rbac_url: "https://pas.chinacloudapi.cn" }, "https://login.microsoftonline.us/organizations/": { token_endpoint: "https://login.microsoftonline.us/organizations/oauth2/v2.0/token", token_endpoint_auth_methods_supported: ["client_secret_post", "private_key_jwt", "client_secret_basic"], jwks_uri: "https://login.microsoftonline.us/organizations/discovery/v2.0/keys", response_modes_supported: ["query", "fragment", "form_post"], subject_types_supported: ["pairwise"], id_token_signing_alg_values_supported: ["RS256"], response_types_supported: ["code", "id_token", "code id_token", "id_token token"], scopes_supported: ["openid", "profile", "email", "offline_access"], issuer: "https://login.microsoftonline.us/{tenantid}/v2.0", request_uri_parameter_supported: !1, userinfo_endpoint: "https://graph.microsoft.com/oidc/userinfo", authorization_endpoint: "https://login.microsoftonline.us/organizations/oauth2/v2.0/authorize", device_authorization_endpoint: "https://login.microsoftonline.us/organizations/oauth2/v2.0/devicecode", http_logout_supported: !0, frontchannel_logout_supported: !0, end_session_endpoint: "https://login.microsoftonline.us/organizations/oauth2/v2.0/logout", claims_supported: ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"], kerberos_endpoint: "https://login.microsoftonline.us/organizations/kerberos", tenant_region_scope: null, cloud_instance_name: "microsoftonline.us", cloud_graph_host_name: "graph.windows.net", msgraph_host: "graph.microsoft.com", rbac_url: "https://pasff.usgovcloudapi.net" } }, instanceDiscoveryMetadata: { "https://login.microsoftonline.com/common/": { tenant_discovery_endpoint: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.chinacloudapi.cn/common/": { tenant_discovery_endpoint: "https://login.chinacloudapi.cn/common/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.microsoftonline.us/common/": { tenant_discovery_endpoint: "https://login.microsoftonline.us/common/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.microsoftonline.com/consumers/": { tenant_discovery_endpoint: "https://login.microsoftonline.com/consumers/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.chinacloudapi.cn/consumers/": { tenant_discovery_endpoint: "https://login.chinacloudapi.cn/consumers/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.microsoftonline.us/consumers/": { tenant_discovery_endpoint: "https://login.microsoftonline.us/consumers/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.microsoftonline.com/organizations/": { tenant_discovery_endpoint: "https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.chinacloudapi.cn/organizations/": { tenant_discovery_endpoint: "https://login.chinacloudapi.cn/organizations/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] }, "https://login.microsoftonline.us/organizations/": { tenant_discovery_endpoint: "https://login.microsoftonline.us/organizations/v2.0/.well-known/openid-configuration", "api-version": "1.1", metadata: [{ preferred_network: "login.microsoftonline.com", preferred_cache: "login.windows.net", aliases: ["login.microsoftonline.com", "login.windows.net", "login.microsoft.com", "sts.windows.net"] }, { preferred_network: "login.partner.microsoftonline.cn", preferred_cache: "login.partner.microsoftonline.cn", aliases: ["login.partner.microsoftonline.cn", "login.chinacloudapi.cn"] }, { preferred_network: "login.microsoftonline.de", preferred_cache: "login.microsoftonline.de", aliases: ["login.microsoftonline.de"] }, { preferred_network: "login.microsoftonline.us", preferred_cache: "login.microsoftonline.us", aliases: ["login.microsoftonline.us", "login.usgovcloudapi.net"] }, { preferred_network: "login-us.microsoftonline.com", preferred_cache: "login-us.microsoftonline.com", aliases: ["login-us.microsoftonline.com"] }] } } }, up = ny.endpointMetadata, dp = ny.instanceDiscoveryMetadata;
/*! @azure/msal-common v13.3.1 2023-10-27 */
var fa;
(function(t) {
  t.AAD = "AAD", t.OIDC = "OIDC";
})(fa || (fa = {}));
/*! @azure/msal-common v13.3.1 2023-10-27 */
var zu = (
  /** @class */
  function() {
    function t() {
      this.expiresAt = Bt.nowSeconds() + Fo.REFRESH_TIME_SECONDS;
    }
    return t.prototype.updateCloudDiscoveryMetadata = function(e, n) {
      this.aliases = e.aliases, this.preferred_cache = e.preferred_cache, this.preferred_network = e.preferred_network, this.aliasesFromNetwork = n;
    }, t.prototype.updateEndpointMetadata = function(e, n) {
      this.authorization_endpoint = e.authorization_endpoint, this.token_endpoint = e.token_endpoint, this.end_session_endpoint = e.end_session_endpoint, this.issuer = e.issuer, this.endpointsFromNetwork = n, this.jwks_uri = e.jwks_uri;
    }, t.prototype.updateCanonicalAuthority = function(e) {
      this.canonical_authority = e;
    }, t.prototype.resetExpiresAt = function() {
      this.expiresAt = Bt.nowSeconds() + Fo.REFRESH_TIME_SECONDS;
    }, t.prototype.isExpired = function() {
      return this.expiresAt <= Bt.nowSeconds();
    }, t.isAuthorityMetadataEntity = function(e, n) {
      return n ? e.indexOf(Fo.CACHE_KEY) === 0 && n.hasOwnProperty("aliases") && n.hasOwnProperty("preferred_cache") && n.hasOwnProperty("preferred_network") && n.hasOwnProperty("canonical_authority") && n.hasOwnProperty("authorization_endpoint") && n.hasOwnProperty("token_endpoint") && n.hasOwnProperty("issuer") && n.hasOwnProperty("aliasesFromNetwork") && n.hasOwnProperty("endpointsFromNetwork") && n.hasOwnProperty("expiresAt") && n.hasOwnProperty("jwks_uri") : !1;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
function $w(t) {
  return t.hasOwnProperty("tenant_discovery_endpoint") && t.hasOwnProperty("metadata");
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
function Xw(t) {
  return t.hasOwnProperty("error") && t.hasOwnProperty("error_description");
}
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Jw = (
  /** @class */
  function() {
    function t(e, n, r) {
      this.networkInterface = e, this.performanceClient = n, this.correlationId = r;
    }
    return t.prototype.detectRegion = function(e, n) {
      var r, i, o, a;
      return $(this, void 0, void 0, function() {
        var s, c, l, u, d;
        return X(this, function(h) {
          switch (h.label) {
            case 0:
              if ((r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.RegionDiscoveryDetectRegion, this.correlationId), s = e, s)
                return [3, 8];
              c = t.IMDS_OPTIONS, h.label = 1;
            case 1:
              return h.trys.push([1, 6, , 7]), (i = this.performanceClient) === null || i === void 0 || i.setPreQueueTime(_.RegionDiscoveryGetRegionFromIMDS, this.correlationId), [4, this.getRegionFromIMDS(y.IMDS_VERSION, c)];
            case 2:
              return l = h.sent(), l.status === pi.httpSuccess && (s = l.body, n.region_source = Vn.IMDS), l.status !== pi.httpBadRequest ? [3, 5] : ((o = this.performanceClient) === null || o === void 0 || o.setPreQueueTime(_.RegionDiscoveryGetCurrentVersion, this.correlationId), [4, this.getCurrentVersion(c)]);
            case 3:
              return u = h.sent(), u ? ((a = this.performanceClient) === null || a === void 0 || a.setPreQueueTime(_.RegionDiscoveryGetRegionFromIMDS, this.correlationId), [4, this.getRegionFromIMDS(u, c)]) : (n.region_source = Vn.FAILED_AUTO_DETECTION, [2, null]);
            case 4:
              d = h.sent(), d.status === pi.httpSuccess && (s = d.body, n.region_source = Vn.IMDS), h.label = 5;
            case 5:
              return [3, 7];
            case 6:
              return h.sent(), n.region_source = Vn.FAILED_AUTO_DETECTION, [2, null];
            case 7:
              return [3, 9];
            case 8:
              n.region_source = Vn.ENVIRONMENT_VARIABLE, h.label = 9;
            case 9:
              return s || (n.region_source = Vn.FAILED_AUTO_DETECTION), [2, s || null];
          }
        });
      });
    }, t.prototype.getRegionFromIMDS = function(e, n) {
      var r;
      return $(this, void 0, void 0, function() {
        return X(this, function(i) {
          return (r = this.performanceClient) === null || r === void 0 || r.addQueueMeasurement(_.RegionDiscoveryGetRegionFromIMDS, this.correlationId), [2, this.networkInterface.sendGetRequestAsync(y.IMDS_ENDPOINT + "?api-version=" + e + "&format=text", n, y.IMDS_TIMEOUT)];
        });
      });
    }, t.prototype.getCurrentVersion = function(e) {
      var n;
      return $(this, void 0, void 0, function() {
        var r;
        return X(this, function(i) {
          switch (i.label) {
            case 0:
              (n = this.performanceClient) === null || n === void 0 || n.addQueueMeasurement(_.RegionDiscoveryGetCurrentVersion, this.correlationId), i.label = 1;
            case 1:
              return i.trys.push([1, 3, , 4]), [4, this.networkInterface.sendGetRequestAsync(y.IMDS_ENDPOINT + "?format=json", e)];
            case 2:
              return r = i.sent(), r.status === pi.httpBadRequest && r.body && r.body["newest-versions"] && r.body["newest-versions"].length > 0 ? [2, r.body["newest-versions"][0]] : [2, null];
            case 3:
              return i.sent(), [2, null];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.IMDS_OPTIONS = {
      headers: {
        Metadata: "true"
      }
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var pa = (
  /** @class */
  function() {
    function t(e, n, r, i, o, a, s) {
      this.canonicalAuthority = e, this._canonicalAuthority.validateAsUri(), this.networkInterface = n, this.cacheManager = r, this.authorityOptions = i, this.regionDiscoveryMetadata = { region_used: void 0, region_source: void 0, region_outcome: void 0 }, this.logger = o, this.performanceClient = a, this.correlationId = s, this.regionDiscovery = new Jw(n, this.performanceClient, this.correlationId);
    }
    return t.prototype.getAuthorityType = function(e) {
      if (e.HostNameAndPort.endsWith(y.CIAM_AUTH_URL))
        return lt.Ciam;
      var n = e.PathSegments;
      if (n.length)
        switch (n[0].toLowerCase()) {
          case y.ADFS:
            return lt.Adfs;
          case y.DSTS:
            return lt.Dsts;
        }
      return lt.Default;
    }, Object.defineProperty(t.prototype, "authorityType", {
      // See above for AuthorityType
      get: function() {
        return this.getAuthorityType(this.canonicalAuthorityUrlComponents);
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "protocolMode", {
      /**
       * ProtocolMode enum representing the way endpoints are constructed.
       */
      get: function() {
        return this.authorityOptions.protocolMode;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "options", {
      /**
       * Returns authorityOptions which can be used to reinstantiate a new authority instance
       */
      get: function() {
        return this.authorityOptions;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "canonicalAuthority", {
      /**
       * A URL that is the authority set by the developer
       */
      get: function() {
        return this._canonicalAuthority.urlString;
      },
      /**
       * Sets canonical authority.
       */
      set: function(e) {
        this._canonicalAuthority = new ie(e), this._canonicalAuthority.validateAsUri(), this._canonicalAuthorityUrlComponents = null;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "canonicalAuthorityUrlComponents", {
      /**
       * Get authority components.
       */
      get: function() {
        return this._canonicalAuthorityUrlComponents || (this._canonicalAuthorityUrlComponents = this._canonicalAuthority.getUrlComponents()), this._canonicalAuthorityUrlComponents;
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "hostnameAndPort", {
      /**
       * Get hostname and port i.e. login.microsoftonline.com
       */
      get: function() {
        return this.canonicalAuthorityUrlComponents.HostNameAndPort.toLowerCase();
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "tenant", {
      /**
       * Get tenant for authority.
       */
      get: function() {
        return this.canonicalAuthorityUrlComponents.PathSegments[0];
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "authorizationEndpoint", {
      /**
       * OAuth /authorize endpoint for requests
       */
      get: function() {
        if (this.discoveryComplete())
          return this.replacePath(this.metadata.authorization_endpoint);
        throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "tokenEndpoint", {
      /**
       * OAuth /token endpoint for requests
       */
      get: function() {
        if (this.discoveryComplete())
          return this.replacePath(this.metadata.token_endpoint);
        throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "deviceCodeEndpoint", {
      get: function() {
        if (this.discoveryComplete())
          return this.replacePath(this.metadata.token_endpoint.replace("/token", "/devicecode"));
        throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "endSessionEndpoint", {
      /**
       * OAuth logout endpoint for requests
       */
      get: function() {
        if (this.discoveryComplete()) {
          if (!this.metadata.end_session_endpoint)
            throw L.createLogoutNotSupportedError();
          return this.replacePath(this.metadata.end_session_endpoint);
        } else
          throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "selfSignedJwtAudience", {
      /**
       * OAuth issuer for requests
       */
      get: function() {
        if (this.discoveryComplete())
          return this.replacePath(this.metadata.issuer);
        throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
      },
      enumerable: !1,
      configurable: !0
    }), Object.defineProperty(t.prototype, "jwksUri", {
      /**
       * Jwks_uri for token signing keys
       */
      get: function() {
        if (this.discoveryComplete())
          return this.replacePath(this.metadata.jwks_uri);
        throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
      },
      enumerable: !1,
      configurable: !0
    }), t.prototype.canReplaceTenant = function(e) {
      return e.PathSegments.length === 1 && !t.reservedTenantDomains.has(e.PathSegments[0]) && this.getAuthorityType(e) === lt.Default && this.protocolMode === fa.AAD;
    }, t.prototype.replaceTenant = function(e) {
      return e.replace(/{tenant}|{tenantid}/g, this.tenant);
    }, t.prototype.replacePath = function(e) {
      var n = this, r = e, i = new ie(this.metadata.canonical_authority), o = i.getUrlComponents(), a = o.PathSegments, s = this.canonicalAuthorityUrlComponents.PathSegments;
      return s.forEach(function(c, l) {
        var u = a[l];
        if (l === 0 && n.canReplaceTenant(o)) {
          var d = new ie(n.metadata.authorization_endpoint).getUrlComponents().PathSegments[0];
          u !== d && (n.logger.verbose("Replacing tenant domain name " + u + " with id " + d), u = d);
        }
        c !== u && (r = r.replace("/" + u + "/", "/" + c + "/"));
      }), this.replaceTenant(r);
    }, Object.defineProperty(t.prototype, "defaultOpenIdConfigurationEndpoint", {
      /**
       * The default open id configuration endpoint for any canonical authority.
       */
      get: function() {
        return this.authorityType === lt.Adfs || this.authorityType === lt.Dsts || this.protocolMode === fa.OIDC ? this.canonicalAuthority + ".well-known/openid-configuration" : this.canonicalAuthority + "v2.0/.well-known/openid-configuration";
      },
      enumerable: !1,
      configurable: !0
    }), t.prototype.discoveryComplete = function() {
      return !!this.metadata;
    }, t.prototype.resolveEndpointsAsync = function() {
      var e, n, r;
      return $(this, void 0, void 0, function() {
        var i, o, a, s;
        return X(this, function(c) {
          switch (c.label) {
            case 0:
              return (e = this.performanceClient) === null || e === void 0 || e.addQueueMeasurement(_.AuthorityResolveEndpointsAsync, this.correlationId), i = this.cacheManager.getAuthorityMetadataByAlias(this.hostnameAndPort), i || (i = new zu(), i.updateCanonicalAuthority(this.canonicalAuthority)), (n = this.performanceClient) === null || n === void 0 || n.setPreQueueTime(_.AuthorityUpdateCloudDiscoveryMetadata, this.correlationId), [4, this.updateCloudDiscoveryMetadata(i)];
            case 1:
              return o = c.sent(), this.canonicalAuthority = this.canonicalAuthority.replace(this.hostnameAndPort, i.preferred_network), (r = this.performanceClient) === null || r === void 0 || r.setPreQueueTime(_.AuthorityUpdateEndpointMetadata, this.correlationId), [4, this.updateEndpointMetadata(i)];
            case 2:
              return a = c.sent(), o !== Mt.CACHE && a !== Mt.CACHE && (i.resetExpiresAt(), i.updateCanonicalAuthority(this.canonicalAuthority)), s = this.cacheManager.generateAuthorityMetadataCacheKey(i.preferred_cache), this.cacheManager.setAuthorityMetadata(s, i), this.metadata = i, [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.updateEndpointMetadata = function(e) {
      var n, r, i, o, a, s;
      return $(this, void 0, void 0, function() {
        var c, l;
        return X(this, function(u) {
          switch (u.label) {
            case 0:
              return (n = this.performanceClient) === null || n === void 0 || n.addQueueMeasurement(_.AuthorityUpdateEndpointMetadata, this.correlationId), c = this.getEndpointMetadataFromConfig(), c ? (e.updateEndpointMetadata(c, !1), [2, Mt.CONFIG]) : this.isAuthoritySameType(e) && e.endpointsFromNetwork && !e.isExpired() ? [2, Mt.CACHE] : ((r = this.performanceClient) === null || r === void 0 || r.setPreQueueTime(_.AuthorityGetEndpointMetadataFromNetwork, this.correlationId), [4, this.getEndpointMetadataFromNetwork()]);
            case 1:
              return c = u.sent(), c ? !((i = this.authorityOptions.azureRegionConfiguration) === null || i === void 0) && i.azureRegion ? ((o = this.performanceClient) === null || o === void 0 || o.setPreQueueTime(_.AuthorityUpdateMetadataWithRegionalInformation, this.correlationId), [4, this.updateMetadataWithRegionalInformation(c)]) : [3, 3] : [3, 4];
            case 2:
              c = u.sent(), u.label = 3;
            case 3:
              return e.updateEndpointMetadata(c, !0), [2, Mt.NETWORK];
            case 4:
              return l = this.getEndpointMetadataFromHardcodedValues(), l && !this.authorityOptions.skipAuthorityMetadataCache ? !((a = this.authorityOptions.azureRegionConfiguration) === null || a === void 0) && a.azureRegion ? ((s = this.performanceClient) === null || s === void 0 || s.setPreQueueTime(_.AuthorityUpdateMetadataWithRegionalInformation, this.correlationId), [4, this.updateMetadataWithRegionalInformation(l)]) : [3, 6] : [3, 7];
            case 5:
              l = u.sent(), u.label = 6;
            case 6:
              return e.updateEndpointMetadata(l, !1), [2, Mt.HARDCODED_VALUES];
            case 7:
              throw L.createUnableToGetOpenidConfigError(this.defaultOpenIdConfigurationEndpoint);
          }
        });
      });
    }, t.prototype.isAuthoritySameType = function(e) {
      var n = new ie(e.canonical_authority), r = n.getUrlComponents().PathSegments;
      return r.length === this.canonicalAuthorityUrlComponents.PathSegments.length;
    }, t.prototype.getEndpointMetadataFromConfig = function() {
      if (this.authorityOptions.authorityMetadata)
        try {
          return JSON.parse(this.authorityOptions.authorityMetadata);
        } catch {
          throw Ee.createInvalidAuthorityMetadataError();
        }
      return null;
    }, t.prototype.getEndpointMetadataFromNetwork = function() {
      var e;
      return $(this, void 0, void 0, function() {
        var n, r;
        return X(this, function(i) {
          switch (i.label) {
            case 0:
              (e = this.performanceClient) === null || e === void 0 || e.addQueueMeasurement(_.AuthorityGetEndpointMetadataFromNetwork, this.correlationId), n = {}, i.label = 1;
            case 1:
              return i.trys.push([1, 3, , 4]), [4, this.networkInterface.sendGetRequestAsync(this.defaultOpenIdConfigurationEndpoint, n)];
            case 2:
              return r = i.sent(), [2, Vw(r.body) ? r.body : null];
            case 3:
              return i.sent(), [2, null];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.getEndpointMetadataFromHardcodedValues = function() {
      return this.canonicalAuthority in up ? up[this.canonicalAuthority] : null;
    }, t.prototype.updateMetadataWithRegionalInformation = function(e) {
      var n, r, i, o;
      return $(this, void 0, void 0, function() {
        var a, s;
        return X(this, function(c) {
          switch (c.label) {
            case 0:
              return (n = this.performanceClient) === null || n === void 0 || n.addQueueMeasurement(_.AuthorityUpdateMetadataWithRegionalInformation, this.correlationId), a = (r = this.authorityOptions.azureRegionConfiguration) === null || r === void 0 ? void 0 : r.azureRegion, a ? a !== y.AZURE_REGION_AUTO_DISCOVER_FLAG ? (this.regionDiscoveryMetadata.region_outcome = Yo.CONFIGURED_NO_AUTO_DETECTION, this.regionDiscoveryMetadata.region_used = a, [2, t.replaceWithRegionalInformation(e, a)]) : ((i = this.performanceClient) === null || i === void 0 || i.setPreQueueTime(_.RegionDiscoveryDetectRegion, this.correlationId), [4, this.regionDiscovery.detectRegion((o = this.authorityOptions.azureRegionConfiguration) === null || o === void 0 ? void 0 : o.environmentRegion, this.regionDiscoveryMetadata)]) : [3, 2];
            case 1:
              if (s = c.sent(), s)
                return this.regionDiscoveryMetadata.region_outcome = Yo.AUTO_DETECTION_REQUESTED_SUCCESSFUL, this.regionDiscoveryMetadata.region_used = s, [2, t.replaceWithRegionalInformation(e, s)];
              this.regionDiscoveryMetadata.region_outcome = Yo.AUTO_DETECTION_REQUESTED_FAILED, c.label = 2;
            case 2:
              return [2, e];
          }
        });
      });
    }, t.prototype.updateCloudDiscoveryMetadata = function(e) {
      var n, r;
      return $(this, void 0, void 0, function() {
        var i, o, a;
        return X(this, function(s) {
          switch (s.label) {
            case 0:
              return (n = this.performanceClient) === null || n === void 0 || n.addQueueMeasurement(_.AuthorityUpdateCloudDiscoveryMetadata, this.correlationId), this.logger.verbose("Attempting to get cloud discovery metadata in the config"), this.logger.verbosePii("Known Authorities: " + (this.authorityOptions.knownAuthorities || y.NOT_APPLICABLE)), this.logger.verbosePii("Authority Metadata: " + (this.authorityOptions.authorityMetadata || y.NOT_APPLICABLE)), this.logger.verbosePii("Canonical Authority: " + (e.canonical_authority || y.NOT_APPLICABLE)), i = this.getCloudDiscoveryMetadataFromConfig(), i ? (this.logger.verbose("Found cloud discovery metadata in the config."), e.updateCloudDiscoveryMetadata(i, !1), [2, Mt.CONFIG]) : (this.logger.verbose("Did not find cloud discovery metadata in the config... Attempting to get cloud discovery metadata from the cache."), o = e.isExpired(), this.isAuthoritySameType(e) && e.aliasesFromNetwork && !o ? (this.logger.verbose("Found metadata in the cache."), [2, Mt.CACHE]) : (o && this.logger.verbose("The metadata entity is expired."), this.logger.verbose("Did not find cloud discovery metadata in the cache... Attempting to get cloud discovery metadata from the network."), (r = this.performanceClient) === null || r === void 0 || r.setPreQueueTime(_.AuthorityGetCloudDiscoveryMetadataFromNetwork, this.correlationId), [4, this.getCloudDiscoveryMetadataFromNetwork()]));
            case 1:
              if (i = s.sent(), i)
                return this.logger.verbose("cloud discovery metadata was successfully returned from getCloudDiscoveryMetadataFromNetwork()"), e.updateCloudDiscoveryMetadata(i, !0), [2, Mt.NETWORK];
              if (this.logger.verbose("Did not find cloud discovery metadata from the network... Attempting to get cloud discovery metadata from hardcoded values."), a = this.getCloudDiscoveryMetadataFromHarcodedValues(), a && !this.options.skipAuthorityMetadataCache)
                return this.logger.verbose("Found cloud discovery metadata from hardcoded values."), e.updateCloudDiscoveryMetadata(a, !1), [2, Mt.HARDCODED_VALUES];
              throw this.logger.error("Did not find cloud discovery metadata from hardcoded values... Metadata could not be obtained from config, cache, network or hardcoded values. Throwing Untrusted Authority Error."), Ee.createUntrustedAuthorityError();
          }
        });
      });
    }, t.prototype.getCloudDiscoveryMetadataFromConfig = function() {
      if (this.authorityType === lt.Ciam)
        return this.logger.verbose("CIAM authorities do not support cloud discovery metadata, generate the aliases from authority host."), t.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort);
      if (this.authorityOptions.cloudDiscoveryMetadata) {
        this.logger.verbose("The cloud discovery metadata has been provided as a network response, in the config.");
        try {
          this.logger.verbose("Attempting to parse the cloud discovery metadata.");
          var e = JSON.parse(this.authorityOptions.cloudDiscoveryMetadata), n = t.getCloudDiscoveryMetadataFromNetworkResponse(e.metadata, this.hostnameAndPort);
          if (this.logger.verbose("Parsed the cloud discovery metadata."), n)
            return this.logger.verbose("There is returnable metadata attached to the parsed cloud discovery metadata."), n;
          this.logger.verbose("There is no metadata attached to the parsed cloud discovery metadata.");
        } catch {
          throw this.logger.verbose("Unable to parse the cloud discovery metadata. Throwing Invalid Cloud Discovery Metadata Error."), Ee.createInvalidCloudDiscoveryMetadataError();
        }
      }
      return this.isInKnownAuthorities() ? (this.logger.verbose("The host is included in knownAuthorities. Creating new cloud discovery metadata from the host."), t.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort)) : null;
    }, t.prototype.getCloudDiscoveryMetadataFromNetwork = function() {
      var e;
      return $(this, void 0, void 0, function() {
        var n, r, i, o, a, s, c, l;
        return X(this, function(u) {
          switch (u.label) {
            case 0:
              (e = this.performanceClient) === null || e === void 0 || e.addQueueMeasurement(_.AuthorityGetCloudDiscoveryMetadataFromNetwork, this.correlationId), n = "" + y.AAD_INSTANCE_DISCOVERY_ENDPT + this.canonicalAuthority + "oauth2/v2.0/authorize", r = {}, i = null, u.label = 1;
            case 1:
              return u.trys.push([1, 3, , 4]), [4, this.networkInterface.sendGetRequestAsync(n, r)];
            case 2:
              if (o = u.sent(), a = void 0, s = void 0, $w(o.body))
                a = o.body, s = a.metadata, this.logger.verbosePii("tenant_discovery_endpoint is: " + a.tenant_discovery_endpoint);
              else if (Xw(o.body)) {
                if (this.logger.warning("A CloudInstanceDiscoveryErrorResponse was returned. The cloud instance discovery network request's status code is: " + o.status), a = o.body, a.error === y.INVALID_INSTANCE)
                  return this.logger.error("The CloudInstanceDiscoveryErrorResponse error is invalid_instance."), [2, null];
                this.logger.warning("The CloudInstanceDiscoveryErrorResponse error is " + a.error), this.logger.warning("The CloudInstanceDiscoveryErrorResponse error description is " + a.error_description), this.logger.warning("Setting the value of the CloudInstanceDiscoveryMetadata (returned from the network) to []"), s = [];
              } else
                return this.logger.error("AAD did not return a CloudInstanceDiscoveryResponse or CloudInstanceDiscoveryErrorResponse"), [2, null];
              return this.logger.verbose("Attempting to find a match between the developer's authority and the CloudInstanceDiscoveryMetadata returned from the network request."), i = t.getCloudDiscoveryMetadataFromNetworkResponse(s, this.hostnameAndPort), [3, 4];
            case 3:
              return c = u.sent(), c instanceof K ? this.logger.error(`There was a network error while attempting to get the cloud discovery instance metadata.
Error: ` + c.errorCode + `
Error Description: ` + c.errorMessage) : (l = c, this.logger.error(`A non-MSALJS error was thrown while attempting to get the cloud instance discovery metadata.
Error: ` + l.name + `
Error Description: ` + l.message)), [2, null];
            case 4:
              return i || (this.logger.warning("The developer's authority was not found within the CloudInstanceDiscoveryMetadata returned from the network request."), this.logger.verbose("Creating custom Authority for custom domain scenario."), i = t.createCloudDiscoveryMetadataFromHost(this.hostnameAndPort)), [2, i];
          }
        });
      });
    }, t.prototype.getCloudDiscoveryMetadataFromHarcodedValues = function() {
      return this.canonicalAuthority in dp ? dp[this.canonicalAuthority] : null;
    }, t.prototype.isInKnownAuthorities = function() {
      var e = this, n = this.authorityOptions.knownAuthorities.filter(function(r) {
        return ie.getDomainFromUrl(r).toLowerCase() === e.hostnameAndPort;
      });
      return n.length > 0;
    }, t.generateAuthority = function(e, n) {
      var r;
      if (n && n.azureCloudInstance !== ha.None) {
        var i = n.tenant ? n.tenant : y.DEFAULT_COMMON_TENANT;
        r = n.azureCloudInstance + "/" + i + "/";
      }
      return r || e;
    }, t.createCloudDiscoveryMetadataFromHost = function(e) {
      return {
        preferred_network: e,
        preferred_cache: e,
        aliases: [e]
      };
    }, t.getCloudDiscoveryMetadataFromNetworkResponse = function(e, n) {
      for (var r = 0; r < e.length; r++) {
        var i = e[r];
        if (i.aliases.indexOf(n) > -1)
          return i;
      }
      return null;
    }, t.prototype.getPreferredCache = function() {
      if (this.discoveryComplete())
        return this.metadata.preferred_cache;
      throw L.createEndpointDiscoveryIncompleteError("Discovery incomplete.");
    }, t.prototype.isAlias = function(e) {
      return this.metadata.aliases.indexOf(e) > -1;
    }, t.isPublicCloudAuthority = function(e) {
      return y.KNOWN_PUBLIC_CLOUDS.indexOf(e) >= 0;
    }, t.buildRegionalAuthorityString = function(e, n, r) {
      var i = new ie(e);
      i.validateAsUri();
      var o = i.getUrlComponents(), a = n + "." + o.HostNameAndPort;
      this.isPublicCloudAuthority(o.HostNameAndPort) && (a = n + "." + y.REGIONAL_AUTH_PUBLIC_CLOUD_SUFFIX);
      var s = ie.constructAuthorityUriFromObject(ce(ce({}, i.getUrlComponents()), { HostNameAndPort: a })).urlString;
      return r ? s + "?" + r : s;
    }, t.replaceWithRegionalInformation = function(e, n) {
      return e.authorization_endpoint = t.buildRegionalAuthorityString(e.authorization_endpoint, n), e.token_endpoint = t.buildRegionalAuthorityString(e.token_endpoint, n, y.REGIONAL_AUTH_NON_MSI_QUERY_STRING), e.end_session_endpoint && (e.end_session_endpoint = t.buildRegionalAuthorityString(e.end_session_endpoint, n)), e;
    }, t.transformCIAMAuthority = function(e) {
      var n = e.endsWith(y.FORWARD_SLASH) ? e : "" + e + y.FORWARD_SLASH, r = new ie(e), i = r.getUrlComponents();
      if (i.PathSegments.length === 0 && i.HostNameAndPort.endsWith(y.CIAM_AUTH_URL)) {
        var o = i.HostNameAndPort.split(".")[0];
        n = "" + n + o + y.AAD_TENANT_DOMAIN_SUFFIX;
      }
      return n;
    }, t.reservedTenantDomains = /* @__PURE__ */ new Set([
      "{tenant}",
      "{tenantid}",
      Mr.COMMON,
      Mr.CONSUMERS,
      Mr.ORGANIZATIONS
    ]), t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var dc = (
  /** @class */
  function() {
    function t() {
    }
    return t.createDiscoveredInstance = function(e, n, r, i, o, a, s) {
      return $(this, void 0, void 0, function() {
        var c, l, u;
        return X(this, function(d) {
          switch (d.label) {
            case 0:
              a == null || a.addQueueMeasurement(_.AuthorityFactoryCreateDiscoveredInstance, s), c = pa.transformCIAMAuthority(e), l = t.createInstance(c, n, r, i, o, a, s), d.label = 1;
            case 1:
              return d.trys.push([1, 3, , 4]), a == null || a.setPreQueueTime(_.AuthorityResolveEndpointsAsync, s), [4, l.resolveEndpointsAsync()];
            case 2:
              return d.sent(), [2, l];
            case 3:
              throw u = d.sent(), L.createEndpointDiscoveryIncompleteError(u);
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.createInstance = function(e, n, r, i, o, a, s) {
      if (P.isEmpty(e))
        throw Ee.createUrlEmptyError();
      return new pa(e, n, r, i, o, a, s);
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var hc = (
  /** @class */
  function() {
    function t() {
      this.failedRequests = [], this.errors = [], this.cacheHits = 0;
    }
    return t.isServerTelemetryEntity = function(e, n) {
      var r = e.indexOf(Qe.CACHE_KEY) === 0, i = !0;
      return n && (i = n.hasOwnProperty("failedRequests") && n.hasOwnProperty("errors") && n.hasOwnProperty("cacheHits")), r && i;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var hp = (
  /** @class */
  function() {
    function t() {
    }
    return t.isThrottlingEntity = function(e, n) {
      var r = !1;
      e && (r = e.indexOf(jo.THROTTLING_PREFIX) === 0);
      var i = !0;
      return n && (i = n.hasOwnProperty("throttleTime")), r && i;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Zw = {
  sendGetRequestAsync: function() {
    var t = "Network interface - sendGetRequestAsync() has not been implemented for the Network interface.";
    return Promise.reject(K.createUnexpectedError(t));
  },
  sendPostRequestAsync: function() {
    var t = "Network interface - sendPostRequestAsync() has not been implemented for the Network interface.";
    return Promise.reject(K.createUnexpectedError(t));
  }
};
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Za = {
  missingKidError: {
    code: "missing_kid_error",
    desc: "The JOSE Header for the requested JWT, JWS or JWK object requires a keyId to be configured as the 'kid' header claim. No 'kid' value was provided."
  },
  missingAlgError: {
    code: "missing_alg_error",
    desc: "The JOSE Header for the requested JWT, JWS or JWK object requires an algorithm to be specified as the 'alg' header claim. No 'alg' value was provided."
  }
}, fp = (
  /** @class */
  function(t) {
    wt(e, t);
    function e(n, r) {
      var i = t.call(this, n, r) || this;
      return i.name = "JoseHeaderError", Object.setPrototypeOf(i, e.prototype), i;
    }
    return e.createMissingKidError = function() {
      return new e(Za.missingKidError.code, Za.missingKidError.desc);
    }, e.createMissingAlgError = function() {
      return new e(Za.missingAlgError.code, Za.missingAlgError.desc);
    }, e;
  }(K)
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var Ww = (
  /** @class */
  function() {
    function t(e) {
      this.typ = e.typ, this.alg = e.alg, this.kid = e.kid;
    }
    return t.getShrHeaderString = function(e) {
      if (!e.kid)
        throw fp.createMissingKidError();
      if (!e.alg)
        throw fp.createMissingAlgError();
      var n = new t({
        // Access Token PoP headers must have type pop, but the type header can be overriden for special cases
        typ: e.typ || xu.Pop,
        kid: e.kid,
        alg: e.alg
      });
      return JSON.stringify(n);
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var eA = (
  /** @class */
  function() {
    function t(e, n) {
      this.cacheOutcome = er.NO_CACHE_HIT, this.cacheManager = n, this.apiId = e.apiId, this.correlationId = e.correlationId, this.wrapperSKU = e.wrapperSKU || y.EMPTY_STRING, this.wrapperVer = e.wrapperVer || y.EMPTY_STRING, this.telemetryCacheKey = Qe.CACHE_KEY + qe.CACHE_KEY_SEPARATOR + e.clientId;
    }
    return t.prototype.generateCurrentRequestHeaderValue = function() {
      var e = "" + this.apiId + Qe.VALUE_SEPARATOR + this.cacheOutcome, n = [this.wrapperSKU, this.wrapperVer].join(Qe.VALUE_SEPARATOR), r = this.getRegionDiscoveryFields(), i = [e, r].join(Qe.VALUE_SEPARATOR);
      return [Qe.SCHEMA_VERSION, i, n].join(Qe.CATEGORY_SEPARATOR);
    }, t.prototype.generateLastRequestHeaderValue = function() {
      var e = this.getLastRequests(), n = t.maxErrorsToSend(e), r = e.failedRequests.slice(0, 2 * n).join(Qe.VALUE_SEPARATOR), i = e.errors.slice(0, n).join(Qe.VALUE_SEPARATOR), o = e.errors.length, a = n < o ? Qe.OVERFLOW_TRUE : Qe.OVERFLOW_FALSE, s = [o, a].join(Qe.VALUE_SEPARATOR);
      return [Qe.SCHEMA_VERSION, e.cacheHits, r, i, s].join(Qe.CATEGORY_SEPARATOR);
    }, t.prototype.cacheFailedRequest = function(e) {
      var n = this.getLastRequests();
      n.errors.length >= Qe.MAX_CACHED_ERRORS && (n.failedRequests.shift(), n.failedRequests.shift(), n.errors.shift()), n.failedRequests.push(this.apiId, this.correlationId), P.isEmpty(e.subError) ? P.isEmpty(e.errorCode) ? e && e.toString() ? n.errors.push(e.toString()) : n.errors.push(Qe.UNKNOWN_ERROR) : n.errors.push(e.errorCode) : n.errors.push(e.subError), this.cacheManager.setServerTelemetry(this.telemetryCacheKey, n);
    }, t.prototype.incrementCacheHits = function() {
      var e = this.getLastRequests();
      return e.cacheHits += 1, this.cacheManager.setServerTelemetry(this.telemetryCacheKey, e), e.cacheHits;
    }, t.prototype.getLastRequests = function() {
      var e = new hc(), n = this.cacheManager.getServerTelemetry(this.telemetryCacheKey);
      return n || e;
    }, t.prototype.clearTelemetryCache = function() {
      var e = this.getLastRequests(), n = t.maxErrorsToSend(e), r = e.errors.length;
      if (n === r)
        this.cacheManager.removeItem(this.telemetryCacheKey);
      else {
        var i = new hc();
        i.failedRequests = e.failedRequests.slice(n * 2), i.errors = e.errors.slice(n), this.cacheManager.setServerTelemetry(this.telemetryCacheKey, i);
      }
    }, t.maxErrorsToSend = function(e) {
      var n, r = 0, i = 0, o = e.errors.length;
      for (n = 0; n < o; n++) {
        var a = e.failedRequests[2 * n] || y.EMPTY_STRING, s = e.failedRequests[2 * n + 1] || y.EMPTY_STRING, c = e.errors[n] || y.EMPTY_STRING;
        if (i += a.toString().length + s.toString().length + c.length + 3, i < Qe.MAX_LAST_HEADER_BYTES)
          r += 1;
        else
          break;
      }
      return r;
    }, t.prototype.getRegionDiscoveryFields = function() {
      var e = [];
      return e.push(this.regionUsed || y.EMPTY_STRING), e.push(this.regionSource || y.EMPTY_STRING), e.push(this.regionOutcome || y.EMPTY_STRING), e.join(",");
    }, t.prototype.updateRegionDiscoveryMetadata = function(e) {
      this.regionUsed = e.region_used, this.regionSource = e.region_source, this.regionOutcome = e.region_outcome;
    }, t.prototype.setCacheOutcome = function(e) {
      this.cacheOutcome = e;
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var ry = (
  /** @class */
  function() {
    function t(e, n, r, i, o, a) {
      this.authority = n, this.libraryName = i, this.libraryVersion = o, this.applicationTelemetry = a, this.clientId = e, this.logger = r, this.callbacks = /* @__PURE__ */ new Map(), this.eventsByCorrelationId = /* @__PURE__ */ new Map(), this.queueMeasurements = /* @__PURE__ */ new Map(), this.preQueueTimeByCorrelationId = /* @__PURE__ */ new Map();
    }
    return t.prototype.startPerformanceMeasurement = function(e, n) {
      return {};
    }, t.prototype.startPerformanceMeasuremeant = function(e, n) {
      return {};
    }, t.prototype.getIntFields = function() {
      return jw;
    }, t.prototype.getPreQueueTime = function(e, n) {
      var r = this.preQueueTimeByCorrelationId.get(n);
      if (r) {
        if (r.name !== e) {
          this.logger.trace("PerformanceClient.getPreQueueTime: no pre-queue time found for " + e + ", unable to add queue measurement");
          return;
        }
      } else {
        this.logger.trace("PerformanceClient.getPreQueueTime: no pre-queue times found for correlationId: " + n + ", unable to add queue measurement");
        return;
      }
      return r.time;
    }, t.prototype.calculateQueuedTime = function(e, n) {
      return e < 1 ? (this.logger.trace("PerformanceClient: preQueueTime should be a positive integer and not " + e), 0) : n < 1 ? (this.logger.trace("PerformanceClient: currentTime should be a positive integer and not " + n), 0) : n < e ? (this.logger.trace("PerformanceClient: currentTime is less than preQueueTime, check how time is being retrieved"), 0) : n - e;
    }, t.prototype.addQueueMeasurement = function(e, n, r, i) {
      if (!n) {
        this.logger.trace("PerformanceClient.addQueueMeasurement: correlationId not provided for " + e + ", cannot add queue measurement");
        return;
      }
      if (r === 0)
        this.logger.trace("PerformanceClient.addQueueMeasurement: queue time provided for " + e + " is " + r);
      else if (!r) {
        this.logger.trace("PerformanceClient.addQueueMeasurement: no queue time provided for " + e);
        return;
      }
      var o = { eventName: e, queueTime: r, manuallyCompleted: i }, a = this.queueMeasurements.get(n);
      if (a)
        a.push(o), this.queueMeasurements.set(n, a);
      else {
        this.logger.trace("PerformanceClient.addQueueMeasurement: adding correlationId " + n + " to queue measurements");
        var s = [o];
        this.queueMeasurements.set(n, s);
      }
      this.preQueueTimeByCorrelationId.delete(n);
    }, t.prototype.startMeasurement = function(e, n) {
      var r = this, i, o, a = n || this.generateId();
      n || this.logger.info("PerformanceClient: No correlation id provided for " + e + ", generating", a), this.logger.trace("PerformanceClient: Performance measurement started for " + e, a);
      var s = this.startPerformanceMeasuremeant(e, a);
      s.startMeasurement();
      var c = {
        eventId: this.generateId(),
        status: lc.InProgress,
        authority: this.authority,
        libraryName: this.libraryName,
        libraryVersion: this.libraryVersion,
        clientId: this.clientId,
        name: e,
        startTimeMs: Date.now(),
        correlationId: a,
        appName: (i = this.applicationTelemetry) === null || i === void 0 ? void 0 : i.appName,
        appVersion: (o = this.applicationTelemetry) === null || o === void 0 ? void 0 : o.appVersion
      };
      return this.cacheEventByCorrelationId(c), {
        endMeasurement: function(l) {
          return r.endMeasurement(ce(ce({}, c), l), s);
        },
        discardMeasurement: function() {
          return r.discardMeasurements(c.correlationId);
        },
        addStaticFields: function(l) {
          return r.addStaticFields(l, c.correlationId);
        },
        increment: function(l) {
          return r.increment(l, c.correlationId);
        },
        measurement: s,
        event: c
      };
    }, t.prototype.endMeasurement = function(e, n) {
      var r = this, i, o, a = this.eventsByCorrelationId.get(e.correlationId);
      if (!a)
        return this.logger.trace("PerformanceClient: Measurement not found for " + e.eventId, e.correlationId), null;
      var s = e.eventId === a.eventId, c = {
        totalQueueTime: 0,
        totalQueueCount: 0,
        manuallyCompletedCount: 0
      };
      s ? (c = this.getQueueInfo(e.correlationId), this.discardCache(a.correlationId)) : (i = a.incompleteSubMeasurements) === null || i === void 0 || i.delete(e.eventId), n == null || n.endMeasurement();
      var l = n == null ? void 0 : n.flushMeasurement();
      if (!l)
        return this.logger.trace("PerformanceClient: Performance measurement not taken", a.correlationId), null;
      if (this.logger.trace("PerformanceClient: Performance measurement ended for " + e.name + ": " + l + " ms", e.correlationId), !s)
        return a[e.name + "DurationMs"] = Math.floor(l), ce({}, a);
      var u = ce(ce({}, a), e), d = 0;
      return (o = u.incompleteSubMeasurements) === null || o === void 0 || o.forEach(function(h) {
        r.logger.trace("PerformanceClient: Incomplete submeasurement " + h.name + " found for " + e.name, u.correlationId), d++;
      }), u.incompleteSubMeasurements = void 0, u = ce(ce({}, u), { durationMs: Math.round(l), queuedTimeMs: c.totalQueueTime, queuedCount: c.totalQueueCount, queuedManuallyCompletedCount: c.manuallyCompletedCount, status: lc.Completed, incompleteSubsCount: d }), this.truncateIntegralFields(u, this.getIntFields()), this.emitEvents([u], e.correlationId), u;
    }, t.prototype.addStaticFields = function(e, n) {
      this.logger.trace("PerformanceClient: Updating static fields");
      var r = this.eventsByCorrelationId.get(n);
      r ? this.eventsByCorrelationId.set(n, ce(ce({}, r), e)) : this.logger.trace("PerformanceClient: Event not found for", n);
    }, t.prototype.increment = function(e, n) {
      this.logger.trace("PerformanceClient: Updating counters");
      var r = this.eventsByCorrelationId.get(n);
      if (r)
        for (var i in e)
          r.hasOwnProperty(i) || (r[i] = 0), r[i] += e[i];
      else
        this.logger.trace("PerformanceClient: Event not found for", n);
    }, t.prototype.cacheEventByCorrelationId = function(e) {
      var n = this.eventsByCorrelationId.get(e.correlationId);
      n ? (this.logger.trace("PerformanceClient: Performance measurement for " + e.name + " added/updated", e.correlationId), n.incompleteSubMeasurements = n.incompleteSubMeasurements || /* @__PURE__ */ new Map(), n.incompleteSubMeasurements.set(e.eventId, { name: e.name, startTimeMs: e.startTimeMs })) : (this.logger.trace("PerformanceClient: Performance measurement for " + e.name + " started", e.correlationId), this.eventsByCorrelationId.set(e.correlationId, ce({}, e)));
    }, t.prototype.getQueueInfo = function(e) {
      var n = this.queueMeasurements.get(e);
      n || this.logger.trace("PerformanceClient: no queue measurements found for for correlationId: " + e);
      var r = 0, i = 0, o = 0;
      return n == null || n.forEach(function(a) {
        r += a.queueTime, i++, o += a.manuallyCompleted ? 1 : 0;
      }), {
        totalQueueTime: r,
        totalQueueCount: i,
        manuallyCompletedCount: o
      };
    }, t.prototype.discardMeasurements = function(e) {
      this.logger.trace("PerformanceClient: Performance measurements discarded", e), this.eventsByCorrelationId.delete(e);
    }, t.prototype.discardCache = function(e) {
      this.discardMeasurements(e), this.logger.trace("PerformanceClient: QueueMeasurements discarded", e), this.queueMeasurements.delete(e), this.logger.trace("PerformanceClient: Pre-queue times discarded", e), this.preQueueTimeByCorrelationId.delete(e);
    }, t.prototype.addPerformanceCallback = function(e) {
      var n = this.generateId();
      return this.callbacks.set(n, e), this.logger.verbose("PerformanceClient: Performance callback registered with id: " + n), n;
    }, t.prototype.removePerformanceCallback = function(e) {
      var n = this.callbacks.delete(e);
      return n ? this.logger.verbose("PerformanceClient: Performance callback " + e + " removed.") : this.logger.verbose("PerformanceClient: Performance callback " + e + " not removed."), n;
    }, t.prototype.emitEvents = function(e, n) {
      var r = this;
      this.logger.verbose("PerformanceClient: Emitting performance events", n), this.callbacks.forEach(function(i, o) {
        r.logger.trace("PerformanceClient: Emitting event to callback " + o, n), i.apply(null, [e]);
      });
    }, t.prototype.truncateIntegralFields = function(e, n) {
      n.forEach(function(r) {
        r in e && typeof e[r] == "number" && (e[r] = Math.floor(e[r]));
      });
    }, t;
  }()
);
/*! @azure/msal-common v13.3.1 2023-10-27 */
var pp = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.startMeasurement = function() {
    }, t.prototype.endMeasurement = function() {
    }, t.prototype.flushMeasurement = function() {
      return null;
    }, t;
  }()
), tA = (
  /** @class */
  function(t) {
    wt(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.generateId = function() {
      return "callback-id";
    }, e.prototype.startPerformanceMeasuremeant = function() {
      return new pp();
    }, e.prototype.startPerformanceMeasurement = function() {
      return new pp();
    }, e.prototype.calculateQueuedTime = function(n, r) {
      return 0;
    }, e.prototype.addQueueMeasurement = function(n, r, i) {
    }, e.prototype.setPreQueueTime = function(n, r) {
    }, e;
  }(ry)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var b = {
  pkceNotGenerated: {
    code: "pkce_not_created",
    desc: "The PKCE code challenge and verifier could not be generated."
  },
  cryptoDoesNotExist: {
    code: "crypto_nonexistent",
    desc: "The crypto object or function is not available."
  },
  httpMethodNotImplementedError: {
    code: "http_method_not_implemented",
    desc: "The HTTP method given has not been implemented in this library."
  },
  emptyNavigateUriError: {
    code: "empty_navigate_uri",
    desc: "Navigation URI is empty. Please check stack trace for more info."
  },
  hashEmptyError: {
    code: "hash_empty_error",
    desc: "Hash value cannot be processed because it is empty. Please verify that your redirectUri is not clearing the hash. For more visit: aka.ms/msaljs/browser-errors."
  },
  hashDoesNotContainStateError: {
    code: "no_state_in_hash",
    desc: "Hash does not contain state. Please verify that the request originated from msal."
  },
  hashDoesNotContainKnownPropertiesError: {
    code: "hash_does_not_contain_known_properties",
    desc: "Hash does not contain known properites. Please verify that your redirectUri is not changing the hash. For more visit: aka.ms/msaljs/browser-errors."
  },
  unableToParseStateError: {
    code: "unable_to_parse_state",
    desc: "Unable to parse state. Please verify that the request originated from msal."
  },
  stateInteractionTypeMismatchError: {
    code: "state_interaction_type_mismatch",
    desc: "Hash contains state but the interaction type does not match the caller."
  },
  interactionInProgress: {
    code: "interaction_in_progress",
    desc: "Interaction is currently in progress. Please ensure that this interaction has been completed before calling an interactive API.  For more visit: aka.ms/msaljs/browser-errors."
  },
  popupWindowError: {
    code: "popup_window_error",
    desc: "Error opening popup window. This can happen if you are using IE or if popups are blocked in the browser."
  },
  emptyWindowError: {
    code: "empty_window_error",
    desc: "window.open returned null or undefined window object."
  },
  userCancelledError: {
    code: "user_cancelled",
    desc: "User cancelled the flow."
  },
  monitorPopupTimeoutError: {
    code: "monitor_window_timeout",
    desc: "Token acquisition in popup failed due to timeout. For more visit: aka.ms/msaljs/browser-errors."
  },
  monitorIframeTimeoutError: {
    code: "monitor_window_timeout",
    desc: "Token acquisition in iframe failed due to timeout. For more visit: aka.ms/msaljs/browser-errors."
  },
  redirectInIframeError: {
    code: "redirect_in_iframe",
    desc: "Redirects are not supported for iframed or brokered applications. Please ensure you are using MSAL.js in a top frame of the window if using the redirect APIs, or use the popup APIs."
  },
  blockTokenRequestsInHiddenIframeError: {
    code: "block_iframe_reload",
    desc: "Request was blocked inside an iframe because MSAL detected an authentication response. For more visit: aka.ms/msaljs/browser-errors"
  },
  blockAcquireTokenInPopupsError: {
    code: "block_nested_popups",
    desc: "Request was blocked inside a popup because MSAL detected it was running in a popup."
  },
  iframeClosedPrematurelyError: {
    code: "iframe_closed_prematurely",
    desc: "The iframe being monitored was closed prematurely."
  },
  silentLogoutUnsupportedError: {
    code: "silent_logout_unsupported",
    desc: "Silent logout not supported. Please call logoutRedirect or logoutPopup instead."
  },
  noAccountError: {
    code: "no_account_error",
    desc: "No account object provided to acquireTokenSilent and no active account has been set. Please call setActiveAccount or provide an account on the request."
  },
  silentPromptValueError: {
    code: "silent_prompt_value_error",
    desc: "The value given for the prompt value is not valid for silent requests - must be set to 'none' or 'no_session'."
  },
  noTokenRequestCacheError: {
    code: "no_token_request_cache_error",
    desc: "No token request found in cache."
  },
  unableToParseTokenRequestCacheError: {
    code: "unable_to_parse_token_request_cache_error",
    desc: "The cached token request could not be parsed."
  },
  noCachedAuthorityError: {
    code: "no_cached_authority_error",
    desc: "No cached authority found."
  },
  authRequestNotSet: {
    code: "auth_request_not_set_error",
    desc: "Auth Request not set. Please ensure initiateAuthRequest was called from the InteractionHandler"
  },
  invalidCacheType: {
    code: "invalid_cache_type",
    desc: "Invalid cache type"
  },
  notInBrowserEnvironment: {
    code: "non_browser_environment",
    desc: "Login and token requests are not supported in non-browser environments."
  },
  databaseNotOpen: {
    code: "database_not_open",
    desc: "Database is not open!"
  },
  noNetworkConnectivity: {
    code: "no_network_connectivity",
    desc: "No network connectivity. Check your internet connection."
  },
  postRequestFailed: {
    code: "post_request_failed",
    desc: "Network request failed: If the browser threw a CORS error, check that the redirectUri is registered in the Azure App Portal as type 'SPA'"
  },
  getRequestFailed: {
    code: "get_request_failed",
    desc: "Network request failed. Please check the network trace to determine root cause."
  },
  failedToParseNetworkResponse: {
    code: "failed_to_parse_response",
    desc: "Failed to parse network response. Check network trace."
  },
  unableToLoadTokenError: {
    code: "unable_to_load_token",
    desc: "Error loading token to cache."
  },
  signingKeyNotFoundInStorage: {
    code: "crypto_key_not_found",
    desc: "Cryptographic Key or Keypair not found in browser storage."
  },
  authCodeRequired: {
    code: "auth_code_required",
    desc: "An authorization code must be provided (as the `code` property on the request) to this flow."
  },
  authCodeOrNativeAccountRequired: {
    code: "auth_code_or_nativeAccountId_required",
    desc: "An authorization code or nativeAccountId must be provided to this flow."
  },
  spaCodeAndNativeAccountPresent: {
    code: "spa_code_and_nativeAccountId_present",
    desc: "Request cannot contain both spa code and native account id."
  },
  databaseUnavailable: {
    code: "database_unavailable",
    desc: "IndexedDB, which is required for persistent cryptographic key storage, is unavailable. This may be caused by browser privacy features which block persistent storage in third-party contexts."
  },
  unableToAcquireTokenFromNativePlatform: {
    code: "unable_to_acquire_token_from_native_platform",
    desc: "Unable to acquire token from native platform. For a list of possible reasons visit aka.ms/msaljs/browser-errors."
  },
  nativeHandshakeTimeout: {
    code: "native_handshake_timeout",
    desc: "Timed out while attempting to establish connection to browser extension"
  },
  nativeExtensionNotInstalled: {
    code: "native_extension_not_installed",
    desc: "Native extension is not installed. If you think this is a mistake call the initialize function."
  },
  nativeConnectionNotEstablished: {
    code: "native_connection_not_established",
    desc: "Connection to native platform has not been established. Please install a compatible browser extension and run initialize(). For more please visit aka.ms/msaljs/browser-errors."
  },
  nativeBrokerCalledBeforeInitialize: {
    code: "native_broker_called_before_initialize",
    desc: "You must call and await the initialize function before attempting to call any other MSAL API when native brokering is enabled. For more please visit aka.ms/msaljs/browser-errors."
  },
  nativePromptNotSupported: {
    code: "native_prompt_not_supported",
    desc: "The provided prompt is not supported by the native platform. This request should be routed to the web based flow."
  }
}, M = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r) {
      var i = t.call(this, n, r) || this;
      return Object.setPrototypeOf(i, e.prototype), i.name = "BrowserAuthError", i;
    }
    return e.createPkceNotGeneratedError = function(n) {
      return new e(b.pkceNotGenerated.code, b.pkceNotGenerated.desc + " Detail:" + n);
    }, e.createCryptoNotAvailableError = function(n) {
      return new e(b.cryptoDoesNotExist.code, b.cryptoDoesNotExist.desc + " Detail:" + n);
    }, e.createHttpMethodNotImplementedError = function(n) {
      return new e(b.httpMethodNotImplementedError.code, b.httpMethodNotImplementedError.desc + " Given Method: " + n);
    }, e.createEmptyNavigationUriError = function() {
      return new e(b.emptyNavigateUriError.code, b.emptyNavigateUriError.desc);
    }, e.createEmptyHashError = function(n) {
      return new e(b.hashEmptyError.code, b.hashEmptyError.desc + " Given Url: " + n);
    }, e.createHashDoesNotContainStateError = function() {
      return new e(b.hashDoesNotContainStateError.code, b.hashDoesNotContainStateError.desc);
    }, e.createHashDoesNotContainKnownPropertiesError = function() {
      return new e(b.hashDoesNotContainKnownPropertiesError.code, b.hashDoesNotContainKnownPropertiesError.desc);
    }, e.createUnableToParseStateError = function() {
      return new e(b.unableToParseStateError.code, b.unableToParseStateError.desc);
    }, e.createStateInteractionTypeMismatchError = function() {
      return new e(b.stateInteractionTypeMismatchError.code, b.stateInteractionTypeMismatchError.desc);
    }, e.createInteractionInProgressError = function() {
      return new e(b.interactionInProgress.code, b.interactionInProgress.desc);
    }, e.createPopupWindowError = function(n) {
      var r = b.popupWindowError.desc;
      return r = P.isEmpty(n) ? r : r + " Details: " + n, new e(b.popupWindowError.code, r);
    }, e.createEmptyWindowCreatedError = function() {
      return new e(b.emptyWindowError.code, b.emptyWindowError.desc);
    }, e.createUserCancelledError = function() {
      return new e(b.userCancelledError.code, b.userCancelledError.desc);
    }, e.createMonitorPopupTimeoutError = function() {
      return new e(b.monitorPopupTimeoutError.code, b.monitorPopupTimeoutError.desc);
    }, e.createMonitorIframeTimeoutError = function() {
      return new e(b.monitorIframeTimeoutError.code, b.monitorIframeTimeoutError.desc);
    }, e.createRedirectInIframeError = function(n) {
      return new e(b.redirectInIframeError.code, b.redirectInIframeError.desc + " (window.parent !== window) => " + n);
    }, e.createBlockReloadInHiddenIframeError = function() {
      return new e(b.blockTokenRequestsInHiddenIframeError.code, b.blockTokenRequestsInHiddenIframeError.desc);
    }, e.createBlockAcquireTokenInPopupsError = function() {
      return new e(b.blockAcquireTokenInPopupsError.code, b.blockAcquireTokenInPopupsError.desc);
    }, e.createIframeClosedPrematurelyError = function() {
      return new e(b.iframeClosedPrematurelyError.code, b.iframeClosedPrematurelyError.desc);
    }, e.createSilentLogoutUnsupportedError = function() {
      return new e(b.silentLogoutUnsupportedError.code, b.silentLogoutUnsupportedError.desc);
    }, e.createNoAccountError = function() {
      return new e(b.noAccountError.code, b.noAccountError.desc);
    }, e.createSilentPromptValueError = function(n) {
      return new e(b.silentPromptValueError.code, b.silentPromptValueError.desc + " Given value: " + n);
    }, e.createUnableToParseTokenRequestCacheError = function() {
      return new e(b.unableToParseTokenRequestCacheError.code, b.unableToParseTokenRequestCacheError.desc);
    }, e.createNoTokenRequestCacheError = function() {
      return new e(b.noTokenRequestCacheError.code, b.noTokenRequestCacheError.desc);
    }, e.createAuthRequestNotSetError = function() {
      return new e(b.authRequestNotSet.code, b.authRequestNotSet.desc);
    }, e.createNoCachedAuthorityError = function() {
      return new e(b.noCachedAuthorityError.code, b.noCachedAuthorityError.desc);
    }, e.createInvalidCacheTypeError = function() {
      return new e(b.invalidCacheType.code, "" + b.invalidCacheType.desc);
    }, e.createNonBrowserEnvironmentError = function() {
      return new e(b.notInBrowserEnvironment.code, b.notInBrowserEnvironment.desc);
    }, e.createDatabaseNotOpenError = function() {
      return new e(b.databaseNotOpen.code, b.databaseNotOpen.desc);
    }, e.createNoNetworkConnectivityError = function() {
      return new e(b.noNetworkConnectivity.code, b.noNetworkConnectivity.desc);
    }, e.createPostRequestFailedError = function(n, r) {
      return new e(b.postRequestFailed.code, b.postRequestFailed.desc + " | Network client threw: " + n + " | Attempted to reach: " + r.split("?")[0]);
    }, e.createGetRequestFailedError = function(n, r) {
      return new e(b.getRequestFailed.code, b.getRequestFailed.desc + " | Network client threw: " + n + " | Attempted to reach: " + r.split("?")[0]);
    }, e.createFailedToParseNetworkResponseError = function(n) {
      return new e(b.failedToParseNetworkResponse.code, b.failedToParseNetworkResponse.desc + " | Attempted to reach: " + n.split("?")[0]);
    }, e.createUnableToLoadTokenError = function(n) {
      return new e(b.unableToLoadTokenError.code, b.unableToLoadTokenError.desc + " | " + n);
    }, e.createSigningKeyNotFoundInStorageError = function(n) {
      return new e(b.signingKeyNotFoundInStorage.code, b.signingKeyNotFoundInStorage.desc + " | No match found for KeyId: " + n);
    }, e.createAuthCodeRequiredError = function() {
      return new e(b.authCodeRequired.code, b.authCodeRequired.desc);
    }, e.createAuthCodeOrNativeAccountIdRequiredError = function() {
      return new e(b.authCodeOrNativeAccountRequired.code, b.authCodeOrNativeAccountRequired.desc);
    }, e.createSpaCodeAndNativeAccountIdPresentError = function() {
      return new e(b.spaCodeAndNativeAccountPresent.code, b.spaCodeAndNativeAccountPresent.desc);
    }, e.createDatabaseUnavailableError = function() {
      return new e(b.databaseUnavailable.code, b.databaseUnavailable.desc);
    }, e.createUnableToAcquireTokenFromNativePlatformError = function() {
      return new e(b.unableToAcquireTokenFromNativePlatform.code, b.unableToAcquireTokenFromNativePlatform.desc);
    }, e.createNativeHandshakeTimeoutError = function() {
      return new e(b.nativeHandshakeTimeout.code, b.nativeHandshakeTimeout.desc);
    }, e.createNativeExtensionNotInstalledError = function() {
      return new e(b.nativeExtensionNotInstalled.code, b.nativeExtensionNotInstalled.desc);
    }, e.createNativeConnectionNotEstablishedError = function() {
      return new e(b.nativeConnectionNotEstablished.code, b.nativeConnectionNotEstablished.desc);
    }, e.createNativeBrokerCalledBeforeInitialize = function() {
      return new e(b.nativeBrokerCalledBeforeInitialize.code, b.nativeBrokerCalledBeforeInitialize.desc);
    }, e.createNativePromptParameterNotSupportedError = function() {
      return new e(b.nativePromptNotSupported.code, b.nativePromptNotSupported.desc);
    }, e;
  }(K)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Vt = {
  /**
   * Interaction in progress cache value
   */
  INTERACTION_IN_PROGRESS_VALUE: "interaction_in_progress",
  /**
   * Invalid grant error code
   */
  INVALID_GRANT_ERROR: "invalid_grant",
  /**
   * Default popup window width
   */
  POPUP_WIDTH: 483,
  /**
   * Default popup window height
   */
  POPUP_HEIGHT: 600,
  /**
   * Name of the popup window starts with
   */
  POPUP_NAME_PREFIX: "msal",
  /**
   * Default popup monitor poll interval in milliseconds
   */
  DEFAULT_POLL_INTERVAL_MS: 30,
  /**
   * Msal-browser SKU
   */
  MSAL_SKU: "msal.js.browser"
}, Ao = {
  CHANNEL_ID: "53ee284d-920a-4b59-9d30-a60315b26836",
  PREFERRED_EXTENSION_ID: "ppnbnpeolgkicgegkbkbjmhlideopiji",
  MATS_TELEMETRY: "MATS"
}, kn;
(function(t) {
  t.HandshakeRequest = "Handshake", t.HandshakeResponse = "HandshakeResponse", t.GetToken = "GetToken", t.Response = "Response";
})(kn || (kn = {}));
var Pe;
(function(t) {
  t.LocalStorage = "localStorage", t.SessionStorage = "sessionStorage", t.MemoryStorage = "memoryStorage";
})(Pe || (Pe = {}));
var sn;
(function(t) {
  t.GET = "GET", t.POST = "POST";
})(sn || (sn = {}));
var oe;
(function(t) {
  t.AUTHORITY = "authority", t.ACQUIRE_TOKEN_ACCOUNT = "acquireToken.account", t.SESSION_STATE = "session.state", t.REQUEST_STATE = "request.state", t.NONCE_IDTOKEN = "nonce.id_token", t.ORIGIN_URI = "request.origin", t.RENEW_STATUS = "token.renew.status", t.URL_HASH = "urlHash", t.REQUEST_PARAMS = "request.params", t.SCOPES = "scopes", t.INTERACTION_STATUS_KEY = "interaction.status", t.CCS_CREDENTIAL = "ccs.credential", t.CORRELATION_ID = "request.correlationId", t.NATIVE_REQUEST = "request.native", t.REDIRECT_CONTEXT = "request.redirect.context";
})(oe || (oe = {}));
var an;
(function(t) {
  t.ACCOUNT_KEYS = "msal.account.keys", t.TOKEN_KEYS = "msal.token.keys";
})(an || (an = {}));
var yi;
(function(t) {
  t.WRAPPER_SKU = "wrapper.sku", t.WRAPPER_VER = "wrapper.version";
})(yi || (yi = {}));
var ye;
(function(t) {
  t[t.acquireTokenRedirect = 861] = "acquireTokenRedirect", t[t.acquireTokenPopup = 862] = "acquireTokenPopup", t[t.ssoSilent = 863] = "ssoSilent", t[t.acquireTokenSilent_authCode = 864] = "acquireTokenSilent_authCode", t[t.handleRedirectPromise = 865] = "handleRedirectPromise", t[t.acquireTokenByCode = 866] = "acquireTokenByCode", t[t.acquireTokenSilent_silentFlow = 61] = "acquireTokenSilent_silentFlow", t[t.logout = 961] = "logout", t[t.logoutPopup = 962] = "logoutPopup";
})(ye || (ye = {}));
var x;
(function(t) {
  t.Redirect = "redirect", t.Popup = "popup", t.Silent = "silent", t.None = "none";
})(x || (x = {}));
var gp;
(function(t) {
  t.Startup = "startup", t.Login = "login", t.Logout = "logout", t.AcquireToken = "acquireToken", t.SsoSilent = "ssoSilent", t.HandleRedirect = "handleRedirect", t.None = "none";
})(gp || (gp = {}));
var mp = {
  scopes: Aa
}, Ki = "jwk", vp;
(function(t) {
  t.React = "@azure/msal-react", t.Angular = "@azure/msal-angular";
})(vp || (vp = {}));
var Gu = "msal.db", nA = 1, rA = Gu + ".keys", Ct;
(function(t) {
  t[t.Default = 0] = "Default", t[t.AccessToken = 1] = "AccessToken", t[t.AccessTokenAndRefreshToken = 2] = "AccessTokenAndRefreshToken", t[t.RefreshToken = 3] = "RefreshToken", t[t.RefreshTokenAndNetwork = 4] = "RefreshTokenAndNetwork", t[t.Skip = 5] = "Skip";
})(Ct || (Ct = {}));
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var yt = {
  redirectUriNotSet: {
    code: "redirect_uri_empty",
    desc: "A redirect URI is required for all calls, and none has been set."
  },
  postLogoutUriNotSet: {
    code: "post_logout_uri_empty",
    desc: "A post logout redirect has not been set."
  },
  storageNotSupportedError: {
    code: "storage_not_supported",
    desc: "Given storage configuration option was not supported."
  },
  noRedirectCallbacksSet: {
    code: "no_redirect_callbacks",
    desc: "No redirect callbacks have been set. Please call setRedirectCallbacks() with the appropriate function arguments before continuing. More information is available here: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics."
  },
  invalidCallbackObject: {
    code: "invalid_callback_object",
    desc: "The object passed for the callback was invalid. More information is available here: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics."
  },
  stubPcaInstanceCalled: {
    code: "stubbed_public_client_application_called",
    desc: "Stub instance of Public Client Application was called. If using msal-react, please ensure context is not used without a provider. For more visit: aka.ms/msaljs/browser-errors"
  },
  inMemRedirectUnavailable: {
    code: "in_mem_redirect_unavailable",
    desc: "Redirect cannot be supported. In-memory storage was selected and storeAuthStateInCookie=false, which would cause the library to be unable to handle the incoming hash. If you would like to use the redirect API, please use session/localStorage or set storeAuthStateInCookie=true."
  },
  entropyNotProvided: {
    code: "entropy_not_provided",
    desc: "The available browser crypto interface requires entropy set via system.cryptoOptions.entropy configuration option."
  }
}, fc = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r) {
      var i = t.call(this, n, r) || this;
      return i.name = "BrowserConfigurationAuthError", Object.setPrototypeOf(i, e.prototype), i;
    }
    return e.createRedirectUriEmptyError = function() {
      return new e(yt.redirectUriNotSet.code, yt.redirectUriNotSet.desc);
    }, e.createPostLogoutRedirectUriEmptyError = function() {
      return new e(yt.postLogoutUriNotSet.code, yt.postLogoutUriNotSet.desc);
    }, e.createStorageNotSupportedError = function(n) {
      return new e(yt.storageNotSupportedError.code, yt.storageNotSupportedError.desc + " Given Location: " + n);
    }, e.createRedirectCallbacksNotSetError = function() {
      return new e(yt.noRedirectCallbacksSet.code, yt.noRedirectCallbacksSet.desc);
    }, e.createStubPcaInstanceCalledError = function() {
      return new e(yt.stubPcaInstanceCalled.code, yt.stubPcaInstanceCalled.desc);
    }, e.createInMemoryRedirectUnavailableError = function() {
      return new e(yt.inMemRedirectUnavailable.code, yt.inMemRedirectUnavailable.desc);
    }, e.createEntropyNotProvided = function() {
      return new e(yt.entropyNotProvided.code, yt.entropyNotProvided.desc);
    }, e;
  }(K)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var yp = (
  /** @class */
  function() {
    function t(e) {
      this.validateWindowStorage(e), this.windowStorage = window[e];
    }
    return t.prototype.validateWindowStorage = function(e) {
      if (e !== Pe.LocalStorage && e !== Pe.SessionStorage)
        throw fc.createStorageNotSupportedError(e);
      var n = !!window[e];
      if (!n)
        throw fc.createStorageNotSupportedError(e);
    }, t.prototype.getItem = function(e) {
      return this.windowStorage.getItem(e);
    }, t.prototype.setItem = function(e, n) {
      this.windowStorage.setItem(e, n);
    }, t.prototype.removeItem = function(e) {
      this.windowStorage.removeItem(e);
    }, t.prototype.getKeys = function() {
      return Object.keys(this.windowStorage);
    }, t.prototype.containsKey = function(e) {
      return this.windowStorage.hasOwnProperty(e);
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Ku = (
  /** @class */
  function() {
    function t() {
      this.cache = /* @__PURE__ */ new Map();
    }
    return t.prototype.getItem = function(e) {
      return this.cache.get(e) || null;
    }, t.prototype.setItem = function(e, n) {
      this.cache.set(e, n);
    }, t.prototype.removeItem = function(e) {
      this.cache.delete(e);
    }, t.prototype.getKeys = function() {
      var e = [];
      return this.cache.forEach(function(n, r) {
        e.push(r);
      }), e;
    }, t.prototype.containsKey = function(e) {
      return this.cache.has(e);
    }, t.prototype.clear = function() {
      this.cache.clear();
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var iy = (
  /** @class */
  function() {
    function t() {
    }
    return t.extractBrowserRequestState = function(e, n) {
      if (P.isEmpty(n))
        return null;
      try {
        var r = Hn.parseRequestState(e, n);
        return r.libraryState.meta;
      } catch (i) {
        throw L.createInvalidStateError(n, i);
      }
    }, t.parseServerResponseFromHash = function(e) {
      if (!e)
        return {};
      var n = new ie(e);
      return ie.getDeserializedHash(n.getHash());
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Fu = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o) {
      var a = t.call(this, n, i, o) || this;
      return a.COOKIE_LIFE_MULTIPLIER = 24 * 60 * 60 * 1e3, a.cacheConfig = r, a.logger = o, a.internalStorage = new Ku(), a.browserStorage = a.setupBrowserStorage(a.cacheConfig.cacheLocation), a.temporaryCacheStorage = a.setupTemporaryCacheStorage(a.cacheConfig.temporaryCacheLocation, a.cacheConfig.cacheLocation), r.cacheMigrationEnabled && (a.migrateCacheEntries(), a.createKeyMaps()), a;
    }
    return e.prototype.setupBrowserStorage = function(n) {
      switch (n) {
        case Pe.LocalStorage:
        case Pe.SessionStorage:
          try {
            return new yp(n);
          } catch (r) {
            this.logger.verbose(r);
            break;
          }
      }
      return this.cacheConfig.cacheLocation = Pe.MemoryStorage, new Ku();
    }, e.prototype.setupTemporaryCacheStorage = function(n, r) {
      switch (r) {
        case Pe.LocalStorage:
        case Pe.SessionStorage:
          try {
            return new yp(n || Pe.SessionStorage);
          } catch (i) {
            return this.logger.verbose(i), this.internalStorage;
          }
        case Pe.MemoryStorage:
        default:
          return this.internalStorage;
      }
    }, e.prototype.migrateCacheEntries = function() {
      var n = this, r = y.CACHE_PREFIX + "." + Le.ID_TOKEN, i = y.CACHE_PREFIX + "." + Le.CLIENT_INFO, o = y.CACHE_PREFIX + "." + Le.ERROR, a = y.CACHE_PREFIX + "." + Le.ERROR_DESC, s = this.browserStorage.getItem(r), c = this.browserStorage.getItem(i), l = this.browserStorage.getItem(o), u = this.browserStorage.getItem(a), d = [s, c, l, u], h = [Le.ID_TOKEN, Le.CLIENT_INFO, Le.ERROR, Le.ERROR_DESC];
      h.forEach(function(f, m) {
        return n.migrateCacheEntry(f, d[m]);
      });
    }, e.prototype.migrateCacheEntry = function(n, r) {
      r && this.setTemporaryCache(n, r, !0);
    }, e.prototype.createKeyMaps = function() {
      var n = this;
      this.logger.trace("BrowserCacheManager - createKeyMaps called.");
      var r = this.getItem(an.ACCOUNT_KEYS), i = this.getItem(an.TOKEN_KEYS + "." + this.clientId);
      if (r && i) {
        this.logger.verbose("BrowserCacheManager:createKeyMaps - account and token key maps already exist, skipping migration.");
        return;
      }
      var o = this.browserStorage.getKeys();
      o.forEach(function(a) {
        if (n.isCredentialKey(a)) {
          var s = n.getItem(a);
          if (s) {
            var c = n.validateAndParseJson(s);
            if (c && c.hasOwnProperty("credentialType"))
              switch (c.credentialType) {
                case F.ID_TOKEN:
                  if (br.isIdTokenEntity(c)) {
                    n.logger.trace("BrowserCacheManager:createKeyMaps - idToken found, saving key to token key map"), n.logger.tracePii("BrowserCacheManager:createKeyMaps - idToken with key: " + a + " found, saving key to token key map");
                    var l = Et.toObject(new br(), c), u = n.updateCredentialCacheKey(a, l);
                    n.addTokenKey(u, F.ID_TOKEN);
                    return;
                  } else
                    n.logger.trace("BrowserCacheManager:createKeyMaps - key found matching idToken schema with value containing idToken credentialType field but value failed IdTokenEntity validation, skipping."), n.logger.tracePii("BrowserCacheManager:createKeyMaps - failed idToken validation on key: " + a);
                  break;
                case F.ACCESS_TOKEN:
                case F.ACCESS_TOKEN_WITH_AUTH_SCHEME:
                  if (Rr.isAccessTokenEntity(c)) {
                    n.logger.trace("BrowserCacheManager:createKeyMaps - accessToken found, saving key to token key map"), n.logger.tracePii("BrowserCacheManager:createKeyMaps - accessToken with key: " + a + " found, saving key to token key map");
                    var d = Et.toObject(new Rr(), c), u = n.updateCredentialCacheKey(a, d);
                    n.addTokenKey(u, F.ACCESS_TOKEN);
                    return;
                  } else
                    n.logger.trace("BrowserCacheManager:createKeyMaps - key found matching accessToken schema with value containing accessToken credentialType field but value failed AccessTokenEntity validation, skipping."), n.logger.tracePii("BrowserCacheManager:createKeyMaps - failed accessToken validation on key: " + a);
                  break;
                case F.REFRESH_TOKEN:
                  if (mi.isRefreshTokenEntity(c)) {
                    n.logger.trace("BrowserCacheManager:createKeyMaps - refreshToken found, saving key to token key map"), n.logger.tracePii("BrowserCacheManager:createKeyMaps - refreshToken with key: " + a + " found, saving key to token key map");
                    var h = Et.toObject(new mi(), c), u = n.updateCredentialCacheKey(a, h);
                    n.addTokenKey(u, F.REFRESH_TOKEN);
                    return;
                  } else
                    n.logger.trace("BrowserCacheManager:createKeyMaps - key found matching refreshToken schema with value containing refreshToken credentialType field but value failed RefreshTokenEntity validation, skipping."), n.logger.tracePii("BrowserCacheManager:createKeyMaps - failed refreshToken validation on key: " + a);
                  break;
              }
          }
        }
        if (n.isAccountKey(a)) {
          var s = n.getItem(a);
          if (s) {
            var f = n.validateAndParseJson(s);
            f && We.isAccountEntity(f) && (n.logger.trace("BrowserCacheManager:createKeyMaps - account found, saving key to account key map"), n.logger.tracePii("BrowserCacheManager:createKeyMaps - account with key: " + a + " found, saving key to account key map"), n.addAccountKeyToMap(a));
          }
        }
      });
    }, e.prototype.validateAndParseJson = function(n) {
      try {
        var r = JSON.parse(n);
        return r && typeof r == "object" ? r : null;
      } catch {
        return null;
      }
    }, e.prototype.getItem = function(n) {
      return this.browserStorage.getItem(n);
    }, e.prototype.setItem = function(n, r) {
      this.browserStorage.setItem(n, r);
    }, e.prototype.getAccount = function(n) {
      this.logger.trace("BrowserCacheManager.getAccount called");
      var r = this.getItem(n);
      if (!r)
        return this.removeAccountKeyFromMap(n), null;
      var i = this.validateAndParseJson(r);
      return !i || !We.isAccountEntity(i) ? (this.removeAccountKeyFromMap(n), null) : Et.toObject(new We(), i);
    }, e.prototype.setAccount = function(n) {
      this.logger.trace("BrowserCacheManager.setAccount called");
      var r = n.generateAccountKey();
      this.setItem(r, JSON.stringify(n)), this.addAccountKeyToMap(r);
    }, e.prototype.getAccountKeys = function() {
      this.logger.trace("BrowserCacheManager.getAccountKeys called");
      var n = this.getItem(an.ACCOUNT_KEYS);
      return n ? JSON.parse(n) : (this.logger.verbose("BrowserCacheManager.getAccountKeys - No account keys found"), []);
    }, e.prototype.addAccountKeyToMap = function(n) {
      this.logger.trace("BrowserCacheManager.addAccountKeyToMap called"), this.logger.tracePii("BrowserCacheManager.addAccountKeyToMap called with key: " + n);
      var r = this.getAccountKeys();
      r.indexOf(n) === -1 ? (r.push(n), this.setItem(an.ACCOUNT_KEYS, JSON.stringify(r)), this.logger.verbose("BrowserCacheManager.addAccountKeyToMap account key added")) : this.logger.verbose("BrowserCacheManager.addAccountKeyToMap account key already exists in map");
    }, e.prototype.removeAccountKeyFromMap = function(n) {
      this.logger.trace("BrowserCacheManager.removeAccountKeyFromMap called"), this.logger.tracePii("BrowserCacheManager.removeAccountKeyFromMap called with key: " + n);
      var r = this.getAccountKeys(), i = r.indexOf(n);
      i > -1 ? (r.splice(i, 1), this.setItem(an.ACCOUNT_KEYS, JSON.stringify(r)), this.logger.trace("BrowserCacheManager.removeAccountKeyFromMap account key removed")) : this.logger.trace("BrowserCacheManager.removeAccountKeyFromMap key not found in existing map");
    }, e.prototype.removeAccount = function(n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return t.prototype.removeAccount.call(this, n), this.removeAccountKeyFromMap(n), [
            2
            /*return*/
          ];
        });
      });
    }, e.prototype.removeIdToken = function(n) {
      t.prototype.removeIdToken.call(this, n), this.removeTokenKey(n, F.ID_TOKEN);
    }, e.prototype.removeAccessToken = function(n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return t.prototype.removeAccessToken.call(this, n), this.removeTokenKey(n, F.ACCESS_TOKEN), [
            2
            /*return*/
          ];
        });
      });
    }, e.prototype.removeRefreshToken = function(n) {
      t.prototype.removeRefreshToken.call(this, n), this.removeTokenKey(n, F.REFRESH_TOKEN);
    }, e.prototype.getTokenKeys = function() {
      this.logger.trace("BrowserCacheManager.getTokenKeys called");
      var n = this.getItem(an.TOKEN_KEYS + "." + this.clientId);
      if (n) {
        var r = this.validateAndParseJson(n);
        if (r && r.hasOwnProperty("idToken") && r.hasOwnProperty("accessToken") && r.hasOwnProperty("refreshToken"))
          return r;
        this.logger.error("BrowserCacheManager.getTokenKeys - Token keys found but in an unknown format. Returning empty key map.");
      } else
        this.logger.verbose("BrowserCacheManager.getTokenKeys - No token keys found");
      return {
        idToken: [],
        accessToken: [],
        refreshToken: []
      };
    }, e.prototype.addTokenKey = function(n, r) {
      this.logger.trace("BrowserCacheManager addTokenKey called");
      var i = this.getTokenKeys();
      switch (r) {
        case F.ID_TOKEN:
          i.idToken.indexOf(n) === -1 && (this.logger.info("BrowserCacheManager: addTokenKey - idToken added to map"), i.idToken.push(n));
          break;
        case F.ACCESS_TOKEN:
          i.accessToken.indexOf(n) === -1 && (this.logger.info("BrowserCacheManager: addTokenKey - accessToken added to map"), i.accessToken.push(n));
          break;
        case F.REFRESH_TOKEN:
          i.refreshToken.indexOf(n) === -1 && (this.logger.info("BrowserCacheManager: addTokenKey - refreshToken added to map"), i.refreshToken.push(n));
          break;
        default:
          this.logger.error("BrowserCacheManager:addTokenKey - CredentialType provided invalid. CredentialType: " + r), L.createUnexpectedCredentialTypeError();
      }
      this.setItem(an.TOKEN_KEYS + "." + this.clientId, JSON.stringify(i));
    }, e.prototype.removeTokenKey = function(n, r) {
      this.logger.trace("BrowserCacheManager removeTokenKey called");
      var i = this.getTokenKeys();
      switch (r) {
        case F.ID_TOKEN:
          this.logger.infoPii("BrowserCacheManager: removeTokenKey - attempting to remove idToken with key: " + n + " from map");
          var o = i.idToken.indexOf(n);
          o > -1 ? (this.logger.info("BrowserCacheManager: removeTokenKey - idToken removed from map"), i.idToken.splice(o, 1)) : this.logger.info("BrowserCacheManager: removeTokenKey - idToken does not exist in map. Either it was previously removed or it was never added.");
          break;
        case F.ACCESS_TOKEN:
          this.logger.infoPii("BrowserCacheManager: removeTokenKey - attempting to remove accessToken with key: " + n + " from map");
          var a = i.accessToken.indexOf(n);
          a > -1 ? (this.logger.info("BrowserCacheManager: removeTokenKey - accessToken removed from map"), i.accessToken.splice(a, 1)) : this.logger.info("BrowserCacheManager: removeTokenKey - accessToken does not exist in map. Either it was previously removed or it was never added.");
          break;
        case F.REFRESH_TOKEN:
          this.logger.infoPii("BrowserCacheManager: removeTokenKey - attempting to remove refreshToken with key: " + n + " from map");
          var s = i.refreshToken.indexOf(n);
          s > -1 ? (this.logger.info("BrowserCacheManager: removeTokenKey - refreshToken removed from map"), i.refreshToken.splice(s, 1)) : this.logger.info("BrowserCacheManager: removeTokenKey - refreshToken does not exist in map. Either it was previously removed or it was never added.");
          break;
        default:
          this.logger.error("BrowserCacheManager:removeTokenKey - CredentialType provided invalid. CredentialType: " + r), L.createUnexpectedCredentialTypeError();
      }
      this.setItem(an.TOKEN_KEYS + "." + this.clientId, JSON.stringify(i));
    }, e.prototype.getIdTokenCredential = function(n) {
      var r = this.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getIdTokenCredential: called, no cache hit"), this.removeTokenKey(n, F.ID_TOKEN), null;
      var i = this.validateAndParseJson(r);
      return !i || !br.isIdTokenEntity(i) ? (this.logger.trace("BrowserCacheManager.getIdTokenCredential: called, no cache hit"), this.removeTokenKey(n, F.ID_TOKEN), null) : (this.logger.trace("BrowserCacheManager.getIdTokenCredential: cache hit"), Et.toObject(new br(), i));
    }, e.prototype.setIdTokenCredential = function(n) {
      this.logger.trace("BrowserCacheManager.setIdTokenCredential called");
      var r = n.generateCredentialKey();
      this.setItem(r, JSON.stringify(n)), this.addTokenKey(r, F.ID_TOKEN);
    }, e.prototype.getAccessTokenCredential = function(n) {
      var r = this.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getAccessTokenCredential: called, no cache hit"), this.removeTokenKey(n, F.ACCESS_TOKEN), null;
      var i = this.validateAndParseJson(r);
      return !i || !Rr.isAccessTokenEntity(i) ? (this.logger.trace("BrowserCacheManager.getAccessTokenCredential: called, no cache hit"), this.removeTokenKey(n, F.ACCESS_TOKEN), null) : (this.logger.trace("BrowserCacheManager.getAccessTokenCredential: cache hit"), Et.toObject(new Rr(), i));
    }, e.prototype.setAccessTokenCredential = function(n) {
      this.logger.trace("BrowserCacheManager.setAccessTokenCredential called");
      var r = n.generateCredentialKey();
      this.setItem(r, JSON.stringify(n)), this.addTokenKey(r, F.ACCESS_TOKEN);
    }, e.prototype.getRefreshTokenCredential = function(n) {
      var r = this.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getRefreshTokenCredential: called, no cache hit"), this.removeTokenKey(n, F.REFRESH_TOKEN), null;
      var i = this.validateAndParseJson(r);
      return !i || !mi.isRefreshTokenEntity(i) ? (this.logger.trace("BrowserCacheManager.getRefreshTokenCredential: called, no cache hit"), this.removeTokenKey(n, F.REFRESH_TOKEN), null) : (this.logger.trace("BrowserCacheManager.getRefreshTokenCredential: cache hit"), Et.toObject(new mi(), i));
    }, e.prototype.setRefreshTokenCredential = function(n) {
      this.logger.trace("BrowserCacheManager.setRefreshTokenCredential called");
      var r = n.generateCredentialKey();
      this.setItem(r, JSON.stringify(n)), this.addTokenKey(r, F.REFRESH_TOKEN);
    }, e.prototype.getAppMetadata = function(n) {
      var r = this.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getAppMetadata: called, no cache hit"), null;
      var i = this.validateAndParseJson(r);
      return !i || !Bu.isAppMetadataEntity(n, i) ? (this.logger.trace("BrowserCacheManager.getAppMetadata: called, no cache hit"), null) : (this.logger.trace("BrowserCacheManager.getAppMetadata: cache hit"), Et.toObject(new Bu(), i));
    }, e.prototype.setAppMetadata = function(n) {
      this.logger.trace("BrowserCacheManager.setAppMetadata called");
      var r = n.generateAppMetadataKey();
      this.setItem(r, JSON.stringify(n));
    }, e.prototype.getServerTelemetry = function(n) {
      var r = this.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getServerTelemetry: called, no cache hit"), null;
      var i = this.validateAndParseJson(r);
      return !i || !hc.isServerTelemetryEntity(n, i) ? (this.logger.trace("BrowserCacheManager.getServerTelemetry: called, no cache hit"), null) : (this.logger.trace("BrowserCacheManager.getServerTelemetry: cache hit"), Et.toObject(new hc(), i));
    }, e.prototype.setServerTelemetry = function(n, r) {
      this.logger.trace("BrowserCacheManager.setServerTelemetry called"), this.setItem(n, JSON.stringify(r));
    }, e.prototype.getAuthorityMetadata = function(n) {
      var r = this.internalStorage.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getAuthorityMetadata: called, no cache hit"), null;
      var i = this.validateAndParseJson(r);
      return i && zu.isAuthorityMetadataEntity(n, i) ? (this.logger.trace("BrowserCacheManager.getAuthorityMetadata: cache hit"), Et.toObject(new zu(), i)) : null;
    }, e.prototype.getAuthorityMetadataKeys = function() {
      var n = this, r = this.internalStorage.getKeys();
      return r.filter(function(i) {
        return n.isAuthorityMetadata(i);
      });
    }, e.prototype.setWrapperMetadata = function(n, r) {
      this.internalStorage.setItem(yi.WRAPPER_SKU, n), this.internalStorage.setItem(yi.WRAPPER_VER, r);
    }, e.prototype.getWrapperMetadata = function() {
      var n = this.internalStorage.getItem(yi.WRAPPER_SKU) || y.EMPTY_STRING, r = this.internalStorage.getItem(yi.WRAPPER_VER) || y.EMPTY_STRING;
      return [n, r];
    }, e.prototype.setAuthorityMetadata = function(n, r) {
      this.logger.trace("BrowserCacheManager.setAuthorityMetadata called"), this.internalStorage.setItem(n, JSON.stringify(r));
    }, e.prototype.getActiveAccount = function() {
      var n = this.generateCacheKey(Le.ACTIVE_ACCOUNT_FILTERS), r = this.getItem(n);
      if (!r) {
        this.logger.trace("BrowserCacheManager.getActiveAccount: No active account filters cache schema found, looking for legacy schema");
        var i = this.generateCacheKey(Le.ACTIVE_ACCOUNT), o = this.getItem(i);
        if (!o)
          return this.logger.trace("BrowserCacheManager.getActiveAccount: No active account found"), null;
        var a = this.getAccountInfoByFilter({ localAccountId: o })[0] || null;
        return a ? (this.logger.trace("BrowserCacheManager.getActiveAccount: Legacy active account cache schema found"), this.logger.trace("BrowserCacheManager.getActiveAccount: Adding active account filters cache schema"), this.setActiveAccount(a), a) : null;
      }
      var s = this.validateAndParseJson(r);
      return s ? (this.logger.trace("BrowserCacheManager.getActiveAccount: Active account filters schema found"), this.getAccountInfoByFilter({
        homeAccountId: s.homeAccountId,
        localAccountId: s.localAccountId
      })[0] || null) : (this.logger.trace("BrowserCacheManager.getActiveAccount: No active account found"), null);
    }, e.prototype.setActiveAccount = function(n) {
      var r = this.generateCacheKey(Le.ACTIVE_ACCOUNT_FILTERS), i = this.generateCacheKey(Le.ACTIVE_ACCOUNT);
      if (n) {
        this.logger.verbose("setActiveAccount: Active account set");
        var o = {
          homeAccountId: n.homeAccountId,
          localAccountId: n.localAccountId
        };
        this.browserStorage.setItem(r, JSON.stringify(o)), this.browserStorage.setItem(i, n.localAccountId);
      } else
        this.logger.verbose("setActiveAccount: No account passed, active account not set"), this.browserStorage.removeItem(r), this.browserStorage.removeItem(i);
    }, e.prototype.getAccountInfoByFilter = function(n) {
      var r = this.getAllAccounts();
      return this.logger.trace("BrowserCacheManager.getAccountInfoByFilter: total " + r.length + " accounts found"), r.filter(function(i) {
        return !(n.username && n.username.toLowerCase() !== i.username.toLowerCase() || n.homeAccountId && n.homeAccountId !== i.homeAccountId || n.localAccountId && n.localAccountId !== i.localAccountId || n.tenantId && n.tenantId !== i.tenantId || n.environment && n.environment !== i.environment);
      });
    }, e.prototype.getAccountInfoByHints = function(n, r) {
      var i = this.getAllAccounts().filter(function(o) {
        if (r) {
          var a = o.idTokenClaims && o.idTokenClaims.sid;
          return r === a;
        }
        return n ? n === o.username : !1;
      });
      if (i.length === 1)
        return i[0];
      if (i.length > 1)
        throw L.createMultipleMatchingAccountsInCacheError();
      return null;
    }, e.prototype.getThrottlingCache = function(n) {
      var r = this.getItem(n);
      if (!r)
        return this.logger.trace("BrowserCacheManager.getThrottlingCache: called, no cache hit"), null;
      var i = this.validateAndParseJson(r);
      return !i || !hp.isThrottlingEntity(n, i) ? (this.logger.trace("BrowserCacheManager.getThrottlingCache: called, no cache hit"), null) : (this.logger.trace("BrowserCacheManager.getThrottlingCache: cache hit"), Et.toObject(new hp(), i));
    }, e.prototype.setThrottlingCache = function(n, r) {
      this.logger.trace("BrowserCacheManager.setThrottlingCache called"), this.setItem(n, JSON.stringify(r));
    }, e.prototype.getTemporaryCache = function(n, r) {
      var i = r ? this.generateCacheKey(n) : n;
      if (this.cacheConfig.storeAuthStateInCookie) {
        var o = this.getItemCookie(i);
        if (o)
          return this.logger.trace("BrowserCacheManager.getTemporaryCache: storeAuthStateInCookies set to true, retrieving from cookies"), o;
      }
      var a = this.temporaryCacheStorage.getItem(i);
      if (!a) {
        if (this.cacheConfig.cacheLocation === Pe.LocalStorage) {
          var s = this.browserStorage.getItem(i);
          if (s)
            return this.logger.trace("BrowserCacheManager.getTemporaryCache: Temporary cache item found in local storage"), s;
        }
        return this.logger.trace("BrowserCacheManager.getTemporaryCache: No cache item found in local storage"), null;
      }
      return this.logger.trace("BrowserCacheManager.getTemporaryCache: Temporary cache item returned"), a;
    }, e.prototype.setTemporaryCache = function(n, r, i) {
      var o = i ? this.generateCacheKey(n) : n;
      this.temporaryCacheStorage.setItem(o, r), this.cacheConfig.storeAuthStateInCookie && (this.logger.trace("BrowserCacheManager.setTemporaryCache: storeAuthStateInCookie set to true, setting item cookie"), this.setItemCookie(o, r));
    }, e.prototype.removeItem = function(n) {
      this.browserStorage.removeItem(n), this.temporaryCacheStorage.removeItem(n), this.cacheConfig.storeAuthStateInCookie && (this.logger.trace("BrowserCacheManager.removeItem: storeAuthStateInCookie is true, clearing item cookie"), this.clearItemCookie(n));
    }, e.prototype.containsKey = function(n) {
      return this.browserStorage.containsKey(n) || this.temporaryCacheStorage.containsKey(n);
    }, e.prototype.getKeys = function() {
      return rh(this.browserStorage.getKeys(), this.temporaryCacheStorage.getKeys());
    }, e.prototype.clear = function() {
      return S(this, void 0, void 0, function() {
        var n = this;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, this.removeAllAccounts()];
            case 1:
              return r.sent(), this.removeAppMetadata(), this.getKeys().forEach(function(i) {
                (n.browserStorage.containsKey(i) || n.temporaryCacheStorage.containsKey(i)) && (i.indexOf(y.CACHE_PREFIX) !== -1 || i.indexOf(n.clientId) !== -1) && n.removeItem(i);
              }), this.internalStorage.clear(), [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.clearTokensAndKeysWithClaims = function() {
      return S(this, void 0, void 0, function() {
        var n, r, i = this;
        return w(this, function(o) {
          switch (o.label) {
            case 0:
              return this.logger.trace("BrowserCacheManager.clearTokensAndKeysWithClaims called"), n = this.getTokenKeys(), r = [], n.accessToken.forEach(function(a) {
                var s = i.getAccessTokenCredential(a);
                s != null && s.requestedClaimsHash && a.includes(s.requestedClaimsHash.toLowerCase()) && r.push(i.removeAccessToken(a));
              }), [4, Promise.all(r)];
            case 1:
              return o.sent(), r.length > 0 && this.logger.warning(r.length + " access tokens with claims in the cache keys have been removed from the cache."), [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.setItemCookie = function(n, r, i) {
      var o = encodeURIComponent(n) + "=" + encodeURIComponent(r) + ";path=/;SameSite=Lax;";
      if (i) {
        var a = this.getCookieExpirationTime(i);
        o += "expires=" + a + ";";
      }
      this.cacheConfig.secureCookies && (o += "Secure;"), document.cookie = o;
    }, e.prototype.getItemCookie = function(n) {
      for (var r = encodeURIComponent(n) + "=", i = document.cookie.split(";"), o = 0; o < i.length; o++) {
        for (var a = i[o]; a.charAt(0) === " "; )
          a = a.substring(1);
        if (a.indexOf(r) === 0)
          return decodeURIComponent(a.substring(r.length, a.length));
      }
      return y.EMPTY_STRING;
    }, e.prototype.clearMsalCookies = function() {
      var n = this, r = y.CACHE_PREFIX + "." + this.clientId, i = document.cookie.split(";");
      i.forEach(function(o) {
        for (; o.charAt(0) === " "; )
          o = o.substring(1);
        if (o.indexOf(r) === 0) {
          var a = o.split("=")[0];
          n.clearItemCookie(a);
        }
      });
    }, e.prototype.clearItemCookie = function(n) {
      this.setItemCookie(n, y.EMPTY_STRING, -1);
    }, e.prototype.getCookieExpirationTime = function(n) {
      var r = /* @__PURE__ */ new Date(), i = new Date(r.getTime() + n * this.COOKIE_LIFE_MULTIPLIER);
      return i.toUTCString();
    }, e.prototype.getCache = function() {
      return this.browserStorage;
    }, e.prototype.setCache = function() {
    }, e.prototype.generateCacheKey = function(n) {
      var r = this.validateAndParseJson(n);
      return r ? JSON.stringify(n) : P.startsWith(n, y.CACHE_PREFIX) || P.startsWith(n, Le.ADAL_ID_TOKEN) ? n : y.CACHE_PREFIX + "." + this.clientId + "." + n;
    }, e.prototype.generateAuthorityKey = function(n) {
      var r = Hn.parseRequestState(this.cryptoImpl, n).libraryState.id;
      return this.generateCacheKey(oe.AUTHORITY + "." + r);
    }, e.prototype.generateNonceKey = function(n) {
      var r = Hn.parseRequestState(this.cryptoImpl, n).libraryState.id;
      return this.generateCacheKey(oe.NONCE_IDTOKEN + "." + r);
    }, e.prototype.generateStateKey = function(n) {
      var r = Hn.parseRequestState(this.cryptoImpl, n).libraryState.id;
      return this.generateCacheKey(oe.REQUEST_STATE + "." + r);
    }, e.prototype.getCachedAuthority = function(n) {
      var r = this.generateStateKey(n), i = this.getTemporaryCache(r);
      if (!i)
        return null;
      var o = this.generateAuthorityKey(i);
      return this.getTemporaryCache(o);
    }, e.prototype.updateCacheEntries = function(n, r, i, o, a) {
      this.logger.trace("BrowserCacheManager.updateCacheEntries called");
      var s = this.generateStateKey(n);
      this.setTemporaryCache(s, n, !1);
      var c = this.generateNonceKey(n);
      this.setTemporaryCache(c, r, !1);
      var l = this.generateAuthorityKey(n);
      if (this.setTemporaryCache(l, i, !1), a) {
        var u = {
          credential: a.homeAccountId,
          type: Rt.HOME_ACCOUNT_ID
        };
        this.setTemporaryCache(oe.CCS_CREDENTIAL, JSON.stringify(u), !0);
      } else if (!P.isEmpty(o)) {
        var u = {
          credential: o,
          type: Rt.UPN
        };
        this.setTemporaryCache(oe.CCS_CREDENTIAL, JSON.stringify(u), !0);
      }
    }, e.prototype.resetRequestCache = function(n) {
      var r = this;
      this.logger.trace("BrowserCacheManager.resetRequestCache called"), P.isEmpty(n) || this.getKeys().forEach(function(i) {
        i.indexOf(n) !== -1 && r.removeItem(i);
      }), n && (this.removeItem(this.generateStateKey(n)), this.removeItem(this.generateNonceKey(n)), this.removeItem(this.generateAuthorityKey(n))), this.removeItem(this.generateCacheKey(oe.REQUEST_PARAMS)), this.removeItem(this.generateCacheKey(oe.ORIGIN_URI)), this.removeItem(this.generateCacheKey(oe.URL_HASH)), this.removeItem(this.generateCacheKey(oe.CORRELATION_ID)), this.removeItem(this.generateCacheKey(oe.CCS_CREDENTIAL)), this.removeItem(this.generateCacheKey(oe.NATIVE_REQUEST)), this.setInteractionInProgress(!1);
    }, e.prototype.cleanRequestByState = function(n) {
      if (this.logger.trace("BrowserCacheManager.cleanRequestByState called"), n) {
        var r = this.generateStateKey(n), i = this.temporaryCacheStorage.getItem(r);
        this.logger.infoPii("BrowserCacheManager.cleanRequestByState: Removing temporary cache items for state: " + i), this.resetRequestCache(i || y.EMPTY_STRING);
      }
      this.clearMsalCookies();
    }, e.prototype.cleanRequestByInteractionType = function(n) {
      var r = this;
      this.logger.trace("BrowserCacheManager.cleanRequestByInteractionType called"), this.getKeys().forEach(function(i) {
        if (i.indexOf(oe.REQUEST_STATE) !== -1) {
          var o = r.temporaryCacheStorage.getItem(i);
          if (o) {
            var a = iy.extractBrowserRequestState(r.cryptoImpl, o);
            a && a.interactionType === n && (r.logger.infoPii("BrowserCacheManager.cleanRequestByInteractionType: Removing temporary cache items for state: " + o), r.resetRequestCache(o));
          }
        }
      }), this.clearMsalCookies(), this.setInteractionInProgress(!1);
    }, e.prototype.cacheCodeRequest = function(n, r) {
      this.logger.trace("BrowserCacheManager.cacheCodeRequest called");
      var i = r.base64Encode(JSON.stringify(n));
      this.setTemporaryCache(oe.REQUEST_PARAMS, i, !0);
    }, e.prototype.getCachedRequest = function(n, r) {
      this.logger.trace("BrowserCacheManager.getCachedRequest called");
      var i = this.getTemporaryCache(oe.REQUEST_PARAMS, !0);
      if (!i)
        throw M.createNoTokenRequestCacheError();
      var o = this.validateAndParseJson(r.base64Decode(i));
      if (!o)
        throw M.createUnableToParseTokenRequestCacheError();
      if (this.removeItem(this.generateCacheKey(oe.REQUEST_PARAMS)), P.isEmpty(o.authority)) {
        var a = this.generateAuthorityKey(n), s = this.getTemporaryCache(a);
        if (!s)
          throw M.createNoCachedAuthorityError();
        o.authority = s;
      }
      return o;
    }, e.prototype.getCachedNativeRequest = function() {
      this.logger.trace("BrowserCacheManager.getCachedNativeRequest called");
      var n = this.getTemporaryCache(oe.NATIVE_REQUEST, !0);
      if (!n)
        return this.logger.trace("BrowserCacheManager.getCachedNativeRequest: No cached native request found"), null;
      var r = this.validateAndParseJson(n);
      return r || (this.logger.error("BrowserCacheManager.getCachedNativeRequest: Unable to parse native request"), null);
    }, e.prototype.isInteractionInProgress = function(n) {
      var r = this.getInteractionInProgress();
      return n ? r === this.clientId : !!r;
    }, e.prototype.getInteractionInProgress = function() {
      var n = y.CACHE_PREFIX + "." + oe.INTERACTION_STATUS_KEY;
      return this.getTemporaryCache(n, !1);
    }, e.prototype.setInteractionInProgress = function(n) {
      var r = y.CACHE_PREFIX + "." + oe.INTERACTION_STATUS_KEY;
      if (n) {
        if (this.getInteractionInProgress())
          throw M.createInteractionInProgressError();
        this.setTemporaryCache(r, this.clientId, !1);
      } else
        !n && this.getInteractionInProgress() === this.clientId && this.removeItem(r);
    }, e.prototype.getLegacyLoginHint = function() {
      var n = this.getTemporaryCache(Le.ADAL_ID_TOKEN);
      n && (this.browserStorage.removeItem(Le.ADAL_ID_TOKEN), this.logger.verbose("Cached ADAL id token retrieved."));
      var r = this.getTemporaryCache(Le.ID_TOKEN, !0);
      r && (this.removeItem(this.generateCacheKey(Le.ID_TOKEN)), this.logger.verbose("Cached MSAL.js v1 id token retrieved"));
      var i = r || n;
      if (i) {
        var o = new mn(i, this.cryptoImpl);
        if (o.claims && o.claims.preferred_username)
          return this.logger.verbose("No SSO params used and ADAL/MSAL v1 token retrieved, setting ADAL/MSAL v1 preferred_username as loginHint"), o.claims.preferred_username;
        if (o.claims && o.claims.upn)
          return this.logger.verbose("No SSO params used and ADAL/MSAL v1 token retrieved, setting ADAL/MSAL v1 upn as loginHint"), o.claims.upn;
        this.logger.verbose("No SSO params used and ADAL/MSAL v1 token retrieved, however, no account hint claim found. Enable preferred_username or upn id token claim to get SSO.");
      }
      return null;
    }, e.prototype.updateCredentialCacheKey = function(n, r) {
      var i = r.generateCredentialKey();
      if (n !== i) {
        var o = this.getItem(n);
        if (o)
          return this.removeItem(n), this.setItem(i, o), this.logger.verbose("Updated an outdated " + r.credentialType + " cache key"), i;
        this.logger.error("Attempted to update an outdated " + r.credentialType + " cache key but no item matching the outdated key was found in storage");
      }
      return n;
    }, e.prototype.getRedirectRequestContext = function() {
      return this.getTemporaryCache(oe.REDIRECT_CONTEXT, !0);
    }, e.prototype.setRedirectRequestContext = function(n) {
      this.setTemporaryCache(oe.REDIRECT_CONTEXT, n, !0);
    }, e;
  }(Et)
), iA = function(t, e) {
  var n = {
    cacheLocation: Pe.MemoryStorage,
    temporaryCacheLocation: Pe.MemoryStorage,
    storeAuthStateInCookie: !1,
    secureCookies: !1,
    cacheMigrationEnabled: !1,
    claimsBasedCachingEnabled: !0
  };
  return new Fu(t, n, ac, e);
};
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Hl = "@azure/msal-browser", $o = "2.38.4";
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var oA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.sendGetRequestAsync = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r, i, o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return a.trys.push([0, 2, , 3]), [4, fetch(e, {
                method: sn.GET,
                headers: this.getFetchHeaders(n)
              })];
            case 1:
              return r = a.sent(), [3, 3];
            case 2:
              throw i = a.sent(), window.navigator.onLine ? M.createGetRequestFailedError(i, e) : M.createNoNetworkConnectivityError();
            case 3:
              return a.trys.push([3, 5, , 6]), o = {
                headers: this.getHeaderDict(r.headers)
              }, [4, r.json()];
            case 4:
              return [2, (o.body = a.sent(), o.status = r.status, o)];
            case 5:
              throw a.sent(), M.createFailedToParseNetworkResponseError(e);
            case 6:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.sendPostRequestAsync = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a;
        return w(this, function(s) {
          switch (s.label) {
            case 0:
              r = n && n.body || y.EMPTY_STRING, s.label = 1;
            case 1:
              return s.trys.push([1, 3, , 4]), [4, fetch(e, {
                method: sn.POST,
                headers: this.getFetchHeaders(n),
                body: r
              })];
            case 2:
              return i = s.sent(), [3, 4];
            case 3:
              throw o = s.sent(), window.navigator.onLine ? M.createPostRequestFailedError(o, e) : M.createNoNetworkConnectivityError();
            case 4:
              return s.trys.push([4, 6, , 7]), a = {
                headers: this.getHeaderDict(i.headers)
              }, [4, i.json()];
            case 5:
              return [2, (a.body = s.sent(), a.status = i.status, a)];
            case 6:
              throw s.sent(), M.createFailedToParseNetworkResponseError(e);
            case 7:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.getFetchHeaders = function(e) {
      var n = new Headers();
      if (!(e && e.headers))
        return n;
      var r = e.headers;
      return Object.keys(r).forEach(function(i) {
        n.append(i, r[i]);
      }), n;
    }, t.prototype.getHeaderDict = function(e) {
      var n = {};
      return e.forEach(function(r, i) {
        n[i] = r;
      }), n;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var aA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.sendGetRequestAsync = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, this.sendRequestAsync(e, sn.GET, n)];
        });
      });
    }, t.prototype.sendPostRequestAsync = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, this.sendRequestAsync(e, sn.POST, n)];
        });
      });
    }, t.prototype.sendRequestAsync = function(e, n, r) {
      var i = this;
      return new Promise(function(o, a) {
        var s = new XMLHttpRequest();
        if (s.open(
          n,
          e,
          /* async: */
          !0
        ), i.setXhrHeaders(s, r), s.onload = function() {
          (s.status < 200 || s.status >= 300) && (n === sn.POST ? a(M.createPostRequestFailedError("Failed with status " + s.status, e)) : a(M.createGetRequestFailedError("Failed with status " + s.status, e)));
          try {
            var c = JSON.parse(s.responseText), l = {
              headers: i.getHeaderDict(s),
              body: c,
              status: s.status
            };
            o(l);
          } catch {
            a(M.createFailedToParseNetworkResponseError(e));
          }
        }, s.onerror = function() {
          window.navigator.onLine ? n === sn.POST ? a(M.createPostRequestFailedError("Failed with status " + s.status, e)) : a(M.createGetRequestFailedError("Failed with status " + s.status, e)) : a(M.createNoNetworkConnectivityError());
        }, n === sn.POST && r && r.body)
          s.send(r.body);
        else if (n === sn.GET)
          s.send();
        else
          throw M.createHttpMethodNotImplementedError(n);
      });
    }, t.prototype.setXhrHeaders = function(e, n) {
      if (n && n.headers) {
        var r = n.headers;
        Object.keys(r).forEach(function(i) {
          e.setRequestHeader(i, r[i]);
        });
      }
    }, t.prototype.getHeaderDict = function(e) {
      var n = e.getAllResponseHeaders(), r = n.trim().split(/[\r\n]+/), i = {};
      return r.forEach(function(o) {
        var a = o.split(": "), s = a.shift(), c = a.join(": ");
        s && c && (i[s] = c);
      }), i;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Ne = (
  /** @class */
  function() {
    function t() {
    }
    return t.clearHash = function(e) {
      e.location.hash = y.EMPTY_STRING, typeof e.history.replaceState == "function" && e.history.replaceState(null, y.EMPTY_STRING, "" + e.location.origin + e.location.pathname + e.location.search);
    }, t.replaceHash = function(e) {
      var n = e.split("#");
      n.shift(), window.location.hash = n.length > 0 ? n.join("#") : y.EMPTY_STRING;
    }, t.isInIframe = function() {
      return window.parent !== window;
    }, t.isInPopup = function() {
      return typeof window < "u" && !!window.opener && window.opener !== window && typeof window.name == "string" && window.name.indexOf(Vt.POPUP_NAME_PREFIX + ".") === 0;
    }, t.getCurrentUri = function() {
      return window.location.href.split("?")[0].split("#")[0];
    }, t.getHomepage = function() {
      var e = new ie(window.location.href), n = e.getUrlComponents();
      return n.Protocol + "//" + n.HostNameAndPort + "/";
    }, t.getBrowserNetworkClient = function() {
      return window.fetch && window.Headers ? new oA() : new aA();
    }, t.blockReloadInHiddenIframes = function() {
      var e = ie.hashContainsKnownProperties(window.location.hash);
      if (e && t.isInIframe())
        throw M.createBlockReloadInHiddenIframeError();
    }, t.blockRedirectInIframe = function(e, n) {
      var r = t.isInIframe();
      if (e === x.Redirect && r && !n)
        throw M.createRedirectInIframeError(r);
    }, t.blockAcquireTokenInPopups = function() {
      if (t.isInPopup())
        throw M.createBlockAcquireTokenInPopupsError();
    }, t.blockNonBrowserEnvironment = function(e) {
      if (!e)
        throw M.createNonBrowserEnvironmentError();
    }, t.blockNativeBrokerCalledBeforeInitialized = function(e, n) {
      if (e && !n)
        throw M.createNativeBrokerCalledBeforeInitialize();
    }, t.detectIEOrEdge = function() {
      var e = window.navigator.userAgent, n = e.indexOf("MSIE "), r = e.indexOf("Trident/"), i = e.indexOf("Edge/"), o = n > 0 || r > 0, a = i > 0;
      return o || a;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var oy = (
  /** @class */
  function() {
    function t(e, n, r, i, o, a, s, c, l) {
      this.config = e, this.browserStorage = n, this.browserCrypto = r, this.networkClient = this.config.system.networkClient, this.eventHandler = o, this.navigationClient = a, this.nativeMessageHandler = c, this.correlationId = l || this.browserCrypto.createNewGuid(), this.logger = i.clone(Vt.MSAL_SKU, $o, this.correlationId), this.performanceClient = s;
    }
    return t.prototype.clearCacheOnLogout = function(e) {
      return S(this, void 0, void 0, function() {
        return w(this, function(n) {
          switch (n.label) {
            case 0:
              if (!e)
                return [3, 5];
              We.accountInfoIsEqual(e, this.browserStorage.getActiveAccount(), !1) && (this.logger.verbose("Setting active account to null"), this.browserStorage.setActiveAccount(null)), n.label = 1;
            case 1:
              return n.trys.push([1, 3, , 4]), [4, this.browserStorage.removeAccount(We.generateAccountCacheKey(e))];
            case 2:
              return n.sent(), this.logger.verbose("Cleared cache items belonging to the account provided in the logout request."), [3, 4];
            case 3:
              return n.sent(), this.logger.error("Account provided in logout request was not found. Local cache unchanged."), [3, 4];
            case 4:
              return [3, 9];
            case 5:
              return n.trys.push([5, 8, , 9]), this.logger.verbose("No account provided in logout request, clearing all cache items.", this.correlationId), [4, this.browserStorage.clear()];
            case 6:
              return n.sent(), [4, this.browserCrypto.clearKeystore()];
            case 7:
              return n.sent(), [3, 9];
            case 8:
              return n.sent(), this.logger.error("Attempted to clear all MSAL cache items and failed. Local cache unchanged."), [3, 9];
            case 9:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.initializeBaseRequest = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a;
        return w(this, function(s) {
          switch (s.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.InitializeBaseRequest, e.correlationId), this.logger.verbose("Initializing BaseAuthRequest"), r = e.authority || this.config.auth.authority, n ? [4, this.validateRequestAuthority(r, n)] : [3, 2];
            case 1:
              s.sent(), s.label = 2;
            case 2:
              if (i = rh(e && e.scopes || []), o = B(B({}, e), {
                correlationId: this.correlationId,
                authority: r,
                scopes: i
              }), !o.authenticationScheme)
                o.authenticationScheme = ue.BEARER, this.logger.verbose(`Authentication Scheme wasn't explicitly set in request, defaulting to "Bearer" request`);
              else {
                if (o.authenticationScheme === ue.SSH) {
                  if (!e.sshJwk)
                    throw Ee.createMissingSshJwkError();
                  if (!e.sshKid)
                    throw Ee.createMissingSshKidError();
                }
                this.logger.verbose('Authentication Scheme set to "' + o.authenticationScheme + '" as configured in Auth request');
              }
              return this.config.cache.claimsBasedCachingEnabled && e.claims && !P.isEmptyObj(e.claims) ? (a = o, [4, this.browserCrypto.hashString(e.claims)]) : [3, 4];
            case 3:
              a.requestedClaimsHash = s.sent(), s.label = 4;
            case 4:
              return [2, o];
          }
        });
      });
    }, t.prototype.getRedirectUri = function(e) {
      this.logger.verbose("getRedirectUri called");
      var n = e || this.config.auth.redirectUri || Ne.getCurrentUri();
      return ie.getAbsoluteUrl(n, Ne.getCurrentUri());
    }, t.prototype.validateRequestAuthority = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              return [4, this.getDiscoveredAuthority(e)];
            case 1:
              if (r = i.sent(), !r.isAlias(n.environment))
                throw Ee.createAuthorityMismatchError();
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.initializeServerTelemetryManager = function(e, n) {
      this.logger.verbose("initializeServerTelemetryManager called");
      var r = {
        clientId: this.config.auth.clientId,
        correlationId: this.correlationId,
        apiId: e,
        forceRefresh: n || !1,
        wrapperSKU: this.browserStorage.getWrapperMetadata()[0],
        wrapperVer: this.browserStorage.getWrapperMetadata()[1]
      };
      return new eA(r, this.browserStorage);
    }, t.prototype.getDiscoveredAuthority = function(e) {
      return S(this, void 0, void 0, function() {
        var n;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return this.logger.verbose("getDiscoveredAuthority called"), n = {
                protocolMode: this.config.auth.protocolMode,
                knownAuthorities: this.config.auth.knownAuthorities,
                cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
                authorityMetadata: this.config.auth.authorityMetadata
              }, e ? (this.logger.verbose("Creating discovered authority with request authority"), [4, dc.createDiscoveredInstance(e, this.config.system.networkClient, this.browserStorage, n, this.logger)]) : [3, 2];
            case 1:
              return [2, r.sent()];
            case 2:
              return this.logger.verbose("Creating discovered authority with configured authority"), [4, dc.createDiscoveredInstance(this.config.auth.authority, this.config.system.networkClient, this.browserStorage, n, this.logger)];
            case 3:
              return [2, r.sent()];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var ro = (
  /** @class */
  function(t) {
    et(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.initializeAuthorizationCodeRequest = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i;
        return w(this, function(o) {
          switch (o.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.StandardInteractionClientInitializeAuthorizationCodeRequest, n.correlationId), this.logger.verbose("initializeAuthorizationRequest called", n.correlationId), [4, this.browserCrypto.generatePkceCodes()];
            case 1:
              return r = o.sent(), i = B(B({}, n), { redirectUri: n.redirectUri, code: y.EMPTY_STRING, codeVerifier: r.verifier }), n.codeChallenge = r.challenge, n.codeChallengeMethod = y.S256_CODE_CHALLENGE_METHOD, [2, i];
          }
        });
      });
    }, e.prototype.initializeLogoutRequest = function(n) {
      this.logger.verbose("initializeLogoutRequest called", n == null ? void 0 : n.correlationId);
      var r = B({ correlationId: this.correlationId || this.browserCrypto.createNewGuid() }, n);
      if (n)
        if (n.logoutHint)
          this.logger.verbose("logoutHint has already been set in logoutRequest");
        else if (n.account) {
          var i = this.getLogoutHintFromIdTokenClaims(n.account);
          i && (this.logger.verbose("Setting logoutHint to login_hint ID Token Claim value for the account provided"), r.logoutHint = i);
        } else
          this.logger.verbose("logoutHint was not set and account was not passed into logout request, logoutHint will not be set");
      else
        this.logger.verbose("logoutHint will not be set since no logout request was configured");
      return !n || n.postLogoutRedirectUri !== null ? n && n.postLogoutRedirectUri ? (this.logger.verbose("Setting postLogoutRedirectUri to uri set on logout request", r.correlationId), r.postLogoutRedirectUri = ie.getAbsoluteUrl(n.postLogoutRedirectUri, Ne.getCurrentUri())) : this.config.auth.postLogoutRedirectUri === null ? this.logger.verbose("postLogoutRedirectUri configured as null and no uri set on request, not passing post logout redirect", r.correlationId) : this.config.auth.postLogoutRedirectUri ? (this.logger.verbose("Setting postLogoutRedirectUri to configured uri", r.correlationId), r.postLogoutRedirectUri = ie.getAbsoluteUrl(this.config.auth.postLogoutRedirectUri, Ne.getCurrentUri())) : (this.logger.verbose("Setting postLogoutRedirectUri to current page", r.correlationId), r.postLogoutRedirectUri = ie.getAbsoluteUrl(Ne.getCurrentUri(), Ne.getCurrentUri())) : this.logger.verbose("postLogoutRedirectUri passed as null, not setting post logout redirect uri", r.correlationId), r;
    }, e.prototype.getLogoutHintFromIdTokenClaims = function(n) {
      var r = n.idTokenClaims;
      if (r) {
        if (r.login_hint)
          return r.login_hint;
        this.logger.verbose("The ID Token Claims tied to the provided account do not contain a login_hint claim, logoutHint will not be added to logout request");
      } else
        this.logger.verbose("The provided account does not contain ID Token Claims, logoutHint will not be added to logout request");
      return null;
    }, e.prototype.createAuthCodeClient = function(n, r, i) {
      return S(this, void 0, void 0, function() {
        var o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.StandardInteractionClientCreateAuthCodeClient, this.correlationId), this.performanceClient.setPreQueueTime(_.StandardInteractionClientGetClientConfiguration, this.correlationId), [4, this.getClientConfiguration(n, r, i)];
            case 1:
              return o = a.sent(), [2, new ey(o, this.performanceClient)];
          }
        });
      });
    }, e.prototype.getClientConfiguration = function(n, r, i) {
      return S(this, void 0, void 0, function() {
        var o, a;
        return w(this, function(s) {
          switch (s.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.StandardInteractionClientGetClientConfiguration, this.correlationId), this.logger.verbose("getClientConfiguration called", this.correlationId), this.performanceClient.setPreQueueTime(_.StandardInteractionClientGetDiscoveredAuthority, this.correlationId), [4, this.getDiscoveredAuthority(r, i)];
            case 1:
              return o = s.sent(), a = this.config.system.loggerOptions, [2, {
                authOptions: {
                  clientId: this.config.auth.clientId,
                  authority: o,
                  clientCapabilities: this.config.auth.clientCapabilities
                },
                systemOptions: {
                  tokenRenewalOffsetSeconds: this.config.system.tokenRenewalOffsetSeconds,
                  preventCorsPreflight: !0
                },
                loggerOptions: {
                  loggerCallback: a.loggerCallback,
                  piiLoggingEnabled: a.piiLoggingEnabled,
                  logLevel: a.logLevel,
                  correlationId: this.correlationId
                },
                cacheOptions: {
                  claimsBasedCachingEnabled: this.config.cache.claimsBasedCachingEnabled
                },
                cryptoInterface: this.browserCrypto,
                networkInterface: this.networkClient,
                storageInterface: this.browserStorage,
                serverTelemetryManager: n,
                libraryInfo: {
                  sku: Vt.MSAL_SKU,
                  version: $o,
                  cpu: y.EMPTY_STRING,
                  os: y.EMPTY_STRING
                },
                telemetry: this.config.telemetry
              }];
          }
        });
      });
    }, e.prototype.validateAndExtractStateFromHash = function(n, r, i) {
      if (this.logger.verbose("validateAndExtractStateFromHash called", i), !n.state)
        throw M.createHashDoesNotContainStateError();
      var o = iy.extractBrowserRequestState(this.browserCrypto, n.state);
      if (!o)
        throw M.createUnableToParseStateError();
      if (o.interactionType !== r)
        throw M.createStateInteractionTypeMismatchError();
      return this.logger.verbose("Returning state from hash", i), n.state;
    }, e.prototype.getDiscoveredAuthority = function(n, r) {
      var i;
      return S(this, void 0, void 0, function() {
        var o, a, s, c;
        return w(this, function(l) {
          switch (l.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.StandardInteractionClientGetDiscoveredAuthority, this.correlationId), this.logger.verbose("getDiscoveredAuthority called", this.correlationId), o = (i = this.performanceClient) === null || i === void 0 ? void 0 : i.startMeasurement(_.StandardInteractionClientGetDiscoveredAuthority, this.correlationId), a = {
                protocolMode: this.config.auth.protocolMode,
                knownAuthorities: this.config.auth.knownAuthorities,
                cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
                authorityMetadata: this.config.auth.authorityMetadata,
                skipAuthorityMetadataCache: this.config.auth.skipAuthorityMetadataCache
              }, s = n || this.config.auth.authority, c = pa.generateAuthority(s, r || this.config.auth.azureCloudOptions), this.logger.verbose("Creating discovered authority with configured authority", this.correlationId), this.performanceClient.setPreQueueTime(_.AuthorityFactoryCreateDiscoveredInstance, this.correlationId), [4, dc.createDiscoveredInstance(c, this.config.system.networkClient, this.browserStorage, a, this.logger, this.performanceClient, this.correlationId).then(function(u) {
                return o.endMeasurement({
                  success: !0
                }), u;
              }).catch(function(u) {
                throw o.endMeasurement({
                  errorCode: u.errorCode,
                  subErrorCode: u.subError,
                  success: !1
                }), u;
              })];
            case 1:
              return [2, l.sent()];
          }
        });
      });
    }, e.prototype.initializeAuthorizationRequest = function(n, r) {
      return S(this, void 0, void 0, function() {
        var i, o, a, s, c, l, u;
        return w(this, function(d) {
          switch (d.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.StandardInteractionClientInitializeAuthorizationRequest, this.correlationId), this.logger.verbose("initializeAuthorizationRequest called", this.correlationId), i = this.getRedirectUri(n.redirectUri), o = {
                interactionType: r
              }, a = Hn.setRequestState(this.browserCrypto, n && n.state || y.EMPTY_STRING, o), this.performanceClient.setPreQueueTime(_.InitializeBaseRequest, this.correlationId), c = [{}], [4, this.initializeBaseRequest(n)];
            case 1:
              return s = B.apply(void 0, [B.apply(void 0, c.concat([d.sent()])), { redirectUri: i, state: a, nonce: n.nonce || this.browserCrypto.createNewGuid(), responseMode: rc.FRAGMENT }]), l = n.account || this.browserStorage.getActiveAccount(), l && (this.logger.verbose("Setting validated request account", this.correlationId), this.logger.verbosePii("Setting validated request account: " + l.homeAccountId, this.correlationId), s.account = l), P.isEmpty(s.loginHint) && !l && (u = this.browserStorage.getLegacyLoginHint(), u && (s.loginHint = u)), [2, s];
          }
        });
      });
    }, e;
  }(oy)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var sh = (
  /** @class */
  function() {
    function t(e, n, r, i, o) {
      this.authModule = e, this.browserStorage = n, this.authCodeRequest = r, this.logger = i, this.performanceClient = o;
    }
    return t.prototype.handleCodeResponseFromHash = function(e, n, r, i) {
      return S(this, void 0, void 0, function() {
        var o, a, s;
        return w(this, function(c) {
          if (this.performanceClient.addQueueMeasurement(_.HandleCodeResponseFromHash, this.authCodeRequest.correlationId), this.logger.verbose("InteractionHandler.handleCodeResponse called"), P.isEmpty(e))
            throw M.createEmptyHashError(e);
          if (o = this.browserStorage.generateStateKey(n), a = this.browserStorage.getTemporaryCache(o), !a)
            throw L.createStateNotFoundError("Cached State");
          try {
            s = this.authModule.handleFragmentResponse(e, a);
          } catch (l) {
            throw l instanceof Br && l.subError === b.userCancelledError.code ? M.createUserCancelledError() : l;
          }
          return this.performanceClient.setPreQueueTime(_.HandleCodeResponseFromServer, this.authCodeRequest.correlationId), [2, this.handleCodeResponseFromServer(s, n, r, i)];
        });
      });
    }, t.prototype.handleCodeResponseFromServer = function(e, n, r, i, o) {
      return o === void 0 && (o = !0), S(this, void 0, void 0, function() {
        var a, s, c, l, u, d;
        return w(this, function(h) {
          switch (h.label) {
            case 0:
              if (this.performanceClient.addQueueMeasurement(_.HandleCodeResponseFromServer, this.authCodeRequest.correlationId), this.logger.trace("InteractionHandler.handleCodeResponseFromServer called"), a = this.browserStorage.generateStateKey(n), s = this.browserStorage.getTemporaryCache(a), !s)
                throw L.createStateNotFoundError("Cached State");
              return c = this.browserStorage.generateNonceKey(s), l = this.browserStorage.getTemporaryCache(c), this.authCodeRequest.code = e.code, e.cloud_instance_host_name ? (this.performanceClient.setPreQueueTime(_.UpdateTokenEndpointAuthority, this.authCodeRequest.correlationId), [4, this.updateTokenEndpointAuthority(e.cloud_instance_host_name, r, i)]) : [3, 2];
            case 1:
              h.sent(), h.label = 2;
            case 2:
              return o && (e.nonce = l || void 0), e.state = s, e.client_info ? this.authCodeRequest.clientInfo = e.client_info : (u = this.checkCcsCredentials(), u && (this.authCodeRequest.ccsCredential = u)), this.performanceClient.setPreQueueTime(_.AuthClientAcquireToken, this.authCodeRequest.correlationId), [4, this.authModule.acquireToken(this.authCodeRequest, e)];
            case 3:
              return d = h.sent(), this.browserStorage.cleanRequestByState(n), [2, d];
          }
        });
      });
    }, t.prototype.updateTokenEndpointAuthority = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        var i, o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.UpdateTokenEndpointAuthority, this.authCodeRequest.correlationId), i = "https://" + e + "/" + n.tenant + "/", [4, dc.createDiscoveredInstance(i, r, this.browserStorage, n.options, this.logger, this.performanceClient, this.authCodeRequest.correlationId)];
            case 1:
              return o = a.sent(), this.authModule.updateAuthority(o), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.checkCcsCredentials = function() {
      var e = this.browserStorage.getTemporaryCache(oe.CCS_CREDENTIAL, !0);
      if (e)
        try {
          return JSON.parse(e);
        } catch {
          this.authModule.logger.error("Cache credential could not be parsed"), this.authModule.logger.errorPii("Cache credential could not be parsed: " + e);
        }
      return null;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Ep = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s) {
      var c = t.call(this, n, r, i, o, s) || this;
      return c.browserCrypto = a, c;
    }
    return e.prototype.initiateAuthRequest = function(n, r) {
      return S(this, void 0, void 0, function() {
        var i, o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return this.logger.verbose("RedirectHandler.initiateAuthRequest called"), P.isEmpty(n) ? [3, 7] : (r.redirectStartPage && (this.logger.verbose("RedirectHandler.initiateAuthRequest: redirectStartPage set, caching start page"), this.browserStorage.setTemporaryCache(oe.ORIGIN_URI, r.redirectStartPage, !0)), this.browserStorage.setTemporaryCache(oe.CORRELATION_ID, this.authCodeRequest.correlationId, !0), this.browserStorage.cacheCodeRequest(this.authCodeRequest, this.browserCrypto), this.logger.infoPii("RedirectHandler.initiateAuthRequest: Navigate to: " + n), i = {
                apiId: ye.acquireTokenRedirect,
                timeout: r.redirectTimeout,
                noHistory: !1
              }, typeof r.onRedirectNavigate != "function" ? [3, 4] : (this.logger.verbose("RedirectHandler.initiateAuthRequest: Invoking onRedirectNavigate callback"), o = r.onRedirectNavigate(n), o === !1 ? [3, 2] : (this.logger.verbose("RedirectHandler.initiateAuthRequest: onRedirectNavigate did not return false, navigating"), [4, r.navigationClient.navigateExternal(n, i)])));
            case 1:
              return a.sent(), [
                2
                /*return*/
              ];
            case 2:
              return this.logger.verbose("RedirectHandler.initiateAuthRequest: onRedirectNavigate returned false, stopping navigation"), [
                2
                /*return*/
              ];
            case 3:
              return [3, 6];
            case 4:
              return this.logger.verbose("RedirectHandler.initiateAuthRequest: Navigating window to navigate url"), [4, r.navigationClient.navigateExternal(n, i)];
            case 5:
              return a.sent(), [
                2
                /*return*/
              ];
            case 6:
              return [3, 8];
            case 7:
              throw this.logger.info("RedirectHandler.initiateAuthRequest: Navigate url is empty"), M.createEmptyNavigationUriError();
            case 8:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.handleCodeResponseFromHash = function(n, r, i, o) {
      return S(this, void 0, void 0, function() {
        var a, s, c, l, u, d, h;
        return w(this, function(f) {
          switch (f.label) {
            case 0:
              if (this.logger.verbose("RedirectHandler.handleCodeResponse called"), P.isEmpty(n))
                throw M.createEmptyHashError(n);
              if (this.browserStorage.setInteractionInProgress(!1), a = this.browserStorage.generateStateKey(r), s = this.browserStorage.getTemporaryCache(a), !s)
                throw L.createStateNotFoundError("Cached State");
              try {
                c = this.authModule.handleFragmentResponse(n, s);
              } catch (m) {
                throw m instanceof Br && m.subError === b.userCancelledError.code ? M.createUserCancelledError() : m;
              }
              return l = this.browserStorage.generateNonceKey(s), u = this.browserStorage.getTemporaryCache(l), this.authCodeRequest.code = c.code, c.cloud_instance_host_name ? [4, this.updateTokenEndpointAuthority(c.cloud_instance_host_name, i, o)] : [3, 2];
            case 1:
              f.sent(), f.label = 2;
            case 2:
              return c.nonce = u || void 0, c.state = s, c.client_info ? this.authCodeRequest.clientInfo = c.client_info : (d = this.checkCcsCredentials(), d && (this.authCodeRequest.ccsCredential = d)), [4, this.authModule.acquireToken(this.authCodeRequest, c)];
            case 3:
              return h = f.sent(), this.browserStorage.cleanRequestByState(r), [2, h];
          }
        });
      });
    }, e;
  }(sh)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Q;
(function(t) {
  t.INITIALIZE_START = "msal:initializeStart", t.INITIALIZE_END = "msal:initializeEnd", t.ACCOUNT_ADDED = "msal:accountAdded", t.ACCOUNT_REMOVED = "msal:accountRemoved", t.LOGIN_START = "msal:loginStart", t.LOGIN_SUCCESS = "msal:loginSuccess", t.LOGIN_FAILURE = "msal:loginFailure", t.ACQUIRE_TOKEN_START = "msal:acquireTokenStart", t.ACQUIRE_TOKEN_SUCCESS = "msal:acquireTokenSuccess", t.ACQUIRE_TOKEN_FAILURE = "msal:acquireTokenFailure", t.ACQUIRE_TOKEN_NETWORK_START = "msal:acquireTokenFromNetworkStart", t.SSO_SILENT_START = "msal:ssoSilentStart", t.SSO_SILENT_SUCCESS = "msal:ssoSilentSuccess", t.SSO_SILENT_FAILURE = "msal:ssoSilentFailure", t.ACQUIRE_TOKEN_BY_CODE_START = "msal:acquireTokenByCodeStart", t.ACQUIRE_TOKEN_BY_CODE_SUCCESS = "msal:acquireTokenByCodeSuccess", t.ACQUIRE_TOKEN_BY_CODE_FAILURE = "msal:acquireTokenByCodeFailure", t.HANDLE_REDIRECT_START = "msal:handleRedirectStart", t.HANDLE_REDIRECT_END = "msal:handleRedirectEnd", t.POPUP_OPENED = "msal:popupOpened", t.LOGOUT_START = "msal:logoutStart", t.LOGOUT_SUCCESS = "msal:logoutSuccess", t.LOGOUT_FAILURE = "msal:logoutFailure", t.LOGOUT_END = "msal:logoutEnd", t.RESTORE_FROM_BFCACHE = "msal:restoreFromBFCache";
})(Q || (Q = {}));
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var $n;
(function(t) {
  t.USER_INTERACTION_REQUIRED = "USER_INTERACTION_REQUIRED", t.USER_CANCEL = "USER_CANCEL", t.NO_NETWORK = "NO_NETWORK", t.TRANSIENT_ERROR = "TRANSIENT_ERROR", t.PERSISTENT_ERROR = "PERSISTENT_ERROR", t.DISABLED = "DISABLED", t.ACCOUNT_UNAVAILABLE = "ACCOUNT_UNAVAILABLE";
})($n || ($n = {}));
var go = {
  extensionError: {
    code: "ContentError"
  },
  userSwitch: {
    code: "user_switch",
    desc: "User attempted to switch accounts in the native broker, which is not allowed. All new accounts must sign-in through the standard web flow first, please try again."
  },
  tokensNotFoundInCache: {
    code: "tokens_not_found_in_internal_memory_cache",
    desc: "Tokens not cached in MSAL JS internal memory, please make the WAM request"
  }
}, un = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i) {
      var o = t.call(this, n, r) || this;
      return Object.setPrototypeOf(o, e.prototype), o.name = "NativeAuthError", o.ext = i, o;
    }
    return e.prototype.isFatal = function() {
      if (this.ext && this.ext.status && (this.ext.status === $n.PERSISTENT_ERROR || this.ext.status === $n.DISABLED))
        return !0;
      switch (this.errorCode) {
        case go.extensionError.code:
          return !0;
        default:
          return !1;
      }
    }, e.createError = function(n, r, i) {
      if (i && i.status)
        switch (i.status) {
          case $n.ACCOUNT_UNAVAILABLE:
            return Zt.createNativeAccountUnavailableError();
          case $n.USER_INTERACTION_REQUIRED:
            return new Zt(n, r);
          case $n.USER_CANCEL:
            return M.createUserCancelledError();
          case $n.NO_NETWORK:
            return M.createNoNetworkConnectivityError();
        }
      return new e(n, r, i);
    }, e.createUserSwitchError = function() {
      return new e(go.userSwitch.code, go.userSwitch.desc);
    }, e.createTokensNotFoundInCacheError = function() {
      return new e(go.tokensNotFoundInCache.code, go.tokensNotFoundInCache.desc);
    }, e;
  }(K)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var ay = (
  /** @class */
  function(t) {
    et(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.acquireToken = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s;
        return w(this, function(c) {
          switch (c.label) {
            case 0:
              return r = this.performanceClient.startMeasurement(_.SilentCacheClientAcquireToken, n.correlationId), i = this.initializeServerTelemetryManager(ye.acquireTokenSilent_silentFlow), [4, this.createSilentFlowClient(i, n.authority, n.azureCloudOptions)];
            case 1:
              o = c.sent(), this.logger.verbose("Silent auth client created"), c.label = 2;
            case 2:
              return c.trys.push([2, 4, , 5]), [4, o.acquireCachedToken(n)];
            case 3:
              return a = c.sent(), r.endMeasurement({
                success: !0,
                fromCache: !0
              }), [2, a];
            case 4:
              throw s = c.sent(), s instanceof M && s.errorCode === b.signingKeyNotFoundInStorage.code && this.logger.verbose("Signing keypair for bound access token not found. Refreshing bound access token and generating a new crypto keypair."), r.endMeasurement({
                errorCode: s instanceof K && s.errorCode || void 0,
                subErrorCode: s instanceof K && s.subError || void 0,
                success: !1
              }), s;
            case 5:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.logout = function() {
      return Promise.reject(M.createSilentLogoutUnsupportedError());
    }, e.prototype.createSilentFlowClient = function(n, r, i) {
      return S(this, void 0, void 0, function() {
        var o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return this.performanceClient.setPreQueueTime(_.StandardInteractionClientGetClientConfiguration, this.correlationId), [4, this.getClientConfiguration(n, r, i)];
            case 1:
              return o = a.sent(), [2, new Qw(o, this.performanceClient)];
          }
        });
      });
    }, e.prototype.initializeSilentRequest = function(n, r) {
      return S(this, void 0, void 0, function() {
        var i;
        return w(this, function(o) {
          switch (o.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.InitializeSilentRequest, this.correlationId), this.performanceClient.setPreQueueTime(_.InitializeBaseRequest, this.correlationId), i = [B({}, n)], [4, this.initializeBaseRequest(n, r)];
            case 1:
              return [2, B.apply(void 0, [B.apply(void 0, i.concat([o.sent()])), { account: r, forceRefresh: n.forceRefresh || !1 }])];
          }
        });
      });
    }, e;
  }(ro)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var ki = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s, c, l, u, d, h, f) {
      var m = t.call(this, n, r, i, o, a, s, l, u, f) || this;
      return m.apiId = c, m.accountId = d, m.nativeMessageHandler = u, m.nativeStorageManager = h, m.silentCacheClient = new ay(n, m.nativeStorageManager, i, o, a, s, l, u, f), m;
    }
    return e.prototype.acquireToken = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l;
        return w(this, function(u) {
          switch (u.label) {
            case 0:
              return this.logger.trace("NativeInteractionClient - acquireToken called."), r = this.performanceClient.startMeasurement(_.NativeInteractionClientAcquireToken, n.correlationId), i = Bt.nowSeconds(), [4, this.initializeNativeRequest(n)];
            case 1:
              o = u.sent(), u.label = 2;
            case 2:
              return u.trys.push([2, 4, , 5]), [4, this.acquireTokensFromCache(this.accountId, o)];
            case 3:
              return a = u.sent(), r.endMeasurement({
                success: !0,
                isNativeBroker: !1,
                fromCache: !0
              }), [2, a];
            case 4:
              return u.sent(), this.logger.info("MSAL internal Cache does not contain tokens, proceed to make a native call"), [3, 5];
            case 5:
              return s = {
                method: kn.GetToken,
                request: o
              }, [4, this.nativeMessageHandler.sendMessage(s)];
            case 6:
              return c = u.sent(), l = this.validateNativeResponse(c), [2, this.handleNativeResponse(l, o, i).then(function(d) {
                return r.endMeasurement({
                  success: !0,
                  isNativeBroker: !0,
                  requestId: d.requestId
                }), d;
              }).catch(function(d) {
                throw r.endMeasurement({
                  success: !1,
                  errorCode: d.errorCode,
                  subErrorCode: d.subError,
                  isNativeBroker: !0
                }), d;
              })];
          }
        });
      });
    }, e.prototype.createSilentCacheRequest = function(n, r) {
      return {
        authority: n.authority,
        correlationId: this.correlationId,
        scopes: it.fromString(n.scope).asArray(),
        account: r,
        forceRefresh: !1
      };
    }, e.prototype.acquireTokensFromCache = function(n, r) {
      return S(this, void 0, void 0, function() {
        var i, o, a, s;
        return w(this, function(c) {
          switch (c.label) {
            case 0:
              if (!n)
                throw this.logger.warning("NativeInteractionClient:acquireTokensFromCache - No nativeAccountId provided"), L.createNoAccountFoundError();
              if (i = this.browserStorage.getAccountInfoFilteredBy({ nativeAccountId: n }), !i)
                throw L.createNoAccountFoundError();
              c.label = 1;
            case 1:
              return c.trys.push([1, 3, , 4]), o = this.createSilentCacheRequest(r, i), [4, this.silentCacheClient.acquireToken(o)];
            case 2:
              return a = c.sent(), [2, a];
            case 3:
              throw s = c.sent(), s;
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.acquireTokenRedirect = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c;
        return w(this, function(l) {
          switch (l.label) {
            case 0:
              return this.logger.trace("NativeInteractionClient - acquireTokenRedirect called."), [4, this.initializeNativeRequest(n)];
            case 1:
              r = l.sent(), i = {
                method: kn.GetToken,
                request: r
              }, l.label = 2;
            case 2:
              return l.trys.push([2, 4, , 5]), [4, this.nativeMessageHandler.sendMessage(i)];
            case 3:
              return o = l.sent(), this.validateNativeResponse(o), [3, 5];
            case 4:
              if (a = l.sent(), a instanceof un && a.isFatal())
                throw a;
              return [3, 5];
            case 5:
              return this.browserStorage.setTemporaryCache(oe.NATIVE_REQUEST, JSON.stringify(r), !0), s = {
                apiId: ye.acquireTokenRedirect,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: !1
              }, c = this.config.auth.navigateToLoginRequestUrl ? window.location.href : this.getRedirectUri(n.redirectUri), [4, this.navigationClient.navigateExternal(c, s)];
            case 6:
              return l.sent(), [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.handleRedirectPromise = function() {
      return S(this, void 0, void 0, function() {
        var n, r, i, o, a, s, c, l;
        return w(this, function(u) {
          switch (u.label) {
            case 0:
              if (this.logger.trace("NativeInteractionClient - handleRedirectPromise called."), !this.browserStorage.isInteractionInProgress(!0))
                return this.logger.info("handleRedirectPromise called but there is no interaction in progress, returning null."), [2, null];
              if (n = this.browserStorage.getCachedNativeRequest(), !n)
                return this.logger.verbose("NativeInteractionClient - handleRedirectPromise called but there is no cached request, returning null."), [2, null];
              r = n.prompt, i = op(n, ["prompt"]), r && this.logger.verbose("NativeInteractionClient - handleRedirectPromise called and prompt was included in the original request, removing prompt from cached request to prevent second interaction with native broker window."), this.browserStorage.removeItem(this.browserStorage.generateCacheKey(oe.NATIVE_REQUEST)), o = {
                method: kn.GetToken,
                request: i
              }, a = Bt.nowSeconds(), u.label = 1;
            case 1:
              return u.trys.push([1, 3, , 4]), this.logger.verbose("NativeInteractionClient - handleRedirectPromise sending message to native broker."), [4, this.nativeMessageHandler.sendMessage(o)];
            case 2:
              return s = u.sent(), this.validateNativeResponse(s), c = this.handleNativeResponse(s, i, a), this.browserStorage.setInteractionInProgress(!1), [2, c];
            case 3:
              throw l = u.sent(), this.browserStorage.setInteractionInProgress(!1), l;
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.logout = function() {
      return this.logger.trace("NativeInteractionClient - logout called."), Promise.reject("Logout not implemented yet");
    }, e.prototype.handleNativeResponse = function(n, r, i) {
      return S(this, void 0, void 0, function() {
        var o, a, s, c, l, u;
        return w(this, function(d) {
          switch (d.label) {
            case 0:
              if (this.logger.trace("NativeInteractionClient - handleNativeResponse called."), n.account.id !== r.accountId)
                throw un.createUserSwitchError();
              return [4, this.getDiscoveredAuthority(r.authority)];
            case 1:
              return o = d.sent(), a = o.getPreferredCache(), s = this.createIdTokenObj(n), c = this.createHomeAccountIdentifier(n, s), l = this.createAccountEntity(n, c, s, a), [4, this.generateAuthenticationResult(n, r, s, l, o.canonicalAuthority, i)];
            case 2:
              return u = d.sent(), this.cacheAccount(l), this.cacheNativeTokens(n, r, c, l, s, u.accessToken, u.tenantId, i), [2, u];
          }
        });
      });
    }, e.prototype.createIdTokenObj = function(n) {
      return new mn(n.id_token || y.EMPTY_STRING, this.browserCrypto);
    }, e.prototype.createHomeAccountIdentifier = function(n, r) {
      var i = We.generateHomeAccountId(n.client_info || y.EMPTY_STRING, lt.Default, this.logger, this.browserCrypto, r);
      return i;
    }, e.prototype.createAccountEntity = function(n, r, i, o) {
      return We.createAccount(n.client_info, r, i, void 0, void 0, void 0, o, n.account.id);
    }, e.prototype.generateScopes = function(n, r) {
      return n.scope ? it.fromString(n.scope) : it.fromString(r.scope);
    }, e.prototype.generatePopAccessToken = function(n, r) {
      return S(this, void 0, void 0, function() {
        var i, o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              if (r.tokenType !== ue.POP)
                return [3, 2];
              if (n.shr)
                return this.logger.trace("handleNativeServerResponse: SHR is enabled in native layer"), [2, n.shr];
              if (i = new Gi(this.browserCrypto), o = {
                resourceRequestMethod: r.resourceRequestMethod,
                resourceRequestUri: r.resourceRequestUri,
                shrClaims: r.shrClaims,
                shrNonce: r.shrNonce
              }, !r.keyId)
                throw L.createKeyIdMissingError();
              return [4, i.signPopToken(n.access_token, r.keyId, o)];
            case 1:
              return [2, a.sent()];
            case 2:
              return [2, n.access_token];
          }
        });
      });
    }, e.prototype.generateAuthenticationResult = function(n, r, i, o, a, s) {
      return S(this, void 0, void 0, function() {
        var c, l, u, d, h, f, m, E;
        return w(this, function(N) {
          switch (N.label) {
            case 0:
              return c = this.addTelemetryFromNativeResponse(n), l = n.scope ? it.fromString(n.scope) : it.fromString(r.scope), u = n.account.properties || {}, d = u.UID || i.claims.oid || i.claims.sub || y.EMPTY_STRING, h = u.TenantId || i.claims.tid || y.EMPTY_STRING, [4, this.generatePopAccessToken(n, r)];
            case 1:
              return f = N.sent(), m = r.tokenType === ue.POP ? ue.POP : ue.BEARER, E = {
                authority: a,
                uniqueId: d,
                tenantId: h,
                scopes: l.asArray(),
                account: o.getAccountInfo(),
                idToken: n.id_token,
                idTokenClaims: i.claims,
                accessToken: f,
                fromCache: c ? this.isResponseFromCache(c) : !1,
                expiresOn: new Date(Number(s + n.expires_in) * 1e3),
                tokenType: m,
                correlationId: this.correlationId,
                state: n.state,
                fromNativeBroker: !0
              }, [2, E];
          }
        });
      });
    }, e.prototype.cacheAccount = function(n) {
      var r = this;
      this.browserStorage.setAccount(n), this.browserStorage.removeAccountContext(n).catch(function(i) {
        r.logger.error("Error occurred while removing account context from browser storage. " + i);
      });
    }, e.prototype.cacheNativeTokens = function(n, r, i, o, a, s, c, l) {
      var u = br.createIdTokenEntity(i, r.authority, n.id_token || y.EMPTY_STRING, r.clientId, a.claims.tid || y.EMPTY_STRING), d = r.tokenType === ue.POP ? y.SHR_NONCE_VALIDITY : (typeof n.expires_in == "string" ? parseInt(n.expires_in, 10) : n.expires_in) || 0, h = l + d, f = this.generateScopes(n, r), m = Rr.createAccessTokenEntity(i, r.authority, s, r.clientId, a ? a.claims.tid || y.EMPTY_STRING : c, f.printScopes(), h, 0, this.browserCrypto), E = new Vo(o, u, m);
      this.nativeStorageManager.saveCacheRecord(E);
    }, e.prototype.addTelemetryFromNativeResponse = function(n) {
      var r = this.getMATSFromResponse(n);
      return r ? (this.performanceClient.addStaticFields({
        extensionId: this.nativeMessageHandler.getExtensionId(),
        extensionVersion: this.nativeMessageHandler.getExtensionVersion(),
        matsBrokerVersion: r.broker_version,
        matsAccountJoinOnStart: r.account_join_on_start,
        matsAccountJoinOnEnd: r.account_join_on_end,
        matsDeviceJoin: r.device_join,
        matsPromptBehavior: r.prompt_behavior,
        matsApiErrorCode: r.api_error_code,
        matsUiVisible: r.ui_visible,
        matsSilentCode: r.silent_code,
        matsSilentBiSubCode: r.silent_bi_sub_code,
        matsSilentMessage: r.silent_message,
        matsSilentStatus: r.silent_status,
        matsHttpStatus: r.http_status,
        matsHttpEventCount: r.http_event_count
      }, this.correlationId), r) : null;
    }, e.prototype.validateNativeResponse = function(n) {
      if (n.hasOwnProperty("access_token") && n.hasOwnProperty("id_token") && n.hasOwnProperty("client_info") && n.hasOwnProperty("account") && n.hasOwnProperty("scope") && n.hasOwnProperty("expires_in"))
        return n;
      throw un.createUnexpectedError("Response missing expected properties.");
    }, e.prototype.getMATSFromResponse = function(n) {
      if (n.properties.MATS)
        try {
          return JSON.parse(n.properties.MATS);
        } catch {
          this.logger.error("NativeInteractionClient - Error parsing MATS telemetry, returning null instead");
        }
      return null;
    }, e.prototype.isResponseFromCache = function(n) {
      return typeof n.is_cached > "u" ? (this.logger.verbose("NativeInteractionClient - MATS telemetry does not contain field indicating if response was served from cache. Returning false."), !1) : !!n.is_cached;
    }, e.prototype.initializeNativeRequest = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l, u, d, h, f = this;
        return w(this, function(m) {
          switch (m.label) {
            case 0:
              return this.logger.trace("NativeInteractionClient - initializeNativeRequest called"), r = n.authority || this.config.auth.authority, n.account ? [4, this.validateRequestAuthority(r, n.account)] : [3, 2];
            case 1:
              m.sent(), m.label = 2;
            case 2:
              return i = new ie(r), i.validateAsUri(), o = n.scopes, a = op(n, ["scopes"]), s = new it(o || []), s.appendScopes(Aa), c = function() {
                switch (f.apiId) {
                  case ye.ssoSilent:
                  case ye.acquireTokenSilent_silentFlow:
                    return f.logger.trace("initializeNativeRequest: silent request sets prompt to none"), st.NONE;
                }
                if (!n.prompt) {
                  f.logger.trace("initializeNativeRequest: prompt was not provided");
                  return;
                }
                switch (n.prompt) {
                  case st.NONE:
                  case st.CONSENT:
                  case st.LOGIN:
                    return f.logger.trace("initializeNativeRequest: prompt is compatible with native flow"), n.prompt;
                  default:
                    throw f.logger.trace("initializeNativeRequest: prompt = " + n.prompt + " is not compatible with native flow"), M.createNativePromptParameterNotSupportedError();
                }
              }, l = B(B({}, a), {
                accountId: this.accountId,
                clientId: this.config.auth.clientId,
                authority: i.urlString,
                scope: s.printScopes(),
                redirectUri: this.getRedirectUri(n.redirectUri),
                prompt: c(),
                correlationId: this.correlationId,
                tokenType: n.authenticationScheme,
                windowTitleSubstring: document.title,
                extraParameters: B(B(B({}, n.extraQueryParameters), n.tokenQueryParameters), { telemetry: Ao.MATS_TELEMETRY }),
                extendedExpiryToken: !1
                // Make this configurable?
              }), n.authenticationScheme !== ue.POP ? [3, 4] : (u = {
                resourceRequestUri: n.resourceRequestUri,
                resourceRequestMethod: n.resourceRequestMethod,
                shrClaims: n.shrClaims,
                shrNonce: n.shrNonce
              }, d = new Gi(this.browserCrypto), [4, d.generateCnf(u)]);
            case 3:
              h = m.sent(), l.reqCnf = h.reqCnfString, l.keyId = h.kid, m.label = 4;
            case 4:
              return [2, l];
          }
        });
      });
    }, e;
  }(oy)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var kr = (
  /** @class */
  function() {
    function t(e, n, r, i) {
      this.logger = e, this.handshakeTimeoutMs = n, this.extensionId = i, this.resolvers = /* @__PURE__ */ new Map(), this.handshakeResolvers = /* @__PURE__ */ new Map(), this.responseId = 0, this.messageChannel = new MessageChannel(), this.windowListener = this.onWindowMessage.bind(this), this.performanceClient = r, this.handshakeEvent = r.startMeasurement(_.NativeMessageHandlerHandshake);
    }
    return t.prototype.sendMessage = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r = this;
        return w(this, function(i) {
          return this.logger.trace("NativeMessageHandler - sendMessage called."), n = {
            channel: Ao.CHANNEL_ID,
            extensionId: this.extensionId,
            responseId: this.responseId++,
            body: e
          }, this.logger.trace("NativeMessageHandler - Sending request to browser extension"), this.logger.tracePii("NativeMessageHandler - Sending request to browser extension: " + JSON.stringify(n)), this.messageChannel.port1.postMessage(n), [2, new Promise(function(o, a) {
            r.resolvers.set(n.responseId, { resolve: o, reject: a });
          })];
        });
      });
    }, t.createProvider = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        var i, o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              e.trace("NativeMessageHandler - createProvider called."), a.label = 1;
            case 1:
              return a.trys.push([1, 3, , 5]), i = new t(e, n, r, Ao.PREFERRED_EXTENSION_ID), [4, i.sendHandshakeRequest()];
            case 2:
              return a.sent(), [2, i];
            case 3:
              return a.sent(), o = new t(e, n, r), [4, o.sendHandshakeRequest()];
            case 4:
              return a.sent(), [2, o];
            case 5:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.sendHandshakeRequest = function() {
      return S(this, void 0, void 0, function() {
        var e, n = this;
        return w(this, function(r) {
          return this.logger.trace("NativeMessageHandler - sendHandshakeRequest called."), window.addEventListener("message", this.windowListener, !1), e = {
            channel: Ao.CHANNEL_ID,
            extensionId: this.extensionId,
            responseId: this.responseId++,
            body: {
              method: kn.HandshakeRequest
            }
          }, this.handshakeEvent.addStaticFields({
            extensionId: this.extensionId,
            extensionHandshakeTimeoutMs: this.handshakeTimeoutMs
          }), this.messageChannel.port1.onmessage = function(i) {
            n.onChannelMessage(i);
          }, window.postMessage(e, window.origin, [this.messageChannel.port2]), [2, new Promise(function(i, o) {
            n.handshakeResolvers.set(e.responseId, { resolve: i, reject: o }), n.timeoutId = window.setTimeout(function() {
              window.removeEventListener("message", n.windowListener, !1), n.messageChannel.port1.close(), n.messageChannel.port2.close(), n.handshakeEvent.endMeasurement({ extensionHandshakeTimedOut: !0, success: !1 }), o(M.createNativeHandshakeTimeoutError()), n.handshakeResolvers.delete(e.responseId);
            }, n.handshakeTimeoutMs);
          })];
        });
      });
    }, t.prototype.onWindowMessage = function(e) {
      if (this.logger.trace("NativeMessageHandler - onWindowMessage called"), e.source === window) {
        var n = e.data;
        if (!(!n.channel || n.channel !== Ao.CHANNEL_ID) && !(n.extensionId && n.extensionId !== this.extensionId) && n.body.method === kn.HandshakeRequest) {
          this.logger.verbose(n.extensionId ? "Extension with id: " + n.extensionId + " not installed" : "No extension installed"), clearTimeout(this.timeoutId), this.messageChannel.port1.close(), this.messageChannel.port2.close(), window.removeEventListener("message", this.windowListener, !1);
          var r = this.handshakeResolvers.get(n.responseId);
          r && (this.handshakeEvent.endMeasurement({ success: !1, extensionInstalled: !1 }), r.reject(M.createNativeExtensionNotInstalledError()));
        }
      }
    }, t.prototype.onChannelMessage = function(e) {
      this.logger.trace("NativeMessageHandler - onChannelMessage called.");
      var n = e.data, r = this.resolvers.get(n.responseId), i = this.handshakeResolvers.get(n.responseId);
      try {
        var o = n.body.method;
        if (o === kn.Response) {
          if (!r)
            return;
          var a = n.body.response;
          if (this.logger.trace("NativeMessageHandler - Received response from browser extension"), this.logger.tracePii("NativeMessageHandler - Received response from browser extension: " + JSON.stringify(a)), a.status !== "Success")
            r.reject(un.createError(a.code, a.description, a.ext));
          else if (a.result)
            a.result.code && a.result.description ? r.reject(un.createError(a.result.code, a.result.description, a.result.ext)) : r.resolve(a.result);
          else
            throw K.createUnexpectedError("Event does not contain result.");
          this.resolvers.delete(n.responseId);
        } else if (o === kn.HandshakeResponse) {
          if (!i)
            return;
          clearTimeout(this.timeoutId), window.removeEventListener("message", this.windowListener, !1), this.extensionId = n.extensionId, this.extensionVersion = n.body.version, this.logger.verbose("NativeMessageHandler - Received HandshakeResponse from extension: " + this.extensionId), this.handshakeEvent.endMeasurement({ extensionInstalled: !0, success: !0 }), i.resolve(), this.handshakeResolvers.delete(n.responseId);
        }
      } catch (s) {
        this.logger.error("Error parsing response from WAM Extension"), this.logger.errorPii("Error parsing response from WAM Extension: " + s.toString()), this.logger.errorPii("Unable to parse " + e), r ? r.reject(s) : i && i.reject(s);
      }
    }, t.prototype.getExtensionId = function() {
      return this.extensionId;
    }, t.prototype.getExtensionVersion = function() {
      return this.extensionVersion;
    }, t.isNativeAvailable = function(e, n, r, i) {
      if (n.trace("isNativeAvailable called"), !e.system.allowNativeBroker)
        return n.trace("isNativeAvailable: allowNativeBroker is not enabled, returning false"), !1;
      if (!r)
        return n.trace("isNativeAvailable: WAM extension provider is not initialized, returning false"), !1;
      if (i)
        switch (i) {
          case ue.BEARER:
          case ue.POP:
            return n.trace("isNativeAvailable: authenticationScheme is supported, returning true"), !0;
          default:
            return n.trace("isNativeAvailable: authenticationScheme is not supported, returning false"), !1;
        }
      return !0;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var sA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s, c, l, u, d) {
      var h = t.call(this, n, r, i, o, a, s, c, u, d) || this;
      return h.nativeStorage = l, h;
    }
    return e.prototype.acquireToken = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l, u, d, h = this;
        return w(this, function(f) {
          switch (f.label) {
            case 0:
              return this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationRequest, n.correlationId), [4, this.initializeAuthorizationRequest(n, x.Redirect)];
            case 1:
              r = f.sent(), this.browserStorage.updateCacheEntries(r.state, r.nonce, r.authority, r.loginHint || y.EMPTY_STRING, r.account || null), i = this.initializeServerTelemetryManager(ye.acquireTokenRedirect), o = function(m) {
                m.persisted && (h.logger.verbose("Page was restored from back/forward cache. Clearing temporary cache."), h.browserStorage.cleanRequestByState(r.state), h.eventHandler.emitEvent(Q.RESTORE_FROM_BFCACHE, x.Redirect));
              }, f.label = 2;
            case 2:
              return f.trys.push([2, 7, , 8]), this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationCodeRequest, n.correlationId), [4, this.initializeAuthorizationCodeRequest(r)];
            case 3:
              return a = f.sent(), this.performanceClient.setPreQueueTime(_.StandardInteractionClientCreateAuthCodeClient, n.correlationId), [4, this.createAuthCodeClient(i, r.authority, r.azureCloudOptions)];
            case 4:
              return s = f.sent(), this.logger.verbose("Auth code client created"), c = new Ep(s, this.browserStorage, a, this.logger, this.browserCrypto, this.performanceClient), [4, s.getAuthCodeUrl(B(B({}, r), { nativeBroker: kr.isNativeAvailable(this.config, this.logger, this.nativeMessageHandler, n.authenticationScheme) }))];
            case 5:
              return l = f.sent(), u = this.getRedirectStartPage(n.redirectStartPage), this.logger.verbosePii("Redirect start page: " + u), window.addEventListener("pageshow", o), [4, c.initiateAuthRequest(l, {
                navigationClient: this.navigationClient,
                redirectTimeout: this.config.system.redirectNavigationTimeout,
                redirectStartPage: u,
                onRedirectNavigate: n.onRedirectNavigate
              })];
            case 6:
              return [2, f.sent()];
            case 7:
              throw d = f.sent(), d instanceof K && d.setCorrelationId(this.correlationId), window.removeEventListener("pageshow", o), i.cacheFailedRequest(d), this.browserStorage.cleanRequestByState(r.state), d;
            case 8:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.handleRedirectPromise = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l, u, d, h, f, m;
        return w(this, function(E) {
          switch (E.label) {
            case 0:
              r = this.initializeServerTelemetryManager(ye.handleRedirectPromise), E.label = 1;
            case 1:
              if (E.trys.push([1, 10, , 11]), !this.browserStorage.isInteractionInProgress(!0))
                return this.logger.info("handleRedirectPromise called but there is no interaction in progress, returning null."), [2, null];
              if (i = this.getRedirectResponseHash(n || window.location.hash), !i)
                return this.logger.info("handleRedirectPromise did not detect a response hash as a result of a redirect. Cleaning temporary cache."), this.browserStorage.cleanRequestByInteractionType(x.Redirect), [2, null];
              o = void 0;
              try {
                a = ie.getDeserializedHash(i), o = this.validateAndExtractStateFromHash(a, x.Redirect), this.logger.verbose("State extracted from hash");
              } catch (N) {
                return this.logger.info("handleRedirectPromise was unable to extract state due to: " + N), this.browserStorage.cleanRequestByInteractionType(x.Redirect), [2, null];
              }
              return s = this.browserStorage.getTemporaryCache(oe.ORIGIN_URI, !0) || y.EMPTY_STRING, c = ie.removeHashFromUrl(s), l = ie.removeHashFromUrl(window.location.href), c === l && this.config.auth.navigateToLoginRequestUrl ? (this.logger.verbose("Current page is loginRequestUrl, handling hash"), [4, this.handleHash(i, o, r)]) : [3, 3];
            case 2:
              return u = E.sent(), s.indexOf("#") > -1 && Ne.replaceHash(s), [2, u];
            case 3:
              return this.config.auth.navigateToLoginRequestUrl ? [3, 4] : (this.logger.verbose("NavigateToLoginRequestUrl set to false, handling hash"), [2, this.handleHash(i, o, r)]);
            case 4:
              return !Ne.isInIframe() || this.config.system.allowRedirectInIframe ? (this.browserStorage.setTemporaryCache(oe.URL_HASH, i, !0), d = {
                apiId: ye.handleRedirectPromise,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: !0
              }, h = !0, !s || s === "null" ? (f = Ne.getHomepage(), this.browserStorage.setTemporaryCache(oe.ORIGIN_URI, f, !0), this.logger.warning("Unable to get valid login request url from cache, redirecting to home page"), [4, this.navigationClient.navigateInternal(f, d)]) : [3, 6]) : [3, 9];
            case 5:
              return h = E.sent(), [3, 8];
            case 6:
              return this.logger.verbose("Navigating to loginRequestUrl: " + s), [4, this.navigationClient.navigateInternal(s, d)];
            case 7:
              h = E.sent(), E.label = 8;
            case 8:
              if (!h)
                return [2, this.handleHash(i, o, r)];
              E.label = 9;
            case 9:
              return [2, null];
            case 10:
              throw m = E.sent(), m instanceof K && m.setCorrelationId(this.correlationId), r.cacheFailedRequest(m), this.browserStorage.cleanRequestByInteractionType(x.Redirect), m;
            case 11:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.getRedirectResponseHash = function(n) {
      this.logger.verbose("getRedirectResponseHash called");
      var r = ie.hashContainsKnownProperties(n);
      if (r)
        return Ne.clearHash(window), this.logger.verbose("Hash contains known properties, returning response hash"), n;
      var i = this.browserStorage.getTemporaryCache(oe.URL_HASH, !0);
      return this.browserStorage.removeItem(this.browserStorage.generateCacheKey(oe.URL_HASH)), this.logger.verbose("Hash does not contain known properties, returning cached hash"), i;
    }, e.prototype.handleHash = function(n, r, i) {
      return S(this, void 0, void 0, function() {
        var o, a, s, c, l, u, d, h = this;
        return w(this, function(f) {
          switch (f.label) {
            case 0:
              if (o = this.browserStorage.getCachedRequest(r, this.browserCrypto), this.logger.verbose("handleHash called, retrieved cached request"), a = ie.getDeserializedHash(n), a.accountId) {
                if (this.logger.verbose("Account id found in hash, calling WAM for token"), !this.nativeMessageHandler)
                  throw M.createNativeConnectionNotEstablishedError();
                return s = new ki(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ye.acquireTokenPopup, this.performanceClient, this.nativeMessageHandler, a.accountId, this.nativeStorage, o.correlationId), c = Hn.parseRequestState(this.browserCrypto, r).userRequestState, [2, s.acquireToken(B(B({}, o), {
                  state: c,
                  prompt: void 0
                  // Server should handle the prompt, ideally native broker can do this part silently
                })).finally(function() {
                  h.browserStorage.cleanRequestByState(r);
                })];
              }
              if (l = this.browserStorage.getCachedAuthority(r), !l)
                throw M.createNoCachedAuthorityError();
              return this.performanceClient.setPreQueueTime(_.StandardInteractionClientCreateAuthCodeClient, o.correlationId), [4, this.createAuthCodeClient(i, l)];
            case 1:
              return u = f.sent(), this.logger.verbose("Auth code client created"), cc.removeThrottle(this.browserStorage, this.config.auth.clientId, o), d = new Ep(u, this.browserStorage, o, this.logger, this.browserCrypto, this.performanceClient), [4, d.handleCodeResponseFromHash(n, r, u.authority, this.networkClient)];
            case 2:
              return [2, f.sent()];
          }
        });
      });
    }, e.prototype.logout = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l;
        return w(this, function(u) {
          switch (u.label) {
            case 0:
              this.logger.verbose("logoutRedirect called"), r = this.initializeLogoutRequest(n), i = this.initializeServerTelemetryManager(ye.logout), u.label = 1;
            case 1:
              return u.trys.push([1, 10, , 11]), this.eventHandler.emitEvent(Q.LOGOUT_START, x.Redirect, n), [4, this.clearCacheOnLogout(r.account)];
            case 2:
              return u.sent(), o = {
                apiId: ye.logout,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: !1
              }, this.performanceClient.setPreQueueTime(_.StandardInteractionClientCreateAuthCodeClient, r.correlationId), [4, this.createAuthCodeClient(i, n && n.authority)];
            case 3:
              return a = u.sent(), this.logger.verbose("Auth code client created"), s = a.getLogoutUri(r), this.eventHandler.emitEvent(Q.LOGOUT_SUCCESS, x.Redirect, r), n && typeof n.onRedirectNavigate == "function" ? (c = n.onRedirectNavigate(s), c === !1 ? [3, 5] : (this.logger.verbose("Logout onRedirectNavigate did not return false, navigating"), this.browserStorage.getInteractionInProgress() || this.browserStorage.setInteractionInProgress(!0), [4, this.navigationClient.navigateExternal(s, o)])) : [3, 7];
            case 4:
              return u.sent(), [
                2
                /*return*/
              ];
            case 5:
              this.browserStorage.setInteractionInProgress(!1), this.logger.verbose("Logout onRedirectNavigate returned false, stopping navigation"), u.label = 6;
            case 6:
              return [3, 9];
            case 7:
              return this.browserStorage.getInteractionInProgress() || this.browserStorage.setInteractionInProgress(!0), [4, this.navigationClient.navigateExternal(s, o)];
            case 8:
              return u.sent(), [
                2
                /*return*/
              ];
            case 9:
              return [3, 11];
            case 10:
              throw l = u.sent(), l instanceof K && l.setCorrelationId(this.correlationId), i.cacheFailedRequest(l), this.eventHandler.emitEvent(Q.LOGOUT_FAILURE, x.Redirect, null, l), this.eventHandler.emitEvent(Q.LOGOUT_END, x.Redirect), l;
            case 11:
              return this.eventHandler.emitEvent(Q.LOGOUT_END, x.Redirect), [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.getRedirectStartPage = function(n) {
      var r = n || window.location.href;
      return ie.getAbsoluteUrl(r, Ne.getCurrentUri());
    }, e;
  }(ro)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var cA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s, c, l, u, d) {
      var h = t.call(this, n, r, i, o, a, s, c, u, d) || this;
      return h.unloadWindow = h.unloadWindow.bind(h), h.nativeStorage = l, h;
    }
    return e.prototype.acquireToken = function(n) {
      try {
        var r = this.generatePopupName(n.scopes || Aa, n.authority || this.config.auth.authority), i = n.popupWindowAttributes || {};
        if (this.config.system.asyncPopups)
          return this.logger.verbose("asyncPopups set to true, acquiring token"), this.acquireTokenPopupAsync(n, r, i);
        this.logger.verbose("asyncPopup set to false, opening popup before acquiring token");
        var o = this.openSizedPopup("about:blank", r, i);
        return this.acquireTokenPopupAsync(n, r, i, o);
      } catch (a) {
        return Promise.reject(a);
      }
    }, e.prototype.logout = function(n) {
      try {
        this.logger.verbose("logoutPopup called");
        var r = this.initializeLogoutRequest(n), i = this.generateLogoutPopupName(r), o = n && n.authority, a = n && n.mainWindowRedirectUri, s = (n == null ? void 0 : n.popupWindowAttributes) || {};
        if (this.config.system.asyncPopups)
          return this.logger.verbose("asyncPopups set to true"), this.logoutPopupAsync(r, i, s, o, void 0, a);
        this.logger.verbose("asyncPopup set to false, opening popup");
        var c = this.openSizedPopup("about:blank", i, s);
        return this.logoutPopupAsync(r, i, s, o, c, a);
      } catch (l) {
        return Promise.reject(l);
      }
    }, e.prototype.acquireTokenPopupAsync = function(n, r, i, o) {
      return S(this, void 0, void 0, function() {
        var a, s, c, l, u, d, h, f, m, E, N, g, p, v, C, k, D, z = this;
        return w(this, function(H) {
          switch (H.label) {
            case 0:
              return this.logger.verbose("acquireTokenPopupAsync called"), a = this.initializeServerTelemetryManager(ye.acquireTokenPopup), this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationRequest, n.correlationId), [4, this.initializeAuthorizationRequest(n, x.Popup)];
            case 1:
              s = H.sent(), this.browserStorage.updateCacheEntries(s.state, s.nonce, s.authority, s.loginHint || y.EMPTY_STRING, s.account || null), H.label = 2;
            case 2:
              return H.trys.push([2, 8, , 9]), this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationCodeRequest, n.correlationId), [4, this.initializeAuthorizationCodeRequest(s)];
            case 3:
              return c = H.sent(), this.performanceClient.setPreQueueTime(_.StandardInteractionClientCreateAuthCodeClient, n.correlationId), [4, this.createAuthCodeClient(a, s.authority, s.azureCloudOptions)];
            case 4:
              return l = H.sent(), this.logger.verbose("Auth code client created"), u = kr.isNativeAvailable(this.config, this.logger, this.nativeMessageHandler, n.authenticationScheme), d = void 0, u && (d = this.performanceClient.startMeasurement(_.FetchAccountIdWithNativeBroker, n.correlationId)), [4, l.getAuthCodeUrl(B(B({}, s), { nativeBroker: u }))];
            case 5:
              return h = H.sent(), f = new sh(l, this.browserStorage, c, this.logger, this.performanceClient), m = {
                popup: o,
                popupName: r,
                popupWindowAttributes: i
              }, E = this.initiateAuthRequest(h, m), this.eventHandler.emitEvent(Q.POPUP_OPENED, x.Popup, { popupWindow: E }, null), [4, this.monitorPopupForHash(E)];
            case 6:
              if (N = H.sent(), g = ie.getDeserializedHash(N), p = this.validateAndExtractStateFromHash(g, x.Popup, s.correlationId), cc.removeThrottle(this.browserStorage, this.config.auth.clientId, c), g.accountId) {
                if (this.logger.verbose("Account id found in hash, calling WAM for token"), d && d.endMeasurement({
                  success: !0,
                  isNativeBroker: !0
                }), !this.nativeMessageHandler)
                  throw M.createNativeConnectionNotEstablishedError();
                return v = new ki(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ye.acquireTokenPopup, this.performanceClient, this.nativeMessageHandler, g.accountId, this.nativeStorage, s.correlationId), C = Hn.parseRequestState(this.browserCrypto, p).userRequestState, [2, v.acquireToken(B(B({}, s), {
                  state: C,
                  prompt: void 0
                  // Server should handle the prompt, ideally native broker can do this part silently
                })).finally(function() {
                  z.browserStorage.cleanRequestByState(p);
                })];
              }
              return [4, f.handleCodeResponseFromHash(N, p, l.authority, this.networkClient)];
            case 7:
              return k = H.sent(), [2, k];
            case 8:
              throw D = H.sent(), o && o.close(), D instanceof K && D.setCorrelationId(this.correlationId), a.cacheFailedRequest(D), this.browserStorage.cleanRequestByState(s.state), D;
            case 9:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.logoutPopupAsync = function(n, r, i, o, a, s) {
      return S(this, void 0, void 0, function() {
        var c, l, u, d, h, f, m;
        return w(this, function(E) {
          switch (E.label) {
            case 0:
              this.logger.verbose("logoutPopupAsync called"), this.eventHandler.emitEvent(Q.LOGOUT_START, x.Popup, n), c = this.initializeServerTelemetryManager(ye.logoutPopup), E.label = 1;
            case 1:
              return E.trys.push([1, 5, , 6]), [4, this.clearCacheOnLogout(n.account)];
            case 2:
              return E.sent(), this.performanceClient.setPreQueueTime(_.StandardInteractionClientCreateAuthCodeClient, n.correlationId), [4, this.createAuthCodeClient(c, o)];
            case 3:
              return l = E.sent(), this.logger.verbose("Auth code client created"), u = l.getLogoutUri(n), this.eventHandler.emitEvent(Q.LOGOUT_SUCCESS, x.Popup, n), d = this.openPopup(u, { popupName: r, popupWindowAttributes: i, popup: a }), this.eventHandler.emitEvent(Q.POPUP_OPENED, x.Popup, { popupWindow: d }, null), [4, this.waitForLogoutPopup(d)];
            case 4:
              return E.sent(), s ? (h = {
                apiId: ye.logoutPopup,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: !1
              }, f = ie.getAbsoluteUrl(s, Ne.getCurrentUri()), this.logger.verbose("Redirecting main window to url specified in the request"), this.logger.verbosePii("Redirecting main window to: " + f), this.navigationClient.navigateInternal(f, h)) : this.logger.verbose("No main window navigation requested"), [3, 6];
            case 5:
              throw m = E.sent(), a && a.close(), m instanceof K && m.setCorrelationId(this.correlationId), this.browserStorage.setInteractionInProgress(!1), this.eventHandler.emitEvent(Q.LOGOUT_FAILURE, x.Popup, null, m), this.eventHandler.emitEvent(Q.LOGOUT_END, x.Popup), c.cacheFailedRequest(m), m;
            case 6:
              return this.eventHandler.emitEvent(Q.LOGOUT_END, x.Popup), [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.initiateAuthRequest = function(n, r) {
      if (P.isEmpty(n))
        throw this.logger.error("Navigate url is empty"), M.createEmptyNavigationUriError();
      return this.logger.infoPii("Navigate to: " + n), this.openPopup(n, r);
    }, e.prototype.monitorPopupForHash = function(n) {
      var r = this;
      return new Promise(function(i, o) {
        var a = r.config.system.windowHashTimeout / r.config.system.pollIntervalMilliseconds, s = 0;
        r.logger.verbose("PopupHandler.monitorPopupForHash - polling started");
        var c = setInterval(function() {
          if (n.closed) {
            r.logger.error("PopupHandler.monitorPopupForHash - window closed"), r.cleanPopup(), clearInterval(c), o(M.createUserCancelledError());
            return;
          }
          var l = y.EMPTY_STRING, u = y.EMPTY_STRING;
          try {
            l = n.location.href, u = n.location.hash;
          } catch {
          }
          P.isEmpty(l) || l === "about:blank" || (r.logger.verbose("PopupHandler.monitorPopupForHash - popup window is on same origin as caller"), s++, u ? (r.logger.verbose("PopupHandler.monitorPopupForHash - found hash in url"), clearInterval(c), r.cleanPopup(n), ie.hashContainsKnownProperties(u) ? (r.logger.verbose("PopupHandler.monitorPopupForHash - hash contains known properties, returning."), i(u)) : (r.logger.error("PopupHandler.monitorPopupForHash - found hash in url but it does not contain known properties. Check that your router is not changing the hash prematurely."), r.logger.errorPii("PopupHandler.monitorPopupForHash - hash found: " + u), o(M.createHashDoesNotContainKnownPropertiesError()))) : s > a && (r.logger.error("PopupHandler.monitorPopupForHash - unable to find hash in url, timing out"), clearInterval(c), o(M.createMonitorPopupTimeoutError())));
        }, r.config.system.pollIntervalMilliseconds);
      });
    }, e.prototype.waitForLogoutPopup = function(n) {
      var r = this;
      return new Promise(function(i) {
        r.logger.verbose("PopupHandler.waitForLogoutPopup - polling started");
        var o = setInterval(function() {
          n.closed && (r.logger.error("PopupHandler.waitForLogoutPopup - window closed"), r.cleanPopup(), clearInterval(o), i());
          var a = y.EMPTY_STRING;
          try {
            a = n.location.href;
          } catch {
          }
          P.isEmpty(a) || a === "about:blank" || (r.logger.verbose("PopupHandler.waitForLogoutPopup - popup window is on same origin as caller, closing."), clearInterval(o), r.cleanPopup(n), i());
        }, r.config.system.pollIntervalMilliseconds);
      });
    }, e.prototype.openPopup = function(n, r) {
      try {
        var i = void 0;
        if (r.popup ? (i = r.popup, this.logger.verbosePii("Navigating popup window to: " + n), i.location.assign(n)) : typeof r.popup > "u" && (this.logger.verbosePii("Opening popup window to: " + n), i = this.openSizedPopup(n, r.popupName, r.popupWindowAttributes)), !i)
          throw M.createEmptyWindowCreatedError();
        return i.focus && i.focus(), this.currentWindow = i, window.addEventListener("beforeunload", this.unloadWindow), i;
      } catch (o) {
        throw this.logger.error("error opening popup " + o.message), this.browserStorage.setInteractionInProgress(!1), M.createPopupWindowError(o.toString());
      }
    }, e.prototype.openSizedPopup = function(n, r, i) {
      var o, a, s, c, l = window.screenLeft ? window.screenLeft : window.screenX, u = window.screenTop ? window.screenTop : window.screenY, d = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight, f = (o = i.popupSize) === null || o === void 0 ? void 0 : o.width, m = (a = i.popupSize) === null || a === void 0 ? void 0 : a.height, E = (s = i.popupPosition) === null || s === void 0 ? void 0 : s.top, N = (c = i.popupPosition) === null || c === void 0 ? void 0 : c.left;
      return (!f || f < 0 || f > d) && (this.logger.verbose("Default popup window width used. Window width not configured or invalid."), f = Vt.POPUP_WIDTH), (!m || m < 0 || m > h) && (this.logger.verbose("Default popup window height used. Window height not configured or invalid."), m = Vt.POPUP_HEIGHT), (!E || E < 0 || E > h) && (this.logger.verbose("Default popup window top position used. Window top not configured or invalid."), E = Math.max(0, h / 2 - Vt.POPUP_HEIGHT / 2 + u)), (!N || N < 0 || N > d) && (this.logger.verbose("Default popup window left position used. Window left not configured or invalid."), N = Math.max(0, d / 2 - Vt.POPUP_WIDTH / 2 + l)), window.open(n, r, "width=" + f + ", height=" + m + ", top=" + E + ", left=" + N + ", scrollbars=yes");
    }, e.prototype.unloadWindow = function(n) {
      this.browserStorage.cleanRequestByInteractionType(x.Popup), this.currentWindow && this.currentWindow.close(), n.preventDefault();
    }, e.prototype.cleanPopup = function(n) {
      n && n.close(), window.removeEventListener("beforeunload", this.unloadWindow), this.browserStorage.setInteractionInProgress(!1);
    }, e.prototype.generatePopupName = function(n, r) {
      return Vt.POPUP_NAME_PREFIX + "." + this.config.auth.clientId + "." + n.join("-") + "." + r + "." + this.correlationId;
    }, e.prototype.generateLogoutPopupName = function(n) {
      var r = n.account && n.account.homeAccountId;
      return Vt.POPUP_NAME_PREFIX + "." + this.config.auth.clientId + "." + r + "." + this.correlationId;
    }, e;
  }(ro)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var lA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.navigateInternal = function(e, n) {
      return t.defaultNavigateWindow(e, n);
    }, t.prototype.navigateExternal = function(e, n) {
      return t.defaultNavigateWindow(e, n);
    }, t.defaultNavigateWindow = function(e, n) {
      return n.noHistory ? window.location.replace(e) : window.location.assign(e), new Promise(function(r) {
        setTimeout(function() {
          r(!0);
        }, n.timeout);
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var uA = 6e4, ju = 6e3, dA = 3e4, hA = 2e3;
function fA(t, e) {
  var n = t.auth, r = t.cache, i = t.system, o = t.telemetry, a = {
    clientId: y.EMPTY_STRING,
    authority: "" + y.DEFAULT_AUTHORITY,
    knownAuthorities: [],
    cloudDiscoveryMetadata: y.EMPTY_STRING,
    authorityMetadata: y.EMPTY_STRING,
    redirectUri: y.EMPTY_STRING,
    postLogoutRedirectUri: y.EMPTY_STRING,
    navigateToLoginRequestUrl: !0,
    clientCapabilities: [],
    protocolMode: fa.AAD,
    azureCloudOptions: {
      azureCloudInstance: ha.None,
      tenant: y.EMPTY_STRING
    },
    skipAuthorityMetadataCache: !1
  }, s = {
    cacheLocation: Pe.SessionStorage,
    temporaryCacheLocation: Pe.SessionStorage,
    storeAuthStateInCookie: !1,
    secureCookies: !1,
    // Default cache migration to true if cache location is localStorage since entries are preserved across tabs/windows. Migration has little to no benefit in sessionStorage and memoryStorage
    cacheMigrationEnabled: !!(r && r.cacheLocation === Pe.LocalStorage),
    claimsBasedCachingEnabled: !0
  }, c = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loggerCallback: function() {
    },
    logLevel: Ie.Info,
    piiLoggingEnabled: !1
  }, l = B(B({}, Wv), {
    loggerOptions: c,
    networkClient: e ? Ne.getBrowserNetworkClient() : Zw,
    navigationClient: new lA(),
    loadFrameTimeout: 0,
    // If loadFrameTimeout is provided, use that as default.
    windowHashTimeout: (i == null ? void 0 : i.loadFrameTimeout) || uA,
    iframeHashTimeout: (i == null ? void 0 : i.loadFrameTimeout) || ju,
    navigateFrameWait: e && Ne.detectIEOrEdge() ? 500 : 0,
    redirectNavigationTimeout: dA,
    asyncPopups: !1,
    allowRedirectInIframe: !1,
    allowNativeBroker: !1,
    nativeBrokerHandshakeTimeout: (i == null ? void 0 : i.nativeBrokerHandshakeTimeout) || hA,
    pollIntervalMilliseconds: Vt.DEFAULT_POLL_INTERVAL_MS,
    cryptoOptions: {
      useMsrCrypto: !1,
      entropy: void 0
    }
  }), u = B(B({}, i), { loggerOptions: (i == null ? void 0 : i.loggerOptions) || c }), d = {
    application: {
      appName: y.EMPTY_STRING,
      appVersion: y.EMPTY_STRING
    }
  }, h = {
    auth: B(B({}, a), n),
    cache: B(B({}, s), r),
    system: B(B({}, l), u),
    telemetry: B(B({}, d), o)
  };
  return h;
}
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var sy = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s) {
      var c = t.call(this, n, r, i, o, s) || this;
      return c.navigateFrameWait = a.navigateFrameWait, c.pollIntervalMilliseconds = a.pollIntervalMilliseconds, c;
    }
    return e.prototype.initiateAuthRequest = function(n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              if (this.performanceClient.addQueueMeasurement(_.SilentHandlerInitiateAuthRequest, this.authCodeRequest.correlationId), P.isEmpty(n))
                throw this.logger.info("Navigate url is empty"), M.createEmptyNavigationUriError();
              return this.navigateFrameWait ? (this.performanceClient.setPreQueueTime(_.SilentHandlerLoadFrame, this.authCodeRequest.correlationId), [4, this.loadFrame(n)]) : [3, 2];
            case 1:
              return [2, r.sent()];
            case 2:
              return [2, this.loadFrameSync(n)];
          }
        });
      });
    }, e.prototype.monitorIframeForHash = function(n, r) {
      var i = this;
      return this.performanceClient.addQueueMeasurement(_.SilentHandlerMonitorIframeForHash, this.authCodeRequest.correlationId), new Promise(function(o, a) {
        r < ju && i.logger.warning("system.loadFrameTimeout or system.iframeHashTimeout set to lower (" + r + "ms) than the default (" + ju + "ms). This may result in timeouts.");
        var s = window.performance.now(), c = s + r, l = setInterval(function() {
          if (window.performance.now() > c) {
            i.removeHiddenIframe(n), clearInterval(l), a(M.createMonitorIframeTimeoutError());
            return;
          }
          var u = y.EMPTY_STRING, d = n.contentWindow;
          try {
            u = d ? d.location.href : y.EMPTY_STRING;
          } catch {
          }
          if (!P.isEmpty(u)) {
            var h = d ? d.location.hash : y.EMPTY_STRING;
            if (ie.hashContainsKnownProperties(h)) {
              i.removeHiddenIframe(n), clearInterval(l), o(h);
              return;
            }
          }
        }, i.pollIntervalMilliseconds);
      });
    }, e.prototype.loadFrame = function(n) {
      var r = this;
      return this.performanceClient.addQueueMeasurement(_.SilentHandlerLoadFrame, this.authCodeRequest.correlationId), new Promise(function(i, o) {
        var a = r.createHiddenIframe();
        setTimeout(function() {
          if (!a) {
            o("Unable to load iframe");
            return;
          }
          a.src = n, i(a);
        }, r.navigateFrameWait);
      });
    }, e.prototype.loadFrameSync = function(n) {
      var r = this.createHiddenIframe();
      return r.src = n, r;
    }, e.prototype.createHiddenIframe = function() {
      var n = document.createElement("iframe");
      return n.className = "msalSilentIframe", n.style.visibility = "hidden", n.style.position = "absolute", n.style.width = n.style.height = "0", n.style.border = "0", n.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms"), document.getElementsByTagName("body")[0].appendChild(n), n;
    }, e.prototype.removeHiddenIframe = function(n) {
      document.body === n.parentNode && document.body.removeChild(n);
    }, e;
  }(sh)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var pA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s, c, l, u, d, h) {
      var f = t.call(this, n, r, i, o, a, s, l, d, h) || this;
      return f.apiId = c, f.nativeStorage = u, f;
    }
    return e.prototype.acquireToken = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s;
        return w(this, function(c) {
          switch (c.label) {
            case 0:
              if (this.performanceClient.addQueueMeasurement(_.SilentIframeClientAcquireToken, n.correlationId), this.logger.verbose("acquireTokenByIframe called"), r = this.performanceClient.startMeasurement(_.SilentIframeClientAcquireToken, n.correlationId), P.isEmpty(n.loginHint) && P.isEmpty(n.sid) && (!n.account || P.isEmpty(n.account.username)) && this.logger.warning("No user hint provided. The authorization server may need more information to complete this request."), n.prompt && n.prompt !== st.NONE && n.prompt !== st.NO_SESSION)
                throw r.endMeasurement({
                  success: !1
                }), M.createSilentPromptValueError(n.prompt);
              return this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationRequest, n.correlationId), [4, this.initializeAuthorizationRequest(B(B({}, n), { prompt: n.prompt || st.NONE }), x.Silent)];
            case 1:
              i = c.sent(), this.browserStorage.updateCacheEntries(i.state, i.nonce, i.authority, i.loginHint || y.EMPTY_STRING, i.account || null), o = this.initializeServerTelemetryManager(this.apiId), c.label = 2;
            case 2:
              return c.trys.push([2, 5, , 6]), this.performanceClient.setPreQueueTime(_.StandardInteractionClientCreateAuthCodeClient, n.correlationId), [4, this.createAuthCodeClient(o, i.authority, i.azureCloudOptions)];
            case 3:
              return a = c.sent(), this.logger.verbose("Auth code client created"), this.performanceClient.setPreQueueTime(_.SilentIframeClientTokenHelper, n.correlationId), [4, this.silentTokenHelper(a, i).then(function(l) {
                return r.endMeasurement({
                  success: !0,
                  fromCache: !1,
                  requestId: l.requestId
                }), l;
              })];
            case 4:
              return [2, c.sent()];
            case 5:
              throw s = c.sent(), s instanceof K && s.setCorrelationId(this.correlationId), o.cacheFailedRequest(s), this.browserStorage.cleanRequestByState(i.state), r.endMeasurement({
                errorCode: s instanceof K && s.errorCode || void 0,
                subErrorCode: s instanceof K && s.subError || void 0,
                success: !1
              }), s;
            case 6:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.logout = function() {
      return Promise.reject(M.createSilentLogoutUnsupportedError());
    }, e.prototype.silentTokenHelper = function(n, r) {
      return S(this, void 0, void 0, function() {
        var i, o, a, s, c, l, u, d, h, f = this;
        return w(this, function(m) {
          switch (m.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.SilentIframeClientTokenHelper, r.correlationId), this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationCodeRequest, r.correlationId), [4, this.initializeAuthorizationCodeRequest(r)];
            case 1:
              return i = m.sent(), this.performanceClient.setPreQueueTime(_.GetAuthCodeUrl, r.correlationId), [4, n.getAuthCodeUrl(B(B({}, r), { nativeBroker: kr.isNativeAvailable(this.config, this.logger, this.nativeMessageHandler, r.authenticationScheme) }))];
            case 2:
              return o = m.sent(), a = new sy(n, this.browserStorage, i, this.logger, this.config.system, this.performanceClient), this.performanceClient.setPreQueueTime(_.SilentHandlerInitiateAuthRequest, r.correlationId), [4, a.initiateAuthRequest(o)];
            case 3:
              return s = m.sent(), this.performanceClient.setPreQueueTime(_.SilentHandlerMonitorIframeForHash, r.correlationId), [4, a.monitorIframeForHash(s, this.config.system.iframeHashTimeout)];
            case 4:
              if (c = m.sent(), l = ie.getDeserializedHash(c), u = this.validateAndExtractStateFromHash(l, x.Silent, i.correlationId), l.accountId) {
                if (this.logger.verbose("Account id found in hash, calling WAM for token"), !this.nativeMessageHandler)
                  throw M.createNativeConnectionNotEstablishedError();
                return d = new ki(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.apiId, this.performanceClient, this.nativeMessageHandler, l.accountId, this.browserStorage, this.correlationId), h = Hn.parseRequestState(this.browserCrypto, u).userRequestState, [2, d.acquireToken(B(B({}, r), { state: h, prompt: r.prompt || st.NONE })).finally(function() {
                  f.browserStorage.cleanRequestByState(u);
                })];
              }
              return this.performanceClient.setPreQueueTime(_.HandleCodeResponseFromHash, r.correlationId), [2, a.handleCodeResponseFromHash(c, u, n.authority, this.networkClient)];
          }
        });
      });
    }, e;
  }(ro)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var gA = (
  /** @class */
  function(t) {
    et(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.acquireToken = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c = this;
        return w(this, function(l) {
          switch (l.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.SilentRefreshClientAcquireToken, n.correlationId), this.performanceClient.setPreQueueTime(_.InitializeBaseRequest, n.correlationId), i = [B({}, n)], [4, this.initializeBaseRequest(n, n.account)];
            case 1:
              return r = B.apply(void 0, i.concat([l.sent()])), o = this.performanceClient.startMeasurement(_.SilentRefreshClientAcquireToken, r.correlationId), a = this.initializeServerTelemetryManager(ye.acquireTokenSilent_silentFlow), [4, this.createRefreshTokenClient(a, r.authority, r.azureCloudOptions)];
            case 2:
              return s = l.sent(), this.logger.verbose("Refresh token client created"), this.performanceClient.setPreQueueTime(_.RefreshTokenClientAcquireTokenByRefreshToken, n.correlationId), [2, s.acquireTokenByRefreshToken(r).then(function(u) {
                return o.endMeasurement({
                  success: !0,
                  fromCache: u.fromCache,
                  requestId: u.requestId
                }), u;
              }).catch(function(u) {
                throw u instanceof K && u.setCorrelationId(c.correlationId), a.cacheFailedRequest(u), o.endMeasurement({
                  errorCode: u.errorCode,
                  subErrorCode: u.subError,
                  success: !1
                }), u;
              })];
          }
        });
      });
    }, e.prototype.logout = function() {
      return Promise.reject(M.createSilentLogoutUnsupportedError());
    }, e.prototype.createRefreshTokenClient = function(n, r, i) {
      return S(this, void 0, void 0, function() {
        var o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return this.performanceClient.setPreQueueTime(_.StandardInteractionClientGetClientConfiguration, this.correlationId), [4, this.getClientConfiguration(n, r, i)];
            case 1:
              return o = a.sent(), [2, new ty(o, this.performanceClient)];
          }
        });
      });
    }, e;
  }(ro)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var mA = (
  /** @class */
  function() {
    function t(e, n) {
      this.eventCallbacks = /* @__PURE__ */ new Map(), this.logger = e, this.browserCrypto = n, this.listeningToStorageEvents = !1, this.handleAccountCacheChange = this.handleAccountCacheChange.bind(this);
    }
    return t.prototype.addEventCallback = function(e) {
      if (typeof window < "u") {
        var n = this.browserCrypto.createNewGuid();
        return this.eventCallbacks.set(n, e), this.logger.verbose("Event callback registered with id: " + n), n;
      }
      return null;
    }, t.prototype.removeEventCallback = function(e) {
      this.eventCallbacks.delete(e), this.logger.verbose("Event callback " + e + " removed.");
    }, t.prototype.enableAccountStorageEvents = function() {
      typeof window > "u" || (this.listeningToStorageEvents ? this.logger.verbose("Account storage listener already registered.") : (this.logger.verbose("Adding account storage listener."), this.listeningToStorageEvents = !0, window.addEventListener("storage", this.handleAccountCacheChange)));
    }, t.prototype.disableAccountStorageEvents = function() {
      typeof window > "u" || (this.listeningToStorageEvents ? (this.logger.verbose("Removing account storage listener."), window.removeEventListener("storage", this.handleAccountCacheChange), this.listeningToStorageEvents = !1) : this.logger.verbose("No account storage listener registered."));
    }, t.prototype.emitEvent = function(e, n, r, i) {
      var o = this;
      if (typeof window < "u") {
        var a = {
          eventType: e,
          interactionType: n || null,
          payload: r || null,
          error: i || null,
          timestamp: Date.now()
        };
        this.logger.info("Emitting event: " + e), this.eventCallbacks.forEach(function(s, c) {
          o.logger.verbose("Emitting event to callback " + c + ": " + e), s.apply(null, [a]);
        });
      }
    }, t.prototype.handleAccountCacheChange = function(e) {
      try {
        var n = e.newValue || e.oldValue;
        if (!n)
          return;
        var r = JSON.parse(n);
        if (typeof r != "object" || !We.isAccountEntity(r))
          return;
        var i = Et.toObject(new We(), r), o = i.getAccountInfo();
        !e.oldValue && e.newValue ? (this.logger.info("Account was added to cache in a different window"), this.emitEvent(Q.ACCOUNT_ADDED, void 0, o)) : !e.newValue && e.oldValue && (this.logger.info("Account was removed from cache in a different window"), this.emitEvent(Q.ACCOUNT_REMOVED, void 0, o));
      } catch {
        return;
      }
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var nt = (
  /** @class */
  function() {
    function t() {
    }
    return t.decimalToHex = function(e) {
      for (var n = e.toString(16); n.length < 2; )
        n = "0" + n;
      return n;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var cy = (
  /** @class */
  function() {
    function t(e) {
      this.cryptoObj = e;
    }
    return t.prototype.generateGuid = function() {
      try {
        var e = new Uint8Array(16);
        return this.cryptoObj.getRandomValues(e), e[6] |= 64, e[6] &= 79, e[8] |= 128, e[8] &= 191, nt.decimalToHex(e[0]) + nt.decimalToHex(e[1]) + nt.decimalToHex(e[2]) + nt.decimalToHex(e[3]) + "-" + nt.decimalToHex(e[4]) + nt.decimalToHex(e[5]) + "-" + nt.decimalToHex(e[6]) + nt.decimalToHex(e[7]) + "-" + nt.decimalToHex(e[8]) + nt.decimalToHex(e[9]) + "-" + nt.decimalToHex(e[10]) + nt.decimalToHex(e[11]) + nt.decimalToHex(e[12]) + nt.decimalToHex(e[13]) + nt.decimalToHex(e[14]) + nt.decimalToHex(e[15]);
      } catch {
        for (var n = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx", r = "0123456789abcdef", i = 0, o = y.EMPTY_STRING, a = 0; a < 36; a++)
          n[a] !== "-" && n[a] !== "4" && (i = Math.random() * 16 | 0), n[a] === "x" ? o += r[i] : n[a] === "y" ? (i &= 3, i |= 8, o += r[i]) : o += n[a];
        return o;
      }
    }, t.prototype.isGuid = function(e) {
      var n = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return n.test(e);
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Ln = (
  /** @class */
  function() {
    function t() {
    }
    return t.stringToUtf8Arr = function(e) {
      for (var n, r = 0, i = e.length, o = 0; o < i; o++)
        n = e.charCodeAt(o), r += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : n < 2097152 ? 4 : n < 67108864 ? 5 : 6;
      for (var a = new Uint8Array(r), s = 0, c = 0; s < r; c++)
        n = e.charCodeAt(c), n < 128 ? a[s++] = n : n < 2048 ? (a[s++] = 192 + (n >>> 6), a[s++] = 128 + (n & 63)) : n < 65536 ? (a[s++] = 224 + (n >>> 12), a[s++] = 128 + (n >>> 6 & 63), a[s++] = 128 + (n & 63)) : n < 2097152 ? (a[s++] = 240 + (n >>> 18), a[s++] = 128 + (n >>> 12 & 63), a[s++] = 128 + (n >>> 6 & 63), a[s++] = 128 + (n & 63)) : n < 67108864 ? (a[s++] = 248 + (n >>> 24), a[s++] = 128 + (n >>> 18 & 63), a[s++] = 128 + (n >>> 12 & 63), a[s++] = 128 + (n >>> 6 & 63), a[s++] = 128 + (n & 63)) : (a[s++] = 252 + (n >>> 30), a[s++] = 128 + (n >>> 24 & 63), a[s++] = 128 + (n >>> 18 & 63), a[s++] = 128 + (n >>> 12 & 63), a[s++] = 128 + (n >>> 6 & 63), a[s++] = 128 + (n & 63));
      return a;
    }, t.stringToArrayBuffer = function(e) {
      for (var n = new ArrayBuffer(e.length), r = new Uint8Array(n), i = 0; i < e.length; i++)
        r[i] = e.charCodeAt(i);
      return n;
    }, t.utf8ArrToString = function(e) {
      for (var n = y.EMPTY_STRING, r = void 0, i = e.length, o = 0; o < i; o++)
        r = e[o], n += String.fromCharCode(r > 251 && r < 254 && o + 5 < i ? (
          /* six bytes */
          /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
          (r - 252) * 1073741824 + (e[++o] - 128 << 24) + (e[++o] - 128 << 18) + (e[++o] - 128 << 12) + (e[++o] - 128 << 6) + e[++o] - 128
        ) : r > 247 && r < 252 && o + 4 < i ? (
          /* five bytes */
          (r - 248 << 24) + (e[++o] - 128 << 18) + (e[++o] - 128 << 12) + (e[++o] - 128 << 6) + e[++o] - 128
        ) : r > 239 && r < 248 && o + 3 < i ? (
          /* four bytes */
          (r - 240 << 18) + (e[++o] - 128 << 12) + (e[++o] - 128 << 6) + e[++o] - 128
        ) : r > 223 && r < 240 && o + 2 < i ? (
          /* three bytes */
          (r - 224 << 12) + (e[++o] - 128 << 6) + e[++o] - 128
        ) : r > 191 && r < 224 && o + 1 < i ? (
          /* two bytes */
          (r - 192 << 6) + e[++o] - 128
        ) : (
          /* nPart < 127 ? */
          /* one byte */
          r
        ));
      return n;
    }, t.getSortedObjectString = function(e) {
      return JSON.stringify(e, Object.keys(e).sort());
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var ly = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.urlEncode = function(e) {
      return encodeURIComponent(this.encode(e).replace(/=/g, y.EMPTY_STRING).replace(/\+/g, "-").replace(/\//g, "_"));
    }, t.prototype.urlEncodeArr = function(e) {
      return this.base64EncArr(e).replace(/=/g, y.EMPTY_STRING).replace(/\+/g, "-").replace(/\//g, "_");
    }, t.prototype.encode = function(e) {
      var n = Ln.stringToUtf8Arr(e);
      return this.base64EncArr(n);
    }, t.prototype.base64EncArr = function(e) {
      for (var n = (3 - e.length % 3) % 3, r = y.EMPTY_STRING, i = void 0, o = e.length, a = 0, s = 0; s < o; s++)
        i = s % 3, a |= e[s] << (16 >>> i & 24), (i === 2 || e.length - s === 1) && (r += String.fromCharCode(this.uint6ToB64(a >>> 18 & 63), this.uint6ToB64(a >>> 12 & 63), this.uint6ToB64(a >>> 6 & 63), this.uint6ToB64(a & 63)), a = 0);
      return n === 0 ? r : r.substring(0, r.length - n) + (n === 1 ? "=" : "==");
    }, t.prototype.uint6ToB64 = function(e) {
      return e < 26 ? e + 65 : e < 52 ? e + 71 : e < 62 ? e - 4 : e === 62 ? 43 : e === 63 ? 47 : 65;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var vA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.decode = function(e) {
      var n = e.replace(/-/g, "+").replace(/_/g, "/");
      switch (n.length % 4) {
        case 0:
          break;
        case 2:
          n += "==";
          break;
        case 3:
          n += "=";
          break;
        default:
          throw new Error("Invalid base64 string");
      }
      var r = this.base64DecToArr(n);
      return Ln.utf8ArrToString(r);
    }, t.prototype.base64DecToArr = function(e, n) {
      for (var r = e.replace(/[^A-Za-z0-9\+\/]/g, y.EMPTY_STRING), i = r.length, o = n ? Math.ceil((i * 3 + 1 >>> 2) / n) * n : i * 3 + 1 >>> 2, a = new Uint8Array(o), s = void 0, c = void 0, l = 0, u = 0, d = 0; d < i; d++)
        if (c = d & 3, l |= this.b64ToUint6(r.charCodeAt(d)) << 18 - 6 * c, c === 3 || i - d === 1) {
          for (s = 0; s < 3 && u < o; s++, u++)
            a[u] = l >>> (16 >>> s & 24) & 255;
          l = 0;
        }
      return a;
    }, t.prototype.b64ToUint6 = function(e) {
      return e > 64 && e < 91 ? e - 65 : e > 96 && e < 123 ? e - 71 : e > 47 && e < 58 ? e + 4 : e === 43 ? 62 : e === 47 ? 63 : 0;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var yA = 32, EA = (
  /** @class */
  function() {
    function t(e) {
      this.base64Encode = new ly(), this.cryptoObj = e;
    }
    return t.prototype.generateCodes = function() {
      return S(this, void 0, void 0, function() {
        var e, n;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return e = this.generateCodeVerifier(), [4, this.generateCodeChallengeFromVerifier(e)];
            case 1:
              return n = r.sent(), [2, {
                verifier: e,
                challenge: n
              }];
          }
        });
      });
    }, t.prototype.generateCodeVerifier = function() {
      try {
        var e = new Uint8Array(yA);
        this.cryptoObj.getRandomValues(e);
        var n = this.base64Encode.urlEncodeArr(e);
        return n;
      } catch (r) {
        throw M.createPkceNotGeneratedError(r);
      }
    }, t.prototype.generateCodeChallengeFromVerifier = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              return i.trys.push([0, 2, , 3]), [4, this.cryptoObj.sha256Digest(e)];
            case 1:
              return n = i.sent(), [2, this.base64Encode.urlEncodeArr(new Uint8Array(n))];
            case 2:
              throw r = i.sent(), M.createPkceNotGeneratedError(r);
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var _A = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getRandomValues = function(e) {
      return window.crypto.getRandomValues(e);
    }, t.prototype.generateKey = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, window.crypto.subtle.generateKey(e, n, r)];
        });
      });
    }, t.prototype.exportKey = function(e) {
      return S(this, void 0, void 0, function() {
        return w(this, function(n) {
          return [2, window.crypto.subtle.exportKey(Ki, e)];
        });
      });
    }, t.prototype.importKey = function(e, n, r, i) {
      return S(this, void 0, void 0, function() {
        return w(this, function(o) {
          return [2, window.crypto.subtle.importKey(Ki, e, n, r, i)];
        });
      });
    }, t.prototype.sign = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, window.crypto.subtle.sign(e, n, r)];
        });
      });
    }, t.prototype.digest = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, window.crypto.subtle.digest(e, n)];
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var CA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.initPrng = function(e) {
      return window.msrCrypto.initPrng(rh(e));
    }, t.prototype.getRandomValues = function(e) {
      return window.msrCrypto.getRandomValues(e);
    }, t.prototype.generateKey = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, window.msrCrypto.subtle.generateKey(e, n, r)];
        });
      });
    }, t.prototype.exportKey = function(e) {
      return S(this, void 0, void 0, function() {
        return w(this, function(n) {
          return [2, window.msrCrypto.subtle.exportKey(Ki, e)];
        });
      });
    }, t.prototype.importKey = function(e, n, r, i) {
      return S(this, void 0, void 0, function() {
        return w(this, function(o) {
          return [2, window.msrCrypto.subtle.importKey(Ki, e, n, r, i)];
        });
      });
    }, t.prototype.sign = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, window.msrCrypto.subtle.sign(e, n, r)];
        });
      });
    }, t.prototype.digest = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, window.msrCrypto.subtle.digest(e, n)];
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var TA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getRandomValues = function(e) {
      return window.msCrypto.getRandomValues(e);
    }, t.prototype.generateKey = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, new Promise(function(o, a) {
            var s = window.msCrypto.subtle.generateKey(e, n, r);
            s.addEventListener("complete", function(c) {
              o(c.target.result);
            }), s.addEventListener("error", function(c) {
              a(c);
            });
          })];
        });
      });
    }, t.prototype.exportKey = function(e) {
      return S(this, void 0, void 0, function() {
        return w(this, function(n) {
          return [2, new Promise(function(r, i) {
            var o = window.msCrypto.subtle.exportKey(Ki, e);
            o.addEventListener("complete", function(a) {
              var s = a.target.result, c = Ln.utf8ArrToString(new Uint8Array(s)).replace(/\r/g, y.EMPTY_STRING).replace(/\n/g, y.EMPTY_STRING).replace(/\t/g, y.EMPTY_STRING).split(" ").join(y.EMPTY_STRING).replace("\0", y.EMPTY_STRING);
              try {
                r(JSON.parse(c));
              } catch (l) {
                i(l);
              }
            }), o.addEventListener("error", function(a) {
              i(a);
            });
          })];
        });
      });
    }, t.prototype.importKey = function(e, n, r, i) {
      return S(this, void 0, void 0, function() {
        var o, a;
        return w(this, function(s) {
          return o = Ln.getSortedObjectString(e), a = Ln.stringToArrayBuffer(o), [2, new Promise(function(c, l) {
            var u = window.msCrypto.subtle.importKey(Ki, a, n, r, i);
            u.addEventListener("complete", function(d) {
              c(d.target.result);
            }), u.addEventListener("error", function(d) {
              l(d);
            });
          })];
        });
      });
    }, t.prototype.sign = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, new Promise(function(o, a) {
            var s = window.msCrypto.subtle.sign(e, n, r);
            s.addEventListener("complete", function(c) {
              o(c.target.result);
            }), s.addEventListener("error", function(c) {
              a(c);
            });
          })];
        });
      });
    }, t.prototype.digest = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, new Promise(function(i, o) {
            var a = window.msCrypto.subtle.digest(e, n.buffer);
            a.addEventListener("complete", function(s) {
              i(s.target.result);
            }), a.addEventListener("error", function(s) {
              o(s);
            });
          })];
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var SA = "RSASSA-PKCS1-v1_5", _p = "SHA-256", wA = 2048, AA = new Uint8Array([1, 0, 1]), uy = (
  /** @class */
  function() {
    function t(e, n) {
      var r, i;
      if (this.logger = e, this.cryptoOptions = n, this.hasBrowserCrypto())
        this.logger.verbose("BrowserCrypto: modern crypto interface available"), this.subtleCrypto = new _A();
      else if (this.hasIECrypto())
        this.logger.verbose("BrowserCrypto: MS crypto interface available"), this.subtleCrypto = new TA();
      else if (this.hasMsrCrypto() && (!((r = this.cryptoOptions) === null || r === void 0) && r.useMsrCrypto))
        this.logger.verbose("BrowserCrypto: MSR crypto interface available"), this.subtleCrypto = new CA();
      else
        throw this.hasMsrCrypto() && this.logger.info("BrowserCrypto: MSR Crypto interface available but system.cryptoOptions.useMsrCrypto not enabled"), this.logger.error("BrowserCrypto: No crypto interfaces available."), M.createCryptoNotAvailableError("Browser crypto, msCrypto, or msrCrypto interfaces not available.");
      if (this.subtleCrypto.initPrng) {
        if (this.logger.verbose("BrowserCrypto: Interface requires entropy"), !(!((i = this.cryptoOptions) === null || i === void 0) && i.entropy))
          throw this.logger.error("BrowserCrypto: Interface requires entropy but none provided."), fc.createEntropyNotProvided();
        this.logger.verbose("BrowserCrypto: Entropy provided"), this.subtleCrypto.initPrng(this.cryptoOptions.entropy);
      }
      this.keygenAlgorithmOptions = {
        name: SA,
        hash: _p,
        modulusLength: wA,
        publicExponent: AA
      };
    }
    return t.prototype.hasIECrypto = function() {
      return "msCrypto" in window;
    }, t.prototype.hasBrowserCrypto = function() {
      return "crypto" in window;
    }, t.prototype.hasMsrCrypto = function() {
      return "msrCrypto" in window;
    }, t.prototype.sha256Digest = function(e) {
      return S(this, void 0, void 0, function() {
        var n;
        return w(this, function(r) {
          return n = Ln.stringToUtf8Arr(e), [2, this.subtleCrypto.digest({ name: _p }, n)];
        });
      });
    }, t.prototype.getRandomValues = function(e) {
      return this.subtleCrypto.getRandomValues(e);
    }, t.prototype.generateKeyPair = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, this.subtleCrypto.generateKey(this.keygenAlgorithmOptions, e, n)];
        });
      });
    }, t.prototype.exportJwk = function(e) {
      return S(this, void 0, void 0, function() {
        return w(this, function(n) {
          return [2, this.subtleCrypto.exportKey(e)];
        });
      });
    }, t.prototype.importJwk = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          return [2, this.subtleCrypto.importKey(e, this.keygenAlgorithmOptions, n, r)];
        });
      });
    }, t.prototype.sign = function(e, n) {
      return S(this, void 0, void 0, function() {
        return w(this, function(r) {
          return [2, this.subtleCrypto.sign(this.keygenAlgorithmOptions, e, n)];
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var bA = (
  /** @class */
  function() {
    function t() {
      this.dbName = Gu, this.version = nA, this.tableName = rA, this.dbOpen = !1;
    }
    return t.prototype.open = function() {
      return S(this, void 0, void 0, function() {
        var e = this;
        return w(this, function(n) {
          return [2, new Promise(function(r, i) {
            var o = window.indexedDB.open(e.dbName, e.version);
            o.addEventListener("upgradeneeded", function(a) {
              var s = a;
              s.target.result.createObjectStore(e.tableName);
            }), o.addEventListener("success", function(a) {
              var s = a;
              e.db = s.target.result, e.dbOpen = !0, r();
            }), o.addEventListener("error", function() {
              return i(M.createDatabaseUnavailableError());
            });
          })];
        });
      });
    }, t.prototype.closeConnection = function() {
      var e = this.db;
      e && this.dbOpen && (e.close(), this.dbOpen = !1);
    }, t.prototype.validateDbIsOpen = function() {
      return S(this, void 0, void 0, function() {
        return w(this, function(e) {
          switch (e.label) {
            case 0:
              return this.dbOpen ? [3, 2] : [4, this.open()];
            case 1:
              return [2, e.sent()];
            case 2:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.getItem = function(e) {
      return S(this, void 0, void 0, function() {
        var n = this;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, this.validateDbIsOpen()];
            case 1:
              return r.sent(), [2, new Promise(function(i, o) {
                if (!n.db)
                  return o(M.createDatabaseNotOpenError());
                var a = n.db.transaction([n.tableName], "readonly"), s = a.objectStore(n.tableName), c = s.get(e);
                c.addEventListener("success", function(l) {
                  var u = l;
                  n.closeConnection(), i(u.target.result);
                }), c.addEventListener("error", function(l) {
                  n.closeConnection(), o(l);
                });
              })];
          }
        });
      });
    }, t.prototype.setItem = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r = this;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              return [4, this.validateDbIsOpen()];
            case 1:
              return i.sent(), [2, new Promise(function(o, a) {
                if (!r.db)
                  return a(M.createDatabaseNotOpenError());
                var s = r.db.transaction([r.tableName], "readwrite"), c = s.objectStore(r.tableName), l = c.put(n, e);
                l.addEventListener("success", function() {
                  r.closeConnection(), o();
                }), l.addEventListener("error", function(u) {
                  r.closeConnection(), a(u);
                });
              })];
          }
        });
      });
    }, t.prototype.removeItem = function(e) {
      return S(this, void 0, void 0, function() {
        var n = this;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, this.validateDbIsOpen()];
            case 1:
              return r.sent(), [2, new Promise(function(i, o) {
                if (!n.db)
                  return o(M.createDatabaseNotOpenError());
                var a = n.db.transaction([n.tableName], "readwrite"), s = a.objectStore(n.tableName), c = s.delete(e);
                c.addEventListener("success", function() {
                  n.closeConnection(), i();
                }), c.addEventListener("error", function(l) {
                  n.closeConnection(), o(l);
                });
              })];
          }
        });
      });
    }, t.prototype.getKeys = function() {
      return S(this, void 0, void 0, function() {
        var e = this;
        return w(this, function(n) {
          switch (n.label) {
            case 0:
              return [4, this.validateDbIsOpen()];
            case 1:
              return n.sent(), [2, new Promise(function(r, i) {
                if (!e.db)
                  return i(M.createDatabaseNotOpenError());
                var o = e.db.transaction([e.tableName], "readonly"), a = o.objectStore(e.tableName), s = a.getAllKeys();
                s.addEventListener("success", function(c) {
                  var l = c;
                  e.closeConnection(), r(l.target.result);
                }), s.addEventListener("error", function(c) {
                  e.closeConnection(), i(c);
                });
              })];
          }
        });
      });
    }, t.prototype.containsKey = function(e) {
      return S(this, void 0, void 0, function() {
        var n = this;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, this.validateDbIsOpen()];
            case 1:
              return r.sent(), [2, new Promise(function(i, o) {
                if (!n.db)
                  return o(M.createDatabaseNotOpenError());
                var a = n.db.transaction([n.tableName], "readonly"), s = a.objectStore(n.tableName), c = s.count(e);
                c.addEventListener("success", function(l) {
                  var u = l;
                  n.closeConnection(), i(u.target.result === 1);
                }), c.addEventListener("error", function(l) {
                  n.closeConnection(), o(l);
                });
              })];
          }
        });
      });
    }, t.prototype.deleteDatabase = function() {
      return S(this, void 0, void 0, function() {
        return w(this, function(e) {
          return this.db && this.dbOpen && this.closeConnection(), [2, new Promise(function(n, r) {
            var i = window.indexedDB.deleteDatabase(Gu);
            i.addEventListener("success", function() {
              return n(!0);
            }), i.addEventListener("blocked", function() {
              return n(!0);
            }), i.addEventListener("error", function() {
              return r(!1);
            });
          })];
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Cp = (
  /** @class */
  function() {
    function t(e, n) {
      this.inMemoryCache = new Ku(), this.indexedDBCache = new bA(), this.logger = e, this.storeName = n;
    }
    return t.prototype.handleDatabaseAccessError = function(e) {
      if (e instanceof M && e.errorCode === b.databaseUnavailable.code)
        this.logger.error("Could not access persistent storage. This may be caused by browser privacy features which block persistent storage in third-party contexts.");
      else
        throw e;
    }, t.prototype.getItem = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              if (n = this.inMemoryCache.getItem(e), n)
                return [3, 4];
              i.label = 1;
            case 1:
              return i.trys.push([1, 3, , 4]), this.logger.verbose("Queried item not found in in-memory cache, now querying persistent storage."), [4, this.indexedDBCache.getItem(e)];
            case 2:
              return [2, i.sent()];
            case 3:
              return r = i.sent(), this.handleDatabaseAccessError(r), [3, 4];
            case 4:
              return [2, n];
          }
        });
      });
    }, t.prototype.setItem = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              this.inMemoryCache.setItem(e, n), i.label = 1;
            case 1:
              return i.trys.push([1, 3, , 4]), [4, this.indexedDBCache.setItem(e, n)];
            case 2:
              return i.sent(), [3, 4];
            case 3:
              return r = i.sent(), this.handleDatabaseAccessError(r), [3, 4];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.removeItem = function(e) {
      return S(this, void 0, void 0, function() {
        var n;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              this.inMemoryCache.removeItem(e), r.label = 1;
            case 1:
              return r.trys.push([1, 3, , 4]), [4, this.indexedDBCache.removeItem(e)];
            case 2:
              return r.sent(), [3, 4];
            case 3:
              return n = r.sent(), this.handleDatabaseAccessError(n), [3, 4];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.getKeys = function() {
      return S(this, void 0, void 0, function() {
        var e, n;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              if (e = this.inMemoryCache.getKeys(), e.length !== 0)
                return [3, 4];
              r.label = 1;
            case 1:
              return r.trys.push([1, 3, , 4]), this.logger.verbose("In-memory cache is empty, now querying persistent storage."), [4, this.indexedDBCache.getKeys()];
            case 2:
              return [2, r.sent()];
            case 3:
              return n = r.sent(), this.handleDatabaseAccessError(n), [3, 4];
            case 4:
              return [2, e];
          }
        });
      });
    }, t.prototype.containsKey = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              if (n = this.inMemoryCache.containsKey(e), n)
                return [3, 4];
              i.label = 1;
            case 1:
              return i.trys.push([1, 3, , 4]), this.logger.verbose("Key not found in in-memory cache, now querying persistent storage."), [4, this.indexedDBCache.containsKey(e)];
            case 2:
              return [2, i.sent()];
            case 3:
              return r = i.sent(), this.handleDatabaseAccessError(r), [3, 4];
            case 4:
              return [2, n];
          }
        });
      });
    }, t.prototype.clearInMemory = function() {
      this.logger.verbose("Deleting in-memory keystore " + this.storeName), this.inMemoryCache.clear(), this.logger.verbose("In-memory keystore " + this.storeName + " deleted");
    }, t.prototype.clearPersistent = function() {
      return S(this, void 0, void 0, function() {
        var e, n;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return r.trys.push([0, 2, , 3]), this.logger.verbose("Deleting persistent keystore"), [4, this.indexedDBCache.deleteDatabase()];
            case 1:
              return e = r.sent(), e && this.logger.verbose("Persistent keystore deleted"), [2, e];
            case 2:
              return n = r.sent(), this.handleDatabaseAccessError(n), [2, !1];
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var pc;
(function(t) {
  t.asymmetricKeys = "asymmetricKeys", t.symmetricKeys = "symmetricKeys";
})(pc || (pc = {}));
var RA = (
  /** @class */
  function() {
    function t(e) {
      this.logger = e, this.asymmetricKeys = new Cp(this.logger, pc.asymmetricKeys), this.symmetricKeys = new Cp(this.logger, pc.symmetricKeys);
    }
    return t.prototype.clear = function() {
      return S(this, void 0, void 0, function() {
        var e;
        return w(this, function(n) {
          switch (n.label) {
            case 0:
              this.asymmetricKeys.clearInMemory(), this.symmetricKeys.clearInMemory(), n.label = 1;
            case 1:
              return n.trys.push([1, 3, , 4]), [4, this.asymmetricKeys.clearPersistent()];
            case 2:
              return n.sent(), [2, !0];
            case 3:
              return e = n.sent(), e instanceof Error ? this.logger.error("Clearing keystore failed with error: " + e.message) : this.logger.error("Clearing keystore failed with unknown error"), [2, !1];
            case 4:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var IA = (
  /** @class */
  function() {
    function t(e, n, r) {
      this.logger = e, this.browserCrypto = new uy(this.logger, r), this.b64Encode = new ly(), this.b64Decode = new vA(), this.guidGenerator = new cy(this.browserCrypto), this.pkceGenerator = new EA(this.browserCrypto), this.cache = new RA(this.logger), this.performanceClient = n;
    }
    return t.prototype.createNewGuid = function() {
      return this.guidGenerator.generateGuid();
    }, t.prototype.base64Encode = function(e) {
      return this.b64Encode.encode(e);
    }, t.prototype.base64Decode = function(e) {
      return this.b64Decode.decode(e);
    }, t.prototype.generatePkceCodes = function() {
      return S(this, void 0, void 0, function() {
        return w(this, function(e) {
          return [2, this.pkceGenerator.generateCodes()];
        });
      });
    }, t.prototype.getPublicKeyThumbprint = function(e) {
      var n;
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l, u;
        return w(this, function(d) {
          switch (d.label) {
            case 0:
              return r = (n = this.performanceClient) === null || n === void 0 ? void 0 : n.startMeasurement(_.CryptoOptsGetPublicKeyThumbprint, e.correlationId), [4, this.browserCrypto.generateKeyPair(t.EXTRACTABLE, t.POP_KEY_USAGES)];
            case 1:
              return i = d.sent(), [4, this.browserCrypto.exportJwk(i.publicKey)];
            case 2:
              return o = d.sent(), a = {
                e: o.e,
                kty: o.kty,
                n: o.n
              }, s = Ln.getSortedObjectString(a), [4, this.hashString(s)];
            case 3:
              return c = d.sent(), [4, this.browserCrypto.exportJwk(i.privateKey)];
            case 4:
              return l = d.sent(), [4, this.browserCrypto.importJwk(l, !1, ["sign"])];
            case 5:
              return u = d.sent(), [4, this.cache.asymmetricKeys.setItem(c, {
                privateKey: u,
                publicKey: i.publicKey,
                requestMethod: e.resourceRequestMethod,
                requestUri: e.resourceRequestUri
              })];
            case 6:
              return d.sent(), r && r.endMeasurement({
                success: !0
              }), [2, c];
          }
        });
      });
    }, t.prototype.removeTokenBindingKey = function(e) {
      return S(this, void 0, void 0, function() {
        var n;
        return w(this, function(r) {
          switch (r.label) {
            case 0:
              return [4, this.cache.asymmetricKeys.removeItem(e)];
            case 1:
              return r.sent(), [4, this.cache.asymmetricKeys.containsKey(e)];
            case 2:
              return n = r.sent(), [2, !n];
          }
        });
      });
    }, t.prototype.clearKeystore = function() {
      return S(this, void 0, void 0, function() {
        return w(this, function(e) {
          switch (e.label) {
            case 0:
              return [4, this.cache.clear()];
            case 1:
              return [2, e.sent()];
          }
        });
      });
    }, t.prototype.signJwt = function(e, n, r) {
      var i;
      return S(this, void 0, void 0, function() {
        var o, a, s, c, l, u, d, h, f, m, E, N, g;
        return w(this, function(p) {
          switch (p.label) {
            case 0:
              return o = (i = this.performanceClient) === null || i === void 0 ? void 0 : i.startMeasurement(_.CryptoOptsSignJwt, r), [4, this.cache.asymmetricKeys.getItem(n)];
            case 1:
              if (a = p.sent(), !a)
                throw M.createSigningKeyNotFoundInStorageError(n);
              return [4, this.browserCrypto.exportJwk(a.publicKey)];
            case 2:
              return s = p.sent(), c = Ln.getSortedObjectString(s), l = this.b64Encode.urlEncode(JSON.stringify({ kid: n })), u = Ww.getShrHeaderString({ kid: l, alg: s.alg }), d = this.b64Encode.urlEncode(u), e.cnf = {
                jwk: JSON.parse(c)
              }, h = this.b64Encode.urlEncode(JSON.stringify(e)), f = d + "." + h, m = Ln.stringToArrayBuffer(f), [4, this.browserCrypto.sign(a.privateKey, m)];
            case 3:
              return E = p.sent(), N = this.b64Encode.urlEncodeArr(new Uint8Array(E)), g = f + "." + N, o && o.endMeasurement({
                success: !0
              }), [2, g];
          }
        });
      });
    }, t.prototype.hashString = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r;
        return w(this, function(i) {
          switch (i.label) {
            case 0:
              return [4, this.browserCrypto.sha256Digest(e)];
            case 1:
              return n = i.sent(), r = new Uint8Array(n), [2, this.b64Encode.urlEncodeArr(r)];
          }
        });
      });
    }, t.POP_KEY_USAGES = ["sign", "verify"], t.EXTRACTABLE = !0, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var Tp = (
  /** @class */
  function() {
    function t(e, n) {
      this.correlationId = n, this.measureName = t.makeMeasureName(e, n), this.startMark = t.makeStartMark(e, n), this.endMark = t.makeEndMark(e, n);
    }
    return t.makeMeasureName = function(e, n) {
      return "msal.measure." + e + "." + n;
    }, t.makeStartMark = function(e, n) {
      return "msal.start." + e + "." + n;
    }, t.makeEndMark = function(e, n) {
      return "msal.end." + e + "." + n;
    }, t.supportsBrowserPerformance = function() {
      return typeof window < "u" && typeof window.performance < "u" && typeof window.performance.mark == "function" && typeof window.performance.measure == "function" && typeof window.performance.clearMarks == "function" && typeof window.performance.clearMeasures == "function" && typeof window.performance.getEntriesByName == "function";
    }, t.flushMeasurements = function(e, n) {
      if (t.supportsBrowserPerformance())
        try {
          n.forEach(function(r) {
            var i = t.makeMeasureName(r.name, e), o = window.performance.getEntriesByName(i, "measure");
            o.length > 0 && (window.performance.clearMeasures(i), window.performance.clearMarks(t.makeStartMark(i, e)), window.performance.clearMarks(t.makeEndMark(i, e)));
          });
        } catch {
        }
    }, t.prototype.startMeasurement = function() {
      if (t.supportsBrowserPerformance())
        try {
          window.performance.mark(this.startMark);
        } catch {
        }
    }, t.prototype.endMeasurement = function() {
      if (t.supportsBrowserPerformance())
        try {
          window.performance.mark(this.endMark), window.performance.measure(this.measureName, this.startMark, this.endMark);
        } catch {
        }
    }, t.prototype.flushMeasurement = function() {
      if (t.supportsBrowserPerformance())
        try {
          var e = window.performance.getEntriesByName(this.measureName, "measure");
          if (e.length > 0) {
            var n = e[0].duration;
            return window.performance.clearMeasures(this.measureName), window.performance.clearMarks(this.startMark), window.performance.clearMarks(this.endMark), n;
          }
        } catch {
        }
      return null;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var NA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s, c) {
      var l = t.call(this, n, r, i, o, a, s) || this;
      return l.browserCrypto = new uy(l.logger, c), l.guidGenerator = new cy(l.browserCrypto), l;
    }
    return e.prototype.startPerformanceMeasuremeant = function(n, r) {
      return new Tp(n, r);
    }, e.prototype.generateId = function() {
      return this.guidGenerator.generateGuid();
    }, e.prototype.getPageVisibility = function() {
      var n;
      return ((n = document.visibilityState) === null || n === void 0 ? void 0 : n.toString()) || null;
    }, e.prototype.deleteIncompleteSubMeasurements = function(n) {
      var r = this.eventsByCorrelationId.get(n.event.correlationId), i = r && r.eventId === n.event.eventId, o = [];
      i && (r != null && r.incompleteSubMeasurements) && r.incompleteSubMeasurements.forEach(function(a) {
        o.push(B({}, a));
      }), o.length > 0 && Tp.flushMeasurements(n.event.correlationId, o);
    }, e.prototype.supportsBrowserPerformanceNow = function() {
      return typeof window < "u" && typeof window.performance < "u" && typeof window.performance.now == "function";
    }, e.prototype.startMeasurement = function(n, r) {
      var i = this, o = this.getPageVisibility(), a = t.prototype.startMeasurement.call(this, n, r);
      return B(B({}, a), { endMeasurement: function(s) {
        var c = a.endMeasurement(B({ startPageVisibility: o, endPageVisibility: i.getPageVisibility() }, s));
        return i.deleteIncompleteSubMeasurements(a), c;
      }, discardMeasurement: function() {
        a.discardMeasurement(), i.deleteIncompleteSubMeasurements(a), a.measurement.flushMeasurement();
      } });
    }, e.prototype.setPreQueueTime = function(n, r) {
      if (!this.supportsBrowserPerformanceNow()) {
        this.logger.trace("BrowserPerformanceClient: window performance API not available, unable to set telemetry queue time for " + n);
        return;
      }
      if (!r) {
        this.logger.trace("BrowserPerformanceClient: correlationId for " + n + " not provided, unable to set telemetry queue time");
        return;
      }
      var i = this.preQueueTimeByCorrelationId.get(r);
      i && (this.logger.trace("BrowserPerformanceClient: Incomplete pre-queue " + i.name + " found", r), this.addQueueMeasurement(i.name, r, void 0, !0)), this.preQueueTimeByCorrelationId.set(r, { name: n, time: window.performance.now() });
    }, e.prototype.addQueueMeasurement = function(n, r, i, o) {
      if (!this.supportsBrowserPerformanceNow()) {
        this.logger.trace("BrowserPerformanceClient: window performance API not available, unable to add queue measurement for " + n);
        return;
      }
      if (!r) {
        this.logger.trace("BrowserPerformanceClient: correlationId for " + n + " not provided, unable to add queue measurement");
        return;
      }
      var a = t.prototype.getPreQueueTime.call(this, n, r);
      if (a) {
        var s = window.performance.now(), c = i || t.prototype.calculateQueuedTime.call(this, a, s);
        return t.prototype.addQueueMeasurement.call(this, n, r, c, o);
      }
    }, e;
  }(ry)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var OA = (
  /** @class */
  function() {
    function t(e, n, r, i) {
      this.isBrowserEnvironment = typeof window < "u", this.config = e, this.storage = n, this.logger = r, this.cryptoObj = i;
    }
    return t.prototype.loadExternalTokens = function(e, n, r) {
      if (this.logger.info("TokenCache - loadExternalTokens called"), !n.id_token)
        throw M.createUnableToLoadTokenError("Please ensure server response includes id token.");
      var i = new mn(n.id_token, this.cryptoObj), o, a;
      if (e.account) {
        var s = this.loadAccount(i, e.account.environment, void 0, void 0, e.account.homeAccountId);
        o = new Vo(s, this.loadIdToken(i, s.homeAccountId, e.account.environment, e.account.tenantId), this.loadAccessToken(e, n, s.homeAccountId, e.account.environment, e.account.tenantId, r), this.loadRefreshToken(e, n, s.homeAccountId, e.account.environment));
      } else if (e.authority) {
        var c = pa.generateAuthority(e.authority, e.azureCloudOptions), l = {
          protocolMode: this.config.auth.protocolMode,
          knownAuthorities: this.config.auth.knownAuthorities,
          cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
          authorityMetadata: this.config.auth.authorityMetadata,
          skipAuthorityMetadataCache: this.config.auth.skipAuthorityMetadataCache
        };
        if (a = new pa(c, this.config.system.networkClient, this.storage, l, this.logger), r.clientInfo) {
          this.logger.trace("TokenCache - homeAccountId from options");
          var s = this.loadAccount(i, a.hostnameAndPort, r.clientInfo, a.authorityType);
          o = new Vo(s, this.loadIdToken(i, s.homeAccountId, a.hostnameAndPort, a.tenant), this.loadAccessToken(e, n, s.homeAccountId, a.hostnameAndPort, a.tenant, r), this.loadRefreshToken(e, n, s.homeAccountId, a.hostnameAndPort));
        } else if (n.client_info) {
          this.logger.trace("TokenCache - homeAccountId from response");
          var s = this.loadAccount(i, a.hostnameAndPort, n.client_info, a.authorityType);
          o = new Vo(s, this.loadIdToken(i, s.homeAccountId, a.hostnameAndPort, a.tenant), this.loadAccessToken(e, n, s.homeAccountId, a.hostnameAndPort, a.tenant, r), this.loadRefreshToken(e, n, s.homeAccountId, a.hostnameAndPort));
        } else
          throw M.createUnableToLoadTokenError("Please provide clientInfo in the response or options.");
      } else
        throw M.createUnableToLoadTokenError("Please provide a request with an account or a request with authority.");
      return this.generateAuthenticationResult(e, i, o, a);
    }, t.prototype.loadAccount = function(e, n, r, i, o) {
      var a;
      if (o ? a = o : i !== void 0 && r && (a = We.generateHomeAccountId(r, i, this.logger, this.cryptoObj, e)), !a)
        throw M.createUnableToLoadTokenError("Unexpected missing homeAccountId");
      var s = r ? We.createAccount(r, a, e, void 0, void 0, void 0, n) : We.createGenericAccount(a, e, void 0, void 0, void 0, n);
      if (this.isBrowserEnvironment)
        return this.logger.verbose("TokenCache - loading account"), this.storage.setAccount(s), s;
      throw M.createUnableToLoadTokenError("loadExternalTokens is designed to work in browser environments only.");
    }, t.prototype.loadIdToken = function(e, n, r, i) {
      var o = br.createIdTokenEntity(n, r, e.rawToken, this.config.auth.clientId, i);
      if (this.isBrowserEnvironment)
        return this.logger.verbose("TokenCache - loading id token"), this.storage.setIdTokenCredential(o), o;
      throw M.createUnableToLoadTokenError("loadExternalTokens is designed to work in browser environments only.");
    }, t.prototype.loadAccessToken = function(e, n, r, i, o, a) {
      if (!n.access_token)
        return this.logger.verbose("TokenCache - No access token provided for caching"), null;
      if (!n.expires_in)
        throw M.createUnableToLoadTokenError("Please ensure server response includes expires_in value.");
      if (!a.extendedExpiresOn)
        throw M.createUnableToLoadTokenError("Please provide an extendedExpiresOn value in the options.");
      var s = new it(e.scopes).printScopes(), c = a.expiresOn || n.expires_in + (/* @__PURE__ */ new Date()).getTime() / 1e3, l = a.extendedExpiresOn, u = Rr.createAccessTokenEntity(r, i, n.access_token, this.config.auth.clientId, o, s, c, l, this.cryptoObj);
      if (this.isBrowserEnvironment)
        return this.logger.verbose("TokenCache - loading access token"), this.storage.setAccessTokenCredential(u), u;
      throw M.createUnableToLoadTokenError("loadExternalTokens is designed to work in browser environments only.");
    }, t.prototype.loadRefreshToken = function(e, n, r, i) {
      if (!n.refresh_token)
        return this.logger.verbose("TokenCache - No refresh token provided for caching"), null;
      var o = mi.createRefreshTokenEntity(r, i, n.refresh_token, this.config.auth.clientId);
      if (this.isBrowserEnvironment)
        return this.logger.verbose("TokenCache - loading refresh token"), this.storage.setRefreshTokenCredential(o), o;
      throw M.createUnableToLoadTokenError("loadExternalTokens is designed to work in browser environments only.");
    }, t.prototype.generateAuthenticationResult = function(e, n, r, i) {
      var o, a, s, c = y.EMPTY_STRING, l = [], u = null, d;
      r != null && r.accessToken && (c = r.accessToken.secret, l = it.fromString(r.accessToken.target).asArray(), u = new Date(Number(r.accessToken.expiresOn) * 1e3), d = new Date(Number(r.accessToken.extendedExpiresOn) * 1e3));
      var h = (n == null ? void 0 : n.claims.oid) || (n == null ? void 0 : n.claims.sub) || y.EMPTY_STRING, f = (n == null ? void 0 : n.claims.tid) || y.EMPTY_STRING;
      return {
        authority: i ? i.canonicalAuthority : y.EMPTY_STRING,
        uniqueId: h,
        tenantId: f,
        scopes: l,
        account: r != null && r.account ? r.account.getAccountInfo() : null,
        idToken: n ? n.rawToken : y.EMPTY_STRING,
        idTokenClaims: n ? n.claims : {},
        accessToken: c,
        fromCache: !0,
        expiresOn: u,
        correlationId: e.correlationId || y.EMPTY_STRING,
        requestId: y.EMPTY_STRING,
        extExpiresOn: d,
        familyId: y.EMPTY_STRING,
        tokenType: ((o = r == null ? void 0 : r.accessToken) === null || o === void 0 ? void 0 : o.tokenType) || y.EMPTY_STRING,
        state: y.EMPTY_STRING,
        cloudGraphHostName: ((a = r == null ? void 0 : r.account) === null || a === void 0 ? void 0 : a.cloudGraphHostName) || y.EMPTY_STRING,
        msGraphHost: ((s = r == null ? void 0 : r.account) === null || s === void 0 ? void 0 : s.msGraphHost) || y.EMPTY_STRING,
        code: void 0,
        fromNativeBroker: !1
      };
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var MA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n) {
      var r = t.call(this, n) || this;
      return r.includeRedirectUri = !1, r;
    }
    return e;
  }(ey)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var kA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n, r, i, o, a, s, c, l, u, d) {
      var h = t.call(this, n, r, i, o, a, s, l, u, d) || this;
      return h.apiId = c, h;
    }
    return e.prototype.acquireToken = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l;
        return w(this, function(u) {
          switch (u.label) {
            case 0:
              if (this.logger.trace("SilentAuthCodeClient.acquireToken called"), !n.code)
                throw M.createAuthCodeRequiredError();
              return this.performanceClient.setPreQueueTime(_.StandardInteractionClientInitializeAuthorizationRequest, n.correlationId), [4, this.initializeAuthorizationRequest(n, x.Silent)];
            case 1:
              r = u.sent(), this.browserStorage.updateCacheEntries(r.state, r.nonce, r.authority, r.loginHint || y.EMPTY_STRING, r.account || null), i = this.initializeServerTelemetryManager(this.apiId), u.label = 2;
            case 2:
              return u.trys.push([2, 4, , 5]), o = B(B({}, r), { code: n.code }), this.performanceClient.setPreQueueTime(_.StandardInteractionClientGetClientConfiguration, n.correlationId), [4, this.getClientConfiguration(i, r.authority)];
            case 3:
              return a = u.sent(), s = new MA(a), this.logger.verbose("Auth code client created"), c = new sy(s, this.browserStorage, o, this.logger, this.config.system, this.performanceClient), [2, c.handleCodeResponseFromServer({
                code: n.code,
                msgraph_host: n.msGraphHost,
                cloud_graph_host_name: n.cloudGraphHostName,
                cloud_instance_host_name: n.cloudInstanceHostName
              }, r.state, s.authority, this.networkClient, !1)];
            case 4:
              throw l = u.sent(), l instanceof K && l.setCorrelationId(this.correlationId), i.cacheFailedRequest(l), this.browserStorage.cleanRequestByState(r.state), l;
            case 5:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    }, e.prototype.logout = function() {
      return Promise.reject(M.createSilentLogoutUnsupportedError());
    }, e;
  }(ro)
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var UA = (
  /** @class */
  function() {
    function t(e) {
      this.isBrowserEnvironment = typeof window < "u", this.config = fA(e, this.isBrowserEnvironment), this.initialized = !1, this.logger = new Bc(this.config.system.loggerOptions, Hl, $o), this.networkClient = this.config.system.networkClient, this.navigationClient = this.config.system.navigationClient, this.redirectResponse = /* @__PURE__ */ new Map(), this.hybridAuthCodeResponses = /* @__PURE__ */ new Map(), this.performanceClient = this.isBrowserEnvironment ? new NA(this.config.auth.clientId, this.config.auth.authority, this.logger, Hl, $o, this.config.telemetry.application, this.config.system.cryptoOptions) : new tA(this.config.auth.clientId, this.config.auth.authority, this.logger, Hl, $o, this.config.telemetry.application), this.browserCrypto = this.isBrowserEnvironment ? new IA(this.logger, this.performanceClient, this.config.system.cryptoOptions) : ac, this.eventHandler = new mA(this.logger, this.browserCrypto), this.browserStorage = this.isBrowserEnvironment ? new Fu(this.config.auth.clientId, this.config.cache, this.browserCrypto, this.logger) : iA(this.config.auth.clientId, this.logger);
      var n = {
        cacheLocation: Pe.MemoryStorage,
        temporaryCacheLocation: Pe.MemoryStorage,
        storeAuthStateInCookie: !1,
        secureCookies: !1,
        cacheMigrationEnabled: !1,
        claimsBasedCachingEnabled: !0
      };
      this.nativeInternalStorage = new Fu(this.config.auth.clientId, n, this.browserCrypto, this.logger), this.tokenCache = new OA(this.config, this.browserStorage, this.logger, this.browserCrypto), this.trackPageVisibilityWithMeasurement = this.trackPageVisibilityWithMeasurement.bind(this);
    }
    return t.prototype.initialize = function() {
      return S(this, void 0, void 0, function() {
        var e, n, r, i, o;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              if (this.logger.trace("initialize called"), this.initialized)
                return this.logger.info("initialize has already been called, exiting early."), [
                  2
                  /*return*/
                ];
              if (e = this.config.system.allowNativeBroker, n = this.performanceClient.startMeasurement(_.InitializeClientApplication), this.eventHandler.emitEvent(Q.INITIALIZE_START), !e)
                return [3, 4];
              a.label = 1;
            case 1:
              return a.trys.push([1, 3, , 4]), r = this, [4, kr.createProvider(this.logger, this.config.system.nativeBrokerHandshakeTimeout, this.performanceClient)];
            case 2:
              return r.nativeExtensionProvider = a.sent(), [3, 4];
            case 3:
              return i = a.sent(), this.logger.verbose(i), [3, 4];
            case 4:
              return this.config.cache.claimsBasedCachingEnabled ? [3, 6] : (this.logger.verbose("Claims-based caching is disabled. Clearing the previous cache with claims"), o = this.performanceClient.startMeasurement(_.ClearTokensAndKeysWithClaims), [4, this.browserStorage.clearTokensAndKeysWithClaims()]);
            case 5:
              a.sent(), o.endMeasurement({ success: !0 }), a.label = 6;
            case 6:
              return this.initialized = !0, this.eventHandler.emitEvent(Q.INITIALIZE_END), n.endMeasurement({ allowNativeBroker: e, success: !0 }), [
                2
                /*return*/
              ];
          }
        });
      });
    }, t.prototype.handleRedirectPromise = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r, i, o, a, s, c, l, u = this;
        return w(this, function(d) {
          return this.logger.verbose("handleRedirectPromise called"), Ne.blockNativeBrokerCalledBeforeInitialized(this.config.system.allowNativeBroker, this.initialized), n = this.getAllAccounts(), this.isBrowserEnvironment ? (r = e || y.EMPTY_STRING, i = this.redirectResponse.get(r), typeof i > "u" ? (this.eventHandler.emitEvent(Q.HANDLE_REDIRECT_START, x.Redirect), this.logger.verbose("handleRedirectPromise has been called for the first time, storing the promise"), o = this.browserStorage.getCachedNativeRequest(), a = void 0, o && kr.isNativeAvailable(this.config, this.logger, this.nativeExtensionProvider) && this.nativeExtensionProvider && !e ? (this.logger.trace("handleRedirectPromise - acquiring token from native platform"), s = new ki(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ye.handleRedirectPromise, this.performanceClient, this.nativeExtensionProvider, o.accountId, this.nativeInternalStorage, o.correlationId), a = s.handleRedirectPromise()) : (this.logger.trace("handleRedirectPromise - acquiring token from web flow"), c = this.browserStorage.getTemporaryCache(oe.CORRELATION_ID, !0) || y.EMPTY_STRING, l = this.createRedirectClient(c), a = l.handleRedirectPromise(e)), i = a.then(function(h) {
            if (h) {
              var f = n.length < u.getAllAccounts().length;
              f ? (u.eventHandler.emitEvent(Q.LOGIN_SUCCESS, x.Redirect, h), u.logger.verbose("handleRedirectResponse returned result, login success")) : (u.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_SUCCESS, x.Redirect, h), u.logger.verbose("handleRedirectResponse returned result, acquire token success"));
            }
            return u.eventHandler.emitEvent(Q.HANDLE_REDIRECT_END, x.Redirect), h;
          }).catch(function(h) {
            throw n.length > 0 ? u.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_FAILURE, x.Redirect, null, h) : u.eventHandler.emitEvent(Q.LOGIN_FAILURE, x.Redirect, null, h), u.eventHandler.emitEvent(Q.HANDLE_REDIRECT_END, x.Redirect), h;
          }), this.redirectResponse.set(r, i)) : this.logger.verbose("handleRedirectPromise has been called previously, returning the result from the first call"), [2, i]) : (this.logger.verbose("handleRedirectPromise returns null, not browser environment"), [2, null]);
        });
      });
    }, t.prototype.acquireTokenRedirect = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r, i, o, a, s = this;
        return w(this, function(c) {
          return n = this.getRequestCorrelationId(e), this.logger.verbose("acquireTokenRedirect called", n), this.preflightBrowserEnvironmentCheck(x.Redirect), r = this.getAllAccounts().length > 0, r ? this.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_START, x.Redirect, e) : this.eventHandler.emitEvent(Q.LOGIN_START, x.Redirect, e), this.nativeExtensionProvider && this.canUseNative(e) ? (o = new ki(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ye.acquireTokenRedirect, this.performanceClient, this.nativeExtensionProvider, this.getNativeAccountId(e), this.nativeInternalStorage, e.correlationId), i = o.acquireTokenRedirect(e).catch(function(l) {
            if (l instanceof un && l.isFatal()) {
              s.nativeExtensionProvider = void 0;
              var u = s.createRedirectClient(e.correlationId);
              return u.acquireToken(e);
            } else if (l instanceof Zt) {
              s.logger.verbose("acquireTokenRedirect - Resolving interaction required error thrown by native broker by falling back to web flow");
              var u = s.createRedirectClient(e.correlationId);
              return u.acquireToken(e);
            }
            throw s.browserStorage.setInteractionInProgress(!1), l;
          })) : (a = this.createRedirectClient(e.correlationId), i = a.acquireToken(e)), [2, i.catch(function(l) {
            throw r ? s.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_FAILURE, x.Redirect, null, l) : s.eventHandler.emitEvent(Q.LOGIN_FAILURE, x.Redirect, null, l), l;
          })];
        });
      });
    }, t.prototype.acquireTokenPopup = function(e) {
      var n = this, r = this.getRequestCorrelationId(e), i = this.performanceClient.startMeasurement(_.AcquireTokenPopup, r);
      try {
        this.logger.verbose("acquireTokenPopup called", r), this.preflightBrowserEnvironmentCheck(x.Popup);
      } catch (c) {
        return Promise.reject(c);
      }
      var o = this.getAllAccounts();
      o.length > 0 ? this.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_START, x.Popup, e) : this.eventHandler.emitEvent(Q.LOGIN_START, x.Popup, e);
      var a;
      if (this.canUseNative(e))
        a = this.acquireTokenNative(e, ye.acquireTokenPopup).then(function(c) {
          return n.browserStorage.setInteractionInProgress(!1), i.endMeasurement({
            success: !0,
            isNativeBroker: !0,
            requestId: c.requestId
          }), c;
        }).catch(function(c) {
          if (c instanceof un && c.isFatal()) {
            n.nativeExtensionProvider = void 0;
            var l = n.createPopupClient(e.correlationId);
            return l.acquireToken(e);
          } else if (c instanceof Zt) {
            n.logger.verbose("acquireTokenPopup - Resolving interaction required error thrown by native broker by falling back to web flow");
            var l = n.createPopupClient(e.correlationId);
            return l.acquireToken(e);
          }
          throw n.browserStorage.setInteractionInProgress(!1), c;
        });
      else {
        var s = this.createPopupClient(e.correlationId);
        a = s.acquireToken(e);
      }
      return a.then(function(c) {
        var l = o.length < n.getAllAccounts().length;
        return l ? n.eventHandler.emitEvent(Q.LOGIN_SUCCESS, x.Popup, c) : n.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_SUCCESS, x.Popup, c), i.addStaticFields({
          accessTokenSize: c.accessToken.length,
          idTokenSize: c.idToken.length
        }), i.endMeasurement({
          success: !0,
          requestId: c.requestId
        }), c;
      }).catch(function(c) {
        return o.length > 0 ? n.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_FAILURE, x.Popup, null, c) : n.eventHandler.emitEvent(Q.LOGIN_FAILURE, x.Popup, null, c), i.endMeasurement({
          errorCode: c.errorCode,
          subErrorCode: c.subError,
          success: !1
        }), Promise.reject(c);
      });
    }, t.prototype.trackPageVisibilityWithMeasurement = function() {
      var e = this.ssoSilentMeasurement || this.acquireTokenByCodeAsyncMeasurement;
      e && (this.logger.info("Perf: Visibility change detected in ", e.event.name), e.increment({
        visibilityChangeCount: 1
      }));
    }, t.prototype.ssoSilent = function(e) {
      var n;
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s = this;
        return w(this, function(c) {
          return r = this.getRequestCorrelationId(e), i = B(B({}, e), {
            // will be PromptValue.NONE or PromptValue.NO_SESSION
            prompt: e.prompt,
            correlationId: r
          }), this.preflightBrowserEnvironmentCheck(x.Silent), this.ssoSilentMeasurement = this.performanceClient.startMeasurement(_.SsoSilent, r), (n = this.ssoSilentMeasurement) === null || n === void 0 || n.increment({
            visibilityChangeCount: 0
          }), document.addEventListener("visibilitychange", this.trackPageVisibilityWithMeasurement), this.logger.verbose("ssoSilent called", r), this.eventHandler.emitEvent(Q.SSO_SILENT_START, x.Silent, i), this.canUseNative(i) ? o = this.acquireTokenNative(i, ye.ssoSilent).catch(function(l) {
            if (l instanceof un && l.isFatal()) {
              s.nativeExtensionProvider = void 0;
              var u = s.createSilentIframeClient(i.correlationId);
              return u.acquireToken(i);
            }
            throw l;
          }) : (a = this.createSilentIframeClient(i.correlationId), o = a.acquireToken(i)), [2, o.then(function(l) {
            var u, d;
            return s.eventHandler.emitEvent(Q.SSO_SILENT_SUCCESS, x.Silent, l), (u = s.ssoSilentMeasurement) === null || u === void 0 || u.addStaticFields({
              accessTokenSize: l.accessToken.length,
              idTokenSize: l.idToken.length
            }), (d = s.ssoSilentMeasurement) === null || d === void 0 || d.endMeasurement({
              success: !0,
              isNativeBroker: l.fromNativeBroker,
              requestId: l.requestId
            }), l;
          }).catch(function(l) {
            var u;
            throw s.eventHandler.emitEvent(Q.SSO_SILENT_FAILURE, x.Silent, null, l), (u = s.ssoSilentMeasurement) === null || u === void 0 || u.endMeasurement({
              errorCode: l.errorCode,
              subErrorCode: l.subError,
              success: !1
            }), l;
          }).finally(function() {
            document.removeEventListener("visibilitychange", s.trackPageVisibilityWithMeasurement);
          })];
        });
      });
    }, t.prototype.acquireTokenByCode = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r, i, o, a = this;
        return w(this, function(s) {
          n = this.getRequestCorrelationId(e), this.preflightBrowserEnvironmentCheck(x.Silent), this.logger.trace("acquireTokenByCode called", n), this.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_BY_CODE_START, x.Silent, e), r = this.performanceClient.startMeasurement(_.AcquireTokenByCode, e.correlationId);
          try {
            if (e.code && e.nativeAccountId)
              throw M.createSpaCodeAndNativeAccountIdPresentError();
            if (e.code)
              return i = e.code, o = this.hybridAuthCodeResponses.get(i), o ? (this.logger.verbose("Existing acquireTokenByCode request found", e.correlationId), r.discardMeasurement()) : (this.logger.verbose("Initiating new acquireTokenByCode request", n), o = this.acquireTokenByCodeAsync(B(B({}, e), { correlationId: n })).then(function(c) {
                return a.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_BY_CODE_SUCCESS, x.Silent, c), a.hybridAuthCodeResponses.delete(i), r.addStaticFields({
                  accessTokenSize: c.accessToken.length,
                  idTokenSize: c.idToken.length
                }), r.endMeasurement({
                  success: !0,
                  isNativeBroker: c.fromNativeBroker,
                  requestId: c.requestId
                }), c;
              }).catch(function(c) {
                throw a.hybridAuthCodeResponses.delete(i), a.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_BY_CODE_FAILURE, x.Silent, null, c), r.endMeasurement({
                  errorCode: c.errorCode,
                  subErrorCode: c.subError,
                  success: !1
                }), c;
              }), this.hybridAuthCodeResponses.set(i, o)), [2, o];
            if (e.nativeAccountId) {
              if (this.canUseNative(e, e.nativeAccountId))
                return [2, this.acquireTokenNative(e, ye.acquireTokenByCode, e.nativeAccountId).catch(function(c) {
                  throw c instanceof un && c.isFatal() && (a.nativeExtensionProvider = void 0), c;
                })];
              throw M.createUnableToAcquireTokenFromNativePlatformError();
            } else
              throw M.createAuthCodeOrNativeAccountIdRequiredError();
          } catch (c) {
            throw this.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_BY_CODE_FAILURE, x.Silent, null, c), r.endMeasurement({
              errorCode: c instanceof K && c.errorCode || void 0,
              subErrorCode: c instanceof K && c.subError || void 0,
              success: !1
            }), c;
          }
          return [
            2
            /*return*/
          ];
        });
      });
    }, t.prototype.acquireTokenByCodeAsync = function(e) {
      var n;
      return S(this, void 0, void 0, function() {
        var r, i, o = this;
        return w(this, function(a) {
          switch (a.label) {
            case 0:
              return this.logger.trace("acquireTokenByCodeAsync called", e.correlationId), this.acquireTokenByCodeAsyncMeasurement = this.performanceClient.startMeasurement(_.AcquireTokenByCodeAsync, e.correlationId), (n = this.acquireTokenByCodeAsyncMeasurement) === null || n === void 0 || n.increment({
                visibilityChangeCount: 0
              }), document.addEventListener("visibilitychange", this.trackPageVisibilityWithMeasurement), r = this.createSilentAuthCodeClient(e.correlationId), [4, r.acquireToken(e).then(function(s) {
                var c;
                return (c = o.acquireTokenByCodeAsyncMeasurement) === null || c === void 0 || c.endMeasurement({
                  success: !0,
                  fromCache: s.fromCache,
                  isNativeBroker: s.fromNativeBroker,
                  requestId: s.requestId
                }), s;
              }).catch(function(s) {
                var c;
                throw (c = o.acquireTokenByCodeAsyncMeasurement) === null || c === void 0 || c.endMeasurement({
                  errorCode: s.errorCode,
                  subErrorCode: s.subError,
                  success: !1
                }), s;
              }).finally(function() {
                document.removeEventListener("visibilitychange", o.trackPageVisibilityWithMeasurement);
              })];
            case 1:
              return i = a.sent(), [2, i];
          }
        });
      });
    }, t.prototype.acquireTokenFromCache = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        return w(this, function(i) {
          switch (this.performanceClient.addQueueMeasurement(_.AcquireTokenFromCache, n.correlationId), r.cacheLookupPolicy) {
            case Ct.Default:
            case Ct.AccessToken:
            case Ct.AccessTokenAndRefreshToken:
              return [2, e.acquireToken(n)];
            default:
              throw L.createRefreshRequiredError();
          }
          return [
            2
            /*return*/
          ];
        });
      });
    }, t.prototype.acquireTokenByRefreshToken = function(e, n) {
      return S(this, void 0, void 0, function() {
        var r;
        return w(this, function(i) {
          switch (this.performanceClient.addQueueMeasurement(_.AcquireTokenByRefreshToken, e.correlationId), n.cacheLookupPolicy) {
            case Ct.Default:
            case Ct.AccessTokenAndRefreshToken:
            case Ct.RefreshToken:
            case Ct.RefreshTokenAndNetwork:
              return r = this.createSilentRefreshClient(e.correlationId), this.performanceClient.setPreQueueTime(_.SilentRefreshClientAcquireToken, e.correlationId), [2, r.acquireToken(e)];
            default:
              throw L.createRefreshRequiredError();
          }
          return [
            2
            /*return*/
          ];
        });
      });
    }, t.prototype.acquireTokenBySilentIframe = function(e) {
      return S(this, void 0, void 0, function() {
        var n;
        return w(this, function(r) {
          return this.performanceClient.addQueueMeasurement(_.AcquireTokenBySilentIframe, e.correlationId), n = this.createSilentIframeClient(e.correlationId), this.performanceClient.setPreQueueTime(_.SilentIframeClientAcquireToken, e.correlationId), [2, n.acquireToken(e)];
        });
      });
    }, t.prototype.logout = function(e) {
      return S(this, void 0, void 0, function() {
        var n;
        return w(this, function(r) {
          return n = this.getRequestCorrelationId(e), this.logger.warning("logout API is deprecated and will be removed in msal-browser v3.0.0. Use logoutRedirect instead.", n), [2, this.logoutRedirect(B({ correlationId: n }, e))];
        });
      });
    }, t.prototype.logoutRedirect = function(e) {
      return S(this, void 0, void 0, function() {
        var n, r;
        return w(this, function(i) {
          return n = this.getRequestCorrelationId(e), this.preflightBrowserEnvironmentCheck(x.Redirect), r = this.createRedirectClient(n), [2, r.logout(e)];
        });
      });
    }, t.prototype.logoutPopup = function(e) {
      try {
        var n = this.getRequestCorrelationId(e);
        this.preflightBrowserEnvironmentCheck(x.Popup);
        var r = this.createPopupClient(n);
        return r.logout(e);
      } catch (i) {
        return Promise.reject(i);
      }
    }, t.prototype.getAllAccounts = function() {
      return this.logger.verbose("getAllAccounts called"), this.isBrowserEnvironment ? this.browserStorage.getAllAccounts() : [];
    }, t.prototype.getAccountByUsername = function(e) {
      if (this.logger.trace("getAccountByUsername called"), !e)
        return this.logger.warning("getAccountByUsername: No username provided"), null;
      var n = this.browserStorage.getAccountInfoFilteredBy({ username: e });
      return n ? (this.logger.verbose("getAccountByUsername: Account matching username found, returning"), this.logger.verbosePii("getAccountByUsername: Returning signed-in accounts matching username: " + e), n) : (this.logger.verbose("getAccountByUsername: No matching account found, returning null"), null);
    }, t.prototype.getAccountByHomeId = function(e) {
      if (this.logger.trace("getAccountByHomeId called"), !e)
        return this.logger.warning("getAccountByHomeId: No homeAccountId provided"), null;
      var n = this.browserStorage.getAccountInfoFilteredBy({ homeAccountId: e });
      return n ? (this.logger.verbose("getAccountByHomeId: Account matching homeAccountId found, returning"), this.logger.verbosePii("getAccountByHomeId: Returning signed-in accounts matching homeAccountId: " + e), n) : (this.logger.verbose("getAccountByHomeId: No matching account found, returning null"), null);
    }, t.prototype.getAccountByLocalId = function(e) {
      if (this.logger.trace("getAccountByLocalId called"), !e)
        return this.logger.warning("getAccountByLocalId: No localAccountId provided"), null;
      var n = this.browserStorage.getAccountInfoFilteredBy({ localAccountId: e });
      return n ? (this.logger.verbose("getAccountByLocalId: Account matching localAccountId found, returning"), this.logger.verbosePii("getAccountByLocalId: Returning signed-in accounts matching localAccountId: " + e), n) : (this.logger.verbose("getAccountByLocalId: No matching account found, returning null"), null);
    }, t.prototype.setActiveAccount = function(e) {
      this.browserStorage.setActiveAccount(e);
    }, t.prototype.getActiveAccount = function() {
      return this.browserStorage.getActiveAccount();
    }, t.prototype.preflightBrowserEnvironmentCheck = function(e, n) {
      if (n === void 0 && (n = !0), this.logger.verbose("preflightBrowserEnvironmentCheck started"), Ne.blockNonBrowserEnvironment(this.isBrowserEnvironment), Ne.blockRedirectInIframe(e, this.config.system.allowRedirectInIframe), Ne.blockReloadInHiddenIframes(), Ne.blockAcquireTokenInPopups(), Ne.blockNativeBrokerCalledBeforeInitialized(this.config.system.allowNativeBroker, this.initialized), e === x.Redirect && this.config.cache.cacheLocation === Pe.MemoryStorage && !this.config.cache.storeAuthStateInCookie)
        throw fc.createInMemoryRedirectUnavailableError();
      (e === x.Redirect || e === x.Popup) && this.preflightInteractiveRequest(n);
    }, t.prototype.preflightInteractiveRequest = function(e) {
      this.logger.verbose("preflightInteractiveRequest called, validating app environment"), Ne.blockReloadInHiddenIframes(), e && this.browserStorage.setInteractionInProgress(!0);
    }, t.prototype.acquireTokenNative = function(e, n, r) {
      return S(this, void 0, void 0, function() {
        var i;
        return w(this, function(o) {
          if (this.logger.trace("acquireTokenNative called"), !this.nativeExtensionProvider)
            throw M.createNativeConnectionNotEstablishedError();
          return i = new ki(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, n, this.performanceClient, this.nativeExtensionProvider, r || this.getNativeAccountId(e), this.nativeInternalStorage, e.correlationId), [2, i.acquireToken(e)];
        });
      });
    }, t.prototype.canUseNative = function(e, n) {
      if (this.logger.trace("canUseNative called"), !kr.isNativeAvailable(this.config, this.logger, this.nativeExtensionProvider, e.authenticationScheme))
        return this.logger.trace("canUseNative: isNativeAvailable returned false, returning false"), !1;
      if (e.prompt)
        switch (e.prompt) {
          case st.NONE:
          case st.CONSENT:
          case st.LOGIN:
            this.logger.trace("canUseNative: prompt is compatible with native flow");
            break;
          default:
            return this.logger.trace("canUseNative: prompt = " + e.prompt + " is not compatible with native flow, returning false"), !1;
        }
      return !n && !this.getNativeAccountId(e) ? (this.logger.trace("canUseNative: nativeAccountId is not available, returning false"), !1) : !0;
    }, t.prototype.getNativeAccountId = function(e) {
      var n = e.account || this.browserStorage.getAccountInfoByHints(e.loginHint, e.sid) || this.getActiveAccount();
      return n && n.nativeAccountId || "";
    }, t.prototype.createPopupClient = function(e) {
      return new cA(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.nativeInternalStorage, this.nativeExtensionProvider, e);
    }, t.prototype.createRedirectClient = function(e) {
      return new sA(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.nativeInternalStorage, this.nativeExtensionProvider, e);
    }, t.prototype.createSilentIframeClient = function(e) {
      return new pA(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ye.ssoSilent, this.performanceClient, this.nativeInternalStorage, this.nativeExtensionProvider, e);
    }, t.prototype.createSilentCacheClient = function(e) {
      return new ay(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.nativeExtensionProvider, e);
    }, t.prototype.createSilentRefreshClient = function(e) {
      return new gA(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, this.performanceClient, this.nativeExtensionProvider, e);
    }, t.prototype.createSilentAuthCodeClient = function(e) {
      return new kA(this.config, this.browserStorage, this.browserCrypto, this.logger, this.eventHandler, this.navigationClient, ye.acquireTokenByCode, this.performanceClient, this.nativeExtensionProvider, e);
    }, t.prototype.addEventCallback = function(e) {
      return this.eventHandler.addEventCallback(e);
    }, t.prototype.removeEventCallback = function(e) {
      this.eventHandler.removeEventCallback(e);
    }, t.prototype.addPerformanceCallback = function(e) {
      return this.performanceClient.addPerformanceCallback(e);
    }, t.prototype.removePerformanceCallback = function(e) {
      return this.performanceClient.removePerformanceCallback(e);
    }, t.prototype.enableAccountStorageEvents = function() {
      this.eventHandler.enableAccountStorageEvents();
    }, t.prototype.disableAccountStorageEvents = function() {
      this.eventHandler.disableAccountStorageEvents();
    }, t.prototype.getTokenCache = function() {
      return this.tokenCache;
    }, t.prototype.getLogger = function() {
      return this.logger;
    }, t.prototype.setLogger = function(e) {
      this.logger = e;
    }, t.prototype.initializeWrapperLibrary = function(e, n) {
      this.browserStorage.setWrapperMetadata(e, n);
    }, t.prototype.setNavigationClient = function(e) {
      this.navigationClient = e;
    }, t.prototype.getConfiguration = function() {
      return this.config;
    }, t.prototype.getRequestCorrelationId = function(e) {
      return e != null && e.correlationId ? e.correlationId : this.isBrowserEnvironment ? this.browserCrypto.createNewGuid() : y.EMPTY_STRING;
    }, t;
  }()
);
/*! @azure/msal-browser v2.38.4 2024-03-26 */
var DA = (
  /** @class */
  function(t) {
    et(e, t);
    function e(n) {
      var r = t.call(this, n) || this;
      return r.astsAsyncMeasurement = void 0, r.activeSilentTokenRequests = /* @__PURE__ */ new Map(), r.trackPageVisibility = r.trackPageVisibility.bind(r), r;
    }
    return e.prototype.loginRedirect = function(n) {
      return S(this, void 0, void 0, function() {
        var r;
        return w(this, function(i) {
          return r = this.getRequestCorrelationId(n), this.logger.verbose("loginRedirect called", r), [2, this.acquireTokenRedirect(B({ correlationId: r }, n || mp))];
        });
      });
    }, e.prototype.loginPopup = function(n) {
      var r = this.getRequestCorrelationId(n);
      return this.logger.verbose("loginPopup called", r), this.acquireTokenPopup(B({ correlationId: r }, n || mp));
    }, e.prototype.acquireTokenSilent = function(n) {
      return S(this, void 0, void 0, function() {
        var r, i, o, a, s, c, l, u = this;
        return w(this, function(d) {
          if (r = this.getRequestCorrelationId(n), i = this.performanceClient.startMeasurement(_.AcquireTokenSilent, r), i.addStaticFields({
            cacheLookupPolicy: n.cacheLookupPolicy
          }), this.preflightBrowserEnvironmentCheck(x.Silent), this.logger.verbose("acquireTokenSilent called", r), o = n.account || this.getActiveAccount(), !o)
            throw M.createNoAccountError();
          return a = {
            clientId: this.config.auth.clientId,
            authority: n.authority || y.EMPTY_STRING,
            scopes: n.scopes,
            homeAccountIdentifier: o.homeAccountId,
            claims: n.claims,
            authenticationScheme: n.authenticationScheme,
            resourceRequestMethod: n.resourceRequestMethod,
            resourceRequestUri: n.resourceRequestUri,
            shrClaims: n.shrClaims,
            sshKid: n.sshKid
          }, s = JSON.stringify(a), c = this.activeSilentTokenRequests.get(s), typeof c > "u" ? (this.logger.verbose("acquireTokenSilent called for the first time, storing active request", r), this.performanceClient.setPreQueueTime(_.AcquireTokenSilentAsync, r), l = this.acquireTokenSilentAsync(B(B({}, n), { correlationId: r }), o).then(function(h) {
            return u.activeSilentTokenRequests.delete(s), i.addStaticFields({
              accessTokenSize: h.accessToken.length,
              idTokenSize: h.idToken.length
            }), i.endMeasurement({
              success: !0,
              fromCache: h.fromCache,
              isNativeBroker: h.fromNativeBroker,
              cacheLookupPolicy: n.cacheLookupPolicy,
              requestId: h.requestId
            }), h;
          }).catch(function(h) {
            throw u.activeSilentTokenRequests.delete(s), i.endMeasurement({
              errorCode: h.errorCode,
              subErrorCode: h.subError,
              success: !1
            }), h;
          }), this.activeSilentTokenRequests.set(s, l), [2, l]) : (this.logger.verbose("acquireTokenSilent has been called previously, returning the result from the first call", r), i.discardMeasurement(), [2, c]);
        });
      });
    }, e.prototype.trackPageVisibility = function() {
      this.astsAsyncMeasurement && (this.logger.info("Perf: Visibility change detected"), this.astsAsyncMeasurement.increment({
        visibilityChangeCount: 1
      }));
    }, e.prototype.acquireTokenSilentAsync = function(n, r) {
      var i;
      return S(this, void 0, void 0, function() {
        var o, a, s, c, l, u = this;
        return w(this, function(d) {
          switch (d.label) {
            case 0:
              return this.performanceClient.addQueueMeasurement(_.AcquireTokenSilentAsync, n.correlationId), this.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_START, x.Silent, n), this.astsAsyncMeasurement = this.performanceClient.startMeasurement(_.AcquireTokenSilentAsync, n.correlationId), (i = this.astsAsyncMeasurement) === null || i === void 0 || i.increment({
                visibilityChangeCount: 0
              }), document.addEventListener("visibilitychange", this.trackPageVisibility), kr.isNativeAvailable(this.config, this.logger, this.nativeExtensionProvider, n.authenticationScheme) && r.nativeAccountId ? (this.logger.verbose("acquireTokenSilent - attempting to acquire token from native platform"), a = B(B({}, n), { account: r }), o = this.acquireTokenNative(a, ye.acquireTokenSilent_silentFlow).catch(function(h) {
                return S(u, void 0, void 0, function() {
                  var f;
                  return w(this, function(m) {
                    if (h instanceof un && h.isFatal())
                      return this.logger.verbose("acquireTokenSilent - native platform unavailable, falling back to web flow"), this.nativeExtensionProvider = void 0, f = this.createSilentIframeClient(n.correlationId), [2, f.acquireToken(n)];
                    throw h;
                  });
                });
              }), [3, 3]) : [3, 1];
            case 1:
              return this.logger.verbose("acquireTokenSilent - attempting to acquire token from web flow"), s = this.createSilentCacheClient(n.correlationId), this.performanceClient.setPreQueueTime(_.InitializeSilentRequest, n.correlationId), [4, s.initializeSilentRequest(n, r)];
            case 2:
              c = d.sent(), l = B(B({}, n), {
                // set the request's CacheLookupPolicy to Default if it was not optionally passed in
                cacheLookupPolicy: n.cacheLookupPolicy || Ct.Default
              }), this.performanceClient.setPreQueueTime(_.AcquireTokenFromCache, c.correlationId), o = this.acquireTokenFromCache(s, c, l).catch(function(h) {
                if (l.cacheLookupPolicy === Ct.AccessToken)
                  throw h;
                return Ne.blockReloadInHiddenIframes(), u.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_NETWORK_START, x.Silent, c), u.performanceClient.setPreQueueTime(_.AcquireTokenByRefreshToken, c.correlationId), u.acquireTokenByRefreshToken(c, l).catch(function(f) {
                  var m = f instanceof Br, E = f instanceof Zt, N = f.errorCode === vi.noTokensFoundError.code, g = f.errorCode === Vt.INVALID_GRANT_ERROR;
                  if ((!m || !g || E || l.cacheLookupPolicy === Ct.AccessTokenAndRefreshToken || l.cacheLookupPolicy === Ct.RefreshToken) && l.cacheLookupPolicy !== Ct.Skip && !N)
                    throw f;
                  return u.logger.verbose("Refresh token expired/invalid or CacheLookupPolicy is set to Skip, attempting acquire token by iframe.", n.correlationId), u.performanceClient.setPreQueueTime(_.AcquireTokenBySilentIframe, c.correlationId), u.acquireTokenBySilentIframe(c);
                });
              }), d.label = 3;
            case 3:
              return [2, o.then(function(h) {
                var f;
                return u.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_SUCCESS, x.Silent, h), (f = u.astsAsyncMeasurement) === null || f === void 0 || f.endMeasurement({
                  success: !0,
                  fromCache: h.fromCache,
                  isNativeBroker: h.fromNativeBroker,
                  requestId: h.requestId
                }), h;
              }).catch(function(h) {
                var f;
                throw u.eventHandler.emitEvent(Q.ACQUIRE_TOKEN_FAILURE, x.Silent, null, h), (f = u.astsAsyncMeasurement) === null || f === void 0 || f.endMeasurement({
                  errorCode: h.errorCode,
                  subErrorCode: h.subError,
                  success: !1
                }), h;
              }).finally(function() {
                document.removeEventListener("visibilitychange", u.trackPageVisibility);
              })];
          }
        });
      });
    }, e;
  }(UA)
);
const Sp = "redirect";
var wp = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
class PA extends DA {
  get account() {
    return this.getAllAccounts().find((r) => {
      var i;
      return ((i = r.idTokenClaims) === null || i === void 0 ? void 0 : i.aud) === this.clientId;
    });
  }
  get hasValidClaims() {
    var e;
    const n = (e = this.account) === null || e === void 0 ? void 0 : e.idTokenClaims;
    if (n) {
      const r = Math.ceil(Date.now() / 1e3);
      return n.exp > r;
    }
    return !1;
  }
  get clientId() {
    var e;
    return (e = this.config.auth) === null || e === void 0 ? void 0 : e.clientId;
  }
  get requestOrigin() {
    return this.browserStorage.getTemporaryCache("request.origin", !0);
  }
  constructor(e, n) {
    super(n), this.tenantId = e;
  }
  login(e) {
    return wp(this, arguments, void 0, function* (n, r = Sp, i = !0) {
      var o;
      const a = (n == null ? void 0 : n.loginHint) || ((o = this.account) === null || o === void 0 ? void 0 : o.username), s = (n == null ? void 0 : n.scopes) || [], c = Object.assign(Object.assign({}, n), { loginHint: a, scopes: s });
      if (a && i) {
        this.logger.verbose("Attempting to login in silently");
        try {
          return yield this.ssoSilent(c);
        } catch {
          this.logger.verbose("Silent login attempt failed");
        }
      }
      switch (this.logger.verbose(`Attempting to login in by [${r}]`), r) {
        case "popup":
          return this.loginPopup(c);
        case "redirect":
          return this.loginRedirect(c);
      }
    });
  }
  acquireToken() {
    return wp(this, arguments, void 0, function* (e = { scopes: [] }, n = Sp, r = !0) {
      const i = yield this.account;
      if (r && i) {
        this.logger.verbose("Attempting to acquire token in silently");
        try {
          return yield this.acquireTokenSilent(Object.assign({ account: i }, e));
        } catch {
          this.logger.info("Expected to navigate away from the current page but timeout occurred.");
        }
      }
      switch (this.logger.verbose(`Attempting to acquire token by [${n}]`), n) {
        case "popup":
          return this.acquireTokenPopup(e);
        case "redirect":
          return this.acquireTokenRedirect(e);
      }
    });
  }
}
const HA = (t, e = window.location.origin) => {
  t = t.match(/^http[s]?/) ? t : e + t;
  const { origin: n, pathname: r } = new URL(t);
  return n + r.replace(/([^:]\/)\/+/g, "$1");
}, LA = (t, e, n, r, i) => {
  const o = Object.assign({ clientId: e, redirectUri: HA(n || ""), navigateToLoginRequestUrl: !1, authority: `https://login.microsoftonline.com/${t}` }, r == null ? void 0 : r.auth), a = Object.assign({ cacheLocation: "localStorage" }, r == null ? void 0 : r.cache), s = r == null ? void 0 : r.system;
  return new PA(t, { auth: o, cache: a, system: s });
};
class xA extends Bc {
  constructor(e) {
    super({
      logLevel: e,
      loggerCallback: (...n) => this.loggerCallback(...n)
    }), this.getLogType = (n) => {
      switch (n) {
        case Ie.Error:
          return "error";
        case Ie.Warning:
          return "warn";
        case Ie.Info:
          return "info";
        case Ie.Verbose:
        default:
          return "debug";
      }
    };
  }
  loggerCallback(e, n, r) {
    console[this.getLogType(e)]("%c FUSION::MSAL %c %s", "border: 1px solid;", "border: none;", n);
  }
}
var Ll = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const qA = "default";
class BA {
  get defaultClient() {
    return this.getClient(qA);
  }
  get defaultAccount() {
    return this.defaultClient.account;
  }
  get defaultConfig() {
    return this._config.defaultConfig;
  }
  constructor(e) {
    this._config = e, this._clients = {};
  }
  getClient(e) {
    return this._clients[e] || (this._clients[e] = this.createClient(e)), this._clients[e];
  }
  createClient(e) {
    const n = e ? this._config.getClientConfig(e) : this._config.defaultConfig;
    if (!n)
      throw Error("Could not find any config");
    const r = LA(n.tenantId, n.clientId, n.redirectUri, n.config);
    return r.setLogger(new xA(0)), r;
  }
  handleRedirect() {
    return Ll(this, void 0, void 0, function* () {
      const { redirectUri: e } = this.defaultConfig || {};
      if (window.location.pathname === e) {
        const n = this.defaultClient, r = n.getLogger(), { requestOrigin: i } = n;
        yield n.handleRedirectPromise(), i === e ? (r.warning(`detected callback loop from url ${e}, redirecting to root`), window.location.replace("/")) : window.location.replace(i || "/");
      }
      return null;
    });
  }
  acquireToken(e) {
    return this.defaultClient.acquireToken(e);
  }
  acquireAccessToken(e) {
    return Ll(this, void 0, void 0, function* () {
      const n = yield this.acquireToken(e);
      return n ? n.accessToken : void 0;
    });
  }
  login() {
    return Ll(this, void 0, void 0, function* () {
      yield this.defaultClient.login();
    });
  }
}
var zA = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const dy = {
  name: "auth",
  configure: (t) => {
    var e;
    const n = new Nw();
    return !((e = t == null ? void 0 : t.auth) === null || e === void 0) && e.defaultConfig && n.configureDefault(t.auth.defaultConfig), n;
  },
  initialize: (t) => zA(void 0, [t], void 0, function* ({ config: e }) {
    const n = new BA(e);
    return e.requiresAuth && (yield n.handleRedirect(), n.defaultAccount || (yield n.login())), n;
  })
}, GA = (t, e) => ({
  module: dy,
  configure: (n) => {
    n.configureDefault(t), (e == null ? void 0 : e.requiresAuth) !== void 0 && (n.requiresAuth = e == null ? void 0 : e.requiresAuth);
    const { clients: r } = e ?? {};
    r && Object.entries(r).forEach(([i, o]) => n.configureClient(i, o));
  }
});
let Wa;
const KA = new Uint8Array(16);
function FA() {
  if (!Wa && (Wa = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !Wa))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return Wa(KA);
}
const Ve = [];
for (let t = 0; t < 256; ++t)
  Ve.push((t + 256).toString(16).slice(1));
function jA(t, e = 0) {
  return Ve[t[e + 0]] + Ve[t[e + 1]] + Ve[t[e + 2]] + Ve[t[e + 3]] + "-" + Ve[t[e + 4]] + Ve[t[e + 5]] + "-" + Ve[t[e + 6]] + Ve[t[e + 7]] + "-" + Ve[t[e + 8]] + Ve[t[e + 9]] + "-" + Ve[t[e + 10]] + Ve[t[e + 11]] + Ve[t[e + 12]] + Ve[t[e + 13]] + Ve[t[e + 14]] + Ve[t[e + 15]];
}
const YA = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), Ap = {
  randomUUID: YA
};
function QA(t, e, n) {
  if (Ap.randomUUID && !e && !t)
    return Ap.randomUUID();
  t = t || {};
  const r = t.random || (t.rng || FA)();
  return r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, jA(r);
}
function $t(t, e) {
  function n(...r) {
    if (e) {
      const i = e(...r);
      if (!i)
        throw new Error("prepareAction did not return an object");
      return Object.assign(Object.assign({ type: t, payload: i.payload }, "meta" in i && { meta: i.meta }), "error" in i && { error: i.error });
    }
    return { type: t, payload: r[0] };
  }
  return n.toString = () => `${t}`, n.type = t, n.match = (r) => r.type === t, n;
}
const xl = "::";
function VA(t, e, n, r) {
  const i = $t([t, "request"].join(xl), e);
  return n && Object.assign(i, {
    success: $t([t, "success"].join(xl), n)
  }), r && Object.assign(i, {
    failure: $t([t, "failure"].join(xl), r)
  }), i;
}
const $A = () => ({
  request: $t("client/request", (t, e) => ({
    payload: { args: t, options: e },
    meta: { transaction: QA(), created: Date.now() }
  })),
  execute: VA("client/execute", (t) => ({
    payload: t,
    meta: { transaction: t, created: Date.now() }
  }), (t) => ({
    payload: t,
    meta: { transaction: t.transaction, created: Date.now() }
  }), (t, e) => ({
    payload: t,
    meta: { transaction: e, created: Date.now() }
  })),
  cancel: $t("client/cancel", (t, e) => ({
    payload: { transaction: t, reason: e },
    meta: { transaction: t, created: Date.now() }
  })),
  error: $t("client/error", (t, e) => ({
    payload: { transaction: t, error: e },
    meta: { transaction: t, created: Date.now() }
  }))
});
$A();
function XA() {
  return {
    set: $t("cache/set", (t, e) => ({ payload: { key: t, entry: e } })),
    remove: $t("cache/remove", (t) => ({ payload: t })),
    invalidate: $t("cache/invalidate", (t, e) => ({
      payload: t,
      meta: { item: e }
    })),
    mutate: $t("cache/mutate", (t, e, n) => ({ payload: Object.assign(Object.assign({}, e), { key: t }), meta: { item: n } })),
    trim: $t("cache/trim", (t) => ({ payload: t }))
  };
}
XA();
const JA = zr.createContext(null), ZA = JA.Provider;
var WA = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
class eb extends aw {
  constructor(e) {
    super([pw, nc, dy]), this.env = e, this.logger = new Rv("AppConfigurator");
  }
  configureHttp(...e) {
    this.addConfig(Rw(...e));
  }
  configureHttpClient(...e) {
    this.addConfig(Iw(...e));
  }
  useFrameworkServiceClient(e, n) {
    this.addConfig({
      module: nc,
      configure: (r, i) => WA(this, void 0, void 0, function* () {
        const o = yield i == null ? void 0 : i.serviceDiscovery.resolveService(e);
        if (!o)
          throw Error(`failed to configure service [${e}]`);
        r.configureClient(e, Object.assign(Object.assign({}, n), { baseUri: o.uri, defaultScopes: o.defaultScopes }));
      })
    });
  }
  configureMsal(...e) {
    this.addConfig(GA(...e));
  }
}
var tb = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const nb = (t) => (e) => tb(void 0, void 0, void 0, function* () {
  var n;
  const r = new eb(e.env);
  t && (yield Promise.resolve(t(r, e)));
  const i = yield r.initialize(e.fusion.modules);
  return !((n = e.env.manifest) === null || n === void 0) && n.key && i.event.dispatchEvent("onAppModulesLoaded", {
    detail: { appKey: e.env.manifest.key, modules: i }
  }), i;
});
var rb = function(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(a) {
      a(o);
    });
  }
  return new (n || (n = Promise))(function(o, a) {
    function s(u) {
      try {
        l(r.next(u));
      } catch (d) {
        a(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        a(d);
      }
    }
    function l(u) {
      u.done ? o(u.value) : i(u.value).then(s, c);
    }
    l((r = r.apply(t, e || [])).next());
  });
};
const ib = (t, e, n) => zr.lazy(() => rb(void 0, void 0, void 0, function* () {
  const i = yield nb(n)(e), { fusion: o } = e;
  return i.event.dispatchEvent("onReactAppLoaded", {
    detail: { modules: i, fusion: o },
    source: t
  }), {
    default: () => Vs.jsx(ZA, { value: o, children: Vs.jsx(cw, { value: i, children: t }) })
  };
})), ob = (t, e) => {
  console.log("configuring application", e), t.onConfigured((n) => {
    console.log("application config created", n);
  }), t.onInitialized((n) => {
    console.log("application config initialized", n);
  });
}, ab = () => /* @__PURE__ */ Vs.jsx(
  "div",
  {
    style: {
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f0f0f0",
      color: "#343434"
    },
    children: /* @__PURE__ */ Vs.jsx("h1", { children: "🚀 Hello Fusion react@19-beta 😎" })
  }
), sb = zr.createElement(ab), cb = (t) => ib(sb, t, ob), db = (t, e) => {
  const n = cb(e), r = aC.createRoot(t);
  return r.render(zr.createElement(n)), () => r.unmount();
};
export {
  db as default,
  db as renderApp
};
