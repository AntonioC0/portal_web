// ---------- Utilidades Compartilhadas (Versão Local) ----------
const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const minusculasFixas = new Set(["de","da","do","das","dos","e","a","as","o","os","para","por","com"]);
const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

function titleCasePtBR(texto){
    if(!texto) return "";
    const palavras = texto.trim().toLowerCase().split(/\s+/);
    return palavras.map((p,i)=> (i>0 && minusculasFixas.has(p)) ? p : p.charAt(0).toUpperCase()+p.slice(1)).join(" ");
}

function formatarDataPtBR(iso){
    if(!iso) return "";
    const parts = iso.split("-").map(Number);
    if(parts.length !== 3) return iso;
    const [y,m,d] = parts;
    if(!y||!m||!d) return iso;
    return `${d} de ${capFirst(meses[m-1])} de ${y}`;
}

function filesToDataUrls(fileList){
    const files = Array.from(fileList||[]).filter(f=> /^image\//.test(f.type));
    return Promise.all(files.map(file=> new Promise((res,rej)=>{
        const fr = new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file);
    })));
}

// Nota: O Firebase foi removido para tornar o site totalmente local e independente de conexão.
