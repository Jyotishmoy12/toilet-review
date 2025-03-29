import React from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './Pages/Home'
import Account from './Pages/Account'
import Admin from './Pages/Admin'
import ToiletDetailsPage from './Pages/ToiletDetailsPage'

const App = () => {
  return (
   <>
   <Router>
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/account" element={<Account />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/toilet/:id" element={<ToiletDetailsPage />} />
   </Routes>
   </Router>
   </>
  )
}

export default App