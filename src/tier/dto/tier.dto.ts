export class CreateTierRequestDto {
  name: string;
  capacity: number;
  currency: string;
  icon: string
  iconColor: string;
  format: string;
  benefits: string[];
  price?: number;
  remains?: number;
  eventId?: string;
}

export class UpdateTierRequestDto {
  name?: string;
  price?: number;
  capacity?: number;
  remains?: number;
  currency?: string;
  icon?: string
  format?: string;
  iconColor?: string;
  benefits?: string[];
}

export class TierResponseDto {
  id: number;
  message: string;
}