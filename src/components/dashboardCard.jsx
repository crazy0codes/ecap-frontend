import React from 'react';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, description, link }) => (
    <Link to={"/teacher"+link} className="block bg-blue-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
        <h3 className="text-xl font-semibold text-blue-800 mb-2">{title}</h3>
        <p className="text-gray-700 text-sm">{description}</p>
    </Link>
);

export default DashboardCard;

