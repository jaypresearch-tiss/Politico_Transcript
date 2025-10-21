export interface TimestampedSegment {
  startTime: number;
  endTime: number;
  english: string;
  hindi: string;
}

export type Transcription = TimestampedSegment[];
