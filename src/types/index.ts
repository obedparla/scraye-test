export interface Viewing {
  id: string;
  startTime: Date;
  viewerName: string;
  propertyAddress: string;
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  viewingId?: string;
}
