"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Message {
    constructor(value) {
        this.value = value;
    }
}
Message.none = new Message(null);
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
class ToUpperCase {
    constructor(f) {
        this.f = f;
    }
    next() {
        return new Message(this.f.next().value.toUpperCase());
    }
    hasNext() {
        return this.f.hasNext();
    }
}
class Writer {
    constructor(f) {
        this.f = f;
    }
    next() {
        console.log(this.f.next().value.toString());
        return Message.none;
    }
    hasNext() {
        return this.f.hasNext();
    }
}
class FileLineReader {
    constructor(fileName) {
        this.fileName = fileName;
        this.lines = fs_1.readFileSync(fileName, 'utf-8').split('\n');
    }
    next() {
        return new Message(this.lines.shift());
    }
    hasNext() {
        return this.lines.length > 0;
    }
}
class SlowFileLineReader extends FileLineReader {
    constructor(fileName) {
        super(fileName);
        this.fileName = fileName;
    }
    delay(millis) {
        const date = new Date();
        let curDate = null;
        do {
            curDate = new Date();
        } while (curDate.getTime() - date.getTime() < millis);
    }
    next() {
        this.delay(2000);
        return new Message(this.lines.shift());
    }
}
class Join {
    constructor(...fs) {
        this.currentFilter = 0;
        this.fs = fs;
    }
    next() {
        const f = this.fs[this.currentFilter];
        this.currentFilter = (this.currentFilter + 1) % this.fs.length;
        if (f.hasNext())
            return f.next();
        else
            return this.next();
    }
    hasNext() {
        return this.fs.filter(f => f.hasNext()).length > 0;
    }
}
function iterate(f) {
    while (f.hasNext()) {
        f.next();
    }
}
// const f1 = new SlowFileLineReader('./best15.txt')
// const f2 = new FileLineReader('./best-mieic.txt')
// const r1 = new Writer(new ToUpperCase(new Join(f1, f2)))
// iterate(r1)
setInterval(() => { }, 1000); // run program until explicit exit
class Publisher {
    constructor(name) {
        this.name = name;
    }
    add(queue, msg) {
        queue.enqueue(msg);
        console.log("Publisher %s is adding message %s to queue...", this.name, msg.value);
    }
}
class Subscriber {
    constructor(name) {
        this.name = name;
    }
    read(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                let msg = yield queue.dequeue().catch((err) => { console.log(err); });
                if (msg) {
                    console.log("Subscriber %s is removing message %s from queue...", this.name, msg.value); // Success!
                }
            }
        });
    }
}
/**
 * 1st Scenario
 */
class UnboundedQueue {
    constructor() {
        this.queue = [];
        this.resolves = [];
    }
    enqueue(msg) {
        if (this.resolves.length) {
            this.resolves.shift()(msg);
        }
        else {
            this.queue.push(msg);
        }
    }
    dequeue() {
        return new Promise((resolve) => {
            if (this.queue.length) {
                resolve(this.queue.shift());
            }
            else {
                this.resolves.push(resolve);
            }
        });
    }
}
exports.UnboundedQueue = UnboundedQueue;
(() => __awaiter(this, void 0, void 0, function* () {
    let queue = new UnboundedQueue();
    let p1 = new Publisher("P1");
    let s1 = new Subscriber("S1");
    let s2 = new Subscriber("S2");
    s1.read(queue);
    s2.read(queue);
    for (let i = 0; i < 5; i++) {
        p1.add(queue, new Message("ola " + i));
    }
    //process.exit();
}))();
//# sourceMappingURL=main.js.map