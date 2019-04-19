"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fs_1 = require("fs");
var Message = /** @class */ (function () {
    function Message(value) {
        this.value = value;
    }
    Message.none = new Message(null);
    return Message;
}());
exports.Message = Message;
// class Concatenate implements Filter{
//     constructor(public readonly a: Filter, public readonly b: Filter) { }
//     do(): Message {
//         return new Message(this.a.do().value.toString() + this.b.do().value.toString())
//     }
// }
// class ConstantString implements Filter {
//     constructor(public readonly c: string) {}
//     do(): Message {
//         return new Message(this.c)
//     }
// }
var ToUpperCase = /** @class */ (function () {
    function ToUpperCase(f) {
        this.f = f;
    }
    ToUpperCase.prototype.next = function () {
        return new Message(this.f.next().value.toUpperCase());
    };
    ToUpperCase.prototype.hasNext = function () {
        return this.f.hasNext();
    };
    return ToUpperCase;
}());
var Writer = /** @class */ (function () {
    function Writer(f) {
        this.f = f;
    }
    Writer.prototype.next = function () {
        console.log(this.f.next().value.toString());
        return Message.none;
    };
    Writer.prototype.hasNext = function () {
        return this.f.hasNext();
    };
    return Writer;
}());
var FileLineReader = /** @class */ (function () {
    function FileLineReader(fileName) {
        this.fileName = fileName;
        this.lines = fs_1.readFileSync(fileName, 'utf-8').split('\n');
    }
    FileLineReader.prototype.next = function () {
        return new Message(this.lines.shift());
    };
    FileLineReader.prototype.hasNext = function () {
        return this.lines.length > 0;
    };
    return FileLineReader;
}());
var SlowFileLineReader = /** @class */ (function (_super) {
    __extends(SlowFileLineReader, _super);
    function SlowFileLineReader(fileName) {
        var _this = _super.call(this, fileName) || this;
        _this.fileName = fileName;
        return _this;
    }
    SlowFileLineReader.prototype.delay = function (millis) {
        var date = new Date();
        var curDate = null;
        do {
            curDate = new Date();
        } while (curDate.getTime() - date.getTime() < millis);
    };
    SlowFileLineReader.prototype.next = function () {
        this.delay(2000);
        return new Message(this.lines.shift());
    };
    return SlowFileLineReader;
}(FileLineReader));
var Join = /** @class */ (function () {
    function Join() {
        var fs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fs[_i] = arguments[_i];
        }
        this.currentFilter = 0;
        this.fs = fs;
    }
    Join.prototype.next = function () {
        var f = this.fs[this.currentFilter];
        this.currentFilter = (this.currentFilter + 1) % this.fs.length;
        if (f.hasNext())
            return f.next();
        else
            return this.next();
    };
    Join.prototype.hasNext = function () {
        return this.fs.filter(function (f) { return f.hasNext(); }).length > 0;
    };
    return Join;
}());
function iterate(f) {
    while (f.hasNext()) {
        f.next();
    }
}
// const f1 = new SlowFileLineReader('./best15.txt')
// const f2 = new FileLineReader('./best-mieic.txt')
// const r1 = new Writer(new ToUpperCase(new Join(f1, f2)))
// iterate(r1)
setInterval(function () { }, 1000); // run program until explicit exit
var Publisher = /** @class */ (function () {
    function Publisher(name) {
        this.name = name;
    }
    Publisher.prototype.add = function (queue, msg) {
        queue.enqueue(msg);
        console.log("Publisher %s is adding message %s to queue...", this.name, msg.value);
    };
    return Publisher;
}());
var Subscriber = /** @class */ (function () {
    function Subscriber(name) {
        this.name = name;
    }
    Subscriber.prototype.read = function (queue) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        return [4 /*yield*/, queue.dequeue()["catch"](function (err) { console.log(err); })];
                    case 1:
                        msg = _a.sent();
                        if (msg) {
                            console.log("Subscriber %s is removing message %s from queue...", this.name, msg.value); // Success!
                        }
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    //3rd Scenario
    Subscriber.prototype.receive = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Subscriber %s is receiving message %s from Ventilator...", this.name, msg.value);
                return [2 /*return*/];
            });
        });
    };
    return Subscriber;
}());
var UnboundedQueue = /** @class */ (function () {
    function UnboundedQueue() {
        this.queue = [];
        this.resolves = [];
    }
    UnboundedQueue.prototype.enqueue = function (msg) {
        if (this.resolves.length) {
            this.resolves.shift()(msg); //??
        }
        else {
            this.queue.push(msg);
        }
    };
    UnboundedQueue.prototype.dequeue = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.queue.length) {
                resolve(_this.queue.shift());
            }
            else {
                _this.resolves.push(resolve);
            }
        });
    };
    return UnboundedQueue;
}());
exports.UnboundedQueue = UnboundedQueue;
/**
 *  1st Scenario
 */
