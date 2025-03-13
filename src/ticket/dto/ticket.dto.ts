export class BookingTicketRequestDto {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  position: string;
  phone: string;
  tierId: number;
  orderId: string;
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
  transactionTime?: Date;
  checkinDate?: Date;
  tier?: {
    name: string;
  };
}

export class AttendancesResponseDto {
  message: string;
  attendances: AttendeeResponseDto[];
}


export class PaymentValidationDto {
  order_id: string;
  payment_type: string;
  transaction_type: string;
  transaction_time: Date;
  transaction_status: string;
  fraud_status: string;
}