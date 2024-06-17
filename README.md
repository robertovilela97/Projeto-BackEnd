# Projeto-BackEnd

Programas Utilizados

Visual Studio Code
PostgreSQL 12.19
DBeaver
Node.js

Como Utilizar o Projeto
1. Clonar o repositório na sua máquina.

2. Criar um banco de dados com um nome de sua escolha para utilizar no sistema (PostgreSQL).

Obs.: Utilize os dois scripts no banco recém-criado. Os scripts estão no arquivo BancoUpdater dentro do projeto.

3. Alterar os dados no arquivo .env dentro do projeto. Os dados necessários são:

DB_HOST="test" // Host do banco (normalmente "localhost")
DB_USER="test" // Nome do usuário
DB_PASSWORD="test" // Senha do PostgreSQL
DB_NAME="test" // Nome do banco
DB_PORT="test" // Porta do banco (normalmente "5432")

4. Iniciar o servidor

No terminal, digite:

node api/app.js

O servidor será inicializado no caminho http://localhost:3000/api-docs/.

Neste endereço, configurado pelo Swagger, teremos 8 APIs disponíveis:

POST /api/ponto_interesse/Import - Importa um arquivo CSV e salva os dados no banco.
POST /api/ponto_interesse/Create - Cria um novo ponto de interesse.
GET /api/ponto_interesse/Read - Lista todos os pontos de interesse.
GET /api/ponto_interesse/Radius - Calcula o raio através da latitude e longitude informadas para verificar todos os pontos nesse raio.
PUT /api/ponto_interesse/Update/{id} - Atualiza um ponto de interesse.
PUT /api/ponto_interesse/Inactivate/{id} - Inativa um ponto de interesse.
PUT /api/ponto_interesse/Activate/{id} - Ativa um ponto de interesse.
DELETE /api/ponto_interesse/Delete/{id} - Deleta de forma permanente um ponto de interesse.

Detalhes Adicionais

As APIs de Import, Create, Update, Inactivate, Activate e Delete são acompanhadas por um método que cria um log com algumas informações para controle dos dados.

Em sistemas que requerem controle rigoroso de alterações de dados, é fundamental ter uma tabela de log para registrar todas as ações. Por isso, criamos uma tabela de log.

Para contextos onde não se pode excluir um registro permanentemente, utilizamos um método chamado "Delete lógico" (/api/ponto_interesse/Inactivate/{id}), que apenas inativa o registro, permitindo sua reativação se necessário. Em outros casos, podemos utilizar o "Delete físico" (/api/ponto_interesse/Delete/{id}), que deleta o registro do banco de dados. Mesmo com o delete físico, ainda manteremos o registro no log para visualizar o histórico posteriormente.

Consultas no DBeaver

Para verificar as informações dentro do DBeaver, utilize os seguintes scripts:

SELECT * FROM ponto_interesse;  // Para verificar todos os pontos cadastrados no sistema.

SELECT * FROM log_ponto_interesse;  // Para verificar todos os logs dos pontos de interesse.



Estrutura do Projeto

Este projeto é organizado em vários arquivos para garantir uma separação clara de responsabilidades, o que facilita a manutenção, a colaboração e a escalabilidade. Abaixo está uma descrição dos principais arquivos e suas funções:

ponto_interesse.js: Contém as definições das rotas.
index.js: Contém as funções que implementam a lógica de negócio.
swagger.js: Contém a configuração do Swagger, que é usado para documentar e testar a API.
db.js: Configura a conexão com o banco de dados.
app.js: Responsável pela inicialização do projeto.
constants.js: Contém todas as mensagens de erro, centralizando-as para uso em todo o sistema.

Motivação para a Separação

1. Organização e Manutenibilidade:

Rotas (ponto_interesse.js) e Lógica de Negócio (index.js):

Separar as rotas da lógica de negócio ajuda a manter o código mais organizado. Isso facilita a leitura e a manutenção do projeto, pois cada arquivo tem uma responsabilidade clara.
Com essa separação, fica mais fácil localizar e atualizar o código. Se precisar adicionar ou modificar uma rota, você sabe que isso será feito no arquivo ponto_interesse.js. Da mesma forma, se precisar alterar a lógica de uma função, isso será feito no arquivo index.js.

Documentação da API (swagger.js):

Manter a configuração do Swagger em um arquivo separado ajuda a manter a documentação da API organizada e atualizada. Isso facilita a vida dos desenvolvedores que precisam entender e testar a API.

Configuração do Banco de Dados (db.js):

Separar a configuração do banco de dados permite que a conexão e as configurações relacionadas sejam gerenciadas de forma centralizada, facilitando ajustes e manutenções.

Inicialização do Projeto (app.js):

Manter a inicialização do servidor em um arquivo dedicado permite que o processo de bootstrap da aplicação seja claro e fácil de gerenciar. Todas as configurações iniciais, como middleware, conexões de banco de dados e inicialização de rotas, são feitas em um único lugar.

Mensagens de Erro (constants.js):

Centralizar todas as mensagens de erro em um arquivo separado ajuda a manter a consistência das mensagens retornadas ao usuário. Isso facilita a manutenção, pois qualquer alteração nas mensagens pode ser feita em um único lugar.

2. Reutilização de Código:

Funções (index.js):

Funções que não estão diretamente ligadas às rotas podem ser reutilizadas em diferentes partes do projeto ou até em outros projetos. Mantê-las em um arquivo separado facilita essa reutilização.

3. Testabilidade:

Módulos Separados:

Funções e configurações separadas em módulos distintos são mais fáceis de testar isoladamente. Você pode criar testes unitários para as funções no index.js sem depender das rotas.
Da mesma forma, testes das rotas podem focar apenas na integração e no comportamento esperado, sem se preocupar com a implementação detalhada das funções.
Testes de configuração de banco de dados e inicialização do servidor também se tornam mais gerenciáveis com essa separação.

4. Colaboração:

Trabalho em Equipe:

Em equipes de desenvolvimento, a separação de responsabilidades permite que diferentes membros da equipe trabalhem simultaneamente em diferentes partes do projeto. Por exemplo, um desenvolvedor pode trabalhar na lógica de negócio enquanto outro trabalha na documentação da API ou na configuração do banco de dados.


Estrutura de Arquivos

/Projeto
    /api
        /routes
            ├── ponto_interesse.js    # Definições das rotas
        ├── index.js              # Funções que implementam a lógica de negócio
        ├── swagger.js            # Configuração do Swagger
    /Aplicativo
        ├── db.js                 # Configuração do banco de dados
        └── app.js                # Inicialização do projeto
        └── constants.js