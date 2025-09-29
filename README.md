# Book Shop Lama Full Stack
## Preparando o ambiente
O primeiro passo é acessar o diretório do backend para instalar com npm os pacotes que vão ser usadas. Use o comando `npm i express mysql nodemon`.

O comando `npm i`, equivalente a `npm install`, instala três pacotes, **express**, **mysql** e **nodemon**. **express** é um framework para criar servidores web, **mysql** é uma biblioteca para conectar com bancos de dados MySQL e **nodemon** é um utilitário para reiniciar o servidor automaticamente quando houver alterações no código.
### Iniciando o banco de dados MySQL

Com os pacotes instalados, o banco de dados pode ser iniciado. No Workbench, criei um novo schema chamado `test`
```sql
CREATE SCHEMA test;
```

No schema criei a tabela **books**. Essa tabela inicia com quatro colunas, o `id` auto incrementável, tipo inteiro e chave primária. `title`, `description` e `cover` são caracteres e `cover` é o único que pode ser nulo.
```mysql
CREATE TABLE `test`.`books` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `cover` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));
```

Com a tabela construída fiz um novo registro e selecionei todos eles para testar.
 ```mysql
 
 INSERT INTO `test`.`books` (`id`, `title`, `description`, `cover`) VALUES ('1', 'Title', 'This is the description', 'cover.png');
```

```mysql
SELECT * FROM test.books;
```
### Preparando o backend
No script `index.js`, importei o pacote `express` e instanciei o objeto que vai disponibilizar conexão com a aplicação na constante `app`. Com o método `listen()` defini que a porta para acesso será 8800 e passei uma função callback para registrar que o backend foi conectado. 
 ```js
import express from "express";

const app = express();

app.listen(8800, ()=>{
    console.log("Connected to backend!");
})
```

No arquivo `package.json`, configurei o **nodemon** para atualizar o servidor de acordo com as alterações do código. O comando `start` é configurado no objeto `scripts` com uma referência para o arquivo `index.js` ser executado.

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon index.js"
  }
