/** No-op stand-in for Nest UserRecentSearchService (tracking omitted). */
export class UserRecentSearchService {
  async trackRecentSearch(): Promise<void> {
    return;
  }
}

/** No-op stand-in for Nest EventEmitter2. */
export class NoopEventEmitter {
  emit(): void {
    return;
  }
}

/** No-op stand-in for StorageService (not used by our 5 APIs). */
export class NoopStorageService {
  async uploadFile(): Promise<void> {
    return;
  }
}

export class NoopWhatsappService {
  async sendOtp(): Promise<boolean> {
    return false;
  }
}

export class NoopPatientRecordFileRepository {
  async createPatientRecordFile(): Promise<null> {
    return null;
  }
}

export class NoopHttpService {
  post(): { toPromise: () => Promise<void> } {
    return { toPromise: async () => undefined };
  }
}
