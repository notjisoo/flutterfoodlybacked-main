const axios = require("axios");

const BASE_URL = "https://flutterfoodlybacked-main.vercel.app";

// 创建axios实例，设置超时和重试
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 添加重试拦截器
api.interceptors.response.use(null, async (error) => {
  const { config } = error;
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  config.retryCount = config.retryCount || 0;
  if (config.retryCount >= config.retry) {
    return Promise.reject(error);
  }
  config.retryCount += 1;
  return api(config);
});

async function testAPI() {
  try {
    // 测试健康检查端点
    console.log("测试健康检查...");
    const healthResponse = await api.get("/health", {
      retry: 3,
      retryDelay: 1000,
    });
    console.log("健康检查响应:", healthResponse.data);

    // 测试餐厅API
    console.log("\n测试餐厅API...");
    const restaurantResponse = await api.get("/api/restaurant", {
      retry: 3,
      retryDelay: 1000,
    });
    console.log("餐厅API响应:", restaurantResponse.data);

    // 测试分类API
    console.log("\n测试分类API...");
    const categoryResponse = await api.get("/api/category", {
      retry: 3,
      retryDelay: 1000,
    });
    console.log("分类API响应:", categoryResponse.data);
  } catch (error) {
    console.error("测试失败:", error.message);
    if (error.response) {
      console.error("错误状态码:", error.response.status);
      console.error("错误数据:", error.response.data);
      console.error("错误头信息:", error.response.headers);
    }
    if (error.request) {
      console.error("请求配置:", error.config);
    }
  }
}

// 添加延迟后执行
setTimeout(() => {
  console.log("开始测试API...");
  testAPI();
}, 1000);
