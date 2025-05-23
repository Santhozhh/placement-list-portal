import { useState, useEffect,  } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import studentData from './III-c_list.json'
import * as XLSX from 'xlsx'
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
function HOME() {
  const [students, _setStudents] = useState(studentData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Record<string, 'willing' | 'not-willing' | null>>({})
  const [ ,setCopiedToClipboard] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; student: string; status: 'willing' | 'not-willing' } | null>(null)
  
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Track mouse position for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const spotlightEffect = document.querySelector('.spotlight-effect') as HTMLElement;
      if (spotlightEffect) {
        spotlightEffect.style.setProperty('--mouse-x', `${e.clientX}px`);
        spotlightEffect.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Set all students to willing by default
  useEffect(() => {
    const initialWillingness: Record<string, 'willing' | 'not-willing' | null> = {}
    students.forEach(student => {
      initialWillingness[student.REGNO] = 'not-willing'
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
      resetWillingness[student.REGNO] = 'not-willing'
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

Selected Count: ${willingCount}
Not Selected  Count: ${notWillingCount}

SELECTED  STUDENTS:
${willingStudents.map(student => `${student["SI. NO"]}. ${student.NAME} (${student["ROLL NO"]})`).join('\n')}

NOT SELECTED STUDENTS STUDENTS:
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
      "STATUS": selectedStudents[student.REGNO] === 'willing' ? 'SELECTED' : 'NOT SELECTED'
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
    <div className="glitter-background">
      {/* Shimmering stars */}
      {[...Array(100)].map((_, i) => {
        const size = Math.random() * 2 + 1; // Random size between 1-3px
        const duration = 2 + Math.random() * 4; // Random duration between 2-6s
        const delay = Math.random() * 5; // Random delay between 0-5s
        const opacity = 0.1 + Math.random() * 0.7; // Random base opacity

        return (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              '--duration': `${duration}s`,
              animationDelay: `${delay}s`,
              filter: `blur(${size > 2 ? 1 : 0}px)`
            } as React.CSSProperties}
          />
        );
      })}

      {/* Light effects */}
      <div className="light-effect"></div>
      <div className="light-effect"></div>
      <div className="light-effect"></div>
      
      <div className="container">
        {/* Spotlight effect overlay */}
        <div className="spotlight-effect" />
        
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
          III-C SELECTED LIST 
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
            Reset All as Not-Selected
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
                          type="button"
                          whileHover={selectedStudents[student.REGNO] !== 'willing' ? { y: -3, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" } : {}}
                          animate={selectedStudents[student.REGNO] === 'willing' ? { boxShadow: "0 0 15px rgba(16, 185, 129, 0.7)" } : {}}
                        >
                          <FaThumbsUp style={{ marginRight: '8px' }} /> selected
                        </motion.button>
                        <motion.button
                          className={`not-willing-btn ${selectedStudents[student.REGNO] === 'not-willing' ? 'active' : ''}`}
                          onClick={() => handleSelection(student.REGNO, 'not-willing', student.NAME)}
                          type="button"
                          whileHover={selectedStudents[student.REGNO] !== 'not-willing' ? { y: -3, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" } : {}}
                          animate={selectedStudents[student.REGNO] === 'not-willing' ? { boxShadow: "0 0 15px rgba(234, 88, 12, 0.7)" } : {}}
                        >
                          <FaThumbsDown style={{ marginRight: '8px' }} /> Not Selected 
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            background: 'rgba(13, 17, 23, 0.7)',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(48, 54, 61, 0.5)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 style={{ 
                fontSize: '1.25rem',
                margin: 0,
                color: '#fff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={downloadExcel}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  onClick={copySummaryToClipboard}
                  style={{ cursor: 'pointer' }}
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>

                Summary Report
              </h2>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.8rem',
                  display: 'block',
                  marginTop: '0.25rem'
                }}
              >
                {formattedDate}
              </motion.span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              style={{
                display: 'flex',
                gap: '1rem'
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: '#10b981',
                  lineHeight: 1
                }}>{willingCount}</div>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '0.25rem'
                }}>Selected</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(147, 51, 234, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(147, 51, 234, 0.2)',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: '#9333EA',
                  lineHeight: 1
                }}>{notWillingCount}</div>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '0.25rem'
                }}>Not Selected</div>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            className="summary-lists"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              maxHeight: '300px',
              overflow: 'hidden'
            }}
          >
            <motion.div 
              className="summary-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              style={{ 
                background: 'rgba(13, 17, 23, 0.9)',
                borderRadius: '12px',
                padding: '1rem',
                height: '100%',
                overflow: 'hidden',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <h3 style={{ 
                fontSize: '0.9rem', 
                marginBottom: '1rem', 
                color: '#10b981',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Selected List
              </h3>
              <div className="name-list" style={{ 
                height: 'calc(100% - 2rem)',
                overflowY: 'auto',
                fontSize: '0.9rem'
              }}>
                {willingStudents.map((student, index) => (
                  <motion.div 
                    key={student.REGNO}
                    className="name-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 + index * 0.05 }}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid rgba(16, 185, 129, 0.15)'
                    }}
                    whileHover={{ 
                      background: 'rgba(16, 185, 129, 0.12)',
                      transform: 'translateX(5px)'
                    }}
                  >
                    <span style={{ 
                      color: '#fff',
                      fontWeight: 500
                    }}>{student["ROLL NO"]}</span>
                    <span style={{ 
                      fontWeight: 500,
                      color: '#10b981',
                      maxWidth: '60%',
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{student.NAME}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="summary-list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              style={{ 
                background: 'rgba(13, 17, 23, 0.9)',
                borderRadius: '12px',
                padding: '1rem',
                height: '100%',
                overflow: 'hidden',
                border: '1px solid rgba(147, 51, 234, 0.3)'
              }}
            >
              <h3 style={{ 
                fontSize: '0.9rem', 
                marginBottom: '1rem', 
                color: '#9333EA',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Not Selected List
              </h3>
              <div className="name-list" style={{ 
                height: 'calc(100% - 2rem)',
                overflowY: 'auto',
                fontSize: '0.9rem'
              }}>
                {notWillingStudents.map((student, index) => (
                  <motion.div 
                    key={student.REGNO}
                    className="name-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 + index * 0.05 }}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      background: 'rgba(147, 51, 234, 0.08)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid rgba(147, 51, 234, 0.15)'
                    }}
                    whileHover={{ 
                      background: 'rgba(147, 51, 234, 0.12)',
                      transform: 'translateX(5px)'
                    }}
                  >
                    <span style={{ 
                      color: '#fff',
                      fontWeight: 500
                    }}>{student["ROLL NO"]}</span>
                    <span style={{ 
                      fontWeight: 500,
                      color: '#9333EA',
                      maxWidth: '60%',
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{student.NAME}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="download-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          
          
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
    </div>
  )
}

export default HOME
