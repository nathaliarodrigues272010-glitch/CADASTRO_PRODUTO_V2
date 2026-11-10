
//
// FASE 1: MODELAGEM DOS DADOS (POO)
//

class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: GERENCIAMENTO DE ESTADO
//

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

// Salvar produtos no LocalStorage
function salvarNoLocalStorage() {
    try {
        const listaEmTexto = JSON.stringify(listaDeProdutos);
        localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
    } catch (erro) {
        mostrarErro("Não foi possível salvar os produtos no navegador.");
    }
}

// Carregar produtos salvos
function carregarDoLocalStorage() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos) {
            const produtosObjetos = JSON.parse(dadosSalvos);

            if (!Array.isArray(produtosObjetos)) {
                throw new Error("Formato inválido");
            }

            produtosObjetos.forEach((prod) => {
                const produtoInstanciado = new Produto(
                    prod.nome,
                    prod.preco,
                    prod.quantidade
                );

                listaDeProdutos.push(produtoInstanciado);
            });
        }

    } catch (erro) {
        mostrarErro("Não foi possível carregar os produtos salvos.");
    }
}

//
// FASE 3: CAPTURA DE ELEMENTOS DO HTML
//

const formProduto = document.getElementById("produto-form");

const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");

const btnLimparTudo = document.getElementById("limpar-tabela");

const totalEstoqueEl = document.getElementById("total-estoque");

const campoBusca = document.getElementById("campo-busca");

const tabelaBody = document.querySelector("#tabela-produtos tbody");

const mensagemVazia = document.getElementById("mensagem-vazia");

const mensagemErro = document.getElementById("mensagem-erro");
const mensagemSucesso = document.getElementById("mensagem-sucesso");

// Elementos do modal de confirmação
const modalConfirmacao = document.getElementById("modal-confirmacao");

const textoConfirmacao = document.getElementById("texto-confirmacao");

const btnCancelar = document.getElementById("btn-cancelar");
const btnConfirmar = document.getElementById("btn-confirmar");

// Elementos do modal Bootstrap
const btnBootstrap = document.getElementById("btn-bootstrap");

const modalBootstrap = document.getElementById("modal-bootstrap");

const btnFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

//
// FASE 4: MENSAGENS INLINE V5
//

// Mostrar mensagem de erro na página
function mostrarErro(mensagem) {
    mensagemSucesso.hidden = true;

    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;
}

// Mostrar mensagem de sucesso na página
function mostrarSucesso(mensagem) {
    mensagemErro.hidden = true;

    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.hidden = false;
}

// Limpar mensagens
function limparMensagens() {
    mensagemErro.hidden = true;
    mensagemSucesso.hidden = true;

    mensagemErro.textContent = "";
    mensagemSucesso.textContent = "";
}

//
// FASE 5: CADASTRO E VALIDAÇÃO DE PRODUTOS
//

formProduto.addEventListener("submit", function(event) {

    event.preventDefault();

    limparMensagens();

    const nome = nomeInput.value.trim();
    const preco = parseFloat(precoInput.value);
    const quantidade = Number(quantidadeInput.value);

    // Validação do nome
    if (nome === "") {
        mostrarErro("Preencha o nome do produto!");
        nomeInput.focus();
        return;
    }

    // Validação do preço
    if (
        precoInput.value === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        mostrarErro("Digite um preço válido e maior que zero!");
        precoInput.focus();
        return;
    }

    // Validação da quantidade
    if (
        quantidadeInput.value === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        mostrarErro("Digite uma quantidade inteira maior que zero!");
        quantidadeInput.focus();
        return;
    }

    // Criação do novo produto
    const novoProduto = new Produto(nome, preco, quantidade);

    listaDeProdutos.push(novoProduto);

    salvarNoLocalStorage();

    atualizarInterface();

    formProduto.reset();

    mostrarSucesso("Produto cadastrado com sucesso!");

    nomeInput.focus();
});

//
// FASE 6: PESQUISA DINÂMICA V4
//

campoBusca.addEventListener("input", function() {

    atualizarInterface();

});

//
// FASE 7: MODAL DE CONFIRMAÇÃO V5
//

// Guarda qual ação deverá ser realizada após a confirmação
let acaoPendente = null;

// Abrir modal para excluir um produto
function abrirModalExclusao(indexReal) {

    acaoPendente = {
        tipo: "excluir",
        indice: indexReal
    };

    textoConfirmacao.textContent =
        "Tem certeza de que deseja excluir este produto?";

    modalConfirmacao.hidden = false;

    btnCancelar.focus();
}

