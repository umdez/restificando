
# Os Ganchos

Para cada um dos percursos nós teremos os ganchos. Um exemplo simples é listado abaixo:

```javascript
fonte.ler.iniciar.antesQue = function() {
  // Este gancho é chamado antes que seja chamado a ação/percurso de iniciar
}

fonte.criar.enviar.acao = function() {
  // Este gancho é chamado e executado
}

fonte.criar.enviar.depoisDe = function() {
  // Este gancho é chamado depois que a ação/percurso enviar seja executada.
}
```
