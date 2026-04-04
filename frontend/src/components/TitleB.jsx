import React from 'react'

const TitleB = ({text1, text2, text3, link}) => {
  return (
    <div className='justify-around md:py-14 pt-14 flex grid-cols-2 lg:gap-32 gap-5 items-center mb-3 w-full'>
      <div className='place-self-start place-items-start lg:w-[60vw] md:w-[70vw] w-[57vw]'>
      <p className='text-gray-200 font-semibold lg:text-3xl md:text-xl text-sm'>{text1}</p>
      <p className='text-gray-400 font-medium md:text-base text-xs'>{text2} </p>
      </div>
      <a href={link} type="button" className="lg:w-[14vw] md:w-[20vw] w-[25vw] transition bg-amber-400 text-black hover:text-gray-400 hover:bg-gray-900 focus:outline-none font-medium rounded-full xl:text-sm text-xs xl:px-10 px-6 py-2.5 text-center me-2 mb-2">{text3}</a>
    </div>
    
  )
}

export default TitleB