# Como utilizar os Controladores, os Percursos e os Ganchos.

Um exemplo simples de como usar os controladores, os percursos e os ganchos.

    // Abaixo nós informamos o controlador ler e seus percursos e ganchos. Isso fornece um ótimo controle 
    // de cada rota.
    var osMeusControladores = {
      'ler': {        // O Controlador ler
        'iniciar': {  // O Percurso iniciar
          antesQue: function(req, res, contexto) {   // O Gancho iniciar_antesQue é chamado em primeiro
            return contexto.continuar;
          },
          acao: function(req, res, contexto) {         // O Gancho iniciar é chamado em segundo
            return contexto.continuar;
          },
          depoisDe: function(req, res, contexto) {     // O Gancho iniciar_depoisDe é chamado em terceiro
            return contexto.continuar;
          }
        }
      }
    }
    
    // Agora informaremos que iremos utilizar.
    aFonteDoRestificando.usar(osMeusControladores);
