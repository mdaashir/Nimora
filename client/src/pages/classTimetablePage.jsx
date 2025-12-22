import React from 'react'
import { useLocation } from 'react-router-dom'

const ClassTimetable = () => {
  const location = useLocation()
  const rollNo = location.state?.rollNo || ''

  // Only show if roll number starts with 22pt (case insensitive)
  if (!rollNo.toLowerCase().startsWith('22pt')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">This page is only available for specific roll numbers.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Class Time Table</h1>
        
        <div className="flex justify-center">
          <img 
            src="/Schedule.png" 
            alt="Class Schedule" 
            className="max-w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              e.target.src = "/placeholder-schedule.png"
            }}
          />
        </div>
        
        <div className="mt-6 text-center text-gray-600">
          <p>This is your class schedule for the semester.</p>
        </div>
      </div>
    </div>
  )
}

export default ClassTimetable