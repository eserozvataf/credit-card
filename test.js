const cc = require('./lib/');

console.log(
    cc.validate({ number: '4987494484284090', expiryMonth: '03', expiryYear: '2020', cvv: '123' })
);
