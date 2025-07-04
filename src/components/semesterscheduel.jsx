import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export function SemesterSchedule() {
    const [semesterSchedule, setSemesterSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {getAuthHeaders, user} = useAuth()

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch('http://localhost:8080/api/exams/schedule/V20/1/events', {
             headers: getAuthHeaders(user.rollNumber, user.password)
        })
            .then(res => {
                console.log(res)
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => setSemesterSchedule(data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []); 

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return <div className="text-center py-8">Loading semesterSchedule...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">{error}</div>;
    }

    return (
        <table className="table-auto w-full font-medium text-center border border-gray-300 shadow-lg rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-900 text-white">
                <tr>
                    <th className="px-4 py-7">S.No</th>
                    <th className="px-4 py-7">Start Date</th>
                    <th className="px-4 py-7">End Date</th>
                    <th className="px-4 py-7">Description</th>
                </tr>
            </thead>
            <tbody className="bg-gray-100 text-gray-800">
                {semesterSchedule.map((event, index) => (
                    <tr key={event.id} className="border-t border-gray-300 hover:bg-gray-200">
                        <td className="px-4 py-7">{index + 1}</td>
                        <td className="px-4 py-7">{formatDate(event.startDate)}</td>
                        <td className="px-4 py-7">{formatDate(event.endDate)}</td>
                        <td className="px-4 py-7">{event.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
