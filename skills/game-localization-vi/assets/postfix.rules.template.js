// Consistency rules for one game. Copy to WORK/postfix.rules.js and fill from `node postfix.js --report`
// and from the cross-batch decisions collected in followups.txt. Keep rules narrow: many report hits are
// legitimate uses of a word. Every changed line is re-validated; a rule that would break tags/timing is skipped.
module.exports={
  // Applied to every Vietnamese line: [RegExp, replacement]
  rules:[
    // [/<old term variant>/g, '<agreed term>'],
  ],
  // Applied only when the ENGLISH source matches the first RegExp (safer for words with several meanings)
  enRules:[
    // [/<English term>/i, [[/<drifted Vietnamese>/g, '<agreed Vietnamese>']]],
  ],
  // Exact final text for specific ids (or id prefixes), e.g. a dialogue choice that must quote another line verbatim
  overrides:{
    // '<id or id prefix>': '<exact Vietnamese>',
  },
  // `node postfix.js --report` lists Vietnamese lines matching these patterns whose English does not
  report:{
    // 'second-person "bạn" between characters': /(^|[ .,!?])[Bb]ạn( |\?|,|\.)/,
    // 'proper name in ALL CAPS': /<NAME IN CAPS>/,
  },
};
