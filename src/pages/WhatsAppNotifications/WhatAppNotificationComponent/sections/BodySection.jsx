
// frontend/admin-dashboard/src/pages/WhatsAppNotifications/WhatAppNotificationComponent/sections/BodySection.jsx
import { useRef } from "react";
import { countVars } from "../../utils/helper";


export const BodySection = ({ body, onChange }) => {
  const textareaRef = useRef(null);
  const varCount = countVars(body.text);

  const syncExamples = (text, examples) => {
    const n = countVars(text);
    return Array.from({ length: n }, (_, i) => examples[i] || "");
  };

  const handleTextChange = (val) =>
    onChange({
      ...body,
      text: val,
      examples: syncExamples(val, body.examples),
    });

  const insertToken = (n) => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? body.text.length;
    const token = `{{${n}}}`;
    handleTextChange(body.text.slice(0, pos) + token + body.text.slice(pos));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(pos + token.length, pos + token.length);
    }, 0);
  };

  const updateExample = (i, val) => {
    const next = [...body.examples];
    next[i] = val;
    onChange({ ...body, examples: next });
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          3
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Body <span className="text-red-400">*</span>
          </p>
          <p className="text-xs text-gray-400">
            Main message — use {"{{1}}"}, {"{{2}}"}… for dynamic values
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Message Body
            </label>
            <span className="text-[10px] text-gray-400">
              {body.text.length}/1024
            </span>
          </div>
          <textarea
            ref={textareaRef}
            required
            rows={6}
            maxLength={1024}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 resize-none font-mono leading-relaxed"
            placeholder={
              "Hello {{1}},\n\nYour inquiry for *{{2}}* has been submitted.\n\nReference ID: {{3}}."
            }
            value={body.text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        {/* Variable insert pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400">
            Insert variable:
          </span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => insertToken(n)}
              className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#E8F8EF] border border-[#C2EDD6] text-[#27AE60] hover:bg-[#C2EDD6] transition-colors"
            >{`{{${n}}}`}</button>
          ))}
          <span className="text-[10px] text-gray-400">
            click to insert at cursor
          </span>
        </div>

        {/* Formatting tips */}
        <div className="flex items-center gap-4 text-[10px] text-gray-400 flex-wrap">
          <span>
            *text* → <strong>bold</strong>
          </span>
          <span>
            _text_ → <em>italic</em>
          </span>
          <span>
            ~text~ → <s>strikethrough</s>
          </span>
        </div>

        {/* Variable samples table — exact Meta format */}
        {varCount > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Variable Samples
              </p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <p className="text-xs text-gray-400">
              Required by Meta for template review. Don't use real customer
              data.
            </p>
            <div className="flex items-center gap-3 px-1 mb-0.5">
              <div className="w-14 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                Token
              </div>
              <div className="flex-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Sample value
              </div>
            </div>
            {Array.from({ length: varCount }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg font-mono text-xs font-semibold text-gray-600 flex-shrink-0 select-none">
                  {`{{${i + 1}}}`}
                </div>
                <input
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
                  placeholder={`Sample for {{${i + 1}}}`}
                  value={body.examples[i] || ""}
                  onChange={(e) => updateExample(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};