'use strict';

const CardType = require('./CardType.js');

class CreditCard {
    constructor() {
        this.types = [];
        this.options = {
            allowPartial: false,
            types: undefined, // all
            expiryMonths: {
                min: 1,
                max: 12
            },
            expiryYears: {
                min: 1900,
                max: 2200
            }
        };
    }

    addType(values) {
        this.types.push(new CardType(this, values));
    }

    sanitizeNumber(number) {
        return String(number).replace(/[\s]/g, '');
    }

    getTypeByName(name) {
        for (let type of this.types) {
            if (type.names.indexOf(name) >= 0) {
                return type;
            }
        }

        return null;
    }

    getTypeByNumber(number, options) {
        const options_ = options || this.options,
            allowPartial = options_.allowPartial || this.options.allowPartial,
            filterTypes = options_.types || this.options.types;

        for (let type of this.types) {
            let found = false;

            if (filterTypes !== undefined) {
                for (let filterType of filterTypes) {
                    if (type.names.indexOf(filterType) >= 0) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    continue;
                }
            }

            if ((allowPartial && type.partialPattern.test(number)) || type.cardPattern.test(number)) {
                return type;
            }
        }

        return null;
    }

    validate(card, options) {
        const number_ = this.sanitizeNumber(card.number),
            type = this.getTypeByNumber(number_, options);

        const result = {
            type: type,
            number: number_
        };

        if (type === null) {
            result.validCardNumber = false;

            return result;
        }

        result.iin = type.extractIin(number_);

        if (card.expiryMonth !== undefined) {
            result.validExpiryMonth = type.checkExpiryMonth(card.expiryMonth);
        }

        if (card.expiryYear !== undefined) {
            result.validExpiryYear = type.checkExpiryYear(card.expiryYear);
        }

        if (card.expiryMonth !== undefined && card.expiryYear !== undefined) {
            result.isExpired = type.checkIsExpired(card.expiryMonth, card.expiryYear);
        }

        if (card.cvv !== undefined) {
            result.validCvv = type.checkCvv(card.cvv);
        }

        result.validCardNumber = true;

        if (type.checkLuhn === true && !type.luhn(number_)) {
            result.validCardNumber = false;
        }

        if (type.customValidator !== undefined && !type.customValidator(card)) {
            result.validCardNumber = false;
        }

        return result;
    }
}

module.exports = CreditCard;
