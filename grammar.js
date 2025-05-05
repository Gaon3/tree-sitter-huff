/**
 * @file Simple Tree-Sitter parser for Huff, an EVM low level language.
 * @author Gaon3
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
module.exports = grammar({
  name: "huff",

  extras: ($) => [/\s/, $.comment],

  rules: {
    source_file: ($) => repeat(choice($.preprocessor, $.definition, $.comment)),

    definition: ($) =>
      seq(
        "#define",
        choice(
          $.interface_event,
          $.interface_function,
          $.table_definition,
          $.constant_definition,
          $.macro_definition,
        ),
      ),

    interface_function: ($) =>
      seq(
        "function",
        $.identifier,
        $.solidity_parameter_list,
        optional(repeat1($.solidity_modifier)),
        optional(seq("returns", $.solidity_parameter_list)),
      ),

    interface_event: ($) =>
      seq("event", $.identifier, $.solidity_parameter_list),

    solidity_modifier: ($) =>
      token(choice("payable", "nonpayable", "view", "returns")),
    solidity_parameter_list: ($) =>
      seq("(", optional(commaSep($.solidity_parameter)), ")"),
    solidity_parameter: ($) =>
      seq(
        $.identifier,
        optional(choice("memory", "calldata")),
        optional($.identifier),
      ),

    preprocessor: ($) => seq("#include", $.string),

    parameters: ($) => seq($.identifier, repeat(seq(",", $.identifier))),
    parameter_usage: ($) => seq("<", field("name", $.identifier), ">"),

    macro_definition: ($) =>
      seq(
        choice("macro", "fn"),
        field("name", $.identifier),
        seq("(", optional($.parameters), ")"),
        token("="), // Explicit token for equals sign
        optional(seq("takes", "(", $.number, ")")),
        optional(seq("returns", "(", $.number, ")")),
        $.block,
      ),

    macro_params: ($) =>
      seq(
        "(",
        optional(commaSep(choice($.identifier, $.literal, $.parameter_usage))),
        ")",
      ),

    macro_call: ($) => seq(field("name", $.identifier), $.macro_params),

    jump_label_definition: ($) => seq(field("name", $.identifier), ":"),
    jump_label_reference: ($) => field("name", $.identifier),

    block: ($) =>
      seq(
        "{",
        repeat(
          choice(
            $.opcode,
            $.literal,
            $.parameter_usage,
            $.macro_call,
            $.comment,
            $.jump_label_definition,
            $.jump_label_reference,
            $.constant_reference,
          ),
        ),
        "}",
      ),

    table_definition: ($) =>
      seq(
        choice("table", "jumptable", "jumpable__packed"),
        field("name", $.identifier),
        "{",
        repeat($.literal),
        "}",
      ),

    constant_definition: ($) =>
      seq(
        "constant",
        field("name", $.identifier),
        token("="), // Explicit token for equals sign
        $.literal,
      ),
    constant_reference: ($) => seq("[", field("name", $.identifier), "]"),

    // Opcodes (just a few examples)
    opcode: ($) =>
      choice(
        "dup1",
        "add",
        "swap1",
        "calldataload",
        "shr",
        "and",
        "jump",
        "jumpi",
        "iszero",
        "mstore",
        "revert",
      ),

    literal: ($) => choice($.number, $.hex_literal),
    number: ($) => /[0-9]+/,
    hex_literal: ($) => /0x[0-9a-fA-F]+/,
    string: ($) => /"[^"]*"/,
    identifier: ($) => /[_a-zA-Z][_a-zA-Z0-9]*/,
    comment: ($) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
