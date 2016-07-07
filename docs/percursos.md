
Para cada um dos **controladores** de uma **fonte** existem também os **percursos**. Os **percursos** podem ser utilizados para acrescentar ou substituir o comportamento para cada requisição nos **estágios finais**. Abaixo listamos os **percursos** disponíveis:

 - start
 - auth
 - fetch
 - data
 - write
 - send
 - complete
 
Nós podemos então utilizar os **percursos** acima para uma diversidade de coisas, no exemplo abaixo apresentamos uma forma de 
proibir qualquer tentativa de apagar um registro no modelo 'usuarios'

    // Não permitir remoção do registro do usuario
    usuarios.delete.auth(function(req, res, contexto) {
      // Pode ser por meio de um throw
      // throw new ForbiddenError("Não é possível deletar este usuário");
      // Ou pode ser retornando um erro:
      // return contexto.error(403, "Não é possível deletar este usuário");
    })
