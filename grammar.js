module.exports = grammar({
  name: "scheme",

  rules: {
    // Programs.  A program consists of a seq of definitions and expressions.
    program: ($) => repeat($.form),
    form: ($) => choice($.definition, $.expression),

    // Definitions
    definition: ($) =>
      choice(
        $.variable_definition,
        // $.syntax_definition,
        seq("(", "begin", $.definition, ")"),
      ),

    variable_definition: ($) =>
      choice(
        seq("(", "define", $.variable, $.expression, ")"),
        seq("(", "define", "(", $.variable, $.variable, ")", $.body, ")"),
        seq(
          "(",
          "define",
          "(",
          $.variable,
          repeat($.variable),
          ".",
          $.variable,
          ")",
          $.body,
          ")",
        ),
        // seq(
        //   "(",
        //   "let-syntax",
        //   "(",
        //   repeat($.syntax_binding),
        //   ")",
        //   repeat($.definition),
        //   ")",
        // ),
        // seq(
        //   "(",
        //   "letrec-syntax",
        //   "(",
        //   repeat($.syntax_binding),
        //   ")",
        //   repeat($.definition),
        //   ")",
        // ),
      ),
    variable: ($) => $.identifier,
    body: ($) => seq(repeat($.definition), repeat1($.expression)),
    // syntax_definition: ($) =>
    //   seq("(", "define-syntax", $.keyword, $.transformer_expression),
    keyword: ($) => $.identifier,
    // syntax_binding: ($) =>
    //   seq(
    //     "(",
    //     $.keyword,
    //     $.transformer_expression,
    //     ")",
    //   ),

    // Expressions
    expression: ($) =>
      choice(
        $.constant,
        $.variable,
        seq("(", "quote", $.datum, ")"),
        seq("'", $.datum),
        seq("(", "lambda", $.formals, $.body, ")"),
        seq("(", "if", $.expression, $.expression, $.expression, ")"),
        seq("(", "if", $.expression, $.expression, ")"),
        seq("(", "set!", $.variable, $.expression, ")"),
        $.application,
        // seq(
        //   "(",
        //   "let-syntax",
        //   "(",
        //   repeat($.syntax_binding),
        //   ")",
        //   repeat1($.expression),
        //   ")",
        // ),
        // seq(
        //   "(",
        //   "letrec-syntax",
        //   "(",
        //   repeat($.syntax_binding),
        //   ")",
        //   repeat1($.expression),
        //   ")",
        // ),
      ),
    constant: ($) => choice($.boolean, $.number, $.character, $.string),
    formals: ($) =>
      choice(
        $.variable,
        repeat($.variable),
        seq("(", repeat1($.variable), ".", $.variable, ")"),
      ),
    application: ($) => seq("(", $.expression, repeat($.expression), "\)"),

    // Identifiers
    identifier: ($) => seq($.initial, choice(repeat($.subsequent), "+", "-")),
    initial: ($) =>
      choice(
        $.letter,
        "!",
        "$",
        "%",
        "&",
        "*",
        "/",
        ":",
        "<",
        "=",
        ">",
        "?",
        "~",
        "_",
        "^",
      ),
    subsequent: ($) => choice($.initial, $.digit, ".", "+", "-", "@"),
    letter: (_$) => /[a-z]/,
    digit: (_$) => /\d/,
    empty: (_$) => '""',

    // Data
    datum: ($) =>
      choice(
        $.boolean,
        $.number,
        $.character,
        $.string,
        $.symbol,
        $.list,
        $.vector,
      ),
    boolean: (_$) => choice("#t", "#f"),
    // number: ($) => choice($.num2, $.num8, $.num10, $.num16),
    number: ($) => $.num10,
    character: ($) =>
      choice(
        seq("\#", $.string_character),
        "#\newline",
        "#\space",
      ),
    string: ($) => seq('"', repeat($.string_character), '"'),
    string_character: (_$) => choice('"', "\\", /[^"\\]/),
    symbol: ($) => $.identifier,
    list: ($) =>
      choice(
        seq("(", repeat($.datum), ")"),
        seq("(", repeat1($.datum), ".", $.datum, ")"),
        $.abbreviation,
      ),
    abbreviation: ($) =>
      choice(
        seq("'", $.datum),
        seq("`", $.datum),
        seq(",", $.datum),
        seq(",", "@", $.datum),
      ),
    vector: ($) => seq("#", "(", repeat($.datum), ")"),

    // Numbers
    num10: ($) => seq($.prefix10, $.complex10),
    complex10: ($) =>
      choice(
        $.real10,
        seq($.real10, "@", $.real10),
        seq($.real10, "+", $.imag10),
        seq($.real10, "-", $.imag10),
        seq("+", $.imag10),
        seq("-", $.imag10),
      ),
    imag10: ($) =>
      choice(
        "i",
        seq($.unreal10, "i"),
      ),
    real10: ($) => seq($.sign, $.unreal10),
    unreal10: ($) =>
      choice(
        $.uinteger10,
        seq($.uinteger10, "/", $.uinteger10),
        $.decimal10,
      ),
    uinteger10: ($) =>
      seq(
        repeat1($.digit),
        repeat("#"),
      ),
    prefix10: ($) =>
      choice(
        seq($.radix10, $.exactness),
        seq($.exactness, $.radix10),
      ),

    decimal10: ($) =>
      choice(
        seq($.uinteger10, $.exponent),
        seq(".", repeat1($.digit10), repeat("#"), $.suffix),
        seq(
          repeat1($.digit10),
          ".",
          repeat($.digit10),
          repeat("#"),
          $.suffix,
        ),
        seq(repeat1($.digit10), repeat1("#"), ".", repeat("#"), $.suffix),
      ),
    suffix: ($) => choice($.empty, $.exponent),
    exponent: ($) => seq($.exponent_marker, $.sign, repeat1($.digit10)),
    exponent_marker: (_$) => choice("e", "s", "f", "d", "l"),
    sign: ($) => choice($.empty, "+", "-"),
    exactness: ($) => choice($.empty, "#i", "#e"),
    radix2: (_$) => "#b",
    radix8: (_$) => "#o",
    radix10: ($) => choice($.empty, "#d"),
    radix16: (_$) => "#x",
    digit2: (_$) => /[01]/,
    digit8: (_$) => /[0-7]/,
    digit10: ($) => $.digit,
    digit16: ($) =>
      choice(
        $.digit,
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
      ),
  },
});
