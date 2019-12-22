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

	var document = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document) && isObject(document.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document.createElement(it) : {};
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

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

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

	var WeakMap$1 = global_1.WeakMap;
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
	  var store$1 = new WeakMap$1();
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

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
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

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	var nativeAssign = Object.assign;
	var defineProperty = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty(this, 'b', {
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

	/* globals WebSocket:true */

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

	(function (RcSocketEventName) {
	  RcSocketEventName["CONNECTING"] = "onconnecting";
	  RcSocketEventName["TIMEOUT"] = "ontimeout";
	  RcSocketEventName["ERROR"] = "onerror";
	  RcSocketEventName["OPEN"] = "onopen";
	  RcSocketEventName["MESSAGE"] = "onmessage";
	  RcSocketEventName["CLOSING"] = "onclosing";
	  RcSocketEventName["CLOSE"] = "onclose";
	})(exports.RcSocketEventName || (exports.RcSocketEventName = {}));

	/* -----------------------------------------------------------------------------
	 * RcSocket
	 * -------------------------------------------------------------------------- */
	var RcSocket =
	/*#__PURE__*/
	function () {
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
	    var _this = this;

	    _defineProperty(this, "settings", {
	      debug: RcSocket.defaultSettings.debug,
	      logger: RcSocket.defaultSettings.logger,
	      connectionTimeout: RcSocket.defaultSettings.connectionTimeout,
	      connectionMaxRetryInterval: RcSocket.defaultSettings.connectionMaxRetryInterval
	    });

	    _defineProperty(this, "url", void 0);

	    _defineProperty(this, "protocols", void 0);

	    _defineProperty(this, "onclose", null);

	    _defineProperty(this, "onerror", null);

	    _defineProperty(this, "onmessage", null);

	    _defineProperty(this, "onopen", null);

	    _defineProperty(this, "ontimeout", null);

	    _defineProperty(this, "onconnecting", null);

	    _defineProperty(this, "onclosing", null);

	    _defineProperty(this, "readyState", exports.RcSocketReadyState.CONNECTING);

	    _defineProperty(this, "queue", []);

	    _defineProperty(this, "_ws", null);

	    _defineProperty(this, "_attempts", 1);

	    _defineProperty(this, "_shouldReopen", false);

	    _defineProperty(this, "_closeType", null);

	    _defineProperty(this, "_connectTimer", null);

	    this.url = url;
	    this.protocols = protocols; // Mixin instance defined settings

	    Object.assign(this.settings, settings); // Delay connect so that we can immediately add socket handlers.

	    setTimeout(function () {
	      return _this.open();
	    }, 0);
	  }
	  /**
	   * @desc Sets initial websocket state and connects. Useful for situations
	   * where you want to close the socket and reopen it at a later time.
	   *
	   * @example
	   * socket.close()
	   * socket.open()
	   */


	  var _proto = RcSocket.prototype;

	  _proto.open = function open() {
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
	  ;

	  _proto.send = function send(data) {
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
	  ;

	  _proto.close = function close() {
	    this._close(exports.RcSocketCloseType.FORCE);
	  }
	  /**
	   * @desc Hard kill by cleaning up all handlers.
	   *
	   * @example
	   * socket.kill()
	   */
	  ;

	  _proto.kill = function kill() {
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
	  ;

	  _proto.reboot = function reboot() {
	    this.kill();

	    this._connect();
	  }
	  /**
	   * @desc Reset socket to initial state.
	   *
	   * @example
	   * socket.reset()
	   */
	  ;

	  _proto.reset = function reset() {
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
	  /* ---------------------------------------------------------------------------
	   * WebSocket Management
	   * ------------------------------------------------------------------------ */

	  /**
	   * @desc Wrapper around WebSocket creation. By wrapping the raw WebSocket we
	   *   have the opportunity to manipulate events, change behavior (like adding
	   *   reconnection logic), and then finally proxy the events as if we were a
	   *   the actual socket.
	   */
	  ;

	  _proto._connect = function _connect() {
	    var _this2 = this;

	    this._ws = Object.assign(new WebSocket(this.url, this.protocols), {
	      id: Date.now()
	    });
	    this._ws.onopen = this._onopen.bind(this);
	    this._ws.onclose = this._onclose.bind(this);
	    this._ws.onmessage = this._onmessage.bind(this);
	    this._ws.onerror = this._onerror.bind(this); // Rather than letting the websocket set indefinetely, we close the socket
	    // after a specified timeout. The close will automatically handle retrying.

	    this._connectTimer = setTimeout(function () {
	      _this2._trigger(exports.RcSocketEventName.TIMEOUT);

	      _this2._close(exports.RcSocketCloseType.RETRY);
	    }, this.settings.connectionTimeout);

	    this._stateChanged(exports.RcSocketReadyState.CONNECTING, exports.RcSocketEventName.CONNECTING);
	  }
	  /**
	   * @desc Stop all async code from executing. Used internally anytime a socket
	   * is either manually closed, or interpretted as closed
	   */
	  ;

	  _proto._stop = function _stop() {
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
	  ;

	  _proto._onopen = function _onopen(evt) {
	    if (this._connectTimer) {
	      clearTimeout(this._connectTimer);
	      this._connectTimer = null;
	    } // Fix error where close is explicitly called but onopen event is still
	    // triggered.


	    if (this._closeType === exports.RcSocketCloseType.FORCE) {
	      return this.close();
	    }

	    this._attempts = 1;

	    this._stateChanged(exports.RcSocketReadyState.OPEN, exports.RcSocketEventName.OPEN, evt);

	    this._sendQueued();
	  }
	  /**
	   * @desc Responsible for interpretting the various possible close types (force,
	   *   retry, etc...) and reconnecting/proxying events accordingly.
	   *
	   * @param evt - WebSocket onclose evt.
	   */
	  ;

	  _proto._onclose = function _onclose(evt) {
	    this._stop();

	    this._ws = null; // Immediately change state and exit on force close.

	    if (this._closeType === exports.RcSocketCloseType.FORCE) {
	      this._stateChanged(exports.RcSocketReadyState.CLOSED, exports.RcSocketEventName.CLOSE, Object.assign(evt, {
	        forced: true
	      }));

	      if (this._shouldReopen) {
	        this.open();
	      }
	    } else {
	      if (this._closeType !== exports.RcSocketCloseType.RETRY) {
	        this._trigger(exports.RcSocketEventName.CLOSE, evt);
	      }

	      this._reconnect();
	    }
	  }
	  /**
	   * @desc Simple proxy for onmessage event.
	   *
	   * @param evt - WebSocket onmessage evt.
	   */
	  ;

	  _proto._onmessage = function _onmessage(evt) {
	    this._trigger(exports.RcSocketEventName.MESSAGE, evt);
	  }
	  /**
	   * @desc Simple proxy for onerror event.
	   *
	   * @param evt - WebSocket onerror evt.
	   */
	  ;

	  _proto._onerror = function _onerror(evt) {
	    this._trigger(exports.RcSocketEventName.ERROR, evt);
	  }
	  /**
	   * @desc Helper around ws.close to ensure ws exists. If it does not exist we
	   *   fail silently. This seemed logical as closing the socket would have the
	   *   same effect as if the socket never existed. In other words no matter what
	   *   happens in this method the net effect will always be the same.
	   *
	   * @param closeType - The type of close ['FORCE', 'RETRY', 'KILL']
	   */
	  ;

	  _proto._close = function _close(closeType) {
	    this._closeType = closeType;
	    this._shouldReopen = false;

	    if (this._ws && this.readyState < WebSocket.CLOSING) {
	      this._ws.close();

	      this._stateChanged(exports.RcSocketReadyState.CLOSING, exports.RcSocketEventName.CLOSING);
	    }
	  }
	  /**
	   * @desc Call connect after a delayed timeout. The timeout is calculated using
	   *   expotential backoff. As connect attempts increase, the time between connect
	   *   attempts will grow (up to a specified connectionMaxRetryInterval).
	   */
	  ;

	  _proto._reconnect = function _reconnect() {
	    var _this3 = this;

	    var interval = (Math.pow(2, this._attempts) - 1) * 1000;
	    interval = interval > this.settings.connectionMaxRetryInterval ? this.settings.connectionMaxRetryInterval : interval;
	    this._attempts++;
	    setTimeout(function () {
	      return _this3._connect();
	    }, interval);
	  }
	  /**
	   * @desc Wrapper around ws send to make sure all data is sent in correct
	   *   format.
	   */
	  ;

	  _proto._send = function _send(data) {
	    if (this._ws) {
	      this._sendPayload(JSON.stringify(data));
	    }
	  }
	  /**
	   * @desc Proxy to underlying websocket `send` method. This is pulled into its
	   * own method for debugging/testing purposes.
	   */
	  ;

	  _proto._sendPayload = function _sendPayload(payload) {
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
	  ;

	  _proto._sendQueued = function _sendQueued() {
	    var _this4 = this;

	    this.queue.forEach(function (msg) {
	      return _this4._send(msg);
	    });
	  }
	  /* ---------------------------------------------------------------------------
	   * Helpers
	   * ------------------------------------------------------------------------ */

	  /**
	   * @desc Update state, log, trigger.
	   *
	   * @param state - String representing WebSocket.
	   * @param name - String of the event name.
	   * @param evt - Event object.
	   */
	  ;

	  _proto._stateChanged = function _stateChanged(readyState, evtName, evt) {
	    this.readyState = readyState;

	    this._trigger(evtName, evt);
	  }
	  /**
	   * @desc Convenience method for semantically calling handlers.
	   *
	   * @param evtName - Name of event to fire.
	   * @param evt - Raw WebSocket evt we are proxying.
	   */
	  ;

	  _proto._trigger = function _trigger(evtName, evt) {
	    if (this.settings.debug) {
	      this.settings.logger.debug('RcSocket', evtName, this.url, evt);
	    } // TODO: Determine why handler cannot be correctly inferred


	    var handler = this[evtName];
	    handler && handler.call(this._ws, evt);
	  };

	  return RcSocket;
	}();

	_defineProperty(RcSocket, "defaultSettings", {
	  debug: false,
	  logger: console,
	  connectionTimeout: 2500,
	  connectionMaxRetryInterval: 1000
	});

	exports.default = RcSocket;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
