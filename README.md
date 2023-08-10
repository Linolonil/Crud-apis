# API DE GERENCIAMENTO DE RECADOS USANDO NODE.JS E EXPRESS

Este é um exemplo de uma API de gerenciamento de recados implementada em Node.js usando o framework Express. A API permite que os usuários criem, visualizem, atualizem e excluam recados após efetuarem login.

## PRÉ-REQUISITOS

Certifique-se de ter o Node.js instalado em sua máquina.

## INSTALAÇÃO

1. Clone este repositório em sua máquina local.

2. Navegue até o diretório do projeto no terminal.

3. Execute o seguinte comando para instalar as dependências:

npm install

# USO
Inicie o servidor executando o seguinte comando:
npm run dev

Acesse a API através do seguinte URL base:
http://localhost:8080

# ENDPOINTS
1. CRIAR UM NOVO USUÁRIO
bash
POST /usuarios
Cria um novo usuário com base no email e senha fornecidos.

2. REALIZAR LOGIN
POST /login
Realiza o login do usuário com base no email e senha fornecidos, gerando uma sessão.

3. CRIAR UM NOVO RECADO
POST /recados
Cria um novo recado para o usuário logado.

4. OBTER LISTA DE RECADOS
GET /recados
Obtém a lista de recados do usuário logado.

5. ATUALIZAR UM RECADO
PUT /recados/:id
Atualiza um recado específico pertencente ao usuário logado com base no ID fornecido.

6. EXCLUIR UM RECADO
DELETE /recados/:id
Exclui um recado específico pertencente ao usuário logado com base no ID fornecido.

# MIDDLEWARES
A API também utiliza os seguintes middlewares para verificação e validação:

## usuarioExistente: 
Verifica se já existe um usuário com o mesmo email.
## verificarRecadoDoUsuario:
Verifica se um recado pertence ao usuário logado.
## verificarRecadoExistente: 
Verifica se um recado existe.

