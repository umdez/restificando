
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
