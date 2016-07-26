# Listagem

Com o restificando é possível realizar a paginação, a pesquisa, o ordenamento, o sorteio etc. Veja abaixo quais informações são 
necessárias:

|Parametro| Função | Descrição| Valores |
|---|---|---|---|
| &s | Sorteio | realiza o sorteio de acordo com uma coluna | O nome duma coluna |
| &o | Ordenamento | realiza o ordenamento dos registros | [DESC,ASC,-1,1] |
| &count | Contador | Informa a quantidade de registros por página |  |
| &limit | Limitar | Informa a quantidade total de registros ou um limite |  |
| &b | Buscar | Informa um texto para que os registros sejam filtrados/buscados | Uma ou mais palavras |
| &page | Paginar | Informa qual o número da página a ser listada |  |

Quando acessarmos o endereco https://endereco/exames?s=id&o=asc&page=7&count=5&b=17OH%tr%o&limit=38
- Faz sorteio pela coluna id (&s=id)
- Faz um ordenamento ascendente (&o=asc)
- Faz a requisição da sétima página (&page=7)
- Requisita 5 registros por página (&count=5)
- Faz a busca por registros que contêm a frase '17OH tr o' (&b=17OH%tr%o)
- Informa o número limite total de registros (&limit=38)
