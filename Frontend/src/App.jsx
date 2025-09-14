import React, { useState } from "react";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
 const [formData, setFormData] = useState({
    classrooms: 1,
    batches: 1,
    subjects: [],
    newSubject: "",
    department: "",
    semester: "",
    classesPerWeek: 5,
    maxLeaves: 0,
  });
  const [active, setActive] = useState("dashboard");


  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Management",
  ];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Random colors for subjects
  const getRandomColor = (subject) => {
    const colors = [
      "bg-red-200",
      "bg-green-200",
      "bg-blue-200",
      "bg-yellow-200",
      "bg-purple-200",
      "bg-pink-200",
      "bg-indigo-200",
    ];
    const index =
      subject.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubject = () => {
    if (formData.newSubject.trim() !== "") {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, formData.newSubject.trim()],
        newSubject: "",
      });
    }
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Add dummy subjects if none provided
      let dataToSend = { ...formData };
      if (!dataToSend.subjects || dataToSend.subjects.length === 0) {
        dataToSend.subjects = ["Math", "Science", "English", "History"];
      }

      // Send POST request to backend to generate timetables
      const response = await fetch('http://127.0.0.1:5001/api/schedule/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const { timetable_ids } = result;

      // Fetch each timetable by ID
      const fetchedTimetables = [];
      for (const id of timetable_ids) {
        const viewResponse = await fetch(`http://127.0.0.1:5001/api/schedule/view/${id}`);
        if (!viewResponse.ok) {
          throw new Error(`Failed to fetch timetable ${id}`);
        }
        const timetableData = await viewResponse.json();
        fetchedTimetables.push(timetableData);
      }

      setTimetables(fetchedTimetables);
    } catch (err) {
      console.error("Error in handleGenerate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    timetables.forEach((tt, idx) => {
      doc.text(`Batch ${tt.batch} - Timetable ${tt.alt}`, 10, 10 + idx * 80);
      autoTable(doc, {
        head: [["Mon", "Tue", "Wed", "Thu", "Fri"]],
        body: tt.data,
        startY: 15 + idx * 80,
      });
    });
    doc.save("timetables.pdf");
  };

  const downloadExcel = () => {
    const wb = utils.book_new();
    timetables.forEach((tt) => {
      const ws = utils.aoa_to_sheet([["Mon", "Tue", "Wed", "Thu", "Fri"], ...tt.data]);
      utils.book_append_sheet(wb, ws, `Batch${tt.batch}-Alt${tt.alt}`);
    });
    writeFile(wb, "timetables.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Smart Classroom & Timetable Scheduler
        </h1>
      </header>

      <div className="flex">
        {/* Sidebar */}
         <aside className="w-64 bg-white shadow-md p-6">
           <ul className="space-y-4">
            {["📊 Dashboard", "📅 Timetables", "🏫 Classes", "⚙️ Settings"].map(
             (item, idx) => {
               const key = item.split(" ")[1].toLowerCase(); // e.g., dashboard, timetables
              return (
              <li key={idx}>
               <button
              onClick={() => setActive(key)}
              className={`w-full text-left px-4 py-2 rounded-lg transition 
                ${
                  active === key
                    ? "bg-blue-200 text-blue-900 font-semibold"
                    : "hover:bg-gray-100"
                }`}
            >
              {item}
            </button>
          </li>
        );
      }
    )}
  </ul>
</aside>


        {/* Main Content */}
        <main className="flex-1 p-8">
          <h2 className="text-xl font-bold mb-6">Generate Timetable</h2>

          {/* Form */}
          <div className="grid grid-cols-2 gap-6 bg-white p-6 shadow rounded-lg">
            <div>
              <label className="block font-medium">Number of Classrooms</label>
              <input
                type="number"
                name="classrooms"
                min="1"
                value={formData.classrooms}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Number of Batches</label>
              <input
                type="number"
                name="batches"
                min="1"
                value={formData.batches}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Department</option>
                {departments.map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Semester</option>
                {semesters.map((sem, i) => (
                  <option key={i} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Classes/Week</label>
              <input
                type="number"
                name="classesPerWeek"
                min="1"
                max="40"
                value={formData.classesPerWeek}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="block font-medium">Max Leaves/Month</label>
              <input
                type="number"
                name="maxLeaves"
                min="0"
                max="31"
                value={formData.maxLeaves}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
            </div>

            {/* Subject Input */}
            <div className="col-span-2">
              <label className="block font-medium">Subjects</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="newSubject"
                  value={formData.newSubject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  className="border p-2 w-full rounded"
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {formData.subjects.map((subj, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded"
                  >
                    <span>{subj}</span>
                    <button
                      onClick={() => handleRemoveSubject(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg transition-transform transform hover:scale-105 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Timetable'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}

          {/* Download Buttons */}
          {timetables.length > 0 && (
            <div className="mt-4 space-x-4">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Download PDF
              </button>
              <button
                onClick={downloadExcel}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Download Excel
              </button>
            </div>
          )}

          {/* Timetables */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Optimized Timetables</h2>
            <div className="grid grid-cols-2 gap-6">
              {timetables.map((tt, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 shadow rounded-lg border"
                >
                  <h3 className="font-semibold mb-2">
                    Batch {tt.batch} - Timetable {tt.alt}
                  </h3>
                  <table className="w-full border-collapse border text-center">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Mon</th>
                        <th className="border px-2 py-1">Tue</th>
                        <th className="border px-2 py-1">Wed</th>
                        <th className="border px-2 py-1">Thu</th>
                        <th className="border px-2 py-1">Fri</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tt.data.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`border px-2 py-1 ${
                                cell ? getRandomColor(cell) : ""
                              }`}
                            >
                              {cell || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

