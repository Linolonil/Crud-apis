// const express = require("express");

// const server = express();

// server.use(express.json());

// const cursos = [
//   "Fullstack Master",
//   "Desenvolvimento de Games",
//   "Viver de Youtube",
// ];

// // retornar um curso
// server.get("/cursos/:index", (req, res) => {
//   const { index } = req.params;

//   return res.json(cursos[index]);
// });

// // retorna todos os cursos
// server.get("/cursos", (req, res) => {
//   return res.json(cursos);
// });

// // criar um novo curso
// server.post("/cursos", (req, res) => {
//   const { name } = req.body;
//   cursos.push(name);

//   return res.json(cursos);
// });

// //atualizar um curso
// server.put("/cursos/:index", (req, res) => {
//   const { index } = req.params;
//   const { name } = req.body;

//   cursos[index] = name;

//   return res.json(cursos);
// });

// // deletar um curso
// server.delete("/cursos/:index", (req, res) => {
//   const { index } = req.params;

//   cursos.splice(index, 1);
//   return res.json({ message: "o curso foi deletado" });
// });

// server.listen(3000);
const express = require("express");

const server = express();

server.use(express.json());

// Dados de um usuário (exemplo)
let user = null;

// Dados de recados (exemplo)
let recados = [];

// Middleware para permitir o uso do JSON no corpo das requisições
server.use(express.json());

// Rota para criação de conta
server.post("/accounts", (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica se o e-mail já está em uso
  if (user && user.email === email) {
    return res.status(400).json({ error: "E-mail já em uso" });
  }

  // Cria um novo usuário
  user = { id: 1, nome, email, senha };

  return res.status(201).json({ message: "Conta criada com sucesso" });
});

// Rota para login
server.post("/login", (req, res) => {
  const { email, senha } = req.body;

  // Verifica se o usuário existe e as credenciais estão corretas
  if (!user || user.email !== email || user.senha !== senha) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  return res.status(200).json({ message: "Login realizado com sucesso" });
});

// Rota para criar um novo recado
server.post("/recados", (req, res) => {
  const { titulo, descricao } = req.body;

  // Cria um novo recado
  const novoRecado = { id: recados.length + 1, titulo, descricao };

  recados.push(novoRecado);

  return res
    .status(201)
    .json({ message: "Recado criado com sucesso", recado: novoRecado });
});

// Rota para listar todos os recados
server.get("/recados", (req, res) => {
  return res.status(200).json(recados);
});

// Rota para recuperar um recado específico por ID
server.get("/recados/:id", (req, res) => {
  const recadoId = parseInt(req.params.id);

  // Procura o recado pelo ID
  const recado = recados.find((recado) => recado.id === recadoId);

  if (!recado) {
    return res.status(404).json({ error: "Recado não encontrado" });
  }

  return res.status(200).json(recado);
});

// Rota para atualizar um recado específico por ID
server.put("/recados/:id", (req, res) => {
  const recadoId = parseInt(req.params.id);
  const { titulo, descricao } = req.body;

  // Procura o recado pelo ID
  const recado = recados.find((recado) => recado.id === recadoId);

  if (!recado) {
    return res.status(404).json({ error: "Recado não encontrado" });
  }

  // Atualiza os dados
  recado.titulo = titulo;
  recado.descricao = descricao;

  return res
    .status(200)
    .json({ message: "Recado atualizado com sucesso", recado });
});

// Rota para excluir um recado específico por ID
server.delete("/recados/:id", (req, res) => {
  const recadoId = parseInt(req.params.id);

  // Procura o recado pelo ID
  const index = recados.findIndex((recado) => recado.id === recadoId);

  if (index === -1) {
    return res.status(404).json({ error: "Recado não encontrado" });
  }

  // Remove o recado do array de recados
  recados.splice(index, 1);

  return res.status(200).json({ message: "Recado excluído com sucesso" });
});

// Inicia o servidor
server.listen(3000, console.log("Servidor iniciado na porta 3000"));
