import XCTest
import SwiftTreeSitter
import TreeSitterHuff

final class TreeSitterHuffTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_huff())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Tree-Sitter Huff grammar")
    }
}
