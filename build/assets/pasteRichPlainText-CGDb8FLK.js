function E(a=""){if(!a||typeof document>"u")return"";const o=new DOMParser().parseFromString(a,"text/html");o.querySelectorAll("style, script, meta, link, title").forEach(t=>t.remove());const s=new Set(["P","DIV","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","TR","TABLE","BLOCKQUOTE"]),i=(t,n="")=>{if(!t)return"";if(t.nodeType===Node.TEXT_NODE)return String(t.nodeValue||"").replace(/\u00a0/g," ");if(t.nodeType!==Node.ELEMENT_NODE)return"";const r=t.tagName;if(r==="BR")return`
`;if(r==="LI"){const e=t.parentElement,g=e?.tagName==="OL";let l="• ";if(g){const c=Array.from(e.children).filter(d=>d.tagName==="LI").indexOf(t);l=`${(Number(e.getAttribute("start")||"1")||1)+Math.max(0,c)}. `}else{let m=0,c=e;for(;c;)(c.tagName==="UL"||c.tagName==="OL")&&(m+=1),c=c.parentElement;l=m<=1?"• ":m===2?"○ ":"▪ "}const f=Array.from(t.childNodes).map(m=>i(m,l)).join("").replace(/\n+/g,`
`).trim();return`${n}${l}${f}
`}if(r==="UL"||r==="OL")return Array.from(t.childNodes).map(e=>i(e,n)).join("");const u=Array.from(t.childNodes).map(e=>i(e,n)).join("");if(s.has(r)){const e=u.replace(/\s+$/g,"");return e?`${e}
`:""}return u};let p=i(o.body);return p=p.replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trimEnd(),p}function h(a=""){return String(a||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[\uF0A7\uF0B7\uF0A8\uF06C\uF06E]/g,"•").replace(/^\s*[·∙‣‣▸►▶➢➔⇒→]\s+/gm,o=>{const s=o.trim();return"→⇒➔".includes(s[0])?"→ ":"▸►▶➢".includes(s[0])?"▸ ":"• "}).replace(/\n{3,}/g,`

`)}function T(a,o,s){a.preventDefault();const i=a.clipboardData?.getData("text/html")||"",p=a.clipboardData?.getData("text/plain")||"";let t="";i.trim()&&(t=E(i)),t.trim()||(t=p),t=h(t);const n=a.target,r=String(o||""),u=typeof n.selectionStart=="number"?n.selectionStart:r.length,e=typeof n.selectionEnd=="number"?n.selectionEnd:r.length,g=`${r.slice(0,u)}${t}${r.slice(e)}`;s(g),requestAnimationFrame(()=>{try{const l=u+t.length;n.selectionStart=l,n.selectionEnd=l}catch{}})}export{T as p};
