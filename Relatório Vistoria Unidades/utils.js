// ---------- Utilidades Compartilhadas ----------
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
    const [y,m,d] = iso.split("-").map(Number);
    if(!y||!m||!d) return "";
    return `${d} de ${capFirst(meses[m-1])} de ${y}`;
}

function filesToDataUrls(fileList){
    const files = Array.from(fileList||[]).filter(f=> /^image\//.test(f.type));
    return Promise.all(files.map(file=> new Promise((res,rej)=>{
        const fr = new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file);
    })));
}

// ---------- Gerenciamento de Dados (LocalStorage) ----------
const STORAGE_KEY = 'vistorias_data';

function getVistorias() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveVistoria(vistoria) {
    const vistorias = getVistorias();
    if (vistoria.id) {
        const index = vistorias.findIndex(v => v.id === vistoria.id);
        if (index !== -1) vistorias[index] = vistoria;
        else vistorias.push(vistoria);
    } else {
        vistoria.id = Date.now().toString();
        vistorias.push(vistoria);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vistorias));
    return vistoria.id;
}

function deleteVistoria(id) {
    const vistorias = getVistorias().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vistorias));
}
