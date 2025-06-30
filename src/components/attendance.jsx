export function AttendanceCircle({ percentage = 85 , className}) {
  // const strokeColor = percentage >= 75 ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} >
      <div className="relative w-32 h-32 rounded-full bg-gray-200">
        
        <div
          className="absolute top-0 left-0 w-full h-full rounded-full shadow-lg"
          style={{
            background: `conic-gradient(#3b82f6 ${percentage * 3.6}deg, #e5e7eb 0deg)`,
          }}
        ></div>

        
        <div className="absolute top-2 left-2 w-28 h-28 rounded-full bg-white flex items-center justify-center text-xl font-bold">
          {percentage}%
        </div>
      </div>

      {/* Bottom label */}
      <p className="mt-2 text-center text-sm font-medium text-gray-700">Attendance</p>
    </div>
  );
}
