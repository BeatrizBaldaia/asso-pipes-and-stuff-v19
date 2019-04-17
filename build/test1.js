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
const main_1 = require("./main");
const isArraySorted = require('is-array-sorted');
function testAsyncQueueBehavior(nOps) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = new Array();
        const q = new main_1.UnboundedQueue();
        const enqueue = (m) => q.enqueue(m);
        const dequeue = () => q.dequeue();
        const promises = Array();
        let enqueues = 0;
        let dequeues = 0;
        // Do a random permutation of enqueing and dequeing
        for (let i = 0; i < nOps; i += 1) {
            if (Math.random() > 0.5) {
                enqueues += 1;
                // console.log(`${Date.now()} Enqueuing ${enqueues}`)
                enqueue(new main_1.Message(enqueues));
            }
            else {
                dequeues += 1;
                // console.log(`${Date.now()} Dequeuing`)
                promises.push(dequeue().then(v => { result.push(v.value); }));
            }
        }
        // console.log(`Total enqueues ${enqueues}; dequeues ${dequeues}`)
        const pending = Math.min(enqueues, dequeues);
        yield Promise.all(promises.slice(0, pending));
        // Length should be equal minimum between enqueues and dequeues
        const isLengthOk = pending === result.length;
        // Messages should be ordered
        const isSorted = isArraySorted(result);
        return isLengthOk && isSorted;
    });
}
setInterval(() => { }, 1000); // run program forever until an explicit exit occurs
(() => __awaiter(this, void 0, void 0, function* () {
    const success = yield testAsyncQueueBehavior(100);
    console.log(success);
    process.exit();
}))();
//# sourceMappingURL=test1.js.map