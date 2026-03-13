// ---------- Lógica da Home ----------
function renderHome(filter = "") {
    const grid = document.getElementById('vistoriasGrid');
    if (!grid) return;

    const vistorias = getVistorias().filter(v => 
        v.unidade.toLowerCase().includes(filter.toLowerCase())
    );

    if (vistorias.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${filter ? 'Nenhuma unidade encontrada.' : 'Nenhuma vistoria salva.'}</p>
            </div>`;
        return;
    }

    grid.innerHTML = vistorias.map(v => `
        <div class="vistoria-card">
            <img src="https://cdn-icons-png.flaticon.com/512/1055/1055644.png" class="icon-img" alt="Vistoria">
            <h3>${v.unidade}</h3>
            <p>${formatarDataPtBR(v.data)}</p>
            <div class="card-actions">
                <button class="card-btn" onclick="downloadPdf('${v.id}')" title="Baixar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="card-btn" onclick="editVistoria('${v.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="card-btn delete" onclick="confirmDelete('${v.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function confirmDelete(id) {
    if (confirm("Deseja realmente excluir esta vistoria?")) {
        deleteVistoria(id);
        renderHome(document.getElementById('searchInp')?.value || "");
    }
}

function editVistoria(id) {
    window.location.href = `editor.html?id=${id}`;
}

function downloadPdf(id) {
    window.open(`editor.html?id=${id}&print=true`, '_blank');
}

// Lógica do Modal de Vídeo (Ajustada para vídeo local)
function setupVideoModal() {
    const btnComoUsar = document.getElementById("btnComoUsar");
    const modalVideo = document.getElementById("modalVideo");
    const closeModal = document.querySelector(".close-modal");
    const playerVideo = document.getElementById("playerVideo");

    // Função para fechar e resetar o vídeo local
    const closeAndResetVideo = () => {
        // 1. Esconder o modal
        modalVideo.style.display = "none";
        
        // 2. Pausar o vídeo e voltar para o início (0:00)
        if (playerVideo) {
            playerVideo.pause();          // Pausa a reprodução
            playerVideo.currentTime = 0;  // Volta para o início
        }
    };

    if (btnComoUsar) {
        btnComoUsar.addEventListener("click", () => {
            modalVideo.style.display = "flex";
        });
    }

    if (closeModal) {
        closeModal.addEventListener("click", (e) => {
            e.preventDefault();
            closeAndResetVideo();
        });
    }

    // Fechar ao clicar fora do conteúdo do modal
    window.addEventListener("click", (event) => {
        if (event.target === modalVideo) {
            closeAndResetVideo();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderHome();
    setupVideoModal();
    
    const searchInp = document.getElementById('searchInp');
    if (searchInp) {
        searchInp.addEventListener('input', (e) => {
            renderHome(e.target.value);
        });
    }
});