import { useEffect, useState } from "react";

export function Marks({ className }) {
    const [marks, setMarks] = useState([]);
    const [semester, setSemester] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        fetch(`http://localhost:8080/api/students/22A81A0643/semester/${semester}/marks`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch marks");
                return res.json();
            })
            .then((data) => setMarks(data))
            .catch((err) => setError("Failed to load"))
            .finally(() => setLoading(false));
    }, [semester]);

    return (
        <div className={className + " px-2 shadow-lg"}>
            <div className="header">
                <h2 className="font-bold text-xlg pb-2">
                    Semester{" "}
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="ml-2 px-2 py-1"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </h2>
            </div>
            {loading && (
                <div className="text-center py-4 text-gray-500">Loading...</div>
            )}
            {error && (
                <div className="text-center py-4 text-red-500">{error}</div>
            )}
            {!loading && !error && (
                <table className="table-auto w-full text-center border border-gray-300 shadow-lg rounded-lg overflow-hidden text-sm">
                    <thead>
                        <tr className="bg-gray-900 text-white text-sm">
                            <th className="px-3 py-4">S.No</th>
                            <th className="px-3 py-4">Course Code</th>
                            <th className="px-3 py-4">Course Name</th>
                            <th className="px-3 py-4">Grade</th>
                            <th className="px-3 py-4">Grade Points</th>
                            <th className="px-3 py-4">Credits</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {marks.map((mark, index) => (
                            <tr key={index} className="border-t border-gray-300 hover:bg-gray-200">
                                <td className="px-3 py-4">{index + 1}</td>
                                <td className="px-3 py-4">{mark.courseCode}</td>
                                <td className="px-3 py-4">{mark.courseName}</td>
                                <td className="px-3 py-4">{mark.grade}</td>
                                <td className="px-3 py-4">{mark.marksObtained}</td>
                                <td className="px-3 py-4">{mark.credits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
