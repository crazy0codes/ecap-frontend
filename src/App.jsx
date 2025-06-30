import './App.css'
import { AttendanceCircle } from './components/attendance'
import { TimeTable } from './components/timeTable'
import { Marks } from './components/marks'
import { Profile } from './components/profile'
import { SemesterSchedule } from './components/Semesterscheduel'

function App() {

  return (
    <div className='w-full lg:px-10 sm:p-0'>

      <div className=' grid lg:grid-cols-4 grid-rows-2 mt-10 gap-4 md:grid-cols-1 sm:grid-cols-1 '>
        {/* <div className=' w-full rounded shadow-lg' >
          <div className="flex items-center flex-col gap-4 p-5 bg-gray-50">
            <img
              className="rounded h-40 border-2 border-gray-300"
              src="https://www.shutterstock.com/image-vector/luffy-skull-vector-illustration-anime-260nw-2514318757.jpg"
              alt="Luffy Icon"
            />
            <div>
              <h3 className="font-semibold text-xl text-gray-800">Madhan</h3>
              <p className="text-sm text-gray-500">B.Tech - CSE</p>
            </div>
          </div>
          
        </div> */}
        <Profile className="border border-2 col-span-2 w-full rounded-[25px] shadow-xl" />
        <AttendanceCircle className=' rounded-[25px] shadow-xl' />
        <div className='w-full col-span-2 rounded-[25px] shadow-xl' >
          <TimeTable className="h-full" />
        </div>
        {/* <TimeTable className='shadow-xl w-full  col-span-2 rounded-[25px]' /> */}
        <div className='shadow-xl w-full overflow-none  col-span-2 rounded-[25px]' >
          <SemesterSchedule className="" />
        </div>

      </div>
      <div className=' grid lg:grid-cols-4 grid-rows-2 mt-4 gap-4 md:grid-cols-1 sm:grid-cols-1 sm:p-0 ms:m-0'>
        <Marks className='grid-auto row-span-2 col-span-2 w-full rounded-[25px]' />
        <div className='border border-2 w-full  col-span-2 rounded-[25px]'></div>
        <div className='border border-2 w-full  rounded-[25px]' ></div>
        <div className='border border-2 w-full  rounded-[25px]' ></div>
      </div>
    </div>
  )
}

export default App
