# Estágios Finais

Os controladores são atrelados ha algumas requisições **HTTP**. Estas requisições são feitas aos estágios finais. Cada rota final está associada a determinado controlador de uma fonte. Por exemplo, imagine uma fonte chamada 'usuarios', essa fonte irá possuir determinados estágios finais como exemplificado abaixo:
 
| Método  | Estágio final | Descrição |  Ação |   
|---|---|---|---|
| POST  | /usuarios  |  Cria um registro de usuário |  Create/Criar  |   
| GET  |  /usuarios | Pega uma lista de registros de usuarios  |  List/Listar |   
| GET  |  /usuarios/:identificador | Pega um unico registro de usuarios passando um identificador  |  Read/Ler |
| PUT  |  /usuarios/:identificador | Atualização de um registro de usuários  | Update/Atualizar  |
| DELETE  | /usuarios/:identificador  |  Apaga um registro dos usuários | Delete/Deletar  |

Cada um deles está associado a um controlador. Por exemplo, enviando um POST para /usuarios irá disparar o controlador de criar.
