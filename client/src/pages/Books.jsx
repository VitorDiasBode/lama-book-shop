import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom';

function Books() {
    const [books, setBooks] = useState([]);

    useEffect(()=>{
        const fetchAllBooks = async ()=>{
            try{
                const res = await axios.get("http://localhost:8800/books");
                setBooks(res.data);
            }catch(err){
                console.log(err)
            }
        }
        fetchAllBooks();
    }, [])

    const handleDelete = async (id) => {
        console.log("apertou o delete");
        try {
            const res = await axios.delete(`http://localhost:8800/books/`+id);
            window.location.reload();
        } catch (err) {
            console.log(err);
        }
    }

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
}

export default Books