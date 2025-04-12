import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import studentData from './III-c_list.json'
import * as XLSX from 'xlsx'

function App() {
  const [students, _setStudents] = useState(studentData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Record<string, 'willing' | 'not-willing' | null>>({})
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [toast, setToast] = useState<{ show: boolean; student: string; status: 'willing' | 'not-willing' } | null>(null)
  
  // Format current date
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Track mouse position for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Set all students to willing by default
  useEffect(() => {
    const initialWillingness: Record<string, 'willing' | 'not-willing' | null> = {}
    students.forEach(student => {
      initialWillingness[student.REGNO] = 'willing'
    })
    setSelectedStudents(initialWillingness)
  }, [students])
  
  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleSelection = (regno: string, status: 'willing' | 'not-willing', name: string) => {
    setSelectedStudents(prev => ({
      ...prev,
      [regno]: status
    }))
    
    // Show toast notification
    setToast({
      show: true,
      student: name,
      status: status
    })
  }

  // Function to reset all students to willing status
  const resetAllToWilling = () => {
    const resetWillingness: Record<string, 'willing' | 'not-willing' | null> = {}
    students.forEach(student => {
      resetWillingness[student.REGNO] = 'willing'
    })
    setSelectedStudents(resetWillingness)
    
    // Show toast notification
    setToast({
      show: true,
      student: 'All students',
      status: 'willing'
    })
  }

  const filteredStudents = students.filter(student => 
    student.NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student["ROLL NO"].toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.REGNO.includes(searchQuery)
  )

  // Calculate summary data
  const willingStudents = students.filter(student => selectedStudents[student.REGNO] === 'willing')
  const notWillingStudents = students.filter(student => selectedStudents[student.REGNO] === 'not-willing')
  
  const willingCount = willingStudents.length
  const notWillingCount = notWillingStudents.length

  const copySummaryToClipboard = () => {
    const summaryText = `
PLACEMENT WILLINGNESS SUMMARY

${formattedDate}

Willing Count: ${willingCount}
Not Willing Count: ${notWillingCount}

WILLING STUDENTS:
${willingStudents.map(student => `${student["SI. NO"]}. ${student.NAME} (${student["ROLL NO"]})`).join('\n')}

NOT WILLING STUDENTS:
${notWillingStudents.map(student => `${student["SI. NO"]}. ${student.NAME} (${student["ROLL NO"]})`).join('\n')}
    `.trim()

    navigator.clipboard.writeText(summaryText)
    setCopiedToClipboard(true)
    setTimeout(() => setCopiedToClipboard(false), 2000)
  }

  const downloadExcel = () => {
    // Prepare data for Excel export
    const exportData = students.map(student => ({
      "SI. NO": student["SI. NO"],
      "REGNO": student.REGNO,
      "ROLL NO": student["ROLL NO"],
      "NAME": student.NAME,
      "STATUS": selectedStudents[student.REGNO] === 'willing' ? 'Willing' : 'Not Willing'
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'student_willingness.xlsx')
  }

  return (
    <div className="container">
      {/* Spotlight effect overlay */}
      <div 
        className="spotlight-effect"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.1), transparent 40%)`,
        }}
      />
      
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="toast-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="toast-content">
              <div className="toast-title">Status Updated</div>
              <div className="toast-message">
                {toast.student} is marked {toast.status === 'willing' ? 'Willing' : 'Not Willing'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Placement Willing List
      </motion.h1>
      
      <motion.p 
        className="subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Placement willing list for 2026 batch
      </motion.p>
      
      <motion.div
        className="refresh-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.button
          className="refresh-btn"
          onClick={resetAllToWilling}
          whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          Reset All to Willing
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="search-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search by name or roll number..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>
      
      <motion.div 
        className="student-list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        <table>
          <thead>
            <tr>
              <th>SI. NO</th>
              <th>REGNO</th>
              <th>ROLL NO</th>
              <th>NAME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredStudents.map((student, index) => (
                <motion.tr 
                  key={student.REGNO}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ 
                    backgroundColor: "#1e1e4b", 
                    x: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <td>{student["SI. NO"]}</td>
                  <td>{student.REGNO}</td>
                  <td>{student["ROLL NO"]}</td>
                  <td>{student.NAME}</td>
                  <td>
                    <div className="status-buttons">
                      <motion.button 
                        className={`willing-btn ${selectedStudents[student.REGNO] === 'willing' ? 'active' : ''}`}
                        onClick={() => handleSelection(student.REGNO, 'willing', student.NAME)}
                        whileTap={{ scale: 0.95 }}
                        whileHover={selectedStudents[student.REGNO] !== 'willing' ? { y: -3, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" } : {}}
                        animate={selectedStudents[student.REGNO] === 'willing' ? { boxShadow: "0 0 15px rgba(16, 185, 129, 0.7)" } : {}}
                      >
                        Willing
                      </motion.button>
                      <motion.button 
                        className={`not-willing-btn ${selectedStudents[student.REGNO] === 'not-willing' ? 'active' : ''}`}
                        onClick={() => handleSelection(student.REGNO, 'not-willing', student.NAME)}
                        whileTap={{ scale: 0.95 }}
                        whileHover={selectedStudents[student.REGNO] !== 'not-willing' ? { y: -3, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" } : {}}
                        animate={selectedStudents[student.REGNO] === 'not-willing' ? { boxShadow: "0 0 15px rgba(234, 88, 12, 0.7)" } : {}}
                      >
                        Not Willing
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
      
      <motion.div 
        className="summary-section" 
        ref={summaryRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Placement Willingness Summary
        </motion.h2>
        
        <motion.div
          className="summary-date"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {formattedDate}
        </motion.div>
        
        <div className="summary-counts">
          <motion.div 
            className="count-card willing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            whileHover={{ y: -8, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
          >
            <h3>Willing</h3>
            <motion.div 
              className="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              {willingCount}
            </motion.div>
          </motion.div>
          <motion.div 
            className="count-card not-willing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            whileHover={{ y: -8, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)" }}
          >
            <h3>Not Willing</h3>
            <motion.div 
              className="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              {notWillingCount}
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="summary-lists"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <div className="summary-list">
            <h3>Willing Students</h3>
            <div className="name-list">
              {willingStudents.map((student, index) => (
                <motion.div 
                  key={student.REGNO} 
                  className="name-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 2 + (index * 0.03) }}
                  whileHover={{ x: 5, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                >
                  {student.NAME} ({student["ROLL NO"]})
                </motion.div>
              ))}
            </div>
          </div>
          <div className="summary-list">
            <h3>Not Willing Students</h3>
            <div className="name-list">
              {notWillingStudents.map((student, index) => (
                <motion.div 
                  key={student.REGNO} 
                  className="name-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 2 + (index * 0.03) }}
                  whileHover={{ x: 5, backgroundColor: "rgba(234, 88, 12, 0.1)" }}
                >
                  {student.NAME} ({student["ROLL NO"]})
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="download-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        <motion.button 
          className="copy-btn" 
          onClick={copySummaryToClipboard}
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          animate={copiedToClipboard ? { scale: [1, 1.1, 1] } : {}}
        >
          {copiedToClipboard ? 'Copied!' : 'Copy Summary'}
        </motion.button>
        <motion.button 
          className="download-btn" 
          onClick={downloadExcel}
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Download Excel
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        <span>Developed by Santhosh</span>
        <motion.div 
          className="contact-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 2.5 }}
          whileHover={{ scale: 1.2, rotate: 5 }}
          onClick={() => window.location.href = "mailto:ksdsanthosh130@gmail.com?subject=Placement%20Tracker%20Inquiry&body="}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App
