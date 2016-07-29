# Percursos

Para cada um dos **controladores** de uma **fonte** existem também os **percursos**. Os **percursos** podem ser utilizados para acrescentar ou substituir o comportamento para cada requisição nos **estágios finais**. Abaixo listamos os **percursos** disponíveis:

| Percurso  |  Descrição | Percurso  |  
|---|---|---|---|---|
| fonte.controlador.iniciar  | Chamado no inicio da requisição  | Start  |   
| fonte.controlador.autenticar  | Utilizado para autenticação e ou autorização da requisição  |  Auth |   
| fonte.controlador.trazer  | Traz dados da Database  | Fetch  |   
| fonte.controlador.dados |  Fazer alguma transformação nos dados da Database | Data  |
| fonte.controlador.escrever  | Escrever para a Database  | Write  |
| fonte.controlador.enviar  | Envia uma resposta para o usuário  | Send  |
| fonte.controlador.completar  | Chamado quando a requisição já estiver completa  | Complete  |
 
Nós podemos então utilizar os **percursos** acima para uma diversidade de coisas, no exemplo abaixo nós apresentamos uma forma de 
proibir qualquer tentativa de apagar um registro no modelo 'usuarios'

```javascript
// Não permitir remoção do registro do usuario
usuarios.deletar.autenticar(function(req, res, contexto) {
  // Pode ser por meio de um throw
  // throw new ErroDeProibicao("Não é possível deletar este usuário");
  // Ou pode ser retornando um erro:
  // return contexto.erro(403, "Não é possível deletar este usuário");
})
```
