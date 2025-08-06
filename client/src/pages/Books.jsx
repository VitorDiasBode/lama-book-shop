import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

function Books() {
    const {books, setBooks} = useState([]);

    useEffect(()=>{
        const fetchAllBooks = async ()=>{
            try{
                const res = await axios.get("http://localhost8800/books");
                console.log(res);
            }catch(err){
                console.log(err)
            }
        }
        fetchAllBooks();
    }, [])
    return (
        <div>Books</div>
    )
}

export default Books