# 🛡️ Algoritmo de Auditoria de Dados de Vendas

## 📝 Descrição do Projeto
Este projeto consiste em um script de auditoria desenvolvido para analisar transações de vendas, identificar anomalias e aplicar regras de segurança automatizadas. O objetivo principal é monitorar os valores inseridos e acionar um estado de "quarentena" no sistema caso a média das transações ultrapasse um limite financeiro predefinido.

O algoritmo processa lotes de três vendas, calcula o valor médio e verifica se alguma venda individual tem um valor desproporcional (neste caso, cinco vezes maior ou igual à média), sinalizando-a para **revisão manual**. Se o limite de segurança da média for atingido, o sistema exige a intervenção direta de um gerente para reavaliar o teto financeiro e liberar as operações.

## 🚀 Tecnologias Utilizadas
* **Linguagem:** Python 3
* **Ferramentas:** Google Colab, Jupyter Notebook

## 📊 Resultados e Aprendizados
O projeto serviu para aplicar e consolidar conceitos estruturais de lógica de programação na criação de regras de negócio.
* **Automação de Regras de Negócio:** Implementação de travas de segurança e fluxos de aprovação gerencial.
* **Gerenciamento de Escopo:** Manipulação de variáveis de escopo global (como o `LIMITE_SEGURANCA`) dentro de funções de análise.
* **Detecção de Anomalias (Outliers):** Criação de uma lógica matemática simples e eficaz para identificar vendas com valores que fogem do padrão do lote analisado.

## 🔧 Como Executar
1. Clone este repositório ou faça o download do arquivo.
2. Certifique-se de ter o Python 3.x instalado em sua máquina.
3. Abra o terminal na pasta do projeto e execute o comando: `python projeto_algoritmo_de_auditoria_de_dados.py`.
4. Siga as instruções no terminal para inserir os valores das vendas e interagir com o sistema.

---
[Voltar ao início](https://github.com/profdiegocarvalho/portfolio-diego-marques-de-carvalho)
