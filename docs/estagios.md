# Estágios Finais

Os controladores são atrelados ha algumas requisições **HTTP**. Estas requisições são feitas aos estágios finais. Cada rota final está associada a determinado controlador de uma fonte. Por exemplo, imagine uma fonte chamada 'usuarios', essa fonte irá possuir determinados estágios finais como exemplificado abaixo:
 
- POST /usuarios                  (Cria um registro de usuário) (Create)
- GET /usuarios                   (Pega uma lista de registros de usuarios) (List)
- GET /usuarios/:identificador    (Pega um unico registro de usuarios passando um identificador) (Read)
- PUT /usuarios/:identificador    (Atualização de um registro de usuários) (Update)
- DELETE /usuarios/:identificador (Apaga um registro dos usuários) (Delete)

Cada um deles está associado a um controlador. Por exemplo, enviando um POST para /usuarios irá disparar o controlador de criar.
