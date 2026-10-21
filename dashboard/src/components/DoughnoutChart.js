import React from "react";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultData = {
  labels: [
    "Technology",
    "Banking",
    "Energy",
    "Others",
  ],

  datasets: [
    {
      data: [40, 25, 20, 15],

      backgroundColor: [
        "#2563EB",
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
      ],

      borderWidth: 0,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

export function DoughnutChart({ data }) {
  return (
    <div style={{ height: "320px" }}>
      <Doughnut data={data || defaultData} options={options} />
    </div>
  );
}
