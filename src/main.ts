import { readFileSync, fstat } from 'fs'
import { resolveSoa } from 'dns';
import { RSA_PKCS1_OAEP_PADDING } from 'constants';

interface Filter {
    next(): Message
    hasNext(): Boolean
}

export class Message {
    constructor(public readonly value: any) { }
    static none = new Message(null)
}

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

class ToUpperCase implements Filter {
    constructor(public readonly f: Filter) { }
    next(): Message {
        return new Message(this.f.next().value.toUpperCase())
    }

    hasNext(): Boolean {
        return this.f.hasNext()
    }
}

class Writer implements Filter {
    constructor(public readonly f: Filter) { }
    next(): Message {
        console.log(this.f.next().value.toString())
        return Message.none
    }

    hasNext(): Boolean {
        return this.f.hasNext()
    }
}

class FileLineReader implements Filter {
    lines: string[]
    constructor(public readonly fileName: string) {
        this.lines = readFileSync(fileName, 'utf-8').split('\n')
    }

    next(): Message {
        return new Message(this.lines.shift())
    }

    hasNext(): Boolean {
        return this.lines.length > 0
    }
}

class SlowFileLineReader extends FileLineReader {
    constructor(public readonly fileName: string) {
        super(fileName)
    }

    delay(millis: number) {
        const date = new Date()
        let curDate = null
        do {
            curDate = new Date()
        } while (curDate.getTime() - date.getTime() < millis)
    }

    next(): Message {
        this.delay(2000)
        return new Message(this.lines.shift())
    }
}

class Join implements Filter {
    fs: Filter[]
    currentFilter = 0

    constructor(...fs: Filter[]) {
        this.fs = fs
    }

    next(): Message {
        const f = this.fs[this.currentFilter]
        this.currentFilter = (this.currentFilter + 1) % this.fs.length
        if (f.hasNext()) return f.next()
        else return this.next()
    }

    hasNext(): Boolean {
        return this.fs.filter(f => f.hasNext()).length > 0
    }
}

function iterate(f: Filter) {
    while (f.hasNext()) {
        f.next()
    }
}

// const f1 = new SlowFileLineReader('./best15.txt')
// const f2 = new FileLineReader('./best-mieic.txt')

// const r1 = new Writer(new ToUpperCase(new Join(f1, f2)))

// iterate(r1)

setInterval(() => { }, 1000); // run program until explicit exit
/**
 * asynchronous unlimited FIFO
 * enqueue = push = add to the queue
 * dequeue = pop = remove from queue
 */
interface AsyncQueue<T> {
    enqueue(elem: T): void
    dequeue(): Promise<T>
}

interface AsyncSemaphore {
    signal(): void
    wait(): Promise<void>
}
/**
 * asynchronous bounded FIFO, that blocks enqueuing() when it's full, and blocks dequeuing() when it's empty
 */
interface BoundedAsyncQueue<T> {
    enqueue(elem: T): Promise<void>
    dequeue(): Promise<T>
}

class Publisher {
    constructor(public name: string) { }
    add(queue: AsyncQueue<Message>, msg: Message): void {
        queue.enqueue(msg);
        console.log("Publisher %s is adding message %s to queue...", this.name, msg.value);
    }
}

class Subscriber implements IObserver{
    constructor(public name: string) { }
    async read(queue: AsyncQueue<Message>) {
        while (true) {
            let msg = await queue.dequeue().catch((err) => { console.log(err); });
            if (msg) {
                console.log("Subscriber %s is removing message %s from queue...", this.name, msg.value); // Success!
            }
        }
    }
    //3rd Scenario
    async receive(msg: Message) {
        console.log("Subscriber %s is receiving message %s from Ventilator...", this.name, msg.value);
    }

}

export class UnboundedQueue implements AsyncQueue<Message> {
    queue: Message[] = [];
    resolves: Array<(value?: Message | PromiseLike<Message>) => void> = [];
    enqueue(msg: Message): void {
        if (this.resolves.length) {
            this.resolves.shift()(msg); //??
        } else {
            this.queue.push(msg);
        }
    }
    dequeue(): Promise<Message> {
        return new Promise<Message>((resolve) => {
            if (this.queue.length) {
                resolve(this.queue.shift());
            } else {
                this.resolves.push(resolve);
            }
        });
    }
}

/**
 * 1st Scenario
 */

/*(async () => {
     let queue: UnboundedQueue = new UnboundedQueue();
     let p1: Publisher = new Publisher("P1");
     let s1: Subscriber = new Subscriber("S1");
     s1.read(queue);
     for(let i = 0; i < 5; i++) {
         p1.add(queue, new Message("ola " + i));
     }
    
     //process.exit();
})()*/

/**
 * end of 1st Scenario
 */


/**
 * 2nd Scenario
 */
/*(async () => {
    let queue: UnboundedQueue = new UnboundedQueue();
    let p1: Publisher = new Publisher("P1");
    let s1: Subscriber = new Subscriber("S1");
    let s2: Subscriber = new Subscriber("S2");
    s1.read(queue);
    s2.read(queue);
    for(let i = 0; i < 5; i++) {
        p1.add(queue, new Message("ola " + i));
    }
    
    //process.exit();
})()*/

/**
 * end of 2nd Scenario
 */


 /**
 * 3rd Scenario
 */

export interface IObserver{
    receive(msg: Message):void;
}

 class Ventilator {
    private observers: IObserver[]
    constructor(public name: string) { this.observers = [] }
    addObserver(ob: IObserver) { this.observers.push(ob)}
    notifyObservers(msg: Message){
        this.observers.map((observer) =>  observer.receive(msg));
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
    for(let i = 0; i < 5; i++) {
        p1.add(queue, new Message("ola " + i));
    }
    
    //process.exit();
})()

/**
 * end of 3rd Scenario
 */

