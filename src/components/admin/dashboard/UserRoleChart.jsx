import React from "react";
import { Paper, Typography, Box, useTheme } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const UserRoleChart = ({ data, colors }) => {
  const theme = useTheme();

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
        User Role Distribution
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          height: "calc(100% - 40px)",
          width: "100%",
          overflow: "visible",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[3],
                border: "none",
              }}
              formatter={(value) => [`${value} users`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default UserRoleChart;
