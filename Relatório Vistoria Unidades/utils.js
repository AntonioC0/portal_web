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

// ---------- Gerenciamento de Dados (IndexedDB - Suporta Grandes Volumes) ----------
const DB_NAME = 'VistoriasDB';
const DB_VERSION = 1;
const STORE_NAME = 'vistorias';
const OLD_STORAGE_KEY = 'vistorias_data';

// Função para abrir o banco de dados
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Obter todas as vistorias (Assíncrona)
async function getVistorias() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Salvar uma vistoria (Assíncrona)
async function saveVistoria(vistoria) {
    if (!vistoria.id) {
        vistoria.id = Date.now().toString();
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(vistoria);
        request.onsuccess = () => resolve(vistoria.id);
        request.onerror = () => reject(request.error);
    });
}

// Excluir uma vistoria (Assíncrona)
async function deleteVistoria(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Migração automática do LocalStorage antigo para o novo IndexedDB
async function migrateData() {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData) {
        try {
            const vistorias = JSON.parse(oldData);
            for (let v of vistorias) {
                await saveVistoria(v);
            }
            localStorage.removeItem(OLD_STORAGE_KEY);
            console.log('Dados migrados com sucesso para IndexedDB!');
        } catch (e) {
            console.error('Erro na migração:', e);
        }
    }
}

// Inicia a migração ao carregar o script
migrateData();
