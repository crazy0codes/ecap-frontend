import { Link, Outlet } from "react-router-dom";

export function Layout() {
    return (
        <main className="grid grid-cols-5 min-h-screen font-sans">
            <aside className="col-span-1 bg-gray-900 text-white flex flex-col justify-between">
                <div className="p-6">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-2">
                            A
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">PANJA MADHAN</h2>
                            <p className="text-sm text-blue-100">22A81A0639</p>
                        </div>
                    </div>


                    <nav className="space-y-3 text-sm font-medium">
                        <Link to="/" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                            Bio Data
                        </Link>
                        <Link to="/semesterSchedule" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                          Semester Schedule
                        </Link>
                        <Link to="/semester" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                            Marks
                        </Link>
                        <Link to="/course" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                            Time Table
                        </Link>
                        <Link to="/attendance" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                            Attendance
                        </Link>
                        <Link to="/counselling" className="block hover:bg-blue-500 rounded-lg px-4 py-2">
                            Counselling
                        </Link>
                    </nav>
                </div>


                <div className="px-6 py-4 border-t border-blue-500 text-sm">
                    <Link
                        to="/logout"
                        className="block text-white hover:text-red-300 mb-2"
                    >
                        Logout
                    </Link>
                    <div className="text-xs text-center text-blue-200">
                        ECAP System
                        <br />
                        Student Management Portal
                    </div>
                </div>
            </aside>


            <section className="col-span-4 bg-gray-50 p-6">
                <Outlet />
            </section>
        </main>
    );
}
