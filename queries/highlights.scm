; Preprocessor directives
(preprocessor) @keyword.directive
[
  "#include"
  "#define"
] @keyword.directive

; Keywords
[
  "takes"
  "returns"
  "memory"
  "calldata"
] @keyword

[
  "macro"
  "fn"
  "event"
  "function"
  "constant"
  "table"
] @type

(solidity_modifier) @keyword.modifier

(macro_definition name: (identifier) @function)
(macro_call name: (identifier) @function)

(constant_definition name: (identifier) @constant)
(constant_reference name: (identifier) @constant)

(jump_label_definition name: (identifier) @variable.special)
(jump_label_reference name: (identifier) @variable.special)


; Literals
(string) @string
[
  (number)
  (hex_literal)
] @number

; Identifiers
(identifier) @variable

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
] @punctuation.delimiter

[
  ":"
  ","
  "="
] @punctuation

(comment) @comment
