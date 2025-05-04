package tree_sitter_huff_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_huff "github.com/gaon3/tree-sitter-huff/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_huff.Language())
	if language == nil {
		t.Errorf("Error loading Tree-Sitter Huff grammar")
	}
}
