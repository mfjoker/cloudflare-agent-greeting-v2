
export interface IUser {
    results: IResult[];
  }
  
export interface IImage {
    imageUri: string;
  }
  
export interface IResult {
    id: string;
    name: string;
  }
export interface IRolesAndPermissions {
    roles: IRoles[];
  }
  interface IRoles {
    name: string;
  }
export interface IGroups {
    id: string;
    name: string;
    username: string;
    selfUri: string;
  }

export interface IUserDetails {
    id: string;
    name: string;
    images: IImage[];
    email: string;
    presence: {
      presenceDefinition: {
        systemPresence: string;
      };
    };
    groups: IGroups[];
  }

  export interface IUserAuthorization { 
    "roles"?: Array<IDomainRole>;
    "unusedRoles"?: Array<IDomainRole>;
    "permissions"?: Array<string>;
    "permissionPolicies"?: Array<IResourcePermissionPolicy>;
}

export interface IUserEntityListing { 
  "entities"?: Array<IUser>;
  "pageSize"?: number;
  "pageNumber"?: number;
  "total"?: number;
  "firstUri"?: string;
  "selfUri"?: string;
  "lastUri"?: string;
  "nextUri"?: string;
  "previousUri"?: string;
  "pageCount"?: number;
}

export interface IDomainRole { 
    "id"?: string;
    "name"?: string;
}

export interface IResourceConditionNode { 
    "variableName"?: string;
    "conjunction"?: string;
    "operator"?: string;
    "operands"?: Array<IResourceConditionValue>;
    "terms"?: Array<IResourceConditionNode>;
}

export interface IResourceConditionValue { 
    "type"?: string;
    "value"?: string;
}

export interface IResourcePermissionPolicy { 
    "id"?: string;
    "domain"?: string;
    "entityName"?: string;
    "policyName"?: string;
    "policyDescription"?: string;
    "actionSetKey"?: string;
    "allowConditions"?: boolean;
    "resourceConditionNode"?: IResourceConditionNode;
    "namedResources"?: Array<string>;
    "resourceCondition"?: string;
    "actionSet"?: Array<string>;
}

export interface IPrompt { 
  "id"?: string;
  "name": string;
  "description"?: string;
  "resources"?: Array<IPromptAsset>;
  "selfUri"?: string;
}

export interface IPromptAsset { 
  "id"?: string;
  "name"?: string;
  "promptId"?: string;
  "language"?: string;
  "mediaUri"?: string;
  "ttsString"?: string;
  "text"?: string;
  "uploadStatus"?: string;
  "uploadUri"?: string;
  "languageDefault"?: boolean;
  "tags"?: { [key: string]: Array<string>; };
  "durationSeconds"?: number;
  "selfUri"?: string;
}

export interface IPromptAssetCreate { 
  "id"?: string;
  "name"?: string;
  "promptId"?: string;
  "language": string;
  "mediaUri"?: string;
  "ttsString"?: string;
  "text"?: string;
  "uploadStatus"?: string;
  "uploadUri"?: string;
  "languageDefault"?: boolean;
  "tags"?: { [key: string]: Array<string>; };
  "durationSeconds"?: number;
  "selfUri"?: string;
}

export interface IPromptAssetEntityListing { 
  "entities"?: Array<IPromptAsset>;
  "pageSize"?: number;
  "pageNumber"?: number;
  "total"?: number;
  "firstUri"?: string;
  "selfUri"?: string;
  "lastUri"?: string;
  "nextUri"?: string;
  "previousUri"?: string;
  "pageCount"?: number;
}

export interface IPromptEntityListing { 
  "entities"?: Array<IPrompt>;
  "pageSize"?: number;
  "pageNumber"?: number;
  "total"?: number;
  "firstUri"?: string;
  "selfUri"?: string;
  "lastUri"?: string;
  "nextUri"?: string;
  "previousUri"?: string;
  "pageCount"?: number;
}