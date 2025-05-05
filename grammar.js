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
    parameter_reference: ($) => seq("<", field("name", $.identifier), ">"),

    macro_definition: ($) =>
      seq(
        choice("macro", "fn"),
        field("name", $.macro_name),
        seq("(", optional($.parameters), ")"),
        token("="),
        optional(seq("takes", "(", $.number, ")")),
        optional(seq("returns", "(", $.number, ")")),
        $.block,
      ),

    macro_params: ($) =>
      seq(
        "(",
        optional(commaSep(choice($.constant_reference, $.literal))),
        ")",
      ),

    macro_call: ($) => seq(field("name", $.macro_name), $.macro_params),

    jump_label_definition: ($) => seq(field("name", $.macro_name), ":"),
    jump_label_reference: ($) => field("name", $.macro_name),

    block: ($) =>
      seq(
        "{",
        repeat(
          choice(
            $.opcode,
            $.literal,
            $.parameter_reference,
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
        field("name", $.constant_name),
        "{",
        repeat($.literal),
        "}",
      ),

    constant_definition: ($) =>
      seq("constant", field("name", $.constant_name), token("="), $.literal),

    constant_reference: ($) =>
      choice(
        field("name", $.constant_name),
        seq("[", field("name", $.constant_name), "]"),
      ),

    opcode: ($) =>
      choice(
        $.opcode_io,
        $.opcode_side_effects,
        $.opcode_calculation,
        $.opcode_stop,
        $.opcode_stack,
      ),

    opcode_io: ($) =>
      token(
        choice(
          "chainid",
          "sstore",
          "sload",
          "mstore8",
          "mstore",
          "mload",
          "pop",
          "msize",
          "balance",
          "address",
          "returndatacopy",
          "returndatasize",
          "extcodecopy",
          "extcodesize",
          "gasprice",
          "caller",
          "origin",
          "gaslimit",
          "difficulty",
          "number",
          "timestamp",
          "coinbase",
          "blockhash",
          "codecopy",
          "codesize",
          "calldatacopy",
          "calldatasize",
          "calldataload",
          "callvalue",
          "gas",
        ),
      ),

    opcode_side_effects: ($) =>
      token(
        choice(
          "log4",
          "log3",
          "log2",
          "log1",
          "log0",
          "jumpdest",
          "getpc",
          "jumpi",
          "jump",
          "create2",
          "staticcall",
          "delegatecall",
          "callcode",
          "call",
          "create",
        ),
      ),

    opcode_calculation: ($) =>
      token(
        choice(
          "not",
          "xor",
          "or",
          "and",
          "ror",
          "rol",
          "sar",
          "shr",
          "shl",
          "keccak",
          "sha3",
          "byte",
          "iszero",
          "eq",
          "sgt",
          "slt",
          "gt",
          "lt",
          "signextend",
          "exp",
          "mulmod",
          "addmod",
          "smod",
          "mod",
          "sdiv",
          "div",
          "sub",
          "mul",
          "add",
        ),
      ),

    opcode_stop: ($) =>
      token(choice("selfdestruct", "invalid", "revert", "return", "stop")),

    opcode_stack: ($) =>
      token(
        /(swap1|dup1)[0-6]|(swap|dup)[1-9]|push3[0-2]|push[1-2][0-9]|push[0-9]/,
      ),

    label_name: ($) => /[_a-z][_a-z0-9]*/,
    macro_name: ($) => /_{0,2}[a-zA-Z][_a-zA-Z0-9]*/,
    constant_name: ($) => /[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*/,
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
