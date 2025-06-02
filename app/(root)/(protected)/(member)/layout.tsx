import React from 'react'

const MemberLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>{children}</div>
  )
}

export default MemberLayout