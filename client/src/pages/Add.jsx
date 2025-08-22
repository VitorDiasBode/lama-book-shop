import axios from 'axios';
import React from 'react'
import {useState} from 'react'
import { useNavigate } from 'react-router-dom';

function Add() {
  const [book, setBook] = useState({
    title:"",
    description:"",
    cover:"",
    price:null,
  })

  const handleChange = (e) => {
    setBook( (prev) => ( {...prev, [e.target.name]:e.target.value} ) );
  }
  
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
}

export default Add