```

De volta no `index.js`, a constante `db` é declarada para realizar a conexão com o banco de dados através da função `createConnection()`
```js
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"@Admin021867",
    database:"test"
});
```

## Backend 
No arquivo `index.js`, a constante `app` é o responsável por definir a estrutura da **API**. O **framework** `express` vai ser usado por disponibilizar **métodos HTTP** e middlewares (intermediários) para lidar com as requisições.

O objeto `app` retornado pelo método `express()`  vai ser usado para controlar os **endpoints**, os **middlewares** e iniciar o servidor.
```js
//ja tinha declarado essa 
//constante enquanto preparava o backend
const app = express();
```

O comando `express.json()` permite que a aplicação leia o **corpo** da requisição quando o `Content-type` for `application/json` e retorna um objeto JS ao `req.body`. Dessa forma o conteúdo que for entregue para a **API** como **Json** vai ser lido convertido para um objeto **JavaScript**
```js
app.use(express.json());
```

O método `cors()` habilita **Cross-Origin Resource Sharing**. Sem **CORS** o navegador vai impedir a requisição que venha de outra origem, mesmo que seja uma origem local mas em uma porta diferente. Como o servidor vai estar na porta 8800 e o frontend vai estar na porta 3000, o **CORS** é necessário. Ele também poderia ser usado para definir qual domínio tem acesso a qual endpoint, mas não é esse o caso aqui
```js
app.use(cors());
```

O `express` já tinha sido importante antes, mas o `cors` ainda precisa ser importado. A ordem de implementação dos **middlewares** é importante porque eles são aplicados na ordem em que são declarados
```js
import express from "express";
import mysql from "mysql";
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());
```

### Testando conexão com o backend
O primeiro passo foi determinar se o **backend** estava disponível para o **Postman**. Para isso o endpoint `/` vai retornar como resposta um **JSON** com uma string.
```js
app.get("/", (req,res)=>{
    res.json("Hello this is the backend");
})
```
### Buscando dados - Read
O endpoint que defini para listar todos os livros foi `/books`, dentro da função callback, declarei a constante `query` com requisição que vai ser feita no banco de dados.

A função `query()` recebe essa constante e uma função callback para lidar com o resultado. Em caso de erro, ele retorna o erro em formato **JSON**, em caso de sucesso ele retorna os dados vindos do banco.
```js
app.get("/books", (req, res)=>{
    const query = "SELECT * FROM books";
    db.query(query, (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
```

### Cadastrando novos livros - Create
Usando o mesmo endpoint, mas com o método **Post**, declarei a função callback para criar novos registros na tabela.

A constante `q` foi declarada com a query que vai ser enviada para o banco de dados, entretanto com o diferencial em `VALUES`. A expressão `(?)` vai receber uma lista com os dados em ordem de cada campo do livro cadastrado. Adicionei na tabela, pelo **MySQL Workbench**, uma nova coluna `price`.

A constante `values` armazena uma lista com os dados vindos da requisição (`req`), que estão guardados no body como **JSON**. Esses serão os dados enviados no lugar da expressão `(?)`.

Na função `query()` do objeto `db`, passei `values` como um dos parâmetros e quando houver sucesso na requisição a resposta recebe um **JSON** com o texto afirmando que o livro foi criado.
```js
app.post("/books", (req, res)=>{
    const q = "INSERT INTO books (`title`, `description`, `cover`, `price`) VALUES (?)"
    const values = [
        req.body.title,
        req.body.description,
        req.body.cover,
        req.body.price
    ];

    db.query(q,[values], (err, data)=>{
        if(err) return res.json(err)
        return res.json("Book has been created")
    })
})
```

### Apagando dados do banco - Delete
O próximo método declarado foi **Delete** e o **endpoint** recebeu um parâmetro `id` na URL. Esse parâmetro vai definir qual livro está sendo retirado do banco de dados.

A query na constante `q` ainda tem a expressão `?`, que nesse caso vai receber um único dado, por isso não tive necessidade de adicionar parênteses. Em seguida a constante `bookId` recebe como valor o **id** que foi enviado nos parâmetros da requisição.

Enquanto realizava os testes com o **Postman**, cometi erros por causa da URL, as vezes eu trocava o `/` que vem antes do `id`.
```js
app.delete("/books/:id", (req,res) => {
    const q = "DELETE FROM books WHERE id = ?";
    const bookId = req.params.id;
	
    db.query(q, bookId, (err, data) => {
        if(err) return res.json(err)
        return res.json("Book has been deleted")
    })
})
```

### Modificando dados registrados - Update
O método **Put** combina a lógica do **Delete** (usa o `id` para identificar o livro) com o **Post** (recebe dados no corpo da requisição).

A query na constante `q` possui a expressão `?` para receber os valores do livro atualizados que serão enviados no `body` da requisição. Cada `?` vai receber um valor diferente.

Com o método `query()` do banco de dados, o segundo parâmetro é uma lista com os dados que a requisição deve receber (`[...values, bookId]`). 

Esses dados são enviados em uma lista que é formada usando spread operator (...) para separar os dados da Array `values` e unir com o valor de `bookId`. 
```js
app.put("/books/:id", (req, res) => {
    const q = "UPDATE books SET `title` = ?, `description` = ?, `cover` = ?, `price` = ? WHERE id = ?";
    const values = [
        req.body.title,
        req.body.description,
        req.body.cover,
        req.body.price
    ]
    const bookId = req.params.id;

    db.query(q, [...values, bookId], (err, data) =>{
        if (err) return res.json(err)
        return res.json("Book has been updated")
    })
})

```

### Concluindo o Backend
A última função é o `listen()`. Ela já tinha sido declarada enquanto eu preparava o **backend**. Assim a API vai iniciar quando todos os middlewares e rotas estiverem declarados.

## Frontend
Essa etapa do projeto é desenvolvida na pasta `client` e inicia com a instalação das dependências **React**, **React Router** e **Axios**.

Nesse projeto eu usei a versão 6.30 do **React Router**, para manter compatível com o tutorial que segui. Esse framework serve para configurar rotas de um aplicativo **React**.
```terminal
npm install react-router-dom@6.30.1
```

O **Axios** é uma biblioteca para realizar requisições **HTTP** para  **APIs**.
```terminal
npm install axios
```

Na pasta `src` organizei a estrutura do frontend com algumas mudanças importantes para o desenvolvimento. Primeiro criei uma pasta `pages` e adicionei 3 arquivos, `Add.jsx`, `Books.jsx` e `Update.jsx`. Esses arquivos vão ser as páginas necessárias para realizar as ações do **CRUD**.

Em seguida criei um arquivo `style.css`. Como o foco desse projeto não é a estilização dos componentes, esse arquivo vai guardar todos os estilos do projeto.

No arquivo `App.js` importei as dependências e páginas que vão ser usadas.
```js
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Books from "./pages/Books";
import Add from "./pages/Add";
import Update from "./pages/Update";
import "./style.css"
```

### Implementando páginas
No `App.js`, dentro da `div` com classe `App` adicionei o elemento `BrowserRouter`. O elemento `Routes` recebe uma lista de rotas, definidas pelo elemento `Route`. 

Cada `Route` tem uma propriedade `path` para definir o endpoint daquela rota e uma propriedade `element` que vai receber um elemento **React** referente a página que vai ser carregada.

No `path` da página de update foi adicionado um parâmetro seguindo a mesma lógica dos endpoints da API: `/update/:id`

```jsx
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Books/>}/>
          <Route path="/add" element={<Add/>}/>
          <Route path="/update/:id" element={<Update/>}/>
        </Routes>
      </BrowserRouter>
    </div>
```

### Página de livros - Books.jsx
Fazendo a página `Books.jsx`, algumas dependências foram importadas. O objeto **React**, é responsável por transformar elementos **JSX** em elementos **HTML**. Nas versões recentes do **React** a importação não é obrigatória, mas eu fiz dessa forma por padrão quando iniciei cada arquivo **JSX**.
```jsx
import React from 'react'
```

#### Hooks da página Books.jsx
# O que são React Hooks
Uma aplicação **React** pode depender de dados dinâmicos, como aqueles fornecidos por uma **API**. Em versões mais antigas do **React**, **Class Components** dependiam métodos de **Lyfe Cycle** deixando o processo verboso e complexo. Com a introdução de **Functional Components** os **Hooks** lidam com o gerenciamento de estados e efeitos de forma simples e direta.
```jsx
import { useState, useEffect } from 'react'
```
## useState()
Essa página acessa a **API** para receber uma lista com todos os livros. Dentro do componente responsável por renderizar a página, comecei declarando uma constante de estado para armazenar as lista de livros e uma função para atualizar esse estado. O parâmetro passado para `useState()` define o valor inicial do estado, nesse caso um array vazia.
```jsx
function Books() {
    const [books, setBooks] = useState([]);
}
```

## useEffect()
Em seguida o **hook** `useEffect()` recebe dois parâmetros para lidar com a requisição da **API**. O primeiro é uma **arrow function**, dentro dela é declarada e chamada uma função assíncrona que acessa a **API**. Quando o resultado da promise for resolvido, a função `setBooks()` atualiza o estado com os livros recebidos. Caso a promise não seja resolvida, o erro é exibido no console.

A função é declarada porque precisa ser assíncrona e em seguida é chamada. 

O segundo parâmetro do `useEffect()` é um array com dependências, que define quando o efeito deve ser reexecutado. Sempre que um valor dentro do array sofrer mudança, o efeito é executado novamente. Nesse caso, o array vazio é usado para que o efeito seja executado apenas uma vez.
```jsx
 useEffect(() => {
        const fetchAllBooks = async () => {
            try{
                const res = await axios.get("http://localhost:8800/books");
                setBooks(res.data);
            }catch (err) {
                console.log(err)
            }
        };
        fetchAllBooks();
    }, [])
```

#### Axios e React Router
Para essa página acessar a **API** e buscar os livros, o **Axios** precisa ser importado. Essa é a página principal da aplicação. A partir dela, o usuário vai navegar para a página de adicionar livros ou para página de editar. O **React Router** tem o componente `Link` que foi importado para fazer a navegação entre páginas.
```jsx
import axios from 'axios';
import { Link } from 'react-router-dom';
```

#### Definindo a estrutura da página
A estrutura que vai ser renderizada pelo componente `Books.jsx`, vai mapear os dados no estado `books`. Iniciei uma `div` com um `h1`, representando o título da página, e um `article` que vai conter a lista de livros. Esse `article` tem a propriedade `className='books'` que vai ser usada mais a frente na estilização. Por último o elemento `button` vai ter o componente `Link` enviando para a página `Add.jsx`

Adicionar o `Link` dentro do `button` não é uma boa prática. Como os dois são elementos de controle isso não segue lógica. Eu fiz assim para evitar criar um estilo para o `Link` ter  a aparência do `button`.

```jsx
return (
	<div>
		<h1>Books</h1>
		<article className='books'>
		</article>
		<button><Link to='/add'>Add new book</Link></button>
	</div>
)
```

Dentro da `article`, usando o `.map()` do **React**, o estado `books` é iterado e uma `section` é criada para cada livro. No **React**, para elementos renderizados em iteração(repetição de uma lista), é importante que tenham a propriedade `key` recebendo o **id**.

Em cada `section` vai ter um grupo de elementos para mostrar os dados do livro. Se o livro tiver uma capa válida(que não seja vazia), a tag `img` vai ser renderizada com a propriedade `src` recebendo a capa. 
```jsx
{book.cover && <img src={book.cover} alt=''/>}
```

Em seguida uma `h2` com o título do livro, uma `p` com a descrição do livro, uma `span` com o preço e mais duas tags `button`, uma para deletar e outra para atualizar. 

O elemento `button` para deletar livro, vai ter a classe `delete` e o evento `onClick` recebe uma função `handleDelete(book.id)`. Essa função tem como parâmetro o **id** do livro sendo deletado.

Seguindo uma estrutura parecida, o botão para atualizar vai ter a classe `update`, mas dentro vai ter o componente `Link`. A propriedade `to` desse componente vai receber o endpoint que leva para a página `Update.jsx` e usa o `id` do livro como parâmetro.

```jsx
return (
	<div>
		<h1>Books</h1>
		<article className='books'>
			{books.map((book)=>(
				<section className='book' key={book.id}>
					{book.cover && <img src={book.cover} alt=''/>}
					<h2>{book.title}</h2>
					<p>{book.description}</p>
					<span>{book.price}</span>
					<button className='delete' onClick={() => handleDelete(book.id)}>Delete</button>
					<button className='update'><Link to={`/update/${book.id}`}>Update</Link></button>
				</section>  
			))}
		</article>

		<button><Link to='/add'>Add new book</Link></button>
	</div>
)
```

#### Construindo a função handleDelete()
Essa é uma função assíncrona que vai usar enviar uma requisição para a API deletar o livro com id que tiver sido selecionado. Iniciei declarando uma constante que recebe uma função assíncrona.

```jsx
const handleDelete = async (id) => {}
```

Essa função vai usar o **Axios** para realizar uma função **HTTP** Delete, que já tinha sido testada no **Backend**. Com a requisição feita com sucesso, o registro que foi deletado do banco de dados é removido do estado atual. Assim a página os elementos `section` são renderizados novamente e mostra os dados de forma atualizada. A vantagem é não precisar recarregar toda a página ou fazer mais uma requisição para o **Backend**

```jsx
try {
	const res = await axios.delete(`http://localhost:8800/books/`+id);
	setBooks( (prevBooks) => prevBooks.filter( (book) => book.id !== id));
} catch (err) {
	console.log(err);
}
```
### Página para adicionar livros - Add.jsx
#### Importando componentes
A página `Add.jsx` usa componentes parecidos com o da página anterior. Uma diferença é o **hook** `useNavigate`. Ele vai ser usado no lugar do `Link` e pode ser usado para aprimorar a experiência do usuário com um histórico de navegação entre as páginas. O ideal é que o `useNavigate` seja usado quando a navegação da página acontece como o efeito de outra ação.

```jsx
import axios from 'axios';
import React from 'react'
import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
```

#### Declarando a lógica 
Os dados preenchidos no formulário dessa página tem que ser enviados para a **API** usando um objeto. Esses dados vão estar em um estado declarado pelo `useState`. Nesse caso o parâmetro que define o valor inicial do estado é um objeto com as propriedades necessárias para criar o livro.

```jsx
  const [book, setBook] = useState({
    title:"",
    description:"",
    cover:"",
    price:null,
  })
```

Sempre que o usuário alterar um campo do formulário, o estado deve ser atualizado. A função `handleChange()` vai ser chamada sempre que um input do formulário for alterado. O parâmetro `e` é o evento do input que for alterado com o nome da propriedade e o valor. 

A função `setBook()` é chamada passando uma arrow function com o parâmetro `prev`, representando o estado anterior antes da atualização. Essa arrow function retorna um novo objeto para a função `setBook()`. 

A expressão começa com `{ ...prev,`, isso inicia o objeto (`{`) e copia todas as propriedades do objeto anterior (`...prev`). A parte da expressão depois da vírgula `[e.target.name]:e.target.value}` cria ou acessa a chave com o nome (`name`) que estava no evento e atribui o valor digitado (`e.target.value`). Então essa função atualiza o estado com um novo objeto, mantendo os campos anteriores e substituindo o compo alterado.

```jsx
const handleChange = (e) => {
	setBook( (prev) => ( {...prev, [e.target.name]:e.target.value} ) );
}
```

Em seguida a constante `navigate` recebe a função retornada pelo `useNavigate()` para fazer a navegação entre páginas quando o usuário clicar no botão para concluir o formulário.

Para isso a função assíncrona `handleClick(e)` é declarada, que será executado ao clicar no botão. `e.preventDefault()` evita comportamento padrão inesperado, como recarregar a página.

O **Axios** é envia uma requisição **HTTP Post** com os dados do estado `book`. Em seguida `navigate()` redireciona o usuário para a página `Books`. Caso aconteça algum erro, ele será exibido no console.

```jsx
const navigate = useNavigate();
const handleClick = async e =>{
	e.preventDefault();
	try {
		  await axios.post("http://localhost:8800/books", book);
		  navigate('/');
	} catch (error) {
		  console.log(error);
	}
}
```

#### Construindo a estrutura da página

A página renderizada inicia com um elemento `div` que possui a classe `form`. Dentro dele, há um título, um `input` para cada propriedade do objeto `book` e um `button`.

Cada `input` tem um `name` correspondente à propriedade do objeto `book` e o evento `onChange` recebe a função `handleChange`. Dessa forma, o `input` modificado vai ter seu valor adicionado no estado `book`.

O `button` vai ter a classe `formButton` e dispara `handleClick()` no evento `onClick`.

```jsx
return (
    <div className="form">
      <h1>Add a new Book</h1>
      <input type='text' placeholder='Title' onChange={handleChange} name='title'/>
      <input type='text' placeholder='Description' onChange={handleChange} name='description'/>
      <input type='text' placeholder='Cover' onChange={handleChange} name='cover'/>
      <input type='number' placeholder='Price' onChange={handleChange} name='price'/>
      <button className='formButton' onClick={handleClick}>Add new Book</button>
    </div>
  )
```

### Página atualizar livro - Update.jsx
Essa página é responsável por atualizar um livro e para isso é necessário identificar qual o livro está sendo modificado. Na página `Books.jsx` quando o usuário seleciona um livro para editar, a **URL** recebe o **id** do livro selecionado. Essa página precisa acessar essa URL para editar o livro que tenha sido escolhido pelo usuário.

O hook `useLocation` do **React Router** vai ser importado para acessar a **URL** da página.

```jsx
import { useLocation, useNavigate } from 'react-router-dom';
```

A **URL**, acessada pelo location, é separada pelo caractere `/` e o **id** é armazenado na constante `bookId`. Além disso a constante `navigate` também é declarada para ser usada mais tarde.

```jsx
  const location = useLocation();
  const navigate = useNavigate();
  const bookId = location.pathname.split('/')[2];
```

O estado `book` é declarado e atualizado com a mesma estrutura usada na página `Add.jsx`, garantindo consistência entre criação e atualização.

```jsx
  const [book, setBook] = useState({
    title:'',
    description:'',
    cover:'',
    price:null
  })

  const handleChange = (e) =>{
    setBook((prev) => ({...prev, [e.target.name]:e.target.value } ) );
  };

```

Quando o usuário confirmar a atualização do livro, similar ao processo de criação, `axios.put()` vai fazer a requisição à **API** e o `bookId` que é enviado como parâmetro na **URL**.

```jsx
  const handleClick = async e => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8800/books/${bookId}`, book)
      navigate('/');
    } catch (error) {
      console.log(error);      
    }
  };

  return (
    <div className='form'>
      <h1>Update the Book</h1>
      <input type='text' placeholder='Title' onChange={handleChange} name='title'/>
      <input type='text' placeholder='Description' onChange={handleChange} name='description'/>
      <input type='text' placeholder='Cover' onChange={handleChange} name='cover'/>
      <input type='number' placeholder='Price' onChange={handleChange} name='price'/>
      <button className='formButton' onClick={handleClick}>Update the Book</button>
    </div>
  )
}
```
