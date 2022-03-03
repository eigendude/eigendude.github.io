import {p as process} from "../common/process-2545f00a.js";
import {c as createCommonjsModule, g as getDefaultExportFromCjs, a as commonjsGlobal} from "../common/_commonjsHelpers-37fa8da4.js";
var isObservable = (value) => {
  if (!value) {
    return false;
  }
  if (typeof Symbol.observable === "symbol" && typeof value[Symbol.observable] === "function") {
    return value === value[Symbol.observable]();
  }
  if (typeof value["@@observable"] === "function") {
    return value === value["@@observable"]();
  }
  return false;
};
var serializers = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.DefaultSerializer = exports.extendSerializer = void 0;
  function extendSerializer(extend, implementation) {
    const fallbackDeserializer = extend.deserialize.bind(extend);
    const fallbackSerializer = extend.serialize.bind(extend);
    return {
      deserialize(message) {
        return implementation.deserialize(message, fallbackDeserializer);
      },
      serialize(input) {
        return implementation.serialize(input, fallbackSerializer);
      }
    };
  }
  exports.extendSerializer = extendSerializer;
  const DefaultErrorSerializer = {
    deserialize(message) {
      return Object.assign(Error(message.message), {
        name: message.name,
        stack: message.stack
      });
    },
    serialize(error) {
      return {
        __error_marker: "$$error",
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    }
  };
  const isSerializedError = (thing) => thing && typeof thing === "object" && "__error_marker" in thing && thing.__error_marker === "$$error";
  exports.DefaultSerializer = {
    deserialize(message) {
      if (isSerializedError(message)) {
        return DefaultErrorSerializer.deserialize(message);
      } else {
        return message;
      }
    },
    serialize(input) {
      if (input instanceof Error) {
        return DefaultErrorSerializer.serialize(input);
      } else {
        return input;
      }
    }
  };
});
var common = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.serialize = exports.deserialize = exports.registerSerializer = void 0;
  let registeredSerializer = serializers.DefaultSerializer;
  function registerSerializer2(serializer) {
    registeredSerializer = serializers.extendSerializer(registeredSerializer, serializer);
  }
  exports.registerSerializer = registerSerializer2;
  function deserialize(message) {
    return registeredSerializer.deserialize(message);
  }
  exports.deserialize = deserialize;
  function serialize(input) {
    return registeredSerializer.serialize(input);
  }
  exports.serialize = serialize;
});
var symbols = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.$worker = exports.$transferable = exports.$terminate = exports.$events = exports.$errors = void 0;
  exports.$errors = Symbol("thread.errors");
  exports.$events = Symbol("thread.events");
  exports.$terminate = Symbol("thread.terminate");
  exports.$transferable = Symbol("thread.transferable");
  exports.$worker = Symbol("thread.worker");
});
var transferable = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.Transfer = exports.isTransferDescriptor = void 0;
  function isTransferable(thing) {
    if (!thing || typeof thing !== "object")
      return false;
    return true;
  }
  function isTransferDescriptor(thing) {
    return thing && typeof thing === "object" && thing[symbols.$transferable];
  }
  exports.isTransferDescriptor = isTransferDescriptor;
  function Transfer2(payload, transferables) {
    if (!transferables) {
      if (!isTransferable(payload))
        throw Error();
      transferables = [payload];
    }
    return {
      [symbols.$transferable]: true,
      send: payload,
      transferables
    };
  }
  exports.Transfer = Transfer2;
});
var messages = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.WorkerMessageType = exports.MasterMessageType = void 0;
  (function(MasterMessageType) {
    MasterMessageType["cancel"] = "cancel";
    MasterMessageType["run"] = "run";
  })(exports.MasterMessageType || (exports.MasterMessageType = {}));
  (function(WorkerMessageType) {
    WorkerMessageType["error"] = "error";
    WorkerMessageType["init"] = "init";
    WorkerMessageType["result"] = "result";
    WorkerMessageType["running"] = "running";
    WorkerMessageType["uncaughtError"] = "uncaughtError";
  })(exports.WorkerMessageType || (exports.WorkerMessageType = {}));
});
var implementation_browser = createCommonjsModule(function(module, exports) {
  Object.defineProperty(exports, "__esModule", {value: true});
  const isWorkerRuntime = function isWorkerRuntime2() {
    const isWindowContext = typeof self !== "undefined" && typeof Window !== "undefined" && self instanceof Window;
    return typeof self !== "undefined" && self.postMessage && !isWindowContext ? true : false;
  };
  const postMessageToMaster = function postMessageToMaster2(data, transferList) {
    self.postMessage(data, transferList);
  };
  const subscribeToMasterMessages = function subscribeToMasterMessages2(onMessage) {
    const messageHandler = (messageEvent) => {
      onMessage(messageEvent.data);
    };
    const unsubscribe = () => {
      self.removeEventListener("message", messageHandler);
    };
    self.addEventListener("message", messageHandler);
    return unsubscribe;
  };
  exports.default = {
    isWorkerRuntime,
    postMessageToMaster,
    subscribeToMasterMessages
  };
});
var worker = createCommonjsModule(function(module, exports) {
  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
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
  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.expose = exports.isWorkerRuntime = exports.Transfer = exports.registerSerializer = void 0;
  const is_observable_1 = __importDefault(isObservable);
  const implementation_1 = __importDefault(implementation_browser);
  var common_2 = common;
  Object.defineProperty(exports, "registerSerializer", {enumerable: true, get: function() {
    return common_2.registerSerializer;
  }});
  var transferable_2 = transferable;
  Object.defineProperty(exports, "Transfer", {enumerable: true, get: function() {
    return transferable_2.Transfer;
  }});
  exports.isWorkerRuntime = implementation_1.default.isWorkerRuntime;
  let exposeCalled = false;
  const activeSubscriptions = new Map();
  const isMasterJobCancelMessage = (thing) => thing && thing.type === messages.MasterMessageType.cancel;
  const isMasterJobRunMessage = (thing) => thing && thing.type === messages.MasterMessageType.run;
  const isObservable$1 = (thing) => is_observable_1.default(thing) || isZenObservable(thing);
  function isZenObservable(thing) {
    return thing && typeof thing === "object" && typeof thing.subscribe === "function";
  }
  function deconstructTransfer(thing) {
    return transferable.isTransferDescriptor(thing) ? {payload: thing.send, transferables: thing.transferables} : {payload: thing, transferables: void 0};
  }
  function postFunctionInitMessage() {
    const initMessage = {
      type: messages.WorkerMessageType.init,
      exposed: {
        type: "function"
      }
    };
    implementation_1.default.postMessageToMaster(initMessage);
  }
  function postModuleInitMessage(methodNames) {
    const initMessage = {
      type: messages.WorkerMessageType.init,
      exposed: {
        type: "module",
        methods: methodNames
      }
    };
    implementation_1.default.postMessageToMaster(initMessage);
  }
  function postJobErrorMessage(uid, rawError) {
    const {payload: error, transferables} = deconstructTransfer(rawError);
    const errorMessage = {
      type: messages.WorkerMessageType.error,
      uid,
      error: common.serialize(error)
    };
    implementation_1.default.postMessageToMaster(errorMessage, transferables);
  }
  function postJobResultMessage(uid, completed, resultValue) {
    const {payload, transferables} = deconstructTransfer(resultValue);
    const resultMessage = {
      type: messages.WorkerMessageType.result,
      uid,
      complete: completed ? true : void 0,
      payload
    };
    implementation_1.default.postMessageToMaster(resultMessage, transferables);
  }
  function postJobStartMessage(uid, resultType) {
    const startMessage = {
      type: messages.WorkerMessageType.running,
      uid,
      resultType
    };
    implementation_1.default.postMessageToMaster(startMessage);
  }
  function postUncaughtErrorMessage(error) {
    try {
      const errorMessage = {
        type: messages.WorkerMessageType.uncaughtError,
        error: common.serialize(error)
      };
      implementation_1.default.postMessageToMaster(errorMessage);
    } catch (subError) {
      console.error("Not reporting uncaught error back to master thread as it occured while reporting an uncaught error already.\nLatest error:", subError, "\nOriginal error:", error);
    }
  }
  function runFunction(jobUID, fn, args) {
    return __awaiter(this, void 0, void 0, function* () {
      let syncResult;
      try {
        syncResult = fn(...args);
      } catch (error) {
        return postJobErrorMessage(jobUID, error);
      }
      const resultType = isObservable$1(syncResult) ? "observable" : "promise";
      postJobStartMessage(jobUID, resultType);
      if (isObservable$1(syncResult)) {
        const subscription = syncResult.subscribe((value) => postJobResultMessage(jobUID, false, common.serialize(value)), (error) => {
          postJobErrorMessage(jobUID, common.serialize(error));
          activeSubscriptions.delete(jobUID);
        }, () => {
          postJobResultMessage(jobUID, true);
          activeSubscriptions.delete(jobUID);
        });
        activeSubscriptions.set(jobUID, subscription);
      } else {
        try {
          const result = yield syncResult;
          postJobResultMessage(jobUID, true, common.serialize(result));
        } catch (error) {
          postJobErrorMessage(jobUID, common.serialize(error));
        }
      }
    });
  }
  function expose2(exposed) {
    if (!implementation_1.default.isWorkerRuntime()) {
      throw Error("expose() called in the master thread.");
    }
    if (exposeCalled) {
      throw Error("expose() called more than once. This is not possible. Pass an object to expose() if you want to expose multiple functions.");
    }
    exposeCalled = true;
    if (typeof exposed === "function") {
      implementation_1.default.subscribeToMasterMessages((messageData) => {
        if (isMasterJobRunMessage(messageData) && !messageData.method) {
          runFunction(messageData.uid, exposed, messageData.args.map(common.deserialize));
        }
      });
      postFunctionInitMessage();
    } else if (typeof exposed === "object" && exposed) {
      implementation_1.default.subscribeToMasterMessages((messageData) => {
        if (isMasterJobRunMessage(messageData) && messageData.method) {
          runFunction(messageData.uid, exposed[messageData.method], messageData.args.map(common.deserialize));
        }
      });
      const methodNames = Object.keys(exposed).filter((key) => typeof exposed[key] === "function");
      postModuleInitMessage(methodNames);
    } else {
      throw Error(`Invalid argument passed to expose(). Expected a function or an object, got: ${exposed}`);
    }
    implementation_1.default.subscribeToMasterMessages((messageData) => {
      if (isMasterJobCancelMessage(messageData)) {
        const jobUID = messageData.uid;
        const subscription = activeSubscriptions.get(jobUID);
        if (subscription) {
          subscription.unsubscribe();
          activeSubscriptions.delete(jobUID);
        }
      }
    });
  }
  exports.expose = expose2;
  if (typeof self !== "undefined" && typeof self.addEventListener === "function" && implementation_1.default.isWorkerRuntime()) {
    self.addEventListener("error", (event) => {
      setTimeout(() => postUncaughtErrorMessage(event.error || event), 250);
    });
    self.addEventListener("unhandledrejection", (event) => {
      const error = event.reason;
      if (error && typeof error.message === "string") {
        setTimeout(() => postUncaughtErrorMessage(error), 250);
      }
    });
  }
  if (typeof process !== "undefined" && typeof process.on === "function" && implementation_1.default.isWorkerRuntime()) {
    process.on("uncaughtException", (error) => {
      setTimeout(() => postUncaughtErrorMessage(error), 250);
    });
    process.on("unhandledRejection", (error) => {
      if (error && typeof error.message === "string") {
        setTimeout(() => postUncaughtErrorMessage(error), 250);
      }
    });
  }
});
var WorkerContext = /* @__PURE__ */ getDefaultExportFromCjs(worker);
const expose = WorkerContext.expose;
const registerSerializer = WorkerContext.registerSerializer;
const Transfer = WorkerContext.Transfer;
export {expose};
