import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TestResultsChartProps {
  trueCount: number;
  trueErrorCount: number;
  falseCount: number;
  falseErrorCount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="text-sm">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="text-foreground font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TestResultsChart({ trueCount, trueErrorCount, falseCount, falseErrorCount }: TestResultsChartProps) {
  const data = [
    {
      name: 'Serving False - Version A',
      'Success': falseCount - falseErrorCount,
      'Failure': falseErrorCount,
    },
    {
      name: 'Serving True - Version B',
      'Success': trueCount - trueErrorCount,
      'Failure': trueErrorCount,
    }
  ];

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--muted-foreground))" 
            opacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            content={<CustomTooltip />}
          />
          <Legend 
            wrapperStyle={{
              color: "hsl(var(--foreground))"
            }}
          />
          <Bar dataKey="Success" stackId="a" fill="#93c47d" />
          <Bar dataKey="Failure" stackId="a" fill="#8d1414" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
