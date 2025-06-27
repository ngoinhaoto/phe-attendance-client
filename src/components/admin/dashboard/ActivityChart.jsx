import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActivityChart = ({ data, colors }) => {
  const theme = useTheme();

  // Format data to show year only when it changes
  const formattedData = data.map((item, index, array) => {
    // Add the year to the first item and when the year changes
    const showYear = index === 0 || item.year !== array[index - 1]?.year;
    return {
      ...item,
      index, // Store the original index
      displayDate: showYear ? `${item.date} ${item.year}` : item.date,
    };
  });

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Activity Overview
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          height: "calc(100% - 40px)",
          width: "100%",
          overflow: "visible",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="displayDate"
              tick={{
                fill: theme.palette.text.secondary,
                fontSize: 12,
              }}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{
                fill: theme.palette.text.secondary,
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[3],
                border: "none",
              }}
              formatter={(value, name, props) => {
                // Match on the dataKey rather than the name
                const label =
                  props.dataKey === "students" ? "Students" : "Check-ins";
                return [value, label];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  const item = payload[0].payload;
                  return `${item.date} ${item.year}`;
                }
                return label;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="students"
              name="Students"
              stroke={colors[2]}
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="attendance"
              name="Check-ins"
              stroke={colors[1]}
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ActivityChart;
