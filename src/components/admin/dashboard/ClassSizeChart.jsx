import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ClassSizeChart = ({ data, colors }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        height: { xs: 400, md: 450 },
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.09)",
        borderRadius: 3,
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "10%",
          height: "80%",
          width: "6px",
          borderRadius: "0 3px 3px 0",
          background: "linear-gradient(to bottom, #4CAF50, #2196F3)",
        },
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: "bold",
          pl: 1,
        }}
      >
        Classes by Size
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
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              height={50}
              tickMargin={10}
            />
            <YAxis
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              label={{
                value: "Students",
                angle: -90,
                position: "insideLeft",
                dy: 50,
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[3],
                border: "none",
              }}
              formatter={(value) => [`${value} students`]}
            />
            <Legend />
            <Bar
              name="Number of Students"
              dataKey="students"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              background={{ fill: "#f5f5f5", radius: [4, 4, 0, 0] }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ClassSizeChart;
