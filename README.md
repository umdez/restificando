# restificando
Contêm características para rotas.

Abaixo nós criamos a fonte do serviço RESTFUL, utilizando o Epilogue, para implementação de operações CRUD.
 
Um serviço CRUD é um acrônimo de Create, Read, Update e Delete. Ou seja, ele fornecerá os 
serviços de Criar, Ler, Atualizar e Deletar as entradas do nosso banco de dados.
 
Imagine que para um modelo chamado 'usuarios', teremos alguns controladores listados abaixo:

 - usuarios.create
 - usuarios.list
 - usuarios.read
 - usuarios.update
 - usuarios.delete

Os controladores listados acima serão chamados sempre que houver uma requisição http em algum dos nossos endpoints.
Os endpoints são as rotas associadas a um determinado modelo. Por exemplo, imagine o modelo 'usuarios', ele
terá os seguintes endpoints:
 
- POST /usuarios                  (Cria um registro de usuário) (Create)
- GET /usuarios                   (Pega uma lista de registros de usuarios) (Read)
- GET /usuarios/:identificador    (Pega um unico registro de usuarios passando um identificador) (Read)
- PUT /usuarios/:identificador    (Atualização de um registro de usuários) (Update)
- DELETE /usuarios/:identificador (Apaga um registro dos usuários) (Delete)

O nosso modelo ficticio 'usuarios' possue os controladores já listados acima, e para cada um destes controladores, 
o modelo possue também alguns hooks. Os hooks podem ser utilizados para acrescentar ou substituir o comportamento
para cada requisição nos endpoints. Abaixo listamos os hooks disponíveis:

 - start
 - auth
 - fetch
 - data
 - write
 - send
 - complete
 
Nós podemos utilizar os hooks acima para uma diversidade de coisas, no exemplo abaixo apresentamos uma forma de 
proibir qualquer tentativa de apagar um registro no modelo 'usuarios'

    // Não permitir remoção do registro do usuario
    usuarios.delete.auth(function(req, res, context) {
      // Pode ser por meio de um throw
      // throw new ForbiddenError("Não é possível deletar este usuário");
      // Ou pode ser retornando um erro:
      // return context.error(403, "Não é possível deletar este usuário");
    })
