import { useEffect, useState } from "react";
import { useAuth } from './AuthContext'; // Import useAuth

export function Profile({ className }) {
    const { user, getAuthHeaders } = useAuth(); // Get user and getAuthHeaders from AuthContext
    const [profileData, setProfileData] = useState({}); // Renamed from 'user' to 'profileData' to avoid conflict with auth context 'user'
    const [isEditing, setIsEditing] = useState(false);
    const [editProfileData, setEditProfileData] = useState({}); // Renamed from 'editUser'

    async function fetchUser() {
        if (!user || !user.rollNumber) {
            console.warn("No user logged in or roll number not available for profile fetch.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/students/${user.rollNumber}/profile`, {
                headers: getAuthHeaders(user.rollNumber, user.password) // Pass credentials for Basic Auth
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error("Authentication error fetching profile. Please log in again.");
                    // Optionally, force logout here if token is invalid
                    // logout();
                }
                throw new Error(`Failed to fetch profile: ${response.statusText}`);
            }
            const jsonData = await response.json();
            console.log("Fetched Profile Data:", jsonData);
            setProfileData(jsonData);
        } catch (err) {
            console.error("Error fetching user profile:", err);
            // Handle error, e.g., show a message to the user
        }
    }

    useEffect(() => {
        fetchUser();
    }, [user]); // Re-fetch when the user object from AuthContext changes (e.g., after login)

    function handleEditClick() {
        setEditProfileData(profileData);
        setIsEditing(true);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setEditProfileData(prev => ({ ...prev, [name]: value }));
    }

    async function handleSave() {
        if (!user || !user.rollNumber) {
            console.warn("Cannot save profile: No user logged in.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/students/${user.rollNumber}/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(user.rollNumber, user.password), // Pass credentials
                body: JSON.stringify(editProfileData),
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error("Authentication error saving profile. Please log in again.");
                    // logout();
                }
                throw new Error(`Failed to save profile: ${response.statusText}`);
            }
            const updatedData = await response.json();
            setProfileData(updatedData);
            setIsEditing(false);
            console.log("Profile updated successfully!");
        } catch (err) {
            console.error("Error saving user profile:", err);
            // Handle error, e.g., show a message to the user
        }
    }

    function renderInfo(label, value, name) {
        return isEditing ? (
            <div className="flex flex-col p-4">
                <span>{label}</span>
                <input
                    className="font-black font-medium border rounded px-2 py-1"
                    name={name}
                    value={editProfileData[name] || ""}
                    onChange={handleChange}
                />
            </div>
        ) : (
            <Info label={label} value={value} />
        );
    }

    return (
        <div className={`${className}  mx-auto`}>
            <div className="gap-4 p-5 min-w-50 flex shadow  rounded-lg border bg-card text-card-foreground shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200  items-center">
                <img
                    className="rounded-full h-24 w-24 object-cover border-2 border-gray-300"
                    src="https://placehold.co/96x96/ADD8E6/000000?text=Student" // Placeholder image
                    alt="Student Profile"
                />
                <div className="">
                    <h3 className="font-bold tracking-tighter text-3xl">{profileData.name || 'Loading...'}</h3>
                    <p className="text-sm font-semibold">B.Tech - CSE</p> {/* Assuming a default branch/degree */}
                </div>
            </div>

            <div className="mt-3 px-6 rounded-lg border border-gray-300 shadow py-4 text-gray-700  flex flex-col w-full  text-sm space-y-2">
                <p className="text-2xl tracking-tight  font-semibold">Personal Information</p>
                <div className="w-full grid grid-cols-2">
                    {/* Note: Section and Year are not directly in your backend StudentDetailsResponse DTO.
                        You might need to adjust your DTO or fetch this data from another source if needed.
                        For now, I'm keeping them as placeholders if they are expected by the UI. */}
                    {renderInfo("Section", "A", "section")} {/* Placeholder */}
                    {renderInfo("Year", "III", "year")}     {/* Placeholder */}
                    {renderInfo("Roll No", profileData.rollNumber, "rollNumber")}
                    {renderInfo("Mobile No", profileData.mobileno, "mobileno")}
                    {renderInfo("Email", profileData.email, "email")}
                    {renderInfo("Blood Group", profileData.bloodgroup, "bloodgroup")}
                    {renderInfo("Address", profileData.address, "address")} {/* Changed from Village to Address */}
                    {renderInfo("Father", profileData.fatherName, "fatherName")}
                    {renderInfo("Mother", profileData.motherName, "motherName")}
                </div>
                {isEditing ? (
                    <div className="flex space-x-2 ml-4">
                        <button
                            className="bg-green-400 font-semibold w-[60px] h-[30px] p-0 rounded-md"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                        <button
                            className="bg-gray-300 font-semibold w-[60px] h-[30px] p-0 rounded-md"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        className="bg-blue-400 ml-4 font-semibold w-[60px] h-[30px] p-0 rounded-md"
                        onClick={handleEditClick}
                    >
                        edit
                    </button>
                )}
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="flex flex-col p-4">
            <span className="">{label}</span>
            <span className="font-black font-medium">{value || 'N/A'}</span> {/* Display N/A if value is null/undefined */}
        </div>
    );
}
