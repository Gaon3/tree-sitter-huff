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
    source_file: ($) => repeat($._top_level_item),

    _top_level_item: ($) =>
      choice(
        $.preprocessor,
        $.solidity_function,
        $.jump_label_definition,
        $.macro_definition,
        $.comment,
      ),

    // Preprocessor directives
    preprocessor: ($) => seq("#include", $.string),

    solidity_function: ($) =>
      seq(
        "#define",
        "function",
        field("name", $.identifier),
        "(",
        optional($.solidity_parameter_types),
        ")",
        optional("nonpayable"),
        optional("payable"),
        optional("pure"),
        optional("view"),
        optional(seq("returns", "(", optional($.solidity_return_types), ")")),
      ),

    solidity_parameter_types: ($) => /[^)]*/,
    solidity_return_types: ($) => /[^)]*/,

    jump_label_definition: ($) => seq(field("name", $.label_name), ":"),
    jump_label_reference: ($) => $.label_name,

    label_name: ($) => /[_a-z][_a-z0-9_]*/,

    // Macro definition with explicit equals sign handling
    macro_definition: ($) =>
      seq(
        "#define",
        "macro",
        $.macro_name,
        $.parameter_list,
        token("="), // Explicit token for equals sign
        optional($.takes_clause),
        optional($.returns_clause),
        $.block,
      ),

    parameter_list: ($) => seq("(", optional($.parameters), ")"),

    parameters: ($) => seq($.parameter, repeat(seq(",", $.parameter))),

    takes_clause: ($) => seq("takes", "(", $.number, ")"),
    returns_clause: ($) => seq("returns", "(", $.number, ")"),

    // Parameter usage in body - made more specific
    parameter_usage: ($) => seq("<", field("name", $.identifier), ">"),

    parameter: ($) => $.identifier,

    macro_call: ($) => seq($.macro_name, "(", optional($.arguments), ")"),
    arguments: ($) => seq($.argument, repeat(seq(",", $.argument))),
    argument: ($) =>
      choice(
        $.literal,
        $.identifier,
        $.parameter_usage,
        $.jump_label_reference,
      ),

    block: ($) =>
      seq(
        "{",
        repeat(
          choice(
            $.opcode,
            $.literal,
            $.parameter_usage, // Now properly recognized
            $.macro_call,
            $.comment,
            $.jump_label_definition,
            $.jump_label_reference,
          ),
        ),
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

    // Literals
    literal: ($) => choice($.number, $.hex_literal),
    number: ($) => /[0-9]+/,
    hex_literal: ($) => /0x[0-9a-fA-F]+/,

    // Strings
    string: ($) => /"[^"]*"/,

    // Identifiers
    identifier: ($) => /[_a-zA-Z][_a-zA-Z0-9]*/,
    macro_name: ($) => /[_A-Z][_A-Z0-9_]*/,

    // Comments
    comment: ($) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
  },
});
