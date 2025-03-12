export class CreateOrganizationDto {
  name: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export class UpdateOrganizationDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export class OrganizationResponseDto {
  id: number;
  message: string;
}