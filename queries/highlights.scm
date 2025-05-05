; Preprocessor directives
(preprocessor) @keyword.directive
[
  "#include"
  "#define"
] @keyword.directive

; Keywords
[
  "macro"
  "fn"
  "function"
  "event"
  "takes"
  "returns"
  "constant"
  "table"
  "jumptable"
  "jumptable__packed"
] @keyword

; Modifiers
(solidity_modifier) @keyword.modifier

; Types and storage
[
  "memory"
  "calldata"
] @type

; Literals
(string) @string
[
  (number)
  (hex_literal)
] @number

; Identifiers
(identifier) @variable
(constant_name) @constant
(label_name) @label
(macro_name) @function

; Parameters
[
  (parameter)
  (parameter_usage)
] @parameter

; Function calls
(macro_call) @function.call

; Punctuation
[
  "{"
  "}"
  "("
  ")"
  "<"
  ">"
  ":"
  ","
  "="
] @punctuation.delimiter

(comment) @comment
