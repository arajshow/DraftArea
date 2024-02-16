import { useState } from 'react';
import './App.css';
import Draft from './Component/Draft';

function App() {

  const [draftArea, setDraftArea] = useState(null);

  const saveHandler = async () => {
    try{
      localStorage.setItem( "draft", JSON.stringify(draftArea))

    }catch(error){
      console.log("error ", error);
    }
  }


  return (
    <div className='w-screen bg-gray-300'>
      <div className='relative w-11/12 min-h-screen  flex flex-col  text-black pt-[32px]'>
        <div className='mx-auto  flex pt-[10px] justify-around'>
          <p className='w-full items-center '>
            Demo editor by Anand Raj
          </p>

          {/* button */}
          <button onClick={saveHandler} className='absolute border-4 left-[90%] -translate-y-[25%] border-black rounded-md px-3 py-2 bg-gray-200'>Save</button>

        </div>

        {/* text section */}
        <div className='bg-white border-2 border-blue-800 h-[80vh] mt-[3%] ml-[5%]'>
          <Draft className="w-full" setDraftArea= {setDraftArea} />
        </div>

      </div>
    </div>
  );
}

export default App;
