import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Box, Heading, useBreakpointValue } from "@chakra-ui/react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MonthlyRevenueChart() {
  const data = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [
      {
        label: "Cơ Sở A",
        data: [10, 12, 14, 16, 20, 18, 15, 14, 16, 18, 20, 50],
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        pointBackgroundColor: "#FF6384",
        pointBorderColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
      },
      {
        label: "Cơ Sở B",
        data: [15, 16, 14, 18, 19, 22, 21, 20, 18, 21, 23, 24],
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        pointBackgroundColor: "#36A2EB",
        pointBorderColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
      },
      {
        label: "Cơ Sở C",
        data: [12, 14, 13, 15, 17, 19, 18, 17, 15, 16, 19, 21],
        borderColor: "#FFCE56",
        backgroundColor: "rgba(255, 206, 86, 0.3)",
        pointBackgroundColor: "#FFCE56",
        pointBorderColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: useBreakpointValue({ base: 12, md: 16 }),
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#333",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        borderColor: "#ddd",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "triệu VND",
          font: {
            size: useBreakpointValue({ base: 12, md: 16 }),
          },
          color: "#333",
        },
        ticks: {
          font: {
            size: useBreakpointValue({ base: 10, md: 14 }),
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Tháng",
          font: {
            size: useBreakpointValue({ base: 12, md: 16 }),
          },
          color: "#333",
        },
        ticks: {
          font: {
            size: useBreakpointValue({ base: 10, md: 14 }),
          },
        },
      },
    },
  };

  return (
    <Box>
      <Heading
        textColor={"blue.500"}
        as="h3"
        size="lg"
        mb={{ base: 4, md: 8 }}
        textAlign="center"
      >
        Thống Kê Doanh Thu
      </Heading>
      <Box h={{ base: "400px", md: "450px" }} w="100%">
        <Line data={data} options={options} />
      </Box>
    </Box>
  );
}

export default MonthlyRevenueChart;
