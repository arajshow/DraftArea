import { useState } from 'react';
import './App.css';
import Draft from './Component/Draft';

function App() {

  const [draftArea, setDraftArea] = useState(null);
  const [customClass, setCustomClass] = useState("");

  const saveHandler = () => {
    // console.log("save");
    localStorage.setItem( "draft", JSON.stringify(draftArea))
    setCustomClass("text-white bg-blue-400");
    setTimeout( () =>{
      setCustomClass("")
    }, 1000)
  }


  return (
    <div className='w-screen bg-gray-200 '>
      <div className='relative w-full min-h-screen mb-5vh p-10 flex flex-col text-black pt-[32px]'>
        <div className='mx-auto h-[10%] flex pt-[10px] justify-around'>
          <p className='w-full pb-8 items-center '>
            Demo editor by Anand Raj
          </p>

          

          {/* button */}
          <button onClick={saveHandler} className={`absolute border-4 left-[90%] -translate-y-[25%] border-black rounded-md px-3 py-2 bg-gray-200 hover:scale-95 transition-all duration-200 shadow-[5px_5px_0px_0px_rgba(1,1,122)] ${customClass}`}>Save</button>

        </div>

        {/* text section */}
        <Draft  setDraftArea= {setDraftArea} className="p-[14px] h-[80vh] mt-1 border-4 border-blue-800" />

      </div>
    </div>
  );
}

export default App;
