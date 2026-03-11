// ---------- Utilidades ----------
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

// ---------- Estado da Aplicação ----------
let setores = [];
let editIndex = -1; // -1 significa que estamos adicionando um novo setor

// ---------- Elementos ----------
const inpUnidade = document.getElementById("inpUnidade");
const inpData = document.getElementById("inpData");
const btnAplicar = document.getElementById("btnAplicar");
const btnPrint = document.getElementById("btnImprimir");
const txtUnidade = document.getElementById("txtUnidade");
const txtData = document.getElementById("txtData");

const inpSetor = document.getElementById("inpSetor");
const inpImgs = document.getElementById("inpImgs");
const inpDesc = document.getElementById("inpDesc");
const btnAddSetor = document.getElementById("btnAddSetor");
const fileHint = document.getElementById("fileHint");
const sectorsList = document.getElementById("sectorsList");
const docStack = document.getElementById("docStack");

// ---------- Funções de Renderização ----------

function renderSectorsList() {
    if (setores.length === 0) {
        sectorsList.innerHTML = '<div class="file-hint" style="text-align:center; padding:8px;">Nenhum setor adicionado</div>';
        return;
    }

    sectorsList.innerHTML = "";
    setores.forEach((setor, index) => {
        const item = document.createElement("div");
        item.className = `sector-item ${editIndex === index ? 'editing' : ''}`;
        item.innerHTML = `
            <span onclick="editSector(${index})" style="cursor:pointer;" title="Clique para editar">${setor.nome}</span>
            <div class="sector-actions">
                <button class="action-btn" onclick="moveSector(${index}, -1)" title="Subir">
                    <i class="fas fa-chevron-up"></i>
                </button>
                <button class="action-btn" onclick="moveSector(${index}, 1)" title="Descer">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <button class="action-btn delete" onclick="removeSector(${index})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        sectorsList.appendChild(item);
    });
}

function renderDocStack() {
    docStack.innerHTML = "";
    setores.forEach(setor => {
        const page = document.createElement("div");
        page.className = "doc-page";
        
        let galeriaHtml = "";
        if (setor.imgs && setor.imgs.length > 0) {
            galeriaHtml = '<div class="galeria">';
            setor.imgs.slice(0, 6).forEach(src => {
                galeriaHtml += `<div class="item"><img src="${src}" /></div>`;
            });
            // Preencher espaços vazios se houver menos de 6 imagens
            for (let i = setor.imgs.length; i < 6; i++) {
                galeriaHtml += '<div class="item empty"></div>';
            }
            galeriaHtml += '</div>';
        }

        page.innerHTML = `
            <div class="doc-page-inner">
                <div class="setor-cabecalho">
                    <h2 class="setor-nome">${setor.nome}</h2>
                    <p class="descricao">${setor.desc}</p>
                </div>
                ${galeriaHtml}
            </div>
        `;
        docStack.appendChild(page);
    });
}

// ---------- Ações ----------

function editSector(index) {
    editIndex = index;
    const setor = setores[index];
    
    // Carregar dados nos inputs
    inpSetor.value = setor.nome;
    inpDesc.value = setor.desc;
    
    // Atualizar o botão e o título da seção (opcional, mas ajuda no feedback)
    btnAddSetor.innerHTML = '<i class="fas fa-save"></i> Salvar alterações';
    btnAddSetor.classList.add('editing-mode');
    
    fileHint.textContent = setor.imgs.length > 0 ? `${setor.imgs.length} imagem(ns) salva(s) (selecione novas para trocar)` : "Nenhuma imagem salva";
    
    renderSectorsList();
    
    // Rolar para o topo do formulário de setor para facilitar a edição
    inpSetor.focus();
}

function removeSector(index) {
    if (confirm("Deseja realmente excluir este setor?")) {
        if (editIndex === index) resetForm();
        setores.splice(index, 1);
        renderSectorsList();
        renderDocStack();
    }
}

function moveSector(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < setores.length) {
        const temp = setores[index];
        setores[index] = setores[newIndex];
        setores[newIndex] = temp;
        
        // Se o item sendo movido era o que estava em edição, atualiza o index
        if (editIndex === index) editIndex = newIndex;
        else if (editIndex === newIndex) editIndex = index;
        
        renderSectorsList();
        renderDocStack();
    }
}

function resetForm() {
    editIndex = -1;
    inpSetor.value = "";
    inpDesc.value = "";
    inpImgs.value = "";
    fileHint.textContent = "Nenhum arquivo selecionado";
    btnAddSetor.innerHTML = '<i class="fas fa-plus"></i> Adicionar setor';
    btnAddSetor.classList.remove('editing-mode');
    renderSectorsList();
}

// ---------- Eventos ----------

btnAplicar.addEventListener("click", () => {
    txtUnidade.textContent = titleCasePtBR(inpUnidade.value) || "Unidade";
    txtData.textContent = formatarDataPtBR(inpData.value) || "Data";
});

inpImgs.addEventListener("change", () => {
    const count = inpImgs.files.length;
    fileHint.textContent = count > 0 ? `${count} arquivo(s) selecionado(s)` : "Nenhum arquivo selecionado";
});

btnAddSetor.addEventListener("click", async () => {
    const nome = titleCasePtBR(inpSetor.value);
    const desc = inpDesc.value.trim();
    
    if (!nome) {
        alert("Por favor, informe o nome do setor.");
        return;
    }

    let imgs = [];
    if (inpImgs.files.length > 0) {
        imgs = await filesToDataUrls(inpImgs.files);
    } else if (editIndex !== -1) {
        // Se estiver editando e não selecionou novas imagens, mantém as antigas
        imgs = setores[editIndex].imgs;
    }
    
    if (editIndex === -1) {
        // Adicionar novo
        setores.push({ nome, desc, imgs });
    } else {
        // Salvar edição
        setores[editIndex] = { nome, desc, imgs };
    }
    
    resetForm();
    renderDocStack();
});

btnPrint.addEventListener("click", () => {
    window.print();
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    const hoje = new Date().toISOString().split('T')[0];
    inpData.value = hoje;
    txtData.textContent = formatarDataPtBR(hoje);
});

