from unittest import TestCase

import tree_sitter
import tree_sitter_huff


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_huff.language())
        except Exception:
            self.fail("Error loading Tree-Sitter Huff grammar")
