import express from "express";

const app = express();

app.use(express.json());

function validarAlgumaCoisa(request, response, next) {
  console.log("Validei");
  next();
}
// Rota raiz
app.get("/", (request, response) => {
  return response
    .status(200)
    .send("<h1>Bem vindo à API de Transações da Growdev</h1>");
});
// -----------------------------------
const listaUsuarios = [];
// Criei pra testar se estava criando tudo certo
app.get("/lista", (req, res) => {
  return res.status(200).json(listaUsuarios);
});
app.get("/listar", (req, res) => {
  return res.status(200).json(listaRecados);
});
// ----------------------------------------------

// rotas
app.get("/users", (request, response) => {
  const filtro = request.query;

  if (filtro.email && filtro.email.length) {
    const listaFiltradaPorEmail = listaUsuarios.filter((user) =>
      user.email.includes(filtro.email)
    );

    if (!listaFiltradaPorEmail.length) {
      return response.status(404).json({
        sucesso: false,
        dados: null,
        mensagem:
          "Não possui usuários cadastrados até o momento que atendam a condição de filtro!",
      });
    }

    return response.status(200).json({
      sucesso: true,
      mensagem: "Usuários buscados com sucesso",
      dados: listaFiltradaPorEmail,
    });
  }

  const listaUsuariosCopy = JSON.parse(JSON.stringify(listaUsuarios)); // Cria uma cópia da lista de usuários

  // Atualiza as propriedades 'author' e 'recados' em cada usuário para remover as referências circulares
  listaUsuariosCopy.forEach((user) => {
    user.recados = [...user.recados]; // Cria uma cópia do array 'recados'
  });

  return response.status(200).json({
    sucesso: true,
    dados: listaUsuariosCopy,
    mensagem: "Dados de usuários buscados com sucesso!",
  });
});
// buca o usuario pelo id

app.get("/users/:id", (request, response) => {
  const id = request.params.id;

  const usuarioEncontrado = listaUsuarios.find((user) => user.id == id);

  if (!usuarioEncontrado) {
    return response.status(404).json({
      sucesso: false,
      dado: null,
      mensagem: "Usuário não encontrado pelo ID informado",
    });
  }

  const usuarioEncontradoCopy = JSON.parse(JSON.stringify(usuarioEncontrado)); // Cria uma cópia do usuário

  // Atualiza a propriedade 'recados' para remover as referências circulares
  usuarioEncontradoCopy.recados = [...usuarioEncontrado.recados]; // Cria uma cópia do array 'recados'

  return response.status(200).json({
    sucesso: true,
    dados: usuarioEncontradoCopy,
    mensagem: "Usuário encontrado com sucesso!",
  });
});

function verificarDados(request, response, next) {
  const dados = request.body;
  console.log("verificarEmail");

  if (
    !dados.email ||
    !dados.email.includes("@") ||
    !dados.email.includes(".com")
  ) {
    return response.status(400).json({
      sucesso: false,
      dados: null,
      mensagem:
        "É obrigatório informar um e-mail válido para cadastro do usuário",
    });
  }

  if (!dados.password || dados.password.length < 6) {
    return response.status(400).json({
      sucesso: false,
      dados: null,
      mensagem:
        "É obrigatório informar a senha para cadastro do usuário com no mínimo 6 caracteres",
    });
  }

  next();
}
let contadorDeUsuario = 1001;
//  Cria um usuário

