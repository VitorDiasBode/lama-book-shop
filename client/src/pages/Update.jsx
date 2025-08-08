import axios from 'axios';
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

function Update() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookId = location.pathname.split('/')[2];

  const [book, setBook] = useState({
    title:'',
    description:'',
    cover:'',
    price:null
  })

  const handleChange = (e) =>{
    setBook((prev) => ({...prev, [e.target.name]:e.target.value } ) );
  };
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

export default Update