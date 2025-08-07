import React from 'react'

function Update() {
  const handleClick = () => {};
  const handleChange = () =>{};

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