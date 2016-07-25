# Erros

O Restificando possui alguns erros estáticos mas que fica a cargo do desenvolvedor adicionar outros. Estes erros são:

|Estatos do erro | Classe| Descrição|
|---|---|---|
|500| RestificandoErro()| Erro base que pode acontecer no nosso próprio serviço.|
|400| ErroDeRequisicaoRuim()| Erro de Requisição Ruim ou Bad Request Error.|
|403| ErroDeProibicao()| Erro de Proibição ou Forbidden Error.|
|404| ErroDeNaoEncontrado()| Erro de Não Encontrado ou Not Found Error.|

Também utilizaremos um retorno caso tudo esteja correto.

|Classe| Descrição|
|---|---|
|RequisicaoCompleta()| Quando a requisição realizada ocorreu bem e completou|

      // Assim que necessário o erro pode ser lançado (throw)
      throw new ErroDeProibicao("Não é possível deletar este usuário");
