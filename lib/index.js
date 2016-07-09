'use strict';

const CreditCard = require('./CreditCard.js');

const instance = new CreditCard();

instance.addType({
    names: [ 'VISA', 'vc', 'VC', 'visa' ],
    cardPattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
    partialPattern: /^4/,
    iinLength: 7,
    cvvPattern: /^\d{3}$/,
    checkLuhn: true
});

instance.addType({
    names: [ 'MASTERCARD', 'mc', 'MC', 'mastercard', 'master card', 'MASTER CARD' ],
    cardPattern: /^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[0-1][0-9]|2720)[0-9]{12}$/,
    partialPattern: /^(?:5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[0-1][0-9]|2720)/,
    iinLength: 7,
    cvvPattern: /^\d{3}$/,
    checkLuhn: true
});

instance.addType({
    names: [ 'AMERICANEXPRESS', 'ae', 'AE', 'ax', 'AX', 'amex', 'AMEX', 'american express', 'AMERICAN EXPRESS' ],
    cardPattern: /^3[47][0-9]{13}$/,
    partialPattern: /^3[47]/,
    iinLength: 7,
    cvvPattern: /^\d{4}$/,
    checkLuhn: true
});

instance.addType({
    names: [ 'DINERSCLUB', 'dinersclub' ],
    cardPattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    partialPattern: /^3(0[0-5]|[68])/,
    iinLength: 7,
    cvvPattern: /^\d{3}$/,
    checkLuhn: true
});

instance.addType({
    names: [ 'DISCOVER', 'dc', 'DC', 'discover' ],
    cardPattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    partialPattern: /^6(011|5[0-9])/,
    iinLength: 7,
    cvvPattern: /^\d{3}$/,
    checkLuhn: true
});

instance.addType({
    names: [ 'JCB', 'jcb' ],
    cardPattern: /^(?:2131|1800|35\d{3})\d{11}$/,
    partialPattern: /^(2131|1800|35)/,
    iinLength: 7,
    cvvPattern: /^\d{3}$/,
    checkLuhn: true
});


module.exports = instance;
