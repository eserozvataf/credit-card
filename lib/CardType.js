'use strict';

class CardType {
    constructor(owner, values) {
        this.owner = owner;
        this.names = values.names;
        this.cardPattern = values.cardPattern;
        this.partialPattern = values.partialPattern;
        this.iinLength = values.iinLength;
        this.cvvPattern = values.cvvPattern;
        this.checkLuhn = values.checkLuhn;
        this.customValidator = values.customValidator;
    }

    checkExpiryMonth(month, options) {
        const options_ = options || this.owner.options,
            expiryMonths = options_.expiryMonths || this.owner.options.expiryMonths;

        if (typeof month === 'string' && month.length > 2) {
            return false;
        }

        const month_ = ~~month;
        if (month_ < expiryMonths.min || month_ > expiryMonths.max) {
            return false;
        }

        return true;
    }

    checkExpiryYear(year, options) {
        const options_ = options || this.owner.options,
            expiryYears = options_.expiryYears || this.owner.options.expiryYears;

        if (typeof year === 'string' && year.length !== 4) {
            return false;
        }

        const year_ = ~~year;
        if (year_ < expiryYears.min || year_ > expiryYears.max) {
            return false;
        }

        return true;
    }

    checkExpiry(month, year, options) {
        return this.checkExpiryMonth(month, options) && this.checkExpiryYear(year, options);
    }

    checkIsExpired(month, year, options) {
        const month_ = ~~month,
            year_ = ~~year,
            date = new Date(year_, month_);

        return Date.now() >= date;
    }

    checkCvv(number) {
        return this.cvvPattern.test(number);
    }

    extractIin(number) {
        return number.substring(0, this.iinLength);
    }

    luhn(number) {
        // Source - https://gist.github.com/DiegoSalazar/4075533

        if (/[^\d]+/.test(number)) {
            return false;
        }

        let nCheck = 0;
        let bEven = false;
        let nDigit;

        for (let i = number.length - 1; i >= 0; --i) {
            nDigit = ~~number.charAt(i);

            if (bEven && (nDigit *= 2) > 9) {
                nDigit -= 9;
            }

            nCheck += nDigit;
            bEven = !bEven;
        }

        return (nCheck % 10) === 0;
    }
}

module.exports = CardType;
