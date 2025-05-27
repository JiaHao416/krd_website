// services/index.ts
import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// 定義錯誤處理的類型
interface ApiError {
  message?: string;
  data?: any;
  status?: number;
}

// 設定請求頭 - 直接寫死 API Key
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization:
    "Bearer pat0ruS9AklJZMZMA.a33d42da398c69bb9cca2b4ac46ff6072ec0cf6ae43bc734dcdab37f7f09f635",
};

// 創建 axios 實例
const instance: AxiosInstance = axios.create({
  baseURL: "https://api.airtable.com",
  headers,
  timeout: 10000,
});

// 錯誤處理函數
const handleError = ({ message, data, status }: ApiError): Promise<never> => {
  return Promise.reject({ message, data, status });
};

// 響應攔截器
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const { response } = error;
    if (response) {
      return handleError({
        data: response.data,
        status: response.status,
        message: error.message,
      });
    }
    return handleError({ message: error.message });
  }
);

export { instance };

// services/AirTable.ts
import { instance as api } from "./index";

// 定義 AirTable 記錄的基本結構
interface AirTableField {
  [key: string]: any;
}

interface AirTableRecord {
  id: string;
  fields: AirTableField;
  createdTime: string;
}

interface AirTableResponse {
  records: AirTableRecord[];
  offset?: string;
}

// 定義常用的欄位類型
export interface ProductField {
  img_url: string;
  product_name?: string;
  name?: string;
  description?: string;
  price?: string;
  [key: string]: any;
}

export interface NavigationField {
  title: string;
  path: string;
  [key: string]: any;
}

export interface LogoField {
  img: string;
  [key: string]: any;
}

export interface ServiceField {
  img_url: string;
  icon_name: string;
  [key: string]: any;
}

// 特定類型的記錄
export interface ProductRecord extends AirTableRecord {
  fields: ProductField;
}

export interface NavigationRecord extends AirTableRecord {
  fields: NavigationField;
}

export interface LogoRecord extends AirTableRecord {
  fields: LogoField;
}

export interface ServiceRecord extends AirTableRecord {
  fields: ServiceField;
}

// 直接寫死 BASE_ID
const BASE_ID = "appXM676mFCoRKKBF";

/**
 * 從 AirTable 獲取資料
 * @param tableName - 資料表名稱
 * @param viewName - 視圖名稱
 * @returns Promise<AirTableRecord[]>
 */
async function airTable(
  tableName: string,
  viewName: string = "data"
): Promise<AirTableRecord[]> {
  try {
    const apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${tableName}?view=${encodeURIComponent(
      viewName
    )}`;

    const response = await api.get<AirTableResponse>(apiUrl);

    if (response.data && response.data.records) {
      return response.data.records;
    }

    console.warn(`No records found for table: ${tableName}, view: ${viewName}`);
    return [];
  } catch (error: any) {
    console.error(`Error fetching data from Airtable (${tableName}):`, {
      tableName,
      viewName,
      error: error.message || error,
      status: error.status,
    });

    // 返回空陣列而不是錯誤，讓 UI 可以正常顯示空狀態
    return [];
  }
}

/**
 * 專門用於獲取產品資料的函數
 */
export async function getProducts(tableName: string): Promise<ProductRecord[]> {
  const records = await airTable(tableName, "data");
  return records.filter((record) => record.fields?.img_url) as ProductRecord[];
}

/**
 * 獲取導航資料
 */
export async function getNavigation(): Promise<NavigationRecord[]> {
  const records = await airTable("navigation", "data");
  return records.filter(
    (record) => record.fields?.title && record.fields?.path
  ) as NavigationRecord[];
}

/**
 * 獲取 Logo 資料
 */
export async function getLogo(): Promise<LogoRecord[]> {
  const records = await airTable("logo", "data");
  return records.filter((record) => record.fields?.img) as LogoRecord[];
}

/**
 * 獲取服務項目資料
 */
export async function getServices(): Promise<ServiceRecord[]> {
  const records = await airTable("abouts", "data");
  return records.filter(
    (record) => record.fields?.img_url && record.fields?.icon_name
  ) as ServiceRecord[];
}

export { airTable };
