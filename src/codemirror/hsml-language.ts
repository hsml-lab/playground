import { LanguageSupport, StreamLanguage, foldService } from '@codemirror/language';
import type { StreamParser, StringStream } from '@codemirror/language';

interface HsmlState {
  context: 'lineStart' | 'selector' | 'text' | 'attributes' | 'textBlock';
  inString: false | '"' | "'";
  textBlockIndent: number;
}

const hsmlStreamParser: StreamParser<HsmlState> = {
  startState(): HsmlState {
    return { context: 'lineStart', inString: false, textBlockIndent: 0 };
  },

  token(stream: StringStream, state: HsmlState): string | null {
    // Text block continuation
    if (state.context === 'textBlock') {
      if (stream.sol()) {
        const indent = stream.indentation();
        if (indent <= state.textBlockIndent && !stream.match(/^\s*$/, false)) {
          state.context = 'lineStart';
          // Fall through to lineStart handling below
        } else {
          stream.skipToEnd();
          return null;
        }
      } else {
        stream.skipToEnd();
        return null;
      }
    }

    // Inside attribute parentheses
    if (state.context === 'attributes') {
      return tokenizeAttributes(stream, state);
    }

    // Text content — skip to end, no highlighting
    if (state.context === 'text') {
      // Interpolation {{ }}
      if (stream.match('{{')) {
        while (!stream.eol()) {
          if (stream.match('}}')) return 'brace';
          stream.next();
        }
        return 'brace';
      }
      if (stream.sol()) {
        state.context = 'lineStart';
        // Fall through
      } else {
        stream.skipToEnd();
        return null;
      }
    }

    // Start of line
    if (stream.sol()) {
      state.context = 'lineStart';
      stream.eatSpace();
      if (stream.eol()) return null;
    }

    if (state.context === 'lineStart') {
      // Comments
      if (stream.match('//!')) {
        stream.skipToEnd();
        return 'string';
      }
      if (stream.match('//')) {
        stream.skipToEnd();
        return 'comment';
      }

      // Doctype
      if (stream.match(/^doctype\b/)) {
        stream.eatSpace();
        stream.skipToEnd();
        return 'meta';
      }

      // Class-only shorthand (line starts with dot): .card
      if (stream.peek() === '.') {
        state.context = 'selector';
        // Fall through to selector handling
      }
      // Tag name
      else if (stream.match(/^[a-zA-Z][a-zA-Z0-9-]*/)) {
        state.context = 'selector';
        return 'typeName';
      }
      // Nothing matched, treat as text
      else {
        state.context = 'text';
        stream.skipToEnd();
        return null;
      }
    }

    // Selector context: classes, ids, attributes, text block marker
    if (state.context === 'selector') {
      // ID selector: #name
      if (stream.match(/#[\w-]+/)) {
        return 'labelName';
      }

      // Class selector: .name (supports Tailwind arbitrary values)
      if (
        stream.peek() === '.' &&
        !stream.match(/^\.\s*$/, false) &&
        !stream.match(/^\.\s/, false)
      ) {
        stream.next(); // eat the dot
        stream.match(/(?:[\w:\-#/]|(\[.*?\]))+/);
        return 'string';
      }

      // Text block marker (dot at end of line)
      if (stream.peek() === '.' && stream.match(/^\.\s*$/)) {
        state.context = 'textBlock';
        state.textBlockIndent = stream.indentation();
        return 'punctuation';
      }

      // Opening parentheses → attributes context
      if (stream.peek() === '(') {
        stream.next();
        state.context = 'attributes';
        return 'punctuation';
      }

      // Space → transition to text content
      if (stream.peek() === ' ') {
        state.context = 'text';
        stream.skipToEnd();
        return null;
      }

      // Anything else
      stream.next();
      return null;
    }

    stream.next();
    return null;
  },
};

function tokenizeAttributes(stream: StringStream, state: HsmlState): string | null {
  // Handle string continuation
  if (state.inString) {
    const quote = state.inString;
    while (!stream.eol()) {
      if (stream.next() === quote) {
        state.inString = false;
        return 'string';
      }
    }
    return 'string';
  }

  // Skip whitespace
  if (stream.eatSpace()) return null;

  // Newline in multi-line attributes
  if (stream.sol()) return null;

  // Closing paren
  if (stream.peek() === ')') {
    stream.next();
    state.context = 'selector';
    return 'punctuation';
  }

  // Comments inside attributes
  if (stream.match('//')) {
    stream.skipToEnd();
    return 'comment';
  }

  // Vue directives: v-if, v-else, v-model, v-for, etc.
  if (stream.match(/^v-[\w\-.]+/)) {
    return 'keyword';
  }

  // Vue shorthand bindings: :prop, @event, #slot
  if (stream.match(/^[:@#][\w\-.]+/)) {
    return 'keyword';
  }

  // Angular-style bindings: [prop], [(prop)]
  if (stream.match(/^\[?\(?[\w.-]+\)?\]/)) {
    return 'keyword';
  }

  // Attribute name
  if (stream.match(/^[\w-]+(?:\.[\w-]+)*/)) {
    return 'name';
  }

  // Equals sign
  if (stream.peek() === '=') {
    stream.next();
    return 'operator';
  }

  // String values
  if (stream.peek() === '"' || stream.peek() === "'") {
    const quote = stream.next() as '"' | "'";
    state.inString = quote;
    while (!stream.eol()) {
      if (stream.next() === quote) {
        state.inString = false;
        return 'string';
      }
    }
    return 'string';
  }

  stream.next();
  return null;
}

const hsmlFoldService = foldService.of((state, lineStart) => {
  const line = state.doc.lineAt(lineStart);
  const lineText = line.text;
  const indent = lineText.search(/\S/);
  if (indent < 0) return null;

  // Look for the last line that has greater indentation
  let lastFoldedLine = -1;
  for (let i = line.number + 1; i <= state.doc.lines; i++) {
    const nextLine = state.doc.line(i);
    const nextText = nextLine.text;
    const nextIndent = nextText.search(/\S/);
    if (nextIndent < 0) {
      // Empty line — continue, might be inside the fold
      continue;
    }
    if (nextIndent > indent) {
      lastFoldedLine = i;
    } else {
      break;
    }
  }

  if (lastFoldedLine < 0) return null;
  const endLine = state.doc.line(lastFoldedLine);
  return { from: line.to, to: endLine.to };
});

export function hsmlLanguage(): LanguageSupport {
  return new LanguageSupport(StreamLanguage.define(hsmlStreamParser), [hsmlFoldService]);
}
