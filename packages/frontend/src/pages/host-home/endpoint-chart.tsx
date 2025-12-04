import { Echarts } from "@/components/echarts";
import { EmptyTip } from "@/components/empty-tip";
import { useGetProbeResultList } from "@/services/probe-result";
import { utcdayjsFormat } from "@/utils/dayjs";
import { FC } from "react";

interface EndpointChartProps {
  endpointId: string;
  refetchInterval: number;
}

const MAX_DATA_POINTS = 50;

export const EndpointChart: FC<EndpointChartProps> = (props) => {
  const { data: resultsData } = useGetProbeResultList({
    endPointId: props.endpointId,
    limit: MAX_DATA_POINTS,
    refetchInterval: props.refetchInterval,
  });

  const results = (resultsData?.data ?? [])
    .map((item) => ({
      ...item,
      time: utcdayjsFormat(item.createdAt, "MM-DD HH:mm:ss"),
      responseTime: item.responseTime,
      status: item.success ? "成功" : "失败",
    }))
    .reverse();

  // const [results, setResults] = useState(generateMockData());

  // const addNewData = () => {
  //   const now = new Date();
  //   const success = Math.random() > 0.1; // 90% 成功率
  //   const responseTime = success
  //     ? Math.floor(Math.random() * 500) + 50 // 成功时 50-550ms
  //     : Math.floor(Math.random() * 1000) + 500; // 失败时 500-1500ms

  //   const newData = {
  //     id: nanoid(),
  //     time: utcdayjs(now).format("MM-DD HH:mm:ss"),
  //     responseTime,
  //     status: success ? "成功" : "失败",
  //     createdAt: now.toISOString(),
  //     success,
  //   };

  //   results.push(newData);
  //   // for 循环 shift 数据
  //   while (results.length > MAX_DATA_POINTS) {
  //     results.shift();
  //   }
  //   setResults([...results]);
  // };

  if (results.length === 0) {
    return <EmptyTip className="pt-4" title="暂无探测数据" />;
  }

  // 计算最大响应时间，用于失败时的柱子高度
  const maxResponseTime = Math.max(...results.map((d) => d.responseTime));

  const options: echarts.EChartsOption = {
    animation: true,
    animationDuration: 800,
    animationEasing: "cubicOut" as const,
    animationDurationUpdate: 800,
    animationEasingUpdate: "cubicOut" as const,
    tooltip: {
      trigger: "axis" as const,
      axisPointer: {
        type: "shadow" as const,
      },
      formatter: (params: any) => {
        const item = params[0];
        const dataIndex = item.dataIndex;
        const originalData = results[dataIndex];
        return `
          <div style="padding: 4px 8px;">
            <div><strong>时间:</strong> ${originalData.time}</div>
            <div><strong>响应时间:</strong> ${originalData.responseTime || "-"}ms</div>
            <div><strong>状态:</strong> ${originalData.status}</div>
            ${originalData.message ? `<div><strong>信息:</strong> ${originalData.message}</div>` : ""}
          </div>
        `;
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: "category" as const,
      data: results.map((d) => d.createdAt),
      show: false,
      boundaryGap: true,
    },
    yAxis: {
      type: "value" as const,
      show: false,
    },
    series: [
      {
        type: "bar" as const,
        barMaxWidth: 48,
        data: results.map((d) => ({
          id: d.id,
          value: d.responseTime || maxResponseTime,
          itemStyle: {
            color: d.status === "成功" ? "#52c41a" : "#ff4d4f",
          },
        })),
      },
    ],
  };

  return <Echarts options={options} />;
};
