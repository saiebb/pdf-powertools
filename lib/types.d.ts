// تعريفات TypeScript مشتركة للمشروع

declare global {
  interface Window {
    pdfjsLib: any;
  }
  
  interface ImportMeta {
    url: string;
    env: {
      DEV?: boolean;
      BASE_URL?: string;
      [key: string]: any;
    };
  }
}

export {};