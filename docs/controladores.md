# Controladores

Imagine que para um modelo chamado 'usuarios', teremos alguns controladores listados abaixo:

 - usuarios.criar     (Requisita a criação de um registro para esta fonte) (Create)
 - usuarios.listar    (Requisita uma lista de registros desta fonte) (List)
 - usuarios.ler       (Requisita um unico registro desta fonte passando um identificador) (Read)
 - usuarios.atualizar (Requisita a atualização de um registro desta fonte) (Update)
 - usuarios.deletar   (Requisita a remoção de um registro desta fonte) (Delete)

Os **controladores** listados acima serão chamados sempre que houver uma requisição http em algum dos nossos **estágios finais**.
Os **estágios finais** são as rotas associadas a um determinado modelo. Por exemplo, imagine o modelo 'usuarios', ele
terá os seguintes **estágios finais**:
 
- POST /usuarios                  (Cria um registro de usuário) (Create)
- GET /usuarios                   (Pega uma lista de registros de usuarios) (List)
- GET /usuarios/:identificador    (Pega um unico registro de usuarios passando um identificador) (Read)
- PUT /usuarios/:identificador    (Atualização de um registro de usuários) (Update)
- DELETE /usuarios/:identificador (Apaga um registro dos usuários) (Delete)
