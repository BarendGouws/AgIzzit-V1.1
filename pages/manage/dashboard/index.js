import React from 'react'
import dynamic from 'next/dynamic';
const Dashboards = dynamic(()=>import('@/components/manage/Dashboard'), { ssr: false })

const Dashboard = () => {
  return (<Dashboards/>)
}

Dashboard.layout = "ManageLayout"

export default Dashboard