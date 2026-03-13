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

// ---------- CONFIGURAÇÃO DO FIREBASE ----------
const firebaseConfig = {
  apiKey: "AIzaSyCVmk9FsI3cHpQowilNtR0Zj-6LsszL2YM",
  authDomain: "portal-web-34bf8.firebaseapp.com",
  databaseURL: "https://portal-web-34bf8-default-rtdb.firebaseio.com",
  projectId: "portal-web-34bf8",
  storageBucket: "portal-web-34bf8.firebasestorage.app",
  messagingSenderId: "436214080835",
  appId: "1:436214080835:web:1a8d3fab348cf941ed7bf6"
};

// Inicialização do Firebase
let db;
function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK não carregado!");
        return;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
}

// ---------- Gerenciamento de Dados (Firebase) ----------

async function getVistorias() {
    if (!db) initFirebase();
    return new Promise((resolve) => {
        db.ref('vistorias').once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return resolve([]);
            const list = Object.keys(data).map(key => ({
                ...data[key],
                id: key
            }));
            resolve(list);
        });
    });
}

async function getVistoriaById(id) {
    if (!db) initFirebase();
    return new Promise((resolve, reject) => {
        db.ref('vistorias/' + id).once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return resolve(null);
            resolve({ ...data, id: id });
        }, (error) => reject(error));
    });
}

async function saveVistoria(vistoria) {
    if (!db) initFirebase();
    const id = vistoria.id || db.ref().child('vistorias').push().key;
    vistoria.id = id;
    
    return new Promise((resolve, reject) => {
        db.ref('vistorias/' + id).set(vistoria, (error) => {
            if (error) reject(error);
            else resolve(id);
        });
    });
}

async function deleteVistoria(id) {
    if (!db) initFirebase();
    return new Promise((resolve, reject) => {
        db.ref('vistorias/' + id).remove((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

// CORREÇÃO: Removido o listener de DOMContentLoaded para evitar dupla inicialização.
// A inicialização agora é feita sob demanda ou pelos scripts principais (home.js/editor.js).
