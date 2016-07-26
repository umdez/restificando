# Como configurar

Podemos configurar cada fonte para um modelo do sequelize. Para isso temos as diversas propriedades que podem ser informadas ao adicionarmos uma fonte.

| Propriedade  | Tipo | Descrição  | 
|---|---|---|
| nome  | Texto  |  É o nome dado a tabela (modelo) no banco de dados |
| sePossuiAssociacoes  | Boleano  | Se possui associações  |
| seForRealizarPaginacao  | Boleano  | Caso seja necessário possuir suporte à paginação  |
| seForRecarregarInstancias | Boleano  |   |
| metodoDeAtualizacao  | Texto  | Qual será o método para atualização? put, post ou patch?  |
| estagiosFinais | Matriz | Os estágios para o serviço REST. |
| busca | Objeto | As configurações para busca de registros |


Para realizar a adição de uma fonte é só informar as propriedades acima para o método fonte.

    var restificando = require('restificando');
    
    var fonte = {
       nome: 'umModeloDoSequelize'
    ,  sePossuiAssociacoes: true
    ,  seForRealizarPaginacao: true
    ,  seForRecarregarInstancias: true
    ,  metodoDeAtualizacao: 'put'
    };

    fonte.estagiosFinais = [ 
      '/Fontes'              
    , '/Fontes/:id'
    ];  
    
    fonte.busca = {
      parametro: 'busc'  
    , operador: '$like' 
    , atributos: []   
    };
    
    // Carregamos as fontes deste determinado modelo
    restificando.fonte(fonte);
    
    // Inicia o serviço REST Restificando.
    restificando.inicializar({
      aplicativo: aplicativo  // Aplicativo Express.
    , sequelize: sequelize    // Nosso ORM Sequelize.
    , base: ''        
    });
