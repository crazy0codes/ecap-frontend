import { useEffect, useState } from "react";
import { useAuth } from './AuthContext'; // Import useAuth

export function Marks({ className }) {
    const { user, getAuthHeaders } = useAuth(); // Get user and getAuthHeaders from AuthContext
    const [marks, setMarks] = useState([]);
    const [semester, setSemester] = useState(1); // Default to semester 1
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMarks = async () => {
            if (!user || !user.rollNumber) {
                setError("User not logged in or roll number not available for marks fetch.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            try {
                // Use correct URL and GET request for Spring Boot backend
                const url = `http://20.244.28.21:8080/api/students/${user.rollNumber}/semester/${semester}/marks`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: getAuthHeaders(user.rollNumber, user.password)
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error("Authentication error. Please log in again.");
                    }
                    if (response.status === 204) { // No Content
                        setMarks([]);
                        return;
                    }
                    throw new Error("Failed to fetch marks: " + response.statusText);
                }
                const data = await response.json();
                setMarks(data);
            } catch (err) {
                console.error("Error fetching marks:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarks();
    }, [semester, user, getAuthHeaders]);

    return (
        <div className={className + " px-2 shadow-lg"}>
            <div className="header">
                <h2 className="font-bold text-xlg pb-2">
                    Semester{" "}
                    <select
                        value={semester}
                        onChange={(e) => setSemester(parseInt(e.target.value))} // Ensure semester is an integer
                        className="ml-2 px-2 py-1 border rounded-md"
                    >
                        {/* You might want to dynamically fetch available semesters from backend */}
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
                </h2>
            </div>
            {loading && (
                <div className="text-center py-4 text-gray-500">Loading marks...</div>
            )}
            {error && (
                <div className="text-center py-4 text-red-500">{error}</div>
            )}
            {!loading && !error && marks.length === 0 && (
                <div className="text-center py-4 text-gray-500">No marks found for this semester.</div>
            )}
            {!loading && !error && marks.length > 0 && (
                <table className="table-auto w-full text-center border border-gray-300 shadow-lg rounded-lg overflow-hidden text-sm">
                    <thead>
                        <tr className="bg-gray-900 text-white text-sm">
                            <th className="px-3 py-4">S.No</th>
                            <th className="px-3 py-4">Course Code</th>
                            <th className="px-3 py-4">Course Name</th>
                            <th className="px-3 py-4">Grade</th>
                            <th className="px-3 py-4">Marks Obtained</th> {/* Changed from Grade Points to Marks Obtained */}
                            <th className="px-3 py-4">Credits</th>
                        </tr>
                    </thead>
                    <tbody>
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
