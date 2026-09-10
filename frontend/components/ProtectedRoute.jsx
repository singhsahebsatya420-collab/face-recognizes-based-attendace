import React from 'react';
import{Navigate}from'react-router-dom';
export default function ProtectedRoute({children,role}){const u=JSON.parse(localStorage.getItem('user')||'null');
if(!localStorage.getItem('token'))return <Navigate to="/login" replace/>;
if(role&&u?.role!==role)return <Navigate to={u?.role==='admin'?'/admin':'/student'} replace/>;
return children;}
