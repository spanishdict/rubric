const {
  replaceAll,
  assert,
  Rule,
  FunctionRule,
  MapRule,
} = require('./definitions');
const normalize = require('./normalize');

const identity = (s1, s2) => [s1, s2];
const identityRule = new FunctionRule(identity, { name: 'identity' });

const capitalization = (s1, s2) => {
  return [s1.toLowerCase(), s2.toLowerCase()];
};
const capitalizationRule = new FunctionRule(capitalization, {
  name: 'capitalization',
});

const unicodeNormalization = (s1, s2) => {
  return [normalize(s1, 'NFC'), normalize(s2, 'NFC')];
};
const unicodeNormalizationRule = new FunctionRule(unicodeNormalization, {
  name: 'unicodeNormalization',
});

const RE_ANY_WHITESPACE = /[\s]+/g;
const whitespaceDifferences = (s1, s2) => {
  return [
    s1.trim().replace(RE_ANY_WHITESPACE, ' '),
    s2.trim().replace(RE_ANY_WHITESPACE, ' '),
  ];
};
const whitespaceDifferencesRule = new FunctionRule(whitespaceDifferences, {
  name: 'whitespaceDifferences',
});

const commonCombiningDiacritics = [
  '\u0300', // grave accent
  '\u0301', // acute accent
  '\u0302', // circumflex
  '\u0303', // tilde
  '\u0308', // diaresis
  '\u0327', // cedilla
];

const diacriticsRule = new FunctionRule(
  (s1, s2) => {
    let s1prime = normalize(s1, 'NFD');
    let s2prime = normalize(s2, 'NFD');

    commonCombiningDiacritics.forEach(c => {
      s1prime = replaceAll(s1prime, c);
      s2prime = replaceAll(s2prime, c);
    });

    // FIXME: should be restored to whatever normalization they came in with.
    return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
  },
  { name: 'diacriticsRule' }
);

const wordPrefixRuleCreator = word =>
  new FunctionRule(
    (s1, s2) => {
      const regexp = new RegExp(`^${word}\\s+`);
      return [s1.replace(regexp, ''), s2.replace(regexp, '')];
    },
    { name: `wordPrefixRule '${word}'` }
  );

const en = require('./en');
const enExport = Object.keys(en).reduce((accum, k) => {
  accum[k] = Rule.from(en[k]);
  return accum;
}, {});

const es = require('./es');
const esExport = Object.keys(es).reduce((accum, k) => {
  accum[k] = Rule.from(es[k]);
  return accum;
}, {});

module.exports = {
  assert,
  Rule,
  MapRule,
  identityRule,
  en: enExport,
  es: esExport,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
  COMMON_DIACRITICS: diacriticsRule,
  wordPrefix: wordPrefixRuleCreator,
};