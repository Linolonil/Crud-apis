const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Dados temporários para simular o armazenamento em memória

const usuariosData = {};

let contadorUsuarios = 1;
let usuarioLogadoId = null;

//      CLASSES
// estrutura de dados do usuário
class Usuario {
  constructor(id, email, senha) {
    this.id = id;
    this.email = email;
    this.senha = senha;
    this.recados = [];
    this.contadorRecados = 1;
  }
}
//  estrutura de dados do recado
class Recado {
  constructor(id, titulo, descricao) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
  }
}

//    MIDDLEWARES

// verifica se existe usuarios com o mesmo email criado
function usuarioExistente(req, res, next) {
  const { email } = req.body;

  // Verifica se o usuário já existe
  const usuarioExistente = Object.values(usuariosData).find(
    (user) => user.email === email
  );

  if (usuarioExistente) {
    return res.status(400).json({ mensagem: "Usuário já existe." });
  }

  // Se o usuario nao existe, pode prosseguir para a criaçao do novo usuário
  next();
}

// verifica se o recado pertence ao usuário logado
function verificarRecadoDoUsuario(req, res, next) {
  const recadoId = parseInt(req.params.id);
  const usuarioLogado = usuariosData[usuarioLogadoId];

  const recadoDoUsuario = usuarioLogado.recados.find(
    (recado) => recado.id === recadoId
  );

  if (!recadoDoUsuario) {
    return res.status(404).json({
      mensagem: "Recado não encontrado ou não pertence ao usuário logado.",
    });
  }

  // Passa o recado do usuário para os próximos middlewares ou rotas
  req.recadoDoUsuario = recadoDoUsuario;
  next();
}
// verifica se o recado existe
function verificarRecadoExistente(req, res, next) {
  const recadoId = parseInt(req.params.id);

  const recadoExiste = Object.values(usuariosData).some((usuario) =>
    usuario.recados.some((recado) => recado.id === recadoId)
  );

  if (!recadoExiste) {
    return res.status(404).json({ mensagem: "Recado não encontrado." });
  }

  next();
}

//     ROTAS

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
//   Rota para criar um novo usuário
app.post("/usuarios", usuarioExistente, (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos." });
  }

  // Cria um novo usuário e o adiciona ao objeto usuariosData
  const novoUsuario = new Usuario(contadorUsuarios++, email, senha);

  usuariosData[novoUsuario.id] = novoUsuario;

  return res
    .status(201)
    .json({ mensagem: "Usuário criado com sucesso.", usuario: novoUsuario });
});
// Rota para realizar o login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const usuario = Object.values(usuariosData).find(
    (user) => user.email === email && user.senha === senha
  );

  if (!usuario) {
    return res.status(400).json({ mensagem: "E-mail ou senha inválidos." });
  }

  // Faz logout do usuário anterior (se caso tiver algum logado)
  usuarioLogadoId = null;

  // Define o novo usuário como logado
  usuarioLogadoId = usuario.id;
  return res.status(200).json({
    mensagem: "Login realizado com sucesso.",
    usuario: usuario,
  });
});

// CRUD

// CREATE
app.post("/recados", (req, res) => {
  const titulo = req.body.titulo;
  const descricao = req.body.descricao;

  // Verifica se o usuário está logado
  if (!usuarioLogadoId) {
    return res.status(401).json({ mensagem: "Usuário não logado." });
  }

  // Obtém o usuário logado
  const usuarioLogado = usuariosData[usuarioLogadoId];

  // Cria um novo recado com o ID único para o usuário logado
  const novoRecado = new Recado(
    usuarioLogado.contadorRecados++,
    titulo,
    descricao
  );

  // Adiciona o novo recado à lista de recados do usuário logado
  usuarioLogado.recados.push(novoRecado);

  return res
    .status(201)
    .json({ mensagem: "Recado criado com sucesso.", recado: novoRecado });
});
// READ
app.get("/recados", (req, res) => {
  // Verifica se o usuário está logado
  if (!usuarioLogadoId) {
    return res.status(401).json({ mensagem: "Usuário não logado." });
  }

  // Obtém o usuário logado
  const usuarioLogado = usuariosData[usuarioLogadoId];

  return res.status(200).json({ recados: usuarioLogado.recados });
});
// UPDATE
app.put(
  "/recados/:id",
  verificarRecadoDoUsuario,
  verificarRecadoExistente,
  (req, res) => {
    const recadoId = parseInt(req.params.id);
    const { titulo, descricao } = req.body;

    // Obtém o recado do usuário logado
    const recadoDoUsuario = req.recadoDoUsuario;

    // Atualiza os campos do recado
    recadoDoUsuario.titulo = titulo;
    recadoDoUsuario.descricao = descricao;

    return res.status(200).json({
      mensagem: "Recado atualizado com sucesso.",
      recado: recadoDoUsuario,
    });
  }
);
// DELETE
app.delete("/recados/:id", verificarRecadoDoUsuario, (req, res) => {
  const recadoId = parseInt(req.params.id);

  // Obtém o usuário logado
  const usuarioLogado = usuariosData[usuarioLogadoId];

  // Filtra a lista de recados do usuário, mantendo apenas aqueles que não têm o ID do recado a ser deletado
  usuarioLogado.recados = usuarioLogado.recados.filter(
    (recado) => recado.id !== recadoId
  );

  return res.status(200).json({ mensagem: "Recado deletado com sucesso." });
});

// Inicia o servidor na porta 8080
const porta = 8080;
app.listen(porta, () => console.log("Servidor iniciado na porta " + porta));
