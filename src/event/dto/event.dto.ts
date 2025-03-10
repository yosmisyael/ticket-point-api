export class CreateEventRequestDto {
  event: {
    title: string;
    description: string;
    organizer: {
      id: string;
      name: string;
    };
    dateTime: {
      type: 'single' | 'range';
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
    };
    format: {
      type: 'ONLINE' | 'ONSITE' | 'HYBRID';
      onsite?: {
        venueName: string;
        address: {
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
        coordinates: {
          latitude: number;
          longitude: number;
        };
        mapUrl?: string;
        venueNotes?: string;
      };
      online?: {
        platform: string;
        platformUrl: string;
      };
    };
    category: string;
    capacity: {
      total: number;
      onsite?: number;
      online?: number;
    };
    contact: {
      email: string;
      phone?: string;
      website?: string;
    };
    coverImage: string;
    additionalInfo?: {
      agenda?: {
        items: Array<{
          startTime: string;
          endTime: string;
          event: string;
        }>;
      };
      faq?: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
}