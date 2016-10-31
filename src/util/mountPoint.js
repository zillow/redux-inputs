export const REDUX_MOUNT_POINT = '_reduxMountPoint';
export const DEFAULT_REDUX_MOUNT_POINT = 'inputs';

export function getReduxMountPoint(inputConfig) {
    return inputConfig[REDUX_MOUNT_POINT] || DEFAULT_REDUX_MOUNT_POINT;
}