app.post("/users", verificarDados, (request, response) => {
  const dados = request.body;

  const novoUsuario = {
    id: contadorDeUsuario++,
    email: dados.email,
    password: dados.password,
    recados: [],
    contadorRecados: 1, // Inicializa o contador de recados com 1
  };

  const existe = listaUsuarios.some((user) => user.email === novoUsuario.email);

  if (existe) {
    return response.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: "Outro usuário já está cadastrado com este e-mail.",
    });
  }

  listaUsuarios.push(novoUsuario);

  return response.status(201).json({
    sucesso: true,
    dados: novoUsuario,
    mensagem: "Usuário cadastrado com sucesso!",
  });
});
app.post("/login", (request, response) => {
  const dados = request.body;

  const user = listaUsuarios.find((user) => user.email === dados.email);

  if (!user || user.password !== dados.password) {
    return response.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: "Usuário não encontrado ou senha incorreta.",
    });
  }

  // Verifica se o usuário já está logado
  if (user.logged) {
    return response.status(400).json({
      sucesso: false,
      dados: null,
      mensagem: "Usuário já está logado.",
    });
  }

  // Define todos os outros usuários como deslogados
  listaUsuarios.forEach((u) => {
    if (u !== user) {
      u.logged = false;
    }
  });

  user.logged = true;

  return response.status(200).json({
    sucesso: true,
    dados: user,
    mensagem: "Usuário logado com sucesso!",
  });
});
const listaRecados = [];
let contadorDeRecados = 0;
app.post("/recados", (request, response) => {
  const data = request.body;

  const usuarioLogado = listaUsuarios.find((user) => user.logged === true);

  if (!usuarioLogado) {
    return response.status(401).json({
      sucesso: false,
      dados: null,
      mensagem: "Usuário não autenticado.",
    });
  }

  const novoRecado = {
    id: `${usuarioLogado.contadorRecados}`, // Utiliza o contadorRecados do usuário para gerar o ID
    titulo: data.titulo,
    descricao: data.descricao,
    author: usuarioLogado.id,
  };

  usuarioLogado.recados.push(novoRecado); // Adiciona o recado ao array de recados do usuário logado
  usuarioLogado.contadorRecados++; // Incrementa o contador de recados do usuário

  listaRecados.push(novoRecado);

  return response.status(201).json({
    sucesso: true,
    dados: novoRecado,
    mensagem: "Recado criado com sucesso!",
  });
});
// Rota para atualizar um recado
app.put("/recados/:id", (request, response) => {
  const recadoId = request.params.id;
  const usuarioLogado = listaUsuarios.find((user) => user.logged === true);

  if (!usuarioLogado) {
    return response.status(401).json({
      sucesso: false,
      dados: null,
      mensagem: "Usuário não autenticado.",
    });
  }

  const recadoIndex = usuarioLogado.recados.findIndex((recado) => recado.id === recadoId);

  if (recadoIndex === -1) {
    return response.status(404).json({
      sucesso: false,
      dados: null,
      mensagem: "Recado não encontrado.",
    });
  }

  const recadoAtualizado = {
    ...usuarioLogado.recados[recadoIndex],
    titulo: request.body.titulo,
    descricao: request.body.descricao,
  };

  usuarioLogado.recados[recadoIndex] = recadoAtualizado;

  return response.status(200).json({
    sucesso: true,
    dados: recadoAtualizado,
    mensagem: "Recado atualizado com sucesso!",
  });
});
// Rota para excluir um recado
app.delete("/recados/:id", (request, response) => {
  const recadoId = request.params.id;
  const usuarioLogado = listaUsuarios.find((user) => user.logged === true);

  if (!usuarioLogado) {
    return response.status(401).json({
      sucesso: false,
      dados: null,
      mensagem: "Usuário não autenticado.",
    });
  }

  const recadoIndex = usuarioLogado.recados.findIndex((recado) => recado.id === recadoId);

  if (recadoIndex === -1) {
    return response.status(404).json({
      sucesso: false,
      dados: null,
      mensagem: "Recado não encontrado.",
    });
  }

  const recadoExcluido = usuarioLogado.recados.splice(recadoIndex, 1)[0];

  return response.status(200).json({
    sucesso: true,
    dados: recadoExcluido,
    mensagem: "Recado excluído com sucesso!",
  });
});


const porta = 8080;
app.listen(porta, () => console.log("Servidor iniciado na porta " + porta));
