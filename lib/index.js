'use strict';

let _defaults = {
  cardTypes: [
    {
      names: [ 'VISA', 'vc', 'VC', 'visa' ],
      cardPattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
      partialPattern: /^4/,
      iinLength: 7,
      cvvPattern: /^\d{3}$/
    },
    {
      names: [ 'MASTERCARD', 'mc', 'MC', 'mastercard', 'master card', 'MASTER CARD' ],
      cardPattern: /^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[0-1][0-9]|2720)[0-9]{12}$/,
      partialPattern: /^(?:5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[0-1][0-9]|2720)/,
      iinLength: 7,
      cvvPattern: /^\d{3}$/
    },
    {
      names: [ 'AMERICANEXPRESS', 'ae', 'AE', 'ax', 'AX', 'amex', 'AMEX', 'american express', 'AMERICAN EXPRESS' ],
      cardPattern: /^3[47][0-9]{13}$/,
      partialPattern: /^3[47]/,
      iinLength: 7,
      cvvPattern: /^\d{4}$/
    },
    {
      names: [ 'DINERSCLUB', 'dinersclub' ],
      cardPattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      partialPattern: /^3(0[0-5]|[68])/,
      iinLength: 7,
      cvvPattern: /^\d{3}$/
    },
    {
      names: [ 'DISCOVER', 'dc', 'DC', 'discover' ],
      cardPattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      partialPattern: /^6(011|5[0-9])/,
      iinLength: 7,
      cvvPattern: /^\d{3}$/
    },
    {
      names: [ 'JCB', 'jcb' ],
      cardPattern: /^(?:2131|1800|35\d{3})\d{11}$/,
      partialPattern: /^(2131|1800|35)/,
      iinLength: 7,
      cvvPattern: /^\d{3}$/
    }
  ],
  expiryMonths: {
    min: 1,
    max: 12
  },
  expiryYears: {
    min: 1900,
    max: 2200
  }
};

// Store original defaults. This must happen after aliases are setup
const _originalDefaults = Object.assign({}, _defaults);

function getCardTypeByName (name, options) {
  const settings = Object.assign({}, _defaults, options);
  const cardTypes = settings.cardTypes;

  for (let i = 0; i < cardTypes.length; ++i) {
    const cardType = cardTypes[i];

    if (cardType.names.indexOf(name) >= 0) {
      return cardType;
    }
  }

  return null;
}

function validate (card, options) {
  card = card || {};

  const settings = Object.assign({}, _defaults, options);
  const cardType = card.cardType;
  const number = sanitizeNumberString(card.number);
  const expiryMonth = card.expiryMonth;
  const expiryYear = card.expiryYear;
  const cvv = sanitizeNumberString(card.cvv);
  const customValidationFn = settings.customValidation;
  let customValidation;

  // Optional custom validation
  if (typeof customValidationFn === 'function') {
    customValidation = customValidationFn(card, settings);
  }

  return {
    card,
    iin: extractIin(number),
    validCardNumber: isValidCardNumber(number, cardType, settings.cardTypes),
    validExpiryMonth: isValidExpiryMonth(expiryMonth, settings.expiryMonths),
    validExpiryYear: isValidExpiryYear(expiryYear, settings.expiryYears),
    validCvv: doesCvvMatchType(cvv, cardType, settings.cardTypes),
    isExpired: isExpired(expiryMonth, expiryYear),
    customValidation
  };
}

function determineCardType (number, options) {
  const settings = Object.assign({}, _defaults, options);
  const cardTypes = settings.cardTypes;

  number = sanitizeNumberString(number);

  for (let i = 0; i < cardTypes.length; ++i) {
    const cardType = cardTypes[i];

    if (cardType.cardPattern.test(number) ||
        (settings.allowPartial === true && cardType.partialPattern.test(number))) {
      return cardType.names[0];
    }
  }

  return null;
}

function extractIin (number, options) {
  const settings = Object.assign({}, _defaults, options);
  const cardTypes = settings.cardTypes;
  const keys = Object.keys(cardTypes);

  number = sanitizeNumberString(number);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const type = cardTypes[key];

    if (type.cardPattern.test(number) ||
        (settings.allowPartial === true && type.partialPattern.test(number))) {
      return number.substring(0, type.iinLength);
    }
  }

  return null;
}

function isValidCardNumber (number, type, options) {
  return doesNumberMatchType(number, type, options) && luhn(number);
}

function isValidExpiryMonth (month, options) {
  const settings = Object.assign({}, _defaults.expiryMonths, options);

  if (typeof month === 'string' && month.length > 2) {
    return false;
  }

  month = ~~month;
  return month >= settings.min && month <= settings.max;
}

function isValidExpiryYear (year, options) {
  const settings = Object.assign({}, _defaults.expiryYears, options);

  if (typeof year === 'string' && year.length !== 4) {
    return false;
  }

  year = ~~year;
  return year >= settings.min && year <= settings.max;
}

function doesNumberMatchType (number, type, options) {
  const cardType = getCardTypeByName(type, options);

  if (!cardType) {
    return false;
  }

  return cardType.cardPattern.test(number);
}

function doesCvvMatchType (number, type, options) {
  const cardType = getCardTypeByName(type, options);

  if (!cardType) {
    return false;
  }

  return cardType.cvvPattern.test(number);
}

function isExpired (month, year) {
  month = ~~month;
  year = ~~year;

  // Cards are good until the end of the month
  // http://stackoverflow.com/questions/54037/credit-card-expiration-dates-inclusive-or-exclusive
  const expiration = new Date(year, month);

  return Date.now() >= expiration;
}

function luhn (number) {
  // Source - https://gist.github.com/DiegoSalazar/4075533

  if (/[^\d]+/.test(number) || typeof number !== 'string' || !number) {
    return false;
  }

  let nCheck = 0;
  let bEven = false;
  let nDigit;

  for (let i = number.length - 1; i >= 0; --i) {
    nDigit = ~~number.charAt(i);

    if (bEven) {
      if ((nDigit *= 2) > 9) {
        nDigit -= 9;
      }
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return (nCheck % 10) === 0;
}

function sanitizeNumberString (number) {
  if (typeof number !== 'string') {
    return '';
  }

  return number.replace(/[^\d]/g, '');
}

function defaults (options, overwrite) {
  options = options || {};

  if (overwrite === true) {
    _defaults = Object.assign({}, options);
  } else {
    _defaults = Object.assign({}, _defaults, options);
  }

  return _defaults;
}

function reset () {
  _defaults = Object.assign({}, _originalDefaults);
  return _defaults;
}

module.exports = {
  getCardTypeByName,
  validate,
  determineCardType,
  extractIin,
  isValidCardNumber,
  isValidExpiryMonth,
  isValidExpiryYear,
  doesNumberMatchType,
  doesCvvMatchType,
  isExpired,
  luhn,
  sanitizeNumberString,
  defaults,
  reset
};
