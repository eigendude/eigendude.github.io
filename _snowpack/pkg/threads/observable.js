import {g as getDefaultExportFromCjs, c as createCommonjsModule} from "../common/_commonjsHelpers-37fa8da4.js";
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
class AsyncSerialScheduler {
  constructor(observer) {
    this._baseObserver = observer;
    this._pendingPromises = new Set();
  }
  complete() {
    Promise.all(this._pendingPromises).then(() => this._baseObserver.complete()).catch((error) => this._baseObserver.error(error));
  }
  error(error) {
    this._baseObserver.error(error);
  }
  schedule(task) {
    const prevPromisesCompletion = Promise.all(this._pendingPromises);
    const values = [];
    const next = (value) => values.push(value);
    const promise = Promise.resolve().then(() => __awaiter(this, void 0, void 0, function* () {
      yield prevPromisesCompletion;
      yield task(next);
      this._pendingPromises.delete(promise);
      for (const value of values) {
        this._baseObserver.next(value);
      }
    })).catch((error) => {
      this._pendingPromises.delete(promise);
      this._baseObserver.error(error);
    });
    this._pendingPromises.add(promise);
  }
}
const hasSymbols = () => typeof Symbol === "function";
const hasSymbol = (name) => hasSymbols() && Boolean(Symbol[name]);
const getSymbol = (name) => hasSymbol(name) ? Symbol[name] : "@@" + name;
if (!hasSymbol("asyncIterator")) {
  Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");
}
const SymbolIterator = getSymbol("iterator");
const SymbolObservable = getSymbol("observable");
const SymbolSpecies = getSymbol("species");
function getMethod(obj, key) {
  const value = obj[key];
  if (value == null) {
    return void 0;
  }
  if (typeof value !== "function") {
    throw new TypeError(value + " is not a function");
  }
  return value;
}
function getSpecies(obj) {
  let ctor = obj.constructor;
  if (ctor !== void 0) {
    ctor = ctor[SymbolSpecies];
    if (ctor === null) {
      ctor = void 0;
    }
  }
  return ctor !== void 0 ? ctor : Observable;
}
function isObservable(x) {
  return x instanceof Observable;
}
function hostReportError(error) {
  if (hostReportError.log) {
    hostReportError.log(error);
  } else {
    setTimeout(() => {
      throw error;
    }, 0);
  }
}
function enqueue(fn) {
  Promise.resolve().then(() => {
    try {
      fn();
    } catch (e) {
      hostReportError(e);
    }
  });
}
function cleanupSubscription(subscription) {
  const cleanup = subscription._cleanup;
  if (cleanup === void 0) {
    return;
  }
  subscription._cleanup = void 0;
  if (!cleanup) {
    return;
  }
  try {
    if (typeof cleanup === "function") {
      cleanup();
    } else {
      const unsubscribe2 = getMethod(cleanup, "unsubscribe");
      if (unsubscribe2) {
        unsubscribe2.call(cleanup);
      }
    }
  } catch (e) {
    hostReportError(e);
  }
}
function closeSubscription(subscription) {
  subscription._observer = void 0;
  subscription._queue = void 0;
  subscription._state = "closed";
}
function flushSubscription(subscription) {
  const queue = subscription._queue;
  if (!queue) {
    return;
  }
  subscription._queue = void 0;
  subscription._state = "ready";
  for (const item of queue) {
    notifySubscription(subscription, item.type, item.value);
    if (subscription._state === "closed") {
      break;
    }
  }
}
function notifySubscription(subscription, type, value) {
  subscription._state = "running";
  const observer = subscription._observer;
  try {
    const m = observer ? getMethod(observer, type) : void 0;
    switch (type) {
      case "next":
        if (m)
          m.call(observer, value);
        break;
      case "error":
        closeSubscription(subscription);
        if (m)
          m.call(observer, value);
        else
          throw value;
        break;
      case "complete":
        closeSubscription(subscription);
        if (m)
          m.call(observer);
        break;
    }
  } catch (e) {
    hostReportError(e);
  }
  if (subscription._state === "closed") {
    cleanupSubscription(subscription);
  } else if (subscription._state === "running") {
    subscription._state = "ready";
  }
}
function onNotify(subscription, type, value) {
  if (subscription._state === "closed") {
    return;
  }
  if (subscription._state === "buffering") {
    subscription._queue = subscription._queue || [];
    subscription._queue.push({type, value});
    return;
  }
  if (subscription._state !== "ready") {
    subscription._state = "buffering";
    subscription._queue = [{type, value}];
    enqueue(() => flushSubscription(subscription));
    return;
  }
  notifySubscription(subscription, type, value);
}
class Subscription {
  constructor(observer, subscriber) {
    this._cleanup = void 0;
    this._observer = observer;
    this._queue = void 0;
    this._state = "initializing";
    const subscriptionObserver = new SubscriptionObserver(this);
    try {
      this._cleanup = subscriber.call(void 0, subscriptionObserver);
    } catch (e) {
      subscriptionObserver.error(e);
    }
    if (this._state === "initializing") {
      this._state = "ready";
    }
  }
  get closed() {
    return this._state === "closed";
  }
  unsubscribe() {
    if (this._state !== "closed") {
      closeSubscription(this);
      cleanupSubscription(this);
    }
  }
}
class SubscriptionObserver {
  constructor(subscription) {
    this._subscription = subscription;
  }
  get closed() {
    return this._subscription._state === "closed";
  }
  next(value) {
    onNotify(this._subscription, "next", value);
  }
  error(value) {
    onNotify(this._subscription, "error", value);
  }
  complete() {
    onNotify(this._subscription, "complete");
  }
}
class Observable {
  constructor(subscriber) {
    if (!(this instanceof Observable)) {
      throw new TypeError("Observable cannot be called as a function");
    }
    if (typeof subscriber !== "function") {
      throw new TypeError("Observable initializer must be a function");
    }
    this._subscriber = subscriber;
  }
  subscribe(nextOrObserver, onError, onComplete) {
    if (typeof nextOrObserver !== "object" || nextOrObserver === null) {
      nextOrObserver = {
        next: nextOrObserver,
        error: onError,
        complete: onComplete
      };
    }
    return new Subscription(nextOrObserver, this._subscriber);
  }
  pipe(first, ...mappers) {
    let intermediate = this;
    for (const mapper of [first, ...mappers]) {
      intermediate = mapper(intermediate);
    }
    return intermediate;
  }
  tap(nextOrObserver, onError, onComplete) {
    const tapObserver = typeof nextOrObserver !== "object" || nextOrObserver === null ? {
      next: nextOrObserver,
      error: onError,
      complete: onComplete
    } : nextOrObserver;
    return new Observable((observer) => {
      return this.subscribe({
        next(value) {
          tapObserver.next && tapObserver.next(value);
          observer.next(value);
        },
        error(error) {
          tapObserver.error && tapObserver.error(error);
          observer.error(error);
        },
        complete() {
          tapObserver.complete && tapObserver.complete();
          observer.complete();
        },
        start(subscription) {
          tapObserver.start && tapObserver.start(subscription);
        }
      });
    });
  }
  forEach(fn) {
    return new Promise((resolve, reject) => {
      if (typeof fn !== "function") {
        reject(new TypeError(fn + " is not a function"));
        return;
      }
      function done() {
        subscription.unsubscribe();
        resolve(void 0);
      }
      const subscription = this.subscribe({
        next(value) {
          try {
            fn(value, done);
          } catch (e) {
            reject(e);
            subscription.unsubscribe();
          }
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(void 0);
        }
      });
    });
  }
  map(fn) {
    if (typeof fn !== "function") {
      throw new TypeError(fn + " is not a function");
    }
    const C = getSpecies(this);
    return new C((observer) => this.subscribe({
      next(value) {
        let propagatedValue = value;
        try {
          propagatedValue = fn(value);
        } catch (e) {
          return observer.error(e);
        }
        observer.next(propagatedValue);
      },
      error(e) {
        observer.error(e);
      },
      complete() {
        observer.complete();
      }
    }));
  }
  filter(fn) {
    if (typeof fn !== "function") {
      throw new TypeError(fn + " is not a function");
    }
    const C = getSpecies(this);
    return new C((observer) => this.subscribe({
      next(value) {
        try {
          if (!fn(value))
            return;
        } catch (e) {
          return observer.error(e);
        }
        observer.next(value);
      },
      error(e) {
        observer.error(e);
      },
      complete() {
        observer.complete();
      }
    }));
  }
  reduce(fn, seed) {
    if (typeof fn !== "function") {
      throw new TypeError(fn + " is not a function");
    }
    const C = getSpecies(this);
    const hasSeed = arguments.length > 1;
    let hasValue = false;
    let acc = seed;
    return new C((observer) => this.subscribe({
      next(value) {
        const first = !hasValue;
        hasValue = true;
        if (!first || hasSeed) {
          try {
            acc = fn(acc, value);
          } catch (e) {
            return observer.error(e);
          }
        } else {
          acc = value;
        }
      },
      error(e) {
        observer.error(e);
      },
      complete() {
        if (!hasValue && !hasSeed) {
          return observer.error(new TypeError("Cannot reduce an empty sequence"));
        }
        observer.next(acc);
        observer.complete();
      }
    }));
  }
  concat(...sources) {
    const C = getSpecies(this);
    return new C((observer) => {
      let subscription;
      let index = 0;
      function startNext(next) {
        subscription = next.subscribe({
          next(v) {
            observer.next(v);
          },
          error(e) {
            observer.error(e);
          },
          complete() {
            if (index === sources.length) {
              subscription = void 0;
              observer.complete();
            } else {
              startNext(C.from(sources[index++]));
            }
          }
        });
      }
      startNext(this);
      return () => {
        if (subscription) {
          subscription.unsubscribe();
          subscription = void 0;
        }
      };
    });
  }
  flatMap(fn) {
    if (typeof fn !== "function") {
      throw new TypeError(fn + " is not a function");
    }
    const C = getSpecies(this);
    return new C((observer) => {
      const subscriptions = [];
      const outer = this.subscribe({
        next(value) {
          let normalizedValue;
          if (fn) {
            try {
              normalizedValue = fn(value);
            } catch (e) {
              return observer.error(e);
            }
          } else {
            normalizedValue = value;
          }
          const inner = C.from(normalizedValue).subscribe({
            next(innerValue) {
              observer.next(innerValue);
            },
            error(e) {
              observer.error(e);
            },
            complete() {
              const i = subscriptions.indexOf(inner);
              if (i >= 0)
                subscriptions.splice(i, 1);
              completeIfDone();
            }
          });
          subscriptions.push(inner);
        },
        error(e) {
          observer.error(e);
        },
        complete() {
          completeIfDone();
        }
      });
      function completeIfDone() {
        if (outer.closed && subscriptions.length === 0) {
          observer.complete();
        }
      }
      return () => {
        subscriptions.forEach((s) => s.unsubscribe());
        outer.unsubscribe();
      };
    });
  }
  [SymbolObservable]() {
    return this;
  }
  static from(x) {
    const C = typeof this === "function" ? this : Observable;
    if (x == null) {
      throw new TypeError(x + " is not an object");
    }
    const observableMethod = getMethod(x, SymbolObservable);
    if (observableMethod) {
      const observable2 = observableMethod.call(x);
      if (Object(observable2) !== observable2) {
        throw new TypeError(observable2 + " is not an object");
      }
      if (isObservable(observable2) && observable2.constructor === C) {
        return observable2;
      }
      return new C((observer) => observable2.subscribe(observer));
    }
    if (hasSymbol("iterator")) {
      const iteratorMethod = getMethod(x, SymbolIterator);
      if (iteratorMethod) {
        return new C((observer) => {
          enqueue(() => {
            if (observer.closed)
              return;
            for (const item of iteratorMethod.call(x)) {
              observer.next(item);
              if (observer.closed)
                return;
            }
            observer.complete();
          });
        });
      }
    }
    if (Array.isArray(x)) {
      return new C((observer) => {
        enqueue(() => {
          if (observer.closed)
            return;
          for (const item of x) {
            observer.next(item);
            if (observer.closed)
              return;
          }
          observer.complete();
        });
      });
    }
    throw new TypeError(x + " is not observable");
  }
  static of(...items) {
    const C = typeof this === "function" ? this : Observable;
    return new C((observer) => {
      enqueue(() => {
        if (observer.closed)
          return;
        for (const item of items) {
          observer.next(item);
          if (observer.closed)
            return;
        }
        observer.complete();
      });
    });
  }
  static get [SymbolSpecies]() {
    return this;
  }
}
if (hasSymbols()) {
  Object.defineProperty(Observable, Symbol("extensions"), {
    value: {
      symbol: SymbolObservable,
      hostReportError
    },
    configurable: true
  });
}
function unsubscribe(subscription) {
  if (typeof subscription === "function") {
    subscription();
  } else if (subscription && typeof subscription.unsubscribe === "function") {
    subscription.unsubscribe();
  }
}
var __awaiter$1 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function filter(test) {
  return (observable2) => {
    return new Observable((observer) => {
      const scheduler = new AsyncSerialScheduler(observer);
      const subscription = observable2.subscribe({
        complete() {
          scheduler.complete();
        },
        error(error) {
          scheduler.error(error);
        },
        next(input) {
          scheduler.schedule((next) => __awaiter$1(this, void 0, void 0, function* () {
            if (yield test(input)) {
              next(input);
            }
          }));
        }
      });
      return () => unsubscribe(subscription);
    });
  };
}
function isAsyncIterator(thing) {
  return thing && hasSymbol("asyncIterator") && thing[Symbol.asyncIterator];
}
function isIterator(thing) {
  return thing && hasSymbol("iterator") && thing[Symbol.iterator];
}
var __awaiter$2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __asyncValues = function(o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({value: v2, done: d});
    }, reject);
  }
};
function flatMap(mapper) {
  return (observable2) => {
    return new Observable((observer) => {
      const scheduler = new AsyncSerialScheduler(observer);
      const subscription = observable2.subscribe({
        complete() {
          scheduler.complete();
        },
        error(error) {
          scheduler.error(error);
        },
        next(input) {
          scheduler.schedule((next) => __awaiter$2(this, void 0, void 0, function* () {
            var e_1, _a;
            const mapped = yield mapper(input);
            if (isIterator(mapped) || isAsyncIterator(mapped)) {
              try {
                for (var mapped_1 = __asyncValues(mapped), mapped_1_1; mapped_1_1 = yield mapped_1.next(), !mapped_1_1.done; ) {
                  const element = mapped_1_1.value;
                  next(element);
                }
              } catch (e_1_1) {
                e_1 = {error: e_1_1};
              } finally {
                try {
                  if (mapped_1_1 && !mapped_1_1.done && (_a = mapped_1.return))
                    yield _a.call(mapped_1);
                } finally {
                  if (e_1)
                    throw e_1.error;
                }
              }
            } else {
              mapped.map((output) => next(output));
            }
          }));
        }
      });
      return () => unsubscribe(subscription);
    });
  };
}
function interval(period) {
  return new Observable((observer) => {
    let counter = 0;
    const handle = setInterval(() => {
      observer.next(counter++);
    }, period);
    return () => clearInterval(handle);
  });
}
var __awaiter$3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function map(mapper) {
  return (observable2) => {
    return new Observable((observer) => {
      const scheduler = new AsyncSerialScheduler(observer);
      const subscription = observable2.subscribe({
        complete() {
          scheduler.complete();
        },
        error(error) {
          scheduler.error(error);
        },
        next(input) {
          scheduler.schedule((next) => __awaiter$3(this, void 0, void 0, function* () {
            const mapped = yield mapper(input);
            next(mapped);
          }));
        }
      });
      return () => unsubscribe(subscription);
    });
  };
}
function merge(...observables) {
  if (observables.length === 0) {
    return Observable.from([]);
  }
  return new Observable((observer) => {
    let completed = 0;
    const subscriptions = observables.map((input) => {
      return input.subscribe({
        error(error) {
          observer.error(error);
          unsubscribeAll();
        },
        next(value) {
          observer.next(value);
        },
        complete() {
          if (++completed === observables.length) {
            observer.complete();
            unsubscribeAll();
          }
        }
      });
    });
    const unsubscribeAll = () => {
      subscriptions.forEach((subscription) => unsubscribe(subscription));
    };
    return unsubscribeAll;
  });
}
class MulticastSubject extends Observable {
  constructor() {
    super((observer) => {
      this._observers.add(observer);
      return () => this._observers.delete(observer);
    });
    this._observers = new Set();
  }
  next(value) {
    for (const observer of this._observers) {
      observer.next(value);
    }
  }
  error(error) {
    for (const observer of this._observers) {
      observer.error(error);
    }
  }
  complete() {
    for (const observer of this._observers) {
      observer.complete();
    }
  }
}
function multicast(coldObservable) {
  const subject = new MulticastSubject();
  let sourceSubscription;
  let subscriberCount = 0;
  return new Observable((observer) => {
    if (!sourceSubscription) {
      sourceSubscription = coldObservable.subscribe(subject);
    }
    const subscription = subject.subscribe(observer);
    subscriberCount++;
    return () => {
      subscriberCount--;
      subscription.unsubscribe();
      if (subscriberCount === 0) {
        unsubscribe(sourceSubscription);
        sourceSubscription = void 0;
      }
    };
  });
}
var __awaiter$4 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function scan(accumulator, seed) {
  return (observable2) => {
    return new Observable((observer) => {
      let accumulated;
      let index = 0;
      const scheduler = new AsyncSerialScheduler(observer);
      const subscription = observable2.subscribe({
        complete() {
          scheduler.complete();
        },
        error(error) {
          scheduler.error(error);
        },
        next(value) {
          scheduler.schedule((next) => __awaiter$4(this, void 0, void 0, function* () {
            const prevAcc = index === 0 ? typeof seed === "undefined" ? value : seed : accumulated;
            accumulated = yield accumulator(prevAcc, value, index++);
            next(accumulated);
          }));
        }
      });
      return () => unsubscribe(subscription);
    });
  };
}
var dist_esm = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  filter,
  flatMap,
  interval,
  map,
  merge,
  multicast,
  Observable,
  scan,
  Subject: MulticastSubject,
  unsubscribe
});
var observable = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.Subject = exports.Observable = void 0;
  Object.defineProperty(exports, "Observable", {enumerable: true, get: function() {
    return dist_esm.Observable;
  }});
  const $observers = Symbol("observers");
  class Subject2 extends dist_esm.Observable {
    constructor() {
      super((observer) => {
        this[$observers] = [
          ...this[$observers] || [],
          observer
        ];
        const unsubscribe2 = () => {
          this[$observers] = this[$observers].filter((someObserver) => someObserver !== observer);
        };
        return unsubscribe2;
      });
      this[$observers] = [];
    }
    complete() {
      this[$observers].forEach((observer) => observer.complete());
    }
    error(error) {
      this[$observers].forEach((observer) => observer.error(error));
    }
    next(value) {
      this[$observers].forEach((observer) => observer.next(value));
    }
  }
  exports.Subject = Subject2;
});
var Observables = /* @__PURE__ */ getDefaultExportFromCjs(observable);
const Observable$1 = Observables.Observable;
const Subject = Observables.Subject;
export {Observable$1 as Observable, Subject};
