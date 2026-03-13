// ---------- Lógica do Editor ----------
let currentVistoria = { id: null, unidade: "", data: "", setores: [], planilha: null };
let editSectorIndex = -1;

function initEditor() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const isPrint = params.get('print') === 'true';

    if (id) {
        const vistorias = getVistorias();
        const found = vistorias.find(v => v.id === id);
        if (found) {
            currentVistoria = found;
            // Preencher campos
            document.getElementById('inpUnidade').value = currentVistoria.unidade;
            document.getElementById('inpData').value = currentVistoria.data;
            document.getElementById('txtUnidade').textContent = titleCasePtBR(currentVistoria.unidade) || "Unidade";
            document.getElementById('txtData').textContent = formatarDataPtBR(currentVistoria.data) || "Data";
            
            if (currentVistoria.planilha) {
                document.getElementById('planilhaHint').textContent = "Planilha carregada";
                document.getElementById('btnRemoverPlanilha').style.display = 'inline-flex';
            }
            
            renderSectorsList();
            renderDocStack();
        }
    } else {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('inpData').value = hoje;
        document.getElementById('txtData').textContent = formatarDataPtBR(hoje);
    }

    if (isPrint) {
        setTimeout(() => {
            window.print();
            window.close();
        }, 1000);
    }

    setupEditorEvents();
}

function setupEditorEvents() {
    const btnAplicar = document.getElementById("btnAplicar");
    const btnAddSetor = document.getElementById("btnAddSetor");
    const btnSalvarVistoria = document.getElementById("btnSalvarVistoria");
    const inpImgs = document.getElementById("inpImgs");
    const inpPlanilha = document.getElementById("inpPlanilha");
    const btnRemoverPlanilha = document.getElementById("btnRemoverPlanilha");

    btnAplicar?.addEventListener("click", () => {
        currentVistoria.unidade = document.getElementById("inpUnidade").value;
        currentVistoria.data = document.getElementById("inpData").value;
        document.getElementById('txtUnidade').textContent = titleCasePtBR(currentVistoria.unidade) || "Unidade";
        document.getElementById('txtData').textContent = formatarDataPtBR(currentVistoria.data) || "Data";
    });

    inpImgs?.addEventListener("change", () => {
        const count = inpImgs.files.length;
        document.getElementById("fileHint").textContent = count > 0 ? `${count} arquivo(s) selecionado(s)` : "Nenhum arquivo selecionado";
    });

    inpPlanilha?.addEventListener("change", async () => {
        if (inpPlanilha.files.length > 0) {
            const urls = await filesToDataUrls(inpPlanilha.files);
            currentVistoria.planilha = urls[0];
            document.getElementById('planilhaHint').textContent = "Planilha selecionada";
            btnRemoverPlanilha.style.display = 'inline-flex';
            renderDocStack();
        }
    });

    btnRemoverPlanilha?.addEventListener("click", () => {
        currentVistoria.planilha = null;
        inpPlanilha.value = "";
        document.getElementById('planilhaHint').textContent = "Nenhuma imagem selecionada";
        btnRemoverPlanilha.style.display = 'none';
        renderDocStack();
    });

    btnAddSetor?.addEventListener("click", async () => {
        const nome = titleCasePtBR(document.getElementById("inpSetor").value);
        const desc = document.getElementById("inpDesc").value.trim();
        
        if (!nome) return alert("Informe o nome do setor.");

        let imgs = [];
        if (inpImgs.files.length > 0) {
            imgs = await filesToDataUrls(inpImgs.files);
        } else if (editSectorIndex !== -1) {
            imgs = currentVistoria.setores[editSectorIndex].imgs;
        }
        
        if (editSectorIndex === -1) {
            currentVistoria.setores.push({ nome, desc, imgs });
        } else {
            currentVistoria.setores[editSectorIndex] = { nome, desc, imgs };
        }
        
        resetSectorForm();
        renderSectorsList();
        renderDocStack();
    });

    btnSalvarVistoria?.addEventListener("click", () => {
        currentVistoria.unidade = document.getElementById("inpUnidade").value;
        currentVistoria.data = document.getElementById("inpData").value;
        
        if (!currentVistoria.unidade) return alert("Informe a unidade antes de salvar.");
        
        saveVistoria(currentVistoria);
        alert("Vistoria salva com sucesso!");
        window.location.href = "index.html";
    });
}

function renderSectorsList() {
    const list = document.getElementById("sectorsList");
    if (!list) return;
    
    if (currentVistoria.setores.length === 0) {
        list.innerHTML = '<div class="file-hint" style="text-align:center; padding:10px;">Nenhum setor adicionado</div>';
        return;
    }

    list.innerHTML = currentVistoria.setores.map((s, i) => `
        <div class="sector-item ${editSectorIndex === i ? 'editing' : ''}">
            <span onclick="editSector(${i})" style="cursor:pointer;">${s.nome}</span>
            <div class="sector-actions">
                <button class="action-btn" onclick="moveSector(${i}, -1)"><i class="fas fa-chevron-up"></i></button>
                <button class="action-btn" onclick="moveSector(${i}, 1)"><i class="fas fa-chevron-down"></i></button>
                <button class="action-btn" onclick="removeSector(${i})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderDocStack() {
    const stack = document.getElementById("docStack");
    if (!stack) return;
    
    let html = currentVistoria.setores.map(s => `
        <div class="doc-page">
            <div class="doc-page-inner">
                <div class="setor-cabecalho">
                    <h2 class="setor-nome">${s.nome}</h2>
                    <p class="descricao">${s.desc}</p>
                </div>
                <div class="galeria">
                    ${s.imgs.slice(0, 6).map(img => `<div class="item"><img src="${img}"></div>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar página de planilha se existir
    if (currentVistoria.planilha) {
        html += `
            <div class="page-landscape">
                <img src="${currentVistoria.planilha}" alt="Planilha de Resumo">
            </div>
        `;
    }

    stack.innerHTML = html;
}

function editSector(index) {
    editSectorIndex = index;
    const s = currentVistoria.setores[index];
    document.getElementById("inpSetor").value = s.nome;
    document.getElementById("inpDesc").value = s.desc;
    document.getElementById("btnAddSetor").innerHTML = '<i class="fas fa-save"></i> Salvar alterações';
    renderSectorsList();
}

function removeSector(index) {
    if (confirm("Excluir setor?")) {
        currentVistoria.setores.splice(index, 1);
        if (editSectorIndex === index) resetSectorForm();
        renderSectorsList();
        renderDocStack();
    }
}

function moveSector(index, dir) {
    const newIdx = index + dir;
    if (newIdx >= 0 && newIdx < currentVistoria.setores.length) {
        const temp = currentVistoria.setores[index];
        currentVistoria.setores[index] = currentVistoria.setores[newIdx];
        currentVistoria.setores[newIdx] = temp;
        renderSectorsList();
        renderDocStack();
    }
}

function resetSectorForm() {
    editSectorIndex = -1;
    document.getElementById("inpSetor").value = "";
    document.getElementById("inpDesc").value = "";
    document.getElementById("inpImgs").value = "";
    document.getElementById("fileHint").textContent = "Nenhum arquivo selecionado";
    document.getElementById("btnAddSetor").innerHTML = '<i class="fas fa-plus"></i> Adicionar setor';
}

document.addEventListener('DOMContentLoaded', initEditor);
