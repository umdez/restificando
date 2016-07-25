# Controladores

Imagine que para um modelo chamado 'usuarios', teremos alguns controladores listados abaixo:

|  Controlador | Descrição  | Ação  | 
|---|---|---|
| usuarios.criar  | Requisita a criação de um registro para esta fonte  | Create/Criar  |
| usuarios.listar  | Requisita uma lista de registros desta fonte  | List/Listar  | 
| usuarios.ler  | Requisita um unico registro desta fonte passando um identificador  | Read/Ler  |
| usuarios.atualizar  | Requisita a atualização de um registro desta fonte  | Update/Atualizar  |
| usuarios.deletar  | Requisita a remoção de um registro desta fonte  | Delete/Deletar  |

Os **controladores** listados acima serão chamados sempre que houver uma requisição http em algum dos nossos **estágios finais**.
Os **estágios finais** são as rotas associadas a um determinado modelo. Por exemplo, imagine o modelo 'usuarios', ele
terá os seguintes **estágios finais**:

|  Estágio Final | Controlador  | Descrição  | Ação  | 
|---|---|---|---|
| POST /usuarios | usuarios.criar  | Cria um registro de usuário  | Create/Criar  | 
| GET /usuarios   | usuarios.listar  | Pega uma lista de registros de usuarios  | List/Listar  | 
| GET /usuarios/:identificador | usuarios.ler  | Pega um unico registro de usuarios passando um identificador  | Read/Ler  | 
| PUT /usuarios/:identificador  | usuarios.atualizar  | Atualização de um registro de usuários  | Update/Atualizar  | 
| DELETE /usuarios/:identificador  | usuarios.deletar  | Apaga um registro dos usuários  | Delete/Deletar  | 
