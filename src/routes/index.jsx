import { Route, Routes } from "react-router-dom"
import { Profile } from "../components/profile"
import { Marks } from "../components/marks"
import { Layout } from "../layout"
import { TimeTable } from "../components/timeTable"
import { AttendanceCircle } from "../components/attendance"
import { SemesterSchedule } from "../components/semesterscheduel"
import { TeacherLayout } from '../layout/teacherLayout';
import { TeacherDashboardHome } from '../components/teacherDashboardHome';
import { ManageStudents } from '../components/manageStudents';
import { UploadMarks } from '../components/uploadMarks';
import { UploadTimeTable } from '../components/uploadTimeTable';
import { UploadExamSchedule } from '../components/uploadExamSchedule';


export const Navigation = () => (<Routes>
    
    <Route path="/" element={<Login />} />

    <Route path="/student" element={<Layout />}>
        <Route index element={<Profile />} />
        <Route path="semester" element={<Marks />} />
        <Route path="semesterSchedule" element={
            <>
                <h2 className="text-2xl font-medium tracking-tighter pb-4">Semester Schedule</h2>
                <SemesterSchedule />
            </>
        } />
        <Route path="course" element={<TimeTable />} />
        <Route path="attendance" element={<AttendanceCircle />} />
    </Route>

    <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherDashboardHome />} />
        <Route path="manage-students" element={<ManageStudents />} />
        <Route path="upload-marks" element={<UploadMarks />} />
        <Route path="upload-timetable" element={<UploadTimeTable />} />
        <Route path="upload-exam-schedule" element={<UploadExamSchedule />} />
        <Route path="logout-placeholder" element={<div className="p-8 text-center text-gray-600">Logged out successfully!</div>} />
    </Route>
</Routes>)