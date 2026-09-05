function h(n=""){if(!n||typeof document>"u")return"";const l=new DOMParser().parseFromString(n,"text/html");l.querySelectorAll("style, script, meta, link, title").forEach(e=>e.remove());const c=new Set(["P","DIV","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","TR","TABLE","BLOCKQUOTE"]),r=(e,i="")=>{if(!e)return"";if(e.nodeType===Node.TEXT_NODE)return String(e.nodeValue||"").replace(/\u00a0/g," ");if(e.nodeType!==Node.ELEMENT_NODE)return"";const s=e.tagName;if(s==="BR")return`
`;if(s==="LI"){const t=e.parentElement,f=t?.tagName==="OL";let o="• ";if(f){const m=Array.from(t.children).filter(d=>d.tagName==="LI").indexOf(e);o=`${(Number(t.getAttribute("start")||"1")||1)+Math.max(0,m)}. `}else{let p=0,m=t;for(;m;)(m.tagName==="UL"||m.tagName==="OL")&&(p+=1),m=m.parentElement;o=p<=1?"• ":p===2?"○ ":"▪ "}const g=Array.from(e.childNodes).map(p=>r(p,o)).join("").replace(/\n+/g,`
`).trim();return`${i}${o}${g}
`}if(s==="UL"||s==="OL")return Array.from(e.childNodes).map(t=>r(t,i)).join("");const u=Array.from(e.childNodes).map(t=>r(t,i)).join("");if(c.has(s)){const t=u.replace(/\s+$/g,"");return t?`${t}
`:""}return u};let a=r(l.body);return a=a.replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n{3,}/g,`

`).replace(/[ \t]+\n/g,`
`).trimEnd(),a}function E(n=""){return String(n||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[\uF0A7\uF0B7\uF0A8\uF06C\uF06E]/g,"•").replace(/^\s*[·∙‣‣▸►▶➢➔⇒→]\s+/gm,l=>{const c=l.trim();return"→⇒➔".includes(c[0])?"→ ":"▸►▶➢".includes(c[0])?"▸ ":"• "}).replace(/\n{3,}/g,`

`)}function y(n,l,c){n.preventDefault();const r=n.clipboardData?.getData("text/html")||"",a=n.clipboardData?.getData("text/plain")||"";let e="";r.trim()&&(e=h(r)),e.trim()||(e=a),e=E(e);const i=n.target,s=String(l||""),u=typeof i.selectionStart=="number"?i.selectionStart:s.length,t=typeof i.selectionEnd=="number"?i.selectionEnd:s.length,f=`${s.slice(0,u)}${e}${s.slice(t)}`;c(f),requestAnimationFrame(()=>{try{const o=u+e.length;i.selectionStart=o,i.selectionEnd=o}catch{}})}function T(n=""){const l=String(n||"").split(/\r?\n/).map(a=>a.replace(/\s{2,}/g," ").trim()).filter(Boolean),c=new Set,r=[];for(const a of l){const e=a.toLowerCase();c.has(e)||(c.add(e),r.push(a))}return r}export{T as a,y as p};
