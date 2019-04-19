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
    //3rd Scenario
    receive(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Subscriber %s is receiving message %s from Ventilator...", this.name, msg.value);
        });
    }
}
class UnboundedQueue {
    constructor() {
        this.queue = [];
        this.resolves = [];
    }
    enqueue(msg) {
        if (this.resolves.length) {
            this.resolves.shift()(msg); //??
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
/*

 class Ventilator {
    private observers: IObserver[] = [];
    constructor(public name: string) { }
    addObserver(ob: IObserver) { this.observers.push(ob)}
    notifyObservers(msg: Message) {
        this.observers.forEach((observer) =>  observer.receive(msg));
    }
    async read(queue: AsyncQueue<Message>) {
        while (true) {
            let msg = await queue.dequeue().catch((err) => { console.log(err); });
            if (msg) {
                console.log("Ventilator %s is removing message %s from queue...", this.name, msg.value); // Success!
                this.notifyObservers(msg);
            }
        }
    }
}

(async () => {
    let queue: UnboundedQueue = new UnboundedQueue();
    let p1: Publisher = new Publisher("P1");
    let v1: Ventilator = new Ventilator("V1");
    let s1: Subscriber = new Subscriber("S1");
    let s2: Subscriber = new Subscriber("S2");
    let s3: Subscriber = new Subscriber("S3");

    v1.read(queue);
    v1.addObserver(s1);
    v1.addObserver(s2);
    v1.addObserver(s3);
    
    for(let i = 0; i < 5; i++)
        p1.add(queue, new Message("ola " + i));
    
    //process.exit();
})()
*/
/**
 *  End of 3rd Scenario
 */
/**
 * 4th Scenario
 */
// class Registry {
//     private _publishers: Publisher[] = [];
//     private _subscribers: Subscriber[] = [];
//     constructor() {
//     }
//     public addUser<User>(user: User) {
//         if (user.constructor.name == "Publisher") 
//             this._publishers.push(<Publisher><unknown> user);
//         else
//             this._subscribers.push(<Subscriber><unknown> user);
//     }
//     public get publishers() : Publisher[] {
//         return this._publishers
//     }
//     public get subscribers() : Subscriber[] {
//         return this._subscribers
//     }
// }
// export class BoundedQueue implements BoundedAsyncQueue<Message> {
//     queue: Message[] = [];
//     inbound: Array<(value?: void | PromiseLike<void>) => void> = [];//msg a ir para a queue, mas que nao entraram porque nao havia espaco
//     outbound: Array<(value?: Message | PromiseLike<Message>) => void> = [];//pedido de leitura da queue, mas nao ocorrido porque nao havia msg
//     constructor(public size: number) { }
//     enqueue(msg: Message): Promise<void> {
//         return new Promise<void>((resolve) => { 
//             if (this.outbound.length) {
//                 this.outbound.shift()(msg);
//             } else {
//                 if (this.queue.length >= this.size) {
//                     this.inbound.push(resolve)
//                 }
//                 this.queue.push(msg);
//             }
//         });
//     }
//     dequeue(): Promise<Message> {
//         return new Promise<Message>((resolve) => {
//             if (this.queue.length) {
//                 if(this.inbound.length) {
//                     this.inbound.shift()();
//                 }
//                 resolve(this.queue.shift());
//             } else {
//                 this.outbound.push(resolve);
//             }
//         });
//     }
// }
class BoundedQueue {
    constructor(bufferSize) {
        this.bufferSize = bufferSize;
        this.data = new Array();
        this.outWaiting = new Array();
        this.inWaiting = new Array();
    }
    enqueue(message) {
        if (this.outWaiting.length > 0) {
            this.outWaiting.shift()(message);
        }
        else if (this.data.length >= this.bufferSize) {
            return new Promise((resolve, _reject) => {
                this.inWaiting.push(resolve);
                this.data.push(message);
            });
        }
        else {
            this.data.push(message);
        }
    }
    dequeue() {
        return new Promise((resolve, _reject) => {
            if (this.inWaiting.length > 0) {
                this.inWaiting.shift()();
            }
            if (this.data.length > 0) {
                resolve(this.data.shift());
            }
            else {
                this.outWaiting.push(resolve);
            }
        });
    }
}
exports.BoundedQueue = BoundedQueue;
class BrokerPublisher {
    constructor(name, queueSize) {
        this.name = name;
        this._queue = new BoundedQueue(queueSize);
    }
    get queue() {
        return this._queue;
    }
    add(msg) {
        this._queue.enqueue(msg);
        console.log("Publisher %s is adding message %s to queue...", this.name, msg.value);
    }
}
class BrokerSubscriber {
    constructor(name, queueSize) {
        this.name = name;
        this._queue = new BoundedQueue(queueSize);
    }
    get queue() {
        return this._queue;
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                let msg = yield this._queue.dequeue().catch((err) => { console.log(err); });
                if (msg) {
                    console.log("Subscriber %s is removing message %s from queue...", this.name, msg.value); // Success!
                }
            }
        });
    }
}
class Registry {
    constructor() {
        this.subscribers = {};
    }
    addPerson(subscriber) {
        this.subscribers[subscriber.name] = subscriber;
    }
    getPerson(id) {
        return this.subscribers[id];
    }
}
class Broker {
    constructor(registry) {
        this.registry = registry;
        this.subscriptions = {}; //Publisher id -> [Subscriber id, Subscriber id, ...]
    }
    register(subscriber, publisher) {
        if (publisher in this.subscriptions) {
            this.subscriptions[publisher].push(subscriber.name);
        }
        else {
            this.subscriptions[publisher] = [subscriber.name];
        }
        this.registry.addPerson(subscriber);
    }
    sendMsg(publisher, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let pubQueue = publisher.queue;
            let subQueues = publisher.name in this.subscriptions ?
                this.subscriptions[publisher.name].map(subName => this.registry.getPerson(subName).queue) : [];
            if (subQueues.length == 0) {
                console.log(publisher.name + " has no subscriber...");
                publisher.add(msg);
            }
            let allEnqueueSub = []; //Promise para enqueue que ocorrera na queue dos subscribers
            subQueues.forEach((queue) => {
                allEnqueueSub.push(queue.enqueue(msg));
            });
            //retirar da queue do publisher depois de os subscribers terem a msg na sua queue
            Promise.all(allEnqueueSub).then(_ => pubQueue.dequeue);
            //o que esta antes e a promise de que a msg vai ser tirada da queue do publisher
            //so no final da funcao e que pomos efectivamente a msg na queue do publisher
            return pubQueue.enqueue(msg);
            // public assignQueues() {
            //     this.registry.publishers.forEach(publisher => this.queues[publisher.name] = new UnboundedQueue());      // Assign a fresh queue to each publisher.
            //     this.registry.subscribers.forEach(subscriber => this.queues[subscriber.name] = new UnboundedQueue());   // Assign a fresh queue to each subscriber.
            // }
            // public enqueueMessage(publisher: Publisher, message: Message) {
            //     this.queues[publisher.name].enqueue(message);
            // }
        });
    }
}
(() => __awaiter(this, void 0, void 0, function* () {
    let registry = new Registry();
    // let publishers = [new Publisher("P1"), new Publisher("P2"), new Publisher("P3")];
    // let subscribers = [new Subscriber("S1"), new Subscriber("S2"), new Subscriber("S3")];
    // Register all users on the registry.
    // [...publishers, ...subscribers].forEach(user => registry.addUser(user));
    // Initialize the broker once the registry is completed.
    // let broker: Broker = new Broker("B1", registry);
    // Assign queues to each user.
    // broker.assignQueues();
    // Enqueue messages.
    let publisher1 = new BrokerPublisher("Pub1", 20);
    let subscriber1 = new BrokerSubscriber("Sub1", 20);
    let subscriber2 = new BrokerSubscriber("Sub2", 20);
    let broker = new Broker(registry);
    broker.register(subscriber1, publisher1.name);
    broker.register(subscriber2, publisher1.name);
    subscriber1.read();
    subscriber2.read();
    let nMsg = 40;
    while (nMsg > 0) {
        yield broker.sendMsg(publisher1, new Message(nMsg + ": ola"));
        nMsg--;
    }
    process.exit();
}))();
/**
 * End of 4th Scenario
 */
//# sourceMappingURL=main.js.map