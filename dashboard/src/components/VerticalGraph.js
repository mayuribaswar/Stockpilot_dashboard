import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    title: {
      display: false,
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "#E5E7EB",
      },
    },

    x: {
      grid: {
        display: false,
      },
    },
  },
};

const defaultData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

  datasets: [
    {
      label: "Portfolio",

      data: [12000, 18000, 15000, 24000, 28000, 31430],

      backgroundColor: "#2563EB",

      borderRadius: 8,
    },
  ],
};

export function VerticalGraph({ data }) {
  return (
    <div style={{ height: "320px" }}>
      <Bar options={options} data={data || defaultData} />
    </div>
  );
}
