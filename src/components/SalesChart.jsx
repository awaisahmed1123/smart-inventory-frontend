import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

// BarElement ko register kiya hai
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// VVIP FIX: Theme ke colors ko JavaScript se read karne ke liye helper function
const getThemeColor = (variable) => {
    const hslValue = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return hslValue ? `hsl(${hslValue})` : '#888888'; // Fallback color
};

function SalesChart({ chartData }) {
    // State to hold dynamic theme colors
    const [themeColors, setThemeColors] = useState({
        primary: 'hsl(var(--p))',
        baseContent: 'hsl(var(--bc))',
        base300: 'hsl(var(--b3))'
    });
    
    // Component ke load hone par client side par hi colors fetch karein
    useEffect(() => {
        setThemeColors({
            primary: getThemeColor('--p'),
            baseContent: getThemeColor('--bc'),
            base300: getThemeColor('--b3')
        });
    }, []);


    const data = {
        labels: chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
        datasets: [
            {
                label: 'Sales',
                data: chartData.map(d => d.total),
                // VVIP FIX: State se dynamic color istemal karein
                backgroundColor: themeColors.primary,
                borderColor: themeColors.primary,
                borderRadius: 4,
                borderWidth: 1,
                barThickness: 20, // Bar ko thora patla kiya hai
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                intersect: false,
                mode: 'index',
                backgroundColor: 'hsl(var(--b1))',
                titleColor: 'hsl(var(--bc))',
                bodyColor: 'hsl(var(--bc))',
            },
        },
        scales: {
            x: {
                display: true,
                grid: { display: false },
                // VVIP FIX: State se dynamic color istemal karein
                ticks: { color: themeColors.baseContent }
            },
            y: {
                display: true,
                grid: { 
                    color: themeColors.base300,
                    borderDash: [2, 4],
                },
                // VVIP FIX: State se dynamic color istemal karein
                ticks: {
                    color: themeColors.baseContent,
                    callback: function(value) {
                        if (value >= 1000) return (value / 1000) + 'k';
                        return `Rs. ${value}`;
                    }
                }
            }
        }
    };

    return <Bar data={data} options={options} />;
}

export default SalesChart;