import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  HEADING_MAX_LINES,
  getDocLines,
  isHeadingDocAllowed,
  lineLimitFor,
  validateHeadingLines,
  wouldExceedLineLimit,
} from "./bannerTextExtensions";

const headingLimitKey = new PluginKey("headingCharLimit");

/**
 * Hard-blocks typing/paste/enter past per-line heading limits.
 * @param {() => ((msg: string) => void) | undefined} getOnReject
 */
export function HeadingLimitExtension(getOnReject) {
  const reject = (msg) => {
    const fn = typeof getOnReject === "function" ? getOnReject() : null;
    if (msg) queueMicrotask(() => fn?.(msg));
  };

  return Extension.create({
    name: "headingCharLimit",

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: headingLimitKey,
          filterTransaction: (tr) => {
            if (!tr.docChanged) return true;
            if (isHeadingDocAllowed(tr.doc)) return true;
            reject(validateHeadingLines(getDocLines(tr.doc)) || "Heading limit exceeded");
            return false;
          },
          props: {
            handleTextInput(view, from, to, text) {
              const err = wouldExceedLineLimit(view.state.doc, from, to, text);
              if (err) {
                reject(err);
                return true;
              }
              return false;
            },
            handlePaste(view, event) {
              const plain = event.clipboardData?.getData("text/plain");
              if (plain == null) return false;

              const { from, to } = view.state.selection;
              const normalized = plain.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
              const pasteLines = normalized.split("\n");
              const currentLines = getDocLines(view.state.doc);
              const $from = view.state.doc.resolve(from);
              const startLine = $from.index(0);
              const beforeCount = startLine;
              const afterCount = Math.max(0, currentLines.length - startLine - 1);
              const totalAfterPaste = beforeCount + pasteLines.length + afterCount;

              if (totalAfterPaste > HEADING_MAX_LINES) {
                event.preventDefault();
                reject(`Only ${HEADING_MAX_LINES} lines allowed — extra lines not allowed`);
                return true;
              }

              if (pasteLines.length === 1) {
                const err = wouldExceedLineLimit(view.state.doc, from, to, pasteLines[0]);
                if (err) {
                  event.preventDefault();
                  reject(err);
                  return true;
                }
                return false;
              }

              const start = $from.start(1);
              const end = $from.end(1);
              const before = view.state.doc.textBetween(start, from, "");
              const after = view.state.doc.textBetween(to, end, "");

              for (let i = 0; i < pasteLines.length; i += 1) {
                const targetIndex = startLine + i;
                const max = lineLimitFor(targetIndex);
                const chunk = pasteLines[i];
                let nextLen = chunk.length;
                if (i === 0) nextLen = before.length + chunk.length;
                if (i === pasteLines.length - 1) nextLen += after.length;
                if (i === 0 && pasteLines.length === 1) {
                  nextLen = before.length + chunk.length + after.length;
                }
                if (nextLen > max) {
                  event.preventDefault();
                  reject(
                    `Line ${targetIndex + 1} max ${max} characters — extra characters not allowed`,
                  );
                  return true;
                }
              }

              return false;
            },
            handleKeyDown(view, event) {
              if (event.key !== "Enter") return false;
              const lines = getDocLines(view.state.doc);
              if (lines.length >= HEADING_MAX_LINES) {
                reject(`Only ${HEADING_MAX_LINES} lines allowed — extra lines not allowed`);
                return true;
              }
              return false;
            },
          },
        }),
      ];
    },
  });
}
