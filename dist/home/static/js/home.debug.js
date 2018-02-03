/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
module.exports = __webpack_require__(4);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (typeof Promise === 'undefined') {
  window.Promise = __webpack_require__(2)
}

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = __webpack_require__(3)


/***/ }),
/* 2 */
/***/ (function(module, exports) {

(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    return new Promise(function (resolve, reject) {
      if (!arr || typeof arr.length === 'undefined') throw new TypeError('Promise.all accepts an array');
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/zepto.js
var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*! Zepto 1.2.0
 * generated by @sina-mfe
 * modules: zepto event ajax form data callbacks deferred
 *///     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
var Zepto=function(){var undefined,key,$,classList,emptyArray=[],_concat=emptyArray.concat,_filter=emptyArray.filter,_slice=emptyArray.slice,document=window.document,elementDisplay={},classCache={},cssNumber={'column-count':1,'columns':1,'font-weight':1,'line-height':1,'opacity':1,'z-index':1,'zoom':1},fragmentRE=/^\s*<(\w+|!)[^>]*>/,singleTagRE=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,tagExpanderRE=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,rootNodeRE=/^(?:body|html)$/i,capitalRE=/([A-Z])/g,// special attributes that should be get/set via method calls
methodAttributes=['val','css','html','text','data','width','height','offset'],adjacencyOperators=['after','prepend','before','append'],table=document.createElement('table'),tableRow=document.createElement('tr'),containers={'tr':document.createElement('tbody'),'tbody':table,'thead':table,'tfoot':table,'td':tableRow,'th':tableRow,'*':document.createElement('div')},simpleSelectorRE=/^[\w-]*$/,class2type={},toString=class2type.toString,zepto={},camelize,uniq,tempParent=document.createElement('div'),propMap={'tabindex':'tabIndex','readonly':'readOnly','for':'htmlFor','class':'className','maxlength':'maxLength','cellspacing':'cellSpacing','cellpadding':'cellPadding','rowspan':'rowSpan','colspan':'colSpan','usemap':'useMap','frameborder':'frameBorder','contenteditable':'contentEditable'},isArray=Array.isArray||function(object){return object instanceof Array;};zepto.matches=function(element,selector){if(!selector||!element||element.nodeType!==1)return false;var matchesSelector=element.matches||element.webkitMatchesSelector||element.mozMatchesSelector||element.oMatchesSelector||element.matchesSelector;if(matchesSelector)return matchesSelector.call(element,selector);// fall back to performing a selector:
var match,parent=element.parentNode,temp=!parent;if(temp)(parent=tempParent).appendChild(element);match=~zepto.qsa(parent,selector).indexOf(element);temp&&tempParent.removeChild(element);return match;};function type(obj){return obj==null?String(obj):class2type[toString.call(obj)]||"object";}function isFunction(value){return type(value)=="function";}function isWindow(obj){return obj!=null&&obj==obj.window;}function isDocument(obj){return obj!=null&&obj.nodeType==obj.DOCUMENT_NODE;}function isObject(obj){return type(obj)=="object";}function isPlainObject(obj){return isObject(obj)&&!isWindow(obj)&&Object.getPrototypeOf(obj)==Object.prototype;}function likeArray(obj){var length=!!obj&&'length'in obj&&obj.length,type=$.type(obj);return'function'!=type&&!isWindow(obj)&&('array'==type||length===0||typeof length=='number'&&length>0&&length-1 in obj);}function compact(array){return _filter.call(array,function(item){return item!=null;});}function flatten(array){return array.length>0?$.fn.concat.apply([],array):array;}camelize=function camelize(str){return str.replace(/-+(.)?/g,function(match,chr){return chr?chr.toUpperCase():'';});};function dasherize(str){return str.replace(/::/g,'/').replace(/([A-Z]+)([A-Z][a-z])/g,'$1_$2').replace(/([a-z\d])([A-Z])/g,'$1_$2').replace(/_/g,'-').toLowerCase();}uniq=function uniq(array){return _filter.call(array,function(item,idx){return array.indexOf(item)==idx;});};function classRE(name){return name in classCache?classCache[name]:classCache[name]=new RegExp('(^|\\s)'+name+'(\\s|$)');}function maybeAddPx(name,value){return typeof value=="number"&&!cssNumber[dasherize(name)]?value+"px":value;}function defaultDisplay(nodeName){var element,display;if(!elementDisplay[nodeName]){element=document.createElement(nodeName);document.body.appendChild(element);display=getComputedStyle(element,'').getPropertyValue("display");element.parentNode.removeChild(element);display=="none"&&(display="block");elementDisplay[nodeName]=display;}return elementDisplay[nodeName];}function _children(element){return'children'in element?_slice.call(element.children):$.map(element.childNodes,function(node){if(node.nodeType==1)return node;});}function Z(dom,selector){var i,len=dom?dom.length:0;for(i=0;i<len;i++){this[i]=dom[i];}this.length=len;this.selector=selector||'';}// `$.zepto.fragment` takes a html string and an optional tag name
// to generate DOM nodes from the given html string.
// The generated DOM nodes are returned as an array.
// This function can be overridden in plugins for example to make
// it compatible with browsers that don't support the DOM fully.
zepto.fragment=function(html,name,properties){var dom,nodes,container;// A special case optimization for a single tag
if(singleTagRE.test(html))dom=$(document.createElement(RegExp.$1));if(!dom){if(html.replace)html=html.replace(tagExpanderRE,"<$1></$2>");if(name===undefined)name=fragmentRE.test(html)&&RegExp.$1;if(!(name in containers))name='*';container=containers[name];container.innerHTML=''+html;dom=$.each(_slice.call(container.childNodes),function(){container.removeChild(this);});}if(isPlainObject(properties)){nodes=$(dom);$.each(properties,function(key,value){if(methodAttributes.indexOf(key)>-1)nodes[key](value);else nodes.attr(key,value);});}return dom;};// `$.zepto.Z` swaps out the prototype of the given `dom` array
// of nodes with `$.fn` and thus supplying all the Zepto functions
// to the array. This method can be overridden in plugins.
zepto.Z=function(dom,selector){return new Z(dom,selector);};// `$.zepto.isZ` should return `true` if the given object is a Zepto
// collection. This method can be overridden in plugins.
zepto.isZ=function(object){return object instanceof zepto.Z;};// `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
// takes a CSS selector and an optional context (and handles various
// special cases).
// This method can be overridden in plugins.
zepto.init=function(selector,context){var dom;// If nothing given, return an empty Zepto collection
if(!selector)return zepto.Z();// Optimize for string selectors
else if(typeof selector=='string'){selector=selector.trim();// If it's a html fragment, create nodes from it
// Note: In both Chrome 21 and Firefox 15, DOM error 12
// is thrown if the fragment doesn't begin with <
if(selector[0]=='<'&&fragmentRE.test(selector))dom=zepto.fragment(selector,RegExp.$1,context),selector=null;// If there's a context, create a collection on that context first, and select
// nodes from there
else if(context!==undefined)return $(context).find(selector);// If it's a CSS selector, use it to select nodes.
else dom=zepto.qsa(document,selector);}// If a function is given, call it when the DOM is ready
else if(isFunction(selector))return $(document).ready(selector);// If a Zepto collection is given, just return it
else if(zepto.isZ(selector))return selector;else{// normalize array if an array of nodes is given
if(isArray(selector))dom=compact(selector);// Wrap DOM nodes.
else if(isObject(selector))dom=[selector],selector=null;// If it's a html fragment, create nodes from it
else if(fragmentRE.test(selector))dom=zepto.fragment(selector.trim(),RegExp.$1,context),selector=null;// If there's a context, create a collection on that context first, and select
// nodes from there
else if(context!==undefined)return $(context).find(selector);// And last but no least, if it's a CSS selector, use it to select nodes.
else dom=zepto.qsa(document,selector);}// create a new Zepto collection from the nodes found
return zepto.Z(dom,selector);};// `$` will be the base `Zepto` object. When calling this
// function just call `$.zepto.init, which makes the implementation
// details of selecting nodes and creating Zepto collections
// patchable in plugins.
$=function $(selector,context){return zepto.init(selector,context);};function extend(target,source,deep){for(key in source){if(deep&&(isPlainObject(source[key])||isArray(source[key]))){if(isPlainObject(source[key])&&!isPlainObject(target[key]))target[key]={};if(isArray(source[key])&&!isArray(target[key]))target[key]=[];extend(target[key],source[key],deep);}else if(source[key]!==undefined)target[key]=source[key];}}// Copy all but undefined properties from one or more
// objects to the `target` object.
$.extend=function(target){var deep,args=_slice.call(arguments,1);if(typeof target=='boolean'){deep=target;target=args.shift();}args.forEach(function(arg){extend(target,arg,deep);});return target;};// `$.zepto.qsa` is Zepto's CSS selector implementation which
// uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
// This method can be overridden in plugins.
zepto.qsa=function(element,selector){var found,maybeID=selector[0]=='#',maybeClass=!maybeID&&selector[0]=='.',nameOnly=maybeID||maybeClass?selector.slice(1):selector,// Ensure that a 1 char tag name still gets checked
isSimple=simpleSelectorRE.test(nameOnly);return element.getElementById&&isSimple&&maybeID?// Safari DocumentFragment doesn't have getElementById
(found=element.getElementById(nameOnly))?[found]:[]:element.nodeType!==1&&element.nodeType!==9&&element.nodeType!==11?[]:_slice.call(isSimple&&!maybeID&&element.getElementsByClassName?// DocumentFragment doesn't have getElementsByClassName/TagName
maybeClass?element.getElementsByClassName(nameOnly):// If it's simple, it could be a class
element.getElementsByTagName(selector):// Or a tag
element.querySelectorAll(selector)// Or it's not simple, and we need to query all
);};function filtered(nodes,selector){return selector==null?$(nodes):$(nodes).filter(selector);}$.contains=document.documentElement.contains?function(parent,node){return parent!==node&&parent.contains(node);}:function(parent,node){while(node&&(node=node.parentNode)){if(node===parent)return true;}return false;};function funcArg(context,arg,idx,payload){return isFunction(arg)?arg.call(context,idx,payload):arg;}function setAttribute(node,name,value){value==null?node.removeAttribute(name):node.setAttribute(name,value);}// access className property while respecting SVGAnimatedString
function className(node,value){var klass=node.className||'',svg=klass&&klass.baseVal!==undefined;if(value===undefined)return svg?klass.baseVal:klass;svg?klass.baseVal=value:node.className=value;}// "true"  => true
// "false" => false
// "null"  => null
// "42"    => 42
// "42.5"  => 42.5
// "08"    => "08"
// JSON    => parse if valid
// String  => self
function deserializeValue(value){try{return value?value=="true"||(value=="false"?false:value=="null"?null:+value+""==value?+value:/^[\[\{]/.test(value)?$.parseJSON(value):value):value;}catch(e){return value;}}$.type=type;$.isFunction=isFunction;$.isWindow=isWindow;$.isArray=isArray;$.isPlainObject=isPlainObject;$.isEmptyObject=function(obj){var name;for(name in obj){return false;}return true;};$.isNumeric=function(val){var num=Number(val),type=typeof val==='undefined'?'undefined':_typeof(val);return val!=null&&type!='boolean'&&(type!='string'||val.length)&&!isNaN(num)&&isFinite(num)||false;};$.inArray=function(elem,array,i){return emptyArray.indexOf.call(array,elem,i);};$.camelCase=camelize;$.trim=function(str){return str==null?"":String.prototype.trim.call(str);};// plugin compatibility
$.uuid=0;$.support={};$.expr={};$.noop=function(){};$.map=function(elements,callback){var value,values=[],i,key;if(likeArray(elements))for(i=0;i<elements.length;i++){value=callback(elements[i],i);if(value!=null)values.push(value);}else for(key in elements){value=callback(elements[key],key);if(value!=null)values.push(value);}return flatten(values);};$.each=function(elements,callback){var i,key;if(likeArray(elements)){for(i=0;i<elements.length;i++){if(callback.call(elements[i],i,elements[i])===false)return elements;}}else{for(key in elements){if(callback.call(elements[key],key,elements[key])===false)return elements;}}return elements;};$.grep=function(elements,callback){return _filter.call(elements,callback);};if(window.JSON)$.parseJSON=JSON.parse;// Populate the class2type map
$.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(i,name){class2type["[object "+name+"]"]=name.toLowerCase();});// Define methods that will be available on all
// Zepto collections
$.fn={constructor:zepto.Z,length:0,// Because a collection acts like an array
// copy over these useful array functions.
forEach:emptyArray.forEach,reduce:emptyArray.reduce,push:emptyArray.push,sort:emptyArray.sort,splice:emptyArray.splice,indexOf:emptyArray.indexOf,concat:function concat(){var i,value,args=[];for(i=0;i<arguments.length;i++){value=arguments[i];args[i]=zepto.isZ(value)?value.toArray():value;}return _concat.apply(zepto.isZ(this)?this.toArray():this,args);},// `map` and `slice` in the jQuery API work differently
// from their array counterparts
map:function map(fn){return $($.map(this,function(el,i){return fn.call(el,i,el);}));},slice:function slice(){return $(_slice.apply(this,arguments));},ready:function ready(callback){// don't use "interactive" on IE <= 10 (it can fired premature)
if(document.readyState==="complete"||document.readyState!=="loading"&&!document.documentElement.doScroll)setTimeout(function(){callback($);},0);else{var handler=function handler(){document.removeEventListener("DOMContentLoaded",handler,false);window.removeEventListener("load",handler,false);callback($);};document.addEventListener("DOMContentLoaded",handler,false);window.addEventListener("load",handler,false);}return this;},get:function get(idx){return idx===undefined?_slice.call(this):this[idx>=0?idx:idx+this.length];},toArray:function toArray(){return this.get();},size:function size(){return this.length;},remove:function remove(){return this.each(function(){if(this.parentNode!=null)this.parentNode.removeChild(this);});},each:function each(callback){emptyArray.every.call(this,function(el,idx){return callback.call(el,idx,el)!==false;});return this;},filter:function filter(selector){if(isFunction(selector))return this.not(this.not(selector));return $(_filter.call(this,function(element){return zepto.matches(element,selector);}));},add:function add(selector,context){return $(uniq(this.concat($(selector,context))));},is:function is(selector){return this.length>0&&zepto.matches(this[0],selector);},not:function not(selector){var nodes=[];if(isFunction(selector)&&selector.call!==undefined)this.each(function(idx){if(!selector.call(this,idx))nodes.push(this);});else{var excludes=typeof selector=='string'?this.filter(selector):likeArray(selector)&&isFunction(selector.item)?_slice.call(selector):$(selector);this.forEach(function(el){if(excludes.indexOf(el)<0)nodes.push(el);});}return $(nodes);},has:function has(selector){return this.filter(function(){return isObject(selector)?$.contains(this,selector):$(this).find(selector).size();});},eq:function eq(idx){return idx===-1?this.slice(idx):this.slice(idx,+idx+1);},first:function first(){var el=this[0];return el&&!isObject(el)?el:$(el);},last:function last(){var el=this[this.length-1];return el&&!isObject(el)?el:$(el);},find:function find(selector){var result,$this=this;if(!selector)result=$();else if((typeof selector==='undefined'?'undefined':_typeof(selector))=='object')result=$(selector).filter(function(){var node=this;return emptyArray.some.call($this,function(parent){return $.contains(parent,node);});});else if(this.length==1)result=$(zepto.qsa(this[0],selector));else result=this.map(function(){return zepto.qsa(this,selector);});return result;},closest:function closest(selector,context){var nodes=[],collection=(typeof selector==='undefined'?'undefined':_typeof(selector))=='object'&&$(selector);this.each(function(_,node){while(node&&!(collection?collection.indexOf(node)>=0:zepto.matches(node,selector))){node=node!==context&&!isDocument(node)&&node.parentNode;}if(node&&nodes.indexOf(node)<0)nodes.push(node);});return $(nodes);},parents:function parents(selector){var ancestors=[],nodes=this;while(nodes.length>0){nodes=$.map(nodes,function(node){if((node=node.parentNode)&&!isDocument(node)&&ancestors.indexOf(node)<0){ancestors.push(node);return node;}});}return filtered(ancestors,selector);},parent:function parent(selector){return filtered(uniq(this.pluck('parentNode')),selector);},children:function children(selector){return filtered(this.map(function(){return _children(this);}),selector);},contents:function contents(){return this.map(function(){return this.contentDocument||_slice.call(this.childNodes);});},siblings:function siblings(selector){return filtered(this.map(function(i,el){return _filter.call(_children(el.parentNode),function(child){return child!==el;});}),selector);},empty:function empty(){return this.each(function(){this.innerHTML='';});},// `pluck` is borrowed from Prototype.js
pluck:function pluck(property){return $.map(this,function(el){return el[property];});},show:function show(){return this.each(function(){this.style.display=="none"&&(this.style.display='');if(getComputedStyle(this,'').getPropertyValue("display")=="none")this.style.display=defaultDisplay(this.nodeName);});},replaceWith:function replaceWith(newContent){return this.before(newContent).remove();},wrap:function wrap(structure){var func=isFunction(structure);if(this[0]&&!func)var dom=$(structure).get(0),clone=dom.parentNode||this.length>1;return this.each(function(index){$(this).wrapAll(func?structure.call(this,index):clone?dom.cloneNode(true):dom);});},wrapAll:function wrapAll(structure){if(this[0]){$(this[0]).before(structure=$(structure));var children;// drill down to the inmost element
while((children=structure.children()).length){structure=children.first();}$(structure).append(this);}return this;},wrapInner:function wrapInner(structure){var func=isFunction(structure);return this.each(function(index){var self=$(this),contents=self.contents(),dom=func?structure.call(this,index):structure;contents.length?contents.wrapAll(dom):self.append(dom);});},unwrap:function unwrap(){this.parent().each(function(){$(this).replaceWith($(this).children());});return this;},clone:function clone(){return this.map(function(){return this.cloneNode(true);});},hide:function hide(){return this.css("display","none");},toggle:function toggle(setting){return this.each(function(){var el=$(this);(setting===undefined?el.css("display")=="none":setting)?el.show():el.hide();});},prev:function prev(selector){return $(this.pluck('previousElementSibling')).filter(selector||'*');},next:function next(selector){return $(this.pluck('nextElementSibling')).filter(selector||'*');},html:function html(_html){return 0 in arguments?this.each(function(idx){var originHtml=this.innerHTML;$(this).empty().append(funcArg(this,_html,idx,originHtml));}):0 in this?this[0].innerHTML:null;},text:function text(_text){return 0 in arguments?this.each(function(idx){var newText=funcArg(this,_text,idx,this.textContent);this.textContent=newText==null?'':''+newText;}):0 in this?this.pluck('textContent').join(""):null;},attr:function attr(name,value){var result;return typeof name=='string'&&!(1 in arguments)?0 in this&&this[0].nodeType==1&&(result=this[0].getAttribute(name))!=null?result:undefined:this.each(function(idx){if(this.nodeType!==1)return;if(isObject(name))for(key in name){setAttribute(this,key,name[key]);}else setAttribute(this,name,funcArg(this,value,idx,this.getAttribute(name)));});},removeAttr:function removeAttr(name){return this.each(function(){this.nodeType===1&&name.split(' ').forEach(function(attribute){setAttribute(this,attribute);},this);});},prop:function prop(name,value){name=propMap[name]||name;return 1 in arguments?this.each(function(idx){this[name]=funcArg(this,value,idx,this[name]);}):this[0]&&this[0][name];},removeProp:function removeProp(name){name=propMap[name]||name;return this.each(function(){delete this[name];});},data:function data(name,value){var attrName='data-'+name.replace(capitalRE,'-$1').toLowerCase();var data=1 in arguments?this.attr(attrName,value):this.attr(attrName);return data!==null?deserializeValue(data):undefined;},val:function val(value){if(0 in arguments){if(value==null)value="";return this.each(function(idx){this.value=funcArg(this,value,idx,this.value);});}else{return this[0]&&(this[0].multiple?$(this[0]).find('option').filter(function(){return this.selected;}).pluck('value'):this[0].value);}},offset:function offset(coordinates){if(coordinates)return this.each(function(index){var $this=$(this),coords=funcArg(this,coordinates,index,$this.offset()),parentOffset=$this.offsetParent().offset(),props={top:coords.top-parentOffset.top,left:coords.left-parentOffset.left};if($this.css('position')=='static')props['position']='relative';$this.css(props);});if(!this.length)return null;if(document.documentElement!==this[0]&&!$.contains(document.documentElement,this[0]))return{top:0,left:0};var obj=this[0].getBoundingClientRect();return{left:obj.left+window.pageXOffset,top:obj.top+window.pageYOffset,width:Math.round(obj.width),height:Math.round(obj.height)};},css:function css(property,value){if(arguments.length<2){var element=this[0];if(typeof property=='string'){if(!element)return;return element.style[camelize(property)]||getComputedStyle(element,'').getPropertyValue(property);}else if(isArray(property)){if(!element)return;var props={};var computedStyle=getComputedStyle(element,'');$.each(property,function(_,prop){props[prop]=element.style[camelize(prop)]||computedStyle.getPropertyValue(prop);});return props;}}var css='';if(type(property)=='string'){if(!value&&value!==0)this.each(function(){this.style.removeProperty(dasherize(property));});else css=dasherize(property)+":"+maybeAddPx(property,value);}else{for(key in property){if(!property[key]&&property[key]!==0)this.each(function(){this.style.removeProperty(dasherize(key));});else css+=dasherize(key)+':'+maybeAddPx(key,property[key])+';';}}return this.each(function(){this.style.cssText+=';'+css;});},index:function index(element){return element?this.indexOf($(element)[0]):this.parent().children().indexOf(this[0]);},hasClass:function hasClass(name){if(!name)return false;return emptyArray.some.call(this,function(el){return this.test(className(el));},classRE(name));},addClass:function addClass(name){if(!name)return this;return this.each(function(idx){if(!('className'in this))return;classList=[];var cls=className(this),newName=funcArg(this,name,idx,cls);newName.split(/\s+/g).forEach(function(klass){if(!$(this).hasClass(klass))classList.push(klass);},this);classList.length&&className(this,cls+(cls?" ":"")+classList.join(" "));});},removeClass:function removeClass(name){return this.each(function(idx){if(!('className'in this))return;if(name===undefined)return className(this,'');classList=className(this);funcArg(this,name,idx,classList).split(/\s+/g).forEach(function(klass){classList=classList.replace(classRE(klass)," ");});className(this,classList.trim());});},toggleClass:function toggleClass(name,when){if(!name)return this;return this.each(function(idx){var $this=$(this),names=funcArg(this,name,idx,className(this));names.split(/\s+/g).forEach(function(klass){(when===undefined?!$this.hasClass(klass):when)?$this.addClass(klass):$this.removeClass(klass);});});},scrollTop:function scrollTop(value){if(!this.length)return;var hasScrollTop='scrollTop'in this[0];if(value===undefined)return hasScrollTop?this[0].scrollTop:this[0].pageYOffset;return this.each(hasScrollTop?function(){this.scrollTop=value;}:function(){this.scrollTo(this.scrollX,value);});},scrollLeft:function scrollLeft(value){if(!this.length)return;var hasScrollLeft='scrollLeft'in this[0];if(value===undefined)return hasScrollLeft?this[0].scrollLeft:this[0].pageXOffset;return this.each(hasScrollLeft?function(){this.scrollLeft=value;}:function(){this.scrollTo(value,this.scrollY);});},position:function position(){if(!this.length)return;var elem=this[0],// Get *real* offsetParent
offsetParent=this.offsetParent(),// Get correct offsets
offset=this.offset(),parentOffset=rootNodeRE.test(offsetParent[0].nodeName)?{top:0,left:0}:offsetParent.offset();// Subtract element margins
// note: when an element has margin: auto the offsetLeft and marginLeft
// are the same in Safari causing offset.left to incorrectly be 0
offset.top-=parseFloat($(elem).css('margin-top'))||0;offset.left-=parseFloat($(elem).css('margin-left'))||0;// Add offsetParent borders
parentOffset.top+=parseFloat($(offsetParent[0]).css('border-top-width'))||0;parentOffset.left+=parseFloat($(offsetParent[0]).css('border-left-width'))||0;// Subtract the two offsets
return{top:offset.top-parentOffset.top,left:offset.left-parentOffset.left};},offsetParent:function offsetParent(){return this.map(function(){var parent=this.offsetParent||document.body;while(parent&&!rootNodeRE.test(parent.nodeName)&&$(parent).css("position")=="static"){parent=parent.offsetParent;}return parent;});}// for now
};$.fn.detach=$.fn.remove// Generate the `width` and `height` functions
;['width','height'].forEach(function(dimension){var dimensionProperty=dimension.replace(/./,function(m){return m[0].toUpperCase();});$.fn[dimension]=function(value){var offset,el=this[0];if(value===undefined)return isWindow(el)?el['inner'+dimensionProperty]:isDocument(el)?el.documentElement['scroll'+dimensionProperty]:(offset=this.offset())&&offset[dimension];else return this.each(function(idx){el=$(this);el.css(dimension,funcArg(this,value,idx,el[dimension]()));});};});function traverseNode(node,fun){fun(node);for(var i=0,len=node.childNodes.length;i<len;i++){traverseNode(node.childNodes[i],fun);}}// Generate the `after`, `prepend`, `before`, `append`,
// `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
adjacencyOperators.forEach(function(operator,operatorIndex){var inside=operatorIndex%2;//=> prepend, append
$.fn[operator]=function(){// arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
var argType,nodes=$.map(arguments,function(arg){var arr=[];argType=type(arg);if(argType=="array"){arg.forEach(function(el){if(el.nodeType!==undefined)return arr.push(el);else if($.zepto.isZ(el))return arr=arr.concat(el.get());arr=arr.concat(zepto.fragment(el));});return arr;}return argType=="object"||arg==null?arg:zepto.fragment(arg);}),parent,copyByClone=this.length>1;if(nodes.length<1)return this;return this.each(function(_,target){parent=inside?target:target.parentNode;// convert all methods to a "before" operation
target=operatorIndex==0?target.nextSibling:operatorIndex==1?target.firstChild:operatorIndex==2?target:null;var parentInDocument=$.contains(document.documentElement,parent);nodes.forEach(function(node){if(copyByClone)node=node.cloneNode(true);else if(!parent)return $(node).remove();parent.insertBefore(node,target);if(parentInDocument)traverseNode(node,function(el){if(el.nodeName!=null&&el.nodeName.toUpperCase()==='SCRIPT'&&(!el.type||el.type==='text/javascript')&&!el.src){var target=el.ownerDocument?el.ownerDocument.defaultView:window;target['eval'].call(target,el.innerHTML);}});});});};// after    => insertAfter
// prepend  => prependTo
// before   => insertBefore
// append   => appendTo
$.fn[inside?operator+'To':'insert'+(operatorIndex?'Before':'After')]=function(html){$(html)[operator](this);return this;};});zepto.Z.prototype=Z.prototype=$.fn;// Export internal API functions in the `$.zepto` namespace
zepto.uniq=uniq;zepto.deserializeValue=deserializeValue;$.zepto=zepto;return $;}();// If `$` is not yet defined, point it to `Zepto`
window.Zepto=Zepto;window.$===undefined&&(window.$=Zepto)//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
;(function($){var _zid=1,undefined,slice=Array.prototype.slice,isFunction=$.isFunction,isString=function isString(obj){return typeof obj=='string';},handlers={},specialEvents={},focusinSupported='onfocusin'in window,focus={focus:'focusin',blur:'focusout'},hover={mouseenter:'mouseover',mouseleave:'mouseout'};specialEvents.click=specialEvents.mousedown=specialEvents.mouseup=specialEvents.mousemove='MouseEvents';function zid(element){return element._zid||(element._zid=_zid++);}function findHandlers(element,event,fn,selector){event=parse(event);if(event.ns)var matcher=matcherFor(event.ns);return(handlers[zid(element)]||[]).filter(function(handler){return handler&&(!event.e||handler.e==event.e)&&(!event.ns||matcher.test(handler.ns))&&(!fn||zid(handler.fn)===zid(fn))&&(!selector||handler.sel==selector);});}function parse(event){var parts=(''+event).split('.');return{e:parts[0],ns:parts.slice(1).sort().join(' ')};}function matcherFor(ns){return new RegExp('(?:^| )'+ns.replace(' ',' .* ?')+'(?: |$)');}function eventCapture(handler,captureSetting){return handler.del&&!focusinSupported&&handler.e in focus||!!captureSetting;}function realEvent(type){return hover[type]||focusinSupported&&focus[type]||type;}function add(element,events,fn,data,selector,delegator,capture){var id=zid(element),set=handlers[id]||(handlers[id]=[]);events.split(/\s/).forEach(function(event){if(event=='ready')return $(document).ready(fn);var handler=parse(event);handler.fn=fn;handler.sel=selector;// emulate mouseenter, mouseleave
if(handler.e in hover)fn=function fn(e){var related=e.relatedTarget;if(!related||related!==this&&!$.contains(this,related))return handler.fn.apply(this,arguments);};handler.del=delegator;var callback=delegator||fn;handler.proxy=function(e){e=compatible(e);if(e.isImmediatePropagationStopped())return;e.data=data;var result=callback.apply(element,e._args==undefined?[e]:[e].concat(e._args));if(result===false)e.preventDefault(),e.stopPropagation();return result;};handler.i=set.length;set.push(handler);if('addEventListener'in element)element.addEventListener(realEvent(handler.e),handler.proxy,eventCapture(handler,capture));});}function remove(element,events,fn,selector,capture){var id=zid(element);(events||'').split(/\s/).forEach(function(event){findHandlers(element,event,fn,selector).forEach(function(handler){delete handlers[id][handler.i];if('removeEventListener'in element)element.removeEventListener(realEvent(handler.e),handler.proxy,eventCapture(handler,capture));});});}$.event={add:add,remove:remove};$.proxy=function(fn,context){var args=2 in arguments&&slice.call(arguments,2);if(isFunction(fn)){var proxyFn=function proxyFn(){return fn.apply(context,args?args.concat(slice.call(arguments)):arguments);};proxyFn._zid=zid(fn);return proxyFn;}else if(isString(context)){if(args){args.unshift(fn[context],fn);return $.proxy.apply(null,args);}else{return $.proxy(fn[context],fn);}}else{throw new TypeError("expected function");}};$.fn.bind=function(event,data,callback){return this.on(event,data,callback);};$.fn.unbind=function(event,callback){return this.off(event,callback);};$.fn.one=function(event,selector,data,callback){return this.on(event,selector,data,callback,1);};var returnTrue=function returnTrue(){return true;},returnFalse=function returnFalse(){return false;},ignoreProperties=/^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,eventMethods={preventDefault:'isDefaultPrevented',stopImmediatePropagation:'isImmediatePropagationStopped',stopPropagation:'isPropagationStopped'};function compatible(event,source){if(source||!event.isDefaultPrevented){source||(source=event);$.each(eventMethods,function(name,predicate){var sourceMethod=source[name];event[name]=function(){this[predicate]=returnTrue;return sourceMethod&&sourceMethod.apply(source,arguments);};event[predicate]=returnFalse;});try{event.timeStamp||(event.timeStamp=Date.now());}catch(ignored){}if(source.defaultPrevented!==undefined?source.defaultPrevented:'returnValue'in source?source.returnValue===false:source.getPreventDefault&&source.getPreventDefault())event.isDefaultPrevented=returnTrue;}return event;}function createProxy(event){var key,proxy={originalEvent:event};for(key in event){if(!ignoreProperties.test(key)&&event[key]!==undefined)proxy[key]=event[key];}return compatible(proxy,event);}$.fn.delegate=function(selector,event,callback){return this.on(event,selector,callback);};$.fn.undelegate=function(selector,event,callback){return this.off(event,selector,callback);};$.fn.live=function(event,callback){$(document.body).delegate(this.selector,event,callback);return this;};$.fn.die=function(event,callback){$(document.body).undelegate(this.selector,event,callback);return this;};$.fn.on=function(event,selector,data,callback,one){var autoRemove,delegator,$this=this;if(event&&!isString(event)){$.each(event,function(type,fn){$this.on(type,selector,data,fn,one);});return $this;}if(!isString(selector)&&!isFunction(callback)&&callback!==false)callback=data,data=selector,selector=undefined;if(callback===undefined||data===false)callback=data,data=undefined;if(callback===false)callback=returnFalse;return $this.each(function(_,element){if(one)autoRemove=function autoRemove(e){remove(element,e.type,callback);return callback.apply(this,arguments);};if(selector)delegator=function delegator(e){var evt,match=$(e.target).closest(selector,element).get(0);if(match&&match!==element){evt=$.extend(createProxy(e),{currentTarget:match,liveFired:element});return(autoRemove||callback).apply(match,[evt].concat(slice.call(arguments,1)));}};add(element,event,callback,data,selector,delegator||autoRemove);});};$.fn.off=function(event,selector,callback){var $this=this;if(event&&!isString(event)){$.each(event,function(type,fn){$this.off(type,selector,fn);});return $this;}if(!isString(selector)&&!isFunction(callback)&&callback!==false)callback=selector,selector=undefined;if(callback===false)callback=returnFalse;return $this.each(function(){remove(this,event,callback,selector);});};$.fn.trigger=function(event,args){event=isString(event)||$.isPlainObject(event)?$.Event(event):compatible(event);event._args=args;return this.each(function(){// handle focus(), blur() by calling them directly
if(event.type in focus&&typeof this[event.type]=="function")this[event.type]();// items in the collection might not be DOM elements
else if('dispatchEvent'in this)this.dispatchEvent(event);else $(this).triggerHandler(event,args);});};// triggers event handlers on current element just as if an event occurred,
// doesn't trigger an actual event, doesn't bubble
$.fn.triggerHandler=function(event,args){var e,result;this.each(function(i,element){e=createProxy(isString(event)?$.Event(event):event);e._args=args;e.target=element;$.each(findHandlers(element,event.type||event),function(i,handler){result=handler.proxy(e);if(e.isImmediatePropagationStopped())return false;});});return result;}// shortcut methods for `.bind(event, fn)` for each event type
;('focusin focusout focus blur load resize scroll unload click dblclick '+'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+'change select keydown keypress keyup error').split(' ').forEach(function(event){$.fn[event]=function(callback){return 0 in arguments?this.bind(event,callback):this.trigger(event);};});$.Event=function(type,props){if(!isString(type))props=type,type=props.type;var event=document.createEvent(specialEvents[type]||'Events'),bubbles=true;if(props)for(var name in props){name=='bubbles'?bubbles=!!props[name]:event[name]=props[name];}event.initEvent(type,bubbles,true);return compatible(event);};})(Zepto)//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
;(function($){var jsonpID=+new Date(),document=window.document,key,name,rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,scriptTypeRE=/^(?:text|application)\/javascript/i,xmlTypeRE=/^(?:text|application)\/xml/i,jsonType='application/json',htmlType='text/html',blankRE=/^\s*$/,originAnchor=document.createElement('a');originAnchor.href=window.location.href;// trigger a custom event and return false if it was cancelled
function triggerAndReturn(context,eventName,data){var event=$.Event(eventName);$(context).trigger(event,data);return!event.isDefaultPrevented();}// trigger an Ajax "global" event
function triggerGlobal(settings,context,eventName,data){if(settings.global)return triggerAndReturn(context||document,eventName,data);}// Number of active Ajax requests
$.active=0;function ajaxStart(settings){if(settings.global&&$.active++===0)triggerGlobal(settings,null,'ajaxStart');}function ajaxStop(settings){if(settings.global&&! --$.active)triggerGlobal(settings,null,'ajaxStop');}// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
function ajaxBeforeSend(xhr,settings){var context=settings.context;if(settings.beforeSend.call(context,xhr,settings)===false||triggerGlobal(settings,context,'ajaxBeforeSend',[xhr,settings])===false)return false;triggerGlobal(settings,context,'ajaxSend',[xhr,settings]);}function ajaxSuccess(data,xhr,settings,deferred){var context=settings.context,status='success';settings.success.call(context,data,status,xhr);if(deferred)deferred.resolveWith(context,[data,status,xhr]);triggerGlobal(settings,context,'ajaxSuccess',[xhr,settings,data]);ajaxComplete(status,xhr,settings);}// type: "timeout", "error", "abort", "parsererror"
function ajaxError(error,type,xhr,settings,deferred){var context=settings.context;settings.error.call(context,xhr,type,error);if(deferred)deferred.rejectWith(context,[xhr,type,error]);triggerGlobal(settings,context,'ajaxError',[xhr,settings,error||type]);ajaxComplete(type,xhr,settings);}// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
function ajaxComplete(status,xhr,settings){var context=settings.context;settings.complete.call(context,xhr,status);triggerGlobal(settings,context,'ajaxComplete',[xhr,settings]);ajaxStop(settings);}function ajaxDataFilter(data,type,settings){if(settings.dataFilter==empty)return data;var context=settings.context;return settings.dataFilter.call(context,data,type);}// Empty function, used as default callback
function empty(){}$.ajaxJSONP=function(options,deferred){if(!('type'in options))return $.ajax(options);var _callbackName=options.jsonpCallback,callbackName=($.isFunction(_callbackName)?_callbackName():_callbackName)||'Zepto'+jsonpID++,script=document.createElement('script'),originalCallback=window[callbackName],responseData,abort=function abort(errorType){$(script).triggerHandler('error',errorType||'abort');},xhr={abort:abort},abortTimeout;if(deferred)deferred.promise(xhr);$(script).on('load error',function(e,errorType){clearTimeout(abortTimeout);$(script).off().remove();if(e.type=='error'||!responseData){ajaxError(null,errorType||'error',xhr,options,deferred);}else{ajaxSuccess(responseData[0],xhr,options,deferred);}window[callbackName]=originalCallback;if(responseData&&$.isFunction(originalCallback))originalCallback(responseData[0]);originalCallback=responseData=undefined;});if(ajaxBeforeSend(xhr,options)===false){abort('abort');return xhr;}window[callbackName]=function(){responseData=arguments;};script.src=options.url.replace(/\?(.+)=\?/,'?$1='+callbackName);document.head.appendChild(script);if(options.timeout>0)abortTimeout=setTimeout(function(){abort('timeout');},options.timeout);return xhr;};$.ajaxSettings={// Default type of request
type:'GET',// Callback that is executed before request
beforeSend:empty,// Callback that is executed if the request succeeds
success:empty,// Callback that is executed the the server drops error
error:empty,// Callback that is executed on request complete (both: error and success)
complete:empty,// The context for the callbacks
context:null,// Whether to trigger "global" Ajax events
global:true,// Transport
xhr:function xhr(){return new window.XMLHttpRequest();},// MIME types mapping
// IIS returns Javascript as "application/x-javascript"
accepts:{script:'text/javascript, application/javascript, application/x-javascript',json:jsonType,xml:'application/xml, text/xml',html:htmlType,text:'text/plain'},// Whether the request is to another domain
crossDomain:false,// Default timeout
timeout:0,// Whether data should be serialized to string
processData:true,// Whether the browser should be allowed to cache GET responses
cache:true,//Used to handle the raw response data of XMLHttpRequest.
//This is a pre-filtering function to sanitize the response.
//The sanitized response should be returned
dataFilter:empty};function mimeToDataType(mime){if(mime)mime=mime.split(';',2)[0];return mime&&(mime==htmlType?'html':mime==jsonType?'json':scriptTypeRE.test(mime)?'script':xmlTypeRE.test(mime)&&'xml')||'text';}function appendQuery(url,query){if(query=='')return url;return(url+'&'+query).replace(/[&?]{1,2}/,'?');}// serialize payload and append it to the URL for GET requests
function serializeData(options){if(options.processData&&options.data&&$.type(options.data)!="string")options.data=$.param(options.data,options.traditional);if(options.data&&(!options.type||options.type.toUpperCase()=='GET'||'jsonp'==options.dataType))options.url=appendQuery(options.url,options.data),options.data=undefined;}$.ajax=function(options){var settings=$.extend({},options||{}),deferred=$.Deferred&&$.Deferred(),urlAnchor,hashIndex;for(key in $.ajaxSettings){if(settings[key]===undefined)settings[key]=$.ajaxSettings[key];}ajaxStart(settings);if(!settings.crossDomain){urlAnchor=document.createElement('a');urlAnchor.href=settings.url;// cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
urlAnchor.href=urlAnchor.href;settings.crossDomain=originAnchor.protocol+'//'+originAnchor.host!==urlAnchor.protocol+'//'+urlAnchor.host;}if(!settings.url)settings.url=window.location.toString();if((hashIndex=settings.url.indexOf('#'))>-1)settings.url=settings.url.slice(0,hashIndex);serializeData(settings);var dataType=settings.dataType,hasPlaceholder=/\?.+=\?/.test(settings.url);if(hasPlaceholder)dataType='jsonp';if(settings.cache===false||(!options||options.cache!==true)&&('script'==dataType||'jsonp'==dataType))settings.url=appendQuery(settings.url,'_='+Date.now());if('jsonp'==dataType){if(!hasPlaceholder)settings.url=appendQuery(settings.url,settings.jsonp?settings.jsonp+'=?':settings.jsonp===false?'':'callback=?');return $.ajaxJSONP(settings,deferred);}var mime=settings.accepts[dataType],headers={},setHeader=function setHeader(name,value){headers[name.toLowerCase()]=[name,value];},protocol=/^([\w-]+:)\/\//.test(settings.url)?RegExp.$1:window.location.protocol,xhr=settings.xhr(),nativeSetHeader=xhr.setRequestHeader,abortTimeout;if(deferred)deferred.promise(xhr);if(!settings.crossDomain)setHeader('X-Requested-With','XMLHttpRequest');setHeader('Accept',mime||'*/*');if(mime=settings.mimeType||mime){if(mime.indexOf(',')>-1)mime=mime.split(',',2)[0];xhr.overrideMimeType&&xhr.overrideMimeType(mime);}if(settings.contentType||settings.contentType!==false&&settings.data&&settings.type.toUpperCase()!='GET')setHeader('Content-Type',settings.contentType||'application/x-www-form-urlencoded');if(settings.headers)for(name in settings.headers){setHeader(name,settings.headers[name]);}xhr.setRequestHeader=setHeader;xhr.onreadystatechange=function(){if(xhr.readyState==4){xhr.onreadystatechange=empty;clearTimeout(abortTimeout);var result,error=false;if(xhr.status>=200&&xhr.status<300||xhr.status==304||xhr.status==0&&protocol=='file:'){dataType=dataType||mimeToDataType(settings.mimeType||xhr.getResponseHeader('content-type'));if(xhr.responseType=='arraybuffer'||xhr.responseType=='blob')result=xhr.response;else{result=xhr.responseText;try{// http://perfectionkills.com/global-eval-what-are-the-options/
// sanitize response accordingly if data filter callback provided
result=ajaxDataFilter(result,dataType,settings);if(dataType=='script')(1,eval)(result);else if(dataType=='xml')result=xhr.responseXML;else if(dataType=='json')result=blankRE.test(result)?null:$.parseJSON(result);}catch(e){error=e;}if(error)return ajaxError(error,'parsererror',xhr,settings,deferred);}ajaxSuccess(result,xhr,settings,deferred);}else{ajaxError(xhr.statusText||null,xhr.status?'error':'abort',xhr,settings,deferred);}}};if(ajaxBeforeSend(xhr,settings)===false){xhr.abort();ajaxError(null,'abort',xhr,settings,deferred);return xhr;}var async='async'in settings?settings.async:true;xhr.open(settings.type,settings.url,async,settings.username,settings.password);if(settings.xhrFields)for(name in settings.xhrFields){xhr[name]=settings.xhrFields[name];}for(name in headers){nativeSetHeader.apply(xhr,headers[name]);}if(settings.timeout>0)abortTimeout=setTimeout(function(){xhr.onreadystatechange=empty;xhr.abort();ajaxError(null,'timeout',xhr,settings,deferred);},settings.timeout);// avoid sending empty string (#319)
xhr.send(settings.data?settings.data:null);return xhr;};// handle optional data/success arguments
function parseArguments(url,data,success,dataType){if($.isFunction(data))dataType=success,success=data,data=undefined;if(!$.isFunction(success))dataType=success,success=undefined;return{url:url,data:data,success:success,dataType:dataType};}$.get=function()/* url, data, success, dataType */{return $.ajax(parseArguments.apply(null,arguments));};$.post=function()/* url, data, success, dataType */{var options=parseArguments.apply(null,arguments);options.type='POST';return $.ajax(options);};$.getJSON=function()/* url, data, success */{var options=parseArguments.apply(null,arguments);options.dataType='json';return $.ajax(options);};$.fn.load=function(url,data,success){if(!this.length)return this;var self=this,parts=url.split(/\s/),selector,options=parseArguments(url,data,success),callback=options.success;if(parts.length>1)options.url=parts[0],selector=parts[1];options.success=function(response){self.html(selector?$('<div>').html(response.replace(rscript,"")).find(selector):response);callback&&callback.apply(self,arguments);};$.ajax(options);return this;};var escape=encodeURIComponent;function serialize(params,obj,traditional,scope){var type,array=$.isArray(obj),hash=$.isPlainObject(obj);$.each(obj,function(key,value){type=$.type(value);if(scope)key=traditional?scope:scope+'['+(hash||type=='object'||type=='array'?key:'')+']';// handle data in serializeArray() format
if(!scope&&array)params.add(value.name,value.value);// recurse into nested objects
else if(type=="array"||!traditional&&type=="object")serialize(params,value,traditional,key);else params.add(key,value);});}$.param=function(obj,traditional){var params=[];params.add=function(key,value){if($.isFunction(value))value=value();if(value==null)value="";this.push(escape(key)+'='+escape(value));};serialize(params,obj,traditional);return params.join('&').replace(/%20/g,'+');};})(Zepto)//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
;(function($){$.fn.serializeArray=function(){var name,type,result=[],add=function add(value){if(value.forEach)return value.forEach(add);result.push({name:name,value:value});};if(this[0])$.each(this[0].elements,function(_,field){type=field.type,name=field.name;if(name&&field.nodeName.toLowerCase()!='fieldset'&&!field.disabled&&type!='submit'&&type!='reset'&&type!='button'&&type!='file'&&(type!='radio'&&type!='checkbox'||field.checked))add($(field).val());});return result;};$.fn.serialize=function(){var result=[];this.serializeArray().forEach(function(elm){result.push(encodeURIComponent(elm.name)+'='+encodeURIComponent(elm.value));});return result.join('&');};$.fn.submit=function(callback){if(0 in arguments)this.bind('submit',callback);else if(this.length){var event=$.Event('submit');this.eq(0).trigger(event);if(!event.isDefaultPrevented())this.get(0).submit();}return this;};})(Zepto)//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
// The following code is heavily inspired by jQuery's $.fn.data()
;(function($){var data={},dataAttr=$.fn.data,camelize=$.camelCase,exp=$.expando='Zepto'+ +new Date(),emptyArray=[];// Get value from node:
// 1. first try key as given,
// 2. then try camelized key,
// 3. fall back to reading "data-*" attribute.
function getData(node,name){var id=node[exp],store=id&&data[id];if(name===undefined)return store||setData(node);else{if(store){if(name in store)return store[name];var camelName=camelize(name);if(camelName in store)return store[camelName];}return dataAttr.call($(node),name);}}// Store value under camelized key on node
function setData(node,name,value){var id=node[exp]||(node[exp]=++$.uuid),store=data[id]||(data[id]=attributeData(node));if(name!==undefined)store[camelize(name)]=value;return store;}// Read all "data-*" attributes from a node
function attributeData(node){var store={};$.each(node.attributes||emptyArray,function(i,attr){if(attr.name.indexOf('data-')==0)store[camelize(attr.name.replace('data-',''))]=$.zepto.deserializeValue(attr.value);});return store;}$.fn.data=function(name,value){return value===undefined?// set multiple values via object
$.isPlainObject(name)?this.each(function(i,node){$.each(name,function(key,value){setData(node,key,value);});}):// get value from first element
0 in this?getData(this[0],name):undefined:// set value on all elements
this.each(function(){setData(this,name,value);});};$.data=function(elem,name,value){return $(elem).data(name,value);};$.hasData=function(elem){var id=elem[exp],store=id&&data[id];return store?!$.isEmptyObject(store):false;};$.fn.removeData=function(names){if(typeof names=='string')names=names.split(/\s+/);return this.each(function(){var id=this[exp],store=id&&data[id];if(store)$.each(names||store,function(key){delete store[names?camelize(this):key];});});}// Generate extended `remove` and `empty` functions
;['remove','empty'].forEach(function(methodName){var origFn=$.fn[methodName];$.fn[methodName]=function(){var elements=this.find('*');if(methodName==='remove')elements=elements.add(this);elements.removeData();return origFn.call(this);};});})(Zepto)//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
;(function($){// Create a collection of callbacks to be fired in a sequence, with configurable behaviour
// Option flags:
//   - once: Callbacks fired at most one time.
//   - memory: Remember the most recent context and arguments
//   - stopOnFalse: Cease iterating over callback list
//   - unique: Permit adding at most one instance of the same callback
$.Callbacks=function(options){options=$.extend({},options);var memory,// Last fire value (for non-forgettable lists)
_fired,// Flag to know if list was already fired
firing,// Flag to know if list is currently firing
firingStart,// First callback to fire (used internally by add and fireWith)
firingLength,// End of the loop when firing
firingIndex,// Index of currently firing callback (modified by remove if needed)
list=[],// Actual callback list
stack=!options.once&&[],// Stack of fire calls for repeatable lists
fire=function fire(data){memory=options.memory&&data;_fired=true;firingIndex=firingStart||0;firingStart=0;firingLength=list.length;firing=true;for(;list&&firingIndex<firingLength;++firingIndex){if(list[firingIndex].apply(data[0],data[1])===false&&options.stopOnFalse){memory=false;break;}}firing=false;if(list){if(stack)stack.length&&fire(stack.shift());else if(memory)list.length=0;else Callbacks.disable();}},Callbacks={add:function add(){if(list){var start=list.length,add=function add(args){$.each(args,function(_,arg){if(typeof arg==="function"){if(!options.unique||!Callbacks.has(arg))list.push(arg);}else if(arg&&arg.length&&typeof arg!=='string')add(arg);});};add(arguments);if(firing)firingLength=list.length;else if(memory){firingStart=start;fire(memory);}}return this;},remove:function remove(){if(list){$.each(arguments,function(_,arg){var index;while((index=$.inArray(arg,list,index))>-1){list.splice(index,1);// Handle firing indexes
if(firing){if(index<=firingLength)--firingLength;if(index<=firingIndex)--firingIndex;}}});}return this;},has:function has(fn){return!!(list&&(fn?$.inArray(fn,list)>-1:list.length));},empty:function empty(){firingLength=list.length=0;return this;},disable:function disable(){list=stack=memory=undefined;return this;},disabled:function disabled(){return!list;},lock:function lock(){stack=undefined;if(!memory)Callbacks.disable();return this;},locked:function locked(){return!stack;},fireWith:function fireWith(context,args){if(list&&(!_fired||stack)){args=args||[];args=[context,args.slice?args.slice():args];if(firing)stack.push(args);else fire(args);}return this;},fire:function fire(){return Callbacks.fireWith(this,arguments);},fired:function fired(){return!!_fired;}};return Callbacks;};})(Zepto)//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
//
//     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors
;(function($){var slice=Array.prototype.slice;function Deferred(func){var tuples=[// action, add listener, listener list, final state
["resolve","done",$.Callbacks({once:1,memory:1}),"resolved"],["reject","fail",$.Callbacks({once:1,memory:1}),"rejected"],["notify","progress",$.Callbacks({memory:1})]],_state="pending",_promise={state:function state(){return _state;},always:function always(){deferred.done(arguments).fail(arguments);return this;},then:function then()/* fnDone [, fnFailed [, fnProgress]] */{var fns=arguments;return Deferred(function(defer){$.each(tuples,function(i,tuple){var fn=$.isFunction(fns[i])&&fns[i];deferred[tuple[1]](function(){var returned=fn&&fn.apply(this,arguments);if(returned&&$.isFunction(returned.promise)){returned.promise().done(defer.resolve).fail(defer.reject).progress(defer.notify);}else{var context=this===_promise?defer.promise():this,values=fn?[returned]:arguments;defer[tuple[0]+"With"](context,values);}});});fns=null;}).promise();},promise:function promise(obj){return obj!=null?$.extend(obj,_promise):_promise;}},deferred={};$.each(tuples,function(i,tuple){var list=tuple[2],stateString=tuple[3];_promise[tuple[1]]=list.add;if(stateString){list.add(function(){_state=stateString;},tuples[i^1][2].disable,tuples[2][2].lock);}deferred[tuple[0]]=function(){deferred[tuple[0]+"With"](this===deferred?_promise:this,arguments);return this;};deferred[tuple[0]+"With"]=list.fireWith;});_promise.promise(deferred);if(func)func.call(deferred,deferred);return deferred;}$.when=function(sub){var resolveValues=slice.call(arguments),len=resolveValues.length,i=0,remain=len!==1||sub&&$.isFunction(sub.promise)?len:0,deferred=remain===1?sub:Deferred(),progressValues,progressContexts,resolveContexts,updateFn=function updateFn(i,ctx,val){return function(value){ctx[i]=this;val[i]=arguments.length>1?slice.call(arguments):value;if(val===progressValues){deferred.notifyWith(ctx,val);}else if(! --remain){deferred.resolveWith(ctx,val);}};};if(len>1){progressValues=new Array(len);progressContexts=new Array(len);resolveContexts=new Array(len);for(;i<len;++i){if(resolveValues[i]&&$.isFunction(resolveValues[i].promise)){resolveValues[i].promise().done(updateFn(i,resolveContexts,resolveValues)).fail(deferred.reject).progress(updateFn(i,progressContexts,progressValues));}else{--remain;}}}if(!remain)deferred.resolveWith(resolveContexts,resolveValues);return deferred.promise();};$.Deferred=Deferred;})(Zepto);/* harmony default export */ var zepto = (Zepto);
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/event.js
var _onObj={};var _oneObj={};var event_event={/**
   * 监听事件
   * @param  {String}   key 事件名称
   * @param  {Function} fn  回调函数
   */on:function on(key,fn){if(_onObj[key]===undefined){_onObj[key]=[];}_onObj[key].push(fn);},one:function one(key,fn){if(_oneObj[key]===undefined){_oneObj[key]=[];}_oneObj[key].push(fn);},off:function off(key){_onObj[key]=[];_oneObj[key]=[];},emit:function emit(){var key=void 0,args=void 0;if(!arguments.length){return false;}key=arguments[0];args=[].concat(Array.prototype.slice.call(arguments,1));if(_onObj[key]&&_onObj[key].length){for(var i in _onObj[key]){_onObj[key][i].apply(null,args);}}if(_oneObj[key]&&_oneObj[key].length){for(var _i in this.oneObj[key]){_oneObj[key][_i].apply(null,args);_oneObj[key][_i]=void 0;}_oneObj[key]=[];}}};var eventPlus={showEvents:function showEvents(type){var events={on:Object.keys(_onObj),one:Object.keys(_oneObj)};return type?events[type]:events;}};var superEvent=$.extend(eventPlus,event_event);
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/context.js
var SID='mr-type';var runtime={// 模块实例集合
// 在继承了 BaseModule 的组件对象实例化时注册
// 在 ModuleFactory 自动绑定 DOM 组件时注册
// {
//   Foo: [  // 键值为 class name
//     {
//        el: Element,
//        obj: foo,
//        src: 'obj'
//     },
//     {
//        el: Element,
//        obj: foo,
//        src: 'dom'
//     },
//     ...
//   ],
//   Bar: [{bar1}, {bar2}, ...]
// }
instancePool:{get length(){return Object.keys(runtime.instancePool).length-1;}},// 模块构造器数集合，由 BaseModule.regist 注册
// {<typeName>: <Class>}
// {
//   foo: class Foo,
//   bar: class Bar
// }
classPool:{}};var context_context={// 支持原生对象，Zepto对象，CSS 选择器
getInstance:function getInstance(selector){var results=queryInstances(selector);switch(results.length){case 0:return null;case 1:return results[0]['obj'];default:return results.map(function(mod){return mod.obj;});}},/**
   * 获取所有通过 BaseModule.regist 注册的类
   * @return {Array} [{class: 'Foo', typeName: 'foo'}]
   */showProtoes:function showProtoes(){return Object.keys(runtime.classPool).map(function(name){return{class:runtime.classPool[name].name,typeName:name};});},getProto:function getProto(typeName){return runtime.classPool[typeName];},destroy:function destroy(obj){}};/**
 * 将组件初始化后的实例对象注册到 runtime 的实例池中
 * @param  {Module Object} obj 组件对象
 * @param  {Element} el  组件绑定的原生 DOM 元素
 */function registerRuntime(obj,el){var className=obj.constructor.name;var conf={obj:obj,el:el,className:className,index:getInitedObjIndex(className,el)};if(conf.index>-1){console.warn(el);throw new Error('同一元素不可绑定多个对象');}else if(hasInstanceType(className)){patchInstance(conf);}else{addInstance(conf);}// console.log(el)
}function addInstance(ins){Object.defineProperty(runtime.instancePool,ins.className,{value:[{obj:ins.obj,el:ins.el,src:ins.el['__src']==='dom'?'dom':'obj'}],writable:false,enumerable:true});}function patchInstance(ins){runtime.instancePool[ins.className].push({obj:ins.obj,el:ins.el,src:ins.el['__src']==='dom'?'dom':'obj'});}// function replaceInstance(ins) {
//   const instanceList = getInstancesByClassName(ins.className)
//   if (ins.el['__src'] !== 'dom') {
//     instanceList[ins.index].obj = ins.obj
//   }
// }
function hasInstanceType(className){return runtime.instancePool.hasOwnProperty(className);}// 根据查找某类别下绑定的实例，未找到索引时，返回 -1
function getInitedObjIndex(className,el){if(!hasInstanceType(className))return-1;var instanceList=getInstancesByClassName(className);for(var i=0;i<instanceList.length;i++){if(instanceList[i].el.isEqualNode(el))return i;}return-1;}// 当为 dom list 时取第一个元素，包装为 Zepto 对象
// el 非法时，返回 undefined
function getEl(el){var p=function p($el){return $el.length>0?($el['__ck']=true,$el):void 0;};switch(true){case el instanceof Element:return p($(el));case el instanceof NodeList:return p($(el[0]));case el instanceof HTMLCollection:return p($(el[0]));case el&&el['__ck']:return el;// $el
default:return p($($(el).get(0)));// Zepto
}}// el 参数类型安全，兼容原生 Element 与 Zepto 对象
function getTypeNameByDOM($el){return $el?$el.attr(SID):$el;}function getClassNameByDOM($el){var typeName=getTypeNameByDOM($el);var MClass=context_context.getProto(typeName);return MClass&&MClass.name;}function getInstancesByClassName(name){var objs=runtime.instancePool[name];// 始终返回数组，方便遍历使用
return typeof objs==='undefined'?[]:objs;}function getInstancesByDOM($el){var className=getClassNameByDOM($el);return getInstancesByClassName(className);}function queryInstances(selector){var $el=getEl(selector);var instanceList=getInstancesByDOM($el);return instanceList.filter(function(mod){return mod.el.isEqualNode($el[0]);});}function destroyRuntime(obj){console.log('destroy',obj);}
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/module-control.js
var module_control__typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var module_control_BaseModule=function(){/**
   * 模块基类
   * @param  {Element | $Element}  el      dom 节点，可为原生或 zeto 对象
   * @param  {Object}  options 自定义配置信息
   * @param  {Boolean} isRoot  是否将自定义配置作为根配置
   */function BaseModule(el){var options=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var isRoot=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;_classCallCheck(this,BaseModule);var $el=this.$el=getEl(el);// 模块实例 on 事件集合
var _evtOn={};// 模块实例 one 事件集合
var _evtOne={};if(!$el)throw new Error('can\'t find element');var config=this._getDOMConfig(el);this.__options=isRoot?zepto.extend(true,config,options):zepto.extend(true,options,config);this.on=function(key,fn){if(_evtOn[key]===undefined){_evtOn[key]=[];}_evtOn[key].push(fn);};this.one=function(key,fn){if(_evtOne[key]===undefined){_evtOne[key]=[];}_evtOne[key].push(fn);};this.off=function(key){_evtOn[key]=[];_evtOne[key]=[];};/**
     * 触发事件
     * @param  {String}  事件名
     * @param  {...args}  不定参数，事件信息
     */this.emit=function(){var key=void 0,args=void 0;if(!arguments.length){return false;}key=arguments[0];args=[].concat(Array.prototype.slice.call(arguments,1));if(_evtOn[key]&&_evtOn[key].length){for(var i in _evtOn[key]){_evtOn[key][i].apply(null,args);}}if(_evtOne[key]&&_evtOne[key].length){for(var _i in this.oneObj[key]){_evtOne[key][_i].apply(null,args);_evtOne[key][_i]=void 0;}_evtOne[key]=[];}};$el.attr(SID,this.constructor.mrType);registerRuntime(this,$el[0]);}_createClass(BaseModule,[{key:'getContext',value:function getContext(){return context_context;}},{key:'getOptions',value:function getOptions(){var defConfig=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};return zepto.extend(true,{},defConfig,this.__options);}},{key:'destroy',value:function destroy(){destroyRuntime(this);}},{key:'_getDOMConfig',value:function _getDOMConfig(el){var $el=getEl(el||this.$el);// el 非法时，返回 {}
if((typeof $el==='undefined'?'undefined':module_control__typeof($el))===undefined)return{};var dataset=$el[0].dataset;var objDataset=getObjectAttr($el,'datas-');// console.log(objDataset)
return zepto.extend({},dataset,objDataset);}}],[{key:'register',value:function register(ClassObj,typeName){ClassObj.mrType=typeName;runtime.classPool[typeName]=ClassObj;}}]);return BaseModule;}();function getObjectAttr($el){var flag=arguments.length>1&&arguments[1]!==undefined?arguments[1]:'datas-';var attr=$el[0].attributes;var mDataset={};for(var i=0;i<attr.length;i++){var name=attr[i].name;var val=attr[i].value;if(name.indexOf(flag)>-1){name=name.replace(flag,'');mDataset[name]=parseJson(val);}}return mDataset;}function parseJson(str){try{return JSON.parse(str);// return eval('Object(' + str + ')')
}catch(e){return null;}}/* harmony default export */ var module_control = (module_control_BaseModule);
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/module-factory.js
var moduleFactory={init:function init(){var _this=this;// const $mDOMs = $(`[${sid}auto]`).not(`[${sid}auto=false]`)
var $mDOMs=zepto('['+SID+']').not('[mr-auto=false]');$mDOMs.each(function(i,el){// 查询 context 实例池，避免用户在 ready 事件前
// 调用 new 构造实例后，框架扫描 DOM 自动初始化多次
if(!context_context.getInstance(el)){_this.createModule(el);}});return context_context;},createModule:function createModule(el){var tName=zepto(el).attr(SID);var Module=context_context.getProto(tName);var modObj=null;if(typeof Module==='undefined'){console.warn('Module ['+tName+'] is not regiested.');return null;}el['__src']='dom';modObj=new Module(el);delete el['__src'];return modObj;}};/* harmony default export */ var module_factory = (moduleFactory);
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/circle.js
var lifeCircle={init:function init(cb){console.log('init');},ready:function ready(cb){$(function(){// 扫描绑定组件对象与 DOM 元素
var context=module_factory.init();typeof cb==='function'&&cb(context);});},destroy:function destroy(){console.log('destroy');}};/* harmony default export */ var circle = (lifeCircle);
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/utils.js
var utils__createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var utils__typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};function utils__classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}/**
 * 返回指定精度整型随机数
 * @param  {Number} min 左边距
 * @param  {Number} max 右边距
 * @return {Number}   指定范围随机数
 * random(1, 3)  // 1 | 2 | 3
 */function random(){var min=arguments.length>0&&arguments[0]!==undefined?arguments[0]:0;var max=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;return Math.floor(Math.random()*(max-min+1)+min);}/**
 * 原生选择器
 * @return {Element} 匹配元素列表
 * e.g.
 * q('.name')  // Element
 * q('.name', '.profile')  // Element
 */function q(){return document.querySelectorAll.apply(document,arguments);}/**
 * 获取url参数
 * @param  {String} name 参数名
 * @return {String}      参数值
 * e.g.
 * // http://www.vv314.com?type=1&id=1
 * getUrlParam('id')  // 1
 * getUrlParam('name')  // null
 */function getUrlParam(name){var reg=new RegExp('(^|&)'+name+'=([^&]*)(&|$)');var value=window.location.search.substr(1).match(reg);return value===null?null:decodeURI(value[2]);}/**
 * 判断是否为微信浏览器
 * @return {Boolean}
 */function isWechat(){var ua=navigator.userAgent.toLowerCase();return ua.match(/MicroMessenger/i)==='micromessenger';}/**
 * 字符串超出截取，以省略号结尾
 * @param  {String} str    待截取字符串
 * @param  {Number} maxlength 长度
 * @return {String}        截取结果
 * e.g.
 * limitStr('abcdefg', 4) // abcd...
 */function limitStr(str,maxlength){return str.length>maxlength?str.substr(0,maxlength)+'...':str;}/**
 * 设置/获取 localStorage
 * 当 value 缺省时为获取数据, value 为对象时,执行序列化
 * @param  {String} name  数据名
 * @param  {String} [value] 数据项
 * e.g.
 * storage('goodid')  // 获取 goodid
 * storage('profile', {name: fish, gender: 1})  // 存储 profile
 */function storage(name,value){var data='';if(arguments.length===1){data=localStorage.getItem(name);try{return JSON.parse(data);}catch(e){return data;}}else{localStorage.setItem(name,(typeof value==='undefined'?'undefined':utils__typeof(value))==='object'?JSON.stringify(value):value);}}/**
 * 判断字符串、数组、对象内容是否为空
 * @param  {String | Obejct}  obj  数据源
 * @return {Boolean}  判断结果
 * e.g.
 * isEmpty('')  // true
 * isEmpty([])  // true
 * isEmpty({})  // true
 * isEmpty({name: 'fish'})  // false
 */function isEmpty(obj){switch(typeof obj==='undefined'?'undefined':utils__typeof(obj)){case'undefined':return true;case'string':return!obj.length;case'object':return obj===null||!Object.keys(obj).length;}}/**
 * 判断是否为数字或数字字符串
 * @param  {Number | String} 数据
 * @return {Boolean}       判断结果
 * e.g.
 * likeNumber(5)  // true
 * likeNumber('8')  // true
 * likeNumber('2a')  // false
 */function likeNumber(value){return!isNaN(Number(value));}/**
 * 邮箱格式验证
 * @param  {String} email  email地址
 * @return {Boolean}  验证结果
 * e.g.
 * vaildEmail('vv314@foxmail.com')  // true
 */function testEmail(email){var emailRegex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return emailRegex.test(email);}/**
 * 检查 cookie 是否可用
 * @return {Boolean} true: 支持  false: 不支持
 */function checkCookie(){// 现代浏览器已支持 cookieEnabled
return!!window.navigator.cookieEnabled;}/**
 * 获取 Cookie
 * @param  {String} name  cookie名称
 * @return {String}
 * e.g.
 * // cookie: name=fish
 * getCookie('name')  // fish
 * getCookie('age')  // ''
 */function getCookie(name){var reg=new RegExp(name+'=(.*?)($|;)');var value=reg.exec(document.cookie);return value===null?'':decodeURI(value[1]);}/**
 * 设置 Cookie
 * @param {String} name   cookie 名
 * @param {String} value  cookie 值
 * @param {Number} days   有效时间
 * @param {String} domain 域名
 */function setCookie(name,value){var days=arguments.length>2&&arguments[2]!==undefined?arguments[2]:15;var domain=arguments[3];var exp=new Date();var domainStr=domain?'domain='+domain:'';exp.setDate(exp.getDate()+days);// 调用 encodeURI 对中文及特殊符号编码
document.cookie=name+'='+encodeURI(value)+';expires='+exp+';path=/;'+domainStr;}/**
 * 删除 Cookie
 * @param {String} name  cookie 名称
 * @param {String} domain  域名
 */function delCookie(name,domain){setCookie(name,'',-1,domain);}/**
 * 格式化时间
 * @param  {Date} dateObj Date 对象或时间戳
 * @return {Object}
 */function parseDate(dateObj){var f=function f(n){return n>9?n:'0'+n;};var date=dateObj instanceof Date?dateObj:new Date(dateObj);return{y:date.getFullYear(),M:f(date.getMonth()+1),d:f(date.getDate()),h:f(date.getHours()),m:f(date.getMinutes()),s:f(date.getSeconds())};}/**
 * 节流函数
 * @param  {Function} method 函数
 * @param  {Number} delay   间隔时间
 * @return {Function}        新函数
 */function throttle(method,delay){var timer=null;return function(){var _this=this;var args=arguments;clearTimeout(timer);timer=setTimeout(function(){method.apply(_this,args);},delay);};}/**
 * 显示时钟
 * @param  {Function} cb         回调函数
 * @param  {Number}   freshTime 刷新时间，毫秒
 * @return {Object}             由 parseDate 返回的时间对象
 */function realTime(cb,freshTime){cb(parseDate(new Date()));return setInterval(function(){cb(parseDate(new Date()));},freshTime||1000);}/**
 * 格式化评论数
 * @param  {Number} num [description]
 * @return {String}     [description]
 *
 * e.g
 * reformNum(10000)  // 1万
 */function reformNum(){var num=arguments.length>0&&arguments[0]!==undefined?arguments[0]:0;var result=num;if(!num)return 0;if(num>=1000000){result=Math.floor(num/10000)+'万';}else if(num>=10000){result=Number((num/10000).toFixed(1))+'万';}return result;}function LoadProto(){function load(src,callback){load.js(src,callback);}load.js=function(src,callback){var id=getIdBySrc(src);var el=document.getElementById(id);if(el){callback();}else{el=document.createElement('script');el.id=id;el.src=src;el.addEventListener('load',function(event){callback(null,event);});el.addEventListener('error',callback);document.body.appendChild(el);}return el;};load.series=function(urls,callback){var url=urls.shift();if(url){load(url,function(error){error?callback(error):load.series(urls,callback);});}else{callback();}};load.parallel=function(urls,callback){var i=urls.length;var done=void 0;var func=function func(error){--i;if(!i&&!done||error){done=true;callback(error);}};urls.forEach(function(url){return load(url,func);});};function getIdBySrc(src){var isStr=typeof src==='string';var num=void 0,sub=void 0;if(!isStr)return;if(~src.indexOf(':')){src+='-join';}num=src.lastIndexOf('/')+1;sub=src.substr(src,num);return src.replace(sub,'').replace(/\./g,'-');}return load;}// 加载单个脚本
// load('https://sina.cn/a.js', callback)
//
// 串行加载脚本
// load.series(['https://sina.cn/a.js', 'https://sina.cn/b.js'], callback)
//
// 并行加载脚本
// load.parallel(['https://sina.cn/a.js', 'https://sina.cn/b.js'], callback)
var load=new LoadProto();/**
 * 检测手势方向
 *
 * e.g
 * var touch = new Touch()
 *
 * touch.listen('#app', function(direction) {
 *   console.log(direction)
 * })
 */var Touch=function(){function Touch(){var threshold=arguments.length>0&&arguments[0]!==undefined?arguments[0]:20;utils__classCallCheck(this,Touch);this.isMobile='ontouchstart'in window;this.threshold=threshold;}utils__createClass(Touch,[{key:'_getAngle',value:function _getAngle(x,y){return Math.atan2(y,x)*180/Math.PI;}},{key:'start',value:function start(e){this.startX=this.isMobile?e.touches[0].pageX:e.x;this.startY=this.isMobile?e.touches[0].pageY:e.y;}},{key:'end',value:function end(e){this.endX=this.isMobile?e.changedTouches[0].pageX:e.x;this.endY=this.isMobile?e.changedTouches[0].pageY:e.y;return this._getDirection();}},{key:'_getDirection',value:function _getDirection(){var angX=this.endX-this.startX;var angY=this.endY-this.startY;var result='none';// 如果滑动距离太短
if(Math.abs(angX)<this.threshold&&Math.abs(angY)<this.threshold)return result;var angle=this._getAngle(angX,angY);if(angle>=-135&&angle<=-45){result='up';}else if(angle>45&&angle<135){result='down';}else if(angle>=135&&angle<=180||angle>=-180&&angle<-135){result='left';}else if(angle>=-45&&angle<=45){result='right';}return result;}},{key:'listen',value:function listen(selector,handle){var _this2=this;var touchEventsDesktop={start:'mousedown',end:'mouseup'};if(window.navigator.pointerEnabled){touchEventsDesktop={start:'pointerdown',end:'pointerup'};}else if(window.navigator.msPointerEnabled){touchEventsDesktop={start:'MSPointerDown',end:'MSPointerUp'};}var touchEvent={start:this.isMobile?'touchstart':touchEventsDesktop.start,end:this.isMobile?'touchend':touchEventsDesktop.end};$(selector).on(touchEvent.start,this.start.bind(this));$(selector).on(touchEvent.end,function(e){return handle(_this2.end(e));});}}]);return Touch;}();
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/extra.js
var erudaUrl='//mjs.sinaimg.cn/wap/online/others/eruda/eruda.min.js';var mdebugUrl='//mjs.sinaimg.cn/wap/online/public/mdebug/201706161130/js/index.min.js';var fireMap={_devtools:devtools,_mlog:mlog};function devtools(debugMode){if(debugMode){load(erudaUrl,function(){window.eruda&&window.eruda.init();console.log('[base-utils] eruda ready');});}}function mlog(debugMode){if(debugMode){load(mdebugUrl,function(){console.log('[base-utils] mlog ready');});}}function extra_init(){Object.keys(fireMap).forEach(function(key){return fireMap[key](getUrlParam(key));});}/* harmony default export */ var extra = ({load:extra_init,devtools:devtools,mlog:mlog});
// CONCATENATED MODULE: ./node_modules/@mfelibs/base-utils/src/index.js
function src_init(){// 挂载全局命名空间，暴露 Circle.ready 函数与事件模块，
// SINA_NEWS.event 模块阉割 showEvents 方法
window.SINA_NEWS=window.SINA_NEWS||{ready:circle.ready,event:event_event};extra.load();}src_init();
// CONCATENATED MODULE: ./src/view/home/tools.js
var tools__createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function tools__classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var tools_statusTools=function(){function statusTools(){tools__classCallCheck(this,statusTools);this.wrapper=null;this.allItems={};this.init();}tools__createClass(statusTools,[{key:'init',value:function init(){var wrapper=zepto('#j_status_tools');if(!wrapper.length){this.wrapper=zepto('<div id="j_status_tools" style="position:absolute; top:0; right:0; max-height:200px;height:50px; width:200px; background:rgba(45, 67, 72, 0.8);padding: 0 5px;;"></div>');zepto(document.body).append(this.wrapper);}else{this.wrapper=wrapper;}}},{key:'addItem',value:function addItem(id,msg){var selector='j_status_p___'+id;if(!zepto('#'+selector).length){var item=zepto('<p id="j_status_p___'+id+'" style="color:#0cd8d4;font-size: 13px;">'+id+': <span class="j_'+id+'"></span></p>');this.wrapper.append(item);this.allItems.id=item;if(msg!=null){this.allItems.id.find('.j_'+id).text(msg);}}else{this.updateItem(id,msg);}}},{key:'updateItem',value:function updateItem(id,msg){if(this.allItems.id&&msg){this.allItems.id.find('.j_'+id).text(msg);}}}]);return statusTools;}();/* harmony default export */ var tools = (tools_statusTools);
// CONCATENATED MODULE: ./src/view/home/infinite-scroll2.js
/**
 * 测试方法
 */var statusPanel=new tools();/**
 * 测试方法
 */// Number of items to instantiate beyond current view in the scroll direction.
var RUNWAY_ITEMS=10;// Number of items to instantiate beyond current view in the opposite direction.
var RUNWAY_ITEMS_OPPOSITE=10;// The number of pixels of additional length to allow scrolling to.
var SCROLL_RUNWAY=2000;// The animation interval (in ms) for fading in content from tombstones.
var ANIMATION_DURATION_MS=200;var InfiniteScrollerSource=function InfiniteScrollerSource(){};InfiniteScrollerSource.prototype={/**
   * Fetch more items from the data source. This should try to fetch at least
   * count items but may fetch more as desired. Subsequent calls to fetch should
   * fetch items following the last successful fetch.
   * @param {number} count The minimum number of items to fetch for display.
   * @return {Promise(Array<Object>)} Returns a promise which will be resolved
   *     with an array of items.
   */fetch:function fetch(count){},/**
   * Create a tombstone element. All tombstone elements should be identical
   * @return {Element} A tombstone element to be displayed when item data is not
   *     yet available for the scrolled position.
   */createTombstone:function createTombstone(){},/**
   * Render an item, re-using the provided item div if passed in.
   * @param {Object} item The item description from the array returned by fetch.
   * @param {?Element} element If provided, this is a previously displayed
   *     element which should be recycled for the new item to display.
   * @return {Element} The constructed element to be displayed in the scroller.
   */render:function render(item,div){}};/**
 * Construct an infinite scroller.
 * @param {Element} scroller The scrollable element to use as the infinite
 *     scroll region.
 * @param {InfiniteScrollerSource} source A provider of the content to be
 *     displayed in the infinite scroll region.
 */var InfiniteScroller=function InfiniteScroller(scroller,source){this.anchorItem={index:0,offset:0};this.firstAttachedItem_=0;this.lastAttachedItem_=0;this.anchorScrollTop=0;this.tombstoneSize_=0;this.tombstoneWidth_=0;this.tombstones_=[];this.scroller_=scroller;this.source_=source;this.items_=[];this.loadedItems_=0;this.requestInProgress_=false;this.scroller_.addEventListener('scroll',this.onScroll_.bind(this));window.addEventListener('resize',this.onResize_.bind(this));// Create an element to force the scroller to allow scrolling to a certain
// point.
this.scrollRunway_=document.createElement('div');// Internet explorer seems to require some text in this div in order to
// ensure that it can be scrolled to.
this.scrollRunway_.textContent=' ';this.scrollRunwayEnd_=0;this.scrollRunway_.style.position='absolute';this.scrollRunway_.style.height='1px';this.scrollRunway_.style.width='1px';this.scrollRunway_.style.transition='transform 0.2s';this.scroller_.appendChild(this.scrollRunway_);this.onResize_();};InfiniteScroller.prototype={/**
   * Called when the browser window resizes to adapt to new scroller bounds and
   * layout sizes of items within the scroller.
   */onResize_:function onResize_(){// TODO: If we already have tombstones attached to the document, it would
// probably be more efficient to use one of them rather than create a new
// one to measure.
var tombstone=this.source_.createTombstone();tombstone.style.position='absolute';this.scroller_.appendChild(tombstone);tombstone.classList.remove('invisible');this.tombstoneSize_=tombstone.offsetHeight;this.tombstoneWidth_=tombstone.offsetWidth;this.scroller_.removeChild(tombstone);// Reset the cached size of items in the scroller as they may no longer be
// correct after the item content undergoes layout.
for(var i=0;i<this.items_.length;i++){this.items_[i].height=this.items_[i].width=0;}this.onScroll_();},/**
   * Called when the scroller scrolls. This determines the newly anchored item
   * and offset and then updates the visible elements, requesting more items
   * from the source if we've scrolled past the end of the currently available
   * content.
   */onScroll_:function onScroll_(){var delta=this.scroller_.scrollTop-this.anchorScrollTop;// Special case, if we get to very top, always scroll to top.
if(this.scroller_.scrollTop==0){this.anchorItem={index:0,offset:0};}else{this.anchorItem=this.calculateAnchoredItem(this.anchorItem,delta);}this.anchorScrollTop=this.scroller_.scrollTop;var lastScreenItem=this.calculateAnchoredItem(this.anchorItem,this.scroller_.offsetHeight);// console.log(this.anchorItem, lastScreenItem, this.anchorItem.index - RUNWAY_ITEMS_OPPOSITE, lastScreenItem.index + RUNWAY_ITEMS);
this.showCB(this.anchorItem.index,lastScreenItem.index);statusPanel.addItem('First_of_this_page',this.anchorItem.index);if(delta<0)// 向上滚动 ⬆︎
this.fill(this.anchorItem.index-RUNWAY_ITEMS,lastScreenItem.index+RUNWAY_ITEMS_OPPOSITE);else// 初始化 或者向下滚动(向底部) ⬇︎
this.fill(this.anchorItem.index-RUNWAY_ITEMS_OPPOSITE,lastScreenItem.index+RUNWAY_ITEMS);},/**
   * Calculates the item that should be anchored after scrolling by delta from
   * the initial anchored item.
   * @param {{index: number, offset: number}} initialAnchor The initial position
   *     to scroll from before calculating the new anchor position.
   * @param {number} delta The offset from the initial item to scroll by.
   * @return {{index: number, offset: number}} Returns the new item and offset
   *     scroll should be anchored to.
   */calculateAnchoredItem:function calculateAnchoredItem(initialAnchor,delta){if(delta==0)return initialAnchor;delta+=initialAnchor.offset;var i=initialAnchor.index;var tombstones=0;if(delta<0){while(delta<0&&i>0&&this.items_[i-1].height){delta+=this.items_[i-1].height;i--;}tombstones=Math.max(-i,Math.ceil(Math.min(delta,0)/this.tombstoneSize_));}else{while(delta>0&&i<this.items_.length&&this.items_[i].height&&this.items_[i].height<delta){delta-=this.items_[i].height;i++;}if(i>=this.items_.length||!this.items_[i].height)tombstones=Math.floor(Math.max(delta,0)/this.tombstoneSize_);}i+=tombstones;delta-=tombstones*this.tombstoneSize_;return{index:i,offset:delta};},/**
   * Sets the range of items which should be attached and attaches those items.
   * @param {number} start The first item which should be attached.
   * @param {number} end One past the last item which should be attached.
   */fill:function fill(start,end){this.firstAttachedItem_=Math.max(0,start);this.lastAttachedItem_=end;this.attachContent();},/**
   * 可视后回调
   */showCB:function showCB(start,end){for(var i=start;i<end;i++){if(this.items_[i]&&this.items_[i].data){if(typeof this.items_[i].data.fn==='function'&&!this.items_[i].data.isFnTriggered){this.items_[i].data.fn();this.items_[i].data.isFnTriggered=1;}}}},/**
   * Creates or returns an existing tombstone ready to be reused.
   * @return {Element} A tombstone element ready to be used.
   */getTombstone:function getTombstone(){var tombstone=this.tombstones_.pop();if(tombstone){tombstone.classList.remove('invisible');tombstone.style.opacity=1;tombstone.style.transform='';tombstone.style.transition='';return tombstone;}return this.source_.createTombstone();},/**
   * Attaches content to the scroller and updates the scroll position if
   * necessary.
   */attachContent:function attachContent(){// Collect nodes which will no longer be rendered for reuse.
// TODO: Limit this based on the change in visible items rather than looping
// over all items.
var i;// var unusedNodes = [];
var unusedNodesObj={};// console.log(this.firstAttachedItem_,this.lastAttachedItem_,this.items_.length);
for(i=0;i<this.items_.length;i++){// Skip the items which should be visible.
if(i==this.firstAttachedItem_){i=this.lasg289tAttachedItem_-1;continue;}// console.log(this.items_[i])
if(this.items_[i].node){if(this.items_[i].node.classList.contains('tombstone')){// console.log('tombstone',i,this.items_[i].node);
this.tombstones_.push(this.items_[i].node);this.tombstones_[this.tombstones_.length-1].classList.add('invisible');}else{// unusedNodes.push(this.items_[i].node);
// add 根据模板类型回收
var moduleType=this.items_[i].data.randomModule;if(Object.prototype.toString.call(unusedNodesObj[moduleType])==='[object Array]'){unusedNodesObj[moduleType].push(this.items_[i].node);}else{unusedNodesObj[moduleType]=[this.items_[i].node];}}}this.items_[i].node=null;}var tombstoneAnimations={};// Create DOM nodes.
for(i=this.firstAttachedItem_;i<this.lastAttachedItem_;i++){while(this.items_.length<=i){this.addItem_();}if(this.items_[i].node){// if it's a tombstone but we have data, replace it.
if(this.items_[i].node.classList.contains('tombstone')&&this.items_[i].data){// TODO: Probably best to move items on top of tombstones and fade them in instead.
if(ANIMATION_DURATION_MS){this.items_[i].node.style.zIndex=1;tombstoneAnimations[i]=[this.items_[i].node,this.items_[i].top-this.anchorScrollTop];}else{this.items_[i].node.classList.add('invisible');this.tombstones_.push(this.items_[i].node);}this.items_[i].node=null;}else{continue;}}// var node = this.items_[i].data ? this.source_.render(this.items_[i].data, unusedNodes.pop()) : this.getTombstone();
var dom=null;var templateType=this.items_[i].data&&this.items_[i].data.randomModule;if(unusedNodesObj[templateType]&&unusedNodesObj[templateType].length){console.log('可复用');dom=unusedNodesObj[templateType].pop();}var node=this.items_[i].data?this.source_.render(this.items_[i].data,dom):this.getTombstone();// Maybe don't do this if it's already attached?
node.style.position='absolute';this.items_[i].top=-1;this.scroller_.appendChild(node);this.items_[i].node=node;}// debugger
// Remove all unused nodes
// console.log(unusedNodes);
// while (unusedNodes.length) {
//   this.scroller_.removeChild(unusedNodes.pop());
// }
for(var i in unusedNodesObj){while(unusedNodesObj[i].length){this.scroller_.removeChild(unusedNodesObj[i].pop());}}unusedNodesObj=null;// Get the height of all nodes which haven't been measured yet.
for(i=this.firstAttachedItem_;i<this.lastAttachedItem_;i++){// Only cache the height if we have the real contents, not a placeholder.
if(this.items_[i].data&&!this.items_[i].height){this.items_[i].height=this.items_[i].node.offsetHeight;this.items_[i].width=this.items_[i].node.offsetWidth;}}// Fix scroll position in case we have realized the heights of elements
// that we didn't used to know.
// TODO: We should only need to do this when a height of an item becomes
// known above.
this.anchorScrollTop=0;for(i=0;i<this.anchorItem.index;i++){this.anchorScrollTop+=this.items_[i].height||this.tombstoneSize_;}this.anchorScrollTop+=this.anchorItem.offset;// Position all nodes.
var curPos=this.anchorScrollTop-this.anchorItem.offset;i=this.anchorItem.index;while(i>this.firstAttachedItem_){curPos-=this.items_[i-1].height||this.tombstoneSize_;i--;}while(i<this.firstAttachedItem_){curPos+=this.items_[i].height||this.tombstoneSize_;i++;}// Set up initial positions for animations.
for(var i in tombstoneAnimations){var anim=tombstoneAnimations[i];this.items_[i].node.style.transform='translateY('+(this.anchorScrollTop+anim[1])+'px) scale('+this.tombstoneWidth_/this.items_[i].width+', '+this.tombstoneSize_/this.items_[i].height+')';// Call offsetTop on the nodes to be animated to force them to apply current transforms.
this.items_[i].node.offsetTop;anim[0].offsetTop;this.items_[i].node.style.transition='transform '+ANIMATION_DURATION_MS+'ms';}for(i=this.firstAttachedItem_;i<this.lastAttachedItem_;i++){var anim=tombstoneAnimations[i];if(anim){anim[0].style.transition='transform '+ANIMATION_DURATION_MS+'ms, opacity '+ANIMATION_DURATION_MS+'ms';anim[0].style.transform='translateY('+curPos+'px) scale('+this.items_[i].width/this.tombstoneWidth_+', '+this.items_[i].height/this.tombstoneSize_+')';anim[0].style.opacity=0;}if(curPos!=this.items_[i].top){if(!anim)this.items_[i].node.style.transition='';this.items_[i].node.style.transform='translateY('+curPos+'px)';}this.items_[i].top=curPos;curPos+=this.items_[i].height||this.tombstoneSize_;}this.scrollRunwayEnd_=Math.max(this.scrollRunwayEnd_,curPos+SCROLL_RUNWAY);this.scrollRunway_.style.transform='translate(0, '+this.scrollRunwayEnd_+'px)';this.scroller_.scrollTop=this.anchorScrollTop;if(ANIMATION_DURATION_MS){// TODO: Should probably use transition end, but there are a lot of animations we could be listening to.
setTimeout(function(){for(var i in tombstoneAnimations){var anim=tombstoneAnimations[i];anim[0].classList.add('invisible');this.tombstones_.push(anim[0]);// Tombstone can be recycled now.
}}.bind(this),ANIMATION_DURATION_MS);}this.maybeRequestContent();},/**
   * Requests additional content if we don't have enough currently.
   */maybeRequestContent:function maybeRequestContent(){// Don't issue another request if one is already in progress as we don't
// know where to start the next request yet.
if(this.requestInProgress_)return;var itemsNeeded=this.lastAttachedItem_-this.loadedItems_;if(itemsNeeded<=0)return;this.requestInProgress_=true;this.source_.fetch(itemsNeeded).then(this.addContent.bind(this));},/**
   * Adds an item to the items list.
   */addItem_:function addItem_(){this.items_.push({'data':null,'node':null,'height':0,'width':0,'top':0});},/**
   * Adds the given array of items to the items list and then calls
   * attachContent to update the displayed content.
   * @param {Array<Object>} items The array of items to be added to the infinite
   *     scroller list.
   */addContent:function addContent(items){this.requestInProgress_=false;for(var i=0;i<items.length;i++){if(this.items_.length<=this.loadedItems_)this.addItem_();this.items_[this.loadedItems_++].data=items[i];}this.attachContent();}};/* harmony default export */ var infinite_scroll2 = (InfiniteScroller);
// CONCATENATED MODULE: ./src/view/home/message.js
var defaultData=[{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyrcsrw5580875.d.html",id:"fyrcsrw5580875",title:"吴恩达：天下武功唯快不破，我的成功可以复制",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/pCXT-fyrcsrw5578386.jpg",intro:"去年夏天就被曝光的AI Fund，吴恩达愣是憋到如今才开口承认。",source:"量子位",authorID:"6105753431",cTime:1517472692,sourcepic:"https://tva3.sinaimg.cn/crop.0.0.200.200.50/006Fd7o3jw8fbw134ijknj305k05k3ye.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8220508.d.html",id:"fyreyvz8220508",title:"看不懂《恋与制作人》，是因为你没有少女心",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/RZu6-fyrcsrw5543327.jpg",intro:"少女心不是无知、幼稚、傻白甜，而是尝遍了世间冷暖，仍然愿意去相信一个美丽的梦境。",source:"触乐网",authorID:"3957040489",cTime:1517472260,sourcepic:"https://tva1.sinaimg.cn/crop.0.0.299.299.50/ebdba569jw1et5xb12eydj208c08c74n.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyrcsrw5504586.d.html",id:"fyrcsrw5504586",title:"砍单近半，iPhoneX为何开始不受欢迎了？",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/kw78-fyrcsrw5503259.jpg",intro:"从今天的智能手机市场来看，过去一年智能手机首次呈现负增长，但这并不是最坏的时刻。",source:"王新喜",authorID:"1888089111",cTime:1517471716,sourcepic:"https://tva2.sinaimg.cn/crop.53.0.586.586.50/7089f417jw8fbmicm71pmj20hs0hswex.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8199090.d.html",id:"fyreyvz8199090",title:"百头大战背后的信息流江湖",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/wEyE-fyrcsrw5259061.jpg",intro:"一个标题+三幅图片+精准内容，足够将碎片化的时间偷走。",source:"刘兴亮",authorID:"1455643221",cTime:1517468755,sourcepic:"https://z4.sinaimg.cn/auto/resize?img=http://tvax1.sinaimg.cn/crop.0.0.996.996.50/56c35a55ly8ffc5ly69j5j20ro0rowg1.jpg&size=328_218"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyrcsrw5176159.d.html",id:"fyrcsrw5176159",title:"程浩:互联网下半场三大关键词",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/uSka-fyrcsrw5164585.jpg",intro:"我认为人口和流量红利消失，是中国互联网上半场跟下半场的分水岭。",source:"程浩",authorID:"5676714248",cTime:1517467837,sourcepic:"https://tva3.sinaimg.cn/crop.73.5.1888.1888.50/006caUHejw8evlryuun8kj31kw1ii7wh.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8190245.d.html",id:"fyreyvz8190245",title:"SNH48前成员亲述：站队、抑郁、撕逼 因陪酒饭局退团",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/57yN-fyrcsrw5106599.jpg",intro:"她面向窗台，背对着我，我轻轻按下拍摄键。只是不知道，此刻她看到的远方，是否还残存着曾经耀眼的梦想。",source:"娱乐资本论",authorID:"5159017394",cTime:1517467117,sourcepic:"https://www.sinaimg.cn/dy/zl/author/yulezibenlun/idx/2014/0611/U6161P1T935D150F24102DT20140611091132.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyrcsrw4135418.d.html",id:"fyrcsrw4135418",title:"我为什么不看好众筹民宿",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/c6fY-fyrcsrw4133271.jpg",intro:"单从投资角度看，普通投资者投资民宿众筹项目，最看重的因素是——较高的收益率。而民宿项目收益率吸引潜在投资者的原因一般有两个：真实、旅游行业景气度。",source:"苏宁金融研究院",authorID:"3819351799",cTime:1517454570,sourcepic:"https://tva4.sinaimg.cn/crop.0.0.180.180.50/e3a6aef7jw8e934bjx75lj20500500so.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8117622.d.html",id:"fyreyvz8117622",title:"#创事记年度作者#榜单公布",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/LvkS-fyrcsrw3861644.jpg",intro:"新闻事件如同水面上的浮冰，伴随着时间的流逝，轰然向前。但我们相信，记录与评论的意义不会随着事件的平息而消逝。",source:"创事记",authorID:"2907917243",cTime:1517451938,sourcepic:"https://z4.sinaimg.cn/auto/resize?img=http://tvax1.sinaimg.cn/crop.17.0.345.345.50/ad534bbbly1fhicpq3no8g20ak09lt9o.gif&size=328_218"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8108476.d.html",id:"fyreyvz8108476",title:"古天乐的“贪玩”直播，最后变成了300万人暗中观察",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/rkQY-fyrcsrw3749951.jpg",intro:"然而，这场直播却在观众的一片骂声中结束。",source:"ACGx",authorID:"5705024508",cTime:1517450344,sourcepic:"https://tva3.sinaimg.cn/crop.0.0.500.500.50/006e5Hukjw8eyde3ekpbvj30dw0dwmx7.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8090253.d.html",id:"fyreyvz8090253",title:"无人驾驶挺火，隔壁的机器蛇怎么样了？",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/EQUS-fyrcsrw3479059.jpg",intro:"说不定某一天，我们会在街上随处可见机器蛇来完成各种工作。到那时候，不知道怕蛇的孩子们会有什么感想……",source:"脑极体",authorID:"6336727143",cTime:1517446082,sourcepic:"https://tva4.sinaimg.cn/crop.0.0.180.180.50/e3a6aef7jw8e934bjx75lj20500500so.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyrcsrw3454014.d.html",id:"fyrcsrw3454014",title:"有多少中产已经陷入“中等收入陷阱”？",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180201/Zgxv-fyrcsrw3453228.jpg",intro:"之所以会有“中等收入陷阱”一说，最根本的原因在于人们的收入往往只能徘徊在中等水平却无法跨越，倘若能够突破收入瓶颈，成功跻身高收入行列，那一切压力也就不再是压力。",source:"苏宁金融研究院",authorID:"3819351799",cTime:1517445557,sourcepic:"https://tva4.sinaimg.cn/crop.0.0.180.180.50/e3a6aef7jw8e934bjx75lj20500500so.jpg"},{URL:"https://tech.sina.cn/csj/2018-02-01/doc-ifyreyvz8085491.d.html",id:"fyreyvz8085491",title:"新美大和滴滴，争的是一张千亿美元俱乐部门票",pic:"https://n.sinaimg.cn/tech/transform/w710h410/20180201/zxd4-fyrcsrw3411861.jpg",intro:"能否正确的认识扩张的意义及其边界，能否构建起自己的基本价值业务、并基于它获得主导性的用户入口地位，是拿到千亿美元市值俱乐部门票的关键。",source:"尹生",authorID:"1401101980",cTime:1517444621,sourcepic:"https://tva4.sinaimg.cn/crop.0.0.180.180.50/53831e9cjw1e8qgp5bmzyj2050050aa8.jpg"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyqyuhy7981810.d.html",id:"fyqyuhy7981810",title:"为什么是秋叶原成为了'秋叶原' 而不是其他区域？",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/UnMx-fyrcsrw1649090.jpg",intro:"秋叶原，一个正经的电器街，慢慢成长为了“妖艳贱货”般的宅圈。这背后究竟是道德的沦丧还是人性的扭曲呢？",source:"三文娱",authorID:"5893582170",cTime:1517388416,sourcepic:"https://tva3.sinaimg.cn/crop.0.0.494.494.50/006qQRWWjw8f313a18xzqj30dq0dq3yt.jpg"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyqyuhy7966585.d.html",id:"fyqyuhy7966585",title:"艾诚专访盛希泰：如何从投行少帅到创投泰哥？",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/22ff-fyrcsrw1433083.jpg",intro:"一个洪哥，一个泰哥，洪泰帮就此而生。",source:"艾诚",authorID:"1650493074",cTime:1517385221,sourcepic:"https://www.sinaimg.cn/cj/zl/management/idx/2014/0714/U10563P31T879D614F27039DT20140714104858.jpg"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyrcsrw1188298.d.html",id:"fyrcsrw1188298",title:"“BAT”之后，互联网创业现在也要站“TMD”的队了？",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/t_fw-fyrcsrw1187258.jpg",intro:"左右创业者命运的，除了BAT，现在TMD的影响似乎也正越来越重。",source:"歪道道",authorID:"2152848143",cTime:1517382486,sourcepic:"https://z0.sinaimg.cn/auto/resize?img=http://tvax4.sinaimg.cn/crop.0.25.1242.1242.50/8051db0fly8fne8gkcsjyj20yi0zxwl2.jpg&size=328_218"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyrcsrw1108827.d.html",id:"fyrcsrw1108827",title:"一文读懂印度互联网教育市场：存在4大结构性投资机会",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/oGEy-fyrcsrw1062837.jpg",intro:"从互联网教育背后的传统系统和非系统教育入手，探索中印教育行业各细分市场的发展现状与竞争格局，呈现印度互联网教育产业的整体发展图景，结合对比中印头部公司市值探讨印度互联网教育的投资价值与潜在投资标的。",source:"竺道",authorID:"6115605858",cTime:1517381716,sourcepic:"https://tva4.sinaimg.cn/crop.0.18.556.556.50/006FSssajw8fbw25j20o1j30go0gojrv.jpg"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyrcsrv9829123.d.html",id:"fyrcsrv9829123",title:"在CDN市场，腾讯、阿里与网宿终将“握手言和”",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/x7EU-fyrcsrv9826487.jpg",intro:"不逐利的资本不是好资本，不势利的券商不是好券商。",source:"波波夫",authorID:"1642254797",cTime:1517365795,sourcepic:"https://www.sinaimg.cn/zhuanlan/author/bobofu/idx/2016/1228/U12164P1493T24D2220F364DT20161228131250.jpg"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyrcsrv9623039.d.html",id:"fyrcsrv9623039",title:"迄今最全网络效应模型研究，一文看清顶级公司边界",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/vkEZ-fyrcsrv9620748.jpg",intro:"在互联网世界，连接是酶。因为连接产生聚集、产生规模、产生网络效应。",source:"红杉汇内参",authorID:"6013890910",cTime:1517363639,sourcepic:"https://z0.sinaimg.cn/auto/resize?img=http://tvax3.sinaimg.cn/default/images/default_avatar_female_50.gif&size=328_218"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyqyuhy7853977.d.html",id:"fyqyuhy7853977",title:"因为暴雪删了术士的生命虹吸，19岁少年创立了以太坊",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/jiYE-fyrcsrv9548751.jpg",intro:"今天是以太坊创始人维塔利克·布特林的24岁生日，转发此文章到朋友圈，你的微信钱包就会多出1枚价值7000多人民币的以太币。我已经试过了，是骗人的。",source:"游研社",authorID:"2634877355",cTime:1517362787,sourcepic:"https://tva4.sinaimg.cn/crop.112.0.266.266.50/9d0d09abjw8f48r8h0plhj20dw0dwgmg.jpg"},{URL:"https://tech.sina.cn/csj/2018-01-31/doc-ifyrcsrv9411757.d.html",id:"fyrcsrv9411757",title:"王健林的“好人缘”与腾讯的“收税权”",pic:"https://n.sinaimg.cn/tech/transform/w710h310/20180131/9SqW-fyrcsrv9410979.jpg",intro:"腾讯行的是收税之实，名义上却是个社交和游戏企业，所谓社交和游戏，是用来掩盖其收税的本质。",source:"悦涛",authorID:"1437874361",cTime:1517360134,sourcepic:"https://tva2.sinaimg.cn/crop.0.0.200.200.50/55b438b9jw8ezitkkacgvj205k05kmxh.jpg"}];/* harmony default export */ var message = (defaultData);
// EXTERNAL MODULE: ./src/css/index.css
var css = __webpack_require__(5);
var css_default = /*#__PURE__*/__webpack_require__.n(css);

// CONCATENATED MODULE: ./src/view/home/stats.js
/**
 * @author mrdoob / http://mrdoob.com/
 */var Stats=function Stats(){var mode=0;var container=document.createElement('div');container.style.cssText='position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';container.addEventListener('click',function(event){event.preventDefault();showPanel(++mode%container.children.length);},false);//
function addPanel(panel){container.appendChild(panel.dom);return panel;}function showPanel(id){for(var i=0;i<container.children.length;i++){container.children[i].style.display=i===id?'block':'none';}mode=id;}//
var beginTime=(performance||Date).now(),prevTime=beginTime,frames=0;var fpsPanel=addPanel(new Stats.Panel('FPS','#0ff','#002'));var msPanel=addPanel(new Stats.Panel('MS','#0f0','#020'));if(self.performance&&self.performance.memory){var memPanel=addPanel(new Stats.Panel('MB','#f08','#201'));}showPanel(0);return{REVISION:16,dom:container,addPanel:addPanel,showPanel:showPanel,begin:function begin(){beginTime=(performance||Date).now();},end:function end(){frames++;var time=(performance||Date).now();msPanel.update(time-beginTime,200);if(time>=prevTime+1000){fpsPanel.update(frames*1000/(time-prevTime),100);prevTime=time;frames=0;if(memPanel){var memory=performance.memory;memPanel.update(memory.usedJSHeapSize/1048576,memory.jsHeapSizeLimit/1048576);}}return time;},update:function update(){beginTime=this.end();},// Backwards Compatibility
domElement:container,setMode:showPanel};};Stats.Panel=function(name,fg,bg){var min=Infinity,max=0,round=Math.round;var PR=round(window.devicePixelRatio||1);var WIDTH=80*PR,HEIGHT=48*PR,TEXT_X=3*PR,TEXT_Y=2*PR,GRAPH_X=3*PR,GRAPH_Y=15*PR,GRAPH_WIDTH=74*PR,GRAPH_HEIGHT=30*PR;var canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;canvas.style.cssText='width:80px;height:48px';var context=canvas.getContext('2d');context.font='bold '+9*PR+'px Helvetica,Arial,sans-serif';context.textBaseline='top';context.fillStyle=bg;context.fillRect(0,0,WIDTH,HEIGHT);context.fillStyle=fg;context.fillText(name,TEXT_X,TEXT_Y);context.fillRect(GRAPH_X,GRAPH_Y,GRAPH_WIDTH,GRAPH_HEIGHT);context.fillStyle=bg;context.globalAlpha=0.9;context.fillRect(GRAPH_X,GRAPH_Y,GRAPH_WIDTH,GRAPH_HEIGHT);return{dom:canvas,update:function update(value,maxValue){min=Math.min(min,value);max=Math.max(max,value);context.fillStyle=bg;context.globalAlpha=1;context.fillRect(0,0,WIDTH,GRAPH_Y);context.fillStyle=fg;context.fillText(round(value)+' '+name+' ('+round(min)+'-'+round(max)+')',TEXT_X,TEXT_Y);context.drawImage(canvas,GRAPH_X+PR,GRAPH_Y,GRAPH_WIDTH-PR,GRAPH_HEIGHT,GRAPH_X,GRAPH_Y,GRAPH_WIDTH-PR,GRAPH_HEIGHT);context.fillRect(GRAPH_X+GRAPH_WIDTH-PR,GRAPH_Y,PR,GRAPH_HEIGHT);context.fillStyle=bg;context.globalAlpha=0.9;context.fillRect(GRAPH_X+GRAPH_WIDTH-PR,GRAPH_Y,PR,round((1-value/maxValue)*GRAPH_HEIGHT));}};};
// CONCATENATED MODULE: ./src/view/home/index.js
var home_statusPanel=new tools();var totalNum=0;var INIT_TIME=new Date().getTime();var page=1;function ContentSource(){// Collect template nodes to be cloned when needed.
//   this.tombstone_ = document.querySelector(".j_tombstone");
//   this.messageTemplate_ = document.querySelector(".j_template");
this.tombstone_=document.querySelector(".j_tombstone");//   this.tombstone_ = document.querySelector("#templates > .chat-item.tombstone");
//   this.messageTemplate_ = document.querySelector("#templates > .chat-item:not(.tombstone)");
this.messageTemplate_=document.querySelector(".j_msg");this.messageTemplate2_=document.querySelector(".j_msg_2");this.nextItem_=0;this.noData=0;// 测试使用  避免多次请求空接口
}ContentSource.prototype={fetch:function fetch(count){// Fetch at least 30 or count more objects for display.
count=Math.max(30,count);var self=this;return new Promise(function(resolve,reject){if(!this.noData){zepto.ajax({url:'https://interface.sina.cn/tech/simple_column.d.json?native=0&col=51901',data:{'page':page,'size':20},dataType:'jsonp',success:function success(data,status){if(data.length==0){console.log(0);self.noData=1;var localFakeData=JSON.parse(JSON.stringify(message));localFakeData.forEach(function(item){item.id=item.id+(new Date()-0);item.title=parseInt(Math.random()*10)+', '+item.title;});data=localFakeData;}page=page+1;data.forEach(function(item){item.fn=function(){console.log(item.id);};// 构造虚假模板选择
var randomNum=Math.random();if(randomNum<0.3){item.randomModule='type1';}else if(randomNum<0.7){item.randomModule='type2';}else{item.randomModule='type3';}});totalNum=totalNum+data.length;home_statusPanel.addItem('Total_data_number',totalNum);resolve(data);}});}else{console.log(0);var localFakeData=JSON.parse(JSON.stringify(message));localFakeData.forEach(function(item){item.id=item.id+(new Date()-0);item.title=parseInt(Math.random()*10)+', '+item.title;item.fn=function(){console.log(item.id);};// 构造虚假模板选择
var randomNum=Math.random();if(randomNum<0.3){item.randomModule='type1';}else if(randomNum<0.7){item.randomModule='type2';}else{item.randomModule='type3';}});setTimeout(function(){totalNum=totalNum+localFakeData.length;home_statusPanel.addItem('Total_data_number',totalNum);resolve(localFakeData);},500);}}.bind(this));},createTombstone:function createTombstone(){return this.tombstone_.cloneNode(true);},render:function render(item,divObj){var templateType=item.randomModule;if(!divObj){if(templateType=="type1"){divObj=this.messageTemplate_.cloneNode(true);}else{divObj=this.messageTemplate2_.cloneNode(true);}}switch(templateType){case'type1':divObj=renderType1(item,divObj);break;case'type2':divObj=renderType2(item,divObj);break;case'type3':default:divObj=renderType2(item,divObj);}return divObj;}};function renderType1(item,div){div.dataset.id=item.id;item.pic&&(div.querySelector('.m_video_img_bg_img').src=item.pic);div.querySelector('.m_video_tit').textContent=item.title;return div;}function renderType2(item,div){div.dataset.id=item.id;item.pic&&(div.querySelector('.m_f_div > img').src=item.pic);div.querySelector('h2').textContent=item.title;div.querySelector('.m_f_con_add').textContent=item.source;div.querySelector('.m_f_con_com_n').textContent=Math.floor(100*Math.random());return div;}function numDomNodes(node){if(!node.children||node.children.length==0)return 0;var childrenCount=Array.from(node.children).map(numDomNodes);return node.children.length+childrenCount.reduce(function(p,c){return p+c;},0);}document.addEventListener('DOMContentLoaded',function(){window.scroller=new infinite_scroll2(document.querySelector('#chat-timeline'),new ContentSource());var stats=new Stats();var domPanel=new Stats.Panel('DOM Nodes','#0ff','#002');stats.addPanel(domPanel);stats.showPanel(3);zepto(domPanel.dom).show();// ios手机上不显示、临时处理
document.body.appendChild(stats.dom);var TIMEOUT=100;setTimeout(function timeoutFunc(){// Only update DOM node graph when we have time to spare to call
// numDomNodes(), which is a fairly expensive function.
window.requestIdleCallback?requestIdleCallback(function(){domPanel.update(numDomNodes(document.body),1500);setTimeout(timeoutFunc,TIMEOUT);}):setInterval(function(){domPanel.update(numDomNodes(document.body),1500);},500);},TIMEOUT);});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);