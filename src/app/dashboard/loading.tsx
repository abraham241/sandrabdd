import React from 'react';
import { HashLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className='flex justify-center items-center h-[10vh]'>
      <HashLoader color='black' size={25}/>
      <p>Chargement en cours...</p>
    </div>
  );
};

export default Loading;