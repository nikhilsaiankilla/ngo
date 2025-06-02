import React from 'react'

const ProtectedLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div>
      {children}
    </div>
  )
}

export default ProtectedLayout