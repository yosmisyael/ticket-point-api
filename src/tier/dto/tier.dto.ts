export class CreateTierRequestDto {
  name: string;
  price?: number;
  capacity: number;
  remains?: number;
  currency: string;
  icon: string
  iconColor: string;
  format: string;
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
}

export class TierResponseDto {
  id: number;
  message: string;
}