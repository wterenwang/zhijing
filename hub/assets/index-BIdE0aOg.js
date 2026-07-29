var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},c=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},l=(n,r,a)=>(a=n==null?{}:e(i(n)),c(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var u=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function ee(e,t){return E(e.type,t,e.props)}function D(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function te(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var O=/\/+/g;function ne(e,t){return typeof e==`object`&&e&&e.key!=null?te(``+e.key):t.toString(36)}function re(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function ie(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,ie(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+ne(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(O,`$&/`)+`/`),ie(o,r,i,``,function(e){return e})):o!=null&&(D(o)&&(o=ee(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(O,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+ne(a,u),c+=ie(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+ne(a,u++),c+=ie(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return ie(re(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function ae(e,t,n){if(e==null)return e;var r=[],i=0;return ie(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function oe(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var k=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},A={map:ae,forEach:function(e,t,n){ae(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return ae(e,function(){t++}),t},toArray:function(e){return ae(e,function(e){return e})||[]},only:function(e){if(!D(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=A,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!T.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)T.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=D,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:oe}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,k)}catch(e){k(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.7`})),d=o(((e,t)=>{t.exports=u()})),f=o((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m)if(n(c)!==null)m=!0,S||(S=!0,D());else{var t=n(l);t!==null&&ne(x,t.startTime-e)}}var S=!1,C=-1,w=5,T=-1;function E(){return g?!0:!(e.unstable_now()-T<w)}function ee(){if(g=!1,S){var t=e.unstable_now();T=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&E());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&ne(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?D():S=!1}}}var D;if(typeof y==`function`)D=function(){y(ee)};else if(typeof MessageChannel<`u`){var te=new MessageChannel,O=te.port2;te.port1.onmessage=ee,D=function(){O.postMessage(null)}}else D=function(){_(ee,0)};function ne(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):w=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,ne(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,D()))),r},e.unstable_shouldYield=E,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),p=o(((e,t)=>{t.exports=f()})),m=o((e=>{var t=d();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`)if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`)if(t){var n=c(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else i.d.m(e)},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return s.H.useFormState(e,t,n)},e.useFormStatus=function(){return s.H.useHostTransitionStatus()},e.version=`19.2.7`})),h=o(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=m()})),g=o((e=>{var t=p(),n=d(),r=h();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function u(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function f(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=f(e),t!==null)return t;e=e.sibling}return null}var m=Object.assign,g=Symbol.for(`react.element`),_=Symbol.for(`react.transitional.element`),v=Symbol.for(`react.portal`),y=Symbol.for(`react.fragment`),b=Symbol.for(`react.strict_mode`),x=Symbol.for(`react.profiler`),S=Symbol.for(`react.consumer`),C=Symbol.for(`react.context`),w=Symbol.for(`react.forward_ref`),T=Symbol.for(`react.suspense`),E=Symbol.for(`react.suspense_list`),ee=Symbol.for(`react.memo`),D=Symbol.for(`react.lazy`),te=Symbol.for(`react.activity`),O=Symbol.for(`react.memo_cache_sentinel`),ne=Symbol.iterator;function re(e){return typeof e!=`object`||!e?null:(e=ne&&e[ne]||e[`@@iterator`],typeof e==`function`?e:null)}var ie=Symbol.for(`react.client.reference`);function ae(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===ie?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case y:return`Fragment`;case x:return`Profiler`;case b:return`StrictMode`;case T:return`Suspense`;case E:return`SuspenseList`;case te:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case v:return`Portal`;case C:return e.displayName||`Context`;case S:return(e._context.displayName||`Context`)+`.Consumer`;case w:var t=e.render;return e=e.displayName,e||=(e=t.displayName||t.name||``,e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case ee:return t=e.displayName||null,t===null?ae(e.type)||`Memo`:t;case D:t=e._payload,e=e._init;try{return ae(e(t))}catch{}}return null}var oe=Array.isArray,k=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,A=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,se={pending:!1,data:null,method:null,action:null},ce=[],le=-1;function ue(e){return{current:e}}function de(e){0>le||(e.current=ce[le],ce[le]=null,le--)}function j(e,t){le++,ce[le]=e.current,e.current=t}var fe=ue(null),pe=ue(null),me=ue(null),he=ue(null);function ge(e,t){switch(j(me,t),j(pe,e),j(fe,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}de(fe),j(fe,e)}function _e(){de(fe),de(pe),de(me)}function ve(e){e.memoizedState!==null&&j(he,e);var t=fe.current,n=Hd(t,e.type);t!==n&&(j(pe,e),j(fe,n))}function ye(e){pe.current===e&&(de(fe),de(pe)),he.current===e&&(de(he),Qf._currentValue=se)}var be,xe;function Se(e){if(be===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);be=t&&t[1]||``,xe=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+be+e+xe}var Ce=!1;function we(e,t){if(!e||Ce)return``;Ce=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{Ce=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Se(n):``}function Te(e,t){switch(e.tag){case 26:case 27:case 5:return Se(e.type);case 16:return Se(`Lazy`);case 13:return e.child!==t&&t!==null?Se(`Suspense Fallback`):Se(`Suspense`);case 19:return Se(`SuspenseList`);case 0:case 15:return we(e.type,!1);case 11:return we(e.type.render,!1);case 1:return we(e.type,!0);case 31:return Se(`Activity`);default:return``}}function Ee(e){try{var t=``,n=null;do t+=Te(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var De=Object.prototype.hasOwnProperty,Oe=t.unstable_scheduleCallback,ke=t.unstable_cancelCallback,Ae=t.unstable_shouldYield,je=t.unstable_requestPaint,Me=t.unstable_now,Ne=t.unstable_getCurrentPriorityLevel,Pe=t.unstable_ImmediatePriority,Fe=t.unstable_UserBlockingPriority,Ie=t.unstable_NormalPriority,Le=t.unstable_LowPriority,Re=t.unstable_IdlePriority,ze=t.log,Be=t.unstable_setDisableYieldValue,Ve=null,He=null;function Ue(e){if(typeof ze==`function`&&Be(e),He&&typeof He.setStrictMode==`function`)try{He.setStrictMode(Ve,e)}catch{}}var We=Math.clz32?Math.clz32:qe,Ge=Math.log,Ke=Math.LN2;function qe(e){return e>>>=0,e===0?32:31-(Ge(e)/Ke|0)|0}var Je=256,Ye=262144,Xe=4194304;function Ze(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Qe(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=Ze(n))):i=Ze(o):i=Ze(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=Ze(n))):i=Ze(o)):i=Ze(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function $e(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function et(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function tt(){var e=Xe;return Xe<<=1,!(Xe&62914560)&&(Xe=4194304),e}function nt(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function rt(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function it(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-We(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&at(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function at(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-We(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function ot(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-We(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function st(e,t){var n=t&-t;return n=n&42?1:ct(n),(n&(e.suspendedLanes|t))===0?n:0}function ct(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function lt(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function ut(){var e=A.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function dt(e,t){var n=A.p;try{return A.p=e,t()}finally{A.p=n}}var ft=Math.random().toString(36).slice(2),pt=`__reactFiber$`+ft,M=`__reactProps$`+ft,mt=`__reactContainer$`+ft,ht=`__reactEvents$`+ft,gt=`__reactListeners$`+ft,_t=`__reactHandles$`+ft,vt=`__reactResources$`+ft,yt=`__reactMarker$`+ft;function bt(e){delete e[pt],delete e[M],delete e[ht],delete e[gt],delete e[_t]}function xt(e){var t=e[pt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[mt]||n[pt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[pt])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function St(e){if(e=e[pt]||e[mt]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Ct(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function wt(e){var t=e[vt];return t||=e[vt]={hoistableStyles:new Map,hoistableScripts:new Map},t}function Tt(e){e[yt]=!0}var Et=new Set,Dt={};function Ot(e,t){kt(e,t),kt(e+`Capture`,t)}function kt(e,t){for(Dt[e]=t,e=0;e<t.length;e++)Et.add(t[e])}var At=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),jt={},Mt={};function Nt(e){return De.call(Mt,e)?!0:De.call(jt,e)?!1:At.test(e)?Mt[e]=!0:(jt[e]=!0,!1)}function Pt(e,t,n){if(Nt(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}function Ft(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function It(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function Lt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Rt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function zt(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Bt(e){if(!e._valueTracker){var t=Rt(e)?`checked`:`value`;e._valueTracker=zt(e,t,``+e[t])}}function Vt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Rt(e)?e.checked?`true`:`false`:e.value),e=r,e===n?!1:(t.setValue(e),!0)}function Ht(e){if(e||=typeof document<`u`?document:void 0,e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Ut=/[\n"\\]/g;function Wt(e){return e.replace(Ut,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function Gt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Lt(t)):e.value!==``+Lt(t)&&(e.value=``+Lt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):qt(e,o,Lt(n)):qt(e,o,Lt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+Lt(s):e.removeAttribute(`name`)}function Kt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){Bt(e);return}n=n==null?``:``+Lt(n),t=t==null?n:``+Lt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r??=i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),Bt(e)}function qt(e,t,n){t===`number`&&Ht(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function Jt(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Lt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Yt(e,t,n){if(t!=null&&(t=``+Lt(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+Lt(n)}function Xt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(oe(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??=``,t=n}n=Lt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),Bt(e)}function Zt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Qt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function $t(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Qt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function en(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&$t(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&$t(e,o,t[o])}function tn(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var nn=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),rn=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function an(e){return rn.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function on(){}var sn=null;function cn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var ln=null,un=null;function dn(e){var t=St(e);if(t&&(e=t.stateNode)){var n=e[M]||null;a:switch(e=t.stateNode,t.type){case`input`:if(Gt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Wt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[M]||null;if(!a)throw Error(i(90));Gt(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Vt(r)}break a;case`textarea`:Yt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&Jt(e,!!n.multiple,t,!1)}}}var fn=!1;function pn(e,t,n){if(fn)return e(t,n);fn=!0;try{return e(t)}finally{if(fn=!1,(ln!==null||un!==null)&&(bu(),ln&&(t=ln,e=un,un=ln=null,dn(t),e)))for(t=0;t<e.length;t++)dn(e[t])}}function mn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[M]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=!(e===`button`||e===`input`||e===`select`||e===`textarea`)),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var hn=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),gn=!1;if(hn)try{var _n={};Object.defineProperty(_n,"passive",{get:function(){gn=!0}}),window.addEventListener(`test`,_n,_n),window.removeEventListener(`test`,_n,_n)}catch{gn=!1}var vn=null,yn=null,bn=null;function xn(){if(bn)return bn;var e,t=yn,n=t.length,r,i=`value`in vn?vn.value:vn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return bn=i.slice(e,1<r?1-r:void 0)}function Sn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Cn(){return!0}function wn(){return!1}function Tn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?Cn:wn,this.isPropagationStopped=wn,this}return m(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=Cn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=Cn)},persist:function(){},isPersistent:Cn}),t}var En={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Dn=Tn(En),On=m({},En,{view:0,detail:0}),kn=Tn(On),An,jn,Mn,Nn=m({},On,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Wn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Mn&&(Mn&&e.type===`mousemove`?(An=e.screenX-Mn.screenX,jn=e.screenY-Mn.screenY):jn=An=0,Mn=e),An)},movementY:function(e){return`movementY`in e?e.movementY:jn}}),Pn=Tn(Nn),Fn=Tn(m({},Nn,{dataTransfer:0})),In=Tn(m({},On,{relatedTarget:0})),Ln=Tn(m({},En,{animationName:0,elapsedTime:0,pseudoElement:0})),Rn=Tn(m({},En,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),zn=Tn(m({},En,{data:0})),Bn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},Vn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Hn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Un(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Hn[e])?!!t[e]:!1}function Wn(){return Un}var Gn=Tn(m({},On,{key:function(e){if(e.key){var t=Bn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=Sn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?Vn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Wn,charCode:function(e){return e.type===`keypress`?Sn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?Sn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Kn=Tn(m({},Nn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),qn=Tn(m({},On,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Wn})),Jn=Tn(m({},En,{propertyName:0,elapsedTime:0,pseudoElement:0})),Yn=Tn(m({},Nn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Xn=Tn(m({},En,{newState:0,oldState:0})),Zn=[9,13,27,32],Qn=hn&&`CompositionEvent`in window,$n=null;hn&&`documentMode`in document&&($n=document.documentMode);var er=hn&&`TextEvent`in window&&!$n,tr=hn&&(!Qn||$n&&8<$n&&11>=$n),nr=` `,rr=!1;function ir(e,t){switch(e){case`keyup`:return Zn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function ar(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var or=!1;function N(e,t){switch(e){case`compositionend`:return ar(t);case`keypress`:return t.which===32?(rr=!0,nr):null;case`textInput`:return e=t.data,e===nr&&rr?null:e;default:return null}}function sr(e,t){if(or)return e===`compositionend`||!Qn&&ir(e,t)?(e=xn(),bn=yn=vn=null,or=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return tr&&t.locale!==`ko`?null:t.data;default:return null}}var cr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function lr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!cr[e.type]:t===`textarea`}function ur(e,t,n,r){ln?un?un.push(r):un=[r]:ln=r,t=Ed(t,`onChange`),0<t.length&&(n=new Dn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var dr=null,fr=null;function pr(e){yd(e,0)}function mr(e){if(Vt(Ct(e)))return e}function hr(e,t){if(e===`change`)return t}var gr=!1;if(hn){var _r;if(hn){var vr=`oninput`in document;if(!vr){var yr=document.createElement(`div`);yr.setAttribute(`oninput`,`return;`),vr=typeof yr.oninput==`function`}_r=vr}else _r=!1;gr=_r&&(!document.documentMode||9<document.documentMode)}function br(){dr&&(dr.detachEvent(`onpropertychange`,xr),fr=dr=null)}function xr(e){if(e.propertyName===`value`&&mr(fr)){var t=[];ur(t,fr,e,cn(e)),pn(pr,t)}}function Sr(e,t,n){e===`focusin`?(br(),dr=t,fr=n,dr.attachEvent(`onpropertychange`,xr)):e===`focusout`&&br()}function Cr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return mr(fr)}function wr(e,t){if(e===`click`)return mr(t)}function Tr(e,t){if(e===`input`||e===`change`)return mr(t)}function Er(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Dr=typeof Object.is==`function`?Object.is:Er;function Or(e,t){if(Dr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!De.call(t,i)||!Dr(e[i],t[i]))return!1}return!0}function kr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function P(e,t){var n=kr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=kr(n)}}function Ar(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Ar(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function jr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Ht(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Ht(e.document)}return t}function Mr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Nr=hn&&`documentMode`in document&&11>=document.documentMode,Pr=null,Fr=null,Ir=null,Lr=!1;function Rr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Lr||Pr==null||Pr!==Ht(r)||(r=Pr,`selectionStart`in r&&Mr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Ir&&Or(Ir,r)||(Ir=r,r=Ed(Fr,`onSelect`),0<r.length&&(t=new Dn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Pr)))}function zr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Br={animationend:zr(`Animation`,`AnimationEnd`),animationiteration:zr(`Animation`,`AnimationIteration`),animationstart:zr(`Animation`,`AnimationStart`),transitionrun:zr(`Transition`,`TransitionRun`),transitionstart:zr(`Transition`,`TransitionStart`),transitioncancel:zr(`Transition`,`TransitionCancel`),transitionend:zr(`Transition`,`TransitionEnd`)},Vr={},Hr={};hn&&(Hr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Br.animationend.animation,delete Br.animationiteration.animation,delete Br.animationstart.animation),`TransitionEvent`in window||delete Br.transitionend.transition);function Ur(e){if(Vr[e])return Vr[e];if(!Br[e])return e;var t=Br[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Hr)return Vr[e]=t[n];return e}var Wr=Ur(`animationend`),Gr=Ur(`animationiteration`),Kr=Ur(`animationstart`),qr=Ur(`transitionrun`),Jr=Ur(`transitionstart`),Yr=Ur(`transitioncancel`),Xr=Ur(`transitionend`),Zr=new Map,Qr=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);Qr.push(`scrollEnd`);function $r(e,t){Zr.set(e,t),Ot(t,[e])}var ei=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},ti=[],ni=0,ri=0;function ii(){for(var e=ni,t=ri=ni=0;t<e;){var n=ti[t];ti[t++]=null;var r=ti[t];ti[t++]=null;var i=ti[t];ti[t++]=null;var a=ti[t];if(ti[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&F(n,i,a)}}function ai(e,t,n,r){ti[ni++]=e,ti[ni++]=t,ti[ni++]=n,ti[ni++]=r,ri|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function oi(e,t,n,r){return ai(e,t,n,r),ci(e)}function si(e,t){return ai(e,null,null,t),ci(e)}function F(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-We(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function ci(e){if(50<du)throw du=0,fu=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var li={};function I(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function L(e,t,n,r){return new I(e,t,n,r)}function ui(e){return e=e.prototype,!(!e||!e.isReactComponent)}function di(e,t){var n=e.alternate;return n===null?(n=L(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function fi(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function pi(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)ui(e)&&(s=1);else if(typeof e==`string`)s=Uf(e,n,fe.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case te:return e=L(31,n,t,a),e.elementType=te,e.lanes=o,e;case y:return mi(n.children,a,o,t);case b:s=8,a|=24;break;case x:return e=L(12,n,t,a|2),e.elementType=x,e.lanes=o,e;case T:return e=L(13,n,t,a),e.elementType=T,e.lanes=o,e;case E:return e=L(19,n,t,a),e.elementType=E,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case C:s=10;break a;case S:s=9;break a;case w:s=11;break a;case ee:s=14;break a;case D:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=L(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function mi(e,t,n,r){return e=L(7,e,r,t),e.lanes=n,e}function hi(e,t,n){return e=L(6,e,null,t),e.lanes=n,e}function gi(e){var t=L(18,null,null,0);return t.stateNode=e,t}function _i(e,t,n){return t=L(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var vi=new WeakMap;function yi(e,t){if(typeof e==`object`&&e){var n=vi.get(e);return n===void 0?(t={value:e,source:t,stack:Ee(t)},vi.set(e,t),t):n}return{value:e,source:t,stack:Ee(t)}}var bi=[],xi=0,Si=null,Ci=0,wi=[],Ti=0,Ei=null,Di=1,Oi=``;function ki(e,t){bi[xi++]=Ci,bi[xi++]=Si,Si=e,Ci=t}function Ai(e,t,n){wi[Ti++]=Di,wi[Ti++]=Oi,wi[Ti++]=Ei,Ei=e;var r=Di;e=Oi;var i=32-We(r)-1;r&=~(1<<i),n+=1;var a=32-We(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Di=1<<32-We(t)+i|n<<i|r,Oi=a+e}else Di=1<<a|n<<i|r,Oi=e}function ji(e){e.return!==null&&(ki(e,1),Ai(e,1,0))}function Mi(e){for(;e===Si;)Si=bi[--xi],bi[xi]=null,Ci=bi[--xi],bi[xi]=null;for(;e===Ei;)Ei=wi[--Ti],wi[Ti]=null,Oi=wi[--Ti],wi[Ti]=null,Di=wi[--Ti],wi[Ti]=null}function Ni(e,t){wi[Ti++]=Di,wi[Ti++]=Oi,wi[Ti++]=Ei,Di=t.id,Oi=t.overflow,Ei=e}var Pi=null,Fi=null,R=!1,Ii=null,Li=!1,Ri=Error(i(519));function zi(e){throw Gi(yi(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Ri}function Bi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[pt]=e,t[M]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<_d.length;n++)Q(_d[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),Kt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),Xt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Md(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=on),t=!0):t=!1,t||zi(e,!0)}function Vi(e){for(Pi=e.return;Pi;)switch(Pi.tag){case 5:case 31:case 13:Li=!1;return;case 27:case 3:Li=!0;return;default:Pi=Pi.return}}function Hi(e){if(e!==Pi)return!1;if(!R)return Vi(e),R=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!==`form`&&n!==`button`)||Ud(e.type,e.memoizedProps)),n=!n),n&&Fi&&zi(e),Vi(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));Fi=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));Fi=uf(e)}else t===27?(t=Fi,Zd(e.type)?(e=lf,lf=null,Fi=e):Fi=t):Fi=Pi?cf(e.stateNode.nextSibling):null;return!0}function Ui(){Fi=Pi=null,R=!1}function Wi(){var e=Ii;return e!==null&&(Zl===null?Zl=e:Zl.push.apply(Zl,e),Ii=null),e}function Gi(e){Ii===null?Ii=[e]:Ii.push(e)}var Ki=ue(null),qi=null,Ji=null;function Yi(e,t,n){j(Ki,t._currentValue),t._currentValue=n}function Xi(e){e._currentValue=Ki.current,de(Ki)}function Zi(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Qi(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),Zi(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),Zi(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function $i(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;Dr(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===he.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}a=a.return}e!==null&&Qi(t,e,n,r),t.flags|=262144}function ea(e){for(e=e.firstContext;e!==null;){if(!Dr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function ta(e){qi=e,Ji=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function na(e){return ia(qi,e)}function ra(e,t){return qi===null&&ta(e),ia(e,t)}function ia(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Ji===null){if(e===null)throw Error(i(308));Ji=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Ji=Ji.next=t;return n}var aa=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},oa=t.unstable_scheduleCallback,sa=t.unstable_NormalPriority,ca={$$typeof:C,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function la(){return{controller:new aa,data:new Map,refCount:0}}function ua(e){e.refCount--,e.refCount===0&&oa(sa,function(){e.controller.abort()})}var da=null,fa=0,pa=0,ma=null;function ha(e,t){if(da===null){var n=da=[];fa=0,pa=dd(),ma={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return fa++,t.then(ga,ga),t}function ga(){if(--fa===0&&da!==null){ma!==null&&(ma.status=`fulfilled`);var e=da;da=null,pa=0,ma=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function _a(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var va=k.S;k.S=function(e,t){eu=Me(),typeof t==`object`&&t&&typeof t.then==`function`&&ha(e,t),va!==null&&va(e,t)};var ya=ue(null);function ba(){var e=ya.current;return e===null?q.pooledCache:e}function xa(e,t){t===null?j(ya,ya.current):j(ya,t.pool)}function Sa(){var e=ba();return e===null?null:{parent:ca._currentValue,pool:e}}var Ca=Error(i(460)),wa=Error(i(474)),Ta=Error(i(542)),Ea={then:function(){}};function Da(e){return e=e.status,e===`fulfilled`||e===`rejected`}function Oa(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(on,on),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ma(e),e;default:if(typeof t.status==`string`)t.then(on,on);else{if(e=q,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Ma(e),e}throw Aa=t,Ca}}function ka(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Aa=e,Ca):e}}var Aa=null;function ja(){if(Aa===null)throw Error(i(459));var e=Aa;return Aa=null,e}function Ma(e){if(e===Ca||e===Ta)throw Error(i(483))}var Na=null,Pa=0;function Fa(e){var t=Pa;return Pa+=1,Na===null&&(Na=[]),Oa(Na,e,t)}function Ia(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function La(e,t){throw t.$$typeof===g?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Ra(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=di(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=hi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===y?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===D&&ka(i)===t.type)?(t=a(t,n.props),Ia(t,n),t.return=e,t):(t=pi(n.type,n.key,n.props,null,e.mode,r),Ia(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=_i(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=mi(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=hi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case _:return n=pi(t.type,t.key,t.props,null,e.mode,n),Ia(n,t),n.return=e,n;case v:return t=_i(t,e.mode,n),t.return=e,t;case D:return t=ka(t),f(e,t,n)}if(oe(t)||re(t))return t=mi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,Fa(t),n);if(t.$$typeof===C)return f(e,ra(e,t),n);La(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case _:return n.key===i?l(e,t,n,r):null;case v:return n.key===i?u(e,t,n,r):null;case D:return n=ka(n),p(e,t,n,r)}if(oe(n)||re(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,Fa(n),r);if(n.$$typeof===C)return p(e,t,ra(e,n),r);La(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case _:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case D:return r=ka(r),m(e,t,n,r,i)}if(oe(r)||re(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,Fa(r),i);if(r.$$typeof===C)return m(e,t,n,ra(t,r),i);La(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),R&&ki(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return R&&ki(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),R&&ki(i,h),l}function g(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),R&&ki(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return R&&ki(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),R&&ki(a,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===y&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case _:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===y){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===D&&ka(l)===r.type){n(e,r.sibling),c=a(r,o.props),Ia(c,o),c.return=e,e=c;break a}n(e,r);break}else t(e,r);r=r.sibling}o.type===y?(c=mi(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=pi(o.type,o.key,o.props,null,e.mode,c),Ia(c,o),c.return=e,e=c)}return s(e);case v:a:{for(l=o.key;r!==null;){if(r.key===l)if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}else{n(e,r);break}else t(e,r);r=r.sibling}c=_i(o,e.mode,c),c.return=e,e=c}return s(e);case D:return o=ka(o),b(e,r,o,c)}if(oe(o))return h(e,r,o,c);if(re(o)){if(l=re(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,Fa(o),c);if(o.$$typeof===C)return b(e,r,ra(e,o),c);La(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=hi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{Pa=0;var i=b(e,t,n,r);return Na=null,i}catch(t){if(t===Ca||t===Ta)throw t;var a=L(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var za=Ra(!0),Ba=Ra(!1),Va=!1;function Ha(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ua(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function z(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function B(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,K&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=ci(e),F(e,null,n),t}return ai(e,r,t,n),ci(e)}function V(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ot(e,n)}}function Wa(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Ga=!1;function Ka(){if(Ga){var e=ma;if(e!==null)throw e}}function qa(e,t,n,r){Ga=!1;var i=e.updateQueue;Va=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,p=f!==s.lane;if(p?(Y&f)===f:(r&f)===f){f!==0&&f===pa&&(Ga=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,f);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,f=typeof h==`function`?h.call(_,d,f):h,f==null)break a;d=m({},d,f);break a;case 2:Va=!0}}f=s.callback,f!==null&&(e.flags|=64,p&&(e.flags|=8192),p=i.callbacks,p===null?i.callbacks=[f]:p.push(f))}else p={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=p,c=d):u=u.next=p,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;p=s,s=p.next,p.next=null,i.lastBaseUpdate=p,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Gl|=o,e.lanes=o,e.memoizedState=d}}function H(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function Ja(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)H(n[e],t)}var Ya=ue(null),Xa=ue(0);function Za(e,t){e=Ul,j(Xa,e),j(Ya,t),Ul=e|t.baseLanes}function Qa(){j(Xa,Ul),j(Ya,Ya.current)}function $a(){Ul=Xa.current,de(Ya),de(Xa)}var eo=ue(null),to=null;function no(e){var t=e.alternate;j(so,so.current&1),j(eo,e),to===null&&(t===null||Ya.current!==null||t.memoizedState!==null)&&(to=e)}function ro(e){j(so,so.current),j(eo,e),to===null&&(to=e)}function io(e){e.tag===22?(j(so,so.current),j(eo,e),to===null&&(to=e)):ao(e)}function ao(){j(so,so.current),j(eo,eo.current)}function oo(e){de(eo),to===e&&(to=null),de(so)}var so=ue(0);function co(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var lo=0,U=null,W=null,uo=null,fo=!1,po=!1,mo=!1,ho=0,go=0,_o=null,vo=0;function yo(){throw Error(i(321))}function bo(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Dr(e[n],t[n]))return!1;return!0}function xo(e,t,n,r,i,a){return lo=a,U=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,k.H=e===null||e.memoizedState===null?Rs:zs,mo=!1,a=n(r,i),mo=!1,po&&(a=Co(t,n,r,i)),So(e),a}function So(e){k.H=Ls;var t=W!==null&&W.next!==null;if(lo=0,uo=W=U=null,fo=!1,go=0,_o=null,t)throw Error(i(300));e===null||nc||(e=e.dependencies,e!==null&&ea(e)&&(nc=!0))}function Co(e,t,n,r){U=e;var a=0;do{if(po&&(_o=null),go=0,po=!1,25<=a)throw Error(i(301));if(a+=1,uo=W=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}k.H=Bs,o=t(n,r)}while(po);return o}function wo(){var e=k.H,t=e.useState()[0];return t=typeof t.then==`function`?jo(t):t,e=e.useState()[0],(W===null?null:W.memoizedState)!==e&&(U.flags|=1024),t}function To(){var e=ho!==0;return ho=0,e}function Eo(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Do(e){if(fo){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}fo=!1}lo=0,uo=W=U=null,po=!1,go=ho=0,_o=null}function Oo(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return uo===null?U.memoizedState=uo=e:uo=uo.next=e,uo}function ko(){if(W===null){var e=U.alternate;e=e===null?null:e.memoizedState}else e=W.next;var t=uo===null?U.memoizedState:uo.next;if(t!==null)uo=t,W=e;else{if(e===null)throw U.alternate===null?Error(i(467)):Error(i(310));W=e,e={memoizedState:W.memoizedState,baseState:W.baseState,baseQueue:W.baseQueue,queue:W.queue,next:null},uo===null?U.memoizedState=uo=e:uo=uo.next=e}return uo}function Ao(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function jo(e){var t=go;return go+=1,_o===null&&(_o=[]),e=Oa(_o,e,t),t=U,(uo===null?t.memoizedState:uo.next)===null&&(t=t.alternate,k.H=t===null||t.memoizedState===null?Rs:zs),e}function Mo(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return jo(e);if(e.$$typeof===C)return na(e)}throw Error(i(438,String(e)))}function No(e){var t=null,n=U.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=U.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??={data:[],index:0},n===null&&(n=Ao(),U.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=O;return t.index++,n}function Po(e,t){return typeof t==`function`?t(e):t}function Fo(e){return Io(ko(),W,e)}function Io(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(lo&f)===f:(Y&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===pa&&(d=!0);else if((lo&p)===p){u=u.next,p===pa&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,U.lanes|=p,Gl|=p;f=u.action,mo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,U.lanes|=f,Gl|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!Dr(o,e.memoizedState)&&(nc=!0,d&&(n=ma,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Lo(e){var t=ko(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);Dr(o,t.memoizedState)||(nc=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Ro(e,t,n){var r=U,a=ko(),o=R;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!Dr((W||a).memoizedState,n);if(s&&(a.memoizedState=n,nc=!0),a=a.queue,ls(Vo.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||uo!==null&&uo.memoizedState.tag&1){if(r.flags|=2048,is(9,{destroy:void 0},Bo.bind(null,r,a,n,t),null),q===null)throw Error(i(349));o||lo&127||zo(r,t,n)}return n}function zo(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=U.updateQueue,t===null?(t=Ao(),U.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Bo(e,t,n,r){t.value=n,t.getSnapshot=r,Ho(t)&&Uo(e)}function Vo(e,t,n){return n(function(){Ho(t)&&Uo(e)})}function Ho(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Dr(e,n)}catch{return!0}}function Uo(e){var t=si(e,2);t!==null&&hu(t,e,2)}function Wo(e){var t=Oo();if(typeof e==`function`){var n=e;if(e=n(),mo){Ue(!0);try{n()}finally{Ue(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Po,lastRenderedState:e},t}function Go(e,t,n,r){return e.baseState=n,Io(e,W,typeof r==`function`?r:Po)}function Ko(e,t,n,r,a){if(Ps(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};k.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,qo(t,o)):(o.next=n.next,t.pending=n.next=o)}}function qo(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=k.T,o={};k.T=o;try{var s=n(i,r),c=k.S;c!==null&&c(o,s),Jo(e,t,s)}catch(n){Xo(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),k.T=a}}else try{a=n(i,r),Jo(e,t,a)}catch(n){Xo(e,t,n)}}function Jo(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Yo(e,t,n)},function(n){return Xo(e,t,n)}):Yo(e,t,n)}function Yo(e,t,n){t.status=`fulfilled`,t.value=n,Zo(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,qo(e,n)))}function Xo(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Zo(t),t=t.next;while(t!==r)}e.action=null}function Zo(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Qo(e,t){return t}function $o(e,t){if(R){var n=q.formState;if(n!==null){a:{var r=U;if(R){if(Fi){b:{for(var i=Fi,a=Li;i.nodeType!==8;){if(!a){i=null;break b}if(i=cf(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){Fi=cf(i.nextSibling),r=i.data===`F!`;break a}}zi(r)}r=!1}r&&(t=n[0])}}return n=Oo(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Qo,lastRenderedState:t},n.queue=r,n=js.bind(null,U,r),r.dispatch=n,r=Wo(!1),a=Ns.bind(null,U,!1,r.queue),r=Oo(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Ko.bind(null,U,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function es(e){return ts(ko(),W,e)}function ts(e,t,n){if(t=Io(e,t,Qo)[0],e=Fo(Po)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=jo(t)}catch(e){throw e===Ca?Ta:e}else r=t;t=ko();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(U.flags|=2048,is(9,{destroy:void 0},ns.bind(null,i,n),null)),[r,a,e]}function ns(e,t){e.action=t}function rs(e){var t=ko(),n=W;if(n!==null)return ts(t,n,e);ko(),t=t.memoizedState,n=ko();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function is(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=U.updateQueue,t===null&&(t=Ao(),U.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function as(){return ko().memoizedState}function os(e,t,n,r){var i=Oo();U.flags|=e,i.memoizedState=is(1|t,{destroy:void 0},n,r===void 0?null:r)}function ss(e,t,n,r){var i=ko();r=r===void 0?null:r;var a=i.memoizedState.inst;W!==null&&r!==null&&bo(r,W.memoizedState.deps)?i.memoizedState=is(t,a,n,r):(U.flags|=e,i.memoizedState=is(1|t,a,n,r))}function cs(e,t){os(8390656,8,e,t)}function ls(e,t){ss(2048,8,e,t)}function us(e){U.flags|=4;var t=U.updateQueue;if(t===null)t=Ao(),U.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function ds(e){var t=ko().memoizedState;return us({ref:t,nextImpl:e}),function(){if(K&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function fs(e,t){return ss(4,2,e,t)}function ps(e,t){return ss(4,4,e,t)}function ms(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function hs(e,t,n){n=n==null?null:n.concat([e]),ss(4,4,ms.bind(null,t,e),n)}function gs(){}function _s(e,t){var n=ko();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&bo(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function vs(e,t){var n=ko();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&bo(t,r[1]))return r[0];if(r=e(),mo){Ue(!0);try{e()}finally{Ue(!1)}}return n.memoizedState=[r,t],r}function ys(e,t,n){return n===void 0||lo&1073741824&&!(Y&261930)?e.memoizedState=t:(e.memoizedState=n,e=mu(),U.lanes|=e,Gl|=e,n)}function bs(e,t,n,r){return Dr(n,t)?n:Ya.current===null?!(lo&42)||lo&1073741824&&!(Y&261930)?(nc=!0,e.memoizedState=n):(e=mu(),U.lanes|=e,Gl|=e,t):(e=ys(e,n,r),Dr(e,t)||(nc=!0),e)}function xs(e,t,n,r,i){var a=A.p;A.p=a!==0&&8>a?a:8;var o=k.T,s={};k.T=s,Ns(e,!1,t,n);try{var c=i(),l=k.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?Ms(e,t,_a(c,r),pu(e)):Ms(e,t,r,pu(e))}catch(n){Ms(e,t,{then:function(){},status:`rejected`,reason:n},pu())}finally{A.p=a,o!==null&&s.types!==null&&(o.types=s.types),k.T=o}}function Ss(){}function Cs(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=ws(e).queue;xs(e,a,t,se,n===null?Ss:function(){return Ts(e),n(r)})}function ws(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:se,baseState:se,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Po,lastRenderedState:se},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Po,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ts(e){var t=ws(e);t.next===null&&(t=e.alternate.memoizedState),Ms(e,t.next.queue,{},pu())}function Es(){return na(Qf)}function Ds(){return ko().memoizedState}function Os(){return ko().memoizedState}function ks(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=pu();e=z(n);var r=B(t,e,n);r!==null&&(hu(r,t,n),V(r,t,n)),t={cache:la()},e.payload=t;return}t=t.return}}function As(e,t,n){var r=pu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Ps(e)?Fs(t,n):(n=oi(e,t,n,r),n!==null&&(hu(n,e,r),Is(n,t,r)))}function js(e,t,n){Ms(e,t,n,pu())}function Ms(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ps(e))Fs(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Dr(s,o))return ai(e,t,i,0),q===null&&ii(),!1}catch{}if(n=oi(e,t,i,r),n!==null)return hu(n,e,r),Is(n,t,r),!0}return!1}function Ns(e,t,n,r){if(r={lane:2,revertLane:dd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Ps(e)){if(t)throw Error(i(479))}else t=oi(e,n,r,2),t!==null&&hu(t,e,2)}function Ps(e){var t=e.alternate;return e===U||t!==null&&t===U}function Fs(e,t){po=fo=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Is(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ot(e,n)}}var Ls={readContext:na,use:Mo,useCallback:yo,useContext:yo,useEffect:yo,useImperativeHandle:yo,useLayoutEffect:yo,useInsertionEffect:yo,useMemo:yo,useReducer:yo,useRef:yo,useState:yo,useDebugValue:yo,useDeferredValue:yo,useTransition:yo,useSyncExternalStore:yo,useId:yo,useHostTransitionStatus:yo,useFormState:yo,useActionState:yo,useOptimistic:yo,useMemoCache:yo,useCacheRefresh:yo};Ls.useEffectEvent=yo;var Rs={readContext:na,use:Mo,useCallback:function(e,t){return Oo().memoizedState=[e,t===void 0?null:t],e},useContext:na,useEffect:cs,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),os(4194308,4,ms.bind(null,t,e),n)},useLayoutEffect:function(e,t){return os(4194308,4,e,t)},useInsertionEffect:function(e,t){os(4,2,e,t)},useMemo:function(e,t){var n=Oo();t=t===void 0?null:t;var r=e();if(mo){Ue(!0);try{e()}finally{Ue(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=Oo();if(n!==void 0){var i=n(t);if(mo){Ue(!0);try{n(t)}finally{Ue(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=As.bind(null,U,e),[r.memoizedState,e]},useRef:function(e){var t=Oo();return e={current:e},t.memoizedState=e},useState:function(e){e=Wo(e);var t=e.queue,n=js.bind(null,U,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:gs,useDeferredValue:function(e,t){return ys(Oo(),e,t)},useTransition:function(){var e=Wo(!1);return e=xs.bind(null,U,e.queue,!0,!1),Oo().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=U,a=Oo();if(R){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),q===null)throw Error(i(349));Y&127||zo(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,cs(Vo.bind(null,r,o,e),[e]),r.flags|=2048,is(9,{destroy:void 0},Bo.bind(null,r,o,n,t),null),n},useId:function(){var e=Oo(),t=q.identifierPrefix;if(R){var n=Oi,r=Di;n=(r&~(1<<32-We(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=ho++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=vo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:Es,useFormState:$o,useActionState:$o,useOptimistic:function(e){var t=Oo();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Ns.bind(null,U,!0,n),n.dispatch=t,[e,t]},useMemoCache:No,useCacheRefresh:function(){return Oo().memoizedState=ks.bind(null,U)},useEffectEvent:function(e){var t=Oo(),n={impl:e};return t.memoizedState=n,function(){if(K&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},zs={readContext:na,use:Mo,useCallback:_s,useContext:na,useEffect:ls,useImperativeHandle:hs,useInsertionEffect:fs,useLayoutEffect:ps,useMemo:vs,useReducer:Fo,useRef:as,useState:function(){return Fo(Po)},useDebugValue:gs,useDeferredValue:function(e,t){return bs(ko(),W.memoizedState,e,t)},useTransition:function(){var e=Fo(Po)[0],t=ko().memoizedState;return[typeof e==`boolean`?e:jo(e),t]},useSyncExternalStore:Ro,useId:Ds,useHostTransitionStatus:Es,useFormState:es,useActionState:es,useOptimistic:function(e,t){return Go(ko(),W,e,t)},useMemoCache:No,useCacheRefresh:Os};zs.useEffectEvent=ds;var Bs={readContext:na,use:Mo,useCallback:_s,useContext:na,useEffect:ls,useImperativeHandle:hs,useInsertionEffect:fs,useLayoutEffect:ps,useMemo:vs,useReducer:Lo,useRef:as,useState:function(){return Lo(Po)},useDebugValue:gs,useDeferredValue:function(e,t){var n=ko();return W===null?ys(n,e,t):bs(n,W.memoizedState,e,t)},useTransition:function(){var e=Lo(Po)[0],t=ko().memoizedState;return[typeof e==`boolean`?e:jo(e),t]},useSyncExternalStore:Ro,useId:Ds,useHostTransitionStatus:Es,useFormState:rs,useActionState:rs,useOptimistic:function(e,t){var n=ko();return W===null?(n.baseState=e,[e,n.queue.dispatch]):Go(n,W,e,t)},useMemoCache:No,useCacheRefresh:Os};Bs.useEffectEvent=ds;function Vs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:m({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Hs={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=pu(),i=z(r);i.payload=t,n!=null&&(i.callback=n),t=B(e,i,r),t!==null&&(hu(t,e,r),V(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=pu(),i=z(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=B(e,i,r),t!==null&&(hu(t,e,r),V(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=pu(),r=z(n);r.tag=2,t!=null&&(r.callback=t),t=B(e,r,n),t!==null&&(hu(t,e,n),V(t,e,n))}};function Us(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Or(n,r)||!Or(i,a):!0}function Ws(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Hs.enqueueReplaceState(t,t.state,null)}function Gs(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=m({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Ks(e){ei(e)}function qs(e){console.error(e)}function Js(e){ei(e)}function Ys(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Xs(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Zs(e,t,n){return n=z(n),n.tag=3,n.payload={element:null},n.callback=function(){Ys(e,t)},n}function Qs(e){return e=z(e),e.tag=3,e}function $s(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Xs(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Xs(t,n,r),typeof i!=`function`&&(ru===null?ru=new Set([this]):ru.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function ec(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&$i(t,n,a,!0),n=eo.current,n!==null){switch(n.tag){case 31:case 13:return to===null?Du():n.alternate===null&&Wl===0&&(Wl=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===Ea?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Gu(e,r,a)),!1;case 22:return n.flags|=65536,r===Ea?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Gu(e,r,a)),!1}throw Error(i(435,n.tag))}return Gu(e,r,a),Du(),!1}if(R)return t=eo.current,t===null?(r!==Ri&&(t=Error(i(423),{cause:r}),Gi(yi(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=yi(r,n),a=Zs(e.stateNode,r,a),Wa(e,a),Wl!==4&&(Wl=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==Ri&&(e=Error(i(422),{cause:r}),Gi(yi(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=yi(o,n),Xl===null?Xl=[o]:Xl.push(o),Wl!==4&&(Wl=2),t===null)return!0;r=yi(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=Zs(n.stateNode,r,e),Wa(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(ru===null||!ru.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=Qs(a),$s(a,e,n,r),Wa(n,a),!1}n=n.return}while(n!==null);return!1}var tc=Error(i(461)),nc=!1;function rc(e,t,n,r){t.child=e===null?Ba(t,null,n,r):za(t,e.child,n,r)}function ic(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return ta(t),r=xo(e,t,n,o,a,i),s=To(),e!==null&&!nc?(Eo(e,t,i),Oc(e,t,i)):(R&&s&&ji(t),t.flags|=1,rc(e,t,r,i),t.child)}function ac(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!ui(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,oc(e,t,a,r,i)):(e=pi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!kc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Or:n,n(o,r)&&e.ref===t.ref)return Oc(e,t,i)}return t.flags|=1,e=di(a,r),e.ref=t.ref,e.return=t,t.child=e}function oc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Or(a,r)&&e.ref===t.ref)if(nc=!1,t.pendingProps=r=a,kc(e,i))e.flags&131072&&(nc=!0);else return t.lanes=e.lanes,Oc(e,t,i)}return mc(e,t,n,r,i)}function sc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return lc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&xa(t,a===null?null:a.cachePool),a===null?Qa():Za(t,a),io(t);else return r=t.lanes=536870912,lc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&xa(t,null),Qa(),ao(t)):(xa(t,a.cachePool),Za(t,a),ao(t),t.memoizedState=null);return rc(e,t,i,n),t.child}function cc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function lc(e,t,n,r,i){var a=ba();return a=a===null?null:{parent:ca._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&xa(t,null),Qa(),io(t),e!==null&&$i(e,t,r,!0),t.childLanes=i,null}function uc(e,t){return t=Cc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function dc(e,t,n){return za(t,e.child,null,n),e=uc(t,t.pendingProps),e.flags|=2,oo(t),t.memoizedState=null,e}function fc(e,t,n){var r=t.pendingProps,a=(t.flags&128)!=0;if(t.flags&=-129,e===null){if(R){if(r.mode===`hidden`)return e=uc(t,r),t.lanes=536870912,cc(null,e);if(ro(t),(e=Fi)?(e=rf(e,Li),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ei===null?null:{id:Di,overflow:Oi},retryLane:536870912,hydrationErrors:null},n=gi(e),n.return=t,t.child=n,Pi=t,Fi=null)):e=null,e===null)throw zi(t);return t.lanes=536870912,null}return uc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(ro(t),a)if(t.flags&256)t.flags&=-257,t=dc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558));else if(nc||$i(e,t,n,!1),a=(n&e.childLanes)!==0,nc||a){if(r=q,r!==null&&(s=st(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,si(e,s),hu(r,e,s),tc;Du(),t=dc(e,t,n)}else e=o.treeContext,Fi=cf(s.nextSibling),Pi=t,R=!0,Ii=null,Li=!1,e!==null&&Ni(t,e),t=uc(t,r),t.flags|=4096;return t}return e=di(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function pc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function mc(e,t,n,r,i){return ta(t),n=xo(e,t,n,r,void 0,i),r=To(),e!==null&&!nc?(Eo(e,t,i),Oc(e,t,i)):(R&&r&&ji(t),t.flags|=1,rc(e,t,n,i),t.child)}function hc(e,t,n,r,i,a){return ta(t),t.updateQueue=null,n=Co(t,r,n,i),So(e),r=To(),e!==null&&!nc?(Eo(e,t,a),Oc(e,t,a)):(R&&r&&ji(t),t.flags|=1,rc(e,t,n,a),t.child)}function gc(e,t,n,r,i){if(ta(t),t.stateNode===null){var a=li,o=n.contextType;typeof o==`object`&&o&&(a=na(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Hs,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},Ha(t),o=n.contextType,a.context=typeof o==`object`&&o?na(o):li,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(Vs(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Hs.enqueueReplaceState(a,a.state,null),qa(t,r,a,i),Ka(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Gs(n,s);a.props=c;var l=a.context,u=n.contextType;o=li,typeof u==`object`&&u&&(o=na(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Ws(t,a,r,o),Va=!1;var f=t.memoizedState;a.state=f,qa(t,r,a,i),Ka(),l=t.memoizedState,s||f!==l||Va?(typeof d==`function`&&(Vs(t,n,d,r),l=t.memoizedState),(c=Va||Us(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,Ua(e,t),o=t.memoizedProps,u=Gs(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=li,typeof l==`object`&&l&&(c=na(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Ws(t,a,r,c),Va=!1,f=t.memoizedState,a.state=f,qa(t,r,a,i),Ka();var p=t.memoizedState;o!==d||f!==p||Va||e!==null&&e.dependencies!==null&&ea(e.dependencies)?(typeof s==`function`&&(Vs(t,n,s,r),p=t.memoizedState),(u=Va||Us(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&ea(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,pc(e,t),r=(t.flags&128)!=0,a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=za(t,e.child,null,i),t.child=za(t,null,n,i)):rc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=Oc(e,t,i),e}function _c(e,t,n,r){return Ui(),t.flags|=256,rc(e,t,n,r),t.child}var vc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function yc(e){return{baseLanes:e,cachePool:Sa()}}function bc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Jl),e}function xc(e,t,n){var r=t.pendingProps,a=!1,o=(t.flags&128)!=0,s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:(so.current&2)!=0),s&&(a=!0,t.flags&=-129),s=(t.flags&32)!=0,t.flags&=-33,e===null){if(R){if(a?no(t):ao(t),(e=Fi)?(e=rf(e,Li),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ei===null?null:{id:Di,overflow:Oi},retryLane:536870912,hydrationErrors:null},n=gi(e),n.return=t,t.child=n,Pi=t,Fi=null)):e=null,e===null)throw zi(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,a?(ao(t),a=t.mode,c=Cc({mode:`hidden`,children:c},a),r=mi(r,a,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=yc(n),r.childLanes=bc(e,s,n),t.memoizedState=vc,cc(null,r)):(no(t),Sc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(no(t),t.flags&=-257,t=wc(e,t,n)):t.memoizedState===null?(ao(t),c=r.fallback,a=t.mode,r=Cc({mode:`visible`,children:r.children},a),c=mi(c,a,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,za(t,e.child,null,n),r=t.child,r.memoizedState=yc(n),r.childLanes=bc(e,s,n),t.memoizedState=vc,t=cc(null,r)):(ao(t),t.child=e.child,t.flags|=128,t=null);else if(no(t),of(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(i(419)),r.stack=``,r.digest=s,Gi({value:r,source:null,stack:null}),t=wc(e,t,n)}else if(nc||$i(e,t,n,!1),s=(n&e.childLanes)!==0,nc||s){if(s=q,s!==null&&(r=st(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,si(e,r),hu(s,e,r),tc;af(c)||Du(),t=wc(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Fi=cf(c.nextSibling),Pi=t,R=!0,Ii=null,Li=!1,e!==null&&Ni(t,e),t=Sc(t,r.children),t.flags|=4096);return t}return a?(ao(t),c=r.fallback,a=t.mode,l=e.child,u=l.sibling,r=di(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=mi(c,a,n,null),c.flags|=2):c=di(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,cc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=yc(n):(a=c.cachePool,a===null?a=Sa():(l=ca._currentValue,a=a.parent===l?a:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:a}),r.memoizedState=c,r.childLanes=bc(e,s,n),t.memoizedState=vc,cc(e.child,r)):(no(t),n=e.child,e=n.sibling,n=di(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function Sc(e,t){return t=Cc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function Cc(e,t){return e=L(22,e,null,t),e.lanes=0,e}function wc(e,t,n){return za(t,e.child,null,n),e=Sc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Tc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Zi(e.return,t,n)}function Ec(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function Dc(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=so.current,s=(o&2)!=0;if(s?(o=o&1|2,t.flags|=128):o&=1,j(so,o),rc(e,t,r,n),r=R?Ci:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Tc(e,n,t);else if(e.tag===19)Tc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&co(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),Ec(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&co(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}Ec(t,!0,n,null,a,r);break;case`together`:Ec(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Oc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Gl|=t.lanes,(n&t.childLanes)===0)if(e!==null){if($i(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=di(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=di(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function kc(e,t){return(e.lanes&t)===0?(e=e.dependencies,!!(e!==null&&ea(e))):!0}function Ac(e,t,n){switch(t.tag){case 3:ge(t,t.stateNode.containerInfo),Yi(t,ca,e.memoizedState.cache),Ui();break;case 27:case 5:ve(t);break;case 4:ge(t,t.stateNode.containerInfo);break;case 10:Yi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,ro(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(no(t),e=Oc(e,t,n),e===null?null:e.sibling):xc(e,t,n):(no(t),t.flags|=128,null);no(t);break;case 19:var i=(e.flags&128)!=0;if(r=(n&t.childLanes)!==0,r||=($i(e,t,n,!1),(n&t.childLanes)!==0),i){if(r)return Dc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),j(so,so.current),r)break;return null;case 22:return t.lanes=0,sc(e,t,n,t.pendingProps);case 24:Yi(t,ca,e.memoizedState.cache)}return Oc(e,t,n)}function jc(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)nc=!0;else{if(!kc(e,n)&&!(t.flags&128))return nc=!1,Ac(e,t,n);nc=!!(e.flags&131072)}else nc=!1,R&&t.flags&1048576&&Ai(t,Ci,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=ka(t.elementType),t.type=e,typeof e==`function`)ui(e)?(r=Gs(e,r),t.tag=1,t=gc(null,t,e,r,n)):(t.tag=0,t=mc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===w){t.tag=11,t=ic(null,t,e,r,n);break a}else if(a===ee){t.tag=14,t=ac(null,t,e,r,n);break a}}throw t=ae(e)||e,Error(i(306,t,``))}}return t;case 0:return mc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=Gs(r,t.pendingProps),gc(e,t,r,a,n);case 3:a:{if(ge(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,Ua(e,t),qa(t,r,null,n);var s=t.memoizedState;if(r=s.cache,Yi(t,ca,r),r!==o.cache&&Qi(t,[ca],n,!0),Ka(),r=s.element,o.isDehydrated)if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=_c(e,t,r,n);break a}else if(r!==a){a=yi(Error(i(424)),t),Gi(a),t=_c(e,t,r,n);break a}else{switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(Fi=cf(e.firstChild),Pi=t,R=!0,Ii=null,Li=!0,n=Ba(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Ui(),r===a){t=Oc(e,t,n);break a}rc(e,t,r,n)}t=t.child}return t;case 26:return pc(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:R||(n=t.type,e=t.pendingProps,r=Bd(me.current).createElement(n),r[pt]=t,r[M]=e,Pd(r,n,e),Tt(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return ve(t),e===null&&R&&(r=t.stateNode=ff(t.type,t.pendingProps,me.current),Pi=t,Li=!0,a=Fi,Zd(t.type)?(lf=a,Fi=cf(r.firstChild)):Fi=a),rc(e,t,t.pendingProps.children,n),pc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&R&&((a=r=Fi)&&(r=tf(r,t.type,t.pendingProps,Li),r===null?a=!1:(t.stateNode=r,Pi=t,Fi=cf(r.firstChild),Li=!1,a=!0)),a||zi(t)),ve(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Ud(a,o)?r=null:s!==null&&Ud(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=xo(e,t,wo,null,null,n),Qf._currentValue=a),pc(e,t),rc(e,t,r,n),t.child;case 6:return e===null&&R&&((e=n=Fi)&&(n=nf(n,t.pendingProps,Li),n===null?e=!1:(t.stateNode=n,Pi=t,Fi=null,e=!0)),e||zi(t)),null;case 13:return xc(e,t,n);case 4:return ge(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=za(t,null,r,n):rc(e,t,r,n),t.child;case 11:return ic(e,t,t.type,t.pendingProps,n);case 7:return rc(e,t,t.pendingProps,n),t.child;case 8:return rc(e,t,t.pendingProps.children,n),t.child;case 12:return rc(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,Yi(t,t.type,r.value),rc(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,ta(t),a=na(a),r=r(a),t.flags|=1,rc(e,t,r,n),t.child;case 14:return ac(e,t,t.type,t.pendingProps,n);case 15:return oc(e,t,t.type,t.pendingProps,n);case 19:return Dc(e,t,n);case 31:return fc(e,t,n);case 22:return sc(e,t,n,t.pendingProps);case 24:return ta(t),r=na(ca),e===null?(a=ba(),a===null&&(a=q,o=la(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},Ha(t),Yi(t,ca,a)):((e.lanes&n)!==0&&(Ua(e,t),qa(t,null,null,n),Ka()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,Yi(t,ca,r),r!==a.cache&&Qi(t,[ca],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),Yi(t,ca,r))),rc(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function Mc(e){e.flags|=4}function Nc(e,t,n,r,i){if((t=(e.mode&32)!=0)&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i)if(e.stateNode.complete)e.flags|=8192;else if(wu())e.flags|=8192;else throw Aa=Ea,wa}else e.flags&=-16777217}function Pc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t))if(wu())e.flags|=8192;else throw Aa=Ea,wa}function Fc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:tt(),e.lanes|=t,Yl|=t)}function Ic(e,t){if(!R)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function Lc(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Rc(e,t,n){var r=t.pendingProps;switch(Mi(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Lc(t),null;case 1:return Lc(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Xi(ca),_e(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Hi(t)?Mc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Wi())),Lc(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(Mc(t),o===null?(Lc(t),Nc(t,a,null,r,n)):(Lc(t),Pc(t,o))):o?o===e.memoizedState?(Lc(t),t.flags&=-16777217):(Mc(t),Lc(t),Pc(t,o)):(e=e.memoizedProps,e!==r&&Mc(t),Lc(t),Nc(t,a,e,r,n)),null;case 27:if(ye(t),n=me.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Mc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Lc(t),null}e=fe.current,Hi(t)?Bi(t,e):(e=ff(a,r,n),t.stateNode=e,Mc(t))}return Lc(t),null;case 5:if(ye(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Mc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Lc(t),null}if(o=fe.current,Hi(t))Bi(t,o);else{var s=Bd(me.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[pt]=t,o[M]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Pd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&Mc(t)}}return Lc(t),Nc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&Mc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=me.current,Hi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Pi,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[pt]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Md(e.nodeValue,n)),e||zi(t,!0)}else e=Bd(e).createTextNode(r),e[pt]=t,t.stateNode=e}return Lc(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Hi(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[pt]=t}else Ui(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Lc(t),e=!1}else n=Wi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(oo(t),t):(oo(t),null);if(t.flags&128)throw Error(i(558))}return Lc(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=Hi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[pt]=t}else Ui(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Lc(t),a=!1}else a=Wi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(oo(t),t):(oo(t),null)}return oo(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Fc(t,t.updateQueue),Lc(t),null);case 4:return _e(),e===null&&Sd(t.stateNode.containerInfo),Lc(t),null;case 10:return Xi(t.type),Lc(t),null;case 19:if(de(so),r=t.memoizedState,r===null)return Lc(t),null;if(a=(t.flags&128)!=0,o=r.rendering,o===null)if(a)Ic(r,!1);else{if(Wl!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=co(e),o!==null){for(t.flags|=128,Ic(r,!1),e=o.updateQueue,t.updateQueue=e,Fc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)fi(n,e),n=n.sibling;return j(so,so.current&1|2),R&&ki(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Me()>tu&&(t.flags|=128,a=!0,Ic(r,!1),t.lanes=4194304)}else{if(!a)if(e=co(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,Fc(t,e),Ic(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!R)return Lc(t),null}else 2*Me()-r.renderingStartTime>tu&&n!==536870912&&(t.flags|=128,a=!0,Ic(r,!1),t.lanes=4194304);r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(Lc(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Me(),e.sibling=null,n=so.current,j(so,a?n&1|2:n&1),R&&ki(t,r.treeForkCount),e);case 22:case 23:return oo(t),$a(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(Lc(t),t.subtreeFlags&6&&(t.flags|=8192)):Lc(t),n=t.updateQueue,n!==null&&Fc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&de(ya),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Xi(ca),Lc(t),null;case 25:return null;case 30:return null}throw Error(i(156,t.tag))}function zc(e,t){switch(Mi(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Xi(ca),_e(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ye(t),null;case 31:if(t.memoizedState!==null){if(oo(t),t.alternate===null)throw Error(i(340));Ui()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(oo(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Ui()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return de(so),null;case 4:return _e(),null;case 10:return Xi(t.type),null;case 22:case 23:return oo(t),$a(),e!==null&&de(ya),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Xi(ca),null;case 25:return null;default:return null}}function Bc(e,t){switch(Mi(t),t.tag){case 3:Xi(ca),_e();break;case 26:case 27:case 5:ye(t);break;case 4:_e();break;case 31:t.memoizedState!==null&&oo(t);break;case 13:oo(t);break;case 19:de(so);break;case 10:Xi(t.type);break;case 22:case 23:oo(t),$a(),e!==null&&de(ya);break;case 24:Xi(ca)}}function Vc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function Hc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function Uc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Ja(t,n)}catch(t){Z(e,e.return,t)}}}function Wc(e,t,n){n.props=Gs(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function Gc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function Kc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null)if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}function qc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function Jc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[M]=t}catch(t){Z(e,e.return,t)}}function Yc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function Xc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Yc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Zc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=on));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Zc(e,t,n),e=e.sibling;e!==null;)Zc(e,t,n),e=e.sibling}function Qc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Qc(e,t,n),e=e.sibling;e!==null;)Qc(e,t,n),e=e.sibling}function $c(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[pt]=e,t[M]=n}catch(t){Z(e,e.return,t)}}var el=!1,tl=!1,nl=!1,rl=typeof WeakSet==`function`?WeakSet:Set,il=null;function al(e,t){if(e=e.containerInfo,Rd=sp,e=jr(e),Mr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||a!==0&&f.nodeType!==3||(c=s+a),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===a&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n||={start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,il=t;il!==null;)if(t=il,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,il=e;else for(;il!==null;){switch(t=il,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=Gs(n.type,a);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Z(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(i(163))}if(e=t.sibling,e!==null){e.return=t.return,il=e;break}il=t.return}}function ol(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:bl(e,n),r&4&&Vc(5,n);break;case 1:if(bl(e,n),r&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=Gs(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}r&64&&Uc(n),r&512&&Gc(n,n.return);break;case 3:if(bl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Ja(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&$c(n);case 26:case 5:bl(e,n),t===null&&r&4&&qc(n),r&512&&Gc(n,n.return);break;case 12:bl(e,n);break;case 31:bl(e,n),r&4&&dl(e,n);break;case 13:bl(e,n),r&4&&fl(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ju.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||el,!r){t=t!==null&&t.memoizedState!==null||tl,i=el;var a=tl;el=r,(tl=t)&&!a?Sl(e,n,(n.subtreeFlags&8772)!=0):bl(e,n),el=i,tl=a}break;case 30:break;default:bl(e,n)}}function sl(e){var t=e.alternate;t!==null&&(e.alternate=null,sl(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&bt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var G=null,cl=!1;function ll(e,t,n){for(n=n.child;n!==null;)ul(e,t,n),n=n.sibling}function ul(e,t,n){if(He&&typeof He.onCommitFiberUnmount==`function`)try{He.onCommitFiberUnmount(Ve,n)}catch{}switch(n.tag){case 26:tl||Kc(n,t),ll(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:tl||Kc(n,t);var r=G,i=cl;Zd(n.type)&&(G=n.stateNode,cl=!1),ll(e,t,n),pf(n.stateNode),G=r,cl=i;break;case 5:tl||Kc(n,t);case 6:if(r=G,i=cl,G=null,ll(e,t,n),G=r,cl=i,G!==null)if(cl)try{(G.nodeType===9?G.body:G.nodeName===`HTML`?G.ownerDocument.body:G).removeChild(n.stateNode)}catch(e){Z(n,t,e)}else try{G.removeChild(n.stateNode)}catch(e){Z(n,t,e)}break;case 18:G!==null&&(cl?(e=G,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(G,n.stateNode));break;case 4:r=G,i=cl,G=n.stateNode.containerInfo,cl=!0,ll(e,t,n),G=r,cl=i;break;case 0:case 11:case 14:case 15:Hc(2,n,t),tl||Hc(4,n,t),ll(e,t,n);break;case 1:tl||(Kc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Wc(n,t,r)),ll(e,t,n);break;case 21:ll(e,t,n);break;case 22:tl=(r=tl)||n.memoizedState!==null,ll(e,t,n),tl=r;break;default:ll(e,t,n)}}function dl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Z(t,t.return,e)}}}function fl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Z(t,t.return,e)}}function pl(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new rl),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new rl),t;default:throw Error(i(435,e.tag))}}function ml(e,t){var n=pl(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Yu.bind(null,e,t);t.then(r,r)}})}function hl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){G=c.stateNode,cl=!1;break a}break;case 5:G=c.stateNode,cl=!1;break a;case 3:case 4:G=c.stateNode.containerInfo,cl=!0;break a}c=c.return}if(G===null)throw Error(i(160));ul(o,s,a),G=null,cl=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)_l(t,e),t=t.sibling}var gl=null;function _l(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:hl(t,e),vl(e),r&4&&(Hc(3,e,e.return),Vc(3,e),Hc(5,e,e.return));break;case 1:hl(t,e),vl(e),r&512&&(tl||n===null||Kc(n,n.return)),r&64&&el&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=gl;if(hl(t,e),vl(e),r&512&&(tl||n===null||Kc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null)if(r===null)if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[yt]||o[pt]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Pd(o,r,n),o[pt]=e,Tt(o),r=o;break a;case`link`:var s=Vf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Vf(`meta`,`content`,a).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;default:throw Error(i(468,r))}o[pt]=e,Tt(o),r=o}e.stateNode=r}else Hf(a,e.type,e.stateNode);else e.stateNode=If(a,r,e.memoizedProps);else o===r?r===null&&e.stateNode!==null&&Jc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Hf(a,e.type,e.stateNode):If(a,r,e.memoizedProps))}break;case 27:hl(t,e),vl(e),r&512&&(tl||n===null||Kc(n,n.return)),n!==null&&r&4&&Jc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(hl(t,e),vl(e),r&512&&(tl||n===null||Kc(n,n.return)),e.flags&32){a=e.stateNode;try{Zt(a,``)}catch(t){Z(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,Jc(e,a,n===null?a:n.memoizedProps)),r&1024&&(nl=!0);break;case 6:if(hl(t,e),vl(e),r&4){if(e.stateNode===null)throw Error(i(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Z(e,e.return,t)}}break;case 3:if(Bf=null,a=gl,gl=gf(t.containerInfo),hl(t,e),gl=a,vl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Z(e,e.return,t)}nl&&(nl=!1,yl(e));break;case 4:r=gl,gl=gf(e.stateNode.containerInfo),hl(t,e),vl(e),gl=r;break;case 12:hl(t,e),vl(e);break;case 31:hl(t,e),vl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ml(e,r)));break;case 13:hl(t,e),vl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&($l=Me()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ml(e,r)));break;case 22:a=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=el,d=tl;if(el=u||a,tl=d||l,hl(t,e),tl=d,el=u,vl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||l||el||tl||xl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Z(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=a?``:l.memoizedProps}catch(e){Z(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;a?$d(m,!0):$d(l.stateNode,!1)}catch(e){Z(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,ml(e,n))));break;case 19:hl(t,e),vl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ml(e,r)));break;case 30:break;case 21:break;default:hl(t,e),vl(e)}}function vl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Yc(r)){n=r;break}r=r.return}if(n==null)throw Error(i(160));switch(n.tag){case 27:var a=n.stateNode;Qc(e,Xc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&(Zt(o,``),n.flags&=-33),Qc(e,Xc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Zc(e,Xc(e),s);break;default:throw Error(i(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function yl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;yl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function bl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)ol(e,t.alternate,t),t=t.sibling}function xl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Hc(4,t,t.return),xl(t);break;case 1:Kc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Wc(t,t.return,n),xl(t);break;case 27:pf(t.stateNode);case 26:case 5:Kc(t,t.return),xl(t);break;case 22:t.memoizedState===null&&xl(t);break;case 30:xl(t);break;default:xl(t)}e=e.sibling}}function Sl(e,t,n){for(n&&=(t.subtreeFlags&8772)!=0,t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:Sl(i,a,n),Vc(4,a);break;case 1:if(Sl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)H(c[i],s)}catch(e){Z(r,r.return,e)}}n&&o&64&&Uc(a),Gc(a,a.return);break;case 27:$c(a);case 26:case 5:Sl(i,a,n),n&&r===null&&o&4&&qc(a),Gc(a,a.return);break;case 12:Sl(i,a,n);break;case 31:Sl(i,a,n),n&&o&4&&dl(i,a);break;case 13:Sl(i,a,n),n&&o&4&&fl(i,a);break;case 22:a.memoizedState===null&&Sl(i,a,n),Gc(a,a.return);break;case 30:break;default:Sl(i,a,n)}t=t.sibling}}function Cl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&ua(n))}function wl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ua(e))}function Tl(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)El(e,t,n,r),t=t.sibling}function El(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:Tl(e,t,n,r),i&2048&&Vc(9,t);break;case 1:Tl(e,t,n,r);break;case 3:Tl(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&ua(e)));break;case 12:if(i&2048){Tl(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else Tl(e,t,n,r);break;case 31:Tl(e,t,n,r);break;case 13:Tl(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?Tl(e,t,n,r):(a._visibility|=2,Dl(e,t,n,r,(t.subtreeFlags&10256)!=0||!1)):a._visibility&2?Tl(e,t,n,r):Ol(e,t),i&2048&&Cl(o,t);break;case 24:Tl(e,t,n,r),i&2048&&wl(t.alternate,t);break;default:Tl(e,t,n,r)}}function Dl(e,t,n,r,i){for(i&&=(t.subtreeFlags&10256)!=0||!1,t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Dl(a,o,s,c,i),Vc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Dl(a,o,s,c,i)):u._visibility&2?Dl(a,o,s,c,i):Ol(a,o),i&&l&2048&&Cl(o.alternate,o);break;case 24:Dl(a,o,s,c,i),i&&l&2048&&wl(o.alternate,o);break;default:Dl(a,o,s,c,i)}t=t.sibling}}function Ol(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:Ol(n,r),i&2048&&Cl(r.alternate,r);break;case 24:Ol(n,r),i&2048&&wl(r.alternate,r);break;default:Ol(n,r)}t=t.sibling}}var kl=8192;function Al(e,t,n){if(e.subtreeFlags&kl)for(e=e.child;e!==null;)jl(e,t,n),e=e.sibling}function jl(e,t,n){switch(e.tag){case 26:Al(e,t,n),e.flags&kl&&e.memoizedState!==null&&Gf(n,gl,e.memoizedState,e.memoizedProps);break;case 5:Al(e,t,n);break;case 3:case 4:var r=gl;gl=gf(e.stateNode.containerInfo),Al(e,t,n),gl=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=kl,kl=16777216,Al(e,t,n),kl=r):Al(e,t,n));break;default:Al(e,t,n)}}function Ml(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Nl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];il=r,Il(r,e)}Ml(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Pl(e),e=e.sibling}function Pl(e){switch(e.tag){case 0:case 11:case 15:Nl(e),e.flags&2048&&Hc(9,e,e.return);break;case 3:Nl(e);break;case 12:Nl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Fl(e)):Nl(e);break;default:Nl(e)}}function Fl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];il=r,Il(r,e)}Ml(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Hc(8,t,t.return),Fl(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Fl(t));break;default:Fl(t)}e=e.sibling}}function Il(e,t){for(;il!==null;){var n=il;switch(n.tag){case 0:case 11:case 15:Hc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:ua(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,il=r;else a:for(n=e;il!==null;){r=il;var i=r.sibling,a=r.return;if(sl(r),r===n){il=null;break a}if(i!==null){i.return=a,il=i;break a}il=a}}}var Ll={getCacheForType:function(e){var t=na(ca),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return na(ca).controller.signal}},Rl=typeof WeakMap==`function`?WeakMap:Map,K=0,q=null,J=null,Y=0,X=0,zl=null,Bl=!1,Vl=!1,Hl=!1,Ul=0,Wl=0,Gl=0,Kl=0,ql=0,Jl=0,Yl=0,Xl=null,Zl=null,Ql=!1,$l=0,eu=0,tu=1/0,nu=null,ru=null,iu=0,au=null,ou=null,su=0,cu=0,lu=null,uu=null,du=0,fu=null;function pu(){return K&2&&Y!==0?Y&-Y:k.T===null?ut():dd()}function mu(){if(Jl===0)if(!(Y&536870912)||R){var e=Ye;Ye<<=1,!(Ye&3932160)&&(Ye=262144),Jl=e}else Jl=536870912;return e=eo.current,e!==null&&(e.flags|=32),Jl}function hu(e,t,n){(e===q&&(X===2||X===9)||e.cancelPendingCommit!==null)&&(Su(e,0),yu(e,Y,Jl,!1)),rt(e,n),(!(K&2)||e!==q)&&(e===q&&(!(K&2)&&(Kl|=n),Wl===4&&yu(e,Y,Jl,!1)),rd(e))}function gu(e,t,n){if(K&6)throw Error(i(327));var r=!n&&(t&127)==0&&(t&e.expiredLanes)===0||$e(e,t),a=r?Au(e,t):Ou(e,t,!0),o=r;do{if(a===0){Vl&&!r&&yu(e,t,0,!1);break}else{if(n=e.current.alternate,o&&!vu(n)){a=Ou(e,t,!1),o=!1;continue}if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=Xl;var l=c.current.memoizedState.isDehydrated;if(l&&(Su(c,s).flags|=256),s=Ou(c,s,!1),s!==2){if(Hl&&!l){c.errorRecoveryDisabledLanes|=o,Kl|=o,a=4;break a}o=Zl,Zl=a,o!==null&&(Zl===null?Zl=o:Zl.push.apply(Zl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){Su(e,0),yu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t)break;case 6:yu(r,t,Jl,!Bl);break a;case 2:Zl=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=$l+300-Me(),10<a)){if(yu(r,t,Jl,!Bl),Qe(r,0,!0)!==0)break a;su=t,r.timeoutHandle=Kd(_u.bind(null,r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Bl,o,`Throttled`,-0,0),a);break a}_u(r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Bl,o,null,-0,0)}}break}while(1);rd(e)}function _u(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:on},jl(t,a,d);var m=(a&62914560)===a?$l-Me():(a&4194048)===a?eu-Me():0;if(m=qf(d,m),m!==null){su=a,e.cancelPendingCommit=m(Lu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),yu(e,a,o,!l);return}}Lu(e,t,a,n,r,i,o,s,c)}function vu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Dr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function yu(e,t,n,r){t&=~ql,t&=~Kl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-We(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&at(e,n,t)}function bu(){return K&6?!0:(id(0,!1),!1)}function xu(){if(J!==null){if(X===0)var e=J.return;else e=J,Ji=qi=null,Do(e),Na=null,Pa=0,e=J;for(;e!==null;)Bc(e.alternate,e),e=e.return;J=null}}function Su(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),su=0,xu(),q=e,J=n=di(e.current,null),Y=t,X=0,zl=null,Bl=!1,Vl=$e(e,t),Hl=!1,Yl=Jl=ql=Kl=Gl=Wl=0,Zl=Xl=null,Ql=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-We(r),a=1<<i;t|=e[i],r&=~a}return Ul=t,ii(),n}function Cu(e,t){U=null,k.H=Ls,t===Ca||t===Ta?(t=ja(),X=3):t===wa?(t=ja(),X=4):X=t===tc?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,zl=t,J===null&&(Wl=1,Ys(e,yi(t,e.current)))}function wu(){var e=eo.current;return e===null?!0:(Y&4194048)===Y?to===null:(Y&62914560)===Y||Y&536870912?e===to:!1}function Tu(){var e=k.H;return k.H=Ls,e===null?Ls:e}function Eu(){var e=k.A;return k.A=Ll,e}function Du(){Wl=4,Bl||(Y&4194048)!==Y&&eo.current!==null||(Vl=!0),!(Gl&134217727)&&!(Kl&134217727)||q===null||yu(q,Y,Jl,!1)}function Ou(e,t,n){var r=K;K|=2;var i=Tu(),a=Eu();(q!==e||Y!==t)&&(nu=null,Su(e,t)),t=!1;var o=Wl;a:do try{if(X!==0&&J!==null){var s=J,c=zl;switch(X){case 8:xu(),o=6;break a;case 3:case 2:case 9:case 6:eo.current===null&&(t=!0);var l=X;if(X=0,zl=null,Pu(e,s,c,l),n&&Vl){o=0;break a}break;default:l=X,X=0,zl=null,Pu(e,s,c,l)}}ku(),o=Wl;break}catch(t){Cu(e,t)}while(1);return t&&e.shellSuspendCounter++,Ji=qi=null,K=r,k.H=i,k.A=a,J===null&&(q=null,Y=0,ii()),o}function ku(){for(;J!==null;)Mu(J)}function Au(e,t){var n=K;K|=2;var r=Tu(),a=Eu();q!==e||Y!==t?(nu=null,tu=Me()+500,Su(e,t)):Vl=$e(e,t);a:do try{if(X!==0&&J!==null){t=J;var o=zl;b:switch(X){case 1:X=0,zl=null,Pu(e,t,o,1);break;case 2:case 9:if(Da(o)){X=0,zl=null,Nu(t);break}t=function(){X!==2&&X!==9||q!==e||(X=7),rd(e)},o.then(t,t);break a;case 3:X=7;break a;case 4:X=5;break a;case 7:Da(o)?(X=0,zl=null,Nu(t)):(X=0,zl=null,Pu(e,t,o,7));break;case 5:var s=null;switch(J.tag){case 26:s=J.memoizedState;case 5:case 27:var c=J;if(s?Wf(s):c.stateNode.complete){X=0,zl=null;var l=c.sibling;if(l!==null)J=l;else{var u=c.return;u===null?J=null:(J=u,Fu(u))}break b}}X=0,zl=null,Pu(e,t,o,5);break;case 6:X=0,zl=null,Pu(e,t,o,6);break;case 8:xu(),Wl=6;break a;default:throw Error(i(462))}}ju();break}catch(t){Cu(e,t)}while(1);return Ji=qi=null,k.H=r,k.A=a,K=n,J===null?(q=null,Y=0,ii(),Wl):0}function ju(){for(;J!==null&&!Ae();)Mu(J)}function Mu(e){var t=jc(e.alternate,e,Ul);e.memoizedProps=e.pendingProps,t===null?Fu(e):J=t}function Nu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=hc(n,t,t.pendingProps,t.type,void 0,Y);break;case 11:t=hc(n,t,t.pendingProps,t.type.render,t.ref,Y);break;case 5:Do(t);default:Bc(n,t),t=J=fi(t,Ul),t=jc(n,t,Ul)}e.memoizedProps=e.pendingProps,t===null?Fu(e):J=t}function Pu(e,t,n,r){Ji=qi=null,Do(t),Na=null,Pa=0;var i=t.return;try{if(ec(e,i,t,n,Y)){Wl=1,Ys(e,yi(n,e.current)),J=null;return}}catch(t){if(i!==null)throw J=i,t;Wl=1,Ys(e,yi(n,e.current)),J=null;return}t.flags&32768?(R||r===1?e=!0:Vl||Y&536870912?e=!1:(Bl=e=!0,(r===2||r===9||r===3||r===6)&&(r=eo.current,r!==null&&r.tag===13&&(r.flags|=16384))),Iu(t,e)):Fu(t)}function Fu(e){var t=e;do{if(t.flags&32768){Iu(t,Bl);return}e=t.return;var n=Rc(t.alternate,t,Ul);if(n!==null){J=n;return}if(t=t.sibling,t!==null){J=t;return}J=t=e}while(t!==null);Wl===0&&(Wl=5)}function Iu(e,t){do{var n=zc(e.alternate,e);if(n!==null){n.flags&=32767,J=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){J=e;return}J=e=n}while(e!==null);Wl=6,J=null}function Lu(e,t,n,r,a,o,s,c,l){e.cancelPendingCommit=null;do Hu();while(iu!==0);if(K&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));if(o=t.lanes|t.childLanes,o|=ri,it(e,n,o,s,c,l),e===q&&(J=q=null,Y=0),ou=t,au=e,su=n,cu=o,lu=a,uu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Xu(Ie,function(){return Uu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=(t.flags&13878)!=0,t.subtreeFlags&13878||r){r=k.T,k.T=null,a=A.p,A.p=2,s=K,K|=4;try{al(e,t,n)}finally{K=s,A.p=a,k.T=r}}iu=1,Ru(),zu(),Bu()}}function Ru(){if(iu===1){iu=0;var e=au,t=ou,n=(t.flags&13878)!=0;if(t.subtreeFlags&13878||n){n=k.T,k.T=null;var r=A.p;A.p=2;var i=K;K|=4;try{_l(t,e);var a=zd,o=jr(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&Ar(s.ownerDocument.documentElement,s)){if(c!==null&&Mr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=P(s,h),v=P(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{K=i,A.p=r,k.T=n}}e.current=t,iu=2}}function zu(){if(iu===2){iu=0;var e=au,t=ou,n=(t.flags&8772)!=0;if(t.subtreeFlags&8772||n){n=k.T,k.T=null;var r=A.p;A.p=2;var i=K;K|=4;try{ol(e,t.alternate,t)}finally{K=i,A.p=r,k.T=n}}iu=3}}function Bu(){if(iu===4||iu===3){iu=0,je();var e=au,t=ou,n=su,r=uu;t.subtreeFlags&10256||t.flags&10256?iu=5:(iu=0,ou=au=null,Vu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(ru=null),lt(n),t=t.stateNode,He&&typeof He.onCommitFiberRoot==`function`)try{He.onCommitFiberRoot(Ve,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=k.T,i=A.p,A.p=2,k.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{k.T=t,A.p=i}}su&3&&Hu(),rd(e),i=e.pendingLanes,n&261930&&i&42?e===fu?du++:(du=0,fu=e):du=0,id(0,!1)}}function Vu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,ua(t)))}function Hu(){return Ru(),zu(),Bu(),Uu()}function Uu(){if(iu!==5)return!1;var e=au,t=cu;cu=0;var n=lt(su),r=k.T,a=A.p;try{A.p=32>n?32:n,k.T=null,n=lu,lu=null;var o=au,s=su;if(iu=0,ou=au=null,su=0,K&6)throw Error(i(331));var c=K;if(K|=4,Pl(o.current),El(o,o.current,s,n),K=c,id(0,!1),He&&typeof He.onPostCommitFiberRoot==`function`)try{He.onPostCommitFiberRoot(Ve,o)}catch{}return!0}finally{A.p=a,k.T=r,Vu(e,t)}}function Wu(e,t,n){t=yi(n,t),t=Zs(e.stateNode,t,2),e=B(e,t,2),e!==null&&(rt(e,2),rd(e))}function Z(e,t,n){if(e.tag===3)Wu(e,e,n);else for(;t!==null;){if(t.tag===3){Wu(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(ru===null||!ru.has(r))){e=yi(n,e),n=Qs(2),r=B(t,n,2),r!==null&&($s(n,r,t,e),rt(r,2),rd(r));break}}t=t.return}}function Gu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Rl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Hl=!0,i.add(n),e=Ku.bind(null,e,t,n),t.then(e,e))}function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,q===e&&(Y&n)===n&&(Wl===4||Wl===3&&(Y&62914560)===Y&&300>Me()-$l?!(K&2)&&Su(e,0):ql|=n,Yl===Y&&(Yl=0)),rd(e)}function qu(e,t){t===0&&(t=tt()),e=si(e,t),e!==null&&(rt(e,t),rd(e))}function Ju(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qu(e,n)}function Yu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),qu(e,n)}function Xu(e,t){return Oe(e,t)}var Zu=null,Qu=null,$u=!1,ed=!1,td=!1,nd=0;function rd(e){e!==Qu&&e.next===null&&(Qu===null?Zu=Qu=e:Qu=Qu.next=e),ed=!0,$u||($u=!0,ud())}function id(e,t){if(!td&&ed){td=!0;do for(var n=!1,r=Zu;r!==null;){if(!t)if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-We(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,ld(r,a))}else a=Y,a=Qe(r,r===q?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||$e(r,a)||(n=!0,ld(r,a));r=r.next}while(n);td=!1}}function ad(){od()}function od(){ed=$u=!1;var e=0;nd!==0&&Gd()&&(e=nd);for(var t=Me(),n=null,r=Zu;r!==null;){var i=r.next,a=sd(r,t);a===0?(r.next=null,n===null?Zu=i:n.next=i,i===null&&(Qu=n)):(n=r,(e!==0||a&3)&&(ed=!0)),r=i}iu!==0&&iu!==5||id(e,!1),nd!==0&&(nd=0)}function sd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-We(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=et(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=q,n=Y,n=Qe(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(X===2||X===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&ke(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||$e(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&ke(r),lt(n)){case 2:case 8:n=Fe;break;case 32:n=Ie;break;case 268435456:n=Re;break;default:n=Ie}return r=cd.bind(null,e),n=Oe(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&ke(r),e.callbackPriority=2,e.callbackNode=null,2}function cd(e,t){if(iu!==0&&iu!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Hu()&&e.callbackNode!==n)return null;var r=Y;return r=Qe(e,e===q?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(gu(e,r,t),sd(e,Me()),e.callbackNode!=null&&e.callbackNode===n?cd.bind(null,e):null)}function ld(e,t){if(Hu())return null;gu(e,t,!0)}function ud(){Yd(function(){K&6?Oe(Pe,ad):od()})}function dd(){if(nd===0){var e=pa;e===0&&(e=Je,Je<<=1,!(Je&261888)&&(Je=256)),nd=e}return nd}function fd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:an(``+e)}function pd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function md(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=fd((i[M]||null).action),o=r.submitter;o&&(t=(t=o[M]||null)?fd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new Dn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(nd!==0){var e=o?pd(i,o):new FormData(i);Cs(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?pd(i,o):new FormData(i),Cs(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var hd=0;hd<Qr.length;hd++){var gd=Qr[hd];$r(gd.toLowerCase(),`on`+(gd[0].toUpperCase()+gd.slice(1)))}$r(Wr,`onAnimationEnd`),$r(Gr,`onAnimationIteration`),$r(Kr,`onAnimationStart`),$r(`dblclick`,`onDoubleClick`),$r(`focusin`,`onFocus`),$r(`focusout`,`onBlur`),$r(qr,`onTransitionRun`),$r(Jr,`onTransitionStart`),$r(Yr,`onTransitionCancel`),$r(Xr,`onTransitionEnd`),kt(`onMouseEnter`,[`mouseout`,`mouseover`]),kt(`onMouseLeave`,[`mouseout`,`mouseover`]),kt(`onPointerEnter`,[`pointerout`,`pointerover`]),kt(`onPointerLeave`,[`pointerout`,`pointerover`]),Ot(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),Ot(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),Ot(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),Ot(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),Ot(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),Ot(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var _d=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),vd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));function yd(e,t){t=(t&4)!=0;for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ei(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ei(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[ht];n===void 0&&(n=t[ht]=new Set);var r=e+`__bubble`;n.has(r)||(Cd(t,e,2,!1),n.add(r))}function bd(e,t,n){var r=0;t&&(r|=4),Cd(n,e,r,t)}var xd=`_reactListening`+Math.random().toString(36).slice(2);function Sd(e){if(!e[xd]){e[xd]=!0,Et.forEach(function(t){t!==`selectionchange`&&(vd.has(t)||bd(t,!1,e),bd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[xd]||(t[xd]=!0,bd(`selectionchange`,!1,t))}}function Cd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!gn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function wd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=xt(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}pn(function(){var r=a,i=cn(n),s=[];a:{var c=Zr.get(e);if(c!==void 0){var l=Dn,u=e;switch(e){case`keypress`:if(Sn(n)===0)break a;case`keydown`:case`keyup`:l=Gn;break;case`focusin`:u=`focus`,l=In;break;case`focusout`:u=`blur`,l=In;break;case`beforeblur`:case`afterblur`:l=In;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Pn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Fn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=qn;break;case Wr:case Gr:case Kr:l=Ln;break;case Xr:l=Jn;break;case`scroll`:case`scrollend`:l=kn;break;case`wheel`:l=Yn;break;case`copy`:case`cut`:case`paste`:l=Rn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=Kn;break;case`toggle`:case`beforetoggle`:l=Xn}var d=(t&4)!=0,f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=mn(m,p),g!=null&&d.push(Td(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==sn&&(u=n.relatedTarget||n.fromElement)&&(xt(u)||u[mt]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?xt(u):null,u!==null&&(f=o(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=Pn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=Kn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:Ct(l),h=u==null?c:Ct(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,xt(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Dd,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&Od(s,c,l,d,!1),u!==null&&f!==null&&Od(s,f,u,d,!0)}}a:{if(c=r?Ct(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=hr;else if(lr(c))if(gr)v=Tr;else{v=Cr;var y=Sr}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&tn(r.elementType)&&(v=hr):v=wr;if(v&&=v(e,r)){ur(s,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&qt(c,`number`,c.value)}switch(y=r?Ct(r):window,e){case`focusin`:(lr(y)||y.contentEditable===`true`)&&(Pr=y,Fr=r,Ir=null);break;case`focusout`:Ir=Fr=Pr=null;break;case`mousedown`:Lr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Lr=!1,Rr(s,n,i);break;case`selectionchange`:if(Nr)break;case`keydown`:case`keyup`:Rr(s,n,i)}var b;if(Qn)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else or?ir(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(tr&&n.locale!==`ko`&&(or||x!==`onCompositionStart`?x===`onCompositionEnd`&&or&&(b=xn()):(vn=i,yn=`value`in vn?vn.value:vn.textContent,or=!0)),y=Ed(r,x),0<y.length&&(x=new zn(x,e,null,n,i),s.push({event:x,listeners:y}),b?x.data=b:(b=ar(n),b!==null&&(x.data=b)))),(b=er?N(e,n):sr(e,n))&&(x=Ed(r,`onBeforeInput`),0<x.length&&(y=new zn(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:y,listeners:x}),y.data=b)),md(s,e,r,n,i)}yd(s,t)})}function Td(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Ed(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=mn(e,n),i!=null&&r.unshift(Td(e,i,a)),i=mn(e,t),i!=null&&r.push(Td(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Dd(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Od(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=mn(n,a),l!=null&&o.unshift(Td(n,l,c))):i||(l=mn(n,a),l!=null&&o.push(Td(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var kd=/\r\n?/g,Ad=/\u0000|\uFFFD/g;function jd(e){return(typeof e==`string`?e:``+e).replace(kd,`
`).replace(Ad,``)}function Md(e,t){return t=jd(t),jd(e)===t}function $(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||Zt(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&Zt(e,``+r);break;case`className`:Ft(e,`class`,r);break;case`tabIndex`:Ft(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Ft(e,n,r);break;case`style`:en(e,r,o);break;case`data`:if(t!==`object`){Ft(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=an(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}else typeof o==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,a.name,a,null),$(e,t,`formEncType`,a.formEncType,a,null),$(e,t,`formMethod`,a.formMethod,a,null),$(e,t,`formTarget`,a.formTarget,a,null)):($(e,t,`encType`,a.encType,a,null),$(e,t,`method`,a.method,a,null),$(e,t,`target`,a.target,a,null)));if(r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=an(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=on);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=an(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),Pt(e,`popover`,r);break;case`xlinkActuate`:It(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:It(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:It(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:It(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:It(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:It(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:It(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:It(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:It(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:Pt(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=nn.get(n)||n,Pt(e,n,r))}}function Nd(e,t,n,r,a,o){switch(n){case`style`:en(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?Zt(e,r):(typeof r==`number`||typeof r==`bigint`)&&Zt(e,``+r);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=on);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!Dt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[M]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):Pt(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,o,s,n,null)}}a&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:$(e,t,r,d,n,null)}}Kt(e,o,c,l,u,s,a,!1);return;case`select`:for(a in Q(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:$(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&Jt(e,!!r,n,!0):Jt(e,!!r,t,!1);return;case`textarea`:for(s in Q(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:$(e,t,s,c,n,null)}Xt(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<_d.length;r++)Q(_d[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,u,r,n,null)}return;default:if(tn(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:a=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}Gt(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||$(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&$(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?Jt(e,!!n,n?[]:``,!1):Jt(e,!!n,t,!0)):Jt(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:p=a;break;case`defaultValue`:m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&$(e,t,s,a,r,o)}Yt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(tn(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e===Wd?!1:(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[yt]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body);n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8)if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++;n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),bt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r)if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e;else if(!e[yt])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);bt(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=A.d;A.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=bu();return e||t}function yf(e){var t=St(e);t!==null&&t.tag===5&&t.type===`form`?Ts(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=Wt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),Tt(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Wt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Wt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Wt(n.imageSizes)+`"]`)):i+=`[href="`+Wt(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=m({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),Tt(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Wt(r)+`"][href="`+Wt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=m({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),Tt(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=wt(r).hoistableStyles,a=Af(e);t||=`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=m({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);Tt(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=wt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=m({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),Tt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=wt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=m({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),Tt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var a=(a=me.current)?gf(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=wt(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var o=wt(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(jf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),o||Nf(a,e,n,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=wt(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Af(e){return`href="`+Wt(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return m({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),Tt(t),e.head.appendChild(t))}function Pf(e){return`[src="`+Wt(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Wt(n.href)+`"]`);if(r)return t.instance=r,Tt(r),r;var a=m({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),Tt(r),Pd(r,`style`,a),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Af(n.href);var o=e.querySelector(jf(a));if(o)return t.state.loading|=4,t.instance=o,Tt(o),o;r=Mf(n),(a=mf.get(a))&&Rf(r,a),o=(e.ownerDocument||e).createElement(`link`),Tt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Pd(o,`link`,r),t.state.loading|=4,Lf(o,n.precedence,e),t.instance=o;case`script`:return o=Pf(n.src),(a=e.querySelector(Ff(o)))?(t.instance=a,Tt(a),a):(r=n,(a=mf.get(o))&&(r=m({},n),zf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),Tt(a),Pd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.title??=t.title}function zf(e,t){e.crossOrigin??=t.crossOrigin,e.referrerPolicy??=t.referrerPolicy,e.integrity??=t.integrity}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[yt]||a[pt]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,Tt(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),Tt(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:C,Provider:null,Consumer:null,_currentValue:se,_currentValue2:se,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=nt(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=nt(0),this.hiddenUpdates=nt(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=L(3,null,null,t),e.current=a,a.stateNode=e,t=la(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},Ha(a),e}function tp(e){return e?(e=li,e):li}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=z(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=B(e,r,t),n!==null&&(hu(n,e,t),V(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=si(e,67108864);t!==null&&hu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=pu();t=ct(t);var n=si(e,t);n!==null&&hu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=k.T;k.T=null;var a=A.p;try{A.p=2,up(e,t,n,r)}finally{A.p=a,k.T=i}}function lp(e,t,n,r){var i=k.T;k.T=null;var a=A.p;try{A.p=8,up(e,t,n,r)}finally{A.p=a,k.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)wd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=St(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=Ze(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-We(o);s.entanglements[1]|=c,o&=~c}rd(a),!(K&6)&&(tu=Me()+500,id(0,!1))}}break;case 31:case 13:s=si(a,2),s!==null&&hu(s,a,2),bu(),ip(a,2)}if(a=dp(r),a===null&&wd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else wd(e,t,r,null,n)}}function dp(e){return e=cn(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=xt(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Ne()){case Pe:return 2;case Fe:return 8;case Ie:case Le:return 32;case Re:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=St(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=xt(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,dt(e.priority,function(){op(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,dt(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);sn=r,n.target.dispatchEvent(r),sn=null}else return t=St(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=St(n);a!==null&&(e.splice(t,3),t-=3,Cs(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[M]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[M]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;np(n,pu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),bu(),t[mt]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=ut();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=n.version;if(Lp!==`19.2.7`)throw Error(i(527,Lp,`19.2.7`));A.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=u(t),e=e===null?null:f(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.7`,rendererPackageName:`react-dom`,currentDispatcherRef:k,reconcilerVersion:`19.2.7`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{Ve=zp.inject(Rp),He=zp}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Ks,s=qs,c=Js;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,o,s,c,Pp),e[mt]=t.current,Sd(e),new Fp(t)}})),_=o(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=g()})),v=l(d(),1),y=_(),b=`modulepreload`,x=function(e,t){return new URL(e,t).href},S={},C=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=x(t,n),t=s(t),t in S)return;S[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:b,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},w=/^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i,T=/^[\\/]{2}/;function E(e,t){return t+e.replace(/\\/g,`/`)}var ee=`popstate`;function D(e){return typeof e==`object`&&!!e&&`pathname`in e&&`search`in e&&`hash`in e&&`state`in e&&`key`in e}function te(e={}){function t(e,t){let{pathname:n=`/`,search:r=``,hash:i=``}=k(e.location.hash.substring(1));return!n.startsWith(`/`)&&!n.startsWith(`.`)&&(n=`/`+n),ae(``,{pathname:n,search:r,hash:i},t.state&&t.state.usr||null,t.state&&t.state.key||`default`)}function n(e,t){let n=e.document.querySelector(`base`),r=``;if(n&&n.getAttribute(`href`)){let t=e.location.href,n=t.indexOf(`#`);r=n===-1?t:t.slice(0,n)}return r+`#`+(typeof t==`string`?t:oe(t))}function r(e,t){ne(e.pathname.charAt(0)===`/`,`relative pathnames are not supported in hash history.push(${JSON.stringify(t)})`)}return A(t,n,r,e)}function O(e,t){if(e===!1||e==null)throw Error(t)}function ne(e,t){if(!e){typeof console<`u`&&console.warn(t);try{throw Error(t)}catch{}}}function re(){return Math.random().toString(36).substring(2,10)}function ie(e,t){return{usr:e.state,key:e.key,idx:t,masked:e.mask?{pathname:e.pathname,search:e.search,hash:e.hash}:void 0}}function ae(e,t,n=null,r,i){return{pathname:typeof e==`string`?e:e.pathname,search:``,hash:``,...typeof t==`string`?k(t):t,state:n,key:t&&t.key||r||re(),mask:i}}function oe({pathname:e=`/`,search:t=``,hash:n=``}){return t&&t!==`?`&&(e+=t.charAt(0)===`?`?t:`?`+t),n&&n!==`#`&&(e+=n.charAt(0)===`#`?n:`#`+n),e}function k(e){let t={};if(e){let n=e.indexOf(`#`);n>=0&&(t.hash=e.substring(n),e=e.substring(0,n));let r=e.indexOf(`?`);r>=0&&(t.search=e.substring(r),e=e.substring(0,r)),e&&(t.pathname=e)}return t}function A(e,t,n,r={}){let{window:i=document.defaultView,v5Compat:a=!1}=r,o=i.history,s=`POP`,c=null,l=u();l??(l=0,o.replaceState({...o.state,idx:l},``));function u(){return(o.state||{idx:null}).idx}function d(){s=`POP`;let e=u(),t=e==null?null:e-l;l=e,c&&c({action:s,location:h.location,delta:t})}function f(e,t){s=`PUSH`;let r=D(e)?e:ae(h.location,e,t);n&&n(r,e),l=u()+1;let d=ie(r,l),f=h.createHref(r.mask||r);try{o.pushState(d,``,f)}catch(e){if(e instanceof DOMException&&e.name===`DataCloneError`)throw e;i.location.assign(f)}a&&c&&c({action:s,location:h.location,delta:1})}function p(e,t){s=`REPLACE`;let r=D(e)?e:ae(h.location,e,t);n&&n(r,e),l=u();let i=ie(r,l),d=h.createHref(r.mask||r);o.replaceState(i,``,d),a&&c&&c({action:s,location:h.location,delta:0})}function m(e){return se(i,e)}let h={get action(){return s},get location(){return e(i,o)},listen(e){if(c)throw Error(`A history only accepts one active listener`);return i.addEventListener(ee,d),c=e,()=>{i.removeEventListener(ee,d),c=null}},createHref(e){return t(i,e)},createURL:m,encodeLocation(e){let t=m(e);return{pathname:t.pathname,search:t.search,hash:t.hash}},push:f,replace:p,go(e){return o.go(e)}};return h}function se(e,t,n=!1){let r=`http://localhost`;e&&(r=e.location.origin===`null`?e.location.href:e.location.origin),O(r,`No window.location.(origin|href) available to create URL`);let i=typeof t==`string`?t:oe(t);return i=i.replace(/ $/,`%20`),!n&&T.test(i)&&(i=r+i),new URL(i,r)}function ce(e,t,n=`/`){return le(e,t,n,!1)}function le(e,t,n,r,i){let a=Oe((typeof t==`string`?k(t):t).pathname||`/`,n);if(a==null)return null;let o=i??de(e),s=null,c=De(a);for(let e=0;s==null&&e<o.length;++e)s=Ce(o[e],c,r);return s}function ue(e,t){let{route:n,pathname:r,params:i}=e;return{id:n.id,pathname:r,params:i,data:t[n.id],loaderData:t[n.id],handle:n.handle}}function de(e){let t=j(e);return pe(t),t}function j(e,t=[],n=[],r=``,i=!1){let a=(e,a,o=i,s)=>{let c={relativePath:s===void 0?e.path||``:s,caseSensitive:e.caseSensitive===!0,childrenIndex:a,route:e};if(c.relativePath.startsWith(`/`)){if(!c.relativePath.startsWith(r)&&o)return;O(c.relativePath.startsWith(r),`Absolute route path "${c.relativePath}" nested under path "${r}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),c.relativePath=c.relativePath.slice(r.length)}let l=Ie([r,c.relativePath]),u=n.concat(c);e.children&&e.children.length>0&&(O(e.index!==!0,`Index routes must not have child routes. Please remove all child routes from route path "${l}".`),j(e.children,t,u,l,o)),!(e.path==null&&!e.index)&&t.push({path:l,score:xe(l,e.index),routesMeta:u.map((e,t)=>{let[n,r]=Ee(e.relativePath,e.caseSensitive,t===u.length-1);return{...e,matcher:n,compiledParams:r}})})};return e.forEach((e,t)=>{if(e.path===``||!e.path?.includes(`?`))a(e,t);else for(let n of fe(e.path))a(e,t,!0,n)}),t}function fe(e){let t=e.split(`/`);if(t.length===0)return[];let[n,...r]=t,i=n.endsWith(`?`),a=n.replace(/\?$/,``);if(r.length===0)return i?[a,``]:[a];let o=fe(r.join(`/`)),s=[];return s.push(...o.map(e=>e===``?a:[a,e].join(`/`))),i&&s.push(...o),s.map(t=>e.startsWith(`/`)&&t===``?`/`:t)}function pe(e){e.sort((e,t)=>e.score===t.score?Se(e.routesMeta.map(e=>e.childrenIndex),t.routesMeta.map(e=>e.childrenIndex)):t.score-e.score)}var me=/^:[\w-]+$/,he=3,ge=2,_e=1,ve=10,ye=-2,be=e=>e===`*`;function xe(e,t){let n=e.split(`/`),r=n.length;return n.some(be)&&(r+=ye),t&&(r+=ge),n.filter(e=>!be(e)).reduce((e,t)=>e+(me.test(t)?he:t===``?_e:ve),r)}function Se(e,t){return e.length===t.length&&e.slice(0,-1).every((e,n)=>e===t[n])?e[e.length-1]-t[t.length-1]:0}function Ce(e,t,n=!1){let{routesMeta:r}=e,i={},a=`/`,o=[];for(let e=0;e<r.length;++e){let s=r[e],c=e===r.length-1,l=a===`/`?t:t.slice(a.length)||`/`,u={path:s.relativePath,caseSensitive:s.caseSensitive,end:c},d=s.matcher&&s.compiledParams?Te(u,l,s.matcher,s.compiledParams):we(u,l),f=s.route;if(!d&&c&&n&&!r[r.length-1].route.index&&(d=we({path:s.relativePath,caseSensitive:s.caseSensitive,end:!1},l)),!d)return null;Object.assign(i,d.params),o.push({params:i,pathname:Ie([a,d.pathname]),pathnameBase:Re(Ie([a,d.pathnameBase])),route:f}),d.pathnameBase!==`/`&&(a=Ie([a,d.pathnameBase]))}return o}function we(e,t){typeof e==`string`&&(e={path:e,caseSensitive:!1,end:!0});let[n,r]=Ee(e.path,e.caseSensitive,e.end);return Te(e,t,n,r)}function Te(e,t,n,r){let i=t.match(n);if(!i)return null;let a=i[0],o=a.replace(/(.)\/+$/,`$1`),s=i.slice(1);return{params:r.reduce((e,{paramName:t,isOptional:n},r)=>{if(t===`*`){let e=s[r]||``;o=a.slice(0,a.length-e.length).replace(/(.)\/+$/,`$1`)}let i=s[r];return n&&!i?e[t]=void 0:e[t]=(i||``).replace(/%2F/g,`/`),e},{}),pathname:a,pathnameBase:o,pattern:e}}function Ee(e,t=!1,n=!0){ne(e===`*`||!e.endsWith(`*`)||e.endsWith(`/*`),`Route path "${e}" will be treated as if it were "${e.replace(/\*$/,`/*`)}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${e.replace(/\*$/,`/*`)}".`);let r=[],i=`^`+e.replace(/\/*\*?$/,``).replace(/^\/*/,`/`).replace(/[\\.*+^${}|()[\]]/g,`\\$&`).replace(/\/:([\w-]+)(\?)?/g,(e,t,n,i,a)=>{if(r.push({paramName:t,isOptional:n!=null}),n){let t=a.charAt(i+e.length);return t&&t!==`/`?`/([^\\/]*)`:`(?:/([^\\/]*))?`}return`/([^\\/]+)`}).replace(/\/([\w-]+)\?(\/|$)/g,`(/$1)?$2`);return e.endsWith(`*`)?(r.push({paramName:`*`}),i+=e===`*`||e===`/*`?`(.*)$`:`(?:\\/(.+)|\\/*)$`):n?i+=`\\/*$`:e!==``&&e!==`/`&&(i+=`(?:(?=\\/|$))`),[new RegExp(i,t?void 0:`i`),r]}function De(e){try{return e.split(`/`).map(e=>decodeURIComponent(e).replace(/\//g,`%2F`)).join(`/`)}catch(t){return ne(!1,`The URL path "${e}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${t}).`),e}}function Oe(e,t){if(t===`/`)return e;if(!e.toLowerCase().startsWith(t.toLowerCase()))return null;let n=t.endsWith(`/`)?t.length-1:t.length,r=e.charAt(n);return r&&r!==`/`?null:e.slice(n)||`/`}function ke(e,t=`/`){let{pathname:n,search:r=``,hash:i=``}=typeof e==`string`?k(e):e,a;return n?(n=Fe(n),a=n.startsWith(`/`)?Ae(n.substring(1),`/`):Ae(n,t)):a=t,{pathname:a,search:ze(r),hash:Be(i)}}function Ae(e,t){let n=Le(t).split(`/`);return e.split(`/`).forEach(e=>{e===`..`?n.length>1&&n.pop():e!==`.`&&n.push(e)}),n.length>1?n.join(`/`):`/`}function je(e,t,n,r){return`Cannot include a '${e}' character in a manually specified \`to.${t}\` field [${JSON.stringify(r)}].  Please separate it out to the \`to.${n}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`}function Me(e){return e.filter((e,t)=>t===0||e.route.path&&e.route.path.length>0)}function Ne(e){let t=Me(e);return t.map((e,n)=>n===t.length-1?e.pathname:e.pathnameBase)}function Pe(e,t,n,r=!1){let i;typeof e==`string`?i=k(e):(i={...e},O(!i.pathname||!i.pathname.includes(`?`),je(`?`,`pathname`,`search`,i)),O(!i.pathname||!i.pathname.includes(`#`),je(`#`,`pathname`,`hash`,i)),O(!i.search||!i.search.includes(`#`),je(`#`,`search`,`hash`,i)));let a=e===``||i.pathname===``,o=a?`/`:i.pathname,s;if(o==null)s=n;else{let e=t.length-1;if(!r&&o.startsWith(`..`)){let t=o.split(`/`);for(;t[0]===`..`;)t.shift(),--e;i.pathname=t.join(`/`)}s=e>=0?t[e]:`/`}let c=ke(i,s),l=o&&o!==`/`&&o.endsWith(`/`),u=(a||o===`.`)&&n.endsWith(`/`);return!c.pathname.endsWith(`/`)&&(l||u)&&(c.pathname+=`/`),c}var Fe=e=>e.replace(/[\\/]{2,}/g,`/`),Ie=e=>Fe(e.join(`/`)),Le=e=>e.replace(/\/+$/,``),Re=e=>Le(e).replace(/^\/*/,`/`),ze=e=>!e||e===`?`?``:e.startsWith(`?`)?e:`?`+e,Be=e=>!e||e===`#`?``:e.startsWith(`#`)?e:`#`+e,Ve=class{constructor(e,t,n,r=!1){this.status=e,this.statusText=t||``,this.internal=r,n instanceof Error?(this.data=n.toString(),this.error=n):this.data=n}};function He(e){return e!=null&&typeof e.status==`number`&&typeof e.statusText==`string`&&typeof e.internal==`boolean`&&`data`in e}function Ue(e){return Ie(e.map(e=>e.route.path).filter(Boolean))||`/`}var We=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0;function Ge(e,t){let n=e;if(typeof n!=`string`||!w.test(n))return{absoluteURL:void 0,isExternal:!1,to:n};let r=n,i=!1;if(We)try{let e=new URL(window.location.href),r=T.test(n)?new URL(E(n,e.protocol)):new URL(n),a=Oe(r.pathname,t);r.origin===e.origin&&a!=null?n=a+r.search+r.hash:i=!0}catch{ne(!1,`<Link to="${n}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)}return{absoluteURL:r,isExternal:i,to:n}}Object.getOwnPropertyNames(Object.prototype).sort().join(`\0`);var Ke=[`POST`,`PUT`,`PATCH`,`DELETE`];new Set(Ke);var qe=[`GET`,...Ke];new Set(qe);var Je=[`about:`,`blob:`,`chrome:`,`chrome-untrusted:`,`content:`,`data:`,`devtools:`,`file:`,`filesystem:`,`javascript:`];function Ye(e){try{return Je.includes(new URL(e).protocol)}catch{return!1}}var Xe=v.createContext(null);Xe.displayName=`DataRouter`;var Ze=v.createContext(null);Ze.displayName=`DataRouterState`;var Qe=v.createContext(!1);function $e(){return v.useContext(Qe)}var et=v.createContext({isTransitioning:!1});et.displayName=`ViewTransition`;var tt=v.createContext(new Map);tt.displayName=`Fetchers`;var nt=v.createContext(null);nt.displayName=`Await`;var rt=v.createContext(null);rt.displayName=`Navigation`;var it=v.createContext(null);it.displayName=`Location`;var at=v.createContext({outlet:null,matches:[],isDataRoute:!1});at.displayName=`Route`;var ot=v.createContext(null);ot.displayName=`RouteError`;var st=`REACT_ROUTER_ERROR`,ct=`REDIRECT`,lt=`ROUTE_ERROR_RESPONSE`;function ut(e){if(e.startsWith(`${st}:${ct}:{`))try{let t=JSON.parse(e.slice(28));if(typeof t==`object`&&t&&typeof t.status==`number`&&typeof t.statusText==`string`&&typeof t.location==`string`&&typeof t.reloadDocument==`boolean`&&typeof t.replace==`boolean`)return t}catch{}}function dt(e){if(e.startsWith(`${st}:${lt}:{`))try{let t=JSON.parse(e.slice(40));if(typeof t==`object`&&t&&typeof t.status==`number`&&typeof t.statusText==`string`)return new Ve(t.status,t.statusText,t.data)}catch{}}function ft(e,{relative:t}={}){O(pt(),`useHref() may be used only in the context of a <Router> component.`);let{basename:n,navigator:r}=v.useContext(rt),{hash:i,pathname:a,search:o}=xt(e,{relative:t}),s=a;return n!==`/`&&(s=a===`/`?n:Ie([n,a])),r.createHref({pathname:s,search:o,hash:i})}function pt(){return v.useContext(it)!=null}function M(){return O(pt(),`useLocation() may be used only in the context of a <Router> component.`),v.useContext(it).location}var mt=`You should call navigate() in a React.useEffect(), not when your component is first rendered.`;function ht(e){v.useContext(rt).static||v.useLayoutEffect(e)}function gt(){let{isDataRoute:e}=v.useContext(at);return e?Bt():_t()}function _t(){O(pt(),`useNavigate() may be used only in the context of a <Router> component.`);let e=v.useContext(Xe),{basename:t,navigator:n}=v.useContext(rt),{matches:r}=v.useContext(at),{pathname:i}=M(),a=JSON.stringify(Ne(r)),o=v.useRef(!1);return ht(()=>{o.current=!0}),v.useCallback((r,s={})=>{if(ne(o.current,mt),!o.current)return;if(typeof r==`number`){n.go(r);return}let c=Pe(r,JSON.parse(a),i,s.relative===`path`);e==null&&t!==`/`&&(c.pathname=c.pathname===`/`?t:Ie([t,c.pathname])),(s.replace?n.replace:n.push)(c,s.state,s)},[t,n,a,i,e])}var vt=v.createContext(null);function yt(e){let t=v.useContext(at).outlet;return v.useMemo(()=>t&&v.createElement(vt.Provider,{value:e},t),[t,e])}function bt(){let{matches:e}=v.useContext(at);return e[e.length-1]?.params??{}}function xt(e,{relative:t}={}){let{matches:n}=v.useContext(at),{pathname:r}=M(),i=JSON.stringify(Ne(n));return v.useMemo(()=>Pe(e,JSON.parse(i),r,t===`path`),[e,i,r,t])}function St(e,t){return Ct(e,t)}function Ct(e,t,n){O(pt(),`useRoutes() may be used only in the context of a <Router> component.`);let{navigator:r}=v.useContext(rt),{matches:i}=v.useContext(at),a=i[i.length-1],o=a?a.params:{},s=a?a.pathname:`/`,c=a?a.pathnameBase:`/`,l=a&&a.route;{let e=l&&l.path||``;Ht(s,!l||e.endsWith(`*`)||e.endsWith(`*?`),`You rendered descendant <Routes> (or called \`useRoutes()\`) at "${s}" (under <Route path="${e}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${e}"> to <Route path="${e===`/`?`*`:`${e}/*`}">.`)}let u=M(),d;if(t){let e=typeof t==`string`?k(t):t;O(c===`/`||e.pathname?.startsWith(c),`When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${c}" but pathname "${e.pathname}" was given in the \`location\` prop.`),d=e}else d=u;let f=d.pathname||`/`,p=f;if(c!==`/`){let e=c.replace(/^\//,``).split(`/`);p=`/`+f.replace(/^\//,``).split(`/`).slice(e.length).join(`/`)}let m=n&&n.state.matches.length?n.state.matches.map(e=>Object.assign(e,{route:n.manifest[e.route.id]||e.route})):ce(e,{pathname:p});ne(l||m!=null,`No routes matched location "${d.pathname}${d.search}${d.hash}" `),ne(m==null||m[m.length-1].route.element!==void 0||m[m.length-1].route.Component!==void 0||m[m.length-1].route.lazy!==void 0,`Matched leaf route at location "${d.pathname}${d.search}${d.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);let h=At(m&&m.map(e=>Object.assign({},e,{params:Object.assign({},o,e.params),pathname:Ie([c,r.encodeLocation?r.encodeLocation(e.pathname.replace(/%/g,`%25`).replace(/\?/g,`%3F`).replace(/#/g,`%23`)).pathname:e.pathname]),pathnameBase:e.pathnameBase===`/`?c:Ie([c,r.encodeLocation?r.encodeLocation(e.pathnameBase.replace(/%/g,`%25`).replace(/\?/g,`%3F`).replace(/#/g,`%23`)).pathname:e.pathnameBase])})),i,n);return t&&h?v.createElement(it.Provider,{value:{location:{pathname:`/`,search:``,hash:``,state:null,key:`default`,mask:void 0,...d},navigationType:`POP`}},h):h}function wt(){let e=zt(),t=He(e)?`${e.status} ${e.statusText}`:e instanceof Error?e.message:JSON.stringify(e),n=e instanceof Error?e.stack:null,r=`rgba(200,200,200, 0.5)`,i={padding:`0.5rem`,backgroundColor:r},a={padding:`2px 4px`,backgroundColor:r},o=null;return console.error(`Error handled by React Router default ErrorBoundary:`,e),o=v.createElement(v.Fragment,null,v.createElement(`p`,null,`💿 Hey developer 👋`),v.createElement(`p`,null,`You can provide a way better UX than this when your app throws errors by providing your own `,v.createElement(`code`,{style:a},`ErrorBoundary`),` or`,` `,v.createElement(`code`,{style:a},`errorElement`),` prop on your route.`)),v.createElement(v.Fragment,null,v.createElement(`h2`,null,`Unexpected Application Error!`),v.createElement(`h3`,{style:{fontStyle:`italic`}},t),n?v.createElement(`pre`,{style:i},n):null,o)}var Tt=v.createElement(wt,null),Et=class extends v.Component{constructor(e){super(e),this.state={location:e.location,revalidation:e.revalidation,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,t){return t.location!==e.location||t.revalidation!==`idle`&&e.revalidation===`idle`?{error:e.error,location:e.location,revalidation:e.revalidation}:{error:e.error===void 0?t.error:e.error,location:t.location,revalidation:e.revalidation||t.revalidation}}componentDidCatch(e,t){this.props.onError?this.props.onError(e,t):console.error(`React Router caught the following error during render`,e)}render(){let e=this.state.error;if(this.context&&typeof e==`object`&&e&&`digest`in e&&typeof e.digest==`string`){let t=dt(e.digest);t&&(e=t)}let t=e===void 0?this.props.children:v.createElement(at.Provider,{value:this.props.routeContext},v.createElement(ot.Provider,{value:e,children:this.props.component}));return this.context?v.createElement(Ot,{error:e},t):t}};Et.contextType=Qe;var Dt=new WeakMap;function Ot({children:e,error:t}){let{basename:n}=v.useContext(rt);if(typeof t==`object`&&t&&`digest`in t&&typeof t.digest==`string`){let e=ut(t.digest);if(e){let r=Dt.get(t);if(r)throw r;let i=Ge(e.location,n),a=i.absoluteURL||i.to;if(Ye(a))throw Error(`Invalid redirect location`);if(We&&!Dt.get(t))if(i.isExternal||e.reloadDocument)window.location.href=a;else{let n=Promise.resolve().then(()=>window.__reactRouterDataRouter.navigate(i.to,{replace:e.replace}));throw Dt.set(t,n),n}return v.createElement(`meta`,{httpEquiv:`refresh`,content:`0;url=${a}`})}}return e}function kt({routeContext:e,match:t,children:n}){let r=v.useContext(Xe);return r&&r.static&&r.staticContext&&(t.route.errorElement||t.route.ErrorBoundary)&&(r.staticContext._deepestRenderedBoundaryId=t.route.id),v.createElement(at.Provider,{value:e},n)}function At(e,t=[],n){let r=n?.state;if(e==null){if(!r)return null;if(r.errors)e=r.matches;else if(t.length===0&&!r.initialized&&r.matches.length>0)e=r.matches;else return null}let i=e,a=r?.errors;if(a!=null){let e=i.findIndex(e=>e.route.id&&a?.[e.route.id]!==void 0);O(e>=0,`Could not find a matching route for errors on route IDs: ${Object.keys(a).join(`,`)}`),i=i.slice(0,Math.min(i.length,e+1))}let o=!1,s=-1;if(n&&r){o=r.renderFallback;for(let e=0;e<i.length;e++){let t=i[e];if((t.route.HydrateFallback||t.route.hydrateFallbackElement)&&(s=e),t.route.id){let{loaderData:e,errors:a}=r,c=t.route.loader&&!e.hasOwnProperty(t.route.id)&&(!a||a[t.route.id]===void 0);if(t.route.lazy||c){n.isStatic&&(o=!0),i=s>=0?i.slice(0,s+1):[i[0]];break}}}}let c=n?.onError,l=r&&c?(e,t)=>{c(e,{location:r.location,params:r.matches?.[0]?.params??{},pattern:Ue(r.matches),errorInfo:t})}:void 0;return i.reduceRight((e,n,c)=>{let u,d=!1,f=null,p=null;r&&(u=a&&n.route.id?a[n.route.id]:void 0,f=n.route.errorElement||Tt,o&&(s<0&&c===0?(Ht(`route-fallback`,!1,"No `HydrateFallback` element provided to render during initial hydration"),d=!0,p=null):s===c&&(d=!0,p=n.route.hydrateFallbackElement||null)));let m=t.concat(i.slice(0,c+1)),h=()=>{let t;return t=u?f:d?p:n.route.Component?v.createElement(n.route.Component,null):n.route.element?n.route.element:e,v.createElement(kt,{match:n,routeContext:{outlet:e,matches:m,isDataRoute:r!=null},children:t})};return r&&(n.route.ErrorBoundary||n.route.errorElement||c===0)?v.createElement(Et,{location:r.location,revalidation:r.revalidation,component:f,error:u,children:h(),routeContext:{outlet:null,matches:m,isDataRoute:!0},onError:l}):h()},null)}function jt(e){return`${e} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function Mt(e){let t=v.useContext(Xe);return O(t,jt(e)),t}function Nt(e){let t=v.useContext(Ze);return O(t,jt(e)),t}function Pt(e){let t=v.useContext(at);return O(t,jt(e)),t}function Ft(e){let t=Pt(e),n=t.matches[t.matches.length-1];return O(n.route.id,`${e} can only be used on routes that contain a unique "id"`),n.route.id}function It(){return Ft(`useRouteId`)}function Lt(){let e=Nt(`useNavigation`);return v.useMemo(()=>{let{matches:t,historyAction:n,...r}=e.navigation;return r},[e.navigation])}function Rt(){let{matches:e,loaderData:t}=Nt(`useMatches`);return v.useMemo(()=>e.map(e=>ue(e,t)),[e,t])}function zt(){let e=v.useContext(ot),t=Nt(`useRouteError`),n=Ft(`useRouteError`);return e===void 0?t.errors?.[n]:e}function Bt(){let{router:e}=Mt(`useNavigate`),t=Ft(`useNavigate`),n=v.useRef(!1);return ht(()=>{n.current=!0}),v.useCallback(async(r,i={})=>{ne(n.current,mt),n.current&&(typeof r==`number`?await e.navigate(r):await e.navigate(r,{fromRouteId:t,...i}))},[e,t])}var Vt={};function Ht(e,t,n){!t&&!Vt[e]&&(Vt[e]=!0,ne(!1,n))}v.memo(Ut);function Ut({routes:e,manifest:t,future:n,state:r,isStatic:i,onError:a}){return Ct(e,void 0,{manifest:t,state:r,isStatic:i,onError:a,future:n})}function Wt(e){return yt(e.context)}function Gt(e){O(!1,`A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.`)}function Kt({basename:e=`/`,children:t=null,location:n,navigationType:r=`POP`,navigator:i,static:a=!1,useTransitions:o}){O(!pt(),`You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`);let s=e.replace(/^\/*/,`/`),c=v.useMemo(()=>({basename:s,navigator:i,static:a,useTransitions:o,future:{}}),[s,i,a,o]);typeof n==`string`&&(n=k(n));let{pathname:l=`/`,search:u=``,hash:d=``,state:f=null,key:p=`default`,mask:m}=n,h=v.useMemo(()=>{let e=Oe(l,s);return e==null?null:{location:{pathname:e,search:u,hash:d,state:f,key:p,mask:m},navigationType:r}},[s,l,u,d,f,p,r,m]);return ne(h!=null,`<Router basename="${s}"> is not able to match the URL "${l}${u}${d}" because it does not start with the basename, so the <Router> won't render anything.`),h==null?null:v.createElement(rt.Provider,{value:c},v.createElement(it.Provider,{children:t,value:h}))}function qt({children:e,location:t}){return St(Jt(e),t)}v.Component;function Jt(e,t=[]){let n=[];return v.Children.forEach(e,(e,r)=>{if(!v.isValidElement(e))return;let i=[...t,r];if(e.type===v.Fragment){n.push.apply(n,Jt(e.props.children,i));return}O(e.type===Gt,`[${typeof e.type==`string`?e.type:e.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`),O(!e.props.index||!e.props.children,`An index route cannot have child routes.`);let a={id:e.props.id||i.join(`-`),caseSensitive:e.props.caseSensitive,element:e.props.element,Component:e.props.Component,index:e.props.index,path:e.props.path,middleware:e.props.middleware,loader:e.props.loader,action:e.props.action,hydrateFallbackElement:e.props.hydrateFallbackElement,HydrateFallback:e.props.HydrateFallback,errorElement:e.props.errorElement,ErrorBoundary:e.props.ErrorBoundary,hasErrorBoundary:e.props.hasErrorBoundary===!0||e.props.ErrorBoundary!=null||e.props.errorElement!=null,shouldRevalidate:e.props.shouldRevalidate,handle:e.props.handle,lazy:e.props.lazy};e.props.children&&(a.children=Jt(e.props.children,i)),n.push(a)}),n}var Yt=`get`,Xt=`application/x-www-form-urlencoded`;function Zt(e){return typeof HTMLElement<`u`&&e instanceof HTMLElement}function Qt(e){return Zt(e)&&e.tagName.toLowerCase()===`button`}function $t(e){return Zt(e)&&e.tagName.toLowerCase()===`form`}function en(e){return Zt(e)&&e.tagName.toLowerCase()===`input`}function tn(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)}function nn(e,t){return e.button===0&&(!t||t===`_self`)&&!tn(e)}function rn(e=``){return new URLSearchParams(typeof e==`string`||Array.isArray(e)||e instanceof URLSearchParams?e:Object.keys(e).reduce((t,n)=>{let r=e[n];return t.concat(Array.isArray(r)?r.map(e=>[n,e]):[[n,r]])},[]))}function an(e,t){let n=rn(e);return t&&t.forEach((e,r)=>{n.has(r)||t.getAll(r).forEach(e=>{n.append(r,e)})}),n}var on=null;function sn(){if(on===null)try{new FormData(document.createElement(`form`),0),on=!1}catch{on=!0}return on}var cn=new Set([`application/x-www-form-urlencoded`,`multipart/form-data`,`text/plain`]);function ln(e){return e!=null&&!cn.has(e)?(ne(!1,`"${e}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Xt}"`),null):e}function un(e,t){let n,r,i,a,o;if($t(e)){let o=e.getAttribute(`action`);r=o?Oe(o,t):null,n=e.getAttribute(`method`)||Yt,i=ln(e.getAttribute(`enctype`))||Xt,a=new FormData(e)}else if(Qt(e)||en(e)&&(e.type===`submit`||e.type===`image`)){let o=e.form;if(o==null)throw Error(`Cannot submit a <button> or <input type="submit"> without a <form>`);let s=e.getAttribute(`formaction`)||o.getAttribute(`action`);if(r=s?Oe(s,t):null,n=e.getAttribute(`formmethod`)||o.getAttribute(`method`)||Yt,i=ln(e.getAttribute(`formenctype`))||ln(o.getAttribute(`enctype`))||Xt,a=new FormData(o,e),!sn()){let{name:t,type:n,value:r}=e;if(n===`image`){let e=t?`${t}.`:``;a.append(`${e}x`,`0`),a.append(`${e}y`,`0`)}else t&&a.append(t,r)}}else if(Zt(e))throw Error(`Cannot submit element that is not <form>, <button>, or <input type="submit|image">`);else n=Yt,r=null,i=Xt,o=e;return a&&i===`text/plain`&&(o=a,a=void 0),{action:r,method:n.toLowerCase(),encType:i,formData:a,body:o}}Object.getOwnPropertyNames(Object.prototype).sort().join(`\0`);var dn={"&":`\\u0026`,">":`\\u003e`,"<":`\\u003c`,"\u2028":`\\u2028`,"\u2029":`\\u2029`},fn=/[&><\u2028\u2029]/g;function pn(e){return e.replace(fn,e=>dn[e])}function mn(e,t){if(e===!1||e==null)throw Error(t)}function hn(e,t,n,r){let i=typeof e==`string`?new URL(e,typeof window>`u`?`server://singlefetch/`:window.location.origin):e;return n?i.pathname.endsWith(`/`)?i.pathname=`${i.pathname}_.${r}`:i.pathname=`${i.pathname}.${r}`:i.pathname===`/`?i.pathname=`_root.${r}`:t&&Oe(i.pathname,t)===`/`?i.pathname=`${Le(t)}/_root.${r}`:i.pathname=`${Le(i.pathname)}.${r}`,i}async function gn(e,t){if(e.id in t)return t[e.id];try{let n=await C(()=>import(e.module),[],import.meta.url);return t[e.id]=n,n}catch(t){return console.error(`Error loading route module \`${e.module}\`, reloading page...`),console.error(t),window.__reactRouterContext&&window.__reactRouterContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function _n(e){return e!=null&&typeof e.page==`string`}function vn(e){return e==null?!1:e.href==null?e.rel===`preload`&&typeof e.imageSrcSet==`string`&&typeof e.imageSizes==`string`:typeof e.rel==`string`&&typeof e.href==`string`}async function yn(e,t,n){return wn((await Promise.all(e.map(async e=>{let r=t.routes[e.route.id];if(r){let e=await gn(r,n);return e.links?e.links():[]}return[]}))).flat(1).filter(vn).filter(e=>e.rel===`stylesheet`||e.rel===`preload`).map(e=>e.rel===`stylesheet`?{...e,rel:`prefetch`,as:`style`}:{...e,rel:`prefetch`}))}function bn(e,t,n,r,i,a){let o=(e,t)=>!n[t]||e.route.id!==n[t].route.id,s=(e,t)=>n[t].pathname!==e.pathname||n[t].route.path?.endsWith(`*`)&&n[t].params[`*`]!==e.params[`*`];return a===`assets`?t.filter((e,t)=>o(e,t)||s(e,t)):a===`data`?t.filter((t,a)=>{let c=r.routes[t.route.id];if(!c||!c.hasLoader)return!1;if(o(t,a)||s(t,a))return!0;if(t.route.shouldRevalidate){let r=t.route.shouldRevalidate({currentUrl:new URL(i.pathname+i.search+i.hash,window.origin),currentParams:n[0]?.params||{},nextUrl:new URL(e,window.origin),nextParams:t.params,defaultShouldRevalidate:!0});if(typeof r==`boolean`)return r}return!0}):[]}function xn(e,t,{includeHydrateFallback:n}={}){return Sn(e.map(e=>{let r=t.routes[e.route.id];if(!r)return[];let i=[r.module];return r.clientActionModule&&(i=i.concat(r.clientActionModule)),r.clientLoaderModule&&(i=i.concat(r.clientLoaderModule)),n&&r.hydrateFallbackModule&&(i=i.concat(r.hydrateFallbackModule)),r.imports&&(i=i.concat(r.imports)),i}).flat(1))}function Sn(e){return[...new Set(e)]}function Cn(e){let t={},n=Object.keys(e).sort();for(let r of n)t[r]=e[r];return t}function wn(e,t){let n=new Set,r=new Set(t);return e.reduce((e,i)=>{if(t&&!_n(i)&&i.as===`script`&&i.href&&r.has(i.href))return e;let a=JSON.stringify(Cn(i));return n.has(a)||(n.add(a),e.push({key:a,link:i})),e},[])}function Tn(){let e=v.useContext(Xe);return mn(e,`You must render this element inside a <DataRouterContext.Provider> element`),e}function En(){let e=v.useContext(Ze);return mn(e,`You must render this element inside a <DataRouterStateContext.Provider> element`),e}var Dn=v.createContext(void 0);Dn.displayName=`FrameworkContext`;function On(){let e=v.useContext(Dn);return mn(e,`You must render this element inside a <HydratedRouter> element`),e}function kn(e,t){let n=v.useContext(Dn),[r,i]=v.useState(!1),[a,o]=v.useState(!1),{onFocus:s,onBlur:c,onMouseEnter:l,onMouseLeave:u,onTouchStart:d}=t,f=v.useRef(null);v.useEffect(()=>{if(e===`render`&&o(!0),e===`viewport`){let e=new IntersectionObserver(e=>{e.forEach(e=>{o(e.isIntersecting)})},{threshold:.5});return f.current&&e.observe(f.current),()=>{e.disconnect()}}},[e]),v.useEffect(()=>{if(r){let e=setTimeout(()=>{o(!0)},100);return()=>{clearTimeout(e)}}},[r]);let p=()=>{i(!0)},m=()=>{i(!1),o(!1)};return n?e===`intent`?[a,f,{onFocus:An(s,p),onBlur:An(c,m),onMouseEnter:An(l,p),onMouseLeave:An(u,m),onTouchStart:An(d,p)}]:[a,f,{}]:[!1,f,{}]}function An(e,t){return n=>{e&&e(n),n.defaultPrevented||t(n)}}function jn({page:e,...t}){let n=$e(),{nonce:r}=On(),{router:i}=Tn(),a=v.useMemo(()=>ce(i.routes,e,i.basename),[i.routes,e,i.basename]);return a?(t.nonce==null&&r&&(t={...t,nonce:r}),n?v.createElement(Nn,{page:e,matches:a,...t}):v.createElement(Pn,{page:e,matches:a,...t})):null}function Mn(e){let{manifest:t,routeModules:n}=On(),[r,i]=v.useState([]);return v.useEffect(()=>{let r=!1;return yn(e,t,n).then(e=>{r||i(e)}),()=>{r=!0}},[e,t,n]),r}function Nn({page:e,matches:t,...n}){let r=M(),{future:i}=On(),{basename:a}=Tn(),o=v.useMemo(()=>{if(e===r.pathname+r.search+r.hash)return[];let n=hn(e,a,i.v8_trailingSlashAwareDataRequests,`rsc`),o=!1,s=[];for(let e of t)typeof e.route.shouldRevalidate==`function`?o=!0:s.push(e.route.id);return o&&s.length>0&&n.searchParams.set(`_routes`,s.join(`,`)),[n.pathname+n.search]},[a,i.v8_trailingSlashAwareDataRequests,e,r,t]);return v.createElement(v.Fragment,null,o.map(e=>v.createElement(`link`,{key:e,rel:`prefetch`,as:`fetch`,href:e,...n})))}function Pn({page:e,matches:t,...n}){let r=M(),{future:i,manifest:a,routeModules:o}=On(),{basename:s}=Tn(),{loaderData:c,matches:l}=En(),u=v.useMemo(()=>bn(e,t,l,a,r,`data`),[e,t,l,a,r]),d=v.useMemo(()=>bn(e,t,l,a,r,`assets`),[e,t,l,a,r]),f=v.useMemo(()=>{if(e===r.pathname+r.search+r.hash)return[];let n=new Set,l=!1;if(t.forEach(e=>{let t=a.routes[e.route.id];!t||!t.hasLoader||(!u.some(t=>t.route.id===e.route.id)&&e.route.id in c&&o[e.route.id]?.shouldRevalidate||t.hasClientLoader?l=!0:n.add(e.route.id))}),n.size===0)return[];let d=hn(e,s,i.v8_trailingSlashAwareDataRequests,`data`);return l&&n.size>0&&d.searchParams.set(`_routes`,t.filter(e=>n.has(e.route.id)).map(e=>e.route.id).join(`,`)),[d.pathname+d.search]},[s,i.v8_trailingSlashAwareDataRequests,c,r,a,u,t,e,o]),p=v.useMemo(()=>xn(d,a),[d,a]),m=Mn(d);return v.createElement(v.Fragment,null,f.map(e=>v.createElement(`link`,{key:e,rel:`prefetch`,as:`fetch`,href:e,...n})),p.map(e=>v.createElement(`link`,{key:e,rel:`modulepreload`,href:e,...n})),m.map(({key:e,link:t})=>v.createElement(`link`,{key:e,nonce:n.nonce,...t,crossOrigin:t.crossOrigin??n.crossOrigin})))}function Fn(...e){return t=>{e.forEach(e=>{typeof e==`function`?e(t):e!=null&&(e.current=t)})}}v.Component;var In=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0;try{In&&(window.__reactRouterVersion=`7.18.1`)}catch{}function Ln({basename:e,children:t,useTransitions:n,window:r}){let i=v.useRef();i.current??=te({window:r,v5Compat:!0});let a=i.current,[o,s]=v.useState({action:a.action,location:a.location}),c=v.useCallback(e=>{n===!1?s(e):v.startTransition(()=>s(e))},[n]);return v.useLayoutEffect(()=>a.listen(c),[a,c]),v.createElement(Kt,{basename:e,children:t,location:o.location,navigationType:o.action,navigator:a,useTransitions:n})}function Rn({basename:e,children:t,history:n,useTransitions:r}){let[i,a]=v.useState({action:n.action,location:n.location}),o=v.useCallback(e=>{r===!1?a(e):v.startTransition(()=>a(e))},[r]);return v.useLayoutEffect(()=>n.listen(o),[n,o]),v.createElement(Kt,{basename:e,children:t,location:i.location,navigationType:i.action,navigator:n,useTransitions:r})}Rn.displayName=`unstable_HistoryRouter`;var zn=v.forwardRef(function({onClick:e,discover:t=`render`,prefetch:n=`none`,relative:r,reloadDocument:i,replace:a,mask:o,state:s,target:c,to:l,preventScrollReset:u,viewTransition:d,defaultShouldRevalidate:f,...p},m){let{basename:h,navigator:g,useTransitions:_}=v.useContext(rt),y=typeof l==`string`&&w.test(l),b=Ge(l,h);l=b.to;let x=ft(l,{relative:r}),S=M(),C=null;if(o){let e=Pe(o,[],S.mask?S.mask.pathname:`/`,!0);h!==`/`&&(e.pathname=e.pathname===`/`?h:Ie([h,e.pathname])),C=g.createHref(e)}let[T,E,ee]=kn(n,p),D=Kn(l,{replace:a,mask:o,state:s,target:c,preventScrollReset:u,relative:r,viewTransition:d,defaultShouldRevalidate:f,useTransitions:_});function te(t){e&&e(t),t.defaultPrevented||D(t)}let O=!(b.isExternal||i),ne=v.createElement(`a`,{...p,...ee,href:(O?C:void 0)||b.absoluteURL||x,onClick:O?te:e,ref:Fn(m,E),target:c,"data-discover":!y&&t===`render`?`true`:void 0});return T&&!y?v.createElement(v.Fragment,null,ne,v.createElement(jn,{page:x})):ne});zn.displayName=`Link`;var Bn=v.forwardRef(function({"aria-current":e=`page`,caseSensitive:t=!1,className:n=``,end:r=!1,style:i,to:a,viewTransition:o,children:s,...c},l){let u=xt(a,{relative:c.relative}),d=M(),f=v.useContext(Ze),{navigator:p,basename:m}=v.useContext(rt),h=f!=null&&rr(u)&&o===!0,g=p.encodeLocation?p.encodeLocation(u).pathname:u.pathname,_=d.pathname,y=f&&f.navigation&&f.navigation.location?f.navigation.location.pathname:null;t||(_=_.toLowerCase(),y=y?y.toLowerCase():null,g=g.toLowerCase()),y&&m&&(y=Oe(y,m)||y);let b=g!==`/`&&g.endsWith(`/`)?g.length-1:g.length,x=_===g||!r&&_.startsWith(g)&&_.charAt(b)===`/`,S=y!=null&&(y===g||!r&&y.startsWith(g)&&y.charAt(g.length)===`/`),C={isActive:x,isPending:S,isTransitioning:h},w=x?e:void 0,T;T=typeof n==`function`?n(C):[n,x?`active`:null,S?`pending`:null,h?`transitioning`:null].filter(Boolean).join(` `);let E=typeof i==`function`?i(C):i;return v.createElement(zn,{...c,"aria-current":w,className:T,ref:l,style:E,to:a,viewTransition:o},typeof s==`function`?s(C):s)});Bn.displayName=`NavLink`;var Vn=v.forwardRef(({discover:e=`render`,fetcherKey:t,navigate:n,reloadDocument:r,replace:i,state:a,method:o=Yt,action:s,onSubmit:c,relative:l,preventScrollReset:u,viewTransition:d,defaultShouldRevalidate:f,...p},m)=>{let{useTransitions:h}=v.useContext(rt),g=Xn(),_=Zn(s,{relative:l}),y=o.toLowerCase()===`get`?`get`:`post`,b=typeof s==`string`&&w.test(s);return v.createElement(`form`,{ref:m,method:y,action:_,onSubmit:r?c:e=>{if(c&&c(e),e.defaultPrevented)return;e.preventDefault();let r=e.nativeEvent.submitter,s=r?.getAttribute(`formmethod`)||o,p=()=>g(r||e.currentTarget,{fetcherKey:t,method:s,navigate:n,replace:i,state:a,relative:l,preventScrollReset:u,viewTransition:d,defaultShouldRevalidate:f});h&&n!==!1?v.startTransition(()=>p()):p()},...p,"data-discover":!b&&e===`render`?`true`:void 0})});Vn.displayName=`Form`;function Hn({getKey:e,storageKey:t,...n}){let r=v.useContext(Dn),{basename:i}=v.useContext(rt),a=M(),o=Rt();tr({getKey:e,storageKey:t});let s=v.useMemo(()=>{if(!r||!e)return null;let t=er(a,o,i,e);return t===a.key?null:t},[]);if(!r||r.isSpaMode)return null;let c=((e,t)=>{if(!window.history.state||!window.history.state.key){let e=Math.random().toString(32).slice(2);window.history.replaceState({key:e},``)}try{let n=JSON.parse(sessionStorage.getItem(e)||`{}`)[t||window.history.state.key];typeof n==`number`&&window.scrollTo(0,n)}catch(t){console.error(t),sessionStorage.removeItem(e)}}).toString();return n.nonce==null&&r?.nonce&&(n.nonce=r.nonce),v.createElement(`script`,{...n,suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${c})(${pn(JSON.stringify(t||Qn))}, ${pn(JSON.stringify(s))})`}})}Hn.displayName=`ScrollRestoration`;function Un(e){return`${e} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function Wn(e){let t=v.useContext(Xe);return O(t,Un(e)),t}function Gn(e){let t=v.useContext(Ze);return O(t,Un(e)),t}function Kn(e,{target:t,replace:n,mask:r,state:i,preventScrollReset:a,relative:o,viewTransition:s,defaultShouldRevalidate:c,useTransitions:l}={}){let u=gt(),d=M(),f=xt(e,{relative:o});return v.useCallback(p=>{if(nn(p,t)){p.preventDefault();let t=n===void 0?oe(d)===oe(f):n,m=()=>u(e,{replace:t,mask:r,state:i,preventScrollReset:a,relative:o,viewTransition:s,defaultShouldRevalidate:c});l?v.startTransition(()=>m()):m()}},[d,u,f,n,r,i,t,e,a,o,s,c,l])}function qn(e){ne(typeof URLSearchParams<`u`,"You cannot use the `useSearchParams` hook in a browser that does not support the URLSearchParams API. If you need to support Internet Explorer 11, we recommend you load a polyfill such as https://github.com/ungap/url-search-params.");let t=v.useRef(rn(e)),n=v.useRef(!1),r=M(),i=v.useMemo(()=>an(r.search,n.current?null:t.current),[r.search]),a=gt();return[i,v.useCallback((e,t)=>{let r=rn(typeof e==`function`?e(new URLSearchParams(i)):e);n.current=!0,a(`?`+r,t)},[a,i])]}var Jn=0,Yn=()=>`__${String(++Jn)}__`;function Xn(){let{router:e}=Wn(`useSubmit`),{basename:t}=v.useContext(rt),n=It(),r=e.fetch,i=e.navigate;return v.useCallback(async(e,a={})=>{let{action:o,method:s,encType:c,formData:l,body:u}=un(e,t);if(a.navigate===!1){let e=a.fetcherKey||Yn();await r(e,n,a.action||o,{defaultShouldRevalidate:a.defaultShouldRevalidate,preventScrollReset:a.preventScrollReset,formData:l,body:u,formMethod:a.method||s,formEncType:a.encType||c,flushSync:a.flushSync})}else await i(a.action||o,{defaultShouldRevalidate:a.defaultShouldRevalidate,preventScrollReset:a.preventScrollReset,formData:l,body:u,formMethod:a.method||s,formEncType:a.encType||c,replace:a.replace,state:a.state,fromRouteId:n,flushSync:a.flushSync,viewTransition:a.viewTransition})},[r,i,t,n])}function Zn(e,{relative:t}={}){let{basename:n}=v.useContext(rt),r=v.useContext(at);O(r,`useFormAction must be used inside a RouteContext`);let[i]=r.matches.slice(-1),a={...xt(e||`.`,{relative:t})},o=M();if(e==null){a.search=o.search;let e=new URLSearchParams(a.search),t=e.getAll(`index`);if(t.some(e=>e===``)){e.delete(`index`),t.filter(e=>e).forEach(t=>e.append(`index`,t));let n=e.toString();a.search=n?`?${n}`:``}}return(!e||e===`.`)&&i.route.index&&(a.search=a.search?a.search.replace(/^\?/,`?index&`):`?index`),n!==`/`&&(a.pathname=a.pathname===`/`?n:Ie([n,a.pathname])),oe(a)}var Qn=`react-router-scroll-positions`,$n={};function er(e,t,n,r){let i=null;return r&&(i=r(n===`/`?e:{...e,pathname:Oe(e.pathname,n)||e.pathname},t)),i??=e.key,i}function tr({getKey:e,storageKey:t}={}){let{router:n}=Wn(`useScrollRestoration`),{restoreScrollPosition:r,preventScrollReset:i}=Gn(`useScrollRestoration`),{basename:a}=v.useContext(rt),o=M(),s=Rt(),c=Lt();v.useEffect(()=>(window.history.scrollRestoration=`manual`,()=>{window.history.scrollRestoration=`auto`}),[]),nr(v.useCallback(()=>{if(c.state===`idle`){let t=er(o,s,a,e);$n[t]=window.scrollY}try{sessionStorage.setItem(t||Qn,JSON.stringify($n))}catch(e){ne(!1,`Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (${e}).`)}window.history.scrollRestoration=`auto`},[c.state,e,a,o,s,t])),typeof document<`u`&&(v.useLayoutEffect(()=>{try{let e=sessionStorage.getItem(t||Qn);e&&($n=JSON.parse(e))}catch{}},[t]),v.useLayoutEffect(()=>{let t=n?.enableScrollRestoration($n,()=>window.scrollY,e?(t,n)=>er(t,n,a,e):void 0);return()=>t&&t()},[n,a,e]),v.useLayoutEffect(()=>{if(r!==!1){if(typeof r==`number`){window.scrollTo(0,r);return}try{if(o.hash){let e=document.getElementById(decodeURIComponent(o.hash.slice(1)));if(e){e.scrollIntoView();return}}}catch{ne(!1,`"${o.hash.slice(1)}" is not a decodable element ID. The view will not scroll to it.`)}i!==!0&&window.scrollTo(0,0)}},[o,r,i]))}function nr(e,t){let{capture:n}=t||{};v.useEffect(()=>{let t=n==null?void 0:{capture:n};return window.addEventListener(`pagehide`,e,t),()=>{window.removeEventListener(`pagehide`,e,t)}},[e,n])}function rr(e,{relative:t}={}){let n=v.useContext(et);O(n!=null,"`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");let{basename:r}=Wn(`useViewTransitionState`),i=xt(e,{relative:t});if(!n.isTransitioning)return!1;let a=Oe(n.currentLocation.pathname,r)||n.currentLocation.pathname,o=Oe(n.nextLocation.pathname,r)||n.nextLocation.pathname;return we(i.pathname,o)!=null||we(i.pathname,a)!=null}var ir=[{id:`module-1`,title:`行业与市场`,description:`第1周 Day 1-7：定义、产业链、头部公司、竞品分析`,color:`#0891b2`,items:[{slug:`module-1/00-overview`,title:`模块总览`,days:`1-7`},{slug:`module-1/01-definition`,title:`具身智能定义`,days:`1`},{slug:`module-1/02-history`,title:`发展历程`,days:`2`},{slug:`module-1/03-industry-chain`,title:`产业链图谱`,days:`3`},{slug:`module-1/04-company-matrix`,title:`头部产品矩阵`,days:`4`},{slug:`module-1/05-competitive`,title:`竞品差异化`,days:`5`},{slug:`module-1/06-unitree`,title:`宇树深度研究`,days:`6`},{slug:`module-1/07-week-review`,title:`周复盘方法`,days:`7`}]},{id:`module-2`,title:`产品与技术基础（上）`,description:`第2周 Day 8-14：大脑小脑、硬件、VLA、RL、模仿学习`,color:`#7c3aed`,items:[{slug:`module-2/00-overview`,title:`模块总览`,days:`8-14`},{slug:`module-2/01-brain-cerebellum`,title:`大脑与小脑协同`,days:`8`},{slug:`module-2/02-hardware`,title:`核心硬件认知`,days:`9`},{slug:`module-2/03-sensors`,title:`传感器与感知`,days:`10`},{slug:`module-2/04-vla-intro`,title:`VLA 模型入门`,days:`11`},{slug:`module-2/05-rl-intro`,title:`强化学习入门`,days:`12`},{slug:`module-2/06-imitation-learning`,title:`模仿学习入门`,days:`13`},{slug:`module-2/07-data-loop`,title:`数据闭环`,days:`14`}]},{id:`module-3`,title:`产品与技术基础（下）`,description:`第3周 Day 15-20：产品思维、交互、数据飞轮、竞品报告`,color:`#0d9488`,items:[{slug:`module-3/00-overview`,title:`模块总览`,days:`15-20`},{slug:`module-3/01-product-thinking`,title:`产品思维与取舍`,days:`15`},{slug:`module-3/02-hci-design`,title:`人机交互设计`,days:`16`},{slug:`module-3/03-data-flywheel`,title:`数据飞轮设计`,days:`17`},{slug:`module-3/04-competitive-report`,title:`竞品分析报告`,days:`18-20`}]},{id:`module-4`,title:`专项突破`,description:`第4周 Day 21-30：VLA 案例、世界模型、论文、复盘`,color:`#ea580c`,items:[{slug:`module-4/00-overview`,title:`模块总览`,days:`21-30`},{slug:`module-4/01-rl-algorithm`,title:`宇树 RL 算法`,days:`21`},{slug:`module-4/02-conference`,title:`顶会论文追踪`,days:`22`},{slug:`module-4/03-vla-case`,title:`VLA 深度案例`,days:`23`},{slug:`module-4/04-world-model`,title:`世界模型`,days:`24`},{slug:`module-4/05-diffusion-policy`,title:`Diffusion Policy`,days:`25`},{slug:`module-4/06-paper-reading`,title:`论文阅读方法`,days:`26`},{slug:`module-4/07-phase-review`,title:`第一阶段复盘`,days:`27-30`}]},{id:`module-5`,title:`项目一：开发者生态`,description:`第5-6周 Day 31-55：用户调研、SDK 竞品、PRD、商业模式`,color:`#2563eb`,items:[{slug:`module-5/00-overview`,title:`项目总览`,days:`31-55`},{slug:`module-5/01-user-research`,title:`用户调研 playbook`,days:`31-33`},{slug:`module-5/02-sdk-competitive`,title:`机器人 SDK 竞品`,days:`34-36`},{slug:`module-5/03-prd-writing`,title:`PRD 撰写要点`,days:`46-48`},{slug:`module-5/04-business-model`,title:`商业模式设计`,days:`49-51`},{slug:`module-5/05-portfolio-pack`,title:`方案包装与评审`,days:`52-55`}]},{id:`module-6`,title:`项目二：家庭场景`,description:`第7-9周 Day 56-82：场景聚焦、VLA 家庭应用、指标设计`,color:`#db2777`,items:[{slug:`module-6/00-overview`,title:`项目总览`,days:`56-82`},{slug:`module-6/01-scenario`,title:`家庭场景聚焦`,days:`56-58`},{slug:`module-6/02-user-pain`,title:`用户痛点分析`,days:`59-61`},{slug:`module-6/03-vla-home`,title:`VLA 家庭抓取`,days:`62-64`},{slug:`module-6/04-interaction`,title:`语音与行为反馈`,days:`68-70`},{slug:`module-6/05-metrics`,title:`体验评估指标`,days:`78-80`}]},{id:`module-7`,title:`面试冲刺`,description:`第10-12周 Day 83-90：作品集、模拟面试、投递`,color:`#16a34a`,items:[{slug:`module-7/00-overview`,title:`冲刺总览`,days:`83-90`},{slug:`module-7/01-portfolio`,title:`作品集整合`,days:`83-85`},{slug:`module-7/02-interview`,title:`模拟面试准备`,days:`86-88`},{slug:`module-7/03-apply`,title:`投递与复盘`,days:`89-90`}]}];function ar(e){return ir.find(t=>t.items.some(t=>t.slug===e))}function or(e){let t=[e.visual?.title,e.visual?.caption,e.visual?.quote,...e.visual?.steps??[],...(e.visual?.nodes??[]).flatMap(e=>[e.label,e.detail,e.actor,e.badge,e.group,e.parent]),...(e.visual?.facts??[]).flatMap(e=>[e.label,e.value]),...e.visual?.columns??[]].filter(Boolean);return[e.term,...e.aliases??[],...e.userPhrases??[],e.definition,e.example,...t,...(e.confusions??[]).flatMap(e=>[e.term,e.distinction]),...e.sections.flatMap(e=>[e.label,e.content])].join(` `)}function N(e,t){return{term:e,...t}}var sr=[N(`具身智能`,{aliases:[`Embodied Intelligence`,`Embodied AI`],module:`行业`,definition:`以物理机器人为载体，融合多模态感知与认知决策，能在非结构化环境中自主完成任务，并通过真实交互数据持续进化的智能系统。`,sections:[{label:`是什么`,content:`核心不是「会说话的 AI」，而是「能改变物理世界的 AI」：依赖身体、感知环境、规划动作、执行并学习。常见载体包括人形、四足、轮式、机械臂等。`},{label:`PM 要会的判断`,content:`四个问题中至少答「是」三个，才适合纳入具身智能产品讨论：
1）是否依赖物理身体与环境实时交互？
2）感知-决策-执行是否在端侧/近端闭环？
3）是否需在非结构化环境泛化？
4）数据闭环是否包含真实世界交互数据？`},{label:`和相近概念的区别`,content:`· 传统工业机器人：固定工位、预编程，通常缺乏泛化
· 云端 Agent：无物理身体，操作数字工具
· 自动驾驶：可视为具身智能在交通垂直场景的成熟形态`},{label:`面试怎么答`,content:`一句话：具身智能是「感知-决策-执行」在真实世界闭环的产品形态。再补一句差异：和 ChatGPT 比多了本体与动作；和流水线机械臂比多了泛化与学习。`}]}),N(`Embodied AI`,{aliases:[`具身人工智能`],module:`行业`,definition:`Embodied Artificial Intelligence 的学术/产业通称，强调智能离不开物理载体与真实世界反馈回路。`,sections:[{label:`是什么`,content:`来自具身认知（Embodied Cognition）思想：智能不是纯符号运算，而是通过身体与环境交互涌现。产业语境下常与「具身智能」互换使用。`},{label:`PM 视角`,content:`做竞品/市场报告时，用 Embodied AI 便于对齐海外资料；对内沟通用「具身智能」更本地化。关键是定义边界一致，避免团队概念漂移。`}]}),N(`人形机器人`,{aliases:[`Humanoid`],module:`行业`,definition:`模仿人体形态（双足/双手）的机器人平台，目标是在为人设计的环境中复用工具与空间。`,sections:[{label:`是什么`,content:`人形是载体形态之一，不是具身智能的唯一形态。优势：适配人类环境与工具；劣势：自由度高、成本高、控制与安全更难。`},{label:`PM 取舍`,content:`选题时问：这个场景是否必须「像人」？很多任务四足/轮式/机械臂更优。选人形通常为了：通用性叙事、资本叙事、对标人类工位。`},{label:`代表产品`,content:`Tesla Optimus、宇树 G1/H1、优必选 Walker、智元远征等。对比时看自由度、价格带、商用场景与交付能力。`}]}),N(`大脑与小脑`,{aliases:[`Brain-Cerebellum`],module:`技术`,definition:`行业常用比喻：大脑负责任务理解与高层规划，小脑负责高频运动控制与平衡执行。`,sections:[{label:`是什么`,content:`大脑侧常对应 VLA/大模型/任务规划器；小脑侧对应运动控制、全身协调、低延迟伺服。两者通过中间表示（轨迹、关节指令等）协同。`},{label:`对产品边界的影响`,content:`PM 要分清验收对象：说「会听话」可能卡在大脑；说「走得稳/抓得准」可能卡在小脑与硬件。功能拆分、指标与排期都要按层对齐。`},{label:`延迟案例`,content:`若小脑回路延迟到约 200ms，用户会感到动作迟滞、过冲。产品侧可做：执行中状态反馈、语音确认、失败可重试，而不是只堆模型参数。`}]}),N(`VLA`,{aliases:[`Vision-Language-Action`,`视觉-语言-动作模型`],module:`技术`,definition:`Vision-Language-Action：同时理解视觉与语言指令，并输出可执行动作（轨迹/关节指令）的模型范式。`,sections:[{label:`是什么`,content:`把「看+听懂」接到「动手」。典型链路：摄像头图像 + 自然语言 → 模型推理 → 动作序列 → 底层控制器执行。代表：RT-2、OpenVLA 等。`},{label:`PM 要懂的点`,content:`· 能力边界：开放词汇 vs 封闭技能表
· 数据依赖：演示/遥操作/真实场景数据
· 评估指标：成功率、耗时、泛化（新物体/新环境）
· 产品形态：端侧推理 vs 云边协同，影响成本与隐私`},{label:`面试怎么讲「拿杯子」`,content:`按四段拆：感知（检出杯子与桌面）→ 理解（指令意图）→ 规划（接近/抓取路径）→ 执行（控制与反馈）。并指出最易失败环节与产品兜底（确认、重试、解释）。`},{label:`易混淆`,content:`VLM（视觉语言模型）只做理解/描述，不一定输出动作；VLA 的关键交付是 Action。`}]}),N(`RT-2`,{aliases:[`Robotics Transformer 2`],module:`技术`,definition:`Google DeepMind 的 VLA 路线代表性工作，强调把互联网视觉-语言预训练知识迁移到机器人控制。`,sections:[{label:`是什么`,content:`核心叙事：机器人不必从零学世界知识，可借用网页/图片上的语义理解，再对齐到动作。相对早期只靠机器人专用数据的方案，泛化叙事更强。`},{label:`对 PM 的启示`,content:`商业化时留意：闭源/不可得、复现成本高。做竞品对标时写清「能力叙事 vs 可交付 SDK/数据」。开发者产品更常对标 OpenVLA 一类开源栈。`}]}),N(`OpenVLA`,{aliases:[`开源 VLA`],module:`技术`,definition:`开源 7B 量级 VLA，基于 Open X-Embodiment 等多源机器人数据训练，便于研究与工程复现。`,sections:[{label:`是什么`,content:`面向可获得性：权重、训练设定相对公开，适合高校/创业团队验证「语言驱动操作」类能力，而非直接等于量产产品方案。`},{label:`和 RT-2 怎么比（PM 表）`,content:`维度建议：开放度、参数量与算力成本、数据来源、可复现性、商用许可、落地案例成熟度。结论通常是：研究/原型偏好开源；大厂闭源在叙事与资源上更强。`}]}),N(`Open X-Embodiment`,{aliases:[`OXE`],module:`技术`,definition:`跨机构汇总的大规模机器人操作数据集与协作倡议，用于训练更具泛化的策略/VLA。`,sections:[{label:`是什么`,content:`核心价值：把分散实验室的轨迹/演示汇到统一格式，减轻「数据烟囱」。OpenVLA 等模型依赖这类异构数据规模。`},{label:`PM 视角`,content:`数据战略常比单模型版本更关键：谁贡献数据、标注标准、许可、评估协议。做数据飞轮设计时要对齐「采集格式是否可并入这类生态」。`}]}),N(`强化学习`,{aliases:[`RL`,`Reinforcement Learning`],module:`技术`,definition:`智能体通过与环境交互，根据奖励信号优化策略的学习范式；机器人中常用于运动与操作控制。`,sections:[{label:`是什么`,content:`要素：状态、动作、奖励、策略。算法如 PPO、SAC。挑战：奖励难设计、样本效率低、仿真到现实（sim-to-real）差距。`},{label:`和模仿学习怎么选`,content:`· RL：适合有清晰奖励或可仿真、能大量试错的任务（运动、博弈）
· 模仿学习/IL：适合易演示、难写奖励的家庭操作
实务多为组合：演示初始化 + RL 精调，或 IL + VLA`},{label:`PM 落地问题`,content:`问研发：奖励定义是谁？失败成本？是否必须实机试错？安全约束如何写进训练？产品文档里要把「可演示成功率」和「奖励黑客风险」写明白。`}]}),N(`PPO`,{aliases:[`Proximal Policy Optimization`],module:`技术`,definition:`Proximal Policy Optimization，一种限制策略更新幅度的策略梯度算法，训练相对稳定，工业界常用。`,sections:[{label:`是什么`,content:`通过裁剪目标函数避免一次更新太大导致崩溃，是机器人/游戏 RL 的默认基线之一。PM 不需要推导公式，知道「稳定、常用」即可。`},{label:`沟通用语`,content:`听工程师说「上 PPO」≈用成熟 RL 基线做运动或控制；继续追问：仿真还是实机、奖励是什么、迁移到真机怎么验。`}]}),N(`SAC`,{aliases:[`Soft Actor-Critic`],module:`技术`,definition:`Soft Actor-Critic，一类最大熵强化学习算法，鼓励探索，常用于连续动作控制。`,sections:[{label:`是什么`,content:`在优化回报的同时最大化策略熵，动作更「多样化探索」。机器人连续关节控制场景常见。`},{label:`和 PPO 的粗线条对比`,content:`PPO：on-policy，实现与调参生态成熟；SAC：off-policy，样本效率叙事常更强。选型交给算法，PM 关心：样本量、稳定性、真机风险。`}]}),N(`模仿学习`,{aliases:[`IL`,`Imitation Learning`,`行为克隆`],module:`技术`,definition:`从专家演示中学习策略，通常不需要显式设计奖励函数；家庭操作场景很常见。`,sections:[{label:`是什么`,content:`常见路径：行为克隆（BC）直接拟合专家动作；还有从演示推断奖励的方法。数据来自遥操作、人类示范、视频等。`},{label:`产品影响`,content:`演示质量=产品质量。PM 要设计采集工具、标注规范、难例挖掘与隐私合规。评价指标除成功率外，看「分布外」（没演示过的物体）是否崩。`},{label:`局限`,content:`专家覆盖不足会导致 compounding error；纯模仿难超越专家。常与 RL、扩散策略或 VLA 组合使用。`}]}),N(`Diffusion Policy`,{aliases:[`扩散策略`],module:`技术`,definition:`用扩散模型对动作序列建模与生成的策略方法，擅长多峰（多种合理解法）的动作分布。`,sections:[{label:`是什么`,content:`传统策略网络常输出单峰动作；扩散式策略通过逐步去噪生成整段动作，对「同一任务多种抓法」更友好，在机器人操作论文与 Demo 中常见。`},{label:`PM 价值`,content:`Demo 叙事强：可展示柔顺、多样轨迹。代价是推理算力与延迟。产品化要评估：边缘是否跑得动、实时控制是否够用、失败是否可中断。`}]}),N(`世界模型`,{aliases:[`World Model`],module:`技术`,definition:`对环境动态的内部预测模型：想象「若我这样做，世界会怎样」，用于规划、仿真与样本效率提升。`,sections:[{label:`是什么`,content:`不只是地图，而是可预测的状态转移。可支持：在想象中 rollout、减少真机试错、做模型预测控制（MPC）类规划。`},{label:`PM 视角`,content:`承诺「会规划」时，问清世界模型覆盖哪些变量（几何、接触、人）。评估看预测误差与下游任务成功率，而不是单独刷生成视频效果。`}]}),N(`Sim-to-Real`,{aliases:[`仿真到现实`,`Sim2Real`],module:`技术`,definition:`在仿真中训练策略，再迁移到真实机器人；差距（reality gap）是落地核心风险。`,sections:[{label:`是什么`,content:`仿真便宜且安全，但接触、摩擦、传感噪声与真机不一致。常用 domain randomization（领域随机化）缩小差距。`},{label:`PM 风险清单`,content:`· 仿真里 95% ≠ 真机可交付
· 验收必须以真机场景为准
· 里程碑拆：仿真达标 → 限定工况真机 → 开放场景`}]}),N(`遥操作`,{aliases:[`Teleoperation`,`Teleop`],module:`技术`,definition:`人通过手柄/VR/外骨骼远程控制机器人，常用于演示数据采集与高风险场景兜底。`,sections:[{label:`是什么`,content:`短期可解决自主不足；长期是数据引擎：遥操作轨迹可训练模仿学习/VLA。产品上也可作为「人在回路」安全模式。`},{label:`产品设计点`,content:`延迟、力反馈、权限切换、谁在控、意外接管。ToB 场景要明确 SLA：自主失败后几秒内可由人接管。`}]}),N(`多模态感知`,{aliases:[`Multimodal Perception`],module:`硬件`,definition:`融合视觉、力觉、触觉、听觉等多种传感器信息，形成对环境的统一理解。`,sections:[{label:`是什么`,content:`单一 RGB 不够稳：遮挡、反光、透明物体需要深度/力觉补充。融合提升鲁棒，也增加成本与标定复杂度。`},{label:`选型表（PM）`,content:`场景决定传感器：导航看 LiDAR/深度；抓取看深度+力；家庭控成本可能砍激光雷达。写 PRD 时把「没有某传感器时的降级体验」写清楚。`}]}),N(`IMU`,{aliases:[`惯性测量单元`],module:`硬件`,definition:`Inertial Measurement Unit，测三轴加速度与角速度，用于姿态估计、平衡与运动控制。`,sections:[{label:`是什么`,content:`输出高频运动信号，常与腿足/机体控制闭环结合。单独 IMU 会漂，需与视觉里程计等融合。`},{label:`产品相关`,content:`摔倒检测、站立稳定、运动模式切换都依赖 IMU 质量。成本占比不高但选型影响控制上限。`}]}),N(`深度相机`,{aliases:[`RGB-D`,`Depth Camera`],module:`硬件`,definition:`同时输出彩色与深度（距离）信息的相机，是室内导航与抓取的常见视觉方案。`,sections:[{label:`是什么`,content:`原理包括结构光、ToF、双目等。优点：稠密深度、成本相对激光雷达更低；缺点：户外强光、黑色吸光物、远距精度差。`},{label:`和激光雷达`,content:`激光雷达：测距准、抗光更好、贵、点云稀疏；深度相机：近距离语义友好、便宜。家庭产品更多深度相机，工业巡检可能上激光雷达。`}]}),N(`激光雷达`,{aliases:[`LiDAR`],module:`硬件`,definition:`通过激光测距构建环境点云，用于定位导航与避障，精度与抗干扰通常强于消费级深度相机。`,sections:[{label:`PM 取舍`,content:`加 LiDAR 直接抬 BOM 与结构复杂度。问：任务是否必须远程高精度建图？若主要是桌面操作，深度相机+好算法可能更划算。`}]}),N(`伺服驱动器`,{aliases:[`Servo Driver`],module:`硬件`,definition:`控制电机按指令精确运动的功率电子与控制单元，是关节力矩/位置环的执行核心。`,sections:[{label:`是什么`,content:`上接运动控制指令，下驱电机。性能影响：响应速度、力矩精度、发热与噪音。人形高自由度意味着驱动器数量与成本堆积。`},{label:`对定价的影响`,content:`整机成本结构中，执行器（电机+减速器+驱动）往往是大头。PM 做价格带对标时，要落到「自由度 × 单关节成本」。`}]}),N(`关节模组`,{aliases:[`关节单元`,`Actuator Module`],module:`硬件`,definition:`集成电机、减速器、编码器（及驱动）的标准化关节单元，便于量产与维修。`,sections:[{label:`是什么`,content:`模块化降低装配难度，利于供应链与售后更换。参数关注：峰值/额定扭矩、减速比、编码器分辨率、通信总线。`},{label:`产品差异化`,content:`同一形态机器人，关节供应链与自研深度决定成本与迭代速度。竞品分析应写清：自制 vs 外采、冗余与安全。`}]}),N(`编码器`,{module:`硬件`,definition:`测量电机/关节角度或位置的传感器，是闭环控制「知不知道自己在哪」的基础。`,sections:[{label:`是什么`,content:`增量式/绝对式等类型影响断电后是否丢位置。高精度编码器提升控制品质，也增加成本。`}]}),N(`数据飞轮`,{aliases:[`Data Flywheel`],module:`产品`,definition:`产品使用产生数据 → 训练更好模型 → 体验更好 → 更多使用/数据，形成正向循环。`,sections:[{label:`是什么`,content:`具身场景中，飞轮往往卡在：采集贵、标注难、隐私敏感、真机数据少。需要主动设计激励与回流管道，而不是假设「上线自然有数据」。`},{label:`设计清单`,content:`1）采什么：失败片段、遥操作、传感器包
2）为何用户愿给：功能解锁、本地优先、脱敏
3）如何进训练：格式、质检、评估集隔离
4）如何度量飞轮：周新增有效小时、模型版本提升`},{label:`合规`,content:`家庭/语音/摄像头数据默认高敏感。PRD 必须写：同意书、本地处理、可删除、用途边界。`}]}),N(`数据闭环`,{aliases:[`Data Loop`],module:`产品`,definition:`采集 → 标注/清洗 → 训练 → 仿真/实机评测 → 部署 → 线上反馈 → 再采集的完整链路。`,sections:[{label:`和数据飞轮的关系`,content:`闭环是工程链路；飞轮是增长/竞争叙事。没有可靠闭环，飞轮只是 PPT。`},{label:`瓶颈常在哪`,content:`标注成本、仿真差距、评测集不代表真实场景、部署版本混乱。周会应用「瓶颈环节」而不是只报模型分数。`}]}),N(`PRD`,{aliases:[`产品需求文档`,`Product Requirements Document`],module:`产品`,definition:`定义背景、目标用户、需求、方案边界、验收标准与非目标，是研发对齐的合同式文档。`,sections:[{label:`建议结构`,content:`背景与目标 → 用户与场景 → 需求列表（P0/P1/P2）→ 流程/交互 → 数据与指标 → 非目标与依赖 → 里程碑与风险`},{label:`具身智能特有章节`,content:`· 硬件约束与自由度假设
· 自主等级与人机接管
· 安全与失效模式
· 仿真 vs 真机验收标准
· 数据采集与隐私`},{label:`好 PRD 的验收句式`,content:`避免「智能避障体验好」。改成：「在 X 家居平面、光照 Y 下，对高度>Z 的障碍物，碰撞率 < a%，平均绕行耗时 < b 秒」。`}]}),N(`MVP`,{aliases:[`最小可行产品`],module:`产品`,definition:`用最小功能集验证核心假设的产品版本，避免一上来做全能力通用机器人。`,sections:[{label:`具身场景怎么砍`,content:`优先验证「单场景单技能」是否值得做，例如只做餐桌上归位，而不是全家自主。砍的是场景广度与技能数，不是安全底线。`},{label:`面试点`,content:`能说清：假设是什么、MVP 包含/不包含、成功指标、失败后如何 pivot。`}]}),N(`JTBD`,{aliases:[`Jobs to Be Done`,`待办任务`],module:`产品`,definition:`用户「雇用」产品所要完成的事；强调情境与进度，而非只列功能点。`,sections:[{label:`写法示例`,content:`弱：用户需要语音控制。
强：当双手被占用时，用户想让机器人把水杯拿过来，以便继续手上的事。`},{label:`和痛点的关系`,content:`痛点是现状折磨；JTBD 是进步目标。用户调研输出应两者都有，再映射到 P0 功能。`}]}),N(`Trade-off`,{aliases:[`取舍`],module:`产品`,definition:`在成本、性能、可靠性、工期等冲突目标间做可解释的选择；面试高频考察。`,sections:[{label:`表达模板`,content:`背景 → 选项 A/B → 约束（预算/算力/安全）→ 选择与放弃 → 验证方式 → 复盘。具身常例：自由度 vs 价格、云端智能 vs 隐私延迟、通用人形 vs 专用形态。`}]}),N(`人在回路`,{aliases:[`Human-in-the-loop`,`HITL`],module:`产品`,definition:`关键决策或操作仍由人监督/接管，用于安全、标注与能力不足时的兜底。`,sections:[{label:`产品形态`,content:`遥操作接管、动作确认弹窗、远程客服介入、人工复核标注。商业化早期几乎必然需要 HITL，别在 PRD 里假装全自主。`}]}),N(`CoRL`,{aliases:[`Conference on Robot Learning`],module:`学术`,definition:`Conference on Robot Learning，聚焦机器人学习（学习方法+机器人）的重要会议。`,sections:[{label:`PM 怎么用`,content:`每月/每季扫标题：看哪些能力从论文走向产品（VLA、扩散策略、世界模型）。整理 3 篇要点即可进面试素材库。`}]}),N(`ICRA`,{aliases:[`IEEE ICRA`],module:`学术`,definition:`IEEE International Conference on Robotics and Automation，机器人学旗舰会议之一，覆盖更广的机器人系统与应用。`,sections:[{label:`和 CoRL`,content:`ICRA/IROS 更大更全；CoRL 更偏学习。做技术雷达两者都看：系统栈看 ICRA，学习范式看 CoRL。`}]}),N(`IROS`,{module:`学术`,definition:`IEEE/RSJ International Conference on Intelligent Robots and Systems，与 ICRA 同级的重要机器人会议。`,sections:[{label:`用途`,content:`追踪操作、导航、人机交互、系统集成类进展；适合补充「工程可落地」视角。`}]}),N(`宇树`,{aliases:[`Unitree`],module:`公司`,definition:`Unitree，中国四足与人形机器人头部公司之一，以高性价比消费/科研向产品与开源生态著称。`,sections:[{label:`产品与定位`,content:`四足（如 Go 系列）到人形（G1/H1 等）路径清晰；强调性价比与开发者/科研可及性。竞品分析时常作为「性能-价格」锚点。`},{label:`PM 研究切入`,content:`看官网参数、GitHub SDK、融资与场景叙事。作业级输出：1 页公司档案 + SDK 能力分类 + Go2 vs G1 取舍。`}]}),N(`优必选`,{aliases:[`UBTECH`],module:`公司`,definition:`UBTECH，中国人形机器人上市公司，Walker 等产品线，偏政企/行业与品牌展示场景。`,sections:[{label:`差异化阅读`,content:`对比宇树时看：上市与融资结构、场景（政务/教育/工业演示）、价格带与交付模式。避免只比参数表。`}]}),N(`智元`,{aliases:[`AgiBot`,`智元机器人`],module:`公司`,definition:`AgiBot（智元），主打具身智能与人形机器人的新兴玩家，远征等产品线受关注。`,sections:[{label:`分析要点`,content:`关注技术路线叙事（数据/模型）、生态合作、与华为等产业协同传闻与事实的区分、量产与订单进展。信息源交叉验证。`}]}),N(`Optimus`,{aliases:[`Tesla Bot`,`特斯拉人形`],module:`公司`,definition:`Tesla 人形机器人项目，目标从工厂到家庭的通用劳动力平台叙事。`,sections:[{label:`为何重要`,content:`定义全球舆论与估值锚；技术上绑定 Tesla 视觉与 AI 栈。对标时写清：愿景 vs 当前可演示能力 vs 交付时间不确定性。`},{label:`PM 借鉴`,content:`端到端视觉、数据闭环、成本工程。写报告时避免神化，用公开里程碑与任务成功率说话。`}]}),N(`波士顿动力`,{aliases:[`Boston Dynamics`,`Spot`],module:`公司`,definition:`波士顿动力，以 Spot、Atlas 等高动态机器人闻名；Spot SDK 常作开发者生态竞品标杆。`,sections:[{label:`对开发者产品的意义`,content:`项目一竞品分析常对标 Spot SDK：文档、API 完整度、安全权限、价格门槛。差异化可落在易用性、中文生态、价格与场景包。`}]}),N(`ROS`,{aliases:[`Robot Operating System`,`ROS2`],module:`技术`,definition:`机器人领域广泛使用的开源中间件与工具生态，提供通信、驱动、仿真与包管理，并非传统意义上的操作系统。`,sections:[{label:`是什么`,content:`ROS/ROS2 让感知、规划、控制模块以节点形式拼装。工业与科研大量存量工具在此生态。`},{label:`PM 注意`,content:`做开发者平台要决定：兼容 ROS 生态还是自研 SDK？兼容则降低迁移成本，维护负担上升。`}]}),N(`STAR`,{aliases:[`STAR 法则`],module:`面试`,definition:`Situation-Task-Action-Result，结构化讲述经历的面试表达框架。`,sections:[{label:`怎么用`,content:`情境（何时何背景）→ 任务（你的目标）→ 行动（你做了什么，突出决策）→ 结果（量化或可验证）。「为什么做具身 PM」也可用精简 STAR。`}]}),N(`P0/P1/P2`,{aliases:[`优先级`],module:`产品`,definition:`需求优先级分级：P0 必须上线/阻塞发布，P1 重要可迭代，P2 有更好没有也能活。`,sections:[{label:`划法原则`,content:`对齐用户核心 JTBD 与风险（安全永远可上升为 P0）。写清每条 P0 的「一句话价值」与验收，避免假 P0。`}]}),N(`SDK`,{aliases:[`Software Development Kit`],module:`产品`,definition:`软件开发工具包：API、文档、示例、工具链，让外部开发者集成与扩展你的机器人能力。`,sections:[{label:`开发者产品核心`,content:`成功指标常是：首次跑通时间、文档完备度、示例覆盖、社区问题响应。竞品分析框架可借鉴 Spot SDK / ROS。`}]}),N(`BOM`,{aliases:[`物料清单`,`Bill of Materials`],module:`硬件`,definition:`产品物料清单与成本结构；硬件机器人定价与毛利分析的基础。`,sections:[{label:`PM 用法`,content:`不需会做账，但要会问：执行器、传感、计算、结构件各占多少？降本杠杆在哪？降自由度或换供应商对体验的影响？`}]})];function cr(e){return`/glossary/${encodeURIComponent(e)}`}var lr=new Map(sr.flatMap(e=>[[e.term.toLowerCase(),e],...e.aliases?.map(t=>[t.toLowerCase(),e])??[]])),ur=Object.assign({"../../content/module-1/00-overview.md":`# 模块一总览：行业与市场\r
\r
> 第 1 周学习地图 | 建立具身智能行业的全局认知框架\r
\r
## 关联学习天数\r
\r
**Day 1 - Day 7**（第 1 周）\r
\r
---\r
\r
## PM 视角要点\r
\r
作为具身智能产品经理，第一周的目标不是成为机器人专家，而是建立**可支撑产品决策的行业认知底座**：\r
\r
- **先定义边界，再谈功能**：Day 1 搞清楚「具身智能」与「传统机器人」「大模型 Agent」的交集与差异，避免需求文档里概念混用\r
- **用时间轴理解技术成熟度**：Day 2 把「实验室 Demo」和「可量产产品」区分开，评估任何功能点时要问「这在产业链哪一环已经成熟」\r
- **产业链决定产品分工**：Day 3 明确自家产品在上游（零部件/算法）、中游（整机/平台）还是下游（场景应用），这直接决定你的竞品名单和合作方名单\r
- **公司矩阵是竞品分析的起点**：Day 4-5 建立头部玩家档案，用统一维度横向对比，而不是逐个看新闻\r
- **选一家公司做深度案例**：Day 6 以宇树为例，练习从公开信息还原产品策略、技术路线和商业模式\r
- **周复盘固化认知**：Day 7 把零散笔记变成可复用的分析框架，为后续技术模块打底\r
\r
### 本周产出清单\r
\r
| 天数 | 主题 | 建议产出 |\r
|------|------|----------|\r
| Day 1 | 具身智能定义 | 一句话定义 + 3 个边界判断标准 |\r
| Day 2 | 发展历程 | 时间轴草图（5-8 个关键节点） |\r
| Day 3 | 产业链图谱 | 上中下游分工表 + 自家定位标注 |\r
| Day 4 | 头部产品矩阵 | 4-6 家公司的产品对比表 |\r
| Day 5 | 竞品差异化 | 竞品分析框架 v0.1 |\r
| Day 6 | 宇树深度研究 | 单公司产品档案（1 页） |\r
| Day 7 | 周复盘 | 模块一知识地图 + 3 个待深入问题 |\r
\r
---\r
\r
## 核心概念\r
\r
### 模块一在整体学习路径中的位置\r
\r
\`\`\`\r
第 1 周：行业与市场（本模块）\r
    ↓ 建立「做什么、和谁比、市场在哪」\r
第 2-3 周：产品与技术基础\r
    ↓ 建立「怎么做、技术边界在哪」\r
第 4 周：专项突破\r
    ↓ 深入 VLA、RL 等关键技术\r
第 5-9 周：项目实战\r
    ↓ 输出 PRD、竞品报告、作品集\r
第 10-12 周：面试冲刺\r
\`\`\`\r
\r
### 本周核心问题\r
\r
1. 具身智能到底是什么？它和「有身体的 AI」是一回事吗？\r
2. 这个行业从哪来，现在走到哪一步了？\r
3. 钱在产业链的哪一段？价值怎么分配？\r
4. 谁在领跑？各家差异化在哪里？\r
5. 如果我要做竞品分析，用什么框架？\r
\r
### 学习节奏建议\r
\r
- **每天 1-1.5 小时**：30 分钟阅读 + 30 分钟笔记整理 + 15 分钟产出\r
- **不要追求完美**：第一遍建立框架，细节在后续模块和项目中补全\r
- **带着产品问题读**：每读一段都问「这对产品定义/路线图/竞品策略意味着什么」\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 本周各天阅读入口\r
\r
| 天数 | 章节 | 核心资料 |\r
|------|------|----------|\r
| Day 1 | [具身智能定义](./01-definition.md) | [Embodied Cognition - Wikipedia](https://en.wikipedia.org/wiki/Embodied_cognition) |\r
| Day 2 | [发展历程](./02-history.md) | [Robotics - Wikipedia](https://en.wikipedia.org/wiki/Robotics) |\r
| Day 3 | [产业链图谱](./03-industry-chain.md) | [甲子光年具身智能研究](http://www.jazzyear.com/study_info.html?id=146) |\r
| Day 4 | [头部产品矩阵](./04-company-matrix.md) | [宇树科技官网](https://www.unitree.com/) |\r
| Day 5 | [竞品差异化](./05-competitive.md) | 结合 Day 4 矩阵自行扩展 |\r
| Day 6 | [宇树深度研究](./06-unitree.md) | [宇树 GitHub](https://github.com/unitreerobotics) |\r
| Day 7 | [周复盘方法](./07-week-review.md) | 回顾本周全部章节 |\r
\r
### 行业全景参考\r
\r
- [甲子光年：具身智能行业研究报告](http://www.jazzyear.com/study_info.html?id=146)\r
- [澎湃新闻：具身智能产业观察](https://www.thepaper.cn/newsDetail_forward_29954689)\r
\r
---\r
\r
## 本周学习检查点\r
\r
完成以下问题，即可进入第二周：\r
\r
- [ ] 能用 30 秒向非技术人员解释什么是具身智能\r
- [ ] 能画出简化的产业链三层结构并标注 3 家代表公司\r
- [ ] 能说出 Unitree、UBTECH、AgiBot、Tesla Optimus 各家的核心定位差异\r
- [ ] 有一份可复用的竞品分析维度表（至少 8 个维度）\r
- [ ] 完成宇树单公司深度档案\r
`,"../../content/module-1/01-definition.md":`# 具身智能定义\r
\r
> Day 1 | 建立概念边界，为后续产品讨论打下共同语言\r
\r
## 关联学习天数\r
\r
**Day 1**\r
\r
---\r
\r
## PM 视角要点\r
\r
产品经理第一天最忌讳的是「概念漂移」：团队里每个人说的「具身智能」含义不同，需求就会越聊越散。今天要做三件事：\r
\r
- **给出可落地的工作定义**：不追求学术完备，但要能指导「这个功能算不算具身智能」「这个竞品要不要纳入对比」\r
- **划清三条边界**：具身智能 vs 传统工业机器人、vs 云端大模型 Agent、vs 纯仿真/数字孪生\r
- **识别产品含义**：具身智能产品的核心交付物是「物理世界中的自主行动能力」，而不只是「会说话的 AI」\r
- **建立评估清单**：任何新功能提案，用 4 个问题快速判断是否在具身智能范畴内\r
\r
### 产品决策中的四个判断问题\r
\r
1. 这个能力是否依赖**物理身体**与环境的实时交互？\r
2. 感知-决策-执行是否在**端侧或近端**闭环，而非纯云端推理？\r
3. 是否需要在**非结构化物理环境**中泛化，而非固定工位重复动作？\r
4. 数据闭环是否包含**真实世界的交互数据**（而非仅文本/图像）？\r
\r
四个问题中有三个以上为「是」，通常可纳入具身智能产品讨论范围。\r
\r
---\r
\r
## 核心概念\r
\r
### 学术源头：具身认知（Embodied Cognition）\r
\r
具身智能的思想根源来自认知科学的**具身认知**理论：智能不是孤立存在于大脑中的符号运算，而是通过与身体、环境的交互涌现出来。\r
\r
> 通俗理解：小孩不是先学会「杯子」这个词，再学会抓杯子；而是在无数次抓握、掉落、反馈中，同时形成了概念和行动能力。\r
\r
### 产业定义：具身智能（Embodied AI）\r
\r
在 AI 产业语境下，**具身智能**通常指：\r
\r
> 具备物理形态（本体）的智能系统，能够感知三维物理环境、理解任务意图、规划并执行动作，且具备从真实交互中学习和泛化的能力。\r
\r
### 概念拆解\r
\r
| 维度 | 含义 | 产品体现 |\r
|------|------|----------|\r
| 具身（Embodiment） | 拥有物理本体，能改变环境状态 | 人形机器人、四足机器狗、机械臂 |\r
| 感知（Perception） | 多模态传感，理解三维空间 | 深度相机、激光雷达、力觉传感 |\r
| 认知（Cognition） | 任务理解、规划、推理 | VLA 模型、任务规划器、世界模型 |\r
| 行动（Action） | 将决策转化为物理动作 | 运动控制、抓取、导航、操作 |\r
| 学习（Learning） | 从交互数据中持续改进 | 模仿学习、强化学习、数据飞轮 |\r
\r
### 与相关概念的区别\r
\r
| 概念 | 核心特征 | 典型场景 | 与具身智能的关系 |\r
|------|----------|----------|------------------|\r
| 传统工业机器人 | 预编程、固定工位、重复动作 | 汽车焊接、电子装配 | 是子集，但通常不具备自主泛化 |\r
| 云端 AI Agent | 无物理身体，操作数字工具 | 客服、代码助手、RPA | 可成为具身智能的「大脑」，但本身不具身 |\r
| 自动驾驶 | 有物理载体，但场景限定为交通 | L2-L4 智驾 | 可视为具身智能在垂直场景的成熟形态 |\r
| 具身智能 | 物理交互 + 自主决策 + 场景泛化 | 家庭服务、工业巡检、物流搬运 | 本模块研究对象 |\r
\r
### 产品经理的工作定义（建议背诵版）\r
\r
> **具身智能产品**：以物理机器人为载体，融合多模态感知与大模型认知能力，能在非结构化环境中自主完成指定任务，并具备数据驱动的持续进化能力的软硬件系统。\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 必读\r
\r
- [Embodied Cognition - Wikipedia](https://en.wikipedia.org/wiki/Embodied_cognition)：理解「具身」的哲学与认知科学根源，建立概念的历史纵深\r
- [甲子光年：具身智能行业研究](http://www.jazzyear.com/study_info.html?id=146)：国内产业视角的定义与市场规模判断\r
\r
### 延伸阅读\r
\r
- [澎湃新闻：具身智能产业前沿观察](https://www.thepaper.cn/newsDetail_forward_29954689)：媒体视角的行业动态与争议点\r
\r
### 阅读指引\r
\r
| 资料 | 重点关注 | 预计时间 |\r
|------|----------|----------|\r
| Wikipedia 具身认知 | 核心论点、与经典 AI 的对比 | 20 分钟 |\r
| 甲子光年报告 | 定义章节、市场划分、技术栈 | 30 分钟 |\r
| 澎湃新闻 | 近期热点、代表公司动态 | 15 分钟 |\r
\r
---\r
\r
## Day 1 练习\r
\r
1. 用一句话写出你自己的「具身智能」定义\r
2. 列举 3 个「看起来像具身智能但其实不是」的产品，并说明理由\r
3. 列举 3 个「是具身智能但容易被忽略」的场景（提示：自动驾驶、无人机、手术机器人）\r
`,"../../content/module-1/02-history.md":`# 发展历程：从机器人到具身智能\r
\r
> Day 2 | 用时间轴理解技术演进，判断功能点的成熟度\r
\r
## 关联学习天数\r
\r
**Day 2**\r
\r
---\r
\r
## PM 视角要点\r
\r
产品经理不需要背诵机器人史，但需要一张**「技术成熟度时间轴」**，用来回答：\r
\r
- 客户要的某个功能，是「5 年前就能做」还是「去年才刚突破」？\r
- 竞品宣传的「全球首创」，是真实创新还是旧技术新包装？\r
- 我们的路线图应该押注哪个技术节点？\r
\r
### 三个关键认知\r
\r
1. **机器人硬件先于 AI 智能**：本体、关节、传感器已迭代数十年，当前瓶颈主要在「大脑」\r
2. **大模型是加速器，不是起点**：2023 年后 VLA、世界模型等方向爆发，但运动控制、SLAM 等基础能力早已存在\r
3. **每次技术跃迁都伴随产品形态变化**：从固定工位到移动操作，从遥控到自主，从产品到平台\r
\r
### 对产品路线图的影响\r
\r
| 技术阶段 | 产品策略 | 风险 |\r
|----------|----------|------|\r
| 实验室验证期 | 做 Demo，验证场景价值 | 过早承诺量产 |\r
| 工程化早期 | 限定场景 MVP，积累数据 | 场景过宽导致交付失败 |\r
| 规模化前夜 | 标准化 SKU + 开发者生态 | 忽视成本与供应链 |\r
| 成熟红海 | 场景深耕 + 服务化 | 同质化竞争 |\r
\r
---\r
\r
## 核心概念\r
\r
### 发展时间轴\r
\r
\`\`\`\r
1960s-1980s  工业机器人诞生\r
    │  Unimate、ABB、FANUC，结构化工厂场景\r
    ↓\r
1990s-2000s  服务机器人探索\r
    │  扫地机器人、Sony Aibo、早期人形研究\r
    ↓\r
2010s        深度学习重塑感知\r
    │  视觉识别、SLAM、AlphaGo，机器人「看得懂」了\r
    ↓\r
2016-2020    四足机器人商业化\r
    │  Boston Dynamics Spot、宇树 Go1，高动态运动控制成熟\r
    ↓\r
2021-2022    大模型 + 机器人融合探索\r
    │  SayCan、PaLM-E、RT-1，「语言驱动物理行动」\r
    ↓\r
2023-2024    具身智能概念爆发\r
    │  VLA 模型、Figure、Optimus、国内整机厂融资潮\r
    ↓\r
2025+        工程化与场景落地竞赛\r
       成本、可靠性、数据闭环成为核心竞争力\r
\`\`\`\r
\r
### 四个演进阶段详解\r
\r
#### 阶段一：程序化机器人（1960s-1990s）\r
\r
- **特征**：示教再现、固定程序、封闭环境\r
- **代表**：Unimate 焊接机器人、早期 ABB 产线\r
- **局限**：换一个任务需要重新编程，无法应对变化\r
\r
#### 阶段二：感知增强机器人（2000s-2015）\r
\r
- **特征**：引入视觉、激光雷达，具备基础导航和识别\r
- **代表**：iRobot Roomba、Kiva 仓储机器人、大疆无人机\r
- **突破**：从「盲动」到「感知环境」，但仍依赖规则或浅层学习\r
\r
#### 阶段三：深度学习机器人（2015-2022）\r
\r
- **特征**：端到端学习、Sim-to-Real、强化学习运动控制\r
- **代表**：Boston Dynamics Atlas/Spot、宇树四足系列、OpenAI Dactyl\r
- **突破**：复杂运动能力、灵巧操作初步可行\r
- **瓶颈**：任务泛化弱，换一个场景需要重新训练\r
\r
#### 阶段四：具身智能（2023 至今）\r
\r
- **特征**：大模型作为认知中枢，VLA 统一感知-语言-动作，世界模型预测物理后果\r
- **代表**：Figure 01、Tesla Optimus、1X NEO、宇树 H1/G1\r
- **突破**：自然语言任务理解、开放场景泛化成为可能\r
- **当前瓶颈**：长程任务可靠性、成本、真实世界数据规模\r
\r
### 关键技术里程碑\r
\r
| 年份 | 事件 | 意义 |\r
|------|------|------|\r
| 1961 | 第一台工业机器人 Unimate 上线 | 机器人进入工业场景 |\r
| 1997 | Deep Blue 战胜卡斯帕罗夫 | AI 在符号推理上超越人类 |\r
| 2012 | AlexNet 引爆深度学习 | 视觉感知能力质变 |\r
| 2016 | AlphaGo 战胜李世石 | 强化学习范式验证 |\r
| 2020 | 宇树 A1 四足机器人发布 | 国产高动态运动控制商业化 |\r
| 2022 | ChatGPT 发布 | 大模型能力出圈，催生「AI + 物理」融合 |\r
| 2023 | RT-2、PaLM-E 等 VLA 探索 | 大模型直接输出机器人动作 |\r
| 2024 | Figure、Optimus 频繁演示 | 人形机器人进入公众视野 |\r
| 2025 | 国内具身智能融资高峰 | 产业从概念走向工程化竞赛 |\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 必读\r
\r
- [Robotics - Wikipedia](https://en.wikipedia.org/wiki/Robotics)：机器人学科全景，理解硬件与控制的基础脉络\r
- [宇树科技官网](https://www.unitree.com/)：观察一家中国公司如何从四足运动控制走向通用人形\r
\r
### 阅读指引\r
\r
| 资料 | 重点关注 | 预计时间 |\r
|------|----------|----------|\r
| Wikipedia Robotics | History 章节、分类体系 | 25 分钟 |\r
| 宇树官网 | 产品演进线：A1 → Go2 → H1 → G1 | 20 分钟 |\r
\r
### 建议搜索补充\r
\r
- Boston Dynamics 历年演示视频对比（Spot 2016 vs 2024）\r
- Google RT-1 / RT-2 论文摘要（只需读 Abstract 和 Introduction）\r
\r
---\r
\r
## Day 2 练习\r
\r
1. 手绘一张时间轴，标注至少 6 个你认为的关键节点\r
2. 选一个你感兴趣的产品（如扫地机器人、无人机、人形机器人），标注它处于哪个阶段\r
3. 回答：为什么 2023 年后「具身智能」突然成为热词？是技术突破还是资本推动，或两者兼有？\r
`,"../../content/module-1/03-industry-chain.md":`# 产业链图谱：上游、中游、下游\r
\r
> Day 3 | 理解价值分布，明确产品定位与合作伙伴\r
\r
## 关联学习天数\r
\r
**Day 3**\r
\r
---\r
\r
## PM 视角要点\r
\r
产业链认知直接决定产品经理的**日常工作的重心**：\r
\r
- **你在哪一层，决定你的竞品是谁**：做整机的和做关节模组的，竞品名单完全不同\r
- **上下游关系决定合作策略**：需要集成谁的能力？哪些必须自研？\r
- **利润分布影响商业决策**：上游零部件毛利高但量大，下游场景贴近现金流\r
- **技术瓶颈在产业链上的位置**：当前行业瓶颈在「大脑」（算法/模型），不在「小脑」（运动控制）或「肢体」（硬件）\r
\r
### 产品经理要回答的三个定位问题\r
\r
1. 我们公司在产业链的哪一段？（上游 / 中游 / 下游）\r
2. 我们的核心资产是什么？（硬件设计 / 算法平台 / 场景数据 / 客户关系）\r
3. 我们的收入模式是什么？（卖硬件 / 卖软件授权 / 卖服务 / 平台抽成）\r
\r
---\r
\r
## 核心概念\r
\r
### 具身智能产业链三层结构\r
\r
\`\`\`\r
┌─────────────────────────────────────────────────────────┐\r
│                    下游：场景应用                          │\r
│  家庭服务 / 工业巡检 / 物流搬运 / 医疗康复 / 教育科研       │\r
│  代表：场景方案商、系统集成商、垂直 SaaS                    │\r
├─────────────────────────────────────────────────────────┤\r
│                    中游：整机与平台                        │\r
│  人形机器人 / 四足机器人 / 协作机械臂 / 开发者平台 / SDK    │\r
│  代表：宇树、优必选、智元、Figure、Tesla Optimus          │\r
├─────────────────────────────────────────────────────────┤\r
│                    上游：核心零部件与基础技术                │\r
│  关节模组 / 减速器 / 伺服电机 / 传感器 / 芯片 / 仿真平台    │\r
│  代表：绿的谐波、汇川技术、奥比中光、英伟达 Isaac           │\r
└─────────────────────────────────────────────────────────┘\r
\`\`\`\r
\r
### 上游：核心零部件与基础技术\r
\r
| 品类 | 关键能力 | 代表厂商 | 产品影响 |\r
|------|----------|----------|----------|\r
| 减速器 | 扭矩传递、精度 | 绿的谐波、哈默纳科 | 决定关节力度与寿命 |\r
| 伺服电机 | 高响应驱动 | 汇川、松下、Maxon | 决定运动速度与精度 |\r
| 关节模组 | 一体化关节 | 本末科技、意优科技 | 降低整机集成难度 |\r
| 传感器 | 力觉、视觉、IMU | 奥比中光、Velodyne | 决定感知能力上限 |\r
| 计算芯片 | 边缘 AI 推理 | 英伟达 Jetson、地平线 | 决定端侧模型部署能力 |\r
| 仿真平台 | Sim-to-Real | NVIDIA Isaac Sim、MuJoCo | 降低真机调试成本 |\r
\r
**上游 PM 关注点**：规格参数、成本曲线、供货周期、国产化替代进度\r
\r
### 中游：整机与平台\r
\r
| 品类 | 核心能力 | 商业模式 | 关键指标 |\r
|------|----------|----------|----------|\r
| 人形机器人 | 通用形态、场景泛化 | 硬件销售 + 软件订阅 | 自由度、续航、成本 |\r
| 四足/轮足机器人 | 高动态移动、巡检 | 硬件销售 + 行业方案 | 负载、地形适应、IP 等级 |\r
| 协作机械臂 | 精密操作、安全协作 | 硬件销售 | 重复定位精度、负载比 |\r
| 开发者平台 | SDK、仿真、模型 | 生态授权、云服务 | 开发者数量、应用数量 |\r
\r
**中游 PM 关注点**：产品定义、技术路线、生态建设、SKU 策略\r
\r
### 下游：场景应用\r
\r
| 场景 | 典型任务 | 付费方 | 成熟度 |\r
|------|----------|--------|--------|\r
| 工业巡检 | 设备巡检、异常检测 | 工厂业主 | 较高 |\r
| 物流仓储 | 搬运、分拣、码垛 | 物流企业 | 中等 |\r
| 家庭服务 | 清洁、陪伴、辅助 | 消费者 | 早期 |\r
| 教育科研 | 教学、算法验证 | 高校/实验室 | 成熟 |\r
| 特种作业 | 消防、救援、军工 | 政府/企业 | 定制为主 |\r
\r
**下游 PM 关注点**：场景 ROI、部署流程、客户成功、合规与安全\r
\r
### 价值流向与当前瓶颈\r
\r
\`\`\`\r
上游零部件 ──供应──→ 中游整机 ──交付──→ 下游场景\r
     ↑                    ↑                  ↑\r
  成本竞争            技术+品牌竞争        场景+数据竞争\r
  规模效应            生态壁垒            客户粘性\r
\r
当前行业瓶颈：中游的「认知大脑」（VLA / 世界模型 / 长程规划）\r
              下游的「场景数据闭环」（真实交互数据规模不足）\r
\`\`\`\r
\r
### 国产化与供应链观察\r
\r
| 环节 | 国产化程度 | 趋势 |\r
|------|------------|------|\r
| 减速器 | 中等，谐波已突破 | 成本持续下降 |\r
| 伺服系统 | 较高 | 汇川等已具备竞争力 |\r
| 视觉传感 | 较高 | 奥比中光等量产成熟 |\r
| 高算力芯片 | 较低 | 依赖英伟达，国产替代进行中 |\r
| 整机集成 | 高 | 国内厂商全球领先（四足领域） |\r
| 基础大模型 | 中等 | 开源模型缩小差距，端侧部署仍挑战 |\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 必读\r
\r
- [甲子光年：具身智能行业研究报告](http://www.jazzyear.com/study_info.html?id=146)：国内最系统的产业链梳理，重点关注「产业结构」章节\r
- [东方财富：具身智能产业链深度报告（PDF）](https://pdf.dfcfw.com/pdf/H3_AP202512031793353788_1.pdf)：券商视角的上中下游划分与标的梳理\r
\r
### 阅读指引\r
\r
| 资料 | 重点关注 | 预计时间 |\r
|------|----------|----------|\r
| 甲子光年报告 | 产业链图谱、各环节代表公司 | 40 分钟 |\r
| 东方财富 PDF | 价值量占比、竞争格局表 | 30 分钟 |\r
\r
---\r
\r
## Day 3 练习\r
\r
1. 画出三层产业链图，每层标注 2-3 家代表公司\r
2. 假设你入职一家中游整机公司，列出你需要对接的 5 类上游供应商\r
3. 选一个下游场景（如工厂巡检），拆解从「买机器人」到「完成任务」的完整价值链\r
4. 回答：当前具身智能行业的主要利润集中在哪一段？为什么？\r
`,"../../content/module-1/04-company-matrix.md":`# 头部产品矩阵\r
\r
> Day 4 | 建立竞品档案，横向对比四家代表公司\r
\r
## 关联学习天数\r
\r
**Day 4**\r
\r
---\r
\r
## PM 视角要点\r
\r
竞品分析不是「看谁融资多」，而是建立一张**可横向对比的产品矩阵**。今天聚焦四家风格迥异的公司：\r
\r
- **宇树（Unitree）**：四足起家，工程化能力强，开发者生态成熟\r
- **优必选（UBTECH）**：人形机器人先驱，教育+商用双线\r
- **智元（AgiBot）**：新锐人形，大模型基因，远征系列快速迭代\r
- **Tesla Optimus**：汽车基因，量产思维，垂直整合\r
\r
### 产品经理的对比维度\r
\r
不要只看「能不能走路」，要用统一框架横向拉齐：\r
\r
| 维度类别 | 具体指标 |\r
|----------|----------|\r
| 产品形态 | 人形 / 四足 / 轮足 / 机械臂 |\r
| 目标场景 | 科研 / 工业 / 家庭 / 展示 |\r
| 技术路线 | 自研算法 / 开源生态 / 大模型驱动 |\r
| 商业化 | 售价区间 / 出货量 / 收入模式 |\r
| 开放程度 | SDK / 仿真 / 社区活跃度 |\r
\r
### 今日目标\r
\r
完成一张 **4 公司 × 8 维度** 的对比表，作为 Day 5 竞品分析框架的输入素材。\r
\r
---\r
\r
## 核心概念\r
\r
### 四家代表公司概览\r
\r
#### 宇树科技（Unitree）\r
\r
| 项目 | 内容 |\r
|------|------|\r
| 成立 | 2016 年，杭州 |\r
| 核心路径 | 四足运动控制 → 通用人形 |\r
| 代表产品 | Go2（四足）、H1/G1（人形）、B2（行业四足） |\r
| 差异化 | 极致性价比、高动态运动、开发者生态、开源社区 |\r
| 目标客群 | 开发者、高校、行业客户 |\r
| 官网 | [unitree.com](https://www.unitree.com/) |\r
\r
#### 优必选（UBTECH）\r
\r
| 项目 | 内容 |\r
|------|------|\r
| 成立 | 2012 年，深圳 |\r
| 核心路径 | 人形机器人长期投入，Walker 系列 |\r
| 代表产品 | Walker S（工业人形）、悟空/阿尔法（教育） |\r
| 差异化 | 人形技术积累深、教育市场渠道、上市公司 |\r
| 目标客群 | 教育、商用服务、工业 |\r
| 官网 | [ubtrobot.com](https://www.ubtrobot.com/) |\r
\r
#### 智元机器人（AgiBot）\r
\r
| 项目 | 内容 |\r
|------|------|\r
| 成立 | 2023 年，上海 |\r
| 核心路径 | 大模型团队创业，快速推出人形整机 |\r
| 代表产品 | 远征 A1/A2、灵犀 X1/X2 |\r
| 差异化 | 创始团队 AI 背景、迭代速度快、关注具身大模型 |\r
| 目标客群 | 工业制造、科研、未来家庭 |\r
| 官网 | [zhiyuan-robot.com](https://www.zhiyuan-robot.com/) |\r
\r
#### Tesla Optimus\r
\r
| 项目 | 内容 |\r
|------|------|\r
| 启动 | 2021 年宣布，Tesla AI Day 首次亮相 |\r
| 核心路径 | 汽车制造能力外溢 + FSD 视觉栈迁移 |\r
| 代表产品 | Optimus Gen 1 / Gen 2 |\r
| 差异化 | 马斯克生态、量产成本目标、垂直整合供应链 |\r
| 目标客群 | Tesla 工厂内部 → 未来通用市场 |\r
| 官网 | [tesla.com/optimus](https://www.tesla.com/optimus) |\r
\r
### 横向对比矩阵\r
\r
| 维度 | 宇树 Unitree | 优必选 UBTECH | 智元 AgiBot | Tesla Optimus |\r
|------|-------------|---------------|-------------|---------------|\r
| 主力形态 | 四足 + 人形 | 人形 | 人形 | 人形 |\r
| 成立年限 | 10 年 | 13 年 | 2 年 | 4 年 |\r
| 已量产产品 | 是（多款 SKU） | 是（教育线成熟） | 早期交付 | 未量产 |\r
| 售价区间 | 万元级起 | 十万元级起 | 数十万元级 | 未公布 |\r
| 运动能力 | 极强（四足全球领先） | 成熟（行走稳定） | 快速进步 | 演示级别 |\r
| 操作能力 | 发展中 | 发展中 | 重点投入 | 演示级别 |\r
| 开发者生态 | 强（SDK+开源） | 中等 | 建设中 | 封闭 |\r
| AI 能力 | 自研 + 开源模型 | 自研 Walker 大脑 | 大模型驱动 | FSD 视觉迁移 |\r
| 商业化阶段 | 规模化销售 | 教育成熟/工业早期 | 早期客户 | 内部试用 |\r
| 融资/市值 | 多轮私募 | 港股上市 | 多轮高额融资 | Tesla 内部项目 |\r
\r
### 战略定位四象限\r
\r
\`\`\`\r
              高开放 / 生态驱动\r
                    │\r
         宇树       │       \r
    (开发者平台)    │    智元\r
                    │  (大模型原生)\r
  低成本 ───────────┼─────────── 高成本\r
                    │\r
         优必选     │    Tesla Optimus\r
    (垂直场景)      │   (垂直整合)\r
                    │\r
              低开放 / 产品驱动\r
\`\`\`\r
\r
### 产品策略差异解读\r
\r
**宇树**：用四足积累运动控制和供应链，以性价比打开开发者市场，再向上做人形。类似「机器人领域的 DJI 早期策略」。\r
\r
**优必选**：长期押注人形形态，教育市场提供现金流，工业人形（Walker S）是下一个增长点。\r
\r
**智元**：用 AI 人才和资本速度换时间窗口，快速推出整机抢占「具身大模型」叙事。\r
\r
**Tesla Optimus**：不急于商业化，目标是复用汽车产线和 FSD 能力，把单机成本压到 2 万美元以下。\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 官方一手信息\r
\r
- [宇树科技官网](https://www.unitree.com/)：产品参数、价格、应用案例\r
- [优必选官网](https://www.ubtrobot.com/)：Walker 系列、教育产品线\r
- [智元机器人官网](https://www.zhiyuan-robot.com/)：远征/灵犀系列、技术白皮书\r
- [Tesla Optimus 页面](https://www.tesla.com/optimus)：官方演示与愿景\r
\r
### 阅读指引\r
\r
| 公司 | 重点关注 | 预计时间 |\r
|------|----------|----------|\r
| 宇树 | 产品页参数对比、开发者文档入口 | 20 分钟 |\r
| 优必选 | Walker S 工业定位、教育产品线 | 15 分钟 |\r
| 智元 | 产品发布时间线、技术博客 | 15 分钟 |\r
| Tesla | 演示视频、马斯克公开表态 | 15 分钟 |\r
\r
---\r
\r
## Day 4 练习\r
\r
1. 填写完整版 4×8 对比矩阵（可复制上表扩展）\r
2. 用一句话概括每家公司的核心竞争策略\r
3. 如果你是一家新入局公司的 PM，你会选择对标哪家的路径？为什么？\r
4. 找出每家公司的「最强项」和「最弱项」各一个\r
`,"../../content/module-1/05-competitive.md":`# 竞品差异化分析框架\r
\r
> Day 5 | 建立可复用的竞品分析方法论\r
\r
## 关联学习天数\r
\r
**Day 5**\r
\r
---\r
\r
## PM 视角要点\r
\r
竞品分析是产品经理的**核心基本功**，但在具身智能领域，传统互联网竞品框架不够用。今天要建立一套适配「软硬一体 + 长周期技术演进」的分析框架。\r
\r
### 常见误区\r
\r
| 误区 | 正确做法 |\r
|------|----------|\r
| 只看官网宣传 | 交叉验证：论文、GitHub、招聘 JD、用户评价 |\r
| 只比参数表 | 参数背后的工程权衡才是产品决策的关键 |\r
| 静态快照对比 | 加入时间维度：6 个月前的竞品和现在可能完全不同 |\r
| 罗列功能清单 | 聚焦「用户任务完成度」而非功能数量 |\r
| 忽视生态 | SDK、社区、合作伙伴是中长期壁垒 |\r
\r
### 今日产出\r
\r
一份 **具身智能竞品分析框架 v0.1**，包含 8 大维度、每个维度 3-5 个具体指标，可直接用于后续项目。\r
\r
---\r
\r
## 核心概念\r
\r
### 竞品分析三步法\r
\r
\`\`\`\r
Step 1: 圈定竞品范围\r
    ↓  同形态 / 同场景 / 同客群\r
Step 2: 信息收集\r
    ↓  官方 + 第三方 + 一手体验\r
Step 3: 结构化输出\r
    ↓  矩阵对比 + 差异化洞察 + 策略建议\r
\`\`\`\r
\r
### 八大分析维度\r
\r
#### 1. 产品定位\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 目标客群 | ToD / ToB / ToC / ToG | 官网、发布会 |\r
| 核心场景 | 首要解决的 1-2 个场景 | 案例、白皮书 |\r
| 价值主张 | 一句话卖点 | 官网 Slogan |\r
| 产品形态 | 人形/四足/臂/复合 | 产品页 |\r
\r
#### 2. 硬件能力\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 自由度（DOF） | 关节数量与布局 | 产品规格 |\r
| 负载能力 | 末端/整机负载 | 产品规格 |\r
| 续航时间 | 典型工况续航 | 产品规格/评测 |\r
| 感知配置 | 相机/雷达/力觉数量与型号 | 拆解报告、规格 |\r
| 成本区间 | 售价或 BOM 估算 | 官网/行业报告 |\r
\r
#### 3. 软件与 AI 能力\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 感知栈 | SLAM、目标检测、语义分割方案 | 论文、技术博客 |\r
| 决策架构 | 规则 / RL / VLA / 混合 | 论文、开源代码 |\r
| 任务泛化 | 能完成多少类任务，换场景是否需要重训 | Demo 视频、评测 |\r
| 端云协同 | 推理在端侧还是云端 | 架构文档 |\r
| Sim-to-Real | 仿真训练成熟度 | 论文、开发者文档 |\r
\r
#### 4. 开发者生态\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| SDK 完整度 | 语言支持、API 覆盖范围 | 开发者文档 |\r
| 仿真环境 | 是否提供高保真仿真器 | 文档、GitHub |\r
| 开源程度 | 核心代码/模型是否开源 | GitHub |\r
| 社区活跃度 | Star 数、Issue 响应、论坛 | GitHub、Discord |\r
| 第三方应用 | 生态应用数量与质量 | 应用商店、案例 |\r
\r
#### 5. 商业化与交付\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 定价策略 | 硬件/软件/服务拆分 | 官网、销售 |\r
| 交付周期 | 下单到到手的时间 | 用户反馈 |\r
| 出货量 | 已交付数量级 | 新闻、财报 |\r
| 客户结构 | 头部客户 vs 长尾 | 案例、财报 |\r
| 售后体系 | 维保、培训、备件 | 服务条款 |\r
\r
#### 6. 团队与资源\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 核心团队背景 | AI / 机器人 / 制造 | 官网、LinkedIn |\r
| 融资情况 | 轮次、金额、投资方 | 新闻、IT 桔子 |\r
| 专利布局 | 核心专利数量与方向 | 专利检索 |\r
| 制造能力 | 自产 vs 代工 | 新闻、供应链分析 |\r
| 招聘方向 | 当前急招岗位反映战略重心 | 招聘网站 |\r
\r
#### 7. 数据与迭代\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 数据闭环 | 是否有真实场景数据采集机制 | 技术博客 |\r
| 迭代频率 | 产品/固件/模型更新节奏 | 更新日志 |\r
| OTA 能力 | 远程升级范围 | 文档 |\r
| 客户共创 | 是否与客户联合定义需求 | 案例 |\r
\r
#### 8. 风险与短板\r
\r
| 指标 | 说明 | 信息来源 |\r
|------|------|----------|\r
| 技术瓶颈 | 公开承认或外界质疑的短板 | 访谈、评测 |\r
| 供应链风险 | 关键零部件依赖 | 行业分析 |\r
| 合规风险 | 安全认证、数据隐私 | 认证信息 |\r
| 场景局限 | Demo 好看但量产的障碍 | 深度评测 |\r
\r
### 差异化分析矩阵模板\r
\r
将 Day 4 的四家公司填入以下模板：\r
\r
| 维度 | 权重 | 我司 | 竞品 A | 竞品 B | 竞品 C |\r
|------|------|------|--------|--------|--------|\r
| 产品定位 | 15% | | | | |\r
| 硬件能力 | 20% | | | | |\r
| 软件与 AI | 25% | | | | |\r
| 开发者生态 | 15% | | | | |\r
| 商业化 | 10% | | | | |\r
| 团队资源 | 5% | | | | |\r
| 数据迭代 | 5% | | | | |\r
| 风险短板 | 5% | | | | |\r
\r
> 权重可根据你所在公司的战略重心调整。例如做开发者平台的 PM 会把「生态」权重调高。\r
\r
### 差异化洞察输出格式\r
\r
每个竞品写三段：\r
\r
1. **核心优势**（1-2 条，附证据）\r
2. **明显短板**（1-2 条，附证据）\r
3. **对我们的启示**（可借鉴 / 需规避 / 可差异化）\r
\r
### 信息收集渠道清单\r
\r
| 渠道 | 获取信息类型 | 可信度 |\r
|------|-------------|--------|\r
| 官网产品页 | 规格、价格、定位 | 高（但可能有宣传水分） |\r
| 技术论文/博客 | 真实技术路线 | 高 |\r
| GitHub | 开源代码、社区活跃度 | 高 |\r
| 招聘 JD | 战略方向、技术栈 | 中高 |\r
| 行业报告 | 市场数据、产业链 | 中 |\r
| 社交媒体/演示视频 | 能力上限展示 | 中（注意剪辑） |\r
| 用户评价/论坛 | 真实体验、交付问题 | 中高 |\r
| 供应链/拆解 | 真实 BOM、零部件 | 高 |\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 方法论参考\r
\r
- 回顾 [Day 4 头部产品矩阵](./04-company-matrix.md) 的对比表，作为今日分析的输入\r
- 回顾 [Day 3 产业链图谱](./03-industry-chain.md)，从产业链角度补充竞品维度\r
\r
### 推荐阅读\r
\r
- [甲子光年：具身智能行业研究](http://www.jazzyear.com/study_info.html?id=146)：报告中的「竞争格局」章节提供行业级对比视角\r
\r
### 工具推荐\r
\r
- **表格**：Notion / 飞书多维表格（维护动态竞品库）\r
- **追踪**：Google Alerts / 即刻 / 微信公众号（竞品动态监控）\r
- **专利**：Google Patents / 国家知识产权局\r
\r
---\r
\r
## Day 5 练习\r
\r
1. 基于八大维度，完成竞品分析框架 v0.1 文档（可直接复制本节模板）\r
2. 选宇树和智元两家，各写一段「差异化洞察」（优势 + 短板 + 启示）\r
3. 为你所在（或假想）的公司，调整八大维度的权重并说明理由\r
4. 设计一个「竞品动态监控」机制：每周花 15 分钟，追踪什么信息？\r
`,"../../content/module-1/06-unitree.md":`# 宇树科技深度研究\r
\r
> Day 6 | 单公司案例：从产品、技术、生态到商业策略\r
\r
## 关联学习天数\r
\r
**Day 6**\r
\r
---\r
\r
## PM 视角要点\r
\r
深度研究一家公司，是产品经理的**「解剖课」**。宇树是国内具身智能领域最值得研究的案例之一，因为它同时具备：\r
\r
- **可验证的产品**：多款量产 SKU，有真实售价和出货量\r
- **开放的技术栈**：SDK、仿真、开源模型，可实际体验\r
- **清晰的演进路径**：四足 → 人形，每一步都有商业逻辑\r
- **活跃的开发者社区**：GitHub 星标、论文引用、高校采用率高\r
\r
### 今日研究方法\r
\r
\`\`\`\r
官网产品页 ──→ 技术参数与 SKU 策略\r
GitHub 仓库 ──→ 技术栈、开放程度、社区活跃度\r
招聘 JD ──→ 战略方向与能力缺口\r
论文/演示 ──→ 真实技术上限\r
用户评价 ──→ 交付体验与痛点\r
\`\`\`\r
\r
### 今日产出\r
\r
一份 **宇树公司产品档案**（建议 1 页 A4），包含：公司概况、产品矩阵、技术路线、商业模式、优劣势、对行业的启示。\r
\r
---\r
\r
## 核心概念\r
\r
### 公司概况\r
\r
| 项目 | 内容 |\r
|------|------|\r
| 全称 | 杭州宇树科技股份有限公司（Unitree Robotics） |\r
| 成立 | 2016 年 |\r
| 总部 | 浙江杭州 |\r
| 创始人 | 王兴兴（CEO，本硕毕业于上海大学） |\r
| 核心团队 | 运动控制、机械设计、嵌入式背景 |\r
| 融资 | 多轮私募，投资方含红杉、经纬、美团等 |\r
| 定位 | 全球高性能四足机器人领导者，向通用人形拓展 |\r
\r
### 产品矩阵\r
\r
| 产品线 | 代表型号 | 形态 | 价格区间 | 目标客群 |\r
|--------|----------|------|----------|----------|\r
| 消费级四足 | Go2 | 四足 | ~1 万元 | 开发者、教育、个人 |\r
| 行业级四足 | B2 / B2-W | 四足/轮足 | 十余万元 | 巡检、消防、科研 |\r
| 通用人形 | H1 / H1-2 | 人形 | 数十万元 | 科研、展示 |\r
| 轻量人形 | G1 | 人形 | 十万元级 | 开发者、教育 |\r
| 配件生态 | 相机、遥控器、电池 | 周边 | 千元级 | 存量用户 |\r
\r
### 产品演进时间线\r
\r
\`\`\`\r
2017  Laikago（首款四足，科研向）\r
  ↓\r
2019  Aliengo（行业四足）\r
  ↓\r
2020  A1（首款万元级四足，引爆开发者市场）\r
  ↓\r
2021  Go1（消费级四足，进一步降价）\r
  ↓\r
2022  Go2（加 AI 能力，语音交互）\r
  ↓\r
2023  H1（首款人形，亮相 CES）\r
  ↓\r
2024  G1（轻量化人形，万元级门槛）\r
  ↓\r
2024  H1-2 / B2-W（性能升级版）\r
\`\`\`\r
\r
### 技术能力拆解\r
\r
#### 运动控制（核心壁垒）\r
\r
- 高动态运动：四足奔跑、后空翻、地形适应\r
- 底层自研：电机驱动、控制器、控制算法全栈\r
- 从四足到人形：关节模组、平衡控制技术复用\r
\r
#### 感知与 AI\r
\r
- 多模态传感：深度相机、激光雷达（部分型号）、IMU\r
- 语音交互：Go2 搭载 GPT 类能力（合作方案）\r
- 自主导航：SLAM、避障、跟随\r
- 开源模型：UnifoLM（宇树自研具身大模型）\r
\r
#### 开发者生态\r
\r
| 组件 | 内容 |\r
|------|------|\r
| SDK | unitree_sdk2（Python/C++），支持全产品线 |\r
| 仿真 | unitree_mujoco（MuJoCo 仿真环境） |\r
| ROS 支持 | unitree_ros2 包 |\r
| 开源模型 | github.com/unitreerobotics（多个仓库） |\r
| 文档 | 中英文开发者文档，示例丰富 |\r
| 社区 | GitHub Issues 活跃，高校实验室广泛采用 |\r
\r
### 商业模式分析\r
\r
\`\`\`\r
收入来源\r
├── 硬件销售（主力）\r
│   ├── 消费级四足（走量，品牌传播）\r
│   ├── 行业四足（利润主力）\r
│   └── 人形（品牌制高点，未来增长）\r
├── 配件与维保\r
│   └── 电池、相机、维修服务\r
└── 潜在方向\r
    ├── 软件订阅（AI 能力增值服务）\r
    ├── 行业解决方案（巡检、物流打包方案）\r
    └── 开发者平台（模型市场、应用分成）\r
\`\`\`\r
\r
### SWOT 分析\r
\r
| | 正面 | 负面 |\r
|---|------|------|\r
| **内部** | **S 优势** | **W 劣势** |\r
| | 运动控制全球领先 | 操作能力（抓取/精细操作）仍在发展 |\r
| | 极致性价比 | 品牌溢价低于 Boston Dynamics |\r
| | 开发者生态成熟 | 人形产品商业化尚早 |\r
| | 供应链垂直整合 | 大模型能力需持续投入 |\r
| **外部** | **O 机会** | **T 威胁** |\r
| | 具身智能政策利好 | 人形赛道竞争者涌入（智元等） |\r
| | 高校科研市场需求大 | 国际政策与出口限制 |\r
| | 四足巡检场景成熟 | 大厂（Tesla、Figure）降维竞争 |\r
\r
### 对产品经理的启示\r
\r
1. **先打透一个形态，再扩展**：四足成熟后再做人形，降低技术风险\r
2. **开发者生态是最便宜的 GTM**：让高校和开发者帮你验证场景、传播品牌\r
3. **SKU 分层策略**：消费级走量、行业级赚钱、旗舰级定品牌\r
4. **开源是信任建设**：核心控制不开源，但 SDK 和仿真开放，降低接入门槛\r
5. **参数表背后有工程取舍**：为什么 G1 比 H1 便宜？减少自由度、降低负载、简化传感\r
\r
### 与竞品的关键差异\r
\r
| 对比维度 | 宇树 | Boston Dynamics | 智元 |\r
|----------|------|-----------------|------|\r
| 售价 | 万元级 | 数十万美元 | 数十万元 |\r
| 开放程度 | 高（SDK+仿真+部分开源） | 低（封闭生态） | 中（建设中） |\r
| 运动能力 | 极强 | 极强 | 快速进步 |\r
| 操作能力 | 发展中 | 演示级（Atlas） | 重点投入 |\r
| 商业化 | 已规模化 | 行业客户为主 | 早期 |\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 一手信息\r
\r
- [宇树科技官网](https://www.unitree.com/)：产品参数、价格、应用案例、新闻动态\r
- [宇树 GitHub 组织](https://github.com/unitreerobotics)：SDK、仿真、开源模型、社区活跃度\r
\r
### 建议重点查看的仓库\r
\r
| 仓库 | 内容 |\r
|------|------|\r
| unitree_sdk2 | 最新 SDK，支持 Go2/B2/H1/G1 |\r
| unitree_mujoco | MuJoCo 仿真环境 |\r
| unitree_ros2 | ROS2 集成包 |\r
| unitree_rl_gym | 强化学习训练环境 |\r
\r
### 阅读指引\r
\r
| 资料 | 重点关注 | 预计时间 |\r
|------|----------|----------|\r
| 官网产品页 | Go2 vs G1 vs H1 参数差异 | 25 分钟 |\r
| GitHub README | SDK 安装、API 覆盖、更新频率 | 25 分钟 |\r
| 官网新闻 | 产品发布节奏、合作动态 | 15 分钟 |\r
\r
---\r
\r
## Day 6 练习\r
\r
1. 完成宇树公司产品档案（1 页 A4）\r
2. 在 GitHub 上找到 unitree_sdk2，列出支持的主要 API 类别（至少 5 个）\r
3. 对比 Go2 和 G1 的参数表，分析「为什么 G1 便宜这么多」（至少 3 个工程取舍）\r
4. 如果你是宇树 PM，下一个应该优先投入的方向是什么？（提示：操作能力 / 家庭场景 / 开发者平台 / 国际市场）\r
`,"../../content/module-1/07-week-review.md":`# 第一周复盘方法\r
\r
> Day 7 | 固化认知，为第二周技术模块做准备\r
\r
## 关联学习天数\r
\r
**Day 7**\r
\r
---\r
\r
## PM 视角要点\r
\r
学习最大的浪费不是「学得少」，而是**学了就忘、笔记散落、无法复用**。第一周的复盘目标：\r
\r
- 把 6 天的零散笔记整合成**一张知识地图**\r
- 识别**3 个最模糊的概念**，标记为第二周重点攻克\r
- 产出**至少 1 份可展示的作品**（竞品矩阵或公司档案）\r
- 建立**每周复盘的固定仪式**，贯穿 12 周学习\r
\r
### 复盘不是「再看一遍」\r
\r
复盘的核心动作是**输出**，不是输入：\r
\r
| 动作 | 说明 | 时间 |\r
|------|------|------|\r
| 回忆 | 不看书，写下本周学到的 10 个关键点 | 15 分钟 |\r
| 对比 | 与 Day 1 的笔记对比，哪些理解变了 | 10 分钟 |\r
| 串联 | 画知识地图，建立概念间联系 | 20 分钟 |\r
| 检验 | 用 3 个问题自测（见下方） | 10 分钟 |\r
| 规划 | 列出下周学习重点和待解决问题 | 10 分钟 |\r
\r
---\r
\r
## 核心概念\r
\r
### 费曼学习法在本周的应用\r
\r
> 如果你不能简单地解释一件事，说明你还没有真正理解它。\r
\r
本周每个核心概念，尝试用**非技术语言**向一个外行解释：\r
\r
| 概念 | 你的解释（30 秒版） | 自评（1-5） |\r
|------|---------------------|-------------|\r
| 具身智能 | | |\r
| 产业链上中下游 | | |\r
| VLA（预告第二周） | | |\r
| 宇树的核心竞争力 | | |\r
| 竞品分析框架 | | |\r
\r
### 知识地图模板\r
\r
\`\`\`\r
                    具身智能定义\r
                   /     |     \\\r
                  /      |      \\\r
           学术根源   产业定义   边界判断\r
                \\      |      /\r
                 \\     |     /\r
                  发展历程\r
                 /     |     \\\r
           工业机器人  深度学习  大模型融合\r
                  \\     |     /\r
                   产业链图谱\r
                  /     |     \\\r
            上游零部件  中游整机  下游场景\r
                  \\     |     /\r
                  头部公司矩阵\r
                 /    |    |    \\\r
            宇树  优必选  智元  Tesla\r
                  \\    |    |    /\r
                  竞品分析框架\r
                       |\r
                   周复盘输出\r
\`\`\`\r
\r
### 自测三问\r
\r
完成以下三个问题，检验第一周学习效果：\r
\r
**问题 1：概念题**\r
\r
> 请向一位传统互联网 PM 解释：具身智能产品和 AI Agent 产品的核心差异是什么？为什么这个差异会导致完全不同的产品方法论？\r
\r
**问题 2：分析题**\r
\r
> 假设你入职一家中游整机公司（人形机器人方向），请用产业链框架说明：你需要优先了解的 3 个上游环节是什么？你的直接竞品至少有哪些？\r
\r
**问题 3：实操题**\r
\r
> 用本周建立的竞品分析框架，快速评估一家你之前没研究过的具身智能公司（如 Figure、1X、傅利叶），15 分钟内产出一段差异化洞察。\r
\r
### 本周产出检查清单\r
\r
| 产出物 | 完成？ | 存放位置 |\r
|--------|--------|----------|\r
| 具身智能一句话定义 | ☐ | |\r
| 发展时间轴（6+ 节点） | ☐ | |\r
| 产业链三层图谱 | ☐ | |\r
| 4 公司对比矩阵 | ☐ | |\r
| 竞品分析框架 v0.1 | ☐ | |\r
| 宇树产品档案（1 页） | ☐ | |\r
| 知识地图 | ☐ | |\r
| 3 个待深入问题 | ☐ | |\r
\r
### 常见的第一周困惑\r
\r
| 困惑 | 正常吗？ | 建议 |\r
|------|----------|------|\r
| VLA、RL 是什么？听不懂 | 正常，第二周会学 | 先记住名字，不深入 |\r
| 各家公司参数差异看不懂 | 正常 | 关注「差异背后的取舍」而非数字本身 |\r
| 不确定哪家公司最重要 | 正常 | 宇树是最佳深度案例，其他先建档 |\r
| 竞品分析和市场分析分不清 | 正常 | 本周框架偏竞品，市场分析在后续项目 |\r
| 感觉学了很多但说不出 | 今天复盘的目标 | 强制输出，用费曼法检验 |\r
\r
### 复盘输出模板\r
\r
\`\`\`markdown\r
# 第一周复盘 | Day 7\r
\r
## 本周最大收获（3 条）\r
1.\r
2.\r
3.\r
\r
## 理解发生变化的观点\r
- 之前认为：...\r
- 现在认为：...\r
\r
## 仍不清楚的 3 个问题\r
1.\r
2.\r
3.\r
\r
## 本周最佳产出\r
（附上竞品矩阵或公司档案链接）\r
\r
## 第二周学习重点\r
1.\r
2.\r
3.\r
\`\`\`\r
\r
### 向第二周过渡\r
\r
第二周进入「产品与技术基础」，会涉及更多技术概念。第一周的行业理解为技术学习提供**上下文**：\r
\r
| 第一周（行业） | 第二周（技术） | 关联 |\r
|----------------|----------------|------|\r
| 具身智能定义 | 大脑与小脑协同 | 定义中的「认知」和「行动」如何分工 |\r
| 产业链中游 | 核心硬件认知 | 整机 PM 需要懂的硬件清单 |\r
| 宇树技术栈 | VLA 模型入门 | 宇树的 UnifoLM 就是 VLA 方向 |\r
| 竞品分析框架 | 数据闭环 | 生态和数据是竞品差异化的深层维度 |\r
\r
---\r
\r
## 今日推荐资料\r
\r
### 复盘参考\r
\r
- 回顾本周全部章节：\r
  - [模块总览](./00-overview.md)\r
  - [具身智能定义](./01-definition.md)\r
  - [发展历程](./02-history.md)\r
  - [产业链图谱](./03-industry-chain.md)\r
  - [头部产品矩阵](./04-company-matrix.md)\r
  - [竞品差异化](./05-competitive.md)\r
  - [宇树深度研究](./06-unitree.md)\r
\r
### 学习方法\r
\r
- 费曼学习法：选本周最难的一个概念，写一段 200 字的「教别人」文稿\r
- 康奈尔笔记法：检查本周笔记是否有关键词栏和总结栏\r
\r
---\r
\r
## Day 7 练习\r
\r
1. 完成「本周产出检查清单」，确认 8 项产出\r
2. 画一张知识地图（手绘拍照或工具绘制均可）\r
3. 回答「自测三问」，写下来而非只想\r
4. 填写「复盘输出模板」，保存到固定位置\r
5. 预习第二周 [模块二总览](../module-2/00-overview.md)（如已创建），列出你最期待的 2 个技术主题\r
\r
---\r
\r
## 第一周完成\r
\r
恭喜完成具身智能产品经理学习路径的第一周。\r
\r
你已经建立了：\r
- 行业概念的语言体系\r
- 产业链的全局视角\r
- 头部玩家的竞品档案\r
- 可复用的分析框架\r
\r
第二周，我们将进入「产品与技术基础」，把「大脑」「小脑」「VLA」这些术语变成你能用于产品讨论的工具。\r
`,"../../content/module-2/00-overview.md":`# 模块总览：产品与技术基础（上）\r
\r
## PM视角要点\r
\r
- 第2周目标不是成为算法工程师，而是建立「能跟研发对齐语言、能判断技术路线是否支撑产品目标」的认知框架。\r
- 本周主线：从机器人系统分层（大脑/小脑）出发，理解硬件与感知边界，再进入 VLA、RL、模仿学习三大学习范式，最后串成数据闭环。\r
- 产品经理应关注「能力边界」而非「模型参数」：什么场景能落地、什么指标可验收、什么数据缺口会卡住迭代。\r
- 每天 1 篇精读 + 1 个概念卡片，周末用数据闭环章节做 Week 2 复盘。\r
\r
## 核心概念\r
\r
### 本周学习地图\r
\r
| 天数 | 主题 | 产出 |\r
|------|------|------|\r
| Day 8 | 大脑与小脑协同 | 理解分层控制与产品职责划分 |\r
| Day 9 | 核心硬件 | 关节、伺服、IMU、深度相机基础认知 |\r
| Day 10 | 传感器与感知 | 视觉、触觉、力觉的产品取舍 |\r
| Day 11 | VLA 入门 | 视觉-语言-动作统一模型概念 |\r
| Day 12 | 强化学习入门 | 奖励、策略、Sim2Real 基本链路 |\r
| Day 13 | 模仿学习入门 | 示教数据、行为克隆、Diffusion/ACT |\r
| Day 14 | 数据闭环 | 采集、标注、训练、评测一体化 |\r
\r
### 与第1周的关系\r
\r
第1周解决「市场与竞品在哪」，第2周解决「产品能力从哪来」。两者结合，才能写出有技术可信度的 PRD 与路线图。\r
\r
## 今日推荐资料\r
\r
- [Isaac Lab 文档](https://isaac-sim.github.io/IsaacLab/main/index.html)：了解现代机器人仿真与训练栈\r
- [LeRobot 开源库](https://github.com/huggingface/lerobot)：Hugging Face 机器人学习工具集，适合 PM 快速建立工程语境\r
- [ROS 2 入门](https://docs.ros.org/en/humble/index.html)：理解机器人软件中间件与节点通信\r
\r
## 关联学习天数\r
\r
Day 8-14\r
`,"../../content/module-2/01-brain-cerebellum.md":`# 大脑与小脑协同\r
\r
## PM视角要点\r
\r
- 机器人「大脑」负责理解意图、规划任务、调用工具；「小脑」负责毫秒级平衡、轨迹跟踪、力控与 reflex。产品功能应明确落在哪一层。\r
- 用户说「帮我把杯子拿来」，大脑做语义理解与任务分解，小脑保证抓取过程中不洒、不撞、不掉。\r
- 常见产品失误：把大模型对话能力等同于机器人执行力，忽略小脑层稳定性与硬件极限。\r
- 评估指标要分层：大脑看任务理解准确率、规划成功率；小脑看控制频率、抖动、碰撞率、能耗。\r
\r
## 核心概念\r
\r
### 大脑层（认知与规划）\r
\r
- **输入**：自然语言、视觉语义、环境地图、用户偏好\r
- **输出**：子任务序列、技能调用、异常恢复策略\r
- **典型组件**：VLA、LLM Agent、任务规划器、记忆与 RAG\r
\r
### 小脑层（运动与控制）\r
\r
- **输入**：关节状态、IMU、力矩、触觉反馈\r
- **输出**：关节目标位置/速度/力矩、步态参数\r
- **典型组件**：PD 控制、MPC、RL 策略、阻抗控制\r
\r
### 协同模式\r
\r
\`\`\`\r
用户指令 → 大脑（理解+规划）→ 技能接口 → 小脑（执行+反馈）→ 感知回传 → 大脑（重规划）\r
\`\`\`\r
\r
产品经理需要定义「技能接口」：每个可调用技能的标准输入、输出、失败码与超时策略。\r
\r
## 今日推荐资料\r
\r
- [Boston Dynamics Atlas 控制架构解读（IEEE Spectrum）](https://spectrum.ieee.org/boston-dynamics-atlas)\r
- [Whole Body Control 综述（arXiv）](https://arxiv.org/abs/1703.02673)\r
- [宇树 G1 产品页](https://www.unitree.com/g1)：观察消费级人形如何宣传「智能」与「运动」分工\r
\r
## 关联学习天数\r
\r
Day 8\r
`,"../../content/module-2/02-hardware.md":`# 核心硬件认知\r
\r
## PM视角要点\r
\r
- 硬件决定产品天花板：同样的算法，在不同关节精度、减速比、相机分辨率下，体验差异巨大。\r
- 产品经理不必会画电路图，但要能读懂 BOM 级取舍：成本、重量、续航、可靠性之间的三角关系。\r
- 选型问题要具体：「为什么用谐波减速器而非行星减速器？」「为什么头部放 RGB-D 而非纯 RGB？」\r
- 与供应链和研发对齐时，用「性能指标 + 场景约束」沟通，而非抽象地说「要更好」。\r
\r
## 核心概念\r
\r
### 关节（Joint）\r
\r
- **自由度（DoF）**：决定动作空间维度，直接影响抓取、行走、操作灵巧度\r
- **减速器**：谐波（精度高、成本高）、行星（成本低、背隙大）\r
- **编码器**：绝对式/增量式，影响上电归零与定位精度\r
\r
### 伺服系统（Servo）\r
\r
- 电机 + 驱动器 + 编码器 + 控制算法闭环\r
- 关键参数：额定扭矩、峰值扭矩、带宽、温升\r
- PM 关注：同样动作下是否过热降频、是否出现可感知的「力矩饱和」\r
\r
### IMU（惯性测量单元）\r
\r
- 测量角速度、加速度，辅助姿态估计与步态平衡\r
- 消费级 vs 工业级 IMU 在漂移、噪声、标定上差异明显\r
- 产品场景：快速转身、上下楼梯时，IMU 质量直接影响「稳不稳」的主观感受\r
\r
### 深度相机（Depth Camera）\r
\r
- 提供 RGB + 深度，支撑抓取、避障、SLAM\r
- 常见方案：结构光、ToF、双目立体\r
- 限制：强光、透明/反光物体、远距离精度下降\r
\r
## 今日推荐资料\r
\r
- [Harmonic Drive 减速器原理（官方）](https://www.harmonicdrive.net/products/harmonic-drive-systems)\r
- [Intel RealSense 产品文档](https://www.intelrealsense.com/)\r
- [Robotiq 夹爪选型指南](https://robotiq.com/products)\r
\r
## 关联学习天数\r
\r
Day 9\r
`,"../../content/module-2/03-sensors.md":`# 传感器与感知\r
\r
## PM视角要点\r
\r
- 传感器是机器人「看见世界、感受接触」的入口，直接决定哪些用户场景可做、哪些必须降级。\r
- 产品定义阶段就要回答：最低配感知组合是什么？增配传感器能带来多少成功率提升？\r
- 视觉、触觉、力觉不是越多越好，而是与任务匹配：家庭抓取重视觉+力控，工业装配重力觉+触觉。\r
- 感知失败要有产品级兜底：看不清时主动询问、切换模式、或拒绝执行并说明原因。\r
\r
## 核心概念\r
\r
### 视觉（Vision）\r
\r
- **RGB 相机**：语义理解、物体识别、人机交互\r
- **深度/RGB-D**：6DoF 抓取、避障、场景重建\r
- **产品指标**：检测召回率、定位误差、光照鲁棒性、延迟\r
\r
### 触觉（Tactile）\r
\r
- 感知接触形状、纹理、滑移\r
- 应用：精细装配、握力自适应、材质识别\r
- 挑战：成本高、标定难、与视觉融合复杂\r
\r
### 力/力矩（Force/Torque）\r
\r
- 六维力传感器或关节力矩估计\r
- 应用：恒力打磨、协作安全、插拔装配\r
- 产品价值：让用户感到机器人「有分寸」，而非蛮力碰撞\r
\r
### 感知融合\r
\r
多传感器时间同步与坐标系对齐是工程难点。PM 在需求文档中应写明：各传感器的数据频率、融合策略、失效降级路径。\r
\r
## 今日推荐资料\r
\r
- [OpenCV 官方教程](https://docs.opencv.org/4.x/d9/df8/tutorial_root.html)\r
- [GelSight 触觉传感研究页](https://gelsight.com/)\r
- [ATI 力矩传感器产品页](https://www.ati-ia.com/products/force-torque-sensors.aspx)\r
\r
## 关联学习天数\r
\r
Day 10\r
`,"../../content/module-2/04-vla-intro.md":`# VLA 模型入门\r
\r
## PM视角要点\r
\r
- VLA（Vision-Language-Action）把「看、懂、做」统一到一个大模型里，是具身智能当前最热的路线之一。\r
- 产品经理应理解 VLA 解决的核心问题：从自然语言指令直接输出机器人动作，减少传统 pipeline 的手工编排。\r
- 关注落地三问：泛化到新物体/新场景的能力如何？推理延迟能否满足实时控制？训练数据从哪来、成本多少？\r
- VLA 不是万能：复杂长 horizon 任务仍可能需要分层规划 + 底层控制配合。\r
\r
## 核心概念\r
\r
### 什么是 VLA\r
\r
VLA 模型同时接收视觉观测与自然语言指令，输出机器人动作（关节角、末端位姿、离散技能 token 等）。\r
\r
### 代表路线\r
\r
| 模型 | 特点 |\r
|------|------|\r
| RT-2 | 将机器人动作离散化为 token，与 VLM 联合训练 |\r
| OpenVLA | 开源 7B 级 VLA，基于 Prismatic VLM + 动作头 |\r
| π0 / 后续工作 | 流匹配、扩散等动作生成方式持续演进 |\r
\r
### 产品化关键\r
\r
- **动作表示**：离散 token vs 连续控制，影响精度与训练难度\r
- **数据规模**：互联网图文 + 机器人示教数据的混合比例\r
- **部署**：边缘端算力 vs 云端推理的延迟与隐私权衡\r
- **安全**：错误动作的后果分级，需要护栏与人工确认机制\r
\r
## 今日推荐资料\r
\r
- [RT-2: Vision-Language-Action Models（项目页）](https://robotics-transformer2.github.io/)\r
- [OpenVLA 开源项目](https://openvla.github.io/)\r
- [OpenVLA 论文（arXiv）](https://arxiv.org/abs/2406.09246)\r
\r
## 关联学习天数\r
\r
Day 11\r
`,"../../content/module-2/05-rl-intro.md":`# 强化学习入门\r
\r
## PM视角要点\r
\r
- 强化学习（RL）让机器人在与环境的试错中学习策略，擅长 locomotion（行走、平衡）等难以手工编程的控制任务。\r
- PM 不必推导 Bellman 方程，但要理解 RL 的产品代价：仿真环境搭建、奖励函数设计、Sim2Sim/Sim2Real 迁移、训练算力与时间。\r
- 奖励函数设计是「隐性产品需求」：研发优化的目标函数，最终就是用户体验（稳、快、省能、安全）。\r
- RL 上线前必须定义验收场景集：平地、斜坡、扰动、负载变化，否则 demo 成功不等于可交付。\r
\r
## 核心概念\r
\r
### 基本要素\r
\r
- **状态（State）**：关节角、速度、IMU、接触力等\r
- **动作（Action）**：目标扭矩、位置增量、步态参数\r
- **奖励（Reward）**：标量反馈，引导策略优化方向\r
- **策略（Policy）**：状态到动作的映射，通常用神经网络表示\r
\r
### 训练流程\r
\r
\`\`\`\r
仿真环境 → 策略采样 → 计算奖励 → 策略梯度更新 → 重复百万步 → Sim2Sim 验证 → 真机部署\r
\`\`\`\r
\r
### 常见算法\r
\r
- **PPO**（Proximal Policy Optimization）：稳定、易调参， legged robot 领域广泛使用\r
- **SAC/TD3**：连续控制场景的 off-policy 方法\r
\r
### Sim2Real 鸿沟\r
\r
仿真中的摩擦、延迟、电机特性与真实世界存在差异。产品 roadmap 需预留 sim2real 调参与人机共处的安全验证周期。\r
\r
## 今日推荐资料\r
\r
- [Spinning Up in Deep RL（OpenAI 教程）](https://spinningup.openai.com/)\r
- [PPO 原始论文（arXiv）](https://arxiv.org/abs/1707.06347)\r
- [Isaac Gym 文档](https://developer.nvidia.com/isaac-gym)\r
\r
## 关联学习天数\r
\r
Day 12\r
`,"../../content/module-2/06-imitation-learning.md":`# 模仿学习入门\r
\r
## PM视角要点\r
\r
- 模仿学习（Imitation Learning, IL）从人类示教或遥操作中学习，是 manipulation（抓取、装配）最主流的数据驱动路径。\r
- 产品经理的核心工作：定义「什么是好示教」、设计遥操作 UX、估算数据采集成本与规模。\r
- 行为克隆（BC）简单但存在复合误差：一步错步步错。Chunk 预测、扩散策略等方法是为解决此问题而生。\r
- 评估 IL 产品不能只看训练 loss，要看 OOD（分布外）场景：新物体、新位置、新光照下的成功率。\r
\r
## 核心概念\r
\r
### 行为克隆（Behavior Cloning）\r
\r
- 将示教数据当作监督学习：观测 → 动作\r
- 优点：实现简单、样本效率相对高\r
- 缺点：误差累积、难以处理多模态动作（同一观测多种合理动作）\r
\r
### Diffusion Policy\r
\r
- 用扩散模型生成动作序列，能建模多模态分布\r
- 在精细操作任务上表现优异，推理需多步去噪，延迟是产品关注点\r
\r
### ACT（Action Chunking with Transformers）\r
\r
- 一次预测一段动作 chunk（如 100 步），减少复合误差\r
- 结合 CVAE 处理多模态，ALOHA 双臂系统上 50 条示教即可达 80%+ 成功率\r
- 适合 PM 关注的「低数据、高成功率」家庭/轻量场景\r
\r
### 数据采集产品化\r
\r
- 遥操作界面、示教质检、自动过滤无效轨迹\r
- 数据多样性规划：物体、背景、起始位姿的覆盖矩阵\r
\r
## 今日推荐资料\r
\r
- [Diffusion Policy 项目页](https://diffusion-policy.cs.columbia.edu/)\r
- [ACT 论文：Learning Fine-Grained Bimanual Manipulation（arXiv）](https://arxiv.org/abs/2304.13705)\r
- [ALOHA 项目页](https://tonyzhaozh.github.io/aloha/)\r
\r
## 关联学习天数\r
\r
Day 13\r
`,"../../content/module-2/07-data-loop.md":`# 数据闭环\r
\r
## PM视角要点\r
\r
- 具身智能产品的竞争力越来越取决于数据飞轮，而非单次模型发布。\r
- 数据闭环 = 采集 → 标注/质检 → 训练 → 部署 → 在线评测 → 发现 bad case → 再采集。PM 应 owner 整个 loop 的节奏与优先级。\r
- 每个环节都有产品决策：采什么场景、标注粒度、A/B 评测指标、多少 bad case 才触发再训练。\r
- 没有闭环的团队会陷入「demo 永远在同一个桌子拍」的陷阱，无法规模化。\r
\r
## 核心概念\r
\r
### 闭环六步\r
\r
\`\`\`\r
1. 场景定义 → 2. 数据采集 → 3. 数据治理 → 4. 模型训练 → 5. 仿真/真机评测 → 6. 线上监控与回流\r
\`\`\`\r
\r
### 数据采集\r
\r
- **来源**：遥操作、自主探索、人类在环、仿真合成\r
- **元数据**：场景 ID、物体类别、光照、失败原因标签\r
- **PM 输出**：数据采集 playbook、场景覆盖矩阵\r
\r
### 评测体系\r
\r
- **离线**：held-out 验证集成功率、轨迹误差\r
- **在线**：任务完成率、平均耗时、人工介入次数、安全事件数\r
- **对比**：版本间 regression 检测，新模型不得在某些核心场景退步\r
\r
### 与 Week 2 总结\r
\r
Day 8-13 学的分层架构、硬件、VLA/RL/IL，最终都要汇入数据闭环。产品经理的第2周收官，是画出自己目标产品的第一版闭环 diagram。\r
\r
## 今日推荐资料\r
\r
- [Open X-Embodiment 数据集](https://robotics-transformer-x.github.io/)\r
- [RoboNet 数据集](https://www.robonet.wang/)\r
- [W&B 实验追踪](https://wandb.ai/site)：了解 ML 团队如何管理训练与评测实验\r
\r
## 关联学习天数\r
\r
Day 14\r
`,"../../content/module-3/00-overview.md":`# 模块总览：产品与技术基础（下）\r
\r
## PM视角要点\r
\r
- 第3周从「懂技术」转向「做产品」：在成本、性能、可靠性之间做取舍，设计人机交互，构建数据飞轮，输出竞品分析报告。\r
- 本周产出应可直接用于作品集：一份家庭机器人交互方案草图、一份数据飞轮 diagram、一份结构化竞品报告。\r
- 产品经理的价值在于把技术可能性翻译成用户可感知、可付费、可迭代的体验。\r
- Day 18-20 集中完成竞品报告，需回溯第1周竞品章节与第2周技术认知。\r
\r
## 核心概念\r
\r
### 本周学习地图\r
\r
| 天数 | 主题 | 产出 |\r
|------|------|------|\r
| Day 15 | 产品思维与取舍 | 成本/性能/可靠性三角分析 |\r
| Day 16 | 人机交互设计 | 语音/APP/手势交互方案 |\r
| Day 17 | 数据飞轮设计 | 飞轮 diagram + 关键指标 |\r
| Day 18-20 | 竞品分析报告 | 完整竞品文档 |\r
\r
### 与前两周的衔接\r
\r
- **Module 1**：市场格局、竞品差异化框架\r
- **Module 2**：VLA/RL/IL 与数据闭环的技术底座\r
- **Module 3**：把认知转化为可评审的产品 artifact\r
\r
## 今日推荐资料\r
\r
- [Intercom 产品管理指南](https://www.intercom.com/blog/product-management/)\r
- [NN/g 可用性启发式原则](https://www.nngroup.com/articles/ten-usability-heuristics/)\r
- [Lenny's Newsletter](https://www.lennysnewsletter.com/)：产品思维与增长案例\r
\r
## 关联学习天数\r
\r
Day 15-20\r
`,"../../content/module-3/01-product-thinking.md":`# 产品思维与取舍\r
\r
## PM视角要点\r
\r
- 具身智能硬件产品永远在 **成本、性能、可靠性** 三角中做取舍，没有「全都要」的 SKU。\r
- 产品经理要能把用户价值翻译为可量化的 engineering tradeoff：例如「续航 2 小时」意味着电池重量与关节扭矩上限。\r
- 可靠性不是附加项，是品牌底线：家庭场景一次倾倒、一次夹手，就可能引发退货与舆情。\r
- 用「目标用户 + 核心场景 + 不可妥协指标」三件套驱动取舍，避免被技术 demo 带偏 roadmap。\r
\r
## 核心概念\r
\r
### 成本（Cost）\r
\r
- **BOM 成本**：关节、传感器、算力模组、结构件\r
- **研发成本**：仿真、数据采集、算法人力、认证测试\r
- **隐性成本**：售后、召回、数据标注、云推理\r
- PM 工具：目标零售价反推 BOM 上限，再与研发对齐「砍什么、保什么」\r
\r
### 性能（Performance）\r
\r
- **感知性能**：识别率、定位精度、响应延迟\r
- **运动性能**：速度、负载、灵巧度、噪音\r
- **智能性能**：指令理解、泛化、多轮对话\r
- 注意：性能指标必须绑定场景，脱离场景的参数对比无意义\r
\r
### 可靠性（Reliability）\r
\r
- **MTBF**（平均无故障时间）、**任务成功率**、**安全事件率**\r
- 环境鲁棒性：温度、湿度、地面材质、宠物/儿童干扰\r
- 软件可靠性： OTA 失败回滚、离线降级、断网可用性\r
\r
### 取舍框架示例\r
\r
| 定位 | 优先 | 可牺牲 |\r
|------|------|--------|\r
| 高端家庭助手 | 可靠性、交互自然度 | 部分 BOM 成本 |\r
| 开发者平台 | 开放接口、可扩展 | 开箱即用体验 |\r
| 工业巡检 | 可靠性、续航 | 交互丰富度 |\r
\r
## 今日推荐资料\r
\r
- [《Inspired》Marty Cagan 产品方法摘要](https://www.svpg.com/inspired-how-to-create-products-customers-love/)\r
- [Hardware Product Management（Bolt 博客）](https://www.bolt.io/blog)\r
- [DFM 设计制造可行性入门](https://www.protolabs.com/resources/design-tips/)\r
\r
## 关联学习天数\r
\r
Day 15\r
`,"../../content/module-3/02-hci-design.md":`# 人机交互设计\r
\r
## PM视角要点\r
\r
- 家庭机器人的交互不是「加一个 ChatGPT」，而是语音、APP、手势、屏幕、行为反馈的多模态编排。\r
- 用户心理模型：机器人是「家庭成员」还是「工具」？这决定语气、主动性边界与隐私策略。\r
- 交互设计要覆盖失败态：听不懂、做不到、做一半失败时，如何沟通、如何求助、如何恢复信任。\r
- PM 应产出交互 storyboard：从唤醒 → 指令 → 执行反馈 → 完成确认 → 异常处理的完整链路。\r
\r
## 核心概念\r
\r
### 语音交互\r
\r
- **唤醒词**：误唤醒率 vs 唤醒灵敏度\r
- **NLU**：意图识别、槽位填充、多轮澄清\r
- **TTS 反馈**：状态播报、进度提示、情感化语气\r
- 家庭场景挑战：噪音、方言、儿童声线、电视背景声\r
\r
### APP 交互\r
\r
- **设备管理**：配网、地图、禁区、日程\r
- **任务编排**：可视化技能链、场景自动化（「我回家时…」）\r
- **监控与回放**：隐私开关、本地/云端存储策略\r
- **远程接管**：家人不在时远程查看与授权\r
\r
### 手势与行为反馈\r
\r
- **手势识别**：招手、停止、指向（需考虑摄像头视角与遮挡）\r
- **灯效/屏幕表情**：表达状态（思考中、执行中、报错）\r
- **运动语言**：点头、转向用户、后退示意「请让路」\r
- 行为反馈降低「黑盒感」，是建立信任的关键\r
\r
### 设计原则\r
\r
1. **可预测**：用户知道机器人正在做什么\r
2. **可中断**：随时说「停」或做停止手势\r
3. **可确认**：高风险动作前二次确认\r
4. **低打扰**：非任务时不频繁主动搭话\r
\r
## 今日推荐资料\r
\r
- [Google Conversation Design 指南](https://developers.google.com/assistant/conversation-design)\r
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)\r
- [Amazon Alexa Design Guide](https://developer.amazon.com/en-US/alexa/alexa-skills-kit/skills-kit-design)\r
\r
## 关联学习天数\r
\r
Day 16\r
`,"../../content/module-3/03-data-flywheel.md":`# 数据飞轮设计\r
\r
## PM视角要点\r
\r
- 数据飞轮是具身智能产品的长期护城河：更多用户 → 更多场景数据 → 更好模型 → 更好体验 → 更多用户。\r
- PM 要设计「主动采集」而非「被动蹭数据」：用户为何愿意贡献示教、反馈、环境扫描？\r
- 飞轮每个环节需 KPI：采集量、标注质量、模型 uplift、用户感知改进、留存变化。\r
- 隐私与合规是飞轮前提：家庭场景数据敏感，需本地处理、匿名化、可删除机制。\r
\r
## 核心概念\r
\r
### 飞轮结构\r
\r
\`\`\`\r
用户任务 → 行为/失败日志 → 数据清洗 → 模型迭代 → 新能力发布 → 用户价值提升 → 更多使用\r
\`\`\`\r
\r
### 三类数据资产\r
\r
| 类型 | 内容 | 产品用途 |\r
|------|------|----------|\r
| 示教数据 | 遥操作轨迹 | 提升 manipulation 成功率 |\r
| 交互数据 | 语音指令、澄清对话 | 优化 NLU 与任务规划 |\r
| 环境数据 | 地图、物体布局（脱敏） | 提升导航与场景理解 |\r
\r
### 激励与贡献机制\r
\r
- **显性激励**：技能市场积分、功能 early access\r
- **隐性激励**：机器人「越用越懂我家」\r
- **众包标注**：用户确认「这是杯子吗？」式轻量标注\r
\r
### 冷启动策略\r
\r
1. 仿真合成 + 公开数据集预训练\r
2. 种子用户深度共建（design partner）\r
3. 限定场景 MVP，先打穿一个 room 再扩展\r
\r
### PM 交付物\r
\r
- 数据飞轮 diagram（Mermaid 或 FigJam）\r
- 各环节 owner 与 SLA\r
- 隐私影响评估摘要\r
\r
## 今日推荐资料\r
\r
- [Andrew Chen: The Cold Start Problem](https://www.coldstart.com/)\r
- [OpenAI 数据策略讨论（行业分析）](https://openai.com/index/)\r
- [GDPR 与 AI 数据处理指南（ICO）](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/)\r
\r
## 关联学习天数\r
\r
Day 17\r
`,"../../content/module-3/04-competitive-report.md":`# 竞品分析报告\r
\r
## PM视角要点\r
\r
- 竞品分析不是「抄功能清单」，而是回答：目标用户为何选 A 不选 B？我们的差异化是否可防御、可感知？\r
- 本模块 Day 18-20 的交付物是一份结构化报告，建议 8-12 页，含表格、截图、技术判断与产品建议。\r
- 分析维度应覆盖：定位、价格、硬件配置、软件能力、交互、开发者生态、数据策略、渠道与品牌。\r
- 需回溯第1周竞品框架，并结合第2-3周技术认知，避免「只看营销页、不懂实现难度」。\r
\r
## 核心概念\r
\r
### 报告结构模板\r
\r
1. **Executive Summary**（1 页）\r
2. **市场与用户需求**（引用 Module 1 行业认知）\r
3. **竞品选取与矩阵**（3-5 个直接/间接竞品）\r
4. **功能对比表**（硬件、感知、智能、交互、价格）\r
5. **技术路线判断**（VLA vs 传统 pipeline、RL vs 示教等）\r
6. **SWOT 与机会窗口**\r
7. **产品建议与 roadmap implication**\r
\r
### 对比维度清单\r
\r
| 维度 | 考察点 |\r
|------|--------|\r
| 硬件 | DoF、传感器、续航、噪音 |\r
| 智能 | 开放词汇指令、泛化、多轮对话 |\r
| 交互 | 语音/APP/手势、失败态处理 |\r
| 生态 | SDK、开发者社区、第三方技能 |\r
| 商业 | 定价、订阅、ToB/ToC 策略 |\r
\r
### 与 Module 1 的关联\r
\r
请先阅读 [竞品差异化（Module 1）](/doc/module-1/05-competitive)，复用其中的分析框架与术语，在本报告中做「2.0 深化版」：加入你第2-3周的技术理解与家庭场景假设。\r
\r
### 评分方法\r
\r
- 为每个维度打 1-5 分，并注明信息来源（官网、评测、论文、实测）\r
- 区分「已实现」「demo 级」「路线图」三种成熟度，避免被宣传误导\r
\r
## 今日推荐资料\r
\r
- [竞品差异化（本知识库 Module 1）](/doc/module-1/05-competitive)\r
- [Gartner Hype Cycle 方法论](https://www.gartner.com/en/research/methodologies/gartner-hype-cycle)\r
- [CB Insights 机器人行业报告入口](https://www.cbinsights.com/research/report/robotics-trends/)\r
\r
## 关联学习天数\r
\r
Day 18-20\r
`,"../../content/module-4/00-overview.md":`# 模块总览：专项突破\r
\r
## PM视角要点\r
\r
- 第4周是「深度专项 + 第一阶段收官」：深入 RL 工程实践、顶会论文、VLA 案例、世界模型与 Diffusion Policy，并完成 30 天学习复盘。\r
- 本周不要求成为论文作者，但应能读懂 abstract 和 figure，并提炼「对产品意味着什么」。\r
- Day 21-26 每天一个专项；Day 27-30 整合输出：知识图谱补全、作品集素材、下一阶段学习计划。\r
- 专项突破的目标：面试时能讲清一个完整 technical story（问题、方案、指标、局限）。\r
\r
## 核心概念\r
\r
### 本周学习地图\r
\r
| 天数 | 主题 | 深度目标 |\r
|------|------|----------|\r
| Day 21 | 宇树 RL 算法 | 理解 Train→Play→Sim2Real 工程链 |\r
| Day 22 | 顶会论文追踪 | CoRL、ICRA 选题方法 |\r
| Day 23 | VLA 深度案例 | 「把杯子拿来」全链路拆解 |\r
| Day 24 | 世界模型 | 预测式规划与 sim 加速 |\r
| Day 25 | Diffusion Policy | 扩散策略的产品适用性 |\r
| Day 26 | 论文阅读方法 | 结构化速读与笔记模板 |\r
| Day 27-30 | 第一阶段复盘 | 30 天成果整合与 gap 分析 |\r
\r
### 30 天阶段目标检验\r
\r
- 能画出具身智能产品技术栈分层图\r
- 能对比 VLA / RL / IL 的适用场景\r
- 能输出一份竞品分析报告\r
- 能讲解至少 1 个端到端 case（如 VLA 抓取）\r
\r
## 今日推荐资料\r
\r
- [Robotics Papers with Code](https://paperswithcode.com/area/robotics)\r
- [Semantic Scholar](https://www.semanticscholar.org/)\r
- [arXiv Robotics](https://arxiv.org/list/cs.RO/recent)\r
\r
## 关联学习天数\r
\r
Day 21-30\r
`,"../../content/module-4/01-rl-algorithm.md":`# 宇树 RL 算法\r
\r
## PM视角要点\r
\r
- 宇树开源了完整的 RL 训练到部署 toolchain，是理解「四足/人形 locomotion 如何产品化」的最佳实践样本。\r
- 标准工程路径：**Train → Play → Sim2Sim → Sim2Real**，每个阶段都有明确的 go/no-go 标准。\r
- PM 关注 sim2real 周期：从仿真能走到真机稳定走，通常需要数周到数月，影响上市 timeline。\r
- 不同仿真后端（Isaac Lab、Isaac Gym、MuJoCo）对应不同团队能力栈，选型影响招聘与外包策略。\r
\r
## 核心概念\r
\r
### 宇树 RL 开源生态\r
\r
| 仓库 | 仿真后端 | 支持机型 |\r
|------|----------|----------|\r
| unitree_rl_lab | Isaac Lab | Go2, H1, G1-29dof |\r
| unitree_rl_gym | Isaac Gym (legged_gym) | Go2, H1, H1_2, G1 |\r
| unitree_rl_mjlab | MuJoCo (mjlab) | Go2, G1, H1_2, H2 等 |\r
\r
### Train → Play → Sim2Sim → Sim2Real\r
\r
1. **Train**：仿真中采样数百万步，优化 PPO 等策略\r
2. **Play**：可视化验证策略是否满足步态、速度、抗扰动要求\r
3. **Sim2Sim**：迁移到 MuJoCo 等其他仿真器，检测过拟合\r
4. **Sim2Real**：通过 SDK 部署到真机，域随机化 + 实机微调\r
\r
### 奖励函数的产品含义\r
\r
- 「走得快」vs「走得稳」vs「省电」是不同 reward 权重\r
- PM 与算法对齐：用户可见的行为优先级（如上下楼梯稳定性 > 平地速度）\r
\r
### 部署依赖\r
\r
- **unitree_sdk2_python**：真机通信接口\r
- **rsl_rl**：PPO 等算法实现\r
- 算力：训练通常需 NVIDIA GPU 工作站或云端\r
\r
## 今日推荐资料\r
\r
- [Unitree RL Lab（GitHub）](https://github.com/unitreerobotics/unitree_rl_lab)\r
- [Unitree RL Gym（GitHub）](https://github.com/unitreerobotics/unitree_rl_gym)\r
- [Unitree RL Mjlab（GitHub）](https://github.com/unitreerobotics/unitree_rl_mjlab)\r
\r
## 关联学习天数\r
\r
Day 21\r
`,"../../content/module-4/02-conference.md":`# 顶会论文追踪\r
\r
## PM视角要点\r
\r
- 机器人领域顶会是技术风向标的「早刊」：CoRL 偏学习与控制，ICRA 覆盖更广的工程与系统。\r
- PM 读论文的目标：判断 6-18 个月内哪些能力可能进入产品，而非复现每一个公式。\r
- 建立个人论文 RSS：按关键词（VLA、manipulation、locomotion、sim2real）订阅 arXiv + 顶会 proceedings。\r
- 读论文要输出「So What」：对用户价值、竞品差距、roadmap 的影响各一句话。\r
\r
## 核心概念\r
\r
### CoRL（Conference on Robot Learning）\r
\r
- 专注机器人学习：RL、IL、VLA、世界模型等\r
- 论文质量高、与产业结合紧，适合 PM 跟踪 manipulation 与 foundation model 方向\r
- 每年 12 月左右，官网发布 accepted papers 与 videos\r
\r
### ICRA（IEEE International Conference on Robotics and Automation）\r
\r
- 机器人领域规模最大综合会议之一\r
- 覆盖感知、规划、控制、医疗机器人、自动驾驶等\r
- 适合了解系统工程、硬件创新与非学习类 baseline\r
\r
### PM 论文追踪工作流\r
\r
\`\`\`\r
1. 浏览 accepted list / arXiv daily\r
2. 筛 title + abstract（5 分钟/篇）\r
3. 深读 2-3 篇/周（figure + experiment）\r
4. 写卡片：问题、方法、指标、局限、产品 implication\r
5. 月度汇总分享给团队\r
\`\`\`\r
\r
### 高价值关键词\r
\r
- Vision-Language-Action, Diffusion Policy, World Model\r
- Sim-to-Real, Domain Randomization, Teleoperation\r
- Bimanual Manipulation, Mobile Manipulation\r
\r
## 今日推荐资料\r
\r
- [CoRL 官网](https://www.corl.org/)\r
- [ICRA 官网（IEEE RAS）](https://www.ieee-ras.org/conferences-workshops/fully-sponsored/icra)\r
- [arXiv cs.RO 最新论文](https://arxiv.org/list/cs.RO/recent)\r
\r
## 关联学习天数\r
\r
Day 22\r
`,"../../content/module-4/03-vla-case.md":`# VLA 深度案例：「把杯子拿来」\r
\r
## PM视角要点\r
\r
- 「Bring me the cup / 把杯子拿来」是家庭机器人最典型的 open-vocabulary manipulation 指令，适合作为 VLA 产品 case 拆解。\r
- 表面一句话，底层是感知、 grounding、规划、抓取、导航、对话澄清的完整链路。\r
- PM 应能向非技术方解释：哪些步骤今天能做、哪些会失败、失败时用户体验如何设计。\r
- 本 case 可直接用于面试：5 分钟讲清 pipeline + 3 个关键指标 + 2 个已知局限。\r
\r
## 核心概念\r
\r
### 端到端 Pipeline\r
\r
\`\`\`\r
用户：「把杯子拿来」\r
    ↓\r
[1] 语音识别 + NLU → 意图=fetch, 目标=杯子\r
    ↓\r
[2] 视觉 grounding → 在场景中定位「杯子」实例（可能多个）\r
    ↓\r
[3] 歧义处理 → 「厨房还是客厅的杯子？」（若置信度低）\r
    ↓\r
[4] 导航（若杯子不在臂展内）→ 路径规划 + 避障\r
    ↓\r
[5] VLA / 抓取策略 → 观测图像 + 指令 → 末端轨迹或关节动作\r
    ↓\r
[6] 力控闭合 + 抬起 → 确认抓取成功（滑移检测）\r
    ↓\r
[7] 导航回用户 + 递送 → 语音确认「这是您要的杯子吗？」\r
\`\`\`\r
\r
### 各阶段关键指标\r
\r
| 阶段 | 指标 | 典型挑战 |\r
|------|------|----------|\r
| Grounding | Referring 准确率 | 同类物体多个实例 |\r
| 抓取 | 单次成功率 | 透明杯、窄把手 |\r
| 导航 | 到达率、耗时 | 动态障碍、窄通道 |\r
| 端到端 | 任务完成率 | 误差逐级累积 |\r
\r
### VLA 在此 case 中的角色\r
\r
- **端到端 VLA**：图像 + 「bring me the cup」→ 直接输出动作 chunk\r
- **分层方案**：LLM 规划 + 专用 grasp model + 传统 motion planning\r
- 产品常选分层：可控性、可调试性、安全审核更容易\r
\r
### 失败态产品设计\r
\r
- 找不到杯子：主动询问或带用户到疑似位置\r
- 抓取失败：重试 2 次后请求人工辅助，不强行拖拽\r
- 递送途中碰撞：立即停止并语音告警\r
\r
## 今日推荐资料\r
\r
- [RTFlickr 引用表达数据集](https://github.com/mikrokosmos/referflickr)\r
- [RT-2 项目页](https://robotics-transformer2.github.io/)\r
- [OpenVLA 项目页](https://openvla.github.io/)\r
\r
## 关联学习天数\r
\r
Day 23\r
`,"../../content/module-4/04-world-model.md":`# 世界模型\r
\r
## PM视角要点\r
\r
- 世界模型（World Model）让 AI 在「脑海」中预测环境变化，用于规划、仿真加速、少样本决策。\r
- 对产品的意义：减少真机试错成本、支持「先想后做」的安全策略、可能缩短 sim2real 周期。\r
- 当前多数世界模型仍在 research 阶段，PM 应区分「论文 demo」与「可部署模块」。\r
- 关注与 VLA、RL 的结合：世界模型作 planner，VLA/RL 作 executor 的分层架构趋势。\r
\r
## 核心概念\r
\r
### 什么是世界模型\r
\r
学习环境的动态规律：给定当前状态 + 动作，预测下一状态（或观测）。\r
\r
\`\`\`\r
s_t, a_t → World Model → s_{t+1}（预测）\r
\`\`\`\r
\r
### 主要用途\r
\r
1. **Model-Based RL**：在模型内 rollout，减少真机/仿真采样\r
2. **Planning**：想象多条未来轨迹，选最优\r
3. **Data Augmentation**：生成合成训练数据\r
4. **Anomaly Detection**：预测与实际偏差大 → 触发安全停止\r
\r
### 代表方向\r
\r
- **RSSM / Dreamer 系列**： latent 动态模型 + RL\r
- **Video Prediction**：从像素预测未来帧，用于 manipulation 预判\r
- **LLM as World Model**：用语言描述状态转移（尚早期）\r
\r
### 产品化挑战\r
\r
- **预测误差累积**：长 horizon 预测漂移\r
- **Sim 与 real 的 gap**：模型在训练分布外失效\r
- **算力**：实时 planning 需要高效 latent model\r
- **评估**：缺乏统一 benchmark 对应真实产品场景\r
\r
### PM 决策点\r
\r
- 是否投资 world model 路线 vs 扩大示教数据规模\r
- 若采用，先锁定 1 个可验证子场景（如「推物体是否会倒」）\r
\r
## 今日推荐资料\r
\r
- [DreamerV3 论文（arXiv）](https://arxiv.org/abs/2301.04104)\r
- [World Models 经典博客（David Ha）](https://worldmodels.github.io/)\r
- [GAIA-1 自动驾驶世界模型（Wayve）](https://wayve.ai/thinking/gaia-1/)\r
\r
## 关联学习天数\r
\r
Day 24\r
`,"../../content/module-4/05-diffusion-policy.md":`# Diffusion Policy\r
\r
## PM视角要点\r
\r
- Diffusion Policy 用扩散模型生成机器人动作序列，是 2023 年以来 manipulation 领域的重要突破。\r
- 相比 BC，能更好处理「同一观测多种合理动作」的多模态问题，精细操作成功率高。\r
- 产品关注点：**推理延迟**（多步 denoising）、**算力**（GPU 需求）、与 **VLA/ACT** 的路线选择。\r
- 适合 PM 推动 POC 的场景：接触丰富任务（插拔、装配、开盖），传统 BC 成功率 plateau 时。\r
\r
## 核心概念\r
\r
### 核心思想\r
\r
将动作序列生成建模为 denoising diffusion process：从噪声逐步还原出平滑、可行的 action trajectory。\r
\r
\`\`\`\r
观测 o → Diffusion Policy → 动作序列 [a_t, a_{t+1}, ..., a_{t+H}]\r
\`\`\`\r
\r
### 与 BC / ACT 对比\r
\r
| 方法 | 多模态 | 样本效率 | 推理速度 | 典型成功率 |\r
|------|--------|----------|----------|------------|\r
| BC | 弱 | 中 | 快 | 较低 |\r
| ACT | 强（CVAE） | 高 | 快 | 高 |\r
| Diffusion Policy | 强 | 高 | 较慢 | 高（精细任务） |\r
\r
### 架构要点\r
\r
- **视觉编码**：ResNet / ViT 提取观测特征\r
- **条件扩散**：以观测为 condition 生成 action chunk\r
- **Horizon H**：预测未来 H 步，与 ACT 的 chunk 概念类似\r
\r
### 部署考量\r
\r
- 推理步数 vs 质量的 tradeoff，可用 DDIM 等加速采样\r
- 边缘端是否跑得动：Orin 级算力需实测 latency budget\r
- 与 whole-body control 的接口：输出末端 pose 还是 joint target\r
\r
### 何时选 Diffusion Policy\r
\r
- 任务接触 rich、需要平滑轨迹\r
- 有足够 GPU 做训练和在线推理\r
- 对 100ms 级延迟不敏感（或可做 action chunk 缓存）\r
\r
## 今日推荐资料\r
\r
- [Diffusion Policy 项目页](https://diffusion-policy.cs.columbia.edu/)\r
- [Diffusion Policy 论文（RSS 2023）](https://diffusion-policy.cs.columbia.edu/#paper)\r
- [LeRobot Diffusion Policy 实现](https://github.com/huggingface/lerobot)\r
\r
## 关联学习天数\r
\r
Day 25\r
`,"../../content/module-4/06-paper-reading.md":`# 论文阅读方法\r
\r
## PM视角要点\r
\r
- 具身智能 PM 不需要每篇论文精读，但需要高效筛选 + 结构化笔记，建立可检索的知识库。\r
- 目标：30 分钟内判断一篇论文「值不值得深读」，2 小时内输出一张产品导向 note card。\r
- 笔记应回答：解决什么问题、比 prior work 好在哪、实验是否可信、对产品 roadmap 的 implication。\r
- 将论文阅读纳入周 routine：周一扫 arXiv，周三深读 1 篇，周五团队分享 5 分钟。\r
\r
## 核心概念\r
\r
### 三遍阅读法\r
\r
**第一遍（5 分钟）**\r
\r
- Title, Abstract, Introduction 末段, Figure 1\r
- 判断：与我的场景相关吗？\r
\r
**第二遍（30 分钟）**\r
\r
- 所有 figure + table + method 小节标题\r
- 记录：输入输出、数据集、baseline、主指标\r
\r
**第三遍（1-2 小时，仅精选论文）**\r
\r
- Method 细节、ablation、limitation\r
- 写产品 note card\r
\r
### PM Note Card 模板\r
\r
\`\`\`markdown\r
## 论文：[标题]\r
- **一句话**：...\r
- **问题**：...\r
- **方法**：...\r
- **关键结果**：指标 @ 数据集\r
- **局限**：...\r
- **产品 So What**：...\r
- **跟进**：demo / 竞品 / 对话对象\r
\`\`\`\r
\r
### 可信度检查清单\r
\r
- [ ] 有 real robot 实验还是仅 simulation？\r
- [ ] baseline 是否公平、是否缺 industry SOTA？\r
- [ ] 开源代码/数据？\r
- [ ] 任务是否与目标产品场景同分布？\r
\r
### 推荐阅读顺序（入门）\r
\r
1. RT-2 / OpenVLA（VLA 产品化）\r
2. Diffusion Policy（manipulation）\r
3. ACT（低数据 imitation）\r
4. PPO（locomotion 基础）\r
\r
## 今日推荐资料\r
\r
- [How to Read a Paper（Keshav 经典指南）](https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf)\r
- [Semantic Scholar TL;DR 功能](https://www.semanticscholar.org/)\r
- [Papers With Code Robotics](https://paperswithcode.com/area/robotics)\r
\r
## 关联学习天数\r
\r
Day 26\r
`,"../../content/module-4/07-phase-review.md":`# 第一阶段复盘\r
\r
## PM视角要点\r
\r
- Day 27-30 是 30 天学习阶段的收官：整合 Module 1-4 认知，识别 gap，规划 Module 5 项目实战。\r
- 复盘不是「学了多少页」，而是「能否交付可展示的产物」：竞品报告、交互方案、技术 story、知识图谱。\r
- 建议用 2 天时间做自测答辩：模拟面试，讲 3 个话题各 10 分钟，录音复盘。\r
- 诚实标注 weak points，作为 Module 5-7 的输入，而非回避。\r
\r
## 核心概念\r
\r
### 30 天能力自检清单\r
\r
**行业与市场（Module 1）**\r
\r
- [ ] 能定义具身智能并区分与 AGI、自动化差异\r
- [ ] 能画出产业链上下游\r
- [ ] 能列举 3 家头部公司及其差异化\r
\r
**技术基础（Module 2-3）**\r
\r
- [ ] 能解释大脑/小脑分层\r
- [ ] 能对比 VLA / RL / IL 适用场景\r
- [ ] 能描述数据闭环六步\r
- [ ] 能输出成本/性能/可靠性取舍分析\r
\r
**专项深度（Module 4）**\r
\r
- [ ] 能讲解「把杯子拿来」VLA pipeline\r
- [ ] 能说明 Diffusion Policy vs ACT 选型\r
- [ ] 能介绍宇树 RL Train→Sim2Real 流程\r
- [ ] 能结构化速读 1 篇 robotics 论文\r
\r
### 复盘输出物\r
\r
1. **个人知识图谱更新**：补全 weak nodes\r
2. **作品集素材包**：竞品报告 + 交互 storyboard + 1 个 tech case 幻灯片\r
3. **Gap 清单**：按优先级排列下一阶段补强项\r
4. **Module 5 预习**：开发者生态项目用户画像草稿\r
\r
### 自测答辩三题\r
\r
1. 为什么选择 VLA 而不是传统 pipeline 做家庭抓取？\r
2. 你的目标产品数据飞轮如何冷启动？\r
3. 宇树 G1 与 Figure 02 的 product positioning 差异是什么？\r
\r
### 下一阶段预告\r
\r
Module 5 进入「项目一：开发者生态」，将综合运用用户调研、SDK 竞品、PRD 与商业模式设计。第一阶段的技术认知是 PRD 可信度的基础。\r
\r
## 今日推荐资料\r
\r
- [Feynman Technique 复习法](https://fs.blog/feynman-technique/)\r
- [Product Manager Portfolio 指南（Mind the Product）](https://www.mindtheproduct.com/)\r
- [本知识库首页](/)：回顾完整学习路径与知识图谱\r
\r
## 关联学习天数\r
\r
Day 27-30\r
`,"../../content/module-5/00-overview.md":`# 项目一总览：开发者生态产品设计\r
\r
本模块是 90 天冲刺的第二个实战项目。你将扮演机器人平台公司的产品经理，为四足/人形机器人设计一套面向开发者与高校实验室的 SDK 工具链与生态产品。目标不是写代码，而是完成从用户调研、竞品分析、PRD 撰写到商业模式与作品集包装的全流程交付。\r
\r
## PM视角要点\r
\r
- 开发者生态产品的核心用户是「写代码的人」，不是终端消费者。PM 要能说清：谁在用 SDK、在什么场景下用、接入链路里哪一步最痛。\r
- 平台型产品的成功指标往往是「首次运行时间」（Time to First Run）和「活跃开发者数」，而不只是功能数量。\r
- 本项目的作品集价值在于展示：B 端/平台型产品思维、技术理解深度、以及从 0 到 1 的完整产品文档能力。\r
- 第 31 至 45 天的功能定义、流程与原型工作，是 PRD 与商业模式的前置输入，不要跳过直接写文档。\r
- 面试讲述时，用「问题、方案、取舍、结果」四段式，把 25 天产出压缩成 10 分钟故事线。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 开发者生态 | 围绕硬件平台形成的 SDK、文档、示例、社区、应用商店等一整套使能体系 |\r
| SDK 产品化 | 将底层 API 包装为可发现、可学习、可调试、可发布的开发者产品 |\r
| Time to First Run | 开发者从注册/下载到让机器人完成第一个动作所花费的时间，是体验北极星指标之一 |\r
| 技能包商店 | 开发者上传/购买机器人行为模块（Skill/Behavior Pack）的分发与变现渠道 |\r
| 平台飞轮 | 更多开发者带来更多应用，更多应用吸引更多硬件采购与生态合作 |\r
\r
## 今日推荐资料\r
\r
- [Boston Dynamics Developer Portal](https://dev.bostondynamics.com/)：工业级机器人 SDK 与文档的标杆参考\r
- [ROS 2 Documentation](https://docs.ros.org/)：开源机器人中间件生态，理解开发者工具链的通用范式\r
- [Stripe API 设计指南](https://stripe.com/docs/api)：虽非机器人领域，但是开发者体验（DX）设计的经典范例\r
- [Developer Experience 入门](https://www.devex.com/)：DevEx 社区与最佳实践聚合\r
\r
## 关联学习天数\r
\r
第 31 至 55 天（第 5 至 6 周：项目一 · 开发者生态产品设计）\r
`,"../../content/module-5/01-user-research.md":`# 用户调研 Playbook：开发者与实验室用户画像\r
\r
在 SDK 产品立项前，必须先回答「为谁而建」。本章节聚焦两类核心用户：高校机器人实验室研究员，以及独立极客/初创团队开发者。调研目标不是收集愿望清单，而是验证假设、量化痛点优先级。\r
\r
## PM视角要点\r
\r
- 实验室用户关注「可复现的实验环境」和「论文/课题交付周期」；极客开发者关注「上手速度」和「社区案例」。同一 SDK，两类用户的成功标准不同。\r
- 访谈提纲应覆盖：当前技术栈（ROS 2 / 自研框架）、典型开发任务、最近一次接入失败的原因、愿意为哪些能力付费。\r
- 用户画像（Persona）不是虚构故事，而是访谈发现的聚类结果。每个画像需绑定 1 至 2 条可验证的核心痛点。\r
- PM 要区分「 stated need」（用户说的）和「observed behavior」（用户做的）。例如用户说想要完整文档，实际行为是只看 Quick Start 就跑示例。\r
- 输出物：2 份用户画像卡片 + 需求优先级列表（P0/P1/P2），为后续功能矩阵和 PRD 用户故事提供输入。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 高校实验室 Persona | 课题组负责人或研究生，需在学期内完成算法验证与论文实验，预算敏感、重视开源与可引用 |\r
| 极客开发者 Persona | 独立开发者或小团队工程师，追求快速 Demo、Hackathon 展示、二次创业可能性 |\r
| Jobs to be Done | 用户「雇佣」产品完成的任务，如「在一周内让机器狗完成避障巡线」 |\r
| 访谈假设 | 调研前写明的可证伪命题，例如「文档缺失是接入失败的首要原因」 |\r
| 痛点优先级矩阵 | 按频率 × 严重程度二维排序，避免被个别用户的强烈情绪带偏 |\r
\r
### 实验室用户典型特征\r
\r
- 使用 ROS 2、Gazebo/Isaac Sim 等仿真环境\r
- 需要多机协同、传感器数据录制与回放\r
- 采购决策受导师/设备处流程影响，周期长\r
\r
### 极客开发者典型特征\r
\r
- 偏好 Python SDK、Jupyter Notebook 示例\r
- 活跃在 GitHub、Discord、机器人社群\r
- 对价格敏感，但愿意为节省时间的工具付费\r
\r
## 今日推荐资料\r
\r
- [The Mom Test](https://www.momtestbook.com/)：用户访谈经典方法论，避免问出无效答案\r
- [Jobs to be Done 框架介绍](https://jtbd.info/)：从任务视角理解用户需求\r
- [ROS 2 社区与 Discourse](https://discourse.ros.org/)：观察真实开发者讨论与痛点\r
- [宇树开发者社区](https://www.unitree.com/)：国内四足机器人开发者生态参考\r
\r
## 关联学习天数\r
\r
第 31 至 33 天（用户调研：定义用户、访谈准备、整理输出）\r
`,"../../content/module-5/02-sdk-competitive.md":`# 机器人 SDK 竞品分析\r
\r
竞品调研帮助你在「开发者工具链」赛道上找到差异化切口。本章节以 Boston Dynamics Spot SDK 和 ROS 2 生态为对标，系统评估文档、API 设计、示例库、仿真支持与商业化模式。\r
\r
## PM视角要点\r
\r
- 竞品分析不是抄功能表，而是拆解「开发者旅程」：发现产品 → 注册/获取 SDK → 安装配置 → 跑通 Hello World → 调试部署 → 发布应用。\r
- Boston Dynamics 代表「闭源硬件 + 高质量商业 SDK」路线；ROS 2 代表「开源中间件 + 碎片化工具链」路线。你的产品可能介于两者之间。\r
- 记录每个竞品在 Time to First Run 上的实际耗时（建议亲自走一遍接入流程），这是最有说服力的体验数据。\r
- 差异化机会常出现在：中文文档、仿真一键环境、低代码行为编排、与国内硬件的深度绑定。\r
- 输出物：竞品对比表 + 体验痛点清单 + 「借鉴 / 避免 / 差异化」三栏决策备忘录。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| Spot SDK | Boston Dynamics 为 Spot 四足机器人提供的 Python/gRPC API 与 Web 控制台 |\r
| ROS 2 | Robot Operating System 第二代，提供节点、话题、服务、动作等分布式通信抽象 |\r
| Developer Journey | 开发者从认知到价值实现的完整路径，竞品分析的拆解单元 |\r
| API 一致性 | 命名、错误码、鉴权方式在模块间是否统一，直接影响学习成本 |\r
| 仿真优先（Sim-first） | 无真机条件下通过仿真完成开发与测试，降低准入门槛 |\r
\r
### 竞品对比维度建议\r
\r
1. **文档体系**：Quick Start、API Reference、Tutorial、FAQ、版本迁移指南\r
2. **示例与模板**：官方 Repo 数量、语言覆盖、是否一键运行\r
3. **调试工具**：日志、远程桌面、轨迹可视化、性能分析\r
4. **生态扩展**：第三方包、应用商店、认证合作伙伴\r
5. **许可与定价**：免费层、按 seat/按调用/按设备授权\r
\r
## 今日推荐资料\r
\r
- [Boston Dynamics Developer Portal](https://dev.bostondynamics.com/)：Spot SDK 官方入口，重点阅读 Quick Start 与 API 文档结构\r
- [Spot SDK Python 示例仓库](https://github.com/boston-dynamics/spot-sdk)：官方示例代码与最佳实践\r
- [ROS 2 Documentation](https://docs.ros.org/)：Humble/Jazzy 等发行版文档，理解开源生态工具链\r
- [ROS 2 Design](https://design.ros2.org/)：ROS 2 架构设计文档，帮助理解中间件产品哲学\r
- [NVIDIA Isaac ROS](https://developer.nvidia.com/isaac/ros)：仿真与感知工具链的另一种生态形态\r
\r
## 关联学习天数\r
\r
第 34 至 36 天（竞品分析：SDK 调研、体验评估、结论输出）\r
`,"../../content/module-5/03-prd-writing.md":`# PRD 撰写要点：SDK 平台产品\r
\r
当用户调研、功能定义与原型就绪后，PRD 是把 scattered 决策固化为可评审、可开发、可验收的单一真相来源。SDK 类 PRD 与普通 App PRD 的差异在于：必须写清 API 契约、版本策略、兼容性与开发者迁移成本。\r
\r
## PM视角要点\r
\r
- SDK PRD 的读者包括：后端/嵌入式工程师、技术文档工程师、开发者关系（DevRel）、以及未来的你自己（面试讲述素材）。\r
- 每个 P0 功能需包含：用户故事、前置条件、主流程、异常流程、验收标准（含可量化指标，如「10 分钟内完成首次连接」）。\r
- 明确「不在范围内」（Out of Scope），防止范围蔓延。例如 v1 不做可视化行为编辑器，只做 CLI + Python API。\r
- 版本与兼容性章节不可省略：semver 规则、废弃（deprecation）周期、Breaking Change 公告渠道。\r
- PRD 不是写完就锁死。标注假设与待验证项（Open Questions），方便评审时聚焦风险。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| SDK PRD 结构 | 背景、目标用户、问题陈述、方案概述、功能需求、非功能需求、里程碑、风险与依赖 |\r
| 用户故事（User Story） | As a [角色], I want [能力], so that [价值] |\r
| 验收标准（AC） | 可测试的完成定义，如「给定有效 API Key，开发者可在 3 步内启动仿真示例」 |\r
| 非功能需求（NFR） | 性能、安全、可用性、国际化、可观测性等对 SDK 同样关键 |\r
| API 契约 | 端点、参数、错误码、限流策略的正式约定，通常与 OpenAPI/gRPC proto 对齐 |\r
\r
### 推荐 PRD 章节大纲（SDK 产品）\r
\r
1. **项目背景与市场机会**：为何现在做、竞品缺口\r
2. **目标与成功指标**：North Star、OKR、首期 MVP 边界\r
3. **用户与场景**：引用用户画像与核心 Use Case\r
4. **功能需求详述**：按模块拆分（鉴权、设备管理、运动控制、感知数据流等）\r
5. **开发者体验需求**：文档、CLI、示例、错误信息友好度\r
6. **技术约束与依赖**：硬件型号、OS、ROS 2 版本、网络要求\r
7. **发布计划与里程碑**：Alpha / Beta / GA 标准\r
8. **风险登记册**：技术债、合规、第三方依赖\r
\r
## 今日推荐资料\r
\r
- [Google PRD 模板与指南](https://www.atlassian.com/agile/product-management/requirements)：敏捷需求文档通用结构参考\r
- [OpenAPI Specification](https://swagger.io/specification/)：REST API 契约的标准描述格式\r
- [Semantic Versioning](https://semver.org/)：SDK 版本号规范\r
- [Write the Docs](https://www.writethedocs.org/)：技术文档写作社区，与 SDK PRD 中的文档需求强相关\r
- [Amazon API Gateway 开发者体验实践](https://docs.aws.amazon.com/apigateway/)：大型平台 API 产品化案例\r
\r
## 关联学习天数\r
\r
第 46 至 48 天（PRD 撰写：项目背景、用户需求、功能需求）\r
`,"../../content/module-5/04-business-model.md":`# 商业模式设计：技能商店与开发者社区变现\r
\r
硬件卖得出去只是起点，可持续收入往往来自生态：开发者上传技能包、企业购买行业解决方案、云仿真按量计费。本章节帮你把「好产品」翻译成「好生意」，并准备面试中的商业逻辑讲述。\r
\r
## PM视角要点\r
\r
- 平台商业模式的核心是双边或多边市场：一边吸引开发者供给应用/技能，一边吸引终端用户或企业客户消费价值。\r
- 技能包商店（Skill Store）的变现逻辑需回答：谁创作、谁审核、如何分润、如何防止劣质/恶意技能上架。\r
- 开发者社区不是成本中心。活跃的论坛、黑客松、认证体系能直接降低支持工单量并提高留存。\r
- 订阅制 vs 按量付费 vs 一次性授权，对应不同的现金流与客户类型。高校实验室偏好一次性或教育折扣；企业客户接受年费。\r
- 用商业模式画布（BMC）把 9 个模块填完整，再逐项做「最悲观假设」压力测试。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 技能包商店 | 开发者发布机器人行为模块（导航、巡检、抓取等）的分发与交易平台 |\r
| 平台抽成 | 商店交易额中平台保留的比例，常见 15% 至 30%，需平衡激励与收入 |\r
| 开发者分层运营 | 按贡献度将开发者分为 Explorer / Builder / Partner，匹配不同权益与支持 |\r
| 网络效应 | 更多开发者带来更多技能，更多技能吸引更多硬件买家与开发者 |\r
| 商业模式画布（BMC） | 客户细分、价值主张、渠道、客户关系、收入流、关键资源、关键活动、关键伙伴、成本结构 |\r
\r
### 收入模式选项\r
\r
| 模式 | 适用场景 | 优点 | 风险 |\r
|------|----------|------|------|\r
| 硬件 + 免费 SDK | 早期获客、生态冷启动 | 降低门槛、快速积累开发者 | 硬件毛利被摊薄 |\r
| SDK 企业授权 | 中大型企业、多机部署 | 可预测年费收入 | 销售周期长 |\r
| 技能包分成 | 生态成熟后 | 边际成本低、激励创作者 | 需治理与质检体系 |\r
| 云仿真按量计费 | 无真机开发场景 | 与使用深度挂钩 | 需稳定云服务与定价透明 |\r
| 认证与培训 | 生态成熟期 | 品牌溢价、人才输送 | 需课程内容与考试体系 |\r
\r
### 社区变现与激励\r
\r
- **积分与徽章**：贡献文档、回答问题、发布技能获得等级\r
- **黑客松奖金**：短期拉新，筛选高潜开发者\r
- **官方认证**：「认证集成商」可承接行业项目，平台抽佣或授权费\r
- **早期创作者计划**：前 100 个上架技能享受 0 抽成或流量扶持\r
\r
## 今日推荐资料\r
\r
- [Business Model Canvas 官方说明](https://www.strategyzer.com/canvas/business-model-canvas)：商业模式画布方法论\r
- [Apple App Store 审核指南](https://developer.apple.com/app-store/review/guidelines/)：应用商店治理与分成的成熟参考\r
- [Unity Asset Store](https://assetstore.unity.com/)：开发者内容商店的产品形态参考\r
- [Stripe Connect 分账文档](https://stripe.com/docs/connect)：平台分润与多方结算的技术实现思路\r
- [ROS Industrial 生态](https://rosindustrial.org/)：开源机器人行业的联盟与商业化案例\r
\r
## 关联学习天数\r
\r
第 49 至 51 天（商业模式设计：收入模式、生态战略、评审定稿）\r
`,"../../content/module-5/05-portfolio-pack.md":`# 方案包装与模拟评审\r
\r
项目一的收官阶段是把 PRD、竞品分析、商业模式压缩成可路演、可投递的作品集。面试官通常只有 10 至 15 分钟，你的 PPT 必须讲清「为什么做、做了什么、为什么这样取舍、下一步怎么验证」。\r
\r
## PM视角要点\r
\r
- PPT 页数建议控制在 10 至 12 页：封面、问题、用户、方案、功能亮点、开发者旅程、商业模式、里程碑、风险、总结。附录放详细表格。\r
- 每一页只传达一个核心信息。避免把 PRD 全文贴进幻灯片。\r
- 模拟评审时邀请朋友扮演「挑剔的技术 VP」：追问指标依据、竞品差异是否经得起验证、MVP 范围是否过大。\r
- 准备 3 个高频追问的标准答案：为什么不做 X？如何衡量成功？如果只有 3 个月你会砍什么？\r
- 视觉统一：配色、字体、图表风格与项目二保持一致，方便最终作品集整合。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 路演故事线 | Problem → Insight → Solution → Demo/原型 → Business → Ask/Roadmap |\r
| 电梯演讲（Elevator Pitch） | 60 秒内说清产品价值，用于封面页或开场 |\r
| 模拟评审（Mock Review） | 限时演示 + Q&A，提前暴露逻辑漏洞与表达短板 |\r
| 作品集（Portfolio） | 可独立阅读的 PDF/PPT，包含足够上下文让陌生人理解项目 |\r
| 决策追溯 | 在幻灯片中标注关键 trade-off 及理由，展示 PM 判断力 |\r
\r
### 推荐 PPT 结构（项目一）\r
\r
1. **封面**：项目名称、角色、日期\r
2. **背景与机会**：市场趋势、生态缺口（1 张图）\r
3. **目标用户**：2 个 Persona 卡片\r
4. **核心痛点**：Top 3，附调研来源\r
5. **解决方案概览**：SDK 工具链架构图\r
6. **开发者旅程优化**：Before / After 对比\r
7. **功能 MVP**：P0 功能与验收标准\r
8. **竞品差异化**：对比表精简版\r
9. **商业模式**：收入流 + 飞轮示意图\r
10. **路线图**：3 个阶段里程碑\r
11. **风险与下一步**：假设、待验证实验\r
12. **总结**：一句话价值主张\r
\r
### 模拟评审检查清单\r
\r
- [ ] 10 分钟内能讲完，不超时\r
- [ ] 每个数据点能说出来源（访谈、实测、公开报告）\r
- [ ] 技术术语能向非技术听众解释清楚\r
- [ ] 主动交代 1 至 2 个「没做」的功能及原因\r
- [ ] 结尾有明确的「若上线后第一周会看什么指标」\r
\r
## 今日推荐资料\r
\r
- [Slidebean 路演 Deck 范例](https://slidebean.com/templates)：科技产品路演 PPT 结构参考\r
- [Sequoia Pitch Deck Template](https://www.sequoiacap.com/article/pitch-deck-template/)：经典融资路演框架，可改编为产品评审\r
- [NN/g 演示可用性原则](https://www.nngroup.com/articles/presenting-ux-work/)：如何向利益相关方呈现产品工作\r
- [Toastmasters 演讲技巧](https://www.toastmasters.org/)：限时表达与 Q&A 训练资源\r
\r
## 关联学习天数\r
\r
第 52 至 55 天（方案包装：PPT 制作、视觉优化、模拟评审、修改定稿）\r
`,"../../content/module-6/00-overview.md":`# 项目二总览：家庭场景功能优化\r
\r
本模块聚焦消费级家庭机器人场景，在「地面清洁 + 物品整理」与「厨房辅助」等方向中做场景取舍，并围绕用户痛点设计 VLA 抓取、语音交互与体验指标方案。目标是产出第二份完整作品集，展示 C 端产品思维与技术方案判断力。\r
\r
## PM视角要点\r
\r
- 家庭场景产品的决策链更长：使用者、付费者、同住者（老人/孩子/宠物）可能不是同一人，PM 需识别多方利益冲突。\r
- 技术成熟度与市场需求的交集决定 MVP。扫地机器人市场成熟但痛点明确；厨房场景想象空间大但安全与成本约束更严。\r
- 本项目的差异化叙事通常在于：从「能扫」到「能整理」，从「单机功能」到「理解家庭语义的任务执行」。\r
- 第 65 至 77 天的功能定义、PRD 与数据方案是章节文档未单独列出但学习日历中的关键工作，需与场景、痛点、VLA、交互、指标章节联动。\r
- 与项目一形成互补：项目一展示平台/B 端能力，项目二展示用户洞察/C 端体验与 AI 能力产品化。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 家庭服务机器人 | 在住宅环境中执行清洁、整理、陪伴、安防等任务的自主或半自主系统 |\r
| 场景聚焦 | 从多个候选场景中选定一个核心战场，集中资源打透用户价值 |\r
| VLA（Vision-Language-Action） | 视觉-语言-动作统一模型，支持「看到、听懂、做到」的端到端家庭操作 |\r
| 人机共生 | 家庭环境中机器人需与人类、宠物、家具动态共存，安全与可预测性优先 |\r
| 体验指标体系 | 任务成功率、延迟、满意度等可量化指标，连接产品目标与研发验收 |\r
\r
## 今日推荐资料\r
\r
- [iRobot 产品与教育中心](https://www.irobot.com/)：扫地机器人品类领导者，理解成熟 C 端产品形态\r
- [Figure 家庭场景演示](https://www.figure.ai/)：通用人形机器人家庭应用的前沿参考\r
- [Google RT 系列研究](https://robotics-transformer.github.io/)：VLA 家庭操作的代表性学术工作\r
- [Matter 智能家居标准](https://csa-iot.org/all-solutions/matter/)：家庭 IoT 互联标准，影响机器人与其他设备协同\r
\r
## 关联学习天数\r
\r
第 56 至 82 天（第 7 至 9 周：项目二 · 家庭场景功能优化）\r
`,"../../content/module-6/01-scenario.md":`# 家庭场景聚焦：清洁 vs 厨房\r
\r
场景选择是家庭机器人产品成败的第一步。本章节对比「地面清洁 + 物品整理」与「厨房辅助」两大方向，从用户需求、技术成熟度、安全合规与商业空间四个维度做结构化取舍。\r
\r
## PM视角要点\r
\r
- **清洁整理场景**：市场教育已完成，用户知道扫地机是什么；痛点集中在漏扫、缠绕、无法处理散落物品、多楼层/多房间协同。升级方向是「扫 + 整」一体化。\r
- **厨房场景**：频次高、痛点强（备餐、洗碗、收纳），但涉及刀具、明火、液体、食物安全，监管与责任边界复杂，适合作为 2.0 愿景而非首期 MVP。\r
- 用用户旅程地图标注情绪曲线：扫地机在「被困」「漏扫」「找不到基站」等节点的挫败感是产品机会窗口。\r
- 问题陈述（Problem Statement）模板：「[用户] 在 [场景] 下需要 [任务]，但现有方案因为 [根因] 导致 [不良后果]。」\r
- 输出物：场景决策备忘录 + 一句话问题定义 + 约束条件清单（成本上限、安全等级、隐私要求）。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 地面清洁 + 物品整理 | 在扫地/拖地基础上增加识别、抓取、归位等操作能力，覆盖客厅、卧室等开阔区域 |\r
| 厨房辅助 | 台面整理、简易备餐协助、餐具收纳等，对精细操作与安全要求更高 |\r
| 用户旅程地图 | 从触发需求到任务完成的全触点可视化，含情绪与机会点 |\r
| 技术成熟度曲线 | 评估感知、规划、操作各模块在目标场景下的商用就绪程度 |\r
| 约束三角 | 成本、安全、性能三者不可同时极致，PM 负责划定可行域 |\r
\r
### 场景对比简表\r
\r
| 维度 | 清洁 + 整理 | 厨房辅助 |\r
|------|-------------|----------|\r
| 市场规模 | 大，品类成熟 | 中，尚早 |\r
| 技术难度 | 中（导航成熟，抓取在进步） | 高（精细操作 + 安全） |\r
| 用户付费意愿 | 已验证，愿为省心付费 | 高潜力，但需强信任 |\r
| 监管风险 | 低 | 中高（食品安全、人身伤害） |\r
| 适合 MVP | 是 | 更适合长期路线图 |\r
\r
### 推荐聚焦路径（学习项目）\r
\r
优先选择 **「客厅/卧室地面清洁 + 轻量物品归位」** 作为 MVP：复用成熟导航栈，用 VLA 解决「散落袜子、玩具、拖鞋」等高频小物件整理，故事完整且风险可控。\r
\r
## 今日推荐资料\r
\r
- [Statista 扫地机器人市场数据](https://www.statista.com/topics/4007-robot-vacuums/)：全球市场规模与趋势\r
- [Roborock 产品页](https://www.roborock.com/)：国内头部品牌功能演进参考\r
- [Samsung Bot Handy 概念](https://news.samsung.com/)：三星曾展示的家庭整理机器人方向\r
- [ISO 13482 个人护理机器人安全标准](https://www.iso.org/standard/53820.html)：服务机器人安全标准入门\r
\r
## 关联学习天数\r
\r
第 56 至 58 天（场景聚焦：选题、用户旅程、问题定义）\r
`,"../../content/module-6/02-user-pain.md":`# 用户痛点分析：扫地机器人品类\r
\r
即便在成熟的扫地机器人市场，用户不满依然普遍。本章节系统梳理真实用户反馈，将痛点归类、排序，并映射到产品功能机会，为后续 VLA 与交互设计提供依据。\r
\r
## PM视角要点\r
\r
- 痛点调研渠道：电商差评（京东/天猫）、小红书/知乎吐槽帖、Reddit r/RobotVacuums、朋友访谈。至少收集 10 条可溯源的真实反馈。\r
- 区分「硬件痛点」（吸力、续航、噪音）与「智能痛点」（漏扫、误识别、无法处理复杂物品）。具身智能 PM 应聚焦后者。\r
- 用户对「人形机器人进家」的期望与顾虑并存：期望它能「像人一样整理」，顾虑隐私、安全、价格与可靠性。\r
- 痛点归类后用 **频率 × 严重程度** 矩阵找 TOP 3，避免被小众但激烈的抱怨带偏。\r
- 输出物：痛点清单 + TOP 3 根因分析 + 痛点-机会映射矩阵。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 漏扫与重复扫 | 路径规划或地图构建缺陷导致覆盖不全或效率低下 |\r
| 缠绕与卡住 | 线缆、地毯流苏、椅腿等导致停机，需人工解救 |\r
| 无法处理散落物 | 扫地机只能绕开袜子/玩具，无法捡起归位，是「扫而不整」的核心缺口 |\r
| 多楼层/多房间协同 | 换楼层需搬运基站、多地图切换体验差 |\r
| 隐私顾虑 | 带摄像头的移动设备引发「是否在监控」的信任问题 |\r
\r
### 典型用户吐槽（调研方向）\r
\r
1. 「每次扫完客厅，孩子的乐高还是满地都是，还得我亲手捡。」\r
2. 「经常卡在餐椅腿中间，APP 报警了我人不在家。」\r
3. 「说是智能避障，拖鞋和电线还是会被卷进去。」\r
4. 「人形机器人要是能帮我收拾茶几就好了，但怕它摔坏东西。」\r
5. 「摄像头扫地机我都不敢开，怕数据上传。」\r
\r
### 痛点根因与机会映射\r
\r
| 痛点 | 可能根因 | 产品机会 |\r
|------|----------|----------|\r
| 散落物无法处理 | 无操作臂/抓取能力，仅 2D 避障 | VLA 轻量抓取 + 归位 |\r
| 频繁卡住 | 3D 感知不足，椅腿等细障碍物建模差 | 智能避障升级 + 脱困策略 |\r
| 漏扫 | 地图更新慢，动态障碍物处理差 | 实时语义地图 + 补扫逻辑 |\r
| 隐私担忧 | 视频上云默认开启 | 本地处理 + 明确指示灯与权限 |\r
\r
## 今日推荐资料\r
\r
- [Reddit r/RobotVacuums](https://www.reddit.com/r/RobotVacuums/)：英文用户真实使用讨论与吐槽\r
- [什么值得买 扫地机器人评测](https://www.smzdm.com/)：中文用户口碑与对比\r
- [iRobot Roomba 支持社区](https://homesupport.irobot.com/)：官方 FAQ 中高频问题即痛点来源\r
- [Consumer Reports 扫地机测评](https://www.consumerreports.org/appliances/vacuum-cleaners/robotic-vacuums/)：第三方客观评测维度参考\r
\r
## 关联学习天数\r
\r
第 59 至 61 天（用户痛点分析：调研、归类、机会映射）\r
`,"../../content/module-6/03-vla-home.md":`# VLA 家庭抓取方案\r
\r
当痛点指向「扫而不整」时，VLA（Vision-Language-Action）模型提供了从视觉理解到动作执行的统一路径。本章节帮助 PM 理解 VLA 在家庭抓取场景的能力边界、选型考量与产品化要点，无需推导公式，但要能讲清 trade-off。\r
\r
## PM视角要点\r
\r
- VLA 的核心价值是 **语义级操作**：用户说「把沙发上的抱枕放到收纳篮」，系统需理解物体、空间关系并生成动作序列，而非预编程固定轨迹。\r
- 家庭场景难点：光照变化、透明/反光物体、杂乱堆叠、软体物品形变、人机混处安全距离。\r
- PM 应关注 **成功率、泛化性、延迟、算力成本** 四元组，而非仅看论文 SOTA 数字（实验室环境与真实家庭差距大）。\r
- 机械臂方案需权衡：固定臂（桌面/柜面）vs 移动底盘 + 臂（整机协调难）vs 纯夹爪升降（成本低但能力有限）。\r
- 输出物：技术可行性评估报告 + 推荐方案 + 对产品功能定义的影响说明。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| VLA 模型 | 将视觉输入与自然语言指令联合编码，直接输出机器人动作 token 或轨迹的统一架构 |\r
| RT-1 / RT-2 | Google Robotics Transformer 系列，大规模机器人数据预训练的代表工作 |\r
| OpenVLA | 开源 VLA 实现，便于评估部署成本与社区生态 |\r
| 泛化（Generalization） | 模型在训练分布外的新物体、新布局、新指令上的表现 |\r
| Sim-to-Real | 仿真环境训练迁移到真实机器人，可降低数据采集成本但存在域差距 |\r
\r
### 家庭抓取产品化关键指标\r
\r
| 指标 | 说明 | MVP 参考目标（示例） |\r
|------|------|----------------------|\r
| 抓取成功率 | 单次 pick 成功完成的比例 | ≥ 85%（限定物体集） |\r
| 指令理解准确率 | 语言指令与意图匹配正确率 | ≥ 90%（核心指令集） |\r
| 端到端延迟 | 从指令下达到动作开始 | ≤ 3 秒 |\r
| 支持物体类别 | 可可靠抓取的物体类型数 | 首期 10 至 15 类常见家居小物 |\r
| 安全停距 | 与人/宠物最小安全距离 | 符合 ISO 13482 相关条款 |\r
\r
### 技术路线对比\r
\r
| 路线 | 优点 | 缺点 | 产品阶段 |\r
|------|------|------|----------|\r
| 端到端 VLA | 语义理解强，少手工规则 | 数据需求大，可解释性弱 | 中长期主力 |\r
| 感知 + 传统规划 | 可控、可调试 | 泛化差，规则维护成本高 | 短期 MVP 可混合 |\r
| 遥操作数据采集 + 模仿学习 | 快速积累家庭数据 | 隐私与规模受限 | 冷启动补充 |\r
\r
## 今日推荐资料\r
\r
- [RT-1: Robotics Transformer](https://robotics-transformer1.github.io/)：大规模真实机器人数据训练的 VLA 奠基工作\r
- [RT-2: Vision-Language-Action Models](https://robotics-transformer2.github.io/)：融合互联网规模视觉-语言预训练\r
- [OpenVLA 项目](https://openvla.github.io/)：开源 VLA 模型与部署资源\r
- [Octo 通用机器人策略](https://octo-models.github.io/)：多机器人数据集上的通用策略模型\r
- [ALOHA 低成本双臂平台](https://tonyzhaozh.github.io/aloha/)：家庭级数据采集硬件参考\r
\r
## 关联学习天数\r
\r
第 62 至 64 天（技术方案调研：VLA 方案、机械臂方案、结论输出）\r
`,"../../content/module-6/04-interaction.md":`# 语音指令与行为反馈设计\r
\r
家庭场景中，语音是自然的主交互通道，而灯光、声音、屏幕与机身动作则是建立信任的关键反馈。本章节设计核心指令集、模糊匹配策略，以及任务全生命周期的状态可感知性。\r
\r
## PM视角要点\r
\r
- 语音交互不是「接入智能音箱 API」这么简单。需定义 **领域指令集**（Domain-specific Commands）、槽位（Slots）、确认策略与纠错流程。\r
- 家庭环境嘈杂、多人说话、口音差异大。PM 要设计 **降级路径**：语音失败 → 触屏/APP → 物理按键。\r
- 行为反馈遵循 **可预测性原则**：用户应随时知道机器人在做什么、还要多久、为何暂停、如何介入。\r
- 异常场景体验决定口碑：抓取失败时不应沉默，应说明原因并给出下一步选项（重试/跳过/手动标记）。\r
- 输出物：指令-响应对照表 + 交互状态流转图 + 异常场景 UX 说明。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 意图（Intent） | 用户语音背后的任务类型，如「开始清扫」「捡起物品」「回充」 |\r
| 槽位填充（Slot Filling） | 从语句中提取参数，如位置「客厅」、物体「袜子」 |\r
| 确认机制 | 对歧义或高风险指令要求用户二次确认，如「要把这个杯子放到哪里？」 |\r
| 多模态反馈 | 语音播报 + LED 灯效 + APP 推送 + 机身动作的协同 |\r
| 可中断性 | 用户随时可说「停下」「取消」，机器人须在安全窗口内响应 |\r
\r
### 核心语音指令集（示例）\r
\r
| 意图 | 用户说法示例 | 系统响应 |\r
|------|--------------|----------|\r
| 开始清扫 | 「打扫一下客厅」 | 语音确认区域，灯效切换为清扫模式，APP 显示进度 |\r
| 物品归位 | 「把地上的玩具放进收纳箱」 | 若物体歧义则追问，执行中播报「正在捡起积木」 |\r
| 暂停/继续 | 「先停一下」「继续」 | 立即减速停止，灯效变黄；继续时恢复 |\r
| 回充 | 「回去充电」 | 播报预计路径，低电量时主动建议 |\r
| 状态查询 | 「扫完了吗」 | 播报完成度百分比与预计剩余时间 |\r
\r
### 行为反馈状态设计\r
\r
| 状态 | 灯效 | 语音 | 屏幕/APP |\r
|------|------|------|----------|\r
| 待机 | 常亮柔光 | 可选欢迎语 | 显示电量与上次任务 |\r
| 执行中 | 呼吸闪烁 | 关键节点播报 | 实时地图与进度 |\r
| 需要确认 | 黄色慢闪 | 追问语句 | 弹出选项按钮 |\r
| 失败 | 红色短闪 + 提示音 | 说明原因与建议 | 一键重试/反馈 |\r
| 充电中 | 绿色脉冲 | 低打扰 | 预计充满时间 |\r
\r
## 今日推荐资料\r
\r
- [Google Conversation Design 指南](https://developers.google.com/assistant/conversation-design)：语音对话设计系统方法论\r
- [Amazon Alexa Voice Interaction Model](https://developer.amazon.com/en-US/docs/alexa/custom-skills/interaction-model.html)：意图与槽位定义参考\r
- [Apple Human Interface Guidelines - Siri](https://developer.apple.com/design/human-interface-guidelines/siri)：语音交互 UX 原则\r
- [Nielsen Norman Group 语音 UI 可用性](https://www.nngroup.com/articles/voice-interfaces/)：语音界面常见陷阱\r
- [Material Design 声音与运动](https://m3.material.io/styles/motion/overview)：反馈动效设计参考\r
\r
## 关联学习天数\r
\r
第 68 至 70 天（交互设计：语音指令、行为反馈、评审优化）\r
`,"../../content/module-6/05-metrics.md":`# 体验评估指标：成功率、延迟与满意度\r
\r
产品方案是否「更好」，必须用可量化、可追踪的指标说话。本章节为家庭场景机器人定义核心体验指标、测试方案与基准/目标值，连接 PRD 验收标准与面试中的数据叙事。\r
\r
## PM视角要点\r
\r
- **任务成功率**是家庭操作类产品的北极星之一，但必须定义清楚任务边界（哪些物体、哪些房间、什么光照条件）。\r
- **延迟**影响主观体验：超过 3 秒无反馈，用户会以为设备死机；端到端延迟需拆分感知、推理、规划、执行各段定位瓶颈。\r
- **满意度**不能只看 NPS。建议组合 CSAT（单次任务）、SEQ（单题易用性）、重试率、人工介入率等行为指标。\r
- A/B 测试在家庭机器人场景难做大规模，可用 **对照实验**（旧版 vs 新版）、**日记研究**、**实验室可用性测试** 替代。\r
- 输出物：评估指标体系文档 + 测试方案 + 基准值与目标值表。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 任务成功率（Task Success Rate） | 在定义条件下，任务无需人工介入完成的比例 |\r
| 端到端延迟（E2E Latency） | 从用户触发到机器人开始有效动作的时间 |\r
| 人工介入率 | 任务过程中用户不得不手动帮助（解救、重新摆放）的比例 |\r
| CSAT | Customer Satisfaction，通常 1 至 5 分，针对单次交互 |\r
| 统计显著性 | A/B 测试中判断差异是否由随机波动导致，常用 p < 0.05 |\r
\r
### 核心指标定义表\r
\r
| 指标 | 定义 | 采集方式 | MVP 目标（示例） |\r
|------|------|----------|------------------|\r
| 清扫覆盖率 | 实际清扫面积 / 应扫面积 | 地图日志 | ≥ 95% |\r
| 物品归位成功率 | 成功归位次数 / 尝试次数 | 视觉确认 + 用户确认 | ≥ 80% |\r
| 语音指令识别率 | 正确理解意图 / 总指令数 | 日志 + 抽样人工标注 | ≥ 92% |\r
| 指令响应延迟 P95 | 95% 指令的响应时间 | 端侧埋点 | ≤ 2.5 秒 |\r
| 卡住率 | 需人工解救次数 / 任务数 | 故障日志 | ≤ 5% |\r
| 任务满意度 CSAT | 任务后 1 至 5 分评价 | APP 弹窗 | 均值 ≥ 4.0 |\r
\r
### 测试方案要点\r
\r
1. **样本设计**：至少 15 至 20 户家庭，覆盖不同户型、地面材质、是否有宠物/儿童\r
2. **任务脚本**：标准化任务清单（如「清理客厅散落 5 件物品」），减少操作差异\r
3. **对照组**：当前市售扫地机 vs 你的方案原型/概念验证\r
4. **观察记录**：视频 + 问卷 + 访谈三板斧，捕捉量化指标解释不了的细节\r
5. **时间节点**：开发中期可用性测试（找大问题）、发布前验收测试（对目标值）\r
\r
### 指标与产品决策联动\r
\r
- 成功率低 + 延迟高 → 优先优化模型推理或缩小物体支持范围\r
- 满意度低但成功率高 → 交互反馈或噪音/外观等体验问题\r
- 卡住率高 → 导航/避障模块优先于抓取能力扩展\r
\r
## 今日推荐资料\r
\r
- [Google HEART 框架](https://www.interaction-design.org/literature/article/google-s-heart-framework-for-measuring-ux)：Google 用户体验度量框架（Happiness, Engagement, Adoption, Retention, Task success）\r
- [MeasuringU 可用性指标](https://measuringu.com/)：样本量计算与问卷设计资源\r
- [Nielsen 可用性测试入门](https://www.nngroup.com/articles/usability-testing-101/)：小样本可用性测试方法\r
- [ISO 9241-11 可用性定义](https://www.iso.org/standard/63500.html)：有效性、效率、满意度国际标准定义\r
- [Amplitude 产品分析手册](https://amplitude.com/product-analytics)：行为数据埋点与分析实践\r
\r
## 关联学习天数\r
\r
第 78 至 80 天（体验评估指标：核心指标、测试方案、输出定稿）\r
`,"../../content/module-7/00-overview.md":`# 冲刺总览：作品集整合与面试准备\r
\r
90 天学习的最后 8 天（第 83 至 90 天）是收官冲刺：将两个实战项目整合为统一作品集，打磨面试问答，更新简历并开始投递。本阶段不再追求新知识输入，而是把已有产出转化为 **可讲述、可展示、可拿到 offer** 的求职资产。\r
\r
## PM视角要点\r
\r
- 作品集不是文档堆砌，而是 **能力证明**：用户洞察、方案设计、技术理解、商业思维、表达与复盘，五个维度都要在 20 分钟内可被验证。\r
- 两个项目应形成叙事互补：项目一（开发者生态）证明 B 端/平台能力；项目二（家庭场景）证明 C 端体验与 AI 产品化能力。\r
- 面试准备分三层：自我介绍（who）、项目深挖（what/how/why）、行业认知（where is embodied AI going）。\r
- 第 89 天「最终复盘」是刻意留白：通览笔记与费曼复述，修补知识体系漏洞，写下对岗位的终极理解。\r
- 投递不是最后一天才做。第 90 天是启动日，清单应提前备好，边投边根据反馈迭代简历与作品集。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 作品集整合 | 统一视觉、串联叙事、导出可分享 PDF/PPT 的完整求职材料 |\r
| STAR 法则 | Situation, Task, Action, Result，结构化回答行为面试题 |\r
| Trade-off 叙事 | 主动讲述「在 A 与 B 之间为何选 B」，展示 PM 判断力 |\r
| 目标公司清单 | 按赛道（整机/零部件/AI 算法/平台）与优先级排列的投递列表 |\r
| 费曼复述 | 用简单语言向他人解释所学，检验是否真正理解 |\r
\r
## 今日推荐资料\r
\r
- [Lenny's Newsletter 产品经理职业指南](https://www.lennysnewsletter.com/)：PM 求职与成长高质量内容\r
- [Exponent PM 面试准备](https://www.tryexponent.com/)：科技公司 PM 面试题库与模拟\r
- [a16z 具身智能相关文章](https://a16z.com/tag/robotics/)：行业趋势与投资视角，面试谈资\r
- [BOSS 直聘 / 猎聘](https://www.zhipin.com/)：国内具身智能岗位 JD 调研入口\r
\r
## 关联学习天数\r
\r
第 83 至 90 天（第 10 至 12 周：作品集整合与面试冲刺）\r
`,"../../content/module-7/01-portfolio.md":`# 作品集整合\r
\r
两份独立项目产出需要打磨成 **一份** 让面试官在 15 分钟内看到完整产品能力的作品集。本章节覆盖排版统一、内容串联、导出定稿与外部审阅流程。\r
\r
## PM视角要点\r
\r
- 封面页应包含：姓名、求职意向（具身智能产品经理）、联系方式、作品集日期。避免花哨，专业感优先。\r
- 个人介绍页用 3 至 4  bullet 概括能力标签，例如「用户研究 / SDK 产品设计 / 家庭场景 VLA 方案 / 数据驱动迭代」，与两个项目一一对应。\r
- 项目排列建议：先放与你目标岗位更匹配的项目，或按叙事逻辑「平台 → 应用」排列。\r
- 每项目压缩为 6 至 8 页：问题、用户、方案、亮点功能、指标、商业模式（项目一）、技术方案（项目二）、成果与反思。\r
- 请至少 1 位非本专业朋友审阅：测试「不看口头解释能否看懂 70%」。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| 视觉系统 | 统一的配色、字体、图标、图表样式，建议全作品集不超过 2 种主色 |\r
| 叙事弧线 | 从行业洞察到用户痛点到方案到验证，形成完整故事而非功能清单 |\r
| 成长曲线 | 用时间线或能力雷达图展示 90 天从认知到实战的进步 |\r
| 附录策略 | 详细 PRD 表格、完整竞品矩阵放附录，正文只保留决策级摘要 |\r
| PDF 导出规范 | 嵌入字体、压缩图片、文件大小控制在 15MB 以内便于邮件附件 |\r
\r
### 推荐作品集目录结构\r
\r
1. 封面\r
2. 关于我（能力概述 + 教育/经历）\r
3. 90 天学习路径一览（可选信息图）\r
4. **项目一：开发者生态 SDK 产品设计**\r
   - 背景与机会\r
   - 用户洞察\r
   - 方案与 MVP\r
   - 商业模式\r
   - 关键决策与反思\r
5. **项目二：家庭场景功能优化**\r
   - 场景与痛点\r
   - VLA 技术方案\r
   - 交互与指标\r
   - 关键决策与反思\r
6. 总结与联系方式\r
7. 附录（PRD 节选、用户画像、指标表）\r
\r
### 整合检查清单\r
\r
- [ ] 两个项目配色、字体、页眉页脚一致\r
- [ ] 所有图表有标题、来源与可读图例\r
- [ ] 无错别字，专业术语首次出现有简短解释\r
- [ ] 每项目有至少 1 个可量化的成果或目标指标\r
- [ ] 导出 PDF 在手机端可清晰阅读\r
\r
## 今日推荐资料\r
\r
- [Behance 产品设计作品集范例](https://www.behance.net/search/projects?search=product%20design%20portfolio)：视觉排版灵感\r
- [UX Portfolio Case Study 指南](https://www.nngroup.com/articles/ux-portfolio-case-studies/)：案例研究写作结构\r
- [Canva 演示文稿模板](https://www.canva.com/presentations/templates/)：快速统一视觉的工具\r
- [Notion 作品集模板社区](https://www.notion.so/templates)：在线作品集备选方案\r
\r
## 关联学习天数\r
\r
第 83 至 85 天（整合作品集：统一排版、内容串联、导出定稿）\r
`,"../../content/module-7/02-interview.md":`# 模拟面试准备\r
\r
面试官对具身智能 PM 的考察，集中在 **为什么做（Why）、怎么做（How）、取舍是什么（Trade-off）** 三个层次。本章节帮你为两个项目分别准备结构化回答，并完成至少一次 30 分钟完整模拟。\r
\r
## PM视角要点\r
\r
- **Why**：证明问题真实且值得做。引用用户访谈原话、市场数据、竞品缺口，避免「我觉得」式开场。\r
- **How**：证明方法论扎实。描述调研 → 定义 → 方案 → 验证的完整链路，突出你的个人贡献（「我主导了…」「我决策了…」）。\r
- **Trade-off**：证明判断力。每个项目准备 2 至 3 个「本可以做 A，但选了 B」的案例，说明约束与依据。\r
- 自我介绍准备两个版本：**1 分钟**（电梯版）和 **3 分钟**（含项目亮点），均须背熟到自然表达，非背诵感。\r
- 技术追问不必装专家。诚实划定认知边界，展示「足够与工程师对话」的理解深度即可。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| Why-How-Trade-off 框架 | 面试项目题的三层回答结构 |\r
| 追问防御 | 预先准备「如果指标不达标怎么办」「竞品明天抄你怎么办」等尖锐问题 |\r
| 技术深度展示点 | 不需推导公式，但能解释 VLA、SDK、ROS 2、数据闭环对产品的含义 |\r
| 模拟面试 | 限时 30 分钟，含自我介绍、2 个项目、行业题、反向提问 |\r
| 答案库 | 高频题的标准化回答文档，持续根据真实面试反馈迭代 |\r
\r
### 项目一高频题与回答要点\r
\r
| 问题 | 回答框架 |\r
|------|----------|\r
| 为什么做开发者生态？ | 硬件同质化 → 生态是护城河；访谈发现 XX% 开发者卡在首次运行 |\r
| SDK MVP 为何这样划边界？ | 资源约束下优先 Time to First Run；可视化编辑器延后因为… |\r
| 商业模式是否可行？ | 冷启动免费 + 技能商店分成；对标 Unity/App Store 飞轮 |\r
| 最大 trade-off？ | 例：深度绑定自家硬件 vs 兼容 ROS 2，选了后者因为实验室用户… |\r
\r
### 项目二高频题与回答要点\r
\r
| 问题 | 回答框架 |\r
|------|----------|\r
| 为什么选清洁整理而非厨房？ | 安全/监管/成熟度三角；MVP 需 12 个月内可验证 |\r
| VLA 方案怎么评估？ | 成功率、延迟、物体集、成本四维度；引用 RT/OpenVLA 等调研 |\r
| 语音交互最大挑战？ | 嘈杂环境 + 歧义指令；设计了确认与降级路径 |\r
| 如何定义产品成功？ | 任务成功率 ≥ X%、CSAT ≥ Y、卡住率 ≤ Z%，附测试方案 |\r
\r
### 行业通用题准备\r
\r
- 你怎么看具身智能未来 3 年的商业化路径？\r
- 大模型对机器人产品形态有什么改变？\r
- 你如何做优先级排序（RICE / ICE / 价值-成本矩阵）？\r
- 描述一次你与工程师意见不合的经历。\r
\r
## 今日推荐资料\r
\r
- [Exponent PM 模拟面试](https://www.tryexponent.com/courses/product-management-interviews)：结构化面试练习\r
- [IGotAnOffer PM 题库](https://igotanoffer.com/blogs/product-manager/product-manager-interview-questions)：高频 PM 面试题\r
- [Cracking the PM Interview 书籍](https://www.crackingthepminterview.com/)：PM 面试经典参考书\r
- [一亩三分地 机器人/AI PM 面经](https://www.1point3acres.com/)：国内求职者真实面经汇总\r
\r
## 关联学习天数\r
\r
第 86 至 88 天（模拟面试准备：项目一、项目二、综合演练）\r
`,"../../content/module-7/03-apply.md":`# 投递简历与申请策略\r
\r
最后一天的学习任务是启动求职：更新简历、列出目标公司、开始投递。本章节提供具身智能 PM 岗位的简历写法、公司调研框架与投递节奏建议。\r
\r
## PM视角要点\r
\r
- 简历不是作品集缩写。1 页纸内突出 **与岗位最相关的 3 段经历/项目**，作品集链接放显眼位置（GitHub Pages、Notion、PDF 网盘均可）。\r
- 项目描述用 **动作动词 + 量化结果**：「主导 2 类用户访谈，定义 SDK MVP 12 项 P0 功能，设计技能商店分成模型」优于「参与开发者生态项目」。\r
- 目标公司分层：A 档（梦想公司，精心定制简历）、B 档（匹配度高，标准简历）、C 档（练手面积试，快速投递）。\r
- 秋招与可转正实习并行投递，注意各公司流程时间节点（提前批、正式批、补录）。\r
- 第 89 天复盘产出的「对具身智能 PM 岗位的最终理解」，应反哺简历 Summary 和求职信（Cover Letter）。\r
\r
## 核心概念\r
\r
| 概念 | 说明 |\r
|------|------|\r
| ATS 友好简历 | 避免复杂排版，关键词与 JD 对齐，便于招聘系统解析 |\r
| 作品集链接 | 简历中可点击的 URL，确保 90 天内有效、移动端可开 |\r
| JD 关键词映射 | 将岗位要求（用户研究、PRD、数据驱动、AI 产品）映射到你的项目 bullet |\r
| 内推 | 通过校友、社群、LinkedIn 触达招聘方，显著提高回复率 |\r
| 投递追踪表 | 记录公司、岗位、日期、状态、反馈，避免混乱与遗漏 |\r
\r
### 简历结构建议（具身智能 PM）\r
\r
1. **Header**：姓名 | 手机 | 邮箱 | 作品集链接 | 城市\r
2. **Summary**（2 至 3 行）：具身智能/机器人产品方向 + 核心能力标签 + 90 天系统学习与 2 个实战项目\r
3. **项目经历**（重点）\r
   - 开发者生态 SDK 产品设计 | 个人项目 | 2025.XX\r
   - 家庭场景 VLA 功能优化 | 个人项目 | 2025.XX\r
4. **工作/实习经历**（如有，按相关性排序）\r
5. **教育背景**\r
6. **技能**：用户研究、PRD、Figma、数据分析、Python 基础、ROS 2 概念、LLM/VLA 产品化理解\r
\r
### 目标公司调研维度\r
\r
| 维度 | 调研问题 |\r
|------|----------|\r
| 赛道 | 整机 / 关节电机 / 感知 / 具身大模型 / 垂直场景 |\r
| 产品阶段 | 概念验证 / 小批量 / 规模化商用 |\r
| 团队背景 | 学术派 / 工程派 / 互联网跨界 |\r
| 岗位定位 | 偏硬件 PM / 偏软件平台 / 偏 AI 算法产品化 |\r
| 近期动态 | 融资、新品发布、开源项目、顶会论文 |\r
\r
### 投递节奏（建议）\r
\r
- **第 89 天**：完成简历终稿 + 公司清单 30 家 + 作品集最终版\r
- **第 90 天**：投递 A 档 5 家 + B 档 10 家，激活内推渠道\r
- **之后每周**：新增 10 至 15 家，根据面试反馈迭代简历与答案库\r
- **每次面试后 24 小时内**：发送感谢信，记录追问题并更新答案库\r
\r
## 今日推荐资料\r
\r
- [LinkedIn 求职与网络](https://www.linkedin.com/jobs/)：国际岗位与内推触达\r
- [BOSS 直聘](https://www.zhipin.com/)：国内具身智能岗位主力平台\r
- [脉脉](https://maimai.cn/)：公司员工背景与内推信息\r
- [Resume Worded 简历评分](https://resumeworded.com/)：英文简历 ATS 与影响力语句优化\r
- [超级简历 WonderCV](https://www.wondercv.com/)：中文简历模板与排版工具\r
\r
## 关联学习天数\r
\r
第 89 至 90 天（最终复盘、投递简历）\r
`});function dr(e){let t=ur[`../../content/${e}.md`];return typeof t==`string`?t:null}function fr(){return Object.keys(ur).map(e=>e.replace(`../../content/`,``).replace(`.md`,``))}var pr={"module-1":`#0891b2`,"module-2":`#7c3aed`,"module-3":`#0d9488`,"module-4":`#ea580c`,"module-5":`#2563eb`,"module-6":`#db2777`,"module-7":`#16a34a`},mr=`#f59e0b`,hr=Object.values(pr);function gr(e){return e.replace(/\//g,`--`)}function _r(e){return`concept-${e.replace(/\s+/g,`-`).slice(0,24)}`}function vr(e,t=[],n=[]){let r=[],i=[];for(let t=0;t<e.length;t++){let n=e[t],a=n.color||pr[n.id]||hr[t%hr.length],o=n.items[0];r.push({id:n.id,label:n.title.length>10?n.title.slice(0,8)+`…`:n.title,type:`module`,moduleId:n.id,href:o?`/doc/${o.slug}`:`/`,size:22,color:a});for(let e of n.items)r.push({id:gr(e.slug),label:e.title.length>12?e.title.slice(0,10)+`…`:e.title,type:`chapter`,moduleId:n.id,href:`/doc/${e.slug}`,size:12,color:a}),i.push({source:n.id,target:gr(e.slug),relation:`归属`});for(let e=0;e<n.items.length-1;e++)i.push({source:gr(n.items[e].slug),target:gr(n.items[e+1].slug),relation:`顺序`})}let a=t.length?t:[`VLA`,`RT-2`,`OpenVLA`,`强化学习`,`Diffusion Policy`,`世界模型`,`数据飞轮`,`PRD`,`具身智能`];for(let e of a.slice(0,12)){let t=_r(e);r.some(e=>e.id===t)||r.push({id:t,label:e.length>10?e.slice(0,8)+`…`:e,type:`concept`,href:cr(e),size:10,color:mr})}if(n.length)for(let e of n)r.some(t=>t.id===gr(e.chapter))&&r.some(t=>t.id===e.concept)&&i.push({source:gr(e.chapter),target:e.concept,relation:`引用`});else e!==ir&&e[0]?.items?.[0]&&a[0]&&i.push({source:gr(e[0].items[0].slug),target:_r(a[0]),relation:`引用`});return{nodes:r,links:i}}var yr=vr(ir,[],[{chapter:`module-2/04-vla-intro`,concept:`concept-VLA`},{chapter:`module-2/04-vla-intro`,concept:`concept-RT-2`},{chapter:`module-2/04-vla-intro`,concept:`concept-OpenVLA`},{chapter:`module-2/05-rl-intro`,concept:`concept-强化学习`},{chapter:`module-4/03-vla-case`,concept:`concept-VLA`},{chapter:`module-4/04-world-model`,concept:`concept-世界模型`},{chapter:`module-4/05-diffusion-policy`,concept:`concept-Diffusion-Policy`},{chapter:`module-3/03-data-flywheel`,concept:`concept-数据飞轮`},{chapter:`module-1/01-definition`,concept:`concept-具身智能`},{chapter:`module-5/03-prd-writing`,concept:`concept-PRD`}]),br=yr.nodes,xr=yr.links,Sr={归属:`#94a3b8`,顺序:`#cbd5e1`,引用:`#f59e0b`,支撑:`#8b5cf6`,工作流:`#10b981`,跨模块:`#ec4899`};function Cr(e,t=br){return t.find(t=>t.id===e)}var wr=`learning-content-pack:`;function Tr(){try{let e=new URLSearchParams(window.location.search),t=e.get(`packId`)||e.get(`pack`);return t&&t!==`embodied-ai-pm`?t:null}catch{return null}}function Er(e){if(!e||typeof e!=`object`)return;let t=String(e.kind||``).trim().toLowerCase(),n=[`flow`,`loop`,`anatomy`,`roles`,`scenario`,`compare`,`states`,`layers`,`tree`,`timeline`,`matrix`].includes(t)?t:void 0,r=Array.isArray(e.nodes)?e.nodes.map(e=>({label:String(e.label||``).trim(),detail:String(e.detail||``).trim()||void 0,actor:String(e.actor||``).trim()||void 0,badge:String(e.badge||``).trim()||void 0,group:String(e.group||``).trim()||void 0,parent:String(e.parent||``).trim()||void 0})).filter(e=>e.label).slice(0,8):[],i=Array.isArray(e.steps)?e.steps.map(String).map(e=>e.trim()).filter(Boolean).slice(0,8):[],a=Array.isArray(e.facts)?e.facts.map(e=>({label:String(e.label||``).trim(),value:String(e.value||``).trim()})).filter(e=>e.label&&e.value).slice(0,4):[],o=Array.isArray(e.columns)?e.columns.map(String).map(e=>e.trim()).filter(Boolean).slice(0,4):[];if(!(!r.length&&i.length<2&&!a.length&&!e.quote&&!e.caption))return{kind:n||(a.length||e.quote?`scenario`:`flow`),title:String(e.title||`一眼看懂`).trim(),nodes:r.length?r:void 0,steps:i.length>=2?i:void 0,caption:String(e.caption||``).trim()||void 0,quote:String(e.quote||``).trim()||void 0,facts:a.length?a:void 0,columns:o.length?o:void 0}}function Dr(e){if(!Array.isArray(e))return[];let t=[];for(let n of e){let e=String(n.term||``).trim(),r=String(n.definition||n.def||``).trim();if(!e||!r)continue;let i=Array.isArray(n.sections)?n.sections.map(e=>({label:String(e.label||``).trim(),content:String(e.content||``).trim()})).filter(e=>e.label&&e.content):[];t.push({term:e,aliases:Array.isArray(n.aliases)?n.aliases.map(String).filter(Boolean):void 0,userPhrases:Array.isArray(n.userPhrases)?n.userPhrases.map(String).map(e=>e.trim()).filter(Boolean).slice(0,3):void 0,definition:r,module:n.module||`核心`,example:String(n.example||``).trim()||void 0,visual:Er(n.visual),confusions:Array.isArray(n.confusions)?n.confusions.map(e=>({term:String(e.term||``).trim(),distinction:String(e.distinction||``).trim()})).filter(e=>e.term&&e.distinction).slice(0,3):void 0,sections:i.length?i:[{label:`是什么`,content:r}]})}return t}function Or(e){if(!e)return null;try{let t=localStorage.getItem(wr+e);if(!t)return{packId:e,title:`专属知识库`,learningPath:[],navigation:[],chapters:{},glossary:[],graphNodes:[],graphLinks:[],missingHub:!0};let n=JSON.parse(t),r=n?.hub,i=Dr(n?.glossary),a=Array.isArray(r?.navigation)?r.navigation:[],o=r?.chapters&&typeof r.chapters==`object`?r.chapters:{},s=!a.length||!Object.keys(o).length,{nodes:c,links:l}=vr(a,i.map(e=>e.term).slice(0,12));return{packId:e,title:String(r?.title||n?.meta?.title||`专属知识库`),industry:n?.meta?.industry,role:n?.meta?.role,learningPath:Array.isArray(r?.learningPath)?r.learningPath.map(String):a.map(e=>e.title),navigation:a,chapters:o,glossary:i,graphNodes:c,graphLinks:l,missingHub:s}}catch(t){return console.warn(`[runtime-pack] load failed`,t),{packId:e,title:`专属知识库`,learningPath:[],navigation:[],chapters:{},glossary:[],graphNodes:[],graphLinks:[],missingHub:!0}}}var kr=o((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),P=o(((e,t)=>{t.exports=kr()}))(),Ar=(0,v.createContext)(null);function jr(e){return e?e.missingHub?{isRuntime:!0,missingHub:!0,packId:e.packId,hubTitle:e.title||`专属知识库`,industry:e.industry,role:e.role,learningPath:[],navigation:[],glossary:e.glossary,graphNodes:[],graphLinks:[],getContent:()=>null,getAllSlugs:()=>[],getNavItem:()=>void 0,getModuleForSlug:()=>void 0}:{isRuntime:!0,missingHub:!1,packId:e.packId,hubTitle:e.title,industry:e.industry,role:e.role,learningPath:e.learningPath,navigation:e.navigation,glossary:e.glossary,graphNodes:e.graphNodes,graphLinks:e.graphLinks,getContent:t=>e.chapters[t]??null,getAllSlugs:()=>Object.keys(e.chapters),getNavItem:t=>{for(let n of e.navigation){let e=n.items.find(e=>e.slug===t);if(e)return e}},getModuleForSlug:t=>e.navigation.find(e=>e.items.some(e=>e.slug===t))}:{isRuntime:!1,missingHub:!1,packId:null,hubTitle:`知径 · 知识库`,learningPath:[`模块一：行业与市场全景`,`模块二：产品与技术基础`,`模块三：产品思维与竞品`,`模块四：专项深化`,`模块五：作品集项目`,`模块六：场景落地`,`模块七：面试与投递`],navigation:ir,glossary:sr,graphNodes:br,graphLinks:xr,getContent:dr,getAllSlugs:fr,getNavItem:e=>{for(let t of ir){let n=t.items.find(t=>t.slug===e);if(n)return n}},getModuleForSlug:e=>ir.find(t=>t.items.some(t=>t.slug===e))}}function Mr({children:e}){let t=(0,v.useMemo)(()=>jr(Or(Tr())),[]);return(0,P.jsx)(Ar.Provider,{value:t,children:e})}function Nr(){let e=(0,v.useContext)(Ar);if(!e)throw Error(`useContent must be used within ContentProvider`);return e}function Pr(e){return e.replace(/^#+\s+/gm,``).replace(/\*\*/g,``).replace(/`/g,``).replace(/\[([^\]]+)\]\([^)]+\)/g,`$1`).replace(/\|/g,` `).replace(/\s+/g,` `).trim()}function Fr(e,t,n=48){let r=e.toLowerCase(),i=t.toLowerCase(),a=r.indexOf(i);if(a===-1)return e.slice(0,n*2)+(e.length>n*2?`…`:``);let o=Math.max(0,a-n),s=Math.min(e.length,a+t.length+n),c=o>0?`…`:``,l=s<e.length?`…`:``;return c+e.slice(o,s)+l}function Ir(e,t){let n=e.toLowerCase(),r=t.toLowerCase(),i=0,a=0;for(;(a=n.indexOf(r,a))!==-1;)i++,a+=r.length;return i}function Lr(e,t,n){let r=e.toLowerCase(),i=t.toLowerCase();if(!r.includes(i))return 0;let a=n;return r===i?a+=n*2:r.startsWith(i)&&(a+=n*.5),a+=Math.min(Ir(e,t)*4,20),a}function Rr(e){let t=[],{navigation:n,getContent:r,getAllSlugs:i,getModuleForSlug:a,glossary:o}=e;for(let e of i()){let i=r(e);if(!i)continue;let o=n.flatMap(e=>e.items.map(t=>({...t,moduleTitle:e.title}))).find(t=>t.slug===e),s=i.match(/^#\s+(.+)$/m)?.[1]?.trim()??o?.title??e,c=Pr(i),l=a(e);t.push({id:`doc:${e}`,slug:e,title:s,moduleTitle:l?.title??o?.moduleTitle??``,snippet:c.slice(0,120),score:0,type:`doc`,_plain:c})}for(let e of o){let n=or(e);t.push({id:`glossary:${e.term}`,slug:`glossary#${e.term}`,title:e.term,moduleTitle:e.module??`术语表`,snippet:e.definition,score:0,type:`glossary`,_plain:n})}return t}var zr={navigation:ir,getContent:dr,getAllSlugs:fr,getModuleForSlug:ar,glossary:sr};function Br(e,t=12,n=zr){let r=e.trim();return r?Rr(n).map(e=>{let t=e._plain??e.snippet,n=Lr(e.title,r,50),i=Lr(t,r,10),a=n+i;return a===0?null:{id:e.id,slug:e.slug,title:e.title,moduleTitle:e.moduleTitle,type:e.type,score:a,snippet:i>0&&t.toLowerCase().includes(r.toLowerCase())?Fr(t,r):e.snippet}}).filter(e=>e!==null).sort((e,t)=>t.score-e.score).slice(0,t):[]}function Vr(e,t){if(!t.trim())return e;let n=t.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);return e.replace(RegExp(`(${n})`,`gi`),`<<mark>>$1<</mark>>`)}function Hr({text:e,query:t}){return(0,P.jsx)(`span`,{className:`text-slate-500 text-xs line-clamp-2`,children:Vr(e,t).split(/<<mark>>|<\/mark>>/).map((e,t)=>t%2==1?(0,P.jsx)(`mark`,{className:`bg-yellow-200 text-slate-800 rounded px-0.5`,children:e},t):(0,P.jsx)(`span`,{children:e},t))})}function Ur(e){return e.type===`glossary`?cr(e.title):`/doc/`+e.slug}function Wr(){let[e,t]=(0,v.useState)(!1),[n,r]=(0,v.useState)(``),[i,a]=(0,v.useState)([]),[o,s]=(0,v.useState)(0),c=(0,v.useRef)(null),l=gt();(0,v.useEffect)(()=>{let e=e=>{(e.metaKey||e.ctrlKey)&&e.key===`k`&&(e.preventDefault(),t(!0)),e.key===`Escape`&&t(!1)};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[]),(0,v.useEffect)(()=>{e?requestAnimationFrame(()=>c.current?.focus()):(r(``),a([]),s(0))},[e]),(0,v.useEffect)(()=>{a(Br(n)),s(0)},[n]);let u=(0,v.useCallback)(e=>{t(!1),l(Ur(e))},[l]);return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsxs)(`button`,{type:`button`,onClick:()=>t(!0),className:`flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 hover:text-slate-700 bg-slate-50 min-w-[140px] md:min-w-[200px]`,children:[(0,P.jsx)(`span`,{className:`flex-1 text-left truncate`,children:`搜索…`}),(0,P.jsx)(`kbd`,{className:`hidden sm:inline text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5`,children:`Ctrl K`})]}),e&&(0,P.jsxs)(`div`,{className:`fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4`,role:`dialog`,"aria-modal":`true`,"aria-label":`全文搜索`,children:[(0,P.jsx)(`button`,{type:`button`,className:`absolute inset-0 bg-black/40`,"aria-label":`关闭搜索`,onClick:()=>t(!1)}),(0,P.jsxs)(`div`,{className:`relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden`,children:[(0,P.jsxs)(`div`,{className:`flex items-center border-b border-slate-100 px-4`,children:[(0,P.jsx)(`svg`,{className:`w-5 h-5 text-slate-400 shrink-0`,fill:`none`,viewBox:`0 0 24 24`,stroke:`currentColor`,children:(0,P.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2,d:`M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z`})}),(0,P.jsx)(`input`,{ref:c,type:`search`,value:n,onChange:e=>r(e.target.value),onKeyDown:e=>{e.key===`ArrowDown`?(e.preventDefault(),s(e=>Math.min(e+1,i.length-1))):e.key===`ArrowUp`?(e.preventDefault(),s(e=>Math.max(e-1,0))):e.key===`Enter`&&i[o]&&(e.preventDefault(),u(i[o]))},placeholder:`搜索标题、正文、术语…`,className:`flex-1 px-3 py-3.5 text-sm outline-none`,autoComplete:`off`}),(0,P.jsx)(`kbd`,{className:`text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5`,children:`Esc`})]}),(0,P.jsxs)(`div`,{className:`max-h-[50vh] overflow-y-auto`,children:[n.trim()&&i.length===0&&(0,P.jsxs)(`p`,{className:`px-4 py-8 text-sm text-slate-500 text-center`,children:[`未找到「`,n,`」相关内容`]}),i.length>0&&(0,P.jsx)(`ul`,{className:`py-2`,children:i.map((e,t)=>(0,P.jsx)(`li`,{children:(0,P.jsxs)(`button`,{type:`button`,onClick:()=>u(e),onMouseEnter:()=>s(t),className:`w-full text-left px-4 py-2.5 transition-colors ${t===o?`bg-blue-50`:`hover:bg-slate-50`}`,children:[(0,P.jsxs)(`div`,{className:`flex items-baseline gap-2 mb-0.5`,children:[(0,P.jsx)(`span`,{className:`text-sm font-medium text-slate-900`,children:e.title}),(0,P.jsx)(`span`,{className:`text-[10px] text-slate-400 shrink-0`,children:e.type===`glossary`?`术语`:e.moduleTitle})]}),(0,P.jsx)(Hr,{text:e.snippet,query:n})]})},e.id))}),!n.trim()&&(0,P.jsx)(`p`,{className:`px-4 py-6 text-sm text-slate-400 text-center`,children:`输入关键词，搜索全部章节与术语表`})]}),n.trim()&&i.length>0&&(0,P.jsxs)(`div`,{className:`border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 flex gap-3`,children:[(0,P.jsx)(`span`,{children:`↑↓ 选择`}),(0,P.jsx)(`span`,{children:`Enter 打开`}),(0,P.jsx)(zn,{to:`/search?q=${encodeURIComponent(n)}`,onClick:()=>t(!1),className:`ml-auto text-blue-600 hover:underline`,children:`查看全部结果`})]})]})]})]})}function Gr(){return new URLSearchParams(window.location.search).has(`embed`)||window.self!==window.top}function Kr(){let e=M(),t=e.pathname===`/graph`,n=e.pathname.startsWith(`/glossary`),r=Gr(),{navigation:i,hubTitle:a,missingHub:o,isRuntime:s}=Nr();return(0,P.jsxs)(`div`,{className:`min-h-[100dvh] flex flex-col`,children:[!r&&(0,P.jsxs)(`header`,{className:`sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur`,children:[(0,P.jsx)(zn,{to:`/`,className:`font-bold text-lg text-slate-900 hover:text-cyan-700 shrink-0 max-w-[200px] truncate`,children:s?a:`知径 · 知识库`}),(0,P.jsx)(`div`,{className:`flex-1 flex justify-center max-w-md mx-auto`,children:!o&&(0,P.jsx)(Wr,{})}),(0,P.jsxs)(`nav`,{className:`flex gap-3 text-sm shrink-0`,children:[(0,P.jsx)(`a`,{href:`../index.html`,target:`_parent`,className:`text-slate-600 hover:text-cyan-700 font-medium`,children:`今天`}),(0,P.jsx)(zn,{to:`/graph`,className:e.pathname===`/graph`?`text-cyan-700 font-medium`:`text-slate-600 hover:text-cyan-700`,children:`知识网络`}),(0,P.jsx)(zn,{to:`/glossary`,className:n?`text-cyan-700 font-medium`:`text-slate-600 hover:text-cyan-700`,children:`术语库`})]})]}),(0,P.jsxs)(`div`,{className:`flex flex-1`,children:[!t&&!n&&!o&&(0,P.jsxs)(`aside`,{className:`w-64 shrink-0 border-r border-slate-200 bg-white overflow-y-auto hidden md:block ${r?`max-h-[100vh] sticky top-0`:`max-h-[calc(100vh-57px)] sticky top-[57px]`}`,children:[r&&(0,P.jsx)(`div`,{className:`p-3 border-b border-slate-100`,children:(0,P.jsx)(Wr,{})}),(0,P.jsx)(`div`,{className:`p-4 space-y-6`,children:i.map(t=>(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`p`,{className:`text-xs font-semibold uppercase tracking-wide mb-2`,style:{color:t.color},children:t.title}),(0,P.jsx)(`ul`,{className:`space-y-1`,children:t.items.map(t=>{let n=`/doc/${t.slug}`;return(0,P.jsx)(`li`,{children:(0,P.jsxs)(zn,{to:n,className:`block text-sm py-1.5 px-2 rounded-md transition-colors ${e.pathname===n?`bg-cyan-50 text-cyan-800 font-medium`:`text-slate-600 hover:bg-slate-50 hover:text-slate-900`}`,children:[t.title,t.days&&(0,P.jsxs)(`span`,{className:`text-xs text-slate-400 ml-1`,children:[`D`,t.days]})]})},t.slug)})})]},t.id))})]}),(0,P.jsx)(`main`,{className:t?`flex-1 p-2 md:p-4 w-full ${r?`max-w-none`:`max-w-6xl mx-auto`}`:n?`flex-1 w-full px-5 py-8 sm:px-8 md:py-10 ${r?`max-w-none`:`max-w-7xl mx-auto`}`:`flex-1 p-6 ${r?`md:p-8`:`md:p-10`} max-w-4xl`,children:(0,P.jsx)(Wt,{})})]})]})}function qr(){let{hubTitle:e,learningPath:t,navigation:n,isRuntime:r,missingHub:i,industry:a,role:o}=Nr();return i?(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h1`,{className:`text-3xl font-bold text-slate-900 mb-2`,children:e}),(0,P.jsx)(`p`,{className:`text-slate-600 mb-6 leading-relaxed`,children:`本路径课表已就绪，阅读章节还没生成。`}),(0,P.jsxs)(`div`,{className:`rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-slate-700 space-y-2`,children:[(0,P.jsxs)(`p`,{children:[`请返回路径列表，点卡片上的 `,(0,P.jsx)(`strong`,{children:`生成阅读内容`}),`（需先开启智能功能）。`]}),(0,P.jsx)(`p`,{className:`text-slate-500`,children:`大约 1–2 分钟即可。`})]})]}):(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h1`,{className:`text-3xl font-bold text-slate-900 mb-2`,children:e}),(0,P.jsx)(`p`,{className:`text-slate-600 mb-8 leading-relaxed`,children:r?`与专属课表配套${a||o?`（${[a,o].filter(Boolean).join(` · `)}）`:``}：按模块阅读章节，配合打卡页每日任务与费曼复述。`:`与打卡课表配套：按模块阅读章节，配合每日任务与费曼复述系统学习。`}),(0,P.jsx)(`section`,{className:`mb-10`,children:(0,P.jsxs)(`a`,{href:`../index.html`,className:`block p-5 rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white hover:border-cyan-400 hover:shadow-md transition-all`,children:[(0,P.jsx)(`h3`,{className:`font-semibold text-slate-900 mb-1`,children:`返回今天`}),(0,P.jsx)(`p`,{className:`text-sm text-slate-500`,children:`每日任务、打卡、复述与今日资料`})]})}),(0,P.jsxs)(`section`,{className:`mb-10`,children:[(0,P.jsx)(`h2`,{className:`text-xl font-semibold mb-4`,children:`推荐学习路径`}),(0,P.jsx)(`ol`,{className:`list-decimal list-inside space-y-2 text-slate-700`,children:t.map((e,t)=>(0,P.jsx)(`li`,{children:e},t))})]}),(0,P.jsx)(`section`,{className:`mb-10`,children:(0,P.jsxs)(zn,{to:`/graph`,className:`block p-5 rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-cyan-50 hover:border-cyan-400 hover:shadow-md transition-all text-center`,children:[(0,P.jsx)(`h3`,{className:`font-semibold text-slate-900 mb-1`,children:`知识网络导航`}),(0,P.jsx)(`p`,{className:`text-sm text-slate-500`,children:`可视化查看章节与概念关联，点击节点直达页面`})]})}),(0,P.jsx)(`section`,{className:`grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10`,children:n.map(e=>(0,P.jsxs)(zn,{to:e.items[0]?`/doc/${e.items[0].slug}`:`/`,className:`block p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all`,style:{borderTopColor:e.color,borderTopWidth:3},children:[(0,P.jsx)(`h3`,{className:`font-semibold text-slate-900 mb-1`,children:e.title}),(0,P.jsx)(`p`,{className:`text-sm text-slate-500 mb-3`,children:e.description}),(0,P.jsxs)(`span`,{className:`text-sm`,style:{color:e.color},children:[e.items.length,` 个章节 →`]})]},e.id))})]})}function Jr(e,t){let n=t||{};return(e[e.length-1]===``?[...e,``]:e).join((n.padRight?` `:``)+`,`+(n.padLeft===!1?``:` `)).trim()}var Yr=/^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u,Xr=/^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u,Zr={};function Qr(e,t){return((t||Zr).jsx?Xr:Yr).test(e)}var $r=/[ \t\n\f\r]/g;function ei(e){return typeof e==`object`?e.type===`text`&&ti(e.value):ti(e)}function ti(e){return e.replace($r,``)===``}var ni=class{constructor(e,t,n){this.normal=t,this.property=e,n&&(this.space=n)}};ni.prototype.normal={},ni.prototype.property={},ni.prototype.space=void 0;function ri(e,t){let n={},r={};for(let t of e)Object.assign(n,t.property),Object.assign(r,t.normal);return new ni(n,r,t)}function ii(e){return e.toLowerCase()}var ai=class{constructor(e,t){this.attribute=t,this.property=e}};ai.prototype.attribute=``,ai.prototype.booleanish=!1,ai.prototype.boolean=!1,ai.prototype.commaOrSpaceSeparated=!1,ai.prototype.commaSeparated=!1,ai.prototype.defined=!1,ai.prototype.mustUseProperty=!1,ai.prototype.number=!1,ai.prototype.overloadedBoolean=!1,ai.prototype.property=``,ai.prototype.spaceSeparated=!1,ai.prototype.space=void 0;var oi=s({boolean:()=>F,booleanish:()=>ci,commaOrSpaceSeparated:()=>di,commaSeparated:()=>ui,number:()=>I,overloadedBoolean:()=>li,spaceSeparated:()=>L}),si=0,F=fi(),ci=fi(),li=fi(),I=fi(),L=fi(),ui=fi(),di=fi();function fi(){return 2**++si}var pi=Object.keys(oi),mi=class extends ai{constructor(e,t,n,r){let i=-1;if(super(e,t),hi(this,`space`,r),typeof n==`number`)for(;++i<pi.length;){let e=pi[i];hi(this,pi[i],(n&oi[e])===oi[e])}}};mi.prototype.defined=!0;function hi(e,t,n){n&&(e[t]=n)}function gi(e){let t={},n={};for(let[r,i]of Object.entries(e.properties)){let a=new mi(r,e.transform(e.attributes||{},r),i,e.space);e.mustUseProperty&&e.mustUseProperty.includes(r)&&(a.mustUseProperty=!0),t[r]=a,n[ii(r)]=r,n[ii(a.attribute)]=r}return new ni(t,n,e.space)}var _i=gi({properties:{ariaActiveDescendant:null,ariaAtomic:ci,ariaAutoComplete:null,ariaBusy:ci,ariaChecked:ci,ariaColCount:I,ariaColIndex:I,ariaColSpan:I,ariaControls:L,ariaCurrent:null,ariaDescribedBy:L,ariaDetails:null,ariaDisabled:ci,ariaDropEffect:L,ariaErrorMessage:null,ariaExpanded:ci,ariaFlowTo:L,ariaGrabbed:ci,ariaHasPopup:null,ariaHidden:ci,ariaInvalid:null,ariaKeyShortcuts:null,ariaLabel:null,ariaLabelledBy:L,ariaLevel:I,ariaLive:null,ariaModal:ci,ariaMultiLine:ci,ariaMultiSelectable:ci,ariaOrientation:null,ariaOwns:L,ariaPlaceholder:null,ariaPosInSet:I,ariaPressed:ci,ariaReadOnly:ci,ariaRelevant:null,ariaRequired:ci,ariaRoleDescription:L,ariaRowCount:I,ariaRowIndex:I,ariaRowSpan:I,ariaSelected:ci,ariaSetSize:I,ariaSort:null,ariaValueMax:I,ariaValueMin:I,ariaValueNow:I,ariaValueText:null,role:null},transform(e,t){return t===`role`?t:`aria-`+t.slice(4).toLowerCase()}});function vi(e,t){return t in e?e[t]:t}function yi(e,t){return vi(e,t.toLowerCase())}var bi=gi({attributes:{acceptcharset:`accept-charset`,classname:`class`,htmlfor:`for`,httpequiv:`http-equiv`},mustUseProperty:[`checked`,`multiple`,`muted`,`selected`],properties:{abbr:null,accept:ui,acceptCharset:L,accessKey:L,action:null,allow:null,allowFullScreen:F,allowPaymentRequest:F,allowUserMedia:F,alpha:F,alt:null,as:null,async:F,autoCapitalize:null,autoComplete:L,autoFocus:F,autoPlay:F,blocking:L,capture:null,charSet:null,checked:F,cite:null,className:L,closedBy:null,colorSpace:null,cols:I,colSpan:I,command:null,commandFor:null,content:null,contentEditable:ci,controls:F,controlsList:L,coords:I|ui,crossOrigin:null,data:null,dateTime:null,decoding:null,default:F,defer:F,dir:null,dirName:null,disabled:F,download:li,draggable:ci,encType:null,enterKeyHint:null,fetchPriority:null,form:null,formAction:null,formEncType:null,formMethod:null,formNoValidate:F,formTarget:null,headers:L,height:I,hidden:li,high:I,href:null,hrefLang:null,htmlFor:L,httpEquiv:L,id:null,imageSizes:null,imageSrcSet:null,inert:F,inputMode:null,integrity:null,is:null,isMap:F,itemId:null,itemProp:L,itemRef:L,itemScope:F,itemType:L,kind:null,label:null,lang:null,language:null,list:null,loading:null,loop:F,low:I,manifest:null,max:null,maxLength:I,media:null,method:null,min:null,minLength:I,multiple:F,muted:F,name:null,nonce:null,noModule:F,noValidate:F,onAbort:null,onAfterPrint:null,onAuxClick:null,onBeforeMatch:null,onBeforePrint:null,onBeforeToggle:null,onBeforeUnload:null,onBlur:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onContextLost:null,onContextMenu:null,onContextRestored:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnded:null,onError:null,onFocus:null,onFormData:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLanguageChange:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadEnd:null,onLoadStart:null,onMessage:null,onMessageError:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRejectionHandled:null,onReset:null,onResize:null,onScroll:null,onScrollEnd:null,onSecurityPolicyViolation:null,onSeeked:null,onSeeking:null,onSelect:null,onSlotChange:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnhandledRejection:null,onUnload:null,onVolumeChange:null,onWaiting:null,onWheel:null,open:F,optimum:I,pattern:null,ping:L,placeholder:null,playsInline:F,popover:null,popoverTarget:null,popoverTargetAction:null,poster:null,preload:null,readOnly:F,referrerPolicy:null,rel:L,required:F,reversed:F,rows:I,rowSpan:I,sandbox:L,scope:null,scoped:F,seamless:F,selected:F,shadowRootClonable:F,shadowRootCustomElementRegistry:F,shadowRootDelegatesFocus:F,shadowRootMode:null,shadowRootSerializable:F,shape:null,size:I,sizes:null,slot:null,span:I,spellCheck:ci,src:null,srcDoc:null,srcLang:null,srcSet:null,start:I,step:null,style:null,tabIndex:I,target:null,title:null,translate:null,type:null,typeMustMatch:F,useMap:null,value:ci,width:I,wrap:null,writingSuggestions:null,align:null,aLink:null,archive:L,axis:null,background:null,bgColor:null,border:I,borderColor:null,bottomMargin:I,cellPadding:null,cellSpacing:null,char:null,charOff:null,classId:null,clear:null,code:null,codeBase:null,codeType:null,color:null,compact:F,declare:F,event:null,face:null,frame:null,frameBorder:null,hSpace:I,leftMargin:I,link:null,longDesc:null,lowSrc:null,marginHeight:I,marginWidth:I,noResize:F,noHref:F,noShade:F,noWrap:F,object:null,profile:null,prompt:null,rev:null,rightMargin:I,rules:null,scheme:null,scrolling:ci,standby:null,summary:null,text:null,topMargin:I,valueType:null,version:null,vAlign:null,vLink:null,vSpace:I,allowTransparency:null,autoCorrect:null,autoSave:null,credentialless:F,disablePictureInPicture:F,disableRemotePlayback:F,exportParts:ui,part:L,prefix:null,property:null,results:I,security:null,unselectable:null},space:`html`,transform:yi}),xi=gi({attributes:{accentHeight:`accent-height`,alignmentBaseline:`alignment-baseline`,arabicForm:`arabic-form`,baselineShift:`baseline-shift`,capHeight:`cap-height`,className:`class`,clipPath:`clip-path`,clipRule:`clip-rule`,colorInterpolation:`color-interpolation`,colorInterpolationFilters:`color-interpolation-filters`,colorProfile:`color-profile`,colorRendering:`color-rendering`,crossOrigin:`crossorigin`,dataType:`datatype`,dominantBaseline:`dominant-baseline`,enableBackground:`enable-background`,fillOpacity:`fill-opacity`,fillRule:`fill-rule`,floodColor:`flood-color`,floodOpacity:`flood-opacity`,fontFamily:`font-family`,fontSize:`font-size`,fontSizeAdjust:`font-size-adjust`,fontStretch:`font-stretch`,fontStyle:`font-style`,fontVariant:`font-variant`,fontWeight:`font-weight`,glyphName:`glyph-name`,glyphOrientationHorizontal:`glyph-orientation-horizontal`,glyphOrientationVertical:`glyph-orientation-vertical`,hrefLang:`hreflang`,horizAdvX:`horiz-adv-x`,horizOriginX:`horiz-origin-x`,horizOriginY:`horiz-origin-y`,imageRendering:`image-rendering`,letterSpacing:`letter-spacing`,lightingColor:`lighting-color`,markerEnd:`marker-end`,markerMid:`marker-mid`,markerStart:`marker-start`,maskType:`mask-type`,navDown:`nav-down`,navDownLeft:`nav-down-left`,navDownRight:`nav-down-right`,navLeft:`nav-left`,navNext:`nav-next`,navPrev:`nav-prev`,navRight:`nav-right`,navUp:`nav-up`,navUpLeft:`nav-up-left`,navUpRight:`nav-up-right`,onAbort:`onabort`,onActivate:`onactivate`,onAfterPrint:`onafterprint`,onBeforePrint:`onbeforeprint`,onBegin:`onbegin`,onCancel:`oncancel`,onCanPlay:`oncanplay`,onCanPlayThrough:`oncanplaythrough`,onChange:`onchange`,onClick:`onclick`,onClose:`onclose`,onCopy:`oncopy`,onCueChange:`oncuechange`,onCut:`oncut`,onDblClick:`ondblclick`,onDrag:`ondrag`,onDragEnd:`ondragend`,onDragEnter:`ondragenter`,onDragExit:`ondragexit`,onDragLeave:`ondragleave`,onDragOver:`ondragover`,onDragStart:`ondragstart`,onDrop:`ondrop`,onDurationChange:`ondurationchange`,onEmptied:`onemptied`,onEnd:`onend`,onEnded:`onended`,onError:`onerror`,onFocus:`onfocus`,onFocusIn:`onfocusin`,onFocusOut:`onfocusout`,onHashChange:`onhashchange`,onInput:`oninput`,onInvalid:`oninvalid`,onKeyDown:`onkeydown`,onKeyPress:`onkeypress`,onKeyUp:`onkeyup`,onLoad:`onload`,onLoadedData:`onloadeddata`,onLoadedMetadata:`onloadedmetadata`,onLoadStart:`onloadstart`,onMessage:`onmessage`,onMouseDown:`onmousedown`,onMouseEnter:`onmouseenter`,onMouseLeave:`onmouseleave`,onMouseMove:`onmousemove`,onMouseOut:`onmouseout`,onMouseOver:`onmouseover`,onMouseUp:`onmouseup`,onMouseWheel:`onmousewheel`,onOffline:`onoffline`,onOnline:`ononline`,onPageHide:`onpagehide`,onPageShow:`onpageshow`,onPaste:`onpaste`,onPause:`onpause`,onPlay:`onplay`,onPlaying:`onplaying`,onPopState:`onpopstate`,onProgress:`onprogress`,onRateChange:`onratechange`,onRepeat:`onrepeat`,onReset:`onreset`,onResize:`onresize`,onScroll:`onscroll`,onSeeked:`onseeked`,onSeeking:`onseeking`,onSelect:`onselect`,onShow:`onshow`,onStalled:`onstalled`,onStorage:`onstorage`,onSubmit:`onsubmit`,onSuspend:`onsuspend`,onTimeUpdate:`ontimeupdate`,onToggle:`ontoggle`,onUnload:`onunload`,onVolumeChange:`onvolumechange`,onWaiting:`onwaiting`,onZoom:`onzoom`,overlinePosition:`overline-position`,overlineThickness:`overline-thickness`,paintOrder:`paint-order`,panose1:`panose-1`,pointerEvents:`pointer-events`,referrerPolicy:`referrerpolicy`,renderingIntent:`rendering-intent`,shapeRendering:`shape-rendering`,stopColor:`stop-color`,stopOpacity:`stop-opacity`,strikethroughPosition:`strikethrough-position`,strikethroughThickness:`strikethrough-thickness`,strokeDashArray:`stroke-dasharray`,strokeDashOffset:`stroke-dashoffset`,strokeLineCap:`stroke-linecap`,strokeLineJoin:`stroke-linejoin`,strokeMiterLimit:`stroke-miterlimit`,strokeOpacity:`stroke-opacity`,strokeWidth:`stroke-width`,tabIndex:`tabindex`,textAnchor:`text-anchor`,textDecoration:`text-decoration`,textRendering:`text-rendering`,transformOrigin:`transform-origin`,typeOf:`typeof`,underlinePosition:`underline-position`,underlineThickness:`underline-thickness`,unicodeBidi:`unicode-bidi`,unicodeRange:`unicode-range`,unitsPerEm:`units-per-em`,vAlphabetic:`v-alphabetic`,vHanging:`v-hanging`,vIdeographic:`v-ideographic`,vMathematical:`v-mathematical`,vectorEffect:`vector-effect`,vertAdvY:`vert-adv-y`,vertOriginX:`vert-origin-x`,vertOriginY:`vert-origin-y`,wordSpacing:`word-spacing`,writingMode:`writing-mode`,xHeight:`x-height`,playbackOrder:`playbackorder`,timelineBegin:`timelinebegin`},properties:{about:di,accentHeight:I,accumulate:null,additive:null,alignmentBaseline:null,alphabetic:I,amplitude:I,arabicForm:null,ascent:I,attributeName:null,attributeType:null,azimuth:I,bandwidth:null,baselineShift:null,baseFrequency:null,baseProfile:null,bbox:null,begin:null,bias:I,by:null,calcMode:null,capHeight:I,className:L,clip:null,clipPath:null,clipPathUnits:null,clipRule:null,color:null,colorInterpolation:null,colorInterpolationFilters:null,colorProfile:null,colorRendering:null,content:null,contentScriptType:null,contentStyleType:null,crossOrigin:null,cursor:null,cx:null,cy:null,d:null,dataType:null,defaultAction:null,descent:I,diffuseConstant:I,direction:null,display:null,dur:null,divisor:I,dominantBaseline:null,download:F,dx:null,dy:null,edgeMode:null,editable:null,elevation:I,enableBackground:null,end:null,event:null,exponent:I,externalResourcesRequired:null,fill:null,fillOpacity:I,fillRule:null,filter:null,filterRes:null,filterUnits:null,floodColor:null,floodOpacity:null,focusable:null,focusHighlight:null,fontFamily:null,fontSize:null,fontSizeAdjust:null,fontStretch:null,fontStyle:null,fontVariant:null,fontWeight:null,format:null,fr:null,from:null,fx:null,fy:null,g1:ui,g2:ui,glyphName:ui,glyphOrientationHorizontal:null,glyphOrientationVertical:null,glyphRef:null,gradientTransform:null,gradientUnits:null,handler:null,hanging:I,hatchContentUnits:null,hatchUnits:null,height:null,href:null,hrefLang:null,horizAdvX:I,horizOriginX:I,horizOriginY:I,id:null,ideographic:I,imageRendering:null,initialVisibility:null,in:null,in2:null,intercept:I,k:I,k1:I,k2:I,k3:I,k4:I,kernelMatrix:di,kernelUnitLength:null,keyPoints:null,keySplines:null,keyTimes:null,kerning:null,lang:null,lengthAdjust:null,letterSpacing:null,lightingColor:null,limitingConeAngle:I,local:null,markerEnd:null,markerMid:null,markerStart:null,markerHeight:null,markerUnits:null,markerWidth:null,mask:null,maskContentUnits:null,maskType:null,maskUnits:null,mathematical:null,max:null,media:null,mediaCharacterEncoding:null,mediaContentEncodings:null,mediaSize:I,mediaTime:null,method:null,min:null,mode:null,name:null,navDown:null,navDownLeft:null,navDownRight:null,navLeft:null,navNext:null,navPrev:null,navRight:null,navUp:null,navUpLeft:null,navUpRight:null,numOctaves:null,observer:null,offset:null,onAbort:null,onActivate:null,onAfterPrint:null,onBeforePrint:null,onBegin:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnd:null,onEnded:null,onError:null,onFocus:null,onFocusIn:null,onFocusOut:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadStart:null,onMessage:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onMouseWheel:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRepeat:null,onReset:null,onResize:null,onScroll:null,onSeeked:null,onSeeking:null,onSelect:null,onShow:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnload:null,onVolumeChange:null,onWaiting:null,onZoom:null,opacity:null,operator:null,order:null,orient:null,orientation:null,origin:null,overflow:null,overlay:null,overlinePosition:I,overlineThickness:I,paintOrder:null,panose1:null,path:null,pathLength:I,patternContentUnits:null,patternTransform:null,patternUnits:null,phase:null,ping:L,pitch:null,playbackOrder:null,pointerEvents:null,points:null,pointsAtX:I,pointsAtY:I,pointsAtZ:I,preserveAlpha:null,preserveAspectRatio:null,primitiveUnits:null,propagate:null,property:di,r:null,radius:null,referrerPolicy:null,refX:null,refY:null,rel:di,rev:di,renderingIntent:null,repeatCount:null,repeatDur:null,requiredExtensions:di,requiredFeatures:di,requiredFonts:di,requiredFormats:di,resource:null,restart:null,result:null,rotate:null,rx:null,ry:null,scale:null,seed:null,shapeRendering:null,side:null,slope:null,snapshotTime:null,specularConstant:I,specularExponent:I,spreadMethod:null,spacing:null,startOffset:null,stdDeviation:null,stemh:null,stemv:null,stitchTiles:null,stopColor:null,stopOpacity:null,strikethroughPosition:I,strikethroughThickness:I,string:null,stroke:null,strokeDashArray:di,strokeDashOffset:null,strokeLineCap:null,strokeLineJoin:null,strokeMiterLimit:I,strokeOpacity:I,strokeWidth:null,style:null,surfaceScale:I,syncBehavior:null,syncBehaviorDefault:null,syncMaster:null,syncTolerance:null,syncToleranceDefault:null,systemLanguage:di,tabIndex:I,tableValues:null,target:null,targetX:I,targetY:I,textAnchor:null,textDecoration:null,textRendering:null,textLength:null,timelineBegin:null,title:null,transformBehavior:null,type:null,typeOf:di,to:null,transform:null,transformOrigin:null,u1:null,u2:null,underlinePosition:I,underlineThickness:I,unicode:null,unicodeBidi:null,unicodeRange:null,unitsPerEm:I,values:null,vAlphabetic:I,vMathematical:I,vectorEffect:null,vHanging:I,vIdeographic:I,version:null,vertAdvY:I,vertOriginX:I,vertOriginY:I,viewBox:null,viewTarget:null,visibility:null,width:null,widths:null,wordSpacing:null,writingMode:null,x:null,x1:null,x2:null,xChannelSelector:null,xHeight:I,y:null,y1:null,y2:null,yChannelSelector:null,z:null,zoomAndPan:null},space:`svg`,transform:vi}),Si=gi({properties:{xLinkActuate:null,xLinkArcRole:null,xLinkHref:null,xLinkRole:null,xLinkShow:null,xLinkTitle:null,xLinkType:null},space:`xlink`,transform(e,t){return`xlink:`+t.slice(5).toLowerCase()}}),Ci=gi({attributes:{xmlnsxlink:`xmlns:xlink`},properties:{xmlnsXLink:null,xmlns:null},space:`xmlns`,transform:yi}),wi=gi({properties:{xmlBase:null,xmlLang:null,xmlSpace:null},space:`xml`,transform(e,t){return`xml:`+t.slice(3).toLowerCase()}}),Ti={classId:`classID`,dataType:`datatype`,itemId:`itemID`,strokeDashArray:`strokeDasharray`,strokeDashOffset:`strokeDashoffset`,strokeLineCap:`strokeLinecap`,strokeLineJoin:`strokeLinejoin`,strokeMiterLimit:`strokeMiterlimit`,typeOf:`typeof`,xLinkActuate:`xlinkActuate`,xLinkArcRole:`xlinkArcrole`,xLinkHref:`xlinkHref`,xLinkRole:`xlinkRole`,xLinkShow:`xlinkShow`,xLinkTitle:`xlinkTitle`,xLinkType:`xlinkType`,xmlnsXLink:`xmlnsXlink`},Ei=/[A-Z]/g,Di=/-[a-z]/g,Oi=/^data[-\w.:]+$/i;function ki(e,t){let n=ii(t),r=t,i=ai;if(n in e.normal)return e.property[e.normal[n]];if(n.length>4&&n.slice(0,4)===`data`&&Oi.test(t)){if(t.charAt(4)===`-`){let e=t.slice(5).replace(Di,ji);r=`data`+e.charAt(0).toUpperCase()+e.slice(1)}else{let e=t.slice(4);if(!Di.test(e)){let n=e.replace(Ei,Ai);n.charAt(0)!==`-`&&(n=`-`+n),t=`data`+n}}i=mi}return new i(r,t)}function Ai(e){return`-`+e.toLowerCase()}function ji(e){return e.charAt(1).toUpperCase()}var Mi=ri([_i,bi,Si,Ci,wi],`html`),Ni=ri([_i,xi,Si,Ci,wi],`svg`);function Pi(e){return e.join(` `).trim()}var Fi=o(((e,t)=>{var n=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,r=/\n/g,i=/^\s*/,a=/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/,o=/^:\s*/,s=/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/,c=/^[;\s]*/,l=/^\s+|\s+$/g;function u(e,t){if(typeof e!=`string`)throw TypeError(`First argument must be a string`);if(!e)return[];t||={};var l=1,u=1;function f(e){var t=e.match(r);t&&(l+=t.length);var n=e.lastIndexOf(`
`);u=~n?e.length-n:u+e.length}function p(){var e={line:l,column:u};return function(t){return t.position=new m(e),_(),t}}function m(e){this.start=e,this.end={line:l,column:u},this.source=t.source}m.prototype.content=e;function h(n){var r=Error(t.source+`:`+l+`:`+u+`: `+n);if(r.reason=n,r.filename=t.source,r.line=l,r.column=u,r.source=e,!t.silent)throw r}function g(t){var n=t.exec(e);if(n){var r=n[0];return f(r),e=e.slice(r.length),n}}function _(){g(i)}function v(e){var t;for(e||=[];t=y();)t!==!1&&e.push(t);return e}function y(){var t=p();if(!(e.charAt(0)!=`/`||e.charAt(1)!=`*`)){for(var n=2;e.charAt(n)!=``&&(e.charAt(n)!=`*`||e.charAt(n+1)!=`/`);)++n;if(n+=2,e.charAt(n-1)===``)return h(`End of comment missing`);var r=e.slice(2,n-2);return u+=2,f(r),e=e.slice(n),u+=2,t({type:`comment`,comment:r})}}function b(){var e=p(),t=g(a);if(t){if(y(),!g(o))return h(`property missing ':'`);var r=g(s),i=e({type:`declaration`,property:d(t[0].replace(n,``)),value:r?d(r[0].replace(n,``)):``});return g(c),i}}function x(){var e=[];v(e);for(var t;t=b();)t!==!1&&(e.push(t),v(e));return e}return _(),x()}function d(e){return e?e.replace(l,``):``}t.exports=u})),R=o((e=>{var t=e&&e.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(e,"__esModule",{value:!0}),e.default=r;var n=t(Fi());function r(e,t){let r=null;if(!e||typeof e!=`string`)return r;let i=(0,n.default)(e),a=typeof t==`function`;return i.forEach(e=>{if(e.type!==`declaration`)return;let{property:n,value:i}=e;a?t(n,i,e):i&&(r||={},r[n]=i)}),r}})),Ii=o((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.camelCase=void 0;var t=/^--[a-zA-Z0-9_-]+$/,n=/-([a-z])/g,r=/^[^-]+$/,i=/^-(webkit|moz|ms|o|khtml)-/,a=/^-(ms)-/,o=function(e){return!e||r.test(e)||t.test(e)},s=function(e,t){return t.toUpperCase()},c=function(e,t){return`${t}-`};e.camelCase=function(e,t){return t===void 0&&(t={}),o(e)?e:(e=e.toLowerCase(),e=t.reactCompat?e.replace(a,c):e.replace(i,c),e.replace(n,s))}})),Li=o(((e,t)=>{var n=(e&&e.__importDefault||function(e){return e&&e.__esModule?e:{default:e}})(R()),r=Ii();function i(e,t){var i={};return!e||typeof e!=`string`||(0,n.default)(e,function(e,n){e&&n&&(i[(0,r.camelCase)(e,t)]=n)}),i}i.default=i,t.exports=i})),Ri=Bi(`end`),zi=Bi(`start`);function Bi(e){return t;function t(t){let n=t&&t.position&&t.position[e]||{};if(typeof n.line==`number`&&n.line>0&&typeof n.column==`number`&&n.column>0)return{line:n.line,column:n.column,offset:typeof n.offset==`number`&&n.offset>-1?n.offset:void 0}}}function Vi(e){let t=zi(e),n=Ri(e);if(t&&n)return{start:t,end:n}}function Hi(e){return!e||typeof e!=`object`?``:`position`in e||`type`in e?Wi(e.position):`start`in e||`end`in e?Wi(e):`line`in e||`column`in e?Ui(e):``}function Ui(e){return Gi(e&&e.line)+`:`+Gi(e&&e.column)}function Wi(e){return Ui(e&&e.start)+`-`+Ui(e&&e.end)}function Gi(e){return e&&typeof e==`number`?e:1}var Ki=class extends Error{constructor(e,t,n){super(),typeof t==`string`&&(n=t,t=void 0);let r=``,i={},a=!1;if(t&&(i=`line`in t&&`column`in t||`start`in t&&`end`in t?{place:t}:`type`in t?{ancestors:[t],place:t.position}:{...t}),typeof e==`string`?r=e:!i.cause&&e&&(a=!0,r=e.message,i.cause=e),!i.ruleId&&!i.source&&typeof n==`string`){let e=n.indexOf(`:`);e===-1?i.ruleId=n:(i.source=n.slice(0,e),i.ruleId=n.slice(e+1))}if(!i.place&&i.ancestors&&i.ancestors){let e=i.ancestors[i.ancestors.length-1];e&&(i.place=e.position)}let o=i.place&&`start`in i.place?i.place.start:i.place;this.ancestors=i.ancestors||void 0,this.cause=i.cause||void 0,this.column=o?o.column:void 0,this.fatal=void 0,this.file=``,this.message=r,this.line=o?o.line:void 0,this.name=Hi(i.place)||`1:1`,this.place=i.place||void 0,this.reason=this.message,this.ruleId=i.ruleId||void 0,this.source=i.source||void 0,this.stack=a&&i.cause&&typeof i.cause.stack==`string`?i.cause.stack:``,this.actual=void 0,this.expected=void 0,this.note=void 0,this.url=void 0}};Ki.prototype.file=``,Ki.prototype.name=``,Ki.prototype.reason=``,Ki.prototype.message=``,Ki.prototype.stack=``,Ki.prototype.column=void 0,Ki.prototype.line=void 0,Ki.prototype.ancestors=void 0,Ki.prototype.cause=void 0,Ki.prototype.fatal=void 0,Ki.prototype.place=void 0,Ki.prototype.ruleId=void 0,Ki.prototype.source=void 0;var qi=l(Li(),1),Ji={}.hasOwnProperty,Yi=new Map,Xi=/[A-Z]/g,Zi=new Set([`table`,`tbody`,`thead`,`tfoot`,`tr`]),Qi=new Set([`td`,`th`]);function $i(e,t){if(!t||t.Fragment===void 0)throw TypeError("Expected `Fragment` in options");let n=t.filePath||void 0,r;if(t.development){if(typeof t.jsxDEV!=`function`)throw TypeError("Expected `jsxDEV` in options when `development: true`");r=ua(n,t.jsxDEV)}else{if(typeof t.jsx!=`function`)throw TypeError("Expected `jsx` in production options");if(typeof t.jsxs!=`function`)throw TypeError("Expected `jsxs` in production options");r=la(n,t.jsx,t.jsxs)}let i={Fragment:t.Fragment,ancestors:[],components:t.components||{},create:r,elementAttributeNameCase:t.elementAttributeNameCase||`react`,evaluater:t.createEvaluater?t.createEvaluater():void 0,filePath:n,ignoreInvalidStyle:t.ignoreInvalidStyle||!1,passKeys:t.passKeys!==!1,passNode:t.passNode||!1,schema:t.space===`svg`?Ni:Mi,stylePropertyNameCase:t.stylePropertyNameCase||`dom`,tableCellAlignToStyle:t.tableCellAlignToStyle!==!1},a=ea(i,e,void 0);return a&&typeof a!=`string`?a:i.create(e,i.Fragment,{children:a||void 0},void 0)}function ea(e,t,n){if(t.type===`element`)return ta(e,t,n);if(t.type===`mdxFlowExpression`||t.type===`mdxTextExpression`)return na(e,t);if(t.type===`mdxJsxFlowElement`||t.type===`mdxJsxTextElement`)return ia(e,t,n);if(t.type===`mdxjsEsm`)return ra(e,t);if(t.type===`root`)return aa(e,t,n);if(t.type===`text`)return oa(e,t)}function ta(e,t,n){let r=e.schema,i=r;t.tagName.toLowerCase()===`svg`&&r.space===`html`&&(i=Ni,e.schema=i),e.ancestors.push(t);let a=ga(e,t.tagName,!1),o=da(e,t),s=pa(e,t);return Zi.has(t.tagName)&&(s=s.filter(function(e){return typeof e!=`string`||!ei(e)})),sa(e,o,a,t),ca(o,s),e.ancestors.pop(),e.schema=r,e.create(t,a,o,n)}function na(e,t){if(t.data&&t.data.estree&&e.evaluater){let n=t.data.estree.body[0];return n.type,e.evaluater.evaluateExpression(n.expression)}_a(e,t.position)}function ra(e,t){if(t.data&&t.data.estree&&e.evaluater)return e.evaluater.evaluateProgram(t.data.estree);_a(e,t.position)}function ia(e,t,n){let r=e.schema,i=r;t.name===`svg`&&r.space===`html`&&(i=Ni,e.schema=i),e.ancestors.push(t);let a=t.name===null?e.Fragment:ga(e,t.name,!0),o=fa(e,t),s=pa(e,t);return sa(e,o,a,t),ca(o,s),e.ancestors.pop(),e.schema=r,e.create(t,a,o,n)}function aa(e,t,n){let r={};return ca(r,pa(e,t)),e.create(t,e.Fragment,r,n)}function oa(e,t){return t.value}function sa(e,t,n,r){typeof n!=`string`&&n!==e.Fragment&&e.passNode&&(t.node=r)}function ca(e,t){if(t.length>0){let n=t.length>1?t:t[0];n&&(e.children=n)}}function la(e,t,n){return r;function r(e,r,i,a){let o=Array.isArray(i.children)?n:t;return a?o(r,i,a):o(r,i)}}function ua(e,t){return n;function n(n,r,i,a){let o=Array.isArray(i.children),s=zi(n);return t(r,i,a,o,{columnNumber:s?s.column-1:void 0,fileName:e,lineNumber:s?s.line:void 0},void 0)}}function da(e,t){let n={},r,i;for(i in t.properties)if(i!==`children`&&Ji.call(t.properties,i)){let a=ma(e,i,t.properties[i]);if(a){let[i,o]=a;e.tableCellAlignToStyle&&i===`align`&&typeof o==`string`&&Qi.has(t.tagName)?r=o:n[i]=o}}if(r){let t=n.style||={};t[e.stylePropertyNameCase===`css`?`text-align`:`textAlign`]=r}return n}function fa(e,t){let n={};for(let r of t.attributes)if(r.type===`mdxJsxExpressionAttribute`)if(r.data&&r.data.estree&&e.evaluater){let t=r.data.estree.body[0];t.type;let i=t.expression;i.type;let a=i.properties[0];a.type,Object.assign(n,e.evaluater.evaluateExpression(a.argument))}else _a(e,t.position);else{let i=r.name,a;if(r.value&&typeof r.value==`object`)if(r.value.data&&r.value.data.estree&&e.evaluater){let t=r.value.data.estree.body[0];t.type,a=e.evaluater.evaluateExpression(t.expression)}else _a(e,t.position);else a=r.value===null||r.value;n[i]=a}return n}function pa(e,t){let n=[],r=-1,i=e.passKeys?new Map:Yi;for(;++r<t.children.length;){let a=t.children[r],o;if(e.passKeys){let e=a.type===`element`?a.tagName:a.type===`mdxJsxFlowElement`||a.type===`mdxJsxTextElement`?a.name:void 0;if(e){let t=i.get(e)||0;o=e+`-`+t,i.set(e,t+1)}}let s=ea(e,a,o);s!==void 0&&n.push(s)}return n}function ma(e,t,n){let r=ki(e.schema,t);if(!(n==null||typeof n==`number`&&Number.isNaN(n))){if(Array.isArray(n)&&(n=r.commaSeparated?Jr(n):Pi(n)),r.property===`style`){let t=typeof n==`object`?n:ha(e,String(n));return e.stylePropertyNameCase===`css`&&(t=va(t)),[`style`,t]}return[e.elementAttributeNameCase===`react`&&r.space?Ti[r.property]||r.property:r.attribute,n]}}function ha(e,t){try{return(0,qi.default)(t,{reactCompat:!0})}catch(t){if(e.ignoreInvalidStyle)return{};let n=t,r=new Ki("Cannot parse `style` attribute",{ancestors:e.ancestors,cause:n,ruleId:`style`,source:`hast-util-to-jsx-runtime`});throw r.file=e.filePath||void 0,r.url=`https://github.com/syntax-tree/hast-util-to-jsx-runtime#cannot-parse-style-attribute`,r}}function ga(e,t,n){let r;if(!n)r={type:`Literal`,value:t};else if(t.includes(`.`)){let e=t.split(`.`),n=-1,i;for(;++n<e.length;){let t=Qr(e[n])?{type:`Identifier`,name:e[n]}:{type:`Literal`,value:e[n]};i=i?{type:`MemberExpression`,object:i,property:t,computed:!!(n&&t.type===`Literal`),optional:!1}:t}r=i}else r=Qr(t)&&!/^[a-z]/.test(t)?{type:`Identifier`,name:t}:{type:`Literal`,value:t};if(r.type===`Literal`){let t=r.value;return Ji.call(e.components,t)?e.components[t]:t}if(e.evaluater)return e.evaluater.evaluateExpression(r);_a(e)}function _a(e,t){let n=new Ki("Cannot handle MDX estrees without `createEvaluater`",{ancestors:e.ancestors,place:t,ruleId:`mdx-estree`,source:`hast-util-to-jsx-runtime`});throw n.file=e.filePath||void 0,n.url=`https://github.com/syntax-tree/hast-util-to-jsx-runtime#cannot-handle-mdx-estrees-without-createevaluater`,n}function va(e){let t={},n;for(n in e)Ji.call(e,n)&&(t[ya(n)]=e[n]);return t}function ya(e){let t=e.replace(Xi,ba);return t.slice(0,3)===`ms-`&&(t=`-`+t),t}function ba(e){return`-`+e.toLowerCase()}var xa={action:[`form`],cite:[`blockquote`,`del`,`ins`,`q`],data:[`object`],formAction:[`button`,`input`],href:[`a`,`area`,`base`,`link`],icon:[`menuitem`],itemId:null,manifest:[`html`],ping:[`a`,`area`],poster:[`video`],src:[`audio`,`embed`,`iframe`,`img`,`input`,`script`,`source`,`track`,`video`]},Sa={};function Ca(e,t){let n=t||Sa;return wa(e,typeof n.includeImageAlt!=`boolean`||n.includeImageAlt,typeof n.includeHtml!=`boolean`||n.includeHtml)}function wa(e,t,n){if(Ea(e)){if(`value`in e)return e.type===`html`&&!n?``:e.value;if(t&&`alt`in e&&e.alt)return e.alt;if(`children`in e)return Ta(e.children,t,n)}return Array.isArray(e)?Ta(e,t,n):``}function Ta(e,t,n){let r=[],i=-1;for(;++i<e.length;)r[i]=wa(e[i],t,n);return r.join(``)}function Ea(e){return!!(e&&typeof e==`object`)}var Da=document.createElement(`i`);function Oa(e){let t=`&`+e+`;`;Da.innerHTML=t;let n=Da.textContent;return n.charCodeAt(n.length-1)===59&&e!==`semi`?!1:n!==t&&n}function ka(e,t,n,r){let i=e.length,a=0,o;if(t=t<0?-t>i?0:i+t:t>i?i:t,n=n>0?n:0,r.length<1e4)o=Array.from(r),o.unshift(t,n),e.splice(...o);else for(n&&e.splice(t,n);a<r.length;)o=r.slice(a,a+1e4),o.unshift(t,0),e.splice(...o),a+=1e4,t+=1e4}function Aa(e,t){return e.length>0?(ka(e,e.length,0,t),e):t}var ja={}.hasOwnProperty;function Ma(e){let t={},n=-1;for(;++n<e.length;)Na(t,e[n]);return t}function Na(e,t){let n;for(n in t){let r=(ja.call(e,n)?e[n]:void 0)||(e[n]={}),i=t[n],a;if(i)for(a in i){ja.call(r,a)||(r[a]=[]);let e=i[a];Pa(r[a],Array.isArray(e)?e:e?[e]:[])}}}function Pa(e,t){let n=-1,r=[];for(;++n<t.length;)(t[n].add===`after`?e:r).push(t[n]);ka(e,0,0,r)}function Fa(e,t){let n=Number.parseInt(e,t);return n<9||n===11||n>13&&n<32||n>126&&n<160||n>55295&&n<57344||n>64975&&n<65008||(n&65535)==65535||(n&65535)==65534||n>1114111?`�`:String.fromCodePoint(n)}function Ia(e){return e.replace(/[\t\n\r ]+/g,` `).replace(/^ | $/g,``).toLowerCase().toUpperCase()}var La=Ka(/[A-Za-z]/),Ra=Ka(/[\dA-Za-z]/),za=Ka(/[#-'*+\--9=?A-Z^-~]/);function Ba(e){return e!==null&&(e<32||e===127)}var Va=Ka(/\d/),Ha=Ka(/[\dA-Fa-f]/),Ua=Ka(/[!-/:-@[-`{-~]/);function z(e){return e!==null&&e<-2}function B(e){return e!==null&&(e<0||e===32)}function V(e){return e===-2||e===-1||e===32}var Wa=Ka(/\p{P}|\p{S}/u),Ga=Ka(/\s/);function Ka(e){return t;function t(t){return t!==null&&t>-1&&e.test(String.fromCharCode(t))}}function qa(e){let t=[],n=-1,r=0,i=0;for(;++n<e.length;){let a=e.charCodeAt(n),o=``;if(a===37&&Ra(e.charCodeAt(n+1))&&Ra(e.charCodeAt(n+2)))i=2;else if(a<128)/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(a))||(o=String.fromCharCode(a));else if(a>55295&&a<57344){let t=e.charCodeAt(n+1);a<56320&&t>56319&&t<57344?(o=String.fromCharCode(a,t),i=1):o=`�`}else o=String.fromCharCode(a);o&&=(t.push(e.slice(r,n),encodeURIComponent(o)),r=n+i+1,``),i&&=(n+=i,0)}return t.join(``)+e.slice(r)}function H(e,t,n,r){let i=r?r-1:1/0,a=0;return o;function o(r){return V(r)?(e.enter(n),s(r)):t(r)}function s(r){return V(r)&&a++<i?(e.consume(r),s):(e.exit(n),t(r))}}var Ja={tokenize:Ya};function Ya(e){let t=e.attempt(this.parser.constructs.contentInitial,r,i),n;return t;function r(n){if(n===null){e.consume(n);return}return e.enter(`lineEnding`),e.consume(n),e.exit(`lineEnding`),H(e,t,`linePrefix`)}function i(t){return e.enter(`paragraph`),a(t)}function a(t){let r=e.enter(`chunkText`,{contentType:`text`,previous:n});return n&&(n.next=r),n=r,o(t)}function o(t){if(t===null){e.exit(`chunkText`),e.exit(`paragraph`),e.consume(t);return}return z(t)?(e.consume(t),e.exit(`chunkText`),a):(e.consume(t),o)}}var Xa={tokenize:Qa},Za={tokenize:$a};function Qa(e){let t=this,n=[],r=0,i,a,o;return s;function s(i){if(r<n.length){let a=n[r];return t.containerState=a[1],e.attempt(a[0].continuation,c,l)(i)}return l(i)}function c(e){if(r++,t.containerState._closeFlow){t.containerState._closeFlow=void 0,i&&v();let n=t.events.length,a=n,o;for(;a--;)if(t.events[a][0]===`exit`&&t.events[a][1].type===`chunkFlow`){o=t.events[a][1].end;break}_(r);let s=n;for(;s<t.events.length;)t.events[s][1].end={...o},s++;return ka(t.events,a+1,0,t.events.slice(n)),t.events.length=s,l(e)}return s(e)}function l(a){if(r===n.length){if(!i)return f(a);if(i.currentConstruct&&i.currentConstruct.concrete)return m(a);t.interrupt=!!(i.currentConstruct&&!i._gfmTableDynamicInterruptHack)}return t.containerState={},e.check(Za,u,d)(a)}function u(e){return i&&v(),_(r),f(e)}function d(e){return t.parser.lazy[t.now().line]=r!==n.length,o=t.now().offset,m(e)}function f(n){return t.containerState={},e.attempt(Za,p,m)(n)}function p(e){return r++,n.push([t.currentConstruct,t.containerState]),f(e)}function m(n){if(n===null){i&&v(),_(0),e.consume(n);return}return i||=t.parser.flow(t.now()),e.enter(`chunkFlow`,{_tokenizer:i,contentType:`flow`,previous:a}),h(n)}function h(n){if(n===null){g(e.exit(`chunkFlow`),!0),_(0),e.consume(n);return}return z(n)?(e.consume(n),g(e.exit(`chunkFlow`)),r=0,t.interrupt=void 0,s):(e.consume(n),h)}function g(e,n){let s=t.sliceStream(e);if(n&&s.push(null),e.previous=a,a&&(a.next=e),a=e,i.defineSkip(e.start),i.write(s),t.parser.lazy[e.start.line]){let e=i.events.length;for(;e--;)if(i.events[e][1].start.offset<o&&(!i.events[e][1].end||i.events[e][1].end.offset>o))return;let n=t.events.length,a=n,s,c;for(;a--;)if(t.events[a][0]===`exit`&&t.events[a][1].type===`chunkFlow`){if(s){c=t.events[a][1].end;break}s=!0}for(_(r),e=n;e<t.events.length;)t.events[e][1].end={...c},e++;ka(t.events,a+1,0,t.events.slice(n)),t.events.length=e}}function _(r){let i=n.length;for(;i-->r;){let r=n[i];t.containerState=r[1],r[0].exit.call(t,e)}n.length=r}function v(){i.write([null]),a=void 0,i=void 0,t.containerState._closeFlow=void 0}}function $a(e,t,n){return H(e,e.attempt(this.parser.constructs.document,t,n),`linePrefix`,this.parser.constructs.disable.null.includes(`codeIndented`)?void 0:4)}function eo(e){if(e===null||B(e)||Ga(e))return 1;if(Wa(e))return 2}function to(e,t,n){let r=[],i=-1;for(;++i<e.length;){let a=e[i].resolveAll;a&&!r.includes(a)&&(t=a(t,n),r.push(a))}return t}var no={name:`attention`,resolveAll:ro,tokenize:io};function ro(e,t){let n=-1,r,i,a,o,s,c,l,u;for(;++n<e.length;)if(e[n][0]===`enter`&&e[n][1].type===`attentionSequence`&&e[n][1]._close){for(r=n;r--;)if(e[r][0]===`exit`&&e[r][1].type===`attentionSequence`&&e[r][1]._open&&t.sliceSerialize(e[r][1]).charCodeAt(0)===t.sliceSerialize(e[n][1]).charCodeAt(0)){if((e[r][1]._close||e[n][1]._open)&&(e[n][1].end.offset-e[n][1].start.offset)%3&&!((e[r][1].end.offset-e[r][1].start.offset+e[n][1].end.offset-e[n][1].start.offset)%3))continue;c=e[r][1].end.offset-e[r][1].start.offset>1&&e[n][1].end.offset-e[n][1].start.offset>1?2:1;let d={...e[r][1].end},f={...e[n][1].start};ao(d,-c),ao(f,c),o={type:c>1?`strongSequence`:`emphasisSequence`,start:d,end:{...e[r][1].end}},s={type:c>1?`strongSequence`:`emphasisSequence`,start:{...e[n][1].start},end:f},a={type:c>1?`strongText`:`emphasisText`,start:{...e[r][1].end},end:{...e[n][1].start}},i={type:c>1?`strong`:`emphasis`,start:{...o.start},end:{...s.end}},e[r][1].end={...o.start},e[n][1].start={...s.end},l=[],e[r][1].end.offset-e[r][1].start.offset&&(l=Aa(l,[[`enter`,e[r][1],t],[`exit`,e[r][1],t]])),l=Aa(l,[[`enter`,i,t],[`enter`,o,t],[`exit`,o,t],[`enter`,a,t]]),l=Aa(l,to(t.parser.constructs.insideSpan.null,e.slice(r+1,n),t)),l=Aa(l,[[`exit`,a,t],[`enter`,s,t],[`exit`,s,t],[`exit`,i,t]]),e[n][1].end.offset-e[n][1].start.offset?(u=2,l=Aa(l,[[`enter`,e[n][1],t],[`exit`,e[n][1],t]])):u=0,ka(e,r-1,n-r+3,l),n=r+l.length-u-2;break}}for(n=-1;++n<e.length;)e[n][1].type===`attentionSequence`&&(e[n][1].type=`data`);return e}function io(e,t){let n=this.parser.constructs.attentionMarkers.null,r=this.previous,i=eo(r),a;return o;function o(t){return a=t,e.enter(`attentionSequence`),s(t)}function s(o){if(o===a)return e.consume(o),s;let c=e.exit(`attentionSequence`),l=eo(o),u=!l||l===2&&i||n.includes(o),d=!i||i===2&&l||n.includes(r);return c._open=!!(a===42?u:u&&(i||!d)),c._close=!!(a===42?d:d&&(l||!u)),t(o)}}function ao(e,t){e.column+=t,e.offset+=t,e._bufferIndex+=t}var oo={name:`autolink`,tokenize:so};function so(e,t,n){let r=0;return i;function i(t){return e.enter(`autolink`),e.enter(`autolinkMarker`),e.consume(t),e.exit(`autolinkMarker`),e.enter(`autolinkProtocol`),a}function a(t){return La(t)?(e.consume(t),o):t===64?n(t):l(t)}function o(e){return e===43||e===45||e===46||Ra(e)?(r=1,s(e)):l(e)}function s(t){return t===58?(e.consume(t),r=0,c):(t===43||t===45||t===46||Ra(t))&&r++<32?(e.consume(t),s):(r=0,l(t))}function c(r){return r===62?(e.exit(`autolinkProtocol`),e.enter(`autolinkMarker`),e.consume(r),e.exit(`autolinkMarker`),e.exit(`autolink`),t):r===null||r===32||r===60||Ba(r)?n(r):(e.consume(r),c)}function l(t){return t===64?(e.consume(t),u):za(t)?(e.consume(t),l):n(t)}function u(e){return Ra(e)?d(e):n(e)}function d(n){return n===46?(e.consume(n),r=0,u):n===62?(e.exit(`autolinkProtocol`).type=`autolinkEmail`,e.enter(`autolinkMarker`),e.consume(n),e.exit(`autolinkMarker`),e.exit(`autolink`),t):f(n)}function f(t){if((t===45||Ra(t))&&r++<63){let n=t===45?f:d;return e.consume(t),n}return n(t)}}var co={partial:!0,tokenize:lo};function lo(e,t,n){return r;function r(t){return V(t)?H(e,i,`linePrefix`)(t):i(t)}function i(e){return e===null||z(e)?t(e):n(e)}}var U={continuation:{tokenize:uo},exit:fo,name:`blockQuote`,tokenize:W};function W(e,t,n){let r=this;return i;function i(t){if(t===62){let n=r.containerState;return n.open||=(e.enter(`blockQuote`,{_container:!0}),!0),e.enter(`blockQuotePrefix`),e.enter(`blockQuoteMarker`),e.consume(t),e.exit(`blockQuoteMarker`),a}return n(t)}function a(n){return V(n)?(e.enter(`blockQuotePrefixWhitespace`),e.consume(n),e.exit(`blockQuotePrefixWhitespace`),e.exit(`blockQuotePrefix`),t):(e.exit(`blockQuotePrefix`),t(n))}}function uo(e,t,n){let r=this;return i;function i(t){return V(t)?H(e,a,`linePrefix`,r.parser.constructs.disable.null.includes(`codeIndented`)?void 0:4)(t):a(t)}function a(r){return e.attempt(U,t,n)(r)}}function fo(e){e.exit(`blockQuote`)}var po={name:`characterEscape`,tokenize:mo};function mo(e,t,n){return r;function r(t){return e.enter(`characterEscape`),e.enter(`escapeMarker`),e.consume(t),e.exit(`escapeMarker`),i}function i(r){return Ua(r)?(e.enter(`characterEscapeValue`),e.consume(r),e.exit(`characterEscapeValue`),e.exit(`characterEscape`),t):n(r)}}var ho={name:`characterReference`,tokenize:go};function go(e,t,n){let r=this,i=0,a,o;return s;function s(t){return e.enter(`characterReference`),e.enter(`characterReferenceMarker`),e.consume(t),e.exit(`characterReferenceMarker`),c}function c(t){return t===35?(e.enter(`characterReferenceMarkerNumeric`),e.consume(t),e.exit(`characterReferenceMarkerNumeric`),l):(e.enter(`characterReferenceValue`),a=31,o=Ra,u(t))}function l(t){return t===88||t===120?(e.enter(`characterReferenceMarkerHexadecimal`),e.consume(t),e.exit(`characterReferenceMarkerHexadecimal`),e.enter(`characterReferenceValue`),a=6,o=Ha,u):(e.enter(`characterReferenceValue`),a=7,o=Va,u(t))}function u(s){if(s===59&&i){let i=e.exit(`characterReferenceValue`);return o===Ra&&!Oa(r.sliceSerialize(i))?n(s):(e.enter(`characterReferenceMarker`),e.consume(s),e.exit(`characterReferenceMarker`),e.exit(`characterReference`),t)}return o(s)&&i++<a?(e.consume(s),u):n(s)}}var _o={partial:!0,tokenize:bo},vo={concrete:!0,name:`codeFenced`,tokenize:yo};function yo(e,t,n){let r=this,i={partial:!0,tokenize:x},a=0,o=0,s;return c;function c(e){return l(e)}function l(t){let n=r.events[r.events.length-1];return a=n&&n[1].type===`linePrefix`?n[2].sliceSerialize(n[1],!0).length:0,s=t,e.enter(`codeFenced`),e.enter(`codeFencedFence`),e.enter(`codeFencedFenceSequence`),u(t)}function u(t){return t===s?(o++,e.consume(t),u):o<3?n(t):(e.exit(`codeFencedFenceSequence`),V(t)?H(e,d,`whitespace`)(t):d(t))}function d(n){return n===null||z(n)?(e.exit(`codeFencedFence`),r.interrupt?t(n):e.check(_o,h,b)(n)):(e.enter(`codeFencedFenceInfo`),e.enter(`chunkString`,{contentType:`string`}),f(n))}function f(t){return t===null||z(t)?(e.exit(`chunkString`),e.exit(`codeFencedFenceInfo`),d(t)):V(t)?(e.exit(`chunkString`),e.exit(`codeFencedFenceInfo`),H(e,p,`whitespace`)(t)):t===96&&t===s?n(t):(e.consume(t),f)}function p(t){return t===null||z(t)?d(t):(e.enter(`codeFencedFenceMeta`),e.enter(`chunkString`,{contentType:`string`}),m(t))}function m(t){return t===null||z(t)?(e.exit(`chunkString`),e.exit(`codeFencedFenceMeta`),d(t)):t===96&&t===s?n(t):(e.consume(t),m)}function h(t){return e.attempt(i,b,g)(t)}function g(t){return e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),_}function _(t){return a>0&&V(t)?H(e,v,`linePrefix`,a+1)(t):v(t)}function v(t){return t===null||z(t)?e.check(_o,h,b)(t):(e.enter(`codeFlowValue`),y(t))}function y(t){return t===null||z(t)?(e.exit(`codeFlowValue`),v(t)):(e.consume(t),y)}function b(n){return e.exit(`codeFenced`),t(n)}function x(e,t,n){let i=0;return a;function a(t){return e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),c}function c(t){return e.enter(`codeFencedFence`),V(t)?H(e,l,`linePrefix`,r.parser.constructs.disable.null.includes(`codeIndented`)?void 0:4)(t):l(t)}function l(t){return t===s?(e.enter(`codeFencedFenceSequence`),u(t)):n(t)}function u(t){return t===s?(i++,e.consume(t),u):i>=o?(e.exit(`codeFencedFenceSequence`),V(t)?H(e,d,`whitespace`)(t):d(t)):n(t)}function d(r){return r===null||z(r)?(e.exit(`codeFencedFence`),t(r)):n(r)}}}function bo(e,t,n){let r=this;return i;function i(t){return t===null?n(t):(e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),a)}function a(e){return r.parser.lazy[r.now().line]?n(e):t(e)}}var xo={name:`codeIndented`,tokenize:Co},So={partial:!0,tokenize:wo};function Co(e,t,n){let r=this;return i;function i(t){return e.enter(`codeIndented`),H(e,a,`linePrefix`,5)(t)}function a(e){let t=r.events[r.events.length-1];return t&&t[1].type===`linePrefix`&&t[2].sliceSerialize(t[1],!0).length>=4?o(e):n(e)}function o(t){return t===null?c(t):z(t)?e.attempt(So,o,c)(t):(e.enter(`codeFlowValue`),s(t))}function s(t){return t===null||z(t)?(e.exit(`codeFlowValue`),o(t)):(e.consume(t),s)}function c(n){return e.exit(`codeIndented`),t(n)}}function wo(e,t,n){let r=this;return i;function i(t){return r.parser.lazy[r.now().line]?n(t):z(t)?(e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),i):H(e,a,`linePrefix`,5)(t)}function a(e){let a=r.events[r.events.length-1];return a&&a[1].type===`linePrefix`&&a[2].sliceSerialize(a[1],!0).length>=4?t(e):z(e)?i(e):n(e)}}var To={name:`codeText`,previous:Do,resolve:Eo,tokenize:Oo};function Eo(e){let t=e.length-4,n=3,r,i;if((e[n][1].type===`lineEnding`||e[n][1].type===`space`)&&(e[t][1].type===`lineEnding`||e[t][1].type===`space`)){for(r=n;++r<t;)if(e[r][1].type===`codeTextData`){e[n][1].type=`codeTextPadding`,e[t][1].type=`codeTextPadding`,n+=2,t-=2;break}}for(r=n-1,t++;++r<=t;)i===void 0?r!==t&&e[r][1].type!==`lineEnding`&&(i=r):(r===t||e[r][1].type===`lineEnding`)&&(e[i][1].type=`codeTextData`,r!==i+2&&(e[i][1].end=e[r-1][1].end,e.splice(i+2,r-i-2),t-=r-i-2,r=i+2),i=void 0);return e}function Do(e){return e!==96||this.events[this.events.length-1][1].type===`characterEscape`}function Oo(e,t,n){let r=0,i,a;return o;function o(t){return e.enter(`codeText`),e.enter(`codeTextSequence`),s(t)}function s(t){return t===96?(e.consume(t),r++,s):(e.exit(`codeTextSequence`),c(t))}function c(t){return t===null?n(t):t===32?(e.enter(`space`),e.consume(t),e.exit(`space`),c):t===96?(a=e.enter(`codeTextSequence`),i=0,u(t)):z(t)?(e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),c):(e.enter(`codeTextData`),l(t))}function l(t){return t===null||t===32||t===96||z(t)?(e.exit(`codeTextData`),c(t)):(e.consume(t),l)}function u(n){return n===96?(e.consume(n),i++,u):i===r?(e.exit(`codeTextSequence`),e.exit(`codeText`),t(n)):(a.type=`codeTextData`,l(n))}}var ko=class{constructor(e){this.left=e?[...e]:[],this.right=[]}get(e){if(e<0||e>=this.left.length+this.right.length)throw RangeError("Cannot access index `"+e+"` in a splice buffer of size `"+(this.left.length+this.right.length)+"`");return e<this.left.length?this.left[e]:this.right[this.right.length-e+this.left.length-1]}get length(){return this.left.length+this.right.length}shift(){return this.setCursor(0),this.right.pop()}slice(e,t){let n=t??1/0;return n<this.left.length?this.left.slice(e,n):e>this.left.length?this.right.slice(this.right.length-n+this.left.length,this.right.length-e+this.left.length).reverse():this.left.slice(e).concat(this.right.slice(this.right.length-n+this.left.length).reverse())}splice(e,t,n){let r=t||0;this.setCursor(Math.trunc(e));let i=this.right.splice(this.right.length-r,1/0);return n&&Ao(this.left,n),i.reverse()}pop(){return this.setCursor(1/0),this.left.pop()}push(e){this.setCursor(1/0),this.left.push(e)}pushMany(e){this.setCursor(1/0),Ao(this.left,e)}unshift(e){this.setCursor(0),this.right.push(e)}unshiftMany(e){this.setCursor(0),Ao(this.right,e.reverse())}setCursor(e){if(!(e===this.left.length||e>this.left.length&&this.right.length===0||e<0&&this.left.length===0))if(e<this.left.length){let t=this.left.splice(e,1/0);Ao(this.right,t.reverse())}else{let t=this.right.splice(this.left.length+this.right.length-e,1/0);Ao(this.left,t.reverse())}}};function Ao(e,t){let n=0;if(t.length<1e4)e.push(...t);else for(;n<t.length;)e.push(...t.slice(n,n+1e4)),n+=1e4}function jo(e){let t={},n=-1,r,i,a,o,s,c,l,u=new ko(e);for(;++n<u.length;){for(;n in t;)n=t[n];if(r=u.get(n),n&&r[1].type===`chunkFlow`&&u.get(n-1)[1].type===`listItemPrefix`&&(c=r[1]._tokenizer.events,a=0,a<c.length&&c[a][1].type===`lineEndingBlank`&&(a+=2),a<c.length&&c[a][1].type===`content`))for(;++a<c.length&&c[a][1].type!==`content`;)c[a][1].type===`chunkText`&&(c[a][1]._isInFirstContentOfListItem=!0,a++);if(r[0]===`enter`)r[1].contentType&&(Object.assign(t,Mo(u,n)),n=t[n],l=!0);else if(r[1]._container){for(a=n,i=void 0;a--;)if(o=u.get(a),o[1].type===`lineEnding`||o[1].type===`lineEndingBlank`)o[0]===`enter`&&(i&&(u.get(i)[1].type=`lineEndingBlank`),o[1].type=`lineEnding`,i=a);else if(!(o[1].type===`linePrefix`||o[1].type===`listItemIndent`))break;i&&(r[1].end={...u.get(i)[1].start},s=u.slice(i,n),s.unshift(r),u.splice(i,n-i+1,s))}}return ka(e,0,1/0,u.slice(0)),!l}function Mo(e,t){let n=e.get(t)[1],r=e.get(t)[2],i=t-1,a=[],o=n._tokenizer;o||(o=r.parser[n.contentType](n.start),n._contentTypeTextTrailing&&(o._contentTypeTextTrailing=!0));let s=o.events,c=[],l={},u,d,f=-1,p=n,m=0,h=0,g=[h];for(;p;){for(;e.get(++i)[1]!==p;);a.push(i),p._tokenizer||(u=r.sliceStream(p),p.next||u.push(null),d&&o.defineSkip(p.start),p._isInFirstContentOfListItem&&(o._gfmTasklistFirstContentOfListItem=!0),o.write(u),p._isInFirstContentOfListItem&&(o._gfmTasklistFirstContentOfListItem=void 0)),d=p,p=p.next}for(p=n;++f<s.length;)s[f][0]===`exit`&&s[f-1][0]===`enter`&&s[f][1].type===s[f-1][1].type&&s[f][1].start.line!==s[f][1].end.line&&(h=f+1,g.push(h),p._tokenizer=void 0,p.previous=void 0,p=p.next);for(o.events=[],p?(p._tokenizer=void 0,p.previous=void 0):g.pop(),f=g.length;f--;){let t=s.slice(g[f],g[f+1]),n=a.pop();c.push([n,n+t.length-1]),e.splice(n,2,t)}for(c.reverse(),f=-1;++f<c.length;)l[m+c[f][0]]=m+c[f][1],m+=c[f][1]-c[f][0]-1;return l}var No={resolve:Fo,tokenize:Io},Po={partial:!0,tokenize:Lo};function Fo(e){return jo(e),e}function Io(e,t){let n;return r;function r(t){return e.enter(`content`),n=e.enter(`chunkContent`,{contentType:`content`}),i(t)}function i(t){return t===null?a(t):z(t)?e.check(Po,o,a)(t):(e.consume(t),i)}function a(n){return e.exit(`chunkContent`),e.exit(`content`),t(n)}function o(t){return e.consume(t),e.exit(`chunkContent`),n.next=e.enter(`chunkContent`,{contentType:`content`,previous:n}),n=n.next,i}}function Lo(e,t,n){let r=this;return i;function i(t){return e.exit(`chunkContent`),e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),H(e,a,`linePrefix`)}function a(i){if(i===null||z(i))return n(i);let a=r.events[r.events.length-1];return!r.parser.constructs.disable.null.includes(`codeIndented`)&&a&&a[1].type===`linePrefix`&&a[2].sliceSerialize(a[1],!0).length>=4?t(i):e.interrupt(r.parser.constructs.flow,n,t)(i)}}function Ro(e,t,n,r,i,a,o,s,c){let l=c||1/0,u=0;return d;function d(t){return t===60?(e.enter(r),e.enter(i),e.enter(a),e.consume(t),e.exit(a),f):t===null||t===32||t===41||Ba(t)?n(t):(e.enter(r),e.enter(o),e.enter(s),e.enter(`chunkString`,{contentType:`string`}),h(t))}function f(n){return n===62?(e.enter(a),e.consume(n),e.exit(a),e.exit(i),e.exit(r),t):(e.enter(s),e.enter(`chunkString`,{contentType:`string`}),p(n))}function p(t){return t===62?(e.exit(`chunkString`),e.exit(s),f(t)):t===null||t===60||z(t)?n(t):(e.consume(t),t===92?m:p)}function m(t){return t===60||t===62||t===92?(e.consume(t),p):p(t)}function h(i){return!u&&(i===null||i===41||B(i))?(e.exit(`chunkString`),e.exit(s),e.exit(o),e.exit(r),t(i)):u<l&&i===40?(e.consume(i),u++,h):i===41?(e.consume(i),u--,h):i===null||i===32||i===40||Ba(i)?n(i):(e.consume(i),i===92?g:h)}function g(t){return t===40||t===41||t===92?(e.consume(t),h):h(t)}}function zo(e,t,n,r,i,a){let o=this,s=0,c;return l;function l(t){return e.enter(r),e.enter(i),e.consume(t),e.exit(i),e.enter(a),u}function u(l){return s>999||l===null||l===91||l===93&&!c||l===94&&!s&&`_hiddenFootnoteSupport`in o.parser.constructs?n(l):l===93?(e.exit(a),e.enter(i),e.consume(l),e.exit(i),e.exit(r),t):z(l)?(e.enter(`lineEnding`),e.consume(l),e.exit(`lineEnding`),u):(e.enter(`chunkString`,{contentType:`string`}),d(l))}function d(t){return t===null||t===91||t===93||z(t)||s++>999?(e.exit(`chunkString`),u(t)):(e.consume(t),c||=!V(t),t===92?f:d)}function f(t){return t===91||t===92||t===93?(e.consume(t),s++,d):d(t)}}function Bo(e,t,n,r,i,a){let o;return s;function s(t){return t===34||t===39||t===40?(e.enter(r),e.enter(i),e.consume(t),e.exit(i),o=t===40?41:t,c):n(t)}function c(n){return n===o?(e.enter(i),e.consume(n),e.exit(i),e.exit(r),t):(e.enter(a),l(n))}function l(t){return t===o?(e.exit(a),c(o)):t===null?n(t):z(t)?(e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),H(e,l,`linePrefix`)):(e.enter(`chunkString`,{contentType:`string`}),u(t))}function u(t){return t===o||t===null||z(t)?(e.exit(`chunkString`),l(t)):(e.consume(t),t===92?d:u)}function d(t){return t===o||t===92?(e.consume(t),u):u(t)}}function Vo(e,t){let n;return r;function r(i){return z(i)?(e.enter(`lineEnding`),e.consume(i),e.exit(`lineEnding`),n=!0,r):V(i)?H(e,r,n?`linePrefix`:`lineSuffix`)(i):t(i)}}var Ho={name:`definition`,tokenize:Wo},Uo={partial:!0,tokenize:Go};function Wo(e,t,n){let r=this,i;return a;function a(t){return e.enter(`definition`),o(t)}function o(t){return zo.call(r,e,s,n,`definitionLabel`,`definitionLabelMarker`,`definitionLabelString`)(t)}function s(t){return i=Ia(r.sliceSerialize(r.events[r.events.length-1][1]).slice(1,-1)),t===58?(e.enter(`definitionMarker`),e.consume(t),e.exit(`definitionMarker`),c):n(t)}function c(t){return B(t)?Vo(e,l)(t):l(t)}function l(t){return Ro(e,u,n,`definitionDestination`,`definitionDestinationLiteral`,`definitionDestinationLiteralMarker`,`definitionDestinationRaw`,`definitionDestinationString`)(t)}function u(t){return e.attempt(Uo,d,d)(t)}function d(t){return V(t)?H(e,f,`whitespace`)(t):f(t)}function f(a){return a===null||z(a)?(e.exit(`definition`),r.parser.defined.push(i),t(a)):n(a)}}function Go(e,t,n){return r;function r(t){return B(t)?Vo(e,i)(t):n(t)}function i(t){return Bo(e,a,n,`definitionTitle`,`definitionTitleMarker`,`definitionTitleString`)(t)}function a(t){return V(t)?H(e,o,`whitespace`)(t):o(t)}function o(e){return e===null||z(e)?t(e):n(e)}}var Ko={name:`hardBreakEscape`,tokenize:qo};function qo(e,t,n){return r;function r(t){return e.enter(`hardBreakEscape`),e.consume(t),i}function i(r){return z(r)?(e.exit(`hardBreakEscape`),t(r)):n(r)}}var Jo={name:`headingAtx`,resolve:Yo,tokenize:Xo};function Yo(e,t){let n=e.length-2,r=3,i,a;return e[r][1].type===`whitespace`&&(r+=2),n-2>r&&e[n][1].type===`whitespace`&&(n-=2),e[n][1].type===`atxHeadingSequence`&&(r===n-1||n-4>r&&e[n-2][1].type===`whitespace`)&&(n-=r+1===n?2:4),n>r&&(i={type:`atxHeadingText`,start:e[r][1].start,end:e[n][1].end},a={type:`chunkText`,start:e[r][1].start,end:e[n][1].end,contentType:`text`},ka(e,r,n-r+1,[[`enter`,i,t],[`enter`,a,t],[`exit`,a,t],[`exit`,i,t]])),e}function Xo(e,t,n){let r=0;return i;function i(t){return e.enter(`atxHeading`),a(t)}function a(t){return e.enter(`atxHeadingSequence`),o(t)}function o(t){return t===35&&r++<6?(e.consume(t),o):t===null||B(t)?(e.exit(`atxHeadingSequence`),s(t)):n(t)}function s(n){return n===35?(e.enter(`atxHeadingSequence`),c(n)):n===null||z(n)?(e.exit(`atxHeading`),t(n)):V(n)?H(e,s,`whitespace`)(n):(e.enter(`atxHeadingText`),l(n))}function c(t){return t===35?(e.consume(t),c):(e.exit(`atxHeadingSequence`),s(t))}function l(t){return t===null||t===35||B(t)?(e.exit(`atxHeadingText`),s(t)):(e.consume(t),l)}}var Zo=`address.article.aside.base.basefont.blockquote.body.caption.center.col.colgroup.dd.details.dialog.dir.div.dl.dt.fieldset.figcaption.figure.footer.form.frame.frameset.h1.h2.h3.h4.h5.h6.head.header.hr.html.iframe.legend.li.link.main.menu.menuitem.nav.noframes.ol.optgroup.option.p.param.search.section.summary.table.tbody.td.tfoot.th.thead.title.tr.track.ul`.split(`.`),Qo=[`pre`,`script`,`style`,`textarea`],$o={concrete:!0,name:`htmlFlow`,resolveTo:ns,tokenize:rs},es={partial:!0,tokenize:as},ts={partial:!0,tokenize:is};function ns(e){let t=e.length;for(;t--&&!(e[t][0]===`enter`&&e[t][1].type===`htmlFlow`););return t>1&&e[t-2][1].type===`linePrefix`&&(e[t][1].start=e[t-2][1].start,e[t+1][1].start=e[t-2][1].start,e.splice(t-2,2)),e}function rs(e,t,n){let r=this,i,a,o,s,c;return l;function l(e){return u(e)}function u(t){return e.enter(`htmlFlow`),e.enter(`htmlFlowData`),e.consume(t),d}function d(s){return s===33?(e.consume(s),f):s===47?(e.consume(s),a=!0,h):s===63?(e.consume(s),i=3,r.interrupt?t:k):La(s)?(e.consume(s),o=String.fromCharCode(s),g):n(s)}function f(a){return a===45?(e.consume(a),i=2,p):a===91?(e.consume(a),i=5,s=0,m):La(a)?(e.consume(a),i=4,r.interrupt?t:k):n(a)}function p(i){return i===45?(e.consume(i),r.interrupt?t:k):n(i)}function m(i){return i===`CDATA[`.charCodeAt(s++)?(e.consume(i),s===6?r.interrupt?t:D:m):n(i)}function h(t){return La(t)?(e.consume(t),o=String.fromCharCode(t),g):n(t)}function g(s){if(s===null||s===47||s===62||B(s)){let c=s===47,l=o.toLowerCase();return!c&&!a&&Qo.includes(l)?(i=1,r.interrupt?t(s):D(s)):Zo.includes(o.toLowerCase())?(i=6,c?(e.consume(s),_):r.interrupt?t(s):D(s)):(i=7,r.interrupt&&!r.parser.lazy[r.now().line]?n(s):a?v(s):y(s))}return s===45||Ra(s)?(e.consume(s),o+=String.fromCharCode(s),g):n(s)}function _(i){return i===62?(e.consume(i),r.interrupt?t:D):n(i)}function v(t){return V(t)?(e.consume(t),v):E(t)}function y(t){return t===47?(e.consume(t),E):t===58||t===95||La(t)?(e.consume(t),b):V(t)?(e.consume(t),y):E(t)}function b(t){return t===45||t===46||t===58||t===95||Ra(t)?(e.consume(t),b):x(t)}function x(t){return t===61?(e.consume(t),S):V(t)?(e.consume(t),x):y(t)}function S(t){return t===null||t===60||t===61||t===62||t===96?n(t):t===34||t===39?(e.consume(t),c=t,C):V(t)?(e.consume(t),S):w(t)}function C(t){return t===c?(e.consume(t),c=null,T):t===null||z(t)?n(t):(e.consume(t),C)}function w(t){return t===null||t===34||t===39||t===47||t===60||t===61||t===62||t===96||B(t)?x(t):(e.consume(t),w)}function T(e){return e===47||e===62||V(e)?y(e):n(e)}function E(t){return t===62?(e.consume(t),ee):n(t)}function ee(t){return t===null||z(t)?D(t):V(t)?(e.consume(t),ee):n(t)}function D(t){return t===45&&i===2?(e.consume(t),re):t===60&&i===1?(e.consume(t),ie):t===62&&i===4?(e.consume(t),A):t===63&&i===3?(e.consume(t),k):t===93&&i===5?(e.consume(t),oe):z(t)&&(i===6||i===7)?(e.exit(`htmlFlowData`),e.check(es,se,te)(t)):t===null||z(t)?(e.exit(`htmlFlowData`),te(t)):(e.consume(t),D)}function te(t){return e.check(ts,O,se)(t)}function O(t){return e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),ne}function ne(t){return t===null||z(t)?te(t):(e.enter(`htmlFlowData`),D(t))}function re(t){return t===45?(e.consume(t),k):D(t)}function ie(t){return t===47?(e.consume(t),o=``,ae):D(t)}function ae(t){if(t===62){let n=o.toLowerCase();return Qo.includes(n)?(e.consume(t),A):D(t)}return La(t)&&o.length<8?(e.consume(t),o+=String.fromCharCode(t),ae):D(t)}function oe(t){return t===93?(e.consume(t),k):D(t)}function k(t){return t===62?(e.consume(t),A):t===45&&i===2?(e.consume(t),k):D(t)}function A(t){return t===null||z(t)?(e.exit(`htmlFlowData`),se(t)):(e.consume(t),A)}function se(n){return e.exit(`htmlFlow`),t(n)}}function is(e,t,n){let r=this;return i;function i(t){return z(t)?(e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),a):n(t)}function a(e){return r.parser.lazy[r.now().line]?n(e):t(e)}}function as(e,t,n){return r;function r(r){return e.enter(`lineEnding`),e.consume(r),e.exit(`lineEnding`),e.attempt(co,t,n)}}var os={name:`htmlText`,tokenize:ss};function ss(e,t,n){let r=this,i,a,o;return s;function s(t){return e.enter(`htmlText`),e.enter(`htmlTextData`),e.consume(t),c}function c(t){return t===33?(e.consume(t),l):t===47?(e.consume(t),x):t===63?(e.consume(t),y):La(t)?(e.consume(t),w):n(t)}function l(t){return t===45?(e.consume(t),u):t===91?(e.consume(t),a=0,m):La(t)?(e.consume(t),v):n(t)}function u(t){return t===45?(e.consume(t),p):n(t)}function d(t){return t===null?n(t):t===45?(e.consume(t),f):z(t)?(o=d,ie(t)):(e.consume(t),d)}function f(t){return t===45?(e.consume(t),p):d(t)}function p(e){return e===62?re(e):e===45?f(e):d(e)}function m(t){return t===`CDATA[`.charCodeAt(a++)?(e.consume(t),a===6?h:m):n(t)}function h(t){return t===null?n(t):t===93?(e.consume(t),g):z(t)?(o=h,ie(t)):(e.consume(t),h)}function g(t){return t===93?(e.consume(t),_):h(t)}function _(t){return t===62?re(t):t===93?(e.consume(t),_):h(t)}function v(t){return t===null||t===62?re(t):z(t)?(o=v,ie(t)):(e.consume(t),v)}function y(t){return t===null?n(t):t===63?(e.consume(t),b):z(t)?(o=y,ie(t)):(e.consume(t),y)}function b(e){return e===62?re(e):y(e)}function x(t){return La(t)?(e.consume(t),S):n(t)}function S(t){return t===45||Ra(t)?(e.consume(t),S):C(t)}function C(t){return z(t)?(o=C,ie(t)):V(t)?(e.consume(t),C):re(t)}function w(t){return t===45||Ra(t)?(e.consume(t),w):t===47||t===62||B(t)?T(t):n(t)}function T(t){return t===47?(e.consume(t),re):t===58||t===95||La(t)?(e.consume(t),E):z(t)?(o=T,ie(t)):V(t)?(e.consume(t),T):re(t)}function E(t){return t===45||t===46||t===58||t===95||Ra(t)?(e.consume(t),E):ee(t)}function ee(t){return t===61?(e.consume(t),D):z(t)?(o=ee,ie(t)):V(t)?(e.consume(t),ee):T(t)}function D(t){return t===null||t===60||t===61||t===62||t===96?n(t):t===34||t===39?(e.consume(t),i=t,te):z(t)?(o=D,ie(t)):V(t)?(e.consume(t),D):(e.consume(t),O)}function te(t){return t===i?(e.consume(t),i=void 0,ne):t===null?n(t):z(t)?(o=te,ie(t)):(e.consume(t),te)}function O(t){return t===null||t===34||t===39||t===60||t===61||t===96?n(t):t===47||t===62||B(t)?T(t):(e.consume(t),O)}function ne(e){return e===47||e===62||B(e)?T(e):n(e)}function re(r){return r===62?(e.consume(r),e.exit(`htmlTextData`),e.exit(`htmlText`),t):n(r)}function ie(t){return e.exit(`htmlTextData`),e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),ae}function ae(t){return V(t)?H(e,oe,`linePrefix`,r.parser.constructs.disable.null.includes(`codeIndented`)?void 0:4)(t):oe(t)}function oe(t){return e.enter(`htmlTextData`),o(t)}}var cs={name:`labelEnd`,resolveAll:fs,resolveTo:ps,tokenize:ms},ls={tokenize:hs},us={tokenize:gs},ds={tokenize:_s};function fs(e){let t=-1,n=[];for(;++t<e.length;){let r=e[t][1];if(n.push(e[t]),r.type===`labelImage`||r.type===`labelLink`||r.type===`labelEnd`){let e=r.type===`labelImage`?4:2;r.type=`data`,t+=e}}return e.length!==n.length&&ka(e,0,e.length,n),e}function ps(e,t){let n=e.length,r=0,i,a,o,s;for(;n--;)if(i=e[n][1],a){if(i.type===`link`||i.type===`labelLink`&&i._inactive)break;e[n][0]===`enter`&&i.type===`labelLink`&&(i._inactive=!0)}else if(o){if(e[n][0]===`enter`&&(i.type===`labelImage`||i.type===`labelLink`)&&!i._balanced&&(a=n,i.type!==`labelLink`)){r=2;break}}else i.type===`labelEnd`&&(o=n);let c={type:e[a][1].type===`labelLink`?`link`:`image`,start:{...e[a][1].start},end:{...e[e.length-1][1].end}},l={type:`label`,start:{...e[a][1].start},end:{...e[o][1].end}},u={type:`labelText`,start:{...e[a+r+2][1].end},end:{...e[o-2][1].start}};return s=[[`enter`,c,t],[`enter`,l,t]],s=Aa(s,e.slice(a+1,a+r+3)),s=Aa(s,[[`enter`,u,t]]),s=Aa(s,to(t.parser.constructs.insideSpan.null,e.slice(a+r+4,o-3),t)),s=Aa(s,[[`exit`,u,t],e[o-2],e[o-1],[`exit`,l,t]]),s=Aa(s,e.slice(o+1)),s=Aa(s,[[`exit`,c,t]]),ka(e,a,e.length,s),e}function ms(e,t,n){let r=this,i=r.events.length,a,o;for(;i--;)if((r.events[i][1].type===`labelImage`||r.events[i][1].type===`labelLink`)&&!r.events[i][1]._balanced){a=r.events[i][1];break}return s;function s(t){return a?a._inactive?d(t):(o=r.parser.defined.includes(Ia(r.sliceSerialize({start:a.end,end:r.now()}))),e.enter(`labelEnd`),e.enter(`labelMarker`),e.consume(t),e.exit(`labelMarker`),e.exit(`labelEnd`),c):n(t)}function c(t){return t===40?e.attempt(ls,u,o?u:d)(t):t===91?e.attempt(us,u,o?l:d)(t):o?u(t):d(t)}function l(t){return e.attempt(ds,u,d)(t)}function u(e){return t(e)}function d(e){return a._balanced=!0,n(e)}}function hs(e,t,n){return r;function r(t){return e.enter(`resource`),e.enter(`resourceMarker`),e.consume(t),e.exit(`resourceMarker`),i}function i(t){return B(t)?Vo(e,a)(t):a(t)}function a(t){return t===41?u(t):Ro(e,o,s,`resourceDestination`,`resourceDestinationLiteral`,`resourceDestinationLiteralMarker`,`resourceDestinationRaw`,`resourceDestinationString`,32)(t)}function o(t){return B(t)?Vo(e,c)(t):u(t)}function s(e){return n(e)}function c(t){return t===34||t===39||t===40?Bo(e,l,n,`resourceTitle`,`resourceTitleMarker`,`resourceTitleString`)(t):u(t)}function l(t){return B(t)?Vo(e,u)(t):u(t)}function u(r){return r===41?(e.enter(`resourceMarker`),e.consume(r),e.exit(`resourceMarker`),e.exit(`resource`),t):n(r)}}function gs(e,t,n){let r=this;return i;function i(t){return zo.call(r,e,a,o,`reference`,`referenceMarker`,`referenceString`)(t)}function a(e){return r.parser.defined.includes(Ia(r.sliceSerialize(r.events[r.events.length-1][1]).slice(1,-1)))?t(e):n(e)}function o(e){return n(e)}}function _s(e,t,n){return r;function r(t){return e.enter(`reference`),e.enter(`referenceMarker`),e.consume(t),e.exit(`referenceMarker`),i}function i(r){return r===93?(e.enter(`referenceMarker`),e.consume(r),e.exit(`referenceMarker`),e.exit(`reference`),t):n(r)}}var vs={name:`labelStartImage`,resolveAll:cs.resolveAll,tokenize:ys};function ys(e,t,n){let r=this;return i;function i(t){return e.enter(`labelImage`),e.enter(`labelImageMarker`),e.consume(t),e.exit(`labelImageMarker`),a}function a(t){return t===91?(e.enter(`labelMarker`),e.consume(t),e.exit(`labelMarker`),e.exit(`labelImage`),o):n(t)}function o(e){return e===94&&`_hiddenFootnoteSupport`in r.parser.constructs?n(e):t(e)}}var bs={name:`labelStartLink`,resolveAll:cs.resolveAll,tokenize:xs};function xs(e,t,n){let r=this;return i;function i(t){return e.enter(`labelLink`),e.enter(`labelMarker`),e.consume(t),e.exit(`labelMarker`),e.exit(`labelLink`),a}function a(e){return e===94&&`_hiddenFootnoteSupport`in r.parser.constructs?n(e):t(e)}}var Ss={name:`lineEnding`,tokenize:Cs};function Cs(e,t){return n;function n(n){return e.enter(`lineEnding`),e.consume(n),e.exit(`lineEnding`),H(e,t,`linePrefix`)}}var ws={name:`thematicBreak`,tokenize:Ts};function Ts(e,t,n){let r=0,i;return a;function a(t){return e.enter(`thematicBreak`),o(t)}function o(e){return i=e,s(e)}function s(a){return a===i?(e.enter(`thematicBreakSequence`),c(a)):r>=3&&(a===null||z(a))?(e.exit(`thematicBreak`),t(a)):n(a)}function c(t){return t===i?(e.consume(t),r++,c):(e.exit(`thematicBreakSequence`),V(t)?H(e,s,`whitespace`)(t):s(t))}}var Es={continuation:{tokenize:As},exit:Ms,name:`list`,tokenize:ks},Ds={partial:!0,tokenize:Ns},Os={partial:!0,tokenize:js};function ks(e,t,n){let r=this,i=r.events[r.events.length-1],a=i&&i[1].type===`linePrefix`?i[2].sliceSerialize(i[1],!0).length:0,o=0;return s;function s(t){let i=r.containerState.type||(t===42||t===43||t===45?`listUnordered`:`listOrdered`);if(i===`listUnordered`?!r.containerState.marker||t===r.containerState.marker:Va(t)){if(r.containerState.type||(r.containerState.type=i,e.enter(i,{_container:!0})),i===`listUnordered`)return e.enter(`listItemPrefix`),t===42||t===45?e.check(ws,n,l)(t):l(t);if(!r.interrupt||t===49)return e.enter(`listItemPrefix`),e.enter(`listItemValue`),c(t)}return n(t)}function c(t){return Va(t)&&++o<10?(e.consume(t),c):(!r.interrupt||o<2)&&(r.containerState.marker?t===r.containerState.marker:t===41||t===46)?(e.exit(`listItemValue`),l(t)):n(t)}function l(t){return e.enter(`listItemMarker`),e.consume(t),e.exit(`listItemMarker`),r.containerState.marker=r.containerState.marker||t,e.check(co,r.interrupt?n:u,e.attempt(Ds,f,d))}function u(e){return r.containerState.initialBlankLine=!0,a++,f(e)}function d(t){return V(t)?(e.enter(`listItemPrefixWhitespace`),e.consume(t),e.exit(`listItemPrefixWhitespace`),f):n(t)}function f(n){return r.containerState.size=a+r.sliceSerialize(e.exit(`listItemPrefix`),!0).length,t(n)}}function As(e,t,n){let r=this;return r.containerState._closeFlow=void 0,e.check(co,i,a);function i(n){return r.containerState.furtherBlankLines=r.containerState.furtherBlankLines||r.containerState.initialBlankLine,H(e,t,`listItemIndent`,r.containerState.size+1)(n)}function a(n){return r.containerState.furtherBlankLines||!V(n)?(r.containerState.furtherBlankLines=void 0,r.containerState.initialBlankLine=void 0,o(n)):(r.containerState.furtherBlankLines=void 0,r.containerState.initialBlankLine=void 0,e.attempt(Os,t,o)(n))}function o(i){return r.containerState._closeFlow=!0,r.interrupt=void 0,H(e,e.attempt(Es,t,n),`linePrefix`,r.parser.constructs.disable.null.includes(`codeIndented`)?void 0:4)(i)}}function js(e,t,n){let r=this;return H(e,i,`listItemIndent`,r.containerState.size+1);function i(e){let i=r.events[r.events.length-1];return i&&i[1].type===`listItemIndent`&&i[2].sliceSerialize(i[1],!0).length===r.containerState.size?t(e):n(e)}}function Ms(e){e.exit(this.containerState.type)}function Ns(e,t,n){let r=this;return H(e,i,`listItemPrefixWhitespace`,r.parser.constructs.disable.null.includes(`codeIndented`)?void 0:5);function i(e){let i=r.events[r.events.length-1];return!V(e)&&i&&i[1].type===`listItemPrefixWhitespace`?t(e):n(e)}}var Ps={name:`setextUnderline`,resolveTo:Fs,tokenize:Is};function Fs(e,t){let n=e.length,r,i,a;for(;n--;)if(e[n][0]===`enter`){if(e[n][1].type===`content`){r=n;break}e[n][1].type===`paragraph`&&(i=n)}else e[n][1].type===`content`&&e.splice(n,1),!a&&e[n][1].type===`definition`&&(a=n);let o={type:`setextHeading`,start:{...e[r][1].start},end:{...e[e.length-1][1].end}};return e[i][1].type=`setextHeadingText`,a?(e.splice(i,0,[`enter`,o,t]),e.splice(a+1,0,[`exit`,e[r][1],t]),e[r][1].end={...e[a][1].end}):e[r][1]=o,e.push([`exit`,o,t]),e}function Is(e,t,n){let r=this,i;return a;function a(t){let a=r.events.length,s;for(;a--;)if(r.events[a][1].type!==`lineEnding`&&r.events[a][1].type!==`linePrefix`&&r.events[a][1].type!==`content`){s=r.events[a][1].type===`paragraph`;break}return!r.parser.lazy[r.now().line]&&(r.interrupt||s)?(e.enter(`setextHeadingLine`),i=t,o(t)):n(t)}function o(t){return e.enter(`setextHeadingLineSequence`),s(t)}function s(t){return t===i?(e.consume(t),s):(e.exit(`setextHeadingLineSequence`),V(t)?H(e,c,`lineSuffix`)(t):c(t))}function c(r){return r===null||z(r)?(e.exit(`setextHeadingLine`),t(r)):n(r)}}var Ls={tokenize:Rs};function Rs(e){let t=this,n=e.attempt(co,r,e.attempt(this.parser.constructs.flowInitial,i,H(e,e.attempt(this.parser.constructs.flow,i,e.attempt(No,i)),`linePrefix`)));return n;function r(r){if(r===null){e.consume(r);return}return e.enter(`lineEndingBlank`),e.consume(r),e.exit(`lineEndingBlank`),t.currentConstruct=void 0,n}function i(r){if(r===null){e.consume(r);return}return e.enter(`lineEnding`),e.consume(r),e.exit(`lineEnding`),t.currentConstruct=void 0,n}}var zs={resolveAll:Us()},Bs=Hs(`string`),Vs=Hs(`text`);function Hs(e){return{resolveAll:Us(e===`text`?Ws:void 0),tokenize:t};function t(t){let n=this,r=this.parser.constructs[e],i=t.attempt(r,a,o);return a;function a(e){return c(e)?i(e):o(e)}function o(e){if(e===null){t.consume(e);return}return t.enter(`data`),t.consume(e),s}function s(e){return c(e)?(t.exit(`data`),i(e)):(t.consume(e),s)}function c(e){if(e===null)return!0;let t=r[e],i=-1;if(t)for(;++i<t.length;){let e=t[i];if(!e.previous||e.previous.call(n,n.previous))return!0}return!1}}}function Us(e){return t;function t(t,n){let r=-1,i;for(;++r<=t.length;)i===void 0?t[r]&&t[r][1].type===`data`&&(i=r,r++):(!t[r]||t[r][1].type!==`data`)&&(r!==i+2&&(t[i][1].end=t[r-1][1].end,t.splice(i+2,r-i-2),r=i+2),i=void 0);return e?e(t,n):t}}function Ws(e,t){let n=0;for(;++n<=e.length;)if((n===e.length||e[n][1].type===`lineEnding`)&&e[n-1][1].type===`data`){let r=e[n-1][1],i=t.sliceStream(r),a=i.length,o=-1,s=0,c;for(;a--;){let e=i[a];if(typeof e==`string`){for(o=e.length;e.charCodeAt(o-1)===32;)s++,o--;if(o)break;o=-1}else if(e===-2)c=!0,s++;else if(e!==-1){a++;break}}if(t._contentTypeTextTrailing&&n===e.length&&(s=0),s){let i={type:n===e.length||c||s<2?`lineSuffix`:`hardBreakTrailing`,start:{_bufferIndex:a?o:r.start._bufferIndex+o,_index:r.start._index+a,line:r.end.line,column:r.end.column-s,offset:r.end.offset-s},end:{...r.end}};r.end={...i.start},r.start.offset===r.end.offset?Object.assign(r,i):(e.splice(n,0,[`enter`,i,t],[`exit`,i,t]),n+=2)}n++}return e}var Gs=s({attentionMarkers:()=>$s,contentInitial:()=>qs,disable:()=>ec,document:()=>Ks,flow:()=>Ys,flowInitial:()=>Js,insideSpan:()=>Qs,string:()=>Xs,text:()=>Zs}),Ks={42:Es,43:Es,45:Es,48:Es,49:Es,50:Es,51:Es,52:Es,53:Es,54:Es,55:Es,56:Es,57:Es,62:U},qs={91:Ho},Js={[-2]:xo,[-1]:xo,32:xo},Ys={35:Jo,42:ws,45:[Ps,ws],60:$o,61:Ps,95:ws,96:vo,126:vo},Xs={38:ho,92:po},Zs={[-5]:Ss,[-4]:Ss,[-3]:Ss,33:vs,38:ho,42:no,60:[oo,os],91:bs,92:[Ko,po],93:cs,95:no,96:To},Qs={null:[no,zs]},$s={null:[42,95]},ec={null:[]};function tc(e,t,n){let r={_bufferIndex:-1,_index:0,line:n&&n.line||1,column:n&&n.column||1,offset:n&&n.offset||0},i={},a=[],o=[],s=[],c={attempt:C(x),check:C(S),consume:v,enter:y,exit:b,interrupt:C(S,{interrupt:!0})},l={code:null,containerState:{},defineSkip:h,events:[],now:m,parser:e,previous:null,sliceSerialize:f,sliceStream:p,write:d},u=t.tokenize.call(l,c);return t.resolveAll&&a.push(t),l;function d(e){return o=Aa(o,e),g(),o[o.length-1]===null?(w(t,0),l.events=to(a,l.events,l),l.events):[]}function f(e,t){return rc(p(e),t)}function p(e){return nc(o,e)}function m(){let{_bufferIndex:e,_index:t,line:n,column:i,offset:a}=r;return{_bufferIndex:e,_index:t,line:n,column:i,offset:a}}function h(e){i[e.line]=e.column,E()}function g(){let e;for(;r._index<o.length;){let t=o[r._index];if(typeof t==`string`)for(e=r._index,r._bufferIndex<0&&(r._bufferIndex=0);r._index===e&&r._bufferIndex<t.length;)_(t.charCodeAt(r._bufferIndex));else _(t)}}function _(e){u=u(e)}function v(e){z(e)?(r.line++,r.column=1,r.offset+=e===-3?2:1,E()):e!==-1&&(r.column++,r.offset++),r._bufferIndex<0?r._index++:(r._bufferIndex++,r._bufferIndex===o[r._index].length&&(r._bufferIndex=-1,r._index++)),l.previous=e}function y(e,t){let n=t||{};return n.type=e,n.start=m(),l.events.push([`enter`,n,l]),s.push(n),n}function b(e){let t=s.pop();return t.end=m(),l.events.push([`exit`,t,l]),t}function x(e,t){w(e,t.from)}function S(e,t){t.restore()}function C(e,t){return n;function n(n,r,i){let a,o,s,u;return Array.isArray(n)?f(n):`tokenize`in n?f([n]):d(n);function d(e){return t;function t(t){let n=t!==null&&e[t],r=t!==null&&e.null;return f([...Array.isArray(n)?n:n?[n]:[],...Array.isArray(r)?r:r?[r]:[]])(t)}}function f(e){return a=e,o=0,e.length===0?i:p(e[o])}function p(e){return n;function n(n){return u=T(),s=e,e.partial||(l.currentConstruct=e),e.name&&l.parser.constructs.disable.null.includes(e.name)?h(n):e.tokenize.call(t?Object.assign(Object.create(l),t):l,c,m,h)(n)}}function m(t){return e(s,u),r}function h(e){return u.restore(),++o<a.length?p(a[o]):i}}}function w(e,t){e.resolveAll&&!a.includes(e)&&a.push(e),e.resolve&&ka(l.events,t,l.events.length-t,e.resolve(l.events.slice(t),l)),e.resolveTo&&(l.events=e.resolveTo(l.events,l))}function T(){let e=m(),t=l.previous,n=l.currentConstruct,i=l.events.length,a=Array.from(s);return{from:i,restore:o};function o(){r=e,l.previous=t,l.currentConstruct=n,l.events.length=i,s=a,E()}}function E(){r.line in i&&r.column<2&&(r.column=i[r.line],r.offset+=i[r.line]-1)}}function nc(e,t){let n=t.start._index,r=t.start._bufferIndex,i=t.end._index,a=t.end._bufferIndex,o;if(n===i)o=[e[n].slice(r,a)];else{if(o=e.slice(n,i),r>-1){let e=o[0];typeof e==`string`?o[0]=e.slice(r):o.shift()}a>0&&o.push(e[i].slice(0,a))}return o}function rc(e,t){let n=-1,r=[],i;for(;++n<e.length;){let a=e[n],o;if(typeof a==`string`)o=a;else switch(a){case-5:o=`\r`;break;case-4:o=`
`;break;case-3:o=`\r
`;break;case-2:o=t?` `:`	`;break;case-1:if(!t&&i)continue;o=` `;break;default:o=String.fromCharCode(a)}i=a===-2,r.push(o)}return r.join(``)}function ic(e){let t={constructs:Ma([Gs,...(e||{}).extensions||[]]),content:n(Ja),defined:[],document:n(Xa),flow:n(Ls),lazy:{},string:n(Bs),text:n(Vs)};return t;function n(e){return n;function n(n){return tc(t,e,n)}}}function ac(e){for(;!jo(e););return e}var oc=/[\0\t\n\r]/g;function sc(){let e=1,t=``,n=!0,r;return i;function i(i,a,o){let s=[],c,l,u,d,f;for(i=t+(typeof i==`string`?i.toString():new TextDecoder(a||void 0).decode(i)),u=0,t=``,n&&=(i.charCodeAt(0)===65279&&u++,void 0);u<i.length;){if(oc.lastIndex=u,c=oc.exec(i),d=c&&c.index!==void 0?c.index:i.length,f=i.charCodeAt(d),!c){t=i.slice(u);break}if(f===10&&u===d&&r)s.push(-3),r=void 0;else switch(r&&=(s.push(-5),void 0),u<d&&(s.push(i.slice(u,d)),e+=d-u),f){case 0:s.push(65533),e++;break;case 9:for(l=Math.ceil(e/4)*4,s.push(-2);e++<l;)s.push(-1);break;case 10:s.push(-4),e=1;break;default:r=!0,e=1}u=d+1}return o&&(r&&s.push(-5),t&&s.push(t),s.push(null)),s}}var cc=/\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;function lc(e){return e.replace(cc,uc)}function uc(e,t,n){if(t)return t;if(n.charCodeAt(0)===35){let e=n.charCodeAt(1),t=e===120||e===88;return Fa(n.slice(t?2:1),t?16:10)}return Oa(n)||e}var dc={}.hasOwnProperty;function fc(e,t,n){return t&&typeof t==`object`&&(n=t,t=void 0),pc(n)(ac(ic(n).document().write(sc()(e,t,!0))))}function pc(e){let t={transforms:[],canContainEols:[`emphasis`,`fragment`,`heading`,`paragraph`,`strong`],enter:{autolink:a(Ce),autolinkProtocol:T,autolinkEmail:T,atxHeading:a(ye),blockQuote:a(me),characterEscape:T,characterReference:T,codeFenced:a(he),codeFencedFenceInfo:o,codeFencedFenceMeta:o,codeIndented:a(he,o),codeText:a(ge,o),codeTextData:T,data:T,codeFlowValue:T,definition:a(_e),definitionDestinationString:o,definitionLabelString:o,definitionTitleString:o,emphasis:a(ve),hardBreakEscape:a(be),hardBreakTrailing:a(be),htmlFlow:a(xe,o),htmlFlowData:T,htmlText:a(xe,o),htmlTextData:T,image:a(Se),label:o,link:a(Ce),listItem:a(Te),listItemValue:f,listOrdered:a(we,d),listUnordered:a(we),paragraph:a(Ee),reference:ce,referenceString:o,resourceDestinationString:o,resourceTitleString:o,setextHeading:a(ye),strong:a(De),thematicBreak:a(ke)},exit:{atxHeading:c(),atxHeadingSequence:x,autolink:c(),autolinkEmail:pe,autolinkProtocol:fe,blockQuote:c(),characterEscapeValue:E,characterReferenceMarkerHexadecimal:ue,characterReferenceMarkerNumeric:ue,characterReferenceValue:de,characterReference:j,codeFenced:c(g),codeFencedFence:h,codeFencedFenceInfo:p,codeFencedFenceMeta:m,codeFlowValue:E,codeIndented:c(_),codeText:c(ne),codeTextData:E,data:E,definition:c(),definitionDestinationString:b,definitionLabelString:v,definitionTitleString:y,emphasis:c(),hardBreakEscape:c(D),hardBreakTrailing:c(D),htmlFlow:c(te),htmlFlowData:E,htmlText:c(O),htmlTextData:E,image:c(ie),label:oe,labelText:ae,lineEnding:ee,link:c(re),listItem:c(),listOrdered:c(),listUnordered:c(),paragraph:c(),referenceString:le,resourceDestinationString:k,resourceTitleString:A,resource:se,setextHeading:c(w),setextHeadingLineSequence:C,setextHeadingText:S,strong:c(),thematicBreak:c()}};hc(t,(e||{}).mdastExtensions||[]);let n={};return r;function r(e){let r={type:`root`,children:[]},a={stack:[r],tokenStack:[],config:t,enter:s,exit:l,buffer:o,resume:u,data:n},c=[],d=-1;for(;++d<e.length;)(e[d][1].type===`listOrdered`||e[d][1].type===`listUnordered`)&&(e[d][0]===`enter`?c.push(d):d=i(e,c.pop(),d));for(d=-1;++d<e.length;){let n=t[e[d][0]];dc.call(n,e[d][1].type)&&n[e[d][1].type].call(Object.assign({sliceSerialize:e[d][2].sliceSerialize},a),e[d][1])}if(a.tokenStack.length>0){let e=a.tokenStack[a.tokenStack.length-1];(e[1]||_c).call(a,void 0,e[0])}for(r.position={start:mc(e.length>0?e[0][1].start:{line:1,column:1,offset:0}),end:mc(e.length>0?e[e.length-2][1].end:{line:1,column:1,offset:0})},d=-1;++d<t.transforms.length;)r=t.transforms[d](r)||r;return r}function i(e,t,n){let r=t-1,i=-1,a=!1,o,s,c,l;for(;++r<=n;){let t=e[r];switch(t[1].type){case`listUnordered`:case`listOrdered`:case`blockQuote`:t[0]===`enter`?i++:i--,l=void 0;break;case`lineEndingBlank`:t[0]===`enter`&&(o&&!l&&!i&&!c&&(c=r),l=void 0);break;case`linePrefix`:case`listItemValue`:case`listItemMarker`:case`listItemPrefix`:case`listItemPrefixWhitespace`:break;default:l=void 0}if(!i&&t[0]===`enter`&&t[1].type===`listItemPrefix`||i===-1&&t[0]===`exit`&&(t[1].type===`listUnordered`||t[1].type===`listOrdered`)){if(o){let i=r;for(s=void 0;i--;){let t=e[i];if(t[1].type===`lineEnding`||t[1].type===`lineEndingBlank`){if(t[0]===`exit`)continue;s&&(e[s][1].type=`lineEndingBlank`,a=!0),t[1].type=`lineEnding`,s=i}else if(!(t[1].type===`linePrefix`||t[1].type===`blockQuotePrefix`||t[1].type===`blockQuotePrefixWhitespace`||t[1].type===`blockQuoteMarker`||t[1].type===`listItemIndent`))break}c&&(!s||c<s)&&(o._spread=!0),o.end=Object.assign({},s?e[s][1].start:t[1].end),e.splice(s||r,0,[`exit`,o,t[2]]),r++,n++}if(t[1].type===`listItemPrefix`){let i={type:`listItem`,_spread:!1,start:Object.assign({},t[1].start),end:void 0};o=i,e.splice(r,0,[`enter`,i,t[2]]),r++,n++,c=void 0,l=!0}}}return e[t][1]._spread=a,n}function a(e,t){return n;function n(n){s.call(this,e(n),n),t&&t.call(this,n)}}function o(){this.stack.push({type:`fragment`,children:[]})}function s(e,t,n){this.stack[this.stack.length-1].children.push(e),this.stack.push(e),this.tokenStack.push([t,n||void 0]),e.position={start:mc(t.start),end:void 0}}function c(e){return t;function t(t){e&&e.call(this,t),l.call(this,t)}}function l(e,t){let n=this.stack.pop(),r=this.tokenStack.pop();if(r)r[0].type!==e.type&&(t?t.call(this,e,r[0]):(r[1]||_c).call(this,e,r[0]));else throw Error("Cannot close `"+e.type+"` ("+Hi({start:e.start,end:e.end})+`): it’s not open`);n.position.end=mc(e.end)}function u(){return Ca(this.stack.pop())}function d(){this.data.expectingFirstListItemValue=!0}function f(e){if(this.data.expectingFirstListItemValue){let t=this.stack[this.stack.length-2];t.start=Number.parseInt(this.sliceSerialize(e),10),this.data.expectingFirstListItemValue=void 0}}function p(){let e=this.resume(),t=this.stack[this.stack.length-1];t.lang=e}function m(){let e=this.resume(),t=this.stack[this.stack.length-1];t.meta=e}function h(){this.data.flowCodeInside||(this.buffer(),this.data.flowCodeInside=!0)}function g(){let e=this.resume(),t=this.stack[this.stack.length-1];t.value=e.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g,``),this.data.flowCodeInside=void 0}function _(){let e=this.resume(),t=this.stack[this.stack.length-1];t.value=e.replace(/(\r?\n|\r)$/g,``)}function v(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.label=t,n.identifier=Ia(this.sliceSerialize(e)).toLowerCase()}function y(){let e=this.resume(),t=this.stack[this.stack.length-1];t.title=e}function b(){let e=this.resume(),t=this.stack[this.stack.length-1];t.url=e}function x(e){let t=this.stack[this.stack.length-1];t.depth||=this.sliceSerialize(e).length}function S(){this.data.setextHeadingSlurpLineEnding=!0}function C(e){let t=this.stack[this.stack.length-1];t.depth=this.sliceSerialize(e).codePointAt(0)===61?1:2}function w(){this.data.setextHeadingSlurpLineEnding=void 0}function T(e){let t=this.stack[this.stack.length-1].children,n=t[t.length-1];(!n||n.type!==`text`)&&(n=Oe(),n.position={start:mc(e.start),end:void 0},t.push(n)),this.stack.push(n)}function E(e){let t=this.stack.pop();t.value+=this.sliceSerialize(e),t.position.end=mc(e.end)}function ee(e){let n=this.stack[this.stack.length-1];if(this.data.atHardBreak){let t=n.children[n.children.length-1];t.position.end=mc(e.end),this.data.atHardBreak=void 0;return}!this.data.setextHeadingSlurpLineEnding&&t.canContainEols.includes(n.type)&&(T.call(this,e),E.call(this,e))}function D(){this.data.atHardBreak=!0}function te(){let e=this.resume(),t=this.stack[this.stack.length-1];t.value=e}function O(){let e=this.resume(),t=this.stack[this.stack.length-1];t.value=e}function ne(){let e=this.resume(),t=this.stack[this.stack.length-1];t.value=e}function re(){let e=this.stack[this.stack.length-1];if(this.data.inReference){let t=this.data.referenceType||`shortcut`;e.type+=`Reference`,e.referenceType=t,delete e.url,delete e.title}else delete e.identifier,delete e.label;this.data.referenceType=void 0}function ie(){let e=this.stack[this.stack.length-1];if(this.data.inReference){let t=this.data.referenceType||`shortcut`;e.type+=`Reference`,e.referenceType=t,delete e.url,delete e.title}else delete e.identifier,delete e.label;this.data.referenceType=void 0}function ae(e){let t=this.sliceSerialize(e),n=this.stack[this.stack.length-2];n.label=lc(t),n.identifier=Ia(t).toLowerCase()}function oe(){let e=this.stack[this.stack.length-1],t=this.resume(),n=this.stack[this.stack.length-1];this.data.inReference=!0,n.type===`link`?n.children=e.children:n.alt=t}function k(){let e=this.resume(),t=this.stack[this.stack.length-1];t.url=e}function A(){let e=this.resume(),t=this.stack[this.stack.length-1];t.title=e}function se(){this.data.inReference=void 0}function ce(){this.data.referenceType=`collapsed`}function le(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.label=t,n.identifier=Ia(this.sliceSerialize(e)).toLowerCase(),this.data.referenceType=`full`}function ue(e){this.data.characterReferenceType=e.type}function de(e){let t=this.sliceSerialize(e),n=this.data.characterReferenceType,r;n?(r=Fa(t,n===`characterReferenceMarkerNumeric`?10:16),this.data.characterReferenceType=void 0):r=Oa(t);let i=this.stack[this.stack.length-1];i.value+=r}function j(e){let t=this.stack.pop();t.position.end=mc(e.end)}function fe(e){E.call(this,e);let t=this.stack[this.stack.length-1];t.url=this.sliceSerialize(e)}function pe(e){E.call(this,e);let t=this.stack[this.stack.length-1];t.url=`mailto:`+this.sliceSerialize(e)}function me(){return{type:`blockquote`,children:[]}}function he(){return{type:`code`,lang:null,meta:null,value:``}}function ge(){return{type:`inlineCode`,value:``}}function _e(){return{type:`definition`,identifier:``,label:null,title:null,url:``}}function ve(){return{type:`emphasis`,children:[]}}function ye(){return{type:`heading`,depth:0,children:[]}}function be(){return{type:`break`}}function xe(){return{type:`html`,value:``}}function Se(){return{type:`image`,title:null,url:``,alt:null}}function Ce(){return{type:`link`,title:null,url:``,children:[]}}function we(e){return{type:`list`,ordered:e.type===`listOrdered`,start:null,spread:e._spread,children:[]}}function Te(e){return{type:`listItem`,spread:e._spread,checked:null,children:[]}}function Ee(){return{type:`paragraph`,children:[]}}function De(){return{type:`strong`,children:[]}}function Oe(){return{type:`text`,value:``}}function ke(){return{type:`thematicBreak`}}}function mc(e){return{line:e.line,column:e.column,offset:e.offset}}function hc(e,t){let n=-1;for(;++n<t.length;){let r=t[n];Array.isArray(r)?hc(e,r):gc(e,r)}}function gc(e,t){let n;for(n in t)if(dc.call(t,n))switch(n){case`canContainEols`:{let r=t[n];r&&e[n].push(...r);break}case`transforms`:{let r=t[n];r&&e[n].push(...r);break}case`enter`:case`exit`:{let r=t[n];r&&Object.assign(e[n],r);break}}}function _c(e,t){throw Error(e?"Cannot close `"+e.type+"` ("+Hi({start:e.start,end:e.end})+"): a different token (`"+t.type+"`, "+Hi({start:t.start,end:t.end})+`) is open`:"Cannot close document, a token (`"+t.type+"`, "+Hi({start:t.start,end:t.end})+`) is still open`)}function vc(e){let t=this;t.parser=n;function n(n){return fc(n,{...t.data(`settings`),...e,extensions:t.data(`micromarkExtensions`)||[],mdastExtensions:t.data(`fromMarkdownExtensions`)||[]})}}function yc(e,t){let n={type:`element`,tagName:`blockquote`,properties:{},children:e.wrap(e.all(t),!0)};return e.patch(t,n),e.applyData(t,n)}function bc(e,t){let n={type:`element`,tagName:`br`,properties:{},children:[]};return e.patch(t,n),[e.applyData(t,n),{type:`text`,value:`
`}]}function xc(e,t){let n=t.value?t.value+`
`:``,r={},i=t.lang?t.lang.split(/\s+/):[];i.length>0&&(r.className=[`language-`+i[0]]);let a={type:`element`,tagName:`code`,properties:r,children:[{type:`text`,value:n}]};return t.meta&&(a.data={meta:t.meta}),e.patch(t,a),a=e.applyData(t,a),a={type:`element`,tagName:`pre`,properties:{},children:[a]},e.patch(t,a),a}function Sc(e,t){let n={type:`element`,tagName:`del`,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)}function Cc(e,t){let n={type:`element`,tagName:`em`,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)}function wc(e,t){let n=typeof e.options.clobberPrefix==`string`?e.options.clobberPrefix:`user-content-`,r=String(t.identifier).toUpperCase(),i=qa(r.toLowerCase()),a=e.footnoteOrder.indexOf(r),o,s=e.footnoteCounts.get(r);s===void 0?(s=0,e.footnoteOrder.push(r),o=e.footnoteOrder.length):o=a+1,s+=1,e.footnoteCounts.set(r,s);let c={type:`element`,tagName:`a`,properties:{href:`#`+n+`fn-`+i,id:n+`fnref-`+i+(s>1?`-`+s:``),dataFootnoteRef:!0,ariaDescribedBy:[`footnote-label`]},children:[{type:`text`,value:String(o)}]};e.patch(t,c);let l={type:`element`,tagName:`sup`,properties:{},children:[c]};return e.patch(t,l),e.applyData(t,l)}function Tc(e,t){let n={type:`element`,tagName:`h`+t.depth,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)}function Ec(e,t){if(e.options.allowDangerousHtml){let n={type:`raw`,value:t.value};return e.patch(t,n),e.applyData(t,n)}}function Dc(e,t){let n=t.referenceType,r=`]`;if(n===`collapsed`?r+=`[]`:n===`full`&&(r+=`[`+(t.label||t.identifier)+`]`),t.type===`imageReference`)return[{type:`text`,value:`![`+t.alt+r}];let i=e.all(t),a=i[0];a&&a.type===`text`?a.value=`[`+a.value:i.unshift({type:`text`,value:`[`});let o=i[i.length-1];return o&&o.type===`text`?o.value+=r:i.push({type:`text`,value:r}),i}function Oc(e,t){let n=String(t.identifier).toUpperCase(),r=e.definitionById.get(n);if(!r)return Dc(e,t);let i={src:qa(r.url||``),alt:t.alt};r.title!==null&&r.title!==void 0&&(i.title=r.title);let a={type:`element`,tagName:`img`,properties:i,children:[]};return e.patch(t,a),e.applyData(t,a)}function kc(e,t){let n={src:qa(t.url)};t.alt!==null&&t.alt!==void 0&&(n.alt=t.alt),t.title!==null&&t.title!==void 0&&(n.title=t.title);let r={type:`element`,tagName:`img`,properties:n,children:[]};return e.patch(t,r),e.applyData(t,r)}function Ac(e,t){let n={type:`text`,value:t.value.replace(/\r?\n|\r/g,` `)};e.patch(t,n);let r={type:`element`,tagName:`code`,properties:{},children:[n]};return e.patch(t,r),e.applyData(t,r)}function jc(e,t){let n=String(t.identifier).toUpperCase(),r=e.definitionById.get(n);if(!r)return Dc(e,t);let i={href:qa(r.url||``)};r.title!==null&&r.title!==void 0&&(i.title=r.title);let a={type:`element`,tagName:`a`,properties:i,children:e.all(t)};return e.patch(t,a),e.applyData(t,a)}function Mc(e,t){let n={href:qa(t.url)};t.title!==null&&t.title!==void 0&&(n.title=t.title);let r={type:`element`,tagName:`a`,properties:n,children:e.all(t)};return e.patch(t,r),e.applyData(t,r)}function Nc(e,t,n){let r=e.all(t),i=n?Pc(n):Fc(t),a={},o=[];if(typeof t.checked==`boolean`){let e=r[0],n;e&&e.type===`element`&&e.tagName===`p`?n=e:(n={type:`element`,tagName:`p`,properties:{},children:[]},r.unshift(n)),n.children.length>0&&n.children.unshift({type:`text`,value:` `}),n.children.unshift({type:`element`,tagName:`input`,properties:{type:`checkbox`,checked:t.checked,disabled:!0},children:[]}),a.className=[`task-list-item`]}let s=-1;for(;++s<r.length;){let e=r[s];(i||s!==0||e.type!==`element`||e.tagName!==`p`)&&o.push({type:`text`,value:`
`}),e.type===`element`&&e.tagName===`p`&&!i?o.push(...e.children):o.push(e)}let c=r[r.length-1];c&&(i||c.type!==`element`||c.tagName!==`p`)&&o.push({type:`text`,value:`
`});let l={type:`element`,tagName:`li`,properties:a,children:o};return e.patch(t,l),e.applyData(t,l)}function Pc(e){let t=!1;if(e.type===`list`){t=e.spread||!1;let n=e.children,r=-1;for(;!t&&++r<n.length;)t=Fc(n[r])}return t}function Fc(e){return e.spread??e.children.length>1}function Ic(e,t){let n={},r=e.all(t),i=-1;for(typeof t.start==`number`&&t.start!==1&&(n.start=t.start);++i<r.length;){let e=r[i];if(e.type===`element`&&e.tagName===`li`&&e.properties&&Array.isArray(e.properties.className)&&e.properties.className.includes(`task-list-item`)){n.className=[`contains-task-list`];break}}let a={type:`element`,tagName:t.ordered?`ol`:`ul`,properties:n,children:e.wrap(r,!0)};return e.patch(t,a),e.applyData(t,a)}function Lc(e,t){let n={type:`element`,tagName:`p`,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)}function Rc(e,t){let n={type:`root`,children:e.wrap(e.all(t))};return e.patch(t,n),e.applyData(t,n)}function zc(e,t){let n={type:`element`,tagName:`strong`,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)}function Bc(e,t){let n=e.all(t),r=n.shift(),i=[];if(r){let n={type:`element`,tagName:`thead`,properties:{},children:e.wrap([r],!0)};e.patch(t.children[0],n),i.push(n)}if(n.length>0){let r={type:`element`,tagName:`tbody`,properties:{},children:e.wrap(n,!0)},a=zi(t.children[1]),o=Ri(t.children[t.children.length-1]);a&&o&&(r.position={start:a,end:o}),i.push(r)}let a={type:`element`,tagName:`table`,properties:{},children:e.wrap(i,!0)};return e.patch(t,a),e.applyData(t,a)}function Vc(e,t,n){let r=n?n.children:void 0,i=(r?r.indexOf(t):1)===0?`th`:`td`,a=n&&n.type===`table`?n.align:void 0,o=a?a.length:t.children.length,s=-1,c=[];for(;++s<o;){let n=t.children[s],r={},o=a?a[s]:void 0;o&&(r.align=o);let l={type:`element`,tagName:i,properties:r,children:[]};n&&(l.children=e.all(n),e.patch(n,l),l=e.applyData(n,l)),c.push(l)}let l={type:`element`,tagName:`tr`,properties:{},children:e.wrap(c,!0)};return e.patch(t,l),e.applyData(t,l)}function Hc(e,t){let n={type:`element`,tagName:`td`,properties:{},children:e.all(t)};return e.patch(t,n),e.applyData(t,n)}var Uc=9,Wc=32;function Gc(e){let t=String(e),n=/\r?\n|\r/g,r=n.exec(t),i=0,a=[];for(;r;)a.push(Kc(t.slice(i,r.index),i>0,!0),r[0]),i=r.index+r[0].length,r=n.exec(t);return a.push(Kc(t.slice(i),i>0,!1)),a.join(``)}function Kc(e,t,n){let r=0,i=e.length;if(t){let t=e.codePointAt(r);for(;t===Uc||t===Wc;)r++,t=e.codePointAt(r)}if(n){let t=e.codePointAt(i-1);for(;t===Uc||t===Wc;)i--,t=e.codePointAt(i-1)}return i>r?e.slice(r,i):``}function qc(e,t){let n={type:`text`,value:Gc(String(t.value))};return e.patch(t,n),e.applyData(t,n)}function Jc(e,t){let n={type:`element`,tagName:`hr`,properties:{},children:[]};return e.patch(t,n),e.applyData(t,n)}var Yc={blockquote:yc,break:bc,code:xc,delete:Sc,emphasis:Cc,footnoteReference:wc,heading:Tc,html:Ec,imageReference:Oc,image:kc,inlineCode:Ac,linkReference:jc,link:Mc,listItem:Nc,list:Ic,paragraph:Lc,root:Rc,strong:zc,table:Bc,tableCell:Hc,tableRow:Vc,text:qc,thematicBreak:Jc,toml:Xc,yaml:Xc,definition:Xc,footnoteDefinition:Xc};function Xc(){}var Zc=typeof self==`object`?self:globalThis,Qc=(e,t)=>{switch(e){case`Function`:case`SharedWorker`:case`Worker`:case`eval`:case`setInterval`:case`setTimeout`:throw TypeError(`unable to deserialize `+e)}return new Zc[e](t)},$c=(e,t)=>{let n=(t,n)=>(e.set(n,t),t),r=i=>{if(e.has(i))return e.get(i);let[a,o]=t[i];switch(a){case 0:case-1:return n(o,i);case 1:{let e=n([],i);for(let t of o)e.push(r(t));return e}case 2:{let e=n({},i);for(let[t,n]of o)e[r(t)]=r(n);return e}case 3:return n(new Date(o),i);case 4:{let{source:e,flags:t}=o;return n(new RegExp(e,t),i)}case 5:{let e=n(new Map,i);for(let[t,n]of o)e.set(r(t),r(n));return e}case 6:{let e=n(new Set,i);for(let t of o)e.add(r(t));return e}case 7:{let{name:e,message:t}=o;return n(typeof Zc[e]==`function`?Qc(e,t):Error(t),i)}case 8:return n(BigInt(o),i);case`BigInt`:return n(Object(BigInt(o)),i);case`ArrayBuffer`:return n(new Uint8Array(o).buffer,o);case`DataView`:{let{buffer:e}=new Uint8Array(o);return n(new DataView(e),o)}}return n(Qc(a,o),i)};return r},el=e=>$c(new Map,e)(0),tl=``,{toString:nl}={},{keys:rl}=Object,il=e=>{let t=typeof e;if(t!==`object`||!e)return[0,t];let n=nl.call(e).slice(8,-1);switch(n){case`Array`:return[1,tl];case`Object`:return[2,tl];case`Date`:return[3,tl];case`RegExp`:return[4,tl];case`Map`:return[5,tl];case`Set`:return[6,tl];case`DataView`:return[1,n]}return n.includes(`Array`)?[1,n]:e instanceof Error?[7,e.name||`Error`]:[2,n]},al=([e,t])=>e===0&&(t===`function`||t===`symbol`),ol=(e,t,n,r)=>{let i=(e,t)=>{let i=r.push(e)-1;return n.set(t,i),i},a=r=>{if(n.has(r))return n.get(r);let[o,s]=il(r);switch(o){case 0:{let t=r;switch(s){case`bigint`:o=8,t=r.toString();break;case`function`:case`symbol`:if(e)throw TypeError(`unable to serialize `+s);t=null;break;case`undefined`:return i([-1],r)}return i([o,t],r)}case 1:{if(s){let e=r;return s===`DataView`?e=new Uint8Array(r.buffer):s===`ArrayBuffer`&&(e=new Uint8Array(r)),i([s,[...e]],r)}let e=[],t=i([o,e],r);for(let t of r)e.push(a(t));return t}case 2:{if(s)switch(s){case`BigInt`:return i([s,r.toString()],r);case`Boolean`:case`Number`:case`String`:return i([s,r.valueOf()],r)}if(t&&`toJSON`in r)return a(r.toJSON());let n=[],c=i([o,n],r);for(let t of rl(r))(e||!al(il(r[t])))&&n.push([a(t),a(r[t])]);return c}case 3:return i([o,isNaN(r.getTime())?tl:r.toISOString()],r);case 4:{let{source:e,flags:t}=r;return i([o,{source:e,flags:t}],r)}case 5:{let t=[],n=i([o,t],r);for(let[n,i]of r)(e||!(al(il(n))||al(il(i))))&&t.push([a(n),a(i)]);return n}case 6:{let t=[],n=i([o,t],r);for(let n of r)(e||!al(il(n)))&&t.push(a(n));return n}}let{message:c}=r;return i([o,{name:s,message:c}],r)};return a},sl=(e,{json:t,lossy:n}={})=>{let r=[];return ol(!(t||n),!!t,new Map,r)(e),r},G=typeof structuredClone==`function`?(e,t)=>t&&(`json`in t||`lossy`in t)?el(sl(e,t)):structuredClone(e):(e,t)=>el(sl(e,t));function cl(e,t){let n=[{type:`text`,value:`↩`}];return t>1&&n.push({type:`element`,tagName:`sup`,properties:{},children:[{type:`text`,value:String(t)}]}),n}function ll(e,t){return`Back to reference `+(e+1)+(t>1?`-`+t:``)}function ul(e){let t=typeof e.options.clobberPrefix==`string`?e.options.clobberPrefix:`user-content-`,n=e.options.footnoteBackContent||cl,r=e.options.footnoteBackLabel||ll,i=e.options.footnoteLabel||`Footnotes`,a=e.options.footnoteLabelTagName||`h2`,o=e.options.footnoteLabelProperties||{className:[`sr-only`]},s=[],c=-1;for(;++c<e.footnoteOrder.length;){let i=e.footnoteById.get(e.footnoteOrder[c]);if(!i)continue;let a=e.all(i),o=String(i.identifier).toUpperCase(),l=qa(o.toLowerCase()),u=0,d=[],f=e.footnoteCounts.get(o);for(;f!==void 0&&++u<=f;){d.length>0&&d.push({type:`text`,value:` `});let e=typeof n==`string`?n:n(c,u);typeof e==`string`&&(e={type:`text`,value:e}),d.push({type:`element`,tagName:`a`,properties:{href:`#`+t+`fnref-`+l+(u>1?`-`+u:``),dataFootnoteBackref:``,ariaLabel:typeof r==`string`?r:r(c,u),className:[`data-footnote-backref`]},children:Array.isArray(e)?e:[e]})}let p=a[a.length-1];if(p&&p.type===`element`&&p.tagName===`p`){let e=p.children[p.children.length-1];e&&e.type===`text`?e.value+=` `:p.children.push({type:`text`,value:` `}),p.children.push(...d)}else a.push(...d);let m={type:`element`,tagName:`li`,properties:{id:t+`fn-`+l},children:e.wrap(a,!0)};e.patch(i,m),s.push(m)}if(s.length!==0)return{type:`element`,tagName:`section`,properties:{dataFootnotes:!0,className:[`footnotes`]},children:[{type:`element`,tagName:a,properties:{...G(o),id:`footnote-label`},children:[{type:`text`,value:i}]},{type:`text`,value:`
`},{type:`element`,tagName:`ol`,properties:{},children:e.wrap(s,!0)},{type:`text`,value:`
`}]}}var dl=(function(e){if(e==null)return gl;if(typeof e==`function`)return hl(e);if(typeof e==`object`)return Array.isArray(e)?fl(e):pl(e);if(typeof e==`string`)return ml(e);throw Error(`Expected function, string, or object as test`)});function fl(e){let t=[],n=-1;for(;++n<e.length;)t[n]=dl(e[n]);return hl(r);function r(...e){let n=-1;for(;++n<t.length;)if(t[n].apply(this,e))return!0;return!1}}function pl(e){let t=e;return hl(n);function n(n){let r=n,i;for(i in e)if(r[i]!==t[i])return!1;return!0}}function ml(e){return hl(t);function t(t){return t&&t.type===e}}function hl(e){return t;function t(t,n,r){return!!(_l(t)&&e.call(this,t,typeof n==`number`?n:void 0,r||void 0))}}function gl(){return!0}function _l(e){return typeof e==`object`&&!!e&&`type`in e}function vl(e){return e}var yl=[];function bl(e,t,n,r){let i;typeof t==`function`&&typeof n!=`function`?(r=n,n=t):i=t;let a=dl(i),o=r?-1:1;s(e,void 0,[])();function s(e,i,c){let l=e&&typeof e==`object`?e:{};if(typeof l.type==`string`){let t=typeof l.tagName==`string`?l.tagName:typeof l.name==`string`?l.name:void 0;Object.defineProperty(u,"name",{value:`node (`+vl(e.type+(t?`<`+t+`>`:``))+`)`})}return u;function u(){let l=yl,u,d,f;if((!t||a(e,i,c[c.length-1]||void 0))&&(l=xl(n(e,c)),l[0]===!1))return l;if(`children`in e&&e.children){let t=e;if(t.children&&l[0]!==`skip`)for(d=(r?t.children.length:-1)+o,f=c.concat(t);d>-1&&d<t.children.length;){let e=t.children[d];if(u=s(e,d,f)(),u[0]===!1)return u;d=typeof u[1]==`number`?u[1]:d+o}}return l}}}function xl(e){return Array.isArray(e)?e:typeof e==`number`?[!0,e]:e==null?yl:[e]}function Sl(e,t,n,r){let i,a,o;typeof t==`function`&&typeof n!=`function`?(a=void 0,o=t,i=n):(a=t,o=n,i=r),bl(e,a,s,i);function s(e,t){let n=t[t.length-1],r=n?n.children.indexOf(e):void 0;return o(e,r,n)}}var Cl={}.hasOwnProperty,wl={};function Tl(e,t){let n=t||wl,r=new Map,i=new Map,a={all:s,applyData:Dl,definitionById:r,footnoteById:i,footnoteCounts:new Map,footnoteOrder:[],handlers:{...Yc,...n.handlers},one:o,options:n,patch:El,wrap:kl};return Sl(e,function(e){if(e.type===`definition`||e.type===`footnoteDefinition`){let t=e.type===`definition`?r:i,n=String(e.identifier).toUpperCase();t.has(n)||t.set(n,e)}}),a;function o(e,t){let n=e.type,r=a.handlers[n];if(Cl.call(a.handlers,n)&&r)return r(a,e,t);if(a.options.passThrough&&a.options.passThrough.includes(n)){if(`children`in e){let{children:t,...n}=e,r=G(n);return r.children=a.all(e),r}return G(e)}return(a.options.unknownHandler||Ol)(a,e,t)}function s(e){let t=[];if(`children`in e){let n=e.children,r=-1;for(;++r<n.length;){let i=a.one(n[r],e);if(i){if(r&&n[r-1].type===`break`&&(!Array.isArray(i)&&i.type===`text`&&(i.value=Al(i.value)),!Array.isArray(i)&&i.type===`element`)){let e=i.children[0];e&&e.type===`text`&&(e.value=Al(e.value))}Array.isArray(i)?t.push(...i):t.push(i)}}}return t}}function El(e,t){e.position&&(t.position=Vi(e))}function Dl(e,t){let n=t;if(e&&e.data){let t=e.data.hName,r=e.data.hChildren,i=e.data.hProperties;typeof t==`string`&&(n.type===`element`?n.tagName=t:n={type:`element`,tagName:t,properties:{},children:`children`in n?n.children:[n]}),n.type===`element`&&i&&Object.assign(n.properties,G(i)),`children`in n&&n.children&&r!=null&&(n.children=r)}return n}function Ol(e,t){let n=t.data||{},r=`value`in t&&!(Cl.call(n,`hProperties`)||Cl.call(n,`hChildren`))?{type:`text`,value:t.value}:{type:`element`,tagName:`div`,properties:{},children:e.all(t)};return e.patch(t,r),e.applyData(t,r)}function kl(e,t){let n=[],r=-1;for(t&&n.push({type:`text`,value:`
`});++r<e.length;)r&&n.push({type:`text`,value:`
`}),n.push(e[r]);return t&&e.length>0&&n.push({type:`text`,value:`
`}),n}function Al(e){let t=0,n=e.charCodeAt(t);for(;n===9||n===32;)t++,n=e.charCodeAt(t);return e.slice(t)}function jl(e,t){let n=Tl(e,t),r=n.one(e,void 0),i=ul(n),a=Array.isArray(r)?{type:`root`,children:r}:r||{type:`root`,children:[]};return i&&(`children`in a,a.children.push({type:`text`,value:`
`},i)),a}function Ml(e,t){return e&&`run`in e?async function(n,r){let i=jl(n,{file:r,...t});await e.run(i,r)}:function(n,r){return jl(n,{file:r,...e||t})}}function Nl(e){if(e)throw e}var Pl=o(((e,t)=>{var n=Object.prototype.hasOwnProperty,r=Object.prototype.toString,i=Object.defineProperty,a=Object.getOwnPropertyDescriptor,o=function(e){return typeof Array.isArray==`function`?Array.isArray(e):r.call(e)===`[object Array]`},s=function(e){if(!e||r.call(e)!==`[object Object]`)return!1;var t=n.call(e,`constructor`),i=e.constructor&&e.constructor.prototype&&n.call(e.constructor.prototype,`isPrototypeOf`);if(e.constructor&&!t&&!i)return!1;for(var a in e);return a===void 0||n.call(e,a)},c=function(e,t){i&&t.name===`__proto__`?i(e,t.name,{enumerable:!0,configurable:!0,value:t.newValue,writable:!0}):e[t.name]=t.newValue},l=function(e,t){if(t===`__proto__`){if(!n.call(e,t))return;if(a)return a(e,t).value}return e[t]};t.exports=function e(){var t,n,r,i,a,u,d=arguments[0],f=1,p=arguments.length,m=!1;for(typeof d==`boolean`&&(m=d,d=arguments[1]||{},f=2),(d==null||typeof d!=`object`&&typeof d!=`function`)&&(d={});f<p;++f)if(t=arguments[f],t!=null)for(n in t)r=l(d,n),i=l(t,n),d!==i&&(m&&i&&(s(i)||(a=o(i)))?(a?(a=!1,u=r&&o(r)?r:[]):u=r&&s(r)?r:{},c(d,{name:n,newValue:e(m,u,i)})):i!==void 0&&c(d,{name:n,newValue:i}));return d}}));function Fl(e){if(typeof e!=`object`||!e)return!1;let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype||Object.getPrototypeOf(t)===null)&&!(Symbol.toStringTag in e)&&!(Symbol.iterator in e)}function Il(){let e=[],t={run:n,use:r};return t;function n(...t){let n=-1,r=t.pop();if(typeof r!=`function`)throw TypeError(`Expected function as last argument, not `+r);i(null,...t);function i(a,...o){let s=e[++n],c=-1;if(a){r(a);return}for(;++c<t.length;)(o[c]===null||o[c]===void 0)&&(o[c]=t[c]);t=o,s?Ll(s,i)(...o):r(null,...o)}}function r(n){if(typeof n!=`function`)throw TypeError("Expected `middelware` to be a function, not "+n);return e.push(n),t}}function Ll(e,t){let n;return r;function r(...t){let r=e.length>t.length,o;r&&t.push(i);try{o=e.apply(this,t)}catch(e){let t=e;if(r&&n)throw t;return i(t)}r||(o&&o.then&&typeof o.then==`function`?o.then(a,i):o instanceof Error?i(o):a(o))}function i(e,...r){n||(n=!0,t(e,...r))}function a(e){i(null,e)}}var Rl={basename:K,dirname:q,extname:J,join:Y,sep:`/`};function K(e,t){if(t!==void 0&&typeof t!=`string`)throw TypeError(`"ext" argument must be a string`);Bl(e);let n=0,r=-1,i=e.length,a;if(t===void 0||t.length===0||t.length>e.length){for(;i--;)if(e.codePointAt(i)===47){if(a){n=i+1;break}}else r<0&&(a=!0,r=i+1);return r<0?``:e.slice(n,r)}if(t===e)return``;let o=-1,s=t.length-1;for(;i--;)if(e.codePointAt(i)===47){if(a){n=i+1;break}}else o<0&&(a=!0,o=i+1),s>-1&&(e.codePointAt(i)===t.codePointAt(s--)?s<0&&(r=i):(s=-1,r=o));return n===r?r=o:r<0&&(r=e.length),e.slice(n,r)}function q(e){if(Bl(e),e.length===0)return`.`;let t=-1,n=e.length,r;for(;--n;)if(e.codePointAt(n)===47){if(r){t=n;break}}else r||=!0;return t<0?e.codePointAt(0)===47?`/`:`.`:t===1&&e.codePointAt(0)===47?`//`:e.slice(0,t)}function J(e){Bl(e);let t=e.length,n=-1,r=0,i=-1,a=0,o;for(;t--;){let s=e.codePointAt(t);if(s===47){if(o){r=t+1;break}continue}n<0&&(o=!0,n=t+1),s===46?i<0?i=t:a!==1&&(a=1):i>-1&&(a=-1)}return i<0||n<0||a===0||a===1&&i===n-1&&i===r+1?``:e.slice(i,n)}function Y(...e){let t=-1,n;for(;++t<e.length;)Bl(e[t]),e[t]&&(n=n===void 0?e[t]:n+`/`+e[t]);return n===void 0?`.`:X(n)}function X(e){Bl(e);let t=e.codePointAt(0)===47,n=zl(e,!t);return n.length===0&&!t&&(n=`.`),n.length>0&&e.codePointAt(e.length-1)===47&&(n+=`/`),t?`/`+n:n}function zl(e,t){let n=``,r=0,i=-1,a=0,o=-1,s,c;for(;++o<=e.length;){if(o<e.length)s=e.codePointAt(o);else if(s===47)break;else s=47;if(s===47){if(!(i===o-1||a===1))if(i!==o-1&&a===2){if(n.length<2||r!==2||n.codePointAt(n.length-1)!==46||n.codePointAt(n.length-2)!==46){if(n.length>2){if(c=n.lastIndexOf(`/`),c!==n.length-1){c<0?(n=``,r=0):(n=n.slice(0,c),r=n.length-1-n.lastIndexOf(`/`)),i=o,a=0;continue}}else if(n.length>0){n=``,r=0,i=o,a=0;continue}}t&&(n=n.length>0?n+`/..`:`..`,r=2)}else n.length>0?n+=`/`+e.slice(i+1,o):n=e.slice(i+1,o),r=o-i-1;i=o,a=0}else s===46&&a>-1?a++:a=-1}return n}function Bl(e){if(typeof e!=`string`)throw TypeError(`Path must be a string. Received `+JSON.stringify(e))}var Vl={cwd:Hl};function Hl(){return`/`}function Ul(e){return!!(typeof e==`object`&&e&&`href`in e&&e.href&&`protocol`in e&&e.protocol&&e.auth===void 0)}function Wl(e){if(typeof e==`string`)e=new URL(e);else if(!Ul(e)){let t=TypeError('The "path" argument must be of type string or an instance of URL. Received `'+e+"`");throw t.code=`ERR_INVALID_ARG_TYPE`,t}if(e.protocol!==`file:`){let e=TypeError(`The URL must be of scheme file`);throw e.code=`ERR_INVALID_URL_SCHEME`,e}return Gl(e)}function Gl(e){if(e.hostname!==``){let e=TypeError(`File URL host must be "localhost" or empty on darwin`);throw e.code=`ERR_INVALID_FILE_URL_HOST`,e}let t=e.pathname,n=-1;for(;++n<t.length;)if(t.codePointAt(n)===37&&t.codePointAt(n+1)===50){let e=t.codePointAt(n+2);if(e===70||e===102){let e=TypeError(`File URL path must not include encoded / characters`);throw e.code=`ERR_INVALID_FILE_URL_PATH`,e}}return decodeURIComponent(t)}var Kl=[`history`,`path`,`basename`,`stem`,`extname`,`dirname`],ql=class{constructor(e){let t;t=e?Ul(e)?{path:e}:typeof e==`string`||Zl(e)?{value:e}:e:{},this.cwd=`cwd`in t?``:Vl.cwd(),this.data={},this.history=[],this.messages=[],this.value,this.map,this.result,this.stored;let n=-1;for(;++n<Kl.length;){let e=Kl[n];e in t&&t[e]!==void 0&&t[e]!==null&&(this[e]=e===`history`?[...t[e]]:t[e])}let r;for(r in t)Kl.includes(r)||(this[r]=t[r])}get basename(){return typeof this.path==`string`?Rl.basename(this.path):void 0}set basename(e){Yl(e,`basename`),Jl(e,`basename`),this.path=Rl.join(this.dirname||``,e)}get dirname(){return typeof this.path==`string`?Rl.dirname(this.path):void 0}set dirname(e){Xl(this.basename,`dirname`),this.path=Rl.join(e||``,this.basename)}get extname(){return typeof this.path==`string`?Rl.extname(this.path):void 0}set extname(e){if(Jl(e,`extname`),Xl(this.dirname,`extname`),e){if(e.codePointAt(0)!==46)throw Error("`extname` must start with `.`");if(e.includes(`.`,1))throw Error("`extname` cannot contain multiple dots")}this.path=Rl.join(this.dirname,this.stem+(e||``))}get path(){return this.history[this.history.length-1]}set path(e){Ul(e)&&(e=Wl(e)),Yl(e,`path`),this.path!==e&&this.history.push(e)}get stem(){return typeof this.path==`string`?Rl.basename(this.path,this.extname):void 0}set stem(e){Yl(e,`stem`),Jl(e,`stem`),this.path=Rl.join(this.dirname||``,e+(this.extname||``))}fail(e,t,n){let r=this.message(e,t,n);throw r.fatal=!0,r}info(e,t,n){let r=this.message(e,t,n);return r.fatal=void 0,r}message(e,t,n){let r=new Ki(e,t,n);return this.path&&(r.name=this.path+`:`+r.name,r.file=this.path),r.fatal=!1,this.messages.push(r),r}toString(e){return this.value===void 0?``:typeof this.value==`string`?this.value:new TextDecoder(e||void 0).decode(this.value)}};function Jl(e,t){if(e&&e.includes(Rl.sep))throw Error("`"+t+"` cannot be a path: did not expect `"+Rl.sep+"`")}function Yl(e,t){if(!e)throw Error("`"+t+"` cannot be empty")}function Xl(e,t){if(!e)throw Error("Setting `"+t+"` requires `path` to be set too")}function Zl(e){return!!(e&&typeof e==`object`&&`byteLength`in e&&`byteOffset`in e)}var Ql=(function(e){let t=this.constructor.prototype,n=t[e],r=function(){return n.apply(r,arguments)};return Object.setPrototypeOf(r,t),r}),$l=l(Pl(),1),eu={}.hasOwnProperty,tu=new class e extends Ql{constructor(){super(`copy`),this.Compiler=void 0,this.Parser=void 0,this.attachers=[],this.compiler=void 0,this.freezeIndex=-1,this.frozen=void 0,this.namespace={},this.parser=void 0,this.transformers=Il()}copy(){let t=new e,n=-1;for(;++n<this.attachers.length;){let e=this.attachers[n];t.use(...e)}return t.data((0,$l.default)(!0,{},this.namespace)),t}data(e,t){return typeof e==`string`?arguments.length===2?(iu(`data`,this.frozen),this.namespace[e]=t,this):eu.call(this.namespace,e)&&this.namespace[e]||void 0:e?(iu(`data`,this.frozen),this.namespace=e,this):this.namespace}freeze(){if(this.frozen)return this;let e=this;for(;++this.freezeIndex<this.attachers.length;){let[t,...n]=this.attachers[this.freezeIndex];if(n[0]===!1)continue;n[0]===!0&&(n[0]=void 0);let r=t.call(e,...n);typeof r==`function`&&this.transformers.use(r)}return this.frozen=!0,this.freezeIndex=1/0,this}parse(e){this.freeze();let t=su(e),n=this.parser||this.Parser;return nu(`parse`,n),n(String(t),t)}process(e,t){let n=this;return this.freeze(),nu(`process`,this.parser||this.Parser),ru(`process`,this.compiler||this.Compiler),t?r(void 0,t):new Promise(r);function r(r,i){let a=su(e),o=n.parse(a);n.run(o,a,function(e,t,r){if(e||!t||!r)return s(e);let i=t,a=n.stringify(i,r);lu(a)?r.value=a:r.result=a,s(e,r)});function s(e,n){e||!n?i(e):r?r(n):t(void 0,n)}}}processSync(e){let t=!1,n;return this.freeze(),nu(`processSync`,this.parser||this.Parser),ru(`processSync`,this.compiler||this.Compiler),this.process(e,r),ou(`processSync`,`process`,t),n;function r(e,r){t=!0,Nl(e),n=r}}run(e,t,n){au(e),this.freeze();let r=this.transformers;return!n&&typeof t==`function`&&(n=t,t=void 0),n?i(void 0,n):new Promise(i);function i(i,a){let o=su(t);r.run(e,o,s);function s(t,r,o){let s=r||e;t?a(t):i?i(s):n(void 0,s,o)}}}runSync(e,t){let n=!1,r;return this.run(e,t,i),ou(`runSync`,`run`,n),r;function i(e,t){Nl(e),r=t,n=!0}}stringify(e,t){this.freeze();let n=su(t),r=this.compiler||this.Compiler;return ru(`stringify`,r),au(e),r(e,n)}use(e,...t){let n=this.attachers,r=this.namespace;if(iu(`use`,this.frozen),e!=null)if(typeof e==`function`)s(e,t);else if(typeof e==`object`)Array.isArray(e)?o(e):a(e);else throw TypeError("Expected usable value, not `"+e+"`");return this;function i(e){if(typeof e==`function`)s(e,[]);else if(typeof e==`object`)if(Array.isArray(e)){let[t,...n]=e;s(t,n)}else a(e);else throw TypeError("Expected usable value, not `"+e+"`")}function a(e){if(!(`plugins`in e)&&!(`settings`in e))throw Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");o(e.plugins),e.settings&&(r.settings=(0,$l.default)(!0,r.settings,e.settings))}function o(e){let t=-1;if(e!=null)if(Array.isArray(e))for(;++t<e.length;){let n=e[t];i(n)}else throw TypeError("Expected a list of plugins, not `"+e+"`")}function s(e,t){let r=-1,i=-1;for(;++r<n.length;)if(n[r][0]===e){i=r;break}if(i===-1)n.push([e,...t]);else if(t.length>0){let[r,...a]=t,o=n[i][1];Fl(o)&&Fl(r)&&(r=(0,$l.default)(!0,o,r)),n[i]=[e,r,...a]}}}}().freeze();function nu(e,t){if(typeof t!=`function`)throw TypeError("Cannot `"+e+"` without `parser`")}function ru(e,t){if(typeof t!=`function`)throw TypeError("Cannot `"+e+"` without `compiler`")}function iu(e,t){if(t)throw Error("Cannot call `"+e+"` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.")}function au(e){if(!Fl(e)||typeof e.type!=`string`)throw TypeError("Expected node, got `"+e+"`")}function ou(e,t,n){if(!n)throw Error("`"+e+"` finished async. Use `"+t+"` instead")}function su(e){return cu(e)?e:new ql(e)}function cu(e){return!!(e&&typeof e==`object`&&`message`in e&&`messages`in e)}function lu(e){return typeof e==`string`||uu(e)}function uu(e){return!!(e&&typeof e==`object`&&`byteLength`in e&&`byteOffset`in e)}var du=[],fu={allowDangerousHtml:!0},pu=/^(https?|ircs?|mailto|xmpp)$/i,mu=[{from:`astPlugins`,id:`remove-buggy-html-in-markdown-parser`},{from:`allowDangerousHtml`,id:`remove-buggy-html-in-markdown-parser`},{from:`allowNode`,id:`replace-allownode-allowedtypes-and-disallowedtypes`,to:`allowElement`},{from:`allowedTypes`,id:`replace-allownode-allowedtypes-and-disallowedtypes`,to:`allowedElements`},{from:`className`,id:`remove-classname`},{from:`disallowedTypes`,id:`replace-allownode-allowedtypes-and-disallowedtypes`,to:`disallowedElements`},{from:`escapeHtml`,id:`remove-buggy-html-in-markdown-parser`},{from:`includeElementIndex`,id:`#remove-includeelementindex`},{from:`includeNodeIndex`,id:`change-includenodeindex-to-includeelementindex`},{from:`linkTarget`,id:`remove-linktarget`},{from:`plugins`,id:`change-plugins-to-remarkplugins`,to:`remarkPlugins`},{from:`rawSourcePos`,id:`#remove-rawsourcepos`},{from:`renderers`,id:`change-renderers-to-components`,to:`components`},{from:`source`,id:`change-source-to-children`,to:`children`},{from:`sourcePos`,id:`#remove-sourcepos`},{from:`transformImageUri`,id:`#add-urltransform`,to:`urlTransform`},{from:`transformLinkUri`,id:`#add-urltransform`,to:`urlTransform`}];function hu(e){let t=gu(e),n=_u(e);return vu(t.runSync(t.parse(n),n),e)}function gu(e){let t=e.rehypePlugins||du,n=e.remarkPlugins||du,r=e.remarkRehypeOptions?{...e.remarkRehypeOptions,...fu}:fu;return tu().use(vc).use(n).use(Ml,r).use(t)}function _u(e){let t=e.children||``,n=new ql;return typeof t==`string`?n.value=t:``+t,n}function vu(e,t){let n=t.allowedElements,r=t.allowElement,i=t.components,a=t.disallowedElements,o=t.skipHtml,s=t.unwrapDisallowed,c=t.urlTransform||yu;for(let e of mu)Object.hasOwn(t,e.from)&&``+e.from+(e.to?"use `"+e.to+"` instead":`remove it`)+e.id;return Sl(e,l),$i(e,{Fragment:P.Fragment,components:i,ignoreInvalidStyle:!0,jsx:P.jsx,jsxs:P.jsxs,passKeys:!0,passNode:!0});function l(e,t,i){if(e.type===`raw`&&i&&typeof t==`number`)return o?i.children.splice(t,1):i.children[t]={type:`text`,value:e.value},t;if(e.type===`element`){let t;for(t in xa)if(Object.hasOwn(xa,t)&&Object.hasOwn(e.properties,t)){let n=e.properties[t],r=xa[t];(r===null||r.includes(e.tagName))&&(e.properties[t]=c(String(n||``),t,e))}}if(e.type===`element`){let o=n?!n.includes(e.tagName):a?a.includes(e.tagName):!1;if(!o&&r&&typeof t==`number`&&(o=!r(e,t,i)),o&&i&&typeof t==`number`)return s&&e.children?i.children.splice(t,1,...e.children):i.children.splice(t,1),t}}}function yu(e){let t=e.indexOf(`:`),n=e.indexOf(`?`),r=e.indexOf(`#`),i=e.indexOf(`/`);return t===-1||i!==-1&&t>i||n!==-1&&t>n||r!==-1&&t>r||pu.test(e.slice(0,t))?e:``}function bu(e,t){let n=String(e);if(typeof t!=`string`)throw TypeError(`Expected character`);let r=0,i=n.indexOf(t);for(;i!==-1;)r++,i=n.indexOf(t,i+t.length);return r}function xu(e){if(typeof e!=`string`)throw TypeError(`Expected a string`);return e.replace(/[|\\{}()[\]^$+*?.]/g,`\\$&`).replace(/-/g,`\\x2d`)}function Su(e,t,n){let r=dl((n||{}).ignore||[]),i=Cu(t),a=-1;for(;++a<i.length;)bl(e,`text`,o);function o(e,t){let n=-1,i;for(;++n<t.length;){let e=t[n],a=i?i.children:void 0;if(r(e,a?a.indexOf(e):void 0,i))return;i=e}if(i)return s(e,t)}function s(e,t){let n=t[t.length-1],r=i[a][0],o=i[a][1],s=0,c=n.children.indexOf(e),l=!1,u=[];r.lastIndex=0;let d=r.exec(e.value);for(;d;){let n=d.index,i={index:d.index,input:d.input,stack:[...t,e]},a=o(...d,i);if(typeof a==`string`&&(a=a.length>0?{type:`text`,value:a}:void 0),a===!1?r.lastIndex=n+1:(s!==n&&u.push({type:`text`,value:e.value.slice(s,n)}),Array.isArray(a)?u.push(...a):a&&u.push(a),s=n+d[0].length,l=!0),!r.global)break;d=r.exec(e.value)}return l?(s<e.value.length&&u.push({type:`text`,value:e.value.slice(s)}),n.children.splice(c,1,...u)):u=[e],c+u.length}}function Cu(e){let t=[];if(!Array.isArray(e))throw TypeError(`Expected find and replace tuple or list of tuples`);let n=!e[0]||Array.isArray(e[0])?e:[e],r=-1;for(;++r<n.length;){let e=n[r];t.push([wu(e[0]),Tu(e[1])])}return t}function wu(e){return typeof e==`string`?new RegExp(xu(e),`g`):e}function Tu(e){return typeof e==`function`?e:function(){return e}}var Eu=`phrasing`,Du=[`autolink`,`link`,`image`,`label`];function Ou(){return{transforms:[Iu],enter:{literalAutolink:Au,literalAutolinkEmail:ju,literalAutolinkHttp:ju,literalAutolinkWww:ju},exit:{literalAutolink:Fu,literalAutolinkEmail:Pu,literalAutolinkHttp:Mu,literalAutolinkWww:Nu}}}function ku(){return{unsafe:[{character:`@`,before:`[+\\-.\\w]`,after:`[\\-.\\w]`,inConstruct:Eu,notInConstruct:Du},{character:`.`,before:`[Ww]`,after:`[\\-.\\w]`,inConstruct:Eu,notInConstruct:Du},{character:`:`,before:`[ps]`,after:`\\/`,inConstruct:Eu,notInConstruct:Du}]}}function Au(e){this.enter({type:`link`,title:null,url:``,children:[]},e)}function ju(e){this.config.enter.autolinkProtocol.call(this,e)}function Mu(e){this.config.exit.autolinkProtocol.call(this,e)}function Nu(e){this.config.exit.data.call(this,e);let t=this.stack[this.stack.length-1];t.type,t.url=`http://`+this.sliceSerialize(e)}function Pu(e){this.config.exit.autolinkEmail.call(this,e)}function Fu(e){this.exit(e)}function Iu(e){Su(e,[[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi,Lu],[/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu,Ru]],{ignore:[`link`,`linkReference`]})}function Lu(e,t,n,r,i){let a=``;if(!Vu(i)||(/^w/i.test(t)&&(n=t+n,t=``,a=`http://`),!zu(n)))return!1;let o=Bu(n+r);if(!o[0])return!1;let s={type:`link`,title:null,url:a+t+o[0],children:[{type:`text`,value:t+o[0]}]};return o[1]?[s,{type:`text`,value:o[1]}]:s}function Ru(e,t,n,r){return!Vu(r,!0)||/[-\d_]$/.test(n)?!1:{type:`link`,title:null,url:`mailto:`+t+`@`+n,children:[{type:`text`,value:t+`@`+n}]}}function zu(e){let t=e.split(`.`);return!(t.length<2||t[t.length-1]&&(/_/.test(t[t.length-1])||!/[a-zA-Z\d]/.test(t[t.length-1]))||t[t.length-2]&&(/_/.test(t[t.length-2])||!/[a-zA-Z\d]/.test(t[t.length-2])))}function Bu(e){let t=/[!"&'),.:;<>?\]}]+$/.exec(e);if(!t)return[e,void 0];e=e.slice(0,t.index);let n=t[0],r=n.indexOf(`)`),i=bu(e,`(`),a=bu(e,`)`);for(;r!==-1&&i>a;)e+=n.slice(0,r+1),n=n.slice(r+1),r=n.indexOf(`)`),a++;return[e,n]}function Vu(e,t){let n=e.input.charCodeAt(e.index-1);return(e.index===0||Ga(n)||Wa(n))&&(!t||n!==47)}Xu.peek=Yu;function Hu(){this.buffer()}function Uu(e){this.enter({type:`footnoteReference`,identifier:``,label:``},e)}function Wu(){this.buffer()}function Z(e){this.enter({type:`footnoteDefinition`,identifier:``,label:``,children:[]},e)}function Gu(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.type,n.identifier=Ia(this.sliceSerialize(e)).toLowerCase(),n.label=t}function Ku(e){this.exit(e)}function qu(e){let t=this.resume(),n=this.stack[this.stack.length-1];n.type,n.identifier=Ia(this.sliceSerialize(e)).toLowerCase(),n.label=t}function Ju(e){this.exit(e)}function Yu(){return`[`}function Xu(e,t,n,r){let i=n.createTracker(r),a=i.move(`[^`),o=n.enter(`footnoteReference`),s=n.enter(`reference`);return a+=i.move(n.safe(n.associationId(e),{after:`]`,before:a})),s(),o(),a+=i.move(`]`),a}function Zu(){return{enter:{gfmFootnoteCallString:Hu,gfmFootnoteCall:Uu,gfmFootnoteDefinitionLabelString:Wu,gfmFootnoteDefinition:Z},exit:{gfmFootnoteCallString:Gu,gfmFootnoteCall:Ku,gfmFootnoteDefinitionLabelString:qu,gfmFootnoteDefinition:Ju}}}function Qu(e){let t=!1;return e&&e.firstLineBlank&&(t=!0),{handlers:{footnoteDefinition:n,footnoteReference:Xu},unsafe:[{character:`[`,inConstruct:[`label`,`phrasing`,`reference`]}]};function n(e,n,r,i){let a=r.createTracker(i),o=a.move(`[^`),s=r.enter(`footnoteDefinition`),c=r.enter(`label`);return o+=a.move(r.safe(r.associationId(e),{before:o,after:`]`})),c(),o+=a.move(`]:`),e.children&&e.children.length>0&&(a.shift(4),o+=a.move((t?`
`:` `)+r.indentLines(r.containerFlow(e,a.current()),t?ed:$u))),s(),o}}function $u(e,t,n){return t===0?e:ed(e,t,n)}function ed(e,t,n){return(n?``:`    `)+e}var td=[`autolink`,`destinationLiteral`,`destinationRaw`,`reference`,`titleQuote`,`titleApostrophe`];od.peek=sd;function nd(){return{canContainEols:[`delete`],enter:{strikethrough:id},exit:{strikethrough:ad}}}function rd(){return{unsafe:[{character:`~`,inConstruct:`phrasing`,notInConstruct:td}],handlers:{delete:od}}}function id(e){this.enter({type:`delete`,children:[]},e)}function ad(e){this.exit(e)}function od(e,t,n,r){let i=n.createTracker(r),a=n.enter(`strikethrough`),o=i.move(`~~`);return o+=n.containerPhrasing(e,{...i.current(),before:o,after:`~`}),o+=i.move(`~~`),a(),o}function sd(){return`~`}function cd(e){return e.length}function ld(e,t){let n=t||{},r=(n.align||[]).concat(),i=n.stringLength||cd,a=[],o=[],s=[],c=[],l=0,u=-1;for(;++u<e.length;){let t=[],r=[],a=-1;for(e[u].length>l&&(l=e[u].length);++a<e[u].length;){let o=ud(e[u][a]);if(n.alignDelimiters!==!1){let e=i(o);r[a]=e,(c[a]===void 0||e>c[a])&&(c[a]=e)}t.push(o)}o[u]=t,s[u]=r}let d=-1;if(typeof r==`object`&&`length`in r)for(;++d<l;)a[d]=dd(r[d]);else{let e=dd(r);for(;++d<l;)a[d]=e}d=-1;let f=[],p=[];for(;++d<l;){let e=a[d],t=``,r=``;e===99?(t=`:`,r=`:`):e===108?t=`:`:e===114&&(r=`:`);let i=n.alignDelimiters===!1?1:Math.max(1,c[d]-t.length-r.length),o=t+`-`.repeat(i)+r;n.alignDelimiters!==!1&&(i=t.length+i+r.length,i>c[d]&&(c[d]=i),p[d]=i),f[d]=o}o.splice(1,0,f),s.splice(1,0,p),u=-1;let m=[];for(;++u<o.length;){let e=o[u],t=s[u];d=-1;let r=[];for(;++d<l;){let i=e[d]||``,o=``,s=``;if(n.alignDelimiters!==!1){let e=c[d]-(t[d]||0),n=a[d];n===114?o=` `.repeat(e):n===99?e%2?(o=` `.repeat(e/2+.5),s=` `.repeat(e/2-.5)):(o=` `.repeat(e/2),s=o):s=` `.repeat(e)}n.delimiterStart!==!1&&!d&&r.push(`|`),n.padding!==!1&&!(n.alignDelimiters===!1&&i===``)&&(n.delimiterStart!==!1||d)&&r.push(` `),n.alignDelimiters!==!1&&r.push(o),r.push(i),n.alignDelimiters!==!1&&r.push(s),n.padding!==!1&&r.push(` `),(n.delimiterEnd!==!1||d!==l-1)&&r.push(`|`)}m.push(n.delimiterEnd===!1?r.join(``).replace(/ +$/,``):r.join(``))}return m.join(`
`)}function ud(e){return e==null?``:String(e)}function dd(e){let t=typeof e==`string`?e.codePointAt(0):0;return t===67||t===99?99:t===76||t===108?108:t===82||t===114?114:0}function fd(e,t,n,r){let i=n.enter(`blockquote`),a=n.createTracker(r);a.move(`> `),a.shift(2);let o=n.indentLines(n.containerFlow(e,a.current()),pd);return i(),o}function pd(e,t,n){return`>`+(n?``:` `)+e}function md(e,t){return hd(e,t.inConstruct,!0)&&!hd(e,t.notInConstruct,!1)}function hd(e,t,n){if(typeof t==`string`&&(t=[t]),!t||t.length===0)return n;let r=-1;for(;++r<t.length;)if(e.includes(t[r]))return!0;return!1}function gd(e,t,n,r){let i=-1;for(;++i<n.unsafe.length;)if(n.unsafe[i].character===`
`&&md(n.stack,n.unsafe[i]))return/[ \t]/.test(r.before)?``:` `;return`\\
`}function _d(e,t){let n=String(e),r=n.indexOf(t),i=r,a=0,o=0;if(typeof t!=`string`)throw TypeError(`Expected substring`);for(;r!==-1;)r===i?++a>o&&(o=a):a=1,i=r+t.length,r=n.indexOf(t,i);return o}function vd(e,t){return!!(t.options.fences===!1&&e.value&&!e.lang&&/[^ \r\n]/.test(e.value)&&!/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value))}function yd(e){let t=e.options.fence||"`";if(t!=="`"&&t!==`~`)throw Error("Cannot serialize code with `"+t+"` for `options.fence`, expected `` ` `` or `~`");return t}function Q(e,t,n,r){let i=yd(n),a=e.value||``,o=i==="`"?`GraveAccent`:`Tilde`;if(vd(e,n)){let e=n.enter(`codeIndented`),t=n.indentLines(a,bd);return e(),t}let s=n.createTracker(r),c=i.repeat(Math.max(_d(a,i)+1,3)),l=n.enter(`codeFenced`),u=s.move(c);if(e.lang){let t=n.enter(`codeFencedLang${o}`);u+=s.move(n.safe(e.lang,{before:u,after:` `,encode:["`"],...s.current()})),t()}if(e.lang&&e.meta){let t=n.enter(`codeFencedMeta${o}`);u+=s.move(` `),u+=s.move(n.safe(e.meta,{before:u,after:`
`,encode:["`"],...s.current()})),t()}return u+=s.move(`
`),a&&(u+=s.move(a+`
`)),u+=s.move(c),l(),u}function bd(e,t,n){return(n?``:`    `)+e}function xd(e){let t=e.options.quote||`"`;if(t!==`"`&&t!==`'`)throw Error("Cannot serialize title with `"+t+"` for `options.quote`, expected `\"`, or `'`");return t}function Sd(e,t,n,r){let i=xd(n),a=i===`"`?`Quote`:`Apostrophe`,o=n.enter(`definition`),s=n.enter(`label`),c=n.createTracker(r),l=c.move(`[`);return l+=c.move(n.safe(n.associationId(e),{before:l,after:`]`,...c.current()})),l+=c.move(`]: `),s(),!e.url||/[\0- \u007F]/.test(e.url)?(s=n.enter(`destinationLiteral`),l+=c.move(`<`),l+=c.move(n.safe(e.url,{before:l,after:`>`,...c.current()})),l+=c.move(`>`)):(s=n.enter(`destinationRaw`),l+=c.move(n.safe(e.url,{before:l,after:e.title?` `:`
`,...c.current()}))),s(),e.title&&(s=n.enter(`title${a}`),l+=c.move(` `+i),l+=c.move(n.safe(e.title,{before:l,after:i,...c.current()})),l+=c.move(i),s()),o(),l}function Cd(e){let t=e.options.emphasis||`*`;if(t!==`*`&&t!==`_`)throw Error("Cannot serialize emphasis with `"+t+"` for `options.emphasis`, expected `*`, or `_`");return t}function wd(e){return`&#x`+e.toString(16).toUpperCase()+`;`}function Td(e,t,n){let r=eo(e),i=eo(t);return r===void 0?i===void 0?n===`_`?{inside:!0,outside:!0}:{inside:!1,outside:!1}:i===1?{inside:!0,outside:!0}:{inside:!1,outside:!0}:r===1?i===void 0?{inside:!1,outside:!1}:i===1?{inside:!0,outside:!0}:{inside:!1,outside:!1}:i===void 0?{inside:!1,outside:!1}:i===1?{inside:!0,outside:!1}:{inside:!1,outside:!1}}Ed.peek=Dd;function Ed(e,t,n,r){let i=Cd(n),a=n.enter(`emphasis`),o=n.createTracker(r),s=o.move(i),c=o.move(n.containerPhrasing(e,{after:i,before:s,...o.current()})),l=c.charCodeAt(0),u=Td(r.before.charCodeAt(r.before.length-1),l,i);u.inside&&(c=wd(l)+c.slice(1));let d=c.charCodeAt(c.length-1),f=Td(r.after.charCodeAt(0),d,i);f.inside&&(c=c.slice(0,-1)+wd(d));let p=o.move(i);return a(),n.attentionEncodeSurroundingInfo={after:f.outside,before:u.outside},s+c+p}function Dd(e,t,n){return n.options.emphasis||`*`}function Od(e,t){let n=!1;return Sl(e,function(e){if(`value`in e&&/\r?\n|\r/.test(e.value)||e.type===`break`)return n=!0,!1}),!!((!e.depth||e.depth<3)&&Ca(e)&&(t.options.setext||n))}function kd(e,t,n,r){let i=Math.max(Math.min(6,e.depth||1),1),a=n.createTracker(r);if(Od(e,n)){let t=n.enter(`headingSetext`),r=n.enter(`phrasing`),o=n.containerPhrasing(e,{...a.current(),before:`
`,after:`
`});return r(),t(),o+`
`+(i===1?`=`:`-`).repeat(o.length-(Math.max(o.lastIndexOf(`\r`),o.lastIndexOf(`
`))+1))}let o=`#`.repeat(i),s=n.enter(`headingAtx`),c=n.enter(`phrasing`);a.move(o+` `);let l=n.containerPhrasing(e,{before:`# `,after:`
`,...a.current()});return/^[\t ]/.test(l)&&(l=wd(l.charCodeAt(0))+l.slice(1)),l=l?o+` `+l:o,n.options.closeAtx&&(l+=` `+o),c(),s(),l}Ad.peek=jd;function Ad(e){return e.value||``}function jd(){return`<`}Md.peek=$;function Md(e,t,n,r){let i=xd(n),a=i===`"`?`Quote`:`Apostrophe`,o=n.enter(`image`),s=n.enter(`label`),c=n.createTracker(r),l=c.move(`![`);return l+=c.move(n.safe(e.alt,{before:l,after:`]`,...c.current()})),l+=c.move(`](`),s(),!e.url&&e.title||/[\0- \u007F]/.test(e.url)?(s=n.enter(`destinationLiteral`),l+=c.move(`<`),l+=c.move(n.safe(e.url,{before:l,after:`>`,...c.current()})),l+=c.move(`>`)):(s=n.enter(`destinationRaw`),l+=c.move(n.safe(e.url,{before:l,after:e.title?` `:`)`,...c.current()}))),s(),e.title&&(s=n.enter(`title${a}`),l+=c.move(` `+i),l+=c.move(n.safe(e.title,{before:l,after:i,...c.current()})),l+=c.move(i),s()),l+=c.move(`)`),o(),l}function $(){return`!`}Nd.peek=Pd;function Nd(e,t,n,r){let i=e.referenceType,a=n.enter(`imageReference`),o=n.enter(`label`),s=n.createTracker(r),c=s.move(`![`),l=n.safe(e.alt,{before:c,after:`]`,...s.current()});c+=s.move(l+`][`),o();let u=n.stack;n.stack=[],o=n.enter(`reference`);let d=n.safe(n.associationId(e),{before:c,after:`]`,...s.current()});return o(),n.stack=u,a(),i===`full`||!l||l!==d?c+=s.move(d+`]`):i===`shortcut`?c=c.slice(0,-1):c+=s.move(`]`),c}function Pd(){return`!`}Fd.peek=Id;function Fd(e,t,n){let r=e.value||``,i="`",a=-1;for(;RegExp("(^|[^`])"+i+"([^`]|$)").test(r);)i+="`";for(/[^ \r\n]/.test(r)&&(/^[ \r\n]/.test(r)&&/[ \r\n]$/.test(r)||/^`|`$/.test(r))&&(r=` `+r+` `);++a<n.unsafe.length;){let e=n.unsafe[a],t=n.compilePattern(e),i;if(e.atBreak)for(;i=t.exec(r);){let e=i.index;r.charCodeAt(e)===10&&r.charCodeAt(e-1)===13&&e--,r=r.slice(0,e)+` `+r.slice(i.index+1)}}return i+r+i}function Id(){return"`"}function Ld(e,t){let n=Ca(e);return!!(!t.options.resourceLink&&e.url&&!e.title&&e.children&&e.children.length===1&&e.children[0].type===`text`&&(n===e.url||`mailto:`+n===e.url)&&/^[a-z][a-z+.-]+:/i.test(e.url)&&!/[\0- <>\u007F]/.test(e.url))}Rd.peek=zd;function Rd(e,t,n,r){let i=xd(n),a=i===`"`?`Quote`:`Apostrophe`,o=n.createTracker(r),s,c;if(Ld(e,n)){let t=n.stack;n.stack=[],s=n.enter(`autolink`);let r=o.move(`<`);return r+=o.move(n.containerPhrasing(e,{before:r,after:`>`,...o.current()})),r+=o.move(`>`),s(),n.stack=t,r}s=n.enter(`link`),c=n.enter(`label`);let l=o.move(`[`);return l+=o.move(n.containerPhrasing(e,{before:l,after:`](`,...o.current()})),l+=o.move(`](`),c(),!e.url&&e.title||/[\0- \u007F]/.test(e.url)?(c=n.enter(`destinationLiteral`),l+=o.move(`<`),l+=o.move(n.safe(e.url,{before:l,after:`>`,...o.current()})),l+=o.move(`>`)):(c=n.enter(`destinationRaw`),l+=o.move(n.safe(e.url,{before:l,after:e.title?` `:`)`,...o.current()}))),c(),e.title&&(c=n.enter(`title${a}`),l+=o.move(` `+i),l+=o.move(n.safe(e.title,{before:l,after:i,...o.current()})),l+=o.move(i),c()),l+=o.move(`)`),s(),l}function zd(e,t,n){return Ld(e,n)?`<`:`[`}Bd.peek=Vd;function Bd(e,t,n,r){let i=e.referenceType,a=n.enter(`linkReference`),o=n.enter(`label`),s=n.createTracker(r),c=s.move(`[`),l=n.containerPhrasing(e,{before:c,after:`]`,...s.current()});c+=s.move(l+`][`),o();let u=n.stack;n.stack=[],o=n.enter(`reference`);let d=n.safe(n.associationId(e),{before:c,after:`]`,...s.current()});return o(),n.stack=u,a(),i===`full`||!l||l!==d?c+=s.move(d+`]`):i===`shortcut`?c=c.slice(0,-1):c+=s.move(`]`),c}function Vd(){return`[`}function Hd(e){let t=e.options.bullet||`*`;if(t!==`*`&&t!==`+`&&t!==`-`)throw Error("Cannot serialize items with `"+t+"` for `options.bullet`, expected `*`, `+`, or `-`");return t}function Ud(e){let t=Hd(e),n=e.options.bulletOther;if(!n)return t===`*`?`-`:`*`;if(n!==`*`&&n!==`+`&&n!==`-`)throw Error("Cannot serialize items with `"+n+"` for `options.bulletOther`, expected `*`, `+`, or `-`");if(n===t)throw Error("Expected `bullet` (`"+t+"`) and `bulletOther` (`"+n+"`) to be different");return n}function Wd(e){let t=e.options.bulletOrdered||`.`;if(t!==`.`&&t!==`)`)throw Error("Cannot serialize items with `"+t+"` for `options.bulletOrdered`, expected `.` or `)`");return t}function Gd(e){let t=e.options.rule||`*`;if(t!==`*`&&t!==`-`&&t!==`_`)throw Error("Cannot serialize rules with `"+t+"` for `options.rule`, expected `*`, `-`, or `_`");return t}function Kd(e,t,n,r){let i=n.enter(`list`),a=n.bulletCurrent,o=e.ordered?Wd(n):Hd(n),s=e.ordered?o===`.`?`)`:`.`:Ud(n),c=t&&n.bulletLastUsed?o===n.bulletLastUsed:!1;if(!e.ordered){let t=e.children?e.children[0]:void 0;if((o===`*`||o===`-`)&&t&&(!t.children||!t.children[0])&&n.stack[n.stack.length-1]===`list`&&n.stack[n.stack.length-2]===`listItem`&&n.stack[n.stack.length-3]===`list`&&n.stack[n.stack.length-4]===`listItem`&&n.indexStack[n.indexStack.length-1]===0&&n.indexStack[n.indexStack.length-2]===0&&n.indexStack[n.indexStack.length-3]===0&&(c=!0),Gd(n)===o&&t){let t=-1;for(;++t<e.children.length;){let n=e.children[t];if(n&&n.type===`listItem`&&n.children&&n.children[0]&&n.children[0].type===`thematicBreak`){c=!0;break}}}}c&&(o=s),n.bulletCurrent=o;let l=n.containerFlow(e,r);return n.bulletLastUsed=o,n.bulletCurrent=a,i(),l}function qd(e){let t=e.options.listItemIndent||`one`;if(t!==`tab`&&t!==`one`&&t!==`mixed`)throw Error("Cannot serialize items with `"+t+"` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");return t}function Jd(e,t,n,r){let i=qd(n),a=n.bulletCurrent||Hd(n);t&&t.type===`list`&&t.ordered&&(a=(typeof t.start==`number`&&t.start>-1?t.start:1)+(n.options.incrementListMarker===!1?0:t.children.indexOf(e))+a);let o=a.length+1;(i===`tab`||i===`mixed`&&(t&&t.type===`list`&&t.spread||e.spread))&&(o=Math.ceil(o/4)*4);let s=n.createTracker(r);s.move(a+` `.repeat(o-a.length)),s.shift(o);let c=n.enter(`listItem`),l=n.indentLines(n.containerFlow(e,s.current()),u);return c(),l;function u(e,t,n){return t?(n?``:` `.repeat(o))+e:(n?a:a+` `.repeat(o-a.length))+e}}function Yd(e,t,n,r){let i=n.enter(`paragraph`),a=n.enter(`phrasing`),o=n.containerPhrasing(e,r);return a(),i(),o}var Xd=dl([`break`,`delete`,`emphasis`,`footnote`,`footnoteReference`,`image`,`imageReference`,`inlineCode`,`inlineMath`,`link`,`linkReference`,`mdxJsxTextElement`,`mdxTextExpression`,`strong`,`text`,`textDirective`]);function Zd(e,t,n,r){return(e.children.some(function(e){return Xd(e)})?n.containerPhrasing:n.containerFlow).call(n,e,r)}function Qd(e){let t=e.options.strong||`*`;if(t!==`*`&&t!==`_`)throw Error("Cannot serialize strong with `"+t+"` for `options.strong`, expected `*`, or `_`");return t}$d.peek=ef;function $d(e,t,n,r){let i=Qd(n),a=n.enter(`strong`),o=n.createTracker(r),s=o.move(i+i),c=o.move(n.containerPhrasing(e,{after:i,before:s,...o.current()})),l=c.charCodeAt(0),u=Td(r.before.charCodeAt(r.before.length-1),l,i);u.inside&&(c=wd(l)+c.slice(1));let d=c.charCodeAt(c.length-1),f=Td(r.after.charCodeAt(0),d,i);f.inside&&(c=c.slice(0,-1)+wd(d));let p=o.move(i+i);return a(),n.attentionEncodeSurroundingInfo={after:f.outside,before:u.outside},s+c+p}function ef(e,t,n){return n.options.strong||`*`}function tf(e,t,n,r){return n.safe(e.value,r)}function nf(e){let t=e.options.ruleRepetition||3;if(t<3)throw Error("Cannot serialize rules with repetition `"+t+"` for `options.ruleRepetition`, expected `3` or more");return t}function rf(e,t,n){let r=(Gd(n)+(n.options.ruleSpaces?` `:``)).repeat(nf(n));return n.options.ruleSpaces?r.slice(0,-1):r}var af={blockquote:fd,break:gd,code:Q,definition:Sd,emphasis:Ed,hardBreak:gd,heading:kd,html:Ad,image:Md,imageReference:Nd,inlineCode:Fd,link:Rd,linkReference:Bd,list:Kd,listItem:Jd,paragraph:Yd,root:Zd,strong:$d,text:tf,thematicBreak:rf};function of(){return{enter:{table:sf,tableData:df,tableHeader:df,tableRow:lf},exit:{codeText:ff,table:cf,tableData:uf,tableHeader:uf,tableRow:uf}}}function sf(e){let t=e._align;this.enter({type:`table`,align:t.map(function(e){return e===`none`?null:e}),children:[]},e),this.data.inTable=!0}function cf(e){this.exit(e),this.data.inTable=void 0}function lf(e){this.enter({type:`tableRow`,children:[]},e)}function uf(e){this.exit(e)}function df(e){this.enter({type:`tableCell`,children:[]},e)}function ff(e){let t=this.resume();this.data.inTable&&(t=t.replace(/\\([\\|])/g,pf));let n=this.stack[this.stack.length-1];n.type,n.value=t,this.exit(e)}function pf(e,t){return t===`|`?t:e}function mf(e){let t=e||{},n=t.tableCellPadding,r=t.tablePipeAlign,i=t.stringLength,a=n?` `:`|`;return{unsafe:[{character:`\r`,inConstruct:`tableCell`},{character:`
`,inConstruct:`tableCell`},{atBreak:!0,character:`|`,after:`[	 :-]`},{character:`|`,inConstruct:`tableCell`},{atBreak:!0,character:`:`,after:`-`},{atBreak:!0,character:`-`,after:`[:|-]`}],handlers:{inlineCode:f,table:o,tableCell:c,tableRow:s}};function o(e,t,n,r){return l(u(e,n,r),e.align)}function s(e,t,n,r){let i=l([d(e,n,r)]);return i.slice(0,i.indexOf(`
`))}function c(e,t,n,r){let i=n.enter(`tableCell`),o=n.enter(`phrasing`),s=n.containerPhrasing(e,{...r,before:a,after:a});return o(),i(),s}function l(e,t){return ld(e,{align:t,alignDelimiters:r,padding:n,stringLength:i})}function u(e,t,n){let r=e.children,i=-1,a=[],o=t.enter(`table`);for(;++i<r.length;)a[i]=d(r[i],t,n);return o(),a}function d(e,t,n){let r=e.children,i=-1,a=[],o=t.enter(`tableRow`);for(;++i<r.length;)a[i]=c(r[i],e,t,n);return o(),a}function f(e,t,n){let r=af.inlineCode(e,t,n);return n.stack.includes(`tableCell`)&&(r=r.replace(/\|/g,`\\$&`)),r}}function hf(){return{exit:{taskListCheckValueChecked:_f,taskListCheckValueUnchecked:_f,paragraph:vf}}}function gf(){return{unsafe:[{atBreak:!0,character:`-`,after:`[:|-]`}],handlers:{listItem:yf}}}function _f(e){let t=this.stack[this.stack.length-2];t.type,t.checked=e.type===`taskListCheckValueChecked`}function vf(e){let t=this.stack[this.stack.length-2];if(t&&t.type===`listItem`&&typeof t.checked==`boolean`){let e=this.stack[this.stack.length-1];e.type;let n=e.children[0];if(n&&n.type===`text`){let r=t.children,i=-1,a;for(;++i<r.length;){let e=r[i];if(e.type===`paragraph`){a=e;break}}a===e&&(n.value=n.value.slice(1),n.value.length===0?e.children.shift():e.position&&n.position&&typeof n.position.start.offset==`number`&&(n.position.start.column++,n.position.start.offset++,e.position.start=Object.assign({},n.position.start)))}}this.exit(e)}function yf(e,t,n,r){let i=e.children[0],a=typeof e.checked==`boolean`&&i&&i.type===`paragraph`,o=`[`+(e.checked?`x`:` `)+`] `,s=n.createTracker(r);a&&s.move(o);let c=af.listItem(e,t,n,{...r,...s.current()});return a&&(c=c.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/,l)),c;function l(e){return e+o}}function bf(){return[Ou(),Zu(),nd(),of(),hf()]}function xf(e){return{extensions:[ku(),Qu(e),rd(),mf(e),gf()]}}var Sf={tokenize:If,partial:!0},Cf={tokenize:Lf,partial:!0},wf={tokenize:Rf,partial:!0},Tf={tokenize:zf,partial:!0},Ef={tokenize:Bf,partial:!0},Df={name:`wwwAutolink`,tokenize:Pf,previous:Vf},Of={name:`protocolAutolink`,tokenize:Ff,previous:Hf},kf={name:`emailAutolink`,tokenize:Nf,previous:Uf},Af={};function jf(){return{text:Af}}for(var Mf=48;Mf<123;)Af[Mf]=kf,Mf++,Mf===58?Mf=65:Mf===91&&(Mf=97);Af[43]=kf,Af[45]=kf,Af[46]=kf,Af[95]=kf,Af[72]=[kf,Of],Af[104]=[kf,Of],Af[87]=[kf,Df],Af[119]=[kf,Df];function Nf(e,t,n){let r=this,i,a;return o;function o(t){return!Wf(t)||!Uf.call(r,r.previous)||Gf(r.events)?n(t):(e.enter(`literalAutolink`),e.enter(`literalAutolinkEmail`),s(t))}function s(t){return Wf(t)?(e.consume(t),s):t===64?(e.consume(t),c):n(t)}function c(t){return t===46?e.check(Ef,u,l)(t):t===45||t===95||Ra(t)?(a=!0,e.consume(t),c):u(t)}function l(t){return e.consume(t),i=!0,c}function u(o){return a&&i&&La(r.previous)?(e.exit(`literalAutolinkEmail`),e.exit(`literalAutolink`),t(o)):n(o)}}function Pf(e,t,n){let r=this;return i;function i(t){return t!==87&&t!==119||!Vf.call(r,r.previous)||Gf(r.events)?n(t):(e.enter(`literalAutolink`),e.enter(`literalAutolinkWww`),e.check(Sf,e.attempt(Cf,e.attempt(wf,a),n),n)(t))}function a(n){return e.exit(`literalAutolinkWww`),e.exit(`literalAutolink`),t(n)}}function Ff(e,t,n){let r=this,i=``,a=!1;return o;function o(t){return(t===72||t===104)&&Hf.call(r,r.previous)&&!Gf(r.events)?(e.enter(`literalAutolink`),e.enter(`literalAutolinkHttp`),i+=String.fromCodePoint(t),e.consume(t),s):n(t)}function s(t){if(La(t)&&i.length<5)return i+=String.fromCodePoint(t),e.consume(t),s;if(t===58){let n=i.toLowerCase();if(n===`http`||n===`https`)return e.consume(t),c}return n(t)}function c(t){return t===47?(e.consume(t),a?l:(a=!0,c)):n(t)}function l(t){return t===null||Ba(t)||B(t)||Ga(t)||Wa(t)?n(t):e.attempt(Cf,e.attempt(wf,u),n)(t)}function u(n){return e.exit(`literalAutolinkHttp`),e.exit(`literalAutolink`),t(n)}}function If(e,t,n){let r=0;return i;function i(t){return(t===87||t===119)&&r<3?(r++,e.consume(t),i):t===46&&r===3?(e.consume(t),a):n(t)}function a(e){return e===null?n(e):t(e)}}function Lf(e,t,n){let r,i,a;return o;function o(t){return t===46||t===95?e.check(Tf,c,s)(t):t===null||B(t)||Ga(t)||t!==45&&Wa(t)?c(t):(a=!0,e.consume(t),o)}function s(t){return t===95?r=!0:(i=r,r=void 0),e.consume(t),o}function c(e){return i||r||!a?n(e):t(e)}}function Rf(e,t){let n=0,r=0;return i;function i(o){return o===40?(n++,e.consume(o),i):o===41&&r<n?a(o):o===33||o===34||o===38||o===39||o===41||o===42||o===44||o===46||o===58||o===59||o===60||o===63||o===93||o===95||o===126?e.check(Tf,t,a)(o):o===null||B(o)||Ga(o)?t(o):(e.consume(o),i)}function a(t){return t===41&&r++,e.consume(t),i}}function zf(e,t,n){return r;function r(o){return o===33||o===34||o===39||o===41||o===42||o===44||o===46||o===58||o===59||o===63||o===95||o===126?(e.consume(o),r):o===38?(e.consume(o),a):o===93?(e.consume(o),i):o===60||o===null||B(o)||Ga(o)?t(o):n(o)}function i(e){return e===null||e===40||e===91||B(e)||Ga(e)?t(e):r(e)}function a(e){return La(e)?o(e):n(e)}function o(t){return t===59?(e.consume(t),r):La(t)?(e.consume(t),o):n(t)}}function Bf(e,t,n){return r;function r(t){return e.consume(t),i}function i(e){return Ra(e)?n(e):t(e)}}function Vf(e){return e===null||e===40||e===42||e===95||e===91||e===93||e===126||B(e)}function Hf(e){return!La(e)}function Uf(e){return!(e===47||Wf(e))}function Wf(e){return e===43||e===45||e===46||e===95||Ra(e)}function Gf(e){let t=e.length,n=!1;for(;t--;){let r=e[t][1];if((r.type===`labelLink`||r.type===`labelImage`)&&!r._balanced){n=!0;break}if(r._gfmAutolinkLiteralWalkedInto){n=!1;break}}return e.length>0&&!n&&(e[e.length-1][1]._gfmAutolinkLiteralWalkedInto=!0),n}var Kf={tokenize:ep,partial:!0};function qf(){return{document:{91:{name:`gfmFootnoteDefinition`,tokenize:Zf,continuation:{tokenize:Qf},exit:$f}},text:{91:{name:`gfmFootnoteCall`,tokenize:Xf},93:{name:`gfmPotentialFootnoteCall`,add:`after`,tokenize:Jf,resolveTo:Yf}}}}function Jf(e,t,n){let r=this,i=r.events.length,a=r.parser.gfmFootnotes||(r.parser.gfmFootnotes=[]),o;for(;i--;){let e=r.events[i][1];if(e.type===`labelImage`){o=e;break}if(e.type===`gfmFootnoteCall`||e.type===`labelLink`||e.type===`label`||e.type===`image`||e.type===`link`)break}return s;function s(i){if(!o||!o._balanced)return n(i);let s=Ia(r.sliceSerialize({start:o.end,end:r.now()}));return s.codePointAt(0)!==94||!a.includes(s.slice(1))?n(i):(e.enter(`gfmFootnoteCallLabelMarker`),e.consume(i),e.exit(`gfmFootnoteCallLabelMarker`),t(i))}}function Yf(e,t){let n=e.length;for(;n--;)if(e[n][1].type===`labelImage`&&e[n][0]===`enter`){e[n][1];break}e[n+1][1].type=`data`,e[n+3][1].type=`gfmFootnoteCallLabelMarker`;let r={type:`gfmFootnoteCall`,start:Object.assign({},e[n+3][1].start),end:Object.assign({},e[e.length-1][1].end)},i={type:`gfmFootnoteCallMarker`,start:Object.assign({},e[n+3][1].end),end:Object.assign({},e[n+3][1].end)};i.end.column++,i.end.offset++,i.end._bufferIndex++;let a={type:`gfmFootnoteCallString`,start:Object.assign({},i.end),end:Object.assign({},e[e.length-1][1].start)},o={type:`chunkString`,contentType:`string`,start:Object.assign({},a.start),end:Object.assign({},a.end)},s=[e[n+1],e[n+2],[`enter`,r,t],e[n+3],e[n+4],[`enter`,i,t],[`exit`,i,t],[`enter`,a,t],[`enter`,o,t],[`exit`,o,t],[`exit`,a,t],e[e.length-2],e[e.length-1],[`exit`,r,t]];return e.splice(n,e.length-n+1,...s),e}function Xf(e,t,n){let r=this,i=r.parser.gfmFootnotes||(r.parser.gfmFootnotes=[]),a=0,o;return s;function s(t){return e.enter(`gfmFootnoteCall`),e.enter(`gfmFootnoteCallLabelMarker`),e.consume(t),e.exit(`gfmFootnoteCallLabelMarker`),c}function c(t){return t===94?(e.enter(`gfmFootnoteCallMarker`),e.consume(t),e.exit(`gfmFootnoteCallMarker`),e.enter(`gfmFootnoteCallString`),e.enter(`chunkString`).contentType=`string`,l):n(t)}function l(s){if(a>999||s===93&&!o||s===null||s===91||B(s))return n(s);if(s===93){e.exit(`chunkString`);let a=e.exit(`gfmFootnoteCallString`);return i.includes(Ia(r.sliceSerialize(a)))?(e.enter(`gfmFootnoteCallLabelMarker`),e.consume(s),e.exit(`gfmFootnoteCallLabelMarker`),e.exit(`gfmFootnoteCall`),t):n(s)}return B(s)||(o=!0),a++,e.consume(s),s===92?u:l}function u(t){return t===91||t===92||t===93?(e.consume(t),a++,l):l(t)}}function Zf(e,t,n){let r=this,i=r.parser.gfmFootnotes||(r.parser.gfmFootnotes=[]),a,o=0,s;return c;function c(t){return e.enter(`gfmFootnoteDefinition`)._container=!0,e.enter(`gfmFootnoteDefinitionLabel`),e.enter(`gfmFootnoteDefinitionLabelMarker`),e.consume(t),e.exit(`gfmFootnoteDefinitionLabelMarker`),l}function l(t){return t===94?(e.enter(`gfmFootnoteDefinitionMarker`),e.consume(t),e.exit(`gfmFootnoteDefinitionMarker`),e.enter(`gfmFootnoteDefinitionLabelString`),e.enter(`chunkString`).contentType=`string`,u):n(t)}function u(t){if(o>999||t===93&&!s||t===null||t===91||B(t))return n(t);if(t===93){e.exit(`chunkString`);let n=e.exit(`gfmFootnoteDefinitionLabelString`);return a=Ia(r.sliceSerialize(n)),e.enter(`gfmFootnoteDefinitionLabelMarker`),e.consume(t),e.exit(`gfmFootnoteDefinitionLabelMarker`),e.exit(`gfmFootnoteDefinitionLabel`),f}return B(t)||(s=!0),o++,e.consume(t),t===92?d:u}function d(t){return t===91||t===92||t===93?(e.consume(t),o++,u):u(t)}function f(t){return t===58?(e.enter(`definitionMarker`),e.consume(t),e.exit(`definitionMarker`),i.includes(a)||i.push(a),H(e,p,`gfmFootnoteDefinitionWhitespace`)):n(t)}function p(e){return t(e)}}function Qf(e,t,n){return e.check(co,t,e.attempt(Kf,t,n))}function $f(e){e.exit(`gfmFootnoteDefinition`)}function ep(e,t,n){let r=this;return H(e,i,`gfmFootnoteDefinitionIndent`,5);function i(e){let i=r.events[r.events.length-1];return i&&i[1].type===`gfmFootnoteDefinitionIndent`&&i[2].sliceSerialize(i[1],!0).length===4?t(e):n(e)}}function tp(e){let t=(e||{}).singleTilde,n={name:`strikethrough`,tokenize:i,resolveAll:r};return t??=!0,{text:{126:n},insideSpan:{null:[n]},attentionMarkers:{null:[126]}};function r(e,t){let n=-1;for(;++n<e.length;)if(e[n][0]===`enter`&&e[n][1].type===`strikethroughSequenceTemporary`&&e[n][1]._close){let r=n;for(;r--;)if(e[r][0]===`exit`&&e[r][1].type===`strikethroughSequenceTemporary`&&e[r][1]._open&&e[n][1].end.offset-e[n][1].start.offset===e[r][1].end.offset-e[r][1].start.offset){e[n][1].type=`strikethroughSequence`,e[r][1].type=`strikethroughSequence`;let i={type:`strikethrough`,start:Object.assign({},e[r][1].start),end:Object.assign({},e[n][1].end)},a={type:`strikethroughText`,start:Object.assign({},e[r][1].end),end:Object.assign({},e[n][1].start)},o=[[`enter`,i,t],[`enter`,e[r][1],t],[`exit`,e[r][1],t],[`enter`,a,t]],s=t.parser.constructs.insideSpan.null;s&&ka(o,o.length,0,to(s,e.slice(r+1,n),t)),ka(o,o.length,0,[[`exit`,a,t],[`enter`,e[n][1],t],[`exit`,e[n][1],t],[`exit`,i,t]]),ka(e,r-1,n-r+3,o),n=r+o.length-2;break}}for(n=-1;++n<e.length;)e[n][1].type===`strikethroughSequenceTemporary`&&(e[n][1].type=`data`);return e}function i(e,n,r){let i=this.previous,a=this.events,o=0;return s;function s(t){return i===126&&a[a.length-1][1].type!==`characterEscape`?r(t):(e.enter(`strikethroughSequenceTemporary`),c(t))}function c(a){let s=eo(i);if(a===126)return o>1?r(a):(e.consume(a),o++,c);if(o<2&&!t)return r(a);let l=e.exit(`strikethroughSequenceTemporary`),u=eo(a);return l._open=!u||u===2&&!!s,l._close=!s||s===2&&!!u,n(a)}}}var np=class{constructor(){this.map=[]}add(e,t,n){rp(this,e,t,n)}consume(e){if(this.map.sort(function(e,t){return e[0]-t[0]}),this.map.length===0)return;let t=this.map.length,n=[];for(;t>0;)--t,n.push(e.slice(this.map[t][0]+this.map[t][1]),this.map[t][2]),e.length=this.map[t][0];n.push(e.slice()),e.length=0;let r=n.pop();for(;r;){for(let t of r)e.push(t);r=n.pop()}this.map.length=0}};function rp(e,t,n,r){let i=0;if(!(n===0&&r.length===0)){for(;i<e.map.length;){if(e.map[i][0]===t){e.map[i][1]+=n,e.map[i][2].push(...r);return}i+=1}e.map.push([t,n,r])}}function ip(e,t){let n=!1,r=[];for(;t<e.length;){let i=e[t];if(n){if(i[0]===`enter`)i[1].type===`tableContent`&&r.push(e[t+1][1].type===`tableDelimiterMarker`?`left`:`none`);else if(i[1].type===`tableContent`){if(e[t-1][1].type===`tableDelimiterMarker`){let e=r.length-1;r[e]=r[e]===`left`?`center`:`right`}}else if(i[1].type===`tableDelimiterRow`)break}else i[0]===`enter`&&i[1].type===`tableDelimiterRow`&&(n=!0);t+=1}return r}function ap(){return{flow:{null:{name:`table`,tokenize:op,resolveAll:sp}}}}function op(e,t,n){let r=this,i=0,a=0,o;return s;function s(e){let t=r.events.length-1;for(;t>-1;){let e=r.events[t][1].type;if(e===`lineEnding`||e===`linePrefix`)t--;else break}let i=t>-1?r.events[t][1].type:null,a=i===`tableHead`||i===`tableRow`?S:c;return a===S&&r.parser.lazy[r.now().line]?n(e):a(e)}function c(t){return e.enter(`tableHead`),e.enter(`tableRow`),l(t)}function l(e){return e===124?u(e):(o=!0,a+=1,u(e))}function u(t){return t===null?n(t):z(t)?a>1?(a=0,r.interrupt=!0,e.exit(`tableRow`),e.enter(`lineEnding`),e.consume(t),e.exit(`lineEnding`),p):n(t):V(t)?H(e,u,`whitespace`)(t):(a+=1,o&&(o=!1,i+=1),t===124?(e.enter(`tableCellDivider`),e.consume(t),e.exit(`tableCellDivider`),o=!0,u):(e.enter(`data`),d(t)))}function d(t){return t===null||t===124||B(t)?(e.exit(`data`),u(t)):(e.consume(t),t===92?f:d)}function f(t){return t===92||t===124?(e.consume(t),d):d(t)}function p(t){return r.interrupt=!1,r.parser.lazy[r.now().line]?n(t):(e.enter(`tableDelimiterRow`),o=!1,V(t)?H(e,m,`linePrefix`,r.parser.constructs.disable.null.includes(`codeIndented`)?void 0:4)(t):m(t))}function m(t){return t===45||t===58?g(t):t===124?(o=!0,e.enter(`tableCellDivider`),e.consume(t),e.exit(`tableCellDivider`),h):x(t)}function h(t){return V(t)?H(e,g,`whitespace`)(t):g(t)}function g(t){return t===58?(a+=1,o=!0,e.enter(`tableDelimiterMarker`),e.consume(t),e.exit(`tableDelimiterMarker`),_):t===45?(a+=1,_(t)):t===null||z(t)?b(t):x(t)}function _(t){return t===45?(e.enter(`tableDelimiterFiller`),v(t)):x(t)}function v(t){return t===45?(e.consume(t),v):t===58?(o=!0,e.exit(`tableDelimiterFiller`),e.enter(`tableDelimiterMarker`),e.consume(t),e.exit(`tableDelimiterMarker`),y):(e.exit(`tableDelimiterFiller`),y(t))}function y(t){return V(t)?H(e,b,`whitespace`)(t):b(t)}function b(n){return n===124?m(n):n===null||z(n)?!o||i!==a?x(n):(e.exit(`tableDelimiterRow`),e.exit(`tableHead`),t(n)):x(n)}function x(e){return n(e)}function S(t){return e.enter(`tableRow`),C(t)}function C(n){return n===124?(e.enter(`tableCellDivider`),e.consume(n),e.exit(`tableCellDivider`),C):n===null||z(n)?(e.exit(`tableRow`),t(n)):V(n)?H(e,C,`whitespace`)(n):(e.enter(`data`),w(n))}function w(t){return t===null||t===124||B(t)?(e.exit(`data`),C(t)):(e.consume(t),t===92?T:w)}function T(t){return t===92||t===124?(e.consume(t),w):w(t)}}function sp(e,t){let n=-1,r=!0,i=0,a=[0,0,0,0],o=[0,0,0,0],s=!1,c=0,l,u,d,f=new np;for(;++n<e.length;){let p=e[n],m=p[1];p[0]===`enter`?m.type===`tableHead`?(s=!1,c!==0&&(lp(f,t,c,l,u),u=void 0,c=0),l={type:`table`,start:Object.assign({},m.start),end:Object.assign({},m.end)},f.add(n,0,[[`enter`,l,t]])):m.type===`tableRow`||m.type===`tableDelimiterRow`?(r=!0,d=void 0,a=[0,0,0,0],o=[0,n+1,0,0],s&&(s=!1,u={type:`tableBody`,start:Object.assign({},m.start),end:Object.assign({},m.end)},f.add(n,0,[[`enter`,u,t]])),i=m.type===`tableDelimiterRow`?2:u?3:1):i&&(m.type===`data`||m.type===`tableDelimiterMarker`||m.type===`tableDelimiterFiller`)?(r=!1,o[2]===0&&(a[1]!==0&&(o[0]=o[1],d=cp(f,t,a,i,void 0,d),a=[0,0,0,0]),o[2]=n)):m.type===`tableCellDivider`&&(r?r=!1:(a[1]!==0&&(o[0]=o[1],d=cp(f,t,a,i,void 0,d)),a=o,o=[a[1],n,0,0])):m.type===`tableHead`?(s=!0,c=n):m.type===`tableRow`||m.type===`tableDelimiterRow`?(c=n,a[1]===0?o[1]!==0&&(d=cp(f,t,o,i,n,d)):(o[0]=o[1],d=cp(f,t,a,i,n,d)),i=0):i&&(m.type===`data`||m.type===`tableDelimiterMarker`||m.type===`tableDelimiterFiller`)&&(o[3]=n)}for(c!==0&&lp(f,t,c,l,u),f.consume(t.events),n=-1;++n<t.events.length;){let e=t.events[n];e[0]===`enter`&&e[1].type===`table`&&(e[1]._align=ip(t.events,n))}return e}function cp(e,t,n,r,i,a){let o=r===1?`tableHeader`:r===2?`tableDelimiter`:`tableData`;n[0]!==0&&(a.end=Object.assign({},up(t.events,n[0])),e.add(n[0],0,[[`exit`,a,t]]));let s=up(t.events,n[1]);if(a={type:o,start:Object.assign({},s),end:Object.assign({},s)},e.add(n[1],0,[[`enter`,a,t]]),n[2]!==0){let i=up(t.events,n[2]),a=up(t.events,n[3]),o={type:`tableContent`,start:Object.assign({},i),end:Object.assign({},a)};if(e.add(n[2],0,[[`enter`,o,t]]),r!==2){let r=t.events[n[2]],i=t.events[n[3]];if(r[1].end=Object.assign({},i[1].end),r[1].type=`chunkText`,r[1].contentType=`text`,n[3]>n[2]+1){let t=n[2]+1,r=n[3]-n[2]-1;e.add(t,r,[])}}e.add(n[3]+1,0,[[`exit`,o,t]])}return i!==void 0&&(a.end=Object.assign({},up(t.events,i)),e.add(i,0,[[`exit`,a,t]]),a=void 0),a}function lp(e,t,n,r,i){let a=[],o=up(t.events,n);i&&(i.end=Object.assign({},o),a.push([`exit`,i,t])),r.end=Object.assign({},o),a.push([`exit`,r,t]),e.add(n+1,0,a)}function up(e,t){let n=e[t],r=n[0]===`enter`?`start`:`end`;return n[1][r]}var dp={name:`tasklistCheck`,tokenize:pp};function fp(){return{text:{91:dp}}}function pp(e,t,n){let r=this;return i;function i(t){return r.previous!==null||!r._gfmTasklistFirstContentOfListItem?n(t):(e.enter(`taskListCheck`),e.enter(`taskListCheckMarker`),e.consume(t),e.exit(`taskListCheckMarker`),a)}function a(t){return B(t)?(e.enter(`taskListCheckValueUnchecked`),e.consume(t),e.exit(`taskListCheckValueUnchecked`),o):t===88||t===120?(e.enter(`taskListCheckValueChecked`),e.consume(t),e.exit(`taskListCheckValueChecked`),o):n(t)}function o(t){return t===93?(e.enter(`taskListCheckMarker`),e.consume(t),e.exit(`taskListCheckMarker`),e.exit(`taskListCheck`),s):n(t)}function s(r){return z(r)?t(r):V(r)?e.check({tokenize:mp},t,n)(r):n(r)}}function mp(e,t,n){return H(e,r,`whitespace`);function r(e){return e===null?n(e):t(e)}}function hp(e){return Ma([jf(),qf(),tp(e),ap(),fp()])}var gp={};function _p(e){let t=this,n=e||gp,r=t.data(),i=r.micromarkExtensions||=[],a=r.fromMarkdownExtensions||=[],o=r.toMarkdownExtensions||=[];i.push(hp(n)),a.push(bf()),o.push(xf(n))}var vp=/\b(具身智能|Embodied AI|VLA|RT-2|OpenVLA|强化学习|PPO|模仿学习|Diffusion Policy|世界模型|数据飞轮|数据闭环|IMU|伺服驱动器|关节模组|CoRL|ICRA|PRD|宇树|优必选|智元|Optimus)\b/gi;function yp(e,t=``){let n=[],r=0,i,a=new RegExp(vp.source,`gi`);for(;(i=a.exec(e))!==null;){let a=e.slice(r,i.index);a&&n.push(a);let o=i[0],s=lr.get(o.toLowerCase());s?n.push((0,P.jsx)(zn,{to:cr(s.term),className:`term-link`,title:s.definition,children:o},`${t}${i.index}-${o}`)):n.push(o),r=i.index+o.length}let o=e.slice(r);return o&&n.push(o),n.length?n:[e]}function bp(e,t=``){return v.Children.map(e,(e,n)=>typeof e==`string`?(0,P.jsx)(`span`,{children:yp(e,`${t}${n}-`)},n):(0,v.isValidElement)(e)&&e.props.children?(0,v.cloneElement)(e,{key:n,children:bp(e.props.children,`${t}${n}-`)}):e)}function xp({content:e}){return(0,P.jsx)(`div`,{className:`prose-doc max-w-none`,children:(0,P.jsx)(hu,{remarkPlugins:[_p],components:{h1:({children:e})=>(0,P.jsx)(`h1`,{children:bp(e)}),h2:({children:e})=>(0,P.jsx)(`h2`,{children:bp(e)}),h3:({children:e})=>(0,P.jsx)(`h3`,{children:bp(e)}),h4:({children:e})=>(0,P.jsx)(`h4`,{children:bp(e)}),p:({children:e})=>(0,P.jsx)(`p`,{children:bp(e)}),li:({children:e})=>(0,P.jsx)(`li`,{children:bp(e)}),td:({children:e})=>(0,P.jsx)(`td`,{children:bp(e)}),th:({children:e})=>(0,P.jsx)(`th`,{children:bp(e)}),blockquote:({children:e})=>(0,P.jsx)(`blockquote`,{children:bp(e)}),strong:({children:e})=>(0,P.jsx)(`strong`,{children:bp(e)}),em:({children:e})=>(0,P.jsx)(`em`,{children:bp(e)}),a:({href:e,children:t})=>e?.startsWith(`/`)?(0,P.jsx)(zn,{to:e,className:`text-blue-600 underline`,children:bp(t)}):(0,P.jsx)(`a`,{href:e,target:`_blank`,rel:`noopener noreferrer`,className:`text-blue-600 underline`,children:bp(t)}),table:({children:e})=>(0,P.jsx)(`div`,{className:`overflow-x-auto my-4`,children:(0,P.jsx)(`table`,{children:e})}),thead:({children:e})=>(0,P.jsx)(`thead`,{children:e}),tbody:({children:e})=>(0,P.jsx)(`tbody`,{children:e}),tr:({children:e})=>(0,P.jsx)(`tr`,{children:e}),code:({className:e,children:t})=>e?.includes(`language-`)?(0,P.jsx)(`pre`,{children:(0,P.jsx)(`code`,{className:e,children:t})}):(0,P.jsx)(`code`,{children:t}),hr:()=>(0,P.jsx)(`hr`,{className:`my-6 border-slate-200`})},children:e})})}function Sp(){let{"*":e}=bt(),t=e??``,{getContent:n,getNavItem:r,getModuleForSlug:i,missingHub:a}=Nr(),o=n(t),s=r(t),c=i(t);return a?(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h1`,{className:`text-2xl font-bold mb-4`,children:`知识库未生成`}),(0,P.jsx)(`p`,{className:`text-slate-600 mb-4`,children:`请返回项目列表补全专属知识库后再阅读章节。`}),(0,P.jsx)(zn,{to:`/`,className:`text-blue-600 hover:underline`,children:`返回首页`})]}):o?(0,P.jsxs)(`article`,{children:[c&&(0,P.jsxs)(`p`,{className:`text-sm text-slate-500 mb-2`,children:[c.title,s?` / ${s.title}`:``]}),(0,P.jsx)(xp,{content:o})]}):(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h1`,{className:`text-2xl font-bold mb-4`,children:`页面未找到`}),(0,P.jsxs)(`p`,{className:`text-slate-600 mb-4`,children:[`章节「`,t,`」暂无内容。`]}),(0,P.jsx)(zn,{to:`/`,className:`text-blue-600 hover:underline`,children:`返回首页`})]})}var Cp=/区别|易混|别这样叫|避用/i,wp=/判断|取舍|边界|场景|什么时候/i,Tp={flow:`流程`,loop:`闭环`,anatomy:`组成`,roles:`协作`,scenario:`场景`,compare:`对比`,states:`状态`,layers:`分层`,tree:`层级`,timeline:`演进`,matrix:`矩阵`};function Ep(e){if(e.confusions?.length)return e.confusions.slice(0,3);let t=[],n=e.sections.filter(e=>Cp.test(e.label)).sort((e,t)=>Number(/别这样叫|避用/i.test(e.label))-Number(/别这样叫|避用/i.test(t.label)));for(let e of n){let n=e.content.split(`
`).map(e=>e.replace(/^[·•\-]\s*/,``).trim()).filter(Boolean);for(let r of n){let n=r.match(/^([^：:]{1,20})[：:]\s*(.+)$/),i=r.match(/^([^≠：:]{1,24}?)\s*(?:≠|不是|只(?:做|负责|表示))/);if(t.push(n?{term:n[1].trim(),distinction:n[2].trim()}:i?{term:i[1].trim(),distinction:r}:{term:/别这样叫|避用/i.test(e.label)?`常见误叫`:`相近概念`,distinction:r}),t.length>=3)return t}}return t}function Dp(e){if(e.userPhrases?.[0])return e.userPhrases[0];let t=Ep(e)[0];return t?.term&&t.term!==`相近概念`&&t.term!==`常见误叫`?`大家都在说「${e.term}」，它和「${t.term}」到底有什么区别？`:e.sections.some(e=>wp.test(e.label))?`这个场景该不该用「${e.term}」，我应该看哪些判断条件？`:`「${e.term}」到底解决什么问题，做到什么算用对了？`}function Op(e){return e.example?.trim()?e.example.trim():e.sections.find(e=>/例子|案例|场景|完整/.test(e.label))?.content?.trim()||``}function kp(e){return Ep(e).length?e.sections.filter(e=>!Cp.test(e.label)):e.sections}var Ap=[`行业`,`技术`,`硬件`,`产品`,`公司`,`学术`,`面试`,`核心`];function jp(){let e=M(),t=gt(),{glossary:n,isRuntime:r,hubTitle:i,industry:a,role:o}=Nr(),[s,c]=(0,v.useState)(null),[l,u]=(0,v.useState)(``),d=(0,v.useMemo)(()=>{let e=new Set(n.map(e=>e.module).filter(e=>!!e)),t=Ap.filter(t=>e.has(t)),r=[...e].filter(e=>!Ap.includes(e));return[...t,...r]},[n]),f=(0,v.useMemo)(()=>{let e=l.trim().toLowerCase();return n.filter(t=>s&&t.module!==s?!1:!e||or(t).toLowerCase().includes(e))},[s,l,n]);if((0,v.useEffect)(()=>{if(!e.hash)return;let r=decodeURIComponent(e.hash.replace(/^#/,``)),i=n.find(e=>e.term.toLowerCase()===r.toLowerCase()||e.aliases?.some(e=>e.toLowerCase()===r.toLowerCase()));i&&t(`/glossary/${encodeURIComponent(i.term)}`,{replace:!0})},[n,e.hash,t]),r&&n.length===0){let e=[a,o].filter(Boolean).join(` · `);return(0,P.jsxs)(`div`,{className:`mx-auto max-w-5xl py-8`,children:[(0,P.jsx)(`h1`,{className:`text-4xl font-semibold tracking-tight text-slate-950`,children:`术语库`}),(0,P.jsxs)(`div`,{className:`mt-8 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-slate-700 space-y-2`,children:[(0,P.jsx)(`p`,{className:`font-medium text-slate-900`,children:`还没有本路径的专属术语`}),(0,P.jsx)(`p`,{children:e?`当前路径是「${e}」，不会再套用具身智能词表。`:`本路径尚未生成专属术语。`}),(0,P.jsxs)(`p`,{children:[`请返回路径列表，点卡片上的 `,(0,P.jsx)(`strong`,{children:`生成阅读内容`}),`（会按你的行业/岗位重新生成术语库）。需先开启智能功能。`]})]})]})}return(0,P.jsxs)(`div`,{className:`mx-auto max-w-6xl py-3`,children:[(0,P.jsx)(`header`,{className:`border-b border-slate-200 pb-8`,children:(0,P.jsxs)(`div`,{className:`max-w-3xl`,children:[(0,P.jsx)(`p`,{className:`text-sm font-medium text-cyan-700`,children:`知识图鉴`}),(0,P.jsx)(`h1`,{className:`mt-2 text-4xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-5xl`,children:`把岗位黑话讲清楚`}),(0,P.jsx)(`p`,{className:`mt-4 text-base leading-relaxed text-slate-600`,children:r?`「${i}」收录 ${n.length} 个核心词条。先用大白话定位困惑，再进入独立详情页看示意图、完整例子和易混边界。`:`共 ${n.length} 个词条。适合预习、复习和面试前速查。`})]})}),(0,P.jsx)(`div`,{className:`sticky top-[57px] z-[5] -mx-3 border-b border-slate-200 bg-[#f8fafc]/95 px-3 py-4 backdrop-blur`,children:(0,P.jsxs)(`div`,{className:`flex flex-col gap-3 lg:flex-row lg:items-center`,children:[(0,P.jsxs)(`label`,{className:`relative block min-w-0 flex-1`,children:[(0,P.jsx)(`span`,{className:`sr-only`,children:`搜索术语`}),(0,P.jsx)(`input`,{type:`search`,value:l,onChange:e=>u(e.target.value),placeholder:`搜索术语、口语问题或易混词`,className:`w-full rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15`})]}),(0,P.jsxs)(`div`,{className:`flex gap-2 overflow-x-auto pb-1 lg:max-w-[62%]`,children:[(0,P.jsxs)(`button`,{type:`button`,onClick:()=>c(null),className:`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${s===null?`border-slate-950 bg-slate-950 text-white`:`border-slate-200 bg-white text-slate-600 hover:border-slate-300`}`,children:[`全部 `,n.length]}),d.map(e=>{let t=n.filter(t=>t.module===e).length;return(0,P.jsxs)(`button`,{type:`button`,onClick:()=>c(e),className:`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${s===e?`border-cyan-700 bg-cyan-700 text-white`:`border-slate-200 bg-white text-slate-600 hover:border-slate-300`}`,children:[e,` `,t]},e)})]})]})}),(0,P.jsxs)(`div`,{className:`pt-7`,children:[f.length===0&&(0,P.jsxs)(`div`,{className:`rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center`,children:[(0,P.jsx)(`p`,{className:`text-sm font-medium text-slate-700`,children:`没有匹配的术语`}),(0,P.jsx)(`p`,{className:`mt-1 text-sm text-slate-500`,children:`试试任务描述、用户会说的话或相近概念。`})]}),(0,P.jsx)(`div`,{className:`grid gap-4 md:grid-cols-2`,children:f.map(e=>{let t=Ep(e),n=e.visual?.kind||`flow`;return(0,P.jsxs)(zn,{to:`/glossary/${encodeURIComponent(e.term)}`,className:`group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_12px_32px_rgba(8,145,178,0.08)] sm:p-6`,children:[(0,P.jsxs)(`div`,{className:`flex items-start justify-between gap-4`,children:[(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h2`,{className:`text-xl font-semibold tracking-tight text-slate-950 group-hover:text-cyan-800`,children:e.term}),e.aliases?.length?(0,P.jsx)(`p`,{className:`mt-1 line-clamp-1 text-sm text-slate-400`,children:e.aliases.join(` / `)}):null]}),(0,P.jsx)(`span`,{className:`shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-800`,children:Tp[n]})]}),(0,P.jsxs)(`blockquote`,{className:`mt-5 rounded-xl border border-indigo-100 bg-indigo-50/65 px-4 py-3 text-sm leading-relaxed text-slate-700`,children:[`“`,Dp(e),`”`]}),(0,P.jsx)(`p`,{className:`mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600`,children:e.definition}),(0,P.jsxs)(`div`,{className:`mt-auto flex items-end justify-between gap-4 pt-5`,children:[(0,P.jsxs)(`div`,{className:`flex flex-wrap gap-1.5`,children:[e.module?(0,P.jsx)(`span`,{className:`rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600`,children:e.module}):null,t[0]?(0,P.jsxs)(`span`,{className:`rounded-md bg-rose-50 px-2 py-1 text-[11px] text-rose-700`,children:[`对比 `,t[0].term]}):null]}),(0,P.jsx)(`span`,{className:`shrink-0 text-sm font-medium text-cyan-700 transition group-hover:translate-x-0.5`,children:`打开图鉴 →`})]})]},e.term)})})]})]})}function Mp({text:e,query:t}){return(0,P.jsx)(`p`,{className:`text-sm text-slate-600 mt-1`,children:Vr(e,t).split(/<<mark>>|<\/mark>>/).map((e,t)=>t%2==1?(0,P.jsx)(`mark`,{className:`bg-yellow-200 text-slate-800 rounded px-0.5`,children:e},t):(0,P.jsx)(`span`,{children:e},t))})}function Np(){let[e]=qn(),t=e.get(`q`)??``,{navigation:n,getContent:r,getAllSlugs:i,getModuleForSlug:a,glossary:o}=Nr(),s=(0,v.useMemo)(()=>Br(t,50,{navigation:n,getContent:r,getAllSlugs:i,getModuleForSlug:a,glossary:o}),[t,n,r,i,a,o]);return(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h1`,{className:`text-2xl font-bold text-slate-900 mb-1`,children:`搜索结果`}),t?(0,P.jsxs)(`p`,{className:`text-slate-500 mb-6`,children:[`关键词「`,t,`」，共 `,s.length,` 条`]}):(0,P.jsx)(`p`,{className:`text-slate-500 mb-6`,children:`请在顶栏搜索框输入关键词`}),t&&s.length===0&&(0,P.jsx)(`p`,{className:`text-slate-600`,children:`没有找到匹配内容，换个词试试。`}),(0,P.jsx)(`ul`,{className:`space-y-3`,children:s.map(e=>(0,P.jsx)(`li`,{children:(0,P.jsxs)(zn,{to:e.type===`glossary`?cr(e.title):`/doc/${e.slug}`,className:`block p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all`,children:[(0,P.jsxs)(`div`,{className:`flex items-baseline gap-2`,children:[(0,P.jsx)(`span`,{className:`font-medium text-slate-900`,children:e.title}),(0,P.jsx)(`span`,{className:`text-xs text-slate-400`,children:e.type===`glossary`?`术语表`:e.moduleTitle})]}),(0,P.jsx)(Mp,{text:e.snippet,query:t})]})},e.id))})]})}function Pp(e,t){var n,r=1;e??=0,t??=0;function i(){var i,a=n.length,o,s=0,c=0;for(i=0;i<a;++i)o=n[i],s+=o.x,c+=o.y;for(s=(s/a-e)*r,c=(c/a-t)*r,i=0;i<a;++i)o=n[i],o.x-=s,o.y-=c}return i.initialize=function(e){n=e},i.x=function(t){return arguments.length?(e=+t,i):e},i.y=function(e){return arguments.length?(t=+e,i):t},i.strength=function(e){return arguments.length?(r=+e,i):r},i}function Fp(e){let t=+this._x.call(null,e),n=+this._y.call(null,e);return Ip(this.cover(t,n),t,n,e)}function Ip(e,t,n,r){if(isNaN(t)||isNaN(n))return e;var i,a=e._root,o={data:r},s=e._x0,c=e._y0,l=e._x1,u=e._y1,d,f,p,m,h,g,_,v;if(!a)return e._root=o,e;for(;a.length;)if((h=t>=(d=(s+l)/2))?s=d:l=d,(g=n>=(f=(c+u)/2))?c=f:u=f,i=a,!(a=a[_=g<<1|h]))return i[_]=o,e;if(p=+e._x.call(null,a.data),m=+e._y.call(null,a.data),t===p&&n===m)return o.next=a,i?i[_]=o:e._root=o,e;do i=i?i[_]=[,,,,]:e._root=[,,,,],(h=t>=(d=(s+l)/2))?s=d:l=d,(g=n>=(f=(c+u)/2))?c=f:u=f;while((_=g<<1|h)==(v=(m>=f)<<1|p>=d));return i[v]=a,i[_]=o,e}function Lp(e){var t,n,r=e.length,i,a,o=Array(r),s=Array(r),c=1/0,l=1/0,u=-1/0,d=-1/0;for(n=0;n<r;++n)isNaN(i=+this._x.call(null,t=e[n]))||isNaN(a=+this._y.call(null,t))||(o[n]=i,s[n]=a,i<c&&(c=i),i>u&&(u=i),a<l&&(l=a),a>d&&(d=a));if(c>u||l>d)return this;for(this.cover(c,l).cover(u,d),n=0;n<r;++n)Ip(this,o[n],s[n],e[n]);return this}function Rp(e,t){if(isNaN(e=+e)||isNaN(t=+t))return this;var n=this._x0,r=this._y0,i=this._x1,a=this._y1;if(isNaN(n))i=(n=Math.floor(e))+1,a=(r=Math.floor(t))+1;else{for(var o=i-n||1,s=this._root,c,l;n>e||e>=i||r>t||t>=a;)switch(l=(t<r)<<1|e<n,c=[,,,,],c[l]=s,s=c,o*=2,l){case 0:i=n+o,a=r+o;break;case 1:n=i-o,a=r+o;break;case 2:i=n+o,r=a-o;break;case 3:n=i-o,r=a-o;break}this._root&&this._root.length&&(this._root=s)}return this._x0=n,this._y0=r,this._x1=i,this._y1=a,this}function zp(){var e=[];return this.visit(function(t){if(!t.length)do e.push(t.data);while(t=t.next)}),e}function Bp(e){return arguments.length?this.cover(+e[0][0],+e[0][1]).cover(+e[1][0],+e[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function Vp(e,t,n,r,i){this.node=e,this.x0=t,this.y0=n,this.x1=r,this.y1=i}function Hp(e,t,n){var r,i=this._x0,a=this._y0,o,s,c,l,u=this._x1,d=this._y1,f=[],p=this._root,m,h;for(p&&f.push(new Vp(p,i,a,u,d)),n==null?n=1/0:(i=e-n,a=t-n,u=e+n,d=t+n,n*=n);m=f.pop();)if(!(!(p=m.node)||(o=m.x0)>u||(s=m.y0)>d||(c=m.x1)<i||(l=m.y1)<a))if(p.length){var g=(o+c)/2,_=(s+l)/2;f.push(new Vp(p[3],g,_,c,l),new Vp(p[2],o,_,g,l),new Vp(p[1],g,s,c,_),new Vp(p[0],o,s,g,_)),(h=(t>=_)<<1|e>=g)&&(m=f[f.length-1],f[f.length-1]=f[f.length-1-h],f[f.length-1-h]=m)}else{var v=e-+this._x.call(null,p.data),y=t-+this._y.call(null,p.data),b=v*v+y*y;if(b<n){var x=Math.sqrt(n=b);i=e-x,a=t-x,u=e+x,d=t+x,r=p.data}}return r}function Up(e){if(isNaN(u=+this._x.call(null,e))||isNaN(d=+this._y.call(null,e)))return this;var t,n=this._root,r,i,a,o=this._x0,s=this._y0,c=this._x1,l=this._y1,u,d,f,p,m,h,g,_;if(!n)return this;if(n.length)for(;;){if((m=u>=(f=(o+c)/2))?o=f:c=f,(h=d>=(p=(s+l)/2))?s=p:l=p,t=n,!(n=n[g=h<<1|m]))return this;if(!n.length)break;(t[g+1&3]||t[g+2&3]||t[g+3&3])&&(r=t,_=g)}for(;n.data!==e;)if(i=n,!(n=n.next))return this;return(a=n.next)&&delete n.next,i?(a?i.next=a:delete i.next,this):t?(a?t[g]=a:delete t[g],(n=t[0]||t[1]||t[2]||t[3])&&n===(t[3]||t[2]||t[1]||t[0])&&!n.length&&(r?r[_]=n:this._root=n),this):(this._root=a,this)}function Wp(e){for(var t=0,n=e.length;t<n;++t)this.remove(e[t]);return this}function Gp(){return this._root}function Kp(){var e=0;return this.visit(function(t){if(!t.length)do++e;while(t=t.next)}),e}function qp(e){var t=[],n,r=this._root,i,a,o,s,c;for(r&&t.push(new Vp(r,this._x0,this._y0,this._x1,this._y1));n=t.pop();)if(!e(r=n.node,a=n.x0,o=n.y0,s=n.x1,c=n.y1)&&r.length){var l=(a+s)/2,u=(o+c)/2;(i=r[3])&&t.push(new Vp(i,l,u,s,c)),(i=r[2])&&t.push(new Vp(i,a,u,l,c)),(i=r[1])&&t.push(new Vp(i,l,o,s,u)),(i=r[0])&&t.push(new Vp(i,a,o,l,u))}return this}function Jp(e){var t=[],n=[],r;for(this._root&&t.push(new Vp(this._root,this._x0,this._y0,this._x1,this._y1));r=t.pop();){var i=r.node;if(i.length){var a,o=r.x0,s=r.y0,c=r.x1,l=r.y1,u=(o+c)/2,d=(s+l)/2;(a=i[0])&&t.push(new Vp(a,o,s,u,d)),(a=i[1])&&t.push(new Vp(a,u,s,c,d)),(a=i[2])&&t.push(new Vp(a,o,d,u,l)),(a=i[3])&&t.push(new Vp(a,u,d,c,l))}n.push(r)}for(;r=n.pop();)e(r.node,r.x0,r.y0,r.x1,r.y1);return this}function Yp(e){return e[0]}function Xp(e){return arguments.length?(this._x=e,this):this._x}function Zp(e){return e[1]}function Qp(e){return arguments.length?(this._y=e,this):this._y}function $p(e,t,n){var r=new em(t??Yp,n??Zp,NaN,NaN,NaN,NaN);return e==null?r:r.addAll(e)}function em(e,t,n,r,i,a){this._x=e,this._y=t,this._x0=n,this._y0=r,this._x1=i,this._y1=a,this._root=void 0}function tm(e){for(var t={data:e.data},n=t;e=e.next;)n=n.next={data:e.data};return t}var nm=$p.prototype=em.prototype;nm.copy=function(){var e=new em(this._x,this._y,this._x0,this._y0,this._x1,this._y1),t=this._root,n,r;if(!t)return e;if(!t.length)return e._root=tm(t),e;for(n=[{source:t,target:e._root=[,,,,]}];t=n.pop();)for(var i=0;i<4;++i)(r=t.source[i])&&(r.length?n.push({source:r,target:t.target[i]=[,,,,]}):t.target[i]=tm(r));return e},nm.add=Fp,nm.addAll=Lp,nm.cover=Rp,nm.data=zp,nm.extent=Bp,nm.find=Hp,nm.remove=Up,nm.removeAll=Wp,nm.root=Gp,nm.size=Kp,nm.visit=qp,nm.visitAfter=Jp,nm.x=Xp,nm.y=Qp;function rm(e){return function(){return e}}function im(e){return(e()-.5)*1e-6}function am(e){return e.x+e.vx}function om(e){return e.y+e.vy}function sm(e){var t,n,r,i=1,a=1;typeof e!=`function`&&(e=rm(e==null?1:+e));function o(){for(var e,o=t.length,c,l,u,d,f,p,m=0;m<a;++m)for(c=$p(t,am,om).visitAfter(s),e=0;e<o;++e)l=t[e],f=n[l.index],p=f*f,u=l.x+l.vx,d=l.y+l.vy,c.visit(h);function h(e,t,n,a,o){var s=e.data,c=e.r,m=f+c;if(s){if(s.index>l.index){var h=u-s.x-s.vx,g=d-s.y-s.vy,_=h*h+g*g;_<m*m&&(h===0&&(h=im(r),_+=h*h),g===0&&(g=im(r),_+=g*g),_=(m-(_=Math.sqrt(_)))/_*i,l.vx+=(h*=_)*(m=(c*=c)/(p+c)),l.vy+=(g*=_)*m,s.vx-=h*(m=1-m),s.vy-=g*m)}return}return t>u+m||a<u-m||n>d+m||o<d-m}}function s(e){if(e.data)return e.r=n[e.data.index];for(var t=e.r=0;t<4;++t)e[t]&&e[t].r>e.r&&(e.r=e[t].r)}function c(){if(t){var r,i=t.length,a;for(n=Array(i),r=0;r<i;++r)a=t[r],n[a.index]=+e(a,r,t)}}return o.initialize=function(e,n){t=e,r=n,c()},o.iterations=function(e){return arguments.length?(a=+e,o):a},o.strength=function(e){return arguments.length?(i=+e,o):i},o.radius=function(t){return arguments.length?(e=typeof t==`function`?t:rm(+t),c(),o):e},o}function cm(e){return e.index}function lm(e,t){var n=e.get(t);if(!n)throw Error(`node not found: `+t);return n}function um(e){var t=cm,n=d,r,i=rm(30),a,o,s,c,l,u=1;e??=[];function d(e){return 1/Math.min(s[e.source.index],s[e.target.index])}function f(t){for(var n=0,i=e.length;n<u;++n)for(var o=0,s,d,f,p,m,h,g;o<i;++o)s=e[o],d=s.source,f=s.target,p=f.x+f.vx-d.x-d.vx||im(l),m=f.y+f.vy-d.y-d.vy||im(l),h=Math.sqrt(p*p+m*m),h=(h-a[o])/h*t*r[o],p*=h,m*=h,f.vx-=p*(g=c[o]),f.vy-=m*g,d.vx+=p*(g=1-g),d.vy+=m*g}function p(){if(o){var n,i=o.length,l=e.length,u=new Map(o.map((e,n)=>[t(e,n,o),e])),d;for(n=0,s=Array(i);n<l;++n)d=e[n],d.index=n,typeof d.source!=`object`&&(d.source=lm(u,d.source)),typeof d.target!=`object`&&(d.target=lm(u,d.target)),s[d.source.index]=(s[d.source.index]||0)+1,s[d.target.index]=(s[d.target.index]||0)+1;for(n=0,c=Array(l);n<l;++n)d=e[n],c[n]=s[d.source.index]/(s[d.source.index]+s[d.target.index]);r=Array(l),m(),a=Array(l),h()}}function m(){if(o)for(var t=0,i=e.length;t<i;++t)r[t]=+n(e[t],t,e)}function h(){if(o)for(var t=0,n=e.length;t<n;++t)a[t]=+i(e[t],t,e)}return f.initialize=function(e,t){o=e,l=t,p()},f.links=function(t){return arguments.length?(e=t,p(),f):e},f.id=function(e){return arguments.length?(t=e,f):t},f.iterations=function(e){return arguments.length?(u=+e,f):u},f.strength=function(e){return arguments.length?(n=typeof e==`function`?e:rm(+e),m(),f):n},f.distance=function(e){return arguments.length?(i=typeof e==`function`?e:rm(+e),h(),f):i},f}var dm={value:()=>{}};function fm(){for(var e=0,t=arguments.length,n={},r;e<t;++e){if(!(r=arguments[e]+``)||r in n||/[\s.]/.test(r))throw Error(`illegal type: `+r);n[r]=[]}return new pm(n)}function pm(e){this._=e}function mm(e,t){return e.trim().split(/^|\s+/).map(function(e){var n=``,r=e.indexOf(`.`);if(r>=0&&(n=e.slice(r+1),e=e.slice(0,r)),e&&!t.hasOwnProperty(e))throw Error(`unknown type: `+e);return{type:e,name:n}})}pm.prototype=fm.prototype={constructor:pm,on:function(e,t){var n=this._,r=mm(e+``,n),i,a=-1,o=r.length;if(arguments.length<2){for(;++a<o;)if((i=(e=r[a]).type)&&(i=hm(n[i],e.name)))return i;return}if(t!=null&&typeof t!=`function`)throw Error(`invalid callback: `+t);for(;++a<o;)if(i=(e=r[a]).type)n[i]=gm(n[i],e.name,t);else if(t==null)for(i in n)n[i]=gm(n[i],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new pm(e)},call:function(e,t){if((i=arguments.length-2)>0)for(var n=Array(i),r=0,i,a;r<i;++r)n[r]=arguments[r+2];if(!this._.hasOwnProperty(e))throw Error(`unknown type: `+e);for(a=this._[e],r=0,i=a.length;r<i;++r)a[r].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw Error(`unknown type: `+e);for(var r=this._[e],i=0,a=r.length;i<a;++i)r[i].value.apply(t,n)}};function hm(e,t){for(var n=0,r=e.length,i;n<r;++n)if((i=e[n]).name===t)return i.value}function gm(e,t,n){for(var r=0,i=e.length;r<i;++r)if(e[r].name===t){e[r]=dm,e=e.slice(0,r).concat(e.slice(r+1));break}return n!=null&&e.push({name:t,value:n}),e}var _m=0,vm=0,ym=0,bm=1e3,xm,Sm,Cm=0,wm=0,Tm=0,Em=typeof performance==`object`&&performance.now?performance:Date,Dm=typeof window==`object`&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function Om(){return wm||=(Dm(km),Em.now()+Tm)}function km(){wm=0}function Am(){this._call=this._time=this._next=null}Am.prototype=jm.prototype={constructor:Am,restart:function(e,t,n){if(typeof e!=`function`)throw TypeError(`callback is not a function`);n=(n==null?Om():+n)+(t==null?0:+t),!this._next&&Sm!==this&&(Sm?Sm._next=this:xm=this,Sm=this),this._call=e,this._time=n,Im()},stop:function(){this._call&&(this._call=null,this._time=1/0,Im())}};function jm(e,t,n){var r=new Am;return r.restart(e,t,n),r}function Mm(){Om(),++_m;for(var e=xm,t;e;)(t=wm-e._time)>=0&&e._call.call(void 0,t),e=e._next;--_m}function Nm(){wm=(Cm=Em.now())+Tm,_m=vm=0;try{Mm()}finally{_m=0,Fm(),wm=0}}function Pm(){var e=Em.now(),t=e-Cm;t>bm&&(Tm-=t,Cm=e)}function Fm(){for(var e,t=xm,n,r=1/0;t;)t._call?(r>t._time&&(r=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:xm=n);Sm=e,Im(r)}function Im(e){_m||(vm&&=clearTimeout(vm),e-wm>24?(e<1/0&&(vm=setTimeout(Nm,e-Em.now()-Tm)),ym&&=clearInterval(ym)):(ym||=(Cm=Em.now(),setInterval(Pm,bm)),_m=1,Dm(Nm)))}var Lm=1664525,Rm=1013904223,zm=4294967296;function Bm(){let e=1;return()=>(e=(Lm*e+Rm)%zm)/zm}function Vm(e){return e.x}function Hm(e){return e.y}var Um=10,Wm=Math.PI*(3-Math.sqrt(5));function Gm(e){var t,n=1,r=.001,i=1-r**(1/300),a=0,o=.6,s=new Map,c=jm(d),l=fm(`tick`,`end`),u=Bm();e??=[];function d(){f(),l.call(`tick`,t),n<r&&(c.stop(),l.call(`end`,t))}function f(r){var c,l=e.length,u;r===void 0&&(r=1);for(var d=0;d<r;++d)for(n+=(a-n)*i,s.forEach(function(e){e(n)}),c=0;c<l;++c)u=e[c],u.fx==null?u.x+=u.vx*=o:(u.x=u.fx,u.vx=0),u.fy==null?u.y+=u.vy*=o:(u.y=u.fy,u.vy=0);return t}function p(){for(var t=0,n=e.length,r;t<n;++t){if(r=e[t],r.index=t,r.fx!=null&&(r.x=r.fx),r.fy!=null&&(r.y=r.fy),isNaN(r.x)||isNaN(r.y)){var i=Um*Math.sqrt(.5+t),a=t*Wm;r.x=i*Math.cos(a),r.y=i*Math.sin(a)}(isNaN(r.vx)||isNaN(r.vy))&&(r.vx=r.vy=0)}}function m(t){return t.initialize&&t.initialize(e,u),t}return p(),t={tick:f,restart:function(){return c.restart(d),t},stop:function(){return c.stop(),t},nodes:function(n){return arguments.length?(e=n,p(),s.forEach(m),t):e},alpha:function(e){return arguments.length?(n=+e,t):n},alphaMin:function(e){return arguments.length?(r=+e,t):r},alphaDecay:function(e){return arguments.length?(i=+e,t):+i},alphaTarget:function(e){return arguments.length?(a=+e,t):a},velocityDecay:function(e){return arguments.length?(o=1-e,t):1-o},randomSource:function(e){return arguments.length?(u=e,s.forEach(m),t):u},force:function(e,n){return arguments.length>1?(n==null?s.delete(e):s.set(e,m(n)),t):s.get(e)},find:function(t,n,r){var i=0,a=e.length,o,s,c,l,u;for(r==null?r=1/0:r*=r,i=0;i<a;++i)l=e[i],o=t-l.x,s=n-l.y,c=o*o+s*s,c<r&&(u=l,r=c);return u},on:function(e,n){return arguments.length>1?(l.on(e,n),t):l.on(e)}}}function Km(){var e,t,n,r,i=rm(-30),a,o=1,s=1/0,c=.81;function l(n){var i,a=e.length,o=$p(e,Vm,Hm).visitAfter(d);for(r=n,i=0;i<a;++i)t=e[i],o.visit(f)}function u(){if(e){var t,n=e.length,r;for(a=Array(n),t=0;t<n;++t)r=e[t],a[r.index]=+i(r,t,e)}}function d(e){var t=0,n,r,i=0,o,s,c;if(e.length){for(o=s=c=0;c<4;++c)(n=e[c])&&(r=Math.abs(n.value))&&(t+=n.value,i+=r,o+=r*n.x,s+=r*n.y);e.x=o/i,e.y=s/i}else{n=e,n.x=n.data.x,n.y=n.data.y;do t+=a[n.data.index];while(n=n.next)}e.value=t}function f(e,i,l,u){if(!e.value)return!0;var d=e.x-t.x,f=e.y-t.y,p=u-i,m=d*d+f*f;if(p*p/c<m)return m<s&&(d===0&&(d=im(n),m+=d*d),f===0&&(f=im(n),m+=f*f),m<o&&(m=Math.sqrt(o*m)),t.vx+=d*e.value*r/m,t.vy+=f*e.value*r/m),!0;if(!(e.length||m>=s)){(e.data!==t||e.next)&&(d===0&&(d=im(n),m+=d*d),f===0&&(f=im(n),m+=f*f),m<o&&(m=Math.sqrt(o*m)));do e.data!==t&&(p=a[e.data.index]*r/m,t.vx+=d*p,t.vy+=f*p);while(e=e.next)}}return l.initialize=function(t,r){e=t,n=r,u()},l.strength=function(e){return arguments.length?(i=typeof e==`function`?e:rm(+e),u(),l):i},l.distanceMin=function(e){return arguments.length?(o=e*e,l):Math.sqrt(o)},l.distanceMax=function(e){return arguments.length?(s=e*e,l):Math.sqrt(s)},l.theta=function(e){return arguments.length?(c=e*e,l):Math.sqrt(c)},l}var qm=.2,Jm=4;function Ym(e,t,n){return Math.max(t,Math.min(n,e))}function Xm({filterModule:e=null,height:t=560,nodes:n=br,links:r=xr}){let i=gt(),a=(0,v.useRef)(null),o=(0,v.useRef)(null),[s,c]=(0,v.useState)({width:800,height:t}),[l,u]=(0,v.useState)([]),[d,f]=(0,v.useState)([]),[p,m]=(0,v.useState)(null),[h,g]=(0,v.useState)({x:0,y:0,k:1}),[_,y]=(0,v.useState)(!1),b=(0,v.useRef)(h);b.current=h;let x=(0,v.useRef)(null),S=(0,v.useMemo)(()=>e?n.filter(t=>t.type===`concept`||t.moduleId===e||t.id===e):n,[e,n]),C=(0,v.useMemo)(()=>{let e=new Set(S.map(e=>e.id));return r.filter(t=>{let n=typeof t.source==`string`?t.source:String(t.source),r=typeof t.target==`string`?t.target:String(t.target);return e.has(n)&&e.has(r)})},[S,r]),w=(0,v.useMemo)(()=>{if(!p)return null;let e=new Set([p]);for(let t of C)t.source===p&&e.add(t.target),t.target===p&&e.add(t.source);return e},[p,C]),T=(0,v.useCallback)(()=>{g({x:0,y:0,k:1})},[]),E=(0,v.useCallback)(()=>{let{width:e}=s;if(!l.length||e<=0){T();return}let n=1/0,r=-1/0,i=1/0,a=-1/0;for(let e of l){if(e.x==null||e.y==null)continue;let t=e.size+28;n=Math.min(n,e.x-t),r=Math.max(r,e.x+t),i=Math.min(i,e.y-t),a=Math.max(a,e.y+t)}if(!Number.isFinite(n)){T();return}let o=Math.max(r-n,40),c=Math.max(a-i,40),u=Ym(Math.min((e-72)/o,(t-72)/c),qm,Jm);g({k:u,x:(e-o*u)/2-n*u,y:(t-c*u)/2-i*u})},[s,t,l,T]),ee=(0,v.useCallback)((e,n,r)=>{g(i=>{let{width:a}=s,o=n??a/2,c=r??t/2,l=Ym(i.k*e,qm,Jm),u=l/i.k;return{k:l,x:o-(o-i.x)*u,y:c-(c-i.y)*u}})},[s,t]);(0,v.useEffect)(()=>{let e=a.current;if(!e)return;let n=()=>{let n=e.clientWidth;n>0&&c({width:n,height:t})};n();let r=new ResizeObserver(()=>n());return r.observe(e),window.addEventListener(`resize`,n),()=>{r.disconnect(),window.removeEventListener(`resize`,n)}},[t]),(0,v.useEffect)(()=>{T()},[e,T]),(0,v.useEffect)(()=>{let{width:e}=s;if(e<=0)return;let n=S.map((n,r)=>({...n,x:e/2+Math.cos(r*.8)*120,y:t/2+Math.sin(r*.8)*120})),r=new Map(n.map(e=>[e.id,e])),i=[];for(let e of C){let t=r.get(e.source),n=r.get(e.target);t&&n&&i.push({source:t,target:n,relation:e.relation})}let a=Gm(n).force(`link`,um(i).id(e=>e.id).distance(e=>{let t=e;return t.relation===`归属`?55:t.relation===`工作流`?75:t.relation===`跨模块`?150:95}).strength(e=>{let t=e;return t.relation===`归属`?.8:t.relation===`跨模块`?.25:.45})).force(`charge`,Km().strength(-320)).force(`center`,Pp(e/2,t/2)).force(`collide`,sm().radius(e=>e.size+10)).alpha(.9).on(`tick`,()=>{u([...n]),f([...i])}).on(`end`,()=>{let r=1/0,i=-1/0,a=1/0,o=-1/0;for(let e of n){if(e.x==null||e.y==null)continue;let t=e.size+28;r=Math.min(r,e.x-t),i=Math.max(i,e.x+t),a=Math.min(a,e.y-t),o=Math.max(o,e.y+t)}if(!Number.isFinite(r))return;let s=Math.max(i-r,40),c=Math.max(o-a,40),l=Ym(Math.min((e-72)/s,(t-72)/c),qm,Jm);g({k:l,x:(e-s*l)/2-r*l,y:(t-c*l)/2-a*l})});return()=>{a.stop()}},[S,C,s.width,t]),(0,v.useEffect)(()=>{let e=o.current;if(!e)return;let t=t=>{t.preventDefault();let n=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top;ee(t.deltaY>0?.88:1.12,r,i)};return e.addEventListener(`wheel`,t,{passive:!1}),()=>e.removeEventListener(`wheel`,t)},[ee]);let D=e=>{if(e.button!==0)return;let t=e.target.closest(`[data-node]`),n=b.current;x.current={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,originX:n.x,originY:n.y,moved:!1,nodeId:t?.getAttribute(`data-node`)??null},y(!0),e.currentTarget.setPointerCapture(e.pointerId)},te=e=>{let t=x.current;if(!t||t.pointerId!==e.pointerId)return;let n=e.clientX-t.startX,r=e.clientY-t.startY;Math.abs(n)+Math.abs(r)>4&&(t.moved=!0),g({k:b.current.k,x:t.originX+n,y:t.originY+r})},O=e=>{let t=x.current;if(!(!t||t.pointerId!==e.pointerId)){if(!t.moved&&t.nodeId){let e=l.find(e=>e.id===t.nodeId);e&&i(e.href)}x.current=null,y(!1);try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}}},ne=e=>w!==null&&!w.has(e);return(0,P.jsxs)(`div`,{className:`space-y-2`,children:[(0,P.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2`,children:[(0,P.jsx)(`button`,{type:`button`,onClick:()=>ee(1.2),className:`h-8 px-3 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-700`,children:`放大`}),(0,P.jsx)(`button`,{type:`button`,onClick:()=>ee(1/1.2),className:`h-8 px-3 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-700`,children:`缩小`}),(0,P.jsx)(`button`,{type:`button`,onClick:E,className:`h-8 px-3 rounded-md bg-cyan-700 text-white text-xs font-medium hover:bg-cyan-600`,children:`适应全部`}),(0,P.jsx)(`button`,{type:`button`,onClick:T,className:`h-8 px-3 rounded-md border border-slate-300 text-slate-700 text-xs hover:bg-slate-50`,children:`重置`}),(0,P.jsxs)(`span`,{className:`text-xs text-slate-500`,children:[`缩放 `,Math.round(h.k*100),`% · 在图上按住拖动可平移 · 滚轮缩放`]})]}),(0,P.jsxs)(`div`,{ref:a,className:`relative w-full rounded-xl border border-slate-200 bg-slate-900 overflow-hidden`,children:[(0,P.jsxs)(`svg`,{ref:o,width:s.width,height:t,className:`block select-none`,style:{touchAction:`none`,cursor:_?`grabbing`:`grab`},onPointerDown:D,onPointerMove:te,onPointerUp:O,onPointerCancel:O,children:[(0,P.jsx)(`rect`,{width:s.width,height:t,fill:`#0f172a`}),(0,P.jsxs)(`g`,{transform:`translate(${h.x},${h.y}) scale(${h.k})`,children:[(0,P.jsx)(`g`,{children:d.map((e,t)=>{let n=e.source,r=e.target;if(n.x==null||r.x==null)return null;let i=w&&!w.has(n.id)&&!w.has(r.id);return(0,P.jsx)(`line`,{x1:n.x,y1:n.y,x2:r.x,y2:r.y,stroke:Sr[e.relation],strokeWidth:e.relation===`跨模块`?2:1,strokeOpacity:i?.06:e.relation===`跨模块`?.65:.3,strokeDasharray:e.relation===`跨模块`?`6 4`:void 0},`${n.id}-${r.id}-${t}`)})}),(0,P.jsx)(`g`,{children:l.map(e=>{if(e.x==null||e.y==null)return null;let t=ne(e.id),r=p===e.id,i=Cr(e.id,n);return(0,P.jsxs)(`g`,{"data-node":e.id,transform:`translate(${e.x},${e.y})`,style:{cursor:`pointer`},onMouseEnter:()=>m(e.id),onMouseLeave:()=>m(null),children:[r&&(0,P.jsx)(`circle`,{r:e.size+10,fill:`none`,stroke:e.color,strokeWidth:2,opacity:.6}),(0,P.jsx)(`circle`,{r:e.size,fill:e.color,opacity:t?.2:e.type===`module`?1:.88,stroke:`#fff`,strokeWidth:e.type===`module`?2.5:1.5,strokeOpacity:t?.15:.55}),e.type===`concept`&&(0,P.jsx)(`circle`,{r:e.size*.3,fill:`#fff`,opacity:t?.1:.4}),(0,P.jsx)(`text`,{textAnchor:`middle`,dy:e.size+13,fill:t?`#475569`:`#e2e8f0`,fontSize:e.type===`module`?11:9,fontWeight:e.type===`module`?600:400,style:{pointerEvents:`none`,userSelect:`none`},children:i?.label??e.label})]},e.id)})})]})]}),(0,P.jsx)(`div`,{className:`absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] max-w-[75%]`,children:Object.entries(Sr).map(([e,t])=>(0,P.jsxs)(`span`,{className:`flex items-center gap-1 bg-slate-800/90 text-slate-300 px-2 py-1 rounded-full`,children:[(0,P.jsx)(`span`,{className:`w-3 h-0.5 rounded`,style:{background:t}}),e]},e))})]})]})}function Zm(){return new URLSearchParams(window.location.search).has(`embed`)||window.self!==window.top}function Qm(){let[e,t]=(0,v.useState)(null),n=Zm(),{navigation:r,graphNodes:i,graphLinks:a,missingHub:o,hubTitle:s}=Nr();return o?(0,P.jsxs)(`div`,{className:`p-6`,children:[(0,P.jsx)(`h1`,{className:`text-2xl font-bold text-slate-900 mb-2`,children:`知识网络`}),(0,P.jsxs)(`p`,{className:`text-slate-600`,children:[`「`,s,`」尚未生成专属知识库，请先在项目列表补全知识库。`]})]}):(0,P.jsxs)(`div`,{className:`w-full max-w-none -mx-6 md:-mx-10 px-4 md:px-6`,children:[(0,P.jsxs)(`div`,{className:`mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3`,children:[(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h1`,{className:`text-2xl font-bold text-slate-900`,children:`知识网络`}),(0,P.jsx)(`p`,{className:`text-sm text-slate-500 mt-1`,children:`章节、概念、模块之间的关联。大球=模块，中球=章节，小球=核心概念。`})]}),(0,P.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,P.jsx)(`button`,{type:`button`,onClick:()=>t(null),className:`text-xs px-3 py-1.5 rounded-full border transition-colors ${e===null?`bg-slate-900 text-white border-slate-900`:`bg-white text-slate-600 border-slate-200 hover:border-slate-300`}`,children:`全部`}),r.map(n=>(0,P.jsx)(`button`,{type:`button`,onClick:()=>t(n.id),className:`text-xs px-3 py-1.5 rounded-full border transition-colors ${e===n.id?`text-white border-transparent`:`bg-white text-slate-600 border-slate-200 hover:border-slate-300`}`,style:e===n.id?{backgroundColor:n.color,borderColor:n.color}:void 0,children:n.title},n.id))]})]}),(0,P.jsx)(Xm,{filterModule:e,height:n?520:560,nodes:i,links:a})]})}var $m={flow:`流程链路`,loop:`闭环回转`,anatomy:`组成结构`,roles:`多方协作`,scenario:`场景示意`,compare:`并排对比`,states:`状态变化`,layers:`分层结构`,tree:`层级关系`,timeline:`时间演进`,matrix:`判断矩阵`};function eh(e){return e?.kind?e.kind:e?.facts?.length||e?.quote?`scenario`:`flow`}function th(e){return e.visual?.nodes?.length?e.visual.nodes.map(e=>({label:String(e.label||``).trim(),detail:String(e.detail||``).trim()||void 0,actor:String(e.actor||``).trim()||void 0,badge:String(e.badge||``).trim()||void 0,group:String(e.group||``).trim()||void 0,parent:String(e.parent||``).trim()||void 0})).filter(e=>e.label):(e.visual?.steps||[]).map(String).map(e=>e.trim()).filter(Boolean).map(e=>({label:e}))}function nh({kind:e,title:t,caption:n,children:r}){return(0,P.jsxs)(`section`,{className:`glossary-grid mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white`,children:[(0,P.jsxs)(`div`,{className:`border-b border-slate-100 bg-white/90 px-5 py-4 sm:px-6`,children:[(0,P.jsxs)(`div`,{className:`flex flex-wrap items-center gap-x-3 gap-y-1`,children:[(0,P.jsx)(`span`,{className:`text-xs font-semibold text-cyan-700`,children:$m[e]}),(0,P.jsx)(`span`,{className:`text-[11px] font-mono text-slate-400`,children:e})]}),(0,P.jsx)(`h2`,{className:`mt-1 text-lg font-semibold tracking-tight text-slate-950`,children:t})]}),(0,P.jsx)(`div`,{className:`p-5 sm:p-6`,children:r}),n?(0,P.jsx)(`p`,{className:`border-t border-slate-100 bg-white/90 px-5 py-3 text-sm leading-relaxed text-slate-600 sm:px-6`,children:n}):null]})}function rh({node:e,index:t}){return(0,P.jsxs)(`div`,{className:`min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]`,children:[(0,P.jsxs)(`div`,{className:`flex items-center gap-2`,children:[t===void 0?null:(0,P.jsx)(`span`,{className:`font-mono text-[11px] font-semibold text-cyan-700`,children:String(t+1).padStart(2,`0`)}),e.badge?(0,P.jsx)(`span`,{className:`rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-800`,children:e.badge}):null,(0,P.jsx)(`h3`,{className:`text-sm font-semibold text-slate-950`,children:e.label})]}),e.detail?(0,P.jsx)(`p`,{className:`mt-1.5 text-sm leading-relaxed text-slate-600`,children:e.detail}):null]})}function ih(e,t){if(t.length>=2)return t.slice(0,2).map(t=>({column:t,nodes:e.filter(e=>(e.group||e.badge)===t)}));let n=[...new Set(e.map(e=>e.group||e.badge).filter(Boolean))];if(n.length>=2)return n.slice(0,2).map(t=>({column:t,nodes:e.filter(e=>(e.group||e.badge)===t)}));let r=Math.ceil(e.length/2);return[{column:`方案 A`,nodes:e.slice(0,r)},{column:`方案 B`,nodes:e.slice(r)}]}function ah({entry:e}){let t=e.visual,n=eh(t),r=t?.title||`一眼看懂`,i=th(e),a=t?.caption?.trim();if(!i.length&&!t?.facts?.length&&!t?.quote)return a?(0,P.jsx)(nh,{kind:n,title:r,children:(0,P.jsx)(`p`,{className:`text-sm leading-relaxed text-slate-700`,children:a})}):null;if(n===`scenario`)return(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsxs)(`div`,{className:`grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]`,children:[(0,P.jsx)(`div`,{className:`space-y-3`,children:i.map((t,n)=>(0,P.jsx)(rh,{node:t,index:n},`${e.term}-scenario-${n}`))}),(0,P.jsxs)(`div`,{className:`space-y-3`,children:[t?.quote?(0,P.jsxs)(`blockquote`,{className:`rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-4 text-sm leading-relaxed text-slate-800`,children:[`“`,t.quote,`”`]}):null,(0,P.jsx)(`div`,{className:`grid grid-cols-2 gap-3`,children:(t?.facts||[]).map((t,n)=>(0,P.jsxs)(`div`,{className:`rounded-xl border border-slate-200 bg-white px-3 py-3`,children:[(0,P.jsx)(`div`,{className:`text-xs text-slate-500`,children:t.label}),(0,P.jsx)(`div`,{className:`mt-1 text-sm font-semibold text-slate-950`,children:t.value})]},`${e.term}-fact-${n}`))})]})]})});if(n===`compare`)return(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsx)(`div`,{className:`grid gap-4 md:grid-cols-2`,children:ih(i,t?.columns||[]).map((t,n)=>(0,P.jsxs)(`div`,{className:`rounded-2xl border p-4 ${n===0?`border-cyan-200 bg-cyan-50/55`:`border-indigo-200 bg-indigo-50/45`}`,children:[(0,P.jsx)(`h3`,{className:`mb-3 text-sm font-semibold text-slate-950`,children:t.column}),(0,P.jsx)(`div`,{className:`space-y-2`,children:t.nodes.map((e,n)=>(0,P.jsx)(rh,{node:{...e,badge:void 0}},`${t.column}-${n}`))})]},`${e.term}-compare-${t.column}`))})});if(n===`states`)return(0,P.jsxs)(nh,{kind:n,title:r,caption:a,children:[(0,P.jsx)(`div`,{className:`mb-5 flex flex-wrap gap-2`,children:i.map((t,n)=>(0,P.jsx)(`span`,{className:`rounded-full border px-3 py-1.5 text-xs font-medium ${n===0?`border-cyan-300 bg-cyan-50 text-cyan-800`:`border-slate-200 bg-white text-slate-500`}`,children:t.badge||t.label},`${e.term}-state-tab-${n}`))}),(0,P.jsx)(`div`,{className:`grid gap-3 md:grid-cols-2`,children:i.map((t,n)=>(0,P.jsxs)(`div`,{className:`relative`,children:[(0,P.jsx)(rh,{node:t,index:n}),n<i.length-1?(0,P.jsx)(`span`,{className:`absolute -bottom-3 left-8 text-sm text-cyan-600 md:-right-3 md:bottom-auto md:left-auto md:top-1/2`,children:`→`}):null]},`${e.term}-state-${n}`))})]});if(n===`layers`)return(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsx)(`div`,{className:`mx-auto max-w-2xl space-y-2`,children:i.map((t,n)=>(0,P.jsx)(`div`,{className:`rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]`,style:{marginInline:`${Math.min(n*2.5,10)}%`},children:(0,P.jsxs)(`div`,{className:`flex items-start gap-3`,children:[(0,P.jsxs)(`span`,{className:`mt-0.5 font-mono text-xs font-semibold text-cyan-700`,children:[`L`,n+1]}),(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h3`,{className:`text-sm font-semibold text-slate-950`,children:t.label}),t.detail?(0,P.jsx)(`p`,{className:`mt-1 text-sm leading-relaxed text-slate-600`,children:t.detail}):null]})]})},`${e.term}-layer-${n}`))})});if(n===`tree`){let t=i.find(e=>!e.parent)||i[0],o=i.filter(e=>e!==t);return(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsxs)(`div`,{className:`mx-auto max-w-3xl`,children:[(0,P.jsxs)(`div`,{className:`mx-auto w-fit rounded-xl border-2 border-cyan-300 bg-cyan-50 px-5 py-3 text-center`,children:[(0,P.jsx)(`div`,{className:`text-sm font-semibold text-slate-950`,children:t.label}),t.detail?(0,P.jsx)(`p`,{className:`mt-1 text-xs text-slate-600`,children:t.detail}):null]}),(0,P.jsx)(`div`,{className:`mx-auto h-6 w-px bg-cyan-300`}),(0,P.jsx)(`div`,{className:`grid gap-3 sm:grid-cols-2 lg:grid-cols-3`,children:o.map((t,n)=>(0,P.jsxs)(`div`,{className:`relative pt-3`,children:[(0,P.jsx)(`span`,{className:`absolute left-1/2 top-0 h-3 w-px bg-slate-300`}),(0,P.jsx)(rh,{node:t})]},`${e.term}-tree-${n}`))})]})})}if(n===`timeline`)return(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsx)(`ol`,{className:`relative space-y-0 border-l border-cyan-200 pl-6 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:border-l-0 sm:pl-0 lg:grid-cols-4`,children:i.map((t,n)=>(0,P.jsxs)(`li`,{className:`relative border-b border-slate-100 py-4 sm:border-t sm:border-b-0`,children:[(0,P.jsx)(`span`,{className:`absolute -left-[29px] top-5 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-600 sm:-top-[5px] sm:left-0`}),(0,P.jsx)(`div`,{className:`font-mono text-[11px] font-semibold text-cyan-700`,children:t.badge||String(n+1).padStart(2,`0`)}),(0,P.jsx)(`h3`,{className:`mt-1 text-sm font-semibold text-slate-950`,children:t.label}),t.detail?(0,P.jsx)(`p`,{className:`mt-1 text-sm leading-relaxed text-slate-600`,children:t.detail}):null]},`${e.term}-timeline-${n}`))})});if(n===`matrix`){let o=t?.columns?.length?t.columns.slice(0,4):[`低投入`,`高投入`];return(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsx)(`div`,{className:`grid gap-3 sm:grid-cols-2`,children:o.map((t,n)=>{let r=i.filter(e=>e.group===t),a=i.filter((e,t)=>t%o.length===n);return(0,P.jsxs)(`div`,{className:`min-h-36 rounded-xl border border-slate-200 bg-white p-4`,children:[(0,P.jsx)(`h3`,{className:`mb-3 text-xs font-semibold text-cyan-800`,children:t}),(0,P.jsx)(`div`,{className:`space-y-2`,children:(r.length?r:a).map((e,n)=>(0,P.jsx)(rh,{node:e},`${t}-${n}`))})]},`${e.term}-matrix-${t}`)})})})}return n===`anatomy`?(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsxs)(`div`,{className:`mx-auto max-w-3xl`,children:[(0,P.jsx)(`div`,{className:`mx-auto mb-4 w-fit rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-sm font-semibold text-cyan-900`,children:e.term}),(0,P.jsx)(`div`,{className:`grid gap-3 sm:grid-cols-2`,children:i.map((t,n)=>(0,P.jsx)(rh,{node:t,index:n},`${e.term}-anatomy-${n}`))})]})}):n===`roles`?(0,P.jsx)(nh,{kind:n,title:r,caption:a,children:(0,P.jsx)(`div`,{className:`overflow-hidden rounded-xl border border-slate-200 bg-white`,children:i.map((t,n)=>(0,P.jsxs)(`div`,{className:`grid gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)]`,children:[(0,P.jsx)(`span`,{className:`w-fit rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800`,children:t.actor||`参与方 ${n+1}`}),(0,P.jsxs)(`div`,{children:[(0,P.jsx)(`h3`,{className:`text-sm font-semibold text-slate-950`,children:t.label}),t.detail?(0,P.jsx)(`p`,{className:`mt-1 text-sm leading-relaxed text-slate-600`,children:t.detail}):null]})]},`${e.term}-role-${n}`))})}):n===`loop`?(0,P.jsxs)(nh,{kind:n,title:r,caption:a,children:[(0,P.jsx)(`div`,{className:`grid gap-3 sm:grid-cols-2 lg:grid-cols-4`,children:i.map((t,n)=>(0,P.jsxs)(`div`,{className:`relative`,children:[(0,P.jsx)(rh,{node:t,index:n}),(0,P.jsx)(`span`,{className:`absolute -bottom-3 left-1/2 text-cyan-600 lg:-right-3 lg:bottom-auto lg:left-auto lg:top-1/2`,children:n===i.length-1?`↻`:`→`})]},`${e.term}-loop-${n}`))}),(0,P.jsx)(`div`,{className:`mx-auto mt-6 w-fit rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-medium text-cyan-800`,children:`最后一步必须回到第一步，下一轮才会更快或更好`})]}):(0,P.jsx)(nh,{kind:`flow`,title:r,caption:a,children:(0,P.jsx)(`div`,{className:`flex flex-col gap-3 lg:flex-row lg:items-stretch`,children:i.map((t,n)=>(0,P.jsxs)(`div`,{className:`contents`,children:[(0,P.jsx)(`div`,{className:`flex-1`,children:(0,P.jsx)(rh,{node:t,index:n})}),n<i.length-1?(0,P.jsxs)(`div`,{className:`self-center text-center text-cyan-600`,"aria-hidden":`true`,children:[(0,P.jsx)(`span`,{className:`lg:hidden`,children:`↓`}),(0,P.jsx)(`span`,{className:`hidden lg:inline`,children:`→`})]}):null]},`${e.term}-flow-${n}`))})})}function oh(e){if(!e)return``;try{return decodeURIComponent(e)}catch{return e}}function sh(){let{term:e}=bt(),{glossary:t}=Nr(),n=oh(e),r=t.findIndex(e=>e.term.toLowerCase()===n.toLowerCase()||e.aliases?.some(e=>e.toLowerCase()===n.toLowerCase())),i=t[r];if(!i)return(0,P.jsxs)(`div`,{className:`mx-auto max-w-3xl py-20 text-center`,children:[(0,P.jsx)(`p`,{className:`text-sm font-medium text-cyan-700`,children:`术语未找到`}),(0,P.jsx)(`h1`,{className:`mt-2 text-3xl font-semibold tracking-tight text-slate-950`,children:`这个词条可能已改名`}),(0,P.jsx)(`p`,{className:`mt-3 text-sm text-slate-600`,children:`回到术语目录，可以按别名或大白话重新搜索。`}),(0,P.jsx)(zn,{to:`/glossary`,className:`mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white`,children:`返回术语目录`})]});let a=Ep(i),o=Op(i),s=kp(i),c=i.visual?.kind||`flow`,l=r>0?t[r-1]:void 0,u=r<t.length-1?t[r+1]:void 0,d=t.filter(e=>e.term!==i.term&&(e.module===i.module||a.some(t=>e.term===t.term||e.aliases?.some(e=>e===t.term)))).slice(0,4);return(0,P.jsxs)(`article`,{className:`mx-auto max-w-5xl pb-16`,children:[(0,P.jsxs)(`nav`,{className:`mb-8 flex items-center justify-between gap-4 text-sm`,children:[(0,P.jsx)(zn,{to:`/glossary`,className:`font-medium text-slate-500 hover:text-cyan-700`,children:`← 术语目录`}),(0,P.jsxs)(`span`,{className:`text-slate-400`,children:[r+1,` / `,t.length]})]}),(0,P.jsxs)(`header`,{className:`border-b border-slate-200 pb-9`,children:[(0,P.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[i.module?(0,P.jsx)(`span`,{className:`rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600`,children:i.module}):null,(0,P.jsxs)(`span`,{className:`rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800`,children:[Tp[c],`图解`]})]}),(0,P.jsxs)(`div`,{className:`mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2`,children:[(0,P.jsx)(`h1`,{className:`text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl`,children:i.term}),i.aliases?.length?(0,P.jsx)(`p`,{className:`text-lg text-slate-400`,children:i.aliases.join(` / `)}):null]}),(0,P.jsxs)(`blockquote`,{className:`mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 sm:px-6`,children:[(0,P.jsx)(`p`,{className:`text-xs font-semibold text-indigo-700`,children:`你可能会这样问`}),(0,P.jsxs)(`p`,{className:`mt-1 text-base leading-relaxed text-slate-800`,children:[`“`,Dp(i),`”`]})]}),(0,P.jsx)(`p`,{className:`mt-7 max-w-4xl text-lg font-medium leading-relaxed text-slate-800`,children:i.definition})]}),(0,P.jsx)(ah,{entry:i}),o?(0,P.jsxs)(`section`,{className:`mt-10`,children:[(0,P.jsx)(`h2`,{className:`text-2xl font-semibold tracking-tight text-slate-950`,children:`放进真实场景里`}),(0,P.jsx)(`div`,{className:`mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/55 px-5 py-5 sm:px-6`,children:(0,P.jsx)(`p`,{className:`whitespace-pre-line text-sm leading-7 text-slate-700`,children:o})})]}):null,s.length?(0,P.jsxs)(`section`,{className:`mt-10`,children:[(0,P.jsx)(`h2`,{className:`text-2xl font-semibold tracking-tight text-slate-950`,children:`把边界讲透`}),(0,P.jsx)(`dl`,{className:`mt-5 grid gap-x-8 gap-y-7 md:grid-cols-2`,children:s.map(({label:e,content:t})=>(0,P.jsxs)(`div`,{className:`border-t border-slate-200 pt-4`,children:[(0,P.jsx)(`dt`,{className:`text-sm font-semibold text-slate-950`,children:e}),(0,P.jsx)(`dd`,{className:`mt-2 whitespace-pre-line text-sm leading-7 text-slate-600`,children:t})]},e))})]}):null,a.length?(0,P.jsxs)(`section`,{className:`mt-10`,children:[(0,P.jsx)(`h2`,{className:`text-2xl font-semibold tracking-tight text-slate-950`,children:`容易混淆？这样区分`}),(0,P.jsx)(`div`,{className:`mt-5 grid gap-4 md:grid-cols-2`,children:a.map((e,t)=>(0,P.jsxs)(`div`,{className:`rounded-2xl border border-rose-100 bg-rose-50/45 p-5`,children:[(0,P.jsxs)(`div`,{className:`text-sm font-semibold text-rose-800`,children:[i.term,` ≠ `,e.term]}),(0,P.jsx)(`p`,{className:`mt-2 text-sm leading-7 text-slate-700`,children:e.distinction})]},`${i.term}-confusion-${e.term}-${t}`))})]}):null,d.length?(0,P.jsxs)(`section`,{className:`mt-12 border-t border-slate-200 pt-8`,children:[(0,P.jsx)(`h2`,{className:`text-lg font-semibold text-slate-950`,children:`接着看这些词`}),(0,P.jsx)(`div`,{className:`mt-4 flex flex-wrap gap-2`,children:d.map(e=>(0,P.jsxs)(zn,{to:`/glossary/${encodeURIComponent(e.term)}`,className:`rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-cyan-300 hover:text-cyan-800`,children:[e.term,` →`]},e.term))})]}):null,(0,P.jsxs)(`nav`,{className:`mt-12 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2`,children:[l?(0,P.jsxs)(zn,{to:`/glossary/${encodeURIComponent(l.term)}`,className:`rounded-2xl border border-slate-200 bg-white p-4 text-sm transition hover:border-cyan-300`,children:[(0,P.jsx)(`span`,{className:`text-xs text-slate-400`,children:`上一个词`}),(0,P.jsxs)(`span`,{className:`mt-1 block font-semibold text-slate-900`,children:[`← `,l.term]})]}):(0,P.jsx)(`span`,{}),u?(0,P.jsxs)(zn,{to:`/glossary/${encodeURIComponent(u.term)}`,className:`rounded-2xl border border-slate-200 bg-white p-4 text-right text-sm transition hover:border-cyan-300`,children:[(0,P.jsx)(`span`,{className:`text-xs text-slate-400`,children:`下一个词`}),(0,P.jsxs)(`span`,{className:`mt-1 block font-semibold text-slate-900`,children:[u.term,` →`]})]}):null]})]})}function ch(){return(0,P.jsx)(Mr,{children:(0,P.jsx)(Ln,{children:(0,P.jsx)(qt,{children:(0,P.jsxs)(Gt,{element:(0,P.jsx)(Kr,{}),children:[(0,P.jsx)(Gt,{path:`/`,element:(0,P.jsx)(qr,{})}),(0,P.jsx)(Gt,{path:`/glossary`,element:(0,P.jsx)(jp,{})}),(0,P.jsx)(Gt,{path:`/glossary/:term`,element:(0,P.jsx)(sh,{})}),(0,P.jsx)(Gt,{path:`/search`,element:(0,P.jsx)(Np,{})}),(0,P.jsx)(Gt,{path:`/graph`,element:(0,P.jsx)(Qm,{})}),(0,P.jsx)(Gt,{path:`/doc/*`,element:(0,P.jsx)(Sp,{})})]})})})})}(0,y.createRoot)(document.getElementById(`root`)).render((0,P.jsx)(v.StrictMode,{children:(0,P.jsx)(ch,{})}));