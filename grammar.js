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
          $.jumptable_definition,
          $.constant_definition,
          $.macro_definition,
          $.fn_definition,
          $.table_definition,
        ),
      ),

    // #define function foo() returns ()
    interface_function: ($) =>
      seq(
        "function",
        $.identifier,
        $.solidity_parameter_list,
        optional(repeat1($.solidity_modifier)),
        optional(seq("returns", $.solidity_parameter_list)),
      ),

    // #define event Transfer()
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

    // Preprocessor directives
    preprocessor: ($) => seq("#include", $.string),

    macro_name: ($) => $.identifier,
    parameter: ($) => $.identifier,
    parameters: ($) => seq($.parameter, repeat(seq(",", $.parameter))),
    parameter_usage: ($) => seq("<", field("name", $.parameter), ">"),

    macro_definition: ($) =>
      seq(
        "macro",
        $.macro_name,
        seq("(", optional($.parameters), ")"),
        token("="), // Explicit token for equals sign
        optional(seq("takes", "(", $.number, ")")),
        optional(seq("returns", "(", $.number, ")")),
        $.block,
      ),

    macro_params: ($) =>
      seq(
        "(",
        optional(
          commaSep(choice($.constant_name, $.literal, $.parameter_usage)),
        ),
        ")",
      ),

    macro_call: ($) => seq($.macro_name, $.macro_params),

    fn_definition: ($) =>
      seq(
        "fn",
        $.macro_name,
        seq("(", optional($.parameters), ")"),
        token("="), // Explicit token for equals sign
        optional(seq("takes", "(", $.number, ")")),
        optional(seq("returns", "(", $.number, ")")),
        $.block,
      ),

    fn_call: ($) => seq($.macro_name, $.macro_params),

    label_name: ($) => $.identifier,
    jump_label_definition: ($) => seq(field("name", $.label_name), ":"),
    jump_label_reference: ($) => $.label_name,

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
          ),
        ),
        "}",
      ),

    constant_name: ($) => $.identifier,

    table_definition: ($) =>
      seq("table", $.constant_name, "{", repeat($.literal), "}"),

    constant_definition: ($) =>
      seq(
        "constant",
        $.constant_name,
        token("="), // Explicit token for equals sign
        $.literal,
      ),

    jumptable_definition: ($) =>
      seq(
        choice("jumptable", "jumptable__packed"),
        "{",
        optional(repeat($.literal)),
        "}",
      ),

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
