export class BookTicketRequestDto {
  email: string;
  attendee: string;
  phone: string;
  tierId: number;
}

export class BookTicketResponseDto {
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