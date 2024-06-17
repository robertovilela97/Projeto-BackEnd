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