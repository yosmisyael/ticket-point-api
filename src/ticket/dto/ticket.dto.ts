export class BookTicketRequestDto {
  email: string;
  attendee: string;
  phone: string;
  tierId: number;
}

export class BookTicketResponseDto {
  message: string;
  bookId: number;
}

export class GenerateTicketResponseDto {
  message: string;
}

export class ValidateTicketRequestDto {
  credential: string;
}