import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getStudentAttendance } from '../utils/attendanceService'
import { BarChart3, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const Attandance = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [error, setError] = useState('')
  const [customPercentage, setCustomPercentage] = useState(80)
  const [combinedData, setCombinedData] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
    overallPercentage: 0
  })

  // Prevent going back to login page when back button is clicked
  useEffect(() => {
    // Push a duplicate entry to the history stack
    window.history.pushState(null, document.title, window.location.href);
    
    // Handle the popstate event (when back button is clicked)
    const handlePopState = (event) => {
      // Push another entry to prevent going back
      window.history.pushState(null, document.title, window.location.href);
      
      // Show a message indicating they should use the logout button
      alert("Please use the logout button to return to the login page.");
    };
    
    // Add event listener for the popstate event
    window.addEventListener('popstate', handlePopState);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!rollNo || !password) {
        setError('Login credentials not found. Please log in again.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getStudentAttendance(rollNo, password)
        setAttendanceData(data)
        calculateCombinedData(data, customPercentage)
        calculateOverallStats(data)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to fetch attendance data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rollNo, password])

  const calculateOverallStats = (data) => {
    if (!data || data.length === 0) return

    const totalClasses = data.reduce((sum, course) => sum + parseInt(course[1]), 0)
    const presentClasses = data.reduce((sum, course) => sum + parseInt(course[4]), 0)
    const absentClasses = data.reduce((sum, course) => sum + parseInt(course[2]), 0)
    const overallPercentage = totalClasses > 0 
      ? Math.round((presentClasses / totalClasses) * 100) 
      : 0

    setAttendanceStats({
      totalClasses,
      presentClasses,
      absentClasses,
      overallPercentage
    })
  }

  const calculateCombinedData = (data, percentage) => {
    if (!data || data.length === 0) return

    const result = data.map(course => {
      const classesTotal = parseInt(course[1])
      const classesPresent = parseInt(course[4])
      const leaves = calculateIndividualLeaves(classesPresent, classesTotal, percentage)
      
      return {
        courseCode: course[0],
        totalClasses: course[1],
        present: course[4],
        absent: course[2],
        percentage: course[5],
        affordableLeaves: leaves
      }
    })

    setCombinedData(result)
  }

  const calculateIndividualLeaves = (classesPresent, classesTotal, maintenancePercentage) => {
    let affordableLeaves = 0
    let i = 1
    const MAX_ITERATIONS = 1000 // Safety limit to prevent infinite loops

    // Special case for 100% attendance target
    if (maintenancePercentage === 100) {
      // For 100% attendance, you can't miss any more classes if you're already at 100%
      if ((classesPresent / classesTotal) * 100 === 100) {
        // Calculate how many more classes you can miss while maintaining 100%
        // (Which is 0 if you've already missed any)
        return classesPresent === classesTotal ? 0 : 0;
      } else {
        // If not at 100%, you need to attend all remaining classes and any you've missed
        // (Which is impossible to achieve - so return negative of missed classes)
        return -(classesTotal - classesPresent);
      }
    }

    if ((classesPresent / classesTotal) * 100 < maintenancePercentage) {
      // Simulate attendance after attending i classes
      let iterations = 0
      while (((classesPresent + i) / (classesTotal + i)) * 100 <= maintenancePercentage && iterations < MAX_ITERATIONS) {
        affordableLeaves -= 1 // negative leaves mean unskippable classes
        i += 1
        iterations += 1
      }
      
      // If we hit the max iterations, just return a reasonable value
      if (iterations >= MAX_ITERATIONS) {
        return Math.floor(-MAX_ITERATIONS / 10);
      }
    } else {
      // Calculate how many classes can be skipped
      let iterations = 0
      while ((classesPresent / (classesTotal + i)) * 100 >= maintenancePercentage && iterations < MAX_ITERATIONS) {
        affordableLeaves += 1
        i += 1
        iterations += 1
      }
      
      // If we hit the max iterations, cap the result
      if (iterations >= MAX_ITERATIONS) {
        return Math.floor(MAX_ITERATIONS / 10);
      }
    }

    return affordableLeaves
  }

  const handlePercentageChange = (e) => {
    const newPercentage = parseInt(e.target.value)
    setCustomPercentage(newPercentage)
    calculateCombinedData(attendanceData, newPercentage)
  }
  
  const handleCourseClick = (course) => {
    setSelectedCourse(selectedCourse?.courseCode === course.courseCode ? null : course)
  }

  const handleLogout = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your attendance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Analytics Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Attendance Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:bg-blue-100 hover:scale-105">
            <div className="bg-blue-100 rounded-full p-3 mb-2 transition-colors duration-300 hover:bg-blue-200">
              <Calendar className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Total Classes</h3>
            <p className="text-3xl font-bold text-blue-700">{attendanceStats.totalClasses}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:bg-green-100 hover:scale-105">
            <div className="bg-green-100 rounded-full p-3 mb-2 transition-colors duration-300 hover:bg-green-200">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Present</h3>
            <p className="text-3xl font-bold text-green-700">{attendanceStats.presentClasses}</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:bg-red-100 hover:scale-105">
            <div className="bg-red-100 rounded-full p-3 mb-2 transition-colors duration-300 hover:bg-red-200">
              <XCircle className="h-6 w-6 text-red-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Absent</h3>
            <p className="text-3xl font-bold text-red-700">{attendanceStats.absentClasses}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center transition-all duration-300 hover:shadow-md hover:bg-purple-100 hover:scale-105">
            <div className="bg-purple-100 rounded-full p-3 mb-2 transition-colors duration-300 hover:bg-purple-200">
              <BarChart3 className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Overall %</h3>
            <p className={`text-3xl font-bold ${attendanceStats.overallPercentage < 75 ? 'text-red-600' : 'text-purple-700'}`}>
              {attendanceStats.overallPercentage}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Required Courses Section */}
      {combinedData.length > 0 && combinedData.some(course => course.affordableLeaves < 0) && (
        <div className="bg-red-50 rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-semibold text-red-700">Action Required Courses</h2>
          </div>
          
          <div className="rounded-lg border-2 border-red-200 shadow-md overflow-hidden overflow-x-auto mb-4">
            <div className="min-w-full">
              {/* Header Row - hidden on small screens, visible from md up */}
              <div className="hidden md:grid grid-cols-6 bg-red-100 divide-x divide-red-200 text-red-700 border-b-2 border-red-200">
                <div className="px-6 py-4 text-left text-sm font-semibold uppercase">Course</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Total Classes</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Present</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Absent</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Attendance %</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">
                  Classes To Attend
                </div>
              </div>
              
              {/* Data Rows with horizontal grid styling */}
              <div>
                {combinedData
                  .filter(course => course.affordableLeaves < 0)
                  .map((course, index) => {
                    // This is the last row
                    const isLastRow = index === combinedData.filter(c => c.affordableLeaves < 0).length - 1;
                    
                    // Is this course selected
                    const isSelected = selectedCourse?.courseCode === course.courseCode;
                    
                    return (
                      <div key={index}>
                        {/* Mobile view - vertical card layout */}
                        <div 
                          className="md:hidden block p-3 border-b border-gray-300 cursor-pointer"
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className={`rounded-lg p-4 ${parseInt(course.percentage) < 75 ? "bg-white" : "bg-white"} shadow-md 
                            ${course.affordableLeaves >= 0 ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}
                            ${isSelected ? 'ring-2 ring-blue-500' : ''} 
                            transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xl font-bold text-blue-700">{course.courseCode}</div>
                              {course.affordableLeaves < 0 ? (
                                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Action Needed
                                </div>
                              ) : (
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Good Standing
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 pb-3 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Current Attendance:</span>
                                <span className={`font-medium text-right ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"} text-lg`}>
                                  {course.percentage}%
                                </span>
                              </div>
                              <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`${parseInt(course.percentage) < 75 ? "bg-red-600" : "bg-green-600"} h-2.5 rounded-full`}
                                  style={{ width: `${course.percentage}%` }}>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs mt-1">
                                <span className="text-gray-500">0%</span>
                                <span className={`${parseInt(course.percentage) < 75 ? "text-red-600" : "text-gray-500"}`}>{customPercentage}%</span>
                                <span className="text-gray-500">100%</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div className="bg-blue-50 rounded-lg p-2 text-center">
                                <span className="text-xs text-gray-500 block">Total</span>
                                <span className="text-lg font-semibold text-blue-700">{course.totalClasses}</span>
                              </div>
                              
                              <div className="bg-green-50 rounded-lg p-2 text-center">
                                <span className="text-xs text-gray-500 block">Present</span>
                                <span className="text-lg font-semibold text-green-700">{course.present}</span>
                              </div>
                              
                              <div className="bg-red-50 rounded-lg p-2 text-center">
                                <span className="text-xs text-gray-500 block">Absent</span>
                                <span className="text-lg font-semibold text-red-700">{course.absent}</span>
                              </div>
                              
                              <div className={`${course.affordableLeaves >= 0 ? "bg-green-50" : "bg-red-50"} rounded-lg p-2 text-center`}>
                                <span className="text-xs text-gray-500 block">Leaves</span>
                                <span className={`text-lg font-semibold ${course.affordableLeaves >= 0 ? "text-green-700" : "text-red-700"}`}>
                                  {course.affordableLeaves}
                                </span>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className={`mt-4 p-3 ${course.affordableLeaves >= 0 ? "bg-green-50" : "bg-red-50"} rounded-lg border ${course.affordableLeaves >= 0 ? "border-green-100" : "border-red-100"}`}>
                                <h4 className={`font-medium ${course.affordableLeaves >= 0 ? "text-green-700" : "text-red-700"} mb-2 flex items-center`}>
                                  {course.affordableLeaves >= 0 ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" /> Attendance Status
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-4 w-4 mr-1" /> Attendance Warning
                                    </>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {course.affordableLeaves >= 0 
                                    ? <>You can afford to miss <span className="font-bold text-green-700">{course.affordableLeaves}</span> more class{course.affordableLeaves === 1 ? '' : 'es'} while maintaining {customPercentage}% attendance.</> 
                                    : <>You need to attend at least <span className="font-bold text-red-700">{Math.abs(course.affordableLeaves)}</span> more class{Math.abs(course.affordableLeaves) === 1 ? '' : 'es'} to reach {customPercentage}% attendance.</>
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop view - row layout */}
                        <div 
                          className={`hidden md:grid md:grid-cols-6 bg-red-50 
                            hover:bg-red-100 border-l-8 border-transparent
                            hover:border-l-8 hover:border-red-500 hover:shadow hover:shadow-red-100 divide-x divide-red-200
                            ${!isLastRow ? 'border-b border-red-200' : ''}
                            transition-all duration-200 ease-in-out cursor-pointer
                            ${isSelected ? 'ring-2 ring-red-500 ring-inset' : ''}`}
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className="px-6 py-5 text-base font-medium text-red-900">{course.courseCode}</div>
                          <div className="px-6 py-5 text-base text-center text-gray-600">{course.totalClasses}</div>
                          <div className="px-6 py-5 text-base text-center text-gray-600">{course.present}</div>
                          <div className="px-6 py-5 text-base text-center text-gray-600">{course.absent}</div>
                          <div className="px-6 py-5 text-base text-center font-medium text-red-600">
                            {course.percentage}%
                          </div>
                          <div className="px-6 py-5 text-base text-center font-medium text-red-600">
                            <span className="inline-flex items-center justify-center">
                              {Math.abs(course.affordableLeaves)}
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">urgent</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Details panel for desktop */}
                        {isSelected && (
                          <div className="hidden md:block bg-red-100 p-4 border-b border-red-200">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium text-red-700 mb-1">Action Required</h4>
                                <p className="text-sm text-gray-700">
                                  You need to attend at least {Math.abs(course.affordableLeaves)} more class{Math.abs(course.affordableLeaves) === 1 ? '' : 'es'} to reach {customPercentage}% attendance.
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-500">Current Status:</div>
                                <div className="font-medium text-red-600">
                                  Below Minimum Requirement
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {combinedData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center mb-6 space-y-3 md:space-y-0">
            <h2 className="text-2xl font-semibold text-blue-700">All Courses</h2>
            <div className="w-full md:w-auto md:ml-auto flex flex-col items-stretch md:items-end">
              <div className="flex items-center justify-between w-full">
                <label htmlFor="customPercentage" className="mr-3 text-sm font-medium text-gray-700">
                  Target Percentage: 
                </label>
                <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full min-w-[50px] text-center">
                  {customPercentage}%
                </span>
              </div>
              <div className="w-full md:w-64 mt-2 relative">
                <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
                  <div className="w-0.5 h-2 bg-gray-300"></div>
                  <div className="w-0.5 h-2 bg-gray-300"></div>
                  <div className="w-0.5 h-2 bg-gray-300"></div>
                  <div className="w-0.5 h-2 bg-gray-300"></div>
                  <div className="w-0.5 h-2 bg-gray-300"></div>
                  <div className="w-0.5 h-2 bg-gray-300"></div>
                </div>
                <input
                  type="range"
                  id="customPercentage"
                  min="50"
                  max="100"
                  step="1"
                  value={customPercentage}
                  onChange={handlePercentageChange}
                  className="w-full h-2 appearance-none rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>50%</span>
                  <span>60%</span>
                  <span>70%</span>
                  <span>80%</span>
                  <span>90%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border-2 border-gray-300 shadow-md overflow-hidden overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row - hidden on small screens, visible from md up */}
              <div className="hidden md:grid grid-cols-6 bg-blue-50 divide-x divide-gray-200 text-blue-700 border-b-2 border-blue-200">
                <div className="px-6 py-4 text-left text-sm font-semibold uppercase">Course</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Total Classes</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Present</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Absent</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Attendance %</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">
                  Affordable Leaves ({customPercentage}%)
                </div>
              </div>
              
              {/* Data Rows with horizontal grid styling */}
              <div>
                {combinedData.map((course, index) => {
                  // Determine color based on affordable leaves
                  const colorClass = course.affordableLeaves >= 0 
                    ? "hover:border-l-8 hover:border-blue-500 hover:shadow hover:shadow-blue-100" 
                    : "hover:border-l-8 hover:border-red-500 hover:shadow hover:shadow-red-100";
                  
                  // Determine background color based on index for zebra striping
                  const bgClass = index % 2 === 0 
                    ? (parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-white") 
                    : (parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-gray-50");
                  
                  // This is the last row
                  const isLastRow = index === combinedData.length - 1;
                  
                  // Is this course selected
                  const isSelected = selectedCourse?.courseCode === course.courseCode;
                  
                  return (
                    <div key={index}>
                      {/* Mobile view - vertical card layout */}
                      <div 
                        className="md:hidden block p-3 border-b border-gray-300 cursor-pointer"
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className={`rounded-lg p-4 ${parseInt(course.percentage) < 75 ? "bg-white" : "bg-white"} shadow-md 
                          ${course.affordableLeaves >= 0 ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}
                          ${isSelected ? 'ring-2 ring-blue-500' : ''} 
                          transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xl font-bold text-blue-700">{course.courseCode}</div>
                            {course.affordableLeaves < 0 ? (
                              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Action Needed
                              </div>
                            ) : (
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Good Standing
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 pb-3 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">Current Attendance:</span>
                              <span className={`font-medium text-right ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"} text-lg`}>
                                {course.percentage}%
                              </span>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`${parseInt(course.percentage) < 75 ? "bg-red-600" : "bg-green-600"} h-2.5 rounded-full`}
                                style={{ width: `${course.percentage}%` }}>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-500">0%</span>
                              <span className={`${parseInt(course.percentage) < 75 ? "text-red-600" : "text-gray-500"}`}>{customPercentage}%</span>
                              <span className="text-gray-500">100%</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <span className="text-xs text-gray-500 block">Total</span>
                              <span className="text-lg font-semibold text-blue-700">{course.totalClasses}</span>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-2 text-center">
                              <span className="text-xs text-gray-500 block">Present</span>
                              <span className="text-lg font-semibold text-green-700">{course.present}</span>
                            </div>
                            
                            <div className="bg-red-50 rounded-lg p-2 text-center">
                              <span className="text-xs text-gray-500 block">Absent</span>
                              <span className="text-lg font-semibold text-red-700">{course.absent}</span>
                            </div>
                            
                            <div className={`${course.affordableLeaves >= 0 ? "bg-green-50" : "bg-red-50"} rounded-lg p-2 text-center`}>
                              <span className="text-xs text-gray-500 block">Leaves</span>
                              <span className={`text-lg font-semibold ${course.affordableLeaves >= 0 ? "text-green-700" : "text-red-700"}`}>
                                {course.affordableLeaves}
                              </span>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className={`mt-4 p-3 ${course.affordableLeaves >= 0 ? "bg-green-50" : "bg-red-50"} rounded-lg border ${course.affordableLeaves >= 0 ? "border-green-100" : "border-red-100"}`}>
                              <h4 className={`font-medium ${course.affordableLeaves >= 0 ? "text-green-700" : "text-red-700"} mb-2 flex items-center`}>
                                {course.affordableLeaves >= 0 ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" /> Attendance Status
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-4 w-4 mr-1" /> Attendance Warning
                                  </>
                                )}
                              </h4>
                              <p className="text-sm text-gray-700">
                                {course.affordableLeaves >= 0 
                                  ? <>You can afford to miss <span className="font-bold text-green-700">{course.affordableLeaves}</span> more class{course.affordableLeaves === 1 ? '' : 'es'} while maintaining {customPercentage}% attendance.</> 
                                  : <>You need to attend at least <span className="font-bold text-red-700">{Math.abs(course.affordableLeaves)}</span> more class{Math.abs(course.affordableLeaves) === 1 ? '' : 'es'} to reach {customPercentage}% attendance.</>
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Desktop view - row layout */}
                      <div 
                        className={`hidden md:grid md:grid-cols-6 ${bgClass} 
                          hover:bg-blue-50 border-l-8 border-transparent
                          ${colorClass} divide-x divide-gray-200
                          ${!isLastRow ? 'border-b border-gray-300' : ''}
                          transition-all duration-200 ease-in-out cursor-pointer
                          ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className="px-6 py-5 text-base font-medium text-gray-900">{course.courseCode}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.totalClasses}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.present}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.absent}</div>
                        <div className={`px-6 py-5 text-base text-center font-medium ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"}`}>
                          {course.percentage}%
                        </div>
                        <div className={`px-6 py-5 text-base text-center font-medium ${course.affordableLeaves < 0 ? "text-red-600" : "text-green-600"}`}>
                          <span className="inline-flex items-center justify-center">
                            {course.affordableLeaves}
                            {course.affordableLeaves < 0 && 
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">attend</span>
                            }
                          </span>
                        </div>
                      </div>
                      
                      {/* Details panel for desktop */}
                      {isSelected && (
                        <div className="hidden md:block bg-blue-50 p-4 border-b border-gray-300">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-blue-700 mb-1">Attendance Recommendation</h4>
                              <p className="text-sm text-gray-700">
                                {course.affordableLeaves >= 0 
                                  ? `You can afford to miss ${course.affordableLeaves} more class${course.affordableLeaves === 1 ? '' : 'es'} while maintaining ${customPercentage}% attendance.` 
                                  : `You need to attend at least ${Math.abs(course.affordableLeaves)} more class${Math.abs(course.affordableLeaves) === 1 ? '' : 'es'} to reach ${customPercentage}% attendance.`
                                }
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-500">Current Status:</div>
                              <div className={`font-medium ${parseInt(course.percentage) < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                {parseInt(course.percentage) < 75 ? 'Below Minimum Requirement' : 'Meeting Attendance Requirements'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Attandance