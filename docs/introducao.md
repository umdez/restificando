# Introdução

O restificando é uma maneira fácil de implementar serviços **RESTFUL**. Com estes serviços você poderá realizar operações de **Criar**, **Ler**, **Atualizar** e **Deletar** as entradas dum Banco de Dados MySQL.
 
O restificando utiliza como dependencias o Express e também o Sequelize. Sendo possível inciar serviços para qualquer modelo do Sequelize. O Express oferecerá uma forma de comunicação entre o restificando e o Sequelize. 

    // Você poderá iniciar uma fonte no Restificando desta forma:
    restificando.fonte({
      modelo: modelo,
      estagiosFinais: ['/plural/', '/plural/:identificador']
    });
    
    // Após iniciar uma fonte, é necessário apenas iniciar o serviço desta forma:
    restificando.inicializar({
      aplicativo: express,
      sequelize: sequelize,
      base: ''
    });
