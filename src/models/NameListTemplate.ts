export interface NameListTemplate {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  names: string[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // 关联用户ID，用于权限管理
}

export interface NameListTemplateInput {
  name: string;
  description?: string;
  category: string;
  names: string[];
}