import crypto from 'crypto';

const generateId = () => {
    return crypto.randomUUID();
}

console.log("1: ", generateId());
console.log("2: ", generateId());
console.log("3: ", generateId());
console.log("4: ", generateId());