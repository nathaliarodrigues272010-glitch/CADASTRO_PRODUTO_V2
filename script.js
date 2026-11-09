//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    // Método que calcula o subtotal do produto
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado (Memória)
//
const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

// 1. Função para Salvar os dados no navegador
function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeProdutos);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

// 2. Função Carregar os dados salvos quando a página abre
function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const campoBusca = document.getElementById("campo-busca"); // Campo de pesquisa dinâmica (V4)

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar Produto pelo Formulário
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
    listaDeProdutos.push(novoProduto);

    salvarNoLocalStorage();
    atualizarInterface();
    formProduto.reset();
    document.getElementById("nome").focus();
});

// 2. Evento de Digitação Dinâmica na Pesquisa (V4)
if (campoBusca) {
    campoBusca.addEventListener("input", () => {
        atualizarInterface();
    });
}

// 3. Limpar toda a tabela
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        salvarNoLocalStorage();
        atualizarInterface();
    }
});

//
// FASE 5: Funções de Atualização e Renderização da Interface
//

// Função intermediária para filtrar produtos usando .filter(), .toLowerCase() e .includes() (V4)
function obterProdutosFiltrados() {
    const termoBusca = campoBusca ? campoBusca.value.toLowerCase().trim() : "";
   
    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );
}

// Função responsável por remover um único produto pelo índice real
function removerProduto(indexReal) {
    listaDeProdutos.splice(indexReal, 1);
    salvarNoLocalStorage();
    atualizarInterface();
}

// Função responsável por calcular e renderizar o total geral em estoque considerando apenas os itens visíveis na tela (V4)
function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

// Função responsável por re-desenhar a tabela
function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    const mensagemVazia = document.getElementById("mensagem-vazia");

    tabelaBody.innerHTML = "";

    // Obtém os produtos filtrados pela busca atual (V4)
    const produtosFiltrados = obterProdutosFiltrados();

    // Mensagem caso nenhum produto seja encontrado na busca
    if (produtosFiltrados.length === 0 && listaDeProdutos.length > 0) {
        if (mensagemVazia) mensagemVazia.style.display = "block";
    } else {
        if (mensagemVazia) mensagemVazia.style.display = "none";
    }

    produtosFiltrados.forEach((produto) => {
        // Encontra o índice real no array original `listaDeProdutos` para exclusão correta
        const indexReal = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(indexReal));

        tabelaBody.appendChild(linha);
    });

    // Atualiza o total repassando apenas os produtos filtrados/visíveis
    atualizarTotalEstoque(produtosFiltrados);
}

// Função principal que sincroniza a tela com os dados
function atualizarInterface() {
    renderizarTabela();
}

// Inicialização ao carregar a página
carregarDoLocalStorage();
atualizarInterface();