export enum State {
    NotStarted = 0,
    Pending,
    Granted,
    Rejected,
}

export type NotificationState = {
    errorAlertMessage: string;
    infoModalMessage: string;
    isLoading: boolean;
};
