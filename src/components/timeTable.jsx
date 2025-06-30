export function TimeTable({ className }) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const periods = [1, 2, 3, 4, "Break", 5, 6, 7];
    const timetable = [
        ["ML", "CN", "ACD", "C&NS", "—", "MCCP-II", "MCCP-II", "MCCP-II"],
        ["ACD", "C&NS", "CN", "PE&HV", "—", "ML", "ACD", "C&NS"],
        ["C&NS", "PE&HV", "ML", "CN", "—", "ML LAB", "ML LAB", "ML LAB"],
        ["C&NS", "ML", "UML LAB", "ACD", "—", "UML LAB", "UML LAB", "UML LAB"],
        ["ACD", "MCCP-II", "MCCP-II", "MCCP-II", "—", "ML", "CN", "LIBRARY"],
        ["CN", "CN LAB", "CN LAB", "CN LAB", "—", "ACD", "C&NS", "SPORTS"],
    ];

    return (
        <table className={`table-auto w-full text-center border border-gray-300 shadow-lg rounded-lg overflow-hidden text-sm ${className}`}>
            <thead className="bg-gray-900 text-white">
                <tr>
                    <th className="px-4 py-7">Day</th>
                    {periods.map((period, idx) => (
                        <th key={idx} className="px-4 py-7">{period}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-gray-100 text-gray-800">
                {days.map((day, i) => (
                    <tr key={day} className="border-t border-gray-300 hover:bg-gray-200">
                        <td className="px-4 py-4 font-semibold">{day}</td>
                        {timetable[i].map((subject, j) => (
                            <td key={j} className={`px-4 py-4 ${subject === "—" ? "text-gray-400" : ""}`}>{subject}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