/*
(async () => {
    let queue: UnboundedQueue = new UnboundedQueue();
    let p1: Publisher = new Publisher("P1");
    let s1: Subscriber = new Subscriber("S1");

    s1.read(queue);
    
    for(let i = 0; i < 5; i++)
        p1.add(queue, new Message("ola " + i));
    
    // By exiting the process immediately, the subscriber won't have enough time to read messages.
    // process.exit();
})();
*/
/**
 *  End of 1st Scenario
 */
/**
 *  2nd Scenario
 */
/*
(async () => {
    let queue: UnboundedQueue = new UnboundedQueue();
    let p1: Publisher = new Publisher("P1");
    let s1: Subscriber = new Subscriber("S1");
    let s2: Subscriber = new Subscriber("S2");

    s1.read(queue);
    s2.read(queue);

    for(let i = 0; i < 5; i++)
        p1.add(queue, new Message("ola " + i));
    
    //process.exit();
})()
*/
/**
 *  End of 2nd Scenario
 */
/**
 *  3rd Scenario
 */
var Ventilator = /** @class */ (function () {
    function Ventilator(name) {
        this.name = name;
        this.observers = [];
    }
    Ventilator.prototype.addObserver = function (ob) { this.observers.push(ob); };
    Ventilator.prototype.notifyObservers = function (msg) {
        this.observers.map(function (observer) { return observer.receive(msg); });
    };
    Ventilator.prototype.read = function (queue) {
        return __awaiter(this, void 0, void 0, function () {
            var msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        return [4 /*yield*/, queue.dequeue()["catch"](function (err) { console.log(err); })];
                    case 1:
                        msg = _a.sent();
                        if (msg) {
                            console.log("Ventilator %s is removing message %s from queue...", this.name, msg.value); // Success!
                            this.notifyObservers(msg);
                        }
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return Ventilator;
}());
(function () { return __awaiter(_this, void 0, void 0, function () {
    var queue, p1, v1, s1, s2, s3, i;
    return __generator(this, function (_a) {
        queue = new UnboundedQueue();
        p1 = new Publisher("P1");
        v1 = new Ventilator("V1");
        s1 = new Subscriber("S1");
        s2 = new Subscriber("S2");
        s3 = new Subscriber("S3");
        v1.read(queue);
        v1.addObserver(s1);
        v1.addObserver(s2);
        v1.addObserver(s3);
        for (i = 0; i < 5; i++)
            p1.add(queue, new Message("ola " + i));
        return [2 /*return*/];
    });
}); })();
/**
 *  End of 3rd Scenario
 */
/**
 * 4th Scenario
 */
/*
class Registry {
    private publishers: Publisher[] = [];
    private subscribers: Subscriber[] = [];

    constructor() {
    }

    public addUser<User>(user: User) {
        if (user.constructor.name == "Publisher")
            this.publishers.push(<Publisher><unknown> user);
        else
            this.subscribers.push(<Subscriber><unknown> user);
    }

    public getPublishers() {
        return this.publishers;
    }

    public getSubscribers() {
        return this.subscribers;
    }
}

class Broker {
    inbound: Message[];
    outbound: Message[];

    constructor(public name: string) {
    }

    public buildQueues() {
    }
}

(async () => {
    console.log("asdf");

    let registry = new Registry();

    let publishers = [new Publisher("P1"), new Publisher("P2"), new Publisher("P3")];
    let b1: Broker = new Broker("B1");
    let subscribers = [new Subscriber("S1"), new Subscriber("S2"), new Subscriber("S3")];
    
    publishers.forEach(user => {
        registry.addUser(user);
    });

   process.exit();
});
*/
/**
 * End of 4th Scenario
 */
