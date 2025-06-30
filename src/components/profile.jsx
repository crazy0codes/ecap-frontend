import { useEffect, useState } from "react";


/* 
        s1_0.roll_number,
        s1_0.address,
        s1_0.bloodgroup,
        s1_0.branch_id,
        s1_0.email,
        s1_0.fathername,
        s1_0.mobileno,
        s1_0.mothername,
        s1_0.name,
        s1_0.regulation_id 

*/


/* 

   {
      "address": "456 New Street, Hyderabad, Telangana",
      "email": "malli.updated@gmail.com",
      "mobileno": "7788990011"
      // bloodgroup is omitted, so it won't be changed
    }

*/

export function Profile({ className }) {
    const [user, setUser] = useState({})

    async function fetchUser() {
        const data = await fetch('http://localhost:8080/api/students/22A81A0643/profile')
        const jsonData = await data.json()
        console.log(jsonData)
        setUser(jsonData);
    }

    useEffect(() => {
        fetchUser();
    }, [])

    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState({});

    function handleEditClick() {
        setEditUser(user);
        setIsEditing(true);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        console.log(name, value)
        setEditUser(prev => ({ ...prev, [name]: value }));
    }

    async function handleSave() {
        await fetch('http://localhost:8080/api/students/22A81A0643/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editUser),
        });
        setUser(editUser);
        setIsEditing(false);
    }

    function renderInfo(label, value, name) {
        return isEditing ? (
            <div className="flex flex-col p-4">
                <span>{label}</span>
                <input
                    className="font-black font-medium border rounded px-2 py-1"
                    name={name}
                    value={editUser[name] || ""}
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
                    src="https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F12%2Fgame-of-thrones-kit-harington-teases-jon-snow-spinoff-series-tw.jpg?w=1080&cbr=1&q=90&fit=max"
                    alt="Jon Snow"
                />
                <div className="">
                    <h3 className="font-bold tracking-tighter text-3xl">{user.name}</h3>
                    <p className="text-sm font-semibold">B.Tech - CSE</p>
                </div>
            </div>

            <div className="mt-3 px-6 rounded-lg border border-gray-300 shadow py-4 text-gray-700  flex flex-col w-full  text-sm space-y-2">
                <p className="text-2xl tracking-tight  font-semibold">Personal Information</p>
                <div className="w-full grid grid-cols-2">
                    {renderInfo("Section", user.section, "section")}
                    {renderInfo("Year", user.year, "year")}
                    {renderInfo("Roll No", user.rollNumber, "rollNumber")}
                    {renderInfo("Mobile No", user.mobileno, "mobileno")}
                    {renderInfo("Email", user.email, "email")}
                    {renderInfo("Blood Group", user.bloodgroup, "bloodgroup")}
                    {renderInfo("Village", user.address, "address")}
                    {renderInfo("Father", user.fatherName, "fatherName")}
                    {renderInfo("Mother", user.motherName, "motherName")}
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
            <span className="font-black font-medium">{value}</span>
        </div>
    );
}
