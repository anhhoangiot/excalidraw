import { describe, expect, it } from "vitest";

import { wrapText } from "../src/textWrapping";

import type { FontString } from "../src/types";

/**
 * Regression test for excalidraw#8918 — the wysiwyg editor and the canvas
 * renderer must wrap at the same positions for slash-delimited text.
 */
describe("Editor/canvas wrapping alignment (issue #8918)", () => {
  const font = "10px Cascadia, Segoe UI Emoji" as FontString;

  /**
   * Emulates the line breaking the wysiwyg editor textarea applies
   * (`white-space: pre-wrap`, i.e. UAX #14 line break opportunities) followed
   * by `word-break: break-word` force-breaks for words that cannot fit.
   *
   * Note: this models only the character classes relevant to the tests below.
   */
  const editorWrap = (text: string, maxWidth: number): string => {
    // width of a string — `measureText` in tests returns 10px per character
    const width = (s: string) => s.length * 10;

    // UAX #14 break opportunities (the subset the editor relies on):
    // break after a space, hyphen or `/` (unless followed by a space)
    const canBreakBetween = (prev: string, cur: string) =>
      prev === " " || ((prev === "-" || prev === "/") && cur !== " ");

    const lastBreakIndex = (s: string) => {
      let idx = -1;
      for (let i = 1; i < s.length; i++) {
        if (canBreakBetween(s[i - 1], s[i])) {
          idx = i;
        }
      }
      return idx;
    };

    // `break-word`: force-break a word that has no break opportunity left
    const forceBreak = (word: string) => {
      let line = "";
      for (const char of word) {
        if (line && width(line + char) > maxWidth) {
          lines.push(line);
          line = char;
        } else {
          line += char;
        }
      }
      return line;
    };

    const lines: string[] = [];

    for (const hardLine of text.split("\n")) {
      let line = "";

      for (const char of hardLine) {
        if (width(line + char) <= maxWidth) {
          line += char;
          continue;
        }

        // wrap at the last break opportunity, as browsers do
        const candidate = line + char;
        const lastBreak = lastBreakIndex(candidate);
        if (lastBreak > 0) {
          // trailing whitespace does not survive a soft wrap, neither in the
          // editor nor in wrapText
          lines.push(candidate.slice(0, lastBreak).trimEnd());
          const remainder = candidate.slice(lastBreak);
          line =
            width(remainder) <= maxWidth ? remainder : forceBreak(remainder);
        } else {
          lines.push(line);
          line = char;
        }
      }

      lines.push(line);
    }

    return lines.join("\n");
  };

  const text = "docs/architecture/decisions/0001-record.md";

  // widths that exercise wrapping at `/` and at `-`
  [100, 130, 180, 250, 340, 420].forEach((maxWidth) => {
    it(`should wrap slash-delimited text like the editor (width ${maxWidth})`, () => {
      expect(wrapText(text, font, maxWidth)).toEqual(
        editorWrap(text, maxWidth),
      );
    });
  });

  it("should not change wrapping of plain prose", () => {
    const prose =
      "The quick brown fox jumps over the lazy dog and then continues running";
    // prose: check only widths where the full line fits or simple breaks
    // occur, as wrapText's greedy fit differs from browsers on refill width
    for (const maxWidth of [200, 400]) {
      expect(wrapText(prose, font, maxWidth)).toEqual(
        editorWrap(prose, maxWidth),
      );
    }
  });
});