// Abrir modal para limpar todo o estoque
function abrirModalLimparTudo() {

    acaoPendente = {
        tipo: "limpar"
    };

    textoConfirmacao.textContent =
        "Tem certeza de que deseja remover TODOS os produtos do estoque? Essa ação não poderá ser desfeita.";

    modalConfirmacao.hidden = false;

    btnCancelar.focus();
}

// Fechar modal sem realizar nenhuma exclusão
function fecharModalConfirmacao() {

    modalConfirmacao.hidden = true;

    acaoPendente = null;
}

// Botão Cancelar
btnCancelar.addEventListener("click", function() {

    fecharModalConfirmacao();

});

// Botão Confirmar
btnConfirmar.addEventListener("click", function() {

    if (!acaoPendente) {
        return;
    }

    // Guarda a ação antes de limpar o modal
    const acao = acaoPendente;

    fecharModalConfirmacao();

    if (acao.tipo === "excluir") {

        listaDeProdutos.splice(acao.indice, 1);

        salvarNoLocalStorage();

        atualizarInterface();

        mostrarSucesso("Produto removido com sucesso!");

    } else if (acao.tipo === "limpar") {

        listaDeProdutos.length = 0;

        salvarNoLocalStorage();

        atualizarInterface();

        mostrarSucesso("Todos os produtos foram removidos!");

    }

});

// Botão Limpar Tudo abre o modal
btnLimparTudo.addEventListener("click", function() {

    limparMensagens();

    if (listaDeProdutos.length === 0) {

        mostrarErro("O estoque já está vazio!");

        return;
    }

    abrirModalLimparTudo();

});

// Fechar modal ao clicar fora da janela
modalConfirmacao.addEventListener("click", function(event) {

    if (event.target === modalConfirmacao) {
        fecharModalConfirmacao();
    }

});

//
// FASE 8: MODAL CONCEITO BOOTSTRAP V5
//

// Abrir modal Bootstrap
btnBootstrap.addEventListener("click", function() {

    modalBootstrap.hidden = false;

    btnFecharBootstrap.focus();

});

// Fechar modal Bootstrap
btnFecharBootstrap.addEventListener("click", function() {

    modalBootstrap.hidden = true;

});

// Fechar modal clicando fora do conteúdo
modalBootstrap.addEventListener("click", function(event) {

    if (event.target === modalBootstrap) {
        modalBootstrap.hidden = true;
    }

});

// Fechar os modais com a tecla ESC
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        fecharModalConfirmacao();

        modalBootstrap.hidden = true;

    }

});

//
// FASE 9: FILTRAGEM DOS PRODUTOS V4
//

function obterProdutosFiltrados() {

    const termoBusca = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );

}

//
// FASE 10: ATUALIZAÇÃO DO TOTAL EM ESTOQUE
//

function atualizarTotalEstoque(produtosVisiveis) {

    const total = produtosVisiveis.reduce((acc, produto) => {

        return acc + produto.calcularSubtotal();

    }, 0);

    totalEstoqueEl.textContent =
        `Total em Estoque: ${total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`;

}

//
// FASE 11: RENDERIZAÇÃO DA TABELA
//

function renderizarTabela() {

    tabelaBody.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();

    // Verifica se existem produtos encontrados
    if (produtosFiltrados.length === 0 && listaDeProdutos.length > 0) {

        mensagemVazia.hidden = false;

    } else {

        mensagemVazia.hidden = true;

    }

    // Percorre os produtos filtrados
    produtosFiltrados.forEach((produto) => {

        // Recupera o índice real no array original
        const indexReal = listaDeProdutos.indexOf(produto);

        const linha = document.createElement("tr");

        // Criar células com segurança
        const celulaNome = document.createElement("td");
        const celulaPreco = document.createElement("td");
        const celulaQuantidade = document.createElement("td");
        const celulaSubtotal = document.createElement("td");
        const celulaAcoes = document.createElement("td");

        celulaNome.textContent = produto.nome;

        celulaPreco.textContent =
            produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        celulaQuantidade.textContent = produto.quantidade;

        celulaSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        // Botão de remover
        const btnRemover = document.createElement("button");

        btnRemover.textContent = "Remover";

        btnRemover.className = "btn-remover";

        btnRemover.type = "button";

        btnRemover.addEventListener("click", function() {

            limparMensagens();

            abrirModalExclusao(indexReal);

        });

        celulaAcoes.appendChild(btnRemover);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);

    });

    // Atualizar total dos produtos visíveis
    atualizarTotalEstoque(produtosFiltrados);

}

//
// FASE 12: ATUALIZAÇÃO GERAL DA INTERFACE
//

function atualizarInterface() {

    renderizarTabela();

}

//
// FASE 13: INICIALIZAÇÃO DO SISTEMA
//

carregarDoLocalStorage();

atualizarInterface();
