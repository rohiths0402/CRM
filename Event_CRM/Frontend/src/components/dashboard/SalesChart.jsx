import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { formatNumber } from "../../utils/format";
import { readThemeColors } from "../../utils/themeColors";

const SalesChart = ({ data }) => {
  const { theme } = useTheme();
  const colors = useMemo(() => readThemeColors(), [theme]);

  if (!data)
    return <div className="h-[26rem] animate-pulse rounded-3xl bg-card" />;

  const total = data.reduce((sum, point) => sum + point.tickets, 0);

  return (
    <div className="rounded-3xl border border-line bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Live ticket sales</h3>
          <p className="text-sm text-muted">Tickets sold per hour today</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-semibold">
            {formatNumber(total)}
          </p>
          <p className="text-xs text-muted">tickets today</p>
        </div>
      </div>

      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={colors.primary}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={colors.primary}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={colors.line}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={{ fill: colors.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: colors.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: colors.elevated,
                border: `1px solid ${colors.line}`,
                borderRadius: 12,
                color: colors.foreground,
              }}
              labelStyle={{ color: colors.muted }}
              itemStyle={{ color: colors.foreground }}
              cursor={{ stroke: colors.line }}
            />
            <Area
              type="monotone"
              dataKey="tickets"
              name="Tickets"
              stroke={colors.primary}
              strokeWidth={2.5}
              fill="url(#salesFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
