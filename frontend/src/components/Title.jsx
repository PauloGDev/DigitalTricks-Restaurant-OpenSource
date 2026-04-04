import React from 'react'

const Title = ({text1, text2, text3}) => {
  return (
    <div className='grid grid-rows-2 gap-2 justify-items-center text-center items-center mb-3'>
      <div className=''>
      <p className='text-[#1E1E1E] font-semibold lg:text-3xl text-xl'>{text1}</p>
      <p className='text-[#1E1E1E] font-semibold lg:text-lg text-base'>{text2}</p>
      <p className='text-[#1E1E1E] font-medium text-sm max-w-[75vw]'>{text3} </p>
      </div>
    </div>
    
  )
}

export default Title