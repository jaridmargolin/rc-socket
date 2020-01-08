(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.RcSocket = {}));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap$1 = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap$1 === 'function' && /native code/.test(inspectSource(WeakMap$1));

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.0',
	  mode:  'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$2 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$2();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol() == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var userAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var v8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return v8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = v8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	_export({ target: 'Array', proto: true, forced: FORCED }, {
	  concat: function concat(arg) { // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var bindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = bindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else if (IS_EVERY) return false;  // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var sloppyArrayMethod = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !method || !fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $forEach = arrayIteration.forEach;


	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = sloppyArrayMethod('forEach') ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var iterators = {};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ( !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var defineProperty = objectDefineProperty.f;



	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var SPECIES$2 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	_export({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('slice') }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$2];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var DatePrototype = Date.prototype;
	var INVALID_DATE = 'Invalid Date';
	var TO_STRING = 'toString';
	var nativeDateToString = DatePrototype[TO_STRING];
	var getTime = DatePrototype.getTime;

	// `Date.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-date.prototype.tostring
	if (new Date(NaN) + '' != INVALID_DATE) {
	  redefine(DatePrototype, TO_STRING, function toString() {
	    var value = getTime.call(this);
	    // eslint-disable-next-line no-self-compare
	    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
	  });
	}

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	var defineProperty = objectDefineProperty.f;



	var METADATA = uid('meta');
	var id = 0;

	var isExtensible = Object.isExtensible || function () {
	  return true;
	};

	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + ++id, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMetadata(it);
	  // return object ID
	  } return it[METADATA].objectID;
	};

	var getWeakData = function (it, create) {
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMetadata(it);
	  // return the store of weak collections IDs
	  } return it[METADATA].weakData;
	};

	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	  return it;
	};

	var meta = module.exports = {
	  REQUIRED: false,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$2] === it);
	};

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG$1] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$3]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = bindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES
	          ? boundFunction(anObject(step = iterable[index])[0], step[1])
	          : boundFunction(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var ITERATOR$4 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$4] = function () {
	    return this;
	  };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$4] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    objectSetPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    typeof (NewTarget = dummy.constructor) == 'function' &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY,
	      KEY == 'add' ? function add(value) {
	        nativeMethod.call(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY == 'delete' ? function (key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'get' ? function get(key) {
	        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'has' ? function has(key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        nativeMethod.call(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };

	  // eslint-disable-next-line max-len
	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

	    // weak collections should not contains .clear method
	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({ global: true, forced: Constructor != NativeConstructor }, exported);

	  setToStringTag(Constructor, CONSTRUCTOR_NAME);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var SPECIES$3 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
	    defineProperty(Constructor, SPECIES$3, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var defineProperty$1 = objectDefineProperty.f;








	var fastKey = internalMetadata.fastKey;


	var setInternalState$1 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;

	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$1(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index;
	      // change existing entry
	      if (entry) {
	        entry.value = value;
	      // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;
	        else that.size++;
	        // add to index
	        if (index !== 'F') state.index[index] = entry;
	      } return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that);
	      // fast case
	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index];
	      // frozen object case
	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };

	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;
	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }
	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;
	        else that.size = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        var state = getInternalState(this);
	        var boundFunction = bindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          // revert to the last existing entry
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });

	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.1.3.6 Map.prototype.get(key)
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // 23.1.3.9 Map.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // 23.2.3.1 Set.prototype.add(value)
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$1(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$1(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last;
	      // revert to the last existing entry
	      while (entry && entry.removed) entry = entry.previous;
	      // get next entry
	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return { value: undefined, done: true };
	      }
	      // return step by kind
	      if (kind == 'keys') return { value: entry.key, done: false };
	      if (kind == 'values') return { value: entry.value, done: false };
	      return { value: [entry.key, entry.value], done: false };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	// `Map` constructor
	// https://tc39.github.io/ecma262/#sec-map-objects
	var es_map = collection('Map', function (init) {
	  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var nativeAssign = Object.assign;
	var defineProperty$2 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$2({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$2(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
	// so we use an intermediate function.
	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
		UNSUPPORTED_Y: UNSUPPORTED_Y,
		BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');
	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	var TO_STRING$1 = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING$1];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

	// `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING$1, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	// `Set` constructor
	// https://tc39.github.io/ecma262/#sec-set-objects
	var es_set = collection('Set', function (init) {
	  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$2 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$2 = internalState.set;
	var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$2(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$1(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var SPECIES$4 = wellKnownSymbol('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$4] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () { execCalled = true; return null; };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0)) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	        }
	        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	      }
	      return { done: false };
	    }, { REPLACE_KEEPS_$0: REPLACE_KEEPS_$0 });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];

	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return regexMethod.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return regexMethod.call(string, this); }
	    );
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var SPECIES$5 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$5]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var charAt$1 = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$1(S, index).length : 1);
	};

	// `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var arrayPush = [].push;
	var min$2 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

	// @@split logic
	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output.length > lim ? output.slice(0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);
	      var C = speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = min$2(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	}, !SUPPORTS_Y);

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	}

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  if (CollectionPrototype$1) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype$1[ITERATOR$5] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$5, ArrayValues);
	    } catch (error) {
	      CollectionPrototype$1[ITERATOR$5] = ArrayValues;
	    }
	    if (!CollectionPrototype$1[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$3, COLLECTION_NAME$1);
	    }
	    if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	function _typeof(obj) {
	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	function _superPropBase(object, property) {
	  while (!Object.prototype.hasOwnProperty.call(object, property)) {
	    object = _getPrototypeOf(object);
	    if (object === null) break;
	  }

	  return object;
	}

	function _get(target, property, receiver) {
	  if (typeof Reflect !== "undefined" && Reflect.get) {
	    _get = Reflect.get;
	  } else {
	    _get = function _get(target, property, receiver) {
	      var base = _superPropBase(target, property);

	      if (!base) return;
	      var desc = Object.getOwnPropertyDescriptor(base, property);

	      if (desc.get) {
	        return desc.get.call(receiver);
	      }

	      return desc.value;
	    };
	  }

	  return _get(target, property, receiver || target);
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(arr, i) {
	  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
	    return;
	  }

	  var _arr = [];
	  var _n = true;
	  var _d = false;
	  var _e = undefined;

	  try {
	    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	/**
	 * @author Toru Nagashima <https://github.com/mysticatea>
	 * @copyright 2015 Toru Nagashima. All rights reserved.
	 * See LICENSE file in root directory for full license.
	 */
	/**
	 * @typedef {object} PrivateData
	 * @property {EventTarget} eventTarget The event target.
	 * @property {{type:string}} event The original event object.
	 * @property {number} eventPhase The current event phase.
	 * @property {EventTarget|null} currentTarget The current event target.
	 * @property {boolean} canceled The flag to prevent default.
	 * @property {boolean} stopped The flag to stop propagation.
	 * @property {boolean} immediateStopped The flag to stop propagation immediately.
	 * @property {Function|null} passiveListener The listener if the current listener is passive. Otherwise this is null.
	 * @property {number} timeStamp The unix time.
	 * @private
	 */

	/**
	 * Private data for event wrappers.
	 * @type {WeakMap<Event, PrivateData>}
	 * @private
	 */
	const privateData = new WeakMap();

	/**
	 * Cache for wrapper classes.
	 * @type {WeakMap<Object, Function>}
	 * @private
	 */
	const wrappers = new WeakMap();

	/**
	 * Get private data.
	 * @param {Event} event The event object to get private data.
	 * @returns {PrivateData} The private data of the event.
	 * @private
	 */
	function pd(event) {
	    const retv = privateData.get(event);
	    console.assert(
	        retv != null,
	        "'this' is expected an Event object, but got",
	        event
	    );
	    return retv
	}

	/**
	 * https://dom.spec.whatwg.org/#set-the-canceled-flag
	 * @param data {PrivateData} private data.
	 */
	function setCancelFlag(data) {
	    if (data.passiveListener != null) {
	        if (
	            typeof console !== "undefined" &&
	            typeof console.error === "function"
	        ) {
	            console.error(
	                "Unable to preventDefault inside passive event listener invocation.",
	                data.passiveListener
	            );
	        }
	        return
	    }
	    if (!data.event.cancelable) {
	        return
	    }

	    data.canceled = true;
	    if (typeof data.event.preventDefault === "function") {
	        data.event.preventDefault();
	    }
	}

	/**
	 * @see https://dom.spec.whatwg.org/#interface-event
	 * @private
	 */
	/**
	 * The event wrapper.
	 * @constructor
	 * @param {EventTarget} eventTarget The event target of this dispatching.
	 * @param {Event|{type:string}} event The original event to wrap.
	 */
	function Event(eventTarget, event) {
	    privateData.set(this, {
	        eventTarget,
	        event,
	        eventPhase: 2,
	        currentTarget: eventTarget,
	        canceled: false,
	        stopped: false,
	        immediateStopped: false,
	        passiveListener: null,
	        timeStamp: event.timeStamp || Date.now(),
	    });

	    // https://heycam.github.io/webidl/#Unforgeable
	    Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });

	    // Define accessors
	    const keys = Object.keys(event);
	    for (let i = 0; i < keys.length; ++i) {
	        const key = keys[i];
	        if (!(key in this)) {
	            Object.defineProperty(this, key, defineRedirectDescriptor(key));
	        }
	    }
	}

	// Should be enumerable, but class methods are not enumerable.
	Event.prototype = {
	    /**
	     * The type of this event.
	     * @type {string}
	     */
	    get type() {
	        return pd(this).event.type
	    },

	    /**
	     * The target of this event.
	     * @type {EventTarget}
	     */
	    get target() {
	        return pd(this).eventTarget
	    },

	    /**
	     * The target of this event.
	     * @type {EventTarget}
	     */
	    get currentTarget() {
	        return pd(this).currentTarget
	    },

	    /**
	     * @returns {EventTarget[]} The composed path of this event.
	     */
	    composedPath() {
	        const currentTarget = pd(this).currentTarget;
	        if (currentTarget == null) {
	            return []
	        }
	        return [currentTarget]
	    },

	    /**
	     * Constant of NONE.
	     * @type {number}
	     */
	    get NONE() {
	        return 0
	    },

	    /**
	     * Constant of CAPTURING_PHASE.
	     * @type {number}
	     */
	    get CAPTURING_PHASE() {
	        return 1
	    },

	    /**
	     * Constant of AT_TARGET.
	     * @type {number}
	     */
	    get AT_TARGET() {
	        return 2
	    },

	    /**
	     * Constant of BUBBLING_PHASE.
	     * @type {number}
	     */
	    get BUBBLING_PHASE() {
	        return 3
	    },

	    /**
	     * The target of this event.
	     * @type {number}
	     */
	    get eventPhase() {
	        return pd(this).eventPhase
	    },

	    /**
	     * Stop event bubbling.
	     * @returns {void}
	     */
	    stopPropagation() {
	        const data = pd(this);

	        data.stopped = true;
	        if (typeof data.event.stopPropagation === "function") {
	            data.event.stopPropagation();
	        }
	    },

	    /**
	     * Stop event bubbling.
	     * @returns {void}
	     */
	    stopImmediatePropagation() {
	        const data = pd(this);

	        data.stopped = true;
	        data.immediateStopped = true;
	        if (typeof data.event.stopImmediatePropagation === "function") {
	            data.event.stopImmediatePropagation();
	        }
	    },

	    /**
	     * The flag to be bubbling.
	     * @type {boolean}
	     */
	    get bubbles() {
	        return Boolean(pd(this).event.bubbles)
	    },

	    /**
	     * The flag to be cancelable.
	     * @type {boolean}
	     */
	    get cancelable() {
	        return Boolean(pd(this).event.cancelable)
	    },

	    /**
	     * Cancel this event.
	     * @returns {void}
	     */
	    preventDefault() {
	        setCancelFlag(pd(this));
	    },

	    /**
	     * The flag to indicate cancellation state.
	     * @type {boolean}
	     */
	    get defaultPrevented() {
	        return pd(this).canceled
	    },

	    /**
	     * The flag to be composed.
	     * @type {boolean}
	     */
	    get composed() {
	        return Boolean(pd(this).event.composed)
	    },

	    /**
	     * The unix time of this event.
	     * @type {number}
	     */
	    get timeStamp() {
	        return pd(this).timeStamp
	    },

	    /**
	     * The target of this event.
	     * @type {EventTarget}
	     * @deprecated
	     */
	    get srcElement() {
	        return pd(this).eventTarget
	    },

	    /**
	     * The flag to stop event bubbling.
	     * @type {boolean}
	     * @deprecated
	     */
	    get cancelBubble() {
	        return pd(this).stopped
	    },
	    set cancelBubble(value) {
	        if (!value) {
	            return
	        }
	        const data = pd(this);

	        data.stopped = true;
	        if (typeof data.event.cancelBubble === "boolean") {
	            data.event.cancelBubble = true;
	        }
	    },

	    /**
	     * The flag to indicate cancellation state.
	     * @type {boolean}
	     * @deprecated
	     */
	    get returnValue() {
	        return !pd(this).canceled
	    },
	    set returnValue(value) {
	        if (!value) {
	            setCancelFlag(pd(this));
	        }
	    },

	    /**
	     * Initialize this event object. But do nothing under event dispatching.
	     * @param {string} type The event type.
	     * @param {boolean} [bubbles=false] The flag to be possible to bubble up.
	     * @param {boolean} [cancelable=false] The flag to be possible to cancel.
	     * @deprecated
	     */
	    initEvent() {
	        // Do nothing.
	    },
	};

	// `constructor` is not enumerable.
	Object.defineProperty(Event.prototype, "constructor", {
	    value: Event,
	    configurable: true,
	    writable: true,
	});

	// Ensure `event instanceof window.Event` is `true`.
	if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
	    Object.setPrototypeOf(Event.prototype, window.Event.prototype);

	    // Make association for wrappers.
	    wrappers.set(window.Event.prototype, Event);
	}

	/**
	 * Get the property descriptor to redirect a given property.
	 * @param {string} key Property name to define property descriptor.
	 * @returns {PropertyDescriptor} The property descriptor to redirect the property.
	 * @private
	 */
	function defineRedirectDescriptor(key) {
	    return {
	        get() {
	            return pd(this).event[key]
	        },
	        set(value) {
	            pd(this).event[key] = value;
	        },
	        configurable: true,
	        enumerable: true,
	    }
	}

	/**
	 * Get the property descriptor to call a given method property.
	 * @param {string} key Property name to define property descriptor.
	 * @returns {PropertyDescriptor} The property descriptor to call the method property.
	 * @private
	 */
	function defineCallDescriptor(key) {
	    return {
	        value() {
	            const event = pd(this).event;
	            return event[key].apply(event, arguments)
	        },
	        configurable: true,
	        enumerable: true,
	    }
	}

	/**
	 * Define new wrapper class.
	 * @param {Function} BaseEvent The base wrapper class.
	 * @param {Object} proto The prototype of the original event.
	 * @returns {Function} The defined wrapper class.
	 * @private
	 */
	function defineWrapper(BaseEvent, proto) {
	    const keys = Object.keys(proto);
	    if (keys.length === 0) {
	        return BaseEvent
	    }

	    /** CustomEvent */
	    function CustomEvent(eventTarget, event) {
	        BaseEvent.call(this, eventTarget, event);
	    }

	    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
	        constructor: { value: CustomEvent, configurable: true, writable: true },
	    });

	    // Define accessors.
	    for (let i = 0; i < keys.length; ++i) {
	        const key = keys[i];
	        if (!(key in BaseEvent.prototype)) {
	            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
	            const isFunc = typeof descriptor.value === "function";
	            Object.defineProperty(
	                CustomEvent.prototype,
	                key,
	                isFunc
	                    ? defineCallDescriptor(key)
	                    : defineRedirectDescriptor(key)
	            );
	        }
	    }

	    return CustomEvent
	}

	/**
	 * Get the wrapper class of a given prototype.
	 * @param {Object} proto The prototype of the original event to get its wrapper.
	 * @returns {Function} The wrapper class.
	 * @private
	 */
	function getWrapper(proto) {
	    if (proto == null || proto === Object.prototype) {
	        return Event
	    }

	    let wrapper = wrappers.get(proto);
	    if (wrapper == null) {
	        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
	        wrappers.set(proto, wrapper);
	    }
	    return wrapper
	}

	/**
	 * Wrap a given event to management a dispatching.
	 * @param {EventTarget} eventTarget The event target of this dispatching.
	 * @param {Object} event The event to wrap.
	 * @returns {Event} The wrapper instance.
	 * @private
	 */
	function wrapEvent(eventTarget, event) {
	    const Wrapper = getWrapper(Object.getPrototypeOf(event));
	    return new Wrapper(eventTarget, event)
	}

	/**
	 * Get the immediateStopped flag of a given event.
	 * @param {Event} event The event to get.
	 * @returns {boolean} The flag to stop propagation immediately.
	 * @private
	 */
	function isStopped(event) {
	    return pd(event).immediateStopped
	}

	/**
	 * Set the current event phase of a given event.
	 * @param {Event} event The event to set current target.
	 * @param {number} eventPhase New event phase.
	 * @returns {void}
	 * @private
	 */
	function setEventPhase(event, eventPhase) {
	    pd(event).eventPhase = eventPhase;
	}

	/**
	 * Set the current target of a given event.
	 * @param {Event} event The event to set current target.
	 * @param {EventTarget|null} currentTarget New current target.
	 * @returns {void}
	 * @private
	 */
	function setCurrentTarget(event, currentTarget) {
	    pd(event).currentTarget = currentTarget;
	}

	/**
	 * Set a passive listener of a given event.
	 * @param {Event} event The event to set current target.
	 * @param {Function|null} passiveListener New passive listener.
	 * @returns {void}
	 * @private
	 */
	function setPassiveListener(event, passiveListener) {
	    pd(event).passiveListener = passiveListener;
	}

	/**
	 * @typedef {object} ListenerNode
	 * @property {Function} listener
	 * @property {1|2|3} listenerType
	 * @property {boolean} passive
	 * @property {boolean} once
	 * @property {ListenerNode|null} next
	 * @private
	 */

	/**
	 * @type {WeakMap<object, Map<string, ListenerNode>>}
	 * @private
	 */
	const listenersMap = new WeakMap();

	// Listener types
	const CAPTURE = 1;
	const BUBBLE = 2;
	const ATTRIBUTE = 3;

	/**
	 * Check whether a given value is an object or not.
	 * @param {any} x The value to check.
	 * @returns {boolean} `true` if the value is an object.
	 */
	function isObject$1(x) {
	    return x !== null && typeof x === "object" //eslint-disable-line no-restricted-syntax
	}

	/**
	 * Get listeners.
	 * @param {EventTarget} eventTarget The event target to get.
	 * @returns {Map<string, ListenerNode>} The listeners.
	 * @private
	 */
	function getListeners(eventTarget) {
	    const listeners = listenersMap.get(eventTarget);
	    if (listeners == null) {
	        throw new TypeError(
	            "'this' is expected an EventTarget object, but got another value."
	        )
	    }
	    return listeners
	}

	/**
	 * Get the property descriptor for the event attribute of a given event.
	 * @param {string} eventName The event name to get property descriptor.
	 * @returns {PropertyDescriptor} The property descriptor.
	 * @private
	 */
	function defineEventAttributeDescriptor(eventName) {
	    return {
	        get() {
	            const listeners = getListeners(this);
	            let node = listeners.get(eventName);
	            while (node != null) {
	                if (node.listenerType === ATTRIBUTE) {
	                    return node.listener
	                }
	                node = node.next;
	            }
	            return null
	        },

	        set(listener) {
	            if (typeof listener !== "function" && !isObject$1(listener)) {
	                listener = null; // eslint-disable-line no-param-reassign
	            }
	            const listeners = getListeners(this);

	            // Traverse to the tail while removing old value.
	            let prev = null;
	            let node = listeners.get(eventName);
	            while (node != null) {
	                if (node.listenerType === ATTRIBUTE) {
	                    // Remove old value.
	                    if (prev !== null) {
	                        prev.next = node.next;
	                    } else if (node.next !== null) {
	                        listeners.set(eventName, node.next);
	                    } else {
	                        listeners.delete(eventName);
	                    }
	                } else {
	                    prev = node;
	                }

	                node = node.next;
	            }

	            // Add new value.
	            if (listener !== null) {
	                const newNode = {
	                    listener,
	                    listenerType: ATTRIBUTE,
	                    passive: false,
	                    once: false,
	                    next: null,
	                };
	                if (prev === null) {
	                    listeners.set(eventName, newNode);
	                } else {
	                    prev.next = newNode;
	                }
	            }
	        },
	        configurable: true,
	        enumerable: true,
	    }
	}

	/**
	 * Define an event attribute (e.g. `eventTarget.onclick`).
	 * @param {Object} eventTargetPrototype The event target prototype to define an event attrbite.
	 * @param {string} eventName The event name to define.
	 * @returns {void}
	 */
	function defineEventAttribute(eventTargetPrototype, eventName) {
	    Object.defineProperty(
	        eventTargetPrototype,
	        `on${eventName}`,
	        defineEventAttributeDescriptor(eventName)
	    );
	}

	/**
	 * Define a custom EventTarget with event attributes.
	 * @param {string[]} eventNames Event names for event attributes.
	 * @returns {EventTarget} The custom EventTarget.
	 * @private
	 */
	function defineCustomEventTarget(eventNames) {
	    /** CustomEventTarget */
	    function CustomEventTarget() {
	        EventTarget.call(this);
	    }

	    CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
	        constructor: {
	            value: CustomEventTarget,
	            configurable: true,
	            writable: true,
	        },
	    });

	    for (let i = 0; i < eventNames.length; ++i) {
	        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
	    }

	    return CustomEventTarget
	}

	/**
	 * EventTarget.
	 *
	 * - This is constructor if no arguments.
	 * - This is a function which returns a CustomEventTarget constructor if there are arguments.
	 *
	 * For example:
	 *
	 *     class A extends EventTarget {}
	 *     class B extends EventTarget("message") {}
	 *     class C extends EventTarget("message", "error") {}
	 *     class D extends EventTarget(["message", "error"]) {}
	 */
	function EventTarget() {
	    /*eslint-disable consistent-return */
	    if (this instanceof EventTarget) {
	        listenersMap.set(this, new Map());
	        return
	    }
	    if (arguments.length === 1 && Array.isArray(arguments[0])) {
	        return defineCustomEventTarget(arguments[0])
	    }
	    if (arguments.length > 0) {
	        const types = new Array(arguments.length);
	        for (let i = 0; i < arguments.length; ++i) {
	            types[i] = arguments[i];
	        }
	        return defineCustomEventTarget(types)
	    }
	    throw new TypeError("Cannot call a class as a function")
	    /*eslint-enable consistent-return */
	}

	// Should be enumerable, but class methods are not enumerable.
	EventTarget.prototype = {
	    /**
	     * Add a given listener to this event target.
	     * @param {string} eventName The event name to add.
	     * @param {Function} listener The listener to add.
	     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
	     * @returns {void}
	     */
	    addEventListener(eventName, listener, options) {
	        if (listener == null) {
	            return
	        }
	        if (typeof listener !== "function" && !isObject$1(listener)) {
	            throw new TypeError("'listener' should be a function or an object.")
	        }

	        const listeners = getListeners(this);
	        const optionsIsObj = isObject$1(options);
	        const capture = optionsIsObj
	            ? Boolean(options.capture)
	            : Boolean(options);
	        const listenerType = capture ? CAPTURE : BUBBLE;
	        const newNode = {
	            listener,
	            listenerType,
	            passive: optionsIsObj && Boolean(options.passive),
	            once: optionsIsObj && Boolean(options.once),
	            next: null,
	        };

	        // Set it as the first node if the first node is null.
	        let node = listeners.get(eventName);
	        if (node === undefined) {
	            listeners.set(eventName, newNode);
	            return
	        }

	        // Traverse to the tail while checking duplication..
	        let prev = null;
	        while (node != null) {
	            if (
	                node.listener === listener &&
	                node.listenerType === listenerType
	            ) {
	                // Should ignore duplication.
	                return
	            }
	            prev = node;
	            node = node.next;
	        }

	        // Add it.
	        prev.next = newNode;
	    },

	    /**
	     * Remove a given listener from this event target.
	     * @param {string} eventName The event name to remove.
	     * @param {Function} listener The listener to remove.
	     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
	     * @returns {void}
	     */
	    removeEventListener(eventName, listener, options) {
	        if (listener == null) {
	            return
	        }

	        const listeners = getListeners(this);
	        const capture = isObject$1(options)
	            ? Boolean(options.capture)
	            : Boolean(options);
	        const listenerType = capture ? CAPTURE : BUBBLE;

	        let prev = null;
	        let node = listeners.get(eventName);
	        while (node != null) {
	            if (
	                node.listener === listener &&
	                node.listenerType === listenerType
	            ) {
	                if (prev !== null) {
	                    prev.next = node.next;
	                } else if (node.next !== null) {
	                    listeners.set(eventName, node.next);
	                } else {
	                    listeners.delete(eventName);
	                }
	                return
	            }

	            prev = node;
	            node = node.next;
	        }
	    },

	    /**
	     * Dispatch a given event.
	     * @param {Event|{type:string}} event The event to dispatch.
	     * @returns {boolean} `false` if canceled.
	     */
	    dispatchEvent(event) {
	        if (event == null || typeof event.type !== "string") {
	            throw new TypeError('"event.type" should be a string.')
	        }

	        // If listeners aren't registered, terminate.
	        const listeners = getListeners(this);
	        const eventName = event.type;
	        let node = listeners.get(eventName);
	        if (node == null) {
	            return true
	        }

	        // Since we cannot rewrite several properties, so wrap object.
	        const wrappedEvent = wrapEvent(this, event);

	        // This doesn't process capturing phase and bubbling phase.
	        // This isn't participating in a tree.
	        let prev = null;
	        while (node != null) {
	            // Remove this listener if it's once
	            if (node.once) {
	                if (prev !== null) {
	                    prev.next = node.next;
	                } else if (node.next !== null) {
	                    listeners.set(eventName, node.next);
	                } else {
	                    listeners.delete(eventName);
	                }
	            } else {
	                prev = node;
	            }

	            // Call this listener
	            setPassiveListener(
	                wrappedEvent,
	                node.passive ? node.listener : null
	            );
	            if (typeof node.listener === "function") {
	                try {
	                    node.listener.call(this, wrappedEvent);
	                } catch (err) {
	                    if (
	                        typeof console !== "undefined" &&
	                        typeof console.error === "function"
	                    ) {
	                        console.error(err);
	                    }
	                }
	            } else if (
	                node.listenerType !== ATTRIBUTE &&
	                typeof node.listener.handleEvent === "function"
	            ) {
	                node.listener.handleEvent(wrappedEvent);
	            }

	            // Break if `event.stopImmediatePropagation` was called.
	            if (isStopped(wrappedEvent)) {
	                break
	            }

	            node = node.next;
	        }
	        setPassiveListener(wrappedEvent, null);
	        setEventPhase(wrappedEvent, 0);
	        setCurrentTarget(wrappedEvent, null);

	        return !wrappedEvent.defaultPrevented
	    },
	};

	// `constructor` is not enumerable.
	Object.defineProperty(EventTarget.prototype, "constructor", {
	    value: EventTarget,
	    configurable: true,
	    writable: true,
	});

	// Ensure `eventTarget instanceof window.EventTarget` is `true`.
	if (
	    typeof window !== "undefined" &&
	    typeof window.EventTarget !== "undefined"
	) {
	    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
	}

	/* globals WebSocket:true Event: true */

	(function (RcSocketReadyState) {
	  RcSocketReadyState[RcSocketReadyState["CONNECTING"] = 0] = "CONNECTING";
	  RcSocketReadyState[RcSocketReadyState["OPEN"] = 1] = "OPEN";
	  RcSocketReadyState[RcSocketReadyState["CLOSING"] = 2] = "CLOSING";
	  RcSocketReadyState[RcSocketReadyState["CLOSED"] = 3] = "CLOSED";
	})(exports.RcSocketReadyState || (exports.RcSocketReadyState = {}));

	(function (RcSocketCloseType) {
	  RcSocketCloseType[RcSocketCloseType["FORCE"] = 0] = "FORCE";
	  RcSocketCloseType[RcSocketCloseType["KILL"] = 1] = "KILL";
	  RcSocketCloseType[RcSocketCloseType["RETRY"] = 2] = "RETRY";
	})(exports.RcSocketCloseType || (exports.RcSocketCloseType = {}));

	(function (RcSocketEventHandlerName) {
	  RcSocketEventHandlerName["CONNECTING"] = "onconnecting";
	  RcSocketEventHandlerName["TIMEOUT"] = "ontimeout";
	  RcSocketEventHandlerName["ERROR"] = "onerror";
	  RcSocketEventHandlerName["OPEN"] = "onopen";
	  RcSocketEventHandlerName["MESSAGE"] = "onmessage";
	  RcSocketEventHandlerName["CLOSING"] = "onclosing";
	  RcSocketEventHandlerName["CLOSE"] = "onclose";
	})(exports.RcSocketEventHandlerName || (exports.RcSocketEventHandlerName = {}));

	/* -----------------------------------------------------------------------------
	 * RcSocketEvent
	 *
	 * Need to shim to support envornments that don't support native `Event`
	 * (specifically, `react-native`)
	 * -------------------------------------------------------------------------- */
	var RcSocketEvent = function RcSocketEvent(type) {
	  _classCallCheck(this, RcSocketEvent);

	  _defineProperty(this, "type", void 0);

	  this.type = type;
	};
	/* -----------------------------------------------------------------------------
	 * RcSocket
	 * -------------------------------------------------------------------------- */


	var RcSocket =
	/*#__PURE__*/
	function (_EventTarget) {
	  _inherits(RcSocket, _EventTarget);

	  // configuration
	  // handlers
	  // public state
	  // protected state

	  /**
	   * @constructor
	   * @name RcSocket
	   * @desc This behaves like a WebSocket in every way, except if it fails to
	   * connect, or it gets disconnected, it will use an exponential backoff until
	   * it succesfully connects again.
	   *
	   * It is API compatible with the standard WebSocket API.
	   *
	   * @example
	   * const ws = new RcSocket(wss://host)
	   *
	   * @param url - Url to connect to.
	   * @param protocols - Optional subprotocols.
	   */
	  function RcSocket(url, protocols, settings) {
	    var _this;

	    _classCallCheck(this, RcSocket);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(RcSocket).call(this));

	    _defineProperty(_assertThisInitialized(_this), "settings", {
	      debug: RcSocket.defaultSettings.debug,
	      logger: RcSocket.defaultSettings.logger,
	      connectionTimeout: RcSocket.defaultSettings.connectionTimeout,
	      connectionMaxRetryInterval: RcSocket.defaultSettings.connectionMaxRetryInterval
	    });

	    _defineProperty(_assertThisInitialized(_this), "url", void 0);

	    _defineProperty(_assertThisInitialized(_this), "protocols", void 0);

	    _defineProperty(_assertThisInitialized(_this), "onclose", null);

	    _defineProperty(_assertThisInitialized(_this), "onerror", null);

	    _defineProperty(_assertThisInitialized(_this), "onmessage", null);

	    _defineProperty(_assertThisInitialized(_this), "onopen", null);

	    _defineProperty(_assertThisInitialized(_this), "ontimeout", null);

	    _defineProperty(_assertThisInitialized(_this), "onconnecting", null);

	    _defineProperty(_assertThisInitialized(_this), "onclosing", null);

	    _defineProperty(_assertThisInitialized(_this), "readyState", exports.RcSocketReadyState.CONNECTING);

	    _defineProperty(_assertThisInitialized(_this), "queue", []);

	    _defineProperty(_assertThisInitialized(_this), "_ws", null);

	    _defineProperty(_assertThisInitialized(_this), "_attempts", 1);

	    _defineProperty(_assertThisInitialized(_this), "_shouldReopen", false);

	    _defineProperty(_assertThisInitialized(_this), "_closeType", null);

	    _defineProperty(_assertThisInitialized(_this), "_connectTimer", null);

	    _defineProperty(_assertThisInitialized(_this), "_listeners", new Map());

	    _this.url = url;
	    _this.protocols = protocols; // Mixin instance defined settings

	    Object.assign(_this.settings, settings); // Delay connect so that we can immediately add socket handlers.

	    setTimeout(function () {
	      return _this.open();
	    }, 0);
	    return _this;
	  }
	  /**
	   * @desc Sets initial websocket state and connects. Useful for situations
	   * where you want to close the socket and reopen it at a later time.
	   *
	   * @example
	   * socket.close()
	   * socket.open()
	   */


	  _createClass(RcSocket, [{
	    key: "open",
	    value: function open() {
	      if (!this.readyState || this.readyState > WebSocket.CLOSING) {
	        this.reset();

	        this._connect();
	      } else if (this.readyState === WebSocket.CLOSING) {
	        this._shouldReopen = true;
	      }
	    }
	    /**
	     * @desc Wrapper around ws.send that adds queue functionality when socket is
	     *   not in a connected readyState.
	     *
	     * @example
	     * socket.send({ prop: 'val' })
	     *
	     * @param data - data to send via web socket.
	     */

	  }, {
	    key: "send",
	    value: function send(data) {
	      // If the queue is actively being process we will move this send to be
	      // processed within the queue cycle.
	      return this.readyState === WebSocket.OPEN ? this._send(data) : this.queue.push(data);
	    }
	    /**
	     * @desc Explicitly close socket. Overrides default RcSocket reconnection logic.
	     *
	     * @example
	     * socket.close()
	     */

	  }, {
	    key: "close",
	    value: function close() {
	      this._close(exports.RcSocketCloseType.FORCE);
	    }
	    /**
	     * @desc Hard kill by cleaning up all handlers.
	     *
	     * @example
	     * socket.kill()
	     */

	  }, {
	    key: "kill",
	    value: function kill() {
	      this._close(exports.RcSocketCloseType.KILL);

	      this.reset();
	    }
	    /**
	     * @desc Refresh the connection if open (close, re-open). If the app suspects
	     *   the socket is stale (occurs when changing from wifi -> carrier or vice
	     *   versa), this method will close the existing socket and reconnect.
	     *
	     * @example
	     * socket.reboot()
	     */

	  }, {
	    key: "reboot",
	    value: function reboot() {
	      this.kill();

	      this._connect();
	    }
	    /**
	     * @desc Reset socket to initial state.
	     *
	     * @example
	     * socket.reset()
	     */

	  }, {
	    key: "reset",
	    value: function reset() {
	      this._stop();

	      if (this._ws) {
	        this._ws.onopen = null;
	        this._ws.onclose = null;
	        this._ws.onmessage = null;
	        this._ws.onerror = null;
	      }

	      this._ws = null;
	      this.readyState = exports.RcSocketReadyState.CONNECTING;
	      this._closeType = null;
	      this._shouldReopen = false;
	      this._attempts = 1;
	    }
	    /**
	     * @desc Registers an event handler of a specific event type on the
	     * EventTarget. Unlike the default WebSocket `addEventListener` method,
	     * RcSocket will return the `removeEventListener` method.
	     *
	     * @example
	     * const listener = evt => console.log(evt)
	     * socket.addEventListener('message', listener)
	     *
	     * @param type - A case-sensitive string representing the event type to listen
	     * for.
	     * @param listener - The object which receives a notification (an object that
	     * implements the Event interface) when an event of the specified type occur.
	     * @param options - An options object that specifies characteristics about the
	     * event listener.
	     */

	  }, {
	    key: "addEventListener",
	    value: function addEventListener(type, listener, options) {
	      var _this2 = this;

	      var listenerKey = this._getListenerKey(type, options);

	      var listenerSet = this._listeners.get(listenerKey) || new Set();

	      this._listeners.set(listenerKey, listenerSet.add(listener));

	      _get(_getPrototypeOf(RcSocket.prototype), "addEventListener", this).call(this, type, listener, options);

	      return function () {
	        return _this2.removeEventListener(type, listener, options);
	      };
	    }
	    /**
	     * @desc Removes an event listener from the EventTarget.
	     *
	     * @example
	     * socket.removeEventListener('message', listener)
	     *
	     * @param type - A case-sensitive string representing the event type to listen
	     * for.
	     * @param listener - The object which receives a notification (an object that
	     * implements the Event interface) when an event of the specified type occur.
	     * @param options - An options object that specifies characteristics about the
	     * event listener.
	     */

	  }, {
	    key: "removeEventListener",
	    value: function removeEventListener(type, listener, options) {
	      var listenerKey = this._getListenerKey(type, options);

	      var listenerSet = this._listeners.get(listenerKey);

	      if (listenerSet) {
	        listenerSet.delete(listener);
	        !listenerSet.size && this._listeners.delete(listenerKey);
	      }

	      _get(_getPrototypeOf(RcSocket.prototype), "removeEventListener", this).call(this, type, listener, options);
	    }
	    /**
	     * @desc Removes all event listeners from the EventTarget.
	     *
	     * @example
	     * socket.removeAllEventListeners()
	     */

	  }, {
	    key: "removeAllEventListeners",
	    value: function removeAllEventListeners() {
	      var _this3 = this;

	      this._listeners.forEach(function (listenerSet, key) {
	        var _key$split = key.split('🚧'),
	            _key$split2 = _slicedToArray(_key$split, 2),
	            type = _key$split2[0],
	            _capture = _key$split2[1];

	        var capture = _capture === 'undefined' ? undefined : _capture === 'true';
	        listenerSet.forEach(function (listener) {
	          return _this3.removeEventListener(type, listener, capture);
	        });
	      });

	      this._listeners.clear();
	    }
	    /* ---------------------------------------------------------------------------
	     * WebSocket Management
	     * ------------------------------------------------------------------------ */

	    /**
	     * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
	     *   have the opportunity to manipulate events, change behavior (like adding
	     *   reconnection logic), and then finally proxy the events as if we were a
	     *   the actual socket.
	     */

	  }, {
	    key: "_connect",
	    value: function _connect() {
	      var _this4 = this;

	      this._ws = Object.assign(new WebSocket(this.url, this.protocols), {
	        id: Date.now()
	      });
	      this._ws.onopen = this._onopen.bind(this);
	      this._ws.onclose = this._onclose.bind(this);
	      this._ws.onmessage = this._onmessage.bind(this);
	      this._ws.onerror = this._onerror.bind(this); // Rather than letting the websocket set indefinetely, we close the socket
	      // after a specified timeout. The close will automatically handle retrying.

	      this._connectTimer = setTimeout(function () {
	        _this4._trigger(exports.RcSocketEventHandlerName.TIMEOUT);

	        _this4._close(exports.RcSocketCloseType.RETRY);
	      }, this.settings.connectionTimeout);

	      this._stateChanged(exports.RcSocketReadyState.CONNECTING, exports.RcSocketEventHandlerName.CONNECTING);
	    }
	    /**
	     * @desc Stop all async code from executing. Used internally anytime a socket
	     * is either manually closed, or interpretted as closed
	     */

	  }, {
	    key: "_stop",
	    value: function _stop() {
	      if (this._connectTimer) {
	        clearTimeout(this._connectTimer);
	        this._connectTimer = null;
	      }
	    }
	    /**
	     * @desc Timeout cleanup, state management, and queue handling.
	     *
	     * @param evt - WebSocket onopen evt.
	     */

	  }, {
	    key: "_onopen",
	    value: function _onopen(evt) {
	      if (this._connectTimer) {
	        clearTimeout(this._connectTimer);
	        this._connectTimer = null;
	      } // Fix error where close is explicitly called but onopen event is still
	      // triggered.


	      if (this._closeType === exports.RcSocketCloseType.FORCE) {
	        return this.close();
	      }

	      this._attempts = 1;

	      this._stateChanged(exports.RcSocketReadyState.OPEN, exports.RcSocketEventHandlerName.OPEN, evt);

	      this._sendQueued();
	    }
	    /**
	     * @desc Responsible for interpretting the various possible close types (force,
	     *   retry, etc...) and reconnecting/proxying events accordingly.
	     *
	     * @param evt - WebSocket onclose evt.
	     */

	  }, {
	    key: "_onclose",
	    value: function _onclose(evt) {
	      this._stop();

	      this._ws = null; // Immediately change state and exit on force close.

	      if (this._closeType === exports.RcSocketCloseType.FORCE) {
	        this._stateChanged(exports.RcSocketReadyState.CLOSED, exports.RcSocketEventHandlerName.CLOSE, Object.assign(evt, {
	          forced: true
	        }));

	        if (this._shouldReopen) {
	          this.open();
	        }
	      } else {
	        if (this._closeType !== exports.RcSocketCloseType.RETRY) {
	          this._trigger(exports.RcSocketEventHandlerName.CLOSE, evt);
	        }

	        this._reconnect();
	      }
	    }
	    /**
	     * @desc Simple proxy for onmessage event.
	     *
	     * @param evt - WebSocket onmessage evt.
	     */

	  }, {
	    key: "_onmessage",
	    value: function _onmessage(evt) {
	      this._trigger(exports.RcSocketEventHandlerName.MESSAGE, evt);
	    }
	    /**
	     * @desc Simple proxy for onerror event.
	     *
	     * @param evt - WebSocket onerror evt.
	     */

	  }, {
	    key: "_onerror",
	    value: function _onerror(evt) {
	      this._trigger(exports.RcSocketEventHandlerName.ERROR, evt);
	    }
	    /**
	     * @desc Helper around ws.close to ensure ws exists. If it does not exist we
	     *   fail silently. This seemed logical as closing the socket would have the
	     *   same effect as if the socket never existed. In other words no matter what
	     *   happens in this method the net effect will always be the same.
	     *
	     * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
	     */

	  }, {
	    key: "_close",
	    value: function _close(closeType) {
	      this._closeType = closeType;
	      this._shouldReopen = false;

	      if (this._ws && this.readyState < WebSocket.CLOSING) {
	        this._ws.close();

	        this._stateChanged(exports.RcSocketReadyState.CLOSING, exports.RcSocketEventHandlerName.CLOSING);
	      }
	    }
	    /**
	     * @desc Call connect after a delayed timeout. The timeout is calculated using
	     *   expotential backoff. As connect attempts increase, the time between connect
	     *   attempts will grow (up to a specified connectionMaxRetryInterval).
	     */

	  }, {
	    key: "_reconnect",
	    value: function _reconnect() {
	      var _this5 = this;

	      var interval = (Math.pow(2, this._attempts) - 1) * 1000;
	      interval = interval > this.settings.connectionMaxRetryInterval ? this.settings.connectionMaxRetryInterval : interval;
	      this._attempts++;
	      setTimeout(function () {
	        return _this5._connect();
	      }, interval);
	    }
	    /**
	     * @desc Wrapper around ws send to make sure all data is sent in correct
	     *   format.
	     */

	  }, {
	    key: "_send",
	    value: function _send(data) {
	      if (this._ws) {
	        this._sendPayload(JSON.stringify(data));
	      }
	    }
	    /**
	     * @desc Proxy to underlying websocket `send` method. This is pulled into its
	     * own method for debugging/testing purposes.
	     */

	  }, {
	    key: "_sendPayload",
	    value: function _sendPayload(payload) {
	      if (this._ws) {
	        this._ws.send(payload);
	      }
	    }
	    /* ---------------------------------------------------------------------------
	     * Queue
	     * ------------------------------------------------------------------------ */

	    /**
	     * @desc Begin processing queue.
	     */

	  }, {
	    key: "_sendQueued",
	    value: function _sendQueued() {
	      var _this6 = this;

	      this.queue.forEach(function (msg) {
	        return _this6._send(msg);
	      });
	    }
	    /* ---------------------------------------------------------------------------
	     * Helpers
	     * ------------------------------------------------------------------------ */

	    /**
	     * @desc Small helper to obtain consistent key for lookingup our listeners
	     * based on event listener matching algorithm
	     * ref: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
	     *
	     * @param type - A case-sensitive string representing the event type to listen
	     * for.
	     * @param options - An options object that specifies characteristics about the
	     * event listener.
	     */

	  }, {
	    key: "_getListenerKey",
	    value: function _getListenerKey(type, options) {
	      var capture = _typeof(options) === 'object' ? options.capture : options; // Using an obscure emoji as a separator to reduce any collisions that
	      // could occur with custom event types. Example: `message:1234`

	      return typeof capture === 'boolean' ? "".concat(type, "\uD83D\uDEA7").concat(capture.toString()) : "".concat(type, "\uD83D\uDEA7undefined");
	    }
	    /**
	     * @desc Update state, log, trigger.
	     *
	     * @param state - String representing WebSocket.
	     * @param name - String of the event name.
	     * @param evt - Event object.
	     */

	  }, {
	    key: "_stateChanged",
	    value: function _stateChanged(readyState, evtName, evt) {
	      this.readyState = readyState;

	      this._trigger(evtName, evt);
	    }
	    /**
	     * @desc Convenience method for semantically calling handlers.
	     *
	     * @param evtName - Name of event to fire.
	     * @param evt - Raw WebSocket evt we are proxying.
	     */

	  }, {
	    key: "_trigger",
	    value: function _trigger(evtHandlerName, evt) {
	      var event = typeof evt === 'undefined' ? new RcSocketEvent(evtHandlerName.slice(2)) : new evt.constructor(evt.type, evt);

	      if (this.settings.debug) {
	        this.settings.logger.debug('RcSocket', evtHandlerName, this.url, event);
	      } // TODO: Determine why handler cannot be correctly inferred


	      var handler = this[evtHandlerName];
	      handler && handler.call(this._ws, event);
	      this.dispatchEvent(event);
	    }
	  }]);

	  return RcSocket;
	}(EventTarget);

	_defineProperty(RcSocket, "defaultSettings", {
	  debug: false,
	  logger: console,
	  connectionTimeout: 2500,
	  connectionMaxRetryInterval: 1000
	});

	exports.default = RcSocket;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
