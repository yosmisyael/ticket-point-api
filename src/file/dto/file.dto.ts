export enum UploadContextType {
  USER_PROFILE = 'profile',
  EVENT_BANNER = 'event',
  TIER_ICON = 'tier',
  ORGANIZATION_LOGO = 'organization',
}

export class UplaodFileDto {
  type: UploadContextType;
  id: number;
  subType?: string;
}