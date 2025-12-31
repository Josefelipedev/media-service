export enum EventType {
  USER_DELETED = 'user.deleted',
  MEDIA_UPLOADED = 'media.uploaded',
  MEDIA_DELETED = 'media.deleted',
  STORAGE_ERROR = 'storage.error',
  COMPLIANCE_AUDIT = 'compliance.audit',
}

export interface BaseEvent {
  eventId: string;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface UserDeletedEvent extends BaseEvent {
  type: EventType.USER_DELETED;
  payload: {
    userId: string;
    ownerType: 'user' | 'company';
    app: string;
    deletedBy: string;
    reason?: string;
  };
}

export interface MediaUploadedEvent extends BaseEvent {
  type: EventType.MEDIA_UPLOADED;
  payload: {
    mediaId: string;
    userId: string;
    fileSize: number;
    fileType: string;
    key: string;
    app: string;
  };
}

export type AppEvent = UserDeletedEvent | MediaUploadedEvent;
