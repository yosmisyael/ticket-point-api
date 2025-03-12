import { Ticket } from '@prisma/client';

export class BookingTicketRequestDto {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  position: string;
  phone: string;
  tierId: number;
}

export class BookingTicketResponseDto {
  message: string;
  bookingId: number;
}

export class GenerateTicketResponseDto {
  bookingId: number;
  message: string;
}

export class ValidateTicketRequestDto {
  credential: string;
}

export class AttendeeResponseDto {
  firstName: string;
  lastName: string;
  organization: string;
  position: string;
  email: string;
  phone: string;
  isCheckin?: boolean;
  checkinDate?: Date;
  tier?: {
    name: string;
  };
}

export class AttendancesResponseDto {
  message: string;
  attendances: AttendeeResponseDto[];
}